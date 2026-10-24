/* চর্যাভূমি — আন্তঃসীমান্ত বৌদ্ধ করিডোর ম্যাপ লেয়ার */
(function () {
  'use strict';
  if (!window.MX) return;
  MX.trackLocal('corridors.html');

  var W = 960, H = 720, LON0 = 82, LON1 = 100, LAT0 = 4, LAT1 = 29;
  function X(lon) { return (lon - LON0) / (LON1 - LON0) * W; }
  function Y(lat) { return H - (lat - LAT0) / (LAT1 - LAT0) * H; }
  var KIND = {
    land: { color: '#b03a2e', dash: '', label: 'স্থলপথ' },
    river: { color: '#2471a3', dash: 'stroke-dasharray="10 6"', label: 'নদীপথ' },
    sea: { color: '#1d5c4f', dash: 'stroke-dasharray="3 7"', label: 'সাগরপথ' }
  };
  var BD = { somapura: 1, mahasthan: 1, bikrampur: 1, wari: 1, mainamati: 1, chattogram: 1 };
  var DATA = null, nodeById = {};

  function mapSvg() {
    var grat = '';
    for (var lon = 84; lon <= 98; lon += 2) grat += '<line x1="' + X(lon) + '" y1="0" x2="' + X(lon) + '" y2="' + H + '" stroke="#ddd3ba"/>' + '<text x="' + X(lon) + '" y="18" text-anchor="middle" font-size="12" fill="#8a7a66">' + MX.bn(String(lon)) + '°পূ</text>';
    for (var lat = 8; lat <= 28; lat += 4) grat += '<line x1="0" y1="' + Y(lat) + '" x2="' + W + '" y2="' + Y(lat) + '" stroke="#ddd3ba"/>' + '<text x="8" y="' + (Y(lat) - 6) + '" font-size="12" fill="#8a7a66">' + MX.bn(String(lat)) + '°উ</text>';
    var seaBand = '<path d="M0 ' + Y(15.5) + ' C 240 ' + Y(13) + ', 480 ' + Y(14) + ', 960 ' + Y(11) + ' L960 720 L0 720 Z" fill="#dbeef7" opacity=".85"/>' +
      '<text x="300" y="' + Y(9) + '" font-size="19" font-weight="700" fill="#2471a3">বঙ্গোপসাগর</text>' +
      '<text x="620" y="' + Y(6.6) + '" font-size="15" fill="#2471a3">↓ শ্রীবিজয় · বরোবুদুর (দ.পূ.)</text>';
    var routes = DATA.routes.map(function (r) {
      var pts = r.path.map(function (id) { var n = nodeById[id]; return X(n.lon) + ',' + Y(n.lat); }).join(' ');
      var k = KIND[r.kind];
      return '<g data-kind="' + r.kind + '"><polyline points="' + pts + '" fill="none" stroke="' + k.color + '" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" opacity=".85" ' + k.dash + '/></g>';
    }).join('');
    var SHORT = { somapura: 'সোমপুর', mahasthan: 'পুণ্ড্রনগর', bikrampur: 'বিক্রমপুর', wari: 'উয়ারী', mainamati: 'ময়নামতি', boxanagar: 'বক্সনগর', pilak: 'পিলাক', chattogram: 'চট্টগ্রাম', mrauku: 'ধান্যবতী', suryapahar: 'সূর্যপাহাড়', vikramshila: 'বিক্রমশীলা', Nalanda: 'নালন্দা', bodhgaya: 'বুদ্ধগয়া', tamralipti: 'তাম্রলিপ্ত বন্দর', bagan: 'বাগান', thaton: 'থাটোন' };
    // লেবেলের স্থানান্তর [dx, dy, anchor] — কাছাকাছি নোডের নাম গায়ে লাগা এড়াতে
    var OFF = {
      bodhgaya: [0, 28, 'middle'], Nalanda: [0, -18, 'middle'], vikramshila: [0, 28, 'middle'],
      tamralipti: [0, 28, 'middle'], somapura: [-16, -6, 'end'], mahasthan: [16, -12, 'start'],
      suryapahar: [0, -18, 'middle'], bikrampur: [-16, 6, 'end'], wari: [14, -14, 'start'],
      mainamati: [16, 22, 'start'], boxanagar: [16, -8, 'start'], pilak: [14, 24, 'start'],
      chattogram: [-14, 26, 'end'], mrauku: [0, 28, 'middle'], bagan: [0, 28, 'middle'], thaton: [0, 28, 'middle']
    };
    var nodes = DATA.nodes.map(function (n) {
      var x = X(n.lon), y = Y(n.lat), bd = BD[n.id];
      var o = OFF[n.id] || [0, 24, 'middle'];
      return '<g class="cor-node" data-id="' + n.id + '" tabindex="0" role="button" aria-label="' + MX.esc(n.name_bn) + '" style="cursor:pointer">' +
        '<circle cx="' + x + '" cy="' + y + '" r="11" fill="' + (bd ? '#8f3d08' : '#123f39') + '" stroke="#fff" stroke-width="2.5"/>' +
        '<circle cx="' + x + '" cy="' + y + '" r="4" fill="#f3d27a"/>' +
        '<text x="' + (x + o[0]) + '" y="' + (y + o[1]) + '" text-anchor="' + o[2] + '" font-size="14.5" font-weight="' + (bd ? '800' : '600') + '" fill="#2a1f19" stroke="#fdf8ec" stroke-width="3.5" paint-order="stroke">' + MX.esc(SHORT[n.id] || n.name_bn) + '</text></g>';
    }).join('');
    return '<svg id="corSvg" viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" role="img" aria-label="বৌদ্ধ করিডোরের অবস্থান-মানচিত্র">' +
      '<rect width="' + W + '" height="' + H + '" fill="#fdf8ec"/>' + seaBand + grat + routes + nodes +
      '<g font-size="13" fill="#5d4a36"><rect x="14" y="' + (H - 92) + '" width="330" height="80" rx="10" fill="#fffdf4" stroke="#c9b68a"/>' +
      '<circle cx="34" cy="' + (H - 68) + '" r="8" fill="#8f3d08"/><text x="50" y="' + (H - 63) + '">বাংলাদেশের কেন্দ্র</text>' +
      '<circle cx="34" cy="' + (H - 42) + '" r="8" fill="#123f39"/><text x="50" y="' + (H - 37) + '">আন্তঃসীমান্ত কেন্দ্র</text>' +
      '<text x="180" y="' + (H - 63) + '">— স্থল · – – নদী</text><text x="180" y="' + (H - 37) + '">··· সাগর</text></g>' +
      '</svg>';
  }

  function showNode(n) {
    var routes = DATA.routes.filter(function (r) { return r.path.indexOf(n.id) >= 0; });
    MX.$('corDetail').innerHTML =
      '<h3>' + (BD[n.id] ? '🇧🇩 ' : '🌏 ') + MX.esc(n.name_bn) + '</h3>' +
      '<p><span class="mx-badge gold">' + MX.esc(n.country_bn) + '</span> <span class="mx-badge blue">' + MX.esc(n.period_bn) + '</span></p>' +
      '<p>' + MX.esc(n.role_bn) + '</p>' +
      '<p class="mx-meta">স্থানাঙ্ক (আনুমানিক কেন্দ্র): ' + MX.bn(n.lat.toFixed(3)) + ', ' + MX.bn(n.lon.toFixed(3)) + '</p>' +
      (routes.length ? '<p><b>যুক্ত রুট:</b> ' + routes.map(function (r) { return MX.esc(r.name_bn); }).join(' · ') + '</p>' : '') +
      '<p><a href="' + MX.earthLink(n.lat, n.lon) + '" target="_blank" rel="noopener">Google Earth-এ দেখুন ↗</a>' +
      (BD[n.id] ? ' · <a href="atlas.html">Atlas প্রোফাইল →</a>' : '') + '</p>';
    document.querySelectorAll('.cor-node circle').forEach(function (c) { c.setAttribute('stroke', '#fff'); });
    var g = document.querySelector('.cor-node[data-id="' + n.id + '"] circle');
    if (g) g.setAttribute('stroke', '#f3d27a');
  }

  MX.$('routeBtns').addEventListener('click', function (e) {
    var b = e.target.closest('.mx-layerbtn'); if (!b || !DATA) return;
    b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
    var on = {};
    document.querySelectorAll('#routeBtns .mx-layerbtn').forEach(function (x) { on[x.dataset.kind] = x.getAttribute('aria-pressed') === 'true'; });
    document.querySelectorAll('#corSvg [data-kind]').forEach(function (g) { g.style.display = on[g.dataset.kind] ? '' : 'none'; });
    renderRouteNotes(on);
  });
  function renderRouteNotes(on) {
    if (!DATA) return;
    MX.$('routeNotes').innerHTML = DATA.routes.filter(function (r) { return on[r.kind]; }).map(function (r) {
      return '<p><b style="color:' + KIND[r.kind].color + '">' + MX.esc(r.name_bn) + '</b><br>' + MX.esc(r.note_bn) + '</p>';
    }).join('');
  }

  MX.fetchJson('data/orientation-heritage.json?v=20261024g').then(function (D) {
    DATA = D.corridors;
    DATA.nodes.forEach(function (n) { nodeById[n.id] = n; });
    MX.$('corIntro').innerHTML = '<div class="mx-note">' + MX.esc(DATA.intro_bn) + '</div>';
    MX.$('corMap').innerHTML = mapSvg();
    renderRouteNotes({ land: true, river: true, sea: true });
    var svg = document.getElementById('corSvg');
    svg.addEventListener('click', function (e) {
      var g = e.target.closest('.cor-node'); if (g) showNode(nodeById[g.dataset.id]);
    });
    svg.addEventListener('keydown', function (e) {
      if ((e.key === 'Enter' || e.key === ' ') && e.target.classList && e.target.classList.contains('cor-node')) {
        e.preventDefault(); showNode(nodeById[e.target.dataset.id]);
      }
    });
    showNode(nodeById.somapura);
    MX.$('corNodes').innerHTML = DATA.nodes.map(function (n) {
      return '<article class="mx-card mx-nodecard"><h3>' + (BD[n.id] ? '🇧🇩 ' : '🌏 ') + MX.esc(n.name_bn) + '</h3>' +
        '<p><span class="mx-badge gold">' + MX.esc(n.country_bn) + '</span> <span class="mx-badge blue">' + MX.esc(n.period_bn) + '</span></p>' +
        '<p>' + MX.esc(n.role_bn) + '</p></article>';
    }).join('');
    MX.$('corStories').innerHTML = DATA.stories.map(function (s) {
      return '<div class="mx-card"><h3>🚶 ' + MX.esc(s.person_bn) + '</h3><p>' + MX.esc(s.route_bn) + '</p></div>';
    }).join('');
  }).catch(function () {
    if (MX.$('corMap')) MX.$('corMap').innerHTML = '<p class="mx-meta">ডেটা লোড হয়নি।</p>';
  });
})();
