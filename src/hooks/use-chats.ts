
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatsAPI, Chat, ChatMessage, SendMessagePayload, SendChatMessagePayload } from '@/services/chats-api';
import { useToast } from '@/hooks/use-toast';

// Get all chats
export const useChats = (page: number = 1) => {
  return useQuery({
    queryKey: ['chats', page],
    queryFn: () => chatsAPI.getChats(page),
    select: (data) => data.data,
  });
};

// Get chat messages
export const useChatMessages = (chatId: number, page: number = 1) => {
  return useQuery({
    queryKey: ['chat-messages', chatId, page],
    queryFn: () => chatsAPI.getChatMessages(chatId, page),
    select: (data) => data.data,
    enabled: !!chatId,
  });
};

// Create new chat
export const useCreateChat = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: SendMessagePayload) => chatsAPI.createChat(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      toast({
        title: "تم إرسال الرسالة بنجاح",
        description: "تم إنشاء المحادثة وإرسال الرسالة",
      });
      return response.data;
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في إرسال الرسالة",
        description: error.message || "حدث خطأ أثناء إرسال الرسالة",
        variant: "destructive",
      });
    },
  });
};

// Send message in existing chat
export const useSendMessage = (chatId: number) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: SendChatMessagePayload) => chatsAPI.sendMessage(chatId, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages', chatId] });
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      return response.data;
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في إرسال الرسالة",
        description: error.message || "حدث خطأ أثناء إرسال الرسالة",
        variant: "destructive",
      });
    },
  });
};

// Mark message as seen
export const useMarkMessageAsSeen = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ chatId, messageId }: { chatId: number; messageId: number }) =>
      chatsAPI.markMessageAsSeen(chatId, messageId),
    onSuccess: (_, { chatId }) => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages', chatId] });
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
  });
};
