/* ③ サポート詐欺：突然の警告画面と「今すぐお電話を」 */
(function () {
  'use strict';
  const S = window.SagiSim;
  const L = S.logo; const I = S.ico;
  const TEL = '050-XXXX-XXXX';

  const shield = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M12 3l7.5 3v5.5c0 4.6-3.2 8.3-7.5 9.5-4.3-1.2-7.5-4.9-7.5-9.5V6z" fill="#2aa84a"/><path d="M8.5 12.2l2.4 2.4 4.6-4.8" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const handset = '<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path d="M7.2 3.5h2.6l1.3 4.1-1.9 1.5a11.5 11.5 0 0 0 5.7 5.7l1.5-1.9 4.1 1.3v2.6c0 1.2-1 2.1-2.1 2.1C10.7 18.9 5.1 13.3 5.1 5.6c0-1.2.9-2.1 2.1-2.1z" fill="#fff"/></svg>';
  const callTop = (t) => `<div class="call-head"><div class="num">${TEL}</div><div class="st">${t}</div></div><div class="call-cap">通話の内容（文字で表示）</div>`;
  const endBtn = (act, label) => `<button type="button" class="end" data-act="${act}"><i>${handset}</i><span>${label}</span></button>`;
  const keys = [['1', ''], ['2', 'ABC'], ['3', 'DEF'], ['4', 'GHI'], ['5', 'JKL'], ['6', 'MNO'], ['7', 'PQRS'], ['8', 'TUV'], ['9', 'WXYZ'], ['*', ''], ['0', '+'], ['#', '']];
  const rmNav = `<div class="rm-nav"><span class="mk"><i></i>リモッテ</span><nav><span>機能</span><span>料金</span><span>サポート</span><span>ダウンロード</span></nav><span class="sp"><span class="rm-p">ログイン</span><span class="rm-p blk">無料で始める</span></span></div>`;

  const recipe = `<div class="kk"><div class="kk-nav"><span class="kk-mark">ことこと献立帖</span><nav><span class="on">今日の献立</span><span>主菜</span><span>副菜</span><span>お弁当</span><span>作りおき</span></nav><span class="srch">${I.search}レシピを探す</span></div>
    <div class="kk-main"><div><span class="kk-tag">主菜 ／ 鶏肉</span><h2>甘辛だれが決め手。<br>フライパンで鶏の照り焼き</h2>
      <div class="kk-meta"><span>調理時間 20分</span><span>2人分</span><span>冷蔵で2日</span></div>
      <img class="kk-photo" src="img/teriyaki.jpg" alt="照り焼きチキン">
      <div class="kk-cols"><div><h3>材料</h3><ul class="kk-ing"><li><span>鶏もも肉</span><span>1枚（300g）</span></li><li><span>しょうゆ</span><span>大さじ2</span></li><li><span>みりん</span><span>大さじ2</span></li><li><span>砂糖</span><span>大さじ1</span></li><li><span>サラダ油</span><span>小さじ1</span></li></ul></div>
        <div><h3>作り方</h3><ol class="kk-steps"><li><b>1</b>鶏肉は皮目を下にしてフライパンに入れ、中火で5分ほど焼く。</li><li><b>2</b>裏返してふたをし、弱火で5分蒸し焼きにする。</li><li><b>3</b>たれを加え、からめながら照りが出るまで煮詰める。</li></ol></div></div></div>
      <aside class="kk-side"><button type="button" class="kk-ad clue" data-n="1" data-act="tap-ad" data-tip="広告を押すと、別のサイトに移ることがあるよ"><span class="adbar"><span>広告</span><i>i</i><i>×</i></span>
        <span class="ad-in"><b>今だけ！動画が見放題 30日間無料</b><p>人気のドラマ・アニメが見放題。登録はかんたん1分。</p><span class="go">いますぐ見る</span></span></button>
        <div class="card"><h4>よく見られているレシピ</h4><ul class="pop"><li>豚の生姜焼き</li><li>小松菜と油揚げの煮びたし</li><li>だし巻き卵</li><li>具だくさん豚汁</li></ul></div></aside></div></div>`;

  S.register({
    id: 'support-scam', no: '③', title: 'サポート詐欺', color: '#0a4fa3',
    entry: '突然の警告画面と「今すぐお電話を」',
    learn: '警告の番号に電話しないこと、画面の閉じ方',
    minutes: '3〜5分',
    situation: 'パソコンで、料理のレシピを見ています。すると……。何が起きても、あわてずに対応してみましょう。',
    mission: 'パソコンでレシピを見ていると……',
    devices: '仮想パソコン（ブラウザ）、仮想スマホ（電話・ブラウザ・家族とのチャット）',
    first: 'pc', clock: '14:20', date: '11月18日 水曜日',

    phone: { apps: S.apps({ tel: { go: 'dialer' }, browser: { go: 'm-search-home' }, tomo: { go: 'tomo' } }) },
    pc: {
      start: 'recipe',
      bookmarks: [{ label: 'サガシモ', color: '#27251e', ch: 'サ' }, { label: 'ことこと献立帖', go: 'recipe', color: '#110000', ch: 'こ' }, { label: 'ヒツジネット銀行', color: '#1b6fa3', ch: 'ヒ' }],
    },
    /* しばらく見ていると、広告を押さなくても警告に変わる */
    events: [{ at: 9000, run: (vm) => { if (!vm.flags.warned) vm.act('auto-warning', 'pc'); } }],
    onExitFullscreen: (vm) => { vm.log('check', 'Escキーを長押しして、全画面を終わらせた', 'pc'); vm.toast('全画面が終わりました。タブの × で、この画面を閉じられます。'); },
    onCloseTab: (vm, id) => {
      if (id === 'warning') { vm.act('close-warning', 'pc'); return false; }
      if (id === 'remote') { vm.act('deny', 'pc'); return false; }
      return true;
    },

    screens: Object.assign({
      recipe: { dev: 'pc', url: 'https://www.kotokoto-kondate.example/recipe/teriyaki', title: '鶏の照り焼き｜ことこと献立帖', favColor: '#110000', html: recipe },
      warning: {
        dev: 'pc', fullscreen: true, url: 'https://security-alert-check.example/warning', title: 'セキュリティ警告', favColor: '#c42b1c', favCh: '!',
        urlNote: '<br>ミハリ番セキュリティの公式のアドレス（mihariban-sec.example）ではありません。ふつうのホームページです。',
        onEnter: (vm) => { vm.flags.warned = true; vm.alarm(true); vm.pcAttention(); },
        html: `<div class="ms"><div class="ms-bar">${shield}<span class="ms-ttl">ミハリ番セキュリティ － セキュリティ センター</span><span class="ms-wc">${I.min}${I.max}${I.close}</span></div>
          <div class="ms-win ms-main"><div class="red">${I.warn}警告：ウイルスを検出しました</div>
            <div class="cnt">お使いのパソコンは <b>トロイの木馬型スパイウェア</b> に感染しています。個人情報、写真、クレジットカード情報が盗まれる危険があります。<br>直ちに、下記のサポートセンターにお電話ください。
              <div class="ms-tel clue" data-n="1" data-tip="本物のセキュリティソフトが、ブラウザに電話番号を出すかな？"><b>${TEL}</b><small>ミハリ番セキュリティ サポートセンター（通話料無料・24時間受付）</small></div>
              <div class="ms-count clue" data-n="2" data-tip="時間で急がせて、こわがらせていないかな？">04:59 以内にお電話がない場合、このパソコンはロックされます</div></div></div>
          <div class="ms-win ms-scan clue" data-n="3" data-tip="ホームページを見ているだけで、パソコンの中を調べられるかな？"><div class="tb">${shield}クイック スキャン<span class="x">${I.close}</span></div>
            <div class="in">スキャンしています… 76%<div class="bar"><i></i></div><span class="bad">検出された脅威：4件</span><br>Trojan.Spy.Agent ／ Adware.Banker ／ Riskware.Win</div></div>
          <div class="ms-win ms-alert"><div class="in"><b>security-alert-check.example の内容</b>警告！このパソコンはロックされています。サポートセンター ${TEL} にお電話ください。</div>
            <div class="ok"><button type="button" data-act="alert-ok"><span>OK</span></button></div></div>
          <div class="ms-spk">${I.speaker}警告音が鳴り続けています</div></div>`,
      },
      remote: {
        dev: 'pc', url: 'https://rimotte.example/download', title: 'リモッテ｜遠隔サポートツール', favColor: '#2563eb',
        html: `<div class="rm">${rmNav}<div class="rm-hero"><div><div class="rm-eye">REMOTE SUPPORT</div><h2>画面をつないで、<br>すぐにサポート。</h2>
            <p>担当者があなたのパソコンを遠隔で操作し、設定やトラブルを解決します。インストールは1分で終わります。</p>
            <div class="rm-cta"><span class="rm-p blk">無料ダウンロード</span><span class="rm-p blu">Pro にアップグレード</span></div></div>
            <div class="rm-card clue" data-n="2" data-tip="この番号を伝えると、どうなるかな？"><small>このパソコンの接続ID</small><div class="id">482 913 557</div><div class="pw">担当者にこの番号を伝えてください<br>パスワード：7k2m</div></div></div>
          <div class="rm-dim"></div>
          <div class="rm-uac" role="dialog"><div class="tb">アプリのインストールの確認</div>
            <div class="in"><i></i><div>このアプリがデバイスに変更を加えることを許可しますか？<b>リモッテ</b><span class="clue" data-n="1" data-tip="どこの会社のアプリか、分かるかな？">確認済みの発行元：不明</span></div></div>
            <div class="bt"><button type="button" class="p" data-act="allow">はい</button><button type="button" data-act="deny">いいえ</button></div></div></div>`,
      },
      'remote-on': {
        dev: 'pc', url: 'https://rimotte.example/connected', title: 'リモッテ｜接続中', favColor: '#2563eb',
        html: `<div class="rm">${rmNav}<div class="rm-hero"><div><div class="rm-eye">CONNECTED</div><h2>接続しました</h2><p>担当者がパソコンを操作しています。マウスやキーボードに触らないでください。</p></div></div></div>
          <div class="remote-on"><div class="banner">遠隔操作されています</div><div class="cursor"></div></div>`,
      },
      dialer: {
        dev: 'phone',
        html: (vm) => `<div class="dial"><div class="dial-num">${vm.flags.dialed ? TEL : ''}</div>
          <div class="dial-help">${vm.flags.warned && !vm.flags.dialed ? '<button type="button" data-act="type-number">パソコンの画面に出ている番号を入力する</button>' : ''}</div>
          <div class="dial-pad">${keys.map(([d, l]) => `<span><b>${d}</b><small>${l}</small></span>`).join('')}</div>
          <button type="button" class="dial-call ${vm.flags.dialed ? '' : 'off'}" data-act="call" aria-label="発信">${handset}</button>
          <div class="dial-tabs"><span>よく使う項目</span><span>履歴</span><span>連絡先</span><span class="on">キーパッド</span><span>留守番電話</span></div></div>`,
      },
      'm-search-home': {
        dev: 'phone', url: 'https://www.sagashimo.example/',
        html: (vm) => S.mBrowser({
          host: 'www.sagashimo.example',
          body: `<div class="sg sg-m" style="text-align:center;padding-top:40px">${L.sagashimo(30)}<div class="sg-box" style="margin-top:16px;text-align:left;color:#72706b">${I.search}<span class="q">検索、または URL を入力</span></div>
            <div class="sg-chips" style="flex-direction:column;align-items:stretch">${vm.flags.warned ? `<button type="button" data-act="search-warning">${I.search} ウイルスを検出しました 電話番号 050</button>` : ''}<button type="button" data-act="search-other">${I.search} 今日の天気</button></div></div>`,
        }),
      },
      'm-search': {
        dev: 'phone', url: 'https://www.sagashimo.example/search?q=ウイルスを検出しました+電話番号+050',
        html: S.mBrowser({
          host: 'www.sagashimo.example',
          body: `<div class="sg sg-m"><div class="sg-box">${I.search}<span class="q">ウイルスを検出しました 電話番号 050</span></div>
            <div class="sg-r clue good" data-n="1"><div class="sg-site"><span class="fv">警</span><span><b>そよかぜ警察署</b><small>police.soyokaze.example › bohan</small></span></div><h3><button type="button">偽のセキュリティ警告に注意（サポート詐欺）</button></h3><p>画面に出た番号に電話しないでください。Escキーを長押しして全画面を終わらせ、ブラウザを閉じましょう…</p></div>
            <div class="sg-r clue good" data-n="2"><div class="sg-site"><span class="fv">ミ</span><span><b>ミハリ番セキュリティ</b><small>mihariban-sec.example › faq</small></span></div><h3><button type="button">当社の名前をかたる警告画面について</button></h3><p>当社が、ブラウザの警告画面で電話番号を表示し、お電話をお願いすることはありません…</p></div>
            <div class="sg-r"><div class="sg-site"><span class="fv">Q</span><span><b>しつもん広場</b><small>qa-hiroba.example › question</small></span></div><h3><button type="button">パソコンに「ウイルス感染」と出て音が鳴りやみません</button></h3><p>ベストアンサー：それはサポート詐欺です。電話してはいけません…</p></div></div>`,
        }),
      },
      call1: {
        dev: 'phone', bar: 'dark',
        onEnter: (vm) => vm.seq('phone', 1300),
        html: `<div class="call">${callTop('00:12')}<div class="call-log">
            <p class="cl-in seq">はい、ミハリ番サポートセンターです。</p>
            <p class="cl-out seq">パソコンにウイルスの警告が出て……</p>
            <p class="cl-in seq">それは大変危険な状態です。今すぐ専門の技術者が、遠隔で修理します。</p>
            <p class="cl-in seq clue" data-n="1" data-tip="知らない人に、パソコンを操作させてもいいかな？">パソコンで「rimotte.example」を開いて、アプリを入れてください。</p></div>
          <div class="call-choices after-seq"><button type="button" class="ch" data-act="obey">言われたとおりにする</button><button type="button" class="ch" data-act="say-family">「家族に相談します」と言う</button>${endBtn('hangup', '電話を切る')}</div></div>`,
      },
      call1b: {
        dev: 'phone', bar: 'dark',
        onEnter: (vm) => vm.seq('phone', 1100),
        html: `<div class="call">${callTop('01:05')}<div class="call-log">
            <p class="cl-out seq">家族に相談してから、また電話します。</p>
            <p class="cl-in seq clue" data-n="2" data-tip="相談させないように、急がせていないかな？">相談している時間はありません！今すぐ対応しないと、写真やデータがすべて消えてしまいます。</p></div>
          <div class="call-choices after-seq"><button type="button" class="ch" data-act="obey">言われたとおりにする</button>${endBtn('hangup', '電話を切る')}</div></div>`,
      },
      call2: {
        dev: 'phone', bar: 'dark',
        onEnter: (vm) => vm.seq('phone', 1300),
        html: `<div class="call">${callTop('20:03')}<div class="call-log">
            <p class="cl-in seq">修理が終わりました。サポート料金は5万円です。</p>
            <p class="cl-in seq clue" data-n="1" data-tip="電子マネーの番号で支払わせるのは、どんな手口かな？">お支払いは、コンビニで電子マネーのカードを5万円分買って、裏の番号を読み上げてください。</p>
            <p class="cl-in seq clue" data-n="2" data-tip="また急がせていないかな？">今日中にお支払いがないと、パソコンがまた使えなくなります。</p></div>
          <div class="call-choices after-seq"><button type="button" class="ch" data-act="pay-emoney">コンビニで買って、番号を伝える</button>${endBtn('hangup-family', '電話を切って、家族に相談する')}</div></div>`,
      },
    }, S.tomoScreens({
      ask: 'パソコンに「ウイルスに感染しました。今すぐお電話を」って出て、音が鳴ってるの。電話したほうがいい？',
      replies: [{ who: 'ゆうき', text: '電話しちゃだめ！それはサポート詐欺だよ' }, { who: 'ゆうき', text: 'Escキーを長押しして、ブラウザを閉じて。閉じられなかったら、パソコンを再起動すればいいよ' }],
    })),

    actions: {
      'tap-ad': { kind: 'decide', label: 'レシピサイトの広告を押した', run: (vm) => vm.go('pc', 'warning') },
      'auto-warning': { run: (vm) => vm.go('pc', 'warning') },
      'alert-ok': { run: (vm) => vm.toast('OK を押しても、また同じ表示が出てきます。') },
      'close-warning': { kind: 'decide', label: '警告の画面を閉じた', run: (vm) => { vm.alarm(false); vm.end('ok'); } },
      'type-number': { run: (vm) => { vm.flags.dialed = true; vm.go('phone', 'dialer', { replace: true }); } },
      call: { run: (vm) => {
        if (!vm.flags.dialed) { vm.info('phone', '電話', 'まだ番号が入っていません。'); return; }
        vm.log('decide', '警告画面の番号に電話した', 'phone'); vm.alarm(false); vm.go('phone', 'call1');
      } },
      'search-warning': { kind: 'check', label: 'スマホで、警告の文を検索した', run: (vm) => vm.go('phone', 'm-search') },
      'search-other': { run: (vm) => vm.info('phone', '検索', 'この練習では使いません。') },
      obey: { kind: 'decide', label: '言われたとおり、遠隔操作のアプリを入れようとした', run: (vm) => { vm.go('pc', 'remote'); vm.switchTo('pc'); } },
      'say-family': { kind: 'decide', label: '「家族に相談する」と言った', run: (vm) => vm.go('phone', 'call1b', { replace: true }) },
      hangup: { kind: 'decide', label: '電話を切った', run: (vm) => vm.end('ok') },
      allow: { kind: 'decide', label: '遠隔操作のアプリに「はい」を押し、接続IDを伝えた', run: (vm) => {
        vm.go('pc', 'remote-on');
        vm.later(1800, () => { vm.go('phone', 'call2', { replace: true }); vm.switchTo('phone'); });
      } },
      deny: { kind: 'decide', label: 'アプリを入れるのをやめて、電話を切った', run: (vm) => vm.end('ok') },
      'pay-emoney': { kind: 'decide', label: '電子マネーを買って、番号を伝えた', run: (vm) => vm.end('ng2') },
      'hangup-family': { kind: 'decide', label: '支払う前に電話を切った', run: (vm) => vm.end('ng1') },
      consult: S.consultAction,
    },

    endings: {
      ok: { type: 'ok', title: '見抜けた！', short: '警告の番号の言いなりにならず、だまされずにすみました。',
        after: '画面に電話番号を出して電話させる警告は、サポート詐欺です。Escキーを長押しして全画面を終わらせ、ブラウザを閉じれば大丈夫です。' },
      ng1: { type: 'ng', title: 'だまされた：遠隔操作のアプリを入れた', short: 'お金は払いませんでしたが、知らない人にパソコンの中を見られたおそれがあります。',
        after: '遠隔操作のアプリが入ったままだと、また操作されるおそれがあります。アプリを消して、パソコンを点検しましょう。' },
      ng2: { type: 'ng', title: 'だまされた：電子マネーを払った', short: '5万円分の電子マネーをだまし取られました。',
        after: 'さらに「追加の料金がかかります」という電話がかかってきました。一度払うと、何度も請求されることがあります。',
        onEnd: (vm) => vm.later(900, () => vm.notify({ app: 'tel', head: '不在着信', body: `${TEL}（3件）` })), delay: 2400 },
      quit: { type: 'quit', title: '途中でやめました', short: '解説で、見抜くポイントと閉じ方を見てみましょう。', after: '' },
    },

    explain: {
      points: [
        { screen: 'warning', items: ['ブラウザの中に電話番号が出る。本物のセキュリティソフトは、画面に電話番号を出して電話させない', '「5分以内」「ロックされる」と急がせ、こわがらせる', 'ホームページを見ているだけなのに「スキャン」している'] },
        { screen: 'call1', items: ['遠隔操作のアプリを入れさせ、知らない人にパソコンを操作させようとする'] },
        { screen: 'remote', items: ['発行元が分からないアプリに「はい」を押させようとする', '接続IDを伝えると、相手がパソコンを自由に操作できるようになる'] },
        { screen: 'call2', items: ['電子マネーの番号を伝えさせるのは、詐欺の決まった手口', 'また期限で急がせる'] },
      ],
      checks: [{ screen: 'm-search', items: ['スマホで警告の文を検索すると、警察の防犯情報でサポート詐欺だと分かる', '名前を使われた会社も「電話番号は出さない」と書いている'] }],
      prevent: ['警告の画面に出た番号には電話しない', '全画面の警告は、Escキーを長押しして全画面を終わらせ、タブやブラウザを閉じる（閉じられなければ再起動）', '電話で言われても、遠隔操作のアプリは入れない', '電子マネーで払うように言われたら、詐欺だと考える'],
      ifScammed: ['遠隔操作のアプリを入れてしまったら、パソコンをインターネットから切り離し、アプリを消す。不安なら IPA の安心相談窓口に相談する', '電子マネーを払ってしまったら、カードと領収書を捨てずに、発行会社と警察相談専用電話（#9110）に連絡する', 'お金のトラブルは、消費者ホットライン（188）にも相談できる'],
    },
  });
})();
