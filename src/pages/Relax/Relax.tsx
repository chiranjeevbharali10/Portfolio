import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { useAudioPlayer } from './hooks/useAudioPlayer';
import { RippleBackground } from './components/RippleBackground';
import { MusicPlayer } from './components/MusicPlayer';
import { Header } from './components/Header';
import { ArtworksCanvas } from './components/ArtworksCanvas';

export const Relax = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { 
    activeTrack, 
    isPlaying, 
    progress, 
    currentTime, 
    duration, 
    togglePlay, 
    nextTrack, 
    prevTrack 
  } = useAudioPlayer();

  // Fade in the page initially
  useEffect(() => {
    if (containerRef.current) {
        gsap.fromTo(containerRef.current, 
            { opacity: 0 }, 
            { opacity: 1, duration: 1.5, ease: "power2.out" }
        );
    }
  }, []);

  return (
    <main 
      ref={containerRef}
      className="relative w-full h-screen h-[100svh] overflow-hidden flex items-center justify-center font-inter"
      style={{ backgroundColor: '#FF7A2F' }}
    >
      <RippleBackground />
      <Header />
      
      {/* 3D WebGL Gallery Array */}
      <ArtworksCanvas />

      {/* Floating Music Player UI positioned beautifully over the Hero Mesh */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-[15%] md:bottom-[10%] z-50 w-[85%] sm:w-full max-w-[360px] pointer-events-auto">
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

    </main>
  );
};
