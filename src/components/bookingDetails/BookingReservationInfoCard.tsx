import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, MapPin } from 'lucide-react'
import BookingParticipantCard from './BookingParticipantCard'
import { BookingDetailsRecord, ParticipantDetails } from './types'

type BookingReservationInfoCardProps = {
  booking: BookingDetailsRecord
  renterDetails: ParticipantDetails
  renterTitle: string
  showContacts: boolean
  hiddenContactsLabel: string
  locationFallback: string
  statusLabel: string
  disputeLabel: string
  waitingPickupLabel: string
  pickupCompletedLabel: string
  startDateLabel: string
  endDateLabel: string
  pickupHourLabel: string
  pickupAddressLabel: string
  bookingMessageLabel: string
  formatDate: (value?: string) => string
  getStatusColor: (status?: string) => string
}

const BookingReservationInfoCard = ({
  booking,
  renterDetails,
  renterTitle,
  showContacts,
  hiddenContactsLabel,
  locationFallback,
  statusLabel,
  disputeLabel,
  waitingPickupLabel,
  pickupCompletedLabel,
  startDateLabel,
  endDateLabel,
  pickupHourLabel,
  pickupAddressLabel,
  bookingMessageLabel,
  formatDate,
  getStatusColor,
}: BookingReservationInfoCardProps) => {
  return (
    <div className='space-y-6'>
      <div className='flex flex-wrap gap-2'>
        <Badge className={getStatusColor(booking.status)}>
          {statusLabel}
        </Badge>
        {booking.hasActiveClaim && (
          <Badge
            variant='outline'
            className='border-orange-200 bg-orange-50 text-orange-700'
          >
            {disputeLabel}
          </Badge>
        )}
        {booking.renterHasReturned && !booking.pickupTool && (
          <Badge
            variant='outline'
            className='border-blue-200 bg-blue-50 text-blue-700'
          >
            {waitingPickupLabel}
          </Badge>
        )}
        {booking.pickupTool && (
          <Badge
            variant='outline'
            className='border-emerald-200 bg-emerald-50 text-emerald-700'
          >
            {pickupCompletedLabel}
          </Badge>
        )}
      </div>

      <BookingParticipantCard
        title={renterTitle}
        participant={renterDetails}
        showContacts={showContacts}
        hiddenLabel={hiddenContactsLabel}
        locationFallback={locationFallback}
      />

      <div className='grid gap-3 sm:grid-cols-2'>
        <div className='rounded-2xl border p-4'>
          <div className='flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground'>
            <Calendar className='h-4 w-4' />
            {startDateLabel}
          </div>
          <p className='mt-2 font-medium'>{formatDate(booking.startDate)}</p>
        </div>
        <div className='rounded-2xl border p-4'>
          <div className='flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground'>
            <Calendar className='h-4 w-4' />
            {endDateLabel}
          </div>
          <p className='mt-2 font-medium'>{formatDate(booking.endDate)}</p>
        </div>
        <div className='rounded-2xl border p-4'>
          <div className='flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground'>
            <Clock className='h-4 w-4' />
            {pickupHourLabel}
          </div>
          <p className='mt-2 font-medium'>{booking.pickupHour || '-'}</p>
        </div>
        <div className='rounded-2xl border p-4'>
          <div className='flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground'>
            <MapPin className='h-4 w-4' />
            {pickupAddressLabel}
          </div>
          <p className='mt-2 font-medium'>
            {booking.tool?.pickupAddress || locationFallback}
          </p>
        </div>
      </div>

      {booking.message && (
        <div className='rounded-2xl border bg-muted/30 p-4'>
          <p className='text-sm font-medium'>{bookingMessageLabel}</p>
          <p className='mt-2 text-sm leading-6 text-muted-foreground'>
            {booking.message}
          </p>
        </div>
      )}
    </div>
  )
}

export default BookingReservationInfoCard
