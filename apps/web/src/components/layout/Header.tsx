'use client';

import * as React from 'react';
import Link from 'next/link';
import { Search, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SearchBar } from '@/components/search/SearchBar';
import { CartBadge } from '@/components/ui/CartBadge';
import { RegionSwitcher } from '@/components/catalog/RegionSwitcher';
import { useCartStore } from '@/lib/store/cartStore';
import { useRegionStore } from '@/lib/store/regionStore';

export interface HeaderProps {
  onMenuOpen?: () => void;
}

function BackdoorLogo() {
  return (
    <Link href="/" className="flex items-center gap-0 flex-shrink-0">
      <span className="text-xl font-extrabold text-white tracking-tight">backdoor</span>
      <span className="text-xl font-extrabold text-accent-hover tracking-tight">.store</span>
    </Link>
  );
}

export function Header({ onMenuOpen }: HeaderProps) {
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileSearch, setMobileSearch] = React.useState(false);
  const cartCount = useCartStore((state) => state.totalCount());
  const toggleCart = useCartStore((state) => state.toggleCart);
  const region = useRegionStore((state) => state.region);
  const setRegion = useRegionStore((state) => state.setRegion);

  React.useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-40',
        'h-16 md:h-16',
        'flex items-center',
        'transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
        scrolled
          ? 'bg-background/90 backdrop-blur-md border-b border-border/50 shadow-[0_4px_24px_rgba(0,0,0,0.4)]'
          : 'bg-transparent',
      )}
    >
      <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 flex items-center gap-4">
        {/* Mobile menu button */}
        <button
          onClick={onMenuOpen}
          className="lg:hidden flex items-center justify-center w-9 h-9 rounded-xl text-muted hover:text-white hover:bg-white/10 transition-all duration-200"
          aria-label="Меню"
        >
          <Menu size={20} />
        </button>

        {/* Logo */}
        <BackdoorLogo />

        {/* Desktop Search — center */}
        <div className="hidden md:flex flex-1 max-w-xl mx-auto">
          <SearchBar className="w-full" />
        </div>

        {/* Right actions */}
        <div className="ml-auto flex items-center gap-2">
          {/* Mobile search toggle */}
          <button
            onClick={() => setMobileSearch((v) => !v)}
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl text-muted hover:text-white hover:bg-white/10 transition-all duration-200"
            aria-label="Поиск"
          >
            <Search size={20} />
          </button>

          {/* Region switcher — desktop only */}
          <div className="hidden sm:block">
            <RegionSwitcher value={region} onChange={setRegion} compact />
          </div>

          {/* Cart */}
          <CartBadge count={cartCount} onClick={toggleCart} />

          {/* User / login */}
          <Link
            href="/auth/login"
            className={cn(
              'hidden sm:flex items-center h-9 px-4 rounded-xl text-sm font-semibold',
              'border border-border text-muted hover:text-white hover:border-accent/60',
              'transition-all duration-300',
            )}
          >
            Войти
          </Link>
        </div>
      </div>

      {/* Mobile search bar — slides down */}
      <AnimatePresence>
        {mobileSearch && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="absolute top-full left-0 right-0 bg-background/95 backdrop-blur-md border-b border-border overflow-hidden"
          >
            <div className="px-4 py-3">
              <SearchBar
                onSearch={() => setMobileSearch(false)}
                className="w-full"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export default Header;
