import { PixelFrog } from './PixelFrog';

/** SMOI's pixel frog, blinking, answering with a citation (badge-sized demo). */
export const SmoiMini = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full block" aria-hidden="true">
    <rect width="100" height="100" fill="#fff1d6" />
    {/* dotted wallpaper, like the SMOI site */}
    <pattern id="smoi-dots" width="8" height="8" patternUnits="userSpaceOnUse">
      <circle cx="4" cy="4" r="0.7" fill="#c9d8f4" />
    </pattern>
    <rect width="100" height="100" fill="url(#smoi-dots)" />

    {/* speech bubble with a citation */}
    <rect x="20" y="14" width="60" height="19" rx="6" fill="#c9d8f4" stroke="#514b50" strokeWidth="1.4" />
    <path d="M46 33 l4 4 l4 -4" fill="#c9d8f4" stroke="#514b50" strokeWidth="1.4" strokeLinejoin="round" />
    <rect x="45.5" y="31.5" width="9" height="2" fill="#c9d8f4" />
    <text x="50" y="27.5" textAnchor="middle" fontSize="8" className="font-minecraft" fill="#514b50">p.4 §2 ✓</text>

    <g transform="translate(24.8 41) scale(3.6)">
      <PixelFrog />
    </g>
  </svg>
);
