/* Dünya kurulumu: veritabanından kulüpler, oyuncular, milli takımlar */
(function (G) {
  'use strict';
  const CM = G.CM, U = CM.U, P = CM.P;

  const TIX = { ENG: 60, ESP: 45, GER: 35, ITA: 35, FRA: 30, TUR: 22, POR: 20, NED: 30, BEL: 25, SCO: 30, AUT: 22, SUI: 30, GRE: 18, CZE: 12, DEN: 25, POL: 15, CRO: 10, SRB: 8, UKR: 6, KSA: 10 };
  const FORMS = ['4-2-3-1', '4-2-3-1', '4-3-3', '4-3-3', '4-4-2', '4-1-4-1', '3-4-2-1', '3-5-2', '4-4-1-1', '5-3-2'];

  function newState(season) {
    return {
      v: 2, season, day: U.day(season, 7, 1), nextPid: 1, nextMsg: 1,
      clubs: {}, players: {}, nats: {}, comps: {}, sched: {}, news: [], offers: [], hist: {}, coef: {}, clubCoef: {},
      user: null, known: {}, scoutTasks: [], seed: U.R.s, pending: null, awards: [], records: {}
    };
  }

  // Kulüp kalitesinden kurgusal oyuncu gücü
  const repToAbility = rep => 38 + rep * 0.44;

  function mkClub(d, id, S) {
    const L = d.lg ? CM.LEAGUES[d.lg] : null;
    const cty = d.cty || (L ? L.cty : null);
    const c = {
      id, key: d.id, n: d.n, sh: d.sh || d.n.slice(0, 3).toUpperCase(), cty, lg: d.lg || null, pool: d.pool || null,
      conf: d.conf || 'UEFA', c1: d.c1 || '#1a3a7a', c2: d.c2 || '#ffffff', rep: d.rep || 50, st: d.st || '', cap: d.cap || 12000,
      players: [], tactic: { form: d.f || U.pick(FORMS), ment: 'dengeli', pass: 'karisik', press: 'normal', tempo: 'normal', xi: [], subs: [], pk: null },
      fin: { gate: 0, tv: 0, prize: 0, wages: 0, tin: 0, tout: 0, spons: 0 }, tix: TIX[cty] || 15, wf: d.wf || (L ? L.wf : 0.4),
      trophies: [], hist: [], youth: U.clamp(Math.round(d.rep / 20), 1, 5), scouts: U.clamp(Math.round(d.rep / 25), 1, 5), trainB: 1,
      extra: !!d.extra, region: d.region || null
    };
    if (L && L.tier === 2) c.tix = Math.round(c.tix * 0.5);
    const tvL = L ? L.tv : 3e6;
    c.money = d.b != null ? d.b * 1e6 : U.roundMoney(tvL * 0.3 + 40e6 * Math.pow(c.rep / 100, 5));
    return c;
  }

  // DB oyuncu satırlarını ekle ve kadroyu 24'e tamamla
  function fillSquad(c, lines, S) {
    const season = S.season;
    const real = [];
    (lines || '').split('\n').map(s => s.trim()).filter(s => s && !s.startsWith('#')).forEach(line => {
      const p = P.fromLine(line, c.id, season);
      if (!p) return;
      p.id = S.nextPid++;
      S.players[p.id] = p; c.players.push(p.id); real.push(p);
    });
    const need = { GK: 3, CB: 4, LB: 2, RB: 2, DM: 2, CM: 3, AM: 1, LM: 0, RM: 0, LW: 2, RW: 2, ST: 3 };
    const have = {};
    real.forEach(p => { have[p.pos] = (have[p.pos] || 0) + 1; });
    const base = real.length >= 8
      ? U.avg(real.map(P.ovr).sort((a, b) => b - a).slice(4, 18)) - 3
      : repToAbility(c.rep);
    const nat = c.cty && CM.DB.nations[c.cty] ? c.cty : 'ENG';
    const foreign = ['BRA', 'ARG', 'FRA', 'POR', 'NGA', 'SEN', 'CIV', 'SRB', 'CRO', 'COL', 'GHA', 'NED', 'ESP', 'MAR', 'URU', 'CMR'];
    const fp = (c.lg && CM.LEAGUES[c.lg].foreign) ? 0.35 : (c.cty === 'ENG' || c.cty === 'ESP' || c.cty === 'GER' || c.cty === 'ITA' || c.cty === 'FRA' ? 0.3 : 0.25);
    const add = (pos, abil, age) => {
      const n = U.rand() < fp ? U.pick(foreign) : nat;
      const p = P.generate(pos, Math.round(abil), age, n, season);
      p.id = S.nextPid++; p.club = c.id;
      S.players[p.id] = p; c.players.push(p.id);
      have[pos] = (have[pos] || 0) + 1;
    };
    for (const pos in need) {
      while ((have[pos] || 0) < need[pos]) add(pos, base + U.gauss() * 4 - (have[pos] || 0) * 1.5, U.ri(19, 32));
    }
    while (c.players.length < 24) add(U.pick(['CB', 'CM', 'ST', 'LW', 'RW', 'DM', 'RB', 'LB']), base - 3 + U.gauss() * 4, U.ri(18, 30));
    // Maaş ve sözleşme
    c.players.forEach(id => {
      const p = S.players[id];
      p.wage = P.wageFor(p, c.wf * (0.75 + c.rep / 200));
      if (!p.ce || p.ce <= season) p.ce = season + 1 + Math.floor(U.rand() * 3);
    });
  }

  function mkNation(code, n) {
    return {
      code, n: n.n, sh: code, c1: n.c1, c2: n.c2, conf: n.conf, str: n.str, squad: [], rep: n.str,
      tactic: { form: n.str >= 80 ? '4-3-3' : U.pick(FORMS), ment: 'dengeli', pass: 'karisik', press: 'normal', tempo: 'normal', xi: [], subs: [], pk: null },
      elo: 1200 + n.str * 8, hist: [], trophies: []
    };
  }

  // Milli takımlar için yeterli oyuncu yoksa "ligi modellenmemiş" (yalnızca milli takımda görünen) oyuncular üret
  function nationFillers(S) {
    const byNat = {};
    Object.values(S.players).forEach(p => { (byNat[p.nat] = byNat[p.nat] || []).push(p); });
    const plan = { GK: 3, CB: 5, LB: 2, RB: 2, DM: 2, CM: 3, AM: 2, LW: 2, RW: 2, ST: 3 };
    for (const code in CM.DB.nations) {
      const n = CM.DB.nations[code];
      const good = (byNat[code] || []).filter(p => P.ovr(p) >= n.str - 20);
      const have = {};
      good.forEach(p => { have[p.pos] = (have[p.pos] || 0) + 1; });
      let k = 0;
      for (const pos in plan) {
        for (let h = have[pos] || 0; h < plan[pos]; h++) {
          const abil = Math.round(n.str - 7 - k * 0.3 + U.gauss() * 3);
          const p = P.generate(pos, U.clamp(abil, 40, 88), U.ri(21, 31), code, S.season);
          p.id = S.nextPid++; p.ntOnly = true; p.club = null;
          S.players[p.id] = p; k++;
        }
      }
    }
  }

  function freeAgents(S, n) {
    const nats = Object.keys(CM.DB.nations);
    for (let i = 0; i < n; i++) {
      const nat = U.rand() < 0.5 ? U.pick(['ENG', 'ESP', 'ITA', 'FRA', 'GER', 'BRA', 'ARG', 'TUR', 'POR', 'NED']) : U.pick(nats);
      const p = P.generate(U.pick(['GK', 'CB', 'CB', 'LB', 'RB', 'DM', 'CM', 'CM', 'AM', 'LW', 'RW', 'ST', 'ST']), U.ri(50, 71), U.ri(21, 34), nat, S.season);
      p.id = S.nextPid++; p.club = null; p.ce = S.season;
      p.wage = P.wageFor(p, 0.6);
      S.players[p.id] = p;
    }
  }

  function build(season) {
    const S = CM.S = newState(season || 2026);
    let id = 1;
    const PL = CM.DB.P || {};
    CM.DB.clubs.forEach(d => { const c = mkClub(d, id++, S); S.clubs[c.id] = c; fillSquad(c, PL[d.id] || d.p, S); });
    // Havuz kulüpleri (modellenmeyen alt ligler)
    for (const key in CM.POOLS) {
      const cty = key.slice(0, 3);
      CM.POOLS[key].forEach(n => {
        const c = mkClub({ id: 'pool:' + n, n, cty, pool: key, rep: U.ri(38, 48), cap: 9000 }, id++, S);
        c.wf = 0.2; S.clubs[c.id] = c; fillSquad(c, '', S);
      });
    }
    // Avrupa/Asya/diğer (yalnızca uluslararası turnuvalarda oynayan) kulüpler
    (CM.DB.extra || []).forEach(d => { const c = mkClub(Object.assign({ extra: true }, d), id++, S); S.clubs[c.id] = c; fillSquad(c, PL[d.id] || d.p, S); });
    for (const code in CM.DB.nations) S.nats[code] = mkNation(code, CM.DB.nations[code]);
    nationFillers(S);
    freeAgents(S, 160);
    // Ülke katsayıları
    for (const cty in CM.COUNTRIES) S.coef[cty] = { legacy: CM.COUNTRIES[cty].coef, seasons: [] };
    for (const cty in CM.UEFA_COEF_OTHER) S.coef[cty] = { legacy: CM.UEFA_COEF_OTHER[cty], seasons: [] };
    // Kulüp katsayısı (torbalar için): itibardan başlangıç
    Object.values(S.clubs).forEach(c => { S.clubCoef[c.id] = { legacy: Math.max(3, Math.pow(c.rep / 10, 2.3)), seasons: [] }; });
    return S;
  }

  function clubByKey(key) {
    const S = CM.S;
    if (!S._keyIdx) { S._keyIdx = {}; Object.values(S.clubs).forEach(c => { S._keyIdx[c.key] = c.id; }); }
    return S._keyIdx[key];
  }
  function leagueClubs(lg) { return Object.values(CM.S.clubs).filter(c => c.lg === lg).map(c => c.id); }

  CM.World = { build, clubByKey, leagueClubs, repToAbility, mkClub, fillSquad, TIX };
})(typeof window !== 'undefined' ? window : globalThis);
