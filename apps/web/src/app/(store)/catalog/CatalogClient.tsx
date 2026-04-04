'use client';

import * as React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { FilterPanel } from '@/components/catalog/FilterPanel';
import { SortDropdown } from '@/components/catalog/SortDropdown';
import { ProductGrid } from '@/components/product/ProductGrid';
import { useProducts, useCategories } from '@/lib/hooks/useProducts';
import { useCartStore } from '@/lib/store/cartStore';
import type { FilterState, ProductType, Platform, Region } from '@/types';

const LIMIT = 24;

function parseFilters(params: URLSearchParams): FilterState {
  return {
    region: (params.get('region') as Region) || undefined,
    types: params.get('types')
      ? (params.get('types')!.split(',') as ProductType[])
      : undefined,
    platforms: params.get('platforms')
      ? (params.get('platforms')!.split(',') as Platform[])
      : undefined,
    categorySlug: params.get('categorySlug') || undefined,
    minPrice: params.get('minPrice') ? Number(params.get('minPrice')) : undefined,
    maxPrice: params.get('maxPrice') ? Number(params.get('maxPrice')) : undefined,
    hasDiscount: params.get('hasDiscount') === 'true' || undefined,
    sortBy: (params.get('sortBy') as FilterState['sortBy']) || 'popular',
    page: params.get('page') ? Number(params.get('page')) : 1,
    limit: LIMIT,
  };
}

function filtersToParams(filters: FilterState): Record<string, string> {
  const p: Record<string, string> = {};
  if (filters.region) p.region = filters.region;
  if (filters.types?.length) p.types = filters.types.join(',');
  if (filters.platforms?.length) p.platforms = filters.platforms.join(',');
  if (filters.categorySlug) p.categorySlug = filters.categorySlug;
  if (filters.minPrice != null) p.minPrice = String(filters.minPrice);
  if (filters.maxPrice != null) p.maxPrice = String(filters.maxPrice);
  if (filters.hasDiscount) p.hasDiscount = 'true';
  if (filters.sortBy) p.sortBy = filters.sortBy;
  if (filters.page && filters.page > 1) p.page = String(filters.page);
  return p;
}

export default function CatalogClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filters = parseFilters(searchParams);

  const { data, isLoading } = useProducts(filters);
  const { data: categories = [] } = useCategories();
  const addItem = useCartStore((state) => state.addItem);

  const products = data?.products ?? [];
  const total = data?.total ?? 0;

  const updateFilters = (newFilters: FilterState) => {
    const params = new URLSearchParams(filtersToParams(newFilters));
    router.push(`/catalog?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    updateFilters({ ...filters, page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6">
      <Breadcrumbs items={[{ label: 'Каталог' }]} className="mb-5" />

      <div className="flex gap-6 items-start">
        {/* Sidebar filter */}
        <FilterPanel
          filters={filters}
          categories={categories}
          onFiltersChange={updateFilters}
          isLoading={isLoading}
        />

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Top bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-3">
              {/* Mobile filter button rendered inside FilterPanel */}
              <FilterPanel
                filters={filters}
                categories={categories}
                onFiltersChange={updateFilters}
                isLoading={isLoading}
                className="lg:hidden"
              />
              <h1 className="text-lg font-bold text-white">
                Каталог
                {total > 0 && (
                  <span className="ml-2 text-sm font-normal text-muted">{total} товаров</span>
                )}
              </h1>
            </div>
            <SortDropdown
              value={filters.sortBy ?? 'popular'}
              onChange={(v) => updateFilters({ ...filters, sortBy: v as FilterState['sortBy'] })}
            />
          </div>

          <ProductGrid
            products={products}
            isLoading={isLoading}
            total={total}
            page={filters.page ?? 1}
            onPageChange={handlePageChange}
            limit={LIMIT}
            onAddToCart={(id) => {
              const product = products.find((p) => p.id === id);
              if (product) addItem(product);
            }}
          />
        </div>
      </div>
    </div>
  );
}
