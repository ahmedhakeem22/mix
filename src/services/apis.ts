import { 
  ApiResponse, PaginatedResponse, Listing, Comment, User, SearchFilters, 
  Favorite, Category, SubCategory, Brand, State, City, 
  ChangePasswordPayload, DeleteAccountPayload, AccountSettings, UserSettings, Chat, ChatMessage,VerifyPhonePayload, 
  ResendOtpPayload, 
  RequestPasswordResetOtpPayload, 
  ResetPasswordWithOtpPayload,ResendOtpResponseData
} from '@/types';
// Configuration - Update to use the correct API URL
const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  MAX_RETRY_DELAY: 5000,
} as const;

class TokenManager {
  private static readonly TOKEN_KEY = 'authToken';
  private static readonly SESSION_TOKEN_KEY = 'sessionAuthToken';

  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY) || sessionStorage.getItem(this.SESSION_TOKEN_KEY);
  }

  static setToken(token: string, remember: boolean = true): void {
    if (remember) {
      localStorage.setItem(this.TOKEN_KEY, token);
      sessionStorage.removeItem(this.SESSION_TOKEN_KEY);
    } else {
      sessionStorage.setItem(this.SESSION_TOKEN_KEY, token);
      localStorage.removeItem(this.TOKEN_KEY);
    }
  }

  static removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.SESSION_TOKEN_KEY);
  }

  static hasToken(): boolean {
    return !!this.getToken();
  }
}

// Enhanced HTTP Client with better error handling and retry logic
class ApiClient {
  private static retryCount = new Map<string, number>();

  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    const token = TokenManager.getToken();
    const requestId = `${options.method || 'GET'}-${endpoint}`;
    
    console.log(`🚀 API Request: ${options.method || 'GET'} ${url}`);
    
    const isFormData = options.body instanceof FormData;
    
    const defaultHeaders: Record<string, string> = {
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
    };

    const requestOptions: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...(options.headers || {}),
      },
      mode: 'cors',
      credentials: 'include',
    };

    const currentRetryCount = this.retryCount.get(requestId) || 0;

    for (let attempt = 1; attempt <= API_CONFIG.RETRY_ATTEMPTS; attempt++) {
      try {
        if (attempt > 1) {
          const delay = Math.min(
            API_CONFIG.RETRY_DELAY * Math.pow(2, attempt - 1),
            API_CONFIG.MAX_RETRY_DELAY
          );
          console.log(`⏳ Retrying request (attempt ${attempt}/${API_CONFIG.RETRY_ATTEMPTS}) after ${delay}ms`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

        const response = await fetch(url, {
          ...requestOptions,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Reset retry count on successful request
        this.retryCount.delete(requestId);

        if (!response.ok) {
          let errorData: any = {};
          try {
            errorData = await response.json();
          } catch {
            errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
          }
          
          // Handle specific HTTP status codes
          switch (response.status) {
            case 401:
              console.error('🔒 Authentication error - removing token');
              TokenManager.removeToken();
              if (typeof window !== 'undefined') {
                window.location.href = '/auth/login';
              }
              throw new Error('يرجى تسجيل الدخول مرة أخرى');
              
            case 403:
              // لا نرمي خطأ مباشرة للـ 403، بل نتركه للمكونات لمعالجته
              // خاصة في حالة عدم تفعيل رقم الهاتف
              const error403 = new Error(errorData.message || 'غير مصرح لك بالوصول لهذا المورد');
              (error403 as any).response = { status: 403, data: errorData };
              throw error403;
              
            case 404:
              throw new Error('المورد المطلوب غير موجود');
              
            case 422:
              const validationErrors = errorData.errors || {};
              const errorMessages = Object.values(validationErrors).flat();
              throw new Error(errorMessages.join(', ') || errorData.message || 'خطأ في البيانات المرسلة');
              
            case 429:
              throw new Error('تم تجاوز الحد المسموح من الطلبات، يرجى المحاولة لاحقاً');
              
            case 500:
              throw new Error('خطأ في الخادم، يرجى المحاولة لاحقاً');
              
            case 503:
              throw new Error('الخدمة غير متاحة مؤقتاً');
              
            default:
              throw new Error(
                errorData.message || 
                `خطأ في الشبكة: ${response.status} ${response.statusText}`
              );
          }
        }

        const data = await response.json();
        console.log(`✅ API Response: ${options.method || 'GET'} ${url} - Success`);
        return data as T;

      } catch (error) {
        console.error(`❌ API request attempt ${attempt} failed:`, error);
        
        // Update retry count
        this.retryCount.set(requestId, currentRetryCount + 1);
        
        if (attempt === API_CONFIG.RETRY_ATTEMPTS) {
          // Final attempt failed
          this.retryCount.delete(requestId);
          
          if (error instanceof Error) {
            // Handle network errors
            if (error.name === 'AbortError') {
              throw new Error('انتهت مهلة الطلب، يرجى المحاولة مرة أخرى');
            }
            if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
              throw new Error('خطأ في الاتصال، يرجى التأكد من الاتصال بالإنترنت');
            }
            throw error;
          }
          
          throw new Error('حدث خطأ غير متوقع، يرجى المحاولة لاحقاً');
        }
      }
    }

    throw new Error('تم تجاوز الحد الأقصى لعدد المحاولات');
  }

  static get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  static post<T>(endpoint: string, data?: any): Promise<T> {
    const body = data instanceof FormData ? data : JSON.stringify(data);
    return this.request<T>(endpoint, { method: 'POST', body });
  }

  static put<T>(endpoint: string, data?: any): Promise<T> {
    const body = data instanceof FormData ? data : JSON.stringify(data);
    return this.request<T>(endpoint, { method: 'PUT', body });
  }

  static patch<T>(endpoint: string, data?: any): Promise<T> {
    const body = data instanceof FormData ? data : JSON.stringify(data);
    return this.request<T>(endpoint, { method: 'PATCH', body });
  }

  static delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Enhanced APIs with better error handling
export const categoriesAPI = {
  getCategories: (): Promise<ApiResponse<Category[]>> => 
    ApiClient.get('/categories'),

  getCategory: (id: number): Promise<ApiResponse<Category>> => 
    ApiClient.get(`/categories/${id}`),

  getSubCategories: (categoryId: number): Promise<ApiResponse<SubCategory[]>> => 
    ApiClient.get(`/categories/${categoryId}/subcategories`),
};

export const listingsAPI = {
  getListings: (filters?: SearchFilters): Promise<ApiResponse<PaginatedResponse<Listing>>> => {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }
    
    const queryString = params.toString();
    const endpoint = queryString ? `/listings?${queryString}` : '/listings';
    
    return ApiClient.get(endpoint);
  },

  getListing: (id: number): Promise<ApiResponse<Listing>> => 
    ApiClient.get(`/listings/${id}`),
  
  getCurrentUserListings: (
    filters?: Omit<SearchFilters, 'user_id'> // Exclude user_id, it's implicit
  ): Promise<ApiResponse<PaginatedResponse<Listing>>> => {
    const params = new URLSearchParams();
    if (filters) {
      // Ensure all relevant filter properties are handled
      (Object.keys(filters) as Array<keyof typeof filters>).forEach(key => {
        const value = filters[key];
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    const queryString = params.toString();
    // This endpoint should match the one defined in your Laravel routes for UserListingController@fetch
    // e.g., /user/listings (which is already set up in your routes/api.php)
    const endpoint = queryString ? `/user/listings?${queryString}` : '/user/listings';
    return ApiClient.get(endpoint);
  },
  createListing: (data: FormData): Promise<ApiResponse<Listing>> => 
    ApiClient.post('/listings', data),

  updateListing: (id: number, data: FormData): Promise<ApiResponse<Listing>> => 
    ApiClient.put(`/listings/${id}`, data),

  deleteListing: (id: number): Promise<ApiResponse<void>> => 
    ApiClient.delete(`/listings/${id}`),

  getUserListings: (): Promise<ApiResponse<PaginatedResponse<Favorite>>> => 
    ApiClient.get('/user/favorites'),

  getFavorites: (): Promise<ApiResponse<PaginatedResponse<Favorite>>> => 
    ApiClient.get('/user/favorites'),

  addToFavorites: (listingId: number): Promise<ApiResponse<void>> => 
    ApiClient.post(`/listings/${listingId}/favorite`),

  removeFromFavorites: (listingId: number): Promise<ApiResponse<void>> => 
    ApiClient.delete(`/listings/${listingId}/favorite`),

  checkIsFavorite: (listingId: number): Promise<ApiResponse<{ is_favorite: boolean }>> => 
    ApiClient.get(`/listings/${listingId}/is-favorite`),
};

export const authAPI = {
  login: (identifier: string, password: string, rememberMe?: boolean): Promise<ApiResponse<{ user: User; token: string }>> => 
    ApiClient.post('/auth/login', { identifier, password, remember_me: rememberMe }),

  register: (userData: any): Promise<ApiResponse<{ user: User; token: string }>> => 
    ApiClient.post('/auth/register', userData),

  logout: (): Promise<ApiResponse<void>> => 
    ApiClient.post('/auth/logout'),

  getCurrentUser: (): Promise<ApiResponse<User>> => 
    ApiClient.get('/user/profile'),

  refreshToken: (): Promise<ApiResponse<{ token: string }>> => 
    ApiClient.post('/auth/refresh'),

  changePassword: (data: ChangePasswordPayload): Promise<ApiResponse<void>> =>
    ApiClient.post('/user/change-password', data),

  deleteAccount: (data: DeleteAccountPayload): Promise<ApiResponse<void>> =>
    ApiClient.post('/user/account/delete-account', data),

  requestPasswordResetCode: (identifier: string): Promise<ApiResponse<void>> =>
    ApiClient.post('/auth/forgot-password', { identifier }),

  resetPassword: (data: { token: string; password: string; password_confirmation: string }): Promise<ApiResponse<void>> =>
    ApiClient.post('/auth/reset-password', data),

  verifyPhone: (data: VerifyPhonePayload): Promise<ApiResponse<{ user: User; token: string }>> =>
    ApiClient.post('/auth/verify-phone', data),

  sendPasswordResetOtp: (data: RequestPasswordResetOtpPayload): Promise<ApiResponse<void>> =>
    ApiClient.post('/auth/send-password-reset-otp', data),

  resetPasswordWithOtp: (data: ResetPasswordWithOtpPayload): Promise<ApiResponse<void>> =>
    ApiClient.post('/auth/reset-password-with-otp', data),

  resendVerificationOtp: (data: ResendOtpPayload): Promise<ApiResponse<ResendOtpResponseData>> => 
    ApiClient.post('/auth/resend-verification-otp', data),
  
};

export const profileAPI = {
  getProfile: (): Promise<ApiResponse<User>> => 
    ApiClient.get('/user/profile'),

  updateProfile: (data: FormData): Promise<ApiResponse<User>> => 
    ApiClient.post('/user/profile', data),

 getAccountSettings: (): Promise<ApiResponse<AccountSettings>> =>
    ApiClient.get('/user/account/account-settings'), // <-- تم تعديل المسار هنا
    
  updateSecuritySettings: (data: Partial<UserSettings['security']>): Promise<ApiResponse<UserSettings>> =>
    ApiClient.put('/user/account/security-settings', data),
    
  updateNotificationSettings: (data: Partial<UserSettings['notifications']>): Promise<ApiResponse<UserSettings>> =>
    ApiClient.put('/user/account/notification-settings', data),
    
  updateGeneralSettings: (data: Partial<UserSettings['general']>): Promise<ApiResponse<UserSettings>> =>
    ApiClient.put('/user/account/general-settings', data),

  getUserStats: (): Promise<ApiResponse<any>> => 
    ApiClient.get('/user/stats'),

  getFavorites: (): Promise<ApiResponse<PaginatedResponse<Favorite>>> => 
    ApiClient.get('/user/favorites'),

  addToFavorites: (listingId: number): Promise<ApiResponse<void>> => 
    ApiClient.post(`/user/listings/${listingId}/favorite`),

  removeFromFavorites: (listingId: number): Promise<ApiResponse<void>> => 
    ApiClient.delete(`/user/listings/${listingId}/favorite`),

  checkIsFavorite: (listingId: number): Promise<ApiResponse<{ is_favorite: boolean }>> => 
    ApiClient.get(`/user/listings/${listingId}/is-favorite`),
};

export const locationAPI = {
  getStates: (): Promise<ApiResponse<State[]>> => 
    ApiClient.get('/states'),

  getCities: (stateId?: number): Promise<ApiResponse<City[]>> => {
    const endpoint = stateId ? `/cities?state_id=${stateId}` : '/cities';
    return ApiClient.get(endpoint);
  },
};

export const brandsAPI = {
  getBrands: (categoryId?: number): Promise<ApiResponse<Brand[]>> => {
    const endpoint = categoryId ? `/brands?category_id=${categoryId}` : '/brands';
    return ApiClient.get(endpoint);
  },

  getBrand: (id: number): Promise<ApiResponse<Brand>> => 
    ApiClient.get(`/brands/${id}`),
};

export const commentsAPI = {
  getComments: (listingId: number): Promise<ApiResponse<Comment[]>> => 
    ApiClient.get(`/listings/${listingId}/comments`),

  addComment: (listingId: number, content: string): Promise<ApiResponse<Comment>> => 
    ApiClient.post(`/listings/${listingId}/comments`, { content }),

  addReply: (commentId: number, content: string): Promise<ApiResponse<Comment>> => 
    ApiClient.post(`/comments/${commentId}/replies`, { content }),

  editComment: (commentId: number, content: string): Promise<ApiResponse<Comment>> => 
    ApiClient.put(`/comments/${commentId}`, { content }),

  editReply: (replyId: number, content: string): Promise<ApiResponse<Comment>> => 
    ApiClient.put(`/replies/${replyId}`, { content }),

  deleteComment: (commentId: number): Promise<ApiResponse<void>> => 
    ApiClient.delete(`/comments/${commentId}`),

  deleteReply: (replyId: number): Promise<ApiResponse<void>> => 
    ApiClient.delete(`/replies/${replyId}`),
};

// Dashboard APIs
export const dashboardAPI = {
  getStatistics: (): Promise<import('@/types').DashboardStatistics> =>
    ApiClient.get('/user/dashboard/statistics'),
};

// رسائل بسيطة (ليس chat)
export const messagesAPI = {
  /**
   * إرسال رسالة إلى صاحب إعلان
   */
  sendMessage: (data: {
    recipient_id: number;
    message: string;
    listing_id?: number;
  }): Promise<ApiResponse<any>> =>
    ApiClient.post('/user/messages', data),

  /**
   * جلب جميع الرسائل للمستخدم
   */
  getMessages: (): Promise<ApiResponse<any[]>> =>
    ApiClient.get('/user/messages'),

  /**
   * تمييز الرسالة كمقروءة
   */
  markMessageAsRead: (messageId: number): Promise<ApiResponse<void>> =>
    ApiClient.post('/user/messages/mark-as-read', { message_id: messageId }),
};
// Helper function to check if user is authenticated
export const isAuthenticated = (): boolean => {
  return TokenManager.hasToken();
};

// Export TokenManager for external use
export { TokenManager };

// Export API client for advanced usage
export { ApiClient };
