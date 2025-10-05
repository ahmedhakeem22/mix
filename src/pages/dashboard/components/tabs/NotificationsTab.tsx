
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Bell } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export function NotificationsTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>الإشعارات</CardTitle>
        <CardDescription>إدارة إعدادات الإشعارات</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Notification settings */}
          <div>
            <h3 className="text-lg font-medium mb-4">إعدادات الإشعارات</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-notifications" className="font-medium">إشعارات البريد الإلكتروني</Label>
                  <p className="text-sm text-muted-foreground">استلام إشعارات عبر البريد الإلكتروني</p>
                </div>
                <Switch id="email-notifications" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="browser-notifications" className="font-medium">إشعارات المتصفح</Label>
                  <p className="text-sm text-muted-foreground">استلام إشعارات في المتصفح</p>
                </div>
                <Switch id="browser-notifications" />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="marketing-notifications" className="font-medium">الرسائل التسويقية</Label>
                  <p className="text-sm text-muted-foreground">استلام عروض وتحديثات تسويقية</p>
                </div>
                <Switch id="marketing-notifications" />
              </div>
            </div>
          </div>
          
          {/* Recent notifications */}
          <div>
            <h3 className="text-lg font-medium mb-4">الإشعارات الأخيرة</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    لا توجد إشعارات جديدة
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
