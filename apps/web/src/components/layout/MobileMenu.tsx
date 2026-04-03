'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gamepad2, Search, Star, CreditCard, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RegionSwitcher } from '@/components/catalog/RegionSwitcher';
import { useRegionStore } from '@/lib/store/regionStore';

export interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

const NAV_LINKS = [
  { href: '/catalog', label: 'Каталог', icon: Gamepad2 },
  { href: '/search', label: 'Поиск', icon: Search },
  { href: '/catalog?type=SUBSCRIPTION', label: 'PS Plus', icon: Star },
  { href: '/catalog?type=TOPUP_CARD', label: 'Пополнение', icon: CreditCard },
  { href: '/auth/login', label: 'Войти', icon: User },
];

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const region = useRegionStore((state) => state.region);
  const setRegion = useRegionStore((state) => state.setRegion);

  // Lock scroll
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            className={cn(
              'fixed left-0 top-0 bottom-0 z-50 w-72',
              'bg-card border-r border-border',
              'flex flex-col',
              'shadow-[8px_0_48px_rgba(0,0,0,0.6)]',
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 h-16 border-b border-border flex-shrink-0">
              <Link href="/" onClick={onClose} className="flex items-center">
                <span className="text-xl font-extrabold text-white">reloc</span>
                <span className="text-xl font-extrabold text-accent-hover">.store</span>
              </Link>
              <button
                onClick={onClose}
                className="flex items-center justify-center w-9 h-9 rounded-xl text-muted hover:text-white hover:bg-white/10 transition-all duration-200"
              >
                <X size={18} />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4 px-3">
              <ul className="flex flex-col gap-1">
                {NAV_LINKS.map((link, i) => {
                  const Icon = link.icon;
                  return (
                    <motion.li
                      key={link.href}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 + i * 0.05, duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                    >
                      <Link
                        href={link.href}
                        onClick={onClose}
                        className={cn(
                          'flex items-center gap-3 px-4 py-3.5 rounded-xl',
                          'text-base font-semibold text-muted',
                          'hover:text-white hover:bg-white/8',
                          'transition-all duration-200',
                        )}
                      >
                        <Icon size={20} className="flex-shrink-0" />
                        {link.label}
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>
            </nav>

            {/* Region switcher at bottom */}
            <div className="px-5 py-5 border-t border-border flex-shrink-0">
              <p className="text-xs text-muted font-semibold uppercase tracking-widest mb-3">
                Регион
              </p>
              <RegionSwitcher
                value={region}
                onChange={(r) => {
                  setRegion(r);
                }}
                className="w-full justify-stretch"
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default MobileMenu;
