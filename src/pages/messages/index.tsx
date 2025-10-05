import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { messagesAPI } from '@/services/apis';
import { useAuth } from '@/context/auth-context';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, MessageSquare, Send, Inbox, MapPin, Phone, Check, CheckCheck } from 'lucide-react';
import { WhatsAppButton } from '@/components/messages/WhatsAppButton';
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

export default function MessagesPage() {
  const { user, isAuthenticated } = useAuth();
  const [expandedMessage, setExpandedMessage] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const { data: messagesResponse, isLoading } = useQuery({
    queryKey: ['user-messages'],
    queryFn: () => messagesAPI.getMessages(),
    enabled: isAuthenticated,
    refetchInterval: 30000,
  });

  const markAsReadMutation = useMutation({
    mutationFn: (messageId: number) => messagesAPI.markMessageAsRead(messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-messages'] });
    },
  });

  const messages: Message[] = messagesResponse?.data || [];
  
  // تصنيف الرسائل
  const sentMessages = messages.filter(msg => msg.sender_id === user?.id);
  const receivedMessages = messages.filter(msg => msg.recipient_id === user?.id);
  const unreadReceivedMessages = receivedMessages.filter(msg => !msg.read_at);

  const handleMessageClick = (message: Message) => {
    if (!message.read_at && message.recipient_id === user?.id) {
      markAsReadMutation.mutate(message.id);
    }
    setExpandedMessage(expandedMessage === message.id ? null : message.id);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return `اليوم ${date.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffInDays === 1) {
      return `أمس ${date.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('ar-SA', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit'
      });
    }
  };

  const MessageCard = ({ message, type }: { message: Message; type: 'sent' | 'received' }) => {
    const isExpanded = expandedMessage === message.id;
    const isUnread = !message.read_at && type === 'received';
    const otherUser = type === 'sent' ? message.recipient : message.sender;

    return (
      <Card 
        className={`mb-4 transition-all cursor-pointer hover:shadow-md ${
          isUnread ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700' : ''
        } ${isExpanded ? 'ring-2 ring-primary/20' : ''}`}
        onClick={() => handleMessageClick(message)}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <Avatar className="w-12 h-12 ring-2 ring-border">
              <AvatarImage src={otherUser?.image} />
              <AvatarFallback className="bg-muted">
                <User className="w-6 h-6" />
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-base">
                    {otherUser?.first_name} {otherUser?.last_name}
                  </h3>
                  {type === 'sent' && (
                    <Badge variant="secondary" className="text-xs">
                      <Send className="w-3 h-3 mr-1" />
                      مرسلة
                    </Badge>
                  )}
                  {isUnread && (
                    <Badge variant="destructive" className="text-xs animate-pulse">
                      جديدة
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <time className="text-sm text-muted-foreground">
                    {formatDate(message.created_at)}
                  </time>
                  {type === 'sent' && (
                    <div className="text-muted-foreground">
                  {message.read_at ? (
                    <CheckCheck className="w-4 h-4 text-blue-500" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                    </div>
                  )}
                </div>
              </div>

              {message.listing && (
                <div className="bg-muted/50 rounded-lg p-2 mb-3">
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    بخصوص الإعلان: {message.listing.title}
                  </p>
                </div>
              )}

              <div className={`transition-all ${isExpanded ? 'max-h-full' : 'max-h-16 overflow-hidden'}`}>
                <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                  {message.message}
                </p>
              </div>

              {!isExpanded && message.message.length > 100 && (
                <button className="text-primary text-sm mt-1 hover:underline">
                  اقرأ المزيد...
                </button>
              )}

              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {otherUser?.location_address && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{otherUser.location_address}</span>
                        </div>
                      )}
                      {otherUser?.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          <span>{otherUser.phone}</span>
                        </div>
                      )}
                    </div>

                    {otherUser?.phone && (
                      <WhatsAppButton 
                        phoneNumber={otherUser.phone}
                        message={`مرحباً ${otherUser.first_name}، بخصوص ${type === 'sent' ? 'إعلانك' : 'رسالتك'}: "${message.message.substring(0, 50)}..."`}
                        size="sm"
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const MessagesSkeleton = () => (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <Card key={i} className="p-4">
          <div className="flex items-start gap-4">
            <Skeleton className="w-12 h-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-8">
            <p>يجب تسجيل الدخول لعرض الرسائل</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <Card className="shadow-lg">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-6 h-6 text-primary" />
              <div>
                <CardTitle className="text-xl">الرسائل</CardTitle>
                <p className="text-sm text-muted-foreground">
                  إدارة رسائلك المرسلة والمستقبلة
                </p>
              </div>
            </div>
            {unreadReceivedMessages.length > 0 && (
              <Badge variant="destructive" className="animate-pulse">
                {unreadReceivedMessages.length} رسالة غير مقروءة
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Tabs defaultValue="received" className="w-full">
            <TabsList className="grid w-full grid-cols-2 m-4 mb-0">
              <TabsTrigger value="received" className="relative">
                <Inbox className="w-4 h-4 mr-2" />
                الرسائل المستقبلة
                {unreadReceivedMessages.length > 0 && (
                  <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
                    {unreadReceivedMessages.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="sent">
                <Send className="w-4 h-4 mr-2" />
                الرسائل المرسلة
              </TabsTrigger>
            </TabsList>

            <TabsContent value="received" className="p-4">
              {isLoading ? (
                <MessagesSkeleton />
              ) : receivedMessages.length === 0 ? (
                <div className="text-center py-12">
                  <Inbox className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">لا توجد رسائل مستقبلة</h3>
                  <p className="text-muted-foreground">
                    عندما يرسل لك أحد رسالة، ستظهر هنا
                  </p>
                </div>
              ) : (
                <div>
                  {receivedMessages.map(message => (
                    <MessageCard key={message.id} message={message} type="received" />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="sent" className="p-4">
              {isLoading ? (
                <MessagesSkeleton />
              ) : sentMessages.length === 0 ? (
                <div className="text-center py-12">
                  <Send className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">لا توجد رسائل مرسلة</h3>
                  <p className="text-muted-foreground">
                    الرسائل التي ترسلها ستظهر هنا
                  </p>
                </div>
              ) : (
                <div>
                  {sentMessages.map(message => (
                    <MessageCard key={message.id} message={message} type="sent" />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}