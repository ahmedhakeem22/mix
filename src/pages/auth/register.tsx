import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRegister } from '@/hooks/use-api';
import { useAllCities, useStates } from '@/hooks/use-api';
import { isAuthenticated } from '@/services/api';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: states, isLoading: loadingStates } = useStates();
  const { data: cities, isLoading: loadingCities } = useAllCities();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [stateId, setStateId] = useState<number | null>(null);
  const [cityId, setCityId] = useState<number | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  
  const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({});
  
  const errorTranslations: Record<string, string> = {
    'The first name field is required.': 'حقل الاسم الأول مطلوب',
    'The first name must not exceed 255 characters.': 'يجب ألا يتجاوز الاسم الأول 255 حرفاً',
    'The last name field is required.': 'حقل الاسم الأخير مطلوب',
    'The last name must not exceed 255 characters.': 'يجب ألا يتجاوز الاسم الأخير 255 حرفاً',
    'The email field is required.': 'حقل البريد الإلكتروني مطلوب',
    'The email must be a valid email address.': 'يجب أن يكون البريد الإلكتروني صالحاً',
    'The email has already been taken.': 'البريد الإلكتروني مستخدم بالفعل',
    'The phone field is required.': 'حقل رقم الهاتف مطلوب',
    'The phone has already been taken.': 'رقم الهاتف مستخدم بالفعل',
    'The city field is required.': 'حقل المدينة مطلوب',
    'The selected city is invalid.': 'المدينة المختارة غير صالحة',
    'The state field is required.': 'حقل المنطقة مطلوب',
    'The selected state is invalid.': 'المنطقة المختارة غير صالحة',
    'The password field is required.': 'حقل كلمة المرور مطلوب',
    'The password must be at least 8 characters.': 'يجب أن تكون كلمة المرور 8 أحرف على الأقل',
    'The password confirmation does not match.': 'كلمات المرور غير متطابقة',
    
    // أخطاء خاصة بالمنطقة والمدينة
    'The city id field is required.': 'حقل المدينة مطلوب',
    'The state id field is required.': 'حقل المنطقة مطلوب',
    'The selected city id is invalid.': 'المدينة المختارة غير صالحة',
    'The selected state id is invalid.': 'المنطقة المختارة غير صالحة',
    
    // أخطاء إضافية
    'The username field is required.': 'حقل اسم المستخدم مطلوب',
    'The username has already been taken.': 'اسم المستخدم مستخدم بالفعل',
  };
  
  // ترجمة رسالة الخطأ
  const translateError = (error: string): string => {
    return errorTranslations[error] || error;
  };
  
  // Filter cities based on selected state
  const filteredCities = stateId 
    ? cities?.filter(city => city.state_id === stateId)
    : [];
  
  // Check if already authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);
  
  // Register mutation
  const registerMutation = useRegister();
  
  // Handle phone number input - only allow 9 digits
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    if (value.length <= 9) {
      setPhone(value);
    }
  };
  
  // Format phone number for display
  const formatPhoneDisplay = (phoneNumber: string) => {
    if (!phoneNumber) return '';
    
    // Add spacing for better readability
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
    setServerErrors({}); // Reset server errors
    
    // Validate inputs
    //  Email validation removed from here as it's now optional
    if (!firstName || !lastName || !phone || !password || !confirmPassword || !stateId || !cityId) {
      toast({
        variant: 'destructive',
        title: 'خطأ في البيانات',
        description: 'يرجى ملء جميع الحقول المطلوبة',
      });
      return;
    }
    
    // Validate phone number length
    if (phone.length !== 9) {
      toast({
        variant: 'destructive',
        title: 'رقم هاتف غير صحيح',
        description: 'يجب أن يكون رقم الهاتف 9 أرقام بالضبط',
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'كلمات المرور غير متطابقة',
        description: 'يرجى التأكد من تطابق كلمات المرور',
      });
      return;
    }
    
    if (password.length < 8) {
      toast({
        variant: 'destructive',
        title: 'كلمة المرور ضعيفة',
        description: 'يجب أن تكون كلمة المرور 8 أحرف على الأقل',
      });
      return;
    }
    
    if (!agreeTerms) {
      toast({
        variant: 'destructive',
        title: 'الموافقة على الشروط',
        description: 'يجب الموافقة على شروط الاستخدام وسياسة الخصوصية',
      });
      return;
    }
    
    try {
      await registerMutation.mutateAsync({
        first_name: firstName,
        last_name: lastName,
        email, // Will be sent as an empty string if not provided
        phone: `963${phone}`, // Add 963 prefix when sending to server
        password,
        password_confirmation: confirmPassword,
        city_id: cityId,
        state_id: stateId
      });
      
      // Redirect to dashboard
     toast({
        title: 'تم إنشاء الحساب بنجاح',
        description: 'الخطوة التالية: تفعيل رقم هاتفك.',
      });

      // الانتقال إلى صفحة تفعيل الهاتف مع تمرير الرقم
      navigate('/auth/verify-phone', {
        state: { phone: `963${phone}` }, // نمرر رقم الهاتف بالصيغة الدولية
        replace: true,
      });
    } catch (error: any) {

      console.log("Registration error:", error);
      console.log("Registration error:", error?.response?.data?.errors);

      // Handle validation errors from server
      if (error?.response?.data?.errors) {
        console.log("Registration error:", error?.response?.data?.errors);
        setServerErrors(error.response.data.errors);
        
        // Show general error message
        if (error.response.data.errors.email || error.response.data.errors.phone) {
          toast({
            variant: 'destructive',
            title: 'معلومات مستخدم مسجلة مسبقأ',
            description: 'البريد الإلكتروني أو رقم الهاتف مستخدم بالفعل',
          });
        }
      } else {
        toast({
          variant: 'destructive',
          title: 'خطأ غير متوقع',
          description: 'حدث خطأ أثناء إنشاء الحساب',
        });
      }
    }
  };
  
  // Helper to get translated error message for a field
  const getTranslatedFieldError = (field: string) => {
    const error = serverErrors[field]?.[0] || '';
    return error ? translateError(error) : '';
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">إنشاء حساب جديد</CardTitle>
            <CardDescription>
              أدخل بياناتك لإنشاء حساب جديد
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">الاسم الأول*</Label>
                  <Input
                    id="firstName"
                    placeholder="الاسم الأول"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={getTranslatedFieldError('first_name') ? 'border-red-500' : ''}
                  />
                  {getTranslatedFieldError('first_name') && (
                    <p className="text-red-500 text-sm">{getTranslatedFieldError('first_name')}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">الاسم الأخير*</Label>
                  <Input
                    id="lastName"
                    placeholder="الاسم الأخير"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className={getTranslatedFieldError('last_name') ? 'border-red-500' : ''}
                  />
                  {getTranslatedFieldError('last_name') && (
                    <p className="text-red-500 text-sm">{getTranslatedFieldError('last_name')}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني (اختياري)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="أدخل البريد الإلكتروني (اختياري)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={getTranslatedFieldError('email') ? 'border-red-500' : ''}
                />
                {getTranslatedFieldError('email') && (
                  <p className="text-red-500 text-sm">{getTranslatedFieldError('email')}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">رقم الهاتف*</Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground font-medium">
                    +963
                  </div>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="9 أرقام (مثال: 987654321)"
                    value={formatPhoneDisplay(phone)}
                    onChange={handlePhoneChange}
                    className={`pl-16 ${getTranslatedFieldError('phone') ? 'border-red-500' : ''}`}
                    maxLength={11} // Allow for spaces in formatted display
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>رقم هاتف سوري صالح</span>
                  <span className={phone.length === 9 ? 'text-green-600' : 'text-orange-500'}>
                    {phone.length}/9 أرقام
                  </span>
                </div>
                {getTranslatedFieldError('phone') && (
                  <p className="text-red-500 text-sm">{getTranslatedFieldError('phone')}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">المنطقة / المحافظة*</Label>
                <Select 
                  value={stateId?.toString()} 
                  onValueChange={(value) => {
                    setStateId(parseInt(value, 10));
                    setCityId(null);
                  }}
                >
                  <SelectTrigger 
                    id="state" 
                    className={getTranslatedFieldError('state_id') || getTranslatedFieldError('state') ? 'border-red-500' : ''}
                  >
                    <SelectValue placeholder="اختر المنطقة / المحافظة" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingStates ? (
                      <div className="p-2 text-center text-sm text-muted-foreground">
                        جاري التحميل...
                      </div>
                    ) : (
                      states?.map((state) => (
                        <SelectItem key={state.id} value={state.id.toString()}>
                          {state.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {(getTranslatedFieldError('state_id') || getTranslatedFieldError('state')) && (
                  <p className="text-red-500 text-sm">
                    {getTranslatedFieldError('state_id') || getTranslatedFieldError('state')}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">المنطقة*</Label>
                <Select 
                  value={cityId?.toString()} 
                  onValueChange={(value) => setCityId(parseInt(value, 10))}
                  disabled={!stateId}
                >
                  <SelectTrigger 
                    id="city"
                    className={getTranslatedFieldError('city_id') || getTranslatedFieldError('city') ? 'border-red-500' : ''}
                  >
                    <SelectValue placeholder={stateId ? "اختر المدينة" : "اختر المنطقة أولاً"} />
                  </SelectTrigger>
                  <SelectContent>
                    {!stateId ? (
                      <div className="p-2 text-center text-sm text-muted-foreground">
                        الرجاء اختيار المنطقة أولاً
                      </div>
                    ) : loadingCities ? (
                      <div className="p-2 text-center text-sm text-muted-foreground">
                        جاري التحميل...
                      </div>
                    ) : filteredCities?.length === 0 ? (
                      <div className="p-2 text-center text-sm text-muted-foreground">
                        لا توجد مدن متوفرة
                      </div>
                    ) : (
                      filteredCities?.map((city) => (
                        <SelectItem key={city.id} value={city.id.toString()}>
                          {city.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {(getTranslatedFieldError('city_id') || getTranslatedFieldError('city')) && (
                  <p className="text-red-500 text-sm">
                    {getTranslatedFieldError('city_id') || getTranslatedFieldError('city')}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">كلمة المرور*</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="أدخل كلمة المرور (8 أحرف على الأقل)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={getTranslatedFieldError('password') ? 'border-red-500' : ''}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute left-0 top-0 h-full"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {getTranslatedFieldError('password') && (
                  <p className="text-red-500 text-sm">{getTranslatedFieldError('password')}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">تأكيد كلمة المرور*</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="أعد إدخال كلمة المرور"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={getTranslatedFieldError('password_confirmation') ? 'border-red-500' : ''}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute left-0 top-0 h-full"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {getTranslatedFieldError('password_confirmation') && (
                  <p className="text-red-500 text-sm">{getTranslatedFieldError('password_confirmation')}</p>
                )}
              </div>

              <div className="flex items-center space-x-2 space-x-reverse">
                <input
                  type="checkbox"
                  id="terms"
                  className="rounded"
                  checked={agreeTerms}
                  onChange={() => setAgreeTerms(!agreeTerms)}
                />
                <Label htmlFor="terms" className="text-sm">
                  أوافق على{' '}
                  <Link to="/terms" className="text-primary hover:underline">
                    شروط الاستخدام
                  </Link>{' '}
                  و{' '}
                  <Link to="/privacy" className="text-primary hover:underline">
                    سياسة الخصوصية
                  </Link>
                </Label>
              </div>
              {getTranslatedFieldError('agreeTerms') && (
                <p className="text-red-500 text-sm">{getTranslatedFieldError('agreeTerms')}</p>
              )}
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    جاري إنشاء الحساب...
                  </>
                ) : (
                  'إنشاء حساب'
                )}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                لديك حساب بالفعل؟{' '}
                <Link to="/auth/login" className="text-primary hover:underline">
                  تسجيل الدخول
                </Link>
              </div>

              <div className="text-center">
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-sm text-muted-foreground"
                  onClick={() => navigate('/')}
                >
                  العودة إلى الصفحة الرئيسية
                </Button>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}