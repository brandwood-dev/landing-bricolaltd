import { Button } from '@/components/ui/button'
import { ActionItem } from './types'

type BookingActionsCardProps = {
  actions: ActionItem[]
  noActionsLabel: string
  actionLoading: boolean
}

const BookingActionsCard = ({
  actions,
  noActionsLabel,
  actionLoading,
}: BookingActionsCardProps) => {
  if (actions.length === 0) {
    return <p className='text-sm text-muted-foreground'>{noActionsLabel}</p>
  }

  return (
    <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
      {actions.map((item) => {
        const Icon = item.icon
        return (
          <Button
            key={item.key}
            variant={item.variant || 'default'}
            className={`w-full justify-center ${item.className || ''}`}
            onClick={item.onClick}
            disabled={actionLoading}
          >
            {Icon ? <Icon className='mr-2 h-4 w-4' /> : null}
            {item.label}
          </Button>
        )
      })}
    </div>
  )
}

export default BookingActionsCard
