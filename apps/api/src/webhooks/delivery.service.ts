import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { CodesService } from '../codes/codes.service';
import { SmartCartService } from '../cart/smart-cart.service';
import { OrdersService } from '../orders/orders.service';
import { OrderStatus } from '@prisma/client';
import * as nodemailer from 'nodemailer';

@Injectable()
export class DeliveryService {
  private readonly logger = new Logger(DeliveryService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(
    private prisma: PrismaService,
    private codesService: CodesService,
    private smartCartService: SmartCartService,
    private ordersService: OrdersService,
    private configService: ConfigService,
  ) {
    const emailHost = this.configService.get<string>('EMAIL_HOST');
    if (emailHost) {
      this.transporter = nodemailer.createTransport({
        host: emailHost,
        port: this.configService.get<number>('EMAIL_PORT') ?? 587,
        secure: false,
        auth: {
          user: this.configService.get<string>('EMAIL_USER'),
          pass: this.configService.get<string>('EMAIL_PASS'),
        },
      });
    } else {
      this.logger.warn('EMAIL_HOST not set — email will be logged to console only');
    }
  }

  async autoDeliver(orderId: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: true } } },
    });

    if (!order || order.items.length === 0) {
      this.logger.error(`Cannot auto-deliver: order ${orderId} not found or empty`);
      return;
    }

    const region = order.items[0].product.region;

    try {
      // Calculate needed cards
      const smartResult = await this.smartCartService.calculateFromIds(
        order.items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        region,
      );

      // Reserve codes
      await this.codesService.reserveForOrder(
        orderId,
        smartResult.cards.map((c) => ({
          denomination: c.denomination,
          currency: c.currency,
          quantity: c.quantity,
        })),
      );

      // Mark as sold & update order status
      await this.codesService.markAsSold(orderId);
      await this.ordersService.updateStatus(orderId, OrderStatus.DELIVERED);

      // Get codes for email
      const codes = await this.codesService.getCodesForOrder(orderId);
      await this.sendDeliveryEmail(order, codes);

      this.logger.log(`Order ${order.orderNumber} auto-delivered successfully`);
    } catch (err: any) {
      this.logger.error(
        `Auto-delivery failed for order ${order.orderNumber}: ${err.message}`,
      );
      // Not enough codes — set to PROCESSING and alert operator
      await this.ordersService.updateStatus(orderId, OrderStatus.PROCESSING);
      await this.sendOperatorAlert(order, err.message);
    }
  }

  async sendDeliveryEmail(
    order: { orderNumber: string; customerEmail: string },
    codes: Array<{ code: string; denomination: unknown; currency: string }>,
  ) {
    const codesList = codes
      .map(
        (c) =>
          `  - ${c.code} (${c.denomination} ${c.currency})`,
      )
      .join('\n');

    const text = `
Hello!

Your order ${order.orderNumber} has been delivered.

Your top-up codes:
${codesList}

Activation instructions:
1. Go to PlayStation Store
2. Go to Redeem Codes section
3. Enter the code above
4. The balance will be credited to your account

Thank you for your purchase!
Backdoor Store Team
    `.trim();

    if (this.transporter) {
      await this.transporter.sendMail({
        from: this.configService.get<string>('EMAIL_FROM') ?? 'noreply@backdoor.store',
        to: order.customerEmail,
        subject: `Order ${order.orderNumber} — Your codes are ready!`,
        text,
      });
    } else {
      this.logger.log(`[MOCK EMAIL] To: ${order.customerEmail}\n${text}`);
    }
  }

  async sendOperatorAlert(
    order: { orderNumber: string; customerEmail: string; id: number },
    reason: string,
  ) {
    const operatorEmail = this.configService.get<string>('OPERATOR_EMAIL');

    const text = `
ALERT: Manual delivery required for order ${order.orderNumber}
Customer: ${order.customerEmail}
Reason: ${reason}
Order ID: ${order.id}

Please manually assign codes and mark the order as delivered.
    `.trim();

    if (this.transporter && operatorEmail) {
      await this.transporter.sendMail({
        from: this.configService.get<string>('EMAIL_FROM') ?? 'noreply@backdoor.store',
        to: operatorEmail,
        subject: `[ACTION REQUIRED] Manual delivery for ${order.orderNumber}`,
        text,
      });
    } else {
      this.logger.warn(`[MOCK ALERT EMAIL]\n${text}`);
    }
  }
}
