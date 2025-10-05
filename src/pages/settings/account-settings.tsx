
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useAccountSettings, useUpdateAccountSettings } from '@/hooks/use-verification';
import { Loader2, Shield, Bell, Settings, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AccountSettingsPage() {
  const { data: settings, isLoading } = useAccountSettings();
  const updateSettings = useUpdateAccountSettings();
  const { toast } = useToast();
  const [localSettings, setLocalSettings] = useState(settings);

  // Update local settings when data loads
  useState(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  const handleSaveSettings = async () => {
    if (!localSettings) return;
    
    const flatSettings = {
      // Security settings
      show_phone_to_buyers: localSettings.security.show_phone_to_buyers,
      enable_location_tracking: localSettings.security.enable_location_tracking,
      share_usage_data: localSettings.security.share_usage_data,
      
      // Notification settings
      enable_all_notifications: localSettings.notifications.enable_all_notifications,
      new_message_notifications: localSettings.notifications.new_message_notifications,
      listing_comment_notifications: localSettings.notifications.listing_comment_notifications,
      weekly_email_summary: localSettings.notifications.weekly_email_summary,
      email_matching_listings: localSettings.notifications.email_matching_listings,
      email_offers_promotions: localSettings.notifications.email_offers_promotions,
      sms_notifications: localSettings.notifications.sms_notifications,
      
      // General settings
      theme: localSettings.general.theme,
      language: localSettings.general.language,
      show_nearby_listings: localSettings.general.show_nearby_listings,
      show_currency_rates: localSettings.general.show_currency_rates,
      enable_image_caching: localSettings.general.enable_image_caching,
      disable_listing_comments: localSettings.general.disable_listing_comments,
    };

    updateSettings.mutate(flatSettings);
  };

  const updateSecuritySetting = (key: keyof typeof localSettings.security, value: boolean) => {
    if (!localSettings) return;
    setLocalSettings({
      ...localSettings,
      security: {
        ...localSettings.security,
        [key]: value
      }
    });
  };

  const updateNotificationSetting = (key: keyof typeof localSettings.notifications, value: boolean) => {
    if (!localSettings) return;
    setLocalSettings({
      ...localSettings,
      notifications: {
        ...localSettings.notifications,
        [key]: value
      }
    });
  };

  const updateGeneralSetting = (key: keyof typeof localSettings.general, value: boolean | string) => {
    if (!localSettings) return;
    setLocalSettings({
      ...localSettings,
      general: {
        ...localSettings.general,
        [key]: value
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!localSettings) {
    return (
      <div className="text-center p-8">
        <p>لا يمكن تحميل الإعدادات</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">إعدادات الحساب</h1>
          <p className="text-muted-foreground">إدارة تفضيلات حسابك وإعدادات الأمان</p>
        </div>
        <Button 
          onClick={handleSaveSettings}
          disabled={updateSettings.isPending}
        >
          {updateSettings.isPending ? (
            <>
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              جاري الحفظ...
            </>
          ) : (
            'حفظ التغييرات'
          )}
        </Button>
      </div>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            إعدادات الأمان والخصوصية
          </CardTitle>
          <CardDescription>
            تحكم في خصوصيتك ومن يمكنه رؤية معلوماتك
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>إظهار رقم الهاتف للمشترين</Label>
              <p className="text-sm text-muted-foreground">
                السماح للمشترين برؤية رقم هاتفك في الإعلانات
              </p>
            </div>
            <Switch
              checked={localSettings.security.show_phone_to_buyers}
              onCheckedChange={(value) => updateSecuritySetting('show_phone_to_buyers', value)}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>تتبع الموقع</Label>
              <p className="text-sm text-muted-foreground">
                السماح بتتبع موقعك لعرض إعلانات أقرب إليك
              </p>
            </div>
            <Switch
              checked={localSettings.security.enable_location_tracking}
              onCheckedChange={(value) => updateSecuritySetting('enable_location_tracking', value)}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>مشاركة بيانات الاستخدام</Label>
              <p className="text-sm text-muted-foreground">
                مساعدتنا في تحسين التطبيق بمشاركة بيانات الاستخدام
              </p>
            </div>
            <Switch
              checked={localSettings.security.share_usage_data}
              onCheckedChange={(value) => updateSecuritySetting('share_usage_data', value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            إعدادات الإشعارات
          </CardTitle>
          <CardDescription>
            اختر الإشعارات التي تريد استلامها
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">
                تفعيل جميع الإشعارات
                <Badge variant="secondary">رئيسي</Badge>
              </Label>
              <p className="text-sm text-muted-foreground">
                تفعيل أو إلغاء جميع الإشعارات دفعة واحدة
              </p>
            </div>
            <Switch
              checked={localSettings.notifications.enable_all_notifications}
              onCheckedChange={(value) => updateNotificationSetting('enable_all_notifications', value)}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>إشعارات الرسائل الجديدة</Label>
              <p className="text-sm text-muted-foreground">
                استلام إشعار عند وصول رسالة جديدة
              </p>
            </div>
            <Switch
              checked={localSettings.notifications.new_message_notifications}
              onCheckedChange={(value) => updateNotificationSetting('new_message_notifications', value)}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>إشعارات التعليقات</Label>
              <p className="text-sm text-muted-foreground">
                استلام إشعار عند التعليق على إعلاناتك
              </p>
            </div>
            <Switch
              checked={localSettings.notifications.listing_comment_notifications}
              onCheckedChange={(value) => updateNotificationSetting('listing_comment_notifications', value)}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>الملخص الأسبوعي</Label>
              <p className="text-sm text-muted-foreground">
                استلام ملخص أسبوعي بالبريد الإلكتروني
              </p>
            </div>
            <Switch
              checked={localSettings.notifications.weekly_email_summary}
              onCheckedChange={(value) => updateNotificationSetting('weekly_email_summary', value)}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>إعلانات مطابقة</Label>
              <p className="text-sm text-muted-foreground">
                استلام إيميل عند وجود إعلانات مناسبة لاهتماماتك
              </p>
            </div>
            <Switch
              checked={localSettings.notifications.email_matching_listings}
              onCheckedChange={(value) => updateNotificationSetting('email_matching_listings', value)}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>العروض والترويج</Label>
              <p className="text-sm text-muted-foreground">
                استلام إيميل بالعروض والتخفيضات
              </p>
            </div>
            <Switch
              checked={localSettings.notifications.email_offers_promotions}
              onCheckedChange={(value) => updateNotificationSetting('email_offers_promotions', value)}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>الرسائل النصية</Label>
              <p className="text-sm text-muted-foreground">
                استلام إشعارات عبر الرسائل النصية
              </p>
            </div>
            <Switch
              checked={localSettings.notifications.sms_notifications}
              onCheckedChange={(value) => updateNotificationSetting('sms_notifications', value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            الإعدادات العامة
          </CardTitle>
          <CardDescription>
            تخصيص تجربتك في استخدام التطبيق
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>إظهار الإعلانات القريبة</Label>
              <p className="text-sm text-muted-foreground">
                عرض الإعلانات القريبة من موقعك أولاً
              </p>
            </div>
            <Switch
              checked={localSettings.general.show_nearby_listings}
              onCheckedChange={(value) => updateGeneralSetting('show_nearby_listings', value)}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>إظهار أسعار العملات</Label>
              <p className="text-sm text-muted-foreground">
                عرض أسعار العملات في التطبيق
              </p>
            </div>
            <Switch
              checked={localSettings.general.show_currency_rates}
              onCheckedChange={(value) => updateGeneralSetting('show_currency_rates', value)}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>تخزين الصور مؤقتاً</Label>
              <p className="text-sm text-muted-foreground">
                تحسين سرعة التحميل بحفظ الصور مؤقتاً
              </p>
            </div>
            <Switch
              checked={localSettings.general.enable_image_caching}
              onCheckedChange={(value) => updateGeneralSetting('enable_image_caching', value)}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>إيقاف التعليقات</Label>
              <p className="text-sm text-muted-foreground">
                منع التعليق على الإعلانات
              </p>
            </div>
            <Switch
              checked={localSettings.general.disable_listing_comments}
              onCheckedChange={(value) => updateGeneralSetting('disable_listing_comments', value)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
