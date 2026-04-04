'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, ProductDto, SmartCartResult } from '@/types';

function generateSessionId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  sessionId: string;
  smartCartResult: SmartCartResult | null;
  addItem: (product: ProductDto) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  setSmartCartResult: (result: SmartCartResult | null) => void;
  totalCount: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      sessionId: generateSessionId(),
      smartCartResult: null,

      setSmartCartResult: (result: SmartCartResult | null) =>
        set({ smartCartResult: result }),

      addItem: (product: ProductDto) => {
        const existing = get().items.find((i) => i.productId === product.id);
        if (existing) {
          set((state) => ({
            items: state.items.map((i) =>
              i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i,
            ),
          }));
        } else {
          set((state) => ({
            items: [
              ...state.items,
              {
                id: `${product.id}-${Date.now()}`,
                productId: product.id,
                product,
                quantity: 1,
              },
            ],
          }));
        }
      },

      removeItem: (productId: number) => {
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        }));
      },

      updateQuantity: (productId: number, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId ? { ...i, quantity } : i,
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      totalCount: () => get().items.reduce((acc, i) => acc + i.quantity, 0),

      totalPrice: () =>
        get().items.reduce((acc, i) => acc + i.product.price * i.quantity, 0),
    }),
    {
      name: 'backdoor-cart',
      partialize: (state) => ({ items: state.items, sessionId: state.sessionId }),
    },
  ),
);
