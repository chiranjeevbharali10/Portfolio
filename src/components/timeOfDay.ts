// Time-of-day across the Grow With The Flow drive:
// 2020 = base (original dark green) -> 2023 morning -> 2025 evening -> 2026/TODAY night.

export type Zone = 'base' | 'morning' | 'evening' | 'night';
export type PhaseWeights = Record<Zone, number>;

// Milestone y positions in the road's 1000x5000 viewBox (2020, 2023, 2025, 2026, TODAY)
const MILESTONE_Y = [1000, 1800, 2600, 3400, 4200];

// Fallback until the path has been measured
let milestoneT = [0.2, 0.36, 0.52, 0.68, 0.84];
let measuredPath: SVGPathElement | null = null;

/** Finds the road progress (0..1) at which the car passes each milestone. Cheap after the first call. */
export const ensureMilestones = (pathEl: SVGPathElement) => {
  if (measuredPath === pathEl) return;
  const len = pathEl.getTotalLength();
  const steps = 1000;
  const pts: { t: number; y: number }[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    pts.push({ t, y: pathEl.getPointAtLength(len * t).y });
  }
  milestoneT = MILESTONE_Y.map((my) => {
    let best = pts[0];
    for (const p of pts) if (Math.abs(p.y - my) < Math.abs(best.y - my)) best = p;
    return best.t;
  });
  measuredPath = pathEl;
};

export const getMilestoneT = () => milestoneT;

const smoothstep = (x: number) => {
  const c = Math.min(1, Math.max(0, x));
  return c * c * (3 - 2 * c);
};

const lerpAt = (a: number, b: number, k: number) => a + (b - a) * k;

/** Blend stops: each phase is fully on from one stop and blends into the next phase over the gap. */
const getStops = (): { t: number; zone: Zone }[] => {
  const [m0, m1, m2, m3] = milestoneT;
  return [
    { t: lerpAt(m0, m1, 0.3), zone: 'base' },
    { t: lerpAt(m0, m1, 0.8), zone: 'morning' },
    { t: lerpAt(m1, m2, 0.3), zone: 'morning' },
    { t: lerpAt(m1, m2, 0.8), zone: 'evening' },
    { t: lerpAt(m2, m3, 0.3), zone: 'evening' },
    { t: lerpAt(m2, m3, 0.85), zone: 'night' },
  ];
};

export const getPhaseWeights = (p: number): PhaseWeights => {
  const w: PhaseWeights = { base: 0, morning: 0, evening: 0, night: 0 };
  const stops = getStops();
  if (p <= stops[0].t) {
    w[stops[0].zone] = 1;
    return w;
  }
  for (let i = 0; i < stops.length - 1; i++) {
    const a = stops[i];
    const b = stops[i + 1];
    if (p <= b.t) {
      const k = smoothstep((p - a.t) / (b.t - a.t || 1));
      w[a.zone] += 1 - k;
      w[b.zone] += k;
      return w;
    }
  }
  w[stops[stops.length - 1].zone] = 1;
  return w;
};

/** Dominant phase at a road position — used to pick scenery. */
export const getZone = (t: number): Zone => {
  const w = getPhaseWeights(t);
  return (Object.keys(w) as Zone[]).reduce((a, b) => (w[b] > w[a] ? b : a));
};
