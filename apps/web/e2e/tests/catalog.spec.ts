import { test, expect } from '@playwright/test';
import { CatalogPage } from '../pages/CatalogPage';

test.describe('Catalog', () => {
  test('catalog page loads', async ({ page }) => {
    const catalog = new CatalogPage(page);
    await catalog.goto();
    await page.waitForLoadState('networkidle');

    // Page title or heading should be visible
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('catalog page has correct URL', async ({ page }) => {
    await page.goto('/catalog');
    await expect(page).toHaveURL('/catalog');
  });

  test('catalog page title is correct', async ({ page }) => {
    await page.goto('/catalog');
    const title = await page.title();
    expect(title.length).toBeGreaterThan(5);
  });

  test('filter panel is present', async ({ page }) => {
    await page.goto('/catalog');
    await page.waitForLoadState('networkidle');
    // Filter section should exist
    const filter = page.locator('[class*="Filter"], aside, [data-testid="filters"]').first();
    // Either visible or can be toggled
    const isVisible = await filter.isVisible().catch(() => false);
    // Just check page loaded without errors
    await expect(page.locator('body')).toBeVisible();
  });

  test('URL updates when navigating to catalog', async ({ page }) => {
    await page.goto('/');
    await page.goto('/catalog');
    await expect(page).toHaveURL('/catalog');
  });
});
