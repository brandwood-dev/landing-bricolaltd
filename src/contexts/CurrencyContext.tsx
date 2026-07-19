import React, { createContext, useContext, useState, useEffect } from 'react'
import {
  Currency,
  ConvertedPrice,
  RateFetchTrigger,
  UseCurrencyOptimizedReturn,
  PriceItem,
  BulkConvertedPrice,
  GlobalRateCache,
} from '../types/currency'
import { optimizedCalculator } from '../utils/OptimizedCurrencyCalculator'
import { useAuth } from './AuthContext'
import { getCurrencyFromCountry } from '../utils/countryToCurrency'

const currencies: Currency[] = [
  { code: 'GBP', symbol: '£', nameKey: 'currency.GBP', flagClass: 'fi fi-gb' },
  {
    code: 'KWD',
    symbol: 'د.ك',
    nameKey: 'currency.KWD',
    flagClass: 'fi fi-kw',
  },
  { code: 'SAR', symbol: '﷼', nameKey: 'currency.SAR', flagClass: 'fi fi-sa' },
  {
    code: 'BHD',
    symbol: '.د.ب',
    nameKey: 'currency.BHD',
    flagClass: 'fi fi-bh',
  },
  { code: 'OMR', symbol: '﷼', nameKey: 'currency.OMR', flagClass: 'fi fi-om' },
  { code: 'QAR', symbol: '﷼', nameKey: 'currency.QAR', flagClass: 'fi fi-qa' },
  {
    code: 'AED',
    symbol: 'د.إ',
    nameKey: 'currency.AED',
    flagClass: 'fi fi-ae',
  },
]

// Interface étendue pour le contexte optimisé
interface OptimizedCurrencyContextType extends UseCurrencyOptimizedReturn {
  currencies: Currency[]
  formatPrice: (price: number, fromCurrency?: string) => string
  convertPrice: (
    amount: number,
    fromCurrency: string,
    toCurrency?: string,
  ) => Promise<ConvertedPrice>
  // Méthodes de compatibilité avec l'ancien système
  legacyFormatPrice: (price: number, fromCurrency?: string) => Promise<string>
  legacyConvertPrice: (
    amount: number,
    fromCurrency: string,
    toCurrency?: string,
  ) => Promise<ConvertedPrice>
  // Cache properties for direct access
  exchangeRatesCache: Record<string, number>
  cacheTimestamp: number
  // Nouvelles méthodes pour conversion instantanée
  getInstantRate: (fromCurrency: string, toCurrency: string) => number | null
  convertInstantly: (
    amount: number,
    fromCurrency: string,
    toCurrency: string,
  ) => number | null
  formatInstantPrice: (
    amount: number,
    fromCurrency: string,
    toCurrency?: string,
  ) => string
}

const CurrencyContext = createContext<OptimizedCurrencyContextType | undefined>(
  undefined,
)

const initialRateSnapshot = optimizedCalculator.getCacheSnapshot()
const DEBUG_SERVER_URL = 'http://127.0.0.1:7777/event'
const DEBUG_SESSION_ID = 'currency-price-error'
const DEBUG_RUN_ID = 'post-fix'

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, isAuthenticated } = useAuth()
  const [currency, setCurrency] = useState<Currency>(currencies[0]) // Default to GBP
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [hasAutoSelected, setHasAutoSelected] = useState<boolean>(false)

  // Cache optimisé - durée étendue à 30 minutes
  const [exchangeRatesCache, setExchangeRatesCache] = useState<
    Record<string, number>
  >(initialRateSnapshot?.rates || {})
  const [cacheTimestamp, setCacheTimestamp] = useState<number>(
    initialRateSnapshot?.timestamp || 0,
  )
  const CACHE_DURATION = 30 * 60 * 1000 // Étendu à 30 minutes pour l'optimisation

  // Auto-select currency based on user's country when logged in
  useEffect(() => {
    // #region debug-point A:provider-auth-autoselect
    fetch(DEBUG_SERVER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: DEBUG_SESSION_ID,
        runId: DEBUG_RUN_ID,
        hypothesisId: 'A',
        location: 'CurrencyContext.tsx:auth-auto-select',
        msg: '[DEBUG] currency auth auto-select effect',
        data: {
          isAuthenticated,
          hasUser: !!user,
          hasAutoSelected,
          currentCurrency: currency.code,
          savedCurrency: localStorage.getItem('selectedCurrency'),
          manualSelection: localStorage.getItem('hasManualCurrencySelection'),
        },
        ts: Date.now(),
      }),
    }).catch(() => {})
    // #endregion
    if (isAuthenticated && user && !hasAutoSelected) {
      // Check if user has manually selected a currency before
      const savedCurrencyCode = localStorage.getItem('selectedCurrency')
      const hasManualSelection =
        localStorage.getItem('hasManualCurrencySelection') === 'true'

      if (!hasManualSelection && user.country) {
        // Auto-select currency based on user's country
        const userCountry = user.country || user.countryId

        if (userCountry) {
          const suggestedCurrencyCode = getCurrencyFromCountry(userCountry)

          const suggestedCurrency = currencies.find(
            (c) => c.code === suggestedCurrencyCode,
          )
          if (suggestedCurrency && suggestedCurrency.code !== currency.code) {
            setCurrency(suggestedCurrency)
            localStorage.setItem('selectedCurrency', suggestedCurrencyCode)
          } else if (!suggestedCurrency) {
          }
        }
      } else if (savedCurrencyCode) {
        // Use saved manual selection
        const savedCurrency = currencies.find(
          (c) => c.code === savedCurrencyCode,
        )
        if (savedCurrency) {
          setCurrency(savedCurrency)
        }
      }

      setHasAutoSelected(true)
    }
  }, [isAuthenticated, user, hasAutoSelected, currency.code])

  // Load saved currency from localStorage on mount (for non-authenticated users)
  useEffect(() => {
    // #region debug-point A:provider-nonauth-autoselect
    fetch(DEBUG_SERVER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: DEBUG_SESSION_ID,
        runId: DEBUG_RUN_ID,
        hypothesisId: 'A',
        location: 'CurrencyContext.tsx:non-auth-init',
        msg: '[DEBUG] currency non-auth init effect',
        data: {
          isAuthenticated,
          savedCurrency: localStorage.getItem('selectedCurrency'),
        },
        ts: Date.now(),
      }),
    }).catch(() => {})
    // #endregion
    if (!isAuthenticated) {
      const savedCurrencyCode = localStorage.getItem('selectedCurrency')
      if (savedCurrencyCode) {
        const savedCurrency = currencies.find(
          (c) => c.code === savedCurrencyCode,
        )
        if (savedCurrency) {
          setCurrency(savedCurrency)
        } else {
        }
      } else {
      }
    }
  }, [isAuthenticated])

  // Save currency to localStorage when it changes
  useEffect(() => {
    // #region debug-point A:provider-currency-persist
    fetch(DEBUG_SERVER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: DEBUG_SESSION_ID,
        runId: DEBUG_RUN_ID,
        hypothesisId: 'A',
        location: 'CurrencyContext.tsx:persist-currency',
        msg: '[DEBUG] currency persisted',
        data: { currency: currency.code },
        ts: Date.now(),
      }),
    }).catch(() => {})
    // #endregion
    localStorage.setItem('selectedCurrency', currency.code)
  }, [currency])

  // Fetch bulk exchange rates on mount and when currency changes (optimized)
  useEffect(() => {
    const trigger = RateFetchTrigger.USER_CURRENCY_CHANGE
    // #region debug-point A:provider-refresh-effect
    fetch(DEBUG_SERVER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: DEBUG_SESSION_ID,
        runId: DEBUG_RUN_ID,
        hypothesisId: 'A',
        location: 'CurrencyContext.tsx:refresh-effect',
        msg: '[DEBUG] currency refresh effect fired',
        data: { currency: currency.code, trigger },
        ts: Date.now(),
      }),
    }).catch(() => {})
    // #endregion

    // Utiliser le système optimisé pour décider si un fetch est nécessaire
    refreshRates(trigger)
  }, [currency.code])

  const handleSetCurrency = (newCurrency: Currency) => {
    // #region debug-point A:provider-set-currency
    fetch(DEBUG_SERVER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: DEBUG_SESSION_ID,
        runId: DEBUG_RUN_ID,
        hypothesisId: 'A',
        location: 'CurrencyContext.tsx:set-currency',
        msg: '[DEBUG] setCurrency requested',
        data: { from: currency.code, to: newCurrency.code },
        ts: Date.now(),
      }),
    }).catch(() => {})
    // #endregion
    setCurrency(newCurrency)

    // Mark as manual selection to prevent auto-selection on future logins
    localStorage.setItem('hasManualCurrencySelection', 'true')
  }

  const syncLegacyCacheState = (cacheSnapshot: GlobalRateCache | null) => {
    setExchangeRatesCache(cacheSnapshot?.rates || {})
    setCacheTimestamp(cacheSnapshot?.timestamp || 0)
  }

  const buildConversionResult = (
    amount: number,
    fromCurrency: string,
    toCurrency: string,
    rate: number,
  ): ConvertedPrice => ({
    originalAmount: amount,
    convertedAmount: Math.round(amount * rate * 100) / 100,
    rate,
    fromCurrency,
    toCurrency,
  })

  const getCurrencyPlaceholder = (currencyCode: string): string => {
    const currencyObj = currencies.find((item) => item.code === currencyCode)
    return `${currencyObj?.symbol || currencyCode}--`
  }

  // Nouvelles méthodes pour conversion instantanée
  const getInstantRate = (
    fromCurrency: string,
    toCurrency: string,
  ): number | null => {
    return optimizedCalculator.getCachedRate(
      fromCurrency.toUpperCase(),
      toCurrency.toUpperCase(),
    )
  }

  const convertInstantly = (
    amount: number,
    fromCurrency: string,
    toCurrency: string,
  ): number | null => {
    if (!amount || amount <= 0) {
      return null
    }

    const rate = getInstantRate(fromCurrency, toCurrency)
    if (rate === null) {
      return null
    }

    return amount * rate
  }

  const formatInstantPrice = (
    amount: number,
    fromCurrency: string,
    toCurrency?: string,
  ): string => {
    const targetCurrency = toCurrency || currency.code
    const targetCurrencyObj = currencies.find((c) => c.code === targetCurrency)

    if (!targetCurrencyObj) {
      return `${amount.toFixed(2)} ${targetCurrency}`
    }

    if (fromCurrency === targetCurrency) {
      return `${targetCurrencyObj.symbol}${amount.toFixed(2)}`
    }

    const convertedAmount = convertInstantly(
      amount,
      fromCurrency,
      targetCurrency,
    )

    if (convertedAmount === null) {
      return getCurrencyPlaceholder(targetCurrency)
    }

    return `${targetCurrencyObj.symbol}${convertedAmount.toFixed(2)}`
  }

  const convertPrice = async (
    amount: number,
    fromCurrency: string,
    toCurrency?: string,
  ): Promise<ConvertedPrice> => {
    const targetCurrency = toCurrency || currency.code
    const normalizedFromCurrency = fromCurrency.toUpperCase()
    const normalizedTargetCurrency = targetCurrency.toUpperCase()

    if (normalizedFromCurrency === normalizedTargetCurrency) {
      return buildConversionResult(
        amount,
        normalizedFromCurrency,
        normalizedTargetCurrency,
        1,
      )
    }

    // Main path: only use local table-derived cache. This keeps item rendering
    // off the network and makes `/convert` an explicit legacy-only path.
    const instantRate = getInstantRate(
      normalizedFromCurrency,
      normalizedTargetCurrency,
    )
    if (instantRate !== null) {
      return buildConversionResult(
        amount,
        normalizedFromCurrency,
        normalizedTargetCurrency,
        instantRate,
      )
    }

    return buildConversionResult(
      amount,
      normalizedFromCurrency,
      normalizedTargetCurrency,
      0,
    )
  }

  const legacyConvertPrice = async (
    amount: number,
    fromCurrency: string,
    toCurrency?: string,
  ): Promise<ConvertedPrice> => {
    const targetCurrency = toCurrency || currency.code
    const cachedConversion = await convertPrice(
      amount,
      fromCurrency,
      targetCurrency,
    )

    if (
      fromCurrency === targetCurrency ||
      cachedConversion.rate > 0 ||
      amount === 0
    ) {
      return cachedConversion
    }

    setIsLoading(true)
    try {
      const { currencyService } = await import('../services/currencyService')
      return await currencyService.convertCurrency(
        amount,
        fromCurrency,
        targetCurrency,
      )
    } catch (error) {
      return cachedConversion
    } finally {
      setIsLoading(false)
    }
  }

  // Nouvelle méthode optimisée pour le formatage instantané
  const formatPrice = (price: number, fromCurrency?: string): string => {
    const validPrice = typeof price === 'number' && !isNaN(price) ? price : 0

    if (!fromCurrency || fromCurrency === currency.code) {
      return `${currency.symbol}${validPrice.toFixed(2)}`
    }

    const instantRate = getInstantRate(fromCurrency, currency.code)
    if (instantRate === null) {
      return getCurrencyPlaceholder(currency.code)
    }

    const convertedAmount = validPrice * instantRate
    return `${currency.symbol}${convertedAmount.toFixed(2)}`
  }

  // Méthode de compatibilité avec l'ancien système (async)
  const legacyFormatPrice = async (
    price: number,
    fromCurrency?: string,
  ): Promise<string> => {
    // Validate price input
    const validPrice = typeof price === 'number' && !isNaN(price) ? price : 0

    if (!fromCurrency || fromCurrency === currency.code) {
      const formatted = `${currency.symbol}${validPrice.toFixed(2)}`
      return formatted
    }

    try {
      const converted = await legacyConvertPrice(validPrice, fromCurrency)
      const convertedAmount =
        typeof converted.convertedAmount === 'number' &&
        !isNaN(converted.convertedAmount)
          ? converted.convertedAmount
          : 0
      const formatted = `${currency.symbol}${convertedAmount.toFixed(2)}`
      return formatted
    } catch (error) {
      return getCurrencyPlaceholder(currency.code)
    }
  }

  // Nouvelles méthodes optimisées
  const calculatePrice = (
    amount: number,
    from: string,
    to?: string,
  ): number => {
    return optimizedCalculator.calculatePrice(amount, from, to || currency.code)
  }

  const calculateBulkPrices = (prices: PriceItem[]): BulkConvertedPrice[] => {
    return optimizedCalculator.calculateBulkPrices(prices, currency.code)
  }

  const refreshRates = async (trigger: RateFetchTrigger): Promise<void> => {
    const currentSnapshot = optimizedCalculator.getCacheSnapshot()
    const shouldFetch = optimizedCalculator.shouldFetchRatesForBase(
      trigger,
      currency.code,
    )

    // #region debug-point A:provider-refresh-start
    fetch(DEBUG_SERVER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: DEBUG_SESSION_ID,
        runId: DEBUG_RUN_ID,
        hypothesisId: 'A',
        location: 'CurrencyContext.tsx:refresh-start',
        msg: '[DEBUG] refreshRates start',
        data: {
          currency: currency.code,
          trigger,
          shouldFetch,
          cacheBase: currentSnapshot?.baseCurrency || null,
          cacheRateCount: currentSnapshot
            ? Object.keys(currentSnapshot.rates || {}).length
            : 0,
          cacheTimestamp: currentSnapshot?.timestamp || null,
        },
        ts: Date.now(),
      }),
    }).catch(() => {})
    // #endregion

    if (
      currentSnapshot &&
      currentSnapshot.baseCurrency === currency.code &&
      !shouldFetch
    ) {
      syncLegacyCacheState(currentSnapshot)
      return
    }

    // Vérifier si une récupération est nécessaire
    if (!shouldFetch) {
      syncLegacyCacheState(currentSnapshot)
      return
    }

    setIsLoading(true)

    try {
      const { currencyService } = await import('../services/currencyService')
      const exchangeRateTable = await currencyService.getExchangeRateTable(
        currency.code,
      )
      const rawRates = exchangeRateTable?.rates
      const rates =
        rawRates && typeof rawRates === 'object'
          ? Object.fromEntries(
              Object.entries(rawRates).map(([code, value]) => [
                code.toUpperCase(),
                value,
              ]),
            )
          : null

      // #region debug-point C:provider-refresh-response
      fetch(DEBUG_SERVER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: DEBUG_SESSION_ID,
          runId: DEBUG_RUN_ID,
          hypothesisId: 'C',
          location: 'CurrencyContext.tsx:refresh-response',
          msg: '[DEBUG] refreshRates response received',
          data: {
            currency: currency.code,
            source: exchangeRateTable?.source || null,
            baseCurrency: exchangeRateTable?.baseCurrency || null,
            rateCount: rates ? Object.keys(rates).length : 0,
            rateKeys: rates ? Object.keys(rates) : [],
            stale: exchangeRateTable?.stale ?? null,
          },
          ts: Date.now(),
        }),
      }).catch(() => {})
      // #endregion

      if (rates && typeof rates === 'object' && Object.keys(rates).length > 0) {
        // Mettre à jour le cache optimisé
        optimizedCalculator.updateCache(currency.code, rates, trigger)
        syncLegacyCacheState(optimizedCalculator.getCacheSnapshot())
        // #region debug-point A:provider-refresh-cache-updated
        fetch(DEBUG_SERVER_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: DEBUG_SESSION_ID,
            runId: DEBUG_RUN_ID,
            hypothesisId: 'A',
            location: 'CurrencyContext.tsx:refresh-cache-updated',
            msg: '[DEBUG] refreshRates cache updated',
            data: {
              currency: currency.code,
              rateCount: Object.keys(rates).length,
              rateKeys: Object.keys(rates),
            },
            ts: Date.now(),
          }),
        }).catch(() => {})
        // #endregion
      } else {
        // #region debug-point C:provider-refresh-empty-rates
        fetch(DEBUG_SERVER_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: DEBUG_SESSION_ID,
            runId: DEBUG_RUN_ID,
            hypothesisId: 'C',
            location: 'CurrencyContext.tsx:refresh-empty-rates',
            msg: '[DEBUG] refreshRates empty rates',
            data: { currency: currency.code, rawRatesType: typeof rawRates },
            ts: Date.now(),
          }),
        }).catch(() => {})
        // #endregion
      }
    } catch (error) {
      // #region debug-point C:provider-refresh-error
      fetch(DEBUG_SERVER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: DEBUG_SESSION_ID,
          runId: DEBUG_RUN_ID,
          hypothesisId: 'C',
          location: 'CurrencyContext.tsx:refresh-error',
          msg: '[DEBUG] refreshRates error',
          data: {
            currency: currency.code,
            trigger,
            error: error instanceof Error ? error.message : String(error),
          },
          ts: Date.now(),
        }),
      }).catch(() => {})
      // #endregion
    } finally {
      setIsLoading(false)
    }
  }

  const cacheAge = optimizedCalculator.getCacheAge()
  const isRatesFresh = optimizedCalculator.isRatesFresh()

  // Renommer convertPrice en legacyConvertPrice pour la compatibilité
  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency: handleSetCurrency,
        currencies,
        formatPrice,
        convertPrice,
        legacyFormatPrice: async (price: number, fromCurrency?: string) => {
          return formatPrice(price, fromCurrency)
        },
        legacyConvertPrice,
        calculatePrice,
        calculateBulkPrices,
        refreshRates,
        isLoading,
        cacheAge,
        isRatesFresh,
        exchangeRatesCache,
        cacheTimestamp,
        // Nouvelles méthodes instantanées
        getInstantRate,
        convertInstantly,
        formatInstantPrice,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  )
}

export const useCurrency = () => {
  const context = useContext(CurrencyContext)
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider')
  }
  return context
}
