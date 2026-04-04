'use client';

import * as React from 'react';
import Link from 'next/link';
import { Copy, Check, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/utils';
import { useOrderStatus } from '@/lib/hooks/useOrders';
import type { OrderStatus } from '@/lib/hooks/useOrders';

interface PageProps {
  params: { orderNumber: string };
}

const STATUS_STEPS: OrderStatus[] = ['PENDING', 'PAID', 'DELIVERED', 'COMPLETED'];

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Ожидает оплаты',
  PAID: 'Оплачен',
  DELIVERED: 'Коды отправлены',
  COMPLETED: 'Завершён',
  CANCELLED: 'Отменён',
};

const STATUS_DESCRIPTIONS: Record<OrderStatus, string> = {
  PENDING: 'Ждём подтверждение от банка...',
  PAID: 'Оплата получена. Подготавливаем коды...',
  DELIVERED: 'Коды готовы! Проверьте их ниже.',
  COMPLETED: 'Заказ успешно выполнен.',
  CANCELLED: 'Заказ был отменён.',
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = React.useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  return (
    <button
      onClick={handleCopy}
      className={cn(
        'flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold',
        'transition-all duration-200',
        copied
          ? 'bg-discount-green/20 text-discount-green border border-discount-green/30'
          : 'bg-white/5 text-muted hover:text-white hover:bg-white/10 border border-border',
      )}
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? 'Скопировано!' : 'Скопировать'}
    </button>
  );
}

function StatusProgress({ status }: { status: OrderStatus }) {
  if (status === 'CANCELLED') {
    return (
      <div className="p-4 rounded-xl bg-discount-red/10 border border-discount-red/30">
        <p className="text-sm text-discount-red font-semibold">{STATUS_LABELS.CANCELLED}</p>
        <p className="text-xs text-muted mt-1">{STATUS_DESCRIPTIONS.CANCELLED}</p>
      </div>
    );
  }

  const currentIdx = STATUS_STEPS.indexOf(status);

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="relative h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full bg-accent rounded-full transition-all duration-700"
          style={{ width: `${((currentIdx + 1) / STATUS_STEPS.length) * 100}%` }}
        />
      </div>

      {/* Step indicators */}
      <div className="flex justify-between">
        {STATUS_STEPS.map((s, idx) => (
          <div key={s} className="flex flex-col items-center gap-1 flex-1">
            <div
              className={cn(
                'w-3 h-3 rounded-full transition-all duration-300',
                idx <= currentIdx ? 'bg-accent' : 'bg-white/20',
              )}
            />
            <span className={cn(
              'text-[10px] text-center leading-tight',
              idx <= currentIdx ? 'text-white' : 'text-muted',
            )}>
              {STATUS_LABELS[s]}
            </span>
          </div>
        ))}
      </div>

      {/* Current description */}
      <p className="text-sm text-muted text-center">{STATUS_DESCRIPTIONS[status]}</p>
    </div>
  );
}

export default function OrderStatusPage({ params }: PageProps) {
  const { orderNumber } = params;
  const { data: order, isLoading, error } = useOrderStatus(orderNumber, true);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-2 border-accent/30 border-t-accent rounded-full animate-spin mx-auto" />
          <p className="text-muted text-sm">Загружаем заказ...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-discount-red">Заказ не найден</p>
          <Link href="/catalog" className="text-sm text-accent-hover hover:underline">
            В каталог
          </Link>
        </div>
      </div>
    );
  }

  const showCodes = order.status === 'DELIVERED' || order.status === 'COMPLETED';

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg w-full mx-auto px-4 sm:px-6 py-8 md:py-12 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Статус заказа</h1>
          <p className="text-sm text-muted mt-1 font-mono">{order.orderNumber}</p>
        </div>

        {/* Status progress */}
        <div className="bg-card rounded-2xl border border-border/40 p-5">
          <StatusProgress status={order.status} />
        </div>

        {/* Order details */}
        <div className="bg-card rounded-2xl border border-border/40 overflow-hidden">
          <div className="px-5 py-4 border-b border-border/40">
            <h2 className="font-bold text-white">Состав заказа</h2>
          </div>
          <div className="divide-y divide-border/40">
            {order.products.map((product) => (
              <div key={product.id} className="flex items-center justify-between px-5 py-3 text-sm">
                <span className="text-muted truncate max-w-[220px]">
                  {product.title} × {product.quantity}
                </span>
                <span className="text-white font-medium flex-shrink-0 ml-2">
                  {formatPrice(product.price * product.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className="px-5 py-4 border-t border-border/40 flex items-center justify-between">
            <span className="text-sm text-muted">Итого</span>
            <span className="text-lg font-bold text-white">{formatPrice(order.totalInRub)}</span>
          </div>
        </div>

        {/* Codes (when delivered) */}
        {showCodes && order.codes.length > 0 && (
          <div className="bg-card rounded-2xl border border-discount-green/30 overflow-hidden">
            <div className="px-5 py-4 border-b border-border/40">
              <h2 className="font-bold text-white">Ваши коды</h2>
              <p className="text-xs text-muted mt-0.5">Введите в PS Store для пополнения кошелька</p>
            </div>
            <div className="divide-y divide-border/40">
              {order.codes.map((codeItem) => (
                <div key={codeItem.id} className="px-5 py-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-mono text-sm font-semibold text-white tracking-widest">
                      {codeItem.code}
                    </p>
                    <p className="text-xs text-muted mt-0.5">
                      {codeItem.denomination} {codeItem.currency}
                    </p>
                  </div>
                  <CopyButton text={codeItem.code} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Support link */}
        <div className="flex justify-center">
          <a
            href="https://t.me/backdoor_store_support"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-muted hover:text-white transition-colors duration-200"
          >
            <ExternalLink size={14} />
            Нужна помощь? Напишите в поддержку
          </a>
        </div>
      </div>
    </div>
  );
}
