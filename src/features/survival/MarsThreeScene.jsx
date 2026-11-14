import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { disposeScene } from './disposeScene';
import {
  BUILD_SLOTS,
  INSIGHT_POS,
  PALETTE,
  RESOURCE_BY_ID,
  RESOURCE_COLLECT_RADIUS,
  WORLD_RADIUS,
} from './gameData';
import { getRecommendedGuidance, getRoverProximity } from './gameLogic';

/** Deterministic terrain height keeping central construction basin and InSight deck smooth. */
function sampleTerrainHeight(x, z) {
  const centerDist = Math.hypot(x, z);
  const flatMask = Math.min(1, Math.max(0, (centerDist - 7.5) / 6.0));
  const waves =
    Math.sin(x * 0.19) * Math.cos(z * 0.17) * 0.48 +
    Math.sin(x * 0.43 + z * 0.31) * 0.16;

  // Perimeter Martian ridge mountains outside playable boundary
  const ridge = centerDist > WORLD_RADIUS + 1.5
    ? Math.pow((centerDist - (WORLD_RADIUS + 1.5)) * 0.42, 1.45) +
      Math.sin(Math.atan2(z, x) * 9) * 0.85
    : 0;

  return waves * flatMask + ridge;
}

/** Generate procedural Mars soil texture + bump canvas textures. */
function createMarsTextures() {
  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = 512;
  colorCanvas.height = 512;
  const ctx = colorCanvas.getContext('2d');

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = 512;
  bumpCanvas.height = 512;
  const bCtx = bumpCanvas.getContext('2d');

  ctx.fillStyle = PALETTE.marsRust;
  ctx.fillRect(0, 0, 512, 512);
  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, 512, 512);

  // Subtle wind-swept bands & mineral grit
  for (let i = 0; i < 420; i += 1) {
    const x = (i * 97) % 512;
    const y = (i * 53) % 512;
    const w = 18 + (i % 40);
    const h = 4 + (i % 9);
    ctx.fillStyle = i % 3 === 0 ? 'rgba(122, 48, 39, 0.28)' : i % 3 === 1 ? 'rgba(216, 135, 82, 0.22)' : 'rgba(217, 167, 123, 0.15)';
    ctx.fillRect(x, y, w, h);

    bCtx.fillStyle = i % 2 === 0 ? 'rgba(200,200,200,0.2)' : 'rgba(60,60,60,0.2)';
    bCtx.fillRect(x, y, w, h);
  }

  for (let i = 0; i < 1600; i += 1) {
    const x = (i * 131 + 17) % 512;
    const y = (i * 257 + 41) % 512;
    const r = 1 + (i % 3);
    ctx.fillStyle = i % 2 === 0 ? 'rgba(70, 24, 18, 0.3)' : 'rgba(232, 184, 140, 0.22)';
    ctx.fillRect(x, y, r, r);
  }

  const map = new THREE.CanvasTexture(colorCanvas);
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(7, 7);
  map.colorSpace = THREE.SRGBColorSpace;

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.repeat.set(7, 7);

  return { map, bumpMap };
}

/** Build the 6-wheeled utility Mars rover group with animated wheel & scanner refs. */
function buildRoverMesh() {
  const group = new THREE.Group();

  const whiteMat = new THREE.MeshStandardMaterial({ color: '#E8EEF5', roughness: 0.35, metalness: 0.3 });
  const darkMat = new THREE.MeshStandardMaterial({ color: '#1A2433', roughness: 0.5, metalness: 0.6 });
  const accentMat = new THREE.MeshStandardMaterial({
    color: PALETTE.techBlue,
    emissive: PALETTE.techBlue,
    emissiveIntensity: 0.55,
    roughness: 0.3,
  });
  const cyanGlowMat = new THREE.MeshStandardMaterial({
    color: PALETTE.cyan,
    emissive: PALETTE.cyan,
    emissiveIntensity: 0.9,
  });

  const bodyGroup = new THREE.Group();
  bodyGroup.position.y = 0.62;
  group.add(bodyGroup);

  // Main chassis
  const hull = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.44, 1.7), whiteMat);
  hull.castShadow = true;
  hull.receiveShadow = true;
  bodyGroup.add(hull);

  // Dark upper avionics deck + cyan side rail trim
  const deck = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.14, 1.35), darkMat);
  deck.position.y = 0.28;
  deck.castShadow = true;
  bodyGroup.add(deck);

  const stripeL = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.08, 1.45), accentMat);
  stripeL.position.set(-0.58, 0.05, 0);
  bodyGroup.add(stripeL);
  const stripeR = stripeL.clone();
  stripeR.position.x = 0.58;
  bodyGroup.add(stripeR);

  // Sensor mast + rotating optical head
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.58, 10), darkMat);
  mast.position.set(0.22, 0.56, 0.42);
  mast.castShadow = true;
  bodyGroup.add(mast);

  const sensorHead = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.16, 0.24), whiteMat);
  sensorHead.position.set(0.22, 0.88, 0.44);
  sensorHead.castShadow = true;
  const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.08, 10), cyanGlowMat);
  lens.rotation.x = Math.PI / 2;
  lens.position.set(0, 0, 0.12);
  sensorHead.add(lens);
  bodyGroup.add(sensorHead);

  // Resource collector scoop / arm on rear-left
  const arm = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.55), accentMat);
  arm.position.set(-0.32, 0.42, 0.55);
  bodyGroup.add(arm);

  // Headlights
  const headMat = new THREE.MeshStandardMaterial({
    color: '#FFFFFF',
    emissive: '#B8F6FF',
    emissiveIntensity: 1.4,
  });
  const hl1 = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.1, 0.06), headMat);
  hl1.position.set(-0.32, 0.02, 0.86);
  bodyGroup.add(hl1);
  const hl2 = hl1.clone();
  hl2.position.x = 0.32;
  bodyGroup.add(hl2);

  // Soft headlight pool
  const headlight = new THREE.PointLight('#9CEBFF', 1.6, 8.5, 1.8);
  headlight.position.set(0, 0.45, 1.3);
  bodyGroup.add(headlight);

  // 6 wheels mounted along rocker-bogie suspension
  const wheels = [];
  const wheelGeo = new THREE.CylinderGeometry(0.27, 0.27, 0.22, 16);
  wheelGeo.rotateZ(Math.PI / 2);
  const hubGeo = new THREE.CylinderGeometry(0.11, 0.11, 0.24, 10);
  hubGeo.rotateZ(Math.PI / 2);

  const wheelPositions = [
    [-0.74, 0.27, 0.65],
    [0.74, 0.27, 0.65],
    [-0.78, 0.27, 0.0],
    [0.78, 0.27, 0.0],
    [-0.74, 0.27, -0.65],
    [0.74, 0.27, -0.65],
  ];
  for (const [wx, wy, wz] of wheelPositions) {
    const pivot = new THREE.Group();
    pivot.position.set(wx, wy, wz);
    const tire = new THREE.Mesh(wheelGeo, darkMat);
    tire.castShadow = true;
    const hub = new THREE.Mesh(hubGeo, accentMat);
    const tread = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.56, 0.06), whiteMat);
    tire.add(tread);
    pivot.add(tire, hub);
    group.add(pivot);
    wheels.push({ pivot, tire, isFront: wz > 0.3 });
  }

  // Tractor collection pulse ring
  const collectRing = new THREE.Mesh(
    new THREE.RingGeometry(1.1, 1.35, 28),
    new THREE.MeshBasicMaterial({ color: PALETTE.cyan, side: THREE.DoubleSide, transparent: true, opacity: 0 })
  );
  collectRing.rotation.x = -Math.PI / 2;
  collectRing.position.y = 0.06;
  group.add(collectRing);

  return { group, bodyGroup, sensorHead, wheels, collectRing };
}

/** Build recognizable NASA InSight Lander 3D scientific monument. */
function buildInsightLanderMesh() {
  const group = new THREE.Group();
  const goldFoil = new THREE.MeshStandardMaterial({ color: '#D4A84A', roughness: 0.35, metalness: 0.72 });
  const darkMetal = new THREE.MeshStandardMaterial({ color: '#1E293B', roughness: 0.55, metalness: 0.6 });
  const solarMat = new THREE.MeshStandardMaterial({ color: '#1E3A6E', roughness: 0.28, metalness: 0.45 });
  const domeMat = new THREE.MeshStandardMaterial({ color: '#E2E8F0', roughness: 0.4, metalness: 0.25 });

  // Deck
  const deck = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.15, 0.38, 8), goldFoil);
  deck.position.y = 0.72;
  deck.castShadow = true;
  deck.receiveShadow = true;
  group.add(deck);

  // 3 Lander legs
  for (let i = 0; i < 3; i += 1) {
    const ang = (i * Math.PI * 2) / 3 + 0.4;
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.85, 8), darkMetal);
    leg.position.set(Math.cos(ang) * 0.95, 0.36, Math.sin(ang) * 0.95);
    leg.rotation.z = Math.cos(ang) * 0.35;
    leg.rotation.x = -Math.sin(ang) * 0.35;
    leg.castShadow = true;
    group.add(leg);
  }

  // Two signature circular solar arrays
  for (const side of [-1, 1]) {
    const wing = new THREE.Mesh(new THREE.CylinderGeometry(1.18, 1.18, 0.05, 24), solarMat);
    wing.position.set(side * 2.05, 0.82, 0);
    wing.castShadow = true;
    const rim = new THREE.Mesh(new THREE.TorusGeometry(1.18, 0.03, 6, 24), goldFoil);
    rim.rotation.x = Math.PI / 2;
    wing.add(rim);
    group.add(wing);

    const strut = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.08, 0.12), darkMetal);
    strut.position.set(side * 1.3, 0.78, 0);
    group.add(strut);
  }

  // SEIS Wind & Thermal Shield Dome deployed on Mars soil beside InSight
  const seisDome = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.42, 0.34, 16), domeMat);
  seisDome.position.set(0.65, 0.18, 1.35);
  seisDome.castShadow = true;
  group.add(seisDome);

  // Interaction ground ring
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(2.6, 2.88, 36),
    new THREE.MeshBasicMaterial({ color: PALETTE.cyan, side: THREE.DoubleSide, transparent: true, opacity: 0.45 })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.05;
  group.add(ring);

  return { group, ring };
}

/** Build each of the 10 distinct 3D station modules. */
function buildStationModuleMesh(moduleId) {
  const root = new THREE.Group();
  const hullMat = new THREE.MeshStandardMaterial({ color: '#E8EFF7', roughness: 0.38, metalness: 0.28 });
  const darkMat = new THREE.MeshStandardMaterial({ color: '#1F2B3E', roughness: 0.48, metalness: 0.62 });
  const steelMat = new THREE.MeshStandardMaterial({ color: '#7D8FA3', roughness: 0.4, metalness: 0.68 });
  const cyanMat = new THREE.MeshStandardMaterial({
    color: PALETTE.cyan,
    emissive: PALETTE.cyan,
    emissiveIntensity: 0.65,
  });
  const warmAmberMat = new THREE.MeshStandardMaterial({
    color: PALETTE.warning,
    emissive: PALETTE.warning,
    emissiveIntensity: 0.55,
  });

  let solarWingMat = null;
  let rotatingPart = null;

  if (moduleId === 'foundation') {
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(2.35, 2.55, 0.28, 8), darkMat);
    pad.position.y = 0.14;
    pad.receiveShadow = true;
    pad.castShadow = true;
    const trim = new THREE.Mesh(new THREE.TorusGeometry(2.3, 0.06, 6, 8), cyanMat);
    trim.rotation.x = Math.PI / 2;
    trim.position.y = 0.28;
    root.add(pad, trim);
  } else if (moduleId === 'support') {
    const base = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.22, 2.4), darkMat);
    base.position.y = 0.11;
    root.add(base);
    for (const [px, pz] of [[-0.95, -0.95], [0.95, -0.95], [-0.95, 0.95], [0.95, 0.95]]) {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 1.9, 8), steelMat);
      col.position.set(px, 1.05, pz);
      col.castShadow = true;
      root.add(col);
    }
    const crown = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.2, 2.2), hullMat);
    crown.position.y = 2.02;
    crown.castShadow = true;
    root.add(crown);
  } else if (moduleId === 'habitat') {
    const plinth = new THREE.Mesh(new THREE.CylinderGeometry(1.75, 1.85, 0.35, 16), darkMat);
    plinth.position.y = 0.18;
    const wall = new THREE.Mesh(new THREE.CylinderGeometry(1.55, 1.62, 1.05, 16), hullMat);
    wall.position.y = 0.88;
    wall.castShadow = true;
    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(1.55, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2),
      hullMat
    );
    dome.position.y = 1.4;
    dome.castShadow = true;
    const airlock = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.85, 1.15), darkMat);
    airlock.position.set(0, 0.6, 1.65);
    airlock.castShadow = true;
    const winRing = new THREE.Mesh(new THREE.CylinderGeometry(1.58, 1.58, 0.18, 16), cyanMat);
    winRing.position.y = 1.02;
    root.add(plinth, wall, dome, airlock, winRing);
  } else if (moduleId === 'solar') {
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.28, 1.35, 10), darkMat);
    mast.position.y = 0.68;
    mast.castShadow = true;
    solarWingMat = new THREE.MeshStandardMaterial({ color: '#1F5FA8', roughness: 0.25, metalness: 0.5 });
    const panelL = new THREE.Mesh(new THREE.BoxGeometry(1.95, 0.08, 1.45), solarWingMat);
    panelL.position.set(-1.12, 1.4, 0);
    panelL.rotation.x = 0.34;
    panelL.castShadow = true;
    const panelR = panelL.clone();
    panelR.position.x = 1.12;
    root.add(mast, panelL, panelR);
  } else if (moduleId === 'battery') {
    const base = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.25, 1.9), darkMat);
    base.position.y = 0.12;
    root.add(base);
    for (const bx of [-0.78, 0, 0.78]) {
      const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 1.45, 14), steelMat);
      tank.position.set(bx, 0.95, 0);
      tank.castShadow = true;
      const chargeBand = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.25, 14), cyanMat);
      chargeBand.position.set(bx, 1.25, 0);
      root.add(tank, chargeBand);
    }
  } else if (moduleId === 'lab') {
    const base = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.65, 1.25, 8), hullMat);
    base.position.y = 0.65;
    base.castShadow = true;
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.45, 0.55, 8), darkMat);
    cap.position.y = 1.52;
    const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.35, 12, 10), cyanMat);
    beacon.position.y = 1.92;
    root.add(base, cap, beacon);
  } else if (moduleId === 'comms') {
    const base = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.4, 1.6), darkMat);
    base.position.y = 0.2;
    const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.38, 2.75, 6), steelMat);
    tower.position.y = 1.6;
    tower.castShadow = true;
    const dishGroup = new THREE.Group();
    dishGroup.position.y = 3.05;
    const dish = new THREE.Mesh(
      new THREE.CylinderGeometry(0.95, 0.22, 0.42, 16),
      hullMat
    );
    dish.rotation.x = 0.85;
    dish.castShadow = true;
    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 8), cyanMat);
    tip.position.set(0, 0.25, 0.35);
    dishGroup.add(dish, tip);
    rotatingPart = dishGroup;
    root.add(base, tower, dishGroup);
  } else if (moduleId === 'thermal') {
    const core = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.85, 1.45), darkMat);
    core.position.y = 0.44;
    core.castShadow = true;
    root.add(core);
    for (let i = -2; i <= 2; i += 1) {
      const fin = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.55, 1.2), warmAmberMat);
      fin.position.set(i * 0.38, 1.25, 0);
      fin.castShadow = true;
      root.add(fin);
    }
  } else if (moduleId === 'seismic') {
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.6, 0.35, 12), steelMat);
    pad.position.y = 0.18;
    const sphere = new THREE.Mesh(new THREE.IcosahedronGeometry(0.65, 1), darkMat);
    sphere.position.y = 1.05;
    sphere.castShadow = true;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.92, 0.07, 8, 20), cyanMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 1.05;
    root.add(pad, sphere, ring);
  } else {
    // equipment storage bunker
    const bunker = new THREE.Mesh(new THREE.BoxGeometry(2.1, 1.05, 1.6), steelMat);
    bunker.position.y = 0.55;
    bunker.castShadow = true;
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(2.14, 0.18, 1.64), warmAmberMat);
    stripe.position.y = 0.86;
    root.add(bunker, stripe);
  }

  // Upgrade Shield Ring (visible only when level >= 2)
  const upgradeRing = new THREE.Mesh(
    new THREE.TorusGeometry(1.85, 0.05, 6, 28),
    new THREE.MeshBasicMaterial({ color: PALETTE.success, transparent: true, opacity: 0.75 })
  );
  upgradeRing.rotation.x = Math.PI / 2;
  upgradeRing.position.y = 0.12;
  upgradeRing.visible = false;
  root.add(upgradeRing);

  return { root, solarWingMat, rotatingPart, upgradeRing };
}

/** Build collectible resource pod mesh by resource type. */
function buildResourceNodeMesh(type) {
  const group = new THREE.Group();
  const meta = RESOURCE_BY_ID[type];
  const color = meta?.color ?? PALETTE.cyan;

  if (type === 'energy') {
    const crystal = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.45, 0),
      new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.85,
        roughness: 0.2,
      })
    );
    crystal.position.y = 0.62;
    crystal.castShadow = true;
    group.add(crystal);
  } else if (type === 'insulation') {
    const drum = new THREE.Mesh(
      new THREE.CylinderGeometry(0.38, 0.38, 0.72, 12),
      new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.3,
        roughness: 0.35,
      })
    );
    drum.position.y = 0.52;
    drum.castShadow = true;
    group.add(drum);
  } else if (type === 'components') {
    const box = new THREE.Mesh(
      new THREE.BoxGeometry(0.68, 0.58, 0.68),
      new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.42,
        roughness: 0.3,
      })
    );
    box.position.y = 0.5;
    box.castShadow = true;
    group.add(box);
  } else {
    // metal hex ingot container
    const ingot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.42, 0.48, 0.52, 6),
      new THREE.MeshStandardMaterial({
        color,
        emissive: '#3B4D63',
        emissiveIntensity: 0.3,
        metalness: 0.72,
        roughness: 0.32,
      })
    );
    ingot.position.y = 0.46;
    ingot.castShadow = true;
    group.add(ingot);
  }

  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.75, 0.92, 20),
    new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, transparent: true, opacity: 0.55 })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.06;
  group.add(ring);

  return { group, ring };
}

export default function MarsThreeScene({
  gameStateRef,
  selectedBuildModuleId,
  onSelectSlot,
  onClickResourceNode,
  onClickInsight,
  cameraControlRef,
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [webglError, setWebglError] = useState(false);

  const selectedBuildRef = useRef(selectedBuildModuleId);
  useEffect(() => {
    selectedBuildRef.current = selectedBuildModuleId;
  }, [selectedBuildModuleId]);

  const callbacksRef = useRef({ onSelectSlot, onClickResourceNode, onClickInsight });
  useEffect(() => {
    callbacksRef.current = { onSelectSlot, onClickResourceNode, onClickInsight };
  }, [onSelectSlot, onClickResourceNode, onClickInsight]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return undefined;

    let renderer = null;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    } catch {
      const errTimer = setTimeout(() => setWebglError(true), 0);
      return () => clearTimeout(errTimer);
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(container.clientWidth, container.clientHeight, false);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;

    const scene = new THREE.Scene();
    const fogColorBase = new THREE.Color('#6E2E24');
    const fogColorStorm = new THREE.Color('#B85C38');
    const fogColorCold = new THREE.Color('#1B2F4A');
    const fog = new THREE.FogExp2('#6E2E24', 0.011);
    scene.fog = fog;
    scene.background = new THREE.Color('#1B1117');

    // Narrow-FOV 3D Isometric Camera
    const camera = new THREE.PerspectiveCamera(
      34,
      Math.max(1, container.clientWidth) / Math.max(1, container.clientHeight),
      0.5,
      180
    );

    // Lighting
    const hemiLight = new THREE.HemisphereLight('#FFD8B5', '#4A1D16', 0.9);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight('#FFC999', 2.35);
    sunLight.position.set(22, 28, 16);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 2;
    sunLight.shadow.camera.far = 90;
    const d = 28;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    scene.add(sunLight);

    // Mars Terrain Mesh
    const { map: marsMap, bumpMap: marsBump } = createMarsTextures();
    const terrainGeo = new THREE.PlaneGeometry(86, 86, 72, 72);
    terrainGeo.rotateX(-Math.PI / 2);
    const posAttr = terrainGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i += 1) {
      const vx = posAttr.getX(i);
      const vz = posAttr.getZ(i);
      posAttr.setY(i, sampleTerrainHeight(vx, vz));
    }
    terrainGeo.computeVertexNormals();

    const terrainMat = new THREE.MeshStandardMaterial({
      map: marsMap,
      bumpMap: marsBump,
      bumpScale: 0.28,
      roughness: 0.92,
      metalness: 0.04,
    });
    const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
    terrainMesh.receiveShadow = true;
    scene.add(terrainMesh);

    // Central Station Construction Pad Ring
    const padRing = new THREE.Mesh(
      new THREE.RingGeometry(6.8, 7.1, 48),
      new THREE.MeshBasicMaterial({ color: PALETTE.techBlue, side: THREE.DoubleSide, transparent: true, opacity: 0.35 })
    );
    padRing.rotation.x = -Math.PI / 2;
    padRing.position.y = 0.04;
    scene.add(padRing);

    // Perimeter Martian boulders
    const rockGeo = new THREE.DodecahedronGeometry(0.65, 0);
    const rockMat = new THREE.MeshStandardMaterial({ color: '#6E2B22', roughness: 0.9 });
    for (let i = 0; i < 24; i += 1) {
      const ang = (i * 2.399) % (Math.PI * 2);
      const dist = 10 + ((i * 3.7) % 16);
      const rx = Math.cos(ang) * dist;
      const rz = Math.sin(ang) * dist;
      if (Math.hypot(rx, rz) < 7.8) continue;
      const rock = new THREE.Mesh(rockGeo, rockMat);
      const sc = 0.55 + (i % 4) * 0.35;
      rock.scale.set(sc * 1.2, sc * 0.75, sc);
      rock.position.set(rx, sampleTerrainHeight(rx, rz) + sc * 0.22, rz);
      rock.rotation.set(i * 0.5, i * 1.1, 0);
      rock.castShadow = true;
      rock.receiveShadow = true;
      scene.add(rock);
    }

    // Build Slot Markers (clickable in build mode)
    const slotMeshes = [];
    const slotGroup = new THREE.Group();
    scene.add(slotGroup);
    for (const slot of BUILD_SLOTS) {
      const marker = new THREE.Mesh(
        new THREE.RingGeometry(1.4, 1.75, 24),
        new THREE.MeshBasicMaterial({
          color: PALETTE.cyan,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.18,
        })
      );
      marker.rotation.x = -Math.PI / 2;
      marker.position.set(slot.x, 0.05, slot.z);
      marker.userData = { kind: 'slot', slotIndex: slot.index };
      slotGroup.add(marker);
      slotMeshes.push(marker);
    }

    // Preview Hologram for Build Mode
    const previewMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(1.65, 1.75, 1.2, 12),
      new THREE.MeshBasicMaterial({
        color: PALETTE.success,
        wireframe: true,
        transparent: true,
        opacity: 0.75,
      })
    );
    previewMesh.visible = false;
    scene.add(previewMesh);

    // NASA InSight Lander + Guidance Beacon
    const insight = buildInsightLanderMesh();
    insight.group.position.set(INSIGHT_POS.x, sampleTerrainHeight(INSIGHT_POS.x, INSIGHT_POS.z), INSIGHT_POS.z);
    insight.group.traverse((child) => {
      child.userData = { kind: 'insight' };
    });
    scene.add(insight.group);

    const insightBeacon = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 1.4, 7, 16, 1, true),
      new THREE.MeshBasicMaterial({
        color: PALETTE.cyan,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
      })
    );
    insightBeacon.position.set(INSIGHT_POS.x, sampleTerrainHeight(INSIGHT_POS.x, INSIGHT_POS.z) + 3.5, INSIGHT_POS.z);
    scene.add(insightBeacon);

    // Player 6-Wheeled Rover
    const roverRig = buildRoverMesh();
    scene.add(roverRig.group);

    // Atmospheric Dust Particles
    const particleCount = 460;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i += 1) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 60;
      particlePositions[i * 3 + 1] = Math.random() * 8 + 0.4;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 60;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: '#F3B486',
      size: 0.18,
      transparent: true,
      opacity: 0.5,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Dynamic Node & Module pools
    const nodeMeshes = new Map();
    const moduleMeshes = new Map();

    // Camera Orbit/Follow State
    const camState = {
      panX: 0,
      panZ: 0,
      zoom: 22,
      followRover: true,
      isDragging: false,
      lastX: 0,
      lastY: 0,
      focusTargetX: 0,
      focusTargetZ: 0,
    };

    if (cameraControlRef) {
      cameraControlRef.current = {
        zoomIn: () => {
          camState.zoom = Math.max(12, camState.zoom - 3.5);
        },
        zoomOut: () => {
          camState.zoom = Math.min(36, camState.zoom + 3.5);
        },
        resetFollow: () => {
          camState.followRover = true;
          camState.panX = 0;
          camState.panZ = 0;
        },
      };
    }

    // Raycaster & Desktop + Mobile Multi-Touch Camera Controls
    const raycaster = new THREE.Raycaster();
    const pointerNdc = new THREE.Vector2();
    let hoveredSlotIndex = null;
    const activePointers = new Map();
    let touchTapCandidate = null;
    let lastPinchDist = null;

    const updatePointer = (clientX, clientY) => {
      const rect = canvas.getBoundingClientRect();
      pointerNdc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointerNdc.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    };

    const runRaycastPick = (clientX, clientY) => {
      updatePointer(clientX, clientY);
      raycaster.setFromCamera(pointerNdc, camera);

      if (selectedBuildRef.current) {
        const slotHits = raycaster.intersectObjects(slotMeshes, false);
        if (slotHits.length > 0) {
          callbacksRef.current.onSelectSlot?.(slotHits[0].object.userData.slotIndex);
          return;
        }
      }

      const insightHits = raycaster.intersectObject(insight.group, true);
      if (insightHits.length > 0) {
        callbacksRef.current.onClickInsight?.();
        return;
      }

      const nodeObjects = Array.from(nodeMeshes.values()).map((n) => n.group);
      const nodeHits = raycaster.intersectObjects(nodeObjects, true);
      if (nodeHits.length > 0) {
        let cur = nodeHits[0].object;
        while (cur && cur.userData.nodeId == null) cur = cur.parent;
        if (cur?.userData.nodeId != null) {
          callbacksRef.current.onClickResourceNode?.(cur.userData.nodeId);
        }
      }
    };

    const getPinchDistance = () => {
      const pts = Array.from(activePointers.values());
      if (pts.length < 2) return null;
      return Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
    };

    const onPointerDown = (e) => {
      activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY, type: e.pointerType });

      if (e.pointerType === 'touch') {
        if (activePointers.size === 1) {
          touchTapCandidate = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: false };
          camState.lastX = e.clientX;
          camState.lastY = e.clientY;
        } else if (activePointers.size === 2) {
          touchTapCandidate = null;
          camState.isDragging = false;
          lastPinchDist = getPinchDistance();
        }
        return;
      }

      if (e.button === 1 || e.button === 2 || e.shiftKey) {
        camState.isDragging = true;
        camState.followRover = false;
        camState.lastX = e.clientX;
        camState.lastY = e.clientY;
        return;
      }

      runRaycastPick(e.clientX, e.clientY);
    };

    const onPointerMove = (e) => {
      if (activePointers.has(e.pointerId)) {
        activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY, type: e.pointerType });
      }

      if (e.pointerType === 'touch') {
        if (activePointers.size === 2) {
          const nextDist = getPinchDistance();
          if (nextDist != null && lastPinchDist != null) {
            const delta = lastPinchDist - nextDist;
            camState.zoom = Math.max(12, Math.min(36, camState.zoom + delta * 0.05));
          }
          lastPinchDist = nextDist;
          return;
        }

        if (activePointers.size === 1 && touchTapCandidate?.id === e.pointerId) {
          const distFromStart = Math.hypot(e.clientX - touchTapCandidate.x, e.clientY - touchTapCandidate.y);
          if (distFromStart > 8) {
            touchTapCandidate.moved = true;
            camState.isDragging = true;
            camState.followRover = false;
          }
        }
      }

      if (camState.isDragging) {
        const dx = e.clientX - camState.lastX;
        const dy = e.clientY - camState.lastY;
        camState.lastX = e.clientX;
        camState.lastY = e.clientY;
        camState.panX = Math.max(-20, Math.min(20, camState.panX - (dx + dy) * 0.025));
        camState.panZ = Math.max(-20, Math.min(20, camState.panZ + (dx - dy) * 0.025));
        return;
      }

      if (selectedBuildRef.current) {
        updatePointer(e.clientX, e.clientY);
        raycaster.setFromCamera(pointerNdc, camera);
        const hits = raycaster.intersectObjects(slotMeshes, false);
        hoveredSlotIndex = hits.length > 0 ? hits[0].object.userData.slotIndex : null;
      } else {
        hoveredSlotIndex = null;
      }
    };

    const onPointerUp = (e) => {
      if (
        e.pointerType === 'touch' &&
        touchTapCandidate?.id === e.pointerId &&
        !touchTapCandidate.moved
      ) {
        runRaycastPick(e.clientX, e.clientY);
      }
      activePointers.delete(e.pointerId);
      if (activePointers.size < 2) lastPinchDist = null;
      if (activePointers.size === 0) {
        camState.isDragging = false;
        touchTapCandidate = null;
      }
    };

    const onWheel = (e) => {
      e.preventDefault();
      camState.zoom = Math.max(12, Math.min(36, camState.zoom + Math.sign(e.deltaY) * 2.2));
    };

    const onContextMenu = (e) => e.preventDefault();

    canvas.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('contextmenu', onContextMenu);

    const onResize = () => {
      if (!container || !renderer) return;
      const w = Math.max(1, container.clientWidth);
      const h = Math.max(1, container.clientHeight);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };
    window.addEventListener('resize', onResize);
    const resizeObserver = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(onResize) : null;
    resizeObserver?.observe(container);

    // Main Render Loop synchronizing cleanly with gameStateRef
    let rafId = 0;
    let clockTime = 0;
    let lastTime = performance.now();

    const animate = (now) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;
      clockTime += dt;

      const st = gameStateRef.current;
      const prox = getRoverProximity(st);
      const guidance = getRecommendedGuidance(st, prox);

      // Guidance illumination in 3D scene
      insightBeacon.material.opacity = guidance.highlightInsight
        ? 0.18 + Math.sin(clockTime * 4) * 0.1
        : 0;
      padRing.material.opacity = guidance.highlightBuild
        ? 0.68 + Math.sin(clockTime * 4.5) * 0.22
        : 0.35;
      padRing.material.color.set(guidance.highlightBuild ? PALETTE.warning : PALETTE.techBlue);

      // Sync Rover position, wheel rotation & suspension bounce
      const rx = st.rover.x;
      const rz = st.rover.z;
      const ry = sampleTerrainHeight(rx, rz);
      roverRig.group.position.set(rx, ry, rz);
      roverRig.group.rotation.y = st.rover.heading;
      roverRig.bodyGroup.position.y =
        0.62 + (Math.abs(st.rover.speed) > 0.3 ? Math.sin(clockTime * 14) * 0.025 : 0);
      roverRig.sensorHead.rotation.y = Math.sin(clockTime * 1.4) * 0.45;

      for (const w of roverRig.wheels) {
        w.tire.rotation.x = st.rover.wheelSpin;
        if (w.isFront) {
          w.pivot.rotation.y = Math.max(-0.35, Math.min(0.35, st.rover.turnSpeed * 0.14));
        }
      }
      roverRig.collectRing.material.opacity = st.rover.collectingPulse * 0.85;
      const ringScale = 1 + (1 - st.rover.collectingPulse) * 1.4;
      roverRig.collectRing.scale.set(ringScale, ringScale, 1);

      // Sync Resource Pickups
      const activeIds = new Set(st.nodes.map((n) => n.id));
      for (const [id, entry] of nodeMeshes.entries()) {
        if (!activeIds.has(id)) {
          scene.remove(entry.group);
          disposeScene(entry.group);
          nodeMeshes.delete(id);
        }
      }
      for (const node of st.nodes) {
        let entry = nodeMeshes.get(node.id);
        if (!entry) {
          entry = buildResourceNodeMesh(node.type);
          entry.group.traverse((child) => {
            child.userData = { nodeId: node.id };
          });
          scene.add(entry.group);
          nodeMeshes.set(node.id, entry);
        }
        const ny = sampleTerrainHeight(node.x, node.z);
        entry.group.position.set(node.x, ny + Math.sin(clockTime * 2.2 + node.bobSeed) * 0.14, node.z);
        entry.group.rotation.y = clockTime * 1.1 + node.bobSeed;
        const near = Math.hypot(rx - node.x, rz - node.z) <= RESOURCE_COLLECT_RADIUS;
        const isRecommendedNode =
          guidance.highlightResources &&
          (!guidance.neededResource || guidance.neededResource === node.type);
        entry.ring.material.opacity = near
          ? 0.94
          : isRecommendedNode
          ? 0.65 + Math.sin(clockTime * 5 + node.bobSeed) * 0.22
          : 0.32;
        const rScale = near
          ? 1.25 + Math.sin(clockTime * 6) * 0.1
          : isRecommendedNode
          ? 1.12 + Math.sin(clockTime * 4 + node.bobSeed) * 0.08
          : 1;
        entry.ring.scale.set(rScale, rScale, 1);
      }

      // Sync 10 Station Modules
      for (const [modId, mod] of Object.entries(st.modules)) {
        let built = moduleMeshes.get(modId);
        if (!built) {
          built = buildStationModuleMesh(modId);
          const slot = BUILD_SLOTS[mod.slotIndex] ?? BUILD_SLOTS[0];
          built.root.position.set(slot.x, sampleTerrainHeight(slot.x, slot.z), slot.z);
          scene.add(built.root);
          moduleMeshes.set(modId, built);
        }
        const scaleY = Math.max(0.08, mod.buildProgress);
        built.root.scale.set(1, scaleY, 1);
        built.upgradeRing.visible = mod.level >= 2;
        built.upgradeRing.material.color.set(mod.level >= 3 ? PALETTE.cyan : PALETTE.success);

        if (built.rotatingPart) {
          built.rotatingPart.rotation.y += dt * 0.65;
        }
        if (built.solarWingMat) {
          const dustMix = Math.min(1, st.missionStats.dustOnSolar / 85);
          built.solarWingMat.color.set('#1F5FA8').lerp(new THREE.Color('#B86D42'), dustMix * 0.85);
        }
      }

      // Build Mode Slot Highlight & Hologram Preview
      const isBuildMode = Boolean(selectedBuildRef.current);
      const occupiedSlots = new Set(Object.values(st.modules).map((m) => m.slotIndex));
      for (const marker of slotMeshes) {
        const idx = marker.userData.slotIndex;
        const isFree = !occupiedSlots.has(idx);
        marker.visible = isBuildMode || !isFree;
        if (isBuildMode) {
          marker.material.color.set(isFree ? (hoveredSlotIndex === idx ? PALETTE.success : PALETTE.cyan) : PALETTE.danger);
          marker.material.opacity = isFree ? (hoveredSlotIndex === idx ? 0.95 : 0.55) : 0.25;
        } else {
          marker.material.color.set(PALETTE.techBlue);
          marker.material.opacity = 0.22;
        }
      }

      if (isBuildMode && hoveredSlotIndex != null && !occupiedSlots.has(hoveredSlotIndex)) {
        const slot = BUILD_SLOTS[hoveredSlotIndex];
        previewMesh.visible = true;
        previewMesh.position.set(slot.x, sampleTerrainHeight(slot.x, slot.z) + 0.65, slot.z);
        previewMesh.rotation.y = clockTime * 1.4;
      } else {
        previewMesh.visible = false;
      }

      // InSight Proximity Glow
      const nearInsight = Math.hypot(rx - INSIGHT_POS.x, rz - INSIGHT_POS.z) <= 4.2;
      insight.ring.material.opacity = nearInsight ? 0.88 + Math.sin(clockTime * 6) * 0.1 : 0.38;

      // Dynamic Environmental Challenge Visuals
      const evt = st.eventState.active;
      let targetFogColor = fogColorBase;
      let targetFogDensity = 0.011;
      let windSpeed = 1.4;
      let shakeX = 0;
      let shakeY = 0;

      if (evt) {
        const activeMult = evt.phase === 'active' ? 1 : 0.45;
        if (evt.type === 'dust_storm') {
          targetFogColor = fogColorStorm;
          targetFogDensity = 0.014 + activeMult * 0.019;
          windSpeed = 7.5 + activeMult * 12;
          particleMat.color.set('#E39A68');
          particleMat.opacity = 0.85;
        } else if (evt.type === 'extreme_cold') {
          targetFogColor = fogColorCold;
          targetFogDensity = 0.013 + activeMult * 0.011;
          windSpeed = 3.0;
          particleMat.color.set('#BFE9FF');
          particleMat.opacity = 0.72;
        } else if (evt.type === 'marsquake' || evt.secondaryQuake) {
          const amp = evt.phase === 'active' ? 0.18 : 0.05;
          shakeX = Math.sin(clockTime * 42) * amp;
          shakeY = Math.cos(clockTime * 37) * (amp * 0.65);
          particleMat.color.set('#D88752');
          particleMat.opacity = 0.65;
        }
      } else {
        particleMat.color.set('#F3B486');
        particleMat.opacity = 0.45;
      }

      fog.color.lerp(targetFogColor, Math.min(1, dt * 2.5));
      fog.density += (targetFogDensity - fog.density) * Math.min(1, dt * 2.5);
      sunLight.intensity += ((evt?.type === 'dust_storm' && evt.phase === 'active' ? 1.35 : 2.35) - sunLight.intensity) * Math.min(1, dt * 2);

      // Update Wind Dust / Frost Particles
      const pArr = particleGeo.attributes.position.array;
      for (let i = 0; i < particleCount; i += 1) {
        pArr[i * 3] += dt * windSpeed;
        if (pArr[i * 3] > 30) pArr[i * 3] = -30;
      }
      particleGeo.attributes.position.needsUpdate = true;

      // Camera Positioning (Cinematic Orbit on Main Menu vs Isometric Follow/Pan during Play)
      if (st.screen === 'menu') {
        const orbitAngle = clockTime * 0.16;
        camera.position.set(
          Math.cos(orbitAngle) * 24,
          17,
          Math.sin(orbitAngle) * 24
        );
        camera.lookAt(0, 0.8, 0);
      } else {
        const desiredX = isBuildMode ? 0 : camState.followRover ? rx : camState.panX;
        const desiredZ = isBuildMode ? 0 : camState.followRover ? rz : camState.panZ;
        camState.focusTargetX += (desiredX - camState.focusTargetX) * Math.min(1, dt * 6);
        camState.focusTargetZ += (desiredZ - camState.focusTargetZ) * Math.min(1, dt * 6);

        const isoOffset = camState.zoom * 0.72;
        const isoHeight = camState.zoom * 0.78;
        camera.position.set(
          camState.focusTargetX + isoOffset + shakeX,
          isoHeight + shakeY,
          camState.focusTargetZ + isoOffset
        );
        camera.lookAt(camState.focusTargetX + shakeX, 0.4, camState.focusTargetZ + shakeY);
      }

      renderer.render(scene, camera);
      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
      canvas.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('contextmenu', onContextMenu);
      window.removeEventListener('resize', onResize);
      resizeObserver?.disconnect();
      disposeScene(scene);
      renderer.dispose();
    };
  }, [gameStateRef, cameraControlRef]);

  return (
    <div ref={containerRef} className="relative w-full h-full bg-[#1B1117]">
      <canvas
        ref={canvasRef}
        aria-label="Three.js 3D isometric Mars survival environment"
        className="w-full h-full block touch-none cursor-grab active:cursor-grabbing"
      />
      {webglError && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#101827] text-[#F4F7FA] p-6 text-center">
          <p className="font-mono text-sm">
            WebGL 3D rendering is unavailable in this browser context. Tactical simulation state remains active via HUD controls.
          </p>
        </div>
      )}
    </div>
  );
}
