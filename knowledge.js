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
  var hashMap = { epigraphy: 'epigraphy', charya: 'charya', iconography: 'iconography', cosmology: 'cosmology', architecture: 'archlife', coins: 'coins', pilgrims: 'pilgrims', society: 'society', paper: 'paper', schools: 'schools', yana: 'schools', dana: 'schools', disciples: 'schools', beings: 'beings', creatures: 'beings', world: 'world' };
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

  /* ---------- পর্যায় ৪: ধর্ম-ধারা/শিষ্য/দান, প্রাণী-কাহিনী, বিশ্ব ম্যাপ ---------- */
  function faceSvg(kind) {
    var extra = '';
    if (kind === 'flame') extra = '<path d="M50 4 q7 12 0 20 q-7 -8 0 -20" fill="#d99b2b"/>';
    else if (kind === 'wave') extra = '<path d="M28 30 q11 -13 22 0 q11 -13 22 0" stroke="#8f3d08" fill="none" stroke-width="3.5" stroke-linecap="round"/>';
    else if (kind === 'tall') extra = '<ellipse cx="50" cy="17" rx="7" ry="12" fill="#b5571f"/>';
    else if (kind === 'crown') extra = '<path d="M30 26 l7 -13 6 8 7 -13 7 13 6 -8 7 13 z" fill="#d99b2b"/>';
    else extra = '<g fill="#8f3d08"><circle cx="36" cy="26" r="3.4"/><circle cx="46" cy="21" r="3.4"/><circle cx="56" cy="21" r="3.4"/><circle cx="65" cy="26" r="3.4"/><ellipse cx="50" cy="14" rx="6" ry="7"/></g>';
    return '<svg viewBox="0 0 100 102" role="img" aria-label="বুদ্ধমূর্তির শৈলীর প্রতীকী রেখাচিত্র" class="mx-styleface">' +
      '<ellipse cx="22" cy="58" rx="5" ry="13" fill="#e8b36a" stroke="#8f3d08" stroke-width="1.6"/>' +
      '<ellipse cx="78" cy="58" rx="5" ry="13" fill="#e8b36a" stroke="#8f3d08" stroke-width="1.6"/>' +
      '<ellipse cx="50" cy="57" rx="27" ry="33" fill="#f3dfa0" stroke="#8f3d08" stroke-width="2"/>' +
      '<path d="M35 54 q5 4 10 0 M55 54 q5 4 10 0" stroke="#5b3a1a" stroke-width="2" fill="none" stroke-linecap="round"/>' +
      '<path d="M50 56 q3 8 -1 12" stroke="#5b3a1a" stroke-width="1.6" fill="none"/>' +
      '<path d="M41 74 q9 6 18 0" stroke="#5b3a1a" stroke-width="2" fill="none" stroke-linecap="round"/>' + extra + '</svg>';
  }
  function yanaDiagramSvg() {
    return '<div class="mx-card" style="margin:16px 0"><h3>একই পাহাড়, তিনটি পথ (পরিকল্পনামূলক চিত্র)</h3>' +
      '<svg viewBox="0 0 680 250" role="img" aria-label="তিন যানের পরিকল্পনামূলক চিত্র" style="width:100%;height:auto">' +
      '<rect width="680" height="250" fill="#fdf6df"/><path d="M140 225 L340 35 L540 225 Z" fill="#e8e0c8" stroke="#b5571f" stroke-width="2"/>' +
      '<circle cx="340" cy="35" r="13" fill="#d99b2b"/><text x="340" y="22" text-anchor="middle" font-size="15" font-weight="700">বোধি / নির্বাণ</text>' +
      '<path d="M170 225 C 230 170, 280 110, 332 48" fill="none" stroke="#1d5c4f" stroke-width="4"/>' +
      '<path d="M340 225 C 340 170, 340 110, 340 52" fill="none" stroke="#b5571f" stroke-width="4" stroke-dasharray="8 5"/>' +
      '<path d="M510 225 C 450 170, 400 110, 348 48" fill="none" stroke="#7a4a9e" stroke-width="4"/>' +
      '<text x="120" y="243" font-size="14" fill="#1d5c4f" font-weight="700">থেরবাদ</text>' +
      '<text x="303" y="243" font-size="14" fill="#b5571f" font-weight="700">মহাযান</text>' +
      '<text x="478" y="243" font-size="14" fill="#7a4a9e" font-weight="700">বজ্রযান</text>' +
      '<text x="20" y="120" font-size="12.5">অরহন্ত-আদর্শ</text><text x="545" y="120" font-size="12.5">মন্ত্র·মণ্ডল·গুরু</text>' +
      '<text x="350" y="150" font-size="12.5">বোধিসত্ত্ব-প্রতিজ্ঞা</text></svg>' +
      '<p class="mx-mini">চিত্রটি ধারণা বোঝাতে; বাস্তবে প্রতিটি ধারার ভেতরেও বহু মঠ-সম্প্রদায় আছে, আর অনেক সাধক একাধিক ধারার শিক্ষা একসঙ্গে অনুসরণ করেন।</p></div>';
  }
  function personRows(list) {
    return list.map(function (x) {
      return ['<b>' + MX.esc(x.name) + '</b>', MX.esc(x.epithet || x.period || ''), MX.esc(x.note)];
    });
  }
  function renderPlus(P) {
    if (!P) return;
    var Y = P.yanas, PE = P.people, D = P.dana, B = P.beings, W = P.world;

    MX.$('yanaIntro').innerHTML = '<p class="cb-sub">' + MX.esc(Y.intro) + '</p>';
    MX.$('yanaDiagram').innerHTML = yanaDiagramSvg();
    MX.$('yanaGrid').innerHTML = Y.items.map(function (x) {
      indexAdd(x.name, 'schools', x.text);
      return '<article class="mx-card"><h3><span class="mx-beingicon">' + x.icon + '</span> ' + MX.esc(x.name) + '</h3>' +
        '<p class="mx-meta">' + MX.esc(x.goal) + ' · ' + MX.esc(x.region) + '</p><p>' + MX.esc(x.text) + '</p></article>';
    }).join('') + '<article class="mx-card"><h3>⚠️ ‘হীনযান’ শব্দটি</h3><p>' + MX.esc(Y.hinayana_note) + '</p></article>';

    MX.$('peopleMain').innerHTML = '<p class="cb-sub">' + MX.esc(PE.intro) + '</p>' +
      '<div class="mx-grid">' + PE.concepts.map(function (x) {
        indexAdd(x.term, 'schools', x.def);
        return '<article class="mx-card"><h3>' + MX.esc(x.term) + '</h3><p>' + MX.esc(x.def) + '</p></article>';
      }).join('') + '</div>' +
      '<h3>প্রধান ভিক্ষু শিষ্য (অগ্র/এতদগ্গ তালিকা থেকে)</h3>' +
      table(['নাম', 'বিশেষত্ব (এতদগ্গ উপাধি)', 'পরিচিতি'], PE.male_disciples.map(function (x) { indexAdd('শিষ্য: ' + x.name, 'schools', x.note); return ['<b>' + MX.esc(x.name) + '</b>', MX.esc(x.epithet), MX.esc(x.note)]; })) +
      '<h3>প্রধান ভিক্ষুণী ও উপাসিকা</h3>' +
      table(['নাম', 'বিশেষত্ব', 'পরিচিতি'], PE.female_disciples.map(function (x) { indexAdd('শিষ্যা: ' + x.name, 'schools', x.note); return ['<b>' + MX.esc(x.name) + '</b>', MX.esc(x.epithet), MX.esc(x.note)]; })) +
      '<h3>পরবর্তী যুগের প্রসিদ্ধ নাম</h3>' +
      table(['নাম', 'কাল', 'পরিচিতি'], PE.later_figures.map(function (x) { indexAdd(x.name, 'schools', x.note); return ['<b>' + MX.esc(x.name) + '</b>', MX.esc(x.period), MX.esc(x.note)]; }));

    MX.$('danaMain').innerHTML = '<p class="cb-sub">' + MX.esc(D.intro) + '</p>' +
      '<div class="mx-grid wide">' + D.types.map(function (x) {
        indexAdd('দান: ' + x.name, 'schools', x.def);
        return '<article class="mx-card"><h3><span class="mx-beingicon">' + x.icon + '</span> ' + MX.esc(x.name) + '</h3><p>' + MX.esc(x.def) + '</p></article>';
      }).join('') + '</div>' +
      '<h3>কোন দানে কী ফল বর্ণিত?</h3>' +
      table(['দান', 'পরম্পরাগত ফলবর্ণনা'], D.fruits.map(function (x) { return ['<b>' + MX.esc(x.dana) + '</b>', MX.esc(x.fruit)]; })) +
      '<div class="mx-note" style="margin-top:14px">' + MX.esc(D.factors) + ' <a href="support.html#donate">শ্রদ্ধাদানের নিরাপদ নির্দেশনা →</a></div>';

    MX.$('faqGrid').innerHTML = P.faq.map(function (x) {
      indexAdd('জিজ্ঞাসা: ' + x.q, 'schools', x.a);
      return '<article class="mx-card"><h3>❓ ' + MX.esc(x.q) + '</h3><p>' + MX.esc(x.a) + '</p></article>';
    }).join('');

    MX.$('beingsIntro').innerHTML = '<p class="cb-sub">' + MX.esc(B.intro) + '</p>';
    MX.$('beingsGrid').innerHTML = B.items.map(function (x) {
      indexAdd(x.name, 'beings', x.text + ' ' + (x.story || ''));
      return '<article class="mx-card"><h3><span class="mx-beingicon">' + x.icon + '</span> ' + MX.esc(x.name) + '</h3>' +
        '<span class="mx-badge gold">' + MX.esc(x.kind) + '</span><p>' + MX.esc(x.text) + '</p>' +
        (x.story ? '<p class="mx-meta">📖 ' + MX.esc(x.story) + '</p>' : '') + '</article>';
    }).join('');

    var maxM = Math.max.apply(null, W.top_countries.map(function (c) { return c.millions; }));
    var bars = W.top_countries.map(function (c) {
      indexAdd('বিশ্ব বৌদ্ধ: ' + c.country, 'world', c.tradition + ' ' + c.millions);
      return '<div class="mx-poprow"><span class="mx-popname">' + c.flag + ' ' + MX.esc(c.country) + '</span>' +
        '<span class="mx-popbar"><i style="--w:' + Math.max(3, Math.round(c.millions / maxM * 100)) + '%"></i></span>' +
        '<span class="mx-popval">' + MX.bn(c.millions) + ' মিলিয়ন · দেশে ' + MX.bn(c.pct_country) + '%</span></div>';
    }).join('');
    MX.$('worldMain').innerHTML =
      '<div class="mx-grid"><article class="mx-card" style="text-align:center"><h3>🌏 বিশ্বে বৌদ্ধ জনসংখ্যা</h3>' +
      '<p style="font-size:34px;font-weight:800;margin:6px 0">' + MX.bn(W.global.total_million) + ' মিলিয়ন</p>' +
      '<p class="mx-meta">বিশ্ব জনসংখ্যার প্রায় ' + MX.bn(W.global.share_pct) + '% (' + MX.bn(W.global.year) + ')</p><p>' + MX.esc(W.global.note) + '</p></article>' +
      '<article class="mx-card" style="text-align:center"><h3>🇧🇩 বাংলাদেশে</h3><p>' + MX.esc(W.bangladesh_note) + '</p>' +
      '<div class="mx-btns" style="justify-content:center"><a class="cb-btn sm" href="index.html#explore">বাংলাদেশের স্থান-ম্যাপে যান</a></div></article></div>' +
      '<h3>জনসংখ্যায় শীর্ষ ১০ দেশ (Pew, ২০২০)</h3><div class="mx-card">' + bars +
      '<p class="mx-mini">' + MX.esc(W.source_note) + '</p></div>' +
      '<h3>বৌদ্ধ সংখ্যাগরিষ্ঠ ৭টি দেশ</h3><div class="mx-grid">' + W.majority.map(function (c) {
        return '<article class="mx-card" style="text-align:center"><p style="font-size:40px;margin:2px">' + c.flag + '</p><h3>' + MX.esc(c.country) + '</h3><p>জনসংখ্যার প্রায় <b>' + MX.bn(c.pct) + '%</b> বৌদ্ধ</p></article>';
      }).join('') + '</div>' +
      '<h3>সংবিধানে বৌদ্ধধর্মের মর্যাদা</h3>' +
      table(['দেশ', 'সাংবিধানিক মর্যাদা', 'বিস্তারিত'], W.constitution.map(function (c) { indexAdd('রাষ্ট্রধর্ম: ' + c.country, 'world', c.detail); return ['<b>' + c.flag + ' ' + MX.esc(c.country) + '</b>', MX.esc(c.status), MX.esc(c.detail)]; })) +
      '<h3>দেশে দেশে বুদ্ধমূর্তির শৈলী</h3><p class="cb-sub">মুখগুলো প্রতীকী রেখাচিত্র — আসল ছবির জন্য প্রতিটি কার্ডের Commons লিংক ব্যবহার করুন (মুক্ত লাইসেন্সের ছবি, নতুন ট্যাবে খুলবে)।</p>' +
      '<div class="mx-grid wide">' + W.styles.map(function (x) {
        indexAdd('মূর্তিশৈলী: ' + x.region, 'world', x.features + ' ' + x.example);
        return '<article class="mx-card"><div style="text-align:center">' + faceSvg(x.face) + '</div>' +
          '<h3>' + x.flag + ' ' + MX.esc(x.region) + ' <span class="mx-meta">· ' + MX.esc(x.country) + ' · ' + MX.esc(x.period) + '</span></h3>' +
          '<p><b>বৈশিষ্ট্য:</b> ' + MX.esc(x.features) + '</p><p><b>উদাহরণ:</b> ' + MX.esc(x.example) + '</p>' +
          '<div class="mx-btns"><a class="cb-btn sm ghost" target="_blank" rel="noopener" href="https://commons.wikimedia.org/w/index.php?search=' + encodeURIComponent(x.commons_query) + '&title=Special:MediaSearch&type=image">আসল ছবি: Wikimedia Commons ↗</a></div></article>';
      }).join('') + '</div>' +
      '<h3>পার্থক্যের কারণ</h3><div class="mx-card"><ul>' + W.style_reasons.map(function (r) { return '<li>' + MX.esc(r) + '</li>'; }).join('') + '</ul></div>';

    var ks = MX.$('kbSources');
    if (ks && P.sources) ks.insertAdjacentHTML('beforeend', '<h3>নতুন অংশের উৎস</h3><ul>' + P.sources.map(function (s) {
      return '<li><a href="' + MX.esc(s.url) + '" target="_blank" rel="noopener">' + MX.esc(s.title) + ' ↗</a></li>';
    }).join('') + '</ul><p class="mx-mini">আপডেট: ' + MX.esc(P.generated_at) + ' · ' + MX.esc(P.note_bn) + '</p>');
  }
  MX.fetchJson('data/knowledge-plus.json?v=20261024i').then(renderPlus).catch(function () {
    var y = MX.$('yanaIntro'); if (y) y.innerHTML = '<p class="mx-meta">নতুন অংশের ডেটা লোড হয়নি।</p>';
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
