/* চর্যাভূমি — সাধারণ হেডার/ফুটার (রাউন্ড ১৩)
   site-info.json থেকে ব্র্যান্ড নাম, মূলমন্ত্র ও যোগাযোগ পড়ে রেন্ডার করে। */
(function () {
  'use strict';
  var INFO = 'data/site-info.json?v=20261024d';
  var state = { info: null };

  // প্রতিটি পাতার মূল কনটেন্ট নিজে লিখে রাখে; এখানে শুধু হেডার-ফুটার বসে।
  var NAV = [
    { href: 'index.html', label: 'হোম', key: 'nav.home' },
    { href: 'index.html#explore', label: 'স্থান খুঁজুন', key: 'nav.explore' },
    { href: 'tracker.html', label: 'আমার ট্রাভেল ট্র্যাকার', key: 'nav.tracker' },
    { href: 'index.html#planner', label: 'ভ্রমণ প্ল্যানার', key: 'nav.planner' },
    { href: 'maps.html', label: 'ঐতিহাসিক মানচিত্র', key: 'nav.maps' },
    { href: 'history.html', label: 'ইতিহাস', key: 'nav.history' },
    { href: 'purna-chandra-tarai.html', label: 'প্রত্নতত্ত্ব-নিবন্ধ', key: 'nav.archaeology' },
    { href: 'philosophy.html', label: 'বৌদ্ধধর্ম', key: 'nav.philosophy' },
    { href: 'culture.html', label: 'শিল্প ও সংস্কৃতি', key: 'nav.culture' },
    { href: 'children.html', label: 'শিশু বিভাগ', key: 'nav.children' },
    { href: 'kings.html', label: 'রাজাদের প্রোফাইল', key: 'nav.kings' },
    { href: 'library.html', label: 'লাইব্রেরি', key: 'nav.library' },
    { href: 'historical-archive.html', label: 'ঐতিহাসিক সংরক্ষণাগার', key: 'nav.archive' },
    { href: 'contribution.html', label: 'অবদান', key: 'nav.contribution' },
    { href: 'institutions.html', label: 'সামাজিক প্রতিষ্ঠান', key: 'nav.institutions' },
    { href: 'calendar.html', label: 'পঞ্জিকা', key: 'nav.calendar' },
    { href: 'quiz.html', label: 'কুইজ', key: 'nav.quiz', cta: true },
    { href: 'about.html', label: 'আমাদের কথা', key: 'nav.about' }
  ];

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function here() {
    var p = (location.pathname.split('/').pop() || 'index.html');
    return p === '' ? 'index.html' : p;
  }

  function buildHeader(info) {
    var bar = document.getElementById('cbHeader');
    if (!bar) return;
    var b = info.brand || {};
    var cur = here();
    var links = NAV.map(function (n) {
      var base = n.href.split('#')[0];
      var isCur = (base === cur) && (!n.href.split('#')[1]);
      return '<a href="' + esc(n.href) + '"' + (isCur ? ' aria-current="page"' : '') +
        (n.cta ? ' class="cb-nav-cta"' : '') + (n.key ? ' data-i18n="' + esc(n.key) + '"' : '') + '>' + esc(n.label) + '</a>';
    }).join('');
    bar.innerHTML =
      '<div class="cb-language-bar"><div class="cb-wrap cb-language-in">' +
        '<span class="cb-language-mark" aria-hidden="true">☸</span>' +
        '<label for="cbLanguageSelect" data-i18n="language.label">ভাষা / Language</label>' +
        '<select id="cbLanguageSelect" data-language-select aria-describedby="cbLanguageSupport"></select>' +
        '<span id="cbLanguageSupport" class="cb-language-support" role="status"></span>' +
      '</div></div>' +
      '<div class="cb-header-in cb-wrap">' +
        '<a class="cb-brand" href="index.html" aria-label="' + esc(b.name_bn || 'চর্যাভূমি') + ' — হোম">' +
          '<img src="assets/brand/logo.svg" alt="" width="40" height="40">' +
          '<span><b>' + esc(b.name_bn || 'চর্যাভূমি') + '</b>' +
          '<small>' + esc(b.tagline || '') + '</small></span>' +
        '</a>' +
        '<button class="cb-burger" id="cbBurger" type="button" aria-expanded="false" aria-controls="cbNav">☰ <span class="sr-only">মেনু</span></button>' +
        '<nav class="cb-nav" id="cbNav" aria-label="প্রধান নেভিগেশন">' + links + '</nav>' +
      '</div>';
    var burger = document.getElementById('cbBurger');
    var nav = document.getElementById('cbNav');
    if (burger && nav) {
      burger.addEventListener('click', function () {
        var open = nav.classList.toggle('open');
        burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }
  }

  function buildFooter(info) {
    var f = document.getElementById('cbFooter');
    if (!f) return;
    var b = info.brand || {}, fo = info.founder || {}, c = info.contact || {};
    f.innerHTML =
      '<div class="cb-wrap">' +
        '<div class="cols">' +
          '<div>' +
            '<div class="brandline">' +
              '<img src="assets/brand/logo.svg" alt="" width="38" height="38">' +
              '<span><b>' + esc(b.name_bn || '') + ' · ' + esc(b.name_en || '') + '</b>' +
              '<small>' + esc(b.motto || '') + '</small></span>' +
            '</div>' +
            '<p>' + esc(b.tagline || '') + '</p>' +
            (b.slogan ? '<p style="color:#e6d3ab">' + esc(b.slogan) + '</p>' : '') +
            '<p><b>' + esc(fo.role || '') + ':</b> ' + esc(fo.bn_name || fo.name || '') + '<br>' +
              esc(fo.since || '') + '</p>' +
          '</div>' +
          '<div><h4>ঘুরে দেখুন</h4>' +
            '<a href="index.html#explore">স্থান খুঁজুন</a>' +
            '<a href="index.html#planner">ভ্রমণ প্ল্যানার</a>' +
            '<a href="about.html#rail">ট্রেনের তথ্য</a>' +
            '<a href="about.html#emergency">জরুরি নম্বর</a>' +
          '</div>' +
          '<div><h4>জানুন</h4>' +
            '<a href="history.html">ইতিহাস</a>' +
            '<a href="purna-chandra-tarai.html">প্রত্নতত্ত্ব-নিবন্ধ</a>' +
            '<a href="maps.html">ঐতিহাসিক মানচিত্র</a>' +
            '<a href="culture.html">শিল্প ও সংস্কৃতি</a>' +
            '<a href="children.html">শিশু বিভাগ · খেলা ও craft</a>' +
            '<a href="kings.html">রাজাদের প্রোফাইল</a>' +
            '<a href="library.html">লাইব্রেরি</a>' +
            '<a href="historical-archive.html">ঐতিহাসিক সংরক্ষণাগার</a>' +
            '<a href="quiz.html">কুইজ ও লিডারবোর্ড</a>' +
          '</div>' +
          '<div><h4>যোগাযোগ</h4>' +
            '<a href="' + esc(c.channels && c.channels[0] ? c.channels[0].url : '#') + '">✉️ ' + esc(fo.email || '') + '</a>' +
            '<a href="' + esc(fo.whatsapp_link || '#') + '">💬 হোয়াটসঅ্যাপ</a>' +
            '<a href="about.html">আমাদের কথা</a>' +
            '<a href="' + esc(fo.site || '#') + '" target="_blank" rel="noopener">প্রতিষ্ঠাতার সাইট</a>' +
          '</div>' +
        '</div>' +
        '<div class="bottom">' +
          '<span>© ' + new Date().getFullYear() + ' ' + esc(b.name_bn || '') + ' — সব তথ্য সূত্রসহ; ভুল পেলে জানান।</span>' +
          '<span>ফ্রি · সাইন-আপ নেই · বিজ্ঞাপন নেই</span>' +
        '</div>' +
      '</div>';
  }

  fetch(INFO).then(function (r) {
    if (!r.ok) throw new Error('site-info ' + r.status);
    return r.json();
  }).then(function (info) {
    state.info = info;
    buildHeader(info);
    buildFooter(info);
    document.dispatchEvent(new CustomEvent('cb:info', { detail: info }));
  }).catch(function (err) {
    buildHeader({ brand: { name_bn: 'চর্যাভূমি', tagline: 'বাংলাদেশের বৌদ্ধ ঐতিহ্য — ভ্রমণ, ইতিহাস, মানুষ' } });
    buildFooter({ brand: { name_bn: 'চর্যাভূমি', motto: 'হাজার বছরের পথ ধরে' }, founder: {} });
    if (window.console) console.warn('site-info লোড হয়নি:', err.message);
  });
})();
