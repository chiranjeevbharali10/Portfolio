import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const ReadyTransition = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const circleRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // We create a timeline pinned to this section
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top top",
        end: "+=150%", // Scroll distance to complete the animation
        scrub: 1,
        pin: true,
        anticipatePin: 1,
      }
    });

    // 1. Expand the circle to cover the screen
    tl.to(circleRef.current, {
      scale: 50, // 100px * 50 = 5000px diameter, easily covers 4k screens
      ease: "power2.inOut",
      duration: 2,
    });

    // 2. Fade in the text AFTER the circle expands
    tl.fromTo(textRef.current, {
      opacity: 0,
      y: 50,
    }, {
      opacity: 1,
      y: 0,
      ease: "power3.out",
      duration: 1,
    });

  }, { scope: sectionRef });

  return (
    <section 
      ref={sectionRef} 
      className="relative w-full h-screen bg-[#050505] flex flex-col items-center justify-center overflow-hidden z-20"
    >
      
      {/* Expanding Portal Circle */}
      <div 
        ref={circleRef}
        className="absolute w-[100px] h-[100px] rounded-full bg-[#35fe5d] z-10 will-change-transform"
        style={{ transform: 'scale(0)' }}
      ></div>

      {/* Typography Lockup */}
      <div 
        ref={textRef}
        className="relative z-20 flex flex-col items-center justify-center opacity-0 pointer-events-none w-full max-w-5xl px-6"
      >
        <div className="relative w-full flex justify-center">
          
          {/* Main Typography SVG */}
          <img 
            src="/fonts/GROW-WITH-THE-FLOW.svg" 
            alt="Grow with the flow" 
            className="w-full h-auto object-contain z-10 relative brightness-0"
          />

          {/* Top Right Stars (3 times) */}
          <div className="absolute -top-[25%] right-[5%] flex gap-1 sm:gap-2 z-20">
            <img src="/fonts/star-01.svg" alt="" className="w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 object-contain brightness-0" />
            <img src="/fonts/star-01.svg" alt="" className="w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 object-contain brightness-0" />
            <img src="/fonts/star-01.svg" alt="" className="w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 object-contain brightness-0" />
          </div>

          {/* Bottom Left Balls & Arrow */}
          <img 
            src="/fonts/balls-01.svg" 
            alt="" 
            className="absolute -bottom-[25%] left-[5%] w-[25%] sm:w-[20%] md:w-[18%] h-auto z-20 brightness-0"
          />

        </div>
      </div>

    </section>
  );
};
