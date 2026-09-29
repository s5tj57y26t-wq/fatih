/* Maç motoru: dakika dakika simülasyon, 5 değişiklik (3 pencere), uzatma ve penaltılar */
(function (G) {
  'use strict';
  const CM = G.CM, U = CM.U, P = CM.P;

  const FORMATIONS = {
    '4-4-2': ['GK', 'RB', 'CB', 'CB', 'LB', 'RM', 'CM', 'CM', 'LM', 'ST', 'ST'],
    '4-3-3': ['GK', 'RB', 'CB', 'CB', 'LB', 'CM', 'DM', 'CM', 'RW', 'ST', 'LW'],
    '4-2-3-1': ['GK', 'RB', 'CB', 'CB', 'LB', 'DM', 'DM', 'RW', 'AM', 'LW', 'ST'],
    '4-1-4-1': ['GK', 'RB', 'CB', 'CB', 'LB', 'DM', 'RM', 'CM', 'CM', 'LM', 'ST'],
    '4-3-1-2': ['GK', 'RB', 'CB', 'CB', 'LB', 'CM', 'DM', 'CM', 'AM', 'ST', 'ST'],
    '4-4-1-1': ['GK', 'RB', 'CB', 'CB', 'LB', 'RM', 'CM', 'CM', 'LM', 'AM', 'ST'],
    '3-5-2': ['GK', 'CB', 'CB', 'CB', 'RM', 'CM', 'DM', 'CM', 'LM', 'ST', 'ST'],
    '3-4-3': ['GK', 'CB', 'CB', 'CB', 'RM', 'CM', 'CM', 'LM', 'RW', 'ST', 'LW'],
    '3-4-2-1': ['GK', 'CB', 'CB', 'CB', 'RM', 'CM', 'CM', 'LM', 'AM', 'AM', 'ST'],
    '5-3-2': ['GK', 'RB', 'CB', 'CB', 'CB', 'LB', 'CM', 'DM', 'CM', 'ST', 'ST'],
    '5-4-1': ['GK', 'RB', 'CB', 'CB', 'CB', 'LB', 'RM', 'CM', 'CM', 'LM', 'ST']
  };
  const MENT = {
    defans: { n: 'Otobüsü Çek', att: 0.78, def: 1.22 }, savunma: { n: 'Defansif', att: 0.88, def: 1.12 },
    kontra: { n: 'Kontra Atak', att: 0.95, def: 1.06 }, dengeli: { n: 'Dengeli', att: 1, def: 1 },
    hucum: { n: 'Hücum', att: 1.1, def: 0.92 }, tamHucum: { n: 'Tam Hücum', att: 1.24, def: 0.8 }
  };
  const PASS = { kisa: { n: 'Kısa Pas', mid: 1.06, ch: 0.96 }, karisik: { n: 'Karışık', mid: 1, ch: 1 }, uzun: { n: 'Uzun Top', mid: 0.93, ch: 1.07 } };
  const PRESS = { dusuk: { n: 'Düşük', def: 0.97, tire: 0.8 }, normal: { n: 'Normal', def: 1, tire: 1 }, yuksek: { n: 'Yüksek', def: 1.06, tire: 1.35 } };
  const TEMPO = { yavas: { n: 'Yavaş', ch: 0.93, tire: 0.9 }, normal: { n: 'Normal', ch: 1, tire: 1 }, hizli: { n: 'Hızlı', ch: 1.07, tire: 1.12 } };
  // Rol katkıları: [hücum, orta saha, savunma]
  const CONTRIB = {
    GK: [0, 0, 0.2], CB: [0.05, 0.2, 1], LB: [0.2, 0.35, 0.8], RB: [0.2, 0.35, 0.8], DM: [0.15, 0.8, 0.6],
    CM: [0.35, 1, 0.35], LM: [0.5, 0.75, 0.25], RM: [0.5, 0.75, 0.25], AM: [0.75, 0.8, 0.1],
    LW: [0.95, 0.4, 0.05], RW: [0.95, 0.4, 0.05], ST: [1.1, 0.25, 0.02]
  };

  // Kenardan bağırma: 12 dakika etkili, 10 dakika bekleme süresi
  const SHOUTS = {
    hucum: { n: 'Hücuma kalkın!', att: 1.08, def: 0.95 },
    savun: { n: 'Geride kalın, skoru koruyun!', att: 0.92, def: 1.08 },
    konsantre: { n: 'Konsantre olun!', mid: 1.03, def: 1.04 },
    pres: { n: 'Baskı yapın!', mid: 1.05, def: 1.02, tire: 1.35 },
    sakin: { n: 'Sakin olun, faul yapmayın!', mid: 1.02, foul: 0.55 },
    aferin: { n: 'Aferin, böyle devam!', att: 1.02, mid: 1.02, def: 1.02 }
  };
  // Devre arası konuşmaları
  const TALKS = {
    ovgu: { n: 'Övgü: "Harika oynuyorsunuz"' },
    sakin: { n: 'Sakin ve odaklı: "Planımıza sadık kalalım"' },
    kizgin: { n: 'Kızgın: "Bu oyun kabul edilemez!"' },
    rahat: { n: 'Rahat olun: "Kaybedecek bir şeyimiz yok"' },
    dahafazla: { n: 'Daha fazlasını istiyorum' }
  };
  const sur = p => { const s = p.n.split(' '); return s.length > 1 ? s.slice(1).join(' ') : s[0]; };

  const TXT = {
    build: ['{p} topla ilerliyor...', '{p} sağ kanattan bindiriyor...', '{p} sol kanatta boş alan buldu...', '{p} ara pası bekliyor...',
      '{t} hızlı bir atak geliştiriyor...', '{p} rakibini çalımlıyor...', '{p} ceza sahasına giriyor...', '{p} uzaktan şansını deneyecek...',
      '{a} ortaladı, {p} yükseliyor...', '{a} harika bir pas verdi, {p} topla buluştu...', '{a} ara pasını attı, {p} kaleciyle karşı karşıya...'],
    goal: ['GOL! {p} topu ağlara gönderdi!', 'GOOOL! {p} kaleciyi mağlup ediyor!', 'GOL! {p} köşeye bıraktı, müthiş bitiriş!',
      'GOL! {p} soğukkanlılıkla vuruyor ve top filelerde!', 'GOOOL! Tribünler ayakta, {p} skoru değiştiriyor!'],
    save: ['{k} uzanıyor ve kurtarıyor!', 'Şut isabetli ama {k} yerinde!', '{k} parmaklarının ucuyla kornere çeliyor!', '{k} topu kontrol etti.', 'Kurtarış! {k} harika uçtu!'],
    miss: ['Şut auta gidiyor.', 'Top üst direğin üzerinden auta!', 'Az farkla dışarıda!', 'Direk! Top oyun alanına döndü.', 'Vuruş zayıf, top dışarıda.', 'Top yan filelerde!'],
    block: ['Savunma araya girdi, şut bloke edildi.', '{d} son anda müdahale ediyor!', '{d} topu uzaklaştırdı.'],
    foul: ['{p} faul yaptı.', '{p} sert girdi, hakem düdüğü çaldı.', '{p} rakibini formasından çekti.'],
    yellow: ['Hakem {p} için sarı kartını çıkardı.'], red: ['KIRMIZI KART! {p} oyundan atılıyor!'], second: ['İkinci sarı! {p} kırmızı kartla oyun dışı!'],
    corner: ['{t} korner kazandı.'], offside: ['{p} ofsayt pozisyonunda.', 'Yan hakem bayrağını kaldırdı, {p} ofsayt.'],
    injury: ['{p} sakatlandı, yerde kaldı...'], pen: ['PENALTI! {p} ceza sahasında düşürüldü!'],
    penGoal: ['GOL! {p} penaltıyı gole çevirdi!'], penMiss: ['{k} penaltıyı kurtardı!', '{p} penaltıyı dışarı attı!'],
    var: ['VAR incelemesi... Gol geçerli!', 'VAR kontrolü tamamlandı, karar değişmedi.']
  };
  const fmt = (tpl, m) => tpl.replace(/\{(\w)\}/g, (_, k) => m[k] || '');

  // side kaynak: { id, n, sh, c1, c2, players:[Player], tactic }
  class Match {
    constructor(home, away, opts) {
      opts = opts || {};
      this.opts = opts;
      this.minute = 0; this.events = []; this.finished = false; this.quiet = !!opts.quiet;
      this.userSide = opts.userSide === undefined ? -1 : opts.userSide;
      this.homeAdv = opts.neutral ? 1 : 1.05;
      this.agg = opts.agg || null; // [ev, deplasman] ilk maç toplamı
      this.ko = !!opts.ko;
      this.all = {};
      home.players.concat(away.players).forEach(p => { this.all[p.id] = p; });
      this.sides = [home, away].map((s, i) => this._side(s, i));
      this.et = false; this.pens = null; this.phase = 1;
      this.trainBonus = opts.trainBonus || [1, 1];
    }
    _side(src, idx) {
      const t = src.tactic;
      const slots = FORMATIONS[t.form] || FORMATIONS['4-4-2'];
      const by = {}; src.players.forEach(p => { by[p.id] = p; });
      const on = [];
      t.xi.forEach((id, i) => { if (by[id] && i < 11) on.push(this._on(by[id], slots[i])); });
      const bench = (t.subs || []).map(id => by[id]).filter(Boolean);
      const ps = {};
      on.forEach(o => { ps[o.p.id] = this._ps(true, 0); });
      return {
        idx, id: src.id, n: src.n, sh: src.sh, c1: src.c1, c2: src.c2, tactic: Object.assign({}, t), on, bench, ps,
        subsLeft: 5, windows: 3, lastWinMin: -1, boost: 1, shout: null, shoutCd: 0, talked: false,
        st: { g: 0, sh: 0, ot: 0, co: 0, fo: 0, yc: 0, rc: 0, poss: 0, xg: 0 }, scorers: []
      };
    }
    // Sahadaki oyuncu kaydı: mevki gücü ve yorulma katsayısı önbelleğe alınır
    _on(p, slot) { return { p, slot, cond: p.cond, base: P.slotRating(p, slot) * (0.94 + 0.12 * (p.mor || 60) / 100), tf: 1.6 - p.a.day / 20, c: CONTRIB[slot] }; }
    reslot(o, slot) { o.slot = slot; o.base = P.slotRating(o.p, slot) * (0.94 + 0.12 * (o.p.mor || 60) / 100); o.c = CONTRIB[slot]; }
    _ps(started, min) { return { mins: 0, g: 0, a: 0, yc: 0, rc: 0, sv: 0, inj: false, started, on: min, off: null, cond: null, rating: null }; }

    strength(s) {
      const t = s.tactic, m = MENT[t.ment] || MENT.dengeli, pa = PASS[t.pass] || PASS.karisik, pr = PRESS[t.press] || PRESS.normal, te = TEMPO[t.tempo] || TEMPO.normal;
      let att = 0, mid = 0, def = 0, gk = 3;
      const on = s.on;
      for (let i = 0; i < on.length; i++) {
        const o = on[i];
        const r = o.base * (0.55 + 0.0045 * o.cond);
        const c = o.c;
        att += r * c[0]; mid += r * c[1]; def += r * c[2];
        if (o.slot === 'GK') gk = (o.p.a.kal * 0.55 + o.p.a.ref * 0.45) * (0.7 + 0.003 * o.cond);
      }
      const h = (s.idx === 0 ? this.homeAdv : 1) * (s.boost || 1);
      const tb = this.trainBonus[s.idx] || 1;
      const sh = s.shout && this.minute <= s.shout.until ? SHOUTS[s.shout.k] : null;
      const xa = sh && sh.att || 1, xm = sh && sh.mid || 1, xd = sh && sh.def || 1;
      return { att: att * m.att * h * tb * xa, mid: mid * pa.mid * h * tb * xm, def: def * m.def * pr.def * h * tb * xd, gk, ch: pa.ch * te.ch };
    }

    pickW(s, fn) { return U.weighted(s.on, fn); }
    shooter(s) { const w = { ST: 4.2, LW: 3, RW: 3, AM: 2.6, CM: 1.3, LM: 1.6, RM: 1.6, DM: 0.6, CB: 0.4, LB: 0.4, RB: 0.4, GK: 0 }; return this.pickW(s, o => w[o.slot] * (o.p.a.bit + o.p.a.poz / 2)); }
    assister(s, not) { const w = { ST: 1.4, LW: 2.4, RW: 2.4, AM: 3.2, CM: 2.4, LM: 2.4, RM: 2.4, DM: 1.2, CB: 0.4, LB: 1.3, RB: 1.3, GK: 0.05 }; return this.pickW(s, o => o === not ? 0 : w[o.slot] * (o.p.a.pas + o.p.a.yar + o.p.a.ort / 2)); }
    defender(s) { const w = { CB: 4, LB: 2.5, RB: 2.5, DM: 2.5, CM: 1.2, LM: 1, RM: 1, AM: 0.4, LW: 0.3, RW: 0.3, ST: 0.2, GK: 0 }; return this.pickW(s, o => w[o.slot] * (o.p.a.kap + o.p.a.mar)); }
    keeper(s) { return s.on.find(o => o.slot === 'GK') || s.on[0]; }

    t(arr, m) { return this.quiet ? '' : fmt(U.pick(arr), m || {}); }
    ev(type, side, text, extra) {
      const e = Object.assign({ min: this.minute, type, side, text: this.quiet ? '' : text }, extra || {});
      this.events.push(e); this._out.push(e); return e;
    }

    step() {
      if (this.finished) return [];
      this._out = [];
      if (this.phase === 'pens') { this.shootout(); return this._out; }
      this.minute++;
      const mn = this.minute;
      if (mn === 1) this.ev('info', -1, 'Hakem ilk düdüğü çaldı, maç başladı!');
      if (mn === 46) this.ev('info', -1, 'İkinci yarı başladı.');
      if (mn === 91) this.ev('info', -1, 'Uzatma devresi başladı.');
      if (mn === 106) this.ev('info', -1, 'Uzatmanın ikinci yarısı başladı.');

      const S = this.sides.map(s => this.strength(s));
      for (let si = 0; si < 2; si++) {
        const s = this.sides[si];
        const shx = s.shout && mn <= s.shout.until && SHOUTS[s.shout.k].tire || 1;
        const tire = 0.22 * (PRESS[s.tactic.press] || PRESS.normal).tire * (TEMPO[s.tactic.tempo] || TEMPO.normal).tire * shx;
        const on = s.on;
        for (let i = 0; i < on.length; i++) { const o = on[i]; o.cond = Math.max(10, o.cond - tire * o.tf); s.ps[o.p.id].mins++; }
      }
      const m0 = Math.pow(S[0].mid, 2.2), m1 = Math.pow(S[1].mid, 2.2);
      const a = U.rand() < m0 / (m0 + m1) ? 0 : 1;
      const A = this.sides[a], Df = this.sides[1 - a];
      A.st.poss++;
      const rr = (S[a].att / Math.max(0.5, S[1 - a].def)) / 0.72;
      const pChance = U.clamp(0.2 * Math.pow(rr, 1.3) * S[a].ch, 0.05, 0.45);
      const r = U.rand();
      if (r < pChance) this.chance(A, Df, rr, S[1 - a]);
      else if (r < pChance + 0.11) this.foul(Df);
      else if (r < pChance + 0.14) { const o = this.shooter(A); this.ev('offside', a, this.t(TXT.offside, { p: sur(o.p) })); }
      else if (r < pChance + 0.1445) this.injury(U.rand() < 0.5 ? A : Df);

      this.aiManage();

      if (mn === 45) this.ev('half', -1, `İlk yarı sona erdi: ${this.scoreLine()}`);
      if (mn === 90 || mn === 120) this.endOfTime();
      return this._out;
    }

    // 90 veya 120. dakika
    endOfTime() {
      const [h, a] = this.sides;
      let hg = h.st.g, ag = a.st.g;
      if (this.agg) { hg += this.agg[0]; ag += this.agg[1]; }
      const level = hg === ag;
      if (this.minute === 90 && this.ko && level) {
        this.et = true;
        this.sides.forEach(s => { s.subsLeft += 1; s.windows += 1; });
        this.ev('et', -1, `Normal süre sona erdi: ${this.scoreLine()}. Maç uzatmaya gidiyor!`);
        return;
      }
      if (this.minute === 120 && level) {
        this.phase = 'pens';
        this.pens = { h: [], a: [], turn: 0 };
        this.ev('et', -1, `Uzatmalar da eşitlikle bitti. Seri penaltı atışları!`);
        return;
      }
      this.finish();
    }

    shootout() {
      const pn = this.pens;
      const order = s => s.on.slice().sort((x, y) => (y.p.a.bit + y.p.a.kar) - (x.p.a.bit + x.p.a.kar));
      const oh = order(this.sides[0]), oa = order(this.sides[1]);
      const kick = (si, list, arr) => {
        const s = this.sides[si], k = this.keeper(this.sides[1 - si]);
        const taker = list[arr.length % list.length];
        const p = U.clamp(0.76 + (taker.p.a.bit - (k.p.a.ref + k.p.a.kal) / 2) * 0.012 + (taker.p.a.kar - 10) * 0.006, 0.55, 0.92);
        const g = U.rand() < p;
        arr.push(g ? 1 : 0);
        this.ev(g ? 'pgoal' : 'pmiss', si, g ? `${s.sh}: ${sur(taker.p)} penaltıyı attı!` : `${s.sh}: ${sur(taker.p)} kaçırdı! ${sur(k.p)} kurtardı!`);
      };
      if (pn.turn % 2 === 0) kick(0, oh, pn.h); else kick(1, oa, pn.a);
      pn.turn++;
      const H = U.sum(pn.h), Aa = U.sum(pn.a), nh = pn.h.length, na = pn.a.length;
      let done = false;
      if (nh <= 5 && na <= 5) {
        if (H > Aa + (5 - na) || Aa > H + (5 - nh)) done = true;
      } else if (nh === na && H !== Aa) done = true;
      if (nh === na && nh >= 5 && H !== Aa) done = true;
      if (done) {
        this.penScore = [H, Aa];
        this.ev('info', -1, `Penaltılar: ${this.sides[0].n} ${H} - ${Aa} ${this.sides[1].n}`);
        this.finish();
      }
    }

    finish() {
      this.finished = true;
      this.ev('end', -1, `Maç sona erdi! ${this.scoreLine()}${this.penScore ? ` (pen. ${this.penScore[0]}-${this.penScore[1]})` : ''}`);
      this.finalize();
    }

    scoreLine() { const [h, a] = this.sides; return `${h.n} ${h.st.g} - ${a.st.g} ${a.n}`; }

    chance(A, Df, rr, sd) {
      const a = A.idx;
      const sh = this.shooter(A), as = this.assister(A, sh);
      if (!sh) return;
      A.st.sh++;
      this.ev('build', a, this.t(TXT.build, { p: sur(sh.p), a: sur(as.p), t: A.n }));
      if (U.rand() < 0.035) {
        this.ev('pen', a, this.t(TXT.pen, { p: sur(sh.p) }));
        A.st.ot++; A.st.xg += 0.76;
        const taker = A.on.find(o => o.p.id === A.tactic.pk) || A.on.slice().sort((x, y) => y.p.a.bit - x.p.a.bit)[0];
        const k = this.keeper(Df);
        if (U.rand() < 0.74 + (taker.p.a.bit - k.p.a.ref) * 0.01) this.goal(A, taker, null, this.t(TXT.penGoal, { p: sur(taker.p) }), true);
        else { Df.ps[k.p.id].sv++; this.ev('miss', a, this.t(TXT.penMiss, { p: sur(taker.p), k: sur(k.p) })); }
        return;
      }
      if (U.rand() < 0.22) {
        const d = this.defender(Df);
        this.ev('block', Df.idx, this.t(TXT.block, { d: sur(d.p) }));
        if (U.rand() < 0.4) this.corner(A);
        return;
      }
      const fin = (sh.p.a.bit * 0.8 + sh.p.a.tek * 0.1 + sh.p.a.kar * 0.1) * (0.6 + 0.4 * sh.cond / 100);
      const onT = U.clamp(0.33 + (fin - 10) * 0.02 + (rr - 1) * 0.06, 0.15, 0.6);
      const k = this.keeper(Df);
      const gkr = k.slot === 'GK' ? sd.gk : 3;
      const pg = U.clamp(0.27 * (fin + 8) / (gkr + 8) * (0.88 + 0.12 * rr), 0.08, 0.55);
      A.st.xg += onT * pg;
      if (U.rand() < onT) {
        A.st.ot++;
        if (U.rand() < pg) this.goal(A, sh, U.rand() < 0.75 ? as : null, this.t(TXT.goal, { p: sur(sh.p) }));
        else { Df.ps[k.p.id].sv++; this.ev('save', Df.idx, this.t(TXT.save, { k: sur(k.p) })); if (U.rand() < 0.35) this.corner(A); }
      } else this.ev('miss', a, this.t(TXT.miss));
    }

    corner(A) {
      A.st.co++;
      this.ev('corner', A.idx, this.t(TXT.corner, { t: A.n }));
      if (U.rand() < 0.12 * (this.opts.setPiece && this.opts.setPiece[A.idx] ? 1.25 : 1)) {
        const Df = this.sides[1 - A.idx];
        const hd = this.pickW(A, o => (o.slot === 'GK' ? 0 : 1) * o.p.a.kaf * o.p.a.kaf);
        const as = this.assister(A, hd);
        A.st.sh++;
        this.ev('build', A.idx, `${sur(as.p)} korneri kullandı, ${sur(hd.p)} kafayı vuruyor...`);
        const d = this.defender(Df);
        const pg = 0.3 * (hd.p.a.kaf + 5) / (d.p.a.kaf + 5);
        A.st.xg += pg * 0.5;
        if (U.rand() < pg) { A.st.ot++; this.goal(A, hd, as, `GOL! ${sur(hd.p)} kafayla ağları sarstı!`); }
        else this.ev('miss', A.idx, U.pick(['Kafa vuruşu auta gidiyor.', `${sur(d.p)} kafayla uzaklaştırdı.`]));
      }
    }

    goal(A, sh, as, text, pen) {
      A.st.g++;
      A.ps[sh.p.id].g++;
      if (as && as !== sh) A.ps[as.p.id].a++;
      A.scorers.push({ min: this.minute, id: sh.p.id, pen: !!pen });
      this.ev('goal', A.idx, text, { score: [this.sides[0].st.g, this.sides[1].st.g], scorer: sh.p.id, assist: as && as !== sh ? as.p.id : null });
      if (!this.quiet && U.rand() < 0.08) this.ev('info', -1, this.t(TXT.var));
    }

    foul(F) {
      const f = this.defender(F);
      if (!f) return;
      F.st.fo++;
      this.ev('foul', F.idx, this.t(TXT.foul, { p: sur(f.p) }));
      const fx = F.shout && this.minute <= F.shout.until && SHOUTS[F.shout.k].foul || 1;
      const r = U.rand() / fx, ps = F.ps[f.p.id];
      if (r < 0.007) { ps.rc = 1; F.st.rc++; this.ev('red', F.idx, this.t(TXT.red, { p: sur(f.p) }), { pid: f.p.id }); this.remove(F, f); }
      else if (r < 0.18) {
        ps.yc++; F.st.yc++;
        if (ps.yc >= 2) { ps.rc = 1; F.st.rc++; this.ev('red', F.idx, this.t(TXT.second, { p: sur(f.p) }), { pid: f.p.id }); this.remove(F, f); }
        else this.ev('yellow', F.idx, this.t(TXT.yellow, { p: sur(f.p) }), { pid: f.p.id });
      }
    }

    injury(s) {
      const cand = s.on.filter(o => !s.ps[o.p.id].inj);
      if (!cand.length) return;
      const o = U.pick(cand);
      s.ps[o.p.id].inj = true;
      o.cond = Math.min(o.cond, 30);
      this.ev('injury', s.idx, this.t(TXT.injury, { p: sur(o.p) }), { pid: o.p.id });
      if (s.idx !== this.userSide) this.autoSub(s, o);
    }

    remove(s, o) {
      s.ps[o.p.id].off = this.minute; s.ps[o.p.id].cond = o.cond;
      s.on = s.on.filter(x => x !== o);
      if (o.slot === 'GK' && s.on.length) {
        if (s.idx !== this.userSide && s.subsLeft > 0) {
          const gk = s.bench.find(p => p.pos === 'GK');
          const out = s.on.slice().sort((x, y) => P.slotRating(x.p, x.slot) - P.slotRating(y.p, y.slot))[0];
          if (gk && out) { if (this.substitute(s, out.p.id, gk.id)) { const n = s.on.find(x => x.p.id === gk.id); if (n) this.reslot(n, 'GK'); return; } }
        }
        this.reslot(s.on.slice().sort((x, y) => y.p.a.kal - x.p.a.kal)[0], 'GK');
      }
    }

    // Kenardan bağırma
    doShout(si, k) {
      const s = this.sides[si];
      if (!SHOUTS[k] || this.minute < s.shoutCd || this.finished) return false;
      s.shout = { k, until: this.minute + 12 }; s.shoutCd = this.minute + 10;
      this.events.push({ min: this.minute, type: 'shout', side: si, text: `${s.sh}: Teknik direktör kenardan bağırıyor: "${SHOUTS[k].n}"` });
      return true;
    }
    // Devre arası konuşması: skora ve oyuncu kişiliklerine göre etkisi değişir; pers(p) -> kişilik anahtarı
    teamTalk(si, k, pers, captainLeader) {
      const s = this.sides[si], o = this.sides[1 - si];
      if (s.talked) return null;
      s.talked = true;
      let diff = s.st.g - o.st.g;
      if (this.agg) diff += si === 0 ? this.agg[0] - this.agg[1] : this.agg[1] - this.agg[0];
      const str = this.strength(s), ostr = this.strength(o);
      const under = (str.att + str.mid + str.def) < (ostr.att + ostr.mid + ostr.def) * 0.95;
      let e = 0;
      if (k === 'ovgu') e = diff > 0 ? 0.035 : diff === 0 ? 0.012 : -0.02;
      else if (k === 'kizgin') e = diff < 0 ? 0.045 : diff === 0 ? 0.01 : -0.03;
      else if (k === 'sakin') e = 0.015;
      else if (k === 'rahat') e = under ? 0.03 : diff > 0 ? -0.02 : -0.005;
      else if (k === 'dahafazla') e = diff >= 0 ? 0.022 : 0.01;
      // Kişilikler: kaprisli/duygusal oyuncular sert konuşmaya kötü, profesyonel/hırslı olanlar iyi tepki verir
      const ps = s.on.map(x => pers ? pers(x.p) : 'sakin');
      const share = t => ps.filter(x => t.includes(x)).length / Math.max(1, ps.length);
      if (k === 'kizgin') e += share(['hirsli', 'profesyonel', 'lider']) * 0.02 - share(['kaprisli', 'duygusal']) * 0.06;
      if (k === 'ovgu' || k === 'rahat') e -= share(['hirsli']) * 0.01;
      if (captainLeader) e *= e > 0 ? 1.3 : 0.7;
      e = Math.max(-0.05, Math.min(0.06, e));
      s.boost = 1 + e;
      s.on.forEach(x => { x.p.mor = Math.max(5, Math.min(100, (x.p.mor || 60) + Math.round(e * 150))); });
      const txt = e >= 0.03 ? 'Oyuncular çok motive oldu ve soyunma odasından hırsla çıktı.' : e > 0.005 ? 'Oyuncular konuşmanıza olumlu tepki verdi.'
        : e > -0.005 ? 'Konuşmanız oyuncular üzerinde pek etki yaratmadı.' : 'Oyuncular konuşmanıza tepki gösterdi; moraller bozuk.';
      this.events.push({ min: this.minute, type: 'info', side: si, text: `Devre arası: ${txt}` });
      return { e, txt };
    }

    // Değişiklik: 5 hak, 3 pencere (aynı dakikadaki değişiklikler tek pencere sayılır)
    canSub(s) { return s.subsLeft > 0 && (s.windows > 0 || s.lastWinMin === this.minute); }
    substitute(s, outId, inId) {
      if (!this.canSub(s)) return false;
      const oi = s.on.findIndex(o => o.p.id === outId), bi = s.bench.findIndex(p => p.id === inId);
      if (oi < 0 || bi < 0) return false;
      const out = s.on[oi], inn = s.bench[bi];
      if (s.lastWinMin !== this.minute) { s.windows--; s.lastWinMin = this.minute; }
      s.on[oi] = this._on(inn, out.slot);
      s.bench.splice(bi, 1);
      s.subsLeft--;
      s.ps[out.p.id].off = this.minute; s.ps[out.p.id].cond = out.cond;
      s.ps[inn.id] = this._ps(false, this.minute);
      this.ev('sub', s.idx, `Oyuncu değişikliği (${s.sh}): ${sur(inn)} oyuna girdi, ${sur(out.p)} çıktı.`);
      return true;
    }
    autoSub(s, o) {
      if (!this.canSub(s)) return;
      const pool = s.bench.filter(p => (o.slot === 'GK') === (p.pos === 'GK'));
      if (!pool.length) return;
      const best = pool.sort((x, y) => P.slotRating(y, o.slot) - P.slotRating(x, o.slot))[0];
      this.substitute(s, o.p.id, best.id);
    }
    aiManage() {
      const mn = this.minute;
      this.sides.forEach(s => {
        if (s.idx === this.userSide) return;
        const o = this.sides[1 - s.idx];
        let diff = s.st.g - o.st.g;
        if (this.agg) diff += s.idx === 0 ? this.agg[0] - this.agg[1] : this.agg[1] - this.agg[0];
        if (mn === 65 || mn === 78 || mn === 100) {
          if (diff < 0) s.tactic.ment = diff <= -2 ? 'tamHucum' : 'hucum';
          else if (diff > 0 && mn >= 78) s.tactic.ment = 'savunma';
        }
        if ((mn === 60 || mn === 72 || mn === 82 || mn === 95) && this.canSub(s)) {
          const tired = s.on.filter(x => x.slot !== 'GK').sort((x, y) => x.cond - y.cond).slice(0, mn === 60 ? 2 : 1);
          tired.forEach(t => {
            if (t.cond > 74 || !this.canSub(s)) return;
            const cand = s.bench.filter(p => p.pos !== 'GK');
            if (!cand.length) return;
            const best = cand.sort((x, y) => P.slotRating(y, t.slot) - P.slotRating(x, t.slot))[0];
            if (P.slotRating(best, t.slot) > P.slotRating(t.p, t.slot) * 0.8) this.substitute(s, t.p.id, best.id);
          });
        }
      });
    }

    // Oyuncu notu; k: maçın ne kadarının oynandığı (canlı notta sonuç etkisi zamanla artar)
    rate(s, id, pos, noise, k) {
      const o = this.sides[1 - s.idx], ps = s.ps[id], p = this.all[id];
      const res = s.st.g > o.st.g ? 0.4 : s.st.g === o.st.g ? 0 : -0.3;
      const conc = o.st.g, clean = conc === 0 ? k : 0;
      let r = 6.2 + res * k + ps.g * 1.0 + ps.a * 0.5 + noise + (P.roleRating(p, pos) - 12) * 0.08;
      if (pos === 'GK') r += ps.sv * 0.2 - conc * 0.3 + clean * 0.6;
      else if (P.LINE[pos] === 'D') r += -conc * 0.2 + clean * 0.5;
      if (ps.rc) r -= 1.5;
      r -= ps.yc * 0.15;
      if (ps.mins < 20) r = 6 + (r - 6) * 0.4;
      return Math.round(U.clamp(r, 3, 10) * 10) / 10;
    }
    liveRating(s, id) {
      const ps = s.ps[id]; if (!ps || (ps.mins <= 0 && !ps.started)) return null;
      const on = s.on.find(x => x.p.id === +id);
      const pos = on ? on.slot : this.all[id].pos;
      // Deterministik küçük sapma: oyuncunun maç içi yıpranmasına göre
      const noise = on ? (on.cond - 70) / 100 : 0;
      return this.rate(s, id, pos, noise * 0.5, Math.min(1, this.minute / 90));
    }
    finalize() {
      this.sides.forEach(s => {
        const slotOf = {};
        s.on.forEach(x => { slotOf[x.p.id] = x.slot; s.ps[x.p.id].cond = x.cond; });
        for (const id in s.ps) {
          const ps = s.ps[id];
          if (ps.mins <= 0 && !ps.started) continue;
          ps.rating = this.rate(s, id, slotOf[id] || this.all[id].pos, U.gauss() * 0.8, 1);
        }
      });
      const [h, a] = this.sides;
      this.result = { hg: h.st.g, ag: a.st.g, et: this.et, ph: this.penScore ? this.penScore[0] : null, pa: this.penScore ? this.penScore[1] : null };
    }

    runToEnd() { let g = 0; while (!this.finished && g++ < 400) this.step(); return this; }
  }

  CM.E = { FORMATIONS, MENT, PASS, PRESS, TEMPO, CONTRIB, SHOUTS, TALKS, Match, sur };
})(typeof window !== 'undefined' ? window : globalThis);
