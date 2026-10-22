/* চর্যাভূমি — “আমাদের কথা” পাতা (data/site-info.json থেকে) */
(function () {
  'use strict';
  var INFO = 'data/site-info.json?v=20261022a';
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function $(id) { return document.getElementById(id); }

  var TOC = [
    ['#intro', 'আমাদের কথা'],
    ['#promises', 'নীতি'],
    ['#verify', 'যাচাই পদ্ধতি'],
    ['#emergency', 'জরুরি নম্বর'],
    ['#rail', 'ট্রেন'],
    ['#langs', 'ভাষা'],
    ['#founder', 'প্রতিষ্ঠাতা'],
    ['#contact', 'যোগযোগ']
  ];

  fetch(INFO).then(function (r) {
    if (!r.ok) throw new Error('site-info ' + r.status);
    return r.json();
  }).then(function (info) {
    var b = info.brand || {};
    if ($('aboutLead') && info.hero) $('aboutLead').textContent = info.hero.lead;
    if ($('aboutMotto') && b.motto) $('aboutMotto').innerHTML = 'মূলমন্ত্র: <b>' + esc(b.motto) + '</b>';
    if ($('aboutSlogan') && b.slogan) { $('aboutSlogan').textContent = b.slogan; $('aboutSlogan').style.color = 'var(--cb-forest)'; }

    // সূচি
    var toc = $('cbToc');
    if (toc) toc.innerHTML = TOC.map(function (t) {
      return '<a href="' + t[0] + '">' + esc(t[1]) + '</a>';
    }).join('');

    // অনুচ্ছেদ
    var paras = $('aboutParas');
    if (paras) {
      paras.innerHTML = '<span id="intro"></span>' +
        (info.about.paras || []).map(function (p, i) {
          return (i === 0 ? '<p><b>' + esc(p) + '</b></p>' : '<p>' + esc(p) + '</p>');
        }).join('') +
        '<h3>In English</h3>' +
        (info.about.en_paras || []).map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('');
    }

    var aud = $('aboutAudience');
    if (aud) aud.innerHTML = (info.audience || []).map(function (a) {
      return '<div class="cb-aud"><span aria-hidden="true">' + a.icon + '</span><b>' + esc(a.who) + '</b><p>' + esc(a.what) + '</p></div>';
    }).join('');

    var pr = $('aboutPromises');
    if (pr) pr.innerHTML = (info.promises || []).map(function (p) {
      return '<div class="cb-promise"><i aria-hidden="true">' + p.icon + '</i><b>' + esc(p.t) + '</b><p>' + esc(p.d) + '</p></div>';
    }).join('');

    // জরুরি নম্বর
    var ec = $('ecGrid');
    if (ec) ec.innerHTML = (info.emergency || []).map(function (e) {
      var nums = (e.numbers || []).map(function (n, i) {
        var dial = (e.dial && i === 0) ? e.dial : n.replace(/[^0-9]/g, '');
        return '<a href="tel:' + esc(dial) + '" aria-label="' + esc(e.name) + ' — ' + esc(n) + ' ডায়াল করুন">📞 ' + esc(n) + '</a>';
      }).join('');
      return '<div class="cb-ec"><b>' + esc(e.name) + '</b><div class="nums">' + nums + '</div>' +
        '<p>' + esc(e.note) + '</p><small>সূত্র: <a href="' + esc(e.url) + '" target="_blank" rel="noopener">' + esc(e.source) + '</a></small></div>';
    }).join('');
    if ($('ecNote')) $('ecNote').textContent = info.emergency_note || '';

    // রেল
    var rail = $('railList');
    if (rail) rail.innerHTML = (info.rail || []).map(function (r) {
      return '<a href="' + esc(r.url) + '" target="_blank" rel="noopener">' +
        '<span class="tag">' + esc(r.tag) + '</span>' +
        '<span><b>' + esc(r.name) + '</b><span>' + esc(r.desc) + '</span></span>' +
        '<span style="margin-inline-start:auto;font-size:18px">↗</span></a>';
    }).join('');
    if ($('railNote')) $('railNote').textContent = info.rail_note || '';

    // ভাষা
    var langs = $('langList');
    var labels = info.status_labels || {};
    if (langs) langs.innerHTML = (info.languages || []).map(function (l) {
      return '<div class="cb-lang"><b>' + esc(l.name) + '</b><small>' + esc(l.note) +
        ' · ' + esc(labels[l.status] || l.status) + '</small></div>';
    }).join('');

    // প্রতিষ্ঠাতা
    var f = info.founder || {};
    var fbox = $('aboutFounder');
    if (fbox) fbox.innerHTML =
      '<img src="' + esc(f.photo || 'assets/brand/founder.jpg') + '" alt="' + esc(f.name || 'প্রতিষ্ঠাতা') + '-এর ছবি" width="172" height="172">' +
      '<div><h3>' + esc(f.bn_name || '') + ' <small style="font-size:14px;color:var(--cb-muted);font-weight:400">(' + esc(f.name || '') + ')</small></h3>' +
      '<p class="role">' + esc(f.role || '') + '</p><p class="since">' + esc(f.since || '') + '</p>' +
      '<div class="cb-founder-links">' +
        '<a class="cb-chip" href="mailto:' + esc(f.email || '') + '">✉️ ' + esc(f.email || '') + '</a>' +
        '<a class="cb-chip" href="' + esc(f.whatsapp_link || '#') + '">💬 ' + esc(f.whatsapp || '') + '</a>' +
        '<a class="cb-chip" href="' + esc(f.site || '#') + '" target="_blank" rel="noopener">🌐 প্রতিষ্ঠাতার সাইট</a>' +
      '</div></div>';

    // যোগাযোগ
    if ($('contactText') && info.contact) $('contactText').textContent = info.contact.text;
    var cl = $('contactList');
    if (cl) cl.innerHTML = ((info.contact && info.contact.channels) || []).map(function (c) {
      var ext = /^https?:/.test(c.url) ? ' target="_blank" rel="noopener"' : '';
      return '<a class="cb-contact-card" href="' + esc(c.url) + '"' + ext + '>' +
        '<span class="ci" aria-hidden="true">' + c.icon + '</span>' +
        '<span><b>' + esc(c.label) + '</b><span>' + esc(c.value) + '</span></span></a>';
    }).join('');

    // শিরোনাম
    if (b.name_bn) document.title = 'আমাদের কথা — ' + b.name_bn + ' | ফ্রি বাংলাদেশি বৌদ্ধ ঐতিহ্য ও ভ্রমণ সাইট';
  }).catch(function (err) {
    var p = $('aboutParas');
    if (p) p.innerHTML = '<p>তথ্য লোড করা যায়নি (' + esc(err.message) + ')।</p>';
  });
})();
