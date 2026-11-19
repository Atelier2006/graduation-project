/* ③ サポート詐欺：突然の警告画面と「今すぐお電話を」（画面は docs/design/mockups/support-scam.html） */
(function () {
  'use strict';
  const S = window.SagiSim;
  const L = S.logo;
  const TEL = '050-XXXX-XXXX';

  const callHead = (time) => `<div class="call-head"><div class="num">${TEL}</div><div class="st">通話中　${time}</div></div>`;
  const recipe = `<div class="rc-head"><span class="rc-logo">ことこと献立帖</span><nav><span>今日の献立</span><span>主菜</span><span>副菜</span><span>お弁当</span></nav></div>
    <div class="rc-main"><div class="rc-art"><h2>簡単！鶏の照り焼き</h2><div class="rc-photo">（料理の写真）</div>
      <ul><li>鶏もも肉　1枚</li><li>しょうゆ・みりん　各大さじ2</li><li>砂糖　大さじ1</li></ul>
      <p style="font-size:14px;line-height:1.8">① 鶏肉の皮目をフライパンで焼く。② 裏返してふたをし、5分ほど蒸し焼きにする。③ たれを入れて、からめながら煮詰める。</p></div>
      <div class="rc-side"><div class="ad">広告<button type="button" class="box clue" data-n="1" data-act="tap-ad" data-tip="広告を押すと、別のサイトに移ることがあるよ" style="width:100%">今だけ！<br>無料で動画が見放題</button></div></div></div>`;

  S.register({
    id: 'support-scam', no: '③', title: 'サポート詐欺', color: '#0b3d91',
    entry: '突然の警告画面と「今すぐお電話を」',
    learn: '警告の番号に電話しないこと、画面の閉じ方',
    minutes: '3〜5分',
    situation: 'パソコンで、料理のレシピを見ています。すると……。何が起きても、あわてずに対応してみましょう。',
    mission: 'パソコンでレシピを見ていると……',
    devices: '仮想パソコン（ブラウザ）、仮想スマホ（電話・ブラウザ・家族とのチャット）',
    first: 'pc', clock: '14:20', date: '11月18日（水）',

    phone: {
      apps: S.apps({ tel: { go: 'dialer' }, browser: { go: 'm-search-home' }, tomo: { go: 'tomo' } }),
    },
    pc: {
      start: 'recipe',
      bookmarks: [{ label: 'サガシモ' }, { label: 'ことこと献立帖', go: 'recipe' }, { label: 'ヒツジネット銀行' }],
    },
    /* しばらく見ていると、広告を押さなくても警告に変わる */
    events: [{ at: 9000, run: (vm) => { if (!vm.flags.warned) vm.act('auto-warning', 'pc'); } }],
    onExitFullscreen: (vm) => { vm.log('check', 'Escキーを長押しして、全画面を終わらせた', 'pc'); vm.toast('全画面が終わりました。タブの ✕ で、この画面を閉じられます。'); },
    onCloseTab: (vm, id) => {
      if (id === 'warning') { vm.act('close-warning', 'pc'); return false; }
      if (id === 'remote') { vm.act('deny', 'pc'); return false; }
      return true;
    },

    screens: Object.assign({
      recipe: { dev: 'pc', url: 'https://www.kotokoto-kondate.example/recipes/teriyaki', title: '簡単！鶏の照り焼き｜ことこと献立帖', html: recipe },
      warning: {
        dev: 'pc', fullscreen: true, url: 'https://security-alert-check.example/warning', title: '⚠ セキュリティ警告',
        urlNote: '<br>ミハリ番セキュリティの公式のアドレス（mihariban-sec.example）ではありません。ふつうのホームページです。',
        onEnter: (vm) => { vm.flags.warned = true; vm.alarm(true); vm.pcAttention(); },
        html: `<div class="fs">
          <div class="fs-bar">⚠ ミハリ番セキュリティ　セキュリティ警告</div>
          <div class="fs-dlg"><div class="h">⚠ 警告：ウイルスを検出しました</div>
            <div class="b">お使いのパソコンは <b>トロイの木馬型スパイウェア</b> に感染しています。個人情報、写真、クレジットカード情報が盗まれる危険があります。<br>直ちに、下記のサポートセンターにお電話ください。
              <div class="tel clue" data-n="1" data-tip="本物のセキュリティソフトが、ブラウザに電話番号を出すかな？"><span class="num">${TEL}</span><small>ミハリ番セキュリティ サポートセンター（通話料無料・24時間受付）</small></div>
              <div class="countdown clue" data-n="2" data-tip="時間で急がせて、こわがらせていないかな？">04:59 以内にお電話がない場合、このパソコンはロックされます</div></div></div>
          <div class="scanlist clue" data-n="3" data-tip="ホームページを見ているだけで、パソコンの中を調べられるかな？">スキャン中…　76%<div class="bar"><i></i></div>感染ファイル：4件<br>Trojan.Spy.Agent ／ Adware.Banker</div>
          <div class="spk">🔊 警告音が鳴り続ける</div></div>`,
      },
      remote: {
        dev: 'pc', url: 'https://rimotte.example/download', title: 'リモッテ｜遠隔サポートツール',
        html: `<div class="rh-page"><h2>遠隔サポートツール リモッテ</h2>
          <div style="font-size:14px;color:var(--sub)">サポート担当者の指示にしたがって、アプリをダウンロードしてください。</div>
          <div class="rh-dl">ダウンロード（無料）</div>
          <div class="conn clue" data-n="2" data-tip="この番号を伝えると、どうなるかな？"><div style="font-size:13px;color:var(--sub)">接続番号を担当者に伝えてください</div><div class="id">482 913 557</div></div></div>
          <div class="dim"></div>
          <div class="osdlg" role="dialog"><div class="h">アプリのインストールの確認</div>
            <div class="b">このアプリがデバイスに変更を加えることを許可しますか？<br><b>リモッテ</b><br><span class="clue" data-n="1" data-tip="どこの会社のアプリか、分かるかな？">確認済みの発行元：不明</span></div>
            <div class="btns"><button type="button" class="p" data-act="allow" style="border:1px solid #1a73e8;border-radius:6px;padding:7px 22px;background:#1a73e8;color:#fff">はい</button><button type="button" data-act="deny" style="border:1px solid #bbb;border-radius:6px;padding:7px 22px">いいえ</button></div></div>`,
      },
      'remote-on': {
        dev: 'pc', url: 'https://rimotte.example/connected', title: 'リモッテ｜接続中',
        html: `<div class="rh-page"><h2>接続しました</h2><div style="font-size:14px;color:var(--sub)">担当者がパソコンを操作しています。マウスやキーボードに触らないでください。</div></div>
          <div class="remote-on"><div class="banner">遠隔操作されています</div><div class="cursor"></div></div>`,
      },
      dialer: {
        dev: 'phone',
        html: (vm) => `<div class="app-head"><button type="button" class="back" data-back aria-label="戻る">‹</button><span>電話</span></div>
          <div class="dial"><div class="num">&nbsp;</div>
            <div class="pad">${'123456789*0#'.split('').map((d) => `<span>${d}</span>`).join('')}</div>
            ${vm.flags.warned ? `<div class="recent">パソコンの警告画面に出ていた番号<button type="button" data-act="call">📞 ${TEL} に電話する</button></div>` : '<div class="recent">最近の通話はありません</div>'}</div>`,
      },
      'm-search-home': {
        dev: 'phone', url: 'https://www.sagashimo.example/',
        html: (vm) => `<div class="m-omni"><button type="button" class="bar" data-vm="url"><span class="lockmark">🔒</span><span class="host">www.sagashimo.example</span></button></div>
          <div class="screen web" style="text-align:center;padding-top:40px">${L.sagashimo()}<div class="m-srch" style="text-align:left;color:#9aa0a6">検索するか、URLを入力</div>
            <div class="chips">${vm.flags.warned ? '<button type="button" data-act="search-warning">ウイルスを検出しました 電話番号 050</button>' : ''}<button type="button" data-act="search-other">今日の天気</button></div></div>
          <div class="m-tool"><button type="button" data-back aria-label="戻る">‹</button><span>›</span><span>⇪</span><span>▢</span></div>`,
      },
      'm-search': {
        dev: 'phone', url: 'https://www.sagashimo.example/search?q=ウイルスを検出しました+電話番号+050',
        html: `<div class="m-omni"><button type="button" class="bar" data-vm="url"><span class="lockmark">🔒</span><span class="host">www.sagashimo.example</span><span class="path">/search?q=…</span></button></div>
          <div class="screen web"><div class="m-srch">ウイルスを検出しました 電話番号 050</div><div class="m-res">
            <div class="r clue good" data-n="1"><div class="site">そよかぜ警察署 › 防犯情報</div><h3>偽のセキュリティ警告に注意（サポート詐欺）</h3><p>画面に出た番号に電話しないでください。Escキーを長押しして全画面を終わらせ、ブラウザを閉じましょう…</p></div>
            <div class="r clue good" data-n="2"><div class="site">ミハリ番セキュリティ › よくある質問</div><h3>当社の名前をかたる警告画面について</h3><p>当社が、ブラウザの警告画面で電話番号を表示し、お電話をお願いすることはありません…</p></div>
            <div class="r"><div class="site">しつもん広場 › 質問</div><h3>パソコンに「ウイルス感染」と出て音が鳴りやみません</h3><p>ベストアンサー：それはサポート詐欺です。電話してはいけません…</p></div></div></div>
          <div class="m-tool"><button type="button" data-back aria-label="戻る">‹</button><span>›</span><span>⇪</span><span>▢</span></div>`,
      },
      call1: {
        dev: 'phone', bar: 'dark',
        onEnter: (vm) => vm.seq('phone', 1300),
        html: `<div class="call">${callHead('00:12')}</div><div class="screen call"><div class="chat">
            <div class="bub in seq">はい、ミハリ番サポートセンターです。</div>
            <div class="bub out seq">パソコンにウイルスの警告が出て……</div>
            <div class="bub in seq">それは大変危険な状態です。今すぐ専門の技術者が、遠隔で修理します。</div>
            <div class="bub in seq clue" data-n="1" data-tip="知らない人に、パソコンを操作させてもいいかな？">パソコンで「rimotte.example」を開いて、アプリを入れてください。</div></div></div>
          <div class="choices call after-seq"><button type="button" class="choice" data-act="obey">言われたとおりにする</button><button type="button" class="choice alt" data-act="say-family">家族に相談すると言う</button><button type="button" class="choice hang" data-act="hangup">電話を切る</button></div>`,
      },
      call1b: {
        dev: 'phone', bar: 'dark',
        onEnter: (vm) => vm.seq('phone', 1100),
        html: `<div class="call">${callHead('01:05')}</div><div class="screen call"><div class="chat">
            <div class="bub out seq">家族に相談してから、また電話します。</div>
            <div class="bub in seq clue" data-n="2" data-tip="相談させないように、急がせていないかな？">相談している時間はありません！今すぐ対応しないと、写真やデータがすべて消えてしまいます。</div></div></div>
          <div class="choices call after-seq"><button type="button" class="choice" data-act="obey">言われたとおりにする</button><button type="button" class="choice hang" data-act="hangup">電話を切る</button></div>`,
      },
      call2: {
        dev: 'phone', bar: 'dark',
        onEnter: (vm) => vm.seq('phone', 1300),
        html: `<div class="call">${callHead('20:03')}</div><div class="screen call"><div class="chat">
            <div class="bub in seq">修理が終わりました。サポート料金は5万円です。</div>
            <div class="bub in seq clue" data-n="1" data-tip="電子マネーの番号で支払わせるのは、どんな手口かな？">お支払いは、コンビニで電子マネーのカードを5万円分買って、裏の番号を読み上げてください。</div>
            <div class="bub in seq clue" data-n="2" data-tip="また急がせていないかな？">今日中にお支払いがないと、パソコンがまた使えなくなります。</div></div></div>
          <div class="choices call after-seq"><button type="button" class="choice" data-act="pay-emoney">コンビニで買って番号を伝える</button><button type="button" class="choice hang" data-act="hangup-family">電話を切って家族に相談する</button></div>`,
      },
    }, S.tomoScreens({
      ask: 'パソコンに「ウイルスに感染しました。今すぐお電話を」って出て、音が鳴ってるの。電話したほうがいい？',
      replies: [{ who: 'ゆうき', text: '電話しちゃだめ！それはサポート詐欺だよ' }, { who: 'ゆうき', text: 'Escキーを長押しして、ブラウザを閉じて。閉じられなかったら、パソコンを再起動すればいいよ' }],
    })),

    actions: {
      'tap-ad': { kind: 'decide', label: 'レシピサイトの広告を押した', run: (vm) => vm.go('pc', 'warning') },
      'auto-warning': { run: (vm) => vm.go('pc', 'warning') },
      'close-warning': { kind: 'decide', label: '警告の画面を閉じた', run: (vm) => { vm.alarm(false); vm.end('ok'); } },
      call: { kind: 'decide', label: '警告画面の番号に電話した', run: (vm) => { vm.alarm(false); vm.go('phone', 'call1'); } },
      'search-warning': { kind: 'check', label: 'スマホで、警告の文を検索した', run: (vm) => vm.go('phone', 'm-search') },
      'search-other': { run: (vm) => vm.info('phone', '検索', 'この練習では使いません。') },
      obey: { kind: 'decide', label: '言われたとおり、遠隔操作のアプリを入れようとした', run: (vm) => { vm.go('pc', 'remote'); vm.switchTo('pc'); } },
      'say-family': { kind: 'decide', label: '「家族に相談する」と言った', run: (vm) => vm.go('phone', 'call1b', { replace: true }) },
      hangup: { kind: 'decide', label: '電話を切った', run: (vm) => vm.end('ok') },
      allow: { kind: 'decide', label: '遠隔操作のアプリに「はい」を押し、接続番号を伝えた', run: (vm) => {
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
        onEnd: (vm) => vm.later(900, () => vm.notify({ app: 'tel', appName: '電話', icon: '☎', color: '#2fa84f', title: '不在着信', body: `${TEL}（3件）` })), delay: 2400 },
      quit: { type: 'quit', title: '途中でやめました', short: '解説で、見抜くポイントと閉じ方を見てみましょう。', after: '' },
    },

    explain: {
      points: [
        { screen: 'warning', items: ['ブラウザの中に電話番号が出る。本物のセキュリティソフトは、画面に電話番号を出して電話させない', '「5分以内」「ロックされる」と急がせ、こわがらせる', 'ホームページを見ているだけなのに「スキャン中」'] },
        { screen: 'call1', items: ['遠隔操作のアプリを入れさせ、知らない人にパソコンを操作させようとする'] },
        { screen: 'remote', items: ['発行元が分からないアプリに「はい」を押させようとする', '接続番号を伝えると、相手がパソコンを自由に操作できるようになる'] },
        { screen: 'call2', items: ['電子マネーの番号を伝えさせるのは、詐欺の決まった手口', 'また期限で急がせる'] },
      ],
      checks: [{ screen: 'm-search', items: ['スマホで警告の文を検索すると、警察の防犯情報でサポート詐欺だと分かる', '名前を使われた会社も「電話番号は出さない」と書いている'] }],
      prevent: ['警告の画面に出た番号には電話しない', '全画面の警告は、Escキーを長押しして全画面を終わらせ、タブやブラウザを閉じる（閉じられなければ再起動）', '電話で言われても、遠隔操作のアプリは入れない', '電子マネーで払うように言われたら、詐欺だと考える'],
      ifScammed: ['遠隔操作のアプリを入れてしまったら、パソコンをインターネットから切り離し、アプリを消す。不安なら IPA の安心相談窓口に相談する', '電子マネーを払ってしまったら、カードと領収書を捨てずに、発行会社と警察相談専用電話（#9110）に連絡する', 'お金のトラブルは、消費者ホットライン（188）にも相談できる'],
    },
  });
})();
