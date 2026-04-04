'use client';

import * as React from 'react';
import toast from 'react-hot-toast';
import { useCodeInventory, type CodeInventoryRow } from '@/lib/hooks/useAdmin';
import { adminApi } from '@/lib/admin-api';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatCard } from '@/components/admin/StatCard';
import { cn } from '@/lib/utils';
import { AlertTriangle, Key, Check, X as XIcon } from 'lucide-react';

type Currency = 'TRY' | 'INR' | 'UAH';

const CURRENCIES: Currency[] = ['TRY', 'INR', 'UAH'];

const CURRENCY_LABELS: Record<Currency, string> = {
  TRY: 'Турецкая лира',
  INR: 'Индийская рупия',
  UAH: 'Украинская гривна',
};

function InventoryTable({
  rows,
  isLoading,
}: {
  rows: CodeInventoryRow[];
  isLoading: boolean;
}) {
  const [editThreshold, setEditThreshold] = React.useState<number | null>(null);
  const [thresholdVal, setThresholdVal] = React.useState('');

  const handleSaveThreshold = async (row: CodeInventoryRow) => {
    try {
      await adminApi.patch(`/admin/codes/threshold`, {
        denomination: row.denomination,
        currency: row.currency,
        threshold: Number(thresholdVal),
      });
      toast.success('Порог обновлён');
      setEditThreshold(null);
    } catch {
      toast.error('Ошибка обновления');
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-xl border border-[#2D2D4A] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#111827] border-b border-[#2D2D4A]">
              {['Номинал', 'Доступно', 'Зарезервировано', 'Продано', 'Всего', 'Порог', ''].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#B0B0B0] uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b border-[#2D2D4A]">
                {Array.from({ length: 7 }).map((_, j) => (
                  <td key={j} className="px-4 py-3">
                    <Skeleton className="h-4 rounded-md w-3/4" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-[#2D2D4A] p-12 text-center text-[#B0B0B0] text-sm">
        Нет данных инвентаря
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#2D2D4A] overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[#111827] border-b border-[#2D2D4A]">
            <th className="px-4 py-3 text-left text-xs font-semibold text-[#B0B0B0] uppercase tracking-wider">Номинал</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-[#B0B0B0] uppercase tracking-wider">Доступно</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-[#B0B0B0] uppercase tracking-wider">Зарезервировано</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-[#B0B0B0] uppercase tracking-wider">Продано</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-[#B0B0B0] uppercase tracking-wider">Всего</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-[#B0B0B0] uppercase tracking-wider">Порог</th>
            <th className="px-4 py-3 w-10"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const isLow = row.available < row.threshold;
            const isEditing = editThreshold === row.denomination;
            return (
              <tr
                key={row.denomination}
                className={cn(
                  'border-b border-[#2D2D4A] transition-colors duration-150',
                  isLow ? 'bg-[#2A0009]/50 hover:bg-[#2A0009]/70' : i % 2 === 0 ? 'bg-[#111827] hover:bg-[#1E2030]' : 'bg-[#131424] hover:bg-[#1E2030]',
                )}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {isLow && <AlertTriangle size={14} className="text-[#FF1744]" />}
                    <span className="font-semibold text-white tabular-nums">
                      {row.denomination} {row.currency}
                    </span>
                  </div>
                </td>
                <td className={cn('px-4 py-3 text-right font-bold tabular-nums', isLow ? 'text-[#FF1744]' : 'text-[#00C853]')}>
                  {row.available}
                </td>
                <td className="px-4 py-3 text-right text-[#FFB800] font-semibold tabular-nums">{row.reserved}</td>
                <td className="px-4 py-3 text-right text-[#B0B0B0] tabular-nums">{row.sold}</td>
                <td className="px-4 py-3 text-right text-white font-semibold tabular-nums">{row.total}</td>
                <td className="px-4 py-3 text-center">
                  {isEditing ? (
                    <div className="flex items-center gap-1 justify-center">
                      <Input
                        type="number"
                        value={thresholdVal}
                        onChange={(e) => setThresholdVal(e.target.value)}
                        className="w-16 h-7 text-center text-xs px-2"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveThreshold(row)}
                        className="p-1 rounded-lg text-[#00C853] hover:bg-[#00C853]/10"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        onClick={() => setEditThreshold(null)}
                        className="p-1 rounded-lg text-[#B0B0B0] hover:bg-white/10"
                      >
                        <XIcon size={14} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setEditThreshold(row.denomination);
                        setThresholdVal(String(row.threshold));
                      }}
                      className="text-xs text-[#B0B0B0] hover:text-white border border-[#2D2D4A] hover:border-[#003087]/50 rounded-lg px-2 py-0.5 transition-all duration-200"
                    >
                      {row.threshold}
                    </button>
                  )}
                </td>
                <td className="px-4 py-3">
                  {isLow && (
                    <span className="text-[10px] font-bold text-[#FF1744] bg-[#FF1744]/10 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                      Мало
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function CodesInventoryPage() {
  const [activeCurrency, setActiveCurrency] = React.useState<Currency>('TRY');
  const { data: inventory, isLoading } = useCodeInventory();

  const filteredRows = (inventory ?? []).filter((r) => r.currency === activeCurrency);
  const totalAvailable = (inventory ?? []).reduce(
    (acc, row) => {
      if (!acc[row.currency]) acc[row.currency] = 0;
      acc[row.currency] += row.available;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-white">Инвентарь кодов</h1>
        <p className="text-sm text-[#B0B0B0] mt-0.5">Остатки кодов пополнения по валютам</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {CURRENCIES.map((curr) => (
          <StatCard
            key={curr}
            title={`Доступно ${curr}`}
            value={isLoading ? '–' : String(totalAvailable[curr] ?? 0)}
            icon={<Key size={18} />}
            isLoading={isLoading}
            deltaType={
              (totalAvailable[curr] ?? 0) < 10
                ? 'negative'
                : (totalAvailable[curr] ?? 0) < 30
                ? 'neutral'
                : 'positive'
            }
          />
        ))}
      </div>

      {/* Currency tabs */}
      <div className="flex gap-1 bg-[#111827] p-1 rounded-xl border border-[#2D2D4A] w-fit">
        {CURRENCIES.map((curr) => (
          <button
            key={curr}
            onClick={() => setActiveCurrency(curr)}
            className={cn(
              'px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200',
              activeCurrency === curr
                ? 'bg-[#003087] text-white shadow-[0_0_12px_rgba(0,48,135,0.4)]'
                : 'text-[#B0B0B0] hover:text-white hover:bg-white/5',
            )}
          >
            {curr}
          </button>
        ))}
      </div>

      {/* Table */}
      <div>
        <div className="mb-3">
          <h3 className="text-sm font-semibold text-white">
            {CURRENCY_LABELS[activeCurrency]}
          </h3>
          <p className="text-xs text-[#B0B0B0] mt-0.5">
            {filteredRows.length} номиналов · красная строка = ниже порога
          </p>
        </div>
        <InventoryTable rows={filteredRows} isLoading={isLoading} />
      </div>
    </div>
  );
}
