'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/lib/store/cartStore';
import { useRegionStore } from '@/lib/store/regionStore';
import { useSmartCart } from '@/lib/hooks/useCart';
import { CartItem } from '@/components/cart/CartItem';
import { SmartCartSummary } from '@/components/cart/SmartCartSummary';

export default function CartPage() {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clearCart);
  const region = useRegionStore((state) => state.region);

  const { data: smartCart, isLoading: smartLoading } = useSmartCart(region);

  function handleRemove(productId: number) {
    removeItem(productId);
    toast('Удалено', { icon: '🗑', style: { background: '#242444', color: '#fff' } });
  }

  function handleUpdateQuantity(productId: number, quantity: number) {
    updateQuantity(productId, quantity);
  }

  function handleClearCart() {
    clearCart();
    toast('Корзина очищена', { style: { background: '#242444', color: '#fff' } });
  }

  function handleCheckout() {
    router.push('/checkout');
  }

  const isEmpty = items.length === 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        {/* Page title */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white">Корзина</h1>
          {!isEmpty && (
            <button
              onClick={handleClearCart}
              className="flex items-center gap-1.5 text-sm text-muted hover:text-discount-red transition-colors duration-200"
            >
              <Trash2 size={14} />
              Очистить корзину
            </button>
          )}
        </div>

        {isEmpty ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-24 h-24 rounded-3xl bg-white/5 flex items-center justify-center mb-6">
              <ShoppingCart size={40} className="text-muted" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Корзина пуста</h2>
            <p className="text-muted mb-8 max-w-xs">
              Добавьте игры или подписки PlayStation, чтобы продолжить
            </p>
            <Link
              href="/catalog"
              className={cn(
                'flex items-center justify-center h-11 px-8 rounded-xl',
                'bg-accent hover:bg-accent-hover',
                'text-white font-semibold text-sm',
                'transition-all duration-300',
              )}
            >
              Перейти в каталог
            </Link>
          </div>
        ) : (
          /* Two-column layout */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left — Cart items (2/3) */}
            <div className="lg:col-span-2 space-y-3">
              {items.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onRemove={handleRemove}
                  onUpdateQuantity={handleUpdateQuantity}
                />
              ))}
            </div>

            {/* Right — Smart cart summary (1/3) */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                {smartLoading ? (
                  <SmartCartSummary.Skeleton />
                ) : smartCart ? (
                  <SmartCartSummary
                    result={smartCart}
                    onCheckout={handleCheckout}
                  />
                ) : (
                  /* Fallback: show simple total when smart cart unavailable */
                  <div className="bg-card rounded-2xl border border-border/40 p-5">
                    <h3 className="text-base font-bold text-white mb-4">Итого</h3>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-muted">Товары ({items.length})</span>
                      <span className="text-lg font-bold text-white">
                        {new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(
                          items.reduce((acc, i) => acc + i.product.price * i.quantity, 0)
                        )}
                      </span>
                    </div>
                    <button
                      onClick={handleCheckout}
                      className={cn(
                        'w-full h-12 rounded-xl',
                        'bg-accent hover:bg-accent-hover',
                        'text-white font-bold text-base',
                        'transition-all duration-300',
                      )}
                    >
                      Оформить заказ →
                    </button>
                    <p className="text-center text-xs text-muted mt-3">Оплата через СБП</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
