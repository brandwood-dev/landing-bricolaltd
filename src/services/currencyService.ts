const API_BASE_URL = import.meta.env.VITE_BASE_URL
  ? `${import.meta.env.VITE_BASE_URL}`
  : 'http://localhost:4000/api'

export interface ExchangeRateResponse {
  fromCurrency: string
  toCurrency: string
  rate: number
  lastUpdated: string
}

export interface BulkExchangeRateResponse {
  baseCurrency: string
  rates: Record<string, number>
  lastUpdated: string
}

export interface ExchangeRateTableResponse {
  baseCurrency: string
  rates: Record<string, number>
  fetchedAt: string
  freshUntil: string
  staleUntil: string
  stale: boolean
  source: 'provider' | 'database' | 'hardcoded'
}

export interface ConvertedPrice {
  originalAmount: number
  convertedAmount: number
  rate: number
  fromCurrency: string
  toCurrency: string
}

export interface CurrencyRequestStats {
  cacheHits: number
  cacheMisses: number
  networkCallsTotal: number
  networkCallsByEndpoint: Record<string, number>
  requestDurationsMsByEndpoint: Record<string, number>
  lastRequestAt: string | null
}

class CurrencyService {
  private cache = new Map<string, { data: any; timestamp: number }>()
  private readonly CACHE_DURATION = 15 * 60 * 1000
  private readonly REQUEST_STATS_KEY = 'bricola_currency_request_stats'
  private requestStats: CurrencyRequestStats

  constructor() {
    this.requestStats = this.loadRequestStats()
  }

  private getDefaultRequestStats(): CurrencyRequestStats {
    return {
      cacheHits: 0,
      cacheMisses: 0,
      networkCallsTotal: 0,
      networkCallsByEndpoint: {
        '/exchange-rates/table': 0,
        '/exchange-rates/bulk': 0,
        '/exchange-rates/convert': 0,
        '/exchange-rates': 0,
      },
      requestDurationsMsByEndpoint: {
        '/exchange-rates/table': 0,
        '/exchange-rates/bulk': 0,
        '/exchange-rates/convert': 0,
        '/exchange-rates': 0,
      },
      lastRequestAt: null,
    }
  }

  private loadRequestStats(): CurrencyRequestStats {
    if (typeof window === 'undefined') {
      return this.getDefaultRequestStats()
    }

    try {
      const rawStats = window.localStorage.getItem(this.REQUEST_STATS_KEY)
      if (!rawStats) {
        return this.getDefaultRequestStats()
      }

      const parsedStats = JSON.parse(rawStats) as Partial<CurrencyRequestStats>
      const defaultStats = this.getDefaultRequestStats()

      return {
        ...defaultStats,
        ...parsedStats,
        networkCallsByEndpoint: {
          ...defaultStats.networkCallsByEndpoint,
          ...(parsedStats.networkCallsByEndpoint || {}),
        },
        requestDurationsMsByEndpoint: {
          ...defaultStats.requestDurationsMsByEndpoint,
          ...(parsedStats.requestDurationsMsByEndpoint || {}),
        },
      }
    } catch (error) {
      return this.getDefaultRequestStats()
    }
  }

  private persistRequestStats(): void {
    if (typeof window === 'undefined') {
      return
    }

    try {
      window.localStorage.setItem(
        this.REQUEST_STATS_KEY,
        JSON.stringify(this.requestStats)
      )
    } catch (error) {
      // Ignore storage failures and keep runtime stats only.
    }
  }

  private recordCacheHit(): void {
    this.requestStats.cacheHits++
    this.persistRequestStats()
  }

  private recordCacheMiss(): void {
    this.requestStats.cacheMisses++
    this.persistRequestStats()
  }

  private recordNetworkCall(endpoint: string, durationMs: number): void {
    this.requestStats.networkCallsTotal++
    this.requestStats.networkCallsByEndpoint[endpoint] =
      (this.requestStats.networkCallsByEndpoint[endpoint] || 0) + 1
    this.requestStats.requestDurationsMsByEndpoint[endpoint] =
      (this.requestStats.requestDurationsMsByEndpoint[endpoint] || 0) +
      durationMs
    this.requestStats.lastRequestAt = new Date().toISOString()
    this.persistRequestStats()
  }

  private getCacheKey(
    endpoint: string,
    params: Record<string, string>
  ): string {
    const paramString = Object.keys(params)
      .sort()
      .map((key) => `${key}=${params[key]}`)
      .join('&')

    return `${endpoint}?${paramString}`
  }

  private isValidCache(timestamp: number): boolean {
    return Date.now() - timestamp < this.CACHE_DURATION
  }

  private async fetchWithCache<T>(
    endpoint: string,
    params: Record<string, string> = {}
  ): Promise<T> {
    const cacheKey = this.getCacheKey(endpoint, params)
    const cached = this.cache.get(cacheKey)

    if (cached && this.isValidCache(cached.timestamp)) {
      this.recordCacheHit()
      return cached.data
    }

    this.recordCacheMiss()

    const queryString = Object.keys(params)
      .map((key) => `${key}=${encodeURIComponent(params[key])}`)
      .join('&')

    const url = `${API_BASE_URL}${endpoint}${
      queryString ? `?${queryString}` : ''
    }`

    try {
      const startTime = Date.now()
      const response = await fetch(url)
      const requestTime = Date.now() - startTime
      this.recordNetworkCall(endpoint, requestTime)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (!result || typeof result !== 'object') {
        throw new Error('Invalid response structure')
      }

      if (!result.data) {
        throw new Error('Missing data field in response')
      }

      this.cache.set(cacheKey, {
        data: result.data,
        timestamp: Date.now(),
      })

      return result.data
    } catch (error) {
      throw error
    }
  }

  async getExchangeRate(
    fromCurrency: string,
    toCurrency: string
  ): Promise<ExchangeRateResponse> {
    return this.fetchWithCache<ExchangeRateResponse>('/exchange-rates', {
      from: fromCurrency.toUpperCase(),
      to: toCurrency.toUpperCase(),
    })
  }

  async getExchangeRateTable(
    baseCurrency: string
  ): Promise<ExchangeRateTableResponse> {
    return this.fetchWithCache<ExchangeRateTableResponse>(
      '/exchange-rates/table',
      {
        base: baseCurrency.toUpperCase(),
      }
    )
  }

  async getBulkExchangeRates(
    baseCurrency: string
  ): Promise<BulkExchangeRateResponse> {
    return this.fetchWithCache<BulkExchangeRateResponse>(
      '/exchange-rates/bulk',
      {
        base: baseCurrency.toUpperCase(),
      }
    )
  }

  async convertCurrency(
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ): Promise<ConvertedPrice> {
    return this.fetchWithCache<ConvertedPrice>('/exchange-rates/convert', {
      amount: amount.toString(),
      from: fromCurrency.toUpperCase(),
      to: toCurrency.toUpperCase(),
    })
  }

  clearCache(): void {
    this.cache.clear()
  }

  clearRequestStats(): void {
    this.requestStats = this.getDefaultRequestStats()

    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(this.REQUEST_STATS_KEY)
    }
  }

  getCacheStats(): {
    size: number
    keys: string[]
    requestStats: CurrencyRequestStats
  } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      requestStats: { ...this.requestStats },
    }
  }

  getRequestStats(): CurrencyRequestStats {
    return { ...this.requestStats }
  }
}

export const currencyService = new CurrencyService()
