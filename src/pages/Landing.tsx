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
        <div className="w-full md:w-2/3 h-[500px] md:h-full">
          {/* MAIN CREATIVITY CARD */}
          <Link 
            to="/universe#creativity" 
            className="group relative flex w-full h-full items-center justify-center bg-[#0c0c0c] rounded-[24px] sm:rounded-[32px] p-6 overflow-hidden transition-transform duration-500 hover:scale-[0.98] border border-[#0000ff]"
          >
            {/* Mesh Background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#0000ff2e_1px,transparent_1px),linear-gradient(to_bottom,#0000ff2e_1px,transparent_1px)] bg-[size:40px_40px] opacity-40 group-hover:scale-105 transition-transform duration-1000"></div>
            
            {/* Top Left Text */}
            <div className="absolute top-6 left-8 font-inter text-[10px] text-white/60 tracking-widest z-20">
              chiranjeevbharali10
            </div>

            {/* Bottom Left Text */}
            <div className="absolute bottom-6 left-8 font-inter text-[10px] text-white/60 tracking-widest z-20 flex items-center gap-4">
              <span>0026</span>
              <span className="w-14 h-px bg-white/40"></span>
              <span>15'</span>
            </div>

            <img 
              src="/fonts/CREATIVITYMAKESSS-01.svg" 
              alt="Creativity Makes Anything Possible" 
              className="relative z-10 w-[85%] h-[85%] object-contain transition-transform duration-700 group-hover:scale-105" 
            />
          </Link>
        </div>

      </div>

    </section>
  );
};
