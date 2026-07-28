import { useRef, useState, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import SocialHoverMenu from "../components/SocialHoverMenu";
import { isAppLoaded } from "../utils/loadingState";

const SmileIcon = () => {
  // MANUAL SMILEY ADJUSTMENT:
  // - Change strokeWidth to make the lines thinner (e.g., 4 or 6) or thicker (e.g., 10)
  // - You can also change the r="6" on the eyes below if you want smaller/larger eyes
  const strokeWidth = 3;

  return (
    <svg width="100%" height="100%" viewBox="0 0 100 100" className="text-[#1a1a1a] fill-current drop-shadow-sm">
      <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth={strokeWidth} />
      <circle cx="35" cy="40" r="6" fill="currentColor" />
      <circle cx="65" cy="40" r="6" fill="currentColor" />
      <path d="M 32 62 Q 50 80 68 62" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  );
};

export const CreativeDeveloper = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const lockupRef = useRef<HTMLDivElement>(null);
  const circleRef = useRef<HTMLDivElement>(null);
  const circleInnerRef = useRef<HTMLDivElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);
  const letterRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    document.fonts.ready.then(() => {
      setFontsLoaded(true);
    });
  }, []);

  const creativeLetters = "CREATIVE".split("");
  const developerLetters = "DEVELOPER".split("");

  useGSAP(() => {
    if (!fontsLoaded || !lockupRef.current || !circleRef.current || !spacerRef.current) return;

    const playAnimation = () => {
      const tl = gsap.timeline();

    // Set initial scale down for the rolling animation to avoid pixelation on scale up
    gsap.set(lockupRef.current, { scale: 2.0 });

    // Letters start just below the wrapper's bottom edge (100% hidden by clip-path)
    gsap.set(letterRefs.current, { y: "100%" });
    gsap.set(".hero-element", { opacity: 0, y: 30 });
    gsap.set(".dot-icon", { scale: 0, opacity: 0 });

    // Calculate positions relative to the lockup container
    const offscreenLeft = -150; // Start just outside the first letter
    const centerDock = spacerRef.current!.offsetLeft + (spacerRef.current!.offsetWidth / 2) - (circleRef.current!.offsetWidth / 2);
    // Roll past the middle, but stop 45% into DEVELOPER so it doesn't collide with the rising letters!
    const almostRight = centerDock + (lockupRef.current!.offsetWidth - centerDock) * 0.45;

    // Ball starts completely outside the screen to the left
    gsap.set(circleRef.current, { x: offscreenLeft });

    // Calculate rotation based on distance for true wheel physics
    const diameter = circleRef.current!.offsetWidth || (window.innerWidth * 0.075);
    const circumference = Math.PI * diameter || 1;

    // Distance 1: offscreenLeft -> centerDock
    const distance1 = Math.abs(centerDock - offscreenLeft);
    const rotation1 = (distance1 / circumference) * 360;

    // Distance 2: centerDock -> almostRight
    const distance2 = Math.abs(almostRight - centerDock);
    const rotation2 = rotation1 + ((distance2 / circumference) * 360);

    // Distance 3: almostRight -> centerDock (Rolling back!)
    const distance3 = Math.abs(almostRight - centerDock);
    const rawRotation3 = (distance3 / circumference) * 360;

    // To ensure the smiley stays "straight front up", we round the final rotation 
    const finalRawRotation = rotation2 - rawRotation3;
    const finalUprightRotation = Math.round(finalRawRotation / 360) * 360;

    // Main Animation Sequence
    // Using exact absolute timing instead of relative labels prevents the timeline 
    // from accidentally waiting for letter stagger animations to finish before moving the ball.

    // Scene 1a: Fast sweep to the middle (0.5s -> 1.7s)
    tl.to(circleRef.current, {
      x: centerDock,
      duration: 1.2,
      ease: "none", // Linear speed so it stays perfectly synced with the uniform stagger
    }, 0.5)
      .to(circleInnerRef.current, {
        rotation: rotation1,
        duration: 1.2,
        ease: "none"
      }, 0.5)
      // CREATIVE triggers left-to-right, delayed to 0.85s so the ball is ALWAYS ahead!
      .to(letterRefs.current.slice(0, creativeLetters.length).filter(Boolean), {
        y: 0,
        duration: 0.9,
        ease: "back.out(1.2)",
        stagger: {
          each: 0.125, // Uniform stagger
          from: "start"
        }
      }, 0.85)

      // Scene 1b: Passes middle, slows down towards the right edge (1.7s -> 2.7s)
      .to(circleRef.current, {
        x: almostRight,
        duration: 1.0,
        ease: "power2.out",
      }, 1.7)
      .to(circleInnerRef.current, {
        rotation: rotation2,
        duration: 1.0,
        ease: "power2.out"
      }, 1.7)
      // DEVELOPER triggers right-to-left, starting at 2.3s so the wave trails the ball perfectly on its way back!
      .to(letterRefs.current.slice(creativeLetters.length).filter(Boolean), {
        y: 0,
        duration: 0.9,
        ease: "back.out(1.2)",
        stagger: {
          each: 0.125,
          from: "end"
        }
      }, 2.3)

      // Scene 2: Rolls back to the center dock and snaps upright (2.7s -> 3.2s)
      .to(circleRef.current, {
        x: centerDock,
        duration: 0.5,
        ease: "none" // Linear so it stays perfectly ahead of the uniform letter wave
      }, 2.7)
      .to(circleInnerRef.current, {
        rotation: finalUprightRotation,
        duration: 0.5,
        ease: "none"
      }, 2.7)

      // Scene 3: Logo Lock & Hero Transition (4.4s -> 5.4s)
      .to(lockupRef.current, {
        y: "-30vh",
        scale: 2.25,
        duration: 1,
        ease: "power3.inOut"
      }, 4.4)
      .to(spacerRef.current, {
        width: "0.25em", // Shrink the gap so the words fit closer together!
        duration: 1,
        ease: "power3.inOut"
      }, 4.4)
      .to(circleInnerRef.current, {
        scale: 0, // Shrink the smiley away
        opacity: 0,
        duration: 0.8,
        ease: "power3.inOut"
      }, 4.4)
      .to(".dot-icon", {
        opacity: 1, // Bring the dot in!
        scale: 1,
        duration: 0.8,
        ease: "power3.inOut"
      }, 4.4)
      .to(".hero-element", {
        opacity: 1,
        y: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power2.out"
      }, 4.9);
    };

    if (isAppLoaded()) {
      playAnimation();
    } else {
      window.addEventListener('appLoaded', playAnimation, { once: true });
    }

  }, { scope: containerRef, dependencies: [fontsLoaded] });

  return (
    <div ref={containerRef} className="relative min-h-screen w-full bg-[#ffcce0] text-[#1a1a1a] overflow-hidden selection:bg-[#1a1a1a] selection:text-[#ffcce0]">

      {/* Main Container */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">

        {/* Kinetic Typography Lockup */}
        <div
          ref={lockupRef}
          className="relative flex items-end justify-center font-french font-bold uppercase text-[8vw] leading-[0.8] tracking-tighter whitespace-nowrap origin-center"
        >

          <div className="flex">
            {creativeLetters.map((l, i) => (
              <div
                key={`c-${i}`}
                className="inline-block"
                style={{ clipPath: "inset(-100% -20% 0% -20%)" }}
              >
                <div
                  ref={el => { letterRefs.current[i] = el; }}
                  className="inline-block drop-shadow-sm px-[0.1vw]"
                >
                  {l}
                </div>
              </div>
            ))}
          </div>

          {/* Spacer to hold the final resting place for the absolutely positioned ball */}
          <div ref={spacerRef} className="w-[0.9em] shrink-0"></div>

          <div className="flex">
            {developerLetters.map((l, i) => (
              <div
                key={`d-${i}`}
                className="inline-block"
                style={{ clipPath: "inset(-100% -20% 0% -20%)" }}
              >
                <div
                  ref={el => { letterRefs.current[creativeLetters.length + i] = el; }}
                  className="inline-block drop-shadow-sm px-[0.1vw]"
                >
                  {l}
                </div>
              </div>
            ))}
          </div>

          {/* The absolutely positioned ball that rolls over the text */}
          <div
            ref={circleRef}
            className="absolute bottom-0 left-0 z-30 flex items-center justify-center pointer-events-none"
            style={{ width: '0.8em', height: '0.8em' }}
          >
            <div ref={circleInnerRef} className="absolute inset-0 origin-center w-full h-full flex items-center justify-center text-[#1a1a1a]">
              <SmileIcon />
            </div>
            {/* 
              MANUAL DOT ADJUSTMENT:
              - Change width and height to make the dot bigger/smaller.
              - Change marginTop (e.g., '-0.05em', '0.1em') to move it up or down.
              - Change marginLeft (e.g., '-0.05em', '0.1em') to move it left or right.
            */}
            <div
              className="dot-icon absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#1a1a1a] rounded-full opacity-0 scale-0"
              style={{ width: '0.1em', height: '0.1em', marginTop: '-0.01em', marginLeft: '-0.29em' }}
            ></div>
          </div>

        </div>

        {/* Hero Bottom Bar (Fades in with hero-element) */}
        <div className="hero-element absolute top-[31%] w-full flex justify-between items-start px-12 mt-8 pointer-events-auto">

          {/* Left: Let's Work Button */}
          <div className="w-[356px] flex justify-start">
            <button className="h-12 px-6 bg-white rounded-full font-medium font-inter text-[15px] shadow-sm text-black hover:scale-105 transition-transform">
              Let's work
            </button>
          </div>

          {/* Right: Floating Menu */}
          <div className="w-[356px] flex justify-end">
            <SocialHoverMenu />
          </div>

        </div>

      </div>
    </div>
  );
};
