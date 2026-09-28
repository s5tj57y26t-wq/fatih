/* Maç yürütme: kadro seçimi, maç oynatma, sonuçların oyunculara/kulüplere işlenmesi */
(function (G) {
  'use strict';
  const CM = G.CM, U = CM.U, P = CM.P, E = CM.E, C = CM.Comp;

  const INJ = [
    ['Baldır zorlanması', 4, 10], ['Ayak bileği burkulması', 5, 14], ['Hamstring sakatlığı', 10, 28], ['Kasık ağrısı', 6, 18],
    ['Diz ezilmesi', 3, 9], ['Adale yırtığı', 14, 35], ['Menisküs yırtığı', 35, 70], ['Omuz çıkığı', 20, 40],
    ['Kırık kaburga', 21, 35], ['Ön çapraz bağ kopması', 180, 270], ['Aşil tendonu sakatlığı', 60, 120], ['Darbe', 1, 4]
  ];
  function rollInjury() {
    const w = [16, 16, 14, 12, 14, 8, 4, 3, 3, 1.2, 1, 12];
    const i = U.weighted(INJ.map((x, k) => k), k => w[k]);
    const x = INJ[i];
    return { n: x[0], days: U.ri(x[1], x[2]) };
  }

  // nat: milli maç (kulüpten ayrılmış oyuncular ve yalnızca milli takımda görünenler seçilebilir)
  function avail(p, key, day, nat) {
    if (p.inj > 0 || p.sus[key] > 0) return false;
    if (nat) return true;
    return !(p.away && p.away >= day) && !p.ntOnly;
  }

  // Otomatik kadro: dizilişe göre en iyi 11 ve 9 yedek
  function autoLineup(team, players, form, key, day, nat) {
    const slots = E.FORMATIONS[form] || E.FORMATIONS['4-4-2'];
    const ps = players.filter(p => avail(p, key, day, nat));
    const used = new Set(), xi = [];
    const cache = {};
    const score = (p, pos) => {
      const k = p.id + pos;
      let v = cache[k];
      if (v === undefined) v = cache[k] = P.slotRating(p, pos) * (0.62 + 0.0038 * Math.min(100, p.cond));
      return v;
    };
    // Önce kaleci ve kritik mevkiler (en az aday olan mevkiler önce doldurulsun)
    const order = slots.map((s, i) => i).sort((a, b) => (slots[a] === 'GK' ? -1 : 0) - (slots[b] === 'GK' ? -1 : 0));
    const res = new Array(slots.length).fill(null);
    order.forEach(i => {
      const pos = slots[i];
      let best = null, bs = -1;
      for (const p of ps) { if (used.has(p.id)) continue; const s = score(p, pos); if (s > bs) { bs = s; best = p; } }
      if (best) { used.add(best.id); res[i] = best.id; }
    });
    res.forEach(x => { if (x != null) xi.push(x); });
    const rest = ps.filter(p => !used.has(p.id)).sort((a, b) => P.ovr(b) - P.ovr(a));
    const subs = [];
    const gk = rest.find(p => p.pos === 'GK'); if (gk) subs.push(gk.id);
    rest.forEach(p => { if (subs.length < 9 && !subs.includes(p.id)) subs.push(p.id); });
    void team;
    return { xi: res.filter(x => x != null), subs };
  }

  // Kulüp/milli takım için maç tarafı nesnesi
  function sideOf(t, f, comp, userSide) {
    const nat = C.isNat(t);
    const o = C.tObj(t);
    const key = comp.suspKey;
    let players, tactic;
    if (nat) players = (o.squad || []).map(id => CM.S.players[id]).filter(Boolean);
    else players = o.players.map(id => CM.S.players[id]).filter(Boolean).filter(p => !(p.away && p.away >= f.d));
    const isUser = userSide;
    if (isUser && o.tactic.xi && o.tactic.xi.length) {
      tactic = Object.assign({}, o.tactic);
      const ok = new Set(players.filter(p => avail(p, key, f.d, nat)).map(p => p.id));
      if (tactic.xi.filter(id => ok.has(id)).length < 11) {
        const auto = autoLineup(o, players, tactic.form, key, f.d, nat);
        tactic.xi = tactic.xi.map((id, i) => ok.has(id) ? id : null);
        const pool = auto.xi.concat(auto.subs).filter(id => !tactic.xi.includes(id));
        tactic.xi = tactic.xi.map(id => id != null ? id : pool.shift()).filter(x => x != null);
      }
      tactic.subs = (tactic.subs || []).filter(id => ok.has(id) && !tactic.xi.includes(id));
      if (tactic.subs.length < 5) players.filter(p => ok.has(p.id) && !tactic.xi.includes(p.id) && !tactic.subs.includes(p.id)).sort((a, b) => P.ovr(b) - P.ovr(a)).forEach(p => { if (tactic.subs.length < 9) tactic.subs.push(p.id); });
    } else {
      const opp = C.tObj(f.h === t ? f.a : f.h);
      tactic = Object.assign({}, o.tactic);
      const diff = strengthOf(o) - strengthOf(opp);
      tactic.ment = diff > 6 ? 'hucum' : diff > -3 ? 'dengeli' : diff > -8 ? 'kontra' : 'savunma';
      const lu = autoLineup(o, players, tactic.form, key, f.d, nat);
      tactic.xi = lu.xi; tactic.subs = lu.subs;
      tactic.pk = null;
    }
    return { id: t, n: o.n, sh: o.sh || C.tShort(t), c1: o.c1, c2: o.c2, players, tactic };
  }

  // Takım gücü (en iyi 14 oyuncunun ortalaması) - önbellekli
  function strengthOf(o) {
    if (!o) return 60;
    if (o._str && o._strDay === CM.S.day) return o._str;
    const ids = o.squad || o.players || [];
    const vals = ids.map(id => CM.S.players[id]).filter(p => p && p.inj <= 0).map(P.ovr).sort((a, b) => b - a).slice(0, 14);
    o._str = vals.length ? U.avg(vals) : (o.str || 55);
    o._strDay = CM.S.day;
    return o._str;
  }

  function matchOpts(f, c) {
    const o = { neutral: !!f.n, quiet: true };
    if (f.rnd !== undefined) {
      const R = c.rounds[f.rnd];
      if (R.legs === 1) o.ko = true;
      else if (f.leg === 2) { o.ko = true; o.agg = C.aggBefore(c, f); }
    }
    return o;
  }

  function trainBonus(t) {
    if (C.isNat(t)) return 1;
    const cl = CM.S.clubs[t];
    return cl && cl.trainB ? cl.trainB : 1;
  }

  // Maçı oluştur (kullanıcı maçı için de kullanılır)
  function build(f, userIdx) {
    const c = CM.S.comps[f.c];
    const h = sideOf(f.h, f, c, userIdx === 0), a = sideOf(f.a, f, c, userIdx === 1);
    const o = matchOpts(f, c);
    o.userSide = userIdx === undefined ? -1 : userIdx;
    o.trainBonus = [trainBonus(f.h), trainBonus(f.a)];
    if (userIdx !== undefined && userIdx >= 0) o.quiet = false;
    return new E.Match(h, a, o);
  }

  function play(f) {
    const m = build(f);
    forfeitCheck(m);
    m.runToEnd();
    apply(f, m);
    return m;
  }
  // 7'den az oyuncuyla sahaya çıkamayan takım hükmen 0-3 yenik sayılır
  function forfeitCheck(m) {
    const short = m.sides.map(s => s.on.length < 7);
    if (!short[0] && !short[1]) return false;
    m.sides[0].st.g = short[0] ? 0 : 3; m.sides[1].st.g = short[1] ? 0 : 3;
    if (short[0] && short[1]) m.sides[0].st.g = m.sides[1].st.g = 0;
    m.minute = 90; m.finished = true; m.forfeit = true;
    m.events.push({ min: 0, type: 'end', side: -1, text: 'Maç oynanamadı: takımlardan biri yeterli oyuncu çıkaramadı, hükmen sonuç.' });
    m.finalize();
    return true;
  }

  // Sonuçları işle
  function apply(f, m) {
    const S = CM.S, c = S.comps[f.c];
    const r = m.result;
    f.hg = r.hg; f.ag = r.ag; f.et = r.et; f.ph = r.ph; f.pa = r.pa;
    f.sc = [];
    m.sides.forEach(s => s.scorers.forEach(x => f.sc.push([x.id, x.min, s.idx, x.pen ? 1 : 0])));
    f.cards = [];
    f.st = m.sides.map(s => [s.st.poss, s.st.sh, s.st.ot, s.st.co, s.st.fo, s.st.yc, s.st.rc]);
    const key = c.suspKey, ylim = c.ylim || 5;
    const nt = C.isNat(f.h);
    m.sides.forEach(s => {
      const o = m.sides[1 - s.idx];
      const res = s.st.g > o.st.g ? 1 : s.st.g === o.st.g ? 0 : -1;
      const teamPlayers = nt ? (C.tObj(s.id).squad || []) : C.tObj(s.id).players;
      const inMatch = new Set(Object.keys(s.ps).map(Number));
      teamPlayers.forEach(id => {
        const p = S.players[id]; if (!p) return;
        const ps = s.ps[id];
        if (ps && (ps.mins > 0 || ps.started)) {
          const st = p.st[f.c] || (p.st[f.c] = [0, 0, 0, 0, 0]);
          st[0]++; st[1] += ps.g; st[2] += ps.a; if (ps.rating) { st[3] += ps.rating; st[4]++; }
          CM.X && CM.X.onPlayer(p, ps, nt ? null : C.tObj(s.id));
          if (nt) { p.ntCaps++; p.ntGoals += ps.g; }
          p.cond = Math.round(ps.cond != null ? ps.cond : p.cond);
          p.mor = U.clamp(p.mor + res * 4 + (ps.rating >= 7.5 ? 3 : ps.rating && ps.rating < 6 ? -2 : 0), 5, 100);
          p.lastPlay = f.d;
          if (ps.rc) { p.sus[key] = (p.sus[key] || 0) + (U.rand() < 0.7 ? 1 : U.ri(2, 3)); f.cards.push([id, 'r']); }
          else if (ps.yc) {
            p.yc[key] = (p.yc[key] || 0) + ps.yc;
            if (p.yc[key] >= ylim) { p.sus[key] = (p.sus[key] || 0) + 1; p.yc[key] = 0; p._ycBan = true; }
            f.cards.push([id, 'y']);
          }
          if (ps.inj) { const j = rollInjury(); p.inj = j.days; p.injN = j.n; p._newInj = true; }
        } else if (!inMatch.has(id)) {
          if (p.sus[key] > 0) p.sus[key]--;
        }
      });
      // Kulüp formu ve maç geliri
      if (!nt) {
        const cl = C.tObj(s.id);
        if (s.idx === 0 && !f.n) {
          const gate = U.roundMoney((cl.cap || 15000) * (0.55 + 0.4 * Math.min(1, cl.rep / 90)) * (cl.tix || 25) * (c.type === 'league' ? 1 : 1.3));
          cl.money += gate; cl.fin.gate += gate;
        }
      }
    });
    // Kullanıcı oyuncularına ait bildirimler
    CM.X && CM.X.onMatch(f, m);
    CM.Game && CM.Game.afterMatch && CM.Game.afterMatch(f, m);
    if (c.intl && !c.nat) CM.UEFA.onPlayed(c, f);
    if (c.nat) CM.Intl.onPlayed(c, f);
    C.played(c, f);
  }

  CM.Sim = { forfeitCheck, avail, autoLineup, sideOf, strengthOf, build, play, apply, rollInjury, matchOpts };
})(typeof window !== 'undefined' ? window : globalThis);
