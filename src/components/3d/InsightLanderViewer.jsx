import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { Eye, EyeOff, Pause, Play, RotateCcw, SunMedium } from 'lucide-react';
import { disposeScene } from '../../features/survival/disposeScene';

const STOWED_MODEL_PATH = '/models/insight-stowed.glb';
const PANELS_STOWED_MODEL_PATH = '/models/insight-panels-stowed.glb';
const PANELS_DEPLOYED_MODEL_PATH = '/models/insight-panels-deployed.glb';
const ARM_DEPLOYED_MODEL_PATH = '/models/insight-arm-deployed.glb';
const DRACO_DECODER_PATH = '/draco/';

// Footpads of the articulated lander models rest flush on y = 0 Mars regolith
const GROUND_LEVEL_Y = 0.635;
const DECK_CENTER_Z = 0.12512;

const PHASE_STOPS = [
  { id: 'stowed', label: 'Stowed', shortLabel: 'Stow', target: 0.08 },
  { id: 'touchdown', label: 'Touchdown', shortLabel: 'Land', target: 0.24 },
  { id: 'panels', label: 'Solar Wings', shortLabel: 'Solar', target: 0.55 },
  { id: 'arm', label: 'Arm Deployed', shortLabel: 'Arm', target: 1.0 },
];

const ATMOSPHERE_ORDER = ['twilight', 'midday', 'sunset', 'storm', 'night'];

const ATMOSPHERE_PRESETS = {
  twilight: {
    label: 'Twilight',
    zenith: '#040814',
    mid: '#1c1522',
    horizon: '#8e4a2e',
    ground: '#2c1712',
    fogColor: '#3a2018',
    fogDensity: 0.014,
    starOpacity: 0.72,
    dustOpacity: 0.45,
    sunColor: '#ffd3a8',
    sunIntensity: 2.9,
    sunPos: [10, 12, 8],
    hemiSky: '#9ec2f0',
    hemiGround: '#964b2c',
    hemiIntensity: 0.95,
    rimColor: '#73a8ff',
    rimIntensity: 0.75,
  },
  midday: {
    label: 'Midday',
    zenith: '#8c5334',
    mid: '#b8724b',
    horizon: '#dfa983',
    ground: '#6a331d',
    fogColor: '#b97854',
    fogDensity: 0.013,
    starOpacity: 0.0,
    dustOpacity: 0.38,
    sunColor: '#fff1db',
    sunIntensity: 3.1,
    sunPos: [9, 14, 9],
    hemiSky: '#e8b692',
    hemiGround: '#874628',
    hemiIntensity: 1.05,
    rimColor: '#ffc89e',
    rimIntensity: 0.55,
  },
  sunset: {
    label: 'Blue Sunset',
    zenith: '#16233d',
    mid: '#3e5575',
    horizon: '#c87e62',
    ground: '#3a2018',
    fogColor: '#5c5968',
    fogDensity: 0.017,
    starOpacity: 0.35,
    dustOpacity: 0.48,
    sunColor: '#b2d4ff',
    sunIntensity: 2.35,
    sunPos: [-12, 5, -9],
    hemiSky: '#7da1d4',
    hemiGround: '#543528',
    hemiIntensity: 0.78,
    rimColor: '#ffb088',
    rimIntensity: 0.65,
  },
  storm: {
    label: 'Dust Storm',
    zenith: '#7d3a1f',
    mid: '#9b4d2b',
    horizon: '#c27149',
    ground: '#4a2011',
    fogColor: '#9c4e2a',
    fogDensity: 0.036,
    starOpacity: 0.0,
    dustOpacity: 0.82,
    sunColor: '#ffd1a3',
    sunIntensity: 1.65,
    sunPos: [6, 9, 6],
    hemiSky: '#c77c52',
    hemiGround: '#6b321a',
    hemiIntensity: 0.9,
    rimColor: '#d98a5b',
    rimIntensity: 0.35,
  },
  night: {
    label: 'Night',
    zenith: '#02040a',
    mid: '#070b18',
    horizon: '#181a28',
    ground: '#120a09',
    fogColor: '#0c101a',
    fogDensity: 0.012,
    starOpacity: 0.95,
    dustOpacity: 0.18,
    sunColor: '#8aa4d6',
    sunIntensity: 1.15,
    sunPos: [-8, 13, 6],
    hemiSky: '#2e4166',
    hemiGround: '#1a120f',
    hemiIntensity: 0.55,
    rimColor: '#4a70b5',
    rimIntensity: 0.68,
  },
};

function getPhaseLabel(p) {
  if (p < 0.16) return 'Phase 1 · Cruise Stowed';
  if (p < 0.30) return 'Phase 2 · Touchdown';
  if (p < 0.55) return 'Phase 3 · Solar Wings';
  return 'Phase 4 · Arm & SEIS';
}

function extractNodeMap(root) {
  const map = new Map();
  root.traverse((obj) => {
    if (obj.name) {
      map.set(obj.name, {
        pos: obj.position.clone(),
        quat: obj.quaternion.clone(),
        scale: obj.scale.clone(),
      });
    }
  });
  return map;
}

const TECH_CAMERA_PRESETS = [
  {
    page: 1,
    id: 'overview',
    label: 'Full Lander',
    shortLabel: 'Overview',
    position: [4.35, 2.25, 4.85],
    target: [-0.05, 0.92, 0.05],
    hotspot: null,
    defaultProgress: 1.0,
  },
  {
    page: 2,
    id: 'solar-panels',
    label: 'Solar Panels',
    shortLabel: 'Solar Panels',
    position: [-4.25, 2.35, 2.55],
    target: [-1.85, 0.98, -0.35],
    hotspot: [-2.02, 1.12, -0.38],
    defaultProgress: 0.55,
  },
  {
    page: 3,
    id: 'lander-body',
    label: 'Lander Body',
    shortLabel: 'Lander Deck',
    position: [2.65, 1.65, 2.65],
    target: [0, 0.92, 0.12],
    hotspot: [0.45, 0.92, 0.68],
    defaultProgress: 0.24,
  },
  {
    page: 4,
    id: 'robotic-arm',
    label: 'Robotic Arm (IDA)',
    shortLabel: 'Robotic Arm',
    position: [-2.45, 2.15, 3.25],
    target: [-0.55, 1.48, 1.15],
    hotspot: [-0.72, 1.94, 1.51],
    defaultProgress: 1.0,
  },
  {
    page: 5,
    id: 'seis',
    label: 'SEIS Seismometer',
    shortLabel: 'SEIS Dome',
    position: [-1.85, 1.85, 2.75],
    target: [0.04, 1.24, 0.45],
    hotspot: [0.04, 1.38, 0.52],
    defaultProgress: 1.0,
  },
  {
    page: 6,
    id: 'hp3',
    label: 'HP³ Heat Probe',
    shortLabel: 'HP³ Probe',
    position: [-2.15, 1.95, 1.95],
    target: [-0.35, 1.28, -0.03],
    hotspot: [-0.35, 1.54, -0.03],
    defaultProgress: 1.0,
  },
  {
    page: 7,
    id: 'rise',
    label: 'RISE X-Band',
    shortLabel: 'RISE Radio',
    position: [2.25, 1.85, -1.75],
    target: [0.52, 1.18, 0.23],
    hotspot: [0.68, 1.30, 0.23],
    defaultProgress: 0.58,
  },
  {
    page: 8,
    id: 'twins',
    label: 'TWINS & Weather',
    shortLabel: 'TWINS Sensors',
    position: [-2.45, 1.88, 1.45],
    target: [-0.55, 1.2, 0.2],
    hotspot: [-0.68, 1.32, 0.23],
    defaultProgress: 0.58,
  },
  {
    page: 9,
    id: 'cameras',
    label: 'IDC & ICC Cameras',
    shortLabel: 'Cameras',
    position: [-1.65, 1.15, 2.65],
    target: [-0.45, 0.88, 0.82],
    hotspot: [-0.53, 0.88, 0.9],
    defaultProgress: 1.0,
  },
  {
    page: 10,
    id: 'comms',
    label: 'Deep Space Link',
    shortLabel: 'Comms Link',
    position: [2.15, 1.85, 2.25],
    target: [0.35, 1.2, 0.45],
    hotspot: [0.41, 1.4, 0.56],
    defaultProgress: 0.58,
  },
];

const HOTSPOT_ITEMS = TECH_CAMERA_PRESETS.filter((item) => item.hotspot !== null);

const CRATERS = [
  { x: 10.5, z: -8.2, r: 4.1, depth: 0.48 },
  { x: -12.4, z: 7.4, r: 3.6, depth: 0.42 },
  { x: 14.5, z: 11.2, r: 5.2, depth: 0.56 },
  { x: -9.8, z: -12.6, r: 3.2, depth: 0.35 },
];

function smoothStep(edge0, edge1, x) {
  const t = THREE.MathUtils.clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

/** Deterministic Martian surface height with a flat compacted basin under InSight. */
function sampleMarsGroundHeight(x, z) {
  const dist = Math.hypot(x, z);
  const padMask = smoothStep(3.6, 8.6, dist);

  const dunes =
    Math.sin(x * 0.22 + z * 0.14) * 0.34 +
    Math.cos(z * 0.29 - x * 0.16) * 0.22 +
    Math.sin(x * 0.62 - z * 0.51) * 0.065;

  let craterDelta = 0;
  for (const c of CRATERS) {
    const d = Math.hypot(x - c.x, z - c.z);
    if (d < c.r * 1.45) {
      const u = d / c.r;
      if (u < 1) {
        craterDelta -= (1 - u * u) * c.depth;
      } else {
        const rim = 1 - (u - 1) / 0.45;
        craterDelta += Math.sin(rim * Math.PI) * c.depth * 0.22;
      }
    }
  }

  const horizonRidges =
    dist > 17
      ? Math.pow((dist - 17) * 0.23, 1.32) +
        Math.sin(Math.atan2(z, x) * 7) * 0.55 +
        Math.cos(Math.atan2(z, x) * 11) * 0.28
      : 0;

  return (dunes + craterDelta) * padMask + horizonRidges;
}

/** Generate organic procedural Mars regolith diffuse & bump textures. */
function createMarsSoilTextures() {
  const size = 512;
  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = size;
  colorCanvas.height = size;
  const ctx = colorCanvas.getContext('2d');

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bCtx = bumpCanvas.getContext('2d');

  ctx.fillStyle = '#8b442c';
  ctx.fillRect(0, 0, size, size);
  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, size, size);

  // Seeded PRNG avoids regular grid-lattice artifacts when texture repeats across terrain
  let seed = 42197;
  const nextRand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  // Soft organic radial dust & basalt sediment patches (no hard edges)
  for (let i = 0; i < 180; i += 1) {
    const cx = nextRand() * size;
    const cy = nextRand() * size;
    const rad = 18 + nextRand() * 38;
    const grad = ctx.createRadialGradient(cx, cy, 1, cx, cy, rad);
    const tone =
      i % 3 === 0
        ? 'rgba(72, 28, 19, 0.14)'
        : i % 3 === 1
        ? 'rgba(206, 126, 80, 0.12)'
        : 'rgba(148, 76, 48, 0.12)';
    grad.addColorStop(0, tone);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, rad, 0, Math.PI * 2);
    ctx.fill();

    const bGrad = bCtx.createRadialGradient(cx, cy, 1, cx, cy, rad);
    bGrad.addColorStop(0, i % 2 === 0 ? 'rgba(175,175,175,0.1)' : 'rgba(80,80,80,0.1)');
    bGrad.addColorStop(1, 'rgba(128,128,128,0)');
    bCtx.fillStyle = bGrad;
    bCtx.beginPath();
    bCtx.arc(cx, cy, rad, 0, Math.PI * 2);
    bCtx.fill();
  }

  // Subtle aeolian wind ripples
  for (let y = 0; y < size; y += 2) {
    const wave = Math.sin(y * 0.18 + Math.cos(y * 0.05) * 0.6) * 0.5 + 0.5;
    ctx.fillStyle =
      wave > 0.5
        ? `rgba(204, 122, 82, ${(wave - 0.5) * 0.12})`
        : `rgba(68, 28, 18, ${(0.5 - wave) * 0.12})`;
    ctx.fillRect(0, y, size, 2);

    const bVal = Math.round(120 + wave * 20);
    bCtx.fillStyle = `rgb(${bVal},${bVal},${bVal})`;
    bCtx.fillRect(0, y, size, 2);
  }

  // Fine mineral grit & micro-pebbles (irregular organic scatter)
  for (let i = 0; i < 3600; i += 1) {
    const x = nextRand() * size;
    const y = nextRand() * size;
    const r = 0.6 + nextRand() * 1.3;
    ctx.fillStyle =
      i % 3 === 0 ? 'rgba(64, 24, 16, 0.18)' : 'rgba(222, 166, 122, 0.16)';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    bCtx.fillStyle = i % 2 === 0 ? 'rgba(215,215,215,0.15)' : 'rgba(55,55,55,0.15)';
    bCtx.beginPath();
    bCtx.arc(x, y, r, 0, Math.PI * 2);
    bCtx.fill();
  }

  const map = new THREE.CanvasTexture(colorCanvas);
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(11, 11);
  map.colorSpace = THREE.SRGBColorSpace;

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.repeat.set(11, 11);

  return { map, bumpMap };
}

/** Soft radial thruster scour texture beneath the lander deck. */
function createThrusterScourTexture() {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const cx = size / 2;

  const grad = ctx.createRadialGradient(cx, cx, 8, cx, cx, cx);
  grad.addColorStop(0, 'rgba(38, 17, 13, 0.58)');
  grad.addColorStop(0.42, 'rgba(56, 24, 18, 0.36)');
  grad.addColorStop(0.74, 'rgba(130, 62, 38, 0.14)');
  grad.addColorStop(1, 'rgba(130, 62, 38, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Build Martian terrain mesh, scour pad, and scattered procedural rocks. */
function buildMartianEnvironment(scene) {
  const envGroup = new THREE.Group();
  const { map, bumpMap } = createMarsSoilTextures();

  const groundGeo = new THREE.PlaneGeometry(110, 110, 72, 72);
  groundGeo.rotateX(-Math.PI / 2);

  const pos = groundGeo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const cBasalt = new THREE.Color('#6c3123');
  const cRust = new THREE.Color('#a65336');
  const cOchre = new THREE.Color('#cf7e50');
  const tmpColor = new THREE.Color();

  for (let i = 0; i < pos.count; i += 1) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const y = sampleMarsGroundHeight(x, z);
    pos.setY(i, y);

    const dist = Math.hypot(x, z);
    const crestFactor = THREE.MathUtils.clamp((y + 0.35) / 1.4, 0, 1);
    const scourFactor = 1 - smoothStep(1.2, 3.5, dist);

    tmpColor.copy(cRust).lerp(cOchre, crestFactor * 0.65);
    tmpColor.lerp(cBasalt, scourFactor * 0.42);
    colors[i * 3] = tmpColor.r;
    colors[i * 3 + 1] = tmpColor.g;
    colors[i * 3 + 2] = tmpColor.b;
  }

  groundGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  groundGeo.computeVertexNormals();

  const groundMat = new THREE.MeshStandardMaterial({
    map,
    bumpMap,
    bumpScale: 0.08,
    vertexColors: true,
    roughness: 0.94,
    metalness: 0.04,
  });

  const groundMesh = new THREE.Mesh(groundGeo, groundMat);
  groundMesh.receiveShadow = true;
  envGroup.add(groundMesh);

  // Compacted regolith / thruster scour disc directly beneath InSight
  const scourMat = new THREE.MeshBasicMaterial({
    map: createThrusterScourTexture(),
    transparent: true,
    depthWrite: false,
  });
  const scourDisc = new THREE.Mesh(new THREE.CircleGeometry(2.85, 48), scourMat);
  scourDisc.rotation.x = -Math.PI / 2;
  scourDisc.position.set(0, 0.008, -0.1);
  envGroup.add(scourDisc);

  // Scattered procedural Martian basalt & iron-oxide rocks (single InstancedMesh draw call)
  const rockGeo = new THREE.IcosahedronGeometry(1, 2);
  const rPos = rockGeo.attributes.position;
  for (let i = 0; i < rPos.count; i += 1) {
    const vx = rPos.getX(i);
    const vy = rPos.getY(i);
    const vz = rPos.getZ(i);
    const n =
      1 +
      Math.sin(vx * 5.3 + vy * 3.7) * 0.14 +
      Math.cos(vz * 6.1 - vy * 4.2) * 0.11;
    rPos.setXYZ(i, vx * n, vy * n * 0.72, vz * n);
  }
  rockGeo.computeVertexNormals();

  const rockMat = new THREE.MeshStandardMaterial({
    color: '#ffffff',
    roughness: 0.92,
    metalness: 0.06,
  });

  const rockTransforms = [];
  const rockTonePalette = [
    new THREE.Color('#5b3024'),
    new THREE.Color('#7a412e'),
    new THREE.Color('#472821'),
  ];

  for (let i = 0; i < 88; i += 1) {
    const angle = i * 2.3999632; // Golden angle distribution
    const isPebble = i < 24;
    const radius = isPebble
      ? 2.75 + ((i * 19) % 100) / 42
      : 4.9 + Math.pow((i - 20) / 68, 1.12) * 23;

    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;

    // Keep clear zone in front of lander (+Z) where SEIS & HP³ sit
    if (z > 0.6 && z < 3.4 && Math.abs(x) < 1.9) continue;

    const scaleBase = isPebble
      ? 0.055 + (i % 5) * 0.018
      : 0.16 + ((i * 7) % 11) * 0.058;
    const sx = scaleBase * (0.85 + ((i * 3) % 5) * 0.12);
    const sy = scaleBase * (0.55 + ((i * 5) % 4) * 0.14);
    const sz = scaleBase * (0.85 + ((i * 7) % 5) * 0.11);

    const gy = sampleMarsGroundHeight(x, z);
    rockTransforms.push({
      pos: new THREE.Vector3(x, gy + sy * 0.25, z),
      rot: new THREE.Euler((i * 0.41) % Math.PI, (i * 1.17) % (Math.PI * 2), (i * 0.27) % 0.6),
      scale: new THREE.Vector3(sx, sy, sz),
      color: rockTonePalette[i % rockTonePalette.length],
    });
  }

  const rockInstances = new THREE.InstancedMesh(rockGeo, rockMat, rockTransforms.length);
  rockInstances.castShadow = true;
  rockInstances.receiveShadow = true;
  const dummy = new THREE.Object3D();
  rockTransforms.forEach((item, idx) => {
    dummy.position.copy(item.pos);
    dummy.rotation.copy(item.rot);
    dummy.scale.copy(item.scale);
    dummy.updateMatrix();
    rockInstances.setMatrixAt(idx, dummy.matrix);
    rockInstances.setColorAt(idx, item.color);
  });
  rockInstances.instanceMatrix.needsUpdate = true;
  if (rockInstances.instanceColor) rockInstances.instanceColor.needsUpdate = true;
  envGroup.add(rockInstances);

  // Martian twilight sky dome
  const skyGeo = new THREE.SphereGeometry(85, 32, 24);
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {
      uZenith: { value: new THREE.Color('#040814') },
      uMid: { value: new THREE.Color('#1c1522') },
      uHorizon: { value: new THREE.Color('#8e4a2e') },
      uGround: { value: new THREE.Color('#2c1712') },
    },
    vertexShader: `
      varying vec3 vWorldPos;
      void main() {
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorldPos = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: `
      uniform vec3 uZenith;
      uniform vec3 uMid;
      uniform vec3 uHorizon;
      uniform vec3 uGround;
      varying vec3 vWorldPos;
      void main() {
        float h = normalize(vWorldPos).y;
        vec3 col;
        if (h >= 0.0) {
          float t1 = smoothstep(0.0, 0.24, h);
          float t2 = smoothstep(0.18, 0.78, h);
          col = mix(uHorizon, uMid, t1);
          col = mix(col, uZenith, t2);
        } else {
          col = mix(uHorizon, uGround, smoothstep(0.0, -0.25, h));
        }
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
  const skyDome = new THREE.Mesh(skyGeo, skyMat);
  envGroup.add(skyDome);

  // Subtle starfield high above the dusty Martian horizon
  const starCount = 650;
  const starPos = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i += 1) {
    const theta = (i * 2.3999632) % (Math.PI * 2);
    const phi = 0.18 + ((i * 73) % 1000) / 1000 * (Math.PI * 0.44);
    const r = 74;
    starPos[i * 3] = Math.cos(theta) * Math.cos(phi) * r;
    starPos[i * 3 + 1] = Math.sin(phi) * r;
    starPos[i * 3 + 2] = Math.sin(theta) * Math.cos(phi) * r;
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  const starMat = new THREE.PointsMaterial({
    color: '#dce8ff',
    size: 0.22,
    transparent: true,
    opacity: 0.72,
    fog: false,
  });
  envGroup.add(new THREE.Points(starGeo, starMat));

  // Floating Martian dust motes
  const dustCount = 150;
  const dustPos = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount; i += 1) {
    dustPos[i * 3] = (((i * 67) % 240) / 240 - 0.5) * 26;
    dustPos[i * 3 + 1] = 0.18 + (((i * 43) % 100) / 100) * 3.4;
    dustPos[i * 3 + 2] = (((i * 89) % 240) / 240 - 0.5) * 26;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  const dustMat = new THREE.PointsMaterial({
    color: '#f2b88d',
    size: 0.055,
    transparent: true,
    opacity: 0.45,
  });
  const dustPoints = new THREE.Points(dustGeo, dustMat);
  envGroup.add(dustPoints);

  scene.add(envGroup);
  return { dustPoints, skyMat, starMat, dustMat };
}

export default function InsightLanderViewer({
  pageNumber = 1,
  onSelectPage,
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const controlsRef = useRef(null);
  const cameraRef = useRef(null);
  const hotspotElsRef = useRef({});
  const transitionRef = useRef({
    active: false,
    pos: new THREE.Vector3(),
    target: new THREE.Vector3(),
  });
  const autoRotateRef = useRef(false);
  const showHotspotsRef = useRef(true);
  const isPlayingRef = useRef(false);
  const progressRef = useRef(1.0);
  const targetProgressRef = useRef(1.0);
  const sliderRef = useRef(null);
  const phaseTextRef = useRef(null);
  const pctTextRef = useRef(null);
  const phaseBtnsRef = useRef({});
  const applyAtmosphereRef = useRef(null);

  const [loadingPct, setLoadingPct] = useState(0);
  const [modelReady, setModelReady] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [webglError, setWebglError] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [showHotspots, setShowHotspots] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [atmosphere, setAtmosphere] = useState('twilight');

  const activePreset = TECH_CAMERA_PRESETS[pageNumber - 1] ?? TECH_CAMERA_PRESETS[0];
  const atmospherePreset = ATMOSPHERE_PRESETS[atmosphere] ?? ATMOSPHERE_PRESETS.twilight;

  useEffect(() => {
    autoRotateRef.current = autoRotate;
    if (controlsRef.current) {
      controlsRef.current.autoRotate = autoRotate;
    }
  }, [autoRotate]);

  useEffect(() => {
    showHotspotsRef.current = showHotspots;
  }, [showHotspots]);

  useEffect(() => {
    applyAtmosphereRef.current?.(atmosphere);
  }, [atmosphere]);

  // Smooth camera glide + target deployment phase when pageNumber changes
  useEffect(() => {
    const preset = TECH_CAMERA_PRESETS[pageNumber - 1] ?? TECH_CAMERA_PRESETS[0];
    transitionRef.current.pos.set(...preset.position);
    transitionRef.current.target.set(...preset.target);
    transitionRef.current.active = true;

    isPlayingRef.current = false;
    if (preset.id === 'robotic-arm' && progressRef.current >= 0.92) {
      progressRef.current = 0.55;
    } else if (preset.id === 'solar-panels' && (progressRef.current < 0.2 || progressRef.current >= 0.92)) {
      progressRef.current = 0.24;
    }
    targetProgressRef.current = preset.defaultProgress;
  }, [pageNumber]);

  const handleResetView = () => {
    const preset = TECH_CAMERA_PRESETS[pageNumber - 1] ?? TECH_CAMERA_PRESETS[0];
    transitionRef.current.pos.set(...preset.position);
    transitionRef.current.target.set(...preset.target);
    transitionRef.current.active = true;
  };

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return undefined;

    let renderer = null;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        powerPreference: 'high-performance',
      });
    } catch {
      const errTimer = setTimeout(() => setWebglError(true), 0);
      return () => clearTimeout(errTimer);
    }

    const width = Math.max(1, container.clientWidth);
    const height = Math.max(1, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(width, height, false);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.shadowMap.autoUpdate = false;
    renderer.shadowMap.needsUpdate = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.14;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2('#3a2018', 0.014);

    // Subtle PBR environment reflections for gold foil, solar panels & metal joints
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTarget = pmremGenerator.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envTarget.texture;
    scene.environmentIntensity = 0.42;

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 160);
    const initialPreset = TECH_CAMERA_PRESETS[0];
    camera.position.set(...initialPreset.position);
    cameraRef.current = camera;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.enablePan = true;
    controls.minDistance = 1.7;
    controls.maxDistance = 14.5;
    controls.maxPolarAngle = Math.PI / 2 - 0.04; // Never dip beneath Martian ground
    controls.minPolarAngle = 0.14;
    controls.autoRotate = autoRotateRef.current;
    controls.autoRotateSpeed = 0.65;
    controls.target.set(...initialPreset.target);
    controls.update();
    controlsRef.current = controls;

    // Cancel automatic camera glide if the user grabs/scrolls the 3D scene
    const cancelTransition = () => {
      transitionRef.current.active = false;
    };
    controls.addEventListener('start', cancelTransition);

    // Mars daylight + warm ground bounce + cool cosmic rim light
    const hemiLight = new THREE.HemisphereLight('#9ec2f0', '#964b2c', 0.95);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight('#ffd3a8', 2.9);
    sunLight.position.set(10, 12, 8);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 1;
    sunLight.shadow.camera.far = 36;
    const d = 7.5;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.bias = -0.0004;
    sunLight.shadow.normalBias = 0.02;
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight('#73a8ff', 0.75);
    rimLight.position.set(-10, 6, -12);
    scene.add(rimLight);

    const { dustPoints, skyMat, starMat, dustMat } = buildMartianEnvironment(scene);

    const applyAtmosphere = (modeKey) => {
      const cfg = ATMOSPHERE_PRESETS[modeKey] ?? ATMOSPHERE_PRESETS.twilight;
      skyMat.uniforms.uZenith.value.set(cfg.zenith);
      skyMat.uniforms.uMid.value.set(cfg.mid);
      skyMat.uniforms.uHorizon.value.set(cfg.horizon);
      skyMat.uniforms.uGround.value.set(cfg.ground);
      scene.fog.color.set(cfg.fogColor);
      scene.fog.density = cfg.fogDensity;
      starMat.opacity = cfg.starOpacity;
      starMat.visible = cfg.starOpacity > 0.01;
      dustMat.opacity = cfg.dustOpacity;
      sunLight.color.set(cfg.sunColor);
      sunLight.intensity = cfg.sunIntensity;
      sunLight.position.set(...cfg.sunPos);
      hemiLight.color.set(cfg.hemiSky);
      hemiLight.groundColor.set(cfg.hemiGround);
      hemiLight.intensity = cfg.hemiIntensity;
      rimLight.color.set(cfg.rimColor);
      rimLight.intensity = cfg.rimIntensity;
      renderer.shadowMap.needsUpdate = true;
    };
    applyAtmosphereRef.current = applyAtmosphere;
    applyAtmosphere('twilight');

    // Load the 4 Draco-compressed InSight keyframe GLBs for full deployment kinematics
    let disposed = false;
    let stowedLander = null;
    let articulatedLander = null;
    let hotspotAnchorsMap = null;
    let refreshHotspotAnchors = null;
    const keyframes = [];

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath(DRACO_DECODER_PATH);
    dracoLoader.setWorkerLimit(1);
    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);

    const loadGlb = (url, index) =>
      new Promise((resolve, reject) => {
        loader.load(
          url,
          resolve,
          (evt) => {
            if (disposed || !evt.total) return;
            const pctPerModel = 25;
            const overall = Math.round(index * pctPerModel + (evt.loaded / evt.total) * pctPerModel);
            setLoadingPct(Math.min(99, overall));
          },
          reject
        );
      });

    const configureShadowsAndMaterials = (root) => {
      root.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          const mats = Array.isArray(child.material) ? child.material : [child.material];
          mats.forEach((mat) => {
            if (mat && 'envMapIntensity' in mat) {
              mat.envMapIntensity = 1.15;
            }
          });
        }
      });
    };

    const applyProgress = (p) => {
      if (!stowedLander || !articulatedLander) return;

      if (p < 0.16) {
        stowedLander.visible = true;
        articulatedLander.visible = false;
      } else if (p < 0.55) {
        stowedLander.visible = false;
        articulatedLander.visible = true;
        const t = THREE.MathUtils.smoothstep((p - 0.16) / (0.55 - 0.16), 0, 1);
        for (let i = 0; i < keyframes.length; i += 1) {
          const kf = keyframes[i];
          kf.node.position.lerpVectors(kf.ps.pos, kf.pd.pos, t);
          kf.node.quaternion.slerpQuaternions(kf.ps.quat, kf.pd.quat, t);
          kf.node.scale.lerpVectors(kf.ps.scale, kf.pd.scale, t);
        }
        articulatedLander.updateMatrixWorld(true);
      } else {
        stowedLander.visible = false;
        articulatedLander.visible = true;
        const t = THREE.MathUtils.smoothstep((p - 0.55) / (1.0 - 0.55), 0, 1);
        for (let i = 0; i < keyframes.length; i += 1) {
          const kf = keyframes[i];
          kf.node.position.lerpVectors(kf.pd.pos, kf.ad.pos, t);
          kf.node.quaternion.slerpQuaternions(kf.pd.quat, kf.ad.quat, t);
          kf.node.scale.lerpVectors(kf.pd.scale, kf.ad.scale, t);
        }
        articulatedLander.updateMatrixWorld(true);
      }
    };

    const syncDeploymentHud = (p) => {
      const pct = Math.round(p * 100);
      if (sliderRef.current && document.activeElement !== sliderRef.current) {
        sliderRef.current.value = String(pct);
      }
      if (pctTextRef.current) {
        pctTextRef.current.textContent = `${pct}%`;
      }
      if (phaseTextRef.current) {
        phaseTextRef.current.textContent = getPhaseLabel(p);
      }
      const activePhaseId =
        p < 0.16 ? 'stowed' : p < 0.30 ? 'touchdown' : p < 0.55 ? 'panels' : 'arm';
      for (const stop of PHASE_STOPS) {
        const btn = phaseBtnsRef.current[stop.id];
        if (btn) {
          btn.dataset.active = stop.id === activePhaseId ? 'true' : 'false';
        }
      }
    };

    (async () => {
      try {
        const stowedGltf = await loadGlb(STOWED_MODEL_PATH, 0);
        if (disposed) {
          for (const loadedScene of stowedGltf.scenes) disposeScene(loadedScene);
          return;
        }
        stowedLander = stowedGltf.scene;
        stowedLander.position.set(0, GROUND_LEVEL_Y, 0);
        configureShadowsAndMaterials(stowedLander);

        const psGltf = await loadGlb(PANELS_STOWED_MODEL_PATH, 1);
        if (disposed) {
          disposeScene(stowedLander);
          for (const loadedScene of psGltf.scenes) disposeScene(loadedScene);
          return;
        }
        articulatedLander = psGltf.scene;
        articulatedLander.position.set(0, GROUND_LEVEL_Y, DECK_CENTER_Z);
        configureShadowsAndMaterials(articulatedLander);
        const psMap = extractNodeMap(articulatedLander);

        const pdGltf = await loadGlb(PANELS_DEPLOYED_MODEL_PATH, 2);
        const pdMap = extractNodeMap(pdGltf.scene);
        for (const loadedScene of pdGltf.scenes) disposeScene(loadedScene);
        if (disposed) {
          disposeScene(stowedLander);
          disposeScene(articulatedLander);
          return;
        }

        const adGltf = await loadGlb(ARM_DEPLOYED_MODEL_PATH, 3);
        const adMap = extractNodeMap(adGltf.scene);
        for (const loadedScene of adGltf.scenes) disposeScene(loadedScene);
        if (disposed) {
          disposeScene(stowedLander);
          disposeScene(articulatedLander);
          return;
        }

        articulatedLander.traverse((obj) => {
          if (!obj.name) return;
          const ps = psMap.get(obj.name);
          const pd = pdMap.get(obj.name);
          const ad = adMap.get(obj.name);
          if (ps && pd && ad) {
            keyframes.push({ node: obj, ps, pd, ad });
          }
        });

        scene.add(stowedLander);
        scene.add(articulatedLander);

        const hotspotNodes = {
          'solar-panels': articulatedLander.getObjectByName('panel_l.031'),
          'lander-body': articulatedLander.getObjectByName('deck'),
          'robotic-arm': articulatedLander.getObjectByName('arm_03'),
          seis: articulatedLander.getObjectByName('SEIS'),
          hp3: articulatedLander.getObjectByName('HP3_v3d_baked'),
          rise: articulatedLander.getObjectByName('RISE_antennas'),
          twins: articulatedLander.getObjectByName('TWINS'),
          cameras: articulatedLander.getObjectByName('ICC'),
          comms: articulatedLander.getObjectByName('UHF_antenna'),
        };
        const hotspotBox = new THREE.Box3();
        const hotspotCenter = new THREE.Vector3();
        hotspotAnchorsMap = Object.fromEntries(
          HOTSPOT_ITEMS.map((item) => [item.id, new THREE.Vector3(...item.hotspot)])
        );
        refreshHotspotAnchors = () => {
          for (const item of HOTSPOT_ITEMS) {
            const node = hotspotNodes[item.id];
            if (!node) continue;
            if (item.id === 'lander-body' && node.isMesh && node.geometry) {
              if (!node.geometry.boundingBox) node.geometry.computeBoundingBox();
              hotspotBox.copy(node.geometry.boundingBox).applyMatrix4(node.matrixWorld);
              hotspotBox.getCenter(hotspotCenter);
              hotspotAnchorsMap[item.id].set(
                hotspotCenter.x + 0.36,
                hotspotCenter.y + 0.12,
                hotspotCenter.z + 0.42
              );
              continue;
            }
            hotspotBox.setFromObject(node);
            if (hotspotBox.isEmpty()) continue;
            hotspotBox.getCenter(hotspotCenter);
            if (item.id === 'rise') {
              hotspotAnchorsMap[item.id].set(
                hotspotBox.max.x - 0.14,
                hotspotBox.max.y + 0.03,
                hotspotCenter.z
              );
            } else if (item.id === 'twins') {
              hotspotAnchorsMap[item.id].set(
                hotspotBox.min.x + 0.14,
                hotspotBox.max.y + 0.03,
                hotspotCenter.z
              );
            } else if (item.id === 'cameras') {
              hotspotAnchorsMap[item.id].set(
                hotspotCenter.x,
                hotspotCenter.y,
                hotspotBox.max.z + 0.03
              );
            } else if (item.id === 'solar-panels' || item.id === 'robotic-arm') {
              hotspotAnchorsMap[item.id].set(
                hotspotCenter.x,
                hotspotCenter.y + 0.04,
                hotspotCenter.z
              );
            } else {
              hotspotAnchorsMap[item.id].set(
                hotspotCenter.x,
                hotspotBox.max.y + 0.02,
                hotspotCenter.z
              );
            }
          }
        };

        // Prime exact Three.js world-space hotspot anchors at full deployment first
        applyProgress(1.0);
        refreshHotspotAnchors();

        applyProgress(progressRef.current);
        if (articulatedLander.visible) refreshHotspotAnchors();
        syncDeploymentHud(progressRef.current);
        renderer.shadowMap.needsUpdate = true;
        setLoadingPct(100);
        setModelReady(true);
      } catch {
        if (!disposed) setLoadError(true);
      } finally {
        dracoLoader.dispose();
      }
    })();

    const resizeObserver = new ResizeObserver(() => {
      if (!container) return;
      const w = Math.max(1, container.clientWidth);
      const h = Math.max(1, container.clientHeight);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    });
    resizeObserver.observe(container);

    const projVec = new THREE.Vector3();
    let rafId = 0;
    let prevTime = performance.now();
    let lastShadowUpdate = 0;
    let appliedProgress = -1;
    let wasMorphing = false;

    const animate = (now) => {
      const dt = Math.min(0.05, (now - prevTime) / 1000);
      prevTime = now;

      // Smooth camera transition when switching Go technical chapters
      if (transitionRef.current.active) {
        const alpha = 1 - Math.exp(-5.2 * dt);
        camera.position.lerp(transitionRef.current.pos, alpha);
        controls.target.lerp(transitionRef.current.target, alpha);
        if (
          camera.position.distanceTo(transitionRef.current.pos) < 0.02 &&
          controls.target.distanceTo(transitionRef.current.target) < 0.02
        ) {
          transitionRef.current.active = false;
        }
      }

      // Advance full deployment sequence or glide smoothly to chapter/scrubber target
      if (isPlayingRef.current) {
        progressRef.current = Math.min(1, progressRef.current + dt * 0.13);
        targetProgressRef.current = progressRef.current;
        if (progressRef.current >= 1) {
          isPlayingRef.current = false;
          setIsPlaying(false);
        }
      } else {
        const diff = targetProgressRef.current - progressRef.current;
        if (Math.abs(diff) > 0.002) {
          progressRef.current += diff * (1 - Math.exp(-9.0 * dt));
        } else {
          progressRef.current = targetProgressRef.current;
        }
      }

      const isMorphing = Math.abs(appliedProgress - progressRef.current) > 0.0005;
      if (stowedLander && articulatedLander && (isMorphing || appliedProgress < 0)) {
        appliedProgress = progressRef.current;
        applyProgress(appliedProgress);
        if (articulatedLander.visible && refreshHotspotAnchors) {
          refreshHotspotAnchors();
        }
        syncDeploymentHud(appliedProgress);
        if (now - lastShadowUpdate > 160) {
          renderer.shadowMap.needsUpdate = true;
          lastShadowUpdate = now;
        }
      } else if (wasMorphing && !isMorphing) {
        renderer.shadowMap.needsUpdate = true;
      }
      wasMorphing = isMorphing;

      // Slow Martian dust breeze
      const dustAttr = dustPoints.geometry.attributes.position;
      for (let i = 0; i < dustAttr.count; i += 1) {
        let dx = dustAttr.getX(i) + dt * 0.24;
        if (dx > 13) dx = -13;
        dustAttr.setX(i, dx);
      }
      dustAttr.needsUpdate = true;

      controls.update();
      renderer.render(scene, camera);

      // Project 3D hotspot anchors into viewport coordinates
      if (showHotspotsRef.current) {
        const w = container.clientWidth;
        const h = container.clientHeight;
        for (const item of HOTSPOT_ITEMS) {
          const el = hotspotElsRef.current[item.id];
          if (!el) continue;
          const anchor = hotspotAnchorsMap?.[item.id];
          if (anchor) {
            projVec.copy(anchor).project(camera);
          } else {
            projVec.set(...item.hotspot).project(camera);
          }
          const inFront = projVec.z < 1 && projVec.z > -1;
          const x = (projVec.x * 0.5 + 0.5) * w;
          const y = (-projVec.y * 0.5 + 0.5) * h;
          const inBounds = x >= 28 && x <= w - 28 && y >= 62 && y <= h - 62;
          if (inFront && inBounds) {
            el.style.opacity = '1';
            el.style.pointerEvents = 'auto';
            el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
          } else {
            el.style.opacity = '0';
            el.style.pointerEvents = 'none';
          }
        }
      }

      rafId = requestAnimationFrame(animate);
    };
    rafId = requestAnimationFrame(animate);

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      controls.removeEventListener('start', cancelTransition);
      controls.dispose();
      dracoLoader.dispose();
      envTarget.dispose();
      pmremGenerator.dispose();
      disposeScene(scene);
      renderer.dispose();
    };
  }, []);

  const handleTogglePlayDeployment = () => {
    const next = !isPlaying;
    if (next && progressRef.current >= 0.99) {
      progressRef.current = 0;
      targetProgressRef.current = 0;
    }
    setIsPlaying(next);
    isPlayingRef.current = next;
  };

  const handleSelectPhase = (target) => {
    setIsPlaying(false);
    isPlayingRef.current = false;
    targetProgressRef.current = target;
  };

  const handleScrubDeployment = (event) => {
    const val = Number(event.target.value) / 100;
    setIsPlaying(false);
    isPlayingRef.current = false;
    progressRef.current = val;
    targetProgressRef.current = val;
  };

  const handleCycleAtmosphere = () => {
    setAtmosphere((prev) => {
      const idx = ATMOSPHERE_ORDER.indexOf(prev);
      return ATMOSPHERE_ORDER[(idx + 1) % ATMOSPHERE_ORDER.length];
    });
  };

  const handleHotspotClick = (page) => {
    setIsPlaying(false);
    isPlayingRef.current = false;
    onSelectPage?.(page);
  };

  if (webglError) {
    return (
      <div className="relative w-full h-full min-h-[340px] rounded-2xl border border-[#F7961D]/45 bg-[#050b1d]/85 flex flex-col items-center justify-center p-6 text-center">
        <p className="font-orbitron text-sm text-[#F7961D] uppercase tracking-wider">
          InSight 3D Mars Surface Preview
        </p>
        <p className="mt-2 text-xs sm:text-sm font-exo2 text-white/75 max-w-md">
          Interactive 3D WebGL viewport is unavailable in this browser session, while all technical briefing chapters remain available on the left.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[340px] sm:min-h-[420px] lg:min-h-[500px] rounded-2xl border border-[#F7961D]/45 bg-[#040814] overflow-hidden shadow-[0_22px_60px_rgba(0,0,0,0.75)] select-none"
    >
      {/* 3D WebGL Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block cursor-grab active:cursor-grabbing"
        aria-label="Interactive 3D InSight lander on Mars terrain"
      />

      {/* HUD Corner Brackets */}
      <span aria-hidden="true" className="pointer-events-none absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 border-[#F7961D]/70 rounded-tl-md" />
      <span aria-hidden="true" className="pointer-events-none absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 border-[#F7961D]/70 rounded-tr-md" />
      <span aria-hidden="true" className="pointer-events-none absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 border-[#F7961D]/70 rounded-bl-md" />
      <span aria-hidden="true" className="pointer-events-none absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 border-[#F7961D]/70 rounded-br-md" />

      {/* Top HUD Telemetry & Controls */}
      <div className="pointer-events-none absolute top-3.5 left-3.5 right-3.5 flex flex-wrap items-start justify-between gap-2 z-20">
        <div className="pointer-events-auto rounded-xl border border-white/15 bg-[#050a18]/80 backdrop-blur-md px-3 py-1.5 text-left">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#F7961D] animate-pulse" />
            <span className="font-mono text-[10px] tracking-[0.16em] text-[#F7961D] uppercase">
              ELYSIUM PLANITIA · 4.5°N 135.6°E
            </span>
          </div>
          <div className="mt-0.5 font-orbitron text-xs sm:text-[13px] font-semibold text-white">
            {activePreset.label}
          </div>
          <div ref={phaseTextRef} className="font-mono text-[10px] text-white/65">
            {getPhaseLabel(1.0)}
          </div>
        </div>

        <div className="pointer-events-auto flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={handleCycleAtmosphere}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/20 bg-[#050a18]/80 hover:border-[#F7961D]/70 text-[11px] font-exo2 font-medium text-white/85 hover:text-white backdrop-blur-md transition-colors cursor-pointer"
            title="Cycle Mars lighting atmosphere"
          >
            <SunMedium className="w-3.5 h-3.5 text-[#F7961D]" />
            <span>{atmospherePreset.label}</span>
          </button>

          <button
            type="button"
            onClick={() => setAutoRotate((prev) => !prev)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-exo2 font-medium backdrop-blur-md transition-colors cursor-pointer ${
              autoRotate
                ? 'border-[#4DE2E8] bg-[#39A9FF]/20 text-[#4DE2E8]'
                : 'border-white/20 bg-[#050a18]/80 text-white/80 hover:border-white/50 hover:text-white'
            }`}
            title="Toggle automatic camera orbit"
          >
            {autoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>Orbit</span>
          </button>

          <button
            type="button"
            onClick={() => setShowHotspots((prev) => !prev)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-white/20 bg-[#050a18]/80 hover:border-white/50 text-[11px] font-exo2 text-white/80 hover:text-white backdrop-blur-md transition-colors cursor-pointer"
            title={showHotspots ? 'Hide 3D subsystem markers' : 'Show 3D subsystem markers'}
            aria-label={showHotspots ? 'Hide 3D subsystem markers' : 'Show 3D subsystem markers'}
          >
            {showHotspots ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={handleResetView}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-white/20 bg-[#050a18]/80 hover:border-[#F7961D] text-[11px] font-exo2 text-white/80 hover:text-[#F7961D] backdrop-blur-md transition-colors cursor-pointer"
            title="Reset camera focus to current chapter"
            aria-label="Reset 3D camera view"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Projected 3D Subsystem Hotspots */}
      {modelReady && showHotspots && (
        <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
          {HOTSPOT_ITEMS.map((item) => {
            const isActive = item.page === pageNumber;
            return (
              <button
                key={item.id}
                ref={(el) => {
                  hotspotElsRef.current[item.id] = el;
                }}
                type="button"
                onClick={() => handleHotspotClick(item.page)}
                style={{ opacity: 0 }}
                className="absolute top-0 left-0 flex items-center gap-1.5 group cursor-pointer focus:outline-none"
                aria-label={`Focus 3D view on ${item.label}`}
                title={`Jump to ${item.label}`}
              >
                <span
                  className={`relative w-3.5 h-3.5 rounded-full border transition-transform group-hover:scale-125 ${
                    isActive
                      ? 'bg-[#F7961D] border-white shadow-[0_0_14px_rgba(247,150,29,0.95)]'
                      : 'bg-[#071028]/90 border-[#F7961D]/85 group-hover:bg-[#F7961D]'
                  }`}
                >
                  {isActive && (
                    <span className="absolute -inset-1.5 rounded-full border border-[#F7961D] animate-ping opacity-75" />
                  )}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-exo2 font-semibold whitespace-nowrap backdrop-blur-md border transition-all duration-150 ${
                    isActive
                      ? 'opacity-100 bg-[#F7961D] text-[#1a0d00] border-[#ffd399] shadow-[0_4px_14px_rgba(0,0,0,0.5)]'
                      : 'opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 bg-[#050b1c]/90 text-white/95 border-white/25'
                  }`}
                >
                  {item.shortLabel}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Model Loading / Error Overlay */}
      {!modelReady && !loadError && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#040814]/75 backdrop-blur-sm px-4 text-center">
          <div className="w-10 h-10 rounded-full border-2 border-[#F7961D]/30 border-t-[#F7961D] animate-spin" />
          <p className="mt-3 font-orbitron text-xs uppercase tracking-widest text-[#F7961D]">
            Loading InSight 3D Lander {loadingPct > 0 ? `· ${loadingPct}%` : '...'}
          </p>
          <p className="mt-1 font-exo2 text-[11px] text-white/65">
            Streaming 4 Draco keyframe meshes onto Elysium Planitia
          </p>
        </div>
      )}

      {loadError && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#040814]/85 px-5 text-center">
          <p className="font-orbitron text-xs uppercase tracking-wider text-[#F7961D]">
            3D Lander Model Unavailable
          </p>
          <p className="mt-1.5 font-exo2 text-xs text-white/70 max-w-sm">
            Could not load the InSight 3D lander models. The Martian terrain remains active.
          </p>
        </div>
      )}

      {/* Bottom Deployment Phase Dock */}
      <div className="pointer-events-none absolute bottom-2.5 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2">
        <div className="pointer-events-auto flex flex-wrap items-center gap-1.5 w-full rounded-xl border border-white/15 bg-[#050a18]/85 backdrop-blur-md px-2.5 py-1.5">
          <button
            type="button"
            onClick={handleTogglePlayDeployment}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-exo2 font-semibold transition-colors cursor-pointer ${
              isPlaying
                ? 'border-[#F7961D] bg-[#F7961D]/20 text-[#F7961D]'
                : 'border-white/20 bg-white/5 text-white/85 hover:border-[#F7961D]/70 hover:text-[#F7961D]'
            }`}
            title={isPlaying ? 'Pause deployment sequence' : 'Play full deployment sequence'}
          >
            {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            <span>{isPlaying ? 'Pause' : 'Deploy'}</span>
          </button>

          <div className="flex items-center gap-1">
            {PHASE_STOPS.map((stop) => (
              <button
                key={stop.id}
                ref={(el) => {
                  phaseBtnsRef.current[stop.id] = el;
                }}
                type="button"
                data-active={stop.id === 'arm' ? 'true' : 'false'}
                onClick={() => handleSelectPhase(stop.target)}
                className="px-2 py-1 rounded-md border text-[10px] font-mono uppercase tracking-wider transition-colors cursor-pointer border-white/15 bg-white/5 text-white/70 hover:border-white/40 hover:text-white data-[active=true]:border-[#F7961D] data-[active=true]:bg-[#F7961D]/20 data-[active=true]:text-[#F7961D]"
                title={stop.label}
              >
                <span className="sm:hidden">{stop.shortLabel}</span>
                <span className="hidden sm:inline">{stop.label}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 flex-1 min-w-[90px] pl-1">
            <input
              ref={sliderRef}
              type="range"
              min={0}
              max={100}
              defaultValue={100}
              onInput={handleScrubDeployment}
              aria-label="InSight deployment phase progress"
              className="w-full h-1.5 accent-[#F7961D] cursor-pointer bg-white/15 rounded-lg"
            />
            <span
              ref={pctTextRef}
              className="font-mono text-[10px] text-white/75 w-8 text-right shrink-0"
            >
              100%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
