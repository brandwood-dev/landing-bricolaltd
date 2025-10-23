import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Edit, Eye, Trash2 } from 'lucide-react';
import AdEditDialog from '../AdEditDialog';
import AdViewDialog from '../AdViewDialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { ModerationStatus } from '@/types/bridge/enums';
import { toolsService, Tool } from '@/services/toolsService';
import { useToast } from '@/hooks/use-toast';
import { OptimizedPriceDisplay } from '@/components/OptimizedPriceDisplay';

interface AdListItemProps {
  ad: Tool;
  onPublishToggle: (adId: string, published: boolean) => void;
  onDeleteAd: (adId: string) => void;
  onRefresh: () => void;
  getValidationStatusColor: (status: string) => string;
  getValidationStatusText: (status: string) => string;
}

const AdListItem = ({ ad, onPublishToggle, onDeleteAd, onRefresh, getValidationStatusColor, getValidationStatusText }: AdListItemProps) => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [toolData, setToolData] = useState<Tool | null>(null);

  const handleEditClick = async () => {
    try {
      const tool = await toolsService.getTool(ad.id);
      setToolData(tool);
      setIsEditDialogOpen(true);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les détails de l\'outil',
        variant: 'destructive'
      });
    }
  };

  const handleEditSave = () => {
    onRefresh();
    setIsEditDialogOpen(false);
  };

  const handleEditClose = () => {
    setIsEditDialogOpen(false);
    setToolData(null);
  };
  return (
    <div className="border rounded-lg p-3 flex items-center gap-4">
      <img 
        src={ad.image} 
        alt={ad.title}
        className="w-12 h-12 rounded object-cover"
      />
      <div className="flex-1">
        <h3 className="font-semibold text-sm">{ad.title}</h3>
        <p className="text-xs text-muted-foreground">{ad.category}</p>
      </div>
      <Badge className={getValidationStatusColor(ad.validationStatus)} variant="outline">
        {getValidationStatusText(ad.validationStatus)}
      </Badge>
      {ad.moderationStatus === ModerationStatus.CONFIRMED && (
        <div className="flex items-center space-x-2">
          <Switch
            id={`list-published-${ad.id}`}
            checked={ad.published}
            onCheckedChange={(checked) => onPublishToggle(ad.id, checked)}
          />
          <Label htmlFor={`list-published-${ad.id}`} className="text-xs">
            {ad.published ? t('general.published') : t('general.unpublished')}
          </Label>
        </div>
      )}
      <div className="font-semibold text-sm text-primary">
        <OptimizedPriceDisplay
          price={ad.price}
          baseCurrency='GBP'
          size='lg'
          cible='basePrice'
        />
      </div>
      <div className="flex gap-1">
        <Button variant="outline" size="sm" onClick={handleEditClick}>
          <Edit className="h-3 w-3" />
        </Button>
        
        {toolData && (
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <AdEditDialog 
              ad={toolData} 
              onClose={handleEditClose}
              onSave={handleEditSave}
            />
          </Dialog>
        )}
        
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Eye className="h-3 w-3" />
            </Button>
          </DialogTrigger>
          <AdViewDialog ad={ad} />
        </Dialog>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
              <Trash2 className="h-3 w-3" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader className = "!flex !flex-col">
              <AlertDialogTitle className={language === 'ar' ? 'text-right' : ''}>{t('ads.delete.confirm.title')}</AlertDialogTitle>
              <AlertDialogDescription className={language === 'ar' ? 'text-right' : ''}>
                {t('ads.delete.confirm.description')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('general.cancel')}</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => onDeleteAd(ad.id)}
                className="bg-red-600 hover:bg-red-700"
              >
                {t('general.delete.confirm')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default AdListItem;