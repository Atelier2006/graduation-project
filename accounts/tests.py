import json

from django.contrib.auth.models import User
from django.test import TestCase
from django.urls import reverse

from quiz.models import TestAttempt
from sim.models import Play

PW = "Sagisim-2026-test"


class AccountTests(TestCase):
    def play(self, ending="ok"):
        return self.client.post(reverse("sim:api_play"), json.dumps({"scenario": "phishing", "ending": ending, "log": []}),
                                content_type="application/json").json()

    def test_signup_creates_profile_and_claims_records(self):
        first = self.play()
        self.client.post(reverse("quiz:take", args=["pre"]), {"seed": "1"})  # 答えなし → 保存されない
        res = self.client.post(reverse("accounts:signup"), {"username": "taro", "nickname": "たろう", "age_group": "20",
                                                             "show_in_ranking": "on", "password1": PW, "password2": PW})
        self.assertRedirects(res, reverse("accounts:mypage"))
        u = User.objects.get(username="taro")
        self.assertEqual((u.profile.nickname, u.profile.age_group, u.profile.show_in_ranking), ("たろう", "20", True))
        self.assertTrue(u.password.startswith("pbkdf2_sha256$"))
        p = Play.objects.get(pk=first["id"])
        self.assertEqual((p.user, p.session_key), (u, ""))
        self.assertEqual(self.client.get(first["result_url"]).status_code, 200)
        page = self.client.get(reverse("accounts:mypage"))
        self.assertEqual(page.context["ok_count"], 1)

    def test_login_claims_records_made_before_login(self):
        u = User.objects.create_user("hanako", password=PW)
        self.play(ending="ng1")
        res = self.client.post(reverse("accounts:login"), {"username": "hanako", "password": PW})
        self.assertRedirects(res, reverse("accounts:mypage"))
        self.assertEqual(Play.objects.filter(user=u).count(), 1)
        page = self.client.get(reverse("accounts:mypage"))
        self.assertEqual(page.status_code, 200)  # Profile がなくても作って開く
        self.assertTrue(u.__class__.objects.get(pk=u.pk).profile.nickname)

    def test_records_of_others_are_not_claimed(self):
        from django.test import Client
        other = Client()
        other.post(reverse("sim:api_play"), json.dumps({"scenario": "phishing", "ending": "ok", "log": []}), content_type="application/json")
        User.objects.create_user("jiro", password=PW)
        self.client.post(reverse("accounts:login"), {"username": "jiro", "password": PW})
        self.assertFalse(Play.objects.filter(user__username="jiro").exists())

    def test_weak_password_and_required_nickname(self):
        res = self.client.post(reverse("accounts:signup"), {"username": "x", "nickname": "", "password1": "1234", "password2": "1234"})
        self.assertEqual(res.status_code, 200)
        self.assertIn("nickname", res.context["form"].errors)
        self.assertIn("password2", res.context["form"].errors)
        self.assertFalse(User.objects.exists())

    def test_mypage_requires_login(self):
        res = self.client.get(reverse("accounts:mypage"))
        self.assertRedirects(res, reverse("accounts:login") + "?next=" + reverse("accounts:mypage"))

    def test_logout_is_post_only_and_profile_edit(self):
        u = User.objects.create_user("saburo", password=PW)
        self.client.force_login(u)
        res = self.client.post(reverse("accounts:profile"), {"nickname": "さぶ", "age_group": "", "show_in_ranking": ""})
        self.assertRedirects(res, reverse("accounts:mypage"))
        u.refresh_from_db()
        self.assertEqual((u.profile.nickname, u.profile.show_in_ranking), ("さぶ", False))
        self.assertEqual(self.client.get(reverse("accounts:logout")).status_code, 405)
        self.client.post(reverse("accounts:logout"))
        self.assertEqual(self.client.get(reverse("accounts:mypage")).status_code, 302)
