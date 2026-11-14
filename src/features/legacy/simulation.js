/**
 * Deterministic simulation model for NEXUS — Mars Legacy Outpost.
 * Keeps all rules, terrain traits, InSight legacy diagnostics, and engineering
 * trade-offs separate from rendering so it is easy to test and maintain.
 */

import siteContent from '../../data/siteContent.json' with { type: 'json' };

const legacySimContent = siteContent.engineeringLegacy.simulation;
const placementMessages = legacySimContent.placementMessages;
const analysisMessages = legacySimContent.analysisMessages;

export const GRID_SIZE = 10;

export function computeIsoMetrics(width, height) {
  const tileW = Math.min((width * 0.94) / GRID_SIZE, (height * 0.68) / (GRID_SIZE * 0.5));
  const tileH = tileW * 0.5;
  return {
    width,
    height,
    tileW,
    tileH,
    originX: width * 0.5,
    originY: height * 0.28,
  };
}

export const INITIAL_ASTRONAUT = { col: 4, row: 3 };
export const INSIGHT_SITE = {
  lander: { col: 2, row: 3 },
  seis: { col: 3, row: 3 },
  hp3: { col: 2, row: 4 },
};

export const ROCK_TILES = [
  { col: 0, row: 0 },
  { col: 1, row: 0 },
  { col: 0, row: 1 },
  { col: 5, row: 1 },
  { col: 8, row: 0 },
  { col: 9, row: 2 },
  { col: 1, row: 8 },
  { col: 4, row: 8 },
  { col: 8, row: 8 },
  { col: 9, row: 7 },
];

export const MODULE_DEFINITIONS = legacySimContent.moduleDefinitions;
export const MODULE_ORDER = legacySimContent.moduleOrder;
export const TERRAIN_META = legacySimContent.terrainMeta;
export const INSIGHT_HISTORICAL_FACTS = legacySimContent.insightHistoricalFacts;
export const INSIGHT_DIAGNOSTICS = legacySimContent.insightDiagnostics;
export const ENGINEERING_SCENARIOS = legacySimContent.engineeringScenarios;
export const EARTH_TRANSFER_CONNECTIONS = legacySimContent.earthTransferConnections;

export const SURVEY_NODES = [
  {
    id: 'olivine',
    col: 1,
    row: 6,
    title: 'Olivine Basalt Outcrop',
    finding: '+4% Science · Volcanic basalt core reveals Elysium crust mineralogy.',
    scienceBonus: 4,
  },
  {
    id: 'ripple',
    col: 7,
    row: 1,
    title: 'Aeolian Dust Ripple',
    finding: '+4% Science · Wind-sorted regolith records prevailing dust storm direction.',
    scienceBonus: 4,
  },
  {
    id: 'fracture',
    col: 3,
    row: 8,
    title: 'Crustal Fracture Bench',
    finding: '+4% Science · Shallow bedrock fracture improves marsquake ground coupling data.',
    scienceBonus: 4,
  },
];

export const MISSION_LEVELS = [
  { id: 'arrival', level: 1, shortLabel: 'L1 · INSIGHT', sol: 1 },
  { id: 'build', level: 2, shortLabel: 'L2 · BUILD', sol: 3 },
  { id: 'engineering', level: 3, shortLabel: 'L3 · DUST', sol: 6 },
  { id: 'event_1', level: 4, shortLabel: 'L4 · STORM', sol: 12 },
  { id: 'event_2', level: 5, shortLabel: 'L5 · FREEZE', sol: 19 },
  { id: 'event_3', level: 6, shortLabel: 'L6 · QUAKE', sol: 26 },
];

export function getMissionTelemetry(phase) {
  switch (phase) {
    case 'intro':
    case 'arrival':
      return {
        level: 1,
        sol: 1,
        condition: 'CLEAR EQUATORIAL DAY',
        temp: '-63°C',
        solarFlux: '590 W/m²',
        wind: '14 m/s',
        seismic: '0.2 M',
        hazardState: 'nominal',
        triggerInfo: 'Mission Start · Inspect retired InSight lander before site deployment.',
        nextForecast: 'SOL 03 · Outpost Construction Window',
      };
    case 'build':
    case 'build_ready':
      return {
        level: 2,
        sol: 3,
        condition: 'SITE DEPLOYMENT',
        temp: '-61°C',
        solarFlux: '585 W/m²',
        wind: '16 m/s',
        seismic: '0.2 M',
        hazardState: 'nominal',
        triggerInfo: 'Build Window · Deploy modules across sheltered crater, ridge, & bedrock.',
        nextForecast: 'SOL 06 · Trigger: Dust buildup > 28% on solar panels',
      };
    case 'engineering':
      return {
        level: 3,
        sol: 6,
        condition: 'ELECTROSTATIC DUST SETTLING',
        temp: '-64°C',
        solarFlux: '415 W/m²',
        wind: '22 m/s',
        seismic: '0.3 M',
        hazardState: 'amber',
        triggerInfo: 'Event Trigger: 6 sols of fine dust reduced array transmittance by 30%.',
        nextForecast: 'SOL 12 · Incoming Regional Dust Front (τ > 2.4)',
      };
    case 'event_1':
      return {
        level: 4,
        sol: 12,
        condition: 'DUST STORM (τ 2.8)',
        temp: '-68°C',
        solarFlux: '145 W/m²',
        wind: '48 m/s',
        seismic: '0.4 M',
        hazardState: 'amber',
        triggerInfo: 'Event Trigger: Regional dust squall dropped surface irradiance below 150 W/m².',
        nextForecast: 'SOL 19 · Polar Cold Front Alert (-118°C nightfall)',
      };
    case 'event_2':
      return {
        level: 5,
        sol: 19,
        condition: 'EXTREME COLD SNAP',
        temp: '-118°C',
        solarFlux: '470 W/m²',
        wind: '19 m/s',
        seismic: '0.3 M',
        hazardState: 'cyan',
        triggerInfo: 'Event Trigger: Radiative night freeze dropped habitat exterior to -118°C.',
        nextForecast: 'SOL 26 · Crustal Strain Warning near Cerberus Fault',
      };
    case 'event_3':
      return {
        level: 6,
        sol: 26,
        condition: 'MARSQUAKE TREMORS',
        temp: '-65°C',
        solarFlux: '550 W/m²',
        wind: '15 m/s',
        seismic: '3.6 M',
        hazardState: 'danger',
        triggerInfo: 'Event Trigger: Hypothetical 3.6 M seismic slip event recorded beneath Elysium.',
        nextForecast: 'SOL 28 · Final Mission Debrief & Earth Transfer',
      };
    case 'summary':
    default:
      return {
        level: 6,
        sol: 28,
        condition: 'OPERATIONS STABILIZED',
        temp: '-62°C',
        solarFlux: '580 W/m²',
        wind: '13 m/s',
        seismic: '0.2 M',
        hazardState: 'nominal',
        triggerInfo: 'All 4 stress scenarios resolved · Outpost telemetry archived for Earth transfer.',
        nextForecast: 'MISSION COMPLETE · Ready for Earth Legacy Review',
      };
  }
}

export function isSameTile(a, b) {
  return Boolean(a && b && a.col === b.col && a.row === b.row);
}

export function tileDistance(a, b) {
  return Math.abs(a.col - b.col) + Math.abs(a.row - b.row);
}

export function getTerrainType(col, row) {
  if (col < 0 || row < 0 || col >= GRID_SIZE || row >= GRID_SIZE) return 'rock';
  if (ROCK_TILES.some((rock) => rock.col === col && rock.row === row)) return 'rock';
  if (col >= 1 && col <= 3 && row >= 2 && row <= 4) return 'insight_zone';
  if (col >= 5 && col <= 8 && row >= 2 && row <= 4) return 'ridge';
  if (col >= 4 && col <= 6 && row >= 5 && row <= 7) return 'basin';
  if (col >= 7 && col <= 8 && row >= 5 && row <= 7) return 'bedrock';
  return 'plain';
}

export function canWalkTile(col, row, buildings = {}) {
  if (col < 0 || row < 0 || col >= GRID_SIZE || row >= GRID_SIZE) return false;
  const terrain = getTerrainType(col, row);
  if (!TERRAIN_META[terrain].walkable) return false;
  if (isSameTile({ col, row }, INSIGHT_SITE.lander)) return false;
  for (const mod of Object.values(buildings)) {
    if (mod && mod.col === col && mod.row === row) return false;
  }
  return true;
}

export function validatePlacement(moduleId, col, row, buildings = {}) {
  if (col < 0 || row < 0 || col >= GRID_SIZE || row >= GRID_SIZE) {
    return { valid: false, reason: placementMessages.outsidePerimeter };
  }
  const terrain = getTerrainType(col, row);
  const meta = TERRAIN_META[terrain];
  if (!meta.buildable) {
    return { valid: false, reason: meta.note };
  }
  for (const [existingId, pos] of Object.entries(buildings)) {
    if (pos && pos.col === col && pos.row === row) {
      return {
        valid: false,
        reason: `${placementMessages.occupiedPrefix}${MODULE_DEFINITIONS[existingId]?.name ?? placementMessages.occupiedFallback}.`,
      };
    }
  }

  const traitBonus = getPlacementFeedback(moduleId, col, row, buildings);
  return { valid: true, terrain, ...traitBonus };
}

export function getPlacementFeedback(moduleId, col, row, buildings = {}) {
  const terrain = getTerrainType(col, row);
  const notes = [];
  let energyMod = 0;
  let safetyMod = 0;
  let scienceMod = 0;

  if (moduleId === 'solar') {
    if (terrain === 'ridge') {
      energyMod += 10;
      notes.push(placementMessages.solarRidge);
    } else if (terrain === 'basin') {
      energyMod -= 4;
      notes.push(placementMessages.solarBasin);
    } else {
      energyMod += 4;
      notes.push(placementMessages.solarPlain);
    }
  } else if (moduleId === 'habitat') {
    if (terrain === 'basin') {
      safetyMod += 10;
      notes.push(placementMessages.habitatBasin);
    } else if (terrain === 'ridge') {
      safetyMod -= 4;
      notes.push(placementMessages.habitatRidge);
    } else {
      safetyMod += 4;
      notes.push(placementMessages.habitatPlain);
    }
  } else if (moduleId === 'science') {
    if (terrain === 'bedrock') {
      scienceMod += 10;
      notes.push(placementMessages.scienceBedrock);
    } else {
      scienceMod += 4;
      notes.push(placementMessages.sciencePlain);
    }
    if (buildings.habitat && tileDistance({ col, row }, buildings.habitat) <= 1) {
      scienceMod -= 6;
      notes.push(placementMessages.scienceNearHabitat);
    } else if (buildings.habitat) {
      scienceMod += 4;
      notes.push(placementMessages.scienceIsolated);
    }
  }

  return {
    energyMod,
    safetyMod,
    scienceMod,
    hint: notes.join(' '),
  };
}

export function clampStat(value) {
  return Math.max(10, Math.min(100, Math.round(value)));
}

export function computeInitialOutpostStats(buildings, discoveredLessons = []) {
  let energy = 68;
  let safety = 70;
  let science = 66;

  if (buildings.solar) {
    const mod = getPlacementFeedback('solar', buildings.solar.col, buildings.solar.row, buildings);
    energy += mod.energyMod;
  }
  if (buildings.habitat) {
    const mod = getPlacementFeedback('habitat', buildings.habitat.col, buildings.habitat.row, buildings);
    safety += mod.safetyMod;
  }
  if (buildings.science) {
    const mod = getPlacementFeedback('science', buildings.science.col, buildings.science.row, buildings);
    science += mod.scienceMod;
  }

  for (const lessonId of discoveredLessons) {
    const found = INSIGHT_DIAGNOSTICS.find((item) => item.id === lessonId);
    if (found) {
      energy += found.bonus.energy;
      safety += found.bonus.safety;
      science += found.bonus.science;
    }
  }

  return {
    energy: clampStat(energy),
    safety: clampStat(safety),
    science: clampStat(science),
  };
}

export function applyDecisionOutcome(stats, scenarioId, optionId, discoveredLessons = []) {
  const scenario = ENGINEERING_SCENARIOS[scenarioId];
  const option = scenario?.options.find((opt) => opt.id === optionId);
  if (!scenario || !option) return { nextStats: stats, option: null };

  // InSight lessons gently amplify smart matching responses by +3 in relevant scenarios
  let lessonBonus = 0;
  if (scenarioId === 'event_1' && discoveredLessons.includes('power_margin')) lessonBonus = 3;
  if (scenarioId === 'event_2' && discoveredLessons.includes('soil_cohesion')) lessonBonus = 3;
  if (scenarioId === 'event_3' && discoveredLessons.includes('instrument_isolation')) lessonBonus = 3;

  const nextStats = {
    energy: clampStat(stats.energy + option.delta.energy + (scenarioId === 'event_1' ? lessonBonus : 0)),
    safety: clampStat(stats.safety + option.delta.safety + (scenarioId === 'event_2' ? lessonBonus : 0)),
    science: clampStat(stats.science + option.delta.science + (scenarioId === 'event_3' ? lessonBonus : 0)),
  };

  return {
    nextStats,
    option,
    lessonApplied: lessonBonus > 0,
  };
}

/**
 * Simple BFS pathfinder on the 10x10 grid so the astronaut routes smoothly
 * around boulders, buildings, and InSight.
 */
export function findGridPath(start, target, buildings = {}) {
  if (!start || !target) return [];
  const startKey = `${start.col},${start.row}`;
  const targetKey = `${target.col},${target.row}`;
  if (startKey === targetKey) return [];

  // If target itself is unwalkable (e.g., player clicked a building or InSight),
  // find the nearest walkable neighbor to that target.
  let destination = target;
  if (!canWalkTile(target.col, target.row, buildings)) {
    const neighbors = [
      { col: target.col + 1, row: target.row },
      { col: target.col - 1, row: target.row },
      { col: target.col, row: target.row + 1 },
      { col: target.col, row: target.row - 1 },
      { col: target.col + 1, row: target.row + 1 },
      { col: target.col - 1, row: target.row + 1 },
      { col: target.col + 1, row: target.row - 1 },
      { col: target.col - 1, row: target.row - 1 },
    ].filter((n) => canWalkTile(n.col, n.row, buildings));

    if (neighbors.length === 0) return [];
    neighbors.sort((a, b) => tileDistance(start, a) - tileDistance(start, b));
    destination = neighbors[0];
  }

  const destKey = `${destination.col},${destination.row}`;
  if (startKey === destKey) return [];

  const queue = [start];
  const cameFrom = new Map([[startKey, null]]);
  const dirs = [
    { col: 1, row: 0 },
    { col: -1, row: 0 },
    { col: 0, row: 1 },
    { col: 0, row: -1 },
  ];

  while (queue.length > 0) {
    const current = queue.shift();
    const curKey = `${current.col},${current.row}`;
    if (curKey === destKey) break;

    for (const dir of dirs) {
      const next = { col: current.col + dir.col, row: current.row + dir.row };
      const nextKey = `${next.col},${next.row}`;
      if (!cameFrom.has(nextKey) && canWalkTile(next.col, next.row, buildings)) {
        cameFrom.set(nextKey, current);
        queue.push(next);
      }
    }
  }

  if (!cameFrom.has(destKey)) return [];

  const path = [];
  let cursor = destination;
  while (cursor && !(cursor.col === start.col && cursor.row === start.row)) {
    path.unshift(cursor);
    cursor = cameFrom.get(`${cursor.col},${cursor.row}`);
  }
  return path;
}

export function buildMissionAnalysis(stats, buildings, decisions, discoveredLessons) {
  const workedWell = [];
  const couldImprove = [];

  if (buildings.solar && getTerrainType(buildings.solar.col, buildings.solar.row) === 'ridge') {
    workedWell.push(analysisMessages.workedSolarRidge);
  } else if (buildings.solar) {
    couldImprove.push(analysisMessages.improveSolarRidge);
  }

  if (buildings.habitat && getTerrainType(buildings.habitat.col, buildings.habitat.row) === 'basin') {
    workedWell.push(analysisMessages.workedHabitatBasin);
  } else if (buildings.habitat) {
    couldImprove.push(analysisMessages.improveHabitatBasin);
  }

  if (buildings.science) {
    const scienceTerrain = getTerrainType(buildings.science.col, buildings.science.row);
    const isolated = !buildings.habitat || tileDistance(buildings.science, buildings.habitat) > 1;
    if (scienceTerrain === 'bedrock' && isolated) {
      workedWell.push(analysisMessages.workedScienceBedrock);
    } else {
      couldImprove.push(analysisMessages.improveScienceBedrock);
    }
  }

  if (discoveredLessons.length >= 2) {
    workedWell.push(analysisMessages.workedLessonsTemplate.replace('{count}', String(discoveredLessons.length)));
  } else {
    couldImprove.push(analysisMessages.improveLessons);
  }

  if (stats.energy < 55) {
    couldImprove.push(analysisMessages.improveEnergy);
  } else {
    workedWell.push(analysisMessages.workedEnergy);
  }

  if (stats.safety >= 70) {
    workedWell.push(analysisMessages.workedSafety);
  } else {
    couldImprove.push(analysisMessages.improveSafety);
  }

  if (stats.science >= 70) {
    workedWell.push(analysisMessages.workedScience);
  } else {
    couldImprove.push(analysisMessages.improveScience);
  }

  return {
    stats,
    decisions,
    workedWell,
    couldImprove,
  };
}
