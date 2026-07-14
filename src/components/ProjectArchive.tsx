import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

type CardSize = 'large' | 'medium' | 'small';

const CARDS: { id: string, size: CardSize, color: string, isCluster?: boolean }[] = [
  { id: '01', size: 'large', color: '#DFFF00', isCluster: true }, 
  { id: '02', size: 'medium', color: '#8B35FF' },
  { id: '03', size: 'small', color: '#FF6B1A', isCluster: true },
  { id: '04', size: 'medium', color: '#FF2D9A' },
  { id: '05', size: 'large', color: '#00E5FF', isCluster: true },
  { id: '06', size: 'small', color: '#DFFF00' },
  { id: '07', size: 'medium', color: '#2563FF', isCluster: true },
  { id: '08', size: 'small', color: '#8B35FF' },
  { id: '09', size: 'large', color: '#DFFF00', isCluster: true },
  { id: '10', size: 'medium', color: '#FF2D9A', isCluster: true },
  { id: '11', size: 'small', color: '#FF6B1A' },
  { id: '12', size: 'small', color: '#00E5FF' },
  { id: '13', size: 'small', color: '#DFFF00' },
  { id: '14', size: 'small', color: '#FF2D9A' },
  { id: '15', size: 'small', color: '#8B35FF' },
];

export const ProjectArchive = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const cards = gsap.utils.toArray<HTMLElement>('.archive-card');

    // PRE-CALCULATE STATES
    
    // Phase 2: Editorial Collage (Curated Hierarchy)
    // Large near center, Medium surrounding, Small filling gaps
    const collageStates = CARDS.map((card) => {
      let x, y, z, rotation;
      if (card.size === 'large') {
        x = gsap.utils.random(-300, 300);
        y = gsap.utils.random(-200, 200);
        z = gsap.utils.random(50, 150);
        rotation = gsap.utils.random(-8, 8);
      } else if (card.size === 'medium') {
        x = gsap.utils.random(-500, 500);
        y = gsap.utils.random(-350, 350);
        z = gsap.utils.random(-100, 50);
        rotation = gsap.utils.random(-15, 15);
      } else {
        x = gsap.utils.random(-700, 700);
        y = gsap.utils.random(-500, 500);
        z = gsap.utils.random(-300, -50);
        rotation = gsap.utils.random(-25, 25);
      }
      return { x, y, z, rotation };
    });

    // Phase 4: Controlled Physical Explosion
    const explodeStates = CARDS.map((card, i) => {
      // Small cards fly far and fast, Large cards stay heavier/closer
      const multiplier = card.size === 'large' ? 1 : card.size === 'medium' ? 2 : 3.5;
      
      const dirX = collageStates[i].x > 0 ? 1 : -1;
      const dirY = collageStates[i].y > 0 ? 1 : -1;

      return {
        x: collageStates[i].x + (gsap.utils.random(200, 700) * multiplier * dirX),
        y: collageStates[i].y + (gsap.utils.random(150, 500) * multiplier * dirY),
        z: collageStates[i].z + gsap.utils.random(-1000, 800), 
        rotationX: gsap.utils.random(-90, 90) * (multiplier * 0.5),
        rotationY: gsap.utils.random(-90, 90) * (multiplier * 0.5),
        rotationZ: collageStates[i].rotation + gsap.utils.random(-45, 45) * multiplier,
      };
    });

    // Phase 5: Multi Card Zoom Cluster Target Positions
    const clusterStates = CARDS.map((card) => {
       if (card.isCluster) {
          // Bring them to the front and center slightly offset to form an overlapping cluster
          return {
             x: gsap.utils.random(-150, 150),
             y: gsap.utils.random(-150, 150),
             z: gsap.utils.random(200, 400), 
             rotationX: gsap.utils.random(-5, 5),
             rotationY: gsap.utils.random(-10, 10),
             rotationZ: gsap.utils.random(-10, 10),
          }
       }
       return null;
    });

    // SET INITIAL STATE (PHASE 1): Right-aligned Elliptical Arc
    cards.forEach((card, i) => {
      // Ellipse center outside right viewport
      const cx = window.innerWidth * 0.7; 
      const cy = 0;
      const rx = window.innerWidth * 0.6;
      const ry = window.innerHeight * 1.5;
      
      // We only want the left arc of the ellipse
      const angleSpan = Math.PI * 0.7;
      const startAngle = Math.PI - (angleSpan / 2);
      const angle = startAngle + (i / (cards.length - 1)) * angleSpan;

      gsap.set(card, {
        x: cx + Math.cos(angle) * rx,
        y: cy + Math.sin(angle) * ry,
        z: gsap.utils.random(-100, 50),
        rotation: (angle * 180 / Math.PI) - 180 + gsap.utils.random(-10, 10),
      });
      
      // Subtle idle floating continuous loop
      gsap.to(card, {
        y: `+=${gsap.utils.random(15, 30)}`,
        x: `+=${gsap.utils.random(-5, 5)}`,
        z: `+=${gsap.utils.random(-20, 20)}`,
        rotation: `+=${gsap.utils.random(-3, 3)}`,
        duration: gsap.utils.random(3, 5),
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut"
      });
    });

    // MASTER SCROLL TIMELINE
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top top",
        end: "+=700%", // 700vh scroll depth
        scrub: 1,
        pin: true,
        anticipatePin: 1
      }
    });

    // PHASE 2: Collage Transformation
    tl.to(cards, {
      x: (i) => collageStates[i].x,
      y: (i) => collageStates[i].y,
      z: (i) => collageStates[i].z,
      rotation: (i) => collageStates[i].rotation,
      rotationX: 0,
      rotationY: 0,
      duration: 2,
      ease: "power3.inOut"
    });

    // PHASE 3: Hold (Pause)
    tl.to({}, { duration: 1.5 });

    // PHASE 4: Controlled Explosion
    // 4.1 Anticipation (Compression Phase to create tension)
    tl.to(cards, {
      x: (i) => collageStates[i].x * 0.8,
      y: (i) => collageStates[i].y * 0.8,
      z: (i) => collageStates[i].z - 100,
      duration: 0.5,
      ease: "power2.in"
    });
    // 4.2 Physics Explosion
    tl.to(cards, {
      x: (i) => explodeStates[i].x,
      y: (i) => explodeStates[i].y,
      z: (i) => explodeStates[i].z,
      rotationX: (i) => explodeStates[i].rotationX,
      rotationY: (i) => explodeStates[i].rotationY,
      rotationZ: (i) => explodeStates[i].rotationZ,
      duration: 2,
      ease: "expo.out"
    });

    // PHASE 5: Multi Card Zoom
    // 5.1 Move specific cluster cards into formation while scene begins zoom
    tl.to(cards, {
      x: (i) => clusterStates[i] ? clusterStates[i]!.x : explodeStates[i].x,
      y: (i) => clusterStates[i] ? clusterStates[i]!.y : explodeStates[i].y,
      z: (i) => clusterStates[i] ? clusterStates[i]!.z : explodeStates[i].z,
      rotationX: (i) => clusterStates[i] ? clusterStates[i]!.rotationX : explodeStates[i].rotationX,
      rotationY: (i) => clusterStates[i] ? clusterStates[i]!.rotationY : explodeStates[i].rotationY,
      rotationZ: (i) => clusterStates[i] ? clusterStates[i]!.rotationZ : explodeStates[i].rotationZ,
      duration: 1.5,
      ease: "power3.inOut"
    }, "zoomStart");

    // 5.2 Massive camera push through the cluster, fading to black
    tl.to(sceneRef.current, {
      scale: 4,
      z: 1500,
      opacity: 0,
      duration: 2,
      ease: "power4.in"
    }, "zoomStart+=0.5");

  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className="relative h-screen w-full bg-[#080808] overflow-hidden border-t border-primary/10" style={{ perspective: "1500px" }}>
      {/* Background Editorial Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-20" style={{ 
        backgroundImage: 'linear-gradient(to right, rgba(245,243,232,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(245,243,232,0.05) 1px, transparent 1px)',
        backgroundSize: '4vw 4vw'
      }}></div>

      {/* 3D Scene Container */}
      <div 
        ref={sceneRef} 
        className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {CARDS.map((card, idx) => {
          // Dynamic sizing based on editorial hierarchy
          const sizeClass = 
            card.size === 'large' ? 'w-[280px] h-[392px] md:w-[320px] md:h-[448px]' : 
            card.size === 'medium' ? 'w-[200px] h-[280px] md:w-[240px] md:h-[336px]' : 
            'w-[140px] h-[196px] md:w-[160px] md:h-[224px]';
            
          const fontSize = 
            card.size === 'large' ? 'text-[120px]' : 
            card.size === 'medium' ? 'text-[80px]' : 
            'text-[60px]';

          return (
            <div 
              key={`${card.id}-${idx}`}
              className={`archive-card absolute ${sizeClass} flex flex-col justify-between p-4 md:p-6 border border-primary/20 bg-[#0a0a0a] shadow-2xl overflow-hidden`}
              style={{ 
                borderColor: `${card.color}40`, 
                boxShadow: `0 30px 60px -20px ${card.color}15`
              }}
            >
              {/* Subtle film grain inside the card */}
              <div className="absolute inset-0 opacity-[0.05] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%221.5%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E")' }}></div>
              
              <div className="flex justify-between items-start z-10 w-full opacity-60">
                <div className="font-inter text-[8px] md:text-[10px] tracking-widest uppercase text-primary">Project Archive</div>
                <div className="font-inter text-[8px] md:text-[10px] tracking-widest uppercase text-primary">System {card.id}</div>
              </div>

              <div 
                className={`font-podium ${fontSize} tracking-tighter leading-[0.8] opacity-90 z-10 mt-auto`}
                style={{ color: card.color }}
              >
                {card.id}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  );
};
