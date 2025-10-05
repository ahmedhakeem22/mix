import { ApiClient } from './apis';
import { ApiResponse } from '@/types';

export interface Notification {
  id: string;
  type: 'message' | 'comment' | 'favorite' | 'promotion' | 'system' | 'ad_update';
  title: string;
  message: string;
  data?: Record<string, any>;
  read_at?: string;
  created_at: string;
  user_id: number;
  action_url?: string;
  sender?: {
    id: number;
    first_name: string;
    last_name: string;
    image?: string;
  };
}

interface NotificationFilters {
  type?: string;
  read?: boolean;
  limit?: number;
  offset?: number;
}

interface NotificationSettings {
  email_notifications: boolean;
  push_notifications: boolean;
  new_message_notifications: boolean;
  comment_notifications: boolean;
  favorite_notifications: boolean;
  promotion_notifications: boolean;
  system_notifications: boolean;
}

export const notificationService = {
  /**
   * Get all notifications for the current user
   */
  getNotifications: async (filters?: NotificationFilters): Promise<ApiResponse<Notification[]>> => {
    try {
      const params = new URLSearchParams();
      
      if (filters?.type) params.append('type', filters.type);
      if (filters?.read !== undefined) params.append('read', filters.read.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.offset) params.append('offset', filters.offset.toString());

      // Backend expects 'unread' flag; map read=false => unread=true
      if (filters?.read === false) params.set('unread', 'true');
      const queryString = params.toString();
      const url = `/user/notifications${queryString ? `?${queryString}` : ''}`;
      const response = await ApiClient.get(url);
      return response;
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      return { data: [] } as ApiResponse<Notification[]>;
    }
  },

  /**
   * Get unread notification count
   */
  getUnreadCount: async (): Promise<ApiResponse<{ count: number }>> => {
    try {
      return await ApiClient.get('/user/notifications/unread-count');
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
      return { data: { count: 0 } } as ApiResponse<{ count: number }>;
    }
  },

  /**
   * Mark notifications as read
   */
  markAsRead: async (notificationIds: string[]): Promise<ApiResponse<void>> => {
    try {
      // Backend marks one-by-one: PUT /user/notifications/{id}/read
      await Promise.all(
        notificationIds.map(id => ApiClient.put(`/user/notifications/${id}/read`))
      );
      return { data: undefined } as unknown as ApiResponse<void>;
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
      throw error;
    }
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (): Promise<ApiResponse<void>> => {
    try {
      return await ApiClient.put('/user/notifications/read-all');
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      throw error;
    }
  },

  /**
   * Delete a specific notification
   */
  deleteNotification: async (notificationId: string): Promise<ApiResponse<void>> => {
    try {
      return await ApiClient.delete(`/user/notifications/${notificationId}`);
    } catch (error) {
      console.error('Failed to delete notification:', error);
      throw error;
    }
  },

  /**
   * Clear all notifications
   */
  clearAll: async (): Promise<ApiResponse<void>> => {
    try {
      // No direct endpoint; fetch then delete each
      const list = await ApiClient.get<ApiResponse<Notification[]>>('/user/notifications');
      const ids = (list.data || []).map((n: any) => n.id);
      await Promise.all(ids.map((id: string) => ApiClient.delete(`/user/notifications/${id}`)));
      return { data: undefined } as unknown as ApiResponse<void>;
    } catch (error) {
      console.error('Failed to clear all notifications:', error);
      throw error;
    }
  },

  /**
   * Get notification settings
   */
  getSettings: async (): Promise<ApiResponse<NotificationSettings>> => {
    try {
      return await ApiClient.get('/user/notification-settings');
    } catch (error) {
      console.error('Failed to fetch notification settings:', error);
      return { 
        data: {
          email_notifications: true,
          push_notifications: true,
          new_message_notifications: true,
          comment_notifications: true,
          favorite_notifications: true,
          promotion_notifications: true,
          system_notifications: true,
        }
      } as ApiResponse<NotificationSettings>;
    }
  },

  /**
   * Update notification settings
   */
  updateSettings: async (settings: Partial<NotificationSettings>): Promise<ApiResponse<NotificationSettings>> => {
    try {
      return await ApiClient.put('/user/notification-settings', settings);
    } catch (error) {
      console.error('Failed to update notification settings:', error);
      throw error;
    }
  },

  /**
   * Send test notification (for development/testing)
   */
  sendTestNotification: async (type: string = 'test'): Promise<ApiResponse<Notification>> => {
    try {
      return await ApiClient.post('/notifications/test', { type });
    } catch (error) {
      console.error('Failed to send test notification:', error);
      throw error;
    }
  },

  /**
   * Subscribe to push notifications
   */
  subscribeToPush: async (subscription: PushSubscription): Promise<ApiResponse<void>> => {
    try {
      return await ApiClient.post('/notifications/push/subscribe', {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.toJSON().keys?.p256dh,
          auth: subscription.toJSON().keys?.auth,
        }
      });
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      throw error;
    }
  },

  /**
   * Unsubscribe from push notifications
   */
  unsubscribeFromPush: async (): Promise<ApiResponse<void>> => {
    try {
      return await ApiClient.post('/notifications/push/unsubscribe');
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      throw error;
    }
  },
};

// Helper functions
export const notificationHelpers = {
  /**
   * Get notification icon based on type
   */
  getIcon: (type: string): string => {
    switch (type) {
      case 'message': return '💬';
      case 'comment': return '💭';
      case 'favorite': return '❤️';
      case 'promotion': return '🚀';
      case 'system': return '⚙️';
      case 'ad_update': return '📝';
      default: return '🔔';
    }
  },

  /**
   * Get notification color based on type
   */
  getColor: (type: string): string => {
    switch (type) {
      case 'message': return 'blue';
      case 'comment': return 'green';
      case 'favorite': return 'red';
      case 'promotion': return 'purple';
      case 'system': return 'gray';
      case 'ad_update': return 'orange';
      default: return 'gray';
    }
  },

  /**
   * Format notification time
   */
  formatTime: (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'الآن';
    if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `منذ ${diffInHours} ساعة`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `منذ ${diffInDays} أيام`;

    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  },

  /**
   * Group notifications by date
   */
  groupByDate: (notifications: Notification[]): Record<string, Notification[]> => {
    const groups: Record<string, Notification[]> = {};
    
    notifications.forEach(notification => {
      const date = new Date(notification.created_at);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let key: string;
      if (date.toDateString() === today.toDateString()) {
        key = 'اليوم';
      } else if (date.toDateString() === yesterday.toDateString()) {
        key = 'أمس';
      } else {
        key = date.toLocaleDateString('ar-SA', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }

      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(notification);
    });

    return groups;
  },

  /**
   * Filter notifications
   */
  filterNotifications: (
    notifications: Notification[], 
    filters: { type?: string; read?: boolean }
  ): Notification[] => {
    return notifications.filter(notification => {
      if (filters.type && notification.type !== filters.type) return false;
      if (filters.read !== undefined && !!notification.read_at !== filters.read) return false;
      return true;
    });
  },
};

export default notificationService;
