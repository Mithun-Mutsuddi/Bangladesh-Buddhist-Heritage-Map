/* Mega Features (2026-10-24) smoke tests — run with the existing playwright setup. */
const { test, expect } = require('@playwright/test');

const PAGES = [
  'explore3d.html',
  'travel-planner.html',
  'knowledge.html',
  'research.html',
  'community.html',
  'support.html',
  'heritage-lab.html',
];

for (const page of PAGES) {
  test(page + ' loads without page errors and renders its hero', async ({ page: p }) => {
    const errors = [];
    p.on('pageerror', (e) => errors.push(String(e)));
    await p.goto('/' + page);
    await expect(p.locator('.mx-hero h1')).toBeVisible();
    await p.waitForTimeout(900);
    expect(errors, errors.join('\n')).toEqual([]);
  });
}

test('travel budget calculator returns a total', async ({ page }) => {
  await page.goto('/travel-planner.html');
  await page.click('#budgetCalc');
  await expect(page.locator('#budgetOut')).toContainText('আনুমানিক মোট খরচ');
});

test('festival auto tracker renders countdown cards on calendar', async ({ page }) => {
  await page.goto('/calendar.html#festivals-auto');
  await expect(page.locator('#festivalAuto .mx-card').first()).toBeVisible({ timeout: 8000 });
});

test('knowledge tabs switch (cosmology)', async ({ page }) => {
  await page.goto('/knowledge.html');
  await page.click('[data-tab="cosmology"]');
  await expect(page.locator('#tab-cosmology')).toBeVisible();
  await expect(page.locator('#tab-cosmology h2')).toContainText('স্বর্গ');
});

test('donation card never fabricates an unverified number', async ({ page }) => {
  await page.goto('/support.html');
  await expect(page.locator('#donateWarnings')).toContainText('টাকা পাঠানোর আগে');
  const cardText = await page.locator('#donateCard').innerText();
  expect(cardText).not.toMatch(/\b01[3-9]\d{8}\b/);
});

test('children games-plus section renders explorer profile', async ({ page }) => {
  await page.goto('/children.html#games-plus');
  await expect(page.locator('#gpProfile')).toContainText('আমার পদ', { timeout: 8000 });
});
