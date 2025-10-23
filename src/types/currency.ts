// Types pour le système optimisé de conversion de devise

export interface Currency {
  code: string;
  symbol: string;
  nameKey: string;
  flagClass: string;
}

export interface ConvertedPrice {
  originalAmount: number;
  convertedAmount: number;
  rate: number;
  fromCurrency: string;
  toCurrency: string;
}

export interface PriceItem {
  amount: number;
  from: string;
  id?: string;
}

export interface BulkConvertedPrice extends PriceItem {
  converted: number;
  rate: number;
  to: string;
}

// Énumération des déclencheurs de récupération des taux
export enum RateFetchTrigger {
  USER_CURRENCY_CHANGE = 'user_currency_change',
  RENT_PAGE_ENTRY = 'rent_page_entry',
  PAYMENT_INITIATION = 'payment_initiation',
  APP_INITIALIZATION = 'app_initialization',
  CACHE_EXPIRATION = 'cache_expiration'
}

// Interface pour le cache global unifié
export interface GlobalRateCache {
  baseCurrency: string;
  rates: Record<string, number>;
  timestamp: number;
  lastFetchTrigger: RateFetchTrigger;
  isStale: boolean;
}

// Configuration des déclencheurs
export interface RateFetchConfig {
  immediate: boolean;
  cacheDuration: number;
  condition?: string;
  priority?: 'low' | 'medium' | 'high';
}

export const RATE_FETCH_CONFIG: Record<RateFetchTrigger, RateFetchConfig> = {
  [RateFetchTrigger.USER_CURRENCY_CHANGE]: {
    immediate: true,
    cacheDuration: 30 * 60 * 1000 // 30 minutes
  },
  [RateFetchTrigger.RENT_PAGE_ENTRY]: {
    immediate: false,
    condition: 'cache_age > 5min',
    cacheDuration: 30 * 60 * 1000
  },
  [RateFetchTrigger.PAYMENT_INITIATION]: {
    immediate: true,
    cacheDuration: 1 * 60 * 1000, // 1 minute pour précision
    priority: 'high'
  },
  [RateFetchTrigger.APP_INITIALIZATION]: {
    immediate: false,
    cacheDuration: 30 * 60 * 1000
  },
  [RateFetchTrigger.CACHE_EXPIRATION]: {
    immediate: true,
    cacheDuration: 30 * 60 * 1000
  }
};

// Interface pour les hooks optimisés
export interface UseCurrencyOptimizedReturn {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  calculatePrice: (amount: number, from: string, to?: string) => number;
  calculateBulkPrices: (prices: PriceItem[]) => BulkConvertedPrice[];
  refreshRates: (trigger: RateFetchTrigger) => Promise<void>;
  isLoading: boolean;
  cacheAge: number;
  isRatesFresh: boolean;
}

export interface UsePaymentRatesReturn {
  getFreshRate: (from: string, to: string) => Promise<number>;
  calculatePaymentAmount: (amount: number, from: string, to: string) => Promise<number>;
  isRateFresh: boolean;
  lastUpdate: Date;
}