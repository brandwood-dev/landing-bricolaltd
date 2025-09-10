import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/services/api';
import { authService } from '@/services/authService';
import { User, Country } from '@/types/bridge/user.types';

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

  const isAuthenticated = !!user;

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('user');
        
        if (token && storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          
          // Verify token is still valid
          try {
            await api.get('/auth/verify');
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
      
      // Store auth data
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      
    } catch (error: any) {
      // Don't clear user state on login errors since user wasn't authenticated to begin with
      // Only clear localStorage in case there were any stale tokens
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
      // Re-throw the error to maintain the same behavior
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
    </AuthContext.Provider>
  );
};

export default AuthContext;