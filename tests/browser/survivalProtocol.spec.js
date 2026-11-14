import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('https://fonts.googleapis.com/**', (route) =>
    route.fulfill({ contentType: 'text/css', body: '' })
  );
});

test('Case Board launches MARS: THE SURVIVAL PROTOCOL and core 3D game flow, build, InSight, settings, pause & save work', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (err) => errors.push(err.message));

  await page.goto('/#case-board');
  await expect(page.getByRole('button', { name: 'Play Mars: The Survival Protocol' })).toBeVisible();
  await page.getByRole('button', { name: 'Play Mars: The Survival Protocol' }).click();
  await expect(page).toHaveURL(/#survival-protocol$/);

  await expect(page.getByRole('heading', { name: 'MARS: THE SURVIVAL PROTOCOL' })).toBeVisible();
  await expect(page.getByText('“Build Beyond the Impossible.”')).toBeVisible();
  await expect(page.getByRole('button', { name: 'CONTINUE' })).toBeDisabled();

  // Open How To Play & Settings from Main Menu
  await page.getByRole('button', { name: 'HOW TO PLAY' }).click();
  await expect(page.getByRole('dialog', { name: 'How To Play' })).toBeVisible();
  await page.getByRole('button', { name: 'Understood' }).click();

  await page.getByRole('button', { name: 'SETTINGS' }).click();
  const settingsDlg = page.getByRole('dialog', { name: 'Audio Settings' });
  await expect(settingsDlg).toBeVisible();
  await settingsDlg.getByRole('button', { name: /ACTIVE|MUTED/ }).click();
  await settingsDlg.getByRole('button', { name: 'Save & Close' }).click();

  // Start Mission & verify HUD + 3D Canvas
  await page.getByRole('button', { name: 'START MISSION' }).click();
  await expect(page.locator('canvas[aria-label="Three.js 3D isometric Mars survival environment"]')).toBeVisible();
  await expect(page.getByText('LEVEL 1 / 20')).toBeVisible();
  await expect(page.getByText('Level 1: First Contact')).toBeVisible();

  // Drive rover slightly with keyboard
  await page.keyboard.down('KeyW');
  await page.waitForTimeout(250);
  await page.keyboard.up('KeyW');

  // Consult InSight Scientific Archive
  await page.getByRole('button', { name: /InSight \(0\/3\)/ }).click();
  const insightDlg = page.getByRole('dialog', { name: 'InSight Scientific Archive' });
  await expect(insightDlg).toBeVisible();
  await insightDlg.getByRole('button', { name: /Analyze Record/ }).first().click();
  await insightDlg.getByRole('button', { name: 'Return to Station' }).click();

  // Open Construction Bay (B) and verify Upgrade tab & Foundation locked at Level 1
  await page.getByRole('button', { name: 'Build (B)' }).click();
  const buildDlg = page.getByRole('dialog', { name: 'Station Construction & Upgrades' });
  await expect(buildDlg).toBeVisible();
  await expect(buildDlg.getByText('Foundation Platform')).toBeVisible();
  await buildDlg.getByRole('button', { name: 'Close construction bay' }).click();

  // Pause -> Save & Return to Main Menu -> Verify CONTINUE is now enabled
  await page.getByRole('button', { name: 'Pause mission' }).click();
  const pauseDlg = page.getByRole('dialog', { name: 'Mission Paused' });
  await expect(pauseDlg).toBeVisible();
  await pauseDlg.getByRole('button', { name: 'Save & Return to Main Menu' }).click();

  await expect(page.getByRole('button', { name: 'CONTINUE' })).toBeEnabled();
  await page.getByRole('button', { name: 'CONTINUE' }).click();
  await expect(page.getByText('LEVEL 1 / 20')).toBeVisible();

  expect(errors).toEqual([]);
});

test('game appears as an optional pass at the end of Go Deeper (#go-deeper-6) and Go Technical (#go-technical-10)', async ({ page }) => {
  await page.goto('/#go-deeper-1');
  await expect(page.getByRole('region', { name: 'Optional Game Pass' })).toHaveCount(0);

  await page.goto('/#go-deeper-6');
  const deeperOptional = page.getByRole('region', { name: 'Optional Game Pass' });
  await expect(deeperOptional).toBeVisible();
  await expect(deeperOptional.getByText(/OPTIONAL PASS/)).toBeVisible();

  await page.goto('/#go-technical-10');
  const techOptional = page.getByRole('region', { name: 'Optional Game Pass' });
  await expect(techOptional).toBeVisible();
  await techOptional.getByRole('button', { name: 'Play Mars: The Survival Protocol' }).click();
  await expect(page).toHaveURL(/#survival-protocol$/);
});
