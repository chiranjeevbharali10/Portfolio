import { useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { FloatingObjects } from "./components/FloatingObjects";
import { CustomCursor } from "./components/CustomCursor";
import { CinematicBackground } from "./components/CinematicBackground";
import { Manifesto } from "./components/Manifesto";
import { initSmoothScrolling } from "./utils/smoothScroll";
import { playHeroTimeline } from "./animations/gsapAnimations";

function App() {
  useEffect(() => {
    initSmoothScrolling();
    
    // Play hero metadata/navbar timeline after a short delay
    const timer = setTimeout(() => {
      playHeroTimeline();
    }, 150);

    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="relative w-full min-h-screen bg-transparent selection:bg-accent selection:text-black">
      <CustomCursor />
      <CinematicBackground />
      <FloatingObjects />
      
      <Navbar />
      <Hero />
      <Manifesto />
      
      {/* Future sections would go here */}
      <section id="work" className="min-h-screen w-full relative z-10 flex items-center justify-center border-t border-primary/10">
         <h2 className="font-podium text-4xl text-primary/20 tracking-widest">WORK SECTION</h2>
      </section>
    </main>
  );
}

export default App;
