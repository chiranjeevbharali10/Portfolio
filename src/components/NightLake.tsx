import { useMemo } from 'react';

// Small deterministic PRNG so the details are the same every load
const mulberry32 = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let r = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
  return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
};

// Irregular, natural shoreline (viewBox 420 x 210), with a cove on the near side
const SHORE =
  'M30 112 C 22 78, 60 46, 112 40 C 150 35, 172 22, 214 24 C 268 26, 300 40, 338 52 ' +
  'C 380 66, 402 96, 392 126 C 384 158, 344 176, 296 180 C 262 183, 240 196, 196 192 ' +
  'C 148 188, 118 176, 82 168 C 46 160, 36 140, 30 112 Z';

// Where the moon reflection sits on the water
const MOON_X = 262;
const MOON_TOP = 58;
const MOON_BOTTOM = 150;

/** A natural night pond seen at the car's tilted angle: muddy bank, reeds, depth, and a shimmering moon path. */
export const NightLake = () => {
  const { stars, streaks, rocks, reeds } = useMemo(() => {
    const rand = mulberry32(2026);

    // Star reflections — only inside the water, away from the moon path
    const stars: { x: number; y: number; r: number; delay: number; dur: number }[] = [];
    while (stars.length < 22) {
      const x = 60 + rand() * 320;
      const y = 50 + rand() * 120;
      if (((x - 212) / 165) ** 2 + ((y - 108) / 64) ** 2 > 0.85) continue;
      if (Math.abs(x - MOON_X) < 34) continue;
      stars.push({ x, y, r: 0.5 + rand() * 0.9, delay: rand() * 4, dur: 2.5 + rand() * 3 });
    }

    // Moon path: stacked horizontal light streaks, widest in the middle, broken up like real ripples
    const streaks: { y: number; w: number; h: number; dx: number; o: number; delay: number }[] = [];
    let y = MOON_TOP;
    while (y < MOON_BOTTOM) {
      const k = (y - MOON_TOP) / (MOON_BOTTOM - MOON_TOP);
      const bell = Math.sin(Math.PI * (0.12 + k * 0.88)); // brightest a bit above the middle
      // Ripples get further apart toward the viewer, with some randomness
      const h = 0.9 + rand() * 1.4;
      streaks.push({
        y,
        w: 4 + bell * 24 * (0.45 + rand() * 0.8),
        h,
        dx: (rand() - 0.5) * 10,
        o: 0.18 + bell * 0.6 * (0.6 + rand() * 0.4),
        delay: rand() * -3,
      });
      y += h + 1.6 + k * 3 + rand() * 3.5;
    }

    // Rocks scattered along the bank
    const rocks: { x: number; y: number; rx: number; ry: number; shade: string }[] = [
      { x: 44, y: 150, rx: 7, ry: 4.5, shade: '#3a3d42' },
      { x: 54, y: 156, rx: 4, ry: 2.6, shade: '#2c2f33' },
      { x: 372, y: 140, rx: 8, ry: 5, shade: '#34373c' },
      { x: 384, y: 132, rx: 4.5, ry: 3, shade: '#2a2d31' },
      { x: 300, y: 186, rx: 6, ry: 3.6, shade: '#33363b' },
      { x: 120, y: 38, rx: 5, ry: 3, shade: '#2e3135' },
    ];

    // Reed clumps (cattails) at the water's edge
    const reedSpots = [
      { x: 70, y: 160 },
      { x: 92, y: 170 },
      { x: 352, y: 168 },
      { x: 236, y: 192 },
      { x: 34, y: 100 },
    ];
    const reeds = reedSpots.flatMap((s) =>
      Array.from({ length: 5 }, () => {
        const h = 10 + rand() * 9;
        const lean = (rand() - 0.5) * 6;
        return { x: s.x + (rand() - 0.5) * 9, y: s.y + (rand() - 0.5) * 3, h, lean, head: rand() < 0.5 };
      })
    );

    return { stars, streaks, rocks, reeds };
  }, []);

  return (
    <svg viewBox="0 0 420 210" className="w-full h-full overflow-visible">
      <style>{`
        .pond-star { animation: pond-twinkle var(--dur) ease-in-out var(--delay) infinite; }
        @keyframes pond-twinkle { 0%, 100% { opacity: 0.2; } 50% { opacity: 0.85; } }
        .pond-streak { transform-box: fill-box; transform-origin: center; animation: pond-shimmer 2.6s ease-in-out infinite; }
        @keyframes pond-shimmer { 0%, 100% { transform: scaleX(1); } 50% { transform: scaleX(0.55) translateX(3px); } }
        .pond-ring { transform-box: fill-box; transform-origin: center; animation: pond-ring 7s ease-out infinite; }
        @keyframes pond-ring { 0% { transform: scale(0.15); opacity: 0.45; } 100% { transform: scale(1.5); opacity: 0; } }
      `}</style>
      <defs>
        {/* Deep in the middle, lighter and a little teal in the shallows */}
        <radialGradient id="pond-depth" cx="55%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#081225" />
          <stop offset="60%" stopColor="#0d1c36" />
          <stop offset="88%" stopColor="#173049" />
          <stop offset="100%" stopColor="#24413f" />
        </radialGradient>
        <radialGradient id="pond-moonglow" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stopColor="#dfe6ff" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#dfe6ff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="pond-column" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor="#fff4d6" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#fff4d6" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="pond-bank" cx="50%" cy="50%" r="50%">
          <stop offset="78%" stopColor="#0e100e" />
          <stop offset="100%" stopColor="#0e100e" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="pond-farshadow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#000" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#000" stopOpacity="0" />
        </linearGradient>
        <clipPath id="pond-water">
          <path d={SHORE} />
        </clipPath>
      </defs>

      {/* Muddy bank that fades into the ground instead of a hard rim */}
      <ellipse cx="212" cy="110" rx="205" ry="102" fill="url(#pond-bank)" />
      <path d={SHORE} fill="none" stroke="#161812" strokeWidth="10" strokeLinejoin="round" />
      <path d={SHORE} fill="none" stroke="#1f2219" strokeWidth="4" strokeLinejoin="round" />

      {/* Water */}
      <path d={SHORE} fill="url(#pond-depth)" />

      <g clipPath="url(#pond-water)">
        {/* Shadow of the far bank and its trees falling on the water */}
        <rect x="0" y="18" width="420" height="44" fill="url(#pond-farshadow)" />
        <ellipse cx="150" cy="44" rx="34" ry="10" fill="#000" opacity="0.35" />
        <ellipse cx="320" cy="56" rx="30" ry="9" fill="#000" opacity="0.3" />

        {/* Soft moonlight on the surface */}
        <ellipse cx={MOON_X} cy="104" rx="85" ry="62" fill="url(#pond-moonglow)" />

        {/* Star reflections */}
        {stars.map((s, i) => (
          <circle
            key={i}
            className="pond-star"
            cx={s.x}
            cy={s.y}
            r={s.r}
            fill="#e8eeff"
            style={{ ['--delay' as string]: `${s.delay}s`, ['--dur' as string]: `${s.dur}s` }}
          />
        ))}

        {/* Soft column of moonlight under the ripples */}
        <ellipse cx={MOON_X} cy={(MOON_TOP + MOON_BOTTOM) / 2} rx="16" ry={(MOON_BOTTOM - MOON_TOP) / 2 + 6} fill="url(#pond-column)" />

        {/* Moon path: broken streaks of light that shimmer */}
        {streaks.map((s, i) => (
          <rect
            key={i}
            className="pond-streak"
            x={MOON_X - s.w / 2 + s.dx}
            y={s.y}
            width={s.w}
            height={s.h}
            rx={s.h / 2}
            fill="#fff4d6"
            opacity={s.o}
            style={{ animationDelay: `${s.delay}s` }}
          />
        ))}

        {/* Slow ripple rings */}
        <ellipse className="pond-ring" cx="150" cy="120" rx="34" ry="13" fill="none" stroke="rgba(190,210,255,0.3)" strokeWidth="1" />
        <ellipse className="pond-ring" cx="320" cy="140" rx="26" ry="10" fill="none" stroke="rgba(190,210,255,0.25)" strokeWidth="1" style={{ animationDelay: '-3.5s' }} />

        {/* Lily pads in the shallow cove */}
        {[
          [96, 150, 7],
          [110, 158, 5],
          [84, 140, 4.5],
          [124, 150, 4],
        ].map(([x, y, r], i) => (
          <path
            key={i}
            d={`M${x} ${y} L${x + r} ${y - r * 0.15} A${r} ${r * 0.55} 0 1 1 ${x + r * 0.7} ${y + r * 0.4} Z`}
            fill={i % 2 ? '#1f4a2c' : '#265a34'}
            opacity="0.9"
          />
        ))}
        <circle cx="100" cy="148" r="1.6" fill="#f3d9e6" opacity="0.85" />

        {/* Wet glint where water meets the near shore */}
        <path d={SHORE} fill="none" stroke="rgba(170,200,235,0.22)" strokeWidth="1.5" />
      </g>

      {/* Rocks on the bank */}
      {rocks.map((r, i) => (
        <g key={i}>
          <ellipse cx={r.x + 1.5} cy={r.y + 2} rx={r.rx} ry={r.ry} fill="#000" opacity="0.4" />
          <ellipse cx={r.x} cy={r.y} rx={r.rx} ry={r.ry} fill={r.shade} />
          <ellipse cx={r.x - r.rx * 0.3} cy={r.y - r.ry * 0.35} rx={r.rx * 0.45} ry={r.ry * 0.35} fill="#6b7280" opacity="0.35" />
        </g>
      ))}

      {/* Reeds */}
      {reeds.map((r, i) => (
        <g key={i}>
          <line x1={r.x} y1={r.y} x2={r.x + r.lean} y2={r.y - r.h} stroke="#2d4a25" strokeWidth="1.2" strokeLinecap="round" />
          {r.head && (
            <rect x={r.x + r.lean * 0.8 - 1.2} y={r.y - r.h * 0.95} width="2.4" height="5" rx="1.2" fill="#4a3322" />
          )}
        </g>
      ))}
    </svg>
  );
};
