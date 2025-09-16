import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Flag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { disputeService } from '@/services/disputeService'
import { useAuth } from '@/contexts/AuthContext'
interface ReportDialogProps {
  requestId: string;
  onReportSubmit?: (requestId: string) => void;
}

const ReportDialog: React.FC<ReportDialogProps> = ({ requestId, onReportSubmit }) => {
  const { user } = useAuth()
  const [reportReason, setReportReason] = useState('')
  const [reportMessage, setReportMessage] = useState('')
  const { toast } = useToast()
  const { t, language } = useLanguage()
 
  //doit etre dynamic
  const handleReport = async () => {
    if (!reportReason || !reportMessage) {
      toast({
        title: t('general.error'),
        description: t('general.report_error_message'),
        variant: 'destructive',
      })
      return
    }

    if (!user?.id) {
      toast({
        title: t('general.error'),
        description: 'Utilisateur non connecté',
        variant: 'destructive',
      })
      return
    }

    try {
      // Créer une dispute via l'API
      await disputeService.createDispute({
        userId: user.id,
        bookingId: requestId,
        reason: reportReason,
        description: reportMessage,
      })

      // // Marquer la réservation comme ayant une réclamation active
      // setRequests((prev) =>
      //   prev.map((res) =>
      //     res.id === requestId ? { ...res, hasActiveClaim: true } : res
      //   )
      // )

      toast({
        title: t('request.report.ACCEPTED.title'),
        description: t('request.report.ACCEPTED.message'),
      })
      // if (onReportSubmit) {
      //   onReportSubmit(requestId)
      // }
      setReportReason('')
      setReportMessage('')
    } catch (error: any) {
      console.error('Erreur lors de la création de la dispute:', error)
      
      // Extract meaningful error message from API response
      let errorMessage = 'Erreur lors de la création du signalement';
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message && !error.message.includes('Converting circular structure')) {
        errorMessage = error.message;
      }
      
      toast({
        title: t('general.error'),
        description: errorMessage,
        variant: 'destructive',
      })
    }
  }
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant='outline' size='sm'>
          <Flag className='h-4 w-4 mr-1' />
          {t('request.report')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader className='flex justify-end'>
          <DialogTitle className='text-left'>
            {t('request.report.title')}
          </DialogTitle>
        </DialogHeader>
        <div className='space-y-4'>
          <Select value={reportReason} onValueChange={setReportReason}>
            <SelectTrigger>
              <SelectValue placeholder={t('request.report.reason')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='no-response'>
                {t('request.report.reason.no_show')}
              </SelectItem>
              <SelectItem value='wrong-number'>
                {t('request.report.reason.damaged_tool')}
              </SelectItem>
              <SelectItem value='late-return'>
                {t('request.report.reason.late_return')}
              </SelectItem>
              <SelectItem value='inappropriate'>
                {t('request.report.reason.inappropriate_behavior')}
              </SelectItem>
              <SelectItem value='fraud_attempt'>
                {t('request.report.reason.fraud_attempt')}
              </SelectItem>
              <SelectItem value='other'>
                {t('request.report.reason.other')}
              </SelectItem>
            </SelectContent>
          </Select>
          <Textarea
            placeholder={t('request.report.describe')}
            value={reportMessage}
            onChange={(e) => setReportMessage(e.target.value)}
          />
          <Button onClick={handleReport} className='w-full'>
            {t('request.report.submit')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
};

export default ReportDialog;