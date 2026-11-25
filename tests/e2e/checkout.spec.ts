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

  // DEF-03 regression: the confirmation's entrance animations must not widen
  // the (mobile) layout viewport, i.e. no sideways panning after ordering.
  await expect(page.getByTestId('order-reference')).toBeVisible();
  const viewportWidth = page.viewportSize()!.width;
  await expect
    .poll(() => page.evaluate(() => [window.innerWidth, document.documentElement.scrollWidth]))
    .toEqual([viewportWidth, viewportWidth]);

  await evidence(page, 'double-click-single-confirmation');
});
