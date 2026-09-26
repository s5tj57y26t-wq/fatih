/* Çevrimdışı çalışma için basit önbellek */
const CACHE = 'menajer-0102-v2';
const FILES = ['./', './index.html', './css/style.css', './js/core/core.js', './js/core/save.js', './js/db/nations.js', './js/db/names.js', './js/db/leagues.js', './js/db/clubs.js', './js/db/extra.js', './js/db/players/eng.js', './js/db/players/esp.js', './js/db/players/extra.js', './js/db/players/fra.js', './js/db/players/ger.js', './js/db/players/ita.js', './js/db/players/ksa.js', './js/db/players/ned.js', './js/db/players/other.js', './js/db/players/por.js', './js/db/players/tur.js', './js/model/player.js', './js/model/engine.js', './js/model/comp.js', './js/model/calendar.js', './js/model/sim.js', './js/model/world.js', './js/model/game.js', './js/model/uefa.js', './js/model/intl.js', './js/model/market.js', './js/ui/base.js', './js/ui/world.js', './js/ui/office.js', './js/ui/match.js', './js/ui/app.js',
  './manifest.json', './icons/icon.svg', './icons/icon-192.png', './icons/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Önce ağ, olmazsa önbellek: güncellemeler hemen gelir, çevrimdışı da çalışır
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(r => {
      const copy = r.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy));
      return r;
    }).catch(() => caches.match(e.request))
  );
});
