
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  User, 
  FileText, 
  BarChart3, 
  Settings, 
  Heart, 
  MessageCircle, 
  Bell,
  TrendingUp 
} from 'lucide-react';

interface DashboardSidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
  isMobile?: boolean;
}

export function DashboardSidebar({ 
  activePage, 
  setActivePage, 
  isMobile = false 
}: DashboardSidebarProps) {
  const menuItems = [
    { id: 'overview', label: 'نظرة عامة', icon: BarChart3 },
    { id: 'profile', label: 'الملف الشخصي', icon: User },
    { id: 'ads', label: 'إعلاناتي', icon: FileText },
    { id: 'favorites', label: 'المفضلة', icon: Heart },
    { id: 'messages', label: 'الرسائل', icon: MessageCircle },
    // { id: 'notifications', label: 'الإشعارات', icon: Bell },
    { id: 'promote', label: 'ترويج الإعلانات', icon: TrendingUp },
    // { id: 'statistics', label: 'الإحصائيات', icon: BarChart3 },
    { id: 'settings', label: 'الإعدادات', icon: Settings },
  ];

  if (isMobile) {
    return (
      <div className="mb-6">
        <div className="flex overflow-x-auto gap-2 pb-2">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <Button
                key={item.id}
                variant={activePage === item.id ? 'default' : 'outline'}
                onClick={() => setActivePage(item.id)}
                className="flex-shrink-0 whitespace-nowrap"
                size="sm"
              >
                <IconComponent className="h-4 w-4 ml-2" />
                {item.label}
              </Button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <Card className="p-4">
      <h3 className="font-bold mb-4">لوحة التحكم</h3>
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <Button
              key={item.id}
              variant={activePage === item.id ? 'default' : 'ghost'}
              onClick={() => setActivePage(item.id)}
              className="w-full justify-start"
            >
              <IconComponent className="h-4 w-4 ml-2" />
              {item.label}
            </Button>
          );
        })}
      </nav>
    </Card>
  );
}
