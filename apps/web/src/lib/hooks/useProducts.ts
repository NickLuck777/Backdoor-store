'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { ProductDto, CategoryDto, HomepageSection, FilterState } from '@/types';

// GET /products/homepage-sections
export function useHomepageSections() {
  return useQuery<HomepageSection[]>({
    queryKey: ['homepage-sections'],
    queryFn: async () => {
      const { data } = await api.get<HomepageSection[]>('/products/homepage-sections');
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

// GET /products with filter params
export function useProducts(filters: FilterState) {
  const params = new URLSearchParams();
  if (filters.region) params.set('region', filters.region);
  if (filters.types?.length) params.set('types', filters.types.join(','));
  if (filters.platforms?.length) params.set('platforms', filters.platforms.join(','));
  if (filters.categorySlug) params.set('categorySlug', filters.categorySlug);
  if (filters.minPrice != null) params.set('minPrice', String(filters.minPrice));
  if (filters.maxPrice != null) params.set('maxPrice', String(filters.maxPrice));
  if (filters.hasDiscount) params.set('hasDiscount', 'true');
  if (filters.sortBy) params.set('sortBy', filters.sortBy);
  if (filters.page != null) params.set('page', String(filters.page));
  if (filters.limit != null) params.set('limit', String(filters.limit));

  return useQuery<{ products: ProductDto[]; total: number }>({
    queryKey: ['products', filters],
    queryFn: async () => {
      const { data } = await api.get<{ products: ProductDto[]; total: number }>(
        `/products?${params.toString()}`,
      );
      return data;
    },
    staleTime: 2 * 60 * 1000,
  });
}

// GET /products/:slug
export function useProduct(slug: string) {
  return useQuery<ProductDto>({
    queryKey: ['product', slug],
    queryFn: async () => {
      const { data } = await api.get<ProductDto>(`/products/${slug}`);
      return data;
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
}

// GET /products/search?q=query (debounced)
export function useSearch(query: string) {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  return useQuery<{ products: ProductDto[]; total: number; query: string }>({
    queryKey: ['search', debouncedQuery],
    queryFn: async () => {
      const { data } = await api.get<{ products: ProductDto[]; total: number; query: string }>(
        `/products/search?q=${encodeURIComponent(debouncedQuery)}`,
      );
      return data;
    },
    enabled: debouncedQuery.trim().length >= 2,
    staleTime: 60 * 1000,
  });
}

// GET /categories
export function useCategories() {
  return useQuery<CategoryDto[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get<CategoryDto[]>('/categories');
      return data;
    },
    staleTime: 10 * 60 * 1000,
  });
}
