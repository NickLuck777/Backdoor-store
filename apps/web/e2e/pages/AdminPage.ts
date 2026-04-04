import { Page } from '@playwright/test';

export class AdminPage {
  constructor(private page: Page) {}

  async login(email = 'admin@backdoor.store', password = 'Admin123!') {
    await this.page.goto('/admin/login');
    await this.page.getByLabel(/email/i).fill(email);
    await this.page.getByLabel(/пароль|password/i).fill(password);
    await this.page.getByRole('button', { name: /войти|login/i }).click();
    await this.page.waitForURL('/admin', { timeout: 10000 });
  }

  async gotoOrders() {
    await this.page.goto('/admin/orders');
  }

  async gotoProducts() {
    await this.page.goto('/admin/products');
  }

  async gotoCodes() {
    await this.page.goto('/admin/codes');
  }

  async gotoRates() {
    await this.page.goto('/admin/rates');
  }
}
