import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiProperty,
} from '@nestjs/swagger';
import { CodesService } from './codes.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { IsString } from 'class-validator';

class ImportCsvDto {
  @ApiProperty({ description: 'CSV content: code,denomination,currency per line' })
  @IsString()
  csv: string;
}

@ApiTags('codes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MANAGER)
@Controller('codes')
export class CodesController {
  constructor(private codesService: CodesService) {}

  @Post('import')
  @ApiOperation({ summary: 'Import top-up codes from CSV (admin)' })
  @ApiResponse({ status: 201, description: 'Codes imported' })
  @ApiResponse({ status: 400, description: 'Invalid CSV format' })
  importCsv(@Body() dto: ImportCsvDto) {
    return this.codesService.importFromCsv(dto.csv);
  }

  @Get('inventory')
  @ApiOperation({ summary: 'Get code inventory grouped by currency and denomination (admin)' })
  @ApiResponse({ status: 200, description: 'Inventory data' })
  getInventory() {
    return this.codesService.getInventory();
  }

  @Get('alerts')
  @ApiQuery({ name: 'threshold', required: false, description: 'Low stock threshold (default 5)' })
  @ApiOperation({ summary: 'Get low stock alerts (admin)' })
  @ApiResponse({ status: 200, description: 'Low stock denominations' })
  getLowStockAlerts(@Query('threshold') threshold?: string) {
    return this.codesService.getLowStockAlerts(threshold ? parseInt(threshold) : 5);
  }
}
