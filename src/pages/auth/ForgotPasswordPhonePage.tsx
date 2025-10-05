import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Smartphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { authAPI } from '@/services/apis';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export default function ForgotPasswordPhonePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [phone, setPhone] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // **-- بداية التعديلات --**
    const cleanedPhone = phone.replace(/\D/g, '');

    if (cleanedPhone.length !== 9) {
      toast({
        variant: 'destructive',
        title: 'رقم الهاتف غير صحيح',
        description: 'يجب أن يتكون رقم الهاتف من 9 أرقام بالضبط (بدون الصفر في البداية).',
      });
      return;
    }

    const fullPhoneNumber = `963${cleanedPhone}`;
    // **-- نهاية التعديلات --**

    setIsPending(true);
    try {
      const response = await authAPI.sendPasswordResetOtp({ phone: fullPhoneNumber }); // <-- إرسال الرقم الكامل
      if (response.success !== false) {
        toast({
          title: 'تم الإرسال',
          description: response.message || 'إذا كان رقمك مسجلاً، ستتلقى رمزًا لإعادة تعيين كلمة المرور.',
        });
        setOtpSent(true);
      } else {
        toast({ variant: 'destructive', title: 'فشل الإرسال', description: response.message || 'حدث خطأ ما.' });
      }
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'خطأ في الشبكة', description: error.message || 'فشل إرسال الطلب.' });
    } finally {
      setIsPending(false);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = value.replace(/\D/g, '');
    if (numericValue.length <= 9) {
      setPhone(numericValue);
    }
  };

  if (otpSent) {
    // ... (هذا الجزء يبقى كما هو)
    const fullPhoneNumber = `963${phone.replace(/\D/g, '')}`;
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <Smartphone className="mx-auto h-12 w-12 text-primary" />
              <CardTitle className="text-2xl mt-4">تحقق من رسائلك</CardTitle>
              <CardDescription>
                لقد أرسلنا رمز إعادة تعيين كلمة المرور إلى <strong dir="ltr">{fullPhoneNumber}</strong> إذا كان هذا الحساب موجودًا.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button onClick={() => navigate('/auth/reset-password-otp', { state: { phone: fullPhoneNumber } })}>
                لدي الرمز، المتابعة لإعادة التعيين
              </Button>
            </CardContent>
            <CardFooter className="flex flex-col items-center space-y-2">
               <Button variant="link" onClick={() => setOtpSent(false)}>
                أدخلت رقماً خاطئاً؟
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">نسيت كلمة المرور؟</CardTitle>
            <CardDescription>
              أدخل رقم هاتفك وسنرسل لك رمزًا (OTP) لإعادة تعيينها.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">رقم الهاتف</Label>
                <div className="flex items-center" dir="ltr">
                    <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md dark:bg-gray-600 dark:text-gray-400 dark:border-gray-600">
                      963+
                    </span>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="912345678"
                      value={phone}
                      onChange={handlePhoneChange} // استخدام الدالة المعالجة
                      className="rounded-l-none"
                    />
                </div>
                <p className="text-xs text-muted-foreground mt-1">أدخل 9 أرقام بدون الصفر في البداية.</p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? <><Loader2 className="ml-2 h-4 w-4 animate-spin" /> جاري الإرسال...</> : 'إرسال رمز إعادة التعيين'}
              </Button>
              <div className="text-center text-sm text-muted-foreground">
                تذكرت كلمة المرور؟{' '}
                <Link to="/auth/login" className="text-primary hover:underline">
                  تسجيل الدخول
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}