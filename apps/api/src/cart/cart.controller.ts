import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddCartItemDto, UpdateCartItemDto, CalculateCartDto } from './cart.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';

function getSessionId(req: any): string {
  return req.cookies?.sessionId ?? req.headers['x-session-id'] ?? 'anonymous';
}

@ApiTags('cart')
@Controller('cart')
export class CartController {
  constructor(private cartService: CartService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get current cart' })
  @ApiResponse({ status: 200, description: 'Cart contents' })
  getCart(@Request() req: any) {
    const userId = req.user?.id;
    const sessionId = getSessionId(req);
    return this.cartService.getCart(userId, sessionId);
  }

  @Public()
  @Post('items')
  @ApiOperation({ summary: 'Add item to cart' })
  @ApiResponse({ status: 201, description: 'Item added' })
  addItem(@Request() req: any, @Body() dto: AddCartItemDto) {
    const userId = req.user?.id;
    const sessionId = getSessionId(req);
    return this.cartService.addItem(userId, sessionId, dto.productId, dto.quantity);
  }

  @Public()
  @Patch('items/:id')
  @ApiOperation({ summary: 'Update cart item quantity' })
  @ApiResponse({ status: 200, description: 'Item updated' })
  updateItem(
    @Request() req: any,
    @Param('id') itemId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    const userId = req.user?.id;
    const sessionId = getSessionId(req);
    return this.cartService.updateItem(userId, sessionId, itemId, dto.quantity);
  }

  @Public()
  @Delete('items/:id')
  @ApiOperation({ summary: 'Remove item from cart' })
  @ApiResponse({ status: 200, description: 'Item removed' })
  removeItem(@Request() req: any, @Param('id') itemId: string) {
    const userId = req.user?.id;
    const sessionId = getSessionId(req);
    return this.cartService.removeItem(userId, sessionId, itemId);
  }

  @Public()
  @Delete()
  @ApiOperation({ summary: 'Clear cart' })
  @ApiResponse({ status: 200, description: 'Cart cleared' })
  async clearCart(@Request() req: any) {
    const userId = req.user?.id;
    const sessionId = getSessionId(req);
    await this.cartService.clearCart(userId, sessionId);
    return { cleared: true };
  }

  @Public()
  @Post('calculate')
  @ApiOperation({ summary: 'Calculate smart cart (denomination breakdown)' })
  @ApiResponse({ status: 200, description: 'Smart cart calculation result' })
  calculate(@Request() req: any, @Body() dto: CalculateCartDto) {
    const userId = req.user?.id;
    const sessionId = getSessionId(req);
    return this.cartService.calculateSmartCart(userId, sessionId, dto.region);
  }
}
