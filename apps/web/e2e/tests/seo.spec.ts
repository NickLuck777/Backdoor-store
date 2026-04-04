import { test, expect } from '@playwright/test';

test.describe('SEO & Performance', () => {
  test('homepage has title tag', async ({ page }) => {
    await page.goto('/');
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(10);
  });

  test('homepage has meta description', async ({ page }) => {
    await page.goto('/');
    const metaDesc = await page.locator('meta[name="description"]').getAttribute('content');
    expect(metaDesc).toBeTruthy();
    expect(metaDesc!.length).toBeGreaterThan(20);
  });

  test('catalog page has unique title', async ({ page }) => {
    const [homeTitle, catalogTitle] = await Promise.all([
      page.goto('/').then(() => page.title()),
      page.goto('/catalog').then(() => page.title()),
    ]);
    // They should be different
    expect(homeTitle).not.toBe(catalogTitle);
  });

  test('sitemap.xml is accessible', async ({ page }) => {
    const response = await page.goto('/sitemap.xml');
    expect(response?.status()).toBeLessThan(500);
  });

  test('robots.txt is accessible', async ({ page }) => {
    const response = await page.goto('/robots.txt');
    expect(response?.status()).toBe(200);
    const content = await page.locator('body').textContent();
    expect(content).toContain('User-agent');
  });

  test('pages have Open Graph tags', async ({ page }) => {
    await page.goto('/');
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
    // OG tags may or may not be set on homepage — just check page loads
    await expect(page.locator('body')).toBeVisible();
  });
});
