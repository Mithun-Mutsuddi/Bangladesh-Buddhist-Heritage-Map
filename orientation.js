/* চর্যাভূমি — প্রত্ন-জ্যোতির্বিজ্ঞান ও মণ্ডল জ্যামিতি */
(function () {
  'use strict';
  if (!window.MX) return;
  MX.trackLocal('orientation.html');

  var EVID = {
    documented: '<span class="mx-badge green">প্রকাশিত প্রমাণ</span>',
    interpretation: '<span class="mx-badge gold">গবেষকদের ব্যাখ্যা</span>',
    unknown: '<span class="mx-badge red">এখনো অজানা</span>'
  };

  /* ---------- সূর্যোদয় অজিমুখ ---------- */
  function deg(r) { return r * 180 / Math.PI; }
  function rad(d) { return d * Math.PI / 180; }
  // Cooper-এর আনুমানিক সূত্রে সৌর ক্রান্তি (declination) — সাধারণ শিক্ষামূলক হিসাবে যথেষ্ট
  function declination(date) {
    var start = Date.UTC(date.getUTCFullYear(), 0, 1);
    var n = Math.floor((date.getTime() - start) / 86400000) + 1;
    return 23.45 * Math.sin(rad(360 * (284 + n) / 365));
  }
  function sunriseAzimuth(lat, dec) {
    // সমতল দিগন্তে (উচ্চতা ০°) সূর্যোদয়ের অজিমুখ, উত্তর থেকে পূর্ব দিকে
    var c = Math.sin(rad(dec)) / Math.cos(rad(lat));
    c = Math.max(-1, Math.min(1, c));
    return deg(Math.acos(c));
  }
  function dirName(az) {
    var names = ['উত্তর', 'উত্তর-পূর্ব', 'পূর্ব', 'দক্ষিণ-পূর্ব', 'দক্ষিণ', 'দক্ষিণ-পশ্চিম', 'পশ্চিম', 'উত্তর-পশ্চিম'];
    return names[Math.round(((az % 360) / 45)) % 8];
  }
  function compassSvg(riseAz, setAz) {
    var cx = 170, cy = 170, R = 130;
    function pt(az, r) { var a = rad(az - 90); return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; }
    var dirs = [[0, 'উ'], [45, 'উপূ'], [90, 'পূ'], [135, 'দপূ'], [180, 'দ'], [225, 'দপ'], [270, 'প'], [315, 'উপ']];
    var ticks = dirs.map(function (d) {
      var p = pt(d[0], R + 20), q = pt(d[0], R);
      return '<line x1="' + q[0] + '" y1="' + q[1] + '" x2="' + pt(d[0], R - 12)[0] + '" y2="' + pt(d[0], R - 12)[1] + '" stroke="#8a7a66"/>' +
        '<text x="' + p[0] + '" y="' + (p[1] + 5) + '" text-anchor="middle" font-size="14" font-weight="700" fill="#123f39">' + d[1] + '</text>';
    }).join('');
    var rp = pt(riseAz, R - 6), sp = pt(setAz, R - 6);
    return '<svg viewBox="0 0 340 340" width="340" role="img" aria-label="সূর্যোদয় ও সূর্যাস্তের দিক">' +
      '<circle cx="170" cy="170" r="130" fill="#fdf8ec" stroke="#c9b68a" stroke-width="2"/>' +
      ticks +
      '<line x1="170" y1="170" x2="' + rp[0] + '" y2="' + rp[1] + '" stroke="#d35400" stroke-width="3.5"/>' +
      '<circle cx="' + rp[0] + '" cy="' + rp[1] + '" r="9" fill="#f39c12" stroke="#d35400"/>' +
      '<line x1="170" y1="170" x2="' + sp[0] + '" y2="' + sp[1] + '" stroke="#7d3c98" stroke-width="3.5" stroke-dasharray="7 5"/>' +
      '<circle cx="' + sp[0] + '" cy="' + sp[1] + '" r="9" fill="#af7ac5" stroke="#7d3c98"/>' +
      '<circle cx="170" cy="170" r="5" fill="#123f39"/>' +
      '<text x="170" y="196" text-anchor="middle" font-size="13" fill="#5d4a36">আপনি কেন্দ্রে দাঁড়িয়ে</text>' +
      '<text x="170" y="326" text-anchor="middle" font-size="13" fill="#d35400" font-weight="700">কমলা = সূর্যোদয় · বেগুনি = সূর্যাস্ত</text></svg>';
  }
  var azSites = [];
  function runAz() {
    var sel = MX.$('azSite'), dIn = MX.$('azDate');
    if (!sel || !azSites.length) return;
    var s = azSites[+sel.value] || azSites[0];
    var date = dIn.value ? new Date(dIn.value + 'T00:00:00Z') : new Date();
    var dec = declination(date), rise = sunriseAzimuth(s.lat, dec), set = 360 - rise;
    MX.$('azOut').innerHTML =
      '<h3>☀️ ' + MX.esc(s.name_bn) + '</h3>' +
      '<p>অক্ষাংশ <b>' + MX.bn(s.lat.toFixed(3)) + '°</b> · সৌর ক্রান্তি <b>' + MX.bn(dec.toFixed(1)) + '°</b></p>' +
      '<p>সূর্যোদয়ের অজিমুখ<br><span class="mx-bigout">' + MX.bn(rise.toFixed(1)) + '°</span> <span class="mx-badge gold">' + dirName(rise) + '</span></p>' +
      '<p>সূর্যাস্তের অজিমুখ<br><span class="mx-bigout">' + MX.bn(set.toFixed(1)) + '°</span> <span class="mx-badge blue">' + dirName(set) + '</span></p>' +
      (s.note ? '<p class="mx-meta">' + MX.esc(s.note) + '</p>' : '') +
      '<p><a href="' + MX.earthLink(s.lat, s.lon) + '" target="_blank" rel="noopener">Google Earth-এ উপর থেকে স্থানটির অক্ষ দেখুন ↗</a></p>' +
      '<p class="mx-meta">সমতল দিগন্ত ধরে হিসাব; মাঠে টিলা-গাছের আড়ালে আপাত সূর্যোদয় কিছুটা সরে যেতে পারে।</p>';
    MX.$('azCompass').innerHTML = compassSvg(rise, set);
  }
  function setDate(m, d) { var i = MX.$('azDate'); var y = (i.value || '2026').slice(0, 4); i.value = y + '-' + m + '-' + d; runAz(); }
  MX.$('azBtn').addEventListener('click', runAz);
  MX.$('azSite').addEventListener('change', runAz);
  MX.$('azDate').addEventListener('change', runAz);
  MX.$('azSolsticeS').addEventListener('click', function () { setDate('06', '21'); });
  MX.$('azSolsticeW').addEventListener('click', function () { setDate('12', '21'); });
  MX.$('azEquinox').addEventListener('click', function () { setDate('03', '20'); });

  /* ---------- মণ্ডল রেখাচিত্র ---------- */
  function MandalaSvg() {
    // পরিকল্পিত রেখাচিত্র: বাইরে চতুষ্কোণ বিহার, মাঝে ক্রুশাকার মন্দির; স্তরগুলো টগলযোগ্য
    var cells = '';
    for (var i = 0; i < 12; i++) {
      var p = 60 + i * 40;
      cells += '<rect x="' + p + '" y="60" width="34" height="34" fill="#e8e0cf" stroke="#b3a284"/>' +
        '<rect x="' + p + '" y="446" width="34" height="34" fill="#e8e0cf" stroke="#b3a284"/>' +
        '<rect x="60" y="' + p + '" width="34" height="34" fill="#e8e0cf" stroke="#b3a284"/>' +
        '<rect x="446" y="' + p + '" width="34" height="34" fill="#e8e0cf" stroke="#b3a284"/>';
    }
    var cruciform = 'M240 180 h60 v60 h60 v60 h-60 v60 h-60 v-60 h-60 v-60 h60 z';
    return '<svg id="MandalaPlan" viewBox="0 0 540 540" width="540" role="img" aria-label="মণ্ডল ছকে বিহার-পরিকল্পনার রেখাচিত্র">' +
      '<rect width="540" height="540" fill="#fffdf4"/>' +
      // সৌর রেখা (স্তর)
      '<g data-layer="solar">' +
      '<line x1="270" y1="270" x2="530" y2="270" stroke="#d35400" stroke-width="2.5"/>' +
      '<line x1="270" y1="270" x2="507" y2="155" stroke="#e67e22" stroke-width="2" stroke-dasharray="6 4"/>' +
      '<line x1="270" y1="270" x2="507" y2="385" stroke="#e67e22" stroke-width="2" stroke-dasharray="6 4"/>' +
      '<text x="512" y="148" font-size="13" fill="#d35400">গ্রীষ্ম অয়নান্ত ↑</text>' +
      '<text x="512" y="405" font-size="13" fill="#d35400">শীত অয়নান্ত ↓</text>' +
      '<text x="512" y="262" font-size="13" fill="#d35400" font-weight="700">বিষুব (ঠিক পূর্ব)</text></g>' +
      // মূল পরিকল্পনা
      '<rect x="55" y="55" width="430" height="430" fill="#f5efe0" stroke="#8f3d08" stroke-width="3"/>' +
      cells +
      '<rect x="255" y="38" width="30" height="26" fill="#123f39"/>' +
      '<text x="270" y="30" text-anchor="middle" font-size="15" font-weight="800" fill="#123f39">উত্তর ↑ · একমাত্র প্রবেশদ্বার</text>' +
      '<path d="' + cruciform + '" fill="#d99b2b" stroke="#8f3d08" stroke-width="2.5"/>' +
      '<circle cx="270" cy="270" r="17" fill="#8f3d08"/>' +
      '<text x="270" y="415" text-anchor="middle" font-size="13" fill="#5d4a36">ক্রুশাকার কেন্দ্রীয় মন্দির (চার দিকে অভিক্ষেপ)</text>' +
      // জ্যামিতি স্তর
      '<g data-layer="geometry">' +
      '<circle cx="270" cy="270" r="215" fill="none" stroke="#1d5c4f" stroke-width="2" stroke-dasharray="10 6"/>' +
      '<circle cx="270" cy="270" r="122" fill="none" stroke="#1d5c4f" stroke-width="1.6" stroke-dasharray="4 4"/>' +
      '<line x1="55" y1="55" x2="485" y2="485" stroke="#1d5c4f" stroke-width="1" opacity=".55"/>' +
      '<line x1="485" y1="55" x2="55" y2="485" stroke="#1d5c4f" stroke-width="1" opacity=".55"/></g>' +
      // অক্ষ স্তর
      '<g data-layer="axes">' +
      '<line x1="270" y1="20" x2="270" y2="520" stroke="#b03a2e" stroke-width="2"/>' +
      '<line x1="20" y1="270" x2="520" y2="270" stroke="#b03a2e" stroke-width="2"/></g>' +
      // প্রদক্ষিণ স্তর
      '<g data-layer="pradakshina">' +
      '<rect x="168" y="168" width="204" height="204" fill="none" stroke="#2471a3" stroke-width="4" stroke-dasharray="14 8"/>' +
      '<path d="M270 160 l14 12 h-28 z" fill="#2471a3"/>' +
      '<text x="270" y="150" text-anchor="middle" font-size="13" fill="#2471a3" font-weight="700">প্রদক্ষিণ: ঘড়ির কাঁটার দিকে →</text></g>' +
      '</svg>';
  }
  function bindMandala(layers) {
    var svg = document.getElementById('MandalaPlan'); if (!svg) return;
    var bar = MX.$('MandalaBtns');
    bar.innerHTML = layers.map(function (l, i) {
      return '<button type="button" class="mx-layerbtn" data-layer="' + l.id + '" aria-pressed="' + (i < 2 ? 'true' : 'false') + '">' + MX.esc(l.name_bn) + '</button>';
    }).join('');
    function apply() {
      bar.querySelectorAll('.mx-layerbtn').forEach(function (b) {
        var g = svg.querySelector('[data-layer="' + b.dataset.layer + '"]');
        if (g) g.style.display = b.getAttribute('aria-pressed') === 'true' ? '' : 'none';
      });
    }
    bar.addEventListener('click', function (e) {
      var b = e.target.closest('.mx-layerbtn'); if (!b) return;
      b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
      apply();
    });
    apply();
    MX.$('MandalaLayers').innerHTML = layers.map(function (l) {
      return '<div class="mx-card"><h3>' + MX.esc(l.name_bn) + '</h3><p>' + MX.esc(l.meaning_bn) + '</p></div>';
    }).join('');
  }

  /* ---------- ডেটা লোড ---------- */
  Promise.all([
    MX.fetchJson('data/orientation-heritage.json?v=20261024g'),
    MX.fetchJson('data/atlas-sites.json?v=20261024g')
  ]).then(function (res) {
    var D = res[0], O = D.orientation;
    MX.$('oriHonesty').innerHTML = '<div class="mx-note">' + MX.esc(D.honesty_note_bn) + '</div>';
    MX.$('oriIntro').textContent = O.intro_bn;
    MX.$('oriDocs').innerHTML = O.documented.map(function (d) {
      return '<article class="mx-card"><h3>' + MX.esc(d.site_bn) + '</h3>' +
        '<p>' + (EVID[d.evidence] || '') + '</p>' +
        '<p><b>প্রবেশ/অক্ষ:</b> ' + MX.esc(d.entrance_bn) + '</p><p>' + MX.esc(d.note_bn) + '</p>' +
        '<p class="mx-meta">উৎস: ' + MX.esc(d.source_bn) + '</p></article>';
    }).join('');
    MX.$('oriConcepts').innerHTML = O.concepts.map(function (c) {
      return '<div class="mx-card"><h3>' + MX.esc(c.term_bn) + '</h3><p>' + MX.esc(c.def_bn) + '</p></div>';
    }).join('');
    MX.$('oriMethod').innerHTML = O.field_method.map(function (m) {
      return '<div class="mx-card"><h3>ধাপ ' + MX.bn(String(m.step)) + '</h3><p>' + MX.esc(m.text_bn) + '</p>' +
        (m.tool_url ? '<p><a href="' + MX.esc(m.tool_url) + '" target="_blank" rel="noopener">🔧 ' + MX.esc(m.tool_name) + ' ↗</a></p>' : '') + '</div>';
    }).join('');
    MX.$('MandalaIntro').textContent = D.Mandala.intro_bn;
    MX.$('MandalaSvg').innerHTML = MandalaSvg();
    bindMandala(D.Mandala.layers);
    MX.$('MandalaCompare').innerHTML = MX.esc(D.Mandala.compare_bn);

    var NOTE = {
      somapura: 'দলিল: এই স্থানের বিহার-প্রবেশ উত্তর দিকে — তাই পূর্বের সৌররেখা তার তোরণ-অক্ষের সঙ্গে তুলনা করতে সচেতনভাবে এই পার্থক্য মনে রাখুন।',
      shalban: 'দলিল: শালবনের একমাত্র প্রবেশও উত্তর দিকে।'
    };
    azSites = (res[1].sites || []).map(function (s) {
      return { id: s.id, name_bn: (s.name && s.name.bn) || s.id, lat: s.coordinates.lat, lon: s.coordinates.lon, note: NOTE[s.id] || '' };
    });
    azSites.push({ id: 'mahasthan', name_bn: 'মহাস্থানগড় (পুণ্ড্রনগর)', lat: 24.9575, lon: 89.3444, note: 'দুর্গপ্রাচীরের বহু দরজা — একক অক্ষের ধারণা এখানে খাটে না; স্থানাঙ্ক আনুমানিক কেন্দ্রের।' });
    MX.$('azSite').innerHTML = azSites.map(function (s, i) { return '<option value="' + i + '">' + MX.esc(s.name_bn) + '</option>'; }).join('');
    runAz();
  }).catch(function () {
    if (MX.$('oriDocs')) MX.$('oriDocs').innerHTML = '<p class="mx-meta">ডেটা লোড হয়নি — ইন্টারনেট সংযোগ দেখে আবার চেষ্টা করুন।</p>';
  });
})();
