/* ② 偽通販：検索で見つけた激安ショッピングサイト */
(function () {
  'use strict';
  const S = window.SagiSim;
  const L = S.logo; const I = S.ico;
  const SHOP = 'kutsuyasu-market.example';
  const ITEM = '定番キャンバススニーカー ローカット（男女兼用）';

  const sgTop = (q) => `<div class="sg-top">${L.sagashimo(26)}<div class="sg-box">${I.search}<span class="q">${S.esc(q)}</span>${I.mic}</div></div>
    <div class="sg-tabs"><span class="on">すべて</span><span>ショッピング</span><span>画像</span><span>ニュース</span><span>地図</span></div>`;
  const sgSite = (ch, name, url, st = '') => `<div class="sg-site"><span class="fv" ${st}>${ch}</span><span><b>${name}</b><small>${url}</small></span></div>`;
  const kyAnn = `<div class="ky-ann"><span class="clue" data-n="3" data-tip="日本語が少しおかしくないかな？">全商品は送料無料させていただきます！</span>　本日限りの大特価 SALE</div>`;
  const kyNav = (n) => `<div class="ky-nav"><nav><span>メンズ</span><span>レディース</span><span>キッズ</span><span>SALE</span></nav>
    <div class="ky-mark">KUTSU-YASU<small>MARKET</small></div><div class="ky-icons">${I.search}${I.user}${I.heart}<span class="bagn">${I.bag}<b>${n}</b></span></div></div>`;
  const kyFav = '<span class="fav" style="background:#000">K</span>';

  S.register({
    id: 'fake-shop', no: '②', title: '偽通販', color: '#111',
    entry: '検索で見つけた激安ショッピングサイト',
    learn: '会社情報と支払方法のチェック',
    minutes: '3〜5分',
    situation: '新しいスニーカーがほしくて、パソコンで「人気スニーカー 激安」と検索しました。とても安いお店が見つかりますが、そのお店は信用できるでしょうか？',
    mission: 'スニーカーを安全に買おう',
    devices: '仮想パソコン（ブラウザ・検索サイト）、仮想スマホ（銀行のアプリ・家族とのチャット）',
    first: 'pc', clock: '20:15', date: '11月18日 水曜日',

    phone: { apps: S.apps({ bank: { act: 'open-bank' }, tomo: { go: 'tomo' } }) },
    pc: {
      start: 'search1',
      bookmarks: [{ label: 'サガシモ', act: 'open-search', color: '#27251e', ch: 'サ' }, { label: 'ポチッと通販', act: 'open-pochitto', color: '#f08300', ch: 'ポ' }, { label: 'ことこと献立帖', color: '#110000', ch: 'こ' }],
    },
    onCloseTab: (vm, id) => {
      if (['shop', 'law', 'order'].includes(id)) { vm.act('close-shop', 'pc'); return false; }
      return true;
    },

    screens: Object.assign({
      search1: {
        dev: 'pc', url: 'https://www.sagashimo.example/search?q=人気スニーカー+激安', title: '人気スニーカー 激安 - サガシモ', favColor: '#27251e',
        html: `<div class="sg">${sgTop('人気スニーカー 激安')}<div class="sg-res"><div class="sg-count">約 1,240,000 件の結果</div>
          <div class="sg-r">${sgSite('K', 'KUTSU-YASU MARKET', `https://${SHOP} › sale`, 'style="background:#000;color:#fff;border-color:#000"')}
            <h3 class="clue" data-n="1" data-tip="「公式」「最大70%OFF」…ほかの店とくらべて安すぎないかな？"><button type="button" data-act="open-shop">【公式】人気スニーカーが最大70%OFF｜KUTSU-YASU MARKET</button></h3>
            <p>人気ブランドのスニーカーが今だけ最大70%OFF！全品送料無料・即日発送。在庫限りの閉店セールを開催中…</p></div>
          <div class="sg-r">${sgSite('ポ', 'ポチッと通販', 'https://www.pochitto.example › shoes', 'style="background:#f08300;color:#fff;border-color:#f08300"')}
            <h3><button type="button" data-act="open-pochitto">スニーカー 人気ランキング｜ポチッと通販</button></h3>
            <p>メンズ・レディースの人気スニーカーを毎日更新。レビュー 4.5以上の商品だけを集めました…</p></div>
          <div class="sg-r clue good" data-n="2">${sgSite('市', 'そよかぜ市', 'https://www.city.soyokaze.example › kurashi › shohi')}
            <h3><button type="button" data-act="open-city">偽の通販サイトにご注意ください｜そよかぜ市</button></h3>
            <p>極端に安い値段、銀行振込だけの支払い、会社の住所や電話番号がない、などに当てはまるサイトは…</p></div></div></div>`,
      },
      'search-home': {
        dev: 'pc', url: 'https://www.sagashimo.example/', title: 'サガシモ', favColor: '#27251e',
        html: (vm) => `<div class="sg sg-new">${L.sagashimo(40)}<div class="sg-box">${I.search}<span class="q">サガシモで検索、または URL を入力</span></div>
          <div class="sg-label">最近の検索</div>
          <div class="sg-chips"><button type="button" data-go="pc:search1">${I.search} 人気スニーカー 激安</button>
          ${vm.flags.shopSeen ? `<button type="button" data-act="search-review">${I.search} KUTSU-YASU MARKET 評判</button>` : ''}</div></div>`,
      },
      city: {
        dev: 'pc', url: 'https://www.city.soyokaze.example/kurashi/shohi/1004321.html', title: '偽の通販サイトにご注意ください｜そよかぜ市', favColor: '#2f6f4f',
        html: `<div class="city"><div class="city-util"><span>文字サイズ　標準　拡大</span><span>背景色</span><span>Foreign Language</span><span>サイトマップ</span></div>
          <div class="city-head"><span class="em">そ</span><span class="nm">そよかぜ市</span><span class="srch">${I.search}サイト内検索</span></div>
          <div class="city-gnav"><span>くらし・手続き</span><span>子育て・教育</span><span>健康・福祉</span><span>防災・安全</span><span>市政情報</span></div>
          <div class="city-crumb"><a>ホーム</a> ＞ <a>くらし・手続き</a> ＞ <a>消費生活</a> ＞ 偽の通販サイトにご注意ください</div>
          <div class="city-main"><h2>偽の通販サイトにご注意ください</h2><div class="city-meta">ページ番号 1004321　更新日：2026年11月10日</div>
            <p>インターネットの通販サイトで買い物をして、「お金を払ったのに商品が届かない」「店と連絡がつかない」という相談が増えています。</p>
            <div class="city-box clue good" data-n="1"><h3>次のようなサイトに注意しましょう</h3><ol>
              <li>ほかの店とくらべて、値段が極端に安い</li><li>支払い方法が銀行振込（前払い）だけ。振込先が個人の名前の口座</li>
              <li>「特定商取引法に基づく表記」に、住所・電話番号がない、またはおかしい</li><li>日本語が少し不自然。残り時間などで急がせる</li></ol></div>
            <p>あてはまるときは買わずに、店の名前で検索して評判を確かめましょう。困ったときは、消費者ホットライン（188）に相談してください。</p>
            <div class="city-contact">このページに関するお問い合わせ<br>そよかぜ市 消費生活センター　電話：0XX-XXX-XXXX（平日 9:00〜16:00）</div></div></div>`,
      },
      pochitto: {
        dev: 'pc', url: 'https://www.pochitto.example/shoes', title: 'スニーカー 人気ランキング｜ポチッと通販', favColor: '#f08300',
        html: `<div class="pt"><div class="pt-top"><span class="pt-mark">ポチッと<i>通販</i></span><span class="pt-search"><span>スニーカー</span><b>${I.search}</b></span></div>
          <div class="pt-cats"><span>すべて</span><span>メンズ</span><span>レディース</span><span>キッズ</span><span>ランキング</span></div>
          <div class="pt-h">スニーカー 人気ランキング ${I.chevron}</div>
          <div class="pt-grid">
            <div class="pt-card"><img src="img/sneaker-shelf.jpg" alt="" style="object-position:50% 30%"><div class="b">キャンバススニーカー ハイカット<div class="p">9,900円</div><div class="r">★4.6（1,204件）</div></div></div>
            <div class="pt-card"><img src="img/sneaker-navy.jpg" alt=""><div class="b">キャンバススニーカー ネイビー<div class="p">8,800円</div><div class="r">★4.5（872件）</div></div></div>
            <div class="pt-card"><img src="img/sneaker-red.jpg" alt="" style="object-position:20% 50%"><div class="b">キャンバススニーカー レッド<div class="p">8,800円</div><div class="r">★4.4（530件）</div></div></div>
            <div class="pt-card"><img src="img/sneaker-shelf.jpg" alt="" style="object-position:50% 80%"><div class="b">ローカット スニーカー<div class="p">7,700円</div><div class="r">★4.5（2,318件）</div></div></div></div>
          <button type="button" class="pt-buy" data-act="buy-trusted">いつもの店で、ふつうの値段で買う</button></div>`,
      },
      shop: {
        dev: 'pc', url: `https://${SHOP}/products/canvas-low-red`, title: '【閉店セール】KUTSU-YASU MARKET', fav: kyFav,
        urlNote: '<br>はじめて見るお店のアドレスです。アドレスだけでは安全かどうか分からないので、会社の情報や評判も確かめましょう。',
        onEnter: (vm) => { vm.flags.shopSeen = true; },
        html: `<div class="ky">${kyAnn}${kyNav(0)}<div class="ky-crumb">ホーム / スニーカー / ${ITEM}</div>
          <div class="ky-prod"><div class="ky-thumbs"><img class="on" src="img/sneaker-red.jpg" alt=""><img src="img/sneaker-navy.jpg" alt=""><img src="img/sneaker-shelf.jpg" alt=""></div>
            <img class="ky-main" src="img/sneaker-red.jpg" alt="赤いキャンバススニーカー">
            <div class="ky-info"><div class="ky-brand">KUTSU-YASU ORIGINAL</div><h2>${ITEM}</h2>
              <div class="ky-price clue" data-n="1" data-tip="ほかの店とくらべて、安すぎないかな？"><s>通常価格 14,300円</s><b>4,290円</b><span class="ky-off">70%OFF</span><span class="ky-tax">税込</span></div>
              <div class="ky-timer clue" data-n="2" data-tip="時間で急がせていないかな？">${S.svg('<circle cx="12" cy="13" r="7"/><path d="M12 9.5V13l2.5 1.5M9.5 3.5h5"/>', { s: 15 })}セール終了まで 00:14:59</div>
              <div class="ky-stock">残りわずか：あと3点</div>
              <div class="ky-opt">カラー：レッド<div class="ky-sw"><i class="on" style="background:#b8262b"></i><i style="background:#23304a"></i><i style="background:#f2f0ea;box-shadow:inset 0 0 0 1px #ccc"></i></div></div>
              <div class="ky-opt">サイズ<div class="ky-sizes"><span>23.0</span><span>24.0</span><span class="on">25.0</span><span>26.0</span><span class="out">27.0</span><span>28.0</span></div></div>
              <button type="button" class="ky-btn" data-act="order">カートに入れる</button><button type="button" class="ky-btn fill" data-act="order">今すぐ購入</button>
              <div class="ky-trust"><span>${I.check}本物保証100%</span><span>${I.check}安心安全</span><span>${I.check}即日発送</span></div></div></div>
          <div class="ky-foot"><button type="button" class="clue good" data-n="4" data-act="open-law">会社概要</button><button type="button" data-act="open-law">特定商取引法に基づく表記</button><button type="button" data-act="contact">お問い合わせ</button><button type="button" data-act="contact">配送・返品について</button><span>© KUTSU-YASU MARKET</span></div></div>`,
      },
      law: {
        dev: 'pc', url: `https://${SHOP}/pages/legal`, title: '特定商取引法に基づく表記｜KUTSU-YASU MARKET', fav: kyFav,
        html: `<div class="ky">${kyNav(0)}<div class="ky-law"><h2>特定商取引法に基づく表記</h2><dl>
          <div class="row"><dt>販売業者</dt><dd>クツヤス商事株式会社</dd></div>
          <div class="row"><dt>所在地</dt><dd><span class="clue" data-n="1" data-tip="住所は、番地まで書いてあるかな？">東京都中央区銀座1丁目</span></dd></div>
          <div class="row"><dt>電話番号</dt><dd><span class="clue" data-n="2" data-tip="電話番号は書いてあるかな？">お問い合わせはメールのみ受け付けております</span></dd></div>
          <div class="row"><dt>メールアドレス</dt><dd><span class="clue" data-n="3" data-tip="会社のメールアドレスかな？">kutsuyasu.shop2026@freemail.example</span></dd></div>
          <div class="row"><dt>お支払い方法</dt><dd><span class="clue" data-n="4" data-tip="支払い方法は何が選べるかな？">銀行振込のみ（前払い）</span></dd></div>
          <div class="row"><dt>商品の引渡し時期</dt><dd>ご入金の確認後、3〜5営業日以内に発送</dd></div>
          <div class="row"><dt>返品・交換</dt><dd>お客様のご都合による返品は承っておりません</dd></div></dl></div>
          <button type="button" class="ky-back law-back" data-back>← 商品ページに戻る</button></div>`,
      },
      search2: {
        dev: 'pc', url: 'https://www.sagashimo.example/search?q=KUTSU-YASU+MARKET+評判', title: 'KUTSU-YASU MARKET 評判 - サガシモ', favColor: '#27251e',
        html: `<div class="sg">${sgTop('KUTSU-YASU MARKET 評判')}<div class="sg-res"><div class="sg-count">約 312 件の結果</div>
          <div class="sg-r clue good" data-n="1">${sgSite('Q', 'しつもん広場', 'https://qa-hiroba.example › question › 88213')}
            <h3><button type="button">KUTSU-YASU MARKETで注文したのに商品が届きません</button></h3><p>先週、代金を振り込みましたが、商品が届かず、メールの返事もありません。同じ人はいますか？…</p></div>
          <div class="sg-r">${sgSite('ひ', '通販ひょうばん帳', 'https://tsuhan-hyoban.example › shop › kutsuyasu')}
            <h3><button type="button">KUTSU-YASU MARKETの口コミ・評判</button></h3><p><span class="sg-stars">★☆☆☆☆ 1.2</span>　「届かない」「連絡がつかない」という口コミが多数あります…</p></div>
          <div class="sg-r clue good" data-n="2">${sgSite('市', 'そよかぜ市', 'https://www.city.soyokaze.example › kurashi › shohi')}
            <h3><button type="button">相談が多い通販サイトの一覧｜そよかぜ市</button></h3><p>商品が届かないという相談が寄せられているサイト：KUTSU-YASU MARKET ほか…</p></div></div></div>`,
      },
      order: {
        dev: 'pc', url: `https://${SHOP}/checkouts/thank-you`, title: 'ご注文完了｜KUTSU-YASU MARKET', fav: kyFav,
        html: `<div class="ky"><div class="ky-nav"><span></span><div class="ky-mark">KUTSU-YASU<small>MARKET</small></div><span></span></div>
          <div class="ky-done"><div class="ky-done-l">
            <div class="ky-ok"><i>${I.check}</i><div><small>ご注文番号 #KY-20261118-0413</small><b>ご注文ありがとうございます</b></div></div>
            <div class="ky-box"><h3>お支払いについて</h3>下記の口座へ <b class="clue" data-n="2" data-tip="また急がせていないかな？">24時間以内</b> にお振込みください。お振込みの確認ができない場合、ご注文はキャンセルとなります。
              <dl class="ky-bank"><div><dt>銀行名</dt><dd>コトリ銀行</dd></div><div><dt>支店名</dt><dd>さくら支店</dd></div><div><dt>口座種別</dt><dd>普通</dd></div><div><dt>口座番号</dt><dd>1234XXX</dd></div>
                <div><dt>口座名義</dt><dd><span class="clue" data-n="1" data-tip="振込先は、お店（会社）の名前かな？">ヤマダ タロウ</span></dd></div><div><dt>お振込金額</dt><dd>4,290円</dd></div></dl></div>
            <div class="ky-box"><h3>発送について</h3>お振込みの確認後、3〜5営業日以内に発送します。</div>
            <button type="button" class="ky-btn fill" style="width:auto;display:inline-block;padding:12px 26px" data-act="go-bank">スマホの銀行アプリで振り込む</button></div>
            <div class="ky-done-r"><div class="ky-line"><span class="th"><img src="img/sneaker-red.jpg" alt=""><span class="qty">1</span></span><span class="nm">定番キャンバススニーカー ローカット<br><small style="color:#666">レッド / 25.0</small></span><span>4,290円</span></div>
              <div class="ky-sum"><div><span>小計</span><span>4,290円</span></div><div><span>配送料</span><span>無料</span></div><div class="tot"><span>合計</span><b>4,290円</b></div></div></div></div></div>`,
      },
      'bank-home': {
        dev: 'phone',
        html: `<div class="hb"><div class="hb-head"><span class="nm">${L.hitsuji(26)}ヒツジネット銀行</span>${I.menu}</div>
          <div class="hb-body"><div class="hb-kick">普通預金</div>
            <div class="hb-card"><div class="row bal"><small>残高</small><b>128,450円</b></div><div class="row"><small>口座</small>本店　普通　76XXXXX</div></div>
            <div class="hb-menu"><button type="button" data-act="bank-transfer-menu">振込 ${I.chevron}</button><button type="button" data-act="bank-other">入出金明細 ${I.chevron}</button><button type="button" data-act="bank-other">定期預金 ${I.chevron}</button><button type="button" data-act="bank-other">設定 ${I.chevron}</button></div></div></div>`,
      },
      'bank-transfer': {
        dev: 'phone',
        html: `<div class="hb"><div class="hb-head"><span class="nm">${L.hitsuji(26)}ヒツジネット銀行</span>${I.menu}</div>
          <div class="hb-body"><div class="hb-kick">振込</div><div class="hb-title">振込内容の確認</div>
            <div class="hb-card"><div class="row"><small>振込先</small><b>コトリ銀行　さくら支店</b><br>普通　1234XXX</div>
              <div class="row"><small>受取人名</small><b class="clue" data-n="1" data-tip="受取人は、お店（会社）の名前かな？">ヤマダ タロウ</b></div>
              <div class="row"><small>振込金額</small><b>4,290円</b></div><div class="row"><small>手数料</small><b>0円</b></div></div>
            <p class="hb-warn clue good" data-n="2">お振込み後の取り消しはできません。振込先をよくお確かめください。</p>
            <button type="button" class="hb-btn" data-act="transfer">振込を実行する</button>
            <button type="button" class="hb-btn ghost" data-act="cancel-transfer">やめる</button></div></div>`,
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
      contact: { run: (vm) => vm.info('pc', 'お問い合わせ', 'お問い合わせは、メールのフォームだけです。電話番号はのっていません。') },
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
        { screen: 'shop', items: ['定価の70%引き。ほかの店とくらべて安すぎる（見た目は、ふつうのきれいな通販サイトと変わらない）', '残り時間と「残りわずか」で急がせる', '日本語が少しおかしい（「送料無料させていただきます」）', '✓買う前に、ページの下の「会社概要」「特定商取引法に基づく表記」を見る'] },
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
