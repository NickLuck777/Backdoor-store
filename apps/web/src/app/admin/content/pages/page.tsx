'use client';

import * as React from 'react';
import { FileText, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ContentPage {
  slug: string;
  title: string;
  href: string;
  description: string;
}

const CONTENT_PAGES: ContentPage[] = [
  { slug: 'about', title: 'О нас', href: '/about', description: 'Страница о компании, статистика, миссия' },
  { slug: 'contacts', title: 'Контакты', href: '/contacts', description: 'Контактная информация и форма обратной связи' },
  { slug: 'privacy', title: 'Политика конфиденциальности', href: '/privacy', description: 'Полный текст политики конфиденциальности' },
  { slug: 'terms', title: 'Пользовательское соглашение', href: '/terms', description: 'Условия использования сервиса' },
  { slug: 'support', title: 'Поддержка / FAQ', href: '/support', description: 'Страница FAQ с часто задаваемыми вопросами' },
];

export default function AdminContentPagesPage() {
  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-white">Страницы сайта</h1>
        <p className="text-sm text-[#B0B0B0] mt-0.5">
          Статические страницы контента. Для редактирования FAQ используйте раздел FAQ.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {CONTENT_PAGES.map((page) => (
          <div
            key={page.slug}
            className="flex items-center gap-4 p-4 bg-[#1E2030] border border-[#2D2D4A] rounded-2xl hover:border-[#003087]/30 transition-all duration-200"
          >
            <div className="w-10 h-10 rounded-xl bg-[#003087]/20 flex items-center justify-center text-[#4DA6FF] flex-shrink-0">
              <FileText size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white text-sm">{page.title}</p>
              <p className="text-xs text-[#B0B0B0] mt-0.5">{page.description}</p>
            </div>
            <a href={page.href} target="_blank" rel="noreferrer">
              <Button variant="ghost" size="sm" className="gap-1.5">
                <ExternalLink size={13} />
                Открыть
              </Button>
            </a>
          </div>
        ))}
      </div>

      <div className="bg-[#111827] border border-[#2D2D4A] rounded-xl p-4">
        <p className="text-xs text-[#B0B0B0]">
          Контент статических страниц редактируется в коде. Для динамических FAQ и баннеров
          используйте соответствующие разделы в меню слева.
        </p>
      </div>
    </div>
  );
}
