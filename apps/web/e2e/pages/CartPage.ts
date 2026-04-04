import { Page } from '@playwright/test';

export class CartPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/cart');
  }

  async waitForLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  async getItemCount() {
    const items = await this.page.locator('[class*="CartItem"]').all();
    return items.length;
  }

  async removeFirstItem() {
    await this.page.locator('button[aria-label*="удалить"], button[aria-label*="remove"], button:has-text("×")').first().click();
  }

  async proceedToCheckout() {
    await this.page.getByRole('button', { name: /оформить|checkout/i }).first().click();
  }

  async getSmartCartCards() {
    return this.page.locator('[class*="SmartCart"], [class*="smart-cart"]').textContent();
  }
}
