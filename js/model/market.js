/* Transfer, finans, antrenman, gözlem, altyapı, sözleşmeler, yönetim kurulu, iş teklifleri */
(function (G) {
  'use strict';
  const CM = G.CM, U = CM.U, P = CM.P, C = CM.Comp;
  const S = () => CM.S;
  const news = (t, b, o) => CM.Game.news(t, b, o);
  const MAX_SQUAD = 36, MIN_SQUAD = 18;

  const TRAIN_FOCUS = {
    genel: { n: 'Genel', attrs: [] }, fizik: { n: 'Fiziksel', attrs: ['hiz', 'day', 'guc'] },
    hucum: { n: 'Hücum', attrs: ['bit', 'uza', 'dri', 'tek', 'yar'] }, savunma: { n: 'Savunma', attrs: ['kap', 'mar', 'kaf', 'poz'] },
    taktik: { n: 'Taktik', attrs: ['poz', 'kar', 'pas'] }, duran: { n: 'Duran Top', attrs: ['kaf', 'ort', 'bit'] }
  };
  const TRAIN_INT = { dusuk: { n: 'Düşük', dev: 0.75, inj: 0.0015, cond: 0 }, normal: { n: 'Normal', dev: 1, inj: 0.004, cond: -2 }, yuksek: { n: 'Yüksek', dev: 1.3, inj: 0.009, cond: -6 } };
  const IND_FOCUS = {
    '': 'Yok', bit: 'Bitiricilik', pas: 'Pas', dri: 'Top Sürme', tek: 'Teknik', kaf: 'Kafa Vuruşu', kap: 'Top Kapma',
    mar: 'Markaj', yar: 'Yaratıcılık', poz: 'Pozisyon Alma', hiz: 'Hız', day: 'Dayanıklılık', guc: 'Güç', kal: 'Kalecilik', ref: 'Refleks', ort: 'Orta', uza: 'Uzaktan Şut'
  };

  function isWindow(d) {
    const t = U.ymd(d);
    return (t.m >= 7 && t.m <= 8) || (t.m === 9 && t.d <= 1) || (t.m === 1 && t.d >= 2) || (t.m === 2 && t.d <= 2);
  }
  const club = id => S().clubs[id];
  const plist = c => c.players.map(id => S().players[id]).filter(Boolean);
  const age = p => S().season - p.b;
  const leagueOf = c => c && c.lg ? CM.LEAGUES[c.lg] : null;
  const isForeign = (p, c) => c && p.nat !== c.cty;

  // ---------- Kullanıcı ----------
  function initUser() {
    const s = S(), u = s.user;
    const c = club(u.club);
    c.train = { focus: 'genel', int: 'normal' };
    setBudget(c, true);
    // Bilinen oyuncular: kendi ligi, kendi kulübü, dünya yıldızları
    Object.values(s.players).forEach(p => {
      const pc = p.club != null ? club(p.club) : null;
      if (p.club === u.club) s.known[p.id] = 2;
      else if (P.ovr(p) >= 80 || (pc && pc.lg === c.lg)) s.known[p.id] = 2;
      else if (pc && pc.cty === c.cty) s.known[p.id] = 1;
    });
    setExpectation();
    const exp = u.exp;
    news('Yönetim Kurulundan Hoş Geldiniz', `Sayın ${u.name}, ${c.n} teknik direktörlüğüne hoş geldiniz.\n\nYönetimin bu sezonki beklentisi: ${exp.text}.\nTransfer bütçesi: ${U.money(c.tb)}.\nYaz transfer dönemi 1 Eylül'de kapanacak.`, { type: 'board' });
    if (u.nat) news('Milli takım görevi', `Ayrıca ${s.nats[u.nat].n} milli takımının teknik direktörlüğünü üstlendiniz. İlk milli maçlar 24 Eylül'de.`, { type: 'nat' });
  }
  function setExpectation() {
    const s = S(), u = s.user, c = club(u.club);
    if (!c || !c.lg) { u.exp = { pos: 99, text: 'iyi bir sezon' }; return; }
    const L = CM.LEAGUES[c.lg];
    const peers = Object.values(s.clubs).filter(x => x.lg === c.lg).sort((a, b) => b.rep - a.rep);
    const r = peers.findIndex(x => x.id === c.id) + 1, n = peers.length;
    let pos, text;
    if (L.tier === 2) {
      if (r <= 2) { pos = 2; text = 'doğrudan terfi'; } else if (r <= 6) { pos = 6; text = 'play-off hattında bitirmenizi'; } else if (r <= n - 6) { pos = n - 5; text = 'orta sıralarda yer almanızı'; } else { pos = n - L.rel; text = 'küme düşmemenizi'; }
    } else if (r === 1) { pos = 1; text = 'şampiyonluk'; }
    else if (r <= 3) { pos = 3; text = 'ilk 3\'te bitirmenizi'; }
    else if (r <= Math.ceil(n * 0.35)) { pos = Math.ceil(n * 0.35); text = 'Avrupa kupalarına katılmanızı'; }
    else if (r <= n - 5) { pos = n - 5; text = 'orta sıralarda yer almanızı'; }
    else { pos = n - L.rel; text = 'küme düşme hattından uzak durmanızı'; }
    u.exp = { pos, text };
  }
  // Yönetimin ayırdığı transfer bütçesi: kasanın bir kısmı (güvene göre), satış gelirinin yarısı eklenir
  function setBudget(c, first) {
    const u = S().user;
    const share = first ? 0.75 : U.clamp(0.3 + (u.conf || 50) / 250, 0.3, 0.65);
    c.tb = U.roundMoney(Math.max(0, c.money * share));
  }
  function budget(c) { if (c.tb == null) setBudget(c, true); return Math.max(0, Math.min(c.tb, c.money)); }
  function boardNewSeason() {
    const u = S().user; if (!u || !u.club) return;
    setExpectation();
    setBudget(club(u.club));
    news('Yeni sezon hedefi', `Yönetim bu sezon ${u.exp.text} bekliyor. Transfer bütçesi: ${U.money(club(u.club).tb)}.`, { type: 'board' });
  }
  function boardAfterMatch(f, m) {
    const u = S().user, c = club(u.club);
    const us = f.h === u.club ? 0 : 1;
    const my = m.sides[us].st.g, op = m.sides[1 - us].st.g;
    const opp = C.tObj(us === 0 ? f.a : f.h);
    const diff = CM.Sim.strengthOf(c) - CM.Sim.strengthOf(opp);
    const w = S().comps[f.c].type === 'league' ? 1 : 0.7;
    u.conf = U.clamp(u.conf + ((my > op ? 2.2 : my === op ? 0 : -2.4) - diff * 0.07) * w, 0, 100);
    if (u.conf <= 0 && !u.sacked) sack();
  }
  function sack() {
    const s = S(), u = s.user, c = club(u.club);
    u.sacked = true;
    u.history.push({ club: c.n, from: u.started, to: s.day });
    news('GÖREVDEN ALINDINIZ', `${c.n} yönetim kurulu, kötü gidişat nedeniyle görevinize son verdi. İş tekliflerini Haberler ekranından değerlendirebilirsiniz.`, { type: 'board', urgent: true });
    u.club = null;
    jobOffers(c.rep - 8);
  }
  function jobOffers(maxRep) {
    const s = S(), u = s.user;
    const list = Object.values(s.clubs).filter(c => c.lg && c.rep <= maxRep + 4 && c.rep >= maxRep - 20);
    U.shuffle(list);
    u.offers = list.slice(0, 4).map(c => c.id);
    u.offers.forEach(id => news('İş teklifi', `${club(id).n} (${CM.LEAGUES[club(id).lg].n}) size teknik direktörlük teklif ediyor.`, { type: 'job', club: id, urgent: false }));
  }
  function takeJob(id) {
    const s = S(), u = s.user;
    u.club = id; u.sacked = false; u.conf = 55; u.started = s.day; u.offers = [];
    club(id).train = { focus: 'genel', int: 'normal' };
    setBudget(club(id), true);
    plist(club(id)).forEach(p => { s.known[p.id] = 2; });
    Object.values(s.clubs).filter(c => c.lg === club(id).lg).forEach(c => plist(c).forEach(p => { s.known[p.id] = Math.max(s.known[p.id] || 0, 2); }));
    setExpectation();
    news('Yeni göreviniz', `${club(id).n} ile sözleşme imzaladınız. Yönetimin beklentisi: ${u.exp.text}.`, { type: 'board' });
  }

  // ---------- Transfer ----------
  function asking(p) {
    const c = club(p.club);
    if (!c) return 0;
    let f = p.listed ? 0.8 : 1.05;
    const ps = plist(c).sort((a, b) => P.ovr(b) - P.ovr(a));
    if (ps.slice(0, 11).includes(p)) f *= 1.15; else if (ps.slice(0, 16).includes(p)) f *= 1.05; else f *= 0.9;
    const left = p.ce - S().season;
    f *= left >= 3 ? 1.08 : left <= 1 ? 0.75 : 1;
    if (c.players.length <= MIN_SQUAD + 2) f *= 1.4;
    return U.roundMoney(P.valueOf(p) * f);
  }
  function wageDemand(p, buyer) {
    const lf = buyer.wf * (0.75 + buyer.rep / 200);
    let d = Math.max(p.wage * 1.12, P.wageFor(p, lf));
    const from = p.club != null ? club(p.club) : null;
    if (from && buyer.rep < from.rep) d *= 1 + (from.rep - buyer.rep) / 80;
    return U.roundMoney(d);
  }
  function refuses(p, buyer) {
    const from = p.club != null ? club(p.club) : null;
    const repP = P.ovr(p);
    if (from && from.rep - buyer.rep > 18 && repP > 70) return `${p.n}, ${buyer.n} gibi bir kulübe transfer olmakla ilgilenmiyor.`;
    if (repP >= 84 && buyer.rep < 70) return `${p.n} daha büyük bir kulüpte oynamak istiyor.`;
    return null;
  }
  function foreignOk(c, p) {
    const L = leagueOf(c);
    if (!L || !L.foreign || !isForeign(p, c)) return true;
    return plist(c).filter(x => isForeign(x, c)).length < L.foreign;
  }
  function makeBid(pid, fee) {
    const s = S(), u = s.user, me = club(u.club), p = s.players[pid];
    if (!p || p.club === me.id) return { ok: false, text: 'Geçersiz oyuncu.' };
    if (p.ntOnly) return { ok: false, text: 'Bu oyuncunun kulübü oyunda modellenmiyor; transfer edilemez.' };
    if (p.loan) return { ok: false, text: `${p.n} şu an kiralık oynuyor; sezon sonunda kulübüne dönecek.` };
    if (me.players.length >= MAX_SQUAD) return { ok: false, text: `Kadronuz dolu (en fazla ${MAX_SQUAD} oyuncu).` };
    if (!foreignOk(me, p)) return { ok: false, text: `Yabancı oyuncu sınırına ulaştınız (en fazla ${leagueOf(me).foreign}).` };
    const rf = refuses(p, me);
    if (rf) return { ok: false, text: rf };
    if (p.club == null) {
      s.pending = { pid, fee: 0, wage: wageDemand(p, me) };
      return { ok: true, stage: 'contract', text: `${p.n} serbest oyuncu. Haftalık ${U.money(s.pending.wage)} maaş istiyor.`, wage: s.pending.wage };
    }
    if (!isWindow(s.day)) return { ok: false, text: 'Transfer dönemi kapalı. Yalnızca serbest oyuncularla anlaşabilirsiniz.' };
    if (fee > budget(me)) return { ok: false, text: `Bu teklif transfer bütçenizi (${U.money(budget(me))}) aşıyor.` };
    const from = club(p.club), ask = asking(p);
    if (fee >= ask) {
      s.pending = { pid, fee, wage: wageDemand(p, me) };
      return { ok: true, stage: 'contract', text: `${from.n} ${U.money(fee)} teklifinizi kabul etti. ${p.n} haftalık ${U.money(s.pending.wage)} maaş istiyor.`, wage: s.pending.wage };
    }
    if (fee >= ask * 0.75) return { ok: false, counter: ask, text: `${from.n} teklifinizi reddetti ancak ${U.money(ask)} karşılığında satmaya hazır.` };
    return { ok: false, text: `${from.n} teklifinizi kesinlikle reddetti.` };
  }
  function acceptContract(years) {
    const s = S(), b = s.pending, me = club(s.user.club);
    if (!b) return false;
    const p = s.players[b.pid];
    if (b.fee > budget(me)) { s.pending = null; return false; }
    if (b.loan) {
      loanMove(p, me, b.fee);
      p.mor = Math.min(100, p.mor + 10);
      news('Kiralama tamamlandı', `${p.n}, ${club(p.loan.from).n}'dan sezon sonuna kadar kiralandı${b.fee ? ' (' + U.money(b.fee) + ' kiralama bedeli)' : ''}. Maaşının tamamını kulübünüz ödeyecek.`, { type: 'transfer' });
      s.pending = null; s.known[p.id] = 2;
      return true;
    }
    move(p, me, b.fee);
    me.tb = Math.max(0, (me.tb || 0) - b.fee);
    p.wage = b.wage; p.ce = s.season + years; p.mor = 80;
    s.known[p.id] = 2;
    news('Transfer tamamlandı', `${p.n} ${b.fee ? U.money(b.fee) + ' bonservisle' : 'bedelsiz olarak'} ${me.n}'a katıldı. Sözleşme: ${years} yıl, haftalık ${U.money(p.wage)}.`, { type: 'transfer' });
    s.pending = null;
    return true;
  }
  function move(p, to, fee) {
    const from = p.club != null ? club(p.club) : null;
    if (from) {
      from.players = from.players.filter(id => id !== p.id);
      from.money += fee; from.fin.tout += fee;
      from.tactic.xi = from.tactic.xi.filter(id => id !== p.id);
      from.tactic.subs = from.tactic.subs.filter(id => id !== p.id);
    }
    if (to) { to.players.push(p.id); to.money -= fee; to.fin.tin += fee; p.club = to.id; } else p.club = null;
    p.listed = false; p.loanListed = false; p.away = 0;
    (p.car = p.car || []).push({ s: S().season, c: to ? to.n : 'Serbest', fee });
  }

  // ---------- Kiralık ----------
  function seasonEnd() { return U.day(S().season + 1, 6, 30); }
  function loanMove(p, to, fee) {
    const from = club(p.club);
    from.players = from.players.filter(id => id !== p.id);
    from.tactic.xi = from.tactic.xi.filter(id => id !== p.id);
    from.tactic.subs = from.tactic.subs.filter(id => id !== p.id);
    from.money += fee; from.fin.tout += fee; to.money -= fee; to.fin.tin += fee;
    if (to.id === (S().user && S().user.club)) to.tb = Math.max(0, (to.tb || 0) - fee);
    to.players.push(p.id); p.club = to.id;
    p.loan = { from: from.id, until: seasonEnd(), fee };
    p.listed = false; p.loanListed = false; p.away = 0;
    (p.car = p.car || []).push({ s: S().season, c: to.n + ' (kiralık)', fee });
  }
  // Oyuncunun kulübü kiralamaya razı mı?
  function loanable(p) {
    const c = club(p.club);
    if (!c || p.loan) return 'Bu oyuncu kiralanamaz.';
    if (p.loanListed) return null;
    const ps = plist(c).sort((a, b) => P.ovr(b) - P.ovr(a));
    const idx = ps.indexOf(p);
    if (idx < 13) return `${c.n}, ${p.n}'i kadrosunun önemli bir parçası olarak görüyor ve kiralamaya kapalı.`;
    if (age(p) > 29 && idx < 18) return `${c.n}, deneyimli oyuncusunu kiralık göndermek istemiyor.`;
    if (c.players.length <= MIN_SQUAD + 2) return `${c.n}'ın kadrosu dar; oyuncu kiralanamaz.`;
    return null;
  }
  function loanFee(p) { return U.roundMoney(P.valueOf(p) * (p.loanListed ? 0.04 : 0.1)); }
  function loanBid(pid) {
    const s = S(), me = club(s.user.club), p = s.players[pid];
    if (!p || p.club == null || p.club === me.id || p.ntOnly) return { ok: false, text: 'Bu oyuncu kiralanamaz.' };
    if (!isWindow(s.day)) return { ok: false, text: 'Transfer dönemi kapalı; kiralama yapılamaz.' };
    if (me.players.length >= MAX_SQUAD) return { ok: false, text: `Kadronuz dolu (en fazla ${MAX_SQUAD} oyuncu).` };
    if (!foreignOk(me, p)) return { ok: false, text: `Yabancı oyuncu sınırına ulaştınız (en fazla ${leagueOf(me).foreign}).` };
    const rf = refuses(p, me) || loanable(p);
    if (rf) return { ok: false, text: rf };
    const fee = loanFee(p);
    if (fee > budget(me)) return { ok: false, text: `Kiralama bedeli (${U.money(fee)}) transfer bütçenizi aşıyor.` };
    s.pending = { pid, fee, wage: p.wage, loan: true };
    return { ok: true, stage: 'contract', loan: true, text: `${club(p.club).n} kiralamaya olumlu bakıyor: sezon sonuna kadar, ${fee ? U.money(fee) + ' kiralama bedeli' : 'bedelsiz'}. Oyuncunun haftalık ${U.money(p.wage)} maaşını siz ödeyeceksiniz.` };
  }
  function toggleLoanList(pid) { const p = S().players[pid]; p.loanListed = !p.loanListed; if (p.loanListed) p.listed = false; return p.loanListed; }
  // Sezon sonunda kiralık oyuncular kulüplerine döner
  function returnLoans() {
    const s = S();
    Object.values(s.players).forEach(p => {
      if (!p.loan) return;
      const from = club(p.loan.from), cur = club(p.club);
      if (cur) { cur.players = cur.players.filter(id => id !== p.id); cur.tactic.xi = cur.tactic.xi.filter(id => id !== p.id); cur.tactic.subs = cur.tactic.subs.filter(id => id !== p.id); }
      if (from) { from.players.push(p.id); p.club = from.id; } else p.club = null;
      if (s.user && (p.loan.from === s.user.club || (cur && cur.id === s.user.club))) news('Kiralık dönüş', `${p.n} kiralık süresini tamamlayarak ${from ? from.n : 'kulübüne'} döndü.`, { type: 'transfer' });
      p.loan = null;
    });
  }
  function release(pid) {
    const s = S(), me = club(s.user.club), p = s.players[pid];
    if (!p || p.club !== me.id) return { ok: false, text: '' };
    if (p.loan) return { ok: false, text: 'Kiralık oyuncunun sözleşmesini feshedemezsiniz.' };
    if (me.players.length <= MIN_SQUAD) return { ok: false, text: `Kadronuzda en az ${MIN_SQUAD} oyuncu olmalı.` };
    const comp = U.roundMoney(p.wage * 52 * Math.max(0, p.ce - s.season) * 0.5);
    move(p, null, 0); me.money -= comp; p.ce = s.season;
    news('Sözleşme feshi', `${p.n} ile sözleşme feshedildi. Ödenen tazminat: ${U.money(comp)}.`, { type: 'transfer' });
    return { ok: true };
  }
  function renewDemand(p) { return U.roundMoney(Math.max(p.wage * 1.1, P.wageFor(p, club(p.club).wf * (0.75 + club(p.club).rep / 200)) * (p.mor < 40 ? 1.3 : 1))); }
  function renew(pid, years) {
    const s = S(), p = s.players[pid];
    if (age(p) >= 33 && years > 2) return { ok: false, text: `${p.n} yaşı nedeniyle en fazla 2 yıllık sözleşme kabul ediyor.` };
    const w = renewDemand(p);
    p.wage = w; p.ce = s.season + years; p.mor = U.clamp(p.mor + 8, 0, 100);
    news('Sözleşme yenilendi', `${p.n} ${years} yıllık yeni sözleşme imzaladı. Haftalık maaş: ${U.money(w)}.`, { type: 'transfer' });
    return { ok: true };
  }
  function toggleList(pid) { const p = S().players[pid]; if (p.loan) return false; p.listed = !p.listed; if (p.listed) p.loanListed = false; return p.listed; }

  function incomingOffers() {
    const s = S(), u = s.user;
    if (!u.club || !isWindow(s.day)) return;
    const me = club(u.club);
    plist(me).forEach(p => {
      if (p.loan || s.offers.some(o => o.pid === p.id)) return;
      const v = P.valueOf(p);
      if (p.loanListed) {
        if (U.rand() >= 0.3) return;
        const takers = Object.values(s.clubs).filter(c => c.id !== u.club && c.lg && c.players.length < MAX_SQUAD - 3 && c.rep < me.rep + 5 && CM.Sim.strengthOf(c) < P.ovr(p) + 6);
        if (!takers.length) return;
        const b = U.pick(takers);
        const fee = U.roundMoney(v * (0.02 + U.rand() * 0.06));
        const o = { id: s.nextMsg, pid: p.id, from: b.id, amount: fee, day: s.day, loan: true };
        s.offers.push(o);
        news('Kiralama teklifi', `${b.n}, ${p.n}'i sezon sonuna kadar kiralamak istiyor.\nKiralama bedeli: ${U.money(fee)}. Oyuncunun maaşını ${b.n} ödeyecek.`, { type: 'offer', offerId: o.id, urgent: true });
        return;
      }
      const ch = p.listed ? 0.3 : (P.ovr(p) >= 78 && age(p) <= 29 ? 0.025 : 0);
      if (U.rand() >= ch) return;
      const amount = U.roundMoney(v * (p.listed ? 0.6 + U.rand() * 0.35 : 0.95 + U.rand() * 0.35));
      const buyers = Object.values(s.clubs).filter(c => c.id !== u.club && c.lg && c.money > amount * 1.2 && c.players.length < MAX_SQUAD - 2 && c.rep >= me.rep - 25);
      if (!buyers.length) return;
      const b = U.weighted(buyers, c => c.rep * c.rep);
      // Alıcının gizli üst sınırı (pazarlık payı)
      const max = U.roundMoney(Math.min(b.money * 0.7, amount * (1.08 + U.rand() * 0.4)));
      const o = { id: s.nextMsg, pid: p.id, from: b.id, amount, max: Math.max(amount, max), day: s.day, round: 0 };
      s.offers.push(o);
      news('Transfer teklifi', `${b.n}, ${p.n} için ${U.money(amount)} teklif etti.\nOyuncunun tahmini değeri: ${U.money(v)}.\nKabul edebilir, reddedebilir veya pazarlık yapabilirsiniz.`, { type: 'offer', offerId: o.id, urgent: true });
    });
    s.offers = s.offers.filter(o => s.day - o.day < 10);
  }
  function closeOffer(o) {
    const s = S();
    s.offers = s.offers.filter(x => x !== o);
    s.news.forEach(x => { if (x.offerId === o.id) x.answered = true; });
  }
  function answerOffer(id, accept) {
    const s = S(), o = s.offers.find(x => x.id === id);
    if (!o) { s.news.forEach(x => { if (x.offerId === id) x.answered = true; }); return { ok: false, text: 'Bu teklif artık geçerli değil.' }; }
    if (!isWindow(s.day)) { closeOffer(o); return { ok: false, text: 'Transfer dönemi kapandığı için teklif geçersiz.' }; }
    if (!accept) { closeOffer(o); return { ok: true, text: 'Teklif reddedildi.' }; }
    const p = s.players[o.pid], b = club(o.from), me = club(s.user.club);
    if (me.players.length <= MIN_SQUAD) return { ok: false, text: `Kadronuzda en az ${MIN_SQUAD} oyuncu kalmalı.` };
    if (p.club !== me.id || b.money < o.amount) { closeOffer(o); return { ok: false, text: 'Transfer gerçekleşemedi.' }; }
    closeOffer(o);
    if (o.loan) {
      loanMove(p, b, o.amount);
      news('Oyuncu kiralandı', `${p.n}, sezon sonuna kadar ${b.n}'a kiralandı.`, { type: 'transfer' });
      return { ok: true, text: `${p.n} kiralık gönderildi.` };
    }
    move(p, b, o.amount);
    me.tb = (me.tb || 0) + Math.round(o.amount * 0.5);
    p.wage = wageDemand(p, b); p.ce = s.season + U.ri(2, 5);
    news('Oyuncu satıldı', `${p.n}, ${U.money(o.amount)} karşılığında ${b.n}'a transfer oldu. Bedelin yarısı transfer bütçenize eklendi.`, { type: 'transfer' });
    return { ok: true, text: `${p.n} satıldı.` };
  }
  // Gelen teklife karşı teklif: alıcının gizli üst sınırına göre kabul, orta noktada yeni teklif ya da çekilme
  function counterOffer(id, ask) {
    const s = S(), o = s.offers.find(x => x.id === id);
    if (!o || o.loan) return { ok: false, text: 'Bu teklif artık geçerli değil.' };
    if (!isWindow(s.day)) { closeOffer(o); return { ok: false, text: 'Transfer dönemi kapandığı için teklif geçersiz.' }; }
    const b = club(o.from), p = s.players[o.pid];
    ask = U.roundMoney(ask);
    if (ask <= o.max) { o.amount = ask; const r = answerOffer(id, true); return Object.assign(r, { text: `${b.n} ${U.money(ask)} talebinizi kabul etti. ` + r.text }); }
    o.round = (o.round || 0) + 1;
    if (o.round >= 3 || ask > o.max * 1.6) { closeOffer(o); news('Pazarlık sonuçsuz', `${b.n}, ${p.n} için yaptığı tekliften vazgeçti.`, { type: 'transfer' }); return { ok: false, text: `${b.n} görüşmelerden çekildi.` }; }
    const next = U.roundMoney(Math.min(o.max, o.amount + (Math.min(ask, o.max) - o.amount) * (0.5 + U.rand() * 0.4) + (o.max - o.amount) * 0.3));
    o.amount = Math.max(o.amount, next);
    if (o.round === 2) o.max = o.amount; // son teklif
    return { ok: true, counter: o.amount, text: `${b.n} talebinizi yüksek buldu ve teklifini ${U.money(o.amount)} olarak güncelledi.${o.round === 2 ? ' Bu son teklifleri.' : ''}` };
  }

  // Yapay zekâ transferleri (transfer dönemlerinde)
  function aiTransfers() {
    const s = S();
    const clubs = Object.values(s.clubs).filter(c => c.lg && c.id !== s.user.club);
    const n = Math.max(2, Math.round(clubs.length * 0.025));
    const all = Object.values(s.players).filter(p => !p.ntOnly);
    for (let i = 0; i < n; i++) {
      const c = U.pick(clubs);
      const ps = plist(c);
      if (ps.length >= MAX_SQUAD - 4) { // fazla oyuncuyu bırak
        const worst = ps.sort((a, b) => P.ovr(a) - P.ovr(b))[0];
        if (worst) move(worst, null, 0);
        continue;
      }
      const lines = ['G', 'D', 'M', 'F'];
      const lineOf = p => p.pos === 'GK' ? 'G' : P.LINE[p.pos];
      const avgs = lines.map(l => { const x = ps.filter(p => lineOf(p) === l).map(P.ovr).sort((a, b) => b - a).slice(0, l === 'G' ? 1 : 3); return { l, v: x.length ? U.avg(x) : 0 }; });
      const need = avgs.sort((a, b) => a.v - b.v)[0];
      const teamAvg = U.avg(ps.map(P.ovr).sort((a, b) => b - a).slice(0, 14));
      const target = Math.max(need.v + 2, teamAvg - 2);
      const cands = [];
      for (let k = 0; k < 300; k++) {
        const p = all[Math.floor(U.rand() * all.length)];
        if (p.club === c.id || p.club === s.user.club || p.loan || lineOf(p) !== need.l) continue;
        const o = P.ovr(p);
        if (o < target || o > teamAvg + 9 || age(p) > 31) continue;
        const from = p.club != null ? club(p.club) : null;
        if (from && (from.rep > c.rep + 6 || from.players.length <= MIN_SQUAD + 2)) continue;
        if (!foreignOk(c, p)) continue;
        cands.push(p);
        if (cands.length >= 6) break;
      }
      if (!cands.length) continue;
      const p = cands.sort((a, b) => P.ovr(b) - P.ovr(a))[0];
      const fee = p.club == null ? 0 : asking(p);
      if (fee > c.money * 0.6) continue;
      const from = p.club != null ? club(p.club) : null;
      move(p, c, fee);
      p.wage = wageDemand(p, c); p.ce = s.season + U.ri(2, 5);
      if (s.known[p.id] || fee >= 8e6) {
        const mineLeague = from && from.lg === (club(s.user.club) || {}).lg || c.lg === (club(s.user.club) || {}).lg;
        if (fee >= 15e6 || mineLeague) news('Transfer haberi', `${p.n}, ${from ? from.n + "'dan " + U.money(fee) + ' bedelle' : 'serbest olarak'} ${c.n}'a transfer oldu.`, { type: 'world' });
      }
    }
  }

  // ---------- Haftalık ----------
  function weekly(d) {
    const s = S(), u = s.user;
    // Finans
    for (const id in s.clubs) {
      const c = s.clubs[id];
      const L = leagueOf(c);
      const tv = L ? L.tv : 2e6;
      const spons = 120e6 * Math.pow(c.rep / 100, 8) * (c.cty === 'KSA' && c.rep > 80 ? 2 : 1);
      const inc = U.roundMoney((tv * (0.7 + 0.6 * c.rep / 100) + spons) / 52);
      let wages = 0;
      for (const pid of c.players) { const p = s.players[pid]; if (p) wages += p.wage; }
      // İşletme giderleri: personel, tesis, altyapı, vergiler, borç ödemeleri
      const ops = U.roundMoney(inc * 0.62 + (c.cap || 10000) * 6);
      c.money += inc - wages - ops;
      c.fin.tv += inc; c.fin.wages += wages; c.fin.ops = (c.fin.ops || 0) + ops;
      c.wageBill = wages; c.weekInc = inc; c.weekOps = ops;
      // AI kulüplerin borç kontrolü
      if (c.money < -20e6 && c.id !== (u && u.club)) c.money = -20e6;
    }
    // Gelişim ve antrenman
    const uc = u && u.club ? club(u.club) : null;
    const tr = uc ? uc.train || { focus: 'genel', int: 'normal' } : null;
    for (const id in s.players) {
      const p = s.players[id];
      if (p.club != null && uc && p.club === uc.id) {
        const I = TRAIN_INT[tr.int];
        const focus = TRAIN_FOCUS[tr.focus].attrs.concat(p.tf ? [p.tf, p.tf] : []);
        P.develop(p, s.season, 0.042 * I.dev, focus);
        if (p.inj <= 0 && U.rand() < I.inj) { const j = CM.Sim.rollInjury(); p.inj = Math.ceil(j.days / 2); p.injN = j.n + ' (antrenman)'; news('Antrenman sakatlığı', `${p.n} antrenmanda sakatlandı (${p.injN}). ${Math.max(1, Math.round(p.inj / 7))} hafta yok.`, { type: 'squad' }); }
        p.cond = U.clamp(p.cond + I.cond, 30, 100);
      } else P.develop(p, s.season, 0.036);
      if (p.mor < 50) p.mor += 1; else if (p.mor > 75) p.mor -= 1;
    }
    if (uc) {
      uc.trainB = tr.focus === 'taktik' ? 1.02 : 1;
      if (u.lastWeek !== undefined) { /* istatistik */ }
      u.lastFin = { inc: uc.weekInc, wages: uc.wageBill };
      if (uc.money < 0 && U.ymd(d).d <= 7) { u.conf = U.clamp(u.conf - 2, 0, 100); news('Mali uyarı', `Kulüp hesabı ekside (${U.money(uc.money)}). Yönetim maaş yükünü azaltmanızı istiyor.`, { type: 'board' }); }
      if (u.conf < 20 && U.ymd(d).d <= 7) news('Yönetimden uyarı', 'Yönetim kurulu sonuçlardan endişeli. Durum düzelmezse göreviniz tehlikeye girebilir.', { type: 'board' });
    }
    if (isWindow(d) && isWindow(d + 3)) incomingOffers();
    scoutingTick(7);
  }
  function daily(d) {
    const s = S(), t = U.ymd(d);
    if (isWindow(d)) aiTransfers();
    if ((t.m === 9 && t.d === 2) || (t.m === 2 && t.d === 3)) s.offers.slice().forEach(closeOffer);
    if (t.m === 9 && t.d === 1) news('Transfer dönemi kapandı', 'Yaz transfer dönemi sona erdi. Bir sonraki dönem 2 Ocak\'ta açılacak.', { type: 'world' });
    if (t.m === 2 && t.d === 2) news('Ara transfer dönemi kapandı', 'Ocak transfer dönemi sona erdi. Yaz dönemi 1 Temmuz\'da açılacak.', { type: 'world' });
    if (t.m === 1 && t.d === 2) news('Ara transfer dönemi açıldı', 'Ocak transfer dönemi 2 Şubat\'a kadar açık.', { type: 'world' });
    if (t.m === 3 && t.d === 15) youthIntake();
  }

  // ---------- Gözlem ----------
  function scoutingTick(days) {
    const s = S();
    const done = [];
    s.scoutTasks.forEach(tk => { tk.left -= days; if (tk.left <= 0) done.push(tk); });
    done.forEach(tk => {
      if (tk.type === 'p') { s.known[tk.id] = 2; const p = s.players[tk.id]; if (p) news('Gözlem raporu', `${p.n} hakkındaki gözlem raporu hazır. Oyuncunun tüm özellikleri artık görülebilir.`, { type: 'scout', pid: p.id }); }
      else {
        let n = 0;
        Object.values(s.players).forEach(p => {
          const c = p.club != null ? club(p.club) : null;
          const hit = tk.type === 'n' ? p.nat === tk.id : c && c.lg === tk.id;
          if (hit && !p.ntOnly) { s.known[p.id] = Math.max(s.known[p.id] || 0, 2); n++; }
        });
        news('Gözlem raporu', `${tk.label} gözlem çalışması tamamlandı: ${n} oyuncunun raporu hazır.`, { type: 'scout' });
      }
    });
    s.scoutTasks = s.scoutTasks.filter(tk => tk.left > 0);
  }
  function scout(type, id, label) {
    const s = S(), c = club(s.user.club);
    if (s.scoutTasks.length >= c.scouts) return { ok: false, text: `Tüm gözlemcileriniz meşgul (${c.scouts} gözlemci).` };
    if (s.scoutTasks.some(t => t.type === type && t.id === id)) return { ok: false, text: 'Bu gözlem zaten sürüyor.' };
    s.scoutTasks.push({ type, id, label, left: type === 'p' ? 7 : 28 });
    return { ok: true, text: type === 'p' ? 'Gözlemci görevlendirildi, rapor 1 hafta içinde hazır.' : 'Gözlem çalışması başladı, rapor 4 hafta içinde hazır.' };
  }
  // Bilinmeyen oyuncu için tahmini değer aralığı
  function known(p) { const s = S(); if (p.club === (s.user && s.user.club)) return 2; return s.known[p.id] || 0; }
  function fuzz(p, v, k) {
    const lvl = known(p);
    if (lvl >= 2) return null;
    const r = U.seeded('f' + p.id + k)();
    const w = lvl === 1 ? 2 : 4;
    const lo = Math.max(1, Math.round(v - w * r)), hi = Math.min(20, lo + w);
    return [lo, hi];
  }

  // ---------- Altyapı ----------
  function youthIntake() {
    const s = S();
    Object.values(s.clubs).forEach(c => {
      if (!c.lg) return;
      const isU = s.user && c.id === s.user.club;
      const n = isU ? U.ri(3, 5) : U.ri(2, 3);
      const base = CM.World.repToAbility(c.rep) - 31 + c.youth * 1.2;
      const list = [];
      for (let i = 0; i < n; i++) {
        const pos = U.pick(['GK', 'CB', 'CB', 'LB', 'RB', 'DM', 'CM', 'CM', 'AM', 'LW', 'RW', 'ST', 'ST']);
        const p = P.generate(pos, Math.round(base + U.gauss() * 4), U.ri(16, 17), c.cty && CM.DB.nations[c.cty] ? c.cty : 'ENG', s.season, { youth: true });
        p.pa = Math.min(90, p.pa + c.youth);
        p.id = s.nextPid++; p.club = c.id; p.wage = 500; p.ce = s.season + 3;
        s.players[p.id] = p; c.players.push(p.id); list.push(p);
        if (isU) s.known[p.id] = 2;
      }
      if (isU) news('Altyapıdan yeni oyuncular', `Altyapıdan A takıma yükselen oyuncular:\n${list.map(p => `• ${p.n} (${P.POS_LONG[p.pos]}, ${age(p)})`).join('\n')}`, { type: 'squad' });
    });
  }

  // ---------- Sezon sonu ----------
  function endSeason(Y) {
    const s = S(), u = s.user;
    // Yönetim değerlendirmesi
    if (u && u.club) {
      const c = club(u.club);
      const lc = s.comps[`${c.lg}-${Y}`];
      if (lc && lc.rank) {
        const pos = lc.rank.indexOf(c.id) + 1;
        const d = (u.exp.pos - pos) * 4 + (pos === 1 ? 20 : 0);
        u.conf = U.clamp(u.conf + d, 0, 100);
        news('Sezon değerlendirmesi', `${c.n} ligi ${pos}. sırada tamamladı. Yönetimin beklentisi ${u.exp.text} idi. ${pos <= u.exp.pos ? 'Yönetim performansınızdan memnun.' : 'Yönetim beklentilerin altında kalındığını düşünüyor.'}`, { type: 'board' });
        u.history.push({ s: Y, club: c.n, pos, lg: CM.LEAGUES[c.lg].n });
        if (u.conf <= 0) sack();
        else if (pos <= Math.max(1, u.exp.pos - 2) && U.rand() < 0.5) {
          const big = Object.values(s.clubs).filter(x => x.lg && x.rep > c.rep + 3 && x.rep < c.rep + 15);
          if (big.length) { const b = U.pick(big); u.offers = [b.id]; news('İş teklifi', `Başarılı sezonunuz dikkat çekti: ${b.n} size teknik direktörlük teklif ediyor.`, { type: 'job', club: b.id, urgent: true }); }
        }
      }
    }
    // Oyuncular: gelişim, sözleşme, emeklilik
    const retire = [];
    Object.values(s.players).forEach(p => {
      for (let k = 0; k < 5; k++) P.develop(p, Y + 1, 0.22);
      const a = Y + 1 - p.b;
      if (p.club != null && p.ce <= Y) {
        const c = club(p.club);
        if (u && c.id === u.club) { news('Sözleşmesi biten oyuncu', `${p.n}'in sözleşmesi sona erdi ve kulüpten ayrıldı.`, { type: 'transfer' }); move(p, null, 0); }
        else {
          // Kulüpler iyi oyuncularının sözleşmesini büyük olasılıkla uzatır
          const o = P.ovr(p), rank = plist(c).sort((x, y) => P.ovr(y) - P.ovr(x)).indexOf(p);
          let ch = a >= 35 ? 0.25 : a >= 33 ? 0.55 : 0.8;
          if (rank < 14) ch += 0.17; if (o >= 78) ch += 0.1;
          if (U.rand() < ch) { p.ce = Y + 1 + (a >= 32 ? 1 : U.ri(1, 4)); p.wage = Math.max(p.wage, P.wageFor(p, c.wf * (0.75 + c.rep / 200))); }
          else move(p, null, 0);
        }
      }
      if (a >= 34 && U.rand() < (a - 33) * 0.28) retire.push(p);
      else if (p.club == null && !p.ntOnly && a >= 32 && U.rand() < 0.5) retire.push(p);
    });
    retire.forEach(p => {
      if (u && p.club === u.club) news('Emeklilik', `${p.n} ${Y + 1 - p.b} yaşında futbolu bıraktığını açıkladı.`, { type: 'squad' });
      if (p.club != null) move(p, null, 0);
      delete s.players[p.id];
    });
    // Milli takım kadrolarından silinenleri temizle
    Object.values(s.nats).forEach(n => { n.squad = n.squad.filter(id => s.players[id]); });
    // Milli takımlar için eksik oyuncu yenile
    Object.values(s.clubs).forEach(c => { c.players = c.players.filter(id => s.players[id]); c.fin = { gate: 0, tv: 0, prize: 0, wages: 0, tin: 0, tout: 0, spons: 0 }; });
    // AI kadro tamamlama
    Object.values(s.clubs).forEach(c => {
      if (u && c.id === u.club) return;
      if (c.players.length < 22) CM.World.fillSquad(c, '', s);
    });
    // Serbest oyuncu havuzu
    const free = Object.values(s.players).filter(p => p.club == null && !p.ntOnly);
    if (free.length < 120) for (let i = 0; i < 40; i++) {
      const p = P.generate(U.pick(P.POS), U.ri(52, 70), U.ri(21, 31), U.pick(Object.keys(CM.DB.nations)), Y + 1);
      p.id = s.nextPid++; p.club = null; p.ce = Y + 1; p.wage = P.wageFor(p, 0.6); s.players[p.id] = p;
    }
    s.offers = [];
    // Milli takım ntOnly oyuncuları yaşlandıkça yenilenir
    Object.values(s.players).filter(p => p.ntOnly && Y + 1 - p.b >= 34).forEach(p => {
      const q = P.generate(p.pos, Math.max(40, P.ovr(p)), U.ri(21, 25), p.nat, Y + 1); q.id = s.nextPid++; q.ntOnly = true; q.club = null; s.players[q.id] = q;
      delete s.players[p.id];
    });
  }

  CM.Market = {
    TRAIN_FOCUS, TRAIN_INT, IND_FOCUS, MAX_SQUAD, MIN_SQUAD, isWindow, initUser, boardNewSeason, boardAfterMatch, takeJob, jobOffers,
    asking, wageDemand, makeBid, acceptContract, move, release, renewDemand, renew, toggleList, answerOffer, counterOffer, weekly, daily,
    loanBid, loanFee, loanable, toggleLoanList, returnLoans, budget, setBudget,
    scout, known, fuzz, endSeason, setExpectation
  };
})(typeof window !== 'undefined' ? window : globalThis);
