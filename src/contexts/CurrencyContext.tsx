
import React, { createContext, useContext, useState } from 'react';

interface Currency {
  code: string;
  symbol: string;
  name: string;
  flag: string;
}

const currencies: Currency[] = [
  { code: 'KWD', symbol: 'د.ك', name: 'Kuwaiti Dinar', flag: '<span class="fi fi-kw"></span>' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal', flag: '<span class="fi fi-sa"></span>' },
  { code: 'BHD', symbol: '.د.ب', name: 'Bahraini Dinar', flag: '<span class="fi fi-bh"></span>' },
  { code: 'OMR', symbol: '﷼', name: 'Omani Rial', flag: '<span class="fi fi-om"></span>' },
  { code: 'QAR', symbol: '﷼', name: 'Qatari Riyal', flag: '<span class="fi fi-qa"></span>' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', flag: '<span class="fi fi-ae"></span>' },
];

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  currencies: Currency[];
  formatPrice: (price: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrency] = useState<Currency>(currencies[0]); // Default to GBP

  const formatPrice = (price: number): string => {
    return `${price.toFixed(2)}${currency.symbol}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, currencies, formatPrice }}>
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
