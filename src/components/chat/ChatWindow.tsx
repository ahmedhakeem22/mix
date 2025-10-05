import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Phone,
  Video,
  MoreVertical,
  Send,
  Paperclip,
  Smile,
  User,
  Check,
  CheckCheck,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChat, useChatMessages } from '@/hooks/use-chat';
import { format, isToday, isYesterday } from 'date-fns';
import { ar } from 'date-fns/locale';

interface ChatUser {
  id: number;
  first_name: string;
  last_name: string;
  image?: string;
  phone?: string;
  last_seen?: string;
  is_online?: boolean;
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

interface ChatWindowProps {
  conversation: Conversation;
  currentUser: ChatUser;
  onBack?: () => void;
  onToggleContactSidebar: () => void;
  showContactSidebar: boolean;
  // Optional overrides to avoid internal hook subscription duplication
  sendMessageToChatOverride?: (chatId: number, message: string, file?: File) => Promise<any>;
  markMessagesAsReadOverride?: (messageIds: number[], chatId: number) => Promise<any>;
  isUserTypingOverride?: (userId: number) => boolean;
  isSendingMessageOverride?: boolean;
}

export function ChatWindow({
  conversation,
  currentUser,
  onBack,
  onToggleContactSidebar,
  showContactSidebar,
  sendMessageToChatOverride,
  markMessagesAsReadOverride,
  isUserTypingOverride,
  isSendingMessageOverride
}: ChatWindowProps) {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const markingInProgressRef = useRef<Set<number>>(new Set());

  // Use chat hooks
  const chat = useChat();
  const sendMessageToChat = (chatId: number, message: string, file?: File) =>
    (typeof sendMessageToChatOverride === 'function' ? sendMessageToChatOverride(chatId, message, file) : chat.sendMessageToChat(chatId, message, file));
  const markMessagesAsRead = (messageIds: number[], chatId: number) =>
    (typeof markMessagesAsReadOverride === 'function' ? markMessagesAsReadOverride(messageIds, chatId) : chat.markMessagesAsRead(messageIds, chatId));
  const isUserTyping = (userId: number) =>
    (typeof isUserTypingOverride === 'function' ? isUserTypingOverride(userId) : chat.isUserTyping(userId));
  const isSendingMessage = typeof isSendingMessageOverride === 'boolean' ? isSendingMessageOverride : chat.isSendingMessage;

  const {
    messages,
    isLoading,
    refetchMessages
  } = useChatMessages(parseInt(conversation.id));

  // Mark messages as read when conversation opens
  const handleMarkMessagesAsRead = useCallback(async (messageIds: number[]) => {
    if (messageIds.length === 0) return;

    // Filter out messages already being processed
    const newIds = messageIds.filter(id => !markingInProgressRef.current.has(id));
    if (newIds.length === 0) return;

    // Add to in-progress set
    newIds.forEach(id => markingInProgressRef.current.add(id));

    try {
      await markMessagesAsRead(newIds, parseInt(conversation.id));
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
    } finally {
      // Remove from in-progress set
      newIds.forEach(id => markingInProgressRef.current.delete(id));
    }
  }, [markMessagesAsRead]);

  useEffect(() => {
    // Mark unread messages as read when conversation opens
    if (messages.length > 0) {
      const unreadMessages = messages
        .filter((msg: ChatMessage) => !msg.is_seen && !msg.sent_by_me)
        .map((msg: ChatMessage) => msg.id);

      if (unreadMessages.length > 0) {
        handleMarkMessagesAsRead(unreadMessages);
      }
    }
  }, [conversation.id, handleMarkMessagesAsRead]); // Only run when conversation changes

  useEffect(() => {
    // Scroll to bottom when messages change or when component mounts
    scrollToBottom();
  }, [messages]);

  // Scroll to bottom when conversation changes
  useEffect(() => {
    if (conversation?.id) {
      // Small delay to ensure messages are rendered
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  }, [conversation?.id]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
        inline: 'nearest'
      });
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await sendMessageToChat(parseInt(conversation.id), newMessage);
      setNewMessage('');
      // Immediate scroll for sent messages
      setTimeout(() => {
        scrollToBottom();
      }, 50);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    
    if (isToday(date)) {
      return format(date, 'HH:mm', { locale: ar });
    } else if (isYesterday(date)) {
      return `أمس ${format(date, 'HH:mm', { locale: ar })}`;
    } else {
      return format(date, 'dd/MM/yyyy HH:mm', { locale: ar });
    }
  };

  const getLastSeenText = (lastSeen?: string) => {
    if (!lastSeen) return 'غير متاح';
    
    const date = new Date(lastSeen);
    if (isToday(date)) {
      return `شوهد اليوم ${format(date, 'HH:mm', { locale: ar })}`;
    } else if (isYesterday(date)) {
      return `شوهد أمس ${format(date, 'HH:mm', { locale: ar })}`;
    } else {
      return `شوهد ${format(date, 'dd/MM/yyyy', { locale: ar })}`;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="w-10 h-10">
                <AvatarImage src={conversation.user.image} />
                <AvatarFallback>
                  <User className="w-5 h-5" />
                </AvatarFallback>
              </Avatar>
              {conversation.user.is_online && (
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
              )}
            </div>
            
            <div>
              <h2 className="font-semibold text-sm">
                {conversation.user.first_name} {conversation.user.last_name}
              </h2>
              <p className="text-xs text-muted-foreground">
                {conversation.user.is_online ? 'متصل الآن' : getLastSeenText(conversation.user.last_seen)}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-full">
            <Phone className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Video className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full"
            onClick={onToggleContactSidebar}
          >
            <Info className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4 h-full">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={cn(
                "flex gap-2",
                i % 2 === 0 ? "justify-end" : "justify-start"
              )}>
                <div className={cn(
                  "p-3 rounded-2xl max-w-xs animate-pulse",
                  i % 2 === 0 ? "bg-primary/20" : "bg-muted"
                )}>
                  <div className="h-4 bg-current opacity-20 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {messages.sort((a, b) => new Date(a.timestamp || a.created_at).getTime() - new Date(b.timestamp || b.created_at).getTime()).map((message, index) => {
              const isOwn = message.sent_by_me;
              const sortedMessages = messages.sort((a, b) => new Date(a.timestamp || a.created_at).getTime() - new Date(b.timestamp || b.created_at).getTime());
              const messageTime = message.timestamp || message.created_at;
              const prevMessageTime = sortedMessages[index - 1]?.timestamp || sortedMessages[index - 1]?.created_at;
              const showTime = index === 0 ||
                new Date(messageTime).getTime() - new Date(prevMessageTime || 0).getTime() > 300000; // 5 minutes

              return (
                <div key={message.id}>
                  {showTime && (
                    <div className="text-center my-4">
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                        {formatMessageTime(messageTime)}
                      </span>
                    </div>
                  )}
                  
                  <div className={cn(
                    "flex gap-2 items-end",
                    isOwn ? "justify-end" : "justify-start"
                  )}>
                    <div className={cn(
                      "max-w-xs lg:max-w-sm xl:max-w-md p-3 rounded-2xl",
                      isOwn ? (
                        "bg-primary text-primary-foreground rounded-br-md"
                      ) : (
                        "bg-muted text-muted-foreground rounded-bl-md"
                      )
                    )}>
                      <p className="text-sm leading-relaxed">{message.message?.text || ''}</p>
                      
                      <div className={cn(
                        "flex items-center gap-1 mt-1",
                        isOwn ? "justify-end" : "justify-start"
                      )}>
                        <span className={cn(
                          "text-xs",
                          isOwn ? "text-primary-foreground/70" : "text-muted-foreground/70"
                        )}>
                          {format(new Date(messageTime), 'HH:mm', { locale: ar })}
                        </span>
                        
                        {isOwn && (
                          <div className="text-primary-foreground/70">
                            {message.is_seen ? (
                              <CheckCheck className="w-3 h-3" />
                            ) : (
                              <Check className="w-3 h-3" />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {isUserTyping(conversation.user.id) && (
              <div className="flex gap-2 items-end">
                <div className="bg-muted text-muted-foreground p-3 rounded-2xl rounded-bl-md">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {/* Message Input */}
      <div className="p-4 border-t border-border bg-card">
        <form onSubmit={handleSendMessage} className="flex items-end gap-2">
          <Button variant="ghost" size="icon" type="button" className="rounded-full">
            <Paperclip className="w-4 h-4" />
          </Button>
          
          <div className="flex-1 relative">
            <Input
              value={newMessage}
              onChange={(event) => setNewMessage(event.target.value)}
              placeholder="اكتب رسالة..."
              className="pr-10 rounded-full border-muted-foreground/20 focus-visible:ring-1"
              disabled={isSendingMessage}
            />
            <Button 
              variant="ghost" 
              size="icon" 
              type="button"
              className="absolute left-1 top-1/2 transform -translate-y-1/2 rounded-full"
            >
              <Smile className="w-4 h-4" />
            </Button>
          </div>
          
          <Button 
            type="submit" 
            size="icon" 
            className="rounded-full"
            disabled={!newMessage.trim() || isSendingMessage}
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
