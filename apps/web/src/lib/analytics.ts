// Yandex.Metrika e-commerce tracking

declare global {
  interface Window {
    dataLayer: any[];
    ym?: (id: number, action: string, params?: any) => void;
  }
}

const YM_ID = Number(process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID);

export const analytics = {
  pageView(url: string) {
    if (typeof window !== 'undefined' && window.ym && YM_ID) {
      window.ym(YM_ID, 'hit', url);
    }
  },

  addToCart(product: { id: number; title: string; price: number; region: string }) {
    if (typeof window === 'undefined') return;
    // Yandex.Metrika goal
    if (window.ym && YM_ID) window.ym(YM_ID, 'reachGoal', 'add_to_cart');
    // E-commerce
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      ecommerce: {
        add: {
          products: [{ id: product.id, name: product.title, price: product.price, category: product.region }],
        },
      },
    });
  },

  beginCheckout(totalAmount: number) {
    if (typeof window === 'undefined') return;
    if (window.ym && YM_ID) window.ym(YM_ID, 'reachGoal', 'begin_checkout');
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ ecommerce: { checkout: { actionField: { step: 1 }, products: [{ price: totalAmount }] } } });
  },

  purchase(orderNumber: string, amount: number) {
    if (typeof window === 'undefined') return;
    if (window.ym && YM_ID) window.ym(YM_ID, 'reachGoal', 'purchase');
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ ecommerce: { purchase: { actionField: { id: orderNumber, revenue: amount } } } });
  },
};
