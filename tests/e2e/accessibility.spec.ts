import { expect, test } from '@playwright/test';

// Regression for DEF-01 (found in manual testing): the marquee's duplicated
// loop items were exposed to screen readers and the motion had no
// keyboard-accessible pause control.
test('marquee: duplicate items hidden from assistive tech and motion can be paused', async ({
  page,
}) => {
  await page.goto('/');

  // Each announcement is exposed exactly once in the accessibility tree.
  await expect(page.getByText('● Neighbourhood prices', { exact: true })).toHaveCount(2);
  await expect(page.locator('.marquee__item:not([aria-hidden="true"])')).toHaveCount(6);
  await expect(page.locator('.marquee__item[aria-hidden="true"]')).toHaveCount(6);

  const toggle = page.getByRole('button', { name: /Pause ticker/ });
  await toggle.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: /Play ticker/ })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.locator('.marquee__track')).toHaveCSS('animation-play-state', 'paused');
});
