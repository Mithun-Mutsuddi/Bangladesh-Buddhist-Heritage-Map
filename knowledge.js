/* চর্যাভূমি — জ্ঞানকোষ (§৪, §৫, §৬) */
(function () {
  'use strict';
  if (!window.MX) return;
  MX.trackLocal('knowledge.html');

  /* ---------- ট্যাব ---------- */
  var tabBtns = Array.prototype.slice.call(document.querySelectorAll('[data-tab]'));
  function openTab(id) {
    tabBtns.forEach(function (b) { b.setAttribute('aria-selected', b.dataset.tab === id ? 'true' : 'false'); });
    document.querySelectorAll('.mx-tabpage').forEach(function (p) { p.hidden = p.id !== 'tab-' + id; });
    if (history.replaceState) history.replaceState(null, '', '#' + id);
  }
  tabBtns.forEach(function (b) { b.addEventListener('click', function () { openTab(b.dataset.tab); }); });
  var hashMap = { epigraphy: 'epigraphy', charya: 'charya', iconography: 'iconography', cosmology: 'cosmology', architecture: 'archlife', coins: 'coins', pilgrims: 'pilgrims', society: 'society', paper: 'paper' };
  if (hashMap[location.hash.slice(1)]) openTab(hashMap[location.hash.slice(1)]);

  /* ---------- ব্রাহ্মী খেলনা রূপান্তরক ---------- */
  var CP = {
    a: 0x11005, aa: 0x11006, i: 0x11007, ii: 0x11008, u: 0x11009, uu: 0x1100A, e: 0x1100F, ai: 0x11010, o: 0x11011, au: 0x11012,
    k: 0x11013, kh: 0x11014, g: 0x11015, gh: 0x11016, ng: 0x11017, c: 0x11018, ch: 0x11018, chh: 0x11019,
    j: 0x1101A, jh: 0x1101B, ny: 0x1101C, T: 0x1101D, Th: 0x1101E, D: 0x1101F, Dh: 0x11020, N: 0x11021,
    t: 0x11022, th: 0x11023, d: 0x11024, dh: 0x11025, n: 0x11026, p: 0x11027, ph: 0x11028, f: 0x11028,
    b: 0x11029, bh: 0x1102A, m: 0x1102B, y: 0x1102C, r: 0x1102D, l: 0x1102E, v: 0x1102F, w: 0x1102F,
    sh: 0x11030, S: 0x11031, s: 0x11032, h: 0x11033
  };
  var BN2LAT = { 'অ': 'a', 'আ': 'aa', 'ই': 'i', 'ঈ': 'ii', 'উ': 'u', 'ঊ': 'uu', 'এ': 'e', 'ঐ': 'ai', 'ও': 'o', 'ঔ': 'au', 'ক': 'k', 'খ': 'kh', 'গ': 'g', 'ঘ': 'gh', 'ঙ': 'ng', 'চ': 'c', 'ছ': 'chh', 'জ': 'j', 'ঝ': 'jh', 'ঞ': 'ny', 'ট': 'T', 'ঠ': 'Th', 'ড': 'D', 'ঢ': 'Dh', 'ণ': 'N', 'ত': 't', 'থ': 'th', 'দ': 'd', 'ধ': 'dh', 'ন': 'n', 'প': 'p', 'ফ': 'ph', 'ব': 'b', 'ভ': 'bh', 'ম': 'm', 'য': 'j', 'র': 'r', 'ল': 'l', 'শ': 'sh', 'ষ': 'S', 'স': 's', 'হ': 'h', 'য়': 'y', 'ড়': 'D', 'ঢ়': 'Dh' };
  var BN_SKIPS = 'ািীুূেৈোৌ্‌্ংঃঁৃ';
  function toBrahmi(raw) {
    var s = String(raw || '').trim();
    var lat = '';
    for (var i = 0; i < s.length; i++) {
      var ch = s[i];
      if (BN2LAT[ch]) lat += BN2LAT[ch] + 'a';
      else if (BN_SKIPS.indexOf(ch) > -1) { /* মাত্রা/হলন্ত এই খেলনা-রূপে বাদ */ }
      else lat += ch.toLowerCase();
    }
    lat = lat.replace(/aa+/g, 'a');
    var out = '', j = 0;
    var keys = Object.keys(CP).sort(function (a, b) { return b.length - a.length; });
    while (j < lat.length) {
      var matched = null;
      for (var k = 0; k < keys.length; k++) {
        if (lat.substr(j, keys[k].length) === keys[k]) { matched = keys[k]; break; }
      }
      if (matched) { out += String.fromCodePoint(CP[matched]); j += matched.length; }
      else if (lat[j] === ' ') { out += '  '; j++; }
      else j++;
    }
    return out;
  }
  function brahmiRun() {
    var v = MX.$('brahmiInput').value;
    MX.$('brahmiOut').textContent = toBrahmi(v);
  }
  MX.$('brahmiInput').addEventListener('input', brahmiRun);
  document.querySelectorAll('[data-brahmi-demo]').forEach(function (b) {
    b.addEventListener('click', function () { MX.$('brahmiInput').value = b.dataset.brahmiDemo; brahmiRun(); });
  });

  /* ---------- ডেটা রেন্ডার ---------- */
  function table(headers, rows) {
    return '<div class="mx-scroll"><table class="mx-table"><thead><tr>' +
      headers.map(function (h) { return '<th>' + MX.esc(h) + '</th>'; }).join('') + '</tr></thead><tbody>' +
      rows.map(function (r) { return '<tr>' + r.map(function (c) { return '<td>' + c + '</td>'; }).join('') + '</tr>'; }).join('') +
      '</tbody></table></div>';
  }
  var searchIndex = [];
  function indexAdd(title, tab, text) { searchIndex.push({ title: title, tab: tab, text: (title + ' ' + (text || '')).toLowerCase() }); }

  MX.fetchJson('data/heritage-knowledge.json?v=20261024g').then(function (K) {
    /* লিপি */
    MX.$('epiIntro').innerHTML = '<p class="cb-sub">' + MX.esc(K.epigraphy.intro) + '</p>';
    MX.$('scriptGrid').innerHTML = K.epigraphy.scripts.map(function (s) {
      indexAdd('লিপি: ' + s.name, 'epigraphy', s.period + ' ' + s.note);
      return '<article class="mx-card"><h3>' + MX.esc(s.name) + '</h3><p class="mx-meta">' + MX.esc(s.period) + '</p><p>' + MX.esc(s.note) + '</p><p style="font-size:24px">' + MX.esc(s.sample) + '</p></article>';
    }).join('');
    MX.$('plateList').innerHTML = K.epigraphy.plates.map(function (p) {
      indexAdd(p.name, 'epigraphy', p.summary);
      return '<article class="mx-card" style="margin-bottom:14px"><h3>' + MX.esc(p.name) + ' <span class="mx-badge gold">' + MX.esc(p.date) + '</span></h3>' +
        '<p class="mx-meta">লিপি: ' + MX.esc(p.script) + ' · ভাষা: ' + MX.esc(p.language) + ' · উৎস: ' + MX.esc(p.source) + '</p>' +
        '<p>' + MX.esc(p.summary) + '</p><p><b>অনুবাদ কোথায় পাবেন:</b> ' + MX.esc(p.translation_note) + '</p>' +
        '<div class="mx-btns"><a class="cb-btn sm" target="_blank" rel="noopener" href="' + MX.scholarLink(p.name + ' copper plate inscription') + '">Scholar-এ গবেষণা খুঁজুন ↗</a>' +
        '<a class="cb-btn sm ghost" target="_blank" rel="noopener" href="https://archive.org/search?query=' + encodeURIComponent(p.source) + '">আসল সংস্করণ (Archive) ↗</a>' +
        (p.site_id ? '<a class="cb-btn sm ghost" href="explore3d.html?site=' + p.site_id + '">স্থানটি 360°-তে</a>' : '') + '</div></article>';
    }).join('');
    MX.$('brahmiNote').textContent = K.epigraphy.brahmi_map_note;
    MX.$('sealTable').innerHTML = table(['বর্তমান নাম', 'সিলমোহর/প্রমাণ পাঠ', 'অনুমিত আসল নাম', 'ভিত্তি ও অবস্থা'],
      K.seals_names.map(function (x) {
        indexAdd('সিলমোহর: ' + x.modern_name, 'epigraphy', x.seal_legend_bn + ' ' + x.inferred_name);
        return [MX.esc(x.modern_name), MX.esc(x.seal_legend_bn), '<b>' + MX.esc(x.inferred_name) + '</b>', MX.esc(x.basis) + ' <span class="mx-badge blue">' + MX.esc(x.status) + '</span>'];
      }));

    /* চর্যাপদ */
    var C = K.charyapada;
    MX.$('charyaMain').innerHTML =
      '<div class="mx-card"><h3>চর্যাপদ কী?</h3><p>' + MX.esc(C.what) + '</p><h4>প্রমাণ-ধারাবাহিকতা</h4><ul>' +
      C.evidence.map(function (e) { return '<li>' + MX.esc(e) + '</li>'; }).join('') + '</ul>' +
      '<p class="mx-mini">' + MX.esc(C.map_note) + '</p>' +
      '<div class="mx-btns"><a class="cb-btn sm" href="https://archive.org/details/BouddhaGanODoha" target="_blank" rel="noopener">১৯১৬ সংস্করণ পড়ুন (Internet Archive) ↗</a><a class="cb-btn sm ghost" href="historical-archive.html">ঐতিহাসিক আর্কাইভ</a></div></div>' +
      '<h3 style="margin-top:22px">সিদ্ধাচার্যগণ: ছবির বদলে পরিচিতি</h3>' +
      '<p class="cb-sub">সিদ্ধাচার্যদের কোনো সমকালীন ছবি নেই — বইয়ের কাল্পনিক আঁকাকে ঐতিহাসিক ছবি বলে আমরা দিই না। নিচের প্রতীক-কার্ডে রচনা, কাল ও ভৌগোলিক সম্পর্ক (প্রমাণের মাত্রাসহ) দেওয়া।</p>' +
      '<div class="mx-grid wide">' + C.poets.map(function (p, i) {
        indexAdd(p.name, 'charya', p.works + ' ' + p.connection);
        var sym = ['🌊', '🔥', '🏹', '🐚', '⛰️', '☸'][i % 6];
        return '<article class="mx-card"><span class="mx-ico">' + sym + '</span><h3>' + MX.esc(p.name) + '</h3>' +
          '<p class="mx-meta">রচনাকাল (আনুমানিক): ' + MX.esc(p.period) + '</p><p><b>রচনা:</b> ' + MX.esc(p.works) + '</p>' +
          '<p><b>ভৌগোলিক সম্পর্ক:</b> ' + MX.esc(p.connection) + '</p>' +
          (p.famous_line !== '—' ? '<blockquote style="margin:8px 0;padding:8px 14px;border-left:4px solid var(--cb-gold);background:var(--cb-sand)">“' + MX.esc(p.famous_line) + '”</blockquote>' : '') +
          '</article>';
      }).join('') + '</div>';
    MX.$('paliTable').innerHTML = table(['পালি/প্রাকৃত রূপ', 'বাংলায় রূপ', 'টীকা'],
      K.pali_survivals.map(function (x) { indexAdd('পালি শব্দ: ' + x.pali, 'charya', x.bangla); return [MX.esc(x.pali), MX.esc(x.bangla), MX.esc(x.note)]; }));

    /* প্রতিমাতত্ত্ব */
    MX.$('iconGrid').innerHTML = K.iconography.map(function (x) {
      indexAdd(x.name, 'iconography', x.description);
      return '<article class="mx-card"><span class="mx-ico">' + x.symbol + '</span> <span class="mx-badge gold">' + MX.esc(x.kind) + '</span>' +
        '<h3>' + MX.esc(x.name) + '</h3><p>' + MX.esc(x.description) + '</p>' +
        '<p><b>চেনার উপায়:</b></p><ul>' + x.identify.map(function (i) { return '<li>' + MX.esc(i) + '</li>'; }).join('') + '</ul>' +
        '<div class="mx-btns"><a class="cb-btn sm ghost" target="_blank" rel="noopener" href="https://commons.wikimedia.org/wiki/Special:Search?search=' + encodeURIComponent(x.name + ' Pala Bengal sculpture') + '&type=image">নমুনা ছবি দেখুন ↗</a></div></article>';
    }).join('');

    /* স্বর্গ-নরক */
    var Z = K.cosmology;
    var colors = ['#6a4fb3', '#2b6cb0', '#d99b2b', '#1d5c4f', '#8a4b2a'];
    var planesHtml = '<div class="mx-planes">' + Z.groups.map(function (g, gi) {
      indexAdd(g.name, 'cosmology', g.karma);
      return '<div class="mx-plane" style="background:' + colors[gi % colors.length] + '">' + MX.esc(g.name) + ' · ' + MX.bn(g.count) + ' স্তর' +
        '<small>' + g.planes.map(MX.esc).join(' · ') + '</small></div>';
    }).join('') + '</div>';
    MX.$('cosmoMain').innerHTML =
      '<div class="mx-note">' + MX.esc(Z.disclaimer) + '</div>' +
      '<h3>এক নজরে ৩১ ভূমি (ওপর থেকে নিচে)</h3>' + planesHtml +
      '<div class="mx-scroll"><table class="mx-table"><thead><tr><th>ভূমি-গোষ্ঠী</th><th>কোন কর্মে সেখানে জন্ম (পরম্পরাগত বর্ণনা)</th></tr></thead><tbody>' +
      Z.groups.map(function (g) { return '<tr><td><b>' + MX.esc(g.name) + '</b></td><td>' + MX.esc(g.karma) + '</td></tr>'; }).join('') +
      '</tbody></table></div>' +
      '<div class="mx-ok"><h3 style="margin-top:0">🛕 বিমান কয়টি? কোন কর্মে কোন বিমান?</h3><p>' + MX.esc(Z.vimana_note) + '</p></div>' +
      '<h3>নরক (নিরয়) কয়টি ও কী কী?</h3><p class="cb-sub">' + MX.esc(Z.hells.intro) + '</p>' +
      table(['মহানিরয় (গভীর থেকে উপরে)', 'কোন কর্মের ফল বলে বর্ণিত'],
        Z.hells.items.map(function (x) { indexAdd('নরক: ' + x.name, 'cosmology', x.karma); return ['<b>' + MX.esc(x.name) + '</b>', MX.esc(x.karma)]; })) +
      '<h3>প্রেতলোকের শ্রেণি</h3><p class="cb-sub">' + MX.esc(Z.petas.intro) + '</p>' +
      table(['প্রেত-শ্রেণি', 'কোন কর্মের ফল বলে বর্ণিত'],
        Z.petas.items.map(function (x) { indexAdd('প্রেত: ' + x.name, 'cosmology', x.karma); return ['<b>' + MX.esc(x.name) + '</b>', MX.esc(x.karma)]; })) +
      '<p class="mx-mini">মূল পাঠের জন্য: বিমানবত্থু ও পেতবত্থু (সুত্তপিটক, খুদ্দক নিকায়) — <a href="https://suttacentral.net/" target="_blank" rel="noopener">SuttaCentral ↗</a>-এ মূল পালি ও অনুবাদ; ৩১ ভূমির সার: <a href="https://www.accesstoinsight.org/ptf/dhamma/sagga/loka.html" target="_blank" rel="noopener">Access to Insight ↗</a></p>';

    /* স্থাপত্য ও জীবন */
    MX.$('archGrid').innerHTML = K.architecture_glossary.map(function (x) {
      indexAdd(x.term, 'archlife', x.def);
      return '<article class="mx-card"><h3>' + MX.esc(x.term) + ' <span class="mx-meta">· ' + MX.esc(x.en) + '</span></h3><p>' + MX.esc(x.def) + '</p></article>';
    }).join('');
    MX.$('lifeGrid').innerHTML = K.daily_life.map(function (x) {
      indexAdd(x.title, 'archlife', x.text);
      return '<article class="mx-card"><h3>' + MX.esc(x.title) + '</h3><p>' + MX.esc(x.text) + '</p></article>';
    }).join('');

    /* মুদ্রা ও বিজ্ঞান */
    MX.$('coinList').innerHTML = K.numismatics.map(function (x) {
      indexAdd('মুদ্রা: ' + x.dynasty, 'coins', x.types + ' ' + x.economy);
      return '<article class="mx-card" style="margin-bottom:14px"><h3>🪙 ' + MX.esc(x.dynasty) + ' <span class="mx-meta">· ' + MX.esc(x.period) + '</span></h3>' +
        '<p><b>ধাতু:</b> ' + MX.esc(x.metal) + '</p><p><b>প্রকার/প্রতীক:</b> ' + MX.esc(x.types) + '</p>' +
        '<p><b>অর্থনৈতিক বিশ্লেষণ:</b> ' + MX.esc(x.economy) + '</p><p class="mx-meta">⚖️ ওজন সম্পর্কে: ' + MX.esc(x.weights_note) + '</p>' +
        '<div class="mx-btns"><a class="cb-btn sm ghost" target="_blank" rel="noopener" href="' + MX.scholarLink(x.dynasty + ' coins numismatics Bengal') + '">Scholar-এ মুদ্রা-গবেষণা ↗</a></div></article>';
    }).join('');
    MX.$('scienceGrid').innerHTML = K.science.map(function (x) {
      indexAdd(x.title, 'coins', x.text);
      return '<article class="mx-card"><h3>' + MX.esc(x.title) + '</h3><p>' + MX.esc(x.text) + '</p></article>';
    }).join('');

    /* পরিব্রাজক */
    MX.$('pilgrimGrid').innerHTML = K.pilgrims_janapada.pilgrims.map(function (x) {
      indexAdd(x.name, 'pilgrims', x.bengal);
      return '<article class="mx-card"><h3>🧳 ' + MX.esc(x.name) + '</h3><p class="mx-meta">' + MX.esc(x.period) + ' · পথ: ' + MX.esc(x.route) + '</p><p>' + MX.esc(x.bengal) + '</p></article>';
    }).join('');
    MX.$('janapadaTable').innerHTML = table(['জনপদ', 'অঞ্চল', 'কেন্দ্র/পরিচিতি'],
      K.pilgrims_janapada.janapadas.map(function (x) { indexAdd('জনপদ: ' + x.name, 'pilgrims', x.area); return ['<b>' + MX.esc(x.name) + '</b>', MX.esc(x.area), MX.esc(x.centre)]; }));

    /* সমাজ */
    MX.$('societyGrid').innerHTML = K.society_folklore.map(function (x) {
      indexAdd(x.title, 'society', x.text);
      return '<article class="mx-card"><h3>' + MX.esc(x.title) + '</h3><p>' + MX.esc(x.text) + '</p></article>';
    }).join('');

    /* কাগজে ঐতিহ্য */
    var P = K.archival_materials;
    MX.$('paperMain').innerHTML = '<p class="cb-sub">' + MX.esc(P.intro) + '</p><div class="mx-grid">' +
      P.categories.map(function (x) {
        indexAdd(x.name, 'paper', x.where);
        return '<article class="mx-card"><h3>✉️ ' + MX.esc(x.name) + '</h3><p>' + MX.esc(x.where) + '</p></article>';
      }).join('') + '</div>';

    MX.$('kbSources').innerHTML = '<ul>' + K.sources.map(function (s) {
      return '<li><a href="' + MX.esc(s.url) + '" target="_blank" rel="noopener">' + MX.esc(s.title) + ' ↗</a></li>';
    }).join('') + '</ul><p class="mx-mini">আপডেট: ' + MX.esc(K.generated_at) + ' · ' + MX.esc(K.note_bn) + '</p>';
  }).catch(function () {
    MX.$('epiIntro').innerHTML = '<p class="mx-meta">জ্ঞানকোষের ডেটা লোড হয়নি।</p>';
  });

  /* ---------- খোঁজ ---------- */
  var searchTimer;
  MX.$('kbSearch').addEventListener('input', function () {
    clearTimeout(searchTimer);
    var q = this.value.trim().toLowerCase();
    searchTimer = setTimeout(function () {
      var box = MX.$('kbSearchResults');
      if (q.length < 2) { box.innerHTML = ''; return; }
      var hits = searchIndex.filter(function (x) { return x.text.indexOf(q) > -1; }).slice(0, 8);
      box.innerHTML = hits.length
        ? '<div class="mx-btns">' + hits.map(function (h) {
            return '<button type="button" class="cb-btn sm" data-goto-tab="' + h.tab + '">' + MX.esc(h.title) + '</button>';
          }).join('') + '</div>'
        : '<p style="color:#ffe9bb">মিলেনি — অন্য বানানে খুঁজুন, বা <b>সংঘমিত্র</b>কে জিজ্ঞেস করুন (ওপরে ☸ বোতাম)।</p>';
      box.querySelectorAll('[data-goto-tab]').forEach(function (b) {
        b.addEventListener('click', function () { openTab(b.dataset.gotoTab); window.scrollTo({ top: 420, behavior: 'smooth' }); });
      });
    }, 220);
  });
})();
