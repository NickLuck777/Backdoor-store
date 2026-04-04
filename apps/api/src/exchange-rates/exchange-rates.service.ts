import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import { Currency } from '@prisma/client';
import { UpdateExchangeRateDto } from './exchange-rates.dto';

const EXCHANGE_RATES_CACHE_KEY = 'exchange_rates';
const EXCHANGE_RATES_CACHE_TTL = 60; // 60 seconds

@Injectable()
export class ExchangeRatesService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cache: Cache,
  ) {}

  async findAll() {
    const cached = await this.cache.get(EXCHANGE_RATES_CACHE_KEY);
    if (cached) return cached;

    const rates = await this.prisma.exchangeRate.findMany({
      orderBy: { currency: 'asc' },
    });

    await this.cache.set(EXCHANGE_RATES_CACHE_KEY, rates, EXCHANGE_RATES_CACHE_TTL);
    return rates;
  }

  async findByCurrency(currency: Currency) {
    const rate = await this.prisma.exchangeRate.findUnique({
      where: { currency },
    });
    if (!rate) throw new NotFoundException(`Exchange rate for ${currency} not found`);
    return rate;
  }

  async update(id: number, dto: UpdateExchangeRateDto) {
    const existing = await this.prisma.exchangeRate.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Exchange rate not found');
    const updated = await this.prisma.exchangeRate.update({
      where: { id },
      data: dto,
    });
    await this.cache.del(EXCHANGE_RATES_CACHE_KEY);
    return updated;
  }

  async getRateWithMargin(currency: Currency): Promise<number> {
    const rate = await this.findByCurrency(currency);
    const rateToRub = Number(rate.rateToRub);
    const margin = Number(rate.margin);
    return rateToRub * (1 + margin / 100);
  }

  async convertToRub(amount: number, currency: Currency): Promise<number> {
    const effectiveRate = await this.getRateWithMargin(currency);
    return amount * effectiveRate;
  }
}
