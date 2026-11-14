import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // Network-independent tests; production still uses its existing font URLs.
  await page.route('https://fonts.googleapis.com/**', route => route.fulfill({ contentType: 'text/css', body: '' }));
});

async function enterInvestigation(page) {
  await page.goto('/#investigation');
  await expect(page.getByRole('heading', { name: 'Investigation', exact: true })).toBeVisible();
  for (let step = 0; step < 7; step++) {
    await page.locator('main').focus();
    await page.keyboard.press('ArrowRight');
  }
  const confidence = page.getByRole('button', { name: 'Mostly', exact: true });
  await confidence.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByText('Real quake or just noise?', { exact: true }).first()).toBeVisible();
}

test('aliases, unknown hashes, reload and browser history agree', async ({ page }) => {
  await page.goto('/#page3');
  await expect(page.getByRole('heading', { name: 'The Mars', exact: true })).toBeVisible();
  await page.evaluate(() => { location.hash = '#unknown'; });
  await expect(page.getByTitle('Begin Your Journey')).toBeVisible();
  await page.reload();
  await expect(page.getByTitle('Begin Your Journey')).toBeVisible();
  await page.getByTitle('Begin Your Journey').click();
  await expect(page).toHaveURL(/#missions$/);
  await page.goBack();
  await expect(page.getByTitle('Begin Your Journey')).toBeVisible();
  await page.goForward();
  await expect(page.getByRole('heading', { name: 'Choose a World' })).toBeVisible();
});

test('unavailable navigation is disabled and closed search does not consume Ctrl+K', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Search', exact: true })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Menu', exact: true })).toBeDisabled();
  const prevented = await page.evaluate(() => {
    const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true, cancelable: true });
    window.dispatchEvent(event);
    return event.defaultPrevented;
  });
  expect(prevented).toBe(false);
});

test('keyboard confidence, waveform selection and dialogue work without skipping scenes', async ({ page }) => {
  await enterInvestigation(page);
  const waveform = page.locator('[role="button"]').filter({ has: page.getByAltText(/Recording X is/) });
  await waveform.press('Enter');
  await waveform.press('Enter');
  await waveform.press('Space');
  await expect(page.getByText('A magnitude 4 quake,', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Continue NEXUS dialogue' }).press('Enter');
  await page.getByRole('button', { name: 'Continue NEXUS dialogue' }).press('Space');
  await expect(page.getByRole('button', { name: /Continue to Step 2/ })).toBeVisible();
});

test('jumping ahead earns no stamps, and modal focus is contained and restored', async ({ page }) => {
  await enterInvestigation(page);
  await page.getByRole('button', { name: 'Go to Case Board' }).click();
  const trigger = page.getByRole('button', { name: '0/4 Stamps' });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Case 1094 evidence stamps' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText('No evidence stamps collected yet.')).toBeVisible();
  await page.keyboard.press('Tab');
  expect(await dialog.evaluate(el => el.contains(document.activeElement))).toBe(true);
  await page.keyboard.press('ArrowLeft');
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test('verdict placement works with keyboard and confidence labels track the slider', async ({ page }) => {
  await enterInvestigation(page);
  await page.getByRole('button', { name: 'Go to Case Board' }).click();
  await page.getByRole('button', { name: 'This is one event among 1,319 quakes', exact: true }).press('Enter');
  await page.getByRole('button', { name: 'Observation: Place selected evidence' }).press('Space');
  await expect(page.getByRole('button', { name: /Observation: Remove This is one event/ })).toBeVisible();
  await page.getByRole('slider', { name: 'Your Confidence from C0 to C1' }).fill('0.1');
  await expect(page.getByText('10% (Not yet)', { exact: true })).toBeVisible();
});

test('earning Test 3 directly does not award Tests 1 and 2', async ({ page }) => {
  await enterInvestigation(page);
  await page.getByRole('button', { name: 'Go to Test 3' }).click();
  await page.getByTitle('Drag or click Bus (~12 m)').click();
  await page.getByTitle('Drag or click Great Pyramid (~146 m)').click();
  await page.getByRole('button', { name: 'Test Impact Speed' }).click();
  await page.getByRole('slider', { name: 'Meteoroid speed slider' }).fill('80');
  await page.getByRole('button', { name: 'Go to Case Board' }).click();
  await page.getByRole('button', { name: '1/4 Stamps' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByText('A SMALL ROCK CAN DO THIS', { exact: true })).toBeVisible();
  await expect(dialog.getByText('THE GROUND SHOOK', { exact: true })).toHaveCount(0);
});

test('the primary journey and its parent Back destinations remain connected', async ({ page }) => {
  await page.goto('/#home');
  await page.getByTitle('Begin Your Journey').click();
  await page.getByRole('button', { name: 'Explore The Mars equipment' }).press('Space');
  await page.getByTitle('Explore NASA Mars Missions').click();
  await page.getByRole('button', { name: 'Insight - Full Mission' }).press('Enter');
  await page.getByRole('button', { name: 'Explore Missions' }).click();
  await page.getByTitle('Watch the story').click();
  await page.getByTitle('Proceed to Investigation: Case 1094').click();
  await expect(page).toHaveURL(/#investigation$/);
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(page).toHaveURL(/#story-1$/);
  await page.getByRole('button', { name: 'Back to Insight Trailer' }).click();
  await expect(page).toHaveURL(/#insight-mission$/);
});

test('reduced motion is respected', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#story-1');
  const trigger = page.getByTitle('Proceed to Investigation: Case 1094');
  await expect(trigger).toBeVisible();
  const duration = await trigger.evaluate(el => getComputedStyle(el).transitionDuration);
  expect(parseFloat(duration)).toBeLessThanOrEqual(0.00001);
});

test('audio context closes when leaving and rejected resume is reported', async ({ page }) => {
  await page.addInitScript(() => {
    window.audioEvents = [];
    const parameter = () => ({ setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {} });
    window.AudioContext = class {
      state = 'suspended';
      currentTime = 0;
      sampleRate = 100;
      destination = {};
      resume() {
        window.audioEvents.push('resume');
        if (window.rejectAudioResume) return Promise.reject(new Error('Audio denied'));
        this.state = 'running';
        return Promise.resolve();
      }
      close() { this.state = 'closed'; window.audioEvents.push('close'); return Promise.resolve(); }
      createBuffer() { return { getChannelData: () => new Float32Array(450) }; }
      createBufferSource() { return { connect() {}, disconnect() {}, start() {}, stop() {} }; }
      createBiquadFilter() { return { connect() {}, disconnect() {}, frequency: parameter(), Q: parameter() }; }
      createGain() { return { connect() {}, disconnect() {}, gain: parameter() }; }
    };
  });
  await enterInvestigation(page);
  await page.getByTitle('Play Recording X (sped up 100x)').click();
  await expect(page.getByTitle('Play Recording X (sped up 100x)').locator('.lucide-pause')).toBeVisible();
  await page.getByRole('button', { name: 'Return Home' }).click();
  expect(await page.evaluate(() => window.audioEvents)).toEqual(['resume', 'close']);
  await enterInvestigation(page);
  await page.evaluate(() => { window.rejectAudioResume = true; });
  await page.getByTitle('Play Recording X (sped up 100x)').click();
  await expect(page.getByRole('status').filter({ hasText: 'Audio is unavailable.' })).toBeVisible();
});

test('all pages load without application errors or missing local assets', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => {
    if (response.url().startsWith('http://127.0.0.1:4173') && response.status() >= 400) errors.push(response.url());
  });
  for (const hash of ['home', 'missions', 'mars', 'mars-missions', 'mars-insight', 'insight-mission', 'story-1', 'investigation']) {
    await page.goto(`/#${hash}`);
    await expect(page.locator('main')).toBeVisible();
    await expect(page.getByText('This page could not be loaded. Please reload to try again.')).toHaveCount(0);
    await expect(page.getByRole('button', { name: /Compare Reference|Hide Reference/i })).toHaveCount(0);
  }
  expect(errors).toEqual([]);
});
