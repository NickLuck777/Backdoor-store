import { Page } from '@playwright/test';

export class CheckoutPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/checkout');
  }

  async fillContactInfo(data: { email: string; phone?: string; telegram?: string }) {
    await this.page.getByLabel(/email/i).fill(data.email);
    if (data.phone) {
      await this.page.getByLabel(/телефон|phone/i).fill(data.phone);
    }
    if (data.telegram) {
      await this.page.getByLabel(/telegram/i).fill(data.telegram);
    }
  }

  async proceedToNextStep() {
    await this.page.getByRole('button', { name: /далее|next|продолжить/i }).click();
  }

  async acceptTerms() {
    await this.page.getByRole('checkbox').last().check();
  }

  async submitPayment() {
    await this.page.getByRole('button', { name: /оплатить|pay/i }).click();
  }
}
