'use strict';

(function () {
  var byId = function (id) { return document.getElementById(id); };
  var esc = function (value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (ch) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch];
    });
  };
  var normalize = function (value) {
    return String(value == null ? '' : value).normalize('NFKC').toLocaleLowerCase('bn')
      .replace(/[ঁংঃ]/g, '').replace(/[য়]/g, 'য়').replace(/[\s,.;:/()\-–—_]+/g, '');
  };
  var safeHttp = function (raw) {
    if (!raw) return '';
    try {
      var u = new URL(String(raw), document.baseURI);
      return (u.protocol === 'http:' || u.protocol === 'https:' || u.protocol === 'blob:') ? u.href : '';
    } catch (e) { return ''; }
  };
  var labelName = function (item) { return item && (item.bn_name || item.name_bn || item.bangla_name || item.name) || ''; };
  var adminTree = null;
  var publishedData = [];
  var publishedArchives = [];
  var localArchives = [];
  var objectUrls = new Map();
  var dbPromise = null;
  var geoLoading = false;
  var selectedArchive = null;
  var DB_NAME = 'BangladeshBuddhistHeritageArchive';
  var DB_STORE = 'drafts';
  var MAX_FILE = 35 * 1024 * 1024;
  var MAX_TOTAL = 70 * 1024 * 1024;

  // Add archive navigation and filter help without changing the existing directory records.
  var nav = document.querySelector('#siteNav');
  if (nav && !nav.querySelector('a[href="#historical-archive"]')) {
    var navLink = document.createElement('a');
    navLink.href = '#historical-archive';
    navLink.textContent = 'ঐতিহাসিক আর্কাইভ';
    nav.appendChild(navLink);
  }

  // Location controls are included in index.html. Fallback choices keep the site usable if the
  // optional open administrative reference service is unavailable.
  var divisions = [
    'ঢাকা', 'চট্টগ্রাম', 'রাজশাহী', 'রংপুর', 'খুলনা', 'বরিশাল', 'সিলেট', 'ময়মনসিংহ'
  ];
  function optionHtml(value, label) {
    return '<option value="' + esc(value) + '">' + esc(label) + '</option>';
  }
  function resetSelect(select, placeholder, items) {
    if (!select) return;
    var previous = select.value;
    select.innerHTML = optionHtml('', placeholder) + (items || []).map(function (item) {
      var name = typeof item === 'string' ? item : (item.label || item.name || '');
      var val = typeof item === 'string' ? item : (item.value || item.label || item.name || '');
      return optionHtml(val, name);
    }).join('');
    if (previous && Array.prototype.some.call(select.options, function (opt) { return opt.value === previous; })) {
      select.value = previous;
    }
  }
  function recordDivisionMatches(a, b) {
    var aliases = {
      'চট্টগ্রাম': 'চট্টগ্রাম',
      'চাট্টোগ্রাম': 'চট্টগ্রাম',
      'রাঙ্গামাটি': 'রাঙামাটি',
      'রাঙামাটি': 'রাঙামাটি',
      'বরিশাল': 'বরিশাল',
      'বারিশাল': 'বরিশাল',
      'কুমিল্লা': 'কুমিল্লা',
      'কুমিল্লা জেলা': 'কুমিল্লা'
    };
    var na = normalize(a), nb = normalize(b);
    Object.keys(aliases).forEach(function (key) { if (normalize(key) === na) na = normalize(aliases[key]); });
    Object.keys(aliases).forEach(function (key) { if (normalize(key) === nb) nb = normalize(aliases[key]); });
    return na === nb;
  }
  function selectedDivision() {
    var s = byId('divisionFilter');
    return s && s.value !== 'all' ? s.value : '';
  }
  function districtsForDivision(divisionName) {
    if (adminTree) {
      var d = adminTree.find(function (item) { return recordDivisionMatches(labelName(item), divisionName); });
      return d && Array.isArray(d.districts) ? d.districts : [];
    }
    if (typeof destinations !== 'undefined') {
      var seen = new Set();
      destinations.forEach(function (place) {
        if ((!divisionName || recordDivisionMatches(place.division, divisionName)) && place.district) seen.add(place.district);
      });
      return Array.from(seen).sort(function (a, b) { return a.localeCompare(b, 'bn'); }).map(function (name) {
        return { name: name, bn_name: name, upazilas: [] };
      });
    }
    return [];
  }
  function selectedDistrictObject() {
    var name = byId('districtFilter') && byId('districtFilter').value;
    if (!name) return null;
    return districtsForDivision(selectedDivision()).find(function (item) {
      return recordDivisionMatches(labelName(item), name) || normalize(item.name) === normalize(name);
    }) || null;
  }
  function fallbackAdminOptions(field, districtName) {
    if (typeof destinations === 'undefined') return [];
    var values = new Set();
    destinations.forEach(function (place) {
      if (districtName && !recordDivisionMatches(place.district, districtName)) return;
      if (place[field]) values.add(String(place[field]));
    });
    return Array.from(values).sort(function (a, b) { return a.localeCompare(b, 'bn'); });
  }
  function fillAdminFilters() {
    var division = selectedDivision();
    var districts = districtsForDivision(division).map(function (item) {
      return { value: labelName(item), label: labelName(item) };
    }).filter(function (item) { return item.label; });
    resetSelect(byId('districtFilter'), 'সব জেলা', districts);
    fillLowerFilters();
  }
  function fillLowerFilters() {
    var district = selectedDistrictObject();
    var upazilas = district && Array.isArray(district.upazilas) ? district.upazilas : [];
    var upazilaItems = upazilas.map(function (item) { return { value: labelName(item), label: labelName(item) }; }).filter(function (item) { return item.label; });
    if (!upazilaItems.length) upazilaItems = fallbackAdminOptions('upazila', byId('districtFilter').value).map(function (v) { return { value: v, label: v }; });
    resetSelect(byId('upazilaFilter'), 'সব উপজেলা', upazilaItems);

    var thanaItems = [];
    if (district) {
      var explicitThanas = district.thanas || district.police_stations || district.policeStations || [];
      if (Array.isArray(explicitThanas)) thanaItems = explicitThanas.map(function (item) {
        return { value: labelName(item), label: labelName(item) };
      }).filter(function (item) { return item.label; });
    }
    if (!thanaItems.length) thanaItems = fallbackAdminOptions('thana', byId('districtFilter').value).map(function (v) { return { value: v, label: v }; });
    resetSelect(byId('thanaFilter'), 'সব থানা', thanaItems);

    var selectedUpazila = byId('upazilaFilter').value;
    var up = upazilas.find(function (item) { return recordDivisionMatches(labelName(item), selectedUpazila); });
    var unions = [];
    if (up) {
      (Array.isArray(up.unions) ? up.unions : []).forEach(function (item) {
        unions.push({ value: labelName(item), label: labelName(item) });
      });
      (Array.isArray(up.pourashavas) ? up.pourashavas : []).forEach(function (item) {
        var n = labelName(item);
        if (n) unions.push({ value: n, label: n + ' (পৌরসভা)' });
      });
    }
    if (!unions.length) unions = fallbackAdminOptions('union', byId('districtFilter').value).map(function (v) { return { value: v, label: v }; });
    var unique = [];
    var seen = new Set();
    unions.forEach(function (item) {
      var key = normalize(item.value);
      if (key && !seen.has(key)) { seen.add(key); unique.push(item); }
    });
    resetSelect(byId('unionFilter'), 'সব ইউনিয়ন / পৌরসভা', unique);
  }

  function setInitialDistrictFallback() {
    fillAdminFilters();
  }
  function loadAdminTree() {
    if (geoLoading || adminTree) return Promise.resolve(adminTree);
    geoLoading = true;
    var url = 'https://iqbalhasandev.github.io/bangladesh-geo-json/bangladesh-geo.json';
    var controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var timeout = controller ? setTimeout(function () { controller.abort(); }, 9000) : null;
    return fetch(url, { mode: 'cors', credentials: 'omit', cache: 'force-cache', signal: controller ? controller.signal : undefined })
      .then(function (response) {
        if (!response.ok) throw new Error('প্রশাসনিক তালিকা লোড হয়নি');
        return response.json();
      })
      .then(function (tree) {
        if (!Array.isArray(tree)) throw new Error('প্রশাসনিক তালিকার কাঠামো সঠিক নয়');
        adminTree = tree;
        fillAdminFilters();
        if (byId('adminGeoStatus')) byId('adminGeoStatus').textContent = 'বিভাগ, জেলা, উপজেলা ও ইউনিয়নের রেফারেন্স তালিকা লোড হয়েছে।';
        scheduleDirectoryRender();
        return tree;
      })
      .catch(function () {
        if (byId('adminGeoStatus')) byId('adminGeoStatus').textContent = 'পূর্ণ প্রশাসনিক তালিকা এখন পাওয়া যাচ্ছে না; বর্তমান রেকর্ডের জেলা ও অবস্থান-তথ্য দিয়ে অনুসন্ধান চালু আছে।';
        return null;
      })
      .finally(function () {
        if (timeout) clearTimeout(timeout);
        geoLoading = false;
      });
  }

  function adminFilterMatch(place) {
    var district = byId('districtFilter') && byId('districtFilter').value;
    var upazila = byId('upazilaFilter') && byId('upazilaFilter').value;
    var thana = byId('thanaFilter') && byId('thanaFilter').value;
    var unionName = byId('unionFilter') && byId('unionFilter').value;
    var allText = normalize([
      place.name, place.district, place.division, place.upazila, place.upazilaName,
      place.thana, place.thanaName, place.union, place.unionName, place.municipality,
      place.summary, place.history, place.trip, place.address
    ].join(' '));
    function matches(value, fields) {
      if (!value) return true;
      var actual = fields.map(function (field) { return place[field]; }).filter(Boolean);
      if (actual.some(function (item) { return recordDivisionMatches(item, value); })) return true;
      // Older records often mention locality in their title/history rather than structured columns.
      return allText.indexOf(normalize(value)) !== -1;
    }
    return matches(district, ['district']) &&
      matches(upazila, ['upazila', 'upazilaName']) &&
      matches(thana, ['thana', 'thanaName']) &&
      matches(unionName, ['union', 'unionName', 'municipality']);
  }
  window.__adminFilterMatch = adminFilterMatch;

  function scheduleDirectoryRender() {
    if (typeof window.renderPlaces !== 'function') return;
    window.renderPlaces();
  }
  ['divisionFilter', 'districtFilter', 'upazilaFilter', 'thanaFilter', 'unionFilter'].forEach(function (id) {
    var control = byId(id);
    if (!control) return;
    control.addEventListener('change', function () {
      if (id === 'divisionFilter') fillAdminFilters();
      if (id === 'districtFilter') fillLowerFilters();
      if (id === 'upazilaFilter') fillLowerFilters();
      if (id === 'districtFilter' || id === 'upazilaFilter') {
        var text = byId('adminGeoStatus');
        if (text && !adminTree) text.textContent = 'বর্তমান ডিরেক্টরিতে উপজেলা/থানা/ইউনিয়ন তথ্য সব রেকর্ডে নেই। পূর্ণ রেফারেন্সের জন্য তালিকা লোড হচ্ছে…';
        loadAdminTree();
      }
      scheduleDirectoryRender();
    });
  });
  var oldClear = byId('clearFilters');
  if (oldClear) oldClear.addEventListener('click', function () {
    ['districtFilter', 'upazilaFilter', 'thanaFilter', 'unionFilter'].forEach(function (id) {
      if (byId(id)) byId(id).value = '';
    });
    fillAdminFilters();
    scheduleDirectoryRender();
  });
  setInitialDistrictFallback();

  // Media/file archive uses IndexedDB so chosen files remain private to this browser until exported.
  function openArchiveDb() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise(function (resolve, reject) {
      if (!window.indexedDB) return reject(new Error('এই ব্রাউজারে স্থানীয় আর্কাইভ সংরক্ষণ নেই।'));
      var req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = function () {
        var db = req.result;
        if (!db.objectStoreNames.contains(DB_STORE)) db.createObjectStore(DB_STORE, { keyPath: 'id' });
      };
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { reject(req.error || new Error('আর্কাইভ স্টোরেজ খোলা যায়নি।')); };
    });
    return dbPromise;
  }
  function dbAction(mode, action, value) {
    return openArchiveDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(DB_STORE, mode);
        var store = tx.objectStore(DB_STORE);
        var req = action === 'getAll' ? store.getAll() : action === 'put' ? store.put(value) : store.delete(value);
        req.onsuccess = function () { resolve(req.result); };
        req.onerror = function () { reject(req.error || new Error('আর্কাইভ ডেটা সংরক্ষণ করা যায়নি।')); };
        tx.onerror = function () { reject(tx.error || new Error('আর্কাইভ ডেটা সংরক্ষণ করা যায়নি।')); };
      });
    });
  }
  function createId() {
    return (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : 'archive-' + Date.now() + '-' + Math.random().toString(36).slice(2, 9);
  }
  function fileKind(file) {
    var type = String(file.type || '').toLowerCase();
    var ext = String(file.name || '').split('.').pop().toLowerCase();
    if (type.indexOf('image/') === 0 || /^(jpg|jpeg|png|gif|webp|avif|tif|tiff|bmp)$/.test(ext)) return 'image';
    if (type.indexOf('video/') === 0 || /^(mp4|webm|mov|m4v|ogv)$/.test(ext)) return 'video';
    if (type.indexOf('audio/') === 0 || /^(mp3|wav|ogg|m4a|aac|flac|opus)$/.test(ext)) return 'audio';
    if (type === 'application/pdf' || ext === 'pdf') return 'pdf';
    if (/^(txt|md|csv|log)$/.test(ext) || type.indexOf('text/') === 0) return 'text';
    return 'file';
  }
  function bytesLabel(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
  function makeObjectUrl(file, key) {
    if (!file) return '';
    if (objectUrls.has(key)) return objectUrls.get(key);
    var url = URL.createObjectURL(file);
    objectUrls.set(key, url);
    return url;
  }
  function publishedMediaUrl(attachment) {
    if (!attachment) return '';
    if (attachment.mediaPath) return safeHttp(new URL(attachment.mediaPath.replace(/^\/+/, ''), document.baseURI).href);
    return safeHttp(attachment.mediaUrl || attachment.url || '');
  }
  function safeLink(raw) {
    var url = safeHttp(raw);
    return url && /^https?:/i.test(url) ? url : '';
  }
  function normalizePublishedArchive(post) {
    return {
      id: String(post.id || createId()),
      type: String(post.archiveType || post.resourceType || post.kind || 'নথি'),
      title: String(post.title || 'শিরোনামহীন আর্কাইভ আইটেম'),
      eventDate: String(post.eventDate || post.recordDate || ''),
      captureDate: String(post.captureDate || ''),
      uploadedAt: String(post.uploadedAt || post.createdAt || ''),
      photographer: String(post.photographer || post.credit || ''),
      collector: String(post.collector || post.collection || ''),
      uploader: String(post.uploader || post.author || ''),
      uploaderAddress: String(post.uploaderAddress || post.address || ''),
      district: String(post.district || ''),
      division: String(post.division || ''),
      upazila: String(post.upazila || ''),
      thana: String(post.thana || ''),
      union: String(post.union || ''),
      description: String(post.description || post.summary || ''),
      history: String(post.history || post.body || ''),
      sourceUrl: String(post.sourceUrl || post.source || ''),
      shareUrl: String(post.shareUrl || ''),
      rights: String(post.rights || post.license || ''),
      tags: Array.isArray(post.tags) ? post.tags : [],
      attachments: Array.isArray(post.attachments) ? post.attachments : (post.mediaPath || post.mediaUrl ? [{
        name: post.mediaName || post.title,
        mediaType: post.mediaType || '',
        mediaPath: post.mediaPath || '',
        mediaUrl: post.mediaUrl || '',
        textContent: post.textContent || ''
      }] : []),
      isPublic: true
    };
  }
  function recordText(post) {
    return normalize([
      post.title, post.type, post.eventDate, post.captureDate, post.photographer, post.collector,
      post.uploader, post.uploaderAddress, post.district, post.upazila, post.thana, post.union,
      post.description, post.history, post.sourceUrl, post.shareUrl,
      (post.attachments || []).map(function (att) { return [att.name, att.filename, att.textContent].join(' '); }).join(' '),
      (post.tags || []).join(' ')
    ].join(' '));
  }
  function previewAttachment(att, post, index, local) {
    var fileType = String(att.kind || att.archiveKind || '');
    var name = att.name || att.filename || 'ফাইল';
    var url = att.blob ? makeObjectUrl(att.blob, post.id + '-' + index) : publishedMediaUrl(att);
    var kind = fileType || fileKind({ name: name, type: att.mediaType || att.type || '' });
    if (kind === 'image' && url) return '<a class="archive-media-link" href="' + esc(url) + '" target="_blank" rel="noopener noreferrer"><img class="archive-preview-image" src="' + esc(url) + '" alt="' + esc(name) + '" loading="lazy" decoding="async"></a>';
    if (kind === 'video' && url) return '<video class="archive-preview-video" controls preload="metadata" src="' + esc(url) + '">এই ব্রাউজারে ভিডিও চালানো যায় না। <a href="' + esc(url) + '">ভিডিও ডাউনলোড করুন</a></video>';
    if (kind === 'audio' && url) return '<audio class="archive-preview-audio" controls preload="metadata" src="' + esc(url) + '">এই ব্রাউজারে অডিও চালানো যায় না।</audio>';
    if (kind === 'pdf' && url) return '<div class="archive-pdf-wrap"><iframe src="' + esc(url) + '" title="' + esc(name) + '" loading="lazy"></iframe><a href="' + esc(url) + '" target="_blank" rel="noopener noreferrer">PDF নতুন ট্যাবে খুলুন ↗</a></div>';
    if (kind === 'text' && att.textContent) return '<details class="archive-text"><summary>' + esc(name) + ' — লেখা পড়ুন</summary><pre>' + esc(att.textContent) + '</pre></details>';
    if (url) return '<a class="archive-file-link" href="' + esc(url) + '" target="_blank" rel="noopener noreferrer" download>' + esc(name) + ' · ফাইল খুলুন/ডাউনলোড ↗</a>';
    var link = safeLink(att.url || att.mediaUrl || post.shareUrl || post.sourceUrl);
    return link ? '<a class="archive-file-link" href="' + esc(link) + '" target="_blank" rel="noopener noreferrer">' + esc(name) + ' ↗</a>' : '';
  }
  function renderArchiveCard(post, local) {
    var tags = (post.tags || []).filter(Boolean).slice(0, 8).map(function (tag) { return '<span class="archive-tag">' + esc(tag) + '</span>'; }).join('');
    var location = [post.division, post.district, post.upazila, post.thana, post.union].filter(Boolean).join(' · ');
    var dateLine = [
      post.eventDate ? 'নথি/ঘটনার তারিখ: ' + post.eventDate : '',
      post.captureDate ? 'ছবি তোলার তারিখ: ' + post.captureDate : '',
      post.uploadedAt ? 'আপলোড: ' + String(post.uploadedAt).slice(0, 10) : ''
    ].filter(Boolean).join(' · ');
    var attachments = (post.attachments || []).map(function (att, i) {
      return '<div class="archive-attachment">' + previewAttachment(att, post, i, local) + '<small>' + esc(att.name || att.filename || 'সংযুক্তি') + (att.size ? ' · ' + bytesLabel(Number(att.size)) : '') + '</small></div>';
    }).join('');
    if (!attachments && (post.shareUrl || post.sourceUrl)) {
      var url = safeLink(post.shareUrl || post.sourceUrl);
      if (url) attachments = '<p><a class="archive-file-link" href="' + esc(url) + '" target="_blank" rel="noopener noreferrer">মূল উৎস / শেয়ার লিংক ↗</a></p>';
    }
    return '<article class="archive-card" data-archive-id="' + esc(post.id) + '">' +
      '<div class="archive-card-top"><span class="archive-type">' + esc(post.type) + '</span><span class="archive-visibility ' + (local ? 'archive-local' : 'archive-public') + '">' + (local ? 'শুধু এই ডিভাইসে' : 'প্রকাশিত') + '</span></div>' +
      '<h3>' + esc(post.title) + '</h3>' +
      (location ? '<p class="archive-location">⌖ ' + esc(location) + '</p>' : '') +
      (dateLine ? '<p class="archive-date">' + esc(dateLine) + '</p>' : '') +
      (post.description ? '<p class="archive-description">' + esc(post.description) + '</p>' : '') +
      (post.history ? '<details class="archive-history"><summary>ছবির/নথির ইতিহাস ও বিস্তারিত</summary><p>' + esc(post.history) + '</p></details>' : '') +
      (attachments ? '<div class="archive-attachments">' + attachments + '</div>' : '') +
      ((post.photographer || post.collector || post.uploader || post.uploaderAddress || post.rights) ?
        '<dl class="archive-credit-list">' +
        (post.photographer ? '<div><dt>ছবি/মিডিয়া উত্তোলক</dt><dd>' + esc(post.photographer) + '</dd></div>' : '') +
        (post.collector ? '<div><dt>সংগ্রাহক / সংগ্রহ</dt><dd>' + esc(post.collector) + '</dd></div>' : '') +
        (post.uploader ? '<div><dt>আপলোডকারী</dt><dd>' + esc(post.uploader) + '</dd></div>' : '') +
        (post.uploaderAddress ? '<div><dt>প্রতিষ্ঠান/এলাকা</dt><dd>' + esc(post.uploaderAddress) + '</dd></div>' : '') +
        (post.rights ? '<div><dt>স্বত্ব/অনুমতি</dt><dd>' + esc(post.rights) + '</dd></div>' : '') +
        '</dl>' : '') +
      (tags ? '<div class="archive-tags">' + tags + '</div>' : '') +
      (local ? '<button class="button button-outline archive-delete" type="button" data-archive-delete="' + esc(post.id) + '">খসড়া মুছুন</button>' : '') +
      '</article>';
  }
  function renderArchives() {
    var target = byId('archiveList');
    if (!target) return;
    var q = normalize(byId('archiveSearch').value);
    var type = byId('archiveTypeFilter').value;
    var year = byId('archiveYearFilter').value;
    var all = publishedArchives.map(function (item) { return Object.assign({}, item, { isPublic: true }); })
      .concat(localArchives.map(function (item) { return Object.assign({}, item, { isPublic: false }); }));
    all = all.filter(function (item) {
      var okText = !q || recordText(item).indexOf(q) !== -1;
      var okType = !type || normalize(item.type) === normalize(type);
      var date = item.captureDate || item.eventDate || item.uploadedAt || '';
      var okYear = !year || extractYear(date) === extractYear(year) || latinDigits(date).slice(0, 4) === latinDigits(year).trim();
      return okText && okType && okYear;
    }).sort(function (a, b) {
      return String(b.captureDate || b.eventDate || b.uploadedAt || '').localeCompare(String(a.captureDate || a.eventDate || a.uploadedAt || ''));
    });
    byId('archiveCount').textContent = (all.length).toLocaleString('bn-BD') + 'টি নথি/মিডিয়া';
    byId('archiveEmpty').hidden = all.length > 0;
    target.innerHTML = all.map(function (item) { return renderArchiveCard(item, !item.isPublic); }).join('');
    if (byId('archiveStatus') && !publishedArchives.length && !localArchives.length) {
      byId('archiveStatus').textContent = 'এখনো কোনো আর্কাইভ আইটেম নেই। প্রথমে নথি যোগ করুন অথবা ঐতিহাসিক আর্কাইভের জন্য প্রকাশিত content.json-এ type: "archive" রেকর্ড দিন।';
    }
  }
  function showArchiveStatus(message, kind) {
    var target = byId('archiveStatus');
    if (target) {
      target.textContent = message;
      target.dataset.kind = kind || 'info';
    }
  }
  function loadPublishedArchives() {
    return fetch(new URL('./content.json', document.baseURI), { cache: 'no-store' })
      .then(function (response) { if (!response.ok) throw new Error('আর্কাইভ ফাইল এখন পড়া যাচ্ছে না'); return response.json(); })
      .then(function (loaded) {
        publishedData = Array.isArray(loaded) ? loaded : (loaded && Array.isArray(loaded.posts) ? loaded.posts : []);
        publishedArchives = publishedData.filter(function (post) { return post && post.type === 'archive'; }).map(normalizePublishedArchive);
        renderArchives();
      })
      .catch(function () {
        showArchiveStatus('প্রকাশিত content.json লোড হয়নি; এই ডিভাইসে রাখা খসড়া ব্যবহার করা যাবে।', 'warning');
      });
  }
  function restoreLocalArchives() {
    return dbAction('readonly', 'getAll').then(function (items) {
      localArchives = (items || []).map(function (item) {
        return Object.assign({}, item, { isPublic: false });
      });
      renderArchives();
    }).catch(function () {
      showArchiveStatus('এই ব্রাউজারে স্থায়ী খসড়া সংরক্ষণ পাওয়া যায়নি; অন্য ডিভাইসে কনটেন্ট হারিয়ে যেতে পারে।', 'warning');
      localArchives = [];
    });
  }
  function readSmallText(file) {
    if (fileKind(file) !== 'text' || file.size > 200 * 1024 || typeof file.text !== 'function') return Promise.resolve('');
    return file.text().then(function (content) { return content.slice(0, 200000); }).catch(function () { return ''; });
  }
  function saveArchiveForm(event) {
    event.preventDefault();
    var title = byId('archiveTitle').value.trim();
    var fileInput = byId('archiveFiles');
    var files = Array.prototype.slice.call(fileInput.files || []);
    if (!title) return showArchiveStatus('নথি/ছবির শিরোনাম লিখুন।', 'warning');
    if (files.length > 10) return showArchiveStatus('একটি নথিতে সর্বোচ্চ ১০টি সংযুক্তি যোগ করা যাবে।', 'warning');
    var total = files.reduce(function (sum, file) { return sum + file.size; }, 0);
    if (files.some(function (file) { return file.size > MAX_FILE; }) || total > MAX_TOTAL) {
      return showArchiveStatus('প্রতি ফাইল সর্বোচ্চ ৩৫ MB এবং সব ফাইল মিলিয়ে সর্বোচ্চ ৭০ MB দিন।', 'warning');
    }
    var id = createId();
    Promise.all(files.map(function (file) {
      return readSmallText(file).then(function (textContent) {
        return { name: file.name, mediaType: file.type || 'application/octet-stream', kind: fileKind(file), size: file.size, blob: file, textContent: textContent };
      });
    })).then(function (attachments) {
      var tags = byId('archiveTags').value.split(/[,\n;]/).map(function (tag) { return tag.trim(); }).filter(Boolean).slice(0, 20);
      var item = {
        id: id,
        type: byId('archiveResourceType').value,
        title: title,
        eventDate: byId('archiveEventDate').value,
        captureDate: byId('archiveCaptureDate').value,
        uploadedAt: new Date().toISOString(),
        photographer: byId('archivePhotographer').value.trim(),
        collector: byId('archiveCollector').value.trim(),
        uploader: byId('archiveUploader').value.trim(),
        uploaderAddress: byId('archiveUploaderAddress').value.trim(),
        division: byId('archiveDivision').value,
        district: byId('archiveDistrict').value.trim(),
        upazila: byId('archiveUpazila').value.trim(),
        thana: byId('archiveThana').value.trim(),
        union: byId('archiveUnion').value.trim(),
        description: byId('archiveDescription').value.trim(),
        history: byId('archiveHistory').value.trim(),
        sourceUrl: safeLink(byId('archiveSourceUrl').value.trim()),
        shareUrl: safeLink(byId('archiveShareUrl').value.trim()),
        rights: byId('archiveRights').value.trim(),
        tags: tags,
        attachments: attachments,
        isPublic: false
      };
      return dbAction('readwrite', 'put', item).then(function () {
        localArchives.unshift(item);
        byId('archiveForm').reset();
        renderArchives();
        showArchiveStatus('খসড়া এই ডিভাইসে সংরক্ষিত হয়েছে। সবার জন্য প্রকাশ করতে “প্রকাশনা ZIP তৈরি করুন” ব্যবহার করুন এবং তৈরি ZIP-এর content.json ও assets/archives/ ফাইলগুলো repository-তে যোগ করুন।', 'success');
      });
    }).catch(function () {
      showArchiveStatus('খসড়া সংরক্ষণ করা যায়নি। ব্রাউজারের স্টোরেজ অনুমতি পরীক্ষা করুন; মিডিয়া ফাইলগুলো আপনার ডিভাইসে আছে কি না নিশ্চিত করুন।', 'warning');
    });
  }
  function fileSafeName(name) {
    return String(name || 'media').normalize('NFKC').replace(/[^\p{L}\p{N}._-]+/gu, '-').replace(/^-+|-+$/g, '').slice(0, 90) || 'media';
  }
  function exportArchivePackage() {
    if (!window.JSZip) {
      return showArchiveStatus('ZIP লাইব্রেরি পাওয়া যায়নি। অন্য নথি অক্ষত রেখে প্রকাশনার প্যাক তৈরির জন্য CDN সংযোগ প্রয়োজন; পৃষ্ঠা রিফ্রেশ করে আবার চেষ্টা করুন।', 'warning');
    }
    var items = localArchives.slice();
    if (!items.length) return showArchiveStatus('ZIP তৈরির আগে একটি স্থানীয় আর্কাইভ খসড়া যোগ করুন।', 'warning');
    var zip = new JSZip();
    var merged = publishedData.slice();
    var publishedIds = new Set(merged.map(function (item) { return String(item.id || ''); }));
    items.forEach(function (post) {
      if (publishedIds.has(String(post.id))) return;
      var entry = {
        id: post.id, type: 'archive', archiveType: post.type, title: post.title,
        eventDate: post.eventDate, captureDate: post.captureDate, uploadedAt: post.uploadedAt,
        photographer: post.photographer, collector: post.collector, uploader: post.uploader,
        uploaderAddress: post.uploaderAddress, division: post.division, district: post.district,
        upazila: post.upazila, thana: post.thana, union: post.union,
        description: post.description, summary: post.description, history: post.history,
        sourceUrl: post.sourceUrl, shareUrl: post.shareUrl, rights: post.rights, tags: post.tags || [],
        attachments: []
      };
      (post.attachments || []).forEach(function (att, index) {
        var relPath = 'assets/archives/' + fileSafeName(post.id) + '-' + String(index + 1) + '-' + fileSafeName(att.name);
        entry.attachments.push({
          name: att.name, mediaType: att.mediaType, kind: att.kind,
          size: att.size, mediaPath: relPath, textContent: att.textContent || ''
        });
        if (att.blob) zip.file(relPath, att.blob);
      });
      merged.push(entry);
    });
    zip.file('content.json', JSON.stringify(merged, null, 2) + '\n');
    zip.file('ARCHIVE-PUBLISHING-GUIDE.md',
      '# ঐতিহাসিক আর্কাইভ প্রকাশনা\n\n' +
      '1. এই ZIP Extract করুন।\n' +
      '2. content.json-এ থাকা পুরোনো সব রেকর্ড অক্ষত রাখুন।\n' +
      '3. content.json এবং assets/archives/ ফাইলগুলো একই path-এ GitHub repository-তে commit করুন।\n' +
      '4. GitHub Pages deploy হওয়ার পর আর্কাইভে নতুন নথি দেখা যাবে।\n\n' +
      'উৎস/কপিরাইট/অনুমতি যাচাই করুন। ব্যক্তিগত বাসার ঠিকানা, ফোন, শিশুদের মুখ/ব্যক্তিগত তথ্য বা অনুমতি ছাড়া ব্যক্তিগত নথি প্রকাশ করবেন না।\n');
    showArchiveStatus('প্রকাশনা ZIP তৈরি হচ্ছে…', 'info');
    zip.generateAsync({ type: 'blob' }).then(function (blob) {
      var url = URL.createObjectURL(blob);
      var link = document.createElement('a');
      link.href = url;
      link.download = 'bangladesh-buddhist-heritage-archive.zip';
      document.body.appendChild(link); link.click(); link.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
      showArchiveStatus('ZIP প্রস্তুত। Extract করে content.json এবং assets/archives/ GitHub-এ commit করুন; প্রকাশের আগে সব নথির উৎস, অনুমতি ও ব্যক্তিগত তথ্য যাচাই করুন।', 'success');
    }).catch(function () {
      showArchiveStatus('ZIP তৈরি করা যায়নি। ফাইলের আকার কমিয়ে আবার চেষ্টা করুন।', 'warning');
    });
  }
  function removeLocalArchive(id) {
    dbAction('readwrite', 'delete', id).then(function () {
      localArchives = localArchives.filter(function (item) { return item.id !== id; });
      objectUrls.forEach(function (url, key) {
        if (key.indexOf(id + '-') === 0) { URL.revokeObjectURL(url); objectUrls.delete(key); }
      });
      renderArchives();
      showArchiveStatus('এই ডিভাইসের খসড়া মুছে ফেলা হয়েছে। প্রকাশিত নথি মুছে যায়নি।', 'success');
    }).catch(function () { showArchiveStatus('খসড়াটি মুছতে সমস্যা হয়েছে।', 'warning'); });
  }

  var archiveForm = byId('archiveForm');
  if (archiveForm) archiveForm.addEventListener('submit', saveArchiveForm);
  if (byId('archiveExportZip')) byId('archiveExportZip').addEventListener('click', exportArchivePackage);
  if (byId('archiveSearch')) byId('archiveSearch').addEventListener('input', renderArchives);
  if (byId('archiveTypeFilter')) byId('archiveTypeFilter').addEventListener('change', renderArchives);
  if (byId('archiveYearFilter')) byId('archiveYearFilter').addEventListener('change', renderArchives);
  if (byId('archiveList')) byId('archiveList').addEventListener('click', function (event) {
    var button = event.target.closest('[data-archive-delete]');
    if (button && window.confirm('এই ডিভাইসে রাখা খসড়াটি মুছবেন?')) removeLocalArchive(button.dataset.archiveDelete);
  });
  Promise.all([loadPublishedArchives(), restoreLocalArchives()]).then(function () {
    renderArchives();
  });

  // Load the larger geography reference after the map and directory have started, not before.
  var idle = window.requestIdleCallback || function (cb) { return setTimeout(cb, 1100); };
  idle(function () { loadAdminTree(); });
})();
