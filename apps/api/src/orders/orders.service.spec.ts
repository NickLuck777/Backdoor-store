import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { PrismaService } from '../prisma/prisma.service';
import { CodesService } from '../codes/codes.service';
import { SmartCartService } from '../cart/smart-cart.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { OrderStatus, Region } from '@prisma/client';

describe('OrdersService', () => {
  let service: OrdersService;
  let prismaService: any;
  let codesService: any;
  let smartCartService: any;

  const mockProduct = {
    id: 1,
    slug: 'test-game',
    title: 'Test Game',
    price: 500,
    region: Region.TURKEY,
  };

  beforeEach(async () => {
    prismaService = {
      order: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
      product: {
        findMany: jest.fn(),
      },
    };

    codesService = {
      reserveForOrder: jest.fn().mockResolvedValue([]),
      markAsSold: jest.fn().mockResolvedValue({ sold: 1 }),
    };

    smartCartService = {
      calculateFromIds: jest.fn().mockResolvedValue({
        cards: [{ denomination: 500, currency: 'TRY', quantity: 1 }],
        totalInRegionalCurrency: 500,
        totalInRub: 1750,
        overshootInRegionalCurrency: 0,
        overshootInRub: 0,
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: PrismaService, useValue: prismaService },
        { provide: CodesService, useValue: codesService },
        { provide: SmartCartService, useValue: smartCartService },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  // ---- generateOrderNumber ----

  describe('generateOrderNumber (via create)', () => {
    it('generates BDR-YYYYMMDD-NNN format', async () => {
      prismaService.product.findMany.mockResolvedValue([mockProduct]);
      prismaService.order.count.mockResolvedValue(0); // first order today
      prismaService.order.create.mockImplementation(({ data }) => ({
        id: 1,
        ...data,
        createdAt: new Date(),
        items: [],
      }));

      await service.create(
        {
          customerEmail: 'test@example.com',
          needsAccount: false,
          cartItems: [{ productId: 1, quantity: 1 }],
        },
        undefined,
      );

      const callArgs = prismaService.order.create.mock.calls[0][0];
      const orderNumber = callArgs.data.orderNumber;
      expect(orderNumber).toMatch(/^BDR-\d{8}-\d{3}$/);

      // Check date part is today
      const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      expect(orderNumber).toBe(`BDR-${today}-001`);
    });

    it('increments sequence for subsequent orders', async () => {
      prismaService.product.findMany.mockResolvedValue([mockProduct]);
      prismaService.order.count.mockResolvedValue(4); // 4 orders already today
      prismaService.order.create.mockImplementation(({ data }) => ({
        id: 5,
        ...data,
        items: [],
      }));

      await service.create(
        {
          customerEmail: 'test@example.com',
          needsAccount: false,
          cartItems: [{ productId: 1, quantity: 1 }],
        },
        undefined,
      );

      const callArgs = prismaService.order.create.mock.calls[0][0];
      const orderNumber = callArgs.data.orderNumber;
      expect(orderNumber).toMatch(/^BDR-\d{8}-005$/);
    });
  });

  // ---- create ----

  describe('create()', () => {
    it('throws BadRequestException for empty cart', async () => {
      await expect(
        service.create(
          { customerEmail: 'test@example.com', needsAccount: false, cartItems: [] },
          undefined,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException if product not found', async () => {
      prismaService.product.findMany.mockResolvedValue([]);
      prismaService.order.count.mockResolvedValue(0);

      await expect(
        service.create(
          {
            customerEmail: 'test@example.com',
            needsAccount: false,
            cartItems: [{ productId: 999, quantity: 1 }],
          },
          undefined,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('creates order with correct totalAmount', async () => {
      const product = { ...mockProduct, price: 500 };
      prismaService.product.findMany.mockResolvedValue([product]);
      prismaService.order.count.mockResolvedValue(0);
      prismaService.order.create.mockImplementation(({ data }) => ({
        id: 1,
        ...data,
        items: [{ product, quantity: 2, price: 500 }],
      }));

      const result = await service.create(
        {
          customerEmail: 'user@test.com',
          needsAccount: false,
          cartItems: [{ productId: 1, quantity: 2 }],
        },
        undefined,
      );

      const callArgs = prismaService.order.create.mock.calls[0][0];
      expect(callArgs.data.totalAmount).toBe(1000); // 500 × 2
    });
  });

  // ---- updateStatus ----

  describe('updateStatus()', () => {
    it('throws NotFoundException for non-existent order', async () => {
      prismaService.order.findUnique.mockResolvedValue(null);
      await expect(
        service.updateStatus(999, OrderStatus.PAID),
      ).rejects.toThrow(NotFoundException);
    });

    it('sets paidAt when transitioning to PAID', async () => {
      const order = { id: 1, status: OrderStatus.PENDING, paidAt: null, deliveredAt: null };
      prismaService.order.findUnique.mockResolvedValue(order);
      prismaService.order.update.mockResolvedValue({ ...order, status: OrderStatus.PAID });

      await service.updateStatus(1, OrderStatus.PAID);

      const updateArgs = prismaService.order.update.mock.calls[0][0];
      expect(updateArgs.data.status).toBe(OrderStatus.PAID);
      expect(updateArgs.data.paidAt).toBeDefined();
    });

    it('sets deliveredAt when transitioning to DELIVERED', async () => {
      const order = { id: 1, status: OrderStatus.PAID, paidAt: new Date(), deliveredAt: null };
      prismaService.order.findUnique.mockResolvedValue(order);
      prismaService.order.update.mockResolvedValue({
        ...order,
        status: OrderStatus.DELIVERED,
      });

      await service.updateStatus(1, OrderStatus.DELIVERED);

      const updateArgs = prismaService.order.update.mock.calls[0][0];
      expect(updateArgs.data.deliveredAt).toBeDefined();
    });

    it('does not overwrite existing paidAt', async () => {
      const existingPaidAt = new Date('2026-01-01');
      const order = { id: 1, status: OrderStatus.PAID, paidAt: existingPaidAt, deliveredAt: null };
      prismaService.order.findUnique.mockResolvedValue(order);
      prismaService.order.update.mockResolvedValue(order);

      await service.updateStatus(1, OrderStatus.PAID);

      const updateArgs = prismaService.order.update.mock.calls[0][0];
      // paidAt should NOT be set again since it's already set
      expect(updateArgs.data.paidAt).toBeUndefined();
    });
  });

  // ---- findOne ----

  describe('findOne()', () => {
    it('throws NotFoundException for non-existent order number', async () => {
      prismaService.order.findUnique.mockResolvedValue(null);
      await expect(service.findOne('BDR-20260404-999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
