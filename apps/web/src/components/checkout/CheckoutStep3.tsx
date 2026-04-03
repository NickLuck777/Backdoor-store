'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Smartphone, Shield, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/lib/store/cartStore';
import { useRegionStore } from '@/lib/store/regionStore';
import { useSmartCart } from '@/lib/hooks/useCart';
import { useCreateOrder, useInitiatePayment } from '@/lib/hooks/useOrders';
import type { ContactFormValues } from './CheckoutStep2';

interface CheckoutStep3Props {
  contactData: ContactFormValues;
  onBack: () => void;
}

export function CheckoutStep3({ contactData, onBack }: CheckoutStep3Props) {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const region = useRegionStore((state) => state.region);
  const { data: smartCart } = useSmartCart(region);

  const [agreed, setAgreed] = React.useState(false);
  const [step, setStep] = React.useState<'idle' | 'creating' | 'paying' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = React.useState('');

  const createOrder = useCreateOrder();
  const initiatePayment = useInitiatePayment();

  const totalInRub = smartCart?.totalInRub ??
    items.reduce((acc, i) => acc + i.product.price * i.quantity, 0);

  async function handlePay() {
    if (!agreed) return;
    setStep('creating');
    setErrorMessage('');

    try {
      const order = await createOrder.mutateAsync({
        email: contactData.email,
        phone: contactData.phone,
        telegram: contactData.telegram,
        needsPsnAccount: contactData.needsPsnAccount,
        psnAccountRegion: contactData.psnAccountRegion,
        region,
      });

      setStep('paying');

      const payment = await initiatePayment.mutateAsync(order.id);

      if (payment.paymentUrl) {
        window.location.href = payment.paymentUrl;
      } else {
        router.push(`/order/success?orderNumber=${order.orderNumber}`);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Не удалось создать заказ';
      setStep('error');
      setErrorMessage(message);
    }
  }

  const isProcessing = step === 'creating' || step === 'paying';

  return (
    <div className="space-y-6">
      {/* Order summary */}
      <div className="bg-card rounded-2xl border border-border/40 overflow-hidden">
        <div className="px-5 py-4 border-b border-border/40">
          <h2 className="font-bold text-white">Сводка заказа</h2>
        </div>
        <div className="px-5 py-4 space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-sm">
              <span className="text-muted truncate max-w-[200px]">
                {item.product.title} × {item.quantity}
              </span>
              <span className="text-white font-medium flex-shrink-0 ml-2">
                {formatPrice(item.product.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>
        <div className="px-5 py-4 border-t border-border/40 flex items-center justify-between">
          <span className="text-sm text-muted">Итого</span>
          <span className="text-xl font-bold text-white">{formatPrice(totalInRub)}</span>
        </div>
      </div>

      {/* Contact summary */}
      <div className="bg-card rounded-2xl border border-border/40 px-5 py-4">
        <h2 className="font-bold text-white mb-3">Контакты</h2>
        <div className="space-y-1 text-sm">
          <div className="flex gap-2">
            <span className="text-muted w-20 flex-shrink-0">Email</span>
            <span className="text-white">{contactData.email}</span>
          </div>
          {contactData.phone && (
            <div className="flex gap-2">
              <span className="text-muted w-20 flex-shrink-0">Телефон</span>
              <span className="text-white">{contactData.phone}</span>
            </div>
          )}
          {contactData.telegram && (
            <div className="flex gap-2">
              <span className="text-muted w-20 flex-shrink-0">Telegram</span>
              <span className="text-white">{contactData.telegram}</span>
            </div>
          )}
        </div>
      </div>

      {/* Payment method */}
      <div className="bg-card rounded-2xl border border-accent/40 overflow-hidden">
        <div className="px-5 py-4 border-b border-border/40">
          <h2 className="font-bold text-white">Способ оплаты</h2>
        </div>
        <div className="px-5 py-4">
          <div className={cn(
            'flex items-center gap-4 p-4 rounded-xl',
            'bg-accent/10 border-2 border-accent/60',
          )}>
            <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0">
              <Smartphone size={20} className="text-accent-hover" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-white">СБП — Система быстрых платежей</p>
              <p className="text-xs text-muted mt-0.5">Оплата через QR-код в банковском приложении</p>
            </div>
            <CheckCircle size={18} className="text-accent-hover flex-shrink-0" />
          </div>
        </div>
      </div>

      {/* Error state */}
      {step === 'error' && (
        <div className="p-4 rounded-xl bg-discount-red/10 border border-discount-red/30">
          <p className="text-sm text-discount-red font-medium">Ошибка при создании заказа</p>
          <p className="text-xs text-muted mt-1">{errorMessage}</p>
        </div>
      )}

      {/* Terms agreement */}
      <label className="flex items-start gap-3 cursor-pointer">
        <div className="mt-0.5 relative flex-shrink-0">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="sr-only peer"
          />
          <div className={cn(
            'w-5 h-5 rounded border-2',
            agreed ? 'bg-accent border-accent' : 'border-border',
            'transition-all duration-200',
            'flex items-center justify-center',
          )}>
            {agreed && (
              <svg viewBox="0 0 12 10" fill="none" className="w-3 h-2.5">
                <path d="M1 5l3 4L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
        </div>
        <p className="text-sm text-muted leading-relaxed">
          Я согласен с{' '}
          <a href="/terms" className="text-accent-hover hover:underline">условиями использования</a>
          {' '}и{' '}
          <a href="/privacy" className="text-accent-hover hover:underline">политикой конфиденциальности</a>
        </p>
      </label>

      {/* Security note */}
      <div className="flex items-center gap-2 text-xs text-muted">
        <Shield size={14} />
        <span>Ваши данные защищены. Оплата обрабатывается через защищённое соединение.</span>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={isProcessing}
          className="flex items-center gap-2 text-sm text-muted hover:text-white transition-colors duration-200 disabled:opacity-50"
        >
          <ArrowLeft size={14} />
          Назад
        </button>
        <div className="flex-1" />
        <button
          onClick={handlePay}
          disabled={!agreed || isProcessing}
          className={cn(
            'flex items-center justify-center gap-2 h-14 px-10 rounded-xl',
            'bg-accent hover:bg-accent-hover',
            'text-white font-bold text-base',
            'transition-all duration-300',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'w-full sm:w-auto',
          )}
        >
          {isProcessing ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {step === 'creating' ? 'Создаём заказ...' : 'Инициализируем оплату...'}
            </>
          ) : (
            `Оплатить ${formatPrice(totalInRub)}`
          )}
        </button>
      </div>
    </div>
  );
}

export default CheckoutStep3;
