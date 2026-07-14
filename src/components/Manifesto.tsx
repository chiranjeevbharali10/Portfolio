import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const Manifesto = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Calculate total horizontal scroll distance based on container width vs viewport
    const scrollWidth = containerRef.current!.scrollWidth - window.innerWidth;

    // Pin the section and scroll the container horizontally
    const scrollTween = gsap.to(containerRef.current, {
      x: -scrollWidth,
      ease: "none",
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top top",
        end: () => `+=${scrollWidth}`,
        scrub: 1,
        pin: true,
      }
    });
    
    // Progressively reveal each word as it enters the viewport
    const words = gsap.utils.toArray<HTMLElement>('.manifesto-word');
    words.forEach((word) => {
      gsap.fromTo(word,
        { color: "rgba(245, 243, 232, 0.05)", y: 30 },
        {
          color: "rgba(245, 243, 232, 1)",
          y: 0,
          ease: "power3.out",
          scrollTrigger: {
            trigger: word,
            containerAnimation: scrollTween,
            start: "left 85%", // Trigger when word is 85% from the left of the viewport
            end: "left 40%",
            scrub: true
          }
        }
      );
    });

  }, { scope: sectionRef });

  const renderWords = (text: string) => {
    return text.split(' ').map((word, i) => (
      <span key={i} className="manifesto-word inline-block mr-[2vw] transition-colors duration-300">{word}</span>
    ));
  };

  return (
    <section ref={sectionRef} className="relative h-screen w-full bg-background/50 border-t border-primary/10 overflow-hidden flex items-center z-20">
      <div 
        ref={containerRef}
        className="flex items-center w-[max-content] h-full"
      >
        {/* Intro space to allow scrolling to start before text appears */}
        <div className="w-[100vw] shrink-0"></div>
        
        {/* First Phrase Block */}
        <div className="flex flex-col font-inter text-[clamp(3rem,8vw,10rem)] font-light leading-[1.05] tracking-tight text-primary whitespace-nowrap">
          <div className="flex">{renderWords("design is not just")}</div>
          <div className="flex">{renderWords("what it looks like")}</div>
          <div className="flex">{renderWords("and feels like.")}</div>
        </div>
        
        {/* Minimalist editorial separator between phrases */}
        <div className="w-[30vw] shrink-0 flex items-center justify-center">
           <div className="w-24 h-[1px] bg-primary/20"></div>
        </div>

        {/* Second Phrase Block */}
        <div className="flex flex-col font-inter text-[clamp(3rem,8vw,10rem)] font-light leading-[1.05] tracking-tight text-primary whitespace-nowrap">
          <div className="flex">{renderWords("design is how")}</div>
          <div className="flex">{renderWords("it works.")}</div>
        </div>

        {/* Outro space to center the final phrase perfectly before unpinning */}
        <div className="w-[60vw] shrink-0"></div>
      </div>
    </section>
  );
};
