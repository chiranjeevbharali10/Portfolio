import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { loadRelax } from '../utils/routePrefetch';

const PROMPT = 'Phew… that was a lot of skills. Do you wanna relax for a bit? 🎧';
const LATER_REPLY = 'Fair enough, hero. The lo-fi room is always open when you need it ✨';
const TYPE_MS = 32;

/** Types `text` out one character at a time once `start` is true. */
const useTypewriter = (text: string, start: boolean) => {
  const [count, setCount] = useState(0);

  useEffect(() => setCount(0), [text]);

  useEffect(() => {
    if (!start) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setCount(text.length);
      return;
    }
    // Derive progress from elapsed time so a busy main thread (e.g. the island
    // frames decoding) can't stretch the typing out.
    const total = Array.from(text).length;
    const startedAt = performance.now();
    const id = window.setInterval(() => {
      const next = Math.min(total, Math.floor((performance.now() - startedAt) / TYPE_MS));
      setCount(next);
      if (next >= total) window.clearInterval(id);
    }, TYPE_MS);
    return () => window.clearInterval(id);
  }, [text, start]);

  // Array.from keeps emoji (surrogate pairs) intact while slicing
  const chars = Array.from(text);
  return { shown: chars.slice(0, count).join(''), done: count >= chars.length };
};

/** Retro game-style dialogue after the skills section, inviting visitors to /relax. */
export const RelaxInvite = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const [declined, setDeclined] = useState(false);
  const { shown, done } = useTypewriter(declined ? LATER_REPLY : PROMPT, inView);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        io.disconnect();
      }
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-label="Take a break"
      className="relative w-full min-h-[70vh] flex items-center justify-center px-4 py-24 overflow-hidden"
      style={{
        // Warm glow from the Relax palette. closest-side makes it fade out before every
        // edge, so there's no hard seam against the skills section above (and no blur
        // filter, which left banding lines in Chrome).
        background:
          'radial-gradient(closest-side at 50% 50%, rgba(255,107,26,0.16), rgba(236,72,153,0.09) 55%, transparent 100%), #050505',
      }}
    >

      <div className="relative w-full max-w-2xl font-minecraft">
        {/* Speaker tag */}
        <div className="inline-block mb-[-2px] ml-6 px-4 py-1.5 bg-[#F5F3E8] text-black text-xs tracking-[0.2em] border-2 border-[#F5F3E8] rounded-t-md">
          CHIRANJEEV
        </div>

        {/* Dialogue box */}
        <div className="relative bg-black/90 border-2 border-[#F5F3E8] rounded-lg p-6 sm:p-8 shadow-[6px_6px_0_rgba(255,107,26,0.55)]">
          <p className="text-[#F5F3E8] text-base sm:text-lg leading-relaxed min-h-[3.5em]" aria-live="polite">
            {shown}
            {!done && <span className="crt-blink">▌</span>}
          </p>

          {/* Choices appear once the line is typed. No opacity fade: on this GPU-heavy page
              the compositor sometimes left a fading layer stuck near-transparent. The fixed
              min-height reserves their space so the box doesn't jump. */}
          <div className="mt-6 min-h-[104px] sm:min-h-[46px]">
          {done && (
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
            <Link
              to="/relax"
              onPointerEnter={loadRelax}
              onFocus={loadRelax}
              className="group flex items-center gap-2 px-5 py-3 rounded-md text-black text-sm tracking-widest bg-gradient-to-r from-[#FF6B1A] to-[#FF2D9A] hover:brightness-110 transition-all shadow-[0_0_24px_rgba(255,45,154,0.35)]"
            >
              <span className="transition-transform group-hover:translate-x-1">▶</span>
              {declined ? 'OK FINE, TAKE ME THERE' : "YES, LET'S CHILL"}
            </Link>

            {!declined && (
              <button
                type="button"
                onClick={() => setDeclined(true)}
                  className="px-5 py-3 rounded-md text-[#F5F3E8]/70 text-sm tracking-widest border border-[#F5F3E8]/25 hover:text-[#F5F3E8] hover:border-[#F5F3E8]/60 transition-all"
              >
                MAYBE LATER
              </button>
            )}
          </div>
          )}
          </div>

          {/* Classic "more text" arrow */}
          {done && <span className="absolute bottom-3 right-4 text-[#F5F3E8]/60 text-xs animate-bounce">▼</span>}
        </div>
      </div>
    </section>
  );
};
