/* সহযোগী বৌদ্ধ ঐতিহাসিক সংরক্ষণাগার — চার প্রতিষ্ঠানের সংগ্রহ-রেজিস্ট্রি।
   ডেটা: data/historical-archive-partners.json (tools/build_partner_archive.py দিয়ে তৈরি)
   নীতি: কোনো মিডিয়া ফাইল এখানে কপি হয় না; কেবল মেটাডেটা, লিংক ও (যেখানে
   প্রতিষ্ঠান নিজেই প্রকাশ্যে দেখায়) হালকা থাম্বনেইল। */
(function () {
  'use strict';
  var DATA = 'data/historical-archive-partners.json?v=20261101m';
  /* মালিকের সম্পাদনা ও অনুমোদিত সম্প্রদায়-জমা — আলাদা ফাইল, সাইট বদলাতে হয় না */
  var EDITS = 'data/edits.json?v=20261101m';
  var CONTRIB = 'data/contributions.json?v=20261101m';
  var PAGE = 12;
  var doc = null, items = [], filtered = [], visible = PAGE;
  var state = { collection: 'all', media: 'all', region: 'all', topic: 'all', period: 'all', q: '' };
  var lang = 'bn', searchTimer = null;
  var $ = function (id) { return document.getElementById(id); };
  var els = {
    removed: document.getElementById('paRemoved'),
    collections: $('paCollections'), chips: $('paChips'), regions: $('paRegions'), topics: $('paTopics'), grid: $('paGrid'),
    search: $('paSearch'), period: $('paPeriod'), count: $('paCount'),
    reset: $('paReset'), more: $('paMore'), empty: $('paEmpty'),
    status: $('paStatus'), audio: $('paAudioNote'), stat: $('paTotalStat')
  };
  var FLAG = { bdrc: '☸', bop: '📷', kabc: '🖼️', cbs: '📜', open: '🏛️' };

  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function clean(v) { return String(v == null ? '' : v).trim(); }
  function isEn() { return lang === 'en'; }
  function norm(v) {
    return clean(v).normalize('NFC').toLowerCase().replace(/[\u200c\u200d\ufeff]/g, '').replace(/\s+/g, ' ');
  }
  function num(v) { return isEn() ? Number(v || 0).toLocaleString('en-US') : Number(v || 0).toLocaleString('bn-BD'); }
  function pick(obj, key) {
    if (!obj) return '';
    return isEn() ? clean(obj[key + 'En'] || obj[key + 'Bn']) : clean(obj[key + 'Bn'] || obj[key + 'En']);
  }
  function mediaLabel(key) {
    var m = (doc && doc.mediaTypes || []).filter(function (x) { return x.key === key; })[0];
    return m ? (isEn() ? m.labelEn : m.labelBn) : key;
  }
  function mediaIcon(key) {
    var m = (doc && doc.mediaTypes || []).filter(function (x) { return x.key === key; })[0];
    return m ? m.icon : '☸';
  }
  function rightsLabel(key) {
    var r = doc && doc.rightsLabels && doc.rightsLabels[key];
    return r ? (isEn() ? r.labelEn : r.labelBn) : key;
  }
  function rightsNote(key) {
    var r = doc && doc.rightsLabels && doc.rightsLabels[key];
    return r ? clean(r.noteBn) : '';
  }
  function collectionMeta(key) {
    return (doc && doc.collections || []).filter(function (c) { return c.key === key; })[0] || null;
  }

  /* ---------------- সংগ্রহ কার্ড ---------------- */
  function renderCollections() {
    if (!els.collections || !doc) return;
    els.collections.innerHTML = (doc.collections || []).map(function (c) {
      var count = items.filter(function (i) { return i.collection === c.key; }).length;
      var country = (doc.countryLabels || {})[c.countryKey];
      var pressed = state.collection === c.key;
      return '<button class="pa-coll" type="button" data-collection="' + esc(c.key) + '" aria-pressed="' + (pressed ? 'true' : 'false') + '">' +
        '<span class="pa-coll-flag"><i aria-hidden="true">' + (FLAG[c.key] || '☸') + '</i>' +
        '<span class="pa-coll-country">' + esc(country ? (isEn() ? country.labelEn : country.labelBn) : '') + '</span></span>' +
        '<h3>' + esc(isEn() ? c.nameEn : c.nameBn) + '</h3>' +
        '<p>' + esc(isEn() ? c.orgEn : c.orgBn) + '</p>' +
        '<span class="pa-coll-count">' + num(count) + (isEn() ? ' records on this page' : 'টি রেকর্ড এখানে') + '</span>' +
        '<a class="pa-coll-open" href="' + esc(c.homepage) + '" target="_blank" rel="noopener" onclick="event.stopPropagation()">' +
        (isEn() ? 'Open the archive ↗' : 'মূল আর্কাইভ খুলুন ↗') + '</a>' +
        '</button>';
    }).join('');
  }

  /* ---------------- মিডিয়া চিপ ---------------- */
  function renderChips() {
    if (!els.chips || !doc) return;
    els.chips.innerHTML = '<span class="pa-chips-label">' + (isEn() ? 'type' : 'ধরন') + '</span>' +
      (doc.mediaTypes || []).map(function (m) {
      var count = m.key === 'all' ? items.length : items.filter(function (i) { return i.mediaType === m.key; }).length;
      return '<button class="pa-chip" type="button" data-media="' + esc(m.key) + '" aria-pressed="' + (state.media === m.key ? 'true' : 'false') + '">' +
        '<span aria-hidden="true">' + esc(m.icon) + '</span> ' + esc(isEn() ? m.labelEn : m.labelBn) +
        ' <b>' + num(count) + '</b></button>';
    }).join('');
  }

  var REGION_ICON = { bangladesh: '🇧🇩', southasia: '🛕', himalaya: '🏔️', eastasia: '🏯',
    seasia: '🌾', centralasia: '🐪', europe: '🏛️', america: '🗽', africa: '🌍', oceania: '🦘', pacific: '🌺', latam: '🌎', middleeast: '🕌' };

  function regionLabel(key) {
    var r = ((doc && doc.regions) || []).filter(function (x) { return x.key === key; })[0];
    return r ? (isEn() ? r.labelEn : r.labelBn) : key;
  }

  function renderRegions() {
    if (!els.regions || !doc) return;
    var list = (doc.regions || []).map(function (r) {
      var count = items.filter(function (i) { return (i.region || 'bangladesh') === r.key; }).length;
      return { key: r.key, label: isEn() ? r.labelEn : r.labelBn, count: count };
    }).filter(function (r) { return r.count > 0; });
    els.regions.innerHTML = '<span class="pa-chips-label">' + (isEn() ? 'region' : 'অঞ্চল') + '</span>' +
      list.map(function (r) {
        return '<button class="pa-chip" type="button" data-region="' + esc(r.key) + '" aria-pressed="' + (state.region === r.key ? 'true' : 'false') + '">' +
          '<span aria-hidden="true">' + esc(REGION_ICON[r.key] || '•') + '</span> ' + esc(r.label) +
          ' <b>' + num(r.count) + '</b></button>';
      }).join('');
  }

  var TOPIC_ICON = { protest: '✊' };

  function renderTopics() {
    if (!els.topics || !doc) return;
    var list = (doc.topics || []).map(function (t) {
      var count = items.filter(function (i) { return (i.topic || '') === t.key; }).length;
      return { key: t.key, label: isEn() ? t.labelEn : t.labelBn, icon: t.icon || TOPIC_ICON[t.key] || '•', count: count };
    }).filter(function (t) { return t.count > 0; });
    if (!list.length) { els.topics.hidden = true; return; }
    els.topics.hidden = false;
    els.topics.innerHTML = '<span class="pa-chips-label">' + (isEn() ? 'theme' : 'বিষয়') + '</span>' +
      list.map(function (t) {
        return '<button class="pa-chip" type="button" data-topic="' + esc(t.key) + '" aria-pressed="' + (state.topic === t.key ? 'true' : 'false') + '">' +
          '<span aria-hidden="true">' + esc(t.icon) + '</span> ' + esc(t.label) +
          ' <b>' + num(t.count) + '</b></button>';
      }).join('');
  }

  /* ---------------- কার্ড ---------------- */
  function placeholder(item, meta) {
    var label = isEn() ? (meta ? meta.nameEn : '') : (meta ? meta.nameBn : '');
    return '<div class="pa-thumb"><div class="pa-thumb-ph"><span aria-hidden="true">' + mediaIcon(item.mediaType) + '</span>' +
      '<small>' + esc(label) + '</small>' +
      '<small>' + (isEn() ? 'image at source only' : 'ছবি কেবল মূল উৎসে') + '</small></div>' +
      '<a class="pa-thumb-link" href="' + esc(item.sourceUrl) + '" target="_blank" rel="noopener">' +
      (isEn() ? 'open ↗' : 'খুলুন ↗') + '</a></div>';
  }

  function thumb(item) {
    var meta = collectionMeta(item.collection);
    var poster = clean(item.imageUrl);
    /* নিজের সার্ভারে থাকা অডিও/ভিডিও — সরাসরি প্লেয়ারে (নেটওয়ার্ক ছাড়াও চলে) */
    if (clean(item.videoUrl)) {
      return '<div class="pa-thumb pa-media"><video controls preload="metadata" playsinline poster="' + esc(poster) +
        '" src="' + esc(item.videoUrl) + '" aria-label="' + esc(pick(item, 'title')) + '"></video>' +
        '<span class="pa-media-tag">' + esc(item.durationBn || 'ভিডিও') + '</span></div>';
    }
    if (clean(item.audioUrl)) {
      return '<div class="pa-thumb pa-media pa-audio">' +
        '<img src="' + esc(poster) + '" alt="' + esc(item.imageAltBn || pick(item, 'title')) + '" loading="lazy" decoding="async" ' +
        'data-remote="' + esc(clean(item.imageSourceUrl)) + '" data-id="' + esc(item.id) + '">' +
        '<audio controls preload="metadata" src="' + esc(item.audioUrl) + '" aria-label="' + esc(pick(item, 'title')) + '"></audio>' +
        '<span class="pa-media-tag">🎧 ' + esc(item.durationBn || 'অডিও') + '</span></div>';
    }
    if (item.mediaType === 'video' && clean(item.embedUrl)) {
      return '<div class="pa-video-frame"><iframe src="' + esc(item.embedUrl) + '" title="' + esc(pick(item, 'title')) +
        '" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div>';
    }
    var src = clean(item.imageUrl);
    if (!src) return placeholder(item, meta);
    var remote = clean(item.imageSourceUrl);
    var strip = (item.aspect || 0) >= 5 ? ' pa-strip' : '';
    var img = '<img src="' + esc(src) + '" alt="' + esc(item.imageAltBn || pick(item, 'title')) + '" loading="lazy" decoding="async" ' +
      'data-remote="' + esc(remote) + '" data-id="' + esc(item.id) + '">';
    var href = clean(item.sourceUrl);
    if (!href) return '<div class="pa-thumb js-thumb' + strip + '">' + img + '</div>';
    return '<a class="pa-thumb js-thumb' + strip + '" href="' + esc(href) + '" target="_blank" rel="noopener">' + img +
      '<span class="pa-thumb-link">' + (isEn() ? 'open at source ↗' : 'মূল উৎসে দেখুন ↗') + '</span></a>';
  }

  /* স্থানীয় থাম্বনেইল না পেলে একবার রিমোট চেষ্টা, তারপর প্লেসহোল্ডার (কখনো ফাঁকা বাক্স নয়) */
  /* ছবি-লোডের হিসাব: কতগুলো ছবি দেখা গেল, কতগুলো হলো না — ব্যবহারকারীকে সৎভাবে জানানো হয় */
  var imgStats = { ok: 0, fail: 0 };
  function reportImages() {
    var bar = document.getElementById('paImgReport');
    if (!bar) return;
    var total = imgStats.ok + imgStats.fail;
    if (!total) { bar.hidden = true; return; }
    bar.hidden = false;
    if (imgStats.fail === 0) {
      bar.className = 'pa-imgreport ok';
      bar.innerHTML = '<span aria-hidden="true">✅</span> ' + (isEn()
        ? 'All ' + num(imgStats.ok) + ' thumbnails loaded.'
        : 'এই পাতায় ' + num(imgStats.ok) + 'টি ছবির সবগুলোই লোড হয়েছে।');
      return;
    }
    var hard = imgStats.ok === 0;
    bar.className = 'pa-imgreport' + (hard ? ' bad' : ' warn');
    bar.innerHTML = '<span aria-hidden="true">' + (hard ? '⛔' : '⚠️') + '</span> <strong>' +
      (isEn() ? num(imgStats.fail) + ' of ' + num(total) + ' images did not load.'
              : num(total) + 'টি ছবির মধ্যে ' + num(imgStats.fail) + 'টি লোড হয়নি।') + '</strong> ' +
      (isEn()
        ? 'Most likely the image folders are missing on the server — upload <code>assets/archive/partners/</code> and <code>assets/archive/commons/</code> (they must sit exactly there), then hard-reload with Ctrl+Shift+R.'
        : 'সম্ভবত সার্ভারে ছবির ফোল্ডার দুটি নেই — <code>assets/archive/partners/</code> আর <code>assets/archive/commons/</code> হুবহু এই পথে আপলোড করুন, তারপর Ctrl+Shift+R (মোবাইলে হার্ড রিলোড) দিন। ছবিগুলো এক পাতায় দেখতে <a href="archive-contact-sheet.jpg">এই কনট্যাক্ট শিট</a> খুলুন।');
  }

  function wireThumbs(scope) {
    Array.prototype.forEach.call((scope || document).querySelectorAll('img[data-remote]'), function (img) {
      if (img.getAttribute('data-wired')) return;
      img.setAttribute('data-wired', '1');
      img.addEventListener('load', function () {
        imgStats.ok += 1;
        reportImages();
      });
      img.addEventListener('error', function handle() {
        var remote = img.getAttribute('data-remote') || '';
        if (remote && img.getAttribute('src') !== remote) {
          img.setAttribute('src', remote);
          img.removeAttribute('data-remote');
          return;
        }
        img.removeEventListener('error', handle);
        imgStats.fail += 1;
        reportImages();
        var item = items.filter(function (i) { return i.id === img.getAttribute('data-id'); })[0];
        var host = img.closest('.pa-thumb');
        if (item && host) host.outerHTML = placeholder(item, collectionMeta(item.collection));
      });
    });
  }

  function card(item, index) {
    var meta = collectionMeta(item.collection);
    var strict = item.rights === 'institution-strict';
    var rows = [
      [isEn() ? 'Collection no.' : 'সংগ্রহ-নম্বর', item.accession],
      [isEn() ? 'Creator / source' : 'স্রষ্টা / সূত্র', item.creatorBn],
      [isEn() ? 'Material / format' : 'উপাদান / ধরন', item.materialBn],
      [isEn() ? 'Language' : 'ভাষা', item.language],
      [isEn() ? 'Rights' : 'অধিকার', rightsLabel(item.rights) + ' — ' + rightsNote(item.rights)],
      [isEn() ? 'Keywords' : 'কীওয়ার্ড', (item.keywords || []).join(' · ')]
    ].filter(function (r) { return clean(r[1]); });
    return '<article class="pa-card" data-id="' + esc(item.id) + '" style="animation-delay:' + Math.min(index, 10) * 30 + 'ms">' +
      thumb(item) +
      '<div class="pa-body">' +
      '<div class="pa-topline"><span class="pa-type"><span aria-hidden="true">' + mediaIcon(item.mediaType) + '</span> ' + esc(mediaLabel(item.mediaType)) + '</span>' +
      '<span class="pa-src">' + esc(item.community ? (isEn() ? 'approved contribution' : 'অনুমোদিত সম্প্রদায়-জমা')
        : (meta ? (isEn() ? meta.nameEn : meta.nameBn).split('—')[0].trim() : '')) + '</span></div>' +
      (item.edited ? '<p class="pa-edited">✏️ ' + (isEn() ? 'edited by the archive owner' : 'সংরক্ষণাগারের মালিক সম্পাদনা করেছেন') + '</p>' : '') +
      '<h3>' + esc(pick(item, 'title')) + '</h3>' +
      (clean(item.origTitle) && item.origTitle !== item.titleBn ? '<p class="pa-orig">' + esc(item.origTitle) + '</p>' : '') +
      '<p class="pa-desc">' + esc(pick(item, 'desc')) + '</p>' +
      '<p class="pa-meta"><span>◷ ' + esc(item.dateBn) + '</span><span>◉ ' + esc(item.placeBn) + '</span></p>' +
      '<span class="pa-rights' + (strict ? ' strict' : '') + '"><span aria-hidden="true">' + (strict ? '🔒' : 'ⓘ') + '</span> ' + esc(rightsLabel(item.rights)) + '</span>' +
      (clean(item.licenceLabel)
        ? '<a class="pa-lic" href="' + esc(item.licenceUrl || item.sourceUrl) + '" target="_blank" rel="noopener"><span aria-hidden="true">⚖</span> ' + esc(item.licenceLabel) + (isEn() ? ' licence ↗' : ' লাইসেন্স ↗') + '</a>'
        : '') +
      '<details class="pa-details"><summary>' + (isEn() ? 'Full description, provenance & rights' : 'বিস্তারিত বিবরণ, সূত্র ও অধিকার') + '</summary><dl>' +
      rows.map(function (r) { return '<dt>' + esc(r[0]) + '</dt><dd>' + esc(r[1]) + '</dd>'; }).join('') +
      '</dl></details>' +
      '<div class="pa-actions"><a class="primary" href="' + esc(item.sourceUrl) + '" target="_blank" rel="noopener">' +
      (isEn() ? 'Open at source ↗' : 'মূল উৎসে দেখুন ↗') + '</a>' +
      (meta ? '<a href="' + esc(meta.homepage) + '" target="_blank" rel="noopener">' + (isEn() ? 'Institution' : 'প্রতিষ্ঠান') + '</a>' : '') +
      '</div></div></article>';
  }

  /* ---------------- ছাঁকনি ---------------- */
  function inPeriod(item) {
    if (state.period === 'all') return true;
    return item.period === state.period;
  }
  function apply() {
    var tokens = norm(state.q) ? norm(state.q).split(' ').filter(Boolean) : [];
    filtered = items.filter(function (item) {
      if (state.collection !== 'all' && item.collection !== state.collection) return false;
      if (state.media !== 'all' && item.mediaType !== state.media) return false;
      if (state.region !== 'all' && (item.region || 'bangladesh') !== state.region) return false;
      if (state.topic !== 'all' && (item.topic || '') !== state.topic) return false;
      if (!inPeriod(item)) return false;
      if (!tokens.length) return true;
      var hay = norm([item.titleBn, item.titleEn, item.origTitle, item.descBn, item.descEn, item.dateBn,
        item.placeBn, item.creatorBn, item.accession, (item.keywords || []).join(' ')].join(' '));
      return tokens.every(function (t) { return hay.indexOf(t) > -1; });
    });
    visible = PAGE;
    render();
  }
  function render() {
    if (!els.grid) return;
    var shown = filtered.slice(0, visible);
    els.grid.innerHTML = shown.map(card).join('');
    wireThumbs(els.grid);
    if (els.count) {
      els.count.innerHTML = '<strong>' + num(filtered.length) + '</strong>' + (isEn() ? ' of ' + num(items.length) + ' records' : ' / ' + num(items.length) + 'টি রেকর্ড');
    }
    if (els.empty) {
      els.empty.hidden = filtered.length > 0;
      if (!filtered.length) {
        if (state.media === 'audio') {
          var note = doc && doc.audioNote;
          els.empty.innerHTML = '<strong>' + esc(note ? note.titleBn : '') + '</strong><br>' + esc(note ? note.bodyBn : '') +
            '<br><a href="' + esc(note ? note.libraryUrl : 'library.html') + '">' + (isEn() ? 'Open the media library →' : 'মিডিয়া লাইব্রেরি খুলুন →') + '</a>';
        } else {
          els.empty.innerHTML = isEn() ? 'Nothing matches this combination. Try clearing the filters.' : 'এই ছাঁকনিতে কিছু মেলেনি — ছাঁকনি মুছে আবার চেষ্টা করুন।';
        }
      }
    }
    if (els.more) {
      var left = filtered.length - shown.length;
      els.more.hidden = left <= 0;
      els.more.textContent = isEn() ? 'Show ' + num(Math.min(PAGE, left)) + ' more' : 'আরও ' + num(Math.min(PAGE, left)) + 'টি দেখুন';
    }
    if (els.stat) els.stat.textContent = num(items.length);
    if (els.removed && doc && doc.removedNotes) {
      var rm = doc.removedNotes;
      els.removed.innerHTML = '<details class="pa-removed"><summary><span aria-hidden="true">🗂️</span> ' +
        esc(rm.titleBn) + ' (' + num(rm.items.length) + ')</summary><p>' + esc(rm.bodyBn) + '</p><ul>' +
        rm.items.map(function (r) {
          return '<li><a href="' + esc(r.sourceUrl) + '" target="_blank" rel="noopener">' + esc(r.titleBn) + '</a>' +
            ' <span>— ' + esc(r.reasonBn) + '</span></li>';
        }).join('') + '</ul></details>';
    }
    if (els.audio && doc && doc.audioNote) {
      els.audio.innerHTML = '<span aria-hidden="true">🎧</span><div><h3>' + esc(doc.audioNote.titleBn) + '</h3><p>' +
        esc(doc.audioNote.bodyBn) + '</p><a href="' + esc(doc.audioNote.libraryUrl) + '">মিডিয়া লাইব্রেরি খুলুন →</a>' +
        '<a href="' + esc(doc.audioNote.submitUrl) + '">নিজের রেকর্ডিং জমা দিন →</a></div>';
    }
  }

  /* ---------------- বাঁধন ---------------- */
  function syncButtons() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-collection]'), function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-collection') === state.collection ? 'true' : 'false');
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-media]'), function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-media') === state.media ? 'true' : 'false');
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-region]'), function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-region') === state.region ? 'true' : 'false');
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-topic]'), function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-topic') === state.topic ? 'true' : 'false');
    });
  }
  function bind() {
    if (els.collections) {
      els.collections.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-collection]');
        if (!btn) return;
        var key = btn.getAttribute('data-collection');
        state.collection = state.collection === key ? 'all' : key;
        syncButtons(); apply();
        if (els.grid && els.grid.scrollIntoView) els.grid.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      });
    }
    if (els.chips) {
      els.chips.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-media]');
        if (!btn) return;
        state.media = btn.getAttribute('data-media');
        syncButtons(); apply();
      });
    }
    if (els.regions) {
      els.regions.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-region]');
        if (!btn) return;
        var key = btn.getAttribute('data-region');
        state.region = (state.region === key) ? 'all' : key;
        syncButtons(); apply();
      });
    }
    if (els.topics) {
      els.topics.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-topic]');
        if (!btn) return;
        var key = btn.getAttribute('data-topic');
        state.topic = (state.topic === key) ? 'all' : key;
        syncButtons(); apply();
      });
    }
    if (els.search) {
      els.search.addEventListener('input', function () {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(function () { state.q = els.search.value; apply(); }, 160);
      });
    }
    if (els.period) {
      els.period.addEventListener('change', function () { state.period = els.period.value; apply(); });
    }
    if (els.reset) {
      els.reset.addEventListener('click', function () {
        state = { collection: 'all', media: 'all', region: 'all', topic: 'all', period: 'all', q: '' };
        if (els.search) els.search.value = '';
        if (els.period) els.period.value = 'all';
        syncButtons(); apply();
      });
    }
    if (els.more) {
      els.more.addEventListener('click', function () { visible += PAGE; render(); });
    }
    document.addEventListener('cb:language', function (e) {
      lang = e.detail && e.detail.code === 'en' ? 'en' : 'bn';
      renderCollections(); renderChips(); renderRegions(); renderTopics();
      if (els.period && doc) {
        var cur = state.period;
        els.period.innerHTML = (doc.periods || []).map(function (p) {
          return '<option value="' + esc(p.key) + '">' + esc(isEn() ? p.labelEn : p.labelBn) + '</option>';
        }).join('');
        els.period.value = cur;
      }
      render(); syncButtons();
    });
  }

  var EDITABLE = ['titleBn', 'titleEn', 'descBn', 'descEn', 'dateBn', 'placeBn', 'creatorBn',
    'imageUrl', 'imageAltBn', 'imageCreditBn', 'licenceLabel', 'licenceBn', 'licenceUrl', 'rights',
    'region', 'period', 'mediaType', 'sourceUrl', 'keywords', 'accession', 'language', 'materialBn'];

  function loadJSON(url) {
    return fetch(url, { cache: 'no-store' }).then(function (r) {
      if (!r.ok) throw new Error(url + ' ' + r.status);
      return r.json();
    }).catch(function () { return null; });
  }

  /* মালিকের সম্পাদনা + অনুমোদিত সম্প্রদায়-জমা মিলিয়ে দেখা */
  function applyOverlay() {
    return Promise.all([loadJSON(EDITS), loadJSON(CONTRIB)]).then(function (res) {
      var edits = res[0] && res[0].records ? res[0].records : {};
      var contrib = res[1] && Array.isArray(res[1].items) ? res[1].items : [];
      var byId = {};
      items.forEach(function (i) { byId[i.id] = i; });
      Object.keys(edits).forEach(function (id) {
        var t = edits[id];
        var item = byId[id];
        if (!item || !t) return;
        EDITABLE.forEach(function (k) {
          if (Object.prototype.hasOwnProperty.call(t, k)) item[k] = t[k];
        });
        item.edited = true;
      });
      contrib.forEach(function (c) {
        if (!c || !c.id || byId[c.id]) return;
        var copy = {};
        Object.keys(c).forEach(function (k) { copy[k] = c[k]; });
        copy.community = true;
        copy.verification = 'community-approved';
        if (!copy.rights) copy.rights = 'open-license';
        items.push(copy);
        byId[copy.id] = copy;
      });
      return { edits: Object.keys(edits).length, contrib: contrib.length };
    });
  }

  function boot() {
    if (!els.grid) return;
    bind();
    fetch(DATA, { cache: 'force-cache' }).then(function (r) {
      if (!r.ok) throw new Error('partners ' + r.status);
      return r.json();
    }).then(function (data) {
      doc = data;
      items = Array.isArray(data.items) ? data.items : [];
      if (els.period) {
        els.period.innerHTML = (data.periods || []).map(function (p) {
          return '<option value="' + esc(p.key) + '">' + esc(p.labelBn) + '</option>';
        }).join('');
      }
      if (els.status) {
        els.status.textContent = 'সূত্র যাচাই: ' + data.generated_at + ' · ' + num(items.length) +
          'টি রেকর্ডের পাতা, ভিউয়ার ও থাম্বনেইল সরাসরি খুলে দেখা হয়েছে (HTTP ২০০)। কোনো ফাইল এখানে সংরক্ষণ করা হয়নি।';
      }
      return applyOverlay().then(function (ov) {
        renderCollections(); renderChips(); renderRegions(); renderTopics(); apply();
        if (ov && (ov.edits || ov.contrib) && els.status) {
          els.status.textContent += (isEn()
            ? ' · owner edits: ' + ov.edits + ', approved contributions: ' + ov.contrib
            : ' · মালিকের সম্পাদনা: ' + num(ov.edits) + ', অনুমোদিত সম্প্রদায়-জমা: ' + num(ov.contrib));
        }
      });
    }).catch(function (error) {
      console.error('[partner archive]', error);
      if (els.grid) els.grid.innerHTML = '<p class="pa-empty">সহযোগী সংগ্রহের ডেটা লোড হয়নি। পেজ রিফ্রেশ করে আবার চেষ্টা করুন।</p>';
      if (els.status) els.status.textContent = 'ডেটা লোড ব্যর্থ — data/historical-archive-partners.json পাওয়া যায়নি।';
    });
  }

  window.CharyabhumiPartnerArchive = {
    getItems: function () { return items; },
    getFiltered: function () { return filtered; },
    setMedia: function (k) { state.media = k; syncButtons(); apply(); },
    setRegion: function (k) { state.region = k; syncButtons(); apply(); },
    setTopic: function (k) { state.topic = k; syncButtons(); apply(); },
    getRegions: function () { return (doc && doc.regions) || []; },
    setCollection: function (k) { state.collection = k; syncButtons(); apply(); }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
