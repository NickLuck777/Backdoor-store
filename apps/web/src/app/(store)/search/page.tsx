'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { ProductGrid } from '@/components/product/ProductGrid';
import { SortDropdown } from '@/components/catalog/SortDropdown';
import { useSearch } from '@/lib/hooks/useProducts';
import { useCartStore } from '@/lib/store/cartStore';
import type { FilterState } from '@/types';

const LIMIT = 24;

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const [page, setPage] = React.useState(1);
  const [sortBy, setSortBy] = React.useState<FilterState['sortBy']>('popular');

  const { data, isLoading } = useSearch(query);
  const addItem = useCartStore((state) => state.addItem);

  const allProducts = data?.products ?? [];
  const total = data?.total ?? 0;

  // Client-side pagination for search results
  const start = (page - 1) * LIMIT;
  const products = allProducts.slice(start, start + LIMIT);

  const handlePageChange = (p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6">
      <Breadcrumbs
        items={[{ label: 'Поиск' }]}
        className="mb-5"
      />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          {query ? (
            <h1 className="text-2xl font-bold text-white">
              Результаты поиска по:{' '}
              <span className="text-accent-hover">&quot;{query}&quot;</span>
              {!isLoading && (
                <span className="ml-3 text-base font-normal text-muted">
                  — {total} {total === 1 ? 'игра' : total < 5 ? 'игры' : 'игр'}
                </span>
              )}
            </h1>
          ) : (
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Search size={22} className="text-muted" />
              Поиск
            </h1>
          )}
        </div>
        {total > 0 && (
          <SortDropdown
            value={sortBy ?? 'popular'}
            onChange={(v) => {
              setSortBy(v as FilterState['sortBy']);
              setPage(1);
            }}
          />
        )}
      </div>

      {/* Empty state */}
      {!isLoading && query && total === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center mb-4">
            <Search size={28} className="text-muted" />
          </div>
          <h2 className="text-lg font-bold text-foreground mb-2">Ничего не найдено</h2>
          <p className="text-muted text-sm max-w-xs">
            По запросу &quot;{query}&quot; ничего не нашлось. Попробуйте изменить запрос или посмотрите весь каталог.
          </p>
        </div>
      )}

      {/* No query state */}
      {!query && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-muted text-sm">Введите название игры, чтобы найти её</p>
        </div>
      )}

      {/* Results */}
      {(isLoading || products.length > 0) && (
        <ProductGrid
          products={products}
          isLoading={isLoading}
          total={total}
          page={page}
          onPageChange={handlePageChange}
          limit={LIMIT}
          onAddToCart={(id) => {
            const product = allProducts.find((p) => p.id === id);
            if (product) addItem(product);
          }}
        />
      )}
    </div>
  );
}
