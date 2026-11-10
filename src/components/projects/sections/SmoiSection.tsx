import { useEffect, useRef, useState } from 'react';
import type { Project } from '../../../data/projects';
import { PixelFrog } from '../PixelFrog';
import { SectionLinks } from './shared';

/**
 * B1 — dressed in SMOI's own UI (cream, pastels, charcoal ink, hard shadows, pixel type),
 * laid out as one little desktop: files as icons, "SMOI Brain" as an app window, the frog
 * sitting on the taskbar.
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
  { name: 'lease_2026.pdf', meta: '12 pages', tint: PINK },
  { name: 'meeting_notes.txt', meta: '3 sections', tint: GREEN },
  { name: 'thesis_draft.docx', meta: '41 pages', tint: BLUE },
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

const Dots = () => (
  <span className="flex gap-1.5 shrink-0">
    {[0, 1, 2].map((i) => <span key={i} className="w-2.5 h-2.5 rounded-full border-2" style={{ borderColor: INK }} />)}
  </span>
);

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

        {/* One little desktop: file icons, the Brain window, SMOI on the taskbar */}
        <div className="proj-reveal rounded-[22px] border-2 overflow-hidden" style={{ background: WALL, borderColor: INK, boxShadow: shadow(8) }}>
          <div className="flex items-center gap-3 border-b-2 px-4 py-2 text-xs font-extrabold" style={{ borderColor: INK, background: PANEL }}>
            <Dots />
            <span className="font-minecraft text-sm">desktop</span>
            <span className="ml-auto opacity-70 hidden sm:inline">drafts only · never sends, never deletes</span>
          </div>

          <div
            className="grid gap-5 px-4 sm:px-6 pt-5 sm:pt-6 lg:grid-cols-[150px_minmax(0,1fr)_250px] lg:min-h-[500px]"
            style={{ backgroundImage: 'radial-gradient(rgba(255,250,238,0.35) 1.2px, transparent 1.4px)', backgroundSize: '18px 18px' }}
          >
            {/* Files on the desktop */}
            <ul className="flex lg:flex-col flex-wrap gap-3 lg:gap-5 lg:pb-6 content-start">
              {DOCS.map((d) => (
                <li key={d.name} className="flex lg:flex-col items-center gap-2 lg:gap-1.5 lg:text-center">
                  <svg viewBox="0 0 12 14" className="w-8 lg:w-12 h-auto shrink-0" shapeRendering="crispEdges" aria-hidden="true">
                    <path d="M1 0h7l3 3v11H1z" fill={PANEL} stroke={INK} strokeWidth="1" />
                    <path d="M8 0v3h3" fill={d.tint} stroke={INK} strokeWidth="1" />
                    <rect x="3" y="6" width="6" height="1" fill={d.tint} />
                    <rect x="3" y="8" width="6" height="1" fill={d.tint} />
                    <rect x="3" y="10" width="4" height="1" fill={d.tint} />
                  </svg>
                  <span className="rounded-[8px] border-2 px-2 py-0.5 text-[11px] font-bold leading-tight break-all" style={{ background: PANEL, borderColor: INK }}>
                    {d.name}
                    <span className="block font-normal opacity-70">{d.meta}</span>
                  </span>
                </li>
              ))}
            </ul>

            {/* SMOI Brain */}
            <div className="rounded-[18px] border-2 overflow-hidden self-start lg:mb-6" style={{ background: PANEL, borderColor: INK, boxShadow: shadow(5) }}>
              <div className="flex items-center gap-3 px-4 py-2.5 border-b-2" style={{ borderColor: INK, background: BLUE }}>
                <Dots />
                <h3 className="font-minecraft text-xl sm:text-2xl leading-none">SMOI Brain</h3>
                <span className="ml-auto rounded-full border-2 px-2.5 py-0.5 text-[11px] font-extrabold whitespace-nowrap" style={{ background: GREEN, borderColor: INK }}>hybrid · RRF</span>
              </div>

              <div className="p-4 sm:p-6 flex flex-col gap-4">
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
                {!asked && <p className="text-sm opacity-70">Pick a question to watch retrieval happen step by step.</p>}
              </div>
            </div>

            {/* SMOI, sitting on the taskbar */}
            <div className="flex flex-col items-end justify-end min-h-[200px]">
              <div className="relative mb-3 mr-1 max-w-[230px]">
                <div key={bubble} className="proj-in rounded-[18px] border-2 px-4 py-2.5 font-minecraft text-sm leading-snug" style={{ background: BLUE, borderColor: INK }}>
                  {bubble}
                </div>
                <span className="absolute right-12 -bottom-[7px] w-3 h-3 rotate-45 border-r-2 border-b-2" style={{ background: BLUE, borderColor: INK }} />
              </div>
              <button
                type="button"
                onClick={poke}
                aria-label="Poke SMOI"
                className="w-[120px] mr-4 transition-transform hover:-translate-y-1 active:scale-95"
              >
                <svg viewBox="0 0 14 10" className="w-full h-auto block">
                  <PixelFrog happy={happy} />
                </svg>
              </button>
            </div>
          </div>

          <div className="border-t-2 px-4 py-2 flex items-center justify-between text-xs font-bold" style={{ borderColor: INK, background: PANEL }}>
            <span>⊞ taskbar</span>
            <span className="font-minecraft opacity-70">click the frog ↑</span>
          </div>
        </div>

        <div className="proj-reveal grid sm:grid-cols-2 gap-4 mt-8">
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
