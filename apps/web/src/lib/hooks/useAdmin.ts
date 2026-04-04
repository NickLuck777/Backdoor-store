'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin-api';

// ─── Types ────────────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'PROCESSING'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED';

export type CodeStatus = 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'EXPIRED';

export interface DashboardStats {
  salesToday: number;
  ordersToday: number;
  avgCheck: number;
  newUsers: number;
  revenueByDay: { date: string; revenue: number }[];
  ordersByStatus: { status: OrderStatus; count: number }[];
}

export interface TopProduct {
  id: number;
  title: string;
  region: string;
  count: number;
  revenue: number;
}

export interface AdminOrder {
  id: number;
  orderNumber: string;
  createdAt: string;
  customerEmail: string;
  customerPhone?: string;
  customerTelegram?: string;
  status: OrderStatus;
  totalAmount: number;
  items: AdminOrderItem[];
  codes?: AssignedCode[];
}

export interface AdminOrderItem {
  id: number;
  productId: number;
  productTitle: string;
  region: string;
  quantity: number;
  price: number;
}

export interface AssignedCode {
  id: number;
  code: string;
  denomination: number;
  currency: string;
}

export interface AdminProduct {
  id: number;
  slug: string;
  title: string;
  description?: string;
  type: string;
  platform?: string;
  edition?: string;
  region: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  imageUrl?: string;
  isPreorder: boolean;
  isAvailable: boolean;
  sortOrder: number;
}

export interface CodeInventoryRow {
  denomination: number;
  currency: string;
  available: number;
  reserved: number;
  sold: number;
  total: number;
  threshold: number;
}

export interface CodeAlert {
  denomination: number;
  currency: string;
  available: number;
  threshold: number;
}

export interface ExchangeRate {
  id: number;
  currency: string;
  rateToRub: number;
  margin: number;
  effectiveRate: number;
  lastUpdated: string;
}

export interface AdminUser {
  id: number;
  email: string;
  name?: string;
  phone?: string;
  role: 'CUSTOMER' | 'MANAGER' | 'ADMIN';
  ordersCount: number;
  createdAt: string;
}

export interface PromoCode {
  id: number;
  code: string;
  discountPct?: number;
  discountAmt?: number;
  usedCount: number;
  maxUses?: number;
  isActive: boolean;
  expiresAt?: string;
}

export interface AdminCategory {
  id: number;
  slug: string;
  name: string;
  type: string;
  sortOrder: number;
  isActive: boolean;
}

export interface Banner {
  id: number;
  title: string;
  imageUrl: string;
  linkUrl?: string;
  position: 'HERO' | 'PROMO' | 'SIDEBAR';
  isActive: boolean;
  startDate?: string;
  endDate?: string;
}

export interface FaqItem {
  id: number;
  question: string;
  answer: string;
  sortOrder: number;
  isActive: boolean;
}

export interface ImportResult {
  created: number;
  updated: number;
  errors: string[];
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export function useAdminDashboard() {
  return useQuery<DashboardStats>({
    queryKey: ['admin', 'dashboard'],
    queryFn: async () => {
      const { data } = await adminApi.get<DashboardStats>('/admin/analytics/dashboard');
      return data;
    },
    staleTime: 60 * 1000,
  });
}

export function useAdminTopProducts() {
  return useQuery<TopProduct[]>({
    queryKey: ['admin', 'top-products'],
    queryFn: async () => {
      const { data } = await adminApi.get<TopProduct[]>('/admin/analytics/top-products');
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useAdminRevenue(period: '7d' | '30d' | '90d' = '30d') {
  return useQuery<{ date: string; revenue: number }[]>({
    queryKey: ['admin', 'revenue', period],
    queryFn: async () => {
      const { data } = await adminApi.get<{ date: string; revenue: number }[]>(
        `/admin/analytics/revenue?period=${period}`,
      );
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

// ─── Products ─────────────────────────────────────────────────────────────────

interface ProductFilters {
  search?: string;
  region?: string;
  type?: string;
  hasDiscount?: boolean;
  page?: number;
  limit?: number;
}

export function useAdminProducts(filters: ProductFilters = {}) {
  const params = new URLSearchParams();
  if (filters.search) params.set('search', filters.search);
  if (filters.region) params.set('region', filters.region);
  if (filters.type) params.set('type', filters.type);
  if (filters.hasDiscount) params.set('hasDiscount', 'true');
  if (filters.page != null) params.set('page', String(filters.page));
  if (filters.limit != null) params.set('limit', String(filters.limit));

  return useQuery<{ products: AdminProduct[]; total: number }>({
    queryKey: ['admin', 'products', filters],
    queryFn: async () => {
      const { data } = await adminApi.get<{ products: AdminProduct[]; total: number }>(
        `/admin/products?${params.toString()}`,
      );
      return data;
    },
    staleTime: 60 * 1000,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (product: Partial<AdminProduct>) => {
      const { data } = await adminApi.post<AdminProduct>('/admin/products', product);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...product }: Partial<AdminProduct> & { id: number }) => {
      const { data } = await adminApi.patch<AdminProduct>(`/admin/products/${id}`, product);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await adminApi.delete(`/admin/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
    },
  });
}

export function useImportProducts() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const { data } = await adminApi.post<ImportResult>('/admin/products/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
    },
  });
}

export function useBulkDiscount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ ids, discount }: { ids: number[]; discount: number }) => {
      const { data } = await adminApi.post('/admin/products/bulk-discount', { ids, discount });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
    },
  });
}

// ─── Categories ───────────────────────────────────────────────────────────────

export function useAdminCategories() {
  return useQuery<AdminCategory[]>({
    queryKey: ['admin', 'categories'],
    queryFn: async () => {
      const { data } = await adminApi.get<AdminCategory[]>('/admin/categories');
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useReorderCategories() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (order: { id: number; sortOrder: number }[]) => {
      const { data } = await adminApi.patch('/admin/categories/reorder', { order });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
    },
  });
}

// ─── Orders ───────────────────────────────────────────────────────────────────

interface OrderFilters {
  status?: OrderStatus;
  email?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export function useAdminOrders(filters: OrderFilters = {}) {
  const params = new URLSearchParams();
  if (filters.status) params.set('status', filters.status);
  if (filters.email) params.set('email', filters.email);
  if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
  if (filters.dateTo) params.set('dateTo', filters.dateTo);
  if (filters.page != null) params.set('page', String(filters.page));
  if (filters.limit != null) params.set('limit', String(filters.limit));

  return useQuery<{ orders: AdminOrder[]; total: number }>({
    queryKey: ['admin', 'orders', filters],
    queryFn: async () => {
      const { data } = await adminApi.get<{ orders: AdminOrder[]; total: number }>(
        `/admin/orders?${params.toString()}`,
      );
      return data;
    },
    staleTime: 30 * 1000,
  });
}

export function useAdminOrder(id: number) {
  return useQuery<AdminOrder>({
    queryKey: ['admin', 'order', id],
    queryFn: async () => {
      const { data } = await adminApi.get<AdminOrder>(`/admin/orders/${id}`);
      return data;
    },
    enabled: !!id,
    staleTime: 30 * 1000,
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: OrderStatus }) => {
      const { data } = await adminApi.patch(`/admin/orders/${id}/status`, { status });
      return data;
    },
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'order', id] });
    },
  });
}

export function useAssignCodes() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ orderId, codeIds }: { orderId: number; codeIds: number[] }) => {
      const { data } = await adminApi.post(`/admin/orders/${orderId}/assign-codes`, { codeIds });
      return data;
    },
    onSuccess: (_data, { orderId }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'order', orderId] });
    },
  });
}

// ─── Codes ────────────────────────────────────────────────────────────────────

export function useCodeInventory() {
  return useQuery<CodeInventoryRow[]>({
    queryKey: ['admin', 'codes', 'inventory'],
    queryFn: async () => {
      const { data } = await adminApi.get<CodeInventoryRow[]>('/admin/codes/inventory');
      return data;
    },
    staleTime: 60 * 1000,
  });
}

export function useCodeAlerts() {
  return useQuery<CodeAlert[]>({
    queryKey: ['admin', 'codes', 'alerts'],
    queryFn: async () => {
      const { data } = await adminApi.get<CodeAlert[]>('/admin/codes/alerts');
      return data;
    },
    staleTime: 60 * 1000,
  });
}

export function useImportCodes() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const { data } = await adminApi.post<ImportResult>('/admin/codes/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'codes'] });
    },
  });
}

// ─── Exchange Rates ───────────────────────────────────────────────────────────

export function useExchangeRates() {
  return useQuery<ExchangeRate[]>({
    queryKey: ['admin', 'exchange-rates'],
    queryFn: async () => {
      const { data } = await adminApi.get<ExchangeRate[]>('/admin/exchange-rates');
      return data;
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useUpdateExchangeRate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      rateToRub,
      margin,
    }: {
      id: number;
      rateToRub?: number;
      margin?: number;
    }) => {
      const { data } = await adminApi.patch(`/admin/exchange-rates/${id}`, { rateToRub, margin });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'exchange-rates'] });
    },
  });
}

// ─── Users ────────────────────────────────────────────────────────────────────

interface UserFilters {
  role?: 'CUSTOMER' | 'MANAGER' | 'ADMIN';
  search?: string;
  page?: number;
  limit?: number;
}

export function useAdminUsers(filters: UserFilters = {}) {
  const params = new URLSearchParams();
  if (filters.role) params.set('role', filters.role);
  if (filters.search) params.set('search', filters.search);
  if (filters.page != null) params.set('page', String(filters.page));
  if (filters.limit != null) params.set('limit', String(filters.limit));

  return useQuery<{ users: AdminUser[]; total: number }>({
    queryKey: ['admin', 'users', filters],
    queryFn: async () => {
      const { data } = await adminApi.get<{ users: AdminUser[]; total: number }>(
        `/admin/users?${params.toString()}`,
      );
      return data;
    },
    staleTime: 2 * 60 * 1000,
  });
}

// ─── Promo Codes ──────────────────────────────────────────────────────────────

export function useAdminPromoCodes() {
  return useQuery<PromoCode[]>({
    queryKey: ['admin', 'promo-codes'],
    queryFn: async () => {
      const { data } = await adminApi.get<PromoCode[]>('/admin/promo-codes');
      return data;
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreatePromoCode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (promo: Partial<PromoCode>) => {
      const { data } = await adminApi.post<PromoCode>('/admin/promo-codes', promo);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'promo-codes'] });
    },
  });
}

export function useUpdatePromoCode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...promo }: Partial<PromoCode> & { id: number }) => {
      const { data } = await adminApi.patch<PromoCode>(`/admin/promo-codes/${id}`, promo);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'promo-codes'] });
    },
  });
}

export function useDeletePromoCode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await adminApi.delete(`/admin/promo-codes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'promo-codes'] });
    },
  });
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

export function useAdminFaq() {
  return useQuery<FaqItem[]>({
    queryKey: ['admin', 'faq'],
    queryFn: async () => {
      const { data } = await adminApi.get<FaqItem[]>('/admin/content/faq');
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateFaqItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (item: Partial<FaqItem>) => {
      const { data } = await adminApi.post<FaqItem>('/admin/content/faq', item);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'faq'] });
    },
  });
}

export function useUpdateFaqItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...item }: Partial<FaqItem> & { id: number }) => {
      const { data } = await adminApi.patch<FaqItem>(`/admin/content/faq/${id}`, item);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'faq'] });
    },
  });
}

export function useDeleteFaqItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await adminApi.delete(`/admin/content/faq/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'faq'] });
    },
  });
}

export function useReorderFaq() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (order: { id: number; sortOrder: number }[]) => {
      await adminApi.patch('/admin/content/faq/reorder', { order });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'faq'] });
    },
  });
}

// ─── Banners ──────────────────────────────────────────────────────────────────

export function useAdminBanners() {
  return useQuery<Banner[]>({
    queryKey: ['admin', 'banners'],
    queryFn: async () => {
      const { data } = await adminApi.get<Banner[]>('/admin/content/banners');
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (banner: Partial<Banner>) => {
      const { data } = await adminApi.post<Banner>('/admin/content/banners', banner);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'banners'] });
    },
  });
}

export function useUpdateBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...banner }: Partial<Banner> & { id: number }) => {
      const { data } = await adminApi.patch<Banner>(`/admin/content/banners/${id}`, banner);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'banners'] });
    },
  });
}

export function useDeleteBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await adminApi.delete(`/admin/content/banners/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'banners'] });
    },
  });
}
