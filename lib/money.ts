// Integer-paise money math. Pure functions only — no imports from the store or
// components, so everything here is unit-testable in isolation.

function assertPaise(value: number, label: string): void {
  if (!Number.isSafeInteger(value)) {
    throw new TypeError(`${label} must be a safe integer number of paise, got ${value}`);
  }
}

/** Sum any number of integer-paise amounts. */
export function addPaise(...amounts: number[]): number {
  let total = 0;
  for (const amount of amounts) {
    assertPaise(amount, 'amount');
    total += amount;
  }
  assertPaise(total, 'total');
  return total;
}

/** Line total: quantity × unit price, both integers. */
export function multiplyPaise(qty: number, unitPaise: number): number {
  assertPaise(qty, 'qty');
  assertPaise(unitPaise, 'unitPaise');
  const result = qty * unitPaise;
  assertPaise(result, 'result');
  return result;
}

/** Group rupees the Indian way: last 3 digits, then pairs (12,34,567). */
function groupIndian(rupees: number): string {
  const digits = String(rupees);
  if (digits.length <= 3) return digits;
  const head = digits.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  return `${head},${digits.slice(-3)}`;
}

/** 24950 → "₹249.50"; 12345678900 → "₹12,34,56,789.00"; -150 → "-₹1.50". Locale-independent. */
export function formatPaise(paise: number): string {
  assertPaise(paise, 'paise');
  const sign = paise < 0 ? '-' : '';
  const abs = Math.abs(paise);
  const rupees = Math.floor(abs / 100);
  const rem = abs % 100;
  return `${sign}₹${groupIndian(rupees)}.${String(rem).padStart(2, '0')}`;
}
