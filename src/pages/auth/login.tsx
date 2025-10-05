import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, EyeOff, Loader2, Mail, Smartphone, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { authAPI } from '@/services/apis';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const auth = useAuth();
  
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isPending, setIsPending] = useState(false);
  
  const from = location.state?.from || '/dashboard';
  
  useEffect(() => {
    if (auth.isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [auth.isAuthenticated, navigate, from]);

  // Handle phone number input - only allow 9 digits and remove leading zero
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    
    // Remove leading zero if present
    if (value.startsWith('0')) {
      value = value.substring(1);
    }
    
    // Limit to 9 digits
    if (value.length <= 9) {
      setPhone(value);
    }
  };

  // Format phone number for display with spaces
  const formatPhoneDisplay = (phoneNumber: string) => {
    if (!phoneNumber) return '';
    
    let formatted = phoneNumber;
    if (phoneNumber.length > 3) {
      formatted = phoneNumber.slice(0, 3) + ' ' + phoneNumber.slice(3);
    }
    if (phoneNumber.length > 6) {
      formatted = phoneNumber.slice(0, 3) + ' ' + phoneNumber.slice(3, 6) + ' ' + phoneNumber.slice(6);
    }
    
    return formatted;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let identifier = '';
    
    if (loginMethod === 'email') {
      if (!email || !password) {
        toast({
          variant: 'destructive',
          title: 'خطأ في البيانات',
          description: 'يرجى ملء جميع الحقول المطلوبة',
        });
        return;
      }
      identifier = email.trim();
    } else {
      if (!phone || !password) {
        toast({
          variant: 'destructive',
          title: 'خطأ في البيانات',
          description: 'يرجى ملء جميع الحقول المطلوبة',
        });
        return;
      }
      
      if (phone.length !== 9) {
        toast({
          variant: 'destructive',
          title: 'رقم هاتف غير صحيح',
          description: 'يجب أن يكون رقم الهاتف 9 أرقام بالضبط (بدون الصفر في البداية)',
        });
        return;
      }
      
      identifier = `963${phone}`;
    }

    setIsPending(true);
    try {
      const response = await authAPI.login(identifier, password, rememberMe);
      
      if (response.success && response.data) {
        auth.handleLoginSuccess(response.data, rememberMe);
        toast({
          title: 'تم تسجيل الدخول بنجاح',
          description: 'مرحباً بعودتك!',
        });
        navigate(from, { replace: true });
      } else {
        toast({
          variant: 'destructive',
          title: 'فشل تسجيل الدخول',
          description: response.message || 'بيانات الاعتماد غير صحيحة.',
        });
      }
    } catch (error: any) {
      console.log('🔍 Login error details:', error);
      const errorResponse = error.response?.data;
      console.log('🔍 Error response:', errorResponse);

      // التحقق من حالة عدم تفعيل رقم الهاتف
      if (errorResponse?.errors?.phone_verification_required || 
          (errorResponse?.message && errorResponse.message.includes('يجب تفعيل الحساب'))) {
        
        console.log('🔍 Phone verification required detected');
        
        toast({
          variant: 'default',
          title: 'الحساب غير مفعل',
          description: errorResponse.message || 'يجب تفعيل رقم هاتفك أولاً للمتابعة.',
        });
        
        // الحصول على رقم الهاتف من الاستجابة
        const userPhone = errorResponse?.errors?.user_phone || errorResponse?.data?.user_phone || '';
        
        console.log('🔍 User phone from response:', userPhone);
        
        navigate('/auth/verify-phone', {
          state: { phone: userPhone },
          replace: true,
        });
        return;
      }

      // معالجة الأخطاء الأخرى
      toast({
        variant: 'destructive',
        title: 'فشل تسجيل الدخول',
        description: errorResponse?.message || 'حدث خطأ غير متوقع. حاول مرة أخرى.',
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4" dir="rtl">
      <div className="w-full max-w-md">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        
        <Card className="shadow-2xl border-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-600">
              <User className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              تسجيل الدخول
            </CardTitle>
            <CardDescription className="text-lg">
              اختر طريقة تسجيل الدخول المفضلة لديك
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <Tabs value={loginMethod} onValueChange={(value) => setLoginMethod(value as 'email' | 'phone')} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                <TabsTrigger 
                  value="email" 
                  className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <Mail className="h-4 w-4" />
                  البريد الإلكتروني
                </TabsTrigger>
                <TabsTrigger 
                  value="phone" 
                  className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <Smartphone className="h-4 w-4" />
                  رقم الهاتف
                </TabsTrigger>
              </TabsList>

              <form onSubmit={handleSubmit} className="space-y-4">
                <TabsContent value="email" className="space-y-4 mt-0">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      البريد الإلكتروني
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="example@domain.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-12 rounded-xl border-2 focus:border-blue-500"
                        dir="ltr"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="phone" className="space-y-4 mt-0">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium">
                      رقم الهاتف
                    </Label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2 text-gray-600 dark:text-gray-400 font-medium">
                        <Smartphone className="h-4 w-4" />
                        <span>+963</span>
                      </div>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="9 أرقام (مثال: 987654321)"
                        value={formatPhoneDisplay(phone)}
                        onChange={handlePhoneChange}
                        className="pl-20 h-12 rounded-xl border-2 focus:border-blue-500"
                        dir="ltr"
                      />
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <div className="text-amber-600 dark:text-amber-400 font-medium">
                        ⚠️ أدخل الرقم بدون الصفر في البداية
                      </div>
                      <div className={`font-medium ${phone.length === 9 ? 'text-green-600' : 'text-orange-500'}`}>
                        {phone.length}/9 أرقام
                      </div>
                    </div>
                    {phone.length > 0 && phone.length !== 9 && (
                      <div className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">
                        يجب أن يكون رقم الهاتف 9 أرقام بالضبط
                      </div>
                    )}
                  </div>
                </TabsContent>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-medium">
                      كلمة المرور
                    </Label>
                    <Button
                      variant="link"
                      className="p-0 h-auto text-xs text-blue-600 hover:text-blue-700"
                      type="button"
                      onClick={() => navigate('/auth/forgot-password-phone')}
                    >
                      نسيت كلمة المرور؟
                    </Button>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="أدخل كلمة المرور"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 rounded-xl border-2 focus:border-blue-500"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-lg"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center space-x-2 space-x-reverse">
                  <input
                    type="checkbox"
                    id="remember"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                  />
                  <Label htmlFor="remember" className="text-sm font-medium mr-2">
                    تذكرني لمدة 30 يوماً
                  </Label>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                      جاري تسجيل الدخول...
                    </>
                  ) : (
                    <>
                      <User className="ml-2 h-5 w-5" />
                      تسجيل الدخول
                    </>
                  )}
                </Button>
              </form>
            </Tabs>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4 pt-6 border-t border-gray-100 dark:border-gray-700">
            <div className="text-center text-sm text-muted-foreground">
              ليس لديك حساب؟{' '}
              <Link to="/auth/register" className="font-medium text-blue-600 hover:text-blue-700 hover:underline">
                إنشاء حساب جديد
              </Link>
            </div>

            <div className="text-center">
              <Button
                variant="link"
                className="p-0 h-auto text-sm text-muted-foreground hover:text-gray-700"
                onClick={() => navigate('/')}
              >
                العودة إلى الصفحة الرئيسية
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}