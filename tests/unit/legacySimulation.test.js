import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ENGINEERING_SCENARIOS,
  INITIAL_ASTRONAUT,
  INSIGHT_SITE,
  MISSION_LEVELS,
  ROCK_TILES,
  SURVEY_NODES,
  applyDecisionOutcome,
  buildMissionAnalysis,
  computeInitialOutpostStats,
  findGridPath,
  getMissionTelemetry,
  getTerrainType,
  validatePlacement,
} from '../../src/features/legacy/simulation.js';

test('terrain zones protect InSight and rocks while classifying outpost sites', () => {
  assert.equal(getTerrainType(INSIGHT_SITE.lander.col, INSIGHT_SITE.lander.row), 'insight_zone');
  assert.equal(getTerrainType(ROCK_TILES[0].col, ROCK_TILES[0].row), 'rock');
  assert.equal(getTerrainType(6, 3), 'ridge');
  assert.equal(getTerrainType(5, 6), 'basin');
  assert.equal(getTerrainType(7, 6), 'bedrock');
  assert.equal(getTerrainType(4, 1), 'plain');
});

test('placement validation rejects rocks, InSight zone, and occupied tiles with clear reasons', () => {
  const onRock = validatePlacement('habitat', ROCK_TILES[0].col, ROCK_TILES[0].row, {});
  assert.equal(onRock.valid, false);
  assert.match(onRock.reason, /Rocky terrain/i);

  const onInsight = validatePlacement('solar', 2, 3, {});
  assert.equal(onInsight.valid, false);
  assert.match(onInsight.reason, /InSight/i);

  const onOccupied = validatePlacement('science', 5, 6, { habitat: { col: 5, row: 6 } });
  assert.equal(onOccupied.valid, false);
  assert.match(onOccupied.reason, /Research Habitat/i);
});

test('module placement and InSight diagnostics deterministically alter initial outpost stats', () => {
  const optimalBuildings = {
    habitat: { col: 5, row: 6 }, // basin (+10 safety)
    solar: { col: 6, row: 3 }, // ridge (+10 energy)
    science: { col: 8, row: 6 }, // bedrock + isolated (+14 science)
  };
  const suboptimalBuildings = {
    habitat: { col: 6, row: 3 }, // ridge (-4 safety)
    solar: { col: 5, row: 6 }, // basin (-4 energy)
    science: { col: 6, row: 4 }, // plain + adjacent to habitat (-2 net)
  };

  const optimal = computeInitialOutpostStats(optimalBuildings, []);
  const suboptimal = computeInitialOutpostStats(suboptimalBuildings, []);
  assert.ok(optimal.energy > suboptimal.energy);
  assert.ok(optimal.safety > suboptimal.safety);
  assert.ok(optimal.science > suboptimal.science);

  const withLessons = computeInitialOutpostStats(optimalBuildings, ['power_margin', 'soil_cohesion', 'instrument_isolation']);
  assert.equal(withLessons.energy, optimal.energy + 6);
  assert.equal(withLessons.safety, optimal.safety + 6);
  assert.equal(withLessons.science, optimal.science + 6);
});

test('pathfinder routes around obstacles and reaches adjacent to buildings', () => {
  const buildings = { habitat: { col: 5, row: 3 } };
  const path = findGridPath(INITIAL_ASTRONAUT, { col: 5, row: 3 }, buildings);
  assert.equal(path.length, 0); // already adjacent (4,3) -> (5,3)

  const farPath = findGridPath(INITIAL_ASTRONAUT, { col: 7, row: 3 }, buildings);
  assert.ok(farPath.length > 0);
  const last = farPath[farPath.length - 1];
  assert.deepEqual(last, { col: 7, row: 3 });
  assert.equal(farPath.some((step) => step.col === 5 && step.row === 3), false);
});

test('engineering decisions produce distinct trade-offs and mission summary reflects choices', () => {
  const base = { energy: 70, safety: 70, science: 70 };
  const cleanRes = applyDecisionOutcome(base, 'engineering', 'clean', []);
  const conserveRes = applyDecisionOutcome(base, 'engineering', 'conserve', []);

  assert.ok(cleanRes.nextStats.energy > conserveRes.nextStats.energy);
  assert.ok(conserveRes.nextStats.science < cleanRes.nextStats.science);

  const stormWithLesson = applyDecisionOutcome(base, 'event_1', 'storm_standby', ['power_margin']);
  assert.equal(stormWithLesson.lessonApplied, true);
  assert.equal(
    stormWithLesson.nextStats.energy,
    base.energy + ENGINEERING_SCENARIOS.event_1.options[1].delta.energy + 3
  );

  const analysis = buildMissionAnalysis(
    { energy: 74, safety: 78, science: 72 },
    { habitat: { col: 5, row: 6 }, solar: { col: 6, row: 3 }, science: { col: 8, row: 6 } },
    [{ scenarioId: 'engineering', eventTitle: 'Dust Accumulation on Solar Unit', choiceLabel: 'A. Activate cleaning mechanism' }],
    ['power_margin', 'soil_cohesion']
  );
  assert.ok(analysis.workedWell.length >= 4);
});

test('mission levels, environmental telemetry, and walkable survey nodes are consistent', () => {
  assert.equal(MISSION_LEVELS.length, 6);
  const storm = getMissionTelemetry('event_1');
  const freeze = getMissionTelemetry('event_2');
  const quake = getMissionTelemetry('event_3');
  assert.equal(storm.sol, 12);
  assert.match(storm.triggerInfo, /irradiance|opacity/i);
  assert.equal(freeze.temp, '-118°C');
  assert.equal(quake.seismic, '3.6 M');

  for (const node of SURVEY_NODES) {
    assert.equal(getTerrainType(node.col, node.row), 'plain');
  }
});
