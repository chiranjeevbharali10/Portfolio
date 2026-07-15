import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Hero } from "../components/Hero";
import { Manifesto } from "../components/Manifesto";
import { ReadyTransition } from "../components/ReadyTransition";
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
            // The flow section has a pinned ScrollTrigger that spans 150vh.
            // If we just scrollIntoView, we land at the start (black screen).
            // We want to land at the END of the animation (fully green screen).
            // 1.45 ensures we are 96% through the animation, text is fully visible, but we haven't unpinned yet.
            const rect = element.getBoundingClientRect();
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const elementTop = rect.top + scrollTop;
            
            window.scrollTo({
              top: elementTop + (window.innerHeight * 1.45),
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
    <>
      <div id="creativity">
        <Hero />
        <Manifesto />
      </div>
      
      <div id="flow">
        <ReadyTransition />
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
    </>
  );
};
