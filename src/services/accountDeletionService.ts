import { api } from './api'
import { ApiResponse } from '../types/bridge/common.types'

export interface AccountDeletionValidation {
  canDelete: boolean
  blockingIssues: {
    pendingBookings: number
    confirmedReservations: number
    ongoingDisputes: number
    unreturnedTools: number
  }
  details: {
    pendingBookings?: any[]
    confirmedReservations?: any[]
    ongoingDisputes?: any[]
    unreturnedTools?: any[]
  }
}

export interface PasswordValidationRequest {
  password: string
}

export interface AccountDeletionRequest {
  reason?: string
  feedback?: string
}

class AccountDeletionService {
  // Validate if account can be deleted
  async validateAccountDeletion(
    userId: string
  ): Promise<AccountDeletionValidation> {
    try {
      const response = await api.get<ApiResponse<any>>(
        `/users/${userId}/deletion-validation`
      )

      // Handle nested response structure: response.data.data.data
      const validationData = response.data.data?.data || response.data.data

      return {
        canDelete: validationData.canDelete,
        blockingIssues: validationData.blockingIssues,
        details: validationData.details,
      }
    } catch (error: any) {
      // If endpoint doesn't exist, perform manual validation
      return await this.performManualValidation(userId)
    }
  }

  // Manual validation using existing endpoints
  private async performManualValidation(
    userId: string
  ): Promise<AccountDeletionValidation> {
    try {
      const [userBookings, ownerBookings, userDisputes] = await Promise.all([
        this.getUserBookings(userId),
        this.getOwnerBookings(userId),
        this.getUserDisputes(userId),
      ])

      // Check for pending/confirmed bookings
      const pendingBookings = userBookings.filter((booking: any) =>
        ['pending', 'confirmed', 'in_progress'].includes(booking.status)
      )

      const confirmedReservations = ownerBookings.filter((booking: any) =>
        ['confirmed', 'in_progress'].includes(booking.status)
      )

      // Check for ongoing disputes
      const ongoingDisputes = userDisputes.filter((dispute: any) =>
        ['open', 'in_progress', 'pending'].includes(dispute.status)
      )

      // Check for unreturned tools (bookings where user is renter and status is not completed/returned)
      const unreturnedTools = userBookings.filter((booking: any) =>
        ['confirmed', 'in_progress'].includes(booking.status)
      )

      const blockingIssues = {
        pendingBookings: pendingBookings.length,
        confirmedReservations: confirmedReservations.length,
        ongoingDisputes: ongoingDisputes.length,
        unreturnedTools: unreturnedTools.length,
      }

      const canDelete = Object.values(blockingIssues).every(
        (count) => count === 0
      )

      return {
        canDelete,
        blockingIssues,
        details: {
          pendingBookings,
          confirmedReservations,
          ongoingDisputes,
          unreturnedTools,
        },
      }
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Failed to validate account deletion'
      )
    }
  }

  // Get user bookings (as renter)
  private async getUserBookings(userId: string): Promise<any[]> {
    try {
      const response = await api.get<ApiResponse<any[]>>(
        `/bookings/user/${userId}`
      )
      return response.data.data || []
    } catch (error) {
      console.warn('Failed to fetch user bookings:', error)
      return []
    }
  }

  // Get owner bookings (tools being rented)
  private async getOwnerBookings(userId: string): Promise<any[]> {
    try {
      const response = await api.get<ApiResponse<any[]>>(
        `/bookings/user/owner/${userId}`
      )
      return response.data.data || []
    } catch (error) {
      console.warn('Failed to fetch owner bookings:', error)
      return []
    }
  }

  // Get user disputes
  private async getUserDisputes(userId: string): Promise<any[]> {
    try {
      const response = await api.get<ApiResponse<any[]>>(
        `/disputes/user/${userId}`
      )
      return response.data.data || []
    } catch (error) {
      console.warn('Failed to fetch user disputes:', error)
      return []
    }
  }

  // Validate password before deletion
  async validatePassword(password: string): Promise<boolean> {
    try {
      const response = await api.post<ApiResponse<{ valid: boolean }>>(
        '/auth/validate-password',
        { password }
      )

      // Debug logs to see what we receive
      console.log('=== DEBUG Frontend validatePassword ===')
      console.log('Full response:', response)
      console.log('response.data:', response.data)
      console.log('response.data.data:', response.data.data)
      console.log('response.data.data.valid:', response.data.data.data?.valid)
      console.log('=== END DEBUG Frontend ===')

      // Handle the nested response structure
      const isValid = response.data?.data.data?.valid

      if (typeof isValid !== 'boolean') {
        console.error(
          'Invalid response structure - valid field is not boolean:',
          isValid
        )
        throw new Error('Invalid response from password validation')
      }

      return isValid
    } catch (error: any) {
      console.error('Password validation error:', error)
      throw new Error(
        error.response?.data?.message || 'Password validation failed'
      )
    }
  }

  // Delete account - user deletes their own account (no userId needed)
  async deleteAccount(): Promise<void> {
    try {
      await api.delete<ApiResponse<void>>('/users/account')
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Account deletion failed'
      )
    }
  }

  // Create account deletion request (if immediate deletion is not allowed)
  async createDeletionRequest(
    deletionData: AccountDeletionRequest
  ): Promise<void> {
    try {
      await api.post<ApiResponse<void>>(
        '/account-deletion-requests',
        deletionData
      )
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Failed to create deletion request'
      )
    }
  }
}

export const accountDeletionService = new AccountDeletionService()
