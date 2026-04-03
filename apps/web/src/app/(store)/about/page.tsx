import * as React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'О нас',
  description:
    'Reloc Store — крупнейший сервис пополнения PS Store в России. Более 60 000 клиентов доверяют нам с 2022 года.',
};

const STATS = [
  { value: '60 000+', label: 'довольных клиентов' },
  { value: '5.0', label: 'рейтинг на Яндекс Картах' },
  { value: '3 000+', label: 'отзывов от покупателей' },
  { value: 'с 2022', label: 'года работаем для вас' },
];

const STEPS = [
  {
    num: '1',
    title: 'Выбери игру',
    desc: 'Найдите нужную игру в каталоге — система сама подберёт нужную карту пополнения с лучшим курсом.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
    ),
  },
  {
    num: '2',
    title: 'Оплати через СБП',
    desc: 'Мгновенный перевод через любой банк. Никаких комиссий, никаких карточных данных.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="14" x="2" y="5" rx="2" />
        <path d="M2 10h20" />
      </svg>
    ),
  },
  {
    num: '3',
    title: 'Получи код',
    desc: 'Код пополнения придёт мгновенно на email или в Telegram. Активируйте и играйте!',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
];

const REGIONS = [
  {
    flag: '🇹🇷',
    name: 'Турция',
    badge: 'скидка до 60%',
    desc: 'Турецкий регион — самый популярный среди российских геймеров благодаря выгодному курсу лиры.',
  },
  {
    flag: '🇮🇳',
    name: 'Индия',
    badge: 'до 70% дешевле',
    desc: 'Индийский регион предлагает одни из самых низких цен на весь ассортимент PS Store.',
  },
  {
    flag: '🇺🇦',
    name: 'Украина',
    badge: 'понятные цены',
    desc: 'Украинский регион с близкими к российским ценами и удобным каталогом.',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="bg-gradient-to-b from-[#1E1E3A] to-background pt-16 pb-20 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block bg-[#003087]/20 text-[#6699FF] text-xs font-semibold px-3 py-1 rounded-full border border-[#003087]/40 mb-6">
            Партнёрский сервис Cloudmill
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
            О нас
          </h1>
          <p className="text-[#B0B0B0] text-lg leading-relaxed">
            Крупнейший сервис пополнения PS Store в России
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-5xl mx-auto px-4 -mt-10 mb-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="bg-[#242444] border border-[#003087]/40 rounded-2xl p-6 text-center hover:border-[#003087] transition-colors duration-300"
            >
              <div className="text-3xl font-extrabold text-white mb-1">{stat.value}</div>
              <div className="text-[#B0B0B0] text-xs leading-snug">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="max-w-3xl mx-auto px-4 mb-20">
        <div className="bg-[#1E1E38] border border-[#3A3A5C] rounded-2xl p-8 md:p-10">
          <h2 className="text-2xl font-bold text-white mb-4">Наша миссия</h2>
          <p className="text-[#B0B0B0] text-base leading-relaxed">
            Мы помогаем российским геймерам получить доступ к любимым играм, несмотря на
            ограничения. Reloc Store — партнёрский сервис{' '}
            <span className="text-white font-medium">Cloudmill (Санкт-Петербург)</span>, работающий
            с 2022 года. За это время мы отработали десятки тысяч заказов и собрали рейтинг 5.0 на
            Яндекс Картах.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-4 mb-20">
        <h2 className="text-2xl font-bold text-white text-center mb-10">Как это работает</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STEPS.map((step, idx) => (
            <div key={idx} className="relative bg-[#242444] rounded-2xl p-6 border border-[#3A3A5C]">
              {idx < STEPS.length - 1 && (
                <div className="hidden md:block absolute top-1/4 -right-3 z-10 text-[#3A3A5C]">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </div>
              )}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#003087]/20 border border-[#003087]/40 flex items-center justify-center text-[#6699FF]">
                  {step.icon}
                </div>
                <span className="text-[#003087] font-bold text-lg">Шаг {step.num}</span>
              </div>
              <h3 className="text-white font-semibold text-base mb-2">{step.title}</h3>
              <p className="text-[#B0B0B0] text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Regions */}
      <section className="max-w-5xl mx-auto px-4 mb-20">
        <h2 className="text-2xl font-bold text-white text-center mb-10">Регионы пополнения</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {REGIONS.map((r) => (
            <div
              key={r.name}
              className="bg-[#242444] border border-[#3A3A5C] rounded-2xl p-6 hover:border-[#003087]/60 transition-colors duration-300"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{r.flag}</span>
                <div>
                  <div className="text-white font-semibold">{r.name}</div>
                  <span className="inline-block text-xs bg-[#003087]/20 text-[#6699FF] px-2 py-0.5 rounded-full border border-[#003087]/30 mt-1">
                    {r.badge}
                  </span>
                </div>
              </div>
              <p className="text-[#B0B0B0] text-sm leading-relaxed">{r.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust signals */}
      <section className="max-w-5xl mx-auto px-4 mb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#242444] border border-[#3A3A5C] rounded-2xl p-6 flex items-center gap-5">
            <div className="w-12 h-12 rounded-xl bg-[#FF4500]/10 border border-[#FF4500]/30 flex items-center justify-center flex-shrink-0">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#FF6B35"/>
              </svg>
            </div>
            <div>
              <div className="text-white font-semibold mb-1">Яндекс Карты</div>
              <div className="flex items-center gap-1 mb-1">
                {[1,2,3,4,5].map((s) => (
                  <svg key={s} width="14" height="14" viewBox="0 0 24 24" fill="#FFD700">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                ))}
                <span className="text-white font-bold text-sm ml-1">5.0</span>
              </div>
              <p className="text-[#B0B0B0] text-xs">Рейтинг от реальных покупателей</p>
            </div>
          </div>
          <div className="bg-[#242444] border border-[#3A3A5C] rounded-2xl p-6 flex items-center gap-5">
            <div className="w-12 h-12 rounded-xl bg-[#4C75A3]/10 border border-[#4C75A3]/30 flex items-center justify-center flex-shrink-0">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#4C75A3">
                <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.408 0 15.684 0zm-1.867 16.875c-.375.375-.844.563-1.313.563-.469 0-.938-.188-1.313-.563l-3.5-3.5a1.857 1.857 0 0 1 0-2.625l3.5-3.5a1.857 1.857 0 0 1 2.625 0 1.857 1.857 0 0 1 0 2.625L11.813 12l1.998 2.25a1.857 1.857 0 0 1 .006 2.625z"/>
              </svg>
            </div>
            <div>
              <div className="text-white font-semibold mb-1">ВКонтакте</div>
              <div className="text-2xl font-extrabold text-white mb-1">3 000+</div>
              <p className="text-[#B0B0B0] text-xs">отзывов в сообществе vk.com/relocstore</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
