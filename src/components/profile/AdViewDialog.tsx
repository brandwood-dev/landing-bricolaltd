import React, { useState, useEffect } from 'react'
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Star, User } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { Carousel } from '@/components/ui/PhotoCarousel'
import { toolsService } from '@/services/toolsService'
import { Tool, Review } from '@/types/bridge/tool.types'
import { ModerationStatus } from '@/types/bridge/enums'

interface Ad {
  id: string
  title: string
  category: string
  price: number
  published: boolean
  validationStatus: string
  rating: number
  totalRentals: number
  image: string
  ownerInstruction: string
  description: string
}

interface AdViewDialogProps {
  ad: Tool | Ad
  onClose?: () => void
}

const AdViewDialog = ({ ad, onClose }: AdViewDialogProps) => {
  const [toolData, setToolData] = useState<Tool | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const { t } = useLanguage()

  // Helper functions to handle both Tool and Ad types
  const isToolType = (obj: Tool | Ad): obj is Tool => {
    return 'basePrice' in obj && 'moderationStatus' in obj
  }

  const getPrice = (obj: Tool | Ad): number => {
    return isToolType(obj) ? obj.basePrice : obj.price
  }

  const getValidationStatus = (obj: Tool | Ad): string => {
    if (isToolType(obj)) {
      switch (obj.moderationStatus) {
        case ModerationStatus.CONFIRMED:
          return 'confirmed'
        case ModerationStatus.PENDING:
          return 'pending'
        case ModerationStatus.REJECTED:
          return 'rejected'
        default:
          return 'pending'
      }
    }
    return obj.validationStatus
  }

  const getPublishedStatus = (obj: Tool | Ad): boolean => {
    return isToolType(obj) ? obj.toolStatus === 'PUBLISHED' : obj.published
  }

  const getRating = (obj: Tool | Ad): number => {
    return obj.rating || 0
  }

  const getTotalRentals = (obj: Tool | Ad): number => {
    return isToolType(obj) ? (obj.totalBookings || 0) : obj.totalRentals
  }

  const getImage = (obj: Tool | Ad): string => {
    if (isToolType(obj)) {
      return obj.photos?.[0]?.url || '/placeholder-image.jpg'
    }
    return obj.image
  }

  const getOwnerInstructions = (obj: Tool | Ad): string => {
    return isToolType(obj) ? (obj.ownerInstructions || '') : obj.ownerInstruction
  }

  const getDescription = (obj: Tool | Ad): string => {
    return obj.description || ''
  }

  const getCategoryName = (obj: Tool | Ad): string => {
    if (isToolType(obj)) {
      return obj.category?.name || obj.category?.displayName || 'Catégorie inconnue'
    }
    return typeof obj.category === 'object' && obj.category?.name
      ? obj.category.name
      : obj.category
  }

  useEffect(() => {
    const fetchToolData = async () => {
      try {
        setLoading(true)
        // Récupérer les données complètes de l'outil
        const tool = await toolsService.getTool(ad.id)
        setToolData(tool)
        
        // Récupérer les reviews de l'outil
        const toolReviews = await toolsService.getToolReviews(ad.id)
        setReviews(toolReviews.data || [])
      } catch (error) {
        console.error('Erreur lors du chargement des données de l\'outil:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchToolData()
  }, [ad.id])
  const getValidationStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getValidationStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmée'
      case 'pending':
        return 'En attente'
      case 'rejected':
        return 'Rejetée'
      default:
        return status
    }
  }
  if (loading) {
    return (
      <DialogContent className='max-w-4xl'>
        <DialogHeader>
          <DialogTitle>{t('ads.view.title')}</DialogTitle>
        </DialogHeader>
        <div className='flex items-center justify-center h-64'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2'></div>
            <p className='text-muted-foreground'>Chargement...</p>
          </div>
        </div>
      </DialogContent>
    )
  }

  // Préparer les images pour le carousel
  const images = toolData?.photos?.map(photo => photo.url) || [getImage(ad)]

  return (
    <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
      <DialogHeader>
        <DialogTitle>{t('ads.view.title')}</DialogTitle>
      </DialogHeader>
      <div className='space-y-6'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {/* Carousel des photos */}
          <div className='space-y-4'>
            <Carousel images={images} alt={ad.title} className='w-full' />
          </div>
          {/* Informations de l'outil */}
          <div className='space-y-4'>
            <div>
              <h2 className='text-2xl font-bold'>{ad.title}</h2>
              <p className='text-muted-foreground'>
                {getCategoryName(ad)}
              </p>
            </div>

            <div className='flex items-center gap-2'>
              <Badge className={getValidationStatusColor(getValidationStatus(ad))}>
                {getValidationStatusText(getValidationStatus(ad))}
              </Badge>
              <Badge variant={getPublishedStatus(ad) ? 'default' : 'secondary'}>
                {getPublishedStatus(ad)
                  ? t('general.published')
                  : t('general.unpublished')}
              </Badge>
            </div>

            {/* Rating et statistiques */}
            <div className='space-y-2'>
              <div className='flex items-center gap-4 text-sm'>
                <div className='flex items-center gap-1'>
                  <Star className='h-4 w-4 fill-yellow-400 text-yellow-400' />
                  <span className='font-medium'>
                    {toolData?.rating || getRating(ad)}
                  </span>
                  <span className='text-muted-foreground'>
                    ({toolData?.reviewCount || 0} avis)
                  </span>
                </div>
                <div>
                  {getTotalRentals(ad)} {t('profile.rentals_completed')}
                </div>
              </div>
            </div>

            <div className='text-2xl font-bold text-primary'>
              {getPrice(ad)}€/{t('general.day')}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className='space-y-2'>
          <h3 className='font-semibold'>{t('tools.desc')}</h3>
          <p className='text-muted-foreground'>
            {toolData?.description || getDescription(ad) || t('ads.no_description')}
          </p>
        </div>

        {/* Instructions du propriétaire */}
        <div className='space-y-2'>
          <h3 className='font-semibold'>{t('ads.rental_conditions')}</h3>
          <ul className='text-sm text-muted-foreground space-y-1'>
            {(toolData?.ownerInstructions || getOwnerInstructions(ad))
              ?.split('\n')
              .map((instruction, index) => (
                <li key={index}>• {instruction}</li>
              ))}
          </ul>
        </div>

        {/* Section des avis */}
        {reviews.length > 0 && (
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <h3 className='font-semibold text-lg'>Avis des utilisateurs</h3>
              <div className='flex items-center gap-2'>
                <div className='flex items-center gap-1'>
                  <Star className='h-5 w-5 fill-yellow-400 text-yellow-400' />
                  <span className='font-medium'>
                    {toolData?.rating || getRating(ad)}
                  </span>
                </div>
                <span className='text-muted-foreground'>
                  ({reviews.length} avis)
                </span>
              </div>
            </div>

            <div className='space-y-4 max-h-64 overflow-y-auto'>
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className='border rounded-lg p-4 space-y-2'
                >
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <User className='h-4 w-4 text-muted-foreground' />
                      <span className='font-medium text-sm'>
                        {review.user?.firstName} {review.user?.lastName}
                      </span>
                    </div>
                    <div className='flex items-center gap-1'>
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < review.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  {review.comment && (
                    <p className='text-sm text-muted-foreground'>
                      {review.comment}
                    </p>
                  )}
                  <p className='text-xs text-muted-foreground'>
                    {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DialogContent>
  )
}

export default AdViewDialog
