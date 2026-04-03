import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as crypto from 'crypto';

const YOOKASSA_API_URL = 'https://api.yookassa.ru/v3/payments';

export interface YookassaPaymentResult {
  paymentId: string;
  confirmationUrl: string;
  status: string;
}

@Injectable()
export class YookassaService {
  private readonly logger = new Logger(YookassaService.name);
  private readonly shopId: string | undefined;
  private readonly secretKey: string | undefined;

  constructor(private configService: ConfigService) {
    this.shopId = configService.get<string>('YOOKASSA_SHOP_ID');
    this.secretKey = configService.get<string>('YOOKASSA_SECRET_KEY');
  }

  private get isConfigured(): boolean {
    return !!(this.shopId && this.secretKey);
  }

  async createPayment(
    order: { id: number; orderNumber: string; totalAmount: unknown; customerEmail: string },
    idempotencyKey: string,
  ): Promise<YookassaPaymentResult> {
    if (!this.isConfigured) {
      this.logger.warn('YooKassa not configured — using mock');
      return {
        paymentId: `mock-payment-${order.id}-${Date.now()}`,
        confirmationUrl: `http://localhost:3000/mock-payment/${order.id}`,
        status: 'pending',
      };
    }

    const payload = {
      amount: {
        value: Number(order.totalAmount).toFixed(2),
        currency: 'RUB',
      },
      confirmation: {
        type: 'redirect',
        return_url: `${this.configService.get('FRONTEND_URL')}/orders/${order.orderNumber}`,
      },
      description: `Order ${order.orderNumber}`,
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
      },
      receipt: {
        customer: { email: order.customerEmail },
        items: [
          {
            description: `Order ${order.orderNumber}`,
            quantity: '1.00',
            amount: {
              value: Number(order.totalAmount).toFixed(2),
              currency: 'RUB',
            },
            vat_code: 1,
          },
        ],
      },
    };

    const response = await axios.post(YOOKASSA_API_URL, payload, {
      headers: {
        'Idempotence-Key': idempotencyKey,
        'Content-Type': 'application/json',
      },
      auth: {
        username: this.shopId!,
        password: this.secretKey!,
      },
    });

    return {
      paymentId: response.data.id,
      confirmationUrl: response.data.confirmation?.confirmation_url ?? '',
      status: response.data.status,
    };
  }

  async getPayment(paymentId: string) {
    if (!this.isConfigured) {
      this.logger.warn('YooKassa not configured — using mock');
      return { id: paymentId, status: 'succeeded' };
    }

    const response = await axios.get(`${YOOKASSA_API_URL}/${paymentId}`, {
      auth: { username: this.shopId!, password: this.secretKey! },
    });
    return response.data;
  }

  async cancelPayment(paymentId: string) {
    if (!this.isConfigured) {
      this.logger.warn('YooKassa not configured — using mock');
      return { id: paymentId, status: 'canceled' };
    }

    const response = await axios.post(
      `${YOOKASSA_API_URL}/${paymentId}/cancel`,
      {},
      {
        headers: { 'Idempotence-Key': `cancel-${paymentId}` },
        auth: { username: this.shopId!, password: this.secretKey! },
      },
    );
    return response.data;
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    if (!this.secretKey) {
      this.logger.warn('YooKassa not configured — skipping webhook signature verification');
      return true;
    }
    const expectedSignature = crypto
      .createHmac('sha256', this.secretKey)
      .update(payload)
      .digest('hex');
    return signature === expectedSignature;
  }
}
