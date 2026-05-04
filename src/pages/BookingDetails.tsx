import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import BookingActionsCard from '@/components/bookingDetails/BookingActionsCard'
import BookingDetailsDialogs from '@/components/bookingDetails/BookingDetailsDialogs'
import BookingHistoryCard from '@/components/bookingDetails/BookingHistoryCard'
import BookingPricingCard from '@/components/bookingDetails/BookingPricingCard'
import BookingReservationInfoCard from '@/components/bookingDetails/BookingReservationInfoCard'
import BookingToolInfoCard from '@/components/bookingDetails/BookingToolInfoCard'
import BookingValidationCard from '@/components/bookingDetails/BookingValidationCard'
import {
  ActionItem,
  BookingDetailsRecord,
  BookingHistoryEntry,
  ClaimMode,
  ParticipantDetails,
  ReviewMode,
} from '@/components/bookingDetails/types'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { useToast } from '@/hooks/use-toast'
import { bookingService } from '@/services/bookingService'
import { disputeService } from '@/services/disputeService'
import { reviewsService } from '@/services/reviewsService'
import { ToolCondition } from '@/types/bridge/enums'
import {
  generateRentalContractAr,
  generateRentalContractFr,
} from '@/utils/contractGenerator'
import {
  AlertTriangle,
  ArrowLeft,
  Download,
  Flag,
  Mail,
  Phone,
  Star,
} from 'lucide-react'

const FALLBACK_TOOL_IMAGE =
  'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=1200&h=900&fit=crop'

const VALIDATION_SECTION_ID = 'booking-validation-section'

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
  const [activePhotoIndex, setActivePhotoIndex] = useState(0)

  const [isCancelOpen, setIsCancelOpen] = useState(false)
  const [isRejectOpen, setIsRejectOpen] = useState(false)
  const [isClaimOpen, setIsClaimOpen] = useState(false)
  const [isReviewOpen, setIsReviewOpen] = useState(false)

  const sourceTab =
    (location.state as { sourceTab?: 'requests' | 'reservations' } | null)
      ?.sourceTab || null

  const locale =
    language === 'ar' ? 'ar-EG' : language === 'en' ? 'en-GB' : 'fr-FR'

  const getOwnerDetails = useCallback(
    (currentBooking: BookingDetailsRecord | null): ParticipantDetails => {
      const owner = currentBooking?.owner || currentBooking?.tool?.owner
      return {
        id: owner?.id || currentBooking?.ownerId || '',
        fullName:
          `${owner?.firstName || ''} ${owner?.lastName || ''}`.trim() ||
          t('general.unknown_owner'),
        email: owner?.email || '',
        phone: owner?.phoneNumber || '',
        address: owner?.address || '',
        profilePicture: owner?.profilePicture || '',
      }
    },
    [t],
  )

  const getRenterDetails = useCallback(
    (currentBooking: BookingDetailsRecord | null): ParticipantDetails => {
      const renter = currentBooking?.renter
      return {
        id: renter?.id || currentBooking?.renterId || '',
        fullName:
          `${renter?.firstName || ''} ${renter?.lastName || ''}`.trim() ||
          t('general.unknown_renter'),
        email: renter?.email || '',
        phone: renter?.phoneNumber || '',
        address: renter?.address || '',
        profilePicture: renter?.profilePicture || '',
      }
    },
    [t],
  )

  const ownerDetails = useMemo(
    () => getOwnerDetails(booking),
    [booking, getOwnerDetails],
  )
  const renterDetails = useMemo(
    () => getRenterDetails(booking),
    [booking, getRenterDetails],
  )

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

  const formatDate = useCallback(
    (value?: string) => {
      if (!value) return '-'
      const parsed = new Date(value)
      if (Number.isNaN(parsed.getTime())) return value

      if (language === 'ar') {
        const day = String(parsed.getDate()).padStart(2, '0')
        const month = String(parsed.getMonth() + 1).padStart(2, '0')
        const year = parsed.getFullYear()
        return `${day}/${month}/${year}`
      }

      return parsed.toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    },
    [language, locale],
  )

  const formatDateTime = useCallback(
    (value?: string) => {
      if (!value) return '-'
      const parsed = new Date(value)
      if (Number.isNaN(parsed.getTime())) return value

      if (language === 'ar') {
        const day = String(parsed.getDate()).padStart(2, '0')
        const month = String(parsed.getMonth() + 1).padStart(2, '0')
        const year = parsed.getFullYear()
        const hours = parsed.getHours()
        const minutes = parsed.getMinutes()
        const seconds = parsed.getSeconds()
        return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`
      }

      return parsed.toLocaleString(locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    },
    [language, locale],
  )

  const formatToolCondition = useCallback(
    (condition?: ToolCondition | string | number) => {
      if (!condition) return '-'

      switch (condition) {
        case 1:
        case ToolCondition.NEW:
          return t('add_tool.condition_new')
        case 2:
        case 'LIKE_NEW':
          return t('tools.condition_like_new')
        case ToolCondition.EXCELLENT:
          return t('add_tool.condition_excellent')
        case 3:
        case ToolCondition.GOOD:
          return t('add_tool.condition_good')
        case 4:
        case ToolCondition.FAIR:
          return t('add_tool.condition_fair')
        case 5:
        case ToolCondition.POOR:
          return t('add_tool.condition_poor')
        default:
          return String(condition)
      }
    },
    [t],
  )

  const getConditionBadgeClass = useCallback((condition?: string | number) => {
    switch (condition) {
      case 1:
      case ToolCondition.NEW:
        return 'bg-emerald-500 text-white'
      case 2:
      case 'LIKE_NEW':
      case ToolCondition.EXCELLENT:
        return 'bg-green-500 text-white'
      case 3:
      case ToolCondition.GOOD:
        return 'bg-blue-500 text-white'
      case 4:
      case ToolCondition.FAIR:
        return 'bg-amber-500 text-white'
      case 5:
      case ToolCondition.POOR:
        return 'bg-red-500 text-white'
      default:
        return 'bg-slate-500 text-white'
    }
  }, [])

  const formatHistoryActor = useCallback(
    (actor: string) => t(`booking.history.actor.${actor}`) || actor,
    [t],
  )

  const formatHistoryAction = useCallback(
    (action: string) => t(`booking.history.action.${action}`) || action,
    [t],
  )

  const getStatusColor = useCallback((status?: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-100 text-amber-800 border-amber-200'
      case 'ACCEPTED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      case 'ONGOING':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'COMPLETED':
        return 'bg-teal-100 text-teal-800 border-teal-200'
      case 'CANCELLED':
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200'
    }
  }, [])

  const toolPhotos = useMemo(() => {
    const photos =
      booking?.tool?.photos?.map((photo: any) => ({
        id: photo.id,
        url: photo.url,
        isPrimary: photo.isPrimary,
      })) || []

    if (photos.length > 0) return photos

    return [{ id: 'fallback', url: FALLBACK_TOOL_IMAGE, isPrimary: true }]
  }, [booking?.tool?.photos])

  useEffect(() => {
    const primaryIndex = toolPhotos.findIndex((photo) => photo.isPrimary)
    setActivePhotoIndex(primaryIndex >= 0 ? primaryIndex : 0)
  }, [toolPhotos])

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
  }, [booking?.pickupHour, booking?.startDate])

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

  const hasAcceptedReservation = useMemo(() => {
    if (!booking) return false
    if (['ACCEPTED', 'ONGOING', 'COMPLETED'].includes(booking.status))
      return true
    if (booking.acceptedAt || booking.validationCode) return true
    return history.some((entry) => entry.action === 'ACCEPTED')
  }, [booking, history])

  const totalDays = useMemo(() => {
    if (Number(booking?.totalDays) > 0) return Number(booking?.totalDays)
    if (!booking?.startDate || !booking?.endDate) return 0
    const diff =
      new Date(booking.endDate).getTime() -
      new Date(booking.startDate).getTime()
    return Math.max(Math.ceil(diff / 86400000), 1)
  }, [booking?.endDate, booking?.startDate, booking?.totalDays])

  const dailyPrice = Number(booking?.basePrice || booking?.tool?.basePrice || 0)
  const bookingAmount = Number(booking?.totalPrice || 0)
  const depositAmount = Number(
    booking?.tool?.depositAmount ?? booking?.deposit ?? 0,
  )
  const totalAmount = bookingAmount + depositAmount

  const categoryName = useMemo(() => {
    const categoryKey = booking?.tool?.category?.name || ''
    if (
      categoryKey &&
      t(`categories.${categoryKey}`) !== `categories.${categoryKey}`
    ) {
      return t(`categories.${categoryKey}`)
    }
    return booking?.tool?.category?.displayName || t('category.unknown')
  }, [booking?.tool?.category?.displayName, booking?.tool?.category?.name, t])

  const subcategoryName = useMemo(() => {
    const subcategoryKey = booking?.tool?.subcategory?.name || ''
    if (
      subcategoryKey &&
      t(`subcategories.${subcategoryKey}`) !== `subcategories.${subcategoryKey}`
    ) {
      return t(`subcategories.${subcategoryKey}`)
    }
    return booking?.tool?.subcategory?.displayName || t('category.unknown')
  }, [
    booking?.tool?.subcategory?.displayName,
    booking?.tool?.subcategory?.name,
    t,
  ])

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
                  reviews.some(
                    (review) => review.bookingId === normalizedBooking.id,
                  ),
                ),
              )
              .catch(() => setHasReviewedTool(false)),
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
      await bookingService.rejectBooking(
        booking.id,
        refusalReason,
        refusalMessage,
      )
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
        cancellationMessage,
      )
      setIsCancelOpen(false)
      setCancellationReason('')
      setCancellationMessage('')
      showSuccess(
        t('success.reservation.cancelled.title'),
        booking.status === 'ACCEPTED' && !acceptedCancellationHasFullRefund
          ? t('success.reservation.cancelled.no_refund')
          : t('success.reservation.cancelled.refund_full'),
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
      await bookingService.validateBookingCode(
        booking.id,
        validationCodeInput.trim(),
      )
      setValidationCodeInput('')
      showSuccess(
        t('request.validation_code_accepted'),
        t('request.validation_code_accepted_message'),
      )
    })
  }

  const handleConfirmReturn = async () => {
    if (!booking) return

    await runAction(async () => {
      await bookingService.confirmToolReturn(booking.id)
      showSuccess(
        t('success.tool.return.confirmed.title'),
        t('success.tool.return.confirmed.message'),
      )
    })
  }

  const handleConfirmPickup = async () => {
    if (!booking) return

    await runAction(async () => {
      await bookingService.confirmPickup(booking.id)
      showSuccess(
        t('request.pickup_confirm_title'),
        t('request.pickup_confirm_message2'),
      )
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
        claimFiles,
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
      showSuccess(
        t('success.report.sent.title'),
        t('success.report.sent.message'),
      )
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
      rentalDuration: `${totalDays} days`,
      totalPrice: booking.totalPrice,
      deposit: depositAmount,
    }

    if (language === 'ar') {
      void generateRentalContractAr(contractData)
    } else {
      void generateRentalContractFr(contractData)
    }

    showSuccess(
      t('booking.details.contract_downloaded_title'),
      t('booking.details.contract_downloaded_message'),
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
      (file) => file.type.startsWith('image/') && file.size <= 1024 * 1024,
    )

    if (validFiles.length !== files.length) {
      showError(t('booking.details.image_upload_hint'))
    }

    setClaimFiles((prev) => [...prev, ...validFiles])
  }

  const removeClaimFile = (index: number) => {
    setClaimFiles((prev) =>
      prev.filter((_, currentIndex) => currentIndex !== index),
    )
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

  const scrollToValidation = () => {
    const section = document.getElementById(VALIDATION_SECTION_ID)
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const claimReasonOptions =
    language === 'en'
      ? [
          {
            value: 'not-compliant',
            label: 'Tool not compliant with the listing',
          },
          {
            value: 'poor-condition',
            label: 'Tool in poor condition or defective',
          },
          { value: 'delay', label: 'Delay in delivery / pickup' },
          { value: 'unsafe', label: 'Dangerous / unsafe tool' },
          {
            value: 'inappropriate',
            label: 'Inappropriate behavior of the provider',
          },
          { value: 'fraud', label: 'Suspicion of scam or fraud' },
          { value: 'no-response', label: 'No response from the provider' },
          {
            value: 'wrong-contact',
            label: 'Incorrect / unreachable phone number',
          },
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
            {
              value: 'wrong-contact',
              label: 'رقم هاتف غير صحيح / لا يمكن الوصول إليه',
            },
            { value: 'other', label: t('general.other') },
          ]
        : [
            { value: 'not-compliant', label: "Outil non conforme à l'annonce" },
            {
              value: 'poor-condition',
              label: 'Outil en mauvais état ou défectueux',
            },
            { value: 'delay', label: 'Retard de livraison / récupération' },
            {
              value: 'inappropriate',
              label: 'Comportement inapproprié du propriétaire',
            },
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
  const canCancel =
    isRenter && ['PENDING', 'ACCEPTED'].includes(booking?.status || '')
  const canDownloadContract =
    !!booking && ['ACCEPTED', 'ONGOING'].includes(booking.status)
  const canContact = !!booking && hasAcceptedReservation
  const canReturnTool =
    isRenter && booking?.status === 'ONGOING' && !booking?.hasUsedReturnButton
  const canReportRenterIssue =
    isRenter && booking?.status === 'ACCEPTED' && !booking?.hasActiveClaim
  const canReviewTool =
    isRenter && booking?.status === 'COMPLETED' && !hasReviewedTool
  const canReviewApp = booking?.status === 'COMPLETED' && !hasReviewedApp
  const showValidationSection =
    !!booking &&
    booking.status === 'ACCEPTED' &&
    ((isRenter && !!booking.validationCode) || isOwner)

  const actions: ActionItem[] = [
    ...(canAccept
      ? [
          {
            key: 'accept',
            label: t('request.accept'),
            onClick: () => void handleAccept(),
            className: 'bg-emerald-600 hover:bg-emerald-700',
          },
        ]
      : []),
    ...(canReject
      ? [
          {
            key: 'reject',
            label: t('request.decline'),
            onClick: () => setIsRejectOpen(true),
            variant: 'outline' as const,
            className:
              'border-red-200 text-red-700 hover:bg-red-50 hover:text-red-700',
          },
        ]
      : []),
    ...(canValidateCode
      ? [
          {
            key: 'validation',
            label: t('booking.details.launch_booking'),
            onClick: scrollToValidation,
            className: 'bg-blue-600 hover:bg-blue-700',
          },
        ]
      : []),
    ...(canCancel
      ? [
          {
            key: 'cancel',
            label: t('action.cancel'),
            onClick: () => setIsCancelOpen(true),
            variant: 'outline' as const,
            className:
              'border-red-200 text-red-700 hover:bg-red-50 hover:text-red-700',
          },
        ]
      : []),
    ...(canDownloadContract
      ? [
          {
            key: 'contract',
            label: t('general.download_contract'),
            onClick: handleDownloadContract,
            icon: Download,
            variant: 'outline' as const,
          },
        ]
      : []),
    ...(canContact && (isOwner ? renterDetails.phone : ownerDetails.phone)
      ? [
          {
            key: 'call',
            label: t('request.call'),
            onClick: () =>
              handleCall(isOwner ? renterDetails.phone : ownerDetails.phone),
            icon: Phone,
            variant: 'outline' as const,
          },
        ]
      : []),
    ...(canContact && (isOwner ? renterDetails.email : ownerDetails.email)
      ? [
          {
            key: 'email',
            label: t('request.mail'),
            onClick: () =>
              handleEmail(isOwner ? renterDetails.email : ownerDetails.email),
            icon: Mail,
            variant: 'outline' as const,
          },
        ]
      : []),
    ...(canReturnTool
      ? [
          {
            key: 'return',
            label: t('tool.return.confirm'),
            onClick: () => void handleConfirmReturn(),
            className: 'bg-amber-600 hover:bg-amber-700',
          },
        ]
      : []),
    ...(canConfirmPickup
      ? [
          {
            key: 'pickup',
            label: t('request.pickup_confirm_button'),
            onClick: () => void handleConfirmPickup(),
            className: 'bg-blue-600 hover:bg-blue-700',
          },
        ]
      : []),
    ...(canReportRenterIssue
      ? [
          {
            key: 'report-renter',
            label: t('tool.return.report_issue'),
            onClick: () => openClaimDialog('renter'),
            icon: Flag,
            variant: 'outline' as const,
            className:
              'border-orange-200 text-orange-700 hover:bg-orange-50 hover:text-orange-700',
          },
        ]
      : []),
    ...(canReportOwnerIssue
      ? [
          {
            key: 'report-owner',
            label: t('tool.return.report_issue'),
            onClick: () => openClaimDialog('owner'),
            icon: Flag,
            variant: 'outline' as const,
            className:
              'border-orange-200 text-orange-700 hover:bg-orange-50 hover:text-orange-700',
          },
        ]
      : []),
    ...(canReviewTool
      ? [
          {
            key: 'review-tool',
            label: t('booking.details.review_dialog'),
            onClick: () => openReviewDialog('tool'),
            icon: Star,
            variant: 'outline' as const,
          },
        ]
      : []),
    ...(canReviewApp
      ? [
          {
            key: 'review-app',
            label: t('review.app_title'),
            onClick: () => openReviewDialog('app'),
            icon: Star,
            variant: 'outline' as const,
          },
        ]
      : []),
  ]

  const desktopActions = actions.map((action) =>
    action.key === 'cancel'
      ? {
          ...action,
          className:
            'border-[#ed8021] bg-[#ed8021] text-[#f5f5f5] hover:bg-[#d9731d] hover:text-[#f5f5f5]',
        }
      : action.key === 'reject'
        ? {
            ...action,
            className:
              'border-[rgba(218,52,52,0.7)] bg-[rgba(218,52,52,0.7)] text-[#fafafa] hover:bg-[rgba(194,42,42,0.82)] hover:text-[#fafafa]',
          }
        : action,
  )

  const getHistoryDetailLines = useCallback(
    (entry: BookingHistoryEntry) => {
      const lines: string[] = []

      if (entry.notes?.trim()) {
        lines.push(entry.notes.trim())
      }

      if (entry.action === 'CREATED' && booking?.message?.trim()) {
        lines.push(`${t('general.message')}: ${booking.message.trim()}`)
      }
      if (entry.action === 'CANCELLED' && booking?.cancellationReason) {
        lines.push(
          `${t('cancellation.details.reason')}: ${booking.cancellationReason}`,
        )
      }
      if (entry.action === 'CANCELLED' && booking?.cancellationMessage) {
        lines.push(
          `${t('cancellation.details.message')}: ${booking.cancellationMessage}`,
        )
      }
      if (entry.action === 'REJECTED' && booking?.refusalReason) {
        lines.push(`${t('request.refuse')}: ${booking.refusalReason}`)
      }
      if (entry.action === 'REJECTED' && booking?.refusalMessage) {
        lines.push(
          `${t('cancellation.details.message')}: ${booking.refusalMessage}`,
        )
      }
      if (
        entry.action === 'REFUND_PROCESSED' &&
        typeof booking?.refundAmount === 'number'
      ) {
        lines.push(
          `${t('booking.details.refund_amount')}: ${booking.refundAmount}`,
        )
      }

      return Array.from(new Set(lines))
    },
    [
      booking?.cancellationMessage,
      booking?.cancellationReason,
      booking?.message,
      booking?.refundAmount,
      booking?.refusalMessage,
      booking?.refusalReason,
      t,
    ],
  )

  const renderDesktopSection = (
    title: string,
    content: React.ReactNode,
    id?: string,
    className?: string,
  ) => (
    <Card id={id} className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  )

  const renderMobileSection = (
    value: string,
    title: string,
    content: React.ReactNode,
    id?: string,
  ) => (
    <AccordionItem
      id={id}
      value={value}
      className='rounded-2xl border bg-background px-4'
    >
      <AccordionTrigger className='text-left text-base font-semibold hover:no-underline'>
        {title}
      </AccordionTrigger>
      <AccordionContent className='pt-2'>{content}</AccordionContent>
    </AccordionItem>
  )

  return (
    <div className='min-h-screen bg-background'>
      <Header />
      <main className='py-8 pb-40 md:pb-10'>
        <div className='mx-auto max-w-7xl space-y-6 px-4'>
          <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
            <div className='space-y-1'>
              <Button
                variant='ghost'
                className='px-0'
                onClick={() => navigate(backHref)}
              >
                <ArrowLeft className='mr-2 h-4 w-4' />
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
                <Link to={`/tool/${toolId}`}>
                  {t('booking.details.open_tool')}
                </Link>
              </Button>
            )}
          </div>

          {loading ? (
            <Card>
              <CardContent className='flex items-center justify-center gap-3 py-16'>
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
              <AlertDescription>
                {t('booking.details.not_found')}
              </AlertDescription>
            </Alert>
          ) : !isParticipant ? (
            <Alert variant='destructive'>
              <AlertDescription>
                {t('booking.details.no_access')}
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <div className='hidden space-y-6 md:block'>
                {renderDesktopSection(
                  t('booking.details.actions'),
                  <BookingActionsCard
                    actions={desktopActions}
                    noActionsLabel={t('booking.details.no_actions')}
                    actionLoading={actionLoading}
                  />,
                  undefined,
                  'bg-[rgba(192,135,89,0.12)]',
                )}

                {showValidationSection &&
                  renderDesktopSection(
                    t('booking.validation_code'),
                    <BookingValidationCard
                      booking={booking}
                      isOwner={isOwner}
                      isRenter={isRenter}
                      showValidationCode={showValidationCode}
                      copiedCode={copiedCode}
                      isStartDateReached={isStartDateReached}
                      validationCodeInput={validationCodeInput}
                      actionLoading={actionLoading}
                      codeForRenterLabel={t('booking.validation_code')}
                      codeForOwnerLabel={t('booking.details.generated_code')}
                      codeOwnerHintLabel={t('booking.details.code_owner_hint')}
                      pickupReadyLabel={t('booking.details.pickup_ready')}
                      presentCodeLabel={t('booking.present_code')}
                      copyCodeLabel={t('booking.details.copy_code')}
                      showLabel={t('general.show')}
                      hideLabel={t('general.hide')}
                      enterValidationCodeLabel={t('request.enter_code')}
                      launchBookingLabel={t('booking.details.launch_booking')}
                      onToggleVisibility={() =>
                        setShowValidationCode((previous) => !previous)
                      }
                      onCopy={() => void handleCopyValidationCode()}
                      onValidationCodeChange={setValidationCodeInput}
                      onSubmit={() => void handleValidateCode()}
                    />,
                    VALIDATION_SECTION_ID,
                  )}

                <div className='grid gap-6 lg:grid-cols-2'>
                  {renderDesktopSection(
                    t('booking.details.tool_info'),
                    <BookingToolInfoCard
                      booking={booking}
                      toolId={toolId}
                      toolPhotos={toolPhotos}
                      activePhotoIndex={activePhotoIndex}
                      onPhotoChange={setActivePhotoIndex}
                      ownerDetails={ownerDetails}
                      ownerTitle={t('request.contact_owner_information')}
                      showContacts={hasAcceptedReservation}
                      hiddenContactsLabel={t(
                        'booking.details.contact_visible_after_acceptance',
                      )}
                      locationFallback={t('general.location_not_specified')}
                      categoryName={categoryName}
                      subcategoryName={subcategoryName}
                      toolBrandModelLabel={t(
                        'booking.details.tool_brand_model',
                      )}
                      toolConditionLabel={t('booking.details.tool_condition')}
                      purchaseYearLabel={t('tools.year_of_purchase')}
                      formatToolCondition={formatToolCondition}
                      getConditionBadgeClass={getConditionBadgeClass}
                    />,
                  )}

                  {renderDesktopSection(
                    t('booking.details.booking_info'),
                    <BookingReservationInfoCard
                      booking={booking}
                      renterDetails={renterDetails}
                      renterTitle={t('request.contact_renter_information')}
                      showContacts={hasAcceptedReservation}
                      hiddenContactsLabel={t(
                        'booking.details.contact_visible_after_acceptance',
                      )}
                      locationFallback={t('general.location_not_specified')}
                      statusLabel={t(`status.${booking.status.toLowerCase()}`)}
                      disputeLabel={t('claim.in_progress')}
                      waitingPickupLabel={t('booking.wait')}
                      pickupCompletedLabel={t('tool.returned')}
                      startDateLabel={t('general.from')}
                      endDateLabel={t('general.to')}
                      pickupHourLabel={t('request.pickup_time')}
                      pickupAddressLabel={t('general.location')}
                      bookingMessageLabel={t('general.message')}
                      formatDate={formatDate}
                      getStatusColor={getStatusColor}
                    />,
                  )}
                </div>

                {renderDesktopSection(
                  t('booking.details.pricing'),
                  <BookingPricingCard
                    booking={booking}
                    totalDays={totalDays}
                    dailyPrice={dailyPrice}
                    bookingAmount={bookingAmount}
                    depositAmount={depositAmount}
                    totalAmount={totalAmount}
                    refundNoticeLabel={t('booking.details.refund_notice')}
                    fullRefundLabel={t('booking.details.full_refund')}
                    noRefundLabel={t('booking.details.no_refund')}
                    refundAmountLabel={t('booking.details.refund_amount')}
                    acceptedCancellationHasFullRefund={
                      acceptedCancellationHasFullRefund
                    }
                    paymentDailyPriceLabel={t(
                      'booking.details.payment_daily_price',
                    )}
                    paymentDaysLabel={t('booking.details.payment_days')}
                    paymentBookingAmountLabel={t(
                      'booking.details.payment_booking_amount',
                    )}
                    paymentDepositLabel={t('reservation.deposit')}
                    paymentTotalLabel={t('reservation.total_amount')}
                  />,
                )}

                {renderDesktopSection(
                  t('booking.details.history'),
                  <BookingHistoryCard
                    history={history}
                    noHistoryLabel={t('booking.details.no_extra_history')}
                    formatHistoryAction={formatHistoryAction}
                    formatHistoryActor={formatHistoryActor}
                    formatDateTime={formatDateTime}
                    getHistoryDetailLines={getHistoryDetailLines}
                  />,
                )}
              </div>

              <div className='md:hidden'>
                <Accordion
                  type='multiple'
                  defaultValue={['actions', 'tool', 'booking']}
                  className='space-y-4'
                >
                  {renderMobileSection(
                    'actions',
                    t('booking.details.actions'),
                    <BookingActionsCard
                      actions={actions}
                      noActionsLabel={t('booking.details.no_actions')}
                      actionLoading={actionLoading}
                    />,
                  )}

                  {renderMobileSection(
                    'tool',
                    t('booking.details.tool_info'),
                    <BookingToolInfoCard
                      booking={booking}
                      toolId={toolId}
                      toolPhotos={toolPhotos}
                      activePhotoIndex={activePhotoIndex}
                      onPhotoChange={setActivePhotoIndex}
                      ownerDetails={ownerDetails}
                      ownerTitle={t('request.contact_owner_information')}
                      showContacts={hasAcceptedReservation}
                      hiddenContactsLabel={t(
                        'booking.details.contact_visible_after_acceptance',
                      )}
                      locationFallback={t('general.location_not_specified')}
                      categoryName={categoryName}
                      subcategoryName={subcategoryName}
                      toolBrandModelLabel={t(
                        'booking.details.tool_brand_model',
                      )}
                      toolConditionLabel={t('booking.details.tool_condition')}
                      purchaseYearLabel={t('tools.year_of_purchase')}
                      formatToolCondition={formatToolCondition}
                      getConditionBadgeClass={getConditionBadgeClass}
                    />,
                  )}

                  {renderMobileSection(
                    'booking',
                    t('booking.details.booking_info'),
                    <BookingReservationInfoCard
                      booking={booking}
                      renterDetails={renterDetails}
                      renterTitle={t('request.contact_renter_information')}
                      showContacts={hasAcceptedReservation}
                      hiddenContactsLabel={t(
                        'booking.details.contact_visible_after_acceptance',
                      )}
                      locationFallback={t('general.location_not_specified')}
                      statusLabel={t(`status.${booking.status.toLowerCase()}`)}
                      disputeLabel={t('claim.in_progress')}
                      waitingPickupLabel={t('booking.wait')}
                      pickupCompletedLabel={t('tool.returned')}
                      startDateLabel={t('general.from')}
                      endDateLabel={t('general.to')}
                      pickupHourLabel={t('request.pickup_time')}
                      pickupAddressLabel={t('general.location')}
                      bookingMessageLabel={t('general.message')}
                      formatDate={formatDate}
                      getStatusColor={getStatusColor}
                    />,
                  )}

                  {renderMobileSection(
                    'pricing',
                    t('booking.details.pricing'),
                    <BookingPricingCard
                      booking={booking}
                      totalDays={totalDays}
                      dailyPrice={dailyPrice}
                      bookingAmount={bookingAmount}
                      depositAmount={depositAmount}
                      totalAmount={totalAmount}
                      refundNoticeLabel={t('booking.details.refund_notice')}
                      fullRefundLabel={t('booking.details.full_refund')}
                      noRefundLabel={t('booking.details.no_refund')}
                      refundAmountLabel={t('booking.details.refund_amount')}
                      acceptedCancellationHasFullRefund={
                        acceptedCancellationHasFullRefund
                      }
                      paymentDailyPriceLabel={t(
                        'booking.details.payment_daily_price',
                      )}
                      paymentDaysLabel={t('booking.details.payment_days')}
                      paymentBookingAmountLabel={t(
                        'booking.details.payment_booking_amount',
                      )}
                      paymentDepositLabel={t('reservation.deposit')}
                      paymentTotalLabel={t('reservation.total_amount')}
                    />,
                  )}

                  {showValidationSection &&
                    renderMobileSection(
                      'validation',
                      t('booking.validation_code'),
                      <BookingValidationCard
                        booking={booking}
                        isOwner={isOwner}
                        isRenter={isRenter}
                        showValidationCode={showValidationCode}
                        copiedCode={copiedCode}
                        isStartDateReached={isStartDateReached}
                        validationCodeInput={validationCodeInput}
                        actionLoading={actionLoading}
                        codeForRenterLabel={t('booking.validation_code')}
                        codeForOwnerLabel={t('booking.details.generated_code')}
                        codeOwnerHintLabel={t(
                          'booking.details.code_owner_hint',
                        )}
                        pickupReadyLabel={t('booking.details.pickup_ready')}
                        presentCodeLabel={t('booking.present_code')}
                        copyCodeLabel={t('booking.details.copy_code')}
                        showLabel={t('general.show')}
                        hideLabel={t('general.hide')}
                        enterValidationCodeLabel={t('request.enter_code')}
                        launchBookingLabel={t('booking.details.launch_booking')}
                        onToggleVisibility={() =>
                          setShowValidationCode((previous) => !previous)
                        }
                        onCopy={() => void handleCopyValidationCode()}
                        onValidationCodeChange={setValidationCodeInput}
                        onSubmit={() => void handleValidateCode()}
                      />,
                      VALIDATION_SECTION_ID,
                    )}

                  {renderMobileSection(
                    'history',
                    t('booking.details.history'),
                    <BookingHistoryCard
                      history={history}
                      noHistoryLabel={t('booking.details.no_extra_history')}
                      formatHistoryAction={formatHistoryAction}
                      formatHistoryActor={formatHistoryActor}
                      formatDateTime={formatDateTime}
                      getHistoryDetailLines={getHistoryDetailLines}
                    />,
                  )}
                </Accordion>
              </div>
            </>
          )}
        </div>
      </main>

      {!!booking && actions.length > 0 && (
        <div className='fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 p-4 backdrop-blur md:hidden'>
          <div className='mx-auto max-w-7xl'>
            <div className='grid grid-cols-2 gap-2'>
              {actions.map((action) => {
                const Icon = action.icon
                return (
                  <Button
                    key={`mobile-${action.key}`}
                    variant={action.variant || 'default'}
                    className={`w-full justify-center ${action.className || ''}`}
                    onClick={action.onClick}
                    disabled={actionLoading}
                  >
                    {Icon ? <Icon className='mr-2 h-4 w-4' /> : null}
                    {action.label}
                  </Button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      <BookingDetailsDialogs
        actionLoading={actionLoading}
        isCancelOpen={isCancelOpen}
        setIsCancelOpen={setIsCancelOpen}
        isRejectOpen={isRejectOpen}
        setIsRejectOpen={setIsRejectOpen}
        isClaimOpen={isClaimOpen}
        setIsClaimOpen={setIsClaimOpen}
        isReviewOpen={isReviewOpen}
        setIsReviewOpen={setIsReviewOpen}
        cancellationReason={cancellationReason}
        setCancellationReason={setCancellationReason}
        cancellationMessage={cancellationMessage}
        setCancellationMessage={setCancellationMessage}
        refusalReason={refusalReason}
        setRefusalReason={setRefusalReason}
        refusalMessage={refusalMessage}
        setRefusalMessage={setRefusalMessage}
        claimReason={claimReason}
        setClaimReason={setClaimReason}
        claimMessage={claimMessage}
        setClaimMessage={setClaimMessage}
        claimFiles={claimFiles}
        claimReasonOptions={claimReasonOptions}
        reviewRating={reviewRating}
        setReviewRating={setReviewRating}
        reviewComment={reviewComment}
        setReviewComment={setReviewComment}
        onFileSelect={handleFileSelect}
        onRemoveClaimFile={removeClaimFile}
        onCancel={() => void handleCancel()}
        onReject={() => void handleReject()}
        onSubmitClaim={() => void handleSubmitClaim()}
        onSubmitReview={() => void handleSubmitReview()}
        t={t}
      />

      <Footer />
    </div>
  )
}

export default BookingDetails
