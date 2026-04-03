'use client';

import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CheckoutStep1 } from '@/components/checkout/CheckoutStep1';
import { CheckoutStep2 } from '@/components/checkout/CheckoutStep2';
import { CheckoutStep3 } from '@/components/checkout/CheckoutStep3';
import type { ContactFormValues } from '@/components/checkout/CheckoutStep2';

type Step = 1 | 2 | 3;

const STEPS: { id: Step; label: string }[] = [
  { id: 1, label: 'Корзина' },
  { id: 2, label: 'Контакты' },
  { id: 3, label: 'Оплата' },
];

function StepIndicator({ currentStep }: { currentStep: Step }) {
  return (
    <div className="flex items-center justify-center mb-10">
      {STEPS.map((step, idx) => (
        <React.Fragment key={step.id}>
          {/* Step bubble */}
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center',
                'text-sm font-bold transition-all duration-300',
                currentStep > step.id
                  ? 'bg-discount-green text-white'
                  : currentStep === step.id
                  ? 'bg-accent text-white'
                  : 'bg-white/10 text-muted',
              )}
            >
              {currentStep > step.id ? <Check size={14} /> : step.id}
            </div>
            <span
              className={cn(
                'text-xs font-medium transition-colors duration-300',
                currentStep >= step.id ? 'text-white' : 'text-muted',
              )}
            >
              {step.label}
            </span>
          </div>

          {/* Connector */}
          {idx < STEPS.length - 1 && (
            <div
              className={cn(
                'flex-1 h-px mx-3 mb-5 transition-all duration-500',
                currentStep > step.id ? 'bg-discount-green' : 'bg-border',
              )}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

export default function CheckoutPage() {
  const [step, setStep] = React.useState<Step>(1);
  const [contactData, setContactData] = React.useState<ContactFormValues | null>(null);

  function handleStep1Next() {
    setStep(2);
  }

  function handleStep2Next(data: ContactFormValues) {
    setContactData(data);
    setStep(3);
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        <h1 className="text-2xl md:text-3xl font-bold text-white text-center mb-8">
          Оформление заказа
        </h1>

        <StepIndicator currentStep={step} />

        {step === 1 && (
          <CheckoutStep1 onNext={handleStep1Next} />
        )}

        {step === 2 && (
          <CheckoutStep2
            onNext={handleStep2Next}
            onBack={() => setStep(1)}
            defaultValues={contactData ?? undefined}
          />
        )}

        {step === 3 && contactData && (
          <CheckoutStep3
            contactData={contactData}
            onBack={() => setStep(2)}
          />
        )}
      </div>
    </div>
  );
}
