import React, { createContext, useContext, ReactNode, lazy, Suspense } from 'react';

// Dynamic imports for Stripe packages to avoid build-time resolution issues
const loadStripeComponents = async () => {
  try {
    const [{ Elements }, stripeConfig] = await Promise.all([
      import('@stripe/react-stripe-js'),
      import('@/config/stripe')
    ]);
    return { Elements, stripePromise: stripeConfig.stripePromise, stripeElementsOptions: stripeConfig.stripeElementsOptions };
  } catch (error) {
    console.error('Failed to load Stripe components:', error);
    throw error;
  }
};

interface StripeContextType {
  // Contexte pour les fonctionnalités Stripe si nécessaire
  isStripeLoaded: boolean;
}

const StripeContext = createContext<StripeContextType | undefined>(undefined);

interface StripeProviderProps {
  children: ReactNode;
}

// Lazy-loaded Stripe Elements wrapper
const LazyStripeElements: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [stripeComponents, setStripeComponents] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    loadStripeComponents()
      .then((components) => {
        setStripeComponents(components);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Error loading Stripe:', err);
        setError('Failed to load Stripe components');
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return <div>Loading payment system...</div>;
  }

  if (error || !stripeComponents) {
    return <div>Payment system unavailable. Please refresh the page.</div>;
  }

  const { Elements, stripePromise, stripeElementsOptions } = stripeComponents;

  return (
    <Elements stripe={stripePromise} options={stripeElementsOptions}>
      {children}
    </Elements>
  );
};

export const StripeProvider: React.FC<StripeProviderProps> = ({ children }) => {
  const [isStripeLoaded, setIsStripeLoaded] = React.useState(false);

  return (
    <StripeContext.Provider value={{ isStripeLoaded }}>
      <Suspense fallback={<div>Loading payment system...</div>}>
        <LazyStripeElements>
          {children}
        </LazyStripeElements>
      </Suspense>
    </StripeContext.Provider>
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