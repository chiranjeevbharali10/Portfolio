export const CinematicBackground = () => {
  return (
    <div className="fixed inset-0 z-[-1] bg-background editorial-grid">
      {/* Subtle Noise Texture for premium editorial grain */}
      <div 
        className="absolute inset-0 opacity-[0.04] mix-blend-overlay pointer-events-none"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}
      ></div>

      {/* Single very soft atmospheric glow to prevent pure black flatness, heavily restrained */}
      <div className="absolute top-[10%] left-[20%] w-[50vw] h-[50vw] rounded-full bg-primary/5 blur-[150px] pointer-events-none"></div>
    </div>
  );
};
