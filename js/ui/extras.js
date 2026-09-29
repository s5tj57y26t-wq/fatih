/* Arayüz: sözleşme pazarlığı, oyuncu konuşmaları, karşılaştırma, izleme listesi, rakip raporu, basın toplantıları,
   yönetim/tesis/altyapı/rekor sekmeleri, ödül arşivi, sezon özeti */
(function (G) {
  'use strict';
  const CM = G.CM, U = CM.U, P = CM.P, M = CM.Market, X = CM.X, UI = CM.UI, A = UI.A, ui = UI.ui, h = UI.h, esc = U.esc;
  const S = () => CM.S;
  const chip = (on, a, extra, label) => `<button class="chip ${on ? 'on' : ''}" data-a="${a}" ${extra}>${label}</button>`;

  // ---------- Sözleşme pazarlığı ----------
  UI.negPanel = function (p) {
    const s = S(), b = s.pending;
    if (!b || b.pid !== p.id) return '';
    const d = b.wage;
    let n = ui.neg;
    if (!n || n.pid !== p.id || n.kind !== b.kind) {
      const a = h.age(p);
      n = ui.neg = { pid: p.id, kind: b.kind, wage: d, years: a <= 24 ? 4 : a >= 31 ? 2 : 3, sign: 0, gb: 0, clause: 0, res: null };
    }
    const v = P.valueOf(p);
    const wages = [0.85, 0.9, 0.95, 1, 1.1].map(k => U.roundMoney(d * k));
    const signs = [0, U.roundMoney(d * 10), U.roundMoney(d * 26)];
    const gbs = [0, U.roundMoney(d * 0.2), U.roundMoney(d * 0.5)];
    const clauses = [0, U.roundMoney(v * 1.5), U.roundMoney(v * 2.5), U.roundMoney(v * 4)];
    const af = M.agentFee(b);
    const total = (b.fee || 0) + n.sign + af;
    const attacker = P.LINE[p.pos] === 'F' || p.pos === 'AM';
    return `<div class="neg mt">
      <div class="small muted">Oyuncunun talebi: <b class="acc">${U.money(d)}</b>/hafta</div>
      <div class="small muted mt">Haftalık maaş teklifi</div>
      <div class="chips">${wages.map(w => chip(n.wage === w, 'negSet', `data-k="wage" data-v="${w}"`, U.money(w))).join('')}</div>
      <div class="small muted mt">Sözleşme süresi</div>
      <div class="chips">${[1, 2, 3, 4, 5].map(y => chip(n.years === y, 'negSet', `data-k="years" data-v="${y}"`, y + ' yıl')).join('')}</div>
      <div class="small muted mt">İmza parası (tek seferlik)</div>
      <div class="chips">${signs.map(x => chip(n.sign === x, 'negSet', `data-k="sign" data-v="${x}"`, x ? U.money(x) : 'Yok')).join('')}</div>
      ${attacker ? `<div class="small muted mt">Gol primi (gol başına)</div>
      <div class="chips">${gbs.map(x => chip(n.gb === x, 'negSet', `data-k="gb" data-v="${x}"`, x ? U.money(x) : 'Yok')).join('')}</div>` : ''}
      <div class="small muted mt">Serbest kalma maddesi</div>
      <div class="chips">${clauses.map(x => chip(n.clause === x, 'negSet', `data-k="clause" data-v="${x}"`, x ? U.money(x) : 'Yok')).join('')}</div>
      <div class="kv mt small"><span>Menajer ücreti</span><span>${U.money(af)}</span>${b.fee ? `<span>Bonservis</span><span>${U.money(b.fee)}</span>` : ''}<span>Toplam maliyet</span><span class="acc">${U.money(total)}</span></div>
      <div class="small muted mt">İmza parası ve uzun sözleşme oyuncuyu daha düşük maaşa ikna edebilir; serbest kalma maddesi oyuncuların hoşuna gider ama başka kulüplerin onu bu bedelle almasının yolunu açar.</div>
      ${n.res ? `<div class="mt ${n.res.ok ? 'good' : 'warn'}">${esc(n.res.text)}</div>` : ''}
      <div class="btns mt"><button class="btn" data-a="negCancel">Vazgeç</button><button class="btn primary" data-a="negSend">Teklifi sun</button></div></div>`;
  };

  // ---------- Oyuncuyla konuşma ----------
  UI.talkPanel = function (p) {
    const c = h.club();
    const keys = Object.keys(X.TALKS).filter(k => (k !== 'calm' || p.wantsOut) && (k !== 'capt' || c.captain !== p.id) && (k !== 'time' || !p.promise));
    const res = ui.talkRes && ui.talkRes.pid === p.id ? ui.talkRes.text : '';
    return `<div class="panel mt"><h3>Oyuncuyla konuş</h3><div class="body">
      <div class="chips">${keys.map(k => `<button class="chip" data-a="talk" data-id="${p.id}" data-k="${k}">${X.TALKS[k]}</button>`).join('')}</div>
      ${res ? `<div class="mt small">${esc(res)}</div>` : ''}
      <div class="small muted mt">Tepki oyuncunun kişiliğine ve formuna bağlıdır. Aynı oyuncuyla iki haftada bir konuşabilirsiniz.</div></div></div>`;
  };

  // ---------- Karşılaştırma ----------
  function compareModal(a, b) {
    const s = S(), pa = s.players[a], pb = s.players[b];
    const val = (p, k) => { const f = M.fuzz(p, p.a[k], k); return f ? { t: f[0] + '-' + f[1], v: (f[0] + f[1]) / 2 } : { t: String(p.a[k]), v: p.a[k] }; };
    const keys = pa.pos === 'GK' || pb.pos === 'GK' ? P.ATTRS : P.ATTRS.filter(k => k !== 'kal' && k !== 'ref');
    const rows = keys.map(k => {
      const x = val(pa, k), y = val(pb, k);
      return `<tr><td class="${x.v > y.v ? 'good b' : ''}">${x.t}</td><td class="t center">${P.ATTR_TR[k]}</td><td class="${y.v > x.v ? 'good b' : ''}">${y.t}</td></tr>`;
    }).join('');
    const oa = h.ovrTxt(pa), ob = h.ovrTxt(pb);
    const sa = h.seasonStats(pa), sb = h.seasonStats(pb);
    const r = x => x[4] ? (x[3] / x[4]).toFixed(2) : '-';
    h.openModal(`<button class="close" data-a="close">✕</button><h2>Karşılaştırma</h2>
      <table class="tbl mt"><tr><th><span class="tl" data-a="player" data-id="${a}">${esc(pa.n)}</span></th><th></th><th><span class="tl" data-a="player" data-id="${b}">${esc(pb.n)}</span></th></tr>
      <tr><td>${P.POS_TR[pa.pos]} · ${h.age(pa)}</td><td class="t center">Mevki · Yaş</td><td>${P.POS_TR[pb.pos]} · ${h.age(pb)}</td></tr>
      <tr><td class="${oa.v > ob.v ? 'good b' : ''}">${oa.t}</td><td class="t center">Güç</td><td class="${ob.v > oa.v ? 'good b' : ''}">${ob.t}</td></tr>
      <tr><td>${M.known(pa) >= 1 ? U.money(P.valueOf(pa)) : '?'}</td><td class="t center">Değer</td><td>${M.known(pb) >= 1 ? U.money(P.valueOf(pb)) : '?'}</td></tr>
      <tr><td>${sa[0]} / ${sa[1]} / ${r(sa)}</td><td class="t center">Maç / Gol / Not</td><td>${sb[0]} / ${sb[1]} / ${r(sb)}</td></tr>
      ${rows}</table>`);
  }
  function comparePick(id) {
    const s = S(), p = s.players[id], c = h.club(), u = s.user;
    const ids = new Set((u.short || []).map(x => x.id));
    if (c) c.players.forEach(x => ids.add(x));
    ids.delete(id);
    const list = [...ids].map(x => s.players[x]).filter(Boolean).sort((a, b) => (P.LINE[b.pos] === P.LINE[p.pos]) - (P.LINE[a.pos] === P.LINE[p.pos]) || P.ovr(b) - P.ovr(a));
    h.openModal(`<button class="close" data-a="close">✕</button><h2>${esc(p.n)} ile karşılaştır</h2>
      <div class="small muted">İzleme listeniz ve kadronuzdaki oyuncular</div>
      <ul class="list mt">${list.map(q => `<li class="tap" data-a="compareWith" data-id="${id}" data-b="${q.id}">${h.posB(q.pos)}<span class="grow ellipsis">${esc(q.n)} <span class="small muted">${q.club != null ? esc(s.clubs[q.club].n) : 'Serbest'}</span></span>${h.ovrB(q)}</li>`).join('') || '<li class="muted">Önce oyuncuları izleme listesine ekleyin.</li>'}</ul>`);
  }

  // ---------- Maç öncesi: rakip raporu ve basın toplantısı ----------
  UI.preExtras = function (f) {
    const s = S(), u = s.user;
    const key = f.c + ':' + f.id;
    if (!ui.report || ui.report.key !== key) { try { ui.report = { key, r: X.scoutReport(f) }; } catch (e) { console.error(e); ui.report = { key, r: null }; } }
    const r = ui.report.r;
    let html = '';
    if (r) {
      const us = f.h === u.club || f.h === 'N:' + u.nat ? 0 : 1;
      const team = CM.Comp.tObj(us === 0 ? f.h : f.a);
      const bar = (a, b) => { const t = a + b || 1; return `<div class="sbar"><i style="width:${a / t * 100}%;background:var(--accent)"></i><i style="width:${b / t * 100}%;background:var(--bad)"></i></div>`; };
      html += `<div class="panel mt"><h3>Yardımcı antrenör raporu</h3><div class="body small">
        <div>Rakip diziliş: <b>${esc(r.form)}</b> · Tehlikeli oyuncular: ${r.stars.map(p => `<span class="tl" data-a="player" data-id="${p.id}">${esc(p.n)}</span>`).join(', ')}</div>
        <div class="mt">${[['Hücum', 'att'], ['Orta saha', 'mid'], ['Savunma', 'def']].map(([n, k]) => `<div class="stat"><span class="v">${Math.round(r.lines.my[k])}</span><span class="l">${n}</span><span class="v">${Math.round(r.lines.op[k])}</span>${bar(r.lines.my[k], r.lines.op[k])}</div>`).join('')}</div>
        ${r.tips.length ? `<ul class="tips">${r.tips.map(t => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}
        <div class="btns mt">${r.suggestForm && r.suggestForm !== team.tactic.form ? `<button class="btn" data-a="applyForm" data-v="${r.suggestForm}">Diziliş önerisi: ${r.suggestForm}</button>` : ''}
          ${team.tactic.ment !== r.ment ? `<button class="btn" data-a="applyMent" data-v="${r.ment}">Mentalite önerisi: ${CM.E.MENT[r.ment].n}</button>` : ''}</div>
      </div></div>`;
    }
    const clubMatch = f.h === u.club || f.a === u.club;
    if (clubMatch && X.bigMatch(f) && !(u.press && u.press.c === f.c && u.press.id === f.id)) {
      const q = X.pressQuestion(f);
      html += `<div class="panel"><h3>Maç öncesi basın toplantısı</h3><div class="body small"><div><b>"${esc(q.q)}"</b></div>
        <div class="list-btns mt">${q.a.map(([k, t]) => `<button class="btn block" data-a="pressPre" data-v="${k}">${esc(t)}</button>`).join('')}</div>
        <div class="muted mt">İsteğe bağlı. Açıklamanız oyuncuların moralini ve maç sonucuna göre yönetimin güvenini etkiler.</div></div></div>`;
    } else if (u.press && u.press.c === f.c && u.press.id === f.id) html += `<div class="small muted center mt">Basın toplantısı yapıldı.</div>`;
    return html;
  };

  // Maç sonrası basın toplantısı
  UI.postPress = function () {
    const lm = ui.lastMatch;
    if (!lm || lm.done) return '';
    return `<div class="panel"><h3>Maç sonu basın toplantısı</h3><div class="body small"><div><b>"${esc(X.PRESS_POST.q)}"</b></div>
      <div class="list-btns mt">${X.PRESS_POST.a.map(([k, t]) => `<button class="btn block" data-a="pressPost" data-v="${k}">${esc(t)}</button>`).join('')}</div></div></div>`;
  };

  // ---------- Kulüp: yönetim, tesisler, altyapı, rekorlar, kariyer ----------
  UI.boardPanel = function (c) {
    const s = S(), u = s.user;
    const pr = (c.proj || [])[0];
    const rows = [['train', `Antrenman tesisleri: ${h.stars(X.trainF(c))}`, X.trainF(c) >= 5], ['youth', `Altyapı tesisleri: ${h.stars(c.youth)}`, c.youth >= 5], ['stad', `Stadyum: ${(c.cap || 0).toLocaleString('tr-TR')} kişi`, false]];
    return `<div class="panel"><h3>Yönetimden istekler</h3><div class="body small">
      <button class="btn block" data-a="boardReq" data-k="budget">💶 Ek transfer bütçesi iste</button>
      ${pr ? `<div class="mt warn">Devam eden proje: ${esc(X.FAC[pr.k].n)} · bitiş ${U.fmtDay(pr.done)}</div>` : ''}
      ${rows.map(([k, label, max]) => `<div class="row mt"><span class="grow">${label}<div class="muted">${esc(X.FAC[k].d)}</div></span>${max ? '<span class="muted">En üst seviye</span>' : `<button class="btn" data-a="boardReq" data-k="${k}" ${pr ? 'disabled' : ''}>Yatırım iste<div class="small">${U.money(X.facCost(c, k))}</div></button>`}</div>`).join('')}
      ${ui.boardRes ? `<div class="mt">${esc(ui.boardRes)}</div>` : ''}</div></div>`;
  };
  UI.clubExtra = function (tab, c) {
    const s = S();
    if (tab === 'youth') {
      const ys = c.players.map(id => s.players[id]).filter(p => p && h.age(p) <= 19).sort((a, b) => b.pa - a.pa);
      const nats = Object.keys(CM.DB.nations).filter(k => k !== c.cty && k !== 'RUS').sort((a, b) => h.nat(a).n.localeCompare(h.nat(b).n, 'tr'));
      return `<div class="panel"><h3>Altyapı</h3><div class="body small"><div class="kv">
          <span>Altyapı tesisleri</span><span class="stars">${h.stars(c.youth)}</span>
          <span>Yeni oyuncular</span><span>Her yıl 15 Mart'ta</span></div>
          <label class="field"><span>Yurt dışı gözlem ağı (haftalık €5K): her yıl bu ülkeden bir yetenek</span><select class="inp" data-ch="ynet"><option value="">— Yok —</option>${nats.map(k => `<option value="${k}" ${c.ynet === k ? 'selected' : ''}>${esc(h.nat(k).n)}</option>`).join('')}</select></label></div></div>
        <div class="panel"><h3>19 yaş altı oyuncular (${ys.length})</h3><ul class="list">${ys.map(p => `<li class="tap" data-a="player" data-id="${p.id}">${h.posB(p.pos)}<span class="grow ellipsis">${esc(p.n)}<div class="small muted">${h.flag(p.nat)} ${h.age(p)} yaş</div></span><span class="stars">${h.stars((p.pa - 45) / 10)}</span>${h.ovrB(p)}</li>`).join('') || '<li class="muted">Yok</li>'}</ul></div>`;
    }
    if (tab === 'rec') {
      const R = c.rec || {};
      const leg = Object.entries(c.leg || {}).map(([id, e]) => Object.assign({ id: +id }, e));
      const topG = leg.slice().sort((a, b) => b.g - a.g || b.a - a.a).slice(0, 10);
      const topA = leg.slice().sort((a, b) => b.a - a.a).slice(0, 10);
      const line = (k, t) => R[k] ? `<span>${t}</span><span>${k === 'win' || k === 'loss' ? `${R[k][0]}-${R[k][1]} ${esc(R[k][2])} (${R[k][3]}/${String(R[k][3] + 1).slice(2)})` : `${U.money(R[k][0])} · ${esc(R[k][1])} (${R[k][2]})`}</span>` : '';
      return `<div class="panel"><h3>Kulüp rekorları (oyun içi)</h3><div class="body"><div class="kv small">
          ${line('win', 'En farklı galibiyet')}${line('loss', 'En farklı mağlubiyet')}${line('buy', 'En pahalı transfer')}${line('sell', 'En yüksek satış')}
          ${!Object.keys(R).length ? '<span class="muted">Henüz rekor yok.</span><span></span>' : ''}</div></div></div>
        <div class="panel"><h3>Golcüler (sizin döneminiz)</h3><table class="tbl"><tr><th class="t">Oyuncu</th><th>Maç</th><th>Gol</th></tr>${topG.map(e => `<tr><td class="t">${S().players[e.id] ? `<span class="tl" data-a="player" data-id="${e.id}">${esc(e.n)}</span>` : esc(e.n)}</td><td>${e.a}</td><td class="p">${e.g}</td></tr>`).join('') || '<tr><td class="t muted">Henüz maç yok</td><td></td><td></td></tr>'}</table></div>
        <div class="panel"><h3>En çok forma giyenler</h3><table class="tbl"><tr><th class="t">Oyuncu</th><th>Maç</th><th>Gol</th></tr>${topA.map(e => `<tr><td class="t">${esc(e.n)}</td><td class="p">${e.a}</td><td>${e.g}</td></tr>`).join('')}</table></div>`;
    }
    return '';
  };
  UI.careerExtra = function () {
    const s = S(), u = s.user, r = X.urep();
    return `<div class="panel"><h3>Menajer itibarı</h3><div class="body small">
        <div class="row"><b class="grow">${X.repLabel(r)}</b><span class="stars">${h.stars(r / 20)}</span></div>
        <span class="bar wide"><i style="width:${r}%;background:var(--accent)"></i></span>
        <div class="muted mt">İtibarınız kupalar, hedefleri aşmak ve ödüllerle yükselir; görevden alınmak düşürür. Yüksek itibar büyük kulüplerden ve milli takımlardan teklif getirir.</div>
        ${(u.awards || []).length ? `<div class="mt">${u.awards.slice(-10).reverse().map(a => '🏅 ' + esc(a)).join('<br>')}</div>` : ''}</div></div>
      ${(u.seasons || []).length ? `<div class="panel"><h3>Sezon özetleri</h3><ul class="list">${u.seasons.slice().reverse().map((x, i) => `<li class="tap" data-a="summary" data-i="${u.seasons.length - 1 - i}"><span class="grow">${x.s}/${String(x.s + 1).slice(2)} · ${esc(x.club)}</span><span class="small muted">${x.pos ? x.pos + '.' : ''}</span><b class="grade g${x.grade}">${x.grade}</b></li>`).join('')}</ul></div>` : ''}`;
  };

  // ---------- Ödül arşivi ----------
  UI.archHtml = function () {
    const s = S(), arch = (s.arch || []).slice().reverse();
    if (!arch.length) return '<div class="panel"><div class="body muted">İlk sezon tamamlandığında Ballon d\'Or, Altın Ayakkabı, lig ödülleri ve şampiyonlar burada listelenecek. Aylık ödüller Haberler\'de duyurulur.</div></div>';
    const u = s.user, c = h.club();
    const myLg = c && c.lg;
    return arch.map(a => {
      const L = myLg && a.leagues[myLg];
      const pl = x => x ? (s.players[x[0]] ? `<span class="tl" data-a="player" data-id="${x[0]}">${esc(x[1])}</span>` : esc(x[1])) : '-';
      return `<div class="panel"><h3>${a.s}/${String(a.s + 1).slice(2)} sezonu</h3><div class="body small"><div class="kv">
        ${a.bdo ? `<span>Ballon d'Or ${a.s + 1}</span><span>🥇 ${pl(a.bdo[0])}${a.bdo[1] ? ` · 🥈 ${pl(a.bdo[1])}` : ''}${a.bdo[2] ? ` · 🥉 ${pl(a.bdo[2])}` : ''}</span>` : ''}
        ${a.boot ? `<span>Altın Ayakkabı</span><span>${pl(a.boot)} (${a.boot[2]} gol)</span>` : ''}
        ${L ? `<span>${esc(CM.LEAGUES[myLg].n)}</span><span>Sezonun oyuncusu: ${pl(L.poty)} · Gol kralı: ${pl(L.top)}${L.top ? ' (' + L.top[2] + ')' : ''} · Genç: ${pl(L.young)}</span>
        <span>Sezonun 11'i</span><span>${L.xi.map(pl).join(', ')}</span>` : ''}
        </div>
        <div class="mt"><b>Şampiyonlar</b><div class="muted">${Object.values(a.champs || {}).map(x => `${esc(x[0])}: <span class="acc">${esc(x[1])}</span>`).join(' · ')}</div></div></div></div>`;
    }).join('');
  };

  // ---------- Sezon özeti ----------
  function summaryModal(x) {
    if (!x) return;
    const pl = e => e ? (S().players[e[0]] ? `<span class="tl" data-a="player" data-id="${e[0]}">${esc(e[1])}</span>` : esc(e[1])) : '-';
    const gradeTxt = { A: 'Mükemmel', B: 'Başarılı', C: 'Yeterli', D: 'Hayal kırıklığı', F: 'Başarısız', '-': '-' };
    h.openModal(`<button class="close" data-a="close">✕</button>
      <div class="small muted center">${x.s}/${String(x.s + 1).slice(2)} sezon özeti</div>
      <h2 class="center">${esc(x.club)}</h2>
      <div class="center mt"><b class="grade big g${x.grade}">${x.grade}</b><div class="small muted">Yönetimin karnesi: ${gradeTxt[x.grade]}</div></div>
      <div class="panel mt"><div class="body"><div class="kv">
        <span>Lig</span><span>${esc(x.lg)}${x.pos ? ' · ' + x.pos + '. sıra' : ''}</span>
        <span>Hedef</span><span>${esc(x.exp)}</span>
        <span>Kupalar</span><span>${x.tro.length ? x.tro.map(t => '🏆 ' + esc(t)).join('<br>') : '-'}</span>
        <span>Gol kralı</span><span>${pl(x.top)}${x.top ? ` (${x.top[2]} gol)` : ''}</span>
        <span>En iyi oyuncu</span><span>${pl(x.best)}${x.best ? ` (ort. ${x.best[2]})` : ''}</span>
        <span>En iyi transfer</span><span>${pl(x.buy)}${x.buy ? ` (ort. ${x.buy[2]})` : ''}</span>
        <span>Gelir / gider</span><span><span class="good">${U.money(x.inc)}</span> / <span class="bad">${U.money(x.out)}</span></span>
        <span>Menajer itibarı</span><span>${X.repLabel(x.rep)} (${Math.round(x.rep)})</span></div></div></div>
      <button class="btn primary block" data-a="close">Yeni sezona geç</button>`);
  }
  UI.checkSummary = function () {
    const u = S() && S().user;
    if (u && u.showSummary) { const x = u.summary; u.showSummary = null; summaryModal(x); return true; }
    return false;
  };

  // ---------- Eylemler ----------
  function refreshSheet() { const pid = ui.neg ? ui.neg.pid : ui.bid && ui.bid.pid; if (pid) UI.playerSheet(pid); }
  Object.assign(A, {
    negSet(d) { ui.neg[d.k] = +d.v; ui.neg.res = null; refreshSheet(); },
    negSend() {
      const n = ui.neg, pid = n.pid, kind = n.kind;
      const r = M.negotiate({ wage: n.wage, years: n.years, sign: n.sign, gb: n.gb, clause: n.clause });
      if (r.done && r.ok) { h.toast(r.text); ui.neg = null; ui.bid = null; h.closeModal(); UI.render(); CM.Save.save().catch(() => {}); if (kind === 'renew') UI.playerSheet(pid); return; }
      if (r.done) { h.toast(r.text); ui.neg = null; if (ui.bid) ui.bid.res = null; UI.playerSheet(pid); return; }
      n.res = r; if (r.counter) n.wage = Math.max(n.wage, Math.min(r.counter, S().pending ? S().pending.wage * 1.15 : r.counter));
      UI.playerSheet(pid);
    },
    negCancel() { const pid = ui.neg && ui.neg.pid; S().pending = null; ui.neg = null; if (ui.bid) ui.bid.res = null; if (pid) UI.playerSheet(pid); },
    renewStart(d) { const r = M.renewStart(+d.id); if (!r.ok) h.toast(r.text); ui.neg = null; UI.playerSheet(+d.id); },
    talk(d) { const r = X.talk(+d.id, d.k); ui.talkRes = { pid: +d.id, text: r.text }; if (!r.ok) h.toast(r.text); UI.playerSheet(+d.id); UI.render(); },
    shortToggle(d) { const on = X.shortToggle(+d.id); h.toast(on ? 'İzleme listesine eklendi.' : 'İzleme listesinden çıkarıldı.'); UI.playerSheet(+d.id); },
    compare(d) { comparePick(+d.id); },
    compareWith(d) { compareModal(+d.id, +d.b); },
    takeNat(d) { if (X.takeNat(d.v)) { h.toast('Milli takım görevini kabul ettiniz.'); UI.render(); CM.Save.save().catch(() => {}); } },
    pressPre(d) { const f = ui.pre; const t = X.pressPre(f, d.v); h.toast(t); UI.preMatch(f); },
    applyForm(d) {
      const f = ui.pre, s = S(), u = s.user, isN = f.h === 'N:' + u.nat || f.a === 'N:' + u.nat;
      const t = UI.teamOf(isN ? 'nat' : 'club'); t.tactic.form = d.v;
      const lu = CM.Sim.autoLineup(t, UI.poolOf(isN ? 'nat' : 'club'), d.v, s.comps[f.c].suspKey, f.d, isN); t.tactic.xi = lu.xi; t.tactic.subs = lu.subs;
      h.toast(`Diziliş ${d.v} olarak değiştirildi ve ilk 11 yeniden seçildi.`); ui.report = null; UI.preMatch(f);
    },
    applyMent(d) { const f = ui.pre, u = S().user, isN = f.h === 'N:' + u.nat || f.a === 'N:' + u.nat; UI.teamOf(isN ? 'nat' : 'club').tactic.ment = d.v; h.toast('Mentalite güncellendi.'); UI.preMatch(f); },
    pressPost(d) { const lm = ui.lastMatch; if (!lm || lm.done) return; lm.done = true; const t = X.pressPost(lm.f, d.v, lm.ids); h.toast(t); const el = document.querySelector('#modal .sheet'); if (el) { const pp = el.querySelector('[data-pp]'); if (pp) pp.innerHTML = `<div class="small muted center">${esc(t)}</div>`; } },
    boardReq(d) { const r = X.boardRequest(d.k); ui.boardRes = r.text; h.toast(r.text); UI.render(); CM.Save.save().catch(() => {}); },
    summary(d) { summaryModal((S().user.seasons || [])[+d.i]); }
  });
  UI.CH.ynet = v => { X.setYouthNet(v); h.toast(v ? `Gözlem ağı kuruldu: ${h.nat(v).n}` : 'Gözlem ağı kapatıldı.'); };
})(typeof window !== 'undefined' ? window : globalThis);
