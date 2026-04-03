import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ExchangeRatesService } from '../exchange-rates/exchange-rates.service';
import { Currency, Region } from '@prisma/client';

export const DENOMINATIONS: Record<Currency, number[]> = {
  TRY: [50, 100, 200, 500, 1000, 2000],
  INR: [500, 1000, 2000, 5000, 10000],
  UAH: [100, 200, 500, 1000, 2000, 5000],
};

export const REGION_CURRENCY: Record<Region, Currency> = {
  TURKEY: Currency.TRY,
  INDIA: Currency.INR,
  UKRAINE: Currency.UAH,
};

export interface SmartCartInput {
  items: Array<{ productSlug: string; quantity: number }>;
  region: Region;
}

export interface SmartCartCard {
  denomination: number;
  currency: Currency;
  quantity: number;
  priceInRub: number;
  totalInRub: number;
}

export interface SmartCartResultItem {
  product: {
    id: number;
    slug: string;
    title: string;
    price: number;
    region: Region;
    imageUrl: string | null;
  };
  quantity: number;
  priceInRegionalCurrency: number;
}

export interface SmartCartResult {
  items: SmartCartResultItem[];
  cards: SmartCartCard[];
  totalInRegionalCurrency: number;
  totalInRub: number;
  overshootInRegionalCurrency: number;
  overshootInRub: number;
}

@Injectable()
export class SmartCartService {
  constructor(
    private prisma: PrismaService,
    private exchangeRatesService: ExchangeRatesService,
  ) {}

  async calculate(input: SmartCartInput): Promise<SmartCartResult> {
    const { items, region } = input;
    const currency = REGION_CURRENCY[region];

    if (!currency) {
      throw new BadRequestException(`Unsupported region: ${region}`);
    }

    // 1. Fetch all products by slug
    const slugs = items.map((i) => i.productSlug);
    const products = await this.prisma.product.findMany({
      where: { slug: { in: slugs } },
    });

    const productMap = new Map(products.map((p) => [p.slug, p]));

    // 2. Validate regions and build result items
    const resultItems: SmartCartResultItem[] = [];
    let totalInRegionalCurrency = 0;

    for (const item of items) {
      const product = productMap.get(item.productSlug);
      if (!product) {
        throw new BadRequestException(`Product not found: ${item.productSlug}`);
      }

      if (product.region !== region) {
        throw new BadRequestException(
          `Mixed regions not allowed. Product ${item.productSlug} is from ${product.region}, expected ${region}`,
        );
      }

      const price = Number(product.price);
      const lineTotal = price * item.quantity;
      totalInRegionalCurrency += lineTotal;

      resultItems.push({
        product: {
          id: product.id,
          slug: product.slug,
          title: product.title,
          price,
          region: product.region,
          imageUrl: product.imageUrl,
        },
        quantity: item.quantity,
        priceInRegionalCurrency: price,
      });
    }

    // 3. Edge case: empty cart
    if (totalInRegionalCurrency === 0) {
      return {
        items: resultItems,
        cards: [],
        totalInRegionalCurrency: 0,
        totalInRub: 0,
        overshootInRegionalCurrency: 0,
        overshootInRub: 0,
      };
    }

    // 4. Greedy algorithm for denomination selection
    const denominations = [...DENOMINATIONS[currency]].sort((a, b) => b - a); // descending
    const cards = this.greedyDenominations(
      totalInRegionalCurrency,
      denominations,
    );

    // 5. Convert cards to RUB
    const effectiveRate =
      await this.exchangeRatesService.getRateWithMargin(currency);

    const smartCards: SmartCartCard[] = cards.map(
      ({ denomination, quantity }) => {
        const priceInRub = denomination * effectiveRate;
        return {
          denomination,
          currency,
          quantity,
          priceInRub: Math.round(priceInRub * 100) / 100,
          totalInRub: Math.round(priceInRub * quantity * 100) / 100,
        };
      },
    );

    const totalCardsInRegional = cards.reduce(
      (sum, c) => sum + c.denomination * c.quantity,
      0,
    );
    const overshootInRegionalCurrency =
      totalCardsInRegional - totalInRegionalCurrency;
    const totalInRub = smartCards.reduce((sum, c) => sum + c.totalInRub, 0);
    const overshootInRub =
      overshootInRegionalCurrency > 0
        ? overshootInRegionalCurrency * effectiveRate
        : 0;

    return {
      items: resultItems,
      cards: smartCards,
      totalInRegionalCurrency,
      totalInRub: Math.round(totalInRub * 100) / 100,
      overshootInRegionalCurrency,
      overshootInRub: Math.round(overshootInRub * 100) / 100,
    };
  }

  async calculateFromIds(
    items: Array<{ productId: number; quantity: number }>,
    region: Region,
  ): Promise<SmartCartResult> {
    const currency = REGION_CURRENCY[region];
    if (!currency) {
      throw new BadRequestException(`Unsupported region: ${region}`);
    }

    const ids = items.map((i) => i.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: ids } },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));
    const resultItems: SmartCartResultItem[] = [];
    let totalInRegionalCurrency = 0;

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new BadRequestException(`Product not found: id=${item.productId}`);
      }
      if (product.region !== region) {
        throw new BadRequestException(
          `Mixed regions not allowed. Product id=${item.productId} is from ${product.region}, expected ${region}`,
        );
      }
      const price = Number(product.price);
      totalInRegionalCurrency += price * item.quantity;
      resultItems.push({
        product: {
          id: product.id,
          slug: product.slug,
          title: product.title,
          price,
          region: product.region,
          imageUrl: product.imageUrl,
        },
        quantity: item.quantity,
        priceInRegionalCurrency: price,
      });
    }

    if (totalInRegionalCurrency === 0) {
      return {
        items: resultItems,
        cards: [],
        totalInRegionalCurrency: 0,
        totalInRub: 0,
        overshootInRegionalCurrency: 0,
        overshootInRub: 0,
      };
    }

    const denominations = [...DENOMINATIONS[currency]].sort((a, b) => b - a);
    const cards = this.greedyDenominations(totalInRegionalCurrency, denominations);
    const effectiveRate = await this.exchangeRatesService.getRateWithMargin(currency);

    const smartCards: SmartCartCard[] = cards.map(({ denomination, quantity }) => {
      const priceInRub = denomination * effectiveRate;
      return {
        denomination,
        currency,
        quantity,
        priceInRub: Math.round(priceInRub * 100) / 100,
        totalInRub: Math.round(priceInRub * quantity * 100) / 100,
      };
    });

    const totalCardsInRegional = cards.reduce((s, c) => s + c.denomination * c.quantity, 0);
    const overshootInRegionalCurrency = totalCardsInRegional - totalInRegionalCurrency;
    const totalInRub = smartCards.reduce((s, c) => s + c.totalInRub, 0);
    const overshootInRub = overshootInRegionalCurrency > 0
      ? overshootInRegionalCurrency * effectiveRate
      : 0;

    return {
      items: resultItems,
      cards: smartCards,
      totalInRegionalCurrency,
      totalInRub: Math.round(totalInRub * 100) / 100,
      overshootInRegionalCurrency,
      overshootInRub: Math.round(overshootInRub * 100) / 100,
    };
  }

  /**
   * Greedy algorithm: selects minimum denominations that cover `total`.
   * Sorts denominations descending. Uses as many of each as possible without
   * overshooting, then adds one smallest denomination that covers the remainder.
   */
  greedyDenominations(
    total: number,
    denominationsSortedDesc: number[],
  ): Array<{ denomination: number; quantity: number }> {
    const result: Array<{ denomination: number; quantity: number }> = [];
    let remaining = total;

    for (const denom of denominationsSortedDesc) {
      if (remaining <= 0) break;
      const count = Math.floor(remaining / denom);
      if (count > 0) {
        result.push({ denomination: denom, quantity: count });
        remaining -= denom * count;
      }
    }

    // If there's still remainder, add one smallest denom that covers it
    if (remaining > 0) {
      const smallestSufficient = [...denominationsSortedDesc]
        .reverse()
        .find((d) => d >= remaining);
      const smallest = denominationsSortedDesc[denominationsSortedDesc.length - 1];
      const chosen = smallestSufficient ?? smallest;

      // Merge with existing entry if same denomination
      const existing = result.find((r) => r.denomination === chosen);
      if (existing) {
        existing.quantity += 1;
      } else {
        result.push({ denomination: chosen, quantity: 1 });
      }
    }

    // Sort result ascending by denomination for readability
    return result.sort((a, b) => a.denomination - b.denomination);
  }
}
