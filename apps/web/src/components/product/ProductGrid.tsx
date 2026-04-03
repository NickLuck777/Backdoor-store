'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { ProductDto } from '@/types';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductCardSkeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

export interface ProductGridProps {
  products: ProductDto[];
  isLoading?: boolean;
  total: number;
  page: number;
  onPageChange: (page: number) => void;
  limit: number;
  onAddToCart?: (productId: number) => void;
}

function getPaginationRange(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const delta = 2;
  const left = current - delta;
  const right = current + delta + 1;
  const range: number[] = [];
  const result: (number | '...')[] = [];
  let last: number | undefined;

  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= left && i < right)) {
      range.push(i);
    }
  }

  for (const i of range) {
    if (last !== undefined) {
      if (i - last === 2) result.push(last + 1);
      else if (i - last > 2) result.push('...');
    }
    result.push(i);
    last = i;
  }
  return result;
}

export function ProductGrid({
  products,
  isLoading = false,
  total,
  page,
  onPageChange,
  limit,
  onAddToCart,
}: ProductGridProps) {
  const totalPages = Math.ceil(total / limit);
  const paginationRange = getPaginationRange(page, totalPages);

  return (
    <div className="flex flex-col gap-6">
      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: limit }).map((_, i) => <ProductCardSkeleton key={i} />)
          : products.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.35,
                  delay: Math.min(i * 0.04, 0.25),
                  ease: [0.4, 0, 0.2, 1],
                }}
              >
                <ProductCard product={product} onAddToCart={onAddToCart} />
              </motion.div>
            ))}
      </div>

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 py-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            aria-label="Предыдущая страница"
          >
            <ChevronLeft size={16} />
          </Button>

          {paginationRange.map((item, i) =>
            item === '...' ? (
              <span key={`ellipsis-${i}`} className="px-2 text-muted text-sm">
                ...
              </span>
            ) : (
              <button
                key={item}
                onClick={() => onPageChange(item as number)}
                className={cn(
                  'w-9 h-9 rounded-xl text-sm font-semibold transition-all duration-200',
                  page === item
                    ? 'bg-accent text-white shadow-[0_0_16px_rgba(0,48,135,0.4)]'
                    : 'text-muted hover:text-white hover:bg-white/10',
                )}
              >
                {item}
              </button>
            ),
          )}

          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            aria-label="Следующая страница"
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      )}

      {/* Total count */}
      {!isLoading && (
        <p className="text-center text-muted text-xs">
          Показано {Math.min((page - 1) * limit + products.length, total)} из {total} товаров
        </p>
      )}
    </div>
  );
}

export default ProductGrid;
