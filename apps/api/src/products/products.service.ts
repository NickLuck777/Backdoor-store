import {
  Injectable,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import {
  FilterProductsDto,
  CreateProductDto,
  UpdateProductDto,
  BulkDiscountDto,
} from './products.dto';
import { Prisma } from '@prisma/client';

const HOMEPAGE_CACHE_KEY = 'homepage_sections';
const HOMEPAGE_CACHE_TTL = 300; // 5 min

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cache: Cache,
  ) {}

  async findAll(dto: FilterProductsDto) {
    const {
      page = 1,
      limit = 20,
      region,
      type,
      platform,
      categorySlug,
      hasDiscount,
      minPrice,
      maxPrice,
      isAvailable,
      search,
      sortBy = 'sortOrder',
      sortOrder = 'asc',
    } = dto;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {};

    if (region) where.region = region;
    if (type) where.type = type;
    if (platform) where.platform = platform;
    if (isAvailable !== undefined) where.isAvailable = isAvailable;
    if (hasDiscount) where.discount = { gt: 0 };

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    if (categorySlug) {
      where.categories = {
        some: {
          category: { slug: categorySlug },
        },
      };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const validSortFields = [
      'sortOrder',
      'price',
      'title',
      'createdAt',
      'discount',
    ];
    const orderByField = validSortFields.includes(sortBy) ? sortBy : 'sortOrder';

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: {
          categories: {
            include: { category: true },
          },
        },
        orderBy: { [orderByField]: sortOrder },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        categories: {
          include: { category: true },
        },
      },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async findByIds(ids: number[]) {
    return this.prisma.product.findMany({
      where: { id: { in: ids } },
      include: {
        categories: { include: { category: true } },
      },
    });
  }

  async getHomepageSections() {
    const cached = await this.cache.get(HOMEPAGE_CACHE_KEY);
    if (cached) return cached;

    const categories = await this.prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      take: 14,
      include: {
        products: {
          include: {
            product: true,
          },
          orderBy: {
            product: { sortOrder: 'asc' },
          },
          take: 20,
        },
      },
    });

    const sections = categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      products: cat.products.map((pc) => pc.product),
    }));

    await this.cache.set(HOMEPAGE_CACHE_KEY, sections, HOMEPAGE_CACHE_TTL);
    return sections;
  }

  async search(query: string, limit = 10) {
    if (!query || query.trim().length === 0) return [];

    // Try full-text search first
    try {
      const results = await this.prisma.$queryRaw<{ id: number }[]>`
        SELECT id FROM "Product"
        WHERE "searchVector" @@ plainto_tsquery('russian', ${query})
           OR "searchVector" @@ plainto_tsquery('english', ${query})
        ORDER BY ts_rank("searchVector", plainto_tsquery('russian', ${query})) DESC
        LIMIT ${limit}
      `;

      if (results.length > 0) {
        const ids = results.map((r) => r.id);
        return this.findByIds(ids);
      }
    } catch {
      // tsvector not available or error, fall through to ILIKE
    }

    // Fallback to ILIKE
    return this.prisma.product.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
        isAvailable: true,
      },
      take: limit,
      orderBy: { sortOrder: 'asc' },
      include: {
        categories: { include: { category: true } },
      },
    });
  }

  async create(dto: CreateProductDto) {
    const { categoryIds, ...productData } = dto;
    const product = await this.prisma.product.create({
      data: {
        ...productData,
        categories: categoryIds
          ? {
              create: categoryIds.map((id) => ({ categoryId: id })),
            }
          : undefined,
      },
      include: {
        categories: { include: { category: true } },
      },
    });
    await this.cache.del(HOMEPAGE_CACHE_KEY);
    return product;
  }

  async update(id: number, dto: UpdateProductDto) {
    const { categoryIds, ...productData } = dto;

    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Product not found');

    const product = await this.prisma.product.update({
      where: { id },
      data: {
        ...productData,
        ...(categoryIds !== undefined && {
          categories: {
            deleteMany: {},
            create: categoryIds.map((cid) => ({ categoryId: cid })),
          },
        }),
      },
      include: {
        categories: { include: { category: true } },
      },
    });
    await this.cache.del(HOMEPAGE_CACHE_KEY);
    return product;
  }

  async delete(id: number) {
    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Product not found');
    await this.prisma.product.delete({ where: { id } });
    await this.cache.del(HOMEPAGE_CACHE_KEY);
    return { deleted: true };
  }

  async bulkSetDiscount(dto: BulkDiscountDto) {
    const { productIds, discountPct } = dto;
    const result = await this.prisma.product.updateMany({
      where: { id: { in: productIds } },
      data: { discount: discountPct },
    });
    await this.cache.del(HOMEPAGE_CACHE_KEY);
    return { updated: result.count };
  }
}
