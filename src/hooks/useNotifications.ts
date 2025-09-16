import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Notification } from '@/components/notifications/NotificationCenter';
import { apiClient } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
}

export const useNotifications = (): UseNotificationsReturn => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 [useNotifications] Fetching notifications for authenticated user');
      
      const response = await apiClient.get('/notifications/my');
      console.log('📡 [useNotifications] API Response:', response);
      console.log('📊 [useNotifications] Response data structure:', response.data);
      
      // L'API retourne {data: {data: Array, total: number, page: number, limit: number}}
      const apiData = response.data.data || {};
      console.log('📋 [useNotifications] API data object:', apiData);
      
      // Extraire le tableau de notifications
      const notificationsArray = apiData.data || [];
      console.log('📝 [useNotifications] Notifications array:', notificationsArray);
      console.log('📊 [useNotifications] Total notifications available:', apiData.total);
      
      // Ensure notificationsArray is an array
      const finalNotifications = Array.isArray(notificationsArray) ? notificationsArray : [];
      console.log('✅ [useNotifications] Setting notifications:', finalNotifications);
      console.log('🔄 [useNotifications] About to update notifications state from:', notifications.length, 'to:', finalNotifications.length);
      setNotifications(finalNotifications);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erreur lors du chargement des notifications';
      setError(errorMessage);
      console.error('❌ [useNotifications] Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await apiClient.patch(`/notifications/${id}/read`);
      
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id 
            ? { ...notification, isRead: true }
            : notification
        )
      );
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erreur lors de la mise à jour';
      toast.error(errorMessage);
      console.error('Error marking notification as read:', err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await apiClient.patch('/notifications/mark-all-read');
      
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      );
      
      toast.success('Toutes les notifications ont été marquées comme lues');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erreur lors de la mise à jour';
      toast.error(errorMessage);
      console.error('Error marking all notifications as read:', err);
    }
  }, []);

  const deleteNotification = useCallback(async (id: string) => {
    try {
      await apiClient.delete(`/notifications/${id}`);
      
      setNotifications(prev => prev.filter(notification => notification.id !== id));
      toast.success('Notification supprimée');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erreur lors de la suppression';
      toast.error(errorMessage);
      console.error('Error deleting notification:', err);
    }
  }, []);

  const clearAllNotifications = useCallback(async () => {
    try {
      await apiClient.delete('/notifications/user');
      
      setNotifications([]);
      toast.success('Toutes les notifications ont été supprimées');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erreur lors de la suppression';
      toast.error(errorMessage);
      console.error('Error clearing all notifications:', err);
    }
  }, []);

  // Auto-fetch notifications on mount and clear when logged out
  useEffect(() => {
    console.log('🚀 [useNotifications] Effect triggered, isAuthenticated:', isAuthenticated);
    if (isAuthenticated) {
      fetchNotifications();
    } else {
      // Clear notifications when user logs out
      setNotifications([]);
      setError(null);
    }
  }, [fetchNotifications, isAuthenticated]);

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchNotifications, isAuthenticated]);

  const unreadCount = (notifications || []).filter(n => !n.isRead).length;

  // Log when notifications state changes
  useEffect(() => {
    console.log('🔄 [useNotifications] Notifications state updated:', {
      count: notifications.length,
      notifications: notifications,
      loading: loading
    });
  }, [notifications, loading]);

  console.log('📤 [useNotifications] Returning state:', {
    notificationsCount: notifications.length,
    notifications,
    loading,
    unreadCount: notifications.filter(n => !n.isRead).length
  });

  return {
    notifications,
    loading,
    error,
    unreadCount: notifications.filter(n => !n.isRead).length,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    refetch: fetchNotifications
  };
};

export default useNotifications;