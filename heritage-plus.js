/* চর্যাভূমি — হোমপেজ সম্প্রসারণ: প্রতি কার্ডে 360°/রুট/শ্রদ্ধাদান টুল,
   আসন্ন উৎসব ব্যানার ও লোকাল অ্যানালিটিক্স গণনা। dashboard.js-কে ছোঁয় না। */
(function () {
  'use strict';
  if (!window.MX) return;
  MX.trackLocal('index.html');

  /* উৎসব ব্যানারের ধারক (festival-auto.js পরে ভরবে) */
  var explore = document.getElementById('explore');
  if (explore && !document.getElementById('festivalAutoMini')) {
    var div = document.createElement('div');
    div.id = 'festivalAutoMini';
    div.hidden = true;
    div.style.cssText = 'max-width:1180px;margin:10px auto 0;padding:12px 22px';
    explore.parentNode.insertBefore(div, explore);
  }

  var ATLAS_IDS = ['somapura', 'shalban', 'kotila-mura', 'itakhola-mura', 'rupban-mura', 'charpatra-mura', 'ananda-vihara', 'bhoja-vihara', 'sitakot', 'halud-vihara', 'bhasu-vihara', 'jagaddala'];
  var coordsById = {};

  function toolsHtml(id, name) {
    var isAtlas = ATLAS_IDS.indexOf(id) > -1;
    var c = coordsById[id];
    var sv = isAtlas ? 'explore3d.html?site=' + encodeURIComponent(id)
      : (c ? MX.streetViewLink(c[0], c[1]) : 'explore3d.html');
    var route = isAtlas ? 'travel-planner.html?site=' + encodeURIComponent(id)
      : (c ? MX.mapsDir(c[0], c[1], 'driving') : 'travel-planner.html');
    var ext = !isAtlas && c ? ' target="_blank" rel="noopener"' : '';
    return '<div class="mx-place-tools">' +
      '<a href="' + sv + '"' + ext + '>🧍 360°</a>' +
      '<a href="' + route + '"' + ext + '>🧭 রুট ও বাজেট</a>' +
      '<a class="donate" href="support.html?site=' + encodeURIComponent(id) + '">🙏 শ্রদ্ধাদান (নিরাপদ নির্দেশনা)</a>' +
      '</div>';
  }

  function decorate(root) {
    root.querySelectorAll('.cb-place-card[data-card]:not([data-mx-tools])').forEach(function (card) {
      card.setAttribute('data-mx-tools', '1');
      var id = card.getAttribute('data-card');
      var body = card.querySelector('.cb-place-body');
      if (!body || !id) return;
      var holder = document.createElement('div');
      holder.innerHTML = toolsHtml(id, '');
      body.appendChild(holder.firstChild);
    });
    var detailBody = document.getElementById('placeDialogBody');
    if (detailBody && detailBody.innerHTML && !detailBody.querySelector('.mx-place-tools')) {
      var btn = detailBody.querySelector('[data-action][data-id]');
      var h3 = detailBody.querySelector('h3');
      if (btn && h3) {
        var holder2 = document.createElement('div');
        holder2.innerHTML = toolsHtml(btn.getAttribute('data-id'), h3.textContent);
        var actions = detailBody.querySelector('.cb-place-actions');
        if (actions) actions.after(holder2.firstChild);
      }
    }
  }

  function start() {
    var grid = document.getElementById('placeGrid');
    if (!grid) return;
    decorate(document);
    var pending = false;
    new MutationObserver(function () {
      if (pending) return;
      pending = true;
      setTimeout(function () { pending = false; decorate(document); }, 180);
    }).observe(grid, { childList: true, subtree: false });
    var dlg = document.getElementById('placeDialogBody');
    if (dlg) new MutationObserver(function () { decorate(document); }).observe(dlg, { childList: true });
  }

  MX.fetchJson('data/dashboard-core.json?v=20261024g').then(function (data) {
    (data.places || []).forEach(function (p) {
      if (p.id && p.coords && p.coords.length === 2) coordsById[p.id] = p.coords;
    });
  }).catch(function () { /* স্থানাঙ্ক ছাড়াও লিংক চলবে */ }).then(start);
})();
