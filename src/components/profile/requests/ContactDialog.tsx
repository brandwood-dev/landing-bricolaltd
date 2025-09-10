import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Phone, Mail } from 'lucide-react';
import { handleCall, handleEmail } from './utils';
import { OwnerRequest } from './types';
import { useLanguage } from '@/contexts/LanguageContext';

interface ContactDialogProps {
  request: OwnerRequest;
}

const ContactDialog: React.FC<ContactDialogProps> = ({ request }) => {
  const { t, language } = useLanguage();
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          {t('request.contact')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader className={`${language === 'ar' ? 'flex justify-end' : ''}`}>
          <DialogTitle>{t('request.contact_renter_information')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 ">
          <div className={`flex items-center gap-3 ${language === 'ar' ? 'justify-end' : ''}`}>
            {language === 'ar' ? (
              <>
                <div>
                  <h3 className="font-semibold">{request.renterName}</h3>
                  <p className="text-sm text-muted-foreground">{request.renterEmail}</p>
                  <p className="text-sm text-muted-foreground">{request.renterPhone}</p>
                </div>
                <Avatar className="h-12 w-12">
                  <AvatarImage src={request.renterAvatar} />
                  <AvatarFallback>
                    {request.renterName?.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              </>
            ) : (
              <>
                <Avatar className="h-12 w-12">
                  <AvatarImage src={request.renterAvatar} />
                  <AvatarFallback>
                    {request.renterName?.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{request.renterName}</h3>
                  <p className="text-sm text-muted-foreground">{request.renterEmail}</p>
                  <p className="text-sm text-muted-foreground">{request.renterPhone}</p>
                </div>
              </>
            )}
          </div>
          
          {request.message && (
            <div className="bg-muted/50 p-3 rounded">
              <p className="text-sm"><strong>{t('general.message')} :</strong> {request.message}</p>
            </div>
          )}
          
          <div className="flex gap-2">
            <Button 
              onClick={() => handleCall(request.renterPhone)}
              className="flex-1 flex items-center gap-2"
            >
              <Phone className="h-4 w-4" />
              {t('request.call')}
            </Button>
            <Button 
              variant="outline"
              onClick={() => handleEmail(request.renterEmail)}
              className="flex-1 flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              {t('request.mail')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContactDialog;