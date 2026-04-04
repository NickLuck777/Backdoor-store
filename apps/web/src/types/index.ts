export type Region = 'TURKEY' | 'INDIA' | 'UKRAINE';
export type Platform = 'PS4' | 'PS5' | 'PS4_PS5';
export type ProductType = 'GAME' | 'SUBSCRIPTION' | 'TOPUP_CARD' | 'DONATE' | 'ACCOUNT';
export type Currency = 'TRY' | 'INR' | 'UAH';
export type CategoryType = 'GENRE' | 'COLLECTION' | 'PUBLISHER' | 'FEATURE';

export interface ProductDto {
  id: number;
  slug: string;
  title: string;
  description?: string;
  type: ProductType;
  platform?: Platform;
  edition?: string;
  region: Region;
  price: number;
  originalPrice?: number;
  discount?: number;
  imageUrl?: string;
  isPreorder: boolean;
  isAvailable: boolean;
  categories?: CategoryDto[];
}

export interface CategoryDto {
  id: number;
  slug: string;
  name: string;
  type: CategoryType;
  sortOrder: number;
}

export interface HomepageSection {
  id: number;
  name: string;
  slug: string;
  products: ProductDto[];
}

export interface SearchResult {
  products: ProductDto[];
  total: number;
  query: string;
}

export interface CartItem {
  id: string;
  productId: number;
  product: ProductDto;
  quantity: number;
}

export interface SmartCartCard {
  denomination: number;
  currency: Currency;
  quantity: number;
  priceInRub: number;
  totalInRub: number;
}

export interface SmartCartResult {
  cards: SmartCartCard[];
  totalInRub: number;
  overshootInRub: number;
}

export interface FilterState {
  region?: Region;
  types?: ProductType[];
  platforms?: Platform[];
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  hasDiscount?: boolean;
  sortBy?: 'price_asc' | 'price_desc' | 'discount' | 'newest' | 'popular';
  page?: number;
  limit?: number;
}

export interface PSTier {
  name: 'Essential' | 'Extra' | 'Deluxe';
  priceMonthly: number;
  price3Month: number;
  price12Month: number;
  features: string[];
  highlighted?: boolean;
}
