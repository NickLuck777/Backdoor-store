import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto, FilterOrdersDto } from './orders.dto';
import { OrderStatus, Prisma } from '@prisma/client';
import { CodesService } from '../codes/codes.service';
import { SmartCartService } from '../cart/smart-cart.service';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private codesService: CodesService,
    private smartCartService: SmartCartService,
  ) {}

  private async generateOrderNumber(): Promise<string> {
    const today = new Date();
    const dateStr = today
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, '');

    const startOfDay = new Date(today.toDateString());
    const endOfDay = new Date(startOfDay.getTime() + 86400000);

    const countToday = await this.prisma.order.count({
      where: {
        createdAt: {
          gte: startOfDay,
          lt: endOfDay,
        },
      },
    });

    const seq = String(countToday + 1).padStart(3, '0');
    return `BDR-${dateStr}-${seq}`;
  }

  async create(dto: CreateOrderDto, userId?: number) {
    const { cartItems, ...orderData } = dto;

    if (!cartItems || cartItems.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // Fetch products to calculate total
    const productIds = cartItems.map((i) => i.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      throw new BadRequestException('Some products not found');
    }

    const productMap = new Map(products.map((p) => [p.id, p]));
    let totalAmount = 0;

    const items: Prisma.OrderItemCreateManyOrderInput[] = cartItems.map(
      (item) => {
        const product = productMap.get(item.productId)!;
        const price = Number(product.price);
        totalAmount += price * item.quantity;
        return {
          productId: item.productId,
          quantity: item.quantity,
          price: product.price,
        };
      },
    );

    const orderNumber = await this.generateOrderNumber();

    const order = await this.prisma.order.create({
      data: {
        orderNumber,
        userId,
        customerEmail: orderData.customerEmail,
        customerPhone: orderData.customerPhone,
        customerTg: orderData.customerTg,
        needsAccount: orderData.needsAccount,
        accountRegion: orderData.accountRegion,
        notes: orderData.notes,
        totalAmount,
        items: {
          createMany: { data: items },
        },
      },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    return order;
  }

  async findOne(orderNumber: string) {
    const order = await this.prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: { include: { product: true } },
        codes: true,
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async findById(id: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: true } },
        codes: true,
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async findByUser(userId: number) {
    return this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: { include: { product: true } },
      },
    });
  }

  async updateStatus(id: number, status: OrderStatus) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');

    const updates: Prisma.OrderUpdateInput = { status };
    if (status === OrderStatus.PAID && !order.paidAt) {
      updates.paidAt = new Date();
    }
    if (status === OrderStatus.DELIVERED && !order.deliveredAt) {
      updates.deliveredAt = new Date();
    }

    return this.prisma.order.update({ where: { id }, data: updates });
  }

  async assignCodes(orderId: number) {
    const order = await this.findById(orderId);

    // Determine what region the products are from
    const productIds = order.items.map((i) => i.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length === 0) throw new BadRequestException('No products');
    const region = products[0].region;

    // Calculate needed cards using smart cart algorithm
    const smartCartResult = await this.smartCartService.calculateFromIds(
      order.items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      region,
    );

    // Group card denominations
    const neededCards = smartCartResult.cards.map((card) => ({
      denomination: card.denomination,
      currency: card.currency,
      quantity: card.quantity,
    }));

    return this.codesService.reserveForOrder(orderId, neededCards);
  }

  async deliver(orderId: number) {
    await this.codesService.markAsSold(orderId);
    return this.updateStatus(orderId, OrderStatus.DELIVERED);
  }

  async findAll(dto: FilterOrdersDto) {
    const { page = 1, limit = 20, status, email, dateFrom, dateTo } = dto;
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {};
    if (status) where.status = status;
    if (email) where.customerEmail = { contains: email, mode: 'insensitive' };
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: { include: { product: { select: { title: true } } } },
          user: { select: { email: true } },
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data: orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async exportToCsv(dto: FilterOrdersDto): Promise<string> {
    const result = await this.findAll({ ...dto, limit: 10000, page: 1 });
    const orders = result.data;

    const headers = [
      'orderNumber',
      'status',
      'customerEmail',
      'customerPhone',
      'totalAmount',
      'paymentMethod',
      'createdAt',
      'paidAt',
      'deliveredAt',
    ].join(',');

    const rows = orders.map((o) =>
      [
        o.orderNumber,
        o.status,
        o.customerEmail,
        o.customerPhone ?? '',
        o.totalAmount,
        o.paymentMethod,
        o.createdAt.toISOString(),
        o.paidAt?.toISOString() ?? '',
        o.deliveredAt?.toISOString() ?? '',
      ]
        .map((v) => `"${v}"`)
        .join(','),
    );

    return [headers, ...rows].join('\n');
  }
}
