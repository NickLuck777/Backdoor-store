import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { YandexMetrika } from '@/components/seo/YandexMetrika';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://reloc.store'),
  alternates: {
    canonical: '/',
  },
  title: {
    default: 'Reloc Store — Игры PlayStation по лучшим ценам',
    template: '%s | Reloc Store',
  },
  description: 'Купите игры и подписки PlayStation с оплатой через СБП. Автоматическая доставка кодов пополнения.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className="dark">
      <body className={`${inter.className} bg-background text-foreground antialiased`}>
        <Providers>{children}</Providers>
        <YandexMetrika />
      </body>
    </html>
  );
}
