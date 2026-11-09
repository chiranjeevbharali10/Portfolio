/**
 * A tiny, real neuroevolution sandbox (in the spirit of the NEAT car project):
 * every car is a small neural network (5 distance sensors -> 6 hidden -> steering).
 * Cars that get furthest round the track are kept and mutated into the next generation.
 * Fixed topology instead of full NEAT, so it stays small enough to run in the page.
 */

export const W = 900;
export const H = 520;
export const ROAD = 64; // road width (logical px)
export const POP = 36;
const SENSORS = [-1.05, -0.5, 0, 0.5, 1.05]; // radians
const SENSOR_RANGE = 170;
const HIDDEN = 6;
const SPEED = 3.1;
const MAX_TURN = 0.075;
const MAX_FRAMES = 1800;
const ELITES = 5;

type Pt = { x: number; y: number };

export interface Car {
  x: number;
  y: number;
  angle: number;
  alive: boolean;
  seg: number; // nearest centre-line point index
  laps: number;
  progress: number; // distance along the centre line (+ laps * length)
  frames: number;
  brain: Float32Array;
  sensors: number[]; // last readings 0..1 (for drawing)
  elite: boolean;
}

const N_IN = SENSORS.length + 1; // + bias
const N_W = N_IN * HIDDEN + (HIDDEN + 1);

const randn = () => {
  const u = 1 - Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * Math.random());
};

const randomBrain = () => {
  const b = new Float32Array(N_W);
  for (let i = 0; i < N_W; i++) b[i] = randn() * 0.9;
  return b;
};

const mutate = (src: Float32Array, rate: number) => {
  const b = new Float32Array(src);
  for (let i = 0; i < b.length; i++) if (Math.random() < rate) b[i] += randn() * 0.45;
  return b;
};

const think = (brain: Float32Array, inputs: number[]) => {
  let out = brain[N_W - 1]; // output bias
  for (let h = 0; h < HIDDEN; h++) {
    let s = 0;
    for (let i = 0; i < N_IN; i++) s += brain[h * N_IN + i] * inputs[i];
    out += Math.tanh(s) * brain[N_IN * HIDDEN + h];
  }
  return Math.tanh(out);
};

/** Resample a freehand stroke into evenly spaced centre-line points */
export const resample = (pts: Pt[], spacing = 14): Pt[] => {
  if (pts.length < 2) return pts;
  const out: Pt[] = [pts[0]];
  let carry = 0;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    const d = Math.hypot(b.x - a.x, b.y - a.y);
    let t = spacing - carry;
    while (t <= d) {
      out.push({ x: a.x + ((b.x - a.x) * t) / d, y: a.y + ((b.y - a.y) * t) / d });
      t += spacing;
    }
    carry = d - (t - spacing);
  }
  return out;
};

/** Default loop: a wobbly oval with a couple of tight bends */
export const defaultTrack = (): Pt[] => {
  const pts: Pt[] = [];
  for (let i = 0; i < 160; i++) {
    const a = (i / 160) * Math.PI * 2;
    const r = 1 + 0.18 * Math.sin(3 * a) + 0.08 * Math.sin(5 * a + 1);
    pts.push({ x: W / 2 + Math.cos(a) * 330 * r, y: H / 2 + Math.sin(a) * 175 * r });
  }
  return resample([...pts, pts[0]]);
};

export class CarSim {
  track: Pt[] = [];
  cum: number[] = [];
  length = 0;
  mask: Uint8Array = new Uint8Array(W * H);
  cars: Car[] = [];
  generation = 1;
  frame = 0;
  best = 0; // best progress fraction this generation
  bestEver = 0;
  history: number[] = []; // best fraction per finished generation

  constructor(track: Pt[]) {
    this.setTrack(track);
  }

  setTrack(track: Pt[]) {
    this.track = track;
    this.cum = [0];
    for (let i = 1; i < track.length; i++) {
      this.cum.push(this.cum[i - 1] + Math.hypot(track[i].x - track[i - 1].x, track[i].y - track[i - 1].y));
    }
    const last = track[track.length - 1];
    this.length = this.cum[this.cum.length - 1] + Math.hypot(track[0].x - last.x, track[0].y - last.y);
    this.buildMask();
    this.generation = 1;
    this.history = [];
    this.bestEver = 0;
    this.spawn(Array.from({ length: POP }, randomBrain));
  }

  private buildMask() {
    const c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    const ctx = c.getContext('2d', { willReadFrequently: true })!;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = ROAD;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    this.track.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
    ctx.closePath();
    ctx.stroke();
    const data = ctx.getImageData(0, 0, W, H).data;
    this.mask = new Uint8Array(W * H);
    for (let i = 0; i < W * H; i++) this.mask[i] = data[i * 4 + 3] > 128 ? 1 : 0;
  }

  onRoad(x: number, y: number) {
    const xi = x | 0;
    const yi = y | 0;
    if (xi < 0 || yi < 0 || xi >= W || yi >= H) return false;
    return this.mask[yi * W + xi] === 1;
  }

  private spawn(brains: Float32Array[], elites = 0) {
    const a = this.track[0];
    const b = this.track[2] ?? this.track[1];
    const angle = Math.atan2(b.y - a.y, b.x - a.x);
    this.cars = brains.map((brain, i) => ({
      x: a.x,
      y: a.y,
      angle,
      alive: true,
      seg: 0,
      laps: 0,
      progress: 0,
      frames: 0,
      brain,
      sensors: SENSORS.map(() => 1),
      elite: i < elites,
    }));
    this.frame = 0;
    this.best = 0;
  }

  private sense(car: Car) {
    car.sensors = SENSORS.map((off) => {
      const a = car.angle + off;
      const dx = Math.cos(a);
      const dy = Math.sin(a);
      for (let d = 4; d < SENSOR_RANGE; d += 4) {
        if (!this.onRoad(car.x + dx * d, car.y + dy * d)) return d / SENSOR_RANGE;
      }
      return 1;
    });
  }

  private trackProgress(car: Car) {
    const n = this.track.length;
    let bestI = car.seg;
    let bestD = Infinity;
    for (let k = -4; k <= 12; k++) {
      const i = (car.seg + k + n) % n;
      const p = this.track[i];
      const d = (p.x - car.x) ** 2 + (p.y - car.y) ** 2;
      if (d < bestD) {
        bestD = d;
        bestI = i;
      }
    }
    if (bestI < car.seg - n / 2) car.laps++; // wrapped forwards
    else if (bestI > car.seg + n / 2) car.laps--; // wrapped backwards
    car.seg = bestI;
    car.progress = car.laps * this.length + this.cum[bestI];
  }

  /** Advance one simulation frame; returns true when a new generation started */
  step(): boolean {
    let alive = 0;
    for (const car of this.cars) {
      if (!car.alive) continue;
      this.sense(car);
      const steer = think(car.brain, [...car.sensors, 1]);
      car.angle += steer * MAX_TURN;
      car.x += Math.cos(car.angle) * SPEED;
      car.y += Math.sin(car.angle) * SPEED;
      car.frames++;
      this.trackProgress(car);
      if (!this.onRoad(car.x, car.y)) car.alive = false;
      else alive++;
      this.best = Math.max(this.best, car.progress / this.length);
    }
    this.frame++;
    if (alive === 0 || this.frame >= MAX_FRAMES) {
      this.evolve();
      return true;
    }
    return false;
  }

  private evolve() {
    const ranked = [...this.cars].sort((a, b) => b.progress - a.progress);
    this.history.push(Math.max(0, ranked[0].progress / this.length));
    if (this.history.length > 40) this.history.shift();
    this.bestEver = Math.max(this.bestEver, ranked[0].progress / this.length);
    const elites = ranked.slice(0, ELITES).map((c) => c.brain);
    const next: Float32Array[] = [...elites];
    while (next.length < POP) {
      // Fitter parents are picked more often
      const parent = elites[Math.floor(Math.random() ** 2 * ELITES)];
      next.push(mutate(parent, next.length < POP * 0.6 ? 0.15 : 0.35));
    }
    // A couple of fresh brains keep the gene pool from going stale
    next[POP - 1] = randomBrain();
    this.generation++;
    this.spawn(next, ELITES);
  }

  aliveCount() {
    return this.cars.reduce((n, c) => n + (c.alive ? 1 : 0), 0);
  }
}
