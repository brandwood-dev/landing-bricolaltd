export interface NotificationNavigationData {
  link?: string | null
  relatedId?: string | null
  relatedType?: string | null
  bookingId?: string | null
  toolId?: string | null
  type?: string | null
}

const TOOL_RELATED_TYPES = new Set([
  'tool',
  'tools',
  'listing',
  'listings',
  'tool_submitted',
  'tool_approved',
  'tool_rejected',
  'tool_archived',
  'tool_unavailable',
  'tool_maintenance',
  'tool_returned',
  'tool_damaged',
])

const BOOKING_RELATED_TYPES = new Set([
  'booking',
  'bookings',
  'reservation',
  'reservations',
  'request',
  'requests',
  'booking_created',
  'booking_confirmed',
  'booking_rejected',
  'booking_cancelled',
  'booking_completed',
  'booking_reminder',
  'booking_overdue',
  'booking_extended',
])

const normalize = (value?: string | null) => value?.trim().toLowerCase() || ''

export const resolveNotificationTarget = (
  notification: NotificationNavigationData
): string | null => {
  if (notification.link) {
    return notification.link
  }

  const normalizedRelatedType = normalize(notification.relatedType)
  const normalizedType = normalize(notification.type)

  if (notification.toolId) {
    return `/tool/${notification.toolId}`
  }

  if (notification.bookingId) {
    return `/bookings/${notification.bookingId}`
  }

  if (notification.relatedId) {
    if (
      TOOL_RELATED_TYPES.has(normalizedRelatedType) ||
      TOOL_RELATED_TYPES.has(normalizedType)
    ) {
      return `/tool/${notification.relatedId}`
    }

    if (
      BOOKING_RELATED_TYPES.has(normalizedRelatedType) ||
      BOOKING_RELATED_TYPES.has(normalizedType)
    ) {
      return `/bookings/${notification.relatedId}`
    }
  }

  return null
}

