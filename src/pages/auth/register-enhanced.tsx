import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useApiErrorHandler } from '@/hooks/use-api-error-handler';
import { FieldError } from '@/components/ui/field-error';

interface RegisterFormData {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export default function RegisterEnhanced() {
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();
  const { handleApiError, handleApiSuccess } = useApiErrorHandler();
  
  const [formData, setFormData] = useState<RegisterFormData>({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    password: '',
    password_confirmation: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (field: keyof RegisterFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'الاسم الأول مطلوب';
    }
    
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'الاسم الأخير مطلوب';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'رقم الهاتف مطلوب';
    } else if (!/^[0-9+\-\s]+$/.test(formData.phone)) {
      newErrors.phone = 'رقم الهاتف غير صحيح';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'البريد الإلكتروني مطلوب';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'البريد الإلكتروني غير صحيح';
    }
    
    if (!formData.password) {
      newErrors.password = 'كلمة المرور مطلوبة';
    } else if (formData.password.length < 8) {
      newErrors.password = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل';
    }
    
    if (!formData.password_confirmation) {
      newErrors.password_confirmation = 'تأكيد كلمة المرور مطلوب';
    } else if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = 'كلمة المرور غير متطابقة';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      const response = await register(formData);
      handleApiSuccess(response);
      navigate('/auth/verify-email');
    } catch (error) {
      handleApiError(error, setErrors);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">إنشاء حساب جديد</CardTitle>
          <CardDescription className="text-center">
            أدخل بياناتك لإنشاء حساب جديد
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">الاسم الأول</Label>
                <Input
                  id="first_name"
                  type="text"
                  value={formData.first_name}
                  onChange={handleInputChange('first_name')}
                  className={errors.first_name ? 'border-red-500' : ''}
                  disabled={isLoading}
                />
                <FieldError error={errors.first_name} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">الاسم الأخير</Label>
                <Input
                  id="last_name"
                  type="text"
                  value={formData.last_name}
                  onChange={handleInputChange('last_name')}
                  className={errors.last_name ? 'border-red-500' : ''}
                  disabled={isLoading}
                />
                <FieldError error={errors.last_name} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">رقم الهاتف</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange('phone')}
                className={errors.phone ? 'border-red-500' : ''}
                disabled={isLoading}
                placeholder="مثال: +963123456789"
              />
              <FieldError error={errors.phone} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange('email')}
                className={errors.email ? 'border-red-500' : ''}
                disabled={isLoading}
                placeholder="name@example.com"
              />
              <FieldError error={errors.email} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange('password')}
                  className={errors.password ? 'border-red-500' : ''}
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute left-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <FieldError error={errors.password} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password_confirmation">تأكيد كلمة المرور</Label>
              <div className="relative">
                <Input
                  id="password_confirmation"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.password_confirmation}
                  onChange={handleInputChange('password_confirmation')}
                  className={errors.password_confirmation ? 'border-red-500' : ''}
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute left-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <FieldError error={errors.password_confirmation} />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  جاري إنشاء الحساب...
                </>
              ) : (
                'إنشاء حساب'
              )}
            </Button>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">
                لديك حساب بالفعل؟{' '}
              </span>
              <Link 
                to="/auth/login" 
                className="font-medium text-primary hover:underline"
              >
                تسجيل الدخول
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}