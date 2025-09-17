
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { CheckIcon, XIcon, Loader2 } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { authService } from '@/services/authService';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  
  // Vérifier si l'utilisateur est arrivé via le processus de vérification
  const isVerified = location.state?.verified || false;
  const email = location.state?.email || '';
  const resetToken = location.state?.resetToken || '';
  
  React.useEffect(() => {
    if (!isVerified || !email || !resetToken) {
      navigate('/forgot-password');
    }
  }, [isVerified, email, resetToken, navigate]);

  const passwordValidation = {
    minLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const isPasswordValid = Object.values(passwordValidation).every(Boolean);
  const passwordsMatch = password === confirmPassword && confirmPassword !== '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!isPasswordValid) {
      setError('Le mot de passe ne respecte pas tous les critères');
      return;
    }

    if (!passwordsMatch) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setIsLoading(true);
    
    try {
      await authService.resetPassword({ resetToken, newPassword: password });
      toast({
        title: t('resetpwd.popupsuccupdate'),
        description: t('resetpwd.txtsucc'),
      });
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Une erreur est survenue lors de la réinitialisation');
    } finally {
      setIsLoading(false);
    }
  };
  const { t, language } = useLanguage();
  const ValidationIndicator = ({ isValid, text }: { isValid: boolean; text: string }) => (
    <div className={`flex items-center space-x-2 text-sm ${isValid ? 'text-green-600 ' : 'text-red-600 '}` + (language === 'ar' ? 'justify-end' : '')}>
      {isValid ? <CheckIcon className="h-4 w-4" /> : <XIcon className="h-4 w-4" />}
      <span>{text}</span>
    </div>
  );
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-20">
        <div className="max-w-md mx-auto px-4">
          <Card>
            <CardHeader className="text-center !flex !flex-col">
              <CardTitle className="text-2xl">{t('password.create.title')}</CardTitle>
              <CardDescription>
                {t('password.create.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="password">{t('password.create.title')}</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                {password && (
                  <div className="space-y-2 p-3 bg-muted rounded-md">
                    <p className="text-sm font-medium">{t('password.criteria')}</p>
                    <ValidationIndicator isValid={passwordValidation.minLength} text={t('password.min_length')} />
                    <ValidationIndicator isValid={passwordValidation.hasUpperCase} text={t('password.uppercase')} />
                    <ValidationIndicator isValid={passwordValidation.hasLowerCase} text={t('password.lowercase')} />
                    <ValidationIndicator isValid={passwordValidation.hasNumber} text={t('password.number')} />
                    <ValidationIndicator isValid={passwordValidation.hasSpecialChar} text={t('password.special_char')} />
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t('password.confirm')}</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  {confirmPassword && (
                    <div className={`text-sm ${passwordsMatch ? 'text-green-600' : 'text-red-600'}`}>
                      {passwordsMatch ? t('password.match') : t('password.not_match')}
                    </div>
                  )}
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading || !isPasswordValid || !passwordsMatch}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isLoading ? 'Modification...' : t('password.update')}
                </Button>
                
                <div className="text-center">
                  <Link to="/login" className="text-sm text-accent hover:underline">
                    {t('password.back_to_login')}
                  </Link>
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

export default ResetPassword;
