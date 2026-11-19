import json
from collections import Counter, defaultdict

from django.conf import settings
from django.db.models import Count
from django.http import Http404, JsonResponse
from django.shortcuts import get_object_or_404, render
from django.urls import reverse
from django.views.decorators.http import require_POST

from quiz.models import SurveyResponse, TestAttempt

from .models import Ending, Play, PlayStep, Scenario
from .owner import is_owner, owner_fields, owner_filter

# 相談先（本物の窓口。2026年11月19日に公式の情報で確かめた）
CONTACTS = [
    {"name": "警察相談専用電話", "tel": "#9110", "note": "緊急ではない警察への相談。受付時間は都道府県によって違う（平日 8:30〜17:15 が目安）。事件・事故で緊急のときは 110番"},
    {"name": "消費者ホットライン", "tel": "188", "note": "近くの消費生活センターなどにつながる。ネット通販のトラブルや、お金を払ってしまったときの相談"},
    {"name": "IPA 情報セキュリティ安心相談窓口", "tel": "03-5978-7509", "note": "偽の警告画面（サポート詐欺）やウイルスの相談。平日 10:00〜17:00（土日祝日・年末年始を除く）"},
]


def published():
    return Scenario.objects.filter(is_published=True)


def scenario_cards(request):
    """一覧のカード。前回の結果（この人の、いちばん新しい体験）も付ける。"""
    last = {}
    for play in Play.objects.filter(owner_filter(request)).select_related("ending").order_by("created_at"):
        last[play.scenario_id] = play
    return [{"sc": sc, "last": last.get(sc.id)} for sc in published()]


def home(request):
    return render(request, "sim/home.html", {"cards": scenario_cards(request)})


def mode(request):
    return render(request, "sim/mode.html", {"cards": scenario_cards(request)})


def start(request, slug):
    sc = get_object_or_404(published(), slug=slug)
    return render(request, "sim/start.html", {"sc": sc})


def play(request, slug):
    sc = get_object_or_404(published(), slug=slug)
    return render(request, "sim/play.html", {"sc": sc})


@require_POST
def api_play(request):
    """体験の終わりに、結末と行動の記録を受け取る。入力した文字は受け取らない（行動はシナリオに書いた決まった文だけ）。"""
    try:
        data = json.loads(request.body.decode("utf-8"))
        slug, code, log = str(data["scenario"]), str(data["ending"]), data.get("log", [])
        if not isinstance(log, list):
            raise ValueError
    except (ValueError, KeyError, TypeError, UnicodeDecodeError):
        return JsonResponse({"error": "送られてきた記録の形が正しくありません。"}, status=400)
    sc = published().filter(slug=slug).first()
    ending = Ending.objects.filter(scenario=sc, code=code).first() if sc else None
    if not ending:
        return JsonResponse({"error": "シナリオか結末が見つかりません。"}, status=400)

    steps = []
    for item in log[: settings.SIM_MAX_STEPS]:
        if not isinstance(item, dict):
            continue
        kind = item.get("kind")
        if kind not in (PlayStep.CHECK, PlayStep.DECIDE, PlayStep.HINT):
            continue
        dev = item.get("dev") if item.get("dev") in ("phone", "pc") else ""
        steps.append(PlayStep(order=len(steps) + 1, kind=kind, label=str(item.get("label", ""))[:120], device=dev))
    counts = Counter(s.kind for s in steps)
    p = Play.objects.create(
        scenario=sc, ending=ending, check_count=counts[PlayStep.CHECK], decide_count=counts[PlayStep.DECIDE],
        hint_count=counts[PlayStep.HINT], **owner_fields(request),
    )
    for s in steps:
        s.play = p
    PlayStep.objects.bulk_create(steps)
    return JsonResponse({"id": p.id, "result_url": reverse("sim:result", args=[p.id])}, status=201)


def result(request, play_id):
    p = get_object_or_404(Play.objects.select_related("scenario", "ending"), pk=play_id)
    if not is_owner(request, p):
        raise Http404
    return render(request, "sim/result.html", {"play": p, "sc": p.scenario, "steps": p.steps.all()})


def explain(request, slug):
    sc = get_object_or_404(published(), slug=slug)
    return render(request, "sim/explain.html", {"sc": sc, "contacts": CONTACTS})


def help_page(request):
    return render(request, "sim/help.html", {"contacts": CONTACTS})


def pct(n, total):
    return round(n * 100 / total) if total else 0


def stats(request):
    """みんなの結果（分析と共有）。名前は、ランキングに出すことを選んだ会員のニックネームだけを出す。"""
    rows = []
    for sc in published():
        plays = Play.objects.filter(scenario=sc)
        total = plays.count()
        by_kind = dict(plays.values_list("ending__kind").annotate(n=Count("id")).values_list("ending__kind", "n"))
        checked = plays.filter(check_count__gt=0)
        unchecked = plays.filter(check_count=0)
        # だまされた人が、最後に決めた行動（落とし穴になった選択）
        traps = Counter()
        for play_id, label in PlayStep.objects.filter(play__scenario=sc, play__ending__kind=Ending.NG, kind=PlayStep.DECIDE).order_by("play_id", "order").values_list("play_id", "label"):
            traps[play_id] = label
        rows.append({
            "sc": sc, "total": total,
            "ok": pct(by_kind.get(Ending.OK, 0), total), "ng": pct(by_kind.get(Ending.NG, 0), total), "quit": pct(by_kind.get(Ending.QUIT, 0), total),
            "checked_ok": pct(checked.filter(ending__kind=Ending.OK).count(), checked.count()), "checked_n": checked.count(),
            "unchecked_ok": pct(unchecked.filter(ending__kind=Ending.OK).count(), unchecked.count()), "unchecked_n": unchecked.count(),
            "traps": Counter(traps.values()).most_common(3),
        })

    tests = {}
    for phase, _ in TestAttempt.PHASE_CHOICES:
        qs = TestAttempt.objects.filter(phase=phase, total__gt=0)
        n = qs.count()
        rate = round(sum(a.score * 100 / a.total for a in qs) / n) if n else 0
        tests[phase] = {"n": n, "rate": rate}

    survey = SurveyResponse.objects.all()
    survey_n = survey.count()
    survey_avg = {}
    if survey_n:
        for f in ("clarity", "tension", "usefulness", "again"):
            survey_avg[f] = round(sum(getattr(s, f) for s in survey) / survey_n, 1)

    ranking = ranking_rows()
    return render(request, "sim/stats.html", {"rows": rows, "tests": tests, "survey_n": survey_n, "survey_avg": survey_avg, "ranking": ranking})


def ranking_rows(limit=10):
    """見抜けたシナリオの数（同じシナリオは1回と数える）と、体験の後のテストのいちばん良い点で並べる。"""
    ok_by_user = defaultdict(set)
    for user_id, scenario_id in Play.objects.filter(user__isnull=False, ending__kind=Ending.OK, user__profile__show_in_ranking=True).values_list("user_id", "scenario_id"):
        ok_by_user[user_id].add(scenario_id)
    best_post = defaultdict(int)
    for user_id, score in TestAttempt.objects.filter(user__isnull=False, phase=TestAttempt.POST).values_list("user_id", "score"):
        best_post[user_id] = max(best_post[user_id], score)
    from accounts.models import Profile

    names = dict(Profile.objects.filter(user_id__in=ok_by_user.keys(), show_in_ranking=True).values_list("user_id", "nickname"))
    rows = [{"name": names[u], "ok": len(s), "post": best_post.get(u)} for u, s in ok_by_user.items() if u in names]
    rows.sort(key=lambda r: (-r["ok"], -(r["post"] or 0), r["name"]))
    return rows[:limit]
