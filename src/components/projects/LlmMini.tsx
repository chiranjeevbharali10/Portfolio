import { useEffect, useState } from 'react';

/** A mini terminal: a request goes in, tokens stream back, a Grafana-ish sparkline ticks along. */
const LINES = ['paged', 'attention', 'keeps the', 'KV cache', 'tidy ✦'];
const WORDS = LINES.length;

export const LlmMini = () => {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(WORDS);
      return;
    }
    // WORDS ticks of streaming, then a short pause before the next request
    const id = window.setInterval(() => setShown((n) => (n >= WORDS + 4 ? 0 : n + 1)), 380);
    return () => window.clearInterval(id);
  }, []);

  const streaming = shown > 0 && shown < WORDS;

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full block font-minecraft" aria-hidden="true">
      <rect width="100" height="100" fill="#2f2b2f" />
      <text x="16" y="28" fontSize="6.4" fill="#b8ddb1">&gt; POST /v1/chat</text>
      {LINES.slice(0, Math.min(shown, WORDS)).map((w, i) => (
        <text key={w} x="16" y={38 + i * 8} fontSize="7" fill="#fff1d6">{w}</text>
      ))}
      {shown < WORDS && (
        <rect x="16" y={33 + Math.min(shown, WORDS - 1) * 8} width="3.5" height="6" fill="#f6c8d5">
          <animate attributeName="opacity" values="1;0;1" dur="0.8s" repeatCount="indefinite" />
        </rect>
      )}

      {/* tok/s sparkline */}
      <g transform="translate(62 80)">
        {Array.from({ length: 6 }).map((_, i) => (
          <rect key={i} x={i * 4} y="-10" width="2.6" height="10" fill="#c9d8f4" className="llm-bar" style={{ animationDelay: `${i * -0.35}s` }} />
        ))}
      </g>
      <text x="16" y="88" fontSize="5" fill={streaming ? '#f6c8d5' : 'rgba(255,241,214,0.5)'}>
        {streaming ? '42 tok/s' : 'vLLM ready'}
      </text>
    </svg>
  );
};
