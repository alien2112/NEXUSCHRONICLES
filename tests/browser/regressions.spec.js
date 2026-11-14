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
  const waveform = page.locator('[role="button"]').filter({ has: page.getByRole('img', { name: /Recording X is/ }) });
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
  await page.getByRole('button', { name: 'Go to Step 3' }).click();
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
  await expect(page).toHaveURL(/#story-1$/);
  await expect(page.getByTitle('Proceed to Investigation: Case 1094')).toHaveCount(0);
  await page.getByRole('button', { name: 'Back to Insight Trailer' }).click();
  await expect(page).toHaveURL(/#insight-mission$/);

  await page.getByRole('button', { name: 'Investigation', exact: true }).click();
  await expect(page).toHaveURL(/#investigation$/);
  await expect(page.getByRole('heading', { name: 'Investigation', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(page).toHaveURL(/#home$/);
});

test('reduced motion is respected', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#story-1');
  const trigger = page.getByRole('button', { name: 'Investigation', exact: true });
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
  for (const hash of [
    'home',
    'missions',
    'mars',
    'mars-missions',
    'mars-insight',
    'insight-mission',
    'story-1',
    'investigation',
    'case-board',
    'go-deeper',
    'go-deeper-2',
    'go-deeper-3',
    'go-deeper-4',
    'go-deeper-5',
    'go-deeper-6',
    'go-technical',
    'go-technical-2',
    'go-technical-3',
    'go-technical-4',
    'go-technical-5',
    'go-technical-6',
    'go-technical-7',
    'go-technical-8',
    'go-technical-9',
    'go-technical-10',
    'engineering-legacy',
  ]) {
    await page.goto(`/#${hash}`);
    await expect(page.locator('main')).toBeVisible();
    await expect(page.getByText('This page could not be loaded. Please reload to try again.')).toHaveCount(0);
    await expect(page.getByRole('button', { name: /Compare Reference|Hide Reference/i })).toHaveCount(0);
  }
  expect(errors).toEqual([]);
});

test('story 1 removes Go deeper and Investigation entries, and post-investigation Case Board offers Go deeper and Go technical', async ({ page }) => {
  await page.goto('/#story-1');
  await expect(page.getByRole('button', { name: 'Go deeper' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Investigation: Case 1094' })).toHaveCount(0);

  await page.getByRole('button', { name: 'Investigation', exact: true }).click();
  await expect(page).toHaveURL(/#investigation$/);

  await enterInvestigation(page);
  await page.getByRole('button', { name: 'Go to Case Board' }).click();
  await expect(page.getByRole('button', { name: 'Go deeper' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Go technical' })).toBeVisible();

  // Go deeper (Science Behind It) 6-page journey from Case Board
  await page.getByRole('button', { name: 'Go deeper' }).click();
  await expect(page).toHaveURL(/#go-deeper$/);
  await expect(page.getByRole('heading', { name: 'The Planet That Whispers' })).toBeVisible();

  const deeperTitles = [
    { hash: /#go-deeper-2$/, title: 'How a whisper becomes a map' },
    { hash: /#go-deeper-3$/, title: 'The quake with no crater' },
    { hash: /#go-deeper-4$/, title: 'Where the shaking comes from' },
    { hash: /#go-deeper-5$/, title: 'The core that shrank twice' },
    { hash: /#go-deeper-6$/, title: 'Why Earth should care' },
  ];

  for (const step of deeperTitles) {
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await expect(page).toHaveURL(step.hash);
    await expect(page.getByRole('heading', { name: step.title })).toBeVisible();
  }

  await expect(page.getByRole('heading', { name: 'Three questions nobody can answer yet' })).toBeVisible();
  await page.getByRole('button', { name: 'Go technical' }).click();
  await expect(page).toHaveURL(/#go-technical$/);
  await expect(page.getByText('ENGINEERING THE MISSION', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Inside the Machine That Listened to Mars' })).toBeVisible();

  const technicalTitles = [
    { hash: /#go-technical-2$/, title: "1. The solar panels: the machine's lifeline" },
    { hash: /#go-technical-3$/, title: '2. The lander body: built to stay put' },
    { hash: /#go-technical-4$/, title: '3. The robotic arm: the hands of the mission' },
    { hash: /#go-technical-5$/, title: '4. SEIS: the ears that listened to Mars' },
    { hash: /#go-technical-6$/, title: '5. HP³: the explorer that tried to dig deeper' },
    { hash: /#go-technical-7$/, title: '6. RISE: measuring the invisible' },
    { hash: /#go-technical-8$/, title: '7. TWINS and the weather station: the noise detectives' },
    { hash: /#go-technical-9$/, title: '8. The cameras: the eyes that connected Mars to Earth' },
    { hash: /#go-technical-10$/, title: '9. The long-distance link: from a dome on Mars to a file on your laptop' },
  ];

  for (const step of technicalTitles) {
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await expect(page).toHaveURL(step.hash);
    await expect(page.getByRole('heading', { name: step.title })).toBeVisible();
  }

  await expect(page.getByRole('heading', { name: 'The machine was more than its parts' })).toBeVisible();
  await expect(page.getByText('The mission ended. The lessons remain.', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Back to Case Board' }).click();
  await expect(page).toHaveURL(/#case-board$/);
  await expect(page.getByRole('button', { name: 'Go deeper' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Go technical' })).toBeVisible();

  await page.goto('/#engineering-the-mission-2');
  await expect(page.getByRole('heading', { name: "1. The solar panels: the machine's lifeline" })).toBeVisible();
  await page.getByRole('button', { name: 'Back to ENGINEERING THE MISSION page 1' }).click();
  await expect(page).toHaveURL(/#go-technical$/);
  await page.getByRole('button', { name: 'Back to Case Board' }).click();
  await expect(page).toHaveURL(/#case-board$/);
});
