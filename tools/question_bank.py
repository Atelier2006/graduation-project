"""問題集（seed/questions/*.yaml）と事例集（docs/question-bank/examples.yaml）の確認と書き出し。

使い方:
    python tools/question_bank.py check    # ルールの確認と集計（違反があれば終了コード1）
    python tools/question_bank.py check --file seed/questions/sms.yaml   # 1つのファイルの問題だけ確かめる
    python tools/question_bank.py render   # docs/question-bank/ に Markdown を書き出す
    python tools/question_bank.py show EX-001 Q-SM-001   # 事例・問題を番号で表示する

必要なライブラリ: PyYAML（pip install pyyaml）
"""

from __future__ import annotations

import argparse
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path

import unicodedata

import yaml

ROOT = Path(__file__).resolve().parent.parent
SEED = ROOT / "seed"
QB_DOCS = ROOT / "docs" / "question-bank"

CHANNELS = {
    "email": ("EM", "メール"),
    "sms": ("SM", "SMS"),
    "sns": ("SN", "SNS"),
    "web": ("WB", "Webサイト"),
    "ad": ("AD", "広告"),
    "chat": ("CH", "会話"),
}
LEVELS = {"easy": "やさしい", "normal": "ふつう", "hard": "むずかしい"}
TARGETS = {"学生", "社会人", "高齢者", "全世代"}
HINT_TARGETS = {"sender", "subject", "body", "link", "page_url"}
HINT_LABELS = {
    "sender": "送信元",
    "subject": "件名",
    "body": "本文",
    "link": "リンク",
    "page_url": "アドレスバー",
}
RESERVED_SUFFIXES = (".example", ".test")

# 実在の企業・サービス名（問題と事例の本文に書かない。出典のタイトルとURLは対象外）。
# ラテン文字の名前は、前後が英字でないときだけ一致させる（例：auth の中の au には反応しない）。
COMPANY_NAMES = [
    "Amazon", "アマゾン", "楽天", "Rakuten", "PayPay", "ペイペイ", "ヤマト運輸", "クロネコ", "佐川",
    "日本郵便", "ゆうちょ", "ゆうパック", "三井住友", "SMBC", "三菱UFJ", "MUFG", "みずほ", "りそな",
    "セゾン", "JCB", "VISA", "Visa", "Mastercard", "マスターカード", "アメックス",
    "American Express", "Apple", "アップル", "Google", "グーグル", "Microsoft", "マイクロソフト",
    "LINE", "Instagram", "インスタグラム", "Facebook", "フェイスブック", "Twitter", "ツイッター",
    "TikTok", "YouTube", "ユーチューブ", "メルカリ", "ラクマ", "ドコモ", "docomo", "au",
    "ソフトバンク", "SoftBank", "Netflix", "ネットフリックス", "U-NEXT", "Hulu", "Disney", "Booking.com",
    "Airbnb", "PlayStation", "Nintendo", "任天堂", "Steam", "Coincheck", "bitFlyer",
]
# 実在の公的機関名。問題の画面（メッセージ・状況）には書かない（解説で出典として触れるのはよい）。
PUBLIC_ORGS = [
    "警察庁", "警視庁", "国税庁", "e-Tax", "マイナポータル", "日本年金機構", "金融庁", "消費者庁",
    "国民生活センター", "総務省", "厚生労働省", "IPA", "情報処理推進機構",
]
# 本文に出てもよい実在の番号（公的な相談窓口）
ALLOWED_NUMBERS = {"#9110", "188"}

URL_RE = re.compile(r"https?://([^/\s\"'<>）)]+)")
EMAIL_RE = re.compile(r"[A-Za-z0-9._%+-]+@([A-Za-z0-9.-]+\.[A-Za-z0-9-]+)")
REAL_TLD_RE = re.compile(
    r"(?<![A-Za-z0-9.-])[a-z0-9][a-z0-9-]*(?:\.[a-z0-9-]+)*\."
    r"(?:com|net|org|jp|info|biz|top|xyz|cn|ru|io|app|shop|site|online|cc|tk|me|us|uk|vip|icu|cyou|buzz|sbs)"
    r"(?![A-Za-z0-9-])",
    re.IGNORECASE,
)
PHONE_RE = re.compile(r"(?:\+\d{1,3}[\s-]?)?\(?\d{2,5}\)?[\s-]\d{1,4}[\s-]\d{3,4}")


def load_yaml(path: Path):
    with path.open(encoding="utf-8") as f:
        return yaml.safe_load(f)


def load_all(question_files=None):
    data = {
        "brands": {b["key"]: b for b in load_yaml(SEED / "brands.yaml")},
        "tactics": {t["code"]: t for t in load_yaml(SEED / "tactics.yaml")},
        "situations": {s["code"]: s for s in load_yaml(SEED / "situations.yaml")},
        "examples": [],
        "questions": [],
    }
    ex_path = QB_DOCS / "examples.yaml"
    if ex_path.exists():
        data["examples"] = load_yaml(ex_path) or []
    paths = [Path(f) for f in question_files] if question_files else sorted((SEED / "questions").glob("*.yaml"))
    for path in paths:
        for q in load_yaml(path) or []:
            q["_file"] = path.name
            data["questions"].append(q)
    return data


def registrable_domain(host: str) -> str:
    """登録ドメイン（本当の持ち主）を返す。

    .example と .test は Public Suffix List に載っていないため、最後の2つの区切りになる。
    アプリ本体では Public Suffix List を使って計算する（要件定義書 10.3節）。
    """
    host = host.rsplit("@", 1)[-1].split(":", 1)[0].strip(".").lower()
    labels = host.split(".")
    return ".".join(labels[-2:]) if len(labels) >= 2 else host


def host_of(url: str) -> str:
    m = URL_RE.match(url)
    return m.group(1) if m else ""


def iter_texts(value, path=""):
    """ネストしたdict・listから、(場所, 文字列) を順に返す。"""
    if isinstance(value, str):
        yield path, value
    elif isinstance(value, dict):
        for k, v in value.items():
            if not str(k).startswith("_"):
                yield from iter_texts(v, f"{path}.{k}" if path else str(k))
    elif isinstance(value, list):
        for i, v in enumerate(value):
            yield from iter_texts(v, f"{path}[{i}]")


def contains_name(text: str, name: str) -> bool:
    if re.fullmatch(r"[A-Za-z0-9 .\-]+", name):
        return re.search(rf"(?<![A-Za-z]){re.escape(name)}(?![A-Za-z])", text) is not None
    return name in text


def check_text_safety(where: str, text: str, errors: list, *, allow_public_orgs: bool):
    for m in URL_RE.finditer(text):
        host = m.group(1).rsplit("@", 1)[-1].split(":", 1)[0].lower()
        if not host.endswith(RESERVED_SUFFIXES):
            errors.append(f"{where}: 予約済み以外のドメインのURL（{m.group(0)}）")
    for m in EMAIL_RE.finditer(text):
        if not m.group(1).lower().endswith(RESERVED_SUFFIXES):
            errors.append(f"{where}: 予約済み以外のドメインのメールアドレス（{m.group(0)}）")
    for m in REAL_TLD_RE.finditer(text):
        errors.append(f"{where}: 実在のトップレベルドメインを使ったドメイン（{m.group(0)}）")
    for m in PHONE_RE.finditer(text):
        if m.group(0).strip() not in ALLOWED_NUMBERS:
            errors.append(f"{where}: 伏せ字になっていない電話番号（{m.group(0)}）")
    for name in COMPANY_NAMES:
        if contains_name(text, name):
            errors.append(f"{where}: 実在の企業・サービス名「{name}」")
    if not allow_public_orgs:
        for name in PUBLIC_ORGS:
            if contains_name(text, name):
                errors.append(f"{where}: 実在の公的機関名「{name}」（画面の中では架空の機関を使う）")


def check_refs(where: str, refs, errors: list):
    if not isinstance(refs, list) or not refs:
        errors.append(f"{where}: 参考資料（references/sources）が1つ以上必要")
        return
    for i, r in enumerate(refs):
        if not isinstance(r, dict) or not str(r.get("url", "")).startswith(("http://", "https://")):
            errors.append(f"{where}: 参考資料[{i}] の url が正しくない")
        if not r.get("title"):
            errors.append(f"{where}: 参考資料[{i}] に title がない")


def check_examples(data, errors: list):
    seen = set()
    for ex in data["examples"]:
        eid = ex.get("id", "?")
        where = f"事例 {eid}"
        if not re.fullmatch(r"EX-\d{3}", str(eid)):
            errors.append(f"{where}: id は EX-000 の形にする")
        if eid in seen:
            errors.append(f"{where}: id が重複している")
        seen.add(eid)
        if ex.get("kind") not in ("scam", "legit"):
            errors.append(f"{where}: kind は scam か legit")
        if ex.get("situation") not in data["situations"]:
            errors.append(f"{where}: situation が不正（{ex.get('situation')}）")
        for ch in ex.get("channels") or []:
            if ch not in CHANNELS:
                errors.append(f"{where}: channels に不正な値（{ch}）")
        for t in ex.get("tactics") or []:
            if t not in data["tactics"]:
                errors.append(f"{where}: tactics に不正な値（{t}）")
        for t in ex.get("targets") or []:
            if t not in TARGETS:
                errors.append(f"{where}: targets に不正な値（{t}）")
        if ex.get("level") not in LEVELS:
            errors.append(f"{where}: level が不正（{ex.get('level')}）")
        for field in ("title", "right_action"):
            if not ex.get(field):
                errors.append(f"{where}: {field} がない")
        if not ex.get("red_flags"):
            errors.append(f"{where}: red_flags がない")
        check_refs(where, ex.get("sources"), errors)
        body = {k: v for k, v in ex.items() if k not in ("sources",)}
        for path, text in iter_texts(body):
            check_text_safety(f"{where} {path}", text, errors, allow_public_orgs=True)


def check_legit_domains(where: str, msg: dict, brand: dict, errors: list):
    """本物の問題で、リンク・アドレスバー・メールアドレスがブランドの公式ドメイン（またはそのサブドメイン）か。

    登録ドメインではなく公式ドメインそのもので比べる（そよかぜ市役所・警察署・税務署は登録ドメインが同じため）。
    """
    official = brand["official_domain"].lower()
    found = []
    for key in ("link", "page_url"):
        if msg.get(key):
            found.append((key, host_of(str(msg[key])) or str(msg[key])))
    sender = str(msg.get("sender") or "")
    if "@" in sender and not sender.startswith("@"):
        found.append(("sender", sender))
    for key, host in found:
        host = host.rsplit("@", 1)[-1].split(":", 1)[0].strip(".").lower()
        if host != official and not host.endswith("." + official):
            errors.append(f"{where}: 本物の問題なのに、{key} のドメイン（{host}）が"
                          f"{brand['name']}の公式ドメイン（{official}）と違う")


def check_questions(data, errors: list, warnings: list):
    ids = Counter(q.get("id") for q in data["questions"])
    example_ids = {ex.get("id") for ex in data["examples"]}
    for q in data["questions"]:
        qid = q.get("id", "?")
        where = f"問題 {qid}（{q.get('_file')}）"
        if ids[qid] > 1:
            errors.append(f"{where}: id が重複している")
        qtype = q.get("type")
        if qtype not in ("judge", "url"):
            errors.append(f"{where}: type は judge か url")
            continue
        if not q.get("title"):
            errors.append(f"{where}: title がない")
        if not isinstance(q.get("is_scam"), bool):
            errors.append(f"{where}: is_scam は true か false")
        if q.get("level") not in LEVELS:
            errors.append(f"{where}: level が不正（{q.get('level')}）")
        if q.get("situation") not in data["situations"]:
            errors.append(f"{where}: situation が不正（{q.get('situation')}）")
        targets = q.get("targets") or []
        if not targets or any(t not in TARGETS for t in targets):
            errors.append(f"{where}: targets が不正（{targets}）")
        tactics = q.get("tactics") or []
        if any(t not in data["tactics"] for t in tactics):
            errors.append(f"{where}: tactics に不正な値（{tactics}）")
        if q.get("is_scam") is True and not tactics:
            errors.append(f"{where}: 詐欺の問題には tactics が1つ以上必要")
        if q.get("is_scam") is False and tactics:
            errors.append(f"{where}: 本物の問題の tactics は空にする")
        brand = q.get("brand")
        if brand and brand not in data["brands"]:
            errors.append(f"{where}: brand が不正（{brand}）")
        exs = q.get("examples") or []
        if not exs:
            errors.append(f"{where}: examples（もとにした事例）が1つ以上必要")
        elif example_ids:
            for e in exs:
                if e not in example_ids:
                    errors.append(f"{where}: examples の {e} が事例集にない")
        expl = q.get("explanation") or {}
        if not expl.get("why") or not expl.get("action"):
            errors.append(f"{where}: explanation に why と action が必要")
        check_refs(where, q.get("references"), errors)
        source_titles = {src.get("url"): src.get("title") for e in data["examples"] if e.get("id") in exs
                         for src in e.get("sources") or []}
        for r in q.get("references") or []:
            if not isinstance(r, dict) or not source_titles:
                continue
            if r.get("url") not in source_titles:
                warnings.append(f"{where}: 参考資料 {r.get('url')} が、もとにした事例の出典にない")
            elif r.get("title") != source_titles[r.get("url")]:
                warnings.append(f"{where}: 参考資料 {r.get('url')} の title が事例集の出典と違う")

        if qtype == "judge":
            ch = q.get("channel")
            if ch not in CHANNELS:
                errors.append(f"{where}: channel が不正（{ch}）")
            elif not str(qid).startswith(f"Q-{CHANNELS[ch][0]}-"):
                errors.append(f"{where}: id の記号が channel と合わない（{ch} は Q-{CHANNELS[ch][0]}-）")
            msg = q.get("message") or {}
            parts = msg.get("parts") or []
            if not (msg.get("body") or parts):
                errors.append(f"{where}: message の body か parts が必要")
            actions = q.get("actions") or []
            if not 3 <= len(actions) <= 4:
                errors.append(f"{where}: actions は3〜4個（今は{len(actions)}個）")
            if sum(1 for a in actions if a.get("best") is True) != 1:
                errors.append(f"{where}: best: true の行動はちょうど1つ")
            hints = q.get("hints") or []
            if not hints:
                errors.append(f"{where}: hints（見るべき場所）が1つ以上必要")
            for h in hints:
                target = str(h.get("target", ""))
                m = re.fullmatch(r"part:(\d+)", target)
                if m:
                    if not 1 <= int(m.group(1)) <= len(parts):
                        errors.append(f"{where}: hints の {target} に対応する部品がない")
                elif target not in HINT_TARGETS:
                    errors.append(f"{where}: hints の target が不正（{target}）")
                elif target != "page_url" and not msg.get(target):
                    warnings.append(f"{where}: hints の {target} が message に書かれていない")
                if not h.get("note"):
                    errors.append(f"{where}: hints に note がない")
            if q.get("is_scam") is False and brand in data["brands"]:
                check_legit_domains(where, msg, data["brands"][brand], errors)
            content = {"context": q.get("context"), "message": msg, "actions": actions}
        else:
            if not str(qid).startswith("Q-UR-"):
                errors.append(f"{where}: URL問題の id は Q-UR- で始める")
            url = str(q.get("url", ""))
            host = host_of(url)
            if not host:
                errors.append(f"{where}: url が正しくない")
            answer = q.get("answer")
            choices = q.get("choices") or []
            if answer not in choices:
                errors.append(f"{where}: answer が choices に含まれていない")
            if host and answer != registrable_domain(host):
                errors.append(f"{where}: answer（{answer}）が登録ドメイン（{registrable_domain(host)}）と違う")
            if host and brand in data["brands"]:
                official = registrable_domain(data["brands"][brand]["official_domain"])
                expected_scam = registrable_domain(host) != official
                if q.get("is_scam") is not expected_scam:
                    errors.append(f"{where}: is_scam が登録ドメインとブランドの公式ドメインの関係と合わない")
            content = {"context": q.get("context"), "url": url, "choices": choices}

        for path, text in iter_texts(content):
            check_text_safety(f"{where} {path}", text, errors, allow_public_orgs=False)
        for path, text in iter_texts({"hints": q.get("hints"), "explanation": expl}):
            check_text_safety(f"{where} {path}", text, errors, allow_public_orgs=True)


def coverage(data) -> dict:
    qs = data["questions"]
    judge = [q for q in qs if q.get("type") == "judge"]
    return {
        "total": len(qs),
        "judge": len(judge),
        "url": len(qs) - len(judge),
        "scam": sum(1 for q in qs if q.get("is_scam") is True),
        "legit": sum(1 for q in qs if q.get("is_scam") is False),
        "channel": Counter((q.get("channel"), q.get("is_scam")) for q in judge),
        "level": Counter(q.get("level") for q in qs),
        "situation": Counter(q.get("situation") for q in qs),
        "tactic": Counter(t for q in qs for t in (q.get("tactics") or [])),
        "tactic_channel": Counter(
            (t, q.get("channel")) for q in judge for t in (q.get("tactics") or [])
        ),
        "targets": Counter(t for q in qs for t in (q.get("targets") or [])),
        "brand": Counter(q.get("brand") for q in qs if q.get("brand")),
    }


def print_coverage(data):
    c = coverage(data)
    if not c["total"]:
        print("問題: 0件")
        return
    print(f"問題: {c['total']}件（判定 {c['judge']} / URL {c['url']}）")
    print(f"  詐欺 {c['scam']} / 本物 {c['legit']}（本物の割合 {c['legit'] / c['total']:.0%}）")
    print("  難易度: " + ", ".join(f"{LEVELS[k]} {c['level'][k]}" for k in LEVELS))
    print("  画面: " + ", ".join(
        f"{CHANNELS[ch][1]} {c['channel'][(ch, True)] + c['channel'][(ch, False)]}" for ch in CHANNELS))
    missing = [code for code in data["tactics"] if c["tactic"][code] < 2]
    if missing:
        print("  問題が2問未満の手口: " + ", ".join(missing))
    unused = [code for code in data["situations"] if not c["situation"][code]]
    if unused:
        print("  問題がないシチュエーション: " + ", ".join(unused))
    print(f"事例: {len(data['examples'])}件")


# ---------- Markdown の書き出し ----------

def gh_slug(heading: str) -> str:
    """GitHub が見出しに付けるアンカー名（記号を除き、空白をハイフンにする）。"""
    kept = (ch for ch in heading.strip().lower() if ch in " -_" or unicodedata.category(ch)[0] in "LNM")
    return "".join(kept).replace(" ", "-")


def md_escape(text: str) -> str:
    return str(text).replace("|", "｜").strip()


def md_link_text(text) -> str:
    """リンクの文字に入った [ ] がリンクの区切りと間違われないようにする。"""
    return md_escape(text).replace("[", "\\[").replace("]", "\\]")


def md_url(url) -> str:
    """Markdown のリンク先として壊れないように、空白とかっこを % の形にする。"""
    return str(url).strip().replace(" ", "%20").replace("(", "%28").replace(")", "%29")


def quote_block(text: str) -> list[str]:
    return [f"> {line}" if line.strip() else ">" for line in str(text).strip().splitlines()]


def render_message(q) -> list[str]:
    msg = q.get("message") or {}
    out = []
    head = msg.get("sender_name") or ""
    if msg.get("sender"):
        head += f"（{msg['sender']}）" if head else msg["sender"]
    if head:
        out.append(f"> **{md_escape(head)}**")
    if msg.get("subject"):
        out.append(f"> 件名：{md_escape(msg['subject'])}")
    if msg.get("page_url"):
        out.append(f"> アドレスバー：`{msg['page_url']}`")
    if out and (msg.get("body") or msg.get("parts")):
        out.append(">")
    if msg.get("body"):
        out += quote_block(msg["body"])
    for i, p in enumerate(msg.get("parts") or [], start=1):
        kind = p.get("kind")
        if kind == "say":
            name = p.get("name") or p.get("who", "")
            out.append(f"> [{i}] **{md_escape(name)}**：{md_escape(p.get('text', ''))}")
        elif kind == "form":
            out.append(f"> [{i}] 入力欄：{'／'.join(p.get('fields') or [])}")
        elif kind == "button":
            out.append(f"> [{i}] ［{md_escape(p.get('text', ''))}］ボタン")
        else:
            label = {"heading": "見出し", "warning": "警告", "phone": "電話番号", "ad_label": "表示",
                     "profile": "アカウント", "event": "できごと", "text": "文"}.get(kind, kind)
            out.append(f"> [{i}] {label}：{md_escape(p.get('text', ''))}")
    if msg.get("link"):
        out.append(">")
        out.append(f"> リンク：`{msg['link']}`")
    return out


def render_question(q, data) -> list[str]:
    verdict = "詐欺" if q.get("is_scam") else "本物"
    lines = [f"### {q['id']} {md_escape(q.get('title', ''))}", ""]
    tags = [
        verdict,
        LEVELS.get(q.get("level"), q.get("level")),
        data["situations"].get(q.get("situation"), {}).get("name", q.get("situation")),
        "対象：" + "・".join(q.get("targets") or []),
    ]
    if q.get("brand") in data["brands"]:
        tags.append("ブランド：" + data["brands"][q["brand"]]["name"])
    if q.get("tactics"):
        tags.append("手口：" + "、".join(
            f"{t} {data['tactics'][t]['name']}" for t in q["tactics"] if t in data["tactics"]))
    lines.append("｜".join(tags))
    lines.append("")
    if q.get("context"):
        lines.append(f"**状況**：{md_escape(q['context'])}")
        lines.append("")
    if q.get("type") == "url":
        lines.append(f"**URL**：`{q.get('url')}`")
        lines.append("")
        lines.append("**問い**：このURLの本当の持ち主（登録ドメイン）はどれ？")
        lines.append("")
        for c in q.get("choices") or []:
            mark = "（正解）" if c == q.get("answer") else ""
            lines.append(f"- `{c}`{mark}")
        lines.append("")
    else:
        lines += render_message(q)
        lines.append("")
        lines.append(f"**正解**：{verdict}")
        lines.append("")
        lines.append("**このあとどうする？**")
        lines.append("")
        for a in q.get("actions") or []:
            mark = "（最善）" if a.get("best") else ""
            lines.append(f"- {md_escape(a.get('text', ''))}{mark}")
        lines.append("")
        lines.append("**見るべき場所**")
        lines.append("")
        for i, h in enumerate(q.get("hints") or [], start=1):
            target = str(h.get("target", ""))
            label = HINT_LABELS.get(target) or target.replace("part:", "部品")
            lines.append(f"{i}. {label}：{md_escape(h.get('note', ''))}")
        lines.append("")
    expl = q.get("explanation") or {}
    lines.append(f"**解説**：{md_escape(expl.get('why', ''))}")
    lines.append("")
    lines.append(f"**正しい行動**：{md_escape(expl.get('action', ''))}")
    lines.append("")
    refs = "、".join(f"[{md_link_text(r.get('title', ''))}]({md_url(r.get('url'))})" for r in q.get("references") or [])
    lines.append(f"**参考**：{refs}")
    lines.append("")
    lines.append(f"もとにした事例：{'、'.join(q.get('examples') or [])}")
    lines.append("")
    return lines


def render_questions_md(data) -> str:
    c = coverage(data)
    qs = data["questions"]
    out = [
        "# 問題集（問題案）",
        "",
        "> このファイルは `python tools/question_bank.py render` で `seed/questions/*.yaml` から自動で作っています。"
        "直接編集せず、YAMLを直してから作り直してください。",
        "",
        "問題はすべて架空です。会社・サービス・URL・電話番号は実在しません。",
        "",
        "## 集計",
        "",
        f"全{c['total']}問（判定問題 {c['judge']}問、URL問題 {c['url']}問）。"
        f"詐欺 {c['scam']}問、本物 {c['legit']}問。",
        "",
        "| 画面の種類 | 詐欺 | 本物 | 合計 |",
        "| --- | --- | --- | --- |",
    ]
    for ch, (_, label) in CHANNELS.items():
        s, l = c["channel"][(ch, True)], c["channel"][(ch, False)]
        out.append(f"| {label} | {s} | {l} | {s + l} |")
    out.append(f"| URL問題 | {sum(1 for q in qs if q.get('type') == 'url' and q.get('is_scam'))} | "
               f"{sum(1 for q in qs if q.get('type') == 'url' and q.get('is_scam') is False)} | {c['url']} |")
    out += ["", "| 難易度 | 問題数 |", "| --- | --- |"]
    out += [f"| {label} | {c['level'][k]} |" for k, label in LEVELS.items()]
    out += ["", "**手口と画面の種類の対応**（数字は問題数）", ""]
    header = "| 手口 | " + " | ".join(label for _, label in CHANNELS.values()) + " | URL問題 | 合計 |"
    out += [header, "| --- |" + " --- |" * (len(CHANNELS) + 2)]
    url_tactics = Counter(t for q in qs if q.get("type") == "url" for t in (q.get("tactics") or []))
    for code, t in data["tactics"].items():
        cells = [str(c["tactic_channel"][(code, ch)] or "") for ch in CHANNELS] + [str(url_tactics[code] or "")]
        out.append(f"| {code} {t['name']} | " + " | ".join(cells) + f" | {c['tactic'][code]} |")
    out += ["", "| シチュエーション | 問題数 |", "| --- | --- |"]
    out += [f"| {code} {s['name']} | {c['situation'][code]} |" for code, s in data["situations"].items()]
    out.append("")
    groups = [(ch, label) for ch, (_, label) in CHANNELS.items()] + [("url", "URL問題")]
    for key, label in groups:
        items = [q for q in qs if (q.get("type") == "url" if key == "url" else q.get("channel") == key
                                   and q.get("type") == "judge")]
        if not items:
            continue
        out += [f"## {label}（{len(items)}問）", ""]
        for q in sorted(items, key=lambda q: q["id"]):
            out += render_question(q, data)
    return "\n".join(out).rstrip() + "\n"


def render_examples_md(data) -> str:
    exs = data["examples"]
    used_by = defaultdict(list)
    for q in data["questions"]:
        for e in q.get("examples") or []:
            used_by[e].append(q["id"])
    kinds = Counter(ex.get("kind") for ex in exs)
    out = [
        "# 事例集",
        "",
        "> このファイルは `python tools/question_bank.py render` で `docs/question-bank/examples.yaml` から"
        "自動で作っています。直接編集せず、YAMLを直してから作り直してください。",
        "",
        "公的機関などの注意喚起から集めた、実際の詐欺の手口と「本物の連絡の特徴」です。"
        "練習問題は、ここに書かれた特徴をもとに架空のブランドで作ります。"
        "事例の本文では、実在の企業名を業種に置き換えています。",
        "",
        f"全{len(exs)}件（詐欺の手口 {kinds['scam']}件、本物の特徴 {kinds['legit']}件）。",
        "",
        "| シチュエーション | 件数 |",
        "| --- | --- |",
    ]
    by_sit = defaultdict(list)
    for ex in exs:
        by_sit[ex.get("situation")].append(ex)
    for code, s in data["situations"].items():
        name = f"{code} {s['name']}"
        cell = f"[{name}](#{gh_slug(name)})" if by_sit[code] else name
        out.append(f"| {cell} | {len(by_sit[code])} |")
    out.append("")
    for code, s in data["situations"].items():
        items = by_sit.get(code) or []
        if not items:
            continue
        out += [f"## {code} {s['name']}", ""]
        for ex in sorted(items, key=lambda e: e["id"]):
            kind = "詐欺の手口" if ex.get("kind") == "scam" else "本物の特徴"
            out += [f"### {ex['id']} {md_escape(ex.get('title', ''))}", ""]
            tags = [kind, LEVELS.get(ex.get("level"), ex.get("level")),
                    "画面：" + "・".join(CHANNELS.get(ch, (None, ch))[1] for ch in ex.get("channels") or []),
                    "対象：" + "・".join(ex.get("targets") or [])]
            if ex.get("tactics"):
                tags.append("手口：" + "、".join(
                    f"{t} {data['tactics'][t]['name']}" for t in ex["tactics"] if t in data["tactics"]))
            out += ["｜".join(tags), ""]
            if ex.get("flow"):
                out += ["**流れ**", "", str(ex["flow"]).strip(), ""]
            for key, label in (("features", "特徴"), ("red_flags", "見抜くポイント")):
                if ex.get(key):
                    out += [f"**{label}**", ""] + [f"- {md_escape(x)}" for x in ex[key]] + [""]
            for key, label in (("right_action", "正しい行動"), ("legit_contrast", "本物との違い・確かめ方"),
                               ("trend", "最近の動向")):
                if ex.get(key):
                    out += [f"**{label}**：{md_escape(ex[key])}", ""]
            if ex.get("question_ideas"):
                out += ["**問題にするアイデア**", ""] + [f"- {md_escape(x)}" for x in ex["question_ideas"]] + [""]
            srcs = []
            for src in ex.get("sources") or []:
                pub = f"（{src['published']}）" if src.get("published") else ""
                srcs.append(f"- {md_escape(src.get('publisher', ''))}：[{md_link_text(src.get('title', ''))}]"
                            f"({md_url(src.get('url'))}){pub}")
            out += ["**出典**", ""] + srcs + [""]
            if used_by.get(ex["id"]):
                out += [f"この事例から作った問題：{'、'.join(sorted(used_by[ex['id']]))}", ""]
    return "\n".join(out).rstrip() + "\n"


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description="問題集と事例集の確認・書き出し")
    parser.add_argument("command", choices=["check", "render", "show"])
    parser.add_argument("ids", nargs="*", help="show で表示する事例・問題の番号（例：EX-001 Q-SM-001）")
    parser.add_argument("--file", action="append",
                        help="check で確かめる問題のファイル（何度でも指定できる。省略するとすべて）")
    args = parser.parse_args(argv)
    if args.file and args.command != "check":
        parser.error("--file は check でだけ使える")
    try:
        data = load_all(args.file)
    except (OSError, yaml.YAMLError) as e:
        print(f"エラー: ファイルを読めない（YAMLの書き方を確かめる）: {e}")
        return 1
    if args.command == "show":
        index = {ex.get("id"): ex for ex in data["examples"]}
        index.update({q.get("id"): {k: v for k, v in q.items() if k != "_file"} for q in data["questions"]})
        missing = [i for i in args.ids if i not in index]
        found = [index[i] for i in args.ids if i in index]
        if found:
            print(yaml.dump(found, allow_unicode=True, sort_keys=False, width=1000), end="")
        for i in missing:
            print(f"見つからない: {i}")
        return 1 if missing else 0
    errors: list[str] = []
    warnings: list[str] = []
    check_examples(data, errors)
    check_questions(data, errors, warnings)
    if args.command == "render":
        (QB_DOCS / "questions.md").write_text(render_questions_md(data), encoding="utf-8")
        (QB_DOCS / "examples.md").write_text(render_examples_md(data), encoding="utf-8")
        print("docs/question-bank/questions.md と examples.md を書き出しました")
    print_coverage(data)
    for w in warnings:
        print(f"注意: {w}")
    for e in errors:
        print(f"エラー: {e}")
    print(f"エラー {len(errors)}件、注意 {len(warnings)}件")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
