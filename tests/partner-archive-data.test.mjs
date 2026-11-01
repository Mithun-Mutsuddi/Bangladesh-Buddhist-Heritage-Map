/* সহযোগী সংরক্ষণাগার ডেটা-গেট — প্রতিটি রেকর্ড উৎস-সহ, লেবেল-সহ ও alt-সহ কি না।
   ডেটা: data/historical-archive-partners.json (tools/build_partner_archive.py) */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const doc = JSON.parse(readFileSync(join(here, '..', 'data', 'historical-archive-partners.json'), 'utf8'));

const collections = new Set(doc.collections.map((c) => c.key));
const mediaTypes = new Set(doc.mediaTypes.map((m) => m.key));
const periods = new Set(doc.periods.map((p) => p.key));
const rights = new Set(Object.keys(doc.rightsLabels));

test('চারটি সহযোগী প্রতিষ্ঠান + উন্মুক্ত সংগ্রহ আছে এবং প্রত্যেকের নিজস্ব হোমপেজ https', () => {
  assert.deepEqual([...collections].sort(), ['bdrc', 'bop', 'cbs', 'kabc', 'open']);
  for (const c of doc.collections) {
    assert.match(c.homepage, /^https:\/\//, `${c.key} homepage must be https`);
    for (const field of ['nameBn', 'nameEn', 'orgBn', 'orgEn', 'aboutBn', 'accessBn', 'rightsKey']) {
      assert.ok(String(c[field] || '').trim(), `${c.key} missing ${field}`);
    }
    assert.ok(rights.has(c.rightsKey), `${c.key} rightsKey not declared`);
  }
});

test('প্রতিটি রেকর্ডে উৎস, তারিখ, বিবরণ ও শ্রেণি-লেবেল আছে', () => {
  assert.ok(doc.items.length >= 50, 'expected at least 50 curated records');
  const seen = new Set();
  for (const item of doc.items) {
    assert.ok(!seen.has(item.id), `duplicate id ${item.id}`);
    seen.add(item.id);
    assert.ok(collections.has(item.collection), `${item.id}: unknown collection`);
    assert.ok(mediaTypes.has(item.mediaType), `${item.id}: unknown mediaType`);
    assert.ok(periods.has(item.period), `${item.id}: unknown period`);
    assert.ok(rights.has(item.rights), `${item.id}: unknown rights`);
    // নিজস্ব প্রযোজিত অডিওর (চর্যাভূমি) উৎস সাইটের ভেতরের ফাইলই; বাকি সব রেকর্ডের উৎস https হবে।
    const selfMade = String(item.accession || '').startsWith('চর্যাভূমি');
    const community = item.verification === 'community-approved';
    if (community) {
      // সম্প্রদায়-জমার বাইরের কোনো উৎস-লিংক নেই; জমাদানকারী ও অনুমোদনের তারিখই উৎস।
      assert.ok(String(item.submitter && item.submitter.name || '').trim(), `${item.id}: community record needs a submitter`);
      assert.ok(String(item.approvedAt || '').trim(), `${item.id}: community record needs approval date`);
    } else if (selfMade) {
      assert.match(item.sourceUrl, /^(https:\/\/|assets\/archive\/)/, `${item.id}: self-made source path`);
    } else {
      assert.match(item.sourceUrl, /^https:\/\//, `${item.id}: sourceUrl must be https`);
    }
    for (const field of ['titleBn', 'titleEn', 'descBn', 'dateBn', 'placeBn', 'accession', 'language']) {
      assert.ok(String(item[field] || '').trim(), `${item.id} missing ${field}`);
    }
    assert.ok(item.descBn.length >= 80, `${item.id}: description too thin`);
  }
});

test('প্রতিটি রেকর্ডেই ছবি: স্থানীয় ছোট কপি + alt + মূল URL + স্বীকৃতি — সবই বাধ্যতামূলক', () => {
  assert.ok(doc.items.length >= 50, 'expected at least 50 curated records');
  for (const item of doc.items) {
    assert.ok(String(item.imageUrl || '').trim(), `${item.id}: record without an image (must be removed instead)`);
    assert.ok(String(item.imageAltBn || '').trim(), `${item.id}: image without alt text`);
    assert.match(item.imageUrl, /^assets\/archive\/(partners|commons|museums|av)\/[a-z0-9-]+\.(jpg|jpeg|png|webp)$/, `${item.id}: thumbnail must be a local asset`);
    const selfHost = String(item.accession || '').startsWith('চর্যাভূমি') || item.verification === 'community-approved';
    if (!selfHost) {
      assert.match(item.imageSourceUrl, /^https:\/\/(www\.bdrc\.io|kabc\.dongguk\.edu|cbs\.arizona\.edu|commons\.wikimedia\.org|www\.metmuseum\.org|i\.ytimg\.com|archive\.org)\//, `${item.id}: original host not allow-listed`);
    }
    assert.ok(/অধিকার|শর্ত নেই|CC0/.test(String(item.imageCreditBn || '')), `${item.id}: thumbnail needs a rights credit`);
    const file = join(here, '..', item.imageUrl);
    assert.ok(existsSync(file), `${item.id}: local thumbnail missing on disk (${item.imageUrl})`);
    assert.ok(statSync(file).size > 1000, `${item.id}: local thumbnail looks empty`);
  }
});

test('ছবি-বিহীন রেকর্ড বাদ দেওয়া হয়েছে, কিন্তু বাদ-তালিকা ও কারণ সংরক্ষিত', () => {
  const note = doc.removedNotes;
  assert.ok(note && Array.isArray(note.items), 'removedNotes must exist');
  assert.ok(note.items.length >= 20, 'the drop list should record every removed record');
  assert.ok(note.bodyBn.length > 80, 'the drop note must explain why');
  const shown = new Set(doc.items.map((i) => i.id));
  for (const row of note.items) {
    assert.ok(!shown.has(row.id), `${row.id}: listed as removed but still in items`);
    assert.match(row.sourceUrl, /^https:\/\//, `${row.id}: removed record must keep its source link`);
    assert.ok(String(row.reasonBn || '').trim(), `${row.id}: removed record needs a reason`);
  }
});

test('উন্মুক্ত লাইসেন্সের ছবিতে লাইসেন্স-লেবেল, লাইসেন্স-লিংক ও আলোকচিত্রীর নাম বাধ্যতামূলক', () => {
  const open = doc.items.filter((i) => i.collection === 'open');
  assert.ok(open.length >= 25, 'the open-licence collection should be substantial');
  for (const item of open) {
    assert.ok(String(item.imageUrl || '').trim(), `${item.id}: open-licence record needs a local image`);
    assert.ok(String(item.licenceLabel || '').trim(), `${item.id}: licence label missing`);
    assert.match(item.licenceUrl, /^https:\/\//, `${item.id}: licence URL must be https`);
    assert.ok(String(item.creatorBn || '').trim(), `${item.id}: photographer/creator missing`);
    const credit = String(item.imageCreditBn || '');
    assert.ok(/Wikimedia|জাদুঘর|Internet Archive|চর্যাভূমি|সম্প্রদায়/.test(credit), `${item.id}: attribution line missing`);
    assert.equal(item.rights, 'open-license');
  }
});

test('কঠোর-কপিরাইট উৎসে (Buddhist Archive of Photography) কেবল চলচ্চিত্রের নিজস্ব থাম্বনেইল', () => {
  const strict = doc.items.filter((i) => i.rights === 'institution-strict');
  assert.ok(strict.length >= 1, 'the Luang Prabang collection should still be represented');
  for (const item of strict) {
    assert.equal(item.collection, 'bop');
    assert.match(item.imageSourceUrl, /^https:\/\/i\.ytimg\.com\//, `${item.id}: only the film's own thumbnail may be shown`);
  }
});

test('প্রতিটি অডিও/ভিডিও রেকর্ড সত্যিই চলে: স্থানীয় ফাইল, লাইসেন্স ও স্বীকৃতি', () => {
  const audio = doc.items.filter((i) => i.mediaType === 'audio');
  const video = doc.items.filter((i) => i.mediaType === 'video');
  assert.ok(audio.length >= 3, 'at least three real audio recordings expected');
  assert.ok(video.length >= 2, 'video records expected');
  for (const item of audio) {
    assert.match(item.audioUrl, /^assets\/archive\/av\/[a-z0-9-]+\.mp3$/, `${item.id}: local mp3 required`);
    const f = join(here, '..', item.audioUrl);
    assert.ok(existsSync(f) && statSync(f).size > 100000, `${item.id}: audio file missing or too small`);
    assert.ok(String(item.licenceLabel || '').trim() && /^https:\/\//.test(item.licenceUrl || ''), `${item.id}: licence required`);
    assert.ok(String(item.durationBn || '').trim(), `${item.id}: duration label required`);
  }
  for (const item of video) {
    assert.ok(String(item.videoUrl || item.embedUrl || '').trim(), `${item.id}: video must be playable`);
    if (item.videoUrl) {
      assert.match(item.videoUrl, /^assets\/archive\/av\/[a-z0-9-]+\.mp4$/, `${item.id}: local mp4 required`);
      const f = join(here, '..', item.videoUrl);
      assert.ok(existsSync(f) && statSync(f).size > 100000, `${item.id}: video file missing or too small`);
    }
  }
  assert.ok(doc.audioNote.bodyBn.length > 80, 'audio note must explain what the recordings are');
  assert.ok(doc.audioNote.libraryUrl && doc.audioNote.submitUrl);
});

test('প্রতিটি প্রতিষ্ঠানের অন্তত একটি রেকর্ড ও প্রতিটি মিডিয়া-ধরন ব্যবহৃত', () => {
  const perCollection = {};
  for (const item of doc.items) perCollection[item.collection] = (perCollection[item.collection] || 0) + 1;
  for (const key of collections) assert.ok(perCollection[key] > 0, `${key} has no records`);
  const used = new Set(doc.items.map((i) => i.mediaType));
  for (const key of ['photo', 'painting', 'manuscript', 'video', 'audio', 'collection']) {
    assert.ok(used.has(key), `media type ${key} has no record`);
  }
  /* ঘোষিত প্রতিটি লেবেল হয় ব্যবহার হয়েছে, নয়তো সেটি কেবল ব্যাখ্যার জন্য (audio) */
  for (const m of doc.mediaTypes) {
    if (m.key === 'all') continue;
    assert.ok(used.has(m.key), `declared media type ${m.key} is unused — remove the chip`);
  }
});

test('topics: প্রতিবাদ থিমের রেকর্ড ও লেবেল', () => {
  assert.ok(Array.isArray(doc.topics) && doc.topics.length >= 1, 'topics metadata missing');
  const keys = new Set(doc.topics.map((t) => t.key));
  const tagged = doc.items.filter((i) => i.topic);
  assert.ok(tagged.length >= 10, `expected at least 10 topic-tagged records, got ${tagged.length}`);
  for (const item of tagged) {
    assert.ok(keys.has(item.topic), `${item.id}: unknown topic ${item.topic}`);
    assert.ok(item.imageUrl, `${item.id}: topic record without media`);
  }
  const protest = tagged.filter((i) => i.topic === 'protest');
  assert.ok(protest.some((i) => /ভিয়েতনাম|Vietnam/.test(i.placeBn + i.titleEn)), 'Vietnam 1963 record missing');
  assert.ok(protest.some((i) => /কম্বোডিয়া|Cambodia/.test(i.placeBn + i.titleEn)), 'Cambodia record missing');
  assert.ok(protest.some((i) => /মিয়ানমার|Myanmar/.test(i.placeBn + i.titleEn)), 'Myanmar 2007 record missing');
});

test('topics: ভিক্ষুণী ও নারী-ঐতিহ্য + নতুন দেশের কভারেজ', () => {
  const doc2 = JSON.parse(readFileSync(join(here, '..', 'data', 'historical-archive-partners.json'), 'utf8'));
  const keys = new Set(doc2.topics.map((t) => t.key));
  assert.ok(keys.has('bhikkhuni'), 'bhikkhuni topic missing');
  const nuns = doc2.items.filter((i) => i.topic === 'bhikkhuni');
  assert.ok(nuns.length >= 12, `expected >=12 bhikkhuni records, got ${nuns.length}`);
  for (const item of nuns) assert.ok(item.imageUrl && item.descBn.length >= 80, `${item.id}: thin nun record`);
  const places = doc2.items.map((i) => i.placeBn).join(' ');
  for (const country of ['চিলি', 'কলম্বিয়া', 'ইসরায়েল', 'তাহিতি', 'লাওস', 'ভুটান', 'লাদাখ']) {
    assert.ok(places.includes(country), `missing coverage: ${country}`);
  }
  assert.ok(doc2.items.filter((i) => i.topic === 'protest').length >= 18, 'protest theme should grow');
});

test('সম্প্রদায়-জমা ও মালিকের সম্পাদনা: ওভারলে-ফাইল দুটি বৈধ', () => {
  const edits = JSON.parse(readFileSync(join(here, '..', 'data', 'edits.json'), 'utf8'));
  const contrib = JSON.parse(readFileSync(join(here, '..', 'data', 'contributions.json'), 'utf8'));
  assert.equal(edits.schema, 'charyabhumi-edits-v1');
  assert.equal(contrib.schema, 'charyabhumi-contributions-v1');
  assert.equal(typeof edits.records, 'object');
  assert.ok(Array.isArray(contrib.items));
  const ids = new Set(doc.items.map((i) => i.id));
  const communityIds = new Set(doc.items.filter((i) => i.community).map((i) => i.id));
  for (const id of Object.keys(edits.records)) {
    assert.ok(ids.has(id), `edits.json points at unknown id ${id}`);
  }
  for (const item of contrib.items) {
    for (const field of ['id', 'titleBn', 'descBn', 'mediaType', 'region', 'period', 'licenceLabel', 'imageCreditBn']) {
      assert.ok(String(item[field] || '').trim(), `${item.id || '?'}: missing ${field}`);
    }
    // একবার মিশিয়ে ফেলার পরও ফাইলটি রাখা হয় (নথি হিসেবে) — তাই আগেই-মিশানো সম্প্রদায়-রেকর্ড দ্বৈত নয়।
    assert.ok(!ids.has(item.id) || communityIds.has(item.id), `contributions.json duplicates a curated id: ${item.id}`);
  }
});

test('জমা ও অনুমোদন পাতা: নিয়ম-রক্ষা ও ফাইল উপস্থিত', () => {
  for (const page of ['submit.html', 'review.html']) {
    assert.ok(existsSync(join(here, '..', page)), `${page} missing`);
  }
  const submit = readFileSync(join(here, '..', 'submit.html'), 'utf8');
  assert.match(submit, /অনুমোদনের/, 'submit page must state that nothing is published without approval');
  assert.match(submit, /consent/, 'submit page must require explicit consent');
  const review = readFileSync(join(here, '..', 'review.html'), 'utf8');
  assert.match(review, /noindex/, 'owner console must not be indexed');
  const js = readFileSync(join(here, '..', 'partner-archive.js'), 'utf8');
  assert.match(js, /data\/edits\.json/, 'runtime overlay for owner edits missing');
  assert.match(js, /data\/contributions\.json/, 'runtime overlay for contributions missing');
});
