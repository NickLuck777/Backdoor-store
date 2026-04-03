'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaymentProcessingProps {
  stage?: 'creating' | 'paying';
  error?: string | null;
  onRetry?: () => void;
}

export function PaymentProcessing({ stage = 'creating', error, onRetry }: PaymentProcessingProps) {
  const stageText = stage === 'creating' ? 'Создаём заказ...' : 'Инициализируем оплату...';

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-discount-red/10 flex items-center justify-center">
          <AlertCircle size={36} className="text-discount-red" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white mb-2">Что-то пошло не так</h2>
          <p className="text-sm text-muted max-w-sm">{error}</p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className={cn(
              'flex items-center gap-2 h-11 px-6 rounded-xl',
              'bg-accent hover:bg-accent-hover',
              'text-white font-semibold text-sm',
              'transition-all duration-300',
            )}
          >
            <RefreshCw size={16} />
            Попробовать снова
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
      {/* Spinner */}
      <div className="relative">
        <motion.div
          className="w-20 h-20 rounded-full border-4 border-accent/20 border-t-accent"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-accent/20" />
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-white mb-2">{stageText}</h2>
        <p className="text-sm text-muted">Пожалуйста, не закрывайте страницу</p>
      </div>

      {/* Progress steps */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <div className={cn(
            'w-2 h-2 rounded-full',
            stage === 'creating' ? 'bg-accent animate-pulse' : 'bg-discount-green',
          )} />
          <span className={cn(
            'text-xs',
            stage === 'creating' ? 'text-white' : 'text-discount-green',
          )}>Заказ</span>
        </div>
        <div className="w-6 h-px bg-border" />
        <div className="flex items-center gap-1.5">
          <div className={cn(
            'w-2 h-2 rounded-full',
            stage === 'paying' ? 'bg-accent animate-pulse' : 'bg-border',
          )} />
          <span className={cn(
            'text-xs',
            stage === 'paying' ? 'text-white' : 'text-muted',
          )}>Оплата</span>
        </div>
      </div>
    </div>
  );
}

export default PaymentProcessing;
