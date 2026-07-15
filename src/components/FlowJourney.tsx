import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const FlowJourney = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const circleRef = useRef<HTMLDivElement>(null);
  const gradientRef = useRef<HTMLDivElement>(null);
  const titleWrapperRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  useGSAP(() => {
    // 1. Circle Expansion (Solid Green)
    gsap.to(circleRef.current, {
      scale: 60,
      ease: "power2.inOut",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "+=100%", // Expands over the first 100vh
        scrub: 1,
      }
    });

    // 2. Crossfade to Gradient Background
    gsap.to(gradientRef.current, {
      opacity: 1,
      ease: "power2.inOut",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top -50%", // Starts fading in after circle is halfway done
        end: "top -150%",  // Completes as the timeline section fully enters
        scrub: 1,
      }
    });

    // 3. Title Fade In
    gsap.fromTo(titleWrapperRef.current, {
      opacity: 0,
      y: 50,
    }, {
      opacity: 1,
      y: 0,
      ease: "power3.out",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "+=80%",
        scrub: 1,
      }
    });

    // 4. SVG Road Drawing
    if (pathRef.current) {
      const length = pathRef.current.getTotalLength();
      gsap.set(pathRef.current, { strokeDasharray: length, strokeDashoffset: length });
      
      gsap.to(pathRef.current, {
        strokeDashoffset: 0,
        ease: "none",
        scrollTrigger: {
          trigger: ".timeline-section",
          start: "top center",
          end: "bottom center",
          scrub: 1,
        }
      });
    }

    // 5. Clean Text Reveal
    const milestoneBlocks = gsap.utils.toArray('.milestone-block');
    milestoneBlocks.forEach((block: any) => {
      gsap.fromTo(block, 
        { opacity: 0, y: 30 },
        {
          opacity: 1, 
          y: 0,
          duration: 1.2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: block,
            start: "top 85%",
            toggleActions: "play none none reverse"
          }
        }
      );
    });

  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="relative w-full bg-[#050505]">
      
      {/* MASTER BACKGROUND (Sticky for all 450vh) */}
      <div className="sticky top-0 w-full h-screen flex items-center justify-center pointer-events-none z-10 overflow-hidden">
        
        {/* Solid Green Circle */}
        <div 
          ref={circleRef} 
          className="absolute w-[100px] h-[100px] rounded-full bg-[#35fe5d] will-change-transform"
          style={{ transform: 'scale(0)' }}
        ></div>

        {/* Gradient Overlay (Fades in) */}
        <div 
          ref={gradientRef} 
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#35fe5d] via-[#21db46] to-[#0d7d24] opacity-0"
        ></div>
      </div>

      {/* CONTENT SCROLL LAYER */}
      <div className="relative z-20 -mt-[100vh]">
        
        {/* INTRO SECTION: 150vh tall. The title is sticky inside this, so it stays for 50vh of scroll, then scrolls away naturally! */}
        <div className="relative w-full h-[150vh]">
          <div className="sticky top-0 w-full h-screen flex items-center justify-center pointer-events-none">
            <div ref={titleWrapperRef} className="relative w-full max-w-5xl px-6 flex justify-center origin-center">
              <img 
                src="/fonts/GROW-WITH-THE-FLOW.svg" 
                alt="Grow with the flow" 
                className="w-full h-auto object-contain z-10 relative brightness-0"
              />
            </div>
          </div>
        </div>

        {/* THE TIMELINE SECTION: Transparent so the Master Background shows through */}
        <section className="timeline-section relative w-full h-[300vh] bg-transparent">
          
          {/* Solid Thick Black Road */}
          <div className="absolute inset-0 w-full h-full pointer-events-none z-10 flex justify-center">
            <svg viewBox="0 0 1000 3000" preserveAspectRatio="none" className="w-full h-full max-w-[1400px]">
              <path 
                d="M 500 0 C 500 400, 200 600, 200 1000 S 800 1400, 800 1800 S 200 2200, 200 2600 S 500 2800, 500 3000" 
                fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="30" strokeLinecap="round"
              />
              <path 
                ref={pathRef}
                d="M 500 0 C 500 400, 200 600, 200 1000 S 800 1400, 800 1800 S 200 2200, 200 2600 S 500 2800, 500 3000" 
                fill="none" stroke="#000000" strokeWidth="24" strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Milestones Container */}
          <div className="relative w-full h-full max-w-6xl mx-auto px-6 z-30 pt-[20vh]">
            
            {/* MILESTONE 1 (Road is Left, Text is Right) */}
            <div className="absolute right-[5%] sm:right-[10%] md:right-[15%] w-full max-w-[400px]" style={{ top: "25%" }}>
              <div className="milestone-block relative flex flex-col items-end text-right">
                <h3 className="absolute -top-16 -right-10 font-podium text-[8rem] md:text-[12rem] tracking-tighter text-black/5 -z-10 pointer-events-none select-none">2025</h3>
                <div className="flex items-center gap-4">
                  <div className="w-4 h-4 bg-black rounded-full"></div>
                  <h4 className="font-podium text-3xl md:text-5xl uppercase tracking-tight text-black">Backend<br/>Engineering</h4>
                </div>
                <div className="w-16 h-1 bg-black my-6"></div>
                <ul className="font-inter text-sm md:text-base tracking-[0.2em] uppercase space-y-4 text-black font-semibold">
                  <li>Spring Boot</li>
                  <li>REST APIs</li>
                  <li>Database Architecture</li>
                </ul>
              </div>
            </div>

            {/* MILESTONE 2 (Road is Right, Text is Left) */}
            <div className="absolute left-[5%] sm:left-[10%] md:left-[15%] w-full max-w-[400px]" style={{ top: "50%" }}>
              <div className="milestone-block relative flex flex-col items-start text-left">
                <h3 className="absolute -top-16 -left-10 font-podium text-[8rem] md:text-[12rem] tracking-tighter text-black/5 -z-10 pointer-events-none select-none">2026</h3>
                <div className="flex items-center gap-4">
                  <h4 className="font-podium text-3xl md:text-5xl uppercase tracking-tight text-black">AI<br/>Systems</h4>
                  <div className="w-4 h-4 bg-black rounded-full"></div>
                </div>
                <div className="w-16 h-1 bg-black my-6"></div>
                <ul className="font-inter text-sm md:text-base tracking-[0.2em] uppercase space-y-4 text-black font-semibold">
                  <li>LLM Pipelines</li>
                  <li>Machine Learning</li>
                  <li>Agentic Systems</li>
                </ul>
              </div>
            </div>

            {/* MILESTONE 3 (Road is Left, Text is Right) */}
            <div className="absolute right-[5%] sm:right-[10%] md:right-[15%] w-full max-w-[400px]" style={{ top: "80%" }}>
              <div className="milestone-block relative flex flex-col items-end text-right">
                <h3 className="absolute -top-16 -right-10 font-podium text-[8rem] md:text-[12rem] tracking-tighter text-black/5 -z-10 pointer-events-none select-none">2026</h3>
                <div className="flex items-center gap-4">
                  <div className="w-4 h-4 bg-black rounded-full"></div>
                  <h4 className="font-podium text-3xl md:text-5xl uppercase tracking-tight text-black">Creative<br/>Development</h4>
                </div>
                <div className="w-16 h-1 bg-black my-6"></div>
                <ul className="font-inter text-sm md:text-base tracking-[0.2em] uppercase space-y-4 text-black font-semibold">
                  <li>Interactive UIs</li>
                  <li>GSAP Animations</li>
                  <li>Experiences</li>
                </ul>
              </div>
            </div>

          </div>
        </section>
      </div>
    </div>
  );
};
