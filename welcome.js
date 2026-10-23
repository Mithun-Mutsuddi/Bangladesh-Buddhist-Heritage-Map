/* চর্যাভূমি — ব্যক্তিগত, স্থানীয়-শুভেচ্ছা; প্রোফাইল কোনো সার্ভারে যায় না। */
(function () {
  'use strict';
  var dialog = document.getElementById('welcomeDialog');
  if (!dialog) return;

  var PROFILE_KEY = 'charyabhumiWelcomeProfileV1';
  var SESSION_KEY = 'charyabhumiWelcomeSeenV1';
  var $ = function (id) { return document.getElementById(id); };
  var query = new URLSearchParams(location.search);
  if (query.get('welcome') === '0') return;
  var forced = query.get('welcome') === '1';
  var profile = readProfile();

  var FESTIVALS = {
    'বৈশাখ': { name: 'বুদ্ধ পূর্ণিমা', detail: 'বুদ্ধের জন্ম, বোধিলাভ ও মহাপরিনির্বাণের স্মৃতি' },
    'আষাঢ়': { name: 'আষাঢ়ী পূর্ণিমা', detail: 'প্রথম ধর্মদেশনা ও বর্ষাবাসের সূচনা-প্রসঙ্গ' },
    'আশ্বিন': { name: 'প্রবারণা পূর্ণিমা', detail: 'বর্ষাবাস-সমাপ্তির পূর্ণিমা; স্থানীয় ঘোষণা যাচাই করুন' },
    'মাঘ': { name: 'মাঘী পূর্ণিমা', detail: 'সংঘ ও ধর্মানুশীলনের স্মৃতি' },
    'ফাল্গুন': { name: 'ফাল্গুনী পূর্ণিমা', detail: 'পূর্ণিমা ও উপোসথের শুভেচ্ছা' }
  };
  var SEASONS = {
    'বৈশাখ': 'বৈশাখের নতুন আলোয় মৈত্রী ও শান্তির শুভেচ্ছা',
    'জ্যৈষ্ঠ': 'জ্যৈষ্ঠের উষ্ণ দিনে সহনশীলতা ও শান্তির শুভেচ্ছা',
    'আষাঢ়': 'বর্ষার শান্ত স্রোতে মৈত্রী ও করুণার শুভেচ্ছা',
    'শ্রাবণ': 'শ্রাবণের শিশিরে সততা ও শান্তির শুভেচ্ছা',
    'ভাদ্র': 'ভাদ্রের আকাশে প্রসন্ন মনের শুভেচ্ছা',
    'আশ্বিন': 'শরতের নির্মল আকাশে মৈত্রী ও শান্তির শুভেচ্ছা',
    'কার্তিক': 'হেমন্তের নরম আলোয় করুণা ও শান্তির শুভেচ্ছা',
    'অগ্রহায়ণ': 'অগ্রহায়ণের প্রশান্ত দিনে মৈত্রীর শুভেচ্ছা',
    'পৌষ': 'পৌষের শীতল সকালে উষ্ণ মৈত্রীর শুভেচ্ছা',
    'মাঘ': 'মাঘের প্রশান্তিতে সত্য ও শান্তির শুভেচ্ছা',
    'ফাল্গুন': 'ফাল্গুনের বসন্ত-আভায় করুণার শুভেচ্ছা',
    'চৈত্র': 'চৈত্রের নতুন সূচনায় মৈত্রী ও সাহসের শুভেচ্ছা'
  };

  function clean(value) { return String(value == null ? '' : value).trim(); }
  function readProfile() {
    try {
      var parsed = JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}');
      return { name: clean(parsed.name).slice(0, 60), location: clean(parsed.location).slice(0, 80) };
    } catch (_) { return { name: '', location: '' }; }
  }
  function saveProfile() {
    try { localStorage.setItem(PROFILE_KEY, JSON.stringify(profile)); } catch (_) {}
  }
  function seen() {
    try { return sessionStorage.getItem(SESSION_KEY) === '1'; } catch (_) { return false; }
  }
  function markSeen() {
    try { sessionStorage.setItem(SESSION_KEY, '1'); } catch (_) {}
  }
  function periodFor(now) {
    var n = window.CharyabhumiPanjika ? window.CharyabhumiPanjika.dhakaNow(now.getTime()) : null;
    var h = n ? n.h : Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Dhaka', hour: '2-digit', hourCycle: 'h23' }).format(now));
    if (h >= 4 && h < 12) return { id: 'morning', label: 'শুভ সকাল' };
    if (h >= 12 && h < 16) return { id: 'day', label: 'শুভ দুপুর' };
    if (h >= 16 && h < 18) return { id: 'afternoon', label: 'শুভ বিকেল' };
    if (h >= 18 && h < 20) return { id: 'evening', label: 'শুভ সন্ধ্যা' };
    return { id: 'night', label: 'শুভ রাত্রি' };
  }
  function fixedFestival(now) {
    var n = window.CharyabhumiPanjika ? window.CharyabhumiPanjika.dhakaNow(now.getTime()) : null;
    var key = n ? n.m + '-' + n.d : (now.getMonth() + 1) + '-' + now.getDate();
    var fixed = {
      '2-21': ['আন্তর্জাতিক মাতৃভাষা দিবসের শ্রদ্ধাঞ্জলি', 'ভাষা ও ইতিহাসের স্মৃতিতে প্রশান্ত শুভেচ্ছা'],
      '3-26': ['স্বাধীনতা দিবসের শুভেচ্ছা', 'স্বাধীনতা, মানবিকতা ও শান্তির শুভেচ্ছা'],
      '4-14': ['শুভ নববর্ষ', 'বাংলা নববর্ষের নতুন আলোয় মৈত্রী ও করুণার শুভেচ্ছা'],
      '5-1': ['মে দিবসের শুভেচ্ছা', 'শ্রমের মর্যাদা ও মানবিকতার শুভেচ্ছা'],
      '12-16': ['বিজয় দিবসের শুভেচ্ছা', 'স্বাধীনতা ও শান্তির শুভেচ্ছা']
    };
    if (!fixed[key]) return null;
    return { title: fixed[key][0], detail: fixed[key][1], kind: 'festival' };
  }
  function festivalFor(now) {
    var fixed = fixedFestival(now);
    if (fixed) return fixed;
    var api = window.CharyabhumiPanjika;
    if (api) {
      try {
        var n = api.dhakaNow(now.getTime());
        var bd = api.banglaDate(n.y, n.m, n.d);
        var info = api.dayInfo(n.y, n.m, n.d);
        if (info.p.tithi === 15) {
          var current = FESTIVALS[bd.month] || { name: 'পূর্ণিমা ও উপোসথ', detail: 'শীল, ধ্যান ও আত্মপর্যালোচনার শুভেচ্ছা' };
          return {
            title: current.name + (/পূর্ণিমা$/.test(current.name) ? 'র' : '-এর') + ' শুভেচ্ছা',
            detail: current.detail + ' · তিথির হিসাব আনুমানিক; স্থানীয় পঞ্জিকা ও বিহারের ঘোষণা মিলিয়ে নিন',
            kind: 'purnima'
          };
        }
        var next = api.upcoming(46, now.getTime()).filter(function (x, i) {
          return i > 0 && x.t === 15 && FESTIVALS[x.bd.month];
        })[0];
        if (next) {
          var upcoming = FESTIVALS[next.bd.month];
          return {
            title: 'আসন্ন ' + upcoming.name,
            detail: api.fmtDate(next).split(' · ')[0] + ' · আনুমানিক পঞ্জিকা-হিসাব; স্থানীয় ঘোষণা যাচাই করুন',
            kind: 'purnima'
          };
        }
        return { title: SEASONS[bd.month] || 'মৈত্রী ও শান্তির শুভেচ্ছা', detail: 'আজকের পঞ্জিকা, তিথি ও আসন্ন পূর্ণিমা দেখতে ক্যালেন্ডার খুলুন', kind: 'season' };
      } catch (_) {}
    }
    return { title: 'মৈত্রী ও শান্তির শুভেচ্ছা', detail: 'উৎসব ও পূর্ণিমার হিসাব দেখতে চর্যাভূমির পঞ্জিকা খুলুন', kind: 'season' };
  }
  function dateLabel(now) {
    try {
      return new Intl.DateTimeFormat('bn-BD', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Dhaka'
      }).format(now);
    } catch (_) { return now.toLocaleString('bn-BD'); }
  }
  function render() {
    var now = new Date();
    var period = periodFor(now);
    var festival = festivalFor(now);
    var name = profile.name || 'প্রিয় অতিথি';
    dialog.setAttribute('data-period', period.id);
    dialog.setAttribute('data-festival', festival.kind);
    $('welcomeTime').textContent = period.label + ' · ' + (profile.location || 'চর্যাভূমি');
    $('welcomeTitle').textContent = name + ', চর্যাভূমিতে স্বাগতম';
    $('welcomeText').textContent = profile.location
      ? profile.location + ' থেকে আপনার যাত্রায় হাজার বছরের পথ ধরে—বাংলাদেশের বৌদ্ধ ঐতিহ্য, ইতিহাস, মানচিত্র ও ভ্রমণ-পরিকল্পনার বাংলা নির্দেশিকায় স্বাগতম।'
      : 'হাজার বছরের পথ ধরে—বাংলাদেশের বৌদ্ধ ঐতিহ্য, ইতিহাস, মানচিত্র ও ভ্রমণ-পরিকল্পনার বাংলা নির্দেশিকায় আপনাকে স্বাগতম।';
    $('welcomeFestivalTitle').textContent = festival.title;
    $('welcomeFestivalDetail').textContent = festival.detail;
    $('welcomeDate').textContent = 'ঢাকার সময়: ' + dateLabel(now) + ' · উৎসব-হিসাব ঢাকার পঞ্জিকা অনুসারে';
  }
  function closeWelcome() {
    markSeen();
    if (dialog.open && typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
    document.body.classList.remove('cb-welcome-open');
  }
  function openWelcome() {
    render();
    document.body.classList.add('cb-welcome-open');
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
  }

  $('welcomeName').value = profile.name;
  $('welcomeLocation').value = profile.location;
  $('welcomeForm').addEventListener('submit', function (event) {
    event.preventDefault();
    profile.name = clean($('welcomeName').value).slice(0, 60);
    profile.location = clean($('welcomeLocation').value).slice(0, 80);
    saveProfile(); render();
    $('welcomeLocateStatus').textContent = 'আপনার নাম ও এলাকাসহ শুভেচ্ছা তৈরি হয়েছে—শুধু এই ব্রাউজারে সংরক্ষিত।';
    $('welcomeExplore').focus();
  });
  ['welcomeClose', 'welcomeDismiss', 'welcomeExplore'].forEach(function (id) {
    $(id).addEventListener('click', closeWelcome);
  });
  dialog.addEventListener('cancel', function () { markSeen(); });
  dialog.addEventListener('close', function () { document.body.classList.remove('cb-welcome-open'); });

  var centers = [
    { name: 'ঢাকা', lat: 23.8103, lon: 90.4125 },
    { name: 'চট্টগ্রাম', lat: 22.3569, lon: 91.7832 },
    { name: 'খুলনা', lat: 22.8456, lon: 89.5403 },
    { name: 'রাজশাহী', lat: 24.3745, lon: 88.6042 },
    { name: 'বরিশাল', lat: 22.7010, lon: 90.3535 },
    { name: 'সিলেট', lat: 24.8949, lon: 91.8687 },
    { name: 'রংপুর', lat: 25.7439, lon: 89.2752 },
    { name: 'ময়মনসিংহ', lat: 24.7471, lon: 90.4203 }
  ];
  $('welcomeLocate').addEventListener('click', function () {
    var status = $('welcomeLocateStatus');
    if (!navigator.geolocation) { status.textContent = 'এই ব্রাউজারে অবস্থান-সেবা নেই; এলাকার নাম লিখতে পারেন।'; return; }
    var button = this;
    button.disabled = true;
    status.textContent = 'আপনার অনুমতি চাওয়া হচ্ছে…';
    navigator.geolocation.getCurrentPosition(function (position) {
      var lat = position.coords.latitude, lon = position.coords.longitude;
      var nearest = centers.map(function (c) {
        var x = (c.lon - lon) * Math.cos((c.lat + lat) * Math.PI / 360);
        var y = c.lat - lat;
        return { name: c.name, distance: x * x + y * y };
      }).sort(function (a, b) { return a.distance - b.distance; })[0];
      profile.location = nearest.name;
      $('welcomeLocation').value = nearest.name;
      saveProfile(); render();
      status.textContent = 'GPS থেকে নিকটতম বিভাগীয় অঞ্চল: ' + nearest.name + ' (আনুমানিক)। স্থানাঙ্ক সংরক্ষণ করা হয়নি—শুধু অঞ্চলের নাম রাখা হয়েছে।';
      button.disabled = false;
    }, function (error) {
      status.textContent = error.code === 1 ? 'অবস্থানের অনুমতি পাওয়া যায়নি। চাইলে এলাকার নাম নিজে লিখুন।' : 'অবস্থান নির্ণয় করা যায়নি। এলাকার নাম লিখে চেষ্টা করুন।';
      button.disabled = false;
    }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 });
  });

  // A direct map/directory link should reveal its destination, not cover it
  // with a full-screen first-visit dialog on a small screen. Explicit ?welcome=1
  // remains available for the welcome experience and its regression tests.
  var mapDeepLink = /^#(?:explore|map-section|map)$/.test(location.hash);
  if (forced || (!seen() && !mapDeepLink)) setTimeout(openWelcome, 450);
})();
