import React, { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

export const RippleBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Base colors requested by user
  const colorPrimary = '#FF7A2F'; // Orange
  const colorSecondary = '#EE8EAC'; // Pink

  const numRipples = 8; 
  // 8 ripples staggered by 3.5 seconds = 28s total loop
  
  useGSAP(() => {
    const ripples = gsap.utils.toArray('.water-ripple') as Element[];
    
    // We maintain a global z-index that increments whenever a ripple restarts,
    // ensuring the newest ripple is ALWAYS drawn on top of the older massive ones.
    let currentZ = 10;
    
    ripples.forEach((ripple, i) => {
        // Initial setup
        gsap.set(ripple, { 
            scale: 0, 
            opacity: 0, 
            xPercent: -50, 
            yPercent: -50,
            zIndex: currentZ + i
        });
        
        const tl = gsap.timeline({ 
            repeat: -1, 
            delay: i * 3.5,
            onRepeat: () => {
                // When this ripple restarts from the center, put it on top!
                currentZ += numRipples;
                gsap.set(ripple, { zIndex: currentZ + i });
            }
        });
        
        // Quick fade in as it emerges from the center
        tl.to(ripple, {
            opacity: 1,
            duration: 1.5, 
            ease: "none"
        }, 0);
        
        // Massive, extremely slow expansion
        tl.to(ripple, {
            scale: 6, 
            duration: 28, 
            ease: "power1.inOut" 
        }, 0);
        
        // Fade out very slowly at the extreme edge so it seamlessly disappears
        tl.to(ripple, {
            opacity: 0,
            duration: 6, 
            ease: "none"
        }, 22);
    });
  }, { scope: containerRef });

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 w-full h-full overflow-hidden z-0 pointer-events-none"
      style={{ backgroundColor: colorPrimary }}
    >
      {/* Organic noise overlay to blend the colors together slightly */}
      <div 
        className="absolute inset-0 z-[9999] opacity-[0.04] mix-blend-overlay pointer-events-none"
        style={{ 
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' 
        }}
      />
      
      {/* 
        Massive Concentric Color Regions 
      */}
      {[...Array(numRipples)].map((_, i) => {
        const isPrimary = i % 2 === 0;
        const color = isPrimary ? colorSecondary : colorPrimary;
        
        return (
            <div 
              key={i}
              className="water-ripple absolute top-1/2 left-1/2 w-[100vw] h-[100vw] sm:w-[50vw] sm:h-[50vw] rounded-full"
              style={{ 
                transformOrigin: 'center center',
                background: `radial-gradient(
                  circle,
                  ${color} 0%,
                  ${color} 45%,
                  transparent 75%
                )`
              }}
            />
        );
      })}
      
    </div>
  );
};
