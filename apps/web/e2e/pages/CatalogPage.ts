import { Page } from '@playwright/test';

export class CatalogPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/catalog');
  }

  async waitForProducts() {
    await this.page.waitForSelector('[data-testid="product-card"], .product-card, article', { timeout: 10000 });
  }

  async filterByRegion(region: 'turkey' | 'india' | 'ukraine') {
    const labels = { turkey: 'Турция', india: 'Индия', ukraine: 'Украина' };
    await this.page.getByText(labels[region]).first().click();
  }

  async getProductCount() {
    const cards = await this.page.locator('article, [class*="ProductCard"]').all();
    return cards.length;
  }

  async clickFirstProduct() {
    await this.page.locator('article, [class*="ProductCard"]').first().click();
  }
}
