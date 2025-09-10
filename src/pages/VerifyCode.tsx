
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { authService } from '@/services/authService';

const VerifyCode = () => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  const { t } = useLanguage();

  useEffect(() => {
    if (!email) {
      navigate('/forgot-password');
      return;
    }
    
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown, email, navigate]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (code.length !== 6) {
      setError('Le code doit contenir 6 caractères');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await authService.verifyResetCode({ email, code });
      toast({
        title: t('email.valid_code'),
        description: t('email.valid_code_message'),
      });
      navigate('/reset-password', { 
        state: { 
          email, 
          verified: true, 
          resetToken: response.resetToken 
        } 
      });
    } catch (err: any) {
      setError(err.response?.data?.message || t('email.invalid_code'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    setError('');
    
    try {
      await authService.resendResetCode(email);
      setCountdown(60);
      setCanResend(false);
      toast({
        title: t('email.resend.message'),
        description: t('email.resend.description'),
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du renvoi du code');
    } finally {
      setIsResending(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-20">
        <div className="max-w-md mx-auto px-4">
          <Card>
            <CardHeader className="text-center !flex !flex-col">
              <CardTitle className="text-2xl">{t('email.verification.title')}</CardTitle>
              <CardDescription>
                {t('email.verification.description')} {email}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={code}
                    onChange={(value) => setCode(value)}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading || code.length !== 6}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isLoading ? t('resetpwd.verify_in_progress') : t('resetpwd.verify')}
                </Button>
                
                <div className="text-center space-y-2">
                  {canResend ? (
                    <Button 
                      type="button" 
                      variant="ghost" 
                      onClick={handleResendCode}
                      disabled={isResending}
                      className="text-sm text-accent hover:underline"
                    >
                      {isResending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {t('email.resend')}
                    </Button>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {t('email.resend')} {t('general.in')} {countdown}s
                    </p>
                  )}
                  
                  <div>
                    <Link to="/forgot-password" className="text-sm text-accent hover:underline">
                      {t('general.back')}
                    </Link>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default VerifyCode;
