'use client';

import { formatPaise } from '@/lib/money';
import { getProduct } from '@/lib/products';
import { selectLinePaise, useCheckoutStore, type CartLine } from '@/lib/store';
import QtyStepper from './QtyStepper';

export default function CartItem({ line }: { line: CartLine }) {
  const removeItem = useCheckoutStore((s) => s.removeItem);
  const product = getProduct(line.id);
  if (!product) return null;
  const linePaise = selectLinePaise(line);

  return (
    <li className="cart-item" data-testid={`cart-line-${line.id}`}>
      <div>
        <div className="cart-item__name">{product.name}</div>
        <div className="cart-item__unit">{formatPaise(product.pricePaise)} each</div>
      </div>
      <button
        type="button"
        className="btn btn--icon btn--remove"
        aria-label={`Remove ${product.name} from cart`}
        onClick={() => removeItem(line.id)}
      >
        ×
      </button>
      <div className="cart-item__controls">
        <QtyStepper id={line.id} name={product.name} qty={line.qty} />
        <span
          key={linePaise}
          className="cart-item__line pop"
          data-testid={`line-total-${line.id}`}
          aria-label={`Line total for ${product.name}`}
        >
          {formatPaise(linePaise)}
        </span>
      </div>
    </li>
  );
}
