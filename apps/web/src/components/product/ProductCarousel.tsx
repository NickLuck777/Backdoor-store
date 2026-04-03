'use client';

import * as React from 'react';
import Link from 'next/link';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { ProductDto } from '@/types';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductCardSkeleton } from '@/components/ui/skeleton';

export interface ProductCarouselProps {
  title: string;
  products: ProductDto[];
  viewAllHref?: string;
  isLoading?: boolean;
  onAddToCart?: (productId: number) => void;
}

export function ProductCarousel({
  title,
  products,
  viewAllHref,
  isLoading = false,
  onAddToCart,
}: ProductCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    dragFree: true,
    slidesToScroll: 1,
  });

  const [prevEnabled, setPrevEnabled] = React.useState(false);
  const [nextEnabled, setNextEnabled] = React.useState(true);

  const onSelect = React.useCallback(() => {
    if (!emblaApi) return;
    setPrevEnabled(emblaApi.canScrollPrev());
    setNextEnabled(emblaApi.canScrollNext());
  }, [emblaApi]);

  React.useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    onSelect();
  }, [emblaApi, onSelect]);

  return (
    <section className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <motion.h2
          initial={{ opacity: 0, x: -12 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          className="text-xl font-bold text-white"
        >
          {title}
        </motion.h2>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="text-sm text-muted hover:text-accent-hover transition-colors duration-200 flex items-center gap-1"
          >
            Смотреть все
            <ChevronRight size={14} />
          </Link>
        )}
      </div>

      {/* Carousel */}
      <div className="relative group/carousel">
        {isLoading ? (
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-44 sm:w-48">
                <ProductCardSkeleton />
              </div>
            ))}
          </div>
        ) : (
          <>
            <div ref={emblaRef} className="overflow-hidden">
              <div className="flex gap-4">
                {products.map((product, i) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: Math.min(i * 0.05, 0.3), ease: [0.4, 0, 0.2, 1] }}
                    className="flex-shrink-0 w-44 sm:w-48 md:w-52"
                  >
                    <ProductCard
                      product={product}
                      onAddToCart={onAddToCart}
                      priority={i < 3}
                    />
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Arrow buttons */}
            <button
              onClick={() => emblaApi?.scrollPrev()}
              disabled={!prevEnabled}
              aria-label="Предыдущий"
              className={cn(
                'absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3',
                'z-10 flex items-center justify-center',
                'w-9 h-9 rounded-full',
                'bg-accent/80 backdrop-blur-sm border border-accent/40',
                'text-white shadow-[0_4px_16px_rgba(0,0,0,0.4)]',
                'transition-all duration-300',
                'opacity-0 group-hover/carousel:opacity-100',
                'hover:bg-accent-hover hover:scale-110',
                'disabled:opacity-0 disabled:pointer-events-none',
              )}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => emblaApi?.scrollNext()}
              disabled={!nextEnabled}
              aria-label="Следующий"
              className={cn(
                'absolute right-0 top-1/2 -translate-y-1/2 translate-x-3',
                'z-10 flex items-center justify-center',
                'w-9 h-9 rounded-full',
                'bg-accent/80 backdrop-blur-sm border border-accent/40',
                'text-white shadow-[0_4px_16px_rgba(0,0,0,0.4)]',
                'transition-all duration-300',
                'opacity-0 group-hover/carousel:opacity-100',
                'hover:bg-accent-hover hover:scale-110',
                'disabled:opacity-0 disabled:pointer-events-none',
              )}
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}
      </div>
    </section>
  );
}

export default ProductCarousel;
