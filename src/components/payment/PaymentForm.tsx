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
import { Loader2, CreditCard, AlertCircle, CheckCircle, Shield } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useCurrency } from '@/contexts/CurrencyContext'
import { OptimizedPriceDisplay } from '@/components/OptimizedPriceDisplay'
import { useThreeDSecure } from '@/hooks/useThreeDSecure'
import ThreeDSChallengeModal from './ThreeDSChallengeModal'

const API_BASE_URL = import.meta.env.VITE_BASE_URL
  ? `${import.meta.env.VITE_BASE_URL}`
  : 'http://localhost:4000/api'

interface PaymentFormProps {
  amount: number // Montant en GBP (devise de base)
  bookingId?: string
  onPaymentSuccess: (paymentIntentId: string) => void
  onPaymentError: (error: string) => void
  disabled?: boolean
  loading?: boolean
  paymentMethod?: 'card' | 'google_pay' | 'apple_pay'
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  amount,
  bookingId,
  onPaymentSuccess,
  onPaymentError,
  disabled = false,
  loading = false,
  paymentMethod = 'card',
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
  const [cardholderName, setCardholderName] = useState('')
  const [cardholderEmail, setCardholderEmail] = useState('')
  const [billingAddress, setBillingAddress] = useState({
    line1: '',
    city: '',
    postalCode: '',
    country: 'GB',
  })
  const [showBillingForm, setShowBillingForm] = useState(false)
  const [requires3DS, setRequires3DS] = useState(false)
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null)

  // Calculer le montant affiché dans la devise sélectionnée
  const displayAmount = calculatePrice(amount, 'GBP', currency.code)
  const amountInGBP = amount // Le montant est déjà en GBP

  // 🔍 LOGS DE DÉBOGAGE ULTRA-DÉTAILLÉS POUR TRACER LE FLUX DES MONTANTS
  console.log('🔍 [PaymentForm] === DÉBUT ANALYSE MONTANTS ===')
  console.log('🔍 [PaymentForm] Montant reçu (amount):', amount, typeof amount)
  console.log('🔍 [PaymentForm] Montant en GBP (amountInGBP):', amountInGBP, typeof amountInGBP)
  console.log('🔍 [PaymentForm] Montant affiché (displayAmount):', displayAmount, typeof displayAmount)
  console.log('🔍 [PaymentForm] Devise actuelle:', currency.code)
  console.log('🔍 [PaymentForm] Conversion en centimes (amountInGBP * 100):', amountInGBP * 100)
  console.log('🔍 [PaymentForm] Conversion arrondie Math.round(amountInGBP * 100):', Math.round(amountInGBP * 100))
  console.log('🔍 [PaymentForm] === FIN ANALYSE MONTANTS ===')

  // Initialize Payment Request for Google Pay and Apple Pay
  useEffect(() => {
    if (
      stripe &&
      (paymentMethod === 'google_pay' || paymentMethod === 'apple_pay')
    ) {
      // 🔍 LOG AVANT CONVERSION EN CENTIMES
      const amountInCents = Math.round(amountInGBP * 100)
      console.log('🔍 [PaymentForm] === GOOGLE/APPLE PAY SETUP ===')
      console.log('🔍 [PaymentForm] amountInGBP:', amountInGBP)
      console.log('🔍 [PaymentForm] amountInGBP * 100:', amountInGBP * 100)
      console.log('🔍 [PaymentForm] Math.round(amountInGBP * 100):', amountInCents)
      console.log('🔍 [PaymentForm] Type de amountInCents:', typeof amountInCents)
      
      const pr = stripe.paymentRequest({
        country: 'GB', // Changé de FR à GB car on traite en GBP
        currency: 'gbp', // Changé de eur à gbp
        total: {
          label: 'Réservation Bricola',
          amount: amountInCents, // Utiliser le montant en centimes
        },
        requestPayerName: true,
        requestPayerEmail: true,
      })

      // Check if the browser supports the payment request
      pr.canMakePayment().then((result) => {
        if (result) {
          setPaymentRequest(pr)
          setCanMakePayment(true)
        }
      })

      pr.on('paymentmethod', async (ev) => {
        setProcessing(true)
        setError(null)

        try {
          // 🔍 LOGS ULTRA-DÉTAILLÉS AVANT ENVOI À L'API
          const apiAmountInCents = Math.round(amountInGBP * 100)
          console.log('🔍 [PaymentForm] === ENVOI API GOOGLE/APPLE PAY ===')
          console.log('🔍 [PaymentForm] amountInGBP original:', amountInGBP)
          console.log('🔍 [PaymentForm] Calcul: amountInGBP * 100 =', amountInGBP * 100)
          console.log('🔍 [PaymentForm] Math.round(amountInGBP * 100) =', apiAmountInCents)
          console.log('🔍 [PaymentForm] Type de apiAmountInCents:', typeof apiAmountInCents)

          // Create Payment Intent
          const requestBody = {
            amount: amountInGBP,
            currency: 'gbp',
            bookingId: bookingId,
            metadata: {
              bookingId: bookingId || '',
              source: 'booking_payment',
              paymentMethod: paymentMethod,
              displayCurrency: currency.code,
              displayAmount: displayAmount,
            },
          }

          console.log('🔍 [PaymentForm] Body complet à envoyer:', JSON.stringify(requestBody, null, 2))

          const response = await fetch(`${API_BASE_URL}/payments/intent`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
            body: JSON.stringify(requestBody),
          })

          console.log('🔍 [PaymentForm] Réponse HTTP status:', response.status)
          console.log('🔍 [PaymentForm] Réponse HTTP ok:', response.ok)

          if (!response.ok) {
            const errorData = await response.json()
            console.log('🔍 [PaymentForm] Erreur API:', errorData)
            throw new Error(
              errorData.message || 'Failed to create payment intent'
            )
          }

          const responseData = await response.json()
          console.log('🔍 [PaymentForm] Réponse API complète:', JSON.stringify(responseData, null, 2))

          const { data } = responseData
          console.log('🔍 [PaymentForm] Data extraite:', data)

          const {
            client_secret: clientSecret,
            payment_intent_id: paymentIntentId,
          } = data || {}
          console.log('🔍 [PaymentForm] clientSecret extraite:', clientSecret)
          console.log('🔍 [PaymentForm] paymentIntentId extraite:', paymentIntentId)

          if (!clientSecret) {
            throw new Error('Client secret not found in API response')
          }

          // Confirm the payment
          const { error: confirmError, paymentIntent } =
            await stripe.confirmCardPayment(
              clientSecret,
              { payment_method: ev.paymentMethod.id },
              { handleActions: false }
            )

          if (confirmError) {
            console.log('🔍 [PaymentForm] Erreur confirmation:', confirmError)
            ev.complete('fail')
            setError(confirmError.message || 'Payment failed')
            onPaymentError(confirmError.message || 'Payment failed')
          } else {
            console.log('🔍 [PaymentForm] Paiement confirmé:', paymentIntent)
            ev.complete('success')
            // 🔧 CORRECTION: Vérifier le statut et appeler onPaymentSuccess avec le bon ID
            console.log('🔍 [PaymentForm] PaymentIntent status:', paymentIntent?.status)
            console.log('🔍 [PaymentForm] PaymentIntentId à envoyer:', paymentIntentId)
            
            if (paymentIntent && (paymentIntent.status === 'succeeded' || paymentIntent.status === 'requires_capture')) {
              console.log('🔍 [PaymentForm] Appel de onPaymentSuccess avec ID:', paymentIntentId)
              onPaymentSuccess(paymentIntentId)
            } else {
              console.log('🔍 [PaymentForm] Statut de paiement inattendu:', paymentIntent?.status)
              ev.complete('fail')
              setError('Payment status is not valid')
              onPaymentError('Payment status is not valid')
            }
          }
        } catch (error: any) {
          console.log('🔍 [PaymentForm] Erreur générale:', error)
          ev.complete('fail')
          const errorMessage = error.message || 'Payment failed'
          setError(errorMessage)
          onPaymentError(errorMessage)
        } finally {
          setProcessing(false)
        }
      })
    }
  }, [
    stripe,
    amountInGBP,
    displayAmount,
    currency.code,
    bookingId,
    paymentMethod,
    onPaymentSuccess,
    onPaymentError,
  ])

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
        fontFamily: 'system-ui, -apple-system, sans-serif',
      },
      invalid: {
        color: '#9e2146',
      },
    },
    hidePostalCode: false,
  }

  const handleCardChange = (event: any) => {
    setCardComplete(event.complete)
    if (event.error) {
      setError(event.error.message)
    } else {
      setError(null)
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements || processing || disabled || loading) {
      return
    }

    // For Google Pay and Apple Pay, the payment is handled in the useEffect
    if (paymentMethod === 'google_pay' || paymentMethod === 'apple_pay') {
      return
    }

    const cardElement = elements.getElement(CardElement)
    if (!cardElement) {
      setError('Card element not found')
      return
    }

    setProcessing(true)
    setError(null)

    try {
      // 🔍 LOGS ULTRA-DÉTAILLÉS AVANT CONVERSION EN CENTIMES POUR PAIEMENT PAR CARTE
      const amountInCents = Math.round(amountInGBP * 100)
      console.log('🔍 [PaymentForm] === PAIEMENT PAR CARTE ===')
      console.log('🔍 [PaymentForm] amountInGBP original:', amountInGBP)
      console.log('🔍 [PaymentForm] Calcul: amountInGBP * 100 =', amountInGBP * 100)
      console.log('🔍 [PaymentForm] Math.round(amountInGBP * 100) =', amountInCents)
      console.log('🔍 [PaymentForm] Type de amountInCents:', typeof amountInCents)
      
      // Create Payment Intent
      const requestBody = {
        amount: amountInGBP,
        currency: 'gbp',
        bookingId: bookingId,
        metadata: {
          bookingId: bookingId || '',
          source: 'booking_payment',
          paymentMethod: 'card',
          displayCurrency: currency.code,
          displayAmount: displayAmount,
        },
      }

      console.log('🔍 [PaymentForm] Body complet à envoyer (Carte):', JSON.stringify(requestBody, null, 2))

      const response = await fetch(`${API_BASE_URL}/payments/intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(requestBody),
      })

      console.log('🔍 [PaymentForm] Réponse HTTP status (Carte):', response.status)
      console.log('🔍 [PaymentForm] Réponse HTTP ok (Carte):', response.ok)

      if (!response.ok) {
        const errorData = await response.json()
        console.log('🔍 [PaymentForm] Erreur API (Carte):', errorData)
        throw new Error(errorData.message || 'Failed to create payment intent')
      }

      const responseData = await response.json()
      console.log('🔍 [PaymentForm] Réponse API complète (Carte):', JSON.stringify(responseData, null, 2))

      const { data } = responseData
      console.log('🔍 [PaymentForm] Data extraite (Carte):', data)

      const {
        client_secret: clientSecret,
        payment_intent_id: paymentIntentId,
      } = data || {}
      console.log('🔍 [PaymentForm] clientSecret extraite (Carte):', clientSecret)
      console.log('🔍 [PaymentForm] paymentIntentId extraite (Carte):', paymentIntentId)

      if (!clientSecret) {
        throw new Error('Client secret not found in API response')
      }

      // Confirm the payment
      const { error: confirmError, paymentIntent } =
        await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: 'Customer', // You might want to get this from user data
            },
          },
        })

      if (confirmError) {
        console.log('🔍 [PaymentForm] Erreur confirmation (Carte):', confirmError)
        setError(confirmError.message || 'Payment failed')
        onPaymentError(confirmError.message || 'Payment failed')
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        console.log('🔍 [PaymentForm] Paiement confirmé (Carte):', paymentIntent)
        // 🔧 CORRECTION: Vérifier le statut et appeler onPaymentSuccess avec le bon ID
        console.log('🔍 [PaymentForm] PaymentIntent status (Carte):', paymentIntent?.status)
        console.log('🔍 [PaymentForm] PaymentIntentId à envoyer (Carte):', paymentIntentId)
        onPaymentSuccess(paymentIntentId)
      } else if (paymentIntent && paymentIntent.status === 'requires_capture') {
        console.log('🔍 [PaymentForm] Paiement nécessite capture (Carte):', paymentIntent)
        console.log('🔍 [PaymentForm] PaymentIntentId à envoyer (Carte):', paymentIntentId)
        onPaymentSuccess(paymentIntentId)
      } else {
        console.log('🔍 [PaymentForm] Statut de paiement inattendu (Carte):', paymentIntent?.status)
        setError('Payment status is not valid')
        onPaymentError('Payment status is not valid')
      }
    } catch (error: any) {
      console.log('🔍 [PaymentForm] Erreur générale (Carte):', error)
      const errorMessage = error.message || 'Payment failed'
      setError(errorMessage)
      onPaymentError(errorMessage)
    } finally {
      setProcessing(false)
    }
  }

  const isFormValid =
    stripe && elements && cardComplete && !processing && !loading && !disabled

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
              Montant à payer:{' '}
              <OptimizedPriceDisplay
                                price={displayAmount}
                                baseCurrency={'GBP'}
                                size='lg'
                                cible='totalPrice'
                              />
            </div>
            {currency.code !== 'GBP' && (
              <div className='text-sm text-gray-600'>
                (Équivalent: £{amountInGBP.toFixed(2)} GBP)
              </div>
            )}
          </div>

          {error && (
            <Alert variant='destructive'>
              <AlertCircle className='h-4 w-4' />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {paymentRequest && canMakePayment ? (
            <div className='w-full'>
              <PaymentRequestButtonElement
                options={{ paymentRequest }}
                className='w-full'
              />
            </div>
          ) : (
            <Alert>
              <AlertCircle className='h-4 w-4' />
              <AlertDescription>
                {paymentMethod === 'google_pay'
                  ? "Google Pay n'est pas disponible sur ce navigateur ou appareil."
                  : "Apple Pay n'est pas disponible sur ce navigateur ou appareil."}
              </AlertDescription>
            </Alert>
          )}

          {processing && (
            <div className='flex items-center justify-center p-4'>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Traitement du paiement...
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // Default card payment UI
  return (
    <Card className='w-full max-w-md mx-auto'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <CreditCard className='h-5 w-5' />
          Paiement sécurisé
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* Affichage du montant dans la devise sélectionnée avec conversion GBP */}
        <div className='text-center space-y-2'>
          <div className='text-lg font-semibold'>
            Montant à payer:{' '}
            <OptimizedPriceDisplay
              price={amount}
              baseCurrency='GBP'
              size='md'
            />
          </div>
          {currency.code !== 'GBP' && (
            <div className='text-sm text-gray-600'>
              (Traitement en GBP: £{amountInGBP.toFixed(2)})
            </div>
          )}
        </div>

        {error && (
          <Alert variant='destructive'>
            <AlertCircle className='h-4 w-4' />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='p-3 border rounded-md bg-white'>
            <CardElement
              options={cardElementOptions}
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

          <Button
            type='submit'
            className='w-full'
            disabled={
              !stripe || !cardComplete || processing || disabled || loading
            }
          >
            {processing ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Traitement...
              </>
            ) : (
              <>
                <CheckCircle className='mr-2 h-4 w-4' />
                Payer maintenant{' '}
                <OptimizedPriceDisplay
                  price={amount}
                  baseCurrency='GBP'
                  size='sm'
                />
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default PaymentForm
