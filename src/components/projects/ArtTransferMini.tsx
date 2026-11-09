import { useId } from 'react';

/** Photo (content) → wipe → the same skyline repainted in a swirly "starry night" style. */
const SKYLINE = 'M0 78 V62 h10 V54 h8 V66 h7 V48 h11 V60 h6 V52 h9 V64 h8 V44 h10 V58 h9 V56 h8 V66 h14 V100 H0 Z';

export const ArtTransferMini = () => {
  const id = useId().replace(/:/g, '');
  const clip = `wipe-${id}`;

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full block" aria-hidden="true">
      <defs>
        <clipPath id={clip}>
          <rect x="0" y="0" height="100" width="0">
            <animate attributeName="width" values="0;100;100;0;0" keyTimes="0;0.4;0.62;0.95;1" dur="5.5s" repeatCount="indefinite" />
          </rect>
        </clipPath>
      </defs>

      {/* CONTENT: the plain photo */}
      <rect width="100" height="100" fill="#c9d8f4" />
      <circle cx="72" cy="30" r="7" fill="#fff1d6" />
      <path d={SKYLINE} fill="#514b50" />
      {[[14, 66], [30, 56], [52, 60], [70, 52], [86, 62]].map(([x, y]) => (
        <rect key={`${x}`} x={x} y={y} width="2.5" height="2.5" fill="#fffaee" />
      ))}

      {/* STYLE: the same scene, painted */}
      <g clipPath={`url(#${clip})`}>
        <rect width="100" height="100" fill="#26315e" />
        <g fill="none" strokeLinecap="round">
          <path d="M8 30 q10 -12 20 0 t20 0 t20 0 t20 0" stroke="#c9d8f4" strokeWidth="2.2" />
          <path d="M2 42 q12 -9 24 0 t24 0 t24 0 t24 0" stroke="#e9d9f5" strokeWidth="1.6" opacity="0.8" />
          <path d="M40 24 a6 6 0 1 1 6 6 a3.5 3.5 0 1 1 -3 -3" stroke="#fff1d6" strokeWidth="1.6" />
          <path d="M18 18 a4 4 0 1 1 4 4" stroke="#b8ddb1" strokeWidth="1.4" />
        </g>
        <circle cx="72" cy="30" r="7" fill="#ffe08a" />
        <circle cx="72" cy="30" r="10.5" fill="none" stroke="#ffe08a" strokeWidth="1" strokeDasharray="2 2" />
        {[[12, 12], [86, 16], [58, 12], [28, 40], [92, 40]].map(([x, y]) => (
          <circle key={`s${x}`} cx={x} cy={y} r="1.6" fill="#ffe08a" />
        ))}
        <path d={SKYLINE} fill="#1b1f33" />
        {[[14, 66], [30, 56], [52, 60], [70, 52], [86, 62]].map(([x, y]) => (
          <rect key={`w${x}`} x={x} y={y} width="2.5" height="2.5" fill="#ffe08a" />
        ))}
      </g>

      {/* The brush edge riding the wipe */}
      <rect y="0" width="1.4" height="100" fill="#f6c8d5">
        <animate attributeName="x" values="0;100;100;0;0" keyTimes="0;0.4;0.62;0.95;1" dur="5.5s" repeatCount="indefinite" />
      </rect>
    </svg>
  );
};
