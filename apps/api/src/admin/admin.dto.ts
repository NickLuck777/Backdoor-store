import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { OrderStatus } from '@prisma/client';

// ---- Orders ----

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: OrderStatus })
  @IsEnum(OrderStatus)
  status: OrderStatus;
}

// ---- Codes ----

export class UpdateThresholdDto {
  @ApiProperty({ description: 'Low stock alert threshold', minimum: 1 })
  @IsInt()
  @IsPositive()
  threshold: number;
}

// ---- Products bulk discount ----

export class BulkDiscountAdminDto {
  @ApiProperty({ type: [Number] })
  @IsArray()
  @IsInt({ each: true })
  productIds: number[];

  @ApiProperty({ minimum: 0, maximum: 100 })
  @IsInt()
  @Min(0)
  @Max(100)
  discountPct: number;
}

// ---- Categories reorder ----

class ReorderItemDto {
  @ApiProperty()
  @IsInt()
  id: number;

  @ApiProperty()
  @IsInt()
  sortOrder: number;
}

export class ReorderCategoriesAdminDto {
  @ApiProperty({ type: [ReorderItemDto] })
  @IsArray()
  @Type(() => ReorderItemDto)
  items: ReorderItemDto[];
}

// ---- Promo codes ----

export class CreatePromoCodeDto {
  @ApiProperty({ example: 'SUMMER20' })
  @IsString()
  @MinLength(1)
  code: string;

  @ApiPropertyOptional({ description: 'Discount percentage (0-100)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discountPct?: number;

  @ApiPropertyOptional({ description: 'Fixed discount amount in RUB' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountAmt?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @IsPositive()
  maxUses?: number;

  @ApiPropertyOptional({ description: 'Expiry date ISO string' })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;
}

export class UpdatePromoCodeDto extends PartialType(CreatePromoCodeDto) {}
