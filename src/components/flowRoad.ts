// Shared road geometry for Grow With The Flow (SVG viewBox 1000 x 5000).
// After TODAY the road bends right and runs off to the right; the car parks on that straight.

export const ROAD_D =
  'M 500 0 C 500 400, 200 600, 200 1000 S 800 1400, 800 1800 S 200 2200, 200 2600 ' +
  'S 800 3000, 800 3400 S 200 3800, 200 4200 C 200 4560, 300 4720, 520 4720 L 1000 4720';

/** y of the final horizontal stretch */
export const ROAD_END_Y = 4720;
/** x on the final stretch where the car parks */
export const STOP_X = 700;

const cache = new WeakMap<SVGPathElement, number>();

/** Road progress (0..1) of the parking spot. */
export const findStopT = (pathEl: SVGPathElement): number => {
  const hit = cache.get(pathEl);
  if (hit !== undefined) return hit;
  const len = pathEl.getTotalLength();
  let stopT = 1;
  for (let i = 0; i <= 4000; i++) {
    const pt = pathEl.getPointAtLength((len * i) / 4000);
    if (pt.y >= ROAD_END_Y - 2 && pt.x >= STOP_X) {
      stopT = i / 4000;
      break;
    }
  }
  cache.set(pathEl, stopT);
  return stopT;
};
