import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Pause, Pencil, Play, RotateCcw } from 'lucide-react';
import type { Project } from '../../../data/projects';
import { CarSim, H, ROAD, W, defaultTrack, resample } from './carSim';
import { SectionLinks } from './shared';

/**
 * A1 — "pit wall": carbon black, hazard yellow, red and white kerbs, a timing tower.
 * A real neuroevolution runs in the canvas.
 */

const YELLOW = '#ffd60a';
const RED = '#e10600';
const SPEEDS = [1, 4, 12];

type Pt = { x: number; y: number };

const Cell = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="bg-[#0c0c0d] border-l-4 border-[#ffd60a] px-3 py-2">
    <div className="font-mono text-[10px] tracking-widest text-white/50">{label}</div>
    <div className="font-mono font-bold text-2xl sm:text-3xl leading-none mt-1 whitespace-nowrap">{children}</div>
  </div>
);

export const AiCarSection = ({ project }: { project: Project }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const simRef = useRef<CarSim | null>(null);
  const [running, setRunning] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [drawing, setDrawing] = useState(false);
  const [hint, setHint] = useState('');
  const [hud, setHud] = useState({ gen: 1, alive: 0, best: 0, bestEver: 0, history: [] as number[] });

  const runningRef = useRef(running);
  const speedRef = useRef(speed);
  const drawingRef = useRef(drawing);
  runningRef.current = running;
  speedRef.current = speed;
  drawingRef.current = drawing;
  const strokeRef = useRef<Pt[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const sim = (simRef.current = new CarSim(defaultTrack()));

    let raf = 0;
    let visible = false;
    let tick = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
    };

    const drawRoad = (pts: Pt[], closed: boolean) => {
      ctx.lineJoin = 'round';
      ctx.beginPath();
      pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
      if (closed) ctx.closePath();
      // Kerbs: white with red blocks
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#f2f2f2';
      ctx.lineWidth = ROAD + 10;
      ctx.stroke();
      ctx.lineCap = 'butt';
      ctx.setLineDash([16, 16]);
      ctx.strokeStyle = RED;
      ctx.stroke();
      ctx.setLineDash([]);
      // Asphalt
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#1d1e22';
      ctx.lineWidth = ROAD;
      ctx.stroke();
      // Centre line
      ctx.setLineDash([10, 14]);
      ctx.strokeStyle = 'rgba(255,255,255,0.16)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.setLineDash([]);
    };

    const render = () => {
      const s = canvas.width / W;
      ctx.setTransform(s, 0, 0, s, 0, 0);
      ctx.fillStyle = '#0e0f11';
      ctx.fillRect(0, 0, W, H);
      // Run-off grid
      ctx.strokeStyle = 'rgba(255,255,255,0.04)';
      ctx.lineWidth = 1;
      for (let x = 0; x <= W; x += 30) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = 0; y <= H; y += 30) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

      if (drawingRef.current) {
        if (strokeRef.current.length > 1) drawRoad(strokeRef.current, false);
        return;
      }

      drawRoad(sim.track, true);

      // Start line: two offset rows of white blocks make a chequered strip
      const a = sim.track[0];
      const b = sim.track[2];
      const along = Math.atan2(b.y - a.y, b.x - a.x);
      const ang = along + Math.PI / 2;
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 8;
      ctx.lineCap = 'butt';
      ctx.setLineDash([8, 8]);
      for (let row = 0; row < 2; row++) {
        const ox = Math.cos(along) * (row * 8 - 4);
        const oy = Math.sin(along) * (row * 8 - 4);
        ctx.lineDashOffset = row * 8;
        ctx.beginPath();
        ctx.moveTo(a.x - Math.cos(ang) * ROAD / 2 + ox, a.y - Math.sin(ang) * ROAD / 2 + oy);
        ctx.lineTo(a.x + Math.cos(ang) * ROAD / 2 + ox, a.y + Math.sin(ang) * ROAD / 2 + oy);
        ctx.stroke();
      }
      ctx.setLineDash([]);
      ctx.lineDashOffset = 0;
      ctx.lineCap = 'round';

      // Leader's sensor rays: what the network "sees"
      const leader = sim.cars.filter((c) => c.alive).sort((p, q) => q.progress - p.progress)[0];
      if (leader) {
        const offs = [-1.05, -0.5, 0, 0.5, 1.05];
        ctx.lineWidth = 1.5;
        leader.sensors.forEach((v, i) => {
          const ra = leader.angle + offs[i];
          ctx.strokeStyle = `rgba(255,214,10,${0.3 + 0.55 * (1 - v)})`;
          ctx.beginPath();
          ctx.moveTo(leader.x, leader.y);
          ctx.lineTo(leader.x + Math.cos(ra) * v * 170, leader.y + Math.sin(ra) * v * 170);
          ctx.stroke();
          ctx.fillStyle = YELLOW;
          ctx.fillRect(leader.x + Math.cos(ra) * v * 170 - 2, leader.y + Math.sin(ra) * v * 170 - 2, 4, 4);
        });
      }

      // Cars: wrecks go grey, elites (last gen's best) are amber, the leader is yellow
      for (const c of sim.cars) {
        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate(c.angle);
        if (!c.alive) ctx.fillStyle = 'rgba(140,142,150,0.5)';
        else if (c === leader) ctx.fillStyle = YELLOW;
        else if (c.elite) ctx.fillStyle = '#ff9d2e';
        else ctx.fillStyle = 'rgba(255,255,255,0.88)';
        ctx.fillRect(-9, -5, 18, 10);
        ctx.fillStyle = 'rgba(0,0,0,0.65)';
        ctx.fillRect(2, -4, 4, 8);
        ctx.restore();
      }
    };

    const loop = () => {
      if (runningRef.current && !drawingRef.current) {
        for (let i = 0; i < speedRef.current; i++) sim.step();
      }
      render();
      if (++tick % 6 === 0) {
        setHud({ gen: sim.generation, alive: sim.aliveCount(), best: sim.best, bestEver: sim.bestEver, history: [...sim.history] });
      }
      if (visible) raf = requestAnimationFrame(loop);
    };

    resize();
    render();
    const ro = new ResizeObserver(() => { resize(); render(); });
    ro.observe(canvas);
    // Only simulate while the track is on screen
    const io = new IntersectionObserver(([e]) => {
      const was = visible;
      visible = e.isIntersecting;
      if (visible && !was) raf = requestAnimationFrame(loop);
    });
    io.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  // ---- Draw-your-own-track ----
  const toLogical = (e: React.PointerEvent<HTMLCanvasElement>): Pt => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
  };
  const onDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    strokeRef.current = [toLogical(e)];
    setHint('');
  };
  const onMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing || !strokeRef.current.length || !(e.buttons & 1)) return;
    strokeRef.current.push(toLogical(e));
  };
  const onUp = () => {
    if (!drawing || !strokeRef.current.length) return;
    const pts = strokeRef.current;
    let len = 0;
    for (let i = 1; i < pts.length; i++) len += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
    strokeRef.current = [];
    if (len < 700) {
      setHint('Draw a bigger loop: go all the way round and end near where you started.');
      return;
    }
    simRef.current?.setTrack(resample([...pts, pts[0]]));
    setDrawing(false);
    setRunning(true);
  };

  const reset = () => {
    simRef.current?.setTrack(defaultTrack());
    setDrawing(false);
    setRunning(true);
    setHint('');
  };

  const pct = (v: number) => `${Math.max(0, Math.round(v * 100))}%`;
  const btn = 'inline-flex items-center gap-2 border-2 px-3 py-2 font-mono text-[11px] sm:text-xs font-bold uppercase tracking-widest transition-colors';
  const ghost = 'border-white/25 text-white hover:border-[#ffd60a] hover:text-[#ffd60a]';

  return (
    <section id={project.id} className="scroll-mt-16 relative bg-[#0c0c0d] text-white overflow-hidden">
      <div className="pit-checker h-5 w-full" aria-hidden="true" />
      {/* Giant grid-slot numeral */}
      <span
        aria-hidden="true"
        className="pointer-events-none select-none absolute top-0 right-[-1vw] font-podium italic leading-[0.8] text-[44vw] lg:text-[30rem] text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.07)]"
      >
        {project.track}
      </span>

      <div className="relative max-w-6xl mx-auto px-5 sm:px-8 py-20 md:py-28">
        <div className="proj-reveal grid md:grid-cols-[1.1fr_1fr] gap-8 md:gap-16 items-end mb-10">
          <div>
            <p className="flex items-center gap-3 font-mono text-xs tracking-[0.3em] mb-5 text-white/70">
              <span className="bg-[#ffd60a] text-black font-bold px-2 py-1 tracking-widest">P1</span>
              TRACK {project.track} // NEUROEVOLUTION
            </p>
            <h2 className="font-podium italic text-7xl sm:text-9xl leading-[0.8] uppercase">
              AI <span style={{ color: YELLOW }}>Car</span>
            </h2>
          </div>
          <div className="border-l-4 pl-5" style={{ borderColor: RED }}>
            <p className="text-lg sm:text-xl font-semibold mb-3">{project.tagline}</p>
            <p className="text-white/60 leading-relaxed">{project.about}</p>
          </div>
        </div>

        {/* The pit wall */}
        <div className="proj-reveal bg-[#151619] border border-white/10 shadow-[0_30px_80px_-30px_rgba(255,214,10,0.25)]">
          <div className="pit-hazard h-2" aria-hidden="true" />
          <div className="p-2 sm:p-3">
            <div className="flex flex-wrap gap-2 pb-2 sm:pb-3">
              <button type="button" onClick={() => setRunning((r) => !r)} disabled={drawing} className={`${btn} border-[#ffd60a] text-black bg-[#ffd60a] hover:bg-white hover:border-white disabled:opacity-40`}>
                {running ? <Pause size={14} /> : <Play size={14} />} {running ? 'Pause' : 'Evolve'}
              </button>
              <button type="button" onClick={() => setSpeed((s) => SPEEDS[(SPEEDS.indexOf(s) + 1) % SPEEDS.length])} className={`${btn} ${ghost}`}>
                Speed {speed}x
              </button>
              <button type="button" onClick={() => { setDrawing((d) => !d); setHint(''); }} className={`${btn} ${drawing ? 'border-[#ffd60a] text-[#ffd60a]' : ghost}`}>
                <Pencil size={14} /> {drawing ? 'Cancel' : 'Draw track'}
              </button>
              <button type="button" onClick={reset} className={`${btn} ${ghost}`}>
                <RotateCcw size={14} /> Reset
              </button>
            </div>

            <div className="grid lg:grid-cols-[minmax(0,1fr)_210px] gap-2 sm:gap-3">
              <div className="relative overflow-hidden">
                <canvas
                  ref={canvasRef}
                  onPointerDown={onDown}
                  onPointerMove={onMove}
                  onPointerUp={onUp}
                  className={`block w-full ${drawing ? 'cursor-crosshair' : ''}`}
                  style={{ aspectRatio: `${W} / ${H}`, touchAction: drawing ? 'none' : 'auto' }}
                  aria-label="Neuroevolution simulation: cars learning to drive the track"
                />
                {drawing && (
                  <div className="absolute inset-x-0 top-3 flex justify-center pointer-events-none px-3">
                    <span className="bg-black/85 border-2 border-[#ffd60a] px-4 py-1.5 font-mono text-[11px] sm:text-xs tracking-widest text-[#ffd60a] text-center">
                      {hint || 'DRAW ONE BIG LOOP · LIFT TO RACE'}
                    </span>
                  </div>
                )}
              </div>

              {/* Timing tower */}
              <div className="grid grid-cols-3 lg:grid-cols-1 lg:content-between gap-2">
                <Cell label="GEN"><span style={{ color: YELLOW }}>{String(hud.gen).padStart(2, '0')}</span></Cell>
                <Cell label="ALIVE">{hud.alive}<span className="text-base text-white/40">/36</span></Cell>
                <Cell label="BEST">{hud.bestEver >= 1 ? <>{hud.bestEver.toFixed(1)}<span className="text-base text-white/40"> laps</span></> : pct(hud.bestEver)}</Cell>

                {/* Fitness over generations */}
                <div className="col-span-3 lg:col-span-1 bg-[#0c0c0d] px-3 py-2">
                  <div className="flex justify-between font-mono text-[10px] tracking-widest text-white/50">
                    <span>FITNESS / GEN</span>
                    <span>{hud.best >= 1 ? `${hud.best.toFixed(1)} LAPS` : `LAP ${pct(hud.best)}`}</span>
                  </div>
                  <div className="flex items-end gap-[3px] h-12 lg:h-28 mt-2">
                    {hud.history.map((v, i) => (
                      <span key={i} className="flex-1 max-w-[14px] bg-[#ffd60a]" style={{ height: `${Math.max(6, Math.min(1, v / 3) * 100)}%`, opacity: 0.35 + 0.65 * Math.min(1, v / 3) }} title={`gen ${i + 1}: ${v.toFixed(2)} laps`} />
                    ))}
                    {!hud.history.length && <span className="font-mono text-[10px] text-white/30 self-center">first generation running…</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-x-5 gap-y-1 pt-3 px-1 font-mono text-[10px] tracking-widest uppercase text-white/50">
              <span className="inline-flex items-center gap-2"><i className="w-3.5 h-2 bg-[#ffd60a]" /> leader + sensors</span>
              <span className="inline-flex items-center gap-2"><i className="w-3.5 h-2 bg-[#ff9d2e]" /> last gen&apos;s best</span>
              <span className="inline-flex items-center gap-2"><i className="w-3.5 h-2 bg-white/90" /> mutants</span>
              <span className="inline-flex items-center gap-2"><i className="w-3.5 h-2 bg-[#8c8e96]/60" /> crashed</span>
            </div>
          </div>
        </div>
        <p className="proj-reveal mt-3 font-mono text-[11px] text-white/40">
          Live in your browser: 36 tiny neural nets (5 sensors → 6 hidden → steering), evolved by keeping and mutating the best. The original uses full NEAT in Python with 13 inputs.
        </p>

        {/* How it works */}
        <div className="proj-reveal grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-12">
          {project.how.map((step, i) => (
            <div key={step} className="relative bg-[#151619] border-t-4 p-5 pt-4" style={{ borderColor: i % 2 ? '#f2f2f2' : RED }}>
              <div className="font-mono text-[10px] tracking-[0.3em] text-white/45 mb-1">SECTOR</div>
              <div className="font-mono font-bold italic text-3xl leading-none mb-3" style={{ color: YELLOW }}>0{i + 1}</div>
              <p className="text-sm text-white/75 leading-relaxed">{step}</p>
            </div>
          ))}
        </div>

        <SectionLinks project={project} theme="pit" />
      </div>
      <div className="pit-checker h-5 w-full" aria-hidden="true" />
    </section>
  );
};
