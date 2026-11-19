/* 3本のシナリオで共通に使う部品：スマホのアプリ、架空ブランドのロゴ、家族とのチャット */
(function () {
  'use strict';
  const S = (window.SagiSim = window.SagiSim || {});

  /* ホーム画面のアプリ（どのシナリオでも同じ並び。中身があるかはシナリオが決める） */
  const APPS = [
    { id: 'sms', name: 'メッセージ', icon: '✉', color: '#34a853' },
    { id: 'tel', name: '電話', icon: '☎', color: '#2fa84f' },
    { id: 'browser', name: 'ブラウザ', icon: '◎', color: '#1a73e8' },
    { id: 'hashire', name: 'ハシレ運輸', icon: '≡', color: '#0a7d4f' },
    { id: 'bank', name: 'ヒツジ銀行', icon: '☁', color: '#3aa0d8' },
    { id: 'card', name: 'カード', icon: '★', color: '#1b2a5c' },
    { id: 'tomo', name: 'トモトモ', icon: '◡', color: '#ff8a3d' },
    { id: 'settings', name: '設定', icon: '⚙', color: '#8e8e93' },
  ];
  /* シナリオごとに、アプリを押したときの動きを足す：{ sms: { go: 'sms' }, ... } */
  S.apps = (over) => APPS.map((a) => Object.assign({}, a, over[a.id] || {}));

  S.logo = {
    /* ハシレ運輸（緑の地に白い文字の所では fill=白, stroke=緑） */
    hashire: (fill = '#fff', stroke = '#0a7d4f', size = 26) =>
      `<svg width="${size}" height="${size}" viewBox="0 0 30 30" aria-hidden="true"><rect width="30" height="30" rx="7" fill="${fill}"/><rect x="12" y="9" width="12" height="12" rx="2" fill="#ffcc00"/><path d="M4 11h7M6 15h5M4 19h7" stroke="${stroke}" stroke-width="2.2" stroke-linecap="round"/></svg>`,
    hitsuji: (size = 28) =>
      `<svg width="${size}" height="${size}" viewBox="0 0 30 30" aria-hidden="true"><rect width="30" height="30" rx="7" fill="#fff"/><circle cx="11" cy="14" r="5" fill="#cfe9f7"/><circle cx="17" cy="12" r="5" fill="#cfe9f7"/><circle cx="19" cy="17" r="5" fill="#cfe9f7"/><circle cx="12" cy="18" r="5" fill="#cfe9f7"/><circle cx="21" cy="21" r="3" fill="#3aa0d8"/></svg>`,
    sagashimo: () => `<span class="srch-logo"><span>サ</span><span>ガ</span><span>シ</span><span>モ</span></span>`,
  };

  /* 家族とのチャット（トモトモ）。相談する前と後の2つの画面を作る */
  S.tomoScreens = ({ ask, replies }) => ({
    tomo: {
      dev: 'phone', bar: { bg: '#ff8a3d', fg: '#fff' },
      html: `<div class="app-head tomo-head"><button type="button" class="back" data-back aria-label="戻る">‹</button><span>家族<span class="sub" style="color:#ffe3cf">お母さん、ゆうき</span></span></div>
        <div class="screen"><div class="chat tomo-chat">
          <div class="day">きのう</div><p class="who">ゆうき</p><div class="bub in" style="background:#fff">今度の日曜、みんなでごはん行こうね</div>
          <div class="bub out">いいね！</div></div></div>
        <div class="choices light"><button type="button" class="choice" data-act="consult">家族に相談する<br><small>「${S.esc(ask)}」</small></button></div>`,
    },
    'tomo-done': {
      dev: 'phone', bar: { bg: '#ff8a3d', fg: '#fff' },
      html: `<div class="app-head tomo-head"><button type="button" class="back" data-back aria-label="戻る">‹</button><span>家族<span class="sub" style="color:#ffe3cf">お母さん、ゆうき</span></span></div>
        <div class="screen"><div class="chat tomo-chat">
          <div class="day">今日</div><div class="bub out">${S.esc(ask)}</div>
          ${replies.map((r) => `<p class="who seq">${S.esc(r.who)}</p><div class="bub in seq" style="background:#fff">${S.esc(r.text)}</div>`).join('')}
        </div></div>
        <div class="inputbar"><span class="box">メッセージを入力</span></div>`,
      onEnter: (vm) => vm.seq('phone', 900),
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
