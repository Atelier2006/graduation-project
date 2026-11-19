/*
 * 詐欺シミュ プロトタイプ：仮想環境のエンジン
 * 仮想スマホと仮想パソコンを1つのページの中に作り、シナリオのデータ（js/scenarios/*.js）のとおりに動かす。
 * 検索や荷物照会は端末内で処理する。認証情報や決済情報には練習用の値を使う。
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

  /* ===== アイコン（線の絵。絵文字は使わない） ===== */
  const svg = (d, o = {}) => `<svg class="ic" viewBox="0 0 24 24" width="${o.s || 18}" height="${o.s || 18}" aria-hidden="true" ${o.fill ? 'fill="currentColor" stroke="none"' : `fill="none" stroke="currentColor" stroke-width="${o.w || 1.8}" stroke-linecap="round" stroke-linejoin="round"`}>${d}</svg>`;
  S.svg = svg;
  S.ico = {
    back: svg('<path d="M15 5l-7 7 7 7"/>'), fwd: svg('<path d="M9 5l7 7-7 7"/>'),
    reload: svg('<path d="M19 12a7 7 0 1 1-2-4.9"/><path d="M19 4.5v3.5h-3.5"/>'),
    tune: svg('<path d="M4 8h9M17 8h3M4 16h3M11 16h9"/><circle cx="15" cy="8" r="2"/><circle cx="9" cy="16" r="2"/>', { s: 16 }),
    star: svg('<path d="M12 4.5l2.3 4.7 5.2.8-3.8 3.6.9 5.1L12 16.3l-4.6 2.4.9-5.1L4.5 10l5.2-.8z"/>', { s: 16, w: 1.6 }),
    x: svg('<path d="M7.5 7.5l9 9M16.5 7.5l-9 9"/>', { s: 14 }), plus: svg('<path d="M12 6v12M6 12h12"/>', { s: 16 }),
    min: svg('<path d="M7 12h10"/>', { s: 14, w: 1.2 }), max: svg('<rect x="7" y="7" width="10" height="10"/>', { s: 14, w: 1.2 }), close: svg('<path d="M7 7l10 10M17 7L7 17"/>', { s: 14, w: 1.2 }),
    search: svg('<circle cx="11" cy="11" r="6"/><path d="M15.5 15.5l4 4"/>'),
    user: svg('<circle cx="12" cy="8.5" r="3.5"/><path d="M5 19.5c1.3-3.3 4-4.5 7-4.5s5.7 1.2 7 4.5"/>'),
    heart: svg('<path d="M12 19s-6.5-4.1-6.5-9.2A3.7 3.7 0 0 1 12 7.6a3.7 3.7 0 0 1 6.5 2.2C18.5 14.9 12 19 12 19z"/>'),
    bag: svg('<path d="M6 8.5h12l-1 11H7z"/><path d="M9 8.5V7a3 3 0 0 1 6 0v1.5"/>'),
    share: svg('<path d="M12 4v10M8.5 7.5L12 4l3.5 3.5"/><path d="M8 10.5H6.5v9h11v-9H16"/>', { s: 22 }),
    book: svg('<path d="M12 7c-1.5-1.3-4-2-7-2v12c3 0 5.5.7 7 2 1.5-1.3 4-2 7-2V5c-3 0-5.5.7-7 2zM12 7v12"/>', { s: 22 }),
    tabs: svg('<rect x="5" y="5" width="11" height="11" rx="2.5"/><path d="M9 19h7.5a2.5 2.5 0 0 0 2.5-2.5V9"/>', { s: 22 }),
    check: svg('<path d="M5.5 12.5l4 4L18.5 7.5"/>'),
    warn: svg('<path d="M12 4L3 19.5h18z"/><path d="M12 10v4.5M12 17v.4"/>', { w: 2 }),
    speaker: svg('<path d="M4.5 9.5h3.5l4.5-4v13l-4.5-4H4.5z"/><path d="M16 9.5a3.5 3.5 0 0 1 0 5M18.5 7a7 7 0 0 1 0 10"/>'),
    chevron: svg('<path d="M9.5 6l6 6-6 6"/>'),
    info: svg('<circle cx="12" cy="12" r="8"/><path d="M12 11v5M12 8v.3"/>'),
    menu: svg('<path d="M4.5 7h15M4.5 12h15M4.5 17h15"/>'),
    mic: svg('<rect x="9.5" y="4" width="5" height="10" rx="2.5"/><path d="M6.5 11.5a5.5 5.5 0 0 0 11 0M12 17v3"/>'),
    lock: svg('<rect x="6" y="10.5" width="12" height="9" rx="2"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>'),
    flash: svg('<path d="M9 3.5h6v4l-2 3v9.5h-2V10.5l-2-3z"/>', { s: 20 }),
    camera: svg('<path d="M4.5 8.5h3l1.5-2h6l1.5 2h3v10h-15z"/><circle cx="12" cy="13" r="3.2"/>', { s: 20 }),
    signal: '<svg class="ic" viewBox="0 0 18 12" width="17" height="11" aria-hidden="true" fill="currentColor"><rect x="0" y="8" width="3" height="4" rx=".8"/><rect x="5" y="5.5" width="3" height="6.5" rx=".8"/><rect x="10" y="3" width="3" height="9" rx=".8"/><rect x="15" y="0" width="3" height="12" rx=".8"/></svg>',
    wifi: '<svg class="ic" viewBox="0 0 16 12" width="15" height="11" aria-hidden="true" fill="currentColor"><path d="M8 2.3c2.3 0 4.4.9 6 2.4l1.3-1.4A10.1 10.1 0 0 0 8 .3 10.1 10.1 0 0 0 .7 3.3L2 4.7a8.1 8.1 0 0 1 6-2.4zm0 3.6c1.4 0 2.6.5 3.6 1.4l1.3-1.4A7 7 0 0 0 8 3.9a7 7 0 0 0-4.9 2l1.3 1.4C5.4 6.4 6.6 5.9 8 5.9zm0 5.8l2.1-2.2a3 3 0 0 0-4.2 0z"/></svg>',
    battery: '<svg class="ic" viewBox="0 0 27 12" width="25" height="11" aria-hidden="true"><rect x=".5" y=".5" width="22" height="11" rx="3" fill="none" stroke="currentColor" opacity=".45"/><rect x="2" y="2" width="16" height="8" rx="1.8" fill="currentColor"/><path d="M24 4v4c.8-.3 1.5-1 1.5-2S24.8 4.3 24 4z" fill="currentColor" opacity=".45"/></svg>',
  };
  const I = S.ico;

  /* 状態バー（時刻・電波・Wi-Fi・電池） */
  const sbarHTML = (sc, bar) => {
    const st = typeof bar === 'object' ? ` style="background:${bar.bg};color:${bar.fg}"` : '';
    return `<div class="sbar"${st}><span class="t">${esc(sc.clock || '9:41')}</span><span class="ind">${I.signal}${I.wifi}${I.battery}</span></div>`;
  };
  const barClass = (bar) => (typeof bar === 'string' ? `bar-${bar}` : 'bar-custom');

  /* パソコンのブラウザの枠（タブ・アドレスバー・ブックマーク） */
  const favHTML = (o) => o.fav || `<span class="fav" style="background:${o.favColor || '#80868b'}">${esc(o.favCh || (o.title || o.label || '?').replace(/^[【\[]/, '').trim().charAt(0))}</span>`;
  function bookmarksHTML(sc, inert) {
    const bms = (sc.pc && sc.pc.bookmarks) || [];
    if (!bms.length) return '';
    return `<div class="bm">${bms.map((b, i) => {
      const f = favHTML({ fav: b.fav, favColor: b.color, favCh: b.ch, label: b.label });
      return inert ? `<span class="bmi">${f}${esc(b.label)}</span>` : `<button type="button" class="bmi" data-vm="bm" data-i="${i}">${f}${esc(b.label)}</button>`;
    }).join('')}</div>`;
  }
  function pcChromeHTML(sc, scr, html, live) {
    const u = splitUrl(scr.url);
    const b = (attrs, inner, cls) => (live ? `<button type="button" class="${cls}" ${attrs}>${inner}</button>` : `<span class="${cls}">${inner}</span>`);
    const omni = `<span class="tune">${I.tune}</span><span class="host">${esc(u.host)}</span><span class="path">${esc(u.path)}</span><span class="star">${I.star}</span>`;
    return `<div class="b-tabs">
        <div class="b-tab on">${favHTML(scr)}<span class="tt">${esc(scr.title || '')}</span>${b('data-vm="close-tab" aria-label="タブを閉じる"', I.x, 'x')}</div>
        ${b('data-web="web/home/search/" aria-label="教材内検索を開く"', I.plus, 'newtab')}
        <span class="win"><span>${I.min}</span><span>${I.max}</span><span class="cl">${I.close}</span></span></div>
      <div class="b-bar">${b('data-back aria-label="戻る"', I.back, 'nav')}${b('data-vm="forward" aria-label="進む"', I.fwd, 'nav')}${b('data-vm="reload" aria-label="再読み込み"', I.reload, 'nav')}
        ${live ? `<button type="button" class="b-omni" data-vm="url" aria-label="アドレスを確かめる">${omni}</button>` : `<div class="b-omni">${omni}</div>`}
        ${b('data-vm="find" aria-label="ページ内検索"', I.search, 'nav')}</div>
      ${bookmarksHTML(sc, !live)}
      <div class="b-body">${html}</div>`;
  }

  /* ===== 静止画として描く（解説の画面で、見抜くポイントの印を重ねて見せる） ===== */
  S.renderStatic = (sc, id, opt = {}) => {
    const scr = sc.screens[id];
    const dummy = { flags: Object.assign({}, opt.flags || {}), sc };
    const html = screenHTML(scr, dummy);
    if (scr.dev === 'phone') {
      const bar = scr.bar || 'light';
      return `<div class="mini" data-w="${PHONE.w}" data-h="${PHONE.h}" data-max="0.82"><div class="mini-in reveal static" inert>
        <div class="phone ${barClass(bar)}">${sbarHTML(sc, bar)}<div class="pscreen">${html}</div><div class="home-ind"></div></div></div></div>`;
    }
    const body = scr.fullscreen ? `<div class="pc-fs">${html}</div>` : pcChromeHTML(sc, scr, html, false);
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

  /* ===== 仮想環境 ===== */
  class VM {
    constructor(root, sc, opts = {}) {
      this.root = root; this.sc = sc; this.opts = opts;
      this.flags = {};
      this.webAccounts = { pc: new Set(), phone: new Set() };
      this.savedRecipe = false;
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
      this.el.addEventListener('submit', (e) => S.web.submit(this, e));
      this.el.addEventListener('click', (e) => this.click(e));
      this.el.addEventListener('pointerdown', (e) => this.holdStart(e));
      ['pointerup', 'pointerleave', 'pointercancel'].forEach((t) => this.el.addEventListener(t, (e) => this.holdEnd(e)));
    }
    devEl(dev) { return this.el.querySelector(dev === 'phone' ? '.vm-phone .phone' : '.vm-pc .pc-frame'); }
    screen(id, dev = 'pc') {
      return id.startsWith('web/') ? S.web.view(this, id, dev) : this.sc.screens[id];
    }
    top(dev) { const s = this.state[dev].stack; return s[s.length - 1]; }

    /* ----- 描く ----- */
    renderPhone() {
      const el = this.devEl('phone'); const id = this.top('phone');
      let inner, bar = 'light';
      if (id === 'lock') { inner = this.lockHTML(); bar = 'lock'; }
      else if (id === 'home') { inner = this.homeHTML(); bar = 'home'; }
      else if (id.startsWith('app:')) { inner = this.placeholderHTML(id.slice(4)); }
      else { const scr = this.screen(id, 'phone'); inner = screenHTML(scr, this); bar = scr.bar || 'light'; }
      el.className = `phone ${barClass(bar)}`;
      el.innerHTML = `${sbarHTML(this.sc, bar)}<div class="pscreen">${inner}</div>
        <div class="home-ind" data-vm="home" role="button" tabindex="0" aria-label="ホーム画面に戻る" ${typeof bar === 'object' ? `style="background:${bar.bg2 || '#fff'}"` : ''}></div>`;
    }
    lockHTML() {
      const notes = this.state.phone.notes;
      return `<div class="lock-top"><div class="lock-date">${esc(this.sc.date || '')}</div><div class="lock-time">${esc(this.sc.clock || '9:41')}</div></div>
        <div class="lock-notes">${notes.map((n, i) => this.notiHTML(n, i)).join('')}</div>
        <div class="lock-bottom"><span class="lk">${I.flash}</span><button type="button" class="lock-open" data-vm="unlock">押して開く</button><span class="lk">${I.camera}</span></div>`;
    }
    appOf(id) { return this.sc.phone.apps.find((x) => x.id === id) || {}; }
    notiHTML(n, i) {
      const a = this.appOf(n.app);
      return `<button type="button" class="noti" data-vm="note" data-i="${i}"><span class="ni" style="background:${a.bg || '#8e8e93'}">${a.glyph || ''}</span>
        <span class="nb"><span class="nh"><b>${esc(n.head || n.title || a.name || '')}</b><span class="nt">${esc(n.when || '今')}</span></span><span class="nx">${n.bodyHTML || esc(n.body || '')}</span></span></button>`;
    }
    homeHTML() {
      const apps = this.sc.phone.apps;
      const unread = (id) => this.state.phone.notes.filter((n) => n.app === id && !n.read).length;
      const icon = (a) => { const u = unread(a.id);
        return `<button type="button" class="hicon" data-vm="app" data-app="${a.id}"><i style="background:${a.bg}">${a.glyph}</i><span>${esc(a.name)}</span>${u ? `<b class="badge-n">${u}</b>` : ''}</button>`; };
      return `<div class="home-grid">${apps.filter((a) => !a.dock).map(icon).join('')}</div>
        <div class="home-dots"><i class="on"></i><i></i></div>
        <div class="home-dock">${apps.filter((a) => a.dock).map(icon).join('')}</div>`;
    }
    placeholderHTML(appId) {
      const a = this.appOf(appId);
      return `<div class="ios-nav"><button type="button" class="back" data-back aria-label="戻る">${I.back}</button><b>${esc(a.name || 'アプリ')}</b><span></span></div>
        <div class="placeholder">このアプリは、この練習では使いません。</div>`;
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
          <div class="fs-hold" data-hold role="button" tabindex="0">全画面表示を終了するには <kbd>Esc</kbd> キーを長押ししてください
          <small>（スマホやタブレットでは、ここを長押し）</small><span class="bar"></span></div></div>`;
        return;
      }
      fr.innerHTML = pcChromeHTML(this.sc, scr, html, true);
    }

    /* ----- 動かす ----- */
    go(dev, id, o = {}) {
      if (this.state.ended && !o.force) return;
      const st = this.state[dev];
      if (!o.replace) st.forward = [];
      if (dev === 'phone' && (this.top('phone') === 'lock')) st.stack = ['home'];
      if (o.replace) st.stack[st.stack.length - 1] = id; else st.stack.push(id);
      if (dev === 'pc') { st.closed = false; st.fullscreen = !!(this.screen(id) && this.screen(id).fullscreen); }
      if (dev === 'phone') this.renderPhone(); else this.renderPC();
      this.enter(dev);
    }
    enter(dev) {
      const id = this.top(dev); const scr = this.sc.screens[id];
      if (scr && scr.onEnter) scr.onEnter(this);
    }
    back(dev) {
      const st = this.state[dev];
      if (st.stack.length < 2 || (dev === 'phone' && this.top(dev) === 'home')) return;
      (st.forward ||= []).push(st.stack.pop());
      this.redraw(dev);
    }
    redraw(dev) {
      if (dev === 'pc') { this.state.pc.fullscreen = false; this.renderPC(); }
      else this.renderPhone();
    }
    home() { if (this.top('phone') !== 'lock') this.unlock(); }
    unlock() { this.state.phone.stack = ['home']; this.state.phone.forward = []; this.renderPhone(); }
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
      const scr = this.screen(this.top(dev), dev); if (!scr || !scr.url) return;
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
      if (e.type === 'keydown' && (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        const dev = e.target.closest?.('[data-dev]')?.dataset.dev || this.state.active;
        if (this.devEl(dev).querySelector('.mb-page,.b-body') && !this.state.ended) {
          e.preventDefault(); S.web.findInPage(this,dev);
        }
        return;
      }
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
      const t = e.target.closest('[data-vm],[data-act],[data-go],[data-back],[data-shoe],[data-web],[data-doc],[data-web-action]');
      if (!t || !this.el.contains(t)) return;
      const devBox = t.closest('[data-dev]'); const dev = devBox ? devBox.dataset.dev : this.state.active;
      if (t.dataset.shoe && this.sc.id === 'fake-shop' && this.top(dev) === 'shop' && !this.state.ended) {
        const key=t.dataset.shoe, value=t.dataset.value;
        if(key==='color'){this.flags.shoeColor=value;this.flags.shoePhoto=value;}
        if(key==='size')this.flags.shoeSize=value;
        if(key==='photo')this.flags.shoePhoto=value;
        const scroll=this.devEl(dev).querySelector('.b-body').scrollTop;
        this.renderPC();
        this.devEl(dev).querySelector('.b-body').scrollTop=scroll;
        this.devEl(dev).querySelector('[data-shoe="'+key+'"][data-value="'+value+'"]')?.focus({preventScroll:true});
        return;
      }
      if (t.matches('[data-web],[data-doc],[data-web-action]')) {
        if (!this.state.ended) S.web.click(this,t,dev);
        return;
      }
      if (t.hasAttribute('data-back')) { this.back(dev); return; }
      if (t.dataset.act) { this.act(t.dataset.act, dev); return; }
      if (t.dataset.go) { const [d, id] = t.dataset.go.includes(':') ? t.dataset.go.split(':') : [dev, t.dataset.go]; this.go(d, id); return; }
      const v = t.dataset.vm;
      if (v === 'hint') this.hint();
      else if (v === 'quit') this.end('quit');
      else if (v === 'switch') this.switchTo(t.dataset.to);
      else if (v === 'zoom') { this.state.pcZoom = !this.state.pcZoom; this.fit(); }
      else if (v === 'find') S.web.findInPage(this, dev);
      else if (v === 'reload') this.redraw(dev);
      else if (v === 'forward' && this.state[dev].forward?.length) {
        this.state[dev].stack.push(this.state[dev].forward.pop()); this.redraw(dev);
      }
      else if (v === 'home') this.home();
      else if (v === 'unlock') this.unlock();
      else if (v === 'note') this.openNote(+t.dataset.i);
      else if (v === 'app') this.openApp(t.dataset.app);
      else if (v === 'bm') this.openBookmark(+t.dataset.i);
      else if (v === 'url') this.showUrl(dev);
      else if (v === 'info-close') { const b = t.closest('.vm-info'); if (b) b.remove(); }
      else if (v === 'close-tab') this.closeTab();
      else if (v === 'reopen') { this.state.pc.closed = false; this.state.pc.stack = [this.sc.pc.start]; this.state.pc.forward = []; this.state.pc.fullscreen = false; this.renderPC(); }
      else if (v === 'result' && this.opts.onResult) this.opts.onResult(this.state.ended);
    }
    openApp(id) {
      const a = this.sc.phone.apps.find((x) => x.id === id); if (!a) return;
      this.state.phone.notes.forEach((n) => { if (n.app === id) n.read = true; });
      if (a.act) this.act(a.act, 'phone');
      else if (a.go) this.go('phone', typeof a.go === 'function' ? a.go(this) : a.go);
      else if (id === 'browser') this.go('phone','web/home/search/');
      else if (id === 'hashire' || id === 'bank') this.go('phone','web/account/' + (id === 'bank' ? 'bank' : 'ship') + '/');
      else this.go('phone', 'app:' + id);
    }
    openBookmark(i) {
      const b = this.sc.pc.bookmarks[i]; if (!b) return;
      if (b.act) this.act(b.act, 'pc');
      else if (b.go) this.go('pc', b.go);
      else if (b.label === 'サガシモ') this.go('pc','web/home/search/');
      else S.web.openDoc(this,'pc',{'ことこと献立帖':'teriyaki','ヒツジネット銀行':'balance','ポチッと通販':'shoes','ハシレ運輸':'delivery'}[b.label]);
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
