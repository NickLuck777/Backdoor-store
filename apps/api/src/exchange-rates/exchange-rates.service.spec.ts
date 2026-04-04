import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ExchangeRatesService } from './exchange-rates.service';
import { PrismaService } from '../prisma/prisma.service';
import { Currency } from '@prisma/client';

describe('ExchangeRatesService', () => {
  let service: ExchangeRatesService;
  let prisma: {
    exchangeRate: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
    };
  };

  const mockTryRate = {
    id: 1,
    currency: Currency.TRY,
    rateToRub: 2.8,
    margin: 15,
    updatedAt: new Date(),
  };

  const mockInrRate = {
    id: 2,
    currency: Currency.INR,
    rateToRub: 1.1,
    margin: 18,
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      exchangeRate: {
        findMany: jest.fn().mockResolvedValue([mockTryRate, mockInrRate]),
        findUnique: jest.fn().mockResolvedValue(null),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExchangeRatesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ExchangeRatesService>(ExchangeRatesService);
  });

  // ---- findAll ----

  describe('findAll()', () => {
    it('returns all exchange rates', async () => {
      const result = await service.findAll();

      expect(result).toHaveLength(2);
      expect(prisma.exchangeRate.findMany).toHaveBeenCalledWith({
        orderBy: { currency: 'asc' },
      });
    });
  });

  // ---- findByCurrency ----

  describe('findByCurrency()', () => {
    it('returns rate for specific currency', async () => {
      prisma.exchangeRate.findUnique.mockResolvedValue(mockTryRate);

      const result = await service.findByCurrency(Currency.TRY);

      expect(result.currency).toBe(Currency.TRY);
      expect(prisma.exchangeRate.findUnique).toHaveBeenCalledWith({
        where: { currency: Currency.TRY },
      });
    });

    it('throws NotFoundException when currency rate not found', async () => {
      prisma.exchangeRate.findUnique.mockResolvedValue(null);

      await expect(service.findByCurrency(Currency.TRY)).rejects.toThrow(NotFoundException);
    });
  });

  // ---- getRateWithMargin ----

  describe('getRateWithMargin()', () => {
    it('returns effective rate including margin for TRY (rate=2.8, margin=15)', async () => {
      prisma.exchangeRate.findUnique.mockResolvedValue(mockTryRate);

      const result = await service.getRateWithMargin(Currency.TRY);

      // 2.8 * (1 + 15/100) = 2.8 * 1.15 = 3.22
      expect(result).toBeCloseTo(3.22, 5);
    });

    it('returns effective rate including margin for INR (rate=1.1, margin=18)', async () => {
      prisma.exchangeRate.findUnique.mockResolvedValue(mockInrRate);

      const result = await service.getRateWithMargin(Currency.INR);

      // 1.1 * (1 + 18/100) = 1.1 * 1.18 = 1.298
      expect(result).toBeCloseTo(1.298, 5);
    });
  });

  // ---- convertToRub ----

  describe('convertToRub()', () => {
    it('converts 700 TRY to RUB with rate=2.8 and margin=15%', async () => {
      prisma.exchangeRate.findUnique.mockResolvedValue(mockTryRate);

      const result = await service.convertToRub(700, Currency.TRY);

      // 700 * 2.8 * 1.15 = 2254
      expect(result).toBeCloseTo(2254, 1);
    });

    it('converts 1000 INR to RUB with rate=1.1 and margin=18%', async () => {
      prisma.exchangeRate.findUnique.mockResolvedValue(mockInrRate);

      const result = await service.convertToRub(1000, Currency.INR);

      // 1000 * 1.1 * 1.18 = 1298
      expect(result).toBeCloseTo(1298, 1);
    });

    it('converts 0 amount to 0 RUB', async () => {
      prisma.exchangeRate.findUnique.mockResolvedValue(mockTryRate);

      const result = await service.convertToRub(0, Currency.TRY);

      expect(result).toBe(0);
    });

    it('converts 500 TRY to RUB with rate=2.8 and margin=15%', async () => {
      prisma.exchangeRate.findUnique.mockResolvedValue(mockTryRate);

      const result = await service.convertToRub(500, Currency.TRY);

      // 500 * 2.8 * 1.15 = 1610
      expect(result).toBeCloseTo(1610, 1);
    });
  });
});
