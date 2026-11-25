import { expect, test } from '@playwright/test';
import {
  ORDER_REFERENCE,
  evidence,
  expectTotal,
  expectedTotal,
  resetState,
  seedCart,
} from '../fixtures/helpers';

test.beforeEach(async ({ page }) => {
  await resetState(page);
});

test('happy path: add items, enter name, place order → confirmation with reference and exact total', async ({
  page,
}) => {
  const items = { 'water-bottle': 2, 'coffee-mug': 1 } as const;
  await seedCart(page, items);
  await expectTotal(page, items);

  await page.getByRole('textbox', { name: /^Name/ }).fill('Frida Kahlo');
  await page.getByRole('button', { name: 'Place Order' }).click();

  const confirmation = page.getByTestId('confirmation');
  await expect(confirmation).toBeVisible();
  await expect(page.getByRole('heading', { name: /Order confirmed/ })).toBeVisible();
  await expect(page.getByTestId('order-reference')).toHaveText(ORDER_REFERENCE);
  await expect(page.getByTestId('confirmation-total')).toHaveText(expectedTotal(items)); // ₹539.00
  await expect(page.getByTestId('confirmation-lines')).toContainText('Water Bottle × 2');
  await expect(page.getByTestId('confirmation-lines')).toContainText('Coffee Mug × 1');
  await evidence(page, 'happy-path-confirmation');

  // MT-06: a new order starts from a clean slate.
  await page.getByRole('button', { name: 'Place another order' }).click();
  await expect(page.getByTestId('empty-cart')).toBeVisible();
  await expect(page.getByTestId('order-total')).toHaveText('₹0.00');
  await expect(page.getByRole('textbox', { name: /^Name/ })).toHaveValue('');
});

test('double-clicking Place Order produces exactly one order and one reference (MT-02)', async ({
  page,
}) => {
  // DEF-03 / DEF-05 regression: sample the layout-viewport width on EVERY
  // animation frame from adding to the bag through the confirmation. Any
  // transient spike (an animation poking past the screen edge) is recorded, so
  // a test that only checks the settled width can't miss it.
  await page.evaluate(() => {
    const w = window as unknown as { __maxInnerWidth: number };
    w.__maxInnerWidth = window.innerWidth;
    const tick = () => {
      w.__maxInnerWidth = Math.max(w.__maxInnerWidth, window.innerWidth);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

  await seedCart(page, { 'coffee-mug': 1 });
  await page.getByRole('textbox', { name: /^Name/ }).fill('Double Clicker');

  // Watch every animation frame (so the transient state can't be missed) for the
  // submit button becoming disabled while the simulated 500ms request is in flight.
  const sawDisabledWhileSubmitting = page.waitForFunction(
    () => {
      const btn = document.querySelector<HTMLButtonElement>('button[type="submit"]');
      return !!btn && btn.disabled && btn.getAttribute('aria-busy') === 'true';
    },
    null,
    { polling: 'raf' },
  );

  await page.getByRole('button', { name: 'Place Order' }).dblclick();
  await sawDisabledWhileSubmitting;

  await expect(page.getByTestId('confirmation')).toHaveCount(1);
  await expect(page.getByTestId('order-reference')).toHaveCount(1);
  await expect(page.getByTestId('order-reference')).toHaveText(ORDER_REFERENCE);
  expect(await page.evaluate(() => window.__getPlaceOrderCallCount!())).toBe(1);

  // No animation along the way may widen the (mobile) layout viewport, not even
  // for a single frame, and the page must end with no sideways overflow.
  await expect(page.getByTestId('order-reference')).toBeVisible();
  const viewportWidth = page.viewportSize()!.width;
  const widths = await page.evaluate(() => ({
    max: (window as unknown as { __maxInnerWidth: number }).__maxInnerWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  expect(widths, 'layout viewport widened during add-to-cart or ordering').toEqual({
    max: viewportWidth,
    scroll: viewportWidth,
  });

  await evidence(page, 'double-click-single-confirmation');
});
