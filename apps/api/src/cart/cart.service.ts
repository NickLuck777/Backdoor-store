import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { v4 as uuidv4 } from 'uuid';
import { SmartCartService } from './smart-cart.service';
import { Region } from '@prisma/client';

const CART_TTL = 7 * 24 * 60 * 60; // 7 days in seconds

export interface CartItem {
  id: string;
  productId: number;
  quantity: number;
  addedAt: string;
}

export interface Cart {
  sessionId: string;
  items: CartItem[];
  updatedAt: string;
}

@Injectable()
export class CartService {
  constructor(
    @Inject(CACHE_MANAGER) private cache: Cache,
    private smartCartService: SmartCartService,
  ) {}

  private getCartKey(userId?: number, sessionId?: string): string {
    if (userId) return `cart:user:${userId}`;
    return `cart:${sessionId ?? uuidv4()}`;
  }

  async getCart(userId?: number, sessionId?: string): Promise<Cart> {
    const key = this.getCartKey(userId, sessionId);
    const cart = await this.cache.get<Cart>(key);
    return cart ?? { sessionId: sessionId ?? '', items: [], updatedAt: new Date().toISOString() };
  }

  async addItem(
    userId: number | undefined,
    sessionId: string,
    productId: number,
    quantity: number,
  ): Promise<Cart> {
    const key = this.getCartKey(userId, sessionId);
    const cart = await this.getCart(userId, sessionId);

    const existing = cart.items.find((i) => i.productId === productId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.items.push({
        id: uuidv4(),
        productId,
        quantity,
        addedAt: new Date().toISOString(),
      });
    }

    cart.updatedAt = new Date().toISOString();
    await this.cache.set(key, cart, CART_TTL);
    return cart;
  }

  async updateItem(
    userId: number | undefined,
    sessionId: string,
    itemId: string,
    quantity: number,
  ): Promise<Cart> {
    const key = this.getCartKey(userId, sessionId);
    const cart = await this.getCart(userId, sessionId);

    const item = cart.items.find((i) => i.id === itemId);
    if (!item) return cart;

    if (quantity <= 0) {
      cart.items = cart.items.filter((i) => i.id !== itemId);
    } else {
      item.quantity = quantity;
    }

    cart.updatedAt = new Date().toISOString();
    await this.cache.set(key, cart, CART_TTL);
    return cart;
  }

  async removeItem(
    userId: number | undefined,
    sessionId: string,
    itemId: string,
  ): Promise<Cart> {
    const key = this.getCartKey(userId, sessionId);
    const cart = await this.getCart(userId, sessionId);

    cart.items = cart.items.filter((i) => i.id !== itemId);
    cart.updatedAt = new Date().toISOString();
    await this.cache.set(key, cart, CART_TTL);
    return cart;
  }

  async clearCart(userId?: number, sessionId?: string): Promise<void> {
    const key = this.getCartKey(userId, sessionId);
    await this.cache.del(key);
  }

  async calculateSmartCart(
    userId: number | undefined,
    sessionId: string,
    region: Region,
  ) {
    const cart = await this.getCart(userId, sessionId);

    if (cart.items.length === 0) {
      return {
        items: [],
        cards: [],
        totalInRegionalCurrency: 0,
        totalInRub: 0,
        overshootInRegionalCurrency: 0,
        overshootInRub: 0,
      };
    }

    return this.smartCartService.calculateFromIds(
      cart.items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
      region,
    );
  }
}
