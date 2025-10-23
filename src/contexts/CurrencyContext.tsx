
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
}

const CurrencyContext = createContext<OptimizedCurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrency] = useState<Currency>(currencies[0]); // Default to GBP
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Cache optimisé - durée étendue à 30 minutes
  const [exchangeRatesCache, setExchangeRatesCache] = useState<Record<string, number>>({});
  const [cacheTimestamp, setCacheTimestamp] = useState<number>(0);
  const CACHE_DURATION = 30 * 60 * 1000; // Étendu à 30 minutes pour l'optimisation

  // Load saved currency from localStorage on mount
  useEffect(() => {
    console.log('🏦 [CurrencyContext] Loading saved currency from localStorage');
    const savedCurrencyCode = localStorage.getItem('selectedCurrency');
    if (savedCurrencyCode) {
      console.log(`🔍 [CurrencyContext] Found saved currency: ${savedCurrencyCode}`);
      const savedCurrency = currencies.find(c => c.code === savedCurrencyCode);
      if (savedCurrency) {
        console.log(`✅ [CurrencyContext] Setting currency to: ${savedCurrency.code} (${savedCurrency.symbol})`);
        setCurrency(savedCurrency);
      } else {
        console.warn(`⚠️ [CurrencyContext] Saved currency ${savedCurrencyCode} not found in available currencies`);
      }
    } else {
      console.log('📝 [CurrencyContext] No saved currency found, using default GBP');
    }
  }, []);

  // Save currency to localStorage when it changes
  useEffect(() => {
    console.log(`💾 [CurrencyContext] Saving currency to localStorage: ${currency.code}`);
    localStorage.setItem('selectedCurrency', currency.code);
  }, [currency]);

  // Fetch bulk exchange rates on mount and when currency changes
  useEffect(() => {
    const fetchBulkRates = async () => {
      const now = Date.now();
      const cacheAge = now - cacheTimestamp;
      
      console.log(`🔄 [CurrencyContext] Checking bulk rates cache for ${currency.code}`);
      console.log(`📊 [CurrencyContext] Cache age: ${cacheAge}ms, Duration: ${CACHE_DURATION}ms`);
      console.log(`📊 [CurrencyContext] Cache keys: ${Object.keys(exchangeRatesCache).length}`);
      
      if (cacheAge < CACHE_DURATION && exchangeRatesCache && Object.keys(exchangeRatesCache).length > 0) {
        console.log(`✅ [CurrencyContext] Using cached rates (${Object.keys(exchangeRatesCache).length} rates)`);
        return; // Use cached rates
      }

      console.log(`🌐 [CurrencyContext] Fetching fresh bulk rates for ${currency.code}`);
      setIsLoading(true);
      
      try {
        const { currencyService } = await import('../services/currencyService');
        console.log(`📡 [CurrencyContext] Calling currencyService.getBulkExchangeRates(${currency.code})`);
        
        const bulkRates = await currencyService.getBulkExchangeRates(currency.code);
        console.log(`📊 [CurrencyContext] Bulk rates response:`, bulkRates);
        console.log(`📊 [CurrencyContext] Response structure check:`, {
          hasBulkRates: !!bulkRates,
          hasData: !!(bulkRates && bulkRates.data),
          hasRates: !!(bulkRates && bulkRates.data && bulkRates.data.rates),
          ratesType: bulkRates && bulkRates.data && bulkRates.data.rates ? typeof bulkRates.data.rates : 'undefined',
          ratesKeys: bulkRates && bulkRates.data && bulkRates.data.rates ? Object.keys(bulkRates.data.rates) : []
        });
        
        // Correct structure: response.data.data.rates (API returns {data: {...}, message: "..."})
        const rates = bulkRates && bulkRates.data && bulkRates.data.rates;
        
        if (rates && typeof rates === 'object' && Object.keys(rates).length > 0) {
          console.log(`✅ [CurrencyContext] Valid rates found - Setting cache with ${Object.keys(rates).length} rates`);
          console.log(`📊 [CurrencyContext] Rates:`, rates);
          // Only update cache if rates are different to prevent unnecessary re-renders
          const currentRatesKeys = Object.keys(exchangeRatesCache).sort().join(',');
          const newRatesKeys = Object.keys(rates).sort().join(',');
          
          if (currentRatesKeys !== newRatesKeys || JSON.stringify(exchangeRatesCache) !== JSON.stringify(rates)) {
            setExchangeRatesCache(rates);
            setCacheTimestamp(now);
          } else {
            console.log(`📊 [CurrencyContext] Rates unchanged, skipping cache update`);
            // Still update timestamp to prevent immediate refetch
            setCacheTimestamp(now);
          }
        } else {
          console.warn('⚠️ [CurrencyContext] Invalid bulk rates response structure:');
          console.warn('📊 [CurrencyContext] Expected: response.data.data.rates, Got:', {
            bulkRates,
            dataExists: !!(bulkRates && bulkRates.data),
            ratesExists: !!(bulkRates && bulkRates.data && bulkRates.data.rates),
            actualStructure: bulkRates ? Object.keys(bulkRates) : 'null/undefined'
          });
          // Set empty cache to prevent further API calls for a while
          setExchangeRatesCache({});
          setCacheTimestamp(now);
        }
      } catch (error) {
        console.error('❌ [CurrencyContext] Failed to fetch bulk exchange rates:', error);
        console.error('📊 [CurrencyContext] Error details:', error.message);
        console.error('📊 [CurrencyContext] Error stack:', error.stack);
        // Set empty cache and timestamp to prevent continuous retries
        setExchangeRatesCache({});
        setCacheTimestamp(now);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBulkRates();
  }, [currency.code]);

  const handleSetCurrency = (newCurrency: Currency) => {
    console.log(`🔄 [CurrencyContext] Currency change: ${currency.code} → ${newCurrency.code}`);
    setCurrency(newCurrency);
    
    // Déclencher la récupération optimisée des taux lors du changement de devise
    refreshRates(RateFetchTrigger.USER_CURRENCY_CHANGE);
  };

  const convertPrice = async (
    amount: number,
    fromCurrency: string,
    toCurrency?: string
  ): Promise<ConvertedPrice> => {
    const targetCurrency = toCurrency || currency.code;
    
    console.log(`💱 [CurrencyContext] Converting ${amount} ${fromCurrency} → ${targetCurrency}`);
    
    if (fromCurrency === targetCurrency) {
      console.log(`✅ [CurrencyContext] Same currency, no conversion needed`);
      return {
        originalAmount: amount,
        convertedAmount: amount,
        rate: 1,
        fromCurrency,
        toCurrency: targetCurrency,
      };
    }

    // Try to use cached rates first
    const now = Date.now();
    const cacheAge = now - cacheTimestamp;
    
    console.log(`🔍 [CurrencyContext] Checking cache for conversion (age: ${cacheAge}ms)`);
    
    if (cacheAge < CACHE_DURATION && exchangeRatesCache && Object.keys(exchangeRatesCache).length > 0) {
      const cacheKey = `${fromCurrency}_${targetCurrency}`;
      const reverseCacheKey = `${targetCurrency}_${fromCurrency}`;
      
      console.log(`🔍 [CurrencyContext] Looking for cache keys: ${cacheKey} or ${reverseCacheKey}`);
      
      let rate = exchangeRatesCache[cacheKey];
      if (!rate && exchangeRatesCache[reverseCacheKey]) {
        rate = 1 / exchangeRatesCache[reverseCacheKey];
        console.log(`🔄 [CurrencyContext] Using inverse rate: 1/${exchangeRatesCache[reverseCacheKey]} = ${rate}`);
      }
      
      if (rate) {
        const convertedAmount = amount * rate;
        console.log(`✅ [CurrencyContext] Cache hit: ${amount} × ${rate} = ${convertedAmount}`);
        return {
          originalAmount: amount,
          convertedAmount,
          rate,
          fromCurrency,
          toCurrency: targetCurrency,
        };
      } else {
        console.log(`❌ [CurrencyContext] Cache miss for ${fromCurrency} → ${targetCurrency}`);
        console.log(`📊 [CurrencyContext] Available cache keys:`, Object.keys(exchangeRatesCache));
      }
    }

    // Fallback to API call if no cached rate available
    console.log(`🌐 [CurrencyContext] Falling back to API call for conversion`);
    setIsLoading(true);
    try {
      const { currencyService } = await import('../services/currencyService');
      console.log(`📡 [CurrencyContext] Calling currencyService.convertCurrency(${amount}, ${fromCurrency}, ${targetCurrency})`);
      
      const result = await currencyService.convertCurrency(amount, fromCurrency, targetCurrency);
      console.log(`✅ [CurrencyContext] API conversion result:`, result);
      return result;
    } catch (error) {
      console.error('❌ [CurrencyContext] Failed to convert currency:', error);
      console.error('📊 [CurrencyContext] Error details:', error.message);
      // Fallback to original amount if conversion fails
      const fallbackResult = {
        originalAmount: amount,
        convertedAmount: amount,
        rate: 1,
        fromCurrency,
        toCurrency: targetCurrency,
      };
      console.log(`🔄 [CurrencyContext] Using fallback result:`, fallbackResult);
      return fallbackResult;
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
    
    console.log(`💰 [CurrencyContext] Legacy formatting price: ${price} (valid: ${validPrice}) from ${fromCurrency || 'current'} to ${currency.code}`);
    
    if (!fromCurrency || fromCurrency === currency.code) {
      const formatted = `${currency.symbol}${validPrice.toFixed(2)}`;
      console.log(`✅ [CurrencyContext] No conversion needed: ${formatted}`);
      return formatted;
    }

    try {
      console.log(`🔄 [CurrencyContext] Converting price for formatting`);
      const converted = await legacyConvertPrice(validPrice, fromCurrency);
      const convertedAmount = typeof converted.convertedAmount === 'number' && !isNaN(converted.convertedAmount) 
        ? converted.convertedAmount 
        : 0;
      const formatted = `${currency.symbol}${convertedAmount.toFixed(2)}`;
      console.log(`✅ [CurrencyContext] Formatted converted price: ${formatted} (rate: ${converted.rate})`);
      return formatted;
    } catch (error) {
      console.error('❌ [CurrencyContext] Failed to format price:', error);
      // Fallback to original price with current currency symbol
      const fallback = `${currency.symbol}${validPrice.toFixed(2)}`;
      console.log(`🔄 [CurrencyContext] Using fallback formatting: ${fallback}`);
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
      console.log(`⏭️ [CurrencyContext] Skipping rate fetch for trigger: ${trigger}`);
      return;
    }

    console.log(`🔄 [CurrencyContext] Refreshing rates for trigger: ${trigger}`);
    setIsLoading(true);
    
    try {
      const { currencyService } = await import('../services/currencyService');
      const bulkRates = await currencyService.getBulkExchangeRates(currency.code);
      
      const rates = bulkRates && bulkRates.data && bulkRates.data.rates;
      
      if (rates && typeof rates === 'object' && Object.keys(rates).length > 0) {
        // Mettre à jour le cache optimisé
        optimizedCalculator.updateCache(currency.code, rates, trigger);
        
        // Maintenir la compatibilité avec l'ancien cache
        setExchangeRatesCache(rates);
        setCacheTimestamp(Date.now());
        
        console.log(`✅ [CurrencyContext] Rates refreshed successfully (${Object.keys(rates).length} rates)`);
      } else {
        console.warn('⚠️ [CurrencyContext] Invalid rates response');
      }
    } catch (error) {
      console.error('❌ [CurrencyContext] Failed to refresh rates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const cacheAge = optimizedCalculator.getCacheAge();
  const isRatesFresh = optimizedCalculator.isRatesFresh();

  // Renommer convertPrice en legacyConvertPrice pour la compatibilité
  const legacyConvertPrice = convertPrice;

  return (
    <CurrencyContext.Provider 
      value={{ 
        currency, 
        setCurrency: handleSetCurrency, 
        currencies, 
        formatPrice,
        convertPrice: legacyConvertPrice,
        legacyFormatPrice,
        legacyConvertPrice,
        calculatePrice,
        calculateBulkPrices,
        refreshRates,
        isLoading,
        cacheAge,
        isRatesFresh
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
