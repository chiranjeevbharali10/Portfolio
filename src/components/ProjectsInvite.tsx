import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { loadProjects } from '../utils/routePrefetch';

// Same palette as the /projects page (tangerine sleeve: paper, hot orange, black)
const PAPER = '#fff4e6';
const ORANGE = '#ff5a1f';
const INK = '#0d0d0d';

const TITLE = 'wanna seeee what i built?';
const PROMPT = 'four projects you can actually play with: a self-driving car, an art filter, a local LLM and SMOI.';
const LATER_REPLY = "no worries. they'll be right here when you're curious 🛠️";

// Film-grain overlay (same cheap static SVG as the relax invite)
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

/** A window into the /projects page, styled like the relax invite below it. */
export const ProjectsInvite = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [declined, setDeclined] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    // Tell the skills section's fun-fact avatar to step aside while this is on screen
    const io = new IntersectionObserver(([entry]) => {
      window.dispatchEvent(new CustomEvent('relax-invite', { detail: { id: 'projects', visible: entry.isIntersecting } }));
    }, { threshold: 0.4 });
    io.observe(el);
    return () => {
      io.disconnect();
      window.dispatchEvent(new CustomEvent('relax-invite', { detail: { id: 'projects', visible: false } }));
    };
  }, []);

  return (
    <section ref={sectionRef} aria-label="See my projects" className="w-full bg-[#050505] px-3 sm:px-6 md:px-10 pb-6 md:pb-10">
      <div
        className="relative isolate overflow-hidden rounded-[32px] md:rounded-[48px] min-h-[70vh] flex items-center justify-center px-6 py-20"
        style={{ backgroundColor: PAPER, color: INK }}
      >
        {/* Ripples expanding from the centre */}
        <div aria-hidden="true" className="absolute inset-0 -z-10 pointer-events-none">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="relax-ripple absolute top-1/2 left-1/2 w-[90vw] h-[90vw] sm:w-[50vw] sm:h-[50vw] rounded-full"
              style={{
                animationDelay: `${-i * 4}s`,
                background: `radial-gradient(circle closest-side, transparent 0%, transparent 70%, ${ORANGE} 70.5%, ${ORANGE}00 100%)`,
              }}
            />
          ))}
          <div className="absolute inset-0 opacity-[0.22] mix-blend-multiply" style={{ backgroundImage: GRAIN }} />
        </div>

        <div className="relative flex flex-col items-center text-center max-w-2xl">
          <span className="-rotate-[6deg] border-[1.5px] rounded-full px-4 py-0.5 text-xs sm:text-sm font-bold tracking-wide mb-6" style={{ borderColor: INK }}>
            oh, and…
          </span>

          <h2 className="font-asgard text-5xl sm:text-6xl md:text-7xl leading-[1.05] flex flex-wrap justify-center gap-x-3 sm:gap-x-5 lowercase" aria-label={TITLE}>
            {/* Letters grouped per word so lines only break between words */}
            {TITLE.split(' ').map((word, w) => (
              <span key={w} aria-hidden="true" className="inline-flex whitespace-nowrap">
                {Array.from(word).map((char, c) => {
                  const i = w * 10 + c;
                  return (
                    <span
                      key={c}
                      className="relax-wobble inline-block"
                      style={{ animationDuration: `${2.6 + (i % 5) * 0.35}s`, animationDelay: `${-(i * 0.37) % 2}s` }}
                    >
                      {char}
                    </span>
                  );
                })}
              </span>
            ))}
          </h2>

          <p className="font-inter text-base sm:text-lg font-medium mt-6 max-w-md opacity-85" aria-live="polite">
            {declined ? LATER_REPLY : PROMPT}
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/projects"
              onPointerEnter={loadProjects}
              onFocus={loadProjects}
              className="group rotate-[-3deg] hover:rotate-0 rounded-full px-7 py-3 text-sm sm:text-base font-bold tracking-wide transition-transform duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.18)]"
              style={{ backgroundColor: INK, color: PAPER }}
            >
              {declined ? 'ok fine, show me' : 'yess, show me the projects'}{' '}
              <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Link>

            {!declined && (
              <button
                type="button"
                onClick={() => setDeclined(true)}
                className="rotate-[4deg] hover:rotate-0 border-[1.5px] rounded-full px-6 py-2.5 text-sm sm:text-base font-bold tracking-wide transition-transform duration-300 hover:bg-black/10"
                style={{ borderColor: INK }}
              >
                maybe later
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
