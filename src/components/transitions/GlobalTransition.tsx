import React, { createContext, useContext, useRef, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ShowcaseCard } from '../ShowcaseCard';

interface TransitionContextType {
  startTransition: (rect: DOMRect, clickX: number, clickY: number, targetRoute: string) => void;
}

const TransitionContext = createContext<TransitionContextType | null>(null);

export const useTransition = () => {
  const context = useContext(TransitionContext);
  if (!context) throw new Error("useTransition must be used within GlobalTransitionProvider");
  return context;
};

export const GlobalTransitionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const splashRef = useRef<HTMLImageElement>(null);
  const cloneRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const startTransition = (rect: DOMRect, clickX: number, clickY: number, targetRoute: string) => {
    if (!splashRef.current || !cloneRef.current) return;

    // Reset and show overlay elements
    gsap.set(splashRef.current, {
      display: 'block',
      left: clickX,
      top: clickY,
      xPercent: -50,
      yPercent: -50,
      scale: 0,
      opacity: 1
    });

    gsap.set(cloneRef.current, {
      display: 'block',
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      opacity: 1
    });

    const tl = gsap.timeline();

    // 1. Splash scales up to cover screen
    tl.to(splashRef.current, {
      scale: 45, // Enough to cover corners
      duration: 0.7,
      ease: 'power3.inOut'
    });

    // 2. Clone flies to target position
    // Target position for Projects page: top center. Let's make it fixed.
    const targetWidth = 160;
    const targetHeight = 80;
    const targetTop = 32; // 2rem
    const targetLeft = window.innerWidth / 2 - targetWidth / 2;

    tl.to(cloneRef.current, {
      top: targetTop,
      left: targetLeft,
      width: targetWidth,
      height: targetHeight,
      duration: 0.9,
      ease: 'power3.inOut'
    }, 0); // Start at same time as splash

    // 3. Navigate behind the splash
    tl.add(() => {
      navigate(targetRoute);
    }, 0.5); // Midway when splash is big enough

    // 4. Fade out splash
    tl.to(splashRef.current, {
      opacity: 0,
      duration: 0.5,
      ease: 'power2.out',
      delay: 0.3
    });

    // 5. Fade out clone (the real card on the new page will be underneath it perfectly)
    tl.to(cloneRef.current, {
      opacity: 0,
      duration: 0.2
    }, "-=0.2");

    // 6. Cleanup
    tl.add(() => {
      gsap.set(splashRef.current, { display: 'none' });
      gsap.set(cloneRef.current, { display: 'none' });
    });
  };

  return (
    <TransitionContext.Provider value={{ startTransition }}>
      {children}
      
      {/* Global Overlays */}
      <img 
        ref={splashRef}
        src="/fonts/SVG/paint-splash.svg" 
        className="fixed z-[9998] hidden pointer-events-none origin-center w-[150px] h-[150px] object-contain"
        alt="splash"
      />

      <div 
        ref={cloneRef} 
        className="fixed z-[9999] hidden pointer-events-none"
      >
        <ShowcaseCard layout="horizontal" className="w-full h-full shadow-2xl" />
      </div>
    </TransitionContext.Provider>
  );
};
