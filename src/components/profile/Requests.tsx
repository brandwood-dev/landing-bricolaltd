import React, { useState, useEffect } from 'react'
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
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/AuthContext'
import RequestsAndReservationsFilters from './RequestsAndReservationsFilters'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

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

const Requests = () => {
  const { user } = useAuth()
  const [validationCode, setValidationCode] = useState('')
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)
  const [isClaimDialogOpen, setIsClaimDialogOpen] = useState(false)
  const [selectedRequestId, setSelectedRequestId] = useState('')
  const [filteredRequests, setFilteredRequests] = useState<Request[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(3)
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
      referenceId: `RES-${booking.id}`,
      toolName: booking.tool?.title || t('general.tool_not_specified'),
      toolDescription: booking.tool?.description || '',
      pickupAddress: booking.tool?.pickupAddress || '',
      toolImage,
      ownerName:
        `${booking.tool?.owner?.firstName || ''} ${
          booking.tool?.owner?.lastName || ''
        }`.trim() || t('general.unknown_owner'),
      ownerEmail: booking.tool?.owner?.email || '',
      ownerPhone: booking.tool?.owner?.phone_number || '',
      renterName:
        `${booking.renter?.firstName || ''} ${
          booking.renter?.lastName || ''
        }`.trim() || t('general.unknown_renter'),
      renterEmail: booking.renter?.email || '',
      renterPhone: booking.renter?.phone_number || '',
      pickupHour: booking.pickupHour,
      startDate: booking.startDate,
      endDate: booking.endDate,
      message: booking.message,
      status: booking.status,
      price: booking.totalPrice || 0,
      dailyPrice: booking.tool?.basePrice || 0,
      location:
        booking.tool?.pickupAddress || t('general.location_not_specified'),
      validationCode: booking.validationCode,
      hasActiveClaim: booking.hasActiveClaim,
      cancellationReason: booking.cancellationReason,
      cancellationMessage: booking.cancellationMessage,
      refusalReason: booking.refusalReason,
      refusalMessage: booking.refusalMessage,
      renterHasReturned: booking.renterHasReturned,
      hasUsedReturnButton: booking.hasUsedReturnButton,
      pickupTool: booking.pickupTool,
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
      const ownerBookings = await bookingService.getOwnerBookings(user.id, {
        page: 1,
        limit: 100,
      })
      console.log('ownerBookings : ', ownerBookings)

      const transformedReq = ownerBookings.data.map(transformBookingToRequest)
      setBookings(ownerBookings.data)
      setRequests(transformedReq)
    } catch (err: any) {
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
    }
  }, [user?.id])

  const handleAcceptRequest = async (requestId: string) => {
    try {
      const updatedBooking = await bookingService.acceptBooking(requestId)

      // Update local state after successful API call
      setRequests((prev) =>
        prev.map((req) =>
          req.id === requestId
            ? {
                ...req,
                status: 'ACCEPTED',
                validationCode: updatedBooking.validation_code,
              }
            : req
        )
      )

      toast({
        title: t('request.ACCEPTED.title'),
        description: `${t('request.ACCEPTED.message')} Code de validation: ${
          updatedBooking.validation_code
        }`,
      })
    } catch (error: any) {
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
      console.error('Validation code error:', error)

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
      setIsReviewDialogOpen(true)
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

  const handleSubmitReview = async (rating: number, comment: string, bookingId?: string, toolId?: string, revieweeId?: string, reviewerId?: string) => {
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

      // Send notification
      await notificationService.createNotification({
        userId: user.id,
        type: 'dispute_created',
        title: 'Dispute créée',
        message: `Une dispute a été créée pour la réservation ${selectedRequestId}`,
        data: { bookingId: selectedRequestId },
      })

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
        title: t('claim.sent'),
        description: t('claim.sent_message'),
      })

      setIsClaimDialogOpen(false)
      setSelectedRequestId('')
    } catch (error: any) {
      console.error('Error submitting claim:', error)
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
  const dataToDisplay =
    filteredRequests.length > 0 ? filteredRequests : requests

  // Calcul de la pagination
  const totalPages = Math.ceil(dataToDisplay.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedRequests = dataToDisplay.slice(startIndex, endIndex)

  // Gestion du changement de page
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Reset de la page quand les filtres changent
  const handleFilteredDataChange = (data: Request[]) => {
    setFilteredRequests(data)
    setCurrentPage(1) // Retour à la première page lors d'un changement de filtre
  }
  const handleDownloadContract = (request: Request) => {
    const contractData = {
      referenceId: request.referenceId,
      toolName: request.toolName,
      toolDescription: request.toolDescription,
      toolBrand: request.toolBrand || 'Brand',
      toolModel: request.toolModel || 'Model',
      serialNumber: request.serialNumber || '142587963hytd',
      condition: request.condition || 'New',
      accessories: '',
      ownerName: request.ownerName,
      ownerAddress: request.ownerAddress || request.location,
      ownerEmail: request.ownerEmail,
      ownerPhone: request.ownerPhone,
      renterName: request.renterName,
      renterAddress: request.renterAddress || request.location,
      renterEmail: request.renterEmail,
      renterPhone: request.renterPhone,
      startDate: request.pickupHour,
      endDate: request.pickupHour,
      pickupHour: request.pickupHour,
      handoverLocation: request.handoverLocation || request.location,
      returnLocation: request.returnLocation || request.location,
      totalPrice: request.price,
      rentalDuration: request.rentalDuration || '5',
      deposit: request.price / 10 || 0,
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
          searchPlaceholder={t('request.search')}
          statusOptions={statusOptions}
        />

        <div className='space-y-4'>
          {paginatedRequests.map((req) => (
            <div key={req.id} className='border rounded-lg p-4 space-y-3'>
              <div className='flex items-start justify-between'>
                <div className='flex gap-4'>
                  {/* Tool image */}
                  <div className='w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0'>
                    <img
                      src={req.toolImage}
                      alt={req.toolName}
                      className='w-full h-full object-cover'
                    />
                  </div>
                  <div className='space-y-1'>
                    <h3 className='font-semibold'>{req.toolName}</h3>
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
                <div className='font-semibold text-primary'>{req.price}€</div>
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
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className='mt-6'>
            <Pagination>
              <PaginationContent
                className={language === 'ar' ? '[direction:ltr]' : ''}
              >
                <PaginationItem>
                  <PaginationPrevious
                    href='#'
                    onClick={(e) => {
                      e.preventDefault()
                      if (currentPage > 1) handlePageChange(currentPage - 1)
                    }}
                    className={
                      currentPage <= 1 ? 'pointer-events-none opacity-50' : ''
                    }
                  />
                </PaginationItem>

                {Array.from({ length: totalPages }, (_, index) => {
                  const pageNumber = index + 1
                  const isCurrentPage = pageNumber === currentPage

                  return (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink
                        href='#'
                        onClick={(e) => {
                          e.preventDefault()
                          handlePageChange(pageNumber)
                        }}
                        isActive={isCurrentPage}
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  )
                })}

                <PaginationItem>
                  <PaginationNext
                    href='#'
                    onClick={(e) => {
                      e.preventDefault()
                      if (currentPage < totalPages)
                        handlePageChange(currentPage + 1)
                    }}
                    className={
                      currentPage >= totalPages
                        ? 'pointer-events-none opacity-50'
                        : ''
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
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
          toolId={bookings.find(booking => booking.id === selectedRequestId)?.toolId}
          revieweeId={bookings.find(booking => booking.id === selectedRequestId)?.renterId}
          reviewerId={user?.id}
        />
 
        <ClaimDialog
          isOpen={isClaimDialogOpen}
          onOpenChange={setIsClaimDialogOpen}
          bookingId={selectedRequestId || ''}
          onSubmit={handleSubmitClaim}
          onRefresh={fetchBookings}
        />
      </CardContent>
    </Card>
  )
}

export default Requests
