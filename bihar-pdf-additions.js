/*!
 * bihar-pdf-additions.js
 * বৌদ্ধ ধর্মীয় কল্যাণ ট্রাস্ট (ধর্ম বিষয়ক মন্ত্রণালয়) — জেলা-ভিত্তিক ১১টি PDF তালিকা
 * থেকে তৈরি ২,৯৪৩টি বিহার/প্রতিষ্ঠান ও নির্দেশিত ৭টি বিশেষ সাইট সাইটে যোগ করে।
 *
 * ডেটা ফাইল: data/heritage-sites-additions.json
 *   - "bulk"    : কমপ্যাক্ট সারি (প্রতিটি সারি "bulk_fields" ক্রম অনুযায়ী)
 *   - "records" : পূর্ণ বিবরণসহ বিশেষ সাইট
 *
 * নীতি:
 *   - যেখানে PDF-এ ফোন বা ভিক্ষুর নাম নেই, সেখানে ফোন/যোগাযোগ ফাঁকা রাখা হয় — কোনো নম্বর অনুমান করা হয় না।
 *   - একই নাম + জেলা আগে থেকে থাকলে নতুন এন্ট্রি তৈরি করা হয় না (duplicate প্রতিরোধ)।
 *   - পিনগুলো উপজেলা/জেলা-কেন্দ্রিক আনুমানিক, তাই pinApproximate = true।
 */
(function () {
  'use strict';
  var DATA_URL = 'data/heritage-sites-additions.json';
  var DATA_VERSION = '20261021v3';
  var BN = '০১২৩৪৫৬৭৮৯';
  function bn(num) { return String(num).replace(/\d/g, function (d) { return BN[+d]; }); }
  function norm(s) {
    return String(s || '')
      .normalize('NFKC')
      .replace(/[\u09BC\u09DF]/g, '')
      .replace(/[\p{P}\p{Z}\s]+/gu, '')
      .toLocaleLowerCase('bn');
  }
  function kindFor(type, category) {
    var t = String(type || '') + ' ' + String(category || '');
    if (/প্রত্নস্থল|মহাবিহার|স্তূপ/.test(t)) return 'প্রত্নস্থল';
    if (/প্যাগোডা|ক্যাং/.test(t)) return 'বিহার';           // ফিল্টারে “বিহার ও প্যাগোডা”
    if (/বৌদ্ধ প্রতিষ্ঠান|মঠ|সংঘ|সমিতি/.test(t)) return 'প্রতিষ্ঠান';
    if (/ধ্যান|ভাবনা|অরণ্য|কুটির/.test(t)) return 'ধ্যানকেন্দ্র';
    if (/শ্মশান/.test(t)) return 'শ্মশান';
    if (/বিহার|মন্দির|তীর্থ/.test(t)) return 'বিহার';
    return 'প্রতিষ্ঠান';
  }
  function summaryFor(r) {
    var bits = [];
    if (r.village) bits.push('গ্রাম/এলাকা: ' + r.village);
    if (r.post_office) bits.push('ডাকঘর: ' + r.post_office);
    if (r.thana) bits.push('থানা: ' + r.thana);
    if (r.upazila) bits.push('উপজেলা: ' + r.upazila);
    if (r.district) bits.push('জেলা: ' + r.district);
    if (r.union) bits.push('ইউনিয়ন: ' + r.union);
    if (r.mobile) bits.push('মোবাইল: ' + r.mobile);
    if (r.contact_person) bits.push('যোগাযোগ: ' + r.contact_person);
    return bits.length ? bits.join(' · ') : 'নাম বৌদ্ধ ধর্মীয় কল্যাণ ট্রাস্টের জেলা-তালিকা থেকে নেওয়া।';
  }
  function historyFor(r) {
    var s = summaryFor(r);
    var extra = 'তথ্যসূত্র: বৌদ্ধ ধর্মীয় কল্যাণ ট্রাস্টের জেলা-ভিত্তিক বিহার তালিকা';
    if (r.source_pdf) extra += ' (' + r.source_pdf + ')';
    extra += '। এই এন্ট্রির পিন উপজেলা/জেলা-কেন্দ্রিক আনুমানিক; যাত্রার আগে সরাসরি যোগাযোগ করে ঠিকানা যাচাই করুন।';
    return s + '। ' + extra;
  }
  function buildPlace(r) {
    var lat = r.lat != null ? r.lat : (r.location_lat_long && r.location_lat_long.latitude);
    var lon = r.lon != null ? r.lon : (r.location_lat_long && r.location_lat_long.longitude);
    var latN = Number(lat), lonN = Number(lon);
    var coords = isFinite(latN) && isFinite(lonN) && latN && lonN ? [latN, lonN] : null;
    var summary = r.summary || summaryFor(r);
    var history = r.history || historyFor(r);
    return {
      id: r.id,
      name: r.name,
      name_en: r.name_en || null,
      district: r.district || null,
      division: r.division || 'চট্টগ্রাম',
      upazila: r.upazila || null,
      thana: r.thana || null,
      union: r.union || null,
      village: r.village || null,
      postOffice: r.post_office || null,
      kind: kindFor(r.type, r.category),
      category: r.category || 'বিহার ও তীর্থস্থান',
      coords: coords,
      imageKey: null,
      contactPerson: r.contact_person || null,
      mobile: r.mobile || null,
      pinApproximate: r.pin_approximate !== false,
      verificationPending: r.verification_status === 'needs-verification',
      verificationNote: r.verification_note || null,
      summary: summary,
      history: history,
      source: r.source_url || 'https://brwt.gov.bd/pages/static-pages/6922dbb0933eb65569e0bdb6',
      sourceLabel: r.source_label || 'বৌদ্ধ ধর্মীয় কল্যাণ ট্রাস্ট (ধর্ম বিষয়ক মন্ত্রণালয়) — জেলা-ভিত্তিক বিহার তালিকা',
      dhamma: 'সক্রিয় ধর্মীয় প্রতিষ্ঠানে স্থানীয় রীতি ও অনুমতি মানুন; অনুমতি ছাড়া ব্যক্তির ছবি তুলবেন না।',
      quoteRef: r.source_url || '',
      trip: r.travel_note || 'যাত্রার আগে প্রতিষ্ঠানের ফোন/যোগাযোগ যাচাই করে ঠিকানা নিশ্চিত করুন; পিন আনুমানিক হতে পারে।',
      sourcePdf: r.source_pdf || null
    };
  }
  function expandBulk(data) {
    var fields = data.bulk_fields || [];
    var rows = data.bulk || [];
    var out = [];
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i], r = {};
      for (var j = 0; j < fields.length; j++) r[fields[j]] = row[j];
      r.pin_approximate = true;
      r.verification_status = r.verification_status || 'official-trust-list';
      out.push(r);
    }
    return out;
  }
  function updateCounts(total) {
    var a = window.destinations || [];
    ['directoryRecordCount'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.textContent = bn(a.length);
    });
    var pins = a.filter(function (p) { return p.coords; }).length;
    ['mapGalleryEntryCount', 'mapGalleryEntryCount2'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.textContent = bn(String(a.length).replace(/\B(?=(\d{3})+(?!\d))/g, ','));
    });
    var pinEl = document.getElementById('mapGalleryPinCount');
    if (pinEl) pinEl.textContent = bn(String(pins).replace(/\B(?=(\d{3})+(?!\d))/g, ','));
    var heroCount = document.getElementById('heroRecordCount');
    if (heroCount) heroCount.textContent = bn(a.length);
    var status = document.getElementById('mapActionStatus');
    if (status && !status.dataset.context) {
      status.dataset.context = 'pdf-additions';
      status.textContent = bn(total) + 'টি বিহার/প্রতিষ্ঠান PDF তালিকা থেকে যোগ হয়েছে; ফোন নম্বর না থাকা এন্ট্রিতে যোগাযোগ ফাঁকা রাখা হয়েছে।';
    }
  }
  async function run() {
    if (!Array.isArray(window.destinations)) return;
    var res;
    try {
      res = await fetch(new URL(DATA_URL + '?v=' + DATA_VERSION, document.baseURI), { cache: 'force-cache' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
    } catch (err) {
      console.error('বিহার তালিকা লোড করা যায়নি', err);
      return;
    }
    var data = await res.json();
    var raw = expandBulk(data).concat(data.records || []);
    var list = window.destinations;
    var ids = new Set(list.map(function (p) { return String(p.id); }));
    /* duplicate প্রতিরোধ: নাম + জেলা + গ্রাম/থানা/উপজেলা একসাথে মিললেই duplicate ধরা হয়।
       শুধু নাম মিললে নয় — একই নামের বিহার ভিন্ন জেলা বা ভিন্ন গ্রামে থাকতে পারে। */
    var nameDistrict = new Set();
    var nameOnly = new Map();
    list.forEach(function (p) {
      [p.name, p.name_en].concat(p.aliases || []).filter(Boolean).forEach(function (n) {
        var key = norm(n);
        if (!key) return;
        var dkey = norm(p.district) + '|' + norm(p.village || p.thana || p.upazila || '');
        nameDistrict.add(key + '|' + dkey);
        nameOnly.set(key, (nameOnly.get(key) || 0) + 1);
      });
    });
    var added = 0, skipped = 0;
    for (var k = 0; k < raw.length; k++) {
      var r = raw[k];
      if (!r.name || r.id == null) continue;
      var key = norm(r.name);
      var dkey = norm(r.district) + '|' + norm(r.village || r.thana || r.upazila || '');
      var dup = ids.has(String(r.id)) || nameDistrict.has(key + '|' + dkey) || (!norm(r.district) && nameOnly.has(key));
      if (dup) { skipped++; continue; }
      var place = buildPlace(r);
      list.push(place);
      ids.add(String(r.id));
      nameDistrict.add(key + '|' + dkey);
      nameOnly.set(key, (nameOnly.get(key) || 0) + 1);
      added++;
    }
    window.__biharPdfAdditions = { added: added, skipped: skipped, total: raw.length };
    console.info('বিহার PDF তালিকা যোগ হয়েছে', window.__biharPdfAdditions);
    try {
      if (typeof window.renderPlaces === 'function') window.renderPlaces();
      if (typeof window.refreshAdminFilters === 'function') window.refreshAdminFilters();
    } catch (e) { console.warn(e); }
    updateCounts(added);
    document.dispatchEvent(new CustomEvent('bihar-additions-ready', { detail: window.__biharPdfAdditions }));
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once: true });
  else run();
})();
