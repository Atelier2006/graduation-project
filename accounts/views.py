from django.contrib import messages
from django.contrib.auth import login
from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect, render

from quiz.models import TestAttempt
from sim.models import Ending, Play
from sim.views import published

from .forms import ProfileForm, SignupForm
from .models import Profile


def signup(request):
    if request.user.is_authenticated:
        return redirect("accounts:mypage")
    form = SignupForm(request.POST or None)
    if request.method == "POST" and form.is_valid():
        user = form.save()
        login(request, user)
        messages.success(request, "会員登録しました。このブラウザでの今までの記録も、マイページに引き継ぎました。")
        return redirect("accounts:mypage")
    return render(request, "accounts/signup.html", {"form": form})


@login_required
def mypage(request):
    profile, _ = Profile.objects.get_or_create(user=request.user, defaults={"nickname": request.user.username[:20]})
    plays = Play.objects.filter(user=request.user).select_related("scenario", "ending")
    best = {}
    for p in plays.order_by("created_at"):
        cur = best.get(p.scenario_id)
        if cur is None or (p.ending.kind == Ending.OK and cur.ending.kind != Ending.OK) or p.ending.kind == cur.ending.kind:
            best[p.scenario_id] = p
    progress = [{"sc": sc, "play": best.get(sc.id)} for sc in published()]
    tests = TestAttempt.objects.filter(user=request.user)
    pre = tests.filter(phase=TestAttempt.PRE).first()
    post = tests.filter(phase=TestAttempt.POST).first()
    return render(request, "accounts/mypage.html", {
        "profile": profile, "plays": plays[:30], "progress": progress, "tests": tests[:10], "pre": pre, "post": post,
        "ok_count": sum(1 for r in progress if r["play"] and r["play"].ending.kind == Ending.OK),
    })


@login_required
def profile_edit(request):
    profile, _ = Profile.objects.get_or_create(user=request.user, defaults={"nickname": request.user.username[:20]})
    form = ProfileForm(request.POST or None, instance=profile)
    if request.method == "POST" and form.is_valid():
        form.save()
        messages.success(request, "会員の情報を変えました。")
        return redirect("accounts:mypage")
    return render(request, "accounts/profile_edit.html", {"form": form})
