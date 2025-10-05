import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Heart, 
  MessageCircle, 
  TrendingUp, 
  Settings, 
  FileText,
  User,
  Check,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Notification } from '@/contexts/NotificationContext';
import { notificationHelpers } from '@/services/notificationService';
import { useNavigate } from 'react-router-dom';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead?: () => void;
  onDelete?: () => void;
  className?: string;
}

export function NotificationItem({ 
  notification, 
  onMarkAsRead, 
  onDelete,
  className 
}: NotificationItemProps) {
  const navigate = useNavigate();
  const isUnread = !notification.read_at;

  const getIcon = () => {
    switch (notification.type) {
      case 'message':
        return <MessageSquare className="w-4 h-4" />;
      case 'comment':
        return <MessageCircle className="w-4 h-4" />;
      case 'favorite':
        return <Heart className="w-4 h-4 text-red-500" />;
      case 'promotion':
        return <TrendingUp className="w-4 h-4 text-purple-500" />;
      case 'system':
        return <Settings className="w-4 h-4 text-gray-500" />;
      case 'ad_update':
        return <FileText className="w-4 h-4 text-orange-500" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getTypeLabel = () => {
    switch (notification.type) {
      case 'message': return 'رسالة';
      case 'comment': return 'تعليق';
      case 'favorite': return 'إعجاب';
      case 'promotion': return 'ترويج';
      case 'system': return 'نظام';
      case 'ad_update': return 'تحديث إعلان';
      default: return 'إشعار';
    }
  };

  const handleClick = () => {
    // Mark as read if unread
    if (isUnread && onMarkAsRead) {
      onMarkAsRead();
    }

    // Navigate to action URL if provided
    if (notification.action_url) {
      if (notification.action_url.startsWith('http')) {
        window.open(notification.action_url, '_blank');
      } else {
        navigate(notification.action_url);
      }
    }
  };

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onMarkAsRead) {
      onMarkAsRead();
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete();
    }
  };

  return (
    <div 
      className={cn(
        "flex items-start gap-3 p-3 rounded-lg transition-colors",
        "hover:bg-muted/50 cursor-pointer",
        isUnread && "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700",
        className
      )}
      onClick={handleClick}
    >
      {/* Sender Avatar or Icon */}
      <div className="flex-shrink-0">
        {notification.sender?.image ? (
          <Avatar className="w-8 h-8">
            <AvatarImage src={notification.sender.image} />
            <AvatarFallback>
              <User className="w-4 h-4" />
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center",
            "bg-primary/10 text-primary"
          )}>
            {getIcon()}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {/* Title and Type Badge */}
            <div className="flex items-center gap-2 mb-1">
              <h4 className={cn(
                "text-sm font-medium truncate",
                isUnread && "font-semibold"
              )}>
                {notification.title}
              </h4>
              <Badge 
                variant="secondary" 
                className="text-xs px-1.5 py-0.5 h-auto"
              >
                {getTypeLabel()}
              </Badge>
            </div>

            {/* Message */}
            <p className={cn(
              "text-sm text-muted-foreground line-clamp-2 leading-relaxed",
              isUnread && "text-foreground"
            )}>
              {notification.message}
            </p>

            {/* Sender name if available */}
            {notification.sender && (
              <p className="text-xs text-muted-foreground mt-1">
                من: {notification.sender.first_name} {notification.sender.last_name}
              </p>
            )}

            {/* Time and indicators */}
            <div className="flex items-center justify-between mt-2">
              <time className="text-xs text-muted-foreground">
                {notificationHelpers.formatTime(notification.created_at)}
              </time>

              <div className="flex items-center gap-1">
                {/* Action URL indicator */}
                {notification.action_url && (
                  <ExternalLink className="w-3 h-3 text-muted-foreground" />
                )}
                
                {/* Unread indicator */}
                {isUnread && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {/* Mark as read/unread */}
            {isUnread && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={handleMarkAsRead}
                title="تحديد كمقروء"
              >
                <Check className="w-3 h-3" />
              </Button>
            )}

            {/* Delete */}
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-destructive hover:text-destructive"
              onClick={handleDelete}
              title="حذف"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Compact version for smaller spaces
export function NotificationItemCompact({ 
  notification, 
  onMarkAsRead, 
  onDelete,
  className 
}: NotificationItemProps) {
  const isUnread = !notification.read_at;

  const getIcon = () => {
    switch (notification.type) {
      case 'message':
        return <MessageSquare className="w-3 h-3" />;
      case 'comment':
        return <MessageCircle className="w-3 h-3" />;
      case 'favorite':
        return <Heart className="w-3 h-3 text-red-500" />;
      case 'promotion':
        return <TrendingUp className="w-3 h-3 text-purple-500" />;
      case 'system':
        return <Settings className="w-3 h-3 text-gray-500" />;
      case 'ad_update':
        return <FileText className="w-3 h-3 text-orange-500" />;
      default:
        return <MessageSquare className="w-3 h-3" />;
    }
  };

  const handleClick = () => {
    if (isUnread && onMarkAsRead) {
      onMarkAsRead();
    }
  };

  return (
    <div 
      className={cn(
        "flex items-center gap-2 p-2 rounded transition-colors",
        "hover:bg-muted/50 cursor-pointer",
        isUnread && "bg-blue-50 dark:bg-blue-900/20",
        className
      )}
      onClick={handleClick}
    >
      {/* Icon */}
      <div className="flex-shrink-0">
        <div className={cn(
          "w-6 h-6 rounded-full flex items-center justify-center",
          "bg-primary/10 text-primary"
        )}>
          {getIcon()}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-xs truncate",
          isUnread && "font-medium"
        )}>
          {notification.title}
        </p>
        <time className="text-xs text-muted-foreground">
          {notificationHelpers.formatTime(notification.created_at)}
        </time>
      </div>

      {/* Unread indicator */}
      {isUnread && (
        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />
      )}
    </div>
  );
}
