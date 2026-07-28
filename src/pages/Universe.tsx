import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { FlowJourney } from "../components/FlowJourney";
import { initSmoothScrolling } from "../utils/smoothScroll";

export const Universe = () => {
  const location = useLocation();

  useEffect(() => {
    initSmoothScrolling();
  }, []);

  useEffect(() => {
    // Wait slightly for GSAP ScrollTriggers to measure and pin
    const timeout = setTimeout(() => {
      if (location.hash) {
        const id = location.hash.replace('#', '');
        const element = document.getElementById(id);
        if (element) {
          if (id === 'flow') {
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
    }, 150);

    return () => clearTimeout(timeout);
  }, [location.hash]);

  return (
    <div className="w-full bg-[#050505]">
      <div id="flow">
        <FlowJourney />
      </div>
      <div className="w-full min-h-[50vh] flex flex-col items-center justify-center">
        <h1 className="text-white text-2xl font-podium tracking-widest mt-12">A NEW UNIVERSE IS COMING</h1>
      </div>
    </div>
  );
};
