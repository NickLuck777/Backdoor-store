'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useCartStore } from '@/lib/store/cartStore';
import type { CartItem, SmartCartResult, Region } from '@/types';

// SessionId — generate once, persist in localStorage
function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  let sessionId = localStorage.getItem('cart_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('cart_session_id', sessionId);
  }
  return sessionId;
}

// Add sessionId header to every cart request
function cartHeaders() {
  return { 'X-Session-Id': getSessionId() };
}

export interface ApiCartItem {
  id: number;
  productId: number;
  product: CartItem['product'];
  quantity: number;
}

export interface ApiCart {
  items: ApiCartItem[];
  sessionId: string;
}

// GET /cart
export function useCartQuery() {
  return useQuery<ApiCart>({
    queryKey: ['cart'],
    queryFn: async () => {
      const { data } = await api.get<ApiCart>('/cart', {
        headers: cartHeaders(),
      });
      return data;
    },
    staleTime: 30 * 1000,
  });
}

// POST /cart/items
export function useAddToCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { productId: number; quantity?: number }) => {
      const { data } = await api.post('/cart/items', payload, {
        headers: cartHeaders(),
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['smart-cart'] });
    },
  });
}

// DELETE /cart/items/:id
export function useRemoveFromCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (itemId: number) => {
      const { data } = await api.delete(`/cart/items/${itemId}`, {
        headers: cartHeaders(),
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['smart-cart'] });
    },
  });
}

// PATCH /cart/items/:id
export function useUpdateCartItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: number; quantity: number }) => {
      const { data } = await api.patch(
        `/cart/items/${itemId}`,
        { quantity },
        { headers: cartHeaders() },
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['smart-cart'] });
    },
  });
}

// DELETE /cart
export function useClearCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.delete('/cart', {
        headers: cartHeaders(),
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['smart-cart'] });
    },
  });
}

// POST /cart/calculate — smart denomination breakdown.
// The cart lives in Zustand/localStorage on the client; the backend Redis
// cart is never populated by the storefront. So we send our local items in
// the request body and the backend calculates from them directly.
export function useSmartCart(region?: Region) {
  const items = useCartStore((state) => state.items);
  // Stable cache key — productId + quantity is what actually affects the calc.
  const itemsKey = items
    .map((i) => `${i.productId}x${i.quantity}`)
    .join('|');

  return useQuery<SmartCartResult>({
    queryKey: ['smart-cart', region, itemsKey],
    queryFn: async () => {
      const payload = {
        region,
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
      };
      const { data } = await api.post<SmartCartResult>(
        '/cart/calculate',
        payload,
        { headers: cartHeaders() },
      );
      return data;
    },
    staleTime: 30 * 1000,
    enabled: !!region && items.length > 0,
  });
}
