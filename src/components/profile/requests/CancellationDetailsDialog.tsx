import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Eye } from 'lucide-react';
import { Request } from './types';
import { useLanguage } from '@/contexts/LanguageContext';

interface CancellationDetailsDialogProps {
  request: Request;
}

const CancellationDetailsDialog: React.FC<CancellationDetailsDialogProps> = ({ request }) => {
  const { t } = useLanguage();
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="h-4 w-4 mr-1" />
          {t('requests.cancellationDetails')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('requests.cancellationDetails')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <strong>{t('requests.reason')} :</strong> {request.cancellationReason}
          </div>
          {request.cancellationMessage && (
            <div>
              <strong>{t('requests.message')} :</strong> {request.cancellationMessage}
            </div>
          )}
          <div className="text-xs text-muted-foreground mt-2 bg-muted p-2 rounded">
            <strong>{t('requests.refund_notice')}:</strong> {t('requests.owner_cancel_refund_policy')}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CancellationDetailsDialog;