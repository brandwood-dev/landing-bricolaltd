import React, { useState, useEffect } from 'react'
import { useCurrency } from '../contexts/CurrencyContext'
import { useLanguage } from '../contexts/LanguageContext'

interface PriceDisplayProps {
  price: number
  baseCurrency?: string
  className?: string
  showOriginal?: boolean
  size?: 'sm' | 'md' | 'lg'
  cible?: 'basePrice' | 'fees' | 'feesInc' | 'deposit' | 'totalPrice'
}

export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  price,
  baseCurrency = 'GBP',
  className = '',
  showOriginal = false,
  size = 'md',
  cible = 'basePrice',
}) => {
  const { currency, legacyConvertPrice, isLoading, currencies } = useCurrency()
  const { t } = useLanguage()
  const [convertedPrice, setConvertedPrice] = useState<string>('')
  const [originalPrice, setOriginalPrice] = useState<string>('')
  const [error, setError] = useState<boolean>(false)

  useEffect(() => {
    const loadPrice = async () => {
      try {
        setError(false)

        // Convert price to number if it's a string
        const numericPrice =
          typeof price === 'string' ? parseFloat(price) : price

        // Validate price input - check for null, undefined, NaN, or 0

        const isValidPrice =
          typeof numericPrice === 'number' &&
          !isNaN(numericPrice) &&
          numericPrice > 0
        const validPrice = isValidPrice ? numericPrice : 0


        // Get base currency object
        const baseCurrencyObj = currencies.find((c) => c.code === baseCurrency)
        const baseSymbol = baseCurrencyObj?.symbol || baseCurrency

        // Set original price
        setOriginalPrice(`${baseSymbol}${validPrice.toFixed(2)}`)

        // If price is 0, null, undefined, or invalid, display 0 directly without API call
        if (!isValidPrice) {
          const formattedPrice = `${currency.symbol}0.00`
          setConvertedPrice(formattedPrice)
          return
        }

        if (baseCurrency === currency.code) {
          const formattedPrice = `${currency.symbol}${validPrice.toFixed(2)}`
          setConvertedPrice(formattedPrice)
          return
        }

        // Convert price using currency context
        const result = await legacyConvertPrice(
          validPrice,
          baseCurrency,
          currency.code
        )

        const convertedAmount =
          typeof result.convertedAmount === 'number' &&
          !isNaN(result.convertedAmount)
            ? result.convertedAmount
            : 0

        const formattedPrice = `${currency.symbol}${convertedAmount.toFixed(2)}`
        setConvertedPrice(formattedPrice)
      } catch (err) {
        setError(true)
        // Fallback to original price with validation
        const numericPrice =
          typeof price === 'string' ? parseFloat(price) : price
        const validPrice =
          typeof numericPrice === 'number' && !isNaN(numericPrice)
            ? numericPrice
            : 0
        const baseCurrencyObj = currencies.find((c) => c.code === baseCurrency)
        const baseSymbol = baseCurrencyObj?.symbol || baseCurrency
        const fallbackPrice = `${baseSymbol}${validPrice.toFixed(2)}`
        setConvertedPrice(fallbackPrice)
      }
    }

    loadPrice()
  }, [price, baseCurrency, currency.code, legacyConvertPrice, currencies])

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
        return `5.25% + 0.25£ ${t('tools.of')} ${formattedPrice} ${t('tools.charged')}`
      case 'deposit':
        return `${t('tools.deposit')} : ${formattedPrice} ${t(
          'tools.refunded'
        )}`
      case 'totalPrice':
        return formattedPrice
      default:
        return formattedPrice
    }
  }

  if (isLoading && !convertedPrice) {
    return (
      <div className={`${getSizeClasses()} ${className}`}>
        <div className='animate-pulse bg-gray-200 h-4 w-16 rounded'></div>
      </div>
    )
  }

  if (error && !convertedPrice) {
    return (
      <div className={`${getSizeClasses()} ${className} text-red-500`}>
        {t('pricing.load_error')}
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
