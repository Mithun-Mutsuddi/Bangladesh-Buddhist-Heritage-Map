/* চর্যাভূমি — শিশু ও শিক্ষা সম্প্রসারণ (§৮): Heritage Explorer, ট্রেজার হান্ট,
   কুইজ কোয়েস্ট, বহু-স্তর ডিজিটাল খনন, টাইম-ট্রাভেল, পেপার ক্রাফট, ওয়ার্কশিট।
   children.html-এর #games-plus ধারকে বসে; পুরনো গেমগুলো অপরিবর্তিত থাকে। */
(function () {
  'use strict';
  var host = document.getElementById('games-plus');
  if (!host || !window.MX) return;
  MX.trackLocal('children.html');

  var KEY = 'cb.gamesplus.v1';
  var SITE_NAMES = {
    somapura: 'পাহাড়পুর — সোমপুর মহাবিহার', shalban: 'শালবন বিহার', 'kotila-mura': 'কোটিলা মুড়া',
    'itakhola-mura': 'ইটাখোলা মুড়া', 'rupban-mura': 'রূপবান মুড়া', 'charpatra-mura': 'চারপত্র মুড়া',
    'ananda-vihara': 'আনন্দ বিহার', 'bhoja-vihara': 'ভোজ বিহার', sitakot: 'সীতাকোট বিহার',
    'halud-vihara': 'হলুদ বিহার', 'bhasu-vihara': 'ভাসু বিহার', jagaddala: 'জগদ্দল প্রত্নস্থল',
    'bharat-bhayna': 'ভরত ভায়না বৌদ্ধ মন্দির (কেশবপুর, যশোর)'
  };
  var state = MX.getLocal(KEY, { xp: 0, badges: [], digFound: [], huntStep: 0, huntDone: false, quizBest: 0, timeSeen: [] });
  var DATA = null;

  function save() { MX.setLocal(KEY, state); renderProfile(); }
  function addXP(n, why) {
    state.xp += n;
    MX.toast('+' + MX.bn(n) + ' XP — ' + why + ' (মোট ' + MX.bn(state.xp) + ')');
    save();
  }
  function award(badgeId) {
    if (state.badges.indexOf(badgeId) > -1 || !DATA) return;
    var b = DATA.explorer.badges.filter(function (x) { return x.id === badgeId; })[0];
    state.badges.push(badgeId);
    MX.toast('🏅 নতুন ব্যাজ: ' + (b ? b.icon + ' ' + b.name_bn : badgeId));
    save();
  }
  function levelOf(xp) {
    var cur = DATA.explorer.levels[0], nxt = null;
    DATA.explorer.levels.forEach(function (l, i) { if (xp >= l.min_xp) { cur = l; nxt = DATA.explorer.levels[i + 1] || null; } });
    return { cur: cur, nxt: nxt };
  }
  function passportCount() {
    var p = MX.getLocal('charyabhumiAtlasPassportV1', { stamps: {} });
    return p.stamps ? Object.keys(p.stamps).filter(function (k) { return p.stamps[k]; }).length : 0;
  }

  function renderProfile() {
    if (!DATA) return;
    var lv = levelOf(state.xp);
    var pct = lv.nxt ? Math.round((state.xp - lv.cur.min_xp) / (lv.nxt.min_xp - lv.cur.min_xp) * 100) : 100;
    var pc = passportCount();
    if (pc >= 6) { if (state.badges.indexOf('passport-half') < 0) { state.badges.push('passport-half'); } }
    if (pc >= 12) { if (state.badges.indexOf('passport-full') < 0) { state.badges.push('passport-full'); } }
    host.querySelector('#gpProfile').innerHTML =
      '<p style="margin:0">আমার পদ: <b>' + MX.esc(lv.cur.name_bn) + '</b> · XP: <b>' + MX.bn(state.xp) + '</b>' +
      (lv.nxt ? ' · পরের পদ “' + MX.esc(lv.nxt.name_bn) + '”-এ আরও ' + MX.bn(lv.nxt.min_xp - state.xp) + ' XP' : ' · সর্বোচ্চ পদে পৌঁছে গেছ! 🎉') + '</p>' +
      '<div class="mx-xpbar" style="margin:8px 0"><i style="width:' + pct + '%"></i></div>' +
      '<p style="margin:4px 0">🛂 Atlas পাসপোর্ট স্ট্যাম্প: <b>' + MX.bn(pc) + ' / ১২</b> — <a href="atlas.html#passport">স্ট্যাম্প জমা করো</a> · <a href="heritage-lab.html#certificate">সার্টিফিকেট নাও</a></p>' +
      '<div>' + DATA.explorer.badges.map(function (b) {
        var got = state.badges.indexOf(b.id) > -1;
        return '<span class="mx-badge ' + (got ? 'gold' : '') + '" title="' + MX.esc(b.how) + '" style="opacity:' + (got ? 1 : 0.45) + ';margin:2px">' + b.icon + ' ' + MX.esc(b.name_bn) + (got ? ' ✓' : '') + '</span>';
      }).join('') + '</div>' +
      '<p class="mx-mini">ব্যাজের ওপর মাউস রাখলে/চেপে ধরলে কীভাবে পাওয়া যায় দেখা যাবে। সব অগ্রগতি শুধু এই ব্রাউজারে থাকে।</p>';
  }

  /* ---------- ট্রেজার হান্ট ---------- */
  function renderHunt() {
    var box = host.querySelector('#gpHunt');
    var steps = DATA.treasure_hunt;
    if (state.huntDone) {
      box.innerHTML = '<div class="mx-ok"><b>🎉 ট্রেজার হান্ট সম্পূর্ণ!</b><p>তুমি সবগুলো সূত্র মিলিয়েছ। এবার Atlas পাসপোর্টে আসল প্রমাণ-প্রশ্নের স্ট্যাম্প জমা করো!</p><div class="mx-btns"><a class="cb-btn sm" href="atlas.html#passport">পাসপোর্টে যাও</a><button type="button" class="cb-btn sm ghost" id="huntReset">আবার খেলো</button></div></div>';
      box.querySelector('#huntReset').addEventListener('click', function () { state.huntStep = 0; state.huntDone = false; save(); renderHunt(); });
      return;
    }
    var step = steps[state.huntStep];
    box.innerHTML = '<p><b>সূত্র ' + MX.bn(state.huntStep + 1) + ' / ' + MX.bn(steps.length) + '</b></p>' +
      '<p style="font-size:19px">' + MX.esc(step.clue_bn.replace(/^সূত্র \d+: /, '')) + '</p>' +
      step.options.map(function (oid) {
        return '<button type="button" class="mx-optbtn" data-hunt-opt="' + oid + '">📍 ' + MX.esc(SITE_NAMES[oid] || oid) + '</button>';
      }).join('') + '<p id="huntMsg" aria-live="polite"></p>';
    box.querySelectorAll('[data-hunt-opt]').forEach(function (b) {
      b.addEventListener('click', function () {
        var msg = box.querySelector('#huntMsg');
        if (b.dataset.huntOpt === step.answer_site) {
          b.classList.add('correct');
          msg.innerHTML = '<b>ঠিক ধরেছ!</b> ' + MX.esc(step.fact_bn) + (step.answer_site === 'bharat-bhayna'
            ? ' <a href="index.html?q=%E0%A6%AD%E0%A6%B0%E0%A6%A4#explore">ড্যাশবোর্ডে ছবি ও তথ্যসহ দেখো →</a>'
            : ' <a href="explore3d.html?site=' + step.answer_site + '">360°-তে স্থানটি দেখো →</a>');
          state.huntStep++;
          if (state.huntStep >= steps.length) { state.huntDone = true; award('treasure-1'); }
          addXP(step.xp, 'ট্রেজার হান্ট সূত্র');
          setTimeout(function () { if (!state.huntDone) renderHunt(); else { save(); renderHunt(); } }, 2600);
        } else {
          b.classList.add('wrong');
          msg.textContent = 'এটা নয় — সূত্রটা আবার পড়ো, ম্যাপে স্থানগুলোর অবস্থান ভাবো!';
        }
      });
    });
  }

  /* ---------- কুইজ কোয়েস্ট ---------- */
  var quiz = { idx: 0, score: 0, active: false };
  function renderQuiz() {
    var box = host.querySelector('#gpQuiz');
    var qs = DATA.quiz_quest;
    if (!quiz.active) {
      box.innerHTML = '<p>' + MX.bn(qs.length) + 'টি প্রশ্নের রোমাঞ্চ! ৮০% পেলে <b>কুইজ-বীর</b> ব্যাজ। তোমার সেরা নম্বর: <b>' + MX.bn(state.quizBest) + '</b>/ ' + MX.bn(qs.length) + '</p>' +
        '<button type="button" class="cb-btn solid" id="quizStart">🎮 কোয়েস্ট শুরু করো</button> <a class="cb-btn ghost" href="quiz.html">বড় কুইজ পাতা</a>';
      box.querySelector('#quizStart').addEventListener('click', function () { quiz = { idx: 0, score: 0, active: true }; renderQuiz(); });
      return;
    }
    if (quiz.idx >= qs.length) {
      var pct = Math.round(quiz.score / qs.length * 100);
      if (quiz.score > state.quizBest) state.quizBest = quiz.score;
      quiz.active = false;
      if (pct >= 80) award('quiz-ace');
      save();
      box.innerHTML = '<div class="mx-ok"><b>ফলাফল: ' + MX.bn(quiz.score) + ' / ' + MX.bn(qs.length) + ' (' + MX.bn(pct) + '%)</b><p>' +
        (pct >= 80 ? 'দুর্দান্ত! তুমি সত্যিই ঐতিহ্য-বিশেষজ্ঞ। 🏆' : 'ভালো চেষ্টা! জ্ঞানকোষ একপাক ঘুরে আবার খেলো।') +
        '</p><div class="mx-btns"><button type="button" class="cb-btn sm" id="quizAgain">আবার খেলো</button><a class="cb-btn sm ghost" href="knowledge.html">জ্ঞানকোষ পড়ো</a></div></div>';
      box.querySelector('#quizAgain').addEventListener('click', function () { quiz = { idx: 0, score: 0, active: true }; renderQuiz(); });
      addXP(quiz.score * 10, 'কুইজ কোয়েস্ট শেষ');
      return;
    }
    var q = qs[quiz.idx];
    box.innerHTML = '<p><b>প্রশ্ন ' + MX.bn(quiz.idx + 1) + ' / ' + MX.bn(qs.length) + '</b> · নম্বর: ' + MX.bn(quiz.score) + '</p>' +
      '<p style="font-size:19px"><b>' + MX.esc(q.q) + '</b></p>' +
      q.options.map(function (o, i) { return '<button type="button" class="mx-optbtn" data-quiz-opt="' + i + '">' + MX.esc(o) + '</button>'; }).join('') +
      '<p id="quizMsg" aria-live="polite"></p>';
    box.querySelectorAll('[data-quiz-opt]').forEach(function (b) {
      b.addEventListener('click', function () {
        var correct = +b.dataset.quizOpt === q.answer;
        box.querySelectorAll('.mx-optbtn').forEach(function (x) { x.disabled = true; });
        b.classList.add(correct ? 'correct' : 'wrong');
        box.querySelector('[data-quiz-opt="' + q.answer + '"]').classList.add('correct');
        if (correct) quiz.score++;
        box.querySelector('#quizMsg').innerHTML = (correct ? '✅ ঠিক! ' : '❌ ভুল হলো। ') + MX.esc(q.explain) +
          ' <button type="button" class="cb-btn sm" id="quizNext">পরের প্রশ্ন →</button>';
        box.querySelector('#quizNext').addEventListener('click', function () { quiz.idx++; renderQuiz(); });
      });
    });
  }

  /* ---------- ডিজিটাল খনন (বহু-স্তর) ---------- */
  var digLayer = 1, digTool = 'brush';
  var POS = [[22, 30], [68, 24], [45, 62], [78, 68], [30, 78], [58, 44]];
  function digSetup() {
    var stage = host.querySelector('#gpDigCanvas');
    var tre = host.querySelector('#gpDigTreasures');
    var box = host.querySelector('#gpDig');
    if (!stage) return;
    var rect = box.getBoundingClientRect();
    stage.width = Math.max(600, Math.floor(rect.width)); stage.height = 340;
    var ctx = stage.getContext('2d');
    var soil = { 1: '#b98d5a', 2: '#9a6b3d', 3: '#7a4f28' }[digLayer];
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = soil; ctx.fillRect(0, 0, stage.width, stage.height);
    ctx.fillStyle = 'rgba(0,0,0,0.13)';
    for (var i = 0; i < 260; i++) { ctx.beginPath(); ctx.arc(Math.random() * stage.width, Math.random() * stage.height, 2 + Math.random() * 5, 0, 7); ctx.fill(); }
    ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.font = 'bold 17px sans-serif';
    ctx.fillText('স্তর ' + digLayer + ' — ব্রাশ/বেলচা দিয়ে মাটি সরাও!', 16, 30);

    var items = DATA.dig_artifacts.filter(function (a) { return a.layer === digLayer; });
    tre.innerHTML = items.map(function (a, i) {
      var pos = POS[(a.layer * 2 + i) % POS.length];
      var found = state.digFound.indexOf(a.id) > -1;
      return '<div class="mx-dig-item" data-artifact="' + a.id + '" style="left:' + pos[0] + '%;top:' + pos[1] + '%;' + (found ? '' : 'opacity:0.25') + '">' +
        a.icon + '<small>' + (found ? MX.esc(a.name_bn) : '?') + '</small></div>';
    }).join('');
    updateDigInfo();
  }
  function updateDigInfo() {
    var total = DATA.dig_artifacts.length;
    host.querySelector('#gpDigInfo').innerHTML = 'খুঁজে পেয়েছ: <b>' + MX.bn(state.digFound.length) + ' / ' + MX.bn(total) + '</b>টি নিদর্শন। ' +
      'স্তর বদলে আরও গভীরে খুঁজো — আসল প্রত্নতাত্ত্বিকরাও স্তর ধরে (উপর থেকে নিচে = নতুন থেকে পুরনো) খনন করেন!';
    var facts = DATA.dig_artifacts.filter(function (a) { return state.digFound.indexOf(a.id) > -1; });
    host.querySelector('#gpDigFacts').innerHTML = facts.map(function (a) {
      return '<article class="mx-card"><span class="mx-ico">' + a.icon + '</span> <b>' + MX.esc(a.name_bn) + '</b><p>' + MX.esc(a.fact) + '</p></article>';
    }).join('') || '<p class="mx-meta">খনন শুরু করো — পাওয়া নিদর্শনের গল্প এখানে জমবে।</p>';
  }
  function digBind() {
    var stage = host.querySelector('#gpDigCanvas');
    var digging = false;
    function posOf(e) {
      var r = stage.getBoundingClientRect();
      var cx = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
      var cy = (e.touches ? e.touches[0].clientY : e.clientY) - r.top;
      return { x: cx * stage.width / r.width, y: cy * stage.height / r.height, px: cx / r.width * 100, py: cy / r.height * 100 };
    }
    function digAt(e) {
      if (!digging) return;
      e.preventDefault();
      var p = posOf(e), ctx = stage.getContext('2d');
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(p.x, p.y, digTool === 'spade' ? 34 : 18, 0, 7);
      ctx.fill();
      DATA.dig_artifacts.filter(function (a) { return a.layer === digLayer && state.digFound.indexOf(a.id) < 0; }).forEach(function (a) {
        var idx = DATA.dig_artifacts.filter(function (x) { return x.layer === digLayer; }).indexOf(a);
        var target = POS[(a.layer * 2 + idx) % POS.length];
        var dx = p.px - target[0], dy = p.py - target[1];
        if (Math.sqrt(dx * dx + dy * dy) < 11) {
          state.digFound.push(a.id);
          var el = host.querySelector('[data-artifact="' + a.id + '"]');
          if (el) { el.style.opacity = '1'; el.querySelector('small').textContent = a.name_bn; }
          if (state.digFound.length === 1) award('first-dig');
          if (state.digFound.length >= DATA.dig_artifacts.length) award('dig-master');
          addXP(a.xp + (digTool === 'brush' ? 10 : 0), (digTool === 'brush' ? 'ব্রাশে সযত্নে খুঁজলে: ' : 'খুঁজে পেলে: ') + a.name_bn);
          updateDigInfo();
        }
      });
    }
    stage.addEventListener('pointerdown', function (e) { digging = true; digAt(e); });
    stage.addEventListener('pointermove', digAt);
    window.addEventListener('pointerup', function () { digging = false; });
    host.querySelectorAll('[data-dig-layer]').forEach(function (b) {
      b.addEventListener('click', function () { digLayer = +b.dataset.digLayer; host.querySelectorAll('[data-dig-layer]').forEach(function (x) { x.classList.toggle('solid', x === b); }); digSetup(); });
    });
    host.querySelectorAll('[data-dig-tool]').forEach(function (b) {
      b.addEventListener('click', function () { digTool = b.dataset.digTool; host.querySelectorAll('[data-dig-tool]').forEach(function (x) { x.classList.toggle('solid', x === b); }); });
    });
    host.querySelector('#gpDigReset').addEventListener('click', function () { digSetup(); });
  }

  /* ---------- টাইম-ট্রাভেল ---------- */
  var TIME_PAIRS = [
    { id: 'somapura-recon', title: 'সোমপুর: সম্ভাব্য অতীত রূপ ↔ বর্তমান ধ্বংসাবশেষ', before: 'assets/children/somapura-reconstruction.jpg', after: 'assets/quiz/somapura.jpg', bLabel: 'সম্ভাব্য অতীত (ইলাস্ট্রেশন)', aLabel: 'বর্তমান ছবি', note: 'বাঁয়েরটি AI-assisted শিক্ষামূলক ইলাস্ট্রেশন — আসল উচ্চতা/রঙ নিশ্চিত নয়।' },
    { id: 'cunningham', title: 'পাহাড়পুর: কার্টাজে ১৮৮২ প্লেট ↔ বর্তমান টেরাকোটা', before: 'assets/atlas/cunningham-paharpur-plate32.jpg', after: 'assets/atlas/somapura-terracotta.jpg', bLabel: '১৮৮২ সালের আঁকা প্লেট', aLabel: 'আজকের ছবি', note: 'খননের আগের যুগের রেখাচিত্র বনাম এখনকার সংরক্ষিত ফলক।' },
    { id: 'mainamati-map', title: 'ময়নামতি: পুরনো ম্যাপের দেবপর্বত ↔ আজকের শালবন', before: 'assets/maps/bd-mainamati-dev-parbat.jpg', after: 'assets/atlas/shalban.jpg', bLabel: 'ঐতিহাসিক মানচিত্র', aLabel: 'বর্তমান শালবন বিহার', note: 'ম্যাপে টিলার সারি মিলিয়ে বর্তমান বিহারের অবস্থান খুঁজো।' }
  ];
  function renderTime(interactive) {
    var sel = host.querySelector('#gpTimeSelect');
    var pair = TIME_PAIRS.filter(function (x) { return x.id === sel.value; })[0] || TIME_PAIRS[0];
    var box = host.querySelector('#gpTimeBox');
    box.innerHTML =
      '<span class="mx-lab" style="left:10px">' + MX.esc(pair.bLabel) + '</span><span class="mx-lab" style="right:10px">' + MX.esc(pair.aLabel) + '</span>' +
      '<img src="' + pair.after + '" alt="' + MX.esc(pair.aLabel) + '">' +
      '<img class="mx-top" src="' + pair.before + '" alt="' + MX.esc(pair.bLabel) + '">' +
      '<span class="mx-handle"></span>';
    host.querySelector('#gpTimeNote').textContent = pair.note;
    if (interactive && state.timeSeen.indexOf(pair.id) < 0) {
      state.timeSeen.push(pair.id);
      if (state.timeSeen.length >= TIME_PAIRS.length) award('time-traveler');
      addXP(20, 'টাইম-ট্রাভেল তুলনা: ' + pair.title.split(':')[0]);
    }
  }

  /* ---------- পেপার ক্রাফট ---------- */
  function stupaSvg() {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 520" style="width:100%">' +
      '<rect width="700" height="520" fill="white"/>' +
      '<g stroke="#333" stroke-width="2" fill="#fdf3d8">' +
      '<rect x="250" y="380" width="200" height="90"/><rect x="250" y="290" width="200" height="90"/><rect x="250" y="200" width="200" height="90"/>' +
      '<rect x="50" y="290" width="200" height="90"/><rect x="450" y="290" width="200" height="90"/>' +
      '<path d="M250 200 a100 100 0 0 1 200 0" fill="#f7d774"/>' +
      '<rect x="325" y="60" width="50" height="42" fill="#f7d774"/><path d="M350 20 L365 60 L335 60Z" fill="#e8b36a"/></g>' +
      '<g stroke="#b5571f" stroke-width="1.5" stroke-dasharray="7 5" fill="none"><path d="M250 290 h200 M250 380 h200 M250 200 h200"/></g>' +
      '<g font-family="sans-serif" font-size="17" fill="#333">' +
      '<text x="350" y="505" text-anchor="middle">১) পুরু রেখা বরাবর কাটো  ২) ছেদ-রেখায় ভাঁজ করো  ৩) ধাপ তিনটি সাজিয়ে আঠা দাও  ৪) গম্বুজ বসাও — তৈরী তোমার স্তূপ!</text>' +
      '<text x="350" y="160" text-anchor="middle">অণ্ড (গম্বুজ)</text><text x="350" y="250" text-anchor="middle">মেধি-৩</text><text x="350" y="340" text-anchor="middle">মেধি-২</text><text x="350" y="430" text-anchor="middle">মেধি-১ (ভিত্তি)</text>' +
      '<text x="150" y="340" text-anchor="middle">আঠার ফ্ল্যাপ</text><text x="550" y="340" text-anchor="middle">আঠার ফ্ল্যাপ</text>' +
      '<text x="390" y="86">ছত্রাবলী</text></g></svg>';
  }
  function viharaSvg() {
    var cells = '';
    for (var i = 0; i < 5; i++) cells += '<rect x="' + (90 + i * 110) + '" y="210" width="70" height="90" fill="#fdeeda"/>';
    for (var j = 0; j < 5; j++) cells += '<rect x="' + (105 + j * 110) + '" y="245" width="40" height="55" fill="#8f3d08"/>';
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 520" style="width:100%">' +
      '<rect width="720" height="520" fill="white"/>' +
      '<g stroke="#333" stroke-width="2">' +
      '<rect x="70" y="200" width="580" height="110" fill="#f7d774"/>' + cells +
      '<path d="M60 200 L360 90 L660 200Z" fill="#e8b36a"/>' +
      '<rect x="70" y="310" width="580" height="60" fill="#fdf3d8"/>' +
      '<rect x="320" y="240" width="80" height="70" fill="#5b3a1a"/></g>' +
      '<g stroke="#b5571f" stroke-width="1.5" stroke-dasharray="7 5" fill="none"><path d="M70 310 h580 M60 200 h600"/></g>' +
      '<g font-family="sans-serif" font-size="17" fill="#333">' +
      '<text x="360" y="500" text-anchor="middle">ভিক্ষু-কক্ষের সারি আঁকা সামনের দেয়াল — কেটে ভাঁজ করে দাঁড় করাও। ছাদ (ত্রিভুজ) পেছনে ভাঁজ করে আঠা দাও।</text>' +
      '<text x="360" y="80" text-anchor="middle">ছাদ</text><text x="360" y="350" text-anchor="middle">দাঁড়ানোর ভিত্তি (পেছনে ভাঁজ)</text>' +
      '<text x="360" y="232" text-anchor="middle" fill="white" font-size="14">প্রধান দরজা</text></g></svg>';
  }
  function printCraft(title, svg) {
    var w = window.open('', '_blank');
    if (!w) { MX.toast('পপ-আপ অনুমতি দিন'); return; }
    w.document.write('<!doctype html><html lang="bn"><head><meta charset="utf-8"><title>' + title + '</title></head><body style="font-family:sans-serif">' +
      '<h2>' + title + '</h2>' + svg +
      '<p>সাবধানতা: কাঁচি ব্যবহারে বড়দের সাহায্য নাও। প্রিন্টের পর অতিরিক্ত কাগজ ফেলনা হিসেবে আলাদা করো।<br>© চর্যাভূমি — স্কুলে/বাড়িতে বিনামূল্যে ছাপানো যাবে।</p>' +
      '<script>window.onload=function(){setTimeout(function(){window.print()},300)}<\/script></body></html>');
    w.document.close();
    award('paper-builder');
    addXP(30, 'পেপার ক্রাফট প্রিন্ট');
  }
  function printWorksheet(ws) {
    var w = window.open('', '_blank');
    if (!w) { MX.toast('পপ-আপ অনুমতি দিন'); return; }
    w.document.write('<!doctype html><html lang="bn"><head><meta charset="utf-8"><title>' + MX.esc(ws.title_bn) + '</title></head><body style="font-family:sans-serif;line-height:1.8">' +
      '<h2>☸ ' + MX.esc(ws.title_bn) + '</h2><p>' + MX.esc(ws.class) + ' · নাম: __________________ · শ্রেণি: ________ · তারিখ: ____________</p><ol>' +
      ws.tasks.map(function (t) { return '<li style="margin-bottom:26px">' + MX.esc(t) + '<br><br>___________________________________________________________________________<br>___________________________________________________________________________</li>'; }).join('') +
      '</ol><p>শিক্ষকের জন্য: মূল কিট (ফিল্ড-নোটবুক ও কমিক PDF) — charyabhumi Atlas স্কুল-কিট অংশে।<br>© চর্যাভূমি — শ্রেণিকক্ষে বিনামূল্যে ছাপানো যাবে।</p>' +
      '<script>window.onload=function(){setTimeout(function(){window.print()},300)}<\/script></body></html>');
    w.document.close();
  }

  /* ---------- মেমরি ম্যাচ (নতুন) ---------- */
  var MEM_ICONS = ['☸', '🪷', '🐘', '🦚', '🕯️', '🔔', '🌳', '🏺'];
  var memOpen = [], memMatched = 0, memMoves = 0, memLock = false;
  function startMemory() {
    var grid = host.querySelector('#gpMemGrid');
    if (!grid) return;
    memOpen = []; memMatched = 0; memMoves = 0; memLock = false;
    var deck = MEM_ICONS.concat(MEM_ICONS).map(function (ic, i) { return { ic: ic, k: i }; });
    for (var i = deck.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = deck[i]; deck[i] = deck[j]; deck[j] = t; }
    grid.innerHTML = deck.map(function (c) {
      return '<button type="button" class="mx-memcard" data-icon="' + c.ic + '" aria-label="কার্ড">❓</button>';
    }).join('');
    host.querySelector('#gpMemInfo').textContent = 'চাল: ০ · মিলেছে: ০/৮ জোড়া';
    grid.querySelectorAll('.mx-memcard').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (memLock || btn.dataset.done || memOpen.indexOf(btn) > -1) return;
        btn.textContent = btn.dataset.icon; btn.classList.add('open'); memOpen.push(btn);
        if (memOpen.length !== 2) return;
        memMoves++;
        var a = memOpen[0], b = memOpen[1];
        if (a.dataset.icon === b.dataset.icon) {
          a.dataset.done = '1'; b.dataset.done = '1'; a.classList.add('done'); b.classList.add('done');
          memOpen = []; memMatched++;
          if (!state.memFirst) { state.memFirst = true; addXP(10, 'প্রথম জোড়া মিললো!'); }
          if (memMatched === 8) {
            host.querySelector('#gpMemInfo').innerHTML = '🎉 <b>সব জোড়া মিলে গেছে!</b> মোট চাল: ' + MX.bn(memMoves);
            if (!state.memWin) { state.memWin = true; addXP(60, 'মেমরি ম্যাচ জয়'); award('memory-master'); }
            else { MX.toast('আবারও জয়! চাল: ' + MX.bn(memMoves)); save(); }
            return;
          }
        } else {
          memLock = true;
          setTimeout(function () {
            a.textContent = '❓'; b.textContent = '❓';
            a.classList.remove('open'); b.classList.remove('open');
            memOpen = []; memLock = false;
          }, 650);
        }
        host.querySelector('#gpMemInfo').textContent = 'চাল: ' + MX.bn(memMoves) + ' · মিলেছে: ' + MX.bn(memMatched) + '/৮ জোড়া';
      });
    });
  }

  /* ---------- রঙ করো: ভরত ভায়না ক্রুশ (নতুন) ---------- */
  function colorSvg() {
    var R = function (x, y, w, h, label) {
      return '<rect class="gp-fill" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="#fffdf6" stroke="#7a4a21" stroke-width="2"><title>' + label + '</title></rect>';
    };
    return '<svg viewBox="0 0 200 200" role="img" aria-label="ভরত ভায়নার ক্রুশাকার ভূমি-নকশা রঙ করার ছক" style="width:100%;max-width:340px;display:block;margin:0 auto">' +
      '<text x="100" y="12" text-anchor="middle" font-size="10" fill="#7a4a21">উত্তর ↑</text>' +
      R(85, 20, 30, 45, 'উত্তর অভিক্ষেপ') + R(85, 135, 30, 45, 'দক্ষিণ অভিক্ষেপ') +
      R(20, 85, 45, 30, 'পশ্চিম অভিক্ষেপ') + R(135, 85, 45, 30, 'পূর্ব অভিক্ষেপ') +
      R(65, 65, 70, 70, 'কেন্দ্রীয় বর্গ (মঞ্চ)') +
      '<circle class="gp-fill" cx="100" cy="100" r="16" fill="#fffdf6" stroke="#7a4a21" stroke-width="2"><title>কেন্দ্রীয় মঞ্চের শিখর</title></circle>' +
      R(20, 20, 30, 30, 'প্রদক্ষিণপথ কোণ') + R(150, 20, 30, 30, 'প্রদক্ষিণপথ কোণ') +
      R(20, 150, 30, 30, 'প্রদক্ষিণপথ কোণ') + R(150, 150, 30, 30, 'প্রদক্ষিণপথ কোণ') +
      '</svg><p class="mx-mini" style="text-align:center">পরিকল্পনামূলক ছক — আসল ভূমি-নকশা ভরত ভায়নার গ্যালারিতে দেখো।</p>';
  }
  function initColoring() {
    var box = host.querySelector('#gpColorSvg'), pal = host.querySelector('#gpPalette');
    if (!box || !pal) return;
    box.innerHTML = colorSvg();
    var colors = ['#d97706', '#b91c1c', '#15803d', '#1d4ed8', '#a21caf', '#facc15', '#0ea5e9', '#78350f'];
    var current = colors[0];
    pal.innerHTML = colors.map(function (c, i) {
      return '<button type="button" class="mx-palbtn' + (i === 0 ? ' active' : '') + '" data-color="' + c + '" style="background:' + c + '" aria-label="রঙ বেছে নাও"></button>';
    }).join('');
    pal.querySelectorAll('.mx-palbtn').forEach(function (b) {
      b.addEventListener('click', function () {
        current = b.dataset.color;
        pal.querySelectorAll('.mx-palbtn').forEach(function (x) { x.classList.toggle('active', x === b); });
      });
    });
    function allColored() {
      var cells = box.querySelectorAll('.gp-fill');
      for (var i = 0; i < cells.length; i++) { if (!cells[i].dataset.colored) return false; }
      return true;
    }
    box.querySelectorAll('.gp-fill').forEach(function (cell) {
      cell.style.cursor = 'pointer';
      cell.addEventListener('click', function () {
        cell.setAttribute('fill', current); cell.dataset.colored = '1';
        if (!state.colorDone && allColored()) {
          state.colorDone = true; addXP(40, 'ভরত ভায়নার ক্রুশ রঙ শেষ!'); award('color-artist');
        }
      });
    });
    var reset = host.querySelector('#gpColorReset');
    if (reset) reset.addEventListener('click', function () {
      box.querySelectorAll('.gp-fill').forEach(function (cell) {
        cell.setAttribute('fill', '#fffdf6'); delete cell.dataset.colored;
      });
    });
    var memReset = host.querySelector('#gpMemReset');
    if (memReset) memReset.addEventListener('click', startMemory);
  }

  /* ---------- মূল কাঠামো ---------- */
  host.innerHTML =
    '<div class="cb-wrap">' +
    '<p class="cb-eyebrow">নতুন আপডেট · Gamification</p>' +
    '<h2>🏆 হেরিটেজ এক্সপ্লোরার: লেভেল, ব্যাজ ও অভিযান</h2>' +
    '<div class="mx-card" id="gpProfile">লোড হচ্ছে…</div>' +

    '<div class="mx-grid wide" style="margin-top:20px">' +
    '<section class="mx-card"><h3>🗺️ ট্রেজার হান্ট: সূত্র ধরে স্থান খোঁজো</h3><div id="gpHunt"></div></section>' +
    '<section class="mx-card"><h3>🎯 কুইজ কোয়েস্ট</h3><div id="gpQuiz"></div></section></div>' +

    '<div class="mx-grid wide" style="margin-top:20px">' +
    '<section class="mx-card"><h3>🧠 মেমরি ম্যাচ: জোড়া মিলাও</h3>' +
    '<p>কার্ড উল্টে একই ছবির জোড়া মেলাও। ৮ জোড়া মেলালেই XP ও “স্মৃতিশক্তির ওস্তাদ” ব্যাজ!</p>' +
    '<div class="mx-memgrid" id="gpMemGrid"></div>' +
    '<p id="gpMemInfo"></p><div class="mx-btns"><button type="button" class="cb-btn sm" id="gpMemReset">🔄 আবার সাজাও</button></div></section>' +

    '<section class="mx-card"><h3>🎨 রঙ করো: ভরত ভায়নার ক্রুশ</h3>' +
    '<p>যশোরের ভরত ভায়নার ক্রুশাকার ভূমি-নকশা (উত্তর ↑) রঙ করো! রঙ বেছে ঘরে চাপ দাও। সব ঘর রঙ হলে “রঙের শিল্পী” ব্যাজ। <a href="index.html?q=%E0%A6%AD%E0%A6%B0%E0%A6%A4#explore">আসল স্থানের তথ্য ও ছবি →</a></p>' +
    '<div id="gpColorSvg"></div><div id="gpPalette" class="mx-palette"></div>' +
    '<div class="mx-btns"><button type="button" class="cb-btn sm" id="gpColorReset">↺ আবার সাদা করো</button></div></section></div>' +

    '<section class="mx-card" style="margin-top:20px"><h3>⛏️ ডিজিটাল মাটি খনন (তিন স্তর!)</h3>' +
    '<p>স্তর যত গভীর, নিদর্শন তত পুরনো। <b>ব্রাশ</b> দিয়ে সযত্নে খুঁজলে বোনাস XP; বেলচা দ্রুত কিন্তু ঝুঁকিপূর্ণ (কম পয়েন্ট) — আসল খননেও এমনই সাবধানতা লাগে!</p>' +
    '<div class="mx-btns"><span><b>স্তর:</b></span>' +
    '<button type="button" class="cb-btn sm solid" data-dig-layer="1">স্তর ১ (উপরে)</button>' +
    '<button type="button" class="cb-btn sm" data-dig-layer="2">স্তর ২</button>' +
    '<button type="button" class="cb-btn sm" data-dig-layer="3">স্তর ৩ (গভীর)</button>' +
    '<span style="margin-left:10px"><b>যন্ত্র:</b></span>' +
    '<button type="button" class="cb-btn sm solid" data-dig-tool="brush">🖌️ ব্রাশ (+বোনাস)</button>' +
    '<button type="button" class="cb-btn sm" data-dig-tool="spade">🥄 বেলচা</button>' +
    '<button type="button" class="cb-btn sm ghost" id="gpDigReset">মাটি আবার ঢাকো</button></div>' +
    '<div class="mx-dig" id="gpDig" style="margin-top:10px"><div class="mx-dig-treasures" id="gpDigTreasures"></div><canvas id="gpDigCanvas"></canvas></div>' +
    '<p id="gpDigInfo"></p><div class="mx-grid" id="gpDigFacts"></div></section>' +

    '<section class="mx-card" style="margin-top:20px"><h3>⏳ টাইম-ট্রাভেল: আগের ও পরের রূপ</h3>' +
    '<label style="font-weight:700">তুলনা বেছে নাও <select id="gpTimeSelect" style="padding:8px;border-radius:9px;font:inherit">' +
    TIME_PAIRS.map(function (p) { return '<option value="' + p.id + '">' + MX.esc(p.title) + '</option>'; }).join('') + '</select></label>' +
    '<div class="mx-beforeafter" id="gpTimeBox" style="--split:50%;margin-top:10px"></div>' +
    '<label style="display:block;margin-top:8px">অতীত ⟷ বর্তমান <input type="range" id="gpTimeRange" min="0" max="100" value="50" style="width:100%"></label>' +
    '<p class="mx-mini" id="gpTimeNote"></p></section>' +

    '<div class="mx-grid wide" style="margin-top:20px">' +
    '<section class="mx-card"><h3>✂️ DIY পেপার ক্রাফট</h3>' +
    '<p>প্রিন্ট করে কেটে ভাঁজ করলেই তোমার নিজের স্তূপ ও বিহার! মোটা কাগজে ছাপালে শক্ত হবে।</p>' +
    '<h4>পেপার স্তূপ</h4><div>' + stupaSvg() + '</div>' +
    '<div class="mx-btns"><button type="button" class="cb-btn sm" id="craftStupa">🖨️ স্তূপ প্রিন্ট করো</button></div>' +
    '<h4>পেপার বিহার (সামনের রূপ)</h4><div>' + viharaSvg() + '</div>' +
    '<div class="mx-btns"><button type="button" class="cb-btn sm" id="craftVihara">🖨️ বিহার প্রিন্ট করো</button></div></section>' +

    '<section class="mx-card"><h3>🎒 স্কুল শিক্ষা-কিট প্লাস</h3>' +
    '<p>শিক্ষকের জন্য ছাপানো ওয়ার্কশিট, কমিকের কাজ ও Google Classroom শেয়ার। মূল ফিল্ড-নোটবুক ও কমিক PDF <a href="atlas.html#school-kit">Atlas স্কুল-কিট</a>-এ আগের মতোই আছে।</p>' +
    '<div id="gpWorksheets"></div>' +
    '<div class="mx-btns"><a class="cb-btn sm" target="_blank" rel="noopener" href="https://classroom.google.com/share?url=' + encodeURIComponent(location.href) + '">Google Classroom-এ শেয়ার ↗</a>' +
    '<a class="cb-btn sm ghost" href="atlas.html#school-kit">ফিল্ড-নোটবুক ও কমিক PDF</a></div>' +
    '<p class="mx-mini">সব ওয়ার্কশিট শ্রেণিকক্ষে বিনামূল্যে ছাপানো যাবে।</p></section></div></div>';

  initColoring();
  startMemory();
  MX.fetchJson('data/games-plus.json?v=20261024i').then(function (d) {
    DATA = d;
    if (state.huntDone && state.huntStep < d.treasure_hunt.length) state.huntDone = false; /* নতুন সূত্র এলে পুরনো বিজয়ীও বাকি সূত্র পায় */
    if (state.memWin) award('memory-master');
    if (state.colorDone) award('color-artist');
    renderProfile();
    renderHunt();
    renderQuiz();
    digSetup(); digBind();
    renderTime(false);
    host.querySelector('#gpWorksheets').innerHTML = d.worksheets.map(function (ws, i) {
      return '<article style="border:1px solid var(--cb-line);border-radius:12px;padding:12px;margin:10px 0"><b>' + MX.esc(ws.title_bn) + '</b> <span class="mx-meta">(' + MX.esc(ws.class) + ')</span>' +
        '<div class="mx-btns"><button type="button" class="cb-btn sm" data-worksheet="' + i + '">🖨️ প্রিন্ট করুন</button></div></article>';
    }).join('');
    host.querySelectorAll('[data-worksheet]').forEach(function (b) {
      b.addEventListener('click', function () { printWorksheet(d.worksheets[+b.dataset.worksheet]); });
    });
  }).catch(function () {
    host.querySelector('#gpProfile').textContent = 'গেমের ডেটা লোড হয়নি।';
  });

  host.querySelector('#gpTimeSelect').addEventListener('change', renderTime);
  host.querySelector('#gpTimeRange').addEventListener('input', function () {
    host.querySelector('#gpTimeBox').style.setProperty('--split', this.value + '%');
  });
  host.querySelector('#craftStupa').addEventListener('click', function () { printCraft('পেপার স্তূপ — চর্যাভূমি', stupaSvg()); });
  host.querySelector('#craftVihara').addEventListener('click', function () { printCraft('পেপার বিহার — চর্যাভূমি', viharaSvg()); });
})();
