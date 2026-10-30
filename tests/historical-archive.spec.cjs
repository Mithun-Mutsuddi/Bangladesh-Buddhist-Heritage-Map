// Public Historical Archive — জমা-প্রবাহ (অডিট P0) এন্ড-টু-এন্ড যাচাই।
// খসড়া সংরক্ষণ → reload-এ টিকে থাকা → JSON রপ্তানি → GitHub issue → মুছে ফেলা → মোবাইল।
const { test, expect } = require('@playwright/test');

const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jK1kAAAAASUVORK5CYII=',
  'base64'
);

async function fillDraft(page) {
  await page.locator('#draftTitle').fill('ময়নামতির ১৯৫০-এর সংস্কার আলোকচিত্র');
  await page.selectOption('#draftType', 'image');
  await page.locator('#draftPlace').fill('ময়নামতি, কুমিল্লা');
  await page.locator('#draftHistoricDate').fill('আনুমানিক ১৯৫০');
  await page.locator('#draftPhotographer').fill('অজানা');
  await page.locator('#draftDescription').fill('পরিবারের সংরক্ষিত ছবি; পেছনে হাতে লেখা তারিখ আছে।');
  await page.locator('#draftUrl').fill('https://example.org/source');
}

test('archive submission keeps a private draft, exports JSON and opens a prefilled GitHub issue', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));

  await page.goto('/historical-archive.html');
  await expect(page.locator('#draftForm')).toBeVisible();

  // ব্রাউজ-তালিকার ফলাফল-সংখ্যা যেন খসড়ার সংখ্যায় নষ্ট না হয়
  const browseCount = await page.locator('#archiveCount').textContent();

  await fillDraft(page);
  await page.locator('#draftFile').setInputFiles({ name: 'archive.png', mimeType: 'image/png', buffer: PNG });
  await page.locator('#draftForm button[type="submit"]').click();

  await expect(page.locator('#draftStatus')).toContainText('সংরক্ষিত');
  await expect(page.locator('#draftList .archive-record')).toHaveCount(1);
  await expect(page.locator('#draftCount')).toHaveText('১');
  await expect(page.locator('#draftList .archive-record h4')).toHaveText('ময়নামতির ১৯৫০-এর সংস্কার আলোকচিত্র');
  await expect(page.locator('#draftList .archive-preview-image')).toHaveCount(1);
  await expect(page.locator('#archiveCount')).toHaveText(browseCount.replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[Number(d)]));

  // reload-এর পরেও এই ডিভাইসে থাকে
  await page.reload();
  await expect(page.locator('#draftList .archive-record')).toHaveCount(1);

  // JSON রপ্তানি
  const download = page.waitForEvent('download');
  await page.locator('#draftJsonExport').click();
  expect((await download).suggestedFilename()).toBe('buddhist-historical-archive.json');

  // GitHub issue — window.open আটকে URL যাচাই (লগইন রিডাইরেক্ট এড়াতে)
  await page.evaluate(() => {
    window.__opened = null;
    window.open = (u) => {
      window.__opened = u;
      return { focus() {}, close() {} };
    };
  });
  await page.locator('#draftSubmit').click();
  const opened = await page.evaluate(() => window.__opened);
  expect(opened).toContain('github.com/Mithun-Mutsuddi/Bangladesh-Buddhist-Heritage-Map/issues/new');
  const decoded = decodeURIComponent(opened);
  expect(decoded).toContain('ময়নামতির ১৯৫০-এর সংস্কার আলোকচিত্র');
  expect(decoded).toContain('ময়নামতি, কুমিল্লা');
  expect(decoded).toContain('archive.png');

  // মুছে ফেলা (confirm ডায়ালগ গ্রহণ)
  page.once('dialog', (d) => d.accept());
  await page.locator('[data-archive-delete]').first().click();
  await expect(page.locator('#draftList .archive-record')).toHaveCount(0);
  await expect(page.locator('#draftCount')).toHaveText('০');

  expect(errors).toEqual([]);
});

test('archive submission stays readable and within a narrow mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/historical-archive.html');

  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

  const metrics = await page.evaluate(() => {
    const field = document.getElementById('draftTitle');
    const submit = document.querySelector('#draftForm button[type="submit"]');
    return {
      fieldFont: parseFloat(getComputedStyle(field).fontSize),
      submitHeight: submit.getBoundingClientRect().height,
      submitFont: parseFloat(getComputedStyle(submit).fontSize),
    };
  });
  expect(metrics.fieldFont).toBeGreaterThanOrEqual(14);
  expect(metrics.submitHeight).toBeGreaterThanOrEqual(44);
  expect(metrics.submitFont).toBeGreaterThanOrEqual(12.5);

  await fillDraft(page);
  await page.locator('#draftForm button[type="submit"]').click();
  await expect(page.locator('#draftList .archive-record')).toHaveCount(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
