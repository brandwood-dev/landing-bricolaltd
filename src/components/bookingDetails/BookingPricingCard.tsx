import { OptimizedPriceDisplay } from '@/components/OptimizedPriceDisplay'
import { BookingDetailsRecord } from './types'

type BookingPricingCardProps = {
  booking: BookingDetailsRecord
  totalDays: number
  dailyPrice: number
  bookingAmount: number
  depositAmount: number
  totalAmount: number
  refundNoticeLabel: string
  fullRefundLabel: string
  noRefundLabel: string
  refundAmountLabel: string
  acceptedCancellationHasFullRefund: boolean
  paymentDailyPriceLabel: string
  paymentDaysLabel: string
  paymentBookingAmountLabel: string
  paymentDepositLabel: string
  paymentTotalLabel: string
}

const BookingPricingCard = ({
  booking,
  totalDays,
  dailyPrice,
  bookingAmount,
  depositAmount,
  totalAmount,
  refundNoticeLabel,
  fullRefundLabel,
  noRefundLabel,
  refundAmountLabel,
  acceptedCancellationHasFullRefund,
  paymentDailyPriceLabel,
  paymentDaysLabel,
  paymentBookingAmountLabel,
  paymentDepositLabel,
  paymentTotalLabel,
}: BookingPricingCardProps) => {
  const paymentStats = [
    {
      key: 'daily',
      label: paymentDailyPriceLabel,
      amount: dailyPrice,
    },
    {
      key: 'days',
      label: paymentDaysLabel,
      value: totalDays,
    },
    {
      key: 'booking',
      label: paymentBookingAmountLabel,
      amount: bookingAmount,
    },
    {
      key: 'deposit',
      label: paymentDepositLabel,
      amount: depositAmount,
    },
    {
      key: 'total',
      label: paymentTotalLabel,
      amount: totalAmount,
      emphasized: true,
    },
  ]

  return (
    <div className='space-y-5'>
      <div className='grid gap-3 md:grid-cols-5'>
        {paymentStats.map((stat) => (
          <div
            key={stat.key}
            className={`rounded-2xl border p-4 ${
              stat.emphasized ? 'border-primary/30 bg-primary/5' : 'bg-background'
            }`}
          >
            <p className='text-xs uppercase tracking-wide text-muted-foreground'>
              {stat.label}
            </p>
            <div className='mt-3 text-lg font-semibold'>
              {typeof stat.amount === 'number' ? (
                <OptimizedPriceDisplay
                  price={stat.amount}
                  baseCurrency='GBP'
                  size='md'
                  cible='totalPrice'
                />
              ) : (
                stat.value
              )}
            </div>
          </div>
        ))}
      </div>

      {booking.status === 'ACCEPTED' && (
        <div className='rounded-2xl bg-muted p-4 text-sm text-muted-foreground'>
          <div className='mb-1 font-medium text-foreground'>{refundNoticeLabel}</div>
          {acceptedCancellationHasFullRefund ? fullRefundLabel : noRefundLabel}
        </div>
      )}

      {typeof booking.refundAmount === 'number' && (
        <div className='rounded-2xl border p-4'>
          <p className='text-xs uppercase tracking-wide text-muted-foreground'>
            {refundAmountLabel}
          </p>
          <div className='mt-2 font-semibold'>
            <OptimizedPriceDisplay
              price={Number(booking.refundAmount || 0)}
              baseCurrency='GBP'
              size='md'
              cible='totalPrice'
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default BookingPricingCard
