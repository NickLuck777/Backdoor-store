import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboard() {
    const today = new Date();
    const startOfToday = new Date(today.toDateString());
    const endOfToday = new Date(startOfToday.getTime() + 86400000);

    const [todayOrders, totalOrders, newUsersToday] = await Promise.all([
      this.prisma.order.findMany({
        where: {
          createdAt: { gte: startOfToday, lt: endOfToday },
          status: {
            in: [
              OrderStatus.PAID,
              OrderStatus.PROCESSING,
              OrderStatus.DELIVERED,
              OrderStatus.COMPLETED,
            ],
          },
        },
        select: { totalAmount: true },
      }),
      this.prisma.order.count({
        where: {
          createdAt: { gte: startOfToday, lt: endOfToday },
        },
      }),
      this.prisma.user.count({
        where: { createdAt: { gte: startOfToday, lt: endOfToday } },
      }),
    ]);

    const todaySales = todayOrders.reduce(
      (sum, o) => sum + Number(o.totalAmount),
      0,
    );
    const averageCheck =
      todayOrders.length > 0 ? todaySales / todayOrders.length : 0;

    return {
      todaySales,
      ordersCount: totalOrders,
      averageCheck,
      newUsers: newUsersToday,
    };
  }

  async getTopProducts(limit = 10) {
    const result = await this.prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { price: true },
      _count: { _all: true },
      orderBy: { _sum: { price: 'desc' } },
      take: limit,
    });

    const productIds = result.map((r) => r.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, title: true, slug: true, imageUrl: true },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    return result.map((r) => ({
      product: productMap.get(r.productId),
      totalRevenue: Number(r._sum.price ?? 0),
      ordersCount: r._count._all,
    }));
  }

  async getRevenue(period: 'week' | 'month' | 'year' = 'month') {
    const now = new Date();
    let startDate: Date;
    let groupByFormat: string;

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        groupByFormat = 'YYYY-MM-DD';
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        groupByFormat = 'YYYY-MM';
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        groupByFormat = 'YYYY-MM-DD';
    }

    const orders = await this.prisma.order.findMany({
      where: {
        createdAt: { gte: startDate },
        status: {
          in: [
            OrderStatus.PAID,
            OrderStatus.PROCESSING,
            OrderStatus.DELIVERED,
            OrderStatus.COMPLETED,
          ],
        },
      },
      select: { createdAt: true, totalAmount: true },
      orderBy: { createdAt: 'asc' },
    });

    // Group by date
    const grouped: Record<string, number> = {};
    for (const order of orders) {
      let key: string;
      if (period === 'year') {
        key = order.createdAt.toISOString().slice(0, 7); // YYYY-MM
      } else {
        key = order.createdAt.toISOString().slice(0, 10); // YYYY-MM-DD
      }
      grouped[key] = (grouped[key] ?? 0) + Number(order.totalAmount);
    }

    return Object.entries(grouped).map(([date, revenue]) => ({ date, revenue }));
  }
}
