"""体験（シナリオ・結末・体験の記録）の表。

シナリオの画面と動き（仮想スマホ・仮想パソコンの中身）は static/sim/js/scenarios/*.js に書く。
ここには、Django の画面（一覧・開始・結果・みんなの結果）で使う説明と、体験の記録を置く。
新しいシナリオを足すときは、JS のファイルを足してから、管理画面でシナリオと結末を登録する。
"""
from django.conf import settings
from django.db import models


class Scenario(models.Model):
    slug = models.SlugField("ID", max_length=40, unique=True, help_text="シナリオの JS の id と同じにする（例：phishing）")
    number = models.CharField("番号", max_length=4, help_text="例：①")
    title = models.CharField("手口の名前", max_length=40, help_text="例：フィッシング")
    scene_title = models.CharField("場面の見出し", max_length=60, help_text="例：宅配の不在通知が届いたら")
    summary = models.CharField("場面の説明", max_length=160)
    entry = models.CharField("入口", max_length=80)
    learn = models.CharField("学べること", max_length=120)
    minutes = models.CharField("時間の目安", max_length=20, default="3〜5分")
    situation = models.TextField("これから起きること")
    mission = models.CharField("ミッション", max_length=80)
    devices = models.CharField("使うもの", max_length=160)
    photo = models.CharField("写真", max_length=80, help_text="static/sim/img/ の中のファイル名")
    script = models.CharField("シナリオの JS", max_length=120, help_text="static の中のパス（例：sim/js/scenarios/phishing.js）")
    order = models.PositiveSmallIntegerField("並び順", default=0)
    is_published = models.BooleanField("公開する", default=True)

    class Meta:
        verbose_name = "シナリオ"
        verbose_name_plural = "シナリオ"
        ordering = ["order", "id"]

    def __str__(self):
        return f"{self.number} {self.title}"


class Ending(models.Model):
    OK, NG, QUIT = "ok", "ng", "quit"
    KIND_CHOICES = [(OK, "見抜けた"), (NG, "だまされた"), (QUIT, "途中でやめた")]

    scenario = models.ForeignKey(Scenario, on_delete=models.CASCADE, related_name="endings", verbose_name="シナリオ")
    code = models.SlugField("結末のID", max_length=20, help_text="シナリオの JS の endings のキー（例：ok、ng1）")
    kind = models.CharField("種類", max_length=4, choices=KIND_CHOICES)
    title = models.CharField("見出し", max_length=80)
    short = models.CharField("ひとこと", max_length=200)
    after = models.TextField("その後", blank=True)

    class Meta:
        verbose_name = "結末"
        verbose_name_plural = "結末"
        constraints = [models.UniqueConstraint(fields=["scenario", "code"], name="uniq_ending_code")]
        ordering = ["scenario", "id"]

    def __str__(self):
        return f"{self.scenario.number} {self.title}"


class Play(models.Model):
    """1回の体験の記録。ログインしていない人は、ブラウザのセッションで持ち主を見分ける。"""

    scenario = models.ForeignKey(Scenario, on_delete=models.CASCADE, related_name="plays", verbose_name="シナリオ")
    ending = models.ForeignKey(Ending, on_delete=models.PROTECT, related_name="plays", verbose_name="結末")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="plays", verbose_name="会員")
    session_key = models.CharField("セッション", max_length=40, blank=True, db_index=True)
    check_count = models.PositiveSmallIntegerField("調べた回数", default=0)
    decide_count = models.PositiveSmallIntegerField("決めた回数", default=0)
    hint_count = models.PositiveSmallIntegerField("ヒントの回数", default=0)
    created_at = models.DateTimeField("体験した日時", auto_now_add=True)

    class Meta:
        verbose_name = "体験の記録"
        verbose_name_plural = "体験の記録"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.scenario} → {self.ending.title}"



class PlayStep(models.Model):
    """体験の中の行動（調べた・決めた・ヒント）。入力した文字は送らず、シナリオに書いた決まった文だけを残す。"""

    CHECK, DECIDE, HINT = "check", "decide", "hint"
    KIND_CHOICES = [(CHECK, "調べた"), (DECIDE, "決めた"), (HINT, "ヒント")]
    DEVICE_CHOICES = [("phone", "スマホ"), ("pc", "パソコン"), ("", "ー")]

    play = models.ForeignKey(Play, on_delete=models.CASCADE, related_name="steps", verbose_name="体験")
    order = models.PositiveSmallIntegerField("順番")
    kind = models.CharField("種類", max_length=6, choices=KIND_CHOICES)
    label = models.CharField("行動", max_length=120)
    device = models.CharField("デバイス", max_length=5, choices=DEVICE_CHOICES, blank=True)

    class Meta:
        verbose_name = "行動"
        verbose_name_plural = "行動"
        ordering = ["play", "order"]

    def __str__(self):
        return self.label
