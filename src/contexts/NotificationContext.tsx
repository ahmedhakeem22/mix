import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/auth-context';
import echo, { CHANNELS, EVENTS, getPrivateChannel } from '@/config/echo';
import { notificationService } from '@/services/notificationService';
import { toast } from '@/hooks/use-toast';

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

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  isConnected: boolean;
  lastFetch?: Date;
}

type NotificationAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_CONNECTED'; payload: boolean }
  | { type: 'SET_NOTIFICATIONS'; payload: Notification[] }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_AS_READ'; payload: string[] }
  | { type: 'DELETE_NOTIFICATION'; payload: string }
  | { type: 'UPDATE_LAST_FETCH' };

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  isConnected: false,
};

const notificationReducer = (state: NotificationState, action: NotificationAction): NotificationState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_CONNECTED':
      return { ...state, isConnected: action.payload };
    
    case 'SET_NOTIFICATIONS':
      return {
        ...state,
        notifications: action.payload,
        unreadCount: action.payload.filter(n => !n.read_at).length,
      };
    
    case 'ADD_NOTIFICATION':
      const newNotifications = [action.payload, ...state.notifications];
      return {
        ...state,
        notifications: newNotifications,
        unreadCount: newNotifications.filter(n => !n.read_at).length,
      };
    
    case 'MARK_AS_READ':
      const updatedNotifications = state.notifications.map(notification =>
        action.payload.includes(notification.id)
          ? { ...notification, read_at: new Date().toISOString() }
          : notification
      );
      return {
        ...state,
        notifications: updatedNotifications,
        unreadCount: updatedNotifications.filter(n => !n.read_at).length,
      };
    
    case 'DELETE_NOTIFICATION':
      const filteredNotifications = state.notifications.filter(n => n.id !== action.payload);
      return {
        ...state,
        notifications: filteredNotifications,
        unreadCount: filteredNotifications.filter(n => !n.read_at).length,
      };
    
    case 'UPDATE_LAST_FETCH':
      return { ...state, lastFetch: new Date() };
    
    default:
      return state;
  }
};

interface NotificationContextType {
  state: NotificationState;
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationIds: string[]) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);
  const { user, isAuthenticated } = useAuth();

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated || !user) return;

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await notificationService.getNotifications();
      if (response.data) {
        dispatch({ type: 'SET_NOTIFICATIONS', payload: response.data });
        dispatch({ type: 'UPDATE_LAST_FETCH' });
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [isAuthenticated, user]);

  // Mark notifications as read
  const markAsRead = useCallback(async (notificationIds: string[]) => {
    try {
      await notificationService.markAsRead(notificationIds);
      dispatch({ type: 'MARK_AS_READ', payload: notificationIds });
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في تحديث حالة الإشعارات',
        variant: 'destructive',
      });
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    const unreadIds = state.notifications
      .filter(n => !n.read_at)
      .map(n => n.id);
    
    if (unreadIds.length === 0) return;
    
    await markAsRead(unreadIds);
  }, [state.notifications, markAsRead]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);
      dispatch({ type: 'DELETE_NOTIFICATION', payload: notificationId });
      toast({
        title: 'تم الحذف',
        description: 'تم حذف الإشعار بنجاح',
      });
    } catch (error) {
      console.error('Failed to delete notification:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في حذف الإشعار',
        variant: 'destructive',
      });
    }
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(async () => {
    try {
      await notificationService.clearAll();
      dispatch({ type: 'SET_NOTIFICATIONS', payload: [] });
      toast({
        title: 'تم الحذف',
        description: 'تم حذف جميع الإشعارات بنجاح',
      });
    } catch (error) {
      console.error('Failed to clear notifications:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في حذف الإشعارات',
        variant: 'destructive',
      });
    }
  }, []);

  // Setup real-time notifications with Laravel Echo
  useEffect(() => {
    if (!isAuthenticated || !user) {
      dispatch({ type: 'SET_CONNECTED', payload: false });
      return;
    }

    console.log('🔄 Setting up real-time notifications for user:', user.id);

    try {
      // Subscribe to private notification channel
      const channel = getPrivateChannel(CHANNELS.NOTIFICATIONS(user.id));

      // Connection events
      echo.connector.pusher.connection.bind('connected', () => {
        dispatch({ type: 'SET_CONNECTED', payload: true });
        console.log('✅ Notifications channel connected');
        
        // Fetch latest notifications on connect
        fetchNotifications();
      });

      echo.connector.pusher.connection.bind('disconnected', () => {
        dispatch({ type: 'SET_CONNECTED', payload: false });
        console.log('❌ Notifications channel disconnected');
      });

      // Listen for new notifications
      channel.listen(EVENTS.NEW_NOTIFICATION, (event: { notification: Notification }) => {
        console.log('🔔 New notification received:', event.notification);
        
        dispatch({ type: 'ADD_NOTIFICATION', payload: event.notification });
        
        // Show browser notification if permission granted
        if (Notification.permission === 'granted') {
          new Notification(event.notification.title, {
            body: event.notification.message,
            icon: '/icons/icon-192x192.png',
            tag: event.notification.id,
          });
        }
        
        // Show toast notification
        toast({
          title: event.notification.title,
          description: event.notification.message,
          duration: 5000,
        });
      });

      // Listen for notification read events
      channel.listen(EVENTS.NOTIFICATION_READ, (event: { notification_ids: string[] }) => {
        console.log('👁️ Notifications marked as read:', event.notification_ids);
        dispatch({ type: 'MARK_AS_READ', payload: event.notification_ids });
      });

      // Listen for notification delete events
      channel.listen(EVENTS.NOTIFICATION_DELETED, (event: { notification_id: string }) => {
        console.log('🗑️ Notification deleted:', event.notification_id);
        dispatch({ type: 'DELETE_NOTIFICATION', payload: event.notification_id });
      });

      // Initial fetch
      fetchNotifications();

      // Cleanup function
      return () => {
        echo.leave(CHANNELS.NOTIFICATIONS(user.id));
        console.log('🧹 Cleaned up notification listeners');
      };

    } catch (error) {
      console.error('❌ Failed to setup notification listeners:', error);
      dispatch({ type: 'SET_CONNECTED', payload: false });
    }
  }, [isAuthenticated, user, fetchNotifications]);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('Notification permission:', permission);
      });
    }
  }, []);

  // Periodic refresh (every 5 minutes when tab is active)
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      if (!document.hidden) {
        fetchNotifications();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [isAuthenticated, fetchNotifications]);

  const contextValue: NotificationContextType = {
    state,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};
