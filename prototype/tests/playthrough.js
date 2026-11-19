// プロトタイプを自動で操作して、3本の主な道（だまされる道・見抜く道）を最後まで通す
// 使い方：node prototype/tests/playthrough.js [画面を保存するフォルダ]
//   Node.js と Playwright（npm install playwright と npx playwright install chromium）が必要
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');
const PAGE = require('url').pathToFileURL(path.resolve(__dirname, '../index.html')).href;
const OUT = process.argv[2] || path.join(__dirname, 'screenshots');
fs.mkdirSync(OUT, { recursive: true });
const errors = [];
const wait = (p, ms) => p.waitForTimeout(ms);
async function start(p, id) {
  await p.goto(PAGE + '#/start/' + id); await p.click('#start'); await p.waitForSelector('.vm');
}
async function act(p, name) { await p.click(`[data-act="${name}"]:visible`); }
async function finish(p, expect) {
  await p.waitForSelector('.vm-sheet:not([hidden]) [data-vm="result"]', { timeout: 8000 });
  await p.click('[data-vm="result"]'); await p.waitForSelector('.result');
  const t = await p.textContent('.result h1');
  if (!t.includes(expect)) errors.push(`結果が違う: ${t} (期待: ${expect})`);
  return t;
}
(async () => {
  const b = await chromium.launch();
  const mk = async (vp) => { const c = await b.newContext({ viewport: vp }); const p = await c.newPage();
    p.on('pageerror', (e) => errors.push('pageerror: ' + e.message)); p.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); }); return p; };
  const p = await mk({ width: 1440, height: 900 });

  // ① だまされる道（カード番号まで）
  await start(p, 'phishing'); await wait(p, 2300);
  await p.screenshot({ path: `${OUT}/p1-lock.png` });
  await p.click('.vm-phone [data-vm="note"]'); await act(p, 'tap-link');
  await p.click('.vm-phone [data-vm="url"]'); await wait(p, 200); await p.screenshot({ path: `${OUT}/p1-url.png` });
  await p.click('[data-vm="info-close"]'); await act(p, 'login'); await act(p, 'pay');
  await wait(p, 1500); await p.screenshot({ path: `${OUT}/p1-after.png` });
  console.log('①A', await finish(p, 'カード番号'));
  await p.screenshot({ path: `${OUT}/p1-result.png`, fullPage: true });
  await p.click('a[href="#/explain/phishing"]'); await p.waitForSelector('.point .mini'); await wait(p, 300);
  await p.screenshot({ path: `${OUT}/p1-explain.png`, fullPage: true });

  // ① 確かめて見抜く道
  await start(p, 'phishing'); await wait(p, 2300);
  await p.click('.vm-phone [data-vm="unlock"]'); await p.click('.vm-phone [data-app="hashire"]');
  await p.click('.vm-pc [data-vm="bm"][data-i="0"]'); await wait(p, 200);
  await p.screenshot({ path: `${OUT}/p1-check.png` });
  await p.click('.vm-phone [data-vm="home"]'); await p.click('.vm-phone [data-app="tomo"]'); await act(p, 'consult'); await wait(p, 2500);
  await p.click('.vm-phone [data-vm="home"]'); await p.click('.vm-phone [data-app="sms"]');
  await p.click('[data-vm="hint"]'); await wait(p, 300); await p.screenshot({ path: `${OUT}/p1-hint.png` });
  await p.click('.vm-phone [data-vm="home"]'); await p.screenshot({ path: `${OUT}/p1-home.png` }); await p.click('.vm-phone [data-app="sms"]');
  await act(p, 'delete'); console.log('①B', await finish(p, '見抜けた'));
  const log1 = await p.$$eval('.actlog li', (l) => l.map((x) => x.textContent));
  console.log('  行動:', log1.join(' / '));

  // ② だまされる道
  await start(p, 'fake-shop'); await wait(p, 300); await p.screenshot({ path: `${OUT}/p2-search.png` });
  await act(p, 'open-shop'); await p.screenshot({ path: `${OUT}/p2-shop.png` });
  await act(p, 'open-law'); await p.screenshot({ path: `${OUT}/p2-law.png` }); await p.click('.vm-pc .law-back'); await act(p, 'order'); await p.screenshot({ path: `${OUT}/p2-order.png` });
  await act(p, 'go-bank'); await wait(p, 300); await p.screenshot({ path: `${OUT}/p2-bank.png` });
  await act(p, 'transfer'); console.log('②A', await finish(p, '振り込んだ'));
  // ② 評判を調べて、タブを閉じる道
  await start(p, 'fake-shop'); await act(p, 'open-shop');
  await p.click('.vm-pc [data-vm="bm"][data-i="0"]'); await act(p, 'search-review'); await wait(p, 200);
  await p.screenshot({ path: `${OUT}/p2-review.png` });
  await p.click('.vm-pc [data-back]'); await p.click('.vm-pc [data-back]');
  await p.click('.vm-pc [data-vm="close-tab"]'); console.log('②B', await finish(p, '見抜けた'));

  // ③ だまされる道（電話 → 遠隔操作 → 電子マネー）
  await start(p, 'support-scam'); await act(p, 'tap-ad'); await wait(p, 300);
  await p.screenshot({ path: `${OUT}/p3-warning.png` });
  await p.click('.vm-phone [data-vm="unlock"]'); await p.click('.vm-phone [data-app="tel"]'); await act(p, 'type-number'); await p.screenshot({ path: `${OUT}/p3-dialer.png` }); await act(p, 'call');
  await wait(p, 6200); await p.screenshot({ path: `${OUT}/p3-call1.png` });
  await act(p, 'obey'); await wait(p, 300); await p.screenshot({ path: `${OUT}/p3-remote.png` });
  await act(p, 'allow'); await wait(p, 2200); await wait(p, 4600);
  await p.screenshot({ path: `${OUT}/p3-call2.png` });
  await act(p, 'pay-emoney'); console.log('③A', await finish(p, '電子マネー'));
  // ③ Escキーの長押しで全画面を終わらせ、タブを閉じる道（警告は自動で出る）
  await start(p, 'support-scam'); await p.waitForSelector('.pc-fs', { timeout: 12000 });
  await p.keyboard.down('Escape'); await wait(p, 1200); await p.keyboard.up('Escape');
  await wait(p, 200); await p.screenshot({ path: `${OUT}/p3-exitfs.png` });
  await p.click('.vm-pc [data-vm="close-tab"]'); console.log('③B', await finish(p, '見抜けた'));
  await p.click('a[href="#/explain/support-scam"]'); await p.waitForSelector('.point .mini'); await wait(p, 300);
  await p.screenshot({ path: `${OUT}/p3-explain.png`, fullPage: true });

  // スマホの幅：1台ずつ表示し、下のボタンで切り替える
  const m = await mk({ width: 390, height: 844 });
  await m.goto(PAGE); await m.screenshot({ path: `${OUT}/m-home.png`, fullPage: true });
  await m.goto(PAGE + '#/mode'); await m.screenshot({ path: `${OUT}/m-mode.png`, fullPage: true });
  await start(m, 'phishing'); await wait(m, 2400); await m.screenshot({ path: `${OUT}/m-p1-lock.png` });
  await m.click('[data-vm="switch"][data-to="pc"]'); await wait(m, 200); await m.screenshot({ path: `${OUT}/m-p1-pc.png` });
  await m.click('[data-vm="zoom"]'); await wait(m, 200); await m.screenshot({ path: `${OUT}/m-p1-pczoom.png` }); console.log('  拡大の横スクロール:', await m.$eval('.vm-stage', (s) => s.scrollWidth > s.clientWidth && s.scrollLeft === 0 ? '左端から見られる' : 'NG'));
  await m.click('[data-vm="switch"][data-to="phone"]');
  await m.click('.vm-phone [data-vm="note"]'); await act(m, 'tap-link'); await m.screenshot({ path: `${OUT}/m-p1-fake.png` });
  await act(m, 'close-fake'); console.log('①m', await finish(m, '見抜けた'));
  await start(m, 'support-scam'); await act(m, 'tap-ad'); await wait(m, 300);
  await m.screenshot({ path: `${OUT}/m-p3-warning.png` });
  const dot = await m.$eval('[data-to="phone"]', (b) => b.className); console.log('  スマホのボタン:', dot);
  await m.click('.fs-hold', { delay: 1200 }); await wait(m, 200); console.log('  全画面:', await m.$('.pc-fs') ? 'まだ全画面' : '終わった');
  await b.close();
  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'エラーなし');
  if (errors.length) process.exit(1);
})().catch((e) => { console.error('FAILED', e.message); console.log(errors.join('\n')); process.exit(1); });
