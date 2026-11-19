from django.contrib import admin

from .models import Profile


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ("nickname", "user", "age_group", "show_in_ranking")
    list_filter = ("age_group", "show_in_ranking")
    search_fields = ("nickname", "user__username")
