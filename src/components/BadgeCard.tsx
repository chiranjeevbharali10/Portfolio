import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PROJECTS } from '../data/projects';
import { CREAM, INK, ProjectBadge, ProjectVinyl } from './projects/ProjectBadge';
import { loadProjects } from '../utils/routePrefetch';

/**
 * Landing "record player of projects": the badge plays a tiny live demo of each project
 * in turn, the vinyl shows its track. The whole card opens the /projects page.
 * Styled after the SMOI site: cream + pastels, charcoal borders, hard offset shadows.
 */

const AUTO_MS = 6000;

// Both disks the same size, as large as the card allows (stays round in any card shape)
const DISK = { width: 'min(86cqw, 41cqh)', height: 'min(86cqw, 41cqh)' };

export const BadgeCard = ({ className = '' }: { className?: string }) => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const project = PROJECTS[index];

  // Cycle through the projects, paused while the visitor is pointing at the card
  useEffect(() => {
    if (paused) return;
    const id = window.setTimeout(() => setIndex((i) => (i + 1) % PROJECTS.length), AUTO_MS);
    return () => window.clearTimeout(id);
  }, [index, paused]);

  return (
    <Link
      to="/projects"
      aria-label="See my projects"
      onPointerEnter={() => { setPaused(true); loadProjects(); }}
      onPointerLeave={() => setPaused(false)}
      onFocus={loadProjects}
      className={`group relative block rounded-[24px] sm:rounded-[32px] overflow-hidden border-2 p-2 sm:p-2.5 transition-transform duration-500 hover:scale-[0.98] ${className}`}
      style={{ background: CREAM, borderColor: INK, color: INK, boxShadow: `0 6px 0 ${INK}` }}
    >
      {/* Size container: everything inside is sized in container units */}
      <div
        className="relative w-full h-full border-2 rounded-[18px] sm:rounded-[24px] flex flex-col items-center justify-evenly overflow-hidden px-3 py-2.5"
        style={{
          containerType: 'size',
          borderColor: INK,
          backgroundImage: 'radial-gradient(#c9d8f4 1px, transparent 1.2px)',
          backgroundSize: '12px 12px',
        }}
      >
        {/* Header: highlighted label + which project is playing */}
        <div className="w-full flex items-center justify-between leading-none">
          <span className="relative font-minecraft tracking-widest px-[3px]" style={{ fontSize: 'clamp(10px, 8.5cqw, 16px)' }}>
            {/* highlighter mark, like the SMOI site's headings */}
            <span
              className="absolute left-0 right-0 bottom-[-2px] h-[60%] rounded-[3px] transition-colors duration-500"
              style={{ background: project.color }}
              aria-hidden="true"
            />
            <span className="relative">PROJECTS</span>
          </span>
          <div className="flex gap-[3px]" aria-hidden="true">
            {PROJECTS.map((p, i) => (
              <span
                key={p.id}
                className="w-[8px] h-[8px] rounded-full border-[1.5px] transition-colors duration-500"
                style={{ borderColor: INK, background: i === index ? p.color : 'transparent' }}
              />
            ))}
          </div>
        </div>

        <ProjectBadge project={project} style={DISK} className="transition-transform duration-500 group-hover:scale-[1.03]" />

        <ProjectVinyl
          project={project}
          className="transition-transform duration-500 group-hover:scale-[1.03] group-hover:rotate-12"
          style={{ ...DISK, fontSize: 'clamp(7px, 5cqw, 12px)' }}
        />
      </div>
    </Link>
  );
};
