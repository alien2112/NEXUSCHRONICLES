import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { collectMedia, criticalImages } from '../../scripts/performance-assets.js';
import { disposeScene } from '../../src/features/survival/disposeScene.js';

test('media URLs deduplicate equal bytes and change when content changes', () => {
  const directory = mkdtempSync(join(tmpdir(), 'nexus-media-test-'));
  try {
    writeFileSync(join(directory, 'a.webp'), 'original');
    writeFileSync(join(directory, 'b.webp'), 'original');
    const before = collectMedia(directory);
    assert.equal(before.get('/a.webp').fileName, before.get('/b.webp').fileName);
    writeFileSync(join(directory, 'a.webp'), 'changed');
    assert.notEqual(collectMedia(directory).get('/a.webp').fileName, before.get('/a.webp').fileName);
    assert.equal(before.get('/b.webp').source.toString(), 'original');
  } finally { rmSync(directory, { recursive: true, force: true }); }
});

test('critical image hints select the requested route, never a global Home download', () => {
  const content = JSON.parse(readFileSync(new URL('../../src/data/siteContent.json', import.meta.url)));
  assert.deepEqual(criticalImages(content, 'mars-missions'), [content.marsMissionsPage.horizonImage, content.marsMissionsPage.backgroundImage]);
  assert.deepEqual(criticalImages(content, 'insight-story-2'), ['/stories2,4,6 .webp']);
  assert.deepEqual(criticalImages(content, 'insight-story-3'), ['/stories3,5.webp']);
  assert.deepEqual(criticalImages(content, 'investigation'), [content.investigation.backgroundImage]);
  assert.deepEqual(criticalImages(content, 'survival-protocol'), []);
});

test('scene cleanup releases shared GPU allocations once', () => {
  const calls = [];
  const texture = { isTexture: true, dispose: () => calls.push('texture') };
  const material = { map: texture, dispose: () => calls.push('material') };
  const geometry = { dispose: () => calls.push('geometry') };
  disposeScene({ traverse: fn => {
    fn({ geometry, material });
    fn({ geometry, material: [material], shadow: { dispose: () => calls.push('shadow') } });
  } });
  assert.deepEqual(calls.sort(), ['geometry', 'material', 'shadow', 'texture']);
});
