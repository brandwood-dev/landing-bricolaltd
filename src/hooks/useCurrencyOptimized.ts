import { useContext } from 'react';
import { useCurrency } from '../contexts/CurrencyContext';
import { 
  RateFetchTrigger, 
  UseCurrencyOptimizedReturn,
  PriceItem,
  BulkConvertedPrice
} from '../types/currency';

/**
 * Hook optimisé pour la gestion des devises
 * Fournit une interface simplifiée pour les calculs instantanés
 */
export const useCurrencyOptimized = (): UseCurrencyOptimizedReturn => {
  const context = useCurrency();
  
  if (context === undefined) {
    throw new Error('useCurrencyOptimized must be used within a CurrencyProvider');
  }

  const {
    currency,
    setCurrency,
    calculatePrice,
    calculateBulkPrices,
    refreshRates,
    isLoading,
    cacheAge,
    isRatesFresh
  } = context;

  return {
    currency,
    setCurrency,
    calculatePrice,
    calculateBulkPrices,
    refreshRates,
    isLoading,
    cacheAge,
    isRatesFresh
  };
};