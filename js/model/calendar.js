/* Sezon takvimi: lig haftaları, UEFA maç günleri, kupa turları, milli maç pencereleri */
(function (G) {
  'use strict';
  const CM = G.CM, U = CM.U;
  const D = U.day;

  // Ayın n. haftanın-günü (dow: 0=Paz..6=Cmt)
  function nth(y, m, dow, n) {
    let d = D(y, m, 1);
    while (U.ymd(d).w !== dow) d++;
    return d + (n - 1) * 7;
  }
  function md(y, s) { const [m, d] = s.split('-').map(Number); return D(y, m, d); }

  // FIFA 2026-2030 takvimi: Eylül-Ekim birleşik pencere (4 maç), Kasım (2), Mart (2), Haziran (2)
  function intlWindows(Y) {
    return [
      { id: 'SO', from: D(Y, 9, 21), to: D(Y, 10, 6), days: [D(Y, 9, 24), D(Y, 9, 27), D(Y, 10, 1), D(Y, 10, 4)] },
      { id: 'NO', from: D(Y, 11, 9), to: D(Y, 11, 17), days: [D(Y, 11, 12), D(Y, 11, 15)] },
      { id: 'MA', from: D(Y + 1, 3, 22), to: D(Y + 1, 3, 30), days: [D(Y + 1, 3, 25), D(Y + 1, 3, 28)] },
      { id: 'JU', from: D(Y + 1, 6, 1), to: D(Y + 1, 6, 9), days: [D(Y + 1, 6, 4), D(Y + 1, 6, 7)] }
    ];
  }
  function inWindow(d, wins) { return wins.some(w => d >= w.from - 1 && d <= w.to); }

  // UEFA kulüp takvimi (2026-27 gerçek tarihlerine göre; sonraki sezonlar aynı düzen)
  function uefaDates(Y) {
    const tue = (m, n, y) => nth(y || Y, m, 2, n);
    // İlk iki maç günü Eylül-Ekim milli arasından (21 Eylül) önceki iki salı
    let md2 = D(Y, 9, 16); while (U.ymd(md2).w !== 2) md2--;
    // Ekim/Kasım maç günleri milli aradan (6 Ekim ve 9-17 Kasım) sonra
    let md3 = D(Y, 10, 14); while (U.ymd(md3).w !== 2) md3++;
    let md5 = D(Y, 11, 21); while (U.ymd(md5).w !== 2) md5++;
    const ucl = [md2 - 7, md2, md3, md3 + 14, md5, md5 + 14, tue(1, 3, Y + 1), tue(1, 4, Y + 1) + 1];
    const ko = {
      po: [tue(2, 3, Y + 1), tue(2, 4, Y + 1)], r16: [tue(3, 2, Y + 1), tue(3, 3, Y + 1)],
      qf: [tue(4, 1, Y + 1), tue(4, 2, Y + 1)], sf: [tue(4, 4, Y + 1), tue(4, 4, Y + 1) + 7]
    };
    const plus = (arr, k) => arr.map(x => x + k);
    return {
      ucl: { lp: ucl, po: ko.po, r16: ko.r16, qf: ko.qf, sf: ko.sf, f: nth(Y + 1, 6, 6, 1), fv: Y === 2026 ? 'Estadio Metropolitano, Madrid' : 'Final stadı' },
      uel: { lp: plus(ucl.slice(0, 7), 2).concat([ucl[7] + 1]), po: plus(ko.po, 2), r16: plus(ko.r16, 2), qf: plus(ko.qf, 2), sf: plus(ko.sf, 2), f: nth(Y + 1, 5, 3, 4), fv: Y === 2026 ? 'Frankfurt Stadion' : 'Final stadı' },
      uecl: { lp: [ucl[2] - 5, ucl[2] + 2, ucl[3] + 2, ucl[4] + 2, ucl[5] + 2, ucl[5] + 9], po: plus(ko.po, 2), r16: plus(ko.r16, 2), qf: plus(ko.qf, 2), sf: plus(ko.sf, 2), f: nth(Y + 1, 6, 3, 1), fv: Y === 2026 ? 'Beşiktaş Stadyumu, İstanbul' : 'Final stadı' },
      qual: [tue(8, 3), tue(8, 4)],
      sup: nth(Y, 8, 3, 2)
    };
  }

  // Lig haftaları: cumartesiler (milli ara ve kış arası hariç), yetmezse çarşamba ara haftaları
  function leagueDates(lgId, Y, needed) {
    const L = CM.LEAGUES[lgId];
    const start = md(Y, L.start), end = md(Y + 1, L.end);
    const wins = intlWindows(Y);
    const u = uefaDates(Y);
    const wb = L.winter ? [md(Y, L.winter[0]), md(Y + 1, L.winter[1])] : null;
    const ok = d => !inWindow(d, wins) && !(wb && d >= wb[0] && d <= wb[1]);
    let sats = U.weekdaysBetween(start, end, 6).filter(ok);
    if (sats.length >= needed) {
      // Haftaları sezona eşit dağıt, son hafta her zaman sezon sonu
      const out = [];
      for (let i = 0; i < needed; i++) out.push(sats[Math.round(i * (sats.length - 1) / Math.max(1, needed - 1))]);
      return out;
    }
    const uefaWeeks = new Set();
    [u.ucl, u.uel, u.uecl].forEach(c => [].concat(c.lp, c.po, c.r16, c.qf, c.sf).forEach(d => { for (let k = -3; k <= 3; k++) uefaWeeks.add(d + k); }));
    const mids = U.weekdaysBetween(start + 14, end - 7, 3).filter(d => ok(d) && !uefaWeeks.has(d));
    let all = sats.concat(mids).sort((a, b) => a - b);
    if (all.length < needed) all = all.concat(U.weekdaysBetween(start, end, 3).filter(d => !all.includes(d) && ok(d))).sort((a, b) => a - b);
    if (all.length < needed) all = all.concat(U.weekdaysBetween(start, end, 0).filter(d => !all.includes(d))).sort((a, b) => a - b);
    // Fazla ise ara haftaları azalt
    while (all.length > needed) {
      const i = all.findIndex(d => U.ymd(d).w === 3);
      all.splice(i >= 0 ? i : all.length - 2, 1);
    }
    return all;
  }

  // Yerel kupa: son tur final tarihinde, önceki turlar geriye doğru UEFA dışı çarşambalara
  function cupDates(finalDay, Y, rounds, sfLegs) {
    const u = uefaDates(Y);
    const busy = new Set();
    [u.ucl, u.uel, u.uecl].forEach(c => [].concat(c.lp, c.po, c.r16, c.qf, c.sf).forEach(d => { for (let k = -1; k <= 2; k++) busy.add(d + k); }));
    const wins = intlWindows(Y);
    const cands = U.weekdaysBetween(D(Y, 8, 20), finalDay - 5, 3).filter(d => !busy.has(d) && !inWindow(d, wins));
    // Turları sezona yay: n tur için adaylardan eşit aralıklı seç
    const need = rounds - 1 + (sfLegs === 2 ? 1 : 0);
    const out = [];
    for (let i = 0; i < need; i++) out.push(cands[Math.round(i * (cands.length - 1) / Math.max(1, need - 1))]);
    out.sort((a, b) => a - b);
    const res = [];
    let k = 0;
    for (let r = 0; r < rounds - 1; r++) {
      if (r === rounds - 2 && sfLegs === 2) { res.push([out[k], out[k + 1]]); k += 2; }
      else { res.push([out[k]]); k++; }
    }
    res.push([finalDay]);
    return res;
  }

  CM.Cal = { nth, md, intlWindows, inWindow, uefaDates, leagueDates, cupDates };
})(typeof window !== 'undefined' ? window : globalThis);
