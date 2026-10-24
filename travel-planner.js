/* চর্যাভূমি — ট্রাভেল প্ল্যানার (§৩): রুট, ইটিনারারি, কাছের সেবা, বাজেট */
(function () {
  'use strict';
  if (!window.MX) return;
  MX.trackLocal('travel-planner.html');

  var travel = null, atlasSites = [], hubs = [], lastRoadKm = null;
  var EXTRA_DEST = [
    { id: 'mahasthan', name_bn: 'মহাস্থানগড়', lat: 24.9575, lon: 89.3444 }
  ];

  function sName(s) { return s.name_bn || (s.name && s.name.bn) || s.id; }
  function sLat(s) { return s.lat != null ? s.lat : s.coordinates.lat; }
  function sLon(s) { return s.lon != null ? s.lon : s.coordinates.lon; }
  function allDests() { return atlasSites.concat(EXTRA_DEST); }
  function findDest(id) { return allDests().filter(function (s) { return s.id === id; })[0]; }
  function findHub(id) { return hubs.filter(function (h) { return h.id === id; })[0]; }
  function num(id) { return parseFloat(MX.$(id).value) || 0; }

  function routeCalc(originOverride) {
    var oSel = MX.$('routeOrigin').value, dSel = MX.$('routeDest').value, mode = MX.$('routeMode').value;
    var dest = findDest(dSel); if (!dest) return null;
    var oName, oLat, oLon, oParam;
    if (originOverride) {
      oName = 'আমার অবস্থান'; oLat = originOverride.lat; oLon = originOverride.lon;
      oParam = oLat + ',' + oLon;
    } else {
      var hub = findHub(oSel); if (!hub) return null;
      oName = hub.name_bn; oLat = hub.lat; oLon = hub.lon; oParam = hub.lat + ',' + hub.lon;
    }
    var straight = MX.Haversine(oLat, oLon, sLat(dest), sLon(dest));
    var road = straight * 1.3;
    lastRoadKm = Math.round(road);
    var speed = mode === 'walking' ? 4.5 : (mode === 'transit' ? 32 : 42);
    var hours = road / speed;
    var hTxt = hours < 1 ? MX.bn(Math.round(hours * 60)) + ' মিনিট' :
      'প্রায় ' + MX.bn(Math.floor(hours)) + ' ঘণ্টা ' + MX.bn(Math.round((hours % 1) * 60)) + ' মিনিট';
    MX.$('routeOut').innerHTML =
      '<b>' + MX.esc(oName) + ' → ' + MX.esc(sName(dest)) + '</b><br>' +
      'সরাসরি দূরত্ব ≈ ' + MX.bn(straight.toFixed(1)) + ' কিমি · আনুমানিক সড়ক-দূরত্ব ≈ <b>' + MX.bn(lastRoadKm) + ' কিমি</b> · ' +
      'আনুমানিক সময় ≈ ' + hTxt + ' (যানজট/বিরতি ছাড়া)<br>' +
      '<span style="font-size:14px">লাইভ ট্রাফিক, বাস-ট্রেনের অপশন ও মোড়-ধরে নির্দেশনা পেতে উপরের Maps/Waze বোতাম ব্যবহার করুন। আনুমানিক পিনের স্থানে গেটের অবস্থান যাওয়ার আগে যাচাই করুন।</span>';
    return { dest: dest, originParam: oParam, mode: mode };
  }

  function renderHubs() {
    MX.$('hubCards').innerHTML = '<h3>যাত্রা-ঘাঁটি (hub) পরিচিতি</h3><div class="mx-grid">' + hubs.map(function (h) {
      return '<article class="mx-card"><h3>🏙️ ' + MX.esc(h.name_bn) + '</h3>' +
        '<p><b>🚆 রেল:</b> ' + MX.esc(h.rail) + '</p><p><b>🚌 বাস:</b> ' + MX.esc(h.bus) + '</p>' +
        '<p><b>🛏️ থাকা:</b> ' + MX.esc(h.stay) + '</p>' +
        '<div class="mx-btns"><a class="cb-btn sm" target="_blank" rel="noopener" href="' + MX.mapsSearch('hotel', h.lat, h.lon) + '">হোটেল খুঁজুন ↗</a>' +
        '<a class="cb-btn sm ghost" target="_blank" rel="noopener" href="https://www.google.com/travel/search?q=' + encodeURIComponent('hotels in ' + h.name_bn + ' Bangladesh') + '">Google Travel ↗</a></div></article>';
    }).join('') + '</div>';
  }

  function renderItin() {
    var id = MX.$('itinSelect').value;
    var it = (travel.itineraries || []).filter(function (x) { return x.id === id; })[0];
    var box = MX.$('itinDetail');
    if (!it) { box.innerHTML = ''; return; }
    var rows = it.plan.map(function (p) {
      return '<tr><td><b>দিন ' + MX.bn(p.day) + '</b></td><td><b>' + MX.esc(p.title) + '</b><br>' + MX.esc(p.detail) + '</td></tr>';
    }).join('');
    var siteLinks = (it.sites || []).map(function (sid) {
      var s = findDest(sid);
      return s ? '<a href="explore3d.html?site=' + sid + '">' + MX.esc(sName(s)) + ' (360°)</a>' : '';
    }).filter(Boolean).join(' · ');
    box.innerHTML = '<article class="mx-card mx-print-area" id="itinPrint">' +
      '<span class="mx-badge gold">' + MX.bn(it.days) + ' দিন</span> <span class="mx-badge blue">থিম: ' + MX.esc(it.theme) + '</span> <span class="mx-badge green">ঘাঁটি: ' + MX.esc(it.base) + '</span>' +
      '<h3>' + MX.esc(it.name_bn) + ' <span class="mx-meta">· ' + MX.esc(it.name_en) + '</span></h3>' +
      '<div class="mx-scroll"><table class="mx-table"><thead><tr><th>দিন</th><th>পরিকল্পনা</th></tr></thead><tbody>' + rows + '</tbody></table></div>' +
      '<p><b>টিপস:</b> ' + (it.tips || []).map(MX.esc).join(' · ') + '</p>' +
      (siteLinks ? '<p>🔗 ' + siteLinks + '</p>' : '') +
      '<div class="mx-btns mx-no-print"><button type="button" class="cb-btn" id="itinIcs">📅 ক্যালেন্ডার ফাইল (.ics) নিন</button>' +
      '<button type="button" class="cb-btn ghost" id="itinPrintBtn">🖨️ প্রিন্ট করুন</button></div></article>';
    MX.$('itinIcs').addEventListener('click', function () {
      var v = MX.$('tripStart').value;
      if (!v) { MX.toast('আগে ভ্রমণ শুরুর তারিখ বেছে নিন'); MX.$('tripStart').focus(); return; }
      var start = new Date(v + 'T12:00:00');
      var events = it.plan.map(function (p) {
        return { date: new Date(start.getTime() + (p.day - 1) * 86400000), title: it.name_bn + ' — দিন ' + p.day + ': ' + p.title, desc: p.detail };
      });
      MX.icsDownload(it.id + '.ics', events);
      MX.toast('ইটিনারারির .ics তৈরি — Google/Apple Calendar-এ ইমপোর্ট করুন');
    });
    MX.$('itinPrintBtn').addEventListener('click', function () { window.print(); });
  }

  function renderNearby() {
    var dest = findDest(MX.$('nearbySite').value); if (!dest) return;
    var lat = sLat(dest), lon = sLon(dest);
    MX.$('nearbyGrid').innerHTML = (travel.nearby_services || []).map(function (sv) {
      return '<article class="mx-card"><span class="mx-ico">' + sv.icon + '</span> <b>' + MX.esc(sv.label_bn) + '</b>' +
        '<p class="mx-meta">“' + MX.esc(sName(dest)) + '”-এর আশপাশে</p>' +
        '<div class="mx-btns"><a class="cb-btn sm" target="_blank" rel="noopener" href="' + MX.mapsSearch(sv.query, lat, lon) + '">Maps-এ দেখুন ↗</a></div></article>';
    }).join('');
  }

  function budgetCalc() {
    var km = num('bKm'), persons = Math.max(1, num('bPersons')), days = Math.max(1, num('bDays')),
      nights = num('bNights'), rateKm = num('bRateKm'), localDay = num('bLocalDay'),
      roomRate = num('bRoomRate'), rooms = Math.max(1, num('bRooms')), foodRate = num('bFoodRate'),
      guide = num('bGuide'), entry = num('bEntry'), buffer = num('bBuffer');
    var longTransport = km * 2 * rateKm * persons;
    var local = localDay * days;
    var stay = roomRate * nights * rooms;
    var food = foodRate * days * persons;
    var guideC = guide * days;
    var entryC = entry * persons;
    var total = longTransport + local + stay + food + guideC + entryC + buffer;
    var perPerson = total / persons;
    var rows = [
      ['দূরপাল্লার যাতায়াত (আসা-যাওয়া)', longTransport],
      ['স্থানীয় যাতায়াত', local],
      ['থাকা (' + MX.bn(nights) + ' রাত × ' + MX.bn(rooms) + ' রুম)', stay],
      ['খাবার (' + MX.bn(days) + ' দিন × ' + MX.bn(persons) + ' জন)', food],
      ['গাইড', guideC],
      ['প্রবেশ ও জাদুঘর', entryC],
      ['বিবিধ বাফার', buffer]
    ].map(function (r) { return '<tr><td>' + r[0] + '</td><td style="text-align:right"><b>' + MX.money(r[1]) + '</b></td></tr>'; }).join('');
    MX.$('budgetOut').innerHTML = '<div class="mx-out mx-print-area" style="background:var(--cb-white);color:var(--cb-ink);border:1.5px solid var(--cb-line)">' +
      '<h3 style="margin-top:0">আনুমানিক মোট খরচ: <span style="color:var(--cb-bark)">' + MX.money(total) + '</span> <span class="mx-meta">(জনপ্রতি ≈ ' + MX.money(perPerson) + ')</span></h3>' +
      '<div class="mx-scroll"><table class="mx-table"><tbody>' + rows + '</tbody></table></div>' +
      '<p class="mx-mini">⚠️ এটি শুধু পরিকল্পনার আনুমানিক হিসাব — প্রকৃত ভাড়া, হোটেল-দাম ও প্রবেশমূল্য যাত্রার আগে যাচাই করুন। উৎসবের সময় ভাড়া বেড়ে যেতে পারে।</p></div>';
    try { localStorage.setItem('cb.budget.last', JSON.stringify({ total: Math.round(total), at: new Date().toISOString() })); } catch (e) { /* ignore */ }
  }

  function syncRateFields() {
    if (!travel) return;
    var r = travel.budget_rates;
    var tSel = MX.$('bTransport').value;
    if (r.transport_per_km[tSel] != null) MX.$('bRateKm').value = r.transport_per_km[tSel];
    var sSel = MX.$('bStay').value;
    if (r.stay_per_night_room[sSel] != null) MX.$('bRoomRate').value = r.stay_per_night_room[sSel];
    var fSel = MX.$('bFood').value;
    if (r.food_per_day_person[fSel] != null) MX.$('bFoodRate').value = r.food_per_day_person[fSel];
  }

  Promise.all([
    MX.fetchJson('data/travel-plus.json?v=20261024g'),
    MX.fetchJson('data/atlas-sites.json?v=20261024g')
  ]).then(function (res) {
    travel = res[0];
    atlasSites = res[1].sites || [];
    hubs = travel.hubs_detail || [];
    MX.$('routeOrigin').innerHTML = hubs.map(function (h) { return '<option value="' + MX.esc(h.id) + '">' + MX.esc(h.name_bn) + '</option>'; }).join('');
    var destOpts = allDests().map(function (s) { return '<option value="' + MX.esc(s.id) + '">' + MX.esc(sName(s)) + '</option>'; }).join('');
    MX.$('routeDest').innerHTML = destOpts;
    MX.$('nearbySite').innerHTML = destOpts;
    var wanted = new URLSearchParams(location.search).get('site');
    if (wanted && findDest(wanted)) { MX.$('routeDest').value = wanted; MX.$('nearbySite').value = wanted; }
    MX.$('itinSelect').innerHTML = travel.itineraries.map(function (it) {
      return '<option value="' + MX.esc(it.id) + '">' + MX.esc(it.name_bn) + ' (' + MX.bn(it.days) + ' দিন)</option>';
    }).join('');
    MX.$('accessTips').innerHTML = '<div class="mx-note">' + (travel.accessibility_tips || []).map(function (t) { return '<p style="margin:.3em 0">♿ ' + MX.esc(t) + '</p>'; }).join('') + '</div>';
    renderHubs(); renderItin(); renderNearby(); routeCalc(null); syncRateFields(); budgetCalc();
  }).catch(function () {
    MX.$('routeOut').textContent = 'ডেটা লোড হয়নি — সংযোগ যাচাই করে আবার খুলুন।';
  });

  ['routeOrigin', 'routeDest', 'routeMode'].forEach(function (id) {
    MX.$(id).addEventListener('change', function () { routeCalc(null); });
  });
  MX.$('routeGo').addEventListener('click', function () {
    var r = routeCalc(null); if (!r) return;
    window.open(MX.mapsDir(sLat(r.dest), sLon(r.dest), r.mode, r.originParam), '_blank', 'noopener');
  });
  MX.$('routeWaze').addEventListener('click', function () {
    var dest = findDest(MX.$('routeDest').value); if (!dest) return;
    window.open(MX.wazeLink(sLat(dest), sLon(dest)), '_blank', 'noopener');
  });
  MX.$('routeGeo').addEventListener('click', function () {
    if (!navigator.geolocation) { MX.toast('এই ডিভাইসে অবস্থান-সেবা নেই'); return; }
    MX.toast('অবস্থান অনুমতি চাওয়া হচ্ছে…');
    navigator.geolocation.getCurrentPosition(function (pos) {
      routeCalc({ lat: pos.coords.latitude, lon: pos.coords.longitude });
      MX.toast('বর্তমান অবস্থান থেকে হিসাব করা হয়েছে (অবস্থান কোথাও সংরক্ষিত হয়নি)');
    }, function () { MX.toast('অবস্থান পাওয়া যায়নি — ঘাঁটি (hub) বেছে হিসাব করুন'); }, { timeout: 12000 });
  });
  MX.$('itinSelect').addEventListener('change', renderItin);
  MX.$('nearbySite').addEventListener('change', renderNearby);
  ['bTransport', 'bStay', 'bFood'].forEach(function (id) { MX.$(id).addEventListener('change', syncRateFields); });
  MX.$('budgetCalc').addEventListener('click', budgetCalc);
  MX.$('budgetFromRoute').addEventListener('click', function () {
    if (lastRoadKm) { MX.$('bKm').value = lastRoadKm; budgetCalc(); MX.toast('রুটের আনুমানিক সড়ক-দূরত্ব বসানো হয়েছে: ' + MX.bn(lastRoadKm) + ' কিমি'); }
    else MX.toast('আগে রুট প্ল্যানারে যাত্রা-শুরু ও গন্তব্য বেছে নিন');
  });
  MX.$('budgetPrint').addEventListener('click', function () { budgetCalc(); window.print(); });
})();
