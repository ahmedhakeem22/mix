
import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/auth-context';
import { Loader2 } from 'lucide-react';
import { tokenStorage } from '@/context/auth-context';

interface ProtectedRouteProps {
  children: ReactNode;
  isLoggedIn?: boolean; // Add optional isLoggedIn prop
}

export function ProtectedRoute({ children, isLoggedIn: externalIsLoggedIn }: ProtectedRouteProps) {
  const location = useLocation();
  const { isAuthenticated, loading, refreshUser } = useAuth();
  
  // Use either external value or context value
  const isLoggedIn = externalIsLoggedIn !== undefined ? externalIsLoggedIn : isAuthenticated;

  const hasToken = !!tokenStorage.getToken();
  const hasCachedUser = !!localStorage.getItem('cachedUser');
  
  // Force refresh user data when component mounts, but only once
  useEffect(() => {
    // Only refresh if we have a token but aren't authenticated yet
    if (hasToken && !isLoggedIn) {
      refreshUser();
    }
  }, [refreshUser, isLoggedIn, hasToken]);

  // If still loading authentication status and we have token or cached data, show loading spinner
  if (loading && (hasToken || hasCachedUser)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  // If not authenticated and no token, redirect to login page
  if (!isLoggedIn && !hasToken && !hasCachedUser) {
    // Save the current location so we can redirect after login
    return <Navigate to="/auth/login" state={{ from: location.pathname }} replace />;
  }

  // If authenticated or has token/cached data, render the protected component
  return <>{children}</>;
}
