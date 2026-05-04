import { Badge } from '@/components/ui/badge'
import { BookingHistoryEntry } from './types'

type BookingHistoryCardProps = {
  history: BookingHistoryEntry[]
  noHistoryLabel: string
  formatHistoryAction: (action: string) => string
  formatHistoryActor: (actor: string) => string
  formatDateTime: (value?: string) => string
  getHistoryDetailLines: (entry: BookingHistoryEntry) => string[]
}

const BookingHistoryCard = ({
  history,
  noHistoryLabel,
  formatHistoryAction,
  formatHistoryActor,
  formatDateTime,
  getHistoryDetailLines,
}: BookingHistoryCardProps) => {
  if (history.length === 0) {
    return <p className='text-sm text-muted-foreground'>{noHistoryLabel}</p>
  }

  return (
    <div className='space-y-4'>
      {history.map((entry, index) => {
        const detailLines = getHistoryDetailLines(entry)
        return (
          <div
            key={`${entry.action}-${entry.timestamp}-${index}`}
            className='rounded-2xl border p-4'
          >
            <div className='flex flex-wrap items-center gap-2'>
              <Badge variant='outline'>{formatHistoryAction(entry.action)}</Badge>
              <span className='text-sm font-medium'>
                {formatHistoryActor(entry.user)}
              </span>
              <span className='text-sm text-muted-foreground'>
                {formatDateTime(entry.timestamp)}
              </span>
            </div>

            {detailLines.length > 0 && (
              <div className='mt-3 space-y-2 text-sm text-muted-foreground'>
                {detailLines.map((line) => (
                  <p key={line} className='leading-6'>
                    {line}
                  </p>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default BookingHistoryCard
