import { 
  Currency, 
  GlobalRateCache, 
  RateFetchTrigger, 
  RATE_FETCH_CONFIG, 
  PriceItem, 
  BulkConvertedPrice 
} from '../types/currency';

/**
 * Calculateur de devise optimisé pour les calculs côté frontend
 * Réduit les appels API en utilisant un cache global unifié
 */
export class OptimizedCurrencyCalculator {
  private globalCache: GlobalRateCache | null = null;
  private readonly CACHE_KEY = 'bricola_optimized_currency_cache';

  constructor() {
    this.loadCacheFromStorage();
  }

  /**
   * Charge le cache depuis le localStorage
   */
  private loadCacheFromStorage(): void {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (cached) {
        const parsedCache = JSON.parse(cached) as GlobalRateCache;
        // Vérifier si le cache n'est pas expiré
        const now = Date.now();
        const cacheAge = now - parsedCache.timestamp;
        const config = RATE_FETCH_CONFIG[parsedCache.lastFetchTrigger];
        const maxAge = config?.cacheDuration || 30 * 60 * 1000;
        
        if (cacheAge < maxAge) {
          this.globalCache = parsedCache;
        } else {
          this.clearCache();
        }
      }
    } catch (error) {
      this.clearCache();
    }
  }

  /**
   * Sauvegarde le cache dans le localStorage
   */
  private saveCacheToStorage(): void {
    try {
      if (this.globalCache) {
        localStorage.setItem(this.CACHE_KEY, JSON.stringify(this.globalCache));
      }
    } catch (error) {
    }
  }

  /**
   * Met à jour le cache global avec de nouveaux taux
   */
  public updateCache(
    baseCurrency: string, 
    rates: Record<string, number>, 
    trigger: RateFetchTrigger
  ): void {
    const now = Date.now();
    this.globalCache = {
      baseCurrency,
      rates,
      timestamp: now,
      lastFetchTrigger: trigger,
      isStale: false
    };
    
    this.saveCacheToStorage();
  }

  /**
   * Vérifie si le cache est valide selon le déclencheur
   */
  public isCacheValid(trigger?: RateFetchTrigger): boolean {
    if (!this.globalCache) {
      return false;
    }

    const now = Date.now();
    const cacheAge = now - this.globalCache.timestamp;
    const triggerToCheck = trigger || this.globalCache.lastFetchTrigger;
    const config = RATE_FETCH_CONFIG[triggerToCheck];
    const maxAge = config?.cacheDuration || 30 * 60 * 1000;

    const isValid = cacheAge < maxAge && !this.globalCache.isStale;
    

    return isValid;
  }

  /**
   * Obtient l'âge du cache en millisecondes
   */
  public getCacheAge(): number {
    if (!this.globalCache) return Infinity;
    return Date.now() - this.globalCache.timestamp;
  }

  /**
   * Vérifie si les taux sont frais (< 5 minutes pour les pages critiques)
   */
  public isRatesFresh(): boolean {
    if (!this.globalCache) return false;
    const cacheAge = this.getCacheAge();
    return cacheAge < 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Obtient un taux de change depuis le cache
   */
  private getRate(from: string, to: string): number | null {
    if (!this.globalCache || !this.isCacheValid()) {
      return null;
    }

    // Même devise
    if (from === to) return 1;

    // Conversion directe
    const directKey = `${from}_${to}`;
    if (this.globalCache.rates[directKey]) {
      return this.globalCache.rates[directKey];
    }

    // Conversion inverse
    const inverseKey = `${to}_${from}`;
    if (this.globalCache.rates[inverseKey]) {
      return 1 / this.globalCache.rates[inverseKey];
    }

    // Conversion via devise de base
    if (this.globalCache.baseCurrency === from) {
      return this.globalCache.rates[to] || null;
    }

    if (this.globalCache.baseCurrency === to) {
      const baseRate = this.globalCache.rates[from];
      return baseRate ? 1 / baseRate : null;
    }

    // Conversion croisée via devise de base
    const fromToBase = this.globalCache.rates[from];
    const toToBase = this.globalCache.rates[to];
    
    if (fromToBase && toToBase) {
      return toToBase / fromToBase;
    }

    return null;
  }

  /**
   * Calcule un prix instantanément sans appel API
   */
  public calculatePrice(amount: number, from: string, to?: string): number {
    // Validation des entrées
    if (typeof amount !== 'number' || isNaN(amount)) {
      return 0;
    }

    if (!to) {
      return amount;
    }

    // Même devise
    if (from === to) {
      return amount;
    }

    const rate = this.getRate(from, to);
    
    if (rate === null) {
      return amount; // Fallback à la valeur originale
    }

    const result = amount * rate;
    
    return result;
  }

  /**
   * Calcule plusieurs prix en une seule opération (optimisation pour les listes)
   */
  public calculateBulkPrices(prices: PriceItem[], targetCurrency: string): BulkConvertedPrice[] {
    
    return prices.map((price, index) => {
      const converted = this.calculatePrice(price.amount, price.from, targetCurrency);
      const rate = price.from === targetCurrency ? 1 : (converted / price.amount) || 1;
      
      return {
        ...price,
        converted,
        rate,
        to: targetCurrency,
        id: price.id || `bulk_${index}`
      };
    });
  }

  /**
   * Vérifie si une récupération de taux est nécessaire selon le déclencheur
   */
  public shouldFetchRates(trigger: RateFetchTrigger): boolean {
    const config = RATE_FETCH_CONFIG[trigger];
    
    // Vérification de sécurité pour éviter l'erreur TypeError
    if (!config) {
      return true;
    }
    
    if (config.immediate) {
      return true;
    }

    if (!this.globalCache) {
      return true;
    }

    // Vérification des conditions spéciales
    if (
      trigger === RateFetchTrigger.RENT_PAGE_ENTRY ||
      trigger === RateFetchTrigger.SEARCH_PAGE_ENTRY
    ) {
      const cacheAge = this.getCacheAge();
      const shouldFetch = cacheAge > 5 * 60 * 1000; // > 5 minutes
      return shouldFetch;
    }

    // Optimisation pour USER_CURRENCY_CHANGE : utiliser le cache si récent
    if (trigger === RateFetchTrigger.USER_CURRENCY_CHANGE) {
      const cacheAge = this.getCacheAge();
      const shouldFetch = cacheAge > 10 * 60 * 1000; // > 10 minutes
      return shouldFetch;
    }

    return !this.isCacheValid(trigger);
  }

  /**
   * Marque le cache comme périmé
   */
  public markCacheAsStale(): void {
    if (this.globalCache) {
      this.globalCache.isStale = true;
      this.saveCacheToStorage();
    }
  }

  /**
   * Efface le cache
   */
  public clearCache(): void {
    this.globalCache = null;
    localStorage.removeItem(this.CACHE_KEY);
  }

  /**
   * Obtient les informations du cache pour le débogage
   */
  public getCacheInfo(): {
    hasCache: boolean;
    baseCurrency?: string;
    ratesCount?: number;
    ageSeconds?: number;
    isValid?: boolean;
    isStale?: boolean;
    lastTrigger?: RateFetchTrigger;
  } {
    if (!this.globalCache) {
      return { hasCache: false };
    }

    return {
      hasCache: true,
      baseCurrency: this.globalCache.baseCurrency,
      ratesCount: Object.keys(this.globalCache.rates).length,
      ageSeconds: Math.round(this.getCacheAge() / 1000),
      isValid: this.isCacheValid(),
      isStale: this.globalCache.isStale,
      lastTrigger: this.globalCache.lastFetchTrigger
    };
  }
}

// Instance singleton pour l'application
export const optimizedCalculator = new OptimizedCurrencyCalculator();
