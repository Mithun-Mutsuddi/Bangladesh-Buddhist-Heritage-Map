const { test, expect } = require('@playwright/test');

async function suppressWelcome(page) {
  await page.addInitScript(() => sessionStorage.setItem('charyabhumiWelcomeSeenV1', '1'));
}
async function homeReady(page) {
  await expect(page.locator('#placeGrid .cb-place-card').first()).toBeVisible({ timeout: 20000 });
  await expect(page.locator('#dashStatus')).toContainText('৩,২১৮', { timeout: 20000 });
}

test('gazetteer cascade preserves division, exposes all upazilas and filters unknowns', async ({ page }) => {
  await suppressWelcome(page);
  await page.goto('/index.html');
  await homeReady(page);
  await expect(page.locator('#upazilaFilter option')).toHaveCount(497); // all + 495 + unknown
  await page.locator('#divisionFilter').selectOption({ label: 'চট্টগ্রাম' });
  await expect(page.locator('#divisionFilter')).toHaveValue('চট্টগ্রাম');
  await page.locator('#districtFilter').selectOption({ label: 'কুমিল্লা' });
  await expect(page.locator('#districtFilter')).toHaveValue('কুমিল্লা');
  await page.locator('#upazilaFilter').selectOption({ label: 'লাকসাম' });
  expect(await page.evaluate(() => window.CharyabhumiDashboard.getFiltered().every(p => p.upazila === 'লাকসাম'))).toBe(true);
  await page.locator('#upazilaFilter').selectOption('__unknown__');
  expect(await page.evaluate(() => window.CharyabhumiDashboard.getFiltered().every(p => !p.upazila))).toBe(true);
});

test('upazila survives a deep link after the directory loads', async ({ page }) => {
  await suppressWelcome(page);
  await page.goto('/index.html?division=চট্টগ্রাম&district=কুমিল্লা&upazila=লাকসাম');
  await homeReady(page);
  await expect(page.locator('#divisionFilter')).toHaveValue('চট্টগ্রাম');
  await expect(page.locator('#districtFilter')).toHaveValue('কুমিল্লা');
  await expect(page.locator('#upazilaFilter')).toHaveValue('লাকসাম');
  expect(await page.evaluate(() => window.CharyabhumiDashboard.getFiltered().length)).toBeGreaterThan(0);
});

test('public archive has sourced filters, bilingual labels and reduced-motion animation', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/historical-archive.html');
  await expect(page.locator('#archiveGrid .archive-card').first()).toBeVisible({ timeout: 15000 });
  await expect(page.locator('#archiveCount')).toHaveText('৩৫টি item');
  await page.locator('#archiveType').selectOption('audio');
  await expect(page.locator('#archiveGrid .archive-card')).toHaveCount(1);
  await page.locator('#archiveType').selectOption('all');
  await page.locator('#archiveSearch').fill('Charyapada');
  await expect(page.locator('#archiveGrid .archive-card')).toHaveCount(2);
  await page.locator('#archiveSearch').fill('');
  await page.locator('#cbLanguageSelect').selectOption('en');
  await expect(page.locator('#archiveTitle')).toHaveText('Buddhist Historical Archive');
  await expect(page.locator('#archiveGrid .archive-card h3').first()).toContainText('Bouddha Gan');
  expect(await page.locator('.archive-rings').evaluate(el => getComputedStyle(el).animationName)).not.toBe('none');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(await page.locator('.archive-rings').evaluate(el => getComputedStyle(el).animationName)).toBe('none');
  expect(errors).toEqual([]);
});

test('early language control names Chakma and Marma honestly and works on library pages', async ({ page }) => {
  await suppressWelcome(page);
  await page.goto('/index.html');
  await homeReady(page);
  await expect(page.locator('#cbLanguageSelect option[value="ccp"]')).toHaveCount(1);
  await expect(page.locator('#cbLanguageSelect option[value="rmz"]')).toHaveCount(1);
  await page.locator('#cbLanguageSelect').selectOption('ccp');
  await expect(page.locator('#cbLanguageSupport')).toContainText('community');
  await page.locator('#cbLanguageSelect').selectOption('rmz');
  await expect(page.locator('#cbLanguageSupport')).toContainText('Marma');
  await page.goto('/library.html');
  await expect(page.locator('#cbLanguageSelectStandalone')).toBeVisible();
  await expect(page.locator('a[href="historical-archive.html"]')).toHaveCount(1);
});

test('archive and homepage remain within a mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/historical-archive.html');
  await expect(page.locator('#archiveGrid .archive-card').first()).toBeVisible({ timeout: 15000 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await suppressWelcome(page);
  await page.goto('/index.html');
  await homeReady(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
