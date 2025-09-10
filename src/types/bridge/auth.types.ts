// Authentication types aligned with backend API

export interface LoginDto {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  phoneNumber?: string
  address?: string
  city?: string
  postalCode?: string
  countryId?: string
  profilePicture?: string
  displayName?: string
  phonePrefix?: string
  latitude?: number
  longitude?: number
  bio?: string
  userType?: string
}

export interface LoginResponse {
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    isAdmin: boolean
    isActive: boolean
    verifiedEmail: boolean
  }
  token: string
  refreshToken: string
  expiresIn: number
}

export interface AuthUser {
  id: string
  email: string
  firstName: string
  lastName: string
  isAdmin: boolean
  isActive: boolean
  verifiedEmail: boolean
  phoneNumber?: string
  address?: string
  city?: string
  postalCode?: string
  countryId?: string
  profilePicture?: string
  displayName?: string
  phonePrefix?: string
  latitude?: number
  longitude?: number
  bio?: string
  userType?: string
  createdAt: Date
  updatedAt: Date
}

export interface ForgotPasswordDto {
  email: string
}

export interface ResetPasswordDto {
  token: string
  newPassword: string
}

export interface VerifyResetCodeDto {
  code: string
}

export interface ChangePasswordDto {
  currentPassword: string
  newPassword: string
}
