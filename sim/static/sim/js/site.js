/*
 * 詐欺シミュ：Django の画面で使う JS
 *  - 文字の大きさ（標準／大）
 *  - 開始画面の「音」と「はじめる」
 *  - 体験の画面：仮想環境を動かし、終わったら記録をサーバーに送る
 *  - 解説の画面：体験した画面に、見抜くポイントの印を重ねて描く
 */
(function () {
  'use strict';
  const S = (window.SagiSim = window.SagiSim || {});
  const pref = {
    get(k, d) { try { const v = localStorage.getItem('sagisim:' + k); return v == null ? d : v; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('sagisim:' + k, v); } catch (e) { /* 覚えられなくても続ける */ } },
  };

  /* ===== 文字の大きさ ===== */
  const sizeBtns = document.querySelectorAll('[data-textsize]');
  function setSize(v) {
    document.documentElement.classList.toggle('text-lg', v === 'lg');
    sizeBtns.forEach((b) => b.setAttribute('aria-pressed', b.dataset.textsize === v ? 'true' : 'false'));
    pref.set('textsize', v);
  }
  sizeBtns.forEach((b) => b.addEventListener('click', () => setSize(b.dataset.textsize)));
  setSize(pref.get('textsize', 'md'));

  const csrf = () => { const m = document.cookie.match(/(?:^|;\s*)csrftoken=([^;]+)/); return m ? decodeURIComponent(m[1]) : ''; };
  S.page = {};

  /* ===== 開始画面 ===== */
  S.page.start = function () {
    const btn = document.getElementById('start'); if (!btn) return;
    const sound = pref.get('sound', 'off');
    document.querySelectorAll('input[name=sound]').forEach((r) => { r.checked = r.value === sound; });
    btn.addEventListener('click', () => {
      const v = (document.querySelector('input[name=sound]:checked') || {}).value || 'off';
      pref.set('sound', v);
      if (v === 'on' && S.unlockAudio) S.unlockAudio();
      location.href = btn.dataset.href;
    });
  };

  /* ===== 体験の画面 ===== */
  S.page.play = function ({ id, api, fallback }) {
    const sc = S.scenarios[id];
    const root = document.getElementById('vm-root');
    document.body.classList.add('playing');
    let saved = null, saving = null, wantResult = false;
    const go = () => { location.href = saved ? saved.result_url : fallback; };
    const save = (r) => fetch(api, {
      method: 'POST', credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrf() },
      body: JSON.stringify({ scenario: id, ending: r.ending, log: r.log.map((l) => ({ kind: l.kind, label: l.label, dev: l.dev || '' })) }),
    }).then((res) => (res.ok ? res.json() : Promise.reject(res.status)));
    new S.VM(root, sc, {
      sound: pref.get('sound', 'off') === 'on',
      onEnd: (r) => {
        saving = save(r).then((j) => { saved = j; }).catch(() => { saved = null; })
          .finally(() => { saving = null; if (wantResult) go(); });
      },
      onResult: () => { if (saving) { wantResult = true; } else { go(); } },
    });
  };

  /* ===== 解説の画面 ===== */
  S.page.explain = function ({ id, el }) {
    const sc = S.scenarios[id]; const x = sc.explain; const box = document.getElementById(el);
    const pointHTML = (p, good) => {
      const scr = sc.screens[p.screen];
      return `<div class="point ${scr.dev === 'pc' ? 'pc' : ''}"><div class="fig">${S.renderStatic(sc, p.screen, { flags: { warned: true, shopSeen: true, ordered: true, dialed: true } })}</div>
        <ol>${p.items.map((t, i) => { const g = good || t.startsWith('✓'); return `<li><span class="pnum ${g ? 'good' : ''}">${i + 1}</span><span>${t.replace(/^✓/, '')}</span></li>`; }).join('')}</ol></div>`;
    };
    box.innerHTML = `<h2 class="sec-h">見抜くポイント</h2>${x.points.map((p) => pointHTML(p, false)).join('')}
      <h2 class="sec-h">もう1台で確かめる</h2>${x.checks.map((p) => pointHTML(p, true)).join('')}
      <h2 class="sec-h">こうすれば防げる</h2><div class="panel"><ul class="list-dot">${x.prevent.map((t) => `<li>${t}</li>`).join('')}</ul></div>
      <h2 class="sec-h">だまされてしまったら</h2><div class="panel"><ul class="list-dot">${x.ifScammed.map((t) => `<li>${t}</li>`).join('')}</ul></div>`;
    const fit = () => S.fitMinis(box);
    fit(); window.addEventListener('resize', fit);
  };
})();
