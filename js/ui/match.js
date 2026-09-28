/* Arayüz: "Devam" akışı, maç öncesi, canlı maç (anlatım, istatistik, değişiklik, taktik), maç sonu */
(function (G) {
  'use strict';
  const CM = G.CM, U = CM.U, P = CM.P, C = CM.Comp, E = CM.E, UI = CM.UI, A = UI.A, ui = UI.ui, h = UI.h, esc = U.esc;
  const S = () => CM.S;
  const $app = document.getElementById('app');
  // Anlatım hızı: ev = bir anlatım satırının ekranda kalma süresi, idle = olaysız dakika (ms)
  const SPEEDS = [['Yavaş', { ev: 2600, idle: 300 }], ['Normal', { ev: 1500, idle: 160 }], ['Hızlı', { ev: 650, idle: 60 }], ['Çok hızlı', { ev: 180, idle: 15 }]];

  function userIdx(f) { const u = S().user; return (f.h === u.club || f.h === 'N:' + u.nat) ? 0 : 1; }
  function roundLabel(c, f) {
    if (f.rd) return `${f.rd}. Hafta`;
    if (f.md) return `${f.md}. Maç Günü`;
    if (f.g !== undefined) return `Grup ${c.groups[f.g].n}`;
    if (f.rnd !== undefined) { const R = c.rounds[f.rnd]; return R.n + (f.leg ? ` · ${f.leg}. maç` : ''); }
    return '';
  }

  // ---------- Devam ----------
  A.continue = function () {
    if (ui.live) return;
    const s = S();
    h.closeModal();
    h.busy(true, 'Günler ilerliyor...');
    setTimeout(() => {
      let r;
      try { r = CM.Game.advance(); } catch (e) { console.error(e); h.busy(false); h.toast('Hata: ' + e.message); return; }
      h.busy(false);
      if (r.type === 'match') { UI.render(); preMatch(r.f); return; }
      if (r.type === 'news') {
        r.n.read = true;
        if (r.n.type === 'offer' && s.offers.some(o => o.id === r.n.offerId)) { UI.render(); UI.offerModal(r.n.offerId); }
        else { ui.view = 'inbox'; ui.openMsg = r.n.id; UI.render(); h.toast('Önemli bir mesajınız var.'); }
      }
      else if (r.type === 'jobless') { ui.view = 'inbox'; UI.render(); h.toast('Yeni iş teklifleri geldi!'); }
      else { UI.render(); if (s.user.club == null) h.toast('Görevsizsiniz: Haberler ekranından teklifleri değerlendirin.'); }
      CM.Save.save().catch(() => {});
    }, 20);
  };

  // ---------- Maç öncesi ----------
  function preMatch(f) {
    const s = S(), c = s.comps[f.c], us = userIdx(f);
    const my = us === 0 ? f.h : f.a, op = us === 0 ? f.a : f.h;
    const mo = C.tObj(my), oo = C.tObj(op);
    const nat = C.isNat(my);
    const agg = C.aggBefore(c, f);
    const form = c.form && c.form[op] ? c.form[op] : null;
    const pos = t => { if (c.type !== 'league' && c.type !== 'swiss') return ''; if (!c.tbl[t] || !c.tbl[t][0]) return ''; const st = c.type === 'league' ? C.standings(c) : C.sortTable(c, c.teams); return st.indexOf(t) + 1 + '. · '; };
    const tac = mo.tactic;
    const pool = nat ? (mo.squad || []) : mo.players;
    const ok = new Set(pool.map(id => s.players[id]).filter(p => p && CM.Sim.avail(p, c.suspKey, f.d, nat)).map(p => p.id));
    const missing = tac.xi.filter(id => !ok.has(id)).map(id => s.players[id]).filter(Boolean);
    h.openModal(`<div class="small muted center">${esc(c.n)} · ${esc(roundLabel(c, f))}</div>
      <div class="small muted center">${U.fmtDay(f.d, 'dow')}${f.n ? ' · Tarafsız saha' : ` · ${esc(C.tObj(f.h).st || '')}`}</div>
      <div class="next-match">
        <div>${h.crest(C.tObj(f.h), 40)}<div class="tm">${esc(C.tName(f.h))}</div><div class="small muted">${pos(f.h)}Güç ${Math.round(CM.Sim.strengthOf(C.tObj(f.h)))}</div></div>
        <div class="vs">VS${agg ? `<div class="small muted">İlk maç ${agg[1]}-${agg[0]}</div>` : ''}</div>
        <div>${h.crest(C.tObj(f.a), 40)}<div class="tm">${esc(C.tName(f.a))}</div><div class="small muted">${pos(f.a)}Güç ${Math.round(CM.Sim.strengthOf(C.tObj(f.a)))}</div></div>
      </div>
      ${form && form.length ? `<div class="center small">Rakibin son maçları: <span class="form">${form.map(x => `<i class="${x}">${x}</i>`).join('')}</span></div>` : ''}
      ${missing.length ? `<div class="panel mt"><div class="body small warn">İlk 11'inizde oynayamayacak oyuncular var: ${missing.map(p => esc(p.n)).join(', ')}. Maç başlarken yerleri otomatik doldurulur.</div></div>` : ''}
      <div class="small muted center mt">${tac.form} · ${E.MENT[tac.ment].n} · ${esc(oo.n)}</div>
      <div class="btns mt"><button class="btn" data-a="preTac" data-t="${nat ? 'nat' : 'club'}">📋 Taktik</button><button class="btn" data-a="quickMatch">⏩ Hızlı sonuç</button></div>
      <button class="btn primary block mt" data-a="startMatch">▶ Maçı izle</button>`);
    ui.pre = f;
  }

  // ---------- Canlı maç ----------
  // Her anlatım satırı okunabilecek kadar ekranda kalır; olaysız dakikalar hızlı geçer
  function startLive(f) {
    const us = userIdx(f);
    const m = CM.Sim.build(f, us);
    CM.Sim.forfeitCheck(m);
    ui.live = { f, m, us, speed: ui.speedPref != null ? ui.speedPref : 1, paused: false, tab: 'feed', head: 'Takımlar sahada...', headCls: '', out: null,
      queue: [], shown: [], sc: [0, 0], min: 0 };
    const L = ui.live;
    if (m.finished) { L.shown = m.events.filter(e => e.text); L.sc = [m.sides[0].st.g, m.sides[1].st.g]; }
    else L.shown.push({ min: 0, type: 'info', side: -1, text: `${m.sides[0].n} - ${m.sides[1].n} maçı başlamak üzere.` });
    renderLive();
    schedule(SPEEDS[L.speed][1].ev);
  }
  function schedule(delay) {
    const L = ui.live; if (!L) return;
    clearTimeout(L.timer);
    if (L.paused || (L.m.finished && !L.queue.length)) return;
    L.timer = setTimeout(tick, delay);
  }
  function show(L, e) {
    const m = L.m, mySide = m.sides[L.us];
    L.min = e.min;
    L.shown.push(e);
    if (e.score) L.sc = e.score.slice();
    if (e.type === 'goal' || e.type === 'pgoal') { L.head = e.text; L.headCls = 'goal'; }
    else if (e.type === 'red') { L.head = e.text; L.headCls = 'card'; }
    else { L.head = e.text; L.headCls = e.type === 'yellow' ? 'card' : e.type === 'build' ? 'build' : ''; }
    if (e.type === 'half') { L.paused = true; L.head = 'DEVRE ARASI — ' + e.text; L.headCls = ''; }
    if (e.type === 'et') L.paused = true;
    if (e.type === 'end') L.sc = [m.sides[0].st.g, m.sides[1].st.g];
    if (e.side === L.us && (e.type === 'injury' || e.type === 'red') && !m.finished) {
      const pl = e.pid && S().players[e.pid];
      if (e.type === 'injury' && mySide.subsLeft > 0) { L.paused = true; h.toast(`${pl ? pl.n : 'Oyuncunuz'} sakatlandı. Değişiklik yapabilirsiniz.`); }
      if (e.type === 'red') h.toast(`${pl ? pl.n : 'Oyuncunuz'} kırmızı kart gördü!`);
    }
  }
  function tick() {
    const L = ui.live; if (!L) return;
    const sp = SPEEDS[L.speed][1];
    if (L.queue.length) {
      const e = L.queue.shift();
      show(L, e);
      renderLive();
      const important = e.type === 'goal' || e.type === 'pgoal' || e.type === 'pmiss' || e.type === 'red' || e.type === 'pen';
      schedule(important ? sp.ev * 1.8 : sp.ev);
      return;
    }
    const m = L.m;
    const evs = m.step().filter(e => e.text);
    if (evs.length) { L.queue.push(...evs); tick(); return; }
    L.min = m.minute;
    renderLive();
    schedule(m.phase === 'pens' ? sp.ev : sp.idle);
  }
  function scorersLine(side, m, n) {
    return side.scorers.slice(0, n).map(x => `${esc(E.sur(m.all[x.id]))} ${x.min}'${x.pen ? ' (P)' : ''}`).join(', ');
  }
  function statsHtml(m) {
    const [a, b] = m.sides;
    const tp = a.st.poss + b.st.poss || 1;
    const rows = [['Topa sahip olma', Math.round(a.st.poss / tp * 100), Math.round(b.st.poss / tp * 100), '%'], ['Şut', a.st.sh, b.st.sh], ['İsabetli şut', a.st.ot, b.st.ot],
      ['Gol beklentisi (xG)', a.st.xg.toFixed(1), b.st.xg.toFixed(1)], ['Korner', a.st.co, b.st.co], ['Faul', a.st.fo, b.st.fo], ['Sarı kart', a.st.yc, b.st.yc], ['Kırmızı kart', a.st.rc, b.st.rc]];
    return rows.map(r => {
      const x = +r[1], y = +r[2], t = x + y || 1;
      return `<div class="stat"><span class="v">${r[1]}${r[3] || ''}</span><span class="l">${r[0]}</span><span class="v">${r[2]}${r[3] || ''}</span>
        <div class="sbar"><i style="width:${x / t * 100}%;background:${a.c1 === b.c1 ? 'var(--accent)' : a.c1}"></i><i style="width:${y / t * 100}%;background:${b.c1}"></i></div></div>`;
    }).join('');
  }
  function rtTxt(v) { return v == null ? '<b class="muted">-</b>' : `<b class="rt ${v >= 7.5 ? 'good' : v < 6 ? 'bad' : ''}">${v.toFixed(1)}</b>`; }
  // İki takım yan yana, tek ekrana sığan kompakt kadro ve not tablosu
  function lineupHtml(m) {
    const col = si => {
      const s = m.sides[si];
      const R = id => m.finished ? s.ps[id].rating : m.liveRating(s, id);
      const row = (p, slot, ps, off) => `<div class="lr${off ? ' off' : ''}"><span class="pm ${P.LINE[slot] || 'Y'}">${P.POS_TR[slot]}</span>
        <span class="nm">${esc(E.sur(p))}${ps.g ? ' ⚽'.repeat(ps.g) : ''}${ps.a ? '🅰️' : ''}${ps.yc ? '🟨' : ''}${ps.rc ? '🟥' : ''}${ps.inj ? '🤕' : ''}${off ? ' ↓' + ps.off + "'" : ps.on ? ' ↑' + ps.on + "'" : ''}</span>
        ${off ? '' : `<i class="cd" style="background:${condCol(s.on.find(o => o.p === p))}"></i>`}${rtTxt(R(p.id))}</div>`;
      const on = s.on.map(o => row(o.p, o.slot, s.ps[o.p.id], false)).join('');
      const off = Object.keys(s.ps).filter(id => s.ps[id].off != null).map(id => row(m.all[id], m.all[id].pos, s.ps[id], true)).join('');
      return `<div class="luc"><div class="lh">${esc(s.sh || s.n)} <span class="muted">${s.tactic.form}</span></div>${on}${off}</div>`;
    };
    return `<div class="lu2">${col(0)}${col(1)}</div><div class="small muted center">Not · renkli nokta: kondisyon</div>`;
  }
  function condCol(o) { const c = o ? o.cond : 100; return c >= 75 ? 'var(--good)' : c >= 55 ? 'var(--warn)' : 'var(--bad)'; }
  function renderLive() {
    const L = ui.live, m = L.m;
    const [a, b] = m.sides;
    const over = m.finished && !L.queue.length;
    const minTxt = over ? 'MAÇ SONU' : m.phase === 'pens' ? 'PENALTILAR' : L.min === 0 ? 'Başlıyor' : `${L.min}'${L.min > 90 ? ' (uz.)' : ''}`;
    const agg = m.agg ? `<div class="small muted center">Toplam: ${L.sc[0] + m.agg[0]} - ${L.sc[1] + m.agg[1]}</div>` : '';
    const pk = L.shown.filter(e => e.type === 'pgoal' || e.type === 'pmiss');
    const pens = pk.length ? `<div class="center small acc">Penaltılar: ${pk.filter(e => e.side === 0 && e.type === 'pgoal').length} - ${pk.filter(e => e.side === 1 && e.type === 'pgoal').length}</div>` : '';
    let body = '';
    if (L.tab === 'feed') body = `<div class="feed">${L.shown.slice(-120).reverse().map(e => `<div class="${e.type}"><span class="m">${e.min ? e.min + "'" : ''}</span><span>${esc(e.text)}</span></div>`).join('')}</div>`;
    else if (L.tab === 'stats') body = `<div class="panel"><div class="body">${statsHtml(m)}</div></div>`;
    else body = lineupHtml(m);
    const my = m.sides[L.us];
    const ctl = over
      ? `<button class="primary" data-a="liveEnd">DEVAM ▶</button>`
      : `<button data-a="livePause" class="${L.paused ? 'primary' : ''}">${L.paused ? '▶ Sürdür' : '⏸ Durdur'}</button>
         <button data-a="liveSpeed">${SPEEDS[L.speed][0]}</button>
         <button data-a="liveTac">🔁 Değişiklik (${my.subsLeft})</button>
         <button data-a="liveSkip">⏭ Sonuç</button>`;
    $app.innerHTML = `<div class="match">
      <div class="score">
        <div class="sb"><div class="tn">${h.crest(C.tObj(L.f.h), 26)}<span>${esc(a.n)}</span></div>
          <div class="res">${L.sc[0]}-${L.sc[1]}</div>
          <div class="tn a"><span>${esc(b.n)}</span>${h.crest(C.tObj(L.f.a), 26)}</div></div>
        <div class="min">${minTxt}</div>${agg}${pens}
        <div class="scr"><div>${scorersLine(a, m, L.sc[0])}</div><div>${scorersLine(b, m, L.sc[1])}</div></div>
      </div>
      <div class="headline ${L.headCls}">${esc(L.head)}</div>
      <div class="mtabs">${[['feed', 'Anlatım'], ['stats', 'İstatistik'], ['line', 'Kadrolar / Notlar']].map(t => `<button data-a="liveTab" data-v="${t[0]}" class="${L.tab === t[0] ? 'on' : ''}">${t[1]}</button>`).join('')}</div>
      <div class="mbody">${body}</div>
      <div class="mctl">${ctl}</div></div>`;
  }

  // Maç içi taktik / değişiklik
  function liveTac() {
    const L = ui.live, m = L.m, s = m.sides[L.us];
    const t = s.tactic;
    const chips = (obj, k) => Object.keys(obj).map(v => `<button class="chip ${t[k] === v ? 'on' : ''}" data-a="liveSet" data-k="${k}" data-v="${v}">${obj[v].n}</button>`).join('');
    const can = m.canSub(s);
    h.openModal(`<button class="close" data-a="liveClose">✕</button><h2>Maç içi yönetim</h2>
      <div class="small muted">${m.minute}. dakika · Kalan değişiklik: <b>${s.subsLeft}</b> · Kalan pencere: <b>${s.windows}</b>${s.lastWinMin === m.minute ? ' (bu dakika açık)' : ''}</div>
      <div class="panel mt"><h3>Oyuncu değişikliği</h3>
        ${can ? `<div class="body small muted">${L.out ? 'Şimdi oyuna girecek yedeği seçin.' : 'Önce çıkacak oyuncuyu seçin.'}</div>` : '<div class="body small warn">Değişiklik hakkınız kalmadı.</div>'}
        <ul class="list">${s.on.map(o => `<li class="tap ${L.out === o.p.id ? 'me' : ''}" data-a="liveOut" data-id="${o.p.id}">${h.posB(o.slot)}<span class="grow ellipsis">${esc(o.p.n)}${s.ps[o.p.id].inj ? ' 🤕' : ''}${s.ps[o.p.id].yc ? ' 🟨' : ''}</span>${rtTxt(m.liveRating(s, o.p.id))}${h.condBar(o.cond)}</li>`).join('')}</ul>
        ${L.out ? `<h3>Yedekler</h3><ul class="list">${s.bench.map(p => `<li class="tap" data-a="liveIn" data-id="${p.id}">${h.posB(p.pos)}<span class="grow ellipsis">${esc(p.n)}</span><span class="ovr ${h.ovrCls(P.slotRating(p, s.on.find(o => o.p.id === L.out).slot) * 5)}">${Math.round(P.slotRating(p, s.on.find(o => o.p.id === L.out).slot) * 5)}</span>${h.condBar(p.cond)}</li>`).join('') || '<li class="muted">Yedek yok.</li>'}</ul>` : ''}
      </div>
      <div class="panel"><h3>Oyun anlayışı</h3><div class="body">
        <div class="small muted">Mentalite</div><div class="chips">${chips(E.MENT, 'ment')}</div>
        <div class="small muted mt">Pas</div><div class="chips">${chips(E.PASS, 'pass')}</div>
        <div class="small muted mt">Pres</div><div class="chips">${chips(E.PRESS, 'press')}</div>
        <div class="small muted mt">Tempo</div><div class="chips">${chips(E.TEMPO, 'tempo')}</div></div></div>
      <button class="btn primary block" data-a="liveClose">Maça dön</button>`, true);
  }

  // Maç sonu
  function finishMatch(f, m) {
    const s = S(), c = s.comps[f.c], us = userIdx(f);
    const day = f.d;
    CM.Game.userMatchDone(f, m);
    ui.live = null;
    const side = m.sides[us];
    const rt = Object.keys(side.ps).map(id => [m.all[id], side.ps[id]]).filter(x => x[1].rating).sort((x, y) => y[1].rating - x[1].rating);
    const others = (s.sched[day] || []).map(([cid, fid]) => s.comps[cid] && s.comps[cid].fx[fid]).filter(x => x && x !== f && x.c === f.c && x.hg !== null).slice(0, 20);
    const my = side.st.g, op = m.sides[1 - us].st.g;
    const pw = f.ph != null ? (us === 0 ? f.ph > f.pa : f.pa > f.ph) : null;
    const res = my > op || pw === true ? 'Galibiyet!' : my === op && pw === null ? 'Beraberlik' : 'Mağlubiyet';
    UI.render();
    h.openModal(`<button class="close" data-a="close">✕</button>
      <div class="small muted center">${esc(c.n)} · ${esc(roundLabel(c, f))}</div>
      <div class="next-match"><div class="tm">${esc(C.tName(f.h))}</div><div class="vs">${UI.scoreTxt(f)}</div><div class="tm">${esc(C.tName(f.a))}</div></div>
      <div class="center"><b class="${res === 'Galibiyet!' ? 'good' : res === 'Beraberlik' ? 'warn' : 'bad'}">${res}</b></div>
      <div class="panel mt"><h3>Oyuncu notları</h3><ul class="list">${rt.map(([p, ps]) => `<li class="tap" data-a="player" data-id="${p.id}"><span class="grow ellipsis">${esc(p.n)}${ps.g ? ' ⚽'.repeat(ps.g) : ''}${ps.a ? ' 🅰️'.repeat(ps.a) : ''}</span><span class="small muted">${ps.mins}'</span><b class="${ps.rating >= 7.5 ? 'good' : ps.rating < 6 ? 'bad' : ''}">${ps.rating.toFixed(1)}</b></li>`).join('')}</ul></div>
      ${others.length ? `<div class="panel"><h3>Günün diğer sonuçları</h3><ul class="list fxl">${others.map(x => UI.fxRow(x)).join('')}</ul></div>` : ''}
      <button class="btn primary block" data-a="close">Tamam</button>`);
    CM.Save.save().catch(() => {});
  }

  Object.assign(A, {
    preTac(d) { h.closeModal(); if (d.t === 'nat') { ui.view = 'national'; ui.natTab = 'tactics'; } else ui.view = 'tactics'; UI.render(); h.toast('Taktiği ayarladıktan sonra DEVAM ile maça başlayın.'); },
    startMatch() { const f = ui.pre; h.closeModal(); ui.pre = null; startLive(f); },
    quickMatch() {
      const f = ui.pre; h.closeModal(); ui.pre = null;
      const m = CM.Sim.build(f, userIdx(f));
      m.userSide = -1;
      if (!CM.Sim.forfeitCheck(m)) m.runToEnd();
      finishMatch(f, m);
    },
    livePause() { const L = ui.live; L.paused = !L.paused; renderLive(); schedule(SPEEDS[L.speed][1].idle); },
    liveSpeed() { const L = ui.live; L.speed = (L.speed + 1) % SPEEDS.length; ui.speedPref = L.speed; renderLive(); schedule(SPEEDS[L.speed][1].idle); },
    liveTab(d) { ui.live.tab = d.v; renderLive(); },
    liveTac() { const L = ui.live; L.paused = true; clearTimeout(L.timer); L.out = null; renderLive(); liveTac(); },
    liveClose() { h.closeModal(); const L = ui.live; if (L) { L.out = null; renderLive(); } },
    liveOut(d) { const L = ui.live; if (!L.m.canSub(L.m.sides[L.us])) return; L.out = +d.id; liveTac(); },
    liveIn(d) {
      const L = ui.live, s = L.m.sides[L.us];
      if (L.m.substitute(s, L.out, +d.id)) { const e = L.m.events[L.m.events.length - 1]; L.shown.push(e); L.head = e.text; L.headCls = ''; }
      L.out = null; liveTac(); renderLive();
    },
    liveSet(d) { const L = ui.live; L.m.sides[L.us].tactic[d.k] = d.v; liveTac(); },
    liveSkip() {
      const L = ui.live; clearTimeout(L.timer);
      L.m.userSide = -1; // kalan sürede yapay zekâ yönetir
      const before = L.m.events.length;
      L.m.runToEnd();
      L.queue.forEach(e => L.shown.push(e)); L.queue = [];
      L.m.events.slice(before).filter(e => e.text && e.type !== 'build').forEach(e => L.shown.push(e));
      L.sc = [L.m.sides[0].st.g, L.m.sides[1].st.g];
      L.head = L.m.events[L.m.events.length - 1].text || 'Maç sona erdi'; L.headCls = '';
      renderLive();
    },
    liveEnd() { const L = ui.live; finishMatch(L.f, L.m); }
  });
  UI.renderLive = renderLive;
})(typeof window !== 'undefined' ? window : globalThis);
