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
        title: t('success.report.sent.title'),
        description: t('success.report.sent.message'),
        duration: 5000,
        className: "bg-green-50 border-green-200 text-green-800",
      })
      // if (onReportSubmit) {
      //   onReportSubmit(requestId)
      // }
      setReportReason('')
      setReportMessage('')
    } catch (error: any) {
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
              {language === 'en' ? (
                <>
                  <SelectItem value='no-show'>
                    Client did not show up at the appointment
                  </SelectItem>
                  <SelectItem value='late'>
                    Client late for pickup or return
                  </SelectItem>
                  <SelectItem value='misuse'>
                    Improper use of the tool (misuse, risk of damage)
                  </SelectItem>
                  <SelectItem value='damaged'>
                    Return of a damaged or incomplete tool
                  </SelectItem>
                  <SelectItem value='payment'>
                    Non-payment or payment issue
                  </SelectItem>
                  <SelectItem value='suspicious'>
                    Suspicious or fraudulent request
                  </SelectItem>
                  <SelectItem value='behavior'>
                    Inappropriate behavior of the client
                  </SelectItem>
                  <SelectItem value='terms'>
                    Violation of terms of use
                  </SelectItem>
                  <SelectItem value='contact'>
                    Incorrect / unreachable phone number
                  </SelectItem>
                  <SelectItem value='other'>Other</SelectItem>
                </>
              ) : language === 'fr' ? (
                <>
                  <SelectItem value='no-show'>
                    Client non présent au rendez-vous
                  </SelectItem>
                  <SelectItem value='late'>
                    Client en retard pour la prise ou le retour
                  </SelectItem>
                  <SelectItem value='misuse'>
                    Utilisation inappropriée de l'outil (mauvais usage, risque de dommage)
                  </SelectItem>
                  <SelectItem value='damaged'>
                    Retour d'un outil endommagé ou incomplet
                  </SelectItem>
                  <SelectItem value='payment'>
                    Non-paiement ou problème de paiement
                  </SelectItem>
                  <SelectItem value='suspicious'>
                    Demande suspecte ou frauduleuse
                  </SelectItem>
                  <SelectItem value='behavior'>
                    Comportement inapproprié du client
                  </SelectItem>
                  <SelectItem value='terms'>
                    Violation des conditions d'utilisation
                  </SelectItem>
                  <SelectItem value='contact'>
                    Numéro de téléphone incorrect / injoignable
                  </SelectItem>
                  <SelectItem value='other'>Autre</SelectItem>
                </>
              ) : (
                <>
                  <SelectItem value='no-show'>
                    العميل لم يحضر في الموعد
                  </SelectItem>
                  <SelectItem value='late'>
                    تأخر العميل في الاستلام أو الإرجاع
                  </SelectItem>
                  <SelectItem value='misuse'>
                    سوء استخدام الأداة (إساءة استخدام، خطر التلف)
                  </SelectItem>
                  <SelectItem value='damaged'>
                    إرجاع أداة تالفة أو غير مكتملة
                  </SelectItem>
                  <SelectItem value='payment'>
                    عدم الدفع أو مشكلة في الدفع
                  </SelectItem>
                  <SelectItem value='suspicious'>
                    طلب مشبوه أو احتيالي
                  </SelectItem>
                  <SelectItem value='behavior'>
                    سلوك غير لائق من العميل
                  </SelectItem>
                  <SelectItem value='terms'>
                    انتهاك شروط الاستخدام
                  </SelectItem>
                  <SelectItem value='contact'>
                    رقم هاتف غير صحيح / لا يمكن الوصول إليه
                  </SelectItem>
                  <SelectItem value='other'>أخرى</SelectItem>
                </>
              )}
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