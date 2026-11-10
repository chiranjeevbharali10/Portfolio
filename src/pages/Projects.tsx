import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowDownRight, ArrowLeft, ArrowUpRight, ChevronDown, ChevronUp } from 'lucide-react';
import { PROJECTS } from '../data/projects';
import type { Project } from '../data/projects';
import { ProjectBadge, ProjectVinyl } from '../components/projects/ProjectBadge';
import { AiCarSection } from '../components/projects/sections/AiCarSection';
import { ArtSection } from '../components/projects/sections/ArtSection';
import { LlmSection } from '../components/projects/sections/LlmSection';
import { SmoiSection } from '../components/projects/sections/SmoiSection';

gsap.registerPlugin(ScrollTrigger);

/**
 * /projects — a listening station, printed like a jazz record sleeve: one flat block of
 * tangerine, heavy black type, off-white details. The hero is a turntable with the
 * tracklist beside it (point at a track and the record's label plays that project's mini
 * demo), then one "track" per project, each in its own world with a hands-on demo.
 * A now-playing dock follows you down the page.
 */

const GITHUB = 'https://github.com/chiranjeevbharali10';
const ORANGE = '#ff5a1f';
const BURNT = '#e9460d'; // a shade deeper, for flat shapes on the orange
const BLACK = '#0d0d0d';
const PAPER = '#fff4e6';
const AUTO_MS = 4500;
const [car, art, llm, smoi] = PROJECTS;
const GROOVES = 'repeating-radial-gradient(circle, #0b0b0b 0 2px, #1c1c1c 2px 3.5px)';
const SHEEN = 'conic-gradient(from 40deg, transparent 0 8%, rgba(255,255,255,0.14) 12%, transparent 18% 50%, rgba(255,255,255,0.1) 62%, transparent 68%)';

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** The turntable: the record's label is the live mini demo of whichever track is cued. */
const Deck = ({ project }: { project: Project }) => (
  <div className="relative w-full max-w-[460px] aspect-square mx-auto" style={{ ['--c' as string]: project.color }}>
    <div className="absolute inset-0 rounded-[8%] border-[3px]" style={{ background: PAPER, borderColor: BLACK, boxShadow: `10px 10px 0 ${BLACK}` }} />
    <div className="absolute inset-[5%] rounded-full" style={{ background: BLACK }} />
    <div className="absolute inset-[7%] rounded-full" style={{ background: GROOVES }} />
    <div className="absolute inset-[7%] rounded-full pointer-events-none" style={{ background: SHEEN }} />
    <ProjectBadge project={project} className="absolute inset-[26%] shadow-[0_0_0_4px_var(--c)] transition-shadow duration-700" />
    <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
      <g className="deck-arm">
        <line x1="88" y1="12" x2="76.5" y2="59" stroke={BLACK} strokeWidth="2.8" strokeLinecap="round" />
        <line x1="88" y1="12" x2="76.5" y2="59" stroke={PAPER} strokeWidth="1.2" strokeLinecap="round" />
        <rect x="72.5" y="56" width="7" height="11" rx="1.5" fill={ORANGE} stroke={BLACK} strokeWidth="0.8" transform="rotate(14 76 61)" />
      </g>
      <circle cx="88" cy="12" r="5.5" fill={PAPER} stroke={BLACK} strokeWidth="0.8" />
      <circle cx="88" cy="12" r="2.2" fill={ORANGE} stroke={BLACK} strokeWidth="0.6" />
      <circle cx="10" cy="90" r="1.6" fill={ORANGE} stroke={BLACK} strokeWidth="0.6" />
    </svg>
    <span className="absolute left-[14%] bottom-[2.4%] font-mono font-bold text-[9px] sm:text-[10px] tracking-[0.25em] leading-none" style={{ color: BLACK }}>
      {project.track} · 33 RPM
    </span>
  </div>
);

export const Projects = () => {
  const rootRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const segRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [cued, setCued] = useState(0); // track on the hero turntable
  const [paused, setPaused] = useState(false);
  const [spy, setSpy] = useState({ i: 0, on: false }); // track currently being scrolled through

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // The turntable flips through the tracks until the visitor points at one
  useEffect(() => {
    if (paused || reducedMotion()) return;
    const id = window.setTimeout(() => setCued((i) => (i + 1) % PROJECTS.length), AUTO_MS);
    return () => window.clearTimeout(id);
  }, [cued, paused]);

  // Scroll spy: which track is playing, how far through each one, and overall progress
  useEffect(() => {
    const els = PROJECTS.map((p) => document.getElementById(p.id));
    let raf = 0;
    const update = () => {
      raf = 0;
      const line = window.innerHeight * 0.45;
      let cur = -1;
      els.forEach((el, i) => {
        if (!el) return;
        const r = el.getBoundingClientRect();
        const seg = segRefs.current[i];
        if (seg) seg.style.transform = `scaleX(${Math.min(1, Math.max(0, (line - r.top) / r.height))})`;
        if (r.top <= line && r.bottom > line) cur = i;
      });
      setSpy((s) => {
        if (cur === -1) return s.on ? { i: s.i, on: false } : s;
        return s.on && s.i === cur ? s : { i: cur, on: true };
      });
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (barRef.current) barRef.current.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  useGSAP(() => {
    if (reducedMotion()) return;
    gsap.from('.hero-in', { y: 60, opacity: 0, duration: 1, stagger: 0.08, ease: 'power3.out', delay: 0.2 });
    gsap.utils.toArray<HTMLElement>('.proj-reveal').forEach((el) => {
      gsap.from(el, {
        y: 48,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      });
    });
  }, { scope: rootRef });

  const goTo = (i: number) => {
    document.getElementById(PROJECTS[i].id)?.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' });
  };

  const marquee = PROJECTS.map((p) => `${p.name}`).join('   ✦   ');
  const stackLine = [...new Set(PROJECTS.flatMap((p) => p.stack))].join('   ✦   ');
  const playing = PROJECTS[spy.i];
  const cuedProject = PROJECTS[cued];
  const dockBtn = 'w-8 h-8 rounded-full border-2 border-[#fff4e6]/30 flex items-center justify-center hover:border-[#ff5a1f] hover:text-[#ff5a1f] disabled:opacity-30 disabled:hover:border-[#fff4e6]/30 disabled:hover:text-inherit transition-colors';

  return (
    <div ref={rootRef} className="relative min-h-screen w-full font-inter overflow-x-clip" style={{ background: ORANGE, color: BLACK }}>
      {/* Top bar */}
      <header className="sticky top-0 z-40 px-4 sm:px-8 py-2.5 flex items-center justify-between gap-3 border-b-[3px] border-[#0d0d0d]" style={{ background: ORANGE, color: BLACK }}>
        <Link to="/" className="inline-flex items-center gap-2 rounded-full border-2 border-[#0d0d0d] bg-[#0d0d0d] text-[#fff4e6] px-4 py-1 text-sm font-bold transition-colors hover:bg-[#fff4e6] hover:text-[#0d0d0d]">
          <ArrowLeft size={16} /> home
        </Link>
        <nav className="flex gap-1 sm:gap-2" aria-label="Jump to a project">
          {PROJECTS.map((p, i) => (
            <a
              key={p.id}
              href={`#${p.id}`}
              data-on={spy.on && spy.i === i}
              aria-current={spy.on && spy.i === i ? 'true' : undefined}
              className="rounded-full px-2.5 sm:px-3.5 py-1.5 text-[11px] sm:text-xs font-bold text-[#0d0d0d] transition-colors hover:bg-[#fff4e6] data-[on=true]:bg-[#0d0d0d] data-[on=true]:text-[#fff4e6]"
            >
              <span className="sm:hidden">{p.track}</span>
              <span className="hidden sm:inline">{p.name}</span>
            </a>
          ))}
        </nav>
        <div ref={barRef} className="absolute left-0 bottom-[-3px] h-[3px] w-full origin-left" style={{ background: PAPER, transform: 'scaleX(0)' }} aria-hidden="true" />
      </header>

      {/* Hero: tracklist + turntable */}
      <section className="relative max-w-7xl mx-auto px-5 sm:px-8 pt-14 sm:pt-20 pb-20 sm:pb-28">
        {/* flat sleeve shapes behind the deck */}
        <div aria-hidden="true" className="pointer-events-none absolute right-[-14%] top-[-6%] w-[78vw] max-w-[820px] aspect-square rounded-full" style={{ background: BURNT }} />
        <div aria-hidden="true" className="pointer-events-none absolute right-[30%] bottom-[6%] hidden lg:block w-24 aspect-square rounded-full border-[3px] border-[#0d0d0d]" />
        <p className="hero-in relative font-mono font-bold text-xs tracking-[0.35em] mb-6">SELECTED WORK · 04 TRACKS</p>
        <div className="relative grid lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] gap-12 lg:gap-14 items-center">
          <div>
            <h1 className="hero-in font-podium uppercase leading-[0.82] text-[18.5vw] sm:text-[16vw] lg:text-[clamp(6rem,10vw,9.25rem)] tracking-tight">
              Pro<span style={{ color: PAPER }}>jects</span>
            </h1>
            <p className="hero-in mt-8 text-lg sm:text-xl font-medium max-w-xl leading-relaxed">
              Four records off my shelf: cars that teach themselves to drive, photos repainted by a neural net,
              an inference server on a laptop GPU, and a frog with a RAG brain. Every one of them is playable below.
            </p>

            {/* The tracklist: each row cues its record and jumps to its track */}
            <div
              className="hero-in mt-10 border-b-[3px] border-[#0d0d0d]"
              onPointerEnter={() => setPaused(true)}
              onPointerLeave={() => setPaused(false)}
            >
              {PROJECTS.map((p, i) => (
                <a
                  key={p.id}
                  href={`#${p.id}`}
                  aria-label={`Jump to ${p.name}`}
                  data-on={cued === i}
                  onPointerEnter={() => setCued(i)}
                  onFocus={() => setCued(i)}
                  className="group flex items-center gap-3 sm:gap-5 border-t-[3px] border-[#0d0d0d] py-3 sm:py-4 px-2 sm:px-3 transition-colors duration-300 data-[on=true]:bg-[#0d0d0d] data-[on=true]:text-[#fff4e6]"
                  style={{ ['--c' as string]: p.color }}
                >
                  <span className="font-mono font-bold text-xs w-6 shrink-0 group-data-[on=true]:text-[var(--c)]">{p.track}</span>
                  <span className="font-podium uppercase text-4xl sm:text-5xl leading-none whitespace-nowrap transition-transform duration-300 group-data-[on=true]:translate-x-2">{p.name}</span>
                  <span className="flex-1 min-w-4 border-b-2 border-dotted border-current opacity-40" />
                  <span className="hidden md:block font-mono font-bold text-[11px] uppercase tracking-widest whitespace-nowrap">{p.stack.slice(0, 2).join(' · ')}</span>
                  <ArrowDownRight size={22} className="shrink-0 transition-transform duration-300 group-data-[on=true]:text-[var(--c)] group-hover:translate-x-1 group-hover:translate-y-1" />
                </a>
              ))}
            </div>
          </div>

          <div className="hero-in" onPointerEnter={() => setPaused(true)} onPointerLeave={() => setPaused(false)}>
            <Deck project={cuedProject} />
            <p className="mt-9 text-center font-mono font-bold text-[11px] tracking-[0.25em] uppercase" aria-live="off">
              now spinning · <span className="px-2 py-1 bg-[#0d0d0d] text-[#fff4e6]">{cuedProject.name}</span>
            </p>
          </div>
        </div>
      </section>

      {/* Crossed marquee tapes */}
      <div className="relative py-5" aria-hidden="true">
        <div className="-mx-6 rotate-[1.5deg] border-y-[3px] border-[#0d0d0d] py-2.5 overflow-hidden" style={{ background: PAPER }}>
          <div className="proj-marquee-rev flex w-max gap-12 font-mono font-bold uppercase text-sm sm:text-base tracking-[0.2em] whitespace-nowrap">
            <span>{stackLine}   ✦</span>
            <span>{stackLine}   ✦</span>
          </div>
        </div>
        <div className="relative -mx-6 -mt-7 sm:-mt-8 -rotate-1 py-3 overflow-hidden" style={{ background: BLACK, color: ORANGE }}>
          <div className="proj-marquee flex w-max gap-12 font-podium uppercase text-2xl sm:text-3xl whitespace-nowrap">
            <span>{marquee}   ✦   {marquee}   ✦</span>
            <span>{marquee}   ✦   {marquee}   ✦</span>
          </div>
        </div>
      </div>

      <div className="mt-14">
        <AiCarSection project={car} />
        <ArtSection project={art} />
        <LlmSection project={llm} />
        <SmoiSection project={smoi} />
      </div>

      {/* Footer: the next record is still on the press */}
      <footer className="relative overflow-hidden" style={{ background: BLACK, color: PAPER }}>
        <div aria-hidden="true" className="pointer-events-none absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-[62%] w-[120vw] max-w-[1100px] aspect-square rounded-full" style={{ background: GROOVES }}>
          <div className="absolute inset-0 rounded-full" style={{ background: SHEEN }} />
          <div className="absolute inset-[24%] rounded-full" style={{ background: ORANGE }}>
            <svg viewBox="0 0 200 200" className="vinyl-slow absolute inset-0 w-full h-full">
              <defs>
                <path id="press-ring" d="M100,100 m-84,0 a84,84 0 1,1 168,0 a84,84 0 1,1 -168,0" />
              </defs>
              <text className="font-mono" fontSize="7.5" fontWeight="700" fill={BLACK}>
                <textPath href="#press-ring" textLength="520" lengthAdjust="spacing">
                  B2 · ??? · STILL ON THE PRESS · B2 · ??? · STILL ON THE PRESS · B2 · ??? · STILL ON THE PRESS ·
                </textPath>
              </text>
            </svg>
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[5%] aspect-square rounded-full" style={{ background: BLACK }} />
          </div>
        </div>
        <div className="relative max-w-7xl mx-auto px-5 sm:px-8 pt-20 sm:pt-28 pb-[42vw] lg:pb-[400px] flex flex-col md:flex-row md:items-end justify-between gap-10">
          <h2 className="font-podium uppercase text-6xl sm:text-8xl leading-[0.88]">
            More tracks<br />
            <span style={{ color: ORANGE }}>pressing soon.</span>
          </h2>
          <div className="flex flex-wrap gap-3">
            <a href={GITHUB} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full px-6 py-3 font-bold transition-colors hover:bg-[#fff4e6]" style={{ background: ORANGE, color: BLACK }}>
              GitHub <ArrowUpRight size={16} />
            </a>
            <Link to="/" className="inline-flex items-center gap-2 rounded-full border-2 border-[#fff4e6]/40 px-6 py-3 font-bold hover:border-[#fff4e6] transition-colors" style={{ background: BLACK }}>
              <ArrowLeft size={16} /> back home
            </Link>
          </div>
        </div>
      </footer>

      {/* Now-playing dock: a bottom pill on small screens, a slim rail in the right margin on wide ones */}
      <div
        className={`fixed z-40 bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 xl:left-auto xl:right-3 xl:bottom-auto xl:top-1/2 xl:-translate-y-1/2 transition-all duration-500 ${spy.on ? 'translate-y-0 xl:translate-x-0 opacity-100' : 'translate-y-[160%] xl:translate-x-[160%] opacity-0 pointer-events-none'}`}
        aria-hidden={!spy.on}
      >
        <div
          className="flex xl:flex-col items-center gap-3 xl:gap-2.5 rounded-full border-2 border-[#fff4e6]/25 p-1.5 xl:pb-2 shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
          style={{ background: BLACK, color: PAPER }}
          title={`${playing.track} · ${playing.name}`}
        >
          <ProjectVinyl project={playing} className="w-9 h-9" style={{ fontSize: '5px' }} />
          <div className="min-w-0 xl:flex xl:flex-col xl:items-center">
            <p className="font-mono font-bold text-[10px] sm:text-[11px] tracking-widest uppercase leading-none whitespace-nowrap">
              <span style={{ color: ORANGE }}>{playing.track}</span><span className="xl:hidden"> · {playing.name}</span>
            </p>
            <div className="flex xl:flex-col gap-1 mt-1.5 xl:mt-2">
              {PROJECTS.map((p, i) => (
                <span key={p.id} className="block w-5 sm:w-7 h-1 rounded-full bg-[#fff4e6]/20 overflow-hidden">
                  <span ref={(el) => { segRefs.current[i] = el; }} className="block w-full h-full origin-left" style={{ background: ORANGE, transform: 'scaleX(0)' }} />
                </span>
              ))}
            </div>
          </div>
          <div className="flex xl:flex-col gap-1">
            <button type="button" onClick={() => goTo(spy.i - 1)} disabled={spy.i === 0} tabIndex={spy.on ? 0 : -1} aria-label="Previous project" className={dockBtn}>
              <ChevronUp size={16} />
            </button>
            <button type="button" onClick={() => goTo(spy.i + 1)} disabled={spy.i === PROJECTS.length - 1} tabIndex={spy.on ? 0 : -1} aria-label="Next project" className={dockBtn}>
              <ChevronDown size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
