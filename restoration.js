/* চর্যাভূমি — সংরক্ষণ-সত্যতা ও অ্যানাস্টাইলোসিস (শিক্ষামূলক) */
(function () {
  'use strict';
  if (!window.MX) return;
  MX.trackLocal('restoration.html');

  /* ---------- অ্যানাস্টাইলোসিস ডেমো: রেখাচিত্রের স্তূপ-সম্মুখ ---------- */
  // শিক্ষামূলক নমুনা — আসল কোনো দেয়ালের মূল্যায়ন নয়।
  var ZONES = [
    { cls: 'orig', color: '#b4602f', photo: '#a0522d', label: 'মূল গাঁথুনি' },
    { cls: 'ana', color: '#e0a867', photo: '#c07a3e', label: 'অ্যানাস্টাইলোসিস' },
    { cls: 'mod', color: '#dcd0b8', photo: '#b99b78', label: 'নতুন সহায়ক ইট' },
    { cls: 'cap', color: '#9aa0a6', photo: '#8d9299', label: 'আধুনিক ঢালাই-টুপি' },
    { cls: 'lost', color: '#f4f1e6', photo: '#f7f3e8', label: 'হারানো অংশ (গড়া হয়নি)' }
  ];
  function fillFor(cls, colored) {
    var z = ZONES.filter(function (x) { return x.cls === cls; })[0];
    return colored ? z.color : z.photo;
  }
  function wallSvg(colored) {
    var mortar = colored ? '#6b5138' : '#7a6750';
    var brickLines = '';
    for (var y = 306; y < 470; y += 22) brickLines += '<line x1="60" y1="' + y + '" x2="560" y2="' + y + '" stroke="' + mortar + '" stroke-width="1.6" opacity=".65"/>';
    for (var x = 90; x < 560; x += 48) brickLines += '<line x1="' + x + '" y1="284" x2="' + x + '" y2="470" stroke="' + mortar + '" stroke-width="1" opacity=".4"/>';
    return '<svg viewBox="0 0 620 520" width="620" role="img" aria-label="আসল বনাম সংস্কার অংশের নমুনা রেখাচিত্র">' +
      '<rect width="620" height="520" fill="#fbf6ea"/>' +
      '<rect x="0" y="470" width="620" height="50" fill="#cbb493"/>' +
      // হারানো অংশ (ভাঙা ডানদিক)
      '<path d="M470 300 L560 330 L560 470 Z" fill="' + fillFor('lost', colored) + '" stroke="#b3a284" stroke-dasharray="6 5"/>' +
      // মূল ভিত্তি দেয়াল
      '<path d="M60 470 L60 300 L300 300 L300 470 Z" fill="' + fillFor('orig', colored) + '" stroke="#6b3c1a" stroke-width="2"/>' +
      // অ্যানাস্টাইলোসিস: পড়ে থাকা আসল খণ্ডে পূরণ মাঝের অংশ
      '<path d="M300 470 L300 300 L420 300 L470 300 L560 470 Z" fill="' + fillFor('ana', colored) + '" stroke="#6b3c1a" stroke-width="2"/>' +
      // নতুন সহায়ক গাঁথুনির থাক (মাঝখানে)
      '<rect x="180" y="356" width="150" height="62" fill="' + fillFor('mod', colored) + '" stroke="#6b3c1a" stroke-width="1.6"/>' +
      // টেরাকোটা সারি (মূল) ও একটি বদলি খালি ঘর
      '<g>' +
      [80, 140, 200, 320, 380].map(function (x) { return '<rect x="' + x + '" y="316" width="44" height="30" fill="#8f3d08" opacity=".8"/><circle cx="' + (x + 22) + '" cy="331" r="9" fill="#e8c98a"/>'; }).join('') +
      '<rect x="260" y="316" width="44" height="30" fill="' + fillFor('lost', colored) + '" stroke="#b3a284" stroke-dasharray="4 3"/>' +
      '</g>' +
      brickLines +
      // ঢালাই টুপি
      '<path d="M52 300 L470 300 L478 282 L60 282 Z" fill="' + fillFor('cap', colored) + '" stroke="#5f6368" stroke-width="1.6"/>' +
      // ধাপ (মেধি) মূল + নতুন অংশ
      '<rect x="120" y="236" width="180" height="46" fill="' + fillFor('orig', colored) + '" stroke="#6b3c1a" stroke-width="2"/>' +
      '<rect x="300" y="236" width="110" height="46" fill="' + fillFor('ana', colored) + '" stroke="#6b3c1a" stroke-width="2"/>' +
      '<rect x="180" y="192" width="120" height="44" fill="' + fillFor('orig', colored) + '" stroke="#6b3c1a" stroke-width="2"/>' +
      '<path d="M300 192 L360 192 L336 236 L300 236 Z" fill="' + fillFor('lost', colored) + '" stroke="#b3a284" stroke-dasharray="6 5"/>' +
      // অণ্ড (গম্বুজ) — বাম মূল, ডান অর্ধেক পুনঃস্থাপন
      '<path d="M190 192 A80 80 0 0 1 270 112 L270 192 Z" fill="' + fillFor('orig', colored) + '" stroke="#6b3c1a" stroke-width="2"/>' +
      '<path d="M270 112 A80 80 0 0 1 350 192 L270 192 Z" fill="' + fillFor('ana', colored) + '" stroke="#6b3c1a" stroke-width="2"/>' +
      '<rect x="252" y="86" width="36" height="26" fill="' + fillFor('orig', colored) + '" stroke="#6b3c1a" stroke-width="2"/>' +
      '<path d="M270 56 L282 86 L258 86 Z" fill="' + fillFor('cap', colored) + '" stroke="#5f6368"/>' +
      (colored ?
        '<g font-size="13.5" font-weight="700" fill="#2a1f19">' +
        '<text x="120" y="440">মূল গাঁথুনি</text>' +
        '<text x="392" y="452">পুনঃস্থাপিত আসল খণ্ড</text>' +
        '<text x="196" y="392">নতুন সহায়ক ইট</text>' +
        '<text x="486" y="296">ঢালাই-টুপি →</text>' +
        '<text x="500" y="380">হারানো:</text><text x="486" y="398">গড়া হয়নি</text>' +
        '<text x="96" y="140">গম্বুজের অর্ধেক পুনঃস্থাপন →</text></g>' : '') +
      '<text x="310" y="505" text-anchor="middle" font-size="13" fill="#5d4a36">নমুনা রেখাচিত্র — কোনো নির্দিষ্ট স্থানের প্রকৃত মানচিত্র নয়</text>' +
      '</svg>';
  }
  var coloredMode = true;
  function renderAna() {
    MX.$('anaSvg').innerHTML = wallSvg(coloredMode);
    MX.$('anaToggle').setAttribute('aria-pressed', coloredMode ? 'true' : 'false');
    MX.$('anaPhotoBtn').setAttribute('aria-pressed', coloredMode ? 'false' : 'true');
  }
  MX.$('anaToggle').addEventListener('click', function () { coloredMode = true; renderAna(); });
  MX.$('anaPhotoBtn').addEventListener('click', function () { coloredMode = false; renderAna(); });
  renderAna();

  /* ---------- হিস্টোরিক স্লাইডার ---------- */
  var slider = MX.$('histSlider'), cmp = MX.$('histCompare');
  if (slider && cmp) slider.addEventListener('input', function () { cmp.style.setProperty('--split', slider.value + '%'); });

  /* ---------- ডেটা ---------- */
  MX.fetchJson('data/orientation-heritage.json?v=20261024g').then(function (D) {
    var R = D.restoration;
    MX.$('resIntro').innerHTML = '<div class="mx-note">' + MX.esc(R.intro_bn) + '</div>';
    MX.$('resCharters').innerHTML = R.charters.map(function (c) {
      return '<div class="mx-card"><h3>' + MX.esc(c.name) + '</h3><p>' + MX.esc(c.note_bn) + '</p></div>';
    }).join('');
    MX.$('resTell').innerHTML = R.how_to_tell.map(function (t, i) {
      var badge = t.level === 'নির্ভরযোগ্য প্রমাণ' ? 'green' : (t.level === 'সাধারণত দৃশ্যমান' ? 'blue' : 'gold');
      return '<div class="mx-card"><h3>' + MX.bn(String(i + 1)) + ' · ' + MX.esc(t.cue_bn) + '</h3><p><span class="mx-badge ' + badge + '">' + MX.esc(t.level) + '</span></p><p>' + MX.esc(t.detail_bn) + '</p></div>';
    }).join('');
    MX.$('resGateways').innerHTML = R.photo_gateways.map(function (g) {
      var external = /^https?:/.test(g.url);
      return '<div class="mx-card"><h3>🗂️ ' + MX.esc(g.name_bn) + '</h3><p>' + MX.esc(g.note_bn) + '</p>' +
        '<p><a href="' + MX.esc(g.url) + '"' + (external ? ' target="_blank" rel="noopener"' : '') + '>খুলুন ↗</a></p></div>';
    }).join('');
    MX.$('resTimeline').innerHTML = R.timeline.map(function (t) {
      return '<div class="mx-card" style="margin-bottom:14px"><h3>🏛️ ' + MX.esc(t.site_bn) + '</h3>' +
        t.events.map(function (e) {
          var badge = e.confidence === 'documented' ? '<span class="mx-badge green">দলিলভিত্তিক</span>' : '<span class="mx-badge gold">' + MX.esc(e.confidence) + '</span>';
          return '<p><b>' + MX.esc(e.when) + '</b> — ' + MX.esc(e.what_bn) + ' ' + badge + '</p>';
        }).join('') + '</div>';
    }).join('');
  }).catch(function () {
    if (MX.$('resTell')) MX.$('resTell').innerHTML = '<p class="mx-meta">ডেটা লোড হয়নি।</p>';
  });
})();
