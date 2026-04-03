import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/utils';
import type { Region } from '@/types';

export interface SubscriptionCompareProps {
  region: Region;
  className?: string;
}

interface PSTier {
  name: 'Essential' | 'Extra' | 'Deluxe';
  highlighted?: boolean;
  monthly: number;
  quarterly: number;
  annual: number;
  features: { label: string; included: boolean }[];
}

// Regional pricing in RUB (approximate, update as needed)
const TIERS: Record<Region, PSTier[]> = {
  TURKEY: [
    {
      name: 'Essential',
      monthly: 299,
      quarterly: 749,
      annual: 2299,
      features: [
        { label: 'Онлайн-мультиплеер', included: true },
        { label: 'Ежемесячные игры', included: true },
        { label: 'Эксклюзивные скидки', included: true },
        { label: 'Облачное хранилище 100 ГБ', included: true },
        { label: 'Каталог игр Extra (400+ игр)', included: false },
        { label: 'Классика и Ubisoft+ Classics', included: false },
        { label: 'Стриминг игр', included: false },
      ],
    },
    {
      name: 'Extra',
      highlighted: true,
      monthly: 499,
      quarterly: 1299,
      annual: 3999,
      features: [
        { label: 'Онлайн-мультиплеер', included: true },
        { label: 'Ежемесячные игры', included: true },
        { label: 'Эксклюзивные скидки', included: true },
        { label: 'Облачное хранилище 100 ГБ', included: true },
        { label: 'Каталог игр Extra (400+ игр)', included: true },
        { label: 'Классика и Ubisoft+ Classics', included: false },
        { label: 'Стриминг игр', included: false },
      ],
    },
    {
      name: 'Deluxe',
      monthly: 699,
      quarterly: 1799,
      annual: 5499,
      features: [
        { label: 'Онлайн-мультиплеер', included: true },
        { label: 'Ежемесячные игры', included: true },
        { label: 'Эксклюзивные скидки', included: true },
        { label: 'Облачное хранилище 100 ГБ', included: true },
        { label: 'Каталог игр Extra (400+ игр)', included: true },
        { label: 'Классика и Ubisoft+ Classics', included: true },
        { label: 'Стриминг игр', included: true },
      ],
    },
  ],
  INDIA: [
    {
      name: 'Essential',
      monthly: 229,
      quarterly: 599,
      annual: 1799,
      features: [
        { label: 'Онлайн-мультиплеер', included: true },
        { label: 'Ежемесячные игры', included: true },
        { label: 'Эксклюзивные скидки', included: true },
        { label: 'Облачное хранилище 100 ГБ', included: true },
        { label: 'Каталог игр Extra (400+ игр)', included: false },
        { label: 'Классика и Ubisoft+ Classics', included: false },
        { label: 'Стриминг игр', included: false },
      ],
    },
    {
      name: 'Extra',
      highlighted: true,
      monthly: 399,
      quarterly: 999,
      annual: 2999,
      features: [
        { label: 'Онлайн-мультиплеер', included: true },
        { label: 'Ежемесячные игры', included: true },
        { label: 'Эксклюзивные скидки', included: true },
        { label: 'Облачное хранилище 100 ГБ', included: true },
        { label: 'Каталог игр Extra (400+ игр)', included: true },
        { label: 'Классика и Ubisoft+ Classics', included: false },
        { label: 'Стриминг игр', included: false },
      ],
    },
    {
      name: 'Deluxe',
      monthly: 549,
      quarterly: 1399,
      annual: 4199,
      features: [
        { label: 'Онлайн-мультиплеер', included: true },
        { label: 'Ежемесячные игры', included: true },
        { label: 'Эксклюзивные скидки', included: true },
        { label: 'Облачное хранилище 100 ГБ', included: true },
        { label: 'Каталог игр Extra (400+ игр)', included: true },
        { label: 'Классика и Ubisoft+ Classics', included: true },
        { label: 'Стриминг игр', included: true },
      ],
    },
  ],
  UKRAINE: [
    {
      name: 'Essential',
      monthly: 259,
      quarterly: 649,
      annual: 1999,
      features: [
        { label: 'Онлайн-мультиплеер', included: true },
        { label: 'Ежемесячные игры', included: true },
        { label: 'Эксклюзивные скидки', included: true },
        { label: 'Облачное хранилище 100 ГБ', included: true },
        { label: 'Каталог игр Extra (400+ игр)', included: false },
        { label: 'Классика и Ubisoft+ Classics', included: false },
        { label: 'Стриминг игр', included: false },
      ],
    },
    {
      name: 'Extra',
      highlighted: true,
      monthly: 449,
      quarterly: 1099,
      annual: 3299,
      features: [
        { label: 'Онлайн-мультиплеер', included: true },
        { label: 'Ежемесячные игры', included: true },
        { label: 'Эксклюзивные скидки', included: true },
        { label: 'Облачное хранилище 100 ГБ', included: true },
        { label: 'Каталог игр Extra (400+ игр)', included: true },
        { label: 'Классика и Ubisoft+ Classics', included: false },
        { label: 'Стриминг игр', included: false },
      ],
    },
    {
      name: 'Deluxe',
      monthly: 599,
      quarterly: 1499,
      annual: 4499,
      features: [
        { label: 'Онлайн-мультиплеер', included: true },
        { label: 'Ежемесячные игры', included: true },
        { label: 'Эксклюзивные скидки', included: true },
        { label: 'Облачное хранилище 100 ГБ', included: true },
        { label: 'Каталог игр Extra (400+ игр)', included: true },
        { label: 'Классика и Ubisoft+ Classics', included: true },
        { label: 'Стриминг игр', included: true },
      ],
    },
  ],
};

export function SubscriptionCompare({ region, className }: SubscriptionCompareProps) {
  const tiers = TIERS[region];
  const allFeatures = tiers[0].features.map((f) => f.label);

  return (
    <div className={cn('w-full overflow-x-auto', className)}>
      <div className="min-w-[600px]">
        {/* Column headers */}
        <div className="grid grid-cols-4 gap-3 mb-3">
          <div className="col-span-1" />
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={cn(
                'rounded-xl p-4 text-center border',
                tier.highlighted
                  ? 'bg-accent/20 border-accent shadow-[0_0_24px_rgba(0,48,135,0.3)]'
                  : 'bg-card border-border',
              )}
            >
              {tier.highlighted && (
                <span className="text-[10px] font-bold text-accent-hover uppercase tracking-widest block mb-1">
                  Популярный
                </span>
              )}
              <div className={cn('text-lg font-bold', tier.highlighted ? 'text-white' : 'text-foreground')}>
                PS Plus
              </div>
              <div
                className={cn(
                  'text-sm font-semibold mt-0.5',
                  tier.highlighted ? 'text-accent-hover' : 'text-muted',
                )}
              >
                {tier.name}
              </div>
              <div className="mt-3 text-xl font-extrabold text-white">
                {formatPrice(tier.monthly)}
                <span className="text-xs font-normal text-muted">/мес</span>
              </div>
              <div className="text-xs text-muted mt-1">
                {formatPrice(tier.annual)}/год
              </div>
            </div>
          ))}
        </div>

        {/* Feature rows */}
        {allFeatures.map((feature, rowIdx) => (
          <div
            key={rowIdx}
            className={cn(
              'grid grid-cols-4 gap-3 py-3 border-b border-border/40',
              rowIdx % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.02]',
            )}
          >
            <div className="col-span-1 flex items-center text-sm text-muted px-2">{feature}</div>
            {tiers.map((tier) => {
              const f = tier.features[rowIdx];
              return (
                <div
                  key={tier.name}
                  className={cn(
                    'flex items-center justify-center',
                    tier.highlighted ? 'text-accent-hover' : 'text-muted',
                  )}
                >
                  {f.included ? (
                    <Check
                      size={18}
                      className={tier.highlighted ? 'text-discount-green' : 'text-muted'}
                      strokeWidth={2.5}
                    />
                  ) : (
                    <span className="w-4 h-0.5 bg-border rounded-full block" />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export default SubscriptionCompare;
