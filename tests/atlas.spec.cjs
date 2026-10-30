const { test, expect } = require('@playwright/test');
const fs = require('node:fs/promises');

async function atlasReady(page, path = '/atlas.html') {
  await page.goto(path);
  await expect(page.locator('.atlas-profile-card')).toHaveCount(12, { timeout: 15000 });
  await expect(page.locator('.atlas-bib-item')).toHaveCount(35);
}

test('Atlas renders twelve sourced profiles, nine licensed card photos and three honest placeholders', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await atlasReady(page);
  await expect(page.locator('.atlas-profile-card img')).toHaveCount(9);
  await expect(page.locator('.atlas-profile-card .atlas-card-placeholder')).toHaveCount(3);
  await expect(page.locator('.atlas-tour-card')).toHaveCount(2);
  await expect(page.locator('.atlas-archive-card')).toHaveCount(4);
  await expect(page.locator('.atlas-stamp')).toHaveCount(12);
  await expect(page.locator('.atlas-hunt')).toHaveCount(3);
  await expect(page.locator('body')).toContainText('মিথুন মুৎসুদ্দী');
  expect(await page.locator('.atlas-profile-card img').evaluateAll(images => images.every(img => img.complete && img.naturalWidth > 0))).toBe(true);
  expect(errors).toEqual([]);
});

test('profile filters work and reset without changing the underlying scope', async ({ page }) => {
  await atlasReady(page);
  await page.locator('#profileSearch').fill('Somapura Mahavihara');
  await expect(page.locator('.atlas-profile-card')).toHaveCount(1);
  await expect(page.locator('.atlas-profile-card')).toContainText('পাহাড়পুর');
  await page.locator('#profileReset').click();
  await expect(page.locator('.atlas-profile-card')).toHaveCount(12);
  await page.locator('#profileRegion').selectOption('mainamati');
  await expect(page.locator('.atlas-profile-card')).toHaveCount(7);
  await page.locator('#profileDistrict').selectOption('Naogaon');
  await expect(page.locator('.atlas-profile-card')).toHaveCount(0);
  await page.locator('#profileReset').click();
  await page.locator('#profileDistrict').selectOption('Naogaon');
  await expect(page.locator('.atlas-profile-card')).toHaveCount(3);
});

test('Somapura dossier treats Paharpur as one site and exposes research, travel and source detail', async ({ page }) => {
  await atlasReady(page);
  await page.locator('[data-profile="somapura"]').first().click();
  const dossier = page.locator('#dossier-somapura');
  await expect(dossier).toBeVisible();
  await expect(dossier).toContainText('একই স্থান');
  await expect(dossier).toContainText('১৭৭');
  await expect(dossier).toContainText('১৯৮৫');
  await expect(dossier).toContainText('জরিপকৃত প্রবেশদ্বার নয়');
  await expect(dossier).toContainText('বর্তমান প্রবেশমূল্য যাত্রার আগে যাচাই প্রয়োজন');
  await expect(dossier.locator('.atlas-source-item')).toHaveCount(5);
  expect(new URL(page.url()).searchParams.get('site')).toBe('somapura');
});

test('correct evidence answer earns a persistent local stamp; wrong answer does not', async ({ page }) => {
  await atlasReady(page);
  await page.locator('[data-profile="somapura"]').first().click();
  await page.locator('[data-answer-site="somapura"][data-answer="0"]').click();
  await expect(page.locator('[data-quest-feedback]')).toContainText('১৭৭');
  await expect(page.locator('.atlas-stamp.earned')).toHaveCount(0);
  await page.locator('[data-answer-site="somapura"][data-answer="1"]').click();
  await expect(page.locator('.atlas-stamp.earned')).toHaveCount(1);
  await expect(page.locator('#passportProgress')).toContainText('তরুণ প্রত্নতাত্ত্বিক');
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('charyabhumiAtlasPassportV1')));
  expect(stored.stamps.somapura).toBeTruthy();
  await page.reload();
  await expect(page.locator('.atlas-profile-card')).toHaveCount(12);
  await expect(page.locator('.atlas-stamp.earned')).toHaveCount(1);
});

test('passport name, JSON export and validated import retain evidence state', async ({ page }) => {
  await atlasReady(page);
  await page.locator('#passportName').fill('Atlas Learner');
  const downloadEvent = page.waitForEvent('download');
  await page.locator('#exportPassport').click();
  const download = await downloadEvent;
  const data = JSON.parse(await fs.readFile(await download.path(), 'utf8'));
  expect(data.name).toBe('Atlas Learner');
  expect(data.note).toContain('not proof');
  await page.locator('#importPassport').setInputFiles({
    name: 'passport.json', mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify({ name: 'Imported Researcher', stamps: { shalban: '2026-10-24T06:00:00.000Z', 'not-a-site': 'bad' } }))
  });
  await expect(page.locator('#passportName')).toHaveValue('Imported Researcher');
  await expect(page.locator('.atlas-stamp.earned')).toHaveCount(1);
});

test('both circuits expose their stops, straight-line caveats and official travel channels', async ({ page }) => {
  await atlasReady(page);
  await expect(page.locator('.atlas-route-stop')).toHaveCount(7);
  await expect(page.locator('#circuitPlan')).toContainText('actual road route নয়');
  await page.locator('[data-circuit="northern-vihara"]').click();
  await expect(page.locator('.atlas-route-stop')).toHaveCount(5);
  await expect(page.locator('#circuitPlan')).toContainText('ভাসু / বাসু');
  await expect(page.locator('#circuitPlan')).toContainText('সোমপুর');
  await expect(page.locator('#travelModes a[href="https://eticket.railway.gov.bd/"]')).toHaveCount(1);
  await expect(page.locator('#travelModes a[href="https://biwta.gov.bd/"]')).toHaveCount(1);
  await expect(page.locator('#travelModes a[href="https://caab.gov.bd/"]')).toHaveCount(1);
});

test('Shalban 360 media is click-to-load and Paharpur remains an attributed external tour', async ({ page }) => {
  await atlasReady(page);
  await expect(page.locator('#tourGrid iframe')).toHaveCount(0);
  await page.locator('[data-tour-load="shalban"]').click();
  await expect(page.locator('#tourGrid iframe')).toHaveAttribute('src', 'https://www.360cities.net/embed_iframe/shalban-buddhist-bihar');
  await expect(page.locator('#tourGrid')).toContainText('Farsid Raihan');
  await expect(page.locator('#tourGrid a[href="https://kirtistudios-paharpur360tour.vercel.app/"]')).toHaveCount(2);
});

test('bilingual interface, dossier, transcript and bibliography follow the shared language control', async ({ page }) => {
  await atlasReady(page);
  const select = page.locator('#cbLanguageSelect');
  await expect(select.locator('option[value="ccp"]')).toHaveCount(1);
  await expect(select.locator('option[value="rmz"]')).toHaveCount(1);
  await select.selectOption('en');
  await expect(page.locator('#profilesTitle')).toHaveText('In-depth archaeological site profiles');
  await page.locator('[data-profile="somapura"]').first().click();
  await expect(page.locator('#dossier-somapura')).toContainText('one site, not duplicate profiles');
  await expect(page.locator('#dossier-somapura')).toContainText('not a surveyed entrance gate');
  await page.locator('#audioSite').selectOption('somapura');
  await expect(page.locator('#transcriptText')).toContainText('One hundred and seventy-seven');
  await page.locator('#bibSite').selectOption('somapura');
  await expect(page.locator('.atlas-bib-item')).toHaveCount(5);
  await select.selectOption('bn');
  await expect(page.locator('#profilesTitle')).toContainText('প্রত্নস্থলের');
});

test('field desk saves no server submission, persists local drafts and exports explicit draft JSON', async ({ page }) => {
  await atlasReady(page);
  await page.locator('#fieldSite').selectOption('halud-vihara');
  await page.locator('input[name="observed"]').fill('2026-10-24');
  await page.locator('input[name="location"]').fill('Public path outside the northern remains');
  await page.locator('textarea[name="description"]').fill('Observed surface brick displacement from the public path; cause and current extent need authoritative verification.');
  await page.locator('textarea[name="rights"]').fill('Own observation; no third-party photograph uploaded.');
  await page.locator('#fieldForm button[type="submit"]').click();
  await expect(page.locator('.atlas-draft')).toHaveCount(1);
  await expect(page.locator('#fieldStatus')).toContainText('কোথাও পাঠানো হয়নি');
  const downloadEvent = page.waitForEvent('download');
  await page.locator('#exportAllDrafts').click();
  const download = await downloadEvent;
  const data = JSON.parse(await fs.readFile(await download.path(), 'utf8'));
  expect(data.official_submission).toBe(false);
  expect(data.drafts[0].site).toBe('halud-vihara');
  await page.reload();
  await expect(page.locator('.atlas-profile-card')).toHaveCount(12);
  await expect(page.locator('.atlas-draft')).toHaveCount(1);
  await page.locator('[data-draft-delete]').click();
  await expect(page.locator('.atlas-draft')).toHaveCount(0);
});

test('school kit, comic and archival excerpt are real PDF downloads', async ({ page }) => {
  await atlasReady(page);
  for (const path of ['assets/atlas/school-field-notebook.pdf', 'assets/atlas/itu-pala-evidence-comic.pdf', 'assets/atlas/cunningham-1882-selected-pages.pdf']) {
    const response = await page.request.get('/' + path);
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/pdf');
    const body = await response.body();
    expect(body.subarray(0, 4).toString()).toBe('%PDF');
    expect(body.length).toBeGreaterThan(100000);
  }
  await expect(page.locator('a[href="children.html#archaeologist"]')).toHaveCount(1);
  await expect(page.locator('a[href="children.html#paper"]')).toHaveCount(1);
  await expect(page.locator('a[href="children.html#art"]')).toHaveCount(1);
  await expect(page.locator('a[href="children.html#stories"]')).toHaveCount(1);
});

test('compiled map and tracker retain 3,218 places with the same twelve corrected coordinates', async ({ page }) => {
  const response = await page.request.get('/data/tracker-places.json');
  const data = await response.json();
  expect(data.places).toHaveLength(3218);
  expect(data.places.find((place) => place.id === 'charpatra-mura').type).toBe('ব্রাহ্মণ্য মন্দির');
  const expected = {
    sitakot: [25.414018, 89.050667], vasu: [24.982894, 89.29747],
    'halud-vihara': [24.932497, 88.971383], jagaddala: [25.159389, 88.887611],
    shalban: [23.426222, 91.137861], 'kotila-mura': [23.458083, 91.123361]
  };
  for (const [id, coords] of Object.entries(expected)) {
    const record = data.places.find(place => place.id === id);
    expect(record.coords).toEqual(coords);
    expect(record.verify).toContain('atlas-source-reviewed');
  }
  const core = await (await page.request.get('/data/dashboard-core.json')).json();
  const directory = await (await page.request.get('/data/dashboard-directory.json')).json();
  // core/directory-এর ভাগ বদলাতে পারে (core = পূর্ণ রেকর্ড, directory = সংক্ষিপ্ত অ্যারে),
  // কিন্তু মোট সংখ্যা ও id-অখণ্ডতা অপরিবর্তিত থাকতে হবে।
  expect(core.places.length + directory.places.length).toBe(3218);
  const idOf = (place) => (Array.isArray(place) ? place[0] : place.id);
  const ids = [...core.places, ...directory.places].map(idOf);
  expect(ids.filter(Boolean)).toHaveLength(ids.length);
  expect(new Set(ids).size).toBe(ids.length);
});

test('Atlas is linked from shared navigation, archive and existing children tools', async ({ page }) => {
  await page.goto('/index.html');
  await expect(page.locator('#cbNav a[href="atlas.html"]')).toHaveCount(1);
  await expect(page.locator('#cbFeatures a[href="atlas.html"]')).toHaveCount(1);
  await page.goto('/historical-archive.html');
  await expect(page.locator('a[href="atlas.html#tours"]')).toHaveCount(1);
  await page.goto('/children.html');
  await expect(page.locator('#cbNav a[href="atlas.html#passport"]')).toHaveCount(1);
  await expect(page.locator('.kids-jump a[href="atlas.html#passport"]')).toHaveCount(1);
});

test('mobile Atlas and open dossier have no page-level horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await atlasReady(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
  await page.locator('[data-profile="sitakot"]').first().click();
  await expect(page.locator('#dossier-sitakot')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
  await page.locator('#cbLanguageSelect').selectOption('en');
  await expect(page.locator('#profilesTitle')).toHaveText('In-depth archaeological site profiles');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
});
