/* Arayüz: temel yardımcılar, başlangıç, ana kabuk, haberler, kadro, taktik, oyuncu kartı */
(function (G) {
  'use strict';
  const CM = G.CM, U = CM.U, P = CM.P, C = CM.Comp, E = CM.E, M = CM.Market;
  const $app = document.getElementById('app');
  const $modal = document.getElementById('modal');
  const $toast = document.getElementById('toast');
  const esc = U.esc;
  const S = () => CM.S;

  const ui = {
    view: 'inbox', squadSort: 'pos', squadFilter: 'all', openMsg: null, bid: null,
    comp: null, compTab: 'table', fxRound: null, worldTab: 'mine',
    tr: { q: '', pos: 'ALL', lg: '', nat: '', maxAge: 40, maxVal: 0, listed: false, free: false, knownOnly: false },
    start: { step: 'menu', cty: 'TUR', lg: 'TUR1', name: '', nat: '' }, natTab: 'squad'
  };
  const A = {};
  const UI = CM.UI = { ui, A, esc };

  // ---------- Genel yardımcılar ----------
  function toast(t) {
    $toast.textContent = t; $toast.classList.remove('hidden');
    clearTimeout(toast._t); toast._t = setTimeout(() => $toast.classList.add('hidden'), 2800);
  }
  function openModal(html, keepScroll) {
    const open = !$modal.classList.contains('hidden');
    const old = $modal.querySelector('.sheet');
    const top = open && old && keepScroll ? old.scrollTop : 0;
    $modal.innerHTML = `<div class="sheet${open ? ' still' : ''}">${html}</div>`;
    $modal.classList.remove('hidden');
    if (top) $modal.querySelector('.sheet').scrollTop = top;
  }
  function closeModal() { $modal.classList.add('hidden'); $modal.innerHTML = ''; ui.bid = null; }
  $modal.addEventListener('click', e => { if (e.target === $modal) closeModal(); });
  function busy(on, text) {
    let el = document.getElementById('busy');
    if (on) {
      if (!el) { el = document.createElement('div'); el.id = 'busy'; el.className = 'busy'; document.body.appendChild(el); }
      el.innerHTML = `<div class="spin"></div><div>${esc(text || 'İşleniyor...')}</div>`;
    } else if (el) el.remove();
  }

  const club = () => S() && S().user && S().user.club != null ? S().clubs[S().user.club] : null;
  const age = p => S().season - p.b;
  const nat = code => CM.DB.nations[code] || { n: code };
  function flag(code) { return `<span class="fl" title="${esc(nat(code).n)}">${esc(code)}</span>`; }
  function posB(pos, off) { return `<span class="pos ${P.LINE[pos]}${off ? ' off' : ''}">${P.POS_TR[pos]}</span>`; }
  function attrCls(v) { return v <= 5 ? 'a1' : v <= 9 ? 'a2' : v <= 13 ? 'a3' : v <= 16 ? 'a4' : 'a5'; }
  function ovrCls(v) { return v < 55 ? 'a1' : v < 63 ? 'a2' : v < 71 ? 'a3' : v < 79 ? 'a4' : 'a5'; }
  function condColor(c) { return c >= 85 ? 'var(--good)' : c >= 65 ? 'var(--warn)' : 'var(--bad)'; }
  function condBar(c) { c = Math.round(c); return `<span class="bar" title="Kondisyon ${c}%"><i style="width:${c}%;background:${condColor(c)}"></i></span>`; }
  function moraleTxt(m) { return m >= 85 ? 'Süper' : m >= 70 ? 'Çok iyi' : m >= 55 ? 'İyi' : m >= 40 ? 'Normal' : m >= 25 ? 'Kötü' : 'Berbat'; }
  function stars(n) { const k = Math.max(0, Math.min(5, Math.round(n * 2) / 2)); let s = ''; for (let i = 1; i <= 5; i++) s += k >= i ? '★' : k >= i - 0.5 ? '⯪' : '☆'; return s; }
  const repStars = rep => stars((rep - 40) / 11);
  // Bilinmeyen oyuncular için güç aralığı
  function ovrTxt(p) {
    const o = P.ovr(p);
    const lvl = M.known(p);
    if (lvl >= 2) return { t: String(o), v: o };
    const w = lvl === 1 ? 3 : 6;
    const r = U.seeded('o' + p.id)();
    const lo = Math.round(o - w * r), hi = lo + w;
    return { t: `${lo}-${hi}`, v: o, fuzzy: true };
  }
  function ovrB(p) { const o = ovrTxt(p); return `<span class="ovr ${ovrCls(o.v)}${o.fuzzy ? ' fz' : ''}">${o.t}</span>`; }
  function statusIcons(p) {
    let s = '';
    if (p.inj > 0) s += ' <span class="ic-s" title="Sakat">🤕</span>';
    if (Object.values(p.sus || {}).some(v => v > 0)) s += ' <span class="ic-s" title="Cezalı">🟥</span>';
    if (p.away && p.away >= S().day) s += ' <span class="ic-s" title="Milli takımda">🌍</span>';
    if (p.listed) s += ' <span class="ic-s" title="Satış listesinde">💲</span>';
    if (p.loanListed) s += ' <span class="ic-s" title="Kiralık listesinde">🔄</span>';
    if (p.loan) s += ' <span class="ic-s" title="Kiralık oyuncu">🔁</span>';
    if (p.club != null && p.ce <= S().season) s += ' <span class="ic-s" title="Sözleşmesi bu sezon bitiyor">📝</span>';
    if (p.gen) s += ' <span class="ic-s gen" title="Kurgusal oyuncu (veritabanı tamamlayıcı)">·</span>';
    return s;
  }
  function kit(c1, c2, size) { size = size || 22; return `<span class="kit" style="width:${size}px;height:${size}px;background:${c1};border-color:${c2}"></span>`; }
  // Kulüp arması: kulüp renkleri ve kulübe özgü desenle çizilen kalkan (gerçek logolar kullanılmaz)
  let crestN = 0;
  function crest(o, size) {
    size = size || 22;
    if (!o) return '';
    const c1 = o.c1 || '#1a3a7a', c2 = o.c2 || '#ffffff';
    const nat = !!o.code && !o.players;
    const hs = Math.abs(U.hash(String(o.key || (typeof o.id === 'string' ? o.id : '') || o.code || o.n)));
    const txt = esc(String(o.sh || o.code || o.n.slice(0, 3)).slice(0, 3).toUpperCase());
    const id = 'cr' + (++crestN);
    if (nat) {
      const bands = hs % 3 === 0 ? `<rect width="48" height="16" fill="${c1}"/><rect y="16" width="48" height="16" fill="${c2}"/>`
        : hs % 3 === 1 ? `<rect width="16" height="32" fill="${c1}"/><rect x="16" width="16" height="32" fill="${c2}"/><rect x="32" width="16" height="32" fill="${c1}"/>`
        : `<rect width="48" height="32" fill="${c1}"/><rect y="11" width="48" height="10" fill="${c2}"/>`;
      return `<svg class="crest-i" width="${Math.round(size * 1.3)}" height="${Math.round(size * 0.87)}" viewBox="0 0 48 32" aria-hidden="true"><clipPath id="${id}"><rect width="48" height="32" rx="4"/></clipPath><g clip-path="url(#${id})">${bands}</g>
        <rect x=".75" y=".75" width="46.5" height="30.5" rx="4" fill="none" stroke="#0006" stroke-width="1.5"/>
        <text x="24" y="21" text-anchor="middle" font-size="12" font-weight="900" fill="#fff" stroke="#000a" stroke-width="2.4" paint-order="stroke" font-family="Arial,sans-serif">${txt}</text></svg>`;
    }
    const shield = 'M4 3H36V21C36 34 28 41 20 45C12 41 4 34 4 21Z';
    const P = [
      `<rect width="40" height="48" fill="${c1}"/>`,
      `<rect width="40" height="48" fill="${c1}"/>${[8, 24].map(x => `<rect x="${x}" width="8" height="48" fill="${c2}"/>`).join('')}`,
      `<rect width="20" height="48" fill="${c1}"/><rect x="20" width="20" height="48" fill="${c2}"/>`,
      `<rect width="40" height="48" fill="${c1}"/><path d="M-4 8L8 -4L46 34L34 46Z" fill="${c2}"/>`,
      `<rect width="40" height="48" fill="${c1}"/>${[11, 27].map(y => `<rect y="${y}" width="40" height="8" fill="${c2}"/>`).join('')}`,
      `<rect width="40" height="48" fill="${c1}"/><path d="M0 12L20 26L40 12V20L20 34L0 20Z" fill="${c2}"/>`,
      `<rect width="40" height="48" fill="${c1}"/><rect x="20" width="20" height="22" fill="${c2}"/><rect y="22" width="20" height="26" fill="${c2}"/>`,
      `<rect width="40" height="48" fill="${c1}"/><rect x="15" width="10" height="48" fill="${c2}"/>`
    ];
    const pat = P[hs % P.length];
    const top = (hs >> 3) % 2 ? `<rect width="40" height="10" fill="${c2}"/><text x="20" y="8.6" text-anchor="middle" font-size="7" font-weight="900" fill="${c1}" font-family="Arial,sans-serif">★</text>` : '';
    return `<svg class="crest-i" width="${size}" height="${Math.round(size * 1.15)}" viewBox="0 0 40 48" aria-hidden="true"><clipPath id="${id}"><path d="${shield}"/></clipPath>
      <g clip-path="url(#${id})">${pat}${top}</g><path d="${shield}" fill="none" stroke="${c2}" stroke-width="2.2"/><path d="${shield}" fill="none" stroke="#0007" stroke-width=".8"/>
      <text x="20" y="${top ? 30 : 28}" text-anchor="middle" font-size="${txt.length > 2 ? 11 : 13}" font-weight="900" fill="#fff" stroke="#000b" stroke-width="2.6" paint-order="stroke" font-family="Arial,sans-serif">${txt}</text></svg>`;
  }
  function teamLink(t, noCrest) { const o = C.tObj(t); if (!o) return '?'; return `${noCrest ? '' : crest(o, 15) + ' '}<span class="tl" data-a="team" data-id="${esc(t)}">${esc(o.n)}</span>`; }
  const dstr = d => U.fmtDay(d, 'short');
  function compName(cid) { const c = S().comps[cid]; return c ? c.sh || c.n : ''; }

  // Oyuncunun sezon istatistikleri (tüm turnuvalar)
  function seasonStats(p) {
    const t = [0, 0, 0, 0, 0];
    for (const k in p.st) p.st[k].forEach((v, i) => { t[i] += v; });
    return t;
  }

  UI.h = { toast, openModal, closeModal, busy, club, age, nat, flag, posB, attrCls, ovrCls, condBar, moraleTxt, stars, repStars, ovrTxt, ovrB, statusIcons, kit, crest, teamLink, dstr, compName, seasonStats };

  // ---------- Başlangıç ----------
  function renderStart(meta) {
    const st = ui.start;
    let body = '';
    if (st.step === 'menu') {
      body = `
        ${meta ? `<button class="btn primary block" data-a="loadGame">▶ Kariyere Devam Et<div class="small">${esc(meta.name)} · ${esc(meta.club)} · ${U.fmtDay(meta.day)}</div></button>` : ''}
        <button class="btn block ${meta ? '' : 'primary'}" data-a="startNew">Yeni Kariyer</button>
        <div class="panel"><div class="body small muted">
          20 ülke ligi ve 6 ikinci lig · UEFA Şampiyonlar Ligi, Avrupa Ligi, Konferans Ligi · Uluslar Ligi, EURO 2028 ve 2030 Dünya Kupası · 2026-27 sezonu kadroları.
        </div></div>`;
    } else if (st.step === 'club') {
      const ctys = Object.keys(CM.COUNTRIES);
      const lgs = CM.COUNTRIES[st.cty].leagues;
      const clubs = CM.DB.clubs.filter(c => c.lg === st.lg).sort((a, b) => b.rep - a.rep);
      const L = CM.LEAGUES[st.lg];
      body = `
        <div class="panel"><div class="body">
          <label class="field"><span>Menajer adınız</span><input id="mgrName" maxlength="24" placeholder="Adınız Soyadınız" value="${esc(st.name)}"></label>
          <label class="field"><span>Ülke</span><select class="inp" data-ch="stCty">${ctys.map(c => `<option value="${c}" ${c === st.cty ? 'selected' : ''}>${esc(nat(c).n)} - ${esc(CM.LEAGUES[CM.COUNTRIES[c].leagues[0]].n)}</option>`).join('')}</select></label>
          ${lgs.length > 1 ? `<div class="chips">${lgs.map(l => `<button class="chip ${l === st.lg ? 'on' : ''}" data-a="stLg" data-v="${l}">${esc(CM.LEAGUES[l].n)}</button>`).join('')}</div>` : ''}
          <label class="field"><span>Milli takım (isteğe bağlı, kulüple birlikte yönetilir)</span><select class="inp" data-ch="stNat"><option value="">— Yok —</option>
            ${Object.keys(CM.DB.nations).filter(k => k !== 'RUS').sort((a, b) => nat(a).n.localeCompare(nat(b).n, 'tr')).map(k => `<option value="${k}" ${k === st.nat ? 'selected' : ''}>${esc(nat(k).n)}</option>`).join('')}</select></label>
        </div></div>
        <div class="panel"><h3>${esc(L.n)} · ${clubs.length} kulüp</h3><ul class="list">
          ${clubs.map(c => `<li class="tap" data-a="pickClub" data-id="${c.id}">${crest(c)}
            <div class="grow"><div class="ellipsis"><b>${esc(c.n)}</b></div><div class="stars">${repStars(c.rep)}</div></div>
            <div class="right small muted">${esc(c.st || '')}</div></li>`).join('')}
        </ul></div>
        <button class="btn block" data-a="startBack">◀ Geri</button>`;
    }
    $app.innerHTML = `<div class="start">
      <div class="logo"><div class="l1">ŞAMPİYONLUK</div><div class="l2">MENAJERİ</div><div class="l3">01/02</div><div class="small muted">2026/27 sezonu</div></div>
      ${body}
      <div class="small muted center">Kulüp ve oyuncu adları gerçektir; güç değerleri oyunun kendi tahminidir. Kadro boşlukları kurgusal oyuncularla tamamlanır.</div>
    </div>`;
  }
  UI.renderStart = renderStart;

  // ---------- Ana kabuk ----------
  const NAV = [['inbox', '📨', 'Haberler'], ['squad', '👥', 'Kadro'], ['tactics', '📋', 'Taktik'], ['matches', '📅', 'Maçlar'], ['world', '🏆', 'Turnuvalar'], ['transfer', '💱', 'Transfer'], ['club', '🏟️', 'Kulüp']];
  function render() {
    const s = S();
    if (!s) return renderStart();
    const c = club();
    if (c) { document.documentElement.style.setProperty('--c1', c.c1); document.documentElement.style.setProperty('--c2', c.c2); }
    const unread = s.news.filter(n => !n.read).length;
    const V = UI.VIEWS[ui.view] || UI.VIEWS.inbox;
    $app.innerHTML = `
      <div class="top">
        <div class="crest-top">${c ? crest(c, 34) : ''}</div>
        <div class="info"><div class="tname">${esc(c ? c.n : 'İşsiz menajer')}</div>
          <div class="sub">${U.fmtDay(s.day, 'dow')}${c ? ` · Transfer: <b>${U.money(M.budget(c))}</b>` : ''}</div></div>
        <button class="btn-continue" data-a="continue">DEVAM ▶</button>
      </div>
      <div class="content" id="content">${V()}</div>
      <nav class="nav"><div class="nav-inner">${NAV.map(n => `<button data-a="nav" data-v="${n[0]}" class="${ui.view === n[0] || (UI.PARENT[ui.view] === n[0]) ? 'on' : ''}">
        <span class="ic">${n[1]}</span>${n[2]}${n[0] === 'inbox' && unread ? `<span class="badge">${unread > 99 ? '99+' : unread}</span>` : ''}</button>`).join('')}</div></nav>`;
  }
  UI.render = render;
  UI.PARENT = { comp: 'world', national: 'club' };
  UI.VIEWS = {};

  // ---------- Haberler ----------
  UI.VIEWS.inbox = function () {
    const s = S(), u = s.user, c = club();
    let head = '';
    if (!c) {
      const offers = (u.offers || []).map(id => s.clubs[id]).filter(Boolean);
      head = `<div class="panel"><h3>İş Teklifleri</h3><ul class="list">${offers.length ? offers.map(o => `<li>${crest(o)}<div class="grow"><b>${esc(o.n)}</b><div class="small muted">${esc(o.lg ? CM.LEAGUES[o.lg].n : '')}</div></div>
        <button class="btn good" data-a="takeJob" data-id="${o.id}">Kabul</button></li>`).join('') : '<li class="muted">Şu an teklif yok. Devam ederek yeni teklif bekleyebilirsiniz.</li>'}</ul></div>`;
    } else {
      const nx = CM.Game.upcoming(c.id, 1)[0];
      const nnx = u.nat ? CM.Game.upcoming('N:' + u.nat, 1)[0] : null;
      const card = (f, mine) => {
        const h = C.tObj(f.h), a = C.tObj(f.a), cc = s.comps[f.c];
        return `<div class="panel"><h3>${mine ? 'Sıradaki maç' : 'Milli takımın sıradaki maçı'} <span class="muted small">${U.fmtDay(f.d, 'dow')}</span></h3>
          <div class="next-match">
            <div>${crest(h, 38)}<div class="tm">${esc(h.n)}</div></div>
            <div class="vs">VS<div class="small muted">${esc(cc.sh || cc.n)}</div></div>
            <div>${crest(a, 38)}<div class="tm">${esc(a.n)}</div></div>
          </div></div>`;
      };
      if (nx) head += card(nx, true);
      if (nnx && (!nx || nnx.d < nx.d)) head += card(nnx, false);
    }
    const msgs = s.news.slice(0, 120).map(m => {
      const open = ui.openMsg === m.id;
      let extra = '';
      if (open && m.type === 'offer' && !m.answered && s.offers.some(o => o.id === m.offerId)) {
        extra = `<div class="btns mt"><button class="btn primary" data-a="offerOpen" data-id="${m.offerId}">Teklifi yanıtla</button></div>`;
      }
      if (open && m.type === 'natjob' && u.natOffer === m.nat) {
        extra = `<div class="btns mt"><button class="btn good" data-a="takeNat" data-v="${m.nat}">Milli takım görevini kabul et</button></div>`;
      }
      if (open && m.type === 'job' && m.club != null && (u.offers || []).includes(m.club)) {
        extra = `<div class="btns mt"><button class="btn good" data-a="takeJob" data-id="${m.club}">Teklifi kabul et</button></div>`;
      }
      if (open && m.pid && s.players[m.pid]) extra += `<div class="btns mt"><button class="btn" data-a="player" data-id="${m.pid}">Oyuncuyu gör</button></div>`;
      return `<div class="msg ${m.read ? '' : 'unread'} ${m.type || ''}" data-a="msg" data-id="${m.id}">
        <div class="t">${esc(m.t)}</div><div class="d">${U.fmtDay(m.day)}</div>
        ${open ? `<div class="b">${esc(m.b)}</div>${extra}` : ''}</div>`;
    }).join('');
    return head + `<div class="panel"><h3>Gelen Kutusu <button class="chip" data-a="readAll">Tümünü okundu say</button></h3>${msgs || '<div class="body muted">Mesaj yok.</div>'}</div>`;
  };

  // ---------- Kadro ----------
  UI.VIEWS.squad = function () {
    const c = club();
    if (!c) return '<div class="panel"><div class="body muted">Bir kulübü yönetmiyorsunuz.</div></div>';
    let ps = c.players.map(id => S().players[id]).filter(Boolean);
    const order = { G: 0, D: 1, M: 2, F: 3 };
    const sorters = {
      pos: (a, b) => order[P.LINE[a.pos]] - order[P.LINE[b.pos]] || P.POS.indexOf(a.pos) - P.POS.indexOf(b.pos) || P.ovr(b) - P.ovr(a),
      ovr: (a, b) => P.ovr(b) - P.ovr(a), age: (a, b) => a.b - b.b, cond: (a, b) => b.cond - a.cond,
      val: (a, b) => P.valueOf(b) - P.valueOf(a), wage: (a, b) => b.wage - a.wage
    };
    if (ui.squadFilter === 'inj') ps = ps.filter(p => p.inj > 0 || Object.values(p.sus).some(v => v > 0));
    if (ui.squadFilter === 'young') ps = ps.filter(p => age(p) <= 21);
    if (ui.squadFilter === 'contract') ps = ps.filter(p => p.ce <= S().season + 1);
    ps.sort(sorters[ui.squadSort]);
    const xi = new Set(c.tactic.xi), subs = new Set(c.tactic.subs);
    const tabs = [['pos', 'Mevki'], ['ovr', 'Güç'], ['age', 'Yaş'], ['cond', 'Kondisyon'], ['val', 'Değer'], ['wage', 'Maaş']];
    const filters = [['all', 'Tümü'], ['inj', 'Sakat/Cezalı'], ['young', 'U21'], ['contract', 'Sözleşmesi bitenler']];
    const wage = c.players.reduce((t, id) => t + (S().players[id] ? S().players[id].wage : 0), 0);
    const foreign = c.players.filter(id => S().players[id] && S().players[id].nat !== c.cty).length;
    const L = c.lg ? CM.LEAGUES[c.lg] : null;
    return `<div class="tabs">${tabs.map(x => `<button data-a="squadSort" data-v="${x[0]}" class="${ui.squadSort === x[0] ? 'on' : ''}">${x[1]}</button>`).join('')}</div>
      <div class="tabs">${filters.map(x => `<button data-a="squadFilter" data-v="${x[0]}" class="${ui.squadFilter === x[0] ? 'on' : ''}">${x[1]}</button>`).join('')}</div>
      <div class="panel"><h3>Kadro (${c.players.length}) <span class="small muted">${U.money(wage)}/hf${L && L.foreign ? ` · Yabancı ${foreign}/${L.foreign}` : ''}</span></h3>
      <ul class="list"><li class="hdr"><span style="width:34px"></span><span class="grow">Oyuncu</span><span class="num">Yaş</span><span class="num w">Güç</span><span style="width:42px" class="center">Knd</span></li>
      ${ps.map(p => `<li class="tap" data-a="player" data-id="${p.id}">${posB(p.pos)}
        <div class="grow ellipsis">${xi.has(p.id) ? '<b>' : ''}${esc(p.n)}${xi.has(p.id) ? '</b>' : ''}${subs.has(p.id) ? ' <span class="muted small">(Y)</span>' : ''}${statusIcons(p)}<div class="small muted">${flag(p.nat)} ${P.sec && p.sec.length ? p.sec.map(x => P.POS_TR[x]).join('/') : ''}</div></div>
        <span class="num">${age(p)}</span>${ovrB(p)}${condBar(p.cond)}</li>`).join('')}
      </ul></div>
      <div class="small muted center">Kalın: ilk 11 · (Y): yedek · 🤕 sakat · 🟥 cezalı · 🌍 milli takımda · 💲 satılık · 📝 sözleşme bitiyor · <span class="gen">·</span> kurgusal oyuncu</div>`;
  };

  // ---------- Oyuncu kartı ----------
  function playerSheet(id) {
    const s = S(), p = s.players[id];
    if (!p) return closeModal();
    const c = club();
    const own = c && p.club === c.id;
    const pc = p.club != null ? s.clubs[p.club] : null;
    const lvl = M.known(p);
    const val = P.valueOf(p);
    const st = seasonStats(p);
    const avg = st[4] ? (st[3] / st[4]).toFixed(2) : '-';
    const status = p.inj > 0 ? `<span class="bad">Sakat: ${esc(p.injN)} (~${Math.max(1, Math.round(p.inj / 7))} hf)</span>` :
      Object.values(p.sus).some(v => v > 0) ? '<span class="bad">Cezalı</span>' : p.away && p.away >= s.day ? '<span class="warn">Milli takımda</span>' : '<span class="good">Hazır</span>';
    const grp = P.ATTR_GROUPS.filter(g => p.pos === 'GK' ? true : g[0] !== 'Kaleci').map(([gn, keys]) => {
      if (p.pos === 'GK' && gn === 'Teknik') keys = ['pas', 'kaf', 'tek'];
      return `<div class="agrp"><div class="small muted">${gn}</div>${keys.map(k => {
        const f = M.fuzz(p, p.a[k], k);
        return `<div class="attr"><span>${P.ATTR_TR[k]}</span><b class="${f ? 'fz' : attrCls(p.a[k])}">${f ? f[0] + '-' + f[1] : p.a[k]}</b></div>`;
      }).join('')}</div>`;
    }).join('');
    const o = ovrTxt(p);
    const potTxt = lvl >= 2 ? `<span class="stars">${stars((p.pa - 45) / 10)}</span>` : '<span class="muted">?</span>';
    let actions = '';
    if (own && p.loan) {
      actions = `<div class="panel mt"><h3>Kiralık oyuncu</h3><div class="body small">${esc(s.clubs[p.loan.from] ? s.clubs[p.loan.from].n : '')} kulübünden sezon sonuna kadar kiralık. Satılamaz ve sözleşmesi uzatılamaz.
        <label class="field"><span>Bireysel antrenman odağı</span><select class="inp" data-ch="pTrain" data-id="${p.id}">${Object.keys(M.IND_FOCUS).map(k => `<option value="${k}" ${p.tf === k || (!p.tf && !k) ? 'selected' : ''}>${M.IND_FOCUS[k]}</option>`).join('')}</select></label></div></div>`;
    } else if (own) {
      const dem = M.renewDemand(p);
      actions = `<div class="panel mt"><h3>İşlemler</h3><div class="body">
        <button class="btn block" data-a="toggleList" data-id="${p.id}">${p.listed ? 'Satış listesinden çıkar' : 'Satış listesine koy'}</button>
        <button class="btn block mt" data-a="toggleLoan" data-id="${p.id}">${p.loanListed ? 'Kiralık listesinden çıkar' : 'Kiralık listesine koy'}</button>
        ${S().pending && S().pending.pid === p.id && S().pending.kind === 'renew' && UI.negPanel ? UI.negPanel(p) : `<div class="mt small muted">Sözleşme yenileme talebi: yaklaşık <b class="acc">${U.money(dem)}</b>/hafta</div>
        <button class="btn block" data-a="renewStart" data-id="${p.id}">📝 Sözleşme görüşmesi başlat</button>`}
        <label class="field"><span>Bireysel antrenman odağı</span><select class="inp" data-ch="pTrain" data-id="${p.id}">${Object.keys(M.IND_FOCUS).map(k => `<option value="${k}" ${p.tf === k || (!p.tf && !k) ? 'selected' : ''}>${M.IND_FOCUS[k]}</option>`).join('')}</select></label>
        <button class="btn danger block mt" data-a="release" data-id="${p.id}">Sözleşmeyi feshet (tazminat ${U.money(Math.round(p.wage * 52 * Math.max(0, p.ce - s.season) * 0.5))})</button>
      </div></div>`;
    } else if (!p.ntOnly) actions = UI.bidPanel ? UI.bidPanel(p, val) : '';
    if (own && UI.talkPanel) actions = UI.talkPanel(p) + actions;
    const u = s.user;
    if (u.nat && p.nat === u.nat) {
      const n = s.nats[u.nat];
      const inSq = (n.userSquad || n.squad || []).includes(p.id);
      actions += `<div class="panel mt"><h3>${esc(n.n)} Milli Takımı</h3><div class="body"><button class="btn block ${inSq ? 'danger' : 'good'}" data-a="natToggle" data-id="${p.id}">${inSq ? 'Kadrodan çıkar' : 'Kadroya çağır'}</button></div></div>`;
    }
    const hist = (p.car || []).slice(-6).reverse().map(h => `<div class="small">${h.s}: ${esc(h.c)}${h.fee ? ' (' + U.money(h.fee) + ')' : ''}</div>`).join('');
    openModal(`<button class="close" data-a="close">✕</button>
      <h2>${esc(p.n)}</h2>
      <div class="muted">${P.POS_LONG[p.pos]}${p.sec && p.sec.length ? ' (' + p.sec.map(x => P.POS_TR[x]).join(', ') + ')' : ''} · ${age(p)} yaş · ${flag(p.nat)} ${esc(nat(p.nat).n)}</div>
      <div class="muted small">${pc ? esc(pc.n) : p.ntOnly ? 'Ligi modellenmeyen kulüp' : 'Serbest'}${p.loan && s.clubs[p.loan.from] ? ` (${esc(s.clubs[p.loan.from].n)}'dan kiralık)` : ''}${p.gen ? ' · kurgusal oyuncu' : ''}${c && c.captain === p.id ? ' · <b class="acc">Kaptan</b>' : ''}</div>
      <div class="chips mt"><button class="chip ${CM.X.inShort(p.id) ? 'on' : ''}" data-a="shortToggle" data-id="${p.id}">${CM.X.inShort(p.id) ? '★ İzleniyor' : '☆ İzleme listesine ekle'}</button><button class="chip" data-a="compare" data-id="${p.id}">⚖️ Karşılaştır</button></div>
      <div class="row mt"><span class="ovr big ${ovrCls(o.v)}${o.fuzzy ? ' fz' : ''}">${o.t}</span>
        <div><div class="small muted">Potansiyel</div>${potTxt}</div>
        <div class="grow right"><div class="small muted">Değer</div><b class="acc">${lvl >= 1 || own ? U.money(val) : '~' + U.money(U.roundMoney(val * (0.7 + U.seeded('v' + p.id)() * 0.6)))}</b></div></div>
      ${lvl < 2 && !own ? `<div class="panel mt"><div class="body small">Bu oyuncu hakkında bilginiz sınırlı; özellikler tahmini aralık olarak gösteriliyor. <button class="btn block mt" data-a="scoutP" data-id="${p.id}">🔍 Gözlemci gönder (1 hafta)</button></div></div>` : ''}
      <div class="panel mt"><h3>Özellikler</h3><div class="body attrs">${grp}</div></div>
      <div class="panel"><h3>Bilgiler</h3><div class="body"><div class="kv">
        <span>Durum</span><span>${status}</span>
        <span>Kondisyon</span><span>${Math.round(p.cond)}%</span>
        <span>Moral</span><span>${moraleTxt(p.mor)}${p.wantsOut ? ' · <b class="bad">Transfer istiyor</b>' : ''}${p.promise ? ' · <span class="warn">Süre sözü verildi</span>' : ''}</span>
        <span>Kişilik</span><span>${lvl >= 1 || own ? `<b>${CM.X.PERS[CM.X.pers(p)].n}</b> <span class="small muted">${CM.X.PERS[CM.X.pers(p)].d}</span>` : '?'}</span>
        <span>Maaş</span><span>${lvl >= 1 || own ? U.money(p.wage) + '/hafta' : '?'}</span>
        <span>Sözleşme</span><span>${p.club == null ? '-' : 'Haziran ' + (p.ce + 1)}${p.clause && (lvl >= 1 || own) ? ` · Serbest kalma bedeli ${U.money(p.clause)}` : ''}${p.gb && own ? ` · Gol primi ${U.money(p.gb)}` : ''}</span>
        <span>Bu sezon</span><span>${st[0]} maç · ${st[1]} gol · ${st[2]} asist · Ort. ${avg}</span>
        <span>Milli</span><span>${p.ntCaps} maç · ${p.ntGoals} gol</span>
        ${p.listed ? '<span>Transfer</span><span class="warn">Satış listesinde</span>' : ''}
      </div>${(p.aw || []).length ? `<div class="mt small">${p.aw.slice(-8).reverse().map(x => '🏅 ' + esc(x)).join('<br>')}</div>` : ''}${hist ? '<div class="mt">' + hist + '</div>' : ''}</div></div>${actions}`, true);
  }
  UI.playerSheet = playerSheet;

  // ---------- Taktik ----------
  // Saha koordinatları
  const ROLE_Y = { GK: 92, CB: 75, LB: 71, RB: 71, DM: 60, CM: 50, LM: 47, RM: 47, AM: 33, LW: 22, RW: 22, ST: 11 };
  const ROLE_X = { LB: 12, RB: 88, LM: 10, RM: 90, LW: 14, RW: 86 };
  function pitchXY(slots) {
    const groups = {};
    slots.forEach((s, i) => { (groups[s] = groups[s] || []).push(i); });
    const xy = [];
    for (const r in groups) {
      const idx = groups[r], n = idx.length;
      idx.forEach((i, k) => {
        let x = ROLE_X[r] != null ? ROLE_X[r] : 50;
        if (ROLE_X[r] == null && n > 1) x = n === 2 ? (k === 0 ? 36 : 64) : 22 + k * (56 / (n - 1));
        xy[i] = [x, ROLE_Y[r]];
      });
    }
    return xy;
  }
  function tacticsHtml(team, isNat) {
    const tac = team.tactic;
    const slots = E.FORMATIONS[tac.form] || E.FORMATIONS['4-4-2'];
    const Pl = S().players;
    const key = isNat ? 'nat' : 'club';
    const chips = (obj, k) => Object.keys(obj).map(v => `<button class="chip ${tac[k] === v ? 'on' : ''}" data-a="tacSet" data-k="${k}" data-v="${v}" data-t="${key}">${obj[v].n}</button>`).join('');
    const xy = pitchXY(slots);
    const dots = slots.map((s, i) => {
      const p = Pl[tac.xi[i]];
      const bad = p && (p.inj > 0 || P.familiarity(p, s) < 1);
      return `<div class="pl" style="left:${xy[i][0]}%;top:${xy[i][1]}%" data-a="slot" data-i="${i}" data-t="${key}">
        <div class="dot" style="background:${p ? (bad ? 'var(--bad)' : 'var(--accent)') : '#666'}">${p ? Math.round(P.slotRating(p, s) * 5) : '?'}</div>
        <div class="nm">${p ? esc(E.sur(p)) : P.POS_TR[s]}</div></div>`;
    }).join('');
    const xiRows = slots.map((s, i) => {
      const p = Pl[tac.xi[i]];
      return `<li class="tap" data-a="slot" data-i="${i}" data-t="${key}">${posB(s, p && P.familiarity(p, s) < 1)}
        <div class="grow ellipsis">${p ? esc(p.n) + statusIcons(p) : '<span class="bad">Boş</span>'}</div>
        ${p ? `<span class="small muted">${P.POS_TR[p.pos]}</span><span class="ovr ${ovrCls(P.slotRating(p, s) * 5)}">${Math.round(P.slotRating(p, s) * 5)}</span>${condBar(p.cond)}` : ''}</li>`;
    }).join('');
    const subRows = [...Array(9).keys()].map(i => {
      const p = Pl[tac.subs[i]];
      return `<li class="tap" data-a="bench" data-i="${i}" data-t="${key}"><span class="pos Y">Y${i + 1}</span>
        <div class="grow ellipsis">${p ? esc(p.n) + statusIcons(p) : '<span class="muted">Boş</span>'}</div>
        ${p ? `${posB(p.pos)}<span class="ovr ${ovrCls(P.ovr(p))}">${P.ovr(p)}</span>${condBar(p.cond)}` : ''}</li>`;
    }).join('');
    const pkOpts = tac.xi.map(id => Pl[id]).filter(Boolean).sort((a, b) => b.a.bit - a.a.bit);
    return `<div class="panel"><h3>Diziliş</h3><div class="body"><div class="chips">${Object.keys(E.FORMATIONS).map(f => `<button class="chip ${tac.form === f ? 'on' : ''}" data-a="formation" data-v="${f}" data-t="${key}">${f}</button>`).join('')}</div></div></div>
      <div class="pitch">${dots}</div>
      <div class="panel"><h3>Oyun Anlayışı</h3><div class="body">
        <div class="small muted">Mentalite</div><div class="chips">${chips(E.MENT, 'ment')}</div>
        <div class="small muted mt">Pas stili</div><div class="chips">${chips(E.PASS, 'pass')}</div>
        <div class="small muted mt">Pres</div><div class="chips">${chips(E.PRESS, 'press')}</div>
        <div class="small muted mt">Tempo</div><div class="chips">${chips(E.TEMPO, 'tempo')}</div>
        <label class="field"><span>Penaltıcı</span><select class="inp" data-ch="pk" data-t="${key}"><option value="">Otomatik</option>${pkOpts.map(p => `<option value="${p.id}" ${tac.pk === p.id ? 'selected' : ''}>${esc(p.n)} (Bit. ${p.a.bit})</option>`).join('')}</select></label>
      </div></div>
      <div class="panel"><h3>İlk 11 <button class="chip" data-a="autoPick" data-t="${key}">Otomatik seç</button></h3><ul class="list">${xiRows}</ul></div>
      <div class="panel"><h3>Yedekler (9)</h3><ul class="list">${subRows}</ul></div>
      <div class="small muted center">Maçta 5 oyuncu değişikliği hakkınız var (3 pencerede; uzatmada +1). Kırmızı: mevki dışı veya hazır değil.</div>`;
  }
  UI.tacticsHtml = tacticsHtml;
  UI.VIEWS.tactics = function () {
    const c = club();
    if (!c) return '<div class="panel"><div class="body muted">Bir kulübü yönetmiyorsunuz.</div></div>';
    if (!c.tactic.xi.length) { const lu = CM.Sim.autoLineup(c, c.players.map(id => S().players[id]), c.tactic.form, c.cty + 'L', S().day); c.tactic.xi = lu.xi; c.tactic.subs = lu.subs; }
    return tacticsHtml(c, false);
  };

  function teamOf(key) { return key === 'nat' ? S().nats[S().user.nat] : club(); }
  function poolOf(key) {
    const s = S();
    if (key === 'nat') { const n = teamOf(key); const list = n.userSquad && n.userSquad.length ? n.userSquad : n.squad; return list.map(id => s.players[id]).filter(Boolean); }
    return club().players.map(id => s.players[id]).filter(Boolean);
  }
  UI.teamOf = teamOf; UI.poolOf = poolOf;
  function chooseSheet(kind, i, key) {
    const team = teamOf(key), tac = team.tactic;
    const slots = E.FORMATIONS[tac.form];
    const slot = kind === 'xi' ? slots[i] : null;
    const ps = poolOf(key).slice();
    const score = p => slot ? P.slotRating(p, slot) : P.roleRating(p, p.pos);
    ps.sort((a, b) => ((b.inj <= 0) - (a.inj <= 0)) || score(b) - score(a));
    const where = p => tac.xi.includes(p.id) ? 'İlk 11' : tac.subs.includes(p.id) ? 'Yedek' : '';
    openModal(`<button class="close" data-a="close">✕</button>
      <h2>${kind === 'xi' ? P.POS_LONG[slot] + ' seçin' : 'Yedek seçin'}</h2>
      <div class="muted small">Gösterilen güç, oyuncunun bu mevkide oynadığında vereceği verimdir.</div>
      <ul class="list mt">${kind === 'bench' ? `<li class="tap" data-a="assign" data-k="bench" data-i="${i}" data-id="-1" data-t="${key}"><span class="grow muted">— Boş bırak —</span></li>` : ''}
      ${ps.map(p => `<li class="tap" data-a="assign" data-k="${kind}" data-i="${i}" data-id="${p.id}" data-t="${key}">${posB(p.pos, slot && P.familiarity(p, slot) < 1)}
        <div class="grow ellipsis">${esc(p.n)}${statusIcons(p)} <span class="small muted">${where(p)}</span></div>
        <span class="ovr ${ovrCls(score(p) * 5)}">${Math.round(score(p) * 5)}</span>${condBar(p.cond)}</li>`).join('')}</ul>`);
  }
  function assign(kind, i, id, key) {
    const tac = teamOf(key).tactic;
    const xi = tac.xi, subs = tac.subs;
    if (kind === 'xi') {
      const cur = xi[i];
      const j = xi.indexOf(id), k = subs.indexOf(id);
      if (j >= 0) { xi[j] = cur; xi[i] = id; }
      else if (k >= 0) { if (cur != null) subs[k] = cur; else subs.splice(k, 1); xi[i] = id; }
      else xi[i] = id;
    } else {
      const cur = subs[i];
      if (id === -1) subs.splice(i, 1);
      else {
        const j = xi.indexOf(id), k = subs.indexOf(id);
        if (j >= 0) { if (cur == null) { toast('İlk 11 oyuncusunu boş yedek yerine alamazsınız.'); return; } xi[j] = cur; subs[i] = id; }
        else if (k >= 0) { subs[k] = cur; subs[i] = id; }
        else { if (i >= subs.length) subs.push(id); else subs[i] = id; }
      }
    }
    tac.subs = subs.filter(x => x != null).slice(0, 9);
  }

  // ---------- Eylemler ----------
  Object.assign(A, {
    nav(d) { ui.view = d.v; render(); window.scrollTo(0, 0); },
    close() { closeModal(); },
    startNew() { ui.start.step = 'club'; renderStart(); },
    startBack() { ui.start.step = 'menu'; CM.Save.meta().then(renderStart); },
    stLg(d) { ui.start.lg = d.v; ui.start.name = (document.getElementById('mgrName') || {}).value || ui.start.name; renderStart(); },
    pickClub(d) {
      const st = ui.start;
      st.name = ((document.getElementById('mgrName') || {}).value || '').trim() || 'Menajer';
      const c = CM.DB.clubs.find(x => x.id === d.id);
      openModal(`<h2>${esc(c.n)}</h2><div class="stars">${repStars(c.rep)}</div>
        <p>${esc(CM.LEAGUES[c.lg].n)} kulübü ${esc(c.n)}'ın teknik direktörü olmak istiyor musunuz?${st.nat ? `<br>Ayrıca <b>${esc(nat(st.nat).n)}</b> milli takımını yöneteceksiniz.` : ''}</p>
        <p class="warn small">Varsa mevcut kariyeriniz silinecek.</p>
        <div class="btns"><button class="btn" data-a="close">Vazgeç</button><button class="btn primary" data-a="confirmClub" data-id="${esc(c.id)}">Sözleşme İmzala</button></div>`);
    },
    confirmClub(d) {
      closeModal();
      busy(true, 'Dünya oluşturuluyor: 743 kulüp, 20.000 oyuncu, tüm turnuvalar...');
      setTimeout(() => {
        try {
          CM.Game.newGame({ name: ui.start.name, club: d.id, nat: ui.start.nat || null });
          try { localStorage.setItem('cm_mgr', ui.start.name); } catch (e) { /* yok */ }
          ui.view = 'inbox';
          CM.Save.save();
        } catch (e) { console.error(e); toast('Hata: ' + e.message); }
        busy(false); render();
      }, 30);
    },
    loadGame() {
      busy(true, 'Kariyer yükleniyor...');
      CM.Save.load().then(s => { busy(false); if (s) { ui.view = 'inbox'; render(); } else toast('Kayıt bulunamadı.'); })
        .catch(e => { busy(false); console.error(e); toast('Kayıt yüklenemedi.'); });
    },
    msg(d) { const id = +d.id; const m = S().news.find(x => x.id === id); if (m) { m.read = true; ui.openMsg = ui.openMsg === id ? null : id; render(); } },
    readAll() { S().news.forEach(m => { m.read = true; }); render(); },
    offer(d) { const r = M.answerOffer(+d.id, d.acc === '1'); toast(r.text); render(); CM.Save.save(); },
    takeJob(d) { M.takeJob(+d.id); render(); CM.Save.save(); },
    squadSort(d) { ui.squadSort = d.v; render(); },
    squadFilter(d) { ui.squadFilter = d.v; render(); },
    player(d) { ui.bid = null; playerSheet(+d.id); },
    toggleLoan(d) { const l = M.toggleLoanList(+d.id); toast(l ? 'Oyuncu kiralık listesine eklendi; transfer döneminde teklifler gelebilir.' : 'Oyuncu kiralık listesinden çıkarıldı.'); playerSheet(+d.id); render(); },
    toggleList(d) { const l = M.toggleList(+d.id); toast(l ? 'Oyuncu satış listesine eklendi.' : 'Oyuncu listeden çıkarıldı.'); playerSheet(+d.id); render(); },
    renew(d) { const r = M.renew(+d.id, +d.y); toast(r.ok ? 'Sözleşme yenilendi.' : r.text); playerSheet(+d.id); render(); },
    release(d) {
      const p = S().players[+d.id];
      openModal(`<h2>Sözleşme Feshi</h2><p>${esc(p.n)} ile sözleşmeyi feshetmek istediğinize emin misiniz?</p>
        <div class="btns"><button class="btn" data-a="player" data-id="${p.id}">Vazgeç</button><button class="btn danger" data-a="confirmRelease" data-id="${p.id}">Feshet</button></div>`);
    },
    confirmRelease(d) { const r = M.release(+d.id); if (r.ok) { closeModal(); toast('Sözleşme feshedildi.'); render(); } else toast(r.text); },
    scoutP(d) { const p = S().players[+d.id]; const r = M.scout('p', p.id, p.n); toast(r.text); },
    natToggle(d) {
      const s = S(), n = s.nats[s.user.nat], id = +d.id;
      n.userSquad = (n.userSquad && n.userSquad.length ? n.userSquad : n.squad.slice());
      if (n.userSquad.includes(id)) n.userSquad = n.userSquad.filter(x => x !== id);
      else if (n.userSquad.length >= 26) { toast('Kadro en fazla 26 oyuncu olabilir.'); return; }
      else n.userSquad.push(id);
      playerSheet(id); render();
    },
    formation(d) { const t = teamOf(d.t); t.tactic.form = d.v; const lu = CM.Sim.autoLineup(t, poolOf(d.t), d.v, d.t === 'nat' ? 'NT' : t.cty + 'L', S().day, d.t === 'nat'); t.tactic.xi = lu.xi; t.tactic.subs = lu.subs; render(); },
    tacSet(d) { teamOf(d.t).tactic[d.k] = d.v; render(); },
    autoPick(d) { const t = teamOf(d.t); const lu = CM.Sim.autoLineup(t, poolOf(d.t), t.tactic.form, d.t === 'nat' ? 'NT' : t.cty + 'L', S().day, d.t === 'nat'); t.tactic.xi = lu.xi; t.tactic.subs = lu.subs; render(); toast('En iyi 11 seçildi.'); },
    slot(d) { chooseSheet('xi', +d.i, d.t); },
    bench(d) { chooseSheet('bench', +d.i, d.t); },
    assign(d) { assign(d.k, +d.i, +d.id, d.t); closeModal(); render(); }
  });
  UI.CH = {
    stCty(v) { ui.start.cty = v; ui.start.lg = CM.COUNTRIES[v].leagues[0]; ui.start.name = (document.getElementById('mgrName') || {}).value || ui.start.name; renderStart(); },
    stNat(v) { ui.start.nat = v; ui.start.name = (document.getElementById('mgrName') || {}).value || ui.start.name; },
    pk(v, el) { teamOf(el.dataset.t).tactic.pk = v ? +v : null; },
    pTrain(v, el) { const p = S().players[+el.dataset.id]; p.tf = v || null; toast('Bireysel antrenman odağı güncellendi.'); }
  };
})(typeof window !== 'undefined' ? window : globalThis);
