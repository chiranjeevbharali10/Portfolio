import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { useAudioPlayer } from './hooks/useAudioPlayer';
import { RippleBackground } from './components/RippleBackground';
import { MusicPlayer } from './components/MusicPlayer';
import { Header } from './components/Header';

export const Relax = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const artworksRef = useRef<(HTMLDivElement | null)[]>([]);
  const floatersRef = useRef<(HTMLDivElement | null)[]>([]);
  
  const { 
    activeTrack, 
    activeStation,
    isPlaying, 
    progress, 
    currentTime, 
    duration, 
    togglePlay, 
    nextTrack, 
    prevTrack 
  } = useAudioPlayer();

  const activeTrackIndex = activeStation.tracks.findIndex(t => t.id === activeTrack.id);

  // Fade in the page initially
  useEffect(() => {
    if (containerRef.current) {
        gsap.fromTo(containerRef.current, 
            { opacity: 0 }, 
            { opacity: 1, duration: 1.5, ease: "power2.out" }
        );
    }
  }, []);

  useGSAP(() => {
    const n = activeStation.tracks.length;
    
    artworksRef.current.forEach((el, i) => {
        if (!el) return;
        
        // Calculate shortest circular distance
        let diff = (i - activeTrackIndex) % n;
        if (diff > Math.floor(n / 2)) diff -= n;
        if (diff < -Math.floor(n / 2)) diff += n;
        
        let x = '0vw';
        let y = '0vh';
        let scale = 1;
        let rotationY = 0;
        let rotationZ = 0;
        let zIndex = 10;
        let opacity = 1;
        
        if (diff === 0) {
            // HERO
            x = '0vw';
            y = '0vh';
            scale = 1;
            rotationY = 0;
            rotationZ = 0;
            zIndex = 50;
            opacity = 1;
        } else if (diff === 1) {
            // NEXT
            x = '30vw';
            y = '5vh';
            scale = 0.6;
            rotationY = -12;
            rotationZ = 4;
            zIndex = 40;
            opacity = 0.9;
        } else if (diff === 2 || (diff > 1 && diff <= n/2)) {
            // FAR NEXT
            x = '55vw';
            y = '12vh';
            scale = 0.4;
            rotationY = -22;
            rotationZ = 8;
            zIndex = 30;
            opacity = 0.6;
        } else if (diff === -1) {
            // PREV
            x = '-30vw';
            y = '-2vh';
            scale = 0.6;
            rotationY = 12;
            rotationZ = -4;
            zIndex = 40;
            opacity = 0.9;
        } else if (diff === -2 || (diff < -1 && diff >= -n/2)) {
            // FAR PREV
            x = '-55vw';
            y = '-6vh';
            scale = 0.4;
            rotationY = 22;
            rotationZ = -8;
            zIndex = 30;
            opacity = 0.6;
        } else {
            // Hidden / far away
            x = diff > 0 ? '80vw' : '-80vw';
            scale = 0.2;
            opacity = 0;
            zIndex = 10;
        }
        
        // Smooth transition through space
        gsap.to(el, {
            x, 
            y, 
            scale, 
            rotationY, 
            rotationZ, 
            zIndex,
            opacity,
            duration: 1.6,
            ease: "power3.inOut"
        });
    });
  }, { scope: containerRef, dependencies: [activeTrackIndex, activeStation.tracks.length] });

  // Extremely subtle ambient floating
  useGSAP(() => {
    floatersRef.current.forEach((el, i) => {
        if (!el) return;
        
        // Randomize floating slightly per element
        const durationY = 12 + (i % 5);
        const durationX = 14 + (i % 4);
        const durationRot = 16 + (i % 3);
        
        gsap.to(el, {
            y: "+=6",
            yoyo: true,
            repeat: -1,
            duration: durationY,
            ease: "sine.inOut"
        });
        
        gsap.to(el, {
            x: "+=3",
            yoyo: true,
            repeat: -1,
            duration: durationX,
            ease: "sine.inOut"
        });
        
        gsap.to(el, {
            rotation: "+=0.5",
            yoyo: true,
            repeat: -1,
            duration: durationRot,
            ease: "sine.inOut"
        });
    });
  }, { scope: containerRef });

  return (
    <main 
      ref={containerRef}
      className="relative w-full h-screen h-[100svh] overflow-hidden flex items-center justify-center font-inter"
      style={{ backgroundColor: '#FF7A2F' }}
    >
      <RippleBackground />
      <Header />

      <div className="relative z-10 w-full h-full flex items-center justify-center perspective-1000">
        {activeStation.tracks.map((track, i) => {
          const isHero = i === activeTrackIndex;
          
          return (
            <div 
              key={track.id}
              ref={el => { artworksRef.current[i] = el; }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div ref={el => { floatersRef.current[i] = el; }} className="relative">
                <div 
                  className="rounded border border-white/10 shadow-2xl overflow-hidden bg-black/20"
                  style={{ 
                    width: 'clamp(280px, 40vw, 550px)', 
                    height: 'clamp(280px, 40vw, 550px)',
                  }}
                >
                    {/* Using Pixabay placeholder based on track title hash for variety, or just generic abstract */}
                    <img 
                      src={`https://images.unsplash.com/photo-${1614613535308 + i}?q=80&w=600&auto=format&fit=crop`}
                      alt={track.title} 
                      className="w-full h-full object-cover pointer-events-none" 
                    />
                </div>
                
                {/* Only render the player on the active hero artwork */}
                {isHero && (
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 z-50 w-[85%] max-w-[320px]">
                      <MusicPlayer 
                          track={activeTrack}
                          isPlaying={isPlaying}
                          progress={progress}
                          currentTime={currentTime}
                          duration={duration}
                          onPlayPause={togglePlay}
                          onNext={nextTrack}
                          onPrev={prevTrack}
                      />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
};
