/* বৌদ্ধ ঐতিহ্য লাইব্রেরি — data/heritage-library.json থেকে রেন্ডার */
(function () {
  'use strict';
  var DATA = 'data/heritage-library.json?v=20261022a';
  var list = document.getElementById('libList');
  if (!list) return;

  var state = { q: '', type: 'all', topic: 'all', lang: 'all', data: null };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function bn(n) { return Number(n).toLocaleString('bn-BD'); }
  function norm(s) { return String(s || '').toLowerCase().replace(/\s+/g, ' ').trim(); }

  var TYPE_META = {
    pdf: { icon: '📕', label: 'বই / PDF', dl: 'PDF ডাউনলোড' },
    audio: { icon: '🎧', label: 'অডিও', dl: 'অডিও ডাউনলোড' },
    video: { icon: '🎬', label: 'ভিডিও', dl: 'ভিডিও' },
    image: { icon: '📷', label: 'ছবি', dl: 'ছবি ডাউনলোড' },
    article: { icon: '📄', label: 'নিবন্ধ', dl: 'PDF' }
  };
  var RIGHTS = {
    'public-domain': ['পাবলিক ডোমেইন', 'ok'],
    'cc': ['কমন্স লাইসেন্স', 'ok'],
    'unknown': ['কপিরাইট অস্পষ্ট', 'warn'],
    'view-only': ['শুধু দেখা', 'mute']
  };

  function downloads(it) {
    var d = it.download;
    if (!d) return [];
    return Array.isArray(d) ? d : [d];
  }

  function match(it) {
    if (state.type !== 'all' && it.type !== state.type) return false;
    if (state.topic !== 'all' && (it.topics || []).indexOf(state.topic) === -1) return false;
    if (state.lang !== 'all' && it.language !== state.lang) return false;
    if (!state.q) return true;
    var hay = [it.title, it.sub, it.creator, it.role, it.year, it.language, it.place, it.about,
      (it.topics || []).map(function (t) { return t; }).join(' '), it.source, it.note].join(' ');
    return norm(hay).indexOf(state.q) > -1;
  }

  function cardHtml(it) {
    var tm = TYPE_META[it.type] || { icon: '📄', label: it.type, dl: 'ডাউনলোড' };
    var rt = RIGHTS[it.rights] || RIGHTS.unknown;
    var dls = downloads(it);
    var dlHtml;
    if (dls.length) {
      dlHtml = dls.map(function (u, i) {
        return '<a class="lib-btn dl" href="' + esc(u) + '" target="_blank" rel="noopener noreferrer" download>' +
          '⬇ ' + esc(tm.dl) + (dls.length > 1 ? ' ' + bn(i + 1) : '') + '</a>';
      }).join('');
    } else {
      dlHtml = '<span class="lib-btn dl off" title="কপিরাইট সুরক্ষার কারণে ডাউনলোডের সুযোগ নেই">⬇ ডাউনলোড নেই</span>';
    }
    var thumb = (it.type === 'image' && dls.length)
      ? '<a class="lib-thumb" href="' + esc(it.view) + '" target="_blank" rel="noopener noreferrer">' +
        '<img loading="lazy" src="' + esc(dls[0]) + '" alt="' + esc(it.title) + '" referrerpolicy="no-referrer"></a>'
      : '';
    return '<article class="lib-card t-' + esc(it.type) + '" id="' + esc(it.id) + '">' +
      thumb +
      '<div class="lib-body">' +
      '<div class="lib-top"><span class="lib-type">' + tm.icon + ' ' + esc(tm.label) + '</span>' +
      '<span class="lib-rights ' + rt[1] + '">' + esc(rt[0]) + '</span></div>' +
      '<h3>' + esc(it.title) + '</h3>' +
      (it.sub ? '<p class="lib-sub">' + esc(it.sub) + '</p>' : '') +
      '<p class="lib-meta"><strong>' + esc(it.creator) + '</strong>' + (it.role ? ' · ' + esc(it.role) : '') + '</p>' +
      '<p class="lib-meta2">' + [it.year, it.language, it.place].filter(Boolean).map(esc).join(' · ') + '</p>' +
      '<p class="lib-about">' + esc(it.about) + '</p>' +
      '<div class="lib-chips">' + (it.topics || []).map(function (t) {
        var lbl = (state.data.topics[t] || t);
        return '<button type="button" class="lib-chip" data-topic="' + esc(t) + '">' + esc(lbl) + '</button>';
      }).join('') + '</div>' +
      '<div class="lib-actions">' +
        '<a class="lib-btn view" href="' + esc(it.view) + '" target="_blank" rel="noopener noreferrer">👁 দেখুন</a>' +
        dlHtml +
      '</div>' +
      '<p class="lib-src">সূত্র: ' + esc(it.source) + (it.note ? ' — ' + esc(it.note) : '') + '</p>' +
      '</div></article>';
  }

  function render() {
    var data = state.data;
    var items = data.items.filter(match);
    list.innerHTML = items.map(cardHtml).join('');
    var empty = document.getElementById('libEmpty');
    if (empty) empty.hidden = items.length > 0;
    var c = document.getElementById('libCount');
    if (c) {
      c.innerHTML = '**সব** ' + bn(data.items.length) + 'টি এন্ট্রির মধ্যে <strong>' + bn(items.length) + '</strong>টি দেখানো হচ্ছে' +
        (state.q ? ' — খোঁজা হয়েছে: “' + esc(state.q) + '”' : '') + '।';
      c.innerHTML = c.innerHTML.replace('**সব**', '<strong>সব</strong>');
    }
  }

  function chips(containerId, kind) {
    var data = state.data, box = document.getElementById(containerId);
    if (!box) return;
    var opts = [];
    if (kind === 'type') {
      opts.push({ k: 'all', t: 'সব ধরন', n: data.items.length });
      data.types.forEach(function (t) {
        var n = data.items.filter(function (i) { return i.type === t.key; }).length;
        if (n) opts.push({ k: t.key, t: t.label, n: n });
      });
    } else {
      opts.push({ k: 'all', t: 'সব বিষয়', n: 0 });
      Object.keys(data.topics).forEach(function (k) {
        var n = data.items.filter(function (i) { return (i.topics || []).indexOf(k) > -1; }).length;
        if (n) opts.push({ k: k, t: data.topics[k], n: n });
      });
    }
    var cur = kind === 'type' ? state.type : state.topic;
    box.innerHTML = opts.map(function (o) {
      return '<button type="button" class="cs-chip' + (cur === o.k ? ' on' : '') + '" data-kind="' + kind + '" data-v="' + esc(o.k) + '">' +
        esc(o.t) + (o.n ? ' <span>' + bn(o.n) + '</span>' : '') + '</button>';
    }).join('');
  }

  function bind() {
    document.getElementById('libTypeFilters').addEventListener('click', function (e) {
      var b = e.target.closest('button[data-v]'); if (!b) return;
      state.type = b.dataset.v; chips('libTypeFilters', 'type'); render();
    });
    document.getElementById('libTopicFilters').addEventListener('click', function (e) {
      var b = e.target.closest('button[data-v]'); if (!b) return;
      state.topic = b.dataset.v; chips('libTopicFilters', 'topic'); render();
    });
    list.addEventListener('click', function (e) {
      var b = e.target.closest('.lib-chip'); if (!b) return;
      state.topic = b.dataset.topic; chips('libTopicFilters', 'topic'); render();
      document.getElementById('browse').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    var q = document.getElementById('libSearch'), t;
    q.addEventListener('input', function () {
      clearTimeout(t);
      t = setTimeout(function () { state.q = norm(q.value); render(); }, 140);
    });
    var lang = document.getElementById('libLanguage');
    lang.addEventListener('change', function () { state.lang = lang.value; render(); });
    document.getElementById('libReset').addEventListener('click', function () {
      state = { q: '', type: 'all', topic: 'all', lang: 'all', data: state.data };
      q.value = ''; lang.value = 'all';
      chips('libTypeFilters', 'type'); chips('libTopicFilters', 'topic'); render();
    });
  }

  fetch(DATA, { cache: 'no-store' })
    .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(function (data) {
      state.data = data;
      var s = data.stats;
      var stats = document.getElementById('libStats');
      if (stats) {
        stats.innerHTML = [
          ['মোট', bn(s.total)], ['বই/PDF', bn(s.pdf || 0)], ['অডিও', bn(s.audio || 0)],
          ['ভিডিও', bn(s.video || 0)], ['ছবি', bn(s.image || 0)], ['ভাষা', bn(s.languages || 0)]
        ].map(function (p) { return '<div class="cs-box"><strong>' + p[1] + '</strong><span>' + p[0] + '</span></div>'; }).join('');
      }
      var lead = document.getElementById('libLead');
      if (lead) lead.innerHTML = data.intro[0];
      var note = document.getElementById('libNote');
      if (note) note.textContent = data.intro[2];
      var notes = document.getElementById('libNotes');
      if (notes) notes.innerHTML = data.notes.map(function (n) {
        return '<div class="lib-note"><strong>' + esc(n.title) + '</strong><p>' + esc(n.text) + '</p></div>';
      }).join('');
      var sel = document.getElementById('libLanguage');
      var langs = Array.from(new Set(data.items.map(function (i) { return i.language; }).filter(Boolean))).sort();
      sel.insertAdjacentHTML('beforeend', langs.map(function (l) { return '<option value="' + esc(l) + '">' + esc(l) + '</option>'; }).join(''));
      chips('libTypeFilters', 'type');
      chips('libTopicFilters', 'topic');
      bind();
      render();
    })
    .catch(function (err) {
      list.innerHTML = '<p class="hist-sub">ডেটা লোড করা যায়নি (' + esc(err.message) + ')।</p>';
    });
})();
