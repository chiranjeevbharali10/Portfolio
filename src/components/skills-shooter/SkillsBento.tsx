import { skillsData } from "../../data/skills";

// Pixel-art ship, one char per pixel
const SHIP = [
  ".....#.....",
  "....###....",
  "....#o#....",
  ".#..###..#.",
  ".#.#####.#.",
  "###########",
  "##.##.##.##",
  "#.........#",
];

const ROCKS = [
  { skill: "Three.js", cat: 0, left: "12%", delay: "0s", duration: "5.5s" },
  { skill: "Docker", cat: 2, left: "58%", delay: "1.6s", duration: "6.2s" },
  { skill: "PyTorch", cat: 3, left: "30%", delay: "3.1s", duration: "5.8s" },
  { skill: "Spring Boot", cat: 1, left: "66%", delay: "4.4s", duration: "6.6s" },
];

// Deterministic starfield
const STARS = Array.from({ length: 28 }, (_, i) => ({
  left: `${(i * 37) % 100}%`,
  top: `${(i * 53) % 100}%`,
  size: i % 5 === 0 ? 2 : 1,
}));

const total = skillsData.reduce((n, c) => n + c.skills.length, 0);

export const SkillsBento = () => (
  <>
    {/* Starfield (two stacked copies scroll down seamlessly) */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[0, 1].map((copy) => (
        <div key={copy} className="sb-stars absolute inset-x-0 h-full" style={{ top: `${-copy * 100}%` }}>
          {STARS.map((s, i) => (
            <span
              key={i}
              className="absolute rounded-full bg-white/60"
              style={{ left: s.left, top: s.top, width: s.size, height: s.size }}
            />
          ))}
        </div>
      ))}
    </div>

    {/* Falling skill asteroids */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {ROCKS.map((r) => {
        const color = skillsData[r.cat].accent;
        return (
          <div
            key={r.skill}
            className="sb-rock absolute -top-12 flex flex-col items-center gap-1"
            style={{ left: r.left, animationDelay: r.delay, animationDuration: r.duration }}
          >
            <span className="font-minecraft text-[9px] sm:text-[10px] whitespace-nowrap" style={{ color }}>
              {r.skill}
            </span>
            <span
              className="block h-5 w-6 sm:h-6 sm:w-7 rounded-[45%_55%_40%_60%] bg-[#1d1d21] border"
              style={{ borderColor: color, boxShadow: `0 0 10px ${color}66` }}
            />
          </div>
        );
      })}
    </div>

    {/* Ship + laser */}
    <div className="sb-ship absolute bottom-10 left-1/2 pointer-events-none">
      <span className="sb-laser absolute bottom-full left-1/2 -translate-x-1/2 w-[2px] h-6 bg-[#35fe5d] shadow-[0_0_8px_#35fe5d]" />
      <svg width="33" height="24" viewBox="0 0 11 8" shapeRendering="crispEdges" className="-translate-x-1/2 drop-shadow-[0_0_6px_rgba(53,254,93,0.6)]">
        {SHIP.flatMap((row, y) =>
          [...row].map((c, x) =>
            c === "." ? null : <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={c === "o" ? "#050505" : "#35fe5d"} />
          )
        )}
      </svg>
    </div>

    {/* Labels */}
    <span className="absolute top-5 right-6 font-minecraft text-[9px] tracking-widest text-primary/50 pointer-events-none">
      {total} TARGETS
    </span>
    <span className="crt-blink absolute bottom-4 right-6 font-minecraft text-[9px] tracking-widest text-[#35fe5d] pointer-events-none">
      ▶ PRESS START
    </span>
    {/* Scanlines */}
    <div className="crt-scanlines absolute inset-0 pointer-events-none opacity-60" />
  </>
);
