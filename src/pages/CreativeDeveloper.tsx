import { useRef, useState, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { isAppLoaded } from "../utils/loadingState";
import { SkillsSection } from "../components/SkillsSection";
import { FlowJourney } from "../components/FlowJourney";

gsap.registerPlugin(ScrollTrigger);

export const CreativeDeveloper = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentWrapperRef = useRef<HTMLElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLHeadingElement>(null);
  const headingLinesRef = useRef<(HTMLDivElement | null)[]>([]);
  const flowContainerRef = useRef<HTMLDivElement>(null);

  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    document.fonts.ready.then(() => {
      setFontsLoaded(true);
    });
  }, []);

  useGSAP(() => {
    if (!fontsLoaded) return;

    const playAnimation = () => {
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


  }, { scope: containerRef, dependencies: [fontsLoaded] });

  return (
    <div ref={containerRef} className="relative w-full bg-[#ffcce0] text-[#1a1a1a] selection:bg-[#1a1a1a] selection:text-[#ffcce0]">
      
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

      {/* Grow with the flow section */}
      <div ref={flowContainerRef} className="w-full relative">
        <FlowJourney />
      </div>

    </div>
  );
};
