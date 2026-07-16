import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Upload, X, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useLanguage } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'
import { disputeService } from '@/services/disputeService'
import { bookingService } from '@/services/bookingService'
import { notificationService } from '@/services/notificationService'

interface CreateDisputeData {
  userId: string
  bookingId: string
  reason: string
  reportReason: string
  reportMessage: string
}

interface ClaimDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  bookingId: string
  onSubmit: (disputeData: CreateDisputeData, images: File[]) => void
  onRefresh?: () => void
}

const ClaimDialog: React.FC<ClaimDialogProps> = ({
  isOpen,
  onOpenChange,
  bookingId,
  onSubmit,
  onRefresh,
}) => {
  const [claimType, setClaimType] = useState('')
  const [claimDescription, setClaimDescription] = useState('')
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isCreatingDispute, setIsCreatingDispute] = useState(false)
  const [isUpdatingBooking, setIsUpdatingBooking] = useState(false)
  // const [isSendingNotification, setIsSendingNotification] = useState(false);
  const { toast } = useToast()
  const { user } = useAuth()

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const validImages: File[] = []

    files.forEach((file) => {
      if (file.size > 1024 * 1024) {
        // 1MB limit
        toast({
          title: t('general.error'),
          description: t('claim.image_too_large', { fileName: file.name }),
          variant: 'destructive',
        })
        return
      }

      if (!file.type.startsWith('image/')) {
        toast({
          title: t('general.error'),
          description: t('claim.invalid_image', { fileName: file.name }),
          variant: 'destructive',
        })
        return
      }

      validImages.push(file)
    })

    setSelectedImages((prev) => [...prev, ...validImages])
  }

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!claimType || !claimDescription) {
      toast({
        title: t('error'),
        description: t('validation.fill_all_fields'),
        variant: 'destructive',
      })
      return
    }

    if (!user) {
      toast({
        title: t('error'),
        description: t('auth.user_not_connected'),
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)
    let disputeCreated = false
    let bookingUpdated = false
    // let notificationSent = false;

    try {
      const disputeData: CreateDisputeData = {
        userId: user.id,
        bookingId,
        reason: claimType,
        reportReason: claimType,
        reportMessage: claimDescription,
      }

      // Step 1: Create dispute with images
      setIsCreatingDispute(true)
      await disputeService.createDispute(disputeData, selectedImages)
      disputeCreated = true
      setIsCreatingDispute(false)

      // Step 2: Update booking to set pickupTool to true
      setIsUpdatingBooking(true)
      await bookingService.updateBookingStatus(bookingId, {
        pickupTool: true,
      })
      bookingUpdated = true
      setIsUpdatingBooking(false)

      // Success: All operations completed
      toast({
        title: 'Succès',
        description: 'La dispute a été créée avec succès.',
        variant: 'default',
      })

      // Reset form and close modal
      setClaimType('')
      setClaimDescription('')
      setSelectedImages([])

      // Refresh the booking list if callback provided
      if (onRefresh) {
        onRefresh()
      }

      onOpenChange(false)
      // onSubmit(disputeData, selectedImages)
    } catch (error: any) {
      // Determine which step failed and show appropriate error message
      let errorMessage = t('claim.creation_failed')

      if (!disputeCreated) {
        errorMessage = t('claim.create_dispute_error', {
          message: error.message || t('claim.unknown_error'),
        })
        setIsCreatingDispute(false)
      } else if (!bookingUpdated) {
        errorMessage = t('claim.update_booking_error', {
          message: error.message || t('claim.unknown_error'),
        })
        setIsUpdatingBooking(false)
      }
      // Handle specific error for existing active claim
      if (error?.response?.status === 400 && error?.response?.data?.message) {
        toast({
          title: t('general.error'),
          description: error.response.data.message,
          variant: 'destructive',
        })
      } else {
        toast({
          title: t('general.error'),
          description: errorMessage,
          variant: 'destructive',
        })
      }
    } finally {
      setIsLoading(false)
      setIsCreatingDispute(false)
      setIsUpdatingBooking(false)
      // setIsSendingNotification(false);
    }
  }
  const { t, language } = useLanguage()
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader
          className={`${language === 'ar' ? 'flex justify-end' : ''}`}
        >
          <DialogTitle>{t('request.report.title')}</DialogTitle>
        </DialogHeader>
        <div className='space-y-4'>
          <div>
            <label className='block text-sm font-medium mb-2'>
              {t('request.claim.reason')}
            </label>
            <Select value={claimType} onValueChange={setClaimType}>
              <SelectTrigger>
                <SelectValue
                  placeholder={t('request.claim.reason_placeholder')}
                />
              </SelectTrigger>
              <SelectContent>
                {language === 'en' ? (
                  <>
                    <SelectItem value='no-show'>
                      Client did not show up at the appointment
                    </SelectItem>

                    <SelectItem value='suspicious'>
                      Suspicious or fraudulent request
                    </SelectItem>
                    <SelectItem value='behavior'>
                      Inappropriate behavior of the client
                    </SelectItem>
                    <SelectItem value='terms'>
                      Violation of terms of use
                    </SelectItem>
                    <SelectItem value='contact'>
                      Incorrect / unreachable phone number
                    </SelectItem>
                    <SelectItem value='other'>Other</SelectItem>
                  </>
                ) : language === 'fr' ? (
                  <>
                    <SelectItem value='no-show'>
                      Client non présent au rendez-vous
                    </SelectItem>

                    <SelectItem value='suspicious'>
                      Demande suspecte ou frauduleuse
                    </SelectItem>
                    <SelectItem value='behavior'>
                      Comportement inapproprié du client
                    </SelectItem>
                    <SelectItem value='terms'>
                      Violation des conditions d'utilisation
                    </SelectItem>
                    <SelectItem value='contact'>
                      Numéro de téléphone incorrect / injoignable
                    </SelectItem>
                    <SelectItem value='other'>Autre</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value='no-show'>
                      العميل لم يحضر في الموعد
                    </SelectItem>
                    <SelectItem value='suspicious'>
                      طلب مشبوه أو احتيالي
                    </SelectItem>
                    <SelectItem value='behavior'>
                      سلوك غير لائق من العميل
                    </SelectItem>
                    <SelectItem value='terms'>انتهاك شروط الاستخدام</SelectItem>
                    <SelectItem value='contact'>
                      رقم هاتف غير صحيح / لا يمكن الوصول إليه
                    </SelectItem>
                    <SelectItem value='other'>أخرى</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className='block text-sm font-medium mb-2'>
              {t('request.claim.describe')}
            </label>
            <Textarea
              placeholder={t('request.claim.describe_placeholder')}
              value={claimDescription}
              onChange={(e) => setClaimDescription(e.target.value)}
            />
          </div>
          <div>
            <label className='block text-sm font-medium mb-2'>
              {t('request.claim.evidence')}
            </label>
            <div className='space-y-2'>
              <div
                className='border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-gray-400 transition-colors'
                onClick={() => document.getElementById('image-upload')?.click()}
              >
                <Upload className='h-8 w-8 mx-auto mb-2 text-gray-400' />
                <p className='text-sm text-gray-500'>
                  {t('request.claim.evidence_placeholder')}
                </p>
                <p className='text-xs text-gray-400 mt-1'>
                  {t('request.claim.evidence_limit')}
                </p>
                <input
                  id='image-upload'
                  type='file'
                  multiple
                  accept='image/*'
                  onChange={handleImageUpload}
                  className='hidden'
                />
              </div>

              {selectedImages.length > 0 && (
                <div className='grid grid-cols-2 gap-2'>
                  {selectedImages.map((image, index) => (
                    <div key={index} className='relative'>
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${index + 1}`}
                        className='w-full h-20 object-cover rounded border'
                      />
                      <button
                        type='button'
                        onClick={() => removeImage(index)}
                        className='absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600'
                      >
                        <X className='h-3 w-3' />
                      </button>
                      <p className='text-xs text-gray-500 mt-1 truncate'>
                        {image.name}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || isCreatingDispute || isUpdatingBooking}
            className='w-full'
          >
            {isCreatingDispute ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                {t('claim.creating_progress')}
              </>
            ) : isUpdatingBooking ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                {t('claim.updating_booking_progress')}
              </>
            ) : isLoading ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                {t('claim.sending_progress')}
              </>
            ) : (
              t('request.claim.submit')
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ClaimDialog
