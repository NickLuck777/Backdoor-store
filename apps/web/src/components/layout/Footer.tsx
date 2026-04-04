import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

function TelegramIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

function VKIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.391 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.864-.525-2.05-1.727-1.033-1-1.49-1.135-1.744-1.135-.356 0-.458.102-.458.593v1.575c0 .424-.135.678-1.253.678-1.846 0-3.896-1.12-5.335-3.202C4.624 10.857 4.03 8.67 4.03 8.163c0-.254.102-.491.593-.491h1.744c.44 0 .61.203.78.677.864 2.49 2.303 4.675 2.896 4.675.22 0 .322-.102.322-.66V9.721c-.068-1.186-.695-1.287-.695-1.71 0-.204.17-.407.44-.407h2.744c.373 0 .508.203.508.643v3.473c0 .372.17.508.271.508.22 0 .407-.136.813-.542 1.253-1.405 2.151-3.574 2.151-3.574.119-.254.322-.491.762-.491h1.744c.525 0 .644.27.525.643-.22 1.017-2.354 4.031-2.354 4.031-.186.305-.254.44 0 .78.186.254.796.779 1.203 1.253.745.847 1.32 1.558 1.473 2.05.17.49-.085.745-.576.745z" />
    </svg>
  );
}

const FOOTER_LINKS = [
  {
    title: 'Магазин',
    links: [
      { label: 'Каталог', href: '/catalog' },
      { label: 'Поиск', href: '/search' },
      { label: 'PS Plus', href: '/catalog?type=SUBSCRIPTION' },
      { label: 'Пополнение', href: '/catalog?type=TOPUP_CARD' },
      { label: 'Новинки', href: '/catalog?sort=newest' },
    ],
  },
  {
    title: 'Помощь',
    links: [
      { label: 'FAQ', href: '/faq' },
      { label: 'Контакты', href: '/contact' },
      { label: 'О нас', href: '/about' },
      { label: 'Как это работает', href: '/how-it-works' },
    ],
  },
  {
    title: 'Правовая информация',
    links: [
      { label: 'Конфиденциальность', href: '/privacy' },
      { label: 'Условия использования', href: '/terms' },
      { label: 'Возврат', href: '/refund' },
    ],
  },
];

export function Footer({ className }: { className?: string }) {
  return (
    <footer
      className={cn(
        'bg-[#0D0D1F] border-t border-border',
        'pt-12 pb-8',
        className,
      )}
    >
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-extrabold text-white tracking-tight">backdoor</span>
              <span className="text-2xl font-extrabold text-accent-hover tracking-tight">.store</span>
            </Link>
            <p className="text-sm text-muted leading-relaxed">
              Игры и подписки PlayStation по ценам иностранных регионов. Быстро. Безопасно. Выгодно.
            </p>
            {/* Social */}
            <div className="flex items-center gap-3 mt-2">
              <a
                href="https://vk.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="VK"
                className={cn(
                  'flex items-center justify-center w-9 h-9 rounded-xl',
                  'bg-card border border-border text-muted',
                  'hover:text-white hover:border-accent/50 hover:bg-accent/10',
                  'transition-all duration-300',
                )}
              >
                <VKIcon />
              </a>
              <a
                href="https://t.me"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Telegram"
                className={cn(
                  'flex items-center justify-center w-9 h-9 rounded-xl',
                  'bg-card border border-border text-muted',
                  'hover:text-white hover:border-accent/50 hover:bg-accent/10',
                  'transition-all duration-300',
                )}
              >
                <TelegramIcon />
              </a>
            </div>
          </div>

          {/* Link columns */}
          {FOOTER_LINKS.map((section) => (
            <div key={section.title} className="flex flex-col gap-4">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">
                {section.title}
              </h3>
              <ul className="flex flex-col gap-2.5">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted hover:text-white transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border/40 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted">
            &copy; 2026 Backdoor Store. Все права защищены.
          </p>
          <p className="text-xs text-muted text-center sm:text-right">
            PlayStation и PS Store — товарные знаки Sony Interactive Entertainment LLC.
            <br className="sm:hidden" />
            {' '}Backdoor Store не аффилирован с Sony.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
