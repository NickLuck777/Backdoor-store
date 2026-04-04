'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { XCircle, RefreshCw, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

const REASON_LABELS: Record<string, string> = {
  cancelled: 'Платёж был отменён',
  timeout: 'Истекло время ожидания оплаты',
  declined: 'Платёж отклонён банком',
  insufficient_funds: 'Недостаточно средств',
  unknown: 'Произошла неизвестная ошибка',
};

export default function OrderFailedPage() {
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason') ?? 'unknown';
  const orderNumber = searchParams.get('orderNumber');

  const reasonText = REASON_LABELS[reason] ?? REASON_LABELS.unknown;

  return (
    <div className="min-h-screen bg-background flex items-start justify-center">
      <div className="max-w-lg w-full mx-auto px-4 sm:px-6 py-12 space-y-8">
        {/* Error header */}
        <div className="flex flex-col items-center text-center gap-4">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', duration: 0.6, bounce: 0.3 }}
          >
            <XCircle size={80} className="text-discount-red" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Что-то пошло не так
            </h1>
            <p className="text-muted mt-2 max-w-xs">{reasonText}</p>
            {orderNumber && (
              <p className="text-xs text-muted mt-2">
                Заказ: <span className="font-mono text-white">{orderNumber}</span>
              </p>
            )}
          </motion.div>
        </div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
          className="flex flex-col items-center gap-4"
        >
          <Link
            href="/checkout"
            className={cn(
              'flex items-center justify-center gap-2 h-12 px-8 rounded-xl w-full sm:w-auto',
              'bg-accent hover:bg-accent-hover',
              'text-white font-bold text-sm',
              'transition-all duration-300',
            )}
          >
            <RefreshCw size={16} />
            Попробовать снова
          </Link>

          <a
            href="https://t.me/backdoor_store_support"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-muted hover:text-white transition-colors duration-200"
          >
            <ExternalLink size={14} />
            Написать в поддержку
          </a>
        </motion.div>
      </div>
    </div>
  );
}
