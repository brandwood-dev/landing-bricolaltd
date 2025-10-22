// User types bridge - aligned with backend entities

import { BaseEntity, ContactInfo, Photo } from './common.types'
import { UserRole } from './enums'

// Base User interface (aligned with backend User entity)
export interface User extends BaseEntity {
  verifiedEmail: any
  firstName: string
  lastName: string
  email: string
  phoneNumber?: string
  phone_prefix?: string
  dateOfBirth?: string
  profilePicture?: string
  isEmailVerified: boolean
  isPhoneVerified: boolean
  role: UserRole
  isActive: boolean
  lastLoginAt?: string

  // Location fields
  address?: string
  city?: string
  state?: string
  country?: string
  postalCode?: string
  latitude?: number
  longitude?: number

  // Statistics
  rating?: number
  completedRentals?: number
  totalEarnings?: number

  // Verification
  isIdentityVerified?: boolean
  isAddressVerified?: boolean

  // Preferences
  language?: string
  currency?: string
  timezone?: string

  // Notifications
  emailNotifications?: boolean
  smsNotifications?: boolean
  pushNotifications?: boolean
}

// User profile for public display
export interface UserProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  profilePicture?: string
  phoneNumber?: string
  phone_prefix?: string
  rating?: number
  completedRentals?: number
  isIdentityVerified?: boolean
  isEmailVerified?: boolean
  memberSince: string
}

// User contact information
export interface UserContact extends ContactInfo {
  id: string
  firstName: string
  lastName: string
  profilePicture?: string
}

// User preferences
export interface UserPreferences {
  language: string
  currency: string
  timezone: string
  emailNotifications: boolean
  smsNotifications: boolean
  pushNotifications: boolean
  marketingEmails: boolean
}

// User statistics
export interface UserStats {
  activeAds: number
  averageRating: number
  completedRentals: number
  totalEarnings: number
}

// User wallet information
export interface UserWallet {
  id: string
  userId: string
  balance: number
  pendingBalance: number
  reservedBalance: number
  currency: string
  lastTransactionAt?: string
}

// User session information
export interface UserSession {
  id: string
  userId: string
  deviceInfo?: string
  ipAddress?: string
  userAgent?: string
  isActive: boolean
  lastActivityAt: string
  createdAt: string
}

// User activity log
export interface UserActivity {
  id: string
  userId: string
  action: string
  description?: string
  metadata?: Record<string, any>
  ipAddress?: string
  userAgent?: string
  createdAt: string
}
