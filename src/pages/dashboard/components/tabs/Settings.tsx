import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings as SettingsIcon, Key } from 'lucide-react'; // تم تغيير اسم `Settings` المستورد لتجنب التعارض

// استيراد مكونات التابات الفرعية من مساراتها الصحيحة
// افترضت أنك ستنشئ مجلدًا لهذه المكونات أيضًا
import { SecurityTab } from './SecurityTab';
import { PreferencesTab } from './PreferencesTab';

interface SettingsProps {
  title: string;
  description: string;
}

// تم تغيير اسم المكون ليطابق اسم الملف وهو `Settings`
// وهو يستخدم التصدير الافتراضي ليتوافق مع `DashboardContent`
export default function Settings({ title, description }: SettingsProps) {
  // الحالة الداخلية للمكون لإدارة التابات (الأمان أو التفضيلات)
  const [activeTab, setActiveTab] = useState('security');

  return (
    // تم حذف `Header`, `Footer`, `MobileNav` لأنها جزء من الصفحة الرئيسية للوحة التحكم
    // تم حذف `min-h-screen` لأن المكون الآن جزء من حاوية أكبر
    <div>
      {/* 
        تم حذف الترويسة العلوية لأن `DashboardContent` قد يعرض ترويسة خاصة به.
        إذا أردت الاحتفاظ بها، يمكنك إلغاء التعليق عنها.
      */}
      {/* 
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
      */}

      {/* 
        الكود الخاص بالتابات تم نقله كما هو لأنه يعمل بشكل مستقل.
        لا حاجة لـ `max-w-4xl` أو `mx-auto` لأن التوسيط يتم من خلال الصفحة الأم.
      */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="security">
            <Key className="ml-2 h-4 w-4" /> الأمان والخصوصية
          </TabsTrigger>
          <TabsTrigger value="preferences">
            <SettingsIcon className="ml-2 h-4 w-4" /> التفضيلات
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="security">
          {/* تأكد من أن هذا المكون موجود في المسار الصحيح */}
          <SecurityTab />
        </TabsContent>
        
        <TabsContent value="preferences">
          {/* تأكد من أن هذا المكون موجود في المسار الصحيح */}
          <PreferencesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}