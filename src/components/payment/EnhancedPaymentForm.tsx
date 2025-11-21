import React, { useState, useEffect } from 'react'
import {
  useStripe,
  useElements,
  CardElement,
  PaymentRequestButtonElement,
} from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Loader2, 
  CreditCard, 
  AlertCircle, 
  CheckCircle, 
  Shield,
  User,
  Mail,
  MapPin
} from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useCurrency } from '@/contexts/CurrencyContext'
import { OptimizedPriceDisplay } from '@/components/OptimizedPriceDisplay'
import { useThreeDSecure } from '@/hooks/useThreeDSecure'
import ThreeDSChallengeModal from './ThreeDSChallengeModal'

const API_BASE_URL = import.meta.env.VITE_BASE_URL
  ? `${import.meta.env.VITE_BASE_URL}/api`
  : 'http://localhost:4000/api'

interface EnhancedPaymentFormProps {
  amount: number // Montant en GBP (devise de base)
  bookingId?: string
  onPaymentSuccess: (paymentIntentId: string) => void
  onPaymentError: (error: string) => void
  disabled?: boolean
  loading?: boolean
  paymentMethod?: 'card' | 'google_pay' | 'apple_pay'
  requireBillingDetails?: boolean
  show3DSIndicator?: boolean
}

const EnhancedPaymentForm: React.FC<EnhancedPaymentFormProps> = ({
  amount,
  bookingId,
  onPaymentSuccess,
  onPaymentError,
  disabled = false,
  loading = false,
  paymentMethod = 'card',
  requireBillingDetails = true,
  show3DSIndicator = true,
}) => {
  const { t } = useLanguage()
  const { currency, calculatePrice } = useCurrency()
  const stripe = useStripe()
  const elements = useElements()

  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cardComplete, setCardComplete] = useState(false)
  const [paymentRequest, setPaymentRequest] = useState<any>(null)
  const [canMakePayment, setCanMakePayment] = useState(false)
  
  // Billing details state
  const [cardholderName, setCardholderName] = useState('')
  const [cardholderEmail, setCardholderEmail] = useState('')
  const [billingAddress, setBillingAddress] = useState({
    line1: '',
    city: '',
    postalCode: '',
    country: 'GB',
  })
  
  // 3DS state
  const [showBillingForm, setShowBillingForm] = useState(requireBillingDetails)
  const [requires3DS, setRequires3DS] = useState(false)
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null)
  const [show3DSChallenge, setShow3DSChallenge] = useState(false)
  const [challengeUrl, setChallengeUrl] = useState<string | null>(null)
  const [threeDSSessionId, setThreeDSSessionId] = useState<string | null>(null)

  // Initialize 3D Secure hook
  const {
    processing: threeDSProcessing,
    error: threeDSError,
    challengeRequired,
    challengeUrl: threeDSChallengeUrl,
    initialize3DSecure,
    complete3DSecureChallenge,
    reset3DSState,
  } = useThreeDSecure({
    amount,
    currency: 'gbp',
    onPaymentSuccess: (paymentIntentId) => {
      console.log('3DS payment successful:', paymentIntentId)
      setShow3DSChallenge(false)
      setChallengeUrl(null)
      setThreeDSSessionId(null)
      onPaymentSuccess(paymentIntentId)
    },
    onPaymentError: (error) => {
      console.error('3DS payment error:', error)
      setShow3DSChallenge(false)
      setChallengeUrl(null)
      setThreeDSSessionId(null)
      setError(error)
      onPaymentError(error)
    },
    on3DSChallenge: (challengeUrl) => {
      console.log('3DS challenge required:', challengeUrl)
      setChallengeUrl(challengeUrl)
      setShow3DSChallenge(true)
    },
  })

  // Calculer le montant affiché dans la devise sélectionnée
  const displayAmount = calculatePrice(amount, 'GBP', currency)
  const amountInGBP = amount

  // Initialize payment request for Google Pay/Apple Pay
  useEffect(() => {
    if (!stripe || paymentMethod !== 'google_pay' && paymentMethod !== 'apple_pay') {
      return
    }

    const pr = stripe.paymentRequest({
      currency: 'gbp',
      total: {
        label: t('booking_payment'),
        amount: Math.round(amountInGBP * 100),
      },
      requestPayerName: true,
      requestPayerEmail: true,
    })

    pr.canMakePayment().then((result) => {
      if (result) {
        setPaymentRequest(pr)
        setCanMakePayment(true)
      }
    })

    pr.on('paymentmethod', async (ev) => {
      try {
        // Create payment intent
        const authToken = localStorage.getItem('authToken')
        if (!authToken) {
          ev.complete('fail')
          return
        }

        const response = await fetch(`${API_BASE_URL}/payments/intent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            amount: amountInGBP,
            currency: 'GBP',
            bookingId: bookingId,
            metadata: {
              bookingId: bookingId || '',
              source: 'digital_wallet_payment',
              paymentMethod: paymentMethod,
              displayCurrency: currency.code,
              displayAmount: displayAmount,
            },
          }),
        })

        const paymentIntentData = await response.json()

        if (!response.ok) {
          ev.complete('fail')
          return
        }

        const { client_secret, payment_intent_id, requires_3ds } = paymentIntentData.data

        if (requires_3ds) {
          // Handle 3DS for digital wallet
          ev.complete('fail')
          setError(t('digital_wallet_3ds_not_supported'))
          return
        }

        // Confirm payment with digital wallet
        const { error, paymentIntent } = await stripe.confirmCardPayment(
          client_secret,
          { payment_method: ev.paymentMethod.id },
          { handleActions: false }
        )

        if (error) {
          ev.complete('fail')
          setError(error.message || t('payment_failed'))
          onPaymentError(error.message || t('payment_failed'))
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
          ev.complete('success')
          onPaymentSuccess(paymentIntent.id)
        } else {
          ev.complete('success')
          onPaymentSuccess(payment_intent_id)
        }
      } catch (error) {
        ev.complete('fail')
        const errorMessage = error instanceof Error ? error.message : t('payment_failed')
        setError(errorMessage)
        onPaymentError(errorMessage)
      }
    })

    setPaymentRequest(pr)
  }, [stripe, paymentMethod, amountInGBP, bookingId, currency, displayAmount, t, onPaymentSuccess, onPaymentError])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements || processing || disabled || loading) {
      return
    }

    // Validate billing details for 3DS
    if (showBillingForm && (!cardholderName || !cardholderEmail)) {
      setError(t('billing_details_required'))
      return
    }

    setProcessing(true)
    setError(null)

    try {
      // Create payment intent
      const authToken = localStorage.getItem('authToken')
      if (!authToken) {
        setError(t('authentication_required'))
        setProcessing(false)
        return
      }

      const requestBody = {
        amount: amountInGBP,
        currency: 'GBP',
        bookingId: bookingId,
        metadata: {
          bookingId: bookingId || '',
          source: 'booking_payment',
          paymentMethod: 'card',
          displayCurrency: currency.code,
          displayAmount: displayAmount,
          cardholderName: cardholderName,
          cardholderEmail: cardholderEmail,
        },
      }

      console.log('Creating payment intent with 3DS support:', requestBody)

      const response = await fetch(`${API_BASE_URL}/payments/intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(requestBody),
      })

      const paymentIntentData = await response.json()

      if (!response.ok) {
        throw new Error(paymentIntentData.message || t('payment_failed'))
      }

      const { data } = paymentIntentData
      const {
        client_secret: clientSecret,
        payment_intent_id: paymentIntentId,
        requires_3ds: requires3DS,
      } = data || {}

      if (!clientSecret) {
        throw new Error('Client secret not found in API response')
      }

      setPaymentIntentId(paymentIntentId)
      setRequires3DS(requires3DS)

      // Check if 3D Secure is required
      if (requires3DS) {
        console.log('3D Secure required for payment')
        
        // Initialize 3D Secure authentication
        const billingDetails = showBillingForm ? {
          name: cardholderName,
          email: cardholderEmail,
          address: billingAddress,
        } : undefined

        const threeDSResult = await initialize3DSecure(paymentIntentId, billingDetails)
        
        if (threeDSResult.success) {
          if (threeDSResult.requiresAction) {
            // 3DS challenge is being handled by the hook
            console.log('3DS challenge in progress...')
            return // Don't process further, wait for challenge completion
          } else {
            // Frictionless flow completed
            console.log('3DS frictionless flow completed')
            onPaymentSuccess(paymentIntentId)
            return
          }
        } else {
          throw new Error(threeDSResult.error || t('3ds_authentication_failed'))
        }
      }

      // Regular payment flow (no 3DS required)
      const cardElement = elements.getElement(CardElement)
      if (!cardElement) {
        throw new Error(t('card_element_not_found'))
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: cardholderName || 'Customer',
            email: cardholderEmail,
            address: showBillingForm ? {
              line1: billingAddress.line1,
              city: billingAddress.city,
              postal_code: billingAddress.postalCode,
              country: billingAddress.country,
            } : undefined,
          },
        },
      })

      if (error) {
        throw new Error(error.message || t('payment_failed'))
      }

      if (paymentIntent?.status === 'succeeded') {
        onPaymentSuccess(paymentIntent.id)
      } else {
        throw new Error(t('payment_not_completed'))
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('payment_failed')
      setError(errorMessage)
      onPaymentError(errorMessage)
    } finally {
      setProcessing(false)
    }
  }

  const isFormValid =
    stripe && 
    elements && 
    cardComplete && 
    !processing && 
    !loading && 
    !disabled &&
    (!showBillingForm || (cardholderName && cardholderEmail))

  // Handle 3DS challenge completion
  const handleChallengeComplete = (success: boolean) => {
    setShow3DSChallenge(false)
    if (success && threeDSSessionId && paymentIntentId) {
      complete3DSecureChallenge(threeDSSessionId, paymentIntentId)
    }
  }

  // Render different UI based on payment method
  if (paymentMethod === 'google_pay' || paymentMethod === 'apple_pay') {
    return (
      <Card className='w-full max-w-md mx-auto'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            {paymentMethod === 'google_pay' ? (
              <svg className='h-5 w-5' viewBox='0 0 24 24' fill='currentColor'>
                <path d='M12.426 21.996c-.897 0-1.626-.729-1.626-1.626s.729-1.626 1.626-1.626 1.626.729 1.626 1.626-.729 1.626-1.626 1.626zm-6.426-3.252c-.897 0-1.626-.729-1.626-1.626s.729-1.626 1.626-1.626 1.626.729 1.626 1.626-.729 1.626-1.626 1.626zm12.852 0c-.897 0-1.626-.729-1.626-1.626s.729-1.626 1.626-1.626 1.626.729 1.626 1.626-.729 1.626-1.626 1.626z' />
              </svg>
            ) : (
              <svg className='h-5 w-5' viewBox='0 0 24 24' fill='currentColor'>
                <path d='M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z' />
              </svg>
            )}
            {paymentMethod === 'google_pay' ? 'Google Pay' : 'Apple Pay'}
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          {/* Affichage du montant dans la devise sélectionnée avec conversion GBP */}
          <div className='text-center space-y-2'>
            <div className='text-lg font-semibold'>
              {t('total_amount')}: <OptimizedPriceDisplay amount={displayAmount} currency={currency.code} />
            </div>
            <div className='text-sm text-gray-500'>
              {t('original_amount')}: £{amountInGBP.toFixed(2)} GBP
            </div>
          </div>

          {error && (
            <Alert variant='destructive'>
              <AlertCircle className='h-4 w-4' />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {canMakePayment ? (
            <PaymentRequestButtonElement
              options={{ paymentRequest }}
              className='PaymentRequestButton'
            />
          ) : (
            <div className='text-center text-gray-500'>
              <p>{t('digital_wallet_not_available')}</p>
            </div>
          )}

          <div className='text-xs text-gray-500 text-center'>
            <p>{t('digital_wallet_security')}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Card payment form with 3DS support
  return (
    <>
      <Card className='w-full max-w-md mx-auto'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <CreditCard className='h-5 w-5' />
            {t('card_payment')}
            {show3DSIndicator && (
              <div className='ml-auto flex items-center gap-1 text-xs text-green-600'>
                <Shield className='h-3 w-3' />
                {t('3ds_secure')}
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-6'>
          {/* Amount Display */}
          <div className='text-center space-y-2'>
            <div className='text-lg font-semibold'>
              {t('total_amount')}: <OptimizedPriceDisplay amount={displayAmount} currency={currency.code} />
            </div>
            <div className='text-sm text-gray-500'>
              {t('original_amount')}: £{amountInGBP.toFixed(2)} GBP
            </div>
          </div>

          {error && (
            <Alert variant='destructive'>
              <AlertCircle className='h-4 w-4' />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Billing Details Toggle */}
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <Label className='text-sm font-medium'>
                {t('billing_details')}
              </Label>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => setShowBillingForm(!showBillingForm)}
                className='text-xs'
              >
                {showBillingForm ? t('hide') : t('show')}
              </Button>
            </div>

            {showBillingForm && (
              <div className='space-y-4 p-4 border rounded-lg bg-gray-50'>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <Label htmlFor='cardholderName' className='flex items-center gap-1'>
                      <User className='h-3 w-3' />
                      {t('cardholder_name')}
                    </Label>
                    <Input
                      id='cardholderName'
                      type='text'
                      value={cardholderName}
                      onChange={(e) => setCardholderName(e.target.value)}
                      placeholder={t('enter_cardholder_name')}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor='cardholderEmail' className='flex items-center gap-1'>
                      <Mail className='h-3 w-3' />
                      {t('email')}
                    </Label>
                    <Input
                      id='cardholderEmail'
                      type='email'
                      value={cardholderEmail}
                      onChange={(e) => setCardholderEmail(e.target.value)}
                      placeholder={t('enter_email')}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor='billingAddress' className='flex items-center gap-1'>
                    <MapPin className='h-3 w-3' />
                    {t('billing_address')}
                  </Label>
                  <div className='space-y-2'>
                    <Input
                      id='billingAddressLine1'
                      type='text'
                      value={billingAddress.line1}
                      onChange={(e) => setBillingAddress(prev => ({ ...prev, line1: e.target.value }))}
                      placeholder={t('address_line_1')}
                    />
                    <div className='grid grid-cols-3 gap-2'>
                      <Input
                        type='text'
                        value={billingAddress.city}
                        onChange={(e) => setBillingAddress(prev => ({ ...prev, city: e.target.value }))}
                        placeholder={t('city')}
                      />
                      <Input
                        type='text'
                        value={billingAddress.postalCode}
                        onChange={(e) => setBillingAddress(prev => ({ ...prev, postalCode: e.target.value }))}
                        placeholder={t('postal_code')}
                      />
                      <Input
                        type='text'
                        value={billingAddress.country}
                        onChange={(e) => setBillingAddress(prev => ({ ...prev, country: e.target.value }))}
                        placeholder={t('country')}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Card Element */}
          <div className='space-y-2'>
            <Label>{t('card_details')}</Label>
            <div className='p-3 border rounded-lg bg-white'>
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#424770',
                      '::placeholder': {
                        color: '#aab7c4',
                      },
                    },
                    invalid: {
                      color: '#9e2146',
                    },
                  },
                  hidePostalCode: true,
                }}
                onChange={(event) => {
                  setCardComplete(event.complete)
                  if (event.error) {
                    setError(event.error.message)
                  } else {
                    setError(null)
                  }
                }}
              />
            </div>
          </div>

          {/* 3DS Indicator */}
          {show3DSIndicator && (
            <Alert className='bg-blue-50 border-blue-200'>
              <Shield className='h-4 w-4 text-blue-600' />
              <AlertDescription className='text-blue-800 text-sm'>
                {t('3ds_authentication_may_be_required')}
              </AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <Button
            type='submit'
            onClick={handleSubmit}
            disabled={!isFormValid || threeDSProcessing}
            className='w-full'
            size='lg'
          >
            {processing || threeDSProcessing ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                {t('processing_payment')}
              </>
            ) : (
              <>
                <CreditCard className='mr-2 h-4 w-4' />
                {t('pay_amount', { amount: displayAmount })}
              </>
            )}
          </Button>

          {/* Security Notice */}
          <div className='text-xs text-gray-500 text-center space-y-1'>
            <p>{t('payment_secured_by_stripe')}</p>
            {requires3DS && (
              <p className='text-green-600 flex items-center justify-center gap-1'>
                <Shield className='h-3 w-3' />
                {t('3ds_authentication_enabled')}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 3DS Challenge Modal */}
      <ThreeDSChallengeModal
        isOpen={show3DSChallenge}
        onClose={() => {
          setShow3DSChallenge(false)
          setChallengeUrl(null)
          setThreeDSSessionId(null)
          setError(t('3ds_challenge_cancelled'))
          onPaymentError(t('3ds_challenge_cancelled'))
        }}
        challengeUrl={challengeUrl}
        sessionId={threeDSSessionId}
        onChallengeComplete={handleChallengeComplete}
        processing={threeDSProcessing}
        error={threeDSError}
      />
    </>
  )
}

export default EnhancedPaymentForm