'use client';

import * as React from 'react';
import Image from 'next/image';
import { use } from 'react';
import { ShoppingCart, Star, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { PriceTag } from '@/components/product/PriceTag';
import { SubscriptionCompare } from '@/components/product/SubscriptionCompare';
import { PlatformBadge, RegionBadge, NewBadge, PreorderBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ProductCardSkeleton } from '@/components/ui/skeleton';
import { useProduct } from '@/lib/hooks/useProducts';
import { useCartStore } from '@/lib/store/cartStore';
import type { Region } from '@/types';
import { cn } from '@/lib/utils';

const REGION_MAP: Record<string, Region> = {
  tr: 'TURKEY',
  in: 'INDIA',
  ua: 'UKRAINE',
};

function ProductPageSkeleton() {
  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-8 md:gap-12">
        <div className="w-full max-w-sm mx-auto lg:mx-0">
          <ProductCardSkeleton />
        </div>
        <div className="flex flex-col gap-4">
          <div className="h-8 w-2/3 bg-[#2A2A4A] rounded-lg animate-pulse" />
          <div className="h-5 w-1/3 bg-[#2A2A4A] rounded-lg animate-pulse" />
          <div className="h-12 w-40 bg-[#2A2A4A] rounded-lg animate-pulse" />
          <div className="h-12 w-full bg-[#2A2A4A] rounded-xl animate-pulse mt-4" />
        </div>
      </div>
    </div>
  );
}

export default function ProductClient({
  params,
}: {
  params: Promise<{ region: string; slug: string }>;
}) {
  const { region: regionCode, slug } = use(params);
  const region = REGION_MAP[regionCode] ?? 'TURKEY';
  const { data: product, isLoading, error } = useProduct(slug);
  const addItem = useCartStore((state) => state.addItem);
  const [adding, setAdding] = React.useState(false);

  const handleAddToCart = () => {
    if (!product || adding) return;
    setAdding(true);
    addItem(product);
    setTimeout(() => setAdding(false), 800);
  };

  if (isLoading) return <ProductPageSkeleton />;

  if (error || !product) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-24 text-center">
        <p className="text-muted text-lg">Товар не найден</p>
      </div>
    );
  }

  const breadcrumbs = [
    { label: 'Каталог', href: '/catalog' },
    ...(product.categories?.[0]
      ? [
          {
            label: product.categories[0].name,
            href: `/catalog?categorySlug=${product.categories[0].slug}`,
          },
        ]
      : []),
    { label: product.title },
  ];

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6">
      <Breadcrumbs items={breadcrumbs} className="mb-6" />

      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-8 md:gap-12">
        {/* Left — cover image */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          className="relative"
        >
          <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-[0_24px_64px_rgba(0,0,0,0.5)] w-full max-w-sm mx-auto lg:mx-0">
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.title}
                fill
                priority
                sizes="(max-width: 1024px) 90vw, 340px"
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-accent via-[#1A1A4E] to-accent-hover">
                <svg viewBox="0 0 100 100" className="w-1/3 opacity-40" fill="white">
                  <path d="M37.4 74.5V18.9l11.5 3.6v48.9l7.7 2.4V24.5c9.7 2.9 17.2 8.1 17.2 18.9 0 11.1-7.7 15.3-17.2 12.3v8.1C70.8 67.4 83 62 83 43.4c0-17.6-12.5-25.4-26.1-29.6l-19.5-6.1v66.8l11.5 3.6-.1-3.6zM25.4 66.5c-9.2-2.7-11.4-8-7.2-11.7 3.8-3.4 10.3-5.9 10.3-5.9V40.5S13 46.2 9.1 58.2c-3.9 12.1 5.1 19.4 16.3 22.5l11.5 3.4V75l-11.5-8.5z" />
                </svg>
              </div>
            )}
          </div>
        </motion.div>

        {/* Right — product info */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08, ease: [0.4, 0, 0.2, 1] }}
          className="flex flex-col gap-5"
        >
          {/* Badges row */}
          <div className="flex flex-wrap gap-2">
            {product.platform && <PlatformBadge platform={product.platform} />}
            <RegionBadge region={product.region} />
            {product.isPreorder && <PreorderBadge />}
            {product.discount == null && product.id % 7 === 0 && <NewBadge />}
          </div>

          {/* Title + edition */}
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
              {product.title}
            </h1>
            {product.edition && (
              <p className="text-muted mt-1 text-base">{product.edition}</p>
            )}
          </div>

          {/* Price */}
          <PriceTag
            price={product.price}
            originalPrice={product.originalPrice}
            discount={product.discount}
            size="lg"
          />

          {/* CTA button */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              size="lg"
              variant="default"
              loading={adding}
              onClick={handleAddToCart}
              disabled={!product.isAvailable}
              className="flex-1 max-w-xs shadow-[0_0_24px_rgba(0,112,209,0.35)]"
            >
              {!adding && <ShoppingCart size={18} />}
              {product.isPreorder
                ? 'Оформить предзаказ'
                : product.isAvailable
                  ? 'Добавить в корзину'
                  : 'Нет в наличии'}
            </Button>
          </div>

          {/* Info pills */}
          <div className="flex flex-wrap gap-3">
            <div className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-card/60 text-sm',
            )}>
              <Package size={14} className="text-muted" />
              <span className="text-muted">Тип:</span>
              <span className="text-foreground font-medium">
                {{ GAME: 'Игра', SUBSCRIPTION: 'Подписка', TOPUP_CARD: 'Пополнение', DONATE: 'Донат', ACCOUNT: 'Аккаунт' }[product.type]}
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-card/60 text-sm">
              <Star size={14} className="text-ps-gold" />
              <span className="text-muted">Автодоставка на email</span>
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div className="mt-2">
              <h2 className="text-sm font-semibold text-foreground mb-2">Описание</h2>
              <p className="text-muted text-sm leading-relaxed">{product.description}</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Subscription compare */}
      {product.type === 'SUBSCRIPTION' && (
        <div className="mt-12 pt-8 border-t border-border">
          <h2 className="text-2xl font-bold text-white mb-6">Сравнение тарифов PS Plus</h2>
          <SubscriptionCompare region={region} />
        </div>
      )}
    </div>
  );
}
