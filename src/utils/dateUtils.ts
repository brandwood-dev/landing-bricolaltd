import { Language } from '@/contexts/LanguageContext'

/**
 * Formats a date string according to the specified language locale
 * @param dateString - The date string to format
 * @param language - The language to use for formatting ('fr' | 'en' | 'ar')
 * @param options - Optional formatting options
 * @returns Formatted date string
 */
export const formatDateLocalized = (
  dateString: string, 
  language: Language, 
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
): string => {
  try {
    const locale = language === 'fr' ? 'fr-FR' : language === 'en' ? 'en-US' : 'ar-SA'
    return new Date(dateString).toLocaleDateString(locale, options)
  } catch (error) {
    console.error('Error formatting date:', error)
    return dateString // Return original string if formatting fails
  }
}

/**
 * Formats a date for display in notifications (shorter format)
 * @param dateString - The date string to format
 * @param language - The language to use for formatting
 * @returns Formatted date string
 */
export const formatNotificationDate = (dateString: string, language: Language): string => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }
  return formatDateLocalized(dateString, language, options)
}

/**
 * Formats a date range for booking/reservation displays
 * @param startDate - Start date string
 * @param endDate - End date string
 * @param language - The language to use for formatting
 * @returns Formatted date range string
 */
export const formatDateRange = (
  startDate: string, 
  endDate: string, 
  language: Language
): string => {
  const formattedStart = formatDateLocalized(startDate, language)
  const formattedEnd = formatDateLocalized(endDate, language)
  
  const separator = language === 'ar' ? ' - ' : ' - '
  return `${formattedStart}${separator}${formattedEnd}`
}