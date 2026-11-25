'use client';

import { useEffect } from 'react';
import { prefersReducedMotion } from './fx';

type Shape = {
  top: string;
  left: string;
  depth: number;
  variant?: 'b' | 'spin';
  delay?: string;
  node: React.ReactNode;
};

const SHAPES: Shape[] = [
  {
    top: '8%',
    left: '3%',
    depth: 18,
    node: (
      <svg width="120" height="50" viewBox="0 0 120 50" fill="none">
        <path
          d="M5 25 Q 20 5 35 25 T 65 25 T 95 25 T 115 25"
          stroke="#ff2e88"
          strokeWidth="7"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    top: '18%',
    left: '86%',
    depth: -24,
    variant: 'spin',
    node: (
      <svg width="70" height="70" viewBox="0 0 70 70">
        <circle cx="35" cy="35" r="28" fill="#ffe600" stroke="#111" strokeWidth="4" />
        <circle cx="35" cy="35" r="10" fill="#2d5bff" stroke="#111" strokeWidth="3" />
      </svg>
    ),
  },
  {
    top: '55%',
    left: '92%',
    depth: 30,
    variant: 'b',
    node: (
      <svg width="110" height="60" viewBox="0 0 110 60" fill="none">
        <polyline
          points="5,40 25,15 45,40 65,15 85,40 105,15"
          stroke="#2d5bff"
          strokeWidth="7"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    top: '72%',
    left: '2%',
    depth: -18,
    variant: 'spin',
    node: (
      <svg width="64" height="64" viewBox="0 0 64 64">
        <polygon points="32,4 60,58 4,58" fill="#2be0a8" stroke="#111" strokeWidth="4" />
      </svg>
    ),
  },
  {
    top: '40%',
    left: '46%',
    depth: 12,
    variant: 'b',
    node: (
      <div className="fun-bg__dots" aria-hidden="true">
        {Array.from({ length: 20 }, (_, i) => (
          <span key={i} />
        ))}
      </div>
    ),
  },
  {
    top: '88%',
    left: '60%',
    depth: 22,
    node: (
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
        <path d="M6 74 A 68 68 0 0 1 74 6" stroke="#111" strokeWidth="6" />
        <path d="M22 74 A 52 52 0 0 1 74 22" stroke="#ff7a1a" strokeWidth="6" />
      </svg>
    ),
  },
  {
    top: '30%',
    left: '-1%',
    depth: 26,
    variant: 'b',
    node: (
      <svg width="56" height="56" viewBox="0 0 56 56">
        <rect
          x="8"
          y="8"
          width="40"
          height="40"
          fill="#c9b6ff"
          stroke="#111"
          strokeWidth="4"
          transform="rotate(20 28 28)"
        />
      </svg>
    ),
  },
  {
    top: '4%',
    left: '58%',
    depth: -14,
    node: (
      <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
        <circle cx="30" cy="30" r="22" stroke="#111" strokeWidth="3" />
        <line x1="2" y1="30" x2="58" y2="30" stroke="#111" strokeWidth="3" />
        <line x1="30" y1="2" x2="30" y2="58" stroke="#111" strokeWidth="3" />
      </svg>
    ),
  },
];

/** Floating Memphis confetti with mouse parallax. Purely decorative. */
export default function FunBackground() {
  useEffect(() => {
    if (prefersReducedMotion()) return;
    let frame = 0;
    const root = document.documentElement;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        root.style.setProperty('--px', ((e.clientX / window.innerWidth - 0.5) * 2).toFixed(3));
        root.style.setProperty('--py', ((e.clientY / window.innerHeight - 0.5) * 2).toFixed(3));
      });
    };
    window.addEventListener('pointermove', onMove);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onMove);
    };
  }, []);

  return (
    <div className="fun-bg" aria-hidden="true">
      {SHAPES.map((s, i) => (
        <div
          key={i}
          className="fun-bg__layer"
          style={{ top: s.top, left: s.left, ['--depth' as string]: s.depth }}
        >
          <div
            className={`fun-bg__shape${s.variant === 'b' ? ' fun-bg__shape--b' : ''}${
              s.variant === 'spin' ? ' fun-bg__shape--spin' : ''
            }`}
            style={{ animationDelay: `${i * -1.3}s` }}
          >
            {s.node}
          </div>
        </div>
      ))}
    </div>
  );
}
