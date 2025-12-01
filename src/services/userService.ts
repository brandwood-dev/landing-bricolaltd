import { api } from './api'
import { UserStats, UserActivity } from '../types/bridge/user.types'
import { ApiResponse, PaginationMeta } from '../types/bridge/common.types'

export type { UserStats, UserActivity }

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

class UserService {
  async getUserProfile(userId: string) {
    try {
      // Use the auth/profile endpoint for regular users to get their own profile
      const response = await api.get<ApiResponse<any>>('/auth/profile')
      return response.data.data
    } catch (error) {
      throw error
    }
  }

  async updateUserProfile(userId: string, userData: any) {
    try {
      const response = await api.patch<ApiResponse<any>>(
        `/users/${userId}`,
        userData
      )
      return response.data.data
    } catch (error) {
      throw error
    }
  }

  async uploadProfilePicture(userId: string, file: File) {
    const formData = new FormData()
    formData.append('photo', file)

    const response = await api.post<ApiResponse<any>>(
      `/users/profile/upload-photo`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    return response
  }
  // save profilpicture
  async saveProfilePicture(imageUrl: string) {
    const profilePicture = imageUrl
    const response = await api.patch('/users/me', { profilePicture })
    console.log('response  : ', response)
    return response.data.data
  }

  async getUserActivities(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResult<UserActivity>> {
    try {
      const response = await api.get<
        ApiResponse<PaginatedResult<UserActivity>>
      >(`/users/${userId}/activities`, {
        params: { page, limit },
      })
      return response.data.data
    } catch (error) {
      throw error
    }
  }

  async getUserTransactions(
    userId: string,
    page: number = 1,
    limit: number = 20
  ) {
    try {
      const response = await api.get<ApiResponse<any>>(
        `/users/${userId}/transactions`,
        {
          params: { page, limit },
        }
      )
      return response.data.data
    } catch (error) {
      throw error
    }
  }

  // Get user statistics from API endpoint
  async getUserStats(): Promise<UserStats> {
    try {
      console.log('UserService - Fetching stats for current user');
      
      // Call the dedicated stats endpoint
      const response = await api.get<ApiResponse<{
        totalEarnings: number;
        activeAds: number;
        completedRentals: number;
        averageRating: number;
      }>>('/users/me/stats')
      
      console.log('UserService - Raw API response:', response);
      console.log('UserService - Response data:', response.data);
      
      const stats = response.data.data.data //
      
      console.log('UserService - Extracted stats:', stats);
      
     

      // Get user profile for memberSince date
      const userProfile = await this.getUserProfile('')
      
      const transformedStats = {
        activeAds: stats.activeAds,
        completedRentals: stats.completedRentals,
        totalEarnings: stats.totalEarnings,
        globalAverageRating: stats.averageRating,
      }
      
      console.log('UserService - Transformed stats:', transformedStats);
      
      return transformedStats;
    } catch (error) {
      console.error('UserService - Error fetching user stats:', error)
      throw error
    }
  }
}

export const userService = new UserService()
