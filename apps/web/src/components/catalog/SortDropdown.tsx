'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface SortDropdownProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const SORT_OPTIONS = [
  { value: 'popular', label: 'По популярности' },
  { value: 'price_asc', label: 'Сначала дешевле' },
  { value: 'price_desc', label: 'Сначала дороже' },
  { value: 'discount', label: 'Максимальная скидка' },
  { value: 'newest', label: 'Новинки' },
];

export function SortDropdown({ value, onChange, className }: SortDropdownProps) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  const selectedLabel = SORT_OPTIONS.find((o) => o.value === value)?.label ?? 'Сортировка';

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex items-center gap-2 h-10 px-4 rounded-xl',
          'bg-card border border-border text-sm text-foreground font-medium',
          'hover:border-accent/50 hover:text-white',
          'transition-all duration-300',
          open && 'border-accent',
        )}
      >
        {selectedLabel}
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          className="text-muted"
        >
          <ChevronDown size={16} />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            className={cn(
              'absolute right-0 top-full mt-2 z-50 min-w-[220px]',
              'bg-card border border-border rounded-xl overflow-hidden py-1',
              'shadow-[0_16px_40px_rgba(0,0,0,0.5)]',
            )}
          >
            {SORT_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={cn(
                  'w-full text-left px-4 py-2.5 text-sm transition-colors duration-200',
                  value === option.value
                    ? 'text-white bg-accent/20 font-semibold'
                    : 'text-muted hover:bg-[#2E2E50] hover:text-white',
                )}
              >
                {option.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SortDropdown;
