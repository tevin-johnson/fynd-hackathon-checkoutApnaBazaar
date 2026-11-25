'use client';

import { useRef, useState } from 'react';
import type { ProductId } from '@/lib/products';
import { MAX_QTY, parseQtyInput } from '@/lib/quantity';
import { useCheckoutStore } from '@/lib/store';
import { prefersReducedMotion } from './fx';

const SHAKE: Keyframe[] = [
  { transform: 'translateX(0)' },
  { transform: 'translateX(-8px) rotate(-2deg)' },
  { transform: 'translateX(7px) rotate(2deg)' },
  { transform: 'translateX(-4px)' },
  { transform: 'translateX(0)' },
];

/**
 * − / numeric input / + stepper.
 * - Non-numeric, negative or decimal input is rejected (previous value kept).
 * - Values above MAX_QTY are clamped to MAX_QTY.
 * - 0 removes the line from the cart.
 * - Clearing the box is allowed mid-edit; blur restores the current quantity.
 */
export default function QtyStepper({
  id,
  name,
  qty,
}: {
  id: ProductId;
  name: string;
  qty: number;
}) {
  const setQty = useCheckoutStore((s) => s.setQty);
  const [draft, setDraft] = useState(String(qty));
  const [syncedQty, setSyncedQty] = useState(qty);
  const [hint, setHint] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep the text box in sync when qty changes from the −/+ buttons.
  if (qty !== syncedQty) {
    setSyncedQty(qty);
    setDraft(String(qty));
  }

  const shake = () => {
    if (prefersReducedMotion()) return;
    inputRef.current?.animate?.(SHAKE, { duration: 380, easing: 'ease-out' });
  };

  const hintId = `${id}-qty-hint`;

  const onChange = (raw: string) => {
    const result = parseQtyInput(raw);
    if (result.kind === 'empty') {
      setDraft('');
      setHint(null);
      return;
    }
    if (result.kind === 'invalid') {
      setHint(`Whole numbers from 0 to ${MAX_QTY} only.`);
      shake();
      return; // keep previous draft
    }
    const clamped = Number(raw.trim()) > MAX_QTY;
    setHint(clamped ? `Max ${MAX_QTY} per item, so we capped it.` : null);
    if (clamped) shake();
    setDraft(String(result.qty));
    setQty(id, result.qty);
  };

  return (
    <div className="qty">
      <button
        type="button"
        className="btn btn--icon"
        aria-label={`Decrease quantity of ${name}`}
        onClick={() => {
          setHint(null);
          setQty(id, qty - 1);
        }}
      >
        −
      </button>
      <input
        ref={inputRef}
        className="qty__input"
        type="text"
        inputMode="numeric"
        autoComplete="off"
        aria-label={`Quantity of ${name}`}
        aria-describedby={hint ? hintId : undefined}
        aria-invalid={hint ? true : undefined}
        value={draft}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => {
          if (draft === '') setDraft(String(qty));
        }}
      />
      <button
        type="button"
        className="btn btn--icon"
        aria-label={`Increase quantity of ${name}`}
        disabled={qty >= MAX_QTY}
        onClick={() => {
          setHint(null);
          setQty(id, qty + 1);
        }}
      >
        +
      </button>
      {hint && (
        <span className="qty__hint" id={hintId} role="status">
          {hint}
        </span>
      )}
    </div>
  );
}
