'use client';

import * as React from 'react';
import { use } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  useAdminOrder,
  useUpdateOrderStatus,
  useAssignCodes,
  type OrderStatus,
} from '@/lib/hooks/useAdmin';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPrice } from '@/lib/utils';
import {
  ArrowLeft,
  Mail,
  Phone,
  MessageCircle,
  Package,
  Key,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

const STATUS_FLOW: Record<OrderStatus, OrderStatus | null> = {
  PENDING: 'PAID',
  PAID: 'PROCESSING',
  PROCESSING: 'DELIVERED',
  DELIVERED: 'COMPLETED',
  COMPLETED: null,
  CANCELLED: null,
};

const NEXT_ACTION_LABEL: Record<OrderStatus, string> = {
  PENDING: 'Отметить оплаченным',
  PAID: 'Назначить коды',
  PROCESSING: 'Отметить доставленным',
  DELIVERED: 'Завершить заказ',
  COMPLETED: '',
  CANCELLED: '',
};

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const orderId = parseInt(id);

  const { data: order, isLoading } = useAdminOrder(orderId);
  const updateStatus = useUpdateOrderStatus();
  const [confirmStatus, setConfirmStatus] = React.useState<OrderStatus | null>(null);
  const [confirmCancel, setConfirmCancel] = React.useState(false);

  const handleStatusAdvance = async () => {
    if (!order || !confirmStatus) return;
    try {
      await updateStatus.mutateAsync({ id: orderId, status: confirmStatus });
      toast.success('Статус обновлён');
    } catch {
      toast.error('Ошибка обновления статуса');
    } finally {
      setConfirmStatus(null);
    }
  };

  const handleCancel = async () => {
    try {
      await updateStatus.mutateAsync({ id: orderId, status: 'CANCELLED' });
      toast.success('Заказ отменён');
    } catch {
      toast.error('Ошибка');
    } finally {
      setConfirmCancel(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 max-w-4xl">
        <Skeleton className="h-8 w-48 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-40 rounded-2xl" />
          <Skeleton className="h-40 rounded-2xl" />
        </div>
        <Skeleton className="h-52 rounded-2xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <AlertCircle size={48} className="text-[#FF1744]/50" />
        <p className="text-[#B0B0B0]">Заказ не найден</p>
        <Link href="/admin/orders">
          <Button variant="outline" size="sm">
            <ArrowLeft size={14} />
            Назад к заказам
          </Button>
        </Link>
      </div>
    );
  }

  const nextStatus = STATUS_FLOW[order.status];

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/orders">
          <button className="p-2 rounded-xl text-[#B0B0B0] hover:text-white hover:bg-white/10 transition-all duration-200">
            <ArrowLeft size={18} />
          </button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-white font-mono">{order.orderNumber}</h1>
            <StatusBadge status={order.status} />
          </div>
          <p className="text-xs text-[#B0B0B0] mt-0.5">
            {new Date(order.createdAt).toLocaleString('ru-RU')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {nextStatus && (
            <Button
              size="sm"
              onClick={() => setConfirmStatus(nextStatus)}
              loading={updateStatus.isPending}
            >
              {NEXT_ACTION_LABEL[order.status]}
              <ChevronRight size={14} />
            </Button>
          )}
          {order.status !== 'CANCELLED' && order.status !== 'COMPLETED' && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setConfirmCancel(true)}
            >
              Отменить
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Customer info */}
        <div className="bg-[#1E2030] border border-[#2D2D4A] rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Данные покупателя</h3>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <Mail size={15} className="text-[#B0B0B0] flex-shrink-0" />
              <span className="text-sm text-[#E0E0E0]">{order.customerEmail}</span>
            </div>
            {order.customerPhone && (
              <div className="flex items-center gap-3">
                <Phone size={15} className="text-[#B0B0B0] flex-shrink-0" />
                <span className="text-sm text-[#E0E0E0]">{order.customerPhone}</span>
              </div>
            )}
            {order.customerTelegram && (
              <div className="flex items-center gap-3">
                <MessageCircle size={15} className="text-[#B0B0B0] flex-shrink-0" />
                <span className="text-sm text-[#E0E0E0]">@{order.customerTelegram}</span>
              </div>
            )}
          </div>
        </div>

        {/* Order summary */}
        <div className="bg-[#1E2030] border border-[#2D2D4A] rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Сводка заказа</h3>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#B0B0B0]">Позиций</span>
              <span className="text-sm font-semibold text-white">{order.items?.length ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#B0B0B0]">Итого</span>
              <span className="text-base font-extrabold text-white tabular-nums">
                {formatPrice(order.totalAmount)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#B0B0B0]">Статус</span>
              <StatusBadge status={order.status} />
            </div>
          </div>
        </div>
      </div>

      {/* Items table */}
      <div className="bg-[#1E2030] border border-[#2D2D4A] rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#2D2D4A] flex items-center gap-2">
          <Package size={16} className="text-[#4DA6FF]" />
          <h3 className="text-sm font-semibold text-white">Состав заказа</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#2D2D4A] bg-[#111827]">
              <th className="px-5 py-3 text-left text-xs font-semibold text-[#B0B0B0] uppercase tracking-wider">Продукт</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-[#B0B0B0] uppercase tracking-wider">Регион</th>
              <th className="px-5 py-3 text-center text-xs font-semibold text-[#B0B0B0] uppercase tracking-wider">Кол-во</th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-[#B0B0B0] uppercase tracking-wider">Цена</th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-[#B0B0B0] uppercase tracking-wider">Итого</th>
            </tr>
          </thead>
          <tbody>
            {order.items?.map((item, i) => (
              <tr
                key={item.id}
                className={`border-b border-[#2D2D4A] ${i % 2 === 0 ? 'bg-[#1E2030]' : 'bg-[#1A1C2A]'}`}
              >
                <td className="px-5 py-3 font-medium text-white">{item.productTitle}</td>
                <td className="px-5 py-3 text-xs text-[#B0B0B0]">{item.region}</td>
                <td className="px-5 py-3 text-center text-[#E0E0E0]">{item.quantity}</td>
                <td className="px-5 py-3 text-right text-[#E0E0E0] tabular-nums">
                  {formatPrice(item.price)}
                </td>
                <td className="px-5 py-3 text-right font-semibold text-white tabular-nums">
                  {formatPrice(item.price * item.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Assigned codes */}
      {order.codes && order.codes.length > 0 && (
        <div className="bg-[#1E2030] border border-[#2D2D4A] rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#2D2D4A] flex items-center gap-2">
            <Key size={16} className="text-[#00C853]" />
            <h3 className="text-sm font-semibold text-white">Назначенные коды</h3>
            <span className="ml-auto text-xs text-[#00C853] font-semibold">
              {order.codes.length} кодов
            </span>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {order.codes.map((code) => (
                <div
                  key={code.id}
                  className="bg-[#111827] border border-[#2D2D4A] rounded-xl px-4 py-3 flex items-center justify-between"
                >
                  <div>
                    <p className="font-mono text-sm font-bold text-white tracking-widest">
                      {code.code}
                    </p>
                    <p className="text-xs text-[#B0B0B0] mt-0.5">
                      {code.denomination} {code.currency}
                    </p>
                  </div>
                  <CheckCircle2 size={16} className="text-[#00C853]" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Confirm dialogs */}
      <ConfirmDialog
        open={confirmStatus != null}
        onClose={() => setConfirmStatus(null)}
        onConfirm={handleStatusAdvance}
        title="Изменить статус"
        message={`Перевести заказ ${order.orderNumber} в статус "${confirmStatus}"?`}
        confirmLabel="Подтвердить"
        isLoading={updateStatus.isPending}
      />
      <ConfirmDialog
        open={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        onConfirm={handleCancel}
        title="Отменить заказ"
        message={`Заказ ${order.orderNumber} будет отменён. Продолжить?`}
        confirmLabel="Отменить заказ"
        isLoading={updateStatus.isPending}
      />
    </div>
  );
}
