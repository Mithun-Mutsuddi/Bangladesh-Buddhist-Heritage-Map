/* চর্যাভূমি — Heritage Lab (§১১): তুলনা, সার্টিফিকেট, লোকাল অ্যানালিটিক্স */
(function () {
  'use strict';
  if (!window.MX) return;
  MX.trackLocal('heritage-lab.html');

  /* ---------- বিশ্ব তুলনা ---------- */
  function drawCompare(places) {
    var c = MX.$('compareCanvas'); if (!c) return;
    var ctx = c.getContext('2d');
    var W = c.width, H = c.height, base = H - 70, top = 82;
    ctx.clearRect(0, 0, W, H);
    ctx.font = '15px "Noto Sans Bengali", sans-serif';
    var vals = places.map(function (p) { return p.area_ha || 0; });
    var max = Math.max.apply(null, vals.concat([10]));
    var bw = (W - 120) / places.length;
    ctx.strokeStyle = '#b9a888';
    for (var g = 0; g <= 4; g++) {
      var v = max * g / 4, y = base - (v / max) * (base - top);
      ctx.beginPath(); ctx.moveTo(70, y); ctx.lineTo(W - 16, y); ctx.stroke();
      ctx.fillStyle = '#7b6a5d'; ctx.fillText(MX.bn(v.toFixed(0)) + ' হে.', 6, y + 5);
    }
    var cols = ['#8f3d08', '#1d5c4f', '#2b6cb0', '#d99b2b'];
    places.forEach(function (p, i) {
      var x = 84 + i * bw;
      ctx.font = '15px "Noto Sans Bengali", sans-serif';
      if (p.area_ha) {
        var h = (p.area_ha / max) * (base - top);
        ctx.fillStyle = cols[i % cols.length];
        ctx.fillRect(x, base - h, bw - 30, h);
        ctx.fillStyle = '#2a1f19';
        ctx.fillText('≈' + MX.bn(String(p.area_ha)) + ' হেক্টর', x, base - h - 10);
        if (p.cells) ctx.fillText(MX.bn(String(p.cells)) + ' কক্ষ', x, base - h - 30);
      } else {
        ctx.fillStyle = '#7b6a5d';
        ctx.fillText('আয়তন যাচাইসাপেক্ষ', x, base - 14);
        if (p.cells) ctx.fillText(MX.bn(String(p.cells)) + ' কক্ষ (≈)', x, base - 34);
      }
      ctx.save();
      ctx.translate(x + 2, base + 12); ctx.rotate(0.25);
      ctx.fillStyle = '#5b4a3f'; ctx.font = '13.5px "Noto Sans Bengali", sans-serif';
      ctx.fillText(p.name_bn.split('(')[0].trim(), 0, 12);
      ctx.restore();
    });
    ctx.fillStyle = '#123f39'; ctx.font = '16px "Noto Sans Bengali", sans-serif';
    ctx.fillText('খননকৃত/ঘোষিত পরিসরের তুলনা — উৎস ও সতর্কতা নিচের সারণিতে', 84, 26);
  }

  /* ---------- সার্টিফিকেট ---------- */
  function passportInfo() {
    var p = MX.getLocal('charyabhumiAtlasPassportV1', { name: '', stamps: {} });
    var stamps = p.stamps ? Object.keys(p.stamps).filter(function (k) { return p.stamps[k]; }) : [];
    return { name: p.name || '', count: stamps.length, ids: stamps };
  }
  function gameInfo() {
    var g = MX.getLocal('cb.gamesplus.v1', { xp: 0, badges: [] });
    return { xp: g.xp || 0, badges: (g.badges || []).length };
  }
  function simpleHash(str) {
    var h = 5381;
    for (var i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) >>> 0;
    return ('00000000' + h.toString(16)).slice(-8).toUpperCase();
  }
  function renderCertProgress() {
    var p = passportInfo(), g = gameInfo();
    var pct = Math.round(p.count / 12 * 100);
    MX.$('certProgress').innerHTML =
      '<p>🛂 Atlas পাসপোর্ট স্ট্যাম্প: <b>' + MX.bn(p.count) + ' / ১২</b> (' + MX.bn(pct) + '%)</p>' +
      '<div class="mx-xpbar"><i style="width:' + pct + '%"></i></div>' +
      '<p>🎮 গেম XP: <b>' + MX.bn(g.xp) + '</b> · ব্যাজ: <b>' + MX.bn(g.badges) + '</b>টি</p>' +
      '<p>' + (p.count >= 12
        ? '🌟 অভিনন্দন! আপনি <b>পূর্ণ তীর্থযাত্রী</b> সার্টিফিকেটের যোগ্য।'
        : 'আরও <b>' + MX.bn(12 - p.count) + '</b>টি স্ট্যাম্প পেলে পূর্ণ সার্টিফিকেট মিলবে — এখন অগ্রগতি-স্মারক তৈরি হবে।') + '</p>';
    if (p.name && !MX.$('certName').value) MX.$('certName').value = p.name;
  }
  function drawCertificate() {
    var c = MX.$('certCanvas'); if (!c) return null;
    var ctx = c.getContext('2d');
    var p = passportInfo(), g = gameInfo();
    var name = MX.$('certName').value.trim() || p.name || 'ঐতিহ্য অভিযাত্রী';
    var full = p.count >= 12;
    var date = new Date();
    var code = 'CB-' + simpleHash(name + '|' + p.count + '|' + g.xp + '|' + date.toISOString().slice(0, 10));
    /* পটভূমি */
    var grad = ctx.createLinearGradient(0, 0, 1200, 850);
    grad.addColorStop(0, '#fffdf7'); grad.addColorStop(1, '#f7ecd2');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, 1200, 850);
    ctx.strokeStyle = '#8f3d08'; ctx.lineWidth = 10; ctx.strokeRect(24, 24, 1152, 802);
    ctx.strokeStyle = '#d99b2b'; ctx.lineWidth = 3; ctx.strokeRect(46, 46, 1108, 758);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#123f39';
    ctx.font = '64px "Noto Sans Bengali", sans-serif';
    ctx.fillText('☸', 600, 150);
    ctx.font = '700 46px "Noto Sans Bengali", sans-serif';
    ctx.fillText('চর্যাভূমি ঐতিহ্য-পাস', 600, 225);
    ctx.font = '26px "Noto Sans Bengali", sans-serif';
    ctx.fillStyle = '#8f3d08';
    ctx.fillText(full ? 'পূর্ণ তীর্থযাত্রী সার্টিফিকেট' : 'ঐতিহ্য অভিযাত্রী অগ্রগতি-স্মারক', 600, 275);
    ctx.fillStyle = '#2a1f19';
    ctx.font = '22px "Noto Sans Bengali", sans-serif';
    ctx.fillText('এই স্মারকটি দেওয়া হলো', 600, 350);
    ctx.font = '700 52px "Noto Sans Bengali", sans-serif';
    ctx.fillStyle = '#123f39';
    ctx.fillText(name.slice(0, 34), 600, 425);
    ctx.strokeStyle = '#d99b2b'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(320, 452); ctx.lineTo(880, 452); ctx.stroke();
    ctx.font = '24px "Noto Sans Bengali", sans-serif';
    ctx.fillStyle = '#2a1f19';
    ctx.fillText('Atlas পাসপোর্ট স্ট্যাম্প: ' + p.count + ' / 12   ·   গেম XP: ' + g.xp + '   ·   ব্যাজ: ' + g.badges, 600, 515);
    ctx.font = '20px "Noto Sans Bengali", sans-serif';
    ctx.fillText('“হাজার বছরের পথ ধরে” — বাংলাদেশের বৌদ্ধ ঐতিহ্য জানা ও রক্ষার যাত্রায় অংশ নেওয়ার জন্য ধন্যবাদ।', 600, 565);
    ctx.font = '17px "Noto Sans Bengali", sans-serif';
    ctx.fillStyle = '#7b6a5d';
    ctx.fillText('তারিখ: ' + date.toISOString().slice(0, 10) + '   ·   যাচাই-কোড: ' + code + '   ·   charyabhumi · Bangladesh Buddhist Heritage Map', 600, 700);
    ctx.fillText('স্ট্যাম্প প্রমাণ-প্রশ্নের পুরস্কার — শারীরিক ভ্রমণের সরকারি প্রমাণ নয়। এই স্মারক এই ডিভাইসেই তৈরি; কোনো তথ্য সার্ভারে যায়নি।', 600, 738);
    /* সিল */
    ctx.beginPath(); ctx.arc(990, 640, 78, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(217,155,43,0.20)'; ctx.fill();
    ctx.strokeStyle = '#b5571f'; ctx.lineWidth = 3; ctx.stroke();
    ctx.font = '44px sans-serif'; ctx.fillStyle = '#8f3d08';
    ctx.fillText('☸', 990, 655);
    return { code: code, name: name };
  }

  /* ---------- লোকাল অ্যানালিটিক্স ---------- */
  function renderAnalytics() {
    var a = MX.getLocal('cb.analytics.local.v1', { views: {} });
    var entries = Object.keys(a.views).map(function (k) { return [k, a.views[k]]; }).sort(function (x, y) { return y[1] - x[1]; });
    var p = passportInfo();
    var budget = null;
    try { budget = JSON.parse(localStorage.getItem('cb.budget.last') || 'null'); } catch (e) { budget = null; }
    MX.$('analyticsOut').innerHTML = '<div class="mx-grid">' +
      '<article class="mx-card"><h3>' + MX.bn(entries.reduce(function (s, e) { return s + e[1]; }, 0)) + '</h3><p>নতুন পাতাগুলোতে মোট দর্শন (এই ডিভাইসে)</p></article>' +
      '<article class="mx-card"><h3>' + MX.bn(p.count) + ' / ১২</h3><p>Atlas পাসপোর্ট স্ট্যাম্প — কোন স্থানে আগ্রহ বেশি, তার ব্যক্তিগত ছাপ</p></article>' +
      '<article class="mx-card"><h3>' + (budget ? MX.money(budget.total) : '—') + '</h3><p>সর্বশেষ বাজেট-হিসাব ' + (budget ? '(' + MX.esc(String(budget.at).slice(0, 10)) + ')' : '(ক্যালকুলেটর ব্যবহার করেননি)') + '</p></article>' +
      '</div>' + (entries.length ? '<div class="mx-scroll"><table class="mx-table"><thead><tr><th>পাতা</th><th>দর্শন</th></tr></thead><tbody>' +
        entries.map(function (e) { return '<tr><td>' + MX.esc(e[0]) + '</td><td>' + MX.bn(e[1]) + '</td></tr>'; }).join('') + '</tbody></table></div>'
        : '<p class="mx-meta">এখনো গোনা দর্শন নেই — নতুন পাতাগুলো ঘুরলে এখানে হিসাব জমবে।</p>');

    var c = MX.$('analyticsCanvas'); if (!c) return;
    var ctx = c.getContext('2d');
    var W = c.width, H = c.height, base = H - 60, top = 36;
    ctx.clearRect(0, 0, W, H);
    ctx.font = '14px "Noto Sans Bengali", sans-serif';
    var topN = entries.slice(0, 10);
    if (!topN.length) { ctx.fillStyle = '#7b6a5d'; ctx.fillText('পর্যাপ্ত ডেটা নেই', 40, 80); return; }
    var max = Math.max.apply(null, topN.map(function (e) { return e[1]; }).concat([1]));
    var bw = (W - 80) / topN.length;
    topN.forEach(function (e, i) {
      var x = 50 + i * bw, h = (e[1] / max) * (base - top);
      ctx.fillStyle = '#1d5c4f'; ctx.fillRect(x, base - h, bw - 14, h);
      ctx.fillStyle = '#2a1f19'; ctx.fillText(MX.bn(e[1]), x, base - h - 8);
      ctx.save(); ctx.translate(x + 2, base + 8); ctx.rotate(0.3);
      ctx.fillStyle = '#5b4a3f'; ctx.fillText(e[0].replace('.html', ''), 0, 12); ctx.restore();
    });
    ctx.fillStyle = '#123f39'; ctx.fillText('পাতাভিত্তিক দর্শন (এই ডিভাইস)', 50, 24);
  }

  /* ---------- টেক স্থিতি ---------- */
  function renderTech() {
    var cfg = window.CHARYABHUMI_CONFIG || {};
    function row(name, ok, detail) {
      return '<tr><td><b>' + name + '</b></td><td><span class="mx-badge ' + (ok ? 'green' : 'gold') + '">' + (ok ? 'সক্রিয়/প্রস্তুত' : 'বন্ধ/কনফিগ বাকি') + '</span></td><td>' + detail + '</td></tr>';
    }
    var redCount = MX.getLocal('cb.fieldreports.v1', []).length;
    MX.$('techStatus').innerHTML = '<div class="mx-scroll"><table class="mx-table"><thead><tr><th>উপাদান</th><th>অবস্থা</th><th>ব্যাখ্যা</th></tr></thead><tbody>' +
      row('সংঘমিত্র অনলাইন AI', !!cfg.sanghamitraApiUrl, cfg.sanghamitraApiUrl ? 'Endpoint কনফিগার করা' : 'স্থানীয় মোড; config.js-এ endpoint বসান, সার্ভারে Gemini/OpenAI কী দিন') +
      row('Google Analytics 4', !!cfg.gaMeasurementId, cfg.gaMeasurementId ? 'GA লোড হবে' : 'বন্ধ (ডিফল্ট); config.js-এ Measurement ID দিলে চালু') +
      row('Google Maps JS API key', !!cfg.googleMapsApiKey, 'Embed/link মোডে কী লাগে না; বসালে referrer-restriction দিতে হবে') +
      row('Firebase / Supabase', !!(cfg.firebaseConfig || cfg.supabase), 'রিপোর্ট বর্তমানে লোকাল কিউ + JSON এক্সপোর্টে; ব্যাকএন্ড বসাতে firestore.rules মেনে স্কিমা অনুসরণ করুন') +
      row('Service Worker (অফলাইন)', 'serviceWorker' in navigator, 'HTTPS-এ হোস্ট হলে নিবন্ধন হয়') +
      row('বিজ্ঞাপন (AdSense)', !!cfg.adsenseClient, 'নীতি অনুযায়ী ডিফল্ট বন্ধ — support.html#sponsor') +
      '</tbody></table></div>';
    MX.$('fieldQueueInfo').innerHTML = '<div class="mx-note">এই ব্রাউজারে খসড়া ফিল্ড-রিপোর্ট: <b>' + MX.bn(redCount) + 'টি</b>। ব্যাকএন্ড (Firebase/Supabase) যুক্ত না হওয়া পর্যন্ত রিপোর্টগুলো JSON এক্সপোর্ট করে প্রত্নতত্ত্ব অধিদপ্তর/জেলা প্রশাসনকে পাঠান। জরুরি ক্ষতি/লুটপাটে অপেক্ষা না করে <b>৯৯৯</b>-এ ফোন করুন।</div>';
    MX.$('pwaStatus').textContent = window.matchMedia('(display-mode: standalone)').matches ? 'ইনস্টল করা অবস্থায় চলছে ✓' : 'ব্রাউজার প্রম্পট এলে বোতাম কাজ করবে';
  }

  MX.fetchJson('data/research-plus.json?v=20261024f').then(function (R) {
    var W = R.world_comparison;
    MX.$('compareNote').innerHTML = '<div class="mx-note">যাচাই তারিখ: ' + MX.esc(W.checked_at) + ' · ' + MX.esc(W.note_bn) + '</div>';
    drawCompare(W.places);
    MX.$('compareTable').innerHTML = '<div class="mx-scroll"><table class="mx-table"><thead><tr><th>স্থান</th><th>কাল</th><th>পরিসর (≈হেক্টর)</th><th>ভিক্ষু-কক্ষ</th><th>পরিকল্পনা</th><th>UNESCO</th><th>টীকা ও উৎস</th></tr></thead><tbody>' +
      W.places.map(function (p) {
        return '<tr><td><b>' + MX.esc(p.name_bn) + '</b></td><td>' + MX.esc(p.period) + '</td><td>' + (p.area_ha ? MX.bn(String(p.area_ha)) : 'যাচাইসাপেক্ষ') + '</td><td>' + (p.cells ? MX.bn(String(p.cells)) : '—') + '</td><td>' + MX.esc(p.plan) + '</td><td>' + MX.esc(p.unesco) + '</td><td>' + MX.esc(p.approx_note) + ' <a href="' + MX.esc(p.source_url) + '" target="_blank" rel="noopener">মূল ↗</a></td></tr>';
      }).join('') + '</tbody></table></div>';
  }).catch(function () {
    MX.$('compareNote').innerHTML = '<p class="mx-meta">তুলনার ডেটা লোড হয়নি।</p>';
  });

  renderCertProgress();
  drawCertificate();
  renderAnalytics();
  renderTech();

  MX.$('certName').addEventListener('input', drawCertificate);
  MX.$('certMake').addEventListener('click', function () {
    var r = drawCertificate();
    var c = MX.$('certCanvas');
    if (c.toBlob) {
      c.toBlob(function (blob) {
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'charyabhumi-certificate-' + (r ? r.code : 'pass') + '.png';
        document.body.appendChild(a); a.click(); a.remove();
        MX.toast('সার্টিফিকেট PNG ডাউনলোড হচ্ছে');
      }, 'image/png');
    } else {
      window.open(c.toDataURL('image/png'), '_blank');
    }
  });
  MX.$('analyticsClear').addEventListener('click', function () {
    try { localStorage.removeItem('cb.analytics.local.v1'); } catch (e) { /* ignore */ }
    renderAnalytics(); MX.toast('লোকাল অ্যানালিটিক্স মোছা হয়েছে');
  });
  MX.$('fieldExportAll').addEventListener('click', function () {
    var atlasDrafts = MX.getLocal('charyabhumiAtlasFieldDraftsV1', []);
    MX.download('all-field-reports.json', JSON.stringify({
      exported_at: new Date().toISOString(),
      redlist_reports: MX.getLocal('cb.fieldreports.v1', []),
      atlas_field_drafts: atlasDrafts
    }, null, 2), 'application/json');
  });
  MX.$('pwaInstallBtn').addEventListener('click', function () {
    if (window.__cbInstallPrompt) {
      window.__cbInstallPrompt.prompt();
    } else {
      MX.toast('ব্রাউজারের মেনু থেকে “Install app / Add to Home screen” বেছে নিন');
    }
  });
  document.addEventListener('cb-install-available', function () {
    MX.$('pwaStatus').textContent = 'ইনস্টল প্রস্তুত — বোতামে চাপ দিন ✓';
  });
})();
