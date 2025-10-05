import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { MobileNav } from '@/components/layout/mobile-nav';
import { BellOff, CheckCheck, Clock, MessageSquare, ThumbsUp, User, Trash2, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format, formatDistanceToNow } from 'date-fns';

// Notification type
interface Notification {
  id: string;
  type: 'message' | 'reaction' | 'system' | 'ad';
  title: string;
  content: string;
  timestamp: Date;
  read: boolean;
  link?: string;
  actionText?: string;
}

// Sample notifications
const generateSampleNotifications = (): Notification[] => {
  return [
    {
      id: '1',
      type: 'message',
      title: 'رسالة جديدة',
      content: 'لديك رسالة جديدة من محمد علي حول إعلان "آيفون 12 برو ماكس"',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      read: false,
      link: '/messages',
      actionText: 'عرض الرسالة'
    },
    {
      id: '2',
      type: 'reaction',
      title: 'إعجاب بإعلانك',
      content: 'أعجب أحمد خالد بإعلانك "سيارة تويوتا كامري 2020"',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      read: false,
      link: '/dashboard',
      actionText: 'عرض الإعلان'
    },
    {
      id: '3',
      type: 'system',
      title: 'تحديث في سياسة الخصوصية',
      content: 'تم تحديث سياسة الخصوصية الخاصة بموقعنا. يرجى الاطلاع عليها',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      read: true,
      link: '#',
      actionText: 'عرض التفاصيل'
    },
    {
      id: '4',
      type: 'ad',
      title: 'تمت الموافقة على إعلانك',
      content: 'تمت الموافقة على إعلانك "لابتوب ديل XPS 13" وهو الآن معروض للبيع',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
      read: true,
      link: '/dashboard',
      actionText: 'عرض الإعلان'
    },
    {
      id: '5',
      type: 'message',
      title: 'رسالة جديدة',
      content: 'لديك رسالة جديدة من سارة محمد حول إعلان "ساعة أبل الإصدار 7"',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72), // 3 days ago
      read: true,
      link: '/messages',
      actionText: 'عرض الرسالة'
    }
  ];
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);
  
  // Simulate fetching notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setNotifications(generateSampleNotifications());
      setIsLoading(false);
    };
    
    fetchNotifications();
  }, []);
  
  // Filter notifications based on active tab
  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !notification.read;
    return notification.type === activeTab;
  });
  
  // Format notification time
  const formatNotificationTime = (date: Date): string => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return formatDistanceToNow(date, { addSuffix: true });
    } else if (diffInHours < 48) {
      return 'أمس';
    } else {
      return format(date, 'dd/MM/yyyy');
    }
  };
  
  // Mark notification as read
  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(notification => {
      if (notification.id === id) {
        return { ...notification, read: true };
      }
      return notification;
    }));
  };
  
  // Mark all notifications as read
  const markAllAsRead = () => {
    setIsMarkingAllRead(true);
    
    // Simulate API call
    setTimeout(() => {
      setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
      setIsMarkingAllRead(false);
    }, 1000);
  };
  
  // Delete notification
  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };
  
  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="h-6 w-6 text-blue-500" />;
      case 'reaction':
        return <ThumbsUp className="h-6 w-6 text-green-500" />;
      case 'system':
        return <User className="h-6 w-6 text-amber-500" />;
      case 'ad':
        return <CheckCircle2 className="h-6 w-6 text-brand" />;
      default:
        return <BellOff className="h-6 w-6 text-muted-foreground" />;
    }
  };
  
  // Count unread notifications
  const unreadCount = notifications.filter(notification => !notification.read).length;
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pb-20 md:pb-0">
        <div className="bg-gray-50 border-b border-border">
          <div className="container px-4 mx-auto py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold">الإشعارات</h1>
                <p className="text-muted-foreground">
                  {unreadCount > 0 ? `لديك ${unreadCount} إشعارات غير مقروءة` : 'ليس لديك إشعارات غير مقروءة'}
                </p>
              </div>
              
              {unreadCount > 0 && (
                <Button 
                  variant="outline" 
                  onClick={markAllAsRead}
                  disabled={isMarkingAllRead}
                >
                  {isMarkingAllRead ? (
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCheck className="ml-2 h-4 w-4" />
                  )}
                  تعيين الكل كمقروء
                </Button>
              )}
            </div>
          </div>
        </div>
        
        <div className="container px-4 mx-auto py-6">
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full grid grid-cols-5">
              <TabsTrigger value="all">
                الكل
                {notifications.length > 0 && (
                  <span className="mr-1 text-xs bg-muted rounded-full px-2 py-0.5">
                    {notifications.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="unread">
                غير مقروءة
                {unreadCount > 0 && (
                  <span className="mr-1 text-xs bg-muted rounded-full px-2 py-0.5">
                    {unreadCount}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="message">الرسائل</TabsTrigger>
              <TabsTrigger value="reaction">التفاعلات</TabsTrigger>
              <TabsTrigger value="ad">الإعلانات</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="mt-6">
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-brand" />
                </div>
              ) : filteredNotifications.length > 0 ? (
                <div className="space-y-4">
                  {filteredNotifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`border rounded-lg p-4 transition-colors hover:bg-gray-50 ${
                        !notification.read ? 'border-l-4 border-l-brand' : ''
                      }`}
                    >
                      <div className="flex">
                        <div className="ml-4">
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h3 className={`font-medium ${!notification.read ? 'text-brand' : ''}`}>
                              {notification.title}
                            </h3>
                            
                            <div className="flex items-center">
                              <span className="text-xs text-muted-foreground">
                                {formatNotificationTime(notification.timestamp)}
                              </span>
                              
                              <div className="flex mr-4">
                                {!notification.read && (
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => markAsRead(notification.id)}
                                    className="h-7 w-7"
                                  >
                                    <CheckCheck className="h-4 w-4 text-muted-foreground" />
                                  </Button>
                                )}
                                
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => deleteNotification(notification.id)}
                                  className="h-7 w-7"
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            </div>
                          </div>
                          
                          <p className="text-muted-foreground mt-1">
                            {notification.content}
                          </p>
                          
                          {notification.link && (
                            <Button 
                              variant="link" 
                              className="h-8 px-0 text-brand" 
                              asChild
                            >
                              <a href={notification.link}>
                                {notification.actionText || 'عرض'}
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <BellOff className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">لا توجد إشعارات</h3>
                  <p className="text-muted-foreground">
                    {activeTab === 'all' 
                      ? 'ليس لديك أي إشعارات في الوقت الحالي'
                      : activeTab === 'unread'
                        ? 'ليس لديك إشعارات غير مقروءة'
                        : `ليس لديك إشعارات في قسم ${
                            activeTab === 'message' ? 'الرسائل' : 
                            activeTab === 'reaction' ? 'التفاعلات' : 
                            activeTab === 'ad' ? 'الإعلانات' : ''
                          }`
                    }
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
      <MobileNav />
    </div>
  );
}
