/* চর্যাভূমি — অফলাইন প্যাক (PWA আপগ্রেড) */
(function () {
  'use strict';
  if (!window.MX) return;
  MX.trackLocal('offline.html');

  var sites = [];
  var SAVE_PAGES = [
    'index.html', 'atlas.html', 'offline.html', 'orientation.html', 'restoration.html',
    'corridors.html', 'explore3d.html', 'travel-planner.html', 'knowledge.html',
    'calendar.html', 'children.html', 'support.html',
    'data/atlas-sites.json', 'data/orientation-heritage.json', 'data/festivals-auto.json',
    'data/travel-plus.json', 'data/heritage-knowledge.json', 'data/knowledge-plus.json', 'data/site-structure.json'
  ];

  /* ---------- অবস্থা ---------- */
  function renderNetChip() {
    MX.$('netChip').textContent = navigator.onLine ? '🌐 অনলাইন: এখন সেভ করে রাখাই সেরা সময়' : '📴 অফলাইন: সেভ করা অংশ চলছে';
  }
  window.addEventListener('online', renderNetChip);
  window.addEventListener('offline', renderNetChip);
  renderNetChip();
  MX.$('swChip').textContent = 'serviceWorker' in navigator
    ? '⚙️ Service Worker সমর্থিত — HTTPS-এ সক্রিয় হয়'
    : '⚙️ এই ব্রাউজারে Service Worker নেই — পকেট গাইডই ভরসা';

  function fmtMB(b) { return MX.bn((b / 1048576).toFixed(2)) + ' MB'; }
  function renderCacheStatus() {
    var el = MX.$('cacheStatus');
    if (!('caches' in window)) { el.innerHTML = '<h3>🗄️ ক্যাশের অবস্থা</h3><p class="mx-meta">এই ব্রাউজারে Cache API পাওয়া যায়নি।</p>'; return; }
    caches.keys().then(function (keys) {
      var mine = keys.filter(function (k) { return k.indexOf('charyabhumi') >= 0; });
      if (!mine.length) { el.innerHTML = '<h3>🗄️ ক্যাশের অবস্থা</h3><p>এখনো কোনো ক্যাশে নেই। অনলাইনে একবার সেভ করুন।</p>'; return; }
      var counts = [];
      return mine.reduce(function (p, k) {
        return p.then(function () { return caches.open(k); }).then(function (c) { return c.keys(); })
          .then(function (reqs) { counts.push(k + ': ' + MX.bn(String(reqs.length)) + 'টি ফাইল'); });
      }, Promise.resolve()).then(function () {
        var est = (navigator.storage && navigator.storage.estimate) ? navigator.storage.estimate() : Promise.resolve(null);
        return est.then(function (e) {
          el.innerHTML = '<h3>🗄️ ক্যাশের অবস্থা</h3>' +
            counts.map(function (c) { return '<p>✅ ' + MX.esc(c) + '</p>'; }).join('') +
            (e && e.usage != null ? '<p class="mx-meta">ব্রাউজারে জমা জায়গা: ~' + fmtMB(e.usage) + '</p>' : '') +
            '<p class="mx-meta">সবশেষ সেভ: ' + (MX.getLocal('cb.offline.savedAt', '') || 'এই ব্রাউজারে রেকর্ড নেই') + '</p>';
        });
      });
    }).catch(function () { el.innerHTML = '<h3>🗄️ ক্যাশের অবস্থা</h3><p class="mx-meta">পড়া যায়নি।</p>'; });
  }
  renderCacheStatus();

  /* ---------- অফলাইন সেভ ---------- */
  MX.$('offlineSaveBtn').addEventListener('click', function () {
    var out = MX.$('offlineProgress');
    if (!('caches' in window)) { out.textContent = 'দুঃখিত, এই ব্রাউজারে ক্যাশে সেভ সমর্থিত নয়।'; return; }
    if (!navigator.onLine) { out.textContent = 'আপনি এখন অফলাইন — অনলাইনে ফিরে আবার চাপুন।'; return; }
    var urls = SAVE_PAGES.slice();
    sites.forEach(function (s) { if (s.photo && s.photo.file) urls.push(s.photo.file); });
    urls = urls.filter(function (u, i) { return urls.indexOf(u) === i; });
    out.textContent = 'সেভ চলছে… ০/' + MX.bn(String(urls.length));
    caches.keys().then(function (keys) {
      var name = keys.filter(function (k) { return k.indexOf('charyabhumi') >= 0; })[0] || 'charyabhumi-offline-pack';
      return caches.open(name);
    }).then(function (cache) {
      var done = 0, failed = 0;
      return urls.reduce(function (p, u) {
        return p.then(function () {
          return cache.add(new Request(u, { cache: 'reload' })).catch(function () { failed++; }).then(function () {
            done++; out.textContent = 'সেভ চলছে… ' + MX.bn(String(done)) + '/' + MX.bn(String(urls.length)) + (failed ? ' (ব্যর্থ ' + MX.bn(String(failed)) + ')' : '');
          });
        });
      }, Promise.resolve()).then(function () {
        MX.setLocal('cb.offline.savedAt', new Date().toLocaleString('bn-BD'));
        out.innerHTML = '✅ সম্পন্ন: ' + MX.bn(String(done - failed)) + 'টি ফাইল জমেছে' + (failed ? ', ' + MX.bn(String(failed)) + 'টি পাওয়া যায়নি' : '') + '। এখন এয়ারপ্লেন মোড করেও সাইট খুলে দেখুন!';
        MX.toast('অফলাইন প্যাক তৈরি ✓');
        renderCacheStatus();
      });
    }).catch(function () { out.textContent = 'সেভে সমস্যা হয়েছে — সংযোগ দেখে আবার চেষ্টা করুন।'; });
  });

  /* ইনস্টল */
  function checkInstall() {
    var b = MX.$('installBtn');
    if (window.__cbInstallPrompt) { b.hidden = false; }
  }
  document.addEventListener('cb-install-available', checkInstall);
  checkInstall();
  MX.$('installBtn').addEventListener('click', function () {
    var p = window.__cbInstallPrompt; if (!p) return;
    p.prompt(); window.__cbInstallPrompt = null; MX.$('installBtn').hidden = true;
  });

  /* ---------- অবস্থান-ছক ---------- */
  var myPos = null;
  function plotSvg() {
    var W = 880, H = 620, LON0 = 87.8, LON1 = 92.6, LAT0 = 21.2, LAT1 = 26.6;
    var X = function (lon) { return (lon - LON0) / (LON1 - LON0) * W; };
    var Y = function (lat) { return H - (lat - LAT0) / (LAT1 - LAT0) * H; };
    var grat = '';
    for (var lon = 88; lon <= 92; lon++) grat += '<line x1="' + X(lon) + '" y1="0" x2="' + X(lon) + '" y2="' + H + '" stroke="#ddd3ba"/><text x="' + X(lon) + '" y="20" text-anchor="middle" font-size="13" fill="#8a7a66">' + MX.bn(String(lon)) + '°পূ</text>';
    for (var lat = 22; lat <= 26; lat++) grat += '<line x1="0" y1="' + Y(lat) + '" x2="' + W + '" y2="' + Y(lat) + '" stroke="#ddd3ba"/><text x="10" y="' + (Y(lat) - 8) + '" font-size="13" fill="#8a7a66">' + MX.bn(String(lat)) + '°উ</text>';
    var sea = '<path d="M0 ' + Y(22.2) + ' C 300 ' + Y(21.8) + ', 600 ' + Y(22.0) + ', 880 ' + Y(21.9) + ' L880 620 L0 620 Z" fill="#dbeef7"/>' +
      '<text x="430" y="' + Y(21.55) + '" text-anchor="middle" font-size="17" font-weight="700" fill="#2471a3">বঙ্গোপসাগর</text>';
    // ছড়ানো: ময়নামতির কাছাকাছি নোডগুলোর গায়ে নম্বর, বিচ্ছিন্নগুলোর পাশে নাম
    var labelled = { somapura: 1, sitakot: 1, halud_vihara: 0 };
    var nodes = sites.map(function (s, i) {
      var x = X(s.coordinates.lon), y = Y(s.coordinates.lat);
      var name = (s.name && s.name.bn || s.id).split('—')[0].split('/')[0].trim();
      var big = s.id === 'somapura' || s.id === 'sitakot' || s.id === 'jagaddala' || s.id === 'bhasu-vihara';
      var txt = big ? '<text x="' + (x + 18) + '" y="' + (y + 5) + '" font-size="15" font-weight="700" fill="#2a1f19">' + MX.esc(name) + '</text>' : '';
      return '<g><circle cx="' + x + '" cy="' + y + '" r="13" fill="#8f3d08" stroke="#fff" stroke-width="2.5"/>' +
        '<text x="' + x + '" y="' + (y + 5) + '" text-anchor="middle" font-size="13" font-weight="800" fill="#fff">' + (i + 1) + '</text>' + txt + '</g>';
    }).join('');
    var mine = '';
    if (myPos && myPos.lon >= LON0 && myPos.lon <= LON1 && myPos.lat >= LAT0 && myPos.lat <= LAT1) {
      mine = '<circle cx="' + X(myPos.lon) + '" cy="' + Y(myPos.lat) + '" r="11" fill="#2471a3" stroke="#fff" stroke-width="3"/>' +
        '<text x="' + (X(myPos.lon) + 16) + '" y="' + (Y(myPos.lat) + 5) + '" font-size="15" font-weight="800" fill="#2471a3">আপনি এখানে</text>';
    }
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" role="img" aria-label="১২টি স্থানের অবস্থান-ছক">' +
      '<rect width="' + W + '" height="' + H + '" fill="#fdf8ec"/>' + sea + grat +
      '<text x="' + X(91.35) + '" y="' + (Y(23.62)) + '" font-size="14" font-weight="700" fill="#5d4a36">ময়নামতি বলয় (নম্বর পাশের তালিকায়) →</text>' +
      nodes + mine + '</svg>';
  }
  function renderPlot() {
    MX.$('plotSvg').innerHTML = plotSvg();
    MX.$('plotList').innerHTML = sites.map(function (s) {
      var d = myPos ? ' · ~' + MX.bn(MX.Haversine(myPos.lat, myPos.lon, s.coordinates.lat, s.coordinates.lon).toFixed(0)) + ' কিমি' : '';
      return '<li><b>' + MX.esc((s.name && s.name.bn) || s.id) + '</b> (' + MX.esc((s.district && s.district.bn) || '') + ')' + d + '</li>';
    }).join('');
  }
  MX.$('myLocBtn').addEventListener('click', function () {
    var out = MX.$('myLocOut');
    if (!navigator.geolocation) { out.textContent = 'এই ডিভাইসে GPS পাওয়া যাচ্ছে না।'; return; }
    out.textContent = 'অবস্থান নেওয়া হচ্ছে…';
    navigator.geolocation.getCurrentPosition(function (pos) {
      myPos = { lat: pos.coords.latitude, lon: pos.coords.longitude };
      out.textContent = 'আপনার অবস্থান: ' + MX.bn(myPos.lat.toFixed(3)) + ', ' + MX.bn(myPos.lon.toFixed(3)) + ' (তালিকায় দূরত্ব যোগ হয়েছে)';
      renderPlot();
    }, function () { out.textContent = 'অবস্থান পাওয়া যায়নি — অনুমতি বন্ধ থাকতে পারে।'; }, { timeout: 12000 });
  });

  /* ---------- ডেটা-প্যাক ও পকেট গাইড ---------- */
  MX.$('packBtn').addEventListener('click', function () {
    var pack = {
      generated_at: new Date().toISOString(), source: 'Charyabhumi offline pack', note: 'স্থানাঙ্ক প্রকাশিত সাইট-কেন্দ্রের; জরিপকৃত প্রবেশদ্বার নাও হতে পারে।',
      sites: sites.map(function (s) {
        return {
          id: s.id, name_bn: (s.name && s.name.bn) || s.id, name_en: (s.name && s.name.en) || '',
          district_bn: (s.district && s.district.bn) || '', upazila_bn: (s.upazila && s.upazila.bn) || '',
          lat: s.coordinates.lat, lon: s.coordinates.lon, period: (s.period && (s.period.bn || s.period)) || '',
          summary_bn: (s.summary && s.summary.bn) || ''
        };
      })
    };
    MX.download('charyabhumi-offline-pack.json', JSON.stringify(pack, null, 2), 'application/json');
    MX.$('packInfo').textContent = MX.bn(String(pack.sites.length)) + 'টি স্থানের প্যাক ডাউনলোড হয়েছে (' + new Date().toLocaleDateString('bn-BD') + ')।';
  });

  MX.$('pocketBtn').addEventListener('click', function () {
    var rows = sites.map(function (s, i) {
      return '<tr><td>' + (i + 1) + '</td><td><b>' + MX.esc((s.name && s.name.bn) || s.id) + '</b></td><td>' + MX.esc((s.district && s.district.bn) || '') + '</td>' +
        '<td>' + s.coordinates.lat.toFixed(4) + ', ' + s.coordinates.lon.toFixed(4) + '</td><td>' + MX.esc(((s.summary && s.summary.bn) || '').slice(0, 110)) + '…</td></tr>';
    }).join('');
    var w = window.open('', '_blank');
    if (!w) { MX.toast('পপ-আপ বন্ধ থাকায় গাইড খোলা যাচ্ছে না'); return; }
    w.document.write('<!doctype html><html lang="bn"><head><meta charset="utf-8"><title>চর্যাভূমি পকেট গাইড</title>' +
      '<style>body{font-family:"Noto Sans Bengali",sans-serif;margin:24px;color:#222}table{border-collapse:collapse;width:100%;font-size:13px}th,td{border:1px solid #999;padding:6px 8px;vertical-align:top}th{background:#123f39;color:#fff}h1{color:#8f3d08}.n{color:#666;font-size:12px}</style></head><body>' +
      '<h1>চর্যাভূমি — পকেট গাইড (অফলাইন ব্যাকআপ)</h1>' +
      '<p class="n">স্থানাঙ্ক = প্রকাশিত সাইট-কেন্দ্র (প্রবেশদ্বার আলাদা হতে পারে)। জরুরি: ৯৯৯। ছাপানোর তারিখ: ' + new Date().toLocaleDateString('bn-BD') + '</p>' +
      '<table><thead><tr><th>#</th><th>স্থান</th><th>জেলা</th><th>স্থানাঙ্ক (GPS)</th><th>এক-লাইনে</th></tr></thead><tbody>' + rows + '</tbody></table>' +
      '<p class="n">উৎস: Mithun-Mutsuddi.github.io/Bangladesh-Buddhist-Heritage-Map · এই ছকে রঙ করা/কাটা যায় না এমন কোনো দাবি নেই; মাঠে সাইনবোর্ড ও স্থানীয় নির্দেশনাই চূড়ান্ত।</p>' +
      '<script>window.addEventListener("load",function(){setTimeout(function(){window.print()},350)})<\/script></body></html>');
    w.document.close();
  });

  /* ---------- ডেটা লোড ---------- */
  Promise.all([
    MX.fetchJson('data/atlas-sites.json?v=20261024g'),
    MX.fetchJson('data/orientation-heritage.json?v=20261024g').catch(function () { return { offline: { tips: [] } }; })
  ]).then(function (res) {
    sites = res[0].sites || [];
    renderPlot();
    MX.$('offTips').innerHTML = (res[1].offline.tips || []).map(function (t) {
      return '<div class="mx-card"><h3>📌 ' + MX.esc(t.title_bn) + '</h3><p>' + MX.esc(t.detail_bn) + '</p></div>';
    }).join('');
  }).catch(function () {
    MX.$('plotSvg').innerHTML = '<p class="mx-meta">স্থানের ডেটা লোড হয়নি — একবার অনলাইনে খুলে সেভ করুন।</p>';
  });
})();
