import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ShowcaseCard } from '../components/ShowcaseCard';
import { Link } from 'react-router-dom';

export const Projects = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Basic stagger animation for the content
    gsap.fromTo(".project-item", 
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out', delay: 0.8 } // Wait for transition to finish
    );
  }, []);

  return (
    <section ref={containerRef} className="relative w-full min-h-screen bg-[#FFF4E4] p-8 sm:p-12 lg:p-16 text-black overflow-hidden selection:bg-black selection:text-[#FFF4E4]">
      {/* Top Center Shared Card */}
      {/* Position matches targetTop (32px = top-8) and width/height from transition math */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 w-[160px] h-[80px] z-50">
        <ShowcaseCard layout="horizontal" className="w-full h-full shadow-lg" />
      </div>

      <div className="max-w-7xl mx-auto mt-24">
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-16 project-item gap-4">
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-2">Selected Works</h1>
            <p className="opacity-60 font-mono text-sm uppercase tracking-widest">2024 — 2026</p>
          </div>
          <Link 
            to="/"
            className="text-sm font-mono tracking-widest uppercase hover:opacity-50 transition-opacity underline underline-offset-4"
          >
            [ Back ]
          </Link>
        </header>

        {/* Project Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="aspect-[4/3] bg-black/5 rounded-3xl p-8 flex flex-col justify-end project-item transition-colors hover:bg-black/10 cursor-pointer">
            <h2 className="text-2xl font-bold mb-2">Project Alpha</h2>
            <p className="opacity-70">E-Commerce Experience</p>
          </div>
          
          <div className="aspect-[4/3] bg-black/5 rounded-3xl p-8 flex flex-col justify-end project-item transition-colors hover:bg-black/10 cursor-pointer">
            <h2 className="text-2xl font-bold mb-2">Project Beta</h2>
            <p className="opacity-70">Brand Identity</p>
          </div>
          
          <div className="aspect-[4/3] bg-black/5 rounded-3xl p-8 flex flex-col justify-end md:col-span-2 project-item transition-colors hover:bg-black/10 cursor-pointer">
            <h2 className="text-2xl font-bold mb-2">Project Gamma</h2>
            <p className="opacity-70">Web Application</p>
          </div>
        </div>
      </div>
    </section>
  );
};
