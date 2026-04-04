import * as React from 'react';
import type { Metadata } from 'next';
import { MarkdownRenderer } from '@/components/ui/MarkdownRenderer';

export const metadata: Metadata = {
  title: 'Политика конфиденциальности',
  description: 'Политика конфиденциальности Backdoor Store — порядок обработки и защиты персональных данных пользователей.',
};

const FALLBACK_CONTENT = `# Политика конфиденциальности

**Дата последнего обновления:** 1 января 2026 года

## 1. Общие положения

Настоящая Политика конфиденциальности определяет порядок обработки и защиты персональных данных пользователей сервиса Backdoor Store (далее — «Сервис»), расположенного по адресу backdoor.store.

Используя Сервис, вы соглашаетесь с условиями настоящей Политики. Если вы не согласны с какими-либо условиями — пожалуйста, прекратите использование Сервиса.

## 2. Какие данные мы собираем

- **Контактные данные:** email-адрес, номер телефона, Telegram-username
- **Данные заказа:** информация о приобретённых товарах, история заказов
- **Технические данные:** IP-адрес, тип браузера, cookies
- **Платёжная информация:** мы не храним реквизиты банковских карт — платежи проводятся через СБП

## 3. Цели обработки данных

Мы обрабатываем ваши данные для:

- исполнения заказов и направления кодов пополнения
- технической поддержки и обратной связи
- улучшения качества Сервиса и пользовательского опыта
- соблюдения требований законодательства Российской Федерации

## 4. Хранение и защита данных

Ваши данные хранятся на защищённых серверах, расположенных на территории Российской Федерации, в соответствии с требованиями Федерального закона № 152-ФЗ «О персональных данных».

Срок хранения данных — 3 года с момента последней транзакции. По истечении этого срока данные безвозвратно удаляются.

Мы применяем технические и организационные меры защиты: шифрование передаваемых данных (TLS), ограниченный доступ сотрудников, регулярный аудит безопасности.

## 5. Права пользователей

В соответствии с действующим законодательством вы имеете право:

- запросить копию ваших персональных данных
- потребовать исправления неточных данных
- потребовать удаления данных (право на забвение)
- отозвать согласие на обработку данных

Для реализации любого из перечисленных прав напишите на **support@backdoor.store** с указанием вашего запроса.

## 6. Файлы cookie

Мы используем cookies для:

- обеспечения работы корзины и сохранения сессии
- аутентификации пользователей
- аналитики посещаемости (Яндекс.Метрика)

Используя Сервис, вы соглашаетесь с использованием cookies. Вы можете отключить cookies в настройках браузера, однако это может ограничить функциональность Сервиса.

## 7. Передача данных третьим лицам

Мы не продаём и не передаём ваши данные третьим лицам, за исключением:

- платёжных систем (СБП) для проведения транзакций
- случаев, предусмотренных законодательством РФ

## 8. Изменения Политики

Мы оставляем за собой право изменять настоящую Политику. При существенных изменениях уведомим пользователей по email или через уведомление на сайте.

## 9. Контакты

По всем вопросам обработки персональных данных обращайтесь: **support@backdoor.store**
`;

async function fetchPrivacyContent(): Promise<string | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    const res = await fetch(`${baseUrl}/pages/privacy`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.content ?? null;
  } catch {
    return null;
  }
}

export default async function PrivacyPage() {
  const apiContent = await fetchPrivacyContent();
  const content = apiContent ?? FALLBACK_CONTENT;
  const lastUpdated = '1 января 2026 года';

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="bg-gradient-to-b from-[#1E1E3A] to-background pt-16 pb-12 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3">
            Политика конфиденциальности
          </h1>
          <p className="text-[#B0B0B0] text-sm flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#B0B0B0]">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Последнее обновление: {lastUpdated}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-3xl mx-auto px-4 pb-20">
        <div className="bg-[#242444] border border-[#3A3A5C] rounded-2xl p-6 md:p-10">
          <MarkdownRenderer content={content} />
        </div>

        {/* Contact CTA */}
        <div className="mt-8 bg-[#1E1E38] border border-[#3A3A5C] rounded-2xl p-6 text-center">
          <p className="text-[#B0B0B0] text-sm">
            Вопросы по обработке данных?{' '}
            <a href="mailto:support@backdoor.store" className="text-[#6699FF] hover:text-white transition-colors">
              Напишите нам
            </a>
          </p>
        </div>
      </section>
    </div>
  );
}
