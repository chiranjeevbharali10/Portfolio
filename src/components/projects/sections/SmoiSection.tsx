import { useEffect, useRef, useState } from 'react';
import type { Project } from '../../../data/projects';
import { PixelFrog } from '../PixelFrog';
import { SectionLinks } from './shared';

/**
 * B1 — dressed in SMOI's own UI (cream, pastels, charcoal ink, hard shadows, pixel type).
 * Click the frog to chat; ask "SMOI Brain" a question and watch hybrid retrieval
 * (keyword + vector, merged with RRF) produce a cited answer, or an honest "I don't know".
 */

const INK = '#514b50';
const CREAM = '#fff1d6';
const PANEL = '#fffaee';
const GREEN = '#b8ddb1';
const PINK = '#f6c8d5';
const BLUE = '#c9d8f4';
const LAV = '#e9d9f5';
const WALL = '#a8ace2';

const CHATTER = [
  'Hi. What are we avoiding today?',
  'Hellooo? Still alive over there?',
  'Oh! Hi. Was I… doing something?',
  'You did a thing! So proud.',
  'I only draft emails. I never send them. Promise.',
];

const DOCS = [
  { name: 'lease_2026.pdf', meta: '12 pages' },
  { name: 'meeting_notes.txt', meta: '3 sections' },
  { name: 'thesis_draft.docx', meta: '41 pages' },
];

type Q = {
  q: string;
  answer: string;
  cites: string[];
  hits: [number, number];
  status: 'answered' | 'dont_know';
};

const QUESTIONS: Q[] = [
  {
    q: 'When is my rent due?',
    answer: 'On the 1st of every month, with a 5-day grace period before a late fee. [S1]',
    cites: ['S1 · lease_2026.pdf · p.4 §2'],
    hits: [3, 4],
    status: 'answered',
  },
  {
    q: 'What did we decide about the demo?',
    answer: 'Ship the demo on Friday and cut the export feature for now. [S1] You own the slides. [S2]',
    cites: ['S1 · meeting_notes.txt · Decisions', 'S2 · meeting_notes.txt · Action items'],
    hits: [2, 5],
    status: 'answered',
  },
  {
    q: "What's my bank PIN?",
    answer: "Your documents don't say, so I won't guess.",
    cites: [],
    hits: [0, 1],
    status: 'dont_know',
  },
];

const STEPS = ['keyword search (Postgres FTS)', 'vector search (pgvector)', 'reciprocal rank fusion', 'answer + check every citation'];

export const SmoiSection = ({ project }: { project: Project }) => {
  const [bubble, setBubble] = useState(CHATTER[0]);
  const [chat, setChat] = useState(0);
  const [asked, setAsked] = useState<Q | null>(null);
  const [step, setStep] = useState(-1); // -1 idle, 0..3 running, 4 done
  const [happy, setHappy] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const poke = () => {
    if (step >= 0 && step < 4) return;
    const next = (chat + 1) % CHATTER.length;
    setChat(next);
    setBubble(CHATTER[next]);
    setHappy(true);
    timers.current.push(window.setTimeout(() => setHappy(false), 700));
  };

  const ask = (q: Q) => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setAsked(q);
    setHappy(false);
    setStep(0);
    setBubble('Hmm… reading your files.');
    STEPS.forEach((_, i) => timers.current.push(window.setTimeout(() => setStep(i + 1), 650 * (i + 1))));
    timers.current.push(
      window.setTimeout(() => {
        setBubble(q.status === 'answered' ? 'Found it! Sources attached.' : "Not in your files. I won't make it up.");
        setHappy(q.status === 'answered');
      }, 650 * STEPS.length),
    );
  };

  const shadow = (px = 6) => `0 ${px}px 0 ${INK}`;

  return (
    <section
      id={project.id}
      className="scroll-mt-16 relative py-20 md:py-28 overflow-hidden"
      style={{ background: CREAM, color: INK, backgroundImage: `radial-gradient(${BLUE} 1.2px, transparent 1.4px)`, backgroundSize: '22px 22px' }}
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="proj-reveal text-center flex flex-col items-center mb-12">
          <span className="rounded-full border-2 px-4 py-1 text-[11px] font-extrabold tracking-[0.2em] -rotate-2 mb-6" style={{ background: PANEL, borderColor: INK, boxShadow: shadow(3) }}>
            TRACK {project.track} · LIVES ON YOUR DESKTOP
          </span>
          <h2 className="font-minecraft text-6xl sm:text-8xl leading-none">
            Meet <span style={{ textShadow: `6px 6px 0 ${GREEN}` }}>SMOI.</span>
          </h2>
          <p className="font-minecraft text-xl sm:text-2xl mt-5">{project.tagline}</p>
          <p className="mt-4 max-w-2xl text-base sm:text-lg leading-relaxed opacity-90">{project.about}</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* A tiny desktop with SMOI on the taskbar */}
          <div className="proj-reveal rounded-[22px] border-2 overflow-hidden flex flex-col min-h-[380px]" style={{ background: WALL, borderColor: INK, boxShadow: shadow() }}>
            <div className="flex-1 relative p-5">
              <div className="rounded-[14px] border-2 w-[70%] max-w-[280px]" style={{ background: PANEL, borderColor: INK }}>
                <div className="flex gap-1.5 px-3 py-2 border-b-2" style={{ borderColor: INK, background: BLUE }}>
                  {[0, 1, 2].map((i) => <span key={i} className="w-2.5 h-2.5 rounded-full border-2" style={{ borderColor: INK }} />)}
                </div>
                <div className="p-3 flex flex-col gap-2">
                  {[90, 70, 80, 50].map((w, i) => <span key={i} className="h-2 rounded-full" style={{ width: `${w}%`, background: LAV }} />)}
                </div>
              </div>

              {/* Speech bubble */}
              <div className="absolute right-4 sm:right-6 bottom-[132px] max-w-[230px]">
                <div key={bubble} className="proj-in rounded-[18px] border-2 px-4 py-2.5 font-minecraft text-sm leading-snug" style={{ background: BLUE, borderColor: INK }}>
                  {bubble}
                </div>
                <span className="absolute right-12 -bottom-[7px] w-3 h-3 rotate-45 border-r-2 border-b-2" style={{ background: BLUE, borderColor: INK }} />
              </div>

              {/* The frog */}
              <button
                type="button"
                onClick={poke}
                aria-label="Poke SMOI"
                className="absolute right-6 sm:right-10 bottom-2 w-[120px] transition-transform hover:-translate-y-1 active:scale-95"
              >
                <svg viewBox="0 0 14 10" className="w-full h-auto block">
                  <PixelFrog happy={happy} />
                </svg>
              </button>
            </div>
            <div className="border-t-2 px-4 py-2 flex items-center justify-between text-xs font-bold" style={{ borderColor: INK, background: PANEL }}>
              <span>⊞ taskbar</span>
              <span className="font-minecraft opacity-70">click the frog ↑</span>
            </div>
          </div>

          {/* SMOI Brain */}
          <div className="proj-reveal rounded-[22px] border-2 p-5 sm:p-6 flex flex-col gap-4" style={{ background: PANEL, borderColor: INK, boxShadow: shadow() }}>
            <div className="flex items-center justify-between">
              <h3 className="font-minecraft text-2xl">SMOI Brain</h3>
              <span className="rounded-full border-2 px-2.5 py-0.5 text-[11px] font-extrabold" style={{ background: GREEN, borderColor: INK }}>hybrid · RRF</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {DOCS.map((d) => (
                <span key={d.name} className="rounded-[12px] border-2 px-2.5 py-1 text-xs font-bold" style={{ background: CREAM, borderColor: INK }}>
                  📄 {d.name} <span className="opacity-60 font-normal">· {d.meta}</span>
                </span>
              ))}
            </div>

            <div>
              <p className="text-xs font-extrabold uppercase tracking-wide opacity-70 mb-2">Ask your files</p>
              <div className="flex flex-wrap gap-2">
                {QUESTIONS.map((q, i) => (
                  <button
                    key={q.q}
                    type="button"
                    onClick={() => ask(q)}
                    className="proj-chip rounded-full border-2 px-3.5 py-1.5 text-sm font-extrabold"
                    style={{ background: [PINK, BLUE, LAV][i], borderColor: INK, boxShadow: asked === q ? 'none' : undefined, transform: asked === q ? 'translateY(2px)' : undefined }}
                  >
                    {q.q}
                  </button>
                ))}
              </div>
            </div>

            {asked && (
              <div className="flex flex-col gap-3">
                <ol className="flex flex-col gap-1.5">
                  {STEPS.map((s, i) => {
                    const done = step > i;
                    const running = step === i;
                    const detail =
                      i === 0 ? `${asked.hits[0]} hits` : i === 1 ? `${asked.hits[1]} hits` : i === 2 ? `top ${Math.min(3, asked.hits[0] + asked.hits[1])}` : asked.status;
                    return (
                      <li key={s} className={`flex items-center gap-2 text-sm transition-opacity ${done || running ? 'opacity-100' : 'opacity-35'}`}>
                        <span className="w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] font-bold shrink-0" style={{ borderColor: INK, background: done ? GREEN : 'transparent' }}>
                          {done ? '✓' : running ? '…' : i + 1}
                        </span>
                        <span className="flex-1">{s}</span>
                        {done && <span className="font-minecraft text-xs opacity-70">{detail}</span>}
                      </li>
                    );
                  })}
                </ol>

                {step >= STEPS.length && (
                  <div className="proj-in rounded-[14px] border-2 p-4" style={{ background: asked.status === 'answered' ? CREAM : PINK, borderColor: INK }}>
                    <p className="leading-relaxed">{asked.answer}</p>
                    {asked.cites.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {asked.cites.map((c) => (
                          <span key={c} className="rounded-full border-2 px-2.5 py-0.5 text-[11px] font-extrabold" style={{ background: GREEN, borderColor: INK }}>📎 {c}</span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs font-extrabold mt-2 opacity-80">status: dont_know · no sources, no answer</p>
                    )}
                  </div>
                )}
              </div>
            )}
            {!asked && <p className="text-sm opacity-60">Pick a question to watch retrieval happen step by step.</p>}
          </div>
        </div>

        <div className="proj-reveal grid sm:grid-cols-2 gap-4 mt-6">
          {project.how.map((step, i) => (
            <div key={step} className="rounded-[18px] border-2 p-5 flex gap-3" style={{ background: PANEL, borderColor: INK, boxShadow: shadow(4) }}>
              <span className="font-minecraft text-sm w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0" style={{ background: [GREEN, PINK, BLUE, LAV][i], borderColor: INK }}>{i + 1}</span>
              <p className="text-[15px] leading-relaxed">{step}</p>
            </div>
          ))}
        </div>

        <SectionLinks project={project} theme="smoi" />
      </div>
    </section>
  );
};
