import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useAgeVerification } from '@/contexts/AgeVerificationContext';
import { useLanguage } from '@/contexts/LanguageContext';

const AgeVerificationDialog = () => {
  const { isVerified, setIsVerified, setIsUnderAge, isUnderAge } = useAgeVerification();
  const navigate = useNavigate();

  const handleConfirmAge = () => {
    setIsVerified(true);
    //stay in the same url
    navigate(window.location.pathname);
  };

  const handleUnderAge = () => {
    setIsUnderAge(true);
    navigate('/under-age');
  };
  const { t, language } = useLanguage();

  return (
    <AlertDialog open={!isVerified && !isUnderAge}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-center">{t("ageVerification.title")}</AlertDialogTitle>
          <AlertDialogDescription className="text-center text-sm leading-relaxed">
            {t("ageVerification.description")}
            <br /><br />
            {t("ageVerification.description2")}
            <br /><br />
            {t("ageVerification.description3")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-col gap-2 sm:flex-col">
          <Button 
            onClick={handleConfirmAge}
            className="w-full"
          >
            {t("ageVerification.confirmButton")}
          </Button>
          <Button 
            variant="outline" 
            onClick={handleUnderAge}
            className="w-full"
          >
            {t("ageVerification.denyButton")}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AgeVerificationDialog;