import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreatePageDto,
  UpdatePageDto,
  CreateFaqDto,
  UpdateFaqDto,
  CreateBannerDto,
  UpdateBannerDto,
} from './pages.dto';

@Injectable()
export class PagesService {
  constructor(private prisma: PrismaService) {}

  // ---- Pages ----

  async findPageBySlug(slug: string) {
    const page = await this.prisma.page.findUnique({ where: { slug } });
    if (!page) throw new NotFoundException('Page not found');
    return page;
  }

  async findAllPages() {
    return this.prisma.page.findMany({ orderBy: { slug: 'asc' } });
  }

  async createPage(dto: CreatePageDto) {
    return this.prisma.page.create({ data: dto });
  }

  async updatePage(id: number, dto: UpdatePageDto) {
    const existing = await this.prisma.page.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Page not found');
    return this.prisma.page.update({ where: { id }, data: dto });
  }

  async deletePage(id: number) {
    const existing = await this.prisma.page.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Page not found');
    await this.prisma.page.delete({ where: { id } });
    return { deleted: true };
  }

  // ---- FAQ ----

  async findAllFaqs() {
    return this.prisma.fAQ.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findAllFaqsAdmin() {
    return this.prisma.fAQ.findMany({ orderBy: { sortOrder: 'asc' } });
  }

  async createFaq(dto: CreateFaqDto) {
    return this.prisma.fAQ.create({ data: dto });
  }

  async updateFaq(id: number, dto: UpdateFaqDto) {
    const existing = await this.prisma.fAQ.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('FAQ not found');
    return this.prisma.fAQ.update({ where: { id }, data: dto });
  }

  async deleteFaq(id: number) {
    const existing = await this.prisma.fAQ.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('FAQ not found');
    await this.prisma.fAQ.delete({ where: { id } });
    return { deleted: true };
  }

  // ---- Banners ----

  async findBanners(position?: string) {
    const now = new Date();
    return this.prisma.banner.findMany({
      where: {
        isActive: true,
        ...(position && { position }),
        OR: [
          { startDate: null },
          { startDate: { lte: now } },
        ],
        AND: [
          {
            OR: [
              { endDate: null },
              { endDate: { gte: now } },
            ],
          },
        ],
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findAllBannersAdmin() {
    return this.prisma.banner.findMany({ orderBy: { sortOrder: 'asc' } });
  }

  async createBanner(dto: CreateBannerDto) {
    return this.prisma.banner.create({
      data: {
        ...dto,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
    });
  }

  async updateBanner(id: number, dto: UpdateBannerDto) {
    const existing = await this.prisma.banner.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Banner not found');
    return this.prisma.banner.update({
      where: { id },
      data: {
        ...dto,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
    });
  }

  async deleteBanner(id: number) {
    const existing = await this.prisma.banner.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Banner not found');
    await this.prisma.banner.delete({ where: { id } });
    return { deleted: true };
  }
}
