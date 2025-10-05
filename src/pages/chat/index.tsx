import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { useNavigate } from 'react-router-dom';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { ContactSidebar } from '@/components/chat/ContactSidebar';
import { Button } from '@/components/ui/button';
import { MessageSquare, Users, X, Wifi, WifiOff, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChatEcho } from '@/hooks/useChatEcho';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ChatUser {
  id: number;
  first_name: string;
  last_name: string;
  image?: string;
  phone?: string;
  last_seen?: string;
  is_online?: boolean;
}

interface ChatMessage {
  id: number;
  sender_id: number;
  receiver_id: number;
  message: string;
  created_at: string;
  read_at?: string;
  sender: ChatUser;
  receiver: ChatUser;
}

interface Conversation {
  id: string;
  user: ChatUser;
  last_message?: ChatMessage;
  unread_count: number;
  updated_at: string;
}

export default function ChatPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [showContactSidebar, setShowContactSidebar] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Use the enhanced chat hook with Laravel Echo
  const {
    conversations,
    isLoadingConversations,
    isConnected,
    onlineUsers,
    typingUsers,
    isUserOnline,
    isUserTyping,
    sendMessage,
    markMessagesAsRead,
    isSendingMessage,
    getTotalUnreadCount
  } = useChatEcho({
    autoMarkAsRead: true,
    enableTypingIndicator: true,
    enablePresence: true,
    refetchInterval: 30000
  });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setShowContactSidebar(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">يجب تسجيل الدخول</h3>
          <p className="text-muted-foreground">يرجى تسجيل الدخول للوصول إلى الرسائل</p>
        </div>
      </div>
    );
  }

  const totalUnreadCount = getTotalUnreadCount();

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Connection Status Bar */}
      {!isConnected && (
        <Alert variant="destructive" className="rounded-none border-0 border-b">
          <WifiOff className="h-4 w-4" />
          <AlertDescription>
            انقطع الاتصال بالخادم. المحادثات الجديدة قد لا تصل فوراً.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* Chat Sidebar */}
        <div className={cn(
          "flex-shrink-0 border-r border-border bg-card relative",
          isMobile && selectedConversation ? "hidden" : "w-80"
        )}>
          {/* Header with connection status */}
          <div className="p-4 border-b border-border bg-card/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate('/')}
                  className="rounded-full hover:bg-primary/10"
                  title="الرئيسية"
                >
                  <Home className="w-4 h-4" />
                </Button>
                <MessageSquare className="w-5 h-5 text-primary" />
                <h1 className="text-lg font-semibold">المحادثات</h1>

                {/* Unread count badge */}
                {totalUnreadCount > 0 && (
                  <Badge variant="destructive" className="h-5 min-w-5 text-xs">
                    {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Online users count */}
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="w-3 h-3" />
                  <span>{onlineUsers.size}</span>
                </div>

                {/* Connection indicator */}
                <div className={cn(
                  "flex items-center gap-1 text-xs",
                  isConnected ? "text-green-600" : "text-red-600"
                )}>
                  {isConnected ? (
                    <Wifi className="w-3 h-3" />
                  ) : (
                    <WifiOff className="w-3 h-3" />
                  )}
                  <span>{isConnected ? 'متصل' : 'غير متصل'}</span>
                </div>
              </div>
            </div>
          </div>

          <ChatSidebar
            conversations={conversations.map(conv => ({
              ...conv,
              user: {
                ...conv.user,
                is_online: isUserOnline(conv?.user?.id)
              }
            }))}
            selectedConversation={selectedConversation}
            onSelectConversation={setSelectedConversation}
            onConversationsUpdate={() => {}} // Already handled by the hook
          />

          {/* Typing indicators panel */}
          {typingUsers.size > 0 && (
            <div className="absolute bottom-0 left-0 right-0 bg-blue-50 dark:bg-blue-900/20 border-t p-2">
              <div className="text-xs text-blue-600 dark:text-blue-400">
                {Array.from(typingUsers).map(userId => {
                  const conversation = conversations.find(c => c.user.id === userId);
                  return conversation ? `${conversation.user.first_name} يكتب...` : null;
                }).filter(Boolean).join(', ')}
              </div>
            </div>
          )}
        </div>

        {/* Chat Window */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <ChatWindow
              conversation={{
                ...selectedConversation,
                user: {
                  ...selectedConversation.user,
                  is_online: isUserOnline(selectedConversation.user.id)
                }
              }}
              currentUser={user!}
              onBack={isMobile ? () => setSelectedConversation(null) : undefined}
              onToggleContactSidebar={() => setShowContactSidebar(!showContactSidebar)}
              showContactSidebar={showContactSidebar}
              sendMessageToChatOverride={(chatId, message) => sendMessage(selectedConversation.user.id, message)}
              markMessagesAsReadOverride={(ids, chatId) => markMessagesAsRead(ids, chatId)}
              isUserTypingOverride={isUserTyping}
              isSendingMessageOverride={isSendingMessage}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-muted/20">
              <div className="text-center">
                <MessageSquare className="w-20 h-20 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-2">اختر محادثة</h3>
                <p className="text-muted-foreground mb-4">اختر محادثة من القائمة الجانبية للبدء</p>

                {/* Real-time stats */}
                <div className="flex justify-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MessageSquare className="w-4 h-4" />
                    <span>{conversations.length} محادثة</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{onlineUsers.size} متصل</span>
                  </div>
                  {totalUnreadCount > 0 && (
                    <div className="flex items-center gap-1 text-blue-600">
                      <Badge variant="secondary" className="h-4 text-xs">
                        {totalUnreadCount} غير مقروء
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Contact Sidebar */}
        {showContactSidebar && selectedConversation && !isMobile && (
          <div className="w-80 border-l border-border bg-card">
            <ContactSidebar
              conversation={{
                ...selectedConversation,
                user: {
                  ...selectedConversation.user,
                  is_online: isUserOnline(selectedConversation.user.id)
                }
              }}
              onClose={() => setShowContactSidebar(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
