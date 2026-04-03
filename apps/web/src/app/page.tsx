'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ChevronRight, Zap, Shield, CreditCard } from 'lucide-react';
import { ProductCarousel } from '@/components/product/ProductCarousel';
import { SubscriptionCompare } from '@/components/product/SubscriptionCompare';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MobileMenu } from '@/components/layout/MobileMenu';
import { useHomepageSections } from '@/lib/hooks/useProducts';
import { useCartStore } from '@/lib/store/cartStore';
import { useRegionStore } from '@/lib/store/regionStore';
import { Button } from '@/components/ui/button';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

function HeroBanner() {
  return (
    <section className="relative overflow-hidden min-h-[480px] md:min-h-[560px] flex items-center">
      {/* Background gradient orbs */}
      <div className="absolute inset-0">
        <div className="absolute top-[-20%] left-[10%] w-[500px] h-[500px] rounded-full bg-accent/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[5%] w-[400px] h-[400px] rounded-full bg-accent-hover/15 blur-[100px]" />
        <div className="absolute top-[30%] right-[30%] w-[300px] h-[300px] rounded-full bg-ps-gold/5 blur-[80px]" />
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(#3A3A5C 1px, transparent 1px), linear-gradient(90deg, #3A3A5C 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 max-w-screen-xl mx-auto px-4 sm:px-6 py-16 md:py-20">
        <div className="max-w-2xl">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full border border-accent/40 bg-accent/10 text-accent-hover text-xs font-semibold"
          >
            <Zap size={12} className="text-ps-gold" />
            Официальные коды — мгновенная доставка
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.05, ease: [0.4, 0, 0.2, 1] }}
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] mb-4"
          >
            PlayStation игры
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-hover to-[#00A8FF]">
              дешевле в 3–5 раз
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
            className="text-muted text-lg leading-relaxed mb-8"
          >
            Пополняйте кошелёк PS Store через Турцию, Индию и Украину.
            Коды приходят автоматически на почту.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.15, ease: [0.4, 0, 0.2, 1] }}
            className="flex flex-wrap gap-3"
          >
            <Link href="/catalog">
              <Button size="lg" variant="default" className="shadow-[0_0_32px_rgba(0,112,209,0.4)]">
                Смотреть каталог
                <ChevronRight size={18} />
              </Button>
            </Link>
            <Link href="/how-it-works">
              <Button size="lg" variant="outline">
                Как это работает
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function TrustBar() {
  const items = [
    { icon: Zap, label: 'Автодоставка', desc: 'Код приходит моментально' },
    { icon: Shield, label: 'Официальные коды', desc: 'Только лицензионные карты' },
    { icon: CreditCard, label: 'Оплата СБП', desc: 'Без комиссий и конвертации' },
  ];
  return (
    <section className="border-y border-border bg-card/30">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center flex-shrink-0">
                <Icon size={20} className="text-accent-hover" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{item.label}</p>
                <p className="text-xs text-muted">{item.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function HomepageSections() {
  const { data: sections = [], isLoading } = useHomepageSections();
  const addItem = useCartStore((state) => state.addItem);
  const region = useRegionStore((state) => state.region);

  const [visibleSections, setVisibleSections] = React.useState<Set<number>>(new Set([0, 1]));
  const sectionRefs = React.useRef<(HTMLDivElement | null)[]>([]);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute('data-idx'));
            setVisibleSections((prev) => new Set([...prev, idx, idx + 1, idx + 2]));
          }
        });
      },
      { rootMargin: '200px 0px' },
    );
    sectionRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });
    return () => observer.disconnect();
  }, [sections]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-12 py-12">
        {Array.from({ length: 4 }).map((_, i) => (
          <ProductCarousel key={i} title="Загрузка..." products={[]} isLoading />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-12 py-12">
      {sections.slice(0, 14).map((section, i) => (
        <React.Fragment key={section.category.id}>
          <div
            ref={(el) => { sectionRefs.current[i] = el; }}
            data-idx={String(i)}
          >
            {visibleSections.has(i) ? (
              <ProductCarousel
                title={section.category.name}
                products={section.products}
                viewAllHref={`/catalog?categorySlug=${section.category.slug}`}
                onAddToCart={(id) => {
                  const product = section.products.find((p) => p.id === id);
                  if (product) addItem(product);
                }}
              />
            ) : (
              <ProductCarousel title={section.category.name} products={[]} isLoading />
            )}
          </div>

          {/* PS Plus comparison after section index 1 */}
          {i === 1 && (
            <section className="bg-card/40 rounded-2xl border border-border p-6 md:p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-1">PlayStation Plus</h2>
                <p className="text-muted text-sm">Сравните тарифы и выберите лучший для вас</p>
              </div>
              <SubscriptionCompare region={region} />
              <div className="mt-6">
                <Link href="/catalog?type=SUBSCRIPTION">
                  <Button variant="default" size="md">
                    Купить подписку
                    <ChevronRight size={16} />
                  </Button>
                </Link>
              </div>
            </section>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

function HomePageInner() {
  const [menuOpen, setMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header onMenuOpen={() => setMenuOpen(true)} />
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <main className="flex-1 pt-16">
        <HeroBanner />
        <TrustBar />
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
          <HomepageSections />
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function HomePage() {
  return (
    <QueryClientProvider client={queryClient}>
      <HomePageInner />
    </QueryClientProvider>
  );
}
