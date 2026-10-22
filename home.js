/* চর্যাভূমি — হোমপেজ রেন্ডার (data/site-info.json + data/quiz-bank.json) */
(function () {
  'use strict';
  var INFO = 'data/site-info.json?v=20261022a';
  var QUIZ = 'data/quiz-bank.json?v=20261022a';
  var SITES = 'data/heritage-sites.json?v=20261022a';
  var ADD = 'data/heritage-sites-additions.json?v=20261022a';
  var LIB = 'data/heritage-library.json?v=20261022a';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function bn(n) { return Number(n).toLocaleString('bn-BD'); }
  function $(id) { return document.getElementById(id); }

  function heroStats(info, sites, bulk, recs, lib, quiz) {
    var box = $('cbHeroStats');
    if (!box) return;
    function normDistrict(d) { return String(d || '').replace('মুন্সিগঞ্জ', 'মুন্সীগঞ্জ').trim(); }
    var districts = {};
    [].concat(sites, bulk, recs).forEach(function (s) { if (s && s.district) districts[normDistrict(s.district)] = 1; });
    var nDist = Object.keys(districts).length;
    var total = sites.length + bulk.length + recs.length;
    var rows = [
      [bn(nDist) + ' / ' + bn(64), 'জেলার বিহার-তালিকা'],
      [bn(total) + '+', 'বিহার ও প্রত্নস্থান'],
      [bn(quiz) + '+', 'কুইজ প্রশ্ন'],
      [bn(lib) + 'টি', 'বই · ভিডিও · অডিও']
    ];
    box.innerHTML = rows.map(function (r) {
      return '<div><b>' + r[0] + '</b><span>' + r[1] + '</span></div>';
    }).join('');
    var note = $('cbCoverage');
    if (note && info.coverage) {
      note.innerHTML = '📍 ' + esc(info.coverage.note) + ' <a href="index-old.html#explore">দেখুন কোন জেলাগুলো আছে →</a>';
      note.hidden = false;
    }
  }

  function features(info) {
    var box = $('cbFeatures');
    if (!box) return;
    var labels = info.status_labels || {};
    box.innerHTML = (info.features || []).map(function (f) {
      var link = f.link
        ? '<a class="cb-feat-link" href="' + esc(f.link) + '">' + esc(f.linkText || 'দেখুন') + ' →</a>'
        : '<span class="cb-feat-link" style="color:var(--cb-muted);font-weight:400">লিংক শীঘ্রই</span>';
      return '<article class="cb-feat" id="f-' + esc(f.id) + '">' +
        '<div class="cb-feat-top">' +
          '<span class="cb-feat-ico" aria-hidden="true">' + f.icon + '</span>' +
          '<span class="cb-badge ' + esc(f.status) + '">' + esc(labels[f.status] || f.status) + '</span>' +
        '</div>' +
        '<h3>' + esc(f.title) + '<span class="en">' + esc(f.title_en || '') + '</span></h3>' +
        '<p>' + esc(f.desc) + '</p>' +
        (f.desc_en ? '<p class="en-desc">' + esc(f.desc_en) + '</p>' : '') +
        link +
      '</article>';
    }).join('');
  }

  function audience(info) {
    var box = $('cbAudience');
    if (!box) return;
    box.innerHTML = (info.audience || []).map(function (a) {
      return '<div class="cb-aud"><span aria-hidden="true">' + a.icon + '</span>' +
        '<b>' + esc(a.who) + '</b><p>' + esc(a.what) + '</p></div>';
    }).join('');
  }

  function promises(info) {
    var box = $('cbPromises');
    if (!box) return;
    box.innerHTML = (info.promises || []).map(function (p) {
      return '<div class="cb-promise"><i aria-hidden="true">' + p.icon + '</i>' +
        '<b>' + esc(p.t) + '</b><p>' + esc(p.d) + '</p></div>';
    }).join('');
  }

  function quizFacts(info, size) {
    var box = $('cbQuizFacts');
    var lead = $('cbQuizLead');
    if (lead && info.quiz_info) lead.textContent = info.quiz_info.lead;
    if (!box) return;
    var rows = [
      ['🧠', bn(size) + 'টি প্রশ্ন', 'প্রতিবার নতুন ১০টি'],
      ['🖼️', 'ছবি ও ম্যাপ', 'স্থান ও মূর্তি চেনা'],
      ['🏆', 'লিডারবোর্ড', 'এই সপ্তাহ · সর্বকালের সেরা'],
      ['🔁', 'নতুন সেট', 'প্রতিবার ভিন্ন ক্রম']
    ];
    box.innerHTML = rows.map(function (r) {
      return '<div class="cb-promise"><i aria-hidden="true">' + r[0] + '</i><b>' + r[1] + '</b><p>' + r[2] + '</p></div>';
    }).join('');
  }

  function founder(info) {
    var box = $('cbFounder');
    if (!box) return;
    var f = info.founder || {};
    box.innerHTML =
      '<img src="' + esc(f.photo || 'assets/brand/founder.jpg') + '" alt="' + esc(f.name || 'প্রতিষ্ঠাতা') + '-এর ছবি" width="172" height="172">' +
      '<div>' +
        '<h3>' + esc(f.bn_name || f.name || '') + (f.name ? ' <small style="font-size:14px;color:var(--cb-muted);font-weight:400">(' + esc(f.name) + ')</small>' : '') + '</h3>' +
        '<p class="role">' + esc(f.role || '') + '</p>' +
        '<p class="since">' + esc(f.since || '') + '</p>' +
        '<div class="cb-founder-links">' +
          '<a class="cb-chip" href="mailto:' + esc(f.email || '') + '">✉️ ' + esc(f.email || '') + '</a>' +
          '<a class="cb-chip" href="' + esc(f.whatsapp_link || '#') + '">💬 ' + esc(f.whatsapp || '') + '</a>' +
          '<a class="cb-chip" href="' + esc(f.site || '#') + '" target="_blank" rel="noopener">🌐 প্রতিষ্ঠাতার সাইট</a>' +
        '</div>' +
      '</div>';
  }

  function contact(info) {
    var box = $('cbContact');
    var t = $('cbContactText');
    if (t && info.contact) t.textContent = info.contact.text;
    if (!box) return;
    box.innerHTML = ((info.contact && info.contact.channels) || []).map(function (c) {
      var ext = /^https?:/.test(c.url) ? ' target="_blank" rel="noopener"' : '';
      return '<a class="cb-contact-card" href="' + esc(c.url) + '"' + ext + '>' +
        '<span class="ci" aria-hidden="true">' + c.icon + '</span>' +
        '<span><b>' + esc(c.label) + '</b><span>' + esc(c.value) + '</span></span></a>';
    }).join('');
  }

  function brandText(info) {
    var h = $('cbHeroLead'), m = $('cbMotto');
    if (h && info.hero) h.textContent = info.hero.lead;
    if (m && info.brand) m.innerHTML = 'মূলমন্ত্র: <b>' + esc(info.brand.motto) + '</b>';
    if (info.brand) document.title = info.brand.name_bn + ' (' + info.brand.name_en + ') — বাংলাদেশের বৌদ্ধ ঐতিহ্য, ইতিহাস ও ভ্রমণ';
  }

  function boot() {
    var get = function (u, fb) {
      return fetch(u).then(function (r) { return r.ok ? r.json() : fb; }).catch(function () { return fb; });
    };
    Promise.all([
      get(INFO, null), get(QUIZ, { bank_size: 500 }), get(SITES, { records: [] }),
      get(ADD, { bulk: [], records: [] }), get(LIB, { items: [] })
    ]).then(function (res) {
      var info = res[0];
      if (!info) return;
      brandText(info);
      features(info);
      audience(info);
      promises(info);
      founder(info);
      contact(info);
      quizFacts(info, res[1].bank_size || 0);
      // bulk তালিকাগুলো array-আকারে আসে; bulk_fields দিয়ে object বানাই
      var flds = res[3].bulk_fields || [];
      var di = flds.indexOf('district');
      var bulkObjs = (res[3].bulk || []).map(function (row) {
        return Array.isArray(row) ? { district: row[di] } : row;
      });
      heroStats(info, res[2].records || [], bulkObjs, res[3].records || [],
                (res[4].items || []).length, res[1].bank_size || 0);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
