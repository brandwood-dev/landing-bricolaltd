import React, { useState } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { useCurrency } from '../contexts/CurrencyContext'
import { useLanguage } from '../contexts/LanguageContext'
import type { Currency } from '../contexts/CurrencyContext'

interface CurrencySelectorProps {
  className?: string
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  className = '',
  showLabel = true,
  size = 'md',
}) => {
  const { currency, setCurrency, currencies, isLoading } = useCurrency()
  const { t, language } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)

  const isRTL = language === 'ar'

  const handleCurrencySelect = (selectedCurrency: Currency) => {
    setCurrency(selectedCurrency)
    setIsOpen(false)
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          button: 'px-2 py-1 text-sm',
          dropdown: 'text-sm',
          icon: 'w-4 h-3',
        }
      case 'lg':
        return {
          button: 'px-4 py-3 text-lg',
          dropdown: 'text-base',
          icon: 'w-5 h-5',
        }
      default:
        return {
          button: 'px-3 py-2 text-base',
          dropdown: 'text-sm',
          icon: 'w-4 h-4',
        }
    }
  }

  const sizeClasses = getSizeClasses()

  return (
    <div className={`relative ${className}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {showLabel && (
        <label className='block text-sm font-medium text-gray-700 mb-1'>
          {t('currency.label') || 'Currency'}
        </label>
      )}

      <div className='relative'>
        <button
          type='button'
          onClick={() => setIsOpen(!isOpen)}
          disabled={isLoading}
          className={`
            ${sizeClasses.button}
            w-full bg-white border border-gray-300 rounded-md shadow-sm
            flex items-center justify-between
            hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors duration-200
            ${isRTL ? 'flex-row-reverse' : ''}
          `}
        >
          <div
            className={`flex items-center ${
              isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'
            }`}
          >
            <span className={`${currency.flagClass} text-lg`}></span>
            <span className='text-gray-600'>{currency.code}</span>
          </div>
          <ChevronDown
            className={`${
              sizeClasses.icon
            } text-gray-400 transition-transform duration-200 ${
              isOpen ? 'transform rotate-180' : ''
            }`}
          />
        </button>

        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className='fixed inset-0 z-10'
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown */}
            <div className='absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto'>
              {currencies.map((curr) => (
                <button
                  key={curr.code}
                  type='button'
                  onClick={() => handleCurrencySelect(curr)}
                  className={`
                    w-full px-3 py-2 hover:bg-gray-50 focus:outline-none focus:bg-gray-50
                    flex items-center justify-between
                    ${sizeClasses.dropdown}
                    ${
                      curr.code === currency.code
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-900'
                    }
                    ${isRTL ? 'text-right flex-row-reverse' : 'text-left'}
                  `}
                >
                  <div
                    className={`flex items-center ${
                      isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'
                    }`}
                  >
                    <span className={`${curr.flagClass} text-lg`}></span>
                    <span className='font-medium'>{curr.code}</span>
                  </div>
                  {curr.code === currency.code && (
                    <Check className='w-4 h-4 text-blue-600' />
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {isLoading && (
        <div className='absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center rounded-md'>
          <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600'></div>
        </div>
      )}
    </div>
  )
}
