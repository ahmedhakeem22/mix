import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User, Send, Loader2, MessageSquare } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { chatAPI } from '@/services/chat-api';
import { toast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';

interface SimpleMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listing: {
    id: number;
    title: string;
    user?: {
      id: number;
      first_name: string;
      last_name: string;
      image?: string;
      phone?: string;
    };
  };
}

export function SimpleMessageDialog({ open, onOpenChange, listing }: SimpleMessageDialogProps) {
  const [message, setMessage] = useState('');
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const sendMessageMutation = useMutation({
    mutationFn: (messageText: string) => {
      return chatAPI.createChat({
        recipient_id: listing.user!.id,
        message: messageText,
        listing_id: listing.id,
      });
    },
    onSuccess: () => {
      // Invalidate all relevant chat queries to ensure the new chat appears in all systems
      queryClient.invalidateQueries({ queryKey: ['chat-conversations'] });
      queryClient.invalidateQueries({ queryKey: ['chat-conversations-echo'] });
      queryClient.invalidateQueries({ queryKey: ['user-messages'] });
      toast({
        title: 'تم إرسال الرسالة',
        description: 'تم إرسال رسالتك بنجاح، يمكنك متابعة المحادثة في صفحة الرسائل',
      });
      setMessage('');
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: 'فشل في إرسال الرسالة',
        description: error.response?.data?.message || error.message || 'حدث خطأ ما، حاول مرة أخرى',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !listing.user) return;
    sendMessageMutation.mutate(message);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-2xl">
        <DialogHeader className="px-6 py-4 bg-gradient-to-r from-primary/5 to-primary/10 border-b">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <MessageSquare className="h-5 w-5 text-primary" />
            إرسال رسالة
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-4 space-y-4">
          {/* معلومات المرسل */}
          <Card className="p-4 bg-muted/30">
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                <AvatarImage src={user?.avatar_url} alt={user?.first_name} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  <User className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {user?.phone || 'رقم الهاتف غير متوفر'}
                </p>
              </div>
            </div>
          </Card>

          {/* معلومات المستقبل */}
          <Card className="p-4 bg-muted/30">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 ring-2 ring-accent/20">
                <AvatarImage src={listing.user?.image} alt={listing.user?.first_name} />
                <AvatarFallback className="bg-accent/10 text-accent">
                  <User className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">
                  {listing.user?.first_name} {listing.user?.last_name}
                </p>
                <p className="text-xs text-muted-foreground">صاحب الإعلان</p>
              </div>
            </div>
          </Card>

          {/* نموذج الرسالة */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">رسالتك</label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={`مرحباً، أنا مهتم بالإعلان: "${listing.title}"`}
                rows={4}
                className="resize-none focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
                disabled={sendMessageMutation.isPending}
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={!message.trim() || sendMessageMutation.isPending}
                className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              >
                {sendMessageMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin ml-2" />
                    جارٍ الإرسال...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 ml-2" />
                    إرسال الرسالة
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
