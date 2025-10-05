import { useToast } from '@/hooks/use-toast';
import { useCallback } from 'react';

export interface ApiErrorResponse {
  success: false;
  message: string;
  data: null;
  errors: Record<string, string[]> | string[] | [];
}

export interface ApiSuccessResponse<T = any> {
  success: true;
  message: string;
  data: T;
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

export const useApiErrorHandler = () => {
  const { toast } = useToast();

  const handleApiError = useCallback((error: any, setFieldErrors?: (errors: Record<string, string>) => void) => {
    console.error('API Error Details:', error);
    
    // استخراج البيانات من الخطأ بشكل أكثر دقة
    const errorResponse = error?.response?.data || error?.data || error;
    const message = errorResponse?.message || 'حدث خطأ غير متوقع';
    const errors = errorResponse?.errors || {};
    
    // عرض الرسالة الرئيسية
    toast({
      variant: 'destructive',
      title: 'خطأ',
      description: message,
    });
    
    // معالجة أخطاء التحقق من الحقول
    if (setFieldErrors && typeof errors === 'object' && !Array.isArray(errors)) {
      const fieldErrors: Record<string, string> = {};
      
      Object.entries(errors).forEach(([field, messages]) => {
        if (Array.isArray(messages) && messages.length > 0) {
          fieldErrors[field] = messages[0];
        } else if (typeof messages === 'string') {
          fieldErrors[field] = messages;
        }
      });
      
      setFieldErrors(fieldErrors);
    }
    
    // معالجة الأخطاء العامة (مصفوفة من الأخطاء)
    if (Array.isArray(errors) && errors.length > 0) {
      errors.forEach((errorMsg: string) => {
        toast({
          variant: 'destructive',
          title: 'خطأ',
          description: errorMsg,
        });
      });
    }
    
    // إرجاع الأخطاء للمكونات لمعالجتها
    return {
      message,
      errors
    };
  }, [toast]);

  const handleApiSuccess = useCallback((response: any) => {
    if (response?.message) {
      toast({
        title: 'نجح',
        description: response.message,
      });
    }
  }, [toast]);

  return {
    handleApiError,
    handleApiSuccess,
  };
};