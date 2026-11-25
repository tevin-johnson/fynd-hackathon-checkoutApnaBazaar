'use client';

import { useEffect, useRef, useState } from 'react';
import { formatPaise } from '@/lib/money';
import type { Order } from '@/lib/order';
import { useCheckoutStore } from '@/lib/store';
import Confetti from './Confetti';

export default function ConfirmationView({ order }: { order: Order }) {
  const reset = useCheckoutStore((s) => s.reset);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Confetti is one-shot: unmount it once every piece has fallen (max ~5.6s).
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    headingRef.current?.focus();
    const t = window.setTimeout(() => setShowConfetti(false), 6000);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <>
      {showConfetti && <Confetti />}
      <section className="panel confirm" aria-labelledby="confirm-title" data-testid="confirmation">
        <span className="confirm__stamp" aria-hidden="true">
          Ordered!
        </span>
        <h2 className="confirm__title" id="confirm-title" ref={headingRef} tabIndex={-1}>
          Order confirmed. Thanks, {order.name}!
        </h2>
        {order.location && (
          <p className="confirm__location" data-testid="confirmation-location">
            📍 Delivering to {order.location}
          </p>
        )}
        <p style={{ margin: 0 }}>
          Your order is being packed with love.
          {order.email ? ` A (pretend) receipt is heading to ${order.email}.` : ''}
        </p>

        <div className="ticket">
          <span className="ticket__label">Order reference</span>
          <span className="ticket__ref" data-testid="order-reference">
            {order.reference}
          </span>
        </div>

        <h3 className="sr-only">Order summary</h3>
        <ul className="confirm__lines" data-testid="confirmation-lines">
          {order.lines.map((l) => (
            <li key={l.id}>
              <span>
                {l.name} × {l.qty}
              </span>
              <span>{formatPaise(l.linePaise)}</span>
            </li>
          ))}
        </ul>
        <div className="confirm__total">
          <span>Total</span>
          <span data-testid="confirmation-total">{formatPaise(order.totalPaise)}</span>
        </div>

        <button type="button" className="btn btn--cobalt" onClick={reset}>
          Place another order
        </button>
      </section>
    </>
  );
}
