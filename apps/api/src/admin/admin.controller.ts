import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  Res,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { Response } from 'express';
import { AdminService } from './admin.service';
import { OrdersService } from '../orders/orders.service';
import { CodesService } from '../codes/codes.service';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole, OrderStatus } from '@prisma/client';
import { FilterOrdersDto } from '../orders/orders.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { IsEnum, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class UpdateOrderStatusDto {
  @ApiProperty({ enum: OrderStatus })
  @IsEnum(OrderStatus)
  status: OrderStatus;
}

class ImportCsvBodyDto {
  @ApiProperty()
  @IsString()
  csv: string;
}

@ApiTags('admin')
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

  // ---- Codes ----

  @Post('codes/import')
  @ApiOperation({ summary: 'Import top-up codes from CSV' })
  @ApiResponse({ status: 201, description: 'Codes imported' })
  importCodes(@Body() dto: ImportCsvBodyDto) {
    return this.codesService.importFromCsv(dto.csv);
  }

  @Get('codes/inventory')
  @ApiOperation({ summary: 'Get codes inventory' })
  @ApiResponse({ status: 200, description: 'Inventory grouped by currency/denomination' })
  getInventory() {
    return this.codesService.getInventory();
  }

  @Get('codes/alerts')
  @ApiQuery({ name: 'threshold', required: false })
  @ApiOperation({ summary: 'Get low stock alerts' })
  @ApiResponse({ status: 200, description: 'Low stock items' })
  getAlerts(@Query('threshold') threshold?: string) {
    return this.codesService.getLowStockAlerts(threshold ? parseInt(threshold) : 5);
  }

  // ---- Users ----

  @Get('users')
  @ApiOperation({ summary: 'List all users' })
  @ApiResponse({ status: 200, description: 'Paginated users' })
  listUsers(@Query() dto: PaginationDto) {
    return this.usersService.findAll(dto);
  }
}
