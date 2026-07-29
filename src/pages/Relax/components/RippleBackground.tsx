import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { WebGLNoise } from './WebGLNoise';

export const RippleBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Base colors requested by user
  const colorPrimary = '#FF7A2F'; // Orange
  const colorSecondary = '#EE8EAC'; // Pink

  const numRipples = 6; // Reduced slightly for better performance

  // Update mouse position via CSS variables for smooth 60fps masking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        containerRef.current.style.setProperty('--mouse-x', `${e.clientX}px`);
        containerRef.current.style.setProperty('--mouse-y', `${e.clientY}px`);
      }
    };

    // Move mask off-screen when mouse leaves the window
    const handleMouseLeave = () => {
      if (containerRef.current) {
        containerRef.current.style.setProperty('--mouse-x', `-1000px`);
        containerRef.current.style.setProperty('--mouse-y', `-1000px`);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  useGSAP(() => {
    // We removed the baseFrequency GSAP animation. 
    // Constantly redrawing a full-screen SVG fractalNoise filter kills the CPU/GPU.
    // Because the ripples are scaling and moving through the static displacement map, 
    // it will still look incredibly fluid and alive without the massive performance hit!

    // Animate both sets of ripples perfectly in sync
    const ripplesBase = gsap.utils.toArray('.water-ripple-base') as Element[];
    const ripplesDistorted = gsap.utils.toArray('.water-ripple-distorted') as Element[];

    let currentZ = 10;

    ripplesBase.forEach((baseRipple, i) => {
      const distortedRipple = ripplesDistorted[i];
      const elements = [baseRipple, distortedRipple];

      // FIX: Ensure smaller rings (lower time) start with HIGHER z-index!
      gsap.set(elements, {
        scale: 1.0,
        opacity: 0,
        xPercent: -50,
        yPercent: -50,
        zIndex: currentZ + (numRipples - i)
      });

      const tl = gsap.timeline({
        repeat: -1,
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
        scale: 8,
        duration: 24,
        ease: "none"
      }, 0);

      tl.to(elements, {
        opacity: 0,
        duration: 5,
        ease: "none"
      }, 19);

      // Jump directly to the exact second in the 24s loop.
      tl.time((i / numRipples) * 24);
    });
  }, { scope: containerRef });

  // ==========================================
  // MANUAL RIPPLE GRADIENT TUNING
  // ==========================================
  // Change these percentages to adjust the thickness and softness of the ripples.
  // 0% -> INNER_STOP: Completely transparent hole in the middle
  // INNER_STOP -> SOLID_EDGE: The sharp solid inner edge of the pink ripple
  // SOLID_EDGE -> FADE_OUT: The soft outer fade-out tail of the pink ripple
  const RING_INNER_STOP = "50%";
  const RING_SOLID_EDGE = "50.5%";
  const RING_FADE_OUT = "75%";

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
      className="fixed inset-0 w-full h-full overflow-hidden z-0 pointer-events-none"
      style={{ backgroundColor: colorPrimary }}
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
