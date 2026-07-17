import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';

import { FlowCar } from './FlowCar';

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

export const flowJourneyState = {
  progress: 0,
  pathRef: null as SVGPathElement | null,
  svgRect: null as DOMRect | null,
};

export const FlowJourney = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const circleRef = useRef<HTMLDivElement>(null);
  const gradientRef = useRef<HTMLDivElement>(null);
  const titleWrapperRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const svgContainerRef = useRef<HTMLDivElement>(null);

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

    // 2. Crossfade to Dim Ambient Background
    gsap.to(gradientRef.current, {
      opacity: 1,
      ease: "power2.inOut",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top -150%", // Starts fading after text is fully visible
        end: "top -230%",   // Finishes as we enter timeline section
        scrub: 1,
      }
    });

    // 3. Title Fade In
    gsap.fromTo(titleWrapperRef.current, {
      opacity: 0,
      y: 50,
      scale: 0.95,
    }, {
      opacity: 1,
      y: 0,
      scale: 1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top -100%", // Wait for circle to fill the screen first
        end: "top -150%",
        scrub: 1,
      }
    });

    // 4. SVG Road Drawing & Car Follower (Synchronized with Wall Pins)
    if (pathRef.current) {
      const length = pathRef.current.getTotalLength();
      gsap.set(pathRef.current, { strokeDasharray: length, strokeDashoffset: length });

      const proxy = { progress: 0 };
      
      const updatePath = () => {
        const p = proxy.progress;
        gsap.set(pathRef.current, { strokeDashoffset: length * (1 - p) });
        
        flowJourneyState.progress = p;
        flowJourneyState.pathRef = pathRef.current;
        
        if (svgContainerRef.current) {
           flowJourneyState.svgRect = svgContainerRef.current.getBoundingClientRect();
        }
      };

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ".timeline-section",
          start: "top center",
          end: "bottom center",
          scrub: 1,
        }
      });

      // Draw the road continuously without pauses
      tl.to(proxy, { progress: 1, duration: 100, ease: "none", onUpdate: updatePath });
    }

    // 5. The "Wall" Checkpoints (Minimal Design + Pinning)
    const milestoneBlocks = gsap.utils.toArray('.milestone-block');
    const checkpointNodes = gsap.utils.toArray('.checkpoint-node');

    milestoneBlocks.forEach((block: any, i: number) => {
      const node = checkpointNodes[i] as HTMLElement;
      const core = node.querySelector('.checkpoint-core');
      const pulse = node.querySelector('.checkpoint-ripple');

      const heading = block.querySelector('h4');
      const textBlockItems = block.querySelectorAll('li');
      const year = block.querySelector('h3');
      const line = block.querySelector('.divider-line');

      // Start state: Minimal and dimmed out
      gsap.set(block, { opacity: 0.1 });
      gsap.set(core, { backgroundColor: "rgba(255,255,255,0.2)", scale: 1, boxShadow: "none" });
      gsap.set(line, { width: 0, backgroundColor: "transparent", boxShadow: "none" });
      gsap.set(textBlockItems, { color: "rgba(255,255,255,0.1)", x: 0 });
      gsap.set(year, { color: "rgba(0,0,0,0.3)", y: 0 });

      // Create a scrubbed timeline that animates as you scroll past
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: block,
          start: "top 55%", 
          end: "bottom 30%",
          scrub: 1,
        }
      });

      // Step 1: Core turns green immediately
      tl.to(core, {
        backgroundColor: "#35fe5d",
        scale: 1.5,
        boxShadow: "0 0 15px rgba(53,254,93,0.5)",
        duration: 0.1, // Quick snap
      }, 0);

      // Step 2: Ripple fires off against the wall
      tl.fromTo(pulse, {
        scale: 1,
        opacity: 0.8,
      }, {
        scale: 4,
        opacity: 0,
        duration: 1, // Spans the full scrub
        ease: "power2.out"
      }, 0);

      // Step 3: Block fades in as you push
      tl.to(block, { opacity: 1, duration: 0.3 }, 0);

      // Step 4: Heading brightens
      tl.to(heading, {
        color: "#FFFFFF",
        textShadow: "0px 0px 20px rgba(255,255,255,0.2)",
        duration: 0.3,
      }, 0.1);

      // Step 5: Year pops up
      tl.to(year, {
        color: "rgba(255,255,255,0.06)",
        y: -15,
        duration: 0.4,
      }, 0.1);

      // Step 6: Accent line shoots out
      tl.to(line, {
        width: "64px",
        backgroundColor: "#35fe5d",
        boxShadow: "0 0 15px rgba(53,254,93,0.6)",
        duration: 0.4,
      }, 0.2);

      // Step 7: List items stagger in
      tl.to(textBlockItems, {
        color: "rgba(255,255,255,0.9)",
        x: () => {
          return block.classList.contains('items-end') ? -10 : 10;
        },
        stagger: 0.1,
        duration: 0.5,
      }, 0.3);
    });

  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="relative w-full bg-[#050505]">
      
      {/* MASTER BACKGROUND (Sticky for all 550vh) */}
      <div className="sticky top-0 w-full h-screen flex items-center justify-center pointer-events-none z-10 overflow-hidden">
        
        {/* Solid Green Circle */}
        <div 
          ref={circleRef} 
          className="absolute w-[100px] h-[100px] rounded-full bg-[#35fe5d] will-change-transform"
          style={{ transform: 'scale(0)' }}
        ></div>

        {/* Dim Ambient Background (Fades in) */}
        <div 
          ref={gradientRef} 
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#0d3617] via-[#071f0d] to-[#050505] opacity-0"
        ></div>

        {/* 3D Cinematic Car Canvas */}
        <div className="absolute inset-0 w-full h-full pointer-events-none z-30">
          <FlowCar />
        </div>
      </div>

      {/* CONTENT SCROLL LAYER */}
      <div className="relative z-20 -mt-[100vh]">
        
        {/* INTRO SECTION: 250vh tall. The title is sticky inside this, so it stays until 150vh of scroll, then scrolls away naturally! */}
        <div className="relative w-full h-[250vh]">
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
        <section className="timeline-section relative w-full h-[500vh] bg-transparent">
          
          {/* Solid Thick Black Road (SVG) */}
          <div className="absolute inset-0 w-full h-full pointer-events-none z-10 flex justify-center">
            <svg ref={svgContainerRef} viewBox="0 0 1000 5000" preserveAspectRatio="none" className="w-full h-full max-w-[1400px] overflow-visible">
              <defs>
                <filter id="greenGlow" x="-500%" y="-500%" width="1100%" height="1100%">
                  <feGaussianBlur stdDeviation="30" result="blur" />
                  <feFlood floodColor="#35fe5d" floodOpacity="1" result="color"/>
                  <feComposite in="color" in2="blur" operator="in" result="glow" />
                  <feMerge>
                    <feMergeNode in="glow" />
                    <feMergeNode in="glow" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              
              {/* Dim base road */}
              <path 
                d="M 500 0 C 500 400, 200 600, 200 1000 S 800 1400, 800 1800 S 200 2200, 200 2600 S 800 3000, 800 3400 S 200 3800, 200 4200 S 500 4600, 500 5000" 
                fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="30" strokeLinecap="round"
              />
              {/* The solid black road being drawn */}
              <path 
                ref={pathRef}
                d="M 500 0 C 500 400, 200 600, 200 1000 S 800 1400, 800 1800 S 200 2200, 200 2600 S 800 3000, 800 3400 S 200 3800, 200 4200 S 500 4600, 500 5000" 
                fill="none" stroke="#000000" strokeWidth="24" strokeLinecap="round"
              />
            </svg>
          </div>

          {/* HTML Checkpoints perfectly aligned with the SVG path (z-20) */}
          <div className="absolute inset-0 w-full h-full max-w-[1400px] mx-auto pointer-events-none z-20">
            
            {/* Minimal HTML Checkpoints perfectly aligned with the SVG path */}
            {/* Point 1: (200, 1000) -> left: 20%, top: 20% */}
            <div className="checkpoint-node absolute z-10 w-0 h-0" style={{ left: "20%", top: "20%" }}>
              <div className="checkpoint-ripple absolute w-10 h-10 border-[2px] border-[#35fe5d] rounded-full -translate-x-1/2 -translate-y-1/2 opacity-0 pointer-events-none"></div>
              <div className="checkpoint-core absolute w-3 h-3 bg-white/20 rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>
            </div>
            
            {/* Point 2: (800, 1800) -> left: 80%, top: 36% */}
            <div className="checkpoint-node absolute z-10 w-0 h-0" style={{ left: "80%", top: "36%" }}>
              <div className="checkpoint-ripple absolute w-10 h-10 border-[2px] border-[#35fe5d] rounded-full -translate-x-1/2 -translate-y-1/2 opacity-0 pointer-events-none"></div>
              <div className="checkpoint-core absolute w-3 h-3 bg-white/20 rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>
            </div>

            {/* Point 3: (200, 2600) -> left: 20%, top: 52% */}
            <div className="checkpoint-node absolute z-10 w-0 h-0" style={{ left: "20%", top: "52%" }}>
              <div className="checkpoint-ripple absolute w-10 h-10 border-[2px] border-[#35fe5d] rounded-full -translate-x-1/2 -translate-y-1/2 opacity-0 pointer-events-none"></div>
              <div className="checkpoint-core absolute w-3 h-3 bg-white/20 rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>
            </div>

            {/* Point 4: (800, 3400) -> left: 80%, top: 68% */}
            <div className="checkpoint-node absolute z-10 w-0 h-0" style={{ left: "80%", top: "68%" }}>
              <div className="checkpoint-ripple absolute w-10 h-10 border-[2px] border-[#35fe5d] rounded-full -translate-x-1/2 -translate-y-1/2 opacity-0 pointer-events-none"></div>
              <div className="checkpoint-core absolute w-3 h-3 bg-white/20 rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>
            </div>

            {/* Point 5: (200, 4200) -> left: 20%, top: 84% */}
            <div className="checkpoint-node absolute z-10 w-0 h-0" style={{ left: "20%", top: "84%" }}>
              <div className="checkpoint-ripple absolute w-10 h-10 border-[2px] border-[#35fe5d] rounded-full -translate-x-1/2 -translate-y-1/2 opacity-0 pointer-events-none"></div>
              <div className="checkpoint-core absolute w-3 h-3 bg-white/20 rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>
            </div>
          </div>

          {/* Milestones Container */}
          <div className="relative w-full h-full max-w-6xl mx-auto px-6 z-30 pt-[20vh]">
            
            {/* MILESTONE 1: (y=1000 / 5000 = 20%) */}
            <div className="absolute right-[5%] sm:right-[10%] md:right-[15%] w-full max-w-[500px]" style={{ top: "20%" }}>
              <div className="milestone-block relative flex flex-col items-end text-right -translate-y-1/2">
                <h3 className="absolute -top-16 -right-10 font-podium text-[8rem] md:text-[12rem] tracking-tighter -z-10 pointer-events-none select-none">2020</h3>
                <div className="flex items-center gap-4">
                  <h4 className="font-podium text-3xl md:text-5xl uppercase tracking-tight text-black">Creative<br/>Beginnings</h4>
                </div>
                <div className="divider-line h-1 bg-black my-6"></div>
                <ul className="font-inter text-sm md:text-base space-y-4 max-w-[400px] list-none">
                  <li>Joined a student club and discovered my passion for design.</li>
                  <li>Created posters, event branding, and social media creatives.</li>
                  <li>Learned Adobe Photoshop and built a strong foundation in visual communication.</li>
                </ul>
              </div>
            </div>

            {/* MILESTONE 2: (y=1800 / 5000 = 36%) */}
            <div className="absolute left-[5%] sm:left-[10%] md:left-[15%] w-full max-w-[500px]" style={{ top: "36%" }}>
              <div className="milestone-block relative flex flex-col items-start text-left -translate-y-1/2">
                <h3 className="absolute -top-16 -left-10 font-podium text-[8rem] md:text-[12rem] tracking-tighter -z-10 pointer-events-none select-none">2023</h3>
                <div className="flex items-center gap-4">
                  <h4 className="font-podium text-3xl md:text-5xl uppercase tracking-tight text-black">First Lines<br/>of Code</h4>
                </div>
                <div className="divider-line h-1 bg-black my-6"></div>
                <ul className="font-inter text-sm md:text-base space-y-4 max-w-[400px] list-none">
                  <li>Wrote my first lines of code in Python.</li>
                  <li>Started exploring UI and interface design with Figma.</li>
                  <li>Began seeing design and programming as complementary skills rather than separate disciplines.</li>
                </ul>
              </div>
            </div>

            {/* MILESTONE 3: (y=2600 / 5000 = 52%) */}
            <div className="absolute right-[5%] sm:right-[10%] md:right-[15%] w-full max-w-[500px]" style={{ top: "52%" }}>
              <div className="milestone-block relative flex flex-col items-end text-right -translate-y-1/2">
                <h3 className="absolute -top-16 -right-10 font-podium text-[8rem] md:text-[12rem] tracking-tighter -z-10 pointer-events-none select-none">2025</h3>
                <div className="flex items-center gap-4">
                  <h4 className="font-podium text-3xl md:text-5xl uppercase tracking-tight text-black">Research<br/>& Growth</h4>
                </div>
                <div className="divider-line h-1 bg-black my-6"></div>
                <ul className="font-inter text-sm md:text-base space-y-4 max-w-[400px] list-none">
                  <li>Focused on learning deep learning and modern AI concepts.</li>
                  <li>Completed a Research Internship through the IEEE Computer Society Research Program in September.</li>
                  <li>Shifted focus toward backend development and began building server-side applications.</li>
                  <li>Continued improving my design workflow by transitioning from Canva to Adobe Illustrator.</li>
                </ul>
              </div>
            </div>

            {/* MILESTONE 4: (y=3400 / 5000 = 68%) */}
            <div className="absolute left-[5%] sm:left-[10%] md:left-[15%] w-full max-w-[500px]" style={{ top: "68%" }}>
              <div className="milestone-block relative flex flex-col items-start text-left -translate-y-1/2">
                <h3 className="absolute -top-16 -left-10 font-podium text-[8rem] md:text-[12rem] tracking-tighter -z-10 pointer-events-none select-none">2026</h3>
                <div className="flex items-center gap-4">
                  <h4 className="font-podium text-3xl md:text-5xl uppercase tracking-tight text-black">Production<br/>Systems</h4>
                </div>
                <div className="divider-line h-1 bg-black my-6"></div>
                <ul className="font-inter text-sm md:text-base space-y-4 max-w-[400px] list-none">
                  <li>Joined NEEPCO as a Backend Intern.</li>
                  <li>Contributed to backend project development and real-world application features.</li>
                  <li>Gained experience collaborating in a professional development environment.</li>
                  <li>Continued exploring AI and deep learning alongside software engineering.</li>
                </ul>
              </div>
            </div>

            {/* MILESTONE 5: (y=4200 / 5000 = 84%) */}
            <div className="absolute right-[5%] sm:right-[10%] md:right-[15%] w-full max-w-[500px]" style={{ top: "84%" }}>
              <div className="milestone-block relative flex flex-col items-end text-right -translate-y-1/2">
                <h3 className="absolute -top-16 -right-10 font-podium text-[8rem] md:text-[12rem] tracking-tighter -z-10 pointer-events-none select-none">TODAY</h3>
                <div className="flex items-center gap-4">
                  <h4 className="font-podium text-3xl md:text-5xl uppercase tracking-tight text-black">The<br/>Journey</h4>
                </div>
                <div className="divider-line h-1 bg-black my-6"></div>
                <ul className="font-inter text-sm md:text-base max-w-[400px] list-none space-y-4">
                  <li className="leading-relaxed">From graphic design to AI research and backend engineering, my journey has been driven by curiosity and a desire to build thoughtful, impactful software.</li>
                </ul>
              </div>
            </div>

          </div>
        </section>
      </div>
    </div>
  );
};
