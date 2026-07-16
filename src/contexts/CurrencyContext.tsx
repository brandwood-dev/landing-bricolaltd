
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Currency, 
  ConvertedPrice, 
  RateFetchTrigger, 
  UseCurrencyOptimizedReturn,
  PriceItem,
  BulkConvertedPrice
} from '../types/currency';
import { optimizedCalculator } from '../utils/OptimizedCurrencyCalculator';
import { useAuth } from './AuthContext';
import { getCurrencyFromCountry } from '../utils/countryToCurrency';

const currencies: Currency[] = [
  { code: 'GBP', symbol: '£', nameKey: 'currency.GBP', flagClass: 'fi fi-gb' },
  { code: 'KWD', symbol: 'د.ك', nameKey: 'currency.KWD', flagClass: 'fi fi-kw' },
  { code: 'SAR', symbol: '﷼', nameKey: 'currency.SAR', flagClass: 'fi fi-sa' },
  { code: 'BHD', symbol: '.د.ب', nameKey: 'currency.BHD', flagClass: 'fi fi-bh' },
  { code: 'OMR', symbol: '﷼', nameKey: 'currency.OMR', flagClass: 'fi fi-om' },
  { code: 'QAR', symbol: '﷼', nameKey: 'currency.QAR', flagClass: 'fi fi-qa' },
  { code: 'AED', symbol: 'د.إ', nameKey: 'currency.AED', flagClass: 'fi fi-ae' },
];

// Interface étendue pour le contexte optimisé
interface OptimizedCurrencyContextType extends UseCurrencyOptimizedReturn {
  currencies: Currency[];
  formatPrice: (price: number, fromCurrency?: string) => string;
  convertPrice: (amount: number, fromCurrency: string, toCurrency?: string) => Promise<ConvertedPrice>;
  // Méthodes de compatibilité avec l'ancien système
  legacyFormatPrice: (price: number, fromCurrency?: string) => Promise<string>;
  legacyConvertPrice: (amount: number, fromCurrency: string, toCurrency?: string) => Promise<ConvertedPrice>;
  // Cache properties for direct access
  exchangeRatesCache: Record<string, number>;
  cacheTimestamp: number;
  // Nouvelles méthodes pour conversion instantanée
  getInstantRate: (fromCurrency: string, toCurrency: string) => number | null;
  convertInstantly: (amount: number, fromCurrency: string, toCurrency: string) => number | null;
  formatInstantPrice: (amount: number, fromCurrency: string, toCurrency?: string) => string;
}

const CurrencyContext = createContext<OptimizedCurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [currency, setCurrency] = useState<Currency>(currencies[0]); // Default to GBP
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasAutoSelected, setHasAutoSelected] = useState<boolean>(false);
  
  // Cache optimisé - durée étendue à 30 minutes
  const [exchangeRatesCache, setExchangeRatesCache] = useState<Record<string, number>>({});
  const [cacheTimestamp, setCacheTimestamp] = useState<number>(0);
  const CACHE_DURATION = 30 * 60 * 1000; // Étendu à 30 minutes pour l'optimisation

  // Auto-select currency based on user's country when logged in
  useEffect(() => {
    if (isAuthenticated && user && !hasAutoSelected) {
      
      // Check if user has manually selected a currency before
      const savedCurrencyCode = localStorage.getItem('selectedCurrency');
      const hasManualSelection = localStorage.getItem('hasManualCurrencySelection') === 'true';
      
      if (!hasManualSelection && user.country) {
        // Auto-select currency based on user's country
        const userCountry = user.country || user.countryId;
        
        if (userCountry) {
          const suggestedCurrencyCode = getCurrencyFromCountry(userCountry);
          
          const suggestedCurrency = currencies.find(c => c.code === suggestedCurrencyCode);
          if (suggestedCurrency && suggestedCurrency.code !== currency.code) {
            setCurrency(suggestedCurrency);
            localStorage.setItem('selectedCurrency', suggestedCurrencyCode);
          } else if (!suggestedCurrency) {
          }
        }
      } else if (savedCurrencyCode) {
        // Use saved manual selection
        const savedCurrency = currencies.find(c => c.code === savedCurrencyCode);
        if (savedCurrency) {
          setCurrency(savedCurrency);
        }
      }
      
      setHasAutoSelected(true);
    }
  }, [isAuthenticated, user, hasAutoSelected, currency.code]);

  // Load saved currency from localStorage on mount (for non-authenticated users)
  useEffect(() => {
    if (!isAuthenticated) {
      const savedCurrencyCode = localStorage.getItem('selectedCurrency');
      if (savedCurrencyCode) {
        const savedCurrency = currencies.find(c => c.code === savedCurrencyCode);
        if (savedCurrency) {
          setCurrency(savedCurrency);
        } else {
        }
      } else {
      }
    }
  }, [isAuthenticated]);

  // Save currency to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('selectedCurrency', currency.code);
  }, [currency]);

  // Fetch bulk exchange rates on mount and when currency changes (optimized)
  useEffect(() => {
    const trigger = RateFetchTrigger.USER_CURRENCY_CHANGE;
    
    // Utiliser le système optimisé pour décider si un fetch est nécessaire
    refreshRates(trigger);
  }, [currency.code]);

  const handleSetCurrency = (newCurrency: Currency) => {
    setCurrency(newCurrency);
    
    // Mark as manual selection to prevent auto-selection on future logins
    localStorage.setItem('hasManualCurrencySelection', 'true');
  };

  const buildConversionResult = (
    amount: number,
    fromCurrency: string,
    toCurrency: string,
    rate: number
  ): ConvertedPrice => ({
    originalAmount: amount,
    convertedAmount: Math.round(amount * rate * 100) / 100,
    rate,
    fromCurrency,
    toCurrency,
  });

  // Nouvelles méthodes pour conversion instantanée
  const getInstantRate = (fromCurrency: string, toCurrency: string): number | null => {
    // Si même devise, retourner 1
    if (fromCurrency === toCurrency) {
      return 1;
    }

    // Vérifier si le cache est valide
    const now = Date.now();
    const cacheAge = now - cacheTimestamp;
    
    if (cacheAge >= CACHE_DURATION || !exchangeRatesCache || Object.keys(exchangeRatesCache).length === 0) {
      return null;
    }

    // Chercher le taux direct
    const directKey = `${fromCurrency}_${toCurrency}`;
    if (exchangeRatesCache[directKey]) {
      return exchangeRatesCache[directKey];
    }

    // Chercher le taux inverse
    const inverseKey = `${toCurrency}_${fromCurrency}`;
    if (exchangeRatesCache[inverseKey]) {
      return 1 / exchangeRatesCache[inverseKey];
    }

    // Si les taux sont basés sur une devise de base (ex: GBP), calculer via la devise de base
    const baseCurrency = 'GBP'; // Devise de base utilisée par l'API
    
    if (fromCurrency === baseCurrency) {
      // De la devise de base vers la devise cible
      return exchangeRatesCache[toCurrency] || null;
    }
    
    if (toCurrency === baseCurrency) {
      // De la devise source vers la devise de base
      const rate = exchangeRatesCache[fromCurrency];
      return rate ? 1 / rate : null;
    }
    
    // Conversion entre deux devises non-base via la devise de base
    const fromToBase = exchangeRatesCache[fromCurrency];
    const toToBase = exchangeRatesCache[toCurrency];
    
    if (fromToBase && toToBase) {
      // Convertir via la devise de base: (1/fromToBase) * toToBase
      return toToBase / fromToBase;
    }

    return null;
  };

  const convertInstantly = (amount: number, fromCurrency: string, toCurrency: string): number | null => {
    if (!amount || amount <= 0) {
      return null;
    }

    const rate = getInstantRate(fromCurrency, toCurrency);
    if (rate === null) {
      return null;
    }

    return amount * rate;
  };

  const formatInstantPrice = (amount: number, fromCurrency: string, toCurrency?: string): string => {
    const targetCurrency = toCurrency || currency.code;
    const targetCurrencyObj = currencies.find(c => c.code === targetCurrency);
    
    if (!targetCurrencyObj) {
      return `${amount.toFixed(2)} ${targetCurrency}`;
    }

    if (fromCurrency === targetCurrency) {
      return `${targetCurrencyObj.symbol}${amount.toFixed(2)}`;
    }

    const convertedAmount = convertInstantly(amount, fromCurrency, targetCurrency);
    
    if (convertedAmount === null) {
      return 'Conversion unavailable';
    }

    return `${targetCurrencyObj.symbol}${convertedAmount.toFixed(2)}`;
  };

  const convertPrice = async (
    amount: number,
    fromCurrency: string,
    toCurrency?: string
  ): Promise<ConvertedPrice> => {
    const targetCurrency = toCurrency || currency.code;

    if (fromCurrency === targetCurrency) {
      return buildConversionResult(amount, fromCurrency, targetCurrency, 1);
    }

    // Main path: only use local table-derived cache. This keeps item rendering
    // off the network and makes `/convert` an explicit legacy-only path.
    const instantRate = getInstantRate(fromCurrency, targetCurrency);
    if (instantRate !== null) {
      return buildConversionResult(
        amount,
        fromCurrency,
        targetCurrency,
        instantRate
      );
    }

    return buildConversionResult(amount, fromCurrency, targetCurrency, 1);
  };

  const legacyConvertPrice = async (
    amount: number,
    fromCurrency: string,
    toCurrency?: string
  ): Promise<ConvertedPrice> => {
    const targetCurrency = toCurrency || currency.code;
    const cachedConversion = await convertPrice(amount, fromCurrency, targetCurrency);

    if (
      fromCurrency === targetCurrency ||
      cachedConversion.rate !== 1 ||
      amount === 0
    ) {
      return cachedConversion;
    }

    setIsLoading(true);
    try {
      const { currencyService } = await import('../services/currencyService');
      return await currencyService.convertCurrency(
        amount,
        fromCurrency,
        targetCurrency
      );
    } catch (error) {
      return cachedConversion;
    } finally {
      setIsLoading(false);
    }
  };

  // Nouvelle méthode optimisée pour le formatage instantané
  const formatPrice = (price: number, fromCurrency?: string): string => {
    const validPrice = typeof price === 'number' && !isNaN(price) ? price : 0;
    
    if (!fromCurrency || fromCurrency === currency.code) {
      return `${currency.symbol}${validPrice.toFixed(2)}`;
    }

    // Utiliser le calculateur optimisé pour un calcul instantané
    const convertedAmount = optimizedCalculator.calculatePrice(validPrice, fromCurrency, currency.code);
    return `${currency.symbol}${convertedAmount.toFixed(2)}`;
  };

  // Méthode de compatibilité avec l'ancien système (async)
  const legacyFormatPrice = async (price: number, fromCurrency?: string): Promise<string> => {
    // Validate price input
    const validPrice = typeof price === 'number' && !isNaN(price) ? price : 0;
    
    
    if (!fromCurrency || fromCurrency === currency.code) {
      const formatted = `${currency.symbol}${validPrice.toFixed(2)}`;
      return formatted;
    }

    try {
      const converted = await legacyConvertPrice(validPrice, fromCurrency);
      const convertedAmount = typeof converted.convertedAmount === 'number' && !isNaN(converted.convertedAmount) 
        ? converted.convertedAmount 
        : 0;
      const formatted = `${currency.symbol}${convertedAmount.toFixed(2)}`;
      return formatted;
    } catch (error) {
      // Fallback to original price with current currency symbol
      const fallback = `${currency.symbol}${validPrice.toFixed(2)}`;
      return fallback;
    }
  };

  // Nouvelles méthodes optimisées
  const calculatePrice = (amount: number, from: string, to?: string): number => {
    return optimizedCalculator.calculatePrice(amount, from, to || currency.code);
  };

  const calculateBulkPrices = (prices: PriceItem[]): BulkConvertedPrice[] => {
    return optimizedCalculator.calculateBulkPrices(prices, currency.code);
  };

  const refreshRates = async (trigger: RateFetchTrigger): Promise<void> => {
    // Vérifier si une récupération est nécessaire
    if (!optimizedCalculator.shouldFetchRates(trigger)) {
      return;
    }

    setIsLoading(true);
    
    try {
      const { currencyService } = await import('../services/currencyService');
      const exchangeRateTable = await currencyService.getExchangeRateTable(
        currency.code
      );
      const rates = exchangeRateTable?.rates;
      
      if (rates && typeof rates === 'object' && Object.keys(rates).length > 0) {
        // Mettre à jour le cache optimisé
        optimizedCalculator.updateCache(currency.code, rates, trigger);
        
        // Maintenir la compatibilité avec l'ancien cache
        setExchangeRatesCache(rates);
        setCacheTimestamp(Date.now());
        
      } else {
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const cacheAge = optimizedCalculator.getCacheAge();
  const isRatesFresh = optimizedCalculator.isRatesFresh();

  // Renommer convertPrice en legacyConvertPrice pour la compatibilité
  return (
    <CurrencyContext.Provider 
      value={{ 
        currency, 
        setCurrency: handleSetCurrency, 
        currencies, 
        formatPrice,
        convertPrice,
        legacyFormatPrice: async (price: number, fromCurrency?: string) => {
          return formatPrice(price, fromCurrency);
        },
        legacyConvertPrice,
        calculatePrice,
        calculateBulkPrices,
        refreshRates,
        isLoading,
        cacheAge,
        isRatesFresh,
        exchangeRatesCache,
        cacheTimestamp,
        // Nouvelles méthodes instantanées
        getInstantRate,
        convertInstantly,
        formatInstantPrice,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
