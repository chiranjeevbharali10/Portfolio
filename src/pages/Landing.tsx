import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ShowcaseCard } from "../components/ShowcaseCard";
import { ShowcaseTransition } from "../components/transitions/ShowcaseTransition";
import { Projects } from "./Projects";
import { isAppLoaded } from "../utils/loadingState";

export const Landing = () => {
  const [showProjects, setShowProjects] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const playAnimation = () => {
      const tl = gsap.timeline({ delay: 0.4, repeat: -1, repeatDelay: 2.35 }); // Loops exactly every ~13 seconds

    // Shrink the main creativity box with a slight squash/bounce
    tl.to(".creativity-poster", {
      scaleY: 0.85, // <-- CHANGE THIS VALUE to adjust how much it shrinks
      duration: 0.9,
      ease: "back.out(1.2)",
    })
      // Avatar pops in AFTER the box finishes shrinking
      .fromTo(".avatar-me",
        { y: 200, scale: 0.85, zIndex: 10 }, // Start hidden behind (z-10)
        { y: 0, scale: 1, duration: 0.8, ease: "back.out(1.4)" }, // "wooop" elastic pop
        "> -0.1" 
      )
      .set(".avatar-me", { zIndex: 40 }, "-=0.4") // Snap to front (z-40) mid-bounce so hands overlap the border
      // Bubble 1 pops in
      .to(".bubble-1", {
        opacity: 1,
        scale: 1,
        duration: 0.5,
        ease: "back.out(1.7)"
      }, "+=0.1")
      // Bubble 2 pops in
      .to(".bubble-2", {
        opacity: 1,
        scale: 1,
        duration: 0.5,
        ease: "back.out(1.7)"
      }, "+=0.4")
      
      // --- 7 SECOND DELAY, THEN DISAPPEAR SEQUENCE ---
      // 1. Bubbles disappear with a comic woosh
      .to([".bubble-2", ".bubble-1"], {
        scale: 0,
        opacity: 0,
        duration: 0.4,
        ease: "back.in(2)",
        stagger: 0.1
      }, "+=7") // Wait 7 seconds
      
      // 2. Avatar speedy woosh down (instantly snap behind poster first)
      .set(".avatar-me", { zIndex: 10 })
      .to(".avatar-me", {
        y: 200,
        scale: 0.85,
        duration: 0.35,
        ease: "power4.in"
      }, "+=0.1")

      // 3. Bento box scales back up to its original position
      .to(".creativity-poster", {
        scaleY: 1,
        duration: 0.7,
        ease: "back.out(1.2)"
      });
    };

    if (isAppLoaded()) {
      playAnimation();
    } else {
      window.addEventListener('appLoaded', playAnimation, { once: true });
    }
  }, { scope: containerRef });

  return (
    <>
      <section ref={containerRef} className="min-h-screen w-full bg-[#050505] p-6 sm:p-10 lg:p-16 flex items-center justify-center overflow-hidden">

        <div className="w-full max-w-[1400px] mx-auto flex flex-col md:flex-row gap-6 md:h-[80vh]">

          {/* LEFT COLUMN (1/3) */}
          <div className="w-full md:w-1/3 flex flex-col gap-6">

            {/* GREEN FLOW CARD */}
            <Link
              to="/universe#flow"
              className="group relative h-[180px] sm:h-[220px] shrink-0 bg-[#35fe5d] rounded-[24px] sm:rounded-[32px] p-4 sm:p-6 overflow-hidden transition-transform duration-500 hover:scale-[0.98] border border-white/5 flex flex-col items-center justify-center landing-fade-target"
            >
              {/* Top Right Stars */}
              <div className="absolute top-4 right-6 flex gap-1 opacity-40">
                <span className="text-black text-xl">✦</span>
                <span className="text-black text-xl">✦</span>
                <span className="text-black text-xl">✦</span>
              </div>

              {/* Bottom Left Symbols */}
              <div className="absolute bottom-4 left-6 flex gap-2 opacity-40 text-black font-mono text-xs tracking-widest">
                * 〰 ↙
              </div>

              <img
                src="/fonts/GROW-WITH-THE-FLOW.svg"
                alt="Grow With The Flow"
                className="relative z-10 w-[95%] h-[95%] object-contain brightness-0 transition-transform duration-700 group-hover:scale-105"
              />
            </Link>

            {/* BOTTOM SECTION (Projects Left, Exp & About Right) */}
            <div className="flex gap-6 flex-1 min-h-[250px]">

              {/* LEFT: PROJECTS (New Interactive Showcase Card) */}
              <ShowcaseTransition
                className="flex-1"
                onSwap={() => setShowProjects(true)}
              >
                {(isTransitioned) => (
                  <ShowcaseCard
                    layout={isTransitioned ? 'horizontal' : 'vertical'}
                    className="w-full h-full shadow-lg"
                  />
                )}
              </ShowcaseTransition>

              {/* RIGHT: SKILLS & EXPERIENCE (Stacked) */}
              <div className="flex flex-col gap-6 flex-1 landing-fade-target">
                <Link
                  to="/universe#skills"
                  className="group relative flex-1 bg-[#0c0c0c] rounded-[24px] sm:rounded-[32px] p-6 overflow-hidden transition-transform duration-500 hover:scale-[0.98] border border-white/5 flex flex-col justify-end"
                >
                  <h2 className="font-podium text-xl text-primary tracking-wide uppercase">SKILLS</h2>
                </Link>

                <Link
                  to="/relax"
                  className="group relative flex-1 rounded-[24px] sm:rounded-[32px] p-6 overflow-hidden transition-all duration-500 hover:scale-[0.98] border border-white/10 shadow-lg flex flex-col justify-end"
                >
                  <img
                    src="/Relax_bento.png"
                    alt="Relax Background"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                  {/* Subtle dark gradient overlay for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>

                  {/* Animated Wave Overlay */}
                  <div className="absolute inset-0 pointer-events-none overflow-hidden z-[5] transition-transform duration-1000 group-hover:scale-105 opacity-80">
                    <svg
                      className="w-full h-full mix-blend-multiply"
                      viewBox="0 0 500 550"
                      preserveAspectRatio="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g fill="none" stroke="#4a0033" strokeWidth="1.5" vectorEffect="non-scaling-stroke">
                        <path d="M -500,220 C -320,185 -180,255 0,220 C 180,185 320,255 500,220" strokeOpacity="0.15">
                          <animateTransform attributeName="transform" type="translate" from="0 0" to="500 0" dur="24s" repeatCount="indefinite" />
                        </path>
                        <path d="M -500,245 C -330,200 -170,290 0,245 C 170,200 330,290 500,245" strokeOpacity="0.2">
                          <animateTransform attributeName="transform" type="translate" from="0 0" to="500 0" dur="26s" repeatCount="indefinite" />
                        </path>
                        <path d="M -500,270 C -340,215 -160,325 0,270 C 160,215 340,325 500,270" strokeOpacity="0.25">
                          <animateTransform attributeName="transform" type="translate" from="0 0" to="500 0" dur="22s" repeatCount="indefinite" />
                        </path>
                        <path d="M -500,295 C -350,230 -150,360 0,295 C 150,230 350,360 500,295" strokeOpacity="0.3">
                          <animateTransform attributeName="transform" type="translate" from="0 0" to="500 0" dur="28s" repeatCount="indefinite" />
                        </path>
                        <path d="M -500,320 C -335,245 -165,395 0,320 C 165,245 335,395 500,320" strokeOpacity="0.3">
                          <animateTransform attributeName="transform" type="translate" from="0 0" to="500 0" dur="25s" repeatCount="indefinite" />
                        </path>
                        <path d="M -500,345 C -325,275 -175,415 0,345 C 175,275 325,415 500,345" strokeOpacity="0.35">
                          <animateTransform attributeName="transform" type="translate" from="0 0" to="500 0" dur="23s" repeatCount="indefinite" />
                        </path>
                        <path d="M -500,370 C -340,310 -160,430 0,370 C 160,310 340,430 500,370" strokeOpacity="0.35">
                          <animateTransform attributeName="transform" type="translate" from="0 0" to="500 0" dur="27s" repeatCount="indefinite" />
                        </path>
                        <path d="M -500,395 C -345,345 -155,445 0,395 C 155,345 345,445 500,395" strokeOpacity="0.4">
                          <animateTransform attributeName="transform" type="translate" from="0 0" to="500 0" dur="24s" repeatCount="indefinite" />
                        </path>
                        <path d="M -500,420 C -355,380 -145,460 0,420 C 145,380 355,460 500,420" strokeOpacity="0.35">
                          <animateTransform attributeName="transform" type="translate" from="0 0" to="500 0" dur="26s" repeatCount="indefinite" />
                        </path>
                        <path d="M -500,445 C -350,415 -150,475 0,445 C 150,415 350,475 500,445" strokeOpacity="0.3">
                          <animateTransform attributeName="transform" type="translate" from="0 0" to="500 0" dur="22s" repeatCount="indefinite" />
                        </path>
                        <path d="M -500,470 C -340,450 -160,490 0,470 C 160,450 340,490 500,470" strokeOpacity="0.25">
                          <animateTransform attributeName="transform" type="translate" from="0 0" to="500 0" dur="28s" repeatCount="indefinite" />
                        </path>
                        <path d="M -500,495 C -330,485 -170,505 0,495 C 170,485 330,505 500,495" strokeOpacity="0.2">
                          <animateTransform attributeName="transform" type="translate" from="0 0" to="500 0" dur="25s" repeatCount="indefinite" />
                        </path>
                        <path d="M -500,515 C -350,510 -150,520 0,515 C 150,510 350,520 500,515" strokeOpacity="0.15">
                          <animateTransform attributeName="transform" type="translate" from="0 0" to="500 0" dur="23s" repeatCount="indefinite" />
                        </path>
                        <path d="M -500,535 C -340,533 -160,537 0,535 C 160,533 340,537 500,535" strokeOpacity="0.1">
                          <animateTransform attributeName="transform" type="translate" from="0 0" to="500 0" dur="27s" repeatCount="indefinite" />
                        </path>
                      </g>
                    </svg>
                  </div>

                  {/* Clean, Tasteful Typography */}
                  <h2 className="font-podium text-2xl sm:text-3xl text-white tracking-widest uppercase relative z-10 group-hover:tracking-[0.2em] transition-all duration-500 drop-shadow-md">
                    RELAX
                  </h2>
                </Link>
              </div>

            </div>
          </div>

          {/* RIGHT COLUMN (2/3) */}
          <div className="w-full md:w-2/3 h-[500px] md:h-full p-2 md:p-0 landing-fade-target relative">

            {/* AVATAR */}
            {/* TO ADJUST AVATAR VERTICAL POSITION: Change the `top-[5%]` class below (e.g. to `top-[0%]`, `top-[10%]`, or `-top-[5%]`) */}
            <div className="avatar-me absolute -top-[8%] left-[50%] -translate-x-[60%] -translate-y-[100%] z-10 w-32 sm:w-48 md:w-64 pointer-events-none">
              
              {/* BUBBLE 1 */}
              <div className="bubble-1 absolute bottom-[85%] right-[75%] bg-white text-black font-podium tracking-wide text-[10px] sm:text-xs md:text-sm px-4 py-2 rounded-2xl rounded-br-sm shadow-[0_0_20px_rgba(255,255,255,0.4)] opacity-0 scale-50 origin-bottom-right whitespace-nowrap z-50">
                Hi, I am Chiranjeev
              </div>

              {/* BUBBLE 2 */}
              <div className="bubble-2 absolute bottom-[65%] right-[85%] bg-white text-black font-podium tracking-wide text-[10px] sm:text-xs md:text-sm px-4 py-2 rounded-2xl rounded-tr-sm shadow-[0_0_20px_rgba(255,255,255,0.3)] opacity-0 scale-50 origin-top-right whitespace-nowrap z-50">
                Click below to get started
              </div>

              <img src="/fonts/me-01.svg" alt="Chiranjeev Avatar" className="w-full h-auto object-contain drop-shadow-2xl" />
            </div>

            {/* MAIN CREATIVITY POSTER */}
            <Link
              to="/creative"
              className="creativity-poster origin-bottom group relative flex w-full h-full items-center justify-center bg-[#050508] rounded-[24px] sm:rounded-[28px] p-8 overflow-hidden transition-all duration-700 hover:scale-[0.99] shadow-2xl border-2 border-[#1b6bff]/80 z-20"
            >
              {/* Vibrant Warped SVG Grid Texture - Evenly Lit */}
              <div className="absolute inset-[-5%] z-0 opacity-50 group-hover:opacity-80 transition-opacity duration-1000 flex items-center justify-center pointer-events-none">
                <svg viewBox="0 0 1000 1000" className="w-full h-full text-[#1b6bff]">
                  <g>
                    {Array.from({ length: 26 }).map((_, i) => {
                      const pos = i * 40;
                      const center = 500;
                      const dist = 0.12; // Wavy grid
                      const d = (pos - center) * dist;
                      return (
                        <g key={i}>
                          <path d={`M ${pos} -50 Q ${pos + d} 500 ${pos} 1050`} fill="none" stroke="currentColor" strokeWidth="1" />
                          <path d={`M -50 ${pos} Q 500 ${pos + d} 1050 ${pos}`} fill="none" stroke="currentColor" strokeWidth="1" />
                        </g>
                      );
                    })}
                  </g>
                </svg>
              </div>

              {/* Top Left Text */}
              <div className="absolute top-6 left-8 font-inter text-[10px] text-white tracking-widest z-20">
                chiranjeevbharali10
              </div>

              {/* Top Right Icon */}
              <div className="absolute top-6 right-8 z-20">
                <img src="/fonts/earth-01.svg" alt="Earth" className="w-12 h-12 opacity-90" />
              </div>

              {/* Bottom Left Text */}
              <div className="absolute bottom-6 left-8 font-inter text-[10px] text-white tracking-widest z-20 flex items-center gap-4">
                <span>07</span>
                <span className="w-14 h-px bg-white"></span>
                <span>'26</span>
              </div>

              {/* Bottom Right Icon */}
              <div className="absolute bottom-6 right-8 z-20">
                <img src="/fonts/xx.svg" alt="Icon" className="w-14 h-14 opacity-90" />
              </div>

              {/* Main Typography Artwork */}
              <img
                src="/fonts/CREATIVITYMAKESSS-01.svg"
                alt="Creativity Makes Anything Possible"
                className="relative z-30 w-[90%] h-[90%] object-contain transition-transform duration-1000 group-hover:scale-[1.03]"
              />
            </Link>
          </div>

        </div>

      </section>

      {showProjects && (
        <div className="fixed inset-0 z-[80] overflow-y-auto">
          <Projects />
        </div>
      )}
    </>
  );
};
