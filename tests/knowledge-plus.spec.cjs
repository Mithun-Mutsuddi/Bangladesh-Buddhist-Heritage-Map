/* Phase 4 (2026-10-24): knowledge encyclopedia expansion — yanas/dana/disciples,
   beings & myths, world Buddhism stats & styles */
const { test, expect } = require('@playwright/test');

test('schools tab explains yanas, disciples, dana and FAQ', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('/knowledge.html#schools');
  await expect(page.locator('#yanaGrid')).toContainText('সহজযান', { timeout: 20000 });
  await expect(page.locator('#yanaGrid')).toContainText('মন্ত্রযান');
  await expect(page.locator('#yanaGrid')).toContainText('তন্ত্রযান');
  await expect(page.locator('#yanaDiagram svg')).toBeVisible();
  await expect(page.locator('#peopleMain')).toContainText('মহাকস্সপ');
  await expect(page.locator('#peopleMain')).toContainText('মহাপ্রজাপতী গোতমী');
  await expect(page.locator('#peopleMain')).toContainText('উপগুপ্ত');
  await expect(page.locator('#peopleMain')).toContainText('সিবলী');
  await expect(page.locator('#danaMain')).toContainText('সংঘদান');
  await expect(page.locator('#danaMain')).toContainText('অভয়দান');
  await expect(page.locator('#faqGrid')).toContainText('লাফিং বুদ্ধ');
  await expect(page.locator('#faqGrid')).toContainText('শামুক নয়');
  expect(errors, errors.join('\n')).toEqual([]);
});

test('beings tab renders creature and deity cards with stories', async ({ page }) => {
  await page.goto('/knowledge.html#beings');
  const grid = page.locator('#beingsGrid .mx-card');
  await expect(grid).toHaveCount(21, { timeout: 20000 });
  await expect(page.locator('#beingsGrid')).toContainText('মুচলিন্দ');
  await expect(page.locator('#beingsGrid')).toContainText('গরুড়');
  await expect(page.locator('#beingsGrid')).toContainText('কুবের');
  await expect(page.locator('#beingsGrid')).toContainText('সাদা বাঘ');
  await expect(page.locator('#beingsGrid')).toContainText('চাঁদে খরগোশের ছাপ');
});

test('world tab shows Pew stats, majority countries, constitution table and styles', async ({ page }) => {
  await page.goto('/knowledge.html#world');
  await expect(page.locator('#worldMain')).toContainText('৩২৪ মিলিয়ন', { timeout: 20000 });
  await expect(page.locator('#worldMain .mx-poprow')).toHaveCount(10);
  await expect(page.locator('#worldMain')).toContainText('কম্বোডিয়া');
  await expect(page.locator('#worldMain')).toContainText('সর্বাগ্রে স্থান');
  await expect(page.locator('#worldMain')).toContainText('বাংলাদেশে');
  const commons = page.locator('#worldMain a[href*="commons.wikimedia.org"]');
  await expect(commons).toHaveCount(10);
  await expect(page.locator('#worldMain .mx-styleface')).toHaveCount(10);
});

test('knowledge search finds new entries', async ({ page }) => {
  await page.goto('/knowledge.html');
  await expect(page.locator('#faqGrid')).toContainText('লাফিং বুদ্ধ', { timeout: 20000 });
  await page.fill('#kbSearch', 'লাফিং');
  await expect(page.locator('#kbSearchResults')).toContainText('লাফিং বুদ্ধ', { timeout: 10000 });
  await page.fill('#kbSearch', 'সহজযান');
  await expect(page.locator('#kbSearchResults')).toContainText('সহজযান', { timeout: 10000 });
});
