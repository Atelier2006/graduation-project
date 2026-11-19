// node prototype/tests/virtual-web.js（Playwright Chromium が必要）
const assert = require('node:assert/strict');
const path = require('node:path');
const {pathToFileURL} = require('node:url');
const {chromium} = require('playwright');
const url = pathToFileURL(path.resolve(__dirname, '../index.html')).href;

async function run(browser) {
  const page = await browser.newPage({viewport:{width:1440,height:900}});
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', req => { if (/^https?:/.test(req.url())) errors.push(req.url()); });
  const pc = page.locator('.vm-pc');
  const phone = page.locator('.vm-phone');
  async function search(device, text) {
    const input = device.locator('.vw-search input');
    await input.fill(text);
    await input.press('Enter');
  }
  async function start(id) {
    await page.goto(url + '#/start/' + id);
    await page.locator('#start').click();
  }
  await start('phishing');
  await search(pc,'ﾊｼﾚ運輸');
  await pc.locator('[data-doc=delivery]').click();
  await pc.locator('[name=number]').fill('1234-5678-9012');
  await pc.locator('[data-tracking] button').click();
  assert.match(await pc.locator('[role=status]').innerText(),/配達完了/);
  await pc.locator('[data-vm=find]').click();
  await pc.locator('.vw-find input').fill('荷物');
  assert.ok(await pc.locator('mark.vw-match').count()>1);
  await pc.getByRole('button',{name:'次の一致'}).click();
  assert.match(await pc.locator('.vw-find [role=status]').innerText(),/^2/);
  await pc.getByRole('button',{name:'検索を閉じる'}).click();
  await pc.getByRole('button',{name:'会員ページ・ログイン'}).click();
  await pc.locator('[data-web-action=login]').click();
  await pc.locator('[data-web-action=delivery]').click();
  assert.match(await pc.locator('[data-web-action=delivery]').innerText(),/玄関前/);
  await pc.locator('[data-vm=reload]').click();
  await pc.locator('[data-web-action=logout]').click();
  await pc.locator('[data-web-action=login]').waitFor();

  await pc.locator('.newtab').click();
  await search(pc,'<no-match>');
  assert.match(await pc.locator('.vw-hits').innerText(),/0件/);
  await pc.locator('[data-back]').click();
  await pc.locator('[data-vm=forward]').click();
  assert.equal(await pc.locator('input[name=q]').inputValue(),'<no-match>');

  await start('fake-shop');
  await pc.locator('[data-act=open-shop]').click();
  await pc.locator('[data-shoe=color][data-value=navy]').click();
  await pc.locator('[data-shoe=size][data-value="26.0"]').click();
  await pc.locator('[data-act=add-cart]').click();
  assert.match(await pc.locator('.vm-info').innerText(),/ネイビー \/ 26.0/);
  await pc.locator('[data-act=remove-cart]').click();
  assert.match(await pc.locator('.vm-info').innerText(),/商品はありません/);
  await pc.locator('[data-vm=info-close]').click();
  await pc.locator('[data-act=order]').click();
  assert.match(await pc.locator('.ky-done-r').innerText(),/ネイビー \/ 26.0/);

  await page.setViewportSize({width:390,height:844});
  await start('phishing');
  await phone.locator('[data-vm=unlock]').click();
  await phone.locator('[data-app=browser]').click();
  await search(phone,'スニーカー');
  await phone.getByRole('button',{name:'画像',exact:true}).click();
  assert.ok(await phone.locator('.vw-hit img').count()>=2);
  await phone.locator('[data-doc=navy]').click();
  await phone.getByRole('button',{name:'マイページ',exact:true}).click();
  await phone.locator('[data-web-action=login]').click();
  assert.match(await phone.locator('.vw-account').innerText(),/注文履歴/);
  await phone.locator('[data-vm=find]').click();
  await phone.locator('.vw-find input').fill('注文');
  assert.equal(await phone.locator('.vw-match').count(),1);
  assert.ok(await phone.locator('.mb-page').evaluate(e=>e.scrollWidth<=e.clientWidth+1));
  await start('phishing');
  await phone.locator('[data-vm=unlock]').click();
  await phone.locator('[data-app=browser]').click();
  await phone.locator('[data-doc=shoes]').click();
  await phone.getByRole('button',{name:'マイページ',exact:true}).click();
  await phone.locator('[data-web-action=login]').waitFor();
  assert.deepEqual(errors,[]);
  await page.close();
}
module.exports = run;
if (require.main === module) (async () => {
  const browser=await chromium.launch();
  try { await run(browser); console.log('仮想Webの操作テスト OK'); }
  finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});
