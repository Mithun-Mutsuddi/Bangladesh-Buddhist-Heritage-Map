/* বুদ্ধবংশ বিভাগের ডেটা-যাচাই — node --test tests/buddha-vamsa-data.test.mjs
   লক্ষ্য: JSON বৈধতা, আইডি-অনন্যতা, সময়রেখার সংখ্যা, ভাঙা লিংক ও ছবির ক্রেডিট থাকা। */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const data = (name) => JSON.parse(readFileSync(join(here, '..', 'data', 'buddha-vamsa', name), 'utf8'));

const BENGALI = /[\u0980-\u09FF]/;

test('all buddha-vamsa data files parse and carry a schema version', () => {
  const files = ['meta.json', 'dynasties.json', 'kings.json', 'lineage.json', 'jatakas.json', 'quotes.json',
    'inscriptions.json', 'places.json', 'sculptures.json', 'culture.json', 'archives.json', 'media.json', 'images.json'];
  for (const file of files) {
    const payload = data(file);
    assert.ok(payload.schema_version, `${file} has no schema_version`);
    assert.match(payload.schema_version, /2026-10-29/);
  }
});

test('dynasties have unique ids, ordered years and Bengali text', () => {
  const { dynasties } = data('dynasties.json');
  assert.ok(dynasties.length >= 30, 'expected at least 30 dynasties');
  const ids = new Set();
  for (const dynasty of dynasties) {
    assert.ok(!ids.has(dynasty.id), `duplicate dynasty id ${dynasty.id}`);
    ids.add(dynasty.id);
    assert.ok(Number.isFinite(dynasty.start) && Number.isFinite(dynasty.end), `${dynasty.id} missing years`);
    assert.ok(dynasty.start < dynasty.end, `${dynasty.id} start must be before end`);
    assert.ok(dynasty.start >= -1000 && dynasty.end <= 2100, `${dynasty.id} years out of range`);
    assert.ok(BENGALI.test(dynasty.name), `${dynasty.id} name is not Bengali`);
    assert.ok(Number.isFinite(dynasty.geo.lat) && Number.isFinite(dynasty.geo.lon), `${dynasty.id} missing geo`);
    assert.ok(Math.abs(dynasty.geo.lat) <= 90 && Math.abs(dynasty.geo.lon) <= 180, `${dynasty.id} geo out of range`);
    assert.ok(dynasty.sources.length > 0 && /^https?:\/\//.test(dynasty.sources[0].url), `${dynasty.id} has no source url`);
  }
});

test('kings carry a certainty level that the UI understands', () => {
  const { kings, certainty_labels: labels } = data('kings.json');
  assert.ok(kings.length >= 30);
  const ids = new Set();
  for (const king of kings) {
    assert.ok(!ids.has(king.id), `duplicate king id ${king.id}`);
    ids.add(king.id);
    assert.ok(['historical', 'mixed', 'traditional'].includes(king.certainty), `${king.id} bad certainty`);
    assert.ok(labels[king.certainty], `${king.id} certainty has no Bengali label`);
    assert.ok(BENGALI.test(king.summary), `${king.id} summary is not Bengali`);
    assert.ok(king.evidence && king.evidence.length > 10, `${king.id} has no evidence note`);
  }
  for (const required of ['bimbisara', 'udayana', 'devanampiya-tissa', 'suddhodana', 'mahanama', 'pasenadi', 'ajatashatru', 'brahmadatta', 'sibi', 'menander']) {
    assert.ok(ids.has(required), `expected the requested ruler "${required}" in the dataset`);
  }
});

test('rulers whose full profile lives in heritage-kings.json are linked, not duplicated', () => {
  const { kings, linkedProfiles } = data('kings.json');
  assert.ok(Array.isArray(linkedProfiles) && linkedProfiles.length >= 3);
  const localIds = new Set(kings.map((k) => k.id));
  const registry = JSON.parse(readFileSync(new URL('../data/heritage-kings.json', import.meta.url), 'utf8'));
  const registryIds = new Set(registry.kings.map((k) => k.id));
  for (const linked of linkedProfiles) {
    // একই ব্যক্তির প্রোফাইল দুই ফাইলে দুই রকম নয় — মূল এন্ট্রি একটাই
    assert.ok(!localIds.has(linked.id), `${linked.id} is duplicated inside kings.json`);
    const target = linked.href.split('id=')[1];
    assert.ok(registryIds.has(target), `${linked.id} points at a missing heritage-kings record`);
    assert.equal(linked.canonical, 'data/heritage-kings.json');
  }
  for (const id of ['ashoka', 'kanishka']) {
    assert.ok(!localIds.has(id), `${id} must live only in heritage-kings.json`);
    assert.ok(registry.kings.some((k) => k.crossPage && k.crossPage.startsWith('buddha-vamsa')), `${id} needs a back-link to buddha-vamsa`);
  }
});

test('riddhi section covers powers and events with place, time and source', () => {
  const riddhi = data('riddhi.json');
  assert.ok(riddhi.powers.length >= 6);
  assert.ok(riddhi.events.length >= 10);
  for (const p of riddhi.powers) {
    assert.ok(BENGALI.test(p.name) && BENGALI.test(p.desc), `${p.id} not Bengali`);
    assert.ok(p.who && p.where && p.when && p.src, `${p.id} missing who/where/when/src`);
  }
  for (const e of riddhi.events) {
    assert.ok(BENGALI.test(e.name) && BENGALI.test(e.place), `${e.id} not Bengali`);
    assert.ok(e.when && e.who && e.desc, `${e.id} missing time/who/description`);
  }
  assert.ok(BENGALI.test(riddhi.legacy));
});

test('archives stay in one place and never fake an image', () => {
  const { archives } = data('archives.json');
  const images = data('images.json').images;
  const ids = new Set();
  for (const a of archives) {
    assert.ok(!ids.has(a.id), `duplicate archive id ${a.id}`);
    ids.add(a.id);
    if (a.imgKey) assert.ok(images[a.imgKey], `${a.id} points at a missing image key ${a.imgKey}`);
    else assert.ok(BENGALI.test(a.note || ''), `${a.id} without image must say why`);
  }
  // পোস্টার/চলচ্চিত্র-পোস্টার/আলোকচিত্র media.json-এ থাকে, আর্কাইভে পুনরাবৃত্তি নয়
  const media = data('media.json').media;
  const posterIds = media.filter((m) => m.kind === 'পোস্টার').map((m) => m.id);
  assert.ok(posterIds.length >= 1);
  for (const pid of posterIds) assert.ok(!ids.has(pid), `${pid} duplicated between archives and media`);
});

test('lineage lists both sides and states the honest verdict about living descendants', () => {
  const lineage = data('lineage.json');
  assert.ok(lineage.fatherSide.chain.length >= 5);
  assert.ok(lineage.motherSide.chain.length >= 4);
  assert.ok(lineage.tree.nodes.length >= 15);
  const verdict = JSON.stringify(lineage.present);
  assert.match(verdict, /প্রমাণ নেই/);
  assert.ok(lineage.present.streams.length === 4);
});

test('jatakas, quotes and inscriptions are well formed', () => {
  const { jatakas } = data('jatakas.json');
  assert.ok(jatakas.length >= 12);
  for (const jataka of jatakas) {
    assert.ok(Number.isInteger(jataka.no) && jataka.no > 0, `${jataka.id} needs a jataka number`);
    assert.ok(jataka.summary.length > 60, `${jataka.id} summary too short`);
    assert.ok(jataka.sources[0].url.startsWith('https://'));
  }
  const { quotes } = data('quotes.json');
  assert.ok(quotes.length >= 18);
  for (const quote of quotes) {
    assert.ok(quote.pali.length > 20, `${quote.id} missing pali`);
    assert.ok(quote.bn.length > 20, `${quote.id} missing Bengali meaning`);
    assert.ok(quote.whereFound.length > 0, `${quote.id} missing 'where found' evidence`);
  }
  const { inscriptions } = data('inscriptions.json');
  assert.ok(inscriptions.length >= 18);
  assert.ok(inscriptions.every((i) => i.text && i.significance && i.kept));
});

test('places, sculptures and culture entries are complete', () => {
  const places = data('places.json').places;
  assert.ok(places.length >= 40);
  for (const place of places) {
    assert.ok(Number.isFinite(place.lat) && Number.isFinite(place.lon), `${place.id} missing coordinates`);
    assert.ok(BENGALI.test(place.note), `${place.id} note is not Bengali`);
  }
  const sculptures = data('sculptures.json').sculptures;
  assert.ok(sculptures.length >= 25);
  assert.ok(sculptures.every((s) => s.status && s.museum && s.note));
  const culture = data('culture.json');
  for (const key of ['artStyles', 'music', 'dance', 'dress', 'poetry', 'stories', 'myths', 'creatures', 'festivals']) {
    assert.ok(Array.isArray(culture[key]) && culture[key].length >= 4, `culture.${key} too small`);
  }
});

test('every resolved image keeps author, licence and source', () => {
  const images = data('images.json').images;
  assert.ok(Object.keys(images).length >= 100, 'expected at least 100 resolved images');
  for (const [key, img] of Object.entries(images)) {
    assert.ok(img.image.startsWith('https://'), `${key} has no image url`);
    assert.ok(img.credit && img.credit !== '', `${key} has no author credit`);
    assert.ok(img.license && img.license !== '', `${key} has no licence`);
    assert.ok(img.source.startsWith('https://'), `${key} has no source link`);
  }
});

test('page shell references the data bundle and keeps the shared nav', () => {
  const html = readFileSync(join(here, '..', 'buddha-vamsa.html'), 'utf8');
  assert.match(html, /id="bvHeader"|id="cbHeader"/);
  assert.match(html, /brand\.js/);
  assert.match(html, /buddha-vamsa\.js/);
  assert.match(html, /lang="bn"/);
  const structure = JSON.parse(readFileSync(join(here, '..', 'data', 'site-structure.json'), 'utf8'));
  const hrefs = structure.groups.flatMap((g) => g.items.map((i) => i.href));
  assert.ok(hrefs.includes('buddha-vamsa.html'), 'site navigation must link to the new page');
});
