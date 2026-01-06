import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true,
  redirectTo = '/login'
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();
  const { t } = useLanguage();

  // Show loading spinner while checking authentication
  // But skip loading overlay for login/register pages as they have their own button loading
  if (isLoading && location.pathname !== '/login' && location.pathname !== '/register') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">{t('general.loading')}</p>
        </div>
      </div>
    );
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    // Redirect to login with the current location as state
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // If user is authenticated but email is not verified, redirect to verification
  // But don't redirect if they're already on the verification page
  if (requireAuth && isAuthenticated && user && !user.verifiedEmail && location.pathname !== '/verify-email') {
    return (
      <Navigate 
        to={`/verify-email?email=${encodeURIComponent(user.email)}`} 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // If authentication is not required but user is authenticated
  // (for login/register pages when user is already logged in)
  // Exception: allow access to verify-email page for unverified users
  // Only redirect if we're not currently on login/register pages to prevent
  // interference with the login process
  if (!requireAuth && isAuthenticated && location.pathname !== '/verify-email') {
    // Allow staying on login/register pages during the authentication process
    // to prevent page reloads when login errors occur
    if (location.pathname === '/login' || location.pathname === '/register') {
      // Only redirect if user is verified and we're not in the middle of a form submission
      // This prevents the redirect during login process that causes page reload on error
      return <>{children}</>;
    }
    
    // For other pages, redirect as normal
    if (user && user.verifiedEmail) {
      const from = location.state?.from?.pathname || '/profile';
      return <Navigate to={from} replace />;
    }
    
    // If user is not verified, redirect to verification
    return <Navigate to={`/verify-email?email=${encodeURIComponent(user?.email || '')}`} replace />;
  }

  // Render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;
