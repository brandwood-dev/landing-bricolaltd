import { api } from './api';
import { User } from '@/types/bridge/user.types';
import { RegisterData, LoginDto, LoginResponse as BridgeLoginResponse } from '../types/bridge/auth.types';
import { ApiResponse } from '../types/bridge/common.types';

// Auth service interfaces
export interface LoginCredentials extends LoginDto {}

export interface LoginResponse extends BridgeLoginResponse {}

export interface ForgotPasswordData {
  email: string;
}

export interface VerifyCodeData {
  email: string;
  code: string;
}

export interface ResetPasswordData {
  resetToken: string;
  newPassword: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface VerifyEmailCodeData {
  email: string;
  code: string;
}

export interface ResendVerificationData {
  email: string;
}

// Authentication service
export const authService = {
  // Login user
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
      const response = await api.post<ApiResponse<LoginResponse>>('/auth/login', credentials);
      return response.data.data;
    } catch (error: any) {
      // Handle different error response formats
      let errorMessage = 'Login failed';
      
      if (error.response?.data) {
        // Check for NestJS default error format
        if (error.response.data.message) {
          errorMessage = Array.isArray(error.response.data.message) 
            ? error.response.data.message[0] 
            : error.response.data.message;
        }
        // Check for custom API response format
        else if (error.response.data.data?.message) {
          errorMessage = error.response.data.data.message;
        }
      }
      
      throw new Error(errorMessage);
    }
  },

  // Register new user
  register: async (userData: RegisterData): Promise<LoginResponse> => {
    try {
      const response = await api.post<ApiResponse<LoginResponse>>('/auth/register', userData);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },

  // Logout user
  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Even if logout fails on server, we should clear local storage
    }
  },

  // Verify token
  verifyToken: async (): Promise<User> => {
    try {
      const response = await api.get<ApiResponse<User>>('/auth/verify');
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Token verification failed');
    }
  },

  // Refresh token
  refreshToken: async (): Promise<{ token: string }> => {
    try {
      const response = await api.post<ApiResponse<{ token: string }>>('/auth/refresh');
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Token refresh failed');
    }
  },

  // Get user profile
  getProfile: async (): Promise<User> => {
    try {
      const response = await api.get<ApiResponse<User>>('/auth/profile');
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch profile');
    }
  },

  // Update user profile
  updateProfile: async (userData: Partial<User>): Promise<User> => {
    try {
      const response = await api.patch<User>('/users/me', userData);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Profile update failed');
    }
  },

  // Forgot password - send reset code
  forgotPassword: async (data: ForgotPasswordData): Promise<{ message: string }> => {
    try {
      const response = await api.post<{ message: string }>('/auth/forgot-password', data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to send reset code');
    }
  },

  // Verify reset code
  verifyResetCode: async (data: VerifyCodeData): Promise<{ resetToken: string; message: string }> => {
    try {
      const response = await api.post<{ resetToken: string; message: string }>('/auth/verify-reset-code', data);
      return response.data.data;
    } catch (error: any) {
      throw error;
    }
  },

  // Reset password
  resetPassword: async (data: { resetToken: string; newPassword: string }): Promise<{ message: string }> => {
    try {
      const response = await api.post<{ message: string }>('/auth/reset-password', {
        resetToken: data.resetToken,
        newPassword: data.newPassword
      });
      return response.data.data;
    } catch (error: any) {
      throw error;
    }
  },

  // Change password (for authenticated users)
  changePassword: async (data: ChangePasswordData): Promise<{ message: string }> => {
    try {
      const response = await api.post<{ message: string }>('/auth/change-password', data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Password change failed');
    }
  },

  // Request email verification
  requestEmailVerification: async (): Promise<{ message: string }> => {
    try {
      const response = await api.post<{ message: string }>('/auth/request-email-verification');
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to send verification email');
    }
  },

  // Verify email with token
  verifyEmail: async (token: string): Promise<{ message: string }> => {
    try {
      const response = await api.post<{ message: string }>('/auth/verify-email', { token });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Email verification failed');
    }
  },

  // Verify email with code
  verifyEmailCode: async (data: VerifyEmailCodeData): Promise<{ message: string }> => {
    try {
      const response = await api.post<{ message: string }>('/auth/verify-email-code', data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Email verification failed');
    }
  },

  // Resend verification email
  resendVerification: async (data: ResendVerificationData): Promise<{ message: string }> => {
    try {
      const response = await api.post<{ message: string }>('/auth/resend-verification', data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to resend verification email');
    }
  },

  // Get user info by email
  getUserInfo: async (email: string): Promise<{ found: boolean; user?: { firstName: string; lastName: string; email: string }; message?: string }> => {
    try {
      const response = await api.post<{ found: boolean; user?: { firstName: string; lastName: string; email: string }; message?: string }>('/auth/get-user-info', { email });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get user info');
    }
  },

  // Delete account
  deleteAccount: async (password: string): Promise<{ message: string }> => {
    try {
      const response = await api.delete<{ message: string }>('/auth/account', {
        data: { password }
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Account deletion failed');
    }
  },

  // Resend reset code
  resendResetCode: async (email: string): Promise<{ message: string }> => {
    try {
      const response = await api.post<{ message: string }>('/auth/resend-reset-code', {
        email
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to resend reset code');
    }
  },
};

export default authService;