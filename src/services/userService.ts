import { api } from './api';
import { UserStats, UserActivity } from '../types/bridge/user.types';
import { ApiResponse, PaginationMeta } from '../types/bridge/common.types';

export type { UserStats, UserActivity };

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

class UserService {
  async getUserProfile(userId: string) {
    try {
      // Use the auth/profile endpoint for regular users to get their own profile
      const response = await api.get<ApiResponse<any>>('/auth/profile');
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }

  async updateUserProfile(userId: string, userData: any) {
    try {
      const response = await api.patch<ApiResponse<any>>(`/users/${userId}`, userData);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }

  async uploadProfilePicture(userId: string, file: File) {
    try {
      const formData = new FormData();
      formData.append('photo', file);
      
      const response = await api.post<ApiResponse<any>>(
        `/users/profile/upload-photo`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )
      return response;
    } catch (error) {
      throw error;
    }
  }

  async getUserActivities(userId: string, page: number = 1, limit: number = 20): Promise<PaginatedResult<UserActivity>> {
    try {
      const response = await api.get<ApiResponse<PaginatedResult<UserActivity>>>(`/users/${userId}/activities`, {
        params: { page, limit }
      });
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }

  async getUserTransactions(userId: string, page: number = 1, limit: number = 20) {
    try {
      const response = await api.get<ApiResponse<any>>(`/users/${userId}/transactions`, {
        params: { page, limit }
      });
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }

  // Calculate user statistics from related data
  async getUserStats(userId: string): Promise<UserStats> {
    try {
      // Get user profile with relations
      const userProfile = await this.getUserProfile(userId);
      
      // Calculate stats from the user's related data
      const totalTools = userProfile.tools?.length || 0;
      const totalBookings = userProfile.bookingsAsRenter?.length || 0;
      const totalReviews = userProfile.reviewsReceived?.length || 0;
      
      // Calculate average rating
      const averageRating = totalReviews > 0 
        ? userProfile.reviewsReceived.reduce((sum: number, review: any) => sum + review.rating, 0) / totalReviews
        : 0;
      
      // Count active tools
      const activeTools = userProfile.tools?.filter((tool: any) => tool.isActive)?.length || 0;
      
      // Count completed bookings
      const completedBookings = userProfile.bookingsAsRenter?.filter((booking: any) => booking.status === 'completed')?.length || 0;
      
      return {
        totalTools,
        totalBookings,
        totalReviews,
        averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
        totalEarnings: 0, // Will be calculated from wallet/transactions
        completedBookings,
        activeTools,
        memberSince: userProfile.createdAt
      };
    } catch (error) {
      throw error;
    }
  }
}

export const userService = new UserService();