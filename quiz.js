/* চর্যাভূমি — কুইজ ইঞ্জিন (রাউন্ড ১৩)
   ব্যাংক: data/quiz-bank.json · প্রতি রাউন্ডে ১০টি প্রশ্ন, প্রতিবার নতুন সেট।
   লিডারবোর্ড ব্রাউজারেই (localStorage) — সাইন-আপ নেই। */
(function () {
  'use strict';
  var BANK = 'data/quiz-bank.json?v=20261022a';
  var PER = 10;
  var LS_SCORES = 'charyabhumi.scores.v1';
  var LS_NAME = 'charyabhumi.name.v1';

  var shell = document.getElementById('quizShell');
  if (!shell) return;

  var state = { bank: [], round: [], idx: 0, score: 0, answered: false, started: false, t0: 0, wrong: [] };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function bn(n) { return Number(n).toLocaleString('bn-BD'); }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function bnTime(ms) {
    var s = Math.round(ms / 1000);
    return bn(Math.floor(s / 60)) + ':' + (s % 60 < 10 ? '০' : '') + bn(s % 60);
  }

  /* ---------------- লিডারবোর্ড ---------------- */
  function loadScores() {
    try { return JSON.parse(localStorage.getItem(LS_SCORES) || '[]'); } catch (e) { return []; }
  }
  function saveScore(rec) {
    var all = loadScores();
    all.push(rec);
    all = all.slice(-200);
    try { localStorage.setItem(LS_SCORES, JSON.stringify(all)); } catch (e) {}
    return all;
  }
  function renderBoard() {
    var all = loadScores();
    var weekAgo = Date.now() - 7 * 24 * 3600 * 1000;
    var week = all.filter(function (r) { return r.ts >= weekAgo; });
    function rows(list, lastId) {
      var top = list.slice().sort(function (a, b) {
        return (b.score - a.score) || (a.ms - b.ms) || (b.ts - a.ts);
      }).slice(0, 10);
      if (!top.length) return '<tr><td colspan="4" style="color:var(--cb-muted)">এখনো কোনো ফল নেই — প্রথম খেলাটি আপনার হতে পারে।</td></tr>';
      return top.map(function (r, i) {
        var medal = ['🥇', '🥈', '🥉'][i] || bn(i + 1);
        return '<tr' + (r.id === lastId ? ' class="me"' : '') + '><td>' + medal + '</td><td>' + esc(r.name) +
          '</td><td class="num">' + bn(r.score) + '/' + bn(r.total) + '</td><td class="num">' + bnTime(r.ms) + '</td></tr>';
      }).join('');
    }
    var w = document.querySelector('#lbWeek tbody');
    var a = document.querySelector('#lbAll tbody');
    if (w) w.innerHTML = rows(week, state.lastId);
    if (a) a.innerHTML = rows(all, state.lastId);
  }

  /* ---------------- কুইজ প্রবাহ ---------------- */
  function startScreen() {
    state.started = false;
    shell.innerHTML =
      '<div class="cb-qcard cb-result">' +
        '<div class="ring" style="--p:0"><b>🎮</b></div>' +
        '<h3>১০টি প্রশ্নে যাচাই করুন আপনার জ্ঞান</h3>' +
        '<p>' + bn(state.bank.length) + 'টি প্রশ্নের ভাণ্ডার থেকে প্রতিবার নতুন ' + bn(PER) + 'টি প্রশ্ন আসবে — ছবি ও সূত্রসহ।</p>' +
        '<p style="font-size:13.5px;color:var(--cb-muted)">সময় ধরা হবে; দ্রুত ও সঠিক উত্তরে লিডারবোর্ডে উপরে ওঠার সুযোগ।</p>' +
        '<div class="cb-actions" style="justify-content:center"><button class="cb-btn" id="qbStart" type="button">কুইজ শুরু করুন →</button></div>' +
      '</div>';
    document.getElementById('qbStart').addEventListener('click', begin);
  }

  function begin() {
    state.round = shuffle(state.bank.slice()).slice(0, PER);
    state.idx = 0; state.score = 0; state.wrong = []; state.started = true;
    state.t0 = Date.now();
    questionScreen();
  }

  function questionScreen() {
    state.answered = false;
    var q = state.round[state.idx];
    var pct = Math.round((state.idx / state.round.length) * 100);
    var keys = ['ক', 'খ', 'গ', 'ঘ'];
    shell.innerHTML =
      '<div class="cb-quiz-top">' +
        '<span class="cb-score">প্রশ্ন <b>' + bn(state.idx + 1) + '</b> / ' + bn(state.round.length) + '</span>' +
        '<span class="cb-score">স্কোর <b id="qScore">' + bn(state.score) + '</b></span>' +
        '<div class="cb-progress" aria-hidden="true"><i style="width:' + pct + '%"></i></div>' +
      '</div>' +
      '<div class="cb-qcard">' +
        '<p class="cb-qtag">' + esc(q.tag) + '</p>' +
        (q.img ? '<figure class="cb-qimg"><img src="' + esc(q.img) + '" alt="প্রশ্নের সঙ্গে যুক্ত ছবি" loading="lazy" referrerpolicy="no-referrer"></figure>' : '') +
        '<h2 class="cb-qtext">' + esc(q.q) + '</h2>' +
        '<div class="cb-opts" id="qOpts" role="group" aria-label="উত্তর বাছুন">' +
          q.o.map(function (o, i) {
            return '<button class="cb-opt" type="button" data-i="' + i + '">' +
              '<span class="key">' + keys[i] + '</span><span>' + esc(o) + '</span></button>';
          }).join('') +
        '</div>' +
        '<div id="qFeedback" aria-live="polite"></div>' +
        '<div class="cb-quiz-foot">' +
          '<span class="cb-score" id="qSrc">সূত্র: ' + esc(q.src) + '</span>' +
          '<button class="cb-btn" id="qNext" type="button" disabled>পরের প্রশ্ন →</button>' +
        '</div>' +
      '</div>';

    document.getElementById('qOpts').addEventListener('click', function (ev) {
      var btn = ev.target.closest('.cb-opt');
      if (!btn || state.answered) return;
      answer(Number(btn.getAttribute('data-i')));
    });
    document.getElementById('qNext').addEventListener('click', next);
  }

  function answer(i) {
    state.answered = true;
    var q = state.round[state.idx];
    var btns = Array.prototype.slice.call(document.querySelectorAll('#qOpts .cb-opt'));
    var ok = (i === q.a);
    btns.forEach(function (b, k) {
      b.disabled = true;
      if (k === q.a) b.classList.add('correct');
      if (k === i && !ok) b.classList.add('wrong');
    });
    if (ok) {
      state.score++;
      var sc = document.getElementById('qScore');
      if (sc) sc.textContent = bn(state.score);
    } else {
      state.wrong.push({ q: q.q, ans: q.o[q.a], src: q.src });
    }
    var fb = document.getElementById('qFeedback');
    if (fb) {
      fb.innerHTML = ok
        ? '<p class="cb-feedback ok">✅ ঠিক হয়েছে!<small>' + esc(q.note || 'সূত্র: ' + q.src) + '</small></p>'
        : '<p class="cb-feedback no">❌ ঠিক উত্তর: <b>' + esc(q.o[q.a]) + '</b><small>সূত্র: ' + esc(q.src) + '</small></p>';
    }
    var nx = document.getElementById('qNext');
    if (nx) {
      nx.disabled = false;
      nx.textContent = (state.idx + 1 === state.round.length) ? 'ফলাফল দেখুন →' : 'পরের প্রশ্ন →';
      nx.focus();
    }
  }

  function next() {
    if (state.idx + 1 < state.round.length) {
      state.idx++;
      questionScreen();
      window.scrollTo({ top: shell.getBoundingClientRect().top + window.scrollY - 90, behavior: 'smooth' });
    } else {
      finish();
    }
  }

  function finish() {
    var ms = Date.now() - state.t0;
    var pct = Math.round((state.score / state.round.length) * 100);
    var saved = '';
    try { saved = localStorage.getItem(LS_NAME) || ''; } catch (e) {}
    var msg = pct === 100 ? 'অসাধারণ! পূর্ণ নম্বর — আপনি সত্যিই জানেন।'
      : pct >= 80 ? 'দুর্দান্ত! আর মাত্র কয়েকটা প্রশ্ন।'
      : pct >= 50 ? 'ভালো চেষ্টা — শিল্প ও সংস্কৃতি বিভাগ ঘুরে আসুন।'
      : 'শুরু করুন “শিল্প ও সংস্কৃতি” পাতা থেকে — তারপর আবার খেলুন।';
    shell.innerHTML =
      '<div class="cb-qcard cb-result">' +
        '<div class="ring" style="--p:' + pct + '"><b>' + bn(state.score) + '</b></div>' +
        '<h3>' + esc(msg) + '</h3>' +
        '<p>' + bn(state.round.length) + 'টি প্রশ্নে <b>' + bn(state.score) + '</b>টি সঠিক · সময় ' + bnTime(ms) + '</p>' +
        '<div class="cb-name-form"><input id="qbName" type="text" maxlength="28" placeholder="লিডারবোর্ডে আপনার নাম" value="' + esc(saved) + '" aria-label="লিডারবোর্ডে আপনার নাম"><button class="cb-btn" id="qbSave" type="button">ফল সেভ করুন</button></div>' +
        '<p id="qbSaved" style="font-size:13px;margin:10px 0 0"></p>' +
        (state.wrong.length ? '<div style="text-align:start;margin-top:22px"><h4 style="font-size:15px;margin:0 0 8px">যেগুলো ভুল হয়েছে</h4><ul style="font-size:13.5px;color:var(--cb-ink-soft);padding-inline-start:20px">' +
          state.wrong.map(function (w) { return '<li style="margin-bottom:6px">' + esc(w.q) + ' → <b>' + esc(w.ans) + '</b> <small>(' + esc(w.src) + ')</small></li>'; }).join('') + '</ul></div>' : '') +
        '<div class="cb-actions" style="justify-content:center;margin-top:22px">' +
          '<button class="cb-btn" id="qbAgain" type="button">আবার নতুন ১০টি প্রশ্ন</button>' +
          '<a class="cb-btn ghost" href="#leaderboard">🏆 লিডারবোর্ড</a>' +
        '</div>' +
      '</div>';

    document.getElementById('qbAgain').addEventListener('click', function () {
      startScreen();
      window.scrollTo({ top: shell.getBoundingClientRect().top + window.scrollY - 90, behavior: 'smooth' });
    });
    document.getElementById('qbSave').addEventListener('click', function () {
      var input = document.getElementById('qbName');
      var name = (input.value || '').trim() || 'নামহীন ভ্রমণার্থী';
      try { localStorage.setItem(LS_NAME, name); } catch (e) {}
      var rec = { id: 'r' + Date.now(), name: name, score: state.score, total: state.round.length, ms: ms, ts: Date.now() };
      saveScore(rec);
      state.lastId = rec.id;
      renderBoard();
      var out = document.getElementById('qbSaved');
      if (out) out.innerHTML = '✅ সেভ হয়েছে, ' + esc(name) + ' — লিডারবোর্ডে দেখুন। <a href="#leaderboard">নিচে যান ↓</a>';
      document.getElementById('qbSave').disabled = true;
    });
  }

  /* ---------------- শুরু ---------------- */
  fetch(BANK).then(function (r) {
    if (!r.ok) throw new Error('quiz-bank ' + r.status);
    return r.json();
  }).then(function (data) {
    state.bank = (data.questions || []).filter(function (q) {
      return q.o && q.o.length === 4 && q.a >= 0 && q.a < 4;
    });
    if (data.per_round) PER = data.per_round;
    var lead = document.getElementById('quizHeroLead');
    if (lead) lead.textContent = '১০টি প্রশ্ন · ' + bn(state.bank.length) + 'টি প্রশ্নের ভাণ্ডার · প্রতিবার নতুন সেট';
    startScreen();
    renderBoard();
    var clr = document.getElementById('lbClear');
    if (clr) clr.addEventListener('click', function () {
      try { localStorage.removeItem(LS_SCORES); } catch (e) {}
      state.lastId = null;
      renderBoard();
    });
    // #leaderboard সরাসরি খুললে সেখানে স্ক্রল
    if (location.hash === '#leaderboard') {
      var el = document.getElementById('leaderboard');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  }).catch(function (err) {
    shell.innerHTML = '<p class="cb-sub">প্রশ্ন-ব্যাংক লোড করা যায়নি (' + esc(err.message) + ')।</p>';
  });
})();
