/*
 * 詐欺シミュ プロトタイプ：アプリの画面と画面の切り替え（#/ のあとの名前で切り替える）
 *   #/            ホーム（P01）
 *   #/mode        モード選択（P04）
 *   #/start/<id>  詐欺シミュ開始画面（P05）
 *   #/play/<id>   仮想環境（P06）
 *   #/result/<id> 結果：見抜けた！／被害の「その後」（P07・P08）
 *   #/explain/<id> 解説（P09）
 *   #/help        相談先（P15）
 * ログイン・テスト・みんなの結果は、このプロトタイプには入れていない（Django で作る）。
 */
(function () {
  'use strict';
  const S = window.SagiSim; const esc = S.esc;
  const page = document.getElementById('page');
  const vmRoot = document.getElementById('vm-root');
  let vm = null;

  /* ブラウザの中だけに置く記録（このブラウザを閉じると消える）。使えないときは記録しない */
  const store = {
    get(k, d) { try { const v = sessionStorage.getItem('sagisim:' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { sessionStorage.setItem('sagisim:' + k, JSON.stringify(v)); } catch (e) { /* 記録できなくても続ける */ } },
  };
  const pref = {
    get(k, d) { try { const v = localStorage.getItem('sagisim:' + k); return v == null ? d : v; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('sagisim:' + k, v); } catch (e) { /* 記録できなくても続ける */ } },
  };
  const memory = { result: {} }; // 記録できないブラウザ用

  /* 文字の大きさ（標準／大） */
  const sizeBtns = document.querySelectorAll('[data-textsize]');
  function setSize(v) {
    document.documentElement.classList.toggle('text-lg', v === 'lg');
    sizeBtns.forEach((b) => b.setAttribute('aria-pressed', b.dataset.textsize === v ? 'true' : 'false'));
    pref.set('textsize', v);
  }
  sizeBtns.forEach((b) => b.addEventListener('click', () => setSize(b.dataset.textsize)));
  setSize(pref.get('textsize', 'md'));

  function setNav(name) {
    const map = { '': 'home', mode: 'mode', start: 'mode', result: 'mode', explain: 'mode', help: 'help' };
    document.querySelectorAll('.site-nav a').forEach((a) => {
      if (a.dataset.nav === map[name]) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
  }
  const scenarioList = () => S.order.map((id) => S.scenarios[id]);
  const resultOf = (id) => store.get('result:' + id, null) || memory.result[id] || null;

  /* ===== ホーム ===== */
  function renderHome() {
    document.title = '詐欺シミュ（プロトタイプ）';
    page.innerHTML = `<div class="wrap">
      <section class="hero-box">
        <div><h1>実際にあるネット犯罪を<br>体験して防ごう</h1>
          <p>詐欺シミュは、だまされた「その後」まで体験できるWebアプリです。ブラウザの中の<b>仮想スマホ</b>と<b>仮想パソコン</b>を使い分けて、本物そっくりの詐欺を見抜く練習をします。</p>
          <div class="btn-row" style="margin-top:16px"><a class="btn btn-main btn-lg" href="#/mode">体験をはじめる</a><a class="btn btn-sub" href="#/help">相談先を見る</a></div></div>
        <div class="hero-art" aria-hidden="true"><div class="pcmini"></div><div class="phmini"></div></div>
      </section>
      <div class="steps3">
        <div class="st"><b>1</b><h2 class="h5 fw-bold">詐欺の場面を選んで体験</h2><p class="mb-0">フィッシング・偽通販・サポート詐欺の3つから選びます。</p></div>
        <div class="st"><b>2</b><h2 class="h5 fw-bold">だまされたら「その後」へ</h2><p class="mb-0">カードの不正利用や、届かない商品など、被害のその後まで体験します。</p></div>
        <div class="st"><b>3</b><h2 class="h5 fw-bold">解説で見抜き方を学ぶ</h2><p class="mb-0">どこを見ればよかったか、だまされたときの連絡先を確かめます。</p></div>
      </div>
      <div class="notice"><b>これは練習用です。</b>出てくる会社・サイト・アプリはすべて架空です。入力欄には練習用の値が入っていて、入力した内容は保存も送信もしません。ログインしなくても、すべて体験できます。</div>
    </div>`;
  }

  /* ===== モード選択 ===== */
  function renderMode() {
    document.title = '体験する詐欺を選ぶ｜詐欺シミュ';
    page.innerHTML = `<div class="wrap"><h1 class="page-h">体験する詐欺を選ぶ</h1><p class="page-lead">どれから体験してもかまいません。1つ3〜5分です。</p>
      <div class="modes">${scenarioList().map((sc) => {
        const r = resultOf(sc.id); const e = r && sc.endings[r.ending];
        const badge = e ? `<span class="done-badge ${e.type === 'ng' ? 'ng' : ''}">体験済み：${e.type === 'ok' ? '見抜けた' : e.type === 'ng' ? 'だまされた' : 'やめた'}</span>` : '';
        return `<article class="mode-card"><div class="top" style="background:${sc.color}"></div><div class="bd">
          <h2>${esc(sc.no)} ${esc(sc.title)}${badge}</h2>
          <div class="meta"><b>入口：</b>${esc(sc.entry)}<br><b>学べること：</b>${esc(sc.learn)}<br><b>時間：</b>${esc(sc.minutes)}</div>
          <a class="btn btn-main go" href="#/start/${sc.id}">この詐欺を体験する</a></div></article>`;
      }).join('')}</div></div>`;
  }

  /* ===== 詐欺シミュ開始画面 ===== */
  function renderStart(sc) {
    document.title = `${sc.no} ${sc.title}をはじめる｜詐欺シミュ`;
    const sound = pref.get('sound', 'off');
    page.innerHTML = `<div class="wrap"><h1 class="page-h">${esc(sc.no)} ${esc(sc.title)}</h1><p class="page-lead">${esc(sc.entry)}</p>
      <section class="panel"><h2 class="h5 fw-bold">これから起きること</h2><p class="situation mb-1">${esc(sc.situation)}</p><span class="mission">ミッション：${esc(sc.mission)}</span></section>
      <section class="panel"><h2 class="h5 fw-bold">使うもの</h2><p class="mb-2">${esc(sc.devices)}</p>
        <ul class="list-dot"><li>パソコンやタブレットでは、仮想パソコンと仮想スマホが並んで出ます。スマホでは、下のボタンで切り替えます。</li>
        <li>スマホの下の白い線を押すと、ホーム画面に戻ります。</li>
        <li>迷ったら上の「ヒント」で、見るとよい場所が光ります。いつでも「やめる」でやめられます。</li></ul></section>
      <section class="panel"><h2 class="h5 fw-bold">音</h2><p class="mb-2">警告音などを出すかどうかを選んでください。</p>
        <div class="sound" role="radiogroup" aria-label="音">
          <label><input type="radio" name="sound" value="off" ${sound !== 'on' ? 'checked' : ''}>音を出さない</label>
          <label><input type="radio" name="sound" value="on" ${sound === 'on' ? 'checked' : ''}>音を出す</label></div></section>
      <div class="notice"><b>これは練習用です。</b>出てくる会社・サイト・電話番号はすべて架空で、本物の情報は入力しません。</div>
      <div class="btn-row"><button type="button" class="btn btn-main btn-lg" id="start">はじめる</button><a class="btn btn-sub" href="#/mode">ほかの詐欺を選ぶ</a></div></div>`;
    document.getElementById('start').addEventListener('click', () => {
      const v = (page.querySelector('input[name=sound]:checked') || {}).value || 'off';
      pref.set('sound', v);
      if (v === 'on') S.unlockAudio();
      location.hash = '#/play/' + sc.id;
    });
  }

  /* ===== 仮想環境 ===== */
  function play(sc) {
    document.title = `練習中：${sc.no} ${sc.title}｜詐欺シミュ`;
    document.body.classList.add('playing');
    page.innerHTML = '';
    vm = new S.VM(vmRoot, sc, {
      sound: pref.get('sound', 'off') === 'on',
      onEnd: (r) => { memory.result[sc.id] = r; store.set('result:' + sc.id, r); },
      onResult: () => { location.hash = '#/result/' + sc.id; },
    });
  }

  /* ===== 結果 ===== */
  function renderResult(sc) {
    const r = resultOf(sc.id);
    if (!r) { location.replace('#/start/' + sc.id); return; }
    const e = sc.endings[r.ending] || sc.endings.quit;
    document.title = `結果：${e.title}｜詐欺シミュ`;
    const tag = { check: ['check', '調べた'], decide: ['decide', '決めた'], hint: ['hint', 'ヒント'] };
    const dev = { phone: 'スマホ', pc: 'パソコン' };
    const checks = r.log.filter((l) => l.kind === 'check').length;
    page.innerHTML = `<div class="wrap">
      <section class="result ${e.type}"><div class="small fw-bold mb-1">${esc(sc.no)} ${esc(sc.title)}の結果</div><h1>${esc(e.title)}</h1>
        <p class="mt-2">${e.short || ''}</p>${e.after ? `<p class="mt-2">${e.type === 'ng' ? '<b>その後：</b>' : ''}${e.after}</p>` : ''}</section>
      <h2 class="sec-h">あなたの行動</h2>
      <div class="panel"><p class="mb-2">「調べる」操作をした回数：<b>${checks}回</b></p>
        <ol class="actlog">${r.log.length ? r.log.map((l) => `<li><span class="tag ${tag[l.kind][0]}">${tag[l.kind][1]}</span>${l.dev ? `<span class="tag dev">${dev[l.dev]}</span>` : ''}<span>${esc(l.label)}</span></li>`).join('') : '<li>記録はありません</li>'}</ol></div>
      <div class="btn-row"><a class="btn btn-main btn-lg" href="#/explain/${sc.id}">解説を見る</a><a class="btn btn-sub" href="#/start/${sc.id}">もう一度体験する</a></div></div>`;
  }

  /* ===== 解説 ===== */
  function pointHTML(sc, p, good) {
    const scr = sc.screens[p.screen];
    return `<div class="point ${scr.dev === 'pc' ? 'pc' : ''}"><div class="fig">${S.renderStatic(sc, p.screen, { flags: { warned: true, shopSeen: true, ordered: true } })}</div>
      <ol>${p.items.map((t, i) => { const g = good || t.startsWith('✓'); return `<li><span class="pnum ${g ? 'good' : ''}">${i + 1}</span><span>${t.replace(/^✓/, '')}</span></li>`; }).join('')}</ol></div>`;
  }
  function contactsHTML() {
    return `<div class="contact-grid">${S.contacts.map((c) => `<div class="contact"><div class="fw-bold">${esc(c.name)}</div><div class="ctel">${esc(c.tel)}</div><p>${esc(c.note)}</p></div>`).join('')}</div>`;
  }
  function renderExplain(sc) {
    const x = sc.explain;
    document.title = `解説：${sc.no} ${sc.title}｜詐欺シミュ`;
    page.innerHTML = `<div class="wrap"><h1 class="page-h">解説：${esc(sc.no)} ${esc(sc.title)}</h1>
      <p class="page-lead">体験した画面に、見るとよかった場所の印を付けました。<span style="color:#d93025;font-weight:700">赤い番号</span>＝見抜くポイント、<span style="color:#1e8e3e;font-weight:700">緑の番号</span>＝確かめると分かること です。</p>
      <h2 class="sec-h">見抜くポイント</h2>${x.points.map((p) => pointHTML(sc, p, false)).join('')}
      <h2 class="sec-h">もう1台で確かめる</h2>${x.checks.map((p) => pointHTML(sc, p, true)).join('')}
      <h2 class="sec-h">こうすれば防げる</h2><div class="panel"><ul class="list-dot">${x.prevent.map((t) => `<li>${t}</li>`).join('')}</ul></div>
      <h2 class="sec-h">だまされてしまったら</h2><div class="panel"><ul class="list-dot">${x.ifScammed.map((t) => `<li>${t}</li>`).join('')}</ul></div>
      <h3 class="h5 fw-bold mt-4 mb-3">相談先（本物の窓口）</h3>${contactsHTML()}
      <div class="btn-row"><a class="btn btn-main btn-lg" href="#/mode">ほかの詐欺も体験する</a><a class="btn btn-sub" href="#/start/${sc.id}">もう一度体験する</a></div></div>`;
    S.fitMinis(page);
  }

  /* ===== 相談先 ===== */
  function renderHelp() {
    document.title = '相談先｜詐欺シミュ';
    page.innerHTML = `<div class="wrap"><h1 class="page-h">相談先</h1><p class="page-lead">だまされたかもしれないとき、迷ったときの相談先です。この画面の番号は本物です（2026年11月19日に公式の情報で確かめました）。</p>
      ${contactsHTML()}
      <div class="panel mt-3"><h2 class="h5 fw-bold">ほかにも</h2><ul class="list-dot">
        <li>カードを使われたかもしれないとき：カードの裏にある電話番号から、カード会社に連絡する</li>
        <li>お金を振り込んでしまったとき：振込先の銀行と、警察に連絡する</li>
        <li>事件・事故で緊急のとき：110番</li></ul></div></div>`;
  }

  function route() {
    if (vm) { vm.destroy(); vm = null; vmRoot.innerHTML = ''; document.body.classList.remove('playing'); }
    const parts = (location.hash || '#/').replace(/^#\/?/, '').split('/');
    const name = parts[0] || ''; const sc = parts[1] && S.scenarios[parts[1]];
    setNav(name);
    if (name === 'mode') renderMode();
    else if (name === 'start' && sc) renderStart(sc);
    else if (name === 'play' && sc) play(sc);
    else if (name === 'result' && sc) renderResult(sc);
    else if (name === 'explain' && sc) renderExplain(sc);
    else if (name === 'help') renderHelp();
    else renderHome();
    if (name !== 'play') { window.scrollTo(0, 0); document.getElementById('main').focus({ preventScroll: true }); }
  }
  window.addEventListener('hashchange', route);
  window.addEventListener('resize', () => { if (!vm) S.fitMinis(page); });
  route();
})();
