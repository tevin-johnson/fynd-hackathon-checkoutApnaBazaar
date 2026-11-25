import { expect, test } from '@playwright/test';
import { addPaise, formatPaise, multiplyPaise } from '../../lib/money.ts';
import { getProduct } from '../../lib/products.ts';
import { evidence, expectTotal, resetState, seedCart } from '../fixtures/helpers';

const BOTTLE = getProduct('water-bottle')!.pricePaise;
const MUG = getProduct('coffee-mug')!.pricePaise;

test.beforeEach(async ({ page }) => {
  await resetState(page);
});

test('changing quantity updates line and order totals to the exact cent', async ({ page }) => {
  await seedCart(page, { 'coffee-mug': 1 });
  await expectTotal(page, { 'coffee-mug': 1 });

  // Type a quantity directly.
  const mugQty = page.getByRole('textbox', { name: 'Quantity of Coffee Mug' });
  await mugQty.fill('3');
  await expect(page.getByTestId('line-total-coffee-mug')).toHaveText(
    formatPaise(multiplyPaise(3, MUG)),
  );
  await expectTotal(page, { 'coffee-mug': 3 }); // ₹717.00

  // + / − buttons.
  await page.getByRole('button', { name: 'Increase quantity of Coffee Mug' }).click();
  await expectTotal(page, { 'coffee-mug': 4 });
  await page.getByRole('button', { name: 'Decrease quantity of Coffee Mug' }).click();
  await expect(mugQty).toHaveValue('3');

  // Mixed cart.
  await seedCart(page, { 'water-bottle': 1 });
  await expect(page.getByTestId('order-total')).toHaveText(
    formatPaise(addPaise(multiplyPaise(3, MUG), multiplyPaise(1, BOTTLE))),
  );
  await evidence(page, 'quantity-exact-total');
});

test('quantity input rejects negatives / non-numerics, clamps huge values, and 0 removes (MT-04)', async ({
  page,
}) => {
  await seedCart(page, { 'water-bottle': 2 });
  const qty = page.getByRole('textbox', { name: 'Quantity of Water Bottle' });

  await qty.fill('-3');
  await expect(qty).toHaveValue('2');
  await expect(page.getByText('Whole numbers from 0 to 99 only.')).toBeVisible();
  await expectTotal(page, { 'water-bottle': 2 });

  await qty.fill('abc');
  await expect(qty).toHaveValue('2');
  await expectTotal(page, { 'water-bottle': 2 });

  await qty.fill('10000');
  await expect(qty).toHaveValue('99');
  await expectTotal(page, { 'water-bottle': 99 }); // ₹14,850.00
  await expect(
    page.getByRole('button', { name: 'Increase quantity of Water Bottle' }),
  ).toBeDisabled();
  await evidence(page, 'quantity-clamped-99');

  await qty.fill('0');
  await expect(page.getByTestId('cart-line-water-bottle')).toHaveCount(0);
  await expect(page.getByTestId('empty-cart')).toBeVisible();
  await expect(page.getByTestId('order-total')).toHaveText('₹0.00');
});
