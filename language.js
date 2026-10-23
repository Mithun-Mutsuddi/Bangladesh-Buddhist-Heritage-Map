/* চর্যাভূমি — early, honest language control.
   Human-reviewed interface: বাংলা / English.
   Chakma and Marma are listed as community-language support, not as a claim
   that every article has been translated. Other languages offer a clearly
   labelled automatic-translation route instead of silently rewriting sources. */
(function () {
  'use strict';
  var STORAGE = 'charyabhumiLanguage';
  var current = 'bn';
  var initialized = false;
  var LANGUAGES = [
    { code: 'bn', name: 'বাংলা', en: 'Bangla', level: 'human', label: 'মূল interface' },
    { code: 'en', name: 'English', en: 'English', level: 'human', label: 'Reviewed interface' },
    { code: 'ccp', name: '𑄌𑄋𑄴𑄟𑄳𑄦', en: 'Chakma', level: 'community', label: 'Community support' },
    { code: 'rmz', name: 'Marma / မရမာ', en: 'Marma', level: 'community', label: 'Community support' },
    { code: 'hi', name: 'हिन्दी', en: 'Hindi', level: 'auto' },
    { code: 'ur', name: 'اردو', en: 'Urdu', level: 'auto' },
    { code: 'ar', name: 'العربية', en: 'Arabic', level: 'auto' },
    { code: 'zh-CN', name: '中文', en: 'Chinese', level: 'auto' },
    { code: 'ja', name: '日本語', en: 'Japanese', level: 'auto' },
    { code: 'ko', name: '한국어', en: 'Korean', level: 'auto' },
    { code: 'fr', name: 'Français', en: 'French', level: 'auto' },
    { code: 'de', name: 'Deutsch', en: 'German', level: 'auto' },
    { code: 'es', name: 'Español', en: 'Spanish', level: 'auto' },
    { code: 'pt', name: 'Português', en: 'Portuguese', level: 'auto' },
    { code: 'ru', name: 'Русский', en: 'Russian', level: 'auto' },
    { code: 'th', name: 'ไทย', en: 'Thai', level: 'auto' },
    { code: 'my', name: 'မြန်မာ', en: 'Burmese', level: 'auto' },
    { code: 'ne', name: 'नेपाली', en: 'Nepali', level: 'auto' },
    { code: 'si', name: 'සිංහල', en: 'Sinhala', level: 'auto' },
    { code: 'bo', name: 'བོད་ཡིག', en: 'Tibetan', level: 'auto' },
    { code: 'vi', name: 'Tiếng Việt', en: 'Vietnamese', level: 'auto' },
    { code: 'id', name: 'Bahasa Indonesia', en: 'Indonesian', level: 'auto' },
    { code: 'ms', name: 'Bahasa Melayu', en: 'Malay', level: 'auto' },
    { code: 'ta', name: 'தமிழ்', en: 'Tamil', level: 'auto' },
    { code: 'te', name: 'తెలుగు', en: 'Telugu', level: 'auto' },
    { code: 'pa', name: 'ਪੰਜਾਬੀ', en: 'Punjabi', level: 'auto' },
    { code: 'as', name: 'অসমীয়া', en: 'Assamese', level: 'auto' },
    { code: 'or', name: 'ଓଡ଼ିଆ', en: 'Odia', level: 'auto' },
    { code: 'fa', name: 'فارسی', en: 'Persian', level: 'auto' },
    { code: 'tr', name: 'Türkçe', en: 'Turkish', level: 'auto' },
    { code: 'it', name: 'Italiano', en: 'Italian', level: 'auto' },
    { code: 'nl', name: 'Nederlands', en: 'Dutch', level: 'auto' },
    { code: 'sw', name: 'Kiswahili', en: 'Swahili', level: 'auto' },
    { code: 'km', name: 'ខ្មែរ', en: 'Khmer', level: 'auto' },
    { code: 'lo', name: 'ລາວ', en: 'Lao', level: 'auto' },
    { code: 'mn', name: 'Монгол', en: 'Mongolian', level: 'auto' },
    { code: 'uk', name: 'Українська', en: 'Ukrainian', level: 'auto' },
    { code: 'pl', name: 'Polski', en: 'Polish', level: 'auto' }
  ];
  var EN = {
    'language.label': 'Language / ভাষা',
    'nav.home': 'Home', 'nav.explore': 'Explore places', 'nav.tracker': 'My travel tracker',
    'nav.planner': 'Trip planner', 'nav.maps': 'Maps', 'nav.history': 'History',
    'nav.archaeology': 'Archaeology article', 'nav.philosophy': 'Buddhism',
    'nav.culture': 'Art & culture', 'nav.kings': 'Royal profiles', 'nav.library': 'Library',
    'nav.archive': 'Historical archive', 'nav.contribution': 'Contribute',
    'nav.institutions': 'Social institutions', 'nav.calendar': 'Calendar', 'nav.quiz': 'Quiz',
    'nav.about': 'About us',
    'archive.eyebrow': 'A sourced, growing public collection',
    'archive.title': 'Buddhist Historical Archive',
    'archive.lead': 'Buddha, Buddhism, Bengali and Bangladeshi Buddhist heritage—books, manuscripts, images, research, sound, video and living culture, with source and rights notes.',
    'archive.explore': 'Explore the collection', 'archive.library': 'Open the media library',
    'archive.search': 'Search the archive', 'archive.searchPlaceholder': 'Buddha, Paharpur, Charyapada, sculpture, PDF…',
    'archive.media': 'Media type', 'archive.topic': 'Topic', 'archive.verification': 'Source status',
    'archive.all': 'All', 'archive.results': 'items', 'archive.showing': 'showing',
    'archive.clear': 'Clear filters', 'archive.source': 'Source', 'archive.rights': 'Rights',
    'archive.open': 'Open source', 'archive.related': 'Related on Charyabhumi',
    'archive.noResults': 'No items match these filters.', 'archive.policy': 'Collection and verification policy',
    'archive.contribute': 'Suggest a source', 'archive.creator': 'Creator & living culture archive',
    'archive.libraryTitle': 'The existing library is part of this archive',
    'archive.libraryText': 'Browse the 82-item public library for PDFs, audio, video, images and books. Each item keeps its own creator, source and rights label.',
    'archive.creatorText': 'The 54-entry creator archive preserves artists, writers, musicians and cultural practitioners with attribution and verification states.',
    'archive.animationNote': 'A visual index of connected sources—not a claim that the whole internet has been archived.',
    'home.archiveTitle': 'A living archive of Buddhist heritage',
    'home.archiveText': 'Start with source-labelled gateways and verification states, then open the existing library and creator archive for books, images, audio, video, art and culture.'
  };
  var original = new WeakMap();

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function language(code) {
    if (code === 'auto') return { code: 'auto', name: 'Other language', en: 'Other language', level: 'auto' };
    return LANGUAGES.find(function (x) { return x.code === code; }) || LANGUAGES[0];
  }
  function saved() {
    try { return localStorage.getItem(STORAGE) || 'bn'; } catch (_) { return 'bn'; }
  }
  function automaticUrl(code) {
    var target = code === 'auto' ? 'en' : code;
    return 'https://translate.google.com/translate?sl=bn&tl=' + encodeURIComponent(target) + '&u=' + encodeURIComponent(location.href);
  }
  function injectStyle() {
    if (document.getElementById('cbLanguageStyle')) return;
    var style = document.createElement('style');
    style.id = 'cbLanguageStyle';
    style.textContent = `
      .cb-language-bar{background:#102f2c;color:#fff8e6;border-bottom:1px solid rgba(255,255,255,.14);font:500 13px/1.4 system-ui,"Noto Sans Bengali",sans-serif}
      .cb-language-in{min-height:42px;display:flex;align-items:center;gap:9px;flex-wrap:wrap;padding-top:5px;padding-bottom:5px}
      .cb-language-mark{color:#f5c76a;font-size:18px}.cb-language-in label{white-space:nowrap;font-weight:700}
      .cb-language-in select{max-width:min(100%,390px);background:#fff8e6;color:#173f38;border:1px solid #d7b66a;border-radius:7px;padding:5px 9px;font:inherit;cursor:pointer}
      .cb-language-support{color:#e6d3ab;font-size:11px;min-height:1em}.cb-language-support a{color:#ffd77e;text-decoration:underline}
      .cb-language-standalone{margin:0;position:relative;z-index:20}.cb-language-standalone .cb-wrap{max-width:1240px}
      @media(max-width:640px){.cb-language-in{gap:6px}.cb-language-in select{flex:1;min-width:150px;max-width:none}.cb-language-support{flex-basis:100%;padding-left:24px}}
      @media(prefers-reduced-motion:reduce){.cb-language-bar *{scroll-behavior:auto!important}}
    `;
    document.head.appendChild(style);
  }
  function makeControl() {
    var wrap = document.createElement('div');
    wrap.className = 'cb-language-bar cb-language-standalone';
    wrap.innerHTML = '<div class="cb-wrap cb-language-in">' +
      '<span class="cb-language-mark" aria-hidden="true">☸</span>' +
      '<label for="cbLanguageSelectStandalone" data-i18n="language.label">ভাষা / Language</label>' +
      '<select id="cbLanguageSelectStandalone" data-language-select aria-describedby="cbLanguageSupportStandalone"></select>' +
      '<span id="cbLanguageSupportStandalone" class="cb-language-support" role="status"></span></div>';
    return wrap;
  }
  function ensureControl() {
    if (document.querySelector('[data-language-select]')) return;
    var header = document.querySelector('.site-header');
    if (header && header.parentNode) {
      header.parentNode.insertBefore(makeControl(), header);
      return;
    }
    // The tracker has its own legacy two-language control. Do not duplicate it;
    // the shared control is available on the main/content pages.
  }
  function fill(select) {
    var value = current;
    select.innerHTML = LANGUAGES.map(function (item) {
      var suffix = item.level === 'human' ? ' · ' + item.label : item.level === 'community' ? ' · community' : ' · automatic';
      return '<option value="' + esc(item.code) + '">' + esc(item.name + (item.en !== item.name ? ' / ' + item.en : '') + suffix) + '</option>';
    }).join('') + '<option value="auto">🌐 Other language / automatic translation…</option>';
    select.value = value;
    select.setAttribute('aria-label', 'ভাষা নির্বাচন / Choose language');
  }
  function supportMessage(item) {
    var support = document.querySelectorAll('.cb-language-support');
    var html = '';
    if (item.level === 'community') {
      html = item.code === 'ccp'
        ? 'চাকমা: community interface support · মূল নিবন্ধের ভাষা অপরিবর্তিত'
        : 'Marma: community interface support · মূল নিবন্ধের ভাষা অপরিবর্তিত';
    } else if (item.level === 'auto' || item.code === 'auto') {
      html = '🌐 <a href="' + esc(automaticUrl(item.code)) + '" target="_blank" rel="noopener">স্বয়ংক্রিয় অনুবাদ খুলুন ↗</a> · মানব-সম্পাদিত নয়';
    } else if (item.code === 'en') {
      html = 'Reviewed interface · source texts retain their original language';
    }
    support.forEach(function (el) { el.innerHTML = html; });
  }
  function apply() {
    var item = language(current);
    document.documentElement.lang = item.code === 'auto' ? 'bn' : item.code;
    document.querySelectorAll('[data-language-select]').forEach(function (select) {
      if (!select.options.length || select.options.length !== LANGUAGES.length + 1) fill(select);
      select.value = current;
    });
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (!original.has(el)) original.set(el, el.textContent);
      // Community/automatic modes retain the source interface until a human
      // translation or the explicit external translation route is chosen.
      el.textContent = current === 'en' && EN[key] ? EN[key] : original.get(el);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-placeholder');
      if (!original.has(el)) original.set(el, el.getAttribute('placeholder') || '');
      el.setAttribute('placeholder', current === 'en' && EN[key] ? EN[key] : original.get(el));
    });
    supportMessage(item);
    document.dispatchEvent(new CustomEvent('cb:language', { detail: { code: current, level: item.level, t: t } }));
  }
  function t(key, fallback) {
    if (current === 'en' && EN[key]) return EN[key];
    return fallback == null ? key : fallback;
  }
  function set(code) {
    current = language(code).code;
    try { localStorage.setItem(STORAGE, current); } catch (_) {}
    apply();
  }
  function init() {
    if (initialized) { ensureControl(); apply(); return; }
    initialized = true;
    current = saved();
    injectStyle(); ensureControl(); apply();
    document.addEventListener('change', function (event) {
      var select = event.target.closest && event.target.closest('[data-language-select]');
      if (select) set(select.value);
    });
    document.addEventListener('cb:info', function () { ensureControl(); apply(); });
  }
  window.CharyabhumiLanguage = {
    languages: LANGUAGES, t: t, set: set, get: function () { return current; },
    refresh: apply, automaticUrl: automaticUrl
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
