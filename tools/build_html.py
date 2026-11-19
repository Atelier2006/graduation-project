"""HTML版（html/）を作り直す。サーバーなしで html/index.html をダブルクリックして動かすための版。

    python tools/build_html.py          … 作り直す
    python tools/build_html.py --check  … html/ が古くなっていないかを確かめるだけ

次のものを、Django 版から html/ にうつす（Django 版がもと。html/ のこの部分は直接直さない）。
  - 仮想環境のエンジン・シナリオ・画面の CSS・写真・Bootstrap（sim/static/sim/）
  - シナリオの説明（sim/migrations/data/scenarios_*.json）と、テストの10問（quiz/migrations/0002_seed_questions.py）→ html/js/data.js
html/index.html と html/js/app.js（HTML版の画面）は手で書いたもので、ここでは変えない。
Django を入れていなくても動く（Python だけで動く）。
"""
import ast
import filecmp
import json
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC, DST = ROOT / "sim" / "static" / "sim", ROOT / "html"
COPY = ["css", "img", "vendor", "js/engine.js", "js/web.js", "js/scenarios"]


def copies():
    for item in COPY:
        path = SRC / item
        files = sorted(p for p in path.rglob("*") if p.is_file()) if path.is_dir() else [path]
        for src in files:
            rel = src.relative_to(SRC)
            yield rel, src, DST / rel


def data_js():
    scenarios = json.loads(sorted((ROOT / "sim" / "migrations" / "data").glob("scenarios_*.json"))[-1].read_text(encoding="utf-8"))
    scenes = {s["slug"]: {k: s[k] for k in ("number", "title", "scene_title", "summary", "photo")} for s in scenarios}
    tree = ast.parse((ROOT / "quiz" / "migrations" / "0002_seed_questions.py").read_text(encoding="utf-8"))
    raw = next(ast.literal_eval(n.value) for n in tree.body if isinstance(n, ast.Assign) and getattr(n.targets[0], "id", "") == "QUESTIONS")
    questions = [{"id": f"q{i}", "text": text, "explanation": exp,
                  "choices": [{"id": f"q{i}c{j}", "text": c.lstrip("*"), "correct": c.startswith("*")} for j, c in enumerate(choices)]}
                 for i, (text, choices, exp) in enumerate(raw, start=1)]
    body = json.dumps({"scenes": scenes, "questions": questions}, ensure_ascii=False, indent=1)
    return ("/* tools/build_html.py が作ったファイル。直接直さず、Django 版のデータを直してから作り直す */\n"
            f"window.SagiSim = window.SagiSim || {{}};\nwindow.SagiSim.data = {body};\n")


def main(check):
    changed = [rel for rel, src, dst in copies() if not dst.exists() or not filecmp.cmp(src, dst, shallow=False)]
    data_path = DST / "js" / "data.js"
    new_data = data_js()
    if not data_path.exists() or data_path.read_text(encoding="utf-8") != new_data:
        changed.append(data_path.relative_to(DST))
    for rel in changed:
        print(("古い：" if check else "作った：") + str(rel))
    if not check:
        for rel, src, dst in copies():
            dst.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(src, dst)
        data_path.write_text(new_data, encoding="utf-8")
    if not changed:
        print("html/ は新しいです")
    return 1 if check and changed else 0


if __name__ == "__main__":
    sys.exit(main("--check" in sys.argv))
