'use client';

import * as React from 'react';
import { useAdminUsers, type AdminUser } from '@/lib/hooks/useAdmin';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { Input } from '@/components/ui/input';
import { cn, debounce } from '@/lib/utils';
import { Search } from 'lucide-react';

type UserRole = 'CUSTOMER' | 'MANAGER' | 'ADMIN' | '';

const ROLE_STYLES: Record<string, string> = {
  ADMIN: 'bg-[#001E4A] text-[#4DA6FF] border border-[#4DA6FF]/30',
  MANAGER: 'bg-[#001A0D] text-[#00C853] border border-[#00C853]/30',
  CUSTOMER: 'bg-[#1A1A2E] text-[#B0B0B0] border border-[#B0B0B0]/30',
};

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Администратор',
  MANAGER: 'Менеджер',
  CUSTOMER: 'Покупатель',
};

const PAGE_SIZE = 20;

export default function AdminUsersPage() {
  const [role, setRole] = React.useState<UserRole>('');
  const [search, setSearch] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [page, setPage] = React.useState(1);

  const debouncedSetSearch = React.useMemo(
    () => debounce((v: unknown) => { setDebouncedSearch(v as string); setPage(1); }, 400),
    [],
  );

  const { data, isLoading } = useAdminUsers({
    role: role || undefined,
    search: debouncedSearch || undefined,
    page,
    limit: PAGE_SIZE,
  });

  const handleSearch = (v: string) => {
    setSearch(v);
    debouncedSetSearch(v);
  };

  const columns: Column<AdminUser>[] = [
    {
      key: 'id',
      header: 'ID',
      className: 'text-[#B0B0B0] tabular-nums text-xs w-16',
      render: (val) => `#${val}`,
    },
    {
      key: 'email',
      header: 'Email',
      sortable: true,
      render: (val) => <span className="text-sm text-white">{val as string}</span>,
    },
    {
      key: 'name',
      header: 'Имя',
      render: (val) => (
        <span className="text-sm text-[#E0E0E0]">{(val as string) || '—'}</span>
      ),
    },
    {
      key: 'phone',
      header: 'Телефон',
      render: (val) => (
        <span className="text-sm text-[#B0B0B0]">{(val as string) || '—'}</span>
      ),
    },
    {
      key: 'role',
      header: 'Роль',
      render: (val) => (
        <span
          className={cn(
            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap',
            ROLE_STYLES[val as string] ?? ROLE_STYLES['CUSTOMER'],
          )}
        >
          {ROLE_LABELS[val as string] ?? val}
        </span>
      ),
    },
    {
      key: 'ordersCount',
      header: 'Заказов',
      sortable: true,
      render: (val) => (
        <span className="text-sm font-semibold text-white tabular-nums">{val as number}</span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Зарегистрирован',
      sortable: true,
      render: (val) => (
        <span className="text-xs text-[#B0B0B0]">
          {new Date(val as string).toLocaleDateString('ru-RU')}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-white">Пользователи</h1>
        <p className="text-sm text-[#B0B0B0] mt-0.5">
          {data?.total != null ? `${data.total} пользователей` : ''}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px] max-w-sm">
          <Input
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Поиск по email или имени..."
            leftIcon={<Search size={16} />}
          />
        </div>
        <select
          value={role}
          onChange={(e) => { setRole(e.target.value as UserRole); setPage(1); }}
          className="admin-select w-auto"
        >
          <option value="">Все роли</option>
          <option value="CUSTOMER">Покупатели</option>
          <option value="MANAGER">Менеджеры</option>
          <option value="ADMIN">Администраторы</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={(data?.users ?? []) as unknown as Record<string, unknown>[]}
        isLoading={isLoading}
        total={data?.total ?? 0}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        emptyMessage="Пользователи не найдены"
      />
    </div>
  );
}
