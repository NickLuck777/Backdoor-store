'use client';

import * as React from 'react';
import { useAdminDashboard, useAdminTopProducts } from '@/lib/hooks/useAdmin';
import { StatCard } from '@/components/admin/StatCard';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { formatPrice } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingCart, Package, TrendingUp, Users } from 'lucide-react';
import type { OrderStatus } from '@/lib/hooks/useAdmin';

// ─── Revenue Line Chart (SVG only) ───────────────────────────────────────────

function RevenueChart({ data }: { data: { date: string; revenue: number }[] }) {
  const maxValue = Math.max(...data.map((d) => d.revenue), 1);
  const points = data.map((d, i) => ({
    x: (i / Math.max(data.length - 1, 1)) * 100,
    y: 100 - (d.revenue / maxValue) * 85,
  }));

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(' ');
  const areaPoints = [
    `0,100`,
    ...points.map((p) => `${p.x},${p.y}`),
    `100,100`,
  ].join(' ');

  return (
    <div className="bg-[#1E2030] border border-[#2D2D4A] rounded-2xl p-5">
      <h3 className="text-sm font-semibold text-white mb-1">Выручка за 30 дней</h3>
      <p className="text-xs text-[#B0B0B0] mb-4">
        Итого: {formatPrice(data.reduce((s, d) => s + d.revenue, 0))}
      </p>
      <div className="relative h-40">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          <defs>
            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#003087" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#003087" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Grid lines */}
          {[25, 50, 75].map((y) => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2="100"
              y2={y}
              stroke="#2D2D4A"
              strokeWidth="0.5"
              vectorEffect="non-scaling-stroke"
            />
          ))}
          {/* Area fill */}
          <polygon points={areaPoints} fill="url(#revenueGrad)" />
          {/* Line */}
          <polyline
            points={polylinePoints}
            fill="none"
            stroke="#0070D1"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Data points */}
          {points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="1.5"
              fill="#0070D1"
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>
        {/* X-axis labels */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between translate-y-5">
          {data
            .filter((_, i) => i % Math.ceil(data.length / 6) === 0 || i === data.length - 1)
            .map((d, i) => (
              <span key={i} className="text-[10px] text-[#B0B0B0]">
                {new Date(d.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
              </span>
            ))}
        </div>
      </div>
    </div>
  );
}

// ─── Orders by status (pie via colored squares) ───────────────────────────────

const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: '#FFB800',
  PAID: '#4DA6FF',
  PROCESSING: '#FF8C00',
  DELIVERED: '#00C853',
  COMPLETED: '#00C853',
  CANCELLED: '#FF1744',
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Ожидает',
  PAID: 'Оплачен',
  PROCESSING: 'В обработке',
  DELIVERED: 'Доставлен',
  COMPLETED: 'Завершён',
  CANCELLED: 'Отменён',
};

function OrdersStatusChart({
  data,
}: {
  data: { status: OrderStatus; count: number }[];
}) {
  const total = data.reduce((s, d) => s + d.count, 0);
  return (
    <div className="bg-[#1E2030] border border-[#2D2D4A] rounded-2xl p-5">
      <h3 className="text-sm font-semibold text-white mb-1">Заказы по статусам</h3>
      <p className="text-xs text-[#B0B0B0] mb-4">Итого: {total}</p>
      {/* Bar representation */}
      <div className="flex rounded-full overflow-hidden h-3 mb-5">
        {data.map((d) => {
          const pct = total > 0 ? (d.count / total) * 100 : 0;
          return (
            <div
              key={d.status}
              style={{ width: `${pct}%`, background: STATUS_COLORS[d.status] }}
              title={`${STATUS_LABELS[d.status]}: ${d.count}`}
            />
          );
        })}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {data.map((d) => (
          <div key={d.status} className="flex items-center gap-2">
            <div
              className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
              style={{ background: STATUS_COLORS[d.status] }}
            />
            <span className="text-xs text-[#B0B0B0] truncate">{STATUS_LABELS[d.status]}</span>
            <span className="text-xs font-semibold text-white ml-auto">{d.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Dashboard page ───────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useAdminDashboard();
  const { data: topProducts, isLoading: topLoading } = useAdminTopProducts();

  // Demo fallback data for visual preview
  const revenueData = stats?.revenueByDay ?? Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 86400000).toISOString().slice(0, 10),
    revenue: Math.floor(Math.random() * 80000 + 20000),
  }));

  const statusData = stats?.ordersByStatus ?? [
    { status: 'COMPLETED' as OrderStatus, count: 142 },
    { status: 'PAID' as OrderStatus, count: 23 },
    { status: 'PENDING' as OrderStatus, count: 11 },
    { status: 'CANCELLED' as OrderStatus, count: 8 },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-white">Дашборд</h1>
        <p className="text-sm text-[#B0B0B0] mt-0.5">Добро пожаловать в панель управления</p>
      </div>

      {/* Row 1: Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Продажи сегодня"
          value={isLoading ? '–' : formatPrice(stats?.salesToday ?? 0)}
          delta="+12%"
          deltaType="positive"
          icon={<TrendingUp size={18} />}
          isLoading={isLoading}
        />
        <StatCard
          title="Заказов сегодня"
          value={isLoading ? '–' : String(stats?.ordersToday ?? 0)}
          delta="+3"
          deltaType="positive"
          icon={<ShoppingCart size={18} />}
          isLoading={isLoading}
        />
        <StatCard
          title="Средний чек"
          value={isLoading ? '–' : formatPrice(stats?.avgCheck ?? 0)}
          deltaType="neutral"
          icon={<Package size={18} />}
          isLoading={isLoading}
        />
        <StatCard
          title="Новых пользователей"
          value={isLoading ? '–' : String(stats?.newUsers ?? 0)}
          delta="+5"
          deltaType="positive"
          icon={<Users size={18} />}
          isLoading={isLoading}
        />
      </div>

      {/* Row 2: Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          {isLoading ? (
            <Skeleton className="h-52 rounded-2xl" />
          ) : (
            <RevenueChart data={revenueData} />
          )}
        </div>
        <div>
          {isLoading ? (
            <Skeleton className="h-52 rounded-2xl" />
          ) : (
            <OrdersStatusChart data={statusData} />
          )}
        </div>
      </div>

      {/* Row 3: Top products */}
      <div className="bg-[#1E2030] border border-[#2D2D4A] rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#2D2D4A]">
          <h3 className="text-sm font-semibold text-white">Топ продукты</h3>
          <p className="text-xs text-[#B0B0B0] mt-0.5">5 самых продаваемых за месяц</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2D2D4A]">
                <th className="px-5 py-3 text-left text-xs font-semibold text-[#B0B0B0] uppercase tracking-wider">#</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-[#B0B0B0] uppercase tracking-wider">Продукт</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-[#B0B0B0] uppercase tracking-wider">Регион</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-[#B0B0B0] uppercase tracking-wider">Продаж</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-[#B0B0B0] uppercase tracking-wider">Выручка</th>
              </tr>
            </thead>
            <tbody>
              {topLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-[#2D2D4A]">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <td key={j} className="px-5 py-3">
                          <Skeleton className="h-4 rounded-md w-3/4" />
                        </td>
                      ))}
                    </tr>
                  ))
                : (
                    topProducts?.slice(0, 5).map((product, i) => (
                      <tr
                        key={product.id}
                        className={`border-b border-[#2D2D4A] hover:bg-[#111827] transition-colors duration-150 ${i % 2 === 0 ? 'bg-[#1E2030]' : 'bg-[#1A1C2A]'}`}
                      >
                        <td className="px-5 py-3">
                          <span className="text-xs font-bold text-[#B0B0B0]">#{i + 1}</span>
                        </td>
                        <td className="px-5 py-3 font-medium text-white max-w-[200px] truncate">
                          {product.title}
                        </td>
                        <td className="px-5 py-3 text-[#B0B0B0] text-xs">{product.region}</td>
                        <td className="px-5 py-3 text-right font-semibold text-white tabular-nums">
                          {product.count}
                        </td>
                        <td className="px-5 py-3 text-right font-semibold text-[#00C853] tabular-nums">
                          {formatPrice(product.revenue)}
                        </td>
                      </tr>
                    ))
                  ) ?? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-[#B0B0B0] text-sm">
                      Нет данных
                    </td>
                  </tr>
                )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Row 4: Recent orders */}
      <div className="bg-[#1E2030] border border-[#2D2D4A] rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#2D2D4A]">
          <h3 className="text-sm font-semibold text-white">Последние заказы</h3>
          <p className="text-xs text-[#B0B0B0] mt-0.5">5 самых новых заказов</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2D2D4A]">
                <th className="px-5 py-3 text-left text-xs font-semibold text-[#B0B0B0] uppercase tracking-wider">Номер</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-[#B0B0B0] uppercase tracking-wider">Email</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-[#B0B0B0] uppercase tracking-wider">Сумма</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-[#B0B0B0] uppercase tracking-wider">Статус</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-[#B0B0B0] uppercase tracking-wider">Дата</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-[#2D2D4A]">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-5 py-3">
                        <Skeleton className="h-4 rounded-md w-3/4" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-[#B0B0B0] text-sm">
                    Загрузите данные из API
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
