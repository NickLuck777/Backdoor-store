export interface ProductDto {
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  price: number;
  isAvailable: boolean;
  platform?: string | null;
}

export function buildProductSchema(product: ProductDto, _rateToRub?: number) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    ...(product.description ? { description: product.description } : {}),
    ...(product.imageUrl ? { image: product.imageUrl } : {}),
    offers: {
      '@type': 'Offer',
      price: product.price.toString(),
      priceCurrency: 'RUB',
      availability: product.isAvailable
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: { '@type': 'Organization', name: 'Backdoor Store' },
    },
  };
}

export function buildBreadcrumbSchema(items: { label: string; href?: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: `https://backdoor.store${item.href}` } : {}),
    })),
  };
}

export function buildFaqSchema(items: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}

export function buildOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Backdoor Store',
    description: 'Сервис пополнения PS Store — игры PlayStation по ценам Турции и Индии',
    url: 'https://backdoor.store',
    logo: 'https://backdoor.store/logo.png',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'support@backdoor.store',
      availableLanguage: 'Russian',
    },
  };
}
