import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

interface RefusalDialogProps {
  onDecline: (requestId: string, reason: string, message: string) => void;
  requestId: string;
}

const RefusalDialog: React.FC<RefusalDialogProps> = ({ onDecline, requestId }) => {
  const [refusalReason, setRefusalReason] = useState('');
  const [refusalMessage, setRefusalMessage] = useState('');
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const handleDecline = () => {
    if (!refusalReason) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une raison de refus.",
        variant: "destructive"
      });
      return;
    }
    
    onDecline(requestId, refusalReason, refusalMessage);
    setRefusalReason('');
    setRefusalMessage('');
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          {t('request.decline')}
        </Button>
      </DialogTrigger>
      <DialogContent >
        <DialogHeader className={(language === 'ar' ? 'flex justify-end' : '')}>
          <DialogTitle >{t('reservation.refused_title')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Select value={refusalReason} onValueChange={setRefusalReason}>
            <SelectTrigger>
              <SelectValue placeholder={t('reservation.refused_reason')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="maintenance">{t('reservation.refused_reason_maintenance')}</SelectItem>
              <SelectItem value="already-booked">{t('reservation.refused_reason_already_booked')}</SelectItem>
              <SelectItem value="other">{t('reservation.refused_reason_other')}</SelectItem>
            </SelectContent>
          </Select>
          <Textarea
            placeholder={t('reservation.refused_message_placeholder')}
            value={refusalMessage}
            onChange={(e) => setRefusalMessage(e.target.value)}
          />
          <div className="flex gap-2">
            <Button 
              onClick={handleDecline}
              className="flex-1"
            >
              {t('reservation.refused_confirm')}
            </Button>
          </div>
          <div className="text-xs text-muted-foreground mt-2 bg-muted p-2 rounded">
            <strong>{t('requests.refund_notice')}:</strong> {t('requests.owner_reject_refund_policy')}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RefusalDialog;