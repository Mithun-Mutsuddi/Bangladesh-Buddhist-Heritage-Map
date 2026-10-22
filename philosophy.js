/* চর্যাভূমি — বৌদ্ধধর্ম ও দর্শন পাতা (রাউন্ড ১৫)
   ডেটা: data/philosophy.json — সব তথ্য সূত্রসহ, রেন্ডার শুধু সাজায়। */
(function () {
  'use strict';
  var DATA = 'data/philosophy.json?v=20261022b';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function $(id) { return document.getElementById(id); }
  function set(id, html) { var e = $(id); if (e) e.innerHTML = html; }
  function link(u, label) {
    return u ? ' <a href="' + esc(u) + '" target="_blank" rel="noopener">' + esc(label || 'সূত্র') + ' ↗</a>' : '';
  }
  function bn(n) { return Number(n).toLocaleString('bn-BD'); }

  function render(d) {
    /* শুরুর পরিচিতি */
    set('introText', esc(d.intro.text));
    set('introSrc', 'সূত্র: ' + (d.intro.source
      ? '<a href="' + esc(d.intro.source.url) + '" target="_blank" rel="noopener">' + esc(d.intro.source.label) + ' ↗</a>'
      : ''));

    /* বুদ্ধের জীবন */
    if (d.buddha_life) {
      set('lifeTitle', 'বুদ্ধের জীবন');
      set('lifeLeads', esc(d.buddha_life.leads || ''));
      set('lifeList', d.buddha_life.items.map(function (x) {
        return '<li><span class="cb-tl-year">' + esc(x.year) + '</span>' +
          '<h3>' + esc(x.title) + '</h3><p>' + esc(x.text) + '</p></li>';
      }).join(''));
    }

    /* মূল শিক্ষা */
    if (d.doctrine) {
      set('docTitle', esc(d.doctrine.title));
      set('docGrid', d.doctrine.items.map(function (x) {
        return '<article class="cb-doc">' +
          '<h3>' + esc(x.title) + (x.pali ? ' <small>' + esc(x.pali) + '</small>' : '') + '</h3>' +
          '<p>' + esc(x.text) + '</p>' +
          (x.source ? '<a class="cb-doc-src" href="' + esc(x.source) + '" target="_blank" rel="noopener">সূত্র ↗</a>' : '') +
          '</article>';
      }).join(''));
    }

    /* বাংলার ইতিহাস */
    if (d.bengal_history) {
      set('bengalTitle', esc(d.bengal_history.title));
      set('bengalLeads', esc(d.bengal_history.leads || ''));
      set('bengalList', d.bengal_history.items.map(function (x) {
        return '<li><span class="cb-tl-year">' + esc(x.era) + '</span>' +
          '<h3>' + esc(x.title) + '</h3><p>' + esc(x.text) +
          (x.source ? ' <a href="' + esc(x.source) + '" target="_blank" rel="noopener">সূত্র ↗</a>' : '') +
          '</p></li>';
      }).join(''));
    }

    /* চার ধারা */
    if (d.schools) {
      set('schTitle', esc(d.schools.title));
      set('schLeads', esc(d.schools.leads || ''));
      set('schGrid', d.schools.items.map(function (s) {
        return '<article class="cb-school" id="school-' + esc(s.id) + '">' +
          '<h3>' + esc(s.name) + '</h3><p class="cb-school-en">' + esc(s.en) + '</p>' +
          '<dl>' +
            '<dt>উৎপত্তি</dt><dd>' + esc(s.origin) + '</dd>' +
            '<dt>মূল কথা</dt><dd>' + esc(s.core) + '</dd>' +
            '<dt>কোথায়</dt><dd>' + esc(s.where) + '</dd>' +
            '<dt>বাংলাদেশে</dt><dd>' + esc(s.bd) + '</dd>' +
          '</dl></article>';
      }).join(''));
      var t = d.schools.compare;
      if (t) {
        set('schTable',
          '<thead><tr>' + t.head.map(function (h) { return '<th>' + esc(h) + '</th>'; }).join('') + '</tr></thead>' +
          '<tbody>' + t.rows.map(function (r) {
            return '<tr>' + r.map(function (c, i) {
              return i === 0 ? '<th scope="row">' + esc(c) + '</th>' : '<td>' + esc(c) + '</td>';
            }).join('') + '</tr>';
          }).join('') + '</tbody>');
      }
    }

    /* ত্রিপিটক */
    if (d.tripitaka) {
      set('tripTitle', esc(d.tripitaka.title));
      set('tripLeads', esc(d.tripitaka.leads || ''));
      set('tripGrid', d.tripitaka.pitakas.map(function (p, i) {
        return '<article class="cb-pitaka">' +
          '<span class="cb-pitaka-num">' + bn(i + 1) + '</span>' +
          '<h3>' + esc(p.name) + ' <small>' + esc(p.en) + '</small></h3>' +
          '<p><b>গঠন:</b> ' + esc(p.parts) + '</p>' +
          '<p><b>কী আছে:</b> ' + esc(p.what) + '</p>' +
          '<p class="cb-pitaka-why"><b>কেন পড়বেন:</b> ' + esc(p.why) + '</p>' +
          '</article>';
      }).join(''));
      set('tripNote', esc(d.tripitaka.note || ''));
      set('tripLinks', (d.tripitaka.links || []).map(function (l) {
        return '<a class="cb-chip" href="' + esc(l.url) + '" target="_blank" rel="noopener">' + esc(l.label) + ' ↗</a>';
      }).join(' '));
    }

    /* শব্দকোষ */
    if (d.glossary) {
      set('glosList', d.glossary.items.map(function (g) {
        return '<div class="cb-gloss-row"><dt>' + esc(g.t) + '</dt><dd>' + esc(g.d) + '</dd></div>';
      }).join(''));
    }

    /* সূত্র */
    if (d.sources) {
      set('srcList', d.sources.items.map(function (s) {
        return '<li><a href="' + esc(s.u) + '" target="_blank" rel="noopener">' + esc(s.t) + ' ↗</a></li>';
      }).join(''));
    }
    set('pageNote', esc(d.note || ''));
  }

  fetch(DATA).then(function (r) {
    if (!r.ok) throw new Error('philosophy ' + r.status);
    return r.json();
  }).then(render).catch(function (err) {
    console.error('[philosophy]', err);
    var e = $('introText');
    if (e) e.textContent = 'তথ্য লোড করা যায়নি। পাতাটি রিফ্রেশ করুন — ইন্টারনেট সংযোগ দরকার।';
  });
})();
