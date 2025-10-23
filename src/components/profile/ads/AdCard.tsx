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
import { Link } from 'react-router-dom'
import { OptimizedPriceDisplay } from '@/components/OptimizedPriceDisplay'

interface AdCardProps {
  ad: Tool
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
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [toolData, setToolData] = useState<Tool | null>(null)
  const [viewToolData, setViewToolData] = useState<Tool | null>(null)
  const [isLoadingView, setIsLoadingView] = useState(false)
  console.table('ad details', ad)
  const handleEditClick = async () => {
    try {
      const tool = await toolsService.getTool(ad.id)
      setToolData(tool)
      setIsEditDialogOpen(true)
    } catch (error) {
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

  const handleViewClick = async () => {
    try {
      setIsLoadingView(true)
      const tool = await toolsService.getTool(ad.id)
      setViewToolData(tool)
      setIsViewDialogOpen(true)
    } catch (error) {
      toast({
        title: 'Erreur',
        description: "Impossible de charger les détails de l'outil",
        variant: 'destructive',
      })
    } finally {
      setIsLoadingView(false)
    }
  }

  const handleViewClose = () => {
    setIsViewDialogOpen(false)
    setViewToolData(null)
  }
  return (
    <div className='border rounded-lg p-4'>
      <div className='flex flex-col sm:flex-row items-start gap-4'>
        <Link to={`/tool/${ad.id}`}>
          <img
            src={ad.image}
            alt={ad.title}
            className='w-full sm:w-20 h-48 sm:h-20 rounded-lg object-cover cursor-pointer hover:opacity-80 transition-opacity'
            onClick={handleViewClick}
          />
        </Link>
        <div className='flex-1 space-y-3 w-full sm:w-auto'>
          <div className='flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3'>
            <div className='flex-1'>
              <Link
                to={`/tool/${ad.id}`}
                className='font-semibold cursor-pointer hover:text-primary transition-colors'
                onClick={handleViewClick}
              >
                {ad.title}
              </Link>
              <p className='text-sm text-muted-foreground'>
                {t(`categories.${ad.category}`) +
                  '  :  ' +
                  t(`subcategories.${ad.subcategory}`)}
              </p>
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
              {ad.rating || 0}
            </div>
            <div>
              {ad.totalRentals} {t('general.location')}
            </div>
          </div>

          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
            <div className='font-semibold text-primary'>
              <OptimizedPriceDisplay
                price={ad.price}
                baseCurrency='GBP'
                size='lg'
                cible='basePrice'
              />
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

              <Button
                variant='outline'
                size='sm'
                onClick={handleViewClick}
                disabled={isLoadingView}
              >
                <Eye className='h-4 w-4 mr-1' />
                {isLoadingView ? t('general.loading') : t('general.see')}
              </Button>

              {viewToolData && (
                <Dialog
                  open={isViewDialogOpen}
                  onOpenChange={setIsViewDialogOpen}
                >
                  <AdViewDialog ad={viewToolData} onClose={handleViewClose} />
                </Dialog>
              )}

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
