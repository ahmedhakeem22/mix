
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

interface AppState {
  // UI State
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  
  // Notifications
  notifications: Notification[];
  unreadCount: number;
  
  // Loading States
  globalLoading: boolean;
  
  // Actions
  setSidebarOpen: (open: boolean) => void;
  setMobileMenuOpen: (open: boolean) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  setGlobalLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    sidebarOpen: false,
    mobileMenuOpen: false,
    notifications: [],
    unreadCount: 0,
    globalLoading: false,

    // Actions
    setSidebarOpen: (open) => set({ sidebarOpen: open }),
    
    setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
    
    addNotification: (notification) => {
      const newNotification: Notification = {
        ...notification,
        id: Date.now().toString(),
        timestamp: new Date(),
        read: false,
      };
      
      set((state) => ({
        notifications: [newNotification, ...state.notifications].slice(0, 50), // Keep last 50
        unreadCount: state.unreadCount + 1,
      }));
    },
    
    markNotificationRead: (id) => {
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    },
    
    markAllNotificationsRead: () => {
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
        unreadCount: 0,
      }));
    },
    
    setGlobalLoading: (loading) => set({ globalLoading: loading }),
  }))
);

// Subscribe to notification changes for real-time updates
useAppStore.subscribe(
  (state) => state.notifications,
  (notifications) => {
    // Here you could sync with external services like Pusher
    console.log('Notifications updated:', notifications.length);
  }
);
