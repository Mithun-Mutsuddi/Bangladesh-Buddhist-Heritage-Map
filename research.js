/* চর্যাভূমি — গবেষণা ডেস্ক (§২) */
(function () {
  'use strict';
  if (!window.MX) return;
  MX.trackLocal('research.html');

  /* সংঘমিত্র endpoint স্ট্যাটাস (স্পর্শকাতর তথ্য নয় — শুধু সেটিংস আছে কিনা) */
  (function () {
    var cfg = window.CHARYABHUMI_CONFIG || {};
    var el = MX.$('sanghaStatus');
    if (cfg.sanghamitraApiUrl) el.textContent = 'অনলাইন AI endpoint কনফিগার করা আছে — প্যানেলে “online AI” চালু করে ব্যবহার করুন।';
    else el.textContent = 'বর্তমানে স্থানীয় সূত্র-ভিত্তিক গাইড মোড (নিরাপদ ডিফল্ট)। সার্ভারে Gemini/OpenAI যুক্ত করতে docs/update-2026-10-24-mega-features-bn.md দেখুন।';
  })();

  var TOPICS = [
    { label: '🏛️ সোমপুর খনন', q: 'Somapura Mahavihara excavation Paharpur' },
    { label: '🗿 পাল ভাস্কর্য', q: 'Pala period Buddhist sculpture Bengal' },
    { label: '🎵 চর্যাপদ ভাষা', q: 'Charyapada language siddhacharya research' },
    { label: '🪙 হরিকেল মুদ্রা', q: 'Harikela coins Samatata numismatics' },
    { label: '📜 তাম্রশাসন', q: 'Bengal copper plate inscriptions Pala grants' },
    { label: '🧳 হিউয়েন সাং ও বাংলা', q: 'Xuanzang Pundravardhana Samatata' },
    { label: '🏺 ময়নামতি প্রত্নতত্ত্ব', q: 'Mainamati Lalmai Shalban Vihara archaeology' },
    { label: '🌏 অতীশ দীপঙ্কর', q: 'Atisha Dipankara Bikrampur Vikramashila' }
  ];
  MX.$('topicChips').innerHTML = TOPICS.map(function (t, i) {
    return '<button type="button" class="mx-optbtn" data-topic="' + i + '">' + MX.esc(t.label) + '<br><span class="mx-meta">' + MX.esc(t.q) + '</span></button>';
  }).join('');
  document.querySelectorAll('[data-topic]').forEach(function (b) {
    b.addEventListener('click', function () { MX.$('scholarQ').value = TOPICS[+b.dataset.topic].q; scholarBtns(); });
  });

  function scholarBtns() {
    var q = MX.$('scholarQ').value.trim();
    var year = MX.$('scholarYear').value.trim();
    var scholar = MX.scholarLink(q) + (year ? '&as_ylo=' + encodeURIComponent(year) : '');
    MX.$('scholarBtns').innerHTML =
      '<a class="cb-btn solid" target="_blank" rel="noopener" href="' + scholar + '">🎓 Google Scholar ↗</a>' +
      '<a class="cb-btn" target="_blank" rel="noopener" href="' + MX.booksLink(q) + '">📚 Google Books ↗</a>' +
      '<a class="cb-btn" target="_blank" rel="noopener" href="https://www.jstor.org/action/doBasicSearch?Query=' + encodeURIComponent(q) + '">JSTOR ↗</a>' +
      '<a class="cb-btn ghost" target="_blank" rel="noopener" href="https://archive.org/search?query=' + encodeURIComponent(q) + '">Internet Archive (ফ্রি PDF) ↗</a>' +
      '<a class="cb-btn ghost" target="_blank" rel="noopener" href="https://shodhganga.inflibnet.ac.in/simple-search?query=' + encodeURIComponent(q) + '">থিসিস (Shodhganga) ↗</a>';
  }
  ['scholarQ', 'scholarYear'].forEach(function (id) { MX.$(id).addEventListener('input', scholarBtns); });
  scholarBtns();

  /* সাইটেশন */
  var PAGES = [
    ['index.html', 'চর্যাভূমি হোম ও স্থান-নির্দেশিকা'],
    ['atlas.html', 'Research & Travel Atlas (১২টি প্রোফাইল)'],
    ['knowledge.html', 'বৌদ্ধ ঐতিহ্য জ্ঞানকোষ'],
    ['explore3d.html', '360° ও GIS এক্সপ্লোরার'],
    ['travel-planner.html', 'রুট ও ট্রাভেল প্ল্যানার'],
    ['calendar.html', 'বৌদ্ধ পঞ্জিকা ও উৎসব-ট্র্যাকার'],
    ['history.html', 'বৌদ্ধ শাসন ও ইতিহাস'],
    ['research.html', 'গবেষণা ডেস্ক']
  ];
  MX.$('citePage').innerHTML = PAGES.map(function (p) { return '<option value="' + p[0] + '">' + MX.esc(p[1]) + '</option>'; }).join('');
  function citeOut() {
    var p = PAGES.filter(function (x) { return x[0] === MX.$('citePage').value; })[0] || PAGES[0];
    var url = location.origin + location.pathname.replace(/[^/]*$/, '') + p[0];
    var today = new Date().toISOString().slice(0, 10);
    var txt = MX.$('citeStyle').value === 'apa'
      ? 'Charyabhumi. (2026). ' + p[1] + ' [Bangladesh Buddhist Heritage Map]. Retrieved ' + today + ', from ' + url
      : 'চর্যাভূমি (২০২৬)। “' + p[1] + '”। বাংলাদেশ বৌদ্ধ ঐতিহ্য মানচিত্র। সংগ্রহের তারিখ: ' + today + '। ' + url;
    MX.$('citeOut').textContent = txt;
    return txt;
  }
  ['citePage', 'citeStyle'].forEach(function (id) { MX.$(id).addEventListener('change', citeOut); });
  MX.$('citeCopy').addEventListener('click', function () { MX.copyText(citeOut(), 'সাইটেশন কপি হয়েছে ✓'); });
  citeOut();

  /* ডেটা: গ্রন্থপঞ্জি + পরিভাষা + স্থান-সাজেস্ট */
  Promise.all([
    MX.fetchJson('data/research-plus.json?v=20261024g'),
    MX.fetchJson('data/atlas-sites.json?v=20261024g')
  ]).then(function (res) {
    var R = res[0];
    MX.$('scholarSite').innerHTML = '<option value="">— স্থান বেছে প্রশ্ন বসান —</option>' + (res[1].sites || []).map(function (s) {
      return '<option value="' + MX.esc((s.name && s.name.en) || s.id) + '">' + MX.esc(s.name.bn) + '</option>';
    }).join('');
    MX.$('scholarSite').addEventListener('change', function () {
      if (this.value) { MX.$('scholarQ').value = this.value + ' Bangladesh archaeology'; scholarBtns(); }
    });

    MX.$('biblioGrid').innerHTML = R.bibliography.map(function (b) {
      return '<article class="mx-card"><span class="mx-badge blue">' + MX.esc(b.kind) + '</span>' +
        '<h3>' + MX.esc(b.title) + '</h3><p class="mx-meta">' + MX.esc(b.author) + '</p><p>' + MX.esc(b.desc) + '</p>' +
        '<div class="mx-btns"><a class="cb-btn sm" target="_blank" rel="noopener" href="' + MX.esc(b.url) + '">আসল/আর্কাইভ কপি ↗</a>' +
        '<a class="cb-btn sm ghost" target="_blank" rel="noopener" href="' + MX.scholarLink(b.scholar_q) + '">Scholar ↗</a>' +
        '<a class="cb-btn sm ghost" target="_blank" rel="noopener" href="' + MX.booksLink(b.scholar_q) + '">Books ↗</a></div></article>';
    }).join('');

    var terms = R.terminology || [];
    function renderTerms() {
      var q = MX.$('termSearch').value.trim().toLowerCase();
      var lang = MX.$('termLang').value;
      var rows = terms.filter(function (t) {
        return !q || (t.bn + ' ' + t.en + ' ' + t.pali_skt + ' ' + t.def_bn).toLowerCase().indexOf(q) > -1;
      }).map(function (t) {
        var ctx = t.bn + ' (' + t.en + ') — ' + t.def_bn;
        return '<tr><td><b>' + MX.esc(t.bn) + '</b></td><td>' + MX.esc(t.en) + '</td><td>' + MX.esc(t.pali_skt) + '</td><td>' + MX.esc(t.def_bn) +
          '<br><a target="_blank" rel="noopener" href="' + MX.translateLink(ctx, lang) + '">প্রসঙ্গসহ Google Translate-এ নিন ↗</a></td></tr>';
      }).join('');
      MX.$('termTable').innerHTML = '<div class="mx-scroll"><table class="mx-table"><thead><tr><th>বাংলা পরিভাষা</th><th>English (প্রস্তাবিত)</th><th>পালি/সংস্কৃত মূল</th><th>অর্থ ও ব্যবহার-টীকা</th></tr></thead><tbody>' +
        (rows || '<tr><td colspan="4">মিলেনি — বানান বদলে খুঁজুন।</td></tr>') + '</tbody></table></div>';
    }
    MX.$('termSearch').addEventListener('input', renderTerms);
    MX.$('termLang').addEventListener('change', renderTerms);
    renderTerms();
  }).catch(function () {
    MX.$('biblioGrid').innerHTML = '<p class="mx-meta">গ্রন্থপঞ্জির ডেটা লোড হয়নি।</p>';
  });
})();
