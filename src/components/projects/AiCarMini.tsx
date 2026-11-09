import { useEffect, useRef } from 'react';

/**
 * Tiny scripted take on the NEAT car sim: a few cars with sensor rays try to lap a
 * wobbly track. Early generations crash almost immediately; by GEN 30 they reach the goal.
 * Drawn in a 100x100 space on a 2D canvas (no WebGL); pauses when offscreen.
 */

const CARS = 5;
const STAGES = [1, 4, 9, 17, 30]; // generations shown, one per stage
const STAGE_MS = 1900;
const GOAL = 0.86; // goal flag, as a fraction of the lap
const CAR_COLORS = ['#b8ddb1', '#f6c8d5', '#c9d8f4', '#e9d9f5', '#fff1d6'];

// Wobbly loop around the centre
const trackR = (a: number) => 32 + 5 * Math.sin(3 * a + 0.6);
const pointAt = (a: number) => {
  const r = trackR(a);
  return { x: 50 + Math.cos(a) * r, y: 50 + Math.sin(a) * r };
};
const START = -Math.PI / 2;
const angleAt = (lap: number) => START + lap * Math.PI * 2;

// Deterministic "random" so every loop of the animation looks the same
const rand = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

// How far round the lap each car gets before crashing, per stage (>= GOAL = made it)
const reach = (stage: number, car: number) => {
  const skill = stage / (STAGES.length - 1); // 0 .. 1
  if (stage === STAGES.length - 1 && car === 0) return 1; // the champion
  const base = 0.06 + skill * 0.75;
  return Math.min(1, base + rand(stage * 10 + car) * (0.12 + skill * 0.35));
};

export const AiCarMini = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    let visible = true;
    const t0 = performance.now();

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const size = canvas.clientWidth;
      canvas.width = canvas.height = Math.max(1, Math.round(size * dpr));
    };

    const drawTrack = () => {
      ctx.beginPath();
      for (let i = 0; i <= 120; i++) {
        const p = pointAt((i / 120) * Math.PI * 2);
        if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
      }
      ctx.closePath();
      ctx.lineWidth = 15;
      ctx.strokeStyle = '#2f2b2f';
      ctx.stroke();
      ctx.lineWidth = 0.6;
      ctx.setLineDash([2, 2]);
      ctx.strokeStyle = 'rgba(255,241,214,0.35)';
      ctx.stroke();
      ctx.setLineDash([]);

      // Goal flag
      const g = pointAt(angleAt(GOAL));
      ctx.fillStyle = '#f6c8d5';
      ctx.fillRect(g.x - 0.5, g.y - 9, 1, 9);
      ctx.fillRect(g.x + 0.5, g.y - 9, 5, 3.4);
    };

    const draw = (now: number) => {
      const elapsed = reduced ? STAGE_MS * (STAGES.length - 0.2) : now - t0;
      const total = STAGE_MS * STAGES.length;
      const loopT = elapsed % total;
      const stage = Math.floor(loopT / STAGE_MS);
      const st = (loopT % STAGE_MS) / STAGE_MS; // 0..1 within stage

      const scale = canvas.width / 100;
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      ctx.clearRect(0, 0, 100, 100);
      drawTrack();

      let goalHit = false;
      for (let c = CARS - 1; c >= 0; c--) {
        const limit = Math.min(reach(stage, c), GOAL);
        const lap = Math.min(st * 1.15 * GOAL, limit);
        const crashed = st * 1.15 * GOAL > limit && limit < GOAL;
        if (limit >= GOAL && lap >= GOAL) goalHit = true;

        const a = angleAt(lap);
        const p = pointAt(a);
        const q = pointAt(a + 0.05);
        const heading = Math.atan2(q.y - p.y, q.x - p.x);
        // Spread the cars across the lane a little
        const off = (c - (CARS - 1) / 2) * 2.2;
        const x = p.x + Math.cos(heading + Math.PI / 2) * off;
        const y = p.y + Math.sin(heading + Math.PI / 2) * off;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(heading);
        if (!crashed) {
          // Sensor rays (the network's inputs)
          ctx.strokeStyle = 'rgba(246,200,213,0.55)';
          ctx.lineWidth = 0.5;
          for (const r of [-0.8, -0.4, 0, 0.4, 0.8]) {
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(Math.cos(r) * 11, Math.sin(r) * 11);
            ctx.stroke();
          }
        }
        ctx.globalAlpha = crashed ? 0.35 : 1;
        ctx.fillStyle = CAR_COLORS[c];
        ctx.fillRect(-3.2, -1.8, 6.4, 3.6);
        ctx.fillStyle = '#514b50';
        ctx.fillRect(0.8, -1.4, 1.4, 2.8); // windscreen
        ctx.restore();
        ctx.globalAlpha = 1;

        if (crashed) {
          ctx.fillStyle = '#f6c8d5';
          ctx.font = '7px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('✕', x, y + 1.8);
        }
      }

      // Generation counter + goal state
      ctx.fillStyle = goalHit ? '#b8ddb1' : '#fff1d6';
      ctx.font = '9px Minecraft, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`GEN ${String(STAGES[stage]).padStart(2, '0')}`, 50, 51);
      ctx.font = '5.5px Minecraft, monospace';
      ctx.fillStyle = 'rgba(255,241,214,0.6)';
      ctx.fillText(goalHit ? 'GOAL!' : 'learning…', 50, 60);

      if (!reduced && visible) raf = requestAnimationFrame(draw);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      const was = visible;
      visible = e.isIntersecting;
      if (visible && !was && !reduced) raf = requestAnimationFrame(draw);
    });
    io.observe(canvas);
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className="w-full h-full block" aria-hidden="true" />;
};
