import json

from django.contrib.auth.models import User
from django.test import TestCase
from django.urls import reverse

from accounts.models import Profile

from .models import Ending, Play, PlayStep, Scenario


def post_play(client, **data):
    body = {"scenario": "phishing", "ending": "ng1", "log": []} | data
    return client.post(reverse("sim:api_play"), json.dumps(body), content_type="application/json")


class PagesTests(TestCase):
    def test_pages_open(self):
        for name, args in [("sim:home", []), ("sim:mode", []), ("sim:stats", []), ("sim:help", []),
                           ("sim:start", ["phishing"]), ("sim:play", ["fake-shop"]), ("sim:explain", ["support-scam"])]:
            with self.subTest(name=name):
                self.assertEqual(self.client.get(reverse(name, args=args)).status_code, 200)

    def test_seeded_scenarios(self):
        self.assertEqual(Scenario.objects.count(), 3)
        for sc in Scenario.objects.all():
            self.assertEqual(set(sc.endings.values_list("kind", flat=True)), {"ok", "ng", "quit"})

    def test_unpublished_is_hidden(self):
        Scenario.objects.filter(slug="phishing").update(is_published=False)
        self.assertEqual(self.client.get(reverse("sim:start", args=["phishing"])).status_code, 404)
        self.assertEqual(post_play(self.client).status_code, 400)

    def test_play_page_loads_engine_and_scenario(self):
        html = self.client.get(reverse("sim:play", args=["phishing"])).content.decode()
        self.assertIn("sim/js/engine.js", html)
        self.assertIn("sim/js/scenarios/phishing.js", html)
        self.assertIn("window.SagiSim.IMG", html)


class ApiPlayTests(TestCase):
    def test_saves_play_and_steps(self):
        log = [{"kind": "check", "label": "アドレスを確かめた", "dev": "phone"},
               {"kind": "decide", "label": "カード番号を入力して支払った", "dev": "phone"},
               {"kind": "hint", "label": "ヒントを見た"}]
        res = post_play(self.client, log=log)
        self.assertEqual(res.status_code, 201)
        p = Play.objects.get(pk=res.json()["id"])
        self.assertEqual(p.ending.code, "ng1")
        self.assertEqual((p.check_count, p.decide_count, p.hint_count), (1, 1, 1))
        self.assertEqual(list(p.steps.values_list("order", "kind", "device")), [(1, "check", "phone"), (2, "decide", "phone"), (3, "hint", "")])
        self.assertIsNone(p.user)
        self.assertTrue(p.session_key)
        self.assertEqual(self.client.get(res.json()["result_url"]).status_code, 200)

    def test_rejects_bad_input(self):
        url = reverse("sim:api_play")
        self.assertEqual(self.client.post(url, "not json", content_type="application/json").status_code, 400)
        self.assertEqual(post_play(self.client, scenario="nothing").status_code, 400)
        self.assertEqual(post_play(self.client, ending="ok-but-wrong").status_code, 400)
        self.assertEqual(post_play(self.client, log="text").status_code, 400)
        self.assertEqual(self.client.get(url).status_code, 405)

    def test_cleans_steps(self):
        log = [{"kind": "typed", "label": "入力した文字"}, "x", {"kind": "check", "label": "あ" * 300, "dev": "tablet"}] + \
              [{"kind": "decide", "label": "決めた"}] * 500
        p = Play.objects.get(pk=post_play(self.client, log=log).json()["id"])
        self.assertFalse(p.steps.filter(label="入力した文字").exists())
        first = p.steps.first()
        self.assertEqual((first.kind, len(first.label), first.device), ("check", 120, ""))
        self.assertLessEqual(p.steps.count(), 200)

    def test_csrf_is_required(self):
        from django.test import Client
        c = Client(enforce_csrf_checks=True)
        self.assertEqual(post_play(c).status_code, 403)

    def test_other_people_cannot_see_result(self):
        res = post_play(self.client)
        url = res.json()["result_url"]
        from django.test import Client
        self.assertEqual(Client().get(url).status_code, 404)
        u = User.objects.create_user("other", password="Sagisim-2026-x")
        c = Client(); c.force_login(u)
        self.assertEqual(c.get(url).status_code, 404)


class StatsTests(TestCase):
    def test_rates_traps_and_ranking(self):
        sc = Scenario.objects.get(slug="phishing")
        ok, ng = Ending.objects.get(scenario=sc, code="ok"), Ending.objects.get(scenario=sc, code="ng1")
        alice = User.objects.create_user("alice", password="Sagisim-2026-x")
        Profile.objects.create(user=alice, nickname="アリス")
        hidden = User.objects.create_user("bob", password="Sagisim-2026-x")
        Profile.objects.create(user=hidden, nickname="ボブ", show_in_ranking=False)
        Play.objects.create(scenario=sc, ending=ok, user=alice, check_count=2)
        Play.objects.create(scenario=sc, ending=ok, user=hidden, check_count=1)
        bad = Play.objects.create(scenario=sc, ending=ng, session_key="x", check_count=0)
        PlayStep.objects.create(play=bad, order=1, kind="decide", label="リンクを開いた")
        PlayStep.objects.create(play=bad, order=2, kind="decide", label="カード番号を入力して支払った")
        res = self.client.get(reverse("sim:stats"))
        row = res.context["rows"][0]
        self.assertEqual((row["total"], row["ok"], row["ng"]), (3, 67, 33))
        self.assertEqual((row["checked_ok"], row["unchecked_ok"]), (100, 0))
        self.assertEqual(row["traps"], [("カード番号を入力して支払った", 1)])
        names = [r["name"] for r in res.context["ranking"]]
        self.assertEqual(names, ["アリス"])
        self.assertNotContains(res, "ボブ")
