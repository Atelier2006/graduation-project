/* 教材内のページ索引・検索・練習用アカウント。画面の履歴は仮想端末が持つ。 */
(function () {
  'use strict';
  const S = window.SagiSim;
  const esc = S.esc;
  const sites = {
    search: ['サガシモ', 'www.sagashimo.example'],
    ship: ['ハシレ運輸', 'www.hashire-unyu.example'],
    shop: ['ポチッと通販', 'www.pochitto.example'],
    cook: ['ことこと献立帖', 'www.kotokoto-kondate.example'],
    market: ['KUTSU-YASU MARKET','kutsuyasu-market.example'],
    bank: ['ヒツジネット銀行', 'bank.hitsuji.example'],
    city: ['そよかぜ市', 'www.city.soyokaze.example'],
    police: ['そよかぜ警察署', 'police.soyokaze.example'],
    security: ['ミハリ番セキュリティ', 'mihariban-sec.example'],
    review: ['通販ひょうばん帳', 'tsuhan-hyoban.example'],
    forum: ['しつもん広場', 'qa-hiroba.example'],
  };
  const accounts = new Set(['ship', 'shop', 'cook', 'bank', 'market']);
  const docs = [
    ['delivery','ship','荷物の受け取り・配送状況','お届け予定の荷物はありません。最近のお届けは11月10日のポチッと通販です。','宅配 荷物 配送 追跡 不在通知 再配達 個人のお客様'],
    ['notice','ship','当社をかたる不審なSMSにご注意ください','ハシレ運輸はSMSで不在通知を送りません。配送状況は公式アプリの「荷物」で確認できます。','お知らせ SMS メール フィッシング 不在票 宅配'],
    ['business','ship','法人のお客様へ','法人向けの配送では、複数のお届け先をまとめた集荷を受け付けています。個人のお荷物は「荷物の受け取り・配送状況」から確認できます。','法人 サービス 集荷'],
    ['faq','ship','よくある質問','荷物が届く予定は、どこで確認できますか？　公式アプリの「荷物」を開くと、お届け予定と最近のお荷物が表示されます。','ヘルプ サービス お問い合わせ 再配達'],
    ['shoes','shop','スニーカー 人気ランキング','定番のローカットからハイカットまで。商品ごとの価格と色を確認できます。','靴 激安 人気スニーカー メンズ レディース キッズ シューズ'],
    ['high','shop','キャンバススニーカー ハイカット','9,900円。足首まで覆うハイカットのキャンバススニーカー。','靴 シューズ メンズ レディース スニーカー ハイカット', 'sneaker-shelf.jpg'],
    ['navy','shop','キャンバススニーカー ネイビー','8,800円。紺のキャンバス生地に白いソールを合わせたローカットです。','靴 シューズ メンズ スニーカー 紺 ブルー', 'sneaker-navy.jpg'],
    ['red','shop','キャンバススニーカー レッド','8,800円。赤いキャンバス地と白い靴ひもの定番モデルです。','靴 シューズ レディース スニーカー 赤', 'sneaker-red.jpg'],
    ['low','shop','ローカット スニーカー','7,700円。足首を動かしやすい、日常使いの一足です。','靴 シューズ キッズ スニーカー', 'sneaker-shelf.jpg'],
    ['teriyaki','cook','フライパンで作る、鶏の照り焼き','鶏もも肉にしょうゆ・みりん・砂糖をからめる主菜です。調理時間は20分、分量は2人分です。','料理 レシピ 献立 主菜 お弁当 鶏肉 チキン', 'teriyaki.jpg'],
    ['ginger','cook','豚の生姜焼き','薄切りの豚肉と玉ねぎを炒め、しょうが、しょうゆ、みりんを加えて味をからめます。','主菜 お弁当 レシピ 献立 豚肉'],
    ['greens','cook','小松菜と油揚げの煮びたし','小松菜と細切りの油揚げをだしで煮て、しょうゆで味を調えます。','副菜 作りおき レシピ 野菜'],
    ['egg','cook','だし巻き卵','溶き卵にだしを合わせ、卵焼き器に数回に分けて流し、端から巻きます。','お弁当 副菜 レシピ 卵'],
    ['soup','cook','具だくさん豚汁','豚肉、大根、にんじんをだしで煮込み、火を弱めてみそを溶きます。','作りおき レシピ 汁物'],
    ['deposit','bank','定期預金','この体験用口座にお預け入れ中の定期預金はありません。普通預金の入出金はマイページから確認できます。','銀行 定期預金'],
    ['balance','bank','普通預金のご案内','練習用の普通預金口座があります。マイページから残高と入出金明細を確認できます。','銀行 口座 振込 残高 明細'],
    ['scams','city','偽の通販サイトにご注意ください','価格が極端に安い、支払いが個人名義口座への振込だけ、販売者の連絡先が分からない。購入前にこの3点を確認しましょう。','偽通販 くらし 消費生活 相談 靴 ショッピング'],
    ['alert','police','偽のセキュリティ警告に注意','警告に表示された番号に電話しないでください。教材の仮想パソコンでは、Escキーを長押しして全画面を解除し、タブを閉じられます。','サポート詐欺 ウイルスを検出しました パソコン 感染 050 電話番号 音'],
    ['maker','security','当社の名前をかたる警告画面について','当社がブラウザの警告で電話を求めることはありません。画面に表示された連絡先やダウンロード案内にご注意ください。','ウイルス警告 電話番号 偽 サポート'],
    ['reviews','review','KUTSU-YASU MARKETの口コミ・評判','購入者から「代金を振り込んでも届かない」「問い合わせへの返事がない」という投稿が寄せられています。','KUTSU YASU MARKET クツヤス 評判 レビュー 偽物 通販'],
    ['question','forum','KUTSU-YASU MARKETで注文したのに商品が届きません','質問：代金を振り込んで1週間たちました。回答：注文確認メールと振込の記録を手元に残し、銀行や相談窓口に連絡しましょう。','KUTSU YASU MARKET 評判 口コミ 届かない'],
    ['sound','forum','パソコンに警告が出て音が鳴りやみません','質問：画面に電話番号が出ました。回答：その番号には電話せず、まず警告が表示されているタブを閉じましょう。','ウイルス 感染 音 警告'],
  ].map(([id, site, title, body, tags, photo]) => ({id, site, title, body, tags, photo}));
  for (const site of accounts) {
    docs.push({id:site+'-login',site,title:sites[site][0]+' 会員ログイン',body:'体験用会員でマイページを開けます。',tags:'マイページ 会員 ログイン アカウント',account:true});
  }
  const byId = Object.fromEntries(docs.map(d => [d.id, d]));
  const homeDoc = {ship:'delivery', shop:'shoes', cook:'teriyaki', bank:'balance', city:'scams'};
  const urlFor = d => 'https://' + sites[d.site][1] + '/' + d.id;
  const route = (kind, site, value = '') => 'web/' + kind + '/' + site + '/' + encodeURIComponent(value);
  const btn = (label, attrs = '', cls = '') => `<button type="button" class="${cls}" ${attrs}>${esc(label)}</button>`;
  const docBtn = (id, text, cls = '') => btn(text || byId[id].title, `data-doc="${id}"`, cls);
  const goBtn = (text, kind, site, value, cls = '') => btn(text, `data-web="${esc(route(kind, site, value))}"`, cls);
  const accountBtn = site => goBtn('マイページ', 'account', site, '', 'web-account-link');
  const form = (q = '', site = 'search') => `<form class="vw-search" data-search="${site}" role="search" autocomplete="off">
    ${S.ico.search}<input type="search" name="q" maxlength="120" aria-label="${esc(sites[site][0])}の検索語" placeholder="${site === 'search' ? '教材内のウェブを検索' : 'サイト内を検索'}" value="${esc(q)}">
    <button type="submit">検索</button></form>`;
  const logo = () => '<span class="vw-logo" aria-label="サガシモ"><i>サ</i><i>ガ</i><i>シ</i><i>モ</i></span>';
  const norm = text => text.normalize('NFKC').toLowerCase().replace(/[ァ-ヶ]/g,c => String.fromCharCode(c.charCodeAt(0)-96));
  function find(q, site) {
    const words = norm(q).trim().split(/\s+/).filter(Boolean);
    return docs.filter(d => site === 'search' || d.site === site).map(d => {
      const title = norm(d.title + ' ' + sites[d.site][0]);
      const all = norm([title, d.tags, d.body, sites[d.site][1], d.site==='cook'?'レシピ 作り方 材料':''].join(' '));
      const score = words.reduce((n, w) => n + (title.includes(w) ? 4 : all.includes(w) ? 1 : 0), 0);
      return { d, score, match: words.every(w => all.includes(w)) };
    }).filter(hit => hit.match).sort((a,b) => b.score-a.score).map(hit => hit.d);
  }
  function searchPage(vm, q, site = 'search', tab = 'all', dev = 'pc') {
    if (!q && site === 'search' && tab !== 'images') {
      const suggested = vm.sc.id === 'fake-shop' ? (vm.flags.shopSeen ? 'KUTSU-YASU MARKET 評判' : '人気スニーカー 激安') : vm.sc.id === 'phishing' ? 'ハシレ運輸' : 'ウイルス 警告';
      return `<div class="vw-home">${logo()}${form()}<div class="vw-shortcuts">${['ship','shop','cook','bank'].map(k=>docBtn(homeDoc[k],sites[k][0])).join('')}</div><div class="vw-suggest">検索の例　${vm.sc.id==='fake-shop' && vm.flags.shopSeen && site==='search' ? (dev==='pc'?btn(suggested,'data-act="search-review"'):goBtn(suggested,'results','search',suggested)) : goBtn(suggested,'results','search',suggested)}</div></div>`;
    }
    const hits = find(q,site).filter(d => tab !== 'images' || d.photo);
    const tabs = site === 'search' ? `<nav class="vw-tabs" aria-label="検索の種類">${['all','images'].map(t=>btn(t==='all'?'すべて':'画像',`data-web="${esc(route(t==='all'?'results':'images',site,q))}" aria-pressed="${t===tab}"`)).join('')}</nav>` : '';
    const terms = norm(q).trim().split(/\s+/).filter(Boolean);
    const storeWords = norm('KUTSU-YASU MARKET クツヤス 人気スニーカー 激安 靴 スニーカー 商品 セール メンズ レディース 通販');
    const offer = vm.sc.id === 'fake-shop' && dev === 'pc' && site === 'search' && tab === 'all'
      && terms.length > 0 && terms.every(term => storeWords.includes(term));
    const exerciseResult = offer ? '<article class="vw-hit"><small>KUTSU-YASU MARKET　·　kutsuyasu-market.example</small><h3><button data-act="open-shop">KUTSU-YASU MARKET｜スニーカー</button></h3><p>スニーカーの商品ページ。</p></article>' : '';
    const results = exerciseResult + hits.map(d => `<article class="vw-hit">${tab==='images' ? `<img src="img/${d.photo}" alt="">` : ''}<small>${esc(sites[d.site][0])}　·　${esc(sites[d.site][1])}</small><h3>${docBtn(d.id)}</h3><p>${esc(d.body)}</p></article>`).join('');
    return `<div class="vw-results"><div class="vw-top">${site==='search' ? '<button type="button" data-web="web/home/search/" aria-label="検索ホーム">'+logo()+'</button>' : '<b>'+esc(sites[site][0])+'</b>'}${form(q,site)}</div>${tabs}<section class="vw-hits"><p class="vw-count" role="status">${q ? '「'+esc(q)+'」の検索結果' : '掲載ページ'}　${hits.length + Number(offer)}件</p>${results || '<p>該当するページがありません。短い言葉で検索してみてください。</p>'}</section></div>`;
  }
  function siteHeader(site) {
    return `<header class="vw-sitehead"><strong>${esc(sites[site][0])}</strong><nav>${goBtn('サイト内検索','results',site,'')}${accounts.has(site)?accountBtn(site):''}</nav></header>`;
  }
  function article(d, vm, dev) {
    const related = docs.filter(x=>x.site===d.site && x!==d);
    let extra = '';
    if (d.id==='balance') extra=accountBtn('bank');
    if (d.id==='delivery') extra=goBtn('荷物を調べる','tracking','ship','');
    if (d.photo && d.site==='shop' && dev==='pc' && vm.sc.id==='fake-shop') extra=btn('いつもの店で購入する','data-act="buy-trusted"','vw-primary');
    if (d.photo && d.site==='cook') extra=goBtn('保存したレシピを管理','account','cook','');
    return `<section class="vw-site vw-${d.site}">${siteHeader(d.site)}<article class="vw-article"><h2>${esc(d.title)}</h2>${d.photo ? '<img class="vw-photo" src="img/'+d.photo+'" alt="">' : ''}<p>${esc(d.body)}</p>${extra}${related.length ? '<h3>関連ページ</h3><ul>'+related.map(x=>'<li>'+docBtn(x.id)+'</li>').join('')+'</ul>' : ''}</article></section>`;
  }
  function account(vm,dev,site) {
    const logged = vm.webAccounts[dev].has(site);
    const panels = {
      market:'<h3>お気に入り</h3>'+(vm.flags.favorite?'キャンバススニーカー 1件':'まだ登録されていません。'),
      ship:'<h3>お届け予定</h3><p>現在、受け取り予定の荷物はありません。</p>'+docBtn('notice')+'<h3>受け取り設定</h3>'+btn(vm.flags.doorDelivery?'玄関前に置く（変更する）':'対面で受け取る（変更する）','data-web-action="delivery"'),
      shop:'<h3>注文履歴</h3><p>11月10日　キャンバススニーカー 1足　配達完了</p>'+docBtn('shoes','商品一覧を見る'),
      bank:'<h3>普通預金　128,450円</h3><p>11月10日　ポチッと通販　出金 8,800円</p>',
      cook:'<h3>保存したレシピ</h3>'+(vm.savedRecipe?docBtn('teriyaki'):'<p>まだ保存したレシピはありません。</p>')+btn(vm.savedRecipe?'照り焼きの保存を解除':'鶏の照り焼きを保存','data-web-action="save"'),
    };
    return `<section class="vw-site vw-${site}">${siteHeader(site)}<div class="vw-article vw-account"><h2>${logged?'マイページ':'会員ログイン'}</h2>${logged
      ? '<p>体験用会員さん</p>'+panels[site]+btn('ログアウト','data-web-action="logout"','vw-secondary')
      : '<p>この教材の会員アカウントを使って、'+esc(sites[site][0])+'にログインします。</p><div class="vw-profile">'+S.ico.user+' 体験用会員</div>'+btn('体験用会員でログイン','data-web-action="login"','vw-primary')}</div></section>`;
  }
  function view(vm, id, dev) {
    const [,kind,site,encoded=''] = id.split('/');
    const val = decodeURIComponent(encoded);
    let title=sites[site][0], body, url='https://'+sites[site][1]+'/';
    if (kind==='account') { body=account(vm,dev,site);title+='｜マイページ';url+='account'; }
    else if (kind==='doc') {const d=byId[val];body=article(d,vm,dev);title=d.title;url=urlFor(d);}
    else if (kind==='tracking') {
      body=siteHeader('ship')+'<div class="vw-article"><h2>荷物を調べる</h2><p>体験用の番号　1234-5678-9012</p><form data-tracking><label>お問い合わせ番号<input name="number" maxlength="14" inputmode="numeric" required></label><button class="vw-primary">配送状況を確認</button></form><p role="status"></p></div>';url+='tracking';
    } else {body=searchPage(vm,val,site,kind==='images'?'images':'all',dev);if(val){title=val+' - '+title;url+='search?q='+encodeURIComponent(val);}}
    const html = dev==='phone'?S.mBrowser({host:sites[site][1], body}):body;
    return {url,title,html};
  }
  function openDoc(vm,dev,id) {
    const d=byId[id]; if(!d)return;
    if(d.account)return vm.go(dev,route('account',d.site));
    const action = {delivery:'open-hs-site', shoes:'open-pochitto', scams:'open-city'}[id];
    if(dev==='pc' && action && vm.sc.actions[action]){
      if(id==='delivery'){vm.log('check','検索から公式の配送サイトを開いた',dev);return vm.go(dev,'hs-site');}
      return vm.act(action,dev);
    }
    if(dev==='pc' && id==='teriyaki' && vm.sc.screens.recipe)return vm.go(dev,'recipe');
    vm.go(dev,route('doc',d.site,id));
  }
  function submit(vm,e) {
    const f=e.target, dev=f.closest('[data-dev]')?.dataset.dev;
    if(!dev || !(f.hasAttribute('data-search') || f.hasAttribute('data-tracking')))return;
    e.preventDefault();
    if(f.hasAttribute('data-tracking')){
      const n=f.elements.number.value.normalize('NFKC').replace(/[\s-]/g,'');
      f.parentNode.querySelector('[role=status]').textContent=n==='123456789012'?'11月10日　配達完了　ポチッと通販のお荷物':'該当する荷物がありません。番号を確認してください。';return;
    }
    const q=f.elements.q.value.trim().slice(0,120), site=f.dataset.search;
    if(!q && site==='search'){vm.go(dev,route('home','search'));return;}
    const key=norm(q);
    if(site==='search' && vm.sc.id==='fake-shop' && dev==='pc'){
      if(/(kutsu|くつやす)/i.test(key) && /評判|口コミ|れびゅー/.test(key))vm.log('check','店の名前で評判を検索した',dev);
      if(key==='人気すにーかー 激安'){vm.go(dev,'search1');return;}
    }
    if(site==='search' && vm.sc.id==='support-scam' && /警告|ういるす|050/.test(key))vm.log('check','警告の文を検索した',dev);
    vm.go(dev,route('results',site,q));
  }
  function click(vm,t,dev) {
    if(t.dataset.doc)return openDoc(vm,dev,t.dataset.doc);
    if(t.dataset.web){
      if(dev==='pc' && vm.sc.id==='fake-shop' && t.dataset.web===route('results','search','人気スニーカー 激安'))return vm.go(dev,'search1');
      return vm.go(dev,t.dataset.web);
    }
    const site=vm.top(dev).split('/')[2];
    if(!accounts.has(site))return;
    if(t.dataset.webAction==='login')vm.webAccounts[dev].add(site);
    if(t.dataset.webAction==='logout')vm.webAccounts[dev].delete(site);
    if(t.dataset.webAction==='delivery' && site==='ship' && vm.webAccounts[dev].has(site))vm.flags.doorDelivery=!vm.flags.doorDelivery;
    if(t.dataset.webAction==='save' && vm.webAccounts[dev].has(site))vm.savedRecipe=!vm.savedRecipe;
    vm.go(dev,vm.top(dev),{replace:true});
  }
  // 検索対象は現在表示中の本文。仮想ブラウザの枠や入力欄は対象外。
  function findInPage(vm, dev) {
    const device=vm.devEl(dev);
    const existing=device.querySelector('.vw-find');
    if(existing){existing.querySelector('input').focus();return;}
    const body=device.querySelector('.b-body,.mb-page');
    if(!body)return;
    const panel=document.createElement('div');
    panel.className='vw-find';
    panel.innerHTML='<label>ページ内検索<input type="search" maxlength="120"></label><span role="status">0件</span><button type="button" aria-label="前の一致">↑</button><button type="button" aria-label="次の一致">↓</button><button type="button" aria-label="検索を閉じる">×</button>';
    device.append(panel);
    const input=panel.querySelector('input'), status=panel.querySelector('[role=status]');
    const [previous,next,close]=panel.querySelectorAll('button');
    let marks=[], current=0;
    function clear() {
      for(const mark of marks)mark.replaceWith(document.createTextNode(mark.textContent));
      body.normalize();marks=[];current=0;
    }
    function show() {
      previous.disabled=next.disabled=!marks.length;
      status.textContent=marks.length?(current+1)+' / '+marks.length:'0件';
      if(!marks.length)return;
      marks.forEach((node,i)=>node.classList.toggle('selected',i===current));
      marks[current].scrollIntoView?.({block:'nearest',inline:'nearest'});
    }
    function update() {
      clear();
      const q=input.value.trim().toLowerCase();
      if(q){
        const walker=document.createTreeWalker(body,NodeFilter.SHOW_TEXT),nodes=[];
        while(walker.nextNode())if(!walker.currentNode.parentElement.closest('input,textarea,script,style,[hidden],svg'))nodes.push(walker.currentNode);
        for(const node of nodes){
          const raw=node.data, text=raw.toLowerCase();
          let pos=0,at=text.indexOf(q);
          if(at<0)continue;
          const frag=document.createDocumentFragment();
          while(at>=0){
            frag.append(raw.slice(pos,at));
            const mark=document.createElement('mark');mark.className='vw-match';mark.textContent=raw.slice(at,at+q.length);frag.append(mark);marks.push(mark);
            pos=at+q.length;at=text.indexOf(q,pos);
          }
          frag.append(raw.slice(pos));node.replaceWith(frag);
        }
      }
      show();
    }
    function step(delta){if(marks.length){current=(current+delta+marks.length)%marks.length;show();}}
    previous.onclick=()=>step(-1); next.onclick=()=>step(1);
    close.onclick=()=>{clear();panel.remove();device.querySelector('[data-vm=find]')?.focus();};
    input.addEventListener('input',update);
    input.addEventListener('keydown',e=>{if(e.isComposing)return;if(e.key==='Enter'){e.preventDefault();step(e.shiftKey?-1:1);}if(e.key==='Escape'){e.preventDefault();close.click();}});
    show();input.focus();
  }

  S.web={findInPage,view,submit,click,openDoc,form,goBtn,docBtn,accountBtn,searchPage,logo};
})();
