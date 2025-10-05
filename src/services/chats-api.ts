
import { ApiClient } from './apis';
import { ApiResponse, PaginatedResponse } from '@/types';

// Chat types based on your API responses
export interface Chat {
  id: number;
  other_participant: {
    id: number;
    first_name: string;
    last_name: string;
    full_name: string;
    username: string;
    email?: string;
    phone: string;
    image?: string;
    verified_status: number;
  } | null;
  last_message: {
    id: number;
    message: {
      text: string;
    };
    file_url?: string;
    created_at: string;
    sent_by_me: boolean;
  } | null;
  unread_messages_count: number;
  updated_at: string;
}

export interface ChatMessage {
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

export interface SendMessagePayload {
  recipient_id: number;
  message?: string;
  file?: File;
  listing_id?: number;
}

export interface SendChatMessagePayload {
  message?: string;
  file?: File;
}

export interface CreateChatResponse {
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

// Chat API functions matching your endpoints
export const chatsAPI = {
  // Get all chats for current user
  getChats: (page: number = 1): Promise<ApiResponse<PaginatedResponse<Chat>>> => 
    ApiClient.get(`/user/chats?page=${page}`),

  // Get messages for a specific chat
  getChatMessages: (chatId: number, page: number = 1): Promise<ApiResponse<PaginatedResponse<ChatMessage>>> => 
    ApiClient.get(`/user/chats/${chatId}?page=${page}`),

  // Create a new chat/send first message
  createChat: (data: SendMessagePayload): Promise<ApiResponse<CreateChatResponse>> => {
    const formData = new FormData();
    formData.append('recipient_id', data.recipient_id.toString());
    if (data.message) formData.append('message', data.message);
    if (data.file) formData.append('file', data.file);
    if (data.listing_id) formData.append('listing_id', data.listing_id.toString());
    
    return ApiClient.post('/user/chats', formData);
  },

  // Send message in existing chat
  sendMessage: (chatId: number, data: SendChatMessagePayload): Promise<ApiResponse<ChatMessage>> => {
    const formData = new FormData();
    if (data.message) formData.append('message', data.message);
    if (data.file) formData.append('file', data.file);
    
    return ApiClient.post(`/user/chats/${chatId}/messages`, formData);
  },

  // Mark message as seen
  markMessageAsSeen: (chatId: number, messageId: number): Promise<ApiResponse<void>> =>
    ApiClient.post(`/user/chats/${chatId}/messages/${messageId}/seen`),
};
