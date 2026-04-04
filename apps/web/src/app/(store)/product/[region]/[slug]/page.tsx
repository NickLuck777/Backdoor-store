import type { Metadata } from 'next';
import { JsonLd } from '@/components/seo/JsonLd';
import { buildProductSchema, buildBreadcrumbSchema } from '@/lib/schema';
import ProductClient from './ProductClient';

type Props = {
  params: Promise<{ region: string; slug: string }>;
};

async function fetchProduct(slug: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/products/${slug}`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProduct(slug);

  if (!product) return { title: 'Игра не найдена' };

  const title = `${product.title}${product.edition ? ` ${product.edition}` : ''} — купить для PS Store`;
  const description = `Купите ${product.title} для PS${product.platform || 4} через пополнение PS Store. Цена ${product.price} ₽. Оплата СБП, мгновенная доставка кода.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: product.imageUrl
        ? [{ url: product.imageUrl, width: 400, height: 533 }]
        : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: product.imageUrl ? [product.imageUrl] : [],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { region, slug } = await params;
  const product = await fetchProduct(slug);

  // Categories come as {productId, categoryId, category: {...}} from the API
  const firstCat = product?.categories?.[0]?.category ?? product?.categories?.[0];
  const breadcrumbs = [
    { label: 'Каталог', href: '/catalog' },
    ...(firstCat?.name
      ? [
          {
            label: firstCat.name,
            href: `/catalog?categorySlug=${firstCat.slug}`,
          },
        ]
      : []),
    { label: product?.title ?? slug },
  ];

  return (
    <>
      {product && <JsonLd data={buildProductSchema(product)} />}
      <JsonLd data={buildBreadcrumbSchema(breadcrumbs)} />
      <ProductClient params={Promise.resolve({ region, slug })} />
    </>
  );
}
