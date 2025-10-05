
import { tokenStorage } from "@/context/auth-context";
import { LoginCredentials, RegisterData, AuthResponse } from "@/types";

/**
 * Enhanced auth utility functions with performance optimizations
 */

// Cache for auth status to avoid repeated localStorage checks
let authStatusCache: { isAuthenticated: boolean; timestamp: number } | null = null;
const CACHE_DURATION = 5000; // 5 seconds

/**
 * Checks if there is an authentication token stored (cached)
 */
export const hasAuthToken = (): boolean => {
  const now = Date.now();
  
  // Return cached result if still valid
  if (authStatusCache && (now - authStatusCache.timestamp) < CACHE_DURATION) {
    return authStatusCache.isAuthenticated;
  }
  
  // Check actual token
  const hasToken = !!tokenStorage.getToken();
  
  // Update cache
  authStatusCache = {
    isAuthenticated: hasToken,
    timestamp: now
  };
  
  return hasToken;
};

/**
 * Clear auth cache (call this when auth state changes)
 */
export const clearAuthCache = (): void => {
  authStatusCache = null;
};

/**
 * Redirects to login page with return URL
 */
export const redirectToLogin = (from: string, formData?: any): void => {
  clearAuthCache();
  
  const state: { from: string; formData?: any } = { from };
  
  if (formData) {
    state.formData = formData;
  }
  
  window.location.href = `/auth/login?redirect=${encodeURIComponent(from)}`;
};

/**
 * Parse redirect URL from location
 */
export const getRedirectUrl = (location: Location): string => {
  const params = new URLSearchParams(location.search);
  return params.get('redirect') || '/';
};

/**
 * Handle unauthorized API response with optimized flow
 */
export const handleUnauthorized = (): void => {
  // Clear token and cache
  tokenStorage.clearToken();
  clearAuthCache();
  
  // Save current path
  const currentPath = window.location.pathname;
  
  // Redirect to login
  if (!currentPath.includes('/auth/login')) {
    redirectToLogin(currentPath);
  }
};

/**
 * Optimized token refresh check
 */
export const shouldRefreshToken = (): boolean => {
  const token = tokenStorage.getToken();
  if (!token) return false;
  
  try {
    // Parse JWT to check expiration (if using JWT)
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiresAt = payload.exp * 1000;
    const now = Date.now();
    
    // Refresh if token expires in next 5 minutes
    return (expiresAt - now) < 5 * 60 * 1000;
  } catch {
    // If not JWT or parsing fails, assume refresh needed
    return true;
  }
};

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (data.success && data.data.token) {
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
    }

    return data;
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      message: 'حدث خطأ أثناء تسجيل الدخول',
      data: null
    };
  }
};

export const register = async (userData: RegisterData): Promise<AuthResponse> => {
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (data.success && data.data.token) {
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
    }

    return data;
  } catch (error) {
    console.error('Registration error:', error);
    return {
      success: false,
      message: 'حدث خطأ أثناء إنشاء الحساب',
      data: null
    };
  }
};
