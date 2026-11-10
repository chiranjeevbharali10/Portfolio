import React, { useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { IslandJourney5 } from '../components/IslandJourney5';
import { FlowJourney } from '../components/FlowJourney';
import { SkillsShooter } from '../components/skills-shooter/SkillsShooter';
import { ProjectsInvite } from '../components/ProjectsInvite';
import { RelaxInvite } from '../components/RelaxInvite';
import { lenis } from '../utils/smoothScroll';

// How far into the flow section to land: the "Grow With The Flow" title is fully in at 150vh
const FLOW_ENTRY_OFFSET_VH = 1.5;

export const IslandJourney5Page: React.FC = () => {
  const location = useLocation();

  // Immersive scroll-driven page: hide the browser scrollbar while it's mounted.
  useEffect(() => {
    document.documentElement.classList.add('no-scrollbar');
    return () => document.documentElement.classList.remove('no-scrollbar');
  }, []);

  // The page is one chain: island -> flow -> skills. A hash just picks where in the
  // chain you start, so you can still scroll back to the island or on to skills.
  const handleIslandReady = useCallback(() => {
    const id = location.hash.replace('#', '');
    if (!id) return;

    // Wait a frame so the island's ScrollTriggers have laid out before measuring
    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      const el = document.getElementById(id);
      if (!el) return;

      const offset = id === 'flow' ? window.innerHeight * FLOW_ENTRY_OFFSET_VH : 0;
      const top = el.getBoundingClientRect().top + window.scrollY + offset;

      if (lenis) lenis.scrollTo(top, { immediate: true, force: true });
      else window.scrollTo({ top, behavior: 'instant' });
    });
  }, [location.hash]);

  return (
    <div className="w-full min-h-screen bg-black">
      <IslandJourney5 onReady={handleIslandReady} />
      <div id="flow">
        <FlowJourney />
      </div>
      <div id="skills">
        <SkillsShooter />
      </div>
      <ProjectsInvite />
      <RelaxInvite />
    </div>
  );
};
