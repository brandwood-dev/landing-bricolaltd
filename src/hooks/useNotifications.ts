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
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.get('/notifications/my');
      const notificationsData = response.data.data || [];
      
      // Ensure notificationsData is an array
      setNotifications(Array.isArray(notificationsData) ? notificationsData : []);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erreur lors du chargement des notifications';
      setError(errorMessage);
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

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

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
  };
};

export default useNotifications;