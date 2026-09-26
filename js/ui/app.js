/* Arayüz: olay yönetimi ve açılış */
(function (G) {
  'use strict';
  const CM = G.CM, UI = CM.UI;
  const $app = document.getElementById('app'), $modal = document.getElementById('modal');

  function onClick(e) {
    const el = e.target.closest('[data-a]');
    if (!el || el.disabled) return;
    const fn = UI.A[el.dataset.a];
    if (!fn) { console.warn('Eylem yok:', el.dataset.a); return; }
    e.preventDefault();
    try { fn(Object.assign({}, el.dataset), el, e); } catch (err) { console.error(err); UI.h.toast('Hata: ' + err.message); }
  }
  function onChange(e) {
    const el = e.target.closest('[data-ch]');
    if (!el) return;
    const fn = UI.CH[el.dataset.ch];
    if (fn) try { fn(el.value, el); } catch (err) { console.error(err); UI.h.toast('Hata: ' + err.message); }
  }
  function onInput(e) {
    const el = e.target.closest('[data-in]');
    if (!el) return;
    const fn = UI.IN && UI.IN[el.dataset.in];
    if (fn) fn(el.value, el);
  }
  [$app, $modal].forEach(root => {
    root.addEventListener('click', onClick);
    root.addEventListener('change', onChange);
    root.addEventListener('input', onInput);
  });

  // Kayıtsız çıkışta uyar
  window.addEventListener('beforeunload', () => { if (CM.S && !UI.ui.live) CM.Save.save(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden && CM.S && !UI.ui.live) CM.Save.save().catch(() => {}); });

  function boot() {
    try { UI.ui.start.name = localStorage.getItem('cm_mgr') || ''; } catch (e) { /* yok */ }
    CM.Save.meta().then(UI.renderStart).catch(() => UI.renderStart(null));
  }
  boot();
})(typeof window !== 'undefined' ? window : globalThis);
