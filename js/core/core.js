/* Temel yardımcılar: rastgelelik, tarih, para, küçük araçlar */
(function (G) {
  'use strict';
  const CM = G.CM = G.CM || {};
  CM.DB = CM.DB || { clubs: [], extraClubs: [], nations: {}, names: {} };

  // ---------- Rastgelelik (oyun durumuyla birlikte kaydedilir) ----------
  const R = { s: (Date.now() ^ 0x9e3779b9) >>> 0 };
  function rand() {
    R.s = (R.s + 0x6D2B79F5) | 0;
    let t = Math.imul(R.s ^ (R.s >>> 15), 1 | R.s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  // Belirli bir metinden türetilen sabit rastgele üreteci (oyuncu özellikleri hep aynı çıksın diye)
  function seeded(str) {
    let s = hash(str);
    return function () {
      s = (s + 0x6D2B79F5) | 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function hash(str) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  const ri = (a, b, r) => a + Math.floor((r || rand)() * (b - a + 1));
  const pick = (arr, r) => arr[Math.floor((r || rand)() * arr.length)];
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const gauss = r => { r = r || rand; return (r() + r() + r() + r() - 2) / 2; };
  function shuffle(arr, r) {
    r = r || rand;
    for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); const t = arr[i]; arr[i] = arr[j]; arr[j] = t; }
    return arr;
  }
  function weighted(items, wfn, r) {
    let tot = 0; const ws = items.map(x => { const w = Math.max(0, wfn(x)); tot += w; return w; });
    if (tot <= 0) return items[0];
    let v = (r || rand)() * tot;
    for (let i = 0; i < items.length; i++) { v -= ws[i]; if (v <= 0) return items[i]; }
    return items[items.length - 1];
  }
  function poisson(l, r) {
    r = r || rand;
    const L = Math.exp(-l); let k = 0, p = 1;
    do { k++; p *= r(); } while (p > L && k < 15);
    return k - 1;
  }

  // ---------- Tarih (gün numarası = 1970'ten beri gün) ----------
  const DAY = 86400000;
  const day = (y, m, d) => Math.floor(Date.UTC(y, m - 1, d) / DAY);
  const parseDay = s => { const [y, m, d] = s.split('-').map(Number); return day(y, m, d); };
  function ymd(n) { const d = new Date(n * DAY); return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate(), w: d.getUTCDay() }; }
  const AYLAR = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  const GUNLER = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
  function fmtDay(n, opts) {
    const t = ymd(n);
    if (opts === 'short') return `${t.d} ${AYLAR[t.m - 1].slice(0, 3)}`;
    return `${t.d} ${AYLAR[t.m - 1]} ${t.y}${opts === 'dow' ? ' ' + GUNLER[t.w] : ''}`;
  }
  // Belirli aralıktaki haftanın belirli günleri (0=Pazar ... 6=Cumartesi)
  function weekdaysBetween(from, to, dow) {
    const out = [];
    let d = from;
    while (ymd(d).w !== dow) d++;
    for (; d <= to; d += 7) out.push(d);
    return out;
  }

  // ---------- Para ----------
  function money(v) {
    const neg = v < 0; v = Math.abs(v);
    let s;
    if (v >= 1e9) s = '€' + (v / 1e9).toFixed(2).replace('.', ',') + 'Mr';
    else if (v >= 1e6) s = '€' + (v / 1e6).toFixed(v >= 1e8 ? 0 : v >= 1e7 ? 1 : 2).replace('.', ',') + 'M';
    else if (v >= 1e3) s = '€' + Math.round(v / 1e3) + 'K';
    else s = '€' + Math.round(v);
    return (neg ? '-' : '') + s;
  }
  function roundMoney(v) {
    const step = v >= 1e7 ? 100000 : v >= 1e6 ? 25000 : v >= 1e5 ? 5000 : v >= 1e4 ? 500 : 50;
    return Math.max(0, Math.round(v / step) * step);
  }

  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const sum = (a, f) => a.reduce((t, x) => t + (f ? f(x) : x), 0);
  const avg = (a, f) => a.length ? sum(a, f) / a.length : 0;
  const by = (f, dir) => (a, b) => (dir === -1 ? f(b) - f(a) : f(a) - f(b));

  CM.U = {
    R, rand, seeded, hash, ri, pick, clamp, gauss, shuffle, weighted, poisson,
    day, parseDay, ymd, fmtDay, weekdaysBetween, AYLAR, GUNLER,
    money, roundMoney, esc, sum, avg, by
  };
})(typeof window !== 'undefined' ? window : globalThis);
