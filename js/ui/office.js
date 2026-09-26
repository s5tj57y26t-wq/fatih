/* Arayüz: transfer merkezi, teklif paneli, kulüp (yönetim, finans, antrenman, gözlem), milli takım */
(function (G) {
  'use strict';
  const CM = G.CM, U = CM.U, P = CM.P, M = CM.Market, UI = CM.UI, A = UI.A, ui = UI.ui, h = UI.h, esc = U.esc;
  const S = () => CM.S;

  // ---------- Transfer merkezi ----------
  const POS_F = [['ALL', 'Tümü'], ['GK', 'KL'], ['D', 'Defans'], ['M', 'Orta saha'], ['F', 'Forvet']];
  function searchPlayers() {
    const s = S(), f = ui.tr, me = s.user.club;
    const q = f.q.trim().toLocaleLowerCase('tr');
    const out = [];
    for (const id in s.players) {
      const p = s.players[id];
      if (p.ntOnly || p.club === me) continue;
      if (f.free && p.club != null) continue;
      if (f.listed && !p.listed) continue;
      if (f.pos !== 'ALL' && (f.pos === 'GK' ? p.pos !== 'GK' : P.LINE[p.pos] !== f.pos || p.pos === 'GK')) continue;
      if (h.age(p) > f.maxAge) continue;
      const c = p.club != null ? s.clubs[p.club] : null;
      if (f.lg && (!c || c.lg !== f.lg)) continue;
      if (f.nat && p.nat !== f.nat) continue;
      if (f.knownOnly && M.known(p) < 2) continue;
      if (q && !p.n.toLocaleLowerCase('tr').includes(q) && !(c && c.n.toLocaleLowerCase('tr').includes(q))) continue;
      if (f.maxVal && P.valueOf(p) > f.maxVal * 1e6) continue;
      out.push(p);
    }
    out.sort((a, b) => h.ovrTxt(b).v - h.ovrTxt(a).v);
    return out;
  }
  function trRow(p) {
    const s = S(), c = p.club != null ? s.clubs[p.club] : null;
    return `<li class="tap" data-a="player" data-id="${p.id}">${h.posB(p.pos)}<div class="grow ellipsis">${esc(p.n)}${h.statusIcons(p)}
      <div class="small muted ellipsis">${h.flag(p.nat)} ${c ? esc(c.n) : '<span class="good">Serbest</span>'}</div></div>
      <span class="num">${h.age(p)}</span>${h.ovrB(p)}<span class="num x small">${M.known(p) >= 1 ? U.money(P.valueOf(p)) : '?'}</span></li>`;
  }
  function trList() {
    const list = searchPlayers();
    return `<li class="hdr"><span style="width:30px"></span><span class="grow">${list.length} oyuncu${list.length > 80 ? ' (ilk 80)' : ''}</span><span class="num">Yaş</span><span class="num w">Güç</span><span class="num x">Değer</span></li>` +
      (list.slice(0, 80).map(trRow).join('') || '<li class="muted">Sonuç yok.</li>');
  }
  UI.trList = trList;
  UI.VIEWS.transfer = function () {
    const s = S(), c = h.club(), f = ui.tr;
    if (!c) return '<div class="panel"><div class="body muted">Bir kulübü yönetmiyorsunuz.</div></div>';
    const open = M.isWindow(s.day);
    const lgs = Object.keys(CM.LEAGUES);
    const mine = c.players.map(id => s.players[id]).filter(p => p && p.listed);
    const offers = s.offers.filter(o => s.players[o.pid] && s.players[o.pid].club === c.id);
    return `<div class="panel"><div class="body small">${open ? '<span class="good">● Transfer dönemi açık</span>' : '<span class="warn">● Transfer dönemi kapalı</span> — yalnızca serbest oyuncularla anlaşabilirsiniz.'}
        · Bütçe <b class="acc">${U.money(c.money)}</b> · Kadro ${c.players.length}/${M.MAX_SQUAD}</div></div>
      ${offers.length ? `<div class="panel"><h3>Gelen teklifler</h3><ul class="list">${offers.map(o => `<li>${esc(s.players[o.pid].n)} <span class="grow small muted">${esc(s.clubs[o.from].n)} · ${U.money(o.amount)}</span>
        <button class="btn good" data-a="offer" data-id="${o.id}" data-acc="1">✓</button><button class="btn danger" data-a="offer" data-id="${o.id}" data-acc="0">✕</button></li>`).join('')}</ul></div>` : ''}
      ${mine.length ? `<div class="panel"><h3>Satış listemdekiler</h3><ul class="list">${mine.map(p => `<li class="tap" data-a="player" data-id="${p.id}">${h.posB(p.pos)}<span class="grow ellipsis">${esc(p.n)}</span>${h.ovrB(p)}<span class="num x small">${U.money(P.valueOf(p))}</span></li>`).join('')}</ul></div>` : ''}
      <div class="panel"><h3>Oyuncu ara</h3><div class="body">
        <input class="inp" data-in="trQ" placeholder="Oyuncu veya kulüp adı..." value="${esc(f.q)}">
        <div class="chips mt">${POS_F.map(x => `<button class="chip ${f.pos === x[0] ? 'on' : ''}" data-a="trPos" data-v="${x[0]}">${x[1]}</button>`).join('')}</div>
        <div class="row mt">
          <select class="inp" data-ch="trLg"><option value="">Tüm ligler</option>${lgs.map(l => `<option value="${l}" ${f.lg === l ? 'selected' : ''}>${esc(CM.LEAGUES[l].n)}</option>`).join('')}</select>
          <select class="inp" data-ch="trNat"><option value="">Tüm uyruklar</option>${Object.keys(CM.DB.nations).sort((a, b) => h.nat(a).n.localeCompare(h.nat(b).n, 'tr')).map(k => `<option value="${k}" ${f.nat === k ? 'selected' : ''}>${esc(h.nat(k).n)}</option>`).join('')}</select>
        </div>
        <div class="row mt">
          <select class="inp" data-ch="trAge">${[40, 30, 27, 24, 21, 19].map(a => `<option value="${a}" ${f.maxAge === a ? 'selected' : ''}>${a === 40 ? 'Her yaş' : a + ' yaş ve altı'}</option>`).join('')}</select>
          <select class="inp" data-ch="trVal">${[0, 1, 3, 5, 10, 20, 40, 80].map(v => `<option value="${v}" ${f.maxVal === v ? 'selected' : ''}>${v ? 'En fazla ' + U.money(v * 1e6) : 'Her değer'}</option>`).join('')}</select>
        </div>
        <div class="chips mt">
          <button class="chip ${f.free ? 'on' : ''}" data-a="trFlag" data-v="free">Serbest</button>
          <button class="chip ${f.listed ? 'on' : ''}" data-a="trFlag" data-v="listed">Satılık</button>
          <button class="chip ${f.knownOnly ? 'on' : ''}" data-a="trFlag" data-v="knownOnly">Gözlemlenmiş</button>
        </div></div>
        <ul class="list" id="trList">${trList()}</ul></div>
      <div class="small muted center">Aralıklı güç değerleri (ör. 68-74) gözlemlenmemiş oyuncular içindir. Kulüp ekranından lig veya ülke gözlemi başlatabilirsiniz.</div>`;
  };

  // Oyuncu kartındaki teklif paneli
  UI.bidPanel = function (p, val) {
    const s = S(), c = h.club();
    if (!c) return '';
    const b = ui.bid && ui.bid.pid === p.id ? ui.bid : (ui.bid = { pid: p.id, fee: p.club == null ? 0 : U.roundMoney(val), res: null });
    const r = b.res;
    let inner = '';
    if (r && r.stage === 'contract' && s.pending && s.pending.pid === p.id) {
      inner = `<div class="good">${esc(r.text)}</div><div class="small muted mt">Sözleşme süresi seçin:</div>
        <div class="slider-row">${[1, 2, 3, 4, 5].map(y => `<button class="chip" data-a="sign" data-y="${y}">${y} yıl</button>`).join('')}</div>
        <button class="btn block" data-a="bidCancel">Vazgeç</button>`;
    } else if (p.club == null) {
      inner = `<div class="small">Serbest oyuncu: bonservis ödenmez.</div>${r ? `<div class="bad mt">${esc(r.text)}</div>` : ''}<button class="btn primary block mt" data-a="bid" data-id="${p.id}">Sözleşme teklif et</button>`;
    } else {
      const presets = [0.7, 0.9, 1, 1.2, 1.5, 2].map(k => U.roundMoney(val * k));
      inner = `<div class="row"><span class="grow">Teklif: <b class="acc">${U.money(b.fee)}</b></span>
          <button class="btn" data-a="bidAdj" data-k="0.9">−</button><button class="btn" data-a="bidAdj" data-k="1.1">+</button></div>
        <div class="slider-row">${presets.map(v => `<button class="chip ${b.fee === v ? 'on' : ''}" data-a="bidSet" data-v="${v}">${U.money(v)}</button>`).join('')}</div>
        ${r ? `<div class="${r.ok ? 'good' : 'bad'} mt">${esc(r.text)}</div>${r.counter ? `<button class="btn block mt" data-a="bidSet" data-v="${r.counter}" data-go="1">${U.money(r.counter)} teklif et</button>` : ''}` : ''}
        <button class="btn primary block mt" data-a="bid" data-id="${p.id}">Teklif yap</button>
        <div class="small muted mt">Bütçeniz: ${U.money(c.money)}${M.isWindow(s.day) ? '' : ' · Transfer dönemi kapalı'}</div>`;
    }
    return `<div class="panel mt"><h3>Transfer</h3><div class="body">${inner}</div></div>`;
  };

  // ---------- Kulüp ----------
  function bar(v, cls) { return `<span class="bar wide"><i style="width:${Math.round(v)}%;background:${cls}"></i></span>`; }
  UI.VIEWS.club = function () {
    const s = S(), u = s.user, c = h.club();
    const tabs = [['office', 'Yönetim'], ['train', 'Antrenman'], ['scout', 'Gözlem'], ['fin', 'Finans'], ['career', 'Kariyer']];
    if (u.nat) tabs.splice(4, 0, ['nt', 'Milli Takım']);
    const tab = ui.clubTab || (c ? 'office' : 'career');
    if (tab === 'nt') { ui.view = 'national'; return UI.VIEWS.national(); }
    let body = '';
    if (!c && tab !== 'career') body = '<div class="panel"><div class="body muted">Bir kulübü yönetmiyorsunuz.</div></div>';
    else if (tab === 'office') {
      const conf = u.conf;
      const lc = s.comps[`${c.lg}-${s.season}`];
      const pos = lc ? C_st(lc).indexOf(c.id) + 1 : 0;
      body = `<div class="panel"><h3>${esc(c.n)}</h3><div class="body"><div class="kv">
          <span>Lig</span><span>${c.lg ? esc(CM.LEAGUES[c.lg].n) + (pos ? ` (${pos}.)` : '') : '-'}</span>
          <span>İtibar</span><span class="stars">${h.repStars(c.rep)}</span>
          <span>Stadyum</span><span>${esc(c.st || '-')} (${(c.cap || 0).toLocaleString('tr-TR')})</span>
          <span>Altyapı</span><span class="stars">${h.stars(c.youth)}</span>
          <span>Gözlemci</span><span>${c.scouts}</span>
          <span>UEFA puanı</span><span>${CM.UEFA.coefTotal(s.clubCoef[c.id]).toFixed(2)}</span></div></div></div>
        <div class="panel"><h3>Yönetim kurulu</h3><div class="body">
          <div class="small muted">Sezon hedefi</div><div><b>${esc(u.exp ? u.exp.text : '-')}</b></div>
          <div class="small muted mt">Güven: ${conf >= 75 ? 'Çok memnun' : conf >= 55 ? 'Memnun' : conf >= 35 ? 'Kararsız' : conf >= 15 ? 'Endişeli' : 'Görevden alma eşiğinde'}</div>
          ${bar(conf, conf >= 55 ? 'var(--good)' : conf >= 30 ? 'var(--warn)' : 'var(--bad)')}</div></div>
        ${(c.trophies || []).length ? `<div class="panel"><h3>Kupalar (oyun içi)</h3><div class="body small">${c.trophies.slice().reverse().map(x => `🏆 ${x.s}/${String(x.s + 1).slice(2)} ${esc(x.n)}`).join('<br>')}</div></div>` : ''}
        ${(c.hist || []).length ? `<div class="panel"><h3>Lig geçmişi</h3><table class="tbl"><tr><th>Sezon</th><th class="t">Lig</th><th>Sıra</th><th>P</th></tr>${c.hist.slice().reverse().map(x => `<tr><td>${x.s}/${String(x.s + 1).slice(2)}</td><td class="t">${esc(CM.LEAGUES[x.lg].n)}</td><td>${x.pos}</td><td>${x.pts}</td></tr>`).join('')}</table></div>` : ''}
        <button class="btn block" data-a="team" data-id="${c.id}">Kulüp kartı</button>`;
    } else if (tab === 'train') {
      const tr = c.train || (c.train = { focus: 'genel', int: 'normal' });
      const ps = c.players.map(id => s.players[id]).filter(Boolean).filter(p => p.tf);
      body = `<div class="panel"><h3>Takım antrenmanı</h3><div class="body">
          <div class="small muted">Odak</div><div class="chips">${Object.keys(M.TRAIN_FOCUS).map(k => `<button class="chip ${tr.focus === k ? 'on' : ''}" data-a="train" data-k="focus" data-v="${k}">${M.TRAIN_FOCUS[k].n}</button>`).join('')}</div>
          <div class="small muted mt">Yoğunluk</div><div class="chips">${Object.keys(M.TRAIN_INT).map(k => `<button class="chip ${tr.int === k ? 'on' : ''}" data-a="train" data-k="int" data-v="${k}">${M.TRAIN_INT[k].n}</button>`).join('')}</div>
          <div class="small muted mt">Yüksek yoğunluk gelişimi hızlandırır ancak kondisyonu düşürür ve sakatlık riskini artırır. Taktik odak maçlarda küçük bir takım uyumu bonusu verir.
          Odaklanılan özellikler daha hızlı gelişir. Gelişim; yaş, potansiyel ve süre almaya bağlıdır.</div></div></div>
        <div class="panel"><h3>Bireysel antrenman</h3><ul class="list">${ps.length ? ps.map(p => `<li class="tap" data-a="player" data-id="${p.id}">${h.posB(p.pos)}<span class="grow ellipsis">${esc(p.n)}</span><span class="small acc">${M.IND_FOCUS[p.tf]}</span></li>`).join('') : '<li class="muted small">Oyuncu kartından bireysel odak belirleyebilirsiniz.</li>'}</ul></div>`;
    } else if (tab === 'scout') {
      const lgs = Object.keys(CM.LEAGUES).filter(l => l !== c.lg);
      body = `<div class="panel"><h3>Gözlem ekibi (${s.scoutTasks.length}/${c.scouts} görevde)</h3><ul class="list">${s.scoutTasks.map(t => `<li><span class="grow">${esc(t.label)}</span><span class="small muted">${Math.max(1, Math.ceil(t.left / 7))} hf kaldı</span></li>`).join('') || '<li class="muted small">Aktif görev yok.</li>'}</ul></div>
        <div class="panel"><h3>Lig gözlemi (4 hafta)</h3><div class="body"><div class="row"><select class="inp" id="scLg">${lgs.map(l => `<option value="${l}">${esc(CM.LEAGUES[l].n)}</option>`).join('')}</select><button class="btn" data-a="scoutL">Gönder</button></div></div></div>
        <div class="panel"><h3>Ülke gözlemi (4 hafta)</h3><div class="body"><div class="row"><select class="inp" id="scNat">${Object.keys(CM.DB.nations).sort((a, b) => h.nat(a).n.localeCompare(h.nat(b).n, 'tr')).map(k => `<option value="${k}">${esc(h.nat(k).n)}</option>`).join('')}</select><button class="btn" data-a="scoutN">Gönder</button></div>
          <div class="small muted mt">Ülke gözlemi, o ülke vatandaşı tüm oyuncuların (yurt dışında oynayanlar dahil) raporunu çıkarır. Tek oyuncu gözlemi oyuncu kartından yapılır (1 hafta).</div></div></div>`;
    } else if (tab === 'fin') {
      const F = c.fin, wages = c.players.reduce((t, id) => t + (s.players[id] ? s.players[id].wage : 0), 0);
      body = `<div class="panel"><h3>Mali durum</h3><div class="body"><div class="kv">
          <span>Bakiye</span><span class="${c.money < 0 ? 'bad' : 'acc'}"><b>${U.money(c.money)}</b></span>
          <span>Haftalık maaş</span><span>${U.money(wages)}</span>
          <span>Haftalık gelir (TV + sponsor)</span><span>${U.money(c.weekInc || 0)}</span></div></div></div>
        <div class="panel"><h3>Bu sezon</h3><div class="body"><div class="kv">
          <span>Maç günü geliri</span><span class="good">${U.money(F.gate)}</span>
          <span>TV ve sponsorluk</span><span class="good">${U.money(F.tv)}</span>
          <span>Ödüller</span><span class="good">${U.money(F.prize)}</span>
          <span>Satılan oyuncular</span><span class="good">${U.money(F.tout)}</span>
          <span>Maaşlar</span><span class="bad">−${U.money(F.wages)}</span>
          <span>Alınan oyuncular</span><span class="bad">−${U.money(F.tin)}</span></div></div></div>`;
    }
    if (tab === 'career') {
      body += `<div class="panel"><h3>${esc(u.name)}</h3><div class="body"><div class="kv">
          <span>Kulüp</span><span>${c ? esc(c.n) : 'İşsiz'}</span>
          <span>Milli takım</span><span>${u.nat ? esc(s.nats[u.nat].n) : '-'}</span>
          <span>Kupalar</span><span>${(u.trophies || []).length}</span></div>
          ${(u.trophies || []).length ? `<div class="small mt">${u.trophies.map(t => `🏆 ${t.s}/${String(t.s + 1).slice(2)} ${esc(t.n)}`).join('<br>')}</div>` : ''}
          ${(u.history || []).length ? `<div class="small muted mt">${u.history.filter(x => x.s).map(x => `${x.s}/${String(x.s + 1).slice(2)} ${esc(x.club)} – ${esc(x.lg)} ${x.pos}.`).join('<br>')}</div>` : ''}</div></div>
        <button class="btn primary block" data-a="saveGame">💾 Kaydet</button>
        <button class="btn block mt" data-a="toMenu">Ana menü</button>
        <button class="btn danger block mt" data-a="resign">${c ? 'İstifa et' : 'Kariyeri sil'}</button>`;
    }
    return `<div class="tabs">${tabs.map(t => `<button data-a="clubTab" data-v="${t[0]}" class="${tab === t[0] ? 'on' : ''}">${t[1]}</button>`).join('')}</div>${body}`;
  };
  const C_st = lc => CM.Comp.standings(lc);

  // ---------- Milli takım ----------
  function natCandidates(code) {
    const s = S();
    return Object.values(s.players).filter(p => p.nat === code).sort((a, b) => P.ovr(b) - P.ovr(a));
  }
  UI.natCandidates = natCandidates;
  UI.VIEWS.national = function () {
    const s = S(), u = s.user;
    if (!u.nat) { ui.view = 'club'; ui.clubTab = 'office'; return UI.VIEWS.club(); }
    const n = s.nats[u.nat];
    const tabs = [['squad', 'Kadro'], ['tactics', 'Taktik'], ['fx', 'Maçlar'], ['cand', 'Aday havuzu']];
    const tab = ui.natTab;
    const sq = (n.userSquad && n.userSquad.length ? n.userSquad : n.squad).map(id => s.players[id]).filter(Boolean);
    let body = '';
    const row = (p, inSq) => `<li class="tap" data-a="player" data-id="${p.id}">${h.posB(p.pos)}<div class="grow ellipsis">${esc(p.n)}${h.statusIcons(p)}<div class="small muted ellipsis">${p.club != null ? esc(s.clubs[p.club].n) : p.ntOnly ? 'Yurt dışı / modellenmeyen kulüp' : 'Serbest'}</div></div>
      <span class="num">${h.age(p)}</span><span class="ovr ${h.ovrCls(P.ovr(p))}">${P.ovr(p)}</span>
      <button class="chip ${inSq ? 'on' : ''}" data-a="natToggle2" data-id="${p.id}">${inSq ? '✓' : '+'}</button></li>`;
    if (tab === 'squad') {
      sq.sort((a, b) => 'GDMF'.indexOf(P.LINE[a.pos]) - 'GDMF'.indexOf(P.LINE[b.pos]) || P.ovr(b) - P.ovr(a));
      body = `<div class="panel"><h3>${esc(n.n)} kadrosu (${sq.length}/26)</h3>
        <div class="body small muted">${n.userSquad && n.userSquad.length ? (n.userSquad.length < 18 ? '<span class="warn">En az 18 oyuncu seçmelisiniz; aksi halde federasyon kadroyu otomatik belirler.</span>' : 'Kadronuz milli ara öncesinde davet edilecek.') : 'Henüz kadro seçmediniz: davetler otomatik yapılır. Aday havuzundan oyuncu ekleyerek kendi kadronuzu kurun.'}</div>
        <ul class="list">${sq.map(p => row(p, true)).join('') || '<li class="muted">Kadro yok.</li>'}</ul></div>
        <div class="btns"><button class="btn" data-a="natAuto">Otomatik kadro</button><button class="btn danger" data-a="natClear">Temizle</button></div>`;
    } else if (tab === 'tactics') {
      if (!sq.length) body = '<div class="panel"><div class="body muted">Önce kadro belirleyin.</div></div>';
      else {
        if (!n.tactic.xi.length || n.tactic.xi.some(id => !sq.some(p => p.id === id))) { const lu = CM.Sim.autoLineup(n, sq, n.tactic.form, 'NT', s.day, true); n.tactic.xi = lu.xi; n.tactic.subs = lu.subs; }
        body = UI.tacticsHtml(n, true);
      }
    } else if (tab === 'fx') {
      const t = 'N:' + u.nat;
      body = `<div class="panel"><h3>Fikstür</h3><ul class="list fxl">${CM.Game.upcoming(t, 12).map(f => UI.fxRow(f, { comp: true, team: t })).join('') || '<li class="muted">Yok</li>'}</ul></div>
        <div class="panel"><h3>Sonuçlar</h3><ul class="list fxl">${CM.Game.results(t, 20).map(f => UI.fxRow(f, { comp: true, team: t })).join('') || '<li class="muted">Yok</li>'}</ul></div>`;
    } else {
      const set = new Set(sq.map(p => p.id));
      const pos = ui.natPos || 'ALL';
      const list = natCandidates(u.nat).filter(p => pos === 'ALL' || (pos === 'GK' ? p.pos === 'GK' : P.LINE[p.pos] === pos && p.pos !== 'GK')).slice(0, 80);
      body = `<div class="chips mb">${POS_F.map(x => `<button class="chip ${pos === x[0] ? 'on' : ''}" data-a="natPos" data-v="${x[0]}">${x[1]}</button>`).join('')}</div>
        <div class="panel"><h3>${esc(n.n)} vatandaşı oyuncular</h3><ul class="list">${list.map(p => row(p, set.has(p.id))).join('')}</ul></div>`;
    }
    return `<div class="row mb"><button class="btn" data-a="natBack">◀</button>${h.kit(n.c1, n.c2, 26)}<div class="grow"><b>${esc(n.n)}</b><div class="small muted">Elo ${Math.round(n.elo)} · ${CM.Intl.ranking().indexOf(u.nat) + 1}. sırada · Güven ${Math.round(u.confNT || 60)}%</div></div></div>
      <div class="tabs">${tabs.map(t => `<button data-a="natTab" data-v="${t[0]}" class="${tab === t[0] ? 'on' : ''}">${t[1]}</button>`).join('')}</div>${body}`;
  };

  // ---------- Eylemler ----------
  function refreshBid() { UI.playerSheet(ui.bid.pid); }
  Object.assign(A, {
    trPos(d) { ui.tr.pos = d.v; UI.render(); },
    trFlag(d) { ui.tr[d.v] = !ui.tr[d.v]; UI.render(); },
    bid(d) {
      const p = S().players[+d.id];
      const b = ui.bid && ui.bid.pid === p.id ? ui.bid : (ui.bid = { pid: p.id, fee: 0 });
      b.res = M.makeBid(p.id, p.club == null ? 0 : b.fee);
      refreshBid();
    },
    bidAdj(d) { const b = ui.bid; b.fee = U.roundMoney(Math.max(0, b.fee * +d.k)); b.res = null; refreshBid(); },
    bidSet(d) { const b = ui.bid; b.fee = +d.v; b.res = null; if (d.go) { b.res = M.makeBid(b.pid, b.fee); } refreshBid(); },
    bidCancel() { S().pending = null; ui.bid.res = null; refreshBid(); },
    sign(d) {
      const pid = ui.bid.pid;
      if (M.acceptContract(+d.y)) { h.toast('Transfer tamamlandı!'); ui.bid = null; h.closeModal(); UI.render(); CM.Save.save(); }
      else { h.toast('Transfer gerçekleşemedi.'); ui.bid = null; UI.playerSheet(pid); }
    },
    clubTab(d) { ui.clubTab = d.v; if (d.v === 'nt') { ui.view = 'national'; } UI.render(); },
    train(d) { const c = h.club(); c.train[d.k] = d.v; UI.render(); },
    scoutL() { const v = document.getElementById('scLg').value; const r = M.scout('l', v, CM.LEAGUES[v].n); h.toast(r.text); UI.render(); },
    scoutN() { const v = document.getElementById('scNat').value; const r = M.scout('n', v, h.nat(v).n + ' vatandaşları'); h.toast(r.text); UI.render(); },
    saveGame() { h.busy(true, 'Kaydediliyor...'); CM.Save.save().then(() => { h.busy(false); h.toast('Oyun kaydedildi.'); }).catch(e => { h.busy(false); h.toast('Kayıt başarısız: ' + e.message); }); },
    toMenu() { h.busy(true, 'Kaydediliyor...'); CM.Save.save().finally(() => { h.busy(false); CM.S = null; ui.start.step = 'menu'; CM.Save.meta().then(UI.renderStart); }); },
    resign() {
      const c = h.club();
      h.openModal(`<h2>${c ? 'İstifa' : 'Kariyeri sil'}</h2><p>${c ? `${esc(c.n)} görevinden istifa etmek istediğinize emin misiniz? Yeni iş teklifleri beklemeniz gerekecek.` : 'Kayıtlı kariyeriniz silinecek.'}</p>
        <div class="btns"><button class="btn" data-a="close">Vazgeç</button><button class="btn danger" data-a="confirmResign">Onayla</button></div>`);
    },
    confirmResign() {
      const s = S(), u = s.user, c = h.club();
      h.closeModal();
      if (c) {
        u.history.push({ club: c.n, from: u.started, to: s.day });
        u.club = null; u.sacked = true;
        CM.Game.news('İstifa', `${c.n} görevinden istifa ettiniz.`, { type: 'board' });
        M.jobOffers(c.rep - 5);
        ui.view = 'inbox'; UI.render(); CM.Save.save();
      } else { CM.Save.remove().then(() => { CM.S = null; ui.start.step = 'menu'; UI.renderStart(null); }); }
    },
    natBack() { ui.view = 'club'; ui.clubTab = 'office'; UI.render(); },
    natTab(d) { ui.natTab = d.v; UI.render(); },
    natPos(d) { ui.natPos = d.v; UI.render(); },
    natToggle2(d) {
      const s = S(), n = s.nats[s.user.nat], id = +d.id;
      n.userSquad = (n.userSquad && n.userSquad.length ? n.userSquad : n.squad.slice());
      if (n.userSquad.includes(id)) n.userSquad = n.userSquad.filter(x => x !== id);
      else if (n.userSquad.length >= 26) return h.toast('Kadro en fazla 26 oyuncu olabilir.');
      else n.userSquad.push(id);
      UI.render();
    },
    natAuto() {
      const s = S(), n = s.nats[s.user.nat];
      const c = natCandidates(s.user.nat).filter(p => p.inj <= 7);
      const want = { G: 3, D: 8, M: 8, F: 7 }, got = [];
      c.forEach(p => { const g = P.LINE[p.pos]; if (want[g] > 0) { want[g]--; got.push(p.id); } });
      c.forEach(p => { if (got.length < 26 && !got.includes(p.id)) got.push(p.id); });
      n.userSquad = got.slice(0, 26); n.tactic.xi = []; UI.render(); h.toast('Kadro otomatik oluşturuldu.');
    },
    natClear() { const n = S().nats[S().user.nat]; n.userSquad = []; n.tactic.xi = []; UI.render(); }
  });
  // Arama kutusu: yalnızca liste yenilenir (klavye kapanmasın)
  UI.IN = {
    trQ(v) { ui.tr.q = v; clearTimeout(UI.IN._t); UI.IN._t = setTimeout(() => { const el = document.getElementById('trList'); if (el) el.innerHTML = trList(); }, 200); }
  };
  Object.assign(UI.CH, {
    trLg(v) { ui.tr.lg = v; UI.render(); },
    trNat(v) { ui.tr.nat = v; UI.render(); },
    trAge(v) { ui.tr.maxAge = +v; UI.render(); },
    trVal(v) { ui.tr.maxVal = +v; UI.render(); }
  });
})(typeof window !== 'undefined' ? window : globalThis);
