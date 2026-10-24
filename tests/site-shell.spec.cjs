const { test, expect } = require('@playwright/test');

async function homeReady(page) {
  await expect(page.locator('#cbFeatures .cb-feat')).toHaveCount(6, { timeout: 15000 });
  await expect(page.locator('#placeGrid .cb-place-card').first()).toBeVisible({ timeout: 20000 });
}

test('six groups drive navigation and homepage without a duplicate home chatbot', async ({ page }) => {
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('/index.html?welcome=0');
  await homeReady(page);
  await expect(page.locator('.cb-nav-group')).toHaveCount(6);
  await expect(page.locator('.cb-nav-home')).toHaveCount(1);
  await expect(page.locator('#cbFeatures .cb-feat')).toHaveCount(6);
  await expect(page.locator('#sanghamitra')).toHaveCount(0);
  await expect(page.locator('#assistantPanel')).toHaveCount(1);
  await expect(page.locator('#assistantPanel')).toBeHidden();
  await expect(page.locator('#toc')).toHaveCount(0);
  await expect(page.locator('#sections')).toHaveCount(0);
  const ids = await page.locator('[id]').evaluateAll(nodes => nodes.map(n => n.id));
  expect(ids.filter((id, i) => ids.indexOf(id) !== i)).toEqual([]);
  expect(errors).toEqual([]);
});

test('all five migrated content pages use the same grouped shell and one language control', async ({ page }) => {
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  for (const path of ['history.html', 'culture.html', 'kings.html', 'library.html', 'contribution.html']) {
    await page.goto('/' + path);
    await expect(page.locator('.cb-nav-group')).toHaveCount(6, { timeout: 15000 });
    await expect(page.locator('#siteNav')).toHaveCount(0);
    await expect(page.locator('#cbLanguageSelect')).toHaveCount(1);
    await expect(page.locator('#cbLanguageSelectStandalone')).toHaveCount(0);
    await expect(page.locator('#cbFooter')).toContainText('মিথুন মুৎসুদ্দী');
  }
  expect(errors).toEqual([]);
});

test('global search finds external resources and ranks the exact monastery record first', async ({ page }) => {
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('/index.html?welcome=0');
  await homeReady(page);
  await page.locator('[data-search-open]').click();
  await expect(page.locator('#cbSiteSearch')).toBeVisible();
  await page.locator('#cbSiteSearchInput').fill('Scholar');
  await expect(page.locator('#cbSiteSearchResults')).toContainText('Google Scholar');
  await page.locator('#cbSiteSearchInput').fill('Dharmarajika');
  const exact = page.locator('#cbSiteSearchResults a[href="index.html?q=dharmarajika#explore"]');
  await expect(exact).toHaveCount(1, { timeout: 15000 });
  await expect(exact).toContainText('Dharmarajika Buddhist Mahavihara');
  await expect(page.locator('#cbSiteSearchResults')).toContainText('৩,২১৮');
  await page.keyboard.press('Escape');
  await expect(page.locator('#cbSiteSearch')).not.toBeVisible();
  expect(errors).toEqual([]);
});

test('mobile welcome keeps its CTA visible, reopens on demand and leaves a padded homepage', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/index.html?welcome=1');
  await expect(page.locator('#welcomeDialog')).toBeVisible();
  const cta = await page.locator('#welcomeExplore').boundingBox();
  const form = await page.locator('#welcomeForm').boundingBox();
  expect(cta.y).toBeLessThan(844);
  expect(form.y).toBeGreaterThan(cta.y);
  await page.locator('#welcomeExplore').click();
  await expect(page.locator('#welcomeDialog')).not.toBeVisible();
  const heroText = await page.locator('.cb-hero h1').boundingBox();
  expect(heroText.x).toBeGreaterThanOrEqual(20);
  expect(heroText.x + heroText.width).toBeLessThanOrEqual(370);
  await page.locator('#welcomeOpen').click();
  await expect(page.locator('#welcomeDialog')).toBeVisible();
  await page.locator('#welcomeDismiss').click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.goto('/index.html?welcome=0');
  await page.waitForTimeout(600);
  await expect(page.locator('#welcomeDialog')).not.toBeVisible();
  await page.locator('#welcomeOpen').click();
  await expect(page.locator('#welcomeDialog')).toBeVisible();
  await page.locator('#welcomeDismiss').click();
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto('/index.html?welcome=0');
  await expect(page.locator('#cbBurger')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const burger = await page.locator('#cbBurger').boundingBox();
  expect(burger.x + burger.width).toBeLessThanOrEqual(320);
});

test('mobile grouped navigation closes after a same-page destination is chosen', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/atlas.html');
  await expect(page.locator('.cb-nav-group')).toHaveCount(6, { timeout: 15000 });
  await page.locator('#cbBurger').click();
  await page.locator('.cb-nav-group[data-nav-group="learning"] summary').click();
  await page.locator('#cbNav a[href="atlas.html#school-kit"]').click();
  await expect(page).toHaveURL(/atlas\.html#school-kit$/);
  await expect(page.locator('#cbNav')).not.toBeVisible();
  await expect(page.locator('#cbBurger')).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('#cbNav [aria-current="location"]')).toHaveAttribute('href', 'atlas.html#school-kit');
});

test('external resources stay subcategorized, searchable and rights-labelled', async ({ page }) => {
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('/library.html#research-tools');
  await expect(page.locator('[data-resource-card]')).toHaveCount(10, { timeout: 15000 });
  await page.locator('[data-resource-search]').fill('Scholar');
  await expect(page.locator('[data-resource-card]:visible')).toHaveCount(1);
  await expect(page.locator('[data-resource-card]:visible h3')).toHaveText('Google Scholar');
  await expect(page.locator('[data-resource-card]:visible')).toContainText('peer-reviewed');
  await page.locator('[data-resource-search]').fill('Classroom');
  await expect(page.locator('[data-resource-card]:visible a')).toHaveAttribute('href', /classroom\.google\.com\/share/);
  expect(await page.locator('[data-resource-card] iframe').count()).toBe(0);
  await page.goto('/atlas.html#travel-tools');
  await expect(page.locator('[data-resource-card]')).toHaveCount(5, { timeout: 15000 });
  await expect(page.locator('#cbNav [aria-current]')).toHaveCount(1);
  await expect(page.locator('#cbNav [aria-current="page"]')).toHaveAttribute('href', 'atlas.html');
  await expect(page.locator('#school-kit')).toHaveCount(1);
  await page.goto('/atlas.html#school-kit');
  await expect(page.locator('#cbNav [aria-current]')).toHaveCount(1);
  await expect(page.locator('#cbNav [aria-current="location"]')).toHaveAttribute('href', 'atlas.html#school-kit');
  expect(errors).toEqual([]);
});

test('the same single SanghaMitra panel works on the homepage and tracker', async ({ page }) => {
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('/index.html?assistant=1');
  await expect(page.locator('#assistantPanel')).toBeVisible();
  await page.waitForTimeout(500);
  await expect(page.locator('#welcomeDialog')).not.toBeVisible();
  await expect(page.locator('#assistantPanel')).toHaveCount(1);
  await page.locator('#chatInput').fill('Dharmarajika');
  await page.locator('#chatForm .send-button').click();
  await expect(page.locator('#chatMessages a[target="_blank"][href*="dharmarajika"]')).toBeVisible({ timeout: 15000 });
  await page.goto('/tracker.html');
  await expect(page.locator('.district-path')).toHaveCount(64, { timeout: 20000 });
  await expect(page.locator('#assistantPanel')).toHaveCount(1);
  await expect(page.locator('.assistant-panel')).toHaveCount(0);
  await page.locator('.sidebar [data-sangha-open]').click();
  await expect(page.locator('#assistantPanel')).toBeVisible();
  await page.locator('#chatInput').fill('My progress');
  await page.locator('#chatForm .send-button').click();
  await expect(page.locator('#chatMessages .message').last()).toContainText('Please enable');
  expect(errors).toEqual([]);
});
