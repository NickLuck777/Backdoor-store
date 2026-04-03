'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CartBadgeProps {
  count: number;
  onClick: () => void;
  className?: string;
}

export function CartBadge({ count, onClick, className }: CartBadgeProps) {
  const [prevCount, setPrevCount] = React.useState(count);
  const [bump, setBump] = React.useState(false);

  React.useEffect(() => {
    if (count > prevCount) {
      setBump(true);
      setTimeout(() => setBump(false), 400);
    }
    setPrevCount(count);
  }, [count, prevCount]);

  return (
    <button
      onClick={onClick}
      aria-label={`Корзина — ${count} товаров`}
      className={cn(
        'relative flex items-center justify-center w-10 h-10 rounded-xl',
        'text-muted hover:text-white hover:bg-white/10',
        'transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
        className,
      )}
    >
      <motion.div
        animate={bump ? { scale: [1, 1.25, 1] } : { scale: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        <ShoppingCart size={22} />
      </motion.div>
      <AnimatePresence>
        {count > 0 && (
          <motion.span
            key="badge"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className={cn(
              'absolute -top-1 -right-1',
              'min-w-[18px] h-[18px] px-1',
              'bg-discount-red text-white text-[10px] font-bold leading-none',
              'rounded-full flex items-center justify-center',
              'shadow-[0_2px_8px_rgba(255,23,68,0.5)]',
            )}
          >
            {count > 99 ? '99+' : count}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

export default CartBadge;
