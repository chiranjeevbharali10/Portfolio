import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";

export const FloatingObjects = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Subtle parallax on mouse move for SVG elements
    const elements = gsap.utils.toArray<HTMLElement>(".parallax-element");
    
    const onMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const xPos = (clientX / window.innerWidth - 0.5) * 40;
      const yPos = (clientY / window.innerHeight - 0.5) * 40;

      gsap.to(elements, {
        x: `+=${xPos}`,
        y: `+=${yPos}`,
        duration: 1.5,
        ease: "power2.out",
        stagger: 0.01
      });
    };

    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      
      {/* Minimalist Graphic Design Poster Elements */}
      
      {/* Top Right: Technical Circle & Measurement */}
      <div className="parallax-element absolute top-[15%] right-[15%] flex flex-col items-center opacity-40">
        <svg width="120" height="120" viewBox="0 0 120 120" className="animate-[spin_20s_linear_infinite]">
          <circle cx="60" cy="60" r="58" fill="none" stroke="#F5F3E8" strokeWidth="0.5" strokeDasharray="4 4" />
          <circle cx="60" cy="60" r="40" fill="none" stroke="#F5F3E8" strokeWidth="0.5" />
          <line x1="60" y1="0" x2="60" y2="120" stroke="#F5F3E8" strokeWidth="0.5" />
          <line x1="0" y1="60" x2="120" y2="60" stroke="#F5F3E8" strokeWidth="0.5" />
        </svg>
        <div className="mt-2 font-inter text-[8px] tracking-widest uppercase text-primary/60">DIA: 120px / ROT: 20s</div>
      </div>

      {/* Bottom Left: Editorial Line & Grid Marks */}
      <div className="parallax-element absolute bottom-[15%] left-[5%] opacity-40 flex gap-4">
        <div className="w-[1px] h-32 bg-primary/30"></div>
        <div className="flex flex-col justify-between py-2">
          <div className="font-inter text-[8px] tracking-widest uppercase text-primary">+ Y-AXIS</div>
          <div className="font-inter text-[8px] tracking-widest uppercase text-primary">- Y-AXIS</div>
        </div>
      </div>


      
      {/* Right Side: Typography Fragment */}
      <div className="parallax-element absolute top-[40%] right-[5%] font-podium text-[20vh] text-primary/[0.02] leading-none pointer-events-none select-none" style={{ writingMode: 'vertical-rl' }}>
        SYSTEM
      </div>

    </div>
  );
};
