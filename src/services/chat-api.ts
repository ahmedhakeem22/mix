import { ApiResponse } from '@/types';
import axios from 'axios';

// Base API URL for the application
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

// Helper function to get the auth token from storage
const getAuthToken = () => {
  return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
};

// Create axios instance with default config
const ApiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add request interceptor to include auth token
ApiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
ApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('authToken');
      if (!window.location.pathname.includes('/auth/login')) {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

// Chat related interfaces
interface ChatUser {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  image?: string;
  phone?: string;
  last_seen?: string;
  is_online?: boolean;
  location_address?: string;
  member_since?: string;
}

interface ChatMessage {
  id: number;
  chat_id: number;
  message: {
    text: string;
  };
  file_url?: string;
  is_seen: boolean;
  sent_by_me: boolean;
  sender_type: 'user' | 'member';
  created_at: string;
  timestamp: string;
}

interface Chat {
  id: number;
  other_participant: ChatUser;
  last_message?: ChatMessage;
  unread_count?: number;
  created_at?: string;
  updated_at?: string;
}

interface CreateChatPayload {
  recipient_id: number;
  message?: string;
  listing_id?: number;
  file?: File;
}

interface SendMessagePayload {
  message: string;
  file?: File;
}

/**
 * Chat API service matching Laravel endpoints exactly
 */
export const chatAPI = {
  /**
   * GET /user/chats - Get all chats for the current user
   */
  getChats: async (): Promise<ApiResponse<Chat[]>> => {
    try {
      const response = await ApiClient.get('/user/chats');
      return {
        success: response.data.success,
        message: response.data.message,
        data: response.data.data
      };
    } catch (error: any) {
      console.error('Failed to fetch chats:', error);
      throw error;
    }
  },

  /**
   * POST /user/chats - Create a new chat
   */
  createChat: async (data: CreateChatPayload): Promise<ApiResponse<ChatMessage>> => {
    try {
      const formData = new FormData();
      formData.append('recipient_id', data.recipient_id.toString());
      if (data.message) formData.append('message', data.message);
      if (data.listing_id) formData.append('listing_id', data.listing_id.toString());
      if (data.file) formData.append('file', data.file);

      const response = await ApiClient.post('/user/chats', formData);
      return {
        success: response.data.success,
        message: response.data.message,
        data: response.data.data
      };
    } catch (error: any) {
      console.error('Failed to create chat:', error);
      throw error;
    }
  },

  /**
   * GET /user/chats/{chat} - Show a specific chat with messages
   */
  showChat: async (chatId: number): Promise<ApiResponse<ChatMessage[]>> => {
    try {
      const response = await ApiClient.get(`/user/chats/${chatId}`);
      return {
        success: response.data.success,
        message: response.data.message,
        data: response.data.data
      };
    } catch (error: any) {
      console.error(`Failed to fetch chat ${chatId}:`, error);
      throw error;
    }
  },

  /**
   * POST /user/chats/{chat_id}/messages - Send a message to a chat
   */
  sendMessageToChat: async (chatId: number, message: string, file?:File): Promise<ApiResponse<ChatMessage>> => {
    try {
      const formData = new FormData();
      formData.append('message', message);
      if (file) formData.append('file', file);

      const response = await ApiClient.post(`/user/chats/${chatId}/messages`, formData);
      return {
        success: response.data.success,
        message: response.data.message,
        data: response.data.data
      };
    } catch (error: any) {
      console.error(`Failed to send message to chat ${chatId}:`, error);
      console.log('Data sent:', message);
      throw error;
    }
  },

  /**
   * POST /user/chats/{chat_id}/messages/{message_id}/seen - Mark a message as seen
   */
  markMessageAsSeen: async (messageId: number, chatId: number): Promise<ApiResponse<void>> => {
    try {
      const response = await ApiClient.post(`/user/chats/${chatId}/messages/${messageId}/seen`);
      return {
        success: response.data.success,
        message: response.data.message,
        data: response.data.data
      };
    } catch (error: any) {
      console.error(`Failed to mark message ${messageId} in chat ${chatId} as seen:`, error);
      throw error;
    }
  },

  /**
   * Helper method to mark multiple messages as seen
   */
  markMultipleMessagesAsSeen: async (messageIds: number[], chatId: number): Promise<void> => {
    try {
      const promises = messageIds.map(messageId =>
        chatAPI.markMessageAsSeen(messageId, chatId)
      );
      await Promise.all(promises);
    } catch (error: any) {
      console.error(`Failed to mark multiple messages as seen in chat ${chatId}:`, error);
      throw error;
    }
  },

  /**
   * GET /user/chats (alias for getChats for compatibility)
   */
  getConversations: async (): Promise<ApiResponse<Chat[]>> => {
    return chatAPI.getChats();
  },

  /**
   * GET /user/chats/{chatId} - Get messages for a specific chat
   */
  getMessages: async (chatId: number): Promise<ApiResponse<ChatMessage[]>> => {
    try {
      return await chatAPI.showChat(chatId);
    } catch (error: any) {
      console.error(`Failed to fetch messages for chat ${chatId}:`, error);
      throw error;
    }
  },

  /**
   * POST /user/chats/messages/mark-read - Mark multiple messages as read
   */
  markMessagesAsRead: async (messageIds: number[]): Promise<ApiResponse<void>> => {
    try {
      const response = await ApiClient.post('/user/chats/messages/mark-read', {
        message_ids: messageIds
      });
      return response.data;
    } catch (error: any) {
      console.error('Failed to mark messages as read:', error);
      throw error;
    }
  },

  /**
   * POST /user/chats/typing - Update typing status
   */
  updateTypingStatus: async (userId: number, isTyping: boolean): Promise<ApiResponse<void>> => {
    try {
      const response = await ApiClient.post('/user/chats/typing', {
        user_id: userId,
        is_typing: isTyping
      });
      return response.data;
    } catch (error: any) {
      console.error('Failed to update typing status:', error);
      throw error;
    }
  },

  /**
   * GET /user/chats/users/{userId}/status - Get user status
   */
  getUserStatus: async (userId: number): Promise<ApiResponse<{ is_online: boolean; last_seen?: string }>> => {
    try {
      const response = await ApiClient.get(`/user/chats/users/${userId}/status`);
      return response.data;
    } catch (error: any) {
      console.error(`Failed to get user status for ${userId}:`, error);
      throw error;
    }
  },

  /**
   * Helper method for sending message (compatibility with chatService)
   */
  sendMessage: async (data: { receiver_id: number; message: string; listing_id?: number }): Promise<ApiResponse<ChatMessage>> => {
    try {
      // Create a chat (which will create or find existing chat and send message)
      const response = await chatAPI.createChat({
        recipient_id: data.receiver_id,
        message: data.message,
        listing_id: data.listing_id
      });

      return response;
    } catch (error: any) {
      console.error('Failed to send message:', error);
      throw error;
    }
  },
};

// Helper functions for the chat system
export const chatHelpers = {
  /**
   * Get the other participant in a chat (not the current user)
   */
  getOtherParticipant: (chat: Chat, currentUserId: number): ChatUser | undefined => {
    return chat.other_participant;
  },

  /**
   * Check if message is from current user
   */
  isOwnMessage: (message: ChatMessage, currentUserId: number): boolean => {
    return message.sent_by_me;
  },

  /**
   * Format last seen text in Arabic
   */
  formatLastSeen: (lastSeen?: string): string => {
    if (!lastSeen) return 'غير متاح';
    
    const date = new Date(lastSeen);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'الآن';
    if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `منذ ${diffInHours} ساعة`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `منذ ${diffInDays} أيام`;
    
    return date.toLocaleDateString('ar-SA');
  },

  /**
   * Truncate message for preview
   */
  truncateMessage: (message: string, maxLength: number = 50): string => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
  },

  /**
   * Sort chats by latest activity
   */
  sortChatsByActivity: (chats: Chat[]): Chat[] => {
    return chats.sort((a, b) => {
      const dateA = new Date(a.last_message?.timestamp || a.updated_at || '');
      const dateB = new Date(b.last_message?.timestamp || b.updated_at || '');
      return dateB.getTime() - dateA.getTime();
    });
  },

  /**
   * Get total unread count across all chats
   */
  getTotalUnreadCount: (chats: Chat[]): number => {
    return chats.reduce((total, chat) => total + (chat.unread_count || 0), 0);
  },

  /**
   * Format participant name
   */
  formatParticipantName: (participant: ChatUser): string => {
    return participant.full_name || `${participant.first_name} ${participant.last_name}`.trim();
  },

  /**
   * Check if user is online
   */
  isUserOnline: (user: ChatUser): boolean => {
    return user.is_online || false;
  },

  /**
   * Get user display image
   */
  getUserDisplayImage: (user: ChatUser): string => {
    return user.image || '/placeholder.svg';
  },

  /**
   * Group messages by date
   */
  groupMessagesByDate: (messages: ChatMessage[]): Record<string, ChatMessage[]> => {
    return messages.reduce((groups, message) => {
      const date = new Date(message.created_at).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
      return groups;
    }, {} as Record<string, ChatMessage[]>);
  },

  /**
   * Format message time
   */
  formatMessageTime: (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ar-SA', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  },

  /**
   * Get message text from message object
   */
  getMessageText: (message: ChatMessage): string => {
    return message.message?.text || '';
  },

  /**
   * Format date header
   */
  formatDateHeader: (timestamp: string): string => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'اليوم';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'أمس';
    } else {
      return date.toLocaleDateString('ar-SA');
    }
  },
};

// Event constants for real-time chat
export const CHAT_EVENTS = {
  NEW_MESSAGE: 'new-message',
  MESSAGE_READ: 'message-read',
  USER_TYPING: 'user-typing',
  USER_ONLINE: 'user-online',
  USER_OFFLINE: 'user-offline',
  CONVERSATION_UPDATED: 'conversation-updated',
} as const;

/**
 * Legacy: user-specific chat channel (may not be used)
 */
export const getChatChannelName = (userId: number): string => {
  return `private-chat.${userId}`;
};

/**
 * Chat room channel (recommended): private-chat.{chat_id}
 */
export const getChatRoomChannelName = (chatId: number): string => {
  return `private-chat.${chatId}`;
};

/**
 * User-specific channels for consistency with backend
 * livechat-user-channel.{memberId}.{userId} -> private-livechat-user-channel.memberId.userId
 */
export const getLivechatUserChannelName = (memberId: number, userId: number): string => {
  return `private-livechat-user-channel.${memberId}.${userId}`;
};

/**
 * livechat-member-channel.{userId}.{memberId} -> private-livechat-member-channel.userId.memberId
 */
export const getLivechatMemberChannelName = (userId: number, memberId: number): string => {
  return `private-livechat-member-channel.${userId}.${memberId}`;
};

// Export types for use in components
export type {
  Chat,
  ChatMessage,
  ChatUser,
  CreateChatPayload,
  SendMessagePayload,
};

export default chatAPI;
