import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Currency } from '@prisma/client';
import { UpdateExchangeRateDto } from './exchange-rates.dto';

@Injectable()
export class ExchangeRatesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.exchangeRate.findMany({
      orderBy: { currency: 'asc' },
    });
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
    return this.prisma.exchangeRate.update({
      where: { id },
      data: dto,
    });
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
