/* চর্যাভূমি — বৌদ্ধ পঞ্জিকা, বাংলা-ইংরেজি ক্যালেন্ডার ও ঘড়ি (রাউন্ড ১৫)
   সব হিসাব ব্রাউজারেই: সূর্য-চন্দ্রের দ্রাঘিমা (Meeus-এর সংক্ষিপ্ত সূত্র), সূর্যোদয়-সূর্যাস্ত
   (স্ট্যান্ডার্ড সানরাইজ সমীকরণ), বাংলা বর্ষপঞ্জি (বাংলা একাডেমি, ২০১৯-সংশোধিত নিয়ম)।
   ছাপা পঞ্জিকা (লোকনাথ / বেণীমাধব শীল) সূর্যসিদ্ধান্ত-ভিত্তিক — তাই সন্ধিক্ষণে কয়েক মিনিট পার্থক্য হতে পারে। */
(function () {
  'use strict';

  /* ---------- সময় অঞ্চল: সব হিসাব ঢাকা (UTC+6) অনুসারে ---------- */
  var TZ = 6;
  var LAT = 23.8103, LON = 90.4125; /* ঢাকা */

  var BN_DIG = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  function bn(n) {
    return String(n).replace(/\d/g, function (d) { return BN_DIG[+d]; });
  }
  function pad2(n) { return (n < 10 ? '0' : '') + n; }

  var WEEK = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
  var WEEK_S = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি'];
  var EN_MONTH = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
  var BN_MONTH = ['বৈশাখ', 'জ্যৈষ্ঠ', 'আষাঢ়', 'শ্রাবণ', 'ভাদ্র', 'আশ্বিন', 'কার্তিক', 'অগ্রহায়ণ', 'পৌষ', 'মাঘ', 'ফাল্গুন', 'চৈত্র'];
  var TITHI = ['প্রতিপদ', 'দ্বিতীয়া', 'তৃতীয়া', 'চতুর্থী', 'পঞ্চমী', 'ষষ্ঠী', 'সপ্তমী', 'অষ্টমী', 'নবমী', 'দশমী',
    'একাদশী', 'দ্বাদশী', 'ত্রয়োদশী', 'চতুর্দশী', 'পূর্ণিমা',
    'প্রতিপদ', 'দ্বিতীয়া', 'তৃতীয়া', 'চতুর্থী', 'পঞ্চমী', 'ষষ্ঠী', 'সপ্তমী', 'অষ্টমী', 'নবমী', 'দশমী',
    'একাদশী', 'দ্বাদশী', 'ত্রয়োদশী', 'চতুর্দশী', 'অমাবস্যা'];
  var NAK = ['অশ্বিনী', 'ভরণী', 'কৃত্তিকা', 'রোহিণী', 'মৃগশীরা', 'আর্দ্রা', 'পুনর্বসু', 'পুষ্যা', 'অশ্লেষা', 'মঘা',
    'পূর্বফাল্গুনী', 'উত্তরফাল্গুনী', 'হস্তা', 'চিত্রা', 'স্বাতী', 'বিশাখা', 'অনুরাধা', 'জ্যেষ্ঠা', 'মূলা',
    'পূর্বাষাঢ়া', 'উত্তরাষাঢ়া', 'শ্রবণা', 'ধনিষ্ঠা', 'শতভিষা', 'পূর্বভাদ্রপদ', 'উত্তরভাদ্রপদ', 'রেবতী'];
  var YOGA = ['বিষ্কম্ভ', 'প্রীতি', 'আয়ুষ্মান', 'সৌভাগ্য', 'শোভন', 'অতিগণ্ড', 'সুখর্মা', 'ধৃতি', 'শূল', 'গণ্ড',
    'বৃদ্ধি', 'ধ্রুব', 'ব্যাঘাত', 'হর্ষণ', 'বজ্র', 'সিদ্ধি', 'ব্যতীপাত', 'বরীয়ান', 'পরিঘ', 'শিব',
    'সিদ্ধ', 'সাধ্য', 'শুভ', 'শুক্ল', 'ব্রহ্ম', 'ইন্দ্র', 'বৈধৃতি'];
  var KARANA_MOV = ['বব', 'বালব', 'কৌলব', 'তৈতিল', 'গর', 'বণিজ', 'বিষ্টি'];
  var KARANA_FIX = ['শকুনি', 'চতুষ্পদ', 'নাগ'];

  /* ---------- জুলিয়ান ডে ---------- */
  function jd(y, m, d, hour) {
    if (m <= 2) { y -= 1; m += 12; }
    var A = Math.floor(y / 100), B = 2 - A + Math.floor(A / 4);
    return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5 + (hour || 0) / 24;
  }
  function rad(x) { return x * Math.PI / 180; }
  function norm360(x) { x = x % 360; return x < 0 ? x + 360 : x; }

  /* ---------- সূর্য ও চন্দ্রের দ্রাঘিমা (tropical, সংক্ষিপ্ত সূত্র) ---------- */
  function sunLong(jdVal) {
    var T = (jdVal - 2451545.0) / 36525;
    var L0 = norm360(280.46646 + 36000.76983 * T + 0.0003032 * T * T);
    var M = norm360(357.52911 + 35999.05029 * T - 0.0001537 * T * T);
    var C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(rad(M)) +
      (0.019993 - 0.000101 * T) * Math.sin(rad(2 * M)) + 0.000289 * Math.sin(rad(3 * M));
    var omega = 125.04 - 1934.136 * T;
    return norm360(L0 + C - 0.00569 - 0.00478 * Math.sin(rad(omega)));
  }
  function moonLong(jdVal) {
    var T = (jdVal - 2451545.0) / 36525;
    var Lp = 218.3164477 + 481267.88123421 * T - 0.0015786 * T * T;
    var D = 297.8501921 + 445267.1114034 * T - 0.0018819 * T * T;
    var M = 357.5291092 + 35999.0502909 * T - 0.0001536 * T * T;
    var Mp = 134.9633964 + 477198.8675055 * T + 0.0087414 * T * T;
    var F = 93.2720950 + 483202.0175233 * T - 0.0036539 * T * T;
    var l = Lp +
      6.289 * Math.sin(rad(Mp)) +
      1.274 * Math.sin(rad(2 * D - Mp)) +
      0.658 * Math.sin(rad(2 * D)) +
      0.214 * Math.sin(rad(2 * Mp)) -
      0.186 * Math.sin(rad(M)) -
      0.114 * Math.sin(rad(2 * F)) +
      0.059 * Math.sin(rad(2 * D - 2 * Mp)) +
      0.057 * Math.sin(rad(2 * D - M - Mp)) +
      0.053 * Math.sin(rad(2 * D + Mp)) +
      0.046 * Math.sin(rad(2 * D - M)) +
      0.041 * Math.sin(rad(Mp - M)) -
      0.035 * Math.sin(rad(D)) -
      0.031 * Math.sin(rad(Mp + M)) -
      0.015 * Math.sin(rad(2 * F - 2 * D)) +
      0.011 * Math.sin(rad(Mp - 4 * D));
    return norm360(l);
  }

  /* ---------- পঞ্চাঙ্গের অঙ্গ ---------- */
  function panchanga(jdVal) {
    var s = sunLong(jdVal), m = moonLong(jdVal);
    var diff = norm360(m - s);
    var tIdx = Math.floor(diff / 12);           /* 0..29 */
    var n = tIdx + 1;                            /* 1..30 */
    var karanaIdx = Math.floor(diff / 6);        /* 0..59 */
    var karana = karanaIdx === 0 ? 'কিস্তুঘ্ন'
      : (karanaIdx >= 57 ? KARANA_FIX[karanaIdx - 57] : KARANA_MOV[(karanaIdx - 1) % 7]);
    return {
      tithi: n,
      tithiName: TITHI[tIdx],
      pakkha: n <= 15 ? 'শুক্লপক্ষ' : 'কৃষ্ণপক্ষ',
      tithiFrac: +(diff / 12).toFixed(2),
      nak: NAK[Math.floor(norm360(m) / (360 / 27))],
      yoga: YOGA[Math.floor(norm360(m + s) / (360 / 27))],
      karana: karana,
      moonPct: Math.round(100 * (1 - Math.cos(rad(diff))) / 2)
    };
  }

  /* ---------- সূর্যোদয় / সূর্যাস্ত (ঢাকা), ফল: ঢাকা সময়ে ঘণ্টা ---------- */
  function dayOfYear(y, m, d) {
    var dim = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    var n = d;
    for (var i = 0; i < m - 1; i++) n += dim[i];
    if (m > 2 && isLeap(y)) n += 1;
    return n;
  }
  /* NOAA-ধাঁচের সরল সমীকরণ — ঢাকার সূর্যোদয়/সূর্যাস্ত, ±২ মিনিট নির্ভুল */
  function sunTimes(y, m, d) {
    var N = dayOfYear(y, m, d);
    var B = rad(360 / 365 * (N - 81));
    var eot = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B); /* মিনিট */
    var decl = rad(-23.44 * Math.cos(rad(360 / 365 * (N + 10))));
    var cosHa = (Math.sin(rad(-0.833)) - Math.sin(rad(LAT)) * Math.sin(decl)) / (Math.cos(rad(LAT)) * Math.cos(decl));
    if (cosHa < -1 || cosHa > 1) return null;
    var ha = Math.acos(cosHa) * 180 / Math.PI;
    var noon = 12 - LON / 15 - eot / 60;      /* UT ঘণ্টা */
    return {
      rise: (noon - ha / 15 + TZ + 24) % 24,
      set: (noon + ha / 15 + TZ + 24) % 24,
      transit: (noon + TZ + 24) % 24
    };
  }
  function hhmm(h) {
    if (h == null) return '—';
    var H = Math.floor(h), Mi = Math.round((h - H) * 60);
    if (Mi === 60) { H += 1; Mi = 0; }
    return bn(pad2(H % 24)) + ':' + bn(pad2(Mi));
  }

  /* ---------- বাংলা বর্ষপঞ্জি (বাংলা একাডেমি ২০১৯ সংশোধিত) ---------- */
  function isLeap(y) { return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0; }
  function bnMonthLens(bYear) {
    var falgun = isLeap(bYear + 594) ? 30 : 29;     /* Falgun of bYear falls in Gregorian bYear+594 */
    return [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, falgun, 30];
  }
  function daysBetween(a, b) { return Math.round((b - a) / 86400000); }
  function banglaDate(y, m, d) {
    var afterNewYear = (m > 4) || (m === 4 && d >= 14);
    var startYear = afterNewYear ? y : y - 1;
    var bYear = startYear - 593;
    var start = Date.UTC(startYear, 3, 14);
    var off = daysBetween(start, Date.UTC(y, m - 1, d));
    var lens = bnMonthLens(bYear), i = 0;
    while (i < 12 && off >= lens[i]) { off -= lens[i]; i++; }
    return { year: bYear, month: BN_MONTH[i], monthIdx: i, day: off + 1, lens: lens };
  }

  /* ---------- ঢাকার “এখন” ---------- */
  function dhakaNow(ts) {
    var t = new Date((ts == null ? Date.now() : ts) + TZ * 3600 * 1000);
    return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate(), h: t.getUTCHours(), mi: t.getUTCMinutes(), s: t.getUTCSeconds(), wd: t.getUTCDay() };
  }
  function panchangaOn(y, m, d) {
    var st = sunTimes(y, m, d);
    var riseH = st ? st.rise : 6;
    return { p: panchanga(jd(y, m, d, (riseH - TZ))), st: st };
  }
  var cache = {};
  function dayInfo(y, m, d) {
    var k = y + '-' + m + '-' + d;
    if (!cache[k]) cache[k] = panchangaOn(y, m, d);
    return cache[k];
  }

  /* ---------- রেন্ডার: আজ ---------- */
  function renderToday() {
    var n = dhakaNow();
    var bd = banglaDate(n.y, n.m, n.d);
    var info = dayInfo(n.y, n.m, n.d);
    document.getElementById('todayWeek').textContent = WEEK[n.wd] + ' · ' + info.p.pakkha;
    document.getElementById('todayBnDate').textContent = bn(bd.day) + ' ' + bd.month + ' ' + bn(bd.year) + ' বঙ্গাব্দ';
    document.getElementById('todayEnDate').textContent = n.d + ' ' + EN_MONTH[n.m - 1] + ' ' + n.y + ' খ্রিস্টাব্দ';
    document.getElementById('todayEra').innerHTML =
      'বুদ্ধাব্দ <b>' + bn(n.y + 543) + '</b> · বঙ্গাব্দ <b>' + bn(bd.year) + '</b>';
    document.getElementById('todayClock').textContent = bn(pad2(n.h)) + ':' + bn(pad2(n.mi)) + ':' + bn(pad2(n.s));

    var p = info.p;
    var cards = [
      ['তিথি', p.tithiName + ' (' + bn(p.tithi) + ')', p.pakkha + ' · সূর্যোদয় অনুসারে'],
      ['নক্ষত্র', p.nak, 'চন্দ্র যে নক্ষত্রে আছে'],
      ['যোগ', p.yoga, 'সূর্য + চন্দ্র যোগে গঠিত'],
      ['করণ', p.karana, 'তিথির অর্ধভাগ'],
      ['বার', WEEK[n.wd], (n.wd === 0 || n.wd === 5) ? 'সাপ্তাহিক ছুটি' : 'কর্মদিবস'],
      ['চাঁদের কলা', bn(p.moonPct) + '%', p.moonPct < 50 ? 'কৃষ্ণপক্ষে কমছে' : 'শুক্লপক্ষে বাড়ছে']
    ];
    document.getElementById('panchGrid').innerHTML = cards.map(function (c) {
      return '<div class="cb-panch-card"><span>' + c[0] + '</span><b>' + c[1] + '</b><small>' + c[2] + '</small></div>';
    }).join('');

    if (info.st) {
      document.getElementById('sunNote').innerHTML =
        '🌅 সূর্যোদয় <b>' + hhmm(info.st.rise) + '</b> · সূর্যাস্ত <b>' + hhmm(info.st.set) +
        '</b> · মধ্যাহ্ন <b>' + hhmm(info.st.transit) + '</b> — ঢাকা (২৩.৮১° উ, ৯০.৪১° পূ) অনুসারে। তিথি গণনা করা হয়েছে সূর্যোদয়ের মুহূর্তে, ছাপা পঞ্জিকার নিয়ম মেনে।';
    }
  }

  /* ---------- রেন্ডার: আসন্ন পূর্ণিমা, অমাবস্যা, উপোসথ ---------- */
  function upcoming(days) {
    var n = dhakaNow(), out = [];
    for (var i = 0; i < days; i++) {
      var t = new Date(Date.UTC(n.y, n.m - 1, n.d) + i * 86400000);
      var y = t.getUTCFullYear(), m = t.getUTCMonth() + 1, d = t.getUTCDate();
      var info = dayInfo(y, m, d);
      out.push({ y: y, m: m, d: d, wd: t.getUTCDay(), t: info.p.tithi, name: info.p.tithiName, bd: banglaDate(y, m, d) });
    }
    return out;
  }
  function fmtDate(o) {
    return bn(o.d) + ' ' + EN_MONTH[o.m - 1] + ' ' + bn(o.y) + ' · ' + bn(o.bd.day) + ' ' + o.bd.month + ' · ' + WEEK_S[o.wd];
  }
  function renderUpcoming() {
    var list = upcoming(75);
    var fulls = list.filter(function (x) { return x.t === 15; }).slice(0, 2);
    var news = list.filter(function (x) { return x.t === 30; }).slice(0, 2);
    var upo = list.filter(function (x) { return x.t === 8 || x.t === 15 || x.t === 23 || x.t === 30; }).slice(0, 4);
    function card(kind, title, arr, icon) {
      return '<div class="cb-upo-card"><p class="cb-upo-k">' + icon + ' ' + kind + '</p><h3>' + title + '</h3><ul>' +
        arr.map(function (x) { return '<li>' + fmtDate(x) + '</li>'; }).join('') + '</ul></div>';
    }
    document.getElementById('upoGrid').innerHTML =
      card('পূর্ণিমা', fulls.length ? 'আসন্ন পূর্ণিমা' : '—', fulls, '🌕') +
      card('অমাবস্যা', news.length ? 'আসন্ন অমাবস্যা' : '—', news, '🌑') +
      card('উপোসথ', 'আসন্ন উপোসথ (অষ্টশীল)', upo, '☸');

    /* বছরের বড় পূর্ণিমা — বুদ্ধ পূর্ণিমা, আষাঢ়ী, প্রবারণা, মাঘী */
    var n = dhakaNow();
    var bd = banglaDate(n.y, n.m, n.d);
    var startYear = bd.year + 593;
    var fullMoons = [];
    for (var i = 0; i < 366; i++) {
      var t = new Date(Date.UTC(startYear, 3, 14) + i * 86400000);
      var y = t.getUTCFullYear(), m = t.getUTCMonth() + 1, d = t.getUTCDate();
      var info = dayInfo(y, m, d);
      if (info.p.tithi === 15) {
        var b2 = banglaDate(y, m, d);
        var last = fullMoons[fullMoons.length - 1];
        /* দীর্ঘ তিথি দুই সূর্যোদয়ে থাকলে একই পূর্ণিমা দুবার গোনা হবে না */
        if (!last || (Date.UTC(y, m - 1, d) - Date.UTC(last.y, last.m - 1, last.d)) > 86400000) {
          fullMoons.push({ y: y, m: m, d: d, wd: t.getUTCDay(), bd: b2 });
        }
      }
    }
    var LABEL = {
      'বৈশাখ': 'বুদ্ধ পূর্ণিমা — বুদ্ধের জন্ম, বোধি ও মহাপরিনির্বাণের স্মৃতি',
      'আষাঢ়': 'আষাঢ়ী পূর্ণিমা — বর্ষাবাস (ভিক্ষুদের বৃষ্টিবাস) শুরু',
      'আশ্বিন': 'প্রবারণা পূর্ণিমা — বর্ষাবাস শেষ, চীবর-দান ও কথা পূর্ণিমা',
      'মাঘ': 'মাঘী পূর্ণিমা — ত্রিপিটক-স্মৃতি ও সংঘের দিন',
      'ফাল্গুন': 'ফাল্গুনী পূর্ণিমা — মাঘোৎসবের সমাপ্তি-পর্ব'
    };
    var mine = fullMoons.filter(function (x) { return LABEL[x.bd.month]; }).map(function (x) {
      return '<li><span>' + bn(x.bd.day) + ' ' + x.bd.month + ' ' + bn(x.bd.year) + '</span> <b>' + fmtDate(x) + '</b><br><small>' + LABEL[x.bd.month] + '</small></li>';
    });
    document.getElementById('obsList').innerHTML = mine.length ? mine.join('') :
      '<li>এই বঙ্গাব্দের হিসাব তৈরি হচ্ছে — পাতাটি একবার রিফ্রেশ করুন।</li>';
  }

  /* ---------- রেন্ডার: মাস-ক্যালেন্ডার ---------- */
  var cur = dhakaNow();
  var view = { y: cur.y, m: cur.m };

  function renderCal() {
    var first = new Date(Date.UTC(view.y, view.m - 1, 1));
    var dim = new Date(Date.UTC(view.y, view.m, 0)).getUTCDate();
    var startDow = first.getUTCDay();
    var today = dhakaNow();
    var bdM = banglaDate(view.y, view.m, Math.min(15, dim));

    document.getElementById('calTitle').textContent = EN_MONTH[view.m - 1] + ' ' + bn(view.y);
    document.getElementById('calSub').innerHTML = 'প্রতিটি ঘরে বড় সংখ্যা ইংরেজি তারিখ, ছোট সংখ্যা বাংলা তারিখ (এই মাস মূলত <b>' +
      bdM.month + ' ' + bn(bdM.year) + '</b> বঙ্গাব্দ); 🌕 = পূর্ণিমা, 🌑 = অমাবস্যা, ☸ = উপোসথ।';

    var html = '<thead><tr>' + WEEK_S.map(function (w) { return '<th scope="col">' + w + '</th>'; }).join('') + '</tr></thead><tbody><tr>';
    for (var i = 0; i < startDow; i++) html += '<td class="empty"></td>';
    var cell = startDow;
    for (var d = 1; d <= dim; d++) {
      var info = dayInfo(view.y, view.m, d);
      var bd = banglaDate(view.y, view.m, d);
      var isToday = (view.y === today.y && view.m === today.m && d === today.d);
      var mark = info.p.tithi === 15 ? '🌕' : (info.p.tithi === 30 ? '🌑' : '');
      var upo = (info.p.tithi === 8 || info.p.tithi === 23) ? '☸' : '';
      html += '<td class="' + (isToday ? 'today' : '') + '" title="' + info.p.tithiName + ' · ' + info.p.nak + '">' +
        '<span class="en">' + bn(d) + '</span>' +
        '<span class="bnd">' + bn(bd.day) + ' ' + bd.month.slice(0, 3) + '</span>' +
        '<span class="mk">' + mark + upo + '</span></td>';
      cell++;
      if (cell % 7 === 0 && d !== dim) html += '</tr><tr>';
    }
    while (cell % 7 !== 0) { html += '<td class="empty"></td>'; cell++; }
    html += '</tr></tbody>';
    document.getElementById('calGrid').innerHTML = html;
  }

  function renderBngYear() {
    var n = dhakaNow();
    var bd = banglaDate(n.y, n.m, n.d);
    var startYear = bd.year + 593;
    var lens = bnMonthLens(bd.year);
    var cursor = Date.UTC(startYear, 3, 14);
    var rows = BN_MONTH.map(function (name, i) {
      var s = new Date(cursor);
      cursor = cursor + lens[i] * 86400000;
      var e = new Date(cursor - 86400000);
      return '<tr' + (i === bd.monthIdx ? ' class="me"' : '') + '><th scope="row">' + name + '</th><td class="num">' + bn(lens[i]) +
        '</td><td>' + bn(s.getUTCDate()) + ' ' + EN_MONTH[s.getUTCMonth()] + ' ' + bn(s.getUTCFullYear()) +
        '</td><td>' + bn(e.getUTCDate()) + ' ' + EN_MONTH[e.getUTCMonth()] + ' ' + bn(e.getUTCFullYear()) + '</td></tr>';
    }).join('');
    var total = lens.reduce(function (a, b) { return a + b; }, 0);
    document.getElementById('bnMonthTable').innerHTML =
      '<caption>বঙ্গাব্দ ' + bn(bd.year) + ' — ' + bn(12) + ' মাস, মোট ' + bn(total) + ' দিন</caption>' +
      '<thead><tr><th scope="col">মাস</th><th scope="col">দিন</th><th scope="col">শুরু (ইংরেজি)</th><th scope="col">শেষ (ইংরেজি)</th></tr></thead><tbody>' + rows + '</tbody>';
    document.getElementById('bnYearTitle').textContent = 'বঙ্গাব্দ ' + bn(bd.year) + ' — মাসের হিসাব';
    document.getElementById('bnYearSub').innerHTML = 'বাংলা একাডেমির ২০১৯-সংশোধিত নিয়ম: <b>বৈশাখ-আশ্বিন ৬ মাস ৩১ দিন</b>, কার্তিক-মাঘ ও চৈত্র ৩০ দিন, <b>ফাল্গুন ২৯ দিন</b> (ইংরেজি অধিবর্ষে ৩০)। ১ বৈশাখ = ১৪ এপ্রিল। ' +
      (isLeap(bd.year + 594) ? 'এই বঙ্গাব্দের ফাল্গুন ৩০ দিনের (ইংরেজি ' + bn(bd.year + 594) + ' অধিবর্ষ)।' : 'এই বঙ্গাব্দের ফাল্গুন ২৯ দিনের।');
  }

  /* ---------- চালু ---------- */
  function boot() {
    renderToday();
    renderUpcoming();
    renderCal();
    renderBngYear();

    var prev = document.getElementById('calPrev'), next = document.getElementById('calNext'), t = document.getElementById('calToday');
    if (prev) prev.addEventListener('click', function () { view.m--; if (view.m < 1) { view.m = 12; view.y--; } renderCal(); });
    if (next) next.addEventListener('click', function () { view.m++; if (view.m > 12) { view.m = 1; view.y++; } renderCal(); });
    if (t) t.addEventListener('click', function () { var n = dhakaNow(); view = { y: n.y, m: n.m }; renderCal(); });

    /* ঘড়ি: প্রতি সেকেন্ডে */
    setInterval(function () {
      var n = dhakaNow();
      var el = document.getElementById('todayClock');
      if (el) el.textContent = bn(pad2(n.h)) + ':' + bn(pad2(n.mi)) + ':' + bn(pad2(n.s));
      /* রাত ১২টা পেরোলে তারিখ-তিথি ও ক্যালেন্ডার নিজে নিজে নতুন হবে */
      if (n.h === 0 && n.mi === 0 && n.s === 1) { renderToday(); renderUpcoming(); renderCal(); renderBngYear(); }
    }, 1000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
