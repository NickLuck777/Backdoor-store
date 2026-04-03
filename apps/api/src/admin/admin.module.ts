import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { OrdersModule } from '../orders/orders.module';
import { CodesModule } from '../codes/codes.module';
import { UsersModule } from '../users/users.module';
import { ProductsModule } from '../products/products.module';
import { CategoriesModule } from '../categories/categories.module';
import { PagesModule } from '../pages/pages.module';
import { ExchangeRatesModule } from '../exchange-rates/exchange-rates.module';
import { FileUploadService } from '../common/services/file-upload.service';

@Module({
  imports: [
    PrismaModule,
    OrdersModule,
    CodesModule,
    UsersModule,
    ProductsModule,
    CategoriesModule,
    PagesModule,
    ExchangeRatesModule,
  ],
  providers: [AdminService, FileUploadService],
  controllers: [AdminController],
})
export class AdminModule {}
