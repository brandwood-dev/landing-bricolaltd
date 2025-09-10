import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Flag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
interface ReportDialogProps {
  requestId: string;
  onReportSubmit?: (requestId: string) => void;
}

const ReportDialog: React.FC<ReportDialogProps> = ({ requestId, onReportSubmit }) => {
  const [reportReason, setReportReason] = useState('');
  const [reportMessage, setReportMessage] = useState('');
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const handleReport = () => {
    if (!reportReason) {
      toast({
        title: t('general.error'),
        description: t('general.report_error_message'),
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: t('request.report.accepted.title'),
      description: t('request.report.accepted.message'),
    });
    
    // Call the callback to update the request status
    if (onReportSubmit) {
      onReportSubmit(requestId);
    }
    
    setReportReason('');
    setReportMessage('');
  };

  return (
    <Dialog >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Flag className="h-4 w-4 mr-1" />
          {t('request.report')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader className="flex justify-end">
          <DialogTitle className="text-left">{t('request.report.title')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Select value={reportReason} onValueChange={setReportReason}>
            <SelectTrigger>
              <SelectValue placeholder={t('request.report.reason')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="no-response">{t('request.report.reason.no_show')}</SelectItem>
              <SelectItem value="wrong-number">{t('request.report.reason.damaged_tool')}</SelectItem>
              <SelectItem value="late-return">{t('request.report.reason.late_return')}</SelectItem>
              <SelectItem value="inappropriate">{t('request.report.reason.inappropriate_behavior')}</SelectItem>
              <SelectItem value="fraud_attempt">{t('request.report.reason.fraud_attempt')}</SelectItem>
              <SelectItem value="other">{t('request.report.reason.other')}</SelectItem>
            </SelectContent>
          </Select>
          <Textarea
            placeholder={t('request.report.describe')}
            value={reportMessage}
            onChange={(e) => setReportMessage(e.target.value)}
          />
          <Button onClick={handleReport} className="w-full">
            {t('request.report.submit')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReportDialog;