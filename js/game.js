/* Oyun dünyası: kulüpler, oyuncular, fikstür, transfer, finans, sezon */
(function (G) {
  'use strict';
  const D = G.D, E = G.E;
  const SAVE_KEY = 'cm0102_save_v1';
  const MAX_SQUAD = 32, MIN_SQUAD = 16;

  let S = null; // oyun durumu

  // ---------- Oyuncular ----------
  function valueOf(p) {
    const o = E.ovr(p);
    let v = 900 * Math.pow(1.128, o);
    const age = p.age;
    v *= age <= 20 ? 1.4 : age <= 24 ? 1.25 : age <= 28 ? 1 : age <= 30 ? 0.75 : age <= 32 ? 0.5 : 0.28;
    if (age <= 23 && p.pot > o) v *= 1 + (p.pot - o) / 40;
    if (p.contract <= 1) v *= 0.8;
    return roundMoney(v);
  }
  function wageFor(p) { return Math.max(1000, roundMoney(valueOf(p) * 0.0021 + 400, 250)); }
  function roundMoney(v, step) {
    step = step || (v > 1e6 ? 25000 : v > 1e5 ? 5000 : 500);
    return Math.max(0, Math.round(v / step) * step);
  }

  function genName(foreignChance) {
    if (D.rand() < foreignChance) {
      const f = D.pick(D.FOREIGN);
      return { name: D.pick(f[1]) + ' ' + D.pick(f[2]), nat: f[0] };
    }
    return { name: D.pick(D.FIRST_NAMES) + ' ' + D.pick(D.LAST_NAMES), nat: 'TUR' };
  }

  function genPlayer(pos, quality, age, teamId) {
    const n = genName(quality > 12 ? 0.3 : 0.15);
    age = age || D.randInt(18, 33);
    const attrs = {};
    const w = D.WEIGHTS[pos];
    D.ATTRS.forEach(a => {
      let base = quality + D.gauss() * 3;
      if (w[a]) base += 1 + w[a] * 0.35; else base -= 3.5;
      if (a === 'kalecilik' && pos !== 'GK') base = D.randInt(1, 5);
      if (pos === 'GK' && ['bitiricilik', 'topKapma', 'markaj', 'teknik', 'yaraticilik'].includes(a)) base = D.randInt(2, 8);
      // Yaşa göre fiziksel/zihinsel etki
      if (a === 'hiz' && age > 30) base -= (age - 30) * 0.6;
      if (a === 'kararlilik' || a === 'pozisyon') base += (age - 25) * 0.15;
      attrs[a] = Math.round(D.clamp(base, 1, 20));
    });
    const p = {
      id: S ? S.nextId++ : 0, name: n.name, nat: n.nat, age, pos, attrs,
      cond: D.randInt(88, 100), morale: D.randInt(55, 80), inj: 0, susp: 0, ycCount: 0,
      teamId: teamId === undefined ? null : teamId, contract: D.randInt(1, 4), listed: false,
      st: { apps: 0, g: 0, a: 0, rs: 0, rn: 0 }, career: { apps: 0, g: 0 }
    };
    const cur = E.rateFor(p, pos);
    p.pot = Math.round(D.clamp(age < 24 ? cur + (24 - age) * D.rand() * 0.9 + D.rand() * 2 : cur + D.rand(), cur, 20) * 10) / 10;
    p.wage = wageFor(p);
    return p;
  }

  // ---------- Takımlar ----------
  function teamPlayers(t) { return t.playerIds.map(id => S.players[id]).filter(Boolean); }
  function available(p) { return p.inj <= 0 && p.susp <= 0; }

  function autoLineup(t, keepFormation) {
    const ps = teamPlayers(t).filter(available);
    const f = keepFormation ? t.tactic.formation : t.tactic.formation || '4-4-2';
    const slots = E.slotsOf(f);
    const used = new Set();
    const xi = [];
    const score = (p, pos) => E.slotRating(p, pos) * (0.6 + 0.4 * p.cond / 100);
    slots.forEach(pos => {
      let best = null, bs = -1;
      ps.forEach(p => { if (used.has(p.id)) return; const s = score(p, pos); if (s > bs) { bs = s; best = p; } });
      if (best) { used.add(best.id); xi.push(best.id); }
    });
    // Yedekler: 1 kaleci + en iyi 6
    const rest = ps.filter(p => !used.has(p.id));
    const subs = [];
    const gk = rest.filter(p => p.pos === 'GK').sort((a, b) => E.ovr(b) - E.ovr(a))[0];
    if (gk) subs.push(gk.id);
    ['DF', 'MF', 'FW', 'DF', 'MF', 'FW'].forEach(pos => {
      const c = rest.filter(p => !subs.includes(p.id) && p.pos === pos).sort((a, b) => E.ovr(b) - E.ovr(a))[0];
      if (c) subs.push(c.id);
    });
    rest.filter(p => !subs.includes(p.id)).sort((a, b) => E.ovr(b) - E.ovr(a)).forEach(p => { if (subs.length < 7) subs.push(p.id); });
    t.tactic.formation = f;
    t.tactic.xi = xi;
    t.tactic.subs = subs.slice(0, 7);
  }

  // Kullanıcı kadrosundaki uygunsuz oyuncuları değiştir; mesaj listesi döndür
  function validateUserLineup() {
    const t = userTeam();
    const msgs = [];
    const slots = E.slotsOf(t.tactic.formation);
    const own = new Set(t.playerIds);
    const xi = t.tactic.xi.slice(0, 11);
    const used = new Set();
    for (let i = 0; i < slots.length; i++) {
      const p = S.players[xi[i]];
      if (!p || !own.has(p.id) || !available(p) || used.has(p.id)) {
        if (p && own.has(p.id)) msgs.push(`${p.name} ${p.inj > 0 ? 'sakat' : 'cezalı'}; yerine otomatik oyuncu seçildi.`);
        const cands = teamPlayers(t).filter(q => available(q) && !used.has(q.id) && !xi.includes(q.id));
        const best = cands.sort((a, b) => E.slotRating(b, slots[i]) - E.slotRating(a, slots[i]))[0];
        xi[i] = best ? best.id : null;
      }
      if (xi[i] != null) used.add(xi[i]);
    }
    t.tactic.xi = xi.filter(x => x != null);
    t.tactic.subs = (t.tactic.subs || []).filter(id => own.has(id) && available(S.players[id]) && !used.has(id)).slice(0, 7);
    if (t.tactic.subs.length < 5) {
      teamPlayers(t).filter(p => available(p) && !used.has(p.id) && !t.tactic.subs.includes(p.id))
        .sort((a, b) => E.ovr(b) - E.ovr(a)).forEach(p => { if (t.tactic.subs.length < 7) t.tactic.subs.push(p.id); });
    }
    return msgs;
  }

  function teamStrength(t) {
    const ps = teamPlayers(t).map(E.ovr).sort((a, b) => b - a).slice(0, 14);
    return ps.reduce((a, b) => a + b, 0) / Math.max(1, ps.length);
  }

  function aiTactics(t, opp) {
    const a = teamStrength(t), b = teamStrength(opp);
    const d = a - b;
    t.tactic.mentality = d > 5 ? 'hucum' : d > 1.5 ? 'dengeli' : d > -3 ? 'dengeli' : d > -7 ? 'kontra' : 'defans';
    t.tactic.passing = D.pick(['kisa', 'karisik', 'karisik', 'uzun']);
    t.tactic.pressing = d > 3 ? 'yuksek' : 'normal';
    autoLineup(t, true);
  }

  // ---------- Fikstür ----------
  function makeFixtures(ids) {
    const n = ids.length;
    const arr = D.shuffle(ids.slice());
    const rounds = [];
    for (let r = 0; r < n - 1; r++) {
      const week = [];
      for (let i = 0; i < n / 2; i++) {
        const h = arr[i], a = arr[n - 1 - i];
        week.push(r % 2 === 0 ? { h, a } : { h: a, a: h });
      }
      rounds.push(week);
      arr.splice(1, 0, arr.pop());
    }
    const second = rounds.map(w => w.map(m => ({ h: m.a, a: m.h })));
    return rounds.concat(second).map(w => w.map(m => Object.assign(m, { hg: null, ag: null })));
  }

  function resetTable() {
    S.teams.forEach(t => { t.tbl = { p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 }; t.form = []; });
  }

  function standings() {
    return S.teams.slice().sort((a, b) =>
      b.tbl.pts - a.tbl.pts || (b.tbl.gf - b.tbl.ga) - (a.tbl.gf - a.tbl.ga) || b.tbl.gf - a.tbl.gf || a.name.localeCompare(b.name, 'tr'));
  }

  // ---------- Yeni oyun ----------
  function newGame(managerName, teamIdx) {
    S = {
      v: 1, manager: managerName || 'Menajer', season: 2001, week: 0, nextId: 1,
      players: {}, teams: [], inbox: [], offers: [], history: [], nextMsg: 1,
      board: { conf: 60 }, userTeamId: teamIdx, lastFin: null, pendingBid: null
    };
    D.TEAMS.forEach((d, i) => {
      const t = {
        id: i, name: d[0], short: d[1], rep: d[2], c1: d[3], c2: d[4], money: d[5] * 1e6, playerIds: [],
        tactic: { formation: D.pick(['4-4-2', '4-4-2', '4-3-3', '4-5-1', '3-5-2']), mentality: 'dengeli', passing: 'karisik', pressing: 'normal', xi: [], subs: [] }
      };
      const q = 7.8 + (d[2] - 50) * 0.12; // 1-20 ölçeğinde kalite
      const plan = { GK: 3, DF: 8, MF: 8, FW: 5 };
      for (const pos in plan) {
        for (let k = 0; k < plan[pos]; k++) {
          const star = k === 0 && D.rand() < 0.6 ? 1.8 : 0;
          const p = genPlayer(pos, q + star - (k > plan[pos] - 3 ? 1.6 : 0), null, i);
          S.players[p.id] = p; t.playerIds.push(p.id);
        }
      }
      S.teams.push(t);
    });
    // Serbest oyuncular
    for (let i = 0; i < 40; i++) {
      const p = genPlayer(D.pick(['GK', 'DF', 'DF', 'MF', 'MF', 'FW']), D.randInt(5, 11), null, null);
      p.contract = 0; S.players[p.id] = p;
    }
    S.teams.forEach(t => {
      autoLineup(t);
      const bill = wageBill(t);
      t.income = roundMoney(bill * (1.02 + t.rep / 900)); // haftalık gelir (sponsor + yayın + bilet)
    });
    S.fixtures = makeFixtures(S.teams.map(t => t.id));
    resetTable();
    const ut = userTeam();
    const exp = expectation(ut);
    msg('Yönetim Kurulundan Hoş Geldiniz',
      `Sayın ${S.manager}, ${ut.name} teknik direktörlüğüne hoş geldiniz.\n\nYönetim kurulu bu sezon sizden ${exp.text} bekliyor. Transfer bütçeniz ${money(ut.money)}.\n\nBaşarılar dileriz.`);
    msg('Sezon Başlıyor', `${S.season}/${String(S.season + 1).slice(2)} sezonu fikstürü açıklandı. İlk maçınız: ${fixtureText(nextUserFixture())}.`);
    save();
    return S;
  }

  function wageBill(t) { return teamPlayers(t).reduce((a, p) => a + p.wage, 0); }

  function expectation(t) {
    const rank = S.teams.slice().sort((a, b) => b.rep - a.rep).findIndex(x => x.id === t.id) + 1;
    if (rank <= 2) return { pos: 1, text: 'şampiyonluk' };
    if (rank <= 4) return { pos: 4, text: 'ilk 4\'te bitirmenizi' };
    if (rank <= 8) return { pos: 8, text: 'ilk 8\'de bitirmenizi' };
    if (rank <= 12) return { pos: 12, text: 'orta sıralarda yer almanızı' };
    return { pos: 15, text: 'küme düşme hattından uzak durmanızı' };
  }

  // ---------- Yardımcılar ----------
  function userTeam() { return S.teams[S.userTeamId]; }
  function team(id) { return S.teams[id]; }
  function money(v) {
    const neg = v < 0; v = Math.abs(v);
    let s;
    if (v >= 1e6) s = '€' + (v / 1e6).toFixed(v >= 1e7 ? 1 : 2).replace('.', ',') + 'M';
    else if (v >= 1e3) s = '€' + Math.round(v / 1e3) + 'K';
    else s = '€' + Math.round(v);
    return (neg ? '-' : '') + s;
  }
  function dateOf(week) {
    const d = new Date(S.season, 7, 11 + week * 7);
    return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
  }
  function seasonLabel() { return `${S.season}/${String(S.season + 1).slice(2)}`; }
  function msg(title, body, extra) {
    S.inbox.unshift(Object.assign({ id: S.nextMsg++, week: S.week, season: S.season, title, body, read: false }, extra || {}));
    if (S.inbox.length > 80) S.inbox.length = 80;
  }
  function nextUserFixture() {
    const w = S.fixtures[S.week];
    if (!w) return null;
    return w.find(m => m.h === S.userTeamId || m.a === S.userTeamId);
  }
  function fixtureText(m) { return m ? `${team(m.h).name} - ${team(m.a).name}` : '-'; }

  // ---------- Hafta oynatma ----------
  function sideFor(t) { return { team: t, players: teamPlayers(t), tactic: t.tactic }; }

  // Haftanın maçlarını hazırla: kullanıcı maçı nesnesi + diğer maçlar tam simüle edilir
  function prepareWeek() {
    const w = S.fixtures[S.week];
    const warnings = validateUserLineup();
    let user = null;
    const others = [];
    w.forEach(m => {
      const h = team(m.h), a = team(m.a);
      if (h.id !== S.userTeamId) aiTactics(h, a);
      if (a.id !== S.userTeamId) aiTactics(a, h);
      const isUser = h.id === S.userTeamId || a.id === S.userTeamId;
      const match = new E.Match(sideFor(h), sideFor(a), { userSide: isUser ? (h.id === S.userTeamId ? 0 : 1) : -1 });
      if (isUser) user = { fx: m, match };
      else { match.runToEnd(); others.push({ fx: m, match }); }
    });
    return { user, others, warnings };
  }

  function applyMatch(fx, match) {
    const hg = match.result.hg, ag = match.result.ag;
    fx.hg = hg; fx.ag = ag;
    const h = team(fx.h), a = team(fx.a);
    [[h, hg, ag], [a, ag, hg]].forEach(([t, f, g]) => {
      t.tbl.p++; t.tbl.gf += f; t.tbl.ga += g;
      const r = f > g ? 'G' : f === g ? 'B' : 'M';
      if (r === 'G') { t.tbl.w++; t.tbl.pts += 3; } else if (r === 'B') { t.tbl.d++; t.tbl.pts += 1; } else t.tbl.l++;
      t.form.push(r); if (t.form.length > 5) t.form.shift();
    });
    // Oyuncu istatistikleri
    match.sides.forEach(s => {
      const t = s.team;
      const oppG = match.sides[1 - s.idx].st.goals, ownG = s.st.goals;
      const moraleDelta = ownG > oppG ? 6 : ownG === oppG ? 0 : -6;
      teamPlayers(t).forEach(p => {
        const ps = s.ps[p.id];
        if (ps && (ps.mins > 0 || ps.started)) {
          p.st.apps++; p.career.apps++;
          p.st.g += ps.g; p.st.a += ps.a; p.career.g += ps.g;
          if (ps.rating) { p.st.rs += ps.rating; p.st.rn++; }
          p.cond = Math.round(ps.cond != null ? ps.cond : p.cond);
          p.morale = D.clamp(p.morale + moraleDelta + (ps.rating >= 7.5 ? 4 : ps.rating < 6 ? -3 : 0), 5, 100);
          if (ps.rc) { p.susp = Math.max(p.susp, D.randInt(1, 3)); }
          else if (ps.yc) { p.ycCount += ps.yc; if (p.ycCount >= 4) { p.susp = Math.max(p.susp, 1); p.ycCount = 0; p._yellowBan = true; } }
          if (ps.inj) { p.inj = D.randInt(1, 6); p._newInj = true; }
        } else {
          p.morale = D.clamp(p.morale + (moraleDelta > 0 ? 1 : -1) - (E.ovr(p) > 60 && p.age > 21 ? 1 : 0), 5, 100);
        }
      });
    });
  }

  // Haftayı tamamla (kullanıcı maçı bittikten sonra)
  function finishWeek(prep) {
    const all = prep.others.concat(prep.user ? [prep.user] : []);
    // Cezalar bu hafta oynanan maçla birlikte düşer (maçtan önce cezalı olanlar için)
    S.teams.forEach(t => teamPlayers(t).forEach(p => { p._wasSusp = p.susp > 0; }));
    all.forEach(x => applyMatch(x.fx, x.match));
    S.teams.forEach(t => teamPlayers(t).forEach(p => {
      if (p._wasSusp) p.susp = Math.max(0, p.susp - 1);
      delete p._wasSusp;
    }));

    const ut = userTeam();
    // Kullanıcı maçı sonrası
    if (prep.user) {
      const m = prep.user.match, fx = prep.user.fx;
      const us = fx.h === ut.id ? 0 : 1;
      const my = m.sides[us].st.goals, op = m.sides[1 - us].st.goals;
      const oppT = team(us === 0 ? fx.a : fx.h);
      const diff = teamStrength(ut) - teamStrength(oppT);
      // Güçlü rakibi yenmek daha çok, zayıf rakibe kaybetmek daha çok etkiler
      const dc = (my > op ? 2.5 : my === op ? 0 : -2.5) - diff * 0.08;
      S.board.conf = D.clamp(S.board.conf + dc, 0, 100);
      teamPlayers(ut).forEach(p => {
        if (p._newInj) msg('Sakatlık', `${p.name} maçta sakatlandı ve yaklaşık ${p.inj} hafta forma giyemeyecek.`);
        if (p._yellowBan) msg('Kart Cezası', `${p.name} 4. sarı kartını gördü ve bir maç cezalı.`);
        const ps = m.sides[us].ps[p.id];
        if (ps && ps.rc) msg('Kırmızı Kart Cezası', `${p.name} gördüğü kırmızı kart nedeniyle ${p.susp} maç cezalı.`);
      });
    }
    S.teams.forEach(t => teamPlayers(t).forEach(p => { delete p._newInj; delete p._yellowBan; }));

    weeklyUpdate();
    S.week++;
    if (S.week >= S.fixtures.length) endSeason();
    save();
  }

  function weeklyUpdate() {
    const ut = userTeam();
    // Kondisyon, sakatlık, gelişim
    Object.values(S.players).forEach(p => {
      if (p.inj > 0) {
        p.inj--;
        if (p.inj === 0 && p.teamId === ut.id) msg('Sakatlık Bitti', `${p.name} sakatlığını atlattı ve seçilebilir durumda.`);
      }
      p.cond = Math.min(100, p.cond + 18 + p.attrs.dayaniklilik * 0.8);
      if (p.teamId !== null) develop(p, 0.06);
      if (p.morale < 50) p.morale += 1; else if (p.morale > 75) p.morale -= 1;
    });
    // Finans
    S.teams.forEach(t => {
      const w = S.fixtures[S.week];
      const home = w && w.some(m => m.h === t.id);
      const gate = home ? roundMoney(t.income * 0.5 * (0.8 + 0.4 * (t.tbl.pts / Math.max(1, t.tbl.p * 3)))) : 0;
      const inc = roundMoney(t.income * 0.75) + gate;
      const exp = wageBill(t);
      t.money += inc - exp;
      if (t.id === ut.id) S.lastFin = { inc, gate, exp };
    });
    if (ut.money < 0) {
      S.board.conf = D.clamp(S.board.conf - 1.5, 0, 100);
      if (S.week % 4 === 0) msg('Mali Uyarı', `Kulüp hesabı ekside (${money(ut.money)}). Yönetim, maaş yükünü azaltmanızı istiyor.`);
    }
    aiTransfers();
    incomingOffers();
    checkBoard();
  }

  function develop(p, k) {
    const cur = E.rateFor(p, p.pos);
    const keys = Object.keys(D.WEIGHTS[p.pos]).concat(['dayaniklilik', 'kararlilik']);
    if (p.age <= 27 && cur < p.pot && D.rand() < k * (p.age <= 22 ? 1.6 : 1) * (p.pot - cur + 0.5)) {
      const a = D.pick(keys); if (p.attrs[a] < 20) p.attrs[a]++;
    } else if (p.age >= 31 && D.rand() < k * (p.age - 29) * 0.5) {
      const a = D.pick(['hiz', 'dayaniklilik', D.pick(keys)]); if (p.attrs[a] > 1) p.attrs[a]--;
    }
  }

  function checkBoard() {
    if (S.board.conf <= 0 && !S.sacked) {
      S.sacked = true;
      msg('GÖREVDEN ALINDINIZ', `Yönetim kurulu, kötü gidişat nedeniyle ${userTeam().name} teknik direktörlüğü görevine son verdi.\n\nYeni bir oyun başlatabilirsiniz.`, { type: 'sacked' });
    } else if (S.board.conf < 20 && S.week % 5 === 0) {
      msg('Yönetimden Uyarı', 'Yönetim kurulu sonuçlardan endişeli. Durum düzelmezse göreviniz tehlikeye girebilir.');
    }
  }

  // ---------- Transferler ----------
  function askingPrice(p) {
    const t = team(p.teamId);
    if (!t) return 0;
    const v = valueOf(p);
    const top = teamPlayers(t).sort((a, b) => E.ovr(b) - E.ovr(a)).slice(0, 13).some(x => x.id === p.id);
    let f = p.listed ? 0.85 : 1.25;
    if (top) f *= 1.25;
    if (t.playerIds.length <= MIN_SQUAD + 2) f *= 1.4;
    return roundMoney(v * f);
  }

  function wageDemand(p, buyer) {
    const cur = p.wage;
    let d = Math.max(cur * 1.12, wageFor(p));
    const from = p.teamId !== null ? team(p.teamId) : null;
    if (from && buyer.rep < from.rep) d *= 1 + (from.rep - buyer.rep) / 100;
    return roundMoney(d, 250);
  }

  // Kullanıcının teklifi: sonuç nesnesi döner
  function makeBid(pid, amount) {
    const p = S.players[pid], ut = userTeam();
    if (!p || p.teamId === ut.id) return { ok: false, text: 'Geçersiz oyuncu.' };
    if (ut.playerIds.length >= MAX_SQUAD) return { ok: false, text: `Kadronuz dolu (en fazla ${MAX_SQUAD} oyuncu).` };
    if (p.teamId === null) {
      S.pendingBid = { pid, fee: 0, wage: wageDemand(p, ut) };
      return { ok: true, stage: 'contract', text: `${p.name} serbest oyuncu. Haftalık ${money(S.pendingBid.wage)} maaş talep ediyor.`, wage: S.pendingBid.wage };
    }
    if (amount > ut.money) return { ok: false, text: 'Bu teklif için yeterli bütçeniz yok.' };
    const from = team(p.teamId);
    // Oyuncu küçük kulübe gelmek istemeyebilir
    if (from.rep - ut.rep > 22 && E.ovr(p) > 70) {
      return { ok: false, text: `${p.name}, ${ut.name} gibi bir kulübe transfer olmakla ilgilenmiyor.` };
    }
    const ask = askingPrice(p);
    if (amount >= ask) {
      S.pendingBid = { pid, fee: amount, wage: wageDemand(p, ut) };
      return { ok: true, stage: 'contract', text: `${from.name} ${money(amount)} teklifinizi kabul etti. ${p.name} haftalık ${money(S.pendingBid.wage)} maaş istiyor.`, wage: S.pendingBid.wage };
    }
    if (amount >= ask * 0.75) return { ok: false, counter: ask, text: `${from.name} teklifinizi reddetti ancak ${money(ask)} karşılığında satmaya hazır.` };
    return { ok: false, text: `${from.name} teklifinizi kesinlikle reddetti. Oyuncu satılık değil gibi görünüyor.` };
  }

  function acceptContract(years) {
    const b = S.pendingBid, ut = userTeam();
    if (!b) return false;
    const p = S.players[b.pid];
    if (b.fee > ut.money) { S.pendingBid = null; return false; }
    moveP(p, ut, b.fee);
    p.wage = b.wage; p.contract = years; p.morale = 80;
    msg('Transfer Tamamlandı', `${p.name} ${b.fee ? money(b.fee) + ' bonservisle' : 'bedelsiz olarak'} ${ut.name}'a katıldı. Sözleşme: ${years} yıl, haftalık ${money(p.wage)}.`);
    S.pendingBid = null;
    save();
    return true;
  }

  function moveP(p, to, fee) {
    const from = p.teamId !== null ? team(p.teamId) : null;
    if (from) {
      from.playerIds = from.playerIds.filter(id => id !== p.id);
      from.money += fee;
      from.tactic.xi = from.tactic.xi.filter(id => id !== p.id);
      from.tactic.subs = from.tactic.subs.filter(id => id !== p.id);
    }
    if (to) { to.playerIds.push(p.id); to.money -= fee; p.teamId = to.id; } else p.teamId = null;
    p.listed = false;
    if (from && from.id !== S.userTeamId) autoLineup(from, true);
    if (to && to.id !== S.userTeamId) autoLineup(to, true);
  }

  function releasePlayer(pid) {
    const p = S.players[pid], ut = userTeam();
    if (!p || p.teamId !== ut.id) return { ok: false, text: '' };
    if (ut.playerIds.length <= MIN_SQUAD) return { ok: false, text: `Kadronuzda en az ${MIN_SQUAD} oyuncu olmalı.` };
    const comp = roundMoney(p.wage * 52 * p.contract * 0.5);
    moveP(p, null, 0);
    ut.money -= comp;
    p.contract = 0;
    msg('Sözleşme Feshi', `${p.name} ile sözleşme feshedildi. Ödenen tazminat: ${money(comp)}.`);
    save();
    return { ok: true };
  }

  function renewDemand(p) {
    const w = Math.max(p.wage * 1.1, wageFor(p) * (p.morale < 40 ? 1.3 : 1));
    return roundMoney(w, 250);
  }
  function renewContract(pid, years) {
    const p = S.players[pid];
    const w = renewDemand(p);
    if (p.age >= 33 && years > 2) return { ok: false, text: `${p.name} yaşı nedeniyle en fazla 2 yıllık sözleşme istiyor.` };
    p.wage = w; p.contract = years; p.morale = D.clamp(p.morale + 10, 0, 100);
    msg('Sözleşme Yenilendi', `${p.name} ${years} yıllık yeni sözleşme imzaladı. Haftalık maaş: ${money(w)}.`);
    save();
    return { ok: true };
  }

  function incomingOffers() {
    const ut = userTeam();
    teamPlayers(ut).forEach(p => {
      const hasOffer = S.offers.some(o => o.pid === p.id);
      if (hasOffer) return;
      const chance = p.listed ? 0.3 : (E.ovr(p) >= 72 ? 0.025 : 0);
      if (D.rand() >= chance) return;
      const v = valueOf(p);
      const amount = roundMoney(v * (p.listed ? 0.65 + D.rand() * 0.45 : 1.1 + D.rand() * 0.5));
      const buyers = S.teams.filter(t => t.id !== ut.id && t.money > amount && t.playerIds.length < MAX_SQUAD - 2);
      if (!buyers.length) return;
      const b = D.pick(buyers);
      const o = { id: S.nextMsg, pid: p.id, from: b.id, amount, week: S.week };
      S.offers.push(o);
      msg('Transfer Teklifi', `${b.name}, ${p.name} için ${money(amount)} teklif etti.\nOyuncunun tahmini değeri: ${money(v)}.`, { type: 'offer', offerId: o.id });
    });
    // Eski teklifler 2 hafta sonra düşer
    S.offers = S.offers.filter(o => S.week - o.week < 2);
  }

  function answerOffer(offerId, accept) {
    const o = S.offers.find(x => x.id === offerId);
    const m = S.inbox.find(x => x.offerId === offerId);
    if (m) m.answered = true;
    if (!o) return { ok: false, text: 'Bu teklif artık geçerli değil.' };
    S.offers = S.offers.filter(x => x !== o);
    const p = S.players[o.pid], b = team(o.from);
    if (!accept) { save(); return { ok: true, text: 'Teklif reddedildi.' }; }
    if (userTeam().playerIds.length <= MIN_SQUAD) return { ok: false, text: `Kadronuzda en az ${MIN_SQUAD} oyuncu kalmalı.` };
    if (p.teamId !== S.userTeamId || b.money < o.amount) return { ok: false, text: 'Transfer gerçekleşemedi.' };
    moveP(p, b, o.amount);
    p.wage = wageDemand(p, b); p.contract = D.randInt(2, 4);
    msg('Oyuncu Satıldı', `${p.name}, ${money(o.amount)} karşılığında ${b.name}'a transfer oldu.`);
    save();
    return { ok: true, text: `${p.name} satıldı.` };
  }

  function aiTransfers() {
    const n = D.randInt(0, 2);
    for (let i = 0; i < n; i++) {
      const t = D.pick(S.teams.filter(x => x.id !== S.userTeamId));
      const ps = teamPlayers(t);
      if (ps.length >= MAX_SQUAD - 3) continue;
      const need = D.POSITIONS.map(pos => ({ pos, n: ps.filter(p => p.pos === pos).length, avg: avgOvr(ps.filter(p => p.pos === pos)) }))
        .sort((a, b) => a.avg - b.avg)[0];
      const avg = avgOvr(ps);
      const cands = Object.values(S.players).filter(p => p.pos === need.pos && p.teamId !== t.id && p.teamId !== S.userTeamId &&
        E.ovr(p) > avg && E.ovr(p) < avg + 12 && p.age < 32);
      if (!cands.length) continue;
      const p = D.pick(cands);
      const fee = p.teamId === null ? 0 : askingPrice(p);
      if (fee > t.money * 0.6) continue;
      if (p.teamId !== null && team(p.teamId).playerIds.length <= MIN_SQUAD + 2) continue;
      const from = p.teamId !== null ? team(p.teamId) : null;
      moveP(p, t, fee);
      p.wage = wageDemand(p, t); p.contract = D.randInt(2, 4);
      if (fee > 1500000 || D.rand() < 0.3) {
        msg('Transfer Haberi', `${p.name} ${from ? from.name + "'dan " + money(fee) + ' bedelle' : 'serbest olarak'} ${t.name}'a transfer oldu.`, { type: 'news' });
      }
    }
    // Serbest oyuncu havuzunu doldur
    const free = Object.values(S.players).filter(p => p.teamId === null);
    if (free.length < 30) for (let i = 0; i < 3; i++) {
      const p = genPlayer(D.pick(D.POSITIONS), D.randInt(5, 11), null, null); p.contract = 0; S.players[p.id] = p;
    }
  }
  function avgOvr(ps) { return ps.length ? ps.reduce((a, p) => a + E.ovr(p), 0) / ps.length : 0; }

  function toggleList(pid) {
    const p = S.players[pid]; p.listed = !p.listed; save(); return p.listed;
  }

  // ---------- Sezon sonu ----------
  function endSeason() {
    const tbl = standings();
    const ut = userTeam();
    const pos = tbl.findIndex(t => t.id === ut.id) + 1;
    const champ = tbl[0];
    const scorers = topScorers(1)[0];
    const exp = expectation(ut);
    S.history.push({ season: seasonLabel(), champ: champ.name, pos, pts: ut.tbl.pts, top: scorers ? `${scorers.p.name} (${scorers.p.st.g})` : '-' });
    // Ödül parası
    tbl.forEach((t, i) => { t.money += roundMoney((18 - i) * 650000 + (i === 0 ? 6e6 : 0)); });
    let conf = (exp.pos - pos) * 4 + (pos === 1 ? 25 : 0);
    S.board.conf = D.clamp(S.board.conf + conf, 0, 100);
    msg('Sezon Sona Erdi', `${seasonLabel()} sezonu sona erdi.\n\nŞampiyon: ${champ.name}\n${ut.name} ligi ${pos}. sırada bitirdi (${ut.tbl.pts} puan).\nGol kralı: ${scorers ? scorers.p.name + ' - ' + scorers.p.st.g + ' gol' : '-'}\n\nYönetimin beklentisi: ${exp.text}. ${pos <= exp.pos ? 'Yönetim performansınızdan memnun.' : 'Yönetim beklentilerin altında kalındığını düşünüyor.'}`);
    if (pos === 1) msg('ŞAMPİYON!', `Tebrikler! ${ut.name} ${seasonLabel()} sezonunun şampiyonu oldu! Taraftarlar sokaklarda kutlama yapıyor.`);
    // İtibar güncellemesi
    tbl.forEach((t, i) => { t.rep = D.clamp(Math.round(t.rep + (9 - i) * 0.4), 40, 99); });

    // Oyuncular: yaş, sözleşme, emeklilik
    const retired = [];
    Object.values(S.players).forEach(p => {
      p.age++;
      for (let k = 0; k < 6; k++) develop(p, 0.35);
      p.st = { apps: 0, g: 0, a: 0, rs: 0, rn: 0 };
      p.ycCount = 0; p.susp = 0; p.cond = 100;
      if (p.teamId !== null) {
        p.contract--;
        if (p.contract <= 0) {
          const t = team(p.teamId);
          if (t.id === ut.id) {
            msg('Sözleşmesi Biten Oyuncu', `${p.name}'in sözleşmesi sona erdi ve kulüpten ayrıldı.`);
            moveP(p, null, 0);
          } else if (D.rand() < 0.75 && p.age < 33) { p.contract = D.randInt(1, 3); p.wage = wageFor(p); }
          else moveP(p, null, 0);
        }
      }
      if (p.age >= 34 && D.rand() < (p.age - 32) * 0.3) retired.push(p);
    });
    retired.forEach(p => {
      if (p.teamId === ut.id) msg('Emeklilik', `${p.name} ${p.age} yaşında futbolu bıraktığını açıkladı.`);
      if (p.teamId !== null) moveP(p, null, 0);
      delete S.players[p.id];
    });
    S.offers = [];
    // Altyapı ve kadro takviyesi
    S.teams.forEach(t => {
      const q = 4 + (t.rep - 50) * 0.1;
      const youth = [];
      for (let k = 0; k < 3; k++) {
        const p = genPlayer(D.pick(['GK', 'DF', 'MF', 'MF', 'FW', 'DF']), q, D.randInt(16, 18), t.id);
        p.pot = Math.min(20, p.pot + D.rand() * 4); p.contract = 3; p.wage = 1000;
        S.players[p.id] = p; t.playerIds.push(p.id); youth.push(p);
      }
      if (t.id === ut.id) msg('Altyapıdan Yeni Oyuncular', `Altyapıdan A takıma yükselen oyuncular:\n${youth.map(p => `• ${p.name} (${D.POS_LONG[p.pos]}, ${p.age})`).join('\n')}`);
      // AI takımlar eksik mevkileri doldurur
      if (t.id !== ut.id) {
        const plan = { GK: 2, DF: 6, MF: 6, FW: 3 };
        for (const pos in plan) {
          while (teamPlayers(t).filter(p => p.pos === pos).length < plan[pos]) {
            const p = genPlayer(pos, 6 + (t.rep - 50) * 0.15, null, t.id); p.contract = D.randInt(1, 3);
            S.players[p.id] = p; t.playerIds.push(p.id);
          }
        }
        while (t.playerIds.length > MAX_SQUAD - 2) {
          const worst = teamPlayers(t).sort((a, b) => E.ovr(a) - E.ovr(b))[0];
          moveP(worst, null, 0);
        }
        autoLineup(t);
      }
      t.income = roundMoney(t.income * (0.97 + t.rep / 1500));
    });
    S.season++;
    S.week = 0;
    S.fixtures = makeFixtures(S.teams.map(t => t.id));
    resetTable();
    const ne = expectation(ut);
    msg('Yeni Sezon', `${seasonLabel()} sezonu başlıyor. Yönetim bu sezon ${ne.text} bekliyor. Transfer bütçeniz: ${money(ut.money)}.`);
    checkBoard();
  }

  function topScorers(n) {
    return Object.values(S.players).filter(p => p.teamId !== null && p.st.g > 0)
      .sort((a, b) => b.st.g - a.st.g || b.st.a - a.st.a).slice(0, n || 20).map(p => ({ p, t: team(p.teamId) }));
  }

  // ---------- Kayıt ----------
  function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) { /* depolama yok */ } }
  function load() {
    try {
      const s = localStorage.getItem(SAVE_KEY);
      if (!s) return null;
      S = JSON.parse(s);
      return S;
    } catch (e) { return null; }
  }
  function hasSave() { try { return !!localStorage.getItem(SAVE_KEY); } catch (e) { return false; } }
  function deleteSave() { try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* yok */ } S = null; }

  G.Game = {
    get S() { return S; }, newGame, load, save, hasSave, deleteSave,
    userTeam, team, teamPlayers, available, autoLineup, validateUserLineup, teamStrength,
    standings, nextUserFixture, fixtureText, prepareWeek, finishWeek,
    valueOf, wageFor, askingPrice, makeBid, acceptContract, releasePlayer, renewDemand, renewContract,
    answerOffer, toggleList, topScorers, wageBill, expectation,
    money, dateOf, seasonLabel, MAX_SQUAD, MIN_SQUAD
  };
})(window);
