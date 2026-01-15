import React, { useState, useEffect } from 'react'
import {
  Bell,
  Trash2,
  Check,
  CheckCheck,
  Filter,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useNotifications } from '@/hooks/useNotifications'
import { useLanguage } from '@/contexts/LanguageContext'
import { formatDistanceToNow } from 'date-fns'
import { fr, enUS, ar } from 'date-fns/locale'
import { toast } from 'sonner'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

type FilterType = 'all' | 'unread' | 'read'

interface Notification {
  id: string
  title: string
  message: string
  type: string
  isRead: boolean
  createdAt: string
}

const NotificationsPage: React.FC = () => {
  const { t } = useLanguage()
  const {
    notifications,
    loading,
    error,
    refetch: fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
  } = useNotifications()

  const [filter, setFilter] = useState<FilterType>('all')
  const [showConfirmDialog, setShowConfirmDialog] = useState<{
    type: 'delete' | 'clear' | 'markAll' | null
    notificationId?: string
  }>({ type: null })
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const filteredNotifications = notifications.filter(
    (notification: Notification) => {
      if (filter === 'unread') return !notification.isRead
      if (filter === 'read') return notification.isRead
      return true
    }
  )
  const totalItems = filteredNotifications.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const displayedNotifications = filteredNotifications.slice(
    startIndex,
    endIndex
  )

  useEffect(() => {
    setCurrentPage(1)
  }, [filter])

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages)
  }, [totalPages, currentPage])

  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    )

    if (diffInMinutes < 1) return t('notifications.time_now')
    if (diffInMinutes < 60)
      return `${diffInMinutes} ${t('notifications.time_minutes_ago')}`
    if (diffInMinutes < 1440)
      return `${Math.floor(diffInMinutes / 60)} ${t(
        'notifications.time_hours_ago'
      )}`
    if (diffInMinutes < 10080)
      return `${Math.floor(diffInMinutes / 1440)} ${t(
        'notifications.time_days_ago'
      )}`
    if (diffInMinutes < 43200)
      return `${Math.floor(diffInMinutes / 10080)} ${t(
        'notifications.time_weeks_ago'
      )}`
    return `${Math.floor(diffInMinutes / 43200)} ${t(
      'notifications.time_months_ago'
    )}`
  }

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead(notificationId)
      toast.success(t('notifications.marked_read_success'))
    } catch (error) {
      toast.error(t('notifications.error'))
    }
  }

  const handleDelete = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId)
      toast.success(t('notifications.deleted_success'))
      setShowConfirmDialog({ type: null })
    } catch (error) {
      toast.error(t('notifications.error'))
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead()
      toast.success(t('notifications.all_marked_read_success'))
      setShowConfirmDialog({ type: null })
    } catch (error) {
      toast.error(t('notifications.error'))
    }
  }

  const handleClearAll = async () => {
    try {
      await clearAllNotifications()
      toast.success(t('notifications.all_cleared_success'))
      setShowConfirmDialog({ type: null })
    } catch (error) {
      toast.error(t('notifications.error'))
    }
  }

  const getEmptyMessage = () => {
    if (filter === 'unread') return t('notifications.no_unread')
    if (filter === 'read') return t('notifications.no_read')
    return t('notifications.no_notifications')
  }

  const ConfirmDialog = () => {
    if (!showConfirmDialog.type) return null

    const getDialogContent = () => {
      switch (showConfirmDialog.type) {
        case 'delete':
          return {
            title: t('notifications.confirm_delete'),
            action: () => handleDelete(showConfirmDialog.notificationId!),
          }
        case 'clear':
          return {
            title: t('notifications.confirm_clear_all'),
            action: handleClearAll,
          }
        case 'markAll':
          return {
            title: t('notifications.confirm_mark_all_read'),
            action: handleMarkAllAsRead,
          }
        default:
          return { title: '', action: () => {} }
      }
    }

    const { title, action } = getDialogContent()

    return (
      <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
        <div className='bg-white rounded-lg p-6 max-w-md w-full mx-4'>
          <p className='text-gray-800 mb-6'>{title}</p>
          <div className='flex justify-end space-x-3'>
            <button
              onClick={() => setShowConfirmDialog({ type: null })}
              className='px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50'
            >
              {t('general.cancel')}
            </button>
            <button
              onClick={action}
              className='px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700'
            >
              {t('general.confirm')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
          <p className='text-gray-600'>{t('notifications.loading')}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <X className='h-12 w-12 text-red-500 mx-auto mb-4' />
          <p className='text-red-600'>{t('notifications.error')}</p>
          <button
            onClick={fetchNotifications}
            className='mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
          >
            {t('booking.retry')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-background'>
      <Header />
      <main className='py-20'>
        <div className='max-w-4xl mx-auto px-4'>
          {/* Header */}
          <div className='mb-8'>
            <h1 className='text-3xl font-bold text-gray-900 mb-2'>
              {t('notifications.title')}
            </h1>
            <p className='text-gray-600'>{t('notifications.subtitle')}</p>
          </div>

          <div className='bg-white rounded-lg shadow-sm p-6 mb-6'>
            <div className='flex items-center justify-between mb-6'>
              <div className='flex items-center space-x-3'>
                <Bell className='h-8 w-8 text-blue-600' />
                <h2 className='text-xl font-semibold text-gray-900'>
                  {t('notifications.manage')}
                </h2>
                {notifications.some((n: Notification) => !n.isRead) && (
                  <Badge variant='destructive' className='text-xs'>
                    {
                      notifications.filter((n: Notification) => !n.isRead)
                        .length
                    }
                  </Badge>
                )}
              </div>
              <div className='flex items-center space-x-3'>
                {notifications.some((n: Notification) => !n.isRead) && (
                  <button
                    onClick={() => setShowConfirmDialog({ type: 'markAll' })}
                    className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2'
                  >
                    <Check className='h-4 w-4' />
                    <span className='hidden sm:inline'>
                      {t('notifications.mark_all_read')}
                    </span>
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={() => setShowConfirmDialog({ type: 'clear' })}
                    className='px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2'
                  >
                    <Trash2 className='h-4 w-4' />
                    <span className='hidden sm:inline'>
                      {t('notifications.clear_all')}
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Filters */}
            <div className='flex items-center space-x-4'>
              <Filter className='h-5 w-5 text-gray-500' />
              <div className='flex space-x-2'>
                {(['all', 'unread', 'read'] as FilterType[]).map(
                  (filterType) => (
                    <button
                      key={filterType}
                      onClick={() => setFilter(filterType)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        filter === filterType
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {t(`notifications.filter_${filterType}`)}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>

          

          {/* Notifications List */}
          <div className='space-y-4'>
            {filteredNotifications.length === 0 ? (
              <div className='bg-white rounded-lg shadow-sm p-12 text-center'>
                <Bell className='h-16 w-16 text-gray-300 mx-auto mb-4' />
                <p className='text-gray-500 text-lg'>{getEmptyMessage()}</p>
              </div>
            ) : (
              displayedNotifications.map((notification: Notification) => (
                <div
                  key={notification.id}
                  className={`bg-white rounded-lg shadow-sm p-6 border-l-4 ${
                    notification.isRead ? 'border-gray-300' : 'border-blue-600'
                  }`}
                >
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      <div className='flex items-center space-x-2 mb-2'>
                        <h3
                          className={`font-semibold ${
                            notification.isRead
                              ? 'text-gray-700'
                              : 'text-gray-900'
                          }`}
                        >
                          {notification.title === 'Réservation terminée'
                            ? t('notifications.booking_completed')
                            : notification.title === 'Réservation créée'
                            ? t('notifications.booking_created')
                            : notification.title === 'Outil retourné'
                            ? t('notifications.tool_returned')
                            : notification.title === 'Réservation commencée'
                            ? t('notifications.booking_started')
                            : notification.title === 'Réservation acceptée'
                            ? t('notifications.booking_accepted')
                            : notification.title}
                        </h3>
                        {!notification.isRead && (
                          <span className='inline-block w-2 h-2 bg-blue-600 rounded-full'></span>
                        )}
                      </div>
                      <p
                        className={`mb-3 ${
                          notification.isRead
                            ? 'text-gray-500'
                            : 'text-gray-700'
                        }`}
                      >
                        {notification.message}
                      </p>
                      <p className='text-sm text-gray-400'>
                        {formatTimeAgo(notification.createdAt)}
                      </p>
                    </div>

                    <div className='flex items-center space-x-2 ml-4'>
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          notification.isRead
                            ? 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                            : 'text-blue-600 hover:bg-blue-50'
                        }`}
                        title={
                          notification.isRead
                            ? t('notifications.mark_as_unread')
                            : t('notifications.mark_as_read')
                        }
                      >
                        <Check className='h-4 w-4' />
                      </button>
                      <button
                        onClick={() =>
                          setShowConfirmDialog({
                            type: 'delete',
                            notificationId: notification.id,
                          })
                        }
                        className='p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors'
                        title={t('notifications.delete')}
                      >
                        <Trash2 className='h-4 w-4' />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className='max-w-4xl mx-auto px-4 mt-6'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-2'>
                <Select
                  value={String(pageSize)}
                  onValueChange={(value) => {
                    setPageSize(parseInt(value))
                    setCurrentPage(1)
                  }}
                >
                  <SelectTrigger className='w-[100px]'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='5'>5</SelectItem>
                    <SelectItem value='10'>10</SelectItem>
                    <SelectItem value='20'>20</SelectItem>
                    <SelectItem value='50'>50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='flex items-center space-x-3'>
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className='px-3 py-2 bg-white text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 flex items-center'
                >
                  <ChevronLeft className='h-4 w-4' />
                </button>
                <span className='text-sm text-gray-600'>
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className='px-3 py-2 bg-white text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 flex items-center'
                >
                  <ChevronRight className='h-4 w-4' />
                </button>
              </div>
            </div>
          </div>

          <ConfirmDialog />
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default NotificationsPage
