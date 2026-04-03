import {
  Controller,
  Post,
  Body,
  Headers,
  Logger,
  HttpCode,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Request } from 'express';
import { YookassaService } from '../payments/yookassa.service';
import { PaymentsService } from '../payments/payments.service';
import { DeliveryService } from './delivery.service';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('webhooks')
@Controller('webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor(
    private yookassa: YookassaService,
    private paymentsService: PaymentsService,
    private deliveryService: DeliveryService,
  ) {}

  @Public()
  @Post('yookassa')
  @HttpCode(200)
  @ApiOperation({ summary: 'YooKassa payment webhook' })
  @ApiResponse({ status: 200, description: 'Webhook processed' })
  async handleYookassaWebhook(
    @Body() body: any,
    @Headers('x-signature') signature: string,
    @Req() req: Request,
  ) {
    const rawBody = (req as any).rawBody
      ? (req as any).rawBody.toString()
      : JSON.stringify(body);

    // Verify signature
    const isValid = this.yookassa.verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      this.logger.warn('Invalid YooKassa webhook signature');
      // Return 200 to prevent retries, but don't process
      return { ok: false };
    }

    const event = body?.event;
    const paymentId = body?.object?.id;

    this.logger.log(`YooKassa webhook: ${event} for paymentId=${paymentId}`);

    if (!paymentId) return { ok: false };

    if (event === 'payment.succeeded') {
      const order = await this.paymentsService.handleSuccessfulPayment(paymentId);
      if (order) {
        // Trigger auto-delivery asynchronously
        this.deliveryService.autoDeliver(order.id).catch((err) => {
          this.logger.error(`Auto-delivery error: ${err.message}`);
        });
      }
    } else if (event === 'payment.canceled') {
      await this.paymentsService.handleCanceledPayment(paymentId);
    } else if (event === 'refund.succeeded') {
      this.logger.log(`Refund succeeded for paymentId=${paymentId}`);
      // Optional: handle refund logic
    }

    return { ok: true };
  }
}
