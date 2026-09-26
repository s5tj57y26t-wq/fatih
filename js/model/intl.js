/* Milli takımlar: kadro davetleri, UEFA Uluslar Ligi, Euro ve Dünya Kupası elemeleri/finalleri, kıta kupaları, Elo sıralaması */
(function (G) {
  'use strict';
  const CM = G.CM, U = CM.U, P = CM.P, C = CM.Comp, Cal = CM.Cal;
  const S = () => CM.S;
  const N = code => 'N:' + code;
  const code = t => t.slice(2);

  const UEFA_TEAMS = () => Object.keys(CM.DB.nations).filter(c => CM.DB.nations[c].conf === 'UEFA' && c !== 'RUS');
  const byElo = list => list.slice().sort((a, b) => S().nats[b].elo - S().nats[a].elo);

  // Uluslar Ligi 2026-27 A Ligi grupları (gerçek kura, 12 Şubat 2026)
  const NL26_A = [['FRA', 'ITA', 'BEL', 'TUR'], ['GER', 'NED', 'SRB', 'GRE'], ['ESP', 'CRO', 'ENG', 'CZE'], ['POR', 'DEN', 'NOR', 'WAL']];

  function mkComp(o) { return C.create(Object.assign({ type: 'groups', suspKey: 'NT', ylim: 3, intl: true, nat: true, keep: true }, o)); }

  // ---------- Kurulum ----------
  function setupSeason(Y, first) {
    const s = S();
    s.intl = s.intl || { nlLeague: {} };
    if (Y % 2 === 0) setupNL(Y, first);
    if ((Y + 1) % 4 === 3) { // 2026, 2030 ...: Asya Kupası (Ocak Y+1), AFCON ve Gold Cup (Haziran Y+1)
      bgTournament(`ASC-${Y + 1}`, 'AFC Asya Kupası ' + (Y + 1), 'AFC', 16, U.day(Y + 1, 1, 8), Y);
      bgTournament(`AFCON-${Y + 1}`, 'Afrika Uluslar Kupası ' + (Y + 1), 'CAF', 16, U.day(Y + 1, 6, 19), Y);
      bgTournament(`GOLD-${Y + 1}`, 'CONCACAF Gold Cup ' + (Y + 1), 'CONCACAF', 8, U.day(Y + 1, 6, 20), Y);
    }
    if ((Y + 1) % 4 === 0) bgTournament(`COPA-${Y + 1}`, 'Copa América ' + (Y + 1), 'CONMEBOL', 16, U.day(Y + 1, 6, 16), Y);
    if ((Y + 1) % 4 === 2 && Y >= 2029) setupWCQ(Y);
  }

  // ---------- Uluslar Ligi ----------
  function setupNL(Y, first) {
    const s = S();
    let leagues;
    const all = byElo(UEFA_TEAMS());
    if (first) {
      const A = [].concat(...NL26_A);
      const rest = all.filter(c => !A.includes(c));
      leagues = { A: NL26_A, B: chunk(rest.slice(0, 16), 4), C: chunk(rest.slice(16, 32), 4), D: chunk(rest.slice(32), Math.ceil(rest.slice(32).length / 2)) };
      Object.keys(leagues).forEach(L => [].concat(...leagues[L]).forEach(c => { s.intl.nlLeague[c] = L; }));
    } else {
      const lists = { A: [], B: [], C: [], D: [] };
      all.forEach(c => { lists[s.intl.nlLeague[c] || 'D'].push(c); });
      leagues = {};
      ['A', 'B', 'C', 'D'].forEach(L => {
        const l = byElo(lists[L]);
        const gs = L === 'D' ? Math.max(1, Math.ceil(l.length / 3)) : 4;
        const groups = [...Array(gs)].map(() => []);
        l.forEach((c, i) => { const pot = Math.floor(i / gs); groups[pot % 2 ? gs - 1 - (i % gs) : i % gs].push(c); });
        leagues[L] = groups.filter(g => g.length >= 2);
      });
    }
    const w = Cal.intlWindows(Y);
    const days = w[0].days.concat(w[1].days);
    ['A', 'B', 'C', 'D'].forEach(L => {
      if (!leagues[L] || !leagues[L].length) return;
      const c = mkComp({ id: `NL${L}-${Y}`, key: 'NL' + L, n: `UEFA Uluslar Ligi ${L}`, sh: `Uluslar Ligi ${L}`, nlL: L, onGroups: 'nlDone' });
      C.groupsInit(c, leagues[L].map(g => g.map(N)), 2, days, leagues[L].map((g, i) => `${L}${i + 1}`));
    });
  }
  function chunk(a, n) { const out = []; for (let i = 0; i < a.length; i += n) out.push(a.slice(i, i + n)); return out; }
  C.HOOKS.nlDone = c => {
    const s = S(), Y = c.season, L = c.nlL;
    const g = c.groups.map(x => x.order);
    // Terfi/düşme (basitleştirilmiş: grup lideri üst lige, sonuncu alt lige)
    const up = { B: 'A', C: 'B', D: 'C' }, dn = { A: 'B', B: 'C', C: 'D' };
    g.forEach(o => {
      if (up[L]) s.intl.nlLeague[code(o[0])] = up[L];
      if (dn[L] && o.length >= 4) s.intl.nlLeague[code(o[o.length - 1])] = dn[L];
    });
    if (L === 'A') {
      // Çeyrek final (Mart, çift maç): grup liderleri vs başka grubun ikincisi
      const d = Cal.intlWindows(Y)[2].days;
      const fin = U.day(Y + 1, 6, 9);
      C.koInit(c, [{ n: 'Çeyrek Final', legs: 2, d }, { n: 'Yarı Final', legs: 1, d: [fin], neutral: true }, { n: 'Final', legs: 1, d: [fin + 4], neutral: true, fixedPairs: true }]);
      C.drawRound(c, 0, [], { pairs: [[g[1][1], g[0][0]], [g[0][1], g[1][0]], [g[3][1], g[2][0]], [g[2][1], g[3][0]]] });
    } else {
      c.done = true; c.win = g[0][0];
      CM.Game.onCompDone(c);
    }
  };

  // ---------- Euro elemeleri (12 grup: liderler + en iyi 8 ikinci + ev sahibi kontenjanı + play-off) ----------
  const EURO_HOSTS = { 2028: ['ENG', 'SCO', 'WAL', 'IRL'], 2032: ['ITA', 'TUR'] };
  function setupEUQ(Y) {
    const E = Y + 2;
    const teams = byElo(UEFA_TEAMS());
    const hosts = EURO_HOSTS[E] || [];
    // 54 takım: 6 grup x 5, 6 grup x 4; ev sahipleri farklı gruplara, diğerleri güç sırasına göre dengeli dağıtılır
    const cap = [...Array(12)].map((x, i) => i < teams.length - 48 ? 5 : 4);
    const groups = [...Array(12)].map(() => []);
    hosts.forEach((h, i) => groups[i * 3 % 12].push(h));
    teams.filter(t => !hosts.includes(t)).forEach(t => {
      const open = groups.map((g, i) => i).filter(i => groups[i].length < cap[i]);
      const min = Math.min(...open.map(i => groups[i].length));
      const cands = open.filter(i => groups[i].length === min);
      groups[U.pick(cands)].push(t);
    });
    const w1 = Cal.intlWindows(Y), w2 = Cal.intlWindows(Y + 1);
    const days = w1[2].days.concat(w1[3].days, w2[0].days, w2[1].days);
    const c = mkComp({ id: `EUQ-${Y}`, key: 'EUQ', n: `EURO ${E} Elemeleri`, sh: `EURO ${E} Elemeleri`, onGroups: 'euqDone', euro: E, season: Y });
    C.groupsInit(c, groups.filter(g => g.length).map(g => g.map(N)), 2, days);
    CM.Game.news(`EURO ${E} eleme kurası çekildi`, `12 grupta mücadele edilecek. Grup birincileri ve en iyi 8 ikinci doğrudan finallere katılacak; ev sahiplerine ayrılan 2 kontenjan ve play-off ile 24 takım tamamlanacak.`, { type: 'world' });
  }
  function rankedAcross(c, pos) {
    return c.groups.map(g => ({ t: g.order[pos], r: g.tbl[g.order[pos]], n: g.teams.length })).filter(x => x.t)
      .map(x => ({ t: x.t, ppg: x.r[6] / Math.max(1, x.r[0]), gd: (x.r[4] - x.r[5]) / Math.max(1, x.r[0]) }))
      .sort((a, b) => b.ppg - a.ppg || b.gd - a.gd).map(x => x.t);
  }
  C.HOOKS.euqDone = c => {
    const E = c.euro, hosts = (EURO_HOSTS[E] || []).map(N);
    const winners = c.groups.map(g => g.order[0]);
    const seconds = rankedAcross(c, 1);
    const q = winners.concat(seconds.slice(0, 8));
    const hostLeft = hosts.filter(h => !q.includes(h)).sort((a, b) => S().nats[code(b)].elo - S().nats[code(a)].elo);
    hostLeft.slice(0, 2).forEach(h => q.push(h));
    const pool = seconds.slice(8).concat(rankedAcross(c, 2)).filter(t => !q.includes(t));
    const needed = 24 - q.length;
    S().intl.euroQ = { E, q, season: c.season };
    if (needed <= 0) { setupEuroFinals(E, q.slice(0, 24)); return; }
    // Play-off: her yolda 4 takım (yarı final + final), Mart
    const paths = Math.ceil(needed);
    const teams = pool.slice(0, paths * 4);
    const Y = c.season + 1;
    const d = Cal.intlWindows(Y)[2].days;
    const pc = mkComp({ id: `EUPO-${E}`, key: 'EUPO', type: 'cup', n: `EURO ${E} Play-off`, sh: 'Play-off', season: Y, poFor: E });
    const R = [{ n: 'Yarı Final', legs: 1, d: [d[0]] }, { n: 'Final', legs: 1, d: [d[1]] }];
    C.koInit(pc, R);
    pc.onRound = 'euPO';
    const pairs = [];
    for (let i = 0; i < paths; i++) { const g = teams.slice(i * 4, i * 4 + 4); if (g.length === 4) pairs.push([g[3], g[0]], [g[2], g[1]]); }
    pc.paths = paths;
    C.drawRound(pc, 0, [], { pairs });
  };
  C.HOOKS.euPO = (c, ri, winners) => {
    if (ri === 0) {
      const pairs = [];
      for (let i = 0; i + 1 < winners.length; i += 2) pairs.push([winners[i + 1], winners[i]]);
      C.drawRound(c, 1, [], { pairs });
      return false;
    }
    const q = S().intl.euroQ.q.concat(winners);
    setupEuroFinals(c.poFor, q.slice(0, 24));
    c.done = true; c.win = winners[0];
    return false;
  };
  function setupEuroFinals(E, teams) {
    if (S().comps[`EURO-${E}`]) return;
    const hosts = (EURO_HOSTS[E] || []).map(N);
    const sorted = byElo(teams.map(code)).map(N);
    const groups = [...Array(6)].map(() => []);
    hosts.filter(h => teams.includes(h)).slice(0, 4).forEach((h, i) => groups[i].push(h));
    const rest = sorted.filter(t => !groups.some(g => g.includes(t)));
    rest.forEach(t => { const g = groups.filter(x => x.length < 4).sort((a, b) => a.length - b.length)[0]; if (g) g.push(t); });
    const d0 = U.day(E, 6, 9);
    const c = mkComp({ id: `EURO-${E}`, key: 'EURO', n: `UEFA EURO ${E}`, sh: `EURO ${E}`, neutral: true, onGroups: 'euroKO', season: E - 1, fin: true });
    c.neutral = true;
    C.groupsInit(c, groups, 1, [d0, d0 + 5, d0 + 10]);
    c.fx.forEach(f => { if (hosts.includes(f.h)) f.n = false; });
    CM.Game.news(`UEFA EURO ${E} kurası`, `Turnuvaya katılan 24 takım belli oldu. Açılış maçı ${U.fmtDay(d0)} tarihinde.`, { type: 'world' });
  }
  C.HOOKS.euroKO = c => {
    const E = +c.id.split('-')[1];
    const g = c.groups.map(x => x.order);
    const firsts = g.map(x => x[0]), seconds = g.map(x => x[1]);
    const thirds = c.groups.map(x => ({ t: x.order[2], r: x.tbl[x.order[2]] })).sort((a, b) => b.r[6] - a.r[6] || (b.r[4] - b.r[5]) - (a.r[4] - a.r[5])).slice(0, 4).map(x => x.t);
    const d = U.day(E, 6, 29);
    C.koInit(c, [{ n: 'Son 16', legs: 1, d: [d], neutral: true }, { n: 'Çeyrek Final', legs: 1, d: [d + 5], neutral: true, fixedPairs: true },
      { n: 'Yarı Final', legs: 1, d: [d + 8], neutral: true, fixedPairs: true }, { n: 'Final', legs: 1, d: [d + 11], neutral: true, fixedPairs: true }]);
    const pairs = [[thirds[0], firsts[0]], [seconds[2], seconds[3]], [thirds[1], firsts[1]], [seconds[4], firsts[5]],
      [thirds[2], firsts[2]], [seconds[0], seconds[1]], [thirds[3], firsts[3]], [seconds[5], firsts[4]]];
    C.drawRound(c, 0, [], { pairs });
  };

  // ---------- Dünya Kupası ----------
  const WC_HOSTS = { 2030: ['ESP', 'POR', 'MAR', 'ARG', 'URU', 'PAR'], 2034: ['KSA'] };
  function setupWCQ(Y) {
    const W = Y + 1, hosts = WC_HOSTS[W] || [];
    const teams = byElo(UEFA_TEAMS().filter(t => !hosts.includes(t)));
    // A Ligi: en iyi 36 takım, 3 grup x 12 takım, İsviçre sistemi (6 maç)
    const A = teams.slice(0, 36), B = teams.slice(36);
    const w = Cal.intlWindows(Y);
    const days = w[0].days.concat(w[1].days);
    const c = mkComp({ id: `WCQ-${Y}`, key: 'WCQ', type: 'groups', n: `${W} Dünya Kupası Avrupa Elemeleri`, sh: `DK ${W} Elemeleri`, onGroups: 'wcqDone', wc: W, season: Y });
    const groupsA = [[], [], []];
    A.forEach((t, i) => groupsA[i % 3].push(N(t)));
    // A grupları: her takım gruptan 6 farklı rakip (3 ev, 3 deplasman) -> dairesel ofset ±1..±3
    c.groups = [];
    groupsA.forEach((g, gi) => {
      const perm = U.shuffle(g.slice());
      const tbl = {}; perm.forEach(t => { tbl[t] = [0, 0, 0, 0, 0, 0, 0]; });
      const pairs = [];
      for (let i = 0; i < perm.length; i++) for (let k = 1; k <= 3; k++) pairs.push([perm[i], perm[(i + k) % perm.length]]);
      const dd = assignDays(perm, pairs, days.length);
      pairs.forEach((p, i) => C.addFx(c, { d: days[dd[i]], h: p[0], a: p[1], g: gi }));
      c.groups.push({ n: `A${gi + 1}`, teams: perm, tbl, left: pairs.length });
    });
    // B Ligi: 6'lı gruplar, tek devre
    const gB = chunk(B, 6);
    gB.forEach((g, i) => {
      const gi = c.groups.length;
      const tbl = {}; g.forEach(t => { tbl[N(t)] = [0, 0, 0, 0, 0, 0, 0]; });
      const rounds = C.roundRobin(g.map(N));
      rounds.forEach((w2, k) => w2.forEach(m => C.addFx(c, { d: days[Math.min(k, days.length - 1)], h: m[0], a: m[1], g: gi })));
      c.groups.push({ n: `B${i + 1}`, teams: g.map(N), tbl, left: rounds.reduce((s2, w2) => s2 + w2.length, 0) });
    });
    c.phase = 'grp';
  }
  function assignDays(teams, pairs, n) {
    for (let t = 0; t < 300; t++) {
      const busy = {}, day = new Array(pairs.length).fill(-1);
      let ok = true;
      for (const i of U.shuffle(pairs.map((p, k) => k))) {
        const [a, b] = pairs[i];
        let placed = false;
        for (let d = 0; d < n; d++) { if (busy[a + d] || busy[b + d]) continue; busy[a + d] = busy[b + d] = 1; day[i] = d; placed = true; break; }
        if (!placed) { ok = false; break; }
      }
      if (ok) return day;
    }
    return pairs.map((p, i) => i % n);
  }
  C.HOOKS.wcqDone = c => {
    const W = c.wc;
    const A = c.groups.filter(g => g.n[0] === 'A').map(g => C.sortTable(c, g.teams, g.tbl));
    const B = c.groups.filter(g => g.n[0] === 'B').map(g => C.sortTable(c, g.teams, g.tbl));
    const q = [];
    A.forEach(o => q.push(...o.slice(0, 4)));
    const po = [];
    A.forEach(o => po.push(...o.slice(4, 6)));
    B.forEach(o => po.push(o[0]));
    S().intl.wcQ = { W, q };
    const Y = W;
    const d = Cal.intlWindows(Y - 1)[2].days;
    const pc = mkComp({ id: `WCPO-${W}`, key: 'WCPO', type: 'cup', n: `${W} Dünya Kupası Avrupa Play-off`, sh: 'Play-off', season: Y - 1, poFor: W });
    C.koInit(pc, [{ n: 'Yarı Final', legs: 1, d: [d[0]] }, { n: 'Final', legs: 1, d: [d[1]] }]);
    pc.onRound = 'wcPO';
    const t = po.sort((a, b) => S().nats[code(b)].elo - S().nats[code(a)].elo).slice(0, 8);
    C.drawRound(pc, 0, [], { pairs: [[t[7], t[0]], [t[6], t[1]], [t[5], t[2]], [t[4], t[3]]] });
  };
  C.HOOKS.wcPO = (c, ri, winners) => {
    if (ri === 0) { C.drawRound(c, 1, [], { pairs: [[winners[1], winners[0]], [winners[3], winners[2]]] }); return false; }
    const W = c.poFor;
    const uefa = S().intl.wcQ.q.concat(winners);
    setupWC(W, uefa);
    c.done = true; c.win = winners[0];
    return false;
  };
  function setupWC(W, uefaQ) {
    if (S().comps[`WC-${W}`]) return;
    const hosts = WC_HOSTS[W] || [];
    const quota = { CONMEBOL: 7, CAF: 10, AFC: 9, CONCACAF: 5, OFC: 1 };
    const teams = uefaQ.slice();
    hosts.forEach(h => { if (!teams.includes(N(h))) teams.push(N(h)); });
    const uefaCount = teams.filter(t => CM.DB.nations[code(t)].conf === 'UEFA').length;
    for (const conf in quota) {
      const already = teams.filter(t => CM.DB.nations[code(t)].conf === conf).length;
      const cand = Object.keys(CM.DB.nations).filter(k => CM.DB.nations[k].conf === conf && !teams.includes(N(k)))
        .map(k => ({ k, v: S().nats[k].elo + U.gauss() * 60 })).sort((a, b) => b.v - a.v);
      cand.slice(0, Math.max(0, quota[conf] - already)).forEach(x => teams.push(N(x.k)));
    }
    void uefaCount;
    while (teams.length < 48) {
      const k = Object.keys(CM.DB.nations).filter(x => !teams.includes(N(x)) && x !== 'RUS').sort((a, b) => S().nats[b].elo - S().nats[a].elo)[0];
      teams.push(N(k));
    }
    const list = teams.slice(0, 48);
    const sorted = byElo(list.map(code)).map(N);
    const groups = [...Array(12)].map(() => []);
    hosts.slice(0, 12).forEach((h, i) => { if (list.includes(N(h))) groups[i].push(N(h)); });
    sorted.filter(t => !groups.some(g => g.includes(t))).forEach(t => {
      const conf = CM.DB.nations[code(t)].conf;
      const cands = groups.filter(g => g.length < 4).sort((a, b) => a.length - b.length);
      const g = cands.find(x => conf === 'UEFA' ? x.filter(y => CM.DB.nations[code(y)].conf === 'UEFA').length < 2 : !x.some(y => CM.DB.nations[code(y)].conf === conf)) || cands[0];
      g.push(t);
    });
    const d0 = U.day(W, 6, 13);
    const c = mkComp({ id: `WC-${W}`, key: 'WC', n: `FIFA Dünya Kupası ${W}`, sh: `Dünya Kupası ${W}`, neutral: true, onGroups: 'wcKO', season: W - 1, fin: true, suspKey: 'WC' });
    C.groupsInit(c, groups, 1, [d0, d0 + 5, d0 + 10]);
    CM.Game.news(`${W} Dünya Kupası kurası`, `48 takım 12 grupta mücadele edecek. Grup birincileri, ikincileri ve en iyi 8 üçüncü son 32 turuna kalacak.`, { type: 'world' });
  }
  C.HOOKS.wcKO = c => {
    const W = +c.id.split('-')[1];
    const g = c.groups.map(x => x.order);
    const thirds = c.groups.map(x => ({ t: x.order[2], r: x.tbl[x.order[2]] })).sort((a, b) => b.r[6] - a.r[6] || (b.r[4] - b.r[5]) - (a.r[4] - a.r[5])).slice(0, 8).map(x => x.t);
    const firsts = g.map(x => x[0]), seconds = g.map(x => x[1]);
    const d = U.day(W, 6, 29);
    C.koInit(c, [{ n: 'Son 32', legs: 1, d: [d], neutral: true }, { n: 'Son 16', legs: 1, d: [d + 5], neutral: true, fixedPairs: true },
      { n: 'Çeyrek Final', legs: 1, d: [d + 10], neutral: true, fixedPairs: true }, { n: 'Yarı Final', legs: 1, d: [d + 15], neutral: true, fixedPairs: true },
      { n: 'Final', legs: 1, d: [d + 21], neutral: true, fixedPairs: true }]);
    const pairs = [];
    for (let i = 0; i < 8; i++) pairs.push([thirds[i], firsts[i]]);
    pairs.push([seconds[0], firsts[8]], [seconds[1], firsts[9]], [seconds[2], firsts[10]], [seconds[3], firsts[11]]);
    for (let i = 4; i < 12; i += 2) pairs.push([seconds[i], seconds[i + 1]]);
    C.drawRound(c, 0, [], { pairs: U.shuffle(pairs) });
  };

  // ---------- Kıta turnuvaları (arka planda) ----------
  function bgTournament(id, n, conf, size, d0, season) {
    if (S().comps[id]) return;
    const guests = conf === 'CONMEBOL' ? Object.keys(CM.DB.nations).filter(k => CM.DB.nations[k].conf === 'CONCACAF') : [];
    let teams = Object.keys(CM.DB.nations).filter(k => CM.DB.nations[k].conf === conf);
    teams = byElo(teams).concat(byElo(guests)).slice(0, size);
    if (teams.length < 8) return;
    const ng = teams.length / 4;
    const groups = [...Array(ng)].map(() => []);
    teams.forEach((t, i) => { const pot = Math.floor(i / ng); groups[pot % 2 ? ng - 1 - (i % ng) : i % ng].push(N(t)); });
    const c = mkComp({ id, key: id.split('-')[0], n, sh: n, neutral: true, onGroups: 'bgKO', season, suspKey: 'CT' });
    C.groupsInit(c, groups, 1, [d0, d0 + 4, d0 + 8]);
  }
  C.HOOKS.bgKO = c => {
    const g = c.groups.map(x => x.order);
    const d = c.fx.reduce((m, f) => Math.max(m, f.d), 0) + 4;
    let pairs;
    if (g.length === 4) {
      C.koInit(c, [{ n: 'Çeyrek Final', legs: 1, d: [d], neutral: true }, { n: 'Yarı Final', legs: 1, d: [d + 4], neutral: true, fixedPairs: true }, { n: 'Final', legs: 1, d: [d + 8], neutral: true, fixedPairs: true }]);
      pairs = [[g[1][1], g[0][0]], [g[3][1], g[2][0]], [g[0][1], g[1][0]], [g[2][1], g[3][0]]];
    } else {
      C.koInit(c, [{ n: 'Yarı Final', legs: 1, d: [d], neutral: true }, { n: 'Final', legs: 1, d: [d + 4], neutral: true, fixedPairs: true }]);
      pairs = [[g[1][1], g[0][0]], [g[0][1], g[1][0]]];
    }
    C.drawRound(c, 0, [], { pairs });
  };

  // ---------- Günlük: davetler, kura tarihleri ----------
  function upcomingNatFixtures(from, to) {
    const s = S(), out = {};
    for (let d = from; d <= to; d++) (s.sched[d] || []).forEach(([cid, fid]) => {
      const c = s.comps[cid]; if (!c || !c.nat) return;
      const f = c.fx[fid]; if (!f) return;
      [f.h, f.a].forEach(t => { if (t && C.isNat(t)) { const k = code(t); out[k] = out[k] || { first: d, last: d }; out[k].last = Math.max(out[k].last, d); } });
    });
    return out;
  }
  function callUp(nc, until) {
    const s = S(), n = s.nats[nc];
    const pool = Object.values(s.players).filter(p => p.nat === nc && p.inj <= 7);
    const want = { GK: 3, D: 8, M: 8, F: 7 };
    const got = { GK: [], D: [], M: [], F: [] };
    pool.sort((a, b) => P.ovr(b) - P.ovr(a));
    pool.forEach(p => {
      const g = p.pos === 'GK' ? 'GK' : P.LINE[p.pos];
      if (got[g].length < want[g]) got[g].push(p);
    });
    let squad = [].concat(got.GK, got.D, got.M, got.F);
    pool.forEach(p => { if (squad.length < 26 && !squad.includes(p)) squad.push(p); });
    if (s.user && s.user.nat === nc && n.userSquad && n.userSquad.length >= 18) {
      squad = n.userSquad.map(id => s.players[id]).filter(p => p && p.inj <= 0);
    }
    n.squad = squad.map(p => p.id);
    squad.forEach(p => { if (!p.ntOnly) p.away = until; });
  }
  function daily(d) {
    const s = S();
    // Euro elemeleri kurası: 6 Aralık (Euro'dan iki yıl önce)
    const t = U.ymd(d);
    if (t.m === 12 && t.d === 6 && (t.y + 2) % 4 === 0 && !s.comps[`EUQ-${t.y}`]) setupEUQ(t.y);
    // 3 gün sonra başlayacak milli maçlar için davet
    const soon = upcomingNatFixtures(d + 3, d + 3);
    Object.keys(soon).forEach(nc => {
      const n = s.nats[nc];
      if (n.calledUntil && n.calledUntil >= d + 3) return;
      const range = upcomingNatFixtures(d + 3, d + 45);
      let last = range[nc] ? range[nc].last : d + 3;
      // Turnuvalarda (arka arkaya maçlar) takım elenene dek kadroda kalır
      n.calledUntil = last;
      callUp(nc, last);
      if (s.user && s.user.nat === nc) CM.Game.news('Milli takım kadrosu açıklandı', `${n.n} kadrosu maçlar için toplandı. Kadroyu Milli Takım ekranından inceleyebilirsiniz.`, { type: 'nat' });
      else if (s.user && s.user.club) {
        const mine = n.squad.filter(id => s.players[id].club === s.user.club);
        if (mine.length) CM.Game.news('Milli takım daveti', `${mine.map(id => s.players[id].n).join(', ')} ${n.n} milli takımına davet edildi.`, { type: 'squad' });
      }
    });
  }

  // Elo güncellemesi (milli maç sonrası)
  function onPlayed(c, f) {
    if (!C.isNat(f.h)) return;
    const s = S(), a = s.nats[code(f.h)], b = s.nats[code(f.a)];
    const exp = 1 / (1 + Math.pow(10, (b.elo - a.elo - (f.n ? 0 : 60)) / 400));
    const res = f.hg > f.ag ? 1 : f.hg === f.ag ? 0.5 : 0;
    const k = (c.fin ? 60 : 40) * (1 + Math.log(1 + Math.abs(f.hg - f.ag)) * 0.5);
    a.elo += k * (res - exp); b.elo -= k * (res - exp);
  }
  function onCompDone(c) {
    if (!c.nat) return;
    const s = S();
    if (c.win && C.isNat(c.win)) { const n = s.nats[code(c.win)]; (n.trophies = n.trophies || []).push({ s: c.season, n: c.n }); }
  }
  function ranking() { return Object.keys(S().nats).filter(k => k !== 'RUS').sort((a, b) => S().nats[b].elo - S().nats[a].elo); }

  CM.Intl = { setupSeason, daily, onPlayed, onCompDone, ranking, callUp, NL26_A, EURO_HOSTS, WC_HOSTS };
})(typeof window !== 'undefined' ? window : globalThis);
