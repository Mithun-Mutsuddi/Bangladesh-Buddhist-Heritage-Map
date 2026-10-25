/* চর্যাভূমি — অটো-আপডেট উৎসব ট্র্যাকার (§৮): খগোল-গণনায় পরবর্তী উৎসব,
   কাউন্টডাউন, Google Calendar লিংক ও .ics ডাউনলোড। calendar.html-এ বসে;
   #festivalAuto / #festivalAutoMini যেকোনোটি থাকলেই রেন্ডার করে। */
(function () {
  'use strict';
  if (!window.MX) return;
  var MX = window.MX;
  var full = document.getElementById('festivalAuto');
  var mini = document.getElementById('festivalAutoMini');
  if (!full && !mini) return;

  function daysUntil(date) {
    var today = new Date(); today.setHours(0, 0, 0, 0);
    return Math.round((date.getTime() - today.getTime()) / 86400000);
  }
  function countdownText(date) {
    var d = daysUntil(date);
    if (d < 0) return 'অতিবাহিত';
    if (d === 0) return 'আজই! 🎉';
    if (d === 1) return 'আগামীকাল';
    return 'আর ' + MX.bn(d) + ' দিন বাকি';
  }

  MX.fetchJson('data/festivals-auto.json?v=20261025h').then(function (data) {
    var upcoming = MX.nextLunarFestivals(data.festivals, new Date());

    if (mini && upcoming.length) {
      var next = upcoming.filter(function (x) { return x.def.id !== 'uposatha-next'; })[0] || upcoming[0];
      mini.innerHTML = '<b>☸ পরবর্তী উৎসব: ' + MX.esc(next.def.name_bn) + '</b> — ' +
        MX.fmtBnDate(next.date) + ' (' + countdownText(next.date) + ') ' +
        '<a href="calendar.html#festivals-auto">সব উৎসবের অটো-তারিখ →</a>';
      mini.hidden = false;
    }

    if (!full) return;
    var cards = upcoming.map(function (x) {
      var d = daysUntil(x.date);
      var gcal = MX.gcalLink(x.def.name_bn + ' — চর্যাভূমি', x.date,
        x.def.about + '\n(খগোল-গণনায় আনুমানিক; বিহারের ঘোষণা মিলিয়ে নিন।)');
      return '<article class="mx-card">' +
        '<span class="mx-badge ' + (d <= 30 ? 'gold' : 'blue') + '">' + countdownText(x.date) + '</span>' +
        '<h3>' + MX.esc(x.def.name_bn) + '</h3>' +
        '<p><b>সম্ভাব্য তারিখ:</b> ' + MX.fmtBnDate(x.date) +
        (x.lunarName ? ' <span class="mx-meta">· চান্দ্রমাস: ' + MX.esc(x.lunarName) + '</span>' : '') + '</p>' +
        '<p>' + MX.esc(x.def.about) + '</p>' +
        (x.def.verify ? '<p class="mx-meta">⚠️ বিহার/সংঘের ঘোষণা ও ছুটির গেজেটে ±১ দিন (অধিক-মাসের বছরে এক মাস) ভিন্ন হতে পারে।</p>' : '') +
        '<div class="mx-btns"><a class="cb-btn sm" target="_blank" rel="noopener" href="' + gcal + '">📅 Google Calendar-এ যোগ</a></div></article>';
    }).join('');

    full.innerHTML =
      '<div class="mx-note"><b>কীভাবে তারিখ পাওয়া যায়:</b> ' + MX.esc(data.method_bn) + '</div>' +
      '<div class="mx-grid">' + cards + '</div>' +
      '<div class="mx-btns"><button type="button" class="cb-btn solid" id="festivalIcsBtn">⬇ সব উৎসব একসঙ্গে .ics ফাইলে নিন (যেকোনো ক্যালেন্ডার অ্যাপে চলে)</button>' +
      '<a class="cb-btn ghost" href="data/../calendar.html#note">পঞ্জিকার হিসাব-পদ্ধতি</a></div>' +
      '<p class="mx-mini">উৎস: ' + data.sources.map(function (s) { return '<a href="' + MX.esc(s.url) + '" target="_blank" rel="noopener">' + MX.esc(s.title) + ' ↗</a>'; }).join(' · ') + '</p>';

    document.getElementById('festivalIcsBtn').addEventListener('click', function () {
      MX.icsDownload('charyabhumi-festivals.ics', upcoming.map(function (x) {
        return { date: x.date, title: x.def.name_bn, desc: x.def.about + ' (আনুমানিক; বিহারের ঘোষণা মিলিয়ে নিন)' };
      }));
      MX.toast('.ics ফাইল ডাউনলোড হচ্ছে — ক্যালেন্ডার অ্যাপে ইমপোর্ট করুন');
    });
  }).catch(function () {
    if (full) full.innerHTML = '<p class="mx-meta">উৎসবের অটো-তারিখ এখন লোড করা যাচ্ছে না। পঞ্জিকা অংশের তিথি দেখে পূর্ণিমার দিন বের করতে পারবেন।</p>';
  });
})();
