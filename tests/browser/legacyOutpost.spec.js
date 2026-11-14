import { test, expect } from '@playwright/test';
import { computeIsoMetrics } from '../../src/features/legacy/simulation.js';

test.beforeEach(async ({ page }) => {
  await page.route('https://fonts.googleapis.com/**', (route) =>
    route.fulfill({ contentType: 'text/css', body: '' })
  );
});

async function clickGridTile(page, col, row) {
  const canvas = page.locator('canvas[aria-label="Isometric Mars Legacy Outpost research zone"]');
  const box = await canvas.boundingBox();
  const m = computeIsoMetrics(box.width, box.height);
  const cx = m.originX + (col - row) * (m.tileW / 2);
  const cy = m.originY + (col + row + 1) * (m.tileH / 2);
  await page.mouse.click(box.x + cx, box.y + cy);
}

test('Case Board links into Engineering Legacy and full 5-phase Mars Legacy Outpost completes cleanly', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (err) => errors.push(err.message));

  await page.goto('/#case-board');
  await expect(page.getByRole('button', { name: 'Engineering Legacy' })).toBeVisible();
  await page.getByRole('button', { name: 'Engineering Legacy' }).click();
  await expect(page).toHaveURL(/#engineering-legacy$/);

  await expect(page.getByRole('heading', { name: 'NEXUS — Mars Legacy Outpost' })).toBeVisible();
  await expect(page.getByText('FICTIONAL FUTURE CONCEPT', { exact: true })).toBeVisible();

  // Phase 1 Intro -> Arrival
  await page.getByRole('button', { name: 'Skip Intro' }).click();
  await expect(page.getByText('Explore the abandoned InSight lander.')).toBeVisible();
  await expect(page.getByLabel('Mission level progression')).toBeVisible();
  await page.getByRole('button', { name: /Scan Terrain \(0\/3\)/ }).click();
  await expect(page.getByRole('status')).toContainText('Orbital scan complete');

  // Inspect InSight (via button or clicking InSight tile)
  await page.getByRole('button', { name: 'Inspect InSight' }).click();
  const insightDialog = page.getByRole('dialog', { name: 'InSight Legacy Analysis' });
  await expect(insightDialog).toBeVisible();
  await expect(insightDialog.getByText('~5,000 Wh/sol', { exact: true })).toBeVisible();
  await expect(insightDialog.getByText('~500 Wh/sol', { exact: true })).toBeVisible();

  // Run one diagnostic lesson
  await insightDialog.getByRole('button', { name: 'Analyze Legacy Lessons' }).click();
  await insightDialog.getByRole('button', { name: 'Run Diagnostic' }).first().click();
  await expect(insightDialog.getByText('Power Margin Planning Applied', { exact: true })).toBeVisible();

  // Proceed to Phase 2 Build
  await insightDialog.getByRole('button', { name: 'Build Outpost' }).click();
  await expect(page.getByText('PHASE 2 · BUILD OUTPOST (0/3)')).toBeVisible();

  // Test invalid placement on InSight historical zone (2, 3)
  await clickGridTile(page, 2, 3);
  await expect(page.getByRole('status')).toContainText('InSight');

  // Place Habitat on basin (5, 6), Solar on ridge (6, 3), Science on bedrock (8, 6)
  await clickGridTile(page, 5, 6);
  await expect(page.getByText('PHASE 2 · BUILD OUTPOST (1/3)')).toBeVisible();

  await clickGridTile(page, 6, 3);
  await expect(page.getByText('PHASE 2 · BUILD OUTPOST (2/3)')).toBeVisible();

  await clickGridTile(page, 8, 6);
  await expect(page.getByText('PHASE 2 · OUTPOST COMPLETE')).toBeVisible();
  await expect(page.getByLabel('Outpost status indicators')).toBeVisible();

  // Phase 3: Engineering Decision (click Solar Unit directly on the isometric canvas)
  await page.getByRole('button', { name: 'Start Operations' }).click();
  await clickGridTile(page, 6, 3);
  const phase3Dialog = page.getByRole('dialog', { name: 'Dust Accumulation on Solar Unit' });
  await expect(phase3Dialog).toBeVisible({ timeout: 8000 });
  await phase3Dialog.getByRole('button', { name: /A\. Activate cleaning mechanism/ }).click();
  await phase3Dialog.getByRole('button', { name: 'Continue Mission' }).click();

  // Phase 4 Event 1: Dust Storm
  await expect(page.getByText('EVENT 1 OF 3 · DUST STORM')).toBeVisible();
  await page.getByRole('button', { name: 'Open Solar Unit' }).click();
  await page.getByRole('button', { name: /B\. Switch to low-power standby/ }).click();
  await page.getByRole('button', { name: 'Continue Mission' }).click();

  // Phase 4 Event 2: Extreme Temperature
  await expect(page.getByText('EVENT 2 OF 3 · EXTREME TEMPERATURE')).toBeVisible();
  await page.getByRole('button', { name: 'Open Habitat' }).click();
  await page.getByRole('button', { name: /B\. Deploy thermal insulation baffles/ }).click();
  await page.getByRole('button', { name: 'Continue Mission' }).click();

  // Phase 4 Event 3: Marsquake
  await expect(page.getByText('EVENT 3 OF 3 · MARSQUAKE')).toBeVisible();
  await page.getByRole('button', { name: 'Open Science Lab' }).click();
  await page.getByRole('button', { name: /A\. Secure sensitive instruments/ }).click();
  await page.getByRole('button', { name: 'Continue Mission' }).click();

  // Phase 5: Mission Analysis Complete & Earth Transfer
  const summaryDialog = page.getByRole('dialog', { name: 'Mission Analysis Complete' });
  await expect(summaryDialog).toBeVisible();
  await expect(summaryDialog.getByText('MISSION ANALYSIS COMPLETE')).toBeVisible();
  await summaryDialog.getByRole('button', { name: 'See Earth Engineering Legacy' }).click();
  await expect(summaryDialog.getByText('The challenges of Mars can inspire engineering solutions on Earth.')).toBeVisible();
  await expect(summaryDialog.getByText('The mission ended. The knowledge remains.')).toBeVisible();

  // Retry Mission resets back to Phase 1 Arrival
  await summaryDialog.getByRole('button', { name: 'RETRY MISSION' }).click();
  await expect(summaryDialog).toHaveCount(0);
  await expect(page.getByText('PHASE 1 · ARRIVAL ON MARS')).toBeVisible();

  // Return to NEXUS brings us back to Case Board
  await page.getByRole('button', { name: 'Return to NEXUS' }).click();
  await expect(page).toHaveURL(/#case-board$/);
  expect(errors).toEqual([]);
});
