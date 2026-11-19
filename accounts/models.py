"""会員の情報。ユーザー名とパスワードは Django 標準の User（パスワードはソルト付きでハッシュ化して保存）。"""
from django.conf import settings
from django.db import models


class Profile(models.Model):
    AGE_CHOICES = [
        ("", "答えない"), ("10", "10代以下"), ("20", "20代"), ("30", "30代"), ("40", "40代"),
        ("50", "50代"), ("60", "60代"), ("70", "70代"), ("80", "80代以上"),
    ]

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="profile", verbose_name="会員")
    nickname = models.CharField("ニックネーム", max_length=20, help_text="みんなの結果のランキングに出る名前")
    age_group = models.CharField("年代", max_length=2, choices=AGE_CHOICES, blank=True)
    show_in_ranking = models.BooleanField("ランキングに名前を出す", default=True)

    class Meta:
        verbose_name = "会員の情報"
        verbose_name_plural = "会員の情報"

    def __str__(self):
        return self.nickname
