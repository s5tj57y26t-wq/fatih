/* Arayüz: maçlar, turnuva tarayıcısı (lig, eleme, İsviçre sistemi, gruplar), takım kartı, maç raporu, sıralamalar */
(function (G) {
  'use strict';
  const CM = G.CM, U = CM.U, P = CM.P, C = CM.Comp, UI = CM.UI, A = UI.A, ui = UI.ui, h = UI.h, esc = U.esc;
  const S = () => CM.S;

  // ---------- Fikstür satırı ----------
  function scoreTxt(f) {
    if (f.hg === null) return 'v';
    let t = `${f.hg}-${f.ag}`;
    if (f.ph != null) t += ` <span class="small">(P ${f.ph}-${f.pa})</span>`;
    else if (f.et) t += ' <span class="small">uz.</span>';
    return t;
  }
  function resCls(f, team) {
    if (f.hg === null || team == null) return '';
    const home = f.h === team;
    let my = home ? f.hg : f.ag, op = home ? f.ag : f.hg;
    if (my === op && f.ph != null) { my = home ? f.ph : f.pa; op = home ? f.pa : f.ph; }
    return my > op ? 'win' : my === op ? 'draw' : 'loss';
  }
  function fxRow(f, o) {
    o = o || {};
    const s = S(), u = s.user;
    const me = t => t != null && (t === u.club || t === 'N:' + u.nat);
    const cc = s.comps[f.c];
    const rc = resCls(f, o.team);
    return `<li class="fx ${me(f.h) || me(f.a) ? 'me' : ''} ${f.hg !== null ? 'tap' : ''}" ${f.hg !== null ? `data-a="report" data-c="${esc(f.c)}" data-id="${f.id}"` : ''}>
      <div class="fd small muted">${h.dstr(f.d)}${o.comp && cc ? `<div class="ellipsis">${esc(cc.sh || cc.n)}</div>` : ''}</div>
      <div class="ft h ellipsis">${f.h == null ? '?' : esc(C.tName(f.h))}</div>
      <div class="fs ${rc}">${scoreTxt(f)}</div>
      <div class="ft a ellipsis">${f.a == null ? '?' : esc(C.tName(f.a))}</div></li>`;
  }
  UI.fxRow = fxRow; UI.scoreTxt = scoreTxt;

  // ---------- Maçlar ----------
  UI.VIEWS.matches = function () {
    const s = S(), u = s.user;
    const tabs = [['club', 'Kulüp']];
    if (u.nat) tabs.push(['nat', 'Milli Takım']);
    if (!u.club && ui.mTab !== 'nat') ui.mTab = u.nat ? 'nat' : 'club';
    const tab = ui.mTab || (u.club ? 'club' : 'nat');
    const team = tab === 'nat' ? 'N:' + u.nat : u.club;
    if (team == null) return '<div class="panel"><div class="body muted">Bir kulübü yönetmiyorsunuz.</div></div>';
    const up = CM.Game.upcoming(team, 20);
    const res = CM.Game.results(team, 40);
    return `${tabs.length > 1 ? `<div class="tabs">${tabs.map(t => `<button data-a="mTab" data-v="${t[0]}" class="${tab === t[0] ? 'on' : ''}">${t[1]}</button>`).join('')}</div>` : ''}
      <div class="panel"><h3>Fikstür</h3><ul class="list fxl">${up.length ? up.map(f => fxRow(f, { comp: true, team })).join('') : '<li class="muted">Planlanmış maç yok.</li>'}</ul></div>
      <div class="panel"><h3>Sonuçlar</h3><ul class="list fxl">${res.length ? res.map(f => fxRow(f, { comp: true, team })).join('') : '<li class="muted">Henüz maç oynanmadı.</li>'}</ul></div>`;
  };

  // ---------- Turnuva tarayıcısı ----------
  function compsOf(filter) {
    const s = S();
    return Object.values(s.comps).filter(filter).sort((a, b) => (b.season - a.season) || order(a) - order(b) || a.n.localeCompare(b.n, 'tr'));
  }
  function order(c) {
    const k = c.key || '';
    if (c.type === 'league') return (CM.LEAGUES[k] ? CM.LEAGUES[k].tier : 3);
    const pri = ['USC', 'UCLQ', 'UCL', 'UELQ', 'UEL', 'UECLQ', 'UECL', 'FIC', 'CWC', 'ACL'];
    const i = pri.indexOf(k);
    if (i >= 0) return 10 + i;
    if (/C$/.test(k)) return 5;
    if (/LC$/.test(k)) return 6;
    if (/S$/.test(k)) return 7;
    return 8;
  }
  function involves(c, t) { return c.teams.includes(t) || c.fx.some(f => f.h === t || f.a === t) || c.groups.some(g => g.teams.includes(t)); }
  function compLi(c) {
    const s = S();
    const st = c.done ? `🏆 ${esc(C.tName(c.win))}` : c.fx.some(f => f.hg !== null) ? 'Devam ediyor' : 'Başlamadı';
    return `<li class="tap" data-a="comp" data-id="${esc(c.id)}"><div class="grow"><div class="ellipsis"><b>${esc(c.n)}</b>${c.season !== s.season ? ` <span class="small muted">${c.season}/${String(c.season + 1).slice(2)}</span>` : ''}</div>
      <div class="small muted ellipsis">${st}</div></div><span class="muted">›</span></li>`;
  }
  UI.VIEWS.world = function () {
    const s = S(), u = s.user;
    const tabs = [['mine', 'Benim'], ['cty', 'Ülkeler'], ['uefa', 'UEFA'], ['intl', 'Dünya'], ['nat', 'Milli'], ['rank', 'Sıralamalar'], ['arch', 'Ödüller']];
    const tab = ui.worldTab;
    let body = '';
    if (tab === 'mine') {
      const list = compsOf(c => (u.club != null && involves(c, u.club)) || (u.nat && involves(c, 'N:' + u.nat)));
      body = `<div class="panel"><h3>Katıldığım turnuvalar</h3><ul class="list">${list.map(compLi).join('') || '<li class="muted">Yok</li>'}</ul></div>`;
    } else if (tab === 'cty') {
      const cty = ui.wCty || (h.club() ? h.club().cty : 'TUR');
      const list = compsOf(c => c.cty === cty && !c.intl);
      body = `<div class="panel"><div class="body"><select class="inp" data-ch="wCty">${Object.keys(CM.COUNTRIES).map(k => `<option value="${k}" ${k === cty ? 'selected' : ''}>${esc(h.nat(k).n)}</option>`).join('')}</select></div>
        <ul class="list">${list.map(compLi).join('')}</ul></div>`;
    } else if (tab === 'uefa') {
      body = `<div class="panel"><h3>UEFA kulüp turnuvaları</h3><ul class="list">${compsOf(c => c.intl && !c.nat && /^U/.test(c.key)).map(compLi).join('')}</ul></div>`;
    } else if (tab === 'intl') {
      body = `<div class="panel"><h3>Kıtalararası ve diğer konfederasyonlar</h3><ul class="list">${compsOf(c => c.intl && !c.nat && !/^U/.test(c.key)).map(compLi).join('') || '<li class="muted">Yok</li>'}</ul></div>`;
    } else if (tab === 'nat') {
      body = `<div class="panel"><h3>Milli takım turnuvaları</h3><ul class="list">${compsOf(c => c.nat).map(compLi).join('') || '<li class="muted">Yok</li>'}</ul></div>`;
    } else if (tab === 'rank') body = rankingsHtml();
    else if (tab === 'arch') body = UI.archHtml();
    return `<div class="tabs">${tabs.map(t => `<button data-a="wTab" data-v="${t[0]}" class="${tab === t[0] ? 'on' : ''}">${t[1]}</button>`).join('')}</div>${body}`;
  };

  function rankingsHtml() {
    const s = S(), sub = ui.rankTab || 'assoc';
    const tabs = [['assoc', 'UEFA ülke'], ['club', 'UEFA kulüp'], ['elo', 'Milli (Elo)']];
    let body = '';
    const tot = CM.UEFA.coefTotal;
    if (sub === 'assoc') {
      body = `<table class="tbl"><tr><th>#</th><th class="t">Ülke</th><th>Puan</th></tr>${CM.UEFA.assocRank().slice(0, 55).map((k, i) =>
        `<tr class="${h.club() && h.club().cty === k ? 'me' : ''}"><td>${i + 1}</td><td class="t">${h.flag(k)} ${esc(h.nat(k).n)}</td><td>${tot(s.coef[k]).toFixed(3)}</td></tr>`).join('')}</table>
        <div class="small muted body">Son 5 sezonun toplamı. Sıralama, UEFA turnuvalarına katılım kontenjanlarını belirler.</div>`;
    } else if (sub === 'club') {
      const ids = Object.keys(s.clubCoef).map(Number).filter(id => s.clubs[id]).sort((a, b) => tot(s.clubCoef[b]) - tot(s.clubCoef[a])).slice(0, 60);
      body = `<table class="tbl"><tr><th>#</th><th class="t">Kulüp</th><th>Puan</th></tr>${ids.map((id, i) =>
        `<tr class="${id === s.user.club ? 'me' : ''}"><td>${i + 1}</td><td class="t">${h.teamLink(id)}</td><td>${tot(s.clubCoef[id]).toFixed(2)}</td></tr>`).join('')}</table>`;
    } else {
      body = `<table class="tbl"><tr><th>#</th><th class="t">Ülke</th><th>Elo</th></tr>${CM.Intl.ranking().slice(0, 80).map((k, i) =>
        `<tr class="${s.user.nat === k ? 'me' : ''}"><td>${i + 1}</td><td class="t">${h.teamLink('N:' + k)}</td><td>${Math.round(s.nats[k].elo)}</td></tr>`).join('')}</table>`;
    }
    return `<div class="tabs">${tabs.map(t => `<button data-a="rankTab" data-v="${t[0]}" class="${sub === t[0] ? 'on' : ''}">${t[1]}</button>`).join('')}</div><div class="panel">${body}</div>`;
  }

  // ---------- Tek turnuva ----------
  function formHtml(arr) { return `<span class="form">${(arr || []).map(x => `<i class="${x}">${x}</i>`).join('')}</span>`; }
  function tableHtml(c, ids, tbl, zone) {
    const s = S(), u = s.user;
    tbl = tbl || c.tbl;
    return `<table class="tbl"><tr><th>#</th><th class="t">Takım</th><th>O</th><th>G</th><th>B</th><th>M</th><th>AV</th><th>P</th></tr>
      ${ids.map((t, i) => {
        const r = tbl[t] || [0, 0, 0, 0, 0, 0, 0];
        const z = zone ? zone(i, ids.length) : '';
        const me = t === u.club || t === 'N:' + u.nat;
        return `<tr class="${me ? 'me' : ''}"><td class="${z}">${i + 1}</td><td class="t">${h.teamLink(t)}</td><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td><td>${r[4] - r[5] > 0 ? '+' : ''}${r[4] - r[5]}</td><td class="p">${r[6]}</td></tr>`;
      }).join('')}</table>`;
  }
  function leagueZone(c) {
    const L = CM.LEAGUES[c.key];
    if (!L) return null;
    return (i, n) => {
      if (L.tier === 2) { if (i < L.promo) return 'zu'; if (L.po && i >= L.po.from - 1 && i < L.po.to) return 'zp'; }
      else if (i === 0) return 'zc';
      if (i >= n - L.rel) return 'zd';
      if (L.relPO && i === n - L.rel - 1) return 'zp';
      return '';
    };
  }
  function swissZone(c) {
    if (c.afc) return (i) => i < 8 ? 'zu' : 'zd';
    return (i) => i < 8 ? 'zu' : i < 24 ? 'zp' : 'zd';
  }
  function koHtml(c) {
    if (!c.rounds.length) return '<div class="body muted">Eleme turları henüz belirlenmedi.</div>';
    return c.rounds.map((R, ri) => {
      if (!R.ties.length) return `<div class="panel"><h3>${esc(R.n)} <span class="small muted">${R.d ? h.dstr(R.d[0]) : ''}</span></h3><div class="body small muted">Kura bekleniyor.</div></div>`;
      const ties = R.ties.map(t => {
        if (t.b == null || t.a == null) return `<li><div class="grow ellipsis">${h.teamLink(t.a != null ? t.a : t.b)}</div><span class="small muted">bay</span></li>`;
        const fs = t.fx.map(id => c.fx[id]);
        const agg = t.ga != null && fs.length > 1 ? ` <span class="small muted">(Top. ${t.ga}-${t.gb})</span>` : '';
        return `<li class="tie"><div class="grow">
          <div class="${t.w === t.a ? 'b' : t.w != null ? 'muted' : ''} ellipsis">${h.teamLink(t.a)}</div>
          <div class="${t.w === t.b ? 'b' : t.w != null ? 'muted' : ''} ellipsis">${h.teamLink(t.b)}</div></div>
          <div class="right small">${fs.map(f => `<div class="${f.hg !== null ? 'tl' : 'muted'}" ${f.hg !== null ? `data-a="report" data-c="${esc(c.id)}" data-id="${f.id}"` : ''}>${f.hg !== null ? scoreTxt(f) : h.dstr(f.d)}</div>`).join('')}${agg}</div></li>`;
      }).join('');
      return `<div class="panel"><h3>${esc(R.n)} <span class="small muted">${R.legs === 2 ? 'Çift maç' : 'Tek maç'}${R.neutral ? ' · tarafsız saha' : ''}</span></h3><ul class="list">${ties}</ul></div>`;
    }).reverse().join('');
  }
  function fxByRound(c) {
    // Maçları tarihe göre gruplandır
    const days = {};
    c.fx.forEach(f => { (days[f.d] = days[f.d] || []).push(f); });
    const keys = Object.keys(days).map(Number).sort((a, b) => a - b);
    if (!keys.length) return '<div class="body muted">Maç yok.</div>';
    if (ui.fxRound == null || !days[ui.fxRound]) {
      const nx = keys.find(d => d >= S().day);
      ui.fxRound = nx != null ? nx : keys[keys.length - 1];
    }
    const i = keys.indexOf(ui.fxRound);
    const list = days[ui.fxRound];
    const lbl = f => f.rd ? `${f.rd}. Hafta` : f.md ? `${f.md}. Maç Günü` : f.g !== undefined ? `Grup ${c.groups[f.g].n}` : f.rnd !== undefined ? c.rounds[f.rnd].n : '';
    return `<div class="row body"><button class="btn" data-a="fxDay" data-v="${keys[Math.max(0, i - 1)]}" ${i <= 0 ? 'disabled' : ''}>◀</button>
      <div class="grow center"><b>${U.fmtDay(ui.fxRound, 'dow')}</b><div class="small muted">${esc(lbl(list[0]))}</div></div>
      <button class="btn" data-a="fxDay" data-v="${keys[Math.min(keys.length - 1, i + 1)]}" ${i >= keys.length - 1 ? 'disabled' : ''}>▶</button></div>
      <ul class="list fxl">${list.map(f => fxRow(f)).join('')}</ul>`;
  }
  function scorersHtml(c) {
    const rows = [];
    const s = S();
    for (const id in s.players) {
      const p = s.players[id], st = p.st && p.st[c.id];
      if (st && (st[1] > 0 || st[2] > 0)) rows.push([p, st]);
    }
    rows.sort((a, b) => b[1][1] - a[1][1] || b[1][2] - a[1][2]);
    if (!rows.length) return '<div class="body muted">Henüz gol atılmadı.</div>';
    return `<table class="tbl"><tr><th>#</th><th class="t">Oyuncu</th><th>M</th><th>G</th><th>A</th><th>Ort</th></tr>${rows.slice(0, 30).map((r, i) =>
      `<tr class="${r[0].club === s.user.club ? 'me' : ''}"><td>${i + 1}</td><td class="t"><span class="tl" data-a="player" data-id="${r[0].id}">${esc(r[0].n)}</span><div class="small muted ellipsis">${esc(r[0].club != null ? s.clubs[r[0].club].n : h.nat(r[0].nat).n)}</div></td>
      <td>${r[1][0]}</td><td class="p">${r[1][1]}</td><td>${r[1][2]}</td><td>${r[1][4] ? (r[1][3] / r[1][4]).toFixed(1) : '-'}</td></tr>`).join('')}</table>`;
  }
  function histHtml(c) {
    const list = (S().hist[c.key] || []).slice().reverse();
    if (!list.length) return '<div class="body muted">Oyun içinde henüz tamamlanmış bir sezon yok.</div>';
    return `<table class="tbl"><tr><th>Sezon</th><th class="t">Şampiyon</th><th class="t">İkinci</th></tr>${list.map(x => `<tr><td>${x.s}/${String(x.s + 1).slice(2)}</td><td class="t">${h.teamLink(x.w)}</td><td class="t">${x.r != null ? h.teamLink(x.r) : '-'}</td></tr>`).join('')}</table>`;
  }
  const RULES = {
    UCL: '36 takımlı lig aşaması: her takım 4 torbanın her birinden 2 rakiple (1 iç saha, 1 deplasman) toplam 8 maç yapar. İlk 8 doğrudan son 16\'ya kalır, 9-24. sıralar play-off turu oynar, 25-36 elenir. Eleme turları çift maç, final tek maç.',
    UEL: '36 takımlı lig aşaması, 8 maç. İlk 8 son 16, 9-24 play-off, 25-36 elenir.',
    UECL: '36 takımlı lig aşaması: 6 torbanın her birinden 1 rakip, 6 maç (3 iç saha, 3 deplasman). İlk 8 son 16, 9-24 play-off.',
    ACL: 'Batı ve Doğu bölgelerinde 12\'şer takım; her takım bölgesinde 8 maç yapar. Her bölgeden ilk 8 son 16\'ya kalır; çeyrek finalden itibaren tek maçlık final turnuvası.',
    NLA: '4 takımlı gruplar, çift devre. Grup birincileri ve ikincileri çeyrek finale (çift maç), ardından Finaller; grup sonuncuları küme düşer.'
  };
  UI.VIEWS.comp = function () {
    const s = S(), c = s.comps[ui.comp];
    if (!c) { ui.view = 'world'; return UI.VIEWS.world(); }
    const tabs = [];
    const hasTable = c.type === 'league' || c.type === 'swiss' || c.groups.length;
    if (hasTable) tabs.push(['table', c.groups.length ? 'Gruplar' : 'Puan Durumu']);
    if (c.rounds.length) tabs.push(['ko', 'Eleme']);
    tabs.push(['fx', 'Fikstür'], ['scor', 'Gol Krallığı'], ['hist', 'Geçmiş']);
    let tab = ui.compTab;
    if (!tabs.some(t => t[0] === tab)) tab = tabs[0][0];
    let body = '';
    if (tab === 'table') {
      if (c.type === 'league') {
        const z = leagueZone(c);
        if (c.splitGroups) {
          const names = c.splitGroups.length === 2 ? ['Şampiyonluk Grubu', 'Düşme Grubu'] : c.splitGroups.map((g, i) => `Grup ${i + 1}`);
          let off = 0;
          body = c.splitGroups.map((g, i) => { const o = off; off += g.length; return `<div class="panel"><h3>${names[i]}</h3>${tableHtml(c, C.sortTable(c, g), null, z ? (k) => z(k + o, c.teams.length) : null)}</div>`; }).join('');
        } else body = `<div class="panel">${tableHtml(c, C.standings(c), null, z)}</div>`;
        const L = CM.LEAGUES[c.key];
        if (L) body += `<div class="small muted center">${L.tier === 2 ? `İlk ${L.promo} doğrudan terfi${L.po ? `, ${L.po.from}-${L.po.to}. sıralar play-off` : ''}` : 'Lider şampiyon'} · son ${L.rel} takım küme düşer${L.relPO ? ' · baraj hattı turuncu' : ''}${L.split ? ' · normal sezon sonrası lig ikiye bölünür' + (L.split.halve ? ' ve puanlar yarıya iner' : '') : ''}</div>`;
      } else if (c.type === 'swiss') {
        if (c.regions) body = c.regions.map((g, i) => `<div class="panel"><h3>${i ? 'Doğu' : 'Batı'} Bölgesi</h3>${tableHtml(c, C.sortTable(c, g), null, swissZone(c))}</div>`).join('');
        else body = `<div class="panel">${tableHtml(c, c.lpRank || C.sortTable(c, c.teams), null, swissZone(c))}</div>`;
        if (RULES[c.key]) body += `<div class="small muted center">${RULES[c.key]}</div>`;
      } else {
        body = c.groups.map(g => `<div class="panel"><h3>Grup ${esc(g.n)}</h3>${tableHtml(c, g.order || C.sortTable(c, g.teams, g.tbl), g.tbl)}</div>`).join('');
        if (RULES[c.key]) body += `<div class="small muted center">${RULES[c.key]}</div>`;
      }
    } else if (tab === 'ko') body = koHtml(c);
    else if (tab === 'fx') body = `<div class="panel">${fxByRound(c)}</div>`;
    else if (tab === 'scor') body = `<div class="panel">${scorersHtml(c)}</div>`;
    else body = `<div class="panel">${histHtml(c)}</div>`;
    return `<div class="row mb"><button class="btn" data-a="nav" data-v="world">◀</button><div class="grow"><b>${esc(c.n)}</b><div class="small muted">${c.season}/${String(c.season + 1).slice(2)}${c.done ? ' · Şampiyon: ' + esc(C.tName(c.win)) : ''}</div></div></div>
      <div class="tabs">${tabs.map(t => `<button data-a="compTab" data-v="${t[0]}" class="${tab === t[0] ? 'on' : ''}">${t[1]}</button>`).join('')}</div>${body}`;
  };

  // ---------- Maç raporu ----------
  function report(cid, fid) {
    const s = S(), c = s.comps[cid], f = c && c.fx[fid];
    if (!f) return;
    const sc = (f.sc || []).slice().sort((a, b) => a[1] - b[1]);
    const nm = id => s.players[id] ? E_sur(s.players[id]) : '?';
    const side = i => sc.filter(x => x[2] === i).map(x => `${esc(nm(x[0]))} ${x[1]}'${x[3] ? ' (P)' : ''}`).join('<br>');
    const st = f.st;
    const lbl = ['Topa sahip olma', 'Şut', 'İsabetli şut', 'Korner', 'Faul', 'Sarı kart', 'Kırmızı kart'];
    let stats = '';
    if (st) {
      const tp = st[0][0] + st[1][0] || 1;
      stats = lbl.map((l, i) => {
        let a = st[0][i], b = st[1][i];
        if (i === 0) { a = Math.round(a / tp * 100) + '%'; b = Math.round(st[1][0] / tp * 100) + '%'; }
        return `<div class="stat"><span class="v">${a}</span><span class="l">${l}</span><span class="v">${b}</span></div>`;
      }).join('');
    }
    h.openModal(`<button class="close" data-a="close">✕</button>
      <div class="small muted">${esc(c.n)} · ${U.fmtDay(f.d, 'dow')}</div>
      <div class="next-match"><div><div class="tm">${h.teamLink(f.h)}</div></div><div class="vs">${scoreTxt(f)}</div><div><div class="tm">${h.teamLink(f.a)}</div></div></div>
      <div class="scr2"><div>${side(0)}</div><div class="right">${side(1)}</div></div>
      ${stats ? `<div class="panel mt"><h3>İstatistikler</h3><div class="body">${stats}</div></div>` : ''}`);
  }
  function E_sur(p) { return CM.E.sur(p); }

  // ---------- Takım kartı ----------
  function teamSheet(t) {
    const s = S();
    const nat = C.isNat(t);
    const o = C.tObj(t);
    if (!o) return;
    const ids = nat ? (o.squad && o.squad.length ? o.squad : CM.UI.natCandidates(o.code).slice(0, 26).map(p => p.id)) : o.players;
    const ps = ids.map(id => s.players[id]).filter(Boolean).sort((a, b) => 'GDMF'.indexOf(P.LINE[a.pos]) - 'GDMF'.indexOf(P.LINE[b.pos]) || P.ovr(b) - P.ovr(a));
    const up = CM.Game.upcoming(t, 5), res = CM.Game.results(t, 5);
    const tro = (o.trophies || []).slice().reverse();
    const lg = !nat && o.lg ? CM.LEAGUES[o.lg] : null;
    const pos = lg ? (() => { const lc = s.comps[`${o.lg}-${s.season}`]; return lc && lc.tbl[t] && lc.tbl[t][0] ? C.standings(lc).indexOf(t) + 1 : 0; })() : 0;
    const info = nat
      ? `<span>Konfederasyon</span><span>${esc(o.conf)}</span><span>Elo</span><span>${Math.round(o.elo)} (${CM.Intl.ranking().indexOf(o.code) + 1}.)</span>`
      : `<span>Lig</span><span>${lg ? esc(lg.n) + (pos ? ` · ${pos}.` : '') : 'Ligi modellenmiyor'}</span><span>Stadyum</span><span>${esc(o.st || '-')}${o.cap ? ' (' + o.cap.toLocaleString('tr-TR') + ')' : ''}</span><span>İtibar</span><span class="stars">${h.repStars(o.rep)}</span>`;
    h.openModal(`<button class="close" data-a="close">✕</button>
      <div class="row">${h.crest(o, 34)}<div><h2>${esc(o.n)}</h2><div class="small muted">${nat ? 'Milli takım' : esc(h.nat(o.cty).n || '')}</div></div></div>
      <div class="panel mt"><div class="body"><div class="kv">${info}<span>Güç</span><span>${Math.round(CM.Sim.strengthOf(o))}</span></div></div></div>
      ${tro.length ? `<div class="panel"><h3>Kupalar (oyun içi)</h3><div class="body small">${tro.map(x => `🏆 ${x.s}/${String(x.s + 1).slice(2)} ${esc(x.n)}`).join('<br>')}</div></div>` : ''}
      <div class="panel"><h3>Sıradaki maçlar</h3><ul class="list fxl">${up.map(f => fxRow(f, { comp: true, team: t })).join('') || '<li class="muted">Yok</li>'}</ul></div>
      <div class="panel"><h3>Son sonuçlar</h3><ul class="list fxl">${res.map(f => fxRow(f, { comp: true, team: t })).join('') || '<li class="muted">Yok</li>'}</ul></div>
      <div class="panel"><h3>Kadro (${ps.length})</h3><ul class="list">${ps.map(p => `<li class="tap" data-a="player" data-id="${p.id}">${h.posB(p.pos)}<div class="grow ellipsis">${esc(p.n)}${h.statusIcons(p)}<div class="small muted">${h.flag(p.nat)} ${nat && p.club != null ? esc(s.clubs[p.club].n) : ''}</div></div><span class="num">${h.age(p)}</span>${h.ovrB(p)}</li>`).join('')}</ul></div>
      ${!nat && t !== s.user.club && s.user.club != null ? `<button class="btn block" data-a="scoutClub" data-id="${t}">🔍 Kulübü gözlemle (ligi: ${lg ? esc(lg.n) : '-'})</button>` : ''}`);
  }
  UI.teamSheet = teamSheet;

  Object.assign(A, {
    mTab(d) { ui.mTab = d.v; UI.render(); },
    wTab(d) { ui.worldTab = d.v; UI.render(); },
    rankTab(d) { ui.rankTab = d.v; UI.render(); },
    comp(d) { ui.comp = d.id; ui.compTab = 'table'; ui.fxRound = null; ui.view = 'comp'; h.closeModal(); UI.render(); window.scrollTo(0, 0); },
    compTab(d) { ui.compTab = d.v; UI.render(); },
    fxDay(d) { ui.fxRound = +d.v; UI.render(); },
    report(d) { report(d.c, +d.id); },
    team(d) { const t = /^\d+$/.test(d.id) ? +d.id : d.id; teamSheet(t); },
    scoutClub(d) {
      const c = S().clubs[+d.id];
      if (!c.lg) return h.toast('Bu kulübün ligi modellenmiyor.');
      const r = CM.Market.scout('l', c.lg, CM.LEAGUES[c.lg].n); h.toast(r.text);
    }
  });
  UI.CH.wCty = v => { ui.wCty = v; UI.render(); };
})(typeof window !== 'undefined' ? window : globalThis);
