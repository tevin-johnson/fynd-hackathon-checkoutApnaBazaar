// Small imperative animation helpers (DOM-only, no state). Every effect is
// skipped when the user prefers reduced motion, and every element is
// pointer-events: none so it can never block a click.

const COLORS = ['#ff2e88', '#ffe600', '#2d5bff', '#2be0a8', '#ff7a1a', '#c9b6ff'];

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/** Burst of little stars at a screen point. */
export function sparkleAt(x: number, y: number, count = 8): void {
  if (prefersReducedMotion()) return;
  for (let i = 0; i < count; i++) {
    const s = document.createElement('span');
    s.className = 'sparkle';
    s.style.left = `${x}px`;
    s.style.top = `${y}px`;
    s.style.setProperty('--a', `${(360 / count) * i + Math.random() * 20}deg`);
    s.style.setProperty('--c', COLORS[i % COLORS.length] ?? '#ff2e88');
    document.body.appendChild(s);
    window.setTimeout(() => s.remove(), 650);
  }
}

/** A "+1" token arcs from the clicked button into the bag icon, then the bag bumps. */
export function flyToBag(from: Element, label = '+1'): void {
  const target = document.getElementById('bag-target');
  if (!target) return;
  const bump = () => {
    target.classList.remove('bag--bump');
    // force reflow so the animation restarts on rapid clicks
    void (target as HTMLElement).offsetWidth;
    target.classList.add('bag--bump');
  };
  if (prefersReducedMotion() || typeof Element.prototype.animate !== 'function') {
    bump();
    return;
  }
  const a = from.getBoundingClientRect();
  const b = target.getBoundingClientRect();
  const flyer = document.createElement('span');
  flyer.className = 'flyer';
  flyer.textContent = label;
  flyer.setAttribute('aria-hidden', 'true');
  const startX = a.left + a.width / 2 - 17;
  const startY = a.top + a.height / 2 - 17;
  const dx = b.left + b.width / 2 - 17 - startX;
  const dy = b.top + b.height / 2 - 17 - startY;
  flyer.style.left = `${startX}px`;
  flyer.style.top = `${startY}px`;
  document.body.appendChild(flyer);
  const anim = flyer.animate(
    [
      { transform: 'translate(0,0) scale(1) rotate(0deg)', opacity: 1 },
      {
        transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 120}px) scale(1.3) rotate(200deg)`,
        opacity: 1,
        offset: 0.5,
      },
      { transform: `translate(${dx}px, ${dy}px) scale(0.4) rotate(400deg)`, opacity: 0.2 },
    ],
    { duration: 650, easing: 'cubic-bezier(0.5, 0, 0.5, 1)' },
  );
  anim.onfinish = () => {
    flyer.remove();
    bump();
  };
}
