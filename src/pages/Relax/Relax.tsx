import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { Maximize, Minimize } from 'lucide-react';
import { useAudioPlayer } from './hooks/useAudioPlayer';
import { RippleBackground } from './components/RippleBackground';
import { MusicPlayer } from './components/MusicPlayer';
import { Header } from './components/Header';
import { ArtworksCanvas } from './components/ArtworksCanvas';

export const Relax = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const { 
    activeTrack,
    activeTrackIndex,
    isPlaying, 
    progress, 
    currentTime, 
    duration, 
    togglePlay, 
    nextTrack, 
    prevTrack,
    setTrackIndex
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

  // Track fullscreen state changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  return (
    <main 
      ref={containerRef}
      className="relative w-full h-screen h-[100svh] overflow-hidden flex items-center justify-center font-inter"
    >
      <RippleBackground activeIndex={activeTrackIndex} />
      <Header />
      
      {/* 3D WebGL Gallery Array - perfectly synced to the music track! */}
      <ArtworksCanvas activeIndex={activeTrackIndex} setActiveIndex={setTrackIndex} />

      {/* Floating Music Player UI positioned beautifully over the Hero Mesh */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-[12%] md:bottom-[15%] z-50 w-[85%] sm:w-full max-w-[400px] pointer-events-auto">
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

      {/* Fullscreen Toggle Button */}
      <button 
        onClick={toggleFullscreen}
        className="absolute bottom-6 left-6 md:bottom-8 md:left-8 z-50 p-2 md:p-3 rounded-full hover:bg-black/10 transition-colors text-black flex items-center justify-center cursor-pointer pointer-events-auto"
        aria-label="Toggle Fullscreen"
      >
        {isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
      </button>

    </main>
  );
};
