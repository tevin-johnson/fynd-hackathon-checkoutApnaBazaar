// Pure quantity rules shared by the store and the stepper input.

export const MIN_QTY = 0; // 0 means "remove from cart"
export const MAX_QTY = 99;

/** Clamp a quantity into [MIN_QTY, MAX_QTY]. Non-integers are floored. */
export function clampQty(qty: number): number {
  if (!Number.isFinite(qty)) return MIN_QTY;
  return Math.min(MAX_QTY, Math.max(MIN_QTY, Math.floor(qty)));
}

export type QtyParseResult =
  | { kind: 'empty' } // user cleared the box mid-edit — do nothing yet
  | { kind: 'invalid' } // negative, decimal, letters — reject, keep previous value
  | { kind: 'ok'; qty: number }; // clamped to MAX_QTY

/** Parse raw text typed into the numeric quantity input. */
export function parseQtyInput(raw: string): QtyParseResult {
  const text = raw.trim();
  if (text === '') return { kind: 'empty' };
  if (!/^\d+$/.test(text)) return { kind: 'invalid' };
  return { kind: 'ok', qty: clampQty(Number(text)) };
}
