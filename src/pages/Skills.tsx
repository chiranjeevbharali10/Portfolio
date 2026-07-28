import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { type LucideIcon, Code2, LayoutTemplate, Server, BrainCircuit, CloudCog, Database, PenTool, Wrench } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const icons: Record<string, LucideIcon> = {
  languages: Code2,
  frontend: LayoutTemplate,
  backend: Server,
  aiml: BrainCircuit,
  devops: CloudCog,
  databases: Database,
  design: PenTool,
  tools: Wrench
};

const skillCategories = [
  { id: 'languages', title: "Languages", primary: ["TypeScript", "Python", "C++"], secondary: ["JavaScript", "HTML5", "CSS3", "GraphQL", "SQL"] },
  { id: 'frontend', title: "Frontend", primary: ["React", "Next.js", "GSAP", "Three.js"], secondary: ["Vue", "TailwindCSS", "Redux", "Zustand"] },
  { id: 'backend', title: "Backend", primary: ["Node.js", "FastAPI", "PostgreSQL"], secondary: ["Express", "Django", "MongoDB", "Redis", "WebSockets"] },
  { id: 'aiml', title: "AI & ML", primary: ["PyTorch", "LLMs", "RAG"], secondary: ["TensorFlow", "OpenAI API", "LangChain", "HuggingFace"] },
  { id: 'devops', title: "DevOps", primary: ["Docker", "Kubernetes", "AWS"], secondary: ["CI/CD", "GitHub Actions", "Vercel", "Linux"] },
  { id: 'databases', title: "Databases", primary: ["PostgreSQL", "MongoDB", "Redis"], secondary: ["MySQL", "DynamoDB", "Supabase", "Prisma"] },
  { id: 'design', title: "Creative", primary: ["Figma", "GSAP", "Motion Design"], secondary: ["Photoshop", "Illustrator", "UI/UX Design", "SVG Animation"] },
  { id: 'tools', title: "Tools", primary: ["Git", "VS Code", "Linux"], secondary: ["Postman", "Webpack", "Vite", "Cursor"] }
];

const LETTERS = ['S', 'K', 'I', 'L', 'L', 'S'];
const ROW_SPEEDS = [0.4, 0.2, 0.4, 0.2, 0.4, 0.2]; // Slower speed multipliers for rolling marquee
const NUM_COLUMNS = 24; // Form a complete 360-degree circle
const CENTER_INDEX = 12;
const RADIUS = 420; // Z-distance to push letters out to form the circle

export const Skills = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const typoWallRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const centerPillBgRef = useRef<HTMLDivElement>(null);
  const cardsTrackRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!containerRef.current || !typoWallRef.current || !cardsTrackRef.current) return;

    // Reset initial states
    gsap.set('.letter-wrapper', {
      rotationY: 0,
      x: 0, rotationX: 0, rotationZ: 0
    });
    gsap.set('.shadow-text', {
      z: 0,
      textShadow: "0px 0px 0px rgba(0,0,0,0)",
      opacity: (idx) => (idx % NUM_COLUMNS) === CENTER_INDEX ? 1 : 0 // Start with just the front center pillar
    });
    
    gsap.set(centerPillBgRef.current, { opacity: 1, scale: 1 });
    gsap.set(typoWallRef.current, { scale: 1, z: 0, opacity: 1, x: 0, y: 0 });
    gsap.set(cardsTrackRef.current, { x: window.innerWidth }); // Start off-screen right

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "+=6000", // Cinematic length
        scrub: 1,
        pin: true,
        invalidateOnRefresh: true
      }
    });

    // --- INITIAL PAUSE (0 - 0.5s) ---
    tl.to({}, { duration: 0.5 }); 

    // --- PHASE 2: MULTIPLICATION & CYLINDER FORMATION (0.5 - 2.5) ---
    
    // Rotate the wrappers to fan out into a perfect circle
    tl.to('.letter-wrapper', {
      rotationY: (idx) => {
        const colIndex = idx % NUM_COLUMNS;
        return (CENTER_INDEX - colIndex) * 15; // Left columns rotate positive (inward) for concave curve
      },
      duration: 2,
      ease: "power2.inOut"
    }, 0.5);

    // Push letters backwards to define the radius of the circle, fading them in and applying block shadow
    tl.to('.shadow-text', {
      z: -RADIUS, 
      textShadow: "1px 1px 0 #7a001a, 2px 2px 0 #7a001a, 3px 3px 0 #7a001a, 4px 4px 0 #7a001a, 5px 5px 0 #7a001a, 6px 6px 0 #7a001a, 7px 7px 0 #7a001a, 8px 8px 0 #7a001a, 9px 9px 0 #7a001a",
      opacity: 1,
      duration: 2,
      ease: "power2.inOut"
    }, 0.5);

    // Push the entire wall forward by RADIUS.
    // This perfectly cancels out the z:-RADIUS of the frontmost letters (the center ones),
    // causing them to remain perfectly aligned at world z=0 with the static background pill!
    tl.to(typoWallRef.current, {
      z: RADIUS,
      duration: 2,
      ease: "power2.inOut"
    }, 0.5);

    // Fade out the center background pill
    tl.to(centerPillBgRef.current, {
      opacity: 0,
      scale: 0.9,
      duration: 1,
      ease: "power2.out"
    }, 0.8);

    // Transition grid to dark
    tl.to(containerRef.current, {
      "--bg-color": "#050505",
      "--grid-color": "rgba(255, 0, 60, 0.15)",
      duration: 1.5,
      ease: "power2.inOut"
    }, 0.8);

    // --- PHASE 4: DELIBERATE HORIZONTAL SCROLL & MARQUEE ROLL (4 - 9.5) ---
    const getTrackScrollWidth = () => cardsTrackRef.current ? cardsTrackRef.current.scrollWidth : 0;
    
    // Cards scroll across screen
    tl.to(cardsTrackRef.current, {
      x: () => -(getTrackScrollWidth() - window.innerWidth + window.innerWidth * 0.1),
      duration: 5.5,
      ease: "none"
    }, 3.5);

    // Roll the typography rows seamlessly around the cylinder independently at different speeds
    rowRefs.current.forEach((row, idx) => {
      if (!row) return;
      tl.to(row, {
        rotationY: `-=${360 * ROW_SPEEDS[idx]}`, // Negative Y rotation moves front-facing letters to the left
        duration: 5.5,
        ease: "none"
      }, 3.5);
    });

    // --- PHASE 5: FADE OUT INTO GRID (9 - 10.5) ---
    tl.to(typoWallRef.current, {
      opacity: 0,
      duration: 1.5,
      ease: "power1.inOut"
    }, 9);

    tl.to(cardsTrackRef.current, {
      opacity: 0,
      duration: 1,
      ease: "power1.inOut"
    }, 9.5);

  }, { scope: containerRef });

  return (
    <section 
      ref={containerRef} 
      className="relative w-full h-screen overflow-hidden skills-grid transition-colors"
      style={{ 
        backgroundColor: "var(--bg-color)", 
        "--bg-color": "#ff003c", 
        "--grid-color": "rgba(0, 0, 0, 0.6)" 
      } as React.CSSProperties}
    >
      
      {/* 3D Context for the Typography Cylinder */}
      <div className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none" style={{ perspective: "800px" }}>
        
        {/* The Static Pill (Placed here so it sits independently at world z=0 behind the text) */}
        <div 
          ref={centerPillBgRef}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[160px] md:w-[220px] h-[650px] md:h-[850px] rounded-[999px] flex items-center justify-center pointer-events-none z-0"
          style={{
            boxShadow: "0 40px 100px rgba(0,0,0,0.6)",
            border: "2px solid rgba(0,0,0,0.5)", 
            padding: "6px", 
            background: "transparent"
          }}
        >
          <div 
            className="w-full h-full rounded-[999px] relative overflow-hidden"
            style={{
              background: "#050505", 
              border: "1px solid rgba(255,0,60,0.3)" 
            }}
          >
            <div 
              className="absolute inset-0 opacity-[0.6]"
              style={{
                backgroundImage: "radial-gradient(#ff003c 1.5px, transparent 1.5px)",
                backgroundSize: "24px 24px",
                backgroundPosition: "center center"
              }}
            />
          </div>
        </div>

        {/* The Typography Wall (Structured as rows to allow independent horizontal marquee rolling) */}
        <div ref={typoWallRef} className="absolute inset-0 flex flex-col items-center justify-center w-full h-full z-10" style={{ transformStyle: "preserve-3d" }}>
          
          {LETTERS.map((letter, rowIdx) => (
            <div 
              key={`row-${rowIdx}`}
              ref={(el) => { rowRefs.current[rowIdx] = el; }}
              className="relative flex items-center justify-center w-full h-[110px] md:h-[135px]"
              style={{ transformStyle: "preserve-3d" }}
            >
              {Array.from({ length: NUM_COLUMNS }).map((_, colIdx) => (
                <div 
                  key={`col-${colIdx}`}
                  className="absolute inset-0 flex items-center justify-center letter-wrapper"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <span className="font-['Anton'] text-[90px] md:text-[130px] leading-none tracking-tight uppercase text-[#ff003c] scale-x-[1.5] shadow-text">
                    {letter}
                  </span>
                </div>
              ))}
            </div>
          ))}
          
        </div>
      </div>

      {/* --- CARDS FOREGROUND LAYER --- */}
      <div className="absolute inset-0 w-full h-full flex items-center pointer-events-none z-50 overflow-visible">
        <div 
          ref={cardsTrackRef}
          className="flex flex-nowrap items-center px-12 md:px-[20vw] gap-12 md:gap-24 w-max h-full"
        >
          {skillCategories.map((cat, i) => {
            const Icon = icons[cat.id];
            const yOffset = i % 2 === 0 ? '-40px' : '40px';
            
            return (
              <div 
                key={`card-${i}`}
                className="relative shrink-0 w-[300px] md:w-[420px] bg-[#0c0c0c]/80 backdrop-blur-xl border border-white/10 rounded-[24px] p-8 md:p-10 flex flex-col justify-between pointer-events-auto transition-colors duration-500 hover:border-white/30 hover:bg-[#111]/90"
                style={{ transform: `translateY(${yOffset})` }}
              >
                <Icon className="absolute -right-8 -bottom-8 w-64 h-64 text-white/[0.02] transition-colors duration-500 pointer-events-none" />
                
                <div className="relative z-10 pointer-events-none">
                  <Icon className="w-8 h-8 text-[#ff003c]/60 mb-6" />
                  <h3 className="font-podium text-3xl md:text-4xl text-white tracking-wider uppercase drop-shadow-md">
                    {cat.title}
                  </h3>
                  
                  <div className="font-inter leading-relaxed mt-6">
                    <div className="text-white/90 font-medium text-base md:text-lg leading-loose">
                      {cat.primary.join(" • ")}
                    </div>
                    <div className="text-white/40 text-sm mt-2 leading-loose">
                      {cat.secondary.join(" • ")}
                    </div>
                  </div>
                </div>

                <div className="relative z-10 mt-12 font-inter text-xs text-[#ff003c]/50 uppercase tracking-widest border-t border-white/5 pt-5 pointer-events-none">
                  {cat.primary.length + cat.secondary.length} Technologies
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </section>
  );
};
