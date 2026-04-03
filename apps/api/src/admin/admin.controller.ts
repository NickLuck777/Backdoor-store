import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  Res,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { Response } from 'express';
import { AdminService } from './admin.service';
import { OrdersService } from '../orders/orders.service';
import { CodesService } from '../codes/codes.service';
import { UsersService } from '../users/users.service';
import { ProductsService } from '../products/products.service';
import { CategoriesService } from '../categories/categories.service';
import { PagesService } from '../pages/pages.service';
import { ExchangeRatesService } from '../exchange-rates/exchange-rates.service';
import { FileUploadService } from '../common/services/file-upload.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole, OrderStatus } from '@prisma/client';
import { FilterOrdersDto } from '../orders/orders.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CreatePageDto, UpdatePageDto, CreateFaqDto, UpdateFaqDto, CreateBannerDto, UpdateBannerDto } from '../pages/pages.dto';
import { UpdateExchangeRateDto } from '../exchange-rates/exchange-rates.dto';
import {
  UpdateOrderStatusDto,
  UpdateThresholdDto,
  BulkDiscountAdminDto,
  ReorderCategoriesAdminDto,
  CreatePromoCodeDto,
  UpdatePromoCodeDto,
} from './admin.dto';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MANAGER)
@Controller('admin')
export class AdminController {
  constructor(
    private adminService: AdminService,
    private ordersService: OrdersService,
    private codesService: CodesService,
    private usersService: UsersService,
    private productsService: ProductsService,
    private categoriesService: CategoriesService,
    private pagesService: PagesService,
    private exchangeRatesService: ExchangeRatesService,
    private fileUploadService: FileUploadService,
    private prisma: PrismaService,
  ) {}

  // ---- Analytics ----

  @Get('analytics/dashboard')
  @ApiOperation({ summary: 'Admin dashboard analytics' })
  @ApiResponse({ status: 200, description: 'Dashboard stats' })
  getDashboard() {
    return this.adminService.getDashboard();
  }

  @Get('analytics/top-products')
  @ApiOperation({ summary: 'Top 10 products by revenue' })
  @ApiResponse({ status: 200, description: 'Top products list' })
  getTopProducts() {
    return this.adminService.getTopProducts(10);
  }

  @Get('analytics/revenue')
  @ApiQuery({ name: 'period', enum: ['week', 'month', 'year'], required: false })
  @ApiOperation({ summary: 'Revenue chart data by period' })
  @ApiResponse({ status: 200, description: 'Revenue data points' })
  getRevenue(@Query('period') period: 'week' | 'month' | 'year' = 'month') {
    return this.adminService.getRevenue(period);
  }

  // ---- Products ----

  @Post('products/import')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data', 'text/csv', 'application/octet-stream')
  @ApiOperation({ summary: 'Import products from CSV (multipart or raw body)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Import summary: {created, updated, errors}' })
  async importProducts(
    @UploadedFile() file?: Express.Multer.File,
    @Body() body?: { csv?: string },
  ) {
    let csvContent: string;

    if (file?.buffer) {
      csvContent = this.fileUploadService.bufferToCsv(file.buffer);
    } else if (body?.csv) {
      csvContent = body.csv;
    } else {
      throw new BadRequestException('No CSV data provided. Send multipart file or raw CSV in body.csv');
    }

    const { rows, errors } = this.fileUploadService.parseCsv<{
      slug: string;
      title: string;
      price: string;
      type: string;
      region: string;
      [key: string]: string;
    }>(csvContent, ['slug', 'title', 'price', 'type', 'region']);

    let created = 0;
    let updated = 0;
    const importErrors: string[] = [...errors];

    for (const row of rows) {
      try {
        const price = parseFloat(row.price);
        if (isNaN(price)) {
          importErrors.push(`Slug "${row.slug}": invalid price "${row.price}"`);
          continue;
        }

        const existing = await this.prisma.product.findUnique({
          where: { slug: row.slug },
        });

        const data: Record<string, unknown> = {
          title: row.title,
          price,
          type: row.type as never,
          region: row.region as never,
        };
        if (row.description) data.description = row.description;
        if (row.imageUrl) data.imageUrl = row.imageUrl;
        if (row.discount) data.discount = parseInt(row.discount) || 0;
        if (row.isAvailable !== undefined) data.isAvailable = row.isAvailable === 'true';

        if (existing) {
          await this.prisma.product.update({ where: { slug: row.slug }, data });
          updated++;
        } else {
          await this.prisma.product.create({ data: { slug: row.slug, ...data } as never });
          created++;
        }
      } catch (e) {
        importErrors.push(`Slug "${row.slug}": ${(e as Error).message}`);
      }
    }

    return { created, updated, errors: importErrors };
  }

  @Post('products/bulk-discount')
  @ApiOperation({ summary: 'Apply bulk discount to products' })
  @ApiResponse({ status: 201, description: 'Count of updated products' })
  bulkDiscount(@Body() dto: BulkDiscountAdminDto) {
    return this.productsService.bulkSetDiscount(dto);
  }

  // ---- Categories ----

  @Patch('categories/reorder')
  @ApiOperation({ summary: 'Bulk reorder categories' })
  @ApiResponse({ status: 200, description: 'Reordered successfully' })
  reorderCategories(@Body() dto: ReorderCategoriesAdminDto) {
    // Map to CategoriesService expected DTO shape
    return this.categoriesService.reorder({ items: dto.items });
  }

  // ---- Orders ----

  @Get('orders')
  @ApiOperation({ summary: 'List all orders with filters' })
  @ApiResponse({ status: 200, description: 'Paginated orders' })
  listOrders(@Query() dto: FilterOrdersDto) {
    return this.ordersService.findAll(dto);
  }

  @Get('orders/export')
  @ApiOperation({ summary: 'Export orders to CSV' })
  @ApiResponse({ status: 200, description: 'CSV file download' })
  async exportOrders(@Query() dto: FilterOrdersDto, @Res() res: Response) {
    const csv = await this.ordersService.exportToCsv(dto);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=orders.csv');
    res.send(csv);
  }

  @Get('orders/:id')
  @ApiOperation({ summary: 'Get full order detail with items and codes' })
  @ApiResponse({ status: 200, description: 'Order detail' })
  getOrder(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.findById(id);
  }

  @Patch('orders/:id/status')
  @ApiOperation({ summary: 'Update order status' })
  @ApiResponse({ status: 200, description: 'Status updated' })
  updateOrderStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(id, dto.status);
  }

  @Post('orders/:id/assign-codes')
  @ApiOperation({ summary: 'Manually assign codes to order' })
  @ApiResponse({ status: 201, description: 'Codes assigned' })
  assignCodes(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.assignCodes(id);
  }

  @Post('orders/:id/deliver')
  @ApiOperation({ summary: 'Mark order as delivered and send email notification' })
  @ApiResponse({ status: 201, description: 'Order delivered' })
  deliverOrder(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.deliver(id);
  }

  // ---- Codes ----

  @Post('codes/import')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data', 'text/csv', 'application/octet-stream')
  @ApiOperation({ summary: 'Import top-up codes from CSV (code, denomination, currency)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        csv: { type: 'string', description: 'Raw CSV content (alternative to file upload)' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Codes imported' })
  async importCodes(
    @UploadedFile() file?: Express.Multer.File,
    @Body() body?: { csv?: string },
  ) {
    let csvContent: string;

    if (file?.buffer) {
      csvContent = this.fileUploadService.bufferToCsv(file.buffer);
    } else if (body?.csv) {
      csvContent = body.csv;
    } else {
      throw new BadRequestException('No CSV data provided. Send multipart file or raw CSV in body.csv');
    }

    return this.codesService.importFromCsv(csvContent);
  }

  @Get('codes/inventory')
  @ApiOperation({ summary: 'Get codes inventory grouped by denomination and currency' })
  @ApiResponse({ status: 200, description: 'Inventory grouped by currency/denomination' })
  getInventory() {
    return this.codesService.getInventory();
  }

  @Get('codes/alerts')
  @ApiQuery({ name: 'threshold', required: false, description: 'Low stock threshold (default: 5)' })
  @ApiOperation({ summary: 'Get low stock alerts' })
  @ApiResponse({ status: 200, description: 'Low stock items' })
  getAlerts(@Query('threshold') threshold?: string) {
    return this.codesService.getLowStockAlerts(threshold ? parseInt(threshold) : 5);
  }

  @Patch('codes/threshold')
  @ApiOperation({ summary: 'Update low stock alert threshold' })
  @ApiResponse({ status: 200, description: 'Threshold updated' })
  updateThreshold(@Body() dto: UpdateThresholdDto) {
    // Returns new threshold; actual persistence would require a settings table
    return { threshold: dto.threshold };
  }

  // ---- Pages ----

  @Get('pages')
  @ApiOperation({ summary: 'List all static pages' })
  @ApiResponse({ status: 200, description: 'Pages list' })
  listPages() {
    return this.pagesService.findAllPages();
  }

  @Post('pages')
  @ApiOperation({ summary: 'Create static page' })
  @ApiResponse({ status: 201, description: 'Page created' })
  createPage(@Body() dto: CreatePageDto) {
    return this.pagesService.createPage(dto);
  }

  @Patch('pages/:id')
  @ApiOperation({ summary: 'Update static page' })
  @ApiResponse({ status: 200, description: 'Page updated' })
  updatePage(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePageDto,
  ) {
    return this.pagesService.updatePage(id, dto);
  }

  @Delete('pages/:id')
  @ApiOperation({ summary: 'Delete static page' })
  @ApiResponse({ status: 200, description: 'Page deleted' })
  deletePage(@Param('id', ParseIntPipe) id: number) {
    return this.pagesService.deletePage(id);
  }

  // ---- FAQ ----

  @Get('faq')
  @ApiOperation({ summary: 'List all FAQ items (including inactive)' })
  @ApiResponse({ status: 200, description: 'FAQ list' })
  listFaq() {
    return this.pagesService.findAllFaqsAdmin();
  }

  @Post('faq')
  @ApiOperation({ summary: 'Create FAQ item' })
  @ApiResponse({ status: 201, description: 'FAQ created' })
  createFaq(@Body() dto: CreateFaqDto) {
    return this.pagesService.createFaq(dto);
  }

  @Patch('faq/:id')
  @ApiOperation({ summary: 'Update FAQ item' })
  @ApiResponse({ status: 200, description: 'FAQ updated' })
  updateFaq(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFaqDto,
  ) {
    return this.pagesService.updateFaq(id, dto);
  }

  @Delete('faq/:id')
  @ApiOperation({ summary: 'Delete FAQ item' })
  @ApiResponse({ status: 200, description: 'FAQ deleted' })
  deleteFaq(@Param('id', ParseIntPipe) id: number) {
    return this.pagesService.deleteFaq(id);
  }

  // ---- Banners ----

  @Get('banners')
  @ApiOperation({ summary: 'List all banners (including inactive)' })
  @ApiResponse({ status: 200, description: 'Banners list' })
  listBanners() {
    return this.pagesService.findAllBannersAdmin();
  }

  @Post('banners')
  @ApiOperation({ summary: 'Create banner' })
  @ApiResponse({ status: 201, description: 'Banner created' })
  createBanner(@Body() dto: CreateBannerDto) {
    return this.pagesService.createBanner(dto);
  }

  @Patch('banners/:id')
  @ApiOperation({ summary: 'Update banner' })
  @ApiResponse({ status: 200, description: 'Banner updated' })
  updateBanner(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBannerDto,
  ) {
    return this.pagesService.updateBanner(id, dto);
  }

  @Delete('banners/:id')
  @ApiOperation({ summary: 'Delete banner' })
  @ApiResponse({ status: 200, description: 'Banner deleted' })
  deleteBanner(@Param('id', ParseIntPipe) id: number) {
    return this.pagesService.deleteBanner(id);
  }

  // ---- Exchange Rates ----

  @Get('exchange-rates')
  @ApiOperation({ summary: 'Get all exchange rates' })
  @ApiResponse({ status: 200, description: 'Exchange rates' })
  getExchangeRates() {
    return this.exchangeRatesService.findAll();
  }

  @Patch('exchange-rates/:id')
  @ApiOperation({ summary: 'Update exchange rate and margin' })
  @ApiResponse({ status: 200, description: 'Rate updated' })
  updateExchangeRate(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateExchangeRateDto,
  ) {
    return this.exchangeRatesService.update(id, dto);
  }

  // ---- Users ----

  @Get('users')
  @ApiOperation({ summary: 'List all users with pagination' })
  @ApiResponse({ status: 200, description: 'Paginated users' })
  listUsers(@Query() dto: PaginationDto) {
    return this.usersService.findAll(dto);
  }

  // ---- Promo Codes ----

  @Get('promo-codes')
  @ApiOperation({ summary: 'List all promo codes' })
  @ApiResponse({ status: 200, description: 'Promo codes list' })
  async listPromoCodes(@Query() dto: PaginationDto) {
    const { page = 1, limit = 20 } = dto;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.promoCode.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.promoCode.count(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  @Post('promo-codes')
  @ApiOperation({ summary: 'Create promo code' })
  @ApiResponse({ status: 201, description: 'Promo code created' })
  async createPromoCode(@Body() dto: CreatePromoCodeDto) {
    return this.prisma.promoCode.create({
      data: {
        code: dto.code,
        discountPct: dto.discountPct ?? null,
        discountAmt: dto.discountAmt ?? null,
        maxUses: dto.maxUses ?? null,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
        isActive: dto.isActive ?? true,
      },
    });
  }

  @Patch('promo-codes/:id')
  @ApiOperation({ summary: 'Update promo code' })
  @ApiResponse({ status: 200, description: 'Promo code updated' })
  async updatePromoCode(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePromoCodeDto,
  ) {
    return this.prisma.promoCode.update({
      where: { id },
      data: {
        ...(dto.code !== undefined && { code: dto.code }),
        ...(dto.discountPct !== undefined && { discountPct: dto.discountPct }),
        ...(dto.discountAmt !== undefined && { discountAmt: dto.discountAmt }),
        ...(dto.maxUses !== undefined && { maxUses: dto.maxUses }),
        ...(dto.expiresAt !== undefined && { expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });
  }

  @Delete('promo-codes/:id')
  @ApiOperation({ summary: 'Delete promo code' })
  @ApiResponse({ status: 200, description: 'Promo code deleted' })
  async deletePromoCode(@Param('id', ParseIntPipe) id: number) {
    await this.prisma.promoCode.delete({ where: { id } });
    return { deleted: true };
  }
}
