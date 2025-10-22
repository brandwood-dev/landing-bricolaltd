import { loadStripe } from '@stripe/stripe-js';

// Configuration Stripe avec la clé publique
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
  throw new Error('VITE_STRIPE_PUBLISHABLE_KEY is not defined in environment variables');
}

// Initialisation de Stripe
export const stripePromise = loadStripe(stripePublishableKey);

// Configuration des options Stripe Elements
export const stripeElementsOptions = {
  appearance: {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#0570de',
      colorBackground: '#ffffff',
      colorText: '#30313d',
      colorDanger: '#df1b41',
      fontFamily: 'Inter, system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '8px',
    },
  },
  locale: 'fr' as const,
};

export default stripePromise;