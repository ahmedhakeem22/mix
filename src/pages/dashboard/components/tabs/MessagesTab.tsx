
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { MessageCircle, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { chatsAPI, Chat } from '@/services/chats-api';

const fetchChats = async (page: number = 1) => {
  const response = await chatsAPI.getChats(page);
  if (!response.success) {
    throw new Error(response.message || 'Failed to fetch chats');
  }
  return response.data;
};

export function MessagesTab() {
  const { 
    data: chatsData, 
    error, 
    isLoading,
  } = useQuery({
    queryKey: ['chats'],
    queryFn: () => fetchChats(1),
  });

  const chats: Chat[] = chatsData?.data ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>الرسائل</CardTitle>
        <CardDescription>إدارة الرسائل والمحادثات</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="mr-3">جاري تحميل المحادثات...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 text-red-600">
            <MessageCircle className="h-12 w-12 mb-4" />
            <h3 className="text-lg font-medium">خطأ في التحميل</h3>
            <p className="text-center mt-2 mb-4">
              حدث خطأ أثناء جلب المحادثات. يرجى المحاولة مرة أخرى.
            </p>
          </div>
        ) : chats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">لا توجد رسائل</h3>
            <p className="text-muted-foreground text-center mt-2 mb-4">
              لا توجد رسائل في صندوق الوارد حالياً
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {chats.map((chat) => (
              <Link to={`/messages/${chat.id}`} key={chat.id} className="block hover:bg-muted/50 p-3 rounded-lg transition-colors">
                <div className="flex items-center space-x-4 space-x-reverse">
                  <Avatar className="h-12 w-12 border">
                    <AvatarImage src={chat.other_participant?.image} alt={chat.other_participant?.full_name} />
                    <AvatarFallback>{chat.other_participant?.full_name?.substring(0, 2) || '؟'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <p className="font-semibold text-sm">{chat.other_participant?.full_name || 'مستخدم محذوف'}</p>
                      <p className="text-xs text-muted-foreground">{chat.updated_at}</p>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                        <p className="text-sm text-muted-foreground truncate max-w-[200px] md:max-w-xs">
                         {chat.last_message?.message?.text ?? 'لا توجد رسائل'}
                        </p>
                       {chat.unread_messages_count > 0 && (
                          <span className="bg-brand text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                            {chat.unread_messages_count}
                          </span>
                        )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
