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

// Compatibility interface for chat pages
interface Conversation {
  id: string;
  user: ChatUser;
  last_message?: ChatMessage;
  unread_count: number;
  updated_at: string;
}

interface UseChatEchoOptions {
  autoMarkAsRead?: boolean;
  enableTypingIndicator?: boolean;
  enablePresence?: boolean;
  refetchInterval?: number;
}

export function useChatEcho(options: UseChatEchoOptions = {}) {
  const {
    autoMarkAsRead = true,
    enableTypingIndicator = true,
    enablePresence = true,
    refetchInterval = 30000
  } = options;

  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<number>>(new Set());
  const [typingUsers, setTypingUsers] = useState<Set<number>>(new Set());
  const typingTimeoutRef = useRef<Map<number, NodeJS.Timeout>>(new Map());

  // Fetch chats
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
    retry: 2,
    onError: (error) => {
      console.warn('⚠️ Failed to fetch chats:', error);
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
        
        // Find and update existing chat or add new one
        const updatedChats = [...old.data];
        const existingChatIndex = updatedChats.findIndex((chat: Chat) => 
          chat.other_participant.id === response.data.chat_id
        );
        
        if (existingChatIndex >= 0) {
          updatedChats[existingChatIndex] = {
            ...updatedChats[existingChatIndex],
            last_message: response.data,
            updated_at: response.data.timestamp
          };
        }
        
        return { ...old, data: chatHelpers.sortChatsByActivity(updatedChats) };
      });

      // Invalidate queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['chat-conversations'] });
      queryClient.invalidateQueries({ queryKey: ['chat-messages'] });
    },
    onError: (error: any) => {
      toast({
        title: 'فشل في إرسال الرسالة',
        description: error.message || 'حدث خطأ ما، حاول مرة أخرى',
        variant: 'destructive',
      });
    },
  });

  // Mark messages as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: ({ messageId, chatId }: { messageId: number; chatId: number }) => chatAPI.markMessageAsSeen(messageId, chatId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-conversations'] });
      queryClient.invalidateQueries({ queryKey: ['chat-messages'] });
    },
  });

  // Initialize Pusher connection (if available)
  useEffect(() => {
    if (!user || !enablePresence) return;

    try {
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

        // Show notification if not in active conversation
        const isActiveConversation = window.location.pathname.includes('/chat');

        if (!isActiveConversation) {
          toast({
            title: `رسالة جديدة من ${data.sender?.first_name || 'مستخدم'}`,
            description: chatHelpers.truncateMessage(data.message?.text || data.message || '', 50),
          });
        }
      };
      pusherService.bind(CHAT_EVENTS.NEW_MESSAGE, handleNewMessage);
      pusherService.bind('NewMessage', handleNewMessage);

      const handleUserOnline = (data: { user_id: number }) => {
        console.log('🟢 User came online:', data.user_id);
        setOnlineUsers(prev => new Set([...prev, data.user_id]));
      };
      pusherService.bind(CHAT_EVENTS.USER_ONLINE, handleUserOnline);
      pusherService.bind('UserOnline', handleUserOnline);

      const handleUserOffline = (data: { user_id: number }) => {
        console.log('🔴 User went offline:', data.user_id);
        setOnlineUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(data.user_id);
          return newSet;
        });
      };
      pusherService.bind(CHAT_EVENTS.USER_OFFLINE, handleUserOffline);
      pusherService.bind('UserOffline', handleUserOffline);

      if (enableTypingIndicator) {
        const handleUserTyping = (data: { user_id: number; is_typing: boolean }) => {
          console.log('⌨️ User typing status:', data);

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
      }

      return () => {
        // Cleanup
        pusherService.unbind(CHAT_EVENTS.NEW_MESSAGE);
        pusherService.unbind('NewMessage');
        pusherService.unbind(CHAT_EVENTS.USER_ONLINE);
        pusherService.unbind('UserOnline');
        pusherService.unbind(CHAT_EVENTS.USER_OFFLINE);
        pusherService.unbind('UserOffline');
        if (enableTypingIndicator) {
          pusherService.unbind(CHAT_EVENTS.USER_TYPING);
          pusherService.unbind('UserTyping');
        }
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
    } catch (error) {
      console.warn('⚠️ Pusher not available, using polling only:', error);
      setIsConnected(false);
    }
  }, [user?.id, autoMarkAsRead, enableTypingIndicator, enablePresence]);

  // Subscribe to chat room channels when conversations change
  useEffect(() => {
    if (!user) return;

    const chatIds = (chatsData?.data || []).map((c: any) => c.id);
    const channelNames = chatIds.map((id: number) => getChatRoomChannelName(id));

    pusherService.subscribeMany(channelNames);

    return () => {
      // No-op: parent cleanup will unsubscribeAll
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

  const markMessagesAsRead = useCallback(async (messageIds: number[], chatId: number) => {
    if (messageIds.length === 0) return;

    const promises = messageIds.map(messageId => markAsReadMutation.mutateAsync({ messageId, chatId }));
    return Promise.all(promises);
  }, [markAsReadMutation]);

  const isUserOnline = useCallback((userId: number) => {
    return onlineUsers.has(userId);
  }, [onlineUsers]);

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
    onlineUsers,
    typingUsers,
    
    // Actions
    sendMessage,
    markMessagesAsRead,
    
    // Utilities
    isUserOnline,
    isUserTyping,
    getTotalUnreadCount,
    
    // Loading states
    isSendingMessage: sendMessageMutation.isPending,
    isMarkingAsRead: markAsReadMutation.isPending,
  };
}

// Hook for individual chat messages
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
