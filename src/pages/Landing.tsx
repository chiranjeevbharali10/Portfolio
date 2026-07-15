import { Link } from "react-router-dom";

export const Landing = () => {
  return (
    <section className="min-h-screen w-full bg-[#050505] p-6 sm:p-10 lg:p-16 flex items-center justify-center overflow-hidden">
      
      <div className="w-full max-w-[1400px] mx-auto flex flex-col md:flex-row gap-6 md:h-[80vh]">
        
        {/* LEFT COLUMN (1/3) */}
        <div className="w-full md:w-1/3 flex flex-col gap-6">
          
          {/* GREEN FLOW CARD */}
          <Link 
            to="/universe#flow" 
            className="group relative h-[180px] sm:h-[220px] shrink-0 bg-[#35fe5d] rounded-[24px] sm:rounded-[32px] p-4 sm:p-6 overflow-hidden transition-transform duration-500 hover:scale-[0.98] border border-white/5 flex flex-col items-center justify-center"
          >
            {/* Top Right Stars */}
            <div className="absolute top-4 right-6 flex gap-1 opacity-40">
              <span className="text-black text-xl">✦</span>
              <span className="text-black text-xl">✦</span>
              <span className="text-black text-xl">✦</span>
            </div>

            {/* Bottom Left Symbols */}
            <div className="absolute bottom-4 left-6 flex gap-2 opacity-40 text-black font-mono text-xs tracking-widest">
              * 〰 ↙
            </div>

            <img 
              src="/fonts/GROW-WITH-THE-FLOW.svg" 
              alt="Grow With The Flow" 
              className="relative z-10 w-[95%] h-[95%] object-contain brightness-0 transition-transform duration-700 group-hover:scale-105" 
            />
          </Link>

          {/* BOTTOM SECTION (Projects Left, Exp & About Right) */}
          <div className="flex gap-6 flex-1 min-h-[250px]">
            
            {/* LEFT: PROJECTS (Tall Card) */}
            <Link 
              to="/universe#projects" 
              className="group relative flex-1 bg-[#0c0c0c] rounded-[24px] sm:rounded-[32px] p-6 overflow-hidden transition-transform duration-500 hover:scale-[0.98] border border-white/5 flex flex-col justify-between"
            >
              <h2 className="font-podium text-2xl sm:text-3xl text-primary tracking-tight uppercase">PROJECTS</h2>
            </Link>

            {/* RIGHT: EXPERIMENTS & ABOUT (Stacked) */}
            <div className="flex flex-col gap-6 flex-1">
              <Link 
                to="/universe#experiments" 
                className="group relative flex-1 bg-[#0c0c0c] rounded-[24px] sm:rounded-[32px] p-6 overflow-hidden transition-transform duration-500 hover:scale-[0.98] border border-white/5 flex flex-col justify-end"
              >
                <h2 className="font-podium text-xl text-primary tracking-wide uppercase">EXP</h2>
              </Link>

              <Link 
                to="/universe#about" 
                className="group relative flex-1 bg-[#0c0c0c] rounded-[24px] sm:rounded-[32px] p-6 overflow-hidden transition-transform duration-500 hover:scale-[0.98] border border-white/5 flex flex-col justify-end"
              >
                <h2 className="font-podium text-xl text-primary tracking-wide uppercase">ABOUT</h2>
              </Link>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN (2/3) */}
        <div className="w-full md:w-2/3 h-[500px] md:h-full p-2 md:p-0">
          {/* MAIN CREATIVITY POSTER */}
          <Link 
            to="/universe#creativity" 
            className="group relative flex w-full h-full items-center justify-center bg-[#050508] rounded-[24px] sm:rounded-[28px] p-8 overflow-hidden transition-all duration-700 hover:scale-[0.99] shadow-2xl border-2 border-[#1b6bff]/80"
          >
            {/* Vibrant Warped SVG Grid Texture - Evenly Lit */}
            <div className="absolute inset-[-5%] z-0 opacity-50 group-hover:opacity-80 transition-opacity duration-1000 flex items-center justify-center pointer-events-none">
              <svg viewBox="0 0 1000 1000" className="w-full h-full text-[#1b6bff]">
                <g>
                  {Array.from({ length: 26 }).map((_, i) => {
                    const pos = i * 40;
                    const center = 500;
                    const dist = 0.12; // Wavy grid
                    const d = (pos - center) * dist;
                    return (
                      <g key={i}>
                        <path d={`M ${pos} -50 Q ${pos + d} 500 ${pos} 1050`} fill="none" stroke="currentColor" strokeWidth="1" />
                        <path d={`M -50 ${pos} Q 500 ${pos + d} 1050 ${pos}`} fill="none" stroke="currentColor" strokeWidth="1" />
                      </g>
                    );
                  })}
                </g>
              </svg>
            </div>

            {/* Top Left Text */}
            <div className="absolute top-6 left-8 font-inter text-[10px] text-white tracking-widest z-20">
              chiranjeevbharali10
            </div>

            {/* Top Right Icon */}
            <div className="absolute top-6 right-8 z-20">
              <img src="/fonts/earth-01.svg" alt="Earth" className="w-12 h-12 opacity-90" />
            </div>

            {/* Bottom Left Text */}
            <div className="absolute bottom-6 left-8 font-inter text-[10px] text-white tracking-widest z-20 flex items-center gap-4">
              <span>07</span>
              <span className="w-14 h-px bg-white"></span>
              <span>'26</span>
            </div>

            {/* Bottom Right Icon */}
            <div className="absolute bottom-6 right-8 z-20">
              <img src="/fonts/xx.svg" alt="Icon" className="w-14 h-14 opacity-90" />
            </div>

            {/* Main Typography Artwork */}
            <img 
              src="/fonts/CREATIVITYMAKESSS-01.svg" 
              alt="Creativity Makes Anything Possible" 
              className="relative z-30 w-[90%] h-[90%] object-contain transition-transform duration-1000 group-hover:scale-[1.03]" 
            />
          </Link>
        </div>

      </div>

    </section>
  );
};
