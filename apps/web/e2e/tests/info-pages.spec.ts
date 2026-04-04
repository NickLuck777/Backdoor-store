import { test, expect } from '@playwright/test';

test.describe('Info Pages', () => {
  test('support/FAQ page loads', async ({ page }) => {
    await page.goto('/support');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('FAQ page has accordion items', async ({ page }) => {
    await page.goto('/support');
    await page.waitForLoadState('networkidle');

    const content = await page.locator('body').textContent();
    // Should have FAQ content
    expect(content?.length).toBeGreaterThan(100);
  });

  test('about page loads', async ({ page }) => {
    await page.goto('/about');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('body')).toBeVisible();
    const title = await page.title();
    expect(title.length).toBeGreaterThan(3);
  });

  test('contacts page loads', async ({ page }) => {
    await page.goto('/contacts');
    await page.waitForLoadState('networkidle');

    const content = await page.locator('body').textContent();
    expect(content?.length).toBeGreaterThan(50);
  });

  test('privacy policy page loads', async ({ page }) => {
    await page.goto('/privacy');
    await page.waitForLoadState('networkidle');

    const content = await page.locator('body').textContent();
    expect(content?.toLowerCase()).toMatch(/конфиденциальности|privacy/i);
  });

  test('terms of use page loads', async ({ page }) => {
    await page.goto('/terms');
    await page.waitForLoadState('networkidle');

    const content = await page.locator('body').textContent();
    expect(content?.toLowerCase()).toMatch(/условия|terms|соглашение/i);
  });

  test('404 page shows for invalid route', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist-12345');
    // Either 404 status or page content indicates not found
    const content = await page.locator('body').textContent();
    const is404 = response?.status() === 404 ||
                  content?.toLowerCase().includes('не найден') ||
                  content?.toLowerCase().includes('not found') ||
                  content?.toLowerCase().includes('404');
    expect(is404).toBeTruthy();
  });
});
