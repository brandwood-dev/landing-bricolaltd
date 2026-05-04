import { LucideIcon } from 'lucide-react'
import { Booking } from '@/types/bridge'

export type BookingHistoryEntry = {
  action: string
  timestamp: string
  user: string
  notes?: string
}

export type BookingDetailsRecord = Booking & {
  acceptedAt?: string
  cancelledAt?: string
  refundAmount?: number
  refundReason?: string
}

export type ClaimMode = 'renter' | 'owner'
export type ReviewMode = 'tool' | 'app'

export type ParticipantDetails = {
  id: string
  fullName: string
  email: string
  phone: string
  address: string
  profilePicture?: string
}

export type ActionItem = {
  key: string
  label: string
  onClick: () => void
  icon?: LucideIcon
  variant?: 'default' | 'outline' | 'ghost'
  className?: string
}
