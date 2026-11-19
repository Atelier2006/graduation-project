import random

from django.contrib import messages
from django.db import transaction
from django.http import Http404
from django.shortcuts import get_object_or_404, redirect, render

from sim.owner import is_owner, owner_fields, owner_filter

from .forms import SurveyForm
from .models import Answer, Choice, Question, SurveyResponse, TestAttempt

PHASES = dict(TestAttempt.PHASE_CHOICES)


def latest(request, phase):
    return TestAttempt.objects.filter(owner_filter(request), phase=phase).first()


def index(request):
    return render(request, "quiz/index.html", {
        "pre": latest(request, TestAttempt.PRE), "post": latest(request, TestAttempt.POST),
        "count": Question.objects.filter(is_active=True).count(),
        "surveyed": SurveyResponse.objects.filter(owner_filter(request)).exists(),
    })


def shuffled(seed):
    """問題と選択肢の順番を入れ替える。同じ seed なら同じ順番（答えが足りなくて出し直すときに使う）。"""
    rng = random.Random(seed)
    questions = list(Question.objects.filter(is_active=True).prefetch_related("choices"))
    rng.shuffle(questions)
    for q in questions:
        q.shuffled = list(q.choices.all())
        rng.shuffle(q.shuffled)
    return questions


def take(request, phase):
    if phase not in PHASES:
        raise Http404
    if request.method == "POST":
        try:
            seed = int(request.POST.get("seed", ""))
        except ValueError:
            seed = random.randrange(1, 10**9)
    else:
        seed = random.randrange(1, 10**9)
    questions = shuffled(seed)
    picked, missing = {}, []
    if request.method == "POST":
        for q in questions:
            cid = request.POST.get(f"q{q.id}", "")
            choice = next((c for c in q.shuffled if str(c.id) == cid), None)
            if choice is None:
                missing.append(q.id)
            else:
                picked[q.id] = choice
        if not missing and questions:
            with transaction.atomic():
                score = sum(1 for c in picked.values() if c.is_correct)
                attempt = TestAttempt.objects.create(phase=phase, score=score, total=len(questions), **owner_fields(request))
                Answer.objects.bulk_create([Answer(attempt=attempt, question=q, choice=picked[q.id], is_correct=picked[q.id].is_correct) for q in questions])
            return redirect("quiz:attempt", attempt.id)
        messages.error(request, f"答えていない問題が{len(missing)}問あります。赤い枠の問題を選んでください。")
    return render(request, "quiz/take.html", {
        "phase": phase, "phase_label": PHASES[phase], "questions": questions, "seed": seed,
        "picked": {qid: c.id for qid, c in picked.items()}, "missing": missing,
    })


def attempt(request, pk):
    a = get_object_or_404(TestAttempt, pk=pk)
    if not is_owner(request, a):
        raise Http404
    answers = list(a.answers.select_related("question", "choice").order_by("question__order"))
    correct = {c.question_id: c for c in Choice.objects.filter(question__in=[x.question_id for x in answers], is_correct=True)}
    for x in answers:
        x.correct_choice = correct.get(x.question_id)
    other_phase = TestAttempt.PRE if a.phase == TestAttempt.POST else TestAttempt.POST
    other = TestAttempt.objects.filter(owner_filter(request), phase=other_phase).first()
    return render(request, "quiz/attempt.html", {
        "a": a, "answers": answers, "other": other,
        "pre": other if a.phase == TestAttempt.POST else a, "post": a if a.phase == TestAttempt.POST else other,
        "surveyed": SurveyResponse.objects.filter(owner_filter(request)).exists(),
    })


def survey(request):
    form = SurveyForm(request.POST or None)
    if request.method == "POST" and form.is_valid():
        s = form.save(commit=False)
        for k, v in owner_fields(request).items():
            setattr(s, k, v)
        s.save()
        return redirect("quiz:survey_thanks")
    return render(request, "quiz/survey.html", {"form": form})


def survey_thanks(request):
    return render(request, "quiz/survey_thanks.html")
