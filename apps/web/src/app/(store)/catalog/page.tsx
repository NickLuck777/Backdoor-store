import type { Metadata } from 'next';
import CatalogClient from './CatalogClient';

export const metadata: Metadata = {
  title: 'Каталог игр PlayStation — купить коды пополнения PS Store',
  description: 'Все игры PS4 и PS5 по ценам Турции, Индии и Украины. Скидки до 70%. Оплата СБП, мгновенная доставка.',
  openGraph: {
    title: 'Каталог игр PlayStation — купить коды пополнения PS Store',
    description: 'Все игры PS4 и PS5 по ценам Турции, Индии и Украины. Скидки до 70%. Оплата СБП, мгновенная доставка.',
    type: 'website',
  },
};

export default function CatalogPage() {
  return <CatalogClient />;
}
