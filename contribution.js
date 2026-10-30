/* ক্ষেত্রভিত্তিক অবদান — data/heritage-contributions.json থেকে রেন্ডার */
(function () {
  'use strict';
  var DATA = 'data/heritage-contributions.json?v=20261022a';
  var root = document.getElementById('contribList');
  if (!root) return;

  var state = { q: '', status: 'all', data: null };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function bn(n) { return Number(n).toLocaleString('bn-BD'); }
  function norm(s) { return String(s || '').toLowerCase().replace(/\s+/g, ' ').trim(); }

  var STATUS_LABEL = { verified: 'যাচাইকৃত', partial: 'আংশিক', thin: 'প্রমাণ অপ্রতুল', rejected: 'প্রত্যাখ্যাত' };
  var KIND_LABEL = {
    person: '👤 ব্যক্তি', group: '👥 গোষ্ঠী', monk: '🧘 ভিক্ষু/ভান্তে', lay: '🏠 গৃহী', institute: '🏛️ প্রতিষ্ঠান'
  };
  var TYPE_ICON = { image: '📷', audio: '🎧', video: '🎬', book: '📖', doc: '📜', object: '🏺', site: '🏛️' };

  function matches(entry, d) {
    if (state.status !== 'all' && entry.status !== state.status) return false;
    if (!state.q) return true;
    var hay = [entry.name, entry.role, entry.era, entry.place, d.name, d.period,
      (entry.claims || []).join(' '), (entry.works || []).join(' '),
      (entry.sources || []).map(function (s) { return s.label; }).join(' ')].join(' ');
    return norm(hay).indexOf(state.q) > -1;
  }

  function evidenceHtml(ev) {
    if (ev.type === 'image') {
      return '<figure class="ev-figure">' +
        '<img loading="lazy" src="' + esc(ev.url) + '" alt="' + esc(ev.label) + '" referrerpolicy="no-referrer">' +
        '<figcaption><strong>' + esc(ev.label) + '</strong>' +
        (ev.note ? '<span class="ev-note">' + esc(ev.note) + '</span>' : '') +
        '<span class="ev-meta">' + (ev.license ? 'লাইসেন্স: ' + esc(ev.license) : '') +
        (ev.source_page ? ' · <a href="' + esc(ev.source_page) + '" target="_blank" rel="noopener noreferrer">মূল পাতা</a>' : '') +
        '</span></figcaption></figure>';
    }
    return '<a class="ev-link ev-' + esc(ev.type) + '" href="' + esc(ev.url) + '" target="_blank" rel="noopener noreferrer">' +
      '<span class="ev-icon" aria-hidden="true">' + (TYPE_ICON[ev.type] || '🔗') + '</span>' +
      '<span class="ev-body"><strong>' + esc(ev.label) + '</strong>' +
      (ev.note ? '<span class="ev-note">' + esc(ev.note) + '</span>' : '') +
      '<span class="ev-meta">' + esc(ev.type === 'audio' ? 'অডিও শুনুন' : ev.type === 'video' ? 'ভিডিও দেখুন' : ev.type === 'book' ? 'গ্রন্থ/নথি খুলুন' : 'সূত্র খুলুন') + ' ↗</span></span></a>';
  }

  function entryHtml(e) {
    var works = (e.works || []).filter(function (w) { return w && w !== '—'; });
    var claims = (e.claims || []).filter(function (c) { return c && c !== '—'; });
    return '<article class="contrib-card st-' + esc(e.status) + '" id="' + esc(e.id) + '">' +
      '<header class="cc-head">' +
        '<h4>' + esc(e.name) + '</h4>' +
        '<div class="cc-flags">' +
          '<span class="cc-kind">' + (KIND_LABEL[e.kind] || esc(e.kind)) + '</span>' +
          '<span class="cc-status" title="' + esc(e.statusNote) + '">' + esc(STATUS_LABEL[e.status] || e.status) + '</span>' +
        '</div>' +
      '</header>' +
      '<p class="cc-meta">' + esc(e.role) + ' · <strong>' + esc(e.era) + '</strong> · ' + esc(e.place) + '</p>' +
      (claims.length ? '<ul class="cc-claims">' + claims.map(function (c) { return '<li>' + esc(c) + '</li>'; }).join('') + '</ul>' : '') +
      (works.length ? '<div class="cc-works"><span class="cc-label">কাজ ও রচনার তালিকা</span><div class="cc-chips">' +
        works.map(function (w) { return '<span class="cc-chip">' + esc(w) + '</span>'; }).join('') + '</div></div>' : '') +
      (e.statusNote ? '<p class="cc-verifynote"><strong>যাচাই-নোট:</strong> ' + esc(e.statusNote) + '</p>' : '') +
      ((e.evidence || []).length ? '<div class="cc-evidence">' + e.evidence.map(evidenceHtml).join('') + '</div>' : '') +
      '<footer class="cc-foot">' +
        (e.sources || []).map(function (s) {
          return '<a class="cc-src" href="' + esc(s.url) + '"' + (/^https?:/.test(s.url) ? ' target="_blank" rel="noopener noreferrer"' : '') + '>' + esc(s.label) + ' ↗</a>';
        }).join('') +
        (e.kingRef ? '<a class="cc-src cc-king" href="kings.html?id=' + esc(e.kingRef) + '">ব্যক্তি-প্রোফাইলে দেখুন →</a>' : '') +
      '</footer>' +
    '</article>';
  }

  function domainHtml(d, entries) {
    return '<section class="hist-section contrib-domain' + (d.id === 'nritto' || d.id === 'badyojontro' ? ' alt' : '') + '" id="d-' + esc(d.id) + '">' +
      '<div class="wrap">' +
        '<h2><span class="dm-icon" aria-hidden="true">' + esc(d.icon) + '</span> ' + esc(d.name) + '</h2>' +
        '<p class="dm-period">' + esc(d.period) + ' · ' + bn(entries.length) + 'টি এন্ট্রি</p>' +
        '<p class="hist-sub">' + esc(d.summary) + '</p>' +
        '<p class="dm-philosophy"><strong>দর্শন-প্রভাব:</strong> ' + esc(d.philosophy) + '</p>' +
        (d.note ? '<p class="cc-verifynote">' + esc(d.note) + '</p>' : '') +
        '<div class="contrib-grid">' + entries.map(entryHtml).join('') + '</div>' +
      '</div></section>';
  }

  function render() {
    var data = state.data;
    var html = '', total = 0, shown = 0;
    data.domains.forEach(function (d) {
      var entries = (d.entries || []).filter(function (e) { return matches(e, d); });
      total += d.entries.length;
      if (!entries.length) return;
      shown += entries.length;
      html += domainHtml(d, entries);
    });
    root.innerHTML = html;
    var empty = document.getElementById('contribEmpty');
    if (empty) empty.hidden = shown > 0;
    var note = document.getElementById('contribNote');
    if (note && state.q) note.textContent = '“' + state.q + '” — ' + bn(shown) + '/' + bn(total) + 'টি এন্ট্রি দেখানো হচ্ছে।';
    else if (note) note.textContent = data.method_note;
    document.querySelectorAll('#contribDomainJump a').forEach(function (a) {
      a.classList.toggle('is-off', !document.getElementById('d-' + a.dataset.d));
    });
  }

  function buildFilters() {
    var data = state.data;
    var st = document.getElementById('contribStatusFilters');
    if (st) {
      var counts = {};
      data.domains.forEach(function (d) { d.entries.forEach(function (e) { counts[e.status] = (counts[e.status] || 0) + 1; }); });
      var opts = [{ k: 'all', t: 'সব' }].concat(data.status_scale.map(function (s) { return { k: s.key, t: s.label }; }));
      st.innerHTML = opts.map(function (o) {
        var n = o.k === 'all' ? data.stats.entries : (counts[o.k] || 0);
        return '<button type="button" class="cs-chip' + (state.status === o.k ? ' on' : '') + '" data-status="' + o.k + '">' + esc(o.t) + ' <span>' + bn(n) + '</span></button>';
      }).join('');
      st.addEventListener('click', function (ev) {
        var b = ev.target.closest('button[data-status]');
        if (!b) return;
        state.status = b.dataset.status;
        st.querySelectorAll('.cs-chip').forEach(function (x) { x.classList.toggle('on', x === b); });
        render();
      });
    }
    var jump = document.getElementById('contribDomainJump');
    if (jump) {
      jump.innerHTML = data.domains.map(function (d, i) {
        return '<a href="#d-' + esc(d.id) + '" data-d="' + esc(d.id) + '" class="dj-chip">' + esc(d.icon) + ' ' + esc(d.name) + '</a>';
      }).join('');
    }
    var stats = document.getElementById('contribStats');
    if (stats) {
      var s = data.stats;
      stats.innerHTML = [
        ['ক্ষেত্র', bn(s.domains)], ['এন্ট্রি', bn(s.entries)],
        ['যাচাইকৃত', bn(s.verified)], ['আংশিক', bn(s.partial)],
        ['প্রমাণ অপ্রতুল', bn(s.thin)], ['প্রত্যাখ্যাত', bn(s.rejected)]
      ].map(function (p) { return '<div class="cs-box"><strong>' + p[1] + '</strong><span>' + p[0] + '</span></div>'; }).join('');
    }
    var lead = document.getElementById('contribLead');
    if (lead) lead.textContent = data.intro[0];
    var note = document.getElementById('contribNote');
    if (note) note.textContent = data.method_note;
    var method = document.getElementById('contribMethod');
    if (method) method.textContent = data.intro.slice(1).join(' ');
    var scale = document.getElementById('contribScale');
    if (scale) scale.innerHTML = data.status_scale.map(function (s) { return '<li><strong>' + esc(s.label) + '</strong> — ' + esc(s.desc) + '</li>'; }).join('');

    var rej = document.getElementById('contribRejected');
    if (rej) rej.innerHTML = data.rejected.map(function (r) {
      return '<div class="rj-card"><div class="rj-head"><strong>' + esc(r.claim) + '</strong><span class="rj-verdict">' + esc(r.verdict) + '</span></div>' +
        '<p><strong>কোথা থেকে:</strong> ' + esc(r.who) + '</p><p><strong>কেন গ্রহণ করা হয়নি:</strong> ' + esc(r.why) + '</p></div>';
    }).join('');

    var cf = document.getElementById('contribConflicts');
    if (cf) cf.innerHTML = data.conflicts.map(function (c) {
      return '<div class="cf-card"><strong>' + esc(c.topic) + '</strong>' +
        '<div class="cf-two"><div><span>সূত্র ১</span>' + esc(c.a) + '</div><div><span>সূত্র ২</span>' + esc(c.b) + '</div></div>' +
        '<p class="cf-note">সিদ্ধান্ত: ' + esc(c.note) + '</p></div>';
    }).join('');
  }

  fetch(DATA, { cache: 'no-store' })
    .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(function (data) {
      state.data = data;
      var box = document.getElementById('contribStats');
      if (box) box.innerHTML = '<div class="cs-box"><strong>লোড হচ্ছে…</strong></div>';
      buildFilters();
      render();
      var q = document.getElementById('contribSearch');
      if (q) {
        var t;
        q.addEventListener('input', function () {
          clearTimeout(t);
          t = setTimeout(function () { state.q = norm(q.value); render(); }, 130);
        });
      }
    })
    .catch(function (err) {
      root.innerHTML = '<section class="hist-section"><div class="wrap"><p class="hist-sub">ডেটা লোড করা যায়নি (' + esc(err.message) + ')। পৃষ্ঠাটি ফাইল:// থেকে না খুলে স্থানীয় সার্ভার দিয়ে দেখুন।</p></div></section>';
    });
})();
