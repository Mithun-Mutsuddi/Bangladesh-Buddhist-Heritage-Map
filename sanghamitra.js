/* চর্যাভূমি — সাইটজুড়ে একটি shared সংঘমিত্র (SanghaMitra) panel
   ------------------------------------------------------------------
   Default হলো স্থানীয়, source-based নিয়মভিত্তিক guide। ব্যবহারকারী online AI
   চালু করলে window.SANGHAMITRA_API_URL / CHARJAVUMI_CHAT_ENDPOINT বা /api/chat
   ব্যবহৃত হয়; ব্যর্থতা স্পষ্টভাবে দেখানো হয়, generated উত্তর বানিয়ে দেওয়া হয় না।
   প্রকাশনার সাইটে localhost বসাবেন না। শিশুর নাম, প্রতিষ্ঠানের নাম, স্থান-সন্ধান,
   consent-gated visit statistics ও device voice controls একই implementation-এ। */
(function () {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function $(id) { return document.getElementById(id); }

  /* ---------- শিশুর ধর্মীয় নাম: অর্থসমেত কিউরেটেড ভান্ডার ----------
     অর্থগুলো পালি/সংস্কৃত মূলশব্দের সাধারণ অর্থ; কোনো নামই “ধর্মে বাধ্যতামূলক” নয়।
     f = নামটি শুরু হয় যে বাংলা বর্ণ দিয়ে (জন্মবার-রীতির মিলের জন্য)। */
  var BOY = [
    { n: 'আনন্দ', m: 'আনন্দ · বুদ্ধের প্রধান উপাসক শিষ্যের নাম', f: 'আ' },
    { n: 'অমিত', m: 'অমিত — অপরিমেয়', f: 'অ' },
    { n: 'অশোক', m: 'শোকহীন · সম্রাট অশোকের নামে স্মৃতি', f: 'অ' },
    { n: 'আর্য', m: 'আর্য — উন্নত, মহৎ', f: 'আ' },
    { n: 'করুণ', m: 'করুণা থেকে — অপরের দুঃখ দূর করার মন', f: 'ক' },
    { n: 'কুশল', m: 'কুসল — দক্ষ ও শুভকর্মে নিপুণ', f: 'ক' },
    { n: 'কল্যাণ', m: 'কল্যাণ — মঙ্গল, শুভ', f: 'ক' },
    { n: 'গৌরব', m: 'মর্যাদা ও গৌরব', f: 'গ' },
    { n: 'জয়ন্ত', m: 'জয়ী', f: 'জ' },
    { n: 'জ্ঞান', m: 'ঞাণ — প্রজ্ঞা-জ্ঞান', f: 'জ' },
    { n: 'সুমন', m: 'সুমনা — সুন্দর মন', f: 'স' },
    { n: 'সৌম্য', m: 'সৌম্য — কোমল ও প্রিয়দর্শন', f: 'স' },
    { n: 'সুগত', m: 'সুগত — সুগতিপ্রাপ্ত (বুদ্ধের একটি গুণনাম)', f: 'স' },
    { n: 'ললিত', m: 'ললিত — সুন্দর, কোমল', f: 'ল' },
    { n: 'রত্ন', m: 'রতন — রত্ন, মূল্যবান', f: 'র' },
    { n: 'প্রজ্ঞান', m: 'পঞ্ঞা থেকে — প্রজ্ঞাবান', f: 'প' },
    { n: 'বোধি', m: 'বোধি — জাগরণ, সম্বোধি', f: 'ব' },
    { n: 'বিজয়', m: 'বিজয় — ক্লেশের ওপর জয়', f: 'ব' },
    { n: 'মিত', m: 'মিত্ত — সত্যিকারের বন্ধু', f: 'ম' },
    { n: 'মঙ্গল', m: 'মঙ্গল — শুভ ও কল্যাণ', f: 'ম' },
    { n: 'থির', m: 'থির (পালি) — স্থির, দৃঢ়', f: 'থ' },
    { n: 'হর্ষ', m: 'আনন্দ ও উৎফুল্লতা', f: 'হ' },
    { n: 'তীর্থ', m: 'তিত্থ — পবিত্র ঘাট/স্থান, পারাপারের পথ', f: 'ত' },
    { n: 'ত্রিদীপ', m: 'তিনটি আলো — ত্রিরত্নের ভাবে', f: 'ত' },
    { n: 'দীপঙ্কর', m: 'আলোকদাতা · অতীত বুদ্ধের নাম, অতীশ দীপঙ্করেও ব্যবহৃত', f: 'দ' },
    { n: 'ধীমান', m: 'ধীসম্পন্ন, বুদ্ধিমান', f: 'ধ' },
    { n: 'ধর্ম', m: 'ধম্ম — সত্য, ন্যায় ও কর্তব্য', f: 'ধ' },
    { n: 'নন্দন', m: 'আনন্দদায়ী', f: 'ন' }
  ];
  var GIRL = [
    { n: 'অমিতা', m: 'অমিতা — অপরিমেয় (গুণ)', f: 'অ' },
    { n: 'অনন্যা', m: 'অতুলনীয়া', f: 'অ' },
    { n: 'আর্যা', m: 'আর্যা — উন্নতচিত্তা', f: 'আ' },
    { n: 'করুণা', m: 'করুণা — অপরের দুঃখে কেঁপে ওঠা মন', f: 'ক' },
    { n: 'কল্যাণী', m: 'কল্যাণী — মঙ্গলময়ী', f: 'ক' },
    { n: 'জয়া', m: 'জয় — বিজয়িনী', f: 'জ' },
    { n: 'সুজাতা', m: 'বুদ্ধকে পায়েস দানকারিণী সুজাতার নামে', f: 'স' },
    { n: 'সুমনা', m: 'সুমনা — সুন্দর মনের', f: 'স' },
    { n: 'শান্তি', m: 'শান্তি — প্রশান্তি', f: 'শ' },
    { n: 'লাবণী', m: 'লাবণ্য — কমনীয়তা', f: 'ল' },
    { n: 'রত্না', m: 'রত্না — রত্নতুল্যা', f: 'র' },
    { n: 'যশোধরা', m: 'সিদ্ধার্থের স্ত্রীর নামে (বিম্বা)', f: 'য' },
    { n: 'প্রজ্ঞা', m: 'পঞ্ঞা — গভীর জ্ঞান', f: 'প' },
    { n: 'বিশাখা', m: 'বুদ্ধের প্রধান উপাসিকা বিশাখার নামে', f: 'ব' },
    { n: 'মৈত্রী', m: 'মেত্তা — সকলের কল্যাণকামনা', f: 'ম' },
    { n: 'মুদিতা', m: 'মুদিতা — অপরের সাফল্যে আনন্দ', f: 'ম' },
    { n: 'হর্ষিতা', m: 'প্রফুল্লিতা', f: 'হ' },
    { n: 'দীপা', m: 'দীপ — আলো', f: 'দ' },
    { n: 'দীপশিখা', m: 'প্রদীপের শিখা', f: 'দ' },
    { n: 'ধারা', m: 'প্রবাহ · ধারণকারিণী', f: 'ধ' },
    { n: 'নন্দিনী', m: 'আনন্দদায়িনী', f: 'ন' },
    { n: 'ত্রিরত্না', m: 'ত্রিরত্ন (বুদ্ধ-ধর্ম-সংঘ) থেকে', f: 'ত' }
  ];

  /* জন্মবার অনুযায়ী প্রথম বর্ণ — মিয়ানমার-মূল রীতির (বার্মিজ নামকরণ) বাংলা ধ্বনি-রূপান্তর।
     এটি ক্যানোনিক্যাল বিধি নয়, আঞ্চলিক পরম্পরা; পরিবার ও গোষ্ঠী ভেদে বদলায়। */
  var WEEKDAY = [
    { day: 'রবিবার', keys: ['রবিবার', 'রোববার', 'রবি', 'sunday'], letters: ['অ', 'আ', 'এ', 'ও'] },
    { day: 'সোমবার', keys: ['সোমবার', 'সোম', 'monday'], letters: ['ক', 'খ', 'গ', 'ঘ', 'ঙ'] },
    { day: 'মঙ্গলবার', keys: ['মঙ্গলবার', 'মঙ্গল', 'tuesday'], letters: ['স', 'শ', 'জ', 'ঝ', 'ঞ'] },
    { day: 'বুধবার (সকাল)', keys: ['বুধবার সকাল', 'বুধের সকাল'], letters: ['ল', 'ও'] },
    { day: 'বুধবার (বিকেল)', keys: ['বুধবার বিকেল', 'বুধের বিকেল', 'রাহু'], letters: ['য', 'র'] },
    { day: 'বুধবার', keys: ['বুধবার', 'wednesday'], letters: ['ল', 'য', 'র'] },
    { day: 'বৃহস্পতিবার', keys: ['বৃহস্পতিবার', 'বৃহস্পতি', 'thursday'], letters: ['প', 'ফ', 'ব', 'ভ', 'ম'] },
    { day: 'শুক্রবার', keys: ['শুক্রবার', 'শুক্র', 'friday'], letters: ['থ', 'হ'] },
    { day: 'শনিবার', keys: ['শনিবার', 'শনির', 'শনি', 'saturday'], letters: ['ত', 'থ', 'দ', 'ধ', 'ন'] }
  ];

  /* প্রতিষ্ঠান/স্থানের নামকরণের মূলশব্দ ও ধরন */
  var ROOTS = ['বোধি', 'ধর্ম', 'সদ্ধর্ম', 'সংঘ', 'মৈত্রী', 'করুণা', 'প্রজ্ঞা', 'শান্তি', 'মহামঙ্গল', 'জ্ঞান', 'বিদর্শন', 'দীপঙ্কর', 'অশোক', 'ত্রিরত্ন', 'পাবন', 'চর্যা'];
  var PLACE_HINTS = 'জায়গার নিজের নাম (গ্রাম/পাহাড়/নদী) সঙ্গে রাখলে নামটি সহজে চেনা যায় ও অন্য প্রতিষ্ঠানের সঙ্গে গুলিয়ে যায় না।';

  function pick(list, n) {
    // তালিকার ক্রম থেকে সামান্য বদল আনার জন্য দিনে-ভিত্তিক সরল ঘূর্ণন
    var out = [], start = (new Date().getDate()) % (list.length || 1);
    for (var i = 0; i < list.length && out.length < n; i++) out.push(list[(start + i) % list.length]);
    return out;
  }

  function nameListHtml(items) {
    return '<ul class="cb-sangha-names">' + items.map(function (x) {
      return '<li><b>' + esc(x.n) + '</b> — ' + esc(x.m) + '</li>';
    }).join('') + '</ul>';
  }

  function childNameAnswer(q) {
    var isBoy = /ছেলে(?!মেয়ে)|পুত্র|ছেলেশিশু|\bboy\b/i.test(q);
    var isGirl = /মেয়ে|কন্যা|মেয়েশিশু|\bgirl\b/i.test(q);
    var wd = null, i, k;
    for (i = 0; i < WEEKDAY.length && !wd; i++) {
      for (k = 0; k < WEEKDAY[i].keys.length; k++) {
        if (q.indexOf(WEEKDAY[i].keys[k]) !== -1) { wd = WEEKDAY[i]; break; }
      }
    }
    function byDay(list) {
      if (!wd) return list;
      var hit = list.filter(function (x) { return wd.letters.indexOf(x.f) !== -1; });
      return hit;
    }
    var parts = [];
    parts.push('<p>শিশুর ধর্মীয় নামে পালি/সংস্কৃত-মূলের গুণবাচক শব্দ (মৈত্রী, করুণা, প্রজ্ঞা, শান্তি, বোধি…) রাখা বাংলাদেশের বৌদ্ধ পরিবারে বহুল প্রচলিত। কোনো নামই ত্রিপিটকে নির্ধারিত নয় — অর্থ ও উচ্চারণ দেখে পরিবারের পছন্দই শেষ কথা।</p>');
    if (wd) {
      parts.push('<p><b>' + esc(wd.day) + '</b> — মিয়ানমার-মূল জন্মবার-রীতিতে এই বারের প্রথম বর্ণ: <b>' +
        esc(wd.letters.join(' · ')) + '</b>। এটি আঞ্চলিক পরম্পরা (বার্মিজ/মারমা নামকরণে প্রচলিত); পরিবারভেদে বদলায়, ধর্মীয় বিধি নয়।</p>');
    }
    if (isBoy && !isGirl) {
      var b = byDay(BOY);
      parts.push('<p><b>ছেলের নাম' + (wd ? ' (ওই বর্ণে)' : '') + ':</b></p>' +
        (b.length ? nameListHtml(pick(b, 6)) : '<p>ওই বর্ণে ভান্ডারে নাম কম — নিচে অর্থভিত্তিক তালিকা থেকে বাছুন।</p>' + nameListHtml(pick(BOY, 6))));
    } else if (isGirl && !isBoy) {
      var g = byDay(GIRL);
      parts.push('<p><b>মেয়ের নাম' + (wd ? ' (ওই বর্ণে)' : '') + ':</b></p>' +
        (g.length ? nameListHtml(pick(g, 6)) : '<p>ওই বর্ণে ভান্ডারে নাম কম — নিচে অর্থভিত্তিক তালিকা থেকে বাছুন।</p>' + nameListHtml(pick(GIRL, 6))));
    } else {
      parts.push('<p><b>ছেলের নাম:</b></p>' + nameListHtml(pick(byDay(BOY).length ? byDay(BOY) : BOY, 5)) +
                 '<p><b>মেয়ের নাম:</b></p>' + nameListHtml(pick(byDay(GIRL).length ? byDay(GIRL) : GIRL, 5)) +
                 '<p>আরও নির্দিষ্ট করতে এভাবে লিখুন: “শুক্রবারে জন্ম নেওয়া মেয়ের নাম” বা “ছেলের জন্য প্রজ্ঞা-অর্থের নাম”।</p>');
    }
    parts.push('<p>নামকরণে বিহারে গিয়ে ত্রিশরণ-পঞ্চশীল ও ভিক্ষুসংঘের আশীর্বাদ নেওয়ার রীতি অনেক পরিবারে আছে; চূড়ান্ত বাছাইয়ে পরিবারের ভান্তের পরামর্শ নেওয়াই ভালো।</p>');
    parts.push('<div class="cb-sangha-links"><a href="philosophy.html#grihi">গৃহী নীতি পড়ুন →</a><a href="culture.html">জন্ম ও নামকরণের রীতি (সংস্কৃতি পাতা) →</a></div>');
    return parts.join('');
  }

  function institutionNameAnswer(q) {
    var type = null, forms = [];
    if (/বিহার|মন্দির|প্যাগোডা|ক্যাং/.test(q)) { type = 'বিহার'; forms = ['{r} বন বিহার', '{r} মহাবিহার', '{r} আরাম বিহার', '{r} কেন্দ্রীয় বিহার', '{r} শান্তি বিহার']; }
    else if (/ভাবনা|ধ্যান|meditation/i.test(q)) { type = 'ভাবনাকেন্দ্র'; forms = ['{r} আন্তর্জাতিক ভাবনাকেন্দ্র', '{r} বিদর্শন কেন্দ্র', '{r} অরণ্য ভাবনাকুটির']; }
    else if (/স্কুল|বিদ্যালয়|শিক্ষা|পালি|কলেজ/.test(q)) { type = 'শিক্ষা প্রতিষ্ঠান'; forms = ['{r} পালি শিক্ষাকেন্দ্র', '{r} বিদ্যানিকেতন', '{r} নালন্দা শিক্ষা কেন্দ্র', '{r} ধর্মশিক্ষা সদন']; }
    else if (/লাইব্রেরি|গ্রন্থাগার|পাঠাগার/.test(q)) { type = 'গ্রন্থাগার'; forms = ['{r} ধর্মগ্রন্থাগার', '{r} ত্রিপিটক পাঠাগার', '{r} জ্ঞানধারা পাঠকক্ষ']; }
    else if (/সেবা|অনাথ|বৃদ্ধ|কল্যাণ|সমিতি|সংগঠন|ফাউন্ডেশন/.test(q)) { type = 'সেবামূলক প্রতিষ্ঠান'; forms = ['{r} জনকল্যাণ সমিতি', '{r} সেবা সংঘ', '{r} করুণা ফাউন্ডেশন', '{r} অনাথ সেবাশ্রম']; }
    else if (/স্তূপ|চৈত্য|জাদী|স্থান|জায়গা|প্যাগোডা/.test(q)) { type = 'স্থান/স্তূপ'; forms = ['{r} স্বর্ণজাদী', '{r} মহাচৈত্য', '{r} শান্তি স্তূপ']; }
    if (!type) {
      type = 'প্রতিষ্ঠান/স্থান';
      forms = ['{r} বিবিধ — “{r} বন বিহার”', '{r} কেন্দ্রীয় বিহার', '{r} ভাবনাকেন্দ্র', '{r} ধর্মগ্রন্থাগার', '{r} সেবা সংঘ'];
    }
    var seeds = pick(ROOTS, 5), lines = [];
    forms.forEach(function (f, i) {
      lines.push('<li><b>' + esc(f.replace('{r}', seeds[i % seeds.length])) + '</b></li>');
    });
    return '<p><b>' + esc(type) + '</b>-এর জন্য নামের খসড়া ধরন (“মূলশব্দ” পছন্দমতো বদলানো যাবে):</p>' +
      '<ul class="cb-sangha-names">' + lines.join('') + '</ul>' +
      '<p>মূলশব্দের ভাণ্ডার: ' + esc(ROOTS.join(' · ')) + '।</p>' +
      '<p>নামকরণের পরামর্শ: (১) ' + PLACE_HINTS + ' (২) প্রাচীন নামের দাবি (যেমন “পাল যুগের”) প্রমাণ ছাড়া ব্যবহার করবেন না। (৩) একই নামে আগে কোনো প্রতিষ্ঠান আছে কি না খোঁজ নিন। (৪) ভিক্ষুসংঘ ও প্রতিষ্ঠান-কমিটির আলোচনায় নাম চূড়ান্ত করুন; সাইনবোর্ডে বাংলা ও ইংরেজি বানান এক রাখুন।</p>' +
      '<p>কোন ধরনের প্রতিষ্ঠান তা লিখলে (বিহার/ভাবনাকেন্দ্র/স্কুল/লাইব্রেরি/সেবা) আরও মানানসই সাজেশন দেব।</p>' +
      '<div class="cb-sangha-links"><a href="institutions.html">বিদ্যমান প্রতিষ্ঠানের তালিকা →</a><a href="index.html#explore">স্থান খুঁজুন →</a></div>';
  }

  var TOPIC_LINKS = [
    { re: /ভবচক্র|১২ নিদান|দ্বাদশ নিদান|পটিচ্চসমুপ্পাদ|প্রতীত্যসমুৎপাদ/, a: 'philosophy.html#darshan-bhavacakra', t: 'ভবচক্রের ইন্টার‌্যাক্টিভ চাকা' },
    { re: /চার আর্যসত্য|চতুরার্য সত্য|আর্যসত্য/, a: 'philosophy.html#darshan-four-truths', t: 'চার আর্যসত্যের চার্ট' },
    { re: /অষ্টাঙ্গিক মার্গ|আর্য অষ্টাঙ্গিক/, a: 'philosophy.html#darshan-eightfold-path', t: 'অষ্টাঙ্গিক মার্গের মানচিত্র' },
    { re: /ত্রিলক্ষণ|অনাত্মা|অনাত্তা|অনিত্য/, a: 'philosophy.html#darshan-tilakkhana', t: 'ত্রিলক্ষণের সহজ ব্যাখ্যা' },
    { re: /পঞ্চস্কন্ধ|পাঁচ স্কন্ধ|অহংবোধ/, a: 'philosophy.html#darshan-pancakkhandha', t: 'পঞ্চস্কন্ধ ও “আমি”' },
    { re: /নির্বাণ|নিব্বান/, a: 'philosophy.html#darshan-nibbana', t: 'নির্বাণ ও তার প্রকার' },
    { re: /২৮ বুদ্ধ|আঠাশ বুদ্ধ|বুদ্ধের প্রকার|পচ্চেকবুদ্ধ|সম্মাসম্বুদ্ধ/, a: 'philosophy.html#darshan-buddhas', t: 'বুদ্ধের প্রকার ও ২৮ বুদ্ধ' },
    { re: /৩১ লোকভূমি|একত্রিশ লোকভূমি|লোকভূমি/, a: 'philosophy.html#darshan-planes31', t: '৩১ লোকভূমির মানচিত্র' },
    { re: /কর্মের প্রকার|জনক কর্ম|উপস্তম্ভক|উপপীড়ক|উপঘাতক|গরুক কর্ম/, a: 'philosophy.html#darshan-kamma', t: 'কর্মের শ্রেণিবিন্যাস' },
    { re: /প্রতিসন্ধি|পুনর্জন্ম কীভাবে|মৃত্যুর পর/, a: 'philosophy.html#darshan-patisandhi', t: 'প্রতিসন্ধি বিজ্ঞানের ধাপ' },
    { re: /সংযোজন|স্রোতাপন্ন|সকদাগামী|অনাগামী|আর্যপুদ্গল|আর্যপুদগল/, a: 'philosophy.html#darshan-stages-fetters', t: 'দশ সংযোজন ও চার আর্যপুদ্গল' },
    { re: /দশ পারমী|পারমী/, a: 'philosophy.html#darshan-parami', t: 'দশ পারমীর চার্ট' },
    { re: /ব্রহ্মবিহার|মুদিতা/, a: 'philosophy.html#darshan-brahmavihara', t: 'চার ব্রহ্মবিহার' },
    { re: /বোধ্যঙ্গ|বোধ্যাঙ্গ|বোজ্ঝঙ্গ/, a: 'philosophy.html#darshan-bojjhanga', t: 'সপ্ত বোধ্যঙ্গ' },
    { re: /শরীরচক্র|৩২ অংশ|কায়ানুপস্সনা|কায়গতাসতি/, a: 'philosophy.html#darshan-body-cycle', t: 'শরীরচক্র ও ৩২ অংশ' },
    { re: /শ্বাসচক্র|সবাসচক্র|আনাপান|শ্বাসের ধ্যান/, a: 'philosophy.html#darshan-breath-cycle', t: 'শ্বাসচক্রের ১৬ ধাপ' },
    { re: /ধ্যানচক্র|নিমিত্ত|উপচার সমাধি|অপ্পনা/, a: 'philosophy.html#darshan-meditation-cycle', t: 'ধ্যানচক্রের ধাপ' },
    { re: /ঝান|ধ্যানের স্তর|ধ্যানের নিয়ম/, a: 'philosophy.html#darshan-jhana-levels', t: 'ধ্যানের স্তর ও নিয়ম' },
    { re: /ধ্যানের প্রকার|সমথ|বিপস্সনা|বিপাসনা|৪০.*কর্মস্থান/, a: 'philosophy.html#darshan-meditation-types', t: 'ধ্যানের প্রকারভেদ' },
    { re: /চৈতসিক|চৈতসিক|৫২.*মানসিক|৮৯.*চিত্ত|১২১.*চিত্ত|চিত্ত কত প্রকার/, a: 'philosophy.html#darshan-citta-cetasika', t: 'চিত্ত ও ৫২ চৈতসিকের চার্ট' },
    { re: /২২৭|পাতিমোক্খ|সেখিয়া/, a: 'philosophy.html#darshan-patimokkha227', t: '২২৭ পাতিমোক্খের বার-চার্ট' },
    { re: /আপত্তি দেশনা|আপত্তি/, a: 'philosophy.html#darshan-apatti-desana', t: 'আপত্তি ও দেশনা' },
    { re: /ধুতঙ্গ|ধুতাংগ/, a: 'philosophy.html#darshan-dhutanga', t: '১৩ ধুতঙ্গ' },
    { re: /উপোসথের প্রকার|উপোসথ.*নিয়ম/, a: 'philosophy.html#darshan-uposatha', t: 'উপোসথের প্রকার ও নিয়ম' },
    { re: /বিনয় পিটক/, a: 'philosophy.html#darshan-vinaya-pitaka', t: 'বিনয় পিটকের মানচিত্র' },
    { re: /সুত্ত পিটক|সূত্র পিটক/, a: 'philosophy.html#darshan-sutta-pitaka', t: 'সুত্ত পিটকের মানচিত্র' },
    { re: /অভিধম্ম পিটক|অভিধর্ম পিটক|ত্রিপিটক/, a: 'philosophy.html#darshan-abhidhamma-pitaka', t: 'অভিধম্ম পিটকের সাত গ্রন্থ' },
    { re: /পঞ্চশীল|অষ্টশীল|সিগালোবাদ|ব্যাঘপজ্জ|দীঘজানু|অনণ|বিশাখা|বজ্জী|অপরিহানীয়|গৃহী নীতি|উপোসথ/, a: 'philosophy.html#grihi', t: 'গৃহী নীতি অধ্যায়' },
    { re: /মহামঙ্গল|মৈত্রী|মেত্ত|রতন সুত্ত|রতন সূত্র|জয়মঙ্গল|জিনপাঞ্জর|সতিপট্ঠান|পরিত্রাণ/, a: 'philosophy.html#sutta', t: 'সূত্র ও গাথা অধ্যায়' },
    { re: /বন্দনা|উৎসর্গ|চীবর|অষ্টপরিষ্কার|পতাকা|প্রতীক|ফানুস|জল ঢালা/, a: 'philosophy.html#bandana', t: 'বন্দনা ও উৎসর্গ অধ্যায়' },
    { re: /বিয়ে|বিবাহ|দাম্পত্য/, a: 'philosophy.html#bandana', t: 'বিবাহ — নিয়ম ও পাঠ (বন্দনা অধ্যায়ে)' },
    { re: /শ্মশান|সৎকার|মৃত|অন্ত্যেষ্টি/, a: 'philosophy.html#bandana', t: 'শ্মশানযাত্রা ও সৎকার (বন্দনা অধ্যায়ে)' }
  ];

  function linksHtml(pairs) {
    return '<div class="cb-sangha-links">' + pairs.map(function (p) {
      return '<a href="' + esc(p[0]) + '">' + esc(p[1]) + ' →</a>';
    }).join('') + '</div>';
  }

  function answerBot(query) {
    var q = String(query || ''), low = q.toLocaleLowerCase('bn');

    if (/জরুরি|দুর্ঘটনা|বিপদে|ambulance|emergency|পুলিশ ডাক/i.test(q)) {
      return '<p>জরুরি প্রয়োজনে আগে জাতীয় জরুরি সেবা <b>৯৯৯</b>-এ ফোন করুন। আমি জরুরি সেবা ডেকে দিতে পারি না।</p>' +
        linksHtml([['about.html#emergency', 'জরুরি নম্বরের তালিকা']]);
    }
    if (/নাম/.test(q) && /প্রতিষ্ঠান|বিহার|কেন্দ্র|স্কুল|লাইব্রেরি|সংগঠন|সমিতি|স্থান|স্তূপ|জায়গা/.test(q)) {
      return institutionNameAnswer(q);
    }
    if (/নাম/.test(q) && /শিশু|ছেলে|মেয়ে|কন্যা|পুত্র|বাচ্চা|সন্তান|জন্ম|নবজাতক|baby|child/i.test(q)) {
      return childNameAnswer(q);
    }
    for (var i = 0; i < TOPIC_LINKS.length; i++) {
      if (TOPIC_LINKS[i].re.test(q)) {
        return '<p>এই বিষয়টি দর্শন পাতার নতুন অধ্যায়ে সূত্র-রেফারেন্স, পালি মূল পদ ও বাংলা সারসহ সাজানো হয়েছে:</p>' +
          linksHtml([[TOPIC_LINKS[i].a, TOPIC_LINKS[i].t], ['philosophy.html', 'বৌদ্ধধর্ম ও দর্শন (পুরো পাতা)']]);
      }
    }
    if (/নাম (চাই|দাও|লাগবে|সাজেশন|সাজেস্ট)|নামকরণ/.test(q)) {
      return '<p>কার জন্য নাম — <b>শিশুর</b> নাকি <b>প্রতিষ্ঠান/স্থানের</b>? এভাবে লিখলেই সাজেশন দিচ্ছি: “মেয়ের ধর্মীয় নাম”, “শনিবারে জন্ম নেওয়া ছেলের নাম”, “নতুন বিহারের নাম”।</p>';
    }
    if (/উৎসব|পূর্ণিমা|কঠিন|প্রবারণা|মাঘী/.test(q)) {
      return '<p>উৎসবের দিন চন্দ্রপঞ্জিকা ও স্থানীয় সংঘের ঘোষণায় ঠিক হয়; কোনো তারিখ অনুমান করে বলা ঠিক নয় — সংশ্লিষ্ট বিহারের ঘোষণা মিলিয়ে নিন।</p>' +
        linksHtml([['calendar.html', 'উৎসব ও পূর্ণিমা — পঞ্জিকা']]);
    }
    if (/রুট|যাব|যেতে|কীভাবে যাব|দিকনির্দেশ|route|how to go/i.test(low)) {
      return '<p>নতুন একীভূত ড্যাশবোর্ডে স্থানটি খুললেই Google Maps ও দিকনির্দেশনার বোতাম পাবেন। আনুমানিক পিনের ক্ষেত্রে নাম ধরে খুঁজুন — গেটের সঠিক অবস্থান যাওয়ার আগে যাচাই করুন।</p>' +
        linksHtml([['index.html#travel-help', 'যাতায়াত ও থাকা'], ['index.html#map-section', 'ম্যাপ']]);
    }
    if (/হোটেল|খাবার|হাসপাতাল|ফার্মেসি|এটিএম|atm|থানা|কাছাকাছি/i.test(q)) {
      return '<p>কাছাকাছি সেবা খুঁজতে প্রথমে ড্যাশবোর্ডে স্থানটি বেছে নিন — সেখানে হোটেল, হাসপাতাল, ফার্মেসি, পুলিশ ও ফায়ার সার্ভিসের Maps-খোঁজ বোতাম আছে। কোন বিহারের কাছে খুঁজবেন, নামটি লিখলে আরও নির্দিষ্ট লিংক দিতে পারব।</p>' +
        linksHtml([['index.html#map-section', 'ম্যাপ ও কাছাকাছি সেবা']]);
    }
    if (/আচরণ|শিষ্টাচার|ছবি তোলা|জুতা|পোশাক|etiquette/i.test(low)) {
      return '<p>সক্রিয় বিহারে: শালীন পোশাক পরুন, নিচু গলায় কথা বলুন, জুতা নির্দিষ্ট জায়গায় রাখুন, ভিক্ষু বা উপাসকের ছবি তোলার আগে অনুমতি নিন, বুদ্ধমূর্তির দিকে পা না দিয়ে বসুন এবং ভান্তেদের বিশ্রামের সময় বিঘ্ন ঘটাবেন না।</p>';
    }
    if (/ইতিহাস|প্রত্ন|স্থাপত্য|পাল যুগ|history/i.test(low)) {
      return '<p>বাংলার বৌদ্ধ ইতিহাস ও স্থাপত্যের ধারাবাহিক পড়া ইতিহাস পাতায় ও দর্শন পাতার “বাংলায় বৌদ্ধধর্ম” অধ্যায়ে আছে। কোনো নির্দিষ্ট স্থানের নাম লিখলে তার তথ্য ও ম্যাপের দিকে পাঠিয়ে দেব।</p>' +
        linksHtml([['history.html', 'ইতিহাস'], ['philosophy.html#bengal', 'বাংলায় বৌদ্ধধর্ম'], ['index.html#explore', 'স্থান খুঁজুন']]);
    }
    if (/কুইজ|quiz/i.test(low)) {
      return '<p>ছবি ও ম্যাপসহ কুইজ খেলতে পারবেন কুইজ পাতায় — প্রতিবার নতুন সেট আসে।</p>' +
        linksHtml([['quiz.html', 'কুইজ শুরু করুন']]);
    }
    return '<p>আমি সাহায্য করতে পারি: বৌদ্ধ ঐতিহ্য ও ইতিহাস, স্থান-ভ্রমণ ও রুট, উৎসব-পঞ্জিকা, গৃহী নীতি ও সূত্র, বন্দনা — আর নতুন: <b>শিশুর ধর্মীয় নাম</b> ও <b>প্রতিষ্ঠান/স্থানের নাম</b>। যেকোনো একটি উদাহরণ বোতামে চাপ দিন, বা প্রশ্ন লিখুন।</p>' +
      linksHtml([['philosophy.html#grihi', 'গৃহী নীতি'], ['philosophy.html#bandana', 'বন্দনা ও জীবনাচার'], ['index.html#explore', 'স্থান খুঁজুন']]);
  }

  /* ---------- One shared assistant across the entire site ---------- */
  var placePromise = null;
  var lastReply = '';
  var lastFocus = null;

  function normalize(value) {
    return String(value || '').toLocaleLowerCase('bn').replace(/[\u200c\u200d]/g, '').replace(/\s+/g, ' ').trim();
  }
  function localTrackerPlaces() {
    try {
      var api = window.CharyabhumiTracker;
      var list = api && api.getPlaces ? api.getPlaces() : null;
      return list && list.length ? list : null;
    } catch (_) { return null; }
  }
  function loadPlaces() {
    var local = localTrackerPlaces();
    if (local) return Promise.resolve(local);
    if (placePromise) return placePromise;
    placePromise = fetch('data/tracker-places.json?v=20261024e').then(function (r) {
      if (!r.ok) throw new Error('place directory ' + r.status);
      return r.json();
    }).then(function (data) { return data.places || []; }).catch(function (err) {
      placePromise = null;
      throw err;
    });
    return placePromise;
  }
  function searchPlaces(query, limit) {
    var term = normalize(query);
    if (term.length < 2) return Promise.resolve([]);
    var stop = ['the','and','tell','about','please','what','which','have','from','বলুন','সম্পর্কে','জানতে','চাই','একটি','কোনো'];
    var tokens = term.replace(/[?.!,“”]/g, '').split(' ').filter(function (t) {
      return t.length >= 3 && stop.indexOf(t) === -1;
    });
    return loadPlaces().then(function (places) {
      return places.map(function (p) {
        var names = normalize([p.name, p.en, p.id, (p.aliases || []).join(' ')].join(' '));
        var geography = normalize([p.district, p.division, p.upazila, p.category, p.type].join(' '));
        var score = 0;
        if (normalize(p.id) === term) score += 160;
        if (p.en && normalize(p.en) === term) score += 120;
        if (names.indexOf(term) !== -1) score += 60;
        if (names.indexOf(term) === 0) score += 18;
        if (geography.indexOf(term) !== -1) score += 12;
        tokens.forEach(function (token) {
          if (names.indexOf(token) !== -1) score += 8;
          else if (geography.indexOf(token) !== -1) score += 3;
        });
        return { place: p, score: score };
      }).filter(function (x) { return x.score >= 3; }).sort(function (a, b) {
        return b.score - a.score || String(a.place.name).localeCompare(String(b.place.name), 'bn');
      }).slice(0, limit || 6).map(function (x) { return x.place; });
    });
  }
  function safeLink(url) {
    try {
      var parsed = new URL(String(url || ''), location.href);
      return /^(https?:)$/.test(parsed.protocol) ? parsed.href : '';
    } catch (_) { return ''; }
  }
  function message(text, role, links, trustedHtml) {
    var box = $('chatMessages');
    var div = document.createElement('div');
    div.className = 'message ' + (role || 'bot');
    if (trustedHtml) div.innerHTML = text;
    else div.textContent = text;
    (links || []).forEach(function (link) {
      var url = safeLink(link.url || link);
      if (!url) return;
      var a = document.createElement('a');
      a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer';
      a.textContent = '\n' + (link.title || 'মূল উৎস') + ' ↗';
      div.appendChild(a);
    });
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
    if (role !== 'user') lastReply = div.textContent || '';
    return div;
  }
  function appendPlaceLinks(list) {
    if (!list.length) return;
    var div = document.createElement('div');
    div.className = 'sm-place-links';
    list.forEach(function (p) {
      var a = document.createElement('a');
      a.href = 'index.html?q=' + encodeURIComponent(p.id) + '#explore';
      a.textContent = (p.en || p.name) + ' ↗';
      div.appendChild(a);
    });
    $('chatMessages').appendChild(div);
    $('chatMessages').scrollTop = $('chatMessages').scrollHeight;
  }
  function broadQuery(q) {
    var specific = normalize(q).replace(/[?.!,“”]/g, '').split(' ').filter(function (word) {
      return word.length >= 2 && ['বিহার','মন্দির','স্থান','তথ্য','নাম','ইতিহাস','প্রত্নতত্ত্ব','ভ্রমণ','দর্শন','buddhist','temple','place','history','tell','about','information'].indexOf(word) === -1;
    });
    return !specific.length;
  }
  function statsReply() {
    if (!$('allowStats').checked) {
      message('Please enable “Allow local guide to read my visit stats” above. Your map is private until you grant access. / অনুমতি ছাড়া আপনার ব্যক্তিগত ম্যাপ পড়া হয় না।');
      return true;
    }
    var api = window.CharyabhumiTracker;
    if (api && api.getStats) {
      var s = api.getStats();
      message('You have visited ' + s.sites + ' of ' + s.total + ' heritage records (' + s.percent + '%) and ' + s.districts + ' of 64 districts. ' + s.remaining + ' places remain. Counts are self-reported; no private journal, photo or precise route was read.');
      return true;
    }
    var visited = 0, districts = 0;
    try {
      var saved = JSON.parse(localStorage.getItem('charjavumi.tracker.v1') || '{}');
      visited = Array.isArray(saved.visited) ? new Set(saved.visited).size : 0;
      districts = Array.isArray(saved.districts) ? new Set(saved.districts).size : 0;
    } catch (_) {}
    loadPlaces().then(function (places) {
      message('You have self-reported ' + visited + ' visits in this browser. The full directory has ' + places.length + ' records; ' + districts + ' manually/GPS-recorded district marks were found. Open the tracker for the complete private calculation. No journal, photo or precise route was read.');
    }).catch(function () { message('The saved visit count could not be compared with the directory right now. Open the tracker and try again.'); });
    return true;
  }
  function onlineReply(query) {
    var lang = $('chatLanguage').value.startsWith('bn') ? 'bn' : 'en';
    var pending = message(lang === 'bn' ? 'অনলাইন সহায়কের উত্তর খোঁজা হচ্ছে…' : 'Looking up the configured online assistant…');
    var endpoint = String(window.SANGHAMITRA_API_URL || window.CHARJAVUMI_CHAT_ENDPOINT || '/api/chat').trim();
    var controller = new AbortController();
    var timeout = setTimeout(function () { controller.abort(); }, 45000);
    return searchPlaces(query, 1).catch(function () { return []; }).then(function (matches) {
      return fetch(endpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: controller.signal,
        body: JSON.stringify({ message: query, language: lang, site_id: matches[0] ? matches[0].id : null })
      });
    }).then(function (response) {
      if (!response.ok) throw new Error('Online AI unavailable');
      return response.json();
    }).then(function (data) {
      pending.remove();
      if (typeof data.answer !== 'string') throw new Error('Invalid response');
      message(data.answer, 'bot', data.sources || []);
    }).catch(function () {
      pending.remove();
      message('Online AI is unavailable. No generated answer was returned. Turn off online AI to use the source-based local guide. / অনলাইন AI অনুপলব্ধ; স্থানীয় গাইড ব্যবহার করতে online AI বন্ধ করুন।');
    }).finally(function () { clearTimeout(timeout); });
  }
  function send(query) {
    var q = String(query || '').trim();
    if (!q) return;
    message(q, 'user');
    $('chatInput').value = '';
    if ($('onlineAI').checked) return onlineReply(q);
    var n = normalize(q);
    if (/progress|stats|how many|remaining|অগ্রগতি|কত.*দেখ|বাকি/.test(n)) return statsReply();
    if (broadQuery(q)) { message(answerBot(q), 'bot', [], true); return; }
    searchPlaces(q, 5).then(function (matches) {
      if (!matches.length) { message(answerBot(q), 'bot', [], true); return; }
      var p = matches[0];
      var caution = p.approx ? '\n\nLocation/access note: this record may use an approximate pin; verify locally before travel.' : '\n\nVerify current opening hours and access before travel.';
      message((p.en || p.name) + '\n' + p.name + '\n\n' + (p.history || p.summary || 'Source-linked directory record.') + caution, 'bot', p.source ? [{ title: p.sourceLabel || 'Original source', url: p.source }] : []);
      appendPlaceLinks(matches);
    }).catch(function () { message(answerBot(q) + '<p class="sm-note">স্থান-ডিরেক্টরি এখন লোড হয়নি; সাধারণ local guide-এর উত্তর দেখানো হলো।</p>', 'bot', [], true); });
  }

  function ensureStyles() {
    if (document.getElementById('cbSanghaStyles')) return;
    var link = document.createElement('link');
    link.id = 'cbSanghaStyles'; link.rel = 'stylesheet'; link.href = 'sanghamitra.css?v=20261024e';
    document.head.appendChild(link);
  }
  function ensurePanel() {
    if ($('assistantPanel')) return;
    var panel = document.createElement('aside');
    panel.id = 'assistantPanel'; panel.className = 'sm-panel'; panel.hidden = true;
    panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-labelledby', 'assistantTitle'); panel.setAttribute('aria-label', 'SanghaMitra assistant');
    panel.innerHTML = '<div class="sm-head"><span class="sm-mark" aria-hidden="true">☸</span><div><h2 id="assistantTitle">সংঘমিত্র · SanghaMitra</h2><small id="assistantMode">Source-based local guide · optional online AI</small></div><button type="button" class="sm-icon" id="smClose" aria-label="Close assistant">×</button></div>' +
      '<div class="sm-options"><select id="chatLanguage" aria-label="Assistant language"><option value="bn-BD">বাংলা</option><option value="en-US">English</option><option value="hi-IN">हिन्दी · voice</option><option value="es-ES">Español · voice</option></select>' +
      '<select id="voiceSelect" aria-label="Available device voices"><option value="">Device default voice</option></select></div>' +
      '<label class="sm-consent"><input type="checkbox" id="allowStats"> Allow local guide to read my visit stats / ভ্রমণ-পরিসংখ্যান পড়ার অনুমতি</label>' +
      '<label class="sm-consent"><input type="checkbox" id="onlineAI"> Use optional online AI (question + selected public record only)</label>' +
      '<div id="chatMessages" class="sm-messages" aria-live="polite"><div class="message bot">আমি সংঘমিত্র—সাইটজুড়ে একই সহায়ক। স্থান, ইতিহাস, দর্শন, ভ্রমণ বা শিশুর নাম জিজ্ঞাসা করুন।<small>Default: local curated guide, not generative AI. Online AI is off until you choose it.</small></div></div>' +
      '<div class="sm-quick"><button type="button" data-sm-prompt="Dharmarajika">Dharmarajika ↗</button><button type="button" data-sm-prompt="My progress">My progress ↗</button><button type="button" data-sm-prompt="শিশুর ধর্মীয় নাম">শিশুর নাম</button><button type="button" data-sm-prompt="ভ্রমণ রুট">ভ্রমণ রুট</button></div>' +
      '<form id="chatForm" class="sm-form"><button type="button" class="sm-icon" id="smDictate" aria-label="Speak your question">🎙</button><input id="chatInput" maxlength="500" required placeholder="প্রশ্ন লিখুন / Ask SanghaMitra…" aria-label="Ask SanghaMitra"><button class="send-button" aria-label="Send message">↑</button></form>' +
      '<div class="sm-footer"><button type="button" id="smReadAloud">◖ Read reply aloud</button><button type="button" id="smStopVoice">Stop voice</button></div><p id="smVoiceStatus" class="sm-voice-status" role="status"></p>';
    document.body.appendChild(panel);
    $('smClose').addEventListener('click', close);
    $('chatForm').addEventListener('submit', function (event) { event.preventDefault(); send($('chatInput').value); });
    panel.querySelectorAll('[data-sm-prompt]').forEach(function (button) { button.addEventListener('click', function () { send(button.dataset.smPrompt); }); });
    $('onlineAI').addEventListener('change', function () { $('assistantMode').textContent = this.checked ? 'Online AI · requires configured server' : 'Source-based local guide · optional online AI'; });
    $('chatLanguage').addEventListener('change', loadVoices);
    $('smReadAloud').addEventListener('click', speak);
    $('smStopVoice').addEventListener('click', function () { if (window.speechSynthesis) speechSynthesis.cancel(); });
    $('smDictate').addEventListener('click', dictate);
    if ('speechSynthesis' in window) {
      speechSynthesis.addEventListener('voiceschanged', loadVoices);
      loadVoices();
    }
  }
  function open() {
    ensureStyles(); ensurePanel();
    lastFocus = document.activeElement;
    closeSearchIfOpen();
    $('assistantPanel').hidden = false;
    setTimeout(function () { $('chatInput').focus(); }, 30);
  }
  function closeSearchIfOpen() {
    var search = $('cbSiteSearch');
    if (search && search.open && typeof search.close === 'function') search.close();
  }
  function close() {
    var panel = $('assistantPanel');
    if (panel) panel.hidden = true;
    if (window.speechSynthesis) speechSynthesis.cancel();
    if (lastFocus && document.contains(lastFocus) && typeof lastFocus.focus === 'function') lastFocus.focus();
  }
  function ask(query) { open(); send(query); }
  function setLanguage(code) {
    ensurePanel();
    $('chatLanguage').value = code === 'bn' ? 'bn-BD' : 'en-US';
    loadVoices();
  }
  function loadVoices() {
    if (!$('voiceSelect') || !$('chatLanguage') || !('speechSynthesis' in window)) return;
    var language = $('chatLanguage').value.slice(0, 2);
    var voices = speechSynthesis.getVoices().filter(function (v) { return v.lang.toLowerCase().startsWith(language); });
    $('voiceSelect').innerHTML = '<option value="">Device default voice</option>' + voices.map(function (v) {
      return '<option value="' + esc(v.voiceURI) + '">' + esc(v.name) + ' · ' + esc(v.lang) + '</option>';
    }).join('');
  }
  function speak() {
    var status = $('smVoiceStatus');
    if (!('speechSynthesis' in window)) { status.textContent = 'Speech synthesis is not supported in this browser.'; return; }
    if (!lastReply) { status.textContent = 'Ask the guide a question first.'; return; }
    var language = $('chatLanguage').value;
    var voices = speechSynthesis.getVoices();
    if (!voices.some(function (v) { return v.lang.toLowerCase().startsWith(language.slice(0, 2)); })) {
      status.textContent = 'No matching device voice is installed. Add one in device settings.'; return;
    }
    var selected = voices.find(function (v) { return v.voiceURI === $('voiceSelect').value; });
    speechSynthesis.cancel();
    var utterance = new SpeechSynthesisUtterance(lastReply);
    utterance.lang = language; utterance.rate = .94;
    if (selected) utterance.voice = selected;
    utterance.onerror = function () { status.textContent = 'Voice playback failed. Try another device voice.'; };
    speechSynthesis.speak(utterance); status.textContent = '';
  }
  function dictate() {
    var Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    var status = $('smVoiceStatus');
    if (!Recognition) { status.textContent = 'Voice input is not supported here. Please type your question.'; return; }
    if (!window.confirm('Your browser may send microphone audio to its speech recognition provider. Continue with voice input?')) return;
    var recognition = new Recognition(); recognition.lang = $('chatLanguage').value;
    recognition.onresult = function (event) { $('chatInput').value = event.results[0][0].transcript; $('chatInput').focus(); };
    recognition.onerror = function () { status.textContent = 'Microphone unavailable or permission denied. Please type instead.'; };
    recognition.start(); status.textContent = 'Listening… review the transcript before sending.';
  }

  ensureStyles(); ensurePanel();
  window.CharyabhumiSanghaMitra = { open: open, close: close, ask: ask, searchPlaces: searchPlaces, setLanguage: setLanguage };
  document.addEventListener('click', function (event) {
    var button = event.target.closest('[data-sangha-open]');
    if (button) { event.preventDefault(); open(); }
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && $('assistantPanel') && !$('assistantPanel').hidden) close();
  });
  document.addEventListener('cb:tracker-ready', function () { /* subsequent queries use the already-loaded private tracker context */ });
  var params = new URLSearchParams(location.search);
  if (params.get('assistant') === '1' || location.hash === '#sanghamitra') setTimeout(open, 180);
})();
