import * as React from 'react';
import { cn } from '@/lib/utils';
import { formatPrice, formatDiscount } from '@/lib/utils';

export interface PriceTagProps {
  price: number;
  originalPrice?: number;
  discount?: number;
  size?: 'sm' | 'md' | 'lg';
  currency?: string;
  className?: string;
}

const sizeConfig = {
  sm: {
    price: 'text-sm font-bold',
    original: 'text-xs',
    badge: 'text-[10px] px-1.5 py-0.5',
  },
  md: {
    price: 'text-xl font-bold',
    original: 'text-sm',
    badge: 'text-xs px-2 py-0.5',
  },
  lg: {
    price: 'text-3xl font-extrabold',
    original: 'text-base',
    badge: 'text-sm px-2.5 py-1',
  },
};

export function PriceTag({
  price,
  originalPrice,
  discount,
  size = 'md',
  currency = 'RUB',
  className,
}: PriceTagProps) {
  const config = sizeConfig[size];
  const hasDiscount = discount != null && discount > 0 && originalPrice != null;

  return (
    <div className={cn('flex flex-wrap items-baseline gap-2', className)}>
      {/* Current price */}
      <span className={cn('text-white leading-none', config.price)}>
        {formatPrice(price, currency)}
      </span>

      {/* Original price + badge */}
      {hasDiscount && (
        <>
          <span className={cn('text-muted line-through leading-none', config.original)}>
            {formatPrice(originalPrice!, currency)}
          </span>
          <span
            className={cn(
              'inline-flex items-center rounded-full font-bold text-white leading-none',
              'bg-discount-green shadow-[0_2px_8px_rgba(0,200,83,0.4)]',
              config.badge,
            )}
          >
            {formatDiscount(discount!)}
          </span>
        </>
      )}
    </div>
  );
}

export default PriceTag;
