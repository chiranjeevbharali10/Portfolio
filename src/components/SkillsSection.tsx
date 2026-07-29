import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const skillsData = [
  {
    title: "Creative Engineering",
    desc: "Where design meets technology. I create immersive digital experiences by combining creative direction, motion, and modern frontend engineering.",
    skills: ["React / Next.js", "GSAP Animation", "Three.js", "WebGL", "Creative Coding", "Motion Design"],
    bgColor: "bg-[#B3A4FF]",
    textColor: "text-[#1a1a1a]",
    imageClass: "bg-black/10"
  },
  {
    title: "Backend",
    desc: "Building scalable backend architectures that power reliable and intelligent digital products.",
    skills: ["Java", "Spring Boot", "FastAPI", "REST APIs", "WebSockets", "PostgreSQL", "JWT Authentication"],
    bgColor: "bg-white",
    textColor: "text-[#1a1a1a]",
    imageClass: "bg-black/5"
  },
  {
    title: "Infrastructure",
    desc: "Engineering production-ready systems with optimized deployment, monitoring, and scalable infrastructure.",
    skills: ["Linux", "Docker", "Nginx", "CI/CD", "Prometheus", "Grafana", "Cloud Deployment"],
    bgColor: "bg-[#FFD54F]",
    textColor: "text-[#1a1a1a]",
    imageClass: "bg-black/10"
  },
  {
    title: "Artificial Intelligence",
    desc: "Exploring the intersection of artificial intelligence, machine learning, and software engineering.",
    skills: ["PyTorch", "TensorFlow", "Computer Vision", "LLMs", "vLLM", "Model Deployment", "Machine Learning"],
    bgColor: "bg-[#1a1a1a]",
    textColor: "text-white",
    imageClass: "bg-white/10"
  }
];

export const SkillsSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(() => {
    if (!containerRef.current || cardsRef.current.length === 0) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: `+=${skillsData.length * 100}%`, // Scroll duration proportional to number of cards
        scrub: 1.5, // Added smoothing to make it very smooth
        pin: true,
      }
    });

    // The first card (index 0) is already visible at y: 0.
    // For each subsequent card, we animate it up, and move older cards.
    cardsRef.current.forEach((card, index) => {
      if (index === 0) return; // Skip the first card
      
      // The new card slides up to become the active offset card
      tl.to(card, {
        y: "28vh", // Increased offset to leave a clear gap between the heading and the next card
        ease: "none"
      }, index - 1);

      // The previous card moves up slightly to 0vh to become the background tab
      if (index - 1 > 0) {
        tl.to(cardsRef.current[index - 1], {
          y: "0vh",
          ease: "none"
        }, index - 1);
      }

      // The card before that (index - 2) moves completely off-screen (disappears)
      if (index - 2 >= 0) {
        tl.to(cardsRef.current[index - 2], {
          y: "-100vh",
          ease: "none"
        }, index - 1);
      }
    });

  }, { scope: containerRef });

  return (
    <>

      <div ref={containerRef} className="h-screen w-full relative overflow-hidden">
        {skillsData.map((data, index) => (
        <div
          key={index}
          ref={el => { cardsRef.current[index] = el; }}
          className={`absolute inset-0 w-full h-full flex flex-col pt-8 md:pt-12 lg:pt-16 px-2 md:px-4 lg:px-6 ${data.bgColor} ${data.textColor}`}
          style={{ 
            zIndex: index, 
            transform: index === 0 ? "translateY(0%)" : "translateY(100%)",
            boxShadow: "none" 
          }}
        >
          {/* Full-width Top Heading */}
          <h2 className="font-armin font-semibold text-[12vw] md:text-[9vw] lg:text-[7vw] leading-[0.85] tracking-tighter whitespace-nowrap mb-12 md:mb-16 lg:mb-20 shrink-0">
            {data.title}
          </h2>

          {/* Main Content Area - 3 Column Layout */}
          <div className="flex flex-col lg:flex-row w-full h-full gap-8 lg:gap-12 justify-between pb-8 lg:pb-16 flex-1 min-h-0">
            
            {/* Left Column: Description */}
            <div className="w-full lg:w-[30%] flex flex-col h-full">
              <p className="font-kefir text-lg md:text-xl lg:text-2xl leading-relaxed opacity-80 max-w-md pt-2">
                {data.desc}
              </p>
            </div>

            {/* Middle Column: Skills List */}
            <div className="w-full lg:w-[35%] flex flex-col gap-2 lg:gap-3 overflow-y-auto pr-4 scrollbar-hide pt-2">
              {data.skills.map((skill, i) => (
                <div key={i} className="group flex items-center">
                  <h3 className="font-instrument text-[2rem] md:text-4xl lg:text-[2.75rem] cursor-default opacity-75 transition-all duration-500 ease-out group-hover:opacity-100 group-hover:italic group-hover:translate-x-4 origin-left leading-tight">
                    {skill}
                  </h3>
                </div>
              ))}
            </div>

            {/* Right Column: Media Showcase */}
            <div className="hidden lg:flex w-full lg:w-[35%] h-full pb-8">
              <div className={`w-full h-full max-h-[50vh] lg:max-h-[60vh] rounded-[2rem] ${data.imageClass} flex items-center justify-center overflow-hidden relative backdrop-blur-md group transition-all duration-700 hover:scale-[1.02]`}>
                <span className="font-kefir text-sm opacity-40 absolute uppercase tracking-[0.2em] group-hover:opacity-80 transition-opacity duration-500">
                  Visual Showcase
                </span>
                
                {/* Subtle corner accents */}
                <div className="absolute top-6 left-6 w-2 h-2 rounded-full border border-current opacity-30"></div>
                <div className="absolute bottom-6 right-6 w-2 h-2 rounded-full border border-current opacity-30"></div>
              </div>
            </div>

          </div>
        </div>
      ))}
      </div>
    </>
  );
};

