import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/services/api';
import { authService } from '@/services/authService';
import { User, Country } from '@/types/bridge/user.types';
import SuspensionModal from '@/components/SuspensionModal';

// Auth context interface
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => Promise<void>;
  refreshToken: () => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  verifyEmailCode: (email: string, code: string) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
}

import { RegisterData } from '../types/bridge/auth.types';

// Login response interface
interface LoginResponse {
  user: User;
  token: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [suspensionModal, setSuspensionModal] = useState<{ isOpen: boolean; reason: string }>({ isOpen: false, reason: '' });

  const isAuthenticated = !!user;

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('user');
        
        if (token && storedUser) {
          // Verify token is still valid and get fresh user data
          try {
            const response = await api.get('/auth/verify');
            // Get complete user profile with all fields
            const profileResponse = await api.get('/auth/profile');
            const completeUserData = profileResponse.data.data;
            
            // Update localStorage with complete user data
            localStorage.setItem('user', JSON.stringify(completeUserData));
            setUser(completeUserData);
          } catch (error) {
            // Token is invalid, clear auth data
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            setUser(null);
          }
        }
      } catch (error) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      // Use authService for consistent error handling
      const response = await authService.login({ email, password });
      const { user: userData, token } = response;
      
      // Store auth token
      localStorage.setItem('authToken', token);
      
      // Get complete user profile with all fields
      const profileResponse = await api.get('/auth/profile');
      const completeUserData = profileResponse.data.data;
      
      // Store complete user data
      localStorage.setItem('user', JSON.stringify(completeUserData));
      setUser(completeUserData);
      
    } catch (error: any) {
      // Don't clear user state on login errors since user wasn't authenticated to begin with
      // Only clear localStorage in case there were any stale tokens
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
      // Check if this is a suspension error
      const errorMessage = error.response?.data?.message || error.message || '';
      if (error.response?.status === 401 && errorMessage.includes('suspended')) {
        // Extract suspension reason from the error message
        // Format: 'Your account access has been suspended. Reason: [reason]. You cannot access the application.'
        const reasonMatch = errorMessage.match(/Reason: (.+?)\. You cannot access/);
        const suspensionReason = reasonMatch ? reasonMatch[1] : 'Aucune raison spécifiée';
        
        // Show suspension modal
        setSuspensionModal({ isOpen: true, reason: suspensionReason });
        
        // Don't re-throw the error for suspension cases
        return;
      }
      
      // Re-throw the error to maintain the same behavior for other errors
      throw error;
    }
  };

  const register = async (userData: RegisterData): Promise<void> => {
    try {
      setIsLoading(true);
      console.log('Starting registration for email:', userData.email);
      
      const response = await api.post('/auth/register', userData);
      console.log('Registration successful, status:', response.status);
      
      // Registration successful - API returns user and token data
      if (response.data && response.data.data) {
        const { user: registeredUser, token } = response.data.data;
        
        // Store auth data temporarily (user will verify email before full login)
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(registeredUser));
        
        // Set user in context
        setUser(registeredUser);
        
        console.log('User registered and logged in successfully');
      }
    } catch (error: any) {
      console.error('Registration error:', error.response?.status, error.response?.data?.message);
      
      const errorMessage = error.response?.data?.message || 'Registration failed';
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  const closeSuspensionModal = (): void => {
    setSuspensionModal({ isOpen: false, reason: '' });
  };

  const updateUser = async (userData: Partial<User>): Promise<void> => {
    try {
      const response = await api.patch<User>('/users/me', userData);
      const updatedUser = response.data.data;
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Profile update failed';
      throw new Error(errorMessage);
    }
  };

  const refreshToken = async (): Promise<void> => {
    try {
      const response = await api.post<{ token: string }>('/auth/refresh');
      const { token } = response.data.data;
      
      localStorage.setItem('authToken', token);
    } catch (error: any) {
      // If refresh fails, logout user
      logout();
      throw new Error('Session expired. Please login again.');
    }
  };

  const verifyEmail = async (token: string): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await api.post('/auth/verify-email', { token });
      
      if (response.data.success) {
        // Email verified successfully - update user state
        if (user) {
          const updatedUser = { ...user, verifiedEmail: true };
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Email verification failed';
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmailCode = async (email: string, code: string): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await api.post('/auth/verify-email-code', { email, code });
      
      if (response.data.success) {
        // Email verified successfully - update user state
        if (user) {
          const updatedUser = { ...user, verifiedEmail: true };
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Email verification failed';
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerification = async (email: string): Promise<void> => {
    try {
      const response = await api.post('/auth/resend-verification', { email });
      
      if (response.data.success) {
        // Verification email sent successfully
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to resend verification email';
      throw new Error(errorMessage);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    refreshToken,
    verifyEmail,
    verifyEmailCode,
    resendVerification,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      <SuspensionModal
        isOpen={suspensionModal.isOpen}
        onClose={closeSuspensionModal}
        reason={suspensionModal.reason}
      />
    </AuthContext.Provider>
  );
};

export default AuthContext;