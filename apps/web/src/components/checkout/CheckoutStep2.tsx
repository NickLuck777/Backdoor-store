'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RegionSwitcher } from '@/components/catalog/RegionSwitcher';
import type { Region } from '@/types';

const contactSchema = z.object({
  email: z.string().email('Введите корректный email'),
  phone: z
    .string()
    .optional()
    .refine((val) => !val || /^\+7\d{10}$/.test(val), {
      message: 'Формат: +7XXXXXXXXXX',
    }),
  telegram: z
    .string()
    .optional()
    .refine((val) => !val || /^(@\w{5,}|\+7\d{10})$/.test(val), {
      message: 'Формат: @username или +7XXXXXXXXXX',
    }),
  needsPsnAccount: z.boolean().default(false),
  psnAccountRegion: z.enum(['TURKEY', 'INDIA', 'UKRAINE']).optional(),
});

export type ContactFormValues = z.infer<typeof contactSchema>;

interface CheckoutStep2Props {
  onNext: (data: ContactFormValues) => void;
  onBack: () => void;
  defaultValues?: Partial<ContactFormValues>;
}

interface FieldProps {
  label: string;
  error?: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}

function Field({ label, error, required, hint, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-white">
        {label}
        {required && <span className="text-discount-red ml-1">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-muted">{hint}</p>}
      {error && <p className="text-xs text-discount-red">{error}</p>}
    </div>
  );
}

export function CheckoutStep2({ onNext, onBack, defaultValues }: CheckoutStep2Props) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    mode: 'onChange',
    defaultValues: {
      email: defaultValues?.email ?? '',
      phone: defaultValues?.phone ?? '',
      telegram: defaultValues?.telegram ?? '',
      needsPsnAccount: defaultValues?.needsPsnAccount ?? false,
      psnAccountRegion: defaultValues?.psnAccountRegion ?? 'TURKEY',
    },
  });

  const needsPsnAccount = watch('needsPsnAccount');
  const psnRegion = watch('psnAccountRegion') ?? 'TURKEY';

  const inputClass = cn(
    'w-full h-11 px-4 rounded-xl',
    'bg-white/5 border border-border',
    'text-white text-sm placeholder:text-muted',
    'focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/60',
    'transition-all duration-200',
  );

  const errorInputClass = 'border-discount-red/60 focus:ring-discount-red/30 focus:border-discount-red';

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-6">
      {/* Contact fields */}
      <div className="bg-card rounded-2xl border border-border/40 overflow-hidden">
        <div className="px-5 py-4 border-b border-border/40">
          <h2 className="font-bold text-white">Контактные данные</h2>
          <p className="text-xs text-muted mt-0.5">
            Коды придут на email. Telegram — для поддержки.
          </p>
        </div>

        <div className="px-5 py-5 space-y-5">
          {/* Email */}
          <Field label="Email" required error={errors.email?.message}>
            <input
              {...register('email')}
              type="email"
              placeholder="your@email.com"
              autoComplete="email"
              className={cn(inputClass, errors.email && errorInputClass)}
            />
          </Field>

          {/* Phone */}
          <Field
            label="Телефон"
            error={errors.phone?.message}
            hint="Необязательно. Формат: +7XXXXXXXXXX"
          >
            <input
              {...register('phone')}
              type="tel"
              placeholder="+79001234567"
              autoComplete="tel"
              className={cn(inputClass, errors.phone && errorInputClass)}
            />
          </Field>

          {/* Telegram */}
          <Field
            label="Telegram"
            error={errors.telegram?.message}
            hint="Необязательно. @username или +7XXXXXXXXXX"
          >
            <input
              {...register('telegram')}
              type="text"
              placeholder="@username"
              className={cn(inputClass, errors.telegram && errorInputClass)}
            />
          </Field>
        </div>
      </div>

      {/* PSN Account */}
      <div className="bg-card rounded-2xl border border-border/40 overflow-hidden">
        <div className="px-5 py-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <div className="mt-0.5 relative flex-shrink-0">
              <input
                {...register('needsPsnAccount')}
                type="checkbox"
                className="sr-only peer"
              />
              <div className={cn(
                'w-5 h-5 rounded border-2 border-border',
                'peer-checked:bg-accent peer-checked:border-accent',
                'transition-all duration-200',
                'flex items-center justify-center',
              )}>
                {needsPsnAccount && (
                  <svg viewBox="0 0 12 10" fill="none" className="w-3 h-2.5">
                    <path d="M1 5l3 4L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Мне нужен аккаунт PSN</p>
              <p className="text-xs text-muted mt-0.5">Создадим бесплатно при покупке</p>
            </div>
          </label>

          {needsPsnAccount && (
            <div className="mt-4 pl-8">
              <p className="text-xs text-muted mb-2">Выберите регион аккаунта</p>
              <RegionSwitcher
                value={psnRegion as Region}
                onChange={(r) => setValue('psnAccountRegion', r)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-muted hover:text-white transition-colors duration-200"
        >
          <ArrowLeft size={14} />
          Назад
        </button>
        <div className="flex-1" />
        <button
          type="submit"
          disabled={!isValid}
          className={cn(
            'flex items-center gap-2 h-12 px-8 rounded-xl',
            'bg-accent hover:bg-accent-hover',
            'text-white font-bold text-sm',
            'transition-all duration-300',
            'disabled:opacity-50 disabled:cursor-not-allowed',
          )}
        >
          Далее: Оплата
          <ArrowRight size={16} />
        </button>
      </div>
    </form>
  );
}

export default CheckoutStep2;
