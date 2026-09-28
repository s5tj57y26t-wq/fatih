/* Menajerlik derinliği: kişilikler, oyuncu konuşmaları, basın, tesisler, yönetim istekleri,
   menajer itibarı, ödüller, rekorlar, arşiv, sezon özeti, izleme listesi, rakip raporu */
(function (G) {
  'use strict';
  const CM = G.CM, U = CM.U, P = CM.P, C = CM.Comp;
  const S = () => CM.S;
  const news = (t, b, o) => CM.Game.news(t, b, o);
  const club = id => S().clubs[id];
  const uclub = () => { const u = S().user; return u && u.club != null ? club(u.club) : null; };
  const age = p => S().season - p.b;
  const plist = c => c.players.map(id => S().players[id]).filter(Boolean);

  // ---------- Kişilik ----------
  const PERS = {
    profesyonel: { n: 'Profesyonel', d: 'İşine odaklı; eleştiriyi yapıcı karşılar, formu istikrarlıdır.' },
    sakin: { n: 'Sakin', d: 'Kolay kolay etkilenmez; baskı altında soğukkanlıdır.' },
    hirsli: { n: 'Hırslı', d: 'Kazanmak ister; sert konuşmaya iyi tepki verir, süre alamazsa sabırsızlanır.' },
    sadik: { n: 'Sadık', d: 'Kulübüne bağlıdır; ayrılmak istemesi zordur, ikna etmek kolaydır.' },
    duygusal: { n: 'Duygusal', d: 'Övgü ve eleştiriden çok etkilenir; morali hızlı değişir.' },
    kaprisli: { n: 'Kaprisli', d: 'Kolay küser; süre alamazsa veya eleştirilirse sorun çıkarır.' },
    lider: { n: 'Lider', d: 'Takım arkadaşlarını motive eder; kaptan olursa takım konuşmalarının etkisi artar.' }
  };
  const PERS_W = [['profesyonel', 22], ['sakin', 18], ['hirsli', 16], ['sadik', 14], ['duygusal', 12], ['kaprisli', 10], ['lider', 8]];
  function pers(p) {
    if (!p._pe) {
      let r = U.seeded('pe' + p.n + p.b)() * 100;
      p._pe = 'sakin';
      for (const [k, w] of PERS_W) { if (r < w) { p._pe = k; break; } r -= w; }
    }
    return p._pe;
  }
  function seasonApps(p) { let n = 0; for (const k in p.st) n += p.st[k][0]; return n; }
  function form(p) { let r = 0, n = 0; for (const k in p.st) { r += p.st[k][3]; n += p.st[k][4]; } return n ? r / n : null; }

  // ---------- Oyuncuyla konuşma ----------
  const TALKS = {
    praise: 'Performansını öv',
    crit: 'Performansını eleştir',
    time: 'Daha fazla süre sözü ver',
    calm: 'Kalması için ikna et',
    capt: 'Kaptan yap'
  };
  function talk(pid, kind) {
    const s = S(), p = s.players[pid], c = uclub();
    if (!p || !c || p.club !== c.id) return { ok: false, text: 'Bu oyuncuyla konuşamazsınız.' };
    if (kind !== 'capt' && p.talkDay && s.day - p.talkDay < 14) return { ok: false, text: `${p.n} ile kısa süre önce konuştunuz. Biraz zaman tanıyın.` };
    const pe = pers(p), f = form(p);
    let d = 0, txt = '';
    if (kind === 'praise') {
      if (f == null || f >= 6.9) { d = pe === 'duygusal' ? 10 : pe === 'kaprisli' ? 4 : 7; txt = 'Övgünüzden çok memnun kaldı.'; }
      else if (f < 6.4) { d = pe === 'profesyonel' || pe === 'hirsli' ? -4 : 1; txt = 'Formunun kötü olduğunu biliyor; övgünüzü samimi bulmadı.'; }
      else { d = 3; txt = 'Teşekkür etti.'; }
    } else if (kind === 'crit') {
      if (f != null && f < 6.6) {
        d = pe === 'hirsli' || pe === 'profesyonel' || pe === 'lider' ? 6 : pe === 'kaprisli' || pe === 'duygusal' ? -10 : -2;
        txt = d > 0 ? 'Eleştiriyi kabul etti, daha çok çalışacağını söyledi.' : 'Eleştirinize çok bozuldu.';
      } else { d = pe === 'sakin' ? -3 : -8; txt = 'İyi oynadığını düşünüyor; eleştirinizi haksız buldu.'; }
    } else if (kind === 'time') {
      if (p.promise) return { ok: false, text: `${p.n}'e zaten süre sözü verdiniz.` };
      p.promise = { until: s.day + 42, need: 4, start: seasonApps(p) };
      d = 10; txt = 'Söz verdiğiniz için mutlu. Önümüzdeki 6 haftada en az 4 maçta forma bekliyor.';
    } else if (kind === 'calm') {
      if (!p.wantsOut) return { ok: false, text: `${p.n} zaten kulüpte mutlu.` };
      const ch = ({ sadik: 0.75, sakin: 0.6, profesyonel: 0.5, lider: 0.45, duygusal: 0.45, hirsli: 0.3, kaprisli: 0.2 }[pe]) + (p.mor - 30) / 200;
      if (U.rand() < ch) { p.wantsOut = false; d = 12; txt = 'İkna oldu; kulüpte kalıp yerini kazanmak için savaşacak.'; }
      else { d = -4; txt = 'Kararlı: ayrılmak istiyor.'; }
    } else if (kind === 'capt') {
      const old = c.captain != null ? s.players[c.captain] : null;
      if (old && old.id !== p.id) { old.mor = U.clamp(old.mor - (pers(old) === 'kaprisli' || pers(old) === 'duygusal' ? 12 : 5), 5, 100); }
      c.captain = p.id; d = 8;
      txt = `artık takımın kaptanı.${pe === 'lider' ? ' Doğal bir lider; takım konuşmalarınızın etkisi artacak.' : ''}`;
      if (old && old.id !== p.id) txt += ` ${old.n} kaptanlığı kaybettiği için üzgün.`;
    }
    if (kind !== 'capt') p.talkDay = s.day;
    p.mor = U.clamp(p.mor + d, 5, 100);
    return { ok: true, d, text: `${p.n}: ${txt}` };
  }
  function captainLeader() { const c = uclub(); const p = c && c.captain != null ? S().players[c.captain] : null; return !!(p && p.club === c.id && pers(p) === 'lider'); }

  // Haftalık: süre sözleri, forma hasreti, transfer istekleri, kaptan etkisi
  function weeklySquad() {
    const s = S(), c = uclub();
    if (!c) return;
    const ps = plist(c);
    const order = ps.slice().sort((a, b) => P.ovr(b) - P.ovr(a));
    const started = s.day - (CM.S.user.started || s.day) > 30;
    let unhappy = 0;
    ps.forEach(p => {
      const pe = pers(p);
      if (p.promise) {
        const got = seasonApps(p) - p.promise.start;
        if (got >= p.promise.need) { p.mor = U.clamp(p.mor + 4, 5, 100); p.promise = null; }
        else if (s.day > p.promise.until) {
          p.promise = null; p.mor = U.clamp(p.mor - 22, 5, 100);
          news('Verilen söz tutulmadı', `${p.n}, kendisine verdiğiniz süre sözünün tutulmadığını söylüyor ve çok öfkeli.`, { type: 'squad', pid: p.id });
        }
      }
      const rank = order.indexOf(p);
      const benched = started && p.inj <= 0 && !p.loan && (s.day - (p.lastPlay || 0)) > 35 && age(p) >= 20 && age(p) <= 31;
      if (benched && rank < 20) p.mor = U.clamp(p.mor - (pe === 'kaprisli' ? 5 : pe === 'hirsli' ? 4 : pe === 'sadik' || pe === 'sakin' ? 1 : 2), 5, 100);
      if (!p.wantsOut && !p.loan && p.mor < (pe === 'kaprisli' ? 32 : pe === 'sadik' ? 15 : 24) && P.ovr(p) >= 60) {
        p.wantsOut = true;
        news('Transfer talebi', `${p.n} mutsuz olduğunu ve kulüpten ayrılmak istediğini açıkladı. Oyuncuyla konuşabilir veya satış listesine koyabilirsiniz.`, { type: 'squad', pid: p.id, urgent: true });
      }
      if (p.wantsOut) { unhappy++; p.mor = Math.min(p.mor, 40); }
    });
    if (captainLeader()) ps.forEach(p => { if (p.mor < 75) p.mor += 1; });
    if (unhappy >= 3) ps.forEach(p => { if (!p.wantsOut) p.mor = U.clamp(p.mor - 1, 5, 100); });
  }

  // ---------- Basın toplantısı ----------
  const PRESS_PRE = [
    { q: 'Rakibiniz hakkında ne düşünüyorsunuz?', a: [['fav', 'Kazanması gereken taraf biziz.'], ['resp', 'Güçlü bir rakip, saygı duyuyoruz.'], ['mind', 'Asıl baskı onların üzerinde.']] },
    { q: 'Bu maçtan beklentiniz nedir?', a: [['fav', 'Üç puanı alacağımızdan eminim.'], ['resp', 'Zor bir maç olacak, maç maç ilerliyoruz.'], ['mind', 'Rakibimiz bizden daha çok endişelenmeli.']] },
    { q: 'Takımınızın son formunu nasıl değerlendiriyorsunuz?', a: [['fav', 'Oyuncularıma güveniyorum, bu seriyi sürdüreceğiz.'], ['resp', 'Geliştirmemiz gereken yerler var.'], ['mind', 'Kimse bizi hafife almasın.']] }
  ];
  const PRESS_POST = {
    q: 'Maçı nasıl değerlendiriyorsunuz?',
    a: [['praise', 'Oyuncularımı tebrik ediyorum, her şeylerini verdiler.'], ['crit', 'Bu performans yeterli değil, daha iyisini bekliyorum.'], ['ref', 'Hakem kararları maçın önüne geçti.'], ['calm', 'Önümüze bakacağız, sezon uzun.']]
  };
  function bigMatch(f) {
    const s = S(), c = s.comps[f.c], u = s.user;
    if (!c) return false;
    if (c.intl || c.type === 'cup' || f.rnd !== undefined) return true;
    const me = C.tObj(u.club === f.h || 'N:' + u.nat === f.h ? f.h : f.a), op = C.tObj(me === C.tObj(f.h) ? f.a : f.h);
    return (op.rep || 50) >= (me.rep || 50) - 4 || U.seeded('pr' + f.c + f.id)() < 0.35;
  }
  function pressQuestion(f) { return PRESS_PRE[U.hash(f.c + ':' + f.id) % PRESS_PRE.length]; }
  function pressPre(f, stance) {
    const s = S(), u = s.user;
    u.press = { c: f.c, id: f.id, st: stance };
    const my = f.h === u.club || f.a === u.club ? uclub() : null;
    if (my && stance === 'fav') plist(my).forEach(p => { p.mor = U.clamp(p.mor + 2, 5, 100); });
    return stance === 'fav' ? 'Açıklamanız oyunculara güven verdi, ama kaybederseniz eleştiri alacaksınız.' : stance === 'mind' ? 'Rakip taraf açıklamanıza tepki gösterdi.' : 'Temkinli açıklamanız olumlu karşılandı.';
  }
  // Maç sonrası: ön açıklamanın sonucu
  function onUserResult(f, won, lost) {
    const s = S(), u = s.user;
    if (!u.press || u.press.c !== f.c || u.press.id !== f.id) return;
    const st = u.press.st; u.press = null;
    if (st === 'fav' && lost) { u.conf = U.clamp(u.conf - 3, 0, 100); news('Basın eleştirisi', 'Maç öncesi "kazanması gereken taraf biziz" açıklamanız, mağlubiyetin ardından basında sert eleştirildi.', { type: 'board' }); }
    else if (st === 'fav' && won) u.conf = U.clamp(u.conf + 1.5, 0, 100);
    else if (st === 'mind' && won) { const c = uclub(); if (c) plist(c).forEach(p => { p.mor = U.clamp(p.mor + 2, 5, 100); }); }
  }
  function pressPost(f, k, playedIds) {
    const s = S(), c = uclub();
    const ids = playedIds || [];
    let txt = '';
    if (k === 'praise') { ids.forEach(id => { const p = s.players[id]; if (p) p.mor = U.clamp(p.mor + 3, 5, 100); }); txt = 'Oyuncularınız sözlerinizden memnun.'; }
    else if (k === 'crit') {
      ids.forEach(id => { const p = s.players[id]; if (!p) return; const pe = pers(p); p.mor = U.clamp(p.mor + (pe === 'hirsli' || pe === 'profesyonel' ? 2 : pe === 'kaprisli' || pe === 'duygusal' ? -6 : -2), 5, 100); });
      txt = 'Eleştiriniz soyunma odasında farklı tepkilere yol açtı.';
    } else if (k === 'ref') {
      if (U.rand() < 0.2 && c) { const fine = U.ri(2, 6) * 10000; c.money -= fine; txt = `Federasyon hakem açıklamanız nedeniyle kulübe ${U.money(fine)} para cezası verdi.`; news('Para cezası', txt, { type: 'board' }); }
      else txt = 'Taraftarlar açıklamanıza destek verdi.';
    } else txt = 'Soğukkanlı açıklamanız olumlu karşılandı.';
    return txt;
  }

  // ---------- Tesisler ve yönetim istekleri ----------
  const FAC = {
    train: { n: 'Antrenman tesisleri', days: 180, d: 'Oyuncu gelişim hızını artırır.' },
    youth: { n: 'Altyapı tesisleri', days: 240, d: 'Altyapıdan gelen oyuncuların kalitesini artırır.' },
    stad: { n: 'Stadyum genişletme (+%10 kapasite)', days: 300, d: 'Maç günü gelirini artırır.' }
  };
  function trainF(c) { if (c.trainF == null) c.trainF = U.clamp(Math.round(c.rep / 20), 1, 5); return c.trainF; }
  function facCost(c, k) {
    const lv = k === 'train' ? trainF(c) : k === 'youth' ? c.youth : 0;
    if (k === 'stad') return U.roundMoney(Math.round((c.cap || 10000) * 0.1) * 3200);
    return U.roundMoney((k === 'train' ? 4e6 : 3e6) * Math.pow(lv + 1, 1.6) * (0.6 + (c.wf || 0.5) * 0.4));
  }
  function boardRequest(k) {
    const s = S(), u = s.user, c = uclub();
    if (!c) return { ok: false, text: '' };
    c.req = c.req || {};
    if (c.req[k] && s.day < c.req[k]) return { ok: false, text: `Yönetim bu konuyu ${Math.ceil((c.req[k] - s.day) / 7)} hafta sonra yeniden konuşmak istiyor.` };
    if (k === 'budget') {
      c.req[k] = s.day + 60;
      const tb = CM.Market.budget(c);
      if (u.conf >= 55 && c.money > tb * 1.35 + 2e6) {
        const add = U.roundMoney(Math.min(c.money - tb, (c.money - tb) * (0.2 + (u.conf - 55) / 150)));
        c.tb = (c.tb || 0) + add;
        return { ok: true, text: `Yönetim transfer bütçenizi ${U.money(add)} artırdı. Yeni bütçe: ${U.money(CM.Market.budget(c))}.` };
      }
      u.conf = U.clamp(u.conf - 1.5, 0, 100);
      return { ok: false, text: u.conf < 55 ? 'Yönetim sonuçlardan memnun olmadığı için ek bütçe vermeyi reddetti.' : 'Kulübün mali durumu ek transfer bütçesine izin vermiyor.' };
    }
    const F = FAC[k];
    if (!F) return { ok: false, text: '' };
    if ((c.proj || []).length) return { ok: false, text: 'Devam eden bir tesis projesi var; bitmeden yenisine başlanamaz.' };
    if (k === 'train' && trainF(c) >= 5) return { ok: false, text: 'Antrenman tesisleriniz zaten en üst seviyede.' };
    if (k === 'youth' && c.youth >= 5) return { ok: false, text: 'Altyapı tesisleriniz zaten en üst seviyede.' };
    const cost = facCost(c, k);
    c.req[k] = s.day + 45;
    if (u.conf < 45) return { ok: false, text: 'Yönetim size yeterince güvenmediği için yatırımı onaylamadı.' };
    if (c.money < cost * 1.3) return { ok: false, text: `Yatırım için kasada yeterli para yok (maliyet ${U.money(cost)}).` };
    if (U.rand() > 0.35 + (u.conf - 45) / 60) return { ok: false, text: 'Yönetim yatırımı bu sezon için uygun görmedi.' };
    c.money -= cost; c.fin.ops = (c.fin.ops || 0) + cost;
    c.proj = [{ k, done: s.day + F.days, cost }];
    return { ok: true, text: `Yönetim ${F.n} projesini onayladı (${U.money(cost)}). Tahmini bitiş: ${U.fmtDay(s.day + F.days)}.` };
  }
  function projectsTick() {
    const s = S(), c = uclub();
    if (!c || !(c.proj || []).length) return;
    const pr = c.proj[0];
    if (s.day < pr.done) return;
    c.proj = [];
    if (pr.k === 'train') c.trainF = trainF(c) + 1;
    else if (pr.k === 'youth') c.youth = Math.min(5, c.youth + 1);
    else if (pr.k === 'stad') c.cap = Math.round((c.cap || 10000) * 1.1);
    news('Tesis projesi tamamlandı', `${FAC[pr.k].n} projesi tamamlandı.`, { type: 'board' });
  }
  function setYouthNet(code) { const c = uclub(); if (!c) return; c.ynet = code || null; }

  // ---------- Menajer itibarı ----------
  function urep() { const u = S().user; if (u.rep == null) { const c = uclub(); u.rep = U.clamp(Math.round((c ? c.rep : 60) - 12), 25, 80); } return u.rep; }
  function addRep(v) { const u = S().user; u.rep = U.clamp(urep() + v, 1, 99); }
  function repLabel(r) { return r >= 90 ? 'Dünya çapında' : r >= 78 ? 'Kıta çapında' : r >= 65 ? 'Ulusal' : r >= 50 ? 'Bölgesel' : 'Yerel'; }
  // Yapay zekâ kulüplerinde teknik direktör değişiklikleri ve kullanıcıya gelen teklifler
  function aiSackings() {
    const s = S(), u = s.user, mine = uclub();
    for (const lg in CM.LEAGUES) {
      const L = CM.LEAGUES[lg]; if (L.tier !== 1) continue;
      const lc = s.comps[`${lg}-${s.season}`]; if (!lc || !lc.tbl) continue;
      const st = C.standings(lc), byRep = lc.teams.slice().sort((a, b) => club(b).rep - club(a).rep);
      st.forEach((id, i) => {
        if (id === u.club) return;
        const exp = byRep.indexOf(id);
        if (i - exp < Math.max(5, st.length * 0.3) || U.rand() > 0.35) return;
        const c = club(id);
        if ((mine && mine.lg === lg) || ['ENG1', 'ESP1', 'GER1', 'ITA1', 'FRA1', 'TUR1'].includes(lg)) news('Teknik direktör değişikliği', `${c.n}, kötü gidişat nedeniyle teknik direktörüyle yollarını ayırdı.`, { type: 'world' });
        if (urep() >= c.rep - 8 && (!mine || c.rep > mine.rep + 2) && U.rand() < 0.6) {
          u.offers = (u.offers || []).filter(x => x !== id).concat([id]);
          news('İş teklifi', `${c.n} (${L.n}) yönetimi, boşalan teknik direktörlük görevi için sizinle görüşmek istiyor.`, { type: 'job', club: id, urgent: true });
        }
      });
    }
  }
  function natOffer() {
    const s = S(), u = s.user;
    if (u.nat || urep() < 58 || U.rand() > 0.45) return;
    const cands = Object.keys(s.nats).filter(k => k !== 'RUS' && s.nats[k].str <= urep() + 2 && s.nats[k].str >= urep() - 22);
    if (!cands.length) return;
    const k = U.pick(cands);
    u.natOffer = k;
    news('Milli takım teklifi', `${s.nats[k].n} Futbol Federasyonu, kulübünüzdeki görevinizle birlikte milli takımı da çalıştırmanızı istiyor.`, { type: 'natjob', nat: k, urgent: true });
  }
  function takeNat(k) {
    const s = S(), u = s.user;
    if (u.natOffer !== k) return false;
    u.nat = k; u.natOffer = null; u.confNT = 60;
    news('Milli takım görevi', `${s.nats[k].n} milli takımının teknik direktörlüğünü kabul ettiniz.`, { type: 'nat' });
    return true;
  }

  // ---------- Maç kayıtları: aylık istatistik, rekorlar, efsaneler, gol primi ----------
  function onPlayer(p, ps, clubObj) {
    const m = p.ms || (p.ms = [0, 0, 0, 0]);
    m[0]++; m[1] += ps.g; if (ps.rating) { m[2] += ps.rating; m[3]++; }
    const u = S().user;
    if (clubObj && u && clubObj.id === u.club) {
      if (p.gb && ps.g) { const pay = p.gb * ps.g; clubObj.money -= pay; clubObj.fin.wages += pay; }
      const L = clubObj.leg || (clubObj.leg = {});
      const e = L[p.id] || (L[p.id] = { n: p.n, a: 0, g: 0 });
      e.a++; e.g += ps.g;
    }
  }
  function onMatch(f) {
    const s = S(), u = s.user;
    if (!u || u.club == null || (f.h !== u.club && f.a !== u.club)) return;
    const c = uclub(), home = f.h === u.club;
    const gf = home ? f.hg : f.ag, ga = home ? f.ag : f.hg, opp = C.tName(home ? f.a : f.h);
    const R = c.rec || (c.rec = {});
    if (gf - ga > 0 && (!R.win || gf - ga > R.win[0] - R.win[1] || (gf - ga === R.win[0] - R.win[1] && gf > R.win[0]))) {
      if (R.win) news('Kulüp rekoru', `${gf}-${ga}'lik ${opp} galibiyeti, oyun içindeki en farklı galibiyetiniz oldu.`, { type: 'squad' });
      R.win = [gf, ga, opp, s.season];
    }
    if (ga - gf > 0 && (!R.loss || ga - gf > R.loss[1] - R.loss[0])) R.loss = [gf, ga, opp, s.season];
    const won = gf > ga || (f.ph != null && (home ? f.ph > f.pa : f.pa > f.ph));
    const lost = gf < ga || (f.ph != null && !won);
    onUserResult(f, won, lost);
  }
  function onTransfer(p, from, to, fee) {
    if (!fee) return;
    const s = S();
    [[to, 'buy'], [from, 'sell']].forEach(([c, k]) => {
      if (!c) return;
      const R = c.rec || (c.rec = {});
      if (!R[k] || fee > R[k][0]) {
        R[k] = [fee, p.n, s.season];
        if (s.user && c.id === s.user.club) news('Kulüp rekoru', `${p.n} transferi (${U.money(fee)}) kulübün oyun içindeki en yüksek ${k === 'buy' ? 'bonservis harcaması' : 'satış geliri'} oldu.`, { type: 'transfer' });
      }
    });
  }

  // ---------- Ödüller ----------
  function avgR(x) { return x[4] ? x[3] / x[4] : 0; }
  function sumSt(p) { const t = [0, 0, 0, 0, 0]; for (const k in p.st) p.st[k].forEach((v, i) => { t[i] += v; }); return t; }
  function monthlyAwards(d) {
    const s = S(), u = s.user, c = uclub();
    if (c && c.lg) {
      const lg = c.lg, from = d - 31;
      const lc = s.comps[`${lg}-${s.season}`];
      // Ayın oyuncusu (kullanıcının ligi)
      let best = null, bv = 0;
      Object.values(s.players).forEach(p => {
        if (!p.ms || p.ms[0] < 2 || p.club == null || club(p.club).lg !== lg) return;
        const v = (p.ms[3] ? p.ms[2] / p.ms[3] : 0) + p.ms[1] * 0.12;
        if (v > bv) { bv = v; best = p; }
      });
      if (best && bv > 7) {
        (best.aw = best.aw || []).push(`Ayın Oyuncusu (${U.fmtDay(from).split(' ').slice(1).join(' ')})`);
        news(`${CM.LEAGUES[lg].n}: Ayın Oyuncusu`, `${best.n} (${club(best.club).n}) ${best.ms[0]} maçta ${best.ms[1]} gol ve ${(best.ms[2] / Math.max(1, best.ms[3])).toFixed(2)} ortalama notla ayın oyuncusu seçildi.`, { type: best.club === u.club ? 'trophy' : 'world', pid: best.id });
      }
      // Ayın menajeri: son ayda en çok puan toplayan kulüp
      if (lc) {
        const pts = {};
        lc.fx.forEach(f => {
          if (f.hg === null || f.d < from || f.d >= d) return;
          pts[f.h] = (pts[f.h] || 0) + (f.hg > f.ag ? 3 : f.hg === f.ag ? 1 : 0);
          pts[f.a] = (pts[f.a] || 0) + (f.ag > f.hg ? 3 : f.hg === f.ag ? 1 : 0);
        });
        const ids = Object.keys(pts).sort((a, b) => pts[b] - pts[a] || club(b).rep - club(a).rep);
        if (ids.length && pts[ids[0]] >= 7) {
          const w = +ids[0];
          if (w === u.club) { addRep(1.5); (u.awards = u.awards || []).push(`Ayın Menajeri (${U.fmtDay(from).split(' ').slice(1).join(' ')})`); news('Ayın Menajeri', `Son ayda topladığınız ${pts[w]} puanla ${CM.LEAGUES[lg].n}'de ayın menajeri seçildiniz!`, { type: 'trophy' }); }
          else news(`${CM.LEAGUES[lg].n}: Ayın Menajeri`, `${club(w).n} teknik direktörü, son ayda topladığı ${pts[w]} puanla ayın menajeri seçildi.`, { type: 'world' });
        }
      }
    }
    Object.values(s.players).forEach(p => { if (p.ms) p.ms = null; });
  }
  // Sezon sonu ödülleri ve arşiv; oyuncu istatistikleri sıfırlanmadan önce çağrılır
  function seasonAwards(Y) {
    const s = S(), u = s.user;
    const out = { s: Y, leagues: {} };
    const tops = ['ENG1', 'ESP1', 'GER1', 'ITA1', 'FRA1'];
    const all = Object.values(s.players).filter(p => p.club != null || p.ntOnly);
    // Lig ödülleri (tüm 1. ligler)
    for (const lg in CM.LEAGUES) {
      const lc = s.comps[`${lg}-${Y}`]; if (!lc) continue;
      const ps = all.filter(p => p.st[lc.id] && p.st[lc.id][0] >= 1);
      if (!ps.length) continue;
      const st = p => p.st[lc.id];
      const minApps = Math.max(8, Math.round(lc.fx.length / lc.teams.length * 0.4));
      const reg = ps.filter(p => st(p)[0] >= minApps && st(p)[4] >= minApps * 0.7);
      const bestBy = (list, f) => list.slice().sort((a, b) => f(b) - f(a))[0];
      const scorer = bestBy(ps, p => st(p)[1] * 100 + st(p)[2]);
      const potY = bestBy(reg, p => avgR(st(p)) + st(p)[1] * 0.02);
      const young = bestBy(reg.filter(p => Y + 1 - p.b <= 21), p => avgR(st(p)));
      // Sezonun 11'i (4-3-3)
      const pick = (line, n, used) => reg.filter(p => (line === 'G' ? p.pos === 'GK' : P.LINE[p.pos] === line && p.pos !== 'GK') && !used.has(p.id)).sort((a, b) => avgR(st(b)) - avgR(st(a))).slice(0, n);
      const used = new Set(); const xi = [];
      [['G', 1], ['D', 4], ['M', 3], ['F', 3]].forEach(([l, n]) => pick(l, n, used).forEach(p => { used.add(p.id); xi.push(p.id); }));
      const L = out.leagues[lg] = { top: scorer && [scorer.id, scorer.n, st(scorer)[1]], poty: potY && [potY.id, potY.n, avgR(st(potY)).toFixed(2)], young: young && [young.id, young.n], xi: xi.map(id => [id, s.players[id].n]) };
      const tag = CM.LEAGUES[lg].n + ' ' + Y + '/' + String(Y + 1).slice(2);
      if (scorer) (scorer.aw = scorer.aw || []).push('Gol Kralı · ' + tag);
      if (potY) (potY.aw = potY.aw || []).push('Sezonun Oyuncusu · ' + tag);
      if (young) (young.aw = young.aw || []).push('Sezonun Genç Oyuncusu · ' + tag);
      xi.forEach(id => (s.players[id].aw = s.players[id].aw || []).push('Sezonun 11\'i · ' + tag));
      if (u && u.club != null && club(u.club).lg === lg) {
        news(`${CM.LEAGUES[lg].n} sezon ödülleri`, `Sezonun oyuncusu: ${L.poty ? L.poty[1] : '-'}\nGol kralı: ${L.top ? L.top[1] + ' (' + L.top[2] + ' gol)' : '-'}\nGenç oyuncu: ${L.young ? L.young[1] : '-'}\nSezonun 11'i: ${L.xi.map(x => x[1]).join(', ')}`, { type: 'world' });
      }
    }
    // Avrupa Altın Ayakkabı: 1. liglerdeki goller, büyük 5 ligde x2, diğerlerinde x1,5
    let gb = null, gbv = 0;
    all.forEach(p => {
      for (const k in p.st) {
        const lg = k.split('-')[0];
        if (!CM.LEAGUES[lg] || CM.LEAGUES[lg].tier !== 1 || lg === 'KSA1') continue;
        const v = p.st[k][1] * (tops.includes(lg) ? 2 : 1.5);
        if (v > gbv) { gbv = v; gb = [p, p.st[k][1], lg]; }
      }
    });
    if (gb) { out.boot = [gb[0].id, gb[0].n, gb[1], gb[2]]; (gb[0].aw = gb[0].aw || []).push(`Avrupa Altın Ayakkabı ${Y}/${String(Y + 1).slice(2)}`); }
    // Ballon d'Or: sezon performansı + kazanılan kupalar
    const trophyW = {};
    Object.values(s.comps).forEach(c => {
      if (c.season !== Y || c.win == null) return;
      const w = c.type === 'league' ? (CM.LEAGUES[c.key] && CM.LEAGUES[c.key].tier === 1 ? (tops.includes(c.key) ? 9 : 4) : 0)
        : c.key === 'UCL' ? 14 : c.key === 'UEL' ? 5 : c.key === 'EURO' || c.key === 'WC' ? 14 : c.key === 'CA' || c.key === 'AFCON' ? 6 : /C$/.test(c.key) ? 2 : 0;
      if (w) trophyW[c.win] = (trophyW[c.win] || 0) + w;
    });
    const bdo = all.map(p => {
      const t = sumSt(p);
      if (t[0] < 20 || !t[4]) return null;
      const natT = trophyW['N:' + p.nat] && p.ntCaps ? trophyW['N:' + p.nat] : 0;
      const v = avgR(t) * 12 + t[1] * 0.45 + t[2] * 0.25 + (trophyW[p.club] || 0) + natT + P.ovr(p) * 0.35;
      return [p, v];
    }).filter(Boolean).sort((a, b) => b[1] - a[1]).slice(0, 5);
    if (bdo.length) {
      out.bdo = bdo.map(x => [x[0].id, x[0].n, x[0].club != null ? club(x[0].club).n : '']);
      (bdo[0][0].aw = bdo[0][0].aw || []).push(`Ballon d'Or ${Y + 1}`);
      news(`Ballon d'Or ${Y + 1}`, `Ballon d'Or ödülünün sahibi ${bdo[0][0].n} oldu!\n2. ${bdo[1] ? bdo[1][0].n : '-'}\n3. ${bdo[2] ? bdo[2][0].n : '-'}${out.boot ? `\n\nAvrupa Altın Ayakkabı: ${out.boot[1]} (${out.boot[2]} gol)` : ''}`, { type: 'world', pid: bdo[0][0].id });
    }
    // Şampiyonlar arşivi
    out.champs = {};
    Object.values(s.comps).forEach(c => {
      if (c.season !== Y || c.win == null) return;
      if (c.type === 'league' ? CM.LEAGUES[c.key] && CM.LEAGUES[c.key].tier === 1 : /^(UCL|UEL|UECL|USC|FIC|CWC|ACL|EURO|WC|NLA|AFCON|ASC|CA|GOLD)$/.test(c.key) || /C$/.test(c.key)) out.champs[c.key] = [c.n, C.tName(c.win)];
    });
    (s.arch = s.arch || []).push(out);
    if (s.arch.length > 30) s.arch.shift();
    return out;
  }

  // ---------- Sezon özeti ----------
  function seasonSummary(Y) {
    const s = S(), u = s.user, c = uclub();
    if (!c) return;
    const lc = c.lg ? s.comps[`${c.lg}-${Y}`] : null;
    const pos = lc && lc.rank ? lc.rank.indexOf(c.id) + 1 : 0;
    const ps = plist(c);
    const top = ps.map(p => [p, sumSt(p)]).sort((a, b) => b[1][1] - a[1][1])[0];
    const best = ps.map(p => [p, sumSt(p)]).filter(x => x[1][4] >= 10).sort((a, b) => avgR(b[1]) - avgR(a[1]))[0];
    const tro = (u.trophies || []).filter(t => t.s === Y).map(t => t.n);
    const buys = ps.filter(p => (p.car || []).some(x => x.s === Y && x.c === c.n && x.fee > 0)).map(p => [p, sumSt(p)]).sort((a, b) => avgR(b[1]) - avgR(a[1]))[0];
    const diff = u.exp ? u.exp.pos - pos : 0;
    const grade = !pos ? '-' : diff >= 3 || (pos === 1 && u.exp && u.exp.pos === 1) ? 'A' : diff >= 0 ? 'B' : diff >= -2 ? 'C' : diff >= -5 ? 'D' : 'F';
    const F = c.fin;
    const inc = F.gate + F.tv + F.prize + F.tout, exp = F.wages + (F.ops || 0) + F.tin;
    u.summary = {
      s: Y, club: c.n, lg: c.lg ? CM.LEAGUES[c.lg].n : '', pos, exp: u.exp ? u.exp.text : '', grade, tro,
      top: top ? [top[0].id, top[0].n, top[1][1]] : null, best: best ? [best[0].id, best[0].n, avgR(best[1]).toFixed(2)] : null,
      buy: buys ? [buys[0].id, buys[0].n, avgR(buys[1]).toFixed(2)] : null, inc, out: exp, rep: urep()
    };
    u.showSummary = Y;
    // Menajer itibarı: hedef aşımı ve kupalar
    addRep(U.clamp(diff * 0.8, -6, 6));
    (u.seasons = u.seasons || []).push(u.summary);
  }

  // ---------- İzleme listesi ----------
  function shortToggle(pid) {
    const u = S().user;
    u.short = u.short || [];
    const i = u.short.findIndex(x => x.id === pid);
    if (i >= 0) { u.short.splice(i, 1); return false; }
    const p = S().players[pid];
    u.short.push({ id: pid, club: p.club, listed: !!p.listed, ll: !!p.loanListed });
    return true;
  }
  function inShort(pid) { const u = S().user; return !!(u.short || []).some(x => x.id === pid); }
  function shortTick() {
    const s = S(), u = s.user;
    (u.short || []).forEach(e => {
      const p = s.players[e.id];
      if (!p) { news('İzleme listesi', 'İzlediğiniz bir oyuncu futbolu bıraktı.', { type: 'scout' }); e.gone = true; return; }
      if (p.club !== e.club) { news('İzleme listesi', `İzlediğiniz ${p.n}, ${p.club != null ? club(p.club).n + "'a transfer oldu" : 'serbest kaldı'}.`, { type: 'scout', pid: p.id }); e.club = p.club; }
      if (p.listed && !e.listed) news('İzleme listesi', `İzlediğiniz ${p.n} satış listesine konuldu!`, { type: 'scout', pid: p.id, urgent: CM.Market.isWindow(s.day) });
      if (p.loanListed && !e.ll) news('İzleme listesi', `İzlediğiniz ${p.n} kiralık listesine konuldu.`, { type: 'scout', pid: p.id });
      e.listed = !!p.listed; e.ll = !!p.loanListed;
    });
    u.short = (u.short || []).filter(e => !e.gone);
    // Sözleşmesi bitmek üzere olanlar (Ocak)
    const t = U.ymd(s.day);
    if (t.m === 1 && t.d <= 7) (u.short || []).forEach(e => { const p = s.players[e.id]; if (p && p.club != null && p.ce <= s.season) news('İzleme listesi', `İzlediğiniz ${p.n}'in sözleşmesi sezon sonunda bitiyor; yazın bedelsiz transfer edilebilir.`, { type: 'scout', pid: p.id }); });
  }

  // ---------- Rakip raporu ve yardımcı önerileri ----------
  function scoutReport(f) {
    const s = S(), u = s.user;
    const us = f.h === u.club || f.h === 'N:' + u.nat ? 0 : 1;
    const m = CM.Sim.build(f, us);
    const my = m.sides[us], op = m.sides[1 - us];
    const sm = m.strength(my), so = m.strength(op);
    const avgA = (side, lines, k) => { const x = side.on.filter(o => lines.includes(P.LINE[o.slot]) && o.slot !== 'GK').map(o => o.p.a[k]); return x.length ? U.avg(x) : 10; };
    const tips = [];
    const pace = avgA(my, ['F'], 'hiz') - avgA(op, ['D'], 'hiz');
    if (pace >= 1.5) tips.push('Rakip savunma hücumcularımızdan yavaş: kontra atak ve hızlı tempo etkili olabilir.');
    if (avgA(op, ['F'], 'kaf') - avgA(my, ['D'], 'kaf') >= 1.5) tips.push('Rakip hava toplarında güçlü; duran toplarda dikkatli olmalıyız.');
    if (so.mid > sm.mid * 1.08) tips.push('Orta sahada sayıca/kalitece geride kalabiliriz; orta sahayı kalabalıklaştıran bir diziliş düşünülebilir.');
    if (sm.att > so.def * 1.1) tips.push('Hücum hattımız rakip savunmadan üstün; hücum mentalitesi sonuç verebilir.');
    if (so.att > sm.def * 1.1) tips.push('Rakibin hücumu tehlikeli; savunmada daha temkinli olmak gerekebilir.');
    // Diziliş önerisi
    const team = C.tObj(us === 0 ? f.h : f.a), nat = C.isNat(us === 0 ? f.h : f.a);
    const pool = nat ? (team.squad || []).map(id => s.players[id]).filter(Boolean) : plist(team);
    const key = s.comps[f.c].suspKey;
    const score = form => {
      const lu = CM.Sim.autoLineup(team, pool, form, key, f.d, nat);
      const slots = CM.E.FORMATIONS[form];
      return lu.xi.reduce((t, id, i) => t + P.slotRating(s.players[id], slots[i]), 0);
    };
    const cur = score(team.tactic.form);
    let bestF = team.tactic.form, bv = cur;
    Object.keys(CM.E.FORMATIONS).forEach(fm => { const v = score(fm); if (v > bv) { bv = v; bestF = fm; } });
    const suggestForm = bv > cur * 1.015 ? bestF : null;
    const tot = x => x.att + x.mid + x.def;
    const diff = tot(sm) / tot(so);
    const ment = diff > 1.12 ? 'hucum' : diff > 0.97 ? 'dengeli' : diff > 0.88 ? 'kontra' : 'savunma';
    const stars = op.on.slice().sort((a, b) => P.ovr(b.p) - P.ovr(a.p)).slice(0, 3).map(o => o.p);
    return { opp: op.n, form: op.tactic.form, stars, lines: { my: sm, op: so }, tips, suggestForm, ment };
  }

  // ---------- Günlük / sezonluk kancalar ----------
  function daily(d) {
    const s = S(); if (!s.user) return;
    const t = U.ymd(d);
    if (t.d === 1) monthlyAwards(d);
    if ((t.m === 11 && t.d === 1) || (t.m === 3 && t.d === 1)) aiSackings();
    if (t.w === 1) { weeklySquad(); shortTick(); }
    projectsTick();
  }
  function seasonEnd(Y) {
    const s = S();
    try { seasonSummary(Y); } catch (e) { console.error(e); }
    try { seasonAwards(Y); } catch (e) { console.error(e); }
    natOffer();
    Object.values(s.players).forEach(p => { p.promise = null; });
  }

  CM.X = {
    PERS, pers, TALKS, talk, captainLeader, form, PRESS_POST, bigMatch, pressQuestion, pressPre, pressPost,
    FAC, trainF, facCost, boardRequest, setYouthNet, urep, addRep, repLabel, takeNat,
    onPlayer, onMatch, onTransfer, shortToggle, inShort, scoutReport, daily, seasonEnd, seasonApps
  };
})(typeof window !== 'undefined' ? window : globalThis);
