/* Phase 3 (2026-10-24): Bharat Bhayna brochure record, local Leaflet map,
   donation name passthrough, new children games (memory match + coloring) */
const { test, expect } = require('@playwright/test');

const seenKey = 'charyabhumiWelcomeSeenV1';
async function suppressWelcome(page) {
  await page.addInitScript((key) => sessionStorage.setItem(key, '1'), seenKey);
}

test('Bharat Bhayna card opens detail with brochure facts, 8 photos and sources', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await suppressWelcome(page);
  await page.goto('/index.html?q=%E0%A6%AD%E0%A6%B0%E0%A6%A4%20%E0%A6%AD%E0%A6%BE%E0%A6%AF%E0%A6%BC%E0%A6%A8%E0%A6%BE#explore');
  const card = page.locator('[data-card="khulna-bharat-bhayna-research"]');
  await expect(card).toBeVisible({ timeout: 20000 });
  await expect(card).toContainText('ভরত ভায়না');
  /* শ্রদ্ধাদান লিংকে স্থানের নাম প্যারামিটার হিসেবে যায় */
  const donateHref = await card.locator('.mx-place-tools a.donate').getAttribute('href');
  expect(donateHref).toContain('support.html?site=khulna-bharat-bhayna-research');
  expect(donateHref).toContain('&name=');

  await card.locator('[data-action="details"]').click();
  await expect(page.locator('#placeDialog')).toBeVisible();
  const body = page.locator('#placeDialogBody');
  await expect(body).toContainText('১১.৮৮');
  await expect(body).toContainText('৯৪টি');
  await expect(body).toContainText('কেশবপুর');
  await expect(body.locator('.cb-gallery img')).toHaveCount(8);
  await expect(body.locator('a[href="assets/docs/bharat-bhayna-brochure.pdf"]')).toHaveCount(1);
  await expect(body.locator('.cb-sources a')).toHaveCount(4);
  const states = await body.locator('.cb-gallery img').evaluateAll(async (imgs) => {
    await Promise.all(imgs.map((img) => new Promise((resolve) => {
      if (img.complete) return resolve();
      img.addEventListener('load', resolve, { once: true });
      img.addEventListener('error', resolve, { once: true });
      img.scrollIntoView({ block: 'center' });
    })));
    return imgs.map((img) => ({ src: img.getAttribute('src'), width: img.naturalWidth }));
  });
  expect(states.every((x) => x.width > 0), JSON.stringify(states)).toBe(true);
  expect(errors, errors.join('\n')).toEqual([]);
});

test('map library loads from local vendor files (no CDN dependency)', async ({ page }) => {
  await suppressWelcome(page);
  const vendor = await page.request.get('/assets/vendor/leaflet/leaflet.js');
  expect(vendor.ok()).toBe(true);
  await page.goto('/index.html#map-section');
  await page.locator('#loadMapBtn').click();
  await expect(page.locator('#map.leaflet-container')).toBeVisible({ timeout: 20000 });
  await expect(page.locator('#map .leaflet-pane')).toHaveCount(7);
  const hasL = await page.evaluate(() => !!(window.L && typeof window.L.map === 'function'));
  expect(hasL).toBe(true);
});

test('support page shows the place name (not raw id) for card-referred sites', async ({ page }) => {
  await page.goto('/support.html?site=khulna-bharat-bhayna-research&name=' + encodeURIComponent('ভরত ভায়না বৌদ্ধ মন্দির (ভরতের দেউল)'));
  await expect(page.locator('#donateSite')).toHaveValue('khulna-bharat-bhayna-research', { timeout: 15000 });
  await expect(page.locator('#donateCard')).toContainText('ভরত ভায়না');
  await expect(page.locator('#donateCard')).not.toContainText('khulna-bharat-bhayna-research:');
});

test('children: memory match pairs and Bharat Bhayna coloring work', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('/children.html');
  const cards = page.locator('#gpMemGrid .mx-memcard');
  await expect(cards).toHaveCount(16, { timeout: 20000 });
  const pair = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('#gpMemGrid .mx-memcard'));
    const first = btns[0];
    const match = btns.findIndex((b, i) => i > 0 && b.dataset.icon === first.dataset.icon);
    return match;
  });
  expect(pair).toBeGreaterThan(0);
  await cards.nth(0).click();
  await cards.nth(pair).click();
  await expect(cards.nth(0)).toHaveClass(/done/);
  await expect(cards.nth(pair)).toHaveClass(/done/);
  await expect(page.locator('#gpMemInfo')).toContainText('মিলেছে');

  await expect(page.locator('#gpPalette .mx-palbtn')).toHaveCount(8);
  const cell = page.locator('#gpColorSvg .gp-fill').first();
  await cell.click();
  await expect(cell).toHaveAttribute('data-colored', '1');
  const fill = await cell.evaluate((el) => el.getAttribute('fill'));
  expect(fill).not.toBe('#fffdf6');
  expect(errors, errors.join('\n')).toEqual([]);
});
