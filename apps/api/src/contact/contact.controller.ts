import { Controller, Post, Body, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { Public } from '../common/decorators/public.decorator';
import { CreateContactDto } from './contact.dto';

@ApiTags('contact')
@Controller('contact')
export class ContactController {
  private readonly logger = new Logger(ContactController.name);

  constructor(private configService: ConfigService) {}

  @Public()
  @Post()
  @ApiOperation({ summary: 'Submit contact form' })
  @ApiResponse({
    status: 201,
    description: 'Message received',
    schema: {
      example: { success: true, message: 'Ваше сообщение получено' },
    },
  })
  async submit(@Body() dto: CreateContactDto) {
    const emailHost = this.configService.get<string>('EMAIL_HOST');

    if (emailHost) {
      // Production: would send via nodemailer/sendgrid, but no install allowed here
      this.logger.log(
        `[CONTACT] Email would be sent via ${emailHost}: from=${dto.email} name=${dto.name}`,
      );
    } else {
      // Development: log to console
      this.logger.log(
        `[CONTACT FORM] Name: ${dto.name} | Email: ${dto.email} | Message: ${dto.message}`,
      );
    }

    return { success: true, message: 'Ваше сообщение получено' };
  }
}
