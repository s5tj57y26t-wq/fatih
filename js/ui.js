/* Arayüz */
(function (G) {
  'use strict';
  const D = G.D, E = G.E, Gm = G.Game;
  const $app = document.getElementById('app');
  const $modal = document.getElementById('modal');
  const $toast = document.getElementById('toast');

  const ui = {
    view: 'inbox', squadSort: 'pos', leagueTab: 'table', fxWeek: null, openMsg: null,
    tr: { q: '', pos: 'ALL', listed: false, free: false, maxAge: 40, maxVal: 0 },
    bidResult: null
  };
  let MV = null; // canlı maç durumu

  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const S = () => Gm.S;
  const ovr = E.ovr;
  const money = v => Gm.money(v);

  function toast(t) {
    $toast.textContent = t; $toast.classList.remove('hidden');
    clearTimeout(toast._t); toast._t = setTimeout(() => $toast.classList.add('hidden'), 2600);
  }
  function openModal(html) {
    // Açık bir kart yenileniyorsa animasyonu tekrar oynatma ve kaydırma konumunu koru
    const open = !$modal.classList.contains('hidden');
    const old = $modal.querySelector('.sheet');
    const top = open && old ? old.scrollTop : 0;
    $modal.innerHTML = `<div class="sheet${open ? ' still' : ''}">${html}</div>`;
    $modal.classList.remove('hidden');
    if (top) $modal.querySelector('.sheet').scrollTop = top;
  }
  function closeModal() { $modal.classList.add('hidden'); $modal.innerHTML = ''; ui.bidResult = null; }
  $modal.addEventListener('click', e => { if (e.target === $modal) closeModal(); });

  function attrCls(v) { return v <= 5 ? 'a1' : v <= 9 ? 'a2' : v <= 13 ? 'a3' : v <= 16 ? 'a4' : 'a5'; }
  function ovrCls(v) { return v < 45 ? 'a1' : v < 55 ? 'a2' : v < 65 ? 'a3' : v < 75 ? 'a4' : 'a5'; }
  function condColor(c) { return c >= 85 ? 'var(--good)' : c >= 65 ? 'var(--warn)' : 'var(--bad)'; }
  function moraleTxt(m) { return m >= 85 ? 'Süper' : m >= 70 ? 'Çok İyi' : m >= 55 ? 'İyi' : m >= 40 ? 'Normal' : m >= 25 ? 'Kötü' : 'Berbat'; }
  function stars(n) { const k = Math.max(1, Math.min(5, Math.round(n))); return '★'.repeat(k) + '☆'.repeat(5 - k); }
  function repStars(rep) { return stars((rep - 40) / 12); }
  function posB(pos, off) { return `<span class="pos ${pos}${off ? ' off' : ''}">${D.POS_TR[pos]}</span>`; }
  function statusIcons(p) {
    let s = '';
    if (p.inj > 0) s += ' <span class="ic-s" title="Sakat">🤕</span>';
    if (p.susp > 0) s += ' <span class="ic-s" title="Cezalı">🟥</span>';
    if (p.listed) s += ' <span class="ic-s" title="Transfer listesinde">💲</span>';
    if (p.teamId !== null && p.contract <= 1) s += ' <span class="ic-s" title="Sözleşmesi bitiyor">📝</span>';
    return s;
  }
  function condBar(c) { return `<span class="bar"><i style="width:${c}%;background:${condColor(c)}"></i></span>`; }
  function setTeamColors() {
    const t = Gm.userTeam();
    document.documentElement.style.setProperty('--c1', t.c1);
    document.documentElement.style.setProperty('--c2', t.c2);
  }

  // ================= Başlangıç =================
  function renderStart() {
    const teams = D.TEAMS.map((d, i) => ({ i, name: d[0], rep: d[2], budget: d[5], c1: d[3], c2: d[4] })).sort((a, b) => b.rep - a.rep);
    $app.innerHTML = `
      <div class="start">
        <div class="logo"><div class="l1">ŞAMPİYONLUK</div><div class="l2">MENAJERİ</div><div class="l3">01/02</div></div>
        ${Gm.hasSave() ? `<button class="btn primary block" data-a="loadGame">▶ Kariyere Devam Et</button>` : ''}
        <div class="panel"><h3>Yeni Kariyer</h3><div class="body">
          <label class="field"><span>Menajer adınız</span><input id="mgrName" maxlength="24" placeholder="Adınız Soyadınız" value="${esc(localStorage.getItem('cm_mgr') || '')}"></label>
          <div class="small muted">Yöneteceğiniz kulübü seçin:</div>
        </div>
        <ul class="list team-pick">
          ${teams.map(t => `<li class="tap" data-a="pickTeam" data-id="${t.i}">
            <span class="kit" style="width:22px;height:22px;margin:0;background:${t.c1};border-color:${t.c2};border-width:2px"></span>
            <div class="grow"><div class="ellipsis"><b>${esc(t.name)}</b></div><div class="stars">${repStars(t.rep)}</div></div>
            <div class="right small"><div class="muted">Bütçe</div><b>${money(t.budget * 1e6)}</b></div></li>`).join('')}
        </ul></div>
        <div class="small muted center">Tüm kulüp ve oyuncu isimleri kurgusaldır.</div>
      </div>`;
  }

  // ================= Ana kabuk =================
  function render() {
    if (!S()) return renderStart();
    setTeamColors();
    const s = S(), t = Gm.userTeam();
    const unread = s.inbox.filter(m => !m.read).length;
    const nav = [['inbox', '📨', 'Haberler'], ['squad', '👥', 'Kadro'], ['tactics', '📋', 'Taktik'], ['league', '🏆', 'Lig'], ['transfer', '💱', 'Transfer'], ['club', '🏟️', 'Kulüp']];
    $app.innerHTML = `
      <div class="top">
        <div class="crest">${esc(t.short)}</div>
        <div class="info"><div class="tname">${esc(t.name)}</div>
          <div class="sub">${s.week < s.fixtures.length ? `Hafta ${s.week + 1}/${s.fixtures.length}` : ''} · ${Gm.dateOf(s.week)} · <b>${money(t.money)}</b></div></div>
        <button class="btn-continue" data-a="continue" ${s.sacked ? 'disabled' : ''}>DEVAM ▶</button>
      </div>
      <div class="content" id="content">${VIEWS[ui.view]()}</div>
      <nav class="nav"><div class="nav-inner">${nav.map(n => `<button data-a="nav" data-v="${n[0]}" class="${ui.view === n[0] ? 'on' : ''}">
        <span class="ic">${n[1]}</span>${n[2]}${n[0] === 'inbox' && unread ? `<span class="badge">${unread}</span>` : ''}</button>`).join('')}</div></nav>`;
  }

  // ================= Haberler =================
  function viewInbox() {
    const s = S(), ut = Gm.userTeam();
    const fx = Gm.nextUserFixture();
    let next = '';
    if (s.sacked) {
      next = `<div class="panel"><h3>Kariyer Sona Erdi</h3><div class="body">Görevden alındınız. <button class="btn primary block mt" data-a="newGame">Yeni Kariyer Başlat</button></div></div>`;
    } else if (fx) {
      const h = Gm.team(fx.h), a = Gm.team(fx.a);
      const tbl = Gm.standings();
      const pos = t => tbl.findIndex(x => x.id === t.id) + 1;
      next = `<div class="panel"><h3>Sıradaki Maç <span class="muted small">${Gm.dateOf(s.week)}</span></h3>
        <div class="next-match">
          <div><div class="kit" style="background:${h.c1};border-color:${h.c2}"></div><div class="tm">${esc(h.name)}</div><div class="small muted">${pos(h)}. sıra · ${formHtml(h.form)}</div></div>
          <div class="vs">VS</div>
          <div><div class="kit" style="background:${a.c1};border-color:${a.c2}"></div><div class="tm">${esc(a.name)}</div><div class="small muted">${pos(a)}. sıra · ${formHtml(a.form)}</div></div>
        </div>
        <div class="body" style="padding-top:0"><button class="btn primary block" data-a="continue">Maç Öncesine Git ▶</button></div></div>`;
    }
    const msgs = s.inbox.map(m => {
      const open = ui.openMsg === m.id;
      let extra = '';
      if (open && m.type === 'offer' && !m.answered && s.offers.some(o => o.id === m.offerId)) {
        extra = `<div class="btns mt"><button class="btn good" data-a="offer" data-id="${m.offerId}" data-acc="1">Kabul Et</button>
          <button class="btn danger" data-a="offer" data-id="${m.offerId}" data-acc="0">Reddet</button></div>`;
      }
      return `<div class="msg ${m.read ? '' : 'unread'}" data-a="msg" data-id="${m.id}">
        <div class="t">${esc(m.title)}</div><div class="d">${m.season}/${String(m.season + 1).slice(2)} · Hafta ${m.week + 1}</div>
        ${open ? `<div class="b">${esc(m.body)}</div>${extra}` : ''}</div>`;
    }).join('');
    return next + `<div class="panel"><h3>Gelen Kutusu <button class="chip" data-a="readAll">Tümünü okundu say</button></h3>${msgs || '<div class="body muted">Mesaj yok.</div>'}</div>`;
  }
  function formHtml(f) { return `<span class="form">${(f || []).map(r => `<i class="${r}">${r}</i>`).join('')}</span>`; }

  // ================= Kadro =================
  function viewSquad() {
    const t = Gm.userTeam();
    const ps = Gm.teamPlayers(t);
    const order = { GK: 0, DF: 1, MF: 2, FW: 3 };
    const sorters = {
      pos: (a, b) => order[a.pos] - order[b.pos] || ovr(b) - ovr(a),
      ovr: (a, b) => ovr(b) - ovr(a), age: (a, b) => a.age - b.age,
      cond: (a, b) => b.cond - a.cond, val: (a, b) => Gm.valueOf(b) - Gm.valueOf(a)
    };
    ps.sort(sorters[ui.squadSort]);
    const xi = new Set(t.tactic.xi), subs = new Set(t.tactic.subs);
    const tabs = [['pos', 'Mevki'], ['ovr', 'Güç'], ['age', 'Yaş'], ['cond', 'Kondisyon'], ['val', 'Değer']];
    const wage = Gm.wageBill(t);
    return `<div class="tabs">${tabs.map(x => `<button data-a="squadSort" data-v="${x[0]}" class="${ui.squadSort === x[0] ? 'on' : ''}">${x[1]}</button>`).join('')}</div>
      <div class="panel"><h3>Kadro (${ps.length}) <span class="small muted">Maaşlar: ${money(wage)}/hf</span></h3>
      <ul class="list"><li class="hdr"><span style="width:30px"></span><span class="grow">Oyuncu</span><span class="num">Yaş</span><span class="num">Güç</span><span style="width:42px" class="center">Knd</span></li>
      ${ps.map(p => `<li class="tap" data-a="player" data-id="${p.id}">${posB(p.pos)}
        <div class="grow ellipsis">${xi.has(p.id) ? '<b>' : ''}${esc(p.name)}${xi.has(p.id) ? '</b>' : ''}${subs.has(p.id) ? ' <span class="muted small">(Y)</span>' : ''}${statusIcons(p)}</div>
        <span class="num">${p.age}</span><span class="ovr ${ovrCls(ovr(p))}">${ovr(p)}</span>${condBar(p.cond)}</li>`).join('')}
      </ul></div>
      <div class="small muted center">Kalın: ilk 11 · (Y): yedek · 🤕 sakat · 🟥 cezalı · 💲 satılık · 📝 sözleşmesi bitiyor</div>`;
  }

  // ================= Oyuncu kartı =================
  function playerSheet(id) {
    const s = S(), p = s.players[id];
    if (!p) return closeModal();
    const ut = Gm.userTeam();
    const own = p.teamId === ut.id;
    const t = p.teamId !== null ? Gm.team(p.teamId) : null;
    const val = Gm.valueOf(p);
    const avg = p.st.rn ? (p.st.rs / p.st.rn).toFixed(2) : '-';
    const status = p.inj > 0 ? `<span class="bad">Sakat (${p.inj} hf)</span>` : p.susp > 0 ? `<span class="bad">Cezalı (${p.susp} maç)</span>` : '<span class="good">Hazır</span>';
    const attrs = D.ATTRS.filter(a => p.pos === 'GK' || a !== 'kalecilik').map(a => `<div class="attr"><span>${D.ATTR_TR[a]}</span><b class="${attrCls(p.attrs[a])}">${p.attrs[a]}</b></div>`).join('');
    let actions = '';
    if (own) {
      const dem = Gm.renewDemand(p);
      actions = `<div class="panel mt"><h3>İşlemler</h3><div class="body">
        <button class="btn block" data-a="toggleList" data-id="${p.id}">${p.listed ? 'Transfer listesinden çıkar' : 'Transfer listesine koy'}</button>
        <div class="mt small muted">Sözleşme yenileme talebi: <b class="acc">${money(dem)}</b>/hafta</div>
        <div class="slider-row">${[1, 2, 3, 4].map(y => `<button class="chip" data-a="renew" data-id="${p.id}" data-y="${y}">${y} yıl</button>`).join('')}</div>
        <button class="btn danger block mt" data-a="release" data-id="${p.id}">Sözleşmeyi feshet (tazminat ${money(Math.round(p.wage * 52 * p.contract * 0.5))})</button>
      </div></div>`;
    } else {
      actions = bidPanel(p, val);
    }
    openModal(`<button class="close" data-a="close">✕</button>
      <h2>${esc(p.name)}</h2>
      <div class="muted">${D.POS_LONG[p.pos]} · ${p.age} yaş · ${p.nat} · ${t ? esc(t.name) : 'Serbest'}</div>
      <div class="row mt"><span class="ovr ${ovrCls(ovr(p))}" style="width:auto;padding:4px 10px;font-size:20px">${ovr(p)}</span>
        <div><div class="small muted">Potansiyel</div><div class="stars">${stars(p.pot / 4)}</div></div>
        <div class="grow right"><div class="small muted">Değer</div><b class="acc">${money(val)}</b></div></div>
      <div class="panel mt"><h3>Özellikler</h3><div class="body"><div class="attrs">${attrs}</div></div></div>
      <div class="panel"><h3>Bilgiler</h3><div class="body"><div class="kv">
        <span>Durum</span><span>${status}</span>
        <span>Kondisyon</span><span>${Math.round(p.cond)}%</span>
        <span>Moral</span><span>${moraleTxt(p.morale)}</span>
        <span>Maaş</span><span>${money(p.wage)}/hafta</span>
        <span>Sözleşme</span><span>${p.teamId === null ? '-' : p.contract + ' yıl'}</span>
        <span>Bu sezon</span><span>${p.st.apps} maç · ${p.st.g} gol · ${p.st.a} asist · Ort. ${avg}</span>
        <span>Kariyer</span><span>${p.career.apps} maç · ${p.career.g} gol</span>
        ${p.listed ? '<span>Transfer</span><span class="warn">Satış listesinde</span>' : ''}
      </div></div></div>${actions}`);
  }

  function bidPanel(p, val) {
    const ut = Gm.userTeam();
    const r = ui.bidResult && ui.bidResult.pid === p.id ? ui.bidResult : null;
    let res = '';
    if (r) {
      res = `<div class="panel mt" style="border-color:${r.ok ? 'var(--good)' : 'var(--bad)'}"><div class="body">${esc(r.text)}</div>`;
      if (r.stage === 'contract') {
        res += `<div class="body" style="padding-top:0"><div class="small muted">Sözleşme süresi seçin:</div>
          <div class="slider-row">${[1, 2, 3, 4, 5].map(y => `<button class="chip" data-a="sign" data-y="${y}" data-id="${p.id}">${y} yıl</button>`).join('')}</div>
          <button class="btn block" data-a="cancelBid">Vazgeç</button></div>`;
      } else if (r.counter) {
        res += `<div class="body" style="padding-top:0"><button class="btn primary block" data-a="bid" data-id="${p.id}" data-amt="${r.counter}">${money(r.counter)} teklif et</button></div>`;
      }
      res += '</div>';
    }
    if (p.teamId === null) {
      return `<div class="panel mt"><h3>Serbest Oyuncu</h3><div class="body">
        <button class="btn primary block" data-a="bid" data-id="${p.id}" data-amt="0">Sözleşme teklif et</button></div></div>${res}`;
    }
    const opts = [0.8, 1, 1.2, 1.5].map(f => Math.round(val * f / 5000) * 5000);
    return `<div class="panel mt"><h3>Transfer Teklifi <span class="small muted">Bütçe: ${money(ut.money)}</span></h3><div class="body">
      <div class="slider-row">${opts.map(v => `<button class="chip" data-a="bidPreset" data-v="${v}">${money(v)}</button>`).join('')}</div>
      <label class="field"><span>Teklif (bin €)</span><input id="bidAmt" type="number" inputmode="numeric" min="0" step="50" value="${Math.round(val / 1000)}"></label>
      <button class="btn primary block" data-a="bid" data-id="${p.id}">Teklif Yap</button></div></div>${res}`;
  }

  // ================= Taktik =================
  function viewTactics() {
    const t = Gm.userTeam(), tac = t.tactic;
    const slots = E.slotsOf(tac.formation);
    const P = S().players;
    const chips = (obj, key, act) => Object.keys(obj).map(k => `<button class="chip ${tac[key] === k ? 'on' : ''}" data-a="${act}" data-v="${k}">${obj[k].label}</button>`).join('');
    // Saha dizilişi
    const lines = { GK: 90, DF: 70, MF: 44, FW: 17 };
    const cnt = {}, idx = {};
    slots.forEach(s => { cnt[s] = (cnt[s] || 0) + 1; });
    const dots = slots.map((s, i) => {
      idx[s] = (idx[s] || 0) + 1;
      const x = (idx[s] / (cnt[s] + 1)) * 100;
      const p = P[tac.xi[i]];
      const bad = p && (!Gm.available(p) || p.pos !== s);
      return `<div class="pl" style="left:${x}%;top:${lines[s]}%" data-a="slot" data-i="${i}">
        <div class="dot" style="background:${p ? (bad ? 'var(--bad)' : 'var(--accent)') : '#666'}">${p ? Math.round(E.slotRating(p, s) * 5) : '?'}</div>
        <div class="nm">${p ? esc(E.surname(p)) : '—'}</div></div>`;
    }).join('');
    const xiRows = slots.map((s, i) => {
      const p = P[tac.xi[i]];
      return `<li class="tap" data-a="slot" data-i="${i}">${posB(s, p && p.pos !== s)}
        <div class="grow ellipsis">${p ? esc(p.name) + statusIcons(p) : '<span class="bad">Boş</span>'}</div>
        ${p ? `<span class="small muted">${D.POS_TR[p.pos]}</span><span class="ovr ${ovrCls(E.slotRating(p, s) * 5)}">${Math.round(E.slotRating(p, s) * 5)}</span>${condBar(p.cond)}` : ''}</li>`;
    }).join('');
    const subRows = [0, 1, 2, 3, 4, 5, 6].map(i => {
      const p = P[tac.subs[i]];
      return `<li class="tap" data-a="bench" data-i="${i}"><span class="pos" style="background:#556">Y${i + 1}</span>
        <div class="grow ellipsis">${p ? esc(p.name) + statusIcons(p) : '<span class="muted">Boş</span>'}</div>
        ${p ? `${posB(p.pos)}<span class="ovr ${ovrCls(ovr(p))}">${ovr(p)}</span>${condBar(p.cond)}` : ''}</li>`;
    }).join('');
    return `<div class="panel"><h3>Diziliş</h3><div class="body"><div class="chips">${Object.keys(D.FORMATIONS).map(f => `<button class="chip ${tac.formation === f ? 'on' : ''}" data-a="formation" data-v="${f}">${f}</button>`).join('')}</div></div></div>
      <div class="pitch">${dots}</div>
      <div class="panel"><h3>Oyun Anlayışı</h3><div class="body">
        <div class="small muted">Mentalite</div><div class="chips">${chips(D.MENTALITY, 'mentality', 'mentality')}</div>
        <div class="small muted mt">Pas Stili</div><div class="chips">${chips(D.PASSING, 'passing', 'passing')}</div>
        <div class="small muted mt">Pres</div><div class="chips">${chips(D.PRESSING, 'pressing', 'pressing')}</div>
      </div></div>
      <div class="panel"><h3>İlk 11 <button class="chip" data-a="autoPick">Otomatik Seç</button></h3><ul class="list">${xiRows}</ul></div>
      <div class="panel"><h3>Yedekler</h3><ul class="list">${subRows}</ul></div>
      <div class="small muted center">Oyuncu değiştirmek için sahadaki ya da listedeki yere dokunun. Kırmızı: mevki dışı veya hazır değil.</div>`;
  }

  function chooseSheet(kind, i) {
    const t = Gm.userTeam(), tac = t.tactic;
    const slots = E.slotsOf(tac.formation);
    const slot = kind === 'xi' ? slots[i] : null;
    const ps = Gm.teamPlayers(t).slice();
    const score = p => slot ? E.slotRating(p, slot) : E.rateFor(p, p.pos);
    ps.sort((a, b) => (Gm.available(b) - Gm.available(a)) || score(b) - score(a));
    const where = p => tac.xi.includes(p.id) ? 'İlk 11' : tac.subs.includes(p.id) ? 'Yedek' : '';
    openModal(`<button class="close" data-a="close">✕</button>
      <h2>${kind === 'xi' ? D.POS_LONG[slot] + ' seçin' : 'Yedek seçin'}</h2>
      <div class="muted small">Gösterilen güç, bu mevkide oynadığı takdirdeki değerdir.</div>
      <ul class="list mt">${kind === 'bench' ? `<li class="tap" data-a="assign" data-k="bench" data-i="${i}" data-id="-1"><span class="grow muted">— Boş bırak —</span></li>` : ''}
      ${ps.map(p => `<li class="tap" data-a="assign" data-k="${kind}" data-i="${i}" data-id="${p.id}">${posB(p.pos, slot && p.pos !== slot)}
        <div class="grow ellipsis">${esc(p.name)}${statusIcons(p)} <span class="small muted">${where(p)}</span></div>
        <span class="ovr ${ovrCls(score(p) * 5)}">${Math.round(score(p) * 5)}</span>${condBar(p.cond)}</li>`).join('')}</ul>`);
  }

  function assign(kind, i, id) {
    const tac = Gm.userTeam().tactic;
    const xi = tac.xi, subs = tac.subs;
    if (kind === 'xi') {
      const cur = xi[i];
      const j = xi.indexOf(id), k = subs.indexOf(id);
      if (j >= 0) { xi[j] = cur; xi[i] = id; }
      else if (k >= 0) { if (cur != null) subs[k] = cur; else subs.splice(k, 1); xi[i] = id; }
      else xi[i] = id;
    } else {
      const cur = subs[i];
      if (id === -1) { subs.splice(i, 1); }
      else {
        const j = xi.indexOf(id), k = subs.indexOf(id);
        if (j >= 0) { if (cur == null) { toast('İlk 11 oyuncusunu boş yedek yerine alamazsınız.'); return; } xi[j] = cur; subs[i] = id; }
        else if (k >= 0) { subs[k] = cur; subs[i] = id; }
        else { if (i >= subs.length) subs.push(id); else subs[i] = id; }
      }
    }
    tac.subs = subs.filter(x => x != null);
    Gm.save();
  }

  // ================= Lig =================
  function viewLeague() {
    const tabs = [['table', 'Puan Durumu'], ['fixtures', 'Fikstür'], ['scorers', 'Gol Krallığı'], ['history', 'Geçmiş']];
    let body = '';
    const s = S();
    if (ui.leagueTab === 'table') {
      const tbl = Gm.standings();
      body = `<div class="panel"><h3>${Gm.seasonLabel()} Süper Lig</h3><table class="tbl"><tr><th>#</th><th style="text-align:left">Takım</th><th>O</th><th>G</th><th>B</th><th>M</th><th>AV</th><th>P</th></tr>
        ${tbl.map((t, i) => `<tr class="${t.id === s.userTeamId ? 'me' : ''}" data-a="team" data-id="${t.id}">
          <td>${i + 1}</td><td class="t">${esc(t.name)}</td><td>${t.tbl.p}</td><td>${t.tbl.w}</td><td>${t.tbl.d}</td><td>${t.tbl.l}</td>
          <td>${t.tbl.gf - t.tbl.ga > 0 ? '+' : ''}${t.tbl.gf - t.tbl.ga}</td><td class="p">${t.tbl.pts}</td></tr>`).join('')}</table></div>
        <div class="small muted center">Takım kadrosunu görmek için satıra dokunun.</div>`;
    } else if (ui.leagueTab === 'fixtures') {
      if (ui.fxWeek == null) ui.fxWeek = Math.min(s.week, s.fixtures.length - 1);
      const w = ui.fxWeek;
      body = `<div class="panel"><h3><button class="chip" data-a="fxWeek" data-d="-1">◀</button> Hafta ${w + 1} <button class="chip" data-a="fxWeek" data-d="1">▶</button></h3>
        <ul class="list">${s.fixtures[w].map(m => {
          const mine = m.h === s.userTeamId || m.a === s.userTeamId;
          return `<li class="${mine ? 'me' : ''}"><span class="grow right ellipsis">${esc(Gm.team(m.h).name)}</span>
            <b class="num w acc">${m.hg == null ? '-' : m.hg + '-' + m.ag}</b><span class="grow ellipsis">${esc(Gm.team(m.a).name)}</span></li>`;
        }).join('')}</ul></div>`;
    } else if (ui.leagueTab === 'scorers') {
      const top = Gm.topScorers(25);
      body = `<div class="panel"><h3>Gol Krallığı</h3><ul class="list">${top.length ? top.map((x, i) => `<li class="tap ${x.t.id === s.userTeamId ? 'me' : ''}" data-a="player" data-id="${x.p.id}">
        <span class="num">${i + 1}</span><div class="grow ellipsis">${esc(x.p.name)} <span class="small muted">${esc(x.t.short)}</span></div>
        <span class="small muted">${x.p.st.a} as</span><b class="num acc">${x.p.st.g}</b></li>`).join('') : '<li class="muted">Henüz gol atılmadı.</li>'}</ul></div>`;
    } else {
      body = `<div class="panel"><h3>Sezon Geçmişi</h3><ul class="list">${s.history.length ? s.history.slice().reverse().map(h => `<li>
        <div class="grow"><b>${h.season}</b> · Şampiyon: ${esc(h.champ)}<div class="small muted">Gol kralı: ${esc(h.top)}</div></div>
        <div class="right"><b class="acc">${h.pos}.</b><div class="small muted">${h.pts} P</div></div></li>`).join('') : '<li class="muted">Henüz tamamlanan sezon yok.</li>'}</ul></div>`;
    }
    return `<div class="tabs">${tabs.map(x => `<button data-a="leagueTab" data-v="${x[0]}" class="${ui.leagueTab === x[0] ? 'on' : ''}">${x[1]}</button>`).join('')}</div>${body}`;
  }

  function teamSheet(id) {
    const t = Gm.team(id);
    const order = { GK: 0, DF: 1, MF: 2, FW: 3 };
    const ps = Gm.teamPlayers(t).sort((a, b) => order[a.pos] - order[b.pos] || ovr(b) - ovr(a));
    const pos = Gm.standings().findIndex(x => x.id === id) + 1;
    openModal(`<button class="close" data-a="close">✕</button>
      <h2>${esc(t.name)}</h2><div class="stars">${repStars(t.rep)}</div>
      <div class="kv mt"><span>Sıralama</span><span>${pos}. (${t.tbl.pts} puan)</span><span>Form</span><span>${formHtml(t.form)}</span>
        <span>Diziliş</span><span>${t.tactic.formation}</span><span>Kadro gücü</span><span>${Gm.teamStrength(t).toFixed(1)}</span></div>
      <ul class="list mt">${ps.map(p => `<li class="tap" data-a="player" data-id="${p.id}">${posB(p.pos)}<div class="grow ellipsis">${esc(p.name)}${statusIcons(p)}</div>
        <span class="num">${p.age}</span><span class="ovr ${ovrCls(ovr(p))}">${ovr(p)}</span><span class="num x small right">${money(Gm.valueOf(p))}</span></li>`).join('')}</ul>`);
  }

  // ================= Transfer =================
  function viewTransfer() {
    const s = S(), ut = Gm.userTeam(), f = ui.tr;
    const q = f.q.trim().toLocaleLowerCase('tr');
    let list = Object.values(s.players).filter(p => p.teamId !== ut.id);
    if (f.pos !== 'ALL') list = list.filter(p => p.pos === f.pos);
    if (f.listed) list = list.filter(p => p.listed);
    if (f.free) list = list.filter(p => p.teamId === null);
    if (q) list = list.filter(p => p.name.toLocaleLowerCase('tr').includes(q));
    list = list.filter(p => p.age <= f.maxAge);
    if (f.maxVal) list = list.filter(p => Gm.valueOf(p) <= f.maxVal);
    list.sort((a, b) => ovr(b) - ovr(a));
    const total = list.length;
    list = list.slice(0, 60);
    const offers = s.offers.map(o => {
      const p = s.players[o.pid], b = Gm.team(o.from);
      return p ? `<li><div class="grow"><b>${esc(p.name)}</b><div class="small muted">${esc(b.name)} · ${money(o.amount)}</div></div>
        <button class="btn good" data-a="offer" data-id="${o.id}" data-acc="1">✓</button><button class="btn danger" data-a="offer" data-id="${o.id}" data-acc="0">✕</button></li>` : '';
    }).join('');
    const mine = Gm.teamPlayers(ut).filter(p => p.listed);
    const posChips = [['ALL', 'Tümü'], ['GK', 'K'], ['DF', 'D'], ['MF', 'OS'], ['FW', 'F']];
    const vals = [[0, 'Limitsiz'], [500000, '€500K'], [1000000, '€1M'], [2500000, '€2,5M'], [5000000, '€5M'], [10000000, '€10M']];
    return `${offers ? `<div class="panel"><h3>Gelen Teklifler</h3><ul class="list">${offers}</ul></div>` : ''}
      <div class="panel"><h3>Oyuncu Ara <span class="small muted">Bütçe: ${money(ut.money)}</span></h3><div class="body">
        <input class="inp" id="trQ" placeholder="İsimle ara..." value="${esc(f.q)}">
        <div class="chips mt">${posChips.map(c => `<button class="chip ${f.pos === c[0] ? 'on' : ''}" data-a="trPos" data-v="${c[0]}">${c[1]}</button>`).join('')}
          <button class="chip ${f.listed ? 'on' : ''}" data-a="trToggle" data-v="listed">Satılık</button>
          <button class="chip ${f.free ? 'on' : ''}" data-a="trToggle" data-v="free">Serbest</button></div>
        <div class="row mt"><select class="inp" data-ch="trAge">${[40, 30, 27, 24, 21].map(a => `<option value="${a}" ${f.maxAge == a ? 'selected' : ''}>${a === 40 ? 'Tüm yaşlar' : 'En fazla ' + a + ' yaş'}</option>`).join('')}</select>
          <select class="inp" data-ch="trVal">${vals.map(v => `<option value="${v[0]}" ${f.maxVal == v[0] ? 'selected' : ''}>${v[0] ? 'En fazla ' + v[1] : 'Tüm değerler'}</option>`).join('')}</select></div>
      </div>
      <ul class="list"><li class="hdr"><span style="width:30px"></span><span class="grow">Oyuncu (${total})</span><span class="num">Yaş</span><span class="num">Güç</span><span class="num x right">Değer</span></li>
      ${list.map(p => `<li class="tap" data-a="player" data-id="${p.id}">${posB(p.pos)}
        <div class="grow ellipsis">${esc(p.name)}${statusIcons(p)}<div class="small muted">${p.teamId === null ? 'Serbest' : esc(Gm.team(p.teamId).name)}</div></div>
        <span class="num">${p.age}</span><span class="ovr ${ovrCls(ovr(p))}">${ovr(p)}</span><span class="num x small right">${money(Gm.valueOf(p))}</span></li>`).join('')}
      </ul></div>
      <div class="panel"><h3>Satış Listem</h3><ul class="list">${mine.length ? mine.map(p => `<li class="tap" data-a="player" data-id="${p.id}">${posB(p.pos)}<div class="grow ellipsis">${esc(p.name)}</div><span class="num x small right">${money(Gm.valueOf(p))}</span></li>`).join('') : '<li class="muted small">Satış listesinde oyuncunuz yok. Oyuncu kartından ekleyebilirsiniz.</li>'}</ul></div>`;
  }

  // ================= Kulüp =================
  function viewClub() {
    const s = S(), t = Gm.userTeam();
    const lf = s.lastFin;
    const conf = Math.round(s.board.conf);
    const confTxt = conf >= 80 ? 'Çok memnun' : conf >= 60 ? 'Memnun' : conf >= 40 ? 'Kararsız' : conf >= 20 ? 'Endişeli' : 'Sabrı tükeniyor';
    const exp = Gm.expectation(t);
    return `<div class="panel"><h3>Yönetim Kurulu</h3><div class="body">
        <div class="row"><span class="grow">Güven: <b>${confTxt}</b></span><b>${conf}%</b></div>
        <div class="bar mt" style="width:100%;height:10px"><i style="width:${conf}%;background:${conf >= 50 ? 'var(--good)' : conf >= 25 ? 'var(--warn)' : 'var(--bad)'}"></i></div>
        <div class="small muted mt">Sezon beklentisi: ${exp.text}.</div></div></div>
      <div class="panel"><h3>Mali Durum</h3><div class="body"><div class="kv">
        <span>Bakiye</span><b class="${t.money < 0 ? 'bad' : 'acc'}">${money(t.money)}</b>
        <span>Haftalık maaş yükü</span><span>${money(Gm.wageBill(t))}</span>
        <span>Sponsor + yayın (hf)</span><span>${money(Math.round(t.income * 0.75))}</span>
        ${lf ? `<span>Son hafta bilet</span><span>${money(lf.gate)}</span><span>Son hafta net</span><b class="${lf.inc - lf.exp >= 0 ? 'good' : 'bad'}">${money(lf.inc - lf.exp)}</b>` : ''}
        <span>Kulüp itibarı</span><span class="stars">${repStars(t.rep)}</span>
      </div></div></div>
      <div class="panel"><h3>Menajer</h3><div class="body"><div class="kv">
        <span>Ad</span><span>${esc(s.manager)}</span><span>Sezon</span><span>${Gm.seasonLabel()}</span>
        <span>Kupa</span><span>${s.history.filter(h => h.pos === 1).length} şampiyonluk</span></div></div></div>
      <div class="panel"><h3>Oyun</h3><div class="body btns">
        <button class="btn" data-a="saveGame">💾 Kaydet</button><button class="btn danger" data-a="newGame">Yeni Kariyer</button></div></div>
      <div class="small muted center">Oyun her hafta otomatik kaydedilir. Ana ekrana ekleyerek uygulama gibi kullanabilirsiniz.</div>`;
  }

  const VIEWS = { inbox: viewInbox, squad: viewSquad, tactics: viewTactics, league: viewLeague, transfer: viewTransfer, club: viewClub };

  // ================= Maç öncesi =================
  function preMatch() {
    const s = S();
    if (s.sacked) return;
    const fx = Gm.nextUserFixture();
    if (!fx) return;
    const warns = Gm.validateUserLineup();
    const ut = Gm.userTeam();
    const opp = Gm.team(fx.h === ut.id ? fx.a : fx.h);
    const tbl = Gm.standings();
    const P = s.players;
    const xi = ut.tactic.xi.map(id => P[id]).filter(Boolean);
    openModal(`<button class="close" data-a="close">✕</button>
      <h2>Maç Öncesi</h2><div class="muted">${esc(Gm.fixtureText(fx))} · Hafta ${s.week + 1}</div>
      ${warns.length ? `<div class="panel mt" style="border-color:var(--warn)"><div class="body warn small">${warns.map(esc).join('<br>')}</div></div>` : ''}
      <div class="panel mt"><h3>Rakip: ${esc(opp.short)}</h3><div class="body"><div class="kv">
        <span>Sıralama</span><span>${tbl.findIndex(x => x.id === opp.id) + 1}. · ${opp.tbl.pts} P</span>
        <span>Form</span><span>${formHtml(opp.form)}</span>
        <span>Diziliş</span><span>${opp.tactic.formation}</span>
        <span>Kadro gücü</span><span>${Gm.teamStrength(opp).toFixed(1)} <span class="muted">(biz ${Gm.teamStrength(ut).toFixed(1)})</span></span>
      </div></div></div>
      <div class="panel"><h3>İlk 11 · ${ut.tactic.formation} · ${D.MENTALITY[ut.tactic.mentality].label}</h3><div class="body small">${xi.map(p => esc(E.surname(p))).join(', ')}</div></div>
      <div class="btns"><button class="btn" data-a="goTactics">📋 Taktik</button><button class="btn" data-a="quickMatch">⏩ Hızlı Sonuç</button></div>
      <button class="btn primary block mt" data-a="startMatch">▶ Maçı İzle</button>`);
  }

  // ================= Canlı maç =================
  const SPEEDS = { 1: { ev: 1500, min: 280 }, 2: { ev: 750, min: 120 }, 3: { ev: 250, min: 35 } };

  function startMatch(quick) {
    closeModal();
    const prep = Gm.prepareWeek();
    const m = prep.user.match;
    MV = { prep, match: m, us: m.userSide, speed: +(localStorage.getItem('cm_speed') || 2), paused: false, queue: [], tab: 'feed', headline: null, timer: null, done: false };
    if (quick) {
      m.userSide = -1;
      m.runToEnd();
      MV.done = true;
      MV.headline = { text: m.events[m.events.length - 1].text, type: 'end' };
      renderMatch();
      return;
    }
    renderMatch();
    schedule(400);
  }

  function schedule(ms) { clearTimeout(MV.timer); MV.timer = setTimeout(tick, ms); }

  function tick() {
    if (!MV || MV.paused || MV.done) return;
    const sp = SPEEDS[MV.speed];
    if (MV.queue.length) {
      const e = MV.queue.shift();
      showEvent(e);
      if (e.type === 'half') { MV.paused = true; MV.halftime = true; renderMatch(); return; }
      if (e.type === 'injury' && e.side === MV.us && MV.match.sides[MV.us].subsLeft > 0) {
        MV.paused = true; renderMatch();
        toast('Oyuncunuz sakatlandı! Değişiklik yapmak için Taktik\'e dokunun.');
        return;
      }
      if (e.type === 'end') { MV.done = true; renderMatch(); return; }
      const slow = ['goal', 'build', 'pen', 'red'].includes(e.type);
      schedule(slow ? sp.ev : sp.ev * 0.6);
      return;
    }
    const evs = MV.match.step();
    MV.queue.push(...evs);
    if (!evs.length) { renderMatch(); schedule(sp.min); } else schedule(0);
  }

  function showEvent(e) {
    MV.headline = e;
    MV.shownMin = e.min;
    renderMatch();
  }

  function otherScores() {
    const cur = MV.done ? 999 : MV.match.minute;
    return MV.prep.others.map(o => {
      const g = [0, 0];
      o.match.events.forEach(e => { if (e.type === 'goal' && e.min <= cur) g[e.side]++; });
      return { h: o.match.sides[0].team, a: o.match.sides[1].team, g };
    });
  }

  function renderMatch() {
    if (!MV) return;
    const m = MV.match, [h, a] = m.sides;
    const cur = m.minute;
    // Görüntülenen skor: kuyruktaki olaylar henüz gösterilmediği için sayıyı olaylardan hesapla
    const shown = m.events.slice(0, m.events.length - MV.queue.length);
    const g = [0, 0];
    shown.forEach(e => { if (e.type === 'goal') g[e.side]++; });
    const scorers = [[], []];
    shown.forEach(e => { if (e.type === 'goal') scorers[e.side].push(`${E.surname(m.all[e.scorer])} ${e.min}'`); });
    const hl = MV.headline;
    const hlCls = hl ? (hl.type === 'goal' || hl.type === 'pen' ? 'goal' : hl.type === 'red' ? 'card' : '') : '';
    let body = '';
    if (MV.tab === 'feed') {
      body = `<div class="feed">${shown.slice().reverse().map(e =>
        `<div class="${e.type}"><span class="m">${e.min}'</span><span>${e.side >= 0 ? `<b>${esc(m.sides[e.side].team.short)}</b> ` : ''}${esc(e.text)}</span></div>`).join('')}</div>`;
    } else if (MV.tab === 'stats') {
      const tp = h.st.poss + a.st.poss || 1;
      const row = (l, x, y, pct) => `<div class="stat"><span class="v">${x}${pct ? '%' : ''}</span><span class="l">${l}</span><span class="v">${y}${pct ? '%' : ''}</span>
        <div class="sbar"><i style="width:${(x + y) ? x / (x + y) * 100 : 50}%;background:${h.team.c1}"></i><i style="flex:1;background:${a.team.c1}"></i></div></div>`;
      body = `<div class="panel"><div class="body">
        ${row('Topla Oynama', Math.round(h.st.poss / tp * 100), Math.round(a.st.poss / tp * 100), true)}
        ${row('Şut', h.st.shots, a.st.shots)}${row('İsabetli Şut', h.st.onT, a.st.onT)}
        ${row('Korner', h.st.corners, a.st.corners)}${row('Faul', h.st.fouls, a.st.fouls)}
        ${row('Sarı Kart', h.st.yc, a.st.yc)}${row('Kırmızı Kart', h.st.rc, a.st.rc)}</div></div>`;
    } else if (MV.tab === 'team') {
      const s = m.sides[MV.us];
      body = `<div class="panel"><h3>${esc(s.team.name)} <span class="small muted">Değişiklik hakkı: ${s.subsLeft}</span></h3><ul class="list">
        ${s.onPitch.map(o => {
          const ps = s.ps[o.p.id];
          return `<li>${posB(o.slot, o.p.pos !== o.slot)}<div class="grow ellipsis">${esc(o.p.name)} ${ps.g ? '⚽'.repeat(ps.g) : ''}${ps.yc ? ' 🟨' : ''}${ps.inj ? ' 🤕' : ''}</div>${condBar(Math.round(o.cond))}</li>`;
        }).join('')}</ul></div>
        <div class="panel"><h3>Yedekler</h3><ul class="list">${s.bench.map(p => `<li>${posB(p.pos)}<div class="grow ellipsis">${esc(p.name)}</div><span class="ovr">${ovr(p)}</span></li>`).join('') || '<li class="muted">Yedek yok</li>'}</ul></div>
        ${MV.done ? ratingsHtml(s) : ''}`;
    } else {
      body = `<div class="panel"><h3>Diğer Maçlar</h3><ul class="list">${otherScores().map(o => `<li><span class="grow right ellipsis">${esc(o.h.name)}</span><b class="num w acc">${o.g[0]}-${o.g[1]}</b><span class="grow ellipsis">${esc(o.a.name)}</span></li>`).join('')}</ul></div>`;
    }
    const minTxt = MV.done ? 'MAÇ SONU' : MV.halftime && MV.paused ? 'DEVRE ARASI' : `${Math.max(cur, MV.shownMin || 0)}'`;
    let ctl;
    if (MV.done) ctl = `<button class="primary" data-a="endMatch">Maçı Bitir ▶</button>`;
    else {
      ctl = [1, 2, 3].map(sp => `<button class="${MV.speed === sp ? 'on' : ''}" data-a="speed" data-v="${sp}">${'▶'.repeat(sp)}</button>`).join('') +
        `<button data-a="mTactic">Taktik</button>` +
        (MV.paused ? `<button class="primary" data-a="resume">${MV.halftime ? '2. Yarı' : 'Devam'}</button>` : `<button data-a="pause">❚❚</button>`) +
        `<button data-a="skip">⏭</button>`;
    }
    let root = document.getElementById('matchRoot');
    if (!root) { root = document.createElement('div'); root.id = 'matchRoot'; root.className = 'match'; document.body.appendChild(root); }
    const scrollTop = root.querySelector('.mbody') ? root.querySelector('.mbody').scrollTop : 0;
    root.innerHTML = `
      <div class="score"><div class="sb">
        <div class="tn"><span class="sq" style="background:${h.team.c1};border-right:4px solid ${h.team.c2}"></span><span>${esc(h.team.name)}</span></div>
        <div class="res">${g[0]}-${g[1]}</div>
        <div class="tn a"><span>${esc(a.team.name)}</span><span class="sq" style="background:${a.team.c1};border-left:4px solid ${a.team.c2}"></span></div></div>
        <div class="min">${minTxt}</div>
        <div class="scr"><div>${scorers[0].map(esc).join(', ')}</div><div>${scorers[1].map(esc).join(', ')}</div></div></div>
      <div class="headline ${hlCls}">${hl ? esc(hl.text) : 'Takımlar sahaya çıkıyor...'}</div>
      <div class="mtabs">${[['feed', 'Anlatım'], ['stats', 'İstatistik'], ['team', 'Takımım'], ['others', 'Diğer Skorlar']].map(t => `<button data-a="mTab" data-v="${t[0]}" class="${MV.tab === t[0] ? 'on' : ''}">${t[1]}</button>`).join('')}</div>
      <div class="mbody">${body}</div>
      <div class="mctl">${ctl}</div>`;
    const mb = root.querySelector('.mbody');
    if (mb && MV.tab !== 'feed') mb.scrollTop = scrollTop;
  }

  function ratingsHtml(s) {
    const rows = Object.keys(s.ps).map(id => ({ p: MV.match.all[id], ps: s.ps[id] })).filter(x => x.ps.rating != null)
      .sort((x, y) => y.ps.rating - x.ps.rating);
    return `<div class="panel"><h3>Oyuncu Notları</h3><ul class="list">${rows.map(x => `<li>${posB(x.p.pos)}<div class="grow ellipsis">${esc(x.p.name)} ${x.ps.g ? '⚽'.repeat(x.ps.g) : ''}${x.ps.a ? ' 🅰️'.repeat(x.ps.a) : ''}</div>
      <b class="num ${x.ps.rating >= 7.5 ? 'good' : x.ps.rating < 6 ? 'bad' : ''}">${x.ps.rating.toFixed(1)}</b></li>`).join('')}</ul></div>`;
  }

  function matchTacticSheet() {
    const s = MV.match.sides[MV.us];
    const chips = Object.keys(D.MENTALITY).map(k => `<button class="chip ${s.tactic.mentality === k ? 'on' : ''}" data-a="mMent" data-v="${k}">${D.MENTALITY[k].label}</button>`).join('');
    const pr = Object.keys(D.PRESSING).map(k => `<button class="chip ${s.tactic.pressing === k ? 'on' : ''}" data-a="mPress" data-v="${k}">${D.PRESSING[k].label}</button>`).join('');
    openModal(`<button class="close" data-a="closeMT">✕</button><h2>Maç İçi Taktik</h2>
      <div class="small muted mt">Mentalite</div><div class="chips">${chips}</div>
      <div class="small muted mt">Pres</div><div class="chips">${pr}</div>
      <div class="panel mt"><h3>Oyuncu Değişikliği (${s.subsLeft} hak)</h3><div class="body">
        ${s.subsLeft > 0 && s.bench.length ? `
        <label class="field"><span>Çıkacak oyuncu</span><select id="subOut">${s.onPitch.map(o => `<option value="${o.p.id}">${D.POS_TR[o.slot]} · ${esc(o.p.name)} (${Math.round(o.cond)}%${s.ps[o.p.id].inj ? ', sakat' : ''})</option>`).join('')}</select></label>
        <label class="field"><span>Girecek oyuncu</span><select id="subIn">${s.bench.map(p => `<option value="${p.id}">${D.POS_TR[p.pos]} · ${esc(p.name)} (${ovr(p)})</option>`).join('')}</select></label>
        <button class="btn primary block" data-a="doSub">Değişikliği Yap</button>` : '<div class="muted">Değişiklik hakkınız kalmadı.</div>'}
      </div></div>`);
  }

  function endMatch() {
    clearTimeout(MV.timer);
    const prep = MV.prep;
    const week = S().week;
    Gm.finishWeek(prep);
    const root = document.getElementById('matchRoot');
    if (root) root.remove();
    MV = null;
    const s = S();
    const results = prep.others.map(o => o.fx).concat([prep.user.fx]);
    ui.view = 'inbox'; ui.fxWeek = null;
    render();
    const tbl = Gm.standings();
    const pos = tbl.findIndex(t => t.id === s.userTeamId) + 1;
    openModal(`<button class="close" data-a="close">✕</button><h2>Hafta ${week + 1} Sonuçları</h2>
      <ul class="list mt">${results.map(m => `<li class="${m.h === s.userTeamId || m.a === s.userTeamId ? 'me' : ''}"><span class="grow right ellipsis">${esc(Gm.team(m.h).name)}</span>
        <b class="num w acc">${m.hg}-${m.ag}</b><span class="grow ellipsis">${esc(Gm.team(m.a).name)}</span></li>`).join('')}</ul>
      ${s.week > 0 ? `<div class="center mt">Ligdeki yeriniz: <b class="acc">${pos}.</b></div>` : '<div class="center mt acc">Sezon tamamlandı! Gelen kutunuzu kontrol edin.</div>'}
      <button class="btn primary block mt" data-a="close">Tamam</button>`);
  }

  // ================= Olaylar =================
  const A = {
    nav(d) { ui.view = d.v; render(); window.scrollTo(0, 0); },
    close() { closeModal(); },
    loadGame() { if (Gm.load()) { ui.view = 'inbox'; render(); } else toast('Kayıt yüklenemedi.'); },
    pickTeam(d) {
      const name = (document.getElementById('mgrName').value || '').trim() || 'Menajer';
      try { localStorage.setItem('cm_mgr', name); } catch (e) { /* yok */ }
      const t = D.TEAMS[+d.id];
      openModal(`<h2>${esc(t[0])}</h2><div class="stars">${repStars(t[2])}</div>
        <p>Bu kulübün teknik direktörü olmak istiyor musunuz? Transfer bütçesi: <b class="acc">${money(t[5] * 1e6)}</b></p>
        ${Gm.hasSave() ? '<p class="warn small">Mevcut kariyeriniz silinecek.</p>' : ''}
        <div class="btns"><button class="btn" data-a="close">Vazgeç</button><button class="btn primary" data-a="confirmTeam" data-id="${d.id}" data-n="${esc(name)}">Sözleşme İmzala</button></div>`);
    },
    confirmTeam(d) { closeModal(); Gm.newGame(d.n, +d.id); ui.view = 'inbox'; render(); },
    newGame() {
      openModal(`<h2>Yeni Kariyer</h2><p>Mevcut kariyeriniz silinecek. Emin misiniz?</p>
        <div class="btns"><button class="btn" data-a="close">Vazgeç</button><button class="btn danger" data-a="confirmNew">Evet, sil</button></div>`);
    },
    confirmNew() { closeModal(); Gm.deleteSave(); renderStart(); },
    saveGame() { Gm.save(); toast('Oyun kaydedildi.'); },
    continue() {
      const s = S();
      if (s.sacked) return;
      preMatch();
    },
    goTactics() { closeModal(); ui.view = 'tactics'; render(); },
    startMatch() { startMatch(false); },
    quickMatch() { startMatch(true); },
    msg(d) {
      const id = +d.id; const m = S().inbox.find(x => x.id === id);
      if (m) { m.read = true; ui.openMsg = ui.openMsg === id ? null : id; Gm.save(); render(); }
    },
    readAll() { S().inbox.forEach(m => { m.read = true; }); Gm.save(); render(); },
    offer(d, el, e) {
      e.stopPropagation();
      const r = Gm.answerOffer(+d.id, d.acc === '1');
      toast(r.text); render();
    },
    squadSort(d) { ui.squadSort = d.v; render(); },
    player(d) { ui.bidResult = null; playerSheet(+d.id); },
    team(d) { teamSheet(+d.id); },
    toggleList(d) { const l = Gm.toggleList(+d.id); toast(l ? 'Oyuncu transfer listesine eklendi.' : 'Oyuncu listeden çıkarıldı.'); playerSheet(+d.id); render(); },
    renew(d) { const r = Gm.renewContract(+d.id, +d.y); toast(r.ok ? 'Sözleşme yenilendi.' : r.text); playerSheet(+d.id); render(); },
    release(d) {
      const p = S().players[+d.id];
      openModal(`<h2>Sözleşme Feshi</h2><p>${esc(p.name)} ile sözleşmeyi feshetmek istediğinize emin misiniz?</p>
        <div class="btns"><button class="btn" data-a="player" data-id="${p.id}">Vazgeç</button><button class="btn danger" data-a="confirmRelease" data-id="${p.id}">Feshet</button></div>`);
    },
    confirmRelease(d) { const r = Gm.releasePlayer(+d.id); if (r.ok) { closeModal(); toast('Sözleşme feshedildi.'); render(); } else toast(r.text); },
    bidPreset(d) { const i = document.getElementById('bidAmt'); if (i) i.value = Math.round(+d.v / 1000); },
    bid(d) {
      let amt = d.amt !== undefined ? +d.amt : Math.round(+(document.getElementById('bidAmt') || {}).value * 1000);
      if (!(amt >= 0)) amt = 0;
      const r = Gm.makeBid(+d.id, amt);
      ui.bidResult = Object.assign({ pid: +d.id }, r);
      playerSheet(+d.id);
      const sh = $modal.querySelector('.sheet'); if (sh) sh.scrollTop = sh.scrollHeight;
    },
    sign(d) {
      if (Gm.acceptContract(+d.y)) { closeModal(); toast('Transfer tamamlandı!'); render(); }
      else { toast('Transfer gerçekleşemedi.'); closeModal(); }
    },
    cancelBid() { S().pendingBid = null; ui.bidResult = null; closeModal(); },
    formation(d) { const t = Gm.userTeam(); t.tactic.formation = d.v; Gm.autoLineup(t, true); Gm.save(); render(); },
    mentality(d) { Gm.userTeam().tactic.mentality = d.v; Gm.save(); render(); },
    passing(d) { Gm.userTeam().tactic.passing = d.v; Gm.save(); render(); },
    pressing(d) { Gm.userTeam().tactic.pressing = d.v; Gm.save(); render(); },
    autoPick() { Gm.autoLineup(Gm.userTeam(), true); Gm.save(); render(); toast('En iyi 11 seçildi.'); },
    slot(d) { chooseSheet('xi', +d.i); },
    bench(d) { chooseSheet('bench', +d.i); },
    assign(d) { assign(d.k, +d.i, +d.id); closeModal(); render(); },
    leagueTab(d) { ui.leagueTab = d.v; render(); },
    fxWeek(d) { const n = S().fixtures.length; ui.fxWeek = Math.max(0, Math.min(n - 1, ui.fxWeek + +d.d)); render(); },
    trPos(d) { ui.tr.pos = d.v; render(); },
    trToggle(d) { ui.tr[d.v] = !ui.tr[d.v]; render(); },
    // maç
    speed(d) { MV.speed = +d.v; try { localStorage.setItem('cm_speed', d.v); } catch (e) { /* yok */ } renderMatch(); },
    pause() { MV.paused = true; renderMatch(); },
    resume() { MV.paused = false; MV.halftime = false; renderMatch(); schedule(100); },
    skip() {
      clearTimeout(MV.timer);
      MV.match.runToEnd();
      MV.queue = [];
      MV.headline = MV.match.events[MV.match.events.length - 1];
      MV.done = true; MV.paused = false; renderMatch();
    },
    mTab(d) { MV.tab = d.v; renderMatch(); },
    mTactic() { MV.wasPaused = MV.paused; MV.paused = true; clearTimeout(MV.timer); matchTacticSheet(); },
    closeMT() { closeModal(); if (!MV.wasPaused) { MV.paused = false; schedule(300); } renderMatch(); },
    mMent(d) { MV.match.sides[MV.us].tactic.mentality = d.v; matchTacticSheet(); },
    mPress(d) { MV.match.sides[MV.us].tactic.pressing = d.v; matchTacticSheet(); },
    doSub() {
      const out = +document.getElementById('subOut').value, inn = +document.getElementById('subIn').value;
      const s = MV.match.sides[MV.us];
      if (MV.match.substitute(s, out, inn)) {
        MV.queue.push(MV.match.events[MV.match.events.length - 1]);
        toast('Değişiklik yapıldı.');
      }
      matchTacticSheet();
    },
    endMatch() { endMatch(); }
  };

  document.addEventListener('click', e => {
    const el = e.target.closest('[data-a]');
    if (!el) return;
    const fn = A[el.dataset.a];
    if (fn) fn(el.dataset, el, e);
  });
  document.addEventListener('change', e => {
    const el = e.target;
    if (el.dataset.ch === 'trAge') { ui.tr.maxAge = +el.value; render(); }
    if (el.dataset.ch === 'trVal') { ui.tr.maxVal = +el.value; render(); }
  });
  let qTimer = null;
  document.addEventListener('input', e => {
    if (e.target.id === 'trQ') {
      ui.tr.q = e.target.value;
      clearTimeout(qTimer);
      qTimer = setTimeout(() => {
        render();
        const i = document.getElementById('trQ');
        if (i) { i.focus(); i.setSelectionRange(i.value.length, i.value.length); }
      }, 350);
    }
  });

  // Başlat
  if (Gm.hasSave() && Gm.load()) render(); else renderStart();
})(window);
