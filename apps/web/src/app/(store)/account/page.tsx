'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Calendar, LogOut, Package, ArrowRight, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/utils';
import { useAuth } from '@/lib/hooks/useAuth';
import { useUserOrders, type OrderStatus } from '@/lib/hooks/useOrders';

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Ожидает оплаты',
  PAID: 'Оплачен',
  DELIVERED: 'Коды отправлены',
  COMPLETED: 'Завершён',
  CANCELLED: 'Отменён',
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  PAID: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  DELIVERED: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  COMPLETED: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  CANCELLED: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

export default function AccountPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const ordersQuery = useUserOrders();

  // Guard: redirect to login if not authenticated.
  // Wait until isLoading is false so we don't bounce a freshly-logged-in user.
  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/auth/login');
    }
  }, [isLoading, isAuthenticated, router]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-16 text-center">
        <p className="text-muted">Загрузка...</p>
      </div>
    );
  }

  const orders = ordersQuery.data ?? [];

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Личный кабинет</h1>
        <button
          onClick={handleLogout}
          className={cn(
            'flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-semibold',
            'border border-border text-muted hover:text-[#FF8080] hover:border-[#FF1744]/40',
            'transition-all duration-200',
          )}
        >
          <LogOut size={16} />
          Выйти
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile card — left */}
        <aside className="lg:col-span-1">
          <div className="bg-card border border-border/40 rounded-2xl p-6 sticky top-24">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-2xl bg-accent flex items-center justify-center shadow-[0_0_28px_rgba(0,48,135,0.5)] mb-4">
                <span className="text-2xl font-bold text-white">
                  {user?.email?.[0]?.toUpperCase() ?? '?'}
                </span>
              </div>
              <p className="text-sm text-muted uppercase tracking-wider">Аккаунт</p>
              <p className="text-base font-bold text-white mt-1 break-all">
                {user?.email}
              </p>
            </div>

            <div className="mt-6 space-y-3 text-sm">
              <div className="flex items-center gap-3 text-muted">
                <Mail size={14} className="flex-shrink-0" />
                <span className="truncate">{user?.email}</span>
              </div>
              {user?.createdAt && (
                <div className="flex items-center gap-3 text-muted">
                  <Calendar size={14} className="flex-shrink-0" />
                  <span>С {formatDate(user.createdAt)}</span>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Orders — right */}
        <section className="lg:col-span-2">
          <div className="bg-card border border-border/40 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <Package size={20} className="text-accent-hover" />
              <h2 className="text-lg font-bold text-white">Мои заказы</h2>
              {orders.length > 0 && (
                <span className="text-sm text-muted">({orders.length})</span>
              )}
            </div>

            {ordersQuery.isLoading ? (
              <div className="py-12 text-center text-muted">Загружаем заказы...</div>
            ) : ordersQuery.isError ? (
              <div className="py-12 text-center">
                <p className="text-[#FF8080]">Не удалось загрузить заказы</p>
                <button
                  onClick={() => ordersQuery.refetch()}
                  className="mt-3 text-sm text-accent-hover hover:underline"
                >
                  Попробовать снова
                </button>
              </div>
            ) : orders.length === 0 ? (
              <div className="py-12 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                  <ShoppingBag size={28} className="text-muted" />
                </div>
                <p className="text-white font-semibold mb-1">Пока нет заказов</p>
                <p className="text-sm text-muted mb-6 max-w-xs">
                  Здесь появятся ваши покупки после первого заказа
                </p>
                <Link
                  href="/catalog"
                  className={cn(
                    'flex items-center justify-center h-11 px-8 rounded-xl',
                    'bg-accent hover:bg-accent-hover text-white font-semibold text-sm',
                    'transition-all duration-300',
                  )}
                >
                  Перейти в каталог
                </Link>
              </div>
            ) : (
              <ul className="space-y-3">
                {orders.map((order) => (
                  <li key={order.id}>
                    <Link
                      href={`/order/${order.orderNumber}`}
                      className={cn(
                        'group flex items-center gap-4 p-4 rounded-xl',
                        'bg-background/40 border border-border/40',
                        'hover:border-accent/60 hover:bg-white/[0.02]',
                        'transition-all duration-200',
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-bold text-white">
                            #{order.orderNumber}
                          </p>
                          <span
                            className={cn(
                              'text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border',
                              STATUS_COLORS[order.status],
                            )}
                          >
                            {STATUS_LABELS[order.status]}
                          </span>
                        </div>
                        <p className="text-xs text-muted mt-1">
                          {formatDate(order.createdAt)} ·{' '}
                          {order.products?.length ?? 0}{' '}
                          {(order.products?.length ?? 0) === 1 ? 'товар' : 'товаров'}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-base font-bold text-white">
                          {formatPrice(order.totalInRub)}
                        </span>
                        <ArrowRight
                          size={16}
                          className="text-muted group-hover:text-white group-hover:translate-x-0.5 transition-all"
                        />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
