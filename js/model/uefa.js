/* Uluslararası kulüp turnuvaları: UEFA Şampiyonlar Ligi / Avrupa Ligi / Konferans Ligi, UEFA Süper Kupa,
   FIFA Kıtalararası Kupa, AFC Şampiyonlar Ligi Elite, FIFA Kulüpler Dünya Kupası */
(function (G) {
  'use strict';
  const CM = G.CM, U = CM.U, C = CM.Comp, Cal = CM.Cal;
  const S = () => CM.S;
  const K = key => CM.World.clubByKey(key);

  // 2026-27 lig aşaması torbaları (gerçek kura torbaları)
  const FIRST = {
    UCL: [['PSG', 'BAY', 'RMA', 'LIV', 'INT', 'MCI', 'ARS', 'BAR', 'ATM'], ['BVB', 'ROM', 'SCP', 'AVL', 'FCP', 'MUN', 'BRU', 'BET', 'PSV'],
      ['FEY', 'LIL', 'BOD', 'NAP', 'RBL', 'VIL', 'SHA', 'GAL', 'FEN'], ['SLA', 'SLO', 'STU', 'LASK', 'COMO', 'LENS', 'SAB', 'VIK', 'AEK']],
    UEL: [['B04', 'SLB', 'JUV', 'MIL', 'OL', 'OM', 'AZ', 'OLY', 'RSO'], ['FER', 'PLZ', 'USG', 'DZG', 'RBS', 'CEL', 'SPA', 'REN', 'AND'],
      ['STG', 'LEC', 'CRY', 'BOU', 'SUN', 'CEJ', 'JAG', 'OMO', 'CEV'], ['TSG', 'BJK', 'TOR', 'HBS', 'NEC', 'OFI', 'LSK', 'LEV', 'ARA']],
    UECL: [['ATA', 'SCB', 'AJA', 'SCF', 'ASM', 'FCK'], ['FCM', 'CZV', 'GNT', 'PAO', 'PAF', 'BHA'], ['LUG', 'GET', 'KUP', 'TWE', 'LRI', 'BOR'],
      ['STV', 'BRN', 'HOM', 'KAI', 'TS', 'UCR'], ['RIG', 'HAJ', 'JAB', 'FCN', 'AGF', 'IES'], ['THU', 'CSK', 'KZA', 'MJA', 'IBE', 'EGN']]
  };
  const NAMES = { UCL: 'UEFA Şampiyonlar Ligi', UEL: 'UEFA Avrupa Ligi', UECL: 'UEFA Konferans Ligi' };
  const SHORT = { UCL: 'Şampiyonlar Ligi', UEL: 'Avrupa Ligi', UECL: 'Konferans Ligi' };
  // Para ödülleri (2024-27 dağıtım modeline yakın, €)
  const PRIZE = {
    UCL: { start: 18.62e6, win: 2.1e6, draw: 0.7e6, po: 1e6, r16: 11e6, qf: 12.5e6, sf: 15e6, f: 18.5e6, champ: 6.5e6 },
    UEL: { start: 4.31e6, win: 0.45e6, draw: 0.15e6, po: 0.3e6, r16: 1.75e6, qf: 3e6, sf: 4.5e6, f: 7e6, champ: 6e6 },
    UECL: { start: 3.17e6, win: 0.4e6, draw: 0.133e6, po: 0.2e6, r16: 0.8e6, qf: 1.3e6, sf: 2.5e6, f: 4e6, champ: 3e6 }
  };

  function coefTotal(obj) {
    if (!obj) return 0;
    const n = obj.seasons.length;
    return U.sum(obj.seasons.slice(-5)) + obj.legacy * Math.max(0, 5 - n) / 5;
  }
  const clubCoef = id => coefTotal(S().clubCoef[id]);
  function assocRank() {
    const s = S();
    return Object.keys(s.coef).filter(c => CM.DB.nations[c] && CM.DB.nations[c].conf === 'UEFA').sort((a, b) => coefTotal(s.coef[b]) - coefTotal(s.coef[a]));
  }

  // ---------- Sezon kurulumu ----------
  function setupSeason(Y, first) {
    const s = S();
    const d = Cal.uefaDates(Y);
    s.uefa = s.uefa || {};
    s.uefa[Y] = { pts: {} };
    // UEFA Süper Kupa
    let sup = first ? [K('PSG'), K('AVL')] : (s.uefaNext && s.uefaNext.sup);
    if (sup && sup[0] != null && sup[1] != null) {
      const c = C.create({ id: `USC-${Y}`, key: 'USC', type: 'cup', n: 'UEFA Süper Kupa', sh: 'Süper Kupa', suspKey: 'UEFA', ylim: 9, intl: true });
      C.singleInit(c, sup[0], sup[1], first ? U.day(2026, 8, 12) : d.sup, true);
      c.venue = first ? 'Red Bull Arena, Salzburg' : '';
    }
    if (first) {
      ['UCL', 'UEL', 'UECL'].forEach(k => {
        const pots = FIRST[k].map(pot => pot.map(K).filter(x => x != null));
        if (pots.every(p => p.length === pots[0].length)) buildLP(k, Y, pots);
      });
    } else if (s.uefaNext) {
      qualifying(Y, s.uefaNext);
    }
    // FIFA Kıtalararası Kupa (Aralık): Şampiyonlar Ligi sahibi vs diğer kıtaların temsilcisi
    const holder = first ? K('PSG') : (s.uefaNext && s.uefaNext.uclWin);
    const others = Object.values(s.clubs).filter(c => c.extra && ['CONMEBOL', 'CONCACAF', 'CAF', 'AFC'].includes(c.conf));
    if (holder != null && others.length) {
      const opp = U.weighted(others, c => Math.pow(c.rep, 3) * (c.conf === 'CONMEBOL' ? 2 : 1));
      const c = C.create({ id: `FIC-${Y}`, key: 'FIC', type: 'cup', n: 'FIFA Kıtalararası Kupa', sh: 'Kıtalararası', suspKey: 'FIFA', ylim: 9, intl: true });
      C.singleInit(c, opp.id, holder, U.day(Y, 12, 16), true);
    }
    setupACL(Y, first);
    if (Y === 2028) setupCWC(Y);
  }

  function buildLP(k, Y, pots) {
    const d = Cal.uefaDates(Y)[k.toLowerCase()];
    const c = C.create({ id: `${k}-${Y}`, key: k, type: 'swiss', n: NAMES[k], sh: SHORT[k], suspKey: 'UEFA', ylim: 3, intl: true, uefa: k, onSwiss: 'uefaKO', finalVenue: d.fv });
    C.swissInit(c, pots, pots.length === 4 ? 2 : 1, d.lp);
    c.teams.forEach(t => prize(t, k, 'start'));
    return c;
  }
  function prize(t, k, what) {
    const cl = S().clubs[t]; if (!cl) return;
    const v = PRIZE[k][what]; if (!v) return;
    cl.money += v; cl.fin.prize += v;
  }

  // Lig aşaması bitti -> eleme turları (UEFA'nın sabit eşleşme ağacı)
  C.HOOKS.uefaKO = c => {
    const Y = c.season, k = c.uefa, d = Cal.uefaDates(Y)[k.toLowerCase()];
    const r = c.lpRank;
    c.koStart = true;
    C.koInit(c, [
      { n: 'Play-off', legs: 2, d: d.po }, { n: 'Son 16', legs: 2, d: d.r16 }, { n: 'Çeyrek Final', legs: 2, d: d.qf, fixedPairs: true },
      { n: 'Yarı Final', legs: 2, d: d.sf, fixedPairs: true }, { n: 'Final', legs: 1, d: [d.f], neutral: true, fixedPairs: true }]);
    c.onRound = 'uefaRound';
    // Play-off: (9/10 - 23/24), (11/12 - 21/22), (13/14 - 19/20), (15/16 - 17/18); sıralaması yüksek olan rövanşı evinde oynar
    const pairs = [];
    const g = i => r[i - 1];
    [[9, 23], [11, 21], [13, 19], [15, 17]].forEach(([a, b]) => {
      const seeds = U.shuffle([g(a), g(a + 1)]), uns = U.shuffle([g(b), g(b + 1)]);
      pairs.push([uns[0], seeds[0]], [uns[1], seeds[1]]);
    });
    c.poOrder = pairs;
    C.drawRound(c, 0, [], { pairs });
    // Elenenler ve ilk 8 ödülleri
    r.slice(0, 8).forEach(t => prize(t, k, 'r16'));
    r.slice(8, 24).forEach(t => prize(t, k, 'po'));
  };
  C.HOOKS.uefaRound = (c, ri, winners) => {
    const k = c.uefa, r = c.lpRank;
    if (ri === 0) {
      // Son 16: 1/2 vs (15/16-17/18) galipleri, 3/4 vs (13/14-19/20), 5/6 vs (11/12-21/22), 7/8 vs (9/10-23/24)
      const w = winners; // sıra: [9/10-23/24]x2, [11/12-21/22]x2, [13/14-19/20]x2, [15/16-17/18]x2
      winners.forEach(t => prize(t, k, 'r16'));
      const top = [r[0], r[1], r[2], r[3], r[4], r[5], r[6], r[7]];
      const pick = (arr) => U.shuffle(arr.slice());
      const a = pick([top[0], top[1]]), b = pick([w[6], w[7]]);
      const c2 = pick([top[2], top[3]]), d2 = pick([w[4], w[5]]);
      const e = pick([top[4], top[5]]), f = pick([w[2], w[3]]);
      const g = pick([top[6], top[7]]), h = pick([w[0], w[1]]);
      // Ağaç sırası: (1/2) üst yarı ile (7/8) aynı yarıda değil -> klasik düzen
      const pairs = [[b[0], a[0]], [h[0], g[0]], [d2[0], c2[0]], [f[0], e[0]], [b[1], a[1]], [h[1], g[1]], [d2[1], c2[1]], [f[1], e[1]]];
      CM.Comp.drawRound(c, 1, [], { pairs });
      return false;
    }
    const stage = ['po', 'r16', 'qf', 'sf', 'f'][ri + 1];
    if (stage) winners.forEach(t => prize(t, k, stage));
  };

  // Ön eleme (Ağustos play-off turu): 2027-28'den itibaren
  function qualifying(Y, nx) {
    const d = Cal.uefaDates(Y);
    const mk = (k, ties, dd) => {
      const c = C.create({ id: `${k}Q-${Y}`, key: k + 'Q', type: 'cup', n: `${NAMES[k]} Play-off Turu`, sh: 'Ön Eleme', suspKey: 'UEFA', ylim: 3, intl: true, qFor: k });
      C.koInit(c, [{ n: 'Play-off Turu', legs: 2, d: dd }]);
      c.onRound = 'uefaQ';
      C.drawRound(c, 0, [], { pairs: ties });
      return c;
    };
    S().uefaQ = { Y, direct: nx.direct, lpDone: false };
    const seedPairs = list => {
      const sorted = list.slice().sort((a, b) => clubCoef(b) - clubCoef(a));
      const h = sorted.length / 2, seeds = U.shuffle(sorted.slice(0, h)), un = U.shuffle(sorted.slice(h));
      return seeds.map((t, i) => [un[i], t]);
    };
    const any = ['UCL', 'UEL', 'UECL'].some(k => nx.q[k].length >= 2);
    ['UCL', 'UEL', 'UECL'].forEach(k => {
      const q = nx.q[k];
      if (q.length >= 2) mk(k, seedPairs(q), k === 'UCL' ? d.qual : d.qual.map(x => x + 2));
    });
    if (!any) finishQualifying(Y);
  }
  C.HOOKS.uefaQ = (c, ri, winners) => {
    const q = S().uefaQ;
    const k = c.qFor;
    const losers = c.rounds[0].ties.map(t => t.l);
    q.direct[k] = q.direct[k].concat(winners);
    if (k === 'UCL') q.direct.UEL = q.direct.UEL.concat(losers);
    if (k === 'UEL') q.direct.UECL = q.direct.UECL.concat(losers);
    q.doneQ = (q.doneQ || 0) + 1;
    const need = ['UCL', 'UEL', 'UECL'].filter(x => S().comps[`${x}Q-${q.Y}`]).length;
    if (q.doneQ >= need) finishQualifying(q.Y);
  };
  function finishQualifying(Y) {
    const q = S().uefaQ;
    if (q.lpDone) return;
    q.lpDone = true;
    const used = new Set();
    const fill = (list, n, pool) => {
      let out = list.filter(t => { if (used.has(t)) return false; used.add(t); return true; });
      // Eksikse yedek havuzdan tamamla
      const extra = pool.filter(t => !used.has(t)).sort((a, b) => clubCoef(b) - clubCoef(a));
      while (out.length < n && extra.length) { const t = extra.shift(); used.add(t); out.push(t); }
      return out.slice(0, n);
    };
    const reserve = Object.values(S().clubs).filter(c => c.conf === 'UEFA' && (c.lg || c.extra)).map(c => c.id);
    const ucl = fill(q.direct.UCL, 36, reserve), uel = fill(q.direct.UEL, 36, reserve), uecl = fill(q.direct.UECL, 36, reserve);
    const pots = (list, n) => {
      const sorted = list.slice().sort((a, b) => clubCoef(b) - clubCoef(a));
      const sz = list.length / n, out = [];
      for (let i = 0; i < n; i++) out.push(sorted.slice(i * sz, (i + 1) * sz));
      return out;
    };
    buildLP('UCL', Y, pots(ucl, 4));
    buildLP('UEL', Y, pots(uel, 4));
    buildLP('UECL', Y, pots(uecl, 6));
    const u = S().user;
    if (u) ['UCL', 'UEL', 'UECL'].forEach(k => {
      if (S().comps[`${k}-${Y}`].teams.includes(u.club)) CM.Game.news(`${NAMES[k]} kurası çekildi`, `${S().clubs[u.club].n} lig aşamasında 8 farklı rakiple karşılaşacak. Fikstürünüzü Turnuvalar ekranından inceleyebilirsiniz.`, { type: 'comp' });
    });
  }
  function daily() {
    const q = S().uefaQ;
    if (q && !q.lpDone && S().day >= U.day(q.Y, 8, 28)) finishQualifying(q.Y);
  }

  // Maç başına katsayı ve ödül
  function onPlayed(c, f) {
    const s = S();
    const k = c.uefa || (c.qFor ? c.qFor : null);
    if (!k || c.qFor) {
      if (c.qFor) addPts(f, 0.5);
      return;
    }
    if (f.rnd === undefined) { // lig aşaması ödülleri
      if (f.hg > f.ag) prize(f.h, k, 'win'); else if (f.hg < f.ag) prize(f.a, k, 'win'); else { prize(f.h, k, 'draw'); prize(f.a, k, 'draw'); }
    }
    addPts(f, 1);
    void s;
  }
  function addPts(f, mul) {
    const s = S();
    const up = s.uefa && s.uefa[s.season];
    if (!up) return;
    const add = (t, v) => { up.pts[t] = (up.pts[t] || 0) + v * mul; };
    if (f.hg > f.ag) add(f.h, 2); else if (f.hg < f.ag) add(f.a, 2); else { add(f.h, 1); add(f.a, 1); }
  }

  function onCompDone(c) {
    if (c.uefa && c.win != null) {
      prize(c.win, c.uefa, 'champ');
      S().uefaWin = S().uefaWin || {};
      S().uefaWin[c.uefa] = c.win;
    }
  }

  // ---------- Sezon sonu: katsayılar ve gelecek sezon katılımcıları ----------
  function endSeason(Y) {
    const s = S();
    const up = (s.uefa && s.uefa[Y]) ? s.uefa[Y].pts : {};
    // Kulüp katsayıları
    const entered = {};
    ['UCL', 'UEL', 'UECL'].forEach(k => { const c = s.comps[`${k}-${Y}`]; if (c) c.teams.forEach(t => { entered[t] = k; }); });
    Object.keys(s.clubCoef).forEach(id => {
      const bonus = entered[id] === 'UCL' ? 6 : entered[id] === 'UEL' ? 3 : entered[id] === 'UECL' ? 1.5 : 0;
      s.clubCoef[id].seasons.push((up[id] || 0) + bonus);
      if (s.clubCoef[id].seasons.length > 5) s.clubCoef[id].seasons.shift();
    });
    // Ülke katsayıları: ülke kulüplerinin puan ortalaması
    const byCty = {};
    Object.keys(entered).forEach(id => { const cl = s.clubs[id]; if (!cl) return; (byCty[cl.cty] = byCty[cl.cty] || []).push((up[id] || 0) + (entered[id] === 'UCL' ? 6 : 0)); });
    const seasonPts = {};
    Object.keys(s.coef).forEach(cty => {
      const arr = byCty[cty];
      const v = arr ? U.sum(arr) / Math.max(4, arr.length) : Math.max(0, s.coef[cty].legacy / 5 * (0.6 + U.rand() * 0.6));
      seasonPts[cty] = v;
      s.coef[cty].seasons.push(v);
      if (s.coef[cty].seasons.length > 5) s.coef[cty].seasons.shift();
    });
    s.uefaNext = computeEntrants(Y, seasonPts);
  }

  // Modellenmeyen ülkeler için sezon sonucu (itibara ağırlıklı rastgele)
  function extraStandings(cty) {
    const list = Object.values(S().clubs).filter(c => c.extra && c.cty === cty);
    return list.map(c => ({ c, v: c.rep + U.gauss() * 10 })).sort((a, b) => b.v - a.v).map(x => x.c.id);
  }
  function access(r) {
    if (r <= 4) return { UCL: [1, 2, 3, 4], UEL: ['C', 5], UECLQ: [6] };
    if (r === 5) return { UCL: [1, 2, 3], UCLQ: [4], UEL: ['C', 5], UECLQ: [6] };
    if (r === 6) return { UCL: [1, 2], UCLQ: [3], UEL: ['C'], UELQ: [4], UECLQ: [5] };
    if (r <= 10) return { UCL: [1], UCLQ: [2], UEL: ['C'], UELQ: [3], UECLQ: [4] };
    if (r <= 15) return { UCLQ: [1, 2], UELQ: ['C'], UECLQ: [3, 4] };
    if (r <= 33) return { UCLQ: [1], UECLQ: ['C', 2, 3] };
    return { UCLQ: [1], UECLQ: ['C', 2] };
  }
  function computeEntrants(Y, seasonPts) {
    const s = S();
    const ranks = assocRank();
    const out = { direct: { UCL: [], UEL: [], UECL: [] }, q: { UCL: [], UEL: [], UECL: [] } };
    const taken = new Set();
    const put = (list, t) => { if (t != null && !taken.has(t)) { taken.add(t); list.push(t); return true; } return false; };
    // Kupa sahipleri
    const w = s.uefaWin || {};
    const uclW = w.UCL, uelW = w.UEL, ueclW = w.UECL;
    put(out.direct.UCL, uclW); put(out.direct.UCL, uelW); put(out.direct.UEL, ueclW);
    // Avrupa Performans Kontenjanı: sezonun en iyi 2 ülkesi
    const eps = Object.keys(seasonPts).filter(c => CM.COUNTRIES[c]).sort((a, b) => seasonPts[b] - seasonPts[a]).slice(0, 2);
    ranks.forEach((cty, i) => {
      const r = i + 1;
      const a = access(r);
      const playable = !!CM.COUNTRIES[cty];
      const st = playable ? (s.last[cty] ? s.last[cty].rank : []) : extraStandings(cty);
      if (!st || !st.length) return;
      const cupW = playable ? (s.last[cty] && s.last[cty].cup) : st[U.ri(0, Math.min(3, st.length - 1))];
      if (eps.includes(cty) && a.UCL) a.UCL = a.UCL.concat([a.UCL[a.UCL.length - 1] + 1]);
      let nextPos = 0;
      const byPos = p => { if (p === 'C') return cupW; return st[p - 1]; };
      const place = (list, p) => {
        let t = byPos(p);
        if (p === 'C' && (t == null || taken.has(t))) { // kupa galibi zaten katıldıysa sıradaki lig takımı
          t = st.find((x, k) => k >= nextPos && !taken.has(x));
        }
        if (typeof p === 'number') {
          nextPos = Math.max(nextPos, p);
          if (taken.has(t)) t = st.find((x, k) => k >= p && !taken.has(x));
        }
        put(list, t);
      };
      (a.UCL || []).forEach(p => place(out.direct.UCL, p));
      (a.UCLQ || []).forEach(p => place(out.q.UCL, p));
      (a.UEL || []).forEach(p => place(out.direct.UEL, p));
      (a.UELQ || []).forEach(p => place(out.q.UEL, p));
      (a.UECLQ || []).forEach(p => place(out.q.UECL, p));
    });
    // Ön eleme havuzlarını ihtiyaca göre ayarla
    const need = { UCL: 36 - out.direct.UCL.length, UEL: 36 - out.direct.UEL.length, UECL: 36 - out.direct.UECL.length };
    const trim = (k, next) => {
      const q = out.q[k].sort((x, y) => clubCoef(y) - clubCoef(x));
      const size = Math.max(0, Math.min(q.length - (q.length % 2), need[k] * 2));
      const keep = q.slice(0, size), rest = q.slice(size);
      out.q[k] = keep;
      if (next) out.q[next] = out.q[next].concat(rest);
      if (k === 'UCL') need.UEL -= keep.length / 2;
      if (k === 'UEL') need.UECL -= keep.length / 2;
    };
    trim('UCL', 'UEL'); trim('UEL', 'UECL'); trim('UECL', null);
    out.sup = uclW != null && uelW != null ? [uclW, uelW] : null;
    out.uclWin = uclW;
    return out;
  }

  // ---------- AFC Şampiyonlar Ligi Elite (Suudi kulüpleri için) ----------
  function setupACL(Y, first) {
    const s = S();
    const ksa = CM.World.leagueClubs('KSA1').map(id => s.clubs[id]);
    if (!ksa.length) return;
    let saudi;
    if (first) saudi = ['HIL', 'NAS', 'AHL', 'ITT'].map(K).filter(x => x != null);
    else {
      const r = s.last && s.last.KSA ? s.last.KSA.rank : [];
      saudi = r.slice(0, 3);
      const cw = s.last.KSA.cup; if (cw != null && !saudi.includes(cw)) saudi.push(cw); else if (r[3] != null) saudi.push(r[3]);
    }
    const pickExtra = (region, n) => {
      const list = Object.values(s.clubs).filter(c => c.extra && c.conf === 'AFC' && c.region === region);
      const out = [];
      U.shuffle(list).sort((a, b) => b.rep + U.gauss() * 6 - a.rep).slice(0, n).forEach(c => out.push(c.id));
      return out;
    };
    const west = saudi.concat(pickExtra('W', 12 - saudi.length)).slice(0, 12);
    const east = pickExtra('E', 12);
    if (west.length < 12 || east.length < 12) return;
    const c = C.create({ id: `ACL-${Y}`, key: 'ACL', type: 'swiss', n: 'AFC Şampiyonlar Ligi Elite', sh: 'ACL Elite', suspKey: 'AFC', ylim: 3, intl: true, afc: true, onSwiss: 'aclKO' });
    // Bölgesel lig aşaması: her takım kendi bölgesinden 8 farklı rakip (4 ev, 4 deplasman)
    c.teams = west.concat(east);
    c.tbl = {}; c.form = {}; c.teams.forEach(t => { c.tbl[t] = [0, 0, 0, 0, 0, 0, 0]; c.form[t] = []; });
    const dates = [U.day(Y, 9, 15), U.day(Y, 9, 29), U.day(Y, 10, 20), U.day(Y, 11, 3), U.day(Y, 11, 24), U.day(Y, 12, 8), U.day(Y + 1, 2, 9), U.day(Y + 1, 2, 16)];
    let left = 0;
    [west, east].forEach((reg, ri) => {
      const perm = U.shuffle(reg.slice());
      const pairs = [];
      for (let i = 0; i < 12; i++) for (let k = 1; k <= 4; k++) pairs.push([perm[i], perm[(i + k) % 12]]);
      // Euler yönlendirmesi zaten dengeli: i -> i+k ev sahibi (her takım 4 ev 4 deplasman)
      const days = scheduleACL(perm, pairs);
      pairs.forEach((p, i) => { C.addFx(c, { d: dates[days[i]] + ri, h: p[0], a: p[1], md: days[i] + 1, reg: ri }); left++; });
    });
    c.phase = 'swiss'; c.left = left; c.regions = [west, east];
  }
  function scheduleACL(teams, pairs) {
    // Basit tur ataması: açgözlü, başarısız olursa yeniden karıştır
    for (let t = 0; t < 200; t++) {
      const day = new Array(pairs.length).fill(-1), busy = {};
      const order = U.shuffle(pairs.map((p, i) => i));
      let ok = true;
      for (const i of order) {
        const [a, b] = pairs[i];
        let placed = false;
        for (let d = 0; d < 8; d++) {
          if (busy[a + '@' + d] || busy[b + '@' + d]) continue;
          busy[a + '@' + d] = busy[b + '@' + d] = true; day[i] = d; placed = true; break;
        }
        if (!placed) { ok = false; break; }
      }
      if (ok) return day;
    }
    return pairs.map((p, i) => i % 8);
  }
  C.HOOKS.aclKO = c => {
    const Y = c.season;
    const sortReg = reg => C.sortTable(c, reg);
    const w = sortReg(c.regions[0]).slice(0, 8), e = sortReg(c.regions[1]).slice(0, 8);
    c.lpRank = C.sortTable(c, c.teams);
    C.koInit(c, [
      { n: 'Son 16', legs: 2, d: [U.day(Y + 1, 3, 2), U.day(Y + 1, 3, 9)] },
      { n: 'Çeyrek Final', legs: 1, d: [U.day(Y + 1, 4, 17)], neutral: true, fixedPairs: true },
      { n: 'Yarı Final', legs: 1, d: [U.day(Y + 1, 4, 21)], neutral: true, fixedPairs: true },
      { n: 'Final', legs: 1, d: [U.day(Y + 1, 4, 25)], neutral: true, fixedPairs: true }]);
    c.venue = 'Cidde';
    const pairs = [];
    [w, e].forEach(r => { for (let i = 0; i < 4; i++) pairs.push([r[7 - i], r[i]]); });
    C.drawRound(c, 0, [], { pairs });
  };

  // ---------- FIFA Kulüpler Dünya Kupası 2029 (32 takım) ----------
  function setupCWC(Y) {
    const s = S();
    const uefa = [];
    const winners = [];
    ['UCL-2026', 'UCL-2027', 'UCL-2028'].forEach(id => { const h = (s.hist.UCL || []).find(x => 'UCL-' + x.s === id); if (h) winners.push(h.w); });
    winners.forEach(t => { if (!uefa.includes(t)) uefa.push(t); });
    const perCty = {};
    uefa.forEach(t => { const c = s.clubs[t]; perCty[c.cty] = (perCty[c.cty] || 0) + 1; });
    Object.keys(s.clubCoef).map(Number).filter(id => s.clubs[id] && s.clubs[id].conf === 'UEFA').sort((a, b) => clubCoef(b) - clubCoef(a)).forEach(id => {
      if (uefa.length >= 12 || uefa.includes(id)) return;
      const cty = s.clubs[id].cty;
      if ((perCty[cty] || 0) >= 2) return;
      perCty[cty] = (perCty[cty] || 0) + 1; uefa.push(id);
    });
    const others = [];
    const quota = { CONMEBOL: 6, AFC: 4, CAF: 4, CONCACAF: 5, OFC: 1 };
    for (const conf in quota) {
      const list = Object.values(s.clubs).filter(c => c.conf === conf || (conf === 'AFC' && c.cty === 'KSA' && c.lg)).sort((a, b) => b.rep - a.rep).slice(0, quota[conf]);
      list.forEach(c => others.push(c.id));
    }
    const all = uefa.concat(others).slice(0, 32);
    if (all.length < 32) return;
    const c = C.create({ id: `CWC-${Y}`, key: 'CWC', type: 'groups', n: 'FIFA Kulüpler Dünya Kupası', sh: 'Kulüpler DK', suspKey: 'FIFA', ylim: 3, intl: true, neutral: true, onGroups: 'cwcKO', keep: true, season: Y });
    const sorted = all.slice().sort((a, b) => C.tRep(b) - C.tRep(a));
    const groups = [...Array(8)].map(() => []);
    for (let pot = 0; pot < 4; pot++) U.shuffle(sorted.slice(pot * 8, pot * 8 + 8)).forEach((t, i) => groups[i].push(t));
    const d0 = U.day(Y + 1, 6, 15);
    C.groupsInit(c, groups, 1, [d0, d0 + 5, d0 + 10]);
  }
  C.HOOKS.cwcKO = c => {
    const d0 = U.day(c.season + 1, 6, 30);
    C.koInit(c, [{ n: 'Son 16', legs: 1, d: [d0], neutral: true }, { n: 'Çeyrek Final', legs: 1, d: [d0 + 5], neutral: true, fixedPairs: true },
      { n: 'Yarı Final', legs: 1, d: [d0 + 9], neutral: true, fixedPairs: true }, { n: 'Final', legs: 1, d: [d0 + 14], neutral: true, fixedPairs: true }]);
    const g = c.groups.map(x => x.order);
    const pairs = [];
    for (let i = 0; i < 8; i += 2) { pairs.push([g[i + 1][1], g[i][0]]); pairs.push([g[i][1], g[i + 1][0]]); }
    C.drawRound(c, 0, [], { pairs });
  };

  CM.UEFA = { setupSeason, onPlayed, onCompDone, endSeason, daily, clubCoef, coefTotal, assocRank, NAMES, SHORT, FIRST };
})(typeof window !== 'undefined' ? window : globalThis);
