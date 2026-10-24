/* চর্যাভূমি — 360° ও GIS এক্সপ্লোরার (§১) */
(function () {
  'use strict';
  if (!window.MX) return;
  MX.trackLocal('explore3d.html');

  var EXTRA = [{
    id: 'mahasthan', name_bn: 'মহাস্থানগড় (পুণ্ড্রনগর)', lat: 24.9575, lon: 89.3444,
    district_bn: 'বগুড়া', approx: true,
    note: 'দুর্গনগরীর কেন্দ্রের আনুমানিক স্থানাঙ্ক (UNESCO tentative nomination-এর এলাকা); প্রবেশদ্বার যাচাই করুন।',
    photo: null
  }];

  var sites = [], sourcesById = {}, current = null;

  function siteName(s) { return s.name_bn || (s.name && s.name.bn) || s.id; }
  function siteLat(s) { return s.lat != null ? s.lat : s.coordinates.lat; }
  function siteLon(s) { return s.lon != null ? s.lon : s.coordinates.lon; }

  function kmlOf(list, title) {
    var body = list.map(function (s) {
      return '<Placemark><name>' + MX.esc(siteName(s)) + '</name>' +
        '<description>' + MX.esc((s.summary && s.summary.bn) || s.note || '') + '</description>' +
        '<Point><coordinates>' + siteLon(s) + ',' + siteLat(s) + ',0</coordinates></Point></Placemark>';
    }).join('\n');
    return '<?xml version="1.0" encoding="UTF-8"?>\n<kml xmlns="http://www.opengis.net/kml/2.2"><Document><name>' +
      MX.esc(title) + '</name>\n' + body + '\n</Document></kml>';
  }
  function geojsonOf(list) {
    return JSON.stringify({
      type: 'FeatureCollection',
      features: list.map(function (s) {
        return {
          type: 'Feature',
          properties: { id: s.id, name_bn: siteName(s) },
          geometry: { type: 'Point', coordinates: [siteLon(s), siteLat(s)] }
        };
      })
    }, null, 2);
  }

  /* অঞ্চলভিত্তিক আপেক্ষিক উচ্চতা (শিক্ষামূলক ব্যান্ড, মিটার-ধারণা) */
  var ELEV_BANDS = [
    { label: 'গোমতী প্লাবনভূমি (কুমিল্লা)', h: 8 },
    { label: 'শালবন বিহার (টিলার পাদদেশ)', h: 18 },
    { label: 'লালমাই টিলার চূড়া এলাকা', h: 42 },
    { label: 'করতোয়া প্লাবনভূমি (বগুড়া)', h: 16 },
    { label: 'মহাস্থান দুর্গ-ঢিবি', h: 22 },
    { label: 'বরেন্দ্র উচ্চভূমি (পাহাড়পুর)', h: 26 },
    { label: 'সীতাকোট এলাকা (দিনাজপুর)', h: 32 }
  ];
  function drawDem() {
    var c = MX.$('demCanvas'); if (!c || !c.getContext) return;
    var ctx = c.getContext('2d');
    var W = c.width, H = c.height, base = H - 64, top = 34;
    ctx.clearRect(0, 0, W, H);
    ctx.font = '15px "Noto Sans Bengali", sans-serif';
    var max = 50, bw = (W - 90) / ELEV_BANDS.length;
    ctx.strokeStyle = '#b9a888'; ctx.lineWidth = 1;
    [0, 15, 30, 45].forEach(function (v) {
      var y = base - (v / max) * (base - top);
      ctx.beginPath(); ctx.moveTo(50, y); ctx.lineTo(W - 16, y); ctx.stroke();
      ctx.fillStyle = '#7b6a5d'; ctx.fillText(MX.bn(v) + ' মি.', 4, y + 5);
    });
    ELEV_BANDS.forEach(function (b, i) {
      var x = 60 + i * bw, h = (b.h / max) * (base - top);
      var grad = ctx.createLinearGradient(0, base - h, 0, base);
      grad.addColorStop(0, '#1d5c4f'); grad.addColorStop(1, '#d99b2b');
      ctx.fillStyle = grad;
      ctx.fillRect(x, base - h, bw - 16, h);
      ctx.fillStyle = '#2a1f19';
      ctx.fillText('≈' + MX.bn(b.h) + ' মি.', x, base - h - 8);
      ctx.save();
      ctx.translate(x + 4, base + 8); ctx.rotate(0.32);
      ctx.fillStyle = '#5b4a3f'; ctx.font = '13px "Noto Sans Bengali", sans-serif';
      ctx.fillText(b.label, 0, 10);
      ctx.restore();
      ctx.font = '15px "Noto Sans Bengali", sans-serif';
    });
    ctx.fillStyle = '#123f39';
    ctx.fillText('আপেক্ষিক উচ্চতা (আনুমানিক ব্যান্ড) — টিলা বনাম প্লাবনভূমি', 60, 22);
  }

  function render() {
    var s = current; if (!s) return;
    var lat = siteLat(s), lon = siteLon(s), name = siteName(s);
    MX.$('mxSiteCoord').textContent = '📍 ' + lat.toFixed(5) + ', ' + lon.toFixed(5) + (s.approx || (s.coordinates && s.coordinates.accuracy) ? ' · স্থানাঙ্কের টীকা Atlas-এ' : '');
    MX.$('svFrame').src = MX.streetViewEmbed(lat, lon);
    MX.$('svBtns').innerHTML =
      '<a class="cb-btn solid" target="_blank" rel="noopener" href="' + MX.streetViewLink(lat, lon) + '">🧍 Street View বড় করে খুলুন ↗</a>' +
      '<a class="cb-btn" target="_blank" rel="noopener" href="' + MX.mapsDir(lat, lon, 'driving') + '">🧭 এখানে যাওয়ার দিকনির্দেশনা</a>' +
      '<a class="cb-btn ghost" href="atlas.html">Atlas প্রোফাইল</a>';
    var tourHtml = '';
    if (s.tour && s.tour.source && sourcesById[s.tour.source]) {
      var t = sourcesById[s.tour.source];
      tourHtml = '<div class="mx-ok"><b>Atlas-যাচাই করা ভার্চুয়াল ট্যুর:</b> <a href="' + MX.esc(t.url) + '" target="_blank" rel="noopener">' +
        MX.esc((s.tour.title && s.tour.title.bn) || t.title) + ' ↗</a> — provider-hosted; ' + MX.esc((s.tour.note && s.tour.note.bn) || '') + '</div>';
    } else if (s.tour) {
      tourHtml = '<div class="mx-note">এই স্থানের Atlas ট্যুর-এন্ট্রি আছে, তবে বাইরের লিংক এই মুহূর্তে নির্দিষ্ট করা নেই — Atlas পাতা থেকে দেখুন।</div>';
    }
    MX.$('atlasTourNote').innerHTML = tourHtml;

    /* ড্রোন প্যান */
    var photo = s.photo && s.photo.file ? s.photo : null;
    var img = MX.$('panoImg');
    if (photo) {
      img.src = photo.file;
      img.alt = (photo.alt && photo.alt.bn) || name;
      MX.$('panoCredit').textContent = 'ছবি: ' + (photo.credit || '') + (photo.license ? ' · ' + photo.license : '') + ' — Atlas media রেকর্ড';
      img.onload = function () { panUpdate(); };
    } else {
      img.removeAttribute('src');
      MX.$('panoCredit').textContent = 'এই স্থানের আকাশ-ছবি সাইটের সংগ্রহে নেই — স্যাটেলাইট অংশে ওপর থেকে দেখুন।';
    }

    /* Earth/KML */
    MX.$('earthBtns').innerHTML =
      '<a class="cb-btn solid" target="_blank" rel="noopener" href="' + MX.earthLink(lat, lon) + '">🌍 Google Earth 3D ফ্লাইওভার ↗</a>' +
      '<button type="button" class="cb-btn" id="kmlAllBtn">⬇ সব Atlas স্থানের KML</button>' +
      '<button type="button" class="cb-btn" id="kmlOneBtn">⬇ শুধু “' + MX.esc(name) + '” KML</button>' +
      '<button type="button" class="cb-btn ghost" id="geojsonBtn">⬇ GeoJSON (QGIS/GIS-এর জন্য)</button>';
    MX.$('kmlAllBtn').addEventListener('click', function () { MX.download('charyabhumi-atlas-sites.kml', kmlOf(sites, 'চর্যাভূমি Atlas স্থানসমূহ'), 'application/vnd.google-earth.kml+xml'); });
    MX.$('kmlOneBtn').addEventListener('click', function () { MX.download(s.id + '.kml', kmlOf([s], name), 'application/vnd.google-earth.kml+xml'); });
    MX.$('geojsonBtn').addEventListener('click', function () { MX.download('charyabhumi-atlas-sites.geojson', geojsonOf(sites), 'application/geo+json'); });

    /* স্যাটেলাইট */
    MX.$('satFrame').src = 'https://maps.google.com/maps?q=' + lat + ',' + lon + '&t=k&z=16&output=embed';
    MX.$('roadFrame').src = 'https://maps.google.com/maps?q=' + lat + ',' + lon + '&t=m&z=16&output=embed';
    MX.$('satBtns').innerHTML =
      '<a class="cb-btn solid" target="_blank" rel="noopener" href="' + MX.timelapseLink(lat, lon) + '">⏱️ Earth Engine Timelapse (১৯৮৪→) ↗</a>' +
      '<a class="cb-btn" target="_blank" rel="noopener" href="https://livingatlas.arcgis.com/wayback/">Esri Wayback (পুরনো স্যাটেলাইট ছবি) ↗</a>' +
      '<a class="cb-btn ghost" href="maps.html">ঐতিহাসিক ম্যাপ গ্যালারি</a>';
  }

  function panUpdate() {
    var box = MX.$('panoBox'), img = MX.$('panoImg'), r = +MX.$('panoRange').value;
    if (!box || !img || !img.naturalWidth) return;
    var boxW = box.clientWidth, boxH = box.clientHeight;
    var imgW = img.naturalWidth * (boxH / img.naturalHeight);
    var overflow = Math.max(0, imgW - boxW);
    img.style.left = (-overflow * r / 100) + 'px';
  }

  /* বৈশিষ্ট্য-ম্যাচার (শিক্ষামূলক) */
  var MATCH_RULES = [
    { m: ['terracotta'], s: ['human-scene', 'animal'], sh: ['plaque'], title: 'সম্ভবত টেরাকোটা অলংকরণ ফলক', text: 'পাহাড়পুর ধরনের বিহার-প্রাচীরের ফলকে লোকজীবন, প্রাণী ও কাহিনি-দৃশ্য থাকে। ফলকের কিনারা ও পেছনের ইট-ছাঁচের চিহ্ন দেখুন।', link: ['knowledge.html#iconography', 'প্রতিমাতত্ত্ব ও প্রতীক'] },
    { m: ['stone', 'bronze'], s: ['buddha'], sh: ['statue'], title: 'সম্ভবত বুদ্ধমূর্তি — মুদ্রা মিলিয়ে দেখুন', text: 'ডান হাত ভূমি স্পর্শে থাকলে ভূমিস্পর্শ (মারবিজয়), দুই হাত কোলে ধ্যান, এক হাত তোলা অভয় মুদ্রা। ঊষ্ণীষ ও কুঞ্চিত কেশ বুদ্ধের লক্ষণ।', link: ['knowledge.html#iconography', 'বুদ্ধের মুদ্রাসমূহ'] },
    { m: ['stone', 'bronze'], s: ['deity'], sh: ['statue'], title: 'সম্ভবত বোধিসত্ত্ব/দেবী মূর্তি', text: 'মুকুটে ছোট ধ্যানী-বুদ্ধ থাকলে অবলোকিতেশ্বর; ললিতাসনে বরদ হাতে পদ্ম থাকলে তারা; পুঁথি-খড়্গ থাকলে মঞ্জুশ্রী। জ্ঞানকোষে চেনার তালিকা ধরে মিলান।', link: ['knowledge.html#iconography', 'তারা · অবলোকিতেশ্বর · মঞ্জুশ্রী'] },
    { m: ['metal-coin'], s: ['animal', 'symbol', 'text'], sh: ['coin'], title: 'সম্ভবত প্রাচীন মুদ্রা (হরিকেল-ধাঁচসহ)', text: 'ষাঁড়/ত্রিশূলের ছাপ ও ‘হরিকেল’ পাঠ থাকলে সমতট-হরিকেল অঞ্চলের রৌপ্যমুদ্রা হতে পারে। ওজন/বয়স জাদুঘরের ক্যাটালগে যাচাই করুন — নিজে দাম নির্ধারণ করবেন না।', link: ['knowledge.html#coins', 'মুদ্রাশাস্ত্র'] },
    { m: ['terracotta', 'stone'], s: ['text'], sh: ['seal', 'plaque'], title: 'সম্ভবত সিলমোহর বা লিপি-ফলক', text: 'ছোট গোল/ডিম্বাকার মাটির বস্তুতে উল্টো অক্ষর থাকলে সিলমোহর — বিহারের আসল নাম জানার সেরা প্রমাণ। পড়ার চেষ্টা না করে ছবি তুলে (অনুমতি থাকলে) বিশেষজ্ঞ/জাদুঘরে দেখান।', link: ['knowledge.html#epigraphy', 'লিপি ও সিলমোহর'] },
    { m: ['brick'], s: ['symbol', 'animal', 'human-scene', 'deity', 'buddha', 'text'], sh: ['building'], title: 'স্থাপত্যের অংশ', text: 'গম্বুজাকার অংশ স্তূপের অণ্ড, ছোট কক্ষের সারি ভিক্ষু-কক্ষ, মাঝের উঁচু চতুষ্কোণ কেন্দ্রীয় মন্দির হতে পারে। স্থাপত্য ডিরেক্টরি ধরে অংশের নাম বের করুন।', link: ['knowledge.html#architecture', 'স্থাপত্য ডিরেক্টরি'] }
  ];
  function lensMatch() {
    var m = MX.$('lensMaterial').value, s = MX.$('lensSubject').value, sh = MX.$('lensShape').value;
    var hit = MATCH_RULES.filter(function (r) { return r.m.indexOf(m) > -1 && r.s.indexOf(s) > -1 && r.sh.indexOf(sh) > -1; })[0];
    var box = MX.$('lensResult');
    if (hit) {
      box.innerHTML = '<div class="mx-ok"><b>' + MX.esc(hit.title) + '</b><p>' + MX.esc(hit.text) + '</p>' +
        '<a href="' + hit.link[0] + '">' + MX.esc(hit.link[1]) + ' →</a> · ' +
        '<a href="' + MX.lensByUrl('https://commons.wikimedia.org/wiki/Special:Search?search=Paharpur+terracotta') + '" target="_blank" rel="noopener">একই ধরনের ছবি Lens-এ যাচাই ↗</a></div>';
    } else {
      box.innerHTML = '<div class="mx-note">এই সমন্বয়ে নিশ্চিত মিল নেই — বৈশিষ্ট্য বদলে আবার দেখুন, অথবা ছবি থাকলে Google Lens ও <a href="knowledge.html#iconography">প্রতিমাতত্ত্ব তালিকা</a> মিলিয়ে নিন।</div>';
    }
  }

  function renderGallery(images) {
    MX.$('galleryGrid').innerHTML = (images || []).map(function (im) {
      var local = 'assets/atlas/' + im.file;
      return '<figure class="mx-card" style="margin:0"><a href="' + MX.esc(im.url || local) + '" target="_blank" rel="noopener">' +
        '<img class="mx-gallery-thumb" loading="lazy" src="' + MX.esc(local) + '" alt="' + MX.esc(im.file) + '"></a>' +
        '<figcaption class="mx-meta">📷 ' + MX.esc(im.credit || '') + ' · ' + MX.esc(im.license || '') +
        (im.page ? ' · <a href="' + MX.esc(im.page) + '" target="_blank" rel="noopener">মূল পাতা ↗</a>' : '') +
        (im.url ? ' · <a href="' + MX.lensByUrl(im.url) + '" target="_blank" rel="noopener">Lens-এ মিলান ↗</a>' : '') +
        '</figcaption></figure>';
    }).join('');
  }

  Promise.all([
    MX.fetchJson('data/atlas-sites.json?v=20261024g'),
    MX.fetchJson('data/atlas-media.json?v=20261024g').catch(function () { return { images: [] }; })
  ]).then(function (res) {
    var data = res[0];
    sites = (data.sites || []).concat(EXTRA);
    (data.sources || []).forEach(function (s) { sourcesById[s.id] = s; });
    var sel = MX.$('mxSiteSelect');
    sel.innerHTML = sites.map(function (s) { return '<option value="' + MX.esc(s.id) + '">' + MX.esc(siteName(s)) + '</option>'; }).join('');
    var wanted = new URLSearchParams(location.search).get('site');
    current = sites.filter(function (s) { return s.id === wanted; })[0] || sites[0];
    sel.value = current.id;
    sel.addEventListener('change', function () {
      current = sites.filter(function (s) { return s.id === sel.value; })[0];
      render();
    });
    render();
    drawDem();
    renderGallery(res[1].images);
  }).catch(function () {
    MX.$('mxSiteCoord').textContent = 'Atlas ডেটা লোড হয়নি — ইন্টারনেট/ফাইল পথ যাচাই করুন।';
  });

  MX.$('panoRange').addEventListener('input', panUpdate);
  window.addEventListener('resize', panUpdate);
  MX.$('satRange').addEventListener('input', function () {
    MX.$('satBA').style.setProperty('--split', this.value + '%');
  });
  MX.$('lensMatchBtn').addEventListener('click', lensMatch);
})();
