import React, { createContext, useContext, ReactNode } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise, stripeElementsOptions } from '@/config/stripe';

interface StripeContextType {
  // Contexte pour les fonctionnalités Stripe si nécessaire
}

const StripeContext = createContext<StripeContextType | undefined>(undefined);

interface StripeProviderProps {
  children: ReactNode;
}

export const StripeProvider: React.FC<StripeProviderProps> = ({ children }) => {
  return (
    <Elements stripe={stripePromise} options={stripeElementsOptions}>
      <StripeContext.Provider value={{}}>
        {children}
      </StripeContext.Provider>
    </Elements>
  );
};

export const useStripe = () => {
  const context = useContext(StripeContext);
  if (context === undefined) {
    throw new Error('useStripe must be used within a StripeProvider');
  }
  return context;
};

export default StripeProvider;