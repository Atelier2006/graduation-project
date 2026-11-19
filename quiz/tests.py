from django.contrib.auth.models import User
from django.test import Client, TestCase
from django.urls import reverse

from .models import Question, SurveyResponse, TestAttempt


def answers(correct=True, skip=None):
    data = {}
    for q in Question.objects.filter(is_active=True):
        if q.id == skip:
            continue
        data[f"q{q.id}"] = q.choices.filter(is_correct=correct).first().id
    return data


class QuizTests(TestCase):
    def test_seeded_questions(self):
        self.assertEqual(Question.objects.count(), 10)
        for q in Question.objects.all():
            self.assertEqual(q.choices.filter(is_correct=True).count(), 1, q.text)

    def test_pages_open(self):
        for url in [reverse("quiz:index"), reverse("quiz:take", args=["pre"]), reverse("quiz:take", args=["post"]), reverse("quiz:survey")]:
            self.assertEqual(self.client.get(url).status_code, 200, url)
        self.assertEqual(self.client.get("/test/middle/").status_code, 404)

    def test_scoring_and_compare(self):
        res = self.client.post(reverse("quiz:take", args=["pre"]), {"seed": "5"} | answers(correct=False))
        pre = TestAttempt.objects.get()
        self.assertRedirects(res, reverse("quiz:attempt", args=[pre.id]))
        self.assertEqual((pre.score, pre.total), (0, 10))
        self.client.post(reverse("quiz:take", args=["post"]), {"seed": "6"} | answers(correct=True))
        post = TestAttempt.objects.get(phase="post")
        self.assertEqual(post.score, 10)
        self.assertEqual(post.answers.count(), 10)
        page = self.client.get(reverse("quiz:attempt", args=[post.id]))
        self.assertEqual((page.context["pre"], page.context["post"]), (pre, post))

    def test_missing_answer_is_asked_again(self):
        q = Question.objects.first()
        res = self.client.post(reverse("quiz:take", args=["pre"]), {"seed": "7"} | answers(skip=q.id))
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.context["missing"], [q.id])
        self.assertFalse(TestAttempt.objects.exists())

    def test_choice_from_other_question_is_ignored(self):
        q1, q2 = Question.objects.all()[:2]
        data = answers()
        data[f"q{q1.id}"] = q2.choices.first().id
        res = self.client.post(reverse("quiz:take", args=["pre"]), {"seed": "8"} | data)
        self.assertEqual(res.context["missing"], [q1.id])

    def test_all_questions_are_shown(self):
        a = [q.id for q in self.client.get(reverse("quiz:take", args=["pre"])).context["questions"]]
        self.assertEqual(sorted(a), sorted(Question.objects.values_list("id", flat=True)))

    def test_result_is_private(self):
        self.client.post(reverse("quiz:take", args=["pre"]), {"seed": "1"} | answers())
        url = reverse("quiz:attempt", args=[TestAttempt.objects.get().id])
        self.assertEqual(self.client.get(url).status_code, 200)
        self.assertEqual(Client().get(url).status_code, 404)

    def test_survey(self):
        bad = self.client.post(reverse("quiz:survey"), {"clarity": 9})
        self.assertEqual(bad.status_code, 200)
        res = self.client.post(reverse("quiz:survey"), {"clarity": 5, "tension": 4, "usefulness": 5, "again": 3, "comment": "よかった"})
        self.assertRedirects(res, reverse("quiz:survey_thanks"))
        s = SurveyResponse.objects.get()
        self.assertEqual((s.clarity, s.again, s.user), (5, 3, None))

    def test_member_attempt_belongs_to_user(self):
        u = User.objects.create_user("m", password="Sagisim-2026-x")
        self.client.force_login(u)
        self.client.post(reverse("quiz:take", args=["pre"]), {"seed": "1"} | answers())
        a = TestAttempt.objects.get()
        self.assertEqual((a.user, a.session_key), (u, ""))
