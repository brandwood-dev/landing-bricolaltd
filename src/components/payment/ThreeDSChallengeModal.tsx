import React, { useEffect, useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface ThreeDSChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  challengeUrl?: string;
  sessionId?: string;
  onChallengeComplete: (success: boolean) => void;
  processing?: boolean;
  error?: string | null;
}

const ThreeDSChallengeModal: React.FC<ThreeDSChallengeModalProps> = ({
  isOpen,
  onClose,
  challengeUrl,
  sessionId,
  onChallengeComplete,
  processing = false,
  error = null,
}) => {
  const { t } = useLanguage();
  const [challengeWindow, setChallengeWindow] = useState<Window | null>(null);
  const [isChallengeLoading, setIsChallengeLoading] = useState(true);
  const [challengeCompleted, setChallengeCompleted] = useState(false);

  useEffect(() => {
    if (isOpen && challengeUrl) {
      // Open challenge in new window
      const newWindow = window.open(challengeUrl, '_blank', 'width=600,height=600,scrollbars=yes,resizable=yes');
      setChallengeWindow(newWindow);
      setIsChallengeLoading(true);

      // Monitor challenge window
      const checkInterval = setInterval(() => {
        if (newWindow?.closed) {
          clearInterval(checkInterval);
          setChallengeCompleted(true);
          setIsChallengeLoading(false);
          
          // Assume success if window closed normally
          onChallengeComplete(true);
          setTimeout(() => {
            onClose();
          }, 2000);
        }
      }, 1000);

      // Timeout after 10 minutes
      const timeout = setTimeout(() => {
        clearInterval(checkInterval);
        if (!newWindow?.closed) {
          newWindow?.close();
          onChallengeComplete(false);
          onClose();
        }
      }, 600000);

      return () => {
        clearInterval(checkInterval);
        clearTimeout(timeout);
      };
    }
  }, [isOpen, challengeUrl, onChallengeComplete, onClose]);

  const handleManualClose = () => {
    if (challengeWindow && !challengeWindow.closed) {
      challengeWindow.close();
    }
    onChallengeComplete(false);
    onClose();
  };

  const handleRetry = () => {
    setChallengeCompleted(false);
    setIsChallengeLoading(true);
    // Re-open challenge window
    if (challengeUrl) {
      const newWindow = window.open(challengeUrl, '_blank', 'width=600,height=600,scrollbars=yes,resizable=yes');
      setChallengeWindow(newWindow);
    }
  };

  if (processing) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              {t('processing_3ds')}
            </DialogTitle>
            <DialogDescription>
              {t('processing_3ds_description')}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error) {
    return (
      <Dialog open={isOpen} onOpenChange={handleManualClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              {t('3ds_error')}
            </DialogTitle>
            <DialogDescription>
              {t('3ds_error_description')}
            </DialogDescription>
          </DialogHeader>
          
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>

          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={handleManualClose}
              className="flex-1"
            >
              {t('cancel')}
            </Button>
            <Button 
              onClick={handleRetry}
              className="flex-1"
            >
              {t('retry')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (challengeCompleted) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              {t('3ds_completed')}
            </DialogTitle>
            <DialogDescription>
              {t('3ds_completed_description')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex justify-center py-4">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>

          <Button onClick={onClose} className="w-full">
            {t('continue')}
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleManualClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-500" />
            {t('3ds_authentication')}
          </DialogTitle>
          <DialogDescription>
            {t('3ds_authentication_description')}
          </DialogDescription>
        </DialogHeader>

        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-600" />
              {t('secure_authentication')}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2 text-sm text-gray-600">
              <p>{t('3ds_secure_info_1')}</p>
              <p>{t('3ds_secure_info_2')}</p>
              <p className="text-xs text-gray-500 mt-3">
                {t('3ds_secure_info_3')}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="flex justify-center mb-3">
            {isChallengeLoading ? (
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            ) : (
              <Shield className="h-8 w-8 text-blue-500" />
            )}
          </div>
          <p className="text-sm text-gray-600 mb-2">
            {t('3ds_challenge_loading')}
          </p>
          <p className="text-xs text-gray-500">
            {t('3ds_challenge_instructions')}
          </p>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {t('3ds_challenge_alert')}
          </AlertDescription>
        </Alert>

        <div className="flex gap-3 pt-4">
          <Button 
            variant="outline" 
            onClick={handleManualClose}
            className="flex-1"
            disabled={isChallengeLoading}
          >
            {t('cancel_payment')}
          </Button>
          <Button 
            onClick={handleRetry}
            className="flex-1"
            disabled={isChallengeLoading}
          >
            {t('restart_challenge')}
          </Button>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            {t('3ds_session_id')}: {sessionId}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ThreeDSChallengeModal;