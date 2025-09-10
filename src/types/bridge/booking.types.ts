// Booking types bridge - aligned with backend entities

import { BaseEntity, ContactInfo, BaseFilters } from './common.types';
import { BookingStatus, PaymentStatus, PaymentMethod } from './enums';
import { UserProfile, UserContact } from './user.types';
import { ToolSummary } from './tool.types';

// Base Booking interface (aligned with backend Booking entity)
export interface Booking extends BaseEntity {
  // Core booking information
  toolId: string;
  renterId: string;
  ownerId: string;
  
  // Dates and timing
  startDate: string;
  endDate: string;
  pickupTime: string;
  
  // Pricing
  totalDays: number;
  basePrice: number;
  totalPrice: number;
  fees: number;
  deposit: number;
  totalAmount: number;
  
  // Status
  status: BookingStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  
  // Additional information
  message?: string;
  
  // Renter information
  renterInfo: {
    firstName: string;
    lastName: string;
    phone: string;
    phonePrefix: string;
  };
  
  // Relations
  tool?: ToolSummary & {
    owner?: UserProfile;
  };
  renter?: UserProfile;
  owner?: UserProfile;
}

// Booking creation data
export interface CreateBookingData {
  toolId: string;
  startDate: string;
  endDate: string;
  pickupTime: string;
  paymentMethod: PaymentMethod;
  message?: string;
  renterInfo: {
    firstName: string;
    lastName: string;
    phone: string;
    phonePrefix: string;
  };
}

// Booking update data
export interface UpdateBookingData {
  startDate?: string;
  endDate?: string;
  pickupTime?: string;
  message?: string;
  status?: BookingStatus;
  paymentStatus?: PaymentStatus;
}

// Booking filters
export interface BookingFilters extends BaseFilters {
  status?: BookingStatus | BookingStatus[];
  paymentStatus?: PaymentStatus | PaymentStatus[];
  startDate?: string;
  endDate?: string;
  toolId?: string;
  renterId?: string;
  ownerId?: string;
  minAmount?: number;
  maxAmount?: number;
}

// Booking summary for lists
export interface BookingSummary {
  id: string;
  toolTitle: string;
  toolPhoto?: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  renterName: string;
  ownerName: string;
  createdAt: string;
}

// Booking statistics
export interface BookingStats {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  rejectedBookings: number;
  totalRevenue: number;
  averageBookingValue: number;
  popularTools: {
    toolId: string;
    toolTitle: string;
    bookingCount: number;
    revenue: number;
  }[];
}

// Booking availability check
export interface BookingAvailabilityCheck {
  toolId: string;
  startDate: string;
  endDate: string;
  isAvailable: boolean;
  conflictingBookings?: {
    id: string;
    startDate: string;
    endDate: string;
    status: BookingStatus;
  }[];
}

// Booking pricing calculation
export interface BookingPricing {
  toolId: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  basePrice: number;
  subtotal: number;
  serviceFee: number;
  taxes: number;
  deposit: number;
  totalAmount: number;
  currency: string;
  breakdown: {
    dailyRate: number;
    numberOfDays: number;
    subtotal: number;
    serviceFeePercentage: number;
    serviceFeeAmount: number;
    taxPercentage: number;
    taxAmount: number;
    depositAmount: number;
  };
}

// Booking confirmation data
export interface BookingConfirmation {
  bookingId: string;
  confirmationCode: string;
  qrCode?: string;
  pickupInstructions?: string;
  contactInfo: {
    owner: UserContact;
    renter: UserContact;
  };
}

// Booking cancellation data
export interface BookingCancellation {
  bookingId: string;
  reason: string;
  refundAmount?: number;
  cancellationFee?: number;
  processedBy?: string;
  processedAt: string;
}

// Booking review data
export interface BookingReview {
  bookingId: string;
  toolId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment: string;
  photos?: string[];
  isRecommended: boolean;
}

// Booking dispute data
export interface BookingDispute {
  id: string;
  bookingId: string;
  initiatorId: string;
  respondentId: string;
  type: 'DAMAGE' | 'NO_SHOW' | 'LATE_RETURN' | 'OTHER';
  description: string;
  evidence?: string[];
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  resolution?: string;
  refundAmount?: number;
  createdAt: string;
  resolvedAt?: string;
}