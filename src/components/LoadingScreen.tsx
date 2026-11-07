import React, { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';
import { setAppLoaded } from '../utils/loadingState';

const MAX_WAIT_MS = 2500;
const MIN_SHOW_MS = 200;

export const LoadingScreen: React.FC = () => {
  const [isRendered, setIsRendered] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hideLoadingScreen = () => {
      if (containerRef.current) {
        gsap.to(containerRef.current, {
          opacity: 0,
          duration: 0.8,
          ease: "power2.inOut",
          onComplete: () => {
            setIsRendered(false);
            setAppLoaded();
          }
        });
      }
    };

    // Hide once fonts and the above-the-fold images are ready, instead of waiting for
    // window "load" (which also waits on every lazy image, video and font file).
    // Never hold the loader longer than MAX_WAIT_MS.
    const criticalImages = Array.from(
      document.querySelectorAll<HTMLImageElement>('img:not([loading="lazy"])')
    );
    const ready = Promise.all([
      document.fonts?.ready,
      ...criticalImages.map((img) => img.decode().catch(() => undefined)),
    ]);
    const timeout = new Promise((resolve) => setTimeout(resolve, MAX_WAIT_MS));

    let cancelled = false;
    let hideTimer: ReturnType<typeof setTimeout> | undefined;
    Promise.race([ready, timeout]).then(() => {
      if (!cancelled) hideTimer = setTimeout(hideLoadingScreen, MIN_SHOW_MS);
    });
    return () => {
      cancelled = true;
      clearTimeout(hideTimer);
    };
  }, []);

  if (!isRendered) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black"
    >
      <div className="w-40 h-40 md:w-56 md:h-56 flex items-center justify-center rounded-full overflow-hidden shadow-[0_0_40px_rgba(255,255,255,0.1)]">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster="/loader-poster.webp"
          className="w-full h-full object-cover"
        >
          <source src="/loader.webm" type="video/webm" />
          <source src="/loader.mp4" type="video/mp4" />
        </video>
      </div>
    </div>
  );
};
