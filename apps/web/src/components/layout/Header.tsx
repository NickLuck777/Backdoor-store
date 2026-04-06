'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Menu, User as UserIcon, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SearchBar } from '@/components/search/SearchBar';
import { CartBadge } from '@/components/ui/CartBadge';
import { RegionSwitcher } from '@/components/catalog/RegionSwitcher';
import { useCartStore } from '@/lib/store/cartStore';
import { useRegionStore } from '@/lib/store/regionStore';
import { useAuth } from '@/lib/hooks/useAuth';

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
  const router = useRouter();
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileSearch, setMobileSearch] = React.useState(false);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const cartCount = useCartStore((state) => state.totalCount());
  const toggleCart = useCartStore((state) => state.toggleCart);
  const region = useRegionStore((state) => state.region);
  const setRegion = useRegionStore((state) => state.setRegion);
  const { user, isAuthenticated, logout } = useAuth();
  const userMenuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Close user dropdown on outside click.
  React.useEffect(() => {
    if (!userMenuOpen) return;
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    window.addEventListener('mousedown', handler);
    return () => window.removeEventListener('mousedown', handler);
  }, [userMenuOpen]);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    router.push('/');
  };

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
          {isAuthenticated ? (
            <div ref={userMenuRef} className="relative hidden sm:block">
              <button
                onClick={() => setUserMenuOpen((v) => !v)}
                className={cn(
                  'flex items-center gap-2 h-9 px-3 rounded-xl text-sm font-semibold',
                  'border border-border text-white hover:border-accent/60',
                  'transition-all duration-300',
                )}
                aria-label="Меню профиля"
                aria-expanded={userMenuOpen}
              >
                <span className="w-6 h-6 rounded-full bg-accent flex items-center justify-center">
                  <UserIcon size={14} className="text-white" />
                </span>
                <span className="max-w-[120px] truncate">
                  {user?.email?.split('@')[0] ?? 'Профиль'}
                </span>
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
                    className={cn(
                      'absolute right-0 top-full mt-2 w-56',
                      'bg-card border border-border rounded-2xl shadow-2xl',
                      'overflow-hidden',
                    )}
                  >
                    <div className="px-4 py-3 border-b border-border/50">
                      <p className="text-xs text-muted uppercase tracking-wider">
                        Аккаунт
                      </p>
                      <p className="text-sm text-white truncate mt-0.5">
                        {user?.email}
                      </p>
                    </div>
                    <Link
                      href="/account"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-white hover:bg-white/5 transition-colors"
                    >
                      <UserIcon size={16} className="text-muted" />
                      Личный кабинет
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[#FF8080] hover:bg-white/5 transition-colors text-left"
                    >
                      <LogOut size={16} />
                      Выйти
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
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
          )}
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
