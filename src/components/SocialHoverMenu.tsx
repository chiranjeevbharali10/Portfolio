import { useRef } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

export default function SocialHoverMenu() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);
  const circleRef = useRef<HTMLDivElement>(null);
  const menuTextRef = useRef<HTMLDivElement>(null);
  const linksTextRef = useRef<HTMLDivElement>(null);
  const arrowLeftRef = useRef<SVGSVGElement>(null);
  const arrowRightRef = useRef<SVGSVGElement>(null);

  const { contextSafe } = useGSAP({ scope: containerRef });

  const handleMouseEnter = contextSafe(() => {
    // Expand pill and move it flush to the right edge (x: 0)
    gsap.to(pillRef.current, {
      width: 300, 
      x: 0,       
      duration: 0.6,
      ease: "power3.out"
    });

    // Move circle to the left of the expanded pill (-300px pill - 8px gap)
    gsap.to(circleRef.current, {
      x: -308,       
      duration: 0.6,
      ease: "power3.out"
    });

    // Crossfade text
    gsap.to(menuTextRef.current, { opacity: 0, duration: 0.2 });
    gsap.to(linksTextRef.current, { opacity: 1, duration: 0.3, delay: 0.15 });

    // Flip arrows
    gsap.to(arrowLeftRef.current, { opacity: 0, rotation: 90, scale: 0.5, duration: 0.3 });
    gsap.to(arrowRightRef.current, { opacity: 1, rotation: 0, scale: 1, duration: 0.3, delay: 0.1 });
  });

  const handleMouseLeave = contextSafe(() => {
    // Revert pill width and position (-48px circle - 8px gap = -56)
    gsap.to(pillRef.current, {
      width: 100, // Original width
      x: -56,     
      duration: 0.6,
      ease: "power3.out"
    });

    // Revert circle to the right edge
    gsap.to(circleRef.current, {
      x: 0,     
      duration: 0.6,
      ease: "power3.out"
    });

    // Crossfade text
    gsap.to(linksTextRef.current, { opacity: 0, duration: 0.2 });
    gsap.to(menuTextRef.current, { opacity: 1, duration: 0.3, delay: 0.15 });

    // Flip arrows
    gsap.to(arrowRightRef.current, { opacity: 0, rotation: -90, scale: 0.5, duration: 0.3 });
    gsap.to(arrowLeftRef.current, { opacity: 1, rotation: 0, scale: 1, duration: 0.3, delay: 0.1 });
  });

  return (
    <div 
      ref={containerRef}
      className="relative h-12 w-[356px] flex items-center cursor-pointer pointer-events-auto group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Pink Dot Hover indicator (Optional based on image 1) */}
      <div className="absolute -left-8 w-3 h-3 bg-pink rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Expanding Pill */}
      <div 
        ref={pillRef}
        className="absolute top-0 right-0 h-12 bg-white rounded-full flex items-center overflow-hidden shadow-sm text-black"
        style={{ width: '100px', transform: 'translateX(-56px)' }}
      >
        <div ref={menuTextRef} className="absolute inset-0 flex items-center justify-center font-medium font-inter text-[15px]">
          Menu
        </div>
        <div ref={linksTextRef} className="absolute inset-0 flex items-center justify-center gap-6 font-medium font-inter opacity-0 whitespace-nowrap text-[15px] group/links">
          <a href="https://github.com" target="_blank" rel="noreferrer" className="text-black transition-colors duration-300 group-hover/links:text-gray-300 hover:!text-black">GitHub</a>
          <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="text-black transition-colors duration-300 group-hover/links:text-gray-300 hover:!text-black">LinkedIn</a>
          <a href="mailto:hello@example.com" className="text-black transition-colors duration-300 group-hover/links:text-gray-300 hover:!text-black">Email</a>
        </div>
      </div>

      {/* Circle Button */}
      <div 
        ref={circleRef}
        className="absolute top-0 right-0 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-black"
        style={{ transform: 'translateX(0px)' }}
      >
        <ArrowLeft ref={arrowLeftRef} className="absolute w-5 h-5 origin-center" />
        <ArrowRight ref={arrowRightRef} className="absolute w-5 h-5 opacity-0 origin-center" style={{ transform: 'rotate(-90deg) scale(0.5)' }} />
      </div>
    </div>
  );
}
