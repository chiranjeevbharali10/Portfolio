import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowLeft, ArrowUpRight, Mouse } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const FRAME_COUNT = 238;
const INITIAL_FRAMES_TO_LOAD = 30;

const getFramePath = (index: number) => {
  const paddedIndex = (index + 1).toString().padStart(5, '0');
  return `/island_5/img_${paddedIndex}.jpg`;
};

export const IslandJourney5: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Refs for cinematic text transition
  const uiOverlayRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  
  const welcomeRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const word1Ref = useRef<HTMLDivElement>(null);
  const word2Ref = useRef<HTMLDivElement>(null);
  const starRef = useRef<HTMLDivElement>(null);
  const paragraphRef = useRef<HTMLParagraphElement>(null);
  const ctaBtnRef = useRef<HTMLButtonElement>(null);
  
  const footerRef = useRef<HTMLDivElement>(null);

  const [isLoaded, setIsLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const stateRef = useRef({
    images: [] as HTMLImageElement[],
    loadedCount: 0,
    currentFrame: -1,
    targetFrame: 0,
    animationFrameId: 0,
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const state = stateRef.current;
    let isCancelled = false;

    const loadImages = async () => {
      state.images = new Array(FRAME_COUNT);

      const loadImage = (index: number): Promise<void> => {
        return new Promise((resolve) => {
          const img = new Image();
          img.src = getFramePath(index);
          img.onload = () => {
            if (isCancelled) return;
            state.images[index] = img;
            state.loadedCount++;

            if (!isLoaded && index < INITIAL_FRAMES_TO_LOAD) {
              setLoadingProgress(Math.floor((state.loadedCount / INITIAL_FRAMES_TO_LOAD) * 100));
            }
            resolve();
          };
          img.onerror = () => {
            if (isCancelled) return;
            state.loadedCount++;
            resolve();
          };
        });
      };

      await loadImage(0);

      const initialPromises = [];
      for (let i = 1; i < INITIAL_FRAMES_TO_LOAD; i++) {
        initialPromises.push(loadImage(i));
      }

      await Promise.all(initialPromises);
      if (isCancelled) return;

      setIsLoaded(true);

      const loadRemaining = async () => {
        const chunkSize = 10;
        for (let i = INITIAL_FRAMES_TO_LOAD; i < FRAME_COUNT; i += chunkSize) {
          if (isCancelled) break;
          const chunk = [];
          for (let j = i; j < i + chunkSize && j < FRAME_COUNT; j++) {
            chunk.push(loadImage(j));
          }
          await Promise.all(chunk);
          await new Promise(r => setTimeout(r, 10));
        }
      };

      loadRemaining();
    };

    loadImages();

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isLoaded || !canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const state = stateRef.current;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.parentElement!.getBoundingClientRect();

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      state.width = rect.width * dpr;
      state.height = rect.height * dpr;

      state.currentFrame = -1;
    };

    const drawFrame = () => {
      let frameToDraw = state.targetFrame;

      if (!state.images[frameToDraw]) {
        for (let i = frameToDraw; i >= 0; i--) {
          if (state.images[i]) {
            frameToDraw = i;
            break;
          }
        }
      }

      if (state.images[frameToDraw] && frameToDraw !== state.currentFrame) {
        const img = state.images[frameToDraw];
        state.currentFrame = frameToDraw;

        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, state.width, state.height);

        const baseScale = Math.min(
          state.width / img.width,
          state.height / img.height
        );
        const scale = baseScale * 1.166; 

        const drawWidth = img.width * scale;
        const drawHeight = img.height * scale;

        const x = (state.width - drawWidth) / 2;
        const y = (state.height - drawHeight) / 2;

        ctx.drawImage(img, x, y, drawWidth, drawHeight);
      }

      state.animationFrameId = requestAnimationFrame(drawFrame);
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    state.animationFrameId = requestAnimationFrame(drawFrame);

    const st = ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        const progress = self.progress;
        const target = Math.round(progress * (FRAME_COUNT - 1));
        state.targetFrame = Math.max(0, Math.min(FRAME_COUNT - 1, target));
      },
    });

    // Cinematic Text Dissolve Animation
    const textTl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: '40% top', // Dissolve over the first 40% of the 500vh scroll
        scrub: 1.5,
      }
    });

    if (welcomeRef.current && headingRef.current && paragraphRef.current && ctaBtnRef.current && footerRef.current) {
      
      // 1. Surrounding text floats up and blurs away
      textTl.to([welcomeRef.current, paragraphRef.current, ctaBtnRef.current], {
        y: -50,
        opacity: 0,
        filter: 'blur(8px)',
        ease: 'power2.inOut'
      }, 0);

      // 2. Heading words physically move to form a single line
      const w1 = word1Ref.current.offsetWidth;
      const w2 = word2Ref.current.offsetWidth;
      const h1 = word1Ref.current.offsetHeight;
      const gap = 40; // Gap between words in final state

      // Calculate final target coordinates for DEVELOPER to sit next to CREATIVE
      const word2FinalX = w1 + gap;
      const word2FinalY = -word2Ref.current.offsetTop;

      // Calculate the final visual bounding box inside headingRef
      const finalLocalCx = (w1 + gap + w2) / 2;
      const finalLocalCy = h1 / 2;

      // Position the star perfectly between them
      gsap.set(starRef.current, {
        x: w1 + gap / 2 - starRef.current.offsetWidth / 2,
        y: h1 / 2 - starRef.current.offsetHeight / 2,
      });

      const scaleTarget = 15 / parseFloat(window.getComputedStyle(headingRef.current).fontSize);

      // Clean calculate initial position without transforms
      const currentTransform = headingRef.current.style.transform;
      headingRef.current.style.transform = 'none';
      const headRect = headingRef.current.getBoundingClientRect();
      headingRef.current.style.transform = currentTransform;

      // Calculate exactly where headingRef needs to move so its NEW visual center hits the nav bar center
      const targetX = (window.innerWidth / 2) - (finalLocalCx * scaleTarget) - headRect.left;
      const targetY = 28 - (finalLocalCy * scaleTarget) - headRect.top; // 28 is nav center Y

      textTl.to(headingRef.current, {
        x: targetX,
        y: targetY,
        scale: scaleTarget,
        transformOrigin: "left top", // Scale from top left so our math is perfectly aligned
        ease: 'power3.inOut'
      }, 0);

      textTl.to(word2Ref.current, {
        x: word2FinalX,
        y: word2FinalY,
        ease: 'power3.inOut'
      }, 0);

      textTl.to(starRef.current, {
        opacity: 1,
        ease: 'power3.inOut'
      }, 0);

      // 3. Footer sinks down and blurs away
      textTl.to(footerRef.current, {
        y: 50,
        opacity: 0,
        filter: 'blur(8px)',
        ease: 'power2.inOut'
      }, 0.1);

      // 5. Disable pointer events for everything that disappeared
      textTl.to([welcomeRef.current, paragraphRef.current, ctaBtnRef.current, footerRef.current], {
        pointerEvents: 'none'
      }, 0);
    }

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(state.animationFrameId);
      st.kill();
      textTl.kill();
    };
  }, [isLoaded]);

  return (
    <div className="bg-black relative text-white">
      <div
        className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#fdf3f4] transition-opacity duration-1000 ${isLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
      >
        <p className="text-black font-sans tracking-widest uppercase mb-4 text-sm font-medium">Loading World</p>
        <div className="w-48 h-[1px] bg-black/10 relative overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-black transition-all duration-300 ease-out"
            style={{ width: `${loadingProgress}%` }}
          />
        </div>
        <p className="text-black/50 text-xs mt-4 font-mono">{loadingProgress}%</p>
      </div>

      <div ref={containerRef} className="h-[500vh] relative w-full">
        <div className="sticky top-0 w-full h-[100vh] overflow-hidden bg-black text-black">
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              width: '100%',
              height: '100%',
            }}
          />

          {/* UI Overlay */}
          <div ref={uiOverlayRef} className="absolute inset-0 pointer-events-none flex flex-col justify-between px-6 md:px-12 pb-6 md:pb-12 pt-0 font-kefir z-10">
            {/* Header */}
            <div ref={headerRef} className="flex justify-between items-center pointer-events-auto mt-1 md:mt-3 relative">
              <button className="px-6 py-2 rounded-full border border-black/20 hover:bg-black/5 transition-all text-[13px] font-medium flex items-center gap-2">
                Let's work <span className="text-lg leading-none mb-[2px]">+</span>
              </button>

              <div className="flex gap-2 md:gap-3">
                <button className="px-6 py-2 rounded-full border border-black/20 hover:bg-black/5 transition-all text-[13px] font-medium">
                  Menu
                </button>
                <button className="w-10 h-10 rounded-full border border-black/20 flex items-center justify-center hover:bg-black/5 transition-all">
                  <ArrowLeft size={16} strokeWidth={1.5} />
                </button>
              </div>
            </div>

            {/* Main Content */}
            <div className="max-w-3xl pointer-events-none flex flex-col justify-center h-full">
              
              <div ref={welcomeRef} className="flex items-center gap-2 -mb-3.4 pointer-events-auto">
                <span className="text-sm">✦</span>
                <span className="text-sm font-medium tracking-widest uppercase">Welcome to my world</span>
              </div>

              <h1 ref={headingRef} className="
  text-[46px]
  md:text-[60px]
  lg:text-[78px]
  xl:text-[96px]
  leading-[0.9]
  tracking-[0.08em]
  mb-8
  font-incompleeta-light
  thicken-text
  pointer-events-auto
  will-change-transform
  w-fit
  relative
">
                <div ref={word1Ref} className="w-fit">CREATIVE</div>
                <div ref={starRef} className="absolute top-0 left-0 opacity-0 text-[0.8em]">✦</div>
                <div ref={word2Ref} className="w-fit mt-3">DEVELOPER</div>
              </h1>
              
              <p ref={paragraphRef} className="text-sm md:text-xl max-w-sm mb-10 opacity-80 font-medium leading-relaxed pointer-events-auto">
                I build experiences that merge creativity with code.
              </p>

              <button ref={ctaBtnRef} className="px-6 py-3 rounded-full border border-black/20 hover:bg-white/30 backdrop-blur-md transition-all text-sm font-medium flex items-center gap-2 w-fit pointer-events-auto">
                Let's work together <ArrowUpRight size={16} strokeWidth={1.5} />
              </button>
            </div>

            {/* Footer */}
            <div ref={footerRef} className="flex flex-col md:flex-row justify-between items-end md:items-center pointer-events-auto text-sm font-medium gap-6 md:gap-0">

              {/* Socials */}
              <div className="flex gap-4 items-center w-full md:w-auto justify-center md:justify-start">
                <a href="#" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" /><path d="M9 18c-4.51 2-5-2-7-2" /></svg> Github
                </a>
                <span className="opacity-40">·</span>
                <a href="#" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /></svg> Twitter
                </a>
                <span className="opacity-40">·</span>
                <a href="#" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg> LinkedIn
                </a>
              </div>

              {/* Scroll indicator - absolute centered on large screens, relative on small */}
              <div className="flex items-center gap-2 opacity-60 flex-col absolute left-1/2 -translate-x-1/2 bottom-6 md:bottom-12 hidden md:flex">
                <Mouse size={20} strokeWidth={1.5} />
                <span>Scroll to explore</span>
              </div>

              {/* Availability */}
              <div className="flex items-center gap-2 w-full md:w-auto justify-center md:justify-end">
                <span className="w-2 h-2 bg-pink-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(236,72,153,0.8)]"></span>
                Available for work
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
