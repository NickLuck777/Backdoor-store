import { Page } from '@playwright/test';

export class HomePage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/');
  }

  async waitForLoad() {
    await this.page.waitForSelector('h1, [data-testid="hero"]', { timeout: 10000 });
  }

  async getCarouselSections() {
    return this.page.locator('[data-testid="carousel-section"]').all();
  }

  async clickProduct(title: string) {
    await this.page.getByText(title).first().click();
  }

  async searchFor(query: string) {
    await this.page.getByPlaceholder(/поиск|search/i).fill(query);
  }
}
