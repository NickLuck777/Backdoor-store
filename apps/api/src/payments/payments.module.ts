import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { YookassaService } from './yookassa.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [PaymentsService, YookassaService],
  controllers: [PaymentsController],
  exports: [PaymentsService, YookassaService],
})
export class PaymentsModule {}
