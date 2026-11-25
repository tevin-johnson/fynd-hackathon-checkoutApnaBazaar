'use client';

import { useRef } from 'react';
import { formatPaise } from '@/lib/money';
import type { Product } from '@/lib/products';
import { selectQtyFor, useCheckoutStore } from '@/lib/store';
import ProductArt from './ProductArt';
import { flyToBag, prefersReducedMotion } from './fx';

export default function ProductCard({ product, index }: { product: Product; index: number }) {
  const qty = useCheckoutStore(selectQtyFor(product.id));
  const addItem = useCheckoutStore((s) => s.addItem);
  const cardRef = useRef<HTMLElement>(null);

  // 3D tilt that follows the cursor (CSS vars only — no re-renders).
  const onPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    const el = cardRef.current;
    if (!el || e.pointerType !== 'mouse' || prefersReducedMotion()) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty('--rx', `${(-y * 6).toFixed(2)}deg`);
    el.style.setProperty('--ry', `${(x * 8).toFixed(2)}deg`);
  };
  const onPointerLeave = () => {
    cardRef.current?.style.setProperty('--rx', '0deg');
    cardRef.current?.style.setProperty('--ry', '0deg');
  };

  return (
    <article
      ref={cardRef}
      className="product"
      aria-labelledby={`${product.id}-name`}
      data-testid={`product-${product.id}`}
      style={{ ['--i' as string]: index }}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <span
        key={qty}
        className={`sticker ${qty > 0 ? 'sticker--active' : 'sticker--empty'}`}
        data-testid={`in-cart-${product.id}`}
      >
        In cart: {qty}
      </span>
      <div className="product__art" data-art={product.id}>
        <ProductArt id={product.id} />
        <span className="product__art-tag">{product.sticker}</span>
      </div>
      <div className="product__body">
        <span className="product__tagline">{product.tagline}</span>
        <h3 className="product__name" id={`${product.id}-name`}>
          {product.name}
        </h3>
        <p className="product__desc">{product.description}</p>
        <div className="product__footer">
          <span className="product__price" data-testid={`price-${product.id}`}>
            {formatPaise(product.pricePaise)}
          </span>
          <button
            type="button"
            className={`btn ${index % 2 === 0 ? '' : 'btn--cobalt'}`}
            aria-label={`Add ${product.name} to cart`}
            onClick={(e) => {
              addItem(product.id);
              flyToBag(e.currentTarget);
            }}
          >
            <span aria-hidden="true">＋</span> Add to cart
          </button>
        </div>
      </div>
    </article>
  );
}
