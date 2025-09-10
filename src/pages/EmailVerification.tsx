import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { CheckCircle, Mail, Loader2, AlertCircle, Shield, Clock } from 'lucide-react';
import { api } from '@/services/api';
import { toast } from 'sonner';

const EmailVerification = () => {
  const { t } = useLanguage();
  const { user, verifyEmailCode, verifyEmail } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [hasVerified, setHasVerified] = useState(false);

  // Debug state changes
  console.log('=== CURRENT STATE ===');
  console.log('Verification Code:', verificationCode);
  console.log('Is Loading:', isLoading);
  console.log('Is Resending:', isResending);
  console.log('Error:', error);
  console.log('Success:', success);
  console.log('Countdown:', countdown);
  console.log('Has Verified:', hasVerified);
  
  const token = searchParams.get('token');
  const email = searchParams.get('email') || user?.email || '';
  const from = searchParams.get('from') || '/profile';

  // Debug logging for user experience tracking
  console.log('=== EMAIL VERIFICATION PAGE LOADED ===');
  console.log('User data:', user);
  console.log('URL Parameters:', {
    token,
    email,
    from,
    fullURL: window.location.href
  });
  console.log('Search params:', Object.fromEntries(searchParams.entries()));

  // Auto-verify if token is provided in URL
  useEffect(() => {
    console.log('=== AUTO-VERIFICATION EFFECT ===');
    console.log('Token present:', !!token);
    console.log('Has verified:', hasVerified);
    console.log('Will auto-verify:', !!(token && !hasVerified));
    
    if (token && !hasVerified) {
      console.log('Starting auto-verification with token:', token);
      verifyEmailWithToken(token);
    }
  }, [token, hasVerified]);

  // Countdown timer for resend button
  useEffect(() => {
    console.log('=== COUNTDOWN EFFECT ===');
    console.log('Current countdown:', countdown);
    
    if (countdown > 0) {
      console.log('Setting countdown timer for:', countdown - 1);
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      console.log('Countdown finished or not active');
    }
  }, [countdown]);

  const verifyEmailWithToken = async (verificationToken: string) => {
    console.log('=== VERIFY EMAIL WITH TOKEN ===');
    console.log('Token:', verificationToken);
    console.log('Has verified check:', hasVerified);
    
    if (hasVerified) {
      console.log('Already verified, skipping...');
      return;
    }
    
    try {
      console.log('Starting token verification...');
      setIsLoading(true);
      setError('');
      setHasVerified(true);
      
      console.log('Verifying token using AuthContext:', verificationToken);
      // Use the AuthContext function to ensure proper state management
      await verifyEmail(verificationToken);
      
      console.log('Verification successful!');
      setSuccess(true);
      toast.success(t('verification.success'));
      
      // Redirect to intended destination after 3 seconds if user is logged in
      console.log('Setting up redirect timer...');
      setTimeout(() => {
        console.log('=== REDIRECT EXECUTION ===');
        console.log('User for redirect:', user);
        console.log('Redirect destination:', user ? from : '/login');
        
        if (user) {
          console.log('Redirecting to:', from);
          navigate(from);
        } else {
          console.log('No user, redirecting to login');
          navigate('/login');
        }
      }, 3000);
    } catch (error: any) {
      console.error('=== VERIFICATION ERROR ===');
      console.error('Error object:', error);
      
      const errorMessage = error.message || t('verification.error');
      console.log('Error message to display:', errorMessage);
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      console.log('Token verification completed, setting loading to false');
      setIsLoading(false);
    }
  };

  const verifyEmailWithCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('=== VERIFY EMAIL WITH CODE ===');
    console.log('Verification code entered:', verificationCode);
    console.log('Email for verification:', email);
    
    if (!verificationCode.trim()) {
      console.log('No verification code provided');
      setError(t('verification.code_required'));
      return;
    }
    
    try {
      console.log('Starting code verification...');
      setIsLoading(true);
      setError('');
      
      // Use the AuthContext function to ensure proper state management
      await verifyEmailCode(email, verificationCode);
      
      console.log('Code verification successful!');
      setHasVerified(true);
      setSuccess(true);
      toast.success(t('verification.success'));
      
      // Redirect to intended destination after 3 seconds if user is logged in
      console.log('Setting up redirect timer (code verification)...');
      setTimeout(() => {
        console.log('=== REDIRECT EXECUTION (CODE VERIFICATION) ===');
        console.log('User for redirect:', user);
        console.log('Redirect destination:', user ? from : '/login');
        
        if (user) {
          console.log('Redirecting to (code verification):', from);
          navigate(from);
        } else {
          console.log('No user, redirecting to login (code verification)');
          navigate('/login');
        }
      }, 3000);
    } catch (error: any) {
      console.error('=== CODE VERIFICATION ERROR ===');
      console.error('Error object:', error);
      
      const errorMessage = error.message || t('verification.invalid_code');
      console.log('Code verification error message:', errorMessage);
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      console.log('Code verification completed, setting loading to false');
      setIsLoading(false);
    }
  };

  const resendVerificationEmail = async () => {
    console.log('=== RESEND VERIFICATION EMAIL ===');
    console.log('Email to resend to:', email);
    
    try {
      console.log('Starting resend verification...');
      setIsResending(true);
      setError('');
      
      const response = await api.post('/auth/resend-verification', {
        email
      });
      
      console.log('Resend verification API Response:', response);
      console.log('Resend verification response data:', response.data);
      
      if (response.data) {
        console.log('Verification email resent successfully!');
        toast.success(t('verification.resent'));
        setCountdown(60); // 60 seconds cooldown
        console.log('Countdown set to 60 seconds');
      }
    } catch (error: any) {
      console.error('=== RESEND VERIFICATION ERROR ===');
      console.error('Error object:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      
      const errorMessage = error.response?.data?.message || t('verification.resend_error');
      console.log('Resend error message:', errorMessage);
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      console.log('Resend verification completed, setting resending to false');
      setIsResending(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-950">
        <Header />
        <main className="py-20">
          <div className="max-w-md mx-auto px-4">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
              <CardHeader className="text-center pb-8">
                <div className="mx-auto mb-6 w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-200 dark:from-green-800 dark:to-emerald-900 rounded-full flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {t('verification.success_title')}
                </CardTitle>
                <CardDescription className="text-lg mt-2">
                  {t('verification.success_message')}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800">
                  <Shield className="w-6 h-6 text-green-600 dark:text-green-400 mx-auto mb-2" />
                  <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                    {t('verification.account_verified')}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground mb-6 flex items-center justify-center gap-2">
                  <Clock className="w-4 h-4" />
                  {t('verification.redirecting')}
                </p>
                <Button asChild className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                  <Link to={user ? from : '/login'}>
                    {user ? t('navigation.profile') : t('navigation.login')}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-950">
      <Header />
      <main className="py-20">
        <div className="max-w-md mx-auto px-4">
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
            <CardHeader className="text-center pb-8">
              <div className="mx-auto mb-6 w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-blue-800 dark:to-indigo-900 rounded-full flex items-center justify-center shadow-lg">
                <Mail className="w-10 h-10 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {t('verification.title')}
              </CardTitle>
              <CardDescription className="text-lg mt-2">
                {t('verification.description', { email })}
              </CardDescription>
            </CardHeader>
            <CardContent>

              {error && (
                <Alert variant="destructive" className="mb-6 border-red-200 bg-red-50 dark:bg-red-900/20">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="font-medium">{error}</AlertDescription>
                </Alert>
              )}
              
              {!token && (
                <form onSubmit={verifyEmailWithCode} className="space-y-6">
                  <div className="space-y-4">
                    <Label htmlFor="verificationCode" className="text-center block text-lg font-medium">
                      {t('verification.code_label')}
                    </Label>
                    <div className="flex justify-center">
                      <InputOTP
                        maxLength={6}
                        value={verificationCode}
                        onChange={(value) => {
                          console.log('=== VERIFICATION CODE INPUT ===');
                          console.log('Previous code:', verificationCode);
                          console.log('New code:', value);
                          setVerificationCode(value);
                          setError('');
                        }}
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} className="w-12 h-12 text-lg font-semibold border-2 border-blue-200 focus:border-blue-500 dark:border-blue-700 dark:focus:border-blue-400" />
                          <InputOTPSlot index={1} className="w-12 h-12 text-lg font-semibold border-2 border-blue-200 focus:border-blue-500 dark:border-blue-700 dark:focus:border-blue-400" />
                          <InputOTPSlot index={2} className="w-12 h-12 text-lg font-semibold border-2 border-blue-200 focus:border-blue-500 dark:border-blue-700 dark:focus:border-blue-400" />
                          <InputOTPSlot index={3} className="w-12 h-12 text-lg font-semibold border-2 border-blue-200 focus:border-blue-500 dark:border-blue-700 dark:focus:border-blue-400" />
                          <InputOTPSlot index={4} className="w-12 h-12 text-lg font-semibold border-2 border-blue-200 focus:border-blue-500 dark:border-blue-700 dark:focus:border-blue-400" />
                          <InputOTPSlot index={5} className="w-12 h-12 text-lg font-semibold border-2 border-blue-200 focus:border-blue-500 dark:border-blue-700 dark:focus:border-blue-400" />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                    <p className="text-center text-sm text-muted-foreground">
                      {t('verification.code_placeholder')}
                    </p>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full h-12 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg" 
                    disabled={isLoading || verificationCode.length !== 6}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        {t('verification.verifying')}
                      </>
                    ) : (
                      t('verification.verify_button')
                    )}
                  </Button>
                </form>
              )}
              
              {token && isLoading && (
                <div className="text-center py-8">
                  <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-lg font-medium text-muted-foreground">
                    {t('verification.verifying')}
                  </p>
                </div>
              )}
              
              <div className="mt-8 space-y-4">
                <div className="text-center">
                  <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                    <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                      {t('verification.no_email')}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={resendVerificationEmail}
                    disabled={isResending || countdown > 0}
                    className="w-full h-11 border-2 border-blue-200 hover:border-blue-300 hover:bg-blue-50 dark:border-blue-700 dark:hover:border-blue-600 dark:hover:bg-blue-900/20"
                  >
                    {isResending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('verification.resending')}
                      </>
                    ) : countdown > 0 ? (
                      <>
                        <Clock className="mr-2 h-4 w-4" />
                        {t('verification.resend_countdown', { seconds: countdown })}
                      </>
                    ) : (
                      <>
                        <Mail className="mr-2 h-4 w-4" />
                        {t('verification.resend_button')}
                      </>
                    )}
                  </Button>
                </div>
                
                <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Link 
                    to="/login" 
                    className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline font-medium"
                  >
                    {t('verification.back_to_login')}
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EmailVerification;