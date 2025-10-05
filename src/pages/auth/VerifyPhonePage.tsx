import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { authAPI } from '@/services/apis';
import { useAuth } from '@/context/auth-context';
import { Loader2, Smartphone, ArrowRight, Clock, CheckCircle, RefreshCw, Shield } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export default function VerifyPhonePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const auth = useAuth();

  const [otpCode, setOtpCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [attemptsRemaining, setAttemptsRemaining] = useState(5);
  
  const getFormattedPhone = () => {
    const rawPhone = location.state?.phone || '';
    const cleanedPhone = String(rawPhone).replace(/\D/g, '');
    
    if (cleanedPhone.startsWith('963') && cleanedPhone.length === 12) {
      return cleanedPhone;
    }
    if (cleanedPhone.length === 9) {
      return `963${cleanedPhone}`;
    }
    return rawPhone;
  };
  
  const phone = getFormattedPhone();
  
  // Format phone for display
  const formatPhoneForDisplay = (phoneNumber: string) => {
    if (!phoneNumber) return '';
    
    // Remove country code for display
    const localNumber = phoneNumber.replace('963', '');
    
    // Format as XXX XXX XXX
    if (localNumber.length === 9) {
      return `${localNumber.slice(0, 3)} ${localNumber.slice(3, 6)} ${localNumber.slice(6)}`;
    }
    
    return localNumber;
  };
  
  useEffect(() => {
    if (!phone || !/^963\d{9}$/.test(phone)) {
      toast({ 
        variant: 'destructive', 
        title: 'خطأ', 
        description: 'رقم الهاتف غير صالح. يرجى البدء من جديد.' 
      });
      navigate('/auth/register', { replace: true });
    }
  }, [phone, navigate, toast]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleVerifyPhone = async () => {
    if (otpCode.length !== 6) {
      toast({ 
        variant: 'destructive', 
        title: 'رمز التحقق غير مكتمل',
        description: 'يرجى إدخال رمز التحقق كاملاً (6 أرقام)'
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await authAPI.verifyPhone({ phone, otp_code: otpCode });
      
      if (response.success && response.data?.token) {
        auth.handleLoginSuccess(response.data); 
        toast({ 
          title: 'تم تفعيل الحساب بنجاح', 
          description: `مرحباً بك، ${response.data.user.first_name}!` 
        });
        navigate('/dashboard', { replace: true });
      } else {
        toast({ 
          variant: 'destructive', 
          title: 'فشل في التحقق', 
          description: response.message || 'الرمز غير صحيح.' 
        });
        
        if (response.errors?.remaining_attempts) {
          setAttemptsRemaining(response.errors.remaining_attempts);
        }
        
        setOtpCode('');
      }
    } catch (error: any) {
      toast({ 
        variant: 'destructive', 
        title: 'خطأ في التحقق', 
        description: error?.response?.data?.message || 'حدث خطأ ما.' 
      });
      setOtpCode('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;
    
    setIsResending(true);
    try {
      const response = await authAPI.resendVerificationOtp({ phone });
      
      if (response.success) {
        toast({ 
          title: 'تم إرسال الرمز بنجاح', 
          description: 'تحقق من رسائل هاتفك للحصول على الرمز الجديد.' 
        });
        setCountdown(60);
        
        if (response.data?.remaining_attempts) {
          setAttemptsRemaining(response.data.remaining_attempts);
        }
      } else {
        toast({ 
          variant: 'destructive', 
          title: 'خطأ في إرسال الرمز', 
          description: response.message || 'فشل إرسال الرمز.' 
        });
        
        if (response.errors?.wait_minutes) {
          setCountdown(response.errors.wait_minutes * 60);
        }
      }
    } catch (error: any) {
      toast({ 
        variant: 'destructive', 
        title: 'خطأ في الشبكة', 
        description: error?.response?.data?.message || 'فشل الاتصال بالخادم.' 
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

  if (!phone) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 p-4" dir="rtl">
      <div className="w-full max-w-md">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        
        <Card className="shadow-2xl border-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-emerald-600 animate-pulse">
              <Smartphone className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              تفعيل رقم الهاتف
            </CardTitle>
            <CardDescription className="text-lg leading-relaxed">
              أدخل رمز التحقق المرسل إلى
              <br />
              <div className="mt-2 inline-flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-xl">
                <Smartphone className="h-4 w-4 text-green-600" />
                <span className="font-bold text-lg text-foreground" dir="ltr">
                  +{phone.slice(0, 3)} {formatPhoneForDisplay(phone)}
                </span>
              </div>
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-8">
            <div className="space-y-6">
              <div className="space-y-4 text-center">
                <label htmlFor="otp-code" className="text-sm font-medium block">
                  رمز التحقق (6 أرقام)
                </label>
                <div className="flex justify-center gap-2" dir="ltr">
                  {[...Array(6)].map((_, index) => (
                    <Input
                      key={index}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={otpCode[index] || ''}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        if (value.length <= 1) {
                          const newOtpCode = otpCode.split('');
                          newOtpCode[index] = value;
                          setOtpCode(newOtpCode.join(''));
                          
                          // Auto-focus next input
                          if (value && index < 5) {
                            const nextInput = document.querySelector(`input[data-otp-index="${index + 1}"]`) as HTMLInputElement;
                            if (nextInput) {
                              nextInput.focus();
                            }
                          }
                        }
                      }}
                      onKeyDown={(e) => {
                        // Handle backspace to go to previous input
                        if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
                          const prevInput = document.querySelector(`input[data-otp-index="${index - 1}"]`) as HTMLInputElement;
                          if (prevInput) {
                            prevInput.focus();
                          }
                        }
                        // Handle paste
                        if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
                          e.preventDefault();
                          navigator.clipboard.readText().then(text => {
                            const numbers = text.replace(/[^0-9]/g, '').slice(0, 6);
                            setOtpCode(numbers);
                            // Focus the last filled input or the next empty one
                            const targetIndex = Math.min(numbers.length, 5);
                            const targetInput = document.querySelector(`input[data-otp-index="${targetIndex}"]`) as HTMLInputElement;
                            if (targetInput) {
                              targetInput.focus();
                            }
                          });
                        }
                      }}
                      data-otp-index={index}
                      className="h-14 w-14 text-center text-xl font-bold border-2 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800 transition-all"
                      autoComplete="off"
                    />
                  ))}
                </div>
              </div>

              <Button 
                onClick={handleVerifyPhone} 
                disabled={isLoading || otpCode.length !== 6} 
                className="w-full h-12 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                    جاري التحقق...
                  </>
                ) : (
                  <>
                    <CheckCircle className="ml-2 h-5 w-5" />
                    تفعيل الحساب
                  </>
                )}
              </Button>
            </div>

            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-3">
                  لم تستلم الرمز؟
                </p>
                
                <Button
                  variant="outline"
                  onClick={handleResendCode}
                  disabled={isResending || countdown > 0}
                  className="w-full h-12 rounded-xl border-2 hover:bg-gray-50 dark:hover:bg-gray-800"
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
                    <>
                      <RefreshCw className="ml-2 h-4 w-4" />
                      إعادة إرسال الرمز
                    </>
                  )}
                </Button>
              </div>

              {attemptsRemaining <= 3 && attemptsRemaining > 0 && (
                <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                      المحاولات المتبقية: {attemptsRemaining}
                    </p>
                  </div>
                </div>
              )}

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Smartphone className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800 dark:text-blue-200">
                    <p className="font-medium mb-1">نصائح مهمة:</p>
                    <ul className="space-y-1 text-xs">
                      <li>• تأكد من أن هاتفك يستقبل الرسائل النصية</li>
                      <li>• قد يستغرق وصول الرمز حتى دقيقتين</li>
                      <li>• تحقق من مجلد الرسائل المحذوفة</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-center pt-4 border-t border-gray-100 dark:border-gray-700">
              <Button 
                variant="link" 
                className="text-sm text-muted-foreground hover:text-gray-700"
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