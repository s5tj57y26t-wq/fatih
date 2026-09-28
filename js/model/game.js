/* Oyun döngüsü, yerel sezon kurulumu, sezon devri */
(function (G) {
  'use strict';
  const CM = G.CM, U = CM.U, P = CM.P, C = CM.Comp, Cal = CM.Cal;
  const S = () => CM.S;

  // ---------- Haberler ----------
  function news(t, b, o) {
    const s = S();
    s.news.unshift(Object.assign({ id: s.nextMsg++, day: s.day, t, b, read: false }, o || {}));
    if (s.news.length > 200) s.news.length = 200;
  }

  // ---------- Yerel sezon ----------
  function roundsOf(n, rr) { return (n - 1 + (n % 2)) * rr; }
  function setupLeague(lg, Y) {
    const L = CM.LEAGUES[lg];
    const teams = CM.World.leagueClubs(lg);
    if (teams.length < 4) return null;
    const reg = roundsOf(teams.length, L.rr);
    let splitRounds = 0;
    if (L.split) L.split.groups.forEach((g, i) => { splitRounds = Math.max(splitRounds, roundsOf(g, Array.isArray(L.split.rr) ? L.split.rr[i] : L.split.rr)); });
    const dates = Cal.leagueDates(lg, Y, reg + splitRounds);
    const c = C.create({ id: `${lg}-${Y}`, key: lg, type: 'league', n: L.n, sh: L.n, cty: L.cty, tier: L.tier, suspKey: L.cty + 'L', ylim: L.yl || 5, split: L.split || null });
    c.splitDates = dates.slice(reg);
    C.leagueInit(c, teams, L.rr, dates.slice(0, reg));
    return c;
  }

  function cupRoundNames(n, cty) {
    const tail = ['Final', 'Yarı Final', 'Çeyrek Final', 'Son 16'];
    const out = [];
    for (let i = 0; i < n; i++) {
      const fromEnd = n - 1 - i;
      if (fromEnd < tail.length) out.push(tail[fromEnd]);
      else out.push(cty === 'TUR' ? `${5 - (n - tail.length - 1 - i)}. Eleme Turu` : `${i + 1}. Tur`);
    }
    return out;
  }
  function cupEntrants(cty, lcup) {
    const lgs = CM.COUNTRIES[cty].leagues;
    let teams = [];
    lgs.forEach(l => { teams = teams.concat(CM.World.leagueClubs(l)); });
    const pool = Object.values(S().clubs).filter(c => c.cty === cty && c.pool && !c.lg).map(c => c.id);
    teams = teams.concat(pool);
    const tierOf = id => { const c = S().clubs[id]; return c.lg ? CM.LEAGUES[c.lg].tier : 3; };
    teams.sort((a, b) => tierOf(a) - tierOf(b) || S().clubs[b].rep - S().clubs[a].rep);
    return teams;
  }
  function setupCup(cty, Y, which) {
    const K = CM.COUNTRIES[cty];
    const cfg = which === 'lcup' ? K.lcup : K.cup;
    if (!cfg) return null;
    const teams = cupEntrants(cty, which === 'lcup');
    if (teams.length < 4) return null;
    const size = Math.pow(2, Math.ceil(Math.log2(teams.length)));
    const nR = Math.round(Math.log2(size));
    const fd = Cal.md(Y + 1, cfg.final);
    const dates = Cal.cupDates(fd, Y, nR, cfg.sfLegs);
    const names = cupRoundNames(nR, cty);
    const id = `${cty}${which === 'lcup' ? 'LC' : 'C'}-${Y}`;
    const c = C.create({ id, key: cty + (which === 'lcup' ? 'LC' : 'C'), type: 'cup', n: cfg.n, sh: cfg.sh, cty, suspKey: cty + 'C', ylim: 3, venue: cfg.venue });
    C.koInit(c, names.map((n, i) => ({ n, legs: (i === nR - 2 && cfg.sfLegs === 2) ? 2 : 1, d: dates[i], neutral: i === nR - 1 || (cty === 'ENG' && which !== 'lcup' && i === nR - 2) })));
    // Bay geçenler: üst lig ve itibar sırasına göre
    const byes = size - teams.length;
    const seeds = teams.slice(0, byes), rest = U.shuffle(teams.slice(byes));
    const pairs = seeds.map(t => [t, null]);
    for (let i = 0; i + 1 < rest.length; i += 2) pairs.push([rest[i], rest[i + 1]]);
    C.drawRound(c, 0, [], { pairs });
    return c;
  }
  function setupSuper(cty, Y, list) {
    const K = CM.COUNTRIES[cty];
    if (!K.sup || !list || list.length < 2) return;
    const d = K.sup.when === 'aug' ? Cal.nth(Y, 8, 6, 1) : Cal.nth(Y + 1, 1, 3, 1);
    const c = C.create({ id: `${cty}S-${Y}`, key: cty + 'S', type: 'cup', n: K.sup.n, sh: 'Süper Kupa', cty, suspKey: cty + 'S', ylim: 9 });
    if (K.sup.size === 4 && list.length >= 4) {
      C.koInit(c, [{ n: 'Yarı Final', legs: 1, d: [d], neutral: true }, { n: 'Final', legs: 1, d: [d + 3], neutral: true }]);
      C.drawRound(c, 0, [], { pairs: [[list[0], list[1]], [list[2], list[3]]] });
    } else C.singleInit(c, list[0], list[1], d, true);
  }

  function setupSeason(Y, first) {
    const s = S();
    s.season = Y;
    s.seasonComps = [];
    for (const lg in CM.LEAGUES) { const c = setupLeague(lg, Y); if (c) s.seasonComps.push(c.id); }
    for (const cty in CM.COUNTRIES) {
      const cc = setupCup(cty, Y, 'cup'); if (cc) s.seasonComps.push(cc.id);
      if (CM.COUNTRIES[cty].lcup) { const lc = setupCup(cty, Y, 'lcup'); if (lc) s.seasonComps.push(lc.id); }
      if (!first && s.last && s.last[cty]) setupSuper(cty, Y, s.last[cty].sup);
    }
    if (first) {
      // 2026 Turkcell Süper Kupa: 2025-26 lig şampiyonu/ikincisi ve kupa finalistleri (gerçek katılımcılar)
      const k = key => CM.World.clubByKey(key);
      const list = ['GAL', 'FEN', 'TS', 'KON'].map(k).filter(x => x != null);
      if (list.length === 4) setupSuper('TUR', Y, list);
    }
    CM.UEFA && CM.UEFA.setupSeason(Y, first);
    CM.Intl && CM.Intl.setupSeason(Y, first);
    Object.values(s.comps).forEach(c => { if (c.season === Y && !s.seasonComps.includes(c.id)) s.seasonComps.push(c.id); });
  }

  // ---------- Turnuva bitişleri ----------
  const PRIZE_LEAGUE = { ENG: 3e6, ESP: 1.5e6, GER: 1.4e6, ITA: 1.3e6, FRA: 0.8e6, TUR: 0.5e6 };
  function onCompDone(c) {
    const s = S();
    if (!s.hist[c.key]) s.hist[c.key] = [];
    if (c.win != null) {
      s.hist[c.key].push({ s: c.season, w: c.win, r: c.ru });
      const o = C.tObj(c.win);
      if (o) (o.trophies = o.trophies || []).push({ s: c.season, k: c.key, n: c.n });
    }
    if (c.type === 'league' && c.rank) {
      const L = CM.LEAGUES[c.key];
      const base = (PRIZE_LEAGUE[L.cty] || 0.2e6) * (L.tier === 1 ? 1 : 0.3);
      c.rank.forEach((t, i) => { const cl = s.clubs[t]; const pr = U.roundMoney(base * (c.rank.length - i)); cl.money += pr; cl.fin.prize += pr; });
      schedulePlayoffs(c);
    }
    CM.UEFA && CM.UEFA.onCompDone && CM.UEFA.onCompDone(c);
    CM.Intl && CM.Intl.onCompDone && CM.Intl.onCompDone(c);
    const u = s.user;
    if (u && c.win != null && (c.win === u.club || c.win === 'N:' + u.nat)) {
      news(`🏆 ${c.n} ŞAMPİYONU!`, `Tebrikler! ${C.tName(c.win)} ${c.n} kupasını kazandı! Taraftarlar sokaklarda kutlama yapıyor.`, { type: 'trophy' });
      u.trophies = u.trophies || []; u.trophies.push({ s: c.season, n: c.n });
      if (c.win === u.club) u.conf = U.clamp(u.conf + (c.type === 'league' ? 25 : 12), 0, 100);
    } else if (c.win != null && (c.type === 'league' || /UCL|UEL|UECL|WC|EURO/.test(c.key))) {
      news(`${c.n}: ${C.tName(c.win)} şampiyon`, `${C.tName(c.win)}, ${c.season}/${String(c.season + 1).slice(2)} ${c.n} şampiyonu oldu.`, { type: 'world' });
    }
  }

  // Terfi / düşme play-off'ları
  function poComp(id, n, cty, rounds) {
    const c = C.create({ id, key: id.split('-')[0], type: 'cup', n, sh: 'Play-off', cty, suspKey: cty + 'PO', ylim: 9 });
    C.koInit(c, rounds);
    return c;
  }
  function schedulePlayoffs(c) {
    const L = CM.LEAGUES[c.key];
    const Y = c.season;
    const endD = c.fx.reduce((m, f) => Math.max(m, f.d), 0);
    const r = c.rank, n = r.length;
    const po = S().po = S().po || {};
    // 2. lig play-off'u
    if (L.po) {
      const t = r.slice(L.po.from - 1, L.po.to);
      if (t.length === 4) {
        const pc = poComp(`${c.key}PO-${Y}`, `${L.n} Play-off`, L.cty, [
          { n: 'Yarı Final', legs: L.po.legs, d: [endD + 4, endD + 8] },
          { n: 'Final', legs: c.key === 'ESP2' ? 2 : 1, d: c.key === 'ESP2' ? [endD + 12, endD + 16] : [endD + 14], neutral: c.key !== 'ESP2', fixedPairs: true }]);
        C.drawRound(pc, 0, [], { pairs: [[t[3], t[0]], [t[2], t[1]]] });
      } else if (t.length === 6) {
        const pc = poComp(`${c.key}PO-${Y}`, `${L.n} Play-off`, L.cty, [
          { n: 'Ön Eleme', legs: 1, d: [endD + 4] },
          { n: 'Yarı Final', legs: 2, d: [endD + 8, endD + 12] },
          { n: 'Final', legs: 2, d: [endD + 16, endD + 20], fixedPairs: true }]);
        pc.poSeeds = [t[0], t[1]];
        pc.onRound = 'poSix';
        C.drawRound(pc, 0, [], { pairs: [[t[4], t[3]], [t[5], t[2]]] });
      }
    }
    // Üst ligin baraj oyuncusu (relPO): alt ligde karşı taraf yoksa havuzdan bir kulüp
    if (L.relPO && L.tier === 1 && !CM.LEAGUES[L.cty + '2']) {
      const loser = r[n - L.rel - 1];
      const pool = Object.values(S().clubs).filter(x => x.pool === L.pool && !x.lg);
      if (loser != null && pool.length) {
        const opp = U.weighted(pool, x => x.rep).id;
        const pc = poComp(`${c.key}RP-${Y}`, `${L.n} Baraj`, L.cty, [{ n: 'Baraj', legs: 2, d: [endD + 5, endD + 9] }]);
        C.drawRound(pc, 0, [], { pairs: [[opp, loser]] });
        po[pc.id] = { up: 'pool', lg: c.key };
      }
    }
    // Almanya: Bundesliga 16. vs 2. Bundesliga 3.; Fransa: Ligue 1 16. vs Ligue 2 play-off galibi
    if (L.tier === 2 && L.upPO) {
      const topC = S().comps[`${L.up}-${Y}`];
      if (topC && topC.done) makeUpDownPO(topC, c, endD);
      else po.waitUp = po.waitUp || {}, po.waitUp[L.up] = c.id;
    }
    if (L.tier === 1 && L.relPO && CM.LEAGUES[L.cty + '2']) {
      const low = S().comps[`${L.cty}2-${Y}`];
      if (low && low.done) makeUpDownPO(c, low, Math.max(endD, low.fx.reduce((m, f) => Math.max(m, f.d), 0)));
    }
  }
  function makeUpDownPO(topC, lowC, endD) {
    const Y = topC.season;
    const id = `${topC.key}RP-${Y}`;
    if (S().comps[id]) return;
    const L = CM.LEAGUES[topC.key];
    const hi = topC.rank[topC.rank.length - L.rel - 1];
    const lo = lowC.rank[2];
    const pc = poComp(id, `${L.n} Baraj`, L.cty, [{ n: 'Baraj', legs: 2, d: [endD + 5, endD + 9] }]);
    C.drawRound(pc, 0, [], { pairs: [[lo, hi]] });
    S().po[id] = { up: lowC.key, lg: topC.key };
  }
  C.HOOKS.poSix = (c, ri, winners) => {
    if (ri === 0) { CM.Comp.drawRound(c, 1, [], { pairs: [[winners[0], c.poSeeds[1]], [winners[1], c.poSeeds[0]]] }); return false; }
  };

  // ---------- Sezon devri (1 Temmuz) ----------
  function rollover() {
    const s = S(), Y = s.season;
    CM.Market && CM.Market.returnLoans && CM.Market.returnLoans();
    const last = s.last = {};
    const moves = [];
    for (const cty in CM.COUNTRIES) {
      const K = CM.COUNTRIES[cty];
      const t1 = s.comps[`${K.leagues[0]}-${Y}`];
      const t2 = K.leagues[1] ? s.comps[`${K.leagues[1]}-${Y}`] : null;
      const cup = s.comps[`${cty}C-${Y}`];
      last[cty] = { rank: t1 && t1.rank ? t1.rank.slice() : [], cup: cup && cup.win, cupRu: cup && cup.ru };
      const L1 = CM.LEAGUES[K.leagues[0]];
      const r1 = t1 && t1.rank ? t1.rank : [];
      // Süper kupa katılımcıları
      const sup = [];
      if (r1.length) {
        if (K.sup && K.sup.size === 4) {
          sup.push(r1[0], r1[1]);
          if (cup && cup.win != null && !sup.includes(cup.win)) sup.push(cup.win); else sup.push(r1[2]);
          if (cup && cup.ru != null && !sup.includes(cup.ru)) sup.push(cup.ru); else sup.push(r1.find(x => !sup.includes(x)));
        } else {
          sup.push(r1[0]);
          sup.push(cup && cup.win != null && cup.win !== r1[0] ? cup.win : r1[1]);
        }
      }
      last[cty].sup = sup;
      if (!r1.length) continue;
      // Düşenler / çıkanlar
      let down = r1.slice(r1.length - L1.rel);
      let up = [];
      const rp = s.comps[`${K.leagues[0]}RP-${Y}`];
      if (t2 && t2.rank) {
        const L2 = CM.LEAGUES[K.leagues[1]];
        up = t2.rank.slice(0, L2.promo);
        const po = s.comps[`${K.leagues[1]}PO-${Y}`];
        if (po && po.win != null) up.push(po.win);
        if (rp && rp.win != null) {
          const topSide = rp.rounds[0].ties[0].b;
          if (rp.win !== topSide) { down.push(topSide); up.push(rp.win); }
        }
        // 2. ligden havuza düşenler
        const d2 = t2.rank.slice(t2.rank.length - L2.rel);
        const pool2 = Object.values(s.clubs).filter(x => x.pool === L2.pool && !x.lg);
        const up2 = U.shuffle(pool2.slice()).sort((a, b) => b.rep - a.rep + U.gauss() * 8).slice(0, d2.length);
        d2.forEach(id => moves.push([id, null, L2.pool]));
        up2.forEach(x => moves.push([x.id, K.leagues[1], null]));
      } else {
        if (rp && rp.win != null) {
          const topSide = rp.rounds[0].ties[0].b;
          if (rp.win !== topSide) { down.push(topSide); up.push(rp.win); }
        }
        const pool = Object.values(s.clubs).filter(x => x.pool === L1.pool && !x.lg && !up.includes(x.id));
        const need = down.length - up.length;
        U.shuffle(pool).sort((a, b) => b.rep - a.rep + U.gauss() * 8).slice(0, need).forEach(x => up.push(x.id));
      }
      down.forEach(id => moves.push([id, t2 ? K.leagues[1] : null, t2 ? null : L1.pool]));
      up.forEach(id => moves.push([id, K.leagues[0], null]));
      // Belçika 2026-27 geçişi gibi takım sayısı değişiklikleri için: çıkan = düşen sayısı korunur
      last[cty].down = down; last[cty].up = up;
    }
    moves.forEach(([id, lg, pool]) => {
      const c = s.clubs[id]; if (!c) return;
      const wasTop = c.lg && CM.LEAGUES[c.lg].tier === 1;
      c.lg = lg; c.pool = lg ? null : pool;
      if (lg) c.wf = CM.LEAGUES[lg].wf; else c.wf = 0.2;
      if (!lg) c.rep = Math.max(35, c.rep - 4); else if (CM.LEAGUES[lg].tier === 1 && !wasTop) c.rep = Math.max(c.rep, 55);
      if (s.user && id === s.user.club) {
        news(lg && CM.LEAGUES[lg].tier === 1 ? 'TERFİ!' : 'Küme düştük', lg && CM.LEAGUES[lg].tier === 1 ? `${c.n} gelecek sezon ${CM.LEAGUES[lg].n}'de mücadele edecek!` : `${c.n} gelecek sezon ${lg ? CM.LEAGUES[lg].n : 'alt ligde'} oynayacak.`);
      }
    });
    // Kulüp geçmişi ve itibar
    for (const lg in CM.LEAGUES) {
      const c = s.comps[`${lg}-${Y}`];
      if (!c || !c.rank) continue;
      c.rank.forEach((id, i) => {
        const cl = s.clubs[id];
        cl.hist.push({ s: Y, lg, pos: i + 1, pts: c.tbl[id][6] });
        const n = c.rank.length;
        cl.rep = U.clamp(Math.round(cl.rep + (CM.LEAGUES[lg].tier === 1 ? ((n / 2 - i) / n) * 3 : ((n / 2 - i) / n) * 1.5)), 30, 97);
      });
    }
    CM.UEFA && CM.UEFA.endSeason(Y);
    CM.Market && CM.Market.endSeason(Y);
    // Eski sezon turnuvalarını hafızadan temizle (geçmiş kayıtları hist'te)
    const keepFrom = Y;
    Object.keys(s.comps).forEach(id => { const c = s.comps[id]; if (c.season < keepFrom && (!c.keep || c.done)) delete s.comps[id]; });
    Object.keys(s.sched).forEach(d => { if (+d < s.day) delete s.sched[d]; });
    Object.values(s.players).forEach(p => { p.st = {}; p.sus = {}; p.yc = {}; });
    setupSeason(Y + 1, false);
    news(`${Y + 1}/${String(Y + 2).slice(2)} sezonu başlıyor`, `Yeni sezonun fikstürleri açıklandı. Yaz transfer dönemi 1 Eylül'e kadar açık.`, { type: 'season' });
    CM.Market && CM.Market.boardNewSeason && CM.Market.boardNewSeason();
  }

  // ---------- Günlük döngü ----------
  function userFixtureOn(d) {
    const s = S(), u = s.user;
    const list = s.sched[d] || [];
    for (const [cid, fid] of list) {
      const f = s.comps[cid] && s.comps[cid].fx[fid];
      if (!f || f.hg !== null || f.h === null || f.a === null) continue;
      if (f.h === u.club || f.a === u.club) return f;
      if (u.nat && (f.h === 'N:' + u.nat || f.a === 'N:' + u.nat)) return f;
    }
    return null;
  }
  function playDay(d, skipUser) {
    const s = S();
    const list = (s.sched[d] || []).slice();
    for (const [cid, fid] of list) {
      const c = s.comps[cid]; if (!c) continue;
      const f = c.fx[fid];
      if (!f || f.hg !== null || f.h === null || f.a === null) continue;
      if (skipUser && (f.h === s.user.club || f.a === s.user.club || (s.user.nat && (f.h === 'N:' + s.user.nat || f.a === 'N:' + s.user.nat)))) continue;
      CM.Sim.play(f);
    }
  }
  function daily(d) {
    const s = S();
    for (const id in s.players) {
      const p = s.players[id];
      if (p.inj > 0) { p.inj--; if (p.inj === 0 && s.user && p.club === s.user.club) news('Sakatlık sona erdi', `${p.n} sakatlığını atlattı ve seçilebilir durumda.`, { type: 'squad' }); }
      if (p.cond < 100) p.cond = Math.min(100, p.cond + 6 + p.a.day * 0.25);
      if (p.away && p.away < d) p.away = 0;
    }
  }
  function processDay(d) {
    const s = S();
    playDay(d, false);
    daily(d);
    const t = U.ymd(d);
    if (t.w === 1) CM.Market && CM.Market.weekly(d);
    CM.Intl && CM.Intl.daily && CM.Intl.daily(d);
    CM.UEFA && CM.UEFA.daily && CM.UEFA.daily(d);
    CM.Market && CM.Market.daily && CM.Market.daily(d);
    s.day = d + 1;
    if (t.m === 6 && t.d === 30) rollover();
  }

  // Kullanıcı "Devam"a bastığında: bir sonraki kullanıcı maçına ya da haftanın başına kadar ilerle
  function advance() {
    const s = S();
    const start = s.day;
    // Transfer döneminde oyun 2'şer gün ilerler (teklifler ve pazarlıklar için zaman kalsın)
    const win = s.user.club != null && CM.Market && CM.Market.isWindow(s.day);
    for (let guard = 0; guard < 60; guard++) {
      if (win && s.day - start >= 2) break;
      const f = userFixtureOn(s.day);
      if (f) return { type: 'match', f };
      const before = s.news.length ? s.news[0].id : 0;
      processDay(s.day);
      const urgent = s.news.find(n => n.id > before && n.urgent);
      if (urgent) return { type: 'news', n: urgent };
      if (U.ymd(s.day).w === 1 && s.day - start >= 1) break;
    }
    const u = s.user;
    if (u.club == null && !(u.offers || []).length && U.rand() < 0.4) {
      const last = u.history.length ? s.clubs[Object.keys(s.clubs).find(id => s.clubs[id].n === u.history[u.history.length - 1].club)] : null;
      CM.Market.jobOffers(last ? last.rep - 6 : 55);
      return { type: 'jobless' };
    }
    return { type: 'week' };
  }
  // Kullanıcı maçı bittikten sonra
  function userMatchDone(f, m) {
    CM.Sim.apply(f, m);
    const s = S();
    playDay(s.day, true);
    daily(s.day);
    const t = U.ymd(s.day);
    if (t.w === 1) CM.Market && CM.Market.weekly(s.day);
    CM.Intl && CM.Intl.daily && CM.Intl.daily(s.day);
    CM.UEFA && CM.UEFA.daily && CM.UEFA.daily(s.day);
    CM.Market && CM.Market.daily && CM.Market.daily(s.day);
    s.day++;
    if (t.m === 6 && t.d === 30) rollover();
  }

  function afterMatch(f, m) {
    const s = S(), u = s.user;
    if (!u) return;
    const mine = f.h === u.club || f.a === u.club;
    const mineN = u.nat && (f.h === 'N:' + u.nat || f.a === 'N:' + u.nat);
    if (!mine && !mineN) return;
    const side = m.sides[(f.h === u.club || f.h === 'N:' + u.nat) ? 0 : 1];
    Object.keys(side.ps).forEach(id => {
      const p = s.players[id];
      if (!p) return;
      if (p._newInj) { news('Sakatlık', `${p.n} maçta sakatlandı (${p.injN}). Tahmini dönüş süresi: ${Math.max(1, Math.round(p.inj / 7))} hafta.`, { type: 'squad' }); delete p._newInj; }
      if (p._ycBan) { news('Kart cezası', `${p.n} sarı kart sınırına ulaştı ve bir maç cezalı.`, { type: 'squad' }); delete p._ycBan; }
      if (side.ps[id].rc) news('Kırmızı kart', `${p.n} gördüğü kırmızı kart nedeniyle cezalı duruma düştü.`, { type: 'squad' });
    });
    if (mine) CM.Market && CM.Market.boardAfterMatch && CM.Market.boardAfterMatch(f, m);
  }

  function newGame(o) {
    CM.U.R.s = (Date.now() ^ 0x5bd1e995) >>> 0;
    CM.World.build(2026);
    const s = S();
    const clubId = typeof o.club === 'string' ? CM.World.clubByKey(o.club) : o.club;
    s.user = { name: o.name || 'Menajer', club: clubId, nat: o.nat || null, conf: 60, confNT: 60, trophies: [], history: [], started: s.day };
    setupSeason(2026, true);
    CM.Market && CM.Market.initUser && CM.Market.initUser();
    return s;
  }

  // Kullanıcının sıradaki maçları
  function upcoming(team, n) {
    const s = S(), out = [];
    const days = Object.keys(s.sched).map(Number).filter(d => d >= s.day).sort((a, b) => a - b);
    for (const d of days) {
      for (const [cid, fid] of s.sched[d]) {
        const f = s.comps[cid] && s.comps[cid].fx[fid];
        if (f && f.hg === null && (f.h === team || f.a === team)) out.push(f);
      }
      if (out.length >= n) break;
    }
    return out.slice(0, n);
  }
  function results(team, n) {
    const s = S(), out = [];
    Object.values(s.comps).forEach(c => c.fx.forEach(f => { if (f.hg !== null && (f.h === team || f.a === team)) out.push(f); }));
    return out.sort((a, b) => b.d - a.d).slice(0, n);
  }

  CM.Game = { news, setupSeason, onCompDone, advance, userMatchDone, afterMatch, newGame, processDay, userFixtureOn, rollover, upcoming, results, cupRoundNames };
})(typeof window !== 'undefined' ? window : globalThis);
