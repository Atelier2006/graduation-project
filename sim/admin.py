from django.contrib import admin

from .models import Ending, Play, PlayStep, Scenario


class EndingInline(admin.TabularInline):
    model = Ending
    extra = 0
    fields = ("code", "kind", "title", "short", "after")


@admin.register(Scenario)
class ScenarioAdmin(admin.ModelAdmin):
    list_display = ("number", "title", "scene_title", "order", "is_published")
    list_editable = ("order", "is_published")
    list_display_links = ("number", "title")
    prepopulated_fields = {}
    inlines = [EndingInline]
    fieldsets = (
        (None, {"fields": ("slug", "number", "title", "scene_title", "summary", "order", "is_published")}),
        ("開始画面に出す説明", {"fields": ("entry", "learn", "minutes", "situation", "mission", "devices", "photo")}),
        ("画面と動き", {"fields": ("script",), "description": "仮想スマホ・仮想パソコンの中身は JS のファイルに書く。新しいシナリオは、JS のファイルを足してから登録する。"}),
    )


class PlayStepInline(admin.TabularInline):
    model = PlayStep
    extra = 0
    readonly_fields = ("order", "kind", "label", "device")
    can_delete = False


@admin.register(Play)
class PlayAdmin(admin.ModelAdmin):
    list_display = ("created_at", "scenario", "ending", "user", "check_count", "decide_count", "hint_count")
    list_filter = ("scenario", "ending__kind")
    date_hierarchy = "created_at"
    readonly_fields = ("scenario", "ending", "user", "session_key", "check_count", "decide_count", "hint_count", "created_at")
    inlines = [PlayStepInline]

    def has_add_permission(self, request):
        return False
