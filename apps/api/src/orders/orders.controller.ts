import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './orders.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Public()
  @Post()
  @ApiOperation({ summary: 'Create order from cart' })
  @ApiResponse({ status: 201, description: 'Order created' })
  @ApiResponse({ status: 400, description: 'Invalid cart or products' })
  create(@Body() dto: CreateOrderDto, @Request() req: any) {
    const userId = req.user?.id;
    return this.ordersService.create(dto, userId);
  }

  @Public()
  @Get(':orderNumber')
  @ApiOperation({ summary: 'Get order status by order number (public)' })
  @ApiResponse({ status: 200, description: 'Order found' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  findOne(@Param('orderNumber') orderNumber: string) {
    return this.ordersService.findOne(orderNumber);
  }
}

@ApiTags('orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('user/orders')
export class UserOrdersController {
  constructor(private ordersService: OrdersService) {}

  @Get()
  @ApiOperation({ summary: "Get authenticated user's orders" })
  @ApiResponse({ status: 200, description: 'User orders list' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getMyOrders(@Request() req: any) {
    return this.ordersService.findByUser(req.user.id);
  }
}
