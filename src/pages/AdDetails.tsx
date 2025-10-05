import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { 
  MapPin, Eye, MessageSquare, Phone, Heart, Share, Flag, 
  Star, Loader2, User,
  Clock
} from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { MobileNav } from '@/components/layout/mobile-nav';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdImageGallery } from '@/components/image-gallery/AdImageGallery';
import { CommentsList } from '@/components/comments/CommentsList';
import { AdDetailsSkeleton } from '@/components/ui/ad-details-skeleton';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { 
  useAd, 
  useRelatedAds, 
  useAddComment, 
  useIsFavorite, 
  useAddToFavorites, 
  useRemoveFromFavorites, 
  useAddReply,
  useDeleteComment,
  useEditComment,
  useDeleteReply,
  useEditReply
} from '@/hooks/use-api';
import { useAuth } from '@/context/auth-context';
import { toast } from '@/hooks/use-toast';
import { Comment } from '@/types';
import { RelatedAndSuggestedAds } from '@/components/ads/RelatedAndSuggestedAds';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { SimpleMessageDialog } from '@/components/messages/SimpleMessageDialog';
import { WhatsAppButton } from '@/components/messages/WhatsAppButton';
export default function AdDetails() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('comments');
  const [isFavorite, setIsFavorite] = useState(false);
  const [commandId, setCommandId] = useState(null);
  const [sendMessageDialogOpen, setSendMessageDialogOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();


  const handleSendMessage = () => {
    if (!isAuthenticated) {
      toast({
        title: "تسجيل الدخول مطلوب",
        description: "يجب عليك تسجيل الدخول لإرسال رسالة",
        variant: "destructive"
      });
      navigate('/auth/login', { state: { from: `/ad/${id}` } });
      return;
    }
    
    if (ad?.user?.id === user?.id) {
      toast({
        title: "لا يمكنك مراسلة نفسك",
        variant: "default"
      });
      return;
    }
    
    setSendMessageDialogOpen(true);
  };

  const { isAuthenticated, user } = useAuth();
  
  const numId = id ? parseInt(id, 10) : 0;
  
  // API hooks
  const { data: ad, isLoading, error } = useAd(numId);
  const { data: isFavoriteResponse } = useIsFavorite(numId);
  const { data: relatedAdsResponse } = useRelatedAds(numId);
  
  const addCommentMutation = useAddComment(numId);
  const addReplyMutation = useAddReply(numId, commandId);
  const deleteCommentMutation = useDeleteComment(numId);
  const editCommentMutation = useEditComment(numId);
  const deleteReplyMutation = useDeleteReply(numId);
  const editReplyMutation = useEditReply(numId);
  const addToFavorites = useAddToFavorites();
  const removeFromFavorites = useRemoveFromFavorites();
  
  useEffect(() => {
    if (isFavoriteResponse !== undefined) {
      setIsFavorite(isFavoriteResponse);
    }
  }, [isFavoriteResponse]);

  const handleFavoriteToggle = () => {
    if (!isAuthenticated) {
      toast({
        title: "تسجيل الدخول مطلوب",
        description: "يجب عليك تسجيل الدخول لإضافة للمفضلة",
        variant: "destructive"
      });
      navigate('/auth/login', { state: { from: `/ad/${id}` } });
      return;
    }
    
    if (isFavorite) {
      removeFromFavorites.mutate(numId);
    } else {
      addToFavorites.mutate(numId);
    }
    setIsFavorite(!isFavorite);
  };

  // Comment handlers
  const handleAddComment = (text: string) => {
    if (!isAuthenticated) {
      toast({
        title: "تسجيل الدخول مطلوب",
        description: "يجب عليك تسجيل الدخول لإضافة تعليق",
        variant: "destructive"
      });
      navigate('/auth/login', { state: { from: `/ad/${id}` } });
      return;
    }
    
    if (text.trim() && numId) {
      addCommentMutation.mutate(text);
    }
  };
  
  const handleAddReply = (commentId: number, text: string) => {
    setCommandId(commentId);
    if (!isAuthenticated) {
      toast({
        title: "تسجيل الدخول مطلوب",
        description: "يجب عليك تسجيل الدخول للرد على التعليق",
        variant: "destructive"
      });
      navigate('/auth/login', { state: { from: `/ad/${id}` } });
      return;
    }
    
    if (text.trim()) {
      addReplyMutation.mutate(text);
    }
  };
  
  const handleDeleteComment = (commentId: number) => {
    deleteCommentMutation.mutate(commentId);
  };

  const handleEditComment = (commentId: number, text: string) => {
    if (!isAuthenticated) {
      toast({
        title: "تسجيل الدخول مطلوب",
        description: "يجب عليك تسجيل الدخول ",
        variant: "destructive"
      });
      navigate('/auth/login', { state: { from: `/ad/${id}` } });
      return;
    }
    
    if (text.trim()) {
        editCommentMutation.mutate({ commentId, content: text });
    }
  };
  
  const handleDeleteReply = (commentId: number, replyId: number) => {
    deleteReplyMutation.mutate({ commentId, replyId });
  };
  
  const handleEditReply = (commentId: number, replyId: number, text: string) => {
    editReplyMutation.mutate({ commentId, replyId, content: text });
  };

  // Show loading skeleton while data is being fetched
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-white dark:bg-neutral-900">
        <Header />
        <main className="flex-1">
          <AdDetailsSkeleton />
        </main>
        <Footer />
        <MobileNav />
      </div>
    );
  }

  if (error || !ad) {
    return (
      <div className="min-h-screen flex flex-col bg-white dark:bg-neutral-900">
        <Header />
        <main className="flex-1 py-10">
          <div className="container mx-auto px-4">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-8 text-center">
              <h2 className="text-2xl font-bold text-red-800 dark:text-red-400 mb-4">عذراً، لم يتم العثور على هذا الإعلان</h2>
              <p className="mb-6 text-neutral-600 dark:text-neutral-300">قد يكون الإعلان تم حذفه أو انتهاء صلاحيته</p>
              <Button asChild className="dark:bg-neutral-800 dark:hover:bg-neutral-700">
                <Link to="/">العودة إلى الصفحة الرئيسية</Link>
              </Button>
            </div>
          </div>
        </main>
        <Footer />
        <MobileNav />
      </div>
    );
  }

  const timeAgo = formatDistanceToNow(new Date(ad.created_at), { 
    addSuffix: true,
    locale: ar
  });
  
  // Process images according to the new format
  const processImages = () => {
    const images: string[] = [];
    
    // Add main image if available
    if (ad.image && typeof ad.image === 'object' && ad.image.image_url) {
      images.push(ad.image.image_url);
    } else if (typeof ad.image === 'string' && ad.image) {
      images.push(ad.image);
    }
    
    // Add gallery images
    if (ad.images && Array.isArray(ad.images)) {
      ad.images.forEach(img => {
        if (typeof img === 'object' && img.url) {
          images.push(img.url);
        } else if (typeof img === 'string') {
          images.push(img);
        }
      });
    }
    
    return images;
  };

  // Get all images
  const allImages = processImages();
  
  // Prepare related ads - convert ListingDetails to Listing format if needed
  const relatedAds = ad.related || [];
  
  // Process comments
  const comments: Comment[] = ad.comments || [];

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-neutral-900 transition-colors">
      <Header />
      
      <main className="flex-1 pb-20 md:pb-0">
        <div className="container px-4 mx-auto py-6">
          <div className="text-sm mb-4 text-neutral-600 dark:text-neutral-400">
            <Link to="/" className="hover:text-black dark:hover:text-neutral-200">الرئيسية</Link>
            {' > '}
            <Link to={`/category/${ad.category_id}`} className="hover:text-black dark:hover:text-neutral-200">
              {ad.category_name || 'تصنيف'}
            </Link>
            {' > '}
            <span className="dark:text-neutral-300">{ad.title}</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Main content column */}
            <div className="md:col-span-2">
              {/* Title and price */}
              <div className="mb-6">
              <h1 className="text-xl md:text-2xl font-bold text-neutral-800 dark:text-white mb-2">{ad.title}</h1>
              <div className="flex items-center text-neutral-600 dark:text-neutral-400 text-sm gap-4">
                <div className="flex items-center gap-1"><Eye className="w-4 h-4" /> {ad.viewCount} مشاهدة</div>
                <div className="flex items-center gap-1"><MapPin className="w-4 h-4" /> <span className="truncate max-w-[80px]">{ad.city ?? "غير معروف"}</span></div>
                <div className="flex items-center gap-1"><Clock className="w-4 h-4" /> {timeAgo}</div>
              </div>
            </div>

            <div className="mb-6 text-neutral-800 dark:text-neutral-100 whitespace-pre-line leading-relaxed">
              {ad.description}
            </div>
              
              {/* Gallery */}
              <div className="mb-6">
                <AdImageGallery images={allImages} title={ad.title} />
              </div>
              
              <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
                <TabsList className="w-full bg-neutral-50 dark:bg-neutral-800">
                  <TabsTrigger 
                    value="details" 
                    className="flex-1 data-[state=active]:bg-white data-[state=active]:dark:bg-neutral-700 data-[state=active]:dark:text-neutral-100"
                  >
                    التفاصيل
                  </TabsTrigger>
                  <TabsTrigger 
                    value="comments" 
                    className="flex-1 data-[state=active]:bg-white data-[state=active]:dark:bg-neutral-700 data-[state=active]:dark:text-neutral-100"
                  >
                    التعليقات ({comments.length || 0})
                  </TabsTrigger>
                </TabsList>
                
                {/* Details tab */}
                <TabsContent value="details" className="pt-4">
                  <div className="bg-neutral-50 dark:bg-neutral-800 p-4 rounded-lg">
                    <h2 className="font-bold mb-2 dark:text-neutral-100">معلومات إضافية</h2>
                    <div className="grid grid-cols-2 gap-4 text-neutral-700 dark:text-neutral-300">
                      <div className="flex items-center">
                        <span className="text-neutral-500 dark:text-neutral-400 ml-2"> التصنيف : </span>
                        <span>{ad.category_name || "غير محدد"}</span>
                      </div>
                      {ad.sub_category_name && (
                        <div className="flex items-center">
                          <span className="text-neutral-500 dark:text-neutral-400 ml-2"> التصنيف الفرعي : </span>
                          <span>{ad.sub_category_name}</span>
                        </div>
                      )}
                      <div className="flex items-center">
                        <span className="text-neutral-500 dark:text-neutral-400 ml-2"> المنطقة : </span>
                        <span>{ad.city || ad.address || "غير محدد"}</span>
                      </div>
                      {ad.state && (
                        <div className="flex items-center">
                          <span className="text-neutral-500 dark:text-neutral-400 ml-2"> الحي : </span>
                          <span>{ad.state}</span>
                        </div>
                      )}
                      <div className="flex items-center">
                        <span className="text-neutral-500 dark:text-neutral-400 ml-2">نوع الإعلان  :  </span>
                        <span>
                          {ad.listing_type === 'sell' ? ' بيع' : 
                           ad.listing_type === 'buy' ? ' شراء' : 
                           ad.listing_type === 'exchange' ? ' تبادل' : ' خدمة'}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-neutral-500 dark:text-neutral-400 ml-2">تاريخ النشر : </span>
                        <span>{new Date(ad.created_at).toLocaleDateString('ar-SA')}</span>
                      </div>
                      {ad.condition && (
                        <div className="flex items-center">
                          <span className="text-neutral-500 dark:text-neutral-400 ml-2">الحالة : </span>
                          <span>{ad.condition === 'new' ? 'جديد' : 'مستعمل'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                {/* Comments tab */}
                <TabsContent value="comments" className="pt-4">
                  <CommentsList 
                    comments={comments}
                    onAddComment={handleAddComment}
                    onAddReply={handleAddReply}
                    onDeleteComment={handleDeleteComment}
                    onEditComment={handleEditComment}
                    onDeleteReply={handleDeleteReply}
                    onEditReply={handleEditReply}
                    isLoading={
                      addCommentMutation.isPending ||
                      addReplyMutation.isPending ||
                      deleteCommentMutation.isPending ||
                      editCommentMutation.isPending ||
                      deleteReplyMutation.isPending ||
                      editReplyMutation.isPending
                    }
                  />
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="md:col-span-1">
              {/* Seller info */}
              <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden mb-6 bg-white dark:bg-neutral-800">
                <div className="p-4 bg-neutral-50 dark:bg-neutral-700 border-b border-neutral-200 dark:border-neutral-700">
                  <h2 className="font-bold text-lg dark:text-neutral-100">معلومات المعلن</h2>
                </div>
                <div className="p-4">
                  {ad.user && (
                    <div className="flex items-center mb-4">
                      <Avatar className="w-12 h-12 ml-3 border">
                        {ad.user.image ? (
                          <AvatarImage src={ad.user.image} alt={`${ad.user.first_name} ${ad.user.last_name}`} />
                        ) : (
                          <AvatarFallback className="bg-neutral-200 dark:bg-neutral-700">
                            <User className="h-6 w-6 text-neutral-500" />
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <div className="font-bold dark:text-neutral-100">{`${ad.user.first_name} ${ad.user.last_name}`}</div>
                        <div className="text-sm text-neutral-500 dark:text-neutral-400">
                          عضو منذ {new Date(ad.user.created_at || '').toLocaleDateString('ar-SA')}
                        </div>
                      </div>
                      {ad.user.verified && (
                        <div className="mr-auto">
                          <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs px-2 py-1 rounded-full flex items-center">
                            <Star className="h-3 w-3 ml-1 fill-green-700 dark:fill-green-400" />
                            موثق
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="space-y-3">
                    {ad.user?.phone && !ad.phone_hidden && (
                      <Button className="w-full flex items-center justify-center bg-brand hover:bg-brand/90 text-white" size="lg">
                        <Phone className="ml-2 h-5 w-5" />
                        {ad.user.phone}
                      </Button>
                    )}
                    
                    {/* أزرار المراسلة والواتساب */}
                    <div className="grid grid-cols-1 gap-3">
                      <Button 
                        variant="outline" 
                        className="w-full bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 hover:bg-primary/20 text-primary hover:text-primary/80 transition-all duration-300" 
                        size="lg"
                        onClick={handleSendMessage}
                        disabled={!ad.user || ad.user.id === user?.id}
                      >
                        <MessageSquare className="ml-2 h-5 w-5" />
                        إرسال رسالة
                      </Button>
                      
                      {ad.user?.phone && (
                        <Button 
                          className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-none shadow-lg hover:shadow-xl transition-all duration-300" 
                          size="lg"
                          onClick={() => {
                            if (!ad?.user?.phone) {
                              toast({
                                title: "رقم الهاتف غير متوفر",
                                description: "لا يمكن الوصول لرقم هاتف صاحب الإعلان",
                                variant: "destructive"
                              });
                              return;
                            }
                            
                            const message = encodeURIComponent(`مرحباً، أنا مهتم بالإعلان: "${ad.title}"`);
                            const phoneNumber = ad.user.phone.replace(/\D/g, '');
                            const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
                            window.open(whatsappUrl, '_blank');
                          }}
                        >
                          <svg className="ml-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.785"/>
                          </svg>
                          واتساب
                        </Button>
                      )}
                    </div>
                    <Button 
                      variant="ghost" 
                      className={`w-full border dark:border-neutral-700 ${
                        isFavorite 
                          ? 'text-red-500 dark:text-red-400 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20' 
                          : 'dark:text-neutral-300 dark:hover:bg-neutral-700'
                      }`} 
                      size="lg"
                      onClick={handleFavoriteToggle}
                    >
                      <Heart className={`ml-2 h-5 w-5 ${isFavorite ? 'fill-red-500 dark:fill-red-400' : ''}`} />
                      {isFavorite ? 'تمت الإضافة للمفضلة' : 'أضف للمفضلة'}
                    </Button>
                    <div className="flex justify-between pt-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="dark:text-neutral-300 dark:hover:bg-neutral-700"
                      >
                        <Share className="ml-1 h-4 w-4" />
                        مشاركة
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-500 dark:text-red-400 dark:hover:bg-red-900/20"
                        onClick={() => {
                          if (!isAuthenticated) {
                            toast({
                              title: "تسجيل الدخول مطلوب",
                              description: "يجب عليك تسجيل الدخول للإبلاغ عن الإعلان",
                              variant: "destructive"
                            });
                            navigate('/auth/login', { state: { from: `/ad/${id}` } });
                            return;
                          }
                          toast({
                            title: "تم الإبلاغ",
                            description: "شكراً لإبلاغك عن هذا الإعلان، سيتم مراجعته قريباً",
                          });
                        }}
                      >
                        <Flag className="ml-1 h-4 w-4" />
                        إبلاغ
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Safety tips */}
              <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden mb-6 bg-white dark:bg-neutral-800">
                <div className="p-4 bg-neutral-50 dark:bg-neutral-700 border-b border-neutral-200 dark:border-neutral-700">
                  <h2 className="font-bold dark:text-neutral-100">نصائح للسلامة</h2>
                </div>
                <div className="p-4">
                  <ul className="text-sm space-y-2 list-disc pr-5 text-neutral-700 dark:text-neutral-300">
                    <li>تأكد من مقابلة البائع في مكان عام</li>
                    <li>تحقق من المنتج قبل شرائه</li>
                    <li>استخدم طرق دفع آمنة</li>
                    <li>لا ترسل أموالاً مقدماً</li>
                    <li>كن حذراً من العروض المغرية جداً</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          {/* Related ads carousel */}
           <RelatedAndSuggestedAds
              categoryId={ad.category_id} 
              excludeId={ad.id}
            />
        </div>
      </main>
      
      <Footer />
      <MobileNav />
      
      {/* Dialog للرسائل */}
      <SimpleMessageDialog 
        open={sendMessageDialogOpen}
        onOpenChange={setSendMessageDialogOpen}
        listing={{
          id: ad?.id || 0,
          title: ad?.title || '',
          user: ad?.user
        }}
      />
    </div>
  );
}
