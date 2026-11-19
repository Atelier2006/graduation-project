"""体験の前後のテスト（同じ10問）と、体験後のアンケート。"""
from django.conf import settings
from django.db import models


class Question(models.Model):
    order = models.PositiveSmallIntegerField("番号")
    text = models.TextField("問題文")
    explanation = models.TextField("解説")
    is_active = models.BooleanField("使う", default=True)

    class Meta:
        verbose_name = "テストの問題"
        verbose_name_plural = "テストの問題"
        ordering = ["order"]

    def __str__(self):
        return f"問{self.order} {self.text[:30]}"


class Choice(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name="choices", verbose_name="問題")
    text = models.CharField("選択肢", max_length=200)
    is_correct = models.BooleanField("正解", default=False)
    order = models.PositiveSmallIntegerField("並び順", default=0)

    class Meta:
        verbose_name = "選択肢"
        verbose_name_plural = "選択肢"
        ordering = ["question", "order"]

    def __str__(self):
        return self.text


class TestAttempt(models.Model):
    PRE, POST = "pre", "post"
    PHASE_CHOICES = [(PRE, "体験の前"), (POST, "体験の後")]

    phase = models.CharField("いつ", max_length=4, choices=PHASE_CHOICES)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="test_attempts", verbose_name="会員")
    session_key = models.CharField("セッション", max_length=40, blank=True, db_index=True)
    score = models.PositiveSmallIntegerField("正解した数", default=0)
    total = models.PositiveSmallIntegerField("問題の数", default=0)
    created_at = models.DateTimeField("受けた日時", auto_now_add=True)

    class Meta:
        verbose_name = "テストの結果"
        verbose_name_plural = "テストの結果"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.get_phase_display()} {self.score}/{self.total}"

    @property
    def rate(self):
        return round(self.score * 100 / self.total) if self.total else 0


class Answer(models.Model):
    attempt = models.ForeignKey(TestAttempt, on_delete=models.CASCADE, related_name="answers", verbose_name="テスト")
    question = models.ForeignKey(Question, on_delete=models.CASCADE, verbose_name="問題")
    choice = models.ForeignKey(Choice, on_delete=models.CASCADE, verbose_name="選んだ選択肢")
    is_correct = models.BooleanField("正解", default=False)

    class Meta:
        verbose_name = "答え"
        verbose_name_plural = "答え"


class SurveyResponse(models.Model):
    SCALE = [(i, str(i)) for i in range(1, 6)]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="surveys", verbose_name="会員")
    session_key = models.CharField("セッション", max_length=40, blank=True)
    clarity = models.PositiveSmallIntegerField("分かりやすさ", choices=SCALE)
    tension = models.PositiveSmallIntegerField("緊張感", choices=SCALE)
    usefulness = models.PositiveSmallIntegerField("役に立ちそうか", choices=SCALE)
    again = models.PositiveSmallIntegerField("また使いたいか", choices=SCALE)
    comment = models.TextField("感想", blank=True, max_length=500)
    created_at = models.DateTimeField("答えた日時", auto_now_add=True)

    class Meta:
        verbose_name = "アンケート"
        verbose_name_plural = "アンケート"
        ordering = ["-created_at"]
