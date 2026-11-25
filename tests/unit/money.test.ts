// Run with: npm run test:unit  (Node's built-in test runner + native TS type stripping)
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { addPaise, formatPaise, multiplyPaise } from '../../lib/money.ts';
import { PRODUCTS } from '../../lib/products.ts';

describe('money: integer-paise math', () => {
  it('adds paise exactly where floats would drift', () => {
    // 0.1 + 0.2 !== 0.3 in floating point; in paise it is exact.
    assert.equal(addPaise(10, 20), 30);
    assert.equal(formatPaise(addPaise(10, 20)), '₹0.30');
    assert.equal(addPaise(), 0);
    assert.equal(addPaise(49900, 24950, 24950), 99800);
  });

  it('multiplies quantity by unit paise', () => {
    assert.equal(multiplyPaise(3, 24950), 74850);
    assert.equal(multiplyPaise(0, 49900), 0);
    assert.equal(multiplyPaise(99, 49900), 4940100);
  });

  it('rejects non-integer paise and quantities', () => {
    assert.throws(() => addPaise(0.1), TypeError);
    assert.throws(() => multiplyPaise(1.5, 100), TypeError);
    assert.throws(() => multiplyPaise(2, 249.5), TypeError);
    assert.throws(() => formatPaise(Number.NaN), TypeError);
    assert.throws(() => multiplyPaise(Number.MAX_SAFE_INTEGER, 2), TypeError);
  });

  it('formats paise as rupees with Indian digit grouping', () => {
    assert.equal(formatPaise(0), '₹0.00');
    assert.equal(formatPaise(5), '₹0.05');
    assert.equal(formatPaise(24950), '₹249.50');
    assert.equal(formatPaise(49900), '₹499.00');
    assert.equal(formatPaise(123456), '₹1,234.56');
    assert.equal(formatPaise(4940100), '₹49,401.00');
    assert.equal(formatPaise(10000000), '₹1,00,000.00');
    assert.equal(formatPaise(12345678900), '₹12,34,56,789.00');
    assert.equal(formatPaise(-150), '-₹1.50');
  });

  it('catalog prices are integer paise', () => {
    for (const p of PRODUCTS) assert.ok(Number.isSafeInteger(p.pricePaise), p.id);
  });
});
