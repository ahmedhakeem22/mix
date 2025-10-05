import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { MobileNav } from '@/components/layout/mobile-nav';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Settings,
  Bell,
  Moon,
  Sun,
  Laptop,
  Shield,
  Trash2,
  Save,
  Key,
  Mail,
  Phone,
  Clock,
  Globe,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('ar');
  const [isLoading, setIsLoading] = useState(false);
  
  const saveSettings = () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      
      toast({
        title: 'تم حفظ الإعدادات',
        description: 'تم حفظ إعداداتك بنجاح',
      });
    }, 1000);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pb-20 md:pb-0">
        <div className="bg-gray-50 border-b border-border">
          <div className="container px-4 mx-auto py-6">
            <h1 className="text-2xl font-bold">الإعدادات</h1>
            <p className="text-muted-foreground">إدارة إعدادات حسابك والتطبيق</p>
          </div>
        </div>
        
        <div className="container px-4 mx-auto py-6">
          <div className="max-w-4xl mx-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="general" className="flex items-center">
                  <Settings className="ml-2 h-4 w-4" />
                  <span className="hidden md:inline">عام</span>
                </TabsTrigger>
                <TabsTrigger value="notifications" className="flex items-center">
                  <Bell className="ml-2 h-4 w-4" />
                  <span className="hidden md:inline">الإشعارات</span>
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center">
                  <Shield className="ml-2 h-4 w-4" />
                  <span className="hidden md:inline">الأمان</span>
                </TabsTrigger>
                <TabsTrigger value="account" className="flex items-center">
                  <Trash2 className="ml-2 h-4 w-4" />
                  <span className="hidden md:inline">الحساب</span>
                </TabsTrigger>
              </TabsList>
              
              {/* General Settings */}
              <TabsContent value="general">
                <Card>
                  <CardHeader>
                    <CardTitle>الإعدادات العامة</CardTitle>
                    <CardDescription>
                      إدارة إعدادات التطبيق العامة
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-3">المظهر</h3>
                      <div className="grid grid-cols-3 gap-3">
                        <div 
                          className={`border rounded-lg p-3 text-center cursor-pointer transition-all hover:border-brand ${theme === 'light' ? 'border-brand bg-brand/5' : ''}`}
                          onClick={() => setTheme('light')}
                        >
                          <Sun className="mx-auto h-6 w-6 mb-2" />
                          <span>فاتح</span>
                        </div>
                        <div 
                          className={`border rounded-lg p-3 text-center cursor-pointer transition-all hover:border-brand ${theme === 'dark' ? 'border-brand bg-brand/5' : ''}`}
                          onClick={() => setTheme('dark')}
                        >
                          <Moon className="mx-auto h-6 w-6 mb-2" />
                          <span>داكن</span>
                        </div>
                        <div 
                          className={`border rounded-lg p-3 text-center cursor-pointer transition-all hover:border-brand ${theme === 'system' ? 'border-brand bg-brand/5' : ''}`}
                          onClick={() => setTheme('system')}
                        >
                          <Laptop className="mx-auto h-6 w-6 mb-2" />
                          <span>تلقائي</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-3">اللغة</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div 
                          className={`border rounded-lg p-3 text-center cursor-pointer transition-all hover:border-brand ${language === 'ar' ? 'border-brand bg-brand/5' : ''}`}
                          onClick={() => setLanguage('ar')}
                        >
                          <Globe className="mx-auto h-6 w-6 mb-2" />
                          <span>العربية</span>
                        </div>
                        <div 
                          className={`border rounded-lg p-3 text-center cursor-pointer transition-all hover:border-brand ${language === 'en' ? 'border-brand bg-brand/5' : ''}`}
                          onClick={() => setLanguage('en')}
                        >
                          <Globe className="mx-auto h-6 w-6 mb-2" />
                          <span>English</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-3">إعدادات العرض</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">عرض الإعلانات بالقرب مني</p>
                            <p className="text-sm text-muted-foreground">
                              عرض الإعلانات القريبة من موقعك الحالي
                            </p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">عرض أسعار العملات</p>
                            <p className="text-sm text-muted-foreground">
                              عرض أسعار العملات بجانب الأسعار
                            </p>
                          </div>
                          <Switch />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">تخزين مؤقت للصور</p>
                            <p className="text-sm text-muted-foreground">
                              تخزين الصور مؤقتًا لتسريع التحميل وتوفير البيانات
                            </p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="ml-auto" onClick={saveSettings} disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                          جاري الحفظ...
                        </>
                      ) : (
                        <>
                          <Save className="ml-2 h-4 w-4" />
                          حفظ الإعدادات
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              {/* Notifications Settings */}
              <TabsContent value="notifications">
                <Card>
                  <CardHeader>
                    <CardTitle>إعدادات الإشعارات</CardTitle>
                    <CardDescription>
                      تحكم في الإشعارات التي ترغب في تلقيها
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-3">إشعارات التطبيق</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">الإشعارات العامة</p>
                            <p className="text-sm text-muted-foreground">
                              تمكين أو تعطيل جميع الإشعارات
                            </p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">الرسائل الجديدة</p>
                            <p className="text-sm text-muted-foreground">
                              إشعار عند استلام رسالة جديدة
                            </p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">التعليقات على إعلاناتي</p>
                            <p className="text-sm text-muted-foreground">
                              إشعار عند تعليق شخص ما على إعلاناتك
                            </p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">إعلاناتي</p>
                            <p className="text-sm text-muted-foreground">
                              إشعارات حول حالة إعلاناتك وتحديثاتها
                            </p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-3">إشعارات البريد الإلكتروني</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">ملخص أسبوعي</p>
                            <p className="text-sm text-muted-foreground">
                              ملخص أسبوعي لنشاط حسابك
                            </p>
                          </div>
                          <Switch />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">الإعلانات الجديدة</p>
                            <p className="text-sm text-muted-foreground">
                              إشعار بالإعلانات الجديدة المطابقة لاهتماماتك
                            </p>
                          </div>
                          <Switch />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">العروض والتخفيضات</p>
                            <p className="text-sm text-muted-foreground">
                              إشعارات حول العروض والتخفيضات
                            </p>
                          </div>
                          <Switch />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-3">إشعارات الهاتف</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">الرسائل النصية</p>
                            <p className="text-sm text-muted-foreground">
                              تلقي إشعارات عبر الرسائل النصية
                            </p>
                          </div>
                          <Switch />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="ml-auto" onClick={saveSettings} disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                          جاري الحفظ...
                        </>
                      ) : (
                        <>
                          <Save className="ml-2 h-4 w-4" />
                          حفظ الإعدادات
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              {/* Security Settings */}
              <TabsContent value="security">
                <Card>
                  <CardHeader>
                    <CardTitle>إعدادات الأمان</CardTitle>
                    <CardDescription>
                      إدارة إعدادات الأمان والخصوصية لحسابك
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-3">طرق تسجيل الدخول</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Key className="h-5 w-5 text-muted-foreground ml-3" />
                            <div>
                              <p className="font-medium">كلمة المرور</p>
                              <p className="text-sm text-muted-foreground">
                                تم التحديث قبل شهرين
                              </p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            تغيير
                          </Button>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Phone className="h-5 w-5 text-muted-foreground ml-3" />
                            <div>
                              <p className="font-medium">رقم الهاتف</p>
                              <p className="text-sm text-muted-foreground">
                                +966 5X XXX XXXX
                              </p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            تحديث
                          </Button>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Mail className="h-5 w-5 text-muted-foreground ml-3" />
                            <div>
                              <p className="font-medium">البريد الإلكتروني</p>
                              <p className="text-sm text-muted-foreground">
                                us***@example.com
                              </p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            تحديث
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-3">جلسات تسجيل الدخول</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Laptop className="h-5 w-5 text-muted-foreground ml-3" />
                            <div>
                              <p className="font-medium">هذا الجهاز</p>
                              <p className="text-sm text-muted-foreground">
                                Chrome على Windows
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 text-green-500 ml-2" />
                            <span className="text-sm text-green-500">نشط الآن</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Laptop className="h-5 w-5 text-muted-foreground ml-3" />
                            <div>
                              <p className="font-medium">جهاز آخر</p>
                              <p className="text-sm text-muted-foreground">
                                Safari على iPhone
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 text-muted-foreground ml-2" />
                            <span className="text-sm text-muted-foreground">منذ يومين</span>
                          </div>
                        </div>
                      </div>
                      
                      <Button variant="outline" className="mt-4" size="sm">
                        تسجيل الخروج من جميع الأجهزة الأخرى
                      </Button>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-3">الخصوصية</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">إظهار رقم الهاتف للمشترين</p>
                            <p className="text-sm text-muted-foreground">
                              السماح للمشترين برؤية رقم هاتفك في إعلاناتك
                            </p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">تفعيل التتبع الجغرافي</p>
                            <p className="text-sm text-muted-foreground">
                              السماح للتطبيق بتحديد موقعك لعرض الإعلانات القريبة
                            </p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">مشاركة بيانات الاستخدام</p>
                            <p className="text-sm text-muted-foreground">
                              مشاركة بيانات استخدامك لتحسين التطبيق
                            </p>
                          </div>
                          <Switch />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="ml-auto" onClick={saveSettings} disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                          جاري الحفظ...
                        </>
                      ) : (
                        <>
                          <Save className="ml-2 h-4 w-4" />
                          حفظ الإعدادات
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              {/* Account Settings */}
              <TabsContent value="account">
                <Card>
                  <CardHeader>
                    <CardTitle>إعدادات الحساب</CardTitle>
                    <CardDescription>
                      إدارة حسابك وإعدادات الخصوصية
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h3 className="text-lg font-medium text-red-700 mb-2">حذف الحساب</h3>
                      <p className="text-sm text-red-600 mb-4">
                        حذف حسابك سيؤدي إلى إزالة جميع بياناتك وإعلاناتك ومحادثاتك بشكل نهائي.
                        هذا الإجراء لا يمكن التراجع عنه.
                      </p>
                      <Button variant="destructive">
                        <Trash2 className="ml-2 h-4 w-4" />
                        حذف حسابي نهائيًا
                      </Button>
                    </div>
                    
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h3 className="text-lg font-medium text-yellow-700 mb-2">تعطيل الحساب مؤقتًا</h3>
                      <p className="text-sm text-yellow-600 mb-4">
                        تعطيل حسابك يخفي ملفك الشخصي وإعلاناتك مؤقتًا، ويمكنك إعادة تفعيله في أي وقت.
                      </p>
                      <Button variant="outline" className="border-yellow-300 text-yellow-700 hover:bg-yellow-100 hover:text-yellow-800">
                        تعطيل الحساب مؤقتًا
                      </Button>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-3">تصدير البيانات</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        يمكنك تصدير نسخة من بياناتك الشخصية وإعلاناتك ومحادثاتك بصيغة JSON أو CSV.
                      </p>
                      <div className="flex space-x-2 space-x-reverse">
                        <Button variant="outline">
                          تصدير بصيغة JSON
                        </Button>
                        <Button variant="outline">
                          تصدير بصيغة CSV
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      
      <Footer />
      <MobileNav />
    </div>
  );
}
