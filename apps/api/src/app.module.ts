import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
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
import { ContactModule } from './contact/contact.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { ThrottlerGuard } from '@nestjs/throttler';
import { PromoController } from './pages/promo.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const redisUrl = configService.get<string>('REDIS_URL');
        if (redisUrl) {
          const { redisStore } = await import('cache-manager-ioredis-yet');
          return {
            store: await redisStore({
              url: redisUrl,
            }),
            ttl: configService.get<number>('CACHE_TTL') ?? 300,
          };
        }
        // Fallback to in-memory cache
        return {
          ttl: configService.get<number>('CACHE_TTL') ?? 300,
        };
      },
    }),
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
    ContactModule,
  ],
  controllers: [PromoController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
