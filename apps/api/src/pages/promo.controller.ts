import { Controller, Post, Body } from '@nestjs/common';
import { ApiProperty, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { Public } from '../common/decorators/public.decorator';
import { IsNumber, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

class ValidatePromoDto {
  @ApiProperty()
  @IsString()
  code: string;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  totalAmount: number;
}

@ApiTags('promo')
@Controller('promo')
export class PromoController {
  constructor(private prisma: PrismaService) {}

  @Public()
  @Post('validate')
  @ApiOperation({ summary: 'Validate promo code and calculate discounted total' })
  @ApiResponse({ status: 200, description: 'Promo validation result' })
  async validatePromo(@Body() dto: ValidatePromoDto) {
    const promo = await this.prisma.promoCode.findUnique({
      where: { code: dto.code },
    });

    if (
      !promo ||
      !promo.isActive ||
      (promo.expiresAt && promo.expiresAt < new Date()) ||
      (promo.maxUses !== null && promo.usedCount >= promo.maxUses)
    ) {
      return {
        valid: false,
        discountedTotal: dto.totalAmount,
      };
    }

    let discount = 0;
    if (promo.discountPct) {
      discount = (dto.totalAmount * promo.discountPct) / 100;
    } else if (promo.discountAmt) {
      discount = Math.min(Number(promo.discountAmt), dto.totalAmount);
    }

    const discountedTotal = Math.max(0, dto.totalAmount - discount);

    return {
      valid: true,
      discountPct: promo.discountPct ?? undefined,
      discountAmt: promo.discountAmt ? Number(promo.discountAmt) : undefined,
      discountedTotal,
    };
  }
}
