/* চর্যাভূমি — একীভূত হালকা ড্যাশবোর্ড
   স্থান-খোঁজা, Leaflet ম্যাপ ও ভ্রমণ-তালিকা একটাই স্ক্রিপ্টে।
   ভারী ডিরেক্টরি ও ম্যাপ-লাইব্রেরি দরকার না-হলে/পরে লোড হয়, তাই হোমপেজ দ্রুত খোলে। */
(function () {
  'use strict';

  var CORE = 'data/dashboard-core.json?v=20261024b';
  var DIRECTORY = 'data/dashboard-directory.json?v=20261024b';
  var GEO = 'data/bd-geo.json?v=20261024b';
  var PAGE = 24;
  var LS_TRIP = 'buddhistHeritageItinerary';
  var LS_VISITED = 'buddhistHeritageVisited';
  var DIRECTORY_SOURCE = 'https://brwt.gov.bd/pages/static-pages/6922dbb0933eb65569e0bdb6';

  var $ = function (id) { return document.getElementById(id); };
  var root = $('explore');
  if (!root || window.__charyabhumiDashboardLoaded) return;
  window.__charyabhumiDashboardLoaded = true;

  var els = {
    status: $('dashStatus'), search: $('placeSearch'), division: $('divisionFilter'),
    district: $('districtFilter'), upazila: $('upazilaFilter'), category: $('categoryFilter'), coordsOnly: $('coordsOnly'),
    clear: $('clearFilters'), results: $('resultsCount'), shown: $('shownCount'),
    grid: $('placeGrid'), empty: $('emptyState'), more: $('loadMorePlaces'),
    detail: $('placeDetail'), dialog: $('placeDialog'), dialogBody: $('placeDialogBody'),
    itineraryCount: $('itineraryCount'), visitedStat: $('visitedStat'),
    progressPercent: $('progressPercent'), progressBar: $('progressBar'),
    itineraryList: $('itineraryList'), exportBtn: $('exportItinerary'), clearTrip: $('clearItinerary'),
    totalStat: $('dashTotalStat'), pinStat: $('dashPinStat'),
    mapBox: $('map'), mapStatus: $('mapActionStatus'), loadMap: $('loadMapBtn'),
    locate: $('locateMe'), refreshMap: $('refreshMap')
  };

  var places = [];
  var geo = [];
  var geoReady = false;
  var byId = new Map();
  var filtered = [];
  var visible = PAGE;
  var directoryLoaded = false;
  var directoryLoading = false;
  var selectedId = null;
  var searchTimer = null;
  var markerTimer = null;
  var map = null;
  var markerLayer = null;
  var tileLayer = null;
  var userMarker = null;
  var userPosition = null;
  var mapPromise = null;
  var markers = new Map();

  var visited = new Set(readStorage(LS_VISITED, []));
  var itinerary = new Set(readStorage(LS_TRIP, []));

  var aliases = {
    somapura: 'paharpur somapura mahavihara naogaon',
    shalban: 'shalban mainamati cumilla comilla',
    mainamati: 'mainamati cumilla comilla museum',
    golden: 'golden temple buddha dhatu jadi bandarban',
    rajban: 'rajban vihara rangamati',
    nandan: 'nandan kanan chattogram chittagong',
    'bikrampur-vihara': 'bikrampur raghurampur munshiganj',
    nateshwar: 'nateshwar deul munshiganj',
    sitakot: 'sitakot nawabganj dinajpur',
    vasu: 'vasu vihara bogura bogra'
  };

  function readStorage(key, fallback) {
    try {
      var v = localStorage.getItem(key);
      var parsed = v ? JSON.parse(v) : fallback;
      return Array.isArray(parsed) ? parsed : fallback;
    } catch (_) { return fallback; }
  }
  function saveStorage(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) {}
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function bn(n) { return Number(n || 0).toLocaleString('bn-BD'); }
  function clean(s) { return String(s == null ? '' : s).trim(); }
  function normalize(s) {
    return clean(s).normalize('NFC').toLocaleLowerCase('bn')
      .replace(/[০-৯]/g, function (d) { return String('০১২৩৪৫৬৭৮৯'.indexOf(d)); })
      .replace(/[\u200c\u200d\ufeff]/g, '')
      .replace(/[^\p{L}\p{M}\p{N}\s-]/gu, ' ')
      .replace(/\s+/g, ' ').trim()
      .replace(/মুন্সিগঞ্জ/g, 'মুন্সীগঞ্জ')
      .replace(/রাঙ্গামাটি/g, 'রাঙামাটি')
      .replace(/রে ায়াংছড়ি/g, 'রেয়াংছড়ি')
      .replace(/লক্ষীছড়ি/g, 'লক্ষ্মীছড়ি')
      .replace(/দিঘীনালা/g, 'দীঘিনালা')
      .replace(/সীতাকুণ্ড/g, 'সীতাকুন্ড')
      .replace(/তালতলী/g, 'তালতলি')
      .replace(/সোনাইমুড়ি/g, 'সোনাইমুড়ী')
      .replace(/সূর্তাপুর/g, 'সূত্রাপুর');
  }
  function hasCoords(p) {
    return !!(p && Array.isArray(p.coords) && p.coords.length === 2 && p.coords.every(Number.isFinite));
  }
  function locationLine(p) {
    var bits = [];
    if (p.village) bits.push(p.village);
    if (p.union) bits.push(p.union + ' ইউনিয়ন');
    if (p.upazila) bits.push(p.upazila + ' উপজেলা');
    else if (p.thana) bits.push(p.thana + ' থানা');
    if (p.district) bits.push(p.district + ' জেলা');
    if (p.division) bits.push(p.division + ' বিভাগ');
    return bits.join(' · ');
  }
  function googleSearch(p) {
    var q = [p.name, p.upazila || p.thana, p.district, 'Bangladesh'].filter(Boolean).join(', ');
    return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q);
  }
  function googleDir(p) {
    // সুনির্দিষ্ট GPS, অথবা রেকর্ডে ঠিকানা-ভিত্তিক পিন থাকলে কোঅর্ডিনেটেই দিক দেখানো হয়;
    // অন্য আনুমানিক পিনে নাম-ভিত্তিক সার্চই নিরাপদ।
    if (hasCoords(p) && !p.directory && (!p.approx || p.address)) {
      return 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(p.coords.join(','));
    }
    return googleSearch(p);
  }
  function digitString(value) {
    return clean(value).replace(/[০-৯]/g, function (d) { return String('০১২৩৪৫৬৭৮৯'.indexOf(d)); }).replace(/\D/g, '');
  }
  function phoneParts(value) {
    return clean(value).split(/[,;|/]+|\s+এবং\s+|\s+অথবা\s+/).map(clean).filter(Boolean);
  }
  function phoneInfo(value) {
    // PDF-এর এক ঘরে থাকা একাধিক নম্বর আলাদা করা হয়। অসম্পূর্ণ নম্বরে কল-লিংক বসানো হয় না।
    var digits = digitString(clean(value).replace(/\([^)]*\)|（[^）]*）/g, ''));
    var mobile = /^(?:01[3-9]\d{8}|8801[3-9]\d{8})$/.test(digits);
    var landline = /^(?:0[2-9]\d{6,10}|880[2-9]\d{6,10})$/.test(digits);
    return {
      display: clean(value), digits: digits, mobile: mobile,
      valid: mobile || landline,
      tel: digits ? (digits.indexOf('880') === 0 ? '+' + digits : (digits.indexOf('0') === 0 ? '+880' + digits.slice(1) : digits)) : '',
      wa: mobile ? (digits.indexOf('01') === 0 ? '880' + digits.slice(1) : digits) : ''
    };
  }
  function telHref(num) {
    var info = phoneInfo(num);
    return info.valid ? 'tel:' + info.tel : '';
  }
  function waHref(num) {
    var info = phoneInfo(num);
    return info.wa ? 'https://wa.me/' + info.wa : '';
  }
  function phoneButtons(value, label) {
    return phoneParts(value).map(function (part) {
      var info = phoneInfo(part);
      if (!info.valid) {
        return '<span class="cb-mini-btn cb-phone-unverified" title="সূত্রের নম্বরটি অসম্পূর্ণ বা অকেজো; কল-লিংক দেওয়া হয়নি">⚠ ' + esc(info.display) + ' — নম্বর যাচাই প্রয়োজন</span>';
      }
      return '<a class="cb-mini-btn link" href="' + esc(telHref(part)) + '">' + (info.mobile ? '📞' : '☎') + ' ' + esc(label || 'ফোন') + ': ' + esc(info.display) + '</a>';
    });
  }
  function photoBlock(p) {
    var list = (Array.isArray(p.photos) ? p.photos : []).filter(function (x) { return x && x.image; });
    if (!list.length) {
      if (!p.photo) {
        return '<div class="cb-no-photo"><strong>যাচাইকৃত ছবি এখনো নেই</strong><p>প্রকাশ্য সূত্রে নির্ভরযোগ্য ছবি না পেলে অন্য স্থানের ছবি বসানো হয় না। <a href="about.html#contact">নিজের ছবি বা সূত্র পাঠাতে পারেন</a>।</p></div>';
      }
      list = [{ image: p.photo, caption: '', credit: p.photoCredit }];
    }
    return '<div class="cb-gallery">' + list.map(function (x, i) {
      var cap = [x.caption, x.credit].filter(Boolean).join(' · ');
      return '<figure><img src="' + esc(photoUrl(x.image, i === 0 ? 960 : 640)) + '" alt="' +
        esc(p.name + (x.caption ? ' — ' + x.caption : '') + '-এর ছবি') + '" loading="lazy" decoding="async" ' +
        'referrerpolicy="no-referrer" onerror="this.parentElement.remove()">' +
        (cap ? '<figcaption>' + esc(cap) + '</figcaption>' : '') + '</figure>';
    }).join('') + '</div>';
  }
  function contactBlock(p) {
    var buttons = phoneButtons(p.mobile, 'মোবাইল').concat(phoneButtons(p.officePhone, 'অফিস'));
    if (p.whatsapp) {
      var wa = waHref(p.whatsapp);
      if (wa) buttons.push('<a class="cb-mini-btn link" href="' + esc(wa) + '" target="_blank" rel="noopener">💬 হোয়াটসঅ্যাপ</a>');
    }
    if (p.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean(p.email))) {
      buttons.push('<a class="cb-mini-btn link" href="mailto:' + esc(p.email) + '">✉ ইমেইল</a>');
    }
    if (p.bkash) {
      buttons.push('<button type="button" class="cb-mini-btn" data-copy="' + esc(p.bkash) + '">💳 বিকাশ নম্বর কপি করুন</button>');
    }
    if (!buttons.length) return '';
    return '<div class="cb-contact-block">' +
      (p.bkash ? '<p class="cb-donate-note"><strong>দান ও সহায়তা — বিকাশ (ব্যক্তিগত):</strong> ' + esc(p.bkash) +
        '<br><small>টাকা পাঠানোর পর হোয়াটসঅ্যাপে ট্রানজেকশন আইডি জানিয়ে দিলে প্রতিষ্ঠান স্বীকৃতি দিতে পারে। ' +
        'বড় অঙ্কের সহায়তা বা ভবন নির্মাণে অংশ নিতে চাইলে আগে অধ্যক্ষের সঙ্গে কথা বলুন।</small></p>' : '') +
      '<div class="cb-place-actions">' + buttons.join('') + '</div>' +
    '</div>';
  }
  function photoUrl(url, width) {
    var raw = clean(url);
    if (!raw) return '';
    try {
      var u = new URL(raw, location.href);
      if (u.hostname !== 'upload.wikimedia.org' || /\/thumb\//.test(u.pathname)) return raw;
      var parts = u.pathname.split('/').filter(Boolean);
      // upload.wikimedia.org/wikipedia/commons/a/ab/File.jpg
      if (parts.length < 5) return raw;
      var file = parts[parts.length - 1];
      var thumbFile = file;
      if (/\.svg$/i.test(file)) thumbFile = file + '.png';
      else if (/\.tiff?$/i.test(file)) thumbFile = file.replace(/\.tiff?$/i, '.jpg');
      parts.splice(2, 0, 'thumb');
      // Wikimedia বর্তমানে thumb.wikimedia.org-তে নির্দিষ্ট bucket size দেয়; 480/640 অনুরোধে 400 আসতে পারে।
      var bucket = (width || 500) <= 500 ? 500 : 1280;
      parts.push(bucket + 'px-' + thumbFile);
      u.hostname = 'thumb.wikimedia.org';
      u.pathname = '/' + parts.join('/');
      u.search = '';
      return u.toString();
    } catch (_) { return raw; }
  }
  function setStatus(msg) { if (els.status) els.status.textContent = msg || ''; }
  function setMapStatus(msg) { if (els.mapStatus) els.mapStatus.textContent = msg || ''; }

  function indexPlace(p) {
    if (p._q) return p;
    p._q = normalize([
      p.id, p.name, p.en, p.division, p.district, p.upazila, p.thana, p.union,
      p.village, p.post, p.category, p.type, p.contact, p.mobile,
      (p.aliases || []).join(' '), aliases[p.id] || '',
      p.directory ? '' : clean(p.summary).slice(0, 180)
    ].filter(Boolean).join(' '));
    p._nameQ = normalize(p.name + ' ' + (p.en || ''));
    return p;
  }
  function addPlaces(list) {
    var added = 0;
    (list || []).forEach(function (p) {
      if (!p || !p.id || !p.name || byId.has(String(p.id))) return;
      p.id = String(p.id);
      var oldSpellings = {
        'মুন্সীগঞ্জ': ['মুন্সিগঞ্জ', 'Munshiganj'],
        'রেয়াংছড়ি': ['রে ায়াংছড়ি'],
        'লক্ষ্মীছড়ি': ['লক্ষীছড়ি'],
        'সূত্রাপুর': ['সূর্তাপুর']
      };
      [p.district, p.upazila, p.thana].forEach(function (value) {
        if (oldSpellings[value]) p.aliases = (p.aliases || []).concat(oldSpellings[value]);
      });
      places.push(indexPlace(p));
      byId.set(p.id, p);
      added++;
    });
    return added;
  }
  function expandDirectory(data) {
    var fields = data.fields || [];
    return (data.places || []).map(function (row) {
      if (!Array.isArray(row)) return row;
      var r = {};
      fields.forEach(function (f, i) { r[f] = row[i]; });
      var locBits = [r.vi, r.un, r.up || r.th, r.ds].filter(Boolean);
      return {
        id: r.id, name: r.n, en: '', division: r.dv, district: r.ds,
        upazila: r.up || '', thana: r.th || '', union: r.un || '', village: r.vi || '', post: r.po || '',
        category: r.cat || 'বিহার', type: r.typ || 'বিহার', coords: r.c || null,
        summary: (locBits.join(' · ') || 'বাংলাদেশ') + ' এলাকার বৌদ্ধ প্রতিষ্ঠান। পিন আনুমানিক; যাওয়ার আগে ঠিকানা ও প্রবেশপথ যাচাই করুন।',
        history: '', source: DIRECTORY_SOURCE,
        sourceLabel: 'বৌদ্ধ ধর্মীয় কল্যাণ ট্রাস্ট — জেলা-ভিত্তিক বিহার তালিকা' + (r.pdf ? ' · ' + r.pdf : ''),
        trip: 'যাওয়ার আগে Google Maps ও স্থানীয় যোগাযোগে সঠিক প্রবেশপথ, সময় ও দর্শনার্থী-নীতি নিশ্চিত করুন।',
        photo: '', photoCredit: '', approx: true,
        verify: 'official-trust-list; পিন আনুমানিক', contact: r.ct || '', mobile: r.mb || '',
        aliases: [], directory: true
      };
    });
  }

  function uniqueSorted(values) {
    var canonical = values.filter(Boolean).map(function (v) { return clean(v).normalize('NFC'); }).filter(Boolean);
    return Array.from(new Set(canonical)).sort(function (a, b) { return a.localeCompare(b, 'bn'); });
  }
  function fillSelect(select, values, allLabel, extraOptions) {
    if (!select) return;
    var current = select.value || 'all';
    var extras = extraOptions || [];
    select.innerHTML = '<option value="all">' + esc(allLabel) + '</option>' + values.map(function (v) {
      var value = typeof v === 'object' ? v.value : v;
      var label = typeof v === 'object' ? v.label : v;
      return '<option value="' + esc(value) + '">' + esc(label) + '</option>';
    }).join('') + extras.map(function (x) {
      return '<option value="' + esc(x.value) + '">' + esc(x.label) + '</option>';
    }).join('');
    select.value = values.some(function (v) { return (typeof v === 'object' ? v.value : v) === current; }) || extras.some(function (x) { return x.value === current; }) ? current : 'all';
  }
  function geoDivisions() { return geo.map(function (x) { return x.n; }); }
  function geoDistricts(division) {
    return uniqueSorted(geo.filter(function (x) { return division === 'all' || x.n === division; })
      .reduce(function (out, x) { return out.concat((x.d || []).map(function (d) { return d.n; })); }, []));
  }
  function geoUpazilas(division, district) {
    var rows = [];
    geo.filter(function (x) { return division === 'all' || x.n === division; })
      .forEach(function (x) {
        (x.d || []).filter(function (d) { return district === 'all' || d.n === district; })
          .forEach(function (d) {
            (d.u || []).forEach(function (u) {
              // A name such as “সদর” can occur in several districts. Keep
              // every one of the 495 gazetteer entries, scoped by district
              // until a single district has been selected.
              rows.push(district === 'all'
                ? { value: d.n + '::' + u.n, label: u.n + ' — ' + d.n }
                : { value: u.n, label: u.n });
            });
          });
      });
    return rows.sort(function (a, b) { return a.label.localeCompare(b.label, 'bn'); });
  }
  function refreshFilters() {
    // Preserve a valid selection while options are being cascaded. The old
    // implementation reset the division to “all” during its own change event.
    var div = els.division ? els.division.value : 'all';
    var dist = els.district ? els.district.value : 'all';
    var up = els.upazila ? els.upazila.value : 'all';
    var cat = els.category ? els.category.value : 'all';
    var divisions = geoReady ? geoDivisions() : uniqueSorted(places.map(function (p) { return p.division; }));
    fillSelect(els.division, divisions, 'সব বিভাগ');
    if (els.division && div !== 'all' && divisions.indexOf(div) > -1) els.division.value = div;
    div = els.division ? els.division.value : 'all';
    var districts = geoReady ? geoDistricts(div) : uniqueSorted(places.filter(function (p) { return div === 'all' || p.division === div; }).map(function (p) { return p.district; }));
    fillSelect(els.district, districts, 'সব জেলা');
    if (els.district && dist !== 'all' && districts.indexOf(dist) > -1) els.district.value = dist;
    dist = els.district ? els.district.value : 'all';
    var upazilas = geoReady ? geoUpazilas(div, dist) : uniqueSorted(places.filter(function (p) {
      return (div === 'all' || p.division === div) && (dist === 'all' || p.district === dist);
    }).map(function (p) { return p.upazila; }));
    fillSelect(els.upazila, upazilas, 'সব উপজেলা', [{ value: '__unknown__', label: 'উপজেলা অজানা / যাচাইাধীন' }]);
    if (els.upazila && up !== 'all' && (upazilas.some(function (v) { return (typeof v === 'object' ? v.value : v) === up; }) || up === '__unknown__')) els.upazila.value = up;
    // category is the only broad taxonomy; type remains a detailed subtype.
    fillSelect(els.category, uniqueSorted(places.map(function (p) { return p.category; })), 'সব ধরন');
    if (els.category && cat !== 'all' && Array.from(els.category.options).some(function (option) { return option.value === cat; })) els.category.value = cat;
  }
  function refreshStats() {
    if (els.totalStat) els.totalStat.textContent = bn(places.length) + 'টি';
    if (els.pinStat) els.pinStat.textContent = bn(places.filter(hasCoords).length) + 'টি';
  }

  var FEATURED = {
    somapura: 120, shalban: 118, golden: 116, rajban: 114, dharmarajika: 112,
    'kotila-mura': 108, 'itakhola-mura': 106, 'halud-vihara': 104,
    'ananda-vihara': 102, 'atish-dipankar-memorial-complex': 100,
    'ramu-seema': 98, 'naba-shalban': 96, 'rupban-mura': 94
  };
  function editorialScore(p) {
    if (typeof p._rank === 'number') return p._rank;
    var s = FEATURED[p.id] || 0;
    if (!p.directory) s += 26;
    if (p.photo) s += 18;
    if (clean(p.history).length > 260) s += 10;
    else if (clean(p.history).length > 120) s += 6;
    if (clean(p.summary).length > 100) s += 5;
    if (p.en) s += 3;
    if (hasCoords(p)) s += 2;
    if (!p.approx) s += 2;
    p._rank = s;
    return s;
  }
  function score(p, q, tokens) {
    var s = 0;
    if (p._nameQ === q) s += 100;
    if (p._nameQ.indexOf(q) === 0) s += 50;
    if (p._nameQ.indexOf(q) > -1) s += 30;
    tokens.forEach(function (t) { if (p._nameQ.indexOf(t) > -1) s += 8; });
    if (!p.directory) s += 3;
    if (hasCoords(p)) s += 1;
    return s;
  }
  function applyFilters(resetVisible, focusMap) {
    if (resetVisible !== false) visible = PAGE;
    var q = normalize(els.search ? els.search.value : '');
    var tokens = q ? q.split(' ').filter(Boolean) : [];
    var div = els.division ? els.division.value : 'all';
    var dist = els.district ? els.district.value : 'all';
    var up = els.upazila ? els.upazila.value : 'all';
    var cat = els.category ? els.category.value : 'all';
    var coordsOnly = !!(els.coordsOnly && els.coordsOnly.checked);

    filtered = places.filter(function (p) {
      if (div !== 'all' && p.division !== div) return false;
      if (dist !== 'all' && p.district !== dist) return false;
      if (up === '__unknown__' && clean(p.upazila)) return false;
      if (up !== 'all' && up !== '__unknown__') {
        var upParts = up.split('::');
        if (upParts.length === 2) {
          if (p.district !== upParts[0] || p.upazila !== upParts[1]) return false;
        } else if (p.upazila !== up) return false;
      }
      if (cat !== 'all' && p.category !== cat) return false;
      if (coordsOnly && !hasCoords(p)) return false;
      if (!tokens.length) return true;
      return tokens.every(function (t) { return p._q.indexOf(t) > -1; });
    });
    if (tokens.length) {
      filtered.sort(function (a, b) {
        return score(b, q, tokens) - score(a, q, tokens) || a.name.localeCompare(b.name, 'bn');
      });
    } else {
      // কোনো খোঁজশব্দ না থাকলে পরিচিত, ছবিসহ ও বিস্তারিত রেকর্ড আগে;
      // তারপর বাকি মূল রেকর্ড, শেষে ডিরেক্টরি—দর্শক প্রথম পাতাতেই অর্থবহ কার্ড পান।
      filtered.sort(function (a, b) {
        return editorialScore(b) - editorialScore(a) || a.name.localeCompare(b.name, 'bn');
      });
    }
    renderCards();
    scheduleMarkers(focusMap && tokens.length > 0);
  }

  function cardHtml(p) {
    var inTrip = itinerary.has(p.id);
    var seen = visited.has(p.id);
    var firstPhoto = Array.isArray(p.photos) && p.photos.length ? p.photos[0] : null;
    var photoCaption = firstPhoto ? clean(firstPhoto.caption) : '';
    var eventPhoto = /অনুষ্ঠান|সম্মেলন/.test(photoCaption) && /নয়/.test(photoCaption);
    var media = p.photo
      ? '<img src="' + esc(photoUrl(p.photo, 480)) + '" alt="' + esc(p.name + (photoCaption ? ' — ' + photoCaption : '-এর ছবি')) + '" loading="lazy" decoding="async" referrerpolicy="no-referrer" onerror="this.remove()">'
      : '<div class="cb-place-art" aria-hidden="true"><span>☸</span></div>';
    return '<article class="cb-place-card' + (selectedId === p.id ? ' is-selected' : '') + '" data-card="' + esc(p.id) + '">' +
      '<div class="cb-place-media">' + media + '<span class="cb-place-badge" title="' + esc(p.type || p.category || 'স্থান') + '">' + esc(p.type || p.category || 'স্থান') + '</span>' +
      (eventPhoto ? '<span class="cb-place-photo-kind">অনুষ্ঠানের ছবি</span>' : '') +
      (p.approx ? '<span class="cb-place-approx">পিন আনুমানিক</span>' : '') + '</div>' +
      '<div class="cb-place-body">' +
        '<h3>' + esc(p.name) + '</h3>' +
        (p.en ? '<p class="cb-place-en">' + esc(p.en) + '</p>' : '') +
        '<p class="cb-place-loc">⌖ ' + esc(locationLine(p) || 'অবস্থান যাচাইাধীন') + '</p>' +
        '<p class="cb-place-summary">' + esc(clean(p.summary).slice(0, 210)) + '</p>' +
        '<div class="cb-place-actions">' +
          '<button type="button" class="cb-mini-btn primary" data-action="details" data-id="' + esc(p.id) + '">বিস্তারিত</button>' +
          '<button type="button" class="cb-mini-btn" data-action="itinerary" data-id="' + esc(p.id) + '">' + (inTrip ? '✓ তালিকায় আছে' : '+ ভ্রমণ তালিকা') + '</button>' +
          '<button type="button" class="cb-mini-btn" data-action="visited" data-id="' + esc(p.id) + '">' + (seen ? '✓ দেখা হয়েছে' : '□ দেখা হয়েছে') + '</button>' +
          '<button type="button" class="cb-mini-btn" data-action="map" data-id="' + esc(p.id) + '">ম্যাপে দেখুন</button>' +
        '</div>' +
      '</div></article>';
  }
  function renderCards() {
    if (!els.grid) return;
    var shownList = filtered.slice(0, visible);
    els.grid.innerHTML = shownList.map(cardHtml).join('');
    if (els.results) els.results.textContent = bn(filtered.length) + 'টি স্থান পাওয়া গেছে';
    if (els.shown) els.shown.textContent = bn(shownList.length) + ' / ' + bn(filtered.length) + 'টি দেখানো হচ্ছে';
    if (els.empty) els.empty.hidden = filtered.length !== 0;
    if (els.more) {
      var left = filtered.length - shownList.length;
      els.more.hidden = left <= 0;
      els.more.textContent = 'আরও ' + bn(Math.min(PAGE, left)) + 'টি স্থান দেখুন';
    }
    if (!directoryLoaded && places.length) {
      setStatus('মূল ' + bn(places.length) + 'টি স্থান তৈরি। বাকি বিহার-ডিরেক্টরি পেছনে লোড হচ্ছে…');
    } else if (places.length) {
      setStatus(bn(places.length) + 'টি যাচাইকৃত/তালিকাভুক্ত রেকর্ড প্রস্তুত।');
    }
  }

  function sourceList(p) {
    var list = (Array.isArray(p.sources) ? p.sources : []).filter(function (x) { return x && clean(x.url); });
    if (p.source && !list.some(function (x) { return x.url === p.source; })) {
      list.unshift({ url: p.source, label: p.sourceLabel || 'মূল তথ্যসূত্র' });
    }
    return list;
  }
  function sourceBlock(p) {
    var list = sourceList(p);
    if (!list.length) return '';
    return '<section class="cb-sources"><h4>তথ্যসূত্র ও যাচাই</h4><ol>' + list.map(function (x) {
      return '<li><a href="' + esc(x.url) + '" target="_blank" rel="noopener">' + esc(x.label || x.url) + ' ↗</a></li>';
    }).join('') + '</ol></section>';
  }
  function unavailableNote(p) {
    if (p.dataNote) return p.dataNote;
    var hasPhotos = !!(p.photo || (Array.isArray(p.photos) && p.photos.length));
    var missing = [];
    if (!hasPhotos) missing.push('ছবি');
    if (!p.established) missing.push('সুনির্দিষ্ট প্রতিষ্ঠা/নির্মাণ-তারিখ');
    if (!p.contact) missing.push('দায়িত্বপ্রাপ্ত ব্যক্তি');
    if (!p.mobile) missing.push('মোবাইল');
    if (!missing.length) return '';
    if (p.directory) {
      return 'সরকারি জেলা-তালিকার প্রতিটি সারিতে ছবি, তারিখ, ব্যক্তি ও ফোনের আলাদা ঘর নেই। এই রেকর্ডে যা প্রকাশিত ছিল তাই এসেছে; ' + missing.join(', ') + ' অনুমান করে যোগ করা হয়নি।';
    }
    return 'প্রকাশিত উৎসে ' + missing.join(', ') + ' নিশ্চিতভাবে পাওয়া যায়নি। ভুল তথ্য এড়াতে ঘরগুলো অনুমান করে পূরণ করা হয়নি।';
  }
  function detailHtml(p) {
    var inTrip = itinerary.has(p.id);
    var seen = visited.has(p.id);
    var note = unavailableNote(p);
    var rows = [
      ['বিভাগ', p.division], ['জেলা', p.district], ['উপজেলা', p.upazila], ['থানা', p.thana],
      ['ইউনিয়ন', p.union], ['গ্রাম/এলাকা', p.village], ['পোস্ট অফিস', p.post],
      ['ঠিকানা', p.address], ['প্রতিষ্ঠা/নির্মাণ', p.established || 'সূত্রে উল্লেখ নেই'],
      ['ধরন', p.category], ['উপধরন', p.type],
      ['দায়িত্বপ্রাপ্ত ব্যক্তি/কার্যালয়', p.contact || 'প্রকাশিত নয়'],
      ['মোবাইল', p.mobile || 'প্রকাশিত নয়'], ['অফিস ফোন', p.officePhone], ['ইমেইল', p.email],
      ['হোয়াটসঅ্যাপ', p.whatsapp], ['বিকাশ (দান)', p.bkash], ['ম্যাপে ঠিকানা', p.mapLabel],
      ['যাচাই', p.verify], ['স্থানাঙ্ক', hasCoords(p) ? p.coords.join(', ') + (p.approx ? ' (আনুমানিক/প্রবেশদ্বার নয়)' : '') : 'নির্ভরযোগ্য পিন নেই']
    ].filter(function (r) { return clean(r[1]); });
    return '<article class="cb-place-detail">' +
      '<p class="cb-eyebrow">' + esc(p.category || p.type || 'বৌদ্ধ ঐতিহ্য') + '</p>' +
      '<h3>' + esc(p.name) + '</h3>' + (p.en ? '<p class="cb-place-en">' + esc(p.en) + '</p>' : '') +
      '<p class="cb-place-loc">⌖ ' + esc(locationLine(p)) + '</p>' +
      (p.summary ? '<p>' + esc(p.summary) + '</p>' : '') +
      photoBlock(p) +
      (p.history && p.history !== p.summary ? '<h4>ইতিহাস ও প্রসঙ্গ</h4><p>' + esc(p.history) + '</p>' : '') +
      (p.architecture ? '<h4>স্থাপত্য</h4><p>' + esc(p.architecture) + '</p>' : '') +
      (p.archaeology ? '<h4>প্রত্নতাত্ত্বিক আবিষ্কার</h4><p>' + esc(p.archaeology) + '</p>' : '') +
      (p.trip ? '<h4>যাওয়ার আগে</h4><p>' + esc(p.trip) + '</p>' : '') +
      '<dl class="cb-detail-list">' + rows.map(function (r) { return '<div><dt>' + esc(r[0]) + '</dt><dd>' + esc(r[1]) + '</dd></div>'; }).join('') + '</dl>' +
      contactBlock(p) +
      '<div class="cb-place-actions">' +
        '<button type="button" class="cb-mini-btn primary" data-action="itinerary" data-id="' + esc(p.id) + '">' + (inTrip ? '✓ তালিকা থেকে সরান' : '+ ভ্রমণ তালিকায় যোগ করুন') + '</button>' +
        '<button type="button" class="cb-mini-btn" data-action="visited" data-id="' + esc(p.id) + '">' + (seen ? '✓ দেখা হয়েছে' : 'দেখা হয়েছে বলে চিহ্নিত করুন') + '</button>' +
        '<button type="button" class="cb-mini-btn" data-action="map" data-id="' + esc(p.id) + '">ম্যাপে দেখুন</button>' +
        '<a class="cb-mini-btn link" href="' + esc(googleDir(p)) + '" target="_blank" rel="noopener">Google Maps ↗</a>' +
      '</div>' +
      sourceBlock(p) +
      (note ? '<details class="cb-data-note"><summary>তথ্য কেন আগে পাওয়া যায়নি</summary><p>' + esc(note) + '</p></details>' : '') +
      '<p class="cb-source-note">সক্রিয় বিহারে প্রবেশের আগে পোশাক, ছবি তোলা ও দর্শনার্থী-নীতি সম্পর্কে স্থানীয় নির্দেশনা জেনে নিন।' +
        (p.approx ? ' আনুমানিক পিনকে প্রবেশদ্বারের GPS ধরে নেবেন না।' : '') + '</p>' +
    '</article>';
  }
  function showDetail(p) {
    if (!p) return;
    selectedId = p.id;
    document.querySelectorAll('[data-card]').forEach(function (card) {
      card.classList.toggle('is-selected', card.getAttribute('data-card') === p.id);
    });
    var html = detailHtml(p);
    if (els.dialog && typeof els.dialog.showModal === 'function' && els.dialogBody) {
      els.dialogBody.innerHTML = html;
      if (!els.dialog.open) els.dialog.showModal();
    } else if (els.detail) {
      els.detail.hidden = false;
      els.detail.innerHTML = html;
      els.detail.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  function renderItinerary() {
    if (els.itineraryCount) els.itineraryCount.textContent = bn(itinerary.size);
    if (els.visitedStat) els.visitedStat.textContent = bn(visited.size);
    var pct = places.length ? Math.round((visited.size / places.length) * 1000) / 10 : 0;
    if (els.progressPercent) els.progressPercent.textContent = bn(pct) + '%';
    if (els.progressBar) els.progressBar.style.width = Math.min(100, pct) + '%';
    if (!els.itineraryList) return;
    var selected = Array.from(itinerary).map(function (id) { return byId.get(id); }).filter(Boolean);
    var missing = itinerary.size - selected.length;
    if (!selected.length) {
      els.itineraryList.innerHTML = '<p class="cb-trip-empty">তালিকা এখনো খালি। যেকোনো স্থানের কার্ড থেকে <b>“+ ভ্রমণ তালিকা”</b> চাপুন।' +
        (missing ? '<br><span>' + bn(missing) + 'টি পুরোনো সংরক্ষিত স্থান ডিরেক্টরি লোডের অপেক্ষায় আছে।</span>' : '') + '</p>';
      return;
    }
    els.itineraryList.innerHTML = selected.map(function (p) {
      return '<div class="cb-trip-item">' +
        '<label><input type="checkbox" data-trip-visited="' + esc(p.id) + '"' + (visited.has(p.id) ? ' checked' : '') + '><span class="sr-only">' + esc(p.name) + ' দেখা হয়েছে</span></label>' +
        '<button type="button" class="cb-trip-name" data-action="details" data-id="' + esc(p.id) + '"><strong>' + esc(p.name) + '</strong><small>' + esc(locationLine(p)) + '</small></button>' +
        '<button type="button" class="cb-trip-remove" data-trip-remove="' + esc(p.id) + '" aria-label="' + esc(p.name) + ' সরান">×</button>' +
      '</div>';
    }).join('') + (missing ? '<p class="cb-trip-empty">' + bn(missing) + 'টি পুরোনো সংরক্ষিত স্থান এখনো মেলেনি—ডিরেক্টরি লোড শেষ হলে আবার দেখুন।</p>' : '');
  }
  function toggleItinerary(id) {
    if (itinerary.has(id)) itinerary.delete(id); else itinerary.add(id);
    saveStorage(LS_TRIP, Array.from(itinerary));
    applyFilters(false, false); renderItinerary();
    if (selectedId === id && els.dialog && els.dialog.open) showDetail(byId.get(id));
  }
  function toggleVisited(id) {
    if (visited.has(id)) visited.delete(id); else visited.add(id);
    saveStorage(LS_VISITED, Array.from(visited));
    applyFilters(false, false); renderItinerary();
    if (selectedId === id && els.dialog && els.dialog.open) showDetail(byId.get(id));
  }
  function exportItinerary() {
    var selected = Array.from(itinerary).map(function (id) { return byId.get(id); }).filter(Boolean);
    if (!selected.length) { setStatus('রপ্তানির আগে ভ্রমণ তালিকায় অন্তত একটি স্থান যোগ করুন।'); return; }
    var text = 'চর্যাভূমি — আমার বৌদ্ধ ঐতিহ্য ভ্রমণ তালিকা\n' +
      'তৈরি: ' + new Date().toLocaleString('bn-BD') + '\n\n' +
      selected.map(function (p, i) {
        return (i + 1) + '. ' + p.name + '\n   ' + locationLine(p) + '\n   ' + googleSearch(p) + '\n   ' + (visited.has(p.id) ? 'দেখা হয়েছে' : 'দেখা হয়নি');
      }).join('\n\n') + '\n\nনোট: আনুমানিক পিন যাত্রার আগে স্থানীয়ভাবে যাচাই করুন।';
    var blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a'); a.href = url; a.download = 'charyabhumi-trip-list.txt';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 600);
  }

  function loadCss(href, id) {
    if (document.getElementById(id)) return;
    var l = document.createElement('link'); l.id = id; l.rel = 'stylesheet'; l.href = href;
    document.head.appendChild(l);
  }
  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var existing = document.querySelector('script[src="' + src + '"]');
      if (existing) { resolve(); return; }
      var s = document.createElement('script'); s.src = src; s.async = true;
      var timer = setTimeout(function () { s.remove(); reject(new Error('timeout ' + src)); }, 12000);
      s.onload = function () { clearTimeout(timer); resolve(); };
      s.onerror = function () { clearTimeout(timer); s.remove(); reject(new Error('load ' + src)); };
      document.head.appendChild(s);
    });
  }
  function mountTiles() {
    if (!map || !window.L) return;
    if (tileLayer) { try { map.removeLayer(tileLayer); } catch (_) {} }
    var providers = [
      { name: 'OpenStreetMap', url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png', options: { maxZoom: 19, attribution: '&copy; OpenStreetMap contributors' } },
      { name: 'Esri', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', options: { maxZoom: 19, attribution: '&copy; Esri' } }
    ];
    var idx = 0, loaded = 0, errors = 0, timer = null;
    function mount() {
      if (timer) clearTimeout(timer);
      if (tileLayer) { try { map.removeLayer(tileLayer); } catch (_) {} }
      if (idx >= providers.length) { setMapStatus('ম্যাপ টাইল আসছে না। পিনে চাপ দিয়ে Google Maps ব্যবহার করুন, অথবা নেটওয়ার্ক বদলে আবার চেষ্টা করুন।'); return; }
      loaded = 0; errors = 0;
      tileLayer = L.tileLayer(providers[idx].url, providers[idx].options);
      tileLayer.on('tileload', function () { loaded++; if (loaded === 1) setMapStatus('ম্যাপ তৈরি। পিনে চাপ দিলে স্থানের নাম ও Google Maps লিংক পাবেন।'); });
      tileLayer.on('tileerror', function () { errors++; if (errors >= 4 && loaded < 2) { idx++; mount(); } });
      tileLayer.addTo(map);
      timer = setTimeout(function () { if (loaded < 2 && idx < providers.length - 1) { idx++; mount(); } }, 6500);
    }
    mount();
  }
  function markerFor(p) {
    var old = markers.get(p.id);
    if (old) return old;
    var icon = L.divIcon({
      className: 'cb-leaflet-pin-wrap',
      html: '<div class="cb-leaflet-pin" aria-hidden="true">☸</div>',
      iconSize: [32, 32], iconAnchor: [16, 16], popupAnchor: [0, -16]
    });
    var m = L.marker(p.coords, { icon: icon, title: p.name, alt: p.name });
    m.bindPopup('<div class="cb-map-popup"><strong>' + esc(p.name) + '</strong><p>' + esc(locationLine(p)) + '</p>' +
      (p.approx ? '<p><em>পিন আনুমানিক / যাচাইাধীন</em></p>' : '') +
      '<p><a href="' + esc(googleDir(p)) + '" target="_blank" rel="noopener">Google Maps-এ খুলুন ↗</a></p></div>');
    m.on('click', function () { selectedId = p.id; });
    markers.set(p.id, m);
    return m;
  }
  function updateMarkers(focus) {
    if (!map || !markerLayer || !window.L) return;
    var pins = filtered.filter(hasCoords).map(markerFor);
    markerLayer.clearLayers();
    if (typeof markerLayer.addLayers === 'function') markerLayer.addLayers(pins);
    else pins.forEach(function (m) { markerLayer.addLayer(m); });
    if (focus && pins.length) {
      if (pins.length === 1) map.setView(pins[0].getLatLng(), Math.max(map.getZoom(), 11), { animate: false });
      else if (pins.length <= 80) map.fitBounds(L.latLngBounds(pins.map(function (m) { return m.getLatLng(); })), { padding: [24, 24], maxZoom: 11, animate: false });
    }
    if (userPosition) drawUserMarker();
  }
  function scheduleMarkers(focus) {
    if (!map) return;
    clearTimeout(markerTimer);
    markerTimer = setTimeout(function () { updateMarkers(!!focus); }, 260);
  }
  function drawUserMarker() {
    if (!map || !userPosition || !window.L) return;
    if (userMarker) { try { userMarker.remove(); } catch (_) {} }
    userMarker = L.circleMarker([userPosition.lat, userPosition.lng], {
      radius: 9, color: '#ffffff', weight: 3, fillColor: '#b5571f', fillOpacity: 1
    }).addTo(map).bindPopup('আপনার বর্তমান অবস্থান');
  }
  function ensureMap() {
    if (window.__charyabhumiMap) {
      map = window.__charyabhumiMap;
      setTimeout(function () { try { map.invalidateSize(); } catch (_) {} }, 60);
      return Promise.resolve(map);
    }
    if (mapPromise) return mapPromise;
    setMapStatus('ম্যাপ লোড হচ্ছে…');
    if (els.loadMap) { els.loadMap.disabled = true; els.loadMap.textContent = 'ম্যাপ লোড হচ্ছে…'; }
    loadCss('https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css', 'cbLeafletCss');
    loadCss('https://cdn.jsdelivr.net/npm/leaflet.markercluster@1.5.3/dist/MarkerCluster.css', 'cbClusterCss');
    loadCss('https://cdn.jsdelivr.net/npm/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css', 'cbClusterDefaultCss');
    mapPromise = loadScript('https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js')
      .catch(function () { return loadScript('https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js'); })
      .then(function () { return loadScript('https://cdn.jsdelivr.net/npm/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js').catch(function () { return null; }); })
      .then(function () {
        if (!window.L || typeof L.map !== 'function' || !els.mapBox) throw new Error('Leaflet unavailable');
        els.mapBox.innerHTML = '';
        map = L.map(els.mapBox, { scrollWheelZoom: false, preferCanvas: true }).setView([23.685, 90.3563], 7);
        window.__charyabhumiMap = map;
        mountTiles();
        markerLayer = typeof L.markerClusterGroup === 'function'
          ? L.markerClusterGroup({
              chunkedLoading: true, chunkInterval: 180, chunkDelay: 30,
              maxClusterRadius: 44, disableClusteringAtZoom: 13, showCoverageOnHover: false,
              iconCreateFunction: function (cluster) {
                return L.divIcon({ className: 'cb-cluster-wrap', html: '<div class="cb-cluster">☸<b>' + cluster.getChildCount() + '</b></div>', iconSize: [42, 42], iconAnchor: [21, 21] });
              }
            })
          : L.layerGroup();
        markerLayer.addTo(map);
        map.whenReady(function () {
          setMapStatus('ম্যাপ তৈরি—পিন ও টাইল সাজানো হচ্ছে…');
          setTimeout(function () { try { map.invalidateSize(); } catch (_) {} }, 120);
          updateMarkers(false);
        });
        if (els.loadMap) { els.loadMap.disabled = false; els.loadMap.textContent = 'ম্যাপ তৈরি ✓'; }
        return map;
      })
      .catch(function (err) {
        console.error('[dashboard map]', err);
        mapPromise = null;
        if (els.mapBox) {
          els.mapBox.innerHTML = '<div class="cb-map-fallback"><strong>ইন্টার‌্যাকটিভ ম্যাপ লোড করা যায়নি</strong><p>ইন্টারনেট/CDN সংযোগ ঠিক করে আবার চেষ্টা করুন। ততক্ষণ কার্ডের “Google Maps” লিংক ব্যবহার করা যাবে।</p><button type="button" class="cb-btn solid sm" id="retryMapBtn">↻ আবার চেষ্টা</button></div>';
          var retry = $('retryMapBtn'); if (retry) retry.addEventListener('click', ensureMap);
        }
        if (els.loadMap) { els.loadMap.disabled = false; els.loadMap.textContent = '↻ ম্যাপ আবার চেষ্টা'; }
        setMapStatus('ম্যাপ লাইব্রেরি লোড হয়নি।');
        return null;
      });
    return mapPromise;
  }
  function focusPlaceOnMap(p) {
    var target = $('map-section');
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    ensureMap().then(function (m) {
      if (!m || !p) return;
      if (!hasCoords(p)) { setMapStatus('এই স্থানের নির্ভরযোগ্য স্থানাঙ্ক নেই। Google Maps অনুসন্ধান ব্যবহার করুন।'); return; }
      selectedId = p.id;
      updateMarkers(false);
      setTimeout(function () {
        try { m.invalidateSize(); m.setView(p.coords, Math.max(m.getZoom(), 12), { animate: false }); } catch (_) {}
        var marker = markers.get(p.id);
        if (marker && markerLayer && typeof markerLayer.zoomToShowLayer === 'function') {
          markerLayer.zoomToShowLayer(marker, function () { marker.openPopup(); });
        } else if (marker) marker.openPopup();
      }, 180);
    });
  }
  function locateMe() {
    if (!navigator.geolocation || !window.isSecureContext) {
      setMapStatus('অবস্থান জানতে HTTPS ও ব্রাউজারের Location permission দরকার।');
      return;
    }
    setMapStatus('আপনার অবস্থান শনাক্ত করা হচ্ছে…');
    navigator.geolocation.getCurrentPosition(function (pos) {
      userPosition = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      ensureMap().then(function (m) {
        if (m) { drawUserMarker(); m.setView([userPosition.lat, userPosition.lng], 12, { animate: false }); setMapStatus('আপনার অবস্থান ম্যাপে দেখানো হয়েছে।'); }
      });
    }, function (err) {
      setMapStatus(err && err.code === 1 ? 'Location অনুমতি বন্ধ আছে—Site settings থেকে Allow করুন।' : 'অবস্থান পাওয়া যায়নি। GPS চালু করে আবার চেষ্টা করুন।');
    }, { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 });
  }

  function copyText(text) {
    var value = clean(text);
    if (!value) return;
    function done() { setStatus('কপি হয়েছে: ' + value); }
    function fail() { setStatus('কপি করা যায়নি — নম্বরটি হাতে লিখে নিন: ' + value); }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(value).then(done, function () { legacyCopy(); });
      return;
    }
    legacyCopy();
    function legacyCopy() {
      var area = document.createElement('textarea');
      area.value = value;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.top = '-1000px';
      document.body.appendChild(area);
      area.select();
      try { document.execCommand('copy') ? done() : fail(); } catch (_) { fail(); }
      document.body.removeChild(area);
    }
  }
  function onAction(event) {
    var copyEl = event.target.closest('[data-copy]');
    if (copyEl) { copyText(copyEl.getAttribute('data-copy')); return; }
    var el = event.target.closest('[data-action]');
    if (!el) return;
    var id = el.getAttribute('data-id');
    var p = byId.get(id);
    if (!p) return;
    var action = el.getAttribute('data-action');
    if (action === 'details') showDetail(p);
    if (action === 'itinerary') toggleItinerary(id);
    if (action === 'visited') toggleVisited(id);
    if (action === 'map') focusPlaceOnMap(p);
  }

  function loadDirectory() {
    if (directoryLoaded || directoryLoading) return;
    directoryLoading = true;
    fetch(DIRECTORY, { cache: 'force-cache' }).then(function (r) {
      if (!r.ok) throw new Error('directory ' + r.status);
      return r.json();
    }).then(function (data) {
      var expanded = expandDirectory(data);
      var i = 0;
      function chunk() {
        addPlaces(expanded.slice(i, i + 500));
        i += 500;
        if (i < expanded.length) { setTimeout(chunk, 0); return; }
        directoryLoaded = true; directoryLoading = false;
        refreshFilters(); applyUrlParams(); refreshStats(); applyFilters(false, false); renderItinerary();
        setStatus(bn(places.length) + 'টি রেকর্ড প্রস্তুত—সব বিহার-ডিরেক্টরিসহ।');
      }
      chunk();
    }).catch(function (err) {
      directoryLoading = false;
      console.warn('[dashboard directory]', err);
      setStatus('মূল স্থানগুলো তৈরি। বিহার-ডিরেক্টরি এখন লোড হয়নি—পেজ রিফ্রেশ করলে আবার চেষ্টা হবে।');
    });
  }
  function scheduleDirectory() {
    if ('requestIdleCallback' in window) requestIdleCallback(loadDirectory, { timeout: 2500 });
    else setTimeout(loadDirectory, 1000);
  }
  function applyUrlParams() {
    try {
      var q = new URLSearchParams(location.search);
      var query = q.get('q') || q.get('search');
      var district = q.get('district');
      var division = q.get('division');
      var upazila = q.get('upazila');
      var category = q.get('category') || q.get('type');
      if (query && els.search) els.search.value = query;
      if (division && els.division) { els.division.value = division; refreshFilters(); }
      if (district && els.district) { els.district.value = district; refreshFilters(); }
      if (upazila && els.upazila) {
        var upOptions = Array.from(els.upazila.options);
        var upMatch = upOptions.find(function (option) { return option.value === upazila; });
        if (!upMatch) {
          var scoped = upOptions.filter(function (option) { return option.value.endsWith('::' + upazila); });
          if (scoped.length === 1) upMatch = scoped[0];
        }
        if (upMatch) els.upazila.value = upMatch.value;
      }
      if (category && els.category) {
        var match = Array.from(els.category.options).find(function (option) { return option.value === category; });
        if (match) els.category.value = category;
      }
    } catch (_) {}
  }

  function bind() {
    if (els.search) els.search.addEventListener('input', function () {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(function () { applyFilters(true, true); }, 160);
    });
    if (els.division) els.division.addEventListener('change', function () {
      if (els.district) els.district.value = 'all';
      if (els.upazila) els.upazila.value = 'all';
      refreshFilters(); applyFilters(true, false);
    });
    if (els.district) els.district.addEventListener('change', function () {
      if (els.upazila) els.upazila.value = 'all';
      refreshFilters(); applyFilters(true, false);
    });
    if (els.upazila) els.upazila.addEventListener('change', function () { applyFilters(true, false); });
    if (els.category) els.category.addEventListener('change', function () { applyFilters(true, false); });
    if (els.coordsOnly) els.coordsOnly.addEventListener('change', function () { applyFilters(true, false); });
    if (els.clear) els.clear.addEventListener('click', function () {
      if (els.search) els.search.value = '';
      if (els.coordsOnly) els.coordsOnly.checked = false;
      if (els.division) els.division.value = 'all';
      if (els.district) els.district.value = 'all';
      if (els.upazila) els.upazila.value = 'all';
      if (els.category) els.category.value = 'all';
      refreshFilters(); applyFilters(true, false);
      if (els.search) els.search.focus();
    });
    if (els.more) els.more.addEventListener('click', function () { visible += PAGE; renderCards(); });
    if (els.grid) els.grid.addEventListener('click', onAction);
    if (els.itineraryList) {
      els.itineraryList.addEventListener('click', function (event) {
        var remove = event.target.closest('[data-trip-remove]');
        if (remove) { toggleItinerary(remove.getAttribute('data-trip-remove')); return; }
        onAction(event);
      });
      els.itineraryList.addEventListener('change', function (event) {
        var id = event.target.getAttribute && event.target.getAttribute('data-trip-visited');
        if (id) toggleVisited(id);
      });
    }
    if (els.dialogBody) els.dialogBody.addEventListener('click', onAction);
    if (els.detail) els.detail.addEventListener('click', onAction);
    var close = $('closePlaceDialog');
    if (close && els.dialog) close.addEventListener('click', function () { els.dialog.close(); });
    if (els.exportBtn) els.exportBtn.addEventListener('click', exportItinerary);
    if (els.clearTrip) els.clearTrip.addEventListener('click', function () {
      if (!itinerary.size) return;
      if (window.confirm('ভ্রমণ তালিকার সব স্থান মুছে ফেলবেন?')) {
        itinerary.clear(); saveStorage(LS_TRIP, []); applyFilters(false, false); renderItinerary();
      }
    });
    if (els.loadMap) els.loadMap.addEventListener('click', ensureMap);
    if (els.locate) els.locate.addEventListener('click', locateMe);
    if (els.refreshMap) els.refreshMap.addEventListener('click', function () {
      ensureMap().then(function (m) { if (m) { try { m.invalidateSize(); if (tileLayer) tileLayer.redraw(); } catch (_) {} updateMarkers(false); } });
    });
    document.addEventListener('click', function (event) {
      var link = event.target.closest('[data-dash-district]');
      if (!link) return;
      var district = link.getAttribute('data-dash-district');
      if (!district || !els.district) return;
      if (!directoryLoaded) loadDirectory();
      if (els.division) els.division.value = 'all';
      if (els.upazila) els.upazila.value = 'all';
      refreshFilters();
      els.district.value = district;
      refreshFilters();
      applyFilters(true, false);
    });
    var mapSection = $('map-section');
    if (mapSection && 'IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        if (entries.some(function (e) { return e.isIntersecting; })) { ensureMap(); observer.disconnect(); }
      }, { rootMargin: '650px 0px' });
      observer.observe(mapSection);
    }
    window.addEventListener('resize', function () {
      if (map) { clearTimeout(markerTimer); markerTimer = setTimeout(function () { try { map.invalidateSize(); } catch (_) {} }, 180); }
    }, { passive: true });
  }

  function boot() {
    bind();
    renderItinerary();
    setStatus('স্থানের মূল তালিকা লোড হচ্ছে…');
    Promise.all([
      fetch(CORE, { cache: 'force-cache' }).then(function (r) {
        if (!r.ok) throw new Error('core ' + r.status);
        return r.json();
      }),
      fetch(GEO, { cache: 'force-cache' }).then(function (r) {
        if (!r.ok) throw new Error('geo ' + r.status);
        return r.json();
      }).catch(function (err) {
        console.warn('[dashboard gazetteer]', err);
        return [];
      })
    ]).then(function (results) {
      var data = results[0];
      geo = Array.isArray(results[1]) ? results[1] : [];
      geoReady = geo.length > 0;
      addPlaces(data.places || []);
      refreshFilters(); refreshStats(); applyUrlParams(); applyFilters(true, false); renderItinerary();
      if (!geoReady) setStatus('স্থানের তালিকা এসেছে, কিন্তু পূর্ণ উপজেলা gazetteer লোড হয়নি।');
      if (location.hash === '#map-section' || location.hash === '#map') ensureMap();
      scheduleDirectory();
    }).catch(function (err) {
      console.error('[dashboard]', err);
      setStatus('স্থানের তালিকা লোড করা যায়নি। ইন্টারনেট সংযোগ দেখে পেজ রিফ্রেশ করুন।');
      if (els.grid) els.grid.innerHTML = '<p class="cb-note">ডেটা লোড হয়নি। <button type="button" class="cb-mini-btn" onclick="location.reload()">↻ আবার চেষ্টা</button></p>';
    });
  }

  window.CharyabhumiDashboard = {
    applyFilters: applyFilters,
    ensureMap: ensureMap,
    getPlaces: function () { return places; },
    getFiltered: function () { return filtered; },
    getGeo: function () { return geo; }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
