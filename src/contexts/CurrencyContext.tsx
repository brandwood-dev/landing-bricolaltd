
import React, { createContext, useContext, useState, useEffect } from 'react';

interface Currency {
  code: string;
  symbol: string;
  nameKey: string; // Changed from 'name' to 'nameKey' for translation
  flagClass: string; // Changed from 'flag' to 'flagClass' for CSS class
}

const currencies: Currency[] = [
  { code: 'GBP', symbol: '£', nameKey: 'currency.GBP', flagClass: 'fi fi-gb' },
  { code: 'KWD', symbol: 'د.ك', nameKey: 'currency.KWD', flagClass: 'fi fi-kw' },
  { code: 'SAR', symbol: '﷼', nameKey: 'currency.SAR', flagClass: 'fi fi-sa' },
  { code: 'BHD', symbol: '.د.ب', nameKey: 'currency.BHD', flagClass: 'fi fi-bh' },
  { code: 'OMR', symbol: '﷼', nameKey: 'currency.OMR', flagClass: 'fi fi-om' },
  { code: 'QAR', symbol: '﷼', nameKey: 'currency.QAR', flagClass: 'fi fi-qa' },
  { code: 'AED', symbol: 'د.إ', nameKey: 'currency.AED', flagClass: 'fi fi-ae' },
];

interface ConvertedPrice {
  originalAmount: number;
  convertedAmount: number;
  rate: number;
  fromCurrency: string;
  toCurrency: string;
}

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  currencies: Currency[];
  formatPrice: (price: number, fromCurrency?: string) => Promise<string>;
  convertPrice: (amount: number, fromCurrency: string, toCurrency?: string) => Promise<ConvertedPrice>;
  isLoading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrency] = useState<Currency>(currencies[0]); // Default to GBP
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [exchangeRatesCache, setExchangeRatesCache] = useState<Record<string, number>>({});
  const [cacheTimestamp, setCacheTimestamp] = useState<number>(0);
  const CACHE_DURATION = 15 * 60 * 1000; // Increased to 15 minutes for better performance

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

  const formatPrice = async (price: number, fromCurrency?: string): Promise<string> => {
    // Validate price input
    const validPrice = typeof price === 'number' && !isNaN(price) ? price : 0;
    
    console.log(`💰 [CurrencyContext] Formatting price: ${price} (valid: ${validPrice}) from ${fromCurrency || 'current'} to ${currency.code}`);
    
    if (!fromCurrency || fromCurrency === currency.code) {
      const formatted = `${currency.symbol}${validPrice.toFixed(2)}`;
      console.log(`✅ [CurrencyContext] No conversion needed: ${formatted}`);
      return formatted;
    }

    try {
      console.log(`🔄 [CurrencyContext] Converting price for formatting`);
      const converted = await convertPrice(validPrice, fromCurrency);
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

  return (
    <CurrencyContext.Provider 
      value={{ 
        currency, 
        setCurrency: handleSetCurrency, 
        currencies, 
        formatPrice, 
        convertPrice,
        isLoading 
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
