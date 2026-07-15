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

export const Hero = () => {
  const containerRef = useRef<HTMLElement>(null);

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
    const letterEls = gsap.utils.toArray<HTMLElement>('.svg-letter');
    
    // Initial hidden state
    gsap.set(letterEls, {
      opacity: 0,
      scale: 0.8,
      y: 30,
      rotation: 0,
    });

    // Staggered reveal
    gsap.to(letterEls, {
      opacity: 1,
      scale: 1,
      y: 0,
      rotation: 0,
      duration: 1.5,
      delay: 0.2,
      stagger: {
        each: 0.05,
        from: "start"
      },
      ease: "power3.out"
    });
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="relative min-h-screen flex items-center px-6 sm:px-10 lg:px-20 z-10 overflow-hidden">
      
      {/* LEvFT: Technical Labels */}
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

      {/* CENTER: SVG Typography */}
      <div className="w-full lg:w-[85%] flex flex-col pt-20 lg:pt-0 relative z-20 mx-auto items-center">
        
        {/* Aspect Ratio Preserved Flexbox Layout */}
        <div className="hero-svg-wrapper flex flex-col w-full relative z-30 mb-8 items-center justify-center origin-center">
          {letters.map((line, lineIndex) => (
              <div 
  key={lineIndex} 
  className={`flex justify-center items-end ${
    lineIndex === 1 ? 'translate-y-[25px]' :
    lineIndex === 2 ? 'translate-y-[50px]' :
    ''
  }`}
>
              {line.map((letter, letterIndex) => {
                return (
                <div 
                  key={`${lineIndex}-${letterIndex}`} 
                    className={`flex items-center justify-center ${
    letter.char === ' ' ?  'w-[3vw] lg:w-[2vw]' : 'mx-[0.3vw] lg:mx-[0.25vw]' 
  }`}
                >
                  {letter.src && (
                    <div className="svg-letter relative will-change-transform">
                      <img 
                        src={letter.src} 
                        alt={letter.char} 
                        className="h-[7vw] lg:h-[4vw] w-auto object-contain block opacity-90 drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)]"
                      />
                    </div>
                  )}
                </div>
              )})}
            </div>
          ))}
        </div>

        <p className="hero-metadata font-inter text-primary/60 text-sm sm:text-base leading-relaxed max-w-sm mt-12 border-l border-primary/20 pl-6 text-center lg:text-left">
          I build intelligent systems and immersive digital experiences that blur the line between engineering and digital art.
        </p>

        <div className="hero-metadata flex flex-col sm:flex-row gap-6 mt-12">
          <button className="bg-[#EAE4D3] text-black rounded-full px-8 py-4 text-xs font-bold tracking-widest uppercase hover:bg-primary transition-colors duration-300 interactive">
            VIEW EXPERIMENTS ↗
          </button>
        </div>
      </div>

      {/* BOTTOM: Grid-aligned Metadata */}
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
