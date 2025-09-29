import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
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
  MessageSquare,
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
import { disputeService } from '@/services/disputeService'
import { reviewsService } from '@/services/reviewsService'
import { api } from '@/services/api'
import { Booking, BookingStatus, Reservation } from '@/types/bridge'




const Reservations = () => {
  //user
  const { user } = useAuth()
  const { id } = useParams()
  const { toast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const [showValidationCode, setShowValidationCode] = useState<{
    [key: string]: boolean
  }>({})
  const [copiedCode, setCopiedCode] = useState<{ [key: string]: boolean }>({})
  const [cancellationReason, setCancellationReason] = useState('')
  const [cancellationMessage, setCancellationMessage] = useState('')
  const [reportReason, setReportReason] = useState('')
  const [reportMessage, setReportMessage] = useState('')
  // const [claimType, setClaimType] = useState('')
  // const [claimDescription, setClaimDescription] = useState('')
  const [rating, setRating] = useState(0)
  const [reviewComment, setReviewComment] = useState('')
  const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false)
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)
  const [isClaimDialogOpen, setIsClaimDialogOpen] = useState(false)
  const [selectedReservationId, setSelectedReservationId] = useState('')
  const [reviewType, setReviewType] = useState<'tool' | 'app'>('tool')
  const [hasReviewedApp, setHasReviewedApp] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [filteredReservations, setFilteredReservations] = useState<
    Reservation[]
  >([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(5)

  //loading
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const transformBookingToReservation = (booking: Booking): Reservation => {
    // Get primary photo or fallback to first photo
    const primaryPhoto = booking.tool?.photos?.find((photo) => photo.isPrimary)
    const toolImage =
      primaryPhoto?.url ||
      booking.tool?.photos?.[0]?.url ||
      'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=300&fit=crop'

    return {
      id: booking.id,
      referenceId: `RES-${booking.id}`,
      toolId: booking.tool?.id || '',
      toolName: booking.tool?.title || t('general.tool_not_specified'),
      toolDescription: booking.tool?.description || '',
      pickupAddress: booking.tool?.pickupAddress || '',
      toolImage,
      toolBrand: booking.tool?.brand || '',
      toolModel: booking.tool?.model || '',
      //  NEW = 1,      LIKE_NEW = 2,      GOOD = 3,      FAIR = 4,      POOR = 5,
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
      ownerId: booking.tool?.owner?.id || '',
      owner:
        `${booking.tool?.owner?.firstName || ''} ${
          booking.tool?.owner?.lastName || ''
        }`.trim() || t('general.unknown_owner'),
      ownerEmail: booking.tool?.owner?.email || '',
      ownerPhone: booking.tool?.owner?.phoneNumber || '',
      ownerAddress: booking.tool?.owner?.address || '',
      renterId: booking.renter?.id || '',
      renterName:
        `${booking.renter?.firstName || ''} ${
          booking.renter?.lastName || ''
        }`.trim() || t('general.unknown_renter'),
      renterEmail: booking.renter?.email || '',
      renterPhone: booking.renter?.phoneNumber || '',
      renterAddress: booking.renter?.address || '',
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
  console.log('toolId', reservations[0]?.toolId)
  // Vérifier si l'utilisateur a déjà noté l'application
  const checkUserAppReview = async () => {
    if (!user?.id) return

    try {
      const result = await reviewsService.checkUserAppReview(user.id)
      setHasReviewedApp(result.hasReviewed)
    } catch (error) {
      console.error(
        "Erreur lors de la vérification de l'avis d'application:",
        error
      )
    }
  }

  // API data loading
  const loadBookings = async () => {
    if (!user?.id) {
      setError(t('auth.user_not_found'))
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const bookingsData = await bookingService.getUserBookings(user.id, {
        page: 1,
        limit: 100,
      })
      console.log('📊 Données bookings avec photos:', bookingsData)
      console.log(
        '🔍 Premier booking complet:',
        JSON.stringify(bookingsData[0], null, 2)
      )
      console.log('🛠️ Outil du premier booking:', bookingsData[0]?.tool)
      console.log('📸 Photos du premier outil:', bookingsData[0]?.tool?.photos)
      const transformedReservations = bookingsData.map(
        transformBookingToReservation
      )
      setReservations(transformedReservations)
      // setBookings(transformedReservations)
    } catch (err: any) {
      setError(err.message || t('reservation.load_error'))
      setReservations([])
      // setBookings([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.id) {
      loadBookings()
      checkUserAppReview()
    }
  }, [user?.id])

  const getStatusColor = (status: string) => {
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
        return 'bg-red-100 text-red-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    return t(`status.${status}`) || status
  }

  const isCancellationAllowed = (startDate: string) => {
    const today = new Date()
    const start = new Date(startDate)
    today.setHours(0, 0, 0, 0)
    start.setHours(0, 0, 0, 0)
    return today < start
  }

  //doit etre dynamic
  const handleCancelReservation = async (reservationId: string) => {
    if (!cancellationReason) {
      toast({
        title: 'Erreur',
        description: "Veuillez sélectionner une raison d'annulation.",
        variant: 'destructive',
      })
      return
    }

    try {
      const cancelledBooking = await bookingService.cancelBooking(
        reservationId,
        cancellationReason,
        cancellationMessage
      )

      // Transform the cancelled booking from API to Reservation format
      const transformedReservation =
        transformBookingToReservation(cancelledBooking)

      // Update local state with the transformed reservation
      setReservations((prev) =>
        prev.map((res) =>
          res.id === reservationId ? transformedReservation : res
        )
      )

      toast({
        title: t('booking.CANCELLED'),
        description: t('booking.CANCELLED_message'),
      })

      setCancellationReason('')
      setCancellationMessage('')
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description:
          error.message || "Erreur lors de l'annulation de la réservation",
        variant: 'destructive',
      })
    }
  }
  const calculateRentalDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = end.getTime() - start.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }
  const handleDownloadContract = (reservation: Reservation) => {
    const contractData = {
      referenceId: reservation.referenceId,
      toolId: reservation.toolId,
      toolName: reservation.toolName,
      toolDescription: reservation.toolDescription,
      toolBrand: reservation.toolBrand || 'Brand',
      toolModel: reservation.toolModel || 'Model',
      serialNumber: reservation.toolBrand + reservation.toolModel + '2025',
      condition: reservation.toolCondition || 'New',
      accessories: '',
      ownerId: reservation.ownerId,
      ownerName: reservation.owner,
      ownerAddress: reservation.ownerAddress,
      ownerEmail: reservation.ownerEmail,
      ownerPhone: reservation.ownerPhone,
      renterId: reservation.renterId,
      renterName: reservation.renterName,
      renterAddress: reservation.renterAddress,
      renterEmail: reservation.renterEmail,
      renterPhone: reservation.renterPhone,
      startDate: reservation.pickupHour,
      endDate: reservation.pickupHour,
      pickupHour: reservation.pickupHour,
      handoverLocation: reservation.pickupAddress,
      returnLocation: reservation.pickupAddress,
      // rentalDuration = endate - startdate
      rentalDuration:
        calculateRentalDuration(reservation.startDate, reservation.endDate) +
        ' days',
      // total Price = (basePrice + 6%) * RentalDuration
      totalPrice:
        (reservation.dailyPrice + reservation.dailyPrice * 0.06) *
        Number(
          calculateRentalDuration(reservation.startDate, reservation.endDate)
        ),
      deposit: reservation.price / 10 || 0,
    }

    generateRentalContract(contractData)

    toast({
      title: 'Contrat téléchargé',
      description:
        'Le contrat de location a été généré et téléchargé avec succès.',
    })
  }
  const handleDetailClick = (toolId: string) => {
    navigate(`/tool/${toolId}`)
    // }
  }
  //doit etre dynamic
  const handleReport = async (reservationId: string) => {
    if (!reportReason || !reportMessage) {
      toast({
        title: t('general.error'),
        description: t('general.report_error_message'),
        variant: 'destructive',
      })
      return
    }

    if (!user?.id) {
      toast({
        title: t('general.error'),
        description: 'Utilisateur non connecté',
        variant: 'destructive',
      })
      return
    }

    try {
      // Créer une dispute via l'API
      await disputeService.createDispute({
        userId: user.id,
        bookingId: reservationId,
        reason: reportReason,
        description: reportMessage,
      })

      // Marquer la réservation comme ayant une réclamation active
      setReservations((prev) =>
        prev.map((res) =>
          res.id === reservationId ? { ...res, hasActiveClaim: true } : res
        )
      )

      toast({
        title: t('request.report.ACCEPTED.title'),
        description: t('request.report.ACCEPTED.message'),
      })

      setReportReason('')
      setReportMessage('')
    } catch (error: any) {
      console.error('Erreur lors de la création de la dispute:', error)
      toast({
        title: t('general.error'),
        description:
          error.message || 'Erreur lors de la création du signalement',
        variant: 'destructive',
      })
    }
  }

  const handleToolReturn = (reservationId: string) => {
    setSelectedReservationId(reservationId)
    setIsReturnDialogOpen(true)
  }

  //doit etre dynamic
  const handleConfirmReturn = async () => {
    if (!selectedReservationId) return

    try {
      // Appel à l'API backend pour confirmer le retour
      await bookingService.confirmToolReturn(selectedReservationId)

      // Mise à jour de l'état local après succès de l'API
      setReservations((prev) =>
        prev.map((res) =>
          res.id === selectedReservationId
            ? {
                ...res,
                renterHasReturned: true,
                hasUsedReturnButton: true,
              }
            : res
        )
      )

      toast({
        title: t('tool.return.confirmed'),
        description: t('tool.return.confirmed_message'),
      })

      setIsReturnDialogOpen(false)
      setSelectedReservationId('')
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description:
          error.message || "Impossible de confirmer le retour de l'outil",
        variant: 'destructive',
      })
    }
  }

  const handleOpenReturnClaim = (reservationId: string) => {
    // Vérifier si la réservation a déjà une réclamation active
    const reservation = reservations.find((res) => res.id === reservationId)
    if (reservation?.hasActiveClaim) {
      toast({
        title: 'Réclamation existante',
        description:
          'Une réclamation active existe déjà pour cette réservation.',
        variant: 'destructive',
      })
      return
    }

    setSelectedReservationId(reservationId)
    setIsClaimDialogOpen(true)
  }
  // doit etre dynamic -> save in bookings -> save in disputes (add attribut photo)
  const handleSubmitClaim = async () => {
    if (!reportReason || !reportMessage) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs obligatoires.',
        variant: 'destructive',
      })
      return
    }

    if (!selectedReservationId) {
      toast({
        title: 'Erreur',
        description: 'Aucune réservation sélectionnée.',
        variant: 'destructive',
      })
      return
    }

    // Validation des fichiers
    if (uploadedFiles.length > 0) {
      const maxSize = 1024 * 1024 // 1MB
      const invalidFiles = uploadedFiles.filter((file) => file.size > maxSize)

      if (invalidFiles.length > 0) {
        toast({
          title: 'Erreur',
          description: `Certains fichiers dépassent la taille limite de 1MB.`,
          variant: 'destructive',
        })
        return
      }
    }

    try {
      setIsSubmitting(true)

      // Appel au service pour créer la dispute avec images
      const disputeData = {
        userId: user?.id || '',
        bookingId: selectedReservationId,
        reason: reportReason,
        reportReason,
        reportMessage,
      }

      let response
      if (uploadedFiles.length > 0) {
        response = await disputeService.createDisputeWithImages(
          disputeData,
          uploadedFiles
        )
      } else {
        response = await disputeService.createDispute(disputeData)
      }

      // Si on arrive ici, la requête a réussi (pas d'exception)
      console.log('✅ Dispute créée avec succès:', response)

      // Afficher le toast de succès
      toast({
        title: t('claim.sent'),
        description: t('claim.sent_message'),
      })

      // Fermer le modal
      console.log('🔄 Fermeture du modal...')
      setIsClaimDialogOpen(false)

      // Réinitialiser le formulaire
      console.log('🧹 Réinitialisation du formulaire...')
      setReportReason('')
      setReportMessage('')
      setSelectedReservationId('')
      setUploadedFiles([])

      // Rafraîchir la liste des réservations
      console.log('🔄 Rafraîchissement de la liste...')
      await loadBookings()
      console.log('✅ Processus terminé avec succès')
    } catch (error: any) {
      console.error('Erreur lors de la création de la dispute:', error)

      let errorMessage =
        "Une erreur est survenue lors de l'envoi de la réclamation."

      // Gestion spécifique des erreurs 400
      if (error.response?.status === 400) {
        const responseData = error.response?.data
        if (responseData?.message) {
          errorMessage = responseData.message
        }
      }

      toast({
        title: 'Erreur',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Fonctions de gestion des fichiers
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    addFiles(files)
  }

  const handleFileDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const files = Array.from(event.dataTransfer.files)
    addFiles(files)
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  const addFiles = (files: File[]) => {
    const imageFiles = files.filter((file) => file.type.startsWith('image/'))
    const maxSize = 1024 * 1024 // 1MB
    const validFiles = imageFiles.filter((file) => file.size <= maxSize)
    const invalidFiles = imageFiles.filter((file) => file.size > maxSize)

    if (invalidFiles.length > 0) {
      toast({
        title: 'Fichiers trop volumineux',
        description: `${invalidFiles.length} fichier(s) dépassent la limite de 1MB et ont été ignorés.`,
        variant: 'destructive',
      })
    }

    if (validFiles.length > 0) {
      setUploadedFiles((prev) => [...prev, ...validFiles])
      toast({
        title: 'Fichiers ajoutés',
        description: `${validFiles.length} fichier(s) ajouté(s) avec succès.`,
      })
    }
  }

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`
  }

  const handleEmail = (email: string) => {
    window.location.href = `mailto:${email}`
  }

  const toggleValidationCode = (reservationId: string) => {
    setShowValidationCode((prev) => ({
      ...prev,
      [reservationId]: !prev[reservationId],
    }))
  }

  const copyValidationCode = async (code: string, reservationId: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode((prev) => ({ ...prev, [reservationId]: true }))
      toast({
        title: t('code.copied'),
        description: t('code.copied_message'),
      })
      setTimeout(() => {
        setCopiedCode((prev) => ({ ...prev, [reservationId]: false }))
      }, 2000)
    } catch (err) {
      toast({
        title: 'Erreur',
        description: 'Impossible de copier le code.',
        variant: 'destructive',
      })
    }
  }

  const statusOptions = [
    { value: 'PENDING', label: 'En attente' },
    { value: 'ACCEPTED', label: 'Acceptée' },
    { value: 'ONGOING', label: 'En cours' },
    { value: 'COMPLETED', label: 'Terminée' },
    { value: 'CANCELLED', label: 'Annulée' },
    { value: 'REJECTED', label: 'Refusée' },
  ]

  // Données à paginer
  const dataToDisplay =
    filteredReservations.length > 0 ? filteredReservations : reservations

  // Calcul de la pagination
  const totalPages = Math.ceil(dataToDisplay.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedReservations = dataToDisplay.slice(startIndex, endIndex)

  // Gestion du changement de page
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Reset de la page quand les filtres changent
  const handleFilteredDataChange = (data: Reservation[]) => {
    setFilteredReservations(data)
    setCurrentPage(1) // Retour à la première page lors d'un changement de filtre
  }

  const handleOpenReview = (reservationId: string) => {
    setSelectedReservationId(reservationId)
    setIsReviewDialogOpen(true)
  }
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedReservationId || !user?.id) return

    try {
      if (reviewType === 'app') {
        // Créer un avis d'application
        await reviewsService.createAppReview({
          rating: rating,
          comment: reviewComment,
          reviewerId: user.id,
        })

        toast({
          title: t('review.success'),
          description: "Merci pour votre avis sur l'application !",
        })

        // Mettre à jour l'état pour cacher le bouton
        setHasReviewedApp(true)
      } else {
        // Créer un avis d'outil avec tous les paramètres requis
        const selectedReservation = reservations.find(r => r.id === selectedReservationId)
        if (!selectedReservation) {
          console.error('Selected reservation not found')
          return
        }

        await reviewsService.createToolReview({
          bookingId: selectedReservation.id,
          toolId: selectedReservation.toolId,
          reviewerId: user.id,
          revieweeId: selectedReservation.ownerId,
          rating: rating,
          comment: reviewComment,
        })

        toast({
          title: t('review.success'),
          description: t('review.success_message'),
        })
      }

      setReviewComment('')
      setRating(0)
      setIsReviewDialogOpen(false)

      // Actualiser la liste des réservations si nécessaire
      if (reviewType === 'tool') {
        const updatedReservations = await api.get('/reservations')
        handleFilteredDataChange(updatedReservations.data)
      }
    } catch (error) {
      console.error('Error creating review:', error)
      
      // Vérifier si c'est l'erreur spécifique "A tool review already exists for this booking"
      if (error.response?.data?.message?.includes('A tool review already exists for this booking')) {
        toast({
          title: 'Avis déjà existant',
          description: 'Vous avez déjà laissé un avis pour cette réservation',
          variant: 'destructive',
        })
      } else {
        // Gestion générique des autres erreurs
        toast({
          title: t('review.error'),
          description: t('review.error_message'),
          variant: 'destructive',
        })
      }
    }
  }
  const { t, language } = useLanguage()

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Calendar className='h-5 w-5' />
          {t('booking.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filtres */}
        <RequestsAndReservationsFilters
          data={reservations}
          onFilteredDataChange={handleFilteredDataChange}
          searchPlaceholder={t('booking.search')}
          statusOptions={statusOptions}
        />

        <div className='space-y-6'>
          {paginatedReservations.map((reservation) => (
            <Card key={reservation.id} className='overflow-hidden'>
              <CardContent className='p-0'>
                <div className='flex flex-col md:flex-row'>
                  {/* Image de l'outil */}
                  <div className='w-full md:w-32 h-48 md:h-32 flex-shrink-0'>
                    <Link
                      to={`/tool/${reservation.toolId}`}
                      className='block w-full h-full'
                    >
                      <img
                        src={reservation.toolImage}
                        alt={reservation.toolName}
                        className='w-full h-full object-cover hover:opacity-90 transition-opacity cursor-pointer'
                      />
                    </Link>
                  </div>

                  {/* Contenu principal */}
                  <div className='flex-1 p-4 md:p-6'>
                    <div className='flex flex-col lg:flex-row lg:justify-between lg:items-start mb-4'>
                      <div className='flex-1'>
                        <div className='flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2'>
                          <Link
                            to={`/tool/${reservation.toolId}`}
                            className='hover:text-blue-600 transition-colors'
                          >
                            <h3 className='text-lg font-semibold text-gray-900 cursor-pointer'>
                              {reservation.toolName}
                            </h3>
                          </Link>
                          <Badge className={getStatusColor(reservation.status)}>
                            {t(`status.${reservation.status.toLowerCase()}`)}
                          </Badge>
                          {(reservation.status === 'ONGOING' ||
                            reservation.status === 'ACCEPTED') &&
                            reservation.renterHasReturned &&
                            !reservation.pickupTool && (
                              <Badge
                                variant='outline'
                                className='bg-blue-50 text-blue-800 border-blue-200'
                              >
                                {t('booking.wait')}
                              </Badge>
                            )}
                          {reservation.status === 'ONGOING' &&
                            reservation.hasActiveClaim && (
                              <Badge
                                variant='outline'
                                className='bg-orange-50 text-orange-800 border-orange-200'
                              >
                                {t('claim.in_progress')}
                              </Badge>
                            )}
                          {reservation.status === 'ACCEPTED' &&
                            reservation.hasActiveClaim && (
                              <Badge
                                variant='outline'
                                className='bg-orange-50 text-orange-800 border-orange-200'
                              >
                                {t('claim.in_progress')}
                              </Badge>
                            )}
                          {(reservation.status === 'ONGOING' ||
                            reservation.status === 'ACCEPTED') &&
                            reservation.pickupTool && (
                              <Badge
                                variant='outline'
                                className='bg-blue-50 text-orange-800 border-orange-200'
                              >
                                {t('tool.returned')}
                              </Badge>
                            )}
                        </div>

                        <div className='flex items-center gap-2 text-sm text-gray-600 mb-2'>
                          <User className='h-4 w-4' />
                          <span>
                            {t('general.by')} {reservation.owner}
                          </span>
                        </div>

                        <div className='text-xs text-gray-500 mb-3'>
                          {language === 'ar'
                            ? `${reservation.referenceId} : ${t(
                                'general.reference'
                              )}`
                            : `${t('general.reference')}: ${
                                reservation.referenceId
                              }`}
                        </div>

                        <p className='text-sm text-gray-600 mb-4'>
                          D! : {reservation.toolDescription}
                        </p>

                        <div className='flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600 mb-4'>
                          <div className='flex items-center gap-1'>
                            <Calendar className='h-4 w-4' />
                            <span>
                              {t('general.from')} {reservation.startDate}{' '}
                              {t('general.to')} {reservation.endDate}
                            </span>
                          </div>
                          <div className='flex items-center gap-1'>
                            <MapPin className='h-4 w-4' />
                            <span>{reservation.location}</span>
                          </div>
                        </div>
                      </div>

                      <div className='text-left lg:text-right mt-4 lg:mt-0'>
                        <div className='text-2xl font-bold text-blue-600 mb-2'>
                          {reservation.price}€
                        </div>
                        <div className='text-sm text-gray-500'>
                          {reservation.dailyPrice}€/{t('general.day')}
                        </div>
                      </div>
                    </div>
                    {reservation.status === 'REJECTED' &&
                      reservation.refusalReason && (
                        <div className='bg-muted/50 p-3 rounded text-sm'>
                          <div className='flex items-start gap-2'>
                            <MessageSquare className='h-4 w-4 mt-0.5 text-muted-foreground' />
                            <p>
                              {reservation.owner} : {reservation.refusalReason}
                            </p>
                            <p>{reservation.refusalMessage}</p>
                          </div>
                        </div>
                      )}
                    {/* Actions */}
                    <div className='flex gap-2 flex-wrap'>
                      {/* Actions pour statut "En attente" */}
                      {reservation.status === 'PENDING' && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant='outline' size='sm'>
                              {t('action.cancel')}
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader
                              className={`${
                                language === 'ar' ? 'flex justify-end' : ''
                              }`}
                            >
                              <DialogTitle>
                                {t('reservation.cancel.title')}
                              </DialogTitle>
                            </DialogHeader>
                            <div className='space-y-4'>
                              <Select
                                value={cancellationReason}
                                onValueChange={setCancellationReason}
                              >
                                <SelectTrigger>
                                  <SelectValue
                                    placeholder={t('reservation.cancel.reason')}
                                  />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value='change-plans'>
                                    {t('reservation.cancel.reason.unavailable')}
                                  </SelectItem>
                                  <SelectItem value='found-alternative'>
                                    {t(
                                      'reservation.cancel.reason.other_alternative'
                                    )}
                                  </SelectItem>
                                  <SelectItem value='no-longer-needed'>
                                    {t('reservation.cancel.reason.not_needed')}
                                  </SelectItem>
                                  <SelectItem value='other'>
                                    {t('reservation.cancel.reason.other')}
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <Textarea
                                placeholder={t('reservation.cancel.message')}
                                value={cancellationMessage}
                                onChange={(e) =>
                                  setCancellationMessage(e.target.value)
                                }
                              />
                              <Button
                                onClick={() =>
                                  handleCancelReservation(reservation.id)
                                }
                                className='w-full'
                              >
                                {t('reservation.cancel.confirm')}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}

                      {/* Actions pour statut "Acceptée" */}
                      {reservation.status === 'ACCEPTED' && (
                        <>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant='outline'
                                size='sm'
                                disabled={
                                  !isCancellationAllowed(reservation.startDate)
                                }
                                className={
                                  !isCancellationAllowed(reservation.startDate)
                                    ? 'opacity-50 cursor-not-allowed'
                                    : ''
                                }
                              >
                                {t('general.cancel')}
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader
                                className={`${
                                  language === 'ar' ? 'flex justify-end' : ''
                                }`}
                              >
                                <DialogTitle>
                                  {t('reservation.cancel.title')}
                                </DialogTitle>
                              </DialogHeader>
                              <div className='space-y-4'>
                                <Select
                                  value={cancellationReason}
                                  onValueChange={setCancellationReason}
                                >
                                  <SelectTrigger>
                                    <SelectValue
                                      placeholder={t(
                                        'reservation.cancel.reason'
                                      )}
                                    />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value='change-plans'>
                                      {t(
                                        'reservation.cancel.reason.not_needed'
                                      )}
                                    </SelectItem>
                                    <SelectItem value='found-alternative'>
                                      {t(
                                        'reservation.cancel.reason.other_alternative'
                                      )}
                                    </SelectItem>
                                    <SelectItem value='no-longer-needed'>
                                      {t(
                                        'reservation.cancel.reason.unavailable'
                                      )}
                                    </SelectItem>
                                    <SelectItem value='other'>
                                      {t('reservation.cancel.reason.other')}
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                <Textarea
                                  placeholder={t('reservation.cancel.message')}
                                  value={cancellationMessage}
                                  onChange={(e) =>
                                    setCancellationMessage(e.target.value)
                                  }
                                />
                                <Button
                                  onClick={() =>
                                    handleCancelReservation(reservation.id)
                                  }
                                  className='w-full'
                                >
                                  {t('reservation.cancel.confirm')}
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => handleDownloadContract(reservation)}
                            className='flex items-center gap-2'
                          >
                            <Download className='h-4 w-4' />
                            {t('general.download_contract')}
                          </Button>

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant='outline' size='sm'>
                                {t('general.contact')}
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader
                                className={`${
                                  language === 'ar' ? 'flex justify-end' : ''
                                }`}
                              >
                                <DialogTitle>
                                  {t('request.contact_owner_information')}
                                </DialogTitle>
                              </DialogHeader>
                              <div className='space-y-4'>
                                <div
                                  className={`flex items-center gap-3 ${
                                    language === 'ar' ? 'justify-end' : ''
                                  }`}
                                >
                                  {language === 'ar' ? (
                                    <>
                                      <div>
                                        <h3 className='font-semibold'>
                                          {reservation.owner}
                                        </h3>
                                        <p className='text-sm text-muted-foreground'>
                                          {reservation.ownerEmail}
                                        </p>
                                        <p className='text-sm text-muted-foreground'>
                                          {reservation.ownerPhone}
                                        </p>
                                      </div>
                                      <Avatar className='h-12 w-12'>
                                        <AvatarImage src='' />
                                        <AvatarFallback>
                                          {reservation.owner
                                            ?.split(' ')
                                            .map((n) => n[0])
                                            .join('')}
                                        </AvatarFallback>
                                      </Avatar>
                                    </>
                                  ) : (
                                    <>
                                      <Avatar className='h-12 w-12'>
                                        <AvatarImage src='' />
                                        <AvatarFallback>
                                          {reservation.owner
                                            ?.split(' ')
                                            .map((n) => n[0])
                                            .join('')}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <h3 className='font-semibold'>
                                          {reservation.owner}
                                        </h3>
                                        <p className='text-sm text-muted-foreground'>
                                          {reservation.ownerEmail}
                                        </p>
                                        <p className='text-sm text-muted-foreground'>
                                          {reservation.ownerPhone}
                                        </p>
                                      </div>
                                    </>
                                  )}
                                </div>

                                <div className='flex gap-2'>
                                  <Button
                                    onClick={() =>
                                      handleCall(reservation.ownerPhone)
                                    }
                                    className='flex-1 flex items-center gap-2'
                                  >
                                    <Phone className='h-4 w-4' />
                                    {t('request.call')}
                                  </Button>
                                  <Button
                                    variant='outline'
                                    onClick={() =>
                                      handleEmail(reservation.ownerEmail)
                                    }
                                    className='flex-1 flex items-center gap-2'
                                  >
                                    <Mail className='h-4 w-4' />
                                    {t('request.mail')}
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant='outline'
                                size='sm'
                                disabled={reservation.hasActiveClaim}
                              >
                                <Flag className='h-4 w-4 mr-1' />
                                {t('general.report')}
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader
                                className={`${
                                  language === 'ar' ? 'flex justify-end' : ''
                                }`}
                              >
                                <DialogTitle>
                                  {t('booking.report.title')}
                                </DialogTitle>
                              </DialogHeader>
                              <div className='space-y-4'>
                                <Select
                                  value={reportReason}
                                  onValueChange={setReportReason}
                                >
                                  <SelectTrigger>
                                    <SelectValue
                                      placeholder={t('booking.report.reason')}
                                    />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {language === 'en' ? (
                                      <>
                                        <SelectItem value='not-compliant'>
                                          Tool not compliant with the listing
                                        </SelectItem>
                                        <SelectItem value='poor-condition'>
                                          Tool in poor condition or defective
                                        </SelectItem>
                                        <SelectItem value='delay'>
                                          Delay in delivery / pickup
                                        </SelectItem>
                                        <SelectItem value='unsafe'>
                                          Dangerous / unsafe tool
                                        </SelectItem>
                                        <SelectItem value='inappropriate'>
                                          Inappropriate behavior of the provider
                                        </SelectItem>
                                        <SelectItem value='fraud'>
                                          Suspicion of scam or fraud
                                        </SelectItem>
                                        <SelectItem value='no-response'>
                                          No response from the provider
                                        </SelectItem>
                                        <SelectItem value='wrong-contact'>
                                          Incorrect / unreachable phone number
                                        </SelectItem>
                                        <SelectItem value='other'>
                                          Other
                                        </SelectItem>
                                      </>
                                    ) : language === 'fr' ? (
                                      <>
                                        <SelectItem value='not-compliant'>
                                          Outil non conforme à l'annonce
                                        </SelectItem>
                                        <SelectItem value='poor-condition'>
                                          Outil en mauvais état ou défectueux
                                        </SelectItem>
                                        <SelectItem value='delay'>
                                          Retard de livraison / récupération
                                        </SelectItem>
                                        <SelectItem value='unsafe'>
                                          Outil dangereux / non sécurisé
                                        </SelectItem>
                                        <SelectItem value='inappropriate'>
                                          Comportement inapproprié du
                                          propriétaire
                                        </SelectItem>
                                        <SelectItem value='fraud'>
                                          Suspicion d'arnaque ou fraude
                                        </SelectItem>
                                        <SelectItem value='no-response'>
                                          Pas de réponse du propriétaire
                                        </SelectItem>
                                        <SelectItem value='wrong-contact'>
                                          Numéro incorrect / injoignable
                                        </SelectItem>
                                        <SelectItem value='other'>
                                          Autre
                                        </SelectItem>
                                      </>
                                    ) : (
                                      <>
                                        <SelectItem value='not-compliant'>
                                          الأداة غير مطابقة للإعلان
                                        </SelectItem>
                                        <SelectItem value='poor-condition'>
                                          أداة في حالة سيئة أو معطلة
                                        </SelectItem>
                                        <SelectItem value='delay'>
                                          تأخير في التسليم / الاستلام
                                        </SelectItem>
                                        <SelectItem value='unsafe'>
                                          أداة خطرة / غير آمنة
                                        </SelectItem>
                                        <SelectItem value='inappropriate'>
                                          سلوك غير لائق من المزود
                                        </SelectItem>
                                        <SelectItem value='fraud'>
                                          شبهة احتيال أو نصب
                                        </SelectItem>
                                        <SelectItem value='no-response'>
                                          لا يوجد رد من المزود
                                        </SelectItem>
                                        <SelectItem value='wrong-contact'>
                                          رقم هاتف غير صحيح / لا يمكن الوصول
                                          إليه
                                        </SelectItem>
                                        <SelectItem value='other'>
                                          أخرى
                                        </SelectItem>
                                      </>
                                    )}
                                  </SelectContent>
                                </Select>
                                <Textarea
                                  placeholder={t('booking.report.describe')}
                                  value={reportMessage}
                                  onChange={(e) =>
                                    setReportMessage(e.target.value)
                                  }
                                />
                                <Button
                                  onClick={() => handleReport(reservation.id)}
                                  className='w-full'
                                >
                                  {t('booking.report.submit')}
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </>
                      )}

                      {/* Actions pour statut "En cours" */}
                      {reservation.status === 'ONGOING' && (
                        <>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => handleToolReturn(reservation.id)}
                            disabled={reservation.hasUsedReturnButton}
                            className={
                              reservation.hasUsedReturnButton
                                ? 'opacity-50 cursor-not-allowed'
                                : ''
                            }
                          >
                            {t('booking.tool_returned')}
                          </Button>

                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => handleDownloadContract(reservation)}
                            className='flex items-center gap-2'
                          >
                            <Download className='h-4 w-4' />
                            {t('general.download_contract')}
                          </Button>

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant='outline' size='sm'>
                                {t('general.contact')}
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>
                                  Informations du propriétaire
                                </DialogTitle>
                              </DialogHeader>
                              <div className='space-y-4'>
                                <div className='flex items-center gap-3'>
                                  <Avatar className='h-12 w-12'>
                                    <AvatarImage src='' />
                                    <AvatarFallback>
                                      {reservation.owner
                                        .split(' ')
                                        .map((n) => n[0])
                                        .join('')}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <h3 className='font-semibold'>
                                      {reservation.owner}
                                    </h3>
                                    <p className='text-sm text-muted-foreground'>
                                      {reservation.ownerEmail}
                                    </p>
                                    <p className='text-sm text-muted-foreground'>
                                      {reservation.ownerPhone}
                                    </p>
                                  </div>
                                </div>

                                <div className='flex gap-2'>
                                  <Button
                                    onClick={() =>
                                      handleCall(reservation.ownerPhone)
                                    }
                                    className='flex-1 flex items-center gap-2'
                                  >
                                    <Phone className='h-4 w-4' />
                                    Appeler
                                  </Button>
                                  <Button
                                    variant='outline'
                                    onClick={() =>
                                      handleEmail(reservation.ownerEmail)
                                    }
                                    className='flex-1 flex items-center gap-2'
                                  >
                                    <Mail className='h-4 w-4' />
                                    E-mail
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          {/* conditionner avec status */}
                          {reservation.hasActiveClaim === false && (
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() =>
                                handleOpenReturnClaim(reservation.id)
                              }
                              className='flex items-center gap-2'
                            >
                              <Flag className='h-4 w-4 mr-1' />
                              {t('general.report')}
                            </Button>
                          )}
                          {/* <Dialog>
                            <DialogTrigger asChild>
                              <Button variant='outline' size='sm'>
                                <Flag className='h-4 w-4 mr-1' />
                                {t('general.report')}
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Signaler un problème</DialogTitle>
                              </DialogHeader>
                              <div className='space-y-4'>
                                <Select
                                  value={reportReason}
                                  onValueChange={setReportReason}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder='Sélectionnez une raison' />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value='no-response'>
                                      Ne répond pas
                                    </SelectItem>
                                    <SelectItem value='wrong-number'>
                                      Numéro incorrect
                                    </SelectItem>
                                    <SelectItem value='inappropriate'>
                                      Comportement inapproprié
                                    </SelectItem>
                                    <SelectItem value='other'>Autre</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Textarea
                                  placeholder='Décrivez le problème'
                                  value={reportMessage}
                                  onChange={(e) =>
                                    setReportMessage(e.target.value)
                                  }
                                />
                                <Button
                                  onClick={() => handleReport(reservation.id)}
                                  className='w-full'
                                >
                                  Envoyer le signalement
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog> */}
                        </>
                      )}

                      {/* Bouton pour voir les détails d'annulation */}
                      {reservation.status === 'CANCELLED' && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant='outline' size='sm'>
                              <Eye className='h-4 w-4 mr-1' />
                              {t('general.view_details')}
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader
                              className={`${
                                language === 'ar' ? 'flex justify-end' : ''
                              }`}
                            >
                              <DialogTitle>
                                {t('cancellation.details.title')}
                              </DialogTitle>
                            </DialogHeader>
                            <div className='space-y-3'>
                              <div>
                                <strong>
                                  {t('cancellation.details.reason')} :
                                </strong>{' '}
                                {reservation.cancellationReason}
                              </div>
                              {reservation.cancellationMessage && (
                                <div>
                                  <strong>
                                    {t('cancellation.details.message')} :
                                  </strong>{' '}
                                  {reservation.cancellationMessage}
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>

                    {/* Section code de validation modernisée */}
                    {reservation.status === 'ACCEPTED' &&
                      reservation.validationCode && (
                        <div className='mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200'>
                          <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-3'>
                              <div className='w-2 h-2 bg-blue-500 rounded-full animate-pulse'></div>
                              <span className='text-sm font-medium text-blue-900'>
                                {t('booking.verification_code')}
                              </span>
                            </div>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() =>
                                toggleValidationCode(reservation.id)
                              }
                              className='text-blue-700 hover:text-blue-900 hover:bg-blue-100'
                            >
                              {showValidationCode[reservation.id] ? (
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
                          </div>

                          {showValidationCode[reservation.id] && (
                            <div className='mt-3 p-3 bg-white rounded-md border border-blue-200 shadow-sm'>
                              <div className='flex items-center justify-between'>
                                <div className='font-mono text-xl font-bold text-gray-900 tracking-wider'>
                                  {reservation.validationCode}
                                </div>
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  onClick={() =>
                                    copyValidationCode(
                                      reservation.validationCode!,
                                      reservation.id
                                    )
                                  }
                                  className='text-blue-700 hover:text-blue-900 hover:bg-blue-50'
                                >
                                  {copiedCode[reservation.id] ? (
                                    <>
                                      <Check className='h-4 w-4 mr-1' />
                                      Copié
                                    </>
                                  ) : (
                                    <>
                                      <Copy className='h-4 w-4 mr-1' />
                                      {t('general.copy')}
                                    </>
                                  )}
                                </Button>
                              </div>
                              <p className='text-xs text-blue-600 mt-2'>
                                {t('booking.present_code')}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    {/* review if status completed  */}
                    {reservation.status === 'COMPLETED' && (
                      <div className='flex gap-2'>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => {
                            setReviewType('tool')
                            handleOpenReview(reservation.id)
                          }}
                          className='flex items-center gap-2'
                        >
                          <Star className='h-4 w-4 mr-1' />
                          {t('booking.rate_tool')}
                        </Button>
                        {!hasReviewedApp && (
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => {
                              setReviewType('app')
                              handleOpenReview(reservation.id)
                            }}
                            className='flex items-center gap-2'
                          >
                            <Star className='h-4 w-4 mr-1' />
                            {t('booking.rate_app')}
                          </Button>
                        )}
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

        {/* Modal de confirmation de retour */}
        <Dialog open={isReturnDialogOpen} onOpenChange={setIsReturnDialogOpen}>
          <DialogContent>
            <DialogHeader
              className={`${language === 'ar' ? 'flex justify-end' : ''}`}
            >
              <DialogTitle>{t('tool.return.title')}</DialogTitle>
            </DialogHeader>
            <div className='space-y-4'>
              <p></p>
              <div className='flex flex-col gap-2'>
                <Button onClick={handleConfirmReturn} className='w-full'>
                  {t('tool.return.confirm')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de réclamation */}
        <Dialog open={isClaimDialogOpen} onOpenChange={setIsClaimDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Signaler un problème </DialogTitle>
            </DialogHeader>
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium mb-2'>
                  Type de problème
                </label>
                <Select value={reportReason} onValueChange={setReportReason}>
                  <SelectTrigger>
                    <SelectValue placeholder='Sélectionnez le type de problème' />
                  </SelectTrigger>
                  <SelectContent>
                    {language === 'en' ? (
                      <>
                        <SelectItem value='not-compliant'>
                          Tool not compliant with the listing
                        </SelectItem>
                        <SelectItem value='poor-condition'>
                          Tool in poor condition or defective
                        </SelectItem>
                        <SelectItem value='delay'>
                          Delay in delivery / pickup
                        </SelectItem>
                        <SelectItem value='unsafe'>
                          Dangerous / unsafe tool
                        </SelectItem>
                        <SelectItem value='inappropriate'>
                          Inappropriate behavior of the provider
                        </SelectItem>
                        <SelectItem value='fraud'>
                          Suspicion of scam or fraud
                        </SelectItem>
                        <SelectItem value='no-response'>
                          No response from the provider
                        </SelectItem>
                        <SelectItem value='wrong-contact'>
                          Incorrect / unreachable phone number
                        </SelectItem>
                        <SelectItem value='other'>Other</SelectItem>
                      </>
                    ) : language === 'fr' ? (
                      <>
                        <SelectItem value='not-compliant'>
                          Outil non conforme à l'annonce
                        </SelectItem>
                        <SelectItem value='poor-condition'>
                          Outil en mauvais état ou défectueux
                        </SelectItem>
                        <SelectItem value='delay'>
                          Retard de livraison / récupération
                        </SelectItem>
                        <SelectItem value='unsafe'>
                          Outil dangereux / non sécurisé
                        </SelectItem>
                        <SelectItem value='inappropriate'>
                          Comportement inapproprié du propriétaire
                        </SelectItem>
                        <SelectItem value='fraud'>
                          Suspicion d'arnaque ou fraude
                        </SelectItem>
                        <SelectItem value='no-response'>
                          Pas de réponse du propriétaire
                        </SelectItem>
                        <SelectItem value='wrong-contact'>
                          Numéro incorrect / injoignable
                        </SelectItem>
                        <SelectItem value='other'>Autre</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value='not-compliant'>
                          الأداة غير مطابقة للإعلان
                        </SelectItem>
                        <SelectItem value='poor-condition'>
                          أداة في حالة سيئة أو معطلة
                        </SelectItem>
                        <SelectItem value='delay'>
                          تأخير في التسليم / الاستلام
                        </SelectItem>
                        <SelectItem value='unsafe'>
                          أداة خطرة / غير آمنة
                        </SelectItem>
                        <SelectItem value='inappropriate'>
                          سلوك غير لائق من المزود
                        </SelectItem>
                        <SelectItem value='fraud'>
                          شبهة احتيال أو نصب
                        </SelectItem>
                        <SelectItem value='no-response'>
                          لا يوجد رد من المزود
                        </SelectItem>
                        <SelectItem value='wrong-contact'>
                          رقم هاتف غير صحيح / لا يمكن الوصول إليه
                        </SelectItem>
                        <SelectItem value='other'>أخرى</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className='block text-sm font-medium mb-2'>
                  Description du problème
                </label>
                <Textarea
                  placeholder='Décrivez le problème rencontré...'
                  value={reportMessage}
                  onChange={(e) => setReportMessage(e.target.value)}
                />
              </div>
              <div>
                <label className='block text-sm font-medium mb-2'>
                  Pièces justificatives (optionnel)
                </label>
                <div
                  className='border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors cursor-pointer'
                  onDrop={handleFileDrop}
                  onDragOver={handleDragOver}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onClick={() => document.getElementById('file-input')?.click()}
                >
                  <Upload className='h-8 w-8 mx-auto mb-2 text-gray-400' />
                  <p className='text-sm text-gray-500'>
                    Glissez vos images ici ou cliquez pour sélectionner
                  </p>
                  <p className='text-xs text-gray-400 mt-1'>
                    Images uniquement (max 1MB par fichier)
                  </p>
                  <input
                    id='file-input'
                    type='file'
                    multiple
                    accept='image/*'
                    onChange={handleFileSelect}
                    className='hidden'
                  />
                </div>

                {/* Affichage des fichiers sélectionnés */}
                {uploadedFiles.length > 0 && (
                  <div className='mt-3 space-y-2'>
                    <p className='text-sm font-medium'>
                      Fichiers sélectionnés :
                    </p>
                    {uploadedFiles.map((file, index) => (
                      <div
                        key={index}
                        className='flex items-center justify-between p-2 bg-gray-50 rounded border'
                      >
                        <div className='flex items-center gap-2'>
                          <div className='w-8 h-8 bg-blue-100 rounded flex items-center justify-center'>
                            <Upload className='h-4 w-4 text-blue-600' />
                          </div>
                          <div>
                            <p className='text-sm font-medium'>{file.name}</p>
                            <p className='text-xs text-gray-500'>
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => removeFile(index)}
                          className='text-red-600 hover:text-red-800'
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <Button
                onClick={handleSubmitClaim}
                className='w-full'
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Envoi en cours...' : 'Envoyer la réclamation'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
          <DialogContent>
            <DialogHeader
              className={language === 'ar' ? '[direction:ltr]' : ''}
            >
              <DialogTitle>
                {reviewType === 'app'
                  ? t('review.app_title')
                  : t('review.modaltitle')}
              </DialogTitle>
            </DialogHeader>
            <div className={'space-y-4'}>
              <div>
                <label className='block text-sm font-medium mb-2'>
                  {t('review.rate')}
                </label>
                <div
                  className={
                    'flex gap-1 ' + (language === 'ar' ? '[direction:ltr]' : '')
                  }
                >
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className={`p-1 ${
                        star <= rating ? 'text-yellow-500' : 'text-gray-300'
                      }`}
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
                  onChange={(e) => setReviewComment(e.target.value)}
                />
              </div>
              <Button onClick={handleSubmitReview} className='w-full'>
                {t('review.submitbtn')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}

export default Reservations
