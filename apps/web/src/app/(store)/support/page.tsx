'use client';

import * as React from 'react';
import { Search, MessageCircle } from 'lucide-react';
import { FAQAccordion, type FAQItem } from '@/components/ui/FAQAccordion';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

const HARDCODED_FAQ: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'Что вы продаёте?',
    answer:
      'Мы продаём коды пополнения PSN. Все игры в каталоге показаны для удобства — после оплаты вы получите код пополнения и инструкцию по активации.',
  },
  {
    id: 'faq-2',
    question: 'Как сделать заказ?',
    answer:
      'Выберите нужные игры и добавьте в корзину — система автоматически покажет, какие карты пополнения нужны.',
  },
  {
    id: 'faq-3',
    question: 'Нужен ли мне аккаунт PSN?',
    answer:
      'Нет проблем — создадим бесплатно при покупке. Просто отметьте соответствующий пункт при оформлении заказа.',
  },
  {
    id: 'faq-4',
    question: 'Как происходит оплата?',
    answer:
      'Оплата через СБП (Систему быстрых платежей) — это мгновенный перевод через любой банк.',
  },
  {
    id: 'faq-5',
    question: 'Что такое карта пополнения?',
    answer:
      'Это специальный код, который вы активируете на своём PSN-аккаунте. После активации нужная сумма появляется на балансе, которую вы тратите на покупку игры.',
  },
  {
    id: 'faq-6',
    question: 'Как активировать код?',
    answer:
      'Это просто и можно сделать с консоли или через браузер. Мы пришлём подробную инструкцию после оплаты.',
  },
  {
    id: 'faq-7',
    question: 'Можно ли купить конкретную игру напрямую?',
    answer:
      'Вы можете купить карту пополнения нужного номинала и приобрести игру в PS Store самостоятельно.',
  },
  {
    id: 'faq-8',
    question: 'Нужна помощь!',
    answer:
      'Свяжитесь с нашей поддержкой — поможем разобраться. Напишите нам в Telegram @reloc_support или на email support@reloc.ru. Работаем ежедневно с 9:00 до 23:00 МСК.',
  },
];

function useFAQ() {
  const { data: apiFaq } = useQuery<FAQItem[]>({
    queryKey: ['faq'],
    queryFn: async () => {
      const { data } = await api.get<FAQItem[]>('/faq');
      return data;
    },
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  return React.useMemo(() => {
    if (!apiFaq?.length) return HARDCODED_FAQ;
    const existingIds = new Set(HARDCODED_FAQ.map((f) => f.id));
    const extra = apiFaq.filter((f) => !existingIds.has(f.id));
    return [...HARDCODED_FAQ, ...extra];
  }, [apiFaq]);
}

export default function SupportPage() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const faqItems = useFAQ();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="bg-gradient-to-b from-[#1E1E3A] to-background pt-16 pb-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#003087]/20 border border-[#003087]/40 mb-6">
            <MessageCircle size={26} className="text-[#003087]" />
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-3">Центр поддержки</h1>
          <p className="text-[#B0B0B0] text-lg leading-relaxed">
            Ответы на самые частые вопросы о пополнении PS Store через Reloc
          </p>
        </div>
      </section>

      {/* Search */}
      <section className="max-w-3xl mx-auto px-4 -mt-6 mb-10">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B0B0B0] pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по вопросам..."
            className="w-full bg-[#242444] border border-[#3A3A5C] text-white placeholder-[#B0B0B0]
                       rounded-xl pl-11 pr-4 py-3.5 text-sm outline-none
                       focus:border-[#003087] focus:ring-2 focus:ring-[#003087]/20 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#B0B0B0] hover:text-white transition-colors text-xs"
            >
              Очистить
            </button>
          )}
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="max-w-3xl mx-auto px-4 mb-16">
        <FAQAccordion items={faqItems} searchQuery={searchQuery} />
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-4 mb-20">
        <div className="bg-[#242444] border border-[#3A3A5C] rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold text-white mb-2">Остались вопросы?</h2>
          <p className="text-[#B0B0B0] text-sm mb-6">
            Наша команда поддержки готова помочь ежедневно с 9:00 до 23:00 МСК
          </p>
          <a
            href="https://t.me/reloc_support"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#003087] hover:bg-[#0044CC] text-white
                       font-semibold px-6 py-3 rounded-xl transition-colors duration-200"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.26 13.928l-2.946-.924c-.64-.203-.652-.64.136-.95l11.5-4.433c.533-.194.998.13.612.627z" />
            </svg>
            Написать в Telegram
          </a>
        </div>
      </section>
    </div>
  );
}
