import { api } from './api';
import { ApiResponse } from '../types/bridge/common.types';

export interface CreateNotificationData {
  userId: string;
  type: string;
  title: string;
  message: string;
  relatedId?: string;
  relatedType?: string;
  link?: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  bookingId?: string;
  disputeId?: string;
  toolId?: string;
  createdAt: string;
  updatedAt: string;
}

export class NotificationService {
  // Create a new notification
  async createNotification(notificationData: CreateNotificationData): Promise<Notification> {
    try {
      const response = await api.post<ApiResponse<Notification>>('/notifications/system', notificationData);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create notification');
    }
  }

  // Get user notifications
  async getUserNotifications(userId: string): Promise<Notification[]> {
    try {
      const response = await api.get<ApiResponse<Notification[]>>(`/notifications/user/${userId}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch notifications');
    }
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<Notification> {
    try {
      const response = await api.patch<ApiResponse<Notification>>(`/notifications/${notificationId}/mark-read`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to mark notification as read');
    }
  }

  // Mark all notifications as read for a user
  async markAllAsRead(userId: string): Promise<void> {
    try {
      await api.patch(`/notifications/user/${userId}/read-all`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to mark all notifications as read');
    }
  }

  // Delete notification
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      await api.delete(`/notifications/${notificationId}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete notification');
    }
  }
}

export const notificationService = new NotificationService();
export default notificationService;