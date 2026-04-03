'use client';

import * as React from 'react';
import { ArrowRight, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/utils';
import type { SmartCartResult } from '@/types';

interface SmartCartSummaryProps {
  result: SmartCartResult;
  onCheckout: () => void;
  isLoading?: boolean;
}

function DenominationChip({ denomination, currency }: { denomination: number; currency: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-lg',
        'text-xs font-semibold',
        'bg-accent/20 text-white border border-accent/30',
      )}
    >
      <CreditCard size={10} />
      {denomination} {currency}
    </span>
  );
}

export function SmartCartSummary({ result, onCheckout, isLoading }: SmartCartSummaryProps) {
  const { cards, totalInRub, overshootInRub } = result;

  const currencyLabel = cards[0]?.currency ?? 'TL';

  return (
    <div className="bg-card rounded-2xl border border-border/40 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border/40">
        <h3 className="text-base font-bold text-white">Что вы покупаете</h3>
        <p className="text-xs text-muted mt-0.5">Карты пополнения PSN</p>
      </div>

      {/* Cards breakdown */}
      <div className="px-5 py-4 space-y-3">
        {cards.map((card, idx) => (
          <div key={idx} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DenominationChip denomination={card.denomination} currency={card.currency} />
              <span className="text-sm text-muted">× {card.quantity}</span>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-white">
                {formatPrice(card.totalInRub)}
              </p>
              <p className="text-xs text-muted">
                {formatPrice(card.priceInRub)} / шт.
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Overshoot note */}
      {overshootInRub > 0 && (
        <div className="mx-5 mb-4 px-3 py-2 rounded-lg bg-discount-green/10 border border-discount-green/20">
          <p className="text-xs text-discount-green">
            На балансе останется:{' '}
            <span className="font-semibold">
              {Math.round(overshootInRub / (totalInRub / cards.reduce((a, c) => a + c.denomination * c.quantity, 0)))} {currencyLabel}
            </span>
          </p>
        </div>
      )}

      {/* Total */}
      <div className="px-5 py-4 border-t border-border/40">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-muted">Итого к оплате</span>
          <span className="text-xl font-bold text-white">{formatPrice(totalInRub)}</span>
        </div>

        <button
          onClick={onCheckout}
          disabled={isLoading}
          className={cn(
            'w-full flex items-center justify-center gap-2',
            'h-12 rounded-xl',
            'bg-accent hover:bg-accent-hover',
            'text-white font-bold text-base',
            'transition-all duration-300',
            'disabled:opacity-50 disabled:cursor-not-allowed',
          )}
        >
          Оформить заказ
          <ArrowRight size={18} />
        </button>

        <p className="text-center text-xs text-muted mt-3">
          Оплата через СБП
        </p>
      </div>
    </div>
  );
}

function SmartCartSummarySkeleton() {
  return (
    <div className="bg-card rounded-2xl border border-border/40 overflow-hidden animate-pulse">
      <div className="px-5 py-4 border-b border-border/40">
        <div className="h-4 bg-white/10 rounded w-2/3" />
        <div className="h-3 bg-white/10 rounded w-1/2 mt-2" />
      </div>
      <div className="px-5 py-4 space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="h-6 bg-white/10 rounded-lg w-24" />
            <div className="h-4 bg-white/10 rounded w-16" />
          </div>
        ))}
      </div>
      <div className="px-5 py-4 border-t border-border/40">
        <div className="h-12 bg-white/10 rounded-xl" />
      </div>
    </div>
  );
}

SmartCartSummary.Skeleton = SmartCartSummarySkeleton;

export default SmartCartSummary;
