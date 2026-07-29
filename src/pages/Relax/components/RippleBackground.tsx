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

      gsap.set(elements, {
        scale: 0,
        opacity: 0,
        xPercent: -50,
        yPercent: -50,
        zIndex: currentZ + i
      });

      const tl = gsap.timeline({
        repeat: -1,
        delay: i * 4, // Stagger
        onRepeat: () => {
          currentZ += numRipples;
          gsap.set(elements, { zIndex: currentZ + i });
        }
      });

      tl.to(elements, {
        opacity: 1,
        duration: 1.5,
        ease: "none"
      }, 0);

      tl.to(elements, {
        scale: 6,
        duration: 24,
        ease: "power1.inOut"
      }, 0);

      tl.to(elements, {
        opacity: 0,
        duration: 5,
        ease: "none"
      }, 19);
    });
  }, { scope: containerRef });

  const renderRipples = (className: string) => (
    [...Array(numRipples)].map((_, i) => (
      <div
        key={i}
        className={`${className} absolute top-1/2 left-1/2 w-[100vw] h-[100vw] sm:w-[50vw] sm:h-[50vw] rounded-full will-change-transform`}
        style={{
          transformOrigin: 'center center',
          background: `radial-gradient(
              circle closest-side,
              ${colorPrimary} 0%,
              ${colorPrimary} 50%,
              ${colorSecondary} 50.5%,
              ${colorSecondary}00 100%
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
