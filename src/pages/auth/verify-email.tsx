
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useToast } from '@/hooks/use-toast';
import { verificationAPI } from '@/services/verification-api';
import { TokenManager } from '@/services/apis';
import { Loader2, Mail, ArrowRight, Clock } from 'lucide-react';

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [attemptsRemaining, setAttemptsRemaining] = useState(5);
  
  // Get email from location state (passed from registration)
  const email = location.state?.email || '';
  
  // Redirect if no email provided
  useEffect(() => {
    if (!email) {
      navigate('/auth/register', { replace: true });
    }
  }, [email, navigate]);

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleVerifyEmail = async () => {
    if (verificationCode.length !== 6) {
      toast({
        variant: 'destructive',
        title: 'رمز التحقق غير مكتمل',
        description: 'يرجى إدخال رمز التحقق كاملاً (6 أرقام)',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await verificationAPI.verifyEmail(email, verificationCode);
      
      if (response.success && response.data?.token) {
        // Store token and user data
        TokenManager.setToken(response.data.token, true);
        
        toast({
          title: 'تم تفعيل الحساب بنجاح',
          description: 'مرحباً بك! تم تفعيل حسابك بنجاح',
        });
        
        // Navigate to dashboard
        navigate('/dashboard', { replace: true });
      } else {
        toast({
          variant: 'destructive',
          title: 'فشل في التحقق',
          description: response.message || 'رمز التحقق غير صحيح',
        });
        
        // Update attempts if provided
        if (response.errors?.remaining_attempts) {
          setAttemptsRemaining(response.errors.remaining_attempts);
        }
        
        // Clear the code for retry
        setVerificationCode('');
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'خطأ في التحقق',
        description: error instanceof Error ? error.message : 'حدث خطأ أثناء التحقق من الرمز',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;
    
    setIsResending(true);
    try {
      const response = await verificationAPI.resendVerificationCode(email);
      
      if (response.success) {
        toast({
          title: 'تم إرسال الرمز بنجاح',
          description: 'تحقق من بريدك الإلكتروني للحصول على الرمز الجديد',
        });
        
        // Set countdown based on API response
        setCountdown(60); // Default 1 minute
        
        if (response.data?.remaining_attempts) {
          setAttemptsRemaining(response.data.remaining_attempts);
        }
      } else {
        toast({
          variant: 'destructive',
          title: 'خطأ في إرسال الرمز',
          description: response.message || 'حدث خطأ أثناء إرسال رمز التحقق',
        });
        
        // Handle wait time if provided
        if (response.errors?.wait_minutes) {
          setCountdown(response.errors.wait_minutes * 60);
        }
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'خطأ في الشبكة',
        description: 'تأكد من اتصالك بالإنترنت وحاول مرة أخرى',
      });
    } finally {
      setIsResending(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (!email) {
    return null; // Prevent flash before redirect
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">تحقق من بريدك الإلكتروني</CardTitle>
            <CardDescription className="text-center">
              أدخل رمز التحقق المرسل إلى
              <br />
              <span className="font-medium text-foreground">{email}</span>
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2 text-center">
                <label htmlFor="verification-code" className="text-sm font-medium">
                  رمز التحقق (6 أرقام)
                </label>
                <div className="flex justify-center">
                  <InputOTP
                    value={verificationCode}
                    onChange={setVerificationCode}
                    maxLength={6}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>

              <Button 
                onClick={handleVerifyEmail}
                disabled={isLoading || verificationCode.length !== 6}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    جاري التحقق...
                  </>
                ) : (
                  <>
                    تحقق من الرمز
                    <ArrowRight className="mr-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>

            <div className="space-y-3 text-center">
              <p className="text-sm text-muted-foreground">
                لم تستلم الرمز؟
              </p>
              
              <Button
                variant="outline"
                onClick={handleResendCode}
                disabled={isResending || countdown > 0}
                className="w-full"
              >
                {isResending ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    جاري الإرسال...
                  </>
                ) : countdown > 0 ? (
                  <>
                    <Clock className="ml-2 h-4 w-4" />
                    إعادة الإرسال خلال {formatTime(countdown)}
                  </>
                ) : (
                  'إعادة إرسال الرمز'
                )}
              </Button>

              {attemptsRemaining <= 3 && (
                <div className="rounded-lg bg-orange-50 p-3 text-orange-800 dark:bg-orange-950 dark:text-orange-200">
                  <p className="text-sm">
                    المحاولات المتبقية: {attemptsRemaining}
                  </p>
                </div>
              )}
            </div>

            <div className="text-center">
              <Button 
                variant="link" 
                className="text-sm text-muted-foreground"
                onClick={() => navigate('/auth/register', { replace: true })}
              >
                العودة إلى التسجيل
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
