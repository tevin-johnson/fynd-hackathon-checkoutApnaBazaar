'use client';

import { formatPaise } from '@/lib/money';
import { selectItemCount, selectSubtotalPaise, useCheckoutStore } from '@/lib/store';

export default function CartSummary() {
  const count = useCheckoutStore(selectItemCount);
  const subtotal = useCheckoutStore(selectSubtotalPaise);
  const total = subtotal; // no tax/shipping in this demo store — shipping is free

  return (
    <section className="panel summary" aria-labelledby="summary-title">
      <h2 className="sr-only" id="summary-title">
        Order summary
      </h2>
      <dl style={{ margin: 0 }}>
        <div className="summary__row">
          <dt>Items</dt>
          <dd data-testid="item-count">{count}</dd>
        </div>
        <div className="summary__row">
          <dt>Subtotal</dt>
          <dd data-testid="subtotal">{formatPaise(subtotal)}</dd>
        </div>
        <div className="summary__row">
          <dt>Shipping</dt>
          <dd>Free ✦</dd>
        </div>
        <div className="summary__row summary__total">
          <dt>Order total</dt>
          <dd>
            <span key={total} className="summary__total-value pop" data-testid="order-total">
              {formatPaise(total)}
            </span>
          </dd>
        </div>
      </dl>
      <button
        type="button"
        className="btn btn--mint btn--block summary__cta"
        disabled={count === 0}
        onClick={() => {
          const input = document.getElementById('customer-name');
          input?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          input?.focus({ preventScroll: true });
        }}
      >
        Checkout →
      </button>
    </section>
  );
}
