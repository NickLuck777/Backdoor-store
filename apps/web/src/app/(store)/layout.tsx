'use client';

import * as React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MobileMenu } from '@/components/layout/MobileMenu';
import { MiniCart } from '@/components/cart/MiniCart';
import { useCartStore } from '@/lib/store/cartStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function StoreInner({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const isCartOpen = useCartStore((state) => state.isOpen);
  const toggleCart = useCartStore((state) => state.toggleCart);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header onMenuOpen={() => setMenuOpen(true)} />
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <MiniCart isOpen={isCartOpen} onClose={toggleCart} />
      <main className="flex-1 pt-16">
        {children}
      </main>
      <Footer />
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#242444',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            fontSize: '14px',
          },
        }}
      />
    </div>
  );
}

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <StoreInner>{children}</StoreInner>
    </QueryClientProvider>
  );
}
