/* চর্যাভূমি — shared grouped navigation, footer and site-wide search.
   One structure drives desktop/mobile navigation, homepage topics and search. */
(function () {
  'use strict';
  var INFO = 'data/site-info.json?v=20261024g';
  var STRUCTURE = 'data/site-structure.json?v=20261114a';
  var RESOURCES = 'data/resource-guides.json?v=20261024g';
  /* সংখ্যা সবসময় বাংলা অঙ্কে, সহস্র-বিচ্ছেদসহ (৩,২১৮) — সাইটের বাকি অংশের মতো */
  function bnNum(value) {
    var n = Number(value || 0);
    try { return n.toLocaleString('bn-BD'); } catch (_) {
      return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',').replace(/\d/g, function (d) { return '০১২৩৪৫৬৭৮৯'[Number(d)]; });
    }
  }
  var state = { info: null, structure: null, resources: null, placesRequested: false, searchSeq: 0 };
  var FALLBACK = { groups: [
    { id: 'heritage', icon: '🏛️', label: 'ইতিহাস ও ঐতিহ্য', short: 'ইতিহাস', items: [{ title: 'ইতিহাস', href: 'history.html', desc: '' }] },
    { id: 'travel', icon: '🧭', label: 'ভ্রমণ ও Atlas', short: 'ভ্রমণ', items: [{ title: 'Atlas', href: 'atlas.html', desc: '' }] },
    { id: 'library', icon: '📚', label: 'লাইব্রেরি ও আর্কাইভ', short: 'লাইব্রেরি', items: [{ title: 'লাইব্রেরি', href: 'library.html', desc: '' }] },
    { id: 'religion', icon: '☸️', label: 'ধর্ম ও দর্শন', short: 'ধর্ম', items: [{ title: 'দর্শন', href: 'philosophy.html', desc: '' }] },
    { id: 'learning', icon: '🧒', label: 'শিশু ও শিক্ষা', short: 'শিশু', items: [{ title: 'শিশু বিভাগ', href: 'children.html', desc: '' }] },
    { id: 'connect', icon: '🤝', label: 'অংশগ্রহণ ও যোগাযোগ', short: 'যোগাযোগ', items: [{ title: 'আমাদের কথা', href: 'about.html', desc: '' }] }
  ] };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function norm(s) { return String(s || '').toLocaleLowerCase('bn').replace(/\s+/g, ' ').trim(); }
  function here() { return location.pathname.split('/').pop() || 'index.html'; }
  function fetchJson(url) {
    return fetch(url).then(function (r) { if (!r.ok) throw new Error(url + ' ' + r.status); return r.json(); });
  }
  function currentDestination(items, cur) {
    var candidates = [cur + location.search + location.hash, cur + location.hash, cur + location.search, cur];
    for (var c = 0; c < candidates.length; c++) {
      var match = (items || []).find(function (item) { return item.href === candidates[c]; });
      if (match) return match;
    }
    return null;
  }
  function linkHtml(item, current, group) {
    var external = /^https?:/.test(item.href);
    return '<a class="cb-search-result" href="' + esc(item.href) + '"' + (external ? ' target="_blank" rel="noopener noreferrer"' : '') + '>' +
      '<span><b>' + esc(item.title) + '</b><small>' + esc(item.desc || item.description || '') + '</small></span>' +
      '<em>' + esc(group || '') + ' ↗</em></a>';
  }

  function navigation(structure) {
    var cur = here();
    var allItems = (structure.groups || []).reduce(function (all, g) { return all.concat(g.items || []); }, []);
    var destination = currentDestination(allItems, cur);
    var groups = (structure.groups || []).map(function (g) {
      var current = destination && (g.items || []).indexOf(destination) !== -1 ? destination : null;
      var links = (g.items || []).map(function (item) {
        var isCur = item === current;
        return '<a href="' + esc(item.href) + '"' + (isCur ? ' aria-current="' + (item.href.indexOf('#') !== -1 ? 'location' : 'page') + '"' : '') + '><b' + (item.key ? ' data-i18n="' + esc(item.key) + '"' : '') + '>' + esc(item.title) + '</b>' +
          (item.desc ? '<small>' + esc(item.desc) + '</small>' : '') + '</a>';
      }).join('');
      return '<details class="cb-nav-group" data-nav-group="' + esc(g.id) + '">' +
        '<summary' + (current ? ' class="is-current"' : '') + '><span data-i18n="nav.group.' + esc(g.id) + '">' + esc(g.short || g.label) + '</span><span class="cb-nav-caret" aria-hidden="true">⌄</span></summary>' +
        '<div class="cb-nav-menu"><strong><span aria-hidden="true">' + esc(g.icon || '') + '</span> <span data-i18n="nav.group.' + esc(g.id) + '">' + esc(g.label) + '</span></strong>' + links + '</div></details>';
    }).join('');
    return '<button type="button" class="cb-nav-close" data-nav-close>মেনু বন্ধ <span class="cb-nav-close-x" aria-hidden="true">✕</span></button>' +
      '<a class="cb-nav-home" href="index.html"' + (cur === 'index.html' && !destination ? ' aria-current="page"' : '') + ' data-i18n="nav.home">হোম</a>' + groups +
      '<button type="button" class="cb-nav-tool" data-search-open aria-haspopup="dialog">🔎 <span>সার্চ</span></button>' +
      '<button type="button" class="cb-nav-tool cb-assistant-tool" data-sangha-open aria-haspopup="dialog">☸ <span>সংঘমিত্র</span></button>';
  }

  function updateCurrentNavigation() {
    var nav = document.getElementById('cbNav');
    if (!nav || !state.structure) return;
    var groups = state.structure.groups || [];
    var allItems = groups.reduce(function (all, g) { return all.concat(g.items || []); }, []);
    var destination = currentDestination(allItems, here());
    nav.querySelectorAll('[aria-current]').forEach(function (a) { a.removeAttribute('aria-current'); });
    nav.querySelectorAll('summary.is-current').forEach(function (s) { s.classList.remove('is-current'); });
    if (destination) {
      nav.querySelectorAll('.cb-nav-menu a').forEach(function (a) {
        if (a.getAttribute('href') !== destination.href) return;
        a.setAttribute('aria-current', destination.href.indexOf('#') !== -1 ? 'location' : 'page');
        var group = a.closest('.cb-nav-group');
        if (group) group.querySelector('summary').classList.add('is-current');
      });
    } else if (here() === 'index.html') {
      var home = nav.querySelector('.cb-nav-home');
      if (home) home.setAttribute('aria-current', 'page');
    }
  }

  function ensureSearch() {
    if (document.getElementById('cbSiteSearch')) return;
    var dialog = document.createElement('dialog');
    dialog.id = 'cbSiteSearch';
    dialog.className = 'cb-site-search';
    dialog.setAttribute('aria-labelledby', 'cbSiteSearchTitle');
    dialog.innerHTML = '<div class="cb-search-head"><div><p class="cb-eyebrow">একই structure · একই search</p><h2 id="cbSiteSearchTitle">কী খুঁজতে চান?</h2></div>' +
      '<button type="button" class="cb-search-close" data-search-close aria-label="সার্চ বন্ধ করুন">×</button></div>' +
      '<label class="cb-search-box"><span aria-hidden="true">🔎</span><input id="cbSiteSearchInput" type="search" maxlength="120" autocomplete="off" placeholder="পাহাড়পুর, রাজা, PDF, Google Scholar, tracker…" aria-describedby="cbSiteSearchStatus"></label>' +
      '<p id="cbSiteSearchStatus" class="cb-search-status" role="status">বিষয়, পাতা, বহিস্তর research tool বা ৩২১৮ স্থানের নাম লিখুন।</p>' +
      '<div id="cbSiteSearchResults" class="cb-search-results"></div>';
    document.body.appendChild(dialog);
    var input = dialog.querySelector('#cbSiteSearchInput');
    var timer;
    input.addEventListener('input', function () {
      clearTimeout(timer);
      timer = setTimeout(function () { renderSearch(input.value); }, 150);
    });
    dialog.addEventListener('close', function () { document.body.classList.remove('cb-search-open'); });
    dialog.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') { event.preventDefault(); closeSearch(); }
    });
    dialog.addEventListener('click', function (event) {
      if (event.target.closest('[data-search-close]')) closeSearch();
      if (event.target.closest('.cb-search-result')) closeSearch();
    });
  }
  function openSearch() {
    ensureSearch();
    var dialog = document.getElementById('cbSiteSearch');
    if (window.CharyabhumiSanghaMitra) window.CharyabhumiSanghaMitra.close();
    closeNavigation();
    document.body.classList.add('cb-search-open');
    if (!dialog.open) {
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', '');
    }
    renderSearch(document.getElementById('cbSiteSearchInput').value);
    setTimeout(function () { document.getElementById('cbSiteSearchInput').focus(); }, 30);
  }
  function closeSearch() {
    var dialog = document.getElementById('cbSiteSearch');
    if (!dialog) return;
    if (dialog.open && typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
    document.body.classList.remove('cb-search-open');
  }
  function loadResources() {
    if (state.resources) return Promise.resolve(state.resources);
    return fetchJson(RESOURCES).then(function (data) { state.resources = data.resources || []; return state.resources; }).catch(function () { return []; });
  }
  function renderSearch(value) {
    var dialog = document.getElementById('cbSiteSearch');
    if (!dialog || !state.structure) return;
    var q = norm(value), seq = ++state.searchSeq;
    var results = dialog.querySelector('#cbSiteSearchResults');
    var status = dialog.querySelector('#cbSiteSearchStatus');
    var groups = state.structure.groups || [];
    if (!q) {
      status.textContent = '৬টি প্রধান বিষয় থেকে শুরু করুন, অথবা স্থান/বিষয়ের নাম লিখুন।';
      results.innerHTML = '<div class="cb-search-topic-grid">' + groups.map(function (g) {
        var first = (g.items || [])[0] || { title: g.label, href: 'index.html' };
        return '<a href="' + esc(first.href) + '" class="cb-search-topic"><span>' + esc(g.icon || '') + '</span><b>' + esc(g.label) + '</b><small>' + esc(g.description || '') + '</small></a>';
      }).join('') + '</div>';
      return;
    }
    var pages = [];
    groups.forEach(function (g) {
      (g.items || []).forEach(function (item) {
        var hay = norm([g.label, item.title, item.desc, item.keywords].join(' '));
        if (hay.indexOf(q) !== -1) pages.push({ item: item, group: g.label });
      });
    });
    var localHtml = pages.slice(0, 10).map(function (x) { return linkHtml(x.item, false, x.group); }).join('');
    status.textContent = pages.length + 'টি site section মিলেছে' + (q.length >= 2 ? '; স্থান ও external resource খোঁজা হচ্ছে…' : '');
    results.innerHTML = localHtml || '<p class="cb-search-empty">কোনো site section পাওয়া যায়নি। স্থানের নামে চেষ্টা করুন।</p>';
    if (q.length < 2) return;
    loadResources().then(function (resources) {
      if (seq !== state.searchSeq) return null;
      var matching = resources.filter(function (r) { return norm([r.title, r.description, r.keywords, r.category].join(' ')).indexOf(q) !== -1; }).slice(0, 4);
      if (matching.length) {
        localHtml += '<h3 class="cb-search-heading">External research & service links</h3>' + matching.map(function (r) {
          return linkHtml({ title: r.title, href: r.url, desc: r.description }, true, 'বহিস্তর সেবা');
        }).join('');
        results.innerHTML = localHtml;
      }
      if (!window.CharyabhumiSanghaMitra) {
        status.textContent = bnNum(pages.length) + 'টি section ও ' + bnNum(matching.length) + 'টি external resource মিলেছে।';
        return null;
      }
      return window.CharyabhumiSanghaMitra.searchPlaces(q, 6).then(function (places) {
        if (seq !== state.searchSeq) return;
        if (places.length) {
          var total =
            (window.CharyabhumiSanghaMitra && typeof window.CharyabhumiSanghaMitra.placeTotal === 'function')
              ? window.CharyabhumiSanghaMitra.placeTotal() : 0;
          results.innerHTML = localHtml + '<h3 class="cb-search-heading">ঐতিহ্যস্থান · ' + bnNum(total) + ' রেকর্ড</h3>' + places.map(function (p) {
            return linkHtml({ title: p.name + (p.en ? ' · ' + p.en : ''), href: 'index.html?q=' + encodeURIComponent(p.id) + '#explore', desc: [p.district, p.upazila, p.category].filter(Boolean).join(' · ') }, false, 'স্থান');
          }).join('');
        }
        status.textContent = bnNum(pages.length) + 'টি section, ' + bnNum(matching.length) + 'টি external resource ও ' + bnNum(places.length) + 'টি স্থান দেখানো হচ্ছে।';
      });
    }).catch(function () {
      if (seq === state.searchSeq) status.textContent = 'Section search সম্পূর্ণ; অতিরিক্ত স্থান/resource এই মুহূর্তে লোড হয়নি।';
    });
  }

  function navTop() {
    /* মেনু হেডারের ঠিক নিচ থেকে শুরু হবে — হেডারের উচ্চতা যা-ই হোক */
    var bar = document.getElementById('cbHeader');
    if (!bar) return 108;
    var rect = bar.getBoundingClientRect();
    return Math.max(0, Math.round(rect.bottom));
  }
  function closeNavigation() {
    document.querySelectorAll('.cb-nav-group[open]').forEach(function (d) { d.open = false; });
    var nav = document.getElementById('cbNav'), burger = document.getElementById('cbBurger');
    if (nav) nav.classList.remove('open');
    if (burger) burger.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('cb-nav-open');
  }
  function openNavigation() {
    var nav = document.getElementById('cbNav'), burger = document.getElementById('cbBurger');
    if (!nav) return;
    nav.style.setProperty('--cb-nav-top', navTop() + 'px');
    nav.classList.add('open');
    nav.scrollTop = 0;
    document.body.classList.add('cb-nav-open');
    if (burger) burger.setAttribute('aria-expanded', 'true');
    /* মেনু খোলার পর প্রথম গ্রুপে ফোকাস, যাতে কীবোর্ড-ব্যবহারকারী এগোতে পারেন */
    var first = nav.querySelector('summary');
    if (first && window.matchMedia('(max-width: 1100px)').matches) first.focus({ preventScroll: true });
  }
  function bindShell() {
    if (bindShell.done) return;
    bindShell.done = true;
    window.addEventListener('hashchange', updateCurrentNavigation);
    window.addEventListener('popstate', updateCurrentNavigation);
    document.addEventListener('click', function (event) {
      var search = event.target.closest('[data-search-open]');
      if (search) { event.preventDefault(); openSearch(); return; }
      if (event.target.closest('[data-nav-close]')) { event.preventDefault(); closeNavigation(); return; }
      /* লিংকে চাপ দিলে সাথে সাথে মেনু লুকিয়ে ফেললে কিছু মোবাইল ব্রাউজার নেভিগেশন বাতিল করে —
         তাই পাতা বদলানোর কাজটা আগে ঘটতে দিয়ে, মেনু এক ফ্রেম পরে বন্ধ করি */
      if (event.target.closest('#cbNav a, [data-sangha-open]')) {
        setTimeout(closeNavigation, 0);
      }
      else if (!event.target.closest('.cb-nav-group')) {
        document.querySelectorAll('.cb-nav-group[open]').forEach(function (d) { d.open = false; });
      }
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closeNavigation();
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); openSearch(); }
    });
    document.querySelectorAll('.cb-nav-group').forEach(function (group) {
      group.addEventListener('toggle', function () {
        if (!group.open) return;
        document.querySelectorAll('.cb-nav-group[open]').forEach(function (other) { if (other !== group) other.open = false; });
        /* খোলা গ্রুপের সারাংশ যেন স্ক্রল হয়ে উপরে হারিয়ে না যায় */
        if (window.matchMedia('(max-width: 1100px)').matches) {
          var navEl = document.getElementById('cbNav');
          if (navEl) {
            /* খোলা গ্রুপের সারাংশ শিটের একেবারে উপরে আনি — তাহলে নিচের সব আইটেমই দেখা যায় */
            var sumRect = group.querySelector('summary').getBoundingClientRect();
            var navRect = navEl.getBoundingClientRect();
            navEl.scrollTop = Math.max(0, navEl.scrollTop + (sumRect.top - navRect.top) - 8);
          }
        }
      });
    });
    var burger = document.getElementById('cbBurger'), nav = document.getElementById('cbNav');
    if (burger && nav) burger.addEventListener('click', function () {
      if (nav.classList.contains('open')) closeNavigation(); else openNavigation();
    });
    function refreshTop() {
      var navEl = document.getElementById('cbNav');
      if (navEl && navEl.classList.contains('open')) navEl.style.setProperty('--cb-nav-top', navTop() + 'px');
    }
    window.addEventListener('resize', refreshTop);
    window.addEventListener('orientationchange', refreshTop);
  }

  function loadAssistant() {
    if (window.CharyabhumiSanghaMitra || document.getElementById('cbSanghaScript')) return;
    function addSangha() {
      var script = document.createElement('script');
      script.id = 'cbSanghaScript';
      script.src = 'sanghamitra.js?v=20261024i';
      script.async = true;
      document.head.appendChild(script);
    }
    if (window.CHARYABHUMI_CONFIG || document.getElementById('cbConfigScript')) { addSangha(); return; }
    var cfg = document.createElement('script');
    cfg.id = 'cbConfigScript';
    cfg.src = 'config.js?v=20261024g';
    cfg.async = true;
    cfg.onload = addSangha;
    cfg.onerror = addSangha; /* কনফিগ না মিললেও স্থানীয় মোডে চলবে */
    document.head.appendChild(cfg);
  }

  function buildHeader(info, structure) {
    var bar = document.getElementById('cbHeader');
    if (!bar) return;
    // Remove a race-created standalone language bar when the shared one arrives.
    document.querySelectorAll('.cb-language-standalone').forEach(function (el) { el.remove(); });
    var b = info.brand || {};
    bar.innerHTML = '<div class="cb-language-bar"><div class="cb-wrap cb-language-in">' +
      '<span class="cb-language-mark" aria-hidden="true">☸</span><label for="cbLanguageSelect" data-i18n="language.label">ভাষা / Language</label>' +
      '<select id="cbLanguageSelect" data-language-select aria-describedby="cbLanguageSupport"></select>' +
      '<span id="cbLanguageSupport" class="cb-language-support" role="status"></span></div></div>' +
      '<div class="cb-header-in cb-wrap"><a class="cb-brand" href="index.html" aria-label="' + esc(b.name_bn || 'চর্যাভূমি') + ' — হোম">' +
      '<img src="assets/brand/logo.svg" alt="" width="40" height="40"><span><b>' + esc(b.name_bn || 'চর্যাভূমি') + '</b>' +
      '<small>' + esc(b.tagline || '') + '</small></span></a>' +
      '<button class="cb-burger" id="cbBurger" type="button" aria-expanded="false" aria-controls="cbNav">☰ <span class="sr-only">মেনু</span></button>' +
      '<nav class="cb-nav" id="cbNav" aria-label="প্রধান নেভিগেশন">' + navigation(structure) + '</nav></div>';
    ensureSearch(); bindShell(); loadAssistant();
  }

  function buildFooter(info) {
    var f = document.getElementById('cbFooter');
    if (!f) return;
    var b = info.brand || {}, fo = info.founder || {}, c = info.contact || {};
    f.innerHTML = '<div class="cb-wrap"><div class="cols"><div><div class="brandline">' +
      '<img src="assets/brand/logo.svg" alt="" width="38" height="38"><span><b>' + esc(b.name_bn || '') + ' · ' + esc(b.name_en || '') + '</b><small>' + esc(b.motto || '') + '</small></span></div>' +
      '<p>' + esc(b.tagline || '') + '</p>' + (b.slogan ? '<p style="color:#e6d3ab">' + esc(b.slogan) + '</p>' : '') +
      '<p><b>' + esc(fo.role || '') + ':</b> ' + esc(fo.bn_name || fo.name || '') + '<br>' + esc(fo.since || '') + '</p></div>' +
      '<div><h4>ইতিহাস ও ভ্রমণ</h4><a href="history.html">ইতিহাস ও ঐতিহ্য</a><a href="atlas.html">Research & Travel Atlas</a><a href="index.html#explore">স্থান খুঁজুন ও ম্যাপ</a><a href="tracker.html">আমার ট্রাভেল ট্র্যাকার</a><a href="maps.html">ঐতিহাসিক মানচিত্র</a></div>' +
      '<div><h4>পড়া ও শেখা</h4><a href="library.html">লাইব্রেরি ও আর্কাইভ</a><a href="historical-archive.html">ঐতিহাসিক সংরক্ষণাগার</a><a href="philosophy.html">ধর্ম ও দর্শন</a><a href="children.html">শিশু ও শিক্ষা</a><a href="quiz.html">কুইজ</a></div>' +
      '<div><h4>অংশগ্রহণ</h4><a href="index.html?assistant=1">☸ SanghaMitra</a><a href="atlas.html#field-desk">Field update</a><a href="about.html#contact">ভুল সংশোধন ও যোগাযোগ</a><a href="about.html">আমাদের কথা</a>' +
      (c.channels && c.channels[0] ? '<a href="' + esc(c.channels[0].url) + '">✉️ ' + esc(fo.email || '') + '</a>' : '') + '</div></div>' +
      '<div class="bottom"><span>© ' + new Date().getFullYear() + ' ' + esc(b.name_bn || '') + ' — সব তথ্য সূত্রসহ; ভুল পেলে জানান।</span><span>ফ্রি · সাইন-আপ নেই · বিজ্ঞাপন নেই</span></div></div>';
  }

  Promise.all([fetchJson(INFO).catch(function () { return { brand: {}, founder: {}, contact: {} }; }), fetchJson(STRUCTURE).catch(function () { return FALLBACK; })]).then(function (values) {
    state.info = values[0]; state.structure = values[1];
    buildHeader(state.info, state.structure); buildFooter(state.info);
    document.dispatchEvent(new CustomEvent('cb:info', { detail: state.info }));
    document.dispatchEvent(new CustomEvent('cb:structure', { detail: state.structure }));
  }).catch(function (err) {
    state.info = { brand: { name_bn: 'চর্যাভূমি' }, founder: {}, contact: {} }; state.structure = FALLBACK;
    buildHeader(state.info, state.structure); buildFooter(state.info);
    if (window.console) console.warn('Shared site shell fallback:', err.message);
  });
})();
