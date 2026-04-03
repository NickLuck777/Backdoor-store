import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { OrdersModule } from '../orders/orders.module';
import { CodesModule } from '../codes/codes.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [PrismaModule, OrdersModule, CodesModule, UsersModule],
  providers: [AdminService],
  controllers: [AdminController],
})
export class AdminModule {}
