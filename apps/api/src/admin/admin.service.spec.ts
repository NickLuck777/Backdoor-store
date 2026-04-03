import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus } from '@prisma/client';

describe('AdminService', () => {
  let service: AdminService;
  let prisma: jest.Mocked<PrismaService>;

  const makeMockPrisma = () => ({
    order: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    user: {
      count: jest.fn(),
    },
    orderItem: {
      groupBy: jest.fn(),
    },
    product: {
      findMany: jest.fn(),
    },
  });

  beforeEach(async () => {
    const mockPrisma = makeMockPrisma();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    prisma = module.get(PrismaService) as jest.Mocked<PrismaService>;
  });

  describe('getDashboard', () => {
    it('should return correct analytics structure', async () => {
      const mockOrders = [
        { totalAmount: '1000' },
        { totalAmount: '2000' },
        { totalAmount: '500' },
      ];

      (prisma.order.findMany as jest.Mock).mockResolvedValue(mockOrders);
      (prisma.order.count as jest.Mock).mockResolvedValue(5);
      (prisma.user.count as jest.Mock).mockResolvedValue(3);

      const result = await service.getDashboard();

      expect(result).toHaveProperty('todaySales');
      expect(result).toHaveProperty('ordersCount');
      expect(result).toHaveProperty('averageCheck');
      expect(result).toHaveProperty('newUsers');
    });

    it('should calculate todaySales as sum of order amounts', async () => {
      const mockOrders = [
        { totalAmount: '100.50' },
        { totalAmount: '200.00' },
        { totalAmount: '50.25' },
      ];

      (prisma.order.findMany as jest.Mock).mockResolvedValue(mockOrders);
      (prisma.order.count as jest.Mock).mockResolvedValue(3);
      (prisma.user.count as jest.Mock).mockResolvedValue(1);

      const result = await service.getDashboard();

      expect(result.todaySales).toBeCloseTo(350.75, 2);
    });

    it('should calculate averageCheck correctly', async () => {
      const mockOrders = [
        { totalAmount: '100' },
        { totalAmount: '300' },
      ];

      (prisma.order.findMany as jest.Mock).mockResolvedValue(mockOrders);
      (prisma.order.count as jest.Mock).mockResolvedValue(2);
      (prisma.user.count as jest.Mock).mockResolvedValue(0);

      const result = await service.getDashboard();

      expect(result.averageCheck).toBe(200);
    });

    it('should return averageCheck of 0 when no paid orders today', async () => {
      (prisma.order.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.order.count as jest.Mock).mockResolvedValue(0);
      (prisma.user.count as jest.Mock).mockResolvedValue(0);

      const result = await service.getDashboard();

      expect(result.todaySales).toBe(0);
      expect(result.averageCheck).toBe(0);
      expect(result.ordersCount).toBe(0);
      expect(result.newUsers).toBe(0);
    });

    it('should query orders with today date range', async () => {
      (prisma.order.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.order.count as jest.Mock).mockResolvedValue(0);
      (prisma.user.count as jest.Mock).mockResolvedValue(0);

      await service.getDashboard();

      const findManyCall = (prisma.order.findMany as jest.Mock).mock.calls[0][0];
      const where = findManyCall.where;

      // Verify date range is set
      expect(where.createdAt).toBeDefined();
      expect(where.createdAt.gte).toBeInstanceOf(Date);
      expect(where.createdAt.lt).toBeInstanceOf(Date);

      // Verify start is beginning of today
      const gte: Date = where.createdAt.gte;
      const lt: Date = where.createdAt.lt;

      // lt should be exactly 24 hours after gte
      const diffMs = lt.getTime() - gte.getTime();
      expect(diffMs).toBe(86400000);
    });

    it('should query orders filtered by paid/processing/delivered/completed statuses', async () => {
      (prisma.order.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.order.count as jest.Mock).mockResolvedValue(0);
      (prisma.user.count as jest.Mock).mockResolvedValue(0);

      await service.getDashboard();

      const findManyCall = (prisma.order.findMany as jest.Mock).mock.calls[0][0];
      const statusFilter = findManyCall.where.status.in;

      expect(statusFilter).toContain(OrderStatus.PAID);
      expect(statusFilter).toContain(OrderStatus.PROCESSING);
      expect(statusFilter).toContain(OrderStatus.DELIVERED);
      expect(statusFilter).toContain(OrderStatus.COMPLETED);
    });

    it('should return newUsers count from user.count query', async () => {
      (prisma.order.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.order.count as jest.Mock).mockResolvedValue(0);
      (prisma.user.count as jest.Mock).mockResolvedValue(7);

      const result = await service.getDashboard();

      expect(result.newUsers).toBe(7);
    });
  });
});
