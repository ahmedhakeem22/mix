
import { ApiClient } from './apis';
import { VerificationResponse, ResendVerificationResponse, AccountSettings, VerificationInfo } from '@/types/verification';

export const verificationAPI = {
  // Email verification
  verifyEmail: (email: string, token: string): Promise<VerificationResponse> =>
    ApiClient.post('/user/verify-email', { email, token }),

  resendVerificationCode: (email: string): Promise<ResendVerificationResponse> =>
    ApiClient.post('/user/resend-verification-code', { email }),

  // Password reset
  sendPasswordResetCode: (email: string): Promise<ResendVerificationResponse> =>
    ApiClient.post('/user/send-verification-code', { email }),

  resetPassword: (email: string, token: string, password: string, password_confirmation: string): Promise<VerificationResponse> =>
    ApiClient.post('/user/reset-password', { email, token, password, password_confirmation }),

  // Account management
  changePassword: (current_password: string, new_password: string, new_password_confirmation: string): Promise<VerificationResponse> =>
    ApiClient.post('/user/account/change-password', { current_password, new_password, new_password_confirmation }),

  deleteAccount: (reason: string, description?: string): Promise<VerificationResponse> =>
    ApiClient.post('/user/account/delete', { reason, description }),

  // Profile verification
  verifyProfile: (data: FormData): Promise<{ success: boolean; message: string; data: VerificationInfo }> =>
    ApiClient.post('/user/account/verify-profile', data),

  getVerificationStatus: (): Promise<{ success: boolean; message: string; data: VerificationInfo }> =>
    ApiClient.get('/user/account/verification-status'),

  // Account settings
  getAccountSettings: (): Promise<{ success: boolean; message: string; data: { account_info: any; verify_info: VerificationInfo; business_hours: any; user_settings: AccountSettings } }> =>
    ApiClient.get('/user/account/account-settings'),

  getUserSettings: (): Promise<{ success: boolean; message: string; data: AccountSettings }> =>
    ApiClient.get('/user/account/settings'),

  updateUserSettings: (settings: Partial<AccountSettings['security'] & AccountSettings['notifications'] & AccountSettings['general']>): Promise<{ success: boolean; message: string; data: AccountSettings }> =>
    ApiClient.put('/user/account/settings', settings),

  resetUserSettings: (): Promise<{ success: boolean; message: string; data: AccountSettings }> =>
    ApiClient.post('/user/account/reset-settings'),
};
