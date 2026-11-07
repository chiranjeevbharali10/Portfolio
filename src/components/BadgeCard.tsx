/**
 * Decorative landing card: a rotating text badge and a spinning vinyl record.
 * Pure CSS/SVG transforms (GPU-composited), no JavaScript or WebGL, so it costs
 * almost nothing on phones. Replaces the old three.js flower/globe ShowcaseCard.
 */
const BADGE_TEXT = 'CHIRANJEEV ✦ CREATIVE DEVELOPER ✦ ';

// Square that fits both constraints: 78% of the card's width, 36% of its height
const CIRCLE = { width: 'min(78cqw, 36cqh)', height: 'min(78cqw, 36cqh)' };

export const BadgeCard = ({ className = '' }: { className?: string }) => (
  <div
    aria-hidden="true"
    className={`group relative bg-[#FFF4E4] rounded-[24px] sm:rounded-[32px] overflow-hidden border-2 border-black p-2 sm:p-2.5 ${className}`}
  >
    {/* Size container: circles use container units so they stay perfectly round
        whether the card is narrow (width-limited) or short (height-limited). */}
    <div
      className="w-full h-full border-[2px] border-black/80 rounded-[18px] sm:rounded-[24px] flex flex-col items-center justify-center gap-[6cqh] overflow-hidden pointer-events-none"
      style={{ containerType: 'size' }}
    >
      {/* TOP: rotating text badge around a pulsing star */}
      <div className="bg-black rounded-full relative flex items-center justify-center transition-transform duration-500 group-hover:scale-[1.03] shrink-0" style={CIRCLE}>
        <svg viewBox="0 0 200 200" className="badge-spin absolute inset-0 w-full h-full">
          <defs>
            <path id="badge-circle" d="M100,100 m-74,0 a74,74 0 1,1 148,0 a74,74 0 1,1 -148,0" />
          </defs>
          <text className="font-podium" fill="#FFF4E4" fontSize="17" letterSpacing="1.5">
            <textPath href="#badge-circle" textLength="462" lengthAdjust="spacing">
              {BADGE_TEXT}
            </textPath>
          </text>
        </svg>
        <span className="badge-pulse text-[#FF2D9A] text-4xl sm:text-5xl leading-none drop-shadow-[0_0_12px_rgba(255,45,154,0.6)]">✦</span>
      </div>

      {/* BOTTOM: spinning vinyl record */}
      <div className="rounded-full relative transition-transform duration-500 group-hover:scale-[1.03] shrink-0" style={CIRCLE}>
        {/* Disc + grooves + label spin together; the label text makes the spin visible */}
        <div
          className="vinyl-spin absolute inset-0 rounded-full"
          style={{ background: 'repeating-radial-gradient(circle, #0b0b0b 0 2px, #1b1b1b 2px 3.5px)' }}
        >
          <div className="absolute inset-[32%] rounded-full bg-[#FF2D9A] flex items-center justify-center">
            {/* Off-centre mark so the spin is visible; sized to the label so it never overflows */}
            <span className="absolute top-[14%] left-1/2 -translate-x-1/2 text-black leading-none" style={{ fontSize: '0.75em' }}>✦</span>
            <span className="absolute w-[14%] aspect-square rounded-full bg-[#FFF4E4]" />
          </div>
        </div>
        {/* Static sheen: real vinyl reflections stay put while the disc turns */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{ background: 'conic-gradient(from 40deg, transparent 0 8%, rgba(255,255,255,0.14) 12%, transparent 18% 50%, rgba(255,255,255,0.1) 62%, transparent 68%)' }}
        />
      </div>
    </div>
  </div>
);
