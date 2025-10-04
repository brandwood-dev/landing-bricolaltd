
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Login = () => {
  const { t } = useLanguage();
  const { login } = useAuth(); // Remove isLoading from AuthContext
  const navigate = useNavigate();
  const location = useLocation();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [apiError, setApiError] = useState('');
  const [isButtonLoading, setIsButtonLoading] = useState(false); // Local loading state for button only
  
  // Get the intended destination from location state
  const from = location.state?.from?.pathname || '/profile';
  
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    // Email validation
    if (!formData.email) {
      newErrors.email = t('validation.email_required');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('validation.email_invalid');
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = t('validation.password_required');
    } else if (formData.password.length < 6) {
      newErrors.password = t('validation.password_min_length');
    }
    
    const hasErrors = Object.keys(newErrors).length > 0;
    setErrors(newErrors);
    return !hasErrors;
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Clear API error
    if (apiError) {
      setApiError('');
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!validateForm()) {
      return;
    }
    
    // Clear any previous API errors
    setApiError('');
    
    // Start button loading state
    setIsButtonLoading(true);
    
    try {
      await login(formData.email, formData.password);
      navigate(from, { replace: true });
    } catch (error: any) {
      // Check if the error is related to email verification
      if (error.message && error.message.includes('verify your email')) {
        navigate(`/verify-email?email=${encodeURIComponent(formData.email)}&from=${encodeURIComponent(from)}`);
        return;
      }
      
      const errorMessage = error.message || 'Login failed. Please check your credentials and try again.';
      setApiError(errorMessage);
    } finally {
      setIsButtonLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-20">
        <div className="max-w-md mx-auto px-4">
          <Card>
            <CardHeader className="text-center flex !flex-col">
              <CardTitle className="text-2xl">{t('login.title')}</CardTitle>
              <CardDescription>
                {t('login.subtitle')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {apiError && (
                <Alert variant="destructive">
                  <AlertDescription>{apiError}</AlertDescription>
                </Alert>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t('login.email')}</Label>
                  <Input 
                    id="email" 
                    name="email"
                    type="email" 
                    placeholder="votre@email.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">{t('login.password')}</Label>
                  <Input 
                    id="password" 
                    name="password"
                    type="password" 
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={errors.password ? 'border-red-500' : ''}
                  />
                  {errors.password && (
                    <p className="text-sm text-red-500">{errors.password}</p>
                  )}
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isButtonLoading}
                >
                  {isButtonLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('login.signing')}
                    </>
                  ) : (
                    t('login.signin')
                  )}
                </Button>
              </form>
              
              <div className="text-center space-y-2">
                <Link to="/register" className="text-sm text-accent hover:underline">
                  {t('login.no_account')}
                </Link>
                <div>
                  <Link to="/forgot-password" className="text-sm text-muted-foreground hover:underline">
                    {t('login.forgot_password')}
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

export default Login;
