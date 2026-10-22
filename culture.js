/* রাউন্ড ১২ — শিল্প, সমাজ-আচার, ভিক্ষু-জীবন ও ইতিহাস
   data/heritage-culture.json + data/heritage-library.json (মিডিয়া রেফারেন্স) */
(function () {
  'use strict';
  var CULTURE = 'data/heritage-culture.json?v=20261022a';
  var LIBRARY = 'data/heritage-library.json?v=20261022a';
  var list = document.getElementById('culList');
  if (!list) return;

  var state = { q: '', sec: 'all', media: 'all', data: null, lib: {} };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function bn(n) { return Number(n).toLocaleString('bn-BD'); }
  function norm(s) { return String(s || '').toLowerCase().replace(/\s+/g, ' ').trim(); }

  var STATUS = {
    verified: ['সূত্রে নিশ্চিত', 'ok'],
    partial: ['আংশিক — কিছুটা লোকাচার/সেকেন্ডারি', 'warn'],
    thin: ['সরু প্রমাণ — যাচাই বাকি', 'mute']
  };
  var MEDIA_META = {
    video: { icon: '🎬', label: 'ভিডিও দেখুন' },
    audio: { icon: '🎧', label: 'অডিও শুনুন' },
    pdf: { icon: '📕', label: 'বই / PDF' },
    image: { icon: '📷', label: 'ছবি' }
  };

  /* ---- মিডিয়া রেফারেন্স সমাধান ---------------------------------- */
  function resolve(ref) {
    if (!ref) return null;
    if (ref.indexOf('lib:') === 0) {
      var it = state.lib[ref.slice(4)];
      if (!it) return null;
      var dl = it.download;
      dl = Array.isArray(dl) ? dl[0] : dl;
      return {
        kind: it.type, title: it.title, sub: it.sub,
        view: it.view, file: dl || it.view,
        creator: it.creator, role: it.role, year: it.year,
        language: it.language, place: it.place, source: it.source,
        rights: it.rights, license: null, credit: null, thumb: null
      };
    }
    var im = state.data.images[ref];
    if (!im) return null;
    return {
      kind: 'image', title: im.title, thumb: im.thumb, view: im.page,
      file: im.thumb, license: im.license, credit: im.artist, source: 'উইকিমিডিয়া কমন্স'
    };
  }

  function mediaBtn(m, kind) {
    if (!m) return '';
    var meta = MEDIA_META[kind] || MEDIA_META.image;
    var extra = '';
    if (m.creator) extra = ' · ' + esc(m.creator);
    return '<a class="cul-mbtn ' + kind + '" href="' + esc(m.view || m.file) + '" target="_blank" rel="noopener noreferrer" title="' + esc(m.title) + '">' +
      '<span class="cul-mico">' + meta.icon + '</span>' +
      '<span class="cul-mtx"><strong>' + meta.label + '</strong><small>' + esc(m.title) + extra + '</small></span></a>' +
      '<a class="cul-mdl" href="' + esc(m.file) + '" target="_blank" rel="noopener noreferrer" download>⬇ ফাইল</a>';
  }

  function figure(ref, big) {
    var m = resolve(ref);
    if (!m) return '';
    var lic = m.license ? '<a class="cul-lic" href="' + esc(m.view) + '" target="_blank" rel="noopener noreferrer">' + esc(m.license) + '</a>' : '';
    return '<figure class="cul-fig' + (big ? ' big' : '') + '">' +
      '<a href="' + esc(m.view || m.file) + '" target="_blank" rel="noopener noreferrer">' +
      '<img src="' + esc(m.thumb || m.file) + '" alt="' + esc(m.title) + '" loading="lazy" decoding="async"></a>' +
      '<figcaption><span>' + esc(m.title) + '</span>' + lic + '</figcaption></figure>';
  }

  /* ---- এন্ট্রি ------------------------------------------------------ */
  function entryHtml(e) {
    var st = STATUS[e.status] || STATUS.partial;
    var imgs = (e.media.images || []).map(function (r) { return r; });
    var hero = imgs.length ? figure(imgs[0], true) : '';
    var rest = imgs.slice(1).map(function (r) { return figure(r, false); }).join('');
    var pts = (e.points || []).map(function (p) {
      return '<div class="cul-pt"><dt>' + esc(p.k) + '</dt><dd>' + esc(p.v) + '</dd></div>';
    }).join('');
    var av = ['video', 'audio', 'pdf'].map(function (k) {
      var m = resolve(e.media[k]);
      return m ? '<div class="cul-avrow">' + mediaBtn(m, k) + '</div>' : '';
    }).join('');
    var src = (e.sources || []).map(function (s) {
      return '<li><a href="' + esc(s.u) + '" target="_blank" rel="noopener noreferrer">' + esc(s.t) + '</a></li>';
    }).join('');
    return '<article class="cul-card" id="e-' + esc(e.id) + '">' +
      '<div class="cul-side">' + hero + '</div>' +
      '<div class="cul-main">' +
        '<p class="cul-badge ' + st[1] + '">' + esc(st[0]) + '</p>' +
        '<h3>' + esc(e.title) + '</h3>' +
        '<p class="cul-sub">' + esc(e.sub) + '</p>' +
        '<p class="cul-about">' + esc(e.about) + '</p>' +
        (pts ? '<dl class="cul-points">' + pts + '</dl>' : '') +
        (av ? '<div class="cul-av">' + av + '</div>' : '') +
        (rest ? '<div class="cul-gallery">' + rest + '</div>' : '') +
        (src ? '<details class="cul-src"><summary>সূত্র ও মূল লেখা (' + bn((e.sources || []).length) + ')</summary><ul>' + src + '</ul></details>' : '') +
      '</div></article>';
  }

  function blockMedia(sec) {
    var parts = [];
    [['image', sec.media.image], ['video', sec.media.video], ['audio', sec.media.audio], ['pdf', sec.media.pdf]]
      .forEach(function (p) {
        var m = resolve(p[1]);
        if (m) parts.push(mediaBtn(m, p[0]));
      });
    return parts.length ? '<div class="cul-blockav"><p class="cul-blockav-t">এই বিভাগের চারটি মিডিয়া</p><div class="cul-blockav-g">' + parts.join('') + '</div></div>' : '';
  }

  function sectionHtml(sec) {
    var entries = sec.entries.filter(match);
    if (!entries.length) return '';
    var head = '<div class="cul-sechead">' +
      '<p class="cul-secno">বিভাগ ' + esc(sec.no) + '</p>' +
      '<h2 id="sec-' + esc(sec.id) + '">' + esc(sec.title) + '</h2>' +
      '<p class="hist-sub">' + esc(sec.lead) + '</p>' +
      blockMedia(sec) + '</div>';
    return '<section class="cul-sec-block">' + head + entries.map(entryHtml).join('') + '</section>';
  }

  /* ---- ছাঁকনি ------------------------------------------------------ */
  function match(e) {
    if (state.media !== 'all') {
      if (state.media === 'image' && !(e.media.images || []).length) return false;
      if (state.media !== 'image' && !e.media[state.media]) return false;
    }
    if (!state.q) return true;
    var hay = [e.title, e.sub, e.about,
      (e.points || []).map(function (p) { return p.k + ' ' + p.v; }).join(' '),
      (e.sources || []).map(function (s) { return s.t; }).join(' '),
      (e.media.images || []).join(' '), e.media.video || '', e.media.audio || '', e.media.pdf || ''
    ].join(' ');
    return norm(hay).indexOf(state.q) > -1;
  }

  function inSection(sec) {
    return state.sec === 'all' || state.sec === sec.id;
  }

  function render() {
    var total = 0, html = '';
    state.data.sections.forEach(function (sec) {
      if (!inSection(sec)) return;
      var s = sectionHtml(sec);
      if (s) { html += s; total += sec.entries.filter(match).length; }
    });
    list.innerHTML = html;
    var cnt = document.getElementById('culCount');
    if (cnt) cnt.textContent = total ? bn(total) + 'টি এন্ট্রি দেখানো হচ্ছে' : '';
    var empty = document.getElementById('culEmpty');
    if (empty) empty.hidden = total > 0;
  }

  function chips() {
    var box = document.getElementById('culSectionFilters');
    if (!box) return;
    var items = [{ id: 'all', no: 'সব', title: 'সব বিভাগ' }].concat(state.data.sections.map(function (s) {
      return { id: s.id, no: s.no, title: s.title };
    }));
    box.innerHTML = items.map(function (s) {
      return '<button type="button" class="lib-chip' + (state.sec === s.id ? ' on' : '') + '" data-sec="' + esc(s.id) + '">' +
        (s.id === 'all' ? '☸ ' : esc(s.no) + '. ') + esc(s.title) + '</button>';
    }).join('');
    box.querySelectorAll('[data-sec]').forEach(function (b) {
      b.addEventListener('click', function () {
        state.sec = b.getAttribute('data-sec');
        chips(); render();
      });
    });
  }

  function jump() {
    var box = document.getElementById('culJump');
    if (!box) return;
    box.innerHTML = state.data.sections.map(function (s) {
      return '<a href="#sec-' + esc(s.id) + '">' + esc(s.no) + '. ' + esc(s.title) + '</a>';
    }).join('');
  }

  function legend() {
    var box = document.getElementById('culLegend');
    if (!box) return;
    var labels = state.data.status_labels || {};
    box.innerHTML = Object.keys(labels).map(function (k) {
      var st = STATUS[k] || ['', 'mute'];
      return '<div class="cul-lg"><span class="cul-badge ' + st[1] + '">' + esc(st[0]) + '</span><p>' +
        { verified: 'সূত্রে সরাসরি পাওয়া গেছে (বাংলাপিডিয়া, জাদুঘর-নথি, বই)।',
          partial: 'মূল কাঠামো সূত্রে আছে, কিন্তু কিছু অংশ লোকাচার বা সেকেন্ডারি সূত্রের।',
          thin: 'নির্ভরযোগ্য লিখিত সূত্র পাওয়া যায়নি — এন্ট্রিটি গবেষণার ইঙ্গিত হিসেবে রাখা হয়েছে।' }[k] +
        '</p></div>';
    }).join('') +
      '<div class="cul-lg"><span class="cul-badge ok">📷 🎬 🎧 📕</span><p>প্রতিটি এন্ট্রিতে ছবি; প্রতিটি বিভাগের মাথায় ছবি-ভিডিও-অডিও-PDF চারটি মিডিয়াই দেওয়া আছে। প্রতিটি লিংকের পাশে ⬇ ফাইল বোতামে সরাসরি ডাউনলোড।</p></div>';
  }

  function bind() {
    var q = document.getElementById('culSearch');
    if (q) q.addEventListener('input', function () {
      state.q = norm(q.value);
      render();
    });
    var md = document.getElementById('culMedia');
    if (md) md.addEventListener('change', function () { state.media = md.value; render(); });
    var rs = document.getElementById('culReset');
    if (rs) rs.addEventListener('click', function () {
      state.q = ''; state.media = 'all'; state.sec = 'all';
      if (q) q.value = '';
      if (md) md.value = 'all';
      chips(); render();
    });
  }

  Promise.all([
    fetch(CULTURE).then(function (r) { if (!r.ok) throw new Error('culture ' + r.status); return r.json(); }),
    fetch(LIBRARY).then(function (r) { if (!r.ok) throw new Error('library ' + r.status); return r.json(); })
  ]).then(function (res) {
    state.data = res[0];
    (res[1].items || []).forEach(function (it) { state.lib[it.id] = it; });

    var s = state.data.stats;
    var stats = document.getElementById('culStats');
    if (stats) {
      stats.innerHTML = [
        ['বিভাগ', bn(s.sections)], ['এন্ট্রি', bn(s.entries)], ['ছবি', bn(s.images)],
        ['ভিডিও', bn(s.links_video)], ['অডিও', bn(s.links_audio)], ['বই/PDF', bn(s.links_pdf)]
      ].map(function (p) { return '<div class="cs-box"><strong>' + p[1] + '</strong><span>' + p[0] + '</span></div>'; }).join('');
    }
    var lead = document.getElementById('culLead');
    if (lead && state.data.intro) lead.textContent = state.data.intro;
    var note = document.getElementById('culNote');
    if (note) note.textContent = 'যে দাবির লিখিত সূত্র পাওয়া যায়নি, সেটি “সরু প্রমাণ — যাচাই বাকি” হিসেবে চিহ্নিত। কোনো নাম, তারিখ বা ছবি অনুমান করে বসানো হয়নি।';

    jump(); chips(); legend(); bind(); render();
  }).catch(function (err) {
    list.innerHTML = '<p class="hist-sub">ডেটা লোড করা যায়নি (' + esc(err.message) + ')।</p>';
  });
})();
