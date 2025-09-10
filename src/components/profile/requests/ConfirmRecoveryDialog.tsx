import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';

interface ConfirmRecoveryDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onClaim: () => void;
}

const ConfirmRecoveryDialog: React.FC<ConfirmRecoveryDialogProps> = ({
  isOpen,
  onOpenChange,
  onConfirm,
  onClaim
}) => {
  const { t,language } = useLanguage(); 
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader className={language === 'ar' ? 'flex justify-end' : ''}>
          <DialogTitle>{t('request.pickup_confirm_title')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p>{t('request.pickup_confirm_message1')}</p>
          <p className="text-sm text-muted-foreground">
            {t('request.pickup_confirm_message2')}
          </p>
          <div className="flex gap-2">
            <Button onClick={onConfirm} className="flex-1">
              {t('request.pickup_confirm')}
            </Button>
            <Button variant="outline" onClick={onClaim} className="flex-1">
              {t('request.pickup_report')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmRecoveryDialog;