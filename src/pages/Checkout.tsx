import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Loader2, 
  ArrowLeft, 
  Shield, 
  Lock, 
  CheckCircle, 
  CreditCard,
  Calendar,
  MapPin,
  User
} from 'lucide-react'
import { PriceDisplay } from '@/components/PriceDisplay'
import { bookingService } from '@/services/bookingService'
import PaymentForm from '@/components/payment/PaymentForm'
import { StripeProvider } from '@/contexts/StripeContext'
import { Booking } from '@/types/bridge/booking.types'
import { useToast } from '@/hooks/use-toast'
import Header from '@/components/Header'

const Checkout: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { t, language } = useLanguage()
  const { toast } = useToast()

  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'google_pay' | 'apple_pay'>('card')
  const [processingPayment, setProcessingPayment] = useState(false)

  useEffect(() => {
    if (!bookingId) {
      setError('ID de réservation manquant')
      setLoading(false)
      return
    }

    fetchBookingDetails()
  }, [bookingId])

  const fetchBookingDetails = async () => {
    try {
      setLoading(true)
      const bookingData = await bookingService.getBooking(bookingId!)
      setBooking(bookingData)
    } catch (err: any) {
      console.error('Erreur lors de la récupération de la réservation:', err)
      setError(err.message || 'Impossible de charger les détails de la réservation')
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    try {
      setProcessingPayment(true)
      
      // Confirmer le paiement côté backend
      await bookingService.confirmPayment(bookingId!, paymentIntentId)
      
      toast({
        title: 'Paiement réussi !',
        description: 'Votre réservation a été confirmée avec succès.',
        duration: 5000,
      })

      // Rediriger vers la page des réservations
      navigate('/profile?tab=reservations')
    } catch (err: any) {
      console.error('Erreur lors de la confirmation du paiement:', err)
      toast({
        title: 'Erreur de confirmation',
        description: 'Le paiement a été effectué mais la confirmation a échoué. Contactez le support.',
        variant: 'destructive',
      })
    } finally {
      setProcessingPayment(false)
    }
  }

  const handlePaymentError = (error: string) => {
    toast({
      title: 'Erreur de paiement',
      description: error,
      variant: 'destructive',
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const calculateDays = () => {
    if (!booking) return 0
    const start = new Date(booking.startDate)
    const end = new Date(booking.endDate)
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  }

  // Loading state
  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50'>
        <Header />
        <div className='flex items-center justify-center py-20'>
          <div className='text-center'>
            <Loader2 className='h-8 w-8 animate-spin mx-auto mb-4 text-blue-600' />
            <p className='text-gray-600'>Chargement des détails de paiement...</p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !booking) {
    return (
      <div className='min-h-screen bg-gray-50'>
        <Header />
        <div className='flex items-center justify-center py-20'>
          <div className='text-center max-w-md'>
            <AlertCircle className='h-12 w-12 text-red-500 mx-auto mb-4' />
            <h1 className='text-2xl font-bold mb-4 text-gray-900'>
              Erreur de chargement
            </h1>
            <p className='text-gray-600 mb-6'>{error}</p>
            <Link to='/profile?tab=reservations'>
              <Button variant='outline'>
                <ArrowLeft className='h-4 w-4 mr-2' />
                Retour aux réservations
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const days = calculateDays()
  
  // Aligner les calculs avec Rent.tsx pour assurer la cohérence
  const basePrice = booking ? Number(booking.tool?.basePrice) || 0 : 0
  const totalPrice = booking ? Number(booking.totalPrice) || 0 : 0
  const totalFees = booking ? Number(booking.fees) || totalPrice * 0.06 : 0
  const deposit = booking ? Number(booking.tool?.depositAmount) || 0 : 0
  
  const subtotal = totalPrice - totalFees
  const totalAmount = totalPrice + deposit

  return (
    <div className='min-h-screen bg-gray-50'>
      <Header />
      
      <main className='py-8'>
        <div className='max-w-6xl mx-auto px-4'>
          {/* Header */}
          <div className='mb-8'>
            <Link
              to={`/rent/${booking.toolId}`}
              className='inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4'
            >
              <ArrowLeft className='h-4 w-4' />
              Retour à la page de location
            </Link>
            
            <div className='flex items-center gap-3 mb-2'>
              <Lock className='h-6 w-6 text-green-600' />
              <h1 className='text-3xl font-bold text-gray-900'>Paiement sécurisé</h1>
            </div>
            <p className='text-gray-600'>
              Finalisez votre réservation en effectuant le paiement sécurisé
            </p>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
            {/* Booking Summary */}
            <div className='lg:col-span-2 space-y-6'>
              {/* Booking Details Card */}
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Calendar className='h-5 w-5' />
                    Détails de la réservation
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='flex items-start gap-4'>
                    <img
                      src={booking.tool?.photos?.[0]?.url || '/placeholder-tool.jpg'}
                      alt={booking.tool?.title}
                      className='w-20 h-20 rounded-lg object-cover'
                    />
                    <div className='flex-1'>
                      <h3 className='font-semibold text-lg'>{booking.tool?.title}</h3>
                      <div className='flex items-center gap-2 text-gray-600 mt-1'>
                        <MapPin className='h-4 w-4' />
                        <span>{booking.tool?.pickupAddress || booking.tool?.location || 'Adresse non spécifiée'}</span>
                      </div>
                      <div className='flex items-center gap-2 text-gray-600 mt-1'>
                        <User className='h-4 w-4' />
                        <span>Propriétaire: {booking.owner?.firstName} {booking.owner?.lastName}</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <p className='text-sm text-gray-600'>Date de début</p>
                      <p className='font-medium'>{formatDate(booking.startDate)}</p>
                    </div>
                    <div>
                      <p className='text-sm text-gray-600'>Date de fin</p>
                      <p className='font-medium'>{formatDate(booking.endDate)}</p>
                    </div>
                    <div>
                      <p className='text-sm text-gray-600'>Durée</p>
                      <p className='font-medium'>{days} jour{days > 1 ? 's' : ''}</p>
                    </div>
                    <div>
                      <p className='text-sm text-gray-600'>Statut</p>
                      <Badge variant='outline' className='text-orange-600 border-orange-200'>
                        {booking.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Methods */}
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <CreditCard className='h-5 w-5' />
                    Méthode de paiement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-3 mb-6'>
                    <label className='flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors'>
                      <input
                        type='radio'
                        name='payment'
                        value='card'
                        checked={paymentMethod === 'card'}
                        onChange={(e) => setPaymentMethod(e.target.value as 'card')}
                        className='text-blue-600'
                      />
                      <CreditCard className='h-5 w-5 text-gray-600' />
                      <span className='font-medium'>Carte de crédit</span>
                    </label>

                    <label className='flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors'>
                      <input
                        type='radio'
                        name='payment'
                        value='google_pay'
                        checked={paymentMethod === 'google_pay'}
                        onChange={(e) => setPaymentMethod(e.target.value as 'google_pay')}
                        className='text-blue-600'
                      />
                      <svg className='h-5 w-5' viewBox='0 0 24 24' fill='currentColor'>
                        <path d='M12.426 21.996c-.897 0-1.626-.729-1.626-1.626s.729-1.626 1.626-1.626 1.626.729 1.626 1.626-.729 1.626-1.626 1.626zm-6.426-3.252c-.897 0-1.626-.729-1.626-1.626s.729-1.626 1.626-1.626 1.626.729 1.626 1.626-.729 1.626-1.626 1.626zm12.852 0c-.897 0-1.626-.729-1.626-1.626s.729-1.626 1.626-1.626 1.626.729 1.626 1.626-.729 1.626-1.626 1.626z'/>
                      </svg>
                      <span className='font-medium'>Google Pay</span>
                    </label>

                    <label className='flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors'>
                      <input
                        type='radio'
                        name='payment'
                        value='apple_pay'
                        checked={paymentMethod === 'apple_pay'}
                        onChange={(e) => setPaymentMethod(e.target.value as 'apple_pay')}
                        className='text-blue-600'
                      />
                      <svg className='h-5 w-5' viewBox='0 0 24 24' fill='currentColor'>
                        <path d='M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z'/>
                      </svg>
                      <span className='font-medium'>Apple Pay</span>
                    </label>
                  </div>

                  {/* Stripe Payment Form */}
                  <StripeProvider>
                    <PaymentForm
                      amount={totalAmount}
                      bookingId={booking.id}
                      paymentMethod={paymentMethod}
                      onPaymentSuccess={handlePaymentSuccess}
                      onPaymentError={handlePaymentError}
                      disabled={processingPayment}
                      loading={processingPayment}
                    />
                  </StripeProvider>
                </CardContent>
              </Card>
            </div>

            {/* Price Summary */}
            <div className='lg:col-span-1'>
              <Card className='sticky top-24'>
                <CardHeader>
                  <CardTitle>Récapitulatif des prix</CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='space-y-3'>
                    <div className='flex justify-between text-sm'>
                      <span>Prix par jour (<PriceDisplay price={basePrice} baseCurrency={booking.tool?.baseCurrencyCode || 'GBP'} size="sm" />)</span>
                      <span><PriceDisplay price={basePrice} baseCurrency={booking.tool?.baseCurrencyCode || 'GBP'} size="sm" /> × {days} jour{days > 1 ? 's' : ''}</span>
                    </div>
                    <div className='flex justify-between text-sm'>
                      <span>Sous-total</span>
                      <span><PriceDisplay price={subtotal} baseCurrency={booking.tool?.baseCurrencyCode || 'GBP'} size="sm" /></span>
                    </div>
                    <div className='flex justify-between text-sm'>
                      <span>Frais de service (6%)</span>
                      <span><PriceDisplay price={totalFees} baseCurrency={booking.tool?.baseCurrencyCode || 'GBP'} size="sm" /></span>
                    </div>
                    <div className='flex justify-between text-sm'>
                      <span>Caution</span>
                      <span><PriceDisplay price={deposit} baseCurrency={booking.tool?.baseCurrencyCode || 'GBP'} size="sm" /></span>
                    </div>
                    
                    <Separator />
                    
                    <div className='flex justify-between font-semibold text-lg'>
                      <span>Total à payer</span>
                      <span><PriceDisplay price={totalAmount} baseCurrency={booking.tool?.baseCurrencyCode || 'GBP'} size="lg" /></span>
                    </div>
                  </div>

                  {/* Security Info */}
                  <div className='bg-green-50 p-4 rounded-lg mt-6'>
                    <div className='flex items-start gap-2'>
                      <Shield className='h-5 w-5 text-green-600 mt-0.5 flex-shrink-0' />
                      <div className='text-sm'>
                        <p className='font-medium text-green-900 mb-1'>
                          Protection incluse
                        </p>
                        <p className='text-green-700'>
                          Votre paiement est sécurisé par Stripe. La caution sera automatiquement restituée après le retour de l'outil.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Trust Indicators */}
                  <div className='flex items-center justify-center gap-4 pt-4 border-t'>
                    <div className='flex items-center gap-1 text-xs text-gray-500'>
                      <Lock className='h-3 w-3' />
                      <span>SSL sécurisé</span>
                    </div>
                    <div className='flex items-center gap-1 text-xs text-gray-500'>
                      <CheckCircle className='h-3 w-3' />
                      <span>Paiement protégé</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Checkout