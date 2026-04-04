'use client';

import * as React from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  useAdminOrders,
  useUpdateOrderStatus,
  type AdminOrder,
  type OrderStatus,
} from '@/lib/hooks/useAdmin';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { formatPrice, debounce } from '@/lib/utils';
import { Search, Eye, ChevronRight } from 'lucide-react';

const STATUS_OPTIONS: OrderStatus[] = [
  'PENDING', 'PAID', 'PROCESSING', 'DELIVERED', 'COMPLETED', 'CANCELLED',
];

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Ожидает',
  PAID: 'Оплачен',
  PROCESSING: 'В обработке',
  DELIVERED: 'Доставлен',
  COMPLETED: 'Завершён',
  CANCELLED: 'Отменён',
};

export default function AdminOrdersPage() {
  const [status, setStatus] = React.useState<OrderStatus | ''>('');
  const [email, setEmail] = React.useState('');
  const [debouncedEmail, setDebouncedEmail] = React.useState('');
  const [dateFrom, setDateFrom] = React.useState('');
  const [dateTo, setDateTo] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [sortKey, setSortKey] = React.useState('createdAt');
  const [sortDir, setSortDir] = React.useState<'asc' | 'desc'>('desc');

  const [cancelTarget, setCancelTarget] = React.useState<AdminOrder | null>(null);

  const PAGE_SIZE = 20;

  const debouncedSetEmail = React.useMemo(
    () => debounce((v: unknown) => { setDebouncedEmail(v as string); setPage(1); }, 400),
    [],
  );

  const { data, isLoading } = useAdminOrders({
    status: status || undefined,
    email: debouncedEmail || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    page,
    limit: PAGE_SIZE,
  });

  const updateStatus = useUpdateOrderStatus();

  const handleEmailChange = (v: string) => {
    setEmail(v);
    debouncedSetEmail(v);
  };

  const handleCancel = async () => {
    if (!cancelTarget) return;
    try {
      await updateStatus.mutateAsync({ id: cancelTarget.id, status: 'CANCELLED' });
      toast.success(`Заказ ${cancelTarget.orderNumber} отменён`);
    } catch {
      toast.error('Ошибка при отмене заказа');
    } finally {
      setCancelTarget(null);
    }
  };

  const columns: Column<AdminOrder>[] = [
    {
      key: 'orderNumber',
      header: 'Номер',
      sortable: true,
      render: (val) => (
        <span className="font-mono text-xs font-semibold text-[#4DA6FF]">{val as string}</span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Дата',
      sortable: true,
      render: (val) => (
        <span className="text-xs text-[#B0B0B0]">
          {new Date(val as string).toLocaleString('ru-RU', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
          })}
        </span>
      ),
    },
    {
      key: 'customerEmail',
      header: 'Email',
      render: (val) => <span className="text-sm text-[#E0E0E0]">{val as string}</span>,
    },
    {
      key: 'status',
      header: 'Статус',
      sortable: true,
      render: (val) => <StatusBadge status={val as OrderStatus} />,
    },
    {
      key: 'totalAmount',
      header: 'Сумма',
      sortable: true,
      render: (val) => (
        <span className="font-semibold text-white tabular-nums">{formatPrice(val as number)}</span>
      ),
    },
    {
      key: 'id',
      header: '',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/orders/${row.id}`}
            className="p-1.5 rounded-lg text-[#B0B0B0] hover:text-white hover:bg-white/10 transition-all duration-200 inline-flex"
          >
            <Eye size={14} />
          </Link>
          {row.status !== 'CANCELLED' && row.status !== 'COMPLETED' && (
            <button
              onClick={() => setCancelTarget(row)}
              className="text-xs text-[#FF1744] hover:underline px-1"
            >
              Отменить
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-white">Заказы</h1>
        <p className="text-sm text-[#B0B0B0] mt-0.5">
          {data?.total != null ? `${data.total} заказов` : ''}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px] max-w-sm">
          <Input
            value={email}
            onChange={(e) => handleEmailChange(e.target.value)}
            placeholder="Поиск по email..."
            leftIcon={<Search size={16} />}
          />
        </div>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value as OrderStatus | ''); setPage(1); }}
          className="admin-select w-auto"
        >
          <option value="">Все статусы</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
        <Input
          type="date"
          value={dateFrom}
          onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
          className="w-auto"
          placeholder="От"
        />
        <Input
          type="date"
          value={dateTo}
          onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
          className="w-auto"
          placeholder="До"
        />
        {(status || email || dateFrom || dateTo) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setStatus('');
              setEmail('');
              setDebouncedEmail('');
              setDateFrom('');
              setDateTo('');
              setPage(1);
            }}
          >
            Сбросить
          </Button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={(data?.orders ?? []) as unknown as Record<string, unknown>[]}
        isLoading={isLoading}
        total={data?.total ?? 0}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        onSort={(key, dir) => { setSortKey(key); setSortDir(dir); }}
        emptyMessage="Заказы не найдены"
      />

      <ConfirmDialog
        open={cancelTarget != null}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancel}
        title="Отменить заказ"
        message={`Заказ ${cancelTarget?.orderNumber} будет отменён. Продолжить?`}
        confirmLabel="Отменить заказ"
        isLoading={updateStatus.isPending}
      />
    </div>
  );
}
