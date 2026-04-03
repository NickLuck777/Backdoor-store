import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController, UserOrdersController } from './orders.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CodesModule } from '../codes/codes.module';
import { CartModule } from '../cart/cart.module';

@Module({
  imports: [PrismaModule, CodesModule, CartModule],
  providers: [OrdersService],
  controllers: [OrdersController, UserOrdersController],
  exports: [OrdersService],
})
export class OrdersModule {}
