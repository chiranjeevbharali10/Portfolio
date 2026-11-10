import { Fragment, useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';
import type { Project } from '../../../data/projects';
import { SectionLinks } from './shared';

/**
 * A3 — "blueprint": the stack drawn as an engineering sheet, white ink on blue.
 * A simulated replay of the stack: the request hops Nginx → FastAPI → vLLM → GPU,
 * tokens stream back, the edge rate limit really trips, and a concurrency slider
 * replays the README's load-test numbers.
 */

const BG = '#0f3391';
const DEEP = '#0a2470';
const INK = '#eaf1ff';
const DIM = '#b5c6f2';
const YELLOW = '#ffe45c';
const CYAN = '#9fd0ff';
const GREEN = '#8dffb5';
const RED = '#ff8f8f';
const FREE = 'rgba(255,255,255,0.12)';

const NODES = [
  { id: 'client', name: 'Client', sub: 'curl / Locust' },
  { id: 'nginx', name: 'Nginx', sub: 'rate limit :80' },
  { id: 'gateway', name: 'FastAPI', sub: 'auth + metrics :8000' },
  { id: 'vllm', name: 'vLLM', sub: 'PagedAttention :8001' },
  { id: 'gpu', name: 'RTX 4050', sub: 'Qwen2.5-1.5B · 6GB' },
] as const;

const PROMPTS = [
  {
    q: 'Explain PagedAttention like I\'m five',
    a: 'Imagine GPU memory is a notebook. Old servers reserve a whole chapter for every question, even short ones. PagedAttention hands out one page at a time, so far more questions fit in the same notebook.',
  },
  {
    q: 'Why vLLM instead of Ollama?',
    a: 'Ollama got the MVP running in under an hour. vLLM is what production inference actually uses: an OpenAI-compatible API with PagedAttention and continuous batching built in.',
  },
  { q: 'hey', a: 'Hey! I\'m Qwen2.5-1.5B, running on a 6GB laptop GPU behind Nginx, FastAPI and vLLM. Ask me something.' },
];

// Edge limit from the README: 10 req/min per IP, burst 5
const LIMIT = 5;
const WINDOW_MS = 60_000;

// README load test (concurrent users -> latency ms)
const LOAD = [
  { u: 1, p50: 330, p95: 400, p99: 600 },
  { u: 5, p50: 350, p95: 430, p99: 640 },
  { u: 30, p50: 390, p95: 530, p99: 610 },
  { u: 50, p50: 450, p95: 600, p99: 710 },
];
const lerpLoad = (u: number) => {
  for (let i = 1; i < LOAD.length; i++) {
    const a = LOAD[i - 1];
    const b = LOAD[i];
    if (u <= b.u) {
      const t = (u - a.u) / (b.u - a.u);
      return { p50: a.p50 + (b.p50 - a.p50) * t, p95: a.p95 + (b.p95 - a.p95) * t, p99: a.p99 + (b.p99 - a.p99) * t };
    }
  }
  return LOAD[LOAD.length - 1];
};

type Line = { kind: 'cmd' | 'out' | 'meta' | 'err'; text: string };

const GRID = [
  'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)',
  'linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)',
  'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px)',
  'linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)',
].join(',');

const panel = 'relative border border-white/45';
const figure = 'absolute -top-2.5 left-3 px-2 text-[10px] tracking-[0.25em] uppercase';

export const LlmSection = ({ project }: { project: Project }) => {
  const [lines, setLines] = useState<Line[]>([{ kind: 'meta', text: '# pick a prompt and hit send. responses are a simulated replay of the real stack.' }]);
  const [active, setActive] = useState<string | null>(null); // node currently handling the request
  const [blocked, setBlocked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [pick, setPick] = useState(0);
  const [users, setUsers] = useState(30);
  const sent = useRef<number[]>([]);
  const timers = useRef<number[]>([]);
  const termRef = useRef<HTMLDivElement>(null);
  const [, forceTick] = useState(0);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  useEffect(() => {
    termRef.current?.scrollTo({ top: termRef.current.scrollHeight });
  }, [lines]);
  // Keep the rate-limit meter draining
  useEffect(() => {
    const id = window.setInterval(() => forceTick((n) => n + 1), 1000);
    return () => window.clearInterval(id);
  }, []);

  const later = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));
  const push = (l: Line) => setLines((ls) => [...ls.slice(-40), l]);

  const send = () => {
    if (busy) return;
    const now = Date.now();
    sent.current = sent.current.filter((t) => now - t < WINDOW_MS);
    const prompt = PROMPTS[pick];
    push({ kind: 'cmd', text: `$ curl -X POST localhost/v1/chat/completions -d '{"content":"${prompt.q}"}'` });

    if (sent.current.length >= LIMIT) {
      // Nginx stops it at the door
      setActive('nginx');
      setBlocked(true);
      later(500, () => {
        push({ kind: 'err', text: 'HTTP/1.1 429 Too Many Requests  (nginx: limit_req zone=perip, 10r/m burst=5)' });
        setActive(null);
        setBlocked(false);
      });
      return;
    }
    sent.current.push(now);
    setBusy(true);

    const hops = ['client', 'nginx', 'gateway', 'vllm', 'gpu'];
    hops.forEach((h, i) => later(i * 260, () => setActive(h)));

    const start = hops.length * 260;
    const words = prompt.a.split(' ');
    const ttft = 140 + Math.round(Math.random() * 60);
    later(start, () => push({ kind: 'out', text: '' }));
    words.forEach((w, i) =>
      later(start + ttft + i * 55, () =>
        setLines((ls) => {
          const copy = [...ls];
          const last = copy[copy.length - 1];
          copy[copy.length - 1] = { ...last, text: last.text ? `${last.text} ${w}` : w };
          return copy;
        }),
      ),
    );
    const end = start + ttft + words.length * 55;
    later(end + 80, () => {
      const tps = Math.round(words.length / ((end - start) / 1000) * 1.35);
      push({ kind: 'meta', text: `200 OK · ttft ${ttft}ms · ${Math.round(words.length * 1.35)} tokens · ${tps} tok/s` });
      setActive(null);
      setBusy(false);
    });
  };

  const nowCount = sent.current.filter((t) => Date.now() - t < WINDOW_MS).length;
  const lat = lerpLoad(users);
  const kvUsed = Math.round(6 + (users / 50) * 34); // of 48 pages
  const activeIdx = NODES.findIndex((n) => n.id === active);

  return (
    <section
      id={project.id}
      className="scroll-mt-16 relative py-20 md:py-28 overflow-hidden font-mono"
      style={{ background: BG, color: INK, backgroundImage: GRID, backgroundSize: '120px 120px, 120px 120px, 24px 24px, 24px 24px' }}
    >
      <div className="relative max-w-6xl mx-auto px-5 sm:px-8">
        <div className="proj-reveal grid md:grid-cols-[1fr_auto] gap-8 items-end mb-12">
          <div>
            <p className="text-xs tracking-[0.3em] mb-4" style={{ color: YELLOW }}>[{project.track}] ~/LocalLLMInference</p>
            <h2 className="font-sans font-black text-6xl sm:text-8xl tracking-tight leading-[0.9]">
              local<span style={{ color: YELLOW }}>_</span>llm<span className="animate-pulse" style={{ color: YELLOW }}>▍</span>
            </h2>
            <p className="font-sans text-lg sm:text-xl mt-5 max-w-2xl">{project.tagline}</p>
            <p className="font-sans mt-3 max-w-3xl leading-relaxed" style={{ color: DIM }}>{project.about}</p>
          </div>
          {/* Drawing title block */}
          <table className="hidden md:table border-collapse text-[10px] tracking-widest uppercase -rotate-2" style={{ color: DIM, background: DEEP }} aria-hidden="true">
            <tbody>
              {[['sheet', project.track], ['drawn', 'chiranjeev'], ['model', 'qwen2.5-1.5b'], ['vram', '6gb']].map(([k, v]) => (
                <tr key={k}>
                  <td className="border border-white/45 px-3 py-1.5">{k}</td>
                  <td className="border border-white/45 px-3 py-1.5" style={{ color: INK }}>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pipeline */}
        <div className={`proj-reveal ${panel} px-2 sm:px-5 pt-6 pb-4 sm:pb-5 mb-6`} style={{ background: `${DEEP}b3` }}>
          <span className={figure} style={{ background: BG, color: DIM }}>fig. 1 · request path</span>
          <div className="flex items-stretch">
            {NODES.map((n, i) => {
              const on = active === n.id;
              const red = on && blocked && n.id === 'nginx';
              const tone = red ? RED : on ? YELLOW : INK;
              const lit = activeIdx > i;
              return (
                <Fragment key={n.id}>
                  <div
                    className="flex-1 min-w-0 border-2 px-1 sm:px-3 py-2 sm:py-3 transition-all duration-200"
                    style={{
                      background: on ? `${tone}1f` : DEEP,
                      borderColor: on ? tone : 'rgba(255,255,255,0.55)',
                      boxShadow: on ? `0 0 26px ${tone}66` : 'none',
                      transform: on ? 'translateY(-3px)' : 'none',
                    }}
                  >
                    <div className="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 text-[9px] sm:text-sm font-bold whitespace-nowrap" style={{ color: on ? tone : INK }}>
                      <span className="hidden sm:block w-2 h-2 rounded-full shrink-0" style={{ background: red ? RED : on ? YELLOW : GREEN }} />
                      {n.name}
                    </div>
                    <div className="hidden sm:block text-[10px] mt-1" style={{ color: DIM }}>{n.sub}</div>
                  </div>
                  {i < NODES.length - 1 && (
                    <span
                      aria-hidden="true"
                      className={`bp-wire self-center shrink-0 w-2 sm:w-7 h-[2px] ${lit ? 'bp-wire-on' : ''}`}
                      style={{ color: lit ? (blocked ? RED : YELLOW) : 'rgba(255,255,255,0.5)' }}
                    />
                  )}
                </Fragment>
              );
            })}
          </div>
        </div>

        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6">
          {/* Terminal */}
          <div className={`proj-reveal ${panel} flex flex-col`} style={{ background: '#071a57' }}>
            <span className={`${figure} z-10`} style={{ background: BG, color: DIM }}>fig. 2 · gateway — bash</span>
            {/* Fills whatever height the load-test panel gives the row */}
            <div className="relative flex-1 min-h-64 sm:min-h-72">
            <div ref={termRef} className="absolute inset-0 overflow-y-auto px-4 pt-5 pb-3 text-[12px] sm:text-[13px] leading-relaxed flex flex-col gap-1.5">
              {lines.map((l, i) => (
                <p
                  key={i}
                  className="break-words"
                  style={{ color: l.kind === 'cmd' ? CYAN : l.kind === 'err' ? RED : l.kind === 'meta' ? DIM : INK }}
                >
                  {l.kind === 'out' && <span style={{ color: YELLOW }}>❯ </span>}
                  {l.text}
                </p>
              ))}
            </div>
            </div>
            <div className="border-t border-white/30 p-3 flex flex-col sm:flex-row gap-2">
              <div className="flex flex-wrap gap-1.5 flex-1">
                {PROMPTS.map((p, i) => (
                  <button
                    key={p.q}
                    type="button"
                    onClick={() => setPick(i)}
                    className="border px-2.5 py-1.5 text-[11px] text-left transition-colors"
                    style={{ borderColor: pick === i ? YELLOW : 'rgba(255,255,255,0.35)', color: pick === i ? YELLOW : DIM, background: pick === i ? `${YELLOW}1a` : 'transparent' }}
                  >
                    {p.q}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={send}
                disabled={busy}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest disabled:opacity-50 hover:brightness-110"
                style={{ background: YELLOW, color: DEEP }}
              >
                <Send size={14} /> send
              </button>
            </div>
            <div className="px-4 pb-3 text-[10px] flex flex-wrap items-center gap-2" style={{ color: DIM }}>
              <span>nginx bucket</span>
              <span className="flex gap-[3px]">
                {Array.from({ length: LIMIT }).map((_, i) => (
                  <span key={i} className="w-3 h-1.5" style={{ background: i < nowCount ? (nowCount >= LIMIT ? RED : YELLOW) : FREE }} />
                ))}
              </span>
              <span>{nowCount >= LIMIT ? 'full: next request gets a 429' : 'spam send to hit the rate limit'}</span>
            </div>
          </div>

          {/* Load test */}
          <div className={`proj-reveal ${panel} p-4 sm:p-5 pt-6 sm:pt-6 flex flex-col gap-5`} style={{ background: `${DEEP}b3` }}>
            <span className={figure} style={{ background: BG, color: DIM }}>fig. 3 · load test</span>
            <div>
              <div className="flex justify-between items-baseline text-[11px] tracking-widest uppercase" style={{ color: DIM }}>
                <span>Locust · concurrent users</span>
                <span className="text-3xl font-bold" style={{ color: YELLOW }}>{users}</span>
              </div>
              <input type="range" min={1} max={50} value={users} onChange={(e) => setUsers(+e.target.value)} className="w-full mt-2 accent-[#ffe45c]" aria-label="Concurrent users" />
            </div>

            <div className="flex flex-col gap-2.5">
              {(['p50', 'p95', 'p99'] as const).map((k) => (
                <div key={k} className="flex items-center gap-3 text-[11px]">
                  <span className="w-8" style={{ color: DIM }}>{k}</span>
                  <div className="flex-1 h-3" style={{ background: FREE }}>
                    <div className="h-full transition-all duration-300" style={{ width: `${(lat[k] / 800) * 100}%`, background: k === 'p99' ? YELLOW : CYAN }} />
                  </div>
                  <span className="w-14 text-right">{Math.round(lat[k])}ms</span>
                </div>
              ))}
              <p className="text-[11px]" style={{ color: GREEN }}>✓ 0 failures</p>
            </div>

            <div>
              <div className="flex justify-between text-[11px] tracking-widest uppercase mb-2" style={{ color: DIM }}>
                <span>KV cache pages</span><span>{kvUsed}/48</span>
              </div>
              <div className="grid grid-cols-12 gap-[3px]">
                {Array.from({ length: 48 }).map((_, i) => {
                  // Pages are scattered like real paging, not one contiguous block
                  const used = ((i * 29) % 48) < kvUsed;
                  return <span key={i} className="aspect-square transition-colors duration-300" style={{ background: used ? INK : FREE }} />;
                })}
              </div>
              <p className="text-[10px] mt-2 leading-relaxed" style={{ color: DIM }}>PagedAttention hands out pages as sequences grow, so more requests fit and continuous batching keeps the GPU busy.</p>
            </div>
          </div>
        </div>

        {/* Annotations */}
        <div className="proj-reveal grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {project.how.map((step, i) => (
            <div key={step} className="border-l-2 border-dashed border-white/50 pl-4 py-1 text-[12px] leading-relaxed">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full border text-[11px] font-bold mb-2" style={{ borderColor: YELLOW, color: YELLOW }}>{i + 1}</span>
              <p>{step}</p>
            </div>
          ))}
        </div>

        <SectionLinks project={project} theme="blueprint" />
      </div>
    </section>
  );
};
