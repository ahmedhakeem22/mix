import { ApiClient } from './apis';
import { ApiResponse } from '@/types';
import echo, { CHANNELS, EVENTS, getPrivateChannel, getPresenceChannel } from '@/config/echo';

interface ChatUser {
  id: number;
  first_name: string;
  last_name: string;
  image?: string;
  phone?: string;
  last_seen?: string;
  is_online?: boolean;
  location_address?: string;
  member_since?: string;
}

interface ChatMessage {
  id: number;
  sender_id: number;
  receiver_id: number;
  message: string;
  created_at: string;
  read_at?: string;
  sender: ChatUser;
  receiver: ChatUser;
}

interface Conversation {
  id: string;
  user: ChatUser;
  last_message?: ChatMessage;
  unread_count: number;
  updated_at: string;
}

interface SendMessagePayload {
  receiver_id: number;
  message: string;
  listing_id?: number;
}

interface MarkAsReadPayload {
  message_ids: number[];
}

// Enhanced chat service using Laravel Echo
export const chatService = {
  /**
   * Get all conversations for the current user
   */
  getConversations: async (): Promise<ApiResponse<Conversation[]>> => {
    try {
      const response = await ApiClient.get('/user/chats');
      return response;
    } catch (error) {
      console.warn('⚠️ Failed to fetch conversations:', error);
      // Fallback to existing messages API
      return chatAPI.getConversations();
    }
  },

  /**
   * Get messages for a specific conversation
   */
  getMessages: async (userId: number): Promise<ApiResponse<ChatMessage[]>> => {
    try {
      const response = await ApiClient.get(`/chat/conversations/${userId}/messages`);
      return response;
    } catch (error) {
      console.warn('⚠️ Failed to fetch messages for user:', userId, error);
      // Fallback to existing messages API
      return chatAPI.getMessages(userId);
    }
  },

  /**
   * Send a new message
   */
  sendMessage: async (data: SendMessagePayload): Promise<ApiResponse<ChatMessage>> => {
    try {
      const response = await ApiClient.post('/chat/messages', data);
      return response;
    } catch (error) {
      console.warn('⚠️ Failed to send message:', error);
      // Fallback to existing API
      return chatAPI.sendMessage(data);
    }
  },

  /**
   * Mark multiple messages as read
   */
  markMessagesAsRead: async (messageIds: number[]): Promise<ApiResponse<void>> => {
    try {
      const response = await ApiClient.post('/chat/messages/mark-read', {
        message_ids: messageIds
      });
      return response;
    } catch (error) {
      console.warn('⚠️ Failed to mark messages as read:', error);
      // Fallback to existing API
      return chatAPI.markMessagesAsRead(messageIds);
    }
  },

  /**
   * Update typing status
   */
  updateTypingStatus: async (userId: number, isTyping: boolean): Promise<ApiResponse<void>> => {
    try {
      const response = await ApiClient.post('/chat/typing', {
        user_id: userId,
        is_typing: isTyping
      });
      return response;
    } catch (error) {
      console.warn('⚠️ Failed to update typing status:', error);
      // Fallback to existing API
      return chatAPI.updateTypingStatus(userId, isTyping);
    }
  },

  /**
   * Get user online status
   */
  getUserStatus: async (userId: number): Promise<ApiResponse<{ is_online: boolean; last_seen?: string }>> => {
    try {
      const response = await ApiClient.get(`/chat/users/${userId}/status`);
      return response;
    } catch (error) {
      console.warn('⚠️ Failed to get user status:', error);
      return chatAPI.getUserStatus(userId);
    }
  },

  /**
   * Search for users to start new conversations
   */
  searchUsers: (query: string): Promise<ApiResponse<ChatUser[]>> =>
    ApiClient.get(`/chat/users/search?q=${encodeURIComponent(query)}`),

  /**
   * Start new conversation with user
   */
  startConversation: (userId: number, initialMessage?: string): Promise<ApiResponse<Conversation>> =>
    ApiClient.post('/chat/conversations', { 
      user_id: userId, 
      ...(initialMessage && { message: initialMessage })
    }),

  /**
   * Archive/Unarchive conversation
   */
  archiveConversation: (userId: number, archived: boolean = true): Promise<ApiResponse<void>> =>
    ApiClient.post('/chat/conversations/archive', { user_id: userId, archived }),

  /**
   * Delete conversation
   */
  deleteConversation: (userId: number): Promise<ApiResponse<void>> =>
    ApiClient.delete(`/chat/conversations/${userId}`),

  /**
   * Block/Unblock user
   */
  blockUser: (userId: number, blocked: boolean = true): Promise<ApiResponse<void>> =>
    ApiClient.post('/chat/users/block', { user_id: userId, blocked }),

  /**
   * Report user
   */
  reportUser: (userId: number, reason: string): Promise<ApiResponse<void>> =>
    ApiClient.post('/chat/users/report', { user_id: userId, reason }),
};

// Real-time chat manager using Laravel Echo
export class ChatManager {
  private userId: number | null = null;
  private isInitialized = false;
  private listeners: Map<string, Function[]> = new Map();

  /**
   * Initialize chat manager for a user
   */
  initialize(userId: number) {
    if (this.isInitialized && this.userId === userId) {
      return;
    }

    this.cleanup();
    this.userId = userId;
    this.isInitialized = true;

    console.log('🚀 Initializing ChatManager for user:', userId);

    // Subscribe to private chat channel
    const chatChannel = getPrivateChannel(CHANNELS.CHAT(userId));

    // Listen for new messages
    chatChannel.listen(EVENTS.NEW_MESSAGE, (event: any) => {
      console.log('📨 New message received:', event);
      this.emit('newMessage', event.message);
    });

    // Listen for message read events
    chatChannel.listen(EVENTS.MESSAGE_READ, (event: any) => {
      console.log('👁️ Messages marked as read:', event);
      this.emit('messageRead', event);
    });

    // Listen for typing events
    chatChannel.listen(EVENTS.USER_TYPING, (event: any) => {
      console.log('⌨️ User typing:', event);
      this.emit('userTyping', event);
    });

    // Subscribe to presence channel for online status
    const presenceChannel = getPresenceChannel(CHANNELS.PRESENCE_CHAT);

    presenceChannel.here((users: ChatUser[]) => {
      console.log('👥 Users currently online:', users);
      this.emit('onlineUsers', users);
    });

    presenceChannel.joining((user: ChatUser) => {
      console.log('🟢 User joined:', user);
      this.emit('userOnline', user);
    });

    presenceChannel.leaving((user: ChatUser) => {
      console.log('🔴 User left:', user);
      this.emit('userOffline', user);
    });

    console.log('✅ ChatManager initialized successfully');
  }

  /**
   * Add event listener
   */
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  /**
   * Remove event listener
   */
  off(event: string, callback: Function) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Emit event to listeners
   */
  private emit(event: string, data: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  /**
   * Send typing status
   */
  sendTypingStatus(receiverId: number, isTyping: boolean) {
    if (!this.isInitialized || !this.userId) {
      console.warn('ChatManager not initialized');
      return;
    }

    chatService.updateTypingStatus(receiverId, isTyping).catch(error => {
      console.error('Failed to send typing status:', error);
    });
  }

  /**
   * Cleanup chat manager
   */
  cleanup() {
    if (!this.isInitialized || !this.userId) {
      return;
    }

    console.log('🧹 Cleaning up ChatManager for user:', this.userId);

    // Leave channels
    echo.leave(CHANNELS.CHAT(this.userId));
    echo.leave(CHANNELS.PRESENCE_CHAT);

    // Clear listeners
    this.listeners.clear();

    this.userId = null;
    this.isInitialized = false;

    console.log('✅ ChatManager cleanup completed');
  }

  /**
   * Get current user ID
   */
  getUserId() {
    return this.userId;
  }

  /**
   * Check if manager is initialized
   */
  getIsInitialized() {
    return this.isInitialized;
  }
}

// Singleton instance
export const chatManager = new ChatManager();

// Helper functions
export const chatHelpers = {
  /**
   * Format conversation ID for consistency
   */
  getConversationId: (userId1: number, userId2: number): string => {
    const sortedIds = [userId1, userId2].sort((a, b) => a - b);
    return `conv_${sortedIds[0]}_${sortedIds[1]}`;
  },

  /**
   * Check if message is from current user
   */
  isOwnMessage: (message: ChatMessage, currentUserId: number): boolean => {
    return message.sender_id === currentUserId;
  },

  /**
   * Get other user from conversation
   */
  getOtherUser: (conversation: Conversation, currentUserId: number): ChatUser => {
    return conversation.user;
  },

  /**
   * Format last seen text
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
   * Sort conversations by latest activity
   */
  sortConversationsByActivity: (conversations: Conversation[]): Conversation[] => {
    return conversations.sort((a, b) => {
      const dateA = new Date(a.last_message?.created_at || a.updated_at);
      const dateB = new Date(b.last_message?.created_at || b.updated_at);
      return dateB.getTime() - dateA.getTime();
    });
  },

  /**
   * Get total unread count
   */
  getTotalUnreadCount: (conversations: Conversation[]): number => {
    return conversations.reduce((total, conv) => total + conv.unread_count, 0);
  },
};

// Backward compatibility - re-export from existing chat-api
import { chatAPI } from './chat-api';
export { chatAPI };

// Event constants for backward compatibility
export const CHAT_EVENTS = {
  NEW_MESSAGE: EVENTS.NEW_MESSAGE,
  MESSAGE_READ: EVENTS.MESSAGE_READ,
  USER_TYPING: EVENTS.USER_TYPING,
  USER_ONLINE: EVENTS.USER_ONLINE,
  USER_OFFLINE: EVENTS.USER_OFFLINE,
  CONVERSATION_UPDATED: 'conversation-updated',
} as const;

export default chatService;
