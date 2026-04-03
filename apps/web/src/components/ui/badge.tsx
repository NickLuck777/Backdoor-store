import * as React from 'react';
import { cn } from '@/lib/utils';

export type BadgeVariant = 'discount' | 'preorder' | 'platform' | 'region' | 'new';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  label?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  discount:
    'bg-discount-green text-white font-bold text-xs px-2 py-0.5 rounded-full shadow-[0_2px_8px_rgba(0,200,83,0.4)]',
  preorder:
    'bg-ps-gold text-black font-bold text-xs px-2 py-0.5 rounded-full shadow-[0_2px_8px_rgba(255,215,0,0.4)]',
  platform:
    'bg-black/70 text-white font-semibold text-[10px] px-2 py-0.5 rounded-md border border-border backdrop-blur-sm',
  region:
    'bg-card text-muted font-medium text-xs px-2 py-0.5 rounded-md border border-border',
  new:
    'bg-accent text-white font-bold text-xs px-2 py-0.5 rounded-full shadow-[0_2px_8px_rgba(0,48,135,0.4)]',
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'new', label, className, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn('inline-flex items-center gap-1 leading-none', variantClasses[variant], className)}
        {...props}
      >
        {label ?? children}
      </span>
    );
  },
);

Badge.displayName = 'Badge';

// Pre-built badge variants for convenience
export function DiscountBadge({ pct, className }: { pct: number; className?: string }) {
  return (
    <Badge variant="discount" className={className}>
      -{pct}%
    </Badge>
  );
}

export function PreorderBadge({ className }: { className?: string }) {
  return (
    <Badge variant="preorder" className={className}>
      Предзаказ
    </Badge>
  );
}

export function PlatformBadge({ platform, className }: { platform: string; className?: string }) {
  const label = platform === 'PS4_PS5' ? 'PS4 | PS5' : platform;
  return (
    <Badge variant="platform" className={className}>
      {label}
    </Badge>
  );
}

export function RegionBadge({
  region,
  className,
}: {
  region: 'TURKEY' | 'INDIA' | 'UKRAINE';
  className?: string;
}) {
  const map: Record<string, { flag: string; label: string }> = {
    TURKEY: { flag: '🇹🇷', label: 'Турция' },
    INDIA: { flag: '🇮🇳', label: 'Индия' },
    UKRAINE: { flag: '🇺🇦', label: 'Украина' },
  };
  const { flag, label } = map[region];
  return (
    <Badge variant="region" className={className}>
      {flag} {label}
    </Badge>
  );
}

export function NewBadge({ className }: { className?: string }) {
  return (
    <Badge variant="new" className={className}>
      Новинка
    </Badge>
  );
}

export default Badge;
