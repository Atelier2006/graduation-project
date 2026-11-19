from django import forms

from .models import SurveyResponse


class SurveyForm(forms.ModelForm):
    class Meta:
        model = SurveyResponse
        fields = ("clarity", "tension", "usefulness", "again", "comment")
        widgets = {f: forms.RadioSelect for f in ("clarity", "tension", "usefulness", "again")} | {
            "comment": forms.Textarea(attrs={"rows": 4, "maxlength": 500, "class": "form-control",
                                             "placeholder": "よかったところ、分かりにくかったところなど（名前や連絡先は書かないでください）"}),
        }
        labels = {"clarity": "体験は分かりやすかったですか", "tension": "本物のような緊張感がありましたか",
                  "usefulness": "実際の生活で役に立ちそうですか", "again": "また使いたい・人にすすめたいですか", "comment": "感想（自由に）"}
