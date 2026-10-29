/* চর্যাভূমি — Service Worker: দুর্বল ইন্টারনেটেও দ্রুত লোড ও অফলাইন পাঠ।
   কৌশল: HTML = network-first (তাজা তথ্য), বাকি same-origin asset = cache-first।
   সংস্করণ বদলালে পুরনো ক্যাশে মুছে যায়। */
var VERSION = 'charyabhumi-v20261029-cleanup1';
var CORE = [
  'index.html', 'charyabhumi.css', 'mega.css', 'brand.js', 'language.js',
  'config.js', 'mega-utils.js', 'manifest.webmanifest', 'pwa.js', 'festival-auto.js',
  'explore3d.html', 'explore3d.js', 'travel-planner.html', 'travel-planner.js',
  'knowledge.html', 'knowledge.js', 'research.html', 'research.js',
  'community.html', 'community.js', 'support.html', 'support.js',
  'heritage-lab.html', 'heritage-lab.js',
  'orientation.html', 'orientation.js', 'restoration.html', 'restoration.js',
  'corridors.html', 'corridors.js', 'offline.html', 'offline.js',
  'data/site-structure.json', 'data/site-info.json', 'data/festivals-auto.json',
  'data/heritage-knowledge.json', 'data/knowledge-plus.json', 'data/travel-plus.json', 'data/research-plus.json',
  'data/support-config.json', 'data/games-plus.json', 'data/orientation-heritage.json', 'data/atlas-sites.json',
  'culture.html', 'culture.js', 'culture-2026.css', 'culture-fest-anim.js',
  'data/heritage-culture.json', 'data/heritage-library.json',
  'assets/culture-2026/svgs/kolpotoru-steps.svg', 'assets/culture-2026/svgs/kolpojahaj-steps.svg',
  'assets/culture-2026/svgs/fanus-steps.svg', 'assets/culture-2026/svgs/kathin-24h.svg',
  'assets/vendor/leaflet/leaflet.js', 'assets/vendor/leaflet/leaflet.css',
  'assets/vendor/leaflet/leaflet.markercluster.js', 'assets/vendor/leaflet/MarkerCluster.css',
  'assets/vendor/leaflet/MarkerCluster.Default.css'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(VERSION).then(function (cache) {
      return Promise.all(CORE.map(function (u) {
        return cache.add(new Request(u, { cache: 'reload' })).catch(function () { /* অন্য ফাইলগুলো সংরক্ষিত থাকবে */ });
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k.indexOf('charyabhumi-') === 0 && k !== VERSION; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (event) {
  var req = event.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  // API responses can be personalized or change frequently: never cache them.
  var scopePath = new URL(self.registration.scope).pathname;
  if (url.pathname.indexOf(scopePath + 'api/') === 0) return;
  var isDoc = req.mode === 'navigate' || url.pathname.endsWith('.html');
  if (isDoc) {
    event.respondWith(fetch(req).then(function (res) {
      if (res.ok) {
        var copy = res.clone();
        event.waitUntil(caches.open(VERSION).then(function (c) { return c.put(req, copy); }).catch(function () {}));
      }
      return res;
    }).catch(function () {
      return caches.open(VERSION).then(function (c) {
        return c.match(req).then(function (m) { return m || c.match(new URL('index.html', self.registration.scope).href); });
      }).then(function (m) { return m || Response.error(); });
    }));
    return;
  }
  event.respondWith(caches.open(VERSION).then(function (c) {
    return c.match(req).then(function (hit) {
      if (hit) return hit;
      return fetch(req).then(function (res) {
        if (res.ok) {
          var copy = res.clone();
          event.waitUntil(c.put(req, copy).catch(function () {}));
        }
        return res;
      });
    });
  }));
});
