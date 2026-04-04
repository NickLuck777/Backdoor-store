import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PagesService } from './pages.service';
import { PrismaService } from '../prisma/prisma.service';

describe('PagesService', () => {
  let service: PagesService;
  let prisma: {
    page: { findUnique: jest.Mock; findMany: jest.Mock; create: jest.Mock; update: jest.Mock; delete: jest.Mock };
    fAQ: { findMany: jest.Mock; findUnique: jest.Mock; create: jest.Mock; update: jest.Mock; delete: jest.Mock };
    banner: { findMany: jest.Mock; findUnique: jest.Mock; create: jest.Mock; update: jest.Mock; delete: jest.Mock };
  };

  const mockFaq1 = { id: 1, question: 'What is PS?', answer: 'PlayStation', isActive: true, sortOrder: 1 };
  const mockFaq2 = { id: 2, question: 'How to pay?', answer: 'Via SBP', isActive: true, sortOrder: 2 };
  const mockFaqInactive = { id: 3, question: 'Old FAQ', answer: 'Outdated', isActive: false, sortOrder: 3 };

  const mockBannerActive = {
    id: 1,
    title: 'Summer Sale',
    isActive: true,
    startDate: null,
    endDate: null,
    sortOrder: 1,
  };

  const mockBannerExpired = {
    id: 2,
    title: 'Old Banner',
    isActive: true,
    startDate: null,
    endDate: new Date('2020-01-01'), // expired
    sortOrder: 2,
  };

  beforeEach(async () => {
    prisma = {
      page: {
        findUnique: jest.fn().mockResolvedValue(null),
        findMany: jest.fn().mockResolvedValue([]),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      fAQ: {
        findMany: jest.fn().mockResolvedValue([mockFaq1, mockFaq2]),
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      banner: {
        findMany: jest.fn().mockResolvedValue([mockBannerActive]),
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PagesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<PagesService>(PagesService);
  });

  // ---- findAllFaqs ----

  describe('findAllFaqs()', () => {
    it('queries only active FAQs sorted by sortOrder', async () => {
      await service.findAllFaqs();

      const callArgs = prisma.fAQ.findMany.mock.calls[0][0];
      expect(callArgs.where.isActive).toBe(true);
      expect(callArgs.orderBy).toEqual({ sortOrder: 'asc' });
    });

    it('returns active FAQs', async () => {
      prisma.fAQ.findMany.mockResolvedValue([mockFaq1, mockFaq2]);

      const result = await service.findAllFaqs();

      expect(result).toHaveLength(2);
      expect(result[0].isActive).toBe(true);
      expect(result[1].isActive).toBe(true);
    });

    it('does not include inactive FAQs (mocked at DB level)', async () => {
      // The service WHERE clause filters isActive:true — verify no inactive items
      prisma.fAQ.findMany.mockResolvedValue([mockFaq1, mockFaq2]);

      const result = await service.findAllFaqs();

      const hasInactive = result.some((f) => !f.isActive);
      expect(hasInactive).toBe(false);
    });
  });

  // ---- findBanners ----

  describe('findBanners()', () => {
    it('queries banners with isActive filter and date range', async () => {
      await service.findBanners();

      const callArgs = prisma.banner.findMany.mock.calls[0][0];
      expect(callArgs.where.isActive).toBe(true);
      // Should have OR clause for date range
      expect(callArgs.where.OR).toBeDefined();
      expect(callArgs.where.AND).toBeDefined();
    });

    it('returns active banners', async () => {
      prisma.banner.findMany.mockResolvedValue([mockBannerActive]);

      const result = await service.findBanners();

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Summer Sale');
    });

    it('applies position filter when provided', async () => {
      prisma.banner.findMany.mockResolvedValue([mockBannerActive]);

      await service.findBanners('hero');

      const callArgs = prisma.banner.findMany.mock.calls[0][0];
      expect(callArgs.where.position).toBe('hero');
    });

    it('orders banners by sortOrder', async () => {
      prisma.banner.findMany.mockResolvedValue([mockBannerActive]);

      await service.findBanners();

      const callArgs = prisma.banner.findMany.mock.calls[0][0];
      expect(callArgs.orderBy).toEqual({ sortOrder: 'asc' });
    });
  });

  // ---- findPageBySlug ----

  describe('findPageBySlug()', () => {
    it('returns page when found', async () => {
      const mockPage = { id: 1, slug: 'about', title: 'About', content: 'text' };
      prisma.page.findUnique.mockResolvedValue(mockPage);

      const result = await service.findPageBySlug('about');

      expect(result.slug).toBe('about');
    });

    it('throws NotFoundException when page not found', async () => {
      prisma.page.findUnique.mockResolvedValue(null);

      await expect(service.findPageBySlug('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  // ---- findAllFaqsAdmin ----

  describe('findAllFaqsAdmin()', () => {
    it('returns all FAQs without isActive filter', async () => {
      prisma.fAQ.findMany.mockResolvedValue([mockFaq1, mockFaq2, mockFaqInactive]);

      const result = await service.findAllFaqsAdmin();

      expect(result).toHaveLength(3);
      const callArgs = prisma.fAQ.findMany.mock.calls[0][0];
      // Admin endpoint should NOT filter by isActive
      expect(callArgs.where).toBeUndefined();
    });
  });
});
