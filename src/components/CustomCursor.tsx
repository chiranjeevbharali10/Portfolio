import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export const CustomCursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    gsap.set(cursor, { xPercent: -50, yPercent: -50, scale: 0.1875 });

    const onMouseMove = (e: MouseEvent) => {
      gsap.to(cursor, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.2,
        ease: "power3.out",
      });
    };

    const onMouseEnter = () => {
      gsap.to(cursor, { 
        scale: 1, 
        backgroundColor: "#F5F3E8", 
        mixBlendMode: "difference",
        duration: 0.4,
        ease: "expo.out"
      });
    };

    const onMouseLeave = () => {
      gsap.to(cursor, { 
        scale: 0.1875, 
        backgroundColor: "#00ff66", 
        mixBlendMode: "normal",
        duration: 0.4,
        ease: "expo.out"
      });
    };

    window.addEventListener("mousemove", onMouseMove);

    const addHoverEvents = () => {
      const interactiveElements = document.querySelectorAll("a, button, .interactive");
      interactiveElements.forEach((el) => {
        el.addEventListener("mouseenter", onMouseEnter);
        el.addEventListener("mouseleave", onMouseLeave);
      });
    };

    setTimeout(addHoverEvents, 500);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      const interactiveElements = document.querySelectorAll("a, button, .interactive");
      interactiveElements.forEach((el) => {
        el.removeEventListener("mouseenter", onMouseEnter);
        el.removeEventListener("mouseleave", onMouseLeave);
      });
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className="fixed top-0 left-0 w-16 h-16 bg-accent rounded-full pointer-events-none z-[100]"
      style={{ willChange: "transform" }}
    />
  );
};
