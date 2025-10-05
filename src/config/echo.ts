import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { TokenManager } from '@/services/apis';

declare global {
  interface Window {
    Pusher: typeof Pusher;
    Echo: Echo;
  }
}

// Make Pusher available globally
window.Pusher = Pusher;

const echo = new Echo({
  broadcaster: 'pusher',
  key: import.meta.env.VITE_PUSHER_KEY || '9f828d0b9f92d02a4ca9',
  cluster: import.meta.env.VITE_PUSHER_CLUSTER || 'ap2',
  forceTLS: true,
  auth: {
    headers: {
      'Authorization': `Bearer ${TokenManager.getToken() || ''}`,
      'Accept': 'application/json',
    },
  },
  authEndpoint: `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/broadcasting/auth`,
});

// Make Echo available globally
window.Echo = echo;

export default echo;

// Echo event types for type safety
export interface EchoEvent<T = any> {
  data: T;
}

// Channel helpers
export const getPrivateChannel = (channelName: string) => {
  return echo.private(channelName);
};

export const getPresenceChannel = (channelName: string) => {
  return echo.join(channelName);
};

export const getPublicChannel = (channelName: string) => {
  return echo.channel(channelName);
};

// Common channel names
export const CHANNELS = {
  CHAT: (chatId: number) => `chat.${chatId}`,
  NOTIFICATIONS: (userId: number) => `notifications.${userId}`,
  PRESENCE_CHAT: 'chat-users',
  PRESENCE_ONLINE: 'online-users',
} as const;

// Event types
export const EVENTS = {
  // Chat events (match backend events)
  NEW_MESSAGE: 'new-message',
  MESSAGE_READ: 'message-read',
  USER_TYPING: 'user-typing',
  USER_ONLINE: 'user-online',
  USER_OFFLINE: 'user-offline',

  // Notification events
  NEW_NOTIFICATION: 'NewNotification',
  NOTIFICATION_READ: 'NotificationRead',
  NOTIFICATION_DELETED: 'NotificationDeleted',

  // Ad events
  AD_COMMENTED: 'AdCommented',
  AD_FAVORITED: 'AdFavorited',
  AD_PROMOTED: 'AdPromoted',

  // General events
  SYSTEM_ANNOUNCEMENT: 'SystemAnnouncement',
} as const;

// Helper function to disconnect Echo
export const disconnectEcho = () => {
  echo.disconnect();
};

// Helper function to reconnect Echo
export const reconnectEcho = () => {
  echo.connect();
};
