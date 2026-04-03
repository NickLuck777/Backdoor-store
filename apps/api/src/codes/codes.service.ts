import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CodeStatus, Currency } from '@prisma/client';

interface NeededCard {
  denomination: number;
  currency: Currency;
  quantity: number;
}

@Injectable()
export class CodesService {
  constructor(private prisma: PrismaService) {}

  async importFromCsv(csvContent: string) {
    const lines = csvContent.trim().split('\n');
    if (lines.length === 0) throw new BadRequestException('Empty CSV');

    // Determine if first line is header
    const firstLine = lines[0].trim().toLowerCase();
    const hasHeader =
      firstLine.includes('code') ||
      firstLine.includes('denomination') ||
      firstLine.includes('currency');

    const dataLines = hasHeader ? lines.slice(1) : lines;

    const parsed: Array<{ code: string; denomination: number; currency: Currency }> = [];
    const errors: string[] = [];

    for (let i = 0; i < dataLines.length; i++) {
      const line = dataLines[i].trim();
      if (!line) continue;

      const parts = line.split(',').map((p) => p.trim().replace(/"/g, ''));
      if (parts.length < 3) {
        errors.push(`Line ${i + 2}: invalid format`);
        continue;
      }

      const [code, denominationStr, currencyStr] = parts;
      const denomination = parseFloat(denominationStr);

      if (!code || isNaN(denomination) || denomination <= 0) {
        errors.push(`Line ${i + 2}: invalid code or denomination`);
        continue;
      }

      const currency = currencyStr.toUpperCase() as Currency;
      if (!Object.values(Currency).includes(currency)) {
        errors.push(`Line ${i + 2}: invalid currency ${currencyStr}`);
        continue;
      }

      parsed.push({ code, denomination, currency });
    }

    if (errors.length > 0 && parsed.length === 0) {
      throw new BadRequestException({ message: 'CSV parsing failed', errors });
    }

    // Get existing codes to skip duplicates
    const existingCodes = await this.prisma.topUpCode.findMany({
      where: { code: { in: parsed.map((p) => p.code) } },
      select: { code: true },
    });
    const existingSet = new Set(existingCodes.map((e) => e.code));

    const toInsert = parsed.filter((p) => !existingSet.has(p.code));
    const skipped = parsed.length - toInsert.length;

    if (toInsert.length > 0) {
      await this.prisma.topUpCode.createMany({
        data: toInsert,
        skipDuplicates: true,
      });
    }

    return {
      imported: toInsert.length,
      skipped,
      errors,
      total: parsed.length,
    };
  }

  async getInventory() {
    const codes = await this.prisma.topUpCode.groupBy({
      by: ['currency', 'denomination', 'status'],
      _count: { _all: true },
    });

    const grouped: Record<
      string,
      { currency: Currency; denomination: number; available: number; reserved: number; sold: number; total: number }
    > = {};

    for (const row of codes) {
      const key = `${row.currency}:${row.denomination}`;
      if (!grouped[key]) {
        grouped[key] = {
          currency: row.currency,
          denomination: Number(row.denomination),
          available: 0,
          reserved: 0,
          sold: 0,
          total: 0,
        };
      }
      const count = row._count._all;
      grouped[key].total += count;
      if (row.status === CodeStatus.AVAILABLE) grouped[key].available += count;
      if (row.status === CodeStatus.RESERVED) grouped[key].reserved += count;
      if (row.status === CodeStatus.SOLD) grouped[key].sold += count;
    }

    return Object.values(grouped).sort((a, b) => {
      if (a.currency !== b.currency) return a.currency.localeCompare(b.currency);
      return a.denomination - b.denomination;
    });
  }

  async getLowStockAlerts(threshold = 5) {
    const inventory = await this.getInventory();
    return inventory.filter((item) => item.available < threshold);
  }

  async reserveForOrder(orderId: number, neededCards: NeededCard[]) {
    const results = [];

    for (const needed of neededCards) {
      for (let i = 0; i < needed.quantity; i++) {
        const code = await this.prisma.topUpCode.findFirst({
          where: {
            denomination: needed.denomination,
            currency: needed.currency,
            status: CodeStatus.AVAILABLE,
          },
        });

        if (!code) {
          throw new NotFoundException(
            `No available codes for ${needed.denomination} ${needed.currency}`,
          );
        }

        await this.prisma.topUpCode.update({
          where: { id: code.id },
          data: { status: CodeStatus.RESERVED, orderId },
        });

        results.push(code);
      }
    }

    return results;
  }

  async releaseReserved(orderId: number) {
    const result = await this.prisma.topUpCode.updateMany({
      where: { orderId, status: CodeStatus.RESERVED },
      data: { status: CodeStatus.AVAILABLE, orderId: null },
    });
    return { released: result.count };
  }

  async markAsSold(orderId: number) {
    const result = await this.prisma.topUpCode.updateMany({
      where: { orderId, status: CodeStatus.RESERVED },
      data: { status: CodeStatus.SOLD, usedAt: new Date() },
    });
    return { sold: result.count };
  }

  async getCodesForOrder(orderId: number) {
    return this.prisma.topUpCode.findMany({
      where: { orderId },
      orderBy: [{ currency: 'asc' }, { denomination: 'asc' }],
    });
  }
}
