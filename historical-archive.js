/* Public archive registry — deliberately separate from archive.js, which is
   the browser-local private submission/draft archive. */
(function () {
  'use strict';
  var DATA = 'data/historical-archive.json?v=20261024b';
  var PAGE = 12;
  var items = [], filtered = [], visible = PAGE, doc = null;
  var lang = 'bn', searchTimer = null;
  var $ = function (id) { return document.getElementById(id); };
  var els = {
    grid: $('archiveGrid'), search: $('archiveSearch'), type: $('archiveType'),
    topic: $('archiveTopic'), verification: $('archiveVerification'), clear: $('archiveClear'),
    count: $('archiveCount'), shown: $('archiveShown'), status: $('archiveStatus'),
    empty: $('archiveEmpty'), more: $('archiveMore'), gatewayStat: $('archiveGatewayStat'),
    libraryStat: $('archiveLibraryStat'), creatorStat: $('archiveCreatorStat')
  };
  var ICONS = { pdf: '📕', image: '🖼️', audio: '🎧', video: '🎬', article: '📄', research: '🔬', map: '🗺️', collection: '🗄️' };

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function clean(value) { return String(value == null ? '' : value).trim(); }
  function norm(value) {
    return clean(value).normalize('NFC').toLocaleLowerCase('bn')
      .replace(/[\u200c\u200d\ufeff]/g, '').replace(/\s+/g, ' ');
  }
  function number(value) { return lang === 'en' ? Number(value || 0).toLocaleString('en-US') : Number(value || 0).toLocaleString('bn-BD'); }
  function isEnglish() { return lang === 'en'; }
  function text(item, key) { return isEnglish() ? (item[key + 'En'] || item[key + 'Bn'] || '') : (item[key + 'Bn'] || item[key + 'En'] || ''); }
  function label(group, key) {
    var value = doc && doc[group] && doc[group][key];
    if (!value) return key;
    return isEnglish() ? value.en : value.bn;
  }
  function typeLabel(key) {
    var found = doc && (doc.types || []).find(function (x) { return x.key === key; });
    return found ? (isEnglish() ? found.labelEn : found.labelBn) : key;
  }
  function topicLabel(key) {
    var found = doc && (doc.topics || []).find(function (x) { return x.key === key; });
    return found ? (isEnglish() ? found.labelEn : found.labelBn) : key;
  }
  function external(url) { return /^https?:\/\//i.test(clean(url)); }
  function link(url, textValue, className) {
    var attrs = external(url) ? ' target="_blank" rel="noopener"' : '';
    return '<a class="' + esc(className || 'cb-mini-btn link') + '" href="' + esc(url) + '"' + attrs + '>' + esc(textValue) + (external(url) ? ' ↗' : '') + '</a>';
  }
  function fillSelect(select, values, allLabel) {
    if (!select) return;
    var old = select.value || 'all';
    select.innerHTML = '<option value="all">' + esc(allLabel) + '</option>' + values.map(function (x) {
      return '<option value="' + esc(x.key) + '">' + esc(x.label) + '</option>';
    }).join('');
    select.value = Array.from(select.options).some(function (o) { return o.value === old; }) ? old : 'all';
  }
  function refreshOptions() {
    if (!doc) return;
    fillSelect(els.type, (doc.types || []).filter(function (x) { return x.key !== 'all'; }).map(function (x) {
      return { key: x.key, label: isEnglish() ? x.labelEn : x.labelBn };
    }), isEnglish() ? 'All media' : 'সব মিডিয়া');
    fillSelect(els.topic, (doc.topics || []).filter(function (x) { return x.key !== 'all'; }).map(function (x) {
      return { key: x.key, label: isEnglish() ? x.labelEn : x.labelBn };
    }), isEnglish() ? 'All topics' : 'সব বিষয়');
    fillSelect(els.verification, Object.keys(doc.verificationLabels || {}).map(function (key) {
      return { key: key, label: label('verificationLabels', key) };
    }), isEnglish() ? 'All source states' : 'সব অবস্থা');
  }
  function card(item, index) {
    var verification = item.verification || 'discovery';
    var rights = item.rights || 'source-link';
    var related = item.relatedUrl && item.relatedUrl !== item.sourceUrl
      ? link(item.relatedUrl, isEnglish() ? 'Related on Charyabhumi' : 'চর্যাভূমিতে সম্পর্কিত পাতা', 'cb-mini-btn') : '';
    var source = link(item.sourceUrl, isEnglish() ? 'Open source' : 'মূল উৎস খুলুন', 'cb-mini-btn link');
    var badges = '<span class="archive-badge ' + (verification === 'discovery' ? 'discovery' : verification === 'community' ? 'community' : '') + '">' + esc(label('verificationLabels', verification)) + '</span>' +
      '<span class="archive-badge rights">' + esc(label('rightsLabels', rights)) + '</span>';
    return '<article class="archive-card" data-archive-id="' + esc(item.id) + '" style="animation-delay:' + Math.min(index, 11) * 35 + 'ms">' +
      '<div class="archive-card-top"><span class="archive-type-icon" aria-hidden="true">' + (ICONS[item.type] || '☸') + '</span>' +
      '<span class="archive-type-label">' + esc(typeLabel(item.type)) + '</span><span class="archive-card-id">' + esc(item.id.replace(/^archive-/, '')) + '</span></div>' +
      '<div class="archive-card-body"><h3>' + esc(text(item, 'title')) + '</h3>' +
      (isEnglish() && item.titleBn && item.titleEn && item.titleBn !== item.titleEn ? '<p class="archive-card-en">' + esc(item.titleBn) + '</p>' : '') +
      '<p class="archive-summary">' + esc(text(item, 'summary')) + '</p>' +
      '<div class="archive-meta"><span>🏛 ' + esc(item.creator || item.source) + '</span><span>◷ ' + esc(item.year || '') + '</span><span>অ ' + esc(item.language || '') + '</span></div>' +
      '<div class="archive-badges">' + badges + '</div>' +
      '<details class="archive-details"><summary>' + (isEnglish() ? 'Source, verification & rights' : 'উৎস, যাচাই ও অধিকার') + '</summary>' +
      '<p><strong>' + (isEnglish() ? 'Source:' : 'উৎস:') + '</strong> ' + esc(item.source) + '<br><strong>' + (isEnglish() ? 'Verification:' : 'যাচাই:') + '</strong> ' + esc(label('verificationLabels', verification)) + '<br><strong>' + (isEnglish() ? 'Rights:' : 'অধিকার:') + '</strong> ' + esc(label('rightsLabels', rights)) + '</p></details>' +
      '<div class="archive-card-actions">' + source + related + '</div></div></article>';
  }
  function applyFilters(reset) {
    if (reset !== false) visible = PAGE;
    var q = norm(els.search ? els.search.value : '');
    var tokens = q ? q.split(' ').filter(Boolean) : [];
    var type = els.type ? els.type.value : 'all';
    var topic = els.topic ? els.topic.value : 'all';
    var verification = els.verification ? els.verification.value : 'all';
    filtered = items.filter(function (item) {
      if (type !== 'all' && item.type !== type) return false;
      if (topic !== 'all' && !(item.topics || []).includes(topic)) return false;
      if (verification !== 'all' && item.verification !== verification) return false;
      if (!tokens.length) return true;
      var haystack = norm([item.id, item.titleBn, item.titleEn, item.summaryBn, item.summaryEn, item.creator, item.source, item.language, (item.topics || []).join(' ')].join(' '));
      return tokens.every(function (token) { return haystack.indexOf(token) > -1; });
    });
    render();
  }
  function render() {
    if (!els.grid) return;
    var shown = filtered.slice(0, visible);
    els.grid.innerHTML = shown.map(card).join('');
    if (els.count) els.count.textContent = number(filtered.length) + (isEnglish() ? ' items' : 'টি item');
    if (els.shown) els.shown.textContent = isEnglish() ? number(shown.length) + ' / ' + number(filtered.length) + ' showing' : number(shown.length) + ' / ' + number(filtered.length) + 'টি দেখানো হচ্ছে';
    if (els.empty) els.empty.hidden = filtered.length !== 0;
    if (els.more) {
      var left = filtered.length - shown.length;
      els.more.hidden = left <= 0;
      els.more.textContent = isEnglish() ? 'Show ' + number(Math.min(PAGE, left)) + ' more' : 'আরও ' + number(Math.min(PAGE, left)) + 'টি দেখুন';
    }
    if (els.status && doc) els.status.textContent = isEnglish() ? 'Source registry · checked ' + doc.generated_at : 'সূত্র registry · পর্যালোচনা ' + doc.generated_at;
  }
  function updateStats() {
    if (!doc || !doc.stats) return;
    if (els.gatewayStat) els.gatewayStat.textContent = number(doc.stats.gateways || items.length);
    if (els.libraryStat) els.libraryStat.textContent = number(doc.stats.libraryItems || 82);
    if (els.creatorStat) els.creatorStat.textContent = number(doc.stats.creatorEntries || 54);
  }
  function bind() {
    if (els.search) els.search.addEventListener('input', function () {
      clearTimeout(searchTimer); searchTimer = setTimeout(function () { applyFilters(true); }, 140);
    });
    [els.type, els.topic, els.verification].forEach(function (el) { if (el) el.addEventListener('change', function () { applyFilters(true); }); });
    if (els.clear) els.clear.addEventListener('click', function () {
      if (els.search) els.search.value = '';
      [els.type, els.topic, els.verification].forEach(function (el) { if (el) el.value = 'all'; });
      applyFilters(true);
    });
    if (els.more) els.more.addEventListener('click', function () { visible += PAGE; render(); });
    document.addEventListener('cb:language', function (event) {
      lang = event.detail && event.detail.code === 'en' ? 'en' : 'bn';
      refreshOptions(); updateStats(); render();
    });
  }
  function boot() {
    bind();
    fetch(DATA, { cache: 'force-cache' }).then(function (response) {
      if (!response.ok) throw new Error('archive ' + response.status);
      return response.json();
    }).then(function (data) {
      doc = data; items = Array.isArray(data.items) ? data.items : [];
      refreshOptions(); updateStats(); applyFilters(true);
      if (!items.length && els.status) els.status.textContent = isEnglish() ? 'No archive items yet.' : 'এখনো কোনো archive item নেই।';
    }).catch(function (error) {
      console.error('[historical archive]', error);
      if (els.status) els.status.textContent = isEnglish() ? 'The source registry could not be loaded. Reload to retry.' : 'সূত্র registry লোড হয়নি। পেজ রিফ্রেশ করে আবার চেষ্টা করুন।';
      if (els.grid) els.grid.innerHTML = '<p class="cb-empty">Archive data unavailable.</p>';
    });
  }
  window.CharyabhumiArchive = {
    getItems: function () { return items; }, getFiltered: function () { return filtered; },
    applyFilters: applyFilters, refresh: render
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
