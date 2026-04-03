import { Test, TestingModule } from '@nestjs/testing';
import { SmartCartService, DENOMINATIONS } from './smart-cart.service';
import { PrismaService } from '../prisma/prisma.service';
import { ExchangeRatesService } from '../exchange-rates/exchange-rates.service';
import { Currency, Region } from '@prisma/client';

// ---- helpers ----

function makeProduct(slug: string, price: number, region: Region = Region.TURKEY) {
  return {
    id: Math.floor(Math.random() * 1000),
    slug,
    title: slug,
    description: null,
    type: 'GAME' as const,
    platform: null,
    edition: null,
    region,
    regionProductId: null,
    price,
    originalPrice: null,
    discount: null,
    imageUrl: null,
    isPreorder: false,
    isAvailable: true,
    sortOrder: 0,
    searchVector: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

describe('SmartCartService', () => {
  let service: SmartCartService;
  let prismaService: { product: { findMany: jest.Mock } };
  let exchangeRatesService: { getRateWithMargin: jest.Mock };

  beforeEach(async () => {
    prismaService = {
      product: { findMany: jest.fn() },
    };

    exchangeRatesService = {
      getRateWithMargin: jest.fn().mockResolvedValue(3.5), // mock rate: 1 TRY = 3.5 RUB
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SmartCartService,
        { provide: PrismaService, useValue: prismaService },
        { provide: ExchangeRatesService, useValue: exchangeRatesService },
      ],
    }).compile();

    service = module.get<SmartCartService>(SmartCartService);
  });

  // ---- greedyDenominations unit tests ----

  describe('greedyDenominations', () => {
    const TRY_DESC = [...DENOMINATIONS.TRY].sort((a, b) => b - a);

    it('700 TRY → [500 + 200]', () => {
      const result = service.greedyDenominations(700, TRY_DESC);
      expect(result).toEqual(
        expect.arrayContaining([
          { denomination: 200, quantity: 1 },
          { denomination: 500, quantity: 1 },
        ]),
      );
      expect(result.reduce((s, c) => s + c.denomination * c.quantity, 0)).toBe(700);
    });

    it('1350 TRY → [1000 + 200 + 100 + 50]', () => {
      const result = service.greedyDenominations(1350, TRY_DESC);
      const total = result.reduce((s, c) => s + c.denomination * c.quantity, 0);
      expect(total).toBe(1350);
      expect(result.find((r) => r.denomination === 1000)?.quantity).toBe(1);
      expect(result.find((r) => r.denomination === 200)?.quantity).toBe(1);
      expect(result.find((r) => r.denomination === 100)?.quantity).toBe(1);
      expect(result.find((r) => r.denomination === 50)?.quantity).toBe(1);
    });

    it('500 TRY exact → [500]', () => {
      const result = service.greedyDenominations(500, TRY_DESC);
      expect(result).toEqual([{ denomination: 500, quantity: 1 }]);
    });

    it('150 TRY → [100 + 50] exact, overshoot = 0', () => {
      // 150 = 100 + 50, exact change is possible
      const result = service.greedyDenominations(150, TRY_DESC);
      const total = result.reduce((s, c) => s + c.denomination * c.quantity, 0);
      expect(total).toBe(150);
      const overshoot = total - 150;
      expect(overshoot).toBe(0);
    });

    it('160 TRY → [50×2 + 100] = 200, overshoot = 40', () => {
      // 160 cannot be made exactly, needs rounding up
      const result = service.greedyDenominations(160, TRY_DESC);
      const total = result.reduce((s, c) => s + c.denomination * c.quantity, 0);
      // 100 + 2×50 = 200 (the 10 TRY remaining after 100+50 gets covered by +50)
      expect(total).toBe(200);
      const overshoot = total - 160;
      expect(overshoot).toBe(40);
    });

    it('900 TRY (3×300) → [500 + 200 + 200]', () => {
      const result = service.greedyDenominations(900, TRY_DESC);
      const total = result.reduce((s, c) => s + c.denomination * c.quantity, 0);
      expect(total).toBe(900);
      expect(result.find((r) => r.denomination === 500)?.quantity).toBe(1);
      expect(result.find((r) => r.denomination === 200)?.quantity).toBe(2);
    });

    it('0 TRY → empty result', () => {
      // Zero is handled before calling greedy, but test the edge
      const result = service.greedyDenominations(0, TRY_DESC);
      expect(result).toEqual([]);
    });
  });

  describe('greedyDenominations - India INR', () => {
    const INR_DESC = [...DENOMINATIONS.INR].sort((a, b) => b - a);

    it('1500 INR → [1000 + 500]', () => {
      const result = service.greedyDenominations(1500, INR_DESC);
      const total = result.reduce((s, c) => s + c.denomination * c.quantity, 0);
      expect(total).toBe(1500);
      expect(result.find((r) => r.denomination === 1000)?.quantity).toBe(1);
      expect(result.find((r) => r.denomination === 500)?.quantity).toBe(1);
    });
  });

  // ---- Full calculate() integration-style tests with mocks ----

  describe('calculate()', () => {
    it('Turkey 700 TRY single game → [200 + 500]', async () => {
      const product = makeProduct('game-1', 700, Region.TURKEY);
      prismaService.product.findMany.mockResolvedValue([product]);

      const result = await service.calculate({
        items: [{ productSlug: 'game-1', quantity: 1 }],
        region: Region.TURKEY,
      });

      expect(result.totalInRegionalCurrency).toBe(700);
      const cardTotal = result.cards.reduce(
        (s, c) => s + c.denomination * c.quantity,
        0,
      );
      expect(cardTotal).toBe(700);
      expect(result.overshootInRegionalCurrency).toBe(0);
    });

    it('Turkey 500 TRY exact → [500]', async () => {
      const product = makeProduct('game-2', 500, Region.TURKEY);
      prismaService.product.findMany.mockResolvedValue([product]);

      const result = await service.calculate({
        items: [{ productSlug: 'game-2', quantity: 1 }],
        region: Region.TURKEY,
      });

      expect(result.cards.length).toBe(1);
      expect(result.cards[0].denomination).toBe(500);
      expect(result.cards[0].quantity).toBe(1);
      expect(result.overshootInRegionalCurrency).toBe(0);
    });

    it('Turkey 150 TRY → [100 + 50] = 150 exact, no overshoot', async () => {
      const product = makeProduct('game-3', 150, Region.TURKEY);
      prismaService.product.findMany.mockResolvedValue([product]);

      const result = await service.calculate({
        items: [{ productSlug: 'game-3', quantity: 1 }],
        region: Region.TURKEY,
      });

      const cardTotal = result.cards.reduce(
        (s, c) => s + c.denomination * c.quantity,
        0,
      );
      expect(cardTotal).toBe(150);
      expect(result.overshootInRegionalCurrency).toBe(0);
    });

    it('Turkey 160 TRY → overshoot of 40', async () => {
      const product = makeProduct('game-3b', 160, Region.TURKEY);
      prismaService.product.findMany.mockResolvedValue([product]);

      const result = await service.calculate({
        items: [{ productSlug: 'game-3b', quantity: 1 }],
        region: Region.TURKEY,
      });

      const cardTotal = result.cards.reduce(
        (s, c) => s + c.denomination * c.quantity,
        0,
      );
      expect(cardTotal).toBe(200);
      expect(result.overshootInRegionalCurrency).toBe(40);
    });

    it('Turkey 3 games at 300 TRY each = 900 TRY → [500 + 200×2]', async () => {
      const product = makeProduct('game-4', 300, Region.TURKEY);
      prismaService.product.findMany.mockResolvedValue([product]);

      const result = await service.calculate({
        items: [{ productSlug: 'game-4', quantity: 3 }],
        region: Region.TURKEY,
      });

      expect(result.totalInRegionalCurrency).toBe(900);
      const cardTotal = result.cards.reduce(
        (s, c) => s + c.denomination * c.quantity,
        0,
      );
      expect(cardTotal).toBe(900);
      expect(result.overshootInRegionalCurrency).toBe(0);
    });

    it('India 1500 INR → [1000 + 500]', async () => {
      exchangeRatesService.getRateWithMargin.mockResolvedValue(1.1); // INR mock rate
      const product = makeProduct('india-game-1', 1500, Region.INDIA);
      prismaService.product.findMany.mockResolvedValue([product]);

      const result = await service.calculate({
        items: [{ productSlug: 'india-game-1', quantity: 1 }],
        region: Region.INDIA,
      });

      expect(result.totalInRegionalCurrency).toBe(1500);
      const cardTotal = result.cards.reduce(
        (s, c) => s + c.denomination * c.quantity,
        0,
      );
      expect(cardTotal).toBe(1500);
      expect(result.overshootInRegionalCurrency).toBe(0);
    });

    it('returns empty cards array for zero total', async () => {
      prismaService.product.findMany.mockResolvedValue([]);

      const result = await service.calculate({
        items: [],
        region: Region.TURKEY,
      });

      expect(result.cards).toEqual([]);
      expect(result.totalInRegionalCurrency).toBe(0);
      expect(result.totalInRub).toBe(0);
    });

    it('throws 400 on mixed regions', async () => {
      const products = [
        makeProduct('game-tr', 500, Region.TURKEY),
        makeProduct('game-in', 1000, Region.INDIA),
      ];
      prismaService.product.findMany.mockResolvedValue(products);

      await expect(
        service.calculate({
          items: [
            { productSlug: 'game-tr', quantity: 1 },
            { productSlug: 'game-in', quantity: 1 },
          ],
          region: Region.TURKEY,
        }),
      ).rejects.toThrow('Mixed regions not allowed');
    });
  });
});
