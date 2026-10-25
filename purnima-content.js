/* চর্যাভূমি — ১২ পূর্ণিমা বিস্তারিত বিবরণ, উপোসথ, কঠিন, হলকর্ষণ রেন্ডার (2026-10-25) */
(function () {
  'use strict';
  if (!window.MX) return;
  var MX = window.MX;
  var grid = document.getElementById('purnima12Grid');

  function esc(s) { return MX.esc(s); }
  function bn(n) { return MX.bn(n); }

  /* ১২ পূর্ণিমার ক্রম-নাম ম্যাপ (চান্দ্রমাস key -> বাংলা মাস) */
  var KEY_TO_BN_MONTH = {
    citta: 'চৈত্র', vesakha: 'বৈশাখ', jettha: 'জ্যৈষ্ঠ', asalha: 'আষাঢ়',
    savana: 'শ্রাবণ', potthapada: 'ভাদ্র', assayuja: 'আশ্বিন',
    kattika: 'কার্তিক', maggasira: 'অগ্রহায়ণ', phussa: 'পৌষ',
    magha: 'মাঘ', phagguna: 'ফাল্গুন'
  };

  function fmtDateOnly(date) {
    var ENM = ['জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর'];
    var WEEK = ['রবি','সোম','মঙ্গল','বুধ','বৃহঃ','শুক্র','শনি'];
    var api = window.CharyabhumiPanjika;
    var bd = api ? api.banglaDate(date.getFullYear(), date.getMonth()+1, date.getDate()) : null;
    return bn(date.getDate()) + ' ' + ENM[date.getMonth()] + ' ' + bn(date.getFullYear()) + ' (' + WEEK[date.getDay()] + ')' +
           (bd ? ' · ' + bn(bd.day) + ' ' + bd.month : '');
  }

  /* চান্দ্রমাস key -> বাংলা সৌর মাস (আনুমানিক) */
  function lastAndNextLunar(now) {
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var until = new Date(today.getTime() + 380*86400000);
    var cal = MX.lunarCalendar(until);
    var prev = null, next = null;
    for (var i = 0; i < cal.length; i++) {
      if (cal[i].adhik) continue;
      if (cal[i].date < today) prev = cal[i];
      else if (!next) next = cal[i];
    }
    return { prev: prev, next: next };
  }

  /* ========== উইন্ডো এক্সপোজ: ফ্রেম জেনারেটরের জন্য উৎসব শনাক্তকরণ ========== */
  window.CharyabhumiPurnimaData = {
    getCurrentFestival: function (now) {
      now = now || new Date();
      try {
        var api = window.CharyabhumiPanjika;
        if (!api || !MX.lunarCalendar) return 'vesakha';
        var n = api.dhakaNow(now.getTime());
        var tdy = new Date(n.y, n.m - 1, n.d);
        var ln = lastAndNextLunar(now);
        /* আজকের দিনটি lunarCalendar-এ কোনো পূর্ণিমার তারিখ (OVERRIDEসহ) */
        if (ln.prev && ln.prev.date.getTime() === tdy.getTime()) return ln.prev.key;
        if (ln.next && ln.next.date.getTime() === tdy.getTime()) return ln.next.key;
        /* বিশেষ ঋতু (আজকে পূর্ণিমা না হলে):
           - বর্ষাবাস: আষাঢ় পূর্ণিমার পরদিন থেকে আশ্বিন পূর্ণিমা পর্যন্ত
           - কঠিন: আশ্বিন পূর্ণিমার পরদিন থেকে কার্তিক পূর্ণিমা পর্যন্ত */
        if (ln.prev) {
          var pk = ln.prev.key, nk = ln.next && ln.next.key;
          /* Vassa: আগে আসলহ/সাবন/পোত্থপাদ, এবং পরে আসয়ুজ (বা তারও আগে) */
          if ((pk === 'asalha' || pk === 'savana' || pk === 'potthapada') &&
              (!nk || nk === 'savana' || nk === 'potthapada' || nk === 'assayuja')) return 'vassa';
          /* Kathina: আগে আসয়ুজ (প্রবারণা), পরে কার্তিক */
          if (pk === 'assayuja' && nk === 'kattika') return 'kathina';
        }
        /* হলকর্ষণ ১-৪ বৈশাখ */
        var bd = api.banglaDate(n.y, n.m, n.d);
        if (bd.month === 'বৈশাখ' && bd.day <= 4) return 'halakarsana';
        if (ln.next) return ln.next.key;
      } catch (_) {}
      return 'vesakha';
    }
  };

  /* ========== রেন্ডার (গ্রিড না থাকলে ছেড়ে দেব) ========== */
  if (!grid) return;

  MX.fetchJson('data/festivals-auto.json?v=20261025h').then(function (data) {
    var purnimas = data.purnimas12 || [];
    var next12 = {};
    var todayKey = null;
    try {
      var now = new Date();
      var until = new Date(now.getTime() + 380 * 86400000);
      var cal = MX.lunarCalendar(until);
      var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      cal.forEach(function (c) {
        if (c.adhik) return;
        if (c.date.getTime() === today.getTime()) todayKey = c.key;
        if (c.date < today) return;                          /* শুধু আজকে/আগামী */
        if (!next12[c.key]) next12[c.key] = c.date;
      });
      /* আজকের দিনটি যদি পূর্ণিমা হয় তবে next12-তেও নিশ্চিত করি (পূর্বের continue-এ miss হতে পারে) */
      if (todayKey) next12[todayKey] = today;
    } catch (_) {}

    /* তারিখ অনুযায়ী ক্রমে সাজাই (যেমন অক্টোবরের আশ্বিনী পূর্ণিমা নভেম্বরের
       কার্তিকের আগে দেখাবো) */
    var sorted = purnimas.slice().sort(function (a, b) {
      var da = next12[a.rule.month], db = next12[b.rule.month];
      if (!da && !db) return (a.order || 0) - (b.order || 0);
      if (!da) return 1; if (!db) return -1;
      return da - db;
    });

    var html = sorted.map(function (p) {
      var date = next12[p.rule.month];
      var isToday = todayKey && todayKey === p.rule.month;
      return '<article class="purnima-card' + (isToday ? ' today' : '') + '">' +
        '<span class="pc-num">' + bn(p.order) + '</span>' +
        '<div class="pc-icon">' + esc(p.icon) + '</div>' +
        '<h3>' + esc(p.bn_name) + '</h3>' +
        (p.alt_name ? '<p class="pc-alt">' + esc(p.alt_name) + '</p>' : '') +
        '<span class="pc-month">' + esc(p.bn_month) + ' · ' + esc(p.pali_month) + '</span>' +
        '<h4>📜 ইতিহাস ও তাৎপর্য</h4>' +
        '<p>' + esc(p.history) + '</p>' +
        (p.significance ? '<p><b>বিশেষ তাৎপর্য:</b> ' + esc(p.significance) + '</p>' : '') +
        '<div class="pc-todo"><b>🙏 এই দিনে করণীয়:</b> ' + esc(p.what_to_do) + '</div>' +
        (date ? '<p class="pc-date">🗓️ সম্ভাব্য তারিখ: ' + fmtDateOnly(date) + ' (আনুমানিক; বিহারের ঘোষণা মিলিয়ে নিন)</p>' : '') +
        (isToday ? '<p class="pc-date" style="color:#d35400">✨ আজই এই পূর্ণিমা!</p>' : '') +
        '</article>';
    }).join('');
    grid.innerHTML = html;

    /* উপোসথ ব্রত */
    var upo = data.uposatha;
    if (upo) {
      var upoT = document.getElementById('uposathaTitle');
      var upoI = document.getElementById('uposathaIntro');
      var upoG = document.getElementById('uposathaTypes');
      var upoTD = document.getElementById('uposathaTodo');
      if (upoT) upoT.textContent = upo.title;
      if (upoI) upoI.textContent = upo.intro;
      if (upoG && upo.types) {
        upoG.innerHTML = upo.types.map(function (t) {
          return '<div class="mx-card"><div class="upo-ico">' + esc(t.icon) + '</div>' +
            '<h3>' + esc(t.name) + '</h3><p>' + esc(t.desc) + '</p></div>';
        }).join('');
      }
      if (upoTD) upoTD.innerHTML = '<b>🙏 উপোসথ দিনের করণীয়:</b> ' + esc(upo.todo);
    }

    /* কঠিন চীবর */
    var k = data.kathina;
    if (k) {
      if (document.getElementById('kathinaTitle')) document.getElementById('kathinaTitle').textContent = k.title;
      if (document.getElementById('kathinaTime')) document.getElementById('kathinaTime').textContent = k.time_range;
      if (document.getElementById('kathinaRule')) document.getElementById('kathinaRule').textContent = k.rule;
      if (document.getElementById('kathinaSig')) document.getElementById('kathinaSig').textContent = k.significance;
      if (document.getElementById('kathinaProc')) document.getElementById('kathinaProc').textContent = k.process;
    }

    /* হলকর্ষণ */
    var h = data.halakarsana;
    if (h) {
      if (document.getElementById('halakarsanaTitle')) document.getElementById('halakarsanaTitle').textContent = h.title;
      if (document.getElementById('halakarsanaHistory')) document.getElementById('halakarsanaHistory').textContent = h.history;
      if (document.getElementById('halakarsanaConnection')) document.getElementById('halakarsanaConnection').textContent = h.bengali_calendar_connection;
      if (document.getElementById('halakarsanaTodo')) document.getElementById('halakarsanaTodo').textContent = h.what_to_do;
    }
  }).catch(function (e) {
    grid.innerHTML = '<div class="mx-warn"><b>ডেটা লোড হয়নি:</b> ' + esc(String(e && e.message || e)) + '। পাতাটি রিফ্রেশ করুন।</div>';
  });
})();
