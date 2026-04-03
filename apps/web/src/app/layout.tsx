import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

export const metadata: Metadata = {
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
        {children}
      </body>
    </html>
  );
}
