/**
 * Centralized game state, rover kinematics, resource collection, modular construction,
 * environmental challenge simulation, scoring, save/load, and 20-level progression
 * for NEXUS — MARS: THE SURVIVAL PROTOCOL.
 */
import {
  BUILD_SLOTS,
  CHALLENGES,
  INSIGHT_INTERACT_RADIUS,
  INSIGHT_POS,
  LEVELS,
  MODULE_BY_ID,
  MODULES_LIST,
  RESOURCE_BY_ID,
  RESOURCE_COLLECT_RADIUS,
  WORLD_RADIUS,
  getLevelDef,
} from './gameData.js';

export const SAVE_STORAGE_KEY = 'nexus_mars_survival_protocol_v1';

const SPAWN_SECTORS = [
  { x: -7.5, z: 5.5 },
  { x: 8.5, z: -7.2 },
  { x: 10.2, z: 4.5 },
  { x: -13.5, z: -1.5 },
  { x: -4.2, z: 12.2 },
  { x: 5.5, z: 13.0 },
  { x: 14.5, z: -2.0 },
  { x: -15.8, z: 8.5 },
  { x: 12.5, z: 11.2 },
  { x: -1.8, z: -13.5 },
  { x: 7.5, z: -14.2 },
  { x: -17.5, z: -12.0 },
  { x: 16.5, z: -11.8 },
  { x: 2.0, z: 17.5 },
  { x: -10.5, z: 15.8 },
  { x: 18.0, z: 5.5 },
  { x: -19.2, z: 1.5 },
  { x: -12.5, z: -16.8 },
  { x: 11.5, z: 16.2 },
  { x: -6.0, z: -9.5 },
];

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

function dist2D(x1, z1, x2, z2) {
  return Math.hypot(x2 - x1, z2 - z1);
}

export function hasEnoughResources(inventory, cost = {}) {
  return (
    (inventory.metal ?? 0) >= (cost.metal ?? 0) &&
    (inventory.energy ?? 0) >= (cost.energy ?? 0) &&
    (inventory.insulation ?? 0) >= (cost.insulation ?? 0) &&
    (inventory.components ?? 0) >= (cost.components ?? 0)
  );
}

export function deductResources(inventory, cost = {}) {
  return {
    metal: Math.max(0, (inventory.metal ?? 0) - (cost.metal ?? 0)),
    energy: Math.max(0, (inventory.energy ?? 0) - (cost.energy ?? 0)),
    insulation: Math.max(0, (inventory.insulation ?? 0) - (cost.insulation ?? 0)),
    components: Math.max(0, (inventory.components ?? 0) - (cost.components ?? 0)),
  };
}

function createResourceNode(id, type, sectorIdx, offsetSeed = 0) {
  const sector = SPAWN_SECTORS[sectorIdx % SPAWN_SECTORS.length];
  const angle = (offsetSeed * 2.39996) % (Math.PI * 2);
  const jitter = (offsetSeed % 3) * 0.45;
  let x = clamp(sector.x + Math.cos(angle) * jitter, -WORLD_RADIUS + 3, WORLD_RADIUS - 3);
  let z = clamp(sector.z + Math.sin(angle) * jitter, -WORLD_RADIUS + 3, WORLD_RADIUS - 3);

  // Keep central station pad & InSight immediate deck clear of resource pickups
  if (Math.hypot(x, z) < 6.8) {
    x = sector.x >= 0 ? 8.2 : -8.2;
  }
  if (dist2D(x, z, INSIGHT_POS.x, INSIGHT_POS.z) < 3.4) {
    z += 3.6;
  }

  return {
    id,
    type,
    x: Number(x.toFixed(2)),
    z: Number(z.toFixed(2)),
    amount: 1,
    bobSeed: (id * 1.37) % (Math.PI * 2),
  };
}

function buildInitialNodes() {
  const typesCycle = [
    'metal',
    'metal',
    'energy',
    'components',
    'insulation',
    'metal',
    'components',
    'energy',
    'insulation',
    'metal',
    'energy',
    'components',
    'metal',
    'insulation',
    'components',
    'energy',
    'metal',
    'insulation',
    'components',
    'energy',
  ];
  return typesCycle.map((type, idx) => createResourceNode(idx + 1, type, idx, idx));
}

export function createInitialState(savedSettings = null) {
  return {
    screen: 'menu', // 'menu' | 'playing' | 'paused' | 'victory' | 'gameover'
    level: 1,
    score: 0,
    levelScore: 0,
    resourcesCollectedCount: 0,
    nextNodeId: 21,
    nextNoticeId: 1,
    rover: {
      x: 0,
      z: 8.6,
      heading: Math.PI, // facing north toward the build pad
      speed: 0,
      turnSpeed: 0,
      wheelSpin: 0,
      collectingPulse: 0,
    },
    inventory: {
      metal: 4,
      energy: 3,
      insulation: 2,
      components: 2,
    },
    nodes: buildInitialNodes(),
    modules: {},
    missionStats: {
      stationHealth: 100,
      stability: 90,
      energy: 75,
      energyMax: 100,
      thermalIntegrity: 92,
      dustOnSolar: 0,
    },
    insightConsulted: [],
    eventState: {
      active: null,
      survivedTypes: [],
      survivedCount: 0,
      mitigatedCount: 0,
    },
    notices: [],
    lastBanner: null,
    selectedBuildModuleId: null,
    levelJustUnlocked: null,
    finalReport: null,
    settings: savedSettings ?? {
      muted: false,
      musicVolume: 0.45,
      sfxVolume: 0.7,
    },
  };
}

function pushNotice(notices, nextId, text, color, x = 0, z = 0) {
  return [
    ...notices.slice(-6),
    {
      id: nextId,
      text,
      color,
      x,
      z,
      ttl: 2.2,
    },
  ];
}

export function getRoverProximity(state) {
  let nearestNode = null;
  let nearestDist = Infinity;
  for (const node of state.nodes) {
    const d = dist2D(state.rover.x, state.rover.z, node.x, node.z);
    if (d <= RESOURCE_COLLECT_RADIUS && d < nearestDist) {
      nearestDist = d;
      nearestNode = node;
    }
  }
  const insightDist = dist2D(state.rover.x, state.rover.z, INSIGHT_POS.x, INSIGHT_POS.z);
  const nearInsight = insightDist <= INSIGHT_INTERACT_RADIUS;
  return { nearestNode, nearestDist, nearInsight, insightDist };
}

export function stepRoverPhysics(state, input, dt) {
  if (state.screen !== 'playing' || dt <= 0) return state;

  const throttle = (input.forward ? 1 : 0) - (input.backward ? 1 : 0);
  const steer = (input.left ? 1 : 0) - (input.right ? 1 : 0);

  const maxSpeed = 9.4;
  const accel = 22.0;
  const drag = 12.0;

  let speed = state.rover.speed;
  if (throttle !== 0) {
    speed = clamp(speed + throttle * accel * dt, -maxSpeed * 0.65, maxSpeed);
  } else {
    const decel = Math.sign(speed) * Math.min(Math.abs(speed), drag * dt);
    speed -= decel;
    if (Math.abs(speed) < 0.04) speed = 0;
  }

  // Natural rover steering (slightly tight even at zero throttle so turning feels responsive)
  const turnRate = 2.65;
  const turnSign = speed < -0.5 ? -1 : 1;
  const heading = state.rover.heading + steer * turnSign * turnRate * dt;

  // Forward direction in Three.js XZ plane (-sin(heading), -cos(heading) or standard sin/cos)
  const dirX = Math.sin(heading);
  const dirZ = Math.cos(heading);
  let nx = state.rover.x + dirX * speed * dt;
  let nz = state.rover.z + dirZ * speed * dt;

  // World boundary clamp (circular basin edge)
  const r = Math.hypot(nx, nz);
  if (r > WORLD_RADIUS - 1.4) {
    const scale = (WORLD_RADIUS - 1.4) / r;
    nx *= scale;
    nz *= scale;
  }

  // Soft collision around NASA InSight lander deck
  const insDist = dist2D(nx, nz, INSIGHT_POS.x, INSIGHT_POS.z);
  if (insDist < 2.25 && insDist > 0.001) {
    const push = (2.25 - insDist) / insDist;
    nx += (nx - INSIGHT_POS.x) * push;
    nz += (nz - INSIGHT_POS.z) * push;
  }

  const wheelSpin = state.rover.wheelSpin + speed * dt * 2.2;
  const collectingPulse = Math.max(0, state.rover.collectingPulse - dt * 2.2);

  // Decay transient notices
  const notices = state.notices
    .map((n) => ({ ...n, ttl: n.ttl - dt }))
    .filter((n) => n.ttl > 0);

  return {
    ...state,
    rover: {
      x: nx,
      z: nz,
      heading,
      speed,
      turnSpeed: steer * turnRate,
      wheelSpin,
      collectingPulse,
    },
    notices,
  };
}

function chooseReplacementType(state) {
  const counts = state.inventory;
  const order = ['metal', 'energy', 'insulation', 'components'];
  // Ensure scarce resource types always keep spawning nearby
  order.sort((a, b) => (counts[a] ?? 0) - (counts[b] ?? 0));
  return order[0];
}

export function collectNearbyResource(state, targetNodeId = null) {
  if (state.screen !== 'playing') return state;
  const { nearestNode } = getRoverProximity(state);
  const target = targetNodeId
    ? state.nodes.find(
        (n) =>
          n.id === targetNodeId &&
          dist2D(state.rover.x, state.rover.z, n.x, n.z) <= RESOURCE_COLLECT_RADIUS + 0.6
      ) ?? nearestNode
    : nearestNode;

  if (!target) return state;

  const gain = target.amount ?? 1;
  const nextInventory = {
    ...state.inventory,
    [target.type]: (state.inventory[target.type] ?? 0) + gain,
  };

  const remainingNodes = state.nodes.filter((n) => n.id !== target.id);
  const replacementType = chooseReplacementType({ ...state, inventory: nextInventory });
  const newNode = createResourceNode(
    state.nextNodeId,
    replacementType,
    state.nextNodeId + remainingNodes.length,
    state.nextNodeId
  );

  const rMeta = RESOURCE_BY_ID[target.type];
  const notices = pushNotice(
    state.notices,
    state.nextNoticeId,
    `+${gain} ${rMeta?.label ?? target.type.toUpperCase()}`,
    rMeta?.color ?? '#4DE2E8',
    target.x,
    target.z
  );

  const updated = {
    ...state,
    inventory: nextInventory,
    nodes: [...remainingNodes, newNode],
    nextNodeId: state.nextNodeId + 1,
    nextNoticeId: state.nextNoticeId + 1,
    resourcesCollectedCount: state.resourcesCollectedCount + gain,
    score: state.score + 25,
    levelScore: state.levelScore + 25,
    rover: {
      ...state.rover,
      collectingPulse: 1,
    },
    notices,
    lastBanner: {
      type: 'success',
      text: `Collected +${gain} ${rMeta?.label ?? target.type} (+25 PTS)`,
    },
  };

  return evaluateLevelProgress(updated);
}

export function computeStationCapabilities(modules) {
  const foundationLv = modules.foundation?.level ?? 0;
  const supportLv = modules.support?.level ?? 0;
  const habitatLv = modules.habitat?.level ?? 0;
  const seismicLv = modules.seismic?.level ?? 0;
  const solarLv = modules.solar?.level ?? 0;
  const batteryLv = modules.battery?.level ?? 0;
  const thermalLv = modules.thermal?.level ?? 0;
  const labLv = modules.lab?.level ?? 0;
  const commsLv = modules.comms?.level ?? 0;
  const storageLv = modules.storage?.level ?? 0;

  return {
    seismicDefense: Math.min(0.85, foundationLv * 0.14 + supportLv * 0.18 + seismicLv * 0.28 + storageLv * 0.06),
    solarOutputRate: solarLv > 0 ? 1.8 + solarLv * 1.1 : 0.35, // base rover RTG trickle + solar
    energyMax: 100 + batteryLv * 45 + habitatLv * 10,
    thermalDefense: Math.min(0.85, habitatLv * 0.16 + thermalLv * 0.34 + storageLv * 0.08),
    scienceMultiplier: 1 + labLv * 0.25 + commsLv * 0.15,
    builtCount: Object.keys(modules).length,
    upgradedCount: Object.values(modules).filter((m) => m.level >= 2).length,
  };
}

export function buildModule(state, moduleId, explicitSlotIndex = null) {
  if (state.screen !== 'playing') return { state, ok: false, reason: 'Game is not active.' };
  const def = MODULE_BY_ID[moduleId];
  if (!def) return { state, ok: false, reason: 'Unknown module.' };
  if (state.modules[moduleId]) return { state, ok: false, reason: `${def.name} is already constructed.` };
  if (state.level < def.unlockLevel) {
    return {
      state,
      ok: false,
      reason: `Unlocks at Level ${def.unlockLevel} (currently Level ${state.level}).`,
    };
  }
  if (!hasEnoughResources(state.inventory, def.cost)) {
    return { state, ok: false, reason: `Insufficient resources for ${def.name}.` };
  }

  // Pick explicit unoccupied slot, preferred slot if free, or first open slot
  const occupiedSlots = new Set(Object.values(state.modules).map((m) => m.slotIndex));
  let slotIndex = explicitSlotIndex ?? def.preferredSlot;
  if (occupiedSlots.has(slotIndex)) {
    const free = BUILD_SLOTS.find((s) => !occupiedSlots.has(s.index));
    if (!free) return { state, ok: false, reason: 'All station foundation slots are occupied.' };
    slotIndex = free.index;
  }

  const slot = BUILD_SLOTS[slotIndex] ?? BUILD_SLOTS[0];
  const nextModules = {
    ...state.modules,
    [moduleId]: {
      slotIndex,
      level: 1,
      integrity: 100,
      buildProgress: 0.06,
    },
  };
  const caps = computeStationCapabilities(nextModules);
  const nextEnergy = Math.min(caps.energyMax, state.missionStats.energy + (moduleId === 'battery' ? 25 : 0));

  const notices = pushNotice(
    state.notices,
    state.nextNoticeId,
    `BUILT ${def.shortName.toUpperCase()} (+120 PTS)`,
    '#45D483',
    slot.x,
    slot.z
  );

  const nextState = {
    ...state,
    inventory: deductResources(state.inventory, def.cost),
    modules: nextModules,
    nextNoticeId: state.nextNoticeId + 1,
    score: state.score + 120,
    levelScore: state.levelScore + 120,
    selectedBuildModuleId: null,
    missionStats: {
      ...state.missionStats,
      energyMax: caps.energyMax,
      energy: nextEnergy,
      stationHealth: clamp(state.missionStats.stationHealth + 6, 0, 100),
      stability: clamp(state.missionStats.stability + (def.category === 'structure' || def.category === 'defense' ? 8 : 2), 0, 100),
    },
    notices,
    lastBanner: {
      type: 'success',
      text: `${def.name} constructed at ${slot.zoneLabel}!`,
    },
  };

  return { state: evaluateLevelProgress(nextState), ok: true };
}

export function upgradeModule(state, moduleId) {
  if (state.screen !== 'playing') return { state, ok: false, reason: 'Game is not active.' };
  const def = MODULE_BY_ID[moduleId];
  const mod = state.modules[moduleId];
  if (!def || !mod) return { state, ok: false, reason: 'Module must be built first.' };
  if (mod.level >= 3) return { state, ok: false, reason: `${def.name} is already at maximum Level 3.` };
  if (!hasEnoughResources(state.inventory, def.upgradeCost)) {
    return { state, ok: false, reason: `Need more resources to upgrade ${def.name}.` };
  }

  const nextLv = mod.level + 1;
  const nextModules = {
    ...state.modules,
    [moduleId]: {
      ...mod,
      level: nextLv,
      integrity: 100,
    },
  };
  const caps = computeStationCapabilities(nextModules);
  const slot = BUILD_SLOTS[mod.slotIndex] ?? BUILD_SLOTS[0];
  const notices = pushNotice(
    state.notices,
    state.nextNoticeId,
    `${def.shortName.toUpperCase()} LV.${nextLv}!`,
    '#39A9FF',
    slot.x,
    slot.z
  );

  const nextState = {
    ...state,
    inventory: deductResources(state.inventory, def.upgradeCost),
    modules: nextModules,
    nextNoticeId: state.nextNoticeId + 1,
    score: state.score + 150,
    levelScore: state.levelScore + 150,
    missionStats: {
      ...state.missionStats,
      energyMax: caps.energyMax,
      stationHealth: clamp(state.missionStats.stationHealth + 8, 0, 100),
      stability: clamp(state.missionStats.stability + 6, 0, 100),
      thermalIntegrity: clamp(state.missionStats.thermalIntegrity + (moduleId === 'thermal' || moduleId === 'habitat' ? 12 : 2), 0, 100),
    },
    notices,
    lastBanner: {
      type: 'success',
      text: `${def.name} upgraded to Level ${nextLv} (+150 PTS).`,
    },
  };

  return { state: evaluateLevelProgress(nextState), ok: true };
}

export function repairStation(state) {
  if (state.screen !== 'playing') return state;
  if (state.inventory.metal < 2 && state.missionStats.energy < 15) {
    return {
      ...state,
      lastBanner: { type: 'error', text: 'Need 2 Metal or 15 Energy reserves to run station repairs.' },
    };
  }
  const useMetal = state.inventory.metal >= 2;
  const nextInventory = useMetal ? { ...state.inventory, metal: state.inventory.metal - 2 } : state.inventory;
  const nextEnergy = useMetal ? state.missionStats.energy : state.missionStats.energy - 15;

  const repairedModules = {};
  for (const [k, m] of Object.entries(state.modules)) {
    repairedModules[k] = { ...m, integrity: Math.min(100, m.integrity + 25) };
  }

  return {
    ...state,
    inventory: nextInventory,
    modules: repairedModules,
    missionStats: {
      ...state.missionStats,
      energy: nextEnergy,
      stationHealth: clamp(state.missionStats.stationHealth + 22, 0, 100),
      stability: clamp(state.missionStats.stability + 18, 0, 100),
      thermalIntegrity: clamp(state.missionStats.thermalIntegrity + 12, 0, 100),
    },
    lastBanner: {
      type: 'success',
      text: `Emergency field repairs restored station integrity (${useMetal ? '-2 Metal' : '-15 Energy'}).`,
    },
  };
}

export function consultInsight(state, recordId) {
  const already = state.insightConsulted.includes(recordId);
  const nextInsight = already ? state.insightConsulted : [...state.insightConsulted, recordId];
  const nextState = {
    ...state,
    insightConsulted: nextInsight,
    score: already ? state.score : state.score + 60,
    levelScore: already ? state.levelScore : state.levelScore + 60,
    lastBanner: {
      type: 'info',
      text: already
        ? 'InSight historical telemetry archive reviewed.'
        : 'InSight data analyzed (+60 Science Bonus)! Use these engineering lessons on your outpost.',
    },
  };
  return evaluateLevelProgress(nextState);
}

export function startChallenge(state, challengeType, secondaryQuake = false) {
  const def = CHALLENGES[challengeType];
  if (!def) return state;
  if (state.eventState.active) return state;

  return {
    ...state,
    eventState: {
      ...state.eventState,
      active: {
        type: challengeType,
        phase: 'warning',
        timer: def.durationWarning,
        secondaryQuake,
        mitigated: false,
      },
    },
    lastBanner: {
      type: 'warning',
      text: `⚠ ${def.title}: ${def.warningText}`,
    },
  };
}

export function applyEmergencyAction(state, actionId) {
  const active = state.eventState.active;
  if (!active || state.screen !== 'playing') return state;
  const challenge = CHALLENGES[active.type];
  const action = challenge?.actions.find((a) => a.id === actionId);
  if (!action) return state;

  if ((action.energyCost ?? 0) > state.missionStats.energy) {
    return {
      ...state,
      lastBanner: { type: 'error', text: `Need ${action.energyCost} Energy reserves for ${action.label}.` },
    };
  }
  const resCost = {
    metal: action.metalCost ?? 0,
    insulation: action.insulationCost ?? 0,
    components: action.componentsCost ?? 0,
  };
  if (!hasEnoughResources(state.inventory, resCost)) {
    return {
      ...state,
      lastBanner: { type: 'error', text: `Missing required resource container for ${action.label}.` },
    };
  }

  let stats = {
    ...state.missionStats,
    energy: clamp(state.missionStats.energy - (action.energyCost ?? 0), 0, state.missionStats.energyMax),
  };

  if (action.id === 'dampen_seismic') {
    stats.stability = clamp(stats.stability + 16, 0, 100);
    stats.stationHealth = clamp(stats.stationHealth + 8, 0, 100);
  } else if (action.id === 'brace_frames') {
    stats.stability = clamp(stats.stability + 18, 0, 100);
    stats.stationHealth = clamp(stats.stationHealth + 10, 0, 100);
  } else if (action.id === 'clean_solar') {
    stats.dustOnSolar = Math.max(0, stats.dustOnSolar - 55);
  } else if (action.id === 'conserve_grid') {
    stats.energy = clamp(stats.energy + 22, 0, stats.energyMax);
  } else if (action.id === 'pulse_heaters') {
    stats.thermalIntegrity = clamp(stats.thermalIntegrity + 24, 0, 100);
  } else if (action.id === 'seal_insulation') {
    stats.thermalIntegrity = clamp(stats.thermalIntegrity + 18, 0, 100);
  }

  const notices = pushNotice(
    state.notices,
    state.nextNoticeId,
    `${action.label.toUpperCase()} APPLIED (+80 PTS)`,
    '#4DE2E8',
    0,
    0
  );

  return {
    ...state,
    inventory: deductResources(state.inventory, resCost),
    missionStats: stats,
    score: state.score + 80,
    levelScore: state.levelScore + 80,
    nextNoticeId: state.nextNoticeId + 1,
    notices,
    eventState: {
      ...state.eventState,
      active: {
        ...active,
        mitigated: true,
      },
      mitigatedCount: state.eventState.mitigatedCount + 1,
    },
    lastBanner: {
      type: 'success',
      text: `${action.label} activated! Hazard impact reduced (+80 Engineering Bonus).`,
    },
  };
}

export function applySimulationTick(state, dt) {
  if (state.screen !== 'playing' || dt <= 0) return state;

  // Advance progressive building assembly (0 -> 1 in ~1.2s)
  let modulesChanged = false;
  const nextModules = {};
  for (const [id, mod] of Object.entries(state.modules)) {
    if (mod.buildProgress < 1) {
      modulesChanged = true;
      nextModules[id] = { ...mod, buildProgress: Math.min(1, mod.buildProgress + dt * 0.95) };
    } else {
      nextModules[id] = mod;
    }
  }

  const caps = computeStationCapabilities(modulesChanged ? nextModules : state.modules);
  let stats = { ...state.missionStats };
  let eventState = state.eventState;
  let lastBanner = state.lastBanner;

  // Solar power generation (diminished by dust) & ambient heating demand
  const dustFactor = 1 - Math.min(0.8, stats.dustOnSolar / 120);
  const stormSolarPenalty =
    eventState.active?.type === 'dust_storm' && eventState.active.phase === 'active' ? 0.35 : 1;
  const netPower = caps.solarOutputRate * dustFactor * stormSolarPenalty - 0.35;
  stats.energy = clamp(stats.energy + netPower * dt, 0, caps.energyMax);

  // Environmental challenge progression & live stat effects
  if (eventState.active) {
    const active = eventState.active;
    const def = CHALLENGES[active.type];
    const nextTimer = active.timer - dt;
    const mitigationMult = active.mitigated ? 0.38 : 1.0;

    if (active.phase === 'active') {
      if (active.type === 'marsquake' || (active.secondaryQuake && nextTimer < 5)) {
        const dmg = 3.1 * (1 - caps.seismicDefense) * mitigationMult * dt;
        stats.stability = clamp(stats.stability - dmg * 1.4, 0, 100);
        stats.stationHealth = clamp(stats.stationHealth - dmg * 0.8, 0, 100);
      }
      if (active.type === 'dust_storm') {
        stats.dustOnSolar = clamp(stats.dustOnSolar + 5.2 * dt, 0, 90);
        stats.energy = clamp(stats.energy - 1.75 * mitigationMult * dt, 0, caps.energyMax);
      }
      if (active.type === 'extreme_cold') {
        const coldLoss = 3.4 * (1 - caps.thermalDefense) * mitigationMult * dt;
        stats.thermalIntegrity = clamp(stats.thermalIntegrity - coldLoss, 0, 100);
        stats.energy = clamp(stats.energy - 1.15 * dt, 0, caps.energyMax);
        if (stats.thermalIntegrity < 22) {
          stats.stationHealth = clamp(stats.stationHealth - 1.6 * dt, 0, 100);
        }
      }
    } else if (active.phase === 'recovery') {
      stats.stability = clamp(stats.stability + 1.8 * dt, 0, 100);
      stats.thermalIntegrity = clamp(stats.thermalIntegrity + 2.2 * dt, 0, 100);
    }

    if (nextTimer <= 0) {
      if (active.phase === 'warning') {
        eventState = {
          ...eventState,
          active: { ...active, phase: 'active', timer: def.durationActive },
        };
        lastBanner = { type: 'warning', text: `⚠ ${def.title} ACTIVE: ${def.activeText}` };
      } else if (active.phase === 'active') {
        const survivedTypes = eventState.survivedTypes.includes(active.type)
          ? eventState.survivedTypes
          : [...eventState.survivedTypes, active.type];
        eventState = {
          ...eventState,
          active: null,
          survivedTypes,
          survivedCount: eventState.survivedCount + 1,
        };
        lastBanner = { type: 'success', text: `${def.title} cleared! ${def.recoveryText}` };
      }
    } else {
      eventState = {
        ...eventState,
        active: { ...active, timer: nextTimer },
      };
    }
  } else {
    // Gentle passive recovery when no storm/quake/cold front is attacking
    stats.dustOnSolar = Math.max(0, stats.dustOnSolar - 0.6 * dt);
    stats.thermalIntegrity = clamp(stats.thermalIntegrity + 0.8 * dt, 0, 100);
    stats.stability = clamp(stats.stability + 0.6 * dt, 0, 100);
  }

  let nextState = {
    ...state,
    modules: modulesChanged ? nextModules : state.modules,
    missionStats: stats,
    eventState,
    lastBanner,
  };

  // Defeat check
  if (stats.stationHealth <= 0) {
    return {
      ...nextState,
      screen: 'gameover',
      lastBanner: {
        type: 'error',
        text: 'CRITICAL FAILURE: Station structural integrity collapsed. Retry level and reinforce modules.',
      },
    };
  }

  // Continuously evaluate survive_challenge transitions
  return evaluateLevelProgress(nextState);
}

export function isLevelConditionMet(state) {
  const def = getLevelDef(state.level);
  if (!def) return false;

  switch (def.type) {
    case 'collect_total':
      return state.resourcesCollectedCount >= def.targetCount;
    case 'build_module':
      return Boolean(state.modules[def.moduleId]);
    case 'consult_insight':
      return state.insightConsulted.includes(def.recordId);
    case 'upgrade_or_build': {
      const upgraded = def.moduleIds.some((id) => (state.modules[id]?.level ?? 0) >= def.minLevel);
      const builtAlt = Boolean(state.modules[def.altBuildId]);
      return upgraded || builtAlt;
    }
    case 'upgrade_any':
      return def.moduleIds.some((id) => (state.modules[id]?.level ?? 0) >= def.minLevel);
    case 'survive_challenge': {
      if (def.requireInsightId && !state.insightConsulted.includes(def.requireInsightId)) return false;
      if (def.requireModuleId && !state.modules[def.requireModuleId]) return false;
      return state.eventState.survivedTypes.includes(def.challengeType) && !state.eventState.active;
    }
    case 'final_evaluation': {
      const caps = computeStationCapabilities(state.modules);
      return caps.upgradedCount >= (def.requiredUpgradedCount ?? 3) && state.missionStats.stationHealth >= 50;
    }
    default:
      return false;
  }
}

export function evaluateLevelProgress(state) {
  if (state.screen !== 'playing' || state.level >= 20) return state;
  const currentDef = getLevelDef(state.level);
  if (!isLevelConditionMet(state)) return state;

  const nextLevel = state.level + 1;
  const nextDef = getLevelDef(nextLevel);
  const reward = currentDef.rewardScore ?? 200;

  let nextEventState = state.eventState;
  let lastBanner = {
    type: 'success',
    text: `LEVEL ${state.level} COMPLETE (+${reward} PTS)! Next: ${nextDef.title}`,
  };

  // Trigger scheduled environmental challenges cleanly for challenge levels
  if (nextDef.type === 'survive_challenge') {
    const cType = nextDef.challengeType;
    nextEventState = {
      ...nextEventState,
      // Reset survived flag for that challenge type so Level 19 & Level 11 require withstanding the new storm cleanly
      survivedTypes: nextEventState.survivedTypes.filter((t) => t !== cType),
      active: {
        type: cType,
        phase: 'warning',
        timer: CHALLENGES[cType].durationWarning,
        secondaryQuake: Boolean(nextDef.secondaryQuake),
        mitigated: false,
      },
    };
    lastBanner = {
      type: 'warning',
      text: `LEVEL ${nextLevel}: ⚠ ${CHALLENGES[cType].title} approaching! Prepare your response.`,
    };
  } else if (currentDef.challengeTrigger && !nextEventState.active) {
    const cType = currentDef.challengeTrigger;
    nextEventState = {
      ...nextEventState,
      active: {
        type: cType,
        phase: 'warning',
        timer: CHALLENGES[cType].durationWarning,
        secondaryQuake: false,
        mitigated: false,
      },
    };
  }

  const notices = pushNotice(
    state.notices,
    state.nextNoticeId,
    `LEVEL ${nextLevel} UNLOCKED!`,
    '#45D483',
    state.rover.x,
    state.rover.z
  );

  return {
    ...state,
    level: nextLevel,
    score: state.score + reward,
    levelScore: 0,
    nextNoticeId: state.nextNoticeId + 1,
    eventState: nextEventState,
    notices,
    levelJustUnlocked: nextLevel,
    lastBanner,
  };
}

export function completeFinalMission(state) {
  if (state.level !== 20 || !isLevelConditionMet(state)) {
    return {
      ...state,
      lastBanner: {
        type: 'warning',
        text: 'Upgrade at least 3 modules to LV.2+ and maintain Station Health >= 50% to certify Level 20!',
      },
    };
  }

  const caps = computeStationCapabilities(state.modules);
  const stabilityScore = Math.round(state.missionStats.stability * 0.6 + caps.seismicDefense * 40);
  const energyScore = Math.round((state.missionStats.energy / Math.max(1, state.missionStats.energyMax)) * 60 + Math.min(40, caps.energyMax * 0.2));
  const thermalScore = Math.round(state.missionStats.thermalIntegrity * 0.6 + caps.thermalDefense * 40);
  const scienceScore = Math.round((state.insightConsulted.length / 3) * 60 + Math.min(40, caps.builtCount * 4));
  const overall = Math.round((stabilityScore + energyScore + thermalScore + scienceScore) / 4);
  const grade = overall >= 85 ? 'S' : overall >= 72 ? 'A' : 'B';

  const bonus = LEVELS[19].rewardScore;
  return {
    ...state,
    screen: 'victory',
    score: state.score + bonus,
    finalReport: {
      grade,
      overall,
      stabilityScore: clamp(stabilityScore, 0, 100),
      energyScore: clamp(energyScore, 0, 100),
      thermalScore: clamp(thermalScore, 0, 100),
      scienceScore: clamp(scienceScore, 0, 100),
      builtCount: caps.builtCount,
      totalModules: MODULES_LIST.length,
      upgradedCount: caps.upgradedCount,
      resourcesCollectedCount: state.resourcesCollectedCount,
    },
    lastBanner: {
      type: 'success',
      text: `MARS SURVIVAL PROTOCOL CERTIFIED — GRADE ${grade} (+${bonus} PTS)!`,
    },
  };
}

export function saveSurvivalGame(state) {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    const payload = {
      level: state.level,
      score: state.score,
      resourcesCollectedCount: state.resourcesCollectedCount,
      rover: state.rover,
      inventory: state.inventory,
      modules: state.modules,
      missionStats: state.missionStats,
      insightConsulted: state.insightConsulted,
      settings: state.settings,
      savedAt: Date.now(),
    };
    window.localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch {
    return false;
  }
}

export function loadSurvivalGame() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    const raw = window.localStorage.getItem(SAVE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.level !== 'number') return null;
    const base = createInitialState(parsed.settings);
    return {
      ...base,
      screen: 'playing',
      level: clamp(parsed.level, 1, 20),
      score: parsed.score ?? 0,
      resourcesCollectedCount: parsed.resourcesCollectedCount ?? 0,
      rover: { ...base.rover, ...parsed.rover },
      inventory: { ...base.inventory, ...parsed.inventory },
      modules: parsed.modules ?? {},
      missionStats: { ...base.missionStats, ...parsed.missionStats },
      insightConsulted: Array.isArray(parsed.insightConsulted) ? parsed.insightConsulted : [],
      lastBanner: { type: 'info', text: `Resumed Mission at Level ${parsed.level}.` },
    };
  } catch {
    return null;
  }
}

export function clearSurvivalSave() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(SAVE_STORAGE_KEY);
    }
  } catch {
    // Ignore storage quota / security errors
  }
}
