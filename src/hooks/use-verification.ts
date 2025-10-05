
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { verificationAPI } from '@/services/verification-api';
import { useToast } from '@/hooks/use-toast';
import { useCallback } from 'react';
import { AccountSettings, VerificationInfo } from '@/types/verification';

export function useVerifyEmail() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: useCallback(({ email, token }: { email: string; token: string }) => 
      verificationAPI.verifyEmail(email, token), []),
    onError: useCallback((error: Error) => {
      toast({
        variant: "destructive",
        title: "خطأ في التحقق",
        description: error.message,
      });
    }, [toast])
  });
}

export function useResendVerificationCode() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: useCallback((email: string) => 
      verificationAPI.resendVerificationCode(email), []),
    onError: useCallback((error: Error) => {
      toast({
        variant: "destructive",
        title: "خطأ في إرسال الرمز",
        description: error.message,
      });
    }, [toast])
  });
}

export function useChangePassword() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: useCallback(({ current_password, new_password, new_password_confirmation }: { 
      current_password: string; 
      new_password: string; 
      new_password_confirmation: string; 
    }) => verificationAPI.changePassword(current_password, new_password, new_password_confirmation), []),
    onSuccess: useCallback(() => {
      toast({
        title: "تم تغيير كلمة المرور بنجاح",
      });
    }, [toast]),
    onError: useCallback((error: Error) => {
      toast({
        variant: "destructive",
        title: "خطأ في تغيير كلمة المرور",
        description: error.message,
      });
    }, [toast])
  });
}

export function useAccountSettings() {
  return useQuery({
    queryKey: ['accountSettings'],
    queryFn: useCallback(async () => {
      const response = await verificationAPI.getUserSettings();
      return response.data;
    }, []),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useUpdateAccountSettings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: useCallback((settings: Partial<AccountSettings['security'] & AccountSettings['notifications'] & AccountSettings['general']>) => 
      verificationAPI.updateUserSettings(settings), []),
    onSuccess: useCallback((data) => {
      queryClient.setQueryData(['accountSettings'], data.data);
      toast({
        title: "تم حفظ الإعدادات بنجاح",
      });
    }, [queryClient, toast]),
    onError: useCallback((error: Error) => {
      toast({
        variant: "destructive",
        title: "خطأ في حفظ الإعدادات",
        description: error.message,
      });
    }, [toast])
  });
}

export function useVerificationStatus() {
  return useQuery({
    queryKey: ['verificationStatus'],
    queryFn: useCallback(async () => {
      const response = await verificationAPI.getVerificationStatus();
      return response.data;
    }, []),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useVerifyProfile() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: useCallback((data: FormData) => 
      verificationAPI.verifyProfile(data), []),
    onSuccess: useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ['verificationStatus'] });
      toast({
        title: "تم إرسال طلب التحقق بنجاح",
        description: "سيتم مراجعة طلبك قريباً",
      });
    }, [queryClient, toast]),
    onError: useCallback((error: Error) => {
      toast({
        variant: "destructive",
        title: "خطأ في إرسال طلب التحقق",
        description: error.message,
      });
    }, [toast])
  });
}
