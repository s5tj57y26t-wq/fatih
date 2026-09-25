/* Oyuncu değerlendirme ve maç motoru */
(function (G) {
  'use strict';
  const D = G.D;

  // Oyuncunun belirli bir mevkideki gücü (1-20)
  function rateFor(p, pos) {
    const w = D.WEIGHTS[pos];
    let s = 0, t = 0;
    for (const k in w) { s += p.attrs[k] * w[k]; t += w[k]; }
    return s / t;
  }
  function ovr(p) { return Math.round(rateFor(p, p.pos) * 5); }

  function slotsOf(formation) {
    const f = D.FORMATIONS[formation];
    const s = ['GK'];
    for (let i = 0; i < f.DF; i++) s.push('DF');
    for (let i = 0; i < f.MF; i++) s.push('MF');
    for (let i = 0; i < f.FW; i++) s.push('FW');
    return s;
  }

  function slotRating(p, slot) {
    let r = rateFor(p, slot);
    if (p.pos !== slot) r *= (p.pos === 'GK' || slot === 'GK') ? 0.35 : 0.8;
    return r;
  }

  function surname(p) { const parts = p.name.split(' '); return parts[parts.length - 1]; }

  const TXT = {
    buildUp: [
      '{p} topla ilerliyor...', '{p} sağ kanattan bindiriyor...', '{p} sol kanatta boş alan buldu...',
      '{p} ara pası bekliyor...', '{t} hızlı bir atak geliştiriyor...', '{p} rakibini çalımlıyor...',
      '{p} ceza sahasına giriyor...', '{p} uzaktan şansını deneyecek...', '{a} ortaladı, {p} yükseliyor...',
      '{a} harika bir pas verdi, {p} topla buluştu...'
    ],
    goal: ['GOL! {p} topu ağlara gönderdi!', 'GOOOL! {p} kaleciyi mağlup ediyor!', 'GOL! {p} köşeye bıraktı, müthiş bitiriş!',
      'GOL! {p} soğukkanlılıkla vuruyor ve top filelerde!', 'GOOOL! Stadyum ayakta, {p} skoru değiştiriyor!'],
    save: ['{k} uzanıyor ve kurtarıyor!', 'Şut isabetli ama {k} yerinde!', '{k} parmaklarının ucuyla kornere çeliyor!',
      '{k} topu kontrol etti.', 'Kurtarış! {k} harika uçtu!'],
    miss: ['Şut auta gidiyor.', 'Top üst direğin üzerinden auta!', 'Az farkla dışarıda!', 'Direk! Top oyun alanına döndü.',
      'Vuruş zayıf, top dışarıda.', 'Top yan filelerde!'],
    blocked: ['Savunma araya girdi, şut bloke edildi.', '{d} son anda müdahale ediyor!', '{d} topu uzaklaştırdı.'],
    foul: ['{p} faul yaptı.', '{p} sert girdi, hakem düdüğü çaldı.', '{p} rakibini formasından çekti.'],
    yellow: ['Hakem {p} için sarı kartını çıkardı.'],
    red: ['KIRMIZI KART! {p} oyundan atılıyor!'],
    second: ['İkinci sarı! {p} kırmızı kartla oyun dışı!'],
    corner: ['{t} korner kazandı.'],
    offside: ['{p} ofsayt pozisyonunda.', 'Yan hakem bayrağını kaldırdı, {p} ofsayt.'],
    injury: ['{p} sakatlandı, yerde kaldı...'],
    penalty: ['PENALTI! {p} ceza sahasında düşürüldü!'],
    penGoal: ['GOL! {p} penaltıyı gole çevirdi!'],
    penMiss: ['{k} penaltıyı kurtardı!', '{p} penaltıyı dışarı attı!']
  };
  function fmt(tpl, m) { return tpl.replace(/\{(\w)\}/g, (_, k) => m[k] || ''); }

  class Match {
    // home/away: { team, players: [Player], tactic }
    constructor(home, away, opts) {
      opts = opts || {};
      this.minute = 0;
      this.events = [];
      this.finished = false;
      this.userSide = opts.userSide === undefined ? -1 : opts.userSide;
      this.all = {};
      home.players.concat(away.players).forEach(p => { this.all[p.id] = p; });
      this.sides = [home, away].map((h, i) => this._mkSide(h, i));
      this.homeAdv = 1.05;
    }

    _mkSide(src, idx) {
      const t = src.tactic;
      const slots = slotsOf(t.formation);
      const byId = {};
      src.players.forEach(p => { byId[p.id] = p; });
      const onPitch = [];
      t.xi.forEach((id, i) => { if (byId[id]) onPitch.push({ p: byId[id], slot: slots[i], cond: byId[id].cond }); });
      const bench = t.subs.map(id => byId[id]).filter(Boolean);
      const ps = {};
      onPitch.forEach(o => { ps[o.p.id] = { mins: 0, g: 0, a: 0, yc: 0, rc: 0, saves: 0, inj: false, started: true, on: 0, off: null }; });
      return {
        idx, team: src.team, tactic: Object.assign({}, t), onPitch, bench, subsLeft: 3, ps,
        st: { goals: 0, shots: 0, onT: 0, corners: 0, fouls: 0, yc: 0, rc: 0, poss: 0 },
        scorers: []
      };
    }

    strength(s) {
      const m = D.MENTALITY[s.tactic.mentality];
      const pa = D.PASSING[s.tactic.passing];
      const pr = D.PRESSING[s.tactic.pressing];
      let att = 0, mid = 0, def = 0, gk = 3;
      for (const o of s.onPitch) {
        const p = o.p;
        const r = slotRating(p, o.slot) * (0.55 + 0.45 * o.cond / 100) * (0.94 + 0.12 * p.morale / 100);
        if (o.slot === 'GK') { gk = r; def += r * 0.2; }
        else if (o.slot === 'DF') { def += r; mid += r * 0.3; att += r * 0.1; }
        else if (o.slot === 'MF') { mid += r; def += r * 0.4; att += r * 0.45; }
        else { att += r; mid += r * 0.3; }
      }
      const h = s.idx === 0 ? this.homeAdv : 1;
      return { att: att * m.att * h, mid: mid * pa.mid * h, def: def * m.def * pr.def * h, gk, chanceMul: pa.chance };
    }

    pickWeighted(s, fn) {
      const list = s.onPitch;
      let tot = 0; const ws = list.map(o => { const w = Math.max(0, fn(o)); tot += w; return w; });
      if (tot <= 0) return list[0];
      let r = D.rand() * tot;
      for (let i = 0; i < list.length; i++) { r -= ws[i]; if (r <= 0) return list[i]; }
      return list[list.length - 1];
    }
    shooter(s) {
      const pw = { FW: 4.2, MF: 2.4, DF: 0.6, GK: 0 };
      return this.pickWeighted(s, o => pw[o.slot] * (o.p.attrs.bitiricilik + o.p.attrs.pozisyon / 2));
    }
    assister(s, not) {
      const pw = { FW: 2, MF: 4, DF: 1, GK: 0.05 };
      return this.pickWeighted(s, o => o === not ? 0 : pw[o.slot] * (o.p.attrs.pas + o.p.attrs.yaraticilik));
    }
    defender(s) {
      const pw = { FW: 0.2, MF: 1, DF: 4, GK: 0 };
      return this.pickWeighted(s, o => pw[o.slot] * (o.p.attrs.topKapma + o.p.attrs.markaj));
    }
    keeper(s) { return s.onPitch.find(o => o.slot === 'GK') || s.onPitch[0]; }

    ev(type, side, text, extra) {
      const e = Object.assign({ min: this.minute, type, side, text }, extra || {});
      this.events.push(e); this._out.push(e); return e;
    }

    // Bir dakika oynat, o dakikanın olaylarını döndür
    step() {
      if (this.finished) return [];
      this._out = [];
      this.minute++;
      const mn = this.minute;
      if (mn === 1) this.ev('info', -1, 'Hakem ilk düdüğü çaldı, maç başladı!');
      if (mn === 46) this.ev('info', -1, 'İkinci yarı başladı.');

      const S = this.sides.map(s => this.strength(s));
      // Yorgunluk
      this.sides.forEach(s => {
        const tire = D.PRESSING[s.tactic.pressing].tire;
        s.onPitch.forEach(o => {
          o.cond = Math.max(10, o.cond - 0.22 * tire * (1.6 - o.p.attrs.dayaniklilik / 20));
          s.ps[o.p.id].mins++;
        });
      });

      const m0 = Math.pow(S[0].mid, 2.2), m1 = Math.pow(S[1].mid, 2.2);
      const a = D.rand() < m0 / (m0 + m1) ? 0 : 1;
      const d = 1 - a;
      const A = this.sides[a], Df = this.sides[d];
      A.st.poss++;
      const rr = (S[a].att / S[d].def) / 0.72;
      const pChance = D.clamp(0.2 * Math.pow(rr, 1.3) * S[a].chanceMul, 0.05, 0.45);

      const r = D.rand();
      if (r < pChance) this.chance(A, Df, rr, S[d]);
      else if (r < pChance + 0.11) this.foul(Df, A);
      else if (r < pChance + 0.14) {
        const o = this.shooter(A);
        this.ev('offside', a, fmt(D.pick(TXT.offside), { p: surname(o.p) }));
      } else if (r < pChance + 0.145) this.injury(D.rand() < 0.5 ? A : Df);

      this.aiManage();

      if (mn === 45) this.ev('half', -1, `İlk yarı sona erdi: ${this.scoreLine()}`);
      if (mn >= 90) {
        this.finished = true;
        this.ev('end', -1, `Maç sona erdi! ${this.scoreLine()}`);
        this.finalize();
      }
      return this._out;
    }

    scoreLine() {
      const [h, a] = this.sides;
      return `${h.team.name} ${h.st.goals} - ${a.st.goals} ${a.team.name}`;
    }

    chance(A, Df, rr, sd) {
      const a = A.idx;
      const sh = this.shooter(A);
      const as = this.assister(A, sh);
      A.st.shots++;
      this.ev('build', a, fmt(D.pick(TXT.buildUp), { p: surname(sh.p), a: surname(as.p), t: A.team.name }));
      // Penaltı
      if (D.rand() < 0.035) {
        this.ev('pen', a, fmt(D.pick(TXT.penalty), { p: surname(sh.p) }));
        A.st.onT++;
        const taker = A.onPitch.slice().sort((x, y) => y.p.attrs.bitiricilik - x.p.attrs.bitiricilik)[0];
        const k = this.keeper(Df);
        if (D.rand() < 0.72 + (taker.p.attrs.bitiricilik - k.p.attrs.kalecilik) * 0.01) {
          this.goal(A, taker, null, fmt(D.pick(TXT.penGoal), { p: surname(taker.p) }));
        } else {
          Df.ps[k.p.id].saves++;
          this.ev('miss', a, fmt(D.pick(TXT.penMiss), { p: surname(taker.p), k: surname(k.p) }));
        }
        return;
      }
      if (D.rand() < 0.22) {
        const df = this.defender(Df);
        this.ev('block', Df.idx, fmt(D.pick(TXT.blocked), { d: surname(df.p) }));
        if (D.rand() < 0.4) this.corner(A);
        return;
      }
      const fin = sh.p.attrs.bitiricilik * (0.6 + 0.4 * sh.cond / 100);
      const onT = D.clamp(0.33 + (fin - 10) * 0.02 + (rr - 1) * 0.06, 0.15, 0.6);
      if (D.rand() < onT) {
        A.st.onT++;
        const k = this.keeper(Df);
        const gkr = k.slot === 'GK' ? sd.gk : 3;
        const pg = D.clamp(0.27 * (fin + 8) / (gkr + 8) * (0.88 + 0.12 * rr), 0.08, 0.55);
        if (D.rand() < pg) {
          this.goal(A, sh, D.rand() < 0.75 ? as : null, fmt(D.pick(TXT.goal), { p: surname(sh.p) }));
        } else {
          Df.ps[k.p.id].saves++;
          this.ev('save', Df.idx, fmt(D.pick(TXT.save), { k: surname(k.p) }));
          if (D.rand() < 0.35) this.corner(A);
        }
      } else {
        this.ev('miss', a, D.pick(TXT.miss));
      }
    }

    corner(A) {
      A.st.corners++;
      this.ev('corner', A.idx, fmt(D.pick(TXT.corner), { t: A.team.name }));
      if (D.rand() < 0.12) {
        const Df = this.sides[1 - A.idx];
        const hd = this.pickWeighted(A, o => (o.slot === 'GK' ? 0 : 1) * o.p.attrs.kafa * o.p.attrs.kafa);
        const as = this.assister(A, hd);
        A.st.shots++;
        this.ev('build', A.idx, `${surname(as.p)} korneri kullandı, ${surname(hd.p)} kafayı vuruyor...`);
        const df = this.defender(Df);
        if (D.rand() < 0.3 * (hd.p.attrs.kafa + 5) / (df.p.attrs.kafa + 5)) {
          A.st.onT++;
          this.goal(A, hd, as, `GOL! ${surname(hd.p)} kafayla ağları sarstı!`);
        } else this.ev('miss', A.idx, D.pick(['Kafa vuruşu auta gidiyor.', `${surname(df.p)} kafayla uzaklaştırdı.`]));
      }
    }

    goal(A, sh, as, text) {
      A.st.goals++;
      A.ps[sh.p.id].g++;
      if (as && as !== sh) A.ps[as.p.id].a++;
      A.scorers.push({ min: this.minute, name: surname(sh.p), id: sh.p.id });
      this.ev('goal', A.idx, text, { score: [this.sides[0].st.goals, this.sides[1].st.goals], scorer: sh.p.id, assist: as ? as.p.id : null });
    }

    foul(F, A) {
      const f = this.defender(F);
      F.st.fouls++;
      this.ev('foul', F.idx, fmt(D.pick(TXT.foul), { p: surname(f.p) }));
      const r = D.rand();
      const ps = F.ps[f.p.id];
      if (r < 0.007) {
        ps.rc = 1; F.st.rc++;
        this.ev('red', F.idx, fmt(D.pick(TXT.red), { p: surname(f.p) }), { pid: f.p.id });
        this.removePlayer(F, f);
      } else if (r < 0.18) {
        ps.yc++; F.st.yc++;
        if (ps.yc >= 2) {
          ps.rc = 1; F.st.rc++;
          this.ev('red', F.idx, fmt(D.pick(TXT.second), { p: surname(f.p) }), { pid: f.p.id });
          this.removePlayer(F, f);
        } else this.ev('yellow', F.idx, fmt(D.pick(TXT.yellow), { p: surname(f.p) }), { pid: f.p.id });
      }
    }

    injury(s) {
      const cand = s.onPitch.filter(o => !s.ps[o.p.id].inj);
      if (!cand.length) return;
      const o = D.pick(cand);
      s.ps[o.p.id].inj = true;
      o.cond = Math.min(o.cond, 30);
      this.ev('injury', s.idx, fmt(D.pick(TXT.injury), { p: surname(o.p) }), { pid: o.p.id });
      if (s.idx !== this.userSide) this.autoSubInjured(s, o);
    }

    removePlayer(s, o) {
      s.ps[o.p.id].off = this.minute;
      s.ps[o.p.id].cond = o.cond;
      s.onPitch = s.onPitch.filter(x => x !== o);
      // Kaleci atılırsa bir oyuncu kaleye geçer
      if (o.slot === 'GK' && s.onPitch.length) {
        if (s.idx !== this.userSide && s.subsLeft > 0) {
          const gk = s.bench.find(p => p.pos === 'GK');
          const out = s.onPitch.filter(x => x.slot !== 'GK').sort((x, y) => slotRating(x.p, x.slot) - slotRating(y.p, y.slot))[0];
          if (gk && out) { this.substitute(s, out.p.id, gk.id); const n = s.onPitch.find(x => x.p.id === gk.id); if (n) n.slot = 'GK'; return; }
        }
        const t = s.onPitch.slice().sort((x, y) => y.p.attrs.kalecilik - x.p.attrs.kalecilik)[0];
        t.slot = 'GK';
      }
    }

    substitute(s, outId, inId) {
      if (s.subsLeft <= 0) return false;
      const oi = s.onPitch.findIndex(o => o.p.id === outId);
      const bi = s.bench.findIndex(p => p.id === inId);
      if (oi < 0 || bi < 0) return false;
      const out = s.onPitch[oi];
      const inn = s.bench[bi];
      s.onPitch[oi] = { p: inn, slot: out.slot, cond: inn.cond };
      s.bench.splice(bi, 1);
      s.subsLeft--;
      s.ps[out.p.id].off = this.minute;
      s.ps[out.p.id].cond = out.cond;
      s.ps[inn.id] = { mins: 0, g: 0, a: 0, yc: 0, rc: 0, saves: 0, inj: false, started: false, on: this.minute, off: null };
      this.ev('sub', s.idx, `Oyuncu değişikliği (${s.team.short}): ${surname(inn)} oyuna girdi, ${surname(out.p)} çıktı.`);
      return true;
    }

    autoSubInjured(s, o) {
      if (s.subsLeft <= 0) return;
      const same = s.bench.filter(p => p.pos === o.slot);
      const pool = same.length ? same : s.bench.filter(p => p.pos !== 'GK' || o.slot === 'GK');
      if (!pool.length) return;
      const best = pool.sort((x, y) => slotRating(y, o.slot) - slotRating(x, o.slot))[0];
      this.substitute(s, o.p.id, best.id);
    }

    aiManage() {
      const mn = this.minute;
      this.sides.forEach(s => {
        if (s.idx === this.userSide) return;
        const other = this.sides[1 - s.idx];
        const diff = s.st.goals - other.st.goals;
        if (mn === 70 || mn === 80) {
          if (diff < 0) s.tactic.mentality = diff <= -2 ? 'tamHucum' : 'hucum';
          else if (diff > 0 && mn === 80) s.tactic.mentality = 'defans';
        }
        if ((mn === 60 || mn === 70 || mn === 80) && s.subsLeft > 0) {
          const tired = s.onPitch.filter(o => o.slot !== 'GK').sort((x, y) => x.cond - y.cond)[0];
          if (tired && tired.cond < 72) {
            const cand = s.bench.filter(p => p.pos === tired.slot);
            if (cand.length) {
              const best = cand.sort((x, y) => rateFor(y, tired.slot) - rateFor(x, tired.slot))[0];
              this.substitute(s, tired.p.id, best.id);
            }
          }
        }
      });
    }

    finalize() {
      const [h, a] = this.sides;
      this.sides.forEach(s => {
        const o = this.sides[1 - s.idx];
        const res = s.st.goals > o.st.goals ? 0.4 : s.st.goals === o.st.goals ? 0 : -0.3;
        const conceded = o.st.goals;
        const slotOf = {};
        s.onPitch.forEach(x => { slotOf[x.p.id] = x.slot; s.ps[x.p.id].cond = x.cond; });
        for (const id in s.ps) {
          const ps = s.ps[id];
          if (ps.mins <= 0 && !ps.started) { ps.rating = null; continue; }
          const p = this.all[id];
          const pos = slotOf[id] || (p ? p.pos : 'MF');
          let r = 6.2 + res + ps.g * 1.0 + ps.a * 0.5 + D.gauss() * 0.9;
          if (p) r += (rateFor(p, pos) - 12) * 0.08;
          if (pos === 'GK') r += ps.saves * 0.2 - conceded * 0.3 + (conceded === 0 ? 0.6 : 0);
          else if (pos === 'DF') r += -conceded * 0.2 + (conceded === 0 ? 0.5 : 0);
          if (ps.rc) r -= 1.5;
          ps.rating = Math.round(D.clamp(r, 3, 10) * 10) / 10;
        }
      });
      this.result = { hg: h.st.goals, ag: a.st.goals };
    }

    runToEnd() { while (!this.finished) this.step(); return this; }
  }

  G.E = { rateFor, ovr, slotsOf, slotRating, surname, Match };
})(window);
