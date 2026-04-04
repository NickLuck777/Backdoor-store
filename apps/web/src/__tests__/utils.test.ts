import { formatPrice, formatDiscount, cn } from '@/lib/utils';

describe('formatPrice', () => {
  it('formats RUB price and contains major digits', () => {
    const formatted = formatPrice(1500);
    // The formatted string "1 500 ₽" or "1 500,00 ₽" must contain the digits
    expect(formatted).toContain('1');
    expect(formatted).toContain('500');
  });

  it('handles zero price', () => {
    const formatted = formatPrice(0);
    expect(formatted).toBeDefined();
    expect(formatted).toContain('0');
  });

  it('formats large price correctly', () => {
    const formatted = formatPrice(10000);
    expect(formatted).toContain('10');
    expect(formatted).toContain('000');
  });

  it('includes RUB currency symbol or code', () => {
    const formatted = formatPrice(1000);
    // ru-RU locale renders ₽ or RUB
    expect(formatted).toMatch(/₽|RUB/);
  });

  it('accepts custom currency parameter', () => {
    const formatted = formatPrice(100, 'USD');
    expect(formatted).toBeDefined();
    expect(formatted).toContain('100');
  });
});

describe('formatDiscount', () => {
  it('formats 50% discount as -50%', () => {
    expect(formatDiscount(50)).toBe('-50%');
  });

  it('formats 30% discount as -30%', () => {
    expect(formatDiscount(30)).toBe('-30%');
  });

  it('formats 0% discount as -0%', () => {
    expect(formatDiscount(0)).toBe('-0%');
  });

  it('formats 100% discount as -100%', () => {
    expect(formatDiscount(100)).toBe('-100%');
  });

  it('always starts with minus sign', () => {
    expect(formatDiscount(15)).toMatch(/^-/);
  });

  it('always ends with percent sign', () => {
    expect(formatDiscount(15)).toMatch(/%$/);
  });
});

describe('cn', () => {
  it('merges two class names', () => {
    const result = cn('foo', 'bar');
    expect(result).toContain('foo');
    expect(result).toContain('bar');
  });

  it('handles conditional false class (not included)', () => {
    const result = cn('base', false && 'hidden');
    expect(result).not.toContain('hidden');
    expect(result).toContain('base');
  });

  it('handles conditional true class (included)', () => {
    const result = cn('base', true && 'active');
    expect(result).toContain('active');
    expect(result).toContain('base');
  });

  it('handles undefined values gracefully', () => {
    const result = cn('base', undefined);
    expect(result).toContain('base');
  });

  it('handles empty string input', () => {
    const result = cn('foo', '');
    expect(result).toContain('foo');
  });

  it('merges conflicting Tailwind classes (last wins)', () => {
    // tailwind-merge should resolve conflicts: p-2 vs p-4 → p-4
    const result = cn('p-2', 'p-4');
    expect(result).toContain('p-4');
    expect(result).not.toContain('p-2');
  });
});
