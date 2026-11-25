import { expect, test } from '@playwright/test';

test('serves hardened security headers with a nonce-based CSP', async ({ request }) => {
  const res = await request.get('/');
  expect(res.status()).toBe(200);
  const h = res.headers();

  const csp = h['content-security-policy'];
  expect(csp).toBeTruthy();
  expect(csp).toContain("default-src 'self'");
  const scriptSrc = csp!.split(';').find((d) => d.trim().startsWith('script-src')) ?? '';
  expect(scriptSrc).toMatch(/'nonce-[A-Za-z0-9+/=]+'/);
  expect(scriptSrc).not.toContain('unsafe-inline');
  expect(scriptSrc).not.toContain('unsafe-eval');

  expect(h['x-content-type-options']).toBe('nosniff');
  expect(h['x-frame-options']).toBe('DENY');
  expect(h['referrer-policy']).toBe('strict-origin-when-cross-origin');
  expect(h['permissions-policy']).toBe('camera=(), microphone=(), geolocation=()');
});

test('page hydrates under the CSP with no violations and no external requests', async ({
  page,
  baseURL,
}) => {
  const violations: string[] = [];
  const external: string[] = [];
  page.on('console', (msg) => {
    if (/Content Security Policy|Refused to/i.test(msg.text())) violations.push(msg.text());
  });
  page.on('request', (req) => {
    if (!req.url().startsWith(baseURL!) && !req.url().startsWith('data:')) external.push(req.url());
  });

  await page.goto('/');
  // Proves client JS is running: clicking updates the cart.
  await page.getByRole('button', { name: 'Add Water Bottle to cart' }).click();
  await expect(page.getByTestId('order-total')).toHaveText('₹150.00');

  expect(violations).toEqual([]);
  expect(external).toEqual([]);
});
