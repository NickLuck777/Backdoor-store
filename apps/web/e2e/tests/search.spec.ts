import { test, expect } from '@playwright/test';

test.describe('Search', () => {
  test('search page loads with query', async ({ page }) => {
    await page.goto('/search?q=God+of+War');
    await page.waitForLoadState('networkidle');

    // Page should show the search query
    const content = await page.locator('body').textContent();
    expect(content).toContain('God of War');
  });

  test('search page has correct title', async ({ page }) => {
    await page.goto('/search?q=Spider-Man');
    const title = await page.title();
    expect(title.length).toBeGreaterThan(3);
  });

  test('empty search query shows search page', async ({ page }) => {
    await page.goto('/search');
    await expect(page.locator('body')).toBeVisible();
  });
});
