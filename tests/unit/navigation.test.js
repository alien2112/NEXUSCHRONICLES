import test from 'node:test';
import assert from 'node:assert/strict';
import { routes, resolveHash, canonicalHash } from '../../src/data/routes.js';
import { earnStamp } from '../../src/features/investigation/progress.js';
import { shouldIgnoreSceneShortcut } from '../../src/utils/keyboard.js';

test('every public alias resolves consistently, including uppercase and unknown hashes', () => {
  for (const route of routes) {
    for (const hash of [route.hash, ...route.aliases]) {
      assert.equal(resolveHash(hash), route.page);
      assert.equal(resolveHash(hash.toUpperCase()), route.page);
    }
    assert.equal(canonicalHash(route.page), route.hash);
  }
  assert.equal(resolveHash('#unknown'), 'home');
  assert.equal(canonicalHash('unknown'), '#home');
});

test('evidence earned out of order does not manufacture earlier stamps', () => {
  let earned = earnStamp([], 4);
  assert.deepEqual(earned, [4]);
  assert.equal(earnStamp(earned, 4), earned);
  assert.equal(earnStamp(earned, 99), earned);
  earned = earnStamp(earned, 1);
  assert.deepEqual(earned, [4, 1]);
});

test('scene shortcuts defer to interactive targets and handled events', () => {
  assert.equal(shouldIgnoreSceneShortcut({ target: { closest: () => ({}) } }), true);
  assert.equal(Boolean(shouldIgnoreSceneShortcut({ defaultPrevented: true, target: {} })), true);
  assert.equal(shouldIgnoreSceneShortcut({ target: { closest: () => null } }), false);
});
