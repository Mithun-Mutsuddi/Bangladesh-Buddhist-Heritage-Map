/* চর্যাভূমি — হোমপেজ রেন্ডার (data/site-info.json + data/quiz-bank.json) */
(function () {
  'use strict';
  var INFO = 'data/site-info.json?v=20261024d';
  var QUIZ = 'data/quiz-bank.json?v=20261022a';
  var QUIZ2 = 'data/quiz-extra14.json?v=20261022b';   /* রাউন্ড ১৫ সংযোজন */
  var DIST = 'data/district-famous.json?v=20261022m1';
  var STRUCTURE = 'data/site-structure.json?v=20261114a';
  // হিরো-সংখ্যার জন্য মেগাবাইট-খানেক স্থান/কুইজ/লাইব্রেরি ডেটা আর লোড করা হয় না;
  // site-info.coverage ও district-famous-এর প্রস্তুত হিসাবই যথেষ্ট। এতে হোমপেজ দ্রুত খোলে।

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function bn(n) { return Number(n).toLocaleString('bn-BD'); }
  function $(id) { return document.getElementById(id); }

  function heroStats(info, districtData, quizTotal) {
    var box = $('cbHeroStats');
    if (!box) return;
    var coverage = info.coverage || {};
    var nDist = (districtData && districtData.districts_in_data) || coverage.districts_with_data || 30;
    var totalDist = (districtData && districtData.districts_total) || coverage.districts_total || 64;
    var total = (districtData && districtData.total_records) || coverage.sites_total || 3218;
    var quiz = quizTotal || coverage.quiz_questions || 662;
    var lib = coverage.library_items || 82;
    var rows = [
      [bn(nDist) + ' / ' + bn(totalDist), 'জেলার বিহার-তালিকা'],
      [bn(total) + '+', 'বিহার ও প্রত্নস্থান'],
      [bn(quiz) + '+', 'কুইজ প্রশ্ন'],
      [bn(lib) + 'টি', 'বই · ভিডিও · অডিও']
    ];
    box.innerHTML = rows.map(function (r, i) {
      return '<div><b' + (i === 2 ? ' id="cbHeroQuizCount"' : '') + '>' + r[0] + '</b><span>' + r[1] + '</span></div>';
    }).join('');
    var note = $('cbCoverage');
    if (note && coverage.note) {
      note.innerHTML = '📍 ' + esc(coverage.note) + ' <a href="#explore">স্থান খুঁজুন →</a>';
      note.hidden = false;
    }
  }

  function features(structure) {
    var box = $('cbFeatures');
    if (!box) return;
    box.innerHTML = ((structure && structure.groups) || []).map(function (g) {
      var items = g.items || [];
      return '<article class="cb-feat cb-topic-card" id="topic-' + esc(g.id) + '">' +
        '<div class="cb-feat-top"><span class="cb-feat-ico" aria-hidden="true">' + esc(g.icon || '☸') + '</span>' +
        '<span class="cb-badge live">' + bn(items.length) + 'টি subcategory</span></div>' +
        '<h3 data-i18n="nav.group.' + esc(g.id) + '">' + esc(g.label) + '</h3><p class="cb-topic-intro">' + esc(g.description || '') + '</p>' +
        '<div class="cb-topic-links">' + items.map(function (item) {
          return '<a href="' + esc(item.href) + '"' + (item.key ? ' data-i18n="' + esc(item.key) + '"' : '') + '>' + esc(item.title) + '</a>';
        }).join('') + '</div></article>';
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


  /* ---------------- কোন জেলায় কী বিখ্যাত ---------------- */
  var distState = { q: '', div: 'all', data: null };

  function districtSection(data) {
    distState.data = data;
    var chips = $('distDivChips');
    var divs = [];
    (data.districts || []).forEach(function (d) {
      if (d.division && divs.indexOf(d.division) === -1) divs.push(d.division);
    });
    if (chips) {
      chips.innerHTML = ['all'].concat(divs).map(function (dv) {
        var label = dv === 'all' ? 'সব বিভাগ' : dv;
        return '<button type="button" class="cb-chip dist-chip" data-div="' + esc(dv) + '"' +
          (distState.div === dv ? ' style="background:var(--cb-forest);color:#fff8e6;border-color:var(--cb-forest)"' : '') +
          '>' + esc(label) + '</button>';
      }).join('');
      chips.querySelectorAll('.dist-chip').forEach(function (btn) {
        btn.addEventListener('click', function () {
          distState.div = btn.getAttribute('data-div');
          districtSection(distState.data);
        });
      });
    }
    var grid = $('distGrid');
    if (!grid) return;
    var q = distState.q;
    var list = (data.districts || []).filter(function (d) {
      if (distState.div !== 'all' && d.division !== distState.div) return false;
      if (!q) return true;
      return (d.district + ' ' + (d.division || '')).toLowerCase().indexOf(q) > -1;
    });
    if (!list.length) {
      grid.innerHTML = '<p class="cb-dist-empty">এই ছাঁকনিতে কোনো জেলা পাওয়া যায়নি।</p>';
    } else {
      grid.innerHTML = list.map(function (d) {
        var types = Object.keys(d.types || {}).sort(function (a, b) { return d.types[b] - d.types[a]; }).slice(0, 4);
        var eg = (d.top || []).slice(0, 3).map(function (t) { return t.name; }).join(' · ');
        return '<article class="cb-dcard">' +
          '<h3>' + esc(d.district) + (d.division ? '<span class="div">' + esc(d.division) + ' বিভাগ</span>' : '') + '</h3>' +
          '<p class="cnt">আমাদের তালিকায় <b>' + bn(d.total) + '</b>টি বৌদ্ধ স্থান / প্রতিষ্ঠান</p>' +
          (types.length ? '<div class="types">' + types.map(function (t) {
            return '<span>' + esc(t) + ' · ' + bn(d.types[t]) + '</span>';
          }).join('') + '</div>' : '') +
          (d.specialty ? '<p class="star">⭐ <b>বিশেষত্ব:</b> ' + esc(d.specialty.text) +
            (d.specialty.url ? ' <a href="' + esc(d.specialty.url) + '" target="_blank" rel="noopener">সূত্র</a>' : '') + '</p>' : '') +
          (eg ? '<p class="eg"><b>উদাহরণ:</b> ' + esc(eg) + '</p>' : '') +
          '<a class="cb-feat-link" href="#explore" data-dash-district="' + esc(d.district) + '" style="font-size:13px;font-weight:700;color:var(--cb-bark);text-decoration:none">এই জেলার সব স্থান দেখুন →</a>' +
        '</article>';
      }).join('');
    }
    var cnt = $('distCount');
    if (cnt) cnt.textContent = bn(list.length) + 'টি জেলা দেখানো হচ্ছে · মোট ' + bn(data.total_records) + 'টি রেকর্ড';
    var note = $('distNote');
    if (note) note.textContent = data.note;
  }

  function bindDistrict() {
    var q = $('distSearch');
    if (q) q.addEventListener('input', function () {
      distState.q = (q.value || '').trim().toLowerCase();
      districtSection(distState.data);
      if (q.focus) q.focus();
    });
    var r = $('distReset');
    if (r) r.addEventListener('click', function () {
      distState.q = ''; distState.div = 'all';
      if (q) q.value = '';
      districtSection(distState.data);
    });
  }

  function brandText(info) {
    var h = $('cbHeroLead'), m = $('cbMotto');
    if (h && info.hero) h.textContent = info.hero.lead;
    if (m && info.brand) m.innerHTML = 'মূলমন্ত্র: <b>' + esc(info.brand.motto) + '</b>';
    var sl = $('cbSlogan');
    if (sl && info.brand && info.brand.slogan) sl.textContent = info.brand.slogan;
    if (info.brand) document.title = info.brand.name_bn + ' (' + info.brand.name_en + ') — বাংলাদেশের বৌদ্ধ ঐতিহ্য, ইতিহাস ও ভ্রমণ';
  }

  function boot() {
    var get = function (u, fb) {
      return fetch(u).then(function (r) { return r.ok ? r.json() : fb; }).catch(function () { return fb; });
    };
    // শুধু ছোট দুই ফাইল প্রথমে: সাইট-তথ্য ও জেলা-সারাংশ।
    // আগে heritage-sites/additions/quiz/library মিলিয়ে প্রায় ৩ MB না এলে হোমের মূল অংশ আটকে থাকত।
    Promise.all([get(INFO, null), get(DIST, null), get(STRUCTURE, { groups: [] })]).then(function (res) {
      var info = res[0];
      if (!info) return;
      brandText(info);
      features(res[2]);
      audience(info);
      promises(info);
      founder(info);
      contact(info);
      var baseQuiz = (info.coverage && info.coverage.quiz_questions) || 515;
      quizFacts(info, baseQuiz + 147);
      heroStats(info, res[1], baseQuiz + 147);
      if (res[1]) { districtSection(res[1]); bindDistrict(); }
      // Structure-driven labels may arrive after the shared language control.
      if (window.CharyabhumiLanguage) window.CharyabhumiLanguage.refresh();

      // কুইজের অতিরিক্ত প্রশ্নসংখ্যা নিশ্চিত করতে ছোট ফাইলটি idle সময়ে পড়া হয়।
      var verifyQuizCount = function () {
        get(QUIZ2, { questions: [] }).then(function (extra) {
          var total = baseQuiz + ((extra && extra.questions) || []).length;
          var heroQuiz = $('cbHeroQuizCount');
          if (heroQuiz) heroQuiz.textContent = bn(total) + '+';
          quizFacts(info, total);
        });
      };
      if ('requestIdleCallback' in window) requestIdleCallback(verifyQuizCount, { timeout: 3000 });
      else setTimeout(verifyQuizCount, 1800);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
