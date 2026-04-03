'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Copy, Check, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOrderStatus } from '@/lib/hooks/useOrders';

function maskCode(code: string): string {
  if (code.length <= 4) return code;
  return code.slice(0, -2).replace(/./g, (c) => (c === '-' ? '-' : 'X')) + code.slice(-2);
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = React.useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: select
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

const ACTIVATION_STEPS = [
  'Откройте PS Store на консоли или через браузер',
  'Перейдите в раздел «Пополнение кошелька»',
  'Введите код вручную или отсканируйте QR',
  'Подтвердите пополнение',
  'Купите игру в PS Store по балансу',
];

function ActivationAccordion() {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="bg-card rounded-2xl border border-border/40 overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <span className="text-sm font-semibold text-white">Инструкция по активации</span>
        {open ? (
          <ChevronUp size={16} className="text-muted flex-shrink-0" />
        ) : (
          <ChevronDown size={16} className="text-muted flex-shrink-0" />
        )}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <ol className="px-5 pb-5 space-y-3">
              {ACTIVATION_STEPS.map((step, idx) => (
                <li key={idx} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/20 text-accent-hover text-xs font-bold flex items-center justify-center mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-sm text-muted leading-relaxed">{step}</p>
                </li>
              ))}
            </ol>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('orderNumber');

  const { data: order } = useOrderStatus(orderNumber, false);

  return (
    <div className="min-h-screen bg-background flex items-start justify-center">
      <div className="max-w-lg w-full mx-auto px-4 sm:px-6 py-12 space-y-8">
        {/* Success header */}
        <div className="flex flex-col items-center text-center gap-4">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', duration: 0.6, bounce: 0.4, delay: 0.1 }}
          >
            <CheckCircle size={80} className="text-discount-green" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Оплата прошла успешно!
            </h1>
            {orderNumber && (
              <p className="text-sm text-muted mt-2">
                Заказ{' '}
                <span className="text-white font-mono font-semibold">{orderNumber}</span>
              </p>
            )}
          </motion.div>
        </div>

        {/* Codes */}
        {order?.codes && order.codes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.7 }}
            className="bg-card rounded-2xl border border-border/40 overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-border/40">
              <h2 className="font-bold text-white">Ваши коды</h2>
              <p className="text-xs text-muted mt-0.5">Скопируйте и введите в PS Store</p>
            </div>
            <div className="divide-y divide-border/40">
              {order.codes.map((codeItem) => (
                <div key={codeItem.id} className="px-5 py-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-mono text-sm font-semibold text-white tracking-widest">
                      {maskCode(codeItem.code)}
                    </p>
                    <p className="text-xs text-muted mt-0.5">
                      {codeItem.denomination} {codeItem.currency}
                    </p>
                  </div>
                  <CopyButton text={codeItem.code} />
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Activation instructions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.9 }}
        >
          <ActivationAccordion />
        </motion.div>

        {/* Support + CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 1.0 }}
          className="flex flex-col items-center gap-4"
        >
          <a
            href="https://t.me/reloc_store_support"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-muted hover:text-white transition-colors duration-200"
          >
            <ExternalLink size={14} />
            Нужна помощь? Напишите в поддержку
          </a>

          <Link
            href="/catalog"
            className={cn(
              'flex items-center justify-center h-12 px-8 rounded-xl',
              'bg-accent hover:bg-accent-hover',
              'text-white font-bold text-sm',
              'transition-all duration-300',
            )}
          >
            Продолжить покупки
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
