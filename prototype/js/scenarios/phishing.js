/* ① フィッシング：宅配業者を名乗るSMS → 偽のログイン画面（画面は docs/design/mockups/phishing.html） */
(function () {
  'use strict';
  const S = window.SagiSim;
  const L = S.logo;
  const FAKE_HOST = 'hashire-unyu.redelivery-info.example';

  const fakeHead = `<div class="hs-head"><span class="logo">${L.hashire()}ハシレ運輸</span></div>`;
  const phoneTool = `<div class="m-tool"><button type="button" data-back aria-label="戻る">‹</button><span>›</span><span>⇪</span><span>▢</span></div>`;

  S.register({
    id: 'phishing', no: '①', title: 'フィッシング', color: '#0a7d4f',
    entry: '宅配業者を名乗るSMSから偽のログイン画面へ',
    learn: 'URLの見分け方、公式アプリで確かめること',
    minutes: '3〜5分',
    situation: 'あなたのスマホに、宅配業者からのSMSが届きます。荷物を頼んだ覚えはありますか？ スマホとパソコンを使って、本物かどうか確かめてみましょう。',
    mission: '届いたSMSに対応しよう',
    devices: '仮想スマホ（メッセージ・ハシレ運輸の公式アプリ・家族とのチャット）、仮想パソコン（ブラウザ）',
    first: 'phone', clock: '9:41', date: '11月18日（水）',

    phone: {
      apps: S.apps({ sms: { go: 'sms' }, hashire: { act: 'open-hs-app' }, tomo: { go: 'tomo' } }),
      homeHint: 'アプリを押すと開きます。下の白い線を押すと、この画面に戻ります。',
    },
    pc: {
      start: 'newtab',
      bookmarks: [{ label: 'ハシレ運輸', act: 'open-hs-site' }, { label: 'ヒツジネット銀行' }, { label: 'ことこと献立帖' }],
    },

    events: [{
      at: 1800, run: (vm) => vm.notify({
        app: 'sms', appName: 'メッセージ', icon: '✉', color: '#34a853', go: 'sms',
        title: '+81 80-XXXX-XXXX', body: '【ハシレ運輸】お客様宛にお荷物のお届けにあがりましたが不在の為持ち帰りました。保管期限は本日までです…',
      }),
    }],

    screens: Object.assign({
      sms: {
        dev: 'phone',
        html: `<div class="app-head"><button type="button" class="back" data-back aria-label="戻る">‹</button><span><span class="clue" data-n="1" data-tip="だれから届いたSMSか、差出人を見てみよう">+81 80-XXXX-XXXX</span><span class="sub">SMS</span></span></div>
          <div class="screen"><div class="chat">
            <div class="day">今日 9:41</div>
            <div class="bub in">【ハシレ運輸】お客様宛にお荷物のお届けにあがりましたが不在の為持ち帰りました。<span class="clue" data-n="3" data-tip="期限を決めて、急がせていないかな？">保管期限は本日までです。</span>下記よりご確認ください。<br>
              <button type="button" class="linklike clue" data-n="2" data-act="tap-link" data-tip="リンクの行き先は、本物のハシレ運輸のアドレスかな？">https://${FAKE_HOST}/xR7k2</button></div>
            <div class="bub-time">9:41</div>
            <div class="sms-actions"><button type="button" data-act="report">迷惑メッセージとして報告</button><button type="button" data-act="delete">削除する</button></div>
          </div></div>
          <div class="inputbar"><span style="color:#1a73e8;font-size:18px">＋</span><span class="box">テキストメッセージ</span></div>`,
      },
      'fake-login': {
        dev: 'phone', url: `https://${FAKE_HOST}/login`,
        urlNote: '<br>本物のハシレ運輸は <b>hashire-unyu.example</b> です。前に「hashire-unyu.」が付いていても、持ち主は別の人です。',
        html: `<div class="m-omni"><button type="button" class="bar clue" data-n="1" data-vm="url" data-tip="アドレスバーを押すと、アドレスをくわしく確かめられるよ"><span class="lockmark">🔒</span><span class="host">${FAKE_HOST}</span><span class="path">/login</span></button><button type="button" class="m-x" data-act="close-fake" aria-label="ページを閉じる">✕</button></div>
          <div class="screen web">${fakeHead}
            <div class="hs-title">再配達のお申し込み</div>
            <div class="hs-wrap">
              <div class="warnbox">お荷物の保管期限が迫っています。ログインして、再配達の日時を指定してください。</div>
              <label class="f-label">お客様ID（メールアドレス・電話番号）</label><input class="f-input" readonly value="hashire@example.jp" aria-label="お客様ID（練習用の値）">
              <label class="f-label">パスワード</label><input class="f-input" readonly type="password" value="renshu1234" aria-label="パスワード（練習用の値）">
              <button type="button" class="f-btn" style="background:var(--hs);color:#fff" data-act="login">ログインして再配達を申し込む</button>
              <div class="practice-note">入力欄には練習用の値が入っています（本物の情報は入れません）</div>
            </div>
            <div class="foot-s"><span class="clue" data-n="2" data-tip="ページのいちばん下の会社名を、よく読んでみよう">© 2019 ハシレ運輸株式会杜</span></div>
          </div>${phoneTool}`,
      },
      'fake-pay': {
        dev: 'phone', url: `https://${FAKE_HOST}/payment`,
        urlNote: '<br>本物のハシレ運輸は <b>hashire-unyu.example</b> です。',
        html: `<div class="m-omni"><button type="button" class="bar" data-vm="url"><span class="lockmark">🔒</span><span class="host">${FAKE_HOST}</span><span class="path">/payment</span></button><button type="button" class="m-x" data-act="quit-pay" aria-label="ページを閉じる">✕</button></div>
          <div class="screen web">${fakeHead}
            <div class="steps"><span>1 ログイン ✓</span><span class="on">2 お支払い</span><span>3 完了</span></div>
            <div class="hs-title" style="font-size:17px">再配達手数料のお支払い</div>
            <div class="hs-wrap">
              <div style="font-size:13px;line-height:1.6">再配達には <b class="clue" data-n="1" data-tip="本物の宅配業者は、再配達にお金を取るかな？">手数料 330円（税込）</b> が必要です。クレジットカードでお支払いください。</div>
              <label class="f-label">カード番号</label><input class="f-input" readonly value="1234 5678 9012 3456" aria-label="カード番号（練習用の値）">
              <div style="display:flex;gap:10px"><div style="flex:1"><label class="f-label">有効期限</label><input class="f-input" readonly value="12 / 30"></div><div style="flex:1"><label class="f-label clue" data-n="2" data-tip="カードの裏の番号まで聞かれていないかな？">セキュリティコード</label><input class="f-input" readonly value="123"></div></div>
              <button type="button" class="f-btn" style="background:var(--hs);color:#fff" data-act="pay">支払って再配達を申し込む</button>
              <button type="button" class="f-btn outline" style="color:#5f6368;margin-top:8px" data-act="quit-pay">やめる</button>
            </div>
          </div>${phoneTool}`,
      },
      'hs-app': {
        dev: 'phone', bar: { bg: '#0a7d4f', fg: '#fff' },
        html: `<div class="app-hs"><span class="logo">${L.hashire('#fff', '#0a7d4f', 28)}ハシレ運輸</span></div>
          <div class="app-tabs"><span class="on">荷物</span><span>受け取り設定</span><span>お知らせ</span></div>
          <div class="screen" style="background:#f6f8f7">
            <div class="hs-card" style="background:#fff"><h3>お届け予定のお荷物</h3>
              <div class="empty clue good" data-n="1"><b>現在、お届け予定のお荷物はありません</b>不在のお知らせもありません</div></div>
            <div class="alert-red clue good" data-n="2"><b>【ご注意】</b>当社をかたる不審なSMSが届いています。当社はSMSで不在のお知らせを送ることはありません。</div>
            <div class="hs-card" style="background:#fff"><h3>最近のお荷物</h3><ul class="hist"><li><span>11月10日</span><span>お届け済み</span></li><li><span>10月28日</span><span>お届け済み</span></li></ul></div>
          </div>`,
      },
      newtab: {
        dev: 'pc', url: 'https://www.sagashimo.example/', title: '新しいタブ',
        html: `<div class="newtab">${L.sagashimo()}<div class="srch-box">検索するか、URLを入力</div>
          <div class="tile-grid">
            <button type="button" class="tile" data-act="open-hs-site"><i style="background:#0a7d4f;color:#fff">ハ</i>ハシレ運輸</button>
            <button type="button" class="tile" data-vm="bm" data-i="1"><i style="background:#3aa0d8;color:#fff">ヒ</i>ヒツジネット銀行</button>
            <button type="button" class="tile" data-vm="bm" data-i="2"><i style="background:#d9661f;color:#fff">こ</i>ことこと献立帖</button>
            <span class="tile"><i>＋</i>追加</span></div></div>`,
      },
      'hs-site': {
        dev: 'pc', url: 'https://www.hashire-unyu.example/', title: 'ハシレ運輸｜個人のお客様',
        urlNote: '<br>ハシレ運輸の公式のアドレスです。',
        html: `<div class="site-head"><span class="logo">${L.hashire('#0a7d4f', '#fff', 34)}ハシレ運輸</span><nav><span>個人のお客様</span><span>法人のお客様</span><span>荷物を調べる</span><span>よくある質問</span></nav></div>
          <div class="hero"><div><h2>荷物を調べる</h2><p>お問い合わせ番号で、お荷物の状況を確かめられます。</p></div>
            <div class="track"><b style="font-size:13px">お問い合わせ番号（12桁）</b><div class="f-input">0000-0000-0000</div><div class="f-btn" style="background:var(--hs);color:#fff;margin-top:10px">調べる</div></div></div>
          <div class="news"><h3>お知らせ</h3><ul>
            <li class="clue good" data-n="1"><span class="d">2026.11.15</span><span><span class="badge-imp">重要</span>当社をかたる「なりすましSMS・メール」にご注意ください。当社はSMSで不在のお知らせを送っていません。</span></li>
            <li><span class="d">2026.11.01</span><span>年末年始の営業とお届けについて</span></li>
            <li><span class="d">2026.10.20</span><span>受け取り場所の指定サービスを始めました</span></li></ul></div>
          <div class="site-foot" style="position:static;margin-top:40px">© 2026 ハシレ運輸株式会社</div>`,
      },
    }, S.tomoScreens({
      ask: '宅配の不在のSMSが来たんだけど、リンクを押しても大丈夫？',
      replies: [{ who: 'ゆうき', text: '押さないで！最近そういう詐欺が多いよ' }, { who: 'ゆうき', text: 'ハシレ運輸のアプリで、荷物があるか確かめてみて' }],
    })),

    actions: {
      'tap-link': { kind: 'decide', label: 'SMSのリンクを押した', run: (vm) => vm.go('phone', 'fake-login') },
      report: { kind: 'decide', label: '迷惑メッセージとして報告した', run: (vm) => vm.end('ok') },
      delete: { kind: 'decide', label: 'SMSを削除した', run: (vm) => vm.end('ok') },
      'close-fake': { kind: 'decide', label: 'おかしいと気づいて、ページを閉じた', run: (vm) => vm.end('ok') },
      login: { kind: 'decide', label: 'IDとパスワードを入力した', run: (vm) => vm.go('phone', 'fake-pay') },
      pay: { kind: 'decide', label: 'カード番号を入力して支払った', run: (vm) => vm.end('ng2') },
      'quit-pay': { kind: 'decide', label: '手数料の支払いはやめた', run: (vm) => vm.end('ng1') },
      'open-hs-app': { kind: 'check', label: 'ハシレ運輸の公式アプリで、荷物を確かめた', run: (vm) => vm.go('phone', 'hs-app') },
      'open-hs-site': { kind: 'check', label: 'パソコンのブックマークから、公式サイトを開いた', run: (vm) => vm.go('pc', 'hs-site') },
      consult: S.consultAction,
    },

    endings: {
      ok: { type: 'ok', title: '見抜けた！', short: 'SMSのリンクを押さず、だまされずにすみました。',
        after: '本物のハシレ運輸は、SMSで不在のお知らせを送りません。迷ったときは、公式アプリや前に登録したブックマークから確かめるのが安全です。' },
      ng1: { type: 'ng', title: 'だまされた：IDとパスワードを盗まれた', short: '支払いはやめましたが、入力したIDとパスワードは、もう相手に届いています。',
        after: 'しばらくすると、知らない端末からあなたのアカウントにログインがありました。同じパスワードを使っているほかのサービスも、乗っ取られるおそれがあります。',
        onEnd: (vm) => vm.later(600, () => vm.notify({ app: 'hashire', appName: 'ハシレ運輸', icon: '≡', color: '#0a7d4f', title: '新しい端末からのログイン', body: 'お客様のアカウントに、新しい端末からログインがありました。' })) },
      ng2: { type: 'ng', title: 'だまされた：カード番号も盗まれた', short: '入力したカード番号が、すぐに知らない店で使われました。',
        after: '入力してから数分で、カード会社から「ご利用のお知らせ」が2回届きました。合わせて 143,800円 です。',
        onEnd: (vm) => {
          vm.later(500, () => vm.notify({ app: 'card', appName: 'ホシゾラカード', icon: '★', color: '#1b2a5c', title: '【ご利用のお知らせ】', body: '11/18 10:02　98,000円　ご利用先：ONLINE-SHOP' }));
          vm.later(1300, () => vm.notify({ app: 'card', appName: 'ホシゾラカード', icon: '★', color: '#1b2a5c', title: '【ご利用のお知らせ】', body: '11/18 10:05　45,800円　ご利用先：ONLINE-SHOP' }));
        }, delay: 2600 },
      quit: { type: 'quit', title: '途中でやめました', short: '解説で、見抜くポイントと確かめ方を見てみましょう。', after: '' },
    },

    explain: {
      points: [
        { screen: 'sms', items: ['宅配業者からのSMSなのに、差出人が個人の携帯電話の番号', 'リンクの登録ドメインは <b>redelivery-info.example</b>。公式は hashire-unyu.example', '「本日まで」と期限で急がせる'] },
        { screen: 'fake-login', items: ['アドレスバーの登録ドメインが公式と違う。前に「hashire-unyu.」が付いていてまぎらわしい', '会社名の字が違う（「社」→「杜」）。年も古いまま'] },
        { screen: 'fake-pay', items: ['宅配業者は、再配達にお金を取らない', 'カードの裏のセキュリティコードまで入れさせる'] },
      ],
      checks: [
        { screen: 'hs-app', items: ['公式アプリで確かめると、届く予定の荷物はない', '公式のお知らせで、SMSで不在の連絡はしないと分かる'] },
        { screen: 'hs-site', items: ['パソコンのブックマークから開いた公式サイトにも、同じ注意が出ている'] },
      ],
      prevent: ['SMSやメールのリンクは押さない', '公式アプリや、前に登録したブックマークから確かめる', 'アドレスバーの登録ドメインを見る（hashire-unyu.example と redelivery-info.example は、持ち主が別）', '迷ったら、家族や周りの人に相談する'],
      ifScammed: ['パスワードを入れてしまったら、すぐにパスワードを変える（同じパスワードを使っているほかのサービスも）', 'カード番号を入れてしまったら、カードの裏の電話番号でカード会社に連絡し、カードを止める', '警察相談専用電話（#9110）に相談する。SMSの画面は、相談のときのために残しておく'],
    },
  });
})();
