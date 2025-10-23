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
  const { currency, convertPrice, isLoading, currencies } = useCurrency()
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
        console.log(`🔍 [PriceDisplay] Debug validation for price:`, {
          originalPrice: price,
          originalPriceType: typeof price,
          numericPrice,
          numericPriceType: typeof numericPrice,
          isNumber: typeof numericPrice === 'number',
          isNaN: isNaN(numericPrice),
          isGreaterThanZero: numericPrice > 0,
          priceValue: numericPrice,
        })

        const isValidPrice =
          typeof numericPrice === 'number' &&
          !isNaN(numericPrice) &&
          numericPrice > 0
        const validPrice = isValidPrice ? numericPrice : 0

        console.log(
          `💰 [PriceDisplay] Loading price: ${price} (numeric: ${numericPrice}, valid: ${validPrice}, isValidPrice: ${isValidPrice}) from ${baseCurrency} to ${currency.code}`
        )

        // Get base currency object
        const baseCurrencyObj = currencies.find((c) => c.code === baseCurrency)
        const baseSymbol = baseCurrencyObj?.symbol || baseCurrency

        // Set original price
        setOriginalPrice(`${baseSymbol}${validPrice.toFixed(2)}`)

        // If price is 0, null, undefined, or invalid, display 0 directly without API call
        if (!isValidPrice) {
          const formattedPrice = `${currency.symbol}0.00`
          console.log(
            `⚠️ [PriceDisplay] Invalid price (${price}), displaying zero without conversion: ${formattedPrice}`
          )
          setConvertedPrice(formattedPrice)
          return
        }

        if (baseCurrency === currency.code) {
          const formattedPrice = `${currency.symbol}${validPrice.toFixed(2)}`
          console.log(
            `✅ [PriceDisplay] Same currency, no conversion: ${formattedPrice}`
          )
          setConvertedPrice(formattedPrice)
          return
        }

        // Convert price using currency context
        const result = await convertPrice(
          validPrice,
          baseCurrency,
          currency.code
        )
        console.log(`📊 [PriceDisplay] Conversion result:`, result)
        console.log(`🔍 [PriceDisplay] Conversion result structure:`, {
          hasConverted: !!result,
          convertedKeys: result ? Object.keys(result) : [],
          convertedAmount: result?.convertedAmount,
          rate: result?.rate,
          hasData: !!(result && result.data),
          dataKeys: result && result.data ? Object.keys(result.data) : [],
          dataConvertedAmount:
            result && result.data ? result.data.convertedAmount : undefined,
          dataRate: result && result.data ? result.data.rate : undefined,
          fullStructure: JSON.stringify(result, null, 2),
        })

        // Try to access the converted amount from different possible structures
        let convertedAmount = 0
        let conversionRate = 1

        if (result) {
          // Check if data is directly in result object
          if (
            typeof result.convertedAmount === 'number' &&
            !isNaN(result.convertedAmount)
          ) {
            convertedAmount = result.convertedAmount
            conversionRate = result.rate || 1
            console.log(
              `✅ [PriceDisplay] Using direct access: amount=${convertedAmount}, rate=${conversionRate}`
            )
          }
          // Check if data is in result.data
          else if (
            result.data &&
            typeof result.data.convertedAmount === 'number' &&
            !isNaN(result.data.convertedAmount)
          ) {
            convertedAmount = result.data.convertedAmount
            conversionRate = result.data.rate || 1
            console.log(
              `✅ [PriceDisplay] Using data access: amount=${convertedAmount}, rate=${conversionRate}`
            )
          }
          // Fallback: try to find any numeric value that could be the converted amount
          else {
            console.warn(
              `⚠️ [PriceDisplay] Could not find convertedAmount in expected locations, trying fallback`
            )
            // Look for any numeric field that could be the converted amount
            const findNumericValue = (
              obj: any,
              path: string = ''
            ): number | null => {
              if (typeof obj === 'number' && !isNaN(obj) && obj > 0) {
                console.log(
                  `🔍 [PriceDisplay] Found numeric value at ${path}: ${obj}`
                )
                return obj
              }
              if (typeof obj === 'object' && obj !== null) {
                for (const [key, value] of Object.entries(obj)) {
                  const result = findNumericValue(value, `${path}.${key}`)
                  if (result !== null) return result
                }
              }
              return null
            }

            const foundAmount = findNumericValue(result, 'result')
            if (foundAmount !== null) {
              convertedAmount = foundAmount
              console.log(
                `🔄 [PriceDisplay] Using fallback amount: ${convertedAmount}`
              )
            }
          }
        }

        const formattedPrice = `${currency.symbol}${convertedAmount.toFixed(2)}`
        console.log(
          `✅ [PriceDisplay] Converted price: ${formattedPrice} (rate: ${conversionRate})`
        )
        setConvertedPrice(formattedPrice)
      } catch (err) {
        console.error('❌ [PriceDisplay] Failed to load price:', err)
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
        console.log(`🔄 [PriceDisplay] Using fallback price: ${fallbackPrice}`)
        setConvertedPrice(fallbackPrice)
      }
    }

    loadPrice()
  }, [price, baseCurrency, currency.code, convertPrice, currencies])

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
