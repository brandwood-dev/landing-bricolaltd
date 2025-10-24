import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { StripeProvider } from '@/contexts/StripeContext'

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
import PaymentForm from '@/components/payment/PaymentForm'
import { toolsService } from '@/services/toolsService'
import { bookingService } from '@/services/bookingService'
import { getActiveCountries } from '@/services/countriesService'

import { Tool } from '@/types/bridge/tool.types'
import {
  CreateBookingData,
  BookingPricing,
  Booking,
} from '@/types/bridge/booking.types'
import { Country } from '@/types/bridge/common.types'
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  CreditCard,
  Shield,
  Check,
  Loader2,
  Star,
  MapPin,
  User,
  Info,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { PriceDisplay } from '@/components/PriceDisplay'
import { OptimizedPriceDisplay } from '@/components/OptimizedPriceDisplay'
import { useCurrencyOptimized } from '@/hooks/useCurrencyOptimized'
import { RateFetchTrigger } from '@/types/currency'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { PaymentMethod } from '@/types/bridge'
const API_BASE_URL = import.meta.env.VITE_BASE_URL
  ? `${import.meta.env.VITE_BASE_URL}`
  : 'http://localhost:4000/api'
// Interface pour les données persistées
interface PersistedFormData {
  startDate: Date | null
  endDate: Date | null
  pickupHour: string
  message: string
  paymentMethod: 'card' | 'google_pay' | 'apple_pay'
  renterInfo?: {
    firstName: string
    lastName: string
    phone: string
    phone_prefix: string
  }
  timestamp: number
}

const Rent: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { t, language } = useLanguage()
  const { toast } = useToast()
  const { refreshRates } = useCurrencyOptimized()

  // États existants
  const [tool, setTool] = useState<Tool | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [unavailableDates, setUnavailableDates] = useState<Date[]>([])
  const [confirmedDates, setConfirmedDates] = useState<Date[]>([])
  const [pendingDates, setPendingDates] = useState<Date[]>([])
  const [inProgressDates, setInProgressDates] = useState<Date[]>([])
  const [existingBookings, setExistingBookings] = useState<Booking[]>([])
  const [pricing, setPricing] = useState<BookingPricing | null>(null)
  const [countries, setCountries] = useState<Country[]>([])

  // États du formulaire
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [pickupHour, setPickupHour] = useState<string>('09:00')
  const [formData, setFormData] = useState({
    message: '',
    paymentMethod: 'card' as 'card' | 'google_pay' | 'apple_pay',
  })

  // États pour le nouveau flux de paiement
  const [pendingBookingData, setPendingBookingData] =
    useState<CreateBookingData | null>(null)

  // Fonction pour générer la clé de stockage unique
  const getStorageKey = (toolId: string, userId?: string): string => {
    return `rent_form_${toolId}_${userId || 'anonymous'}`
  }

  // Fonction pour sauvegarder les données dans localStorage
  const saveFormData = () => {
    if (!id) return

    const dataToSave: PersistedFormData = {
      startDate,
      endDate,
      pickupHour,
      message: formData.message,
      paymentMethod: formData.paymentMethod,
      timestamp: Date.now(),
    }

    try {
      const storageKey = getStorageKey(id, user?.id)
      localStorage.setItem(storageKey, JSON.stringify(dataToSave))
    } catch (error) {
      console.warn('Failed to save form data to localStorage:', error)
    }
  }

  // Fonction pour restaurer les données depuis localStorage
  const restoreFormData = () => {
    if (!id) return

    try {
      const storageKey = getStorageKey(id, user?.id)
      const savedData = localStorage.getItem(storageKey)

      if (savedData) {
        const parsedData: PersistedFormData = JSON.parse(savedData)

        // Vérifier que les données ne sont pas trop anciennes (24h max)
        const maxAge = 24 * 60 * 60 * 1000 // 24 heures en millisecondes
        if (Date.now() - parsedData.timestamp > maxAge) {
          localStorage.removeItem(storageKey)
          return
        }

        // Restaurer les données
        if (parsedData.startDate) {
          setStartDate(new Date(parsedData.startDate))
        }
        if (parsedData.endDate) {
          setEndDate(new Date(parsedData.endDate))
        }
        setPickupHour(parsedData.pickupHour || '09:00')
        setFormData((prev) => ({
          ...prev,
          message: parsedData.message || '',
          paymentMethod: parsedData.paymentMethod || 'card',
        }))

        console.log('Form data restored from localStorage')
      }
    } catch (error) {
      console.warn('Failed to restore form data from localStorage:', error)
    }
  }

  // Fonction pour nettoyer les données sauvegardées
  const clearSavedFormData = () => {
    if (!id) return

    try {
      const storageKey = getStorageKey(id, user?.id)
      localStorage.removeItem(storageKey)
    } catch (error) {
      console.warn('Failed to clear saved form data:', error)
    }
  }

  // Fonction pour nettoyer les données d'autres outils
  const clearOtherToolsData = (currentToolId: string, userId?: string) => {
    try {
      const prefix = `rent_form_`
      const currentKey = getStorageKey(currentToolId, userId)

      // Parcourir toutes les clés localStorage
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i)
        if (key && key.startsWith(prefix) && key !== currentKey) {
          localStorage.removeItem(key)
        }
      }
    } catch (error) {
      console.warn('Failed to clear other tools data:', error)
    }
  }

  // useEffect pour restaurer les données au chargement
  useEffect(() => {
    if (id && !loading) {
      restoreFormData()
      clearOtherToolsData(id, user?.id)
    }
  }, [id, user?.id, loading])

  // useEffect pour sauvegarder automatiquement les données
  useEffect(() => {
    if (!loading && id) {
      saveFormData()
    }
  }, [
    startDate,
    endDate,
    pickupHour,
    formData.message,
    formData.paymentMethod,
    id,
    user?.id,
    loading,
  ])

  // useEffect pour nettoyer lors de la navigation vers d'autres pages (sauf Checkout)
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Ne pas nettoyer si on va vers la page de checkout
      const isGoingToCheckout = location.pathname.includes('/checkout')
      if (!isGoingToCheckout) {
        clearSavedFormData()
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      // Ne pas nettoyer automatiquement au démontage du composant
      // car cela pourrait interférer avec la navigation vers checkout
    }
  }, [location.pathname, id, user?.id])

  // États supplémentaires pour la gestion des réservations
  const [bookingDates, setBookingDates] = useState<{
    confirmed: Date[]
    pending: Date[]
    inProgress: Date[]
  }>({ confirmed: [], pending: [], inProgress: [] })
  const [pricingLoading, setPricingLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null)
  const [loadingCountries, setLoadingCountries] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const countriesData = await getActiveCountries()
        setCountries(countriesData)
      } catch (error) {
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
    value: country.phone_prefix,
    label: `${country.phone_prefix} (${country.name})`,
    flag: country.code.toLowerCase(),
  }))

  // Fetch existing bookings for the tool
  const fetchExistingBookings = async (toolId: string) => {
    try {
      // Récupérer le token d'authentification
      const token = localStorage.getItem('authToken')

      // Si pas de token, utiliser les dates mock
      if (!token) {
        const mockUnavailableDates = [
          '2024-01-15',
          '2024-01-16',
          '2024-01-20',
          '2024-01-25',
          '2024-02-01',
          '2024-02-02',
          '2024-02-10',
        ]
        const dates = mockUnavailableDates.map((dateStr) => new Date(dateStr))
        setUnavailableDates(dates)
        return
      }

      // Récupérer les réservations existantes depuis l'API avec authentification
      const response = await fetch(
        `${API_BASE_URL}/bookings/tool/${toolId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch existing bookings')
      }

      const result = await response.json()
      const bookings = result.data || []

      setExistingBookings(bookings)

      // Organiser les dates par statut
      const confirmedDates: Date[] = []
      const pendingDates: Date[] = []
      const inProgressDates: Date[] = []
      const allUnavailableDates: Date[] = []

      bookings.forEach((booking: any) => {
        const startDate = new Date(booking.startDate)
        const endDate = new Date(booking.endDate)

        // Générer toutes les dates entre startDate et endDate
        const currentDate = new Date(startDate)
        while (currentDate <= endDate) {
          const dateToAdd = new Date(currentDate)
          allUnavailableDates.push(dateToAdd)

          if (
            booking.status === 'confirmed' ||
            booking.status === 'in_progress'
          ) {
            confirmedDates.push(new Date(dateToAdd))
          } else if (
            booking.status === 'pending' ||
            booking.status === 'accepted'
          ) {
            pendingDates.push(new Date(dateToAdd))
          }

          if (booking.status === 'in_progress') {
            inProgressDates.push(new Date(dateToAdd))
          }

          currentDate.setDate(currentDate.getDate() + 1)
        }
      })

      setBookingDates({
        confirmed: confirmedDates,
        pending: pendingDates,
        inProgress: inProgressDates,
      })
      setUnavailableDates(allUnavailableDates)
    } catch (error) {
      // En cas d'erreur, utiliser des dates mock pour le développement
      const mockUnavailableDates = [
        '2024-01-15',
        '2024-01-16',
        '2024-01-20',
        '2024-01-25',
        '2024-02-01',
        '2024-02-02',
        '2024-02-10',
      ]
      const dates = mockUnavailableDates.map((dateStr) => new Date(dateStr))
      setUnavailableDates(dates)
    }
  }

  // Fetch tool data
  const fetchTool = async () => {
    if (!id) return

    try {
      setLoading(true)
      const toolData = await toolsService.getTool(id)
      setTool(toolData)

      // Récupérer les réservations existantes
      await fetchExistingBookings(id)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch tool data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTool()
    // Déclencher la récupération des taux de change pour la page de location
    refreshRates(RateFetchTrigger.RENT_PAGE_ENTRY)
  }, [id, refreshRates])

  // useEffect(() => {
  //   if (!user) {
  //     navigate('/login', { state: { from: location } })
  //   }
  // }, [user, navigate])

  const isDateUnavailable = (date: Date) => {
    return unavailableDates.some(
      (unavailable) => date.toDateString() === unavailable.toDateString()
    )
  }

  // Fonctions pour vérifier les différents types de dates
  const isDateConfirmed = (date: Date) => {
    return bookingDates.confirmed.some(
      (confirmedDate) => date.toDateString() === confirmedDate.toDateString()
    )
  }

  const isDatePending = (date: Date) => {
    return bookingDates.pending.some(
      (pendingDate) => date.toDateString() === pendingDate.toDateString()
    )
  }

  const isDateInProgress = (date: Date) => {
    return bookingDates.inProgress.some(
      (inProgressDate) => date.toDateString() === inProgressDate.toDateString()
    )
  }

  // Fonction pour vérifier si la sélection dépasse 5 jours
  const isDateExceeding5Days = (date: Date, referenceDate: Date) => {
    const diffTime = Math.abs(date.getTime() - referenceDate.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1
    return diffDays > 5
  }

  // Fonction pour vérifier si une période contient des dates indisponibles
  const isPeriodUnavailable = (start: Date, end: Date) => {
    const currentDate = new Date(start)
    while (currentDate <= end) {
      if (isDateUnavailable(currentDate)) {
        return true
      }
      currentDate.setDate(currentDate.getDate() + 1)
    }
    return false
  }

  // Fonction personnalisée pour setStartDate avec validation
  const handleStartDateChange = (date: Date | undefined) => {
    setStartDate(date)
    // Si la nouvelle date de début est postérieure à la date de fin, réinitialiser la date de fin
    if (date && endDate && date > endDate) {
      setEndDate(undefined)
    }
  }

  // Fonction personnalisée pour setEndDate avec validation de période
  const handleEndDateChange = (date: Date | undefined) => {
    if (date && startDate) {
      // Vérifier si la période contient des dates indisponibles
      if (isPeriodUnavailable(startDate, date)) {
        toast({
          title: 'Période non disponible',
          description:
            'La période sélectionnée contient des dates déjà réservées. Veuillez choisir une autre période.',
          variant: 'destructive',
        })
        return
      }
    }
    setEndDate(date)
  }

  const calculateDays = () => {
    if (!startDate || !endDate) return 0
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1
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
      // Fallback to manual calculation
      const days = calculateDays()
      const basePrice = tool.basePrice
      const subtotal = Number(basePrice) * Number(days)
      const fees = Number(subtotal) * 0.06 // 6% fees
      const deposit = tool.depositAmount
      setPricing({
        toolId: tool.id,
        basePrice,
        totalDays: days,
        subtotal,
        taxes: fees,
        deposit,
        totalAmount: Number(subtotal) + Number(fees) + Number(deposit),
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        serviceFee: fees,
        currency: 'EUR',
        breakdown: {
          dailyRate: Number(basePrice),
          numberOfDays: days,
          subtotal: Number(subtotal),
          serviceFeePercentage: 17,
          serviceFeeAmount: Number(fees),
          taxPercentage: 6,
          taxAmount: Number(basePrice) * 0.06,
          depositAmount: Number(deposit),
        },
      })
    } finally {
      setPricingLoading(false)
    }
  }

  useEffect(() => {
    fetchPricing()
  }, [tool, startDate, endDate])

  // Get all photo URLs with primary photo first
  const getAllPhotoUrls = (tool: Tool) => {
    if (tool.photos && tool.photos.length > 0) {
      // Sort photos to put primary photo first
      const sortedPhotos = [...tool.photos].sort((a, b) => {
        if (a.isPrimary) return -1
        if (b.isPrimary) return 1
        return 0
      })
      return sortedPhotos.map((photo) => photo.url)
    }
    return ['https://picsum.photos/800/600?random=990&tool']
  }

  // Carousel navigation functions
  const nextImage = () => {
    if (!tool) return
    const allPhotos = getAllPhotoUrls(tool)
    setCurrentImageIndex((prev) => (prev + 1) % allPhotos.length)
  }

  const prevImage = () => {
    if (!tool) return
    const allPhotos = getAllPhotoUrls(tool)
    setCurrentImageIndex(
      (prev) => (prev - 1 + allPhotos.length) % allPhotos.length
    )
  }

  const goToImage = (index: number) => {
    setCurrentImageIndex(index)
  }

  // Pricing values with fallbacks and validation
  const basePrice = Math.max(
    Number(pricing?.basePrice || tool?.basePrice) || 25,
    0
  )
  const days = Math.max(Number(pricing?.totalDays || calculateDays()) || 1, 1)
  const totalPrice = Math.max(Number(pricing?.subtotal) || basePrice * days, 0)
  const totalFees = Math.max(Number(pricing?.taxes) || totalPrice * 0.06, 0)
  const deposit = Math.max(
    Number(pricing?.deposit) || tool?.depositAmount || 0,
    0
  )
  const displayPrice = basePrice
  const totalToPay = Math.max(
    Number(pricing?.totalAmount) || totalPrice + totalFees + deposit,
    0
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation des dates
    if (!startDate || !endDate) {
      toast({
        title: t('errors.validation_error'),
        description:
          'Veuillez sélectionner les dates de début et de fin de location',
        variant: 'destructive',
      })
      return
    }

    if (startDate > endDate) {
      toast({
        title: t('errors.validation_error'),
        description:
          'La date de début ne peut pas être postérieure à la date de fin',
        variant: 'destructive',
      })
      return
    }

    // Vérifier la durée de location (maximum 5 jours) - Validation stricte
    const daysDifference = calculateDays()

    if (daysDifference > 5) {
      toast({
        title: t('errors.validation_error'),
        description: `La durée de location ne peut pas dépasser 5 jours consécutifs. Vous avez sélectionné ${daysDifference} jours.`,
        variant: 'destructive',
      })
      return
    }

    // Vérifier qu'aucune date de la période n'est réservée ou indisponible
    const currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      if (isDateUnavailable(currentDate)) {
        toast({
          title: t('errors.validation_error'),
          description:
            'Une ou plusieurs dates de la période sélectionnée sont indisponibles',
          variant: 'destructive',
        })
        return
      }
      if (isDateConfirmed(currentDate)) {
        toast({
          title: t('errors.validation_error'),
          description:
            'Une ou plusieurs dates de la période sélectionnée sont déjà confirmées',
          variant: 'destructive',
        })
        return
      }
      if (isDatePending(currentDate)) {
        toast({
          title: t('errors.validation_error'),
          description:
            'Une ou plusieurs dates de la période sélectionnée sont en attente de confirmation',
          variant: 'destructive',
        })
        return
      }
      if (isDateInProgress(currentDate)) {
        toast({
          title: t('errors.validation_error'),
          description:
            'Une ou plusieurs dates de la période sélectionnée sont actuellement en cours de location',
          variant: 'destructive',
        })
        return
      }
      currentDate.setDate(currentDate.getDate() + 1)
    }

    // Vérifier la disponibilité de l'outil pour toute la période
    if (isPeriodUnavailable(startDate, endDate)) {
      toast({
        title: t('errors.validation_error'),
        description:
          "La période sélectionnée contient des dates non disponibles. Veuillez choisir d'autres dates.",
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

      // Validate totalPrice
      if (!totalToPay || isNaN(totalToPay) || totalToPay <= 0) {
        toast({
          title: t('errors.validation_error'),
          description: 'Le prix total est invalide. Veuillez réessayer.',
          variant: 'destructive',
        })
        return
      }

      // Préparer les données de réservation (sans créer la réservation encore)
      const bookingData: CreateBookingData = {
        toolId: tool.id,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        pickupHour: formData.pickupHour,
        paymentMethod: formData.paymentMethod === 'card' ? PaymentMethod.CARD : 
                      formData.paymentMethod === 'google_pay' ? PaymentMethod.GOOGLE_PAY : 
                      PaymentMethod.APPLE_PAY,
        message: formData.message || undefined,
        renterId: user?.id!,
        ownerId: tool.ownerId,
        totalPrice: totalToPay,
      }

      // Stocker les données pour les utiliser après le paiement
      setPendingBookingData(bookingData)
      console.log('🔍 Booking data prepared:', bookingData)

      toast({
        title: 'Données validées!',
        description:
          'Veuillez procéder au paiement pour confirmer votre réservation.',
        duration: 3000,
        className: 'bg-blue-50 border-blue-200 text-blue-800',
      })

      // Afficher le formulaire de paiement
      setShowPayment(true)
      console.log('🔍 ShowPayment set to true')
    } catch (err: any) {
      // Function to get user-friendly error message
      const getErrorMessage = (error: any) => {
        const errorMessage =
          error.response?.data?.message || error.message || ''

        // Check for specific error types
        if (
          errorMessage.includes(
            'Tool is already booked for the requested dates'
          )
        ) {
          return {
            title: 'Outil non disponible',
            description:
              "Cet outil est déjà réservé pour les dates sélectionnées. Veuillez choisir d'autres dates.",
          }
        }

        if (
          errorMessage.includes('validation') ||
          errorMessage.includes('Invalid')
        ) {
          return {
            title: 'Erreur de validation',
            description:
              'Les informations saisies ne sont pas valides. Veuillez vérifier vos données.',
          }
        }

        if (
          errorMessage.includes('payment') ||
          errorMessage.includes('Payment')
        ) {
          return {
            title: 'Erreur de paiement',
            description:
              'Un problème est survenu lors du traitement du paiement. Veuillez réessayer.',
          }
        }

        if (
          errorMessage.includes('unauthorized') ||
          errorMessage.includes('Unauthorized')
        ) {
          return {
            title: 'Accès non autorisé',
            description:
              'Vous devez être connecté pour effectuer cette action.',
          }
        }

        if (
          errorMessage.includes('not found') ||
          errorMessage.includes('Not found')
        ) {
          return {
            title: 'Outil introuvable',
            description:
              "L'outil sélectionné n'existe plus ou n'est plus disponible.",
          }
        }

        // Default error message
        return {
          title: 'Erreur lors de la réservation',
          description:
            "Une erreur inattendue s'est produite. Veuillez réessayer dans quelques instants.",
        }
      }

      const errorInfo = getErrorMessage(err)

      toast({
        title: errorInfo.title,
        description: errorInfo.description,
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
    <StripeProvider>
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
                  <CardHeader
                    className={language === 'ar' ? 'justify-end' : ''}
                  >
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
                      {/* Dates de location */}
                      <div className='space-y-4'>
                        <h3 className='font-semibold text-lg'>
                          {t('reservation.rental_period')}
                        </h3>

                        {/* Légende du calendrier */}
                        <div className='bg-blue-50 p-4 rounded-lg'>
                          <h4 className='font-medium text-sm mb-3 flex items-center gap-2'>
                            <Info className='h-4 w-4' />
                            {t('calendar.legend')}
                          </h4>
                          <div className='grid grid-cols-2 gap-3 text-xs'>
                            <div className='flex items-center gap-2'>
                              <div className='w-4 h-4 bg-red-600 rounded'></div>
                              <span>{t('calendar.reserved_in_progress')}</span>
                            </div>
                            <div className='flex items-center gap-2'>
                              <div className='w-4 h-4 bg-orange-500 rounded'></div>
                              <span>{t('calendar.pending_accepted')}</span>
                            </div>
                            <div className='flex items-center gap-2'>
                              <AlertCircle className='h-4 w-4 text-amber-600' />
                              <span>{t('calendar.max_5_days')}</span>
                            </div>
                          </div>
                        </div>

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
                                  onSelect={handleStartDateChange}
                                  disabled={(date) => {
                                    return (
                                      date < new Date() ||
                                      isDateUnavailable(date) ||
                                      isDateConfirmed(date) ||
                                      isDatePending(date) ||
                                      isDateInProgress(date)
                                    )
                                  }}
                                  modifiers={{
                                    unavailable: unavailableDates,
                                    confirmed: (date) => isDateConfirmed(date),
                                    pending: (date) => isDatePending(date),
                                    inProgress: (date) =>
                                      isDateInProgress(date),
                                  }}
                                  modifiersStyles={{
                                    unavailable: {
                                      backgroundColor: '#d1d5db',
                                      color: '#6b7280',
                                      textDecoration: 'line-through',
                                    },
                                    confirmed: {
                                      backgroundColor: '#dc2626',
                                      color: 'white',
                                      fontWeight: 'bold',
                                    },
                                    pending: {
                                      backgroundColor: '#f97316',
                                      color: 'white',
                                      fontWeight: 'bold',
                                    },
                                    inProgress: {
                                      backgroundColor: '#7c2d12',
                                      color: 'white',
                                      fontWeight: 'bold',
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
                                  disabled={!startDate}
                                  className={cn(
                                    'w-full justify-start text-left font-normal',
                                    !endDate && 'text-muted-foreground',
                                    !startDate &&
                                      'opacity-50 cursor-not-allowed'
                                  )}
                                >
                                  <CalendarIcon className='mr-2 h-4 w-4' />
                                  {endDate
                                    ? format(endDate, 'PPP', { locale: fr })
                                    : startDate
                                    ? t('reservation.select_date')
                                    : "Sélectionnez d'abord une date de début"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className='w-auto p-0'>
                                <Calendar
                                  mode='single'
                                  selected={endDate}
                                  onSelect={handleEndDateChange}
                                  disabled={(date) => {
                                    if (!startDate) {
                                      return true
                                    }

                                    if (
                                      date < startDate ||
                                      isDateUnavailable(date) ||
                                      isDateConfirmed(date) ||
                                      isDatePending(date) ||
                                      isDateInProgress(date)
                                    ) {
                                      return true
                                    }

                                    // Disable dates that would exceed 5 days rental period
                                    const diffTime = Math.abs(
                                      date.getTime() - startDate.getTime()
                                    )
                                    const diffDays =
                                      Math.floor(
                                        diffTime / (1000 * 60 * 60 * 24)
                                      ) + 1
                                    if (diffDays > 5) {
                                      return true
                                    }

                                    // Disable if the period between startDate and this date contains unavailable dates
                                    if (isPeriodUnavailable(startDate, date)) {
                                      return true
                                    }

                                    return false
                                  }}
                                  modifiers={{
                                    unavailable: unavailableDates,
                                    confirmed: (date) => isDateConfirmed(date),
                                    pending: (date) => isDatePending(date),
                                    inProgress: (date) =>
                                      isDateInProgress(date),
                                    exceeding: (date) =>
                                      startDate &&
                                      isDateExceeding5Days(startDate, date),
                                  }}
                                  modifiersStyles={{
                                    unavailable: {
                                      backgroundColor: '#d1d5db',
                                      color: '#6b7280',
                                      textDecoration: 'line-through',
                                    },
                                    confirmed: {
                                      backgroundColor: '#dc2626',
                                      color: 'white',
                                      fontWeight: 'bold',
                                    },
                                    pending: {
                                      backgroundColor: '#f97316',
                                      color: 'white',
                                      fontWeight: 'bold',
                                    },
                                    inProgress: {
                                      backgroundColor: '#7c2d12',
                                      color: 'white',
                                      fontWeight: 'bold',
                                    },
                                    exceeding: {
                                      backgroundColor: '#fef3c7',
                                      color: '#d97706',
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
                          <Label htmlFor='pickupHour'>
                            {t('reservation.pickup_time')}
                          </Label>
                          <Select
                            value={formData.pickupHour}
                            onValueChange={(value) =>
                              setFormData({ ...formData, pickupHour: value })
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
                            setFormData({
                              ...formData,
                              message: e.target.value,
                            })
                          }
                        />
                      </div>

                      {/* Error Messages */}
                      {error && (
                        <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
                          <div className='flex items-center'>
                            <div className='flex-shrink-0'>
                              <svg
                                className='h-5 w-5 text-red-400'
                                viewBox='0 0 20 20'
                                fill='currentColor'
                              >
                                <path
                                  fillRule='evenodd'
                                  d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                                  clipRule='evenodd'
                                />
                              </svg>
                            </div>
                            <div className='ml-3'>
                              <p className='text-sm text-red-800'>{error}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Mode de paiement : Carte bancaire / Google Pay / Apple Pay */}
                      <div className='space-y-4'>
                        <h3 className='font-semibold text-lg'>
                          {t('reservation.payment_method')}
                        </h3>
                        <div className='space-y-3'>
                          {/* Carte bancaire */}
                          <div 
                            className={cn(
                              'flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors',
                              formData.paymentMethod === 'card' 
                                ? 'bg-blue-50 border-blue-200' 
                                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                            )}
                            onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'card' }))}
                          >
                            <input
                              type="radio"
                              name="paymentMethod"
                              value="card"
                              checked={formData.paymentMethod === 'card'}
                              onChange={() => setFormData(prev => ({ ...prev, paymentMethod: 'card' }))}
                              className="h-4 w-4 text-blue-600"
                            />
                            <CreditCard className='h-5 w-5 text-blue-600' />
                            <span className='font-medium text-blue-800'>
                              {t('reservation.card')}
                            </span>
                            {formData.paymentMethod === 'card' && (
                              <span className='ml-auto text-sm text-blue-600'>
                                Sélectionné
                              </span>
                            )}
                          </div>

                          {/* Google Pay */}
                          <div 
                            className={cn(
                              'flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors',
                              formData.paymentMethod === 'google_pay' 
                                ? 'bg-green-50 border-green-200' 
                                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                            )}
                            onClick={() => {
                              setFormData(prev => ({ ...prev, paymentMethod: 'google_pay' }))
                              toast({
                                title: "Non disponible",
                                description: "Google Pay n'est pas encore disponible.",
                                variant: "destructive"
                              })
                            }}
                          >
                            <input
                              type="radio"
                              name="paymentMethod"
                              value="google_pay"
                              checked={formData.paymentMethod === 'google_pay'}
                              onChange={() => {
                                setFormData(prev => ({ ...prev, paymentMethod: 'google_pay' }))
                                toast({
                                  title: "Non disponible",
                                  description: "Google Pay n'est pas encore disponible.",
                                  variant: "destructive"
                                })
                              }}
                              className="h-4 w-4 text-green-600"
                            />
                            <svg className="h-5 w-5 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12.426 21.996c-.897 0-1.626-.729-1.626-1.626s.729-1.626 1.626-1.626 1.626.729 1.626 1.626-.729 1.626-1.626 1.626zm-6.426-3.252c-.897 0-1.626-.729-1.626-1.626s.729-1.626 1.626-1.626 1.626.729 1.626 1.626-.729 1.626-1.626 1.626zm12.852 0c-.897 0-1.626-.729-1.626-1.626s.729-1.626 1.626-1.626 1.626.729 1.626 1.626-.729 1.626-1.626 1.626z"/>
                            </svg>
                            <span className='font-medium text-green-800'>
                              Google Pay
                            </span>
                            {formData.paymentMethod === 'google_pay' && (
                              <span className='ml-auto text-sm text-green-600'>
                                Sélectionné
                              </span>
                            )}
                          </div>

                          {/* Apple Pay */}
                          <div 
                            className={cn(
                              'flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors',
                              formData.paymentMethod === 'apple_pay' 
                                ? 'bg-gray-900 border-gray-700 text-white' 
                                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                            )}
                            onClick={() => {
                              setFormData(prev => ({ ...prev, paymentMethod: 'apple_pay' }))
                              toast({
                                title: "Non disponible",
                                description: "Apple Pay n'est pas encore disponible.",
                                variant: "destructive"
                              })
                            }}
                          >
                            <input
                              type="radio"
                              name="paymentMethod"
                              value="apple_pay"
                              checked={formData.paymentMethod === 'apple_pay'}
                              onChange={() => {
                                setFormData(prev => ({ ...prev, paymentMethod: 'apple_pay' }))
                                toast({
                                  title: "Non disponible",
                                  description: "Apple Pay n'est pas encore disponible.",
                                  variant: "destructive"
                                })
                              }}
                              className="h-4 w-4 text-gray-600"
                            />
                            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.84 2.82c.73-.87 1.22-2.07 1.08-3.27-1.05.04-2.32.7-3.08 1.58-.68.78-1.27 2.04-1.11 3.24 1.17.09 2.37-.6 3.11-1.55"/>
                            </svg>
                            <span className={cn(
                              'font-medium',
                              formData.paymentMethod === 'apple_pay' ? 'text-white' : 'text-gray-800'
                            )}>
                              Apple Pay
                            </span>
                            {formData.paymentMethod === 'apple_pay' && (
                              <span className='ml-auto text-sm text-gray-300'>
                                Sélectionné
                              </span>
                            )}
                          </div>

                          {formData.paymentMethod === 'card' && (
                            <p className='text-sm text-gray-600'>
                              Le formulaire de paiement apparaîtra après
                              validation de vos informations.
                            </p>
                          )}
                        </div>
                      </div>
                     
                    </form>
                  </CardContent>
                </Card>

                {/* PaymentForm affiché après validation du formulaire */}
                {showPayment && pendingBookingData && (
                  <div className='mt-6'>
                    <Card>
                      <CardHeader>
                        <CardTitle className='flex items-center gap-2'>
                          <CreditCard className='h-5 w-5' />
                          Paiement de la réservation
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <PaymentForm
                          amount={totalToPay}
                          bookingId='pending' // Temporaire, sera remplacé après création
                          paymentMethod={formData.paymentMethod}
                          onPaymentSuccess={async () => {
                            try {
                              // Créer la réservation après paiement réussi
                              const booking =
                                await bookingService.createBooking(
                                  pendingBookingData
                                )
                              console.log(
                                '🔍 Booking created after payment:',
                                booking
                              )

                              // Nettoyer les données
                              setPendingBookingData(null)
                              setShowPayment(false)
                              clearSavedFormData()

                              toast({
                                title: 'Paiement effectué avec succès!',
                                description:
                                  'Votre réservation a été confirmée.',
                                className:
                                  'bg-green-50 border-green-200 text-green-800',
                              })

                              navigate('/profile?tab=reservations')
                            } catch (error: any) {
                              toast({
                                title:
                                  'Erreur lors de la création de la réservation',
                                description:
                                  "Le paiement a été effectué mais la réservation n'a pas pu être créée. Contactez le support.",
                                variant: 'destructive',
                              })
                            }
                          }}
                          onPaymentError={(error) => {
                            toast({
                              title: 'Erreur lors du paiement',
                              description: error,
                              variant: 'destructive',
                            })
                            // Optionnel: revenir au formulaire
                            // setShowPayment(false)
                          }}
                        />
                      </CardContent>
                    </Card>
                  </div>
                )}
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
                          <span>
                            <OptimizedPriceDisplay
                              price={displayPrice}
                              baseCurrency={tool?.baseCurrencyCode || 'GBP'}
                              size='sm'
                            />
                          </span>
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
                          <span>
                            <OptimizedPriceDisplay
                              price={totalPrice}
                              baseCurrency={tool?.baseCurrencyCode || 'GBP'}
                              size='sm'
                            />
                          </span>
                        </div>
                        <div
                          className={
                            'flex justify-between text-sm ' +
                            (language === 'ar' ? '[direction:ltr]' : '')
                          }
                        >
                          <span>{t('reservation.payment_fee')}</span>
                          <span>
                            <OptimizedPriceDisplay
                              price={totalFees}
                              baseCurrency={tool?.baseCurrencyCode || 'GBP'}
                              size='sm'
                            />
                          </span>
                        </div>
                        <div
                          className={
                            'flex justify-between text-sm ' +
                            (language === 'ar' ? '[direction:ltr]' : '')
                          }
                        >
                          <span>{t('reservation.deposit')}</span>
                          <span>
                            <OptimizedPriceDisplay
                              price={deposit}
                              baseCurrency={tool?.baseCurrencyCode || 'GBP'}
                              size='sm'
                            />
                          </span>
                        </div>
                        <div
                          className={
                            'border-t pt-3 ' +
                            (language === 'ar' ? '[direction:ltr]' : '')
                          }
                        >
                          <div className='flex justify-between font-semibold text-lg'>
                            <span>{t('reservation.total_amount')}</span>
                            <span>
                              <OptimizedPriceDisplay
                                price={totalToPay}
                                baseCurrency={tool?.baseCurrencyCode || 'GBP'}
                                size='lg'
                                cible='totalPrice'
                              />
                            </span>
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

                    <Button
                      type='button'
                      className='w-full'
                      size='lg'
                      onClick={handleSubmit}
                      disabled={submitting || pricingLoading || showPayment}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className='h-5 w-5 mr-2 animate-spin' />
                          {t('general.processing')}
                        </>
                      ) : showPayment ? (
                        <>
                          <Check className='h-5 w-5 mr-2' />
                          Données validées - Procédez au paiement
                        </>
                      ) : (
                        <>
                          <Check className='h-5 w-5 mr-2' />
                          {t('reservation.confirm')}
                        </>
                      )}
                    </Button>

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
    </StripeProvider>
  )
}

export default Rent
