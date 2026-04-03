import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsPositive } from 'class-validator';

export class IdParamDto {
  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  id: number;
}
