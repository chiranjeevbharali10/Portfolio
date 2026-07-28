import React, { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';
import { setAppLoaded } from '../utils/loadingState';

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

    if (document.readyState === 'complete') {
      const timer = setTimeout(hideLoadingScreen, 5000);
      return () => clearTimeout(timer);
    } else {
      const handleLoad = () => {
        const timer = setTimeout(hideLoadingScreen, 3500);
      };
      
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, []);

  if (!isRendered) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black"
    >
      <div className="w-40 h-40 md:w-56 md:h-56 flex items-center justify-center rounded-full overflow-hidden shadow-[0_0_40px_rgba(255,255,255,0.1)]">
        <video 
          src="/Video%20Project%201.mp4" 
          autoPlay 
          loop 
          muted 
          playsInline
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
};
