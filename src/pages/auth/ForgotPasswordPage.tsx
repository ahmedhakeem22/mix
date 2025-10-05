import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { authAPI } from '@/services/apis'; // Ensure this is the correct import for your api service
import { ThemeToggle } from '@/components/ui/theme-toggle';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: 'يرجى إدخال عنوان بريدك الإلكتروني.',
      });
      return;
    }

    setIsPending(true);
    try {
      // Assuming ApiResponse has a 'success' boolean and 'message' string
      const response = await authAPI.requestPasswordResetCode(email);
      if (response.success !== false) { // Check if not explicitly false
        toast({
          title: 'تم الإرسال',
          description: response.message || 'إذا كان بريدك مسجلاً، ستتلقى رمزًا لإعادة تعيين كلمة المرور.',
        });
        setEmailSent(true);
      } else {
        toast({
          variant: 'destructive',
          title: 'فشل الإرسال',
          description: response.message || 'حدث خطأ ما. يرجى المحاولة مرة أخرى.',
        });
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'خطأ في الشبكة',
        description: error.message || 'فشل في إرسال طلب إعادة تعيين كلمة المرور.',
      });
    } finally {
      setIsPending(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md">
          <div className="absolute top-4 right-4">
            <ThemeToggle />
          </div>
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <Mail className="mx-auto h-12 w-12 text-primary" />
              <CardTitle className="text-2xl mt-4">تحقق من بريدك الإلكتروني</CardTitle>
              <CardDescription>
                لقد أرسلنا تعليمات ورمز إعادة تعيين كلمة المرور إلى <strong>{email}</strong> إذا كان هذا الحساب موجودًا.
                <br />
                يرجى استخدام هذا الرمز في صفحة إعادة تعيين كلمة المرور.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button onClick={() => navigate('/auth/reset-password', { state: { email } })}>
                الانتقال إلى صفحة إعادة تعيين كلمة المرور
              </Button>
            </CardContent>
            <CardFooter className="flex flex-col items-center space-y-2">
              <Button variant="link" onClick={() => setEmailSent(false)}>
                لم أستلم الرمز؟ أعد الإرسال
              </Button>
              <Button variant="link" onClick={() => navigate('/auth/login')}>
                العودة إلى تسجيل الدخول
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
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">نسيت كلمة المرور؟</CardTitle>
            <CardDescription>
              لا تقلق! أدخل بريدك الإلكتروني وسنرسل لك رمزًا لإعادة تعيينها.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  dir="ltr"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    جاري الإرسال...
                  </>
                ) : (
                  'إرسال رمز إعادة التعيين'
                )}
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