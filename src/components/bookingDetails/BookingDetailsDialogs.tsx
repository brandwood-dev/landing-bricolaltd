import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Upload } from 'lucide-react'

type ClaimReasonOption = {
  value: string
  label: string
}

type BookingDetailsDialogsProps = {
  actionLoading: boolean
  isCancelOpen: boolean
  setIsCancelOpen: (value: boolean) => void
  isRejectOpen: boolean
  setIsRejectOpen: (value: boolean) => void
  isClaimOpen: boolean
  setIsClaimOpen: (value: boolean) => void
  isReviewOpen: boolean
  setIsReviewOpen: (value: boolean) => void
  cancellationReason: string
  setCancellationReason: (value: string) => void
  cancellationMessage: string
  setCancellationMessage: (value: string) => void
  refusalReason: string
  setRefusalReason: (value: string) => void
  refusalMessage: string
  setRefusalMessage: (value: string) => void
  claimReason: string
  setClaimReason: (value: string) => void
  claimMessage: string
  setClaimMessage: (value: string) => void
  claimFiles: File[]
  claimReasonOptions: ClaimReasonOption[]
  reviewRating: number
  setReviewRating: (value: number) => void
  reviewComment: string
  setReviewComment: (value: string) => void
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void
  onRemoveClaimFile: (index: number) => void
  onCancel: () => void
  onReject: () => void
  onSubmitClaim: () => void
  onSubmitReview: () => void
  t: (key: string) => string
}

const BookingDetailsDialogs = ({
  actionLoading,
  isCancelOpen,
  setIsCancelOpen,
  isRejectOpen,
  setIsRejectOpen,
  isClaimOpen,
  setIsClaimOpen,
  isReviewOpen,
  setIsReviewOpen,
  cancellationReason,
  setCancellationReason,
  cancellationMessage,
  setCancellationMessage,
  refusalReason,
  setRefusalReason,
  refusalMessage,
  setRefusalMessage,
  claimReason,
  setClaimReason,
  claimMessage,
  setClaimMessage,
  claimFiles,
  claimReasonOptions,
  reviewRating,
  setReviewRating,
  reviewComment,
  setReviewComment,
  onFileSelect,
  onRemoveClaimFile,
  onCancel,
  onReject,
  onSubmitClaim,
  onSubmitReview,
  t,
}: BookingDetailsDialogsProps) => {
  return (
    <>
      <Dialog open={isCancelOpen} onOpenChange={setIsCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('booking.details.cancel_dialog')}</DialogTitle>
          </DialogHeader>
          <div className='space-y-4'>
            <Select value={cancellationReason} onValueChange={setCancellationReason}>
              <SelectTrigger>
                <SelectValue placeholder={t('reservation.cancel.reason')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='change-plans'>
                  {t('reservation.cancel.reason.not_needed')}
                </SelectItem>
                <SelectItem value='found-alternative'>
                  {t('reservation.cancel.reason.other_alternative')}
                </SelectItem>
                <SelectItem value='no-longer-needed'>
                  {t('reservation.cancel.reason.unavailable')}
                </SelectItem>
                <SelectItem value='other'>
                  {t('reservation.cancel.reason.other')}
                </SelectItem>
              </SelectContent>
            </Select>
            <Textarea
              value={cancellationMessage}
              onChange={(event) => setCancellationMessage(event.target.value)}
              placeholder={t('cancellation.details.message')}
            />
            <Button className='w-full' onClick={onCancel} disabled={actionLoading}>
              {t('booking.details.submit')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('booking.details.reject_dialog')}</DialogTitle>
          </DialogHeader>
          <div className='space-y-4'>
            <Select value={refusalReason} onValueChange={setRefusalReason}>
              <SelectTrigger>
                <SelectValue placeholder={t('request.refuse')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='not-available'>
                  {t('reservation.refused_reason_maintenance')}
                </SelectItem>
                <SelectItem value='tool-problem'>
                  {t('reservation.refused_reason_already_booked')}
                </SelectItem>
                <SelectItem value='schedule-conflict'>
                  {t('booking.cancellation_reasons.schedule_conflict')}
                </SelectItem>
                <SelectItem value='other'>{t('general.other')}</SelectItem>
              </SelectContent>
            </Select>
            <Textarea
              value={refusalMessage}
              onChange={(event) => setRefusalMessage(event.target.value)}
              placeholder={t('cancellation.details.message')}
            />
            <Button className='w-full' onClick={onReject} disabled={actionLoading}>
              {t('booking.details.submit')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isClaimOpen} onOpenChange={setIsClaimOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('booking.details.claim_dialog')}</DialogTitle>
          </DialogHeader>
          <div className='space-y-4'>
            <div>
              <label className='mb-2 block text-sm font-medium'>
                {t('booking.details.claim_type')}
              </label>
              <Select value={claimReason} onValueChange={setClaimReason}>
                <SelectTrigger>
                  <SelectValue placeholder={t('booking.details.claim_type')} />
                </SelectTrigger>
                <SelectContent>
                  {claimReasonOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className='mb-2 block text-sm font-medium'>
                {t('booking.details.claim_description')}
              </label>
              <Textarea
                value={claimMessage}
                onChange={(event) => setClaimMessage(event.target.value)}
                placeholder={t('booking.details.claim_description')}
              />
            </div>

            <div className='space-y-2'>
              <label className='block text-sm font-medium'>
                {t('booking.details.claim_upload')}
              </label>
              <div className='rounded-xl border border-dashed p-4'>
                <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                  <Upload className='h-4 w-4' />
                  {t('booking.details.image_upload_hint')}
                </div>
                <Input
                  type='file'
                  multiple
                  accept='image/*'
                  onChange={onFileSelect}
                  className='mt-3'
                />
              </div>

              {claimFiles.length > 0 && (
                <div className='space-y-2 rounded-xl border p-3'>
                  <div className='text-sm font-medium'>
                    {t('booking.details.selected_files')}
                  </div>
                  {claimFiles.map((file, index) => (
                    <div
                      key={`${file.name}-${index}`}
                      className='flex items-center justify-between gap-3 text-sm'
                    >
                      <span className='truncate'>{file.name}</span>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => onRemoveClaimFile(index)}
                      >
                        {t('action.remove')}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button className='w-full' onClick={onSubmitClaim} disabled={actionLoading}>
              {t('booking.details.submit')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('booking.details.review_dialog')}</DialogTitle>
          </DialogHeader>
          <div className='space-y-4'>
            <div>
              <label className='mb-2 block text-sm font-medium'>{t('review.rate')}</label>
              <div className='flex items-center gap-1'>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type='button'
                    className={`p-1 ${
                      star <= reviewRating ? 'text-yellow-500' : 'text-gray-300'
                    }`}
                    onClick={() => setReviewRating(star)}
                  >
                    <svg
                      viewBox='0 0 24 24'
                      className='h-6 w-6 fill-current'
                      aria-hidden='true'
                    >
                      <path d='M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z' />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
            <Textarea
              value={reviewComment}
              onChange={(event) => setReviewComment(event.target.value)}
              placeholder={t('review.placeholdercomm')}
            />
            <Button className='w-full' onClick={onSubmitReview} disabled={actionLoading}>
              {t('booking.details.submit')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default BookingDetailsDialogs
