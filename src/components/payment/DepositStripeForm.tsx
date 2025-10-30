import React, { useState } from 'react'
import {
  useStripe,
  useElements,
  CardElement,
} from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CreditCard, AlertCircle } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

const API_BASE_URL = import.meta.env.VITE_BASE_URL
  ? `${import.meta.env.VITE_BASE_URL}`
  : 'http://localhost:4000/api'

interface DepositStripeFormProps {
  amount: number // Amount in GBP
  bookingId: string
  onSuccess: (paymentIntentId: string) => void
  onError: (error: string) => void
  disabled?: boolean
}

const DepositStripeForm: React.FC<DepositStripeFormProps> = ({
  amount,
  bookingId,
  onSuccess,
  onError,
  disabled = false
}) => {
  const { t } = useLanguage()
  const stripe = useStripe()
  const elements = useElements()

  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cardComplete, setCardComplete] = useState(false)

  const cardElementOptions = {
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

    if (!stripe || !elements || processing || disabled) {
      return
    }

    setProcessing(true)
    setError(null)

    try {
      const cardElement = elements.getElement(CardElement)
      if (!cardElement) {
        throw new Error('Card element not found')
      }

      // Create payment intent for deposit
      const response = await fetch(`${API_BASE_URL}/payments/create-deposit-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          bookingId,
          amount: Math.round(amount * 100), // Convert to cents
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create payment intent')
      }

      const { clientSecret } = data

      if (!clientSecret) {
        throw new Error('Client secret not found in API response')
      }

      // Confirm the payment
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: 'Customer',
          },
        },
      })

      if (confirmError) {
        setError(confirmError.message || 'Payment failed')
        onError(confirmError.message || 'Payment failed')
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Process the deposit payment on backend
        const processResponse = await fetch(`${API_BASE_URL}/payments/process-deposit/${bookingId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            paymentIntentId: paymentIntent.id,
          }),
        })

        if (processResponse.ok) {
          onSuccess(paymentIntent.id)
        } else {
          const processData = await processResponse.json()
          const errorMsg = processData.message || 'Failed to process deposit payment'
          setError(errorMsg)
          onError(errorMsg)
        }
      }
    } catch (err: any) {
      const errorMsg = err.message || 'An unexpected error occurred'
      setError(errorMsg)
      onError(errorMsg)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Error Alert */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Card Element */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('deposit.modal.card_details')}
        </label>
        <div className="border border-gray-300 rounded-md p-3 bg-white">
          <CardElement
            options={cardElementOptions}
            onChange={handleCardChange}
          />
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700"
        disabled={!stripe || !cardComplete || processing || disabled}
      >
        {processing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            {t('deposit.modal.processing')}
          </>
        ) : (
          <>
            <CreditCard className="h-4 w-4 mr-2" />
            {t('deposit.modal.pay_button')}
          </>
        )}
      </Button>
    </form>
  )
}

export default DepositStripeForm