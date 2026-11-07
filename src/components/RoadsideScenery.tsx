import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { MutableRefObject, RefObject } from 'react';
import { gsap } from 'gsap';
import { getSceneSprites, spriteSetKey } from './sceneSprites';
import type { SceneSprite, SpriteKind, SpriteSets } from './sceneSprites';
import { ensureMilestones, getZone } from './timeOfDay';
import type { Zone } from './timeOfDay';
import { NightLake } from './NightLake';

export type RoadsideSceneryController = { update: (progress: number) => void };

type Item = {
  left: number; // % of container width
  top: number; // % of container height
  t: number; // road progress at which it pops
  kind: SpriteKind;
  set: string;
  variant: number;
  scale: number; // px per world unit
};

type Lake = { left: number; top: number; width: number; height: number; t: number };

// SVG viewBox of the road in FlowJourney
const VB_W = 1000;
const VB_H = 5000;
const ROAD_HALF_WIDTH_PX = 105;
const POP_LEAD = 0.03; // items pop slightly ahead of the car

// Footprint radius (world units) and px-per-unit range per kind
const KIND_SPEC: Record<SpriteKind, { foot: number; scale: [number, number] }> = {
  tree: { foot: 0.95, scale: [25, 46] },
  house: { foot: 0.9, scale: [32, 42] },
  building: { foot: 0.85, scale: [30, 38] },
  streetlight: { foot: 0.2, scale: [30, 30] },
};

// How much of a model's height shows on screen at the car's camera tilt (~56°)
const HEIGHT_ON_SCREEN = 0.55;

const mulberry32 = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let r = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
  return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
};

type Props = {
  pathRef: RefObject<SVGPathElement | null>;
  controllerRef: MutableRefObject<RoadsideSceneryController | null>;
  getProgress: () => number;
};

export const RoadsideScenery = ({ pathRef, controllerRef, getProgress }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemEls = useRef<(HTMLImageElement | null)[]>([]);
  const glowEls = useRef<(HTMLDivElement | null)[]>([]);
  const lakeEl = useRef<HTMLDivElement>(null);
  const shown = useRef<boolean[]>([]);
  const glowOn = useRef<boolean[]>([]);
  const lakeShown = useRef(false);

  const [sprites, setSprites] = useState<SpriteSets | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [lake, setLake] = useState<Lake | null>(null);

  useEffect(() => {
    let alive = true;
    getSceneSprites().then((s) => {
      if (alive) setSprites(s);
    });
    return () => {
      alive = false;
    };
  }, []);

  const spriteFor = useCallback(
    (item: Item): SceneSprite | null => {
      const set = sprites?.[item.set];
      return set ? set[item.variant % set.length] : null;
    },
    [sprites]
  );

  const computeLayout = useCallback(() => {
    const pathEl = pathRef.current;
    const container = containerRef.current;
    if (!pathEl || !container || !sprites) return;

    const W = container.offsetWidth;
    const H = container.offsetHeight;
    if (!W || !H) return;

    ensureMilestones(pathEl);

    const containerRect = container.getBoundingClientRect();
    // Milestone text boxes (in container px), padded, so scenery never covers the copy
    const textRects = Array.from(
      // Milestone copy + anything marked as off-limits (e.g. the parking lot)
      document.querySelectorAll<Element>('.timeline-section .milestone-block, .timeline-section .scenery-avoid')
    ).map((el) => {
      const r = el.getBoundingClientRect();
      const pad = 40;
      return {
        x1: r.left - containerRect.left - pad,
        x2: r.right - containerRect.left + pad,
        y1: r.top - containerRect.top - pad,
        y2: r.bottom - containerRect.top + pad,
      };
    });
    const hitsText = (x1: number, x2: number, y1: number, y2: number) =>
      textRects.some((tr) => x2 > tr.x1 && x1 < tr.x2 && y2 > tr.y1 && y1 < tr.y2);

    const len = pathEl.getTotalLength();
    const rand = mulberry32(1337);
    const toPx = (p: DOMPoint) => ({ x: (p.x / VB_W) * W, y: (p.y / VB_H) * H });

    const roadSamples: { x: number; y: number; t: number }[] = [];
    for (let s = 0; s <= 1; s += 0.004) roadSamples.push({ ...toPx(pathEl.getPointAtLength(len * s)), t: s });
    const nearRoad = (x: number, y: number, dist: number) =>
      roadSamples.some((q) => Math.hypot(q.x - x, q.y - y) < dist);

    // ---- Lake: the open space on the left, just after the 2026 milestone ----
    // Try the biggest lake first; within each size pick the free spot closest to the middle of that empty area.
    let lakeResult: Lake | null = null;
    let lakeW = 0;
    let lakeH = 0;
    const [m2026Y, todayY] = [3400 / VB_H, 4200 / VB_H]; // milestone positions as a fraction of the section
    const target = { x: W * 0.27, y: H * (m2026Y + (todayY - m2026Y) * 0.42) };
    for (const size of [Math.min(620, W * 0.46), Math.min(540, W * 0.4), Math.min(460, W * 0.34), Math.min(380, W * 0.28)]) {
      const w = size;
      const h = size * 0.5;
      let best: { cx: number; cy: number; d: number } | null = null;
      for (let fy = m2026Y + 0.01; fy <= todayY - 0.01; fy += 0.004) {
        for (let fx = 0.02; fx <= 0.6; fx += 0.01) {
          const cx = W * fx;
          const cy = H * fy;
          if (cx - w / 2 < 8 || cx + w / 2 > W - 8) continue;
          const hitsRoad = roadSamples.some(
            (q) =>
              ((q.x - cx) / (w / 2 + ROAD_HALF_WIDTH_PX + 24)) ** 2 + ((q.y - cy) / (h / 2 + ROAD_HALF_WIDTH_PX + 24)) ** 2 < 1
          );
          if (hitsRoad) continue;
          if (hitsText(cx - w / 2, cx + w / 2, cy - h / 2 - 40, cy + h / 2)) continue;
          const d = Math.hypot(cx - target.x, cy - target.y);
          if (!best || d < best.d) best = { cx, cy, d };
        }
      }
      if (best) {
        lakeW = w;
        lakeH = h;
        const nearest = roadSamples.reduce((a, b) => (Math.abs(b.y - best.cy) < Math.abs(a.y - best.cy) ? b : a));
        lakeResult = { left: (best.cx / W) * 100, top: (best.cy / H) * 100, width: w, height: h, t: nearest.t - 0.05 };
        break;
      }
    }
    const inLake = (x: number, y: number, r: number) => {
      if (!lakeResult) return false;
      const cx = (lakeResult.left / 100) * W;
      const cy = (lakeResult.top / 100) * H;
      return ((x - cx) / (lakeW / 2 + r + 10)) ** 2 + ((y - cy) / (lakeH / 2 + r + 10)) ** 2 < 1;
    };

    const placed: { x: number; y: number; r: number }[] = [];
    const result: Item[] = [];

    const tryPlace = (
      kind: SpriteKind,
      zone: Zone,
      t: number,
      x: number,
      y: number,
      scale: number,
      opts: { skipCanopy?: boolean } = {}
    ) => {
      const set = spriteSetKey(kind, zone);
      const variants = sprites[set];
      if (!variants?.length) return false;
      const variant = Math.floor(rand() * variants.length);
      const sprite = variants[variant];
      const r = KIND_SPEC[kind].foot * scale;
      const tall = sprite.height * scale * HEIGHT_ON_SCREEN;

      if (x - r < 0 || x + r > W) return false;
      if (hitsText(x - r, x + r, y - tall - r * 0.5, y + r * 0.5)) return false;
      if (placed.some((p) => Math.hypot(p.x - x, p.y - y) < (p.r + r) * 0.85)) return false;
      if (inLake(x, y, r)) return false;
      if (nearRoad(x, y, ROAD_HALF_WIDTH_PX + r * 0.6)) return false;
      if (!opts.skipCanopy && nearRoad(x, y - tall * 0.6, ROAD_HALF_WIDTH_PX + r * 0.7)) return false;

      placed.push({ x, y, r });
      result.push({ left: (x / W) * 100, top: (y / H) * 100, t, kind, set, variant, scale });
      return true;
    };

    const sampleAt = (t: number) => {
      const a = toPx(pathEl.getPointAtLength(len * t));
      const b = toPx(pathEl.getPointAtLength(len * Math.min(t + 0.002, 1)));
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const mag = Math.hypot(dx, dy) || 1;
      return { a, tx: dx / mag, ty: dy / mag, nx: -dy / mag, ny: dx / mag };
    };
    const randScale = (kind: SpriteKind) => {
      const [lo, hi] = KIND_SPEC[kind].scale;
      return lo + rand() * (hi - lo);
    };

    // ---- Streetlights first (night): evenly spaced right at the road edge ----
    let side = 1;
    for (let t = 0.03; t < 0.985; t += 0.011) {
      if (getZone(t) !== 'night') continue;
      const { a, nx, ny } = sampleAt(t);
      const scale = randScale('streetlight');
      const off = ROAD_HALF_WIDTH_PX + 14;
      tryPlace('streetlight', 'night', t, a.x + nx * off * side, a.y + ny * off * side, scale, { skipCanopy: true });
      side *= -1;
    }

    // ---- Main scenery along the road ----
    for (let t = 0.03; t < 0.97; t += 0.014) {
      const zone = getZone(t);
      const { a, tx, ty, nx, ny } = sampleAt(t);
      const night = zone === 'night';
      const count = night ? 2 : rand() < 0.35 ? 2 : 1;
      let s = rand() < 0.5 ? -1 : 1;

      for (let k = 0; k < count; k++, s *= -1) {
        let kind: SpriteKind = 'tree';
        if (zone === 'evening') kind = rand() < 0.6 ? 'house' : 'tree';
        if (night) kind = 'building';
        const scale = randScale(kind);
        const r = KIND_SPEC[kind].foot * scale;
        const offset = ROAD_HALF_WIDTH_PX + r + (night ? 30 + rand() * 170 : rand() * 110);
        const along = (rand() - 0.5) * 60;
        const x = a.x + nx * offset * s + tx * along;
        const y = a.y + ny * offset * s + ty * along;
        tryPlace(kind, zone === 'base' ? 'base' : zone, t, x, y, scale);
      }
    }

    // ---- A few dark trees on the lake's far shore ----
    if (lakeResult) {
      const cx = (lakeResult.left / 100) * W;
      const cy = (lakeResult.top / 100) * H;
      for (let i = 0; i < 7; i++) {
        const ang = Math.PI * (1.1 + (i / 6) * 0.8) + (rand() - 0.5) * 0.2; // upper arc = far shore
        const x = cx + Math.cos(ang) * (lakeW / 2 + 6);
        const y = cy + Math.sin(ang) * (lakeH / 2 + 4);
        const scale = 24 + rand() * 12;
        const variants = sprites[spriteSetKey('tree', 'night')];
        if (!variants?.length) break;
        if (nearRoad(x, y, ROAD_HALF_WIDTH_PX + 20)) continue;
        if (hitsText(x - scale, x + scale, y - scale * 1.6, y + scale * 0.5)) continue;
        if (placed.some((p) => Math.hypot(p.x - x, p.y - y) < p.r + 12)) continue;
        placed.push({ x, y, r: scale * 0.9 });
        result.push({
          left: (x / W) * 100,
          top: (y / H) * 100,
          t: lakeResult.t,
          kind: 'tree',
          set: spriteSetKey('tree', 'night'),
          variant: Math.floor(rand() * variants.length),
          scale,
        });
      }
    }

    shown.current = result.map(() => false);
    glowOn.current = result.map(() => false);
    lakeShown.current = false;
    setItems(result);
    setLake(lakeResult);
  }, [pathRef, sprites]);

  const update = useCallback(
    (progress: number) => {
      items.forEach((item, i) => {
        const el = itemEls.current[i];
        if (!el) return;

        const shouldShow = item.t <= progress + POP_LEAD;
        if (shouldShow !== shown.current[i]) {
          shown.current[i] = shouldShow;
          if (shouldShow) {
            if (item.kind === 'building') {
              // Buildings rise out of the ground
              gsap.fromTo(
                el,
                { scaleX: 0.85, scaleY: 0, autoAlpha: 0 },
                { scaleX: 1, scaleY: 1, autoAlpha: 1, duration: 0.9, ease: 'power3.out', overwrite: true }
              );
            } else {
              // Sprout from the ground with a springy bounce
              gsap.fromTo(
                el,
                { scaleX: 0.2, scaleY: 0, autoAlpha: 0 },
                { scaleX: 1, scaleY: 1, autoAlpha: 1, duration: 0.8, ease: 'elastic.out(1, 0.55)', overwrite: true }
              );
            }
          } else {
            gsap.to(el, { scaleX: 0.2, scaleY: 0, autoAlpha: 0, duration: 0.3, ease: 'power2.in', overwrite: true });
          }
        }

        // Streetlights switch on as the car passes them
        const glow = glowEls.current[i];
        if (glow) {
          const on = progress >= item.t - 0.004;
          if (on !== glowOn.current[i]) {
            glowOn.current[i] = on;
            gsap.to(glow, { autoAlpha: on ? 1 : 0, duration: on ? 0.5 : 0.25, ease: on ? 'power2.out' : 'power2.in', overwrite: true });
          }
        }
      });

      if (lake && lakeEl.current) {
        const show = lake.t <= progress + POP_LEAD;
        if (show !== lakeShown.current) {
          lakeShown.current = show;
          gsap.to(lakeEl.current, {
            autoAlpha: show ? 1 : 0,
            scale: show ? 1 : 0.6,
            duration: show ? 1.1 : 0.4,
            ease: show ? 'power3.out' : 'power2.in',
            overwrite: true,
          });
        }
      }
    },
    [items, lake]
  );

  // Layout once sprites are ready (road and milestones are already in the DOM); recompute on resize
  useLayoutEffect(() => {
    computeLayout();
    let timer: number | undefined;
    const onResize = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(computeLayout, 200);
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      window.clearTimeout(timer);
    };
  }, [computeLayout]);

  // Expose update to FlowJourney and sync with the current scroll position
  useEffect(() => {
    controllerRef.current = { update };
    update(getProgress());
    return () => {
      if (controllerRef.current?.update === update) controllerRef.current = null;
    };
  }, [update, controllerRef, getProgress]);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full max-w-[1400px] mx-auto pointer-events-none z-[15]">
      {lake && (
        <div
          className="absolute"
          style={{
            left: `${lake.left}%`,
            top: `${lake.top}%`,
            width: lake.width,
            height: lake.height,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div ref={lakeEl} className="w-full h-full" style={{ opacity: 0, visibility: 'hidden', transform: 'scale(0.6)' }}>
            <NightLake />
          </div>
        </div>
      )}

      {items.map((item, i) => {
        const sprite = spriteFor(item);
        if (!sprite) return null;
        const box = item.scale * sprite.frameUnits;
        const isLight = item.kind === 'streetlight';
        return (
          <div
            key={`${i}-${item.set}-${item.left.toFixed(2)}-${item.top.toFixed(2)}`}
            className="absolute"
            style={{
              left: `${item.left}%`,
              top: `${item.top}%`,
              width: box,
              height: box,
              // Plant the model's base exactly on the computed spot
              transform: `translate(${-sprite.anchorX * 100}%, ${-sprite.anchorY * 100}%)`,
            }}
          >
            {isLight && (
              <div
                ref={(el) => { glowEls.current[i] = el; }}
                className="absolute"
                style={{ left: `${sprite.anchorX * 100}%`, top: `${sprite.anchorY * 100}%`, opacity: 0, visibility: 'hidden' }}
              >
                {/* Pool of light on the ground */}
                <div
                  className="absolute rounded-full"
                  style={{
                    width: 150,
                    height: 90,
                    transform: 'translate(-50%, -50%)',
                    background: 'radial-gradient(ellipse at center, rgba(255,214,130,0.32) 0%, rgba(255,200,110,0.1) 45%, rgba(255,200,110,0) 70%)',
                  }}
                />
                {/* Halo around the lamp head */}
                <div
                  className="absolute rounded-full"
                  style={{
                    width: 46,
                    height: 46,
                    transform: `translate(-50%, calc(-50% - ${item.scale * 2.35 * HEIGHT_ON_SCREEN * 1.05}px))`,
                    background: 'radial-gradient(circle, rgba(255,240,190,0.75) 0%, rgba(255,220,140,0.22) 40%, rgba(255,220,140,0) 70%)',
                  }}
                />
              </div>
            )}
            <img
              ref={(el) => { itemEls.current[i] = el; }}
              src={sprite.url}
              alt=""
              draggable={false}
              decoding="async"
              className="relative w-full h-full select-none"
              style={{
                transform: 'scale(0)',
                opacity: 0,
                visibility: 'hidden',
                transformOrigin: `${sprite.anchorX * 100}% ${sprite.anchorY * 100}%`,
              }}
            />
          </div>
        );
      })}
    </div>
  );
};
