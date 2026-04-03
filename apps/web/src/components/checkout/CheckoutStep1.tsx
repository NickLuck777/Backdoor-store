'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/lib/store/cartStore';
import { useRegionStore } from '@/lib/store/regionStore';
import { useSmartCart } from '@/lib/hooks/useCart';

interface CheckoutStep1Props {
  onNext: () => void;
}

export function CheckoutStep1({ onNext }: CheckoutStep1Props) {
  const items = useCartStore((state) => state.items);
  const region = useRegionStore((state) => state.region);
  const { data: smartCart, isLoading } = useSmartCart(region);

  return (
    <div className="space-y-6">
      {/* Game list */}
      <div className="bg-card rounded-2xl border border-border/40 overflow-hidden">
        <div className="px-5 py-4 border-b border-border/40">
          <h2 className="font-bold text-white">Ваши игры</h2>
        </div>
        <div className="divide-y divide-border/40">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4 px-5 py-4">
              <div className="relative flex-shrink-0 w-14 h-20 rounded-lg overflow-hidden bg-white/5">
                {item.product.imageUrl ? (
                  <Image
                    src={item.product.imageUrl}
                    alt={item.product.title}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                ) : (
                  <div className="w-full h-full bg-white/10" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{item.product.title}</p>
                {item.product.edition && (
                  <p className="text-xs text-muted mt-0.5">{item.product.edition}</p>
                )}
                <p className="text-xs text-muted mt-0.5">× {item.quantity}</p>
                <p className="text-sm font-bold text-white mt-2">
                  {formatPrice(item.product.price * item.quantity)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Smart cart breakdown */}
      {isLoading ? (
        <div className="bg-card rounded-2xl border border-border/40 p-5 animate-pulse">
          <div className="h-4 bg-white/10 rounded w-1/2 mb-4" />
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-8 bg-white/10 rounded-lg" />
            ))}
          </div>
        </div>
      ) : smartCart ? (
        <div className="bg-card rounded-2xl border border-border/40 overflow-hidden">
          <div className="px-5 py-4 border-b border-border/40">
            <h2 className="font-bold text-white">Карты пополнения</h2>
            <p className="text-xs text-muted mt-0.5">Что будет куплено</p>
          </div>
          <div className="px-5 py-4 space-y-3">
            {smartCart.cards.map((card, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    'inline-flex items-center gap-1 px-2.5 py-1 rounded-lg',
                    'text-xs font-semibold bg-accent/20 text-white border border-accent/30',
                  )}>
                    <CreditCard size={10} />
                    {card.denomination} {card.currency}
                  </span>
                  <span className="text-sm text-muted">× {card.quantity}</span>
                </div>
                <span className="text-sm font-semibold text-white">
                  {formatPrice(card.totalInRub)}
                </span>
              </div>
            ))}
          </div>
          <div className="px-5 py-4 border-t border-border/40 flex items-center justify-between">
            <span className="text-sm text-muted">Итого</span>
            <span className="text-xl font-bold text-white">{formatPrice(smartCart.totalInRub)}</span>
          </div>
        </div>
      ) : null}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Link
          href="/cart"
          className="flex items-center gap-2 text-sm text-muted hover:text-white transition-colors duration-200"
        >
          <ArrowLeft size={14} />
          Вернуться в корзину
        </Link>
        <div className="flex-1" />
        <button
          onClick={onNext}
          disabled={items.length === 0}
          className={cn(
            'flex items-center gap-2 h-12 px-8 rounded-xl',
            'bg-accent hover:bg-accent-hover',
            'text-white font-bold text-sm',
            'transition-all duration-300',
            'disabled:opacity-50 disabled:cursor-not-allowed',
          )}
        >
          Далее: Контакты
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

export default CheckoutStep1;
