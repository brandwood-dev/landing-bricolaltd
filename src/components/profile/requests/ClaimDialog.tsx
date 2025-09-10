import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

interface ClaimDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (type: string, description: string) => void;
}

const ClaimDialog: React.FC<ClaimDialogProps> = ({
  isOpen,
  onOpenChange,
  onSubmit
}) => {
  const [claimType, setClaimType] = useState('');
  const [claimDescription, setClaimDescription] = useState('');
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!claimType || !claimDescription) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive"
      });
      return;
    }
    
    onSubmit(claimType, claimDescription);
    setClaimType('');
    setClaimDescription('');
  };
  const {t,language} = useLanguage();
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader className={`${language === 'ar' ? 'flex justify-end' : ''}`}>
          <DialogTitle>{t('request.report.title')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">{t('request.claim.reason')}</label>
            <Select value={claimType} onValueChange={setClaimType}>
              <SelectTrigger>
                <SelectValue placeholder={t('request.claim.reason_placeholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="damaged">{t('request.claim.reason.damaged_tool')}</SelectItem>
                <SelectItem value="late-return">{t('request.claim.reason.late_return')}</SelectItem>
                <SelectItem value="missing-parts">{t('request.claim.reason.missing_parts')}</SelectItem>
                <SelectItem value="not-working">{t('request.claim.reason.not_working')}</SelectItem>
                <SelectItem value="no-showup">{t('request.claim.reason.no_showup')}</SelectItem>
                <SelectItem value="inappropriate-behavior">{t('request.claim.reason.inappropriate_behavior')}</SelectItem>
                <SelectItem value="fraud-attempt">{t('request.claim.reason.fraud_attempt')}</SelectItem>
                <SelectItem value="other">{t('request.claim.reason.other')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">{t('request.claim.describe')}</label>
            <Textarea
              placeholder={t('request.claim.describe_placeholder')}
              value={claimDescription}
              onChange={(e) => setClaimDescription(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">{t('request.claim.evidence')}</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-500">{t('request.claim.evidence_placeholder')}</p>
              <p className="text-xs text-gray-400 mt-1">{t('request.claim.evidence_limit')}</p>
            </div>
          </div>
          <Button onClick={handleSubmit} className="w-full">
            {t('request.claim.submit')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClaimDialog;