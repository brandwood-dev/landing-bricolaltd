// Dynamic import for Stripe to avoid build-time resolution issues
const loadStripeLibrary = async () => {
  try {
    const { loadStripe } = await import('@stripe/stripe-js');
    return loadStripe;
  } catch (error) {
    console.error('Failed to load Stripe library:', error);
    throw error;
  }
};

// Configuration Stripe avec la clé publique
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
  console.warn('VITE_STRIPE_PUBLISHABLE_KEY is not defined in environment variables');
}

// Initialisation de Stripe avec gestion d'erreur
export const stripePromise = (async () => {
  try {
    if (!stripePublishableKey) {
      throw new Error('Stripe publishable key is not configured');
    }
    const loadStripe = await loadStripeLibrary();
    return loadStripe(stripePublishableKey);
  } catch (error) {
    console.error('Error initializing Stripe:', error);
    return null;
  }
})();

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