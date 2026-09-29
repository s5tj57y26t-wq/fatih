/* Oyuncu modeli: mevkiler, özellikler, güç, değer, maaş, üretim */
(function (G) {
  'use strict';
  const CM = G.CM, U = CM.U;

  const ATTRS = ['kal', 'ref', 'bit', 'uza', 'pas', 'ort', 'dri', 'tek', 'kaf', 'kap', 'mar', 'yar', 'poz', 'kar', 'hiz', 'day', 'guc'];
  const ATTR_TR = {
    kal: 'Kalecilik', ref: 'Refleks', bit: 'Bitiricilik', uza: 'Uzaktan Şut', pas: 'Pas', ort: 'Orta', dri: 'Top Sürme',
    tek: 'Teknik', kaf: 'Kafa Vuruşu', kap: 'Top Kapma', mar: 'Markaj', yar: 'Yaratıcılık', poz: 'Pozisyon Alma',
    kar: 'Kararlılık', hiz: 'Hız', day: 'Dayanıklılık', guc: 'Güç'
  };
  const ATTR_GROUPS = [
    ['Teknik', ['bit', 'uza', 'pas', 'ort', 'dri', 'tek', 'kaf', 'kap', 'mar']],
    ['Zihinsel', ['yar', 'poz', 'kar']],
    ['Fiziksel', ['hiz', 'day', 'guc']],
    ['Kaleci', ['kal', 'ref']]
  ];

  const POS = ['GK', 'CB', 'LB', 'RB', 'DM', 'CM', 'LM', 'RM', 'AM', 'LW', 'RW', 'ST'];
  const POS_TR = { GK: 'K', CB: 'STP', LB: 'SLB', RB: 'SĞB', DM: 'DOS', CM: 'OS', LM: 'SLO', RM: 'SĞO', AM: 'OOS', LW: 'SLK', RW: 'SĞK', ST: 'SNT' };
  const POS_LONG = {
    GK: 'Kaleci', CB: 'Stoper', LB: 'Sol Bek', RB: 'Sağ Bek', DM: 'Defansif Orta Saha', CM: 'Orta Saha', LM: 'Sol Orta Saha',
    RM: 'Sağ Orta Saha', AM: 'Ofansif Orta Saha', LW: 'Sol Kanat', RW: 'Sağ Kanat', ST: 'Santrfor'
  };
  const LINE = { GK: 'G', CB: 'D', LB: 'D', RB: 'D', DM: 'M', CM: 'M', LM: 'M', RM: 'M', AM: 'M', LW: 'F', RW: 'F', ST: 'F' };
  const ROLE = { GK: 'GK', CB: 'CB', LB: 'FB', RB: 'FB', DM: 'DM', CM: 'CM', LM: 'WM', RM: 'WM', AM: 'AM', LW: 'W', RW: 'W', ST: 'ST' };
  const ROLE_W = {
    GK: { kal: 5, ref: 4, poz: 2, kar: 1, pas: 0.5 },
    CB: { kap: 3, mar: 3, kaf: 2.5, poz: 2, guc: 1.5, hiz: 1, kar: 1, pas: 0.5 },
    FB: { kap: 2, mar: 2, hiz: 2, ort: 1.5, day: 1.5, pas: 1, poz: 1, dri: 0.5 },
    DM: { kap: 2.5, pas: 2.5, poz: 2, mar: 1.5, day: 1.5, kar: 1, guc: 1 },
    CM: { pas: 3, tek: 2, yar: 1.5, day: 1.5, kap: 1, poz: 1, kar: 1, uza: 0.5, dri: 0.5 },
    WM: { ort: 2, hiz: 2, pas: 2, dri: 2, day: 1.5, tek: 1, yar: 0.5 },
    AM: { yar: 3, pas: 2.5, tek: 2.5, dri: 2, uza: 1.5, bit: 1 },
    W: { dri: 3, hiz: 3, tek: 2, bit: 1.5, ort: 1.5, yar: 1 },
    ST: { bit: 4, poz: 2, kaf: 1.5, hiz: 1.5, tek: 1.5, guc: 1, kar: 1, dri: 0.5 }
  };
  // Mevki koordinatları (mevki dışı oynama cezası için)
  const XY = { GK: [0, 0], CB: [0, 1], LB: [-1, 1.1], RB: [1, 1.1], DM: [0, 2], CM: [0, 2.5], LM: [-1, 2.6], RM: [1, 2.6], AM: [0, 3.3], LW: [-1, 3.6], RW: [1, 3.6], ST: [0, 4] };

  function roleRating(p, pos) {
    const w = ROLE_W[ROLE[pos]];
    let s = 0, t = 0;
    for (const k in w) { s += p.a[k] * w[k]; t += w[k]; }
    return s / t;
  }
  function familiarity(p, pos) {
    if (p.pos === pos || (p.sec && p.sec.indexOf(pos) >= 0)) return 1;
    if (pos === 'GK' || p.pos === 'GK') return 0.3;
    let best = 9;
    [p.pos].concat(p.sec || []).forEach(q => {
      const a = XY[q], b = XY[pos];
      best = Math.min(best, Math.hypot(a[0] - b[0], (a[1] - b[1]) * 1.2));
    });
    return Math.max(0.55, 1 - 0.17 * best);
  }
  // Belirli mevkide oynarken etkin güç (1-20)
  function slotRating(p, pos) { return roleRating(p, pos) * familiarity(p, pos); }
  function ovr(p) { return Math.round(roleRating(p, p.pos) * 5); }

  function ageOf(p, season) { return season - p.b; }

  // ---------- Özellik üretimi ----------
  // Gerçek oyuncunun güç değeri (45-95 ölçeği) ve stil etiketlerinden sabit özellikler üretir
  function buildAttrs(p, ability, tags, age) {
    const r = U.seeded(p.n + '|' + p.b + '|' + p.nat);
    const w = ROLE_W[ROLE[p.pos]];
    const target = ability / 5;
    const a = {};
    const boosted = {};
    ATTRS.forEach(k => {
      let v;
      if (w[k]) v = target + 0.5 + w[k] * 0.22;
      else v = target - 2.5 - r() * 2.5;
      if (p.pos === 'GK' && ['bit', 'uza', 'dri', 'tek', 'ort', 'kap', 'mar', 'yar', 'kaf'].includes(k)) v = target - 7 + r() * 3;
      if (p.pos !== 'GK' && (k === 'kal' || k === 'ref')) v = 1 + r() * 3;
      v += U.gauss(r) * 1.3;
      a[k] = v;
    });
    // Yaş etkisi
    a.hiz -= Math.max(0, age - 28) * 0.45;
    a.day -= Math.max(0, age - 30) * 0.4;
    a.kar += U.clamp((age - 25) * 0.14, -1.5, 1.5);
    a.poz += U.clamp((age - 25) * 0.1, -1, 1);
    // Etiketler
    (tags || []).forEach(t => {
      if (!t) return;
      const neg = t[0] === '-';
      const k = neg ? t.slice(1) : t;
      if (a[k] === undefined) return;
      a[k] += neg ? -3 : 3;
      boosted[k] = true;
    });
    // Mevki gücünü hedefe oturt (etiketli özellikler öne çıkar, toplam güç korunur)
    for (let it = 0; it < 10; it++) {
      ATTRS.forEach(k => { a[k] = U.clamp(a[k], 1, 20); });
      const cur = roleRating({ a }, p.pos);
      const d = target - cur;
      if (Math.abs(d) < 0.02) break;
      const keys = Object.keys(w).filter(k => (d > 0 ? a[k] < 20 : a[k] > 1) && (!boosted[k] || it > 5));
      const tw = keys.reduce((t, k) => t + w[k], 0) || 1;
      const sw = Object.keys(w).reduce((t, k) => t + w[k], 0);
      keys.forEach(k => { a[k] += d * sw / tw; });
    }
    ATTRS.forEach(k => { a[k] = Math.round(U.clamp(a[k], 1, 20)); });
    // Tam sayı düzeltmesi: 1-100 ölçeğindeki güç hedefle aynı olsun
    for (let it = 0; it < 12; it++) {
      const cur = Math.round(roleRating({ a }, p.pos) * 5);
      const diff = ability - cur;
      if (diff === 0) break;
      const keys = Object.keys(w).filter(k => diff > 0 ? a[k] < 20 : a[k] > 1).sort((x, y) => (w[y] - w[x]) || (diff > 0 ? a[x] - a[y] : a[y] - a[x]));
      if (!keys.length) break;
      const k = keys[it % Math.min(3, keys.length)];
      a[k] += diff > 0 ? 1 : -1;
    }
    return a;
  }

  // ---------- Değer ve maaş ----------
  function leagueFactor(clubId) {
    const c = clubId != null && CM.S ? CM.S.clubs[clubId] : null;
    const lg = c && c.lg && CM.LEAGUES[c.lg];
    return lg ? lg.wf : (c && c.wf) || 0.5;
  }
  function valueOf(p, season) {
    season = season || (CM.S ? CM.S.season : 2026);
    const A = ovr(p);
    const age = ageOf(p, season);
    let v = 300000 * Math.pow(1.155, A - 50);
    v *= age <= 20 ? 1.5 : age <= 23 ? 1.35 : age <= 27 ? 1.1 : age <= 29 ? 0.85 : age <= 31 ? 0.55 : age <= 33 ? 0.3 : 0.15;
    if (age <= 24 && p.pa > A) v *= 1 + (p.pa - A) / 25;
    const left = p.ce - season;
    if (p.club != null && left <= 0) v *= 0.55; else if (left === 1) v *= 0.8;
    v *= 0.85 + Math.min(0.5, leagueFactor(p.club) * 0.12);
    return U.roundMoney(Math.max(10000, v));
  }
  function wageFor(p, lf) {
    const A = ovr(p);
    lf = lf == null ? leagueFactor(p.club) : lf;
    return U.roundMoney(Math.max(400, 100 * Math.pow(1.16, A - 40) * lf));
  }

  // ---------- Oluşturma ----------
  // Veritabanı satırı: "Ad Soyad;MEVKİ[/YAN,YAN];doğumYılı;ÜLKE;güç[;potansiyel][;etiketler][;sözleşmeSonu]"
  function fromLine(line, clubId, season) {
    const f = line.split(';').map(s => s.trim());
    if (f.length < 5) return null;
    const [pp, ...sec] = f[1].split('/');
    const secList = sec.length ? sec.join(',').split(',').filter(Boolean) : [];
    const b = +f[2];
    const A = +f[4];
    const p = mk({ n: f[0], pos: pp, sec: secList, b, nat: f[3], gen: false });
    const age = season - b;
    const tags = (f[6] || '').split(',').map(s => s.trim()).filter(Boolean);
    p.a = buildAttrs(p, A, tags, age);
    const r = U.seeded('pa' + p.n + b);
    p.pa = f[5] ? +f[5] : (age <= 23 ? Math.min(95, A + Math.round((24 - age) * (1 + r() * 1.6) + r() * 3)) : A);
    p.ce = f[7] ? +f[7] : season + 1 + Math.floor(r() * 4);
    p.club = clubId;
    return p;
  }

  function mk(o) {
    return Object.assign({
      id: CM.S ? CM.S.nextPid++ : 0, n: '', nat: 'TUR', b: 2000, pos: 'CM', sec: [], a: null, pa: 60, club: null,
      wage: 0, ce: 2027, cond: 100, mor: 65, inj: 0, injN: '', sus: {}, yc: {}, st: {}, car: [], gen: true, listed: false,
      loan: null, tf: null, ntCaps: 0, ntGoals: 0
    }, o);
  }

  // Kurgusal (veritabanını tamamlayan) oyuncu üret
  function generate(pos, ability, age, nat, season, opts) {
    opts = opts || {};
    const nm = CM.Names.make(nat);
    const p = mk({ n: nm, pos, b: season - age, nat, gen: true });
    const r = U.rand;
    // Yan mevkiler
    const near = { CB: ['RB', 'LB', 'DM'], LB: ['LM', 'CB'], RB: ['RM', 'CB'], DM: ['CM', 'CB'], CM: ['DM', 'AM'], LM: ['LW', 'LB'], RM: ['RW', 'RB'], AM: ['CM', 'ST'], LW: ['LM', 'RW', 'AM'], RW: ['RM', 'LW', 'AM'], ST: ['AM', 'LW', 'RW'], GK: [] };
    if (r() < 0.45 && near[pos].length) p.sec = [U.pick(near[pos])];
    const tags = [];
    const w = Object.keys(ROLE_W[ROLE[pos]]);
    if (r() < 0.6) tags.push(U.pick(w));
    if (r() < 0.2) tags.push(U.pick(ATTRS.filter(k => k !== 'kal' && k !== 'ref')));
    // Belirli seed yerine rastgele üretim: aynı isim çakışmasın diye ek
    p.a = buildAttrs(Object.assign({}, p, { n: p.n + '#' + Math.floor(r() * 1e9) }), ability, tags, age);
    p.pa = age <= 23 ? Math.min(92, ability + Math.round((24 - age) * (0.6 + r() * 1.8) + r() * 4)) : ability;
    if (opts.youth) p.pa = Math.min(95, ability + 10 + Math.round(r() * r() * 30));
    p.ce = season + 1 + Math.floor(r() * 3);
    return p;
  }

  // Haftalık / sezonluk gelişim ve düşüş
  function develop(p, season, k, focus) {
    const age = ageOf(p, season);
    const cur = ovr(p);
    const w = ROLE_W[ROLE[p.pos]];
    let keys = Object.keys(w).concat(['day', 'kar']);
    if (focus && focus.length) keys = keys.concat(focus, focus);
    if (age <= 28 && cur < p.pa && U.rand() < k * (age <= 21 ? 1.8 : age <= 24 ? 1.3 : 0.8) * (0.4 + (p.pa - cur) / 8)) {
      const a = U.weighted(keys, x => (w[x] || 1) * (p.a[x] < 20 ? 1 : 0));
      if (p.a[a] < 20) p.a[a]++;
    } else if (age >= 30 && U.rand() < k * (age - 29) * 0.35) {
      const a = U.pick(['hiz', 'hiz', 'day', 'guc', U.pick(keys)]);
      if (p.a[a] > 1) p.a[a]--;
    }
  }

  CM.P = {
    ATTRS, ATTR_TR, ATTR_GROUPS, POS, POS_TR, POS_LONG, LINE, ROLE, ROLE_W,
    roleRating, familiarity, slotRating, ovr, ageOf, buildAttrs, valueOf, wageFor, leagueFactor,
    fromLine, mk, generate, develop
  };
})(typeof window !== 'undefined' ? window : globalThis);
