/* বুদ্ধ ও বৌদ্ধ চরিত্রের নির্মাতা-আর্কাইভ — data/heritage-creators.json থেকে রেন্ডার */
(function () {
  'use strict';

  var DATA_URL = 'data/heritage-creators.json?v=20261023c';
  var LIB_URL = 'data/heritage-library.json?v=20261022a';
  var root = document.getElementById('creator-archive');
  if (!root) return;

  var FALLBACK_SVG = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">' +
    '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
    '<stop offset="0" stop-color="#f6e5c3"/><stop offset="1" stop-color="#e5cfa9"/>' +
    '</linearGradient></defs><rect width="800" height="600" fill="url(#g)"/>' +
    '<circle cx="400" cy="255" r="105" fill="none" stroke="#8f3d08" stroke-width="8"/>' +
    '<text x="400" y="305" text-anchor="middle" font-size="110" fill="#8f3d08">☸</text>' +
    '<text x="400" y="430" text-anchor="middle" font-family="sans-serif" font-size="27" fill="#5d3b20">ছবিটি আপাতত লোড হয়নি</text>' +
    '<text x="400" y="470" text-anchor="middle" font-family="sans-serif" font-size="19" fill="#80644c">Wikimedia Commons ফাইল লিংকটি নিচে দেওয়া আছে</text></svg>'
  );

  window.__caImgError = function (img) {
    var stage = Number(img.dataset.fallbackStage || 0);
    var file = img.dataset.caFile || '';
    if (img.dataset.caLocal === '1') { img.onerror = null; img.src = FALLBACK_SVG; return; }
    if (stage === 0 && file) {
      img.dataset.fallbackStage = '1';
      img.src = 'https://commons.wikimedia.org/wiki/Special:FilePath/' + encodeURIComponent(file) + '?width=500';
      return;
    }
    img.onerror = null;
    img.src = FALLBACK_SVG;
  };

  var els = {
    subtitle: document.getElementById('caSubtitle'),
    intro: document.getElementById('caIntro'),
    stats: document.getElementById('caStats'),
    search: document.getElementById('caSearch'),
    media: document.getElementById('caMedia'),
    sort: document.getElementById('caSort'),
    verified: document.getElementById('caVerified'),
    reset: document.getElementById('caReset'),
    regions: document.getElementById('caRegionFilters'),
    categories: document.getElementById('caCategoryFilters'),
    relations: document.getElementById('caRelationFilters'),
    count: document.getElementById('caCount'),
    grid: document.getElementById('caGrid'),
    empty: document.getElementById('caEmpty'),
    method: document.getElementById('caMethod'),
    dialog: document.getElementById('creatorDialog'),
    dialogBody: document.getElementById('caDialogBody')
  };

  var state = {
    q: '',
    region: 'all',
    category: 'all',
    relation: 'all',
    media: 'all',
    sort: 'curated',
    verifiedOnly: false,
    data: null,
    library: {},
    lastTrigger: null,
    activeId: null
  };

  var MEDIA_META = {
    pdf: { icon: '📄', label: 'PDF / মূল পাঠ' },
    book: { icon: '📚', label: 'বই / গ্রন্থপঞ্জি' },
    audio: { icon: '🎧', label: 'অডিও' },
    video: { icon: '🎬', label: 'ভিডিও / চলচ্চিত্র' },
    artwork: { icon: '🖼️', label: 'শিল্পকর্ম' },
    article: { icon: '🔗', label: 'নিবন্ধ / ক্যাটালগ' }
  };
  var IMAGE_TYPES = {
    portrait: 'প্রতিকৃতি',
    artwork: 'শিল্পকর্ম',
    manuscript: 'পাণ্ডুলিপি',
    sculpture: 'ভাস্কর্য',
    context: 'প্রেক্ষাপটচিত্র',
    'film-still': 'চলচ্চিত্রের স্থিরচিত্র',
    performance: 'পরিবেশনার ছবি',
    illustration: 'প্রতীকী চিত্র',
    photograph: 'আলোকচিত্র'
  };
  var QUOTE_STATUS = {
    verified: '✅ যাচাইকৃত উক্তি',
    textual: '📜 মূলপাঠ থেকে',
    misattributed: '⚠️ জনপ্রিয় কিন্তু ভুল আরোপণ',
    unverified: '❔ অযাচাইকৃত'
  };
  var KINDS = {
    person: 'ব্যক্তি',
    work: 'কর্ম',
    character: 'চরিত্র',
    'quotation-check': 'উক্তিযাচাই'
  };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function bn(n) {
    return Number(n || 0).toLocaleString('bn-BD');
  }

  function norm(s) {
    return String(s || '')
      .normalize('NFKC')
      .toLocaleLowerCase('bn-BD')
      .replace(/[.,;:!?()[\]{}"'“”‘’|/\\<>@#$%^&*+=~`_-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function safeUrl(url) {
    var u = String(url || '').trim();
    if (/^https?:\/\//i.test(u)) return u;
    if (/^(library|culture|history|index|contribution)\.html([?#].*)?$/i.test(u)) return u;
    if (/^assets\/[A-Za-z0-9][A-Za-z0-9._\/-]*$/.test(u) && u.indexOf('..') === -1) return u;
    if (/^#[a-z0-9\-_/]+$/i.test(u)) return u;
    return '#creator-archive';
  }

  function isExternal(url) {
    return /^https?:\/\//i.test(String(url || ''));
  }

  function boldify(text) {
    return esc(text).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  }

  function tax(group, key) {
    var t = state.data && state.data.taxonomy && state.data.taxonomy[group];
    return (t && t[key]) || key;
  }

  function imageFile(record) {
    var page = record.image && record.image.page;
    if (page && page.indexOf('/File:') > -1) {
      try {
        return decodeURIComponent(page.split('/File:')[1].split(/[?#]/)[0]);
      } catch (e) {
        return page.split('/File:')[1];
      }
    }
    return (record.image && record.image.file) || '';
  }

  function imageHtml(record, detail) {
    var im = record.image || {};
    var file = imageFile(record);
    var width = im.width || 500;
    var height = im.height || 375;
    var style = 'object-position:' + (im.objectPosition || '50% 35%');
    if (im.objectFit === 'contain' || im.objectFit === 'cover') style += ';object-fit:' + im.objectFit;
    if (/^scale\(\d+(?:\.\d+)?\)$/.test(im.transform || '')) style += ';transform:' + im.transform;
    if (/^\d+(?:\.\d+)?%\s+\d+(?:\.\d+)?%$/.test(im.transformOrigin || '')) style += ';transform-origin:' + im.transformOrigin;
    if (/^(?:brightness|contrast|saturate)\(\d+(?:\.\d+)?\)(?:\s+(?:brightness|contrast|saturate)\(\d+(?:\.\d+)?\))*$/.test(im.filter || '')) style += ';filter:' + im.filter;
    return '<figure class="ca-figure">' +
      '<span class="ca-photo-wrap">' +
      '<img src="' + esc(safeUrl(im.url)) + '" alt="' + esc(im.alt || record.titleBn) + '"' +
      ' width="' + esc(width) + '" height="' + esc(height) + '"' +
      ' style="' + esc(style) + '"' +
      (detail ? '' : ' loading="lazy" decoding="async"') +
      ' referrerpolicy="no-referrer" data-ca-file="' + esc(file) + '"' +
      (/^assets\//.test(String(im.url || '')) ? ' data-ca-local="1"' : '') +
      ' onerror="window.__caImgError && window.__caImgError(this)">' +
      '<span class="ca-image-type">🖼️ ' + esc(IMAGE_TYPES[im.type] || 'ছবি') + '</span>' +
      '</span>' +
      '<figcaption>' + esc(im.captionBn || '') +
      '<br><span>ছবি: ' + esc(im.credit || 'Wikimedia Commons') +
      (im.license ? ' · লাইসেন্স: ' + esc(im.license) : '') +
      ' · <a href="' + esc(safeUrl(im.page)) + '" target="_blank" rel="noopener noreferrer">ফাইলের মূল পৃষ্ঠা</a></span>' +
      '</figcaption></figure>';
  }

  function mediaKinds(record) {
    var seen = {};
    (record.media || []).forEach(function (m) { seen[m.kind] = true; });
    return Object.keys(MEDIA_META).filter(function (k) { return seen[k]; });
  }

  function quoteText(record) {
    if (!record.quote) return '';
    return [record.quote.textBn, record.quote.textOriginal, record.quote.attribution, record.quote.caution].join(' ');
  }

  function searchHaystack(record) {
    return norm([
      record.titleBn,
      record.titleEn,
      record.creatorBn,
      record.creatorEn,
      (record.roles || []).join(' '),
      tax('regions', record.region),
      tax('periods', record.period),
      record.years,
      record.language,
      (record.categories || []).map(function (c) { return tax('categories', c); }).join(' '),
      record.buddhistSubject,
      (record.characters || []).join(' '),
      record.featuredWork,
      tax('relationTypes', record.relationType),
      record.summary,
      record.significance,
      (record.details || []).join(' '),
      (record.works || []).map(function (w) { return [w.title, w.year, w.medium, w.note].join(' '); }).join(' '),
      quoteText(record),
      (record.media || []).map(function (m) { return [m.kind, m.label, m.note].join(' '); }).join(' '),
      (record.aliases || []).join(' ')
    ].join(' '));
  }

  function isReliableQuote(record) {
    return !!(record.quote && (record.quote.status === 'verified' || record.quote.status === 'textual'));
  }

  function matches(record) {
    if (state.region !== 'all' && record.region !== state.region) return false;
    if (state.category !== 'all' && (record.categories || []).indexOf(state.category) === -1) return false;
    if (state.relation !== 'all' && record.relationType !== state.relation) return false;
    if (state.media !== 'all' && mediaKinds(record).indexOf(state.media) === -1) return false;
    if (state.verifiedOnly && !isReliableQuote(record)) return false;
    if (!state.q) return true;

    var hay = record._hay || (record._hay = searchHaystack(record));
    return state.q.split(' ').filter(Boolean).every(function (token) {
      return hay.indexOf(token) > -1;
    });
  }

  function sorted(records) {
    var out = records.slice();
    if (state.sort === 'oldest') {
      out.sort(function (a, b) { return (a.yearSort || 0) - (b.yearSort || 0); });
    } else if (state.sort === 'newest') {
      out.sort(function (a, b) { return (b.yearSort || 0) - (a.yearSort || 0); });
    } else if (state.sort === 'title') {
      out.sort(function (a, b) { return String(a.titleBn).localeCompare(String(b.titleBn), 'bn'); });
    }
    return out;
  }

  function cardHtml(record) {
    var categories = (record.categories || []).map(function (c) {
      return '<span class="ca-pill">' + esc(tax('categories', c)) + '</span>';
    }).join('');
    var quotePill = '';
    if (record.quote) {
      quotePill = '<span class="ca-pill quote' + (record.quote.status === 'misattributed' ? ' caution' : '') + '">' +
        esc(QUOTE_STATUS[record.quote.status] || 'উক্তি') + '</span>';
    }
    var badges = mediaKinds(record).map(function (kind) {
      var count = (record.media || []).filter(function (m) { return m.kind === kind; }).length;
      return '<span class="ca-media-badge">' + MEDIA_META[kind].icon + ' ' + esc(MEDIA_META[kind].label) + ' ' + bn(count) + '</span>';
    }).join('');

    return '<article class="ca-card" id="creator-' + esc(record.id) + '" data-creator-card="' + esc(record.id) + '">' +
      imageHtml(record, false) +
      '<div class="ca-body">' +
      '<div class="ca-topline"><span class="ca-pill relation">' + esc(tax('relationTypes', record.relationType)) + '</span>' + quotePill + '</div>' +
      '<h3>' + esc(record.titleBn) + '</h3>' +
      (record.titleEn ? '<p class="ca-english">' + esc(record.titleEn) + '</p>' : '') +
      '<p class="ca-creator"><strong>' + esc(record.creatorBn) + '</strong>' + (record.creatorEn ? ' · ' + esc(record.creatorEn) : '') + '</p>' +
      '<p class="ca-roles">' + esc((record.roles || []).join(' · ')) + '</p>' +
      '<div class="ca-topline">' + categories + '</div>' +
      '<p class="ca-subject">☸ ' + esc(record.buddhistSubject) + '</p>' +
      '<p class="ca-summary">' + esc(record.summary) + '</p>' +
      '<p class="ca-meta"><span>📍 ' + esc(tax('regions', record.region)) + '</span><span>🕰️ ' + esc(record.years) + '</span><span>🎞️ প্রধান কাজ: ' + esc(record.featuredWork) + '</span></p>' +
      '<div class="ca-media-badges" aria-label="উপলব্ধ মিডিয়া">' + badges + '</div>' +
      '<button type="button" class="ca-details-btn" data-open-creator="' + esc(record.id) + '" aria-haspopup="dialog">বিস্তারিত, উক্তি ও মিডিয়া দেখুন →</button>' +
      '</div></article>';
  }

  function render() {
    if (!state.data) return;
    var records = sorted(state.data.records.filter(matches));
    els.grid.innerHTML = records.map(cardHtml).join('');
    els.empty.hidden = records.length !== 0;
    els.count.innerHTML = 'মোট <strong>' + bn(state.data.records.length) + '</strong>টি এন্ট্রির মধ্যে <strong>' +
      bn(records.length) + '</strong>টি দেখানো হচ্ছে। প্রতিটি কার্ডেই ছবি, কৃতিত্ব ও লাইসেন্স আছে।' +
      (state.q ? ' খোঁজা হয়েছে: “' + esc(els.search.value) + '”।' : '');
  }

  function chipHtml(kind, key, label, count, active) {
    return '<button type="button" class="ca-chip' + (active ? ' on' : '') + '" data-ca-filter="' + kind +
      '" data-ca-value="' + esc(key) + '" aria-pressed="' + (active ? 'true' : 'false') + '">' +
      esc(label) + (count != null ? ' <span>' + bn(count) + '</span>' : '') + '</button>';
  }

  function renderChips() {
    var records = state.data.records;
    var taxData = state.data.taxonomy || {};

    function build(container, kind, dict, current, allLabel) {
      if (!container) return;
      var html = chipHtml(kind, 'all', allLabel, records.length, current === 'all');
      Object.keys(dict || {}).forEach(function (key) {
        var n = records.filter(function (r) {
          if (kind === 'category') return (r.categories || []).indexOf(key) > -1;
          if (kind === 'region') return r.region === key;
          return r.relationType === key;
        }).length;
        if (n) html += chipHtml(kind, key, dict[key], n, current === key);
      });
      container.innerHTML = html;
    }

    build(els.regions, 'region', taxData.regions, state.region, 'সব অঞ্চল');
    build(els.categories, 'category', taxData.categories, state.category, 'সব মাধ্যম/বিষয়');
    build(els.relations, 'relation', taxData.relationTypes, state.relation, 'সব সম্পর্ক-ধরন');
  }

  function renderStats() {
    var records = state.data.records;
    var counts = { pdf: 0, audio: 0, video: 0 };
    records.forEach(function (r) {
      (r.media || []).forEach(function (m) {
        if (Object.prototype.hasOwnProperty.call(counts, m.kind)) counts[m.kind] += 1;
      });
    });
    var quoteCount = records.filter(isReliableQuote).length;
    var bdBangla = records.filter(function (r) { return r.region === 'bangladesh' || r.region === 'bengali'; }).length;
    var vals = [
      [records.length, 'নির্মাতা / কর্মের এন্ট্রি'],
      [records.filter(function (r) { return r.image && r.image.url; }).length, 'ছবিওয়ালা কার্ড'],
      [bdBangla, 'বাংলাদেশি / বাঙালি এন্ট্রি'],
      [counts.pdf, 'PDF / মূলপাঠ লিংক'],
      [counts.audio, 'অডিও লিংক'],
      [counts.video + '/' + quoteCount, 'ভিডিও / নির্ভরযোগ্য উক্তি']
    ];
    els.stats.innerHTML = vals.map(function (v) {
      var display = String(v[0]).split('/').map(function (x) { return /\d/.test(x) ? bn(Number(x)) : x; }).join('/');
      return '<div class="ca-stat"><strong>' + esc(display) + '</strong><span>' + esc(v[1]) + '</span></div>';
    }).join('');
  }

  function fact(label, value) {
    if (!value) return '';
    return '<div class="ca-fact"><span>' + esc(label) + '</span><strong>' + esc(value) + '</strong></div>';
  }

  function quoteHtml(record) {
    if (!record.quote) return '';
    var q = record.quote;
    return '<h4>💬 উক্তি / মূলপাঠ ও যাচাই-অবস্থা</h4>' +
      '<div class="ca-quote' + (q.status === 'misattributed' || q.status === 'unverified' ? ' warn' : '') + '">' +
      '<span class="ca-quote-status">' + esc(QUOTE_STATUS[q.status] || q.status) + '</span>' +
      '<blockquote>“' + esc(q.textBn) + '”</blockquote>' +
      (q.textOriginal ? '<p class="orig">মূল/ভাবানুবাদের ভিত্তি: ' + esc(q.textOriginal) + '</p>' : '') +
      (q.attribution ? '<p><strong>সূত্র-আরোপ:</strong> ' + esc(q.attribution) + '</p>' : '') +
      (q.caution ? '<p><strong>সতর্কতা:</strong> ' + esc(q.caution) + '</p>' : '') +
      '</div>';
  }

  function mediaHtml(record) {
    var groups = mediaKinds(record);
    if (!groups.length) return '';
    var html = '<h4>📺 পড়ুন · শুনুন · দেখুন</h4>';
    groups.forEach(function (kind) {
      html += '<div class="ca-media-group"><h5>' + MEDIA_META[kind].icon + ' ' + esc(MEDIA_META[kind].label) + '</h5><div class="ca-media-links">';
      (record.media || []).filter(function (m) { return m.kind === kind; }).forEach(function (m) {
        var url = safeUrl(m.url);
        html += '<a class="ca-media-link" href="' + esc(url) + '"' +
          (isExternal(url) ? ' target="_blank" rel="noopener noreferrer"' : '') + '>' +
          '<span class="icon" aria-hidden="true">' + MEDIA_META[kind].icon + '</span>' +
          '<span><strong>' + esc(m.label) + '</strong>' + (m.note ? '<span>' + esc(m.note) + '</span>' : '') + '</span></a>';
      });
      html += '</div></div>';
    });
    return html;
  }

  function libraryHtml(record) {
    var ids = (record.libraryIds || []).filter(function (id) { return state.library[id]; });
    if (!ids.length) return '';
    return '<h4>📚 চর্যাভূমি লাইব্রেরিতে সম্পর্কিত উপাদান</h4><div class="ca-related-links">' +
      ids.map(function (id) {
        var item = state.library[id];
        var icon = item.type === 'audio' ? '🎧' : item.type === 'video' ? '🎬' : item.type === 'image' ? '🖼️' : '📄';
        return '<a href="library.html#' + esc(id) + '">' + icon + ' ' + esc(item.title) + '</a>';
      }).join('') + '</div>';
  }

  function dialogHtml(record) {
    var works = (record.works || []).map(function (w) {
      return '<div class="ca-work"><strong>' + esc(w.title) + '</strong>' +
        (w.year ? ' <span>· ' + esc(w.year) + '</span>' : '') +
        (w.medium ? ' <span>· ' + esc(w.medium) + '</span>' : '') +
        (w.note ? '<p>' + esc(w.note) + '</p>' : '') + '</div>';
    }).join('');
    var details = (record.details || []).map(function (d) { return '<li>' + boldify(d) + '</li>'; }).join('');
    var timeline = (record.timeline || []).filter(function (t) { return t && t[1]; }).map(function (t) {
      return '<li><span class="ca-tl-year">' + esc(t[0]) + '</span><span class="ca-tl-text">' + esc(t[1]) + '</span></li>';
    }).join('');
    var sources = (record.sources || []).map(function (s) {
      var url = safeUrl(s.url);
      return '<li><a href="' + esc(url) + '"' + (isExternal(url) ? ' target="_blank" rel="noopener noreferrer"' : '') + '>' + esc(s.label) + '</a></li>';
    }).join('');

    return '<div class="ca-dialog-shell">' +
      '<div class="ca-dialog-head"><div>' +
      '<span class="ca-pill relation">' + esc(tax('relationTypes', record.relationType)) + '</span>' +
      '<h3 id="creatorDialogTitle">' + esc(record.titleBn) + '</h3>' +
      '<p>' + esc(record.titleEn || '') + (record.years ? ' · ' + esc(record.years) : '') + '</p>' +
      '</div><button type="button" class="ca-close" data-ca-close aria-label="বিস্তারিত জানালা বন্ধ করুন">×</button></div>' +
      '<div class="ca-dialog-layout">' + imageHtml(record, true) +
      '<div class="ca-dialog-content">' +
      '<div class="ca-fact-grid">' +
      fact('নির্মাতা', record.creatorBn + (record.creatorEn ? ' · ' + record.creatorEn : '')) +
      fact('ভূমিকা', (record.roles || []).join(' · ')) +
      fact('অঞ্চল / কাল', tax('regions', record.region) + ' · ' + tax('periods', record.period)) +
      fact('ভাষা / মাধ্যম', record.language) +
      fact('প্রধান কাজ', record.featuredWork) +
      fact('বৌদ্ধ চরিত্র / বিষয়', (record.characters || []).join(' · ')) +
      '</div>' +
      '<p class="ca-subject">☸ ' + esc(record.buddhistSubject) + '</p>' +
      '<h4>সংক্ষিপ্ত পরিচিতি</h4><p>' + boldify(record.summary) + '</p>' +
      '<h4>কেন গুরুত্বপূর্ণ</h4><p>' + boldify(record.significance) + '</p>' +
      (works ? '<h4>🎨 নির্বাচিত কাজ</h4><div class="ca-work-list">' + works + '</div>' : '') +
      (timeline ? '<h4>⏳ সময়রেখা</h4><ul class="ca-timeline">' + timeline + '</ul>' : '') +
      quoteHtml(record) +
      (details ? '<h4>📌 প্রমাণ ও সতর্কতার নোট</h4><ul class="ca-details-list">' + details + '</ul>' : '') +
      mediaHtml(record) +
      libraryHtml(record) +
      (sources ? '<h4>🔎 যাচাইয়ের সূত্র</h4><ul class="ca-source-list">' + sources + '</ul>' : '') +
      '<div class="ca-dialog-actions"><button type="button" class="ca-copy-btn" data-copy-creator="' + esc(record.id) + '">এই এন্ট্রির লিংক কপি করুন</button>' +
      '<button type="button" class="ca-copy-btn" data-ca-close>বন্ধ করুন</button></div>' +
      '</div></div></div>';
  }

  function setHashForRecord(id) {
    if (!window.history || !window.history.replaceState) return;
    var next = id ? '#creator-' + encodeURIComponent(id) : '#creator-archive';
    window.history.replaceState(null, '', next);
  }

  function openRecord(id, trigger) {
    var record = state.data.records.find(function (r) { return r.id === id; });
    if (!record || !els.dialog || !els.dialogBody) return;
    state.activeId = id;
    state.lastTrigger = trigger || document.querySelector('[data-open-creator="' + CSS.escape(id) + '"]');
    els.dialogBody.innerHTML = dialogHtml(record);
    setHashForRecord(id);
    if (typeof els.dialog.showModal === 'function') {
      if (!els.dialog.open) els.dialog.showModal();
    } else {
      els.dialog.setAttribute('open', '');
    }
    var close = els.dialogBody.querySelector('[data-ca-close]');
    if (close) close.focus();
  }

  function closeDialog() {
    if (!els.dialog) return;
    if (typeof els.dialog.close === 'function' && els.dialog.open) els.dialog.close();
    else els.dialog.removeAttribute('open');
  }

  function bindEvents() {
    var timer = null;
    els.search.addEventListener('input', function () {
      window.clearTimeout(timer);
      timer = window.setTimeout(function () {
        state.q = norm(els.search.value);
        render();
      }, 140);
    });
    els.media.addEventListener('change', function () {
      state.media = els.media.value;
      render();
    });
    els.sort.addEventListener('change', function () {
      state.sort = els.sort.value;
      render();
    });
    els.verified.addEventListener('change', function () {
      state.verifiedOnly = els.verified.checked;
      render();
    });

    root.addEventListener('click', function (event) {
      var chip = event.target.closest('[data-ca-filter]');
      if (chip) {
        var kind = chip.dataset.caFilter;
        state[kind] = chip.dataset.caValue;
        renderChips();
        render();
        return;
      }
      var opener = event.target.closest('[data-open-creator]');
      if (opener) openRecord(opener.dataset.openCreator, opener);
    });

    els.reset.addEventListener('click', function () {
      state.q = '';
      state.region = 'all';
      state.category = 'all';
      state.relation = 'all';
      state.media = 'all';
      state.sort = 'curated';
      state.verifiedOnly = false;
      els.search.value = '';
      els.media.value = 'all';
      els.sort.value = 'curated';
      els.verified.checked = false;
      renderChips();
      render();
      els.search.focus();
    });

    els.dialog.addEventListener('click', function (event) {
      if (event.target.closest('[data-ca-close]')) {
        closeDialog();
        return;
      }
      var copyBtn = event.target.closest('[data-copy-creator]');
      if (copyBtn) {
        var url = window.location.href.split('#')[0] + '#creator-' + encodeURIComponent(copyBtn.dataset.copyCreator);
        var done = function () {
          copyBtn.textContent = '✅ লিংক কপি হয়েছে';
          window.setTimeout(function () { copyBtn.textContent = 'এই এন্ট্রির লিংক কপি করুন'; }, 1800);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url).then(done).catch(done);
        } else {
          done();
        }
        return;
      }
      if (event.target === els.dialog) {
        var rect = els.dialog.getBoundingClientRect();
        var inside = event.clientX >= rect.left && event.clientX <= rect.right &&
          event.clientY >= rect.top && event.clientY <= rect.bottom;
        if (!inside) closeDialog();
      }
    });

    els.dialog.addEventListener('close', function () {
      state.activeId = null;
      setHashForRecord(null);
      if (state.lastTrigger && document.contains(state.lastTrigger)) state.lastTrigger.focus();
    });

    window.addEventListener('hashchange', function () {
      var id = hashRecordId();
      if (!id || (els.dialog.open && state.activeId === id)) return;
      initialHashOpen();
    });
  }

  function hashRecordId() {
    var m = String(window.location.hash || '').match(/^#creator-(.+)$/);
    if (!m) return null;
    var id = m[1];
    try { id = decodeURIComponent(id); } catch (e) { /* keep raw id */ }
    return id;
  }

  function initialHashOpen() {
    var id = hashRecordId();
    if (!id) return;
    if (!state.data.records.some(function (r) { return r.id === id; })) return;
    window.setTimeout(function () {
      var card = document.getElementById('creator-' + id);
      if (card) card.scrollIntoView({ block: 'center' });
      openRecord(id, document.querySelector('[data-open-creator="' + CSS.escape(id) + '"]'));
    }, 80);
  }

  function fetchJson(url) {
    return fetch(url, { cache: 'no-store' }).then(function (response) {
      if (!response.ok) throw new Error('HTTP ' + response.status);
      return response.json();
    });
  }

  Promise.allSettled([fetchJson(DATA_URL), fetchJson(LIB_URL)]).then(function (results) {
    if (results[0].status !== 'fulfilled') throw results[0].reason;
    state.data = results[0].value;

    if (results[1].status === 'fulfilled') {
      (results[1].value.items || []).forEach(function (item) {
        state.library[item.id] = item;
      });
    }

    if (els.subtitle && state.data.subtitle) els.subtitle.textContent = state.data.subtitle;
    if (els.intro) {
      els.intro.innerHTML = (state.data.intro || []).map(function (p) {
        return '<p>' + esc(p) + '</p>';
      }).join('');
    }
    if (els.method) {
      els.method.innerHTML = (state.data.method || []).map(function (p) {
        return '<li>' + esc(p) + '</li>';
      }).join('');
    }

    renderStats();
    renderChips();
    bindEvents();
    render();
    initialHashOpen();
  }).catch(function (err) {
    els.grid.innerHTML = '';
    els.empty.hidden = false;
    els.empty.textContent = 'নির্মাতা-আর্কাইভের ডেটা লোড করা যায়নি (' + err.message + ')। ইন্টারনেট সংযোগ দেখে পাতাটি আবার লোড করুন।';
    els.count.textContent = '';
  });
})();
