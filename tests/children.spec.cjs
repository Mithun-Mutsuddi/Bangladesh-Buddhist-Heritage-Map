const { test, expect } = require('@playwright/test');

async function childrenReady(page) {
  await page.goto('/children.html');
  await expect(page.locator('#mediaGrid .kids-media-card')).toHaveCount(8, { timeout: 15000 });
  await expect(page.locator('#craftTabs [role="tab"]')).toHaveCount(6);
  await expect(page.locator('#chantList .chant-card')).toHaveCount(7);
}

async function suppressWelcome(page) {
  await page.addInitScript(() => sessionStorage.setItem('charyabhumiWelcomeSeenV1', '1'));
}

test('children shelf is source-aware, filterable and never offers an unauthorised ACK PDF', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await childrenReady(page);
  await expect(page.locator('#mediaCount')).toContainText('৮টি');
  await page.locator('[data-media-filter="watch"]').click();
  await expect(page.locator('#mediaGrid .kids-media-card')).toHaveCount(2);
  await page.locator('[data-media-filter="download"]').click();
  await expect(page.locator('#mediaGrid .kids-media-card')).toHaveCount(4);
  await page.locator('[data-media-filter="all"]').click();
  const ack = page.locator('[data-media-id="ack-buddha-official"]');
  await expect(ack).toContainText('Amar Chitra Katha');
  await expect(ack).toContainText('Protected commercial content');
  await expect(ack.locator('a[href$=".pdf"]')).toHaveCount(0);
  await expect(ack.locator('.kids-media-actions a[href="https://digital.amarchitrakatha.com/id005835005/Buddha"]')).toHaveCount(1);
  await expect(ack).toContainText('Buy ও Subscribe');
  expect(await page.locator('#mediaGrid a[href^="assets/"]').evaluateAll(links => links.every(a => !a.href.includes('archive.org')))).toBe(true);
  expect(errors).toEqual([]);
});

test('local comic opens, pages forward and back, and retains a PDF alternative', async ({ page }) => {
  await childrenReady(page);
  await page.locator('[data-open-comic]').click();
  await expect(page.locator('#comicDialog')).toBeVisible();
  await expect(page.locator('#comicStatus')).toContainText('১ / ৩');
  await page.locator('#comicNext').click();
  await expect(page.locator('#comicPageImage')).toHaveAttribute('src', /page2\.jpg$/);
  await expect(page.locator('#comicStatus')).toContainText('শান্তিপূর্ণ পথ');
  await page.keyboard.press('Escape');
  await expect(page.locator('#comicDialog')).not.toBeVisible();
  await expect(page.locator('#comicDialog a[download]')).toHaveAttribute('href', 'assets/children/pdf/banyan-deer-mini-comic.pdf');
});

test('quiz gives explanations, completes all six rounds and restarts', async ({ page }) => {
  await childrenReady(page);
  const correct = [1, 0, 2, 1, 0, 1];
  for (let i = 0; i < correct.length; i += 1) {
    await page.locator(`#quizAnswers [data-answer="${correct[i]}"]`).click();
    await expect(page.locator('#quizFeedback')).toContainText('ঠিক ধরেছ');
    expect(await page.locator('#quizAnswers button').evaluateAll(buttons => buttons.every(button => button.disabled))).toBe(true);
    await page.locator('#quizNext').click();
  }
  await expect(page.locator('#quizQuestion')).toHaveText('তোমার ফল: ৬ / ৬');
  await page.locator('#quizNext').click();
  await expect(page.locator('#quizProgress')).toHaveText('প্রশ্ন ১ / ৬');
  await expect(page.locator('#quizScore')).toHaveText('০ / ৬ সঠিক');
});

test('memory cards are real buttons and a matching pair stays revealed', async ({ page }) => {
  await childrenReady(page);
  const cards = page.locator('.memory-card');
  await expect(cards).toHaveCount(12);
  const labels = await page.locator('.memory-value small').allTextContents();
  let first = 0; let second = 1;
  for (let i = 0; i < labels.length; i += 1) {
    const pair = labels.findIndex((label, j) => j > i && label === labels[i]);
    if (pair !== -1) { first = i; second = pair; break; }
  }
  await cards.nth(first).click();
  await cards.nth(second).click();
  await expect(cards.nth(first)).toHaveClass(/matched/);
  await expect(cards.nth(second)).toHaveClass(/matched/);
  await expect(page.locator('#memoryMoves')).toHaveText('১ চাল');
  await page.locator('#memoryReset').click();
  await expect(page.locator('.memory-card.matched')).toHaveCount(0);
});

test('before/after dialog supports keyboard, presets and explicit reconstruction labels', async ({ page }) => {
  await childrenReady(page);
  await page.locator('#timeOpen').click();
  await expect(page.locator('#timeDialog')).toBeVisible();
  const range = page.locator('#compareRange');
  await range.focus();
  await page.keyboard.press('ArrowRight');
  await expect(range).toHaveValue('51');
  await expect(range).toHaveAttribute('aria-valuetext', /৫১ শতাংশ/);
  await page.locator('[data-compare="100"]').click();
  await expect(range).toHaveValue('100');
  await expect(page.locator('#compare')).toHaveAttribute('style', /--split:\s*100%/);
  await expect(page.locator('.compare-label.old')).toHaveText('সম্ভাব্য reconstruction');
  await expect(page.locator('.dialog-credit')).toContainText('AI-assisted');
  await page.keyboard.press('Escape');
  await expect(page.locator('#timeDialog')).not.toBeVisible();
});

test('dig has a keyboard-accessible reveal, reset and working pointer scratch', async ({ page }) => {
  await childrenReady(page);
  await page.locator('#digReveal').click();
  await expect(page.locator('#digDiscovery')).toBeVisible();
  await expect(page.locator('#digPercent')).toHaveText('১০০%');
  await expect(page.locator('#digDiscovery')).toContainText('টেরাকোটা ভাস্কর্যের খণ্ডাংশ');
  await expect(page.locator('#digDiscovery')).not.toContainText('মুদ্রা আবিষ্কার');
  await page.locator('#digReset').click();
  await expect(page.locator('#digDiscovery')).not.toBeVisible();
  const canvas = page.locator('#digCanvas');
  await canvas.evaluate(el => el.scrollIntoView({ block: 'center' }));
  const box = await canvas.boundingBox();
  for (let row = 0; row < 6; row += 1) {
    const y = box.y + box.height * (0.12 + row * 0.15);
    await page.mouse.move(box.x + box.width * 0.08, y);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.92, y, { steps: 22 });
    await page.mouse.up();
  }
  await expect(page.locator('#digDiscovery')).toBeVisible({ timeout: 10000 });
  await expect(page.locator('#digPercent')).toHaveText('১০০%');
});

test('colouring supports selection, pointer drawing, eraser-safe layers and PNG download', async ({ page }) => {
  await childrenReady(page);
  await page.locator('#artSelect').selectOption('stupa-dot-to-dot');
  await expect(page.locator('#artDescription')).toContainText('১ থেকে ১৭');
  await page.locator('[data-color="#376b9b"]').click();
  const box = await page.locator('#artCanvas').boundingBox();
  await page.mouse.move(box.x + box.width * .25, box.y + box.height * .3);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * .65, box.y + box.height * .6, { steps: 16 });
  await page.mouse.up();
  await page.locator('#artEraser').click();
  await expect(page.locator('#artEraser')).toHaveAttribute('aria-pressed', 'true');
  await page.locator('#artEraser').click();
  const downloadEvent = page.waitForEvent('download');
  await page.locator('#artDownload').click();
  const download = await downloadEvent;
  expect(download.suggestedFilename()).toBe('charyabhumi-my-art.png');
  await page.locator('#artReset').click();
});

test('all six culture tabs connect context, four steps, safety and source; bowl has local audio', async ({ page }) => {
  await childrenReady(page);
  const tabs = page.locator('#craftTabs [role="tab"]');
  for (let i = 0; i < 6; i += 1) {
    await tabs.nth(i).click();
    await expect(tabs.nth(i)).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('#craftStepList li')).toHaveCount(4);
    await expect(page.locator('#craftSafety')).not.toBeEmpty();
    expect(await page.locator('#craftSource').getAttribute('href')).toMatch(/^https:\/\//);
    await expect(page.locator('#craftSvg title')).toContainText('ধাপ ১');
  }
  await tabs.nth(3).click();
  await expect(page.locator('#craftAudio audio')).toHaveCount(1);
  await expect(page.locator('#craftAudio')).toContainText('প্রকৃত singing-bowl recording নয়');
  await tabs.first().click();
  await page.locator('#craftNext').click();
  await expect(page.locator('#craftStepStatus')).toContainText('ধাপ ২');
  await page.locator('#craftPlay').click();
  await expect(page.locator('#craftStepStatus')).toContainText('ধাপ ৩', { timeout: 5000 });
  await page.locator('#craftPlay').click();
  await tabs.first().focus();
  await page.keyboard.press('ArrowRight');
  await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
});

test('chant list distinguishes regional leads from an original synthesized song', async ({ page }) => {
  await childrenReady(page);
  const regional = page.locator('#chantList .chant-card').nth(2);
  await expect(regional).toContainText('অনুমোদিত recording');
  await expect(regional.locator('audio')).toHaveCount(0);
  const original = page.locator('#chantList .chant-card').nth(3);
  await expect(original).toContainText('ঐতিহ্যবাহী কীর্তন নয়');
  await expect(original.locator('audio')).toHaveAttribute('preload', 'none');
  await expect(original.locator('a[download]')).toHaveAttribute('href', 'assets/children/pdf/maitri-original-song.pdf');
  const external = page.locator('#chantList .chant-card').nth(4);
  await expect(external).toContainText('Search-indexed listening lead');
  await expect(external).toContainText('নিশিতা বড়ুয়া');
  await expect(external.locator('a[href*="youtube.com/watch"]')).toHaveCount(1);
  await expect(external.locator('audio, a[download]')).toHaveCount(0);
  await expect(external).toContainText('independently verified নয়');
});

test('children page and time dialog stay within a narrow mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await childrenReady(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.locator('#timeOpen').click();
  const box = await page.locator('#timeDialog').boundingBox();
  expect(box.width).toBeLessThanOrEqual(390);
  await page.locator('[data-dialog-close="timeDialog"]').click();
  await page.locator('#art').scrollIntoViewIfNeeded();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.locator('#heroMotion').click();
  await expect(page.locator('body')).toHaveClass(/motion-paused/);
});

test('reduced-motion preference pauses decorative animation without blocking activities', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await childrenReady(page);
  await expect(page.locator('body')).toHaveClass(/motion-paused/);
  await expect(page.locator('#heroMotion')).toHaveAttribute('aria-pressed', 'true');
  await page.locator('#timeOpen').click();
  await page.locator('[data-compare="50"]').click();
  await expect(page.locator('#compareRange')).toHaveValue('50');
});

test('homepage and shared navigation integrate children without changing existing directory coverage', async ({ page }) => {
  await suppressWelcome(page);
  await page.goto('/index.html');
  await expect(page.locator('#placeGrid .cb-place-card').first()).toBeVisible({ timeout: 20000 });
  await expect(page.locator('#dashStatus')).toContainText('৩,২১৮', { timeout: 20000 });
  await expect(page.locator('#cbFeatures .cb-feat')).toHaveCount(16);
  await expect(page.locator('.cb-nav a[href="children.html"]')).toHaveCount(1);
  await expect(page.locator('.cb-cards a[href="children.html"]')).toHaveCount(1);
  await page.locator('#cbLanguageSelect').selectOption('en');
  await expect(page.locator('.cb-nav a[href="children.html"]')).toHaveText('Children');
  await expect(page.locator('.cb-cards a[href="children.html"] b')).toHaveText('Children: learn, play & make');
  await page.locator('.cb-nav a[href="children.html"]').click();
  await expect(page).toHaveURL(/children\.html$/);
  await expect(page.locator('#mediaGrid .kids-media-card')).toHaveCount(8, { timeout: 15000 });
});
