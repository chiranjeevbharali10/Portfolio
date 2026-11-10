import { ArrowUpRight } from 'lucide-react';
import type { Project } from '../../../data/projects';

type Theme = 'pit' | 'museum' | 'blueprint' | 'smoi';

const STYLES: Record<Theme, { stat: string; value: string; label: string; chip: string; link: string }> = {
  pit: {
    stat: 'border-l-4 border-[#ffd60a] bg-[#17181b]',
    value: 'font-podium italic text-4xl text-white',
    label: 'font-mono text-[10px] tracking-widest text-white/50 uppercase',
    chip: 'font-mono text-xs uppercase tracking-wider border border-white/20 text-white/75 px-2.5 py-1',
    link: 'bg-[#ffd60a] text-black font-mono text-xs font-bold uppercase tracking-widest px-5 py-3 hover:bg-white',
  },
  museum: {
    stat: 'border-t border-[#d9b45a]/70',
    value: 'font-instrument text-4xl text-[#f6ead7]',
    label: 'text-[11px] tracking-[0.2em] text-[#f6ead7]/65 uppercase',
    chip: 'font-instrument italic text-sm border border-[#f6ead7]/40 text-[#f6ead7] rounded-full px-3 py-1',
    link: 'bg-[#f6ead7] text-[#3a0d09] rounded-full text-sm tracking-wide px-6 py-3 hover:bg-[#d9b45a]',
  },
  blueprint: {
    stat: 'border border-white/40 bg-[#0a2577]/70',
    value: 'font-mono text-2xl text-[#ffe45c]',
    label: 'font-mono text-[10px] tracking-widest text-[#b5c6f2] uppercase',
    chip: 'font-mono text-xs border border-dashed border-white/45 text-[#eaf1ff] px-2.5 py-1',
    link: 'bg-[#ffe45c] text-[#0a2470] font-mono text-xs font-bold uppercase tracking-widest px-5 py-3 hover:bg-white',
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
