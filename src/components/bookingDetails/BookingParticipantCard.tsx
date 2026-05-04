import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Mail, MapPin, Phone } from 'lucide-react'
import { ParticipantDetails } from './types'

type BookingParticipantCardProps = {
  title: string
  participant: ParticipantDetails
  showContacts: boolean
  hiddenLabel: string
  locationFallback: string
}

const BookingParticipantCard = ({
  title,
  participant,
  showContacts,
  hiddenLabel,
  locationFallback,
}: BookingParticipantCardProps) => {
  return (
    <div className='space-y-4 rounded-2xl border bg-background p-4'>
      <div className='flex items-center gap-3'>
        <Avatar className='h-12 w-12'>
          <AvatarImage src={participant.profilePicture} />
          <AvatarFallback>
            {participant.fullName.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className='text-sm text-muted-foreground'>{title}</p>
          <p className='font-semibold'>{participant.fullName}</p>
        </div>
      </div>

      {showContacts ? (
        <div className='space-y-2 text-sm text-muted-foreground'>
          <div className='flex items-center gap-2'>
            <Phone className='h-4 w-4' />
            <span>{participant.phone || '-'}</span>
          </div>
          <div className='flex items-center gap-2'>
            <Mail className='h-4 w-4' />
            <span>{participant.email || '-'}</span>
          </div>
          <div className='flex items-start gap-2'>
            <MapPin className='mt-0.5 h-4 w-4 shrink-0' />
            <span>{participant.address || locationFallback}</span>
          </div>
        </div>
      ) : (
        <p className='text-sm text-muted-foreground'>{hiddenLabel}</p>
      )}
    </div>
  )
}

export default BookingParticipantCard
