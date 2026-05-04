import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import BookingParticipantCard from './BookingParticipantCard'
import { BookingDetailsRecord, ParticipantDetails } from './types'

type BookingToolInfoCardProps = {
  booking: BookingDetailsRecord
  toolId: string
  toolPhotos: Array<{ id?: string; url: string; isPrimary?: boolean }>
  activePhotoIndex: number
  onPhotoChange: (index: number) => void
  ownerDetails: ParticipantDetails
  ownerTitle: string
  showContacts: boolean
  hiddenContactsLabel: string
  locationFallback: string
  categoryName: string
  subcategoryName: string
  toolBrandModelLabel: string
  toolConditionLabel: string
  purchaseYearLabel: string
  formatToolCondition: (condition?: string | number) => string
  getConditionBadgeClass: (condition?: string | number) => string
}

const BookingToolInfoCard = ({
  booking,
  toolId,
  toolPhotos,
  activePhotoIndex,
  onPhotoChange,
  ownerDetails,
  ownerTitle,
  showContacts,
  hiddenContactsLabel,
  locationFallback,
  categoryName,
  subcategoryName,
  toolBrandModelLabel,
  toolConditionLabel,
  purchaseYearLabel,
  formatToolCondition,
  getConditionBadgeClass,
}: BookingToolInfoCardProps) => {
  const activePhoto = toolPhotos[activePhotoIndex]?.url || toolPhotos[0]?.url || ''

  return (
    <div className='space-y-6'>
      <div className='space-y-3'>
        <div className='relative overflow-hidden rounded-2xl border bg-muted'>
          <Link to={`/tool/${toolId}`} className='block'>
            <img
              src={activePhoto}
              alt={booking.tool?.title || 'tool'}
              className='h-72 w-full object-cover md:h-96'
            />
          </Link>

          <div className='absolute left-4 top-4 flex flex-wrap gap-2'>
            <Badge className='bg-black/70 text-white hover:bg-black/70'>
              {categoryName}
            </Badge>
            <Badge className='bg-white/90 text-slate-900 hover:bg-white/90'>
              {subcategoryName}
            </Badge>
          </div>

          <div className='absolute right-4 top-4'>
            <Badge className={getConditionBadgeClass(booking.tool?.condition)}>
              {formatToolCondition(booking.tool?.condition)}
            </Badge>
          </div>

          {toolPhotos.length > 1 && (
            <>
              <Button
                type='button'
                size='icon'
                variant='secondary'
                className='absolute left-3 top-1/2 h-9 w-9 -translate-y-1/2 rounded-full'
                onClick={() =>
                  onPhotoChange(
                    activePhotoIndex === 0 ? toolPhotos.length - 1 : activePhotoIndex - 1
                  )
                }
              >
                <ChevronLeft className='h-4 w-4' />
              </Button>
              <Button
                type='button'
                size='icon'
                variant='secondary'
                className='absolute right-3 top-1/2 h-9 w-9 -translate-y-1/2 rounded-full'
                onClick={() =>
                  onPhotoChange(
                    activePhotoIndex === toolPhotos.length - 1 ? 0 : activePhotoIndex + 1
                  )
                }
              >
                <ChevronRight className='h-4 w-4' />
              </Button>
            </>
          )}
        </div>

        {toolPhotos.length > 1 && (
          <div className='flex gap-3 overflow-x-auto pb-1'>
            {toolPhotos.map((photo, index) => (
              <button
                key={photo.id || index}
                type='button'
                className={`overflow-hidden rounded-xl border transition ${
                  index === activePhotoIndex
                    ? 'border-primary ring-2 ring-primary/20'
                    : 'border-border'
                }`}
                onClick={() => onPhotoChange(index)}
              >
                <img
                  src={photo.url}
                  alt={`${booking.tool?.title || 'tool'}-${index + 1}`}
                  className='h-16 w-20 object-cover'
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className='space-y-4'>
        <div className='space-y-2'>
          <h2 className='text-2xl font-semibold'>
            {booking.tool?.title || '-'}
          </h2>
          <p className='text-sm leading-6 text-muted-foreground'>
            {booking.tool?.description || '-'}
          </p>
        </div>

        <div className='grid gap-3 sm:grid-cols-2'>
          <div className='rounded-2xl border p-4'>
            <p className='text-xs uppercase tracking-wide text-muted-foreground'>
              {toolConditionLabel}
            </p>
            <p className='mt-2 font-medium'>
              {formatToolCondition(booking.tool?.condition)}
            </p>
          </div>
          <div className='rounded-2xl border p-4'>
            <p className='text-xs uppercase tracking-wide text-muted-foreground'>
              {purchaseYearLabel}
            </p>
            <p className='mt-2 font-medium'>{booking.tool?.year || '-'}</p>
          </div>
          <div className='rounded-2xl border p-4 sm:col-span-2'>
            <p className='text-xs uppercase tracking-wide text-muted-foreground'>
              {toolBrandModelLabel}
            </p>
            <p className='mt-2 font-medium'>
              {booking.tool?.brand || '-'}
              {booking.tool?.model ? ` / ${booking.tool.model}` : ''}
            </p>
          </div>
        </div>

        <BookingParticipantCard
          title={ownerTitle}
          participant={ownerDetails}
          showContacts={showContacts}
          hiddenLabel={hiddenContactsLabel}
          locationFallback={locationFallback}
        />
      </div>
    </div>
  )
}

export default BookingToolInfoCard
