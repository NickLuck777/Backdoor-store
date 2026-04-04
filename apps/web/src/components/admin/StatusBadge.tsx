'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { OrderStatus, CodeStatus } from '@/lib/hooks/useAdmin';

type Status = OrderStatus | CodeStatus;

const statusConfig: Record<Status, { label: string; classes: string }> = {
  PENDING: {
    label: 'Ожидает',
    classes: 'bg-[#2A2000] text-[#FFB800] border border-[#FFB800]/30',
  },
  PAID: {
    label: 'Оплачен',
    classes: 'bg-[#001E4A] text-[#4DA6FF] border border-[#4DA6FF]/30',
  },
  PROCESSING: {
    label: 'В обработке',
    classes: 'bg-[#2A1500] text-[#FF8C00] border border-[#FF8C00]/30',
  },
  DELIVERED: {
    label: 'Доставлен',
    classes: 'bg-[#001A0D] text-[#00C853] border border-[#00C853]/30',
  },
  COMPLETED: {
    label: 'Завершён',
    classes: 'bg-[#001A0D] text-[#00C853] border border-[#00C853]/30',
  },
  CANCELLED: {
    label: 'Отменён',
    classes: 'bg-[#2A0009] text-[#FF1744] border border-[#FF1744]/30',
  },
  AVAILABLE: {
    label: 'Доступен',
    classes: 'bg-[#001A0D] text-[#00C853] border border-[#00C853]/30',
  },
  RESERVED: {
    label: 'Зарезервирован',
    classes: 'bg-[#001E4A] text-[#4DA6FF] border border-[#4DA6FF]/30',
  },
  SOLD: {
    label: 'Продан',
    classes: 'bg-[#1A1A2E] text-[#B0B0B0] border border-[#B0B0B0]/30',
  },
  EXPIRED: {
    label: 'Истёк',
    classes: 'bg-[#2A0009] text-[#FF1744] border border-[#FF1744]/30',
  },
};

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] ?? {
    label: status,
    classes: 'bg-[#1A1A2E] text-[#B0B0B0] border border-[#B0B0B0]/30',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold',
        'whitespace-nowrap',
        config.classes,
        className,
      )}
    >
      {config.label}
    </span>
  );
}

export default StatusBadge;
