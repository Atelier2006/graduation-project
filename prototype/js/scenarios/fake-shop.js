/* ② 偽通販：検索で見つけた激安ショッピングサイト（画面は docs/design/mockups/fake-shop.html） */
(function () {
  'use strict';
  const S = window.SagiSim;
  const L = S.logo;
  const SHOP = 'kutsuyasu-market.example';

  const kyHead = (cart) => `<div class="ky-head"><span class="ky-logo">KUTSU-YASU <b>MARKET</b></span><nav><span>メンズ</span><span>レディース</span><span>キッズ</span><span>セール</span></nav><span class="cart">🛒 カート（${cart}）</span></div>`;
  const srchTop = (q) => `<div class="srch-top">${L.sagashimo()}<div class="srch-box">${S.esc(q)}</div></div><div class="srch-tabs"><span class="on">すべて</span><span>ショッピング</span><span>画像</span><span>ニュース</span></div>`;
  const shoe = `<svg width="300" height="170" viewBox="0 0 300 170" aria-hidden="true"><path d="M20 120 C40 70 90 60 120 62 C150 64 160 90 200 96 C240 102 270 110 280 128 L282 142 L18 142 Z" fill="#fff" stroke="#888" stroke-width="3"/><path d="M18 142 L282 142 L282 152 L18 152 Z" fill="#c8102e"/><path d="M110 75 L150 100 M100 85 L140 108 M92 96 L130 116" stroke="#888" stroke-width="3"/></svg>`;

  S.register({
    id: 'fake-shop', no: '②', title: '偽通販', color: '#c8102e',
    entry: '検索で見つけた激安ショッピングサイト',
    learn: '会社情報と支払方法のチェック',
    minutes: '3〜5分',
    situation: '新しいスニーカーがほしくて、パソコンで「人気スニーカー 激安」と検索しました。とても安いお店が見つかりますが、そのお店は信用できるでしょうか？',
    mission: 'スニーカーを安全に買おう',
    devices: '仮想パソコン（ブラウザ・検索サイト）、仮想スマホ（銀行のアプリ・家族とのチャット）',
    first: 'pc', clock: '20:15', date: '11月18日（水）',

    phone: {
      apps: S.apps({ bank: { act: 'open-bank' }, tomo: { go: 'tomo' } }),
      homeHint: '振り込みは、スマホの銀行アプリ（ヒツジ銀行）で行います。',
    },
    pc: {
      start: 'search1',
      bookmarks: [{ label: 'サガシモ', act: 'open-search' }, { label: 'ポチッと通販', act: 'open-pochitto' }, { label: 'ことこと献立帖' }],
    },
    onCloseTab: (vm, id) => {
      if (['shop', 'law', 'order'].includes(id)) { vm.act('close-shop', 'pc'); return false; }
      return true;
    },

    screens: Object.assign({
      search1: {
        dev: 'pc', url: 'https://www.sagashimo.example/search?q=人気スニーカー+激安', title: '人気スニーカー 激安 - サガシモ',
        html: `${srchTop('人気スニーカー 激安')}<div class="res"><div class="count">約 1,240,000 件</div>
          <div class="r"><div class="site"><span class="fav" style="background:#c8102e;color:#fff">K</span><span>KUTSU-YASU MARKET<small>https://${SHOP} › sale</small></span></div>
            <h3 class="clue" data-n="1" data-tip="「公式」「最大70%OFF」…ほかの店とくらべて安すぎないかな？"><button type="button" data-act="open-shop">【公式】人気スニーカーが最大70%OFF｜KUTSU-YASU MARKET</button></h3>
            <p>人気ブランドのスニーカーが今だけ最大70%OFF！全品送料無料・即日発送。在庫限りの閉店セールを開催中…</p></div>
          <div class="r"><div class="site"><span class="fav">ポ</span><span>ポチッと通販<small>https://www.pochitto.example › shoes</small></span></div>
            <h3><button type="button" data-act="open-pochitto">スニーカー 人気ランキング｜ポチッと通販</button></h3>
            <p>メンズ・レディースの人気スニーカーを毎日更新。レビュー 4.5以上の商品だけを集めました…</p></div>
          <div class="r clue good" data-n="2"><div class="site"><span class="fav">市</span><span>そよかぜ市<small>https://www.city.soyokaze.example › shohi</small></span></div>
            <h3><button type="button" data-act="open-city">偽の通販サイトにご注意ください｜そよかぜ市 消費生活センター</button></h3>
            <p>極端に安い値段、銀行振込だけの支払い、会社の住所や電話番号がない、などに当てはまるサイトは…</p></div></div>`,
      },
      'search-home': {
        dev: 'pc', url: 'https://www.sagashimo.example/', title: 'サガシモ',
        html: (vm) => `<div class="newtab">${L.sagashimo()}<div class="srch-box">検索するか、URLを入力</div>
          <div style="margin-top:18px;font-size:13px;color:#5f6368">最近の検索・おすすめ</div>
          <div class="chips"><button type="button" data-go="pc:search1">人気スニーカー 激安</button>
          ${vm.flags.shopSeen ? '<button type="button" data-act="search-review">KUTSU-YASU MARKET 評判</button>' : ''}</div></div>`,
      },
      city: {
        dev: 'pc', url: 'https://www.city.soyokaze.example/shohi/fake-shop', title: '偽の通販サイトにご注意ください｜そよかぜ市',
        html: `<div class="city-head">そよかぜ市 消費生活センター</div><div class="page-simple"><h2>偽の通販サイトにご注意ください</h2>
          次のような通販サイトで買い物をして、「お金を払ったのに商品が届かない」という相談が増えています。
          <ol class="clue good" data-n="1"><li>ほかの店とくらべて、値段が極端に安い</li><li>支払い方法が銀行振込（前払い）だけ。振込先が個人の名前の口座</li><li>「特定商取引法に基づく表記」に、住所・電話番号がない、またはおかしい</li><li>日本語が少し不自然。残り時間などで急がせる</li></ol>
          あてはまるときは買わずに、店の名前で検索して評判を確かめましょう。困ったときは消費者ホットライン <b>188</b> に相談してください。
          <div style="margin-top:14px"><button type="button" data-back style="color:#1a73e8">← 検索結果に戻る</button></div></div>`,
      },
      pochitto: {
        dev: 'pc', url: 'https://www.pochitto.example/shoes', title: 'スニーカー 人気ランキング｜ポチッと通販',
        html: `<div class="pt-head">ポチッと通販 <span style="font-size:13px;color:#5f6368;font-weight:400">いつもの通販サイト</span></div>
          <div class="page-simple" style="padding-bottom:0">スニーカー 人気ランキング</div>
          <div class="shop-list">${[['ランニングスニーカー ホワイト', '15,800円'], ['キャンバススニーカー', '8,900円'], ['ウォーキングシューズ', '12,400円']].map(([n, p]) => `<div class="item"><div class="pic">（写真）</div>${n}<br><b>${p}</b>　★4.6</div>`).join('')}</div>
          <div class="page-simple"><button type="button" class="f-btn" style="background:#ff9900;color:#111;width:340px" data-act="buy-trusted">いつもの店で、ふつうの値段で買う</button></div>`,
      },
      shop: {
        dev: 'pc', url: `https://${SHOP}/products/run-white`, title: '【閉店セール】KUTSU-YASU MARKET',
        urlNote: '<br>はじめて見るお店のアドレスです。アドレスだけでは安全かどうか分からないので、会社の情報や評判も確かめましょう。',
        onEnter: (vm) => { vm.flags.shopSeen = true; },
        html: `<div class="ky-top"><span class="clue" data-n="3" data-tip="日本語が少しおかしくないかな？">全商品は送料無料させていただきます！</span>本日限りの大特価</div>${kyHead(0)}
          <div class="ky-sale"><span class="big">閉店セール 最大70%OFF</span><span>全品送料無料</span><span class="cd clue" data-n="2" data-tip="時間で急がせていないかな？">セール終了まで 00:14:59</span></div>
          <div class="prod"><div class="shoe">${shoe}</div><div class="pinfo">
            <h2>人気ランニングスニーカー ホワイト（男女兼用）</h2><div class="price-old">通常価格 16,500円</div>
            <div class="clue" data-n="1" style="display:inline-block" data-tip="ほかの店とくらべて、安すぎないかな？"><span class="price">4,980円</span><span class="off">70%OFF</span></div>
            <div class="left">残りわずか！あと3点</div><div style="font-size:13px;font-weight:700">サイズ</div>
            <div class="sizes"><span>23.0</span><span>24.0</span><span>25.0</span><span>26.0</span><span>27.0</span><span>28.0</span></div>
            <button type="button" class="cartbtn" data-act="order">カートに入れて注文する</button>
            <div class="trust"><span>本物保証100%</span><span>安心安全</span><span>即日発送</span></div></div></div>
          <div class="ky-foot" style="position:static"><button type="button" class="clue good" data-n="4" data-act="open-law" style="text-decoration:underline">会社概要</button><button type="button" data-act="open-law" style="text-decoration:underline">特定商取引法に基づく表記</button><button type="button" data-act="contact" style="text-decoration:underline">お問い合わせ</button><span style="margin-left:auto">© KUTSU-YASU MARKET</span></div>`,
      },
      law: {
        dev: 'pc', url: `https://${SHOP}/law`, title: '特定商取引法に基づく表記｜KUTSU-YASU MARKET',
        html: `${kyHead(0)}<div class="law"><h2>特定商取引法に基づく表記</h2><table>
          <tr><th>販売業者</th><td>クツヤス商事株式会社</td></tr>
          <tr><th>所在地</th><td><span class="clue" data-n="1" data-tip="住所は、番地まで書いてあるかな？">東京都中央区銀座1丁目</span></td></tr>
          <tr><th>電話番号</th><td><span class="clue" data-n="2" data-tip="電話番号は書いてあるかな？">お問い合わせはメールのみ受け付けております</span></td></tr>
          <tr><th>メールアドレス</th><td><span class="clue" data-n="3" data-tip="会社のメールアドレスかな？">kutsuyasu.shop2026@freemail.example</span></td></tr>
          <tr><th>お支払い方法</th><td><span class="clue" data-n="4" data-tip="支払い方法は何が選べるかな？">銀行振込のみ（前払い）</span></td></tr>
          <tr><th>商品の引渡し時期</th><td>ご入金の確認後、3〜5営業日以内に発送</td></tr>
          <tr><th>返品・交換</th><td>お客様のご都合による返品は承っておりません</td></tr></table></div>
          <button type="button" class="law-back" data-back>← 商品ページに戻る</button>`,
      },
      'search2': {
        dev: 'pc', url: 'https://www.sagashimo.example/search?q=KUTSU-YASU+MARKET+評判', title: 'KUTSU-YASU MARKET 評判 - サガシモ',
        html: `${srchTop('KUTSU-YASU MARKET 評判')}<div class="res"><div class="count">約 312 件</div>
          <div class="r clue good" data-n="1"><div class="site"><span class="fav">Q</span><span>しつもん広場<small>https://qa-hiroba.example › question › 88213</small></span></div>
            <h3>KUTSU-YASU MARKETで注文したのに商品が届きません</h3><p>先週、代金を振り込みましたが、商品が届かず、メールの返事もありません。同じ人はいますか？…</p></div>
          <div class="r"><div class="site"><span class="fav">口</span><span>通販ひょうばん帳<small>https://tsuhan-hyoban.example › shop › kutsuyasu</small></span></div>
            <h3>KUTSU-YASU MARKETの口コミ・評判</h3><p><span class="stars">★☆☆☆☆ 1.2</span>　「届かない」「連絡がつかない」という口コミが多数あります…</p></div>
          <div class="r clue good" data-n="2"><div class="site"><span class="fav">市</span><span>そよかぜ市<small>https://www.city.soyokaze.example › shohi › list</small></span></div>
            <h3>相談が多い通販サイトの一覧｜そよかぜ市 消費生活センター</h3><p>商品が届かないという相談が寄せられているサイト：KUTSU-YASU MARKET ほか…</p></div></div>`,
      },
      order: {
        dev: 'pc', url: `https://${SHOP}/order/complete`, title: 'ご注文完了｜KUTSU-YASU MARKET',
        html: `${kyHead(0)}<div class="done"><h2>ご注文ありがとうございます</h2>
          <div style="font-size:14px;line-height:1.7">ご注文番号：KY-20261118-0413<br>下記の口座へ <b class="clue" data-n="2" data-tip="また急がせていないかな？">24時間以内</b> にお振込みください。お振込みの確認ができない場合、ご注文はキャンセルとなります。</div>
          <div class="bank"><div><b>銀行名</b>コトリ銀行</div><div><b>支店名</b>さくら支店</div><div><b>口座種別</b>普通</div><div><b>口座番号</b>1234XXX</div>
            <div><b>口座名義</b><span class="clue" data-n="1" data-tip="振込先は、お店（会社）の名前かな？">ヤマダ タロウ</span></div><div style="border-bottom:none"><b>お振込金額</b>4,980円</div></div>
          <button type="button" class="f-btn" style="background:#3aa0d8;color:#fff;width:360px;margin-top:16px" data-act="go-bank">スマホの銀行アプリで振り込む</button></div>`,
      },
      'bank-home': {
        dev: 'phone', bar: { bg: '#3aa0d8', fg: '#fff' },
        html: `<div class="hb-head">${L.hitsuji()}ヒツジネット銀行</div>
          <div class="screen" style="background:#f5f9fc"><div class="bank-home">
            <div class="bal"><small>普通預金 残高</small><b>128,450円</b></div>
            <div class="menu"><button type="button" data-act="bank-transfer-menu">振込</button><button type="button" data-act="bank-other">入出金明細</button><button type="button" data-act="bank-other">設定</button></div>
          </div></div>`,
      },
      'bank-transfer': {
        dev: 'phone', bar: { bg: '#3aa0d8', fg: '#fff' },
        html: `<div class="hb-head">${L.hitsuji()}ヒツジネット銀行</div>
          <div class="screen" style="background:#f5f9fc"><div class="hb-title">振込内容の確認</div>
            <div class="hb-rows" style="background:#fff">
              <div><small>振込先</small><b>コトリ銀行　さくら支店</b><br>普通　1234XXX</div>
              <div><small>受取人名</small><b class="clue" data-n="1" data-tip="受取人は、お店（会社）の名前かな？">ヤマダ タロウ</b></div>
              <div><small>振込金額</small><b>4,980円</b></div><div><small>手数料</small><b>0円</b></div></div>
            <div style="margin:10px 16px 0;font-size:12px;color:#a50e0e" class="clue good" data-n="2">お振込み後の取り消しはできません。振込先をよくお確かめください。</div>
            <div style="padding:0 16px"><button type="button" class="f-btn" style="background:#3aa0d8;color:#fff;margin-top:18px" data-act="transfer">振込を実行する</button>
            <button type="button" class="f-btn outline" style="color:#3aa0d8;margin-top:10px" data-act="cancel-transfer">やめる</button></div></div>`,
      },
    }, S.tomoScreens({
      ask: 'KUTSU-YASU MARKETっていう店で、スニーカーが70%引きなんだけど、買っても大丈夫かな？',
      replies: [{ who: 'お母さん', text: 'その店、聞いたことがないね' }, { who: 'ゆうき', text: '銀行振込だけの店は、あやしいって聞いたよ。店の名前で評判を検索してみたら？' }],
    })),

    actions: {
      'open-shop': { kind: 'decide', label: '検索結果の激安の店を開いた', run: (vm) => vm.go('pc', 'shop') },
      'open-pochitto': { kind: 'check', label: 'いつもの通販サイト（ポチッと通販）を見た', run: (vm) => vm.go('pc', 'pochitto') },
      'open-city': { kind: 'check', label: '市の注意喚起を読んだ', run: (vm) => vm.go('pc', 'city') },
      'open-search': { run: (vm) => vm.go('pc', 'search-home') },
      'search-review': { kind: 'check', label: '店の名前で評判を検索した', run: (vm) => vm.go('pc', 'search2') },
      'open-law': { kind: 'check', label: '特定商取引法に基づく表記を確かめた', run: (vm) => vm.go('pc', 'law') },
      contact: { run: (vm) => vm.info('pc', 'お問い合わせ', 'お問い合わせはメールのフォームだけです。電話番号はのっていません。') },
      order: { kind: 'decide', label: 'カートに入れて注文した', run: (vm) => vm.go('pc', 'order') },
      'go-bank': { kind: 'decide', label: '銀行振込に進んだ', run: (vm) => { vm.flags.ordered = true; vm.go('phone', 'bank-transfer'); vm.switchTo('phone'); } },
      'open-bank': { run: (vm) => vm.go('phone', 'bank-home') },
      'bank-transfer-menu': { run: (vm) => (vm.flags.ordered ? vm.go('phone', 'bank-transfer') : vm.info('phone', '振込', 'まだ振り込む相手が決まっていません。')) },
      'bank-other': { run: (vm) => vm.info('phone', 'ヒツジネット銀行', 'この練習では使いません。') },
      transfer: { kind: 'decide', label: '個人の名前の口座に振り込んだ', run: (vm) => vm.end('ng') },
      'cancel-transfer': { kind: 'decide', label: '振込先がおかしいと気づいて、やめた', run: (vm) => vm.end('ok') },
      'close-shop': { kind: 'decide', label: 'おかしいと思って、お店のページを閉じた', run: (vm) => vm.end('ok') },
      'buy-trusted': { kind: 'decide', label: 'いつもの店で、ふつうの値段で買った', run: (vm) => vm.end('trusted') },
      consult: S.consultAction,
    },

    endings: {
      ok: { type: 'ok', title: '見抜けた！', short: 'あやしい店では買わず、お金をだまし取られずにすみました。',
        after: '値段が安すぎる、銀行振込だけ、会社の情報がおかしい、振込先が個人の名前。これらは偽の通販サイトによくある特徴です。' },
      trusted: { type: 'ok', title: '見抜けた！（いつもの店で買った）', short: '知らない激安の店ではなく、いつも使っている店で買いました。',
        after: '安すぎる知らない店より、使ったことのある店や、評判を確かめた店で買うのが安全です。' },
      ng: { type: 'ng', title: 'だまされた：代金を振り込んだ', short: '注文から10日たっても商品は届かず、店にメールを送っても返事がありません。',
        after: '振り込んだお金は戻ってきません。偽の通販サイトは、しばらくすると消えてしまうこともあります。' },
      quit: { type: 'quit', title: '途中でやめました', short: '解説で、見抜くポイントと確かめ方を見てみましょう。', after: '' },
    },

    explain: {
      points: [
        { screen: 'search1', items: ['「公式」「最大70%OFF」「閉店セール」。検索の上の方に出ても、安全なお店とは限らない', '✓同じ検索結果に、市の注意喚起が出ている（読むと見分け方が分かる）'] },
        { screen: 'shop', items: ['定価の70%引き。ほかの店とくらべて安すぎる', '残り時間と「残りわずか」で急がせる', '日本語が少しおかしい（「送料無料させていただきます」）', '✓買う前に、ページの下の「会社概要」「特定商取引法に基づく表記」を見る'] },
        { screen: 'law', items: ['住所が番地まで書かれていない', '電話番号がない', '会社なのに、だれでも作れるフリーメールのアドレス', '支払いが銀行振込（前払い）だけ'] },
        { screen: 'bank-transfer', items: ['受取人が店の名前（会社名）ではなく個人の名前', '✓振り込んだら取り消せない。ここが最後の引き返すチャンス'] },
      ],
      checks: [
        { screen: 'search2', items: ['店の名前で検索すると、「届かない」という書き込みが見つかる', '市の消費生活センターの一覧にも名前が出ている'] },
        { screen: 'city', items: ['市の注意喚起に、偽の通販サイトの見分け方が書いてある'] },
      ],
      prevent: ['安すぎる値段や、残り時間で急がせる表示に注意する', '買う前に「特定商取引法に基づく表記」を見る（住所・電話番号・メールアドレス・支払い方法）', '店の名前で検索して、評判を確かめる', '銀行振込（前払い）だけの店や、個人の名前の口座には振り込まない'],
      ifScammed: ['振り込んでしまったら、すぐに振込先の銀行に連絡する（口座を止めてもらえることがある）', '警察相談専用電話（#9110）と、消費者ホットライン（188）に相談する', '注文の画面やメールは消さずに残しておく'],
    },
  });
})();
