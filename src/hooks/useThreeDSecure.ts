import { useState, useCallback, useEffect } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCurrency } from '@/contexts/CurrencyContext';

interface ThreeDSecureHookProps {
  amount: number;
  currency?: string;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
  on3DSChallenge?: (challengeUrl: string) => void;
}

interface ThreeDSecureResult {
  success: boolean;
  requiresAction: boolean;
  clientSecret?: string;
  redirectUrl?: string;
  sessionId?: string;
  error?: string;
  status?: string;
}

interface UseThreeDSecureReturn {
  processing: boolean;
  error: string | null;
  challengeRequired: boolean;
  challengeUrl: string | null;
  initialize3DSecure: (paymentIntentId: string, billingDetails?: any) => Promise<ThreeDSecureResult>;
  complete3DSecureChallenge: (sessionId: string, paymentIntentId: string) => Promise<ThreeDSecureResult>;
  handle3DSRedirect: (redirectUrl: string) => void;
  reset3DSState: () => void;
}

const API_BASE_URL = import.meta.env.VITE_BASE_URL
  ? `${import.meta.env.VITE_BASE_URL}/api`
  : 'http://localhost:4000/api';

export const useThreeDSecure = ({
  amount,
  currency = 'gbp',
  onSuccess,
  onError,
  on3DSChallenge,
}: ThreeDSecureHookProps): UseThreeDSecureReturn => {
  const { t } = useLanguage();
  const { calculatePrice } = useCurrency();
  const stripe = useStripe();
  const elements = useElements();

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [challengeRequired, setChallengeRequired] = useState(false);
  const [challengeUrl, setChallengeUrl] = useState<string | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [currentPaymentIntentId, setCurrentPaymentIntentId] = useState<string | null>(null);

  /**
   * Initialize 3D Secure authentication
   */
  const initialize3DSecure = useCallback(async (
    paymentIntentId: string,
    billingDetails?: any
  ): Promise<ThreeDSecureResult> => {
    if (!stripe || !elements) {
      setError(t('stripe_not_loaded'));
      return { success: false, requiresAction: false, error: t('stripe_not_loaded') };
    }

    setProcessing(true);
    setError(null);

    try {
      // Get authentication token
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        throw new Error(t('authentication_required'));
      }

      // Prepare 3DS initialization data
      const threeDSData = {
        paymentIntentId,
        amount,
        currency,
        billingDetails: billingDetails || {
          name: '',
          email: '',
        },
        deviceInfo: {
          screenResolution: `${window.screen.width}x${window.screen.height}`,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          language: navigator.language,
          colorDepth: window.screen.colorDepth,
          javaEnabled: navigator.javaEnabled(),
          javascriptEnabled: true,
          acceptHeaders: '',
          userAgent: navigator.userAgent,
        },
      };

      // Call API to initialize 3D Secure
      const response = await fetch(`${API_BASE_URL}/3ds/initialize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(threeDSData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || t('payment_failed'));
      }

      // Handle different 3DS scenarios
      if (result.success) {
        if (result.requiresAction) {
          // 3D Secure challenge is required
          setChallengeRequired(true);
          setChallengeUrl(result.redirectUrl || null);
          setCurrentSessionId(result.sessionId);
          setCurrentPaymentIntentId(paymentIntentId);

          if (result.redirectUrl && on3DSChallenge) {
            on3DSChallenge(result.redirectUrl);
          }

          return {
            success: true,
            requiresAction: true,
            redirectUrl: result.redirectUrl,
            sessionId: result.sessionId,
            status: result.status,
          };
        } else {
          // Frictionless flow - payment completed
          setChallengeRequired(false);
          setChallengeUrl(null);
          onSuccess(paymentIntentId);
          
          return {
            success: true,
            requiresAction: false,
            sessionId: result.sessionId,
            status: result.status,
          };
        }
      } else {
        // 3DS initialization failed
        const errorMessage = result.error || t('payment_failed');
        setError(errorMessage);
        onError(errorMessage);
        
        return {
          success: false,
          requiresAction: false,
          error: errorMessage,
          errorCode: result.errorCode,
        };
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('payment_failed');
      setError(errorMessage);
      onError(errorMessage);
      
      return {
        success: false,
        requiresAction: false,
        error: errorMessage,
      };
    } finally {
      setProcessing(false);
    }
  }, [stripe, elements, amount, currency, t, onSuccess, onError, on3DSChallenge]);

  /**
   * Complete 3D Secure challenge
   */
  const complete3DSecureChallenge = useCallback(async (
    sessionId: string,
    paymentIntentId: string
  ): Promise<ThreeDSecureResult> => {
    if (!stripe || !elements) {
      setError(t('stripe_not_loaded'));
      return { success: false, requiresAction: false, error: t('stripe_not_loaded') };
    }

    setProcessing(true);
    setError(null);

    try {
      // Get authentication token
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        throw new Error(t('authentication_required'));
      }

      // Call API to complete 3D Secure challenge
      const response = await fetch(`${API_BASE_URL}/3ds/complete-challenge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          sessionId,
          paymentIntentId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || t('payment_failed'));
      }

      // Handle challenge completion
      if (result.success) {
        setChallengeRequired(false);
        setChallengeUrl(null);
        setCurrentSessionId(null);
        setCurrentPaymentIntentId(null);
        onSuccess(paymentIntentId);
        
        return {
          success: true,
          requiresAction: false,
          sessionId: result.sessionId,
          status: result.status,
        };
      } else {
        // Challenge failed
        const errorMessage = result.error || t('payment_failed');
        setError(errorMessage);
        onError(errorMessage);
        
        return {
          success: false,
          requiresAction: false,
          error: errorMessage,
          errorCode: result.errorCode,
        };
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('payment_failed');
      setError(errorMessage);
      onError(errorMessage);
      
      return {
        success: false,
        requiresAction: false,
        error: errorMessage,
      };
    } finally {
      setProcessing(false);
    }
  }, [stripe, elements, t, onSuccess, onError]);

  /**
   * Handle 3DS redirect (for challenge flow)
   */
  const handle3DSRedirect = useCallback((redirectUrl: string) => {
    setChallengeUrl(redirectUrl);
    setChallengeRequired(true);
    
    // Open redirect URL in new window/tab
    const newWindow = window.open(redirectUrl, '_blank', 'width=600,height=600');
    
    // Monitor the window for completion
    const checkWindow = setInterval(() => {
      if (newWindow?.closed) {
        clearInterval(checkWindow);
        // Window was closed, assume challenge completed
        if (currentSessionId && currentPaymentIntentId) {
          complete3DSecureChallenge(currentSessionId, currentPaymentIntentId);
        }
      }
    }, 1000);

    // Timeout after 10 minutes
    setTimeout(() => {
      clearInterval(checkWindow);
      if (!newWindow?.closed) {
        newWindow?.close();
        setError(t('challenge_timeout'));
        onError(t('challenge_timeout'));
      }
    }, 600000);
  }, [t, onError, currentSessionId, currentPaymentIntentId, complete3DSecureChallenge]);

  /**
   * Reset 3DS state
   */
  const reset3DSState = useCallback(() => {
    setProcessing(false);
    setError(null);
    setChallengeRequired(false);
    setChallengeUrl(null);
    setCurrentSessionId(null);
    setCurrentPaymentIntentId(null);
  }, []);

  /**
   * Handle window message for 3DS completion
   */
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Validate message origin
      if (event.origin !== window.location.origin) {
        return;
      }

      // Handle 3DS completion message
      if (event.data?.type === '3DS_COMPLETE' && event.data?.sessionId) {
        if (currentSessionId && currentPaymentIntentId) {
          complete3DSecureChallenge(currentSessionId, currentPaymentIntentId);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [currentSessionId, currentPaymentIntentId, complete3DSecureChallenge]);

  return {
    processing,
    error,
    challengeRequired,
    challengeUrl,
    initialize3DSecure,
    complete3DSecureChallenge,
    handle3DSRedirect,
    reset3DSState,
  };
};