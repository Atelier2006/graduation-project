from django.contrib import admin

from .models import Answer, Choice, Question, SurveyResponse, TestAttempt


class ChoiceInline(admin.TabularInline):
    model = Choice
    extra = 0


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ("order", "text", "is_active")
    list_editable = ("is_active",)
    list_display_links = ("text",)
    inlines = [ChoiceInline]


class AnswerInline(admin.TabularInline):
    model = Answer
    extra = 0
    readonly_fields = ("question", "choice", "is_correct")
    can_delete = False


@admin.register(TestAttempt)
class TestAttemptAdmin(admin.ModelAdmin):
    list_display = ("created_at", "phase", "user", "score", "total")
    list_filter = ("phase",)
    readonly_fields = ("phase", "user", "session_key", "score", "total", "created_at")
    inlines = [AnswerInline]

    def has_add_permission(self, request):
        return False


@admin.register(SurveyResponse)
class SurveyResponseAdmin(admin.ModelAdmin):
    list_display = ("created_at", "clarity", "tension", "usefulness", "again", "user")
    readonly_fields = ("user", "session_key", "clarity", "tension", "usefulness", "again", "comment", "created_at")

    def has_add_permission(self, request):
        return False
