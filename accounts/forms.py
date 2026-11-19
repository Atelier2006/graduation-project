from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User

from .models import Profile


class SignupForm(UserCreationForm):
    nickname = forms.CharField(label="ニックネーム", max_length=20, help_text="みんなの結果のランキングに出る名前です。本名は使わないでください。")
    age_group = forms.ChoiceField(label="年代", choices=Profile.AGE_CHOICES, required=False, help_text="答えなくてもかまいません。")
    show_in_ranking = forms.BooleanField(label="ランキングにニックネームを出す", required=False, initial=True)

    class Meta(UserCreationForm.Meta):
        model = User
        fields = ("username",)
        labels = {"username": "ユーザー名"}
        help_texts = {"username": "半角の英数字と @ . + - _ で、150文字まで。ログインに使います。"}

    def save(self, commit=True):
        user = super().save(commit=commit)
        if commit:
            Profile.objects.create(user=user, nickname=self.cleaned_data["nickname"], age_group=self.cleaned_data["age_group"],
                                   show_in_ranking=self.cleaned_data["show_in_ranking"])
        return user


class ProfileForm(forms.ModelForm):
    class Meta:
        model = Profile
        fields = ("nickname", "age_group", "show_in_ranking")
