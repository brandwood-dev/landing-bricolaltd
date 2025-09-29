// Booking types bridge - aligned with backend entities

import { BaseEntity, ContactInfo, BaseFilters } from './common.types'
import { BookingStatus, PaymentStatus, PaymentMethod } from './enums'
import { User, UserContact } from './user.types'
import { Tool } from './tool.types'

// Base Booking interface (aligned with backend Booking entity)
export interface Booking extends BaseEntity {
  // Core booking information
  toolId: string
  renterId: string
  ownerId: string

  // Dates and timing
  startDate: string
  endDate: string
  pickupHour: string

  // Pricing
  totalDays: number
  basePrice: number
  totalPrice: number
  fees: number
  deposit: number
  totalAmount: number

  // Status
  status: BookingStatus
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus

  // Additional information
  message?: string
  validationCode?: string
  hasActiveClaim?: boolean
  cancellationReason?: string
  cancellationMessage?: string
  refusalReason?: string
  refusalMessage?: string
  renterHasReturned?: boolean
  hasUsedReturnButton?: boolean
  pickupTool?: boolean

  // Renter information
  renterInfo: {
    firstName: string
    lastName: string
    phone: string
    phone_prefix: string
  }

  // Relations
  tool?: Tool & {
    owner?: User
  }
  renter?: User
  owner?: User
}

export interface Reservation {
  id: string
  referenceId: string
  toolId: string
  toolName: string
  toolDescription: string
  toolImage: string
  toolBrand: string
  toolModel: string
  toolCondition: string
  pickupAddress: string
  ownerId: string
  owner: string
  ownerEmail: string
  ownerPhone: string
  ownerAddress: string
  renterId: string
  renterName: string
  renterEmail: string
  renterPhone: string
  renterAddress: string
  startDate: string
  endDate: string
  pickupHour: string
  status: BookingStatus
  price: number
  dailyPrice: number
  location: string
  message: string
  validationCode?: string
  hasActiveClaim?: boolean
  cancellationReason?: string
  cancellationMessage?: string
  refusalReason?: string
  refusalMessage?: string
  renterHasReturned?: boolean
  hasUsedReturnButton?: boolean
  pickupTool?: boolean
}
// Booking creation data
export interface CreateBookingData {
  toolId: string
  startDate: string
  endDate: string
  pickupHour?: string
  paymentMethod?: PaymentMethod
  message?: string
  renterId: string
  ownerId: string
  totalPrice: number
}

// Booking update data
export interface UpdateBookingData {
  startDate?: string
  endDate?: string
  pickupHour?: string
  message?: string
  status?: BookingStatus
  paymentStatus?: PaymentStatus
}

// Booking filters
export interface BookingFilters extends BaseFilters {
  status?: BookingStatus | BookingStatus[]
  paymentStatus?: PaymentStatus | PaymentStatus[]
  startDate?: string
  endDate?: string
  toolId?: string
  renterId?: string
  ownerId?: string
  minAmount?: number
  maxAmount?: number
}

// Booking summary for lists
export interface BookingSummary {
  id: string
  toolTitle: string
  toolPhoto?: string
  startDate: string
  endDate: string
  totalAmount: number
  status: BookingStatus
  paymentStatus: PaymentStatus
  renterName: string
  ownerName: string
  createdAt: string
}

// Booking statistics
export interface BookingStats {
  totalBookings: number
  pendingBookings: number
  confirmedBookings: number
  completedBookings: number
  cancelledBookings: number
  rejectedBookings: number
  totalRevenue: number
  averageBookingValue: number
  popularTools: {
    toolId: string
    toolTitle: string
    bookingCount: number
    revenue: number
  }[]
}

// Booking availability check
export interface BookingAvailabilityCheck {
  toolId: string
  startDate: string
  endDate: string
  isAvailable: boolean
  conflictingBookings?: {
    id: string
    startDate: string
    endDate: string
    status: BookingStatus
  }[]
}

// Booking pricing calculation
export interface BookingPricing {
  toolId: string
  startDate: string
  endDate: string
  totalDays: number
  basePrice: number
  subtotal: number
  serviceFee: number
  taxes: number
  deposit: number
  totalAmount: number
  currency: string
  breakdown: {
    dailyRate: number
    numberOfDays: number
    subtotal: number
    serviceFeePercentage: number
    serviceFeeAmount: number
    taxPercentage: number
    taxAmount: number
    depositAmount: number
  }
}

// Booking confirmation data
export interface BookingConfirmation {
  bookingId: string
  confirmationCode: string
  qrCode?: string
  pickupInstructions?: string
  contactInfo: {
    owner: UserContact
    renter: UserContact
  }
}

// Booking cancellation data
export interface BookingCancellation {
  bookingId: string
  reason: string
  refundAmount?: number
  cancellationFee?: number
  processedBy?: string
  processedAt: string
}

// Booking review data
export interface BookingReview {
  bookingId: string
  toolId: string
  reviewerId: string
  revieweeId: string
  rating: number
  comment: string
  photos?: string[]
  isRecommended: boolean
}

// Booking dispute data

// Request interface for UI components (extends Booking with additional UI properties)
export interface Request extends BaseEntity {
  // Core booking information
  referenceId: string
  toolId: string
  renterId: string
  ownerId: string
  toolName: string
  toolDescription: string
  toolImage: string
  toolBrand: string
  toolModel: string
  toolCondition: string
  ownerName: string
  ownerEmail: string
  ownerPhone: string
  ownerAddress: string
  renterName: string
  renterEmail: string
  renterPhone: string
  renterAddress: string
  // Dates and timing
  startDate: string
  endDate: string
  pickupHour: string
  pickupAddress: string
  location : string
  // Pricing
  totalDays: number
  basePrice: number
  totalPrice: number
  fees: number
  deposit: number
  totalAmount: number

  // Status
  status: BookingStatus
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus

  // Additional information
  message?: string
  validationCode?: string
  hasActiveClaim?: boolean
  cancellationReason?: string
  cancellationMessage?: string
  refusalReason?: string
  refusalMessage?: string
  renterHasReturned?: boolean
  hasUsedReturnButton?: boolean
  pickupTool?: boolean

  // Renter information
  renterInfo: {
    firstName: string
    lastName: string
    phone: string
    phone_prefix: string
  }

  // Relations
  tool?: Tool & {
    owner?: User
  }
  renter?: User
  owner?: User
}

// Status option for UI dropdowns and filters
export interface StatusOption {
  value: string
  label: string
}
export interface BookingDispute {
  id: string
  bookingId: string
  initiatorId: string
  respondentId: string
  type: 'DAMAGE' | 'NO_SHOW' | 'LATE_RETURN' | 'OTHER'
  description: string
  evidence?: string[]
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
  resolution?: string
  refundAmount?: number
  createdAt: string
  resolvedAt?: string
}
