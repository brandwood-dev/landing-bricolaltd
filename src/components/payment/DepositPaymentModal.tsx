import React, { useState, useEffect } from 'react'
import {
  useStripe,
  useElements,
  CardElement,
} from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Loader2, 
  CreditCard, 
  AlertCircle, 
  CheckCircle, 
  X,
  Calendar,
  DollarSign
} from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useCurrency } from '@/contexts/CurrencyContext'
import { OptimizedPriceDisplay } from '@/components/OptimizedPriceDisplay'

const API_BASE_URL = import.meta.env.VITE_BASE_URL
  ? `${import.meta.env.VITE_BASE_URL}`
  : 'http://localhost:4000/api'

interface Booking {
  id: string
  tool_name: string
  start_date: string
  end_date: string
  owner_name?: string
  deposit_due_date?: string
}

interface DepositPaymentModalProps {
  isOpen: boolean
  onClose: () => void
  booking: Booking
  depositAmount: number
  onPaymentSuccess: (paymentIntentId: string) => void
  onCancelReservation: () => void
  testMode?: boolean
}

const DepositPaymentModal: React.FC<DepositPaymentModalProps> = ({
  isOpen,
  onClose,
  booking,
  depositAmount,
  onPaymentSuccess,
  onCancelReservation,
  testMode = false
}) => {
  const { t } = useLanguage()
  const { currency } = useCurrency()
  const stripe = useStripe()
  const elements = useElements()

  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [cardComplete, setCardComplete] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  // Convert deposit amount to GBP (base currency)
  const depositAmountInGBP = depositAmount

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        onClose()
        setSuccess(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [success, onClose])

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

  const handlePaymentSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements || processing) {
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
          bookingId: booking.id,
          amount: Math.round(depositAmountInGBP * 100), // Convert to cents
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create payment intent')
      }

      const { clientSecret, paymentIntentId } = data

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
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Process the deposit payment on backend
        const processResponse = await fetch(`${API_BASE_URL}/payments/process-deposit/${booking.id}`, {
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
          setSuccess(true)
          onPaymentSuccess(paymentIntent.id)
        } else {
          const processData = await processResponse.json()
          throw new Error(processData.message || 'Failed to process deposit payment')
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred')
    } finally {
      setProcessing(false)
    }
  }

  const handleCancelReservation = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/${booking.id}/cancel-deposit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          reason: 'User cancelled before deposit payment',
        }),
      })

      if (response.ok) {
        onCancelReservation()
        onClose()
      } else {
        const data = await response.json()
        setError(data.message || 'Failed to cancel reservation')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to cancel reservation')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {success ? (
          <div className="p-6 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              {t('deposit.modal.success')}
            </h2>
            <p className="text-gray-600">
              {t('deposit.modal.success_message')}
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center gap-3">
                <DollarSign className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">
                  {t('deposit.modal.title')}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Booking Info */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h3 className="font-medium text-gray-900">{booking.tool_name}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {formatDate(booking.start_date)} - {formatDate(booking.end_date)}
                  </span>
                </div>
                {booking.owner_name && (
                  <p className="text-sm text-gray-600">
                    {t('deposit.modal.owner')}: {booking.owner_name}
                  </p>
                )}
              </div>

              {/* Deposit Amount */}
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">
                  {t('deposit.modal.subtitle')}
                </p>
                <div className="text-3xl font-bold text-gray-900">
                  <OptimizedPriceDisplay
                    price={depositAmountInGBP}
                    baseCurrency="GBP"
                    size="xl"
                    cible="depositAmount"
                  />
                </div>
                {booking.deposit_due_date && (
                  <p className="text-sm text-gray-500 mt-2">
                    {t('deposit.modal.due_date', { 
                      date: formatDate(booking.deposit_due_date) 
                    })}
                  </p>
                )}
                {testMode && (
                  <div className="mt-2 px-3 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full inline-block">
                    {t('deposit.modal.test_mode')}
                  </div>
                )}
              </div>

              {/* Error Alert */}
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {/* Cancel Confirmation */}
              {showCancelConfirm ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 mb-4">
                    {t('deposit.modal.cancel_confirm')}
                  </p>
                  <div className="flex gap-3">
                    <Button
                      onClick={handleCancelReservation}
                      variant="destructive"
                      size="sm"
                    >
                      {t('deposit.modal.confirm_cancel')}
                    </Button>
                    <Button
                      onClick={() => setShowCancelConfirm(false)}
                      variant="outline"
                      size="sm"
                    >
                      {t('common.back')}
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Payment Form */}
                  <form onSubmit={handlePaymentSubmit} className="space-y-4">
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

                    {/* Action Buttons */}
                    <div className="space-y-3">
                      <Button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        disabled={!stripe || !cardComplete || processing}
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

                      <Button
                        type="button"
                        variant="ghost"
                        className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => setShowCancelConfirm(true)}
                        disabled={processing}
                      >
                        {t('deposit.modal.cancel_button')}
                      </Button>
                    </div>
                  </form>
                </>
              )}

              {/* Description */}
              <div className="text-xs text-gray-500 text-center">
                {t('deposit.modal.description')}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default DepositPaymentModal