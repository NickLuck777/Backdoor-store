'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FilterState, CategoryDto, Region, ProductType, Platform } from '@/types';
import { Button } from '@/components/ui/button';

export interface FilterPanelProps {
  filters: FilterState;
  categories: CategoryDto[];
  onFiltersChange: (filters: FilterState) => void;
  isLoading?: boolean;
  className?: string;
}

const REGIONS: { value: Region; flag: string; label: string }[] = [
  { value: 'TURKEY', flag: '🇹🇷', label: 'Турция' },
  { value: 'INDIA', flag: '🇮🇳', label: 'Индия' },
  { value: 'UKRAINE', flag: '🇺🇦', label: 'Украина' },
];

const TYPES: { value: ProductType; label: string }[] = [
  { value: 'GAME', label: 'Игра' },
  { value: 'SUBSCRIPTION', label: 'Подписка' },
  { value: 'TOPUP_CARD', label: 'Пополнение' },
  { value: 'ACCOUNT', label: 'Аккаунт' },
];

const PLATFORMS: { value: Platform; label: string }[] = [
  { value: 'PS4', label: 'PS4' },
  { value: 'PS5', label: 'PS5' },
  { value: 'PS4_PS5', label: 'PS4 + PS5' },
];

function FilterSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <div className="border-b border-border/40 pb-4">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between py-3 text-sm font-semibold text-foreground hover:text-white transition-colors duration-200"
      >
        {title}
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          className="text-muted"
        >
          <ChevronDown size={15} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: React.ReactNode;
}) {
  // Whole row is clickable — both the box and the text label toggle the
  // filter. Implemented as a <button> rather than a real <label>+<input>
  // pair so we don't end up with duplicate-toggle bugs from bubbling, and
  // so the entire row gets keyboard focus / Enter/Space handling for free.
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex items-center gap-2.5 cursor-pointer group py-1 w-full text-left"
    >
      <span
        className={cn(
          'w-4 h-4 rounded-[4px] border-2 flex items-center justify-center flex-shrink-0',
          'transition-all duration-200',
          checked
            ? 'bg-accent border-accent'
            : 'border-border group-hover:border-accent/50',
        )}
      >
        {checked && (
          <svg viewBox="0 0 10 8" className="w-2.5 h-2 fill-none stroke-white stroke-[2]">
            <polyline points="1,4 3.5,7 9,1" />
          </svg>
        )}
      </span>
      <span className="text-sm text-muted group-hover:text-foreground transition-colors duration-200 select-none">
        {label}
      </span>
    </button>
  );
}

export function FilterPanel({
  filters,
  categories,
  onFiltersChange,
  isLoading = false,
  className,
}: FilterPanelProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const update = (partial: Partial<FilterState>) =>
    onFiltersChange({ ...filters, ...partial, page: 1 });

  const toggleRegion = (region: Region) => {
    const current = filters.region;
    update({ region: current === region ? undefined : region });
  };

  const toggleType = (type: ProductType) => {
    const current = filters.types ?? [];
    update({
      types: current.includes(type) ? current.filter((t) => t !== type) : [...current, type],
    });
  };

  const togglePlatform = (platform: Platform) => {
    const current = filters.platforms ?? [];
    update({
      platforms: current.includes(platform)
        ? current.filter((p) => p !== platform)
        : [...current, platform],
    });
  };

  const reset = () => onFiltersChange({});

  const hasActiveFilters =
    filters.region ||
    (filters.types && filters.types.length > 0) ||
    (filters.platforms && filters.platforms.length > 0) ||
    filters.minPrice != null ||
    filters.maxPrice != null ||
    filters.hasDiscount ||
    filters.categorySlug;

  const panelContent = (
    <div className={cn('flex flex-col gap-0', isLoading && 'opacity-50 pointer-events-none')}>
      {/* Reset */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-muted uppercase tracking-widest">Фильтры</span>
        {hasActiveFilters && (
          <button
            onClick={reset}
            className="text-xs text-accent-hover hover:text-white transition-colors duration-200"
          >
            Сбросить
          </button>
        )}
      </div>

      {/* Region */}
      <FilterSection title="Регион">
        <div className="flex flex-wrap gap-2 mt-1">
          {REGIONS.map((r) => (
            <button
              key={r.value}
              onClick={() => toggleRegion(r.value)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border',
                'transition-all duration-200',
                filters.region === r.value
                  ? 'bg-accent border-accent text-white shadow-[0_0_12px_rgba(0,48,135,0.4)]'
                  : 'border-border text-muted hover:border-accent/50 hover:text-white',
              )}
            >
              {r.flag} {r.label}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Type */}
      <FilterSection title="Тип товара">
        <div className="flex flex-col mt-1">
          {TYPES.map((t) => (
            <Checkbox
              key={t.value}
              checked={(filters.types ?? []).includes(t.value)}
              onChange={() => toggleType(t.value)}
              label={t.label}
            />
          ))}
        </div>
      </FilterSection>

      {/* Platform */}
      <FilterSection title="Платформа">
        <div className="flex flex-col mt-1">
          {PLATFORMS.map((p) => (
            <Checkbox
              key={p.value}
              checked={(filters.platforms ?? []).includes(p.value)}
              onChange={() => togglePlatform(p.value)}
              label={p.label}
            />
          ))}
        </div>
      </FilterSection>

      {/* Price range */}
      <FilterSection title="Цена, ₽">
        <div className="flex items-center gap-2 mt-2">
          <input
            type="number"
            placeholder="От"
            value={filters.minPrice ?? ''}
            onChange={(e) => update({ minPrice: e.target.value ? Number(e.target.value) : undefined })}
            className={cn(
              'w-full h-9 bg-input border border-border rounded-lg text-sm text-foreground px-3',
              'placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent',
              'transition-all duration-200',
            )}
          />
          <span className="text-muted text-sm flex-shrink-0">—</span>
          <input
            type="number"
            placeholder="До"
            value={filters.maxPrice ?? ''}
            onChange={(e) => update({ maxPrice: e.target.value ? Number(e.target.value) : undefined })}
            className={cn(
              'w-full h-9 bg-input border border-border rounded-lg text-sm text-foreground px-3',
              'placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent',
              'transition-all duration-200',
            )}
          />
        </div>
      </FilterSection>

      {/* Has discount */}
      <FilterSection title="Скидки" defaultOpen={false}>
        <div className="mt-1">
          <Checkbox
            checked={filters.hasDiscount ?? false}
            onChange={(v) => update({ hasDiscount: v || undefined })}
            label="Только со скидкой"
          />
        </div>
      </FilterSection>

      {/* Genre/Category */}
      {categories.length > 0 && (
        <FilterSection title="Жанр" defaultOpen={false}>
          <div className="flex flex-col mt-1 max-h-48 overflow-y-auto pr-1 custom-scroll">
            {categories.map((cat) => (
              <Checkbox
                key={cat.slug}
                checked={filters.categorySlug === cat.slug}
                onChange={(v) => update({ categorySlug: v ? cat.slug : undefined })}
                label={cat.name}
              />
            ))}
          </div>
        </FilterSection>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className={cn('hidden lg:block w-56 flex-shrink-0', className)}>
        {panelContent}
      </aside>

      {/* Mobile: floating button + drawer */}
      <div className="lg:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setMobileOpen(true)}
          className="flex items-center gap-2"
        >
          <SlidersHorizontal size={15} />
          Фильтры
          {hasActiveFilters && (
            <span className="ml-1 bg-accent text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
              !
            </span>
          )}
        </Button>

        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
                onClick={() => setMobileOpen(false)}
              />
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                className={cn(
                  'fixed left-0 top-0 bottom-0 z-50 w-72',
                  'bg-card border-r border-border',
                  'overflow-y-auto p-5',
                  'shadow-[8px_0_40px_rgba(0,0,0,0.5)]',
                )}
              >
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-base font-bold text-white">Фильтры</h2>
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="text-muted hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
                {panelContent}
                <div className="mt-5 pt-4 border-t border-border">
                  <Button
                    variant="default"
                    size="md"
                    className="w-full"
                    onClick={() => setMobileOpen(false)}
                  >
                    Применить
                  </Button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

export default FilterPanel;
