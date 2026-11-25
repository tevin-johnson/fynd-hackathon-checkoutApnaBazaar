import { expect, test } from '@playwright/test';
import { evidence, expectTotal, resetState, seedCart } from '../fixtures/helpers';

test.beforeEach(async ({ page }) => {
  await resetState(page);
});

test('blank name blocks the order, shows an accessible alert, and keeps cart + typed input', async ({
  page,
}) => {
  const items = { 'water-bottle': 1, 'coffee-mug': 2 } as const;
  await seedCart(page, items);
  await page.getByRole('textbox', { name: /^Email/ }).fill('frida@studio.art');
  await page.getByRole('textbox', { name: /^Name/ }).fill('   '); // whitespace only counts as blank

  await page.getByRole('button', { name: 'Place Order' }).click();

  // Our form alert (Next.js also renders an empty route-announcer alert).
  const alert = page.getByRole('alert').and(page.getByTestId('form-alert'));
  await expect(alert).toBeVisible();
  await expect(alert).toContainText('Please enter your name');
  await expect(alert).toBeFocused();
  await expect(page.getByRole('textbox', { name: /^Name/ })).toHaveAttribute(
    'aria-invalid',
    'true',
  );

  // No confirmation, nothing lost.
  await expect(page.getByTestId('confirmation')).toHaveCount(0);
  await expect(page.getByTestId('order-reference')).toHaveCount(0);
  await expect(page.getByRole('textbox', { name: /^Email/ })).toHaveValue('frida@studio.art');
  await expect(page.getByTestId('cart-line-water-bottle')).toBeVisible();
  await expect(page.getByTestId('cart-line-coffee-mug')).toBeVisible();
  await expectTotal(page, items);
  expect(await page.evaluate(() => window.__getPlaceOrderCallCount!())).toBe(0);
  await evidence(page, 'validation-blank-name');
});

test('empty cart blocks the order with a clear alert (MT-01)', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Checkout →' })).toBeDisabled();
  await page.getByRole('textbox', { name: /^Name/ }).fill('Empty Bag');

  await page.getByRole('button', { name: 'Place Order' }).click();

  // Our form alert (Next.js also renders an empty route-announcer alert).
  const alert = page.getByRole('alert').and(page.getByTestId('form-alert'));
  await expect(alert).toContainText('Your bag is empty');
  await expect(alert).toBeFocused();
  await expect(page.getByTestId('confirmation')).toHaveCount(0);
  await expect(page.getByRole('textbox', { name: /^Name/ })).toHaveValue('Empty Bag');
  expect(await page.evaluate(() => window.__getPlaceOrderCallCount!())).toBe(0);
  await evidence(page, 'validation-empty-cart');
});
