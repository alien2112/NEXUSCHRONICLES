import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('https://fonts.googleapis.com/**', route => route.fulfill({ contentType: 'text/css', body: '' }));
});

test('direct mission links preload only their artwork and reuse each download', async ({ page }) => {
  const failed = [];
  page.on('response', response => {
    if (response.url().includes('/media/') && !response.ok()) failed.push(response.url());
  });
  await page.goto('/#page4');
  await page.waitForLoadState('networkidle');
  const hints = await page.locator('link[rel=preload][as=image]').evaluateAll(elements => elements.map(e => e.href));
  expect(hints).toHaveLength(2);
  for (const url of hints) {
    expect(new URL(url).pathname).toMatch(/^\/media\/[a-f0-9]{20}\.webp$/);
    const requests = await page.evaluate(url => performance.getEntriesByName(url).length, url);
    expect(requests).toBe(1);
  }
  const horizon = page.locator('main img').first();
  await expect(horizon).toHaveJSProperty('complete', true);
  expect(await horizon.evaluate(img => img.naturalWidth)).toBeGreaterThan(0);
  expect(failed).toEqual([]);
});

test('world selection and Mars reuse the identical background URL', async ({ page }) => {
  await page.goto('/#missions');
  const worldBackground = await page.locator('link[rel=preload][as=image]').getAttribute('href');
  await page.goto('/#mars');
  const marsBackground = await page.locator('link[rel=preload][as=image]').getAttribute('href');
  expect(marsBackground).toBe(worldBackground);
});
