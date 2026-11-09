import { ArrowUpRight } from 'lucide-react';
import type { Project } from '../../../data/projects';

type Theme = 'neon' | 'gallery' | 'terminal' | 'smoi';

const STYLES: Record<Theme, { stat: string; value: string; label: string; chip: string; link: string }> = {
  neon: {
    stat: 'border border-[#35fe5d]/30 bg-black rounded-xl',
    value: 'font-podium text-3xl text-[#35fe5d]',
    label: 'font-mono text-[10px] tracking-widest text-white/50 uppercase',
    chip: 'font-mono text-xs border border-white/15 text-white/70 rounded-md px-2.5 py-1',
    link: 'bg-[#35fe5d] text-black rounded-lg font-mono text-xs uppercase tracking-widest px-5 py-3 hover:bg-white',
  },
  gallery: {
    stat: 'border-t-2 border-[#1d1a16]',
    value: 'font-instrument text-4xl text-[#1d1a16]',
    label: 'text-[11px] tracking-[0.2em] text-[#1d1a16]/60 uppercase',
    chip: 'text-xs tracking-wide border border-[#1d1a16]/30 text-[#1d1a16] rounded-full px-3 py-1 italic font-instrument text-sm',
    link: 'bg-[#1d1a16] text-[#f4efe6] rounded-full text-sm tracking-wide px-6 py-3 hover:bg-[#b23a2a]',
  },
  terminal: {
    stat: 'border border-[#2a3242] bg-[#0f141c] rounded-md',
    value: 'font-mono text-2xl text-[#ff9f43]',
    label: 'font-mono text-[10px] tracking-widest text-[#8b97ab] uppercase',
    chip: 'font-mono text-xs bg-[#161d29] border border-[#2a3242] text-[#9fb4d4] rounded px-2.5 py-1',
    link: 'bg-[#ff9f43] text-[#0b0f15] rounded-md font-mono text-xs uppercase tracking-widest px-5 py-3 hover:bg-[#ffc078]',
  },
  smoi: {
    stat: 'border-2 border-[#514b50] rounded-[14px] bg-[#fffaee] shadow-[0_4px_0_#514b50]',
    value: 'font-minecraft text-2xl text-[#514b50]',
    label: 'text-[11px] font-bold uppercase tracking-wide text-[#514b50]/70',
    chip: 'text-xs font-bold border-2 border-[#514b50] bg-[#fffaee] text-[#514b50] rounded-full px-3 py-1',
    link: 'proj-chip bg-[#b8ddb1] text-[#514b50] border-2 border-[#514b50] rounded-full font-extrabold text-sm px-5 py-2.5',
  },
};

/** Stats, tech stack and links, dressed in each section's own style. */
export const SectionLinks = ({ project, theme }: { project: Project; theme: Theme }) => {
  const s = STYLES[theme];
  return (
    <div className="proj-reveal mt-12 flex flex-col gap-8">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {project.stats.map((st) => (
          <div key={st.label} className={`${s.stat} px-4 py-4`}>
            <div className={`${s.value} leading-none mb-2`}>{st.value}</div>
            <div className={`${s.label} leading-tight`}>{st.label}</div>
          </div>
        ))}
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="flex flex-wrap gap-2">
          {project.stack.map((t) => (
            <span key={t} className={s.chip}>{t}</span>
          ))}
        </div>
        <div className="flex flex-wrap gap-3 shrink-0">
          {project.links.map((l) => (
            <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-2 transition-colors ${s.link}`}>
              {l.label} <ArrowUpRight size={16} />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};
