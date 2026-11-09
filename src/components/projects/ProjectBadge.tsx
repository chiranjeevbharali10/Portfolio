import { useId } from 'react';
import type { ComponentType, CSSProperties } from 'react';
import type { Project, ProjectId } from '../../data/projects';
import { AiCarMini } from './AiCarMini';
import { ArtTransferMini } from './ArtTransferMini';
import { LlmMini } from './LlmMini';
import { SmoiMini } from './SmoiMini';

export const INK = '#514b50';

export const CREAM = '#fff1d6';
export const PANEL = '#fffaee';

// Callers may position the disk themselves (e.g. absolute); otherwise it's relative
const pos = (className: string) => (className.split(" ").some((c) => c === "absolute" || c === "fixed") ? "" : "relative");

const MINI: Record<ProjectId, ComponentType> = {
  'ai-car': AiCarMini,
  'art-transfer': ArtTransferMini,
  'local-llm': LlmMini,
  smoi: SmoiMini,
};

/** Charcoal disc: the project's name running round the ring, its live mini demo inside. */
export const ProjectBadge = ({ project, className = '', style }: { project: Project; className?: string; style?: CSSProperties }) => {
  const pathId = `ring-${useId().replace(/:/g, '')}`;
  const Mini = MINI[project.id];

  return (
    <div className={`rounded-full ${pos(className)} flex items-center justify-center shrink-0 ${className}`} style={{ background: INK, ...style }}>
      <svg viewBox="0 0 200 200" className="badge-spin absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
        <defs>
          <path id={pathId} d="M100,100 m-74,0 a74,74 0 1,1 148,0 a74,74 0 1,1 -148,0" />
        </defs>
        <text key={project.id} className="font-podium proj-in" fill={CREAM} fontSize="17" letterSpacing="1.5">
          <textPath href={`#${pathId}`} textLength="462" lengthAdjust="spacing">
            {project.ring}
          </textPath>
        </text>
      </svg>
      <div key={project.id} className="proj-in absolute inset-[19%] rounded-full overflow-hidden border-2" style={{ borderColor: CREAM }}>
        <Mini />
      </div>
    </div>
  );
};

/** Spinning vinyl with the project's pastel label and track number. */
export const ProjectVinyl = ({ project, className = '', style }: { project: Project; className?: string; style?: CSSProperties }) => (
  <div className={`rounded-full ${pos(className)} shrink-0 ${className}`} style={style}>
    <div
      className="vinyl-spin absolute inset-0 rounded-full"
      style={{ background: 'repeating-radial-gradient(circle, #0b0b0b 0 2px, #1b1b1b 2px 3.5px)', boxShadow: `0 4px 0 ${INK}` }}
    >
      <div
        className="absolute inset-[30%] rounded-full flex items-center justify-center border-2 transition-colors duration-500"
        style={{ background: project.color, borderColor: INK }}
      >
        <span className="absolute top-[12%] left-1/2 -translate-x-1/2 font-minecraft leading-none" style={{ fontSize: '0.8em', color: INK }}>
          {project.track}
        </span>
        <span className="absolute w-[14%] aspect-square rounded-full" style={{ background: CREAM }} />
      </div>
    </div>
    {/* Static sheen: real vinyl reflections stay put while the disc turns */}
    <div
      className="absolute inset-0 rounded-full pointer-events-none"
      style={{ background: 'conic-gradient(from 40deg, transparent 0 8%, rgba(255,255,255,0.14) 12%, transparent 18% 50%, rgba(255,255,255,0.1) 62%, transparent 68%)' }}
    />
  </div>
);
