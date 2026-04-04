import type { Metadata } from 'next';
import SearchClient from './SearchClient';

type Props = {
  searchParams: Promise<{ q?: string }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const q = params?.q || '';
  return {
    title: q ? `${q} — поиск игр PlayStation` : 'Поиск игр',
    description: `Найдите игры PlayStation по запросу "${q}". Низкие цены, оплата СБП.`,
  };
}

export default function SearchPage() {
  return <SearchClient />;
}
