import { useEffect, useRef, useState } from 'react';
import { Pause, Pencil, Play, RotateCcw } from 'lucide-react';
import type { Project } from '../../../data/projects';
import { CarSim, H, ROAD, W, defaultTrack, resample } from './carSim';
import { SectionLinks } from './shared';

/** A1 — "simulation lab": black + neon green, grid, HUD. A real neuroevolution runs in the canvas. */

const NEON = '#35fe5d';
const SPEEDS = [1, 4, 12];

type Pt = { x: number; y: number };

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
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
      if (closed) ctx.closePath();
      ctx.strokeStyle = 'rgba(53,254,93,0.55)';
      ctx.lineWidth = ROAD + 4;
      ctx.stroke();
      ctx.strokeStyle = '#0d0f0d';
      ctx.lineWidth = ROAD;
      ctx.stroke();
      ctx.setLineDash([10, 12]);
      ctx.strokeStyle = 'rgba(255,255,255,0.18)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.setLineDash([]);
    };

    const render = () => {
      const s = canvas.width / W;
      ctx.setTransform(s, 0, 0, s, 0, 0);
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, W, H);
      // Lab grid
      ctx.strokeStyle = 'rgba(53,254,93,0.07)';
      ctx.lineWidth = 1;
      for (let x = 0; x <= W; x += 30) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = 0; y <= H; y += 30) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

      if (drawingRef.current) {
        if (strokeRef.current.length > 1) drawRoad(strokeRef.current, false);
        return;
      }

      drawRoad(sim.track, true);

      // Start line
      const a = sim.track[0];
      const b = sim.track[2];
      const ang = Math.atan2(b.y - a.y, b.x - a.x) + Math.PI / 2;
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 4;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(a.x - Math.cos(ang) * ROAD / 2, a.y - Math.sin(ang) * ROAD / 2);
      ctx.lineTo(a.x + Math.cos(ang) * ROAD / 2, a.y + Math.sin(ang) * ROAD / 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Leader's sensor rays: what the network "sees"
      const leader = sim.cars.filter((c) => c.alive).sort((p, q) => q.progress - p.progress)[0];
      if (leader) {
        const offs = [-1.05, -0.5, 0, 0.5, 1.05];
        ctx.lineWidth = 1.5;
        leader.sensors.forEach((v, i) => {
          const ra = leader.angle + offs[i];
          ctx.strokeStyle = `rgba(53,254,93,${0.25 + 0.5 * (1 - v)})`;
          ctx.beginPath();
          ctx.moveTo(leader.x, leader.y);
          ctx.lineTo(leader.x + Math.cos(ra) * v * 170, leader.y + Math.sin(ra) * v * 170);
          ctx.stroke();
          ctx.fillStyle = NEON;
          ctx.fillRect(leader.x + Math.cos(ra) * v * 170 - 2, leader.y + Math.sin(ra) * v * 170 - 2, 4, 4);
        });
      }

      // Cars: dead ones fade red, elites (last gen's best) glow green
      for (const c of sim.cars) {
        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate(c.angle);
        if (!c.alive) ctx.fillStyle = 'rgba(255,70,90,0.35)';
        else if (c === leader) ctx.fillStyle = NEON;
        else if (c.elite) ctx.fillStyle = 'rgba(53,254,93,0.75)';
        else ctx.fillStyle = 'rgba(255,255,255,0.75)';
        ctx.fillRect(-9, -5, 18, 10);
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
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
    // Only simulate while the lab is on screen
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
  const btn = 'inline-flex items-center gap-2 rounded-lg border px-3 py-2 font-mono text-xs uppercase tracking-widest transition-colors';

  return (
    <section id={project.id} className="scroll-mt-16 relative bg-[#050505] text-white py-20 md:py-28 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-60" style={{ backgroundImage: 'linear-gradient(rgba(53,254,93,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(53,254,93,0.05) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
      <div className="relative max-w-6xl mx-auto px-5 sm:px-8">
        <div className="proj-reveal grid md:grid-cols-[1.1fr_1fr] gap-8 md:gap-16 items-end mb-10">
          <div>
            <p className="font-mono text-xs tracking-[0.3em] mb-4" style={{ color: NEON }}>TRACK {project.track} // NEUROEVOLUTION</p>
            <h2 className="font-podium text-6xl sm:text-8xl leading-[0.85] uppercase">AI <span style={{ color: NEON }}>Car</span></h2>
          </div>
          <div>
            <p className="text-lg sm:text-xl font-semibold mb-3">{project.tagline}</p>
            <p className="text-white/60 leading-relaxed">{project.about}</p>
          </div>
        </div>

        {/* The lab */}
        <div className="proj-reveal rounded-2xl border border-[#35fe5d]/40 bg-black p-2 sm:p-3 shadow-[0_0_60px_rgba(53,254,93,0.12)]">
          <div className="flex flex-wrap items-center justify-between gap-2 px-1 pb-2 sm:pb-3">
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setRunning((r) => !r)} disabled={drawing} className={`${btn} border-[#35fe5d] text-black bg-[#35fe5d] hover:bg-[#35fe5d]/80 disabled:opacity-40`}>
                {running ? <Pause size={14} /> : <Play size={14} />} {running ? 'Pause' : 'Evolve'}
              </button>
              <button type="button" onClick={() => setSpeed((s) => SPEEDS[(SPEEDS.indexOf(s) + 1) % SPEEDS.length])} className={`${btn} border-white/20 text-white hover:border-[#35fe5d]`}>
                Speed {speed}x
              </button>
              <button type="button" onClick={() => { setDrawing((d) => !d); setHint(''); }} className={`${btn} ${drawing ? 'border-[#35fe5d] text-[#35fe5d]' : 'border-white/20 text-white hover:border-[#35fe5d]'}`}>
                <Pencil size={14} /> {drawing ? 'Cancel' : 'Draw track'}
              </button>
              <button type="button" onClick={reset} className={`${btn} border-white/20 text-white hover:border-[#35fe5d]`}>
                <RotateCcw size={14} /> Reset
              </button>
            </div>
            <div className="font-mono text-[11px] sm:text-xs tracking-widest flex gap-4 text-white/70">
              <span>GEN <b className="text-[#35fe5d]">{String(hud.gen).padStart(2, '0')}</b></span>
              <span>ALIVE <b className="text-white">{hud.alive}</b>/36</span>
              <span>BEST <b className="text-white">{hud.bestEver >= 1 ? `${hud.bestEver.toFixed(1)} laps` : pct(hud.bestEver)}</b></span>
            </div>
          </div>

          <div className="relative rounded-xl overflow-hidden">
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
              <div className="absolute inset-x-0 top-3 flex justify-center pointer-events-none">
                <span className="rounded-full bg-black/80 border border-[#35fe5d]/50 px-4 py-1.5 font-mono text-[11px] sm:text-xs tracking-widest text-[#35fe5d] text-center">
                  {hint || 'DRAW ONE BIG LOOP · LIFT TO RACE'}
                </span>
              </div>
            )}
          </div>

          {/* Fitness over generations */}
          <div className="flex items-end gap-3 px-1 pt-3">
            <span className="font-mono text-[10px] tracking-widest text-white/50 shrink-0">FITNESS / GEN</span>
            <div className="flex items-end gap-[3px] h-10 flex-1">
              {hud.history.map((v, i) => (
                <span key={i} className="flex-1 max-w-[14px] rounded-sm bg-[#35fe5d]" style={{ height: `${Math.max(6, Math.min(1, v / 3) * 100)}%`, opacity: 0.35 + 0.65 * Math.min(1, v / 3) }} title={`gen ${i + 1}: ${v.toFixed(2)} laps`} />
              ))}
              {!hud.history.length && <span className="font-mono text-[10px] text-white/30">first generation running…</span>}
            </div>
            <span className="font-mono text-[10px] tracking-widest text-white/50 shrink-0">{hud.best >= 1 ? `${hud.best.toFixed(1)} LAPS` : `LAP ${pct(hud.best)}`}</span>
          </div>
        </div>
        <p className="proj-reveal mt-3 font-mono text-[11px] text-white/40">
          Live in your browser: 36 tiny neural nets (5 sensors → 6 hidden → steering), evolved by keeping and mutating the best. The original uses full NEAT in Python with 13 inputs.
        </p>

        {/* How it works */}
        <div className="proj-reveal grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-12">
          {project.how.map((step, i) => (
            <div key={step} className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
              <div className="font-mono text-xs mb-3" style={{ color: NEON }}>0{i + 1}</div>
              <p className="text-sm text-white/75 leading-relaxed">{step}</p>
            </div>
          ))}
        </div>

        <SectionLinks project={project} theme="neon" />
      </div>
    </section>
  );
};
