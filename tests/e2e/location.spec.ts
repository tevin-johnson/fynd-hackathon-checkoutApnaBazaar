import { expect, test } from '@playwright/test';
import { ORDER_REFERENCE, evidence, resetState, seedCart } from '../fixtures/helpers';

test.beforeEach(async ({ page }) => {
  await resetState(page);
});

test('typing a city lists valid choices; picking one fills it and it reaches the confirmation', async ({
  page,
}) => {
  await seedCart(page, { 'coffee-mug': 1 });
  await page.getByRole('textbox', { name: /^Name/ }).fill('Meera Iyer');

  const city = page.getByRole('combobox', { name: /Delivery city/ });
  await city.fill('pu');
  const list = page.getByRole('listbox', { name: 'Matching cities' });
  await expect(list).toBeVisible();
  await expect(city).toHaveAttribute('aria-expanded', 'true');
  await expect(list.getByRole('option', { name: /Pune/ })).toBeVisible();
  await expect(list.getByRole('option', { name: /Puducherry/ })).toBeVisible();
  await evidence(page, 'location-suggestions');

  // Keyboard: ↓ moves through options, Enter picks (and does NOT submit the form).
  await city.press('ArrowDown');
  await city.press('ArrowDown');
  await expect(list.getByRole('option', { selected: true })).toContainText('Pune');
  await city.press('Enter');
  await expect(city).toHaveValue('Pune, Maharashtra');
  await expect(list).toBeHidden();
  await expect(page.getByTestId('confirmation')).toHaveCount(0);

  await page.getByRole('button', { name: 'Place Order' }).click();
  await expect(page.getByTestId('order-reference')).toHaveText(ORDER_REFERENCE);
  await expect(page.getByTestId('confirmation-location')).toHaveText(
    '📍 Delivering to Pune, Maharashtra',
  );
});

test('click/tap picks a suggestion, and an exact city name auto-fills on leaving the field', async ({
  page,
}) => {
  const city = page.getByRole('combobox', { name: /Delivery city/ });

  // DEF-04 regression: the city field is as wide as the Name field. Compare
  // layout widths (offsetWidth), which ignore the panel's entrance animation.
  const widthOf = (el: Element) => (el as HTMLElement).offsetWidth;
  const nameWidth = await page.getByRole('textbox', { name: /^Name/ }).evaluate(widthOf);
  await expect.poll(() => city.evaluate(widthOf)).toBe(nameWidth);

  await city.fill('beng');
  await page.getByRole('option', { name: /Bengaluru/ }).click();
  await expect(city).toHaveValue('Bengaluru, Karnataka');

  await city.fill('jaipur');
  await page.getByRole('textbox', { name: /^Name/ }).click(); // blur
  await expect(city).toHaveValue('Jaipur, Rajasthan');
});

test('an unknown location blocks checkout with a clear message and keeps all input', async ({
  page,
}) => {
  await seedCart(page, { 'water-bottle': 1 });
  await page.getByRole('textbox', { name: /^Name/ }).fill('Meera Iyer');
  const city = page.getByRole('combobox', { name: /Delivery city/ });
  await city.fill('Atlantis');
  await expect(page.getByRole('listbox', { name: 'Matching cities' })).toBeHidden();

  await page.getByRole('button', { name: 'Place Order' }).click();

  const alert = page.getByRole('alert').and(page.getByTestId('form-alert'));
  await expect(alert).toContainText('We don’t deliver to that location yet');
  await expect(alert).toBeFocused();
  await expect(city).toHaveAttribute('aria-invalid', 'true');
  await expect(city).toHaveValue('Atlantis');
  await expect(page.getByRole('textbox', { name: /^Name/ })).toHaveValue('Meera Iyer');
  await expect(page.getByTestId('confirmation')).toHaveCount(0);
  expect(await page.evaluate(() => window.__getPlaceOrderCallCount!())).toBe(0);
});
