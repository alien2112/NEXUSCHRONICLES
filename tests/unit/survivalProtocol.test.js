import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CHALLENGES,
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
  getChallengeWarningDuration,
  getRecommendedGuidance,
  getRoverProximity,
  getUpcomingEarlyWarning,
  hasEarlyWarningEdge,
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

test('consulting InSight data advances science objectives without triggering hazards and Level 20 certifies full protocol', () => {
  let state = createInitialState();
  state.screen = 'playing';
  state.level = 5;
  assert.equal(hasEarlyWarningEdge(state, 'marsquake'), false);

  state = consultInsight(state, 'seis');
  assert.equal(state.level, 6);
  // Analyzing InSight must NOT trigger the marsquake directly; it unlocks early-warning edge instead
  assert.equal(state.eventState.active, null);
  assert.equal(hasEarlyWarningEdge(state, 'marsquake'), true);
  assert.ok(getChallengeWarningDuration(state, 'marsquake') > CHALLENGES.marsquake.durationWarning);

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

test('catastrophes trigger autonomously with per-hazard delays and gaps, and InSight gives early warning edge', () => {
  // Deterministic rng = 0 hits minimum initial delays and minimum gaps
  let state = createInitialState(null, () => 0);
  state.screen = 'playing';

  // Different hazards have different initial delays and gaps
  assert.equal(state.eventState.nextScheduledAt.marsquake, 60);
  assert.ok(state.eventState.nextScheduledAt.dust_storm > state.eventState.nextScheduledAt.marsquake);
  assert.ok(state.eventState.nextScheduledAt.extreme_cold > state.eventState.nextScheduledAt.dust_storm);
  assert.notEqual(CHALLENGES.marsquake.schedule.minGap, CHALLENGES.dust_storm.schedule.minGap);
  assert.notEqual(CHALLENGES.dust_storm.schedule.minGap, CHALLENGES.extreme_cold.schedule.minGap);

  // Without InSight analysis, no advance early forecast is shown at 45s
  for (let i = 0; i < 45; i += 1) {
    state = applySimulationTick(state, 1, () => 0);
  }
  assert.equal(state.eventState.active, null);
  assert.equal(getUpcomingEarlyWarning(state), null);

  // Advance to 59s — still no earthquake before 1 minute
  for (let i = 0; i < 14; i += 1) {
    state = applySimulationTick(state, 1, () => 0);
  }
  assert.equal(state.eventState.active, null);

  // At 60s (1 min), marsquake triggers autonomously even without analyzing InSight
  state = applySimulationTick(state, 1, () => 0);
  assert.equal(state.eventState.active?.type, 'marsquake');
  assert.equal(state.eventState.active?.phase, 'warning');
  assert.equal(state.eventState.active?.earlyWarningEdge, false);
  assert.equal(state.eventState.active?.timer, CHALLENGES.marsquake.durationWarning);

  // Mitigate and finish this marsquake
  state = applyEmergencyAction(state, 'dampen_seismic');
  for (let i = 0; i < 20; i += 1) {
    if (!state.eventState.active) break;
    state = applySimulationTick(state, 1, () => 0);
  }
  assert.equal(state.eventState.active, null);

  // Next marsquake must respect at least 3 min (180s) gap after completion
  const completedAt = state.eventState.lastCompletedAt.marsquake;
  assert.ok(typeof completedAt === 'number');
  assert.ok(state.eventState.nextScheduledAt.marsquake >= completedAt + 180);

  // Now analyze SEIS and verify early-warning forecast & longer prep window on the next marsquake
  state = consultInsight(state, 'seis');
  state.eventState.nextScheduledAt.marsquake = state.elapsedPlayTime + 15;
  state.eventState.nextScheduledAt.dust_storm = state.elapsedPlayTime + 500;
  state.eventState.nextScheduledAt.extreme_cold = state.elapsedPlayTime + 500;

  const forecast = getUpcomingEarlyWarning(state);
  assert.ok(forecast);
  assert.equal(forecast.type, 'marsquake');
  assert.ok(forecast.secondsUntil <= 15);

  for (let i = 0; i < 15; i += 1) {
    state = applySimulationTick(state, 1, () => 0);
  }
  assert.equal(state.eventState.active?.type, 'marsquake');
  assert.equal(state.eventState.active?.earlyWarningEdge, true);
  assert.equal(
    state.eventState.active?.timer,
    CHALLENGES.marsquake.durationWarning + CHALLENGES.marsquake.earlyWarningBonus
  );
});

test('ignoring severe hazard causes real defeat while taking recommended action saves outpost', () => {
  let ignored = createInitialState();
  ignored.screen = 'playing';
  ignored.level = 8;
  ignored = startChallenge(ignored, 'marsquake');

  const g = getRecommendedGuidance(ignored);
  assert.equal(g.focus, 'hazard');
  assert.ok(g.actionId);

  // Simulate full warning (5s) + active quake (10s) with zero countermeasures
  for (let i = 0; i < 16; i += 1) {
    ignored = applySimulationTick(ignored, 1);
  }
  assert.equal(ignored.screen, 'gameover');

  // Now replay and take recommended action during warning phase
  let responded = createInitialState();
  responded.screen = 'playing';
  responded.level = 8;
  responded = startChallenge(responded, 'marsquake');
  responded = applyEmergencyAction(responded, getRecommendedGuidance(responded).actionId);
  for (let i = 0; i < 16; i += 1) {
    responded = applySimulationTick(responded, 1);
  }
  assert.equal(responded.screen, 'playing');
  assert.ok(responded.missionStats.stationHealth > 50);
});
