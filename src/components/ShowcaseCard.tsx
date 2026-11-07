import React, { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { isAppLoaded } from '../utils/loadingState';

// three.js / R3F / postprocessing live in these chunks; keep them off the critical path.
const FlowerScene = lazy(() => import('./playground/flower/FlowerScene').then((m) => ({ default: m.FlowerScene })));
const GlobeScene = lazy(() => import('./playground/globe/Scene').then((m) => ({ default: m.Scene })));

// The card is small, so cap pixel ratio below the full-page default.
const CARD_DPR: [number, number] = [1, 1.5];

interface ShowcaseCardProps {
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  style?: React.CSSProperties;
  layout?: 'vertical' | 'horizontal';
}

/** Mount the WebGL scenes only once the app has loaded and the card has been on screen;
 *  pause rendering while it is scrolled out of view. */
const useDeferredCanvas = (ref: React.RefObject<HTMLDivElement | null>) => {
  const [appReady, setAppReady] = useState(isAppLoaded);
  const [inView, setInView] = useState(false);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    if (appReady) return;
    const onLoaded = () => setAppReady(true);
    window.addEventListener('appLoaded', onLoaded);
    // Pages that render the card without the loading screen (e.g. /projects).
    const fallback = window.setTimeout(onLoaded, 3000);
    return () => {
      window.removeEventListener('appLoaded', onLoaded);
      window.clearTimeout(fallback);
    };
  }, [appReady]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      setInView(entry.isIntersecting);
      if (entry.isIntersecting) setSeen(true);
    }, { rootMargin: '200px' });
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);

  return { mounted: appReady && seen, frameloop: inView ? 'always' as const : 'never' as const };
};

export const ShowcaseCard: React.FC<ShowcaseCardProps> = ({ className = '', onClick, style, layout = 'vertical' }) => {
  const isHorizontal = layout === 'horizontal';
  const rootRef = useRef<HTMLDivElement>(null);
  const { mounted, frameloop } = useDeferredCanvas(rootRef);

  return (
    <div
      ref={rootRef}
      onClick={onClick}
      style={style}
      className={`group relative bg-[#FFF4E4] rounded-[24px] sm:rounded-[32px] overflow-hidden border-2 border-black p-2 sm:p-2.5 ${className}`}
    >
      <div className={`w-full h-full border-[2px] border-black/80 rounded-[18px] sm:rounded-[24px] flex ${isHorizontal ? 'flex-row' : 'flex-col'} items-center justify-center gap-2 sm:gap-3 overflow-hidden ${isHorizontal ? 'px-4 py-2' : 'py-4'} pointer-events-none`}>
        {/* TOP/LEFT CIRCLE */}
        <div className={`${isHorizontal ? 'h-[90%]' : 'h-[45%] max-w-[90%]'} aspect-square bg-black rounded-full overflow-hidden relative flex items-center justify-center transition-transform duration-500 group-hover:scale-[1.03] shrink-0`}>
          <div className="absolute inset-0 pointer-events-none">
            {mounted && (
              <Suspense fallback={null}>
                <FlowerScene dpr={CARD_DPR} frameloop={frameloop} />
              </Suspense>
            )}
          </div>
        </div>
        {/* BOTTOM/RIGHT CIRCLE */}
        <div className={`${isHorizontal ? 'h-[90%]' : 'h-[45%] max-w-[90%]'} aspect-square bg-black rounded-full overflow-hidden relative flex items-center justify-center transition-transform duration-500 group-hover:scale-[1.03] shrink-0`}>
          <div className="absolute inset-0 pointer-events-none">
            {mounted && (
              <Suspense fallback={null}>
                <GlobeScene dpr={CARD_DPR} frameloop={frameloop} />
              </Suspense>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
