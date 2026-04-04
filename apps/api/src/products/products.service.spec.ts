import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ProductsService } from './products.service';
import { PrismaService } from '../prisma/prisma.service';
import { Region, ProductType } from '@prisma/client';

const mockProduct = {
  id: 1,
  slug: 'god-of-war',
  title: 'God of War',
  description: 'Action game',
  type: ProductType.GAME,
  platform: null,
  edition: null,
  region: Region.TURKEY,
  regionProductId: null,
  price: 700,
  originalPrice: null,
  discount: null,
  imageUrl: null,
  isPreorder: false,
  isAvailable: true,
  sortOrder: 0,
  searchVector: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  categories: [],
};

describe('ProductsService', () => {
  let service: ProductsService;
  let prisma: {
    product: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      count: jest.Mock;
      create: jest.Mock;
      updateMany: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    category: { findMany: jest.Mock };
    $queryRaw: jest.Mock;
  };
  let cache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  beforeEach(async () => {
    prisma = {
      product: {
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn().mockResolvedValue(null),
        count: jest.fn().mockResolvedValue(0),
        create: jest.fn().mockResolvedValue(mockProduct),
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
        update: jest.fn().mockResolvedValue(mockProduct),
        delete: jest.fn().mockResolvedValue(mockProduct),
      },
      category: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      $queryRaw: jest.fn().mockResolvedValue([]),
    };

    cache = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue(undefined),
      del: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: PrismaService, useValue: prisma },
        { provide: CACHE_MANAGER, useValue: cache },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  // ---- findAll ----

  describe('findAll()', () => {
    it('returns paginated results with default params', async () => {
      prisma.product.findMany.mockResolvedValue([mockProduct]);
      prisma.product.count.mockResolvedValue(1);

      const result = await service.findAll({});

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(result.totalPages).toBe(1);
    });

    it('applies region filter in WHERE clause', async () => {
      prisma.product.findMany.mockResolvedValue([mockProduct]);
      prisma.product.count.mockResolvedValue(1);

      await service.findAll({ region: Region.TURKEY });

      const findManyCall = prisma.product.findMany.mock.calls[0][0];
      expect(findManyCall.where.region).toBe(Region.TURKEY);
    });

    it('applies hasDiscount filter with discount > 0 condition', async () => {
      prisma.product.findMany.mockResolvedValue([]);
      prisma.product.count.mockResolvedValue(0);

      await service.findAll({ hasDiscount: true });

      const findManyCall = prisma.product.findMany.mock.calls[0][0];
      expect(findManyCall.where.discount).toEqual({ gt: 0 });
    });

    it('calculates correct skip for page 3 with limit 10', async () => {
      prisma.product.findMany.mockResolvedValue([]);
      prisma.product.count.mockResolvedValue(30);

      await service.findAll({ page: 3, limit: 10 });

      const findManyCall = prisma.product.findMany.mock.calls[0][0];
      expect(findManyCall.skip).toBe(20);
      expect(findManyCall.take).toBe(10);
    });

    it('calculates totalPages correctly', async () => {
      prisma.product.findMany.mockResolvedValue([]);
      prisma.product.count.mockResolvedValue(55);

      const result = await service.findAll({ limit: 20 });

      expect(result.totalPages).toBe(3); // ceil(55/20)
    });
  });

  // ---- findOne ----

  describe('findOne()', () => {
    it('returns product by slug with categories', async () => {
      const productWithCats = { ...mockProduct, categories: [{ category: { id: 1, name: 'Action' } }] };
      prisma.product.findUnique.mockResolvedValue(productWithCats);

      const result = await service.findOne('god-of-war');

      expect(result.slug).toBe('god-of-war');
      expect(result.categories).toBeDefined();
      const findUniqueCall = prisma.product.findUnique.mock.calls[0][0];
      expect(findUniqueCall.include.categories.include.category).toBe(true);
    });

    it('throws NotFoundException when product not found', async () => {
      prisma.product.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent-slug')).rejects.toThrow(NotFoundException);
    });
  });

  // ---- create ----

  describe('create()', () => {
    it('creates product with provided slug', async () => {
      prisma.product.create.mockResolvedValue(mockProduct);

      const dto = {
        slug: 'god-of-war',
        title: 'God of War',
        type: ProductType.GAME,
        region: Region.TURKEY,
        price: 700,
      };

      const result = await service.create(dto);

      expect(prisma.product.create).toHaveBeenCalledTimes(1);
      const createCall = prisma.product.create.mock.calls[0][0];
      expect(createCall.data.slug).toBe('god-of-war');
      expect(result).toEqual(mockProduct);
    });

    it('creates product with categoryIds as relations', async () => {
      prisma.product.create.mockResolvedValue(mockProduct);

      const dto = {
        slug: 'game-with-cats',
        title: 'Game With Categories',
        type: ProductType.GAME,
        region: Region.TURKEY,
        price: 500,
        categoryIds: [1, 2],
      };

      await service.create(dto);

      const createCall = prisma.product.create.mock.calls[0][0];
      expect(createCall.data.categories.create).toHaveLength(2);
      expect(createCall.data.categories.create[0]).toEqual({ categoryId: 1 });
    });

    it('invalidates homepage cache after create', async () => {
      prisma.product.create.mockResolvedValue(mockProduct);

      await service.create({
        slug: 'new-game',
        title: 'New Game',
        type: ProductType.GAME,
        region: Region.TURKEY,
        price: 500,
      });

      expect(cache.del).toHaveBeenCalledWith('homepage_sections');
    });
  });

  // ---- bulkSetDiscount ----

  describe('bulkSetDiscount()', () => {
    it('updates multiple products with given discount', async () => {
      prisma.product.updateMany.mockResolvedValue({ count: 3 });

      const result = await service.bulkSetDiscount({ productIds: [1, 2, 3], discountPct: 20 });

      expect(result.updated).toBe(3);
      const updateManyCall = prisma.product.updateMany.mock.calls[0][0];
      expect(updateManyCall.where.id).toEqual({ in: [1, 2, 3] });
      expect(updateManyCall.data.discount).toBe(20);
    });

    it('invalidates homepage cache after bulk discount', async () => {
      prisma.product.updateMany.mockResolvedValue({ count: 2 });

      await service.bulkSetDiscount({ productIds: [1, 2], discountPct: 15 });

      expect(cache.del).toHaveBeenCalledWith('homepage_sections');
    });
  });

  // ---- search ----

  describe('search()', () => {
    it('returns empty array for empty query', async () => {
      const result = await service.search('');
      expect(result).toEqual([]);
      expect(prisma.$queryRaw).not.toHaveBeenCalled();
    });

    it('returns results via full-text search when available', async () => {
      prisma.$queryRaw.mockResolvedValue([{ id: 1 }]);
      prisma.product.findMany.mockResolvedValue([mockProduct]);

      const result = await service.search('god');

      expect(result).toHaveLength(1);
    });

    it('falls back to ILIKE when full-text search returns empty', async () => {
      prisma.$queryRaw.mockResolvedValue([]);
      prisma.product.findMany.mockResolvedValue([mockProduct]);

      const result = await service.search('god');

      expect(prisma.product.findMany).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });

    it('falls back to ILIKE when full-text search throws', async () => {
      prisma.$queryRaw.mockRejectedValue(new Error('tsvector not available'));
      prisma.product.findMany.mockResolvedValue([mockProduct]);

      const result = await service.search('god');

      expect(prisma.product.findMany).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });
  });
});
