import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Check, Copy, Eye, EyeOff, Loader2 } from 'lucide-react'
import { BookingDetailsRecord } from './types'

type BookingValidationCardProps = {
  booking: BookingDetailsRecord
  isOwner: boolean
  isRenter: boolean
  showValidationCode: boolean
  copiedCode: boolean
  isStartDateReached: boolean
  validationCodeInput: string
  actionLoading: boolean
  codeForRenterLabel: string
  codeForOwnerLabel: string
  codeOwnerHintLabel: string
  pickupReadyLabel: string
  presentCodeLabel: string
  copyCodeLabel: string
  showLabel: string
  hideLabel: string
  enterValidationCodeLabel: string
  launchBookingLabel: string
  onToggleVisibility: () => void
  onCopy: () => void
  onValidationCodeChange: (value: string) => void
  onSubmit: () => void
}

const BookingValidationCard = ({
  booking,
  isOwner,
  isRenter,
  showValidationCode,
  copiedCode,
  isStartDateReached,
  validationCodeInput,
  actionLoading,
  codeForRenterLabel,
  codeForOwnerLabel,
  codeOwnerHintLabel,
  pickupReadyLabel,
  presentCodeLabel,
  copyCodeLabel,
  showLabel,
  hideLabel,
  enterValidationCodeLabel,
  launchBookingLabel,
  onToggleVisibility,
  onCopy,
  onValidationCodeChange,
  onSubmit,
}: BookingValidationCardProps) => {
  if (isRenter && booking.validationCode) {
    return (
      <div className='space-y-4'>
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <div>
            <p className='font-medium'>{codeForRenterLabel}</p>
            <p className='text-sm text-muted-foreground'>{presentCodeLabel}</p>
          </div>
          <Button
            variant='outline'
            onClick={onToggleVisibility}
            disabled={!isStartDateReached}
          >
            {showValidationCode ? (
              <>
                <EyeOff className='mr-2 h-4 w-4' />
                {hideLabel}
              </>
            ) : (
              <>
                <Eye className='mr-2 h-4 w-4' />
                {showLabel}
              </>
            )}
          </Button>
        </div>

        {!showValidationCode ? (
          <div className='rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800'>
            {pickupReadyLabel}
          </div>
        ) : (
          <div className='rounded-2xl border border-blue-200 bg-blue-50 p-5'>
            <div className='flex flex-wrap items-center justify-between gap-3'>
              <div className='font-mono text-2xl font-bold tracking-[0.35em] text-blue-950'>
                {booking.validationCode}
              </div>
              <Button variant='outline' onClick={onCopy}>
                {copiedCode ? (
                  <>
                    <Check className='mr-2 h-4 w-4' />
                    {copyCodeLabel}
                  </>
                ) : (
                  <>
                    <Copy className='mr-2 h-4 w-4' />
                    {copyCodeLabel}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    )
  }

  if (isOwner) {
    return (
      <div className='space-y-4'>
        <div>
          <p className='font-medium'>{codeForOwnerLabel}</p>
          <p className='text-sm text-muted-foreground'>{codeOwnerHintLabel}</p>
        </div>
        <div className='flex flex-col gap-3 md:flex-row'>
          <Input
            value={validationCodeInput}
            onChange={(event) => onValidationCodeChange(event.target.value)}
            placeholder={enterValidationCodeLabel}
            className='md:flex-1'
          />
          <Button
            onClick={onSubmit}
            disabled={actionLoading}
            className='md:min-w-52'
          >
            {actionLoading ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : null}
            {launchBookingLabel}
          </Button>
        </div>
      </div>
    )
  }

  return null
}

export default BookingValidationCard
