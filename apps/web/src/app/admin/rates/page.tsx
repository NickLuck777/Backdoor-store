'use client';

import * as React from 'react';
import toast from 'react-hot-toast';
import { useExchangeRates, useUpdateExchangeRate, type ExchangeRate } from '@/lib/hooks/useAdmin';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, X as XIcon, RefreshCw } from 'lucide-react';

interface EditState {
  rateToRub: string;
  margin: string;
}

export default function ExchangeRatesPage() {
  const { data: rates, isLoading, refetch, dataUpdatedAt } = useExchangeRates();
  const updateMutation = useUpdateExchangeRate();

  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [editValues, setEditValues] = React.useState<EditState>({ rateToRub: '', margin: '' });

  const startEdit = (rate: ExchangeRate) => {
    setEditingId(rate.id);
    setEditValues({
      rateToRub: String(rate.rateToRub),
      margin: String(rate.margin),
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValues({ rateToRub: '', margin: '' });
  };

  const saveEdit = async (id: number) => {
    try {
      await updateMutation.mutateAsync({
        id,
        rateToRub: Number(editValues.rateToRub),
        margin: Number(editValues.margin),
      });
      toast.success('Курс обновлён');
      setEditingId(null);
    } catch {
      toast.error('Ошибка при сохранении');
    }
  };

  const CURRENCY_FLAGS: Record<string, string> = {
    TRY: '🇹🇷',
    INR: '🇮🇳',
    UAH: '🇺🇦',
    USD: '🇺🇸',
    EUR: '🇪🇺',
  };

  const CURRENCY_NAMES: Record<string, string> = {
    TRY: 'Турецкая лира',
    INR: 'Индийская рупия',
    UAH: 'Украинская гривна',
    USD: 'Доллар США',
    EUR: 'Евро',
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Курсы валют</h1>
          <p className="text-sm text-[#B0B0B0] mt-0.5">
            {dataUpdatedAt
              ? `Обновлено: ${new Date(dataUpdatedAt).toLocaleString('ru-RU')}`
              : 'Управление курсами и наценками'}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw size={14} />
          Обновить
        </Button>
      </div>

      <div className="bg-[#1E2030] border border-[#2D2D4A] rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#111827] border-b border-[#2D2D4A]">
              <th className="px-5 py-3 text-left text-xs font-semibold text-[#B0B0B0] uppercase tracking-wider">Валюта</th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-[#B0B0B0] uppercase tracking-wider">Курс к ₽</th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-[#B0B0B0] uppercase tracking-wider">Наценка %</th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-[#B0B0B0] uppercase tracking-wider">Эффективный курс</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-[#B0B0B0] uppercase tracking-wider">Обновлён</th>
              <th className="px-5 py-3 text-center text-xs font-semibold text-[#B0B0B0] uppercase tracking-wider">Действия</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="border-b border-[#2D2D4A]">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-5 py-4">
                      <Skeleton className="h-5 rounded-md w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : (rates ?? []).length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-[#B0B0B0] text-sm">
                  Нет данных о курсах
                </td>
              </tr>
            ) : (
              (rates ?? []).map((rate, i) => {
                const isEditing = editingId === rate.id;
                const flag = CURRENCY_FLAGS[rate.currency] ?? '';
                const name = CURRENCY_NAMES[rate.currency] ?? rate.currency;
                const effectiveRate = isEditing
                  ? Number(editValues.rateToRub) * (1 + Number(editValues.margin) / 100)
                  : rate.effectiveRate;

                return (
                  <tr
                    key={rate.id}
                    className={`border-b border-[#2D2D4A] transition-colors duration-150 ${
                      isEditing ? 'bg-[#001E4A]/30' : i % 2 === 0 ? 'bg-[#1E2030]' : 'bg-[#1A1C2A]'
                    } hover:bg-[#111827]`}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{flag}</span>
                        <div>
                          <p className="font-semibold text-white text-sm">{rate.currency}</p>
                          <p className="text-xs text-[#B0B0B0]">{name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      {isEditing ? (
                        <Input
                          type="number"
                          value={editValues.rateToRub}
                          onChange={(e) => setEditValues((p) => ({ ...p, rateToRub: e.target.value }))}
                          className="w-28 ml-auto text-right"
                          step="0.01"
                        />
                      ) : (
                        <span className="font-semibold text-white tabular-nums">
                          {rate.rateToRub.toFixed(4)} ₽
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {isEditing ? (
                        <Input
                          type="number"
                          value={editValues.margin}
                          onChange={(e) => setEditValues((p) => ({ ...p, margin: e.target.value }))}
                          className="w-20 ml-auto text-right"
                          step="0.1"
                          min="0"
                          max="100"
                        />
                      ) : (
                        <span className="font-semibold text-[#FFB800] tabular-nums">
                          +{rate.margin}%
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="font-bold text-[#00C853] tabular-nums">
                        {effectiveRate.toFixed(4)} ₽
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs text-[#B0B0B0]">
                        {new Date(rate.lastUpdated).toLocaleString('ru-RU', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => saveEdit(rate.id)}
                              disabled={updateMutation.isPending}
                              className="p-1.5 rounded-lg text-[#00C853] hover:bg-[#00C853]/10 transition-all duration-200 disabled:opacity-50"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="p-1.5 rounded-lg text-[#B0B0B0] hover:bg-white/10 transition-all duration-200"
                            >
                              <XIcon size={16} />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => startEdit(rate)}
                            className="text-xs text-[#4DA6FF] hover:text-white border border-[#2D2D4A] hover:border-[#003087]/50 rounded-lg px-3 py-1 transition-all duration-200"
                          >
                            Изменить
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Info note */}
      <div className="bg-[#111827] border border-[#2D2D4A] rounded-xl p-4">
        <p className="text-xs text-[#B0B0B0]">
          <span className="text-white font-semibold">Эффективный курс</span> = Курс к ₽ × (1 + Наценка / 100).
          Используется для расчёта цен в рублях.
        </p>
      </div>
    </div>
  );
}
