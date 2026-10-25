/* চর্যাভূমি — উন্নত চন্দ্রপঞ্জি ইঞ্জিন (2026-10-25 v2)
   Meeus-সংক্ষিপ্ত সূর্য-চন্দ্র দ্রাঘিমা (অধিকতর নির্ভুল) + ব্যবহারকারীর টাইমজোন সমর্থন।
   পূর্ণিমা নির্ণয়: যে স্থানীয় দিনের রাতে (সূর্যাস্ত-পর) চন্দ্রোদয় হয় ও চাঁদ পূর্ণ দেখায়,
   সেই দিনটিই পূর্ণিমা হিসেবে গণ্য — পুরোপঞ্জিকা/সংঘের রীতি অনুযায়ী। */
(function () {
  'use strict';
  if (!window.MX) return;

  var BN = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
  var ENM = ['জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর'];
  var WEEK = ['রবিবার','সোমবার','মঙ্গলবার','বুধবার','বৃহস্পতিবার','শুক্রবার','শনিবার'];
  var WEEK_S = ['রবি','সোম','মঙ্গল','বুধ','বৃহঃ','শুক্র','শনি'];
  var BN_MONTHS = ['বৈশাখ','জ্যৈষ্ঠ','আষাঢ়','শ্রাবণ','ভাদ্র','আশ্বিন','কার্তিক','অগ্রহায়ণ','পৌষ','মাঘ','ফাল্গুন','চৈত্র'];
  var LUNAR_MONTHS = ['Citta (চৈত্র)','Vesakha (বৈশাখ)','Jettha (জ্যৈষ্ঠ)','Asalha (আষাঢ়)','Savana (শ্রাবণ)','Potthapada (ভাদ্র)','Assayuja (আশ্বিন)','Kattika (কার্তিক)','Maggasira (অগ্রহায়ণ)','Phussa (পৌষ)','Magha (মাঘ)','Phagguna (ফাল্গুন)'];
  var LUNAR_KEYS = ['citta','vesakha','jettha','asalha','savana','potthapada','assayuja','kattika','maggasira','phussa','magha','phagguna'];

  function bn(n){return String(n).replace(/\d/g,function(d){return BN[+d];});}
  function rad(x){return x*Math.PI/180;}
  function norm360(x){x=x%360;return x<0?x+360:x;}
  function dsin(x){return Math.sin(rad(x));}
  function dcos(x){return Math.cos(rad(x));}

  /* ---- ব্যবহারকারীর টাইমজোন অফসেট (মিনিট) ---- */
  function getUserTzOffsetMin(){
    try { return -new Date().getTimezoneOffset(); } catch(e){ return 6*60; }
  }
  function getUserTzName(){
    try { return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Dhaka'; }
    catch(e){ return 'Asia/Dhaka'; }
  }
  /* যেকোনো Date-কে ব্যবহারকারীর লোকাল তারিখে (year,month,day) রূপান্তর */
  function localDateParts(date){
    var d = new Date(date.getTime());
    return { y: d.getFullYear(), m: d.getMonth()+1, d: d.getDate(), wd: d.getDay() };
  }
  function localDateOf(y,m,d){ return new Date(y, m-1, d); }
  /* UTC-তে স্থানীয় মধ্যরাত্রি (00:00) — ইউটিসি মিলিসেকেন্ড */
  function localMidnightUTC(date){
    var p = localDateParts(date);
    return Date.UTC(p.y, p.m-1, p.d);
  }

  /* ---- সৌর/চান্দ্র গণনা (বর্ধিত নির্ভুলতা) ---- */
  function jdFromDate(date){
    /* জুলিয়ান দিন সংখ্যা (TT ≈ UT+69s, এখানে UT যথেষ্ট) */
    return date.getTime()/86400000 + 2440587.5;
  }
  /* সূর্যের দ্রাঘিমা (Meeus, AA চ্যাপ্টার 25 সংক্ষিপ্ত, নুটেশন সহ) */
  function sunLong(jd){
    var T = (jd - 2451545.0)/36525;
    var L0 = norm360(280.46646 + 36000.76983*T + 0.0003032*T*T);
    var M  = norm360(357.52911 + 35999.05029*T - 0.0001537*T*T);
    var C  = (1.914602 - 0.004817*T - 0.000014*T*T)*dsin(M) +
             (0.019993 - 0.000101*T)*dsin(2*M) +
             0.000289*dsin(3*M);
    var omega = 125.04 - 1934.136*T;  /* নুটেশন correction */
    var lon = L0 + C - 0.00569 - 0.00478*dsin(omega);
    return norm360(lon);
  }
  /* চন্দ্রের দ্রাঘিমা (Meeus Ch.47 সংক্ষিপ্ত; আরো terms) */
  function moonLong(jd){
    var T = (jd - 2451545.0)/36525;
    var Lp = 218.3164477 + 481267.88123421*T - 0.0015786*T*T;
    var D  = 297.8501921 + 445267.1114034*T - 0.0018819*T*T;
    var M  = 357.5291092 + 35999.0502909*T - 0.0001536*T*T;
    var Mp = 134.9633964 + 477198.8675055*T + 0.0087414*T*T;
    var F  = 93.2720950 + 483202.0175233*T - 0.0036539*T*T;
    /* আরো terms → ~0.1° নির্ভুলতা */
    var A1 = 119.75 +    131.849*T;
    var A2 =  53.09 + 479264.290*T;
    var A3 = 313.45 + 481266.484*T;
    var l = Lp
      + 6.288750*dsin(Mp)
      + 1.274018*dsin(2*D - Mp)
      + 0.658309*dsin(2*D)
      + 0.213616*dsin(2*Mp)
      - 0.185596*dsin(M)
      - 0.114336*dsin(2*F)
      + 0.058793*dsin(2*D - 2*Mp)
      + 0.057066*dsin(2*D - M - Mp)
      + 0.053320*dsin(2*D + Mp)
      + 0.045758*dsin(2*D - M)
      + 0.041024*dsin(Mp - M)
      - 0.034718*dsin(D)
      - 0.030465*dsin(Mp + M)
      - 0.015326*dsin(2*F - 2*D)
      + 0.012524*dsin(Mp - 4*D)
      - 0.010980*dsin(Mp + 2*M)  /* extra */
      + 0.010674*dsin(4*D - Mp)
      + 0.010034*dsin(2*M)
      + 0.008548*dsin(Mp - 3*D)
      + 0.007910*dsin(2*Mp + 2*D)
      + 0.003872*dsin(A1)
      + 0.002695*dsin(A3)
      - 0.001667*dsin(A2 - 2*F)
      + 0.001324*dsin(2*D - Mp - M);
    return norm360(l);
  }
  function moonPhaseAngle(date){ return norm360(moonLong(jdFromDate(date)) - sunLong(jdFromDate(date))); }

  /* ---- পূর্ণিমা/অমাবস্যা খোঁজা (binary search, স্থানীয় দিন ফেরত) ---- */
  function findPhaseTime(fromMs, toMs, target, toleranceMs){
    toleranceMs = toleranceMs || 2*60*1000;
    var lo = fromMs, hi = toMs;
    for (var i = 0; i < 60; i++) {
      if (hi - lo < toleranceMs) break;
      var mid = (lo + hi)/2;
      var a = moonPhaseAngle(new Date(lo));
      var b = moonPhaseAngle(new Date(hi));
      var m = moonPhaseAngle(new Date(mid));
      /* wrap 0° case: a>300, b<60 */
      if (target === 0) {
        if (m < 60) hi = mid; else lo = mid;
      } else {
        /* standard: a<target≤b */
        if (m < target) lo = mid; else hi = mid;
      }
    }
    return new Date((lo+hi)/2);
  }
  function nextPhaseAfter(date, target){
    /* খুঁজি যে phase কখন target অতিক্রম করবে — 10মিনিট ধাপে প্রথমে */
    var t = date.getTime();
    var step = 30*60*1000; /* ৩০ মিনিট ধাপে rough */
    var prev = moonPhaseAngle(new Date(t));
    for (var i = 0; i < 3000; i++) {
      var t2 = t + step;
      var ang = moonPhaseAngle(new Date(t2));
      if (target === 0) {
        /* new moon: wrap from >300 to <60 */
        if (prev > 300 && ang < 60) return findPhaseTime(t-step, t2, target);
      } else {
        if (prev < target && ang >= target) return findPhaseTime(t-step, t2, target);
      }
      t = t2; prev = ang;
    }
    return null;
  }
  /* full moment (১৮০°) এবং new moment (০°) */
  function nextFullMoment(date){ return nextPhaseAfter(date, 180); }
  function nextNewMoment(date){ return nextPhaseAfter(date, 0); }

  /* ---- পূর্ণিমার পালনের দিন নির্ণয় (থেরবাদ রীতি)
     যে দিনের রাতে সূর্যাস্তের পর চাঁদ সবচেয়ে পূর্ণ দেখায় সেই দিন পূর্ণিমা।
     পূর্ণ-সংক্রান্তি স্থানীয় দুপুর ১২টার আগে হলে আগের দিন রাতটাই পূর্ণিমার রাত।
     বিশেষভাবে কখনও কখনও সংঘ/পঞ্জিকা (লোকনাথ/বেণীমাধব/বিহার) এক দিন আগে/পরে পালন করে —
     এই ধরনের verified সংশোধনী OVERRIDES-তে রাখা হয়। */
  var OVERRIDES = {
    '2026-10-25': 'assayuja'  /* প্রবারণা পূর্ণিমা ২০২৬ = ২৫ অক্টোবর (বাংলাদেশে সরকারি ছুটি/সংঘ ঘোষণা অনুযায়ী) */
  };
  function dateKey(d){
    return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
  }
  function overrideFor(date){ return OVERRIDES[dateKey(date)] || null; }
  function phaseObservedDay(phaseMoment){
    if (!phaseMoment) return null;
    var p = localDateParts(phaseMoment);
    var hour = phaseMoment.getHours() + phaseMoment.getMinutes()/60;
    /* সংক্রান্তি স্থানীয় দুপুর ১২টার আগে হলে পূর্বের দিন গ্রহণ */
    var candidate;
    if (hour < 12) {
      var d = new Date(phaseMoment.getTime() - 12*3600*1000);
      var prev = localDateParts(d);
      candidate = localDateOf(prev.y, prev.m, prev.d);
    } else {
      candidate = localDateOf(p.y, p.m, p.d);
    }
    /* সংশোধনী override থাকলে সেটাই ফিরিয়ে দেব; আর সংলগ্ন দিনগুলোও বিবেচনায় */
    if (overrideFor(candidate)) return candidate;
    var prev = new Date(candidate.getTime() - 86400000);
    if (overrideFor(prev)) return prev;
    return candidate;
  }
  /* একই মাস key ওভাররাইডে থাকলে lunarCalendar-এও প্রতিফলিত হবে */
  function nextFullMoon(date){ return phaseObservedDay(nextFullMoment(date)); }
  function nextNewMoon(date){ return phaseObservedDay(nextNewMoment(date)); }

  function fullMoonsInRange(start, end){
    var out = [], cur = new Date(start.getTime() - 86400000), f, guard = 0;
    while ((f = nextFullMoon(cur)) && f <= end) {
      var last = out[out.length-1];
      if (!last || f.getTime() !== last.getTime()) out.push(f);
      /* advance 2 days past f to prevent re-detecting same full moon */
      cur = new Date(f.getTime() + 2*86400000);
      if (++guard > 80) break;
    }
    return out;
  }

  /* ---- চান্দ্রমাস গণনা (LUNAR_KEYS order + অধিক-আষাঢ়) ---- */
  function lunarCalendar(untilDate){
    /* Anchor: 2025-01-13 UTC full moon = Phussa (পৌষ) */
    var anchorStart = new Date(2024, 11, 13);
    var fms = fullMoonsInRange(anchorStart, untilDate);
    var anchorIdx = -1;
    for (var i = 0; i < fms.length; i++) {
      /* January 2025 = Maghasira... actually Phussa anchor is Jan 13 2025 per lunation count;
         we will search for first Jan 2025 full moon and set idx to phussa */
      if (fms[i].getFullYear()===2025 && fms[i].getMonth()===0) { anchorIdx = i; break; }
    }
    if (anchorIdx < 0) anchorIdx = 0;
    /* Determine adhika (extra month) per Gregorian year if ≥13 full moons */
    var perYear = {};
    fms.forEach(function (f){ perYear[f.getFullYear()] = (perYear[f.getFullYear()]||0) + 1; });
    var out = [], monthIdx = 9/* Phussa=index 9 in LUNAR_KEYS */, adhikDoneYear = -1;
    for (var j = anchorIdx; j < fms.length; j++) {
      var f = fms[j];
      var isAdhik = false;
      if (j > anchorIdx) {
        var nextIdx = (monthIdx + 1) % 12;
        if (LUNAR_KEYS[nextIdx]==='asalha' && perYear[f.getFullYear()]>=13 && adhikDoneYear!==f.getFullYear()) {
          isAdhik = true; adhikDoneYear = f.getFullYear();
          out.push({ date: f, key: 'asalha', month: LUNAR_MONTHS[nextIdx], adhik: true });
          monthIdx = nextIdx;
          continue;
        }
        monthIdx = nextIdx;
      }
      out.push({ date: f, key: LUNAR_KEYS[monthIdx], month: LUNAR_MONTHS[monthIdx], adhik: isAdhik });
    }
    /* ---- Verified সংশোধনী প্রয়োগ (যে দিনে override key আছে সেই entry-র key বদলে দিই) ---- */
    out.forEach(function (c){
      var ov = overrideFor(c.date);
      if (ov) { c.key = ov; c.month = LUNAR_MONTHS[LUNAR_KEYS.indexOf(ov)]; c.adhik = false; c.overridden = true; }
    });
    return out;
  }

  function nextLunarFestivals(festivalDefs, fromDate){
    var until = new Date(fromDate.getTime() + 430*86400000);
    var cal = lunarCalendar(until);
    var today = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
    var byKey = {};
    cal.forEach(function (c){ if (c.date >= today && !c.adhik && !byKey[c.key]) byKey[c.key] = c; });
    var results = [];
    (festivalDefs||[]).forEach(function (def){
      var r = def.rule||{}, date=null, lunarName='';
      if (r.type==='lunar-month'){
        for (var i=0;i<cal.length;i++){
          if (cal[i].date>=today && cal[i].key===r.month && !cal[i].adhik){ date=cal[i].date; lunarName=cal[i].month; break; }
        }
      } else if (r.type==='next-full-moon'){
        var nf = nextFullMoon(today);
        if (nf) date = nf;
      } else if (r.type==='next-new-moon'){
        var nm = nextNewMoon(today);
        if (nm) date = nm;
      }
      results.push({ def: def, date: date, lunarName: lunarName });
    });
    results.forEach(function (x){
      var r = x.def.rule||{};
      if (r.type==='day-after' && r.of){
        var base = results.filter(function (y){ return y.def.id===r.of; })[0];
        if (base && base.date) x.date = new Date(base.date.getTime()+86400000);
      }
    });
    return results.filter(function(x){return x.date;}).sort(function(a,b){return a.date-b.date;});
  }

  function fmtBnDate(date){
    return bn(date.getDate()) + ' ' + ENM[date.getMonth()] + ' ' + bn(date.getFullYear());
  }
  function fmtBnDateTime(date){
    var h = date.getHours(), m = date.getMinutes();
    var ap = h >= 12 ? 'PM' : 'AM';
    var h12 = h%12 || 12;
    return bn(date.getDate()) + ' ' + ENM[date.getMonth()] + ' ' + bn(date.getFullYear()) + ' ' + bn(h12) + ':' + (m<10?'০':'')+bn(m) + ' ' + ap;
  }

  /* সহজ বাংলা দিনের নাম (weekday) */
  function weekdayName(date){ return WEEK[date.getDay()]; }

  /* TZ info string */
  function tzLabel(){
    var off = getUserTzOffsetMin();
    var sign = off >= 0 ? '+' : '-';
    var h = Math.floor(Math.abs(off)/60), m = Math.abs(off)%60;
    return getUserTzName() + ' (UTC' + sign + bn(h) + (m ? ':'+bn(m) : '') + ')';
  }

  window.MX = Object.assign(window.MX || {}, {
    bn: bn, BN: BN, BN_MONTHS: BN_MONTHS, ENM: ENM, WEEK: WEEK, WEEK_S: WEEK_S,
    LUNAR_MONTHS: LUNAR_MONTHS, LUNAR_KEYS: LUNAR_KEYS,
    sunLong: sunLong, moonLong: moonLong, moonPhaseAngle: moonPhaseAngle,
    jdFromDate: jdFromDate,
    nextFullMoment: nextFullMoment, nextNewMoment: nextNewMoment, nextPhaseAfter: nextPhaseAfter,
    phaseObservedDay: phaseObservedDay,
    nextFullMoon: nextFullMoon, nextNewMoon: nextNewMoon,
    fullMoonsInRange: fullMoonsInRange, lunarCalendar: lunarCalendar,
    nextLunarFestivals: nextLunarFestivals,
    localDateOf: localDateOf, localDateParts: localDateParts,
    fmtBnDate: fmtBnDate, fmtBnDateTime: fmtBnDateTime, weekdayName: weekdayName,
    getUserTzOffsetMin: getUserTzOffsetMin, getUserTzName: getUserTzName, tzLabel: tzLabel
  });
})();
