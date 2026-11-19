// HTML版（html/index.html）を、ブラウザで最初から最後まで通して確かめる（サーバーは要らない）
// 使い方：node e2e/html.js [画面を保存するフォルダ]
//   Node.js と Playwright が必要（npm install playwright と npx playwright install chromium）
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');
const PAGE = require('url').pathToFileURL(path.resolve(__dirname, '../html/index.html')).href;
const OUT = process.argv[2] || path.join(__dirname, 'screenshots', 'html');
fs.mkdirSync(OUT, { recursive: true });
const errors = [];
const check = (ok, msg) => { if (!ok) errors.push(msg); };
const wait = (p, ms) => p.waitForTimeout(ms);
const act = (p, name) => p.click(`[data-act="${name}"]:visible`);
const go = async (p, hash) => { await p.goto(PAGE + hash); await wait(p, 100); };

async function start(p, id) { await go(p, '#/start/' + id); await p.click('#start'); await p.waitForSelector('.vm'); }
async function finish(p, expect) {
  await p.waitForSelector('.vm-sheet:not([hidden]) [data-vm="result"]', { timeout: 10000 });
  await p.click('[data-vm="result"]'); await p.waitForFunction(() => /#\/result\/\d+$/.test(location.hash));
  const t = await p.textContent('.result h1');
  check(t.includes(expect), `結果が違う: ${t}（期待：${expect}）`);
  return t.trim();
}
async function answerAll(p, pick) {
  const ids = await p.$$eval('.qbox', (l) => l.map((x) => x.id));
  for (const id of ids) await p.click(`#${id} .qchoice >> nth=${pick}`);
  return ids.length;
}

(async () => {
  const b = await chromium.launch();
  const mk = async (opt) => { const c = await b.newContext(opt); const p = await c.newPage();
    p.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
    p.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
    p.on('requestfailed', (r) => errors.push('読めなかった: ' + r.url()));
    return p; };
  const p = await mk({ viewport: { width: 1440, height: 900 } });
  await go(p, ''); await p.screenshot({ path: `${OUT}/home.png`, fullPage: true });

  await start(p, 'phishing'); await wait(p, 2300);
  await p.click('.vm-phone [data-vm="note"]'); await act(p, 'tap-link');
  await p.click('.vm-phone [data-vm="url"]'); await p.click('[data-vm="info-close"]');
  await act(p, 'login'); await act(p, 'pay'); await wait(p, 1500);
  console.log('①', await finish(p, 'カード番号'));
  check((await p.$$eval('.actlog li', (l) => l.length)) >= 3, '行動の記録が少ない');
  await p.screenshot({ path: `${OUT}/result.png`, fullPage: true });
  await p.click('text=解説を見る'); await p.waitForSelector('.point .mini'); await wait(p, 300);
  await p.screenshot({ path: `${OUT}/explain.png`, fullPage: true });

  await start(p, 'fake-shop'); await act(p, 'open-shop');
  await p.click('.vm-pc [data-vm="bm"][data-i="0"]'); await act(p, 'search-review'); await wait(p, 200);
  await p.click('.vm-pc [data-back]'); await p.click('.vm-pc [data-back]');
  await p.click('.vm-pc [data-vm="close-tab"]'); console.log('②', await finish(p, '見抜けた'));

  await start(p, 'support-scam'); await p.waitForSelector('.pc-fs', { timeout: 12000 });
  await p.keyboard.down('Escape'); await wait(p, 1200); await p.keyboard.up('Escape'); await wait(p, 200);
  await p.click('.vm-pc [data-vm="close-tab"]'); console.log('③', await finish(p, '見抜けた'));

  await go(p, '#/mode'); check((await p.textContent('.list1')).includes('前回の結果'), '一覧に前回の結果が出ていない');

  // テスト：答えていない問題があると止まる → 全部答える
  await go(p, '#/test/pre');
  await p.click('.qbox >> nth=0 >> .qchoice >> nth=0'); await p.click('main button[type=submit]');
  check(await p.isVisible('#quiz-error'), '答えていない問題があるのに進んだ');
  check(await p.isChecked('.qbox >> nth=0 >> input >> nth=0'), '選んだ答えが消えた');
  check((await answerAll(p, 0)) === 10, '問題の数が10問でない');
  await p.click('main button[type=submit]'); await p.waitForFunction(() => /#\/test\/result\/\d+$/.test(location.hash));
  console.log('テスト（前）', (await p.textContent('.result h1')).trim());
  await go(p, '#/test/post'); await answerAll(p, 1); await p.click('main button[type=submit]');
  await p.waitForFunction(() => /#\/test\/result\/\d+$/.test(location.hash));
  check((await p.textContent('.result')).includes('体験の前'), '前と後の比べが出ていない');
  await p.screenshot({ path: `${OUT}/test-result.png`, fullPage: true });

  // アンケート
  await go(p, '#/survey'); await p.click('main button[type=submit]');
  check(await p.isVisible('.qbox.missing'), 'アンケートの未回答で進んだ');
  for (const f of ['clarity', 'tension', 'usefulness', 'again']) await p.click(`input[name=${f}][value="4"]`);
  await p.click('main button[type=submit]'); await p.waitForFunction(() => location.hash === '#/survey/thanks');

  // みんなの結果・自分の記録（ページを開き直しても残る）
  await go(p, '#/stats'); await p.screenshot({ path: `${OUT}/stats.png`, fullPage: true });
  check((await p.textContent('.stat-grid')).includes('1回'), 'みんなの結果に体験の回数が出ていない');
  check((await p.textContent('.survey-avg')).includes('4.0'), 'アンケートの平均が出ていない');
  await p.reload(); await go(p, '#/records'); await p.screenshot({ path: `${OUT}/records.png`, fullPage: true });
  check((await p.$$eval('table tbody tr', (l) => l.length)) === 3, '自分の記録の履歴が3件でない');
  p.once('dialog', (d) => d.accept()); await p.click('#clear'); await wait(p, 200);
  check((await p.textContent('main')).includes('まだ体験していません'), '記録を消せていない');

  // スマホの幅
  const m = await mk({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  for (const h of ['', '#/test/pre', '#/stats', '#/records']) {
    await go(m, h); check(await m.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `スマホの幅で横にはみ出している（${h || 'ホーム'}）`);
  }
  await go(m, ''); await m.screenshot({ path: `${OUT}/m-home.png`, fullPage: true });
  await start(m, 'phishing'); await wait(m, 2400); await m.screenshot({ path: `${OUT}/m-play.png` });

  await b.close();
  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'エラーなし');
  if (errors.length) process.exit(1);
})().catch((e) => { console.error('FAILED', e.message); console.log(errors.join('\n')); process.exit(1); });
