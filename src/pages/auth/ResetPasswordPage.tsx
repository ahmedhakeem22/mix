import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Eye, EyeOff, KeyRound } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { authAPI } from '@/services/apis'; // Ensure this is the correct import
import { ThemeToggle } from '@/components/ui/theme-toggle';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const [email, setEmail] = useState(location.state?.email || '');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (location.state?.email && !email) { // Only set if email is not already set or different
      setEmail(location.state.email);
    }
  }, [location.state, email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !token || !password || !passwordConfirmation) {
      toast({ variant: 'destructive', title: 'خطأ', description: 'يرجى ملء جميع الحقول.' });
      return;
    }
    if (password !== passwordConfirmation) {
      toast({ variant: 'destructive', title: 'خطأ', description: 'كلمتا المرور غير متطابقتين.' });
      return;
    }
    if (password.length < 6) {
      toast({ variant: 'destructive', title: 'خطأ', description: 'يجب أن تكون كلمة المرور 6 أحرف على الأقل.' });
      return;
    }

    setIsPending(true);
    try {
      const response = await authAPI.resetPassword({
        token,
        password,
        password_confirmation: passwordConfirmation,
      });

      // Backend sends { message: "..." } on success with HTTP 200, which fetchAPI might return directly.
      // The 'success' property might be undefined if not explicitly set by fetchAPI for non-standard success responses.
      if (response.success !== false && response.message) { 
        toast({
          title: 'نجاح',
          description: response.message || 'تم تغيير كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول.',
        });
        navigate('/auth/login');
      } else {
        toast({
          variant: 'destructive',
          title: 'فشل',
          description: response.message || 'حدث خطأ ما. يرجى التحقق من الرمز والبريد الإلكتروني أو طلب رمز جديد.',
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
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <KeyRound className="mx-auto h-10 w-10 text-primary mb-2" />
            <CardTitle className="text-2xl">إعادة تعيين كلمة المرور</CardTitle>
            <CardDescription>
              أدخل بريدك الإلكتروني، الرمز الذي تلقيته، وكلمة المرور الجديدة.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input
                  id="email" type="email" placeholder="example@example.com"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  required dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="token">رمز التحقق (من البريد الإلكتروني)</Label>
                <Input
                  id="token" type="text" placeholder="أدخل الرمز المكون من 6 أرقام"
                  value={token} onChange={(e) => setToken(e.target.value)}
                  required dir="ltr" maxLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">كلمة المرور الجديدة</Label>
                <div className="relative">
                  <Input
                    id="password" type={showPassword ? 'text' : 'password'}
                    placeholder="أدخل كلمة المرور الجديدة"
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button type="button" variant="ghost" size="icon" className="absolute left-0 top-0 h-full" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="passwordConfirmation">تأكيد كلمة المرور الجديدة</Label>
                 <div className="relative">
                  <Input
                    id="passwordConfirmation" type={showPasswordConfirmation ? 'text' : 'password'}
                    placeholder="أعد إدخال كلمة المرور الجديدة"
                    value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)}
                    required
                  />
                  <Button type="button" variant="ghost" size="icon" className="absolute left-0 top-0 h-full" onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}>
                    {showPasswordConfirmation ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? (
                  <><Loader2 className="ml-2 h-4 w-4 animate-spin" /> جاري إعادة التعيين...</>
                ) : ( 'إعادة تعيين كلمة المرور' )}
              </Button>
              <div className="text-center text-sm text-muted-foreground">
                <Link to="/auth/login" className="text-primary hover:underline">
                  العودة إلى تسجيل الدخول
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}