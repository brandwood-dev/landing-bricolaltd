import React, { useState } from 'react'
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

interface Reservation {
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
  status:
    | 'pending'
    | 'accepted'
    | 'ongoing'
    | 'completed'
    | 'cancelled'
    | 'rejected'
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
    Reservation[]
  >([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(5)
  const { toast } = useToast()

  const [reservations, setReservations] = useState<Reservation[]>([
    {
      id: '1',
      referenceId: 'RES-2024-001',
      toolName: 'Perceuse sans fil',
      toolDescription: 'Perceuse visseuse sans fil 18V avec 2 batteries',
      toolImage:
        'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=300&fit=crop',
      owner: 'Marie Dubois',
      ownerEmail: 'marie.dubois@email.com',
      ownerPhone: '+33 6 87 65 43 21',
      startDate: '2024-01-15',
      endDate: '2024-01-17',
      status: 'pending',
      price: 25,
      dailyPrice: 12.5,
      location: 'Paris 15ème',
    },
    {
      id: '2',
      referenceId: 'RES-2024-002',
      toolName: 'Scie circulaire',
      toolDescription: 'Scie circulaire 1400W avec lame carbure',
      toolImage:
        'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&h=300&fit=crop',
      owner: 'Paul Martin',
      ownerEmail: 'paul.martin@email.com',
      ownerPhone: '+33 6 11 22 33 44',
      startDate: '2024-01-20',
      endDate: '2024-01-22',
      status: 'accepted',
      price: 35,
      dailyPrice: 17.5,
      location: 'Paris 12ème',
      validationCode: 'ABC123',
    },
    {
      id: '3',
      referenceId: 'RES-2024-003',
      toolName: 'Ponceuse orbitale',
      toolDescription: 'Ponceuse orbitale 240W avec disques',
      toolImage:
        'https://images.unsplash.com/photo-1609592242810-8de8b4c6e0bc?w=400&h=300&fit=crop',
      owner: 'Sophie Durand',
      ownerEmail: 'sophie.durand@email.com',
      ownerPhone: '+33 6 98 76 54 32',
      startDate: '2024-01-25',
      endDate: '2024-01-26',
      status: 'ongoing',
      price: 20,
      dailyPrice: 20,
      location: 'Paris 8ème',
      validationCode: 'XYZ789',
    },
    {
      id: '4',
      referenceId: 'RES-2024-004',
      toolName: 'Échelle télescopique',
      toolDescription: 'Échelle télescopique 3.8m, charge max 150kg',
      toolImage:
        'https://images.unsplash.com/photo-1631047038830-c6c8e1af70b9?w=400&h=300&fit=crop',
      owner: 'Marc Dubois',
      ownerEmail: 'marc.dubois@email.com',
      ownerPhone: '+33 6 22 33 44 55',
      startDate: '2024-01-10',
      endDate: '2024-01-12',
      status: 'cancelled',
      price: 40,
      dailyPrice: 20,
      location: 'Paris 14ème',
      cancellationReason: 'Changement de plans',
      cancellationMessage: "Je ne peux plus utiliser l'outil à ces dates.",
    },
    {
      id: '5',
      referenceId: 'RES-2024-005',
      toolName: 'Marteau-piqueur',
      toolDescription: 'Marteau-piqueur électrique 1500W avec 3 burins',
      toolImage:
        'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400&h=300&fit=crop',
      owner: 'Claire Martin',
      ownerEmail: 'claire.martin@email.com',
      ownerPhone: '+33 6 55 44 33 22',
      startDate: '2024-01-05',
      endDate: '2024-01-07',
      status: 'completed',
      price: 60,
      dailyPrice: 30,
      location: 'Paris 11ème',
    },
    {
      id: '6',
      referenceId: 'RES-2024-006',
      toolName: 'Niveau laser',
      toolDescription: 'Niveau laser rotatif avec trépied',
      toolImage:
        'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&h=300&fit=crop',
      owner: 'Thomas Bernard',
      ownerEmail: 'thomas.bernard@email.com',
      ownerPhone: '+33 6 77 88 99 00',
      startDate: '2024-01-08',
      endDate: '2024-01-10',
      status: 'rejected',
      price: 45,
      dailyPrice: 22.5,
      location: 'Paris 18ème',
    },
    {
      id: '7',
      referenceId: 'RES-2024-007',
      toolName: 'Aspirateur de chantier',
      toolDescription: 'Aspirateur eau et poussière 30L',
      toolImage:
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
      owner: 'Alex Dupont',
      ownerEmail: 'alex.dupont@email.com',
      ownerPhone: '+33 6 99 88 77 66',
      startDate: '2024-01-28',
      endDate: '2024-01-30',
      status: 'pending',
      price: 50,
      dailyPrice: 25,
      location: 'Paris 13ème',
    },
    {
      id: '8',
      referenceId: 'RES-2024-008',
      toolName: "Compresseur d'air",
      toolDescription: 'Compresseur 50L avec pistolet de soufflage',
      toolImage:
        'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400&h=300&fit=crop',
      owner: 'Laurent Petit',
      ownerEmail: 'laurent.petit@email.com',
      ownerPhone: '+33 6 44 55 66 77',
      startDate: '2024-02-01',
      endDate: '2024-02-03',
      status: 'accepted',
      price: 60,
      dailyPrice: 30,
      location: 'Paris 17ème',
      validationCode: 'DEF456',
    },
    {
      id: '9',
      referenceId: 'RES-2024-009',
      toolName: "Meuleuse d'angle",
      toolDescription: 'Meuleuse 125mm avec disques de coupe',
      toolImage:
        'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=300&fit=crop',
      owner: 'Emma Wilson',
      ownerEmail: 'emma.wilson@email.com',
      ownerPhone: '+33 6 33 22 11 00',
      startDate: '2024-02-05',
      endDate: '2024-02-06',
      status: 'ongoing',
      price: 25,
      dailyPrice: 25,
      location: 'Paris 19ème',
      validationCode: 'GHI789',
    },
    {
      id: '10',
      referenceId: 'RES-2024-010',
      toolName: 'Débroussailleuse',
      toolDescription: 'Débroussailleuse thermique 2 temps',
      toolImage:
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
      owner: 'Nicolas Roy',
      ownerEmail: 'nicolas.roy@email.com',
      ownerPhone: '+33 6 12 34 56 78',
      startDate: '2024-02-10',
      endDate: '2024-02-12',
      status: 'completed',
      price: 75,
      dailyPrice: 37.5,
      location: 'Paris 20ème',
    },
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'accepted':
        return 'bg-green-100 text-green-800'
      case 'ongoing':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-emerald-100 text-emerald-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'En attente'
      case 'accepted':
        return 'Acceptée'
      case 'ongoing':
        return 'En cours'
      case 'completed':
        return 'Terminée'
      case 'cancelled':
        return 'Annulée'
      case 'rejected':
        return 'Refusée'
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

  const handleCancelReservation = (reservationId: string) => {
    if (!cancellationReason) {
      toast({
        title: 'Erreur',
        description: "Veuillez sélectionner une raison d'annulation.",
        variant: 'destructive',
      })
      return
    }

    setReservations((prev) =>
      prev.map((res) =>
        res.id === reservationId
          ? {
              ...res,
              status: 'cancelled' as const,
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
  }

  const handleDownloadContract = (reservation: Reservation) => {
    const contractData = {
      referenceId: reservation.referenceId,
      toolName: reservation.toolName,
      toolDescription: reservation.toolDescription,
      ownerName: reservation.owner,
      ownerEmail: reservation.ownerEmail,
      ownerPhone: reservation.ownerPhone,
      renterName: 'Jean Dupont', // Current user
      renterEmail: 'jean.dupont@email.com',
      renterPhone: '+33 6 12 34 56 78',
      startDate: reservation.startDate,
      endDate: reservation.endDate,
      pickupTime: '14:00',
      totalPrice: reservation.price,
      dailyPrice: reservation.dailyPrice,
    }

    generateRentalContract(contractData)

    toast({
      title: 'Contrat téléchargé',
      description:
        'Le contrat de location a été généré et téléchargé avec succès.',
    })
  }

  const handleReport = (reservationId: string) => {
    if (!reportReason) {
      toast({
        title: t('general.error'),
        description: t('general.report_error_message'),
        variant: 'destructive',
      })
      return
    }

    // Marquer la réservation comme ayant une réclamation active
    setReservations((prev) =>
      prev.map((res) =>
        res.id === reservationId ? { ...res, hasActiveClaim: true } : res
      )
    )

    toast({
      title: t('request.report.accepted.title'),
      description: t('request.report.accepted.message'),
    })

    setReportReason('')
    setReportMessage('')
  }

  const handleToolReturn = (reservationId: string) => {
    setSelectedReservationId(reservationId)
    setIsReturnDialogOpen(true)
  }

  const handleConfirmReturn = () => {
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
  }

  const handleOpenReturnClaim = () => {
    setIsReturnDialogOpen(false)
    setIsClaimDialogOpen(true)
  }

  const handleSubmitClaim = () => {
    if (!claimType || !claimDescription) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs obligatoires.',
        variant: 'destructive',
      })
      return
    }

    setReservations((prev) =>
      prev.map((res) =>
        res.id === selectedReservationId
          ? {
              ...res,
              hasActiveClaim: true,
              hasUsedReturnButton: true,
            }
          : res
      )
    )

    toast({
      title: t('claim.sent'),
      description: t('claim.sent_message'),
    })

    setIsClaimDialogOpen(false)
    setClaimType('')
    setClaimDescription('')
    setSelectedReservationId('')
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
    { value: 'pending', label: 'En attente' },
    { value: 'accepted', label: 'Acceptée' },
    { value: 'ongoing', label: 'En cours' },
    { value: 'completed', label: 'Terminée' },
    { value: 'cancelled', label: 'Annulée' },
    { value: 'rejected', label: 'Refusée' },
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
                    <img
                      src={reservation.toolImage}
                      alt={reservation.toolName}
                      className='w-full h-full object-cover'
                    />
                  </div>

                  {/* Contenu principal */}
                  <div className='flex-1 p-4 md:p-6'>
                    <div className='flex flex-col lg:flex-row lg:justify-between lg:items-start mb-4'>
                      <div className='flex-1'>
                        <div className='flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2'>
                          <h3 className='text-lg font-semibold text-gray-900'>
                            {reservation.toolName}
                          </h3>
                          <Badge className={getStatusColor(reservation.status)}>
                            {t(`general.${reservation.status}`)}
                          </Badge>
                          {reservation.status === 'ongoing' &&
                            reservation.renterHasReturned && (
                              <Badge
                                variant='outline'
                                className='bg-blue-50 text-blue-800 border-blue-200'
                              >
                                {t('booking.wait')}
                              </Badge>
                            )}
                          {(reservation.status === 'ongoing' ||
                            reservation.status === 'accepted') &&
                            reservation.hasActiveClaim && (
                              <Badge
                                variant='outline'
                                className='bg-orange-50 text-orange-800 border-orange-200'
                              >
                                {t('claim.in_progress')}
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
                          {reservation.toolDescription}
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

                    {/* Actions */}
                    <div className='flex gap-2 flex-wrap'>
                      {/* Actions pour statut "En attente" */}
                      {reservation.status === 'pending' && (
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
                      {reservation.status === 'accepted' && (
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
                              <Button variant='outline' size='sm'>
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
                                    <SelectItem value='no-response'>
                                      {t('booking.report.reason.no_answer')}
                                    </SelectItem>
                                    <SelectItem value='wrong-number'>
                                      {t('booking.report.reason.wrong_number')}
                                    </SelectItem>
                                    <SelectItem value='inappropriate'>
                                      {t(
                                        'booking.report.reason.inappropriate_behavior'
                                      )}
                                    </SelectItem>
                                    <SelectItem value='other'>
                                      {t('booking.report.reason.other')}
                                    </SelectItem>
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
                      {reservation.status === 'ongoing' && (
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

                          <Dialog>
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
                          </Dialog>
                        </>
                      )}

                      {/* Bouton pour voir les détails d'annulation */}
                      {reservation.status === 'cancelled' && (
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
                    {reservation.status === 'accepted' &&
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
              <p>{t('tool.return.option')}</p>
              <div className='flex flex-col gap-2'>
                <Button onClick={handleConfirmReturn} className='w-full'>
                  {t('tool.return.confirm')}
                </Button>
                <Button
                  variant='outline'
                  onClick={handleOpenReturnClaim}
                  className='w-full'
                >
                  {t('tool.return.report')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de réclamation */}
        <Dialog open={isClaimDialogOpen} onOpenChange={setIsClaimDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Signaler un problème</DialogTitle>
            </DialogHeader>
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium mb-2'>
                  Type de problème
                </label>
                <Select value={claimType} onValueChange={setClaimType}>
                  <SelectTrigger>
                    <SelectValue placeholder='Sélectionnez le type de problème' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='damaged'>Outil endommagé</SelectItem>
                    <SelectItem value='late-return'>
                      Retard de restitution
                    </SelectItem>
                    <SelectItem value='missing-parts'>
                      Pièces manquantes
                    </SelectItem>
                    <SelectItem value='not-working'>
                      Outil ne fonctionne pas
                    </SelectItem>
                    <SelectItem value='other'>Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className='block text-sm font-medium mb-2'>
                  Description du problème
                </label>
                <Textarea
                  placeholder='Décrivez le problème rencontré...'
                  value={claimDescription}
                  onChange={(e) => setClaimDescription(e.target.value)}
                />
              </div>
              <div>
                <label className='block text-sm font-medium mb-2'>
                  Pièces justificatives
                </label>
                <div className='border-2 border-dashed border-gray-300 rounded-lg p-4 text-center'>
                  <Upload className='h-8 w-8 mx-auto mb-2 text-gray-400' />
                  <p className='text-sm text-gray-500'>
                    Glissez vos fichiers ici ou cliquez pour sélectionner
                  </p>
                  <p className='text-xs text-gray-400 mt-1'>
                    Images ou vidéos (max 10MB)
                  </p>
                </div>
              </div>
              <Button onClick={handleSubmitClaim} className='w-full'>
                Envoyer la réclamation
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}

export default Reservations
