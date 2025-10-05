import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Plus, Bell, Menu, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { useQuery } from '@tanstack/react-query';
import { messagesAPI } from '@/services/apis';

function MessagesButton() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const { data: messagesResponse } = useQuery({
    queryKey: ['user-messages'],
    queryFn: () => messagesAPI.getMessages(),
    enabled: isAuthenticated,
    refetchInterval: 30000,
    retry: false,
    onError: (error) => {
      console.warn('⚠️ Failed to fetch messages for button:', error);
    },
  });

  const messages = messagesResponse?.data || [];
  const unreadCount = messages.filter((msg: any) => !msg.read_at).length;

  if (!isAuthenticated) return null;

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative"
      onClick={() => navigate('/chat')}
    >
      <div className="relative">
        <MessageCircle className="w-5 h-5" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-4 min-w-4 text-[10px] px-1 flex items-center justify-center"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
      </div>
    </Button>
  );
}

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  return (
    <header className="bg-white dark:bg-dark-card border-b border-border dark:border-dark-border sticky top-0 z-50">
      <div className="container px-4 mx-auto">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 space-x-reverse">
            <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">س</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">سوق</span>
          </Link>

          {/* Navigation Links - Desktop */}
          <nav className="hidden md:flex items-center space-x-6 space-x-reverse">
            <Link to="/" className="text-gray-700 dark:text-gray-300 hover:text-brand transition-colors">
              الرئيسية
            </Link>
            <Link to="/categories" className="text-gray-700 dark:text-gray-300 hover:text-brand transition-colors">
              التصنيفات
            </Link>
            <Link to="/search" className="text-gray-700 dark:text-gray-300 hover:text-brand transition-colors">
              البحث
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-3 space-x-reverse">
            {isAuthenticated ? (
              <>
                <Button asChild size="sm" className="hidden md:flex">
                  <Link to="/add-ad">
                    <Plus className="w-4 h-4 ml-1" />
                    إضافة إعلان
                  </Link>
                </Button>
                
                <MessagesButton />
                
                <Button variant="ghost" size="icon" asChild>
                  <Link to="/notifications">
                    <Bell className="w-5 h-5" />
                  </Link>
                </Button>
                
                <Button variant="ghost" size="icon" asChild>
                  <Link to="/dashboard">
                    <User className="w-5 h-5" />
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/auth/login">تسجيل الدخول</Link>
                </Button>
                
                <Button size="sm" asChild>
                  <Link to="/auth/register">إنشاء حساب</Link>
                </Button>
              </>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border dark:border-dark-border py-4">
            <nav className="flex flex-col space-y-3">
              <Link 
                to="/" 
                className="text-gray-700 dark:text-gray-300 hover:text-brand transition-colors px-2 py-1"
                onClick={() => setIsMenuOpen(false)}
              >
                الرئيسية
              </Link>
              <Link 
                to="/categories" 
                className="text-gray-700 dark:text-gray-300 hover:text-brand transition-colors px-2 py-1"
                onClick={() => setIsMenuOpen(false)}
              >
                التصنيفات
              </Link>
              <Link 
                to="/search" 
                className="text-gray-700 dark:text-gray-300 hover:text-brand transition-colors px-2 py-1"
                onClick={() => setIsMenuOpen(false)}
              >
                البحث
              </Link>
              {isAuthenticated && (
                <Link 
                  to="/add-ad" 
                  className="text-brand hover:text-brand/80 transition-colors px-2 py-1 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  إضافة إعلان
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
