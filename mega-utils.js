/* চর্যাভূমি — Mega Features shared utilities (2026-10-24) */
(function () {
  'use strict';
  var BN = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
  function bn(n) { return String(n).replace(/\d/g, function (d) { return BN[+d]; }); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function $(id) { return document.getElementById(id); }
  function fetchJson(url) {
    return fetch(url).then(function (r) { if (!r.ok) throw new Error(url + ' ' + r.status); return r.json(); });
  }
  function money(n) {
    if (n == null || isNaN(n)) return '—';
    return '৳' + bn(Math.round(n).toLocaleString('en-IN'));
  }
  function Haversine(lat1, lon1, lat2, lon2) {
    var R = 6371, dLat = (lat2 - lat1) * Math.PI / 180, dLon = (lon2 - lon1) * Math.PI / 180;
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
  function mapsDir(destLat, destLon, mode, origin) {
    var u = 'https://www.google.com/maps/dir/?api=1&destination=' + destLat + ',' + destLon;
    if (origin) u += '&origin=' + encodeURIComponent(origin);
    if (mode) u += '&travelmode=' + mode;
    return u;
  }
  function mapsSearch(q, lat, lon) {
    return 'https://www.google.com/maps/search/' + encodeURIComponent(q) + '/@' + lat + ',' + lon + ',13z';
  }
  function streetViewLink(lat, lon) {
    return 'https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=' + lat + ',' + lon;
  }
  function streetViewEmbed(lat, lon) {
    return 'https://maps.google.com/maps?q=&layer=c&cbll=' + lat + ',' + lon + '&cbp=11,0,0,0,0&output=svembed';
  }
  function earthLink(lat, lon) {
    return 'https://earth.google.com/web/@' + lat + ',' + lon + ',120a,800d,35y,0h,45t,0r';
  }
  function timelapseLink(lat, lon) {
    return 'https://earthengine.google.com/timelapse/#v=' + lat + ',' + lon + ',11,latLng&t=2.52&ps=50';
  }
  function wazeLink(lat, lon) {
    return 'https://waze.com/ul?ll=' + lat + '%2C' + lon + '&navigate=yes';
  }
  function scholarLink(q) { return 'https://scholar.google.com/scholar?q=' + encodeURIComponent(q); }
  function booksLink(q) { return 'https://www.google.com/search?tbm=bks&q=' + encodeURIComponent(q); }
  function youtubeSearch(q) { return 'https://www.youtube.com/results?search_query=' + encodeURIComponent(q); }
  function lensByUrl(u) { return 'https://lens.google.com/uploadbyurl?url=' + encodeURIComponent(u); }
  function translateLink(text, target) {
    return 'https://translate.google.com/?sl=auto&tl=' + (target || 'en') + '&text=' + encodeURIComponent(text) + '&op=translate';
  }
  function gcalLink(title, date, details) {
    var d = date.toISOString().slice(0, 10).replace(/-/g, '');
    var d2 = new Date(date.getTime() + 86400000).toISOString().slice(0, 10).replace(/-/g, '');
    return 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent(title) +
      '&dates=' + d + '/' + d2 + '&details=' + encodeURIComponent(details || '');
  }
  function icsDownload(filename, events) {
    var body = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Charyabhumi//Festivals//BN'];
    events.forEach(function (e, i) {
      var d = e.date.toISOString().slice(0, 10).replace(/-/g, '');
      body.push('BEGIN:VEVENT', 'UID:mx-' + Date.now() + '-' + i + '@charyabhumi',
        'DTSTART;VALUE=DATE:' + d, 'SUMMARY:' + e.title,
        'DESCRIPTION:' + (e.desc || '').replace(/\n/g, ' '), 'END:VEVENT');
    });
    body.push('END:VCALENDAR');
    download(filename, body.join('\r\n'), 'text/calendar;charset=utf-8');
  }
  function download(filename, text, type) {
    var b = new Blob([text], { type: type || 'text/plain;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(b); a.download = filename;
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 400);
  }
  function toast(msg) {
    var t = document.querySelector('.mx-toast');
    if (!t) { t = document.createElement('div'); t.className = 'mx-toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('show');
    clearTimeout(t._h); t._h = setTimeout(function () { t.classList.remove('show'); }, 3200);
  }
  function getLocal(key, fb) {
    try { var v = localStorage.getItem(key); return v ? JSON.parse(v) : fb; } catch (e) { return fb; }
  }
  function setLocal(key, v) { try { localStorage.setItem(key, JSON.stringify(v)); } catch (e) { /* ignore */ } }
  function copyText(text, okMsg) {
    function done() { toast(okMsg || 'কপি হয়েছে ✓'); }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { legacy(); });
    } else legacy();
    function legacy() {
      var ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta);
      ta.select(); try { document.execCommand('copy'); done(); } catch (e) { toast('কপি করা যায়নি — হাতে লিখে নিন'); }
      ta.remove();
    }
  }
  function speak(text, lang) {
    if (!('speechSynthesis' in window)) { toast('এই ব্রাউজারে ভয়েস সাপোর্ট নেই'); return; }
    speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(text);
    u.lang = lang || 'bn-BD';
    u.onerror = function () { toast('ভয়েস চালানো যায়নি — ডিভাইসে বাংলা ভয়েস থাকলে আবার চেষ্টা করুন'); };
    speechSynthesis.speak(u);
  }
  function trackLocal(page) {
    try {
      var k = 'cb.analytics.local.v1';
      var a = getLocal(k, { views: {}, first: Date.now() });
      a.views[page] = (a.views[page] || 0) + 1;
      setLocal(k, a);
    } catch (e) { /* ignore */ }
  }

  /* ---------- চন্দ্রপঞ্জি ইঞ্জিন (উৎসব অটো-তারিখের জন্য) ----------
     পদ্ধতি: খগোল-গণনায় পূর্ণিমা (চন্দ্র-সূর্য দ্রাঘিমা ব্যবধান ১৮০°) বের করে
     জানা অ্যাঙ্কর (২০২৫-০১-১৪ পূর্ণিমা = পুস্স মাস) থেকে থেরবাদী চান্দ্রমাস
     গণনা। যে খ্রিস্টাব্দে ১৩টি পূর্ণিমা পড়ে সেখানে আষাঢ় মাসে অধিক মাস
     (দ্বিতীয় Waso-রীতি) ধরা হয়। ফল আনুমানিক (±১ দিন, অধিক-মাসের বছরে
     দেশভেদে এক মাস পর্যন্ত ভিন্ন হতে পারে) — বিহারের ঘোষণাই চূড়ান্ত। */
  function rad(x) { return x * Math.PI / 180; }
  function norm360(x) { x = x % 360; return x < 0 ? x + 360 : x; }
  function jdOf(date) { return date.getTime() / 86400000 + 2440587.5; }
  function sunLong(jd) {
    var T = (jd - 2451545.0) / 36525;
    var L0 = norm360(280.46646 + 36000.76983 * T);
    var M = norm360(357.52911 + 35999.05029 * T);
    var C = 1.914602 * Math.sin(rad(M)) + 0.019993 * Math.sin(rad(2 * M));
    return norm360(L0 + C);
  }
  function moonLong(jd) {
    var T = (jd - 2451545.0) / 36525;
    var Lp = 218.3164477 + 481267.88123421 * T;
    var D = 297.8501921 + 445267.1114034 * T;
    var M = 357.5291092 + 35999.0502909 * T;
    var Mp = 134.9633964 + 477198.8675055 * T;
    var F = 93.2720950 + 483202.0175233 * T;
    return norm360(Lp + 6.289 * Math.sin(rad(Mp)) + 1.274 * Math.sin(rad(2 * D - Mp)) +
      0.658 * Math.sin(rad(2 * D)) + 0.214 * Math.sin(rad(2 * Mp)) -
      0.186 * Math.sin(rad(M)) - 0.114 * Math.sin(rad(2 * F)));
  }
  function moonPhaseAngle(date) { var jd = jdOf(date); return norm360(moonLong(jd) - sunLong(jd)); }
  var Dhaka_OFFSET_MS = 6 * 3600000;
  function dhakaDateOf(ms) {
    var d = new Date(ms + Dhaka_OFFSET_MS);
    return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  }
  /* fromDate-এর পরের পূর্ণিমা-মুহূর্ত (৬ ঘণ্টা ধাপে খুঁজে Dhaka-তারিখ ফেরত) */
  function nextFullMoon(fromDate) {
    var t = fromDate.getTime();
    var prev = moonPhaseAngle(new Date(t));
    for (var i = 0; i < 200; i++) {
      t += 6 * 3600000;
      var ang = moonPhaseAngle(new Date(t));
      if (prev < 180 && ang >= 180) return dhakaDateOf(t);
      if (prev > 300 && ang < 60) { /* wrap — নতুন চক্র */ }
      prev = ang;
    }
    return null;
  }
  function fullMoonsInRange(start, end) {
    var out = [], cur = new Date(start.getTime() - 86400000), f;
    while ((f = nextFullMoon(cur)) && f <= end) { out.push(f); cur = new Date(f.getTime() + 2 * 86400000); if (out.length > 64) break; }
    return out;
  }
  var LUNAR_MONTHS = ['Citta (চৈত্র)', 'Vesakha (বৈশাখ)', 'Jettha (জ্যৈষ্ঠ)', 'Asalha (আষাঢ়)', 'Savana (শ্রাবণ)', 'Potthapada (ভাদ্র)', 'Assayuja (আশ্বিন)', 'Kattika (কার্তিক)', 'Maggasira (অগ্রহায়ণ)', 'Phussa (পৌষ)', 'Magha (মাঘ)', 'Phagguna (ফাল্গুন)'];
  var LUNAR_KEYS = ['citta', 'vesakha', 'jettha', 'asalha', 'savana', 'potthapada', 'assayuja', 'kattika', 'maggasira', 'phussa', 'magha', 'phagguna'];
  /* অ্যাঙ্কর থেকে endDate পর্যন্ত সব পূর্ণিমায় চান্দ্রমাস বসিয়ে তালিকা */
  function lunarCalendar(untilDate) {
    var anchorStart = new Date(2024, 11, 20);
    var fms = fullMoonsInRange(anchorStart, untilDate);
    var anchorIdx = -1;
    for (var i = 0; i < fms.length; i++) {
      if (fms[i].getFullYear() === 2025 && fms[i].getMonth() === 0) { anchorIdx = i; break; }
    }
    if (anchorIdx < 0) anchorIdx = 0;
    /* খ্রিস্টাব্দে ১৩ পূর্ণিমা আছে কিনা */
    var perYear = {};
    fms.forEach(function (f) { perYear[f.getFullYear()] = (perYear[f.getFullYear()] || 0) + 1; });
    var out = [], monthIdx = 9 /* Phussa */, adhikDoneYear = -1;
    for (var j = anchorIdx; j < fms.length; j++) {
      var f = fms[j];
      var isAdhik = false;
      if (j > anchorIdx) {
        var nextIdx = (monthIdx + 1) % 12;
        if (LUNAR_KEYS[nextIdx] === 'asalha' && perYear[f.getFullYear()] >= 13 && adhikDoneYear !== f.getFullYear()) {
          isAdhik = true; adhikDoneYear = f.getFullYear();
          monthIdx = nextIdx; /* এই পূর্ণিমা অধিক-আষাঢ়; পরেরটিও আষাঢ় (নিজ) হবে */
          out.push({ date: f, key: 'asalha', month: LUNAR_MONTHS[nextIdx], adhik: true });
          monthIdx = (nextIdx + 11) % 12; /* এমনভাবে বসাও যাতে পরের পূর্ণিমায় আবার আষাঢ় আসে */
          continue;
        }
        monthIdx = nextIdx;
      }
      out.push({ date: f, key: LUNAR_KEYS[monthIdx], month: LUNAR_MONTHS[monthIdx], adhik: isAdhik });
    }
    return out;
  }
  function nextLunarFestivals(festivalDefs, fromDate) {
    var until = new Date(fromDate.getTime() + 430 * 86400000);
    var cal = lunarCalendar(until);
    var today = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
    var byKey = {};
    cal.forEach(function (c) { if (c.date >= today && !byKey[c.key]) byKey[c.key] = c; });
    var results = [];
    (festivalDefs || []).forEach(function (def) {
      var r = def.rule || {}, date = null, lunarName = '';
      if (r.type === 'lunar-month') {
        var hit = null;
        for (var i = 0; i < cal.length; i++) {
          if (cal[i].date >= today && cal[i].key === r.month && !cal[i].adhik) { hit = cal[i]; break; }
        }
        if (hit) { date = hit.date; lunarName = hit.month; }
      } else if (r.type === 'next-full-moon') {
        var nf = nextFullMoon(today);
        if (nf) date = nf;
      } else if (r.type === 'day-after') {
        /* caller অন্য উৎসবের তারিখ যোগ করে দেবে */
        date = null;
      }
      results.push({ def: def, date: date, lunarName: lunarName });
    });
    /* day-after নির্ভরতা পূরণ */
    results.forEach(function (x) {
      var r = x.def.rule || {};
      if (r.type === 'day-after' && r.of) {
        var base = results.filter(function (y) { return y.def.id === r.of; })[0];
        if (base && base.date) x.date = new Date(base.date.getTime() + 86400000);
      }
    });
    return results.filter(function (x) { return x.date; }).sort(function (a, b) { return a.date - b.date; });
  }
  var BN_MONTHS = ['বৈশাখ','জ্যৈষ্ঠ','আষাঢ়','শ্রাবণ','ভাদ্র','আশ্বিন','কার্তিক','অগ্রহায়ণ','পৌষ','মাঘ','ফাল্গুন','চৈত্র'];
  function fmtBnDate(date) {
    var ENM = ['জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর'];
    return bn(date.getDate()) + ' ' + ENM[date.getMonth()] + ' ' + bn(date.getFullYear());
  }

  window.MX = {
    bn: bn, esc: esc, $: $, fetchJson: fetchJson, money: money, Haversine: Haversine,
    mapsDir: mapsDir, mapsSearch: mapsSearch, streetViewLink: streetViewLink,
    streetViewEmbed: streetViewEmbed, earthLink: earthLink, timelapseLink: timelapseLink,
    wazeLink: wazeLink, scholarLink: scholarLink, booksLink: booksLink,
    youtubeSearch: youtubeSearch, lensByUrl: lensByUrl, translateLink: translateLink,
    gcalLink: gcalLink, icsDownload: icsDownload, download: download,
    toast: toast, getLocal: getLocal, setLocal: setLocal, copyText: copyText, speak: speak,
    trackLocal: trackLocal, nextFullMoon: nextFullMoon, fullMoonsInRange: fullMoonsInRange,
    lunarCalendar: lunarCalendar, nextLunarFestivals: nextLunarFestivals, LUNAR_MONTHS: LUNAR_MONTHS,
    BN_MONTHS: BN_MONTHS, fmtBnDate: fmtBnDate, moonPhaseAngle: moonPhaseAngle
  };
})();
