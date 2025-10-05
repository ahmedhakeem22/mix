
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, isAuthenticated } from '@/services/api';
import { User, ApiResponse } from '@/types';
import { toast } from '@/hooks/use-toast';

interface LoginSuccessData { // <-- NEW
  user: User;
  token: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  isLoading: boolean;
  error: Error | null;
  login: (identifier: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  register: (userData: any) => Promise<void>;
    handleLoginSuccess: (data: LoginSuccessData, rememberMe?: boolean) => void; // <-- NEW

}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a storage helper to handle token storage consistently
export const tokenStorage = {
  getToken: () => localStorage.getItem('authToken') || sessionStorage.getItem('authToken'),
  setToken: (token: string, rememberMe: boolean = true) => {
    if (rememberMe) {
      localStorage.setItem('authToken', token);
      // Clear session storage to prevent conflicts
      sessionStorage.removeItem('authToken');
    } else {
      sessionStorage.setItem('authToken', token);
      // Clear local storage to prevent conflicts
      localStorage.removeItem('authToken');
    }
  },
  clearToken: () => {
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [tokenChecked, setTokenChecked] = useState(false);
  const [lastAttemptTime, setLastAttemptTime] = useState(0);
  const [apiErrorCount, setApiErrorCount] = useState(0); // Track consecutive API errors

  // Cache time in milliseconds (15 minutes)
  const USER_CACHE_TIME = 15 * 60 * 1000;
  
  // Try to get user from localStorage cache first
  useEffect(() => {
    const cachedUserData = localStorage.getItem('cachedUser');
    const cachedTime = localStorage.getItem('cachedUserTime');
    
    if (cachedUserData && cachedTime) {
      const now = Date.now();
      const timeCached = parseInt(cachedTime, 10);
      
      // If cache is still valid (less than 15 minutes old)
      if (now - timeCached < USER_CACHE_TIME) {
        try {
          const userData = JSON.parse(cachedUserData);
          setUser(userData);
          setLoading(false);
          // We still refresh user data in background, but don't wait for it
          setTimeout(() => refreshUser(), 1000);
          return;
        } catch (e) {
          // If parsing fails, continue with normal loading
          console.error('Error parsing cached user data', e);
        }
      }
    }
    
    // No valid cache, load user normally
    if (tokenStorage.getToken()) {
      loadUser();
    } else {
      setLoading(false);
    }
    setTokenChecked(true);
  }, []);

  const loadUser = async () => {
    try {
      // Check if we attempted to load the user in the last 10 seconds - if so, don't try again
      const now = Date.now();
      if (now - lastAttemptTime < 10000) {
        return false;
      }
      
      setLastAttemptTime(now);
      setLoading(true);
      
      // Check if we've had too many consecutive errors - stop trying after 5 errors
      if (apiErrorCount >= 5) {
        console.log("Too many consecutive API errors, stopping user loading attempts");
        setLoading(false);
        return false;
      }
      
      const response = await authAPI.getCurrentUser();
      
      // Store user in state and cache
      setUser(response.data);
      localStorage.setItem('cachedUser', JSON.stringify(response.data));
      localStorage.setItem('cachedUserTime', now.toString());
      
      setError(null);
      setApiErrorCount(0); // Reset error count on successful API call
      return true;
    } catch (err) {
      console.error('Error loading user:', err);
      setError(err instanceof Error ? err : new Error('Failed to load user'));
      setApiErrorCount(prev => prev + 1); // Increment error count
      
      // If hitting specific error thresholds, take different actions
      if (apiErrorCount >= 3) {
        console.log(`Multiple API failures (${apiErrorCount}), possibly backing off...`);
        
        // Try to use cached data even if it's expired as a fallback
        const cachedUserData = localStorage.getItem('cachedUser');
        if (cachedUserData) {
          try {
            const userData = JSON.parse(cachedUserData);
            setUser(userData);
            // Don't reset error count but use cached data
          } catch (e) {
            console.error('Error parsing cached user data', e);
          }
        }
      }
      
      // Check if error is due to unauthorized access
      if (err instanceof Error && err.message.includes('401')) {
        // If failed to load user due to unauthorized, clear token as it might be invalid
        tokenStorage.clearToken();
        
        toast({
          title: "انتهت جلسة تسجيل الدخول",
          description: "يرجى تسجيل الدخول مرة أخرى",
          variant: "destructive"
        });
      } else if (err instanceof Error && (
          err.message.includes('not be found') || 
          err.message.includes('could not be found')
      )) {
        // If the route doesn't exist, don't keep trying
        console.log("Auth API route not found, won't retry");
        // Set a higher error count to prevent further attempts
        setApiErrorCount(10);
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Check for token changes (e.g., if another tab logs in/out)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'authToken') {
        if (e.newValue && e.newValue !== e.oldValue) {
          loadUser();
        } else if (!e.newValue) {
          setUser(null);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Set up interval to refresh token and user data (only if API is working)
  useEffect(() => {
    if (!tokenChecked || apiErrorCount >= 5) return;
    
    // Set up interval to refresh token less frequently (every 30 minutes)
    const intervalId = setInterval(() => {
      if (tokenStorage.getToken() && apiErrorCount < 5) {
        loadUser();
      }
    }, 60 * 60 * 1000); // 30 minutes
    
    return () => {
      clearInterval(intervalId);
    };
  }, [tokenChecked, apiErrorCount]);

  const login = async (identifier: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      const response = await authAPI.login(identifier, password);
      if (response.data?.token) {
        // Store token in localStorage for persistence (default to rememberMe = true)
        tokenStorage.setToken(response.data.token, true);
        // Store user data in state and cache
        setUser(response.data.user);
        localStorage.setItem('cachedUser', JSON.stringify(response.data.user));
        localStorage.setItem('cachedUserTime', Date.now().toString());
      }
      setError(null);
      setApiErrorCount(0); // Reset error count on successful login
      
      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: `مرحباً، ${response.data.user.first_name}!`
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to login'));
      toast({
        title: "فشل تسجيل الدخول",
        description: err instanceof Error ? err.message : "خطأ في تسجيل الدخول",
        variant: "destructive"
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

    const handleLoginSuccess = (data: LoginSuccessData, rememberMe: boolean = true) => {
    tokenStorage.setToken(data.token, rememberMe);
    setUser(data.user);
    // تحديث الكاش المحلي
    localStorage.setItem('cachedUser', JSON.stringify(data.user));
    localStorage.setItem('cachedUserTime', Date.now().toString());
    // إعادة تعيين أي أخطاء سابقة
    setError(null);
    setApiErrorCount(0);
  };


  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      await authAPI.logout();
      // Clear token and cached user data
      tokenStorage.clearToken();
      localStorage.removeItem('cachedUser');
      localStorage.removeItem('cachedUserTime');
      
      setUser(null);
      setApiErrorCount(0); // Reset API error count on logout
      toast({
        title: "تم تسجيل الخروج بنجاح",
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to logout'));
      toast({
        title: "فشل تسجيل الخروج",
        description: "حدث خطأ أثناء تسجيل الخروج. تم تسجيل الخروج محلياً.",
        variant: "destructive"
      });
      // Even if logout fails on server, clear local token and cache
      tokenStorage.clearToken();
      localStorage.removeItem('cachedUser');
      localStorage.removeItem('cachedUserTime');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async (): Promise<void> => {
    // Only attempt to refresh if we haven't hit error threshold and 
    // haven't refreshed in the last 10 seconds
    const now = Date.now();
    if (apiErrorCount < 5 && now - lastAttemptTime >= 10000) {
      await loadUser();
    }
  };

  const register = async (userData: any): Promise<void> => {
    try {
      setLoading(true);
      const response = await authAPI.register(userData);
      if (response.data?.token) {
        tokenStorage.setToken(response.data.token, true);
        setUser(response.data.user);
        localStorage.setItem('cachedUser', JSON.stringify(response.data.user));
        localStorage.setItem('cachedUserTime', Date.now().toString());
      }
      setError(null);
      setApiErrorCount(0);
      
      toast({
        title: "تم إنشاء الحساب بنجاح",
        description: `مرحباً، ${response.data.user.first_name}!`
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to register'));
      toast({
        title: "فشل إنشاء الحساب",
        description: err instanceof Error ? err.message : "خطأ في إنشاء الحساب",
        variant: "destructive"
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    isAuthenticated: !!user,
    user,
    loading,
    isLoading: loading,
    error,
    login,
    logout,
    refreshUser,
    register,
    handleLoginSuccess, 
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
