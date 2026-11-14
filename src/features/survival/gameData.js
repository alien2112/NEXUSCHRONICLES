/**
 * Core scientific, architectural, environmental, and 20-level campaign data
 * for NEXUS — MARS: THE SURVIVAL PROTOCOL.
 */

export const PALETTE = {
  marsRust: '#B85C38',
  deepMarsRed: '#7A3027',
  dustOrange: '#D88752',
  desertSand: '#D9A77B',
  spaceNavy: '#101827',
  darkGraphite: '#1A2433',
  techBlue: '#39A9FF',
  cyan: '#4DE2E8',
  white: '#F4F7FA',
  success: '#45D483',
  warning: '#FFB547',
  danger: '#FF5555',
};

export const WORLD_RADIUS = 25;
export const INSIGHT_POS = { x: -10.5, z: -8.5 };
export const INSIGHT_INTERACT_RADIUS = 4.2;
export const RESOURCE_COLLECT_RADIUS = 3.0;

export const RESOURCE_TYPES = [
  {
    id: 'metal',
    label: 'METAL',
    color: '#9FB3C8',
    badgeBg: 'rgba(159, 179, 200, 0.16)',
    description: 'Structural frames, station foundations, and anchor trusses.',
  },
  {
    id: 'energy',
    label: 'ENERGY',
    color: '#4DE2E8',
    badgeBg: 'rgba(77, 226, 232, 0.16)',
    description: 'High-density power cells for electrical systems and storage.',
  },
  {
    id: 'insulation',
    label: 'INSULATION',
    color: '#FFB547',
    badgeBg: 'rgba(255, 181, 71, 0.16)',
    description: 'Aerogel and thermal shielding for freezing Martian nights.',
  },
  {
    id: 'components',
    label: 'COMPONENTS',
    color: '#39A9FF',
    badgeBg: 'rgba(57, 169, 255, 0.16)',
    description: 'Avionics, sensors, dampers, and communications electronics.',
  },
];

export const RESOURCE_BY_ID = Object.fromEntries(RESOURCE_TYPES.map((r) => [r.id, r]));

export const BUILD_SLOTS = [
  { index: 0, x: 0, z: 0, zoneLabel: 'Core Pad Center' },
  { index: 1, x: 0, z: -4.2, zoneLabel: 'North Truss Bay' },
  { index: 2, x: -4.2, z: 0, zoneLabel: 'West Habitat Wing' },
  { index: 3, x: 4.5, z: -3.6, zoneLabel: 'Northeast Solar Ridge' },
  { index: 4, x: 4.5, z: 1.4, zoneLabel: 'East Power Bank' },
  { index: 5, x: -4.2, z: 4.4, zoneLabel: 'Southwest Science Annex' },
  { index: 6, x: 0, z: 4.6, zoneLabel: 'South Telemetry Mast' },
  { index: 7, x: -3.2, z: -3.8, zoneLabel: 'Northwest Cryo Deck' },
  { index: 8, x: 3.4, z: 4.4, zoneLabel: 'Southeast Damper Anchor' },
  { index: 9, x: 5.0, z: -0.9, zoneLabel: 'East Logistics Vault' },
];

export const MODULES_LIST = [
  {
    id: 'foundation',
    name: 'Foundation Platform',
    shortName: 'Foundation',
    unlockLevel: 2,
    preferredSlot: 0,
    cost: { metal: 4, energy: 0, insulation: 0, components: 0 },
    upgradeCost: { metal: 3, energy: 0, insulation: 0, components: 2 },
    category: 'structure',
    summary: 'Anchored regolith pad distributing mass and stabilizing station structures.',
  },
  {
    id: 'support',
    name: 'Structural Support',
    shortName: 'Support Truss',
    unlockLevel: 3,
    preferredSlot: 1,
    cost: { metal: 5, energy: 0, insulation: 0, components: 2 },
    upgradeCost: { metal: 4, energy: 0, insulation: 0, components: 3 },
    category: 'structure',
    summary: 'Cross-braced alloy frame engineered to resist marsquake shear stress.',
  },
  {
    id: 'habitat',
    name: 'Main Habitat',
    shortName: 'Main Habitat',
    unlockLevel: 4,
    preferredSlot: 2,
    cost: { metal: 6, energy: 2, insulation: 3, components: 4 },
    upgradeCost: { metal: 4, energy: 2, insulation: 3, components: 2 },
    category: 'habitat',
    summary: 'Pressurized crew research dome with airlock and environmental life systems.',
  },
  {
    id: 'seismic',
    name: 'Seismic Protection System',
    shortName: 'Seismic Shield',
    unlockLevel: 7,
    preferredSlot: 8,
    cost: { metal: 6, energy: 2, insulation: 2, components: 4 },
    upgradeCost: { metal: 4, energy: 2, insulation: 2, components: 3 },
    category: 'defense',
    summary: 'Base-isolation dampers reducing seismic ground motion transmitted to instruments.',
  },
  {
    id: 'solar',
    name: 'Solar Energy Array',
    shortName: 'Solar Array',
    unlockLevel: 9,
    preferredSlot: 3,
    cost: { metal: 4, energy: 2, insulation: 0, components: 4 },
    upgradeCost: { metal: 3, energy: 3, insulation: 0, components: 3 },
    category: 'power',
    summary: 'Dual-wing photovoltaic array converting Martian sunlight into station power.',
  },
  {
    id: 'battery',
    name: 'Battery Storage',
    shortName: 'Battery Bank',
    unlockLevel: 10,
    preferredSlot: 4,
    cost: { metal: 3, energy: 5, insulation: 1, components: 3 },
    upgradeCost: { metal: 2, energy: 4, insulation: 2, components: 3 },
    category: 'power',
    summary: 'High-capacity reserve cells sustaining the station through regional dust storms.',
  },
  {
    id: 'thermal',
    name: 'Thermal Protection System',
    shortName: 'Thermal Shield',
    unlockLevel: 14,
    preferredSlot: 7,
    cost: { metal: 3, energy: 3, insulation: 6, components: 3 },
    upgradeCost: { metal: 2, energy: 3, insulation: 5, components: 2 },
    category: 'thermal',
    summary: 'Active heat-loop radiators and multilayer insulation guarding core avionics.',
  },
  {
    id: 'lab',
    name: 'Research Laboratory',
    shortName: 'Research Lab',
    unlockLevel: 17,
    preferredSlot: 5,
    cost: { metal: 5, energy: 3, insulation: 3, components: 5 },
    upgradeCost: { metal: 3, energy: 3, insulation: 2, components: 4 },
    category: 'science',
    summary: 'Seismic and atmospheric laboratory analyzing core vibration spectra.',
  },
  {
    id: 'comms',
    name: 'Communication Tower',
    shortName: 'Comms Tower',
    unlockLevel: 18,
    preferredSlot: 6,
    cost: { metal: 4, energy: 3, insulation: 1, components: 5 },
    upgradeCost: { metal: 2, energy: 3, insulation: 1, components: 4 },
    category: 'science',
    summary: 'High-gain deep-space dish relaying telemetry to orbital relays.',
  },
  {
    id: 'storage',
    name: 'Equipment Storage',
    shortName: 'Cargo Vault',
    unlockLevel: 6,
    preferredSlot: 9,
    cost: { metal: 5, energy: 1, insulation: 3, components: 2 },
    upgradeCost: { metal: 3, energy: 1, insulation: 3, components: 2 },
    category: 'logistics',
    summary: 'Reinforced spare-parts bunker shielding critical electronics from dust and shock.',
  },
];

export const MODULE_BY_ID = Object.fromEntries(MODULES_LIST.map((m) => [m.id, m]));

export const INSIGHT_RECORDS = [
  {
    id: 'seis',
    instrument: 'SEIS — Seismic Experiment for Interior Structure',
    years: 'Historical Mission: Nov 2018 – Dec 2022 (Mission Concluded)',
    discovery:
      'InSight recorded more than 1,300 marsquakes and meteorite impacts, proving Mars is seismically active and helping scientists map its crust, mantle, and liquid iron-rich core.',
    relevance:
      'Understanding ground motion helps engineers consider base isolation, anchored foundations, and vibration shielding for future research stations—even though most marsquakes are moderate rather than catastrophic.',
    bonusHint: 'Priority Modules: Foundation Platform, Structural Support, Seismic Protection System.',
    earlyWarningEdge: 'Early Warning Edge: Unlocks 25s SEIS P-wave advance forecast & +7s Marsquake warning time.',
  },
  {
    id: 'apss',
    instrument: 'APSS — Auxiliary Payload Sensor Suite',
    years: 'Historical Mission: Nov 2018 – Dec 2022 (Mission Concluded)',
    discovery:
      'APSS monitored daily atmospheric pressure drops, gusty Martian winds, and severe day-night surface temperature swings near Elysium Planitia.',
    relevance:
      'Simplified engineering takeaway: steep cold cycles demand insulated enclosures and power-budgeted heating so sensitive electronics remain within safe operating limits.',
    bonusHint: 'Priority Modules: Main Habitat, Thermal Protection System, Equipment Storage.',
    earlyWarningEdge: 'Early Warning Edge: Unlocks 25s APSS thermal drop forecast & +7s Cold Front warning time.',
  },
  {
    id: 'solar_dust',
    instrument: 'Solar Arrays — Dust Accumulation & Power Decline',
    years: 'Historical Mission: Nov 2018 – Dec 2022 (Mission Concluded)',
    discovery:
      'InSight generated roughly 5,000 Wh/sol early in its mission, but electrostatic dust gradually coated its circular solar arrays until power fell near 500 Wh/sol before mission end in December 2022.',
    relevance:
      'Solar-powered outposts need dust-mitigation workflows, backup battery reserves, and smart energy load shedding during low-irradiance dust storms.',
    bonusHint: 'Priority Modules: Solar Energy Array, Battery Storage.',
    earlyWarningEdge: 'Early Warning Edge: Unlocks 30s Dust Opacity advance forecast & +8s Dust Storm warning time.',
  },
];

export const CHALLENGES = {
  marsquake: {
    id: 'marsquake',
    title: 'MARSQUAKE DETECTED',
    subtitle: 'Seismic Shear Event — Elysium Sector',
    warningText: 'P-wave precursors rising. Reinforce foundations or engage seismic dampers before peak tremor!',
    activeText: 'Surface seismic waves stressing unbraced modules. Activate dampers or reinforce structure.',
    recoveryText: 'Seismic wave subsided. Inspect integrity and review SEIS isolation data.',
    durationWarning: 5,
    durationActive: 10,
    insightRecordId: 'seis',
    earlyWarningBonus: 7,
    earlyForecastLead: 25,
    schedule: {
      initialMinDelay: 60, // 1 min before first random earthquake can strike
      initialRandomWindow: 20,
      minGap: 180, // 3 min minimum gap between earthquakes
      randomGapWindow: 40,
    },
    actions: [
      {
        id: 'dampen_seismic',
        label: 'Engage Seismic Dampers',
        detail: 'Costs 12 Energy · Halves structural damage and stabilizes station.',
        energyCost: 12,
        metalCost: 0,
      },
      {
        id: 'brace_frames',
        label: 'Weld Emergency Braces',
        detail: 'Costs 2 Metal · Restores +12 Stability and shields Lab.',
        energyCost: 0,
        metalCost: 2,
      },
    ],
  },
  dust_storm: {
    id: 'dust_storm',
    title: 'DUST STORM INCOMING',
    subtitle: 'High Opacity & Electrostatic Settling',
    warningText: 'Suspended atmospheric dust climbing. Conserve battery reserves and prepare solar array cleaning.',
    activeText: 'Dust coating solar panels (-65% output). Clean arrays or switch to battery reserve mode!',
    recoveryText: 'Winds clearing. Brush remaining dust off panels to restore full solar yield.',
    durationWarning: 5,
    durationActive: 11,
    insightRecordId: 'solar_dust',
    earlyWarningBonus: 8,
    earlyForecastLead: 30,
    schedule: {
      initialMinDelay: 95, // ~1.6 min before first random dust storm
      initialRandomWindow: 25,
      minGap: 240, // 4 min minimum gap between dust storms
      randomGapWindow: 45,
    },
    actions: [
      {
        id: 'clean_solar',
        label: 'Clean Solar Panels',
        detail: 'Costs 10 Energy · Strips accumulated dust and restores solar generation.',
        energyCost: 10,
        metalCost: 0,
      },
      {
        id: 'conserve_grid',
        label: 'Route Battery Reserve',
        detail: 'Costs 1 Component · Stabilizes grid and boosts +18 Energy reserves.',
        energyCost: 0,
        componentsCost: 1,
      },
    ],
  },
  extreme_cold: {
    id: 'extreme_cold',
    title: 'EXTREME COLD FRONT',
    subtitle: 'Rapid Radiative Cooling (-116°C Exterior)',
    warningText: 'Thermal gradient steepening. Pre-heat core bus or boost insulation shielding.',
    activeText: 'Severe cold front draining thermal integrity and heating power. Regulate heaters now!',
    recoveryText: 'Solar noon warming site. Verify thermal shields held avionics within tolerance.',
    durationWarning: 5,
    durationActive: 10,
    insightRecordId: 'apss',
    earlyWarningBonus: 7,
    earlyForecastLead: 25,
    schedule: {
      initialMinDelay: 135, // ~2.25 min before first random extreme cold front
      initialRandomWindow: 30,
      minGap: 270, // 4.5 min minimum gap between extreme cold fronts
      randomGapWindow: 50,
    },
    actions: [
      {
        id: 'pulse_heaters',
        label: 'Regulate Thermal Heaters',
        detail: 'Costs 14 Energy · Restores +22 Thermal Integrity immediately.',
        energyCost: 14,
        metalCost: 0,
      },
      {
        id: 'seal_insulation',
        label: 'Deploy Aerogel Baffles',
        detail: 'Costs 2 Insulation · Halves cold heat loss and gains +15 Thermal.',
        energyCost: 0,
        insulationCost: 2,
      },
    ],
  },
};

export const NEXUS_DIALOGUES = {
  intro:
    'NEXUS online. Historical InSight telemetry loaded as an educational archive. Drive with W/A/S/D, collect nearby materials with E, and open Construction with B.',
  insightPrompt:
    'NASA’s InSight lander rests just northwest of our build pad. Approach and press E (or Access InSight Data) to turn its 2018–2022 findings into outpost strategy.',
  marsquake:
    'Seismic activity detected. InSight’s SEIS instrument helped scientists understand seismic activity on Mars. Your next priority is structural stability.',
  dust_storm:
    'Dust accumulation can reduce solar panel performance. Your energy reserves may become limited. Consider cleaning panels or improving power storage.',
  extreme_cold:
    'Low temperatures create additional thermal management demands. Consider protecting sensitive equipment with appropriate insulation.',
  victory:
    'All 20 Mars Survival Protocol stages validated. The knowledge InSight left behind now powers a resilient next-generation station.',
};

/**
 * 20 Full Playable Levels matching Section 11 exact progression structure.
 */
export const LEVELS = [
  // LEVELS 1–4: THE FOUNDATION
  {
    level: 1,
    act: 'ACT I · THE FOUNDATION',
    title: 'Level 1: First Contact',
    objective: 'Explore Elysium terrain and collect 3 resources (Metal, Energy, Insulation, or Components).',
    type: 'collect_total',
    targetCount: 3,
    nexusHint: 'Drive the 6-wheel utility rover with W/A/S/D toward any glowing resource crate and press E.',
    rewardScore: 150,
  },
  {
    level: 2,
    act: 'ACT I · THE FOUNDATION',
    title: 'Level 2: The Foundation',
    objective: 'Open Build (B) and construct the Foundation Platform on the core build pad.',
    type: 'build_module',
    moduleId: 'foundation',
    nexusHint: 'Metal anchors our base. Collect 4 Metal if needed, press B, select Foundation Platform, and confirm placement.',
    rewardScore: 200,
  },
  {
    level: 3,
    act: 'ACT I · THE FOUNDATION',
    title: 'Level 3: Structural Framework',
    objective: 'Construct Structural Support to brace the station against Martian ground forces.',
    type: 'build_module',
    moduleId: 'support',
    nexusHint: 'Truss frameworks distribute load across the regolith pad. Build Structural Support next.',
    rewardScore: 220,
  },
  {
    level: 4,
    act: 'ACT I · THE FOUNDATION',
    title: 'Level 4: First Habitat',
    objective: 'Construct the Main Habitat dome so engineers have a pressurized research workspace.',
    type: 'build_module',
    moduleId: 'habitat',
    nexusHint: 'The Main Habitat requires Metal, Energy, Insulation, and Components. Gather scattered pods nearby.',
    rewardScore: 250,
  },

  // LEVELS 5–8: STRUCTURAL DEFENSE
  {
    level: 5,
    act: 'ACT II · STRUCTURAL DEFENSE',
    title: 'Level 5: Seismic Alert',
    objective: 'Visit InSight (northwest) to analyze SEIS Seismic Data and unlock early marsquake warnings.',
    type: 'consult_insight',
    recordId: 'seis',
    nexusHint: 'Approach NASA InSight at (-10.5, -8.5) and press E to analyze SEIS data—giving you advance forecasts and extra warning time before marsquakes hit.',
    rewardScore: 240,
  },
  {
    level: 6,
    act: 'ACT II · STRUCTURAL DEFENSE',
    title: 'Level 6: Structural Upgrade',
    objective: 'Build Equipment Storage OR upgrade Foundation / Structural Support to Level 2.',
    type: 'upgrade_or_build',
    moduleIds: ['foundation', 'support'],
    altBuildId: 'storage',
    minLevel: 2,
    nexusHint: 'Open the Upgrade tab inside Construction (B) to harden your Foundation or Structural Support to LV.2.',
    rewardScore: 260,
  },
  {
    level: 7,
    act: 'ACT II · STRUCTURAL DEFENSE',
    title: 'Level 7: Equipment Protection',
    objective: 'Construct the Seismic Protection System to shield delicate sensors.',
    type: 'build_module',
    moduleId: 'seismic',
    nexusHint: 'Seismic isolation dampers absorb horizontal ground waves before they rattle laboratory instruments.',
    rewardScore: 280,
  },
  {
    level: 8,
    act: 'ACT II · STRUCTURAL DEFENSE',
    title: 'Level 8: Stability Test',
    objective: 'Survive the live Marsquake seismic challenge without losing structural stability.',
    type: 'survive_challenge',
    challengeType: 'marsquake',
    nexusHint: 'Use Engage Seismic Dampers or Weld Emergency Braces in the left Hazard panel when shaking peaks!',
    rewardScore: 340,
  },

  // LEVELS 9–12: ENERGY SYSTEMS
  {
    level: 9,
    act: 'ACT III · ENERGY SYSTEMS',
    title: 'Level 9: First Solar Array',
    objective: 'Construct the Solar Energy Array to begin generating power on Mars.',
    type: 'build_module',
    moduleId: 'solar',
    nexusHint: 'Solar panels convert Elysium sunlight (~585 W/m² peak) into continuous electrical power.',
    rewardScore: 300,
  },
  {
    level: 10,
    act: 'ACT III · ENERGY SYSTEMS',
    title: 'Level 10: Energy Storage',
    objective: 'Construct Battery Storage so the base retains reserve power when sunlight drops.',
    type: 'build_module',
    moduleId: 'battery',
    nexusHint: 'Remember InSight’s lesson: solar output fluctuates when dust rises—store excess power in Battery Storage.',
    rewardScore: 320,
  },
  {
    level: 11,
    act: 'ACT III · ENERGY SYSTEMS',
    title: 'Level 11: Dust Storm Incoming',
    objective: 'Weather the regional Dust Storm while maintaining outpost power reserves.',
    type: 'survive_challenge',
    challengeType: 'dust_storm',
    nexusHint: 'Run Clean Solar Panels or Route Battery Reserve during the storm! Analyzing InSight Solar/Dust data gives you advance storm forecasts.',
    rewardScore: 360,
  },
  {
    level: 12,
    act: 'ACT III · ENERGY SYSTEMS',
    title: 'Level 12: Power Independence',
    objective: 'Upgrade Solar Energy Array or Battery Storage to Level 2 for dust resilience.',
    type: 'upgrade_any',
    moduleIds: ['solar', 'battery'],
    minLevel: 2,
    nexusHint: 'Upgrading Solar Array improves dust resistance; upgrading Battery Storage expands your emergency energy cap.',
    rewardScore: 380,
  },

  // LEVELS 13–16: THERMAL SURVIVAL
  {
    level: 13,
    act: 'ACT IV · THERMAL SURVIVAL',
    title: 'Level 13: Temperature Alert',
    objective: 'Review InSight APSS Atmospheric Data to understand Martian temperature extremes.',
    type: 'consult_insight',
    recordId: 'apss',
    nexusHint: 'Visit InSight or open Science Data to examine APSS temperature & wind telemetry.',
    rewardScore: 320,
  },
  {
    level: 14,
    act: 'ACT IV · THERMAL SURVIVAL',
    title: 'Level 14: Thermal Insulation',
    objective: 'Construct the Thermal Protection System to insulate habitat and electronics.',
    type: 'build_module',
    moduleId: 'thermal',
    nexusHint: 'Gather Insulation containers around the perimeter craters, then deploy the Thermal Protection System.',
    rewardScore: 380,
  },
  {
    level: 15,
    act: 'ACT IV · THERMAL SURVIVAL',
    title: 'Level 15: Thermal Regulation',
    objective: 'Upgrade Thermal Protection System or Main Habitat to Level 2.',
    type: 'upgrade_any',
    moduleIds: ['thermal', 'habitat'],
    minLevel: 2,
    nexusHint: 'Upgrading active thermal shielding reduces heater energy consumption during extreme cold fronts.',
    rewardScore: 400,
  },
  {
    level: 16,
    act: 'ACT IV · THERMAL SURVIVAL',
    title: 'Level 16: Cold Environment Test',
    objective: 'Survive the Extreme Cold Front while keeping thermal integrity above critical.',
    type: 'survive_challenge',
    challengeType: 'extreme_cold',
    nexusHint: 'Use Regulate Thermal Heaters or Deploy Aerogel Baffles in the Hazard panel before frost freezes avionics!',
    rewardScore: 440,
  },

  // LEVELS 17–20: ADVANCED ENGINEERING
  {
    level: 17,
    act: 'ACT V · ADVANCED ENGINEERING',
    title: 'Level 17: Research Laboratory',
    objective: 'Construct the Research Laboratory module to analyze Martian seismic cores.',
    type: 'build_module',
    moduleId: 'lab',
    nexusHint: 'Our Research Lab converts survival into discovery—collect Components and Metal to assemble it.',
    rewardScore: 460,
  },
  {
    level: 18,
    act: 'ACT V · ADVANCED ENGINEERING',
    title: 'Level 18: Communication Network',
    objective: 'Construct the Communication Tower to beam data to orbital satellites.',
    type: 'build_module',
    moduleId: 'comms',
    nexusHint: 'With the Research Lab running, install the Communication Tower on the south telemetry pad.',
    rewardScore: 480,
  },
  {
    level: 19,
    act: 'ACT V · ADVANCED ENGINEERING',
    title: 'Level 19: Combined Environmental Challenge',
    objective: 'Ensure Equipment Storage is built & survive a double Dust Storm + Marsquake crisis!',
    type: 'survive_challenge',
    challengeType: 'dust_storm',
    secondaryQuake: true,
    requireModuleId: 'storage',
    nexusHint: 'Ensure all 10 modules (including Cargo Vault) are built, then respond swiftly to combined dust and shock!',
    rewardScore: 550,
  },
  {
    level: 20,
    act: 'ACT V · FINAL PROTOCOL',
    title: 'Level 20: The Final Mission',
    objective: 'Complete final station evaluation: reach 3+ upgraded modules and pass full systems stress check.',
    type: 'final_evaluation',
    requiredUpgradedCount: 3,
    nexusHint: 'Upgrade at least 3 station modules to LV.2+, keep health/stability/thermal strong, and run Final Station Certification!',
    rewardScore: 1000,
  },
];

export function getLevelDef(levelNum) {
  return LEVELS.find((l) => l.level === levelNum) ?? LEVELS[LEVELS.length - 1];
}
