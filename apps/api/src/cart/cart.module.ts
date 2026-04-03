import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { SmartCartService } from './smart-cart.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ExchangeRatesModule } from '../exchange-rates/exchange-rates.module';

@Module({
  imports: [PrismaModule, ExchangeRatesModule],
  providers: [CartService, SmartCartService],
  controllers: [CartController],
  exports: [CartService, SmartCartService],
})
export class CartModule {}
