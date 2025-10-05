
import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Comment } from '@/types';
import { Heart, MessageCircle, MoreHorizontal, Send, Trash, Edit } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from '@/context/auth-context';

interface CommentsListProps {
  comments: Comment[];
  onAddComment: (text: string) => void;
  onAddReply: (commentId: number, text: string) => void;
  onDeleteComment: (commentId: number) => void;
  onEditComment: (commentId: number, text: string) => void;
  onDeleteReply: (commentId: number, replyId: number) => void;
  onEditReply: (commentId: number, replyId: number, text: string) => void;
  isLoading?: boolean;
}

export function CommentsList({
  comments,
  onAddComment,
  onAddReply,
  onDeleteComment,
  onEditComment,
  onDeleteReply,
  onEditReply,
  isLoading = false
}: CommentsListProps) {
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [editingComment, setEditingComment] = useState<number | null>(null);
  const [editingReply, setEditingReply] = useState<{commentId: number, replyId: number} | null>(null);
  const [editText, setEditText] = useState('');
  
  const { isAuthenticated, user } = useAuth();

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      onAddComment(commentText);
      setCommentText('');
    }
  };

  const handleSubmitReply = (commentId: number) => {
    if (replyText.trim()) {
      onAddReply(commentId, replyText);
      setReplyText('');
      setReplyingTo(null);
    }
  };

  const handleStartEditing = (comment: Comment) => {
    setEditingComment(comment.id);
    setEditText(comment.content);
  };

  const handleStartEditingReply = (commentId: number, reply: Comment) => {
    setEditingReply({commentId, replyId: reply.id});
    setEditText(reply.content);
  };

  const handleSubmitEdit = () => {
    if (editingComment && editText.trim()) {
      onEditComment(editingComment, editText);
      setEditingComment(null);
      setEditText('');
    }
  };

  const handleSubmitEditReply = () => {
    if (editingReply && editText.trim()) {
      onEditReply(editingReply.commentId, editingReply.replyId, editText);
      setEditingReply(null);
      setEditText('');
    }
  };

  const canModifyComment = (userId?: number) => {
    if (!isAuthenticated || !user) return false;
    return user.id === userId;
  };

  return (
    <div className="space-y-4">
      {isAuthenticated && (
        <form onSubmit={handleSubmitComment} className="space-y-3">
          <div className="flex gap-3">
            <Avatar className="w-10 h-10 border">
              {user?.image ? (
                <AvatarImage src={user.image} alt={user.first_name} />
              ) : (
                <AvatarFallback className="bg-brand/10 text-brand">
                  {user?.first_name?.charAt(0) || 'U'}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex-1 space-y-2">
              <Textarea
                placeholder="اكتب تعليقك هنا..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="resize-none dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-300 min-h-[80px]"
              />
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={!commentText.trim() || isLoading}
                  className="bg-brand hover:bg-brand/90 text-white dark:bg-brand dark:hover:bg-brand/90 dark:text-white"
                >
                  {isLoading ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin border-2 border-transparent border-t-white rounded-full" />
                      جاري الإضافة...
                    </>
                  ) : 'إضافة تعليق'}
                </Button>
              </div>
            </div>
          </div>
        </form>
      )}
      
      <div className="space-y-4 mt-6">
        {comments.length === 0 ? (
          <div className="text-center py-6 text-neutral-500 dark:text-neutral-400">
            لا توجد تعليقات حتى الآن. كن أول من يعلق!
          </div>
        ) : (
          comments.map((comment) => (
            <div 
              key={comment.id} 
              className="border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden bg-white dark:bg-neutral-800 shadow-sm"
            >
              <div className="p-4 border-b border-neutral-100 dark:border-neutral-700">
                <div className="flex items-start gap-3">
                  <Avatar className="w-10 h-10 border">
                    {comment.user?.image ? (
                      <AvatarImage src={comment.user.image} alt={`${comment.user.first_name} ${comment.user.last_name}`} />
                    ) : (
                      <AvatarFallback className="bg-neutral-200 dark:bg-neutral-700">
                        {comment.user?.first_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium dark:text-neutral-100">
                          {comment.user ? `${comment.user.first_name} ${comment.user.last_name}` : 'مستخدم غير معروف'}
                        </div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400">
                          {formatDistanceToNow(new Date(comment.created_at), { 
                            addSuffix: true, 
                            locale: ar
                          })}
                        </div>
                      </div>
                      
                      {canModifyComment(comment.user?.id) && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleStartEditing(comment)}>
                              <Edit className="mr-2 h-4 w-4" />
                              تعديل التعليق
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-500 focus:text-red-500"
                              onClick={() => onDeleteComment(comment.id)}
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              حذف التعليق
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                    
                    {editingComment === comment.id ? (
                      <div className="mt-2">
                        <Textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="resize-none dark:bg-neutral-800 dark:border-neutral-700 min-h-[80px] text-sm"
                        />
                        <div className="flex justify-end gap-2 mt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingComment(null);
                              setEditText('');
                            }}
                          >
                            إلغاء
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleSubmitEdit}
                          >
                            حفظ التعديل
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2 text-neutral-700 dark:text-neutral-300">
                        {comment.content}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4 mt-2">
                      {isAuthenticated && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-brand hover:text-brand hover:bg-brand/10 px-2 text-xs flex items-center"
                          onClick={() => replyingTo === comment.id 
                            ? setReplyingTo(null) 
                            : setReplyingTo(comment.id)
                          }
                        >
                          <MessageCircle className="h-3 w-3 ml-1" />
                          رد
                        </Button>
                      )}
                      
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-neutral-500 hover:text-red-500 px-2 text-xs flex items-center"
                      >
                        <Heart className="h-3 w-3 ml-1" />
                        إعجاب
                      </Button>
                    </div>
                  </div>
                </div>
                
                {replyingTo === comment.id && isAuthenticated && (
                  <div className="mr-10 mt-3 border-r-2 border-brand pr-3">
                    <div className="flex gap-2">
                      <Avatar className="w-8 h-8 border">
                        {user?.image ? (
                          <AvatarImage src={user.image} alt={user.first_name} />
                        ) : (
                          <AvatarFallback className="bg-brand/10 text-brand">
                            {user?.first_name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex-1 flex gap-2 items-end">
                        <Textarea
                          placeholder="اكتب ردك هنا..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          className="resize-none dark:bg-neutral-800 dark:border-neutral-700 min-h-[60px] text-sm flex-1"
                        />
                        <Button
                          size="sm"
                          disabled={!replyText.trim() || isLoading}
                          className="bg-brand hover:bg-brand/90 text-white"
                          onClick={() => handleSubmitReply(comment.id)}
                        >
                          {isLoading ? (
                            <div className="h-4 w-4 animate-spin border-2 border-transparent border-t-white rounded-full" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {comment.replies && comment.replies.length > 0 && (
                <div className="bg-neutral-50 dark:bg-neutral-700/50">
                  {comment.replies.map((reply) => (
                    <div 
                      key={reply.id} 
                      className="p-3 border-b last:border-b-0 border-neutral-100 dark:border-neutral-700/50"
                    >
                      <div className="flex gap-2">
                        <Avatar className="w-8 h-8 border">
                          {reply.user?.image ? (
                            <AvatarImage src={reply.user.image} alt={`${reply.user.first_name} ${reply.user.last_name}`} />
                          ) : (
                            <AvatarFallback className="bg-neutral-200 dark:bg-neutral-700">
                              {reply.user?.first_name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div className="flex flex-wrap gap-2 items-baseline">
                              <div className="font-medium text-sm dark:text-neutral-100">
                                {reply.user ? `${reply.user.first_name} ${reply.user.last_name}` : 'مستخدم غير معروف'}
                              </div>
                              <div className="text-xs text-neutral-500 dark:text-neutral-400">
                                {formatDistanceToNow(new Date(reply.created_at), { 
                                  addSuffix: true,
                                  locale: ar
                                })}
                              </div>
                            </div>
                            
                            {canModifyComment(reply.user?.id) && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-3 w-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleStartEditingReply(comment.id, reply)}>
                                    <Edit className="mr-2 h-3 w-3" />
                                    تعديل الرد
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="text-red-500 focus:text-red-500"
                                    onClick={() => onDeleteReply(comment.id, reply.id)}
                                  >
                                    <Trash className="mr-2 h-3 w-3" />
                                    حذف الرد
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>

                          {editingReply && editingReply.commentId === comment.id && editingReply.replyId === reply.id ? (
                            <div className="mt-2">
                              <Textarea
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                className="resize-none dark:bg-neutral-800 dark:border-neutral-700 min-h-[60px] text-sm"
                              />
                              <div className="flex justify-end gap-2 mt-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setEditingReply(null);
                                    setEditText('');
                                  }}
                                >
                                  إلغاء
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={handleSubmitEditReply}
                                >
                                  حفظ التعديل
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <p className="mt-1 text-sm text-neutral-700 dark:text-neutral-300">
                              {reply.content}
                            </p>
                          )}

                          <div className="flex items-center gap-4 mt-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-neutral-500 hover:text-red-500 px-1 text-xs flex items-center py-0 h-6"
                            >
                              <Heart className="h-3 w-3 ml-1" />
                              إعجاب
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
