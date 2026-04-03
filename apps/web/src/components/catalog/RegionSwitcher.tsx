'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { Region } from '@/types';

export interface RegionSwitcherProps {
  value: Region;
  onChange: (region: Region) => void;
  compact?: boolean;
  className?: string;
}

const REGIONS: { value: Region; flag: string; label: string; short: string }[] = [
  { value: 'TURKEY', flag: '🇹🇷', label: 'Турция', short: 'TR' },
  { value: 'INDIA', flag: '🇮🇳', label: 'Индия', short: 'IN' },
  { value: 'UKRAINE', flag: '🇺🇦', label: 'Украина', short: 'UA' },
];

export function RegionSwitcher({ value, onChange, compact = false, className }: RegionSwitcherProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center p-1 rounded-xl border border-border bg-card/60 backdrop-blur-sm',
        className,
      )}
      role="radiogroup"
      aria-label="Выбор региона"
    >
      {REGIONS.map((region) => {
        const isActive = value === region.value;
        return (
          <button
            key={region.value}
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(region.value)}
            title={region.label}
            className={cn(
              'relative flex items-center gap-1.5 rounded-lg px-3 py-1.5',
              'text-sm font-semibold',
              'transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
              isActive
                ? 'bg-accent text-white shadow-[0_0_12px_rgba(0,48,135,0.5)]'
                : 'text-muted hover:text-white hover:bg-white/8',
            )}
          >
            <span>{region.flag}</span>
            <span className={compact ? 'hidden sm:inline' : undefined}>{compact ? region.short : region.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default RegionSwitcher;
