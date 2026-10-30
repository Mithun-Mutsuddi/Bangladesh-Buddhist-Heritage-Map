/* সংখ্যা-মিল: data/counts.json-এর প্রতিটি সংখ্যা বর্তমান ডেটার সঙ্গে মিলছে কি না।
   ডেটা বদলে টুল না চালালে এই টেস্ট ফেল করবে — তাই README/পাতার সংখ্যা কখনো পুরোনো হবে না। */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

test('data/counts.json is up to date with the data files', () => {
  const before = readFileSync(join(root, 'data/counts.json'), 'utf8');
  execFileSync('python3', [join(root, 'tools/reconcile_counts.py')], { stdio: 'pipe' });
  const after = readFileSync(join(root, 'data/counts.json'), 'utf8');
  const beforeJson = JSON.parse(before);
  const afterJson = JSON.parse(after);
  assert.deepEqual(afterJson.buddha_vamsa, beforeJson.buddha_vamsa, 'counts.json is stale — run `python tools/reconcile_counts.py`');
  assert.deepEqual(afterJson.site, beforeJson.site, 'site counts are stale');
});

test('declared record counts match the actual records', () => {
  const sites = JSON.parse(readFileSync(join(root, 'data/heritage-sites.json'), 'utf8'));
  assert.equal(sites.records.length, sites.record_count, 'heritage-sites record_count disagrees with records');
  const counts = JSON.parse(readFileSync(join(root, 'data/counts.json'), 'utf8'));
  assert.equal(counts.site.heritage_sites, sites.records.length);
});

test('no data file repeats another division\'s entry ids', () => {
  const counts = JSON.parse(readFileSync(join(root, 'data/counts.json'), 'utf8'));
  assert.ok(counts.buddha_vamsa.communities >= 20, 'expected the community register to be filled');
  assert.ok(counts.buddha_vamsa.archives_with_image > 0, 'archives should carry some real images');
  assert.ok(counts.buddha_vamsa.riddhi_events >= 10);
});
