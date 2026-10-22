/* চর্যাভূমি — গৃহী নীতি, সূত্র-গাথা ও বন্দনা অধ্যায় (philosophy.html-এর ভেতরে)
   ডেটা: data/practice.json — সূত্র-রেফারেন্স ও পালি মূলপদসহ। রেন্ডার শুধু সাজায়।
   প্রতিটি বিষয় <details> হিসেবে আসে, যাতে বড় অধ্যায়ে যা দরকার শুধু তা-ই খোলা যায়। */
(function () {
  'use strict';
  var DATA = 'data/practice.json?v=20261022m1';

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

  function langCards(x) {
    if (!x.pali_text && !x.bn_meaning && !x.en_meaning && !(x.other_langs && x.other_langs.length)) return '';
    var cards = [];
    if (x.pali_text) {
      cards.push('<section class="cb-prac-lang pali"><h4>পালি · Pali</h4><p>' +
        esc(x.pali_text).replace(/\n/g, '<br>') + '</p></section>');
    }
    if (x.bn_meaning) {
      cards.push('<section class="cb-prac-lang bangla"><h4>বাংলা ভাবার্থ</h4><p>' + esc(x.bn_meaning) + '</p></section>');
    }
    if (x.en_meaning) {
      cards.push('<section class="cb-prac-lang english" lang="en"><h4>English meaning</h4><p>' + esc(x.en_meaning) + '</p></section>');
    }
    (x.other_langs || []).forEach(function (o) {
      if (!o || !o.text) return;
      cards.push('<section class="cb-prac-lang other"><h4>' + esc(o.lang || 'অন্য ভাষা') + '</h4><p>' +
        esc(o.text).replace(/\n/g, '<br>') + '</p>' +
        (o.note ? '<small>' + esc(o.note) + '</small>' : '') + '</section>');
    });
    return cards.length ? '<div class="cb-prac-langs">' + cards.join('') + '</div>' : '';
  }

  function searchText(x) {
    var other = (x.other_langs || []).map(function (o) {
      return [o && o.lang, o && o.text, o && o.note].filter(Boolean).join(' ');
    }).join(' ');
    return [x.id, x.title, x.title_en, x.pali, x.ref, x.status, x.intro, x.pali_text,
      x.bn_meaning, x.en_meaning, x.aliases, (x.points || []).join(' '), other]
      .filter(Boolean).join(' ');
  }

  function itemHtml(x) {
    var meta = [];
    if (x.title_en) meta.push('<span class="cb-prac-title-en" lang="en">' + esc(x.title_en) + '</span>');
    if (x.ref) meta.push('<span class="cb-prac-ref">' + esc(x.ref) + '</span>');
    if (x.status) meta.push('<span class="cb-prac-status">' + esc(x.status) + '</span>');
    if (x.pali) meta.push('<span class="cb-prac-pali-name">' + esc(x.pali) + '</span>');
    var body = '';
    if (x.intro) body += '<p>' + esc(x.intro) + '</p>';
    var langs = langCards(x);
    if (langs) {
      body += langs;
    } else if (x.pali_text) {
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
    var attrs = '';
    if (x.id) attrs += ' id="bandana-' + esc(x.id) + '" data-bandana-item="1" data-bandana-id="' + esc(x.id) + '"';
    attrs += ' data-bandana-search="' + esc(searchText(x)) + '"';
    return '<details class="cb-prac"' + attrs + '><summary>' +
      '<span class="cb-prac-title">' + esc(x.title) + '</span>' +
      (meta.length ? '<span class="cb-prac-meta">' + meta.join(' ') + '</span>' : '') +
      '</summary><div class="cb-prac-body">' + body + '</div></details>';
  }

  function renderList(boxId, sec) {
    var box = $(boxId);
    if (!box || !sec) return;
    box.innerHTML = (sec.items || []).map(itemHtml).join('');
  }

  function bandanaTools(sec) {
    var count = (sec.groups || []).reduce(function (n, g) { return n + (g.items || []).length; }, 0);
    return '<div class="cb-bandana-tools">' +
      '<label><span aria-hidden="true">⌕</span>' +
      '<input id="bandanaSearch" type="search" placeholder="বন্দনা খুঁজুন: প্রদীপ · কঠিন · Sivali · Kathina…" aria-label="বন্দনা খুঁজুন">' +
      '</label>' +
      '<span class="cb-bandana-count" id="bandanaCount">' + esc(count) + 'টি বিষয়</span>' +
      '<button type="button" class="cb-btn ghost sm" id="bandanaOpenAll">সব খুলুন</button>' +
      '<button type="button" class="cb-btn ghost sm" id="bandanaCloseAll">সব বন্ধ করুন</button>' +
      (sec.language_note ? '<p class="cb-note" style="flex-basis:100%">' + esc(sec.language_note) + '</p>' : '') +
      (sec.dedup_note ? '<p class="cb-note" style="flex-basis:100%">' + esc(sec.dedup_note) + '</p>' : '') +
      '</div>';
  }

  function renderGroups(boxId, sec) {
    var box = $(boxId);
    if (!box || !sec) return;
    var tools = boxId === 'bandanaGroups' ? bandanaTools(sec) : '';
    box.innerHTML = tools + (sec.groups || []).map(function (g) {
      return '<div class="cb-prac-group" data-bandana-group="1">' +
        '<h3 class="cb-h3">' + esc(g.title) + '</h3>' +
        (g.intro ? '<p class="cb-sub">' + esc(g.intro) + '</p>' : '') +
        (g.items || []).map(itemHtml).join('') +
        '</div>';
    }).join('');
  }

  function normalizeSearch(s) {
    return String(s || '').normalize('NFC').toLocaleLowerCase('bn')
      .replace(/[০-৯]/g, function (d) { return String('০১২৩৪৫৬৭৮৯'.indexOf(d)); })
      .replace(/[\u200c\u200d\ufeff]/g, '')
      .replace(/[^\p{L}\p{M}\p{N}\s-]/gu, ' ')
      .replace(/\s+/g, ' ').trim();
  }

  function bindBandanaTools() {
    var box = $('bandanaGroups');
    var input = $('bandanaSearch');
    if (!box || !input) return;
    var items = Array.prototype.slice.call(box.querySelectorAll('[data-bandana-item]'));
    var groups = Array.prototype.slice.call(box.querySelectorAll('[data-bandana-group]'));
    var count = $('bandanaCount');
    function bnNum(n) { return Number(n).toLocaleString('bn-BD'); }
    function apply() {
      var q = normalizeSearch(input.value);
      var tokens = q ? q.split(' ').filter(Boolean) : [];
      var shown = 0;
      items.forEach(function (item) {
        var hay = normalizeSearch(item.getAttribute('data-bandana-search') || item.textContent || '');
        var hit = !tokens.length || tokens.every(function (t) { return hay.indexOf(t) > -1; });
        item.hidden = !hit;
        if (hit) shown++;
      });
      groups.forEach(function (g) {
        g.hidden = !Array.prototype.some.call(g.querySelectorAll('[data-bandana-item]'), function (item) { return !item.hidden; });
      });
      if (count) count.textContent = q ? bnNum(shown) + ' / ' + bnNum(items.length) + 'টি পাওয়া গেছে' : bnNum(items.length) + 'টি বিষয়';
    }
    var timer = null;
    input.addEventListener('input', function () {
      clearTimeout(timer);
      timer = setTimeout(apply, 90);
    });
    var openAll = $('bandanaOpenAll');
    var closeAll = $('bandanaCloseAll');
    if (openAll) openAll.addEventListener('click', function () {
      items.forEach(function (item) { if (!item.hidden) item.open = true; });
    });
    if (closeAll) closeAll.addEventListener('click', function () {
      items.forEach(function (item) { item.open = false; });
    });
    apply();
    window.CharyabhumiBandana = { filter: apply, items: items };
  }

  function openBandanaHash() {
    if (!/^#bandana-/.test(location.hash || '')) return;
    var target = document.getElementById(location.hash.slice(1));
    if (!target) return;
    target.hidden = false;
    target.open = true;
    var cancelled = false;
    function cancel() { cancelled = true; }
    ['wheel', 'touchstart', 'keydown'].forEach(function (ev) {
      window.addEventListener(ev, cancel, { once: true, passive: true });
    });
    // ওপরের দর্শন-অধ্যায় দেরিতে রেন্ডার হলে লক্ষ্য কার্ড নিচে সরে যায়;
    // তাই ব্যবহারকারী নিজে স্ক্রল শুরু না-করলে কয়েকবার অবস্থান ঠিক করা হয়।
    [80, 650, 1600, 3200, 5200].forEach(function (delay, idx) {
      setTimeout(function () {
        if (cancelled || !document.body.contains(target)) return;
        var top = target.getBoundingClientRect().top;
        if (idx > 0 && top > 80 && top < 150) return;
        try { target.scrollIntoView({ behavior: idx ? 'auto' : 'smooth', block: 'start' }); } catch (_) {}
      }, delay);
    });
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
    bindBandanaTools();
    openBandanaHash();
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
