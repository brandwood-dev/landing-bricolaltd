import { useLanguage } from '@/contexts/LanguageContext'
import { useCurrency } from '@/contexts/CurrencyContext'

export interface ValidationResult {
  isValid: boolean
  message: string
  count?: number
}

export interface UseValidationReturn {
  validateDescription: (text: string) => ValidationResult
  validateInstructions: (text: string) => ValidationResult
  validatePrice: (price: number, priceInGBP?: number | null) => ValidationResult
  validateDeposit: (deposit: number, depositInGBP?: number | null) => ValidationResult
}

export const useValidation = (): UseValidationReturn => {
  const { t } = useLanguage()
  const { currency, convertInstantly } = useCurrency()
  
  const validateDescription = (text: string): ValidationResult => {
    const maxLength = 500
    const isValid = text.length <= maxLength
    return {
      isValid,
      message: isValid ? '' : t('validation.description_max_chars'),
      count: text.length
    }
  }
  
  const validateInstructions = (text: string): ValidationResult => {
    const maxLength = 300
    const isValid = text.length <= maxLength
    return {
      isValid,
      message: isValid ? '' : t('validation.instructions_max_chars'),
      count: text.length
    }
  }
  
  const validatePrice = (price: number, priceInGBP?: number | null): ValidationResult => {
    const maxValue = 500
    
    // Validation du montant en devise locale
    if (price < 0) {
      return {
        isValid: false,
        message: t('validation.price_invalid')
      }
    }
    
    // Validation du montant converti en GBP
    let gbpAmount = priceInGBP
    if (gbpAmount === null || gbpAmount === undefined) {
      // Si pas de conversion fournie, calculer
      gbpAmount = currency.code === 'GBP' ? price : convertInstantly(price, currency.code, 'GBP')
    }
    
    const isValid = gbpAmount <= maxValue && price >= 0
    return {
      isValid,
      message: isValid ? '' : t('validation.price_max_amount')
    }
  }
  
  const validateDeposit = (deposit: number, depositInGBP?: number | null): ValidationResult => {
    const maxValue = 500
    
    // Validation du montant en devise locale
    if (deposit < 0) {
      return {
        isValid: false,
        message: t('validation.deposit_invalid')
      }
    }
    
    // Validation du montant converti en GBP
    let gbpAmount = depositInGBP
    if (gbpAmount === null || gbpAmount === undefined) {
      // Si pas de conversion fournie, calculer
      gbpAmount = currency.code === 'GBP' ? deposit : convertInstantly(deposit, currency.code, 'GBP')
    }
    
    const isValid = gbpAmount <= maxValue && deposit >= 0
    return {
      isValid,
      message: isValid ? '' : t('validation.deposit_max_amount')
    }
  }
  
  return {
    validateDescription,
    validateInstructions,
    validatePrice,
    validateDeposit
  }
}