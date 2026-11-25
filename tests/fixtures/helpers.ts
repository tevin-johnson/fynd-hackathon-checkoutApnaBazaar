import { expect, test, type Page } from '@playwright/test';
import { formatPaise, multiplyPaise, addPaise } from '../../lib/money.ts';
import { getProduct, type ProductId } from '../../lib/products.ts';

export const ORDER_REFERENCE = /^ORD-[A-Z0-9]{6}$/;

export const PRODUCT_NAMES: Record<ProductId, string> = {
  'water-bottle': 'Water Bottle',
  'coffee-mug': 'Coffee Mug',
};

/** Fresh page load + explicit store reset through the test-only hook. */
export async function resetState(page: Page): Promise<void> {
  await page.goto('/');
  await page.waitForFunction(() => typeof window.__resetStore === 'function');
  await page.evaluate(() => window.__resetStore!());
  await expect(page.getByTestId('empty-cart')).toBeVisible();
}

/** Add products by clicking the real "Add to cart" buttons, like a customer. */
export async function seedCart(page: Page, items: Partial<Record<ProductId, number>>) {
  for (const [id, qty] of Object.entries(items) as [ProductId, number][]) {
    const button = page.getByRole('button', { name: `Add ${PRODUCT_NAMES[id]} to cart` });
    for (let i = 0; i < qty; i++) await button.click();
    await expect(page.getByTestId(`in-cart-${id}`)).toHaveText(`In cart: ${qty}`);
  }
}

/** Expected total, computed with the app's own integer-paise money module. */
export function expectedTotal(items: Partial<Record<ProductId, number>>): string {
  const lines = (Object.entries(items) as [ProductId, number][]).map(([id, qty]) =>
    multiplyPaise(qty, getProduct(id)!.pricePaise),
  );
  return formatPaise(addPaise(0, ...lines));
}

export async function expectTotal(page: Page, items: Partial<Record<ProductId, number>>) {
  await expect(page.getByTestId('order-total')).toHaveText(expectedTotal(items));
}

export async function evidence(page: Page, name: string) {
  // Freeze CSS animations for a crisp, deterministic evidence image.
  await page.screenshot({
    path: `test-results/evidence/${test.info().project.name}/${name}.png`,
    fullPage: true,
    animations: 'disabled',
  });
}
