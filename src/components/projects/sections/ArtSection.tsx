import { useEffect, useId, useRef, useState } from 'react';
import { ImageUp } from 'lucide-react';
import type { Project } from '../../../data/projects';
import { SectionLinks } from './shared';

/**
 * A2 — "gallery": warm paper, serif type, a framed piece on the wall.
 * Visitors drag a before/after divider, pick a style, set the style weight and can
 * use their own photo. SVG filters approximate each style instantly in the browser
 * (the real project optimises pixels with VGG19 + L-BFGS).
 */

const PAPER = '#f4efe6';
const INK = '#1d1a16';
const RED = '#b23a2a';
const SAMPLE = '/island_frames/720/f_00001.webp';

const STYLES = [
  { id: 'starry', name: 'Starry Swirl', after: 'after Van Gogh', swatch: 'linear-gradient(135deg,#1b2a5c,#3a63b8 45%,#f2d04b)' },
  { id: 'woodblock', name: 'Woodblock', after: 'after Hokusai', swatch: 'linear-gradient(135deg,#1e2f4f,#e9dcc0 50%,#c0432f)' },
  { id: 'charcoal', name: 'Charcoal', after: 'after a sketchbook', swatch: 'linear-gradient(135deg,#f3eee4,#8a8478 55%,#1d1a16)' },
] as const;

type StyleId = (typeof STYLES)[number]['id'];

export const ArtSection = ({ project }: { project: Project }) => {
  const uid = useId().replace(/:/g, '');
  const [style, setStyle] = useState<StyleId>('starry');
  const [split, setSplit] = useState(72); // % of the piece shown in the painted style
  const [weight, setWeight] = useState(85); // style weight vs content
  const [src, setSrc] = useState(SAMPLE);
  const frameRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  // Free the object URL of an uploaded photo when it's replaced
  useEffect(() => () => { if (src !== SAMPLE) URL.revokeObjectURL(src); }, [src]);

  const moveTo = (clientX: number) => {
    const r = frameRef.current?.getBoundingClientRect();
    if (!r) return;
    setSplit(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)));
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f && f.type.startsWith('image/')) setSrc(URL.createObjectURL(f));
  };

  const current = STYLES.find((s) => s.id === style)!;
  const disp = 10 + (weight / 100) * 34;

  return (
    <section id={project.id} className="scroll-mt-16 relative py-20 md:py-28 overflow-hidden" style={{ background: PAPER, color: INK }}>
      {/* SVG "styles" — filters applied to the painted layer */}
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <defs>
          <filter id={`starry-${uid}`} x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="turbulence" baseFrequency="0.018 0.03" numOctaves="2" seed="7" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale={disp} xChannelSelector="R" yChannelSelector="G" result="swirl" />
            <feColorMatrix in="swirl" type="saturate" values="0" result="grey" />
            <feComponentTransfer in="grey">
              <feFuncR type="table" tableValues="0.04 0.07 0.12 0.22 0.55 0.98 1" />
              <feFuncG type="table" tableValues="0.06 0.12 0.24 0.4 0.62 0.84 0.95" />
              <feFuncB type="table" tableValues="0.22 0.42 0.66 0.8 0.6 0.28 0.5" />
            </feComponentTransfer>
            <feComponentTransfer>
              <feFuncR type="gamma" exponent="1.35" amplitude="1" offset="0" />
              <feFuncG type="gamma" exponent="1.35" amplitude="1" offset="0" />
              <feFuncB type="gamma" exponent="1.1" amplitude="1" offset="0" />
            </feComponentTransfer>
          </filter>
          <filter id={`woodblock-${uid}`}>
            <feColorMatrix type="saturate" values="0" result="grey" />
            {/* flat ukiyo-e tones: indigo, prussian blue, sand, cream */}
            <feComponentTransfer in="grey" result="flat">
              <feFuncR type="discrete" tableValues="0.1 0.17 0.55 0.86 0.97" />
              <feFuncG type="discrete" tableValues="0.14 0.3 0.42 0.78 0.93" />
              <feFuncB type="discrete" tableValues="0.3 0.52 0.38 0.6 0.84" />
            </feComponentTransfer>
            {/* carved outlines: opaque where the edges are strong */}
            <feConvolveMatrix in="grey" order="3" kernelMatrix="-1 -1 -1 -1 8 -1 -1 -1 -1" preserveAlpha="true" result="edges" />
            <feColorMatrix in="edges" type="matrix" values="0 0 0 0 0.08  0 0 0 0 0.07  0 0 0 0 0.1  4 4 4 0 -0.15" result="ink" />
            <feComposite in="ink" in2="flat" operator="over" />
          </filter>
          <filter id={`charcoal-${uid}`}>
            <feColorMatrix type="saturate" values="0" result="grey" />
            <feConvolveMatrix in="grey" order="3" kernelMatrix="-1 -1 -1 -1 8 -1 -1 -1 -1" preserveAlpha="true" result="edges" />
            <feComponentTransfer in="edges" result="lines">
              <feFuncR type="linear" slope="-14" intercept="1" />
              <feFuncG type="linear" slope="-14" intercept="0.98" />
              <feFuncB type="linear" slope="-14" intercept="0.94" />
            </feComponentTransfer>
            {/* smudgy charcoal shading + paper grain */}
            <feComponentTransfer in="grey" result="tone">
              <feFuncR type="table" tableValues="0.12 0.3 0.62 0.9 0.98" />
              <feFuncG type="table" tableValues="0.11 0.28 0.6 0.88 0.96" />
              <feFuncB type="table" tableValues="0.1 0.26 0.56 0.84 0.92" />
            </feComponentTransfer>
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" seed="3" result="grain" />
            <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0.5  0 0 0 0 0.48  0 0 0 0 0.45  0 0 0 0.35 0" result="grainA" />
            <feBlend in="lines" in2="tone" mode="multiply" result="drawn" />
            <feBlend in="grainA" in2="drawn" mode="multiply" />
          </filter>
        </defs>
      </svg>

      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="proj-reveal flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <p className="text-xs tracking-[0.35em] uppercase mb-4" style={{ color: RED }}>Room {project.track} · Neural Style Transfer</p>
            <h2 className="font-instrument text-6xl sm:text-8xl leading-[0.9]">
              Art <em>Transfer</em>
            </h2>
          </div>
          <p className="font-instrument italic text-2xl sm:text-3xl max-w-md leading-snug">“{project.tagline}”</p>
        </div>

        <div className="grid lg:grid-cols-[1.35fr_1fr] gap-10 lg:gap-14 items-start">
          {/* The framed piece */}
          <div className="proj-reveal">
            <div className="p-3 sm:p-4 rounded-[4px] shadow-[0_30px_60px_-20px_rgba(29,26,22,0.55)]" style={{ background: 'linear-gradient(135deg,#3a2c1e,#1d140c 40%,#4a3826)' }}>
              <div className="p-4 sm:p-6" style={{ background: '#fbf8f2' }}>
                <div
                  ref={frameRef}
                  className="relative aspect-[16/10] overflow-hidden select-none cursor-ew-resize touch-none"
                  onPointerDown={(e) => { dragging.current = true; e.currentTarget.setPointerCapture(e.pointerId); moveTo(e.clientX); }}
                  onPointerMove={(e) => dragging.current && moveTo(e.clientX)}
                  onPointerUp={() => { dragging.current = false; }}
                >
                  <img src={src} alt="Content photo" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
                  <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - split}% 0 0)` }}>
                    <img src={src} alt="" className="absolute inset-0 w-full h-full object-cover scale-[1.12]" draggable={false} style={{ filter: `url(#${style}-${uid})` }} />
                    {/* style weight = how much of the painting covers the photo */}
                    <img src={src} alt="" className="absolute inset-0 w-full h-full object-cover" draggable={false} style={{ opacity: 1 - weight / 100 }} />
                  </div>
                  {/* divider */}
                  <div className="absolute inset-y-0 w-[2px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.25)]" style={{ left: `${split}%` }}>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center text-xs font-bold" style={{ color: INK }}>⇆</div>
                  </div>
                  <span className="absolute top-3 left-3 text-[10px] tracking-[0.25em] uppercase bg-white/85 px-2 py-1">Style</span>
                  <span className="absolute top-3 right-3 text-[10px] tracking-[0.25em] uppercase bg-white/85 px-2 py-1">Content</span>
                </div>
                <input type="range" min={0} max={100} value={Math.round(split)} onChange={(e) => setSplit(+e.target.value)} className="sr-only" aria-label="Before and after divider" />
              </div>
            </div>
            {/* museum plaque */}
            <div className="mt-6 ml-auto max-w-sm border-l-2 pl-4" style={{ borderColor: RED }}>
              <p className="font-instrument text-xl leading-tight">
                <em>{src === SAMPLE ? 'Floating Island' : 'Your Photo'}</em>, {current.after}
              </p>
              <p className="text-xs mt-1 opacity-60">Style weight {weight}% · drag the divider to compare</p>
            </div>
          </div>

          {/* Controls */}
          <div className="proj-reveal flex flex-col gap-8">
            <div>
              <h3 className="text-[11px] tracking-[0.3em] uppercase mb-4 opacity-70">1 · Choose a style image</h3>
              <div className="grid grid-cols-3 gap-3">
                {STYLES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setStyle(s.id)}
                    className="group text-left"
                    aria-pressed={style === s.id}
                  >
                    <span className={`block aspect-square p-1.5 transition-all ${style === s.id ? 'ring-2 ring-offset-2' : 'opacity-75 group-hover:opacity-100'}`} style={{ background: '#2b2117', ['--tw-ring-color' as string]: RED, ['--tw-ring-offset-color' as string]: PAPER }}>
                      <span className="block w-full h-full" style={{ background: s.swatch }} />
                    </span>
                    <span className="block mt-2 font-instrument text-lg leading-none">{s.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-[11px] tracking-[0.3em] uppercase mb-3 opacity-70">2 · Balance content vs style</h3>
              <input type="range" min={10} max={100} value={weight} onChange={(e) => setWeight(+e.target.value)} className="w-full accent-[#b23a2a]" aria-label="Style weight" />
              <div className="flex justify-between text-xs opacity-60 mt-1"><span>keep the photo</span><span>paint it all</span></div>
            </div>

            <div>
              <h3 className="text-[11px] tracking-[0.3em] uppercase mb-3 opacity-70">3 · Or hang your own photo</h3>
              <label className="inline-flex items-center gap-2 cursor-pointer rounded-full border px-5 py-2.5 text-sm hover:bg-[#1d1a16] hover:text-[#f4efe6] transition-colors" style={{ borderColor: INK }}>
                <ImageUp size={16} /> Upload a photo
                <input type="file" accept="image/*" onChange={onFile} className="sr-only" />
              </label>
              <p className="text-xs opacity-50 mt-2">Stays on your device, nothing is uploaded anywhere.</p>
            </div>

            <div className="border-t pt-6" style={{ borderColor: `${INK}26` }}>
              <p className="leading-relaxed opacity-80">{project.about}</p>
              <ol className="mt-5 flex flex-col gap-3">
                {project.how.map((step, i) => (
                  <li key={step} className="flex gap-3 text-sm leading-relaxed">
                    <span className="font-instrument italic text-xl leading-none" style={{ color: RED }}>{['i', 'ii', 'iii', 'iv'][i]}.</span>
                    <span className="opacity-80">{step}</span>
                  </li>
                ))}
              </ol>
              <p className="text-[11px] opacity-45 mt-5">The demo above approximates each style with SVG filters so it&apos;s instant; the real project optimises every pixel with VGG19 and L-BFGS.</p>
            </div>
          </div>
        </div>

        <SectionLinks project={project} theme="gallery" />
      </div>
    </section>
  );
};
