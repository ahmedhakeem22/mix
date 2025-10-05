import React, { useState } from 'react';
import { Bell, BellOff, Check, CheckCheck, Trash2, X, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useNotifications } from '@/contexts/NotificationContext';
import { NotificationItem } from './NotificationItem';
import { notificationHelpers } from '@/services/notificationService';

interface NotificationCenterProps {
  className?: string;
  variant?: 'dropdown' | 'sidebar' | 'modal';
  onClose?: () => void;
}

export function NotificationCenter({ 
  className, 
  variant = 'dropdown',
  onClose 
}: NotificationCenterProps) {
  const { 
    state, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    clearAllNotifications,
    fetchNotifications 
  } = useNotifications();
  
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [isProcessing, setIsProcessing] = useState(false);

  const { notifications, unreadCount, isLoading, isConnected } = state;

  // Filter notifications based on active filter
  const filteredNotifications = notificationHelpers.filterNotifications(
    notifications,
    {
      type: activeFilter !== 'all' ? activeFilter : undefined,
      read: activeFilter === 'unread' ? false : undefined,
    }
  );

  // Group notifications by date
  const groupedNotifications = notificationHelpers.groupByDate(filteredNotifications);

  const handleMarkAllAsRead = async () => {
    setIsProcessing(true);
    try {
      await markAllAsRead();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearAll = async () => {
    setIsProcessing(true);
    try {
      await clearAllNotifications();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRefresh = async () => {
    setIsProcessing(true);
    try {
      await fetchNotifications();
    } finally {
      setIsProcessing(false);
    }
  };

  const renderHeader = () => (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center gap-2">
        <Bell className="w-5 h-5" />
        <h2 className="font-semibold">الإشعارات</h2>
        {unreadCount > 0 && (
          <Badge variant="destructive" className="h-5 min-w-5 text-xs">
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
        {/* Connection indicator */}
        <div className={cn(
          "w-2 h-2 rounded-full",
          isConnected ? "bg-green-500" : "bg-red-500"
        )} />
      </div>
      
      <div className="flex items-center gap-1">
        {/* Refresh button */}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleRefresh}
          disabled={isProcessing}
          className="h-8 w-8"
        >
          <Settings className={cn("w-4 h-4", isProcessing && "animate-spin")} />
        </Button>

        {/* Mark all as read */}
        {unreadCount > 0 && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleMarkAllAsRead}
            disabled={isProcessing}
            className="h-8 w-8"
          >
            <CheckCheck className="w-4 h-4" />
          </Button>
        )}

        {/* Close button (for modal/sidebar variants) */}
        {(variant === 'modal' || variant === 'sidebar') && onClose && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );

  const renderFilters = () => (
    <div className="p-3 border-b">
      <Tabs value={activeFilter} onValueChange={setActiveFilter}>
        <TabsList className="grid grid-cols-4 w-full h-8">
          <TabsTrigger value="all" className="text-xs">
            الكل
            {notifications.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-4 text-xs">
                {notifications.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="unread" className="text-xs">
            غير مقروءة
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-1 h-4 text-xs">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="message" className="text-xs">رسائل</TabsTrigger>
          <TabsTrigger value="system" className="text-xs">نظام</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="p-4">
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-muted rounded-full animate-pulse" />
                <div className="flex-1 space-y-1">
                  <div className="h-4 bg-muted rounded animate-pulse" />
                  <div className="h-3 bg-muted rounded w-3/4 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (filteredNotifications.length === 0) {
      return (
        <div className="p-8 text-center">
          <BellOff className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-medium mb-1">لا توجد إشعارات</h3>
          <p className="text-sm text-muted-foreground">
            {activeFilter === 'unread' 
              ? 'جميع الإشعارات مقروءة' 
              : 'لم تتلق أي إشعارات بعد'
            }
          </p>
        </div>
      );
    }

    return (
      <ScrollArea className="flex-1 max-h-96">
        <div className="p-2">
          {Object.entries(groupedNotifications).map(([date, dateNotifications]) => (
            <div key={date} className="mb-4">
              <div className="sticky top-0 bg-background/80 backdrop-blur-sm px-2 py-1 mb-2">
                <h4 className="text-xs font-medium text-muted-foreground">{date}</h4>
              </div>
              <div className="space-y-1">
                {dateNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={() => markAsRead([notification.id])}
                    onDelete={() => deleteNotification(notification.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    );
  };

  const renderFooter = () => {
    if (notifications.length === 0) return null;

    return (
      <div className="p-3 border-t bg-muted/20">
        <div className="flex justify-between items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleClearAll}
            disabled={isProcessing || notifications.length === 0}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            حذف الكل
          </Button>
          
          <p className="text-xs text-muted-foreground">
            {notifications.length} إشعار
          </p>
        </div>
      </div>
    );
  };

  // Dropdown variant
  if (variant === 'dropdown') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className={cn("w-80 p-0", className)}
          sideOffset={5}
        >
          {renderHeader()}
          {renderFilters()}
          {renderContent()}
          {renderFooter()}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Sidebar or Modal variant
  return (
    <div className={cn(
      "flex flex-col bg-background border rounded-lg",
      variant === 'sidebar' && "h-full",
      variant === 'modal' && "max-h-[80vh] w-full max-w-md",
      className
    )}>
      {renderHeader()}
      {renderFilters()}
      {renderContent()}
      {renderFooter()}
    </div>
  );
}
