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
  const getFreshRate = useCallback(async (from: string, to: string): Promise<number> => {
    console.log(`💳 [usePaymentRates] Getting fresh rate for payment: ${from} → ${to}`);
    
    // Vérifier l'âge du cache
    const cacheAge = optimizedCalculator.getCacheAge();
    const isRateFresh = cacheAge < 1 * 60 * 1000; // < 1 minute
    
    if (!isRateFresh) {
      console.log(`🔄 [usePaymentRates] Cache too old (${Math.round(cacheAge / 1000)}s), refreshing for payment`);
      await refreshRates(RateFetchTrigger.PAYMENT_INITIATION);
      setLastUpdate(new Date());
    }
    
    // Calculer le taux avec le cache frais
    const rate = optimizedCalculator.calculatePrice(1, from, to);
    console.log(`✅ [usePaymentRates] Fresh rate obtained: ${from} → ${to} = ${rate}`);
    
    return rate;
  }, [refreshRates]);

  /**
   * Calcule un montant de paiement avec des taux frais
   */
  const calculatePaymentAmount = useCallback(async (
    amount: number, 
    from: string, 
    to: string
  ): Promise<number> => {
    console.log(`💰 [usePaymentRates] Calculating payment amount: ${amount} ${from} → ${to}`);
    
    if (from === to) {
      return amount;
    }
    
    const rate = await getFreshRate(from, to);
    const result = amount * rate;
    
    console.log(`✅ [usePaymentRates] Payment amount calculated: ${amount} × ${rate} = ${result}`);
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