import { Page } from '@playwright/test';

export class ProductPage {
  constructor(private page: Page) {}

  async waitForLoad() {
    await this.page.waitForSelector('button:has-text("Купить"), button:has-text("В корзину"), button:has-text("Добавить")', { timeout: 10000 });
  }

  async addToCart() {
    await this.page.getByRole('button', { name: /купить|в корзину|добавить/i }).first().click();
  }

  async getTitle() {
    return this.page.locator('h1').first().textContent();
  }

  async getPrice() {
    return this.page.locator('[class*="PriceTag"], [class*="price"]').first().textContent();
  }
}
