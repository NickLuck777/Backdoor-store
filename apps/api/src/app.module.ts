import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { CartModule } from './cart/cart.module';
import { OrdersModule } from './orders/orders.module';
import { CodesModule } from './codes/codes.module';
import { PagesModule } from './pages/pages.module';
import { BannersModule } from './banners/banners.module';
import { ExchangeRatesModule } from './exchange-rates/exchange-rates.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AdminModule } from './admin/admin.module';
import { PaymentsModule } from './payments/payments.module';
import { WebhooksModule } from './webhooks/webhooks.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    PrismaModule,
    ProductsModule,
    CategoriesModule,
    CartModule,
    OrdersModule,
    CodesModule,
    PagesModule,
    BannersModule,
    ExchangeRatesModule,
    AuthModule,
    UsersModule,
    AdminModule,
    PaymentsModule,
    WebhooksModule,
  ],
})
export class AppModule {}
