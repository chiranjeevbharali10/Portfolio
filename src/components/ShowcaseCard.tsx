import React from 'react';
import { Scene as GlobeScene } from "./playground/globe/Scene";
import { FlowerScene } from "./playground/flower/FlowerScene";

interface ShowcaseCardProps {
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  style?: React.CSSProperties;
  layout?: 'vertical' | 'horizontal';
}

export const ShowcaseCard: React.FC<ShowcaseCardProps> = ({ className = '', onClick, style, layout = 'vertical' }) => {
  const isHorizontal = layout === 'horizontal';

  return (
    <div
      onClick={onClick}
      style={style}
      className={`group relative bg-[#FFF4E4] rounded-[24px] sm:rounded-[32px] overflow-hidden border-2 border-black p-2 sm:p-2.5 ${className}`}
    >
      <div className={`w-full h-full border-[2px] border-black/80 rounded-[18px] sm:rounded-[24px] flex ${isHorizontal ? 'flex-row' : 'flex-col'} items-center justify-center gap-2 sm:gap-3 overflow-hidden ${isHorizontal ? 'px-4 py-2' : 'py-4'} pointer-events-none`}>
        {/* TOP/LEFT CIRCLE */}
        <div className={`${isHorizontal ? 'h-[90%]' : 'h-[45%] max-w-[90%]'} aspect-square bg-black rounded-full overflow-hidden relative flex items-center justify-center transition-transform duration-500 group-hover:scale-[1.03] shrink-0`}>
          <div className="absolute inset-0 pointer-events-auto">
            <FlowerScene />
          </div>
        </div>
        {/* BOTTOM/RIGHT CIRCLE */}
        <div className={`${isHorizontal ? 'h-[90%]' : 'h-[45%] max-w-[90%]'} aspect-square bg-black rounded-full overflow-hidden relative flex items-center justify-center transition-transform duration-500 group-hover:scale-[1.03] shrink-0`}>
          <div className="absolute inset-0 pointer-events-auto">
            <GlobeScene />
          </div>
        </div>
      </div>
    </div>
  );
};
