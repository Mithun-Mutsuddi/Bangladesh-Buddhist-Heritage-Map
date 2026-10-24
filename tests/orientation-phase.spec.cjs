/* Orientation / Restoration / Corridors / Offline phase (2026-10-24 phase 2) */
const { test, expect } = require('@playwright/test');

const PAGES = ['orientation.html', 'restoration.html', 'corridors.html', 'offline.html'];

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

test('sunrise azimuth calculator produces a degree value and solstice shift', async ({ page }) => {
  await page.goto('/orientation.html#solarcalc');
  await expect(page.locator('#azOut .mx-bigout').first()).toBeVisible({ timeout: 8000 });
  const equinox = await page.locator('#azOut .mx-bigout').first().innerText();
  expect(equinox).toMatch(/°/);
  await page.click('#azSolsticeS');
  await page.waitForTimeout(350);
  const summer = await page.locator('#azOut .mx-bigout').first().innerText();
  expect(summer).not.toEqual(equinox);
  await expect(page.locator('#azCompass svg')).toBeVisible();
});

test('Mandala geometry layer toggles visibility', async ({ page }) => {
  await page.goto('/orientation.html#Mandala');
  await expect(page.locator('#MandalaPlan')).toBeVisible({ timeout: 8000 });
  const btn = page.locator('#MandalaBtns [data-layer="solar"]');
  await expect(btn).toHaveAttribute('aria-pressed', 'false');
  const before = await page.locator('#MandalaPlan [data-layer="solar"]').evaluate((g) => g.style.display);
  expect(before).toBe('none');
  await btn.click();
  const after = await page.locator('#MandalaPlan [data-layer="solar"]').evaluate((g) => g.style.display);
  expect(after).toBe('');
});

test('anastylosis demo switches between colored layer and photo mode', async ({ page }) => {
  await page.goto('/restoration.html#anastylosis');
  await expect(page.locator('#anaSvg svg')).toBeVisible();
  const coloredHtml = await page.locator('#anaSvg').innerHTML();
  await page.click('#anaPhotoBtn');
  await expect(page.locator('#anaPhotoBtn')).toHaveAttribute('aria-pressed', 'true');
  const photoHtml = await page.locator('#anaSvg').innerHTML();
  expect(photoHtml).not.toEqual(coloredHtml);
  await page.fill('#histSlider', '80');
  const split = await page.locator('#histCompare').evaluate((el) => getComputedStyle(el).getPropertyValue('--split'));
  expect(split.trim()).toBe('80%');
});

test('corridor map renders nodes and route filter works', async ({ page }) => {
  await page.goto('/corridors.html#map');
  await expect(page.locator('#corSvg')).toBeVisible({ timeout: 8000 });
  const nodeCount = await page.locator('#corSvg .cor-node').count();
  expect(nodeCount).toBeGreaterThanOrEqual(16);
  await page.locator('#corSvg .cor-node[data-id="bagan"]').click();
  await expect(page.locator('#corDetail')).toContainText('বাগান');
  await page.locator('#routeBtns [data-kind="sea"]').click();
  const seaDisplay = await page.locator('#corSvg [data-kind="sea"]').evaluate((g) => g.style.display);
  expect(seaDisplay).toBe('none');
});

test('offline page renders position plot and pack download', async ({ page }) => {
  await page.goto('/offline.html');
  await expect(page.locator('#plotSvg svg')).toBeVisible({ timeout: 8000 });
  const items = await page.locator('#plotList li').count();
  expect(items).toBe(12);
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.click('#packBtn'),
  ]);
  expect(await download.suggestedFilename()).toContain('offline-pack');
});

test('new pages stay within a narrow mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const p of PAGES) {
    await page.goto('/' + p);
    await page.waitForTimeout(700);
    const ok = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
    expect(ok, p + ' overflows at 390px').toBeTruthy();
  }
});
