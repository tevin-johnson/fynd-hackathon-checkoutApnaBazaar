// Simulated order placement. The ONLY place an order reference is created.

import { addPaise, multiplyPaise } from './money.ts';
import { getProduct, type ProductId } from './products.ts';

export const ORDER_DELAY_MS = 500;
export const ORDER_REFERENCE_PATTERN = /^ORD-[A-Z0-9]{6}$/;

export interface OrderLine {
  id: ProductId;
  name: string;
  qty: number;
  unitPaise: number;
  linePaise: number;
}

export interface Order {
  reference: string;
  name: string;
  email: string;
  location: string;
  lines: OrderLine[];
  itemCount: number;
  totalPaise: number;
  placedAt: string;
}

let placeOrderCalls = 0;

/** How many times placeOrder() has run since page load / last reset (test evidence). */
export function getPlaceOrderCallCount(): number {
  return placeOrderCalls;
}

export function resetPlaceOrderCallCount(): void {
  placeOrderCalls = 0;
}

/** FNV-1a 32-bit hash of a random UUID → 6 base-36 chars → ORD-XXXXXX. */
export function makeOrderReference(uuid: string = crypto.randomUUID()): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < uuid.length; i++) {
    hash ^= uuid.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  const code = hash.toString(36).toUpperCase().padStart(6, '0').slice(-6);
  return `ORD-${code}`;
}

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export async function placeOrder(
  cart: ReadonlyArray<{ id: ProductId; qty: number }>,
  name: string,
  email = '',
  location = '',
): Promise<Order> {
  placeOrderCalls += 1;
  if (cart.length === 0) throw new Error('Cannot place an order with an empty cart');
  if (name.trim() === '') throw new Error('Name is required');

  const lines: OrderLine[] = cart.map(({ id, qty }) => {
    const product = getProduct(id);
    if (!product) throw new Error(`Unknown product ${id}`);
    return {
      id,
      name: product.name,
      qty,
      unitPaise: product.pricePaise,
      linePaise: multiplyPaise(qty, product.pricePaise),
    };
  });

  await delay(ORDER_DELAY_MS);

  return {
    reference: makeOrderReference(),
    name: name.trim(),
    email: email.trim(),
    location: location.trim(),
    lines,
    itemCount: lines.reduce((n, l) => n + l.qty, 0),
    totalPaise: addPaise(...lines.map((l) => l.linePaise)),
    placedAt: new Date().toISOString(),
  };
}
