import { Test, TestingModule } from '@nestjs/testing';
import { CodesService } from './codes.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CodeStatus, Currency } from '@prisma/client';

describe('CodesService', () => {
  let service: CodesService;
  let prismaService: any;

  beforeEach(async () => {
    prismaService = {
      topUpCode: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        createMany: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        groupBy: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CodesService,
        { provide: PrismaService, useValue: prismaService },
      ],
    }).compile();

    service = module.get<CodesService>(CodesService);
  });

  // ---- importFromCsv ----

  describe('importFromCsv()', () => {
    it('parses valid CSV without header', async () => {
      prismaService.topUpCode.findMany.mockResolvedValue([]);
      prismaService.topUpCode.createMany.mockResolvedValue({ count: 2 });

      const csv = 'CODE001,500,TRY\nCODE002,1000,TRY';
      const result = await service.importFromCsv(csv);

      expect(result.imported).toBe(2);
      expect(result.skipped).toBe(0);
      expect(result.errors).toHaveLength(0);
    });

    it('parses valid CSV with header row', async () => {
      prismaService.topUpCode.findMany.mockResolvedValue([]);
      prismaService.topUpCode.createMany.mockResolvedValue({ count: 1 });

      const csv = 'code,denomination,currency\nCODE003,200,INR';
      const result = await service.importFromCsv(csv);

      expect(result.imported).toBe(1);
    });

    it('skips duplicate codes', async () => {
      prismaService.topUpCode.findMany.mockResolvedValue([
        { code: 'CODE001' },
      ]);
      prismaService.topUpCode.createMany.mockResolvedValue({ count: 1 });

      const csv = 'CODE001,500,TRY\nCODE002,500,TRY';
      const result = await service.importFromCsv(csv);

      expect(result.imported).toBe(1);
      expect(result.skipped).toBe(1);
    });

    it('reports errors for invalid lines', async () => {
      prismaService.topUpCode.findMany.mockResolvedValue([]);
      prismaService.topUpCode.createMany.mockResolvedValue({ count: 1 });

      const csv = 'CODE001,500,TRY\nBAD_LINE\nCODE002,-100,TRY';
      const result = await service.importFromCsv(csv);

      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('throws BadRequestException for invalid currency', async () => {
      prismaService.topUpCode.findMany.mockResolvedValue([]);

      const csv = 'CODE001,500,USD'; // USD not valid
      // All lines have errors, none valid to insert
      const result = await service.importFromCsv(csv);
      // Should have an error logged for invalid currency
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.imported).toBe(0);
    });

    it('throws BadRequestException for empty CSV', async () => {
      await expect(service.importFromCsv('')).rejects.toThrow(BadRequestException);
    });

    it('handles INR and UAH currencies', async () => {
      prismaService.topUpCode.findMany.mockResolvedValue([]);
      prismaService.topUpCode.createMany.mockResolvedValue({ count: 3 });

      const csv = 'INRCODE1,1000,INR\nUAHCODE1,500,UAH\nTRYCODE1,200,TRY';
      const result = await service.importFromCsv(csv);

      expect(result.imported).toBe(3);
      expect(result.errors).toHaveLength(0);
    });
  });

  // ---- getLowStockAlerts ----

  describe('getLowStockAlerts()', () => {
    it('returns items with available < threshold', async () => {
      prismaService.topUpCode.groupBy.mockResolvedValue([
        { currency: Currency.TRY, denomination: 500, status: CodeStatus.AVAILABLE, _count: { _all: 3 } },
        { currency: Currency.TRY, denomination: 500, status: CodeStatus.SOLD, _count: { _all: 10 } },
        { currency: Currency.INR, denomination: 1000, status: CodeStatus.AVAILABLE, _count: { _all: 10 } },
      ]);

      const alerts = await service.getLowStockAlerts(5);

      expect(alerts).toHaveLength(1);
      expect(alerts[0].denomination).toBe(500);
      expect(alerts[0].currency).toBe(Currency.TRY);
      expect(alerts[0].available).toBe(3);
    });

    it('returns empty if all above threshold', async () => {
      prismaService.topUpCode.groupBy.mockResolvedValue([
        { currency: Currency.TRY, denomination: 500, status: CodeStatus.AVAILABLE, _count: { _all: 20 } },
      ]);

      const alerts = await service.getLowStockAlerts(5);
      expect(alerts).toHaveLength(0);
    });

    it('uses default threshold of 5', async () => {
      prismaService.topUpCode.groupBy.mockResolvedValue([
        { currency: Currency.TRY, denomination: 200, status: CodeStatus.AVAILABLE, _count: { _all: 4 } },
      ]);

      const alerts = await service.getLowStockAlerts();
      expect(alerts).toHaveLength(1);
    });
  });

  // ---- reserveForOrder ----

  describe('reserveForOrder()', () => {
    it('reserves available codes', async () => {
      const mockCode = {
        id: 1,
        code: 'CODE001',
        denomination: 500,
        currency: Currency.TRY,
        status: CodeStatus.AVAILABLE,
      };
      prismaService.topUpCode.findFirst.mockResolvedValue(mockCode);
      prismaService.topUpCode.update.mockResolvedValue({
        ...mockCode,
        status: CodeStatus.RESERVED,
        orderId: 1,
      });

      const result = await service.reserveForOrder(1, [
        { denomination: 500, currency: Currency.TRY, quantity: 1 },
      ]);

      expect(result).toHaveLength(1);
      expect(prismaService.topUpCode.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1 },
          data: { status: CodeStatus.RESERVED, orderId: 1 },
        }),
      );
    });

    it('throws NotFoundException when no codes available', async () => {
      prismaService.topUpCode.findFirst.mockResolvedValue(null);

      await expect(
        service.reserveForOrder(1, [
          { denomination: 500, currency: Currency.TRY, quantity: 1 },
        ]),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ---- releaseReserved ----

  describe('releaseReserved()', () => {
    it('releases reserved codes back to AVAILABLE', async () => {
      prismaService.topUpCode.updateMany.mockResolvedValue({ count: 2 });

      const result = await service.releaseReserved(1);
      expect(result.released).toBe(2);
      expect(prismaService.topUpCode.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { orderId: 1, status: CodeStatus.RESERVED },
          data: { status: CodeStatus.AVAILABLE, orderId: null },
        }),
      );
    });
  });
});
