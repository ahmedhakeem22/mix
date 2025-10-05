import React, { useState, useEffect } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Search,
  MessageSquare,
  User,
  Phone,
  Plus,
  MoreVertical,
  Archive,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChat } from '@/hooks/use-chat';
import { format, isToday, isYesterday } from 'date-fns';
import { ar } from 'date-fns/locale';

interface ChatUser {
  id: number;
  first_name: string;
  last_name: string;
  full_name?: string;
  image?: string;
  phone?: string;
  last_seen?: string;
  is_online?: boolean;
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

interface Conversation {
  id: string;
  user: ChatUser;
  last_message?: ChatMessage;
  unread_count: number;
  updated_at: string;
}

interface ChatSidebarProps {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  onSelectConversation: (conversation: Conversation) => void;
  onConversationsUpdate: (conversations: Conversation[]) => void;
}

export function ChatSidebar({
  conversations,
  selectedConversation,
  onSelectConversation,
  onConversationsUpdate
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);

  // Use real-time chat hook
  const {
    conversations: liveConversations,
    isLoadingConversations: isLoading,
    isConnected
  } = useChat();

  useEffect(() => {
    if (liveConversations.length > 0) {
      onConversationsUpdate(liveConversations);
    }
  }, [liveConversations, onConversationsUpdate]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredConversations(conversations);
    } else {
      const filtered = conversations.filter(conv => {
        const fullName = conv.user.full_name || `${conv.user.first_name} ${conv.user.last_name}`;
        return fullName.toLowerCase().includes(searchQuery.toLowerCase());
      });
      setFilteredConversations(filtered);
    }
  }, [conversations, searchQuery]);

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    
    if (isToday(date)) {
      return format(date, 'HH:mm', { locale: ar });
    } else if (isYesterday(date)) {
      return 'أمس';
    } else {
      return format(date, 'dd/MM', { locale: ar });
    }
  };

  const truncateMessage = (message: string, maxLength: number = 40) => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-semibold">الرسائل</h1>
            {/* Connection indicator */}
            <div className={cn(
              "w-2 h-2 rounded-full",
              isConnected ? "bg-green-500" : "bg-red-500"
            )} />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Plus className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="البحث في الرسائل..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-muted/50 border-0 focus-visible:ring-1"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-3 border-b border-border">
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="flex-1 justify-start gap-2">
            <Archive className="w-4 h-4" />
            المؤرشفة
          </Button>
        </div>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3">
                <div className="w-12 h-12 bg-muted rounded-full animate-pulse" />
                <div className="flex-1 space-y-1">
                  <div className="h-4 bg-muted rounded animate-pulse" />
                  <div className="h-3 bg-muted rounded w-3/4 animate-pulse" />
                </div>
                <div className="h-3 bg-muted rounded w-8 animate-pulse" />
              </div>
            ))}
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-8 text-center">
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              {searchQuery ? 'لا توجد نتائج' : 'لا توجد محادثات'}
            </p>
          </div>
        ) : (
          <div className="p-2">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => onSelectConversation(conversation)}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted/50",
                  selectedConversation?.id === conversation.id && "bg-primary/10 hover:bg-primary/15"
                )}
              >
                {/* Avatar */}
                <div className="relative">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={conversation.user.image} />
                    <AvatarFallback className="bg-muted">
                      <User className="w-6 h-6" />
                    </AvatarFallback>
                  </Avatar>
                  {conversation.user.is_online && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-background rounded-full" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={cn(
                      "font-medium text-sm truncate",
                      conversation.unread_count > 0 && "font-semibold"
                    )}>
                      {conversation.user.full_name || `${conversation.user.first_name} ${conversation.user.last_name}`}
                    </h3>
                    <div className="flex items-center gap-1">
                      {conversation.last_message && (
                        <span className="text-xs text-muted-foreground">
                          {formatMessageTime(conversation.last_message.timestamp || conversation.last_message.created_at)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className={cn(
                      "text-sm text-muted-foreground truncate",
                      conversation.unread_count > 0 && "text-foreground font-medium"
                    )}>
                      {conversation.last_message ?
                        truncateMessage(conversation.last_message.message?.text || '') :
                        'بدء محادثة جديدة'
                      }
                    </p>

                    {conversation.unread_count > 0 && (
                      <Badge 
                        variant="default" 
                        className="ml-2 h-5 min-w-[1.25rem] px-1.5 text-xs bg-primary hover:bg-primary"
                      >
                        {conversation.unread_count > 99 ? '99+' : conversation.unread_count}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
