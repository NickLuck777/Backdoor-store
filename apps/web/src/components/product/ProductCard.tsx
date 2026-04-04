'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProductDto } from '@/types';
import { Button } from '@/components/ui/button';
import { DiscountBadge, PreorderBadge, PlatformBadge } from '@/components/ui/badge';
import { PriceTag } from '@/components/product/PriceTag';

export interface ProductCardProps {
  product: ProductDto;
  onAddToCart?: (productId: number) => void;
  priority?: boolean;
  className?: string;
}

const regionPath: Record<string, string> = {
  TURKEY: 'tr',
  INDIA: 'in',
  UKRAINE: 'ua',
};

// Placeholder gradient when no image is provided
function PSPlaceholder({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex items-center justify-center',
        'bg-gradient-to-br from-[#003087] via-[#1A1A4E] to-[#0070D1]',
        className,
      )}
    >
      {/* PlayStation logo SVG */}
      <svg viewBox="0 0 100 100" className="w-1/3 opacity-40" fill="white">
        <path d="M37.4 74.5V18.9l11.5 3.6v48.9l7.7 2.4V24.5c9.7 2.9 17.2 8.1 17.2 18.9 0 11.1-7.7 15.3-17.2 12.3v8.1C70.8 67.4 83 62 83 43.4c0-17.6-12.5-25.4-26.1-29.6l-19.5-6.1v66.8l11.5 3.6-.1-3.6zM25.4 66.5c-9.2-2.7-11.4-8-7.2-11.7 3.8-3.4 10.3-5.9 10.3-5.9V40.5S13 46.2 9.1 58.2c-3.9 12.1 5.1 19.4 16.3 22.5l11.5 3.4V75l-11.5-8.5z" />
      </svg>
    </div>
  );
}

export function ProductCard({ product, onAddToCart, priority = false, className }: ProductCardProps) {
  const [adding, setAdding] = React.useState(false);

  const href = `/product/${regionPath[product.region] ?? 'tr'}/${product.slug}`;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (adding) return;
    setAdding(true);
    onAddToCart?.(product.id);
    setTimeout(() => setAdding(false), 600);
  };

  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } }}
      className={cn(
        'group relative flex flex-col rounded-xl overflow-hidden',
        'bg-card border border-border',
        'hover:border-accent/40',
        'hover:shadow-[0_16px_40px_rgba(0,48,135,0.3)]',
        'transition-shadow duration-300',
        className,
      )}
    >
      <Link href={href} className="flex flex-col flex-1">
        {/* Cover image */}
        <div className="relative aspect-[3/4] overflow-hidden">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.title}
              fill
              priority={priority}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <PSPlaceholder className="absolute inset-0" />
          )}

          {/* Gradient overlay at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-card/80 to-transparent" />

          {/* Discount badge — top right */}
          <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
            {product.isPreorder && <PreorderBadge />}
            {product.discount != null && product.discount > 0 && (
              <DiscountBadge pct={product.discount} />
            )}
          </div>
        </div>

        {/* Card content */}
        <div className="flex flex-col flex-1 p-3 gap-1.5">
          {/* Platform badge */}
          {product.platform && (
            <div className="mb-0.5">
              <PlatformBadge platform={product.platform} />
            </div>
          )}
          {/* Title */}
          <h3 className="text-foreground font-semibold text-sm leading-snug line-clamp-2 group-hover:text-white transition-colors duration-200">
            {product.title}
          </h3>

          {/* Edition */}
          {product.edition && (
            <p className="text-muted text-xs truncate">{product.edition}</p>
          )}

          {/* Price */}
          <div className="mt-auto pt-2">
            <PriceTag
              price={product.price}
              originalPrice={product.originalPrice}
              discount={product.discount}
              size="md"
            />
          </div>
        </div>
      </Link>

      {/* Buy button */}
      <div className="px-3 pb-3">
        <Button
          size="sm"
          variant="default"
          loading={adding}
          onClick={handleAddToCart}
          className="w-full"
        >
          {!adding && <ShoppingCart size={14} />}
          {product.isPreorder ? 'Предзаказ' : 'Купить'}
        </Button>
      </div>
    </motion.div>
  );
}

export default ProductCard;
