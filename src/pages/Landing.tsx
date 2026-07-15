import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

export const Landing = () => {
  return (
    <section className="min-h-screen w-full bg-[#050505] p-6 sm:p-10 lg:p-16 flex items-center justify-center overflow-hidden">
      
      <div className="w-full max-w-[1400px] mx-auto flex flex-col md:flex-row gap-6 md:h-[80vh]">
        
        {/* LEFT COLUMN (1/3) */}
        <div className="w-full md:w-1/3 flex flex-col gap-6">
          
          {/* GREEN FLOW CARD */}
          <Link 
            to="/universe#flow" 
            className="group relative flex-1 min-h-[250px] bg-[#35fe5d] rounded-[24px] sm:rounded-[32px] p-6 sm:p-8 overflow-hidden transition-transform duration-500 hover:scale-[0.98] border border-white/5"
          >
            <div className="absolute inset-0 bg-[url('/fonts/star-01.svg')] bg-no-repeat bg-right-top bg-[length:150px] opacity-10 translate-x-10 -translate-y-10 group-hover:rotate-12 transition-transform duration-700"></div>
            <div className="relative z-10 h-full flex flex-col justify-between">
              <h2 className="font-podium text-3xl sm:text-4xl text-black tracking-tight leading-none uppercase">
                GROW WITH<br/>THE FLOW
              </h2>
              <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-[#35fe5d] group-hover:scale-110 transition-transform">
                <ArrowUpRight size={20} />
              </div>
            </div>
          </Link>

          {/* EXPERIMENTS & ABOUT (50/50 split row) */}
          <div className="flex gap-6 min-h-[160px]">
            <Link 
              to="/universe#experiments" 
              className="group relative flex-1 bg-[#0c0c0c] rounded-[24px] sm:rounded-[32px] p-6 overflow-hidden transition-transform duration-500 hover:scale-[0.98] border border-white/5"
            >
              <div className="relative z-10 h-full flex flex-col justify-between">
                <h2 className="font-podium text-2xl text-primary tracking-wide uppercase">EXP</h2>
                <div className="w-8 h-8 rounded-full border border-primary/20 flex items-center justify-center text-primary/60 group-hover:border-primary group-hover:text-primary transition-all self-end">
                  <ArrowUpRight size={16} />
                </div>
              </div>
            </Link>

            <Link 
              to="/universe#about" 
              className="group relative flex-1 bg-[#0c0c0c] rounded-[24px] sm:rounded-[32px] p-6 overflow-hidden transition-transform duration-500 hover:scale-[0.98] border border-white/5"
            >
              <div className="relative z-10 h-full flex flex-col justify-between">
                <h2 className="font-podium text-lg text-primary tracking-wide uppercase">ABOUT</h2>
                <div className="w-8 h-8 rounded-full border border-primary/20 flex items-center justify-center text-primary/60 group-hover:border-primary group-hover:text-primary transition-all self-end">
                  <ArrowUpRight size={16} />
                </div>
              </div>
            </Link>
          </div>

          {/* PROJECTS CARD */}
          <Link 
            to="/universe#projects" 
            className="group relative min-h-[160px] bg-[#0c0c0c] rounded-[24px] sm:rounded-[32px] p-6 sm:p-8 overflow-hidden transition-transform duration-500 hover:scale-[0.98] border border-white/5"
          >
            <div className="relative z-10 h-full flex flex-col justify-between md:flex-row md:items-end">
              <div>
                <h2 className="font-podium text-3xl sm:text-4xl text-primary tracking-tight uppercase">PROJECTS</h2>
                <p className="mt-2 font-inter text-primary/40 uppercase tracking-[0.2em] text-xs">Systems & Applications</p>
              </div>
              <div className="w-10 h-10 mt-6 md:mt-0 rounded-full border border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-all">
                <ArrowUpRight size={20} />
              </div>
            </div>
          </Link>
        </div>

        {/* RIGHT COLUMN (2/3) */}
        <div className="w-full md:w-2/3 h-[500px] md:h-full">
          {/* MAIN CREATIVITY CARD */}
          <Link 
            to="/universe#creativity" 
            className="group relative block w-full h-full bg-[#0c0c0c] rounded-[24px] sm:rounded-[32px] p-8 sm:p-12 overflow-hidden transition-transform duration-500 hover:scale-[0.98] border border-white/5"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-50"></div>
            
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-black group-hover:scale-110 transition-transform self-end">
                <ArrowUpRight size={20} />
              </div>
              
              <div className="mt-20 md:mt-0">
                <h2 className="font-podium text-5xl sm:text-6xl lg:text-[100px] text-primary tracking-tighter leading-[0.85] uppercase drop-shadow-lg">
                  CREATIVITY<br/>
                  MAKES ANYTHING<br/>
                  POSSIBLE
                </h2>
                <p className="mt-6 font-inter text-primary/40 uppercase tracking-[0.2em] text-xs">Enter the cinematic experience</p>
              </div>
            </div>
          </Link>
        </div>

      </div>

    </section>
  );
};
