import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useLanguage } from '@/contexts/LanguageContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { useToast } from '@/hooks/use-toast'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { toolsService } from '@/services/toolsService'
import { bookingService } from '@/services/bookingService'
import { countriesService } from '@/services/countriesService'
import { Tool } from '@/types/bridge/tool.types'
import { CreateBookingData, BookingPricing } from '@/types/bridge/booking.types'
import { Country } from '@/types/bridge/common.types'
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  CreditCard,
  Shield,
  Check,
  Loader2,
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { cn } from '@/lib/utils'

const Rent = () => {
  const { id } = useParams()
  const { t, language } = useLanguage()
  const { toast } = useToast()
  const navigate = useNavigate()

  // State variables
  const [tool, setTool] = useState<Tool | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [unavailableDates, setUnavailableDates] = useState<Date[]>([])
  const [pricing, setPricing] = useState<BookingPricing | null>(null)
  const [pricingLoading, setPricingLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    pickupTime: '09:00',
    message: '',
    firstName: '',
    lastName: '',
    phone: '',
    phonePrefix: '+965',
    paymentMethod: 'card',
  })
  const [countries, setCountries] = useState<Country[]>([])
  const [loadingCountries, setLoadingCountries] = useState(true)
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const countriesData = await countriesService.getActiveCountries()
        setCountries(countriesData)
      } catch (error) {
        console.error('Failed to fetch countries:', error)
        toast({
          title: 'Error',
          description: 'Failed to load countries. Please refresh the page.',
          variant: 'destructive',
        })
      } finally {
        setLoadingCountries(false)
      }
    }

    fetchCountries()
  }, [])

  // Generate phone prefixes from fetched countries data
  const phonePrefixes = countries.map((country) => ({
    value: country.phonePrefix,
    label: `${country.phonePrefix} (${country.name})`,
    flag: country.code.toLowerCase(),
  }))

  // Fetch tool data
  const fetchTool = async () => {
    if (!id) return

    try {
      setLoading(true)
      const toolData = await toolsService.getTool(id)
      setTool(toolData)

      // Mock unavailable dates for development
      const mockUnavailableDates = [
        '2024-01-15',
        '2024-01-16',
        '2024-01-20',
        '2024-01-25',
        '2024-02-01',
        '2024-02-02',
        '2024-02-10'
      ]
      const dates = mockUnavailableDates.map((dateStr) => new Date(dateStr))
      setUnavailableDates(dates)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch tool data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTool()
  }, [id])

  const isDateUnavailable = (date: Date) => {
    return unavailableDates.some(
      (unavailable) => date.toDateString() === unavailable.toDateString()
    )
  }

  const calculateDays = () => {
    if (!startDate || !endDate) return 0
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // Fetch pricing when dates change
  const fetchPricing = async () => {
    if (!tool || !startDate || !endDate) {
      setPricing(null)
      return
    }

    try {
      setPricingLoading(true)
      const pricingData = await bookingService.calculateBookingPricing(
        tool.id,
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      )
      setPricing(pricingData)
    } catch (err: any) {
      console.error('Failed to fetch pricing:', err)
      // Fallback to manual calculation
      const days = calculateDays()
      const basePrice = tool.basePrice || 25
      const subtotal = basePrice * days
      const fees = subtotal * 0.05 // 5% fees
      const deposit = 50
      setPricing({
        basePrice,
        totalDays: days,
        subtotal,
        fees,
        deposit,
        totalAmount: subtotal + fees + deposit,
      })
    } finally {
      setPricingLoading(false)
    }
  }

  useEffect(() => {
    fetchPricing()
  }, [tool, startDate, endDate])

  // Pricing values with fallbacks
  const basePrice = Number(pricing?.basePrice || tool?.basePrice) || 25
  const days = Number(pricing?.totalDays || calculateDays()) || 1
  const totalPrice = Number(pricing?.subtotal) || basePrice * days
  const totalFees = Number(pricing?.fees) || totalPrice * 0.05
  const deposit = Number(pricing?.deposit) || 50
  const displayPrice = basePrice
  const totalToPay = Number(pricing?.totalAmount) || totalPrice + totalFees + deposit

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!startDate || !endDate) {
      toast({
        title: t('errors.validation_error'),
        description: t('reservation.select_dates'),
        variant: 'destructive',
      })
      return
    }

    // Note: Date validation will be handled server-side

    if (!formData.firstName || !formData.lastName || !formData.phone) {
      toast({
        title: t('errors.validation_error'),
        description: t('reservation.fill_required_fields'),
        variant: 'destructive',
      })
      return
    }

    if (!tool) {
      toast({
        title: t('errors.validation_error'),
        description: t('errors.tool_not_found'),
        variant: 'destructive',
      })
      return
    }

    try {
      setSubmitting(true)

      // Create booking data
      const bookingData: CreateBookingData = {
        toolId: tool.id,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        pickupTime: formData.pickupTime,
        paymentMethod: formData.paymentMethod as 'card' | 'paypal',
        message: formData.message || undefined,
        renterInfo: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          phonePrefix: formData.phonePrefix,
        },
      }

      // Create the booking
      const booking = await bookingService.createBooking(bookingData)

      toast({
        title: t('reservation.success'),
        description: t('reservation.confirmation_sent'),
      })

      // Redirect to profile/bookings page
      setTimeout(() => {
        navigate('/profile?tab=bookings')
      }, 2000)
    } catch (err: any) {
      console.error('Booking creation failed:', err)
      toast({
        title: t('errors.booking_failed'),
        description: err.message || t('errors.generic_error'),
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <Loader2 className='h-8 w-8 animate-spin mx-auto mb-4' />
          <p>{t('general.loading')}</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !tool) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold mb-4'>
            {t('errors.tool_not_found')}
          </h1>
          <p className='text-gray-600 mb-4'>{error}</p>
          <Link to='/search' className='text-blue-600 hover:underline'>
            {t('navigation.back_to_search')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-background'>
      <Header />
      <main className='py-20'>
        <div className='max-w-6xl mx-auto px-4'>
          <div className='mb-6'>
            <Link
              to={`/tool/${id}`}
              className='inline-flex items-center gap-2 text-accent hover:underline'
            >
              <ArrowLeft className='h-4 w-4' />
              {t('reservation.back_to_details')}
            </Link>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
            {/* Formulaire de réservation */}
            <div className='lg:col-span-2'>
              <Card>
                <CardHeader className={language === 'ar' ? 'justify-end' : ''}>
                  <CardTitle className='flex items-center gap-2 '>
                    {language === 'ar' ? (
                      <>
                        {t('reservation.complete_booking')}
                        <CalendarIcon className='h-5 w-5' />
                      </>
                    ) : (
                      <>
                        <CalendarIcon className='h-5 w-5' />
                        {t('reservation.complete_booking')}
                      </>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form className='space-y-6'>
                    {/* Outil sélectionné */}
                    <div className='flex items-center gap-4 p-4 bg-gray-50 rounded-lg justify-end'>
                      {language === 'ar' ? (
                        <>
                          <div>
                            <h3 className='font-semibold'>{tool.title}</h3>
                            <p className='text-sm text-gray-600'>
                              {displayPrice.toFixed(1)}€/{t('general.day')}
                            </p>
                            <p className='text-sm text-gray-600'>
                              {tool.pickupAddress}
                            </p>
                          </div>
                          <img
                            src={
                              tool.photos?.find((p) => p.isPrimary)?.url ||
                              tool.photos?.[0]?.url ||
                              '/placeholder-tool.jpg'
                            }
                            alt={tool.title}
                            className='w-16 h-16 object-cover rounded'
                          />
                        </>
                      ) : (
                        <>
                          <img
                            src={
                              tool.photos?.find((p) => p.isPrimary)?.url ||
                              tool.photos?.[0]?.url ||
                              '/placeholder-tool.jpg'
                            }
                            alt={tool.title}
                            className='w-16 h-16 object-cover rounded'
                          />
                          <div>
                            <h3 className='font-semibold'>{tool.title}</h3>
                            <p className='text-sm text-gray-600'>
                              {displayPrice.toFixed(1)}€/{t('general.day')}
                            </p>
                            <p className='text-sm text-gray-600'>
                              {tool.pickupAddress}
                            </p>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Dates de location */}
                    <div className='space-y-4'>
                      <h3 className='font-semibold text-lg'>
                        {t('reservation.rental_period')}
                      </h3>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div className='space-y-2'>
                          <Label>{t('reservation.start_date')} *</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant='outline'
                                className={cn(
                                  'w-full justify-start text-left font-normal',
                                  !startDate && 'text-muted-foreground'
                                )}
                              >
                                <CalendarIcon className='mr-2 h-4 w-4' />
                                {startDate
                                  ? format(startDate, 'PPP', { locale: fr })
                                  : t('reservation.select_date')}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className='w-auto p-0'>
                              <Calendar
                                mode='single'
                                selected={startDate}
                                onSelect={setStartDate}
                                disabled={(date) => {
                                  return (
                                    date < new Date() || isDateUnavailable(date)
                                  )
                                }}
                                modifiers={{
                                  unavailable: unavailableDates,
                                }}
                                modifiersStyles={{
                                  unavailable: {
                                    backgroundColor: '#fecaca',
                                    color: '#dc2626',
                                    textDecoration: 'line-through',
                                  },
                                }}
                                initialFocus
                                className='pointer-events-auto'
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div className='space-y-2'>
                          <Label>{t('reservation.end_date')} *</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant='outline'
                                className={cn(
                                  'w-full justify-start text-left font-normal',
                                  !endDate && 'text-muted-foreground'
                                )}
                              >
                                <CalendarIcon className='mr-2 h-4 w-4' />
                                {endDate
                                  ? format(endDate, 'PPP', { locale: fr })
                                  : t('reservation.select_date')}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className='w-auto p-0'>
                              <Calendar
                                mode='single'
                                selected={endDate}
                                onSelect={setEndDate}
                                disabled={(date) => {
                                  return (
                                    date < (startDate || new Date()) ||
                                    isDateUnavailable(date)
                                  )
                                }}
                                modifiers={{
                                  unavailable: unavailableDates,
                                }}
                                modifiersStyles={{
                                  unavailable: {
                                    backgroundColor: '#fecaca',
                                    color: '#dc2626',
                                    textDecoration: 'line-through',
                                  },
                                }}
                                initialFocus
                                className='pointer-events-auto'
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>

                      <div className='space-y-2'>
                        <Label htmlFor='pickupTime'>
                          {t('reservation.pickup_time')}
                        </Label>
                        <Select
                          value={formData.pickupTime}
                          onValueChange={(value) =>
                            setFormData({ ...formData, pickupTime: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='08:00'>08:00</SelectItem>
                            <SelectItem value='09:00'>09:00</SelectItem>
                            <SelectItem value='10:00'>10:00</SelectItem>
                            <SelectItem value='11:00'>11:00</SelectItem>
                            <SelectItem value='14:00'>14:00</SelectItem>
                            <SelectItem value='15:00'>15:00</SelectItem>
                            <SelectItem value='16:00'>16:00</SelectItem>
                            <SelectItem value='17:00'>17:00</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Message au propriétaire */}
                    <div className='space-y-2'>
                      <Label htmlFor='message'>
                        {t('reservation.message_to_owner')}
                      </Label>
                      <Textarea
                        id='message'
                        placeholder={t('reservation.message_placeholder')}
                        className='min-h-[80px]'
                        value={formData.message}
                        onChange={(e) =>
                          setFormData({ ...formData, message: e.target.value })
                        }
                      />
                    </div>

                    {/* Informations personnelles */}
                    <div className='space-y-4'>
                      <h3 className='font-semibold text-lg'>
                        {t('reservation.contact_information')}
                      </h3>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div className='space-y-2'>
                          <Label htmlFor='firstName'>
                            {t('general.first_name')} *
                          </Label>
                          <Input
                            id='firstName'
                            placeholder={t('general.first_name_placeholder')}
                            value={formData.firstName}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                firstName: e.target.value,
                              })
                            }
                            required
                          />
                        </div>
                        <div className='space-y-2'>
                          <Label htmlFor='lastName'>
                            {t('general.last_name')} *
                          </Label>
                          <Input
                            id='lastName'
                            placeholder={t('general.last_name_placeholder')}
                            value={formData.lastName}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                lastName: e.target.value,
                              })
                            }
                            required
                          />
                        </div>
                      </div>
                      {/* Téléphone avec préfixe */}
                      <div className='space-y-2'>
                        <Label htmlFor='phone'>{t('register.phone')}</Label>
                        <div className='flex space-x-2'>
                          <Select
                            value={formData.phonePrefix}
                            onValueChange={(value) =>
                              setFormData({ ...formData, phonePrefix: value })
                            }
                            disabled={loadingCountries}
                          >
                            <SelectTrigger className='w-32'>
                              {loadingCountries ? (
                                <div className='flex items-center gap-2'>
                                  <Loader2 className='h-4 w-4 animate-spin' />
                                  <span>Loading</span>
                                </div>
                              ) : (
                                <SelectValue />
                              )}
                            </SelectTrigger>
                            <SelectContent>
                              {phonePrefixes.map((prefix) => (
                                <SelectItem
                                  key={prefix.value}
                                  value={prefix.value}
                                >
                                  <img
                                    src={`https://flagcdn.com/16x12/${prefix.flag}.png`}
                                    alt=''
                                    className='inline w-4 h-3 mr-2'
                                  />
                                  {prefix.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input
                            id='phone'
                            type='tel'
                            placeholder='12 34 56 78'
                            className='flex-1'
                            value={formData.phone}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                phone: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>

                    {/* Mode de paiement */}
                    <div className='space-y-4'>
                      <h3 className='font-semibold text-lg'>
                        {t('reservation.payment_method')}
                      </h3>
                      <div className='space-y-3'>
                        <label className='flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50'>
                          <input
                            type='radio'
                            name='payment'
                            value='card'
                            checked={formData.paymentMethod === 'card'}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                paymentMethod: e.target.value,
                              })
                            }
                          />
                          <CreditCard className='h-5 w-5' />
                          <span>{t('reservation.card')}</span>
                        </label>
                        <label className='flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50'>
                          <input
                            type='radio'
                            name='payment'
                            value='paypal'
                            checked={formData.paymentMethod === 'paypal'}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                paymentMethod: e.target.value,
                              })
                            }
                          />
                          <span className='w-5 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold'>
                            P
                          </span>
                          <span>PayPal</span>
                        </label>
                      </div>
                    </div>

                    <Button
                      type='button'
                      className='w-full'
                      size='lg'
                      onClick={handleSubmit}
                      disabled={submitting || pricingLoading}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className='h-5 w-5 mr-2 animate-spin' />
                          {t('general.processing')}
                        </>
                      ) : (
                        <>
                          <Check className='h-5 w-5 mr-2' />
                          {t('reservation.confirm')}
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Récapitulatif */}
            <div className='lg:col-span-1'>
              <Card className='sticky top-24'>
                <CardHeader
                  className={language == 'ar' ? 'flex justify-end' : ''}
                >
                  <CardTitle className='flex items-center gap-2'>
                    {language === 'ar' ? (
                      <>
                        {t('reservation.recap')}
                        <CreditCard className='h-5 w-5' />
                      </>
                    ) : (
                      <>
                        <CreditCard className='h-5 w-5' />
                        {t('reservation.recap')}
                      </>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  {pricingLoading ? (
                    <div className='flex items-center justify-center py-8'>
                      <Loader2 className='h-6 w-6 animate-spin' />
                      <span className='ml-2'>{t('general.calculating')}</span>
                    </div>
                  ) : (
                    <div className='space-y-3'>
                      <div
                        className={
                          'flex justify-between text-sm ' +
                          (language === 'ar' ? '[direction:ltr]' : '')
                        }
                      >
                        <span>{t('reservation.price_per_day')}</span>
                        <span>{displayPrice.toFixed(1)}€</span>
                      </div>
                      <div
                        className={
                          'flex justify-between text-sm ' +
                          (language === 'ar' ? '[direction:ltr]' : '')
                        }
                      >
                        <span>{t('reservation.number_of_days')}</span>
                        <span>{days}</span>
                      </div>
                      <div
                        className={
                          'flex justify-between text-sm ' +
                          (language === 'ar' ? '[direction:ltr]' : '')
                        }
                      >
                        <span>{t('reservation.subtotal')}</span>
                        <span>{totalPrice.toFixed(1)}€</span>
                      </div>
                      <div
                        className={
                          'flex justify-between text-sm ' +
                          (language === 'ar' ? '[direction:ltr]' : '')
                        }
                      >
                        <span>{t('reservation.payment_fee')}</span>
                        <span>{totalFees.toFixed(1)}€</span>
                      </div>
                      <div
                        className={
                          'flex justify-between text-sm ' +
                          (language === 'ar' ? '[direction:ltr]' : '')
                        }
                      >
                        <span>{t('reservation.deposit')}</span>
                        <span>{deposit}€</span>
                      </div>
                      <div
                        className={
                          'border-t pt-3 ' +
                          (language === 'ar' ? '[direction:ltr]' : '')
                        }
                      >
                        <div className='flex justify-between font-semibold text-lg'>
                          <span>{t('reservation.total_amount')}</span>
                          <span>{totalToPay.toFixed(1)}€</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className='bg-blue-50 p-4 rounded-lg'>
                    <div
                      className={
                        'flex items-start gap-2' +
                        (language === 'ar' ? ' justify-end' : '')
                      }
                    >
                      {language === 'ar' ? (
                        <>
                          <div className='text-sm'>
                            <p className='font-medium text-blue-900 mb-1'>
                              {t('reservation.included_protection')}
                            </p>
                            <p className='text-blue-700'>
                              {t('reservation.insurance_description')}
                            </p>
                          </div>
                          <Shield className='h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0' />
                        </>
                      ) : (
                        <>
                          <Shield className='h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0' />
                          <div className='text-sm'>
                            <p className='font-medium text-blue-900 mb-1'>
                              {t('reservation.included_protection')}
                            </p>
                            <p className='text-blue-700'>
                              {t('reservation.insurance_description')}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className='text-xs text-gray-500 text-center'>
                    {t('reservation.confirmation_message')}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default Rent
