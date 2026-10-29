import { Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import gsap from "gsap";
import { skillsData } from "../../data/skills";
import { lenis } from "../../utils/smoothScroll";
import { Scene } from "./Scene";
import { SidePeek } from "./SidePeek";
import { game, targets, useGame, world } from "./store";

const MOVE_KEYS = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "KeyW", "KeyA", "KeyS", "KeyD"];
const SCROLL_KEYS = ["PageUp", "PageDown", "Home", "End"];
// Separate wheel "flicks" needed before we ask to exit (one flick = burst of wheel events)
const SCROLLS_TO_PROMPT = 2;
const GESTURE_GAP = 350;
const GESTURE_WINDOW = 4000;

const RetroButton = ({ onClick, primary, children }: { onClick: () => void; primary?: boolean; children: ReactNode }) => (
  <button
    onPointerDown={(e) => e.stopPropagation()}
    onClick={onClick}
    className={`pointer-events-auto interactive font-minecraft text-[11px] sm:text-sm tracking-widest uppercase px-4 sm:px-6 py-2.5 border-2 transition-all hover:-translate-y-0.5 ${
      primary
        ? "bg-[#35fe5d] border-[#35fe5d] text-black shadow-[0_0_20px_rgba(53,254,93,0.45)]"
        : "border-[#35fe5d]/60 text-[#35fe5d] hover:bg-[#35fe5d]/10"
    }`}
  >
    {children}
  </button>
);

export const SkillsShooter = () => {
  const { status, wave, destroyed, lastHit, skipped } = useGame();
  const isWon = status === "won";
  const sectionRef = useRef<HTMLElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const inViewRef = useRef(false);
  const [inView, setInView] = useState(false);
  const [scrollHint, setScrollHint] = useState(false);
  const [mobile] = useState(() => window.matchMedia("(pointer: coarse)").matches);

  // Keep the WebGL canvas alive only while on screen; pause if the game scrolls away
  useEffect(() => {
    const el = screenRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      inViewRef.current = entry.isIntersecting;
      setInView(entry.isIntersecting);
      if (!entry.isIntersecting) {
        world.firing = false;
        game.pause();
      }
    }, { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, [isWon]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) game.showAll();
  }, []);

  // Lock page scroll while a game is running or paused
  const locked = status === "playing" || status === "paused";
  useEffect(() => {
    if (!locked) return;
    // Center the TV, then freeze the page (force lets the scroll run while stopped).
    // overflow:hidden also blocks scrollbar drags and touch scrolling outside the TV.
    lenis?.stop();
    const root = document.documentElement;
    const prevOverflow = root.style.overflow;
    root.style.overflow = "hidden";
    const el = sectionRef.current;
    if (el) {
      if (lenis) lenis.scrollTo(el, { duration: 0.6, force: true });
      else el.scrollIntoView({ behavior: "smooth" });
    }

    let gestures = 0;
    let first = 0;
    let last = 0;
    let hintTimer = 0;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (game.get().status !== "playing") return;
      const now = performance.now();
      if (now - last > GESTURE_GAP) {
        if (now - first > GESTURE_WINDOW) {
          gestures = 0;
          first = now;
        }
        gestures++;
        if (gestures >= SCROLLS_TO_PROMPT) {
          gestures = 0;
          world.firing = false;
          setScrollHint(false);
          game.pause();
        } else {
          setScrollHint(true);
          clearTimeout(hintTimer);
          hintTimer = window.setTimeout(() => setScrollHint(false), 1800);
        }
      }
      last = now;
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      window.removeEventListener("wheel", onWheel);
      clearTimeout(hintTimer);
      setScrollHint(false);
      root.style.overflow = prevOverflow;
      lenis?.start();
    };
  }, [locked]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const { status } = game.get();
      if (status === "playing" || status === "paused") {
        if (SCROLL_KEYS.includes(e.code)) e.preventDefault();
      }
      if (!inViewRef.current) return;
      if (e.code === "Space" && status === "idle") {
        e.preventDefault();
        game.start();
      } else if (status === "playing") {
        if (e.code === "Space") {
          e.preventDefault();
          world.firing = true;
        } else if (MOVE_KEYS.includes(e.code)) {
          e.preventDefault();
          world.keys.add(e.code);
        } else if (e.code === "Escape") {
          world.firing = false;
          game.pause();
        }
      } else if (status === "paused") {
        if (e.code === "Space") e.preventDefault();
        if (e.code === "Escape") game.resume();
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === "Space") world.firing = false;
      world.keys.delete(e.code);
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  useEffect(() => {
    if (!lastHit || !popupRef.current) return;
    gsap.fromTo(
      popupRef.current,
      { scale: 0.6, opacity: 1, y: 0 },
      { scale: 1.1, opacity: 0, y: -30, duration: 1.1, ease: "power3.out" }
    );
  }, [lastHit]);

  const skipToSkills = () => {
    world.firing = false;
    game.showAll();
    requestAnimationFrame(() => {
      const el = sectionRef.current;
      if (el && lenis) lenis.scrollTo(el, { duration: 0.6, force: true });
    });
  };

  const playing = status === "playing";
  const fire = (on: boolean) => {
    world.firing = on && game.get().status === "playing";
  };
  const current = skillsData[wave];

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen w-full bg-[#050505] flex flex-col items-center justify-center px-4 py-16 select-none"
    >
      <SidePeek status={status} hitKey={lastHit?.n} />
      {isWon ? (
        <div className="w-full max-w-5xl flex flex-col items-center">
          <p className="font-minecraft text-xs uppercase tracking-[0.3em] text-[#35fe5d] mb-3">
            {skipped ? "Skills" : "Mission complete"}
          </p>
          <h3 className="font-instrument text-4xl sm:text-6xl text-primary mb-12 text-center">The full arsenal</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
            {skillsData.map((c) => (
              <div key={c.title} className="rounded-[24px] border border-white/10 bg-white/[0.03] p-6">
                <h4 className="font-podium tracking-widest text-sm mb-2" style={{ color: c.accent }}>
                  {c.title.toUpperCase()}
                </h4>
                <p className="font-kefir text-sm text-primary/60 mb-4">{c.desc}</p>
                <ul className="flex flex-wrap gap-2">
                  {c.skills.map((skill) => (
                    <li key={skill} className="text-xs px-3 py-1 rounded-full border text-primary/90" style={{ borderColor: `${c.accent}66` }}>
                      {skill}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-12">
            <RetroButton primary onClick={game.start}>
              {skipped ? "▶ Play the space game" : "▶ Play again"}
            </RetroButton>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          {/* Antenna */}
          <div className="relative h-14 w-40 -mb-1">
            <span className="absolute bottom-0 left-1/2 h-16 w-[3px] bg-[#6b655c] origin-bottom -rotate-[32deg] rounded-full" />
            <span className="absolute bottom-0 left-1/2 h-14 w-[3px] bg-[#6b655c] origin-bottom rotate-[28deg] rounded-full" />
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-4 w-12 rounded-t-full bg-[#2a2622]" />
          </div>

          {/* TV body */}
          <div className="rounded-[28px] sm:rounded-[36px] bg-gradient-to-b from-[#3a352f] via-[#2a2622] to-[#1a1714] p-3 sm:p-5 shadow-[0_30px_80px_rgba(0,0,0,0.7),inset_0_2px_0_rgba(255,255,255,0.08)] border border-black">
            <div className="rounded-[20px] sm:rounded-[26px] bg-[#0d0c0b] p-2 sm:p-3 shadow-[inset_0_4px_16px_rgba(0,0,0,0.9)]">
              {/* Screen */}
              <div
                ref={screenRef}
                className="crt-screen relative overflow-hidden aspect-[4/3] w-[min(88vw,820px,calc(68vh*4/3))]"
                style={{ touchAction: playing ? "none" : "auto" }}
                onPointerDown={() => fire(true)}
                onPointerUp={() => fire(false)}
                onPointerLeave={() => fire(false)}
                onPointerCancel={() => fire(false)}
              >
                {inView && (
                  <Canvas dpr={mobile ? [1, 1.5] : [1, 2]} camera={{ position: [0, 1.2, 10], fov: 60 }} className="!absolute inset-0">
                    <Suspense fallback={null}>
                      <Scene mobile={mobile} />
                    </Suspense>
                  </Canvas>
                )}

                {/* In-game HUD */}
                {status !== "idle" && (
                  <div className="pointer-events-none absolute inset-0 p-3 sm:p-5 flex flex-col justify-between font-minecraft">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-[11px] sm:text-sm uppercase tracking-widest" style={{ color: current.accent }}>
                        Sector {wave + 1}/{skillsData.length}
                        <span className="block text-primary/70 mt-1">{current.title}</span>
                      </p>
                      <div className="w-24 sm:w-40 text-right">
                        <p className="text-[11px] sm:text-sm text-primary/80 tracking-widest">
                          {destroyed.size}/{targets.length}
                        </p>
                        <div className="mt-1.5 h-1.5 w-full bg-white/10 overflow-hidden">
                          <div
                            className="h-full bg-[#35fe5d] transition-[width] duration-300"
                            style={{ width: `${(destroyed.size / targets.length) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    {/* Current sector's skills */}
                    <div className="flex flex-wrap gap-1 sm:gap-1.5 justify-center">
                      {current.skills.map((skill) => {
                        const got = destroyed.has(`${wave}:${skill}`);
                        return (
                          <span
                            key={skill}
                            className="text-[10px] sm:text-sm px-2 sm:px-2.5 py-0.5 sm:py-1 border transition-colors duration-300"
                            style={got
                              ? { background: current.accent, borderColor: current.accent, color: "#050505" }
                              : { borderColor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.35)" }}
                          >
                            {skill}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Hit popup */}
                <div className="pointer-events-none absolute inset-x-0 top-[28%] flex justify-center">
                  <div
                    ref={popupRef}
                    className="font-minecraft text-3xl sm:text-5xl opacity-0"
                    style={{ color: lastHit?.color, textShadow: `0 0 24px ${lastHit?.color}` }}
                  >
                    {lastHit?.skill}
                  </div>
                </div>

                {/* "Scroll again" hint */}
                {scrollHint && (
                  <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center px-4">
                    <p className="crt-blink font-minecraft text-[10px] sm:text-xs tracking-widest uppercase bg-black/70 text-[#FFD54F] px-3 py-2 border border-[#FFD54F]/50 text-center">
                      Scroll is locked in-game · scroll again to exit
                    </p>
                  </div>
                )}

                {/* Choice screen */}
                {status === "idle" && (
                  <div className="absolute inset-0 bg-black/55 flex flex-col items-center justify-center text-center px-6 gap-3 sm:gap-4">
                    <p className="font-minecraft text-[10px] sm:text-xs uppercase tracking-[0.3em] text-[#35fe5d] crt-blink">
                      ◉ Incoming transmission
                    </p>
                    <h3 className="font-minecraft text-xl sm:text-4xl text-primary leading-tight">
                      SPACE SKILLS
                    </h3>
                    <p className="font-minecraft text-[10px] sm:text-sm text-primary/70 max-w-sm leading-relaxed">
                      Every asteroid out there is one of my skills. Wanna fly out and shoot them, or just see the list?
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 mt-2 sm:mt-4">
                      <RetroButton primary onClick={game.start}>▶ Play the game</RetroButton>
                      <RetroButton onClick={skipToSkills}>Skip → Show skills</RetroButton>
                    </div>
                    {!mobile && (
                      <p className="font-minecraft text-[9px] tracking-widest uppercase text-primary/35 mt-1">
                        Press space to play
                      </p>
                    )}
                  </div>
                )}

                {/* Exit / pause prompt */}
                {status === "paused" && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center px-4">
                    <div className="border-2 border-[#35fe5d] bg-[#050505] px-5 sm:px-8 py-6 text-center max-w-sm shadow-[0_0_30px_rgba(53,254,93,0.25)]">
                      <p className="font-minecraft text-sm sm:text-lg text-[#35fe5d] mb-2">EXIT GAME?</p>
                      <p className="font-minecraft text-[10px] sm:text-xs text-primary/70 leading-relaxed mb-5">
                        Wanna leave the game and see all my skills directly?
                      </p>
                      <div className="flex flex-col gap-2">
                        <RetroButton primary onClick={game.resume}>▶ Continue playing</RetroButton>
                        <RetroButton onClick={skipToSkills}>Show me the skills</RetroButton>
                      </div>
                    </div>
                  </div>
                )}

                {/* CRT glass */}
                <div className="crt-scanlines pointer-events-none absolute inset-0" />
                <div className="crt-vignette pointer-events-none absolute inset-0" />
              </div>
            </div>

            {/* Control panel */}
            <div className="flex items-center justify-between mt-3 sm:mt-4 px-1 sm:px-2">
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${locked ? "bg-[#35fe5d] shadow-[0_0_8px_#35fe5d]" : "bg-[#5a1a1a]"}`} />
                <span className="font-minecraft text-[9px] sm:text-[11px] tracking-[0.25em] text-[#b8ad9c]">SKILL·TRON 3000</span>
              </div>
              <div className="hidden sm:flex gap-[3px]">
                {Array.from({ length: 9 }, (_, i) => (
                  <span key={i} className="h-5 w-[3px] rounded-full bg-black/60" />
                ))}
              </div>
              <div className="flex gap-2 sm:gap-3">
                {[20, -40].map((r) => (
                  <span
                    key={r}
                    className="relative h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-gradient-to-b from-[#4a443c] to-[#1d1a17] border border-black shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]"
                    style={{ transform: `rotate(${r}deg)` }}
                  >
                    <span className="absolute left-1/2 top-1 h-2 sm:h-2.5 w-[2px] -translate-x-1/2 bg-[#b8ad9c]" />
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Feet */}
          <div className="flex justify-between w-[70%]">
            <span className="h-3 w-10 rounded-b-lg bg-[#1a1714]" />
            <span className="h-3 w-10 rounded-b-lg bg-[#1a1714]" />
          </div>

          <p className="font-minecraft text-[9px] sm:text-[11px] text-primary/40 tracking-widest uppercase mt-6 text-center min-h-[1em]">
            {locked && (mobile ? "Drag to steer · hold to fire" : "Mouse / WASD steer · click / space fire · esc pause")}
          </p>
        </div>
      )}
    </section>
  );
};
