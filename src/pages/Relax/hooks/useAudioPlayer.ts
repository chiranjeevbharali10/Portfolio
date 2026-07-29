import { useState, useEffect, useRef, useCallback } from 'react';
import { stations, type StationId } from '../data/musicStations';

export const useAudioPlayer = () => {
  const [activeStationId, setActiveStationId] = useState<StationId>('lofi');
  const [activeTrackIndex, setActiveTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const activeStation = stations[activeStationId];
  const activeTrack = activeStation.tracks[activeTrackIndex];

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.volume = 0.8;
    }
    
    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setProgress((audio.currentTime / audio.duration) * 100 || 0);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      setActiveTrackIndex(prev => (prev + 1) % activeStation.tracks.length);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [activeStation.tracks.length]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !activeTrack) return;
    
    if (audio.src !== activeTrack.url) {
        audio.src = activeTrack.url;
        audio.load();
        
        if (isPlaying) {
            audio.play().catch(e => console.warn('Autoplay prevented:', e));
        }
    }
  }, [activeTrack, isPlaying]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch(e => console.warn('Playback failed:', e));
    }
  }, [isPlaying]);

  const nextTrack = useCallback(() => {
    setActiveTrackIndex(prev => (prev + 1) % activeStation.tracks.length);
  }, [activeStation]);

  const prevTrack = useCallback(() => {
    setActiveTrackIndex(prev => (prev - 1 + activeStation.tracks.length) % activeStation.tracks.length);
  }, [activeStation]);

  const changeStation = useCallback((newStationId: StationId) => {
      if (newStationId === activeStationId) return;
      
      const audio = audioRef.current;
      if (audio && isPlaying) {
          const fadeOut = setInterval(() => {
              if (audio.volume > 0.1) {
                  audio.volume -= 0.1;
              } else {
                  clearInterval(fadeOut);
                  setActiveStationId(newStationId);
                  setActiveTrackIndex(0);
                  audio.volume = 0.8;
              }
          }, 50);
      } else {
          setActiveStationId(newStationId);
          setActiveTrackIndex(0);
      }
  }, [activeStationId, isPlaying]);

  const seek = useCallback((percent: number) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    audio.currentTime = (percent / 100) * duration;
  }, [duration]);

  return {
    activeStation,
    activeTrack,
    isPlaying,
    progress,
    currentTime,
    duration,
    togglePlay,
    nextTrack,
    prevTrack,
    changeStation,
    seek
  };
};
