'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface StatCardProps {
  title: string;
  value: string | number;
  delta?: string | number;
  deltaType?: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  isLoading?: boolean;
  className?: string;
}

export function StatCard({
  title,
  value,
  delta,
  deltaType = 'neutral',
  icon,
  isLoading = false,
  className,
}: StatCardProps) {
  const deltaColors = {
    positive: 'text-[#00C853]',
    negative: 'text-[#FF1744]',
    neutral: 'text-[#B0B0B0]',
  };

  const DeltaIcon = deltaType === 'positive' ? TrendingUp : deltaType === 'negative' ? TrendingDown : Minus;

  if (isLoading) {
    return (
      <div
        className={cn(
          'bg-[#1E2030] border border-[#2D2D4A] rounded-2xl p-5',
          'shadow-[0_4px_24px_rgba(0,0,0,0.3)]',
          className,
        )}
      >
        <div className="flex items-start justify-between mb-4">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <Skeleton className="w-16 h-5 rounded-full" />
        </div>
        <Skeleton className="w-32 h-8 mb-2 rounded-lg" />
        <Skeleton className="w-24 h-4 rounded-md" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'bg-[#1E2030] border border-[#2D2D4A] rounded-2xl p-5',
        'shadow-[0_4px_24px_rgba(0,0,0,0.3)]',
        'hover:border-[#003087]/50 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
        'group',
        className,
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-[#003087]/20 flex items-center justify-center text-[#4DA6FF] group-hover:bg-[#003087]/30 transition-colors duration-300">
          {icon}
        </div>
        {delta != null && (
          <div className={cn('flex items-center gap-1 text-xs font-semibold', deltaColors[deltaType])}>
            <DeltaIcon size={12} />
            {delta}
          </div>
        )}
      </div>
      <div className="text-2xl font-extrabold text-white mb-1 tabular-nums">{value}</div>
      <div className="text-xs font-medium text-[#B0B0B0] uppercase tracking-wider">{title}</div>
    </div>
  );
}

export default StatCard;
