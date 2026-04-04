/**
 * Frontend-side tests for the denomination calculation algorithm.
 * This mirrors the backend Smart Cart logic, tested in isolation
 * without any NestJS/Prisma dependencies.
 */

function calculateDenominations(
  total: number,
  denominations: number[],
): { denomination: number; quantity: number }[] {
  if (total <= 0) return [];

  const sorted = [...denominations].sort((a, b) => b - a);
  const result: { denomination: number; quantity: number }[] = [];
  let remaining = total;

  for (const denom of sorted) {
    if (remaining <= 0) break;
    const count = Math.floor(remaining / denom);
    if (count > 0) {
      result.push({ denomination: denom, quantity: count });
      remaining -= denom * count;
    }
  }

  // Handle overshoot: remaining > 0 means we need one more smallest denomination
  if (remaining > 0) {
    const smallest = sorted[sorted.length - 1];
    const existing = result.find((r) => r.denomination === smallest);
    if (existing) {
      existing.quantity += 1;
    } else {
      result.push({ denomination: smallest, quantity: 1 });
    }
  }

  return result;
}

const TRY_DENOMS = [50, 100, 200, 500, 1000, 2000];
const INR_DENOMS = [500, 1000, 2000, 5000, 10000];
const UAH_DENOMS = [100, 200, 500, 1000, 2000, 5000];

describe('Smart Cart denomination calculation', () => {
  describe('Turkey (TRY)', () => {
    it('700 TL → [500 + 200]', () => {
      const result = calculateDenominations(700, TRY_DENOMS);
      expect(result).toContainEqual({ denomination: 500, quantity: 1 });
      expect(result).toContainEqual({ denomination: 200, quantity: 1 });
      const total = result.reduce((s, r) => s + r.denomination * r.quantity, 0);
      expect(total).toBe(700);
    });

    it('500 TL exact → [500]', () => {
      const result = calculateDenominations(500, TRY_DENOMS);
      expect(result).toEqual([{ denomination: 500, quantity: 1 }]);
    });

    it('1350 TL → total equals 1350 (no overshoot)', () => {
      const result = calculateDenominations(1350, TRY_DENOMS);
      const total = result.reduce((s, r) => s + r.denomination * r.quantity, 0);
      expect(total).toBe(1350);
    });

    it('1350 TL decomposition → [1000 + 200 + 100 + 50]', () => {
      const result = calculateDenominations(1350, TRY_DENOMS);
      expect(result.find((r) => r.denomination === 1000)?.quantity).toBe(1);
      expect(result.find((r) => r.denomination === 200)?.quantity).toBe(1);
      expect(result.find((r) => r.denomination === 100)?.quantity).toBe(1);
      expect(result.find((r) => r.denomination === 50)?.quantity).toBe(1);
    });

    it('150 TL → [100 + 50] exact, no overshoot', () => {
      const result = calculateDenominations(150, TRY_DENOMS);
      const total = result.reduce((s, r) => s + r.denomination * r.quantity, 0);
      expect(total).toBe(150);
    });

    it('160 TL → total >= 160 (requires overshoot since 160 cannot be made exactly)', () => {
      const result = calculateDenominations(160, TRY_DENOMS);
      const total = result.reduce((s, r) => s + r.denomination * r.quantity, 0);
      expect(total).toBeGreaterThanOrEqual(160);
    });

    it('900 TL → [500 + 200×2]', () => {
      const result = calculateDenominations(900, TRY_DENOMS);
      const total = result.reduce((s, r) => s + r.denomination * r.quantity, 0);
      expect(total).toBe(900);
      expect(result.find((r) => r.denomination === 500)?.quantity).toBe(1);
      expect(result.find((r) => r.denomination === 200)?.quantity).toBe(2);
    });

    it('2000 TL → [2000×1]', () => {
      const result = calculateDenominations(2000, TRY_DENOMS);
      expect(result).toEqual([{ denomination: 2000, quantity: 1 }]);
    });

    it('4000 TL → [2000×2]', () => {
      const result = calculateDenominations(4000, TRY_DENOMS);
      expect(result).toEqual([{ denomination: 2000, quantity: 2 }]);
    });

    it('0 TL → empty result', () => {
      const result = calculateDenominations(0, TRY_DENOMS);
      expect(result).toEqual([]);
    });
  });

  describe('India (INR)', () => {
    it('1500 INR → [1000 + 500]', () => {
      const result = calculateDenominations(1500, INR_DENOMS);
      expect(result).toContainEqual({ denomination: 1000, quantity: 1 });
      expect(result).toContainEqual({ denomination: 500, quantity: 1 });
      const total = result.reduce((s, r) => s + r.denomination * r.quantity, 0);
      expect(total).toBe(1500);
    });

    it('5000 INR exact → [5000]', () => {
      const result = calculateDenominations(5000, INR_DENOMS);
      expect(result).toEqual([{ denomination: 5000, quantity: 1 }]);
    });

    it('amount below smallest denomination → overshoot to smallest', () => {
      // 300 INR cannot be made from [500, 1000, 2000, 5000, 10000]
      const result = calculateDenominations(300, INR_DENOMS);
      const total = result.reduce((s, r) => s + r.denomination * r.quantity, 0);
      expect(total).toBeGreaterThanOrEqual(300);
      expect(total).toBe(500); // rounds up to smallest denomination
    });
  });

  describe('Ukraine (UAH)', () => {
    it('1200 UAH → [1000 + 200]', () => {
      const result = calculateDenominations(1200, UAH_DENOMS);
      expect(result).toContainEqual({ denomination: 1000, quantity: 1 });
      expect(result).toContainEqual({ denomination: 200, quantity: 1 });
      const total = result.reduce((s, r) => s + r.denomination * r.quantity, 0);
      expect(total).toBe(1200);
    });

    it('5000 UAH → [5000×1]', () => {
      const result = calculateDenominations(5000, UAH_DENOMS);
      expect(result).toEqual([{ denomination: 5000, quantity: 1 }]);
    });
  });

  describe('Edge cases', () => {
    it('exact match at every denomination level produces no remainder', () => {
      for (const denom of TRY_DENOMS) {
        const result = calculateDenominations(denom, TRY_DENOMS);
        const total = result.reduce((s, r) => s + r.denomination * r.quantity, 0);
        expect(total).toBe(denom);
      }
    });

    it('result total is always >= requested amount', () => {
      const amounts = [50, 99, 150, 160, 350, 701, 999, 1234, 3333];
      for (const amount of amounts) {
        const result = calculateDenominations(amount, TRY_DENOMS);
        const total = result.reduce((s, r) => s + r.denomination * r.quantity, 0);
        expect(total).toBeGreaterThanOrEqual(amount);
      }
    });

    it('overshoot is always less than the smallest denomination', () => {
      const smallest = Math.min(...TRY_DENOMS);
      const amounts = [51, 99, 160, 251, 601, 1001];
      for (const amount of amounts) {
        const result = calculateDenominations(amount, TRY_DENOMS);
        const total = result.reduce((s, r) => s + r.denomination * r.quantity, 0);
        const overshoot = total - amount;
        expect(overshoot).toBeLessThan(smallest);
      }
    });
  });
});
