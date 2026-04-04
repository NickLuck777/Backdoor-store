'use client';

import * as React from 'react';
import toast from 'react-hot-toast';
import {
  useAdminProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useBulkDiscount,
  type AdminProduct,
} from '@/lib/hooks/useAdmin';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn, debounce } from '@/lib/utils';
import { Plus, Pencil, Trash2, Percent, Search } from 'lucide-react';

// ─── Product Form ─────────────────────────────────────────────────────────────

const REGIONS = ['TURKEY', 'INDIA', 'UKRAINE'];
const TYPES = ['GAME', 'SUBSCRIPTION', 'TOPUP_CARD', 'DONATE', 'ACCOUNT'];
const PLATFORMS = ['PS4', 'PS5', 'PS4_PS5'];

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9а-яё\s-]/gi, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

interface ProductFormData {
  title: string;
  slug: string;
  description: string;
  type: string;
  platform: string;
  edition: string;
  region: string;
  price: string;
  originalPrice: string;
  discount: string;
  imageUrl: string;
  isPreorder: boolean;
  isAvailable: boolean;
  sortOrder: string;
}

const defaultForm: ProductFormData = {
  title: '',
  slug: '',
  description: '',
  type: 'GAME',
  platform: 'PS4_PS5',
  edition: '',
  region: 'TURKEY',
  price: '',
  originalPrice: '',
  discount: '',
  imageUrl: '',
  isPreorder: false,
  isAvailable: true,
  sortOrder: '0',
};

function ProductFormDialog({
  open,
  onClose,
  product,
}: {
  open: boolean;
  onClose: () => void;
  product: AdminProduct | null;
}) {
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const isEdit = !!product;

  const [form, setForm] = React.useState<ProductFormData>(defaultForm);

  React.useEffect(() => {
    if (product) {
      setForm({
        title: product.title,
        slug: product.slug,
        description: product.description ?? '',
        type: product.type,
        platform: product.platform ?? 'PS4_PS5',
        edition: product.edition ?? '',
        region: product.region,
        price: String(product.price),
        originalPrice: String(product.originalPrice ?? ''),
        discount: String(product.discount ?? ''),
        imageUrl: product.imageUrl ?? '',
        isPreorder: product.isPreorder,
        isAvailable: product.isAvailable,
        sortOrder: String(product.sortOrder),
      });
    } else {
      setForm(defaultForm);
    }
  }, [product, open]);

  const set = (key: keyof ProductFormData, value: string | boolean) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'title' && !isEdit) {
        next.slug = generateSlug(value as string);
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: form.title,
      slug: form.slug,
      description: form.description || undefined,
      type: form.type,
      platform: form.platform || undefined,
      edition: form.edition || undefined,
      region: form.region,
      price: Number(form.price),
      originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
      discount: form.discount ? Number(form.discount) : undefined,
      imageUrl: form.imageUrl || undefined,
      isPreorder: form.isPreorder,
      isAvailable: form.isAvailable,
      sortOrder: Number(form.sortOrder),
    };

    try {
      if (isEdit && product) {
        await updateMutation.mutateAsync({ id: product.id, ...payload });
        toast.success('Продукт обновлён');
      } else {
        await createMutation.mutateAsync(payload);
        toast.success('Продукт создан');
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
      title={isEdit ? 'Редактировать продукт' : 'Создать продукт'}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto pr-1">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="admin-label">Название</label>
            <Input
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="God of War: Ragnarok"
              required
            />
          </div>
          <div className="col-span-2">
            <label className="admin-label">Slug</label>
            <Input
              value={form.slug}
              onChange={(e) => set('slug', e.target.value)}
              placeholder="god-of-war-ragnarok"
              required
            />
          </div>
          <div>
            <label className="admin-label">Регион</label>
            <select
              value={form.region}
              onChange={(e) => set('region', e.target.value)}
              className="admin-select"
            >
              {REGIONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="admin-label">Тип</label>
            <select
              value={form.type}
              onChange={(e) => set('type', e.target.value)}
              className="admin-select"
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="admin-label">Платформа</label>
            <select
              value={form.platform}
              onChange={(e) => set('platform', e.target.value)}
              className="admin-select"
            >
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="admin-label">Издание</label>
            <Input
              value={form.edition}
              onChange={(e) => set('edition', e.target.value)}
              placeholder="Standard, Deluxe..."
            />
          </div>
          <div>
            <label className="admin-label">Цена (₽)</label>
            <Input
              type="number"
              value={form.price}
              onChange={(e) => set('price', e.target.value)}
              placeholder="3500"
              required
            />
          </div>
          <div>
            <label className="admin-label">Оригинальная цена (₽)</label>
            <Input
              type="number"
              value={form.originalPrice}
              onChange={(e) => set('originalPrice', e.target.value)}
              placeholder="4200"
            />
          </div>
          <div>
            <label className="admin-label">Скидка (%)</label>
            <Input
              type="number"
              value={form.discount}
              onChange={(e) => set('discount', e.target.value)}
              placeholder="15"
              min="0"
              max="100"
            />
          </div>
          <div>
            <label className="admin-label">Порядок сортировки</label>
            <Input
              type="number"
              value={form.sortOrder}
              onChange={(e) => set('sortOrder', e.target.value)}
              placeholder="0"
            />
          </div>
          <div className="col-span-2">
            <label className="admin-label">URL изображения</label>
            <Input
              value={form.imageUrl}
              onChange={(e) => set('imageUrl', e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div className="col-span-2">
            <label className="admin-label">Описание</label>
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Описание продукта..."
              rows={3}
              className="w-full bg-input border border-border rounded-xl text-foreground text-sm placeholder:text-muted px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-300 resize-none"
            />
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isAvailable}
                onChange={(e) => set('isAvailable', e.target.checked)}
                className="w-4 h-4 rounded border-border bg-input accent-accent cursor-pointer"
              />
              <span className="text-sm text-[#E0E0E0]">Доступен</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isPreorder}
                onChange={(e) => set('isPreorder', e.target.checked)}
                className="w-4 h-4 rounded border-border bg-input accent-accent cursor-pointer"
              />
              <span className="text-sm text-[#E0E0E0]">Предзаказ</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-[#2D2D4A]">
          <Button variant="ghost" size="sm" type="button" onClick={onClose}>
            Отмена
          </Button>
          <Button size="sm" type="submit" loading={isPending}>
            {isEdit ? 'Сохранить' : 'Создать'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

// ─── Bulk Discount Dialog ─────────────────────────────────────────────────────

function BulkDiscountDialog({
  open,
  onClose,
  selectedIds,
}: {
  open: boolean;
  onClose: () => void;
  selectedIds: number[];
}) {
  const mutation = useBulkDiscount();
  const [discount, setDiscount] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await mutation.mutateAsync({ ids: selectedIds, discount: Number(discount) });
      toast.success(`Скидка ${discount}% установлена для ${selectedIds.length} продуктов`);
      onClose();
    } catch {
      toast.error('Ошибка при установке скидки');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title="Установить скидку" size="sm">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
        <div className="flex justify-end gap-3">
          <Button variant="ghost" size="sm" type="button" onClick={onClose}>
            Отмена
          </Button>
          <Button size="sm" type="submit" loading={mutation.isPending}>
            Применить
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

// ─── Products Page ────────────────────────────────────────────────────────────

export default function AdminProductsPage() {
  const [search, setSearch] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [region, setRegion] = React.useState('');
  const [type, setType] = React.useState('');
  const [hasDiscount, setHasDiscount] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [formOpen, setFormOpen] = React.useState(false);
  const [editProduct, setEditProduct] = React.useState<AdminProduct | null>(null);
  const [deleteId, setDeleteId] = React.useState<number | null>(null);
  const [selectedIds, setSelectedIds] = React.useState<number[]>([]);
  const [bulkOpen, setBulkOpen] = React.useState(false);

  const PAGE_SIZE = 20;

  const debouncedSetSearch = React.useMemo(
    () => debounce((v: unknown) => { setDebouncedSearch(v as string); setPage(1); }, 400),
    [],
  );

  const { data, isLoading } = useAdminProducts({
    search: debouncedSearch,
    region: region || undefined,
    type: type || undefined,
    hasDiscount: hasDiscount || undefined,
    page,
    limit: PAGE_SIZE,
  });

  const deleteMutation = useDeleteProduct();

  const handleSearch = (v: string) => {
    setSearch(v);
    debouncedSetSearch(v);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      toast.success('Продукт удалён');
    } catch {
      toast.error('Ошибка при удалении');
    } finally {
      setDeleteId(null);
    }
  };

  const updateMutation = useUpdateProduct();

  const toggleAvailable = async (product: AdminProduct) => {
    try {
      await updateMutation.mutateAsync({ id: product.id, isAvailable: !product.isAvailable });
    } catch {
      toast.error('Ошибка');
    }
  };

  const columns: Column<AdminProduct>[] = [
    {
      key: 'imageUrl',
      header: '',
      className: 'w-12',
      render: (val) => (
        <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#1A1A2E] flex-shrink-0">
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
      sortable: true,
      render: (val, row) => (
        <div>
          <p className="font-semibold text-white text-sm">{val as string}</p>
          <p className="text-xs text-[#B0B0B0]">{row.slug}</p>
        </div>
      ),
    },
    { key: 'region', header: 'Регион', sortable: true },
    { key: 'type', header: 'Тип', sortable: true },
    {
      key: 'price',
      header: 'Цена',
      sortable: true,
      render: (val, row) => (
        <div className="tabular-nums">
          <span className="font-semibold text-white">{val as number} ₽</span>
          {row.discount ? (
            <span className="ml-2 text-xs bg-[#001A0D] text-[#00C853] px-1.5 py-0.5 rounded-full">
              -{row.discount}%
            </span>
          ) : null}
        </div>
      ),
    },
    {
      key: 'isAvailable',
      header: 'Статус',
      render: (val, row) => (
        <button
          onClick={() => toggleAvailable(row)}
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
      key: 'id',
      header: 'Действия',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setEditProduct(row); setFormOpen(true); }}
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
          <h1 className="text-xl font-bold text-white">Продукты</h1>
          <p className="text-sm text-[#B0B0B0] mt-0.5">
            {data?.total != null ? `${data.total} продуктов` : ''}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {selectedIds.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBulkOpen(true)}
            >
              <Percent size={14} />
              Скидка ({selectedIds.length})
            </Button>
          )}
          <Button
            size="sm"
            onClick={() => { setEditProduct(null); setFormOpen(true); }}
          >
            <Plus size={14} />
            Создать продукт
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px] max-w-sm">
          <Input
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Поиск продуктов..."
            leftIcon={<Search size={16} />}
          />
        </div>
        <select
          value={region}
          onChange={(e) => { setRegion(e.target.value); setPage(1); }}
          className="admin-select w-auto"
        >
          <option value="">Все регионы</option>
          {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <select
          value={type}
          onChange={(e) => { setType(e.target.value); setPage(1); }}
          className="admin-select w-auto"
        >
          <option value="">Все типы</option>
          {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <label className="flex items-center gap-2 cursor-pointer text-sm text-[#B0B0B0] hover:text-white transition-colors">
          <input
            type="checkbox"
            checked={hasDiscount}
            onChange={(e) => { setHasDiscount(e.target.checked); setPage(1); }}
            className="w-4 h-4 rounded border-[#2D2D4A] bg-[#1E2030] accent-[#003087] cursor-pointer"
          />
          Со скидкой
        </label>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={(data?.products ?? []) as unknown as Record<string, unknown>[]}
        isLoading={isLoading}
        total={data?.total ?? 0}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        selectable
        onSelectionChange={setSelectedIds}
        emptyMessage="Продукты не найдены"
      />

      {/* Dialogs */}
      <ProductFormDialog
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditProduct(null); }}
        product={editProduct}
      />
      <BulkDiscountDialog
        open={bulkOpen}
        onClose={() => setBulkOpen(false)}
        selectedIds={selectedIds}
      />
      <ConfirmDialog
        open={deleteId != null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Удалить продукт"
        message="Продукт будет удалён безвозвратно. Продолжить?"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
