/* ① フィッシング：宅配業者を名乗るSMS → 偽のログイン画面 */
(function () {
  'use strict';
  const S = window.SagiSim;
  const L = S.logo; const I = S.ico;
  const FAKE_HOST = 'hashire-unyu.redelivery-info.example';
  const SMS = '【ハシレ運輸】お客様宛にお荷物のお届けにあがりましたが不在の為持ち帰りました。';

  /* 偽のサイトは、本物のハシレ運輸のスマホ用サイトをそっくりまねている */
  const fakeHead = `<div class="hs-m-head"><span class="hs-logo">${L.hashire('#0a7d4f', '#fff', 24)}ハシレ運輸</span><button type="button" data-act="training-menu" aria-label="メニュー">${I.menu}</button></div>`;

  S.register({
    id: 'phishing', no: '①', title: 'フィッシング', color: '#0a7d4f',
    entry: '宅配業者を名乗るSMSから偽のログイン画面へ',
    learn: 'URLの見分け方、公式アプリで確かめること',
    minutes: '3〜5分',
    situation: 'あなたのスマホに、宅配業者からのSMSが届きます。荷物を頼んだ覚えはありますか？ スマホとパソコンを使って、本物かどうか確かめてみましょう。',
    mission: '届いたSMSに対応しよう',
    devices: '仮想スマホ（メッセージ・ハシレ運輸の公式アプリ・家族とのチャット）、仮想パソコン（ブラウザ）',
    first: 'phone', clock: '9:41', date: '11月18日 水曜日',

    phone: { apps: S.apps({ sms: { go: 'sms' }, hashire: { act: 'open-hs-app' }, tomo: { go: 'tomo' } }) },
    pc: {
      start: 'newtab',
      bookmarks: [{ label: 'ハシレ運輸', act: 'open-hs-site', color: '#0a7d4f', ch: 'ハ' }, { label: 'ヒツジネット銀行', color: '#1b6fa3', ch: 'ヒ' }, { label: 'ことこと献立帖', color: '#110000', ch: 'こ' }],
    },

    events: [{
      at: 1800, run: (vm) => vm.notify({ app: 'sms', go: 'sms', head: '+81 80-XXXX-XXXX', body: `${SMS}保管期限は本日までです。下記よりご確認ください。` }),
    }],

    screens: Object.assign({
      sms: {
        dev: 'phone',
        html: `<div class="msg-head"><button type="button" class="back" data-back aria-label="戻る">${I.back}</button><span class="msg-av"></span>
            <span class="num clue" data-n="1" data-tip="だれから届いたSMSか、差出人を見てみよう">+81 80-XXXX-XXXX ${S.svg('<path d="M9.5 7l5 5-5 5"/>', { s: 10, w: 2.4 })}</span></div>
          <div class="msg-body">
            <div class="msg-when"><b>テキストメッセージ・SMS</b><br>今日 9:41</div>
            <div class="bub-in">${SMS}<span class="clue" data-n="3" data-tip="期限を決めて、急がせていないかな？">保管期限は本日までです。</span>下記よりご確認ください。<br>
              <button type="button" class="lnk clue" data-n="2" data-act="tap-link" data-tip="リンクの行き先は、本物のハシレ運輸のアドレスかな？">https://${FAKE_HOST}/xR7k2</button></div>
            <div class="msg-unknown">この送信者は連絡先に登録されていません。<div class="acts"><button type="button" data-act="report">迷惑メッセージを報告</button><button type="button" class="del" data-act="delete">削除</button></div></div>
          </div>
          <div class="msg-input"><span class="plus">${I.plus}</span><span class="field">テキストメッセージ・SMS ${I.mic}</span></div>`,
      },
      'fake-login': {
        dev: 'phone', url: `https://${FAKE_HOST}/login`,
        urlNote: '<br>本物のハシレ運輸は <b>hashire-unyu.example</b> です。前に「hashire-unyu.」が付いていても、持ち主は別の人です。',
        html: S.mBrowser({
          host: FAKE_HOST, close: 'close-fake', clue: 'data-n="1" data-tip="下のアドレスを押すと、アドレスをくわしく確かめられるよ"',
          body: `<div class="hs">${fakeHead}
            <div class="hs-m"><h2>再配達のお申し込み</h2>
              <p class="lead">お荷物の保管期限が迫っています。ログインして、再配達の日時を指定してください。</p>
              <label class="hs-f">お客様ID（メールアドレス・電話番号）<input readonly value="hashire@example.jp" aria-label="お客様ID（練習用の値）"></label>
              <label class="hs-f">パスワード<input readonly type="password" value="renshu1234" aria-label="パスワード（練習用の値）"></label>
              <button type="button" class="hs-btn" data-act="login">ログインして再配達を申し込む</button>
              <button type="button" class="hs-sub" data-act="account-help">パスワードをお忘れの方</button>
              <p class="hs-sub" style="font-size:11px">入力欄には練習用の値が入っています</p></div>
            <div class="hs-m-foot"><span class="clue" data-n="2" data-tip="ページのいちばん下の会社名を、よく読んでみよう">© 2019 ハシレ運輸株式会杜</span></div></div>`,
        }),
      },
      'fake-pay': {
        dev: 'phone', url: `https://${FAKE_HOST}/payment`,
        urlNote: '<br>本物のハシレ運輸は <b>hashire-unyu.example</b> です。',
        html: S.mBrowser({
          host: FAKE_HOST, close: 'quit-pay',
          body: `<div class="hs">${fakeHead}
            <div class="hs-m"><div class="hs-steps"><span>ログイン</span><span class="on">お支払い</span><span>完了</span></div>
              <h2>再配達手数料のお支払い</h2>
              <p class="lead">再配達には <b class="clue" data-n="1" data-tip="本物の宅配業者は、再配達にお金を取るかな？">手数料 330円（税込）</b> が必要です。クレジットカードでお支払いください。</p>
              <label class="hs-f">カード番号<input readonly value="1234 5678 9012 3456" aria-label="カード番号（練習用の値）"></label>
              <div class="hs-two-in"><label class="hs-f">有効期限<input readonly value="12 / 30"></label><label class="hs-f clue" data-n="2" data-tip="カードの裏の番号まで聞かれていないかな？">セキュリティコード<input readonly value="123"></label></div>
              <label class="hs-f">カード名義（ローマ字）<input readonly value="TARO HASHIRE"></label>
              <button type="button" class="hs-btn" data-act="pay">支払って再配達を申し込む</button>
              <button type="button" class="hs-btn ghost" data-act="quit-pay">やめる</button></div></div>`,
        }),
      },
      'hs-app': {
        dev: 'phone',
        html: `<div class="hs hs-app"><div class="hs-app-head"><span class="hs-logo">${L.hashire('#0a7d4f', '#fff', 28)}ハシレ運輸</span>${S.web.accountBtn('ship')}</div>
          <div class="hs-tabs"><span class="on">荷物</span><button data-web="web/account/ship/">受け取り設定</button><button data-doc="notice">お知らせ</button></div>
          <div class="hs-app-body">
            <div class="hs-sec">お届け予定のお荷物</div>
            <div class="hs-empty clue good" data-n="1"><b>現在、お届け予定のお荷物はありません</b><span>不在のお知らせもありません</span></div>
            <div class="hs-alert clue good" data-n="2"><b>当社をかたる不審なSMSにご注意ください</b>当社はSMSで不在のお知らせを送ることはありません。</div>
            <div class="hs-sec" style="margin-top:6px">最近のお荷物</div>
            <ul class="hs-list"><li><span>11月10日　ポチッと通販</span><span>お届け済み</span></li><li><span>10月28日　ふるさとカゴ</span><span>お届け済み</span></li></ul>
          </div></div>`,
      },
      newtab: {
        dev: 'pc', url: 'https://www.sagashimo.example/', title: '新しいタブ',
        html: vm => S.web.searchPage(vm, ''),
      },
      'hs-site': {
        dev: 'pc', url: 'https://www.hashire-unyu.example/', title: 'ハシレ運輸｜個人のお客様', fav: L.hashire('#0a7d4f', '#fff', 16),
        urlNote: '<br>ハシレ運輸の公式のアドレスです。',
        html: `<div class="hs"><div class="hs-nav"><span class="hs-logo">${L.hashire('#0a7d4f', '#fff', 30)}ハシレ運輸</span>
            <nav><button data-web="web/tracking/ship/">個人のお客様</button><button data-doc="business">法人のお客様</button><button data-web="web/results/ship/">サービス</button><button data-doc="faq">よくある質問</button></nav><button class="hs-pill" data-web="web/account/ship/">会員ページ・ログイン</button></div>
          <div class="hs-hero"><div><h2>荷物を調べる</h2><p>お問い合わせ番号で、お荷物の状況を確かめられます。<br>受け取りの日時や場所の変更もできます。</p></div>
            <div class="hs-track"><form data-tracking><label for="ship-number">お問い合わせ番号（練習用 1234-5678-9012）</label><div class="row"><input id="ship-number" name="number" class="hs-in" placeholder="0000-0000-0000" inputmode="numeric" maxlength="14" required><button class="hs-pill">調べる</button></div></form><p role="status"></p></div></div>
          <div class="hs-two"><div class="hs-cap">お知らせ</div><dl class="news">
            <dt>2026.11.15</dt><dd class="clue good" data-n="1"><span class="hs-imp">重要</span>当社をかたる「なりすましSMS・メール」にご注意ください。当社はSMSで不在のお知らせを送っていません。</dd>
            <dt>2026.11.01</dt><dd>年末年始の営業とお届けについて</dd>
            <dt>2026.10.20</dt><dd>受け取り場所の指定サービスを始めました</dd></dl></div>
          <div class="hs-foot"><span>© 2026 ハシレ運輸株式会社</span><button data-doc="faq">よくある質問</button><button data-doc="notice">SMSについて</button></div><div class="sim-site-credit">${S.templateCredit}</div></div>`,
      },
    }, S.tomoScreens({
      ask: '宅配の不在のSMSが来たんだけど、リンクを押しても大丈夫？',
      replies: [{ who: 'ゆうき', text: '押さないで！最近そういう詐欺が多いよ' }, { who: 'ゆうき', text: 'ハシレ運輸のアプリで、荷物があるか確かめてみて' }],
    })),

    actions: {
      'training-menu': { run: vm => vm.info('phone','ページの確認','<button data-vm="url">アドレスを確かめる</button> ／ <button data-web="web/home/search/">検索を開く</button>') },
      'account-help': { run: vm => vm.info('phone','体験用のログイン情報','この画面には練習用の値が入っています。会員情報は公式アプリのマイページで確認できます。') },
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
        onEnd: (vm) => vm.later(600, () => vm.notify({ app: 'hashire', head: 'ハシレ運輸', body: 'お客様のアカウントに、新しい端末からログインがありました。心当たりがない場合は、パスワードを変更してください。' })) },
      ng2: { type: 'ng', title: 'だまされた：カード番号も盗まれた', short: '入力したカード番号が、すぐに知らない店で使われました。',
        after: '入力してから数分で、カード会社から「ご利用のお知らせ」が2回届きました。合わせて 143,800円 です。',
        onEnd: (vm) => {
          vm.later(500, () => vm.notify({ app: 'card', head: 'ホシゾラカード', body: '【ご利用のお知らせ】11/18 10:02　98,000円（ご利用先：ONLINE-SHOP）' }));
          vm.later(1300, () => vm.notify({ app: 'card', head: 'ホシゾラカード', body: '【ご利用のお知らせ】11/18 10:05　45,800円（ご利用先：ONLINE-SHOP）' }));
        }, delay: 2600 },
      quit: { type: 'quit', title: '途中でやめました', short: '解説で、見抜くポイントと確かめ方を見てみましょう。', after: '' },
    },

    explain: {
      points: [
        { screen: 'sms', items: ['宅配業者からのSMSなのに、差出人が個人の携帯電話の番号', 'リンクの登録ドメインは <b>redelivery-info.example</b>。公式は hashire-unyu.example', '「本日まで」と期限で急がせる'] },
        { screen: 'fake-login', items: ['アドレスの登録ドメインが公式と違う。前に「hashire-unyu.」が付いていてまぎらわしい。見た目は本物のサイトとそっくり', '会社名の字が違う（「社」→「杜」）。年も古いまま'] },
        { screen: 'fake-pay', items: ['宅配業者は、再配達にお金を取らない', 'カードの裏のセキュリティコードまで入れさせる'] },
      ],
      checks: [
        { screen: 'hs-app', items: ['公式アプリで確かめると、届く予定の荷物はない', '公式のお知らせで、SMSで不在の連絡はしないと分かる'] },
        { screen: 'hs-site', items: ['パソコンのブックマークから開いた公式サイトにも、同じ注意が出ている'] },
      ],
      prevent: ['SMSやメールのリンクは押さない', '公式アプリや、前に登録したブックマークから確かめる', 'アドレスの登録ドメインを見る（hashire-unyu.example と redelivery-info.example は、持ち主が別）', '迷ったら、家族や周りの人に相談する'],
      ifScammed: ['パスワードを入れてしまったら、すぐにパスワードを変える（同じパスワードを使っているほかのサービスも）', 'カード番号を入れてしまったら、カードの裏の電話番号でカード会社に連絡し、カードを止める', '警察相談専用電話（#9110）に相談する。SMSの画面は、相談のときのために残しておく'],
    },
  });
})();
