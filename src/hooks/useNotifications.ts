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
      const response = await apiClient.get('/notifications/my');
      
      // L'API retourne {data: {data: Array, total: number, page: number, limit: number}}
      const apiData = response.data.data || {};
      
      // Extraire le tableau de notifications
      const notificationsArray = apiData.data || [];
      
      // Ensure notificationsArray is an array
      const finalNotifications = Array.isArray(notificationsArray) ? notificationsArray : [];
      setNotifications(finalNotifications);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erreur lors du chargement des notifications';
      setError(errorMessage);

    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await apiClient.patch(`/notifications/${id}/mark-read`);
      
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

    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await apiClient.patch('/notifications/my/mark-all-read');
      
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      );
      
      toast.success('Toutes les notifications ont été marquées comme lues');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erreur lors de la mise à jour';
      toast.error(errorMessage);

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