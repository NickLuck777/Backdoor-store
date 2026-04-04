import { test, expect, devices } from '@playwright/test';

// Mobile-specific tests
test.use({ ...devices['iPhone SE'] });

test.describe('Mobile Experience', () => {
  test('homepage loads on mobile', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
  });

  test('mobile has correct viewport', async ({ page }) => {
    await page.goto('/');
    const viewportSize = page.viewportSize();
    expect(viewportSize?.width).toBeLessThanOrEqual(375);
  });

  test('catalog loads on mobile', async ({ page }) => {
    await page.goto('/catalog');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
  });

  test('cart loads on mobile', async ({ page }) => {
    await page.goto('/cart');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
  });

  test('FAQ page loads on mobile', async ({ page }) => {
    await page.goto('/support');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
  });
});
