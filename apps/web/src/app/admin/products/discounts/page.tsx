'use client';

import * as React from 'react';
import toast from 'react-hot-toast';
import { useAdminProducts, useBulkDiscount } from '@/lib/hooks/useAdmin';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatPrice } from '@/lib/utils';
import { Percent } from 'lucide-react';
import type { AdminProduct } from '@/lib/hooks/useAdmin';

export default function AdminProductDiscountsPage() {
  const { data, isLoading } = useAdminProducts({ hasDiscount: false, limit: 100 });
  const bulkMutation = useBulkDiscount();
  const [selectedIds, setSelectedIds] = React.useState<number[]>([]);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [discount, setDiscount] = React.useState('');

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await bulkMutation.mutateAsync({ ids: selectedIds, discount: Number(discount) });
      toast.success(`Скидка ${discount}% применена к ${selectedIds.length} продуктам`);
      setDialogOpen(false);
      setSelectedIds([]);
      setDiscount('');
    } catch {
      toast.error('Ошибка при применении скидки');
    }
  };

  const columns: Column<AdminProduct>[] = [
    {
      key: 'title',
      header: 'Продукт',
      render: (val, row) => (
        <div>
          <p className="font-semibold text-white text-sm">{val as string}</p>
          <p className="text-xs text-[#B0B0B0]">{row.region} · {row.type}</p>
        </div>
      ),
    },
    {
      key: 'price',
      header: 'Текущая цена',
      render: (val) => (
        <span className="font-semibold text-white tabular-nums">{formatPrice(val as number)}</span>
      ),
    },
    {
      key: 'discount',
      header: 'Скидка',
      render: (val) => (
        <span className="text-sm">
          {val ? (
            <span className="text-[#00C853] font-semibold">-{val}%</span>
          ) : (
            <span className="text-[#B0B0B0]">—</span>
          )}
        </span>
      ),
    },
    {
      key: 'originalPrice',
      header: 'Оригинальная цена',
      render: (val) => (
        <span className="text-sm text-[#B0B0B0] tabular-nums line-through">
          {val ? formatPrice(val as number) : '—'}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Управление скидками</h1>
          <p className="text-sm text-[#B0B0B0] mt-0.5">
            Выберите продукты и установите скидку оптом
          </p>
        </div>
        {selectedIds.length > 0 && (
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Percent size={14} />
            Установить скидку ({selectedIds.length})
          </Button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={(data?.products ?? []) as unknown as Record<string, unknown>[]}
        isLoading={isLoading}
        total={data?.total ?? 0}
        selectable
        onSelectionChange={setSelectedIds}
        emptyMessage="Продукты не найдены"
      />

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title="Установить скидку" size="sm">
        <form onSubmit={handleApply} className="flex flex-col gap-4">
          <p className="text-sm text-[#B0B0B0]">
            Выбрано продуктов: <span className="text-white font-semibold">{selectedIds.length}</span>
          </p>
          <div>
            <label className="admin-label">Скидка (%)</label>
            <Input
              type="number"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              placeholder="15"
              min="0"
              max="100"
              required
              leftIcon={<Percent size={16} />}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-[#2D2D4A]">
            <Button variant="ghost" size="sm" type="button" onClick={() => setDialogOpen(false)}>
              Отмена
            </Button>
            <Button size="sm" type="submit" loading={bulkMutation.isPending}>
              Применить
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
