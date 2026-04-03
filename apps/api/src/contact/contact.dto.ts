import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class CreateContactDto {
  @ApiProperty({ example: 'Ivan Petrov' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'ivan@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'I have a question about my order...' })
  @IsString()
  @MinLength(5)
  @MaxLength(2000)
  message: string;
}
