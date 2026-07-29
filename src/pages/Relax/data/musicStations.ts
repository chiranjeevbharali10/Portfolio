export type StationId = 'lofi' | 'jazz' | 'ambient' | 'dreamy' | 'rain' | 'synth';

export interface Track {
  id: string;
  title: string;
  url: string; 
}

export interface Station {
  id: StationId;
  name: string;
  tracks: Track[];
}

// Temporary royalty-free music placeholders from Pixabay for development
export const stations: Record<StationId, Station> = {
  lofi: {
    id: 'lofi',
    name: 'LOFI',
    tracks: [
      { id: 'l1', title: 'Midnight Coffee', url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3' },
      { id: 'l2', title: 'Dusty Grooves', url: 'https://cdn.pixabay.com/download/audio/2022/11/22/audio_febc508520.mp3?filename=lofi-chill-140858.mp3' },
    ]
  },
  jazz: {
    id: 'jazz',
    name: 'JAZZ',
    tracks: [
      { id: 'j1', title: 'Late Night Sax', url: 'https://cdn.pixabay.com/download/audio/2022/04/13/audio_73eeb113e6.mp3?filename=smooth-jazz-108151.mp3' },
    ]
  },
  ambient: {
    id: 'ambient',
    name: 'AMBIENT',
    tracks: [
      { id: 'a1', title: 'Drifting Clouds', url: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3?filename=ambient-piano-amp-strings-10711.mp3' },
    ]
  },
  dreamy: {
    id: 'dreamy',
    name: 'DREAMY',
    tracks: [
      { id: 'd1', title: 'Lucid', url: 'https://cdn.pixabay.com/download/audio/2022/02/10/audio_fc48af67b2.mp3?filename=chill-abstract-intention-12099.mp3' },
    ]
  },
  rain: {
    id: 'rain',
    name: 'RAIN',
    tracks: [
      { id: 'r1', title: 'City Rain', url: 'https://cdn.pixabay.com/download/audio/2021/08/09/audio_82cde71569.mp3?filename=rain-and-thunder-16705.mp3' },
    ]
  },
  synth: {
    id: 'synth',
    name: 'SYNTH',
    tracks: [
      { id: 's1', title: 'Neon Glow', url: 'https://cdn.pixabay.com/download/audio/2021/08/09/audio_d0dfcd9d3e.mp3?filename=synthwave-80s-110045.mp3' },
    ]
  }
};

export const stationIds = Object.keys(stations) as StationId[];
