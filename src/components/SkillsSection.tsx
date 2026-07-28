import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const skillsData = [
  {
    title: "Creative Engineering",
    desc: "It's the core of my digital identity. I bridge the gap between design and logic, ensuring a seamless, high-performance interactive experience.",
    skills: ["React & Next.js", "GSAP Animations", "Three.js & WebGL", "Creative Coding"],
    bgColor: "bg-[#B3A4FF]",
    textColor: "text-[#1a1a1a]",
    imageClass: "bg-black/10" // placeholder
  },
  {
    title: "Visual Identity",
    desc: "Visual identity is the unique visual language of your brand, creating memorable impressions and emotional connections with your audience.",
    skills: ["Logotype & Typography", "Visual Language", "Art Direction", "Motion Design"],
    bgColor: "bg-white",
    textColor: "text-[#1a1a1a]",
    imageClass: "bg-black/5"
  },
  {
    title: "Product Design",
    desc: "Our product design services focus on creating intuitive and aesthetically pleasing products that resonate with users and elevate your brand.",
    skills: ["UX Design", "User Testing", "Prototyping", "UI Design"],
    bgColor: "bg-[#FFD54F]",
    textColor: "text-[#1a1a1a]",
    imageClass: "bg-black/10"
  },
  {
    title: "Web Architecture",
    desc: "A beautiful site means nothing if it doesn't load. I architect scalable, maintainable, and blisteringly fast frontends.",
    skills: ["Performance Optimization", "SEO Best Practices", "Accessibility (a11y)", "System Architecture"],
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
        y: "35vh", // Leaves 35vh of the previous card visible (heading)
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
      {/* Pink Tab that scrolls away */}
      <div className="w-full bg-[#ffcce0] pt-24 pb-8 px-8 md:px-16 lg:px-24 flex items-end">
        <h1 className="font-armin text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-[#1a1a1a]">
          Skills
        </h1>
      </div>

      <div ref={containerRef} className="h-screen w-full relative overflow-hidden">
        {skillsData.map((data, index) => (
        <div
          key={index}
          ref={el => { cardsRef.current[index] = el; }}
          className={`absolute inset-0 w-full h-full flex flex-col pt-24 md:pt-32 px-8 md:px-16 lg:px-24 ${data.bgColor} ${data.textColor}`}
          style={{ 
            zIndex: index, 
            transform: index === 0 ? "translateY(0%)" : "translateY(100%)",
            boxShadow: index > 0 ? "0 -20px 40px rgba(0,0,0,0.1)" : "none" 
          }}
        >
          {/* Huge Heading (Full Width) */}
          <h2 className="font-armin text-[12vw] md:text-[9vw] lg:text-[8vw] font-semibold tracking-tighter leading-[0.9] mb-8 lg:mb-12">
            {data.title}
          </h2>

          {/* Main Content Area */}
          <div className="flex flex-col lg:flex-row w-full h-full gap-8 lg:gap-12">
            
            {/* Left Side (Text & Lists) */}
            <div className="w-full lg:w-1/2 flex flex-col h-full">
              {/* Content that gets hidden by the next card */}
              <div className="flex flex-col md:flex-row gap-8 md:gap-12">
                <p className="font-inter text-lg md:text-xl leading-snug font-medium opacity-80 max-w-sm">
                  {data.desc}
                </p>
                <div className="flex flex-col gap-1 opacity-80 text-sm md:text-base font-medium">
                  {data.skills.map((skill, i) => (
                    <span key={i}>{skill}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Side (Image/Video Placeholder) */}
            <div className="hidden lg:flex w-full lg:w-1/2 h-full pb-32">
              <div className={`w-full h-full max-h-[40vh] rounded-2xl ${data.imageClass} flex items-center justify-center overflow-hidden relative backdrop-blur-sm`}>
                <span className="font-inter text-sm opacity-50 absolute">Media Placeholder</span>
              </div>
            </div>

          </div>
        </div>
      ))}
      </div>
    </>
  );
};
