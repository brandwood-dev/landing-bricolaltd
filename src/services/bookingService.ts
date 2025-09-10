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
      const response = await api.post<ApiResponse<Booking>>('/bookings', bookingData);
      return response.data.data;
    } catch (error: any) {
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
  async getUserBookings(filters?: BookingFilters): Promise<PaginatedResponse<Booking>> {
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
      
      const response = await api.get<ApiResponse<PaginatedResponse<Booking>>>(`/bookings/user/renter?${params.toString()}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user bookings');
    }
  }

  // Get owner's bookings (tools being rented)
  async getOwnerBookings(filters?: BookingFilters): Promise<PaginatedResponse<Booking>> {
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
      
      const response = await api.get<ApiResponse<PaginatedResponse<Booking>>>(`/bookings/user/owner?${params.toString()}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch owner bookings');
    }
  }

  // Update booking status
  async updateBookingStatus(id: string, status: Booking['status']): Promise<Booking> {
    try {
      const response = await api.patch<ApiResponse<Booking>>(`/bookings/${id}/status`, { status });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update booking status');
    }
  }

  // Cancel booking
  async cancelBooking(id: string, reason?: string): Promise<Booking> {
    try {
      const response = await api.patch<ApiResponse<Booking>>(`/bookings/${id}/cancel`, { reason });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to cancel booking');
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
  async processPayment(bookingId: string, paymentData: any): Promise<{ success: boolean; paymentIntentId?: string }> {
    try {
      const response = await api.post<ApiResponse<{ success: boolean; paymentIntentId?: string }>>(`/bookings/${bookingId}/payment`, paymentData);
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

  // Get booking statistics for dashboard
  async getBookingStats(): Promise<BookingStats> {
    try {
      const response = await api.get<ApiResponse<BookingStats>>('/bookings/stats');
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch booking statistics');
    }
  }
}

export const bookingService = new BookingService();
export default bookingService;