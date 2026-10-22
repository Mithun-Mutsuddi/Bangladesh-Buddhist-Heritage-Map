/* চর্যাভূমি — গৃহী নীতি, সূত্র-গাথা ও বন্দনা অধ্যায় (philosophy.html-এর ভেতরে)
   ডেটা: data/practice.json — সূত্র-রেফারেন্স ও পালি মূলপদসহ। রেন্ডার শুধু সাজায়।
   প্রতিটি বিষয় <details> হিসেবে আসে, যাতে বড় অধ্যায়ে যা দরকার শুধু তা-ই খোলা যায়। */
(function () {
  'use strict';
  var DATA = 'data/practice.json?v=20261022p1';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function $(id) { return document.getElementById(id); }
  function isExternal(u) { return /^https?:\/\//i.test(u || ''); }

  function srcLinks(list) {
    if (!list || !list.length) return '';
    return '<div class="cb-prac-srcs">' + list.map(function (s) {
      var ext = isExternal(s.u) ? ' target="_blank" rel="noopener"' : '';
      return '<a class="cb-chip" href="' + esc(s.u) + '"' + ext + '>' + esc(s.t) + ' ↗</a>';
    }).join(' ') + '</div>';
  }

  function itemHtml(x) {
    var meta = [];
    if (x.ref) meta.push('<span class="cb-prac-ref">' + esc(x.ref) + '</span>');
    if (x.status) meta.push('<span class="cb-prac-status">' + esc(x.status) + '</span>');
    if (x.pali) meta.push('<span class="cb-prac-pali-name">' + esc(x.pali) + '</span>');
    var body = '';
    if (x.intro) body += '<p>' + esc(x.intro) + '</p>';
    if (x.pali_text) {
      body += '<figure class="cb-prac-verse"><figcaption>মূল পদ (পালি)</figcaption>' +
        '<blockquote>' + esc(x.pali_text).replace(/\n/g, '<br>') + '</blockquote></figure>';
    }
    if (x.points && x.points.length) {
      body += '<ul class="cb-prac-points">' + x.points.map(function (p) {
        return '<li>' + esc(p) + '</li>';
      }).join('') + '</ul>';
    }
    if (x.practice) body += '<p class="cb-note"><b>চর্চা:</b> ' + esc(x.practice) + '</p>';
    body += srcLinks(x.sources);
    return '<details class="cb-prac"><summary>' +
      '<span class="cb-prac-title">' + esc(x.title) + '</span>' +
      (meta.length ? '<span class="cb-prac-meta">' + meta.join(' ') + '</span>' : '') +
      '</summary><div class="cb-prac-body">' + body + '</div></details>';
  }

  function renderList(boxId, sec) {
    var box = $(boxId);
    if (!box || !sec) return;
    box.innerHTML = (sec.items || []).map(itemHtml).join('');
  }

  function renderGroups(boxId, sec) {
    var box = $(boxId);
    if (!box || !sec) return;
    box.innerHTML = (sec.groups || []).map(function (g) {
      return '<div class="cb-prac-group">' +
        '<h3 class="cb-h3">' + esc(g.title) + '</h3>' +
        (g.intro ? '<p class="cb-sub">' + esc(g.intro) + '</p>' : '') +
        (g.items || []).map(itemHtml).join('') +
        '</div>';
    }).join('');
  }

  function render(d) {
    if (d.disclaimer) {
      ['grihiNote', 'suttaNote', 'bandanaNote'].forEach(function (id) {
        var e = $(id);
        if (e) e.textContent = d.disclaimer;
      });
    }
    renderList('grihiList', d.grihi);
    renderList('suttaList', d.sutta);
    renderGroups('bandanaGroups', d.bandana);
    // কোনো অ্যাঙ্করে সরাসরি এলে (philosophy.html#grihi ইত্যাদি) স্ক্রল ঠিক থাকবে —
    // details গুলো বন্ধ থাকায় পাতার উচ্চতা হঠাৎ বদলায় না।
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (!$('grihiList') && !$('suttaList') && !$('bandanaGroups')) return;
    fetch(DATA).then(function (r) {
      if (!r.ok) throw new Error('practice ' + r.status);
      return r.json();
    }).then(render).catch(function (err) {
      console.error('[practice]', err);
      ['grihiList', 'suttaList', 'bandanaGroups'].forEach(function (id) {
        var e = $(id);
        if (e) e.innerHTML = '<p class="cb-note">তথ্য লোড করা যায়নি। ইন্টারনেট সংযোগ যাচাই করে পাতাটি রিফ্রেশ করুন।</p>';
      });
    });
  });
})();
