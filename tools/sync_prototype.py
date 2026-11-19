"""プロトタイプ（prototype/）で直した画面・シナリオ・写真を、Django の static（sim/static/sim/）にうつす。

    python tools/sync_prototype.py          … うつす
    python tools/sync_prototype.py --check  … 違うファイルを表示するだけ（うつさない）

prototype/js/app.js（プロトタイプだけの画面の切り替え）はうつさない。Django では sim/static/sim/js/site.js が代わりをする。
"""
import filecmp
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC, DST = ROOT / "prototype", ROOT / "sim" / "static" / "sim"
FOLDERS = ["css", "js", "img", "vendor"]
SKIP = {Path("js/app.js")}


def pairs():
    for folder in FOLDERS:
        for src in sorted((SRC / folder).rglob("*")):
            rel = src.relative_to(SRC)
            if src.is_file() and rel not in SKIP:
                yield rel, src, DST / rel


def main(check):
    changed = [rel for rel, src, dst in pairs() if not dst.exists() or not filecmp.cmp(src, dst, shallow=False)]
    for rel in changed:
        print(("違う：" if check else "うつした：") + str(rel))
        if not check:
            (DST / rel).parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(SRC / rel, DST / rel)
    if not changed:
        print("同じです")
    return 1 if check and changed else 0


if __name__ == "__main__":
    sys.exit(main("--check" in sys.argv))
