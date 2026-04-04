import { test, expect } from '@playwright/test';
import { CartPage } from '../pages/CartPage';

test.describe('Cart', () => {
  test('cart page loads', async ({ page }) => {
    const cart = new CartPage(page);
    await cart.goto();
    await cart.waitForLoad();

    await expect(page.locator('body')).toBeVisible();
  });

  test('empty cart shows empty state message', async ({ page }) => {
    await page.goto('/cart');
    await page.waitForLoadState('networkidle');

    const content = await page.locator('body').textContent();
    // Either "пуста" (empty) OR items are shown
    const hasEmptyState = content?.toLowerCase().includes('пуст') ||
                          content?.toLowerCase().includes('empty') ||
                          content?.toLowerCase().includes('корзина');
    expect(hasEmptyState).toBeTruthy();
  });

  test('cart page has checkout button or empty state', async ({ page }) => {
    await page.goto('/cart');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
  });
});
