export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center px-6 sm:px-10 lg:px-20 z-10 overflow-hidden">
      
      {/* LEFT: Technical Labels (Vertical layout) with restrained colors */}
      <div className="tech-label absolute left-6 md:left-10 top-[20%] flex flex-col gap-12 hidden lg:flex">
        <div className="font-inter text-[10px] tracking-[0.3em] uppercase text-primary/60 rotate-180" style={{ writingMode: 'vertical-rl' }}>
          <span className="text-[#EAE4D3] mb-3 font-bold">01.</span>
          GENERATIVE DESIGN
        </div>
        <div className="font-inter text-[10px] tracking-[0.3em] uppercase text-primary/60 rotate-180" style={{ writingMode: 'vertical-rl' }}>
          <span className="text-[#8C8C8C] mb-3 font-bold">02.</span>
          BACKEND ARCHITECTURE
        </div>
      </div>

      {/* CENTER: Typography scaled to fit viewport, no cropping */}
      <div className="w-full lg:w-4/5 flex flex-col pt-20 lg:pt-0 relative z-20 mx-auto lg:ml-[10%]">
        <h1 className="hero-heading font-podium uppercase flex flex-col w-full relative z-30">
          {/* BUILD. - cream filled */}
          <div className="text-[clamp(4rem,10vw,12rem)] leading-[0.85] tracking-tighter text-primary">
            BUILD.
          </div>
          {/* CREATE. - beige filled */}
          <div className="text-[clamp(4rem,10vw,12rem)] leading-[0.85] tracking-tighter lg:ml-[5%] text-[#EAE4D3]">
            CREATE.
          </div>
          {/* EVOLVE. - outlined silver/gray */}
          <div className="text-[clamp(4rem,10vw,12rem)] leading-[0.85] tracking-tighter lg:ml-[10%]">
             <span style={{ WebkitTextStroke: '1.5px #8C8C8C', color: 'transparent' }}>
                EVOLVE.
             </span>
          </div>
        </h1>

        {/* Description aligned uniquely */}
        <p className="hero-metadata font-inter text-primary/60 text-sm sm:text-base leading-relaxed max-w-sm mt-12 lg:ml-[10%] border-l border-primary/20 pl-6">
          I build intelligent systems and immersive digital experiences that blur the line between engineering and digital art.
        </p>

        {/* CTA Buttons - Asymmetric alignment */}
        <div className="hero-metadata flex flex-col sm:flex-row gap-6 mt-12 lg:ml-[10%]">
          <button className="bg-[#EAE4D3] text-black rounded-full px-8 py-4 text-xs font-bold tracking-widest uppercase hover:bg-primary transition-colors duration-300 interactive">
            VIEW EXPERIMENTS ↗
          </button>
        </div>
      </div>

      {/* BOTTOM: Grid-aligned Metadata with restrained highlights */}
      <div className="hero-metadata absolute bottom-10 left-6 sm:left-10 lg:left-20 right-6 sm:right-10 lg:right-20 flex justify-between items-end border-t border-primary/20 pt-4 hidden md:flex">
        <div className="font-inter text-[9px] tracking-widest text-primary/60 uppercase">
          <span className="text-primary font-bold">CHIRANJEEV</span> <br/>
          CREATIVE ENGINEERING × DIGITAL SYSTEMS
        </div>
        <div className="font-inter text-[9px] tracking-widest text-primary/60 text-right uppercase flex flex-col items-end gap-1">
          <span>GRID REF: 045.892</span>
          <span className="flex items-center gap-2">
            STATUS: <span className="text-[#EAE4D3]">ONLINE</span> 
            <span className="inline-block w-1.5 h-1.5 bg-[#EAE4D3] rounded-full shadow-[0_0_8px_#EAE4D3]"></span>
          </span>
        </div>
      </div>

    </section>
  );
};
