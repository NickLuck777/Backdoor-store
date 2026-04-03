import { Module } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller';
import { DeliveryService } from './delivery.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PaymentsModule } from '../payments/payments.module';
import { CodesModule } from '../codes/codes.module';
import { CartModule } from '../cart/cart.module';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [PrismaModule, PaymentsModule, CodesModule, CartModule, OrdersModule],
  providers: [DeliveryService],
  controllers: [WebhooksController],
})
export class WebhooksModule {}
