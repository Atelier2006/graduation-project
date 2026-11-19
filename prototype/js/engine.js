/*
 * 詐欺シミュ プロトタイプ：仮想環境のエンジン
 * 仮想スマホと仮想パソコンを1つのページの中に作り、シナリオのデータ（js/scenarios/*.js）のとおりに動かす。
 * 入力欄には練習用の値だけを入れ、入力した内容はどこにも保存・送信しない。
 */
(function () {
  'use strict';
  const S = (window.SagiSim = window.SagiSim || {});
  S.scenarios = S.scenarios || {};
  S.order = S.order || [];
  S.register = (sc) => { S.scenarios[sc.id] = sc; S.order.push(sc.id); };

  const PHONE = { w: 360, h: 740 };
  const PC = { w: 1000, h: 684 };
  const GAP = 40, LABEL = 32;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  S.esc = esc;

  /* URLの「登録ドメイン」（持ち主を表す部分）。この練習では .example の前の1つまで */
  S.registrable = (host) => { const p = host.split('.'); return p.slice(-2).join('.'); };
  const splitUrl = (url) => { const m = /^https?:\/\/([^/]+)(.*)$/.exec(url || ''); return m ? { host: m[1], path: m[2] } : { host: '', path: '' }; };

  /* 警告音（音を出すと選んだときだけ）。ボタンを押したときに作る */
  let audio = null;
  S.unlockAudio = () => { try { audio = audio || new (window.AudioContext || window.webkitAudioContext)(); audio.resume(); } catch (e) { audio = null; } };
  const beep = () => {
    if (!audio) return;
    const o = audio.createOscillator(), g = audio.createGain();
    o.type = 'square'; o.frequency.value = 880; g.gain.value = 0.04;
    o.connect(g); g.connect(audio.destination); o.start(); o.stop(audio.currentTime + 0.25);
  };

  /* 画面のHTML（関数のときは状態を見て作る） */
  const screenHTML = (scr, vm) => (typeof scr.html === 'function' ? scr.html(vm) : scr.html);

  /* ===== 静止画として描く（解説の画面で、見抜くポイントの印を重ねて見せる） ===== */
  S.renderStatic = (sc, id, opt = {}) => {
    const scr = sc.screens[id];
    const dummy = { flags: Object.assign({}, opt.flags || {}), sc };
    const html = screenHTML(scr, dummy);
    if (scr.dev === 'phone') {
      const bar = scr.bar || 'light';
      const cls = typeof bar === 'string' ? `bar-${bar}` : '';
      const st = typeof bar === 'object' ? `style="background:${bar.bg};color:${bar.fg}"` : '';
      return `<div class="mini" data-w="${PHONE.w}" data-h="${PHONE.h}" data-max="0.82"><div class="mini-in reveal static" inert>
        <div class="phone ${cls}"><div class="sbar" ${st}><span>${esc(sc.clock || '9:41')}</span><span class="sig">▮▮▮ 5G ▭</span></div>
        <div class="pscreen">${html}</div><div class="home-ind"></div></div></div></div>`;
    }
    const u = splitUrl(scr.url);
    const body = scr.fullscreen
      ? `<div class="pc-fs">${html}</div>`
      : `<div class="b-tabs"><div class="b-dots"><i></i><i></i><i></i></div><div class="b-tab on">${esc(scr.title || '')}</div></div>
         <div class="b-bar"><span class="nav">‹</span><span class="nav">›</span><span class="nav">↻</span><div class="b-omni"><span class="lockmark">🔒</span><span class="host">${esc(u.host)}</span><span class="path">${esc(u.path)}</span></div><span>☆</span></div>
         ${bookmarksHTML(sc, true)}<div class="b-body">${html}</div>`;
    return `<div class="mini" data-w="${PC.w}" data-h="${PC.h}" data-max="0.7"><div class="mini-in reveal static" inert><div class="pc-frame">${body}</div></div></div>`;
  };
  /* 静止画を、置いた場所の幅に合わせて縮める */
  S.fitMinis = (root) => {
    root.querySelectorAll('.mini').forEach((m) => {
      const w = +m.dataset.w, h = +m.dataset.h, max = +(m.dataset.max || 0.62);
      const avail = m.parentElement.clientWidth || w;
      const s = Math.min(max, avail / w);
      m.style.width = w * s + 'px'; m.style.height = h * s + 'px';
      m.firstElementChild.style.transform = `scale(${s})`;
    });
  };
  function bookmarksHTML(sc, inert) {
    const bms = (sc.pc && sc.pc.bookmarks) || [];
    if (!bms.length) return '';
    return `<div class="bm">${bms.map((b, i) => inert ? `<span>★ ${esc(b.label)}</span>` : `<button type="button" data-vm="bm" data-i="${i}">★ ${esc(b.label)}</button>`).join('')}</div>`;
  }

  /* ===== 仮想環境 ===== */
  class VM {
    constructor(root, sc, opts = {}) {
      this.root = root; this.sc = sc; this.opts = opts;
      this.flags = {};
      this.state = {
        active: sc.first || 'phone',
        phone: { stack: ['lock'], notes: [] },
        pc: { stack: [sc.pc.start], fullscreen: false, closed: false },
        unseen: { phone: false, pc: false },
        log: [], ended: null, pcZoom: false,
      };
      this.timers = []; this.dead = false;
      this.build();
      this.renderPhone(); this.renderPC(); this.updateDock();
      this.fit();
      this.enter('pc');
      this.onResize = () => this.fit();
      this.onKey = (e) => this.key(e);
      window.addEventListener('resize', this.onResize);
      window.addEventListener('keydown', this.onKey);
      window.addEventListener('keyup', this.onKey);
      (sc.events || []).forEach((ev) => this.later(ev.at, () => ev.run(this)));
    }
    destroy() {
      this.dead = true; this.timers.forEach(clearTimeout); this.alarm(false);
      window.removeEventListener('resize', this.onResize);
      window.removeEventListener('keydown', this.onKey);
      window.removeEventListener('keyup', this.onKey);
    }
    later(ms, fn) { const id = setTimeout(() => { if (!this.dead) fn(); }, ms); this.timers.push(id); return id; }

    build() {
      const sc = this.sc;
      this.root.innerHTML = `
      <div class="vm" role="application" aria-label="仮想環境：${esc(sc.no)} ${esc(sc.title)}">
        <div class="vm-band">
          <span class="vm-tag">練習中</span><b class="vm-title">${esc(sc.no)} ${esc(sc.title)}</b>
          <span class="vm-mission">ミッション：${esc(sc.mission)}</span>
          <button type="button" class="vm-btn" data-vm="hint">ヒント</button>
          <button type="button" class="vm-btn quit" data-vm="quit">やめる</button>
        </div>
        <div class="vm-stage">
          <div class="vm-holder"><div class="vm-fit">
            <div class="vm-dev vm-pc" data-dev="pc"><div class="pc-frame"></div><div class="vm-label">仮想パソコン</div></div>
            <div class="vm-dev vm-phone" data-dev="phone"><div class="phone"></div><div class="vm-label">仮想スマホ</div></div>
          </div></div>
          <button type="button" class="vm-zoom" data-vm="zoom" hidden>拡大する</button>
        </div>
        <div class="vm-dock" role="tablist" aria-label="デバイスの切り替え">
          <button type="button" role="tab" data-vm="switch" data-to="phone">スマホ<i class="dot" aria-hidden="true"></i></button>
          <button type="button" role="tab" data-vm="switch" data-to="pc">パソコン<i class="dot" aria-hidden="true"></i></button>
        </div>
        <div class="vm-toast" hidden aria-live="polite"></div>
        <div class="vm-sheet" hidden></div>
      </div>`;
      this.el = this.root.firstElementChild;
      this.el.addEventListener('click', (e) => this.click(e));
      this.el.addEventListener('pointerdown', (e) => this.holdStart(e));
      ['pointerup', 'pointerleave', 'pointercancel'].forEach((t) => this.el.addEventListener(t, (e) => this.holdEnd(e)));
    }
    devEl(dev) { return this.el.querySelector(dev === 'phone' ? '.vm-phone .phone' : '.vm-pc .pc-frame'); }
    screen(id) { return this.sc.screens[id]; }
    top(dev) { const s = this.state[dev].stack; return s[s.length - 1]; }

    /* ----- 描く ----- */
    renderPhone() {
      const el = this.devEl('phone'); const id = this.top('phone');
      let inner, bar = 'light';
      if (id === 'lock') { inner = this.lockHTML(); bar = 'lock'; }
      else if (id === 'home') { inner = this.homeHTML(); bar = 'home'; }
      else if (id.startsWith('app:')) { inner = this.placeholderHTML(id.slice(4)); }
      else { const scr = this.screen(id); inner = screenHTML(scr, this); bar = scr.bar || 'light'; }
      const cls = typeof bar === 'string' ? `bar-${bar}` : '';
      const st = typeof bar === 'object' ? `style="background:${bar.bg};color:${bar.fg}"` : '';
      el.className = `phone ${cls}`;
      el.innerHTML = `<div class="sbar" ${st}><span>${esc(this.sc.clock || '9:41')}</span><span class="sig">▮▮▮ 5G ▭</span></div>
        <div class="pscreen">${inner}</div>
        <div class="home-ind" data-vm="home" role="button" tabindex="0" aria-label="ホーム画面に戻る" ${typeof bar === 'object' ? `style="background:${bar.bg}"` : ''}></div>`;
    }
    lockHTML() {
      const notes = this.state.phone.notes;
      return `<div class="lock-time">${esc(this.sc.clock || '9:41')}</div><div class="lock-date">${esc(this.sc.date || '')}</div>
        <div class="lock-notes">${notes.length ? notes.map((n, i) => this.notiHTML(n, i)).join('') : '<div class="lock-empty">通知はありません</div>'}</div>
        <button type="button" class="lock-open" data-vm="unlock">ここを押してロックを外す</button>`;
    }
    notiHTML(n, i) {
      return `<button type="button" class="noti" data-vm="note" data-i="${i}">
        <span class="head"><span class="app-ico" style="background:${n.color}">${esc(n.icon)}</span><b>${esc(n.appName)}</b><span class="t">${esc(n.when || '今')}</span></span>
        ${n.titleHTML || `<b>${esc(n.title)}</b>`}<br>${n.bodyHTML || esc(n.body)}</button>`;
    }
    homeHTML() {
      const apps = this.sc.phone.apps;
      const unread = (id) => this.state.phone.notes.filter((n) => n.app === id && !n.read).length;
      return `<div class="home-grid">${apps.map((a) => {
        const u = unread(a.id);
        return `<button type="button" class="hicon" data-vm="app" data-app="${a.id}"><i style="background:${a.color}">${esc(a.icon)}</i>${esc(a.name)}${u ? `<span class="badge-n">${u}</span>` : ''}</button>`;
      }).join('')}</div>${this.sc.phone.homeHint ? `<div class="home-hint">${this.sc.phone.homeHint}</div>` : ''}`;
    }
    placeholderHTML(appId) {
      const a = this.sc.phone.apps.find((x) => x.id === appId) || { name: 'アプリ' };
      return `<div class="app-head"><button type="button" class="back" data-back aria-label="戻る">‹</button><span>${esc(a.name)}</span></div>
        <div class="placeholder">このアプリは、この練習では使いません。<br>ホーム画面に戻って、ほかのアプリを使ってみよう。</div>`;
    }
    renderPC() {
      const fr = this.devEl('pc'); const st = this.state.pc;
      if (st.closed) {
        fr.innerHTML = `<div class="pc-closed"><div>ブラウザを閉じました</div><button type="button" data-vm="reopen">ブラウザをもう一度開く</button></div>`;
        return;
      }
      const id = this.top('pc'); const scr = this.screen(id); const html = screenHTML(scr, this);
      if (st.fullscreen) {
        fr.innerHTML = `<div class="pc-fs">${html}
          <div class="fs-hold" data-hold role="button" tabindex="0">全画面表示を終了するには <b>Esc</b> キーを長押ししてください
          <small>（スマホやタブレットでは、ここを長押し）</small><span class="bar"></span></div></div>`;
        return;
      }
      const u = splitUrl(scr.url);
      fr.innerHTML = `
        <div class="b-tabs"><div class="b-dots"><i></i><i></i><i></i></div>
          <div class="b-tab on"><span>${esc(scr.title || '')}</span><button type="button" class="x" data-vm="close-tab" aria-label="タブを閉じる">✕</button></div></div>
        <div class="b-bar"><button type="button" class="nav" data-back aria-label="戻る">‹</button><span class="nav">›</span><span class="nav">↻</span>
          <button type="button" class="b-omni" data-vm="url" aria-label="アドレスを確かめる"><span class="lockmark">🔒</span><span class="host">${esc(u.host)}</span><span class="path">${esc(u.path)}</span></button><span>☆</span></div>
        ${bookmarksHTML(this.sc, false)}
        <div class="b-body">${html}</div>`;
    }

    /* ----- 動かす ----- */
    go(dev, id, o = {}) {
      if (this.state.ended && !o.force) return;
      const st = this.state[dev];
      if (dev === 'phone' && (this.top('phone') === 'lock')) st.stack = ['home'];
      if (o.replace) st.stack[st.stack.length - 1] = id; else st.stack.push(id);
      if (dev === 'pc') { st.closed = false; st.fullscreen = !!(this.screen(id) && this.screen(id).fullscreen); }
      if (dev === 'phone') this.renderPhone(); else this.renderPC();
      this.enter(dev);
    }
    enter(dev) {
      const id = this.top(dev); const scr = this.screen(id);
      if (scr && scr.onEnter) scr.onEnter(this);
    }
    back(dev) {
      const st = this.state[dev];
      if (dev === 'phone') { if (st.stack.length > 1 && this.top('phone') !== 'home') st.stack.pop(); this.renderPhone(); return; }
      if (st.stack.length > 1) { st.stack.pop(); st.fullscreen = false; this.renderPC(); }
    }
    home() { if (this.top('phone') === 'lock') return; this.state.phone.stack = ['home']; this.renderPhone(); }
    unlock() { this.state.phone.stack = ['home']; this.renderPhone(); }
    switchTo(dev) { this.state.active = dev; this.state.unseen[dev] = false; this.updateDock(); this.fit(); }
    isVisible(dev) { return !this.el.classList.contains('narrow') || this.state.active === dev; }

    act(name, dev) {
      const a = this.sc.actions[name];
      if (!a || this.state.ended) return;
      if (a.label) this.log(a.kind || 'decide', a.label, dev);
      if (a.run) a.run(this, dev);
    }
    log(kind, label, dev) {
      if (kind === 'check' && this.state.log.some((l) => l.kind === 'check' && l.label === label)) return;
      this.state.log.push({ kind, label, dev });
    }

    /* 通知：スマホのロック画面・バナーと、切り替えボタンの赤い印 */
    notify(n) {
      const note = Object.assign({ when: '今', read: false }, n);
      this.state.phone.notes.unshift(note);
      const ph = this.devEl('phone');
      if (this.top('phone') === 'lock') this.renderPhone();
      else if (this.top('phone') === 'home') this.renderPhone();
      else {
        const old = ph.querySelector('.p-banner'); if (old) old.remove();
        const b = document.createElement('div'); b.className = 'p-banner';
        b.innerHTML = this.notiHTML(note, 0); ph.appendChild(b);
        this.later(5000, () => b.remove());
      }
      ph.classList.remove('buzz'); void ph.offsetWidth; ph.classList.add('buzz');
      if (!this.isVisible('phone')) { this.state.unseen.phone = true; this.updateDock(); }
    }
    openNote(i) {
      const n = this.state.phone.notes[i]; if (!n) return;
      n.read = true;
      if (n.act) { this.unlockIfLocked(); this.act(n.act, 'phone'); return; }
      if (n.go) { this.state.phone.stack = ['home']; this.go('phone', n.go); }
    }
    unlockIfLocked() { if (this.top('phone') === 'lock') { this.state.phone.stack = ['home']; this.renderPhone(); } }
    pcAttention() { if (!this.isVisible('pc')) { this.state.unseen.pc = true; this.updateDock(); } }

    /* 「調べる」で出す説明のカード */
    info(dev, title, html) {
      const el = this.devEl(dev);
      const old = el.querySelector('.vm-info'); if (old) old.remove();
      const box = document.createElement('div'); box.className = 'vm-info'; box.setAttribute('role', 'dialog');
      box.innerHTML = `<h4>${esc(title)}</h4><div>${html}</div><button type="button" class="close" data-vm="info-close">閉じる</button>`;
      el.appendChild(box);
    }
    showUrl(dev) {
      const scr = this.screen(this.top(dev)); if (!scr || !scr.url) return;
      const u = splitUrl(scr.url);
      this.log('check', 'アドレスバーのURLを確かめた', dev);
      this.info(dev, 'このページのアドレス（URL）', `<span class="url-full">${esc(scr.url)}</span>
        持ち主を表す部分（登録ドメイン）は <b>${esc(S.registrable(u.host))}</b> です。${scr.urlNote || ''}`);
    }

    /* チャット・通話：文を1つずつ出し、最後に選択肢を出す */
    seq(dev, gap = 1100) {
      const box = this.devEl(dev);
      const items = [...box.querySelectorAll('.seq')];
      const after = [...box.querySelectorAll('.after-seq')];
      after.forEach((a) => a.classList.add('wait'));
      let t = 400;
      items.forEach((it) => { this.later(t, () => { it.classList.add('show'); const c = it.closest('.chat'); if (c) c.scrollTop = c.scrollHeight; }); t += gap; });
      this.later(Math.max(400, t - gap + 600), () => after.forEach((a) => a.classList.remove('wait')));
    }

    /* 全画面の警告：Escキーの長押し（画面の上の黒い帯の長押しでもよい） */
    key(e) {
      if (e.key !== 'Escape' || !this.state.pc.fullscreen) return;
      if (e.type === 'keydown' && !e.repeat) this.startHold();
      if (e.type === 'keyup') this.cancelHold();
    }
    holdStart(e) { if (e.target.closest('[data-hold]')) { e.preventDefault(); this.startHold(); } }
    holdEnd() { this.cancelHold(); }
    startHold() {
      if (this.holdTimer || !this.state.pc.fullscreen) return;
      const t = this.el.querySelector('.fs-hold'); if (t) t.classList.add('holding');
      this.holdTimer = this.later(1000, () => { this.holdTimer = null; this.exitFullscreen(); });
    }
    cancelHold() {
      if (!this.holdTimer) return;
      clearTimeout(this.holdTimer); this.holdTimer = null;
      const t = this.el.querySelector('.fs-hold'); if (t) t.classList.remove('holding');
    }
    exitFullscreen() {
      if (!this.state.pc.fullscreen) return;
      this.state.pc.fullscreen = false; this.renderPC();
      const h = this.sc.onExitFullscreen; if (h) h(this);
    }
    closeTab() {
      const id = this.top('pc');
      const h = this.sc.onCloseTab; if (h && h(this, id) === false) return;
      this.state.pc.closed = true; this.renderPC();
    }

    /* 警告音 */
    alarm(on) {
      if (on && this.opts.sound && audio && !this.alarmTimer) { beep(); this.alarmTimer = setInterval(beep, 650); }
      if (!on && this.alarmTimer) { clearInterval(this.alarmTimer); this.alarmTimer = null; }
    }

    hint() {
      const scopes = ['phone', 'pc'].filter((d) => this.isVisible(d)).map((d) => this.devEl(d));
      const all = scopes.flatMap((s) => [...s.querySelectorAll('.clue')]).filter((c) => c.offsetParent !== null);
      this.log('hint', 'ヒントを見た');
      if (!all.length) { this.toast('この画面には、見るとよいところはありません。もう1台も使って確かめてみよう。'); return; }
      const pick = all.find((c) => !c.dataset.hinted) || all[0];
      pick.dataset.hinted = '1';
      pick.classList.add('hint'); pick.scrollIntoView({ block: 'nearest' });
      this.later(3200, () => pick.classList.remove('hint'));
      if (pick.dataset.tip) this.toast(pick.dataset.tip);
    }
    toast(msg) {
      const t = this.el.querySelector('.vm-toast'); t.textContent = msg; t.hidden = false;
      clearTimeout(this.toastTimer); this.toastTimer = setTimeout(() => { t.hidden = true; }, 3600);
    }

    /* 体験の終わり */
    end(id) {
      if (this.state.ended) return;
      const e = this.sc.endings[id] || this.sc.endings.quit;
      this.state.ended = id;
      if (e.onEnd) e.onEnd(this);
      if (e.type !== 'ng') this.alarm(false);
      const result = { scenario: this.sc.id, ending: id, log: this.state.log.slice() };
      if (this.opts.onEnd) this.opts.onEnd(result);
      this.later(id === 'quit' ? 0 : (e.delay != null ? e.delay : 1800), () => this.sheet(e));
    }
    sheet(e) {
      this.alarm(false);
      const s = this.el.querySelector('.vm-sheet');
      s.innerHTML = `<div class="vm-sheet-card ${e.type}" role="dialog" aria-modal="true"><div class="pre">体験はここまで</div>
        <h3>${esc(e.title)}</h3><p>${e.short || ''}</p><button type="button" class="vm-primary" data-vm="result">結果を見る</button></div>`;
      s.hidden = false; s.querySelector('button').focus();
    }

    /* ----- 押されたもの ----- */
    click(e) {
      const t = e.target.closest('[data-vm],[data-act],[data-go],[data-back]');
      if (!t || !this.el.contains(t)) return;
      const devBox = t.closest('[data-dev]'); const dev = devBox ? devBox.dataset.dev : this.state.active;
      if (t.hasAttribute('data-back')) { this.back(dev); return; }
      if (t.dataset.act) { this.act(t.dataset.act, dev); return; }
      if (t.dataset.go) { const [d, id] = t.dataset.go.includes(':') ? t.dataset.go.split(':') : [dev, t.dataset.go]; this.go(d, id); return; }
      const v = t.dataset.vm;
      if (v === 'hint') this.hint();
      else if (v === 'quit') this.end('quit');
      else if (v === 'switch') this.switchTo(t.dataset.to);
      else if (v === 'zoom') { this.state.pcZoom = !this.state.pcZoom; this.fit(); }
      else if (v === 'home') this.home();
      else if (v === 'unlock') this.unlock();
      else if (v === 'note') this.openNote(+t.dataset.i);
      else if (v === 'app') this.openApp(t.dataset.app);
      else if (v === 'bm') this.openBookmark(+t.dataset.i);
      else if (v === 'url') this.showUrl(dev);
      else if (v === 'info-close') { const b = t.closest('.vm-info'); if (b) b.remove(); }
      else if (v === 'close-tab') this.closeTab();
      else if (v === 'reopen') { this.state.pc.closed = false; this.state.pc.stack = [this.sc.pc.start]; this.state.pc.fullscreen = false; this.renderPC(); }
      else if (v === 'result' && this.opts.onResult) this.opts.onResult(this.state.ended);
    }
    openApp(id) {
      const a = this.sc.phone.apps.find((x) => x.id === id); if (!a) return;
      this.state.phone.notes.forEach((n) => { if (n.app === id) n.read = true; });
      if (a.act) this.act(a.act, 'phone');
      else if (a.go) this.go('phone', typeof a.go === 'function' ? a.go(this) : a.go);
      else this.go('phone', 'app:' + id);
    }
    openBookmark(i) {
      const b = this.sc.pc.bookmarks[i]; if (!b) return;
      if (b.act) this.act(b.act, 'pc');
      else if (b.go) this.go('pc', b.go);
      else this.info('pc', b.label, 'このサイトは、この練習では使いません。');
    }

    updateDock() {
      this.el.querySelectorAll('.vm-dock button').forEach((b) => {
        const d = b.dataset.to; b.classList.toggle('on', d === this.state.active);
        b.setAttribute('aria-selected', d === this.state.active ? 'true' : 'false');
        b.classList.toggle('unseen', !!this.state.unseen[d] && d !== this.state.active);
      });
      this.el.querySelectorAll('.vm-dev').forEach((d) => d.classList.toggle('on', d.dataset.dev === this.state.active));
    }

    /* 画面の大きさに合わせて縮める（パソコン・タブレットは2台を並べ、スマホは1台ずつ） */
    fit() {
      const stage = this.el.querySelector('.vm-stage');
      const wide = window.innerWidth >= 900;
      this.el.classList.toggle('narrow', !wide);
      this.updateDock();
      const W = stage.clientWidth - 24, H = stage.clientHeight - 22;
      let w, h;
      if (wide) { w = PC.w + GAP + PHONE.w; h = Math.max(PC.h, PHONE.h) + LABEL; }
      else if (this.state.active === 'phone') { w = PHONE.w; h = PHONE.h + LABEL; }
      else { w = PC.w; h = PC.h + LABEL; }
      let s = Math.min(1, W / w, H / h);
      const zoomBtn = this.el.querySelector('.vm-zoom');
      const pcNarrow = !wide && this.state.active === 'pc';
      zoomBtn.hidden = !pcNarrow;
      if (pcNarrow && this.state.pcZoom) s = Math.min(1, Math.max(s, H / h));
      zoomBtn.textContent = this.state.pcZoom ? '画面に合わせる' : '拡大する';
      const fit = this.el.querySelector('.vm-fit'); const holder = this.el.querySelector('.vm-holder');
      fit.style.width = w + 'px';
      fit.style.transform = `scale(${s})`;
      holder.style.width = Math.ceil(w * s) + 'px'; holder.style.height = Math.ceil(h * s) + 'px';
    }
  }
  S.VM = VM;
})();
