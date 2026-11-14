import test from 'node:test';
import assert from 'node:assert/strict';
import {
  INSIGHT_RECORDS,
  LEVELS,
  MODULES_LIST,
  RESOURCE_TYPES,
  WORLD_RADIUS,
} from '../../src/features/survival/gameData.js';
import {
  applyEmergencyAction,
  applySimulationTick,
  buildModule,
  collectNearbyResource,
  completeFinalMission,
  computeStationCapabilities,
  consultInsight,
  createInitialState,
  getRoverProximity,
  repairStation,
  startChallenge,
  stepRoverPhysics,
  upgradeModule,
} from '../../src/features/survival/gameLogic.js';

test('survival data defines 20 playable levels, 10 modules, 4 resources, and 3 InSight records', () => {
  assert.equal(LEVELS.length, 20);
  assert.equal(MODULES_LIST.length, 10);
  assert.equal(RESOURCE_TYPES.length, 4);
  assert.equal(INSIGHT_RECORDS.length, 3);
  assert.equal(LEVELS[0].title, 'Level 1: First Contact');
  assert.equal(LEVELS[19].title, 'Level 20: The Final Mission');
});

test('rover physics accelerates, turns, decelerates, and clamps within Mars world boundary', () => {
  let state = createInitialState();
  state.screen = 'playing';

  for (let i = 0; i < 60; i += 1) {
    state = stepRoverPhysics(state, { forward: true, left: true, backward: false, right: false }, 0.05);
  }
  assert.ok(Math.abs(state.rover.speed) > 1);
  assert.ok(Math.hypot(state.rover.x, state.rover.z) <= WORLD_RADIUS);

  // Releasing controls decelerates rover back to zero
  for (let i = 0; i < 60; i += 1) {
    state = stepRoverPhysics(state, { forward: false, left: false, backward: false, right: false }, 0.05);
  }
  assert.equal(state.rover.speed, 0);
});

test('resource collection updates inventory, score, spawns replacements, and completes Level 1', () => {
  let state = createInitialState();
  state.screen = 'playing';
  const startMetal = state.inventory.metal;

  // Move rover beside the first 3 nodes to collect them
  for (let i = 0; i < 3; i += 1) {
    const node = state.nodes[0];
    state.rover.x = node.x;
    state.rover.z = node.z;
    const prox = getRoverProximity(state);
    assert.ok(prox.nearestNode);
    state = collectNearbyResource(state);
  }

  assert.equal(state.resourcesCollectedCount, 3);
  assert.ok(state.inventory.metal >= startMetal);
  assert.equal(state.level, 2);
  assert.ok(state.score >= 225);
});

test('modular building enforces unlock/resource rules and upgrades improve defense', () => {
  let state = createInitialState();
  state.screen = 'playing';
  state.level = 2;
  state.inventory = { metal: 1, energy: 0, insulation: 0, components: 0 };

  const failLowRes = buildModule(state, 'foundation');
  assert.equal(failLowRes.ok, false);

  const failLocked = buildModule({ ...state, inventory: { metal: 20, energy: 20, insulation: 20, components: 20 } }, 'lab');
  assert.equal(failLocked.ok, false);

  state.inventory = { metal: 20, energy: 20, insulation: 20, components: 20 };
  const okFoundation = buildModule(state, 'foundation');
  assert.equal(okFoundation.ok, true);
  assert.equal(okFoundation.state.level, 3);

  const beforeCaps = computeStationCapabilities(okFoundation.state.modules);
  const upgraded = upgradeModule(okFoundation.state, 'foundation');
  assert.equal(upgraded.ok, true);
  assert.equal(upgraded.state.modules.foundation.level, 2);
  const afterCaps = computeStationCapabilities(upgraded.state.modules);
  assert.ok(afterCaps.seismicDefense > beforeCaps.seismicDefense);
});

test('environmental challenges affect station condition and engineering responses mitigate impact', () => {
  let state = createInitialState();
  state.screen = 'playing';
  state.level = 8;
  state = startChallenge(state, 'marsquake');
  assert.equal(state.eventState.active.phase, 'warning');

  // Advance past warning phase into active shaking
  for (let i = 0; i < 7; i += 1) {
    state = applySimulationTick(state, 1);
  }
  assert.equal(state.eventState.active.phase, 'active');
  assert.ok(state.missionStats.stability < 90);

  const afterAction = applyEmergencyAction(state, 'dampen_seismic');
  assert.equal(afterAction.eventState.active.mitigated, true);
  assert.ok(afterAction.missionStats.stability > state.missionStats.stability);

  const afterRepair = repairStation(afterAction);
  assert.ok(afterRepair.missionStats.stationHealth >= afterAction.missionStats.stationHealth);
});

test('consulting InSight data advances science objectives and Level 20 certifies full protocol', () => {
  let state = createInitialState();
  state.screen = 'playing';
  state.level = 5;
  state = consultInsight(state, 'seis');
  assert.equal(state.level, 6);
  assert.ok(state.eventState.active?.type === 'marsquake');

  // Jump to Level 20 certification test with 3 upgraded modules
  state.level = 20;
  state.modules = {
    foundation: { slotIndex: 0, level: 2, integrity: 100, buildProgress: 1 },
    support: { slotIndex: 1, level: 2, integrity: 100, buildProgress: 1 },
    solar: { slotIndex: 3, level: 2, integrity: 100, buildProgress: 1 },
  };
  state.missionStats.stationHealth = 92;
  const certified = completeFinalMission(state);
  assert.equal(certified.screen, 'victory');
  assert.ok(['S', 'A', 'B'].includes(certified.finalReport.grade));
});
