"""最初のシナリオ3本と結末を入れる（data/scenarios_20261119.json は、シナリオの JS から取り出したもの）。"""
import json
from pathlib import Path

from django.db import migrations

DATA = Path(__file__).resolve().parent / "data" / "scenarios_20261119.json"


def seed(apps, schema_editor):
    Scenario = apps.get_model("sim", "Scenario")
    Ending = apps.get_model("sim", "Ending")
    for item in json.loads(DATA.read_text(encoding="utf-8")):
        endings = item.pop("endings")
        sc, _ = Scenario.objects.update_or_create(slug=item["slug"], defaults=item)
        for e in endings:
            Ending.objects.update_or_create(scenario=sc, code=e["code"], defaults=e)


def unseed(apps, schema_editor):
    apps.get_model("sim", "Scenario").objects.filter(slug__in=["phishing", "fake-shop", "support-scam"]).delete()


class Migration(migrations.Migration):
    dependencies = [("sim", "0001_initial")]
    operations = [migrations.RunPython(seed, unseed)]
