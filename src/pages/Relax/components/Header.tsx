import React, { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { Link } from 'react-router-dom';

export const Header: React.FC = () => {
  const lettersRef = useRef<(HTMLSpanElement | null)[]>([]);

  useGSAP(() => {
    // Animate each letter individually to create a goofy, random bouncing/rotating effect
    // identical to the ponpon-mania reference
    lettersRef.current.forEach((letter) => {
      if (!letter) return;
      
      const duration = 2.5 + Math.random() * 1.5;
      const delay = Math.random() * 2;
      
      // Random subtle rotation
      gsap.to(letter, {
        rotation: (Math.random() - 0.5) * 15,
        duration: duration,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: delay,
      });
      
      // Random subtle Y bounce
      gsap.to(letter, {
        y: (Math.random() - 0.5) * 8,
        duration: duration * 1.1,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: delay * 0.8,
      });

      // Random subtle scale
      gsap.to(letter, {
        scale: 0.9 + Math.random() * 0.2,
        duration: duration * 1.3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: delay * 1.2,
      });
    });
  }, []);

  const titleText = "Justtt Relaxxx";

  return (
    <header className="fixed top-0 left-0 w-full z-[100] px-6 md:px-12 py-6 md:py-8 flex items-center justify-center gap-6 sm:gap-12 md:gap-20 text-[#1A1A1A] pointer-events-none">
      
      {/* LEFT: Home Pill */}
      <div className="flex pointer-events-auto pb-1 sm:pb-2">
        <Link 
          to="/"
          className="-rotate-[8deg] hover:rotate-0 border-[1.5px] border-[#1A1A1A] rounded-full px-5 py-1 text-xs sm:text-sm font-bold tracking-wide hover:bg-[#1A1A1A] hover:text-[#FDF5E6] transition-all duration-300"
        >
          home
        </Link>
      </div>

      {/* CENTER: Animated Title */}
      <div className="flex justify-center mt-[-4px]">
        {/* Switched to Asgard font, adjusted sizes to fit better together */}
        <h1 className="font-asgard text-3xl sm:text-4xl md:text-[2.75rem] text-center leading-none flex flex-wrap justify-center pointer-events-auto" style={{ textTransform: 'lowercase' }}>
          {titleText.split('').map((char, index) => {
            // Keep the space character intact
            if (char === ' ') {
              return <span key={index} className="inline-block w-2 sm:w-3" />;
            }
            return (
              <span 
                key={index}
                ref={el => { lettersRef.current[index] = el; }}
                className="inline-block whitespace-pre"
                style={{ transformOrigin: 'center center' }}
              >
                {char}
              </span>
            );
          })}
        </h1>
      </div>

      {/* RIGHT: About Link */}
      <div className="flex pointer-events-auto pb-1 sm:pb-2">
        <Link 
          to="/about"
          className="text-xs sm:text-sm font-bold tracking-wide hover:opacity-70 transition-opacity duration-300 py-1.5"
        >
          about
        </Link>
      </div>
      
    </header>
  );
};
