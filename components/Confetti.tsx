const COLORS = ['#ff2e88', '#ffe600', '#2d5bff', '#2be0a8', '#ff7a1a', '#c9b6ff'];

// Deterministic pseudo-random so render stays pure (same pieces every time).
const rand = (seed: number) => {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
};

const PIECES = Array.from({ length: 90 }, (_, i) => {
  const r1 = rand(i + 1);
  const r2 = rand(i + 101);
  const r3 = rand(i + 202);
  const r4 = rand(i + 303);
  // Keep every piece inside the viewport horizontally: start between 4% and
  // 88% and always drift back toward the centre (at most 60px).
  const leftPct = 4 + r1 * 84;
  const drift = Math.round(r4 * 60) * (leftPct > 50 ? -1 : 1);
  return {
    left: `${leftPct.toFixed(2)}%`,
    w: `${8 + Math.round(r2 * 10)}px`,
    h: `${10 + Math.round(r3 * 14)}px`,
    br: i % 3 === 0 ? '50%' : i % 3 === 1 ? '2px' : '0',
    c: COLORS[i % COLORS.length],
    drift: `${drift}px`,
    spin: `${Math.round(r2 * 1440 - 720)}deg`,
    dur: `${(2.4 + r3 * 2.2).toFixed(2)}s`,
    delay: `${(r1 * 0.8).toFixed(2)}s`,
  };
});

/** One-shot confetti rain for the confirmation screen. Decorative only. */
export default function Confetti() {
  return (
    <div className="confetti" aria-hidden="true">
      {PIECES.map((p, i) => (
        <span
          key={i}
          className="confetti__piece"
          style={
            {
              left: p.left,
              '--w': p.w,
              '--h': p.h,
              '--br': p.br,
              '--c': p.c,
              '--drift': p.drift,
              '--spin': p.spin,
              '--dur': p.dur,
              '--delay': p.delay,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
