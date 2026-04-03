'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/lib/store/cartStore';

interface MiniCartProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MiniCart({ isOpen, onClose }: MiniCartProps) {
  const items = useCartStore((state) => state.items);
  const totalPrice = useCartStore((state) => state.totalPrice);

  const lastThree = items.slice(-3).reverse();

  // Close on Escape
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.aside
            key="sidebar"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className={cn(
              'fixed top-0 right-0 bottom-0 z-50',
              'w-full max-w-sm',
              'bg-background border-l border-border/40',
              'flex flex-col',
              'shadow-[−8px_0_40px_rgba(0,0,0,0.6)]',
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
              <div className="flex items-center gap-2">
                <ShoppingCart size={18} className="text-accent-hover" />
                <span className="font-bold text-white">Корзина</span>
                {items.length > 0 && (
                  <span className="text-xs text-muted">({items.length})</span>
                )}
              </div>
              <button
                onClick={onClose}
                aria-label="Закрыть корзину"
                className="w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:text-white hover:bg-white/10 transition-all duration-200"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
                    <ShoppingCart size={28} className="text-muted" />
                  </div>
                  <p className="text-muted text-sm">Корзина пуста</p>
                  <Link
                    href="/catalog"
                    onClick={onClose}
                    className="text-sm text-accent-hover hover:underline"
                  >
                    Перейти в каталог
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {lastThree.map((item) => (
                    <div key={item.id} className="flex gap-3 p-3 bg-card rounded-xl border border-border/40">
                      {/* Cover */}
                      <div className="relative flex-shrink-0 w-12 h-16 rounded-lg overflow-hidden bg-white/5">
                        {item.product.imageUrl ? (
                          <Image
                            src={item.product.imageUrl}
                            alt={item.product.title}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        ) : (
                          <div className="w-full h-full bg-white/10" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white leading-tight line-clamp-2">
                          {item.product.title}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-muted">× {item.quantity}</p>
                          <p className="text-sm font-bold text-white">
                            {formatPrice(item.product.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {items.length > 3 && (
                    <p className="text-xs text-center text-muted">
                      + ещё {items.length - 3} товар{items.length - 3 > 1 ? 'а' : ''}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="px-5 py-4 border-t border-border/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted">Итого</span>
                  <span className="text-lg font-bold text-white">{formatPrice(totalPrice())}</span>
                </div>

                <Link
                  href="/cart"
                  onClick={onClose}
                  className={cn(
                    'flex items-center justify-center gap-2',
                    'w-full h-11 rounded-xl',
                    'border border-border text-sm font-semibold text-white',
                    'hover:border-accent/60 hover:bg-white/5',
                    'transition-all duration-200',
                  )}
                >
                  Перейти в корзину
                </Link>

                <Link
                  href="/checkout"
                  onClick={onClose}
                  className={cn(
                    'flex items-center justify-center gap-2',
                    'w-full h-11 rounded-xl',
                    'bg-accent hover:bg-accent-hover',
                    'text-sm font-bold text-white',
                    'transition-all duration-300',
                  )}
                >
                  Оформить заказ
                  <ArrowRight size={16} />
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export default MiniCart;
