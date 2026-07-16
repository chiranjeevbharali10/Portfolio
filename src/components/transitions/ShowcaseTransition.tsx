import React, { useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { generateBlobPath } from './BlobGenerator';

interface ShowcaseTransitionProps {
  children: (isTransitioned: boolean) => React.ReactNode;
  onSwap: () => void;
  className?: string;
}

const DESTINATION_BG_COLOR = '#FFF4E4';

export const ShowcaseTransition: React.FC<ShowcaseTransitionProps> = ({ children, onSwap, className }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const solidRef = useRef<HTMLDivElement>(null);

  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isTransitioned, setIsTransitioned] = useState(false);

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (isTransitioning || !cardRef.current || !containerRef.current || !pathRef.current) return;
    setIsTransitioning(true);

    const card = cardRef.current;
    const container = containerRef.current;
    const svg = svgRef.current;
    const solid = solidRef.current;
    const rect = card.getBoundingClientRect();
    
    // We use exact screen center for both the card flight and the portal origin
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;

    // ── Phase 0: Prep ──────────────────────────────────────────────
    // Push the rest of the landing page back in Z-space and fade it out
    gsap.to(".landing-fade-target", { 
      opacity: 0, 
      scale: 0.95,
      duration: 0.8,
      ease: "power3.inOut"
    });

    // Freeze placeholder size so the grid doesn't collapse
    gsap.set(container, { width: rect.width, height: rect.height });

    // Convert card to fixed positioning exactly where it was
    gsap.set(card, {
      position: 'fixed',
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      margin: 0,
      zIndex: 100,
      // Remove any hover transforms immediately to prevent layout jumps
      transform: 'none',
      clearProps: 'transform'
    });

    // Reset SVG and Solid overlays
    gsap.set(svg, { display: 'block', opacity: 1 });
    gsap.set(solid, { display: 'none', opacity: 0 });

    const tl = gsap.timeline();
    
    // Calculate max radius needed to cover the screen from exact center
    const maxRadius = Math.sqrt(cx * cx + cy * cy) * 1.3;

    // Target state for the morphing card (matching Projects page header)
    const targetWidth = 160;
    const targetHeight = 80;
    const targetTop = 32; // 2rem
    const targetLeft = cx - targetWidth / 2;

    // ── Phase 1: Card Flies to Center First ─────────────────────────
    tl.to(card, {
      top: cy - rect.height / 2,
      left: cx - rect.width / 2,
      duration: 0.8,
      ease: 'power3.inOut'
    });

    // ── Phase 2: The Irregular Accelerating Portal Starts ───────────
    tl.addLabel('portalStart');

    const blobState = { progress: 0, time: 0 };
    
    const updateBlob = () => {
      if (pathRef.current) {
        // Portal now expands exclusively from the exact center (cx, cy)
        const d = generateBlobPath(cx, cy, maxRadius, blobState.progress, blobState.time);
        pathRef.current.setAttribute('d', d);
      }
    };

    // 1. Time (wobble) animates continuously over the whole transition (3.5 seconds)
    tl.to(blobState, {
      time: 6, // lots of organic wobble
      duration: 3.5,
      ease: "none",
      onUpdate: updateBlob
    }, 'portalStart');

    // 2. "Slower" - First 20% of growth takes 1.5 seconds, very tentative
    tl.to(blobState, {
      progress: 0.2,
      duration: 1.5,
      ease: "power2.inOut"
    }, 'portalStart');

    // 3. "Little faster" - 20% to 50% takes 1.0 seconds, picking up speed
    tl.to(blobState, {
      progress: 0.5,
      duration: 1.0,
      ease: "power2.in"
    }, 'portalStart+=1.5');

    // 4. "Full faster" - 50% to 100% takes 1.0 seconds, accelerating rapidly
    tl.to(blobState, {
      progress: 1.0,
      duration: 1.0,
      ease: "power4.in"
    }, 'portalStart+=2.5');

    // Wait until the portal fully fills the screen (3.5s total duration)
    tl.addLabel('portalEnd', 'portalStart+=3.5');

    // ── Phase 3: Move Bento to Top & Rotate (Medium-Fast) ───────────
    // User requested: "don't start moving the bento util the screen is filled"
    tl.to(card, {
      top: targetTop,
      left: targetLeft,
      width: targetWidth,
      height: targetHeight,
      borderRadius: '24px', 
      borderWidth: '2px', 
      padding: '8px',
      rotation: 360, // Rotate the bento while it transitions to the top
      duration: 0.8, // "medium-fast"
      ease: 'power3.inOut'
    }, 'portalEnd');

    // ── Phase 4: Swap & Cleanup ────────────────────────────────────
    tl.add(() => {
      // Show solid div to ensure full opaque coverage, hiding any SVG edge artifacts
      gsap.set(solid, { display: 'block', opacity: 1 });
      onSwap();
      setIsTransitioned(true);
    });

    // Fade out the clone so the real Projects card takes over seamlessly
    tl.to(card, {
      opacity: 0,
      duration: 0.1
    }, "+=0.1");

    tl.add(() => {
      // CRITICAL FIX: Hide both overlays so the Projects page is visible!
      // This prevents the "plain screen" issue.
      gsap.set(svg, { display: 'none' });
      gsap.set(solid, { display: 'none' });
      gsap.set(card, { rotation: 0 }); // reset rotation for next time
      setIsTransitioning(false);
    });

  }, [isTransitioning, onSwap]);

  return (
    <div ref={containerRef} className={`relative flex-1 flex ${className}`}>
      {/* Clickable card */}
      <div
        ref={cardRef}
        className={`w-full h-full will-change-transform z-[100] transition-transform duration-500 ${
          isTransitioning ? 'cursor-default' : 'hover:-translate-y-2 cursor-pointer'
        }`}
        onClick={handleClick}
      >
        {children(isTransitioned)}
      </div>

      {/* Irregular Cloud Portal SVG overlay */}
      <svg 
        ref={svgRef}
        className="fixed inset-0 w-full h-full pointer-events-none z-[90] hidden"
        style={{ top: 0, left: 0 }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path ref={pathRef} fill={DESTINATION_BG_COLOR} />
      </svg>

      {/* Solid background to prevent edge artifacts when fully transitioned */}
      <div 
        ref={solidRef}
        className="fixed inset-0 w-full h-full z-[89] hidden pointer-events-none"
        style={{ background: DESTINATION_BG_COLOR }}
      />
    </div>
  );
};
