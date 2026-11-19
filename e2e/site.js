// Django の画面を、ブラウザで最初から最後まで通して確かめる（体験 → 結果の保存 → 解説 → テスト → 会員登録 → 記録の引き継ぎ）
// 使い方：python manage.py runserver を動かしたまま、node e2e/site.js [アドレス] [画面を保存するフォルダ]
//   Node.js と Playwright が必要（npm install playwright と npx playwright install chromium）
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');
const BASE = (process.argv[2] || 'http://127.0.0.1:8000').replace(/\/$/, '');
const OUT = process.argv[3] || path.join(__dirname, 'screenshots');
fs.mkdirSync(OUT, { recursive: true });
const errors = [];
const check = (ok, msg) => { if (!ok) errors.push(msg); };
const wait = (p, ms) => p.waitForTimeout(ms);
const act = (p, name) => p.click(`[data-act="${name}"]:visible`);
const nick = 'テスト' + Date.now().toString().slice(-6);

async function start(p, id) {
  await p.goto(`${BASE}/scenarios/${id}/`); await p.click('#start'); await p.waitForSelector('.vm');
}
async function finish(p, expect) {
  await p.waitForSelector('.vm-sheet:not([hidden]) [data-vm="result"]', { timeout: 10000 });
  await p.click('[data-vm="result"]'); await p.waitForURL(/\/results\/\d+\/$/, { timeout: 10000 });
  const t = await p.textContent('.result h1');
  check(t.includes(expect), `結果が違う: ${t}（期待：${expect}）`);
  return t.trim();
}
async function answerAll(p, pick) {
  const names = await p.$$eval('.qbox', (l) => l.map((x) => x.id));
  for (const id of names) await p.click(`#${id} .qchoice >> nth=${pick(id)}`);
  return names.length;
}

(async () => {
  const b = await chromium.launch();
  const mk = async (opt) => { const c = await b.newContext(opt); const p = await c.newPage();
    p.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
    p.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
    p.on('response', (r) => { if (r.status() >= 500) errors.push(`${r.status()} ${r.url()}`); });
    return p; };
  const p = await mk({ viewport: { width: 1440, height: 900 } });

  await p.goto(BASE + '/'); await p.screenshot({ path: `${OUT}/home.png`, fullPage: true });
  await p.goto(BASE + '/scenarios/'); await p.screenshot({ path: `${OUT}/mode.png`, fullPage: true });

  // ① だまされる道 → 結果がサーバーに残る → 解説
  await start(p, 'phishing'); await wait(p, 2300);
  await p.click('.vm-phone [data-vm="note"]'); await act(p, 'tap-link');
  await p.click('.vm-phone [data-vm="url"]'); await p.click('[data-vm="info-close"]');
  await act(p, 'login'); await act(p, 'pay'); await wait(p, 1500);
  console.log('①', await finish(p, 'カード番号'));
  const steps = await p.$$eval('.actlog li', (l) => l.length);
  check(steps >= 3, `行動の記録が少ない: ${steps}`);
  await p.screenshot({ path: `${OUT}/result.png`, fullPage: true });
  const resultUrl = p.url();
  await p.click('text=解説を見る'); await p.waitForSelector('.point .mini'); await wait(p, 300);
  await p.screenshot({ path: `${OUT}/explain.png`, fullPage: true });

  // ② 評判を調べて、タブを閉じる道
  await start(p, 'fake-shop'); await act(p, 'open-shop');
  await p.click('.vm-pc [data-vm="bm"][data-i="0"]'); await act(p, 'search-review'); await wait(p, 200);
  await p.click('.vm-pc [data-back]'); await p.click('.vm-pc [data-back]');
  await p.click('.vm-pc [data-vm="close-tab"]'); console.log('②', await finish(p, '見抜けた'));

  // ③ Escキーの長押しで全画面を終わらせる道
  await start(p, 'support-scam'); await p.waitForSelector('.pc-fs', { timeout: 12000 });
  await p.keyboard.down('Escape'); await wait(p, 1200); await p.keyboard.up('Escape'); await wait(p, 200);
  await p.click('.vm-pc [data-vm="close-tab"]'); console.log('③', await finish(p, '見抜けた'));

  // 一覧に前回の結果が出る
  await p.goto(BASE + '/scenarios/');
  check((await p.textContent('.list1')).includes('見抜けた'), '一覧に前回の結果が出ていない');

  // 体験の前のテスト：答えない問題があると出し直す → 全部答える
  await p.goto(BASE + '/test/pre/');
  await p.click('.qbox >> nth=0 >> .qchoice >> nth=0');
  await p.click('main button[type=submit]'); await p.waitForSelector('.qbox.missing');
  check(await p.isChecked('.qbox >> nth=0 >> input >> nth=0'), '出し直したとき、選んだ答えが消えた');
  const n = await answerAll(p, () => 0); check(n === 10, `問題の数が違う: ${n}`);
  await p.screenshot({ path: `${OUT}/test-take.png`, fullPage: true });
  await p.click('main button[type=submit]'); await p.waitForURL(/\/test\/results\/\d+\/$/);
  console.log('テスト（前）', (await p.textContent('.result h1')).trim());

  // 別のブラウザからは、この結果は見えない
  const other = await mk({ viewport: { width: 1280, height: 800 } });
  const r404 = await other.goto(resultUrl); check(r404.status() === 404, `他の人の結果が見えた: ${r404.status()}`);
  errors.splice(0, errors.length, ...errors.filter((e) => !e.includes('404')));

  // 会員登録 → 今までの記録がマイページに引き継がれる
  await p.goto(BASE + '/accounts/signup/');
  await p.fill('#id_username', 'u' + Date.now()); await p.fill('#id_nickname', nick);
  await p.fill('#id_password1', 'Sagisim-2026-test'); await p.fill('#id_password2', 'Sagisim-2026-test');
  await p.screenshot({ path: `${OUT}/signup.png`, fullPage: true });
  await p.click('main button[type=submit]'); await p.waitForURL(/\/accounts\/mypage\/$/);
  const rows = await p.$$eval('table tbody tr', (l) => l.length);
  check(rows === 3, `マイページの体験の履歴が3件でない: ${rows}`);
  check((await p.textContent('.progress-grid')).includes('見抜けた'), 'マイページに見抜けたシナリオがない');
  check((await p.textContent('main')).includes('体験の前'), 'マイページにテストの結果がない');
  await p.screenshot({ path: `${OUT}/mypage.png`, fullPage: true });
  await p.goto(resultUrl); check((await p.textContent('.result h1')).includes('カード番号'), '会員になった後、前の結果が見られない');

  // 体験の後のテスト（すべて正解を選ぶ）→ 前と後の比べ → アンケート
  await p.goto(BASE + '/test/post/');
  await answerAll(p, () => 1); await p.click('main button[type=submit]'); await p.waitForURL(/\/test\/results\/\d+\/$/);
  check((await p.textContent('.result')).includes('体験の前'), '前と後の比べが出ていない');
  await p.screenshot({ path: `${OUT}/test-result.png`, fullPage: true });
  await p.click('text=アンケートに答える');
  for (const f of ['clarity', 'tension', 'usefulness', 'again']) await p.click(`input[name=${f}][value="4"]`);
  await p.fill('#id_comment', '分かりやすかった'); await p.click('main button[type=submit]'); await p.waitForURL(/thanks/);

  // みんなの結果：集計とランキング
  await p.goto(BASE + '/stats/'); await p.screenshot({ path: `${OUT}/stats.png`, fullPage: true });
  check((await p.textContent('.rank')).includes(nick), 'ランキングにニックネームが出ていない');

  // ログアウト → ログイン
  await p.click('.account-box button[type=submit]'); await p.waitForURL(BASE + '/');
  check((await p.textContent('.account-box')).includes('ログイン'), 'ログアウトできていない');

  // スマホの幅
  const m = await mk({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  await m.goto(BASE + '/'); await m.screenshot({ path: `${OUT}/m-home.png`, fullPage: true });
  check(await m.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'スマホの幅で横にはみ出している（ホーム）');
  await m.goto(BASE + '/test/pre/'); await m.screenshot({ path: `${OUT}/m-test.png` });
  check(await m.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'スマホの幅で横にはみ出している（テスト）');
  await m.goto(BASE + '/stats/'); await m.screenshot({ path: `${OUT}/m-stats.png`, fullPage: true });
  await start(m, 'phishing'); await wait(m, 2400); await m.screenshot({ path: `${OUT}/m-play.png` });

  await b.close();
  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'エラーなし');
  if (errors.length) process.exit(1);
})().catch((e) => { console.error('FAILED', e.message); console.log(errors.join('\n')); process.exit(1); });
