'use client';

import * as React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/utils';
import { useSearch } from '@/lib/hooks/useProducts';

export interface SearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  onSearch,
  placeholder = 'Поиск игр, подписок, пополнений...',
  className,
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = React.useState('');
  const [focused, setFocused] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const { data: searchData, isLoading } = useSearch(query);
  const results = searchData?.products?.slice(0, 5) ?? [];

  const showDropdown = focused && query.trim().length >= 2;

  // Close on outside click
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setFocused(false);
      inputRef.current?.blur();
    }
    if (e.key === 'Enter' && query.trim()) {
      setFocused(false);
      onSearch?.(query);
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleClear = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  const handleResultClick = (slug: string, region: string) => {
    const regionPath: Record<string, string> = {
      TURKEY: 'tr',
      INDIA: 'in',
      UKRAINE: 'ua',
    };
    setFocused(false);
    setQuery('');
    router.push(`/product/${regionPath[region] ?? 'tr'}/${slug}`);
  };

  return (
    <div ref={containerRef} className={cn('relative w-full max-w-xl', className)}>
      {/* Input */}
      <div
        className={cn(
          'flex items-center h-10 rounded-xl border bg-input',
          'transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
          focused
            ? 'border-accent ring-1 ring-accent shadow-[0_0_16px_rgba(0,48,135,0.3)]'
            : 'border-border hover:border-border/70',
        )}
      >
        <span className="pl-3 text-muted flex items-center flex-shrink-0">
          <Search size={16} />
        </span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            'flex-1 h-full bg-transparent px-3 text-sm text-foreground',
            'placeholder:text-muted outline-none',
          )}
        />
        {query && (
          <button
            onClick={handleClear}
            className="pr-3 text-muted hover:text-white transition-colors duration-200 flex items-center"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className={cn(
              'absolute top-full mt-2 left-0 right-0 z-50',
              'bg-card border border-border rounded-xl overflow-hidden',
              'shadow-[0_16px_40px_rgba(0,0,0,0.6)]',
            )}
          >
            {isLoading ? (
              <div className="flex flex-col gap-0">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3">
                    <div className="w-8 h-10 rounded bg-[#2A2A4A] flex-shrink-0 animate-pulse" />
                    <div className="flex-1 flex flex-col gap-1.5">
                      <div className="h-3 w-3/4 bg-[#2A2A4A] rounded animate-pulse" />
                      <div className="h-2.5 w-1/3 bg-[#2A2A4A] rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : results.length > 0 ? (
              <>
                {results.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleResultClick(product.slug, product.region)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3',
                      'hover:bg-[#2E2E50] transition-colors duration-200 text-left',
                      'border-b border-border/40 last:border-b-0',
                    )}
                  >
                    {/* Cover thumbnail */}
                    <div className="w-8 h-10 rounded overflow-hidden flex-shrink-0 bg-[#2A2A4A]">
                      {product.imageUrl ? (
                        <Image
                          src={product.imageUrl}
                          alt={product.title}
                          width={32}
                          height={40}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-accent to-accent-hover" />
                      )}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground font-medium truncate">{product.title}</p>
                      <p className="text-xs text-muted truncate">
                        {product.edition ?? product.type}
                      </p>
                    </div>
                    {/* Price */}
                    <span className="text-sm font-bold text-white flex-shrink-0">
                      {formatPrice(product.price)}
                    </span>
                  </button>
                ))}
                {/* "Show all results" */}
                <button
                  onClick={() => {
                    setFocused(false);
                    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
                  }}
                  className={cn(
                    'w-full flex items-center justify-center gap-2 px-4 py-3',
                    'text-sm text-accent-hover hover:text-white hover:bg-[#2E2E50]',
                    'transition-colors duration-200 font-medium',
                  )}
                >
                  <Search size={14} />
                  Смотреть все результаты для &quot;{query}&quot;
                </button>
              </>
            ) : (
              <div className="px-4 py-6 text-center text-muted text-sm">
                Ничего не найдено по запросу &quot;{query}&quot;
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SearchBar;
