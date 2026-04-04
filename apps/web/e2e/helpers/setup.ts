import { Page } from '@playwright/test';

// Helper to wait for hydration
export async function waitForHydration(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500); // Additional time for React hydration
}

// Helper to dismiss any toast notifications
export async function dismissToasts(page: Page) {
  const toasts = page.locator('[class*="toast"], [role="alert"]');
  const count = await toasts.count();
  for (let i = 0; i < count; i++) {
    const toast = toasts.nth(i);
    const closeBtn = toast.locator('button');
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
    }
  }
}

// Helper to get cart count from badge
export async function getCartCount(page: Page): Promise<number> {
  const badge = page.locator('[class*="CartBadge"] [class*="badge"], [aria-label*="корзина"] span').first();
  if (!await badge.isVisible().catch(() => false)) return 0;
  const text = await badge.textContent();
  return parseInt(text || '0', 10);
}
