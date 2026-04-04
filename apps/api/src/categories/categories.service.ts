import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto, ReorderCategoriesDto } from './categories.dto';
import { FilterProductsDto } from '../products/products.dto';

const HOMEPAGE_CACHE_KEY = 'homepage_sections';
const CATEGORIES_CACHE_KEY = 'categories_all';
const CATEGORIES_CACHE_TTL = 300; // 5 min

@Injectable()
export class CategoriesService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cache: Cache,
  ) {}

  async findAll() {
    const cached = await this.cache.get(CATEGORIES_CACHE_KEY);
    if (cached) return cached;

    const categories = await this.prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: { select: { products: true } },
      },
    });

    const result = categories.map((cat) => ({
      ...cat,
      productCount: cat._count.products,
      _count: undefined,
    }));

    await this.cache.set(CATEGORIES_CACHE_KEY, result, CATEGORIES_CACHE_TTL);
    return result;
  }

  async findBySlug(slug: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: {
        _count: { select: { products: true } },
      },
    });
    if (!category) throw new NotFoundException('Category not found');
    return {
      ...category,
      productCount: category._count.products,
      _count: undefined,
    };
  }

  async findProducts(slug: string, dto: FilterProductsDto) {
    const category = await this.prisma.category.findUnique({ where: { slug } });
    if (!category) throw new NotFoundException('Category not found');

    const { page = 1, limit = 20 } = dto;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where: {
          categories: { some: { categoryId: category.id } },
          ...(dto.isAvailable !== undefined && { isAvailable: dto.isAvailable }),
        },
        skip,
        take: limit,
        orderBy: { sortOrder: 'asc' },
        include: {
          categories: { include: { category: true } },
        },
      }),
      this.prisma.product.count({
        where: {
          categories: { some: { categoryId: category.id } },
        },
      }),
    ]);

    return {
      data: products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async create(dto: CreateCategoryDto) {
    const category = await this.prisma.category.create({ data: dto });
    await Promise.all([
      this.cache.del(CATEGORIES_CACHE_KEY),
      this.cache.del(HOMEPAGE_CACHE_KEY),
    ]);
    return category;
  }

  async update(id: number, dto: UpdateCategoryDto) {
    const existing = await this.prisma.category.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Category not found');
    const category = await this.prisma.category.update({ where: { id }, data: dto });
    await Promise.all([
      this.cache.del(CATEGORIES_CACHE_KEY),
      this.cache.del(HOMEPAGE_CACHE_KEY),
    ]);
    return category;
  }

  async delete(id: number) {
    const existing = await this.prisma.category.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Category not found');
    await this.prisma.category.delete({ where: { id } });
    await Promise.all([
      this.cache.del(CATEGORIES_CACHE_KEY),
      this.cache.del(HOMEPAGE_CACHE_KEY),
    ]);
    return { deleted: true };
  }

  async reorder(dto: ReorderCategoriesDto) {
    await Promise.all(
      dto.items.map((item) =>
        this.prisma.category.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        }),
      ),
    );
    await Promise.all([
      this.cache.del(CATEGORIES_CACHE_KEY),
      this.cache.del(HOMEPAGE_CACHE_KEY),
    ]);
    return { reordered: true };
  }
}
