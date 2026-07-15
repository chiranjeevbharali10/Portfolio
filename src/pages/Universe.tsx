import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Hero } from "../components/Hero";
import { Manifesto } from "../components/Manifesto";
import { FlowJourney } from "../components/FlowJourney";
import { Projects } from "./Projects";
import { Experiments } from "./Experiments";
import { About } from "./About";
import { initSmoothScrolling } from "../utils/smoothScroll";
import { playHeroTimeline } from "../animations/gsapAnimations";

export const Universe = () => {
  const location = useLocation();

  useEffect(() => {
    initSmoothScrolling();
    
    // Play hero metadata/navbar timeline after a short delay
    const timer = setTimeout(() => {
      playHeroTimeline();
    }, 150);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Wait slightly for GSAP ScrollTriggers to measure and pin
    const timeout = setTimeout(() => {
      if (location.hash) {
        const id = location.hash.replace('#', '');
        const element = document.getElementById(id);
        if (element) {
          if (id === 'flow') {
            // The flow journey section spans 450vh and uses sticky headers.
            // We want to land right at the start of the actual timeline drawing, 
            // skipping the initial circle expansion and fade in.
            // 2.5 * windowHeight puts us at 250vh, which is where the title finishes shrinking.
            const rect = element.getBoundingClientRect();
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const elementTop = rect.top + scrollTop;
            
            window.scrollTo({
              top: elementTop + (window.innerHeight * 2.5),
              behavior: 'instant'
            });
          } else {
            element.scrollIntoView({ behavior: 'instant' });
          }
        }
      }
    }, 150); // 150ms gives React and GSAP enough time to mount and measure the DOM

    return () => clearTimeout(timeout);
  }, [location.hash]);

  return (
    <div className="w-full bg-[#050505]">
      <div id="creativity">
        <Hero />
        <Manifesto />
      </div>
      
      <div id="flow">
        <FlowJourney />
      </div>
      
      <div id="projects">
        <Projects />
      </div>

      <div id="experiments">
        <Experiments />
      </div>

      <div id="about">
        <About />
      </div>
    </div>
  );
};
