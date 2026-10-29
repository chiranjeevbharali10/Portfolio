import { useEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import type { Status } from "./store";
import { PixelMe } from "./PixelMe";

const LABEL = "FUN FACT";
const TEXT = "A space shooter like this was one of my first games, played on my brother's phone as a kid!";
const STAY = 15; // seconds visible
const AWAY = 20; // seconds hidden before popping up again
const HIDDEN = 110; // yPercent fully below the clip line
const PEEK = 62; // yPercent showing just the cap and glasses

type Props = { status: Status; hitKey?: number };

// Pixel avatar that pops up from the bottom-left of the section with a fun fact, on a loop
export const SidePeek = ({ status, hitKey }: Props) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const slideRef = useRef<HTMLDivElement>(null);
  const swayRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const loop = useRef<gsap.core.Timeline | null>(null);
  const started = useRef(false);
  const statusRef = useRef(status);
  statusRef.current = status;

  useGSAP(() => {
    const text = textRef.current;
    if (!text) return;
    gsap.set(slideRef.current, { yPercent: HIDDEN });
    gsap.set(bubbleRef.current, { scale: 0, opacity: 0, transformOrigin: "15% 100%" });
    gsap.set(swayRef.current, { transformOrigin: "50% 100%" });

    // Gentle sway so it never sits frozen
    gsap.to(swayRef.current, { rotation: 3, duration: 2.4, ease: "sine.inOut", yoyo: true, repeat: -1 });

    const typed = { n: 0 };
    const typeIn = () => {
      text.textContent = TEXT.slice(0, Math.round(typed.n));
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      typed.n = TEXT.length;
      typeIn();
      loop.current = gsap
        .timeline({ paused: true, repeat: -1 })
        .set([slideRef.current, bubbleRef.current], { yPercent: 0, scale: 1, opacity: 1 })
        .to({}, { duration: STAY })
        .set(bubbleRef.current, { scale: 0, opacity: 0 })
        .set(slideRef.current, { yPercent: HIDDEN })
        .to({}, { duration: AWAY });
      return;
    }

    loop.current = gsap
      .timeline({ paused: true, repeat: -1 })
      .addLabel("in")
      // Peeks up first, hops, then pops all the way out
      .fromTo(slideRef.current, { yPercent: HIDDEN }, { yPercent: PEEK, duration: 0.45, ease: "power2.out" })
      .to(slideRef.current, { yPercent: PEEK - 8, duration: 0.12, ease: "power1.out", yoyo: true, repeat: 1 }, "+=0.35")
      .to(slideRef.current, { yPercent: 0, duration: 0.8, ease: "back.out(2.2)" }, "+=0.15")
      .fromTo(bubbleRef.current, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.35, ease: "back.out(2)" }, "-=0.3")
      .fromTo(
        typed,
        { n: 0 },
        { n: TEXT.length, duration: TEXT.length * 0.035, ease: `steps(${TEXT.length})`, onUpdate: typeIn, onStart: typeIn }
      )
      // Stay for STAY seconds (counted from the moment it's fully out), then duck away
      .to(bubbleRef.current, { scale: 0, opacity: 0, duration: 0.25, ease: "back.in(2)" }, `in+=${1.9 + STAY}`)
      .to(slideRef.current, { yPercent: HIDDEN, duration: 0.5, ease: "back.in(1.6)" }, ">-0.05")
      .to({}, { duration: AWAY });
  }, { scope: rootRef });

  // Start the loop the first time the section scrolls into view
  useEffect(() => {
    const section = rootRef.current?.parentElement;
    if (!section) return;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      started.current = true;
      if (statusRef.current === "idle" || statusRef.current === "paused") loop.current?.restart();
    }, { threshold: 0.4 });
    io.observe(section);
    return () => io.disconnect();
  }, []);

  // While playing: loop pauses and it just peeks from the bottom; hidden on the skills grid
  useEffect(() => {
    if (!started.current) return;
    if (status === "playing") {
      loop.current?.pause();
      gsap.to(bubbleRef.current, { scale: 0, opacity: 0, duration: 0.2 });
      gsap.to(slideRef.current, { yPercent: PEEK, duration: 0.5, ease: "power3.out" });
    } else if (status === "won") {
      loop.current?.pause();
      gsap.to(bubbleRef.current, { scale: 0, opacity: 0, duration: 0.2 });
      gsap.to(slideRef.current, { yPercent: HIDDEN, duration: 0.4, ease: "power3.in" });
    } else {
      loop.current?.restart();
    }
  }, [status]);

  // Little cheer on every hit
  useEffect(() => {
    if (!hitKey || statusRef.current !== "playing") return;
    gsap.fromTo(swayRef.current, { y: 0 }, { y: -14, duration: 0.14, ease: "power2.out", yoyo: true, repeat: 1 });
  }, [hitKey]);

  return (
    <div
      ref={rootRef}
      className="hidden xl:flex flex-col items-start absolute bottom-0 left-8 2xl:left-14 z-20 pointer-events-none select-none"
      aria-hidden="true"
    >
      {/* Retro speech bubble */}
      <div ref={bubbleRef} className="relative ml-6 mb-5 w-[270px] 2xl:w-[330px]">
        <div className="bg-[#050505] border-2 border-[#35fe5d] px-4 py-3.5 2xl:px-5 2xl:py-4 shadow-[0_0_24px_rgba(53,254,93,0.22)]">
          <p className="font-minecraft text-xs 2xl:text-sm tracking-[0.25em] text-[#FFD54F] mb-2">{LABEL}</p>
          <p className="font-minecraft text-sm 2xl:text-base leading-relaxed text-primary min-h-[4.8em]">
            <span ref={textRef} />
            <span className="crt-blink inline-block w-[0.6em] h-[1em] align-[-0.15em] ml-0.5 bg-[#35fe5d]" />
          </p>
        </div>
        {/* Stepped pixel tail pointing down at the avatar */}
        <span className="absolute -bottom-[8px] left-8 h-[8px] w-[16px] bg-[#35fe5d]" />
        <span className="absolute -bottom-[14px] left-6 h-[6px] w-[10px] bg-[#35fe5d]" />
      </div>

      {/* Clip line: the avatar hides below the bottom edge of the section */}
      <div className="overflow-hidden">
        <div ref={slideRef}>
          <div ref={swayRef}>
            <PixelMe className="block w-[150px] h-[120px] 2xl:w-[180px] 2xl:h-[144px] drop-shadow-[0_0_20px_rgba(53,254,93,0.22)]" />
          </div>
        </div>
      </div>
    </div>
  );
};
