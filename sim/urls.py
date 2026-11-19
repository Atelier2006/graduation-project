from django.urls import path

from . import views

app_name = "sim"
urlpatterns = [
    path("", views.home, name="home"),
    path("scenarios/", views.mode, name="mode"),
    path("scenarios/<slug:slug>/", views.start, name="start"),
    path("scenarios/<slug:slug>/play/", views.play, name="play"),
    path("scenarios/<slug:slug>/explain/", views.explain, name="explain"),
    path("results/<int:play_id>/", views.result, name="result"),
    path("stats/", views.stats, name="stats"),
    path("help/", views.help_page, name="help"),
    path("api/plays/", views.api_play, name="api_play"),
]
