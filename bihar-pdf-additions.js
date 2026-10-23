/*!
 * bihar-pdf-additions.js
 * বৌদ্ধ ধর্মীয় কল্যাণ ট্রাস্ট (ধর্ম বিষয়ক মন্ত্রণালয়) — জেলা-ভিত্তিক ১১টি PDF তালিকা
 * থেকে তৈরি ২,৮৯৭টি বিহার/প্রতিষ্ঠান ও নির্দেশিত ৭টি বিশেষ সাইট সাইটে যোগ করে।
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

  /* ------------------------------------------------------------------
     একক ক্যাটাগরি ব্যবস্থা (ব্যবহারকারীর নির্দেশ অনুযায়ী ১২টি শ্রেণি)
     পুরোনো রেকর্ডের kind/category-ও এখানেই রূপান্তরিত হয়, তাই একই জায়গা
     দুই ক্যাটাগরিতে দেখা যায় না।
  ------------------------------------------------------------------ */
  var CATS = {
    vihara:   'বিহার',
    archaeo:  'প্রত্নাঞ্চল ও প্রত্ন নিদর্শন',
    relic:    'বুদ্ধ স্মৃতিচিহ্ন/জাদী/স্তূপ',
    medit:    'ভাবনাকেন্দ্র',
    forest:   'অরণ্যকুঠি',
    org:      'বৌদ্ধ সংঘ/সমিতি/সংগঠনসমূহ',
    social:   'বৌদ্ধ সামাজিক প্রতিষ্ঠান',
    art:      'বৌদ্ধ ললিতকলা ও সাংস্কৃতিক প্রতিষ্ঠান',
    kirtan:   'কীর্তনীয়া ও সংগীতশিল্পী',
    business: 'বৌদ্ধ ব্যবসা প্রতিষ্ঠান',
    publish:  'বৌদ্ধ প্রকাশনা ও প্রকাশক',
    edu:      'বৌদ্ধ শিক্ষা প্রতিষ্ঠান (পালি টোল, স্কুল, কলেজ, ক্রীড়া ও সাংস্কৃতিক)',
    museum:   'সংগ্রহশালা ও সংরক্ষণ',
    welfare:  'সামাজিক সেবা ও কল্যাণ প্রতিষ্ঠান (অনাথালয়, শিশু সদন)',
    elder:    'বৃদ্ধাশ্রম',
    cremat:   'শশ্মান',
    village:  'লোকালয়/পল্লী',
    verify:   'যাচাইধীন/অতিরিক্ত সূত্র প্রয়োজন'
  };
  var CAT_LIST = Object.keys(CATS).map(function (k) { return CATS[k]; });
  var CAT_ART = {
    'cat-vihara': CATS.vihara, 'cat-archaeo': CATS.archaeo
  };
  var ART_BY_CAT = {};
  ART_BY_CAT[CATS.vihara] = 'cat-vihara'; ART_BY_CAT[CATS.archaeo] = 'cat-archaeo';
  ART_BY_CAT[CATS.relic] = 'cat-relic'; ART_BY_CAT[CATS.medit] = 'cat-medit';
  ART_BY_CAT[CATS.forest] = 'cat-forest'; ART_BY_CAT[CATS.org] = 'cat-org';
  ART_BY_CAT[CATS.social] = 'cat-org'; ART_BY_CAT[CATS.art] = 'cat-edu';
  ART_BY_CAT[CATS.kirtan] = 'cat-edu'; ART_BY_CAT[CATS.business] = 'cat-village';
  ART_BY_CAT[CATS.publish] = 'cat-edu'; ART_BY_CAT[CATS.edu] = 'cat-edu';
  ART_BY_CAT[CATS.museum] = 'cat-museum'; ART_BY_CAT[CATS.welfare] = 'cat-welfare';
  ART_BY_CAT[CATS.elder] = 'cat-elder'; ART_BY_CAT[CATS.cremat] = 'cat-cremat';
  ART_BY_CAT[CATS.village] = 'cat-village'; ART_BY_CAT[CATS.verify] = 'cat-verify';
  function artFor(category) {
    var key = ART_BY_CAT[category];
    return key ? 'buddhist-heritage-bd/assets/categories/' + key + '.svg' : null;
  }
  /* নাম/পুরোনো লেবেল থেকে একক ক্যাটাগরি — বিল্ডার (catrule.py) এর হুবহু একই অগ্রাধিকার */
  function canonicalCategory(text, name) {
    var t = String(text || '') + ' ' + String(name || '');
    if (/বৃদ্ধাশ্রুম|বৃদ্ধাশ্রম/.test(t)) return CATS.elder;
    if (/অনাথ|শিশু\s*সদন|কল্যাণ প্রতিষ্ঠান|সমাজসেবা/.test(t)) return CATS.welfare;
    if (/শ্মশান|শশ্মান/.test(t)) return CATS.cremat;
    if (/কীর্তন/.test(t)) return CATS.kirtan;
    if (/ললিতকলা|সাংস্কৃতিক গোষ্ঠী|সাংস্কৃতিক প্রতিষ্ঠান|নাট্যদল|নাট্য সংঘ/.test(t)) return CATS.art;
    if (/প্রকাশন|প্রকাশক|মুখপত্র|সাময়িকী|পত্রিকা/.test(t)) return CATS.publish;
    if (/ব্যবসা|ব্যবসায়ী|বাণিজ্য/.test(t)) return CATS.business;
    if (/বিহার/.test(t)) return CATS.vihara;
    if (/কুটির|অরণ্য/.test(t)) return CATS.forest;
    if (/ভাবনা|ধ্যান/.test(t)) return CATS.medit;
    if (/জাদী|জাদি|স্মৃতিচিহ্ন/.test(t)) return CATS.relic;
    if (/প্রত্নাঞ্চল|প্রত্ননিদর্শন|প্রত্ন নিদর্শন|ঢিবি|মুড়া|প্রত্নস্থল|প্রত্ন/.test(t)) return CATS.archaeo;
    if (/জাদুঘর|সংগ্রহশালা|মহাবিহার/.test(t)) return CATS.museum;
    if (/পালি\s*টোল|স্কুল|কলেজ|বিশ্ববিদ্যাল|শিক্ষা|ক্রীড়া/.test(t)) return CATS.edu;
    if (/সংঘ|সমিতি|সংগঠন|ফেডারেশন|পরিষদ|কমিটি|সমাজ/.test(t)) return CATS.org;
    if (/পল্লী|লোকালয়|কমিউনিটি|গ্রাম/.test(t)) return CATS.village;
    if (/যাচাই|লোকধর্ম|গবেষণা/.test(t)) return CATS.verify;
    return CATS.vihara;
  }
  /* পুরোনো রেকর্ডের kind/category → একক ক্যাটাগরি, এবং ছবি না থাকলে শ্রেণি-চিত্রণ */
  function normalizeExisting(list) {
    var changed = 0;
    list.forEach(function (p) {
      var best = p.category || p.kind || '';
      if (CAT_LIST.indexOf(best) < 0) {
        if (p.verificationPending) best = CATS.verify;
        best = canonicalCategory(best, p.name);
      }
      var c = best;
      if (p.category !== c) changed++;
      p.category = c;
      p.kind = c;
      if (!p.customImageUrl && !p.imageKey) {
        var art = artFor(c);
        if (art) { p.customImageUrl = art; p.sourceLabel = 'শ্রেণি-চিত্রণ (প্রকৃত ছবি নয়)'; p.source = art; }
      }
    });
    return changed;
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
      kind: r.category || canonicalCategory((r.type || ''), r.name),
      category: r.category || canonicalCategory((r.type || ''), r.name),
      coords: coords,
      imageKey: null,
      customImageUrl: artFor(r.category || canonicalCategory((r.type || ''), r.name)),
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
    var normalized = normalizeExisting(list);
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
    normalizeExisting(list);
    updateCounts(added);
    document.dispatchEvent(new CustomEvent('bihar-additions-ready', { detail: window.__biharPdfAdditions }));
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once: true });
  else run();
})();
