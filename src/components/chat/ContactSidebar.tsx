import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  Phone, 
  Video, 
  User, 
  MessageSquare, 
  Archive, 
  Trash2, 
  Star,
  Image,
  File,
  Link,
  MapPin,
  Calendar,
  Shield,
  Flag,
  Volume2,
  VolumeX,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface ChatUser {
  id: number;
  first_name: string;
  last_name: string;
  image?: string;
  phone?: string;
  last_seen?: string;
  is_online?: boolean;
  location_address?: string;
  member_since?: string;
}

interface Conversation {
  id: string;
  user: ChatUser;
  last_message?: any;
  unread_count: number;
  updated_at: string;
}

interface ContactSidebarProps {
  conversation: Conversation;
  onClose: () => void;
}

export function ContactSidebar({ conversation, onClose }: ContactSidebarProps) {
  const { user } = conversation;

  const contactActions = [
    {
      icon: Phone,
      label: 'مكالمة صوتية',
      action: () => window.open(`tel:${user.phone}`),
      disabled: !user.phone
    },
    {
      icon: Video,
      label: 'مكالمة فيديو',
      action: () => console.log('Video call'),
      disabled: true
    },
    {
      icon: MessageSquare,
      label: 'رسالة جديدة',
      action: () => console.log('New message'),
    }
  ];

  const mediaItems = [
    { type: 'image', count: 12, icon: Image, label: 'الصور' },
    { type: 'file', count: 3, icon: File, label: 'الملفات' },
    { type: 'link', count: 5, icon: Link, label: 'الروابط' },
  ];

  const settingsOptions = [
    {
      icon: Star,
      label: 'إضافة للمفضلة',
      action: () => console.log('Add to favorites'),
    },
    {
      icon: VolumeX,
      label: 'كتم الإشعارات',
      action: () => console.log('Mute notifications'),
    },
    {
      icon: Archive,
      label: 'أرشفة المحادثة',
      action: () => console.log('Archive chat'),
    },
    {
      icon: Flag,
      label: 'الإبلاغ عن المستخدم',
      action: () => console.log('Report user'),
      variant: 'destructive' as const
    },
    {
      icon: Trash2,
      label: 'حذف المحادثة',
      action: () => console.log('Delete chat'),
      variant: 'destructive' as const
    },
  ];

  return (
    <div className="h-full flex flex-col bg-card">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="font-semibold">معلومات الاتصال</h2>
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
          <X className="w-4 h-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Profile Section */}
          <div className="text-center space-y-4">
            <div className="relative inline-block">
              <Avatar className="w-20 h-20 mx-auto">
                <AvatarImage src={user.image} />
                <AvatarFallback className="text-lg">
                  <User className="w-8 h-8" />
                </AvatarFallback>
              </Avatar>
              {user.is_online && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-background rounded-full" />
              )}
            </div>

            <div>
              <h3 className="text-xl font-semibold">
                {user.first_name} {user.last_name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {user.is_online ? 'متصل الآن' : `آخر ظهور ${user.last_seen ? format(new Date(user.last_seen), 'PPP', { locale: ar }) : 'غير معروف'}`}
              </p>
            </div>

            {/* Contact Actions */}
            <div className="flex justify-center gap-4">
              {contactActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="icon"
                  className="rounded-full w-12 h-12"
                  onClick={action.action}
                  disabled={action.disabled}
                >
                  <action.icon className="w-5 h-5" />
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="font-medium">معلومات الاتصال</h4>
            
            {user.phone && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{user.phone}</p>
                    <p className="text-xs text-muted-foreground">رقم الهاتف</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  اتصال
                </Button>
              </div>
            )}

            {user.location_address && (
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{user.location_address}</p>
                  <p className="text-xs text-muted-foreground">الموقع</p>
                </div>
              </div>
            )}

            {user.member_since && (
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">
                    عضو منذ {format(new Date(user.member_since), 'MMMM yyyy', { locale: ar })}
                  </p>
                  <p className="text-xs text-muted-foreground">تاريخ الانضمام</p>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Media & Files */}
          <div className="space-y-4">
            <h4 className="font-medium">الوسائط والملفات</h4>
            
            <div className="grid grid-cols-3 gap-3">
              {mediaItems.map((item, index) => (
                <Card 
                  key={index}
                  className="p-3 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <item.icon className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-xs font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.count}</p>
                </Card>
              ))}
            </div>
          </div>

          <Separator />

          {/* Privacy & Safety */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Shield className="w-4 h-4" />
              الخصوصية والأمان
            </h4>
            
            <Card className="p-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                  <Shield className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">محادثة آمنة</p>
                  <p className="text-xs text-muted-foreground">
                    محادثاتك محمية بالتشفير التام
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <Separator />

          {/* Settings */}
          <div className="space-y-2">
            <h4 className="font-medium">الإعدادات</h4>
            
            {settingsOptions.map((option, index) => (
              <Button
                key={index}
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 h-auto p-3",
                  option.variant === 'destructive' && "text-destructive hover:text-destructive hover:bg-destructive/10"
                )}
                onClick={option.action}
              >
                <option.icon className="w-4 h-4" />
                <span className="text-sm">{option.label}</span>
              </Button>
            ))}
          </div>

          {/* User Stats */}
          <div className="space-y-4">
            <h4 className="font-medium">إحصائيات</h4>
            
            <div className="grid grid-cols-2 gap-3">
              <Card className="p-3 text-center">
                <p className="text-lg font-semibold">142</p>
                <p className="text-xs text-muted-foreground">الرسائل</p>
              </Card>
              <Card className="p-3 text-center">
                <p className="text-lg font-semibold">23</p>
                <p className="text-xs text-muted-foreground">الصور</p>
              </Card>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
