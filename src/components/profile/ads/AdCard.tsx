import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Dialog, DialogTrigger } from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Edit, Eye, Trash2, Star } from 'lucide-react'
import AdEditDialog from '../AdEditDialog'
import AdViewDialog from '../AdViewDialog'
import { useLanguage } from '@/contexts/LanguageContext'
import { ModerationStatus } from '@/types/bridge/enums'
import { toolsService, Tool } from '@/services/toolsService'
import { useToast } from '@/hooks/use-toast'

interface AdCardProps {
  ad: any
  onPublishToggle: (adId: string, published: boolean) => void
  onDeleteAd: (adId: string) => void
  onRefresh: () => void
  getValidationStatusColor: (status: string) => string
  getValidationStatusText: (status: string) => string
}

const AdCard = ({
  ad,
  onPublishToggle,
  onDeleteAd,
  onRefresh,
  getValidationStatusColor,
  getValidationStatusText,
}: AdCardProps) => {
  const { t, language } = useLanguage()
  const { toast } = useToast()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [toolData, setToolData] = useState<Tool | null>(null)

  const handleEditClick = async () => {
    try {
      const tool = await toolsService.getTool(ad.id)
      setToolData(tool)
      setIsEditDialogOpen(true)
    } catch (error) {
      console.error('Error fetching tool details:', error)
      toast({
        title: 'Erreur',
        description: "Impossible de charger les détails de l'outil",
        variant: 'destructive',
      })
    }
  }

  const handleEditSave = () => {
    onRefresh()
    setIsEditDialogOpen(false)
  }

  const handleEditClose = () => {
    setIsEditDialogOpen(false)
    setToolData(null)
  }
  return (
    <div className='border rounded-lg p-4'>
      <div className='flex flex-col sm:flex-row items-start gap-4'>
        <img
          src={ad.image}
          alt={ad.title}
          className='w-full sm:w-20 h-48 sm:h-20 rounded-lg object-cover'
        />
        <div className='flex-1 space-y-3 w-full sm:w-auto'>
          <div className='flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3'>
            <div className='flex-1'>
              <h3 className='font-semibold'>{ad.title}</h3>
              <p className='text-sm text-muted-foreground'>{ad.category}</p>
            </div>
            <div className='flex flex-col sm:flex-row items-start sm:items-center gap-2'>
              <Badge className={getValidationStatusColor(ad.validationStatus)}>
                {getValidationStatusText(ad.validationStatus)}
              </Badge>
             
              {ad.moderationStatus === ModerationStatus.CONFIRMED && (
                <div className='flex items-center space-x-2 gap-3'>
                  <Switch
                    id={`published-${ad.id}`}
                    checked={ad.published}
                    onCheckedChange={(checked) =>
                      onPublishToggle(ad.id, checked)
                    }
                  />
                  <Label htmlFor={`published-${ad.id}`} className='text-sm'>
                    {ad.published
                      ? t('general.published')
                      : t('general.unpublished')}
                  </Label>
                </div>
              )}
            </div>
          </div>

          <div className='flex items-center gap-4 text-sm text-muted-foreground'>
            <div className='flex items-center gap-1'>
              <Star className='h-4 w-4 fill-yellow-400 text-yellow-400' />
              {ad.rating}
            </div>
            <div>
              {ad.totalRentals} {t('general.location')}
            </div>
          </div>

          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
            <div className='font-semibold text-primary'>
              {ad.price}€/{t('general.day')}
            </div>
            <div className='flex flex-wrap gap-2'>
              <Button variant='outline' size='sm' onClick={handleEditClick}>
                <Edit className='h-4 w-4 mr-1' />
                {t('general.modify')}
              </Button>

              {toolData && (
                <Dialog
                  open={isEditDialogOpen}
                  onOpenChange={setIsEditDialogOpen}
                >
                  <AdEditDialog
                    ad={toolData}
                    onClose={handleEditClose}
                    onSave={handleEditSave}
                  />
                </Dialog>
              )}

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant='outline' size='sm'>
                    <Eye className='h-4 w-4 mr-1' />
                    {t('general.see')}
                  </Button>
                </DialogTrigger>
                <AdViewDialog ad={ad} />
              </Dialog>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant='outline'
                    size='sm'
                    className='text-red-600 hover:text-red-700'
                  >
                    <Trash2 className='h-4 w-4' />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader className='!flex !flex-col'>
                    <AlertDialogTitle
                      className={language === 'ar' ? 'text-right' : ''}
                    >
                      {t('ads.delete.confirm.title')}
                    </AlertDialogTitle>
                    <AlertDialogDescription
                      className={language === 'ar' ? 'text-right' : ''}
                    >
                      {t('ads.delete.confirm.description')}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t('general.cancel')}</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDeleteAd(ad.id)}
                      className='bg-red-600 hover:bg-red-700'
                    >
                      {t('general.delete.confirm')}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdCard
