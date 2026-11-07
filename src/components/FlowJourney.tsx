import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';

import { FlowCar } from './FlowCar';
import { RoadsideScenery } from './RoadsideScenery';
import type { RoadsideSceneryController } from './RoadsideScenery';
import { ensureMilestones, getPhaseWeights } from './timeOfDay';

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

export const flowJourneyState = {
  /** Car position along the road (0..1 of the road length) */
  progress: 0,
  /** Scroll-driven drive progress (0..1); 1 = parked */
  drive: 0,
  angle: 0,
  /** Car's smoothed on-screen heading (radians, 0 = right), written by FlowCar */
  carScreenAngle: Math.PI / 2,
  // Time-of-day blend weights (sum to 1)
  base: 1,
  morning: 0,
  evening: 0,
  night: 0,
};

const getProgress = () => flowJourneyState.progress;

// ---- Road geometry (SVG viewBox 1000 x 5000) ----
const ROAD_D =
  'M 500 0 C 500 400, 200 600, 200 1000 S 800 1400, 800 1800 S 200 2200, 200 2600 ' +
  'S 800 3000, 800 3400 S 200 3800, 200 4200 S 500 4600, 500 5000';
// The drive ends with the car pulling over to the right edge of the road and stopping here;
// the rest of the road fades out instead of dead-ending into the next section.
const STOP_Y = 4640;
const FADE_FROM_Y = 4700;
const PULL_START = 0.9; // last 10% of the drive: ease over to the right edge
const PULL_PX = 46; // how far right of the centre line the car ends up (road is ~185px wide)

const smooth01 = (x: number) => {
  const c = Math.min(1, Math.max(0, x));
  return c * c * (3 - 2 * c);
};

export const FlowJourney = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const circleRef = useRef<HTMLDivElement>(null);
  const gradientRef = useRef<HTMLDivElement>(null);
  const titleWrapperRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const carMoverRef = useRef<HTMLDivElement>(null);
  const sceneryRef = useRef<RoadsideSceneryController | null>(null);
  const morningRef = useRef<HTMLDivElement>(null);
  const eveningRef = useRef<HTMLDivElement>(null);
  const nightRef = useRef<HTMLDivElement>(null);
  const beamRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // 1. Circle Expansion (Solid Green)
    gsap.fromTo(circleRef.current, {
      scale: 0,
    }, {
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
      // Once the background fully covers the giant green circle, stop drawing the circle (it's a huge GPU layer)
      onUpdate() {
        if (circleRef.current) circleRef.current.style.visibility = this.progress() >= 0.999 ? 'hidden' : 'visible';
      },
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

    // 4. SVG Road & Car Follower
    const pathEl = pathRef.current;
    if (pathEl) {
      const length = pathEl.getTotalLength();
      ensureMilestones(pathEl);

      // Sky layers stack morning -> evening -> night; phases are sequential, so this is an exact crossfade
      const applyTimeOfDay = (p: number) => {
        const w = getPhaseWeights(p);
        Object.assign(flowJourneyState, w);
        if (morningRef.current) morningRef.current.style.opacity = String(1 - w.base);
        if (eveningRef.current) eveningRef.current.style.opacity = String(w.evening + w.night);
        if (nightRef.current) nightRef.current.style.opacity = String(w.night);
      };

      // Road position where the car stops (first point at/after STOP_Y)
      let stopT = 1;
      for (let i = 0; i <= 2000; i++) {
        if (pathEl.getPointAtLength((length * i) / 2000).y >= STOP_Y) {
          stopT = i / 2000;
          break;
        }
      }

      // Car position in px inside the road box for a drive progress p:
      // follows the road centre line, then eases over to the right edge during the last stretch.
      const carPos = (p: number, W: number, H: number) => {
        const t = p * stopT;
        const a = pathEl.getPointAtLength(length * t);
        const b = pathEl.getPointAtLength(length * Math.min(t + 0.001, 1));
        const sx = W / 1000;
        const sy = H / 5000;
        let tx = (b.x - a.x) * sx;
        let ty = (b.y - a.y) * sy;
        const m = Math.hypot(tx, ty) || 1;
        tx /= m;
        ty /= m;
        const off = smooth01((p - PULL_START) / (1 - PULL_START)) * PULL_PX;
        // (ty, -tx) is the screen-right side of the road for a car heading down the page
        return { x: a.x * sx + ty * off, y: a.y * sy - tx * off, t };
      };

      const proxy = { progress: 0 };

      let lastAngle = 0;
      const updatePath = () => {
        const p = proxy.progress;
        const svgEl = pathEl.ownerSVGElement;
        const W = svgEl?.clientWidth || svgEl?.getBoundingClientRect().width || Math.min(window.innerWidth, 1400);
        const H = svgEl?.clientHeight || svgEl?.getBoundingClientRect().height || window.innerHeight * 8;

        const pos = carPos(p, W, H);
        flowJourneyState.drive = p;
        flowJourneyState.progress = pos.t;
        applyTimeOfDay(pos.t);
        sceneryRef.current?.update(pos.t);

        if (carMoverRef.current) {
          // Heading from the actual movement (includes the pull-over), in true screen pixels
          if (p < 0.998) {
            const next = carPos(Math.min(p + 0.002, 1), W, H);
            lastAngle = Math.atan2(next.y - pos.y, next.x - pos.x);
          }
          flowJourneyState.angle = lastAngle;

          carMoverRef.current.style.left = `${(pos.x / W) * 100}%`;
          carMoverRef.current.style.top = `${(pos.y / H) * 100}%`;
          carMoverRef.current.style.transform = `translate(-50%, -50%)`;
        }
      };

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ".timeline-section",
          start: "top center",
          // Finish when the stopping point reaches the middle of the screen
          end: () => `+=${(document.querySelector('.timeline-section') as HTMLElement).offsetHeight * (STOP_Y / 5000)}`,
          invalidateOnRefresh: true,
          scrub: 2, // Heavy damping for maximum smoothness (zero jiggle)
        }
      });

      tl.to(proxy, { progress: 1, duration: 1, ease: "none", onUpdate: updatePath });
    }

    // Headlight beam follows the car's smoothed heading; only touches the DOM when something changed
    let lastStrength = -1;
    let lastAngle = Infinity; // forces the first write
    const updateBeam = () => {
      const beam = beamRef.current;
      if (!beam) return;
      const { night, evening, carScreenAngle, drive } = flowJourneyState;
      const parked = smooth01((drive - 0.97) / 0.03);
      const strength = Math.round(Math.min(1, night + evening * 0.35) * (1 - parked) * 100) / 100;
      if (strength !== lastStrength) {
        lastStrength = strength;
        beam.style.opacity = String(strength);
        beam.style.visibility = strength > 0 ? 'visible' : 'hidden';
      }
      if (strength > 0 && Math.abs(carScreenAngle - lastAngle) > 0.002) {
        lastAngle = carScreenAngle;
        beam.style.transform = `rotate(${carScreenAngle}rad) translateX(55px)`;
      }
    };
    gsap.ticker.add(updateBeam);

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

    return () => gsap.ticker.remove(updateBeam);
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="relative w-full bg-black">
      
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

        {/* Time-of-day layers (opacity driven by the car's progress) */}
        <div
          ref={morningRef}
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#2f7d34] via-[#1d5a24] to-[#0c2611] opacity-0"
        ></div>
        <div
          ref={eveningRef}
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#5e4a26] via-[#3b2a20] to-[#170e1c] opacity-0"
        ></div>
        <div
          ref={nightRef}
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#121212] via-[#070707] to-[#000000] opacity-0"
        ></div>
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

        {/* THE TIMELINE SECTION: Native scroll, 800vh for a slower, longer drive */}
        <section className="timeline-section relative w-full h-[800vh] bg-transparent">
          
          {/* Solid Thick Black Road (SVG) - z-index 10 */}
          <div className="absolute inset-0 w-full h-full pointer-events-none z-10 flex justify-center">
            <svg viewBox="0 0 1000 5000" preserveAspectRatio="none" className="w-full h-full max-w-[1400px] overflow-visible">
              {/* Fade the road out below where the car stops, so it doesn't dead-end into the next section */}
              <defs>
                <linearGradient id="road-end-fade" gradientUnits="userSpaceOnUse" x1="0" y1={FADE_FROM_Y} x2="0" y2="4990">
                  <stop offset="0" stopColor="#fff" />
                  <stop offset="1" stopColor="#000" />
                </linearGradient>
                <mask id="road-end-mask" maskUnits="userSpaceOnUse" x="-200" y="-200" width="1400" height="5400">
                  <rect x="-200" y="-200" width="1400" height="5400" fill="url(#road-end-fade)" />
                </mask>
              </defs>
              {/* The solid black road with borders and center line */}
              <g mask="url(#road-end-mask)">
                {/* 1. Outer White Borders */}
                <path d={ROAD_D} fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="140" strokeLinecap="butt" />
                {/* 2. Main Black Road */}
                <path ref={pathRef} d={ROAD_D} fill="none" stroke="#0a0a0a" strokeWidth="132" strokeLinecap="butt" />
                {/* 3. Center Dashed Line */}
                <path d={ROAD_D} fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="4" strokeLinecap="round" strokeDasharray="40 40" />
              </g>
            </svg>
          </div>

          {/* Roadside scenery (trees, houses, city, lake) that pops up as the car approaches - z-15 (above road, below text) */}
          <RoadsideScenery pathRef={pathRef} controllerRef={sceneryRef} getProgress={getProgress} />

          {/* HTML Car Mover - z-index 30 (Above SVG road) */}
          <div className="absolute inset-0 w-full h-full max-w-[1400px] mx-auto pointer-events-none z-30">
            <div 
              ref={carMoverRef} 
              className="absolute w-[300px] h-[300px] pointer-events-none"
              style={{ left: '50%', top: '0%' }}
            >
              {/* Headlight beam (night) - sits behind the car, rotated to its heading */}
              <div
                ref={beamRef}
                className="absolute pointer-events-none"
                style={{
                  left: '50%',
                  top: 'calc(50% - 85px)',
                  width: 280,
                  height: 170,
                  transformOrigin: '0 50%',
                  opacity: 0,
                  visibility: 'hidden',
                }}
              >
                <div
                  className="w-full h-full"
                  style={{
                    clipPath: 'polygon(0 40%, 100% 0, 100% 100%, 0 60%)',
                    background: 'linear-gradient(to right, rgba(255,238,190,0.42), rgba(255,238,190,0.1) 70%, rgba(255,238,190,0))',
                  }}
                />
              </div>
              <div className="relative w-full h-full">
                <FlowCar />
              </div>
            </div>
          </div>

          {/* HTML Checkpoints perfectly aligned with the SVG path (z-20) */}
          <div className="absolute inset-0 w-full h-full max-w-[1400px] mx-auto pointer-events-none z-20">
              
              {/* Minimal HTML Checkpoints perfectly aligned with the SVG path */}
              <div className="checkpoint-node absolute z-10 w-0 h-0" style={{ left: "20%", top: "20%" }}>
                <div className="checkpoint-ripple absolute w-10 h-10 border-[2px] border-[#35fe5d] rounded-full -translate-x-1/2 -translate-y-1/2 opacity-0 pointer-events-none"></div>
                <div className="checkpoint-core absolute w-3 h-3 bg-white/20 rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>
              </div>
              
              <div className="checkpoint-node absolute z-10 w-0 h-0" style={{ left: "80%", top: "36%" }}>
                <div className="checkpoint-ripple absolute w-10 h-10 border-[2px] border-[#35fe5d] rounded-full -translate-x-1/2 -translate-y-1/2 opacity-0 pointer-events-none"></div>
                <div className="checkpoint-core absolute w-3 h-3 bg-white/20 rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>
              </div>

              <div className="checkpoint-node absolute z-10 w-0 h-0" style={{ left: "20%", top: "52%" }}>
                <div className="checkpoint-ripple absolute w-10 h-10 border-[2px] border-[#35fe5d] rounded-full -translate-x-1/2 -translate-y-1/2 opacity-0 pointer-events-none"></div>
                <div className="checkpoint-core absolute w-3 h-3 bg-white/20 rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>
              </div>

              <div className="checkpoint-node absolute z-10 w-0 h-0" style={{ left: "80%", top: "68%" }}>
                <div className="checkpoint-ripple absolute w-10 h-10 border-[2px] border-[#35fe5d] rounded-full -translate-x-1/2 -translate-y-1/2 opacity-0 pointer-events-none"></div>
                <div className="checkpoint-core absolute w-3 h-3 bg-white/20 rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>
              </div>

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
