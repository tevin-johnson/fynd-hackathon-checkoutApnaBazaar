'use client';

import { useEffect } from 'react';
import { installTestHooks } from '@/lib/testHooks';
import { useCheckoutStore } from '@/lib/store';
import Cart from './Cart';
import CartSummary from './CartSummary';
import CheckoutForm from './CheckoutForm';
import ConfirmationView from './ConfirmationView';
import FunBackground from './FunBackground';
import Hero from './Hero';
import Marquee from './Marquee';
import ProductList from './ProductList';
import { sparkleAt } from './fx';

export default function CheckoutPage() {
  const lastOrder = useCheckoutStore((s) => s.lastOrder);

  useEffect(() => {
    installTestHooks();
  }, []);

  // Sparkle bursts on every button press, anywhere on the page.
  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (e.target instanceof Element && e.target.closest('button'))
        sparkleAt(e.clientX, e.clientY);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, []);

  return (
    <>
      <FunBackground />
      <Marquee />
      <main className="page">
        <Hero />
        {lastOrder ? (
          <ConfirmationView order={lastOrder} />
        ) : (
          <div className="layout">
            <ProductList />
            <aside className="sidebar" aria-label="Your bag and checkout">
              <Cart />
              <CartSummary />
              <CheckoutForm />
            </aside>
          </div>
        )}
      </main>
      <footer className="footer">
        Apna Bazaar is a fictional shop. No payment is taken and no data leaves your browser.
      </footer>
    </>
  );
}
