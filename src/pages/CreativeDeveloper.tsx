import { useRef, useState, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SocialHoverMenu from "../components/SocialHoverMenu";
import { isAppLoaded } from "../utils/loadingState";
import { SkillsSection } from "../components/SkillsSection";

gsap.registerPlugin(ScrollTrigger);

const SmileIcon = () => {
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
  const scrollSpacerRef = useRef<HTMLDivElement>(null);
  const lockupRef = useRef<HTMLDivElement>(null);
  const circleRef = useRef<HTMLDivElement>(null);
  const circleInnerRef = useRef<HTMLDivElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);
  const navContainerRef = useRef<HTMLDivElement>(null);
  const letterRefs = useRef<(HTMLDivElement | null)[]>([]);
  const contentWrapperRef = useRef<HTMLElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLHeadingElement>(null);
  const headingLinesRef = useRef<(HTMLDivElement | null)[]>([]);

  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    document.fonts.ready.then(() => {
      setFontsLoaded(true);
    });
  }, []);

  const creativeLetters = "CREATIVE".split("");
  const developerLetters = "DEVELOPER".split("");

  useGSAP(() => {
    if (!fontsLoaded || !lockupRef.current || !circleRef.current || !spacerRef.current || !scrollSpacerRef.current) return;

    const playAnimation = () => {
      // Lock scrolling during intro
      document.body.style.overflow = "hidden";

      const lockup = lockupRef.current!;
      const circle = circleRef.current!;
      const circleInner = circleInnerRef.current!;
      const spacer = spacerRef.current!;

      const tl = gsap.timeline({
        onComplete: () => {
          // Unlock scrolling after intro
          document.body.style.overflow = "";

          // Initialize ScrollTrigger only AFTER intro finishes so it records correct start values
          const scrollTl = gsap.timeline({
            scrollTrigger: {
              trigger: scrollSpacerRef.current,
              start: "top top",
              end: "bottom top", // Animate while scrolling past the spacer
              scrub: 1.2,
            }
          });

          // Calculate exact Y translation to align the lockup's center with the buttons' center (56px from top)
          const targetY = -(window.innerHeight / 2 - 56);

          scrollTl.to(lockup, {
            scale: 0.6, // INCREASED SCALE FOR NAVBAR LOGO
            y: targetY,
            ease: "power1.inOut"
          }, 0);

          if (navContainerRef.current) {
            scrollTl.to(navContainerRef.current, {
              y: "-31vh",
              ease: "power1.inOut"
            }, 0);
          }

          ScrollTrigger.refresh();
        }
      });

      gsap.set(lockup, { scale: 2.0 });
      gsap.set(letterRefs.current, { y: "100%" });
      gsap.set(".hero-element", { opacity: 0, y: 30 });
      gsap.set(".dot-icon", { scale: 0, opacity: 0 });

      const offscreenLeft = -150;
      const centerDock = spacer.offsetLeft + (spacer.offsetWidth / 2) - (circle.offsetWidth / 2);
      const almostRight = centerDock + (lockup.offsetWidth - centerDock) * 0.45;

      gsap.set(circle, { x: offscreenLeft });

      const diameter = circle.offsetWidth || (window.innerWidth * 0.075);
      const circumference = Math.PI * diameter || 1;

      const distance1 = Math.abs(centerDock - offscreenLeft);
      const rotation1 = (distance1 / circumference) * 360;

      const distance2 = Math.abs(almostRight - centerDock);
      const rotation2 = rotation1 + ((distance2 / circumference) * 360);

      const distance3 = Math.abs(almostRight - centerDock);
      const rawRotation3 = (distance3 / circumference) * 360;

      const finalRawRotation = rotation2 - rawRotation3;
      const finalUprightRotation = Math.round(finalRawRotation / 360) * 360;

      // Intro Animation Timeline
      tl.to(circle, {
        x: centerDock,
        duration: 1.2,
        ease: "none",
      }, 0.5)
        .to(circleInner, {
          rotation: rotation1,
          duration: 1.2,
          ease: "none"
        }, 0.5)
        .to(letterRefs.current.slice(0, creativeLetters.length).filter(Boolean), {
          y: 0,
          duration: 0.9,
          ease: "back.out(1.2)",
          stagger: { each: 0.125, from: "start" }
        }, 0.85)
        .to(circle, {
          x: almostRight,
          duration: 1.0,
          ease: "power2.out",
        }, 1.7)
        .to(circleInner, {
          rotation: rotation2,
          duration: 1.0,
          ease: "power2.out"
        }, 1.7)
        .to(letterRefs.current.slice(creativeLetters.length).filter(Boolean), {
          y: 0,
          duration: 0.9,
          ease: "back.out(1.2)",
          stagger: { each: 0.125, from: "end" }
        }, 2.3)
        .to(circle, {
          x: centerDock,
          duration: 0.5,
          ease: "none"
        }, 2.7)
        .to(circleInner, {
          rotation: finalUprightRotation,
          duration: 0.5,
          ease: "none"
        }, 2.7)
        .to(lockup, {
          y: "-30vh",
          scale: 2.25,
          duration: 1,
          ease: "power3.inOut"
        }, 4.4)
        .to(spacer, {
          width: "0.25em",
          duration: 1,
          ease: "power3.inOut"
        }, 4.4)
        .to(circleInner, {
          scale: 0,
          opacity: 0,
          duration: 0.8,
          ease: "power3.inOut"
        }, 4.4)
        .to(".dot-icon", {
          opacity: 1,
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

      // The scroll timeline is now initialized inside the onComplete callback above.

      // --- ADVANCED ANIMATIONS FOR NEW SECTION ---
      
      // 1. Parallax for left column
      if (leftColRef.current && contentWrapperRef.current) {
        gsap.fromTo(leftColRef.current, 
          { y: 150 }, 
          { 
            y: -100, 
            ease: "none",
            scrollTrigger: {
              trigger: contentWrapperRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: true
            }
          }
        );
      }

      // 2. Counter animation
      if (counterRef.current && contentWrapperRef.current) {
        const counterObj = { value: 0 };
        gsap.to(counterObj, {
          value: 100,
          duration: 2.5,
          ease: "power4.out",
          onUpdate: () => {
            if (counterRef.current) {
              counterRef.current.innerHTML = Math.round(counterObj.value) + "%";
            }
          },
          scrollTrigger: {
            trigger: contentWrapperRef.current,
            start: "top center+=100", // Start when section is halfway up the screen
            toggleActions: "play none none reverse"
          }
        });
      }

      // 3. Staggered Heading Reveal (Masked)
      if (headingLinesRef.current.length > 0 && contentWrapperRef.current) {
        gsap.fromTo(headingLinesRef.current, 
          { y: "120%", rotationZ: 4 }, // Slight rotation for a dynamic feel
          { 
            y: "0%", 
            rotationZ: 0,
            duration: 1.2,
            ease: "power4.out",
            stagger: 0.15,
            scrollTrigger: {
              trigger: contentWrapperRef.current,
              start: "top center+=100",
              toggleActions: "play none none reverse"
            }
          }
        );
      }

      // 4. Paragraph & Button Fade Up
      if (contentWrapperRef.current) {
        gsap.fromTo(".reveal-fade", 
          { y: 40, opacity: 0 }, 
          { 
            y: 0, 
            opacity: 1,
            duration: 1.2,
            ease: "power3.out",
            stagger: 0.2,
            scrollTrigger: {
              trigger: contentWrapperRef.current,
              start: "top center",
              toggleActions: "play none none reverse"
            }
          }
        );
      }
    };

    if (isAppLoaded()) {
      playAnimation();
    } else {
      window.addEventListener('appLoaded', playAnimation, { once: true });
    }

    // Cleanup overflow on unmount
    return () => {
      document.body.style.overflow = "";
    };

  }, { scope: containerRef, dependencies: [fontsLoaded] });

  return (
    <div ref={containerRef} className="relative w-full bg-[#ffcce0] text-[#1a1a1a] selection:bg-[#1a1a1a] selection:text-[#ffcce0]">
      
      {/* Spacer to give the scroll animation room to breathe before the next section */}
      <div ref={scrollSpacerRef} className="h-[120vh] w-full"></div>
      
      {/* Fixed Sticky Header Section (always visible) */}
      <div className="fixed inset-0 w-full h-screen z-40 pointer-events-none flex flex-col items-center justify-center">
        
        {/* Kinetic Typography Lockup */}
        <div
          ref={lockupRef}
          className="relative flex items-end justify-center font-french font-bold uppercase text-[8vw] leading-[0.8] tracking-tighter whitespace-nowrap origin-center pointer-events-auto"
          style={{ zIndex: 50 }} // keep above the scrolling content
        >
          <div className="flex">
            {creativeLetters.map((l, i) => (
              <div key={`c-${i}`} className="inline-block" style={{ clipPath: "inset(-100% -20% 0% -20%)" }}>
                <div ref={el => { letterRefs.current[i] = el; }} className="inline-block drop-shadow-sm px-[0.1vw]">{l}</div>
              </div>
            ))}
          </div>

          <div ref={spacerRef} className="w-[0.9em] shrink-0"></div>

          <div className="flex">
            {developerLetters.map((l, i) => (
              <div key={`d-${i}`} className="inline-block" style={{ clipPath: "inset(-100% -20% 0% -20%)" }}>
                <div ref={el => { letterRefs.current[creativeLetters.length + i] = el; }} className="inline-block drop-shadow-sm px-[0.1vw]">{l}</div>
              </div>
            ))}
          </div>

          <div
            ref={circleRef}
            className="absolute bottom-0 left-0 z-30 flex items-center justify-center pointer-events-none"
            style={{ width: '0.8em', height: '0.8em' }}
          >
            <div ref={circleInnerRef} className="absolute inset-0 origin-center w-full h-full flex items-center justify-center text-[#1a1a1a]">
              <SmileIcon />
            </div>
            <div
              className="dot-icon absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#1a1a1a] rounded-full opacity-0 scale-0"
              style={{ width: '0.1em', height: '0.1em', marginTop: '-0.01em', marginLeft: '-0.29em' }}
            ></div>
          </div>
        </div>

        {/* Hero Bottom Bar / Future Navbar */}
        <div 
          ref={navContainerRef}
          className="hero-element absolute top-[31%] w-full flex justify-between items-start px-12 mt-8 pointer-events-auto"
          style={{ zIndex: 50 }} // keep above the scrolling content
        >
          <div className="flex justify-start">
            <button className="h-12 px-6 bg-white rounded-full font-medium font-inter text-[15px] shadow-sm text-black hover:scale-105 transition-transform">
              Let's work
            </button>
          </div>
          <div className="flex justify-end">
            <SocialHoverMenu />
          </div>
        </div>
      </div>

      {/* New Scrollable Content Section */}
      <section ref={contentWrapperRef} className="min-h-screen w-full flex flex-col md:flex-row px-8 md:px-16 lg:px-24 pt-32 pb-48">
        
        {/* Left Side: Stats/Fact File (matching the visual offset) */}
        <div ref={leftColRef} className="w-full md:w-1/3 flex flex-col pt-12 pr-12">
          <div className="flex justify-between items-end border-b border-black/20 pb-2 mb-8">
            <span className="font-inter text-sm font-semibold tracking-wide">Developer Facts</span>
            <span className="font-mono text-xs opacity-70">01 / 01</span>
          </div>
          
          <h3 ref={counterRef} className="font-podium text-6xl md:text-8xl tracking-tighter mb-4">0%</h3>
          <p className="font-inter text-sm font-medium leading-relaxed opacity-80 max-w-[200px]">
            dedicated to pixel-perfect execution, immersive animations, and flawless web performance.
          </p>
        </div>

        {/* Right Side: Huge Typography Heading & Supporting Text */}
        <div className="w-full md:w-2/3 flex flex-col">
          <h2 className="font-inter text-[10vw] md:text-[6vw] font-medium leading-[0.95] tracking-tight text-[#1a1a1a] mb-12">
            <div className="overflow-hidden pb-4">
              <div ref={el => { headingLinesRef.current[0] = el; }} className="origin-bottom-left">A developer who thinks</div>
            </div>
            <div className="overflow-hidden pb-4">
              <div ref={el => { headingLinesRef.current[1] = el; }} className="origin-bottom-left">like a designer.</div>
            </div>
          </h2>
          
          <p className="reveal-fade font-inter text-xl md:text-3xl lg:text-4xl leading-tight font-medium opacity-80 max-w-4xl mb-16">
            I craft digital experiences by blending engineering, creativity, and thoughtful design — turning ideas into products that feel intuitive, human, and memorable.
          </p>

          <div className="reveal-fade">
            <button className="h-14 px-8 bg-white rounded-full font-medium font-inter text-[16px] shadow-sm text-black hover:scale-105 transition-transform inline-flex items-center gap-3">
              About me <span className="text-xl leading-none">&rarr;</span>
            </button>
          </div>
        </div>

      </section>

      {/* Stacked Cards Skills Section */}
      <SkillsSection />

    </div>
  );
};
