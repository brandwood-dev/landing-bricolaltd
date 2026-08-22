import React, { useMemo } from 'react'
import { useCurrency } from '../contexts/CurrencyContext'
import { useLanguage } from '../contexts/LanguageContext'

const DEBUG_SERVER_URL = 'http://127.0.0.1:7777/event'
const DEBUG_SESSION_ID = 'currency-price-error'
const DEBUG_RUN_ID = 'post-fix'

const reportDisplayEvent = (event: {
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

interface OptimizedPriceDisplayProps {
  price: number
  baseCurrency?: string
  className?: string
  showOriginal?: boolean
  size?: 'sm' | 'md' | 'lg'
  cible?: 'basePrice' | 'fees' | 'feesInc' | 'deposit' | 'totalPrice' | 'minPrice'
  useCache?: boolean // true par défaut, false pour paiements critiques
}

/**
 * Composant PriceDisplay optimisé utilisant les calculs frontend instantanés
 * Réduit drastiquement les appels API en utilisant le cache optimisé
 */
export const OptimizedPriceDisplay: React.FC<OptimizedPriceDisplayProps> = ({
  price,
  baseCurrency = 'GBP',
  className = '',
  showOriginal = false,
  size = 'md',
  cible = 'totalPrice',
  useCache = true,
}) => {
  const {
    currency,
    currencies,
    getInstantRate,
    isLoading,
  } = useCurrency()
  const { t, language } = useLanguage()
  const normalizedBaseCurrency = baseCurrency.toUpperCase()

  // #region debug-point B:price-display-input
  reportDisplayEvent({
    hypothesisId: 'B',
    location: 'OptimizedPriceDisplay.tsx:render-input',
    msg: '[DEBUG] price display render input',
    data: {
      price,
      baseCurrency,
      normalizedBaseCurrency,
      targetCurrency: currency.code,
      useCache,
      cible,
      isLoading,
    },
  })
  // #endregion

  // Fonction pour obtenir le symbole de devise selon la langue
  const getCurrencySymbol = (currencyCode: string) => {
    const currencyObj = currencies.find((c) => c.code === currencyCode)

    if (!currencyObj) return currencyCode

    // Pour toutes les langues, utiliser le symbole de devise réel
    // Cela assure une cohérence d'affichage et une meilleure UX
    return currencyObj.symbol
  }

  // Calcul optimisé avec mémoisation
  const { convertedPrice, originalPrice, error } = useMemo(() => {
    try {
      // Validation du prix d'entrée
      const numericPrice = typeof price === 'string' ? parseFloat(price) : price
      const isValidPrice =
        typeof numericPrice === 'number' &&
        !isNaN(numericPrice) &&
        numericPrice > 0
      const validPrice = isValidPrice ? numericPrice : 0

      // Obtenir le symbole de devise de base selon la langue
      const baseSymbol = getCurrencySymbol(normalizedBaseCurrency)

      // Prix original formaté
      const originalFormatted = `${validPrice.toFixed(2)} ${baseSymbol}`

      // Si le prix n'est pas valide, afficher zéro
      if (!isValidPrice) {
        const targetSymbol = getCurrencySymbol(currency.code)
        const zeroPrice = `0.00 ${targetSymbol}`
        return {
          convertedPrice: zeroPrice,
          originalPrice: originalFormatted,
          error: false,
        }
      }

      // Si même devise, pas de conversion nécessaire
      if (normalizedBaseCurrency === currency.code) {
        const targetSymbol = getCurrencySymbol(currency.code)
        const samePrice = `${validPrice.toFixed(2)} ${targetSymbol}`
        return {
          convertedPrice: samePrice,
          originalPrice: originalFormatted,
          error: false,
        }
      }

      // Utiliser le calcul optimisé instantané si le cache est activé
      if (useCache) {
        const instantRate = getInstantRate(normalizedBaseCurrency, currency.code)
        const targetSymbol = getCurrencySymbol(currency.code)

        // #region debug-point B:price-display-rate
        reportDisplayEvent({
          hypothesisId: 'B',
          location: 'OptimizedPriceDisplay.tsx:instant-rate',
          msg: '[DEBUG] price display instant rate lookup',
          data: {
            baseCurrency: normalizedBaseCurrency,
            targetCurrency: currency.code,
            instantRate,
            price: validPrice,
            useCache,
          },
        })
        // #endregion

        if (instantRate === null) {
          return {
            convertedPrice: '',
            originalPrice: originalFormatted,
            error: true,
          }
        }

        const formattedPrice = `${(validPrice * instantRate).toFixed(2)} ${targetSymbol}`

        return {
          convertedPrice: formattedPrice,
          originalPrice: originalFormatted,
          error: false,
        }
      } else {
        return {
          convertedPrice: '',
          originalPrice: originalFormatted,
          error: true,
        }
      }
    } catch (err) {

      // Fallback en cas d'erreur
      return {
        convertedPrice: '',
        originalPrice: '',
        error: true,
      }
    }
  }, [
    price,
    baseCurrency,
    normalizedBaseCurrency,
    currency.code,
    currency.symbol,
    currencies,
    getInstantRate,
    useCache,
    language,
  ])

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-sm'
      case 'lg':
        return 'text-lg font-semibold'
      default:
        return 'text-base'
    }
  }

  const getDisplayText = () => {
    if (!convertedPrice) return ''

    const formattedPrice = convertedPrice

    switch (cible) {
      case 'basePrice':
        return `(${formattedPrice} /${t('tools.day')})`
      case 'fees':
        return `${t('tools.fees_and_taxes')} : ${formattedPrice}`
      case 'feesInc':
        return `6% ${t('tools.of')} ${formattedPrice} ${t('tools.charged')}`
      case 'deposit':
        return `${t('tools.deposit')} : ${formattedPrice} ${t(
          'tools.refunded'
        )}`
      case 'totalPrice':
        return formattedPrice
      case 'minPrice':
        return `${t('wallet.withdrawal_note')} : (${formattedPrice})`
      default:
        return formattedPrice
    }
  }

  // Affichage de chargement uniquement pour les conversions critiques sans cache
  if (isLoading && !convertedPrice) {
    return (
      <div className={`${getSizeClasses()} ${className}`}>
        <div className='animate-pulse bg-gray-200 h-4 w-16 rounded'></div>
      </div>
    )
  }

  // Affichage d'erreur
  if (error && !convertedPrice) {
    // #region debug-point D:price-display-error-state
    reportDisplayEvent({
      hypothesisId: 'D',
      location: 'OptimizedPriceDisplay.tsx:error-state',
      msg: '[DEBUG] price display error state',
      data: {
        price,
        baseCurrency,
        normalizedBaseCurrency,
        targetCurrency: currency.code,
        useCache,
        isLoading,
      },
    })
    // #endregion
    return (
      <div className={`${getSizeClasses()} ${className} text-red-500`}>
        {t('pricing.load_error')}
      </div>
    )
  }

  return (
    <div className={`${getSizeClasses()} ${className}`}>
      <span className='font-medium'>{getDisplayText()}</span>
      {showOriginal && normalizedBaseCurrency !== currency.code && (
        <span className='text-gray-500 text-sm ml-2'>({originalPrice})</span>
      )}
    </div>
  )
}

// Composant de compatibilité qui utilise l'ancien PriceDisplay pour les cas critiques
export const CriticalPriceDisplay: React.FC<OptimizedPriceDisplayProps> = (props) => {
  return <OptimizedPriceDisplay {...props} useCache={false} />
}
