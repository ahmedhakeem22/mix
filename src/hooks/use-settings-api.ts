import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authAPI, profileAPI } from '@/services/apis';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { 
  UserSettings, AccountSettings, ChangePasswordPayload, DeleteAccountPayload, ApiResponse 
} from '@/types';

// Hook to fetch all user account settings
export const useAccountSettings = () => {
  return useQuery<ApiResponse<AccountSettings>, Error, UserSettings>({
    queryKey: ['accountSettings'],
    queryFn: profileAPI.getAccountSettings,
    select: (data) => data.data.user_settings, // Extract only the settings object
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to update a specific group of settings
export const useUpdateSettings = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  type MutationVariables = { 
    group: 'security' | 'notifications' | 'general', 
    data: any
  };

  return useMutation<ApiResponse<UserSettings>, Error, MutationVariables>({
    mutationFn: ({ group, data }) => {
      switch (group) {
        case 'security':
          return profileAPI.updateSecuritySettings(data as any);
        case 'notifications':
          return profileAPI.updateNotificationSettings(data as any);
        case 'general':
          return profileAPI.updateGeneralSettings(data as any);
        default:
          // هذه الحالة لن تحدث أبدًا بفضل TypeScript
          return Promise.reject(new Error('Invalid settings group'));
      }
    },
    onSuccess: () => {
      toast({
        title: 'تم الحفظ بنجاح',
        description: 'تم تحديث تفضيلاتك.',
      });
      queryClient.invalidateQueries({ queryKey: ['accountSettings'] });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'خطأ في التحديث',
        description: error.message || 'فشل حفظ التفضيلات. يرجى المحاولة مرة أخرى.',
      });
    },
  });
};


// Hook to change user password
export const useChangePassword = () => {
  const { toast } = useToast();
  return useMutation<ApiResponse<void>, Error, ChangePasswordPayload>({
    mutationFn: authAPI.changePassword,
    onSuccess: () => {
      toast({
        title: 'تم تغيير كلمة المرور',
        description: 'تم تغيير كلمة المرور الخاصة بك بنجاح.',
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'فشل تغيير كلمة المرور',
        description: error.message || 'يرجى التحقق من كلمة المرور الحالية والمحاولة مرة أخرى.',
      });
    },
  });
};


// Hook for account deletion
export const useDeleteAccount = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  return useMutation<ApiResponse<void>, Error, DeleteAccountPayload>({
    mutationFn: authAPI.deleteAccount,
    onSuccess: () => {
      toast({
        title: 'تم تقديم طلب حذف الحساب',
        description: 'سيتم معالجة طلبك. سيتم تسجيل خروجك الآن.',
      });
      // You should log the user out here
      navigate('/');
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'فشل حذف الحساب',
        description: error.message || 'حدث خطأ ما. يرجى المحاولة مرة أخرى.',
      });
    },
  });
};