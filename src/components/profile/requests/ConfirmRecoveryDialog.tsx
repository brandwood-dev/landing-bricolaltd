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
          <p className={language === 'ar' ? 'text-right' : ''}>
            {language === 'ar'
              ? 'يرجى تأكيد أنك قد استلمت الأداة وأنها في حالة جيدة. سيؤدي هذا الإجراء إلى اعتماد عملية الاستلام بشكل نهائي.'
              : language === 'en'
              ? 'Please confirm that you have retrieved the tool and that it is in good condition. This action will definitively validate the retrieval.'
              : "Veuillez confirmer que vous avez récupéré l’outil et qu’il est en bon état. Cette action validera définitivement la récupération."}
          </p>
          <p className={`text-sm text-muted-foreground ${language === 'ar' ? 'text-right' : ''}`}>
            {language === 'ar'
              ? 'وفي حال تم اكتشاف أي مشكلة أثناء الاستلام، يحقّ لك تقييم الخلل والاتفاق مع المستأجر على الإجراءات المناسبة الواجب اتخاذها.'
              : language === 'en'
              ? 'If any issue is detected during the retrieval, you have the right to assess the anomaly and agree with the renter on the appropriate measures to be taken.'
              : "En cas de problème constaté lors de la récupération, vous avez le droit d’évaluer l’anomalie et de convenir avec le locataire des mesures appropriées à prendre."}
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