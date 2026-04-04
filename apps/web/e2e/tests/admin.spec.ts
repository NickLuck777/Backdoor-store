import { test, expect } from '@playwright/test';

test.describe('Admin Panel', () => {
  test('admin login page loads', async ({ page }) => {
    await page.goto('/admin/login');
    await page.waitForLoadState('networkidle');

    // Should have login form
    await expect(page.locator('form, [class*="login"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('unauthenticated access to /admin redirects to login', async ({ page }) => {
    // Clear any existing tokens
    await page.context().clearCookies();

    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    // Should be redirected to login OR show login page
    const url = page.url();
    const isRedirected = url.includes('/admin/login') || url.includes('/login');
    const content = await page.locator('body').textContent();
    const hasLoginForm = content?.toLowerCase().includes('войти') ||
                          content?.toLowerCase().includes('email') ||
                          isRedirected;
    expect(hasLoginForm).toBeTruthy();
  });

  test('admin login page has email and password fields', async ({ page }) => {
    await page.goto('/admin/login');
    await page.waitForLoadState('networkidle');

    const emailField = page.locator('input[type="email"], input[name="email"]').first();
    const passwordField = page.locator('input[type="password"]').first();

    await expect(emailField).toBeVisible({ timeout: 5000 });
    await expect(passwordField).toBeVisible({ timeout: 5000 });
  });

  test('admin dashboard page exists', async ({ page }) => {
    // Navigate directly (middleware will redirect to login if not authenticated)
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    // Page loads without crash
    await expect(page.locator('body')).toBeVisible();
  });

  test('admin orders page accessible after navigating', async ({ page }) => {
    await page.goto('/admin/orders');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
  });

  test('admin codes page accessible', async ({ page }) => {
    await page.goto('/admin/codes');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
  });
});
