/* চর্যাভূমি — Service Worker: দুর্বল ইন্টারনেটেও দ্রুত লোড ও অফলাইন পাঠ।
   কৌশল: HTML = network-first (তাজা তথ্য), বাকি same-origin asset = cache-first।
   সংস্করণ বদলালে পুরনো ক্যাশে মুছে যায়। */
var VERSION = 'charyabhumi-v20261031c-p0';
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
  'buddha-vamsa.html', 'buddha-vamsa.js', 'buddha-vamsa.css',
  'patrons.html', 'patrons.js', 'kings.js', 'history.css',
  'data/heritage-kings.json', 'data/heritage-contributions.json',
  'data/buddha-vamsa/meta.json', 'data/buddha-vamsa/dynasties.json', 'data/buddha-vamsa/kings.json',
  'data/buddha-vamsa/lineage.json', 'data/buddha-vamsa/jatakas.json', 'data/buddha-vamsa/quotes.json',
  'data/buddha-vamsa/inscriptions.json', 'data/buddha-vamsa/places.json', 'data/buddha-vamsa/sculptures.json',
  'data/buddha-vamsa/culture.json', 'data/buddha-vamsa/archives.json', 'data/buddha-vamsa/media.json',
  'data/buddha-vamsa/images.json', 'data/buddha-vamsa/riddhi.json',
  'data/buddha-vamsa/communities.json', 'data/counts.json',
  'tracker-site.css',
  /* সংরক্ষণাগার ও জমা-প্রবাহ: ব্রাউজ বান্ডল + খসড়ার JS + JSZip (অফলাইনেও ফর্ম খোলে) */
  'historical-archive.html', 'historical-archive.js', 'historical-archive.css',
  'archive.js', 'archive.css', 'assets/vendor/jszip/jszip.min.js',
  'data/historical-archive.json',
  'data/heritage-culture.json', 'data/heritage-library.json',
  /* অডিট-২০২৬ ধাপ: ডিরেক্টরি ও পৃষ্ঠপোষক-ডেটা প্রথমবার খোলাতেই ক্যাশে ঢোকে —
     পরে নেটওয়ার্ক না থাকলেও তালিকা ও প্রোফাইল খোলা যায় (ট্র্যাকারের ৩.৫MB ফাইল বাদ, সেটি চাহিদামতো যায়) */
  'data/dashboard-core.json', 'data/dashboard-directory.json',
  'assets/culture-2026/svgs/kolpotoru-steps.svg', 'assets/culture-2026/svgs/kolpojahaj-steps.svg',
  'assets/culture-2026/svgs/fanus-steps.svg', 'assets/culture-2026/svgs/kathin-24h.svg',
  'assets/vendor/leaflet/leaflet.js', 'assets/vendor/leaflet/leaflet.css',
  'assets/vendor/leaflet/leaflet.markercluster.js', 'assets/vendor/leaflet/MarkerCluster.css',
  'assets/vendor/leaflet/MarkerCluster.Default.css'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(VERSION).then(function (cache) {
      return cache.addAll(CORE.map(function (u) { return new Request(u, { cache: 'reload' }); })).catch(function () { /* আংশিক হলেও চলবে */ });
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== VERSION; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (event) {
  var req = event.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return; /* বাইরের সাইট (Google Maps ইত্যাদি) সরাসরি */
  var isDoc = req.mode === 'navigate' || url.pathname.endsWith('.html');
  if (isDoc) {
    event.respondWith(
      fetch(req).then(function (res) {
        var copy = res.clone();
        caches.open(VERSION).then(function (c) { c.put(req, copy); });
        return res;
      }).catch(function () { return caches.match(req).then(function (m) { return m || caches.match('index.html'); }); })
    );
    return;
  }
  event.respondWith(
    caches.match(req).then(function (hit) {
      var network = fetch(req).then(function (res) {
        if (res && res.ok) {
          var copy = res.clone();
          caches.open(VERSION).then(function (c) { c.put(req, copy); });
        }
        return res;
      }).catch(function () { return hit; });
      return hit || network;
    })
  );
});
