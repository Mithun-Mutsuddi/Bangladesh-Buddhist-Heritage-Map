import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const data = JSON.parse(readFileSync(join(ROOT, 'data/kids-media.json'), 'utf8'));

test('kids-media: schema ও মূল ক্ষেত্র', () => {
  assert.equal(data.schema, 'charyabhumi-kids-v1');
  assert.ok(Array.isArray(data.items) && data.items.length >= 50, 'কমপক্ষে ৫০টি আইটেম');
  for (const key of ['types', 'languages', 'topics', 'searchLinks', 'notHostedBn']) {
    assert.ok(Array.isArray(data[key]) && data[key].length > 0, `${key} খালি নয়`);
  }
});

test('kids-media: আইডি অনন্য ও প্রতিটি আইটেমে প্রয়োজনীয় ক্ষেত্র', () => {
  const ids = new Set();
  for (const item of data.items) {
    assert.match(item.id, /^kid-[a-z0-9-]+$/, `আইডি ফরম্যাট: ${item.id}`);
    assert.ok(!ids.has(item.id), `ডুপ্লিকেট আইডি: ${item.id}`);
    ids.add(item.id);
    for (const field of ['type', 'lang', 'ageBn', 'titleBn', 'descBn', 'licenceLabel', 'licenceUrl', 'creditBn', 'sourceName', 'sourceUrl', 'topics']) {
      assert.ok(item[field], `${item.id}: ${field} অনুপস্থিত`);
    }
    assert.ok(item.descBn.length >= 40, `${item.id}: বর্ণনা খুব ছোট`);
    assert.ok(item.topics.length >= 1, `${item.id}: বিষয় নেই`);
  }
});

test('kids-media: ধরন ও ভাষা — ঘোষিত তালিকার ভেতরে', () => {
  const types = new Set(data.types.map(t => t.key).filter(k => k !== 'all'));
  const langs = new Set(data.languages.map(l => l.key).filter(k => k !== 'all'));
  const topics = new Set(data.topics.map(t => t.key).filter(k => k !== 'all'));
  for (const item of data.items) {
    assert.ok(types.has(item.type), `${item.id}: অজানা ধরন ${item.type}`);
    assert.ok(langs.has(item.lang), `${item.id}: অজানা ভাষা ${item.lang}`);
    for (const t of item.topics) assert.ok(topics.has(t), `${item.id}: অজানা বিষয় ${t}`);
  }
});

test('kids-media: প্রতিটি আইটেমে অন্তত একটি কাজের লিংক', () => {
  for (const item of data.items) {
    const links = [item.readUrl, item.downloadUrl, item.playUrl, item.downloadUrlAlt, item.buyUrl, item.watchUrl].filter(Boolean);
    assert.ok(links.length >= 1 || /^[A-Za-z0-9_-]{11}$/.test(item.embedId || ''), `${item.id}: কোনো পড়া/ডাউনলোড/প্লে লিংক নেই`);
    for (const url of links) {
      assert.ok(/^https?:\/\//.test(url) || url.startsWith('assets/'), `${item.id}: লিংক ফরম্যাট ভুল — ${url}`);
    }
    assert.match(item.sourceUrl, item.licenceKey === 'original' ? /^https?:\/\/|^[a-z0-9-]+\.html$/ : /^https?:\/\//, `${item.id}: sourceUrl ঠিক নয়`);
    assert.match(item.licenceUrl, /^https?:\/\//, `${item.id}: licenceUrl http(s) নয়`);
  }
});

test('kids-media: স্থানীয় ছবি ও অডিও ফাইল সত্যিই আছে', () => {
  const missing = [];
  for (const item of data.items) {
    if (item.thumb && item.thumb.startsWith('assets/')) {
      if (!existsSync(join(ROOT, item.thumb))) missing.push(item.thumb);
    }
    if (item.playUrl && item.playUrl.startsWith('assets/')) {
      if (!existsSync(join(ROOT, item.playUrl))) missing.push(item.playUrl);
    }
    if (!item.thumb && !item.playUrl) missing.push(`${item.id}: ছবি বা অডিও কোনোটিই নেই`);
  }
  assert.deepEqual(missing, [], `অনুপস্থিত ফাইল: ${missing.join(', ')}`);
});

test('kids-media: অডিও আইটেমগুলো প্লে করা যায় এবং সময় লেখা আছে', () => {
  const audio = data.items.filter(i => i.type === 'audio');
  assert.ok(audio.length >= 16, 'অন্তত ১৬টি অডিও গল্প');
  for (const item of audio) {
    assert.ok(item.playUrl?.startsWith('assets/kids/audio/'), `${item.id}: স্থানীয় অডিও নেই`);
    assert.match(item.durationBn, /^\d+:\d{2}$/, `${item.id}: সময়ের ফরম্যাট`);
  }
});

test('kids-media: লাইসেন্স-শ্রেণি ও কপিরাইট-সতর্কতা', () => {
  const allowed = ['Public domain', 'CC0', 'CC BY 2.0', 'CC BY 3.0', 'CC BY 4.0', 'CC BY-SA 3.0', 'CC BY-SA 4.0', 'Gutenberg', 'IA-user-claim', 'copyright', 'youtube', 'licensed', 'original'];
  for (const item of data.items) assert.ok(allowed.includes(item.licenceKey), `${item.id}: ${item.licenceKey}`);
  const risky = data.items.filter(i => i.licenceKey === 'IA-user-claim');
  for (const item of risky) {
    assert.ok(item.noteBn, `${item.id}: লাইসেন্স-সংশয়ের নোট দরকার`);
    assert.ok(!item.downloadUrl?.includes('assets/'), `${item.id}: সংশয়যুক্ত ফাইল স্থানীয়ভাবে রাখা যাবে না`);
  }
  assert.ok(data.notHostedBn.some(t => /আমার চিত্র কথা|Amar Chitra Katha/.test(t)), 'ACK সতর্কতা থাকা চাই');
});

test('kids-media: অমর চিত্র কথা — শুধু লিংক, কোনো ফাইল কপি নয়', () => {
  const ack = data.items.filter(i => i.type === 'ack');
  assert.ok(ack.length >= 7, 'ACK কমিক অন্তত ৭টি');
  for (const item of ack) {
    assert.ok(item.buyUrl || item.readUrl, `${item.id}: অফিশিয়াল লিংক নেই`);
    assert.equal(item.licenceKey, 'copyright', `${item.id}: কপিরাইট শ্রেণি দরকার`);
    assert.ok(!item.downloadUrl && !item.playUrl, `${item.id}: কপিরাইটযুক্ত ফাইল দেওয়া যাবে না`);
    assert.match(item.buyUrl || item.readUrl,
      /^https:\/\/((shop|digital)\.amarchitrakatha\.com|archive\.org|bnetbazaar\.(com|in))\//,
      `${item.id}: অনুমোদিত ডোমেইন নয়`);
  }
});

test('kids-media: ইউটিউব ভিডিও — বৈধ এমবেড আইডি, ফাইল কপি নয়', () => {
  const allVids = data.items.filter(i => i.type === 'video');
  const vids = allVids.filter(v => !v.videoUrl);
  assert.ok(allVids.length >= 24, 'অন্তত ২৪টি অ্যানিমেশন');
  // নিজস্ব বানানো লোকাল ভিডিও — ফাইল আছে, লাইসেন্স নিজের
  for (const v of allVids.filter(x => x.videoUrl)) {
    assert.match(v.videoUrl, /^assets\/kids\/video\//, `${v.id}: ভিডিও-পথ ভুল`);
    assert.ok(existsSync(join(ROOT, v.videoUrl)), `${v.id}: ভিডিও ফাইল নেই`);
    assert.equal(v.licenceKey, 'original', `${v.id}: নিজস্ব ভিডিওর লাইসেন্স-শ্রেণি`);
    assert.match(v.creditBn, /কৃত্রিম|AI/, `${v.id}: AI-কণ্ঠের কথা লেখা নেই`);
  }
  assert.ok(allVids.filter(x => x.videoUrl).length >= 6, 'নিজস্ব অ্যানিমেশন অন্তত ৬টি');
  for (const v of vids) {
    assert.match(v.embedId, /^[A-Za-z0-9_-]{11}$/, `${v.id}: এমবেড আইডি ভুল`);
    assert.equal(v.watchUrl, `https://www.youtube.com/watch?v=${v.embedId}`, `${v.id}: watch লিংক মিলছে না`);
    assert.ok(!v.downloadUrl && !v.playUrl, `${v.id}: কপিরাইটযুক্ত ভিডিও ফাইল দেওয়া যাবে না`);
    assert.equal(v.licenceKey, 'youtube', `${v.id}: লাইসেন্স-শ্রেণি`);
  }
  const langs = new Set(vids.map(v => v.lang));
  assert.ok(langs.has('bn') && langs.has('en') && langs.has('hi'), 'বাংলা/ইংরেজি/হিন্দি তিন ভাষাই থাকতে হবে');
});

test('kids-media: চলচ্চিত্র ও মাঙ্গা — শুধু বৈধ দেখার ঠিকানা', () => {
  const films = data.items.filter(i => i.type === 'film' || i.type === 'manga');
  assert.ok(films.length >= 5, 'চলচ্চিত্র/মাঙ্গা অন্তত ৫টি');
  const mustHave = ['kid-film-little-buddha', 'kid-film-pbs-buddha', 'kid-film-king-of-kings', 'kid-film-tezuka-anime', 'kid-film-tezuka-manga'];
  for (const id of mustHave) {
    const item = films.find(f => f.id === id);
    assert.ok(item, `${id} অনুপস্থিত`);
    assert.ok(item.watchUrl || item.infoUrl, `${id}: দেখার/তথ্যের লিংক নেই`);
    assert.ok(!item.downloadUrl && !item.playUrl && !item.embedId, `${id}: ফাইল বা এমবেড থাকা যাবে না`);
  }
});

test('kids-media: নিজের আঁকা ছবি — স্থানীয় ডাউনলোড, মুক্ত লাইসেন্স', () => {
  const own = data.items.filter(i => i.licenceKey === 'original' && i.type !== 'audio');
  assert.ok(own.length >= 6, 'অন্তত ৬টি মূল আঁকন');
  for (const item of own) {
    assert.match(item.downloadUrl || '', /^assets\/kids\/(thumbs|coloring|video|art)\//, `${item.id}: স্থানীয় ডাউনলোড লিংক নেই`);
    assert.ok(existsSync(join(ROOT, item.downloadUrl)), `${item.id}: ডাউনলোড ফাইল নেই`);
    assert.ok(existsSync(join(ROOT, item.downloadUrl)), `${item.id}: ফাইল নেই`);
    assert.match(item.creditBn, /CC BY-SA 4\.0/, `${item.id}: লাইসেন্স-শ্রেণি লেখা নেই`);
    assert.match(item.creatorBn, /AI/, `${item.id}: AI-সহায়তার কথা লেখা নেই`);
  }
});

test('kids-media: কপিরাইটযুক্ত ACK-ফাইল কোথাও রাখা নেই', () => {
  const bad = data.items.filter(i => ['copyright', 'licensed'].includes(i.licenceKey) && (i.playUrl || i.embedId));
  assert.deepEqual(bad.map(i => i.id), [], 'কপিরাইটযুক্ত ফাইল বা এমবেড রাখা যাবে না');
  const local_a = data.items.filter(i => i.downloadUrl?.startsWith('assets/') && ['copyright', 'licensed', 'youtube'].includes(i.licenceKey));
  assert.deepEqual(local_a.map(i => i.id), [], 'কপিরাইট ফাইল স্থানীয়ভাবে কপি করা যাবে না');
});

test('kids-media: বাংলা অডিও — কৃত্রিম কণ্ঠ লেবেল ও MP3 ফাইল', () => {
  const bn = data.items.filter(i => i.type === 'audio' && i.lang === 'bn');
  assert.ok(bn.length >= 6, 'অন্তত ৬টি বাংলা অডিও গল্প');
  for (const item of bn) {
    assert.ok(existsSync(join(ROOT, item.playUrl)), `${item.id}: MP3 নেই`);
    assert.match(item.descBn + item.creditBn + (item.noteBn || ''), /কৃত্রিম/, `${item.id}: “কৃত্রিম কণ্ঠ” লেখা নেই`);
    assert.match(item.durationBn, /^\d+:\d{2}$/, `${item.id}: সময়ের ফরম্যাট`);
  }
});

test('kids-media: রঙ করার পাতা — ফাইল, PDF প্যাক ও লেবেল', () => {
  const col = data.items.filter(i => i.type === 'coloring');
  assert.ok(col.length >= 6, 'অন্তত ৬টি রঙ করার পাতা');
  for (const item of col) {
    assert.ok(existsSync(join(ROOT, item.downloadUrl)), `${item.id}: ফাইল নেই`);
    assert.ok(existsSync(join(ROOT, item.downloadUrlAlt)), `${item.id}: PDF প্যাক নেই`);
    assert.equal(item.lang, 'bn', `${item.id}: বাংলা হওয়া উচিত`);
  }
  assert.ok(existsSync(join(ROOT, 'assets/kids/coloring/rong-kora-patra-pack.pdf')));
});

test('kids-media: শিক্ষক-গাইড PDF আছে ও পৃষ্ঠায় সংযুক্ত', () => {
  assert.ok(existsSync(join(ROOT, 'assets/kids/shikkhok-guide-bn.pdf')), 'গাইড PDF নেই');
  const html = readFileSync(join(ROOT, 'sishu-shikkha.html'), 'utf8');
  assert.match(html, /shikkhok-guide-bn\.pdf/);
  assert.match(html, /rong-kora-patra-pack\.pdf/);
  assert.match(html, /own-art-pack\.zip/);
});

test('kids-media: পৃষ্ঠা ও স্ক্রিপ্ট সংযুক্ত', () => {
  const html = readFileSync(join(ROOT, 'sishu-shikkha.html'), 'utf8');
  assert.match(html, /kids-media\.js\?v=/);
  assert.match(html, /sishu-shikkha\.css\?v=/);
  assert.match(html, /id="kGrid"/);
  assert.match(html, /data\/kids-media/);
  const js = readFileSync(join(ROOT, 'kids-media.js'), 'utf8');
  assert.match(js, /data\/kids-media-list\.json\?v=/, 'হালকা তালিকা লোড হয় না');
  assert.match(js, /state\.limit/, 'প্রগ্রেসিভ রেন্ডার নেই');
  assert.ok(!/eval\(|document\.write/.test(js), 'নিরাপত্তা: eval/document.write নেই');
});

test('kids-media: নেভিগেশন ও ক্রস-লিংক', () => {
  const structure = JSON.parse(readFileSync(join(ROOT, 'data/site-structure.json'), 'utf8'));
  const learning = structure.groups.find(g => g.id === 'learning');
  assert.ok(learning.items.some(i => i.href === 'sishu-shikkha.html'), 'নেভিগেশনে নতুন পৃষ্ঠা নেই');
  const kids = readFileSync(join(ROOT, 'children.html'), 'utf8');
  assert.match(kids, /href="sishu-shikkha\.html"/);
  const archive = readFileSync(join(ROOT, 'historical-archive.html'), 'utf8');
  assert.match(archive, /href="sishu-shikkha\.html"/);
});

test('kids-media: মালিকের ওভারলে (kids-overlay.json) — schema ও রাইট-হুক', () => {
  const ov = JSON.parse(readFileSync(join(ROOT, 'data/kids-overlay.json'), 'utf8'));
  assert.equal(ov.schema, 'charyabhumi-kids-overlay-v1');
  for (const k of ['cards', 'edits', 'rejections']) assert.ok(Array.isArray(ov[k]), `overlay.${k} array নয়`);
  const builder = readFileSync(join(ROOT, 'tools/build_kids_media.py'), 'utf8');
  assert.match(builder, /kids-overlay\.json/, 'বিল্ডার ওভারলে পড়ে না');
  assert.match(builder, /overlayApplied/, 'বিল্ড আউটপুটে overlayApplied নেই');
  const js = readFileSync(join(ROOT, 'kids-media.js'), 'utf8');
  assert.match(js, /kids-overlay\.json/, 'পৃষ্ঠা রানটাইমে ওভারলে পড়ে না');
  assert.match(js, /applyOverlay/);
});

test('kids-media: জমা ও অনুমোদনের পথ — submit.html ↔ review.html', () => {
  const sub = readFileSync(join(ROOT, 'submit.html'), 'utf8');
  const rev = readFileSync(join(ROOT, 'review.html'), 'utf8');
  assert.match(sub, /charyabhumi-kids-card-v1/, 'কার্ড-জমার schema নেই');
  for (const id of ['kTitleBn', 'kDescBn', 'kWatch', 'kEmbed', 'kLicence', 'kAi', 'kThumb']) {
    assert.ok(sub.includes('id="' + id + '"'), `submit.html-এ ${id} নেই`);
  }
  assert.match(sub, /কপিরাইটযুক্ত কাজের ডাউনলোড লিংক দেওয়া যাবে না/, 'কপিরাইট-গার্ড নেই');
  assert.match(rev, /id="tab-kids"/, 'অনুমোদন-কনসোলে কার্ড-ট্যাব নেই');
  assert.match(rev, /__kidsExport/, 'ওভারলে রপ্তানি নেই');
  assert.match(rev, /data-ke="descBn"/, 'কার্ডের লেখা সম্পাদনার ঘর নেই');
  assert.match(rev, /kThumbNew/, 'কার্ডের ছবি বদলানোর ঘর নেই');
});

test('kids-media: প্রতিটি কার্ডের ভাষা ও ধরন বৈধ', () => {
  const types = new Set(data.types.map(t => t.key));
  const langs = new Set(data.languages.map(l => l.key));
  for (const it of data.items) {
    assert.ok(types.has(it.type), `${it.id}: অজানা ধরন ${it.type}`);
    assert.ok(langs.has(it.lang), `${it.id}: অজানা ভাষা ${it.lang}`);
    assert.ok(it.titleBn && it.titleBn.length > 3, `${it.id}: শিরোনাম নেই`);
    assert.ok(it.creditBn, `${it.id}: কৃতিত্ব/সূত্র নেই`);
  }
});

test('kids-media: বাংলা অডিওর কণ্ঠ-হিসাব (ai ↔ human) ও ইনস্টল টুল', () => {
  const meta = JSON.parse(readFileSync(join(ROOT, 'data/kids-audio-bn.json'), 'utf8'));
  assert.equal(meta.schema, 'charyabhumi-kids-audio-bn-v1');
  assert.ok(meta.items.length >= 6);
  for (const a of meta.items) {
    assert.ok(existsSync(join(ROOT, a.file)), `${a.slug}: ফাইল নেই`);
    assert.ok(['ai', 'human'].includes(a.voice), `${a.slug}: voice ভুল`);
    assert.match(a.durationBn, /^\d+:\d{2}$/, `${a.slug}: সময়ের ফরম্যাট`);
    if (a.voice === 'human') assert.ok(a.narratorBn, `${a.slug}: কণ্ঠশিল্পীর নাম নেই`);
  }
  assert.ok(existsSync(join(ROOT, 'tools/install_bn_audio.py')), 'ইনস্টল টুল নেই');
  assert.ok(existsSync(join(ROOT, 'tools/install_bn_audio.py')));
  assert.ok(existsSync(join(ROOT, 'docs/bn-audio-recording-kit-bn.md')), 'রেকর্ডিং কিট ডক নেই');
  const items = data.items.filter(i => i.type === 'audio' && i.lang === 'bn');
  assert.equal(items.length, meta.items.length, 'তালিকা ও কণ্ঠ-হিসাবের সংখ্যা মিলছে না');
});

test('kids-media: কমন্সের মুক্ত ছবি — ফাইল আছে, লাইসেন্স মুক্ত, কপিরাইট নয়', () => {
  const local = data.items.filter(i => i.localFile);
  assert.ok(local.length >= 12, 'অন্তত ১২টি নামানো মুক্ত ছবি');
  const free = ['Public domain', 'CC0', 'CC BY 2.0', 'CC BY 3.0', 'CC BY 4.0', 'CC BY-SA 3.0', 'CC BY-SA 4.0'];
  for (const item of local) {
    assert.ok(free.includes(item.licenceKey), `${item.id}: লাইসেন্স মুক্ত নয় — ${item.licenceKey}`);
    assert.ok(item.downloadUrl?.startsWith('assets/kids/art/'), `${item.id}: স্থানীয় ডাউনলোড নয়`);
    assert.ok(existsSync(join(ROOT, item.downloadUrl)), `${item.id}: ফাইল নেই`);
    assert.match(item.sourceUrl, /^https:\/\/commons\.wikimedia\.org\//, `${item.id}: কমন্সের সূত্র নেই`);
    assert.ok(/Wikimedia Commons/.test(item.creditBn), `${item.id}: কৃতিত্বে কমন্স নেই`);
  }
});

test('kids-media: কপিরাইটযুক্ত কিছুই স্থানীয়ভাবে রাখা নেই', () => {
  for (const item of data.items) {
    if (['copyright', 'youtube', 'licensed', 'IA-user-claim'].includes(item.licenceKey)) {
      assert.ok(!String(item.downloadUrl || '').startsWith('assets/'), `${item.id}: নিষিদ্ধ স্থানীয় ফাইল`);
      assert.ok(!String(item.playUrl || '').startsWith('assets/') || item.type === 'audio', `${item.id}: নিষিদ্ধ অডিও ফাইল`);
    }
  }
});

test('kids-media: বাংলা অমর চিত্র কথা — বৈধ দোকানের লিংক, ফাইল নয়', () => {
  const bn = data.items.filter(i => i.type === 'ack' && i.lang === 'bn');
  assert.ok(bn.length >= 3, 'বাংলা ACK অন্তত ৩টি');
  for (const item of bn) {
    assert.match(item.buyUrl, /^https:\/\/bnetbazaar\.(com|in)\//, `${item.id}: দোকানের লিংক নেই`);
    assert.ok(!item.downloadUrl && !item.playUrl, `${item.id}: ফাইল থাকা যাবে না`);
    assert.ok(existsSync(join(ROOT, item.thumb)), `${item.id}: টাইল নেই`);
  }
});

test('শিশু ও শিক্ষা: children.html-এর shelf সত্যিই তালিকা দেখায় (রিগ্রেশন)', () => {
  const html = readFileSync(join(ROOT, 'children.html'), 'utf8');
  const js = readFileSync(join(ROOT, 'children.js'), 'utf8');
  for (const f of ['all', 'read', 'watch', 'download', 'play']) {
    assert.ok(html.includes(`data-media-filter="${f}"`), `ফিল্টার নেই: ${f}`);
  }
  assert.match(js, /kids-media-(list\.json|list\.js)/, 'children.js এখনো হালকা তালিকা পড়ে না');
  assert.match(js, /mediaShown/, 'children.js-এ প্রগ্রেসিভ রেন্ডার নেই');
  assert.match(js, /KIDS_MEDIA_DATA/, 'script-ফলব্যাক নেই (file:// বা ব্লকড fetch-এ ফাঁকা থাকবে)');
  assert.match(js, /if \(digCanvas\)/, 'digCanvas গার্ড নেই — স্ক্রিপ্ট ক্র্যাশ করবে');
  assert.match(js, /if \(!\$\('#chantList'\)\) return;/, 'chantList গার্ড নেই');
  assert.match(js, /if \(digCanvas\) digCanvas\.addEventListener\('pointercancel'/, 'digCanvas pointercancel গার্ড নেই');
  assert.equal((js.match(/(^|[^)] )digCanvas\.addEventListener/g) || []).length, 0, 'অগার্ডেড digCanvas কল আছে');
  assert.ok(data.items.length >= 100, 'তালিকায় ১০০+ আইটেম থাকা চাই');
});

test('kids-media: হালকা তালিকা (list) তৈরি হয় ও ছোট থাকে', () => {
  const listPath = join(ROOT, 'data/kids-media-list.json');
  assert.ok(existsSync(listPath), 'kids-media-list.json নেই');
  const list = JSON.parse(readFileSync(listPath, 'utf8'));
  assert.equal(list.items.length, data.items.length, 'তালিকা ও মূল JSON-এর সংখ্যা আলাদা');
  const size = readFileSync(listPath).length;
  // ২৬০+ আইটেম; ছাদ ৩২০ KB (gzip-এ ~৬৫ KB) — তবুও ধীর 3G-এ কয়েক সেকেন্ডে আসে
  assert.ok(size < 320 * 1024, `হালকা তালিকা বড় হয়ে গেছে: ${(size/1024)|0} KB`);
  assert.ok(existsSync(join(ROOT, 'data/kids-media-list.js')), 'script-ফলব্যাক নেই');
  const thin = data.items.filter(i => i.thumbFull);
  assert.ok(thin.length >= 30, 'হালকা থাম্ব তৈরি হয়নি');
  for (const it of thin) {
    assert.ok(it.thumb.includes('/disp/'), `${it.id}: কার্ডে হালকা থাম্ব নয়`);
    assert.ok(existsSync(join(ROOT, it.thumb)) && existsSync(join(ROOT, it.thumbFull)), `${it.id}: ফাইল নেই`);
    assert.ok(readFileSync(join(ROOT, it.thumb)).length < readFileSync(join(ROOT, it.thumbFull)).length, `${it.id}: থাম্ব ছোট নয়`);
  }
});

test('kids-media: অডিও preload=metadata, ভিডিও preload=none (আগে থেকে MB ডাউনলোড হয় না)', () => {
  const js = readFileSync(join(ROOT, 'kids-media.js'), 'utf8');
  // অডিও ছোট (~৪৪০ KB) — metadata নামালে প্লেয়ারে গল্পের দৈর্ঘ্য দেখা যায়
  assert.match(js, /<audio controls preload="metadata"/, 'অডিও preload="metadata" নয়');
  // ভিডিও বড় — আগে থেকে টানলে পাতায় ২০+ MB নেমে যেত
  assert.match(js, /<video controls preload="none"/, 'ভিডিও preload="none" নয়');
  const jg = readFileSync(join(ROOT, 'jatak-golpo.html'), 'utf8');
  assert.match(jg, /<audio controls preload="metadata"/, 'jatak-golpo: অডিও metadata নয়');
  assert.match(jg, /<video controls[^>]*preload="none"/, 'jatak-golpo: ভিডিও preload=none নয়');
  const ch = readFileSync(join(ROOT, 'children.js'), 'utf8');
  assert.match(ch, /preload="none"|preload: ?'none'/, 'children.js-এ অডিও preload নেই');
  for (const f of ['sishu-shikkha.html', 'children.html']) {
    const html = readFileSync(join(ROOT, f), 'utf8');
    assert.ok(!/<iframe[^>]+youtube/.test(html), `${f}: ভিডিও আগে থেকেই এমবেড হয়ে আছে (ধীর হবে)`);
  }
});

test('শিশু ও শিক্ষা: পারফরম্যান্স-গার্ড (হালকা লোড)', () => {
  for (const f of ['children.html', 'sishu-shikkha.html']) {
    const html = readFileSync(join(ROOT, f), 'utf8');
    assert.match(html, /rel="preload" as="fetch"[^>]*kids-media-list\.json/, `${f}: তালিকা preload নেই`);
    assert.match(html, /rel="preload" as="font"/, `${f}: ফন্ট preload নেই`);
    assert.match(html, /k-skel/, `${f}: skeleton নেই`);
    assert.ok(!/<iframe[^>]+youtube/.test(html), `${f}: ভিডিও আগেভাগে এমবেড করা আছে`);
  }
  const totalAudio = 40 * 1024 * 1024;
  const listSize = readFileSync(join(ROOT, 'data/kids-media-list.json')).length;
  assert.ok(listSize < totalAudio / 100, 'হালকা তালিকা প্রত্যাশার চেয়ে বড়');
});

test('kids-media: অডিও বহুভাষিক — বাংলা আগে, তারপর ইংরেজি/হিন্দি/ফরাসি', () => {
  const audio = data.items.filter(i => i.type === 'audio');
  const byLang = audio.reduce((m, i) => (m[i.lang] = (m[i.lang] || 0) + 1, m), {});
  assert.ok(byLang.bn >= 6 && byLang.en >= 6 && byLang.hi >= 4 && byLang.fr >= 16, 'ভাষার সংখ্যা কম: ' + JSON.stringify(byLang));
  const firstSix = audio.slice(0, 6);
  assert.ok(firstSix.every(i => i.lang === 'bn'), 'তালিকার শুরুতে বাংলা অডিও নেই');
  for (const i of audio) {
    assert.ok(existsSync(join(ROOT, i.playUrl)), `${i.id}: MP3 নেই`);
    assert.match(i.descBn + i.creditBn, /কৃত্রিম|মানুষের কণ্ঠ|Als33120/, `${i.id}: কণ্ঠের ধরন লেখা নেই`);
  }
  assert.ok(data.items.length >= 138, 'মোট আইটেম ১৩৮+ হওয়া চাই');
});

test('kids-media: নিজস্ব AI জাতক-সেট — ছবি, লেখা (৩ ভাষা), অডিও, ভিডিও', () => {
  const aij = JSON.parse(readFileSync(join(ROOT, 'data/ai-jataka-stories.json'), 'utf8'));
  assert.equal(aij.schema, 'charyabhumi-kids-ai-jataka-v1');
  assert.ok(aij.stories.length >= 11, 'গল্প কম: ' + aij.stories.length);
  for (const st of aij.stories) {
    for (const k of ['textBn', 'textEn', 'textHi', 'moralBn', 'moralEn', 'moralHi']) {
      assert.ok((st[k] || '').length > 40, `${st.slug}: ${k} খুব ছোট`);
    }
    assert.ok(existsSync(join(ROOT, st.art)), `${st.slug}: ছবি নেই`);
    assert.ok(!/[\u4e00-\u9fff\u0600-\u06ff]/.test(st.textBn), `${st.slug}: বাংলা লেখায় অন্য লিপি ঢুকে গেছে`);
  }
  const card = id => data.items.find(i => i.id === id);
  let withBn = 0, withVideo = 0;
  for (const st of aij.stories) {
    assert.ok(card('kid-aij-art-' + st.slug), st.slug + ': ছবি-কার্ড নেই');
    if (card('kid-aij-bn-' + st.slug)) withBn++;
    const v = card('kid-aij-video-' + st.slug);
    if (v) { withVideo++; assert.ok(existsSync(join(ROOT, v.videoUrl)), st.slug + ': ভিডিও নেই'); }
  }
  assert.ok(withBn >= 6, 'বাংলা অডিওসহ গল্প কম: ' + withBn);
  assert.ok(withVideo >= 6, 'ভিডিওসহ গল্প কম: ' + withVideo);
  // একই অডিওর দুইবার কার্ড যেন না থাকে
  const ids = data.items.map(i => i.id);
  assert.equal(new Set(ids).size, ids.length, 'একই আইডি দুইবার আছে');
  const audioUrls = data.items.filter(i => i.type === 'audio').map(i => i.playUrl);
  assert.equal(new Set(audioUrls).size, audioUrls.length, 'একই MP3 দুইবার কার্ডে আছে');
  const idx = JSON.parse(readFileSync(join(ROOT, 'data/ai-jataka-index.json'), 'utf8'));
  assert.equal(idx.schema, 'charyabhumi-kids-ai-jataka-index-v1');
  assert.ok(idx.stories.filter(s => s.audio.bn).length >= 6, 'বাংলা অডিও index-এ নেই');
  // ইংরেজি/হিন্দি অডিও ধাপে ধাপে তৈরি হচ্ছে — অন্তত বাংলা সব গল্পে থাকতেই হবে
  const enN = idx.stories.filter(s => s.audio.en).length, hiN = idx.stories.filter(s => s.audio.hi).length;
  assert.ok(enN + hiN >= 1, 'বাংলা ছাড়া অন্য ভাষার অডিও একটিও নেই');
  assert.ok(idx.stories.every(s => !s.audio.en || existsSync(join(ROOT, s.audio.en))), 'ইংরেজি অডিও ফাইল নেই');
  assert.ok(idx.stories.filter(s => s.video).length >= 6, 'ভিডিওসহ গল্প কম');
});

test('kids-media: slim তালিকায় ভিডিও-পথ আছে (কার্ডে প্লেয়ার বসার জন্য)', () => {
  const slim = JSON.parse(readFileSync(join(ROOT, 'data/kids-media-list.json'), 'utf8'));
  const vids = slim.items.filter(i => i.type === 'video' && i.videoUrl);
  assert.ok(vids.length >= 6, 'slim তালিকায় নিজস্ব ভিডিও নেই: ' + vids.length);
  for (const v of vids) assert.ok(existsSync(join(ROOT, v.videoUrl)), v.id + ': ফাইল নেই');
});
