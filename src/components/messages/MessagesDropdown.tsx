import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageSquare, User, MapPin, ChevronRight, Mail, MailOpen, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { messagesAPI } from '@/services/apis';
import { useAuth } from '@/context/auth-context';
import { WhatsAppButton } from './WhatsAppButton';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface Message {
  id: number;
  sender_id: number;
  recipient_id: number;
  message: string;
  listing_id?: number;
  read_at?: string;
  created_at: string;
  sender?: {
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

export function MessagesDropdown() {
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: messagesResponse, isLoading } = useQuery({
    queryKey: ['user-messages'],
    queryFn: () => messagesAPI.getMessages(),
    enabled: isAuthenticated,
    refetchInterval: 30000,
    retry: false, // Don't retry to avoid spam
    onError: (error) => {
      console.warn('⚠️ Failed to fetch messages for dropdown:', error);
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: (messageId: number) => messagesAPI.markMessageAsRead(messageId),
    onSuccess: (data, messageId) => {
      queryClient.setQueryData(['user-messages'], (oldData: any) => {
        if (!oldData?.data) return oldData;
        return {
          ...oldData,
          data: oldData.data.map((msg: Message) =>
            msg.id === messageId ? { ...msg, read_at: new Date().toISOString() } : msg
          ),
        };
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "تعذر تحديث حالة الرسالة",
        variant: "destructive",
      });
    },
  });

  const messages: Message[] = messagesResponse?.data || [];
  const unreadCount = messages.filter(msg => !msg.read_at).length;

  const handleMessageClick = (message: Message) => {
    if (!message.read_at) {
      markAsReadMutation.mutate(message.id);
    }
    setIsOpen(false);
    navigate('/chat');
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    
    if (now.toDateString() === date.toDateString()) {
      return formatTime(dateString);
    }
    
    return date.toLocaleDateString('ar-SA', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const MessageItem = ({ message }: { message: Message }) => {
    const isUnread = !message.read_at;
    const isSent = message.sender_id === user?.id;
    
    return (
      <div 
        className={cn(
          "group relative px-4 py-3 -mx-1 hover:bg-gray-50/80 dark:hover:bg-gray-800/50",
          "transition-colors cursor-pointer rounded-lg",
          isUnread && "bg-blue-50/50 dark:bg-blue-900/10"
        )}
        onClick={() => handleMessageClick(message)}
      >
        <div className="flex gap-3">
          <div className="relative flex-shrink-0">
            <Avatar className="w-10 h-10 border border-gray-200 dark:border-gray-700">
              <AvatarImage src={message.sender?.image} />
              <AvatarFallback className="bg-gray-100 dark:bg-gray-800">
                <User className="w-4 h-4 text-gray-500" />
              </AvatarFallback>
            </Avatar>
            {isUnread && !isSent && (
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border border-white dark:border-gray-900" />
            )}
          </div>
          
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium text-sm flex items-center gap-2">
                  {isSent ? 'أنت' : `${message.sender?.first_name} ${message.sender?.last_name}`}
                </p>
                
                {message.listing && (
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5 truncate">
                    {message.listing.title}
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-1.5">
                <time 
                  className={cn(
                    "text-xs whitespace-nowrap",
                    isUnread ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"
                  )}
                >
                  {formatDate(message.created_at)}
                </time>
                <ChevronRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <div className="mt-0.5">
                {isUnread ? (
                  <Mail className="w-4 h-4 text-blue-500" />
                ) : (
                  <MailOpen className="w-4 h-4 text-gray-400" />
                )}
              </div>
              <p className="text-sm text-gray-800 dark:text-gray-200 line-clamp-2 break-words flex-1">
                {message.message}
              </p>
            </div>
            
            {!isSent && message.sender?.phone && (
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300">
                    <Phone className="w-3 h-3" />
                    <span>{message.sender.phone}</span>
                  </div>
                  {message.sender.location_address && (
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate max-w-[80px]">{message.sender.location_address}</span>
                    </div>
                  )}
                </div>
                <WhatsAppButton 
                  phoneNumber={message.sender.phone}
                  message={`مرحباً ${message.sender.first_name}، بخصوص رسالتك: "${message.message.substring(0, 50)}..."`}
                  size="xs"
                  className="h-7 px-3 text-xs"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (!isAuthenticated) return null;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <div className="relative">
            <MessageSquare className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className={cn(
                "absolute -top-1 -right-1 flex items-center justify-center rounded-full bg-red-500 text-white",
                unreadCount > 9 ? "w-5 h-5 text-[9px] px-0.5" : "w-4 h-4 text-[10px]"
              )}>
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </div>
          <span className="sr-only">الرسائل</span>
        </Button>
      </PopoverTrigger>
      
      <PopoverContent 
        className={cn(
          "w-[360px] p-0 rounded-xl shadow-lg",
          "border border-gray-200 dark:border-gray-700",
          "bg-white dark:bg-gray-900 overflow-hidden"
        )}
        align="end"
        sideOffset={8}
      >
        <div className="sticky top-0 z-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 px-4 py-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-base flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-500" />
              الرسائل
              {unreadCount > 0 && (
                <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">
                  {unreadCount} جديد
                </span>
              )}
            </h3>
            <Link
              to="/chat"
              onClick={() => setIsOpen(false)}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              عرض الكل
            </Link>
          </div>
        </div>

        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="space-y-3 p-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-24 rounded-md" />
                      <Skeleton className="h-3 w-12 rounded-md" />
                    </div>
                    <Skeleton className="h-3 w-full rounded-md" />
                    <Skeleton className="h-3 w-3/4 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/10 rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-blue-500" />
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-1">لا توجد رسائل</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-[240px]">
                سيظهر هنا أي رسائل جديدة تتلقاها من المشترين أو البائعين
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {messages.slice(0, 8).map(message => (
                <MessageItem key={message.id} message={message} />
              ))}
            </div>
          )}
        </ScrollArea>

        {messages.length > 0 && (
          <div className="sticky bottom-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 px-4 py-2.5 text-center">
            <Link
              to="/chat"
              onClick={() => setIsOpen(false)}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              عرض جميع الرسائل ({messages.length})
            </Link>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
