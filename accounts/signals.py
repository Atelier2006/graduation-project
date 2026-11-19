"""ログインしたとき、ログインする前にこのブラウザでした体験とテストの記録を、その会員のものにする。"""
from django.contrib.auth.signals import user_logged_in
from django.dispatch import receiver

from quiz.models import SurveyResponse, TestAttempt
from sim.models import Play
from sim.owner import KEY


@receiver(user_logged_in)
def claim_anonymous_records(sender, request, user, **kwargs):
    token = request.session.get(KEY) if request is not None else None
    if not token:
        return
    for model in (Play, TestAttempt, SurveyResponse):
        model.objects.filter(user__isnull=True, session_key=token).update(user=user, session_key="")
