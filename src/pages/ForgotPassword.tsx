
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { authService } from '@/services/authService';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingUser, setIsCheckingUser] = useState(false);
  const [error, setError] = useState('');
  const [userInfo, setUserInfo] = useState<{ firstName: string; lastName: string; email: string } | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleCheckUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateEmail(email)) {
      setError(t('resetpwd.invalid_email'));
      return;
    }

    setIsCheckingUser(true);
    
    try {
      const result = await authService.getUserInfo(email);
      if (result.found && result.user) {
        setUserInfo(result.user);
        setShowConfirmation(true);
      } else {
        setError(t('resetpwd.no_account_found'));
      }
    } catch (err: any) {
      setError(err.message || t('resetpwd.check_error'));
    } finally {
      setIsCheckingUser(false);
    }
  };

  const handleConfirmSendCode = async () => {
    setIsLoading(true);
    
    try {
      await authService.forgotPassword({ email });
      toast({
        title: t('resetpwd.popuptitle'),
        description: t('resetpwd.popuptxt'),
      });
      navigate('/verify-code', { state: { email } });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setShowConfirmation(false);
    setUserInfo(null);
    setError('');
  };



  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-20">
        <div className="max-w-md mx-auto px-4">
          <Card>
            <CardHeader className="text-center !flex !flex-col">
              <CardTitle className="text-2xl">{t('resetpwd.emailtitle')}</CardTitle>
              <CardDescription>
                {t('resetpwd.emailtxt')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!showConfirmation ? (
                <form onSubmit={handleCheckUser} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('resetpwd.emailfield')}</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder={t('resetpwd.emailplaceholder')}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={isCheckingUser}>
                    {isCheckingUser && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isCheckingUser ? t('resetpwd.checking') : t('resetpwd.verify_email')}
                  </Button>
                  
                  <div className="text-center">
                    <Link to="/login" className="text-sm text-accent hover:underline">
                      {t('resetpwd.backlogin')}
                    </Link>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="text-center space-y-3">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-semibold text-lg mb-2">{t('resetpwd.account_found')}</h3>
                      <p className="text-gray-700">
                        <strong>{userInfo?.firstName} {userInfo?.lastName}</strong>
                      </p>
                      <p className="text-gray-600 text-sm">{userInfo?.email}</p>
                    </div>
                    
                    <p className="text-sm text-gray-600">
                      {t('resetpwd.confirm_send_code')}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Button 
                      onClick={handleConfirmSendCode} 
                      className="w-full" 
                      disabled={isLoading}
                    >
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {isLoading ? t('resetpwd.sendbtnpending') : t('resetpwd.confirm_and_send')}
                    </Button>
                    
                    <Button 
                      onClick={handleBackToEmail} 
                      variant="outline" 
                      className="w-full"
                      disabled={isLoading}
                    >
                      {t('resetpwd.change_email')}
                    </Button>
                  </div>
                  
                  <div className="text-center">
                    <Link to="/login" className="text-sm text-accent hover:underline">
                      {t('resetpwd.backlogin')}
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ForgotPassword;
