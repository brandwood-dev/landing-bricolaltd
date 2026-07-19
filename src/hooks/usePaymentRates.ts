import { useState, useCallback } from 'react';
import { useCurrency } from '../contexts/CurrencyContext';
import { 
  RateFetchTrigger, 
  UsePaymentRatesReturn
} from '../types/currency';
import { optimizedCalculator } from '../utils/OptimizedCurrencyCalculator';

/**
 * Hook spécialisé pour les taux de change des paiements
 * Garantit des taux frais (< 1 minute) pour les transactions critiques
 */
export const usePaymentRates = (): UsePaymentRatesReturn => {
  const { refreshRates, isLoading } = useCurrency();
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  /**
   * Obtient un taux de change frais pour les paiements
   * Force une récupération si le cache est trop ancien
   */
  const getFreshRate = useCallback(async (
    from: string,
    to: string,
  ): Promise<number | null> => {
    if (from === to) {
      return 1
    }
    
    // Vérifier l'âge du cache
    const cacheAge = optimizedCalculator.getCacheAge();
    const isRateFresh = cacheAge < 1 * 60 * 1000; // < 1 minute
    
    if (!isRateFresh) {
      await refreshRates(RateFetchTrigger.PAYMENT_INITIATION);
      setLastUpdate(new Date());
    }
    
    // Calculer le taux avec le cache frais
    const rate = optimizedCalculator.calculatePriceStrict(1, from, to);
    
    return rate;
  }, [refreshRates]);

  /**
   * Calcule un montant de paiement avec des taux frais
   */
  const calculatePaymentAmount = useCallback(async (
    amount: number, 
    from: string, 
    to: string
  ): Promise<number | null> => {
    
    if (from === to) {
      return amount;
    }
    
    const rate = await getFreshRate(from, to);
    if (rate === null) {
      return null;
    }
    const result = amount * rate;
    
    return result;
  }, [getFreshRate]);

  /**
   * Vérifie si les taux sont suffisamment frais pour les paiements
   */
  const isRateFresh = optimizedCalculator.isRatesFresh();

  return {
    getFreshRate,
    calculatePaymentAmount,
    isRateFresh,
    lastUpdate
  };
};
