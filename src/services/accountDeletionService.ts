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

      // API returns { data: {...}, message }, use response.data.data
      const envelope = response.data
      const ts = new Date().toISOString()
      const validationData = envelope?.data || {}
      // Debug raw response envelope and payload
      console.debug('📦 Raw deletion-validation response envelope:', {
        ts,
        userId,
        hasSuccess: typeof envelope?.success !== 'undefined',
        hasMessage: typeof envelope?.message !== 'undefined',
        keys: Object.keys(envelope || {}),
      })
      console.debug('🧯 Raw deletion-validation payload (data):', { ts, userId, payloadKeys: Object.keys(validationData || {}) })

      // Normalize blocking issues to ensure numbers are present
      const rawBlocking = validationData.blockingIssues || {}
      const blockingIssues = {
        pendingBookings: Number(rawBlocking.pendingBookings) || 0,
        confirmedReservations: Number(rawBlocking.confirmedReservations) || 0,
        ongoingDisputes: Number(rawBlocking.ongoingDisputes) || 0,
        unreturnedTools: Number(rawBlocking.unreturnedTools) || 0,
      }

      // Decide canDelete: prefer backend flag if boolean, otherwise infer
      const canDeleteFlag = typeof validationData.canDelete === 'boolean'
        ? validationData.canDelete
        : Object.values(blockingIssues).every((c) => c === 0)

      const details = validationData.details || {}

      // Debug logging to trace validation result
      console.debug('🔎 AccountDeletionService.validateAccountDeletion:', {
        ts,
        userId,
        canDelete: canDeleteFlag,
        blockingIssues,
        detailsKeys: Object.keys(details)
      })
      console.debug('✅ Computed decision:', {
        ts,
        userId,
        proceedToPassword: canDeleteFlag,
        reason:
          typeof validationData.canDelete === 'boolean'
            ? 'Backend flag used'
            : 'Inferred from blockingIssues counts',
      })

      return {
        canDelete: canDeleteFlag,
        blockingIssues,
        details: {
          pendingBookings: details.pendingBookings || [],
          confirmedReservations: details.confirmedReservations || [],
          ongoingDisputes: details.ongoingDisputes || [],
          unreturnedTools: details.unreturnedTools || [],
        },
      }
    } catch (error: any) {
      // If endpoint doesn't exist, perform manual validation
      const tsErr = new Date().toISOString()
      console.warn('⚠️ deletion-validation endpoint failed, falling back to manual validation:', {
        ts: tsErr,
        userId,
        message: error?.response?.data?.message || error?.message,
      })
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
      const pendingBookings = userBookings.filter((booking: any) => {
        const s = String(booking.status || '').toUpperCase()
        return ['PENDING', 'CONFIRMED', 'ACCEPTED', 'ONGOING', 'IN_PROGRESS'].includes(s)
      })

      const confirmedReservations = ownerBookings.filter((booking: any) => {
        const s = String(booking.status || '').toUpperCase()
        return ['CONFIRMED', 'ACCEPTED', 'ONGOING', 'IN_PROGRESS'].includes(s)
      })

      // Check for ongoing disputes
      const ongoingDisputes = userDisputes.filter((dispute: any) => {
        const s = String(dispute.status || '').toUpperCase()
        return ['OPEN', 'IN_PROGRESS', 'PENDING'].includes(s)
      })

      // Check for unreturned tools (bookings where user is renter and status is not completed/returned)
      const unreturnedTools = userBookings.filter((booking: any) => {
        const s = String(booking.status || '').toUpperCase()
        return ['CONFIRMED', 'ACCEPTED', 'ONGOING', 'IN_PROGRESS'].includes(s)
      })

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

      // Handle the standard API response structure: { data: { valid: boolean }, message }
      const isValid = response.data?.data?.valid

      if (typeof isValid !== 'boolean') {

        throw new Error('Invalid response from password validation')
      }

      return isValid
    } catch (error: any) {

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
