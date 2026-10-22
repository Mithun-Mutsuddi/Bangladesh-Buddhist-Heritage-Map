/* ক্রমবাহী (cascading) বাংলাদেশ প্রশাসনিক ফিল্টার।
   এখন তালিকা আসে সাইটের নিজের ফাইল data/bd-geo.json থেকে (৮ বিভাগ, ৬৪ জেলা, ৪৯৫ উপজেলা, ৪,৫৪০ ইউনিয়ন),
   বাইরের কোনো সার্ভারের উপর নির্ভর করে না। প্রতিটি অপশনে রেকর্ড-সংখ্যা দেখানো হয়।
   প্রশাসনিক নাম = রেফারেন্স; কোনো স্থানের সত্যতা নিজে থেকে প্রমাণ করে না। */
(() => {
'use strict';
const $ = id => document.getElementById(id);
const LOCAL = 'data/bd-geo.json';
const REMOTE = 'https://iqbalhasandev.github.io/bangladesh-geo-json/bangladesh-geo.json';
let tree = null, loadPromise = null;

const nfc = s => String(s == null ? '' : s).normalize('NFC').replace(/[\u200c\u200d]/g, '').trim();
const bnName = x => nfc(x && (x.bn_name || x.n));
const norm = v => nfc(v).toLocaleLowerCase('bn').replace(/[\s\u200c\u200d-]+/g, ' ').trim();
const NOISE = /^[\s:ঃ+.,\-–—/]+|[\s:ঃ+.,\-–—/]+$/g;
const cleanName = v => nfc(v).replace(/^[\s:ঃ+.,\-–—/]+/, '').replace(/[\s:ঃ+.,\-–—/]+$/, '').replace(/\s{2,}/g, ' ');

function uniqueSorted(values) {
  const seen = new Map();
  values.forEach(v => { const c = cleanName(v); if (!c) return; const k = norm(c); if (!seen.has(k)) seen.set(k, c); });
  return [...seen.values()].sort((a, b) => a.localeCompare(b, 'bn'));
}

/* অপশন তৈরি: নামের পাশে রেকর্ড-সংখ্যা, যাতে বোঝা যায় কোথায় কত প্রতিষ্ঠান আছে */
function refill(el, values, prompt, keep, counts) {
  if (!el) return;
  const old = keep ? el.value : 'all';
  const names = uniqueSorted(values);
  const opts = [new Option(prompt, 'all')];
  names.forEach(n => {
    const c = counts ? (counts.get(norm(n)) || 0) : null;
    opts.push(new Option(c ? `${n} (${c.toLocaleString('bn-BD')})` : n, n));
  });
  el.replaceChildren(...opts);
  el.value = opts.some(o => o.value === old) ? old : 'all';
}

const records = () => (Array.isArray(window.destinations) ? window.destinations : []);
const sel = id => ($(id) ? $(id).value : 'all');

function divisions() { const v = sel('divisionFilter'); return (tree || []).filter(d => v === 'all' || norm(bnName(d)) === norm(v)); }
function districtNodes() { const v = sel('districtFilter'); return divisions().flatMap(d => d.d || []).filter(d => v === 'all' || norm(bnName(d)) === norm(v)); }
function upazilaNodes() { const v = sel('upazilaFilter'); return districtNodes().flatMap(d => d.u || []).filter(u => v === 'all' || norm(bnName(u)) === norm(v)); }
function allDistrictNodes() { return (tree || []).flatMap(d => d.d || []); }

/* রেকর্ড থেকে সংখ্যা-গণনা (নাম অনুযায়ী) */
function countBy(field, filterFn) {
  const m = new Map();
  records().filter(filterFn).forEach(p => {
    const k = norm(p[field]);
    if (k) m.set(k, (m.get(k) || 0) + 1);
  });
  return m;
}

function refreshDivision() {
  refill($('divisionFilter'), (tree || []).map(bnName), 'সব বিভাগ', true);
}

function refreshDistricts(downOnly) {
  const div = sel('divisionFilter');
  const names = allDistrictNodes().filter(d => div === 'all' || norm(parentDivision(d)) === norm(div)).map(bnName);
  const counts = countBy('district', p => div === 'all' || norm(p.division) === norm(div));
  refill($('districtFilter'), names, 'সব জেলা', !downOnly, counts);
}

function parentDivision(districtNode) {
  const div = (tree || []).find(d => (d.d || []).some(x => x === districtNode));
  return div ? bnName(div) : '';
}

function refreshUpazilas(downOnly) {
  const dist = sel('districtFilter');
  const names = districtNodes().filter(d => dist === 'all' || true).flatMap(d => d.u || []).map(bnName);
  const counts = countBy('upazila', p => (dist === 'all' || norm(p.district) === norm(dist)));
  refill($('upazilaFilter'), dist === 'all' ? [] : names, 'সব উপজেলা', !downOnly, counts);
}

function refreshUnions(downOnly) {
  const up = sel('upazilaFilter');
  const pool = upazilaNodes().filter(u => up === 'all' || norm(bnName(u)) === norm(up)).flatMap(u => u.un || []).map(nfc);
  const counts = countBy('union', p => up === 'all' || norm(p.upazila) === norm(up));
  refill($('unionFilter'), up === 'all' ? [] : pool, 'সব ইউনিয়ন / পৌরসভা', !downOnly, counts);
}

/* থানা: রেকর্ডে থাকা থানা + নির্বাচিত উপজেলার নাম (বাংলাদেশে থানা ও উপজেলা প্রায়ই একই) */
function refreshThanas(downOnly) {
  const dist = sel('districtFilter'), up = sel('upazilaFilter');
  const recThana = records().filter(p => (dist === 'all' || norm(p.district) === norm(dist)) && (up === 'all' || norm(p.upazila) === norm(up))).map(p => p.thana);
  const upNames = up !== 'all' ? [up] : districtNodes().filter(d => dist === 'all' || norm(bnName(d)) === norm(dist)).flatMap(d => d.u || []).map(bnName);
  const counts = countBy('thana', p => (dist === 'all' || norm(p.district) === norm(dist)) && (up === 'all' || norm(p.upazila) === norm(up)));
  refill($('thanaFilter'), trimToData([...recThana, ...upNames], counts), 'সব থানা', !downOnly, counts);
}

/* জেলার ৪০টি উপজেলার নাম দেখানো মানে ফিল্টার অকেজো — যেখানে রেকর্ড আছে সেগুলোই প্রথমে */
function trimToData(names, counts) {
  const withData = names.filter(n => counts.get(norm(n)));
  return withData.length >= 1 ? withData : names;
}

function refreshAll(keep) {
  if (!tree) { refreshFromRecords(); return; }
  refreshDivision();
  refreshDistricts(!keep);
  refreshUpazilas(!keep);
  refreshUnions(!keep);
  refreshThanas(!keep);
}

function refreshFromRecords() {
  const recs = records();
  const counts = { district: new Map(), upazila: new Map(), thana: new Map(), union: new Map() };
  const push = (m, v) => { const k = norm(v); if (k) m.set(k, (m.get(k) || 0) + 1); };
  recs.forEach(p => { push(counts.district, p.district); push(counts.upazila, p.upazila); push(counts.thana, p.thana); push(counts.union, p.union); });
  refill($('districtFilter'), recs.map(p => p.district), 'সব জেলা', true, counts.district);
  refill($('upazilaFilter'), recs.map(p => p.upazila), 'সব উপজেলা', true, counts.upazila);
  refill($('thanaFilter'), recs.map(p => p.thana), 'সব থানা', true, counts.thana);
  refill($('unionFilter'), recs.map(p => p.union), 'সব ইউনিয়ন', true, counts.union);
}

/* রেকর্ডের লেখা থেকে জেলা/উপজেলা/ইউনিয়ন অনুমান — শুধু যখন নামটি হুবহু একটি প্রশাসনিক নামের সঙ্গে মেলে */
function inferLocalityMetadata() {
  records().forEach(place => {
    if (!place || !place.district) return;
    const d = allDistrictNodes().find(item => norm(bnName(item)) === norm(place.district));
    if (!d) return;
    const searchable = norm([place.name, place.village, place.summary].filter(Boolean).join(' '));
    if (!place.upazila) {
      const hits = (d.u || []).filter(u => { const bn = norm(bnName(u)); return bn.length > 2 && searchable.includes(bn); });
      if (hits.length === 1) { place.upazila = bnName(hits[0]); place.adminLocationStatus = 'text-match-unverified'; }
    }
    if (place.upazila && !place.union) {
      const parent = (d.u || []).find(u => norm(bnName(u)) === norm(place.upazila));
      if (parent) {
        const hits = (parent.un || []).filter(u => { const bn = norm(u); return bn.length > 3 && searchable.includes(bn); });
        if (hits.length === 1) { place.union = nfc(hits[0]); place.adminLocationStatus = 'text-match-unverified'; }
      }
    }
    if (!place.thana && place.upazila) place.thana = place.upazila;
  });
}

function refreshCategories() {
  const select = $('categoryFilter'); if (!select) return;
  const ORDER = [
    'বিহার',
    'প্রত্নাঞ্চল ও প্রত্ন নিদর্শন',
    'বুদ্ধ স্মৃতিচিহ্ন/জাদী/স্তূপ',
    'ভাবনাকেন্দ্র',
    'অরণ্যকুঠি',
    'বৌদ্ধ সংঘ/সমিতি/সংগঠনসমূহ',
    'বৌদ্ধ সামাজিক প্রতিষ্ঠান',
    'বৌদ্ধ ললিতকলা ও সাংস্কৃতিক প্রতিষ্ঠান',
    'কীর্তনীয়া ও সংগীতশিল্পী',
    'বৌদ্ধ শিক্ষা প্রতিষ্ঠান (পালি টোল, স্কুল, কলেজ, ক্রীড়া ও সাংস্কৃতিক)',
    'বৌদ্ধ প্রকাশনা ও প্রকাশক',
    'বৌদ্ধ ব্যবসা প্রতিষ্ঠান',
    'সংগ্রহশালা ও সংরক্ষণ',
    'সামাজিক সেবা ও কল্যাণ প্রতিষ্ঠান (অনাথালয়, শিশু সদন)',
    'বৃদ্ধাশ্রম',
    'শশ্মান',
    'লোকালয়/পল্লী',
    'যাচাইধীন/অতিরিক্ত সূত্র প্রয়োজন'
  ];
  const previous = select.value || 'all';
  const counts = new Map();
  records().forEach(p => { const k = norm(p.category); if (k) counts.set(k, (counts.get(k) || 0) + 1); });
  select.replaceChildren(
    new Option('সব ক্যাটাগরি', 'all'),
    ...ORDER.map(c => new Option(`${c} (${(counts.get(norm(c)) || 0).toLocaleString('bn-BD')})`, c))
  );
  if ([...select.options].some(o => o.value === previous)) select.value = previous;
}

function runSearch() { const input = $('placeSearch'); if (input) input.dispatchEvent(new Event('input', { bubbles: true })); }

function note(text) { const n = document.querySelector('.admin-filter-note'); if (n) n.textContent = text; }

async function loadGeo() {
  if (tree) return tree;
  if (!loadPromise) {
    const tryFetch = url => fetch(url, { cache: 'force-cache' }).then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); });
    loadPromise = tryFetch(LOCAL)
      .catch(() => tryFetch(REMOTE))
      .then(data => {
        if (!Array.isArray(data)) throw new Error('প্রশাসনিক ডেটার ফরম্যাট সঠিক নয়');
        tree = data;
        inferLocalityMetadata();
        refreshDivision(); refreshAll(false); refreshCategories();
        const total = tree.reduce((a, d) => a + (d.d || []).length, 0);
        const bn = n => String(n).replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[d]);
        note(`প্রশাসনিক তালিকা লোড হয়েছে — ${bn(tree.length)} বিভাগ, ${bn(total)} জেলা, ${bn(tree.reduce((a, d) => a + (d.d || []).reduce((b, x) => b + (x.u || []).length, 0), 0))} উপজেলা। প্রতিটি নামের পাশে বন্ধনীতে সেই এলাকার প্রতিষ্ঠান-সংখ্যা দেখানো হচ্ছে।`);
        return tree;
      })
      .catch(err => {
        loadPromise = null;
        refreshFromRecords(); refreshCategories();
        note('প্রশাসনিক তালিকা লোড করা যায়নি (' + err.message + '); রেকর্ড থেকে জেলা/উপজেলা/থানা/ইউনিয়ন ফিল্টার চালু আছে।');
        throw err;
      });
  }
  return loadPromise;
}

document.addEventListener('DOMContentLoaded', () => {
  refreshFromRecords(); refreshCategories();
  setTimeout(() => loadGeo().catch(() => {}), 400);
  $('divisionFilter')?.addEventListener('change', () => { refreshDistricts(true); refreshUpazilas(true); refreshUnions(true); refreshThanas(true); runSearch(); });
  $('districtFilter')?.addEventListener('change', () => { refreshUpazilas(true); refreshUnions(true); refreshThanas(true); runSearch(); });
  $('upazilaFilter')?.addEventListener('change', () => { refreshUnions(true); refreshThanas(true); runSearch(); });
  $('thanaFilter')?.addEventListener('change', runSearch);
  $('unionFilter')?.addEventListener('change', runSearch);
  document.addEventListener('bihar-additions-ready', () => { refreshCategories(); refreshAll(true); });
});
})();
