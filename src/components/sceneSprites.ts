import * as THREE from 'three';
import type { Zone } from './timeOfDay';

export type SpriteKind = 'tree' | 'house' | 'building' | 'streetlight';

export type SceneSprite = {
  url: string;
  /** Where the model's base sits inside the image (0..1) */
  anchorX: number;
  anchorY: number;
  /** World units covered by the image's height — box px = pxPerUnit * frameUnits */
  frameUnits: number;
  /** Model height in world units (for overlap checks) */
  height: number;
};

export type SpriteSets = Record<string, SceneSprite[]>;
export const spriteSetKey = (kind: SpriteKind, zone: Zone) => `${kind}-${zone}`;

const SPRITE_PX = 320;
const FOV = 40;

// Same viewing direction as the car camera in FlowCar.tsx: position [0, 15, -10] looking at the origin
const CAMERA_DIR = new THREE.Vector3(0, 15, -10).normalize();

// ---------- Materials & primitives ----------

const mat = (color: string) =>
  new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.85, metalness: 0 });

const glow = (color: string, intensity = 1.6) =>
  new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: intensity, roughness: 1 });

// Small deterministic PRNG so lit windows are the same every load
const mulberry32 = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let r = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
  return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
};

const trunk = (height: number, radius = 0.13) => {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.8, radius, height, 6), mat('#5a3b22'));
  m.position.y = height / 2;
  return m;
};

const cone = (radius: number, height: number, y: number, color: string) => {
  const m = new THREE.Mesh(new THREE.ConeGeometry(radius, height, 7), mat(color));
  m.position.y = y;
  return m;
};

const blob = (radius: number, x: number, y: number, z: number, color: string, rot = 0) => {
  const m = new THREE.Mesh(new THREE.IcosahedronGeometry(radius, 0), mat(color));
  m.position.set(x, y, z);
  m.rotation.set(rot, rot * 1.7, rot * 0.6);
  return m;
};

const box = (w: number, h: number, d: number, color: string | THREE.Material, x = 0, y = 0, z = 0) => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), typeof color === 'string' ? mat(color) : color);
  m.position.set(x, y, z);
  return m;
};

/** Grid of window panes on all four walls of a box centred at x=z=0. */
const addWindows = (
  g: THREE.Group,
  w: number,
  d: number,
  yFrom: number,
  yTo: number,
  rowGap: number,
  colGap: number,
  litChance: number,
  seed: number,
  pane: [number, number] = [0.16, 0.2]
) => {
  const rand = mulberry32(seed);
  const lit = glow('#ffcf6e', 1.8);
  const dark = mat('#1b2130');
  const geo = new THREE.PlaneGeometry(pane[0], pane[1]);
  const walls = [
    { len: w, place: (u: number, y: number) => [u, y, -d / 2 - 0.005, Math.PI] },
    { len: w, place: (u: number, y: number) => [u, y, d / 2 + 0.005, 0] },
    { len: d, place: (u: number, y: number) => [-w / 2 - 0.005, y, u, -Math.PI / 2] },
    { len: d, place: (u: number, y: number) => [w / 2 + 0.005, y, u, Math.PI / 2] },
  ];
  for (const wall of walls) {
    const cols = Math.max(1, Math.floor((wall.len - 0.15) / colGap));
    for (let y = yFrom; y <= yTo; y += rowGap) {
      for (let c = 0; c < cols; c++) {
        const u = (c - (cols - 1) / 2) * colGap;
        const [px, py, pz, ry] = wall.place(u, y);
        const m = new THREE.Mesh(geo, rand() < litChance ? lit : dark);
        m.position.set(px, py, pz);
        m.rotation.y = ry;
        g.add(m);
      }
    }
  }
};

// ---------- Models ----------

const buildTree = (variant: number): THREE.Group => {
  const g = new THREE.Group();
  switch (variant) {
    case 0: // Pine
      g.add(trunk(0.5));
      g.add(cone(0.95, 1.1, 0.95, '#1d5428'));
      g.add(cone(0.75, 0.95, 1.5, '#246a33'));
      g.add(cone(0.5, 0.8, 2.0, '#2e8040'));
      break;
    case 1: // Round deciduous
      g.add(trunk(0.8, 0.15));
      g.add(blob(0.85, 0, 1.45, 0, '#26652f', 0.3));
      g.add(blob(0.55, 0.45, 1.85, 0.15, '#2f7a3a', 0.8));
      g.add(blob(0.5, -0.4, 1.7, -0.25, '#225c2b', 1.3));
      break;
    case 2: // Low bush cluster
      g.add(blob(0.55, 0, 0.45, 0, '#245f2d', 0.2));
      g.add(blob(0.45, 0.55, 0.35, 0.2, '#2c7337', 0.9));
      g.add(blob(0.4, -0.5, 0.33, -0.15, '#1f5427', 1.6));
      g.add(blob(0.3, 0.1, 0.8, 0.1, '#348543', 0.5));
      break;
    default: // Tall slim pine
      g.add(trunk(0.6, 0.11));
      g.add(cone(0.7, 1.0, 1.0, '#1a4d25'));
      g.add(cone(0.58, 0.9, 1.55, '#21622e'));
      g.add(cone(0.44, 0.8, 2.05, '#287238'));
      g.add(cone(0.28, 0.6, 2.5, '#318542'));
      break;
  }
  return g;
};

const HOUSES = [
  { w: 1.3, h: 0.8, d: 1.0, wall: '#d8c3a0', roof: '#8a3b2e' },
  { w: 1.0, h: 1.1, d: 0.95, wall: '#b7c4cf', roof: '#3f4a5c' },
  { w: 1.5, h: 0.75, d: 1.1, wall: '#c99a74', roof: '#5b3326' },
];

const buildHouse = (variant: number): THREE.Group => {
  const s = HOUSES[variant % HOUSES.length];
  const g = new THREE.Group();
  g.add(box(s.w, s.h, s.d, s.wall, 0, s.h / 2, 0));
  // Gable roof: triangular prism along x
  const roof = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, s.w + 0.15, 3), mat(s.roof));
  // After these rotations: prism axis runs along world x, local x = depth, local z = height (apex up)
  roof.rotation.z = Math.PI / 2;
  roof.rotation.x = -Math.PI / 2;
  const roofHeight = 0.6;
  roof.scale.set((s.d + 0.2) / 1.074, 1, roofHeight / 0.93);
  // Triangle base sits at 1/3 of the apex height below the centre
  roof.position.y = s.h + (roofHeight / 0.93) * 0.31;
  g.add(roof);
  // Chimney
  g.add(box(0.14, 0.4, 0.14, '#6b4a3a', s.w * 0.28, s.h + 0.45, 0.1));
  // Door on the camera-facing wall
  const door = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.36), mat('#4a2e1e'));
  door.position.set(-s.w * 0.25, 0.18, -s.d / 2 - 0.006);
  door.rotation.y = Math.PI;
  g.add(door);
  addWindows(g, s.w, s.d, s.h * 0.55, s.h * 0.55, 1, 0.42, 0.85, 11 + variant, [0.18, 0.18]);
  return g;
};

const roofUnit = (g: THREE.Group, x: number, y: number, z: number) =>
  g.add(box(0.32, 0.2, 0.28, '#4a5165', x, y + 0.1, z));

const antenna = (g: THREE.Group, x: number, y: number, z: number) => {
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.6, 4), mat('#8890a8'));
  pole.position.set(x, y + 0.3, z);
  g.add(pole);
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 6), glow('#ff4d4d', 2.5));
  tip.position.set(x, y + 0.62, z);
  g.add(tip);
};

/** Classic box tower */
const tower = (w: number, h: number, d: number, color: string, seed: number, withAntenna: boolean) => {
  const g = new THREE.Group();
  g.add(box(w, h, d, color, 0, h / 2, 0));
  g.add(box(w + 0.06, 0.08, d + 0.06, '#1c2130', 0, h + 0.04, 0));
  roofUnit(g, w * 0.2, h + 0.08, -d * 0.15);
  if (withAntenna) antenna(g, -w * 0.2, h + 0.08, d * 0.1);
  addWindows(g, w, d, 0.4, h - 0.3, 0.38, 0.3, 0.55, seed);
  return g;
};

/** Tower with a narrower upper block (setback) */
const steppedTower = () => {
  const g = new THREE.Group();
  const [w1, h1, d1] = [1.6, 1.7, 1.4];
  const [w2, h2, d2] = [1.0, 1.7, 0.95];
  g.add(box(w1, h1, d1, '#5b6170', 0, h1 / 2, 0));
  g.add(box(w1 + 0.06, 0.08, d1 + 0.06, '#2a2e38', 0, h1 + 0.04, 0));
  g.add(box(w2, h2, d2, '#6b7282', 0, h1 + h2 / 2, 0));
  g.add(box(w2 + 0.06, 0.08, d2 + 0.06, '#2a2e38', 0, h1 + h2 + 0.04, 0));
  roofUnit(g, 0.15, h1 + h2 + 0.08, 0);
  addWindows(g, w1, d1, 0.35, h1 - 0.3, 0.36, 0.32, 0.5, 211);
  addWindows(g, w2, d2, h1 + 0.3, h1 + h2 - 0.3, 0.36, 0.3, 0.6, 223);
  return g;
};

/** Round glass tower with rings of windows */
const roundTower = () => {
  const g = new THREE.Group();
  const r = 0.62;
  const h = 3.3;
  const body = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 12), mat('#2f4a5a'));
  body.position.y = h / 2;
  g.add(body);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.75, r + 0.05, 0.22, 12), mat('#1d2b36'));
  cap.position.y = h + 0.11;
  g.add(cap);
  const rand = mulberry32(331);
  const lit = glow('#bfe9ff', 1.6);
  const dark = mat('#14202a');
  const pane = new THREE.PlaneGeometry(0.18, 0.2);
  for (let y = 0.4; y < h - 0.2; y += 0.36) {
    for (let i = 0; i < 12; i++) {
      const theta = (i / 12) * Math.PI * 2 + Math.PI / 12;
      const m = new THREE.Mesh(pane, rand() < 0.55 ? lit : dark);
      m.position.set(Math.cos(theta) * (r + 0.005), y, Math.sin(theta) * (r + 0.005));
      // Plane faces +z by default; turn it to face outward along theta
      m.rotation.y = Math.PI / 2 - theta;
      g.add(m);
    }
  }
  return g;
};

/** Wide low-rise brick block with a rooftop water tank */
const lowRise = () => {
  const g = new THREE.Group();
  const [w, h, d] = [2.1, 1.15, 1.3];
  g.add(box(w, h, d, '#6a3f33', 0, h / 2, 0));
  g.add(box(w + 0.08, 0.1, d + 0.08, '#3a2620', 0, h + 0.05, 0));
  const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.4, 8), mat('#7a6a58'));
  tank.position.set(-w * 0.25, h + 0.3, 0.1);
  g.add(tank);
  const lid = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.18, 8), mat('#5a4c3e'));
  lid.position.set(-w * 0.25, h + 0.59, 0.1);
  g.add(lid);
  addWindows(g, w, d, 0.35, h - 0.25, 0.4, 0.34, 0.7, 401, [0.18, 0.22]);
  return g;
};

/** Corner shop with a glowing neon sign and an awning */
const shop = (signColor: string, wall: string, seed: number) => {
  const g = new THREE.Group();
  const [w, h, d] = [1.5, 0.9, 1.1];
  g.add(box(w, h, d, wall, 0, h / 2, 0));
  g.add(box(w + 0.06, 0.08, d + 0.06, '#22252d', 0, h + 0.04, 0));
  // Neon sign over the camera-facing (front) wall
  g.add(box(w * 0.7, 0.16, 0.05, glow(signColor, 2.4), 0, h - 0.12, -d / 2 - 0.04));
  // Awning
  const awning = box(w * 0.85, 0.05, 0.28, '#b8423a', 0, h * 0.55, -d / 2 - 0.14);
  awning.rotation.x = -0.35;
  g.add(awning);
  // Shop window glow
  const win = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.6, 0.3), glow('#ffd892', 1.4));
  win.position.set(0, 0.28, -d / 2 - 0.006);
  win.rotation.y = Math.PI;
  g.add(win);
  addWindows(g, w, d, h * 0.55, h * 0.55, 1, 0.45, 0.4, seed, [0.16, 0.16]);
  return g;
};

// Varied city: towers in different colours/heights, setback tower, round tower, low-rise and shops.
const BUILDING_TYPES: { build: () => THREE.Group; height: number }[] = [
  { build: () => tower(1.3, 3.2, 1.2, '#2c3346', 101, false), height: 3.5 },
  { build: () => tower(1.0, 4.4, 1.0, '#3a4a66', 108, true), height: 5.0 },
  { build: () => tower(1.2, 2.6, 1.2, '#8a8070', 115, false), height: 2.9 },
  { build: steppedTower, height: 3.7 },
  { build: roundTower, height: 3.6 },
  { build: lowRise, height: 1.8 },
  { build: () => shop('#ff4fa3', '#3b4455', 501), height: 1.2 },
  { build: () => shop('#4fd1ff', '#5a4a3a', 509), height: 1.2 },
];

const buildStreetlight = (): THREE.Group => {
  const g = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.07, 2.2, 6), mat('#3b4150'));
  pole.position.y = 1.1;
  g.add(pole);
  g.add(box(0.26, 0.06, 0.26, '#2a2f3a', 0, 2.22, 0));
  g.add(box(0.2, 0.2, 0.2, glow('#fff1c2', 2.6), 0, 2.35, 0));
  g.add(box(0.28, 0.05, 0.28, '#2a2f3a', 0, 2.47, 0));
  return g;
};

// ---------- Lighting presets ----------

type Preset = {
  hemi: [string, string, number];
  key: [string, number, [number, number, number]];
  rim: [string, number];
  shadow: number;
};

const PRESETS: Record<Zone, Preset> = {
  base: { hemi: ['#cfe9d4', '#0b2410', 1.1], key: ['#ffffff', 2.2, [4, 10, 3]], rim: ['#a6e3e9', 0.8], shadow: 0.45 },
  morning: { hemi: ['#fff4d6', '#2a5a20', 1.45], key: ['#fff0cc', 2.8, [6, 9, 2]], rim: ['#bfe6ff', 0.6], shadow: 0.4 },
  evening: { hemi: ['#ffb27a', '#2a1630', 0.85], key: ['#ff8a3d', 2.6, [-8, 4.5, 3]], rim: ['#b07cff', 0.8], shadow: 0.5 },
  night: { hemi: ['#6f86c9', '#05070f', 0.5], key: ['#9fb4ff', 0.8, [-3, 10, 4]], rim: ['#4a6cff', 0.5], shadow: 0.3 },
};

// ---------- What to render ----------

type Job = { kind: SpriteKind; zone: Zone; build: () => THREE.Group; rotY: number; height: number };

const TREE_HEIGHTS = [2.4, 2.4, 1.0, 2.8];

const jobs: Job[] = [];
for (const zone of ['base', 'morning', 'evening', 'night'] as Zone[]) {
  const rotations = zone === 'night' ? [0] : [0, 2.1];
  for (let v = 0; v < 4; v++)
    for (const rotY of rotations) jobs.push({ kind: 'tree', zone, build: () => buildTree(v), rotY, height: TREE_HEIGHTS[v] });
}
HOUSES.forEach((h, v) => jobs.push({ kind: 'house', zone: 'evening', build: () => buildHouse(v), rotY: 0.35 * (v - 1), height: h.h + 0.6 }));
BUILDING_TYPES.forEach((b, v) => jobs.push({ kind: 'building', zone: 'night', build: b.build, rotY: 0.3 * (v % 2 ? 1 : -1), height: b.height }));
jobs.push({ kind: 'streetlight', zone: 'night', build: buildStreetlight, rotY: 0, height: 2.5 });

// Frame sizes: a tree frame is 8 units away; buildings need a bigger frame
const FRAMING: Record<SpriteKind, { distance: number; targetY: number }> = {
  tree: { distance: 8, targetY: 1.1 },
  house: { distance: 8, targetY: 0.8 },
  building: { distance: 13, targetY: 2.2 },
  streetlight: { distance: 8, targetY: 1.1 },
};

const disposeTree = (obj: THREE.Object3D) => {
  const mats = new Set<THREE.Material>();
  const geos = new Set<THREE.BufferGeometry>();
  obj.traverse((o) => {
    const m = o as THREE.Mesh;
    if (m.isMesh) {
      geos.add(m.geometry);
      mats.add(m.material as THREE.Material);
    }
  });
  geos.forEach((g) => g.dispose());
  mats.forEach((m) => m.dispose());
};

const nextFrame = () => new Promise<void>((r) => setTimeout(r, 0));

let cache: Promise<SpriteSets> | null = null;

/** Renders every low-poly model once from the car's camera angle and returns them as images, grouped by kind+zone. */
export const getSceneSprites = (): Promise<SpriteSets> => {
  if (cache) return cache;
  cache = (async () => {
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setSize(SPRITE_PX, SPRITE_PX, false);
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    const hemi = new THREE.HemisphereLight();
    scene.add(hemi);

    const key = new THREE.DirectionalLight();
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.radius = 4;
    Object.assign(key.shadow.camera, { left: -4, right: 4, top: 6, bottom: -4, near: 0.5, far: 40 });
    scene.add(key);

    const rim = new THREE.DirectionalLight();
    rim.position.set(-10, 5, -10);
    scene.add(rim);

    const groundMat = new THREE.ShadowMaterial({ opacity: 0.45 });
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);
    const sets: SpriteSets = {};

    for (const job of jobs) {
      const p = PRESETS[job.zone];
      hemi.color.set(p.hemi[0]);
      hemi.groundColor.set(p.hemi[1]);
      hemi.intensity = p.hemi[2];
      key.color.set(p.key[0]);
      key.intensity = p.key[1];
      key.position.set(...p.key[2]);
      rim.color.set(p.rim[0]);
      rim.intensity = p.rim[1];
      groundMat.opacity = p.shadow;

      const { distance, targetY } = FRAMING[job.kind];
      const target = new THREE.Vector3(0, targetY, 0);
      camera.position.copy(CAMERA_DIR).multiplyScalar(distance).add(target);
      camera.lookAt(target);
      camera.updateMatrixWorld();
      const base = new THREE.Vector3(0, 0, 0).project(camera);

      const model = job.build();
      model.rotation.y = job.rotY;
      model.traverse((o) => {
        if ((o as THREE.Mesh).isMesh) o.castShadow = true;
      });
      scene.add(model);
      renderer.render(scene, camera);

      const keyName = spriteSetKey(job.kind, job.zone);
      (sets[keyName] ??= []).push({
        url: renderer.domElement.toDataURL('image/png'),
        anchorX: (base.x + 1) / 2,
        anchorY: (1 - base.y) / 2,
        frameUnits: 2 * distance * Math.tan(THREE.MathUtils.degToRad(FOV / 2)),
        height: job.height,
      });

      scene.remove(model);
      disposeTree(model);
      // Yield between renders so page load stays responsive
      await nextFrame();
    }

    ground.geometry.dispose();
    groundMat.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
    return sets;
  })();
  return cache;
};
