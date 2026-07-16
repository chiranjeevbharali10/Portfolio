import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export const ProjectsMock: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Sequential reveal animation
    const tl = gsap.timeline();
    
    // Everything starts invisible and slightly down
    gsap.set(".reveal-item", { y: 30, opacity: 0 });

    tl.to(containerRef.current, {
      opacity: 1,
      duration: 0.5,
      ease: 'power2.out'
    });

    tl.to(".reveal-item", {
      y: 0,
      opacity: 1,
      duration: 0.8,
      stagger: 0.15,
      ease: 'power3.out'
    }, "-=0.2");
  }, []);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 w-full h-full bg-[#e60090] z-[100] text-white overflow-y-auto opacity-0"
    >
      <div className="max-w-7xl mx-auto p-8 sm:p-12 lg:p-16 min-h-screen flex flex-col">
        {/* Header */}
        <header className="flex justify-between items-center mb-24 reveal-item">
          <h1 className="text-4xl font-bold tracking-tight">Selected Works</h1>
          <button 
            className="text-sm font-mono tracking-widest uppercase hover:opacity-70 transition-opacity"
            onClick={() => window.location.reload()}
          >
            [ Close ]
          </button>
        </header>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1">
          {/* Mock Project 1 */}
          <div className="aspect-[4/3] bg-black/20 rounded-3xl p-8 flex flex-col justify-end reveal-item">
            <h2 className="text-2xl font-bold mb-2">Project Alpha</h2>
            <p className="opacity-80">E-Commerce Experience</p>
          </div>
          
          {/* Mock Project 2 */}
          <div className="aspect-[4/3] bg-black/20 rounded-3xl p-8 flex flex-col justify-end reveal-item">
            <h2 className="text-2xl font-bold mb-2">Project Beta</h2>
            <p className="opacity-80">Brand Identity</p>
          </div>
          
          {/* Mock Project 3 */}
          <div className="aspect-[4/3] bg-black/20 rounded-3xl p-8 flex flex-col justify-end reveal-item md:col-span-2">
            <h2 className="text-2xl font-bold mb-2">Project Gamma</h2>
            <p className="opacity-80">Web Application</p>
          </div>
        </div>
      </div>
    </div>
  );
};
