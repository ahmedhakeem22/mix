import { useEffect, useState, FC } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Save } from 'lucide-react';
import { useAccountSettings, useUpdateSettings } from '@/hooks/use-settings-api';
import { UserSettings } from '@/types';

// مكون مساعد لعرض صف إعدادات لتجنب التكرار
interface SettingRowProps {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}

const SettingRow: FC<SettingRowProps> = ({ id, label, description, checked, onCheckedChange, disabled = false }) => (
  <div className="flex items-center justify-between border-t pt-4 first:border-t-0 first:pt-0">
    <div>
      <Label htmlFor={id} className={`font-medium ${disabled ? 'text-muted-foreground' : ''}`}>{label}</Label>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
    <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} />
  </div>
);

// مكون لعرض هيكل عظمي أثناء التحميل
const SkeletonLoader = () => (
    <div className="space-y-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center justify-between border-t pt-4 first:border-t-0 first:pt-0">
          <div>
            <div className="h-5 w-32 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="h-6 w-11 bg-gray-200 rounded-full animate-pulse"></div>
        </div>
      ))}
    </div>
);

export function PreferencesTab() {
  const { data: initialSettings, isLoading, isError } = useAccountSettings();
  const updateSettingsMutation = useUpdateSettings();

  const [security, setSecurity] = useState<UserSettings['security']>();
  const [notifications, setNotifications] = useState<UserSettings['notifications']>();
  const [general, setGeneral] = useState<UserSettings['general']>();

  useEffect(() => {
    if (initialSettings) {
      setSecurity(initialSettings.security);
      setNotifications(initialSettings.notifications);
      setGeneral(initialSettings.general);
    }
  }, [initialSettings]);

  const handleSave = (group: 'security' | 'notifications' | 'general') => {
    let data;
    switch (group) {
        case 'security': data = security; break;
        case 'notifications': data = notifications; break;
        case 'general': data = general; break;
    }
    if (data) {
        updateSettingsMutation.mutate({ group, data });
    }
  };
  
    const handleEnableAllNotifications = (checked: boolean) => {
    setNotifications(prev => {
        if (!prev) return prev;

        const newState = { ...prev };

        for (const key in newState) {
          (newState as any)[key] = checked;
        }

        return newState;
    });

  };

  if (isLoading) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>جاري تحميل التفضيلات...</CardTitle>
                <CardDescription>لحظات قليلة ويتم عرض إعدادات حسابك.</CardDescription>
            </CardHeader>
            <CardContent><SkeletonLoader /></CardContent>
        </Card>
    );
  }

  if (isError || !security || !notifications || !general) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-destructive">حدث خطأ</CardTitle>
                <CardDescription>فشل تحميل تفضيلات الحساب. يرجى تحديث الصفحة والمحاولة مرة أخرى.</CardDescription>
            </CardHeader>
        </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* --- بطاقة تفضيلات الإشعارات --- */}
      <Card>
        <CardHeader>
          <CardTitle>تفضيلات الإشعارات</CardTitle>
          <CardDescription>تحكم في الإشعارات التي ترغب في تلقيها عبر التطبيق والبريد الإلكتروني.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <SettingRow 
                id="enable_all_notifications" 
                label="تفعيل جميع الإشعارات" 
                description="مفتاح رئيسي لتفعيل أو تعطيل كافة الإشعارات دفعة واحدة."
                checked={notifications.enable_all_notifications}
                onCheckedChange={handleEnableAllNotifications}
            />
            <SettingRow
                id="new_message_notifications"
                label="إشعارات الرسائل الجديدة"
                description="تلقي إشعار عند وصول رسالة جديدة من مستخدم آخر."
                checked={notifications.new_message_notifications}
                onCheckedChange={(v) => setNotifications(p => p && ({...p, new_message_notifications: v}))}
                disabled={!notifications.enable_all_notifications}
            />
            <SettingRow
                id="listing_comment_notifications"
                label="إشعارات التعليقات"
                description="تلقي إشعار عند إضافة تعليق جديد على أحد إعلاناتك."
                checked={notifications.listing_comment_notifications}
                onCheckedChange={(v) => setNotifications(p => p && ({...p, listing_comment_notifications: v}))}
                disabled={!notifications.enable_all_notifications}
            />
             <SettingRow
                id="email_matching_listings"
                label="إشعارات الإعلانات المطابقة (بريد إلكتروني)"
                description="استلام رسائل بريد إلكتروني دورية بالإعلانات التي تطابق اهتماماتك."
                checked={notifications.email_matching_listings}
                onCheckedChange={(v) => setNotifications(p => p && ({...p, email_matching_listings: v}))}
                disabled={!notifications.enable_all_notifications}
            />
            <SettingRow
                id="email_offers_promotions"
                label="العروض الترويجية (بريد إلكتروني)"
                description="استلام رسائل بريد إلكتروني بالعروض والتحديثات من المنصة."
                checked={notifications.email_offers_promotions}
                onCheckedChange={(v) => setNotifications(p => p && ({...p, email_offers_promotions: v}))}
                disabled={!notifications.enable_all_notifications}
            />
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="ml-auto" onClick={() => handleSave('notifications')} disabled={updateSettingsMutation.isPending}>
             {updateSettingsMutation.isPending ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Save className="ml-2 h-4 w-4" />}
            حفظ تفضيلات الإشعارات
          </Button>
        </CardFooter>
      </Card>

      {/* --- بطاقة الأمان والخصوصية --- */}
      <Card>
        <CardHeader>
          <CardTitle>الأمان والخصوصية</CardTitle>
          <CardDescription>تحكم في كيفية عرض بياناتك ومشاركتها على المنصة.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
             <SettingRow
                id="show_phone_to_buyers"
                label="إظهار رقم الهاتف للمشترين"
                description="السماح للمستخدمين الآخرين برؤية رقم هاتفك في صفحة إعلاناتك."
                checked={security.show_phone_to_buyers}
                onCheckedChange={(v) => setSecurity(p => p && ({...p, show_phone_to_buyers: v}))}
            />
            <SettingRow
                id="enable_location_tracking"
                label="تفعيل خدمات الموقع"
                description="السماح للتطبيق باستخدام موقعك لعرض الإعلانات القريبة منك."
                checked={security.enable_location_tracking}
                onCheckedChange={(v) => setSecurity(p => p && ({...p, enable_location_tracking: v}))}
            />
            <SettingRow
                id="share_usage_data"
                label="مشاركة بيانات الاستخدام"
                description="المساهمة في تحسين خدماتنا عبر مشاركة بيانات استخدام مجهولة المصدر."
                checked={security.share_usage_data}
                onCheckedChange={(v) => setSecurity(p => p && ({...p, share_usage_data: v}))}
            />
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="ml-auto" onClick={() => handleSave('security')} disabled={updateSettingsMutation.isPending}>
            {updateSettingsMutation.isPending ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Save className="ml-2 h-4 w-4" />}
            حفظ إعدادات الخصوصية
          </Button>
        </CardFooter>
      </Card>
      
      {/* --- بطاقة الإعدادات العامة --- */}
      <Card>
        <CardHeader>
          <CardTitle>الإعدادات العامة</CardTitle>
          <CardDescription>تخصيص تجربة استخدامك للتطبيق.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            {/* <div className="flex items-center justify-between border-t pt-4 first:border-t-0 first:pt-0">
                <div>
                    <Label htmlFor="language-select" className="font-medium">لغة التطبيق</Label>
                    <p className="text-sm text-muted-foreground">اختر لغة الواجهة المفضلة لديك.</p>
                </div>
                <Select
                    value={general.language}
                    onValueChange={(value: 'ar' | 'en') => setGeneral(p => p && ({...p, language: value}))}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="اختر لغة" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ar">العربية</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                </Select>
            </div> */}
            {/* <div className="flex items-center justify-between border-t pt-4">
                <div>
                    <Label htmlFor="theme-select" className="font-medium">مظهر التطبيق</Label>
                    <p className="text-sm text-muted-foreground">اختر بين المظهر الفاتح أو الداكن.</p>
                </div>
                 <Select
                    value={general.theme}
                    onValueChange={(value: 'light' | 'dark') => setGeneral(p => p && ({...p, theme: value}))}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="اختر مظهراً" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="light">فاتح (Light)</SelectItem>
                        <SelectItem value="dark">داكن (Dark)</SelectItem>
                    </SelectContent>
                </Select>
            </div> */}
            <SettingRow
                id="disable_listing_comments"
                label="تعطيل التعليقات على إعلاناتي"
                description="منع المستخدمين من إضافة تعليقات جديدة على جميع إعلاناتك."
                checked={general.disable_listing_comments}
                onCheckedChange={(v) => setGeneral(p => p && ({...p, disable_listing_comments: v}))}
            />
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="ml-auto" onClick={() => handleSave('general')} disabled={updateSettingsMutation.isPending}>
            {updateSettingsMutation.isPending ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Save className="ml-2 h-4 w-4" />}
            حفظ الإعدادات العامة
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}