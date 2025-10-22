import { useLanguage } from '@/contexts/LanguageContext'

export interface ValidationResult {
  isValid: boolean
  message: string
  count?: number
}

export interface UseValidationReturn {
  validateDescription: (text: string) => ValidationResult
  validateInstructions: (text: string) => ValidationResult
  validatePrice: (price: number) => ValidationResult
  validateDeposit: (deposit: number) => ValidationResult
}

export const useValidation = (): UseValidationReturn => {
  const { t } = useLanguage()
  
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
  
  const validatePrice = (price: number): ValidationResult => {
    const maxValue = 500
    const isValid = price <= maxValue && price >= 0
    return {
      isValid,
      message: isValid ? '' : t('validation.price_max_amount')
    }
  }
  
  const validateDeposit = (deposit: number): ValidationResult => {
    const maxValue = 500
    const isValid = deposit <= maxValue && deposit >= 0
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