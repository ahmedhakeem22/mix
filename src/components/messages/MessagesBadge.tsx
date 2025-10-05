import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { messagesAPI } from '@/services/apis';
import { useAuth } from '@/context/auth-context';

export function MessagesBadge() {
  const { isAuthenticated } = useAuth();
  
  const { data: messagesResponse } = useQuery({
    queryKey: ['user-messages'],
    queryFn: () => messagesAPI.getMessages(),
    enabled: isAuthenticated,
    refetchInterval: 30000, // تحديث كل 30 ثانية
  });

  const messages = messagesResponse?.data || [];
  // في الرسائل البسيطة، كل رسالة غير مقروءة
  const unreadCount = messages.length;

  if (!isAuthenticated) return null;

  return (
    <Button variant="ghost" size="icon" asChild className="relative">
      <Link to="/dashboard">
        <MessageSquare className="w-5 h-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs rounded-full bg-red-500 text-white border-2 border-white dark:border-gray-900"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Link>
    </Button>
  );
}