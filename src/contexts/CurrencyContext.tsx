import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react'
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

const reportCtxEvent = (event: {
  hypothesisId: string
  location: string
  msg: string
  data?: Record<string, unknown>
}) => {
  const fullEvent = {
    sessionId: DEBUG_SESSION_ID,
    runId: DEBUG_RUN_ID,
    hypothesisId: event.hypothesisId,
    location: event.location,
    msg: event.msg,
    data: event.data ?? {},
    ts: Date.now(),
  }
  if (typeof window !== 'undefined') {
    // eslint-disable-next-line no-console
    console.log('[CURRENCY DEBUG]', event.location, event.msg, event.data ?? {})
  }
  fetch(DEBUG_SERVER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(fullEvent),
  }).catch(() => {})
}

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
    reportCtxEvent({
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
    })
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
    reportCtxEvent({
      hypothesisId: 'A',
      location: 'CurrencyContext.tsx:non-auth-init',
      msg: '[DEBUG] currency non-auth init effect',
      data: {
        isAuthenticated,
        savedCurrency: localStorage.getItem('selectedCurrency'),
      },
    })
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
    reportCtxEvent({
      hypothesisId: 'A',
      location: 'CurrencyContext.tsx:persist-currency',
      msg: '[DEBUG] currency persisted',
      data: { currency: currency.code },
    })
    // #endregion
    localStorage.setItem('selectedCurrency', currency.code)
  }, [currency])

  // Fetch bulk exchange rates on mount and when currency changes (optimized)
  useEffect(() => {
    const trigger = RateFetchTrigger.USER_CURRENCY_CHANGE
    // #region debug-point A:provider-refresh-effect
    reportCtxEvent({
      hypothesisId: 'A',
      location: 'CurrencyContext.tsx:refresh-effect',
      msg: '[DEBUG] currency refresh effect fired',
      data: { currency: currency.code, trigger },
    })
    // #endregion

    // Utiliser le système optimisé pour décider si un fetch est nécessaire
    refreshRates(trigger)
  }, [currency.code])

  const handleSetCurrency = useCallback(
    (newCurrency: Currency) => {
      // #region debug-point A:provider-set-currency
      reportCtxEvent({
        hypothesisId: 'A',
        location: 'CurrencyContext.tsx:set-currency',
        msg: '[DEBUG] setCurrency requested',
        data: { from: currency.code, to: newCurrency.code },
      })
      // #endregion
      setCurrency(newCurrency)

      // Mark as manual selection to prevent auto-selection on future logins
      localStorage.setItem('hasManualCurrencySelection', 'true')
    },
    [currency.code],
  )

  const syncLegacyCacheState = useCallback(
    (cacheSnapshot: GlobalRateCache | null) => {
      setExchangeRatesCache(cacheSnapshot?.rates || {})
      setCacheTimestamp(cacheSnapshot?.timestamp || 0)
    },
    [],
  )

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
  const getInstantRate = useCallback(
    (fromCurrency: string, toCurrency: string): number | null => {
      return optimizedCalculator.getCachedRate(
        fromCurrency.toUpperCase(),
        toCurrency.toUpperCase(),
      )
    },
    [],
  )

  const convertInstantly = useCallback(
    (
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
    },
    [getInstantRate],
  )

  const formatInstantPrice = useCallback(
    (amount: number, fromCurrency: string, toCurrency?: string): string => {
      const targetCurrency = toCurrency || currency.code
      const targetCurrencyObj = currencies.find(
        (c) => c.code === targetCurrency,
      )

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
    },
    [currency.code, convertInstantly],
  )

  const convertPrice = useCallback(
    async (
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
    },
    [currency.code, getInstantRate],
  )

  const legacyConvertPrice = useCallback(
    async (
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
    },
    [currency.code, convertPrice],
  )

  // Nouvelle méthode optimisée pour le formatage instantané
  const formatPrice = useCallback(
    (price: number, fromCurrency?: string): string => {
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
    },
    [currency.code, currency.symbol, getInstantRate],
  )

  // Méthode de compatibilité avec l'ancien système (async)
  const legacyFormatPrice = useCallback(
    async (price: number, fromCurrency?: string): Promise<string> => {
      return formatPrice(price, fromCurrency)
    },
    [formatPrice],
  )

  // Nouvelles méthodes optimisées
  const calculatePrice = useCallback(
    (amount: number, from: string, to?: string): number => {
      return optimizedCalculator.calculatePrice(
        amount,
        from,
        to || currency.code,
      )
    },
    [currency.code],
  )

  const calculateBulkPrices = useCallback(
    (prices: PriceItem[]): BulkConvertedPrice[] => {
      return optimizedCalculator.calculateBulkPrices(prices, currency.code)
    },
    [currency.code],
  )

  const refreshRates = useCallback(
    async (trigger: RateFetchTrigger): Promise<void> => {
      const currentSnapshot = optimizedCalculator.getCacheSnapshot()
      const shouldFetch = optimizedCalculator.shouldFetchRatesForBase(
        trigger,
        currency.code,
      )

      // #region debug-point A:provider-refresh-start
      reportCtxEvent({
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
      })
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
        reportCtxEvent({
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
        })
        // #endregion

        if (
          rates &&
          typeof rates === 'object' &&
          Object.keys(rates).length > 0
        ) {
          // Mettre à jour le cache optimisé
          optimizedCalculator.updateCache(currency.code, rates, trigger)
          syncLegacyCacheState(optimizedCalculator.getCacheSnapshot())
          // #region debug-point A:provider-refresh-cache-updated
          reportCtxEvent({
            hypothesisId: 'A',
            location: 'CurrencyContext.tsx:refresh-cache-updated',
            msg: '[DEBUG] refreshRates cache updated',
            data: {
              currency: currency.code,
              rateCount: Object.keys(rates).length,
              rateKeys: Object.keys(rates),
            },
          })
          // #endregion
        } else {
          // #region debug-point C:provider-refresh-empty-rates
          reportCtxEvent({
            hypothesisId: 'C',
            location: 'CurrencyContext.tsx:refresh-empty-rates',
            msg: '[DEBUG] refreshRates empty rates',
            data: { currency: currency.code, rawRatesType: typeof rawRates },
          })
          // #endregion
        }
      } catch (error) {
        // #region debug-point C:provider-refresh-error
        reportCtxEvent({
          hypothesisId: 'C',
          location: 'CurrencyContext.tsx:refresh-error',
          msg: '[DEBUG] refreshRates error',
          data: {
            currency: currency.code,
            trigger,
            error: error instanceof Error ? error.message : String(error),
          },
        })
        // #endregion
      } finally {
        setIsLoading(false)
      }
    },
    [currency.code, syncLegacyCacheState],
  )

  const cacheAge = useMemo(
    () => optimizedCalculator.getCacheAge(),
    [cacheTimestamp, exchangeRatesCache],
  )
  const isRatesFresh = useMemo(
    () => optimizedCalculator.isRatesFresh(),
    [cacheTimestamp, exchangeRatesCache],
  )

  // Renommer convertPrice en legacyConvertPrice pour la compatibilité
  const providerValue = useMemo<OptimizedCurrencyContextType>(
    () => ({
      currency,
      setCurrency: handleSetCurrency,
      currencies,
      formatPrice,
      convertPrice,
      legacyFormatPrice,
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
    }),
    [
      currency,
      handleSetCurrency,
      formatPrice,
      convertPrice,
      legacyFormatPrice,
      legacyConvertPrice,
      calculatePrice,
      calculateBulkPrices,
      refreshRates,
      isLoading,
      cacheAge,
      isRatesFresh,
      exchangeRatesCache,
      cacheTimestamp,
      getInstantRate,
      convertInstantly,
      formatInstantPrice,
    ],
  )

  return (
    <CurrencyContext.Provider value={providerValue}>
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
