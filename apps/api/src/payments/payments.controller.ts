import {
  Controller,
  Post,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('payments')
@Controller('orders')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Public()
  @Post(':id/pay')
  @ApiOperation({ summary: 'Initiate payment for order' })
  @ApiResponse({ status: 201, description: 'Payment initiated, returns paymentUrl' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  initiatePayment(@Param('id', ParseIntPipe) id: number) {
    return this.paymentsService.initiatePayment(id);
  }
}
