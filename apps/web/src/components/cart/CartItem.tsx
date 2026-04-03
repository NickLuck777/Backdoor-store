'use client';

import * as React from 'react';
import Image from 'next/image';
import { X, Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/utils';
import type { CartItem as CartItemType } from '@/types';

interface CartItemProps {
  item: CartItemType;
  onRemove: (productId: number) => void;
  onUpdateQuantity: (productId: number, quantity: number) => void;
}

export function CartItem({ item, onRemove, onUpdateQuantity }: CartItemProps) {
  const { product, quantity } = item;

  return (
    <div className="flex gap-4 p-4 bg-card rounded-xl border border-border/40 group">
      {/* Cover */}
      <div className="relative flex-shrink-0 w-[60px] h-[80px] rounded-lg overflow-hidden bg-white/5">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.title}
            fill
            className="object-cover"
            sizes="60px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted text-xs text-center px-1">
            No Image
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white leading-tight truncate">
              {product.title}
            </p>
            {product.edition && (
              <p className="text-xs text-muted mt-0.5">{product.edition}</p>
            )}
            <p className="text-xs text-muted mt-0.5">
              {product.region === 'TURKEY' ? 'Турция' : product.region === 'INDIA' ? 'Индия' : 'Украина'}
            </p>
          </div>

          {/* Remove button */}
          <button
            onClick={() => onRemove(product.id)}
            aria-label="Удалить из корзины"
            className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-muted hover:text-discount-red hover:bg-discount-red/10 transition-all duration-200 opacity-0 group-hover:opacity-100"
          >
            <X size={14} />
          </button>
        </div>

        {/* Price + Quantity row */}
        <div className="flex items-center justify-between mt-3">
          <p className="text-sm font-bold text-white">
            {formatPrice(product.price * quantity)}
          </p>

          {/* Quantity selector */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onUpdateQuantity(product.id, quantity - 1)}
              disabled={quantity <= 1}
              aria-label="Уменьшить количество"
              className={cn(
                'w-7 h-7 flex items-center justify-center rounded-lg',
                'border border-border text-muted',
                'hover:border-accent/60 hover:text-white transition-all duration-200',
                'disabled:opacity-30 disabled:cursor-not-allowed',
              )}
            >
              <Minus size={12} />
            </button>
            <span className="w-8 text-center text-sm font-semibold text-white">
              {quantity}
            </span>
            <button
              onClick={() => onUpdateQuantity(product.id, quantity + 1)}
              disabled={quantity >= 10}
              aria-label="Увеличить количество"
              className={cn(
                'w-7 h-7 flex items-center justify-center rounded-lg',
                'border border-border text-muted',
                'hover:border-accent/60 hover:text-white transition-all duration-200',
                'disabled:opacity-30 disabled:cursor-not-allowed',
              )}
            >
              <Plus size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartItem;
