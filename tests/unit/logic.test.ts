import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { buildCsp } from '../../lib/csp.ts';
import {
  ORDER_REFERENCE_PATTERN,
  getPlaceOrderCallCount,
  makeOrderReference,
  placeOrder,
} from '../../lib/order.ts';
import { MAX_QTY, clampQty, parseQtyInput } from '../../lib/quantity.ts';
import { selectItemCount, selectSubtotalPaise, useCheckoutStore } from '../../lib/store.ts';

describe('quantity rules', () => {
  it('parses valid input and clamps large values', () => {
    assert.deepEqual(parseQtyInput('3'), { kind: 'ok', qty: 3 });
    assert.deepEqual(parseQtyInput(' 7 '), { kind: 'ok', qty: 7 });
    assert.deepEqual(parseQtyInput('0'), { kind: 'ok', qty: 0 });
    assert.deepEqual(parseQtyInput('10000'), { kind: 'ok', qty: MAX_QTY });
  });

  it('rejects negatives, decimals and non-numerics', () => {
    for (const raw of ['-1', '-3', '2.5', 'abc', '1e3', '+2', '3x']) {
      assert.deepEqual(parseQtyInput(raw), { kind: 'invalid' }, raw);
    }
    assert.deepEqual(parseQtyInput(''), { kind: 'empty' });
  });

  it('clampQty keeps values in range', () => {
    assert.equal(clampQty(-5), 0);
    assert.equal(clampQty(150), MAX_QTY);
    assert.equal(clampQty(Number.NaN), 0);
    assert.equal(clampQty(4.9), 4);
  });
});

describe('store', () => {
  it('adds, updates, clamps and removes lines; totals stay exact', () => {
    const s = useCheckoutStore;
    s.getState().reset();
    s.getState().addItem('water-bottle');
    s.getState().addItem('coffee-mug');
    s.getState().addItem('coffee-mug');
    assert.equal(selectItemCount(s.getState()), 3);
    assert.equal(selectSubtotalPaise(s.getState()), 15000 + 2 * 23900);

    s.getState().setQty('coffee-mug', 10000);
    assert.equal(s.getState().cart.find((l) => l.id === 'coffee-mug')?.qty, MAX_QTY);

    s.getState().setQty('coffee-mug', 0);
    assert.equal(
      s.getState().cart.some((l) => l.id === 'coffee-mug'),
      false,
    );

    s.getState().setQty('water-bottle', -4);
    assert.equal(s.getState().cart.length, 0);
    assert.equal(selectSubtotalPaise(s.getState()), 0);
  });
});

describe('order placement', () => {
  it('reference matches ORD-XXXXXX', () => {
    for (let i = 0; i < 200; i++) assert.match(makeOrderReference(), ORDER_REFERENCE_PATTERN);
    assert.equal(makeOrderReference('fixed'), makeOrderReference('fixed'));
  });

  it('places an order with exact totals after the simulated delay', async () => {
    const before = getPlaceOrderCallCount();
    const started = Date.now();
    const order = await placeOrder(
      [
        { id: 'water-bottle', qty: 2 },
        { id: 'coffee-mug', qty: 3 },
      ],
      '  Frida  ',
    );
    assert.ok(Date.now() - started >= 450, 'simulated delay applied');
    assert.equal(getPlaceOrderCallCount(), before + 1);
    assert.equal(order.totalPaise, 2 * 15000 + 3 * 23900);
    assert.equal(order.itemCount, 5);
    assert.equal(order.name, 'Frida');
    assert.match(order.reference, ORDER_REFERENCE_PATTERN);
  });

  it('refuses empty carts and blank names', async () => {
    await assert.rejects(placeOrder([], 'Frida'));
    await assert.rejects(placeOrder([{ id: 'water-bottle', qty: 1 }], '   '));
  });
});

describe('content security policy', () => {
  it('production policy has no unsafe-inline/unsafe-eval for scripts', () => {
    const csp = buildCsp('abc123', false);
    const scriptSrc = csp.split('; ').find((d) => d.startsWith('script-src')) ?? '';
    assert.match(scriptSrc, /'nonce-abc123'/);
    assert.doesNotMatch(scriptSrc, /unsafe-inline|unsafe-eval/);
    assert.match(csp, /default-src 'self'/);
    assert.match(csp, /frame-ancestors 'none'/);
  });
});
