'use client';

import * as React from 'react';
import toast from 'react-hot-toast';
import {
  useAdminPromoCodes,
  useCreatePromoCode,
  useUpdatePromoCode,
  useDeletePromoCode,
  type PromoCode,
} from '@/lib/hooks/useAdmin';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { cn } from '@/lib/utils';
import { Plus, Trash2, Percent, DollarSign } from 'lucide-react';

type DiscountType = 'percent' | 'fixed';

interface PromoFormData {
  code: string;
  discountType: DiscountType;
  discountValue: string;
  maxUses: string;
  expiresAt: string;
  isActive: boolean;
}

const defaultForm: PromoFormData = {
  code: '',
  discountType: 'percent',
  discountValue: '',
  maxUses: '',
  expiresAt: '',
  isActive: true,
};

function generateCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function PromoFormDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const createMutation = useCreatePromoCode();
  const [form, setForm] = React.useState<PromoFormData>(defaultForm);

  React.useEffect(() => {
    if (open) setForm(defaultForm);
  }, [open]);

  const set = (key: keyof PromoFormData, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync({
        code: form.code,
        discountPct: form.discountType === 'percent' ? Number(form.discountValue) : undefined,
        discountAmt: form.discountType === 'fixed' ? Number(form.discountValue) : undefined,
        maxUses: form.maxUses ? Number(form.maxUses) : undefined,
        expiresAt: form.expiresAt || undefined,
        isActive: form.isActive,
      });
      toast.success('Промокод создан');
      onClose();
    } catch {
      toast.error('Ошибка при создании');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title="Создать промокод" size="md">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="admin-label">Код</label>
          <div className="flex gap-2">
            <Input
              value={form.code}
              onChange={(e) => set('code', e.target.value.toUpperCase())}
              placeholder="SUMMER2026"
              required
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => set('code', generateCode())}
            >
              Создать
            </Button>
          </div>
        </div>

        <div>
          <label className="admin-label">Тип скидки</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => set('discountType', 'percent')}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border text-sm font-semibold transition-all duration-200',
                form.discountType === 'percent'
                  ? 'bg-[#003087] border-[#003087] text-white'
                  : 'bg-transparent border-[#2D2D4A] text-[#B0B0B0] hover:text-white hover:border-[#003087]/50',
              )}
            >
              <Percent size={14} />
              Процент
            </button>
            <button
              type="button"
              onClick={() => set('discountType', 'fixed')}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border text-sm font-semibold transition-all duration-200',
                form.discountType === 'fixed'
                  ? 'bg-[#003087] border-[#003087] text-white'
                  : 'bg-transparent border-[#2D2D4A] text-[#B0B0B0] hover:text-white hover:border-[#003087]/50',
              )}
            >
              <DollarSign size={14} />
              Фиксированная сумма
            </button>
          </div>
        </div>

        <div>
          <label className="admin-label">
            {form.discountType === 'percent' ? 'Скидка (%)' : 'Сумма скидки (₽)'}
          </label>
          <Input
            type="number"
            value={form.discountValue}
            onChange={(e) => set('discountValue', e.target.value)}
            placeholder={form.discountType === 'percent' ? '15' : '500'}
            min="0"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="admin-label">Макс. использований</label>
            <Input
              type="number"
              value={form.maxUses}
              onChange={(e) => set('maxUses', e.target.value)}
              placeholder="100"
              min="1"
            />
          </div>
          <div>
            <label className="admin-label">Действует до</label>
            <Input
              type="date"
              value={form.expiresAt}
              onChange={(e) => set('expiresAt', e.target.value)}
            />
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => set('isActive', e.target.checked)}
            className="w-4 h-4 rounded border-border bg-input accent-accent cursor-pointer"
          />
          <span className="text-sm text-[#E0E0E0]">Активен сразу</span>
        </label>

        <div className="flex justify-end gap-3 pt-2 border-t border-[#2D2D4A]">
          <Button variant="ghost" size="sm" type="button" onClick={onClose}>Отмена</Button>
          <Button size="sm" type="submit" loading={createMutation.isPending}>Создать</Button>
        </div>
      </form>
    </Dialog>
  );
}

export default function AdminPromoPage() {
  const { data: promos, isLoading } = useAdminPromoCodes();
  const updateMutation = useUpdatePromoCode();
  const deleteMutation = useDeletePromoCode();
  const [formOpen, setFormOpen] = React.useState(false);
  const [deleteId, setDeleteId] = React.useState<number | null>(null);

  const toggleActive = async (promo: PromoCode) => {
    try {
      await updateMutation.mutateAsync({ id: promo.id, isActive: !promo.isActive });
    } catch {
      toast.error('Ошибка');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      toast.success('Промокод удалён');
    } catch {
      toast.error('Ошибка при удалении');
    } finally {
      setDeleteId(null);
    }
  };

  const columns: Column<PromoCode>[] = [
    {
      key: 'code',
      header: 'Код',
      render: (val) => (
        <span className="font-mono font-bold text-sm text-[#4DA6FF] bg-[#001E4A]/40 px-2 py-0.5 rounded-lg tracking-widest">
          {val as string}
        </span>
      ),
    },
    {
      key: 'discountPct',
      header: 'Скидка',
      render: (val, row) => (
        <span className="text-sm font-semibold text-white">
          {row.discountPct != null ? `-${row.discountPct}%` : null}
          {row.discountAmt != null ? `-${row.discountAmt} ₽` : null}
        </span>
      ),
    },
    {
      key: 'usedCount',
      header: 'Использовано',
      render: (val, row) => (
        <div className="text-sm">
          <span className="text-white font-semibold">{val as number}</span>
          {row.maxUses != null && (
            <span className="text-[#B0B0B0]"> / {row.maxUses}</span>
          )}
        </div>
      ),
    },
    {
      key: 'isActive',
      header: 'Активен',
      render: (val, row) => (
        <button
          onClick={() => toggleActive(row)}
          className={cn(
            'relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-300',
            val ? 'bg-[#003087]' : 'bg-[#2D2D4A]',
          )}
        >
          <span
            className={cn(
              'inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform duration-300',
              val ? 'translate-x-4' : 'translate-x-1',
            )}
          />
        </button>
      ),
    },
    {
      key: 'expiresAt',
      header: 'Истекает',
      render: (val) => {
        if (!val) return <span className="text-[#B0B0B0] text-xs">—</span>;
        const d = new Date(val as string);
        const isExpired = d < new Date();
        return (
          <span className={cn('text-xs', isExpired ? 'text-[#FF1744]' : 'text-[#B0B0B0]')}>
            {d.toLocaleDateString('ru-RU')}
          </span>
        );
      },
    },
    {
      key: 'id',
      header: '',
      render: (_, row) => (
        <button
          onClick={() => setDeleteId(row.id)}
          className="p-1.5 rounded-lg text-[#B0B0B0] hover:text-[#FF1744] hover:bg-[#FF1744]/10 transition-all duration-200"
        >
          <Trash2 size={14} />
        </button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Промокоды</h1>
          <p className="text-sm text-[#B0B0B0] mt-0.5">{promos?.length ?? 0} промокодов</p>
        </div>
        <Button size="sm" onClick={() => setFormOpen(true)}>
          <Plus size={14} />
          Создать промокод
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={(promos ?? []) as unknown as Record<string, unknown>[]}
        isLoading={isLoading}
        total={promos?.length ?? 0}
        emptyMessage="Промокоды не найдены"
      />

      <PromoFormDialog open={formOpen} onClose={() => setFormOpen(false)} />
      <ConfirmDialog
        open={deleteId != null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Удалить промокод"
        message="Промокод будет удалён безвозвратно."
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
