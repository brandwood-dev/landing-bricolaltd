
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Calendar,
  MapPin,
  Star,
  Clock,
  Phone,
  Mail,
  Flag,
  Eye,
  Upload,
  Download,
  User,
  EyeOff,
  Copy,
  Check,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { generateRentalContract } from '@/utils/contractGenerator'
import RequestsAndReservationsFilters from './RequestsAndReservationsFilters'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { useLanguage } from '@/contexts/LanguageContext'
import { bookingService } from '@/services/bookingService'
import { Booking, BookingStatus } from '@/types/bridge'

// Extended type for UI display purposes
interface ReservationDisplay {
  id: string
  referenceId: string
  toolName: string
  toolDescription: string
  toolImage: string
  owner: string
  ownerEmail: string
  ownerPhone: string
  startDate: string
  endDate: string
  status: BookingStatus
  price: number
  dailyPrice: number
  location: string
  validationCode?: string
  hasActiveClaim?: boolean
  cancellationReason?: string
  cancellationMessage?: string
  renterHasReturned?: boolean
  hasUsedReturnButton?: boolean
}

const Reservations = () => {
  const [showValidationCode, setShowValidationCode] = useState<{
    [key: string]: boolean
  }>({})
  const [copiedCode, setCopiedCode] = useState<{ [key: string]: boolean }>({})
  const [cancellationReason, setCancellationReason] = useState('')
  const [cancellationMessage, setCancellationMessage] = useState('')
  const [reportReason, setReportReason] = useState('')
  const [reportMessage, setReportMessage] = useState('')
  const [claimType, setClaimType] = useState('')
  const [claimDescription, setClaimDescription] = useState('')
  const [rating, setRating] = useState(0)
  const [reviewComment, setReviewComment] = useState('')
  const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false)
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)
  const [isClaimDialogOpen, setIsClaimDialogOpen] = useState(false)
  const [selectedReservationId, setSelectedReservationId] = useState('')
  const [filteredReservations, setFilteredReservations] = useState<
    ReservationDisplay[]
  >([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(5)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const { t, language } = useLanguage()

  // Transform API bookings to reservation display format
  const [reservations, setReservations] = useState<ReservationDisplay[]>([])

  const transformBookingToReservation = (booking: Booking): ReservationDisplay => {
    return {
      id: booking.id,
      referenceId: `RES-${booking.id}`,
      toolName: booking.tool?.title || t('general.tool_not_specified'),
      toolDescription: booking.tool?.description || '',
      toolImage: booking.tool?.photos?.[0]?.url || 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=300&fit=crop',
      owner: `${booking.tool?.owner?.firstName || ''} ${booking.tool?.owner?.lastName || ''}`.trim() || t('general.unknown_owner'),
      ownerEmail: booking.tool?.owner?.email || '',
      ownerPhone: booking.tool?.owner?.phone || '',
      startDate: booking.startDate,
      endDate: booking.endDate,
      status: booking.status,
      price: booking.totalAmount || 0,
      dailyPrice: booking.basePrice || 0,
      location: booking.tool?.pickupAddress || t('general.location_not_specified'),
      validationCode: `VAL-${booking.id.slice(-6).toUpperCase()}`,
      hasActiveClaim: false,
      cancellationReason: undefined,
      cancellationMessage: booking.message,
      renterHasReturned: false,
      hasUsedReturnButton: false
    }
  }

  // API data loading
  const loadBookings = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await bookingService.getUserBookings({
        page: 1,
        limit: 100,
      })
      // Service now handles API response structure correctly
      const bookingsData = response.data || []
      const transformedReservations = bookingsData.map(transformBookingToReservation)
      setReservations(transformedReservations)
      setBookings(bookingsData)
    } catch (err: any) {
      setError(err.message || t('reservation.load_error'))
      setReservations([])
      setBookings([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBookings()
  }, [])

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800'
      case BookingStatus.CONFIRMED:
      case BookingStatus.APPROVED:
        return 'bg-green-100 text-green-800'
      case BookingStatus.COMPLETED:
        return 'bg-emerald-100 text-emerald-800'
      case BookingStatus.CANCELLED:
      case BookingStatus.REJECTED:
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.PENDING:
        return t('booking.status.pending')
      case BookingStatus.CONFIRMED:
      case BookingStatus.APPROVED:
        return t('booking.status.confirmed')
      case BookingStatus.COMPLETED:
        return t('booking.status.completed')
      case BookingStatus.CANCELLED:
        return t('booking.status.cancelled')
      case BookingStatus.REJECTED:
        return t('booking.status.rejected')
      default:
        return status
    }
  }

  const isCancellationAllowed = (startDate: string) => {
    const today = new Date()
    const start = new Date(startDate)
    today.setHours(0, 0, 0, 0)
    start.setHours(0, 0, 0, 0)
    return today < start
  }

  const handleCancelReservation = async (reservationId: string) => {
    if (!cancellationReason) {
      toast({
        title: t('general.error'),
        description: t('reservation.cancel.reason_required'),
        variant: 'destructive',
      })
      return
    }

    try {
      const response = await bookingService.cancelBooking(reservationId, cancellationReason)

      setReservations((prev) =>
        prev.map((res) =>
          res.id === reservationId
            ? {
                ...res,
                status: BookingStatus.CANCELLED,
                cancellationReason,
                cancellationMessage,
              }
            : res
        )
      )

      toast({
        title: t('booking.cancelled'),
        description: t('booking.cancelled_message'),
      })

      setCancellationReason('')
      setCancellationMessage('')
    } catch (error: any) {
      toast({
        title: t('general.error'),
        description: error.message || t('reservation.cancel.error'),
        variant: 'destructive',
      })
    }
  }

  const handleDownloadContract = (reservation: ReservationDisplay) => {
    const contractData = {
      referenceId: reservation.referenceId,
      toolName: reservation.toolName,
      toolDescription: reservation.toolDescription,
      ownerName: reservation.owner,
      ownerEmail: reservation.ownerEmail,
      ownerPhone: reservation.ownerPhone,
      renterName: 'Jean Dupont', // TODO: Get from user context
      renterEmail: 'jean.dupont@email.com',
      renterPhone: '+33 6 12 34 56 78',
      startDate: reservation.startDate,
      endDate: reservation.endDate,
      dailyPrice: reservation.dailyPrice,
      totalPrice: reservation.price,
      location: reservation.location,
    }

    generateRentalContract(contractData)
    toast({
      title: t('contract.downloaded'),
      description: t('contract.downloaded_message'),
    })
  }

  const handleReturnTool = async (reservationId: string) => {
    try {
      const response = await bookingService.returnTool(reservationId)
      
      setReservations((prev) =>
        prev.map((res) =>
          res.id === reservationId
            ? { ...res, status: 'completed', renterHasReturned: true, hasUsedReturnButton: true }
            : res
        )
      )

      toast({
        title: t('tool.returned'),
        description: t('tool.returned_message'),
      })

      setIsReturnDialogOpen(false)
    } catch (error: any) {
      toast({
        title: t('general.error'),
        description: error.message || t('tool.return_error'),
        variant: 'destructive',
      })
    }
  }

  const handleSubmitReview = async (reservationId: string) => {
    if (rating === 0) {
      toast({
        title: t('general.error'),
        description: t('review.rating_required'),
        variant: 'destructive',
      })
      return
    }

    try {
      await bookingService.submitReview(reservationId, {
        rating,
        comment: reviewComment,
      })

      toast({
        title: t('review.submitted'),
        description: t('review.submitted_message'),
      })

      setRating(0)
      setReviewComment('')
      setIsReviewDialogOpen(false)
    } catch (error: any) {
      toast({
        title: t('general.error'),
        description: error.message || t('review.submit_error'),
        variant: 'destructive',
      })
    }
  }

  const handleSubmitClaim = async (reservationId: string) => {
    if (!claimType || !claimDescription) {
      toast({
        title: t('general.error'),
        description: t('claim.fields_required'),
        variant: 'destructive',
      })
      return
    }

    try {
      await bookingService.submitClaim(reservationId, {
        type: claimType,
        description: claimDescription,
      })

      setReservations((prev) =>
        prev.map((res) =>
          res.id === reservationId ? { ...res, hasActiveClaim: true } : res
        )
      )

      toast({
        title: t('claim.submitted'),
        description: t('claim.submitted_message'),
      })

      setClaimType('')
      setClaimDescription('')
      setIsClaimDialogOpen(false)
    } catch (error: any) {
      toast({
        title: t('general.error'),
        description: error.message || t('claim.submit_error'),
        variant: 'destructive',
      })
    }
  }

  const handleSubmitReport = async (reservationId: string) => {
    if (!reportReason) {
      toast({
        title: t('general.error'),
        description: t('report.reason_required'),
        variant: 'destructive',
      })
      return
    }

    try {
      await bookingService.reportUser(reservationId, {
        reason: reportReason,
        message: reportMessage,
      })

      toast({
        title: t('report.submitted'),
        description: t('report.submitted_message'),
      })

      setReportReason('')
      setReportMessage('')
    } catch (error: any) {
      toast({
        title: t('general.error'),
        description: error.message || t('report.submit_error'),
        variant: 'destructive',
      })
    }
  }

  const toggleValidationCode = (reservationId: string) => {
    setShowValidationCode((prev) => ({
      ...prev,
      [reservationId]: !prev[reservationId],
    }))
  }

  const copyValidationCode = (code: string, reservationId: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode((prev) => ({ ...prev, [reservationId]: true }))
    setTimeout(() => {
      setCopiedCode((prev) => ({ ...prev, [reservationId]: false }))
    }, 2000)
    toast({
      title: t('general.copied'),
      description: t('validation_code.copied'),
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US')
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(language === 'fr' ? 'fr-FR' : 'en-US', {
      style: 'currency',
      currency: 'EUR',
    }).format(price)
  }

  // Pagination logic
  const totalPages = Math.ceil(filteredReservations.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentReservations = filteredReservations.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">{t('navigation.reservations')}</h2>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">{t('general.loading')}</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">{t('navigation.reservations')}</h2>
        </div>
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={loadBookings}>{t('general.retry')}</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t('navigation.reservations')}</h2>
      </div>

      <RequestsAndReservationsFilters
        data={reservations}
        onFilteredDataChange={setFilteredReservations}
        type="reservations"
      />

      {currentReservations.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {t('reservation.no_reservations')}
              </h3>
              <p className="text-muted-foreground">
                {t('reservation.no_reservations_message')}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {currentReservations.map((reservation) => (
              <Card key={reservation.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Tool Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={reservation.toolImage}
                        alt={reservation.toolName}
                        className="w-full lg:w-32 h-32 object-cover rounded-lg"
                      />
                    </div>

                    {/* Reservation Details */}
                    <div className="flex-1 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-semibold">
                            {reservation.toolName}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {reservation.toolDescription}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {t('general.reference')}: {reservation.referenceId}
                          </p>
                        </div>
                        <Badge className={getStatusColor(reservation.status)}>
                          {getStatusText(reservation.status)}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {formatDate(reservation.startDate)} -{' '}
                            {formatDate(reservation.endDate)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{reservation.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{reservation.owner}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{reservation.ownerEmail}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{reservation.ownerPhone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">
                            {formatPrice(reservation.price)}
                          </span>
                          <span className="text-muted-foreground">
                            ({formatPrice(reservation.dailyPrice)}/{t('general.day')})
                          </span>
                        </div>
                      </div>

                      {/* Validation Code */}
                      {reservation.validationCode &&
                        (reservation.status === BookingStatus.CONFIRMED ||
                          reservation.status === BookingStatus.APPROVED) && (
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">
                                  {t('validation_code.title')}:
                                </span>
                                {showValidationCode[reservation.id] ? (
                                  <code className="bg-white px-2 py-1 rounded text-sm font-mono">
                                    {reservation.validationCode}
                                  </code>
                                ) : (
                                  <span className="text-sm text-muted-foreground">
                                    ••••••
                                  </span>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    toggleValidationCode(reservation.id)
                                  }
                                >
                                  {showValidationCode[reservation.id] ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </Button>
                                {showValidationCode[reservation.id] && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      copyValidationCode(
                                        reservation.validationCode!,
                                        reservation.id
                                      )
                                    }
                                  >
                                    {copiedCode[reservation.id] ? (
                                      <Check className="h-4 w-4 text-green-600" />
                                    ) : (
                                      <Copy className="h-4 w-4" />
                                    )}
                                  </Button>
                                )}
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {t('validation_code.description')}
                            </p>
                          </div>
                        )}

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2">
                        {/* Download Contract */}
                        {(reservation.status === BookingStatus.CONFIRMED ||
                          reservation.status === BookingStatus.APPROVED ||
                          reservation.status === BookingStatus.COMPLETED) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadContract(reservation)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            {t('contract.download')}
                          </Button>
                        )}

                        {/* Cancel Reservation */}
                        {reservation.status === BookingStatus.PENDING &&
                          isCancellationAllowed(reservation.startDate) && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                  {t('booking.cancel')}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    {t('reservation.cancel.title')}
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    {t('reservation.cancel.description')}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <label className="text-sm font-medium">
                                      {t('reservation.cancel.reason')} *
                                    </label>
                                    <Select
                                      value={cancellationReason}
                                      onValueChange={setCancellationReason}
                                    >
                                      <SelectTrigger>
                                        <SelectValue
                                          placeholder={t(
                                            'reservation.cancel.select_reason'
                                          )}
                                        />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="schedule_conflict">
                                          {t('reservation.cancel.reasons.schedule_conflict')}
                                        </SelectItem>
                                        <SelectItem value="no_longer_needed">
                                          {t('reservation.cancel.reasons.no_longer_needed')}
                                        </SelectItem>
                                        <SelectItem value="found_alternative">
                                          {t('reservation.cancel.reasons.found_alternative')}
                                        </SelectItem>
                                        <SelectItem value="other">
                                          {t('reservation.cancel.reasons.other')}
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">
                                      {t('reservation.cancel.message')}
                                    </label>
                                    <Textarea
                                      value={cancellationMessage}
                                      onChange={(e) =>
                                        setCancellationMessage(e.target.value)
                                      }
                                      placeholder={t(
                                        'reservation.cancel.message_placeholder'
                                      )}
                                    />
                                  </div>
                                </div>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>
                                    {t('general.cancel')}
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleCancelReservation(reservation.id)
                                    }
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    {t('reservation.cancel.confirm')}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}

                        {/* Return Tool */}
                        {reservation.status === BookingStatus.CONFIRMED &&
                          !reservation.renterHasReturned &&
                          !reservation.hasUsedReturnButton && (
                            <AlertDialog
                              open={isReturnDialogOpen}
                              onOpenChange={setIsReturnDialogOpen}
                            >
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    setSelectedReservationId(reservation.id)
                                  }
                                >
                                  <Upload className="h-4 w-4 mr-2" />
                                  {t('tool.return')}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    {t('tool.return_title')}
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    {t('tool.return_description')}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>
                                    {t('general.cancel')}
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleReturnTool(selectedReservationId)
                                    }
                                  >
                                    {t('tool.confirm_return')}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}

                        {/* Submit Review */}
                        {reservation.status === BookingStatus.COMPLETED && (
                          <Dialog
                            open={isReviewDialogOpen}
                            onOpenChange={setIsReviewDialogOpen}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  setSelectedReservationId(reservation.id)
                                }
                              >
                                <Star className="h-4 w-4 mr-2" />
                                {t('review.submit')}
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>{t('review.title')}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <label className="text-sm font-medium">
                                    {t('review.rating')} *
                                  </label>
                                  <div className="flex gap-1 mt-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        className={`p-1 ${
                                          star <= rating
                                            ? 'text-yellow-400'
                                            : 'text-gray-300'
                                        }`}
                                      >
                                        <Star className="h-6 w-6 fill-current" />
                                      </button>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">
                                    {t('review.comment')}
                                  </label>
                                  <Textarea
                                    value={reviewComment}
                                    onChange={(e) =>
                                      setReviewComment(e.target.value)
                                    }
                                    placeholder={t('review.comment_placeholder')}
                                  />
                                </div>
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    onClick={() => setIsReviewDialogOpen(false)}
                                  >
                                    {t('general.cancel')}
                                  </Button>
                                  <Button
                                    onClick={() =>
                                      handleSubmitReview(selectedReservationId)
                                    }
                                  >
                                    {t('review.submit')}
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}

                        {/* Submit Claim */}
                        {(reservation.status === BookingStatus.CONFIRMED ||
                          reservation.status === BookingStatus.COMPLETED) &&
                          !reservation.hasActiveClaim && (
                            <Dialog
                              open={isClaimDialogOpen}
                              onOpenChange={setIsClaimDialogOpen}
                            >
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    setSelectedReservationId(reservation.id)
                                  }
                                >
                                  <Flag className="h-4 w-4 mr-2" />
                                  {t('claim.submit')}
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>{t('claim.title')}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <label className="text-sm font-medium">
                                      {t('claim.type')} *
                                    </label>
                                    <Select
                                      value={claimType}
                                      onValueChange={setClaimType}
                                    >
                                      <SelectTrigger>
                                        <SelectValue
                                          placeholder={t('claim.select_type')}
                                        />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="damage">
                                          {t('claim.types.damage')}
                                        </SelectItem>
                                        <SelectItem value="missing_parts">
                                          {t('claim.types.missing_parts')}
                                        </SelectItem>
                                        <SelectItem value="not_as_described">
                                          {t('claim.types.not_as_described')}
                                        </SelectItem>
                                        <SelectItem value="other">
                                          {t('claim.types.other')}
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">
                                      {t('claim.description')} *
                                    </label>
                                    <Textarea
                                      value={claimDescription}
                                      onChange={(e) =>
                                        setClaimDescription(e.target.value)
                                      }
                                      placeholder={t(
                                        'claim.description_placeholder'
                                      )}
                                    />
                                  </div>
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      variant="outline"
                                      onClick={() => setIsClaimDialogOpen(false)}
                                    >
                                      {t('general.cancel')}
                                    </Button>
                                    <Button
                                      onClick={() =>
                                        handleSubmitClaim(selectedReservationId)
                                      }
                                    >
                                      {t('claim.submit')}
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}

                        {/* Report User */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setSelectedReservationId(reservation.id)
                              }
                            >
                              <Flag className="h-4 w-4 mr-2" />
                              {t('report.user')}
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>{t('report.title')}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <label className="text-sm font-medium">
                                  {t('report.reason')} *
                                </label>
                                <Select
                                  value={reportReason}
                                  onValueChange={setReportReason}
                                >
                                  <SelectTrigger>
                                    <SelectValue
                                      placeholder={t('report.select_reason')}
                                    />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="inappropriate_behavior">
                                      {t('report.reasons.inappropriate_behavior')}
                                    </SelectItem>
                                    <SelectItem value="fraud">
                                      {t('report.reasons.fraud')}
                                    </SelectItem>
                                    <SelectItem value="spam">
                                      {t('report.reasons.spam')}
                                    </SelectItem>
                                    <SelectItem value="other">
                                      {t('report.reasons.other')}
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <label className="text-sm font-medium">
                                  {t('report.message')}
                                </label>
                                <Textarea
                                  value={reportMessage}
                                  onChange={(e) =>
                                    setReportMessage(e.target.value)
                                  }
                                  placeholder={t('report.message_placeholder')}
                                />
                              </div>
                              <div className="flex justify-end gap-2">
                                <Button variant="outline">
                                  {t('general.cancel')}
                                </Button>
                                <Button
                                  onClick={() =>
                                    handleSubmitReport(selectedReservationId)
                                  }
                                  variant="destructive"
                                >
                                  {t('report.submit')}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>

                      {/* Cancellation Info */}
                      {reservation.status === BookingStatus.CANCELLED &&
                        reservation.cancellationReason && (
                          <div className="bg-red-50 p-3 rounded-lg">
                            <p className="text-sm font-medium text-red-800">
                              {t('reservation.cancelled_reason')}:
                            </p>
                            <p className="text-sm text-red-700">
                              {reservation.cancellationReason}
                            </p>
                            {reservation.cancellationMessage && (
                              <p className="text-sm text-red-600 mt-1">
                                {reservation.cancellationMessage}
                              </p>
                            )}
                          </div>
                        )}

                      {/* Active Claim Info */}
                      {reservation.hasActiveClaim && (
                        <div className="bg-orange-50 p-3 rounded-lg">
                          <p className="text-sm font-medium text-orange-800">
                            {t('claim.active')}
                          </p>
                          <p className="text-sm text-orange-700">
                            {t('claim.active_message')}
                          </p>
                        </div>
                      )}

                      {/* Return Status */}
                      {reservation.renterHasReturned && (
                        <div className="bg-green-50 p-3 rounded-lg">
                          <p className="text-sm font-medium text-green-800">
                            {t('tool.returned_status')}
                          </p>
                          <p className="text-sm text-green-700">
                            {t('tool.returned_status_message')}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationPrevious
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => handlePageChange(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  )}
                  <PaginationNext
                    onClick={() =>
                      handlePageChange(Math.min(totalPages, currentPage + 1))
                    }
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Reservations
