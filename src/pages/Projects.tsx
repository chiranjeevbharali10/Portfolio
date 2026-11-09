import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { PROJECTS } from '../data/projects';
import { ProjectVinyl } from '../components/projects/ProjectBadge';
import { AiCarSection } from '../components/projects/sections/AiCarSection';
import { ArtSection } from '../components/projects/sections/ArtSection';
import { LlmSection } from '../components/projects/sections/LlmSection';
import { SmoiSection } from '../components/projects/sections/SmoiSection';

gsap.registerPlugin(ScrollTrigger);

/**
 * /projects — the site's own dark look for the frame (hero, nav, footer), and one
 * "track" per project, each in its own design with a hands-on demo.
 */

const GITHUB = 'https://github.com/chiranjeevbharali10';
const ACCENT = '#35fe5d';
const [car, art, llm, smoi] = PROJECTS;

export const Projects = () => {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useGSAP(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
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

  const marquee = PROJECTS.map((p) => `${p.name}`).join('   ✦   ');

  return (
    <div ref={rootRef} className="relative min-h-screen w-full bg-[#050505] text-white font-inter overflow-x-clip">
      {/* Top bar */}
      <header className="sticky top-0 z-40 px-4 sm:px-8 py-3 flex items-center justify-between gap-3 bg-[#050505]/80 backdrop-blur-md border-b border-white/5">
        <Link to="/" className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-1.5 text-sm hover:border-[#35fe5d] hover:text-[#35fe5d] transition-colors">
          <ArrowLeft size={16} /> home
        </Link>
        <nav className="flex gap-1 sm:gap-2" aria-label="Jump to a project">
          {PROJECTS.map((p) => (
            <a key={p.id} href={`#${p.id}`} className="rounded-full px-2.5 sm:px-3.5 py-1.5 text-[11px] sm:text-xs font-semibold text-white/60 hover:text-black transition-colors hover:bg-[var(--c)]" style={{ ['--c' as string]: p.color }}>
              <span className="sm:hidden">{p.track}</span>
              <span className="hidden sm:inline">{p.name}</span>
            </a>
          ))}
        </nav>
      </header>

      {/* Hero */}
      <section className="relative max-w-7xl mx-auto px-5 sm:px-8 pt-16 sm:pt-24 pb-16 sm:pb-24">
        <p className="hero-in font-mono text-xs tracking-[0.35em] text-white/50 mb-6">SELECTED WORK · 04 TRACKS</p>
        <h1 className="hero-in font-podium uppercase leading-[0.82] text-[18vw] sm:text-[14vw] lg:text-[11rem] tracking-tight">
          Pro<span style={{ color: ACCENT }}>jects</span>
        </h1>
        <div className="hero-in mt-8 grid md:grid-cols-[1fr_auto] gap-10 items-end">
          <p className="text-lg sm:text-xl text-white/70 max-w-xl leading-relaxed">
            Four records off my shelf: cars that teach themselves to drive, photos repainted by a neural net,
            an inference server on a laptop GPU, and a frog with a RAG brain. Every one of them is playable below.
          </p>
          {/* The shelf: each record jumps to its track */}
          <div className="grid grid-cols-4 gap-3 sm:gap-5">
            {PROJECTS.map((p) => (
              <a key={p.id} href={`#${p.id}`} className="group flex flex-col items-center gap-2" aria-label={`Jump to ${p.name}`}>
                <ProjectVinyl
                  project={p}
                  className="w-16 h-16 sm:w-24 sm:h-24 transition-transform duration-500 group-hover:-translate-y-2 group-hover:rotate-45"
                  style={{ fontSize: '11px' }}
                />
                <span className="text-[10px] sm:text-xs text-white/60 group-hover:text-white whitespace-nowrap">{p.name}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Marquee band */}
      <div className="relative -rotate-1 border-y border-black py-3 overflow-hidden" style={{ background: ACCENT }} aria-hidden="true">
        <div className="proj-marquee flex w-max gap-12 font-podium uppercase text-black text-2xl sm:text-3xl whitespace-nowrap">
          <span>{marquee}   ✦   {marquee}   ✦</span>
          <span>{marquee}   ✦   {marquee}   ✦</span>
        </div>
      </div>

      <div className="mt-16">
        <AiCarSection project={car} />
        <ArtSection project={art} />
        <LlmSection project={llm} />
        <SmoiSection project={smoi} />
      </div>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-5 sm:px-8 py-20 sm:py-28 flex flex-col md:flex-row md:items-end justify-between gap-10">
        <h2 className="font-podium uppercase text-5xl sm:text-7xl leading-[0.9]">
          More tracks<br />
          <span style={{ color: ACCENT }}>pressing soon.</span>
        </h2>
        <div className="flex flex-wrap gap-3">
          <a href={GITHUB} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold text-black hover:bg-white transition-colors" style={{ background: ACCENT }}>
            GitHub <ArrowUpRight size={16} />
          </a>
          <Link to="/" className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 font-semibold hover:border-white transition-colors">
            <ArrowLeft size={16} /> back home
          </Link>
        </div>
      </footer>
    </div>
  );
};
