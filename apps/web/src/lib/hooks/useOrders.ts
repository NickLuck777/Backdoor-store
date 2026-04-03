'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export type OrderStatus = 'PENDING' | 'PAID' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED';

export interface OrderCode {
  id: number;
  code: string;
  denomination: number;
  currency: string;
}

export interface OrderProduct {
  id: number;
  title: string;
  imageUrl?: string;
  edition?: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  status: OrderStatus;
  totalInRub: number;
  products: OrderProduct[];
  codes: OrderCode[];
  createdAt: string;
  email?: string;
  phone?: string;
  telegram?: string;
}

export interface CreateOrderPayload {
  email: string;
  phone?: string;
  telegram?: string;
  needsPsnAccount?: boolean;
  psnAccountRegion?: string;
  region: string;
}

export interface PaymentResult {
  paymentUrl: string;
  orderId: number;
  orderNumber: string;
}

// POST /orders
export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateOrderPayload) => {
      const { data } = await api.post<Order>('/orders', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-orders'] });
    },
  });
}

// POST /orders/:id/pay
export function useInitiatePayment() {
  return useMutation({
    mutationFn: async (orderId: number) => {
      const { data } = await api.post<PaymentResult>(`/orders/${orderId}/pay`);
      return data;
    },
  });
}

// GET /orders/:orderNumber — with optional polling
export function useOrderStatus(orderNumber: string | null, poll = false) {
  return useQuery<Order>({
    queryKey: ['order', orderNumber],
    queryFn: async () => {
      const { data } = await api.get<Order>(`/orders/${orderNumber}`);
      return data;
    },
    enabled: !!orderNumber,
    refetchInterval: (query) => {
      if (!poll) return false;
      const status = query.state.data?.status;
      if (
        status === 'DELIVERED' ||
        status === 'COMPLETED' ||
        status === 'CANCELLED'
      ) {
        return false;
      }
      return 5000;
    },
    staleTime: 0,
  });
}

// GET /user/orders (authenticated)
export function useUserOrders() {
  return useQuery<Order[]>({
    queryKey: ['user-orders'],
    queryFn: async () => {
      const { data } = await api.get<Order[]>('/user/orders');
      return data;
    },
    staleTime: 60 * 1000,
  });
}
