import { Injectable, BadRequestException } from '@nestjs/common';

export interface ParsedCsvResult<T = Record<string, string>> {
  rows: T[];
  errors: string[];
}

@Injectable()
export class FileUploadService {
  /**
   * Parse raw CSV string into typed rows.
   * Validates that all requiredColumns are present in the header.
   */
  parseCsv<T = Record<string, string>>(
    csvContent: string,
    requiredColumns: string[] = [],
  ): ParsedCsvResult<T> {
    const errors: string[] = [];
    const rows: T[] = [];

    if (!csvContent || !csvContent.trim()) {
      throw new BadRequestException('CSV content is empty');
    }

    const lines = csvContent.trim().split(/\r?\n/);
    if (lines.length < 2) {
      throw new BadRequestException('CSV must contain a header row and at least one data row');
    }

    // Parse header
    const headerLine = lines[0];
    const headers = this.parseCsvLine(headerLine);

    // Validate required columns
    for (const required of requiredColumns) {
      if (!headers.includes(required)) {
        throw new BadRequestException(
          `Required column "${required}" not found in CSV headers: ${headers.join(', ')}`,
        );
      }
    }

    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      try {
        const values = this.parseCsvLine(line);
        if (values.length !== headers.length) {
          errors.push(
            `Line ${i + 1}: expected ${headers.length} columns, got ${values.length}`,
          );
          continue;
        }

        const row: Record<string, string> = {};
        for (let j = 0; j < headers.length; j++) {
          row[headers[j]] = values[j] ?? '';
        }
        rows.push(row as unknown as T);
      } catch (e) {
        errors.push(`Line ${i + 1}: ${(e as Error).message}`);
      }
    }

    return { rows, errors };
  }

  /**
   * Parse a single CSV line respecting quoted fields.
   */
  private parseCsvLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const ch = line[i];

      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // Escaped quote
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }

    result.push(current.trim());
    return result;
  }

  /**
   * Extract text content from a Buffer (for multipart uploads).
   * Accepts UTF-8 encoded CSV files.
   */
  bufferToCsv(buffer: Buffer): string {
    return buffer.toString('utf-8');
  }
}
