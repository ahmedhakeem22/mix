import { Link, useLocation } from 'react-router-dom';
import { Home, MessageSquare, PlusCircle, Heart, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { messagesAPI } from '@/services/apis';
import { useAuth } from '@/context/auth-context';
import { cn } from '@/lib/utils';

export function MobileNav() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const { data: messagesResponse } = useQuery({
    queryKey: ['user-messages'],
    queryFn: () => messagesAPI.getMessages(),
    enabled: isAuthenticated,
    refetchInterval: 30000,
    retry: false, // Don't retry to avoid spam
    onError: (error) => {
      console.warn('⚠️ Failed to fetch messages for mobile nav:', error);
    },
  });

  const messages = messagesResponse?.data || [];
  const unreadCount = messages.filter((msg: any) => !msg.read_at && msg.recipient_id).length;

  const items = [
    {
      label: 'الرئيسية',
      icon: Home,
      href: '/'
    },
    {
      label: 'الرسائل',
      icon: MessageSquare,
      href: '/chat',
      badge: unreadCount
    },
    {
      label: 'إضافة إعلان',
      icon: PlusCircle,
      href: '/add-ad'
    },
    {
      label: 'المفضلة',
      icon: Heart,
      href: '/favorites'
    },
    {
      label: 'حسابي',
      icon: User,
      href: '/dashboard/?tab=profile'
    }
  ];

  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white dark:bg-neutral-900 border-t border-border dark:border-neutral-700">
      <div className="grid grid-cols-5 h-16">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;

          const isAddAd = item.href === '/add-ad';

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex flex-col items-center justify-center text-xs font-medium transition-colors relative",
                isActive
                  ? "text-primary dark:text-white"
                  : "text-gray-600 dark:text-neutral-400",
                isAddAd && "text-primary"
              )}
            >
              <div className="relative">
                <Icon className={cn("h-6 w-6 mb-1", isAddAd && "text-primary")} />
                {item.badge && item.badge > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-4 w-4 flex items-center justify-center p-0 text-xs rounded-full bg-red-500 text-white"
                  >
                    {item.badge > 99 ? '99+' : item.badge}
                  </Badge>
                )}
              </div>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
