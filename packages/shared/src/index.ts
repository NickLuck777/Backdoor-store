// Enums
export enum ProductType {
  GAME = 'GAME',
  SUBSCRIPTION = 'SUBSCRIPTION',
  TOPUP_CARD = 'TOPUP_CARD',
  DONATE = 'DONATE',
  ACCOUNT = 'ACCOUNT',
}

export enum Platform {
  PS4 = 'PS4',
  PS5 = 'PS5',
  PS4_PS5 = 'PS4_PS5',
}

export enum Region {
  TURKEY = 'TURKEY',
  INDIA = 'INDIA',
  UKRAINE = 'UKRAINE',
}

export enum Currency {
  TRY = 'TRY',
  INR = 'INR',
  UAH = 'UAH',
}

export enum CodeStatus {
  AVAILABLE = 'AVAILABLE',
  RESERVED = 'RESERVED',
  SOLD = 'SOLD',
  EXPIRED = 'EXPIRED',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  PROCESSING = 'PROCESSING',
  DELIVERED = 'DELIVERED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentMethod {
  SBP = 'SBP',
  CARD = 'CARD',
}

export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  MANAGER = 'MANAGER',
  ADMIN = 'ADMIN',
}

export enum CategoryType {
  GENRE = 'GENRE',
  COLLECTION = 'COLLECTION',
  PUBLISHER = 'PUBLISHER',
  FEATURE = 'FEATURE',
}

// Types
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

export interface CartItem {
  productId: number;
  product: ProductDto;
  quantity: number;
}

export interface SmartCartResult {
  cards: SmartCartCard[];
  totalInRub: number;
  overshoot?: number;
}

export interface SmartCartCard {
  denomination: number;
  currency: Currency;
  quantity: number;
  priceInRub: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export const DENOMINATIONS: Record<Currency, number[]> = {
  [Currency.TRY]: [50, 100, 200, 500, 1000, 2000],
  [Currency.INR]: [500, 1000, 2000, 5000, 10000],
  [Currency.UAH]: [100, 200, 500, 1000, 2000, 5000],
};

export const REGION_CURRENCY: Record<Region, Currency> = {
  [Region.TURKEY]: Currency.TRY,
  [Region.INDIA]: Currency.INR,
  [Region.UKRAINE]: Currency.UAH,
};
