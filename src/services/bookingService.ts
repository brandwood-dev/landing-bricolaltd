import { api } from './api';
import {
  Booking,
  CreateBookingData,
  BookingFilters,
  BookingPricing,
  BookingAvailabilityCheck,
  BookingStats
} from '../types/bridge';
import { ApiResponse, PaginatedResponse } from '../types/bridge/common.types';

// All interfaces are now imported from bridge types

// Booking service
export class BookingService {
  // Create a new booking
  async createBooking(bookingData: CreateBookingData): Promise<Booking> {
    try {
      console.log('🔍 [BookingService] createBooking called with:', bookingData);
      const response = await api.post<ApiResponse<Booking>>('/bookings', bookingData);
      console.log('🔍 [BookingService] createBooking response:', response.data);
      return response.data.data;
    } catch (error: any) {
      console.error('❌ [BookingService] createBooking error:', error);
      console.error('❌ [BookingService] Error response:', error.response?.data);
      console.error('❌ [BookingService] Error status:', error.response?.status);
      throw new Error(error.response?.data?.message || 'Failed to create booking');
    }
  }

  // Get booking by ID
  async getBooking(id: string): Promise<Booking> {
    try {
      const response = await api.get<ApiResponse<Booking>>(`/bookings/${id}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch booking');
    }
  }

  // Get user's bookings (as renter)
  async getUserBookings(userId: string, filters?: BookingFilters): Promise<Booking[]> {
    try {
      const params = new URLSearchParams();
      
      if (filters) {
        if (filters.page) params.append('page', filters.page.toString());
        if (filters.limit) params.append('limit', filters.limit.toString());
        if (filters.status) params.append('status', filters.status);
        if (filters.paymentStatus) params.append('paymentStatus', filters.paymentStatus);
        if (filters.startDate) params.append('startDate', filters.startDate);
        if (filters.endDate) params.append('endDate', filters.endDate);
        if (filters.sortBy) params.append('sortBy', filters.sortBy);
        if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
      }
      
      const queryString = params.toString();
      const url = queryString ? `/bookings/user/${userId}?${queryString}` : `/bookings/user/${userId}`;
      const response = await api.get<ApiResponse<Booking[]>>(url);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user bookings');
    }
  }

  // Get owner's bookings (tools being rented)
  async getOwnerBookings(userId: string, filters?: BookingFilters): Promise<{ data: Booking[] }> {
    try {
      const params = new URLSearchParams();
      
      if (filters) {
        if (filters.page) params.append('page', filters.page.toString());
        if (filters.limit) params.append('limit', filters.limit.toString());
        if (filters.status) params.append('status', filters.status);
        if (filters.paymentStatus) params.append('paymentStatus', filters.paymentStatus);
        if (filters.startDate) params.append('startDate', filters.startDate);
        if (filters.endDate) params.append('endDate', filters.endDate);
        if (filters.sortBy) params.append('sortBy', filters.sortBy);
        if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
      }
      
      const queryString = params.toString();
      const url = queryString ? `/bookings/user/owner/${userId}?${queryString}` : `/bookings/user/owner/${userId}`;
      const response = await api.get<ApiResponse<Booking[]>>(url);
      return { data: response.data.data };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch owner bookings');
    }
  }

  // Update booking status
  async updateBookingStatus(id: string, statusOrData: Booking['status'] | { status?: Booking['status']; pickupTool?: boolean }): Promise<Booking> {
    try {
      const updateData = typeof statusOrData === 'string' 
        ? { status: statusOrData }
        : statusOrData;
      
      const response = await api.patch<ApiResponse<Booking>>(`/bookings/${id}`, updateData);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update booking status');
    }
  }

  // Cancel booking
  async cancelBooking(id: string, reason?: string, cancellationMessage?: string): Promise<Booking> {
    try {
      const response = await api.patch<ApiResponse<Booking>>(`/bookings/${id}/cancel`, { 
        reason,
        cancellationMessage
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to cancel booking');
    }
  }

  // Reject booking
  async rejectBooking(id: string, refusalReason: string, refusalMessage?: string): Promise<Booking> {
    try {
      const response = await api.patch<ApiResponse<Booking>>(`/bookings/${id}/reject`, {
        refusalReason,
        refusalMessage
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to reject booking');
    }
  }

  // Accept booking
  async acceptBooking(id: string): Promise<Booking> {
    try {
      const response = await api.patch<ApiResponse<Booking>>(`/bookings/${id}/accept`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to accept booking');
    }
  }

  // Validate booking code
  async validateBookingCode(id: string, validationCode: string): Promise<Booking> {
    try {
      const response = await api.patch<ApiResponse<Booking>>(`/bookings/${id}/validate-code`, {
        validationCode
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to validate booking code');
    }
  }

  // Complete booking (return tool)
  async returnTool(id: string): Promise<Booking> {
    try {
      const response = await api.patch<ApiResponse<Booking>>(`/bookings/${id}/complete`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to complete booking');
    }
  }

  // Check tool availability for specific dates
  async checkToolAvailability(toolId: string, startDate: string, endDate: string): Promise<BookingAvailabilityCheck> {
    try {
      const response = await api.post<ApiResponse<BookingAvailabilityCheck>>('/bookings/check-availability', {
        toolId,
        startDate,
        endDate
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to check availability');
    }
  }

  // Get tool unavailable dates
  async getToolUnavailableDates(toolId: string): Promise<string[]> {
    try {
      // Use a wide date range to get all unavailable dates for the tool
      const now = new Date();
      const futureDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
      
      // Format dates as simplified ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ)
      const startDate = now.toISOString().split('.')[0] + 'Z';
      const endDate = futureDate.toISOString().split('.')[0] + 'Z';
      
      const response = await api.post<ApiResponse<{ unavailableDates: string[] }>>('/bookings/check-availability', {
        toolId,
        startDate,
        endDate
      });
      
      return response.data.data.unavailableDates || [];
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch unavailable dates');
    }
  }

  // Calculate booking pricing
  async calculateBookingPricing(toolId: string, startDate: string, endDate: string): Promise<BookingPricing> {
    try {
      const response = await api.post<ApiResponse<BookingPricing>>('/bookings/calculate-pricing', {
        toolId,
        startDate,
        endDate
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to calculate pricing');
    }
  }

  // Process payment for booking
  async processPayment(bookingId: string, paymentMethodId: string): Promise<{ 
    success: boolean; 
    paymentIntentId?: string; 
    clientSecret?: string;
    error?: string;
  }> {
    try {
      const response = await api.post<ApiResponse<{ 
        success: boolean; 
        paymentIntentId?: string; 
        clientSecret?: string;
        error?: string;
      }>>(`/bookings/${bookingId}/with-payment`, {
        paymentMethodId
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Payment processing failed');
    }
  }

  // Confirm booking payment
  async confirmPayment(bookingId: string, paymentIntentId: string): Promise<Booking> {
    try {
      const response = await api.post<ApiResponse<Booking>>(`/bookings/${bookingId}/confirm-payment`, { paymentIntentId });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to confirm payment');
    }
  }

  // Confirm tool return
  async confirmToolReturn(id: string, notes?: string): Promise<Booking> {
    try {
      const response = await api.patch<ApiResponse<Booking>>(`/bookings/${id}/confirm-return`, {
        notes
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to confirm tool return');
    }
  }

  // Get booking statistics for dashboard
  async getBookingStats(): Promise<BookingStats> {
    try {
      const response = await api.get<ApiResponse<BookingStats>>('/bookings/stats');
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch booking statistics');
    }
  }

  // Confirm tool pickup
  async confirmPickup(bookingId: string): Promise<Booking> {
    try {
      const response = await api.patch<ApiResponse<Booking>>(`/bookings/${bookingId}/confirm-pickup`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to confirm pickup');
    }
  }

  // Report pickup issue and create dispute
  async reportPickup(bookingId: string, disputeData: { reason: string; description: string }, images?: File[]): Promise<Booking> {
    try {
      const formData = new FormData();
      formData.append('reason', disputeData.reason);
      formData.append('description', disputeData.description);
      
      if (images && images.length > 0) {
        images.forEach((image, index) => {
          formData.append(`images`, image);
        });
      }

      const response = await api.post<ApiResponse<Booking>>(`/bookings/${bookingId}/report-pickup`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to report pickup issue');
    }
  }
}

export const bookingService = new BookingService();
export default bookingService;