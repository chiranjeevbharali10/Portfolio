import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Observer } from "gsap/Observer";
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";

gsap.registerPlugin(ScrollTrigger, Observer, SplitText, CustomEase);

export const playHeroTimeline = () => {
  const tl = gsap.timeline({
    defaults: { ease: "expo.out" }
  });
  
  tl.fromTo(".navbar-container", 
    { opacity: 0, y: -30 },
    { opacity: 1, y: 0, duration: 1.5 }
  )
  .fromTo(".tech-label",
    { opacity: 0, x: -30 },
    { opacity: 1, x: 0, duration: 1, stagger: 0.2 },
    "-=1"
  );
  
  // Experimental chaotic SplitText reveal
  const headingSplit = new SplitText(".hero-heading", { type: "words,chars" });
  tl.fromTo(headingSplit.chars,
    { 
      opacity: 0, 
      y: () => gsap.utils.random(50, 150),
      x: () => gsap.utils.random(-50, 50),
      rotationZ: () => gsap.utils.random(-15, 15),
      scale: () => gsap.utils.random(0.5, 1.5)
    },
    { 
      opacity: 1, 
      y: 0, 
      x: 0,
      rotationZ: 0,
      scale: 1,
      duration: 1.8, 
      stagger: 0.04,
      ease: "power4.out"
    },
    "-=0.8"
  )
  .fromTo(".hero-metadata",
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 1 },
    "-=1"
  )
  .fromTo(".floating-poster-element",
    { opacity: 0, scale: 0.8, y: 30 },
    { opacity: 1, scale: 1, y: 0, duration: 1.2, stagger: 0.15 },
    "-=1.2"
  )
  .add("floatingObjectsStart", "-=0.5");

  return tl;
};
