# graduation-project

2026年度 後期 卒業制作Ⅱ のチーム開発リポジトリです。

> 11/12 の企画プレゼンで **「詐欺シミュ」（ネット犯罪体験教材）** に決まりました。制作前の検討資料は [docs/design/](docs/design/README.md)、試作品は [prototype/](prototype/README.md) にあります。11/19 から Django で本制作を始めました（このリポジトリのいちばん上のフォルダ）。

## プロジェクト概要

| 項目 | 内容 |
| --- | --- |
| 作品名 | 詐欺シミュ：ネット犯罪体験教材 |
| 一言でいうと | ブラウザの中の仮想スマホと仮想パソコンで、実際にあるネット詐欺（フィッシング・偽通販・サポート詐欺）を体験し、見抜き方と防ぎ方を学ぶ教材 |
| 体験の前後 | 同じ10問の力だめしテストを体験の前と後に解き、どれだけ見抜けるようになったかを比べる |
| 想定ユーザー | スマホやパソコンを使う一般の方（学生・社会人と、その家族） |

### チームメンバー（チームF）

| 名前 | 担当 |
| --- | --- |
| A308 進藤 稜真 | |
| B313 佐野 快 | |
| B314 下口 諒人 | |
| B319 程塚 唯斗 | |
| B321 森園 寛哉 | |

## 技術スタック

| 区分 | 採用技術 | 条件（[概要説明](docs/overview.md#制作物の条件)） |
| --- | --- | --- |
| サーバーサイド | Python 3.12／3.13 ＋ Django 5.2 LTS | Windows上で動作する PHP / Java / Python のフレームワーク |
| データベース | SQLite（そのまま動く）または MySQL 8／MariaDB（`.env` で切り替え）。テーブルは教材用に10個 | テーブル3つ以上 |
| CSSフレームワーク | Bootstrap 5.3（`sim/static/sim/vendor/` に同梱）＋ Template Party のデザイン | Bootstrap / Tailwind CSS のどちらか |
| 仮想環境 | HTML・CSS・JavaScript（外部のライブラリなし） | |
| 外部API | 使わない（ネットにつながらない展示会場でも動かすため） | 使う場合は1つに絞る |

## 必須機能

| 機能 | 詐欺シミュでの形 | 画面 |
| --- | --- | --- |
| **保存** | 体験の記録（結末・自分の行動）とテストの結果。会員はマイページに残る。ログインしていないときも、そのブラウザでは前回の結果が出る | マイページ、結果、体験を選ぶ |
| **共有** | みんなの結果（シナリオごとの見抜けた割合、だまされた人が最後に選んだこと）とランキング（ニックネームを出すかは本人が選ぶ） | みんなの結果 |
| **分析** | 「調べる」操作をした人・しなかった人の見抜けた割合、体験の前後のテストの正答率、アンケートの平均 | みんなの結果 |
| ログイン認証 | Django の認証。パスワードはソルト付きの PBKDF2 でハッシュ化して保存。本名・メールアドレスは聞かない | 会員登録、ログイン |
| レスポンシブ | パソコンでは2台を並べ、スマホの幅では1台ずつ切り替える | すべて |

ログインしなくても、すべてのシナリオとテストを体験できます。ログインすると、それまでにそのブラウザでした記録もマイページに引き継ぎます。

## スケジュール

| 日付 | イベント |
| --- | --- |
| 2026/11/12 | 企画プレゼン（8分 + 質疑8分） |
| 2027/01/14 | 中間プレゼン・現状報告（6分 + 質疑8分） |
| 2027/02/22（予定） | 発表会（8分 + 質疑12分） |
| 2027/02/26・27 | 展示会 |

全体の流れと必須工程は [docs/overview.md](docs/overview.md#全体スケジュール) にあります。

## ドキュメント

- [docs/overview.md](docs/overview.md)：卒業制作Ⅱ 概要説明（目的・テーマ・条件・評価）
- [docs/design/](docs/design/README.md)：制作開始前の検討資料（内容のすり合わせ・画面遷移・テンプレート・仮想環境・シナリオ別の画面デザイン）
- [docs/checklist.md](docs/checklist.md)：品質・セキュリティ・展示会のチェックリスト
- [docs/requirements.md](docs/requirements.md)：要件定義書（ネット詐欺見抜きトレーニング）
- [docs/project-plan/](docs/project-plan/README.md)：プロジェクト計画書（1項目1ファイル。ゴール・成果物・WBS/PERT・スケジュール・ステークホルダー・コミュニケーション・品質・リスク・ルール）
- [docs/question-bank/](docs/question-bank/README.md)：問題集（問題案92問と、もとにした事例集88件。書き方ガイド・MVPの40問の案）
- [docs/theme-research.md](docs/theme-research.md)：テーマ選定の調査レポート（推奨テーマ・候補の比較・Claude中心の進め方）
- [docs/theme-research-non-ai.md](docs/theme-research-non-ai.md)：AIを前面に出さない企画案（追加調査・AI案との比較）
- [docs/theme-research-more.md](docs/theme-research-more.md)：その他の企画案（15案の追加調査・全案の総合ランキング）

## フォルダの構成

| フォルダ | 中身 |
| --- | --- |
| `config/` | Django の設定（`settings.py`）と URL |
| `sim/` | 体験：シナリオ・結末・体験の記録の表、ホーム・体験を選ぶ・開始・仮想環境・結果・解説・みんなの結果・相談先の画面、記録を受け取る API（`/api/plays/`） |
| `sim/static/sim/` | 仮想環境のエンジン（`js/engine.js`）、シナリオ（`js/scenarios/*.js`）、画面の CSS、写真 |
| `accounts/` | 会員：会員登録・ログイン・マイページ・会員の情報。ログインしたときに記録を引き継ぐ処理（`signals.py`） |
| `quiz/` | 力だめしテスト（体験の前と後）とアンケート |
| `templates/` | すべての画面の共通部分（ヘッダー・メニュー・フッター） |
| `html/` | **HTML版**：サーバーなしで `html/index.html` をダブルクリックして使える版（記録はそのブラウザの中だけ。会員登録とランキングはなし）。くわしくは [html/README.md](html/README.md) |
| `prototype/` | 試作品（サーバーなしで開ける）。ここで直したものは `python tools/sync_prototype.py` で `sim/static/sim/` にうつす |
| `e2e/` | ブラウザで最初から最後まで通して確かめるテスト（Playwright） |
| `docs/` | 概要説明・要件定義・計画書・検討資料 |

## HTML版（サーバーなしで動かす）

`html/index.html` をダブルクリックすると、ブラウザで開いて、体験・テスト・アンケート・結果・みんなの結果（そのブラウザの分）まで使えます。Python も VSCode も要りません。
仮想環境・シナリオ・CSS・写真・テストの問題は Django 版がもとです。それらを直したら `python tools/build_html.py` で `html/` にうつします（`python manage.py test` で、うつし忘れが分かります）。

提出の条件（フレームワークとデータベースを使う）を満たすのは Django 版です。HTML版は、手軽に見せるとき・配るとき用です。

## セットアップ（Windows）

Python 3.12 か 3.13 を入れてから、リポジトリのフォルダで PowerShell を開きます。

```powershell
py -m venv .venv
.venv\Scripts\Activate.ps1          # 「スクリプトの実行が無効」と出たら：Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
pip install -r requirements.txt
copy .env.example .env             # 中身はそのままで動く（SQLite を使う）
python manage.py migrate           # 表を作り、シナリオ3本とテストの10問を入れる
python manage.py createsuperuser   # 管理画面（/admin/）に入る人を作る
python manage.py runserver
```

ブラウザで <http://127.0.0.1:8000/> を開きます。管理画面は <http://127.0.0.1:8000/admin/> です（シナリオの説明・結末・テストの問題を直せる。体験の記録は見るだけ）。

**スマホで確かめるとき**：`.env` の `ALLOWED_HOSTS` にパソコンの IP アドレスを足し（例：`ALLOWED_HOSTS=localhost,127.0.0.1,192.168.1.23`）、`python manage.py runserver 0.0.0.0:8000` で起動して、同じ Wi-Fi のスマホから `http://192.168.1.23:8000/` を開きます。

### MySQL を使うとき

MySQL 8（または MariaDB 10.11 以降）で、データベースと利用者を作ります。

```sql
CREATE DATABASE sagisim CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'sagisim'@'localhost' IDENTIFIED BY '（パスワード）';
GRANT ALL PRIVILEGES ON sagisim.* TO 'sagisim'@'localhost';
GRANT ALL PRIVILEGES ON test_sagisim.* TO 'sagisim'@'localhost';  -- テストを動かすとき
```

`.env` の `DB_ENGINE=mysql` から下の行の `#` を外し、`DB_PASSWORD` を書いてから `python manage.py migrate` をします。MySQL への接続には PyMySQL を使うので、ビルドの道具は要りません。

### 展示会などで公開するとき

`.env` を `DEBUG=False` にし、`SECRET_KEY` に長いランダムな文字列を書きます（`python -c "import secrets; print(secrets.token_urlsafe(50))"` で作れる）。`python manage.py collectstatic` で CSS・JS・写真を `staticfiles/` に集め、Web サーバーから配ります（会場のパソコン1台で動かすだけなら、`python manage.py runserver --insecure` でも配れます）。HTTPS を使わない会場では `SECURE_COOKIES=False` も書きます。

APIキーやパスワードなどの秘密の値は `.env` に書き、Git にはコミットしません（`.gitignore` で除外済み）。

## テスト

```powershell
python manage.py test                    # Django のテスト（記録の保存・他の人の結果が見えないこと・採点・ログインでの引き継ぎ・集計など）
python tools/sync_prototype.py --check   # プロトタイプと static が同じか
```

ブラウザでのテスト（Node.js と Playwright が要る：`npm install playwright` と `npx playwright install chromium`）：

```powershell
python manage.py runserver               # 別のターミナルで動かしたまま
node e2e/site.js                         # 3本の体験 → 結果の保存 → 解説 → テスト → 会員登録 → 記録の引き継ぎ → みんなの結果
node e2e/html.js                         # HTML版（サーバーは要らない）
node prototype/tests/playthrough.js      # プロトタイプの3本の主な道
```

## テンプレートについて

画面のデザインは [Template Party](https://template-party.com/) のテンプレートをもとにしています。テンプレートの元のファイルはチームの Google ドライブに保存しています。フッターの「Web Design:Template-Party」の表記は、テンプレートの規約により消さないでください。
