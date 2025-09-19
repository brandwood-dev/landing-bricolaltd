import React from 'react'
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Star } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

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
  ad: Ad
}

const AdViewDialog = ({ ad }: AdViewDialogProps) => {
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
  const { t } = useLanguage()

  return (
    <DialogContent className='max-w-2xl'>
      <DialogHeader>
        <DialogTitle>{t('ads.view.title')}</DialogTitle>
      </DialogHeader>
      <div className='space-y-6'>
        <div className='flex gap-6'>
          <img
            src={ad.image}
            alt={ad.title}
            className='w-32 h-32 rounded-lg object-cover'
          />
          <div className='flex-1 space-y-3'>
            <div>
              <h2 className='text-2xl font-bold'>{ad.title}</h2>
              <p className='text-muted-foreground'>{ad.category}</p>
            </div>

            <div className='flex items-center gap-2'>
              <Badge className={getValidationStatusColor(ad.validationStatus)}>
                {t(`general.${ad.validationStatus}`)}
              </Badge>
              <Badge variant={ad.published ? 'default' : 'secondary'}>
                {ad.published
                  ? t('general.published')
                  : t('general.unpublished')}
              </Badge>
            </div>

            <div className='flex items-center gap-4 text-sm'>
              <div className='flex items-center gap-1'>
                <Star className='h-4 w-4 fill-yellow-400 text-yellow-400' />
                {ad.rating}
              </div>
              <div>
                {ad.totalRentals} {t('profile.rentals_completed')}
              </div>
            </div>

            <div className='text-2xl font-bold text-primary'>
              {ad.price}€/{t('general.day')}
            </div>
          </div>
        </div>

        <div className='space-y-2'>
          <h3 className='font-semibold'>{t('tools.desc')}</h3>
          <p className='text-muted-foreground'>
            {ad.description || t('ads.no_description')}
          </p>
        </div>

        <div className='space-y-2'>
          <h3 className='font-semibold'>{t('ads.rental_conditions')}</h3>
          {/* ad.ownerInstruction listé */}
          <ul className='text-sm text-muted-foreground space-y-1'>
            {ad.ownerInstruction?.split('\n').map((instruction, index) => (
              <li key={index}>• {instruction}</li>
            ))}
          </ul>
        </div>
      </div>
    </DialogContent>
  )
}

export default AdViewDialog
