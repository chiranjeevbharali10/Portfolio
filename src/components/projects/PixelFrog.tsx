/** SMOI's pixel frog (palette from the SMOI site), with blinking eyelids. 14x10 pixel grid. */
const C: Record<string, string> = {
  D: '#514b50', // outline
  G: '#b8ddb1', // body
  W: '#fffaee', // eye white
  K: '#514b50', // pupil
  P: '#f6c8d5', // blush
  L: '#e9d9f5', // scarf
  Y: '#fff1d6', // belly
};

const FROG = [
  '..DDD....DDD..',
  '.DWWKD..DWWKD.',
  '.DWKKDDDDWKKD.',
  'DGGGGGGGGGGGGD',
  'DGPGGGGGGGGPGD',
  'DGGGGGDDGGGGGD',
  '.DGGGGGGGGGGD.',
  '.DLLLLLLLLLLD.',
  'DGDYYYYYYYYDGD',
  '.DDDDDDDDDDDD.',
];

/** Renders inside an <svg>; place it with a transform. `happy` closes the eyes into ^ ^ */
export const PixelFrog = ({ happy = false }: { happy?: boolean }) => (
  <g className="smoi-bob" shapeRendering="crispEdges">
    {FROG.flatMap((row, y) =>
      [...row].map((ch, x) => (ch === '.' ? null : <rect key={`${x}-${y}`} x={x} y={y} width="1.02" height="1.02" fill={C[ch]} />)),
    )}
    {happy ? (
      <g fill={C.G}>
        <rect x="2" y="1" width="3" height="2" />
        <rect x="9" y="1" width="3" height="2" />
        <g fill={C.D}>
          <rect x="2" y="2" width="1" height="1" /><rect x="3" y="1" width="1" height="1" /><rect x="4" y="2" width="1" height="1" />
          <rect x="9" y="2" width="1" height="1" /><rect x="10" y="1" width="1" height="1" /><rect x="11" y="2" width="1" height="1" />
        </g>
      </g>
    ) : (
      <g className="smoi-lid" fill={C.G}>
        <rect x="2" y="1" width="3" height="2" />
        <rect x="9" y="1" width="3" height="2" />
        <rect x="2" y="2.4" width="3" height="0.6" fill={C.D} />
        <rect x="9" y="2.4" width="3" height="0.6" fill={C.D} />
      </g>
    )}
  </g>
);
