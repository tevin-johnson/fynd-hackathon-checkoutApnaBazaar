'use client';

import { selectItemCount, useCheckoutStore } from '@/lib/store';
import CartItem from './CartItem';

export default function Cart() {
  const cart = useCheckoutStore((s) => s.cart);
  const count = useCheckoutStore(selectItemCount);

  return (
    <section className="panel cart" aria-labelledby="cart-title" data-testid="cart">
      <div className="cart__head">
        <h2 className="section-title" id="cart-title" style={{ margin: 0 }}>
          <span className="section-title__diamond" aria-hidden="true" />
          Your Bag
        </h2>
        <span className="bag" id="bag-target" aria-hidden="true">
          👜
          <span key={count} className={`bag__count${count > 0 ? ' pop' : ''}`}>
            {count}
          </span>
        </span>
      </div>

      {cart.length === 0 ? (
        <div className="empty" data-testid="empty-cart">
          <span className="empty__icon" aria-hidden="true">
            🛍️
          </span>
          <p className="empty__title">Your bag is snoozing</p>
          <p>Wake it up with something weird and wonderful.</p>
        </div>
      ) : (
        <ul className="cart__list" aria-label="Items in your bag">
          {cart.map((line) => (
            <CartItem key={line.id} line={line} />
          ))}
        </ul>
      )}
    </section>
  );
}
