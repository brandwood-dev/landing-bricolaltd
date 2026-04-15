import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { OptimizedPriceDisplay } from '@/components/OptimizedPriceDisplay'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { useToast } from '@/hooks/use-toast'
import { bookingService } from '@/services/bookingService'
import { disputeService } from '@/services/disputeService'
import { reviewsService } from '@/services/reviewsService'
import { Booking } from '@/types/bridge'
import { ToolCondition } from '@/types/bridge/enums'
import {
  generateRentalContractAr,
  generateRentalContractFr,
} from '@/utils/contractGenerator'
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Check,
  Clock,
  Copy,
  Download,
  Eye,
  EyeOff,
  Flag,
  Loader2,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Star,
  Upload,
  User,
} from 'lucide-react'

type BookingHistoryEntry = {
  action: string
  timestamp: string
  user: string
  notes?: string
}

type BookingDetailsRecord = Booking & {
  acceptedAt?: string
  cancelledAt?: string
  refundAmount?: number
  refundReason?: string
}

type ClaimMode = 'renter' | 'owner'
type ReviewMode = 'tool' | 'app'

const BookingDetails = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { t, language } = useLanguage()
  const { toast } = useToast()

  const [booking, setBooking] = useState<BookingDetailsRecord | null>(null)
  const [history, setHistory] = useState<BookingHistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [cancellationReason, setCancellationReason] = useState('')
  const [cancellationMessage, setCancellationMessage] = useState('')
  const [refusalReason, setRefusalReason] = useState('')
  const [refusalMessage, setRefusalMessage] = useState('')
  const [validationCodeInput, setValidationCodeInput] = useState('')
  const [showValidationCode, setShowValidationCode] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)
  const [claimReason, setClaimReason] = useState('')
  const [claimMessage, setClaimMessage] = useState('')
  const [claimFiles, setClaimFiles] = useState<File[]>([])
  const [claimMode, setClaimMode] = useState<ClaimMode>('renter')
  const [reviewMode, setReviewMode] = useState<ReviewMode>('tool')
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewComment, setReviewComment] = useState('')
  const [hasReviewedApp, setHasReviewedApp] = useState(false)
  const [hasReviewedTool, setHasReviewedTool] = useState(false)

  const [isCancelOpen, setIsCancelOpen] = useState(false)
  const [isRejectOpen, setIsRejectOpen] = useState(false)
  const [isClaimOpen, setIsClaimOpen] = useState(false)
  const [isReviewOpen, setIsReviewOpen] = useState(false)

  const sourceTab =
    (location.state as { sourceTab?: 'requests' | 'reservations' } | null)
      ?.sourceTab || null

  const getPrimaryPhoto = (currentBooking: BookingDetailsRecord | null) => {
    const photos = currentBooking?.tool?.photos || []
    const primary = photos.find((photo: any) => photo.isPrimary)
    return (
      primary?.url ||
      photos[0]?.url ||
      'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&h=600&fit=crop'
    )
  }

  const getOwnerDetails = (currentBooking: BookingDetailsRecord | null) => {
    const owner = currentBooking?.owner || currentBooking?.tool?.owner
    return {
      id: owner?.id || currentBooking?.ownerId || '',
      fullName:
        `${owner?.firstName || ''} ${owner?.lastName || ''}`.trim() ||
        t('general.unknown_owner'),
      email: owner?.email || '',
      phone: owner?.phoneNumber || '',
      address: owner?.address || '',
    }
  }

  const getRenterDetails = (currentBooking: BookingDetailsRecord | null) => {
    const renter = currentBooking?.renter
    return {
      id: renter?.id || currentBooking?.renterId || '',
      fullName:
        `${renter?.firstName || ''} ${renter?.lastName || ''}`.trim() ||
        t('general.unknown_renter'),
      email: renter?.email || '',
      phone: renter?.phoneNumber || '',
      address: renter?.address || '',
    }
  }

  const ownerDetails = getOwnerDetails(booking)
  const renterDetails = getRenterDetails(booking)
  const toolImage = getPrimaryPhoto(booking)
  const toolId = booking?.tool?.id || booking?.toolId || ''
  const backHref = sourceTab
    ? `/profile?tab=${sourceTab}`
    : booking && user?.id === booking.ownerId
    ? '/profile?tab=requests'
    : booking && user?.id === booking.renterId
    ? '/profile?tab=reservations'
    : '/profile'

  const isOwner = !!booking && user?.id === booking.ownerId
  const isRenter = !!booking && user?.id === booking.renterId
  const isParticipant = isOwner || isRenter

  const pickupDateTime = useMemo(() => {
    if (!booking?.startDate) return null
    const pickupDate = new Date(booking.startDate)
    if (booking.pickupHour) {
      const [hours, minutes] = booking.pickupHour.split(':').map(Number)
      pickupDate.setHours(hours || 0, minutes || 0, 0, 0)
    } else {
      pickupDate.setHours(0, 0, 0, 0)
    }
    return pickupDate
  }, [booking])

  const isStartDateReached = useMemo(() => {
    if (!booking?.startDate) return false
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const start = new Date(booking.startDate)
    start.setHours(0, 0, 0, 0)
    return start.getTime() <= today.getTime()
  }, [booking?.startDate])

  const acceptedCancellationHasFullRefund = useMemo(() => {
    if (!pickupDateTime) return false
    const now = new Date()
    const diffHours = (pickupDateTime.getTime() - now.getTime()) / 36e5
    return diffHours >= 24
  }, [pickupDateTime])

  const formatToolCondition = useCallback(
    (condition?: ToolCondition | string | number) => {
      if (!condition) return '-'

      // Prefer the existing translations used in Add Tool flow.
      switch (condition) {
        case ToolCondition.NEW:
          return t('add_tool.condition_new')
        case ToolCondition.EXCELLENT:
          return t('add_tool.condition_excellent')
        case ToolCondition.GOOD:
          return t('add_tool.condition_good')
        case ToolCondition.FAIR:
          return t('add_tool.condition_fair')
        case ToolCondition.POOR:
          return t('add_tool.condition_poor')
        default:
          return String(condition)
      }
    },
    [t]
  )

  const formatHistoryActor = useCallback(
    (actor: string) => {
      return t(`booking.history.actor.${actor}`) || actor
    },
    [t]
  )

  const formatHistoryAction = useCallback(
    (action: string) => {
      return t(`booking.history.action.${action}`) || action
    },
    [t]
  )

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800'
      case 'ONGOING':
        return 'bg-blue-100 text-blue-800'
      case 'COMPLETED':
        return 'bg-emerald-100 text-emerald-800'
      case 'CANCELLED':
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const refreshDetails = useCallback(async () => {
    if (!id) return

    try {
      setLoading(true)
      setError(null)

      const [bookingData, historyData] = await Promise.all([
        bookingService.getBooking(id),
        bookingService.getBookingHistory(id).catch(() => []),
      ])

      const normalizedBooking = bookingData as BookingDetailsRecord
      setBooking(normalizedBooking)
      setHistory(historyData)

      if (user?.id) {
        const reviewTasks = [
          reviewsService
            .checkUserAppReview(user.id)
            .then((result) => setHasReviewedApp(!!result.hasReviewed))
            .catch(() => setHasReviewedApp(false)),
        ]

        if (normalizedBooking.renterId === user.id) {
          reviewTasks.push(
            reviewsService
              .getToolReviewsByUserId(user.id)
              .then((reviews) =>
                setHasReviewedTool(
                  reviews.some((review) => review.bookingId === normalizedBooking.id)
                )
              )
              .catch(() => setHasReviewedTool(false))
          )
        } else {
          setHasReviewedTool(false)
        }

        await Promise.all(reviewTasks)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load booking details')
    } finally {
      setLoading(false)
    }
  }, [id, user?.id])

  useEffect(() => {
    void refreshDetails()
  }, [refreshDetails])

  const runAction = async (action: () => Promise<void>) => {
    try {
      setActionLoading(true)
      await action()
      await refreshDetails()
    } finally {
      setActionLoading(false)
    }
  }

  const showSuccess = (title: string, description: string) => {
    toast({
      title,
      description,
      duration: 5000,
      className: 'bg-green-50 border-green-200 text-green-800',
    })
  }

  const showError = (description: string) => {
    toast({
      title: t('general.error'),
      description,
      variant: 'destructive',
    })
  }

  const handleAccept = async () => {
    if (!booking) return

    await runAction(async () => {
      await bookingService.acceptBooking(booking.id)
      showSuccess(t('request.accepted.title'), t('request.accepted.message'))
    })
  }

  const handleReject = async () => {
    if (!booking) return
    if (!refusalReason) {
      showError(t('validation.fill_all_fields'))
      return
    }

    await runAction(async () => {
      await bookingService.rejectBooking(booking.id, refusalReason, refusalMessage)
      setIsRejectOpen(false)
      setRefusalReason('')
      setRefusalMessage('')
      showSuccess(t('request.refuse'), t('requests.owner_reject_refund_policy'))
    })
  }

  const handleCancel = async () => {
    if (!booking) return
    if (!cancellationReason) {
      showError(t('reservation.cancel.reason'))
      return
    }

    await runAction(async () => {
      await bookingService.cancelBooking(
        booking.id,
        cancellationReason,
        cancellationMessage
      )
      setIsCancelOpen(false)
      setCancellationReason('')
      setCancellationMessage('')
      showSuccess(
        t('success.reservation.cancelled.title'),
        booking.status === 'ACCEPTED' && !acceptedCancellationHasFullRefund
          ? t('success.reservation.cancelled.no_refund')
          : t('success.reservation.cancelled.refund_full')
      )
    })
  }

  const handleValidateCode = async () => {
    if (!booking) return
    if (!validationCodeInput.trim()) {
      showError(t('request.validation_code_empty_message'))
      return
    }

    await runAction(async () => {
      await bookingService.validateBookingCode(booking.id, validationCodeInput.trim())
      setValidationCodeInput('')
      showSuccess(
        t('request.validation_code_accepted'),
        t('request.validation_code_accepted_message')
      )
    })
  }

  const handleConfirmReturn = async () => {
    if (!booking) return

    await runAction(async () => {
      await bookingService.confirmToolReturn(booking.id)
      showSuccess(
        t('success.tool.return.confirmed.title'),
        t('success.tool.return.confirmed.message')
      )
    })
  }

  const handleConfirmPickup = async () => {
    if (!booking) return

    await runAction(async () => {
      await bookingService.confirmPickup(booking.id)
      showSuccess(t('pickup.confirmed.title'), t('pickup.confirmed.message'))
    })
  }

  const handleSubmitClaim = async () => {
    if (!booking || !user?.id) return
    if (!claimReason || !claimMessage.trim()) {
      showError(t('validation.fill_all_fields'))
      return
    }

    await runAction(async () => {
      await disputeService.createDispute(
        {
          userId: user.id,
          bookingId: booking.id,
          reason: claimReason,
          description: claimMessage,
          reportReason: claimReason,
          reportMessage: claimMessage,
        },
        claimFiles
      )

      if (claimMode === 'owner') {
        await bookingService.updateBookingStatus(booking.id, {
          status: 'ONGOING',
          pickupTool: true,
        })
      }

      setIsClaimOpen(false)
      setClaimReason('')
      setClaimMessage('')
      setClaimFiles([])
      showSuccess(t('success.report.sent.title'), t('success.report.sent.message'))
    })
  }

  const handleSubmitReview = async () => {
    if (!booking || !user?.id) return
    if (reviewRating < 1 || reviewComment.trim().length < 3) {
      showError(t('review.error_message'))
      return
    }

    await runAction(async () => {
      if (reviewMode === 'app') {
        await reviewsService.createAppReview({
          rating: reviewRating,
          comment: reviewComment.trim(),
          reviewerId: user.id,
        })
        setHasReviewedApp(true)
      } else {
        await reviewsService.createToolReview({
          bookingId: booking.id,
          toolId: booking.toolId,
          reviewerId: user.id,
          revieweeId: booking.ownerId,
          rating: reviewRating,
          comment: reviewComment.trim(),
        })
        setHasReviewedTool(true)
      }

      setIsReviewOpen(false)
      setReviewRating(0)
      setReviewComment('')
      showSuccess(t('review.success'), t('review.success_message'))
    })
  }

  const handleCopyValidationCode = async () => {
    if (!booking?.validationCode) return

    try {
      await navigator.clipboard.writeText(booking.validationCode)
      setCopiedCode(true)
      toast({
        title: t('code.copied'),
        description: t('code.copied_message'),
      })
      window.setTimeout(() => setCopiedCode(false), 2000)
    } catch {
      showError(t('booking.details.copy_code_error'))
    }
  }

  const handleDownloadContract = () => {
    if (!booking) return

    const contractData = {
      referenceId: `RES-${booking.id}`,
      toolId: booking.toolId,
      toolName: booking.tool?.title || t('general.tool_not_specified'),
      toolDescription: booking.tool?.description || '',
      toolBrand: booking.tool?.brand || '*******',
      toolModel: booking.tool?.model || '*******',
      condition: booking.tool?.condition || 'NEW',
      ownerId: ownerDetails.id,
      ownerName: ownerDetails.fullName,
      ownerAddress: ownerDetails.address,
      ownerEmail: ownerDetails.email,
      ownerPhone: ownerDetails.phone,
      renterId: renterDetails.id,
      renterName: renterDetails.fullName,
      renterAddress: renterDetails.address,
      renterEmail: renterDetails.email,
      renterPhone: renterDetails.phone,
      startDate: booking.startDate,
      endDate: booking.endDate,
      pickupHour: booking.pickupHour,
      handoverLocation: booking.tool?.pickupAddress || '',
      returnLocation: booking.tool?.pickupAddress || '',
      rentalDuration: `${Math.max(
        Math.ceil(
          (new Date(booking.endDate).getTime() -
            new Date(booking.startDate).getTime()) /
            86400000
        ),
        1
      )} days`,
      totalPrice: booking.totalPrice,
      deposit: booking.tool?.depositAmount || 0,
    }

    if (language === 'ar') {
      generateRentalContractAr(contractData)
    } else {
      generateRentalContractFr(contractData)
    }

    showSuccess(
      t('booking.details.contract_downloaded_title'),
      t('booking.details.contract_downloaded_message')
    )
  }

  const handleCall = (phone?: string) => {
    if (!phone) return
    window.location.href = `tel:${phone}`
  }

  const handleEmail = (email?: string) => {
    if (!email) return
    window.location.href = `mailto:${email}`
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const validFiles = files.filter(
      (file) => file.type.startsWith('image/') && file.size <= 1024 * 1024
    )

    if (validFiles.length !== files.length) {
      showError(t('booking.details.image_upload_hint'))
    }

    setClaimFiles((prev) => [...prev, ...validFiles])
  }

  const removeClaimFile = (index: number) => {
    setClaimFiles((prev) => prev.filter((_, currentIndex) => currentIndex !== index))
  }

  const openClaimDialog = (mode: ClaimMode) => {
    setClaimMode(mode)
    setClaimReason('')
    setClaimMessage('')
    setClaimFiles([])
    setIsClaimOpen(true)
  }

  const openReviewDialog = (mode: ReviewMode) => {
    setReviewMode(mode)
    setReviewRating(0)
    setReviewComment('')
    setIsReviewOpen(true)
  }

  const claimReasonOptions =
    // Reuse existing translation keys used in Reservations/Requests dialogs.
    language === 'en'
      ? [
          { value: 'not-compliant', label: 'Tool not compliant with the listing' },
          { value: 'poor-condition', label: 'Tool in poor condition or defective' },
          { value: 'delay', label: 'Delay in delivery / pickup' },
          { value: 'unsafe', label: 'Dangerous / unsafe tool' },
          { value: 'inappropriate', label: 'Inappropriate behavior of the provider' },
          { value: 'fraud', label: 'Suspicion of scam or fraud' },
          { value: 'no-response', label: 'No response from the provider' },
          { value: 'wrong-contact', label: 'Incorrect / unreachable phone number' },
          { value: 'other', label: t('general.other') },
        ]
      : language === 'ar'
      ? [
          { value: 'not-compliant', label: 'الأداة غير مطابقة للإعلان' },
          { value: 'poor-condition', label: 'أداة في حالة سيئة أو معطلة' },
          { value: 'delay', label: 'تأخير في التسليم / الاستلام' },
          { value: 'unsafe', label: 'أداة خطرة / غير آمنة' },
          { value: 'inappropriate', label: 'سلوك غير لائق من المزود' },
          { value: 'fraud', label: 'شبهة احتيال أو نصب' },
          { value: 'no-response', label: 'لا يوجد رد من المزود' },
          { value: 'wrong-contact', label: 'رقم هاتف غير صحيح / لا يمكن الوصول إليه' },
          { value: 'other', label: t('general.other') },
        ]
      : [
          { value: 'not-compliant', label: "Outil non conforme à l'annonce" },
          { value: 'poor-condition', label: 'Outil en mauvais état ou défectueux' },
          { value: 'delay', label: 'Retard de livraison / récupération' },
          { value: 'inappropriate', label: 'Comportement inapproprié du propriétaire' },
          { value: 'fraud', label: "Suspicion d'arnaque ou fraude" },
          { value: 'no-response', label: 'Pas de réponse du propriétaire' },
          { value: 'wrong-contact', label: 'Numéro incorrect / injoignable' },
          { value: 'other', label: t('general.other') },
        ]

  const canAccept = isOwner && booking?.status === 'PENDING'
  const canReject = isOwner && booking?.status === 'PENDING'
  const canValidateCode = isOwner && booking?.status === 'ACCEPTED'
  const canConfirmPickup =
    isOwner &&
    booking?.status === 'ONGOING' &&
    booking?.renterHasReturned &&
    !booking?.pickupTool
  const canReportOwnerIssue =
    canConfirmPickup && !booking?.hasActiveClaim && !booking?.pickupTool
  const canCancel = isRenter && ['PENDING', 'ACCEPTED'].includes(booking?.status || '')
  const canDownloadContract =
    !!booking && ['ACCEPTED', 'ONGOING'].includes(booking.status)
  const canContact =
    !!booking && ['ACCEPTED', 'ONGOING'].includes(booking.status)
  const canReturnTool =
    isRenter && booking?.status === 'ONGOING' && !booking?.hasUsedReturnButton
  const canReportRenterIssue =
    isRenter && booking?.status === 'ACCEPTED' && !booking?.hasActiveClaim
  const canReviewTool =
    isRenter && booking?.status === 'COMPLETED' && !hasReviewedTool
  const canReviewApp = booking?.status === 'COMPLETED' && !hasReviewedApp

  return (
    <div className='min-h-screen bg-background'>
      <Header />
      <main className='py-10'>
        <div className='max-w-6xl mx-auto px-4 space-y-6'>
          <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
            <div className='space-y-1'>
              <Button
                variant='ghost'
                className='px-0'
                onClick={() => navigate(backHref)}
              >
                <ArrowLeft className='h-4 w-4 mr-2' />
                {t('booking.details.back_to_profile')}
              </Button>
              <h1 className='text-3xl font-bold tracking-tight'>
                {t('booking.details.title')}
              </h1>
              <p className='text-sm text-muted-foreground'>
                {t('general.reference')}: {booking ? `RES-${booking.id}` : '--'}
              </p>
            </div>

            {toolId && (
              <Button variant='outline' asChild>
                <Link to={`/tool/${toolId}`}>{t('booking.details.open_tool')}</Link>
              </Button>
            )}
          </div>

          {loading ? (
            <Card>
              <CardContent className='py-16 flex items-center justify-center gap-3'>
                <Loader2 className='h-5 w-5 animate-spin' />
                <span>{t('general.loading')}</span>
              </CardContent>
            </Card>
          ) : error ? (
            <Alert variant='destructive'>
              <AlertTriangle className='h-4 w-4' />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : !booking ? (
            <Alert variant='destructive'>
              <AlertDescription>{t('booking.details.not_found')}</AlertDescription>
            </Alert>
          ) : !isParticipant ? (
            <Alert variant='destructive'>
              <AlertDescription>{t('booking.details.no_access')}</AlertDescription>
            </Alert>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>{t('booking.details.summary')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='grid gap-6 lg:grid-cols-[1.4fr_1fr]'>
                    <div className='flex flex-col gap-4 md:flex-row'>
                      <Link
                        to={`/tool/${toolId}`}
                        className='block w-full md:w-72 h-56 overflow-hidden rounded-xl bg-muted'
                      >
                        <img
                          src={toolImage}
                          alt={booking.tool?.title || 'tool'}
                          className='w-full h-full object-cover hover:opacity-90 transition-opacity'
                        />
                      </Link>

                      <div className='flex-1 space-y-4'>
                        <div className='space-y-2'>
                          <div className='flex flex-wrap items-center gap-2'>
                            <Badge className={getStatusColor(booking.status)}>
                              {t(`status.${booking.status.toLowerCase()}`)}
                            </Badge>
                            {booking.hasActiveClaim && (
                              <Badge
                                variant='outline'
                                className='bg-orange-50 text-orange-800 border-orange-200'
                              >
                                {t('claim.in_progress')}
                              </Badge>
                            )}
                            {booking.renterHasReturned && !booking.pickupTool && (
                              <Badge
                                variant='outline'
                                className='bg-blue-50 text-blue-800 border-blue-200'
                              >
                                {t('booking.wait')}
                              </Badge>
                            )}
                            {booking.pickupTool && (
                              <Badge
                                variant='outline'
                                className='bg-blue-50 text-orange-800 border-orange-200'
                              >
                                {t('tool.returned')}
                              </Badge>
                            )}
                          </div>

                          <h2 className='text-2xl font-semibold'>
                            {booking.tool?.title || t('general.tool_not_specified')}
                          </h2>
                          <p className='text-muted-foreground'>
                            {booking.tool?.description || '-'}
                          </p>
                        </div>

                        <div className='grid gap-3 sm:grid-cols-2'>
                          <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                            <Calendar className='h-4 w-4' />
                            <span>
                              {t('general.from')} {booking.startDate} {t('general.to')}{' '}
                              {booking.endDate}
                            </span>
                          </div>
                          <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                            <User className='h-4 w-4' />
                            <span>
                              {t('booking.details.tool_brand_model')}: {booking.tool?.brand || '-'}
                              {booking.tool?.model ? ` ${booking.tool.model}` : ''}
                            </span>
                          </div>
                          <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                            <MessageSquare className='h-4 w-4' />
                            <span>
                              {t('booking.details.tool_condition')}:{' '}
                              {formatToolCondition(booking.tool?.condition)}
                            </span>
                          </div>
                          <div className='flex items-center gap-2 text-sm text-muted-foreground sm:col-span-2'>
                            <MapPin className='h-4 w-4' />
                            <span>
                              {t('booking.details.tool_category')}:{' '}
                              {booking.tool?.category?.displayName ||
                                booking.tool?.category?.name ||
                                '-'}
                              {'  '}|{'  '}
                              {t('booking.details.tool_subcategory')}:{' '}
                              {booking.tool?.subcategory?.displayName ||
                                booking.tool?.subcategory?.name ||
                                '-'}
                            </span>
                          </div>
                        </div>

                        {booking.status === 'ACCEPTED' && booking.validationCode && (
                          <div className='rounded-lg border border-blue-200 bg-blue-50 p-4 space-y-3'>
                            <div className='flex items-center justify-between gap-3'>
                              <div className='text-sm font-medium text-blue-900'>
                                {isOwner
                                  ? t('booking.details.generated_code')
                                  : t('booking.validation_code')}
                              </div>
                              {isRenter && (
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  disabled={!isStartDateReached}
                                  onClick={() => setShowValidationCode((prev) => !prev)}
                                >
                                  {showValidationCode ? (
                                    <>
                                      <EyeOff className='h-4 w-4 mr-1' />
                                      {t('general.hide')}
                                    </>
                                  ) : (
                                    <>
                                      <Eye className='h-4 w-4 mr-1' />
                                      {t('general.show')}
                                    </>
                                  )}
                                </Button>
                              )}
                            </div>

                            {isOwner && (
                              <div className='rounded-md bg-white p-3 border border-blue-200'>
                                <div className='font-mono text-xl font-bold tracking-widest'>
                                  {booking.validationCode}
                                </div>
                              </div>
                            )}

                            {isRenter && !showValidationCode && (
                              <p className='text-xs text-blue-700'>
                                {t('booking.details.pickup_ready')}
                              </p>
                            )}

                            {isRenter && showValidationCode && (
                              <div className='rounded-md bg-white p-3 border border-blue-200 space-y-2'>
                                <div className='flex items-center justify-between gap-3'>
                                  <div className='font-mono text-xl font-bold tracking-widest'>
                                    {booking.validationCode}
                                  </div>
                                  <Button
                                    variant='ghost'
                                    size='sm'
                                    onClick={handleCopyValidationCode}
                                  >
                                    {copiedCode ? (
                                      <>
                                        <Check className='h-4 w-4 mr-1' />
                                        {t('code.copied')}
                                      </>
                                    ) : (
                                      <>
                                        <Copy className='h-4 w-4 mr-1' />
                                        {t('booking.details.copy_code')}
                                      </>
                                    )}
                                  </Button>
                                </div>
                                <p className='text-xs text-blue-700'>
                                  {t('booking.present_code')}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <Card className='border-dashed'>
                      <CardHeader>
                        <CardTitle>{t('booking.details.actions')}</CardTitle>
                      </CardHeader>
                      <CardContent className='space-y-3'>
                        {canAccept && (
                          <Button
                            className='w-full'
                            onClick={() => void handleAccept()}
                            disabled={actionLoading}
                          >
                            {actionLoading && (
                              <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                            )}
                            {t('request.accept')}
                          </Button>
                        )}

                        {canReject && (
                          <Button
                            variant='outline'
                            className='w-full'
                            onClick={() => setIsRejectOpen(true)}
                            disabled={actionLoading}
                          >
                            {t('request.refuse')}
                          </Button>
                        )}

                        {canValidateCode && (
                          <div className='space-y-2'>
                            <Input
                              value={validationCodeInput}
                              onChange={(event) =>
                                setValidationCodeInput(event.target.value)
                              }
                              placeholder={t('request.enter_code')}
                            />
                            <Button
                              className='w-full'
                              onClick={() => void handleValidateCode()}
                              disabled={actionLoading}
                            >
                              {t('action.confirm')}
                            </Button>
                          </div>
                        )}

                        {canCancel && (
                          <Button
                            variant='outline'
                            className='w-full'
                            onClick={() => setIsCancelOpen(true)}
                            disabled={actionLoading}
                          >
                            {t('action.cancel')}
                          </Button>
                        )}

                        {canDownloadContract && (
                          <Button
                            variant='outline'
                            className='w-full'
                            onClick={handleDownloadContract}
                            disabled={actionLoading}
                          >
                            <Download className='h-4 w-4 mr-2' />
                            {t('general.download_contract')}
                          </Button>
                        )}

                        {canContact && (
                          <div className='grid grid-cols-2 gap-2'>
                            <Button
                              variant='outline'
                              onClick={() =>
                                handleCall(isOwner ? renterDetails.phone : ownerDetails.phone)
                              }
                            >
                              <Phone className='h-4 w-4 mr-2' />
                              {t('request.call')}
                            </Button>
                            <Button
                              variant='outline'
                              onClick={() =>
                                handleEmail(isOwner ? renterDetails.email : ownerDetails.email)
                              }
                            >
                              <Mail className='h-4 w-4 mr-2' />
                              {t('request.mail')}
                            </Button>
                          </div>
                        )}

                        {canReturnTool && (
                          <Button
                            variant='outline'
                            className='w-full'
                            onClick={() => void handleConfirmReturn()}
                            disabled={actionLoading}
                          >
                            {t('booking.tool_returned')}
                          </Button>
                        )}

                        {canReportRenterIssue && (
                          <Button
                            variant='outline'
                            className='w-full'
                            onClick={() => openClaimDialog('renter')}
                            disabled={actionLoading}
                          >
                            <Flag className='h-4 w-4 mr-2' />
                            {t('general.report')}
                          </Button>
                        )}

                        {canConfirmPickup && (
                          <Button
                            className='w-full'
                            onClick={() => void handleConfirmPickup()}
                            disabled={actionLoading}
                          >
                            {t('request.pickup_confirm_button')}
                          </Button>
                        )}

                        {canReportOwnerIssue && (
                          <Button
                            variant='outline'
                            className='w-full'
                            onClick={() => openClaimDialog('owner')}
                            disabled={actionLoading}
                          >
                            <Flag className='h-4 w-4 mr-2' />
                            {t('general.report')}
                          </Button>
                        )}

                        {canReviewTool && (
                          <Button
                            variant='outline'
                            className='w-full'
                            onClick={() => openReviewDialog('tool')}
                            disabled={actionLoading}
                          >
                            <Star className='h-4 w-4 mr-2' />
                            {t('booking.rate_tool')}
                          </Button>
                        )}

                        {canReviewApp && (
                          <Button
                            variant='outline'
                            className='w-full'
                            onClick={() => openReviewDialog('app')}
                            disabled={actionLoading}
                          >
                            <Star className='h-4 w-4 mr-2' />
                            {t('booking.rate_app')}
                          </Button>
                        )}

                        {!canAccept &&
                          !canReject &&
                          !canValidateCode &&
                          !canCancel &&
                          !canDownloadContract &&
                          !canContact &&
                          !canReturnTool &&
                          !canReportRenterIssue &&
                          !canConfirmPickup &&
                          !canReportOwnerIssue &&
                          !canReviewTool &&
                          !canReviewApp && (
                            <p className='text-sm text-muted-foreground'>
                              {t('booking.details.no_actions')}
                            </p>
                          )}

                        {isRenter && booking.status === 'ACCEPTED' && (
                          <div className='rounded-lg bg-muted p-3 text-xs text-muted-foreground'>
                            <strong>{t('booking.details.refund_notice')}: </strong>
                            {acceptedCancellationHasFullRefund
                              ? t('booking.details.full_refund')
                              : t('booking.details.no_refund')}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>

              <div className='grid gap-6 lg:grid-cols-2'>
                <Card>
                  <CardHeader>
                    <CardTitle>{t('booking.details.booking_info')}</CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-4 text-sm'>
                    <div className='grid grid-cols-2 gap-3'>
                      <div>
                        <p className='text-muted-foreground'>{t('general.status')}</p>
                        <p className='font-medium'>
                          {t(`status.${booking.status.toLowerCase()}`)}
                        </p>
                      </div>
                      <div>
                        <p className='text-muted-foreground'>{t('request.pickup_time')}</p>
                        <p className='font-medium'>{booking.pickupHour || '--'}</p>
                      </div>
                      <div>
                        <p className='text-muted-foreground'>{t('general.from')}</p>
                        <p className='font-medium'>{booking.startDate}</p>
                      </div>
                      <div>
                        <p className='text-muted-foreground'>{t('general.to')}</p>
                        <p className='font-medium'>{booking.endDate}</p>
                      </div>
                    </div>

                    <div>
                      <p className='text-muted-foreground'>{t('general.location')}</p>
                      <p className='font-medium'>
                        {booking.tool?.pickupAddress ||
                          t('general.location_not_specified')}
                      </p>
                    </div>

                    {(booking.cancellationReason || booking.refusalReason) && (
                      <div className='rounded-lg bg-muted p-4 space-y-2'>
                        {booking.cancellationReason && (
                          <p>
                            <strong>{t('cancellation.details.reason')}: </strong>
                            {booking.cancellationReason}
                          </p>
                        )}
                        {booking.cancellationMessage && (
                          <p>
                            <strong>{t('cancellation.details.message')}: </strong>
                            {booking.cancellationMessage}
                          </p>
                        )}
                        {booking.refusalReason && (
                          <p>
                            <strong>{t('request.refuse')}: </strong>
                            {booking.refusalReason}
                          </p>
                        )}
                        {booking.refusalMessage && <p>{booking.refusalMessage}</p>}
                      </div>
                    )}

                    {booking.hasActiveClaim && (
                      <Alert>
                        <AlertTriangle className='h-4 w-4' />
                        <AlertDescription>{t('claim.in_progress')}</AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>{t('booking.details.pricing')}</CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <div className='flex items-center justify-between'>
                      <span className='text-muted-foreground'>
                        {t('reservation.total_amount')}
                      </span>
                      <span className='font-semibold text-primary'>
                        <OptimizedPriceDisplay
                          price={Number(booking.totalPrice) || 0}
                          baseCurrency='GBP'
                          size='md'
                          cible='totalPrice'
                        />
                      </span>
                    </div>
                    <div className='flex items-center justify-between text-sm'>
                      <span className='text-muted-foreground'>{t('reservation.deposit')}</span>
                      <span>
                        <OptimizedPriceDisplay
                          price={Number(booking.tool?.depositAmount || 0)}
                          baseCurrency='GBP'
                          size='sm'
                          cible='totalPrice'
                        />
                      </span>
                    </div>
                    <div className='flex items-center justify-between text-sm'>
                      <span className='text-muted-foreground'>
                        {t('booking.details.payment_status')}
                      </span>
                      <span>{booking.paymentStatus || '--'}</span>
                    </div>
                    {(booking as any).refundAmount != null && (
                      <div className='flex items-center justify-between text-sm'>
                        <span className='text-muted-foreground'>
                          {t('booking.details.refund_amount')}
                        </span>
                        <span>
                          <OptimizedPriceDisplay
                            price={Number((booking as any).refundAmount || 0)}
                            baseCurrency='GBP'
                            size='sm'
                            cible='totalPrice'
                          />
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>{t('booking.details.participants')}</CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-5'>
                    <div className='flex items-start gap-3'>
                      <Avatar className='h-12 w-12'>
                        <AvatarImage src={booking.owner?.profilePicture} />
                        <AvatarFallback>
                          {ownerDetails.fullName
                            .split(' ')
                            .map((part) => part[0])
                            .join('')
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className='space-y-1'>
                        <p className='text-sm text-muted-foreground'>
                          {t('booking.history.actor.OWNER')}
                        </p>
                        <p className='font-medium'>{ownerDetails.fullName}</p>
                        {ownerDetails.email && (
                          <p className='text-sm text-muted-foreground'>{ownerDetails.email}</p>
                        )}
                        {ownerDetails.phone && (
                          <p className='text-sm text-muted-foreground'>{ownerDetails.phone}</p>
                        )}
                      </div>
                    </div>

                    <div className='flex items-start gap-3'>
                      <Avatar className='h-12 w-12'>
                        <AvatarImage src={booking.renter?.profilePicture} />
                        <AvatarFallback>
                          {renterDetails.fullName
                            .split(' ')
                            .map((part) => part[0])
                            .join('')
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className='space-y-1'>
                        <p className='text-sm text-muted-foreground'>
                          {t('booking.history.actor.RENTER')}
                        </p>
                        <p className='font-medium'>{renterDetails.fullName}</p>
                        {renterDetails.email && (
                          <p className='text-sm text-muted-foreground'>{renterDetails.email}</p>
                        )}
                        {renterDetails.phone && (
                          <p className='text-sm text-muted-foreground'>{renterDetails.phone}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>{t('booking.details.notes')}</CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-4 text-sm'>
                    <div className='flex items-start gap-2'>
                      <MessageSquare className='h-4 w-4 mt-0.5 text-muted-foreground' />
                      <div>
                        <p className='text-muted-foreground'>{t('general.message')}</p>
                        <p className='font-medium whitespace-pre-wrap'>
                          {booking.message || '-'}
                        </p>
                      </div>
                    </div>
                    <div className='flex items-start gap-2'>
                      <User className='h-4 w-4 mt-0.5 text-muted-foreground' />
                      <div>
                        <p className='text-muted-foreground'>
                          {t('booking.details.tool_info')}
                        </p>
                        <p className='font-medium'>
                          {booking.tool?.brand || '-'} {booking.tool?.model || ''}
                        </p>
                        <p className='text-muted-foreground'>
                          {formatToolCondition(booking.tool?.condition)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>{t('booking.details.history')}</CardTitle>
                </CardHeader>
                <CardContent>
                  {history.length === 0 ? (
                    <p className='text-sm text-muted-foreground'>
                      {t('booking.details.no_extra_history')}
                    </p>
                  ) : (
                    <div className='space-y-4'>
                      {history.map((entry, index) => (
                        <div
                          key={`${entry.action}-${entry.timestamp}-${index}`}
                          className='flex flex-col gap-1 border-l-2 border-muted pl-4'
                        >
                          <div className='flex flex-wrap items-center gap-2'>
                            <Badge variant='outline'>
                              {formatHistoryAction(entry.action)}
                            </Badge>
                            <span className='text-sm text-muted-foreground'>
                              {new Date(entry.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className='text-sm font-medium'>
                            {formatHistoryActor(entry.user)}
                          </p>
                          {entry.notes && (
                            <p className='text-sm text-muted-foreground'>
                              {entry.notes}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>

      <Dialog open={isCancelOpen} onOpenChange={setIsCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('booking.details.cancel_dialog')}</DialogTitle>
          </DialogHeader>
          <div className='space-y-4'>
            <Select value={cancellationReason} onValueChange={setCancellationReason}>
              <SelectTrigger>
                <SelectValue placeholder={t('reservation.cancel.reason')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='change-plans'>
                  {t('reservation.cancel.reason.not_needed')}
                </SelectItem>
                <SelectItem value='found-alternative'>
                  {t('reservation.cancel.reason.other_alternative')}
                </SelectItem>
                <SelectItem value='no-longer-needed'>
                  {t('reservation.cancel.reason.unavailable')}
                </SelectItem>
                <SelectItem value='other'>
                  {t('reservation.cancel.reason.other')}
                </SelectItem>
              </SelectContent>
            </Select>
            <Textarea
              placeholder={t('reservation.cancel.message')}
              value={cancellationMessage}
              onChange={(event) => setCancellationMessage(event.target.value)}
            />
            <div className='rounded-lg bg-muted p-3 text-xs text-muted-foreground'>
              <strong>{t('booking.details.refund_notice')}: </strong>
              {booking?.status === 'ACCEPTED' && !acceptedCancellationHasFullRefund
                ? t('booking.details.no_refund')
                : t('booking.details.full_refund')}
            </div>
            <Button
              className='w-full'
              onClick={() => void handleCancel()}
              disabled={actionLoading}
            >
              {t('booking.details.submit')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('booking.details.reject_dialog')}</DialogTitle>
          </DialogHeader>
          <div className='space-y-4'>
            <Select value={refusalReason} onValueChange={setRefusalReason}>
              <SelectTrigger>
                <SelectValue placeholder={t('request.refuse')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='not-available'>
                  {t('reservation.refused_reason_maintenance')}
                </SelectItem>
                <SelectItem value='tool-problem'>
                  {t('reservation.refused_reason_already_booked')}
                </SelectItem>
                <SelectItem value='schedule-conflict'>
                  {t('booking.cancellation_reasons.schedule_conflict')}
                </SelectItem>
                <SelectItem value='other'>{t('general.other')}</SelectItem>
              </SelectContent>
            </Select>
            <Textarea
              placeholder={t('general.message_placeholder')}
              value={refusalMessage}
              onChange={(event) => setRefusalMessage(event.target.value)}
            />
            <Button
              className='w-full'
              onClick={() => void handleReject()}
              disabled={actionLoading}
            >
              {t('booking.details.submit')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isClaimOpen} onOpenChange={setIsClaimOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('booking.details.claim_dialog')}</DialogTitle>
          </DialogHeader>
          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium mb-2'>
                {t('booking.details.claim_type')}
              </label>
              <Select value={claimReason} onValueChange={setClaimReason}>
                <SelectTrigger>
                  <SelectValue placeholder={t('booking.details.claim_type')} />
                </SelectTrigger>
                <SelectContent>
                  {claimReasonOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className='block text-sm font-medium mb-2'>
                {t('booking.details.claim_description')}
              </label>
              <Textarea
                placeholder={t('report.describe_problem')}
                value={claimMessage}
                onChange={(event) => setClaimMessage(event.target.value)}
              />
            </div>

            <div>
              <label className='block text-sm font-medium mb-2'>
                {t('booking.details.claim_upload')}
              </label>
              <label className='flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 p-5 text-center'>
                <Upload className='h-6 w-6 mb-2 text-muted-foreground' />
                <span className='text-sm text-muted-foreground'>
                  {t('booking.details.image_upload_hint')}
                </span>
                <input
                  type='file'
                  multiple
                  accept='image/*'
                  className='hidden'
                  onChange={handleFileSelect}
                />
              </label>

              {claimFiles.length > 0 && (
                <div className='mt-3 space-y-2'>
                  <p className='text-sm font-medium'>
                    {t('booking.details.selected_files')}
                  </p>
                  {claimFiles.map((file, index) => (
                    <div
                      key={`${file.name}-${index}`}
                      className='flex items-center justify-between rounded border p-2 text-sm'
                    >
                      <span className='truncate pr-2'>{file.name}</span>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => removeClaimFile(index)}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button
              className='w-full'
              onClick={() => void handleSubmitClaim()}
              disabled={actionLoading}
            >
              {t('booking.details.submit')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('booking.details.review_dialog')}</DialogTitle>
          </DialogHeader>
          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium mb-2'>
                {t('review.rate')}
              </label>
              <div className='flex gap-1'>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type='button'
                    className={`p-1 ${
                      star <= reviewRating ? 'text-yellow-500' : 'text-gray-300'
                    }`}
                    onClick={() => setReviewRating(star)}
                  >
                    <Star className='h-6 w-6 fill-current' />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium mb-2'>
                {t('review.comment')}
              </label>
              <Textarea
                placeholder={t('review.placeholdercomm')}
                value={reviewComment}
                onChange={(event) => setReviewComment(event.target.value)}
              />
            </div>

            <Button
              className='w-full'
              onClick={() => void handleSubmitReview()}
              disabled={actionLoading}
            >
              {t('booking.details.submit')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  )
}

export default BookingDetails
