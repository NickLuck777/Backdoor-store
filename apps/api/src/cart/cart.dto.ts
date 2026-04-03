import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsPositive,
  IsString,
  Min,
  IsOptional,
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

export class CalculateCartDto {
  @ApiProperty({ enum: Region })
  @IsEnum(Region)
  region: Region;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sessionId?: string;
}
