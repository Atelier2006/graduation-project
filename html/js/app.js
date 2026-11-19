/*
 * 詐欺シミュ HTML版：サーバーなしで動く画面（index.html をダブルクリックして開く）
 *
 * 画面は # のあとの名前で切り替える。
 *   #/              ホーム
 *   #/mode          体験を選ぶ
 *   #/start/<id>    開始
 *   #/play/<id>     仮想環境
 *   #/result/<番号> 結果
 *   #/explain/<id>  解説
 *   #/test          力だめしテスト（#/test/pre・#/test/post で受ける、#/test/result/<番号> で結果）
 *   #/survey        アンケート
 *   #/stats         みんなの結果（このブラウザで体験した人の結果）
 *   #/records       自分の記録
 *   #/help          相談先
 *
 * 記録は、このブラウザの localStorage にだけ置く（サーバーには送らない）。入力した文字は残さない。
 * 会員登録・ランキングは Django 版だけにある。
 */
(function () {
  'use strict';
  const S = window.SagiSim; const esc = S.esc; const D = S.data;
  const page = document.getElementById('page');
  const vmRoot = document.getElementById('vm-root');
  let vm = null;

  /* ===== 記録（このブラウザの中だけ）。使えないブラウザでは、ページを閉じるまで覚える ===== */
  const KEY = 'sagisim:html:';
  const mem = {};
  const db = {
    get(name) {
      try { const v = localStorage.getItem(KEY + name); if (v) return JSON.parse(v); } catch (e) { /* 読めないときは mem を使う */ }
      return mem[name] || [];
    },
    set(name, list) {
      mem[name] = list;
      try { localStorage.setItem(KEY + name, JSON.stringify(list)); } catch (e) { /* 保存できなくても続ける */ }
    },
    add(name, item) {
      const list = db.get(name);
      item.id = list.reduce((m, x) => Math.max(m, x.id), 0) + 1; item.at = Date.now();
      list.push(item); db.set(name, list.slice(-1000));
      return item;
    },
    find(name, id) { return db.get(name).find((x) => x.id === id) || null; },
    clear() { ['plays', 'tests', 'surveys'].forEach((n) => { delete mem[n]; try { localStorage.removeItem(KEY + n); } catch (e) { /* なにもしない */ } }); },
  };
  const pref = {
    get(k, d) { try { const v = localStorage.getItem('sagisim:' + k); return v == null ? d : v; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('sagisim:' + k, v); } catch (e) { /* 覚えられなくても続ける */ } },
  };

  /* ===== 共通 ===== */
  const KIND = { ok: '見抜けた', ng: 'だまされた', quit: '途中でやめた' };
  const PHASE = { pre: '体験の前', post: '体験の後' };
  const pct = (n, total) => (total ? Math.round((n * 100) / total) : 0);
  const two = (n) => String(n).padStart(2, '0');
  const date = (t, long) => { const d = new Date(t); return long ? `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${two(d.getHours())}:${two(d.getMinutes())}` : `${d.getMonth() + 1}/${d.getDate()} ${two(d.getHours())}:${two(d.getMinutes())}`; };
  const scenarioList = () => S.order.map((id) => S.scenarios[id]);
  const scene = (id) => D.scenes[id] || {};
  const kindOf = (p) => { const sc = S.scenarios[p.scenario]; const e = sc && sc.endings[p.ending]; return e ? e.type : 'quit'; };
  const latest = (list) => list.reduce((a, b) => (!a || b.at >= a.at ? b : a), null);
  const lastPlay = (id) => latest(db.get('plays').filter((p) => p.scenario === id));
  const latestTest = (phase) => latest(db.get('tests').filter((t) => t.phase === phase));
  const bar = (cls, w) => `<i class="${cls}" style="width:${w}%"></i>`;
  const pair = (label, cls, w, value) => `<div class="pair"><span>${label}</span><div class="bar thin">${bar(cls, w)}</div><b>${value}</b></div>`;

  /* 文字の大きさ */
  const sizeBtns = document.querySelectorAll('[data-textsize]');
  function setSize(v) {
    document.documentElement.classList.toggle('text-lg', v === 'lg');
    sizeBtns.forEach((b) => b.setAttribute('aria-pressed', b.dataset.textsize === v ? 'true' : 'false'));
    pref.set('textsize', v);
  }
  sizeBtns.forEach((b) => b.addEventListener('click', () => setSize(b.dataset.textsize)));
  setSize(pref.get('textsize', 'md'));
  document.querySelector('.skip').addEventListener('click', (e) => { e.preventDefault(); document.getElementById('main').focus(); });

  function setNav(name) {
    const map = { '': 'home', mode: 'mode', start: 'mode', result: 'mode', explain: 'mode', test: 'test', survey: 'test', stats: 'stats', help: 'help', records: 'records' };
    document.querySelectorAll('[data-nav]').forEach((a) => {
      if (a.dataset.nav === map[name]) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
  }

  function cards(learning) {
    return `<div class="list1">${scenarioList().map((sc) => {
      const s = scene(sc.id); const last = lastPlay(sc.id);
      return `<article class="list"><img class="scene-photo" src="${S.IMG}${esc(s.photo)}" alt="">
        <div class="list-body"><div class="scene-meta"><span>${esc(sc.no)} ${esc(sc.title)}</span><span>${esc(sc.minutes)}</span></div>
        <h3><a href="#/start/${sc.id}">${esc(s.scene_title)}</a></h3><p>${esc(learning ? sc.learn : s.summary)}</p>
        ${last ? `<small class="progress-note">前回の結果　${KIND[kindOf(last)]}</small>` : ''}</div></article>`;
    }).join('')}</div>`;
  }
  const contactsHTML = () => `<div class="contact-grid">${S.contacts.map((c) => `<div class="contact"><div class="fw-bold">${esc(c.name)}</div><div class="ctel">${esc(c.tel)}</div><p>${esc(c.note)}</p></div>`).join('')}</div>`;
  const localNote = '<div class="notice">記録は、このブラウザの中だけに残ります（どこにも送りません）。「自分の記録」のページで消せます。</div>';

  /* ===== ホーム・体験を選ぶ ===== */
  function renderHome() {
    document.title = '詐欺シミュ｜ネット犯罪体験教材';
    page.innerHTML = `<section class="mainimg">
      <div class="text"><h1>ネット詐欺を、<br>体験して学ぶ。</h1>
      <p>宅配のSMS、ネット通販、突然の警告。<br>身近な場面を仮想のスマホとパソコンで体験し、<wbr>自分の判断を振り返ってみましょう。</p>
      <div class="btn-container"><a class="btn btn-main" href="#/mode">体験をはじめる <span aria-hidden="true">→</span></a></div></div>
      <div class="image"><img src="${S.IMG}desk.jpg" width="1200" height="800" alt="机の上でパソコンとスマートフォンを使う人"></div></section>
      <div class="wrap home-sections">
      <section><h2 class="section-title">どの場面を体験しますか？</h2>${cards(false)}</section>
      <aside class="notice"><b>体験の前に</b>検索欄に好きな言葉を入力できます。サイトへのログインは体験用会員を選ぶだけです。だまされた場合は、その後に何が起きるかも体験できます。最後に、自分が選んだ行動と見抜くポイントを確認しましょう。</aside>
      <section class="home-more">
        <a class="more-card" href="#/test"><b>力だめしテスト</b><span>体験の前と後に同じ10問を解いて、正答率がどれだけ上がるか確かめます。</span></a>
        <a class="more-card" href="#/stats"><b>みんなの結果</b><span>このパソコンで体験した人が、どこで見抜き、どこでだまされたかを見られます。</span></a>
        <a class="more-card" href="#/records"><b>自分の記録</b><span>体験した記録とテストの結果を見返せます。</span></a>
      </section></div>`;
  }
  function renderMode() {
    document.title = '体験を選ぶ｜詐欺シミュ';
    page.innerHTML = `<div class="wrap"><h1 class="page-h">体験を選ぶ</h1><p class="page-lead">1つの体験は3〜5分です。各場面で確かめられることを紹介します。</p>${cards(true)}
      <p class="mt-4 small text-secondary">体験の前に<a href="#/test/pre">体験の前のテスト</a>を受けておくと、体験のあとでどれだけ見抜けるようになったかを比べられます。</p></div>`;
  }

  /* ===== 開始 ===== */
  function renderStart(sc) {
    const s = scene(sc.id);
    document.title = `${sc.no} ${sc.title}をはじめる｜詐欺シミュ`;
    const sound = pref.get('sound', 'off');
    page.innerHTML = `<div class="wrap"><div class="start-intro"><div><p class="scene-kind">${esc(sc.title)}　／　${esc(sc.minutes)}</p><h1 class="page-h">${esc(s.scene_title)}</h1><p class="page-lead">${esc(sc.entry)}</p></div><img src="${S.IMG}${esc(s.photo)}" alt=""></div>
      <section class="panel"><h2 class="h5 fw-bold">これから起きること</h2><p class="situation mb-1">${esc(sc.situation)}</p><span class="mission">ミッション：${esc(sc.mission)}</span></section>
      <section class="panel"><h2 class="h5 fw-bold">使うもの</h2><p class="mb-2">${esc(sc.devices)}</p>
        <ul class="list-dot"><li>パソコンやタブレットでは、仮想パソコンと仮想スマホが並んで出ます。スマホでは、下のボタンで切り替えます。</li>
        <li>スマホの下の白い線を押すと、ホーム画面に戻ります。</li>
        <li>迷ったら上の「ヒント」で、見るとよい場所が光ります。いつでも「やめる」でやめられます。</li></ul></section>
      <section class="panel"><h2 class="h5 fw-bold">音</h2><p class="mb-2">警告音などを出すかどうかを選んでください。</p>
        <div class="sound" role="radiogroup" aria-label="音">
          <label><input type="radio" name="sound" value="off" ${sound !== 'on' ? 'checked' : ''}>音を出さない</label>
          <label><input type="radio" name="sound" value="on" ${sound === 'on' ? 'checked' : ''}>音を出す</label></div></section>
      <div class="notice"><b>これは練習用です。</b>出てくる会社・サイト・電話番号はすべて架空で、本物の情報は入力しません。体験した行動の記録（どこを調べ、何を選んだか）だけを、このブラウザの中に残します。</div>
      <div class="btn-row"><button type="button" class="btn btn-main btn-lg" id="start">はじめる</button><a class="btn btn-sub" href="#/mode">ほかの詐欺を選ぶ</a></div></div>`;
    document.getElementById('start').addEventListener('click', () => {
      const v = (page.querySelector('input[name=sound]:checked') || {}).value || 'off';
      pref.set('sound', v);
      if (v === 'on' && S.unlockAudio) S.unlockAudio();
      location.hash = '#/play/' + sc.id;
    });
  }

  /* ===== 仮想環境 ===== */
  function play(sc) {
    document.title = `練習中：${sc.no} ${sc.title}｜詐欺シミュ`;
    document.body.classList.add('playing');
    page.innerHTML = '';
    let saved = null;
    vm = new S.VM(vmRoot, sc, {
      sound: pref.get('sound', 'off') === 'on',
      onEnd: (r) => {
        const log = (r.log || []).filter((l) => ['check', 'decide', 'hint'].includes(l.kind)).slice(0, 200)
          .map((l) => ({ kind: l.kind, label: String(l.label || '').slice(0, 120), dev: l.dev === 'phone' || l.dev === 'pc' ? l.dev : '' }));
        saved = db.add('plays', { scenario: sc.id, ending: sc.endings[r.ending] ? r.ending : 'quit', log });
      },
      onResult: () => { location.hash = saved ? '#/result/' + saved.id : '#/explain/' + sc.id; },
    });
  }

  /* ===== 結果 ===== */
  function renderResult(id) {
    const p = db.find('plays', id); const sc = p && S.scenarios[p.scenario];
    if (!sc) { renderMissing('この結果は見つかりませんでした。記録を消したか、別のブラウザで体験した結果です。'); return; }
    const e = sc.endings[p.ending] || sc.endings.quit;
    document.title = `結果：${e.title}｜詐欺シミュ`;
    const tag = { check: '調べた', decide: '決めた', hint: 'ヒント' }; const dev = { phone: 'スマホ', pc: 'パソコン' };
    const count = (k) => p.log.filter((l) => l.kind === k).length;
    page.innerHTML = `<div class="wrap">
      <section class="result ${e.type}"><div class="small fw-bold mb-1">${esc(sc.no)} ${esc(sc.title)}の結果　<span class="text-secondary fw-normal">${date(p.at, true)}</span></div><h1>${esc(e.title)}</h1>
        <p class="mt-2">${e.short || ''}</p>${e.after ? `<p class="mt-2">${e.type === 'ng' ? '<b>その後：</b>' : ''}${e.after}</p>` : ''}</section>
      <h2 class="sec-h">あなたの行動</h2>
      <div class="panel"><p class="mb-2">「調べる」操作をした回数：<b>${count('check')}回</b>　／　ヒント：${count('hint')}回</p>
        <ol class="actlog">${p.log.length ? p.log.map((l) => `<li><span class="tag ${l.kind}">${tag[l.kind]}</span>${l.dev ? `<span class="tag dev">${dev[l.dev]}</span>` : ''}<span>${esc(l.label)}</span></li>`).join('') : '<li>記録はありません</li>'}</ol></div>
      <div class="btn-row"><a class="btn btn-main btn-lg" href="#/explain/${sc.id}">解説を見る</a><a class="btn btn-sub" href="#/start/${sc.id}">もう一度体験する</a><a class="btn btn-sub" href="#/stats">みんなの結果を見る</a></div></div>`;
  }

  /* ===== 解説 ===== */
  function renderExplain(sc) {
    const x = sc.explain;
    document.title = `解説：${sc.no} ${sc.title}｜詐欺シミュ`;
    const point = (p, good) => {
      const scr = sc.screens[p.screen];
      return `<div class="point ${scr.dev === 'pc' ? 'pc' : ''}"><div class="fig">${S.renderStatic(sc, p.screen, { flags: { warned: true, shopSeen: true, ordered: true, dialed: true } })}</div>
        <ol>${p.items.map((t, i) => { const g = good || t.startsWith('✓'); return `<li><span class="pnum ${g ? 'good' : ''}">${i + 1}</span><span>${t.replace(/^✓/, '')}</span></li>`; }).join('')}</ol></div>`;
    };
    page.innerHTML = `<div class="wrap"><h1 class="page-h">解説：${esc(sc.no)} ${esc(sc.title)}</h1>
      <p class="page-lead">体験した画面に、見るとよかった場所の印を付けました。<span class="mark-red">赤い番号</span>＝見抜くポイント、<span class="mark-green">緑の番号</span>＝確かめると分かること です。</p>
      <h2 class="sec-h">見抜くポイント</h2>${x.points.map((p) => point(p, false)).join('')}
      <h2 class="sec-h">もう1台で確かめる</h2>${x.checks.map((p) => point(p, true)).join('')}
      <h2 class="sec-h">こうすれば防げる</h2><div class="panel"><ul class="list-dot">${x.prevent.map((t) => `<li>${t}</li>`).join('')}</ul></div>
      <h2 class="sec-h">だまされてしまったら</h2><div class="panel"><ul class="list-dot">${x.ifScammed.map((t) => `<li>${t}</li>`).join('')}</ul></div>
      <h3 class="h5 fw-bold mt-4 mb-3">相談先（本物の窓口）</h3>${contactsHTML()}
      <div class="btn-row"><a class="btn btn-main btn-lg" href="#/mode">ほかの詐欺も体験する</a><a class="btn btn-sub" href="#/start/${sc.id}">もう一度体験する</a><a class="btn btn-sub" href="#/test">力だめしテスト</a></div></div>`;
    S.fitMinis(page);
  }

  /* ===== 力だめしテスト ===== */
  function renderTestIndex() {
    document.title = '力だめしテスト｜詐欺シミュ';
    const pre = latestTest('pre'), post = latestTest('post'), surveyed = db.get('surveys').length > 0;
    const last = (t) => (t ? `前回 ${t.score}/${t.total}点（${date(t.at)}）` : 'まだ受けていません');
    page.innerHTML = `<div class="wrap"><h1 class="page-h">力だめしテスト</h1>
      <p class="page-lead">同じ${D.questions.length}問を、体験の<b>前</b>と<b>後</b>に解きます。点数を比べると、体験でどれだけ見抜けるようになったかが分かります。問題と選択肢の順番は、受けるたびに入れ替わります。</p>
      <div class="quiz-steps">
        <a class="panel qstep" href="#/test/pre"><span class="qnum">1</span><div><b>体験の前のテスト</b><small>${last(pre)}</small></div><span class="go">受ける →</span></a>
        <a class="panel qstep" href="#/mode"><span class="qnum">2</span><div><b>3つのシナリオを体験する</b><small>フィッシング・偽通販・サポート詐欺</small></div><span class="go">選ぶ →</span></a>
        <a class="panel qstep" href="#/test/post"><span class="qnum">3</span><div><b>体験の後のテスト</b><small>${last(post)}</small></div><span class="go">受ける →</span></a>
        <a class="panel qstep" href="#/survey"><span class="qnum">4</span><div><b>アンケートに答える</b><small>${surveyed ? '答えてくれてありがとうございます' : '1分で終わります'}</small></div><span class="go">答える →</span></a>
      </div>${localNote}</div>`;
  }

  function shuffle(list) { const a = list.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

  function renderTake(phase) {
    document.title = `${PHASE[phase]}のテスト｜詐欺シミュ`;
    const qs = shuffle(D.questions).map((q) => ({ ...q, choices: shuffle(q.choices) }));
    page.innerHTML = `<div class="wrap narrow"><nav class="trail" aria-label="現在地"><a href="#/test">力だめしテスト</a><span>${PHASE[phase]}のテスト</span></nav>
      <h1 class="page-h">${PHASE[phase]}のテスト</h1>
      <p class="page-lead">全${qs.length}問です。いちばん正しいと思うものを1つ選んでください。${phase === 'pre' ? '分からなくても大丈夫。今の自分の考えで選びましょう。' : ''}</p>
      <div class="alert alert-danger" id="quiz-error" role="alert" hidden></div>
      <form class="quiz" novalidate>${qs.map((q, i) => `<fieldset class="panel qbox" id="${q.id}"><legend><span class="qno">問${i + 1}</span>${esc(q.text)}</legend>
        ${q.choices.map((c) => `<label class="qchoice"><input type="radio" name="${q.id}" value="${c.id}"><span>${esc(c.text)}</span></label>`).join('')}</fieldset>`).join('')}
        <div class="btn-row"><button type="submit" class="btn btn-main btn-lg">答え合わせをする</button><a class="btn btn-sub" href="#/test">やめる</a></div></form></div>`;
    const form = page.querySelector('form');
    form.addEventListener('change', (e) => { const box = e.target.closest('.qbox'); if (box) { box.classList.remove('missing'); const m = box.querySelector('.qerr'); if (m) m.remove(); } });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const answers = []; const missing = [];
      qs.forEach((q) => {
        const v = (form.querySelector(`input[name="${q.id}"]:checked`) || {}).value;
        const c = q.choices.find((x) => x.id === v);
        if (c) answers.push({ q: q.id, c: c.id, ok: c.correct }); else missing.push(q.id);
      });
      const err = document.getElementById('quiz-error');
      if (missing.length) {
        missing.forEach((id) => { const box = document.getElementById(id); if (!box.classList.contains('missing')) { box.classList.add('missing'); box.insertAdjacentHTML('beforeend', '<p class="qerr">この問題に答えてください</p>'); } });
        err.textContent = `答えていない問題が${missing.length}問あります。赤い枠の問題を選んでください。`; err.hidden = false;
        document.getElementById(missing[0]).scrollIntoView({ block: 'center' });
        return;
      }
      const t = db.add('tests', { phase, score: answers.filter((a) => a.ok).length, total: qs.length, answers });
      location.hash = '#/test/result/' + t.id;
    });
  }

  function renderAttempt(id) {
    const a = db.find('tests', id);
    if (!a) { renderMissing('このテストの結果は見つかりませんでした。'); return; }
    document.title = 'テストの結果｜詐欺シミュ';
    const other = latestTest(a.phase === 'post' ? 'pre' : 'post');
    const pre = a.phase === 'post' ? other : a, post = a.phase === 'post' ? a : other;
    const rate = pct(a.score, a.total);
    let compare = '';
    if (pre && post) {
      const note = post.score > pre.score ? '（見抜ける問題が増えました）' : post.score === pre.score ? '（同じ点数でした。解説を読み直してみましょう）' : '（前より下がりました。解説をもう一度確かめましょう）';
      compare = `<p class="mt-2">体験の前 <b>${pre.score}点</b> → 体験の後 <b>${post.score}点</b>${note}</p>`;
    }
    const byId = Object.fromEntries(D.questions.map((q) => [q.id, q]));
    const surveyed = db.get('surveys').length > 0;
    const rows = D.questions.map((q) => {
      const ans = a.answers.find((x) => x.q === q.id); if (!ans) return '';
      const mine = byId[q.id].choices.find((c) => c.id === ans.c); const right = q.choices.find((c) => c.correct);
      return `<div class="panel qans ${ans.ok ? 'good' : 'bad'}"><p class="qtext"><span class="qmark" aria-label="${ans.ok ? '正解' : '不正解'}">${ans.ok ? '○' : '×'}</span>${esc(q.text)}</p>
        <p class="qline"><span>あなたの答え</span>${esc(mine ? mine.text : '')}</p>${!ans.ok && right ? `<p class="qline right"><span>正しい答え</span>${esc(right.text)}</p>` : ''}
        <p class="qexp">${esc(q.explanation)}</p></div>`;
    }).join('');
    const next = a.phase === 'pre' ? '<a class="btn btn-main btn-lg" href="#/mode">体験を始める</a>'
      : `${surveyed ? '' : '<a class="btn btn-main btn-lg" href="#/survey">アンケートに答える</a>'}<a class="btn btn-sub" href="#/stats">みんなの結果を見る</a>`;
    page.innerHTML = `<div class="wrap narrow"><nav class="trail" aria-label="現在地"><a href="#/test">力だめしテスト</a><span>${PHASE[a.phase]}のテストの結果</span></nav>
      <section class="result ${rate >= 80 ? 'ok' : rate < 50 ? 'ng' : ''}"><div class="small fw-bold mb-1">${PHASE[a.phase]}のテスト　<span class="text-secondary fw-normal">${date(a.at, true)}</span></div>
        <h1>${a.total}問中 ${a.score}問 正解</h1>${compare}</section>
      <div class="btn-row">${next}<a class="btn btn-sub" href="#/test">テストのページへ</a></div>
      <h2 class="sec-h">答え合わせ</h2>${rows}</div>`;
  }

  /* ===== アンケート ===== */
  const SURVEY = [['clarity', '体験は分かりやすかったですか', '分かりやすさ'], ['tension', '本物のような緊張感がありましたか', '緊張感'],
    ['usefulness', '実際の生活で役に立ちそうですか', '役に立ちそう'], ['again', 'また使いたい・人にすすめたいですか', 'また使いたい']];
  function renderSurvey() {
    document.title = 'アンケート｜詐欺シミュ';
    page.innerHTML = `<div class="wrap narrow"><h1 class="page-h">アンケート</h1>
      <p class="page-lead">教材をよくするために使います。1（そう思わない）〜 5（とてもそう思う）で答えてください。</p>
      <form class="survey" novalidate>${SURVEY.map(([k, label]) => `<fieldset class="panel qbox" id="s-${k}"><legend>${label}</legend>
        <div class="scale">${[1, 2, 3, 4, 5].map((n) => `<label class="scale-pt"><input type="radio" name="${k}" value="${n}"><span>${n}</span></label>`).join('')}</div>
        <div class="scale-ends"><span>そう思わない</span><span>とてもそう思う</span></div></fieldset>`).join('')}
        <div class="panel"><label class="form-label fw-bold" for="s-comment">感想（自由に）</label><textarea id="s-comment" class="form-control" rows="4" maxlength="500" placeholder="よかったところ、分かりにくかったところなど（名前や連絡先は書かないでください）"></textarea></div>
        <div class="btn-row"><button type="submit" class="btn btn-main btn-lg">送る</button></div></form></div>`;
    const form = page.querySelector('form');
    form.addEventListener('change', (e) => { const box = e.target.closest('.qbox'); if (box) { box.classList.remove('missing'); const m = box.querySelector('.qerr'); if (m) m.remove(); } });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const r = {}; let bad = null;
      SURVEY.forEach(([k]) => {
        const v = Number((form.querySelector(`input[name="${k}"]:checked`) || {}).value);
        if (v >= 1 && v <= 5) r[k] = v;
        else { const box = document.getElementById('s-' + k); if (!box.classList.contains('missing')) { box.classList.add('missing'); box.insertAdjacentHTML('beforeend', '<p class="qerr">1〜5から選んでください</p>'); } bad = bad || box; }
      });
      if (bad) { bad.scrollIntoView({ block: 'center' }); return; }
      r.comment = document.getElementById('s-comment').value.slice(0, 500);
      db.add('surveys', r);
      location.hash = '#/survey/thanks';
    });
  }
  function renderThanks() {
    document.title = 'ありがとうございました｜詐欺シミュ';
    page.innerHTML = `<div class="wrap narrow"><section class="result ok"><h1>ありがとうございました</h1><p class="mt-2">いただいた答えは、教材をよくするために使います。</p></section>
      <div class="btn-row"><a class="btn btn-main" href="#/stats">みんなの結果を見る</a><a class="btn btn-sub" href="#/help">相談先を確かめる</a><a class="btn btn-sub" href="#/">ホームへ</a></div></div>`;
  }

  /* ===== みんなの結果（このブラウザで体験した人の結果） ===== */
  function renderStats() {
    document.title = 'みんなの結果｜詐欺シミュ';
    const plays = db.get('plays');
    const rows = scenarioList().map((sc) => {
      const ps = plays.filter((p) => p.scenario === sc.id); const total = ps.length;
      const n = (k) => ps.filter((p) => kindOf(p) === k).length;
      const checked = ps.filter((p) => p.log.some((l) => l.kind === 'check')); const unchecked = ps.filter((p) => !p.log.some((l) => l.kind === 'check'));
      const okOf = (list) => pct(list.filter((p) => kindOf(p) === 'ok').length, list.length);
      const traps = {};
      ps.filter((p) => kindOf(p) === 'ng').forEach((p) => { const d = p.log.filter((l) => l.kind === 'decide').pop(); if (d) traps[d.label] = (traps[d.label] || 0) + 1; });
      const top = Object.entries(traps).sort((a, b) => b[1] - a[1]).slice(0, 3);
      const ok = pct(n('ok'), total), ng = pct(n('ng'), total), quit = pct(n('quit'), total);
      return `<section class="panel stat"><h3 class="h5 fw-bold">${esc(sc.no)} ${esc(sc.title)}<small>${total}回</small></h3>${total ? `
        <div class="bar" role="img" aria-label="見抜けた ${ok}%、だまされた ${ng}%、途中でやめた ${quit}%">${bar('ok', ok)}${bar('ng', ng)}${bar('quit', quit)}</div>
        <ul class="legend"><li><i class="ok"></i>見抜けた ${ok}%</li><li><i class="ng"></i>だまされた ${ng}%</li><li><i class="quit"></i>やめた ${quit}%</li></ul>
        <h4 class="stat-h">「調べる」操作をした人・しなかった人の、見抜けた割合</h4>
        ${pair(`調べた（${checked.length}回）`, 'ok', okOf(checked), okOf(checked) + '%')}${pair(`調べなかった（${unchecked.length}回）`, 'ok', okOf(unchecked), okOf(unchecked) + '%')}
        ${top.length ? `<h4 class="stat-h">だまされた人が、最後に選んだこと</h4><ol class="traps">${top.map(([l, c]) => `<li>${esc(l)}<small>${c}人</small></li>`).join('')}</ol>` : ''}`
        : '<p class="text-secondary mb-0">まだ体験した人がいません。</p>'}</section>`;
    }).join('');
    const tests = (phase) => { const ts = db.get('tests').filter((t) => t.phase === phase && t.total); return { n: ts.length, rate: ts.length ? Math.round(ts.reduce((s, t) => s + (t.score * 100) / t.total, 0) / ts.length) : 0 }; };
    const pre = tests('pre'), post = tests('post');
    const sv = db.get('surveys');
    const avg = (k) => (Math.round((sv.reduce((s, r) => s + r[k], 0) / sv.length) * 10) / 10).toFixed(1);
    page.innerHTML = `<div class="wrap"><h1 class="page-h">みんなの結果</h1>
      <p class="page-lead">このブラウザで体験した人の結果です。展示会などで1台のパソコンをみんなで使うと、そのパソコンで体験したみんなの結果になります。</p>
      <h2 class="sec-h">シナリオごとの結果</h2><div class="stat-grid">${rows}</div>
      <h2 class="sec-h">力だめしテスト（体験の前と後）</h2>
      <div class="panel">${pair(`体験の前（${pre.n}回）`, 'pre', pre.rate, pre.rate + '%')}${pair(`体験の後（${post.n}回）`, 'ok', post.rate, post.rate + '%')}
        <p class="small text-secondary mt-2 mb-0">平均の正答率です。同じ10問を、体験の前と後に解いてもらっています。</p></div>
      ${sv.length ? `<h2 class="sec-h">アンケート（${sv.length}人・5段階の平均）</h2><div class="panel survey-avg">${SURVEY.map(([k, , short]) => `<div><b>${avg(k)}</b>${short}</div>`).join('')}</div>` : ''}
      ${localNote}</div>`;
  }

  /* ===== 自分の記録 ===== */
  function renderRecords() {
    document.title = '自分の記録｜詐欺シミュ';
    const plays = db.get('plays').slice().sort((a, b) => b.at - a.at);
    const best = {};
    plays.slice().reverse().forEach((p) => { const cur = best[p.scenario]; if (!cur || kindOf(cur) !== 'ok' || kindOf(p) === 'ok') best[p.scenario] = p; });
    const okCount = Object.values(best).filter((p) => kindOf(p) === 'ok').length;
    const pre = latestTest('pre'), post = latestTest('post');
    const tagCls = { ok: 'check', ng: 'ng', quit: 'dev' };
    page.innerHTML = `<div class="wrap"><h1 class="page-h">自分の記録</h1>
      <p class="page-lead">見抜けたシナリオ：<b>${okCount}</b> / ${S.order.length}本</p>
      <h2 class="sec-h">シナリオごとの記録</h2><div class="progress-grid">${scenarioList().map((sc) => { const p = best[sc.id];
        return `<a class="panel prog ${p ? kindOf(p) : ''}" href="${p ? '#/result/' + p.id : '#/start/' + sc.id}"><small>${esc(sc.no)} ${esc(sc.title)}</small><b>${p ? KIND[kindOf(p)] : 'まだ体験していません'}</b><span>${p ? date(p.at) : '体験する →'}</span></a>`; }).join('')}</div>
      <h2 class="sec-h">力だめしテスト</h2><div class="panel">${pre || post
        ? `${pair('体験の前', 'pre', pre ? pct(pre.score, pre.total) : 0, pre ? `${pre.score}/${pre.total}` : 'ー')}${pair('体験の後', 'ok', post ? pct(post.score, post.total) : 0, post ? `${post.score}/${post.total}` : 'ー')}<p class="small text-secondary mt-2 mb-0">いちばん新しい結果です。</p>`
        : '<p class="mb-0">まだテストを受けていません。<a href="#/test/pre">体験の前のテスト</a>から始めましょう。</p>'}</div>
      <h2 class="sec-h">体験の履歴</h2><div class="panel">${plays.length ? `<table class="table mb-0"><thead><tr><th>日時</th><th>シナリオ</th><th>結果</th><th>調べた</th><th></th></tr></thead><tbody>
        ${plays.slice(0, 30).map((p) => { const sc = S.scenarios[p.scenario]; if (!sc) return ''; const k = kindOf(p);
          return `<tr><td>${date(p.at)}</td><td>${esc(sc.no)} ${esc(sc.title)}</td><td><span class="tag ${tagCls[k]}">${KIND[k]}</span></td><td>${p.log.filter((l) => l.kind === 'check').length}回</td><td><a href="#/result/${p.id}">くわしく</a></td></tr>`; }).join('')}
        </tbody></table>` : '<p class="mb-0">まだ体験していません。<a href="#/mode">体験を選ぶ</a></p>'}</div>
      <div class="notice">記録は、このブラウザの中だけに残ります。展示会などで次の人に交代するときは、記録を消せます（みんなの結果からも消えます）。
        <div class="mt-2"><button type="button" class="btn btn-sub btn-sm" id="clear">記録をすべて消す</button></div></div></div>`;
    document.getElementById('clear').addEventListener('click', () => {
      if (window.confirm('このブラウザの体験・テスト・アンケートの記録をすべて消します。よろしいですか？')) { db.clear(); renderRecords(); }
    });
  }

  /* ===== 相談先・見つからないとき ===== */
  function renderHelp() {
    document.title = '相談先｜詐欺シミュ';
    page.innerHTML = `<div class="wrap"><h1 class="page-h">相談先</h1><p class="page-lead">だまされたかもしれないとき、迷ったときの相談先です。この画面の番号は本物です（2026年11月19日に公式の情報で確かめました）。</p>
      ${contactsHTML()}
      <div class="panel mt-3"><h2 class="h5 fw-bold">ほかにも</h2><ul class="list-dot">
        <li>カードを使われたかもしれないとき：カードの裏にある電話番号から、カード会社に連絡する</li>
        <li>お金を振り込んでしまったとき：振込先の銀行と、警察に連絡する</li>
        <li>事件・事故で緊急のとき：110番</li></ul></div></div>`;
  }
  function renderMissing(text) {
    document.title = '見つかりません｜詐欺シミュ';
    page.innerHTML = `<div class="wrap narrow"><h1 class="page-h">見つかりません</h1><p class="page-lead">${esc(text)}</p><div class="btn-row"><a class="btn btn-main" href="#/">ホームへ</a><a class="btn btn-sub" href="#/records">自分の記録</a></div></div>`;
  }

  /* ===== 画面の切り替え ===== */
  function route() {
    if (vm) { vm.destroy(); vm = null; vmRoot.innerHTML = ''; document.body.classList.remove('playing'); }
    const parts = (location.hash || '#/').replace(/^#\/?/, '').split('/');
    const name = parts[0] || ''; const arg = parts[1] || ''; const sc = S.scenarios[arg]; const num = Number(parts[2] || arg);
    setNav(name);
    if (name === 'mode') renderMode();
    else if (name === 'start' && sc) renderStart(sc);
    else if (name === 'play' && sc) play(sc);
    else if (name === 'result' && num) renderResult(num);
    else if (name === 'explain' && sc) renderExplain(sc);
    else if (name === 'test' && PHASE[arg]) renderTake(arg);
    else if (name === 'test' && arg === 'result' && num) renderAttempt(num);
    else if (name === 'test') renderTestIndex();
    else if (name === 'survey' && arg === 'thanks') renderThanks();
    else if (name === 'survey') renderSurvey();
    else if (name === 'stats') renderStats();
    else if (name === 'records') renderRecords();
    else if (name === 'help') renderHelp();
    else renderHome();
    if (name !== 'play') { window.scrollTo(0, 0); document.getElementById('main').focus({ preventScroll: true }); }
  }
  window.addEventListener('hashchange', route);
  window.addEventListener('resize', () => { if (!vm) S.fitMinis(page); });
  route();
})();
