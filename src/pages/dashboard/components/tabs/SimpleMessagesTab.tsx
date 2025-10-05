import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { messagesAPI } from '@/services/apis';
import { useAuth } from '@/context/auth-context';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Inbox, User, AlertCircle, MessageSquare, Send, Check, CheckCheck, MapPin, Phone, ChevronDown } from 'lucide-react';
import { WhatsAppButton } from '@/components/messages/WhatsAppButton';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Message {
  id: number;
  sender_id: number;
  recipient_id: number;
  message: string;
  listing_id?: number;
  read_at: string | null;
  created_at: string;
  sender?: {
    id: number;
    first_name: string;
    last_name: string;
    phone?: string;
    image?: string;
    location_address?: string;
  };
  recipient?: {
    id: number;
    first_name: string;
    last_name: string;
    phone?: string;
    image?: string;
    location_address?: string;
  };
  listing?: {
    id: number;
    title: string;
  };
}

const MessagePreview = ({ 
  message, 
  type,
  onExpand,
  expanded
}: {
  message: Message;
  type: 'sent' | 'received';
  onExpand: (id: number) => void;
  expanded: boolean;
}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isRead, setIsRead] = useState(!!message.read_at);
  
  const markAsReadMutation = useMutation({
    mutationFn: (messageId: number) => messagesAPI.markMessageAsRead(messageId),
    onMutate: async (messageId) => {
      await queryClient.cancelQueries({ queryKey: ['user-messages'] });
      const previousMessages = queryClient.getQueryData(['user-messages']);

      queryClient.setQueryData(['user-messages'], (oldData: any) => {
        if (!oldData?.data) return oldData;
        
        const newUnreadCount = (oldData.unreadCount ?? 0) > 0 ? oldData.unreadCount - 1 : 0;

        return {
          ...oldData,
          data: oldData.data.map((msg: Message) =>
            msg.id === messageId ? { ...msg, read_at: new Date().toISOString() } : msg
          ),
          unreadCount: newUnreadCount
        };
      });

      return { previousMessages };
    },
    onError: (err, messageId, context) => {
      queryClient.setQueryData(['user-messages'], context?.previousMessages);
    },
    // تم حذف onSettled بالكامل من هنا لمنع إعادة الجلب
  });

  const handleClick = () => {
    if (type === 'received' && !isRead) {
      markAsReadMutation.mutate(message.id);
      setIsRead(true);
    }
    onExpand(expanded ? 0 : message.id);
  };

  const otherUser = type === 'sent' ? message.recipient : message.sender;
  const formattedDate = new Date(message.created_at).toLocaleDateString('ar-SA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div 
      className={cn(
        "group flex flex-col gap-2 p-3 mx-1 rounded-lg transition-all cursor-pointer",
        "border border-gray-100 dark:border-gray-700",
        "bg-white dark:bg-gray-800/50",
        "hover:bg-gray-50 dark:hover:bg-gray-700/50",
        expanded && "bg-gray-50 dark:bg-gray-700/60",
        !isRead && type === 'received' && "bg-blue-50/50 dark:bg-blue-900/10"
      )}
      onClick={handleClick}
    >
      <div className="flex items-start gap-2">
        <div className="relative">
          <Avatar className="w-9 h-9 border border-gray-200 dark:border-gray-700">
            <AvatarImage src={otherUser?.image} />
            <AvatarFallback className="bg-gray-100 dark:bg-gray-800">
              <User className="w-3 h-3 text-gray-500" />
            </AvatarFallback>
          </Avatar>
          {!isRead && type === 'received' && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full border border-white dark:border-gray-900" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-1">
            <div>
              <p className="font-medium text-sm">
                {type === 'sent' ? 'أنت' : `${otherUser?.first_name} ${otherUser?.last_name}`}
              </p>
              
              {message.listing && (
                <p className="text-xs text-blue-600 dark:text-blue-400 truncate">
                  {message.listing.title}
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-1">
              <time className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                {formattedDate}
              </time>
              <ChevronDown className={cn(
                "w-3 h-3 text-gray-400 transition-transform",
                expanded ? "rotate-180" : ""
              )} />
            </div>
          </div>
          
          <div className="mt-1">
            <p className={cn(
              "text-xs text-gray-800 dark:text-gray-200 break-words whitespace-pre-wrap",
              expanded ? "" : "line-clamp-2"
            )}>
              {message.message}
            </p>
          </div>
        </div>
      </div>
      
      {expanded && (
        <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
          <div className="flex flex-col gap-2">
            {otherUser?.phone && (
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                  <Phone className="w-3.5 h-3.5" />
                  <span className="font-medium">{otherUser.phone}</span>
                </div>
                <WhatsAppButton 
                  phoneNumber={otherUser.phone}
                  message={`مرحباً ${otherUser.first_name}، بخصوص ${type === 'sent' ? 'إعلانك' : 'رسالتك'}: "${message.message.substring(0, 50)}..."`}
                  size="sm"
                  className="h-8 px-3 text-xs"
                />
              </div>
            )}
            
            {otherUser?.location_address && (
              <div className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-300">
                <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                <span className="break-words">{otherUser.location_address}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const MessagesList = ({ 
  messages, 
  type,
  initialCount = 5
}: {
  messages: Message[];
  type: 'sent' | 'received';
  initialCount?: number;
}) => {
  const [expandedId, setExpandedId] = useState(0);
  const [displayCount, setDisplayCount] = useState(initialCount);
  
  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <MessageSquare className="h-12 w-12 text-gray-400 mb-2" />
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {type === 'received' ? 'لا توجد رسائل واردة' : 'لا توجد رسائل صادرة'}
        </h3>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {messages.slice(0, displayCount).map(message => (
        <MessagePreview 
          key={message.id}
          message={message}
          type={type}
          onExpand={setExpandedId}
          expanded={expandedId === message.id}
        />
      ))}
      
      {messages.length > displayCount && (
        <div className="pt-1 flex justify-center">
          <Button 
            variant="ghost" 
            size="xs"
            onClick={() => setDisplayCount(prev => prev + 5)}
            className="text-xs text-blue-600 dark:text-blue-400"
          >
            عرض المزيد ({messages.length - displayCount})
          </Button>
        </div>
      )}
    </div>
  );
};

export function SimpleMessagesTab() {
  const { user } = useAuth();
  const { data: messagesData, isLoading, isError } = useQuery({
    queryKey: ['user-messages'],
    queryFn: () => messagesAPI.getMessages(),
    retry: 1,
    select: (data) => {
      const messages = data.data || [];
      return {
        messages,
        unreadCount: messages.filter(msg => 
          msg.recipient_id === user?.id && !msg.read_at
        ).length
      };
    }
  });

  const { messages = [], unreadCount = 0 } = messagesData || {};
  const sentMessages = messages.filter(msg => msg.sender_id === user?.id);
  const receivedMessages = messages.filter(msg => msg.recipient_id === user?.id);

  if (isLoading) {
    return (
      <div className="space-y-2 p-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-2 p-2 rounded-lg border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800/50">
            <Skeleton className="w-9 h-9 rounded-full" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-3 w-24 rounded-md" />
              <Skeleton className="h-3 w-full rounded-md" />
              <Skeleton className="h-3 w-16 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-6 px-2">
        <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 mb-2">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
        </div>
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
          حدث خطأ في تحميل الرسائل
        </h3>
      </div>
    );
  }

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="pb-2 px-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center text-[10px] rounded-full bg-red-500 text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>
            <div>
              <CardTitle className="text-base">الرسائل</CardTitle>
              {unreadCount > 0 && (
                <CardDescription className="text-xs">
                  {unreadCount} غير مقروءة
                </CardDescription>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="px-1">
        <Tabs defaultValue="received" className="w-full">
          <TabsList className="w-full px-1 h-9 rounded-md bg-gray-100 dark:bg-gray-800">
            <TabsTrigger 
              value="received" 
              className="text-xs px-2 h-7 relative"
            >
              <Inbox className="w-3 h-3 mr-1" />
              الوارد
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center text-[10px] rounded-full bg-red-500 text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </TabsTrigger>
            
            <TabsTrigger 
              value="sent" 
              className="text-xs px-2 h-7"
            >
              <Send className="w-3 h-3 mr-1" />
              الصادر
            </TabsTrigger>
          </TabsList>
          
          <div className="px-0 py-1">
            <TabsContent value="received">
              <MessagesList 
                messages={receivedMessages} 
                type="received" 
                initialCount={5}
              />
            </TabsContent>
            
            <TabsContent value="sent">
              <MessagesList 
                messages={sentMessages} 
                type="sent" 
                initialCount={5}
              />
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}