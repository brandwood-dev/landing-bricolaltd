import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

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
import {
  MessageSquare,
  Calendar,
  User,
  Clock,
  Download,
  Loader2,
  ChevronLeft,
  ChevronRight,
  DollarSign,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { OptimizedPriceDisplay } from '../OptimizedPriceDisplay'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/AuthContext'
import RequestsAndReservationsFilters from './RequestsAndReservationsFilters'


// Import refactored components and utilities
import { Request, StatusOption } from '@/types/bridge'
import {
  getStatusColor,
  getStatusText,
  handleDownloadContract,
  statusOptions,
} from './requests/utils'
import { bookingService, Booking } from '@/services/bookingService'
import RefusalDialog from './requests/RefusalDialog'
import ReportDialog from './requests/ReportDialog'
import ContactDialog from './requests/ContactDialog'
import ConfirmRecoveryDialog from './requests/ConfirmRecoveryDialog'
import ReviewDialog from './requests/ReviewDialog'
import ClaimDialog from './requests/ClaimDialog'
import CancellationDetailsDialog from './requests/CancellationDetailsDialog'
import { useLanguage } from '@/contexts/LanguageContext'
import { generateRentalContract } from '@/utils/contractGenerator'
import { disputeService } from '@/services/disputeService'
import { notificationService } from '@/services/notificationService'
import { reviewsService } from '@/services/reviewsService'
import { toolsService, Tool } from '@/services/toolsService'
import AdViewDialog from './AdViewDialog'
import { Dialog } from '@/components/ui/dialog'

const Requests = () => {
  const { user } = useAuth()
  const [validationCode, setValidationCode] = useState('')
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)
  const [isAppReviewDialogOpen, setIsAppReviewDialogOpen] = useState(false)
  const [hasReviewedApp, setHasReviewedApp] = useState(false)
  const [isClaimDialogOpen, setIsClaimDialogOpen] = useState(false)
  const [selectedRequestId, setSelectedRequestId] = useState('')
  const [filteredRequests, setFilteredRequests] = useState<Request[]>([])
  const [isFiltering, setIsFiltering] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(3)
  const previousFilteredDataRef = useRef<Request[]>([])
  const isInitialLoadRef = useRef(true)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [viewToolData, setViewToolData] = useState<Tool | null>(null)
  const [isLoadingView, setIsLoadingView] = useState(false)
  const { toast } = useToast()

  const [requests, setRequests] = useState<Request[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const transformBookingToRequest = (booking: Booking): Request => {
    // Get primary photo or fallback to first photo
    const primaryPhoto = booking.tool?.photos?.find((photo) => photo.isPrimary)
    const toolImage =
      primaryPhoto?.url ||
      booking.tool?.photos?.[0]?.url ||
      'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=300&fit=crop'

    return {
      id: booking.id,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
      referenceId: `RES-${booking.id}`,
      toolId: booking.toolId,
      renterId: booking.renterId,
      ownerId: booking.ownerId,
      toolName: booking.tool?.title || t('general.tool_not_specified'),
      toolDescription: booking.tool?.description || '',
      pickupAddress: booking.tool?.pickupAddress || '',
      toolImage,
      toolBrand: booking.tool?.brand || '',
      toolModel: booking.tool?.model || '',
      toolCondition:
        booking.tool?.condition === 1
          ? 'NEW'
          : booking.tool?.condition === 2
          ? 'LIKE_NEW'
          : booking.tool?.condition === 3
          ? 'GOOD'
          : booking.tool?.condition === 4
          ? 'FAIR'
          : booking.tool?.condition === 5
          ? 'POOR'
          : '',
      ownerName:
        `${booking.owner?.firstName || ''} ${
          booking.owner?.lastName || ''
        }`.trim() || t('general.unknown_owner'),
      ownerEmail: booking.owner?.email || '',
      ownerPhone: booking.owner?.phoneNumber || '',
      ownerAddress: booking.owner?.address || '',
      renterName:
        `${booking.renter?.firstName || ''} ${
          booking.renter?.lastName || ''
        }`.trim() || t('general.unknown_renter'),
      renterEmail: booking.renter?.email || '',
      renterPhone: booking.renter?.phoneNumber || '',
      renterAddress: booking.renter?.address || '',
      startDate: booking.startDate,
      endDate: booking.endDate,
      pickupHour: booking.pickupHour,
      location:
        booking.tool?.pickupAddress || t('general.location_not_specified'),
      totalDays: booking.totalDays || 1,
      basePrice: booking.tool?.basePrice || 0,
      totalPrice: booking.totalPrice || 0,
      fees: booking.fees || 0,
      deposit: booking.tool?.depositAmount || 0,
      totalAmount: booking.totalAmount || booking.totalPrice || 0,
      status: booking.status,
      paymentMethod: booking.paymentMethod,
      paymentStatus: booking.paymentStatus,
      message: booking.message,
      validationCode: booking.validationCode,
      hasActiveClaim: booking.hasActiveClaim,
      cancellationReason: booking.cancellationReason,
      cancellationMessage: booking.cancellationMessage,
      refusalReason: booking.refusalReason,
      refusalMessage: booking.refusalMessage,
      renterHasReturned: booking.renterHasReturned,
      hasUsedReturnButton: booking.hasUsedReturnButton,
      pickupTool: booking.pickupTool,
      renterInfo: booking.renterInfo || {
        firstName: booking.renter?.firstName || '',
        lastName: booking.renter?.lastName || '',
        phone: booking.renter?.phoneNumber || '',
        phone_prefix: booking.renter?.phone_prefix || '',
      },
      tool: booking.tool,
      renter: booking.renter,
      owner: booking.owner,
    }
  }
  const { t, language } = useLanguage()

  const fetchBookings = async () => {
    if (!user?.id) {
      setError(t('auth.user_not_found'))
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      // Debug log: Afficher l'ID utilisateur utilisé pour la requête
      console.log('🔍 [DEBUG] Fetching bookings for user ID:', user.id)
      
      const ownerBookings = await bookingService.getOwnerBookings(user.id, {
        page: 1,
        limit: 100,
      })

      // Debug log: Afficher la réponse complète de l'API
      console.log('🔍 [DEBUG] API Response:', ownerBookings)
      
      // Debug log: Afficher le nombre de réservations récupérées
      console.log('🔍 [DEBUG] Number of bookings received:', ownerBookings.data?.length || 0)
      
      // Debug log: Afficher un échantillon de la première réservation si elle existe
      if (ownerBookings.data && ownerBookings.data.length > 0) {
        console.log('🔍 [DEBUG] Sample booking (first one):', ownerBookings.data[0])
      }

      const transformedReq = ownerBookings.data.map(transformBookingToRequest)
      
      // Debug log: Afficher les données transformées
      console.log('🔍 [DEBUG] Transformed requests:', transformedReq)
      console.log('🔍 [DEBUG] Number of transformed requests:', transformedReq.length)
      
      setBookings(ownerBookings.data)
      setRequests(transformedReq)
    } catch (err: any) {
      console.error('Error fetching bookings:', err)
      setError(err.message || t('request.load_error'))
      setRequests([])
    } finally {
      setLoading(false)
    }
  }
  // Load bookings from API
  useEffect(() => {
    if (user?.id) {
      fetchBookings()
      // Check if owner already reviewed the app
      checkUserAppReview()
    }
  }, [user?.id])

  const checkUserAppReview = async (): Promise<boolean> => {
    if (!user?.id) return false
    try {
      const result = await reviewsService.checkUserAppReview(user.id)
      setHasReviewedApp(!!result.hasReviewed)
      return !!result.hasReviewed
    } catch (error) {
      console.error('Failed to check app review status', error)
      return false
    }
  }

  const handleAcceptRequest = async (requestId: string) => {
    try {
      console.log('[REQUESTS] Accepting booking', { requestId })
      const updatedBooking = await bookingService.acceptBooking(requestId)
      console.log('[REQUESTS] Booking accepted response', {
        id: updatedBooking?.id,
        status: (updatedBooking as any)?.status,
        validationCode: (updatedBooking as any)?.validationCode,
        paymentStatus: (updatedBooking as any)?.paymentStatus,
      })

      // Update local state after successful API call
      setRequests((prev) =>
        prev.map((req) =>
          req.id === requestId
            ? {
                ...req,
                status: 'ACCEPTED',
                validationCode: (updatedBooking as any).validationCode,
              }
            : req
        )
      )

      toast({
        title: t('request.ACCEPTED.title'),
        description: `${t('request.ACCEPTED.message')}` ,
      })
    } catch (error: any) {
      console.error('[REQUESTS] Accept booking failed', { requestId, error: error?.message, response: error?.response?.data })
      toast({
        title: t('general.error'),
        description: error.message || 'Failed to accept booking',
        variant: 'destructive',
      })
    }
  }

  const handleDeclineRequest = async (
    requestId: string,
    reason: string,
    message: string
  ) => {
    try {
      await bookingService.rejectBooking(requestId, reason, message)

      // Update local state after successful API call
      setRequests((prev) =>
        prev.map((req) =>
          req.id === requestId
            ? ({
                ...req,
                status: 'REJECTED',
                refusalReason: reason,
                refusalMessage: message,
              } as Request)
            : req
        )
      )

      toast({
        title: t('request.refuse'),
        description: t('request.refuse.message'),
      })
    } catch (error: any) {
      toast({
        title: t('general.error'),
        description: error.message || 'Failed to reject booking',
        variant: 'destructive',
      })
    }
  }

  const handleValidationCode = async (requestId: string) => {
    if (!validationCode.trim()) {
      toast({
        title: t('request.validation_code_empty'),
        description: t('request.validation_code_empty_message'),
        variant: 'destructive',
      })
      return
    }

    try {
      const updatedBooking = await bookingService.validateBookingCode(
        requestId,
        validationCode
      )

      // Update local state after successful API call
      setRequests((prev) =>
        prev.map((req) =>
          req.id === requestId ? { ...req, status: 'ONGOING' } : req
        )
      )

      toast({
        title: t('request.validation_code_ACCEPTED'),
        description: t('request.validation_code_ACCEPTED_message'),
      })

      setValidationCode('')
    } catch (error: any) {
      // Handle specific error messages
      let errorTitle = t('request.validation_code_rejected')
      let errorDescription = t('request.validation_code_rejected_message')

      if (error.message.includes('Invalid validation code')) {
        errorTitle = t('request.validation_code_invalid')
        errorDescription = t('request.validation_code_invalid_message')
      } else if (error.message.includes('not found')) {
        errorTitle = t('request.booking_not_found')
        errorDescription = t('request.booking_not_found_message')
      } else if (
        error.message.includes('network') ||
        error.message.includes('fetch')
      ) {
        errorTitle = t('error.network_error')
        errorDescription = t('error.network_error_message')
      }

      toast({
        title: errorTitle,
        description: errorDescription,
        variant: 'destructive',
      })
    }
  }

  const handleToolRecovery = (requestId: string) => {
    setSelectedRequestId(requestId)
    setIsConfirmDialogOpen(true)
  }

  const handleConfirmRecovery = async () => {
    if (!selectedRequestId) return

    try {
      await bookingService.confirmPickup(selectedRequestId)

      // Update local state after successful API call
      setRequests((prev) =>
        prev.map((req) =>
          req.id === selectedRequestId
            ? { ...req, status: 'COMPLETED', pickupTool: true }
            : req
        )
      )

      toast({
        title: t('pickup.confirmed.title'),
        description: t('pickup.confirmed.message'),
      })

      setIsConfirmDialogOpen(false)
      // After marking booking as COMPLETED, open App review if not already done
      const reviewed = await checkUserAppReview()
      if (!reviewed) {
        setIsAppReviewDialogOpen(true)
      }
    } catch (error: any) {
      toast({
        title: t('general.error'),
        description: error.message || 'Failed to confirm pickup',
        variant: 'destructive',
      })
    }
  }

  const handleOpenClaim = () => {
    const selectedRequest = requests.find((req) => req.id === selectedRequestId)

    setIsConfirmDialogOpen(false)
    setIsClaimDialogOpen(true)
  }

  const handleSubmitReview = async (
    rating: number,
    comment: string,
    bookingId?: string,
    toolId?: string,
    revieweeId?: string,
    reviewerId?: string
  ) => {
    if (!user?.id || !bookingId || !toolId || !revieweeId) {
      toast({
        title: t('general.error'),
        description: 'Missing required information for review',
        variant: 'destructive',
      })
      return
    }

    try {
      await reviewsService.createToolReview({
        rating,
        comment,
        reviewerId: user.id,
        revieweeId,
        toolId,
        bookingId,
      })

      setRequests((prev) =>
        prev.map((req) =>
          req.id === selectedRequestId ? { ...req, status: 'COMPLETED' } : req
        )
      )

      toast({
        title: t('review.popuptitle'),
        description: t('review.modalmsg'),
      })

      setIsReviewDialogOpen(false)
      setSelectedRequestId('')
    } catch (error: any) {
      toast({
        title: t('general.error'),
        description: error.message || 'Failed to submit review',
        variant: 'destructive',
      })
    }
  }

  // Submit app review (owner reviews app usage)
  const handleSubmitAppReview = async (
    rating: number,
    comment: string,
  ) => {
    if (!user?.id) {
      toast({
        title: t('general.error'),
        description: 'Missing user information for app review',
        variant: 'destructive',
      })
      return
    }

    try {
      await reviewsService.createAppReview({
        rating,
        comment,
        reviewerId: user.id,
      })

      toast({
        title: t('review.popuptitle'),
        description: t('review.modalmsg'),
      })

      setHasReviewedApp(true)
      setIsAppReviewDialogOpen(false)
    } catch (error: any) {
      toast({
        title: t('general.error'),
        description: error.message || 'Failed to submit app review',
        variant: 'destructive',
      })
    }
  }

  const handleSubmitClaim = async (disputeData: any, images: File[]) => {
    if (!selectedRequestId || !user) return

    try {
      // Create dispute with images
      await disputeService.createDispute(
        {
          userId: user.id,
          bookingId: selectedRequestId,
          reason: disputeData.reason,
          reportReason: disputeData.reason,
          reportMessage: disputeData.reportMessage,
        },
        images
      )

      // Update booking status and pickupTool flag
      await bookingService.updateBookingStatus(selectedRequestId, {
        status: 'ONGOING',
        pickupTool: true,
      })

      // // Send notification
      // await notificationService.createNotification({
      //   userId: user.id,
      //   type: 'dispute_created',
      //   title: 'Dispute créée',
      //   message: `Une dispute a été créée pour la réservation ${selectedRequestId}`,
      //   data: { bookingId: selectedRequestId },
      // })

      // Update local state after successful API calls
      setRequests((prev) =>
        prev.map((req) =>
          req.id === selectedRequestId
            ? {
                ...req,
                hasActiveClaim: true,
                pickupTool: true,
                status: 'ONGOING',
              }
            : req
        )
      )

      toast({
        title: t('success.report.sent.title'),
        description: t('success.report.sent.message'),
        duration: 5000,
        className: "bg-green-50 border-green-200 text-green-800",
      })

      setIsClaimDialogOpen(false)
      setSelectedRequestId('')
    } catch (error: any) {
      toast({
        title: t('general.error'),
        description: error.message || 'Failed to report pickup issue',
        variant: 'destructive',
      })
    }
  }

  const handleReportSubmit = (requestId: string) => {
    // Mark the request as having an active claim when reported
    setRequests((prev) =>
      prev.map((req) =>
        req.id === requestId ? { ...req, hasActiveClaim: true } : req
      )
    )
  }

  // Données à paginer
  const dataToDisplay = isFiltering ? filteredRequests : requests
  
  // 🔍 Debug: Log final data for display
  console.log('🔍 [Requests] Final data to display:', dataToDisplay)
  console.log('🔍 [Requests] Using filtered requests:', filteredRequests.length > 0)
  console.log('🔍 [Requests] Total requests:', requests.length)
  console.log('🔍 [Requests] Filtered requests:', filteredRequests.length)
  console.log('🔍 [Requests] Data to display length:', dataToDisplay.length)
  // Calcul de la pagination
  const totalPages = Math.ceil(dataToDisplay.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedRequests = dataToDisplay.slice(startIndex, endIndex)

  // Debug logs pour la pagination
  console.log('🔍 DEBUG PAGINATION:', {
    currentPage,
    totalPages,
    dataToDisplayLength: dataToDisplay.length,
    itemsPerPage,
    startIndex,
    endIndex,
    paginatedRequestsLength: paginatedRequests.length
  })

  // Gestion du changement de page
  const handlePageChange = (page: number) => {
    console.log('📄 handlePageChange appelée avec page:', page, 'currentPage actuel:', currentPage)
    setCurrentPage(page)
  }

  // Reset de la page quand les filtres changent
  const handleFilteredDataChange = (data: Request[]) => {
    console.log('🔄 handleFilteredDataChange appelée avec', data.length, 'éléments')
    
    // Vérifier si les données ont réellement changé
    const previousData = previousFilteredDataRef.current
    const hasDataChanged = 
      isInitialLoadRef.current || 
      data.length !== previousData.length ||
      data.some((item, index) => item.id !== previousData[index]?.id)
    
    console.log('📊 Données changées:', hasDataChanged, 'Initial load:', isInitialLoadRef.current)
    
    setFilteredRequests(data)
    
    // Ne réinitialiser currentPage que si les données ont réellement changé
    if (hasDataChanged) {
      console.log('🔄 Réinitialisation de currentPage à 1')
      setCurrentPage(1)
      isInitialLoadRef.current = false
    } else {
      console.log('⏭️ Pas de réinitialisation de currentPage, données identiques')
    }
    
    // Mettre à jour la référence des données précédentes
    previousFilteredDataRef.current = [...data]
  }

  const calculateRentalDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = end.getTime() - start.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }
  const handleDownloadContract = (request: Request) => {
    const contractData = {
      referenceId: request.id,
      toolName: request.toolName || '',
      toolDescription: request.toolDescription || '',
      toolBrand: request.toolBrand || '*******',
      toolModel: request.toolModel || '*******',
      condition: request.toolCondition || '',
      ownerName: request.ownerName || '',
      ownerAddress: request.ownerAddress || '',
      ownerEmail: request.ownerEmail || '',
      ownerPhone: request.ownerPhone || '',
      renterName: request.renterName || '',
      renterAddress: request.renterAddress || '',
      renterEmail: request.renterEmail || '',
      renterPhone: request.renterPhone || '',
      startDate: request.startDate || '',
      endDate: request.endDate || '',
      pickupHour: request.pickupHour || '',
      handoverLocation: request.pickupAddress || '',
      returnLocation: request.pickupAddress || '',
      // rentalDuration = endate - startdate
      rentalDuration:
        calculateRentalDuration(request.startDate, request.endDate) + ' days',
      // total Price = (basePrice + 6%) * RentalDuration
      totalPrice: request.totalPrice || 0,
      deposit: request.deposit || 0,
    }

    generateRentalContract(contractData)

    toast({
      title: 'Contrat téléchargé',
      description:
        'Le contrat de location a été généré et téléchargé avec succès.',
    })
  }
  if (loading) {
    return (
      <div className='flex items-center justify-center h-96'>
        <Loader2 className='h-8 w-8 animate-spin' />
        <span className='ml-2'>Chargement des demandes...</span>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <MessageSquare className='h-5 w-5' />
          {t('request.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filtres */}
        <RequestsAndReservationsFilters
          data={requests}
          onFilteredDataChange={handleFilteredDataChange}
          onFilterStateChange={setIsFiltering}
          searchPlaceholder={t('request.search')}
          statusOptions={statusOptions}
        />

        <div className='space-y-4'>
          {dataToDisplay.length === 0 ? (
            <div className='text-center py-12 text-muted-foreground'>
              Aucune demande trouvée.
            </div>
          ) : (
          paginatedRequests.map((req) => (
            <div key={req.id} className='border rounded-lg p-4 space-y-3'>
              <div className='flex items-start justify-between'>
                <div className='flex gap-4'>
                  {/* Tool image */}
                  <div className='w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0'>
                    <Link to={`/tool/${req.toolId}`}>
                      <img
                        src={req.toolImage}
                        alt={req.toolName}
                        className='w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity'
                      />
                    </Link>
                  </div>
                  <div className='space-y-1'>
                    <Link
                      to={`/tool/${req.toolId}`}
                      className='font-semibold cursor-pointer hover:text-primary transition-colors'
                    >
                      {req.toolName}
                    </Link>
                    <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                      <User className='h-4 w-4' />
                      {req.renterName}
                    </div>
                    <div className='text-xs text-muted-foreground'>
                      {language === 'ar'
                        ? `${req.referenceId} : ${t('general.reference')}`
                        : `${t('general.reference')}: ${req.referenceId}`}
                    </div>
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  <Badge className={getStatusColor(req.status)}>
                    {t(`status.${req.status.toLowerCase()}`)}
                  </Badge>
                  {(req.status === 'ONGOING' || req.status === 'ACCEPTED') &&
                    req.hasActiveClaim && (
                      <Badge
                        variant='outline'
                        className='bg-orange-50 text-orange-800 border-orange-200'
                      >
                        {t('claim.in_progress')}
                      </Badge>
                    )}
                  {req.status === 'ONGOING' && req.pickupTool && (
                    <Badge
                      variant='outline'
                      className='bg-blue-50 text-orange-800 border-orange-200'
                    >
                      {t('tool.returned')}
                    </Badge>
                  )}
                </div>
              </div>

              <div className='flex items-center gap-4 text-sm text-muted-foreground'>
                <div className='flex items-center gap-1'>
                  <Calendar className='h-4 w-4' />
                  {t('request.from')} {req.startDate} {t('request.to')}{' '}
                  {req.endDate}
                </div>
                <div className='flex items-center gap-1'>
                  <Clock className='h-4 w-4' />
                  {t('request.pickup_time')} : {req.pickupHour}
                </div>
                
              </div>

              <div className='flex items-center gap-2 text-sm mt-2'>
                <DollarSign className='h-4 w-4 text-primary' />
                <span>
                  {language === 'ar'
                    ? 'المبلغ الإجمالي :'
                    : language === 'en'
                    ? 'Total amount:'
                    : 'Montant total :'}
                </span>
                <span className='font-semibold text-primary'>
                  <OptimizedPriceDisplay
                    price={Math.max(Number(req.totalPrice) * 0.94, 0)}
                    baseCurrency='GBP'
                    size='sm'
                    cible='totalPrice'
                  />
                </span>
                <span className='text-muted-foreground'>
                  {language === 'ar'
                    ? '(دون 15% من عمولة المنصة)'
                    : language === 'en'
                    ? '(including 15% platform commission)'
                    : '(dont 15% de commission plateforme)'}
                </span>
              </div>

              {req.message && (
                <div className='bg-muted/50 p-3 rounded text-sm'>
                  <div className='flex items-start gap-2'>
                    <MessageSquare className='h-4 w-4 mt-0.5 text-muted-foreground' />
                    <p>
                      {req.renterName} : {req.message}
                    </p>
                  </div>
                </div>
              )}
              {req.status === 'REJECTED' && req.refusalReason && (
                <div className='bg-muted/50 p-3 rounded text-sm'>
                  <div className='flex items-start gap-2'>
                    <MessageSquare className='h-4 w-4 mt-0.5 text-muted-foreground' />
                    <p>
                      {req.ownerName} : {req.refusalReason}
                    </p>
                    <p>{req.refusalMessage}</p>
                  </div>
                </div>
              )}

              <div className='flex gap-2 flex-wrap'>
                {/* Contract download for ACCEPTED and ONGOING requests */}
                {['ACCEPTED', 'ONGOING'].includes(req.status) && (
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => handleDownloadContract(req)}
                    className='flex items-center gap-2'
                  >
                    <Download className='h-4 w-4' />
                    {t('request.download_contract')}
                  </Button>
                )}

                {/* Actions pour les propriétaires */}
                {req.status === 'PENDING' && (
                  <>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant='default' size='sm'>
                          {t('request.accept')}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader className='!flex !flex-col !space-y-3'>
                          <AlertDialogTitle
                            className={
                              'text-lg font-semibold ' +
                              (language === 'ar' ? 'text-right' : '')
                            }
                          >
                            {t('request.confirm_acceptence')}
                          </AlertDialogTitle>
                          <AlertDialogDescription
                            className={
                              'text-sm text-muted-foreground ' +
                              (language === 'ar' ? 'text-right' : '')
                            }
                          >
                            {t('request.confirm_acceptence_message')}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>
                            {t('action.cancel')}
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleAcceptRequest(req.id)}
                          >
                            {t('action.confirm')}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    <RefusalDialog
                      onDecline={handleDeclineRequest}
                      requestId={req.id}
                    />
                  </>
                )}

                {/* Contact pour les demandes acceptées */}
                {req.status === 'ACCEPTED' && (
                  <>
                    <ContactDialog request={req as any} />
                    <ReportDialog
                      requestId={req.id}
                      onReportSubmit={handleReportSubmit}
                    />
                  </>
                )}
                {req.status === 'ONGOING' && (
                  <ContactDialog request={req as any} />
                )}
                {/* Actions pour les demandes en cours */}
                {req.status === 'ONGOING' && !req.pickupTool && (
                  <>
                    <ReportDialog
                      requestId={req.id}
                      onReportSubmit={handleReportSubmit}
                    />

                    <Button
                      variant={req.renterHasReturned ? 'default' : 'outline'}
                      size='sm'
                      disabled={!req.renterHasReturned}
                      onClick={() => handleToolRecovery(req.id)}
                    >
                      {t('request.pickup_confirm_button')}
                    </Button>
                  </>
                )}

                {/* Code de validation pour les demandes acceptées */}
                {req.status === 'ACCEPTED' && (
                  <div className='w-full mt-3 p-3 bg-blue-50 rounded border'>
                    <p className='text-sm font-medium mb-2'>
                      {t('request.validation_code')}
                    </p>
                    <div className='flex gap-2'>
                      <Input
                        placeholder={t('request.enter_code')}
                        value={validationCode}
                        onChange={(e) => setValidationCode(e.target.value)}
                        className={
                          'flex-1' + (language === 'ar' ? ' text-right' : '')
                        }
                      />
                      <Button onClick={() => handleValidationCode(req.id)}>
                        {t('action.confirm')}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Bouton pour voir les détails d'annulation */}
                {req.status === 'CANCELLED' && (
                  <CancellationDetailsDialog request={req} />
                )}

                {/* App Review button visible only after completion and hidden once reviewed */}
                {req.status === 'COMPLETED' && !hasReviewedApp && (
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setIsAppReviewDialogOpen(true)}
                  >
                    {t('review.app_title')}
                  </Button>
                )}
              </div>
            </div>
          ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className='mt-6'>
            {console.log('🎯 PAGINATION RENDUE - totalPages:', totalPages, 'currentPage:', currentPage)}
            <div className={`flex flex-row items-center gap-1 ${language === 'ar' ? '[direction:ltr]' : ''}`}>
              {/* Bouton Précédent */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (currentPage > 1) handlePageChange(currentPage - 1)
                }}
                disabled={currentPage <= 1}
                className="gap-1 pl-2.5"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Précédent</span>
              </Button>

              {/* Boutons numérotés */}
              {Array.from({ length: totalPages }, (_, index) => {
                const pageNumber = index + 1
                const isCurrentPage = pageNumber === currentPage

                return (
                  <Button
                    key={pageNumber}
                    variant={isCurrentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(pageNumber)}
                    className="w-10 h-10"
                  >
                    {pageNumber}
                  </Button>
                )
              })}

              {/* Bouton Suivant */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (currentPage < totalPages) handlePageChange(currentPage + 1)
                }}
                disabled={currentPage >= totalPages}
                className="gap-1 pr-2.5"
              >
                <span>Suivant</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Refactored Dialogs */}
        <ConfirmRecoveryDialog
          isOpen={isConfirmDialogOpen}
          onOpenChange={setIsConfirmDialogOpen}
          onConfirm={handleConfirmRecovery}
          onClaim={handleOpenClaim}
        />

        <ReviewDialog
          isOpen={isReviewDialogOpen}
          onOpenChange={setIsReviewDialogOpen}
          onSubmit={handleSubmitReview}
          bookingId={selectedRequestId}
          toolId={
            bookings.find((booking) => booking.id === selectedRequestId)?.toolId
          }
          revieweeId={
            bookings.find((booking) => booking.id === selectedRequestId)
              ?.renterId
          }
          reviewerId={user?.id}
        />

        {/* App Review Dialog */}
        <ReviewDialog
          isOpen={isAppReviewDialogOpen}
          onOpenChange={setIsAppReviewDialogOpen}
          onSubmit={handleSubmitAppReview}
          titleKey={'review.app_title'}
          reviewerId={user?.id}
        />

        <ClaimDialog
          isOpen={isClaimDialogOpen}
          onOpenChange={setIsClaimDialogOpen}
          bookingId={selectedRequestId || ''}
          onSubmit={handleSubmitClaim}
          onRefresh={fetchBookings}
        />

        {/* Modal de vue des détails de l'outil */}
        {viewToolData && (
          <AdViewDialog
            isOpen={isViewDialogOpen}
            onClose={handleViewClose}
            ad={viewToolData}
          />
        )}
      </CardContent>
    </Card>
  )
}

export default Requests
