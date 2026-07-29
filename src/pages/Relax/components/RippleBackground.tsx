import React, { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { WebGLNoise } from './WebGLNoise';

export const THEME_COLORS = [
  { primary: '#FF7A2F', secondary: '#EE8EAC' }, // 0: Orange/Pink
  { primary: '#2596be', secondary: '#e68dbb' }, // 1: Blue/Blue (User requested)
  { primary: '#9d4edd', secondary: '#c77dff' }, // 2: Purple/Violet
  { primary: '#ffb703', secondary: '#fb8500' }  // 3: Golden/Orange
];

export const RippleBackground: React.FC<{ activeIndex: number }> = ({ activeIndex }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const timelinesRef = useRef<gsap.core.Timeline[]>([]);
  const [currentColorIndex, setCurrentColorIndex] = useState(activeIndex);

  // The background crossfades immediately to the target color
  const targetColors = THEME_COLORS[activeIndex] || THEME_COLORS[0];

  // The rings keep their old color while sucking in, then update when they respawn
  const currentColors = THEME_COLORS[currentColorIndex] || THEME_COLORS[0];
  const colorSecondary = currentColors.secondary;

  const numRipples = 3; // 3 rings creates a perfect continuous flow (beginning, middle, end)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        containerRef.current.style.setProperty('--mouse-x', `${e.clientX}px`);
        containerRef.current.style.setProperty('--mouse-y', `${e.clientY}px`);
      }
    };

    const handleMouseLeave = () => {
      if (containerRef.current) {
        containerRef.current.style.setProperty('--mouse-x', `-9999px`);
        containerRef.current.style.setProperty('--mouse-y', `-9999px`);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.body.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.body.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // 1. SUCK-IN ANIMATION
  useGSAP(() => {
    if (activeIndex !== currentColorIndex) {
      timelinesRef.current.forEach(tl => tl.kill());
      timelinesRef.current = [];

      gsap.to('.water-ripple-base, .water-ripple-distorted', {
        scale: 0,
        opacity: 0,
        duration: 0.6,
        ease: "power3.in",
        onComplete: () => {
          setCurrentColorIndex(activeIndex);
        }
      });
    }
  }, [activeIndex]);

  // 2. MAIN RING SPAWN LOOP
  useGSAP(() => {
    if (activeIndex !== currentColorIndex) return;
    if (!containerRef.current) return;

    const ripplesBase = gsap.utils.toArray('.water-ripple-base') as HTMLElement[];
    const ripplesDistorted = gsap.utils.toArray('.water-ripple-distorted') as HTMLElement[];

    let currentZ = 100;
    timelinesRef.current = [];

    ripplesBase.forEach((baseRipple, i) => {
      const distortedRipple = ripplesDistorted[i];
      const elements = [baseRipple, distortedRipple];

      gsap.set(elements, {
        scale: 0.2,
        opacity: 0,
        xPercent: -50,
        yPercent: -50,
        zIndex: currentZ + (numRipples - i)
      });

      const tl = gsap.timeline({
        repeat: -1,
        // 12 seconds total duration / 3 rings = exactly 4 seconds perfectly evenly spaced!
        delay: i * 4,
        onRepeat: () => {
          currentZ += numRipples;
          gsap.set(elements, { zIndex: currentZ + (numRipples - i) });
        }
      });

      tl.to(elements, {
        opacity: 1,
        duration: 1.5,
        ease: "none"
      }, 0);

      tl.to(elements, {
        scale: 4.2,
        duration: 12, // Slowed down slightly to 12s so there are always 3 rings on screen
        ease: "none" // Linear flow like water
      }, 0);

      tl.to(elements, {
        opacity: 0,
        duration: 4,
        ease: "none"
      }, 8); // Fades out smoothly from 8s to 12s

      // Removed the tl.time() jump so they spawn naturally from the center

      timelinesRef.current.push(tl);
    });
  }, { scope: containerRef, dependencies: [currentColorIndex, activeIndex] });

  // 8x scale forces the element to 15,000 pixels wide, which breaks the GPU and causes severe flickering!
  // By keeping it at 70%, it only has to scale 4x, which completely fixes the flickering!
  const RING_INNER_STOP = "70%";
  const RING_SOLID_EDGE = "70.5%"; // Tighter gap (0.5%) for a much sharper inner edge
  const RING_FADE_OUT = "100%";     // Tighter gap (10%) for a much sharper outer edge

  const renderRipples = (className: string) => (
    [...Array(numRipples)].map((_, i) => (
      <div
        key={i}
        className={`${className} absolute top-1/2 left-1/2 w-[100vw] h-[100vw] sm:w-[50vw] sm:h-[50vw] rounded-full will-change-transform`}
        style={{
          transformOrigin: 'center center',
          background: `radial-gradient(
              circle closest-side,
              transparent 0%,
              transparent ${RING_INNER_STOP},
              ${colorSecondary} ${RING_SOLID_EDGE},
              ${colorSecondary}00 ${RING_FADE_OUT}
            )`
        }}
      />
    ))
  );

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-full h-full overflow-hidden z-0 pointer-events-none transition-colors duration-1000"
      style={{ backgroundColor: targetColors.primary }}
    >
      <svg className="fixed w-0 h-0 pointer-events-none opacity-0">
        <defs>
          <filter id="liquid-distortion" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.006"
              numOctaves="2"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="50"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      {/* LAYER 1: BASE UNDISTORTED GEOMETRIC RIPPLES */}
      <div className="absolute inset-0 w-full h-full">
        {renderRipples('water-ripple-base')}
      </div>

      {/* LAYER 2: DISTORTED LIQUID RIPPLES (MASKED BY MOUSE) */}
      <div
        className="absolute inset-0 w-full h-full z-10 will-change-transform"
        style={{
          WebkitMaskImage: `radial-gradient(circle 350px at var(--mouse-x, -1000px) var(--mouse-y, -1000px), black 0%, rgba(0,0,0,0.5) 40%, transparent 100%)`,
          maskImage: `radial-gradient(circle 350px at var(--mouse-x, -1000px) var(--mouse-y, -1000px), black 0%, rgba(0,0,0,0.5) 40%, transparent 100%)`
        }}
      >
        <div className="absolute inset-0 w-full h-full" style={{ filter: 'url(#liquid-distortion)' }}>
          {renderRipples('water-ripple-distorted')}
        </div>
      </div>

      {/* LAYER 3: HIGH-END WEBGL NOISE OVERLAY */}
      {/* 
        You can manually increase the noisiness by changing the opacity here.
        0.1 = subtle, 0.3 = medium, 0.6 = intense film grain.
      */}
      <WebGLNoise opacity={0.15} />

    </div>
  );
};
