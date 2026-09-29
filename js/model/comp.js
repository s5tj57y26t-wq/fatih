/* Turnuva motoru: lig, eleme, grup + eleme, İsviçre sistemi (UEFA lig aşaması) */
(function (G) {
  'use strict';
  const CM = G.CM, U = CM.U;

  // ---------- Takım yardımcıları (kulüp: sayı, milli takım: 'N:KOD') ----------
  const isNat = t => typeof t === 'string' && t.startsWith('N:');
  function tObj(t) { return isNat(t) ? CM.S.nats[t.slice(2)] : CM.S.clubs[t]; }
  function tName(t) { const o = tObj(t); return o ? o.n : '?'; }
  function tShort(t) { const o = tObj(t); return o ? (o.sh || o.n.slice(0, 3).toUpperCase()) : '?'; }
  function tCountry(t) { return isNat(t) ? t.slice(2) : (CM.S.clubs[t] || {}).cty; }
  function tRep(t) { const o = tObj(t); return o ? (o.rep || o.str || 50) : 50; }

  // ---------- Oluşturma ve fikstür ----------
  function create(cfg) {
    const c = Object.assign({
      id: cfg.id, type: 'league', n: cfg.n, sh: cfg.sh || cfg.n, season: CM.S.season, cty: null, suspKey: cfg.id, ylim: 5,
      teams: [], fx: [], tbl: {}, rounds: [], groups: [], ri: 0, done: false, win: null, ru: null, rank: null, prize: null
    }, cfg);
    CM.S.comps[c.id] = c;
    return c;
  }

  function addFx(c, o) {
    const f = Object.assign({ id: c.fx.length, c: c.id, d: 0, h: null, a: null, hg: null, ag: null, et: false, ph: null, pa: null, n: false }, o);
    c.fx.push(f);
    sched(f);
    return f;
  }
  function sched(f) {
    const S = CM.S;
    (S.sched[f.d] = S.sched[f.d] || []).push([f.c, f.id]);
  }

  // Dairesel yöntemle tek devre (ev/deplasman dengeli)
  function roundRobin(teams, r) {
    const t = teams.slice();
    if (t.length % 2) t.push(null);
    U.shuffle(t, r);
    const n = t.length, rounds = [];
    for (let k = 0; k < n - 1; k++) {
      const w = [];
      for (let i = 0; i < n / 2; i++) {
        const a = t[i], b = t[n - 1 - i];
        if (a === null || b === null) continue;
        w.push((k + i) % 2 === 0 ? [a, b] : [b, a]);
      }
      rounds.push(w);
      t.splice(1, 0, t.pop());
    }
    return rounds;
  }
  // n devre: çift devrelerde ev/deplasman ters çevrilir
  function multiRR(teams, times) {
    const base = roundRobin(teams);
    let out = [];
    for (let k = 0; k < times; k++) out = out.concat(base.map(w => w.map(m => (k % 2 ? [m[1], m[0]] : m))));
    return out;
  }

  // ---------- LİG ----------
  function blankRow() { return [0, 0, 0, 0, 0, 0, 0]; } // O G B M AG YG P
  function leagueInit(c, teams, rr, dates) {
    c.teams = teams.slice();
    c.tbl = {}; teams.forEach(t => { c.tbl[t] = blankRow(); });
    c.form = {}; teams.forEach(t => { c.form[t] = []; });
    const rounds = multiRR(teams, rr);
    c.regRounds = rounds.length;
    rounds.forEach((w, i) => { const d = dates[Math.min(i, dates.length - 1)]; w.forEach(m => addFx(c, { d, h: m[0], a: m[1], rd: i + 1 })); });
    c.phase = 'reg';
    c.left = c.fx.length;
  }
  function applyRow(c, t, gf, ga) {
    const r = c.tbl[t]; if (!r) return;
    r[0]++; r[4] += gf; r[5] += ga;
    if (gf > ga) { r[1]++; r[6] += 3; } else if (gf === ga) { r[2]++; r[6] += 1; } else r[3]++;
    const f = c.form[t]; if (f) { f.push(gf > ga ? 'G' : gf === ga ? 'B' : 'M'); if (f.length > 5) f.shift(); }
  }
  function sortTable(c, ids, tbl) {
    tbl = tbl || c.tbl;
    // Aynı puanda: averaj, atılan gol (basitleştirilmiş; ikili averaj uygulanmaz)
    return ids.slice().sort((a, b) => {
      const x = tbl[a], y = tbl[b];
      return y[6] - x[6] || (y[4] - y[5]) - (x[4] - x[5]) || y[4] - x[4] || tName(a).localeCompare(tName(b), 'tr');
    });
  }
  function standings(c) {
    if (c.phase === 'split' || c.phase === 'done') {
      if (c.splitGroups) return [].concat(...c.splitGroups.map(g => sortTable(c, g)));
    }
    return sortTable(c, c.teams);
  }
  function leaguePlayed(c, f) {
    applyRow(c, f.h, f.hg, f.ag); applyRow(c, f.a, f.ag, f.hg);
    c.left--;
    if (c.left > 0) return;
    // Bölünme (Avusturya, Danimarka, İskoçya, İsviçre, Çekya, Yunanistan, Sırbistan)
    if (c.phase === 'reg' && c.split) {
      const order = sortTable(c, c.teams);
      c.splitGroups = [];
      let i = 0;
      c.split.groups.forEach(sz => { c.splitGroups.push(order.slice(i, i + sz)); i += sz; });
      if (c.split.halve) c.teams.forEach(t => { c.tbl[t][6] = Math.ceil(c.tbl[t][6] / 2); });
      const dates = c.splitDates;
      c.splitGroups.forEach((g, gi) => {
        const rounds = multiRR(g, Array.isArray(c.split.rr) ? c.split.rr[gi] : c.split.rr);
        rounds.forEach((w, k) => w.forEach(m => addFx(c, { d: dates[Math.min(k, dates.length - 1)], h: m[0], a: m[1], rd: c.regRounds + k + 1, sg: 1 })));
        c.left += rounds.reduce((s, w) => s + w.length, 0);
      });
      c.phase = 'split';
      if (c.left > 0) return;
    }
    c.phase = 'done';
    c.done = true;
    c.rank = standings(c);
    c.win = c.rank[0]; c.ru = c.rank[1];
    CM.Game && CM.Game.onCompDone(c);
  }

  // ---------- ELEME ----------
  // rounds: [{n:'Çeyrek Final', legs:1|2, d:[gün1, gün2], neutral:bool}]
  function koInit(c, rounds) {
    c.rounds = rounds.map(r => Object.assign({ ties: [], legs: 1, neutral: false }, r));
    c.ri = -1;
  }
  // Tur kurası: takımları eşleştir (seeded: ilk yarı seribaşı, aynı ülke eşleşmesinden kaçın)
  function drawRound(c, ri, teams, opts) {
    opts = opts || {};
    const R = c.rounds[ri];
    c.ri = ri;
    let list = teams.slice();
    let pairs = [];
    if (opts.pairs) pairs = opts.pairs;
    else if (opts.seeded) {
      const s = list.slice(0, list.length / 2), u = U.shuffle(list.slice(list.length / 2));
      U.shuffle(s);
      if (opts.avoid) fixCountry(s, u);
      pairs = s.map((t, i) => opts.seedHome === false ? [u[i], t] : [u[i], t]);
    } else {
      U.shuffle(list);
      for (let i = 0; i + 1 < list.length; i += 2) pairs.push([list[i], list[i + 1]]);
    }
    R.ties = pairs.map((p, k) => ({ a: p[0], b: p[1], fx: [], w: null, k }));
    R.ties.forEach(tie => {
      if (tie.b === null || tie.b === undefined) { tie.w = tie.a; return; } // bay geçen
      if (tie.a === null) { tie.w = tie.b; return; }
      const f1 = addFx(c, { d: R.d[0], h: tie.a, a: tie.b, rnd: ri, tie: tie.k, leg: R.legs === 2 ? 1 : 0, n: R.neutral && R.legs === 1 });
      tie.fx.push(f1.id);
      if (R.legs === 2) { const f2 = addFx(c, { d: R.d[1], h: tie.b, a: tie.a, rnd: ri, tie: tie.k, leg: 2 }); tie.fx.push(f2.id); }
    });
    checkRoundDone(c, ri);
  }
  function fixCountry(seeds, unseeds) {
    for (let i = 0; i < seeds.length; i++) {
      if (tCountry(seeds[i]) !== tCountry(unseeds[i])) continue;
      for (let j = 0; j < unseeds.length; j++) {
        if (j === i) continue;
        if (tCountry(seeds[i]) !== tCountry(unseeds[j]) && tCountry(seeds[j]) !== tCountry(unseeds[i])) {
          const t = unseeds[i]; unseeds[i] = unseeds[j]; unseeds[j] = t; break;
        }
      }
    }
  }
  // İkinci maç öncesi toplam skor (ilk maç ev sahibi = tie.a)
  function aggBefore(c, f) {
    if (f.leg !== 2) return null;
    const R = c.rounds[f.rnd], tie = R.ties[f.tie];
    const f1 = c.fx[tie.fx[0]];
    // f: ev = tie.b, deplasman = tie.a -> ev sahibinin ilk maçta attığı = f1.ag
    return [f1.ag, f1.hg];
  }
  function koPlayed(c, f) {
    const R = c.rounds[f.rnd], tie = R.ties[f.tie];
    const fs = tie.fx.map(id => c.fx[id]);
    if (fs.some(x => x.hg === null)) return;
    let ga = 0, gb = 0;
    fs.forEach(x => { if (x.h === tie.a) { ga += x.hg; gb += x.ag; } else { ga += x.ag; gb += x.hg; } });
    tie.ga = ga; tie.gb = gb;
    if (ga !== gb) tie.w = ga > gb ? tie.a : tie.b;
    else {
      const last = fs[fs.length - 1];
      const pw = last.ph > last.pa ? last.h : last.a;
      tie.w = pw;
    }
    tie.l = tie.w === tie.a ? tie.b : tie.a;
    checkRoundDone(c, f.rnd);
  }
  function checkRoundDone(c, ri) {
    const R = c.rounds[ri];
    if (!R.ties.length || R.ties.some(t => t.w === null)) return;
    R.done = true;
    const winners = R.ties.map(t => t.w);
    if (c.onRound) { if (CM.Comp.HOOKS[c.onRound](c, ri, winners) === false) return; }
    if (ri + 1 < c.rounds.length) {
      const next = c.rounds[ri + 1];
      if (next.fixedPairs) drawRound(c, ri + 1, winners, { pairs: pairFixed(winners) });
      else drawRound(c, ri + 1, winners, {});
    } else {
      c.done = true;
      c.win = winners[0];
      const lt = R.ties[0];
      c.ru = lt ? lt.l : null;
      CM.Game && CM.Game.onCompDone(c);
    }
  }
  function pairFixed(w) { const p = []; for (let i = 0; i + 1 < w.length; i += 2) p.push([w[i], w[i + 1]]); return p; }

  // ---------- GRUPLAR (turnuvalar, eleme grupları) ----------
  function groupsInit(c, groups, rr, dates, names) {
    c.groups = groups.map((g, i) => {
      const tbl = {}; g.forEach(t => { tbl[t] = blankRow(); });
      const rounds = multiRR(g, rr);
      rounds.forEach((w, k) => w.forEach(m => addFx(c, { d: dates[Math.min(k, dates.length - 1)], h: m[0], a: m[1], g: i, n: !!c.neutral })));
      return { n: names ? names[i] : String.fromCharCode(65 + i), teams: g.slice(), tbl, left: rounds.reduce((s, w) => s + w.length, 0) };
    });
    c.phase = 'grp';
  }
  function groupPlayed(c, f) {
    const g = c.groups[f.g];
    const tbl = g.tbl;
    [[f.h, f.hg, f.ag], [f.a, f.ag, f.hg]].forEach(([t, x, y]) => {
      const r = tbl[t]; r[0]++; r[4] += x; r[5] += y;
      if (x > y) { r[1]++; r[6] += 3; } else if (x === y) { r[2]++; r[6]++; } else r[3]++;
    });
    g.left--;
    if (c.groups.some(x => x.left > 0)) return;
    c.phase = 'ko';
    c.groups.forEach(x => { x.order = sortTable(c, x.teams, x.tbl); });
    if (c.onGroups) CM.Comp.HOOKS[c.onGroups](c);
  }

  // ---------- İSVİÇRE SİSTEMİ (UEFA lig aşaması) ----------
  // pots: [[...9],[...9],[...9],[...9]] -> her takım her torbadan 2 rakip (1 ev 1 deplasman)
  // pots(6x6) + perPot:1 -> Konferans Ligi: her torbadan 1 rakip, 6 maç
  function swissInit(c, pots, perPot, mdDates) {
    c.teams = [].concat(...pots);
    c.tbl = {}; c.teams.forEach(t => { c.tbl[t] = blankRow(); });
    c.form = {}; c.teams.forEach(t => { c.form[t] = []; });
    let pairs = null;
    for (let attempt = 0; attempt < 300 && !pairs; attempt++) pairs = perPot === 2 ? swissPairs2(pots, attempt < 250) : swissPairs1(pots, attempt < 250);
    const days = scheduleRounds(c.teams, pairs, mdDates.length);
    pairs.forEach((p, i) => addFx(c, { d: mdDates[days[i]], h: p[0], a: p[1], md: days[i] + 1 }));
    c.phase = 'swiss';
    c.left = pairs.length;
  }
  function sameCty(a, b) { return tCountry(a) === tCountry(b); }
  function swissPairs2(pots, strict) {
    const pairs = [];
    const P = pots.length;
    for (let i = 0; i < P; i++) {
      for (let j = i; j < P; j++) {
        const A = pots[i], B = pots[j], n = A.length;
        if (i === j) {
          // Aynı torba: rastgele döngü -> her takım 1 ev 1 deplasman
          let ok = false;
          for (let t = 0; t < 200 && !ok; t++) {
            const perm = U.shuffle(A.slice());
            ok = true;
            for (let k = 0; k < n; k++) if (strict && sameCty(perm[k], perm[(k + 1) % n])) { ok = false; break; }
            if (ok) for (let k = 0; k < n; k++) pairs.push([perm[k], perm[(k + 1) % n]]);
          }
          if (!ok) return null;
        } else {
          let ok = false;
          for (let t = 0; t < 400 && !ok; t++) {
            const s = U.shuffle([...Array(n).keys()]), u = U.shuffle([...Array(n).keys()]);
            ok = true;
            for (let k = 0; k < n; k++) {
              if (s[k] === u[k]) { ok = false; break; }
              if (strict && (sameCty(A[k], B[s[k]]) || sameCty(A[k], B[u[k]]))) { ok = false; break; }
            }
            if (ok) for (let k = 0; k < n; k++) { pairs.push([A[k], B[s[k]]]); pairs.push([B[u[k]], A[k]]); }
          }
          if (!ok) return null;
        }
      }
    }
    return pairs;
  }
  function swissPairs1(pots, strict) {
    const pairs = [];
    const P = pots.length;
    const home = {};
    for (let i = 0; i < P; i++) {
      for (let j = i; j < P; j++) {
        const A = pots[i], B = pots[j], n = A.length;
        let ok = false;
        for (let t = 0; t < 400 && !ok; t++) {
          ok = true;
          if (i === j) {
            const perm = U.shuffle(A.slice());
            for (let k = 0; k < n; k += 2) if (strict && sameCty(perm[k], perm[k + 1])) { ok = false; break; }
            if (ok) for (let k = 0; k < n; k += 2) pairs.push([perm[k], perm[k + 1]]);
          } else {
            const s = U.shuffle([...Array(n).keys()]);
            for (let k = 0; k < n; k++) if (strict && sameCty(A[k], B[s[k]])) { ok = false; break; }
            if (ok) for (let k = 0; k < n; k++) pairs.push([A[k], B[s[k]]]);
          }
        }
        if (!ok) return null;
      }
    }
    // Ev/deplasman dengesi: çift dereceli grafikte Euler devresi boyunca yönlendirme -> herkes 3 ev 3 deplasman
    orientEuler(pairs);
    return pairs;
  }
  function orientEuler(pairs) {
    const adj = {};
    pairs.forEach((p, i) => { (adj[p[0]] = adj[p[0]] || []).push(i); (adj[p[1]] = adj[p[1]] || []).push(i); });
    const used = new Array(pairs.length).fill(false);
    const ptr = {};
    for (const start in adj) {
      // Hierholzer: her kenarı yürüdüğümüz yönde (ev -> deplasman) yönlendir
      const stack = [[start, -1]];
      while (stack.length) {
        const [v] = stack[stack.length - 1];
        const list = adj[v];
        let i = ptr[v] || 0;
        while (i < list.length && used[list[i]]) i++;
        ptr[v] = i;
        if (i === list.length) { stack.pop(); continue; }
        const e = list[i]; used[e] = true;
        const p = pairs[e];
        const other = String(p[0]) === String(v) ? p[1] : p[0];
        if (String(p[0]) !== String(v)) p.reverse();
        stack.push([other, e]);
      }
    }
  }
  // Her takımın her maç gününde tek maçı olacak şekilde maçları günlere dağıt
  function scheduleRounds(teams, pairs, rounds) {
    for (let attempt = 0; attempt < 60; attempt++) {
      const day = new Array(pairs.length).fill(-1);
      let remaining = pairs.map((p, i) => i);
      let ok = true;
      for (let r = 0; r < rounds && ok; r++) {
        const m = perfectMatching(teams, remaining.map(i => pairs[i]), remaining);
        if (!m) { ok = false; break; }
        m.forEach(i => { day[i] = r; });
        const set = new Set(m);
        remaining = remaining.filter(i => !set.has(i));
      }
      if (ok && remaining.length === 0) return day;
    }
    // Olmazsa sırayla dağıt (çok nadir)
    return pairs.map((p, i) => i % rounds);
  }
  function perfectMatching(teams, edges, idx) {
    const adj = {};
    teams.forEach(t => { adj[t] = []; });
    edges.forEach((e, k) => { adj[e[0]].push([e[1], idx[k]]); adj[e[1]].push([e[0], idx[k]]); });
    for (const t in adj) U.shuffle(adj[t]);
    const used = new Set(), chosen = [];
    let steps = 0;
    const order = teams.slice().sort((a, b) => adj[a].length - adj[b].length);
    function rec() {
      if (++steps > 20000) return false;
      let t = null;
      for (const x of order) if (!used.has(x)) { t = x; break; }
      if (t === null) return true;
      used.add(t);
      for (const [o, ei] of adj[t]) {
        if (used.has(o)) continue;
        used.add(o); chosen.push(ei);
        if (rec()) return true;
        used.delete(o); chosen.pop();
      }
      used.delete(t);
      return false;
    }
    return rec() ? chosen.slice() : null;
  }
  function swissPlayed(c, f) {
    applyRow(c, f.h, f.hg, f.ag); applyRow(c, f.a, f.ag, f.hg);
    c.left--;
    if (c.left > 0) return;
    c.phase = 'ko';
    c.lpRank = sortTable(c, c.teams);
    if (c.onSwiss) CM.Comp.HOOKS[c.onSwiss](c);
  }

  // ---------- Ortak sonuç işleyici ----------
  function played(c, f) {
    if (f.rnd !== undefined) koPlayed(c, f);
    else if (f.g !== undefined) groupPlayed(c, f);
    else if (c.type === 'swiss') swissPlayed(c, f);
    else leaguePlayed(c, f);
  }

  // Tek maçlık final/süper kupa
  function singleInit(c, a, b, d, neutral) {
    koInit(c, [{ n: 'Final', legs: 1, d: [d], neutral: neutral !== false }]);
    drawRound(c, 0, [a, b], { pairs: [[a, b]] });
  }

  CM.Comp = {
    HOOKS: {}, isNat, tObj, tName, tShort, tCountry, tRep,
    create, addFx, sched, roundRobin, multiRR, leagueInit, standings, sortTable, koInit, drawRound, aggBefore,
    groupsInit, swissInit, played, singleInit, pairFixed
  };
})(typeof window !== 'undefined' ? window : globalThis);
