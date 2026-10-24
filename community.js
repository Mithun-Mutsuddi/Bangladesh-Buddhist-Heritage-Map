/* চর্যাভূমি — কমিউনিটি হাব, সাউন্ডস্কেপ ও অডিও গাইড (§৯) */
(function () {
  'use strict';
  if (!window.MX) return;
  MX.trackLocal('community.html');

  /* ---------- জেনারেটিভ সাউন্ডস্কেপ (Web Audio) ---------- */
  var actx = null, master = null, timers = [];
  function ensureAudio() {
    if (!actx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      actx = new AC();
      master = actx.createGain();
      master.gain.value = (+MX.$('soundVol').value) / 100 * 0.7;
      master.connect(actx.destination);
    }
    if (actx.state === 'suspended') actx.resume();
    return actx;
  }
  function stopAllSounds() {
    timers.forEach(function (t) { clearInterval(t); clearTimeout(t); });
    timers = [];
    if (actx) { actx.close(); actx = null; master = null; }
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    MX.$('soundStatus').textContent = 'সব শব্দ বন্ধ করা হয়েছে।';
  }
  function bellTone() {
    if (!actx) return;
    var t = actx.currentTime;
    [196, 294, 392, 523].forEach(function (f, i) {
      var o = actx.createOscillator(), g = actx.createGain();
      o.type = 'sine'; o.frequency.value = f;
      g.gain.setValueAtTime(0.24 / (i + 1), t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 4.2);
      o.connect(g); g.connect(master);
      o.start(t); o.stop(t + 4.3);
    });
  }
  function noiseBuffer(seconds) {
    var len = actx.sampleRate * seconds;
    var buf = actx.createBuffer(1, len, actx.sampleRate);
    var ch = buf.getChannelData(0);
    for (var i = 0; i < len; i++) ch[i] = Math.random() * 2 - 1;
    return buf;
  }
  function playRain() {
    var src = actx.createBufferSource(); src.buffer = noiseBuffer(3); src.loop = true;
    var f = actx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 900;
    var g = actx.createGain(); g.gain.value = 0.16;
    src.connect(f); f.connect(g); g.connect(master); src.start();
  }
  function chirp() {
    if (!actx) return;
    var t = actx.currentTime;
    var base = 2200 + Math.random() * 1400;
    var o = actx.createOscillator(), g = actx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(base, t);
    o.frequency.exponentialRampToValueAtTime(base * 1.35, t + 0.09);
    o.frequency.exponentialRampToValueAtTime(base * 0.9, t + 0.2);
    g.gain.setValueAtTime(0.12, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.3);
  }
  document.querySelectorAll('[data-sound]').forEach(function (b) {
    b.addEventListener('click', function () {
      if (!ensureAudio()) { MX.toast('এই ব্রাউজারে Web Audio চলে না'); return; }
      var kind = b.dataset.sound;
      if (kind === 'bell') { bellTone(); timers.push(setInterval(bellTone, 6000)); }
      if (kind === 'rain') playRain();
      if (kind === 'birds') { chirp(); timers.push(setInterval(function () { chirp(); if (Math.random() > 0.5) setTimeout(chirp, 280); }, 1600)); }
      MX.$('soundStatus').textContent = 'বাজছে: ' + b.closest('.mx-card').querySelector('h3').textContent + ' — থামাতে নিচের বোতাম।';
    });
  });
  MX.$('soundStop').addEventListener('click', stopAllSounds);
  MX.$('soundVol').addEventListener('input', function () { if (master) master.gain.value = (+this.value) / 100 * 0.7; });
  MX.$('chantBtn').addEventListener('click', function () {
    MX.speak('নমো তস্স ভগবতো অরহতো সম্মা সম্বুদ্ধস্স। নমো তস্স ভগবতো অরহতো সম্মা সম্বুদ্ধস্স। নমো তস্স ভগবতো অরহতো সম্মা সম্বুদ্ধস্স। বুদ্ধং সরণং গচ্ছামি। ধম্মং সরণং গচ্ছামি। সঙ্ঘং সরণং গচ্ছামি।', 'bn-BD');
  });

  /* ---------- অডিও গাইড ---------- */
  var atlasSites = [];
  Promise.all([
    MX.fetchJson('data/atlas-sites.json?v=20261024g')
  ]).then(function (res) {
    atlasSites = res[0].sites || [];
    var opts = atlasSites.map(function (s) { return '<option value="' + MX.esc(s.id) + '">' + MX.esc(s.name.bn) + '</option>'; }).join('');
    MX.$('audioSite').innerHTML = opts;
    MX.$('postSite').innerHTML = '<option value="">সাধারণ (স্থান-নির্দিষ্ট নয়)</option>' + opts;
    updateTranscript();
    renderYouTube();
  }).catch(function () { /* ignore */ });

  function currentGuide() {
    var s = atlasSites.filter(function (x) { return x.id === MX.$('audioSite').value; })[0];
    if (!s) return null;
    var lang = MX.$('audioLang').value;
    return { site: s, text: (s.audio && (s.audio[lang] || s.audio.bn)) || (s.summary && s.summary.bn) || '', lang: lang };
  }
  function updateTranscript() {
    var g = currentGuide();
    if (g) MX.$('audioText').textContent = g.text;
  }
  MX.$('audioSite').addEventListener('change', updateTranscript);
  MX.$('audioLang').addEventListener('change', updateTranscript);
  MX.$('audioPlay').addEventListener('click', function () {
    var g = currentGuide(); if (!g) return;
    MX.speak(g.text, g.lang === 'en' ? 'en-US' : 'bn-BD');
  });
  MX.$('audioStop').addEventListener('click', function () { if ('speechSynthesis' in window) speechSynthesis.cancel(); });

  /* ---------- ইউটিউব সার্চ কার্ড ---------- */
  function renderYouTube() {
    var topics = [
      { t: 'পাহাড়পুর ডকুমেন্টারি', q: 'Paharpur Somapura Mahavihara documentary' },
      { t: 'ময়নামতি ও শালবন বিহার', q: 'Mainamati Shalban Vihara Cumilla documentary' },
      { t: 'মহাস্থানগড় প্রত্নতত্ত্ব', q: 'Mahasthangarh archaeology Bogura documentary' },
      { t: 'বাংলাদেশে বৌদ্ধ ঐতিহ্য সংরক্ষণ', q: 'Buddhist heritage conservation Bangladesh UNESCO' },
      { t: 'খননকাজ ও প্রত্নতাত্ত্বিক সাক্ষাৎকার', q: 'excavation archaeology Bangladesh vihara interview' },
      { t: 'বুদ্ধ পূর্ণিমা বাংলাদেশ', q: 'Buddha Purnima celebration Bangladesh' }
    ];
    MX.$('ytGrid').innerHTML = topics.map(function (x) {
      return '<article class="mx-card"><h3>▶️ ' + MX.esc(x.t) + '</h3><p class="mx-meta">YouTube অনুসন্ধান: “' + MX.esc(x.q) + '”</p>' +
        '<div class="mx-btns"><a class="cb-btn sm" target="_blank" rel="noopener" href="' + MX.youtubeSearch(x.q) + '">ভিডিও দেখুন ↗</a>' +
        '<a class="cb-btn sm ghost" target="_blank" rel="noopener" href="' + MX.youtubeSearch(x.q + ' playlist') + '">প্লেলিস্ট খুঁজুন ↗</a></div></article>';
    }).join('');
  }

  /* ---------- লোকাল কমিউনিটি পোস্ট ---------- */
  var POST_KEY = 'cb.community.v1', BLOG_KEY = 'cb.community.blogs.v1';
  function posts() { return MX.getLocal(POST_KEY, []); }
  function savePosts(p) { MX.setLocal(POST_KEY, p); }
  function siteLabel(id) {
    var s = atlasSites.filter(function (x) { return x.id === id; })[0];
    return s ? s.name.bn : 'সাধারণ';
  }
  function renderFeed() {
    var list = posts();
    MX.$('postFeed').innerHTML = list.length ? list.map(function (p, i) {
      var photoOk = p.photo && /^https:\/\//i.test(p.photo);
      return '<article class="mx-card">' + (photoOk ? '<img class="mx-gallery-thumb" loading="lazy" src="' + MX.esc(p.photo) + '" alt="কমিউনিটি ছবি">' : '') +
        '<p style="white-space:pre-wrap">' + MX.esc(p.text) + '</p>' +
        '<p class="mx-meta">— ' + MX.esc(p.name || 'নামহীন ভ্রমণকারী') + ' · 📍 ' + MX.esc(siteLabel(p.site)) + ' · ' + MX.esc(p.date) + ' · #BDHeritageMap</p>' +
        '<div class="mx-btns"><button type="button" class="cb-btn sm" data-share-post="' + i + '">📋 শেয়ার-টেক্সট কপি</button>' +
        '<button type="button" class="cb-btn sm ghost" data-del-post="' + i + '">মুছুন</button></div></article>';
    }).join('') : '<p class="mx-meta">এখনো কোনো পোস্ট নেই — প্রথমটি লিখুন!</p>';
    document.querySelectorAll('[data-share-post]').forEach(function (b) {
      b.addEventListener('click', function () {
        var p = posts()[+b.dataset.sharePost];
        if (p) MX.copyText(p.text + '\n— ' + (p.name || '') + ' · ' + siteLabel(p.site) + ' #BDHeritageMap', 'শেয়ার-টেক্সট কপি হয়েছে — নিজের সোশ্যাল অ্যাপে পেস্ট করুন');
      });
    });
    document.querySelectorAll('[data-del-post]').forEach(function (b) {
      b.addEventListener('click', function () {
        var p = posts(); p.splice(+b.dataset.delPost, 1); savePosts(p); renderFeed();
      });
    });
  }
  MX.$('postForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var text = MX.$('postText').value.trim();
    var photo = MX.$('postPhoto').value.trim();
    if (!text) return;
    if (photo && !MX.$('postConsent').checked) { MX.toast('ছবিসহ পোস্ট করতে সম্মতির ঘরে টিক দিন'); return; }
    if (photo && !/^https:\/\//i.test(photo)) { MX.toast('ছবির লিংক https:// দিয়ে শুরু হতে হবে'); return; }
    var p = posts();
    p.unshift({
      name: MX.$('postName').value.trim().slice(0, 40),
      site: MX.$('postSite').value, text: text.slice(0, 800), photo: photo,
      date: new Date().toISOString().slice(0, 10)
    });
    savePosts(p.slice(0, 100));
    MX.$('postText').value = ''; MX.$('postPhoto').value = ''; MX.$('postConsent').checked = false;
    renderFeed();
    MX.toast('আপনার হাবে যোগ হয়েছে — শেয়ার-টেক্সট কপি করে #BDHeritageMap-এ ছড়িয়ে দিন');
  });
  MX.$('postExport').addEventListener('click', function () {
    MX.download('my-bdheritagemap-posts.json', JSON.stringify(posts(), null, 2), 'application/json');
  });

  /* ব্লগ লিংক বুকমার্ক */
  function renderBlogs() {
    var list = MX.getLocal(BLOG_KEY, []);
    MX.$('blogLinkList').innerHTML = list.map(function (u, i) {
      return '<li><a href="' + MX.esc(u) + '" target="_blank" rel="noopener">' + MX.esc(u) + ' ↗</a> <button type="button" class="cb-mini-btn" data-del-blog="' + i + '">মুছুন</button></li>';
    }).join('');
    document.querySelectorAll('[data-del-blog]').forEach(function (b) {
      b.addEventListener('click', function () {
        var l = MX.getLocal(BLOG_KEY, []); l.splice(+b.dataset.delBlog, 1); MX.setLocal(BLOG_KEY, l); renderBlogs();
      });
    });
  }
  MX.$('blogLinkAdd').addEventListener('click', function () {
    var v = MX.$('blogLinkInput').value.trim();
    if (!/^https?:\/\//i.test(v)) { MX.toast('সঠিক লিংক (https://…) দিন'); return; }
    var l = MX.getLocal(BLOG_KEY, []); l.unshift(v); MX.setLocal(BLOG_KEY, l.slice(0, 30));
    MX.$('blogLinkInput').value = ''; renderBlogs();
  });

  renderFeed(); renderBlogs();
})();
