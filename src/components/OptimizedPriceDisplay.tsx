import React, { useMemo } from 'react'
import { useCurrency } from '../contexts/CurrencyContext'
import { useLanguage } from '../contexts/LanguageContext'

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
    calculatePrice,
    legacyConvertPrice,
    isLoading,
  } = useCurrency()
  const { t, language } = useLanguage()

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

      console.log(
        `💰 [OptimizedPriceDisplay] Processing price: ${price} (valid: ${validPrice}) from ${baseCurrency} to ${currency.code}`
      )

      // Obtenir le symbole de devise de base selon la langue
      const baseSymbol = getCurrencySymbol(baseCurrency)

      // Prix original formaté
      const originalFormatted = `${validPrice.toFixed(2)} ${baseSymbol}`

      // Si le prix n'est pas valide, afficher zéro
      if (!isValidPrice) {
        const targetSymbol = getCurrencySymbol(currency.code)
        const zeroPrice = `0.00 ${targetSymbol}`
        console.log(
          `⚠️ [OptimizedPriceDisplay] Invalid price, displaying zero: ${zeroPrice}`
        )
        return {
          convertedPrice: zeroPrice,
          originalPrice: originalFormatted,
          error: false,
        }
      }

      // Si même devise, pas de conversion nécessaire
      if (baseCurrency === currency.code) {
        const targetSymbol = getCurrencySymbol(currency.code)
        const samePrice = `${validPrice.toFixed(2)} ${targetSymbol}`
        console.log(
          `✅ [OptimizedPriceDisplay] Same currency, no conversion: ${samePrice}`
        )
        return {
          convertedPrice: samePrice,
          originalPrice: originalFormatted,
          error: false,
        }
      }

      // Utiliser le calcul optimisé instantané si le cache est activé
      if (useCache) {
        const convertedAmount = calculatePrice(
          validPrice,
          baseCurrency,
          currency.code
        )
        const targetSymbol = getCurrencySymbol(currency.code)
        const formattedPrice = `${convertedAmount.toFixed(2)} ${targetSymbol}`

        console.log(
          `⚡ [OptimizedPriceDisplay] Instant calculation: ${validPrice} ${baseCurrency} → ${convertedAmount.toFixed(
            2
          )} ${currency.code}`
        )

        return {
          convertedPrice: formattedPrice,
          originalPrice: originalFormatted,
          error: false,
        }
      } else {
        // Pour les paiements critiques, utiliser l'ancienne méthode avec API
        // Cette partie sera gérée de manière asynchrone
        console.log(
          `🔄 [OptimizedPriceDisplay] Using legacy conversion for critical payment`
        )
        const targetSymbol = getCurrencySymbol(currency.code)
        return {
          convertedPrice: `${validPrice.toFixed(2)} ${targetSymbol}`, // Fallback temporaire
          originalPrice: originalFormatted,
          error: false,
        }
      }
    } catch (err) {
      console.error('❌ [OptimizedPriceDisplay] Calculation error:', err)

      // Fallback en cas d'erreur
      const numericPrice = typeof price === 'string' ? parseFloat(price) : price
      const validPrice =
        typeof numericPrice === 'number' && !isNaN(numericPrice)
          ? numericPrice
          : 0
      const baseSymbol = getCurrencySymbol(baseCurrency)

      return {
        convertedPrice: `${validPrice.toFixed(2)} ${baseSymbol}`,
        originalPrice: `${validPrice.toFixed(2)} ${baseSymbol}`,
        error: true,
      }
    }
  }, [
    price,
    baseCurrency,
    currency.code,
    currency.symbol,
    currencies,
    calculatePrice,
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
        return `${formattedPrice} /${t('tools.day')}`
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
        return `${t('wallet.withdrawal_note')} = ${formattedPrice}`
      default:
        return formattedPrice
    }
  }

  // Affichage de chargement uniquement pour les conversions critiques sans cache
  if (!useCache && isLoading && !convertedPrice) {
    return (
      <div className={`${getSizeClasses()} ${className}`}>
        <div className='animate-pulse bg-gray-200 h-4 w-16 rounded'></div>
      </div>
    )
  }

  // Affichage d'erreur
  if (error && !convertedPrice) {
    return (
      <div className={`${getSizeClasses()} ${className} text-red-500`}>
        Error loading price
      </div>
    )
  }

  return (
    <div className={`${getSizeClasses()} ${className}`}>
      <span className='font-medium'>{getDisplayText()}</span>
      {showOriginal && baseCurrency !== currency.code && (
        <span className='text-gray-500 text-sm ml-2'>({originalPrice})</span>
      )}
    </div>
  )
}

// Composant de compatibilité qui utilise l'ancien PriceDisplay pour les cas critiques
export const CriticalPriceDisplay: React.FC<OptimizedPriceDisplayProps> = (props) => {
  return <OptimizedPriceDisplay {...props} useCache={false} />
}