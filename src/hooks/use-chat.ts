import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatAPI, chatHelpers, CHAT_EVENTS, getChatRoomChannelName } from '@/services/chat-api';
import { pusherService } from '@/services/pusher-service';
import { useAuth } from '@/context/auth-context';
import { toast } from '@/hooks/use-toast';

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

interface Conversation {
  id: string;
  user: ChatUser;
  last_message?: ChatMessage;
  unread_count: number;
  updated_at: string;
}

interface UseChatOptions {
  autoMarkAsRead?: boolean;
  enableTypingIndicator?: boolean;
  refetchInterval?: number;
}

export function useChat(options: UseChatOptions = {}) {
  const {
    autoMarkAsRead = true,
    enableTypingIndicator = true,
    refetchInterval = 30000
  } = options;

  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<number>>(new Set());
  const typingTimeoutRef = useRef<Map<number, NodeJS.Timeout>>(new Map());

  // Fetch conversations
  const {
    data: chatsData,
    isLoading: isLoadingConversations,
    error: conversationsError
  } = useQuery({
    queryKey: ['chat-conversations'],
    queryFn: () => chatAPI.getChats(),
    enabled: !!user,
    refetchInterval,
    staleTime: 10000,
    retry: 2, // Retry twice on failure
    onError: (error) => {
      console.warn('⚠️ Failed to fetch conversations:', error);
    },
  });

  // Transform chats to conversations format for compatibility
  const conversations: Conversation[] = (chatsData?.data || []).map((chat: Chat) => ({
    id: chat.id.toString(),
    user: chat.other_participant,
    last_message: chat.last_message,
    unread_count: chat.unread_count || 0,
    updated_at: chat.last_message?.timestamp || chat.updated_at || new Date().toISOString()
  }));

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: chatAPI.sendMessage,
    onSuccess: (response) => {
      // Optimistically update conversations
      queryClient.setQueryData(['chat-conversations'], (old: any) => {
        if (!old?.data) return old;

        const updatedChats = old.data.map((chat: Chat) => {
          if (chat.other_participant.id === response.data.chat_id) {
            return {
              ...chat,
              last_message: response.data,
              updated_at: response.data.timestamp
            };
          }
          return chat;
        });

        return { ...old, data: chatHelpers.sortChatsByActivity(updatedChats) };
      });

      // Update specific conversation messages
      queryClient.setQueryData(['chat-messages', response.data.chat_id], (old: any) => {
        if (!old?.data) return old;
        return { ...old, data: [...old.data, response.data] };
      });

      // Invalidate queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['chat-conversations'] });
    },
    onError: (error: any) => {
      toast({
        title: 'فشل في إرسال الرسالة',
        description: error.message || 'حدث خطأ ما، حاول مرة أخرى',
        variant: 'destructive',
      });
    },
  });

  // Send message to existing chat mutation
  const sendMessageToChatMutation = useMutation({
    mutationFn: chatAPI.sendMessageToChat,
    onSuccess: (response, variables) => {
      const [chatId] = variables;

      // Update specific conversation messages
      queryClient.setQueryData(['chat-messages', chatId], (old: any) => {
        if (!old?.data) return old;
        return { ...old, data: [...old.data, response.data] };
      });

      // Update conversations list
      queryClient.setQueryData(['chat-conversations'], (old: any) => {
        if (!old?.data) return old;

        const updatedChats = old.data.map((chat: Chat) => {
          if (chat.id === chatId) {
            return {
              ...chat,
              last_message: response.data,
              updated_at: response.data.timestamp || new Date().toISOString()
            };
          }
          return chat;
        });

        return { ...old, data: chatHelpers.sortChatsByActivity(updatedChats) };
      });

      // Invalidate queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['chat-conversations'] });
    },
    onError: (error: any) => {
      toast({
        title: 'فشل في إرسال الرسالة',
        description: error.message || 'حدث خطأ ما، حاول مرة أخرى',
        variant: 'destructive',
      });
      console.error('Failed to send message to chat:', error);
    },
  });

  // Mark messages as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: ({ messageId, chatId }: { messageId: number; chatId: number }) => chatAPI.markMessageAsSeen(messageId, chatId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-conversations'] });
    },
  });

  // Typing status mutation
  const updateTypingMutation = useMutation({
    mutationFn: ({ userId, isTyping }: { userId: number; isTyping: boolean }) =>
      chatAPI.updateTypingStatus(userId, isTyping),
  });

  // Stable reference to mark as read function to avoid circular dependencies
  const markAsReadRef = useRef<(messageId: number, chatId: number) => void>();
  markAsReadRef.current = (messageId: number, chatId: number) => {
    markAsReadMutation.mutate({ messageId, chatId });
  };

  // Initialize Pusher connection
  useEffect(() => {
    if (!user) return;

    const pusher = pusherService.initialize();

    // Connection event handlers
    const onConnected = () => {
      setIsConnected(true);
      console.log('✅ Chat connected');
    };
    const onDisconnected = () => {
      setIsConnected(false);
      console.warn('❌ Chat disconnected');
    };
    const onError = (err: any) => {
      console.error('❌ Pusher error:', err);
      setIsConnected(false);
    };

    pusher.connection.bind('connected', onConnected);
    pusher.connection.bind('disconnected', onDisconnected);
    pusher.connection.bind('error', onError);
    pusher.connection.bind('state_change', (states: any) => {
      console.log('🔄 Pusher state:', states);
    });

    // Message event handlers
    const handleNewMessage = (data: any) => {
      console.log('📨 New message received:', data);

      // Update conversations list
      queryClient.setQueryData(['chat-conversations'], (old: any) => {
        if (!old?.data) return old;

        const updatedChats = old.data.map((chat: Chat) => {
          if (chat.other_participant.id === data.sender_id) {
            return {
              ...chat,
              last_message: data,
              unread_count: (chat.unread_count || 0) + 1,
              updated_at: data.timestamp
            };
          }
          return chat;
        });

        return { ...old, data: chatHelpers.sortChatsByActivity(updatedChats) };
      });

      // Update specific conversation messages
      queryClient.setQueryData(['chat-messages', data.chat_id], (old: any) => {
        if (!old?.data) return old;
        const exists = old.data.some((msg: ChatMessage) => msg.id === data.id);
        if (exists) return old;
        return { ...old, data: [...old.data, data] };
      });

      // Auto mark as read if conversation is active and autoMarkAsRead is enabled
      if (autoMarkAsRead) {
        const activeConversationChatId = window.location.pathname.includes('/chat')
          ? parseInt(window.location.hash.replace('#chat-', ''))
          : null;

        if (activeConversationChatId === data.chat_id) {
          markAsReadRef.current?.(data.id, data.chat_id);
        }
      }

      // Show notification if not in active conversation
      const isActiveConversation = window.location.pathname.includes('/chat') &&
        window.location.hash.includes(`chat-${data.chat_id}`);

      if (!isActiveConversation) {
        toast({
          title: `رسالة جديدة من ${data.sender?.first_name || 'مستخدم'}`,
          description: chatHelpers.truncateMessage(data.message?.text || data.message || '', 50),
        });
      }
    };
    pusherService.bind(CHAT_EVENTS.NEW_MESSAGE, handleNewMessage);
    pusherService.bind('NewMessage', handleNewMessage);

    const handleMessageRead = (data: { message_ids: number[]; user_id: number; chat_id?: number }) => {
      console.log('👁️ Messages marked as read:', data);

      // Use chat_id if available, otherwise fall back to user_id
      const cacheKey = data.chat_id || data.user_id;

      // Update specific conversation messages
      queryClient.setQueryData(['chat-messages', cacheKey], (old: any) => {
        if (!old?.data) return old;

        const updatedMessages = old.data.map((msg: ChatMessage) =>
          data.message_ids.includes(msg.id)
            ? { ...msg, read_at: new Date().toISOString(), is_seen: true }
            : msg
        );

        return { ...old, data: updatedMessages };
      });

      // Update conversations unread count
      queryClient.setQueryData(['chat-conversations'], (old: any) => {
        if (!old?.data) return old;

        const updatedConversations = old.data.map((conv: Conversation) => {
          if (conv.user.id === data.user_id) {
            return { ...conv, unread_count: 0 };
          }
          return conv;
        });

        return { ...old, data: updatedConversations };
      });
    };
    pusherService.bind(CHAT_EVENTS.MESSAGE_READ, handleMessageRead);
    pusherService.bind('MessageRead', handleMessageRead);

    const handleUserTyping = (data: { user_id: number; is_typing: boolean }) => {
      console.log('⌨️ User typing status:', data);

      if (!enableTypingIndicator) return;

      setTypingUsers(prev => {
        const newSet = new Set(prev);

        if (data.is_typing) {
          newSet.add(data.user_id);

          // Clear existing timeout
          const existingTimeout = typingTimeoutRef.current.get(data.user_id);
          if (existingTimeout) {
            clearTimeout(existingTimeout);
          }

          // Set new timeout
          const timeout = setTimeout(() => {
            setTypingUsers(current => {
              const updated = new Set(current);
              updated.delete(data.user_id);
              return updated;
            });
            typingTimeoutRef.current.delete(data.user_id);
          }, 3000);

          typingTimeoutRef.current.set(data.user_id, timeout);
        } else {
          newSet.delete(data.user_id);

          // Clear timeout
          const existingTimeout = typingTimeoutRef.current.get(data.user_id);
          if (existingTimeout) {
            clearTimeout(existingTimeout);
            typingTimeoutRef.current.delete(data.user_id);
          }
        }

        return newSet;
      });
    };
    pusherService.bind(CHAT_EVENTS.USER_TYPING, handleUserTyping);
    pusherService.bind('UserTyping', handleUserTyping);

    const handleUserOnline = (data: { user_id: number }) => {
      console.log('🟢 User came online:', data.user_id);

      // Update user status in conversations
      queryClient.setQueryData(['chat-conversations'], (old: any) => {
        if (!old?.data) return old;

        const updatedConversations = old.data.map((conv: Conversation) => {
          if (conv.user.id === data.user_id) {
            return { ...conv, user: { ...conv.user, is_online: true } };
          }
          return conv;
        });

        return { ...old, data: updatedConversations };
      });
    };
    pusherService.bind(CHAT_EVENTS.USER_ONLINE, handleUserOnline);
    pusherService.bind('UserOnline', handleUserOnline);

    const handleUserOffline = (data: { user_id: number; last_seen: string }) => {
      console.log('🔴 User went offline:', data.user_id);

      // Update user status in conversations
      queryClient.setQueryData(['chat-conversations'], (old: any) => {
        if (!old?.data) return old;

        const updatedConversations = old.data.map((conv: Conversation) => {
          if (conv.user.id === data.user_id) {
            return {
              ...conv,
              user: {
                ...conv.user,
                is_online: false,
                last_seen: data.last_seen
              }
            };
          }
          return conv;
        });

        return { ...old, data: updatedConversations };
      });
    };
    pusherService.bind(CHAT_EVENTS.USER_OFFLINE, handleUserOffline);
    pusherService.bind('UserOffline', handleUserOffline);

    return () => {
      // Cleanup
      pusherService.unbind(CHAT_EVENTS.NEW_MESSAGE);
      pusherService.unbind('NewMessage');
      pusherService.unbind(CHAT_EVENTS.MESSAGE_READ);
      pusherService.unbind('MessageRead');
      pusherService.unbind(CHAT_EVENTS.USER_TYPING);
      pusherService.unbind('UserTyping');
      pusherService.unbind(CHAT_EVENTS.USER_ONLINE);
      pusherService.unbind('UserOnline');
      pusherService.unbind(CHAT_EVENTS.USER_OFFLINE);
      pusherService.unbind('UserOffline');
      // Unbind connection listeners
      pusher.connection.unbind('connected', onConnected);
      pusher.connection.unbind('disconnected', onDisconnected);
      pusher.connection.unbind('error', onError);
      pusher.connection.unbind('state_change');
      // Unsubscribe from all chat channels
      pusherService.unsubscribeAll();

      // Clear typing timeouts
      typingTimeoutRef.current.forEach(timeout => clearTimeout(timeout));
      typingTimeoutRef.current.clear();

      setIsConnected(false);
    };
  }, [user?.id, autoMarkAsRead, enableTypingIndicator]);

  // Subscribe to chat room channels when conversations change
  useEffect(() => {
    if (!user) return;

    const chatIds = (chatsData?.data || []).map((c: any) => c.id);
    const channelNames = chatIds.map((id: number) => getChatRoomChannelName(id));

    pusherService.subscribeMany(channelNames);

    return () => {
      // On unmount or chats change, resubscribe handled by parent cleanup
      // We do not unsubscribe here to avoid flicker; parent cleanup handles full teardown
    };
  }, [user?.id, chatsData?.data]);

  // Chat actions
  const sendMessage = useCallback(async (receiverId: number, message: string, listingId?: number) => {
    if (!message.trim()) return;

    return sendMessageMutation.mutateAsync({
      receiver_id: receiverId,
      message: message.trim(),
      ...(listingId && { listing_id: listingId })
    });
  }, [sendMessageMutation]);

  const sendMessageToChat = useCallback(async (chatId: number, message: string, file?: File) => {
    if (!message.trim()) return;

    return sendMessageToChatMutation.mutateAsync([chatId, {
      message: message.trim(),
      ...(file && { file })
    }]);
  }, [sendMessageToChatMutation]);

  const markMessagesAsRead = useCallback(async (messageIds: number[], chatId: number) => {
    if (messageIds.length === 0) return;
    const promises = messageIds.map(messageId => markAsReadMutation.mutateAsync({ messageId, chatId }));
    return Promise.all(promises);
  }, [markAsReadMutation]);

  const updateTypingStatus = useCallback(async (userId: number, isTyping: boolean) => {
    if (!enableTypingIndicator) return;
    return updateTypingMutation.mutateAsync({ userId, isTyping });
  }, [updateTypingMutation, enableTypingIndicator]);

  const isUserTyping = useCallback((userId: number) => {
    return typingUsers.has(userId);
  }, [typingUsers]);

  const getTotalUnreadCount = useCallback(() => {
    return chatHelpers.getTotalUnreadCount(chatsData?.data || []);
  }, [chatsData?.data]);

  return {
    // Data
    conversations,
    isLoadingConversations,
    conversationsError,
    
    // Connection state
    isConnected,
    
    // Typing indicators
    typingUsers,
    isUserTyping,
    
    // Actions
    sendMessage,
    sendMessageToChat,
    markMessagesAsRead,
    updateTypingStatus,

    // Utilities
    getTotalUnreadCount,

    // Loading states
    isSendingMessage: sendMessageMutation.isPending || sendMessageToChatMutation.isPending,
    isMarkingAsRead: markAsReadMutation.isPending,
  };
}

// Hook for individual conversation messages
export function useChatMessages(chatId: number | null) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: messagesData,
    isLoading,
    error
  } = useQuery({
    queryKey: ['chat-messages', chatId],
    queryFn: () => chatAPI.getMessages(chatId!),
    enabled: !!user && !!chatId,
    staleTime: 5000,
    retry: 2,
    onError: (error) => {
      console.warn('⚠️ Failed to fetch messages for chat:', chatId, error);
    },
  });

  const messages = messagesData?.data || [];

  const refetchMessages = useCallback(() => {
    if (chatId) {
      queryClient.invalidateQueries({ queryKey: ['chat-messages', chatId] });
    }
  }, [chatId, queryClient]);

  return {
    messages,
    isLoading,
    error,
    refetchMessages,
  };
}
