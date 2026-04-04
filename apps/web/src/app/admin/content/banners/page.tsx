'use client';

import * as React from 'react';
import toast from 'react-hot-toast';
import {
  useAdminBanners,
  useCreateBanner,
  useUpdateBanner,
  useDeleteBanner,
  type Banner,
} from '@/lib/hooks/useAdmin';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { cn } from '@/lib/utils';
import { Plus, Pencil, Trash2, ExternalLink } from 'lucide-react';

const POSITIONS: Banner['position'][] = ['HERO', 'PROMO', 'SIDEBAR'];

const POSITION_LABELS: Record<Banner['position'], string> = {
  HERO: 'Главный баннер',
  PROMO: 'Промо',
  SIDEBAR: 'Боковой',
};

interface BannerFormData {
  title: string;
  imageUrl: string;
  linkUrl: string;
  position: Banner['position'];
  isActive: boolean;
  startDate: string;
  endDate: string;
}

const defaultForm: BannerFormData = {
  title: '',
  imageUrl: '',
  linkUrl: '',
  position: 'HERO',
  isActive: true,
  startDate: '',
  endDate: '',
};

function BannerFormDialog({
  open,
  onClose,
  banner,
}: {
  open: boolean;
  onClose: () => void;
  banner: Banner | null;
}) {
  const createMutation = useCreateBanner();
  const updateMutation = useUpdateBanner();
  const isEdit = !!banner;

  const [form, setForm] = React.useState<BannerFormData>(defaultForm);

  React.useEffect(() => {
    if (banner) {
      setForm({
        title: banner.title,
        imageUrl: banner.imageUrl,
        linkUrl: banner.linkUrl ?? '',
        position: banner.position,
        isActive: banner.isActive,
        startDate: banner.startDate?.slice(0, 10) ?? '',
        endDate: banner.endDate?.slice(0, 10) ?? '',
      });
    } else {
      setForm(defaultForm);
    }
  }, [banner, open]);

  const set = (key: keyof BannerFormData, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: form.title,
      imageUrl: form.imageUrl,
      linkUrl: form.linkUrl || undefined,
      position: form.position,
      isActive: form.isActive,
      startDate: form.startDate || undefined,
      endDate: form.endDate || undefined,
    };
    try {
      if (isEdit && banner) {
        await updateMutation.mutateAsync({ id: banner.id, ...payload });
        toast.success('Баннер обновлён');
      } else {
        await createMutation.mutateAsync(payload);
        toast.success('Баннер создан');
      }
      onClose();
    } catch {
      toast.error('Ошибка при сохранении');
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={isEdit ? 'Редактировать баннер' : 'Создать баннер'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="admin-label">Название</label>
          <Input
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="Летняя распродажа"
            required
          />
        </div>
        <div>
          <label className="admin-label">URL изображения</label>
          <Input
            value={form.imageUrl}
            onChange={(e) => set('imageUrl', e.target.value)}
            placeholder="https://..."
            required
          />
          {form.imageUrl && (
            <div className="mt-2 rounded-xl overflow-hidden border border-[#2D2D4A] h-28">
              <img
                src={form.imageUrl}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
        </div>
        <div>
          <label className="admin-label">Ссылка (URL)</label>
          <Input
            value={form.linkUrl}
            onChange={(e) => set('linkUrl', e.target.value)}
            placeholder="/catalog?category=sale"
          />
        </div>
        <div>
          <label className="admin-label">Позиция</label>
          <select
            value={form.position}
            onChange={(e) => set('position', e.target.value as Banner['position'])}
            className="admin-select"
          >
            {POSITIONS.map((p) => (
              <option key={p} value={p}>{POSITION_LABELS[p]}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="admin-label">Начало показа</label>
            <Input
              type="date"
              value={form.startDate}
              onChange={(e) => set('startDate', e.target.value)}
            />
          </div>
          <div>
            <label className="admin-label">Конец показа</label>
            <Input
              type="date"
              value={form.endDate}
              onChange={(e) => set('endDate', e.target.value)}
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
          <span className="text-sm text-[#E0E0E0]">Активен</span>
        </label>
        <div className="flex justify-end gap-3 pt-2 border-t border-[#2D2D4A]">
          <Button variant="ghost" size="sm" type="button" onClick={onClose}>Отмена</Button>
          <Button size="sm" type="submit" loading={isPending}>
            {isEdit ? 'Сохранить' : 'Создать'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

export default function AdminBannersPage() {
  const { data: banners, isLoading } = useAdminBanners();
  const updateMutation = useUpdateBanner();
  const deleteMutation = useDeleteBanner();
  const [formOpen, setFormOpen] = React.useState(false);
  const [editBanner, setEditBanner] = React.useState<Banner | null>(null);
  const [deleteId, setDeleteId] = React.useState<number | null>(null);

  const toggleActive = async (banner: Banner) => {
    try {
      await updateMutation.mutateAsync({ id: banner.id, isActive: !banner.isActive });
    } catch {
      toast.error('Ошибка');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      toast.success('Баннер удалён');
    } catch {
      toast.error('Ошибка при удалении');
    } finally {
      setDeleteId(null);
    }
  };

  const columns: Column<Banner>[] = [
    {
      key: 'imageUrl',
      header: '',
      className: 'w-20',
      render: (val) => (
        <div className="w-16 h-10 rounded-lg overflow-hidden bg-[#1A1A2E]">
          {val ? (
            <img src={val as string} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-[#2D2D4A]" />
          )}
        </div>
      ),
    },
    {
      key: 'title',
      header: 'Название',
      render: (val, row) => (
        <div>
          <p className="font-semibold text-white text-sm">{val as string}</p>
          {row.linkUrl && (
            <a
              href={row.linkUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-[#4DA6FF] hover:underline flex items-center gap-1"
            >
              {row.linkUrl.slice(0, 40)}{row.linkUrl.length > 40 ? '...' : ''}
              <ExternalLink size={10} />
            </a>
          )}
        </div>
      ),
    },
    {
      key: 'position',
      header: 'Позиция',
      render: (val) => (
        <span className="text-xs bg-[#111827] text-[#B0B0B0] border border-[#2D2D4A] px-2 py-0.5 rounded-lg">
          {POSITION_LABELS[val as Banner['position']]}
        </span>
      ),
    },
    {
      key: 'isActive',
      header: 'Статус',
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
      key: 'startDate',
      header: 'Период',
      render: (val, row) => (
        <span className="text-xs text-[#B0B0B0]">
          {val ? new Date(val as string).toLocaleDateString('ru-RU') : '—'}
          {' → '}
          {row.endDate ? new Date(row.endDate).toLocaleDateString('ru-RU') : '∞'}
        </span>
      ),
    },
    {
      key: 'id',
      header: 'Действия',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setEditBanner(row); setFormOpen(true); }}
            className="p-1.5 rounded-lg text-[#B0B0B0] hover:text-white hover:bg-white/10 transition-all duration-200"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => setDeleteId(row.id)}
            className="p-1.5 rounded-lg text-[#B0B0B0] hover:text-[#FF1744] hover:bg-[#FF1744]/10 transition-all duration-200"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Баннеры</h1>
          <p className="text-sm text-[#B0B0B0] mt-0.5">Управление баннерами на сайте</p>
        </div>
        <Button size="sm" onClick={() => { setEditBanner(null); setFormOpen(true); }}>
          <Plus size={14} />
          Создать баннер
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={(banners ?? []) as unknown as Record<string, unknown>[]}
        isLoading={isLoading}
        total={banners?.length ?? 0}
        emptyMessage="Баннеры не найдены"
      />

      <BannerFormDialog
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditBanner(null); }}
        banner={editBanner}
      />
      <ConfirmDialog
        open={deleteId != null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Удалить баннер"
        message="Баннер будет удалён безвозвратно. Продолжить?"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
