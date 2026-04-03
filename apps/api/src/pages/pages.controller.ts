import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { PagesService } from './pages.service';
import {
  CreatePageDto,
  UpdatePageDto,
  CreateFaqDto,
  UpdateFaqDto,
  CreateBannerDto,
  UpdateBannerDto,
} from './pages.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('pages')
@Controller()
export class PagesController {
  constructor(private pagesService: PagesService) {}

  // ---- Public ----

  @Public()
  @Get('pages/:slug')
  @ApiOperation({ summary: 'Get static page by slug' })
  @ApiResponse({ status: 200, description: 'Page found' })
  @ApiResponse({ status: 404, description: 'Page not found' })
  getPage(@Param('slug') slug: string) {
    return this.pagesService.findPageBySlug(slug);
  }

  @Public()
  @Get('faq')
  @ApiOperation({ summary: 'Get all active FAQs' })
  @ApiResponse({ status: 200, description: 'FAQ list' })
  getFaqs() {
    return this.pagesService.findAllFaqs();
  }

  @Public()
  @Get('banners')
  @ApiQuery({ name: 'position', required: false, description: 'Banner position (e.g. HERO)' })
  @ApiOperation({ summary: 'Get active banners by position' })
  @ApiResponse({ status: 200, description: 'Banners list' })
  getBanners(@Query('position') position?: string) {
    return this.pagesService.findBanners(position);
  }

  // ---- Admin Pages ----

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @Get('admin/pages')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: list all pages' })
  adminListPages() {
    return this.pagesService.findAllPages();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @Post('admin/pages')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: create page' })
  adminCreatePage(@Body() dto: CreatePageDto) {
    return this.pagesService.createPage(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @Patch('admin/pages/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: update page' })
  adminUpdatePage(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePageDto,
  ) {
    return this.pagesService.updatePage(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete('admin/pages/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: delete page' })
  adminDeletePage(@Param('id', ParseIntPipe) id: number) {
    return this.pagesService.deletePage(id);
  }

  // ---- Admin FAQ ----

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @Get('admin/faq')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: list all FAQs' })
  adminListFaqs() {
    return this.pagesService.findAllFaqsAdmin();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @Post('admin/faq')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: create FAQ' })
  adminCreateFaq(@Body() dto: CreateFaqDto) {
    return this.pagesService.createFaq(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @Patch('admin/faq/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: update FAQ' })
  adminUpdateFaq(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFaqDto,
  ) {
    return this.pagesService.updateFaq(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete('admin/faq/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: delete FAQ' })
  adminDeleteFaq(@Param('id', ParseIntPipe) id: number) {
    return this.pagesService.deleteFaq(id);
  }

  // ---- Admin Banners ----

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @Get('admin/banners')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: list all banners' })
  adminListBanners() {
    return this.pagesService.findAllBannersAdmin();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @Post('admin/banners')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: create banner' })
  adminCreateBanner(@Body() dto: CreateBannerDto) {
    return this.pagesService.createBanner(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @Patch('admin/banners/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: update banner' })
  adminUpdateBanner(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBannerDto,
  ) {
    return this.pagesService.updateBanner(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete('admin/banners/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: delete banner' })
  adminDeleteBanner(@Param('id', ParseIntPipe) id: number) {
    return this.pagesService.deleteBanner(id);
  }
}
