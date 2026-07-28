import { useRef } from "react";
import { Link } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import SocialHoverMenu from "../components/SocialHoverMenu";

const SmileIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 100 100" className="text-[#1a1a1a] fill-current drop-shadow-sm">
    <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8" />
    <circle cx="35" cy="40" r="6" fill="currentColor" />
    <circle cx="65" cy="40" r="6" fill="currentColor" />
    <path d="M 32 62 Q 50 80 68 62" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
  </svg>
);

export const CreativeDeveloper = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const lockupRef = useRef<HTMLDivElement>(null);
  const circleRef = useRef<HTMLDivElement>(null);
  const circleInnerRef = useRef<HTMLDivElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);
  const letterRefs = useRef<(HTMLDivElement | null)[]>([]);

  const creativeLetters = "CREATIVE".split("");
  const developerLetters = "DEVELOPER".split("");

  useGSAP(() => {
    if (!lockupRef.current || !circleRef.current || !spacerRef.current) return;

    const tl = gsap.timeline();

    // Set initial scale down for the rolling animation to avoid pixelation on scale up
    gsap.set(lockupRef.current, { scale: 2.0 });

    // Letters start just below the wrapper's bottom edge (100% hidden by clip-path)
    gsap.set(letterRefs.current, { y: "100%" });
    gsap.set(".hero-element", { opacity: 0, y: 30 });
    gsap.set(".dot-icon", { scale: 0, opacity: 0 });

    // Calculate positions relative to the lockup container
    const offscreenLeft = -150; // Start just outside the first letter so you can see it immediately
    const offscreenRight = lockupRef.current.offsetWidth + 150; // Past the end of DEVELOPER
    const centerDock = spacerRef.current.offsetLeft + (spacerRef.current.offsetWidth / 2) - (circleRef.current.offsetWidth / 2);

    // Ball starts completely outside the screen to the left
    gsap.set(circleRef.current, { x: offscreenLeft });

    // State for tracking which letters have been triggered
    const triggeredLetters = new Set<number>();

    // The magical onUpdate function that triggers letters as the ball passes them
    const checkBallPosition = () => {
      const ballX = gsap.getProperty(circleRef.current, "x") as number;

      // The trailing edge (left side) of the ball
      const ballLeftEdge = ballX;

      letterRefs.current.forEach((letter, index) => {
        if (!letter || triggeredLetters.has(index)) return;

        const wrapper = letter.parentElement;
        if (!wrapper) return;
        // The right edge of the letter's space
        const letterRightEdge = wrapper.offsetLeft + wrapper.offsetWidth;

        // Add a visual buffer gap (e.g. 15 pixels) to guarantee the ball has clearly passed
        const passBuffer = 15;

        // Trigger ONLY after the ball's trailing edge has passed the letter's right edge plus buffer
        if (ballLeftEdge >= letterRightEdge + passBuffer) {
          triggeredLetters.add(index);

          // Pop the letter up!
          gsap.to(letter, {
            y: 0,
            duration: 0.9,
            ease: "back.out(1.2)", // Subtle, premium bounce
            overwrite: "auto"
          });
        }
      });
    };

    // Calculate rotation based on distance for true wheel physics
    // circumference = pi * diameter. Let's approximate based on offsetWidth with a fallback
    const diameter = circleRef.current.offsetWidth || (window.innerWidth * 0.075);
    const circumference = Math.PI * diameter || 1;

    // Distance 1: offscreenLeft -> offscreenRight
    const distance1 = Math.abs(offscreenRight - offscreenLeft);
    const rotation1 = (distance1 / circumference) * 360;

    // Distance 2: offscreenRight -> centerDock
    const distance2 = Math.abs(centerDock - offscreenRight);
    const rotation2 = (distance2 / circumference) * 360;

    // Main Animation Sequence
    tl.to({}, { duration: 0.5 }) // Initial delay

      // Scene 1: Ball rolls across the ENTIRE text (left to right)
      .addLabel("roll-right")
      .to(circleRef.current, {
        x: offscreenRight,
        duration: 3.5, // Faster sweep across the screen
        ease: "power1.inOut",
        onUpdate: checkBallPosition
      }, "roll-right")
      .to(circleInnerRef.current, {
        rotation: rotation1,
        duration: 3.5, // Match sweep duration so physics look right
        ease: "power1.inOut" // Match exactly with x easing so it doesn't slip or slide!
      }, "roll-right")

      // The ball is now invisible, so we don't need the 'roll-back' docking animation anymore!

      // Scene 2: Logo Lock & Hero Transition
      .addLabel("hero", "+=0.2")
      .to(lockupRef.current, {
        y: "-30vh", // Move to top
        scale: 2.25, // Scale to native 1 (fixes pixelation)
        duration: 1,
        ease: "power3.inOut"
      }, "hero")
      .to(".hero-element", {
        opacity: 1,
        y: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power2.out"
      }, "hero+=0.5");

  }, { scope: containerRef });

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
                  ref={el => letterRefs.current[i] = el}
                  className="inline-block drop-shadow-sm px-[0.1vw]"
                >
                  {l}
                </div>
              </div>
            ))}
          </div>

          {/* Spacer to hold the final resting place for the absolutely positioned ball */}
          <div ref={spacerRef} className="w-[0.3em] shrink-0"></div>

          <div className="flex">
            {developerLetters.map((l, i) => (
              <div
                key={`d-${i}`}
                className="inline-block"
                style={{ clipPath: "inset(-100% -20% 0% -20%)" }}
              >
                <div
                  ref={el => letterRefs.current[creativeLetters.length + i] = el}
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
            className="absolute bottom-0 left-0 z-30 flex items-end justify-center pointer-events-none"
            style={{ width: '0.8em', height: '0.8em' }}
          >
            <div ref={circleInnerRef} className="relative origin-center w-full h-full flex items-center justify-center text-[#1a1a1a]">
              <SmileIcon />
            </div>
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
