// Zustand store — the only module that mutates application state.
// No persist middleware: every page load starts with a fresh, empty cart.

import { create } from 'zustand';
import { addPaise, multiplyPaise } from './money.ts';
import type { Order } from './order.ts';
import { getProduct, type ProductId } from './products.ts';
import { clampQty } from './quantity.ts';

export interface CartLine {
  id: ProductId;
  qty: number;
}

export interface CheckoutState {
  cart: CartLine[];
  name: string;
  email: string;
  location: string;
  lastOrder: Order | null;
  addItem: (id: ProductId) => void;
  removeItem: (id: ProductId) => void;
  setQty: (id: ProductId, qty: number) => void;
  clearCart: () => void;
  setName: (name: string) => void;
  setEmail: (email: string) => void;
  setLocation: (location: string) => void;
  completeOrder: (order: Order) => void;
  reset: () => void;
}

const initialData = () => ({
  cart: [] as CartLine[],
  name: '',
  email: '',
  location: '',
  lastOrder: null,
});

export const useCheckoutStore = create<CheckoutState>()((set) => ({
  ...initialData(),
  addItem: (id) =>
    set((s) => {
      const existing = s.cart.find((l) => l.id === id);
      if (!existing) return { cart: [...s.cart, { id, qty: 1 }] };
      return {
        cart: s.cart.map((l) => (l.id === id ? { ...l, qty: clampQty(l.qty + 1) } : l)),
      };
    }),
  removeItem: (id) => set((s) => ({ cart: s.cart.filter((l) => l.id !== id) })),
  setQty: (id, qty) =>
    set((s) => {
      const next = clampQty(qty);
      if (next === 0) return { cart: s.cart.filter((l) => l.id !== id) };
      return { cart: s.cart.map((l) => (l.id === id ? { ...l, qty: next } : l)) };
    }),
  clearCart: () => set({ cart: [] }),
  setName: (name) => set({ name }),
  setEmail: (email) => set({ email }),
  setLocation: (location) => set({ location }),
  completeOrder: (order) => set({ lastOrder: order, cart: [], name: '', email: '', location: '' }),
  reset: () => set(initialData()),
}));

// ---- Derived selectors (pure; all money in integer paise) ----

export const selectItemCount = (s: Pick<CheckoutState, 'cart'>): number =>
  s.cart.reduce((n, l) => n + l.qty, 0);

export const selectLinePaise = (line: CartLine): number => {
  const product = getProduct(line.id);
  return product ? multiplyPaise(line.qty, product.pricePaise) : 0;
};

export const selectSubtotalPaise = (s: Pick<CheckoutState, 'cart'>): number =>
  addPaise(0, ...s.cart.map(selectLinePaise));

export const selectQtyFor =
  (id: ProductId) =>
  (s: Pick<CheckoutState, 'cart'>): number =>
    s.cart.find((l) => l.id === id)?.qty ?? 0;
