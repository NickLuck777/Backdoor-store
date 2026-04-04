import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';

test.describe('Homepage', () => {
  test('loads homepage with title', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await home.waitForLoad();

    const title = await page.title();
    expect(title).toContain('Reloc');
  });

  test('homepage has navigation header', async ({ page }) => {
    await page.goto('/');
    // Header should be present
    await expect(page.locator('header')).toBeVisible();
  });

  test('homepage has footer', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('footer')).toBeVisible();
  });

  test('search bar is present in header', async ({ page }) => {
    await page.goto('/');
    // Search input or search button should be visible
    const searchEl = page.locator('input[type="search"], input[placeholder*="поиск" i], button[aria-label*="поиск" i]').first();
    await expect(searchEl).toBeVisible({ timeout: 5000 });
  });

  test('catalog link navigates correctly', async ({ page }) => {
    await page.goto('/');
    // Click any catalog/каталог link
    const catalogLink = page.getByRole('link', { name: /каталог|catalog/i }).first();
    if (await catalogLink.isVisible()) {
      await catalogLink.click();
      await expect(page).toHaveURL(/\/catalog/);
    }
  });
});
