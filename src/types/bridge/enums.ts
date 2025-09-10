// Enums bridge - aligned with backend enums

// Booking Status Enum (from api/src/bookings/enums/booking-status.enum.ts)
export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  REJECTED = 'REJECTED',
  APPROVED = 'APPROVED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

// Payment Status Enum
export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

// Payment Method Enum
export enum PaymentMethod {
  CARD = 'card',
  PAYPAL = 'paypal',
  STRIPE = 'STRIPE',
  BANK_TRANSFER = 'BANK_TRANSFER',
}

// Tool Status Enum
export enum ToolStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  SUSPENDED = 'SUSPENDED',
  DELETED = 'DELETED',
}

// Availability Status Enum
export enum AvailabilityStatus {
  AVAILABLE = 'AVAILABLE',
  UNAVAILABLE = 'UNAVAILABLE',
  MAINTENANCE = 'MAINTENANCE',
}

// Tool Condition Enum
export enum ToolCondition {
  NEW = 'NEW',
  EXCELLENT = 'EXCELLENT',
  GOOD = 'GOOD',
  FAIR = 'FAIR',
  POOR = 'POOR',
}

// User Role Enum
export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
}

// Transaction Type Enum
export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
  PAYMENT = 'PAYMENT',
  REFUND = 'REFUND',
  FEE = 'FEE',
  TRANSFER = 'TRANSFER',
  DISPUTE = 'DISPUTE',
  RENTAL_INCOME = 'RENTAL_INCOME',
}

// Transaction Status Enum
export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  CONFIRMED = 'CONFIRMED',
  REFUNDED = 'REFUNDED',
  PAID = 'PAID',
}

// Dispute Status Enum
export enum DisputeStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}