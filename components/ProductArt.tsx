import type { ProductId } from '@/lib/products';

/** Flat, colourful product illustrations with looping micro-animations. */
export default function ProductArt({ id }: { id: ProductId }) {
  if (id === 'water-bottle') {
    return (
      <svg
        viewBox="0 0 200 200"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Illustration of a steel water bottle"
      >
        <rect width="200" height="200" fill="#2be0a8" />
        <circle
          className="art-spin"
          cx="160"
          cy="42"
          r="24"
          fill="#ffe600"
          stroke="#111"
          strokeWidth="3"
          strokeDasharray="6 5"
        />
        <path
          className="art-dash"
          d="M10 178 Q 50 158 90 178 T 190 178"
          fill="none"
          stroke="#2d5bff"
          strokeWidth="5"
        />
        <g className="art-float">
          <rect
            x="84"
            y="22"
            width="32"
            height="20"
            rx="5"
            fill="#ff2e88"
            stroke="#111"
            strokeWidth="4"
          />
          <path
            d="M88 42 h24 v10 q 22 8 22 30 v76 a 12 12 0 0 1 -12 12 h-44 a 12 12 0 0 1 -12 -12 v-76 q 0 -22 22 -30 z"
            fill="#fff6e5"
            stroke="#111"
            strokeWidth="4"
          />
          <rect
            x="66"
            y="104"
            width="68"
            height="30"
            fill="#2d5bff"
            stroke="#111"
            strokeWidth="4"
          />
          <path
            d="M100 110 q -8 11 0 16 q 8 -5 0 -16 z"
            fill="#ffe600"
            stroke="#111"
            strokeWidth="2"
          />
          <rect x="74" y="70" width="6" height="26" rx="3" fill="#111" opacity="0.25" />
        </g>
        <polygon
          className="art-float-b"
          points="22,44 38,18 54,44"
          fill="#ff7a1a"
          stroke="#111"
          strokeWidth="3"
        />
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 200 200"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Illustration of a ceramic coffee mug"
    >
      <rect width="200" height="200" fill="#ffe600" />
      <circle
        className="art-spin"
        cx="40"
        cy="162"
        r="22"
        fill="none"
        stroke="#111"
        strokeWidth="3"
        strokeDasharray="4 6"
      />
      {[82, 100, 118].map((x) => (
        <path
          key={x}
          className="art-steam"
          d={`M${x} 58 q -8 -12 0 -24 q 8 -12 0 -24`}
          fill="none"
          stroke="#111"
          strokeWidth="4"
          strokeLinecap="round"
        />
      ))}
      <g className="art-float-b">
        <path d="M140 92 h 14 a 20 20 0 0 1 0 40 h -14" fill="none" stroke="#111" strokeWidth="8" />
        <rect
          x="56"
          y="66"
          width="88"
          height="96"
          rx="12"
          fill="#ff2e88"
          stroke="#111"
          strokeWidth="4"
        />
        <rect x="56" y="66" width="88" height="14" fill="#6b3a1f" stroke="#111" strokeWidth="4" />
        <circle cx="100" cy="118" r="20" fill="#fff6e5" stroke="#111" strokeWidth="3" />
        <path
          d="M92 110 q 8 8 0 16 M108 110 q -8 8 0 16"
          fill="none"
          stroke="#6b3a1f"
          strokeWidth="3"
        />
      </g>
      <circle
        className="art-float"
        cx="170"
        cy="30"
        r="9"
        fill="#2d5bff"
        stroke="#111"
        strokeWidth="3"
      />
    </svg>
  );
}
