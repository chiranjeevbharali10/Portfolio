import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const FRAME_COUNT = 238;
const INITIAL_FRAMES_TO_LOAD = 30;

// Helper to pad numbers: 1 -> "00001", 12 -> "00012", 238 -> "00238"
const getFramePath = (index: number) => {
  const paddedIndex = (index + 1).toString().padStart(5, '0');
  return `/island_5/img_${paddedIndex}.jpg`;
};

export const IslandJourney5: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

        // ---------------------------------------------------------
        // HOW TO ZOOM MANUALLY:
        // ---------------------------------------------------------
        // 1. Math.min(...) = "contain" (completely zoomed out, shows full image)
        // 2. Math.max(...) = "cover" (completely zoomed in, fills screen, crops edges)
        // 3. To tweak it perfectly, we take Math.min (fully zoomed out) 
        //    and multiply it by a number to zoom back in slightly.
        //
        // Try changing the 1.15 below to something like 1.2 or 1.05!
        const baseScale = Math.min(
          state.width / img.width,
          state.height / img.height
        );
        const scale = baseScale * 1.166; // 👈 CHANGE THIS NUMBER TO ZOOM IN/OUT
        // ---------------------------------------------------------

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

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(state.animationFrameId);
      st.kill();
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
        <div className="sticky top-0 w-full h-[100vh] overflow-hidden bg-black">
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              width: '100%',
              height: '100%',
            }}
          />
        </div>
      </div>
    </div>
  );
};
