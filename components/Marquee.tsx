'use client';

import { useState } from 'react';

const ITEMS = [
  '★ Free delivery on every order',
  '✺ Fresh stock every week',
  '◆ Steel bottles that stay cold',
  '✿ Mugs made for chai & coffee',
  '▲ Demo shop, no payment taken',
  '● Neighbourhood prices',
];

/**
 * Infinite scrolling ticker. The second copy of the items exists only to make
 * the loop seamless, so it is hidden from assistive tech. A real button pauses
 * the motion (WCAG 2.2.2); hovering pauses it too.
 */
export default function Marquee() {
  const [paused, setPaused] = useState(false);
  return (
    <div className={`marquee${paused ? ' marquee--paused' : ''}`}>
      <div className="marquee__track">
        {ITEMS.map((t) => (
          <span className="marquee__item" key={t}>
            {t}
          </span>
        ))}
        {ITEMS.map((t) => (
          <span className="marquee__item" key={`dup-${t}`} aria-hidden="true">
            {t}
          </span>
        ))}
      </div>
      <button
        type="button"
        className="marquee__toggle"
        aria-pressed={paused}
        onClick={() => setPaused((p) => !p)}
      >
        {paused ? '▶ Play ticker' : '❚❚ Pause ticker'}
      </button>
    </div>
  );
}
