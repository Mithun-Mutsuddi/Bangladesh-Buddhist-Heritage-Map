/* চর্যাভূমি — সংঘমিত্র (SanghaMitra) সহায়ক · নতুন হোমপেজ-সংস্করণ
   ------------------------------------------------------------------
   এটি স্ট্যাটিক নিয়মভিত্তিক সহায়ক (GitHub Pages-এর জন্য)। লাইভ AI যুক্ত করতে
   পেজে আগেভাগে  window.SANGHAMITRA_API_URL = "https://.../api/chat"  বসালে
   server/sanghamitra_api.py-এর এন্ডপয়েন্টকে কল করবে; ব্যর্থ হলে এই স্থানীয়
   উত্তরগুলোই ফলব্যাক দেবে। লক্ষ্য করুন: প্রকাশনার সাইটে localhost বসাবেন না।
   পুরোনো ড্যাশবোর্ডের উইজেটটি এখানে সরিয়ে আনা হয়েছে (heritage-enhancements.js)।
   নতুন ফিচার: শিশুর ধর্মীয় নাম ও প্রতিষ্ঠান/স্থানের নাম-সাজেশন। */
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

  function addMessage(box, html, role) {
    var node = document.createElement('div');
    node.className = 'cb-sangha-msg ' + role;
    node.innerHTML = html;
    box.appendChild(node);
    box.scrollTop = box.scrollHeight;
  }

  function send(box, query) {
    var endpoint = String(window.SANGHAMITRA_API_URL || '').trim();
    if (!endpoint) { addMessage(box, answerBot(query), 'bot'); return; }
    var pending = document.createElement('div');
    pending.className = 'cb-sangha-msg bot';
    pending.textContent = 'উত্তর তৈরি হচ্ছে…';
    box.appendChild(pending);
    box.scrollTop = box.scrollHeight;
    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: query, language: /[\u0980-\u09FF]/.test(query) ? 'bn' : 'en', site_id: null })
    }).then(function (r) {
      if (!r.ok) throw new Error('API ' + r.status);
      return r.json();
    }).then(function (result) {
      pending.remove();
      var html = '<p>' + esc(result.answer || result.response || 'এই মুহূর্তে উত্তর পাওয়া যায়নি।') + '</p>';
      if (Array.isArray(result.sources) && result.sources.length) {
        html += '<div class="cb-sangha-links">' + result.sources.slice(0, 5).map(function (s) {
          return '<a href="' + esc(s.url || s) + '" target="_blank" rel="noopener">' + esc(s.title || 'তথ্যসূত্র') + ' ↗</a>';
        }).join('') + '</div>';
      }
      addMessage(box, html, 'bot');
    }).catch(function (err) {
      pending.remove();
      console.warn('SanghaMitra API unavailable; local fallback used.', err);
      addMessage(box, answerBot(query) + '<p class="cb-sangha-note">লাইভ সেবা পাওয়া যায়নি — স্থানীয় সহায়কের উত্তর দেখানো হলো।</p>', 'bot');
    });
  }

  var QUICK = {
    history: 'বাংলাদেশের বৌদ্ধ ইতিহাস সম্পর্কে বলুন',
    route: 'কোনো বিহারে যাওয়ার রুট কীভাবে পরিকল্পনা করব?',
    etiquette: 'সক্রিয় বিহার ভ্রমণের আচরণবিধি কী?',
    festival: 'আসন্ন বৌদ্ধ উৎসব কবে?',
    babyname: 'শিশুর ধর্মীয় নামের সাজেশন দিন',
    babygirl: 'মেয়ের ধর্মীয় নাম দিন',
    weekday: 'শুক্রবারে জন্ম নেওয়া ছেলের নাম দিন',
    placename: 'নতুন বিহারের নামের সাজেশন দিন',
    grihi: 'গৃহী নীতি — পঞ্চশীল ও সিগালোবাদ সুত্ত সম্পর্কে বলুন'
  };

  document.addEventListener('DOMContentLoaded', function () {
    var box = $('sanghaHomeMessages');
    var form = $('sanghaHomeForm');
    var input = $('sanghaHomeInput');
    if (!box || !form || !input) return;
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var q = input.value.trim();
      if (!q) return;
      addMessage(box, '<p>' + esc(q) + '</p>', 'user');
      input.value = '';
      send(box, q);
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-sangha-home-quick]'), function (btn) {
      btn.addEventListener('click', function () {
        var q = QUICK[btn.getAttribute('data-sangha-home-quick')] || 'বৌদ্ধ ঐতিহ্য সম্পর্কে বলুন';
        addMessage(box, '<p>' + esc(q) + '</p>', 'user');
        send(box, q);
      });
    });
  });
})();
