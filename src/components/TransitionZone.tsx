
export const TransitionZone = () => {
  return (
    <section className="relative w-full h-[30vh] bg-transparent flex flex-col items-center justify-center pointer-events-none z-20">
      <div className="w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-20 flex flex-col items-center">
        
        {/* Top Divider */}
        <div className="w-px h-16 bg-primary/20 mb-8"></div>

        {/* Marker */}
        <div className="flex flex-col items-center gap-3">
          <span className="font-mono text-[10px] tracking-widest text-[#EAE4D3] opacity-80 uppercase">
            01
          </span>
          <h3 className="font-inter font-bold text-xs tracking-[0.3em] text-primary/60 uppercase text-center">
            SELECTED EXPERIMENTS
          </h3>
          <p className="font-mono text-[9px] tracking-widest text-primary/40 uppercase mt-2">
            CREATIVE ENGINEERING × DIGITAL SYSTEMS
          </p>
        </div>

        {/* Bottom Divider / Flow line */}
        <div className="w-px h-16 bg-gradient-to-b from-primary/20 to-transparent mt-8"></div>

      </div>
    </section>
  );
};
