import { useRef, useMemo } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';

const PHRASE_LINES = [
  "CREATIVITY",
  "MAKES ANYTHING",
  "POSSIBLE"
];

const LETTER_MAP: Record<string, string[]> = {
    'A': ['A_fist-01.svg', 'A_second-01.svg', 'A_second-01.svg'],
    'B': ['B-01.svg'],
    'C': ['C-01.svg'],
    'E': ['E-01.svg', 'E-01.svg', 'E-01.svg'],
    'G': ['G-01.svg'],
    'H': ['H-01.svg'],
    'I': ['I-01.svg', 'I-01.svg', 'I-01.svg', 'I-01.svg'],
    'K': ['K-01.svg'],
    'L': ['L-01.svg'],
    'M': ['M-01.svg'],
    'N': ['N-01.svg', 'N-01.svg'],
    'O': ['O-01.svg'],
    'P': ['P-01.svg'],
    'R': ['R-01.svg'],
    'S': ['S-01_fist-01.svg', 'S_second-01.svg', 'S_second-01.svg'],
    'T': ['T-01.svg', 'T-01.svg', 'T-01.svg'],
    'V': ['V-01.svg'],
    'Y': ['Y-01.svg', 'Y-01.svg'],
};

export const HeroCard = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const letters = useMemo(() => {
    const occurrences: Record<string, number> = {};
    const lines = [];
    
    for (const line of PHRASE_LINES) {
      const lineData = [];
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === ' ') {
          lineData.push({ char: ' ', src: null });
          continue;
        }
        
        if (!occurrences[char]) occurrences[char] = 1;
        else occurrences[char]++;
        
        const count = occurrences[char];
        const files = LETTER_MAP[char] || [`${char}-01.svg`]; 
        const file = files[count - 1] || files[0] || `${char}-01.svg`;
        
        lineData.push({ char, src: `/fonts/${file}` });
      }
      lines.push(lineData);
    }
    return lines;
  }, []);

  useGSAP(() => {
    const letterEls = gsap.utils.toArray<HTMLElement>('.hero-card-letter');
    
    // Initial hidden state
    gsap.set(letterEls, {
      opacity: 0,
      scale: 0.8,
      y: 20,
    });

    // Staggered reveal
    gsap.to(letterEls, {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: 1.2,
      delay: 0.2,
      stagger: {
        each: 0.04,
        from: "start"
      },
      ease: "power3.out"
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="relative h-full w-full flex flex-col justify-center items-center px-4 sm:px-8 overflow-hidden">
      
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-50"></div>

      {/* LEFT: Technical Labels */}
      <div className="absolute left-6 top-[20%] flex flex-col gap-8 hidden xl:flex opacity-60">
        <div className="font-inter text-[8px] tracking-[0.3em] uppercase text-primary/60 rotate-180" style={{ writingMode: 'vertical-rl' }}>
          <span className="text-[#EAE4D3] mb-2 font-bold">01.</span>
          GENERATIVE
        </div>
        <div className="font-inter text-[8px] tracking-[0.3em] uppercase text-primary/60 rotate-180" style={{ writingMode: 'vertical-rl' }}>
          <span className="text-[#8C8C8C] mb-2 font-bold">02.</span>
          SYSTEMS
        </div>
      </div>

      {/* CENTER: SVG Typography (Scaled Down) */}
      <div className="w-full flex flex-col relative z-20 mx-auto items-center origin-center scale-[0.6] sm:scale-75 lg:scale-[0.8] xl:scale-90">
        
        <div className="flex flex-col w-full relative z-30 mb-6 items-center justify-center">
          {letters.map((line, lineIndex) => (
            <div 
              key={lineIndex} 
              className={`flex justify-center items-end ${
                lineIndex === 1 ? 'translate-y-[15px]' :
                lineIndex === 2 ? 'translate-y-[30px]' :
                ''
              }`}
            >
              {line.map((letter, letterIndex) => {
                return (
                <div 
                  key={`${lineIndex}-${letterIndex}`} 
                  className={`flex items-center justify-center ${
                    letter.char === ' ' ?  'w-[2.5vw] lg:w-[1.5vw]' : 'mx-[0.2vw]' 
                  }`}
                >
                  {letter.src && (
                    <div className="hero-card-letter relative will-change-transform">
                      <img 
                        src={letter.src} 
                        alt={letter.char} 
                        className="h-[5vw] lg:h-[3.5vw] w-auto object-contain block opacity-90 drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]"
                      />
                    </div>
                  )}
                </div>
              )})}
            </div>
          ))}
        </div>

        <p className="font-inter text-primary/60 text-xs sm:text-sm leading-relaxed max-w-[280px] mt-10 border-l border-primary/20 pl-4 text-center sm:text-left">
          I build intelligent systems and immersive digital experiences that blur the line between engineering and digital art.
        </p>

        <div className="flex gap-4 mt-8">
          <div className="bg-[#EAE4D3] text-black rounded-full px-6 py-3 text-[10px] font-bold tracking-widest uppercase transition-colors duration-300">
            VIEW EXPERIMENTS ↗
          </div>
        </div>
      </div>

      {/* BOTTOM: Grid-aligned Metadata */}
      <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end border-t border-primary/20 pt-3 hidden md:flex opacity-60">
        <div className="font-inter text-[7px] tracking-widest text-primary/60 uppercase">
          <span className="text-primary font-bold">CHIRANJEEV</span> <br/>
          CREATIVE ENG × SYSTEMS
        </div>
        <div className="font-inter text-[7px] tracking-widest text-primary/60 text-right uppercase flex flex-col items-end gap-1">
          <span>REF: 045.892</span>
          <span className="flex items-center gap-1.5">
            STATUS: <span className="text-[#EAE4D3]">ONLINE</span> 
            <span className="inline-block w-1 h-1 bg-[#EAE4D3] rounded-full shadow-[0_0_5px_#EAE4D3]"></span>
          </span>
        </div>
      </div>

    </div>
  );
};
