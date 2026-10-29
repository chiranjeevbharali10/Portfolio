import { memo } from "react";

const PALETTE: Record<string, string> = {
  K: "#0a0a0a", // outline
  C: "#1f1f24", // cap
  c: "#3d3d46", // cap highlight
  H: "#141414", // hair
  S: "#f6c896", // skin
  s: "#d99a63", // skin shade
  W: "#ffffff", // eye white
  E: "#5b3418", // iris
  T: "#ffffff", // teeth
  M: "#c2402f", // mouth
  B: "#161618", // shirt
  b: "#2b2b30", // shirt highlight
  P: "#3a3a40", // backpack strap
};

// 35 x 28 sprite, one char per pixel ("." = empty). Rows 4-9 right of col 24 hold the waving hand.
const BODY = [
  "............KKKKKK.................",
  "..........KKCCCCCCKK...............",
  ".........KCCcccCCCCCK..............",
  "........KCCccCCCCCCCCK.............",
  "........KCCCCCCCCCCCCCK............",
  "....KKKKKCCCCCCCCCCCCCK............",
  "...KCCCCCCCKKKKKKKKKKKKK...........",
  "....KKKKKHHHHHHHHHHHHHHK...........",
  "........KHHSSSSSSSSSSHHK...........",
  "........KHKKKKKSSKKKKKHK...........",
  "........KSKWEWKKKKWEWKSSK.KSSSSK...",
  "........KSKWWWKSSKWWWKSsK..KSSK....",
  "........KSKKKKKSSKKKKKSSK..KSSK....",
  "........KSSSSSSsSSSSSSSK...KSSK....",
  "........KsSSKTTTTTTKSSsK..KSSK.....",
  ".........KSSKMMMMMMKSSK...KSSK.....",
  "..........KSSKKKKKKSSK...KSSK......",
  "...........KKSSSSSSKK...KSSK.......",
  "......KKKKKKKBKSSSSKBKKKKKSSK......",
  ".....KBBBPPBBBKKKKBBBBPPBKSSK......",
  "....KBbBBPPBBBBBBBBBBBPPBKBBK......",
  "....KBbBBPPBBBBBBBBBBBPPBBBBK......",
  "...KBbBBBPPBBBBBBBBBBBPPBBBBK......",
  "..KKKKKKKKPPBBBBBBBBBBPPBBBBK......",
  ".KSSSSSSSSKKBBBBBBBBBBPPBBBBK......",
  ".KSSSSSSSSSSSKBBBBBBBBPPBBBBK......",
  ".KsSSSSSSSKSSKBBBBBBBBPPBBBBK......",
  "..KKKKKKKKKKKKKKKKKKKKKKKKKKK......",
];

// Two hand poses at (col 24, row 4), alternated to wave
const HAND_A = ["..K.K.K.K..", ".KSKSKSKSK.", ".KSKSKSKSK.", "KKSSSSSSSK.", "KSKSSSSSSK.", ".KSSSSSSK.."];
const HAND_B = ["...K.K.K.K.", "..KSKSKSKSK", "..KSKSKSKSK", ".KKSSSSSSSK", ".KSKSSSSSK.", "..KSSSSSK.."];

// Closed eyes drawn over the lenses
const BLINK = [
  "...SSS....SSS",
  "...KKK....KKK",
];

const W = BODY[0].length;
const H = BODY.length;

const pixels = (rows: string[], ox = 0, oy = 0) =>
  rows.flatMap((row, y) =>
    [...row].map((ch, x) =>
      ch === "." ? null : (
        <rect key={`${x + ox}-${y + oy}`} x={x + ox} y={y + oy} width="1.02" height="1.02" fill={PALETTE[ch]} />
      )
    )
  );

// Hand-drawn pixel-art version of the avatar, with a two-frame wave and an occasional blink
export const PixelMe = memo(({ className = "" }: { className?: string }) => (
  <svg viewBox={`0 0 ${W} ${H}`} shapeRendering="crispEdges" className={className}>
    <g>{pixels(BODY)}</g>
    <g className="px-wave-a">{pixels(HAND_A, 24, 4)}</g>
    <g className="px-wave-b">{pixels(HAND_B, 24, 4)}</g>
    <g className="px-blink">{pixels(BLINK, 8, 10)}</g>
  </svg>
));
