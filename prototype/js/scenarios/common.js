/* 3本のシナリオで共通に使う部品：スマホのアプリ、架空ブランドのロゴ、家族とのチャット、相談窓口 */
(function () {
  'use strict';
  const S = (window.SagiSim = window.SagiSim || {});
  const I = S.ico;
  S.templateCredit = '<span class="pr"><a href="https://template-party.com/" target="_blank" rel="noopener nofollow">《Web Design:Template-Party》</a></span>';

  /* ===== 架空ブランドのロゴ ===== */
  S.logo = {
    /* ハシレ運輸：緑の地のところでは fill=白・stroke=緑、白い地のところでは fill=緑・stroke=白 */
    hashire: (fill = '#fff', stroke = '#0a7d4f', size = 26) =>
      `<svg width="${size}" height="${size}" viewBox="0 0 30 30" aria-hidden="true"><rect width="30" height="30" rx="7" fill="${fill}"/><rect x="12" y="9" width="12" height="12" rx="2" fill="#ffcc00"/><path d="M4 11h7M6 15h5M4 19h7" stroke="${stroke}" stroke-width="2.2" stroke-linecap="round"/></svg>`,
    hitsuji: (size = 28, bg = '#fff') =>
      `<svg width="${size}" height="${size}" viewBox="0 0 30 30" aria-hidden="true"><rect width="30" height="30" rx="7" fill="${bg}"/><circle cx="11" cy="14" r="5" fill="#cfe9f7"/><circle cx="17" cy="12" r="5" fill="#cfe9f7"/><circle cx="19" cy="17" r="5" fill="#cfe9f7"/><circle cx="12" cy="18" r="5" fill="#cfe9f7"/><circle cx="21" cy="21" r="3" fill="#1b6fa3"/></svg>`,
    hoshizora: (size = 28) =>
      `<svg width="${size}" height="${size}" viewBox="0 0 30 30" aria-hidden="true"><rect width="30" height="30" rx="7" fill="#1b2a5c"/><path d="M15 6.5l2.4 5 5.4.7-4 3.7 1 5.4-4.8-2.7-4.8 2.7 1-5.4-4-3.7 5.4-.7z" fill="#f4d35e"/></svg>`,

  };

  /* ===== ホーム画面のアプリ =====
     ふつうのスマホと同じように、使わないアプリも並べる（押すと「この練習では使いません」） */
  const g = (d, fill = '#fff', vb = 30) => `<svg viewBox="0 0 ${vb} ${vb}" width="34" height="34" aria-hidden="true">${d.replace(/FILL/g, fill)}</svg>`;
  const APPS = [
    { id: 'hashire', name: 'ハシレ運輸', bg: '#0a7d4f', glyph: S.logo.hashire('#fff', '#0a7d4f', 34) },
    { id: 'bank', name: 'ヒツジ銀行', bg: '#dff0fa', glyph: S.logo.hitsuji(34, '#dff0fa') },
    { id: 'card', name: 'ホシゾラ', bg: '#1b2a5c', glyph: S.logo.hoshizora(34) },
    { id: 'calendar', name: 'カレンダー', bg: '#fff', glyph: '<span class="cal"><small>水曜日</small><b>18</b></span>' },
    { id: 'clock', name: '時計', bg: '#111', glyph: g('<circle cx="15" cy="15" r="11" fill="#fff"/><path d="M15 8v7l4.5 3" stroke="#111" stroke-width="2" fill="none" stroke-linecap="round"/>') },
    { id: 'weather', name: '天気', bg: 'linear-gradient(180deg,#3b8de0,#6db3f2)', glyph: g('<circle cx="12" cy="12" r="5" fill="#ffd54a"/><path d="M10 22h11a4 4 0 0 0 0-8 5.5 5.5 0 0 0-10.5 1.5A3.3 3.3 0 0 0 10 22z" fill="#fff"/>') },
    { id: 'camera', name: 'カメラ', bg: 'linear-gradient(180deg,#d9d9de,#a7a7ad)', glyph: g('<rect x="5" y="9" width="20" height="14" rx="3" fill="#2b2b2e"/><circle cx="15" cy="16" r="4.2" fill="#6b6b70" stroke="#fff" stroke-width="1.4"/><rect x="11" y="6.5" width="8" height="3" rx="1" fill="#2b2b2e"/>') },
    { id: 'settings', name: '設定', bg: 'linear-gradient(180deg,#a3a3a9,#7d7d83)', glyph: g('<path d="M15 9.2a5.8 5.8 0 1 0 0 11.6 5.8 5.8 0 0 0 0-11.6zm0 3a2.8 2.8 0 1 1 0 5.6 2.8 2.8 0 0 1 0-5.6z" fill="#fff"/><path d="M13.6 4h2.8l.5 2.8 2.4 1 2.3-1.6 2 2-1.6 2.3 1 2.4 2.8.5v2.8l-2.8.5-1 2.4 1.6 2.3-2 2-2.3-1.6-2.4 1-.5 2.8h-2.8l-.5-2.8-2.4-1-2.3 1.6-2-2 1.6-2.3-1-2.4-2.8-.5v-2.8l2.8-.5 1-2.4-1.6-2.3 2-2 2.3 1.6 2.4-1z" fill="none" stroke="#fff" stroke-width="1.6"/>') },
    { id: 'tel', name: '電話', bg: 'linear-gradient(180deg,#5fe07a,#2fbf4f)', dock: true, glyph: g('<path d="M10.2 6.5h3l1.3 4.4-2 1.7a13 13 0 0 0 5 5l1.7-2 4.4 1.3v3c0 1.2-1 2.1-2.2 2.1C13.7 22 8 16.3 8 8.7c0-1.2 1-2.2 2.2-2.2z" fill="#fff"/>') },
    { id: 'browser', name: 'ブラウザ', bg: '#fff', dock: true, glyph: g('<circle cx="15" cy="15" r="11.5" fill="none" stroke="#1a73e8" stroke-width="1.6"/><path d="M15 4.5v2M15 23.5v2M4.5 15h2M23.5 15h2" stroke="#1a73e8" stroke-width="1.4"/><path d="M20.5 9.5l-3.6 7.4-7.4 3.6 3.6-7.4z" fill="#e8453c"/><path d="M12.9 12.9l4 4-7.4 3.6z" fill="#1a73e8"/>') },
    { id: 'sms', name: 'メッセージ', bg: 'linear-gradient(180deg,#5fe07a,#2fbf4f)', dock: true, glyph: g('<path d="M15 6.5c-5.5 0-10 3.5-10 7.9 0 2.5 1.4 4.7 3.7 6.1L8 24l4-2.1c1 .2 2 .3 3 .3 5.5 0 10-3.5 10-7.8S20.5 6.5 15 6.5z" fill="#fff"/>') },
    { id: 'tomo', name: 'トモトモ', bg: '#ff8a3d', dock: true, glyph: g('<path d="M12 7c-4.4 0-8 2.8-8 6.3 0 2 1.2 3.8 3.1 4.9L6.5 21l3.2-1.6c.7.2 1.5.2 2.3.2 4.4 0 8-2.8 8-6.3S16.4 7 12 7z" fill="#fff"/><circle cx="21.5" cy="17.5" r="5" fill="#fff" opacity=".85"/>') },
  ];
  /* シナリオごとに、アプリを押したときの動きを足す：{ sms: { go: 'sms' }, ... } */
  S.apps = (over) => APPS.map((a) => Object.assign({}, a, over[a.id] || {}));

  /* ===== iOS のような画面の上の部分（戻る・題名） ===== */
  S.iosNav = (title, opt = {}) => `<div class="ios-nav ${opt.cls || ''}"><button type="button" class="back" data-back aria-label="戻る">${I.back}${opt.backLabel ? `<span>${S.esc(opt.backLabel)}</span>` : ''}</button><b>${title}</b><span>${opt.right || ''}</span></div>`;

  /* ===== スマホのブラウザ（アドレスバーは下。ドメインだけを表示し、押すとURL全体が出る） ===== */
  S.mBrowser = ({ host, body, close, clue }) => `<div class="mb-page">${body}</div>
    <div class="mb-bar"><button type="button" class="mb-url ${clue ? 'clue' : ''}" data-vm="url" ${clue || ''}><span class="aa">ぁあ</span><span class="host">${S.esc(host)}</span><span class="re">${I.reload}</span></button>
      ${close ? `<button type="button" class="mb-x" data-act="${close}" aria-label="ページを閉じる">${I.x}</button>` : ''}</div>
    <div class="mb-tool"><button type="button" data-back aria-label="戻る">${I.back}</button><button type="button" data-vm="forward" aria-label="進む">${I.fwd}</button><button type="button" data-vm="find" aria-label="ページ内検索">${I.search}</button><button type="button" data-web="web/home/search/" aria-label="検索ホーム">${I.tabs}</button></div>`;

  /* ===== 家族とのチャット（トモトモ）。相談する前と後の2つの画面 ===== */
  const tomoHead = `<div class="tm-head"><button type="button" class="back" data-back aria-label="戻る">${I.back}</button><span class="tm-av">家</span><span class="tm-tt"><b>家族</b><small>お母さん、ゆうき</small></span></div>`;
  const tomoIn = (who, text, seq) => `<div class="tm-row ${seq ? 'seq' : ''}"><span class="tm-face">${S.esc(who.charAt(0))}</span><div><small>${S.esc(who)}</small><p class="tm-b in">${S.esc(text)}</p></div></div>`;
  S.tomoScreens = ({ ask, replies }) => ({
    tomo: {
      dev: 'phone', bar: { bg: '#fff', fg: '#111' },
      html: `${tomoHead}<div class="tm-chat"><div class="tm-day">きのう</div>${tomoIn('ゆうき', '今度の日曜、みんなでごはん行こうね')}<p class="tm-b out">いいね！<small>既読</small></p></div>
        <div class="tm-compose"><button type="button" class="tm-send" data-act="consult"><span>${S.esc(ask)}</span><b>送信</b></button></div>`,
    },
    'tomo-done': {
      dev: 'phone', bar: { bg: '#fff', fg: '#111' },
      html: `${tomoHead}<div class="tm-chat"><div class="tm-day">今日</div><p class="tm-b out">${S.esc(ask)}<small>既読</small></p>
        ${replies.map((r) => tomoIn(r.who, r.text, true)).join('')}</div>
        <div class="tm-compose"><span class="tm-input">メッセージを入力</span></div>`,
      onEnter: (vm) => vm.seq('phone', 1000),
    },
  });
  S.consultAction = { kind: 'check', label: '家族に相談した', run: (vm) => vm.go('phone', 'tomo-done', { replace: true }) };

  /* 解説と相談先で使う、本物の相談窓口（2026年11月19日に公式の情報で確かめた） */
  S.contacts = [
    { name: '警察相談専用電話', tel: '#9110', note: '緊急ではない警察への相談。受付時間は都道府県によって違う（平日 8:30〜17:15 が目安）。事件・事故で緊急のときは 110番' },
    { name: '消費者ホットライン', tel: '188', note: '近くの消費生活センターなどにつながる。ネット通販のトラブルや、お金を払ってしまったときの相談' },
    { name: 'IPA 情報セキュリティ安心相談窓口', tel: '03-5978-7509', note: '偽の警告画面（サポート詐欺）やウイルスの相談。平日 10:00〜17:00（土日祝日・年末年始を除く）' },
  ];
})();
