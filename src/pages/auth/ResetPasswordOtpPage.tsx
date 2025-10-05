import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Eye, EyeOff, KeyRound } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { authAPI } from '@/services/apis';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export default function ResetPasswordOtpPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const [phone, setPhone] = useState(location.state?.phone || '');
  const [otpCode, setOtpCode] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (!location.state?.phone) {
      toast({ variant: 'destructive', title: 'خطأ', description: 'رقم الهاتف غير موجود. يرجى البدء من صفحة "نسيت كلمة المرور".'});
      navigate('/auth/forgot-password-phone', { replace: true });
    }
    setPhone(location.state.phone);
  }, [location.state, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !otpCode || !password || !passwordConfirmation) {
      toast({ variant: 'destructive', title: 'خطأ', description: 'يرجى ملء جميع الحقول.' });
      return;
    }
    if (password !== passwordConfirmation) {
      toast({ variant: 'destructive', title: 'خطأ', description: 'كلمتا المرور غير متطابقتين.' });
      return;
    }

    setIsPending(true);
    try {
      // **UPDATED API CALL**
      const response = await authAPI.resetPasswordWithOtp({
        phone,
        otp_code: otpCode,
        password,
        password_confirmation: passwordConfirmation,
      });

      if (response.success !== false) { 
        toast({
          title: 'نجاح',
          description: response.message || 'تم تغيير كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول.',
        });
        navigate('/auth/login');
      } else {
        toast({
          variant: 'destructive',
          title: 'فشل',
          description: response.message || 'حدث خطأ ما. يرجى التحقق من الرمز أو طلب رمز جديد.',
        });
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'خطأ في الشبكة',
        description: error.message || 'فشل في إعادة تعيين كلمة المرور.',
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <KeyRound className="mx-auto h-10 w-10 text-primary mb-2" />
            <CardTitle className="text-2xl">إعادة تعيين كلمة المرور</CardTitle>
            <CardDescription>
              أدخل رقم هاتفك، الرمز الذي تلقيته (OTP)، وكلمة المرور الجديدة.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">رقم الهاتف</Label>
                <Input id="phone" type="tel" placeholder="+963912345678" value={phone} onChange={(e) => setPhone(e.target.value)} required dir="ltr" disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="otpCode">رمز التحقق (OTP)</Label>
                <Input id="otpCode" type="text" placeholder="أدخل الرمز المكون من 6 أرقام" value={otpCode} onChange={(e) => setOtpCode(e.target.value)} required dir="ltr" maxLength={6} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">كلمة المرور الجديدة</Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  <Button type="button" variant="ghost" size="icon" className="absolute left-0 top-0 h-full" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="passwordConfirmation">تأكيد كلمة المرور الجديدة</Label>
                 <div className="relative">
                  <Input id="passwordConfirmation" type={showPasswordConfirmation ? 'text' : 'password'} placeholder="••••••••" value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} required />
                  <Button type="button" variant="ghost" size="icon" className="absolute left-0 top-0 h-full" onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}>
                    {showPasswordConfirmation ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? <><Loader2 className="ml-2 h-4 w-4 animate-spin" /> جاري إعادة التعيين...</> : 'إعادة تعيين كلمة المرور'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}