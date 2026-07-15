import { Menu, X } from "lucide-react";
import { useState, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  useGSAP(() => {
    // Hide the middle links when scrolling away from the top (hero section)
    gsap.to('.nav-links', {
      scrollTrigger: {
        trigger: 'body',
        start: "top -50%", // trigger when scrolled 50vh down
        toggleActions: "play none none reverse"
      },
      opacity: 0,
      pointerEvents: "none",
      duration: 0.3
    });
  }, { scope: navRef });

  return (
    <nav ref={navRef} className="navbar-container fixed top-0 w-full z-50 px-6 sm:px-10 lg:px-16 py-6 flex justify-between items-center mix-blend-difference">
      <div className="font-podium text-2xl tracking-[0.2em] text-primary uppercase cursor-pointer hover:tracking-[0.4em] transition-all duration-500 interactive">
        CHIRANJEEV
      </div>

      <div className="nav-links hidden md:flex gap-8 font-inter text-xs tracking-[0.3em] uppercase text-primary/60">
        <a href="#work" className="hover:text-primary transition-colors interactive">Work</a>
        <a href="#projects" className="hover:text-primary transition-colors interactive">Projects</a>
        <a href="#experiments" className="hover:text-primary transition-colors interactive">Experiments</a>
        <a href="#about" className="hover:text-primary transition-colors interactive">About</a>
        <a href="#contact" className="hover:text-primary transition-colors interactive">Contact</a>
      </div>

      {/* Button removed globally as requested */}
      <div className="hidden md:block w-[200px]"></div> {/* Spacer to keep the logo and center links balanced */}

      <button className="md:hidden text-primary interactive" onClick={toggleMenu}>
        <Menu size={24} />
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-background/95 backdrop-blur-xl z-[60] flex flex-col items-center justify-center">
          <button className="absolute top-6 right-6 text-primary interactive" onClick={toggleMenu}>
            <X size={24} />
          </button>
          <div className="flex flex-col gap-8 font-podium text-4xl uppercase text-center text-primary">
            <a href="#work" onClick={toggleMenu} className="interactive hover:text-accent transition-colors">Work</a>
            <a href="#projects" onClick={toggleMenu} className="interactive hover:text-accent transition-colors">Projects</a>
            <a href="#experiments" onClick={toggleMenu} className="interactive hover:text-accent transition-colors">Experiments</a>
            <a href="#about" onClick={toggleMenu} className="interactive hover:text-accent transition-colors">About</a>
            <a href="#contact" onClick={toggleMenu} className="interactive hover:text-accent transition-colors">Contact</a>
          </div>
        </div>
      )}
    </nav>
  );
};
