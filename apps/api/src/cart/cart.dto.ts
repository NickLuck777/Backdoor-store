import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsPositive,
  IsString,
  Min,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Region } from '@prisma/client';

export class AddCartItemDto {
  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  productId: number;

  @ApiProperty({ default: 1 })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  quantity: number = 1;
}

export class UpdateCartItemDto {
  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  quantity: number;
}

export class CalculateCartItemDto {
  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  productId: number;

  @ApiProperty({ default: 1 })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  quantity: number = 1;
}

export class CalculateCartDto {
  @ApiProperty({ enum: Region })
  @IsEnum(Region)
  region: Region;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sessionId?: string;

  // The frontend keeps cart state purely in Zustand/localStorage and never
  // syncs items to the backend Redis cart. When this field is provided we
  // calculate the smart-cart breakdown directly from the supplied items
  // instead of reading from Redis (which would be empty). When omitted we
  // fall back to Redis-cart behavior for clients that DO sync (admin tools,
  // future server-side flows).
  @ApiPropertyOptional({ type: [CalculateCartItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CalculateCartItemDto)
  items?: CalculateCartItemDto[];
}
