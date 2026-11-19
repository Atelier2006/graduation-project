from django.urls import path, re_path

from . import views

app_name = "quiz"
urlpatterns = [
    path("", views.index, name="index"),
    re_path(r"^(?P<phase>pre|post)/$", views.take, name="take"),
    path("results/<int:pk>/", views.attempt, name="attempt"),
    path("survey/", views.survey, name="survey"),
    path("survey/thanks/", views.survey_thanks, name="survey_thanks"),
]
