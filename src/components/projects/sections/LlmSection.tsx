import { useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';
import type { Project } from '../../../data/projects';
import { SectionLinks } from './shared';

/**
 * A3 — "ops console": dark slate, Grafana orange, monospace.
 * A simulated replay of the stack: the request hops Nginx → FastAPI → vLLM → GPU,
 * tokens stream back, the edge rate limit really trips, and a concurrency slider
 * replays the README's load-test numbers.
 */

const BG = '#0b0f15';
const PANEL = '#0f141c';
const LINE = '#2a3242';
const ORANGE = '#ff9f43';
const BLUE = '#4dabf7';
const GREEN = '#51cf66';
const RED = '#ff6b6b';

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

  return (
    <section id={project.id} className="scroll-mt-16 relative py-20 md:py-28 overflow-hidden font-mono" style={{ background: BG, color: '#d5deeb' }}>
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="proj-reveal mb-10">
          <p className="text-xs tracking-[0.3em] mb-4" style={{ color: ORANGE }}>[{project.track}] ~/LocalLLMInference</p>
          <h2 className="font-sans font-black text-5xl sm:text-7xl tracking-tight leading-[0.9]">
            local<span style={{ color: ORANGE }}>_</span>llm<span className="animate-pulse" style={{ color: ORANGE }}>▍</span>
          </h2>
          <p className="font-sans text-lg sm:text-xl mt-5 max-w-2xl text-[#e6edf7]">{project.tagline}</p>
          <p className="font-sans mt-3 max-w-3xl leading-relaxed text-[#8b97ab]">{project.about}</p>
        </div>

        {/* Pipeline */}
        <div className="proj-reveal grid grid-cols-5 gap-1.5 sm:gap-0 items-stretch mb-4">
          {NODES.map((n, i) => {
            const on = active === n.id;
            const red = on && blocked && n.id === 'nginx';
            return (
              <div key={n.id} className="relative flex flex-col items-center">
                <div
                  className="w-full sm:w-[88%] h-full rounded-md border px-1.5 sm:px-3 py-2 sm:py-3 transition-all duration-200"
                  style={{
                    background: PANEL,
                    borderColor: red ? RED : on ? ORANGE : LINE,
                    boxShadow: red ? `0 0 24px ${RED}55` : on ? `0 0 24px ${ORANGE}55` : 'none',
                  }}
                >
                  <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-sm font-bold whitespace-nowrap">
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full shrink-0" style={{ background: red ? RED : on ? ORANGE : GREEN }} />
                    {n.name}
                  </div>
                  <div className="hidden sm:block text-[10px] mt-1 text-[#8b97ab]">{n.sub}</div>
                </div>
                {i < NODES.length - 1 && (
                  <span className="hidden sm:block absolute right-[-6%] top-1/2 -translate-y-1/2 text-[#3b475b]">→</span>
                )}
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-4">
          {/* Terminal */}
          <div className="proj-reveal rounded-lg border overflow-hidden flex flex-col" style={{ background: PANEL, borderColor: LINE }}>
            <div className="flex items-center gap-2 px-4 py-2.5 border-b text-[11px] text-[#8b97ab]" style={{ borderColor: LINE }}>
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff6b6b]" /><span className="w-2.5 h-2.5 rounded-full bg-[#ffd43b]" /><span className="w-2.5 h-2.5 rounded-full bg-[#51cf66]" />
              <span className="ml-2">gateway — bash</span>
            </div>
            <div ref={termRef} className="h-64 sm:h-72 overflow-y-auto px-4 py-3 text-[12px] sm:text-[13px] leading-relaxed flex flex-col gap-1.5">
              {lines.map((l, i) => (
                <p
                  key={i}
                  className="break-words"
                  style={{ color: l.kind === 'cmd' ? BLUE : l.kind === 'err' ? RED : l.kind === 'meta' ? '#8b97ab' : '#e6edf7' }}
                >
                  {l.kind === 'out' && <span style={{ color: ORANGE }}>❯ </span>}
                  {l.text}
                </p>
              ))}
            </div>
            <div className="border-t p-3 flex flex-col sm:flex-row gap-2" style={{ borderColor: LINE }}>
              <div className="flex flex-wrap gap-1.5 flex-1">
                {PROMPTS.map((p, i) => (
                  <button
                    key={p.q}
                    type="button"
                    onClick={() => setPick(i)}
                    className="rounded border px-2.5 py-1.5 text-[11px] text-left transition-colors"
                    style={{ borderColor: pick === i ? ORANGE : LINE, color: pick === i ? ORANGE : '#9fb4d4', background: pick === i ? `${ORANGE}14` : 'transparent' }}
                  >
                    {p.q}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={send}
                disabled={busy}
                className="inline-flex items-center justify-center gap-2 rounded px-4 py-2 text-xs font-bold uppercase tracking-widest disabled:opacity-50"
                style={{ background: ORANGE, color: BG }}
              >
                <Send size={14} /> send
              </button>
            </div>
            <div className="px-4 pb-3 text-[10px] text-[#8b97ab] flex items-center gap-2">
              <span>nginx bucket</span>
              <span className="flex gap-[3px]">
                {Array.from({ length: LIMIT }).map((_, i) => (
                  <span key={i} className="w-3 h-1.5 rounded-sm" style={{ background: i < nowCount ? (nowCount >= LIMIT ? RED : ORANGE) : LINE }} />
                ))}
              </span>
              <span>{nowCount >= LIMIT ? 'full: next request gets a 429' : 'spam send to hit the rate limit'}</span>
            </div>
          </div>

          {/* Load test */}
          <div className="proj-reveal rounded-lg border p-4 sm:p-5 flex flex-col gap-5" style={{ background: PANEL, borderColor: LINE }}>
            <div>
              <div className="flex justify-between items-baseline text-[11px] tracking-widest text-[#8b97ab] uppercase">
                <span>Locust · concurrent users</span>
                <span className="text-2xl font-bold" style={{ color: ORANGE }}>{users}</span>
              </div>
              <input type="range" min={1} max={50} value={users} onChange={(e) => setUsers(+e.target.value)} className="w-full mt-2 accent-[#ff9f43]" aria-label="Concurrent users" />
            </div>

            <div className="flex flex-col gap-2.5">
              {(['p50', 'p95', 'p99'] as const).map((k) => (
                <div key={k} className="flex items-center gap-3 text-[11px]">
                  <span className="w-8 text-[#8b97ab]">{k}</span>
                  <div className="flex-1 h-3 rounded-sm" style={{ background: '#161d29' }}>
                    <div className="h-full rounded-sm transition-all duration-300" style={{ width: `${(lat[k] / 800) * 100}%`, background: k === 'p99' ? ORANGE : BLUE }} />
                  </div>
                  <span className="w-14 text-right">{Math.round(lat[k])}ms</span>
                </div>
              ))}
              <p className="text-[11px]" style={{ color: GREEN }}>✓ 0 failures</p>
            </div>

            <div>
              <div className="flex justify-between text-[11px] tracking-widest text-[#8b97ab] uppercase mb-2">
                <span>KV cache pages</span><span>{kvUsed}/48</span>
              </div>
              <div className="grid grid-cols-12 gap-[3px]">
                {Array.from({ length: 48 }).map((_, i) => {
                  // Pages are scattered like real paging, not one contiguous block
                  const used = ((i * 29) % 48) < kvUsed;
                  return <span key={i} className="aspect-square rounded-[2px] transition-colors duration-300" style={{ background: used ? BLUE : '#161d29' }} />;
                })}
              </div>
              <p className="text-[10px] text-[#8b97ab] mt-2 leading-relaxed">PagedAttention hands out pages as sequences grow, so more requests fit and continuous batching keeps the GPU busy.</p>
            </div>
          </div>
        </div>

        <div className="proj-reveal grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
          {project.how.map((step, i) => (
            <div key={step} className="rounded-lg border p-4 text-[12px] leading-relaxed text-[#9fb4d4]" style={{ background: PANEL, borderColor: LINE }}>
              <span style={{ color: ORANGE }}>{String(i + 1).padStart(2, '0')} </span>
              {step}
            </div>
          ))}
        </div>

        <SectionLinks project={project} theme="terminal" />
      </div>
    </section>
  );
};
