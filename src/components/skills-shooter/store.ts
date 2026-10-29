import { useSyncExternalStore } from "react";
import { Vector3 } from "three";
import { skillsData } from "../../data/skills";

export type Status = "idle" | "playing" | "paused" | "won";

export type Target = { id: string; skill: string; cat: number; color: string };

// Flat list of every skill, one asteroid each
export const targets: Target[] = skillsData.flatMap((c, cat) =>
  c.skills.map((skill) => ({ id: `${cat}:${skill}`, skill, cat, color: c.accent }))
);

type State = {
  status: Status;
  wave: number;
  destroyed: ReadonlySet<string>;
  lastHit: { skill: string; color: string; n: number } | null;
  skipped: boolean;
};

const initial: State = { status: "idle", wave: 0, destroyed: new Set(), lastHit: null, skipped: false };
let state = initial;
const listeners = new Set<() => void>();

const set = (next: Partial<State>) => {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
};

// First category that still has skills left
const waveFor = (destroyed: ReadonlySet<string>) =>
  skillsData.findIndex((_, cat) => targets.some((t) => t.cat === cat && !destroyed.has(t.id)));

export const game = {
  get: () => state,
  subscribe: (l: () => void) => {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  start: () => set({ ...initial, status: "playing" }),
  reset: () => set(initial),
  pause: () => state.status === "playing" && set({ status: "paused" }),
  resume: () => state.status === "paused" && set({ status: "playing" }),
  showAll: () => set({ status: "won", skipped: true, destroyed: new Set(targets.map((t) => t.id)) }),
  hit: (t: Target) => {
    if (state.destroyed.has(t.id)) return;
    const destroyed = new Set(state.destroyed).add(t.id);
    const wave = waveFor(destroyed);
    set({
      destroyed,
      wave: wave === -1 ? state.wave : wave,
      status: wave === -1 ? "won" : state.status,
      lastHit: { skill: t.skill, color: t.color, n: (state.lastHit?.n ?? 0) + 1 },
    });
  },
};

export const useGame = () => useSyncExternalStore(game.subscribe, game.get);

// Per-frame mutable state shared between scene objects (never triggers React renders)
export const BOLT_COUNT = 30;
export const world = {
  ship: new Vector3(0, -1, 4),
  firing: false,
  keys: new Set<string>(),
  shake: 0,
  bolts: Array.from({ length: BOLT_COUNT }, () => ({ active: false, pos: new Vector3() })),
  explode: (_pos: Vector3, _color: string) => {},
};
