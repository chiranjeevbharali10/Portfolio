import React from 'react';
import type { Track } from '../data/musicStations';

interface MusicPlayerProps {
  track: Track;
  isPlaying: boolean;
  progress: number;
  currentTime: number;
  duration: number;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
}

const formatTime = (seconds: number) => {
  if (!seconds || isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};

export const MusicPlayer: React.FC<MusicPlayerProps> = ({
  track,
  isPlaying,
  currentTime,
  onPlayPause,
  onNext,
  onPrev
}) => {
  // Premium Black Styling
  const bgDark = '#0A0A0A'; // Deep solid black
  const fgLight = '#FFFFFF'; // Crisp white

  return (
    <div 
      className="rounded-full px-5 py-3 md:px-6 md:py-4 flex items-center justify-between w-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/15 backdrop-blur-2xl"
      style={{ backgroundColor: bgDark, color: fgLight }}
    >
      
      {/* Play/Pause Button - Inverted for pop */}
      <button 
        onClick={onPlayPause}
        className="transition-all hover:scale-105 focus:outline-none flex items-center justify-center rounded-full bg-white text-black hover:bg-gray-200"
        aria-label={isPlaying ? "Pause" : "Play"}
        style={{ padding: '10px' }}
      >
        {isPlaying ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6zm8 0h4v16h-4z"/></svg>
        ) : (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
        )}
      </button>

      {/* Track Info */}
      <div className="flex flex-col items-center flex-1 px-4">
        <h4 className="text-xs md:text-sm font-bold font-inter tracking-widest uppercase mb-0.5" style={{ color: fgLight }}>
          {track.title}
        </h4>
        <div className="flex items-center gap-2 text-[10px] font-inter opacity-70" style={{ color: fgLight }}>
          <span>{formatTime(currentTime)}</span>
        </div>
      </div>

      {/* Next/Prev Controls */}
      <div className="flex items-center gap-4">
        <button onClick={onPrev} className="transition-transform hover:scale-110 focus:outline-none text-white/70 hover:text-white" aria-label="Previous track">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
        </button>
        <button onClick={onNext} className="transition-transform hover:scale-110 focus:outline-none text-white/70 hover:text-white" aria-label="Next track">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
        </button>
      </div>

    </div>
  );
};
