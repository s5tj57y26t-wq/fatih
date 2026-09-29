/* Kayıt: oyuncular sıkıştırılmış dizilere çevrilir, gzip ile IndexedDB'ye yazılır */
(function (G) {
  'use strict';
  const CM = G.CM;
  const DBN = 'sampiyonluk-menajeri', STORE = 'saves';
  const A = () => CM.P.ATTRS;

  function packPlayer(p) {
    const a = A().map(k => p.a[k]);
    const flags = (p.gen ? 1 : 0) | (p.listed ? 2 : 0) | (p.ntOnly ? 4 : 0) | (p.loanListed ? 8 : 0);
    const o = [p.id, p.n, p.nat, p.b, p.pos, p.sec.join('/'), a, p.pa, p.club, p.wage, p.ce, Math.round(p.cond), Math.round(p.mor), p.inj, flags];
    const ext = {};
    if (p.injN) ext.i = p.injN;
    if (Object.keys(p.sus).length) ext.s = p.sus;
    if (Object.keys(p.yc).length) ext.y = p.yc;
    if (Object.keys(p.st).length) { ext.t = {}; for (const k in p.st) ext.t[k] = p.st[k].map(v => Math.round(v * 10) / 10); }
    if (p.car && p.car.length) ext.c = p.car;
    if (p.tf) ext.f = p.tf;
    if (p.ntCaps) ext.nc = [p.ntCaps, p.ntGoals];
    if (p.lastPlay) ext.lp = p.lastPlay;
    if (p.away) ext.aw = p.away;
    if (p.loan) ext.lo = p.loan;
    const x = {};
    ['talkDay', 'promise', 'wantsOut', 'clause', 'gb', 'ms', 'aw'].forEach(k => { if (p[k]) x[k] = p[k]; });
    if (Object.keys(x).length) ext.x = x;
    if (Object.keys(ext).length) o.push(ext);
    return o;
  }
  function unpackPlayer(o) {
    const a = {};
    A().forEach((k, i) => { a[k] = o[6][i]; });
    const e = o[15] || {};
    return Object.assign({
      id: o[0], n: o[1], nat: o[2], b: o[3], pos: o[4], sec: o[5] ? o[5].split('/') : [], a, pa: o[7], club: o[8], wage: o[9], ce: o[10],
      cond: o[11], mor: o[12], inj: o[13], gen: !!(o[14] & 1), listed: !!(o[14] & 2), ntOnly: !!(o[14] & 4) || undefined, loanListed: !!(o[14] & 8),
      injN: e.i || '', sus: e.s || {}, yc: e.y || {}, st: e.t || {}, car: e.c || [], tf: e.f || null,
      ntCaps: e.nc ? e.nc[0] : 0, ntGoals: e.nc ? e.nc[1] : 0, lastPlay: e.lp || 0, away: e.aw || 0, loan: e.lo || null
    }, e.x || {});
  }
  function pack(S) {
    const out = {};
    for (const k in S) {
      if (k === 'players' || k[0] === '_') continue;
      out[k] = S[k];
    }
    out.P = Object.values(S.players).map(packPlayer);
    out.seed = CM.U.R.s;
    return JSON.stringify(out, (k, v) => (k === '_str' || k === '_strDay') ? undefined : v);
  }
  function unpack(str) {
    const o = JSON.parse(str);
    const S = o;
    S.players = {};
    o.P.forEach(x => { const p = unpackPlayer(x); S.players[p.id] = p; });
    delete S.P;
    CM.U.R.s = S.seed >>> 0;
    return S;
  }

  // ---------- IndexedDB ----------
  function db() {
    return new Promise((res, rej) => {
      if (!G.indexedDB) return rej(new Error('IndexedDB yok'));
      const r = indexedDB.open(DBN, 1);
      r.onupgradeneeded = () => r.result.createObjectStore(STORE);
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    });
  }
  async function gz(str) {
    if (typeof CompressionStream === 'undefined') return str;
    const cs = new Blob([str]).stream().pipeThrough(new CompressionStream('gzip'));
    return await new Response(cs).blob();
  }
  async function gunz(v) {
    if (typeof v === 'string') return v;
    const ds = v.stream().pipeThrough(new DecompressionStream('gzip'));
    return await new Response(ds).text();
  }
  async function put(key, val) {
    const d = await db();
    return new Promise((res, rej) => { const t = d.transaction(STORE, 'readwrite'); t.objectStore(STORE).put(val, key); t.oncomplete = () => res(); t.onerror = () => rej(t.error); });
  }
  async function get(key) {
    const d = await db();
    return new Promise((res, rej) => { const t = d.transaction(STORE, 'readonly'); const r = t.objectStore(STORE).get(key); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
  }
  async function del(key) {
    const d = await db();
    return new Promise((res) => { const t = d.transaction(STORE, 'readwrite'); t.objectStore(STORE).delete(key); t.oncomplete = () => res(); t.onerror = () => res(); });
  }

  let busy = false, again = false;
  async function save() {
    if (!CM.S) return false;
    if (busy) { again = true; return false; }
    busy = true;
    try {
      const str = pack(CM.S);
      const blob = await gz(str);
      await put('slot1', blob);
      const u = CM.S.user, c = u && u.club != null ? CM.S.clubs[u.club] : null;
      await put('meta1', { day: CM.S.day, club: c ? c.n : '-', name: u ? u.name : '', at: Date.now() });
      return true;
    } catch (e) {
      console.warn('Kayıt başarısız', e);
      return false;
    } finally {
      busy = false;
      if (again) { again = false; setTimeout(save, 50); }
    }
  }
  async function load() {
    const v = await get('slot1');
    if (!v) return null;
    const str = await gunz(v);
    CM.S = unpack(str);
    return CM.S;
  }
  async function meta() { try { return await get('meta1'); } catch (e) { return null; } }
  async function remove() { try { await del('slot1'); await del('meta1'); } catch (e) { /* yok */ } }

  CM.Save = { pack, unpack, save, load, meta, remove };
})(typeof window !== 'undefined' ? window : globalThis);
