const API_BASE_URL = 'http://localhost:4000/api';

export interface ExchangeRateResponse {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  lastUpdated: string;
}

export interface BulkExchangeRateResponse {
  baseCurrency: string;
  rates: Record<string, number>;
  lastUpdated: string;
}

export interface ConvertedPrice {
  originalAmount: number;
  convertedAmount: number;
  rate: number;
  fromCurrency: string;
  toCurrency: string;
}

class CurrencyService {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_DURATION = 15 * 60 * 1000; // Increased to 15 minutes for better performance

  private getCacheKey(endpoint: string, params: Record<string, string>): string {
    const paramString = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');
    const cacheKey = `${endpoint}?${paramString}`;
    console.log(`🔑 [CurrencyService] Generated cache key: ${cacheKey}`);
    return cacheKey;
  }

  private isValidCache(timestamp: number): boolean {
    const age = Date.now() - timestamp;
    const isValid = age < this.CACHE_DURATION;
    console.log(`⏰ [CurrencyService] Cache age: ${age}ms, Valid: ${isValid} (Duration: ${this.CACHE_DURATION}ms)`);
    return isValid;
  }

  private async fetchWithCache<T>(
    endpoint: string,
    params: Record<string, string> = {}
  ): Promise<T> {
    const cacheKey = this.getCacheKey(endpoint, params);
    const cached = this.cache.get(cacheKey);

    console.log(`🔍 [CurrencyService] Checking cache for: ${cacheKey}`);
    console.log(`📊 [CurrencyService] Cache size: ${this.cache.size} entries`);

    if (cached && this.isValidCache(cached.timestamp)) {
      console.log(`✅ [CurrencyService] Cache hit for: ${cacheKey}`);
      console.log(`📊 [CurrencyService] Cached data:`, cached.data);
      return cached.data;
    }

    console.log(`❌ [CurrencyService] Cache miss for: ${cacheKey}`);

    const queryString = Object.keys(params)
      .map(key => `${key}=${encodeURIComponent(params[key])}`)
      .join('&');
    
    const url = `${API_BASE_URL}${endpoint}${queryString ? `?${queryString}` : ''}`;
    console.log(`🌐 [CurrencyService] Making API request to: ${url}`);

    try {
      const startTime = Date.now();
      const response = await fetch(url);
      const requestTime = Date.now() - startTime;
      
      console.log(`📡 [CurrencyService] API response received in ${requestTime}ms`);
      console.log(`📊 [CurrencyService] Response status: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        console.error(`❌ [CurrencyService] HTTP error! status: ${response.status}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log(`📊 [CurrencyService] Raw API response:`, result);
      
      // Validate response structure
      if (!result || typeof result !== 'object') {
        console.error(`❌ [CurrencyService] Invalid response structure:`, result);
        throw new Error('Invalid response structure');
      }

      if (!result.data) {
        console.error(`❌ [CurrencyService] Missing data field in response:`, result);
        throw new Error('Missing data field in response');
      }

      console.log(`✅ [CurrencyService] Valid response data:`, result.data);
      
      // Cache the result
      this.cache.set(cacheKey, {
        data: result.data,
        timestamp: Date.now(),
      });
      console.log(`💾 [CurrencyService] Cached response for: ${cacheKey}`);

      return result.data;
    } catch (error) {
      console.error(`❌ [CurrencyService] Failed to fetch from ${url}:`, error);
      console.error(`📊 [CurrencyService] Error details:`, error.message);
      console.error(`📊 [CurrencyService] Error stack:`, error.stack);
      throw error;
    }
  }

  /**
   * Get exchange rate between two currencies
   */
  async getExchangeRate(fromCurrency: string, toCurrency: string): Promise<ExchangeRateResponse> {
    console.log(`💱 [CurrencyService] Getting exchange rate: ${fromCurrency} → ${toCurrency}`);
    try {
      const result = await this.fetchWithCache<ExchangeRateResponse>('/exchange-rates', {
        from: fromCurrency.toUpperCase(),
        to: toCurrency.toUpperCase(),
      });
      console.log(`✅ [CurrencyService] Exchange rate result:`, result);
      return result;
    } catch (error) {
      console.error(`❌ [CurrencyService] Failed to get exchange rate ${fromCurrency} → ${toCurrency}:`, error);
      throw error;
    }
  }

  /**
   * Get bulk exchange rates for a base currency
   */
  async getBulkExchangeRates(baseCurrency: string): Promise<BulkExchangeRateResponse> {
    console.log(`📊 [CurrencyService] Getting bulk exchange rates for base: ${baseCurrency}`);
    try {
      const result = await this.fetchWithCache<BulkExchangeRateResponse>('/exchange-rates/bulk', {
        base: baseCurrency.toUpperCase(),
      });
      console.log(`✅ [CurrencyService] Bulk exchange rates result:`, result);
      console.log(`📊 [CurrencyService] Number of rates received: ${result.rates ? Object.keys(result.rates).length : 0}`);
      return result;
    } catch (error) {
      console.error(`❌ [CurrencyService] Failed to get bulk exchange rates for ${baseCurrency}:`, error);
      throw error;
    }
  }

  /**
   * Convert amount between currencies
   */
  async convertCurrency(
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ): Promise<ConvertedPrice> {
    console.log(`🔄 [CurrencyService] Converting ${amount} ${fromCurrency} → ${toCurrency}`);
    try {
      const result = await this.fetchWithCache<ConvertedPrice>('/exchange-rates/convert', {
        amount: amount.toString(),
        from: fromCurrency.toUpperCase(),
        to: toCurrency.toUpperCase(),
      });
      console.log(`✅ [CurrencyService] Conversion result:`, result);
      return result;
    } catch (error) {
      console.error(`❌ [CurrencyService] Failed to convert ${amount} ${fromCurrency} → ${toCurrency}:`, error);
      throw error;
    }
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    const cacheSize = this.cache.size;
    this.cache.clear();
    console.log(`🗑️ [CurrencyService] Cache cleared (${cacheSize} entries removed)`);
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    const stats = {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
    console.log(`📊 [CurrencyService] Cache stats:`, stats);
    return stats;
  }
}

export const currencyService = new CurrencyService();