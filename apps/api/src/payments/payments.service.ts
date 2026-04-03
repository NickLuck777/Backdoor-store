import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { YookassaService } from './yookassa.service';
import { OrderStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private yookassa: YookassaService,
  ) {}

  async initiatePayment(orderId: number) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');

    const idempotencyKey = uuidv4();
    const result = await this.yookassa.createPayment(order, idempotencyKey);

    await this.prisma.order.update({
      where: { id: orderId },
      data: {
        paymentId: result.paymentId,
        paymentUrl: result.confirmationUrl,
      },
    });

    return {
      paymentUrl: result.confirmationUrl,
      paymentId: result.paymentId,
    };
  }

  async handleSuccessfulPayment(paymentId: string) {
    const order = await this.prisma.order.findFirst({
      where: { paymentId },
    });
    if (!order) {
      throw new NotFoundException(`Order with paymentId ${paymentId} not found`);
    }

    await this.prisma.order.update({
      where: { id: order.id },
      data: {
        status: OrderStatus.PAID,
        paidAt: new Date(),
      },
    });

    return order;
  }

  async handleCanceledPayment(paymentId: string) {
    const order = await this.prisma.order.findFirst({ where: { paymentId } });
    if (!order) return;

    await this.prisma.order.update({
      where: { id: order.id },
      data: { status: OrderStatus.CANCELLED },
    });

    return order;
  }
}
